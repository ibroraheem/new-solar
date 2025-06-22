import { PvgisData, Appliance, SolarComponents, TimeSlot } from '../types';
import { VALIDATION_CONSTANTS, SYSTEM_CONSTANTS } from './constants';
import { 
  INVERTER_PRICING, 
  BATTERY_PRICING, 
  SOLAR_PANEL_PRICING, 
  CABLE_PRICING, 
  BREAKER_PRICING,
  getInverterByWatts,
  getBatteryByCapacity,
  getBatteryByCapacityAndVoltage,
  getBreakerByRating,
  getAvailableDcBreakerRatings,
  formatPrice
} from '../data/pricing';

// Constants for validation
const MAX_SYSTEM_SIZE_KWP = VALIDATION_CONSTANTS.MAX_SYSTEM_SIZE_KWP;
const MIN_DAILY_ENERGY = VALIDATION_CONSTANTS.MIN_DAILY_ENERGY;
const MAX_DAILY_ENERGY = VALIDATION_CONSTANTS.MAX_DAILY_ENERGY;
const MIN_BACKUP_HOURS = VALIDATION_CONSTANTS.MIN_BACKUP_HOURS;
const MAX_BACKUP_HOURS = VALIDATION_CONSTANTS.MAX_BACKUP_HOURS;
const EFFICIENCY_FACTOR = VALIDATION_CONSTANTS.EFFICIENCY_FACTOR;

// Available panel sizes for system capacity matching
const PANEL_SIZES = [
  { watts: 400, maxSystemKw: 2.4 },
  { watts: 550, maxSystemKw: 6 },
  { watts: 600, maxSystemKw: 10.2 }
];

// DC Breaker ratings available in pricing database
const AVAILABLE_DC_BREAKER_RATINGS = getAvailableDcBreakerRatings();

// Input validation
function validateInputs(backupHours: number): void {
  if (backupHours < MIN_BACKUP_HOURS || backupHours > MAX_BACKUP_HOURS) {
    throw new Error(`Backup hours must be between ${MIN_BACKUP_HOURS} and ${MAX_BACKUP_HOURS} hours`);
  }
}

// Calculate total energy demand for a specific time period
export function calculateEnergyDemand(
  appliances: Appliance[],
  timeFilter?: (slot: TimeSlot) => boolean
): number {
  return appliances
    .filter(a => a.isSelected)
    .reduce((total, appliance) => {
      const relevantSlots = timeFilter 
        ? appliance.timeSlots.filter(timeFilter)
        : appliance.timeSlots;
      
      const hoursPerDay = relevantSlots
        .filter(slot => slot.selected)
        .reduce((hours, slot) => {
          if (slot.durationMinutes) {
            // Convert minutes to hours
            return hours + (slot.durationMinutes / 60);
          }
          
          const slotHours = slot.end > slot.start 
            ? slot.end - slot.start 
            : (24 - slot.start) + slot.end;
          return hours + slotHours;
        }, 0);
      
      return total + (appliance.watts * appliance.quantity * hoursPerDay) / 1000;
    }, 0);
}

// Calculate critical load demand
export function calculateCriticalLoad(appliances: Appliance[]): number {
  return calculateEnergyDemand(
    appliances.filter(a => a.isCritical)
  );
}

// Calculate night-time load demand
export function calculateNightLoad(appliances: Appliance[]): number {
  return calculateEnergyDemand(
    appliances,
    slot => slot.name === 'night'
  );
}

// Updated function to use worst E_d from worst E_m month
export function calculateWorstMonthPvout(pvgisData: PvgisData | null): number {
  if (!pvgisData?.monthly?.length) return 3.3; // Default fallback value
  
  // Find the month with lowest monthly energy (E_m)
  const worstMonth = pvgisData.monthly.reduce((worst, month) => 
    month.pvout < worst.pvout ? month : worst
  );
  
  // Use the E_d value from the worst month (daily energy for 1kWp)
  // If eday is available, use it; otherwise fall back to pvout/30
  return worstMonth.eday || (worstMonth.pvout / 30);
}

// Calculate maximum simultaneous load from appliances using diversity factors
export function calculateMaxLoad(appliances: Appliance[]): number {
  const selectedAppliances = appliances.filter(a => a.isSelected);
  
  if (selectedAppliances.length === 0) return 0;
  
  // CORRECT: Use diversity factors for realistic maximum load calculation
  // Large appliances (refrigerator, AC, etc.) have lower diversity factors
  // Small appliances (lights, TV, etc.) have higher diversity factors
  const largeAppliances = selectedAppliances.filter(app => app.watts >= 1000);
  const smallAppliances = selectedAppliances.filter(app => app.watts < 1000);
  
  // Large appliances: 70% diversity factor (not all run simultaneously)
  const largeApplianceLoad = largeAppliances.reduce((total, appliance) => {
    return total + (appliance.watts * appliance.quantity);
  }, 0) * 0.7;
  
  // Small appliances: 50% diversity factor (not all run simultaneously)
  const smallApplianceLoad = smallAppliances.reduce((total, appliance) => {
    return total + (appliance.watts * appliance.quantity);
  }, 0) * 0.5;
  
  // Add base load (always running appliances like refrigerator)
  const baseLoad = largeAppliances
    .filter(app => app.name.toLowerCase().includes('refrigerator') || 
                   app.name.toLowerCase().includes('freezer'))
    .reduce((total, appliance) => total + (appliance.watts * appliance.quantity), 0);
  
  const totalMaxLoad = largeApplianceLoad + smallApplianceLoad + baseLoad;
  
  // Ensure minimum load for system stability
  return Math.max(totalMaxLoad, 500); // Minimum 500W for system stability
}

function selectInverter(
  dailyEnergyDemand: number,
  maxLoad: number,
  requiredPanelWatts: number
): {
  watts: number;
  voltage: number;
  mppt: number;
  maxPvInput: number;
  price: number;
  name: string;
} {
  // Calculate peak power needed - use the higher of max load or calculated peak
  const peakHoursPerDay = 5; // Typical peak usage hours
  const calculatedPeakPower = (dailyEnergyDemand / peakHoursPerDay) * 1000;
  const actualMaxLoad = maxLoad;
  
  // Use the higher value to ensure inverter can handle both scenarios
  const peakPowerNeeded = Math.max(calculatedPeakPower, actualMaxLoad);

  // Use pricing database to find suitable inverter
  const inverter = getInverterByWatts(peakPowerNeeded);

  if (!inverter) {
    throw new Error(`No suitable inverter found for ${peakPowerNeeded.toFixed(0)}W peak power requirement (Max Load: ${actualMaxLoad}W, Calculated Peak: ${calculatedPeakPower.toFixed(0)}W)`);
  }

  // Convert KVA to watts
  const kva = parseFloat(inverter.capacity.replace('KVA', ''));
  const watts = kva * 1000;
  
  // CORRECT: Assign voltage based on real inverter specifications
  // Small systems (≤2KVA): 12V, Medium systems (≤4.2KVA): 24V, Large systems (>4.2KVA): 48V
  // This follows standard solar inverter voltage conventions
  let voltage: number;
  if (kva <= 2) {
    voltage = 12; // 12V for small residential systems
  } else if (kva <= 4.2) {
    voltage = 24; // 24V for medium residential systems
  } else {
    voltage = 48; // 48V for larger residential/commercial systems
  }
  
  // CORRECT: MPPT current ratings based on voltage and typical inverter specs
  let mppt: number;
  if (voltage === 12) {
    mppt = 80; // 80A for 12V systems
  } else if (voltage === 24) {
    mppt = 100; // 100A for 24V systems
  } else {
    mppt = 120; // 120A for 48V systems
  }
  
  // CORRECT: Max PV input typically 1.2-1.5x inverter capacity for proper oversizing
  const maxPvInput = watts * 1.3; // 30% oversizing allowance

  return {
    watts,
    voltage,
    mppt,
    maxPvInput,
    price: inverter.price,
    name: inverter.name
  };
}

function selectBattery(
  dailyEnergyDemand: number,
  systemVoltage: number,
  backupHours: number
): {
  type: string;
  capacityAh: number;
  series: number;
  parallel: number;
  totalBatteries: number;
  price: number;
  name: string;
} {
  // Calculate hourly demand and add buffer for efficiency losses
  const hourlyDemand = dailyEnergyDemand / 24; // Convert daily to hourly
  const energyNeeded = (hourlyDemand * backupHours * SYSTEM_CONSTANTS.PEAK_POWER_MARGIN) / EFFICIENCY_FACTOR;

  // CORRECT: First try to find batteries that match the exact system voltage
  const exactVoltageBatteries = BATTERY_PRICING.filter(bat => {
    const batVoltage = parseInt(bat.voltage?.replace('V', '') || '0');
    return batVoltage === systemVoltage;
  });

  // If exact voltage batteries found, use them (no series configuration needed)
  if (exactVoltageBatteries.length > 0) {
    let bestConfig = {
      battery: exactVoltageBatteries[0],
      series: 1, // No series needed for exact voltage match
      parallel: 1,
      totalBatteries: 1,
      totalPrice: exactVoltageBatteries[0].price,
      totalCapacity: parseFloat(exactVoltageBatteries[0].capacity.replace('KWH', ''))
    };

    // Find the best exact voltage battery configuration
    for (const battery of exactVoltageBatteries) {
      const batteryKwh = parseFloat(battery.capacity.replace('KWH', ''));
      
      // Calculate parallel needed to achieve required capacity
      const parallel = Math.ceil(energyNeeded / batteryKwh);
      
      const totalBatteries = parallel; // No series, only parallel
      const totalPrice = battery.price * totalBatteries;
      const totalCapacity = batteryKwh * parallel;

      // Check if this configuration meets requirements and is better than current best
      // Prioritize parallel configurations when they're more cost-effective
      if (totalCapacity >= energyNeeded && totalBatteries <= 8 && // Limit to 8 batteries max
          (totalPrice < bestConfig.totalPrice || 
           (totalPrice === bestConfig.totalPrice && parallel > bestConfig.parallel) || // Prefer more parallel connections
           bestConfig.totalCapacity < energyNeeded)) {
        bestConfig = {
          battery,
          series: 1,
          parallel,
          totalBatteries,
          totalPrice,
          totalCapacity
        };
      }
    }

    if (bestConfig.totalCapacity >= energyNeeded) {
      // Calculate total system capacity in Ah (CORRECT: Total system capacity)
      const totalSystemCapacityAh = (bestConfig.totalCapacity * 1000) / systemVoltage;

      return {
        type: bestConfig.battery.name.includes('Tubular') ? 'Tubular' : 'Lithium',
        capacityAh: Math.round(totalSystemCapacityAh),
        series: bestConfig.series,
        parallel: bestConfig.parallel,
        totalBatteries: bestConfig.totalBatteries,
        price: bestConfig.totalPrice,
        name: bestConfig.battery.name
      };
    }
  }

  // If no exact voltage batteries or they don't meet requirements, try series configuration
  const availableBatteries = BATTERY_PRICING.filter(bat => {
    const batVoltage = parseInt(bat.voltage?.replace('V', '') || '0');
    // Check if battery voltage can be configured to match system voltage
    return systemVoltage % batVoltage === 0; // System voltage must be divisible by battery voltage
  });

  if (availableBatteries.length === 0) {
    throw new Error(`No batteries found that can be configured for ${systemVoltage}V system`);
  }

  // Find the best battery configuration (series + parallel)
  let bestConfig = {
    battery: availableBatteries[0],
    series: 1,
    parallel: 1,
    totalBatteries: 1,
    totalPrice: availableBatteries[0].price,
    totalCapacity: parseFloat(availableBatteries[0].capacity.replace('KWH', ''))
  };

  // Try different battery configurations to find the most cost-effective solution
  for (const battery of availableBatteries) {
    const batteryKwh = parseFloat(battery.capacity.replace('KWH', ''));
    const batteryVoltage = parseInt(battery.voltage?.replace('V', '') || '0');
    
    // Calculate series needed to achieve system voltage
    const series = systemVoltage / batteryVoltage; // CORRECT: Direct division
    
    // Calculate parallel needed to achieve required capacity
    const parallel = Math.ceil(energyNeeded / (batteryKwh * series));
    
    const totalBatteries = series * parallel;
    const totalPrice = battery.price * totalBatteries;
    const totalCapacity = batteryKwh * series * parallel;

    // Check if this configuration meets requirements and is better than current best
    if (totalCapacity >= energyNeeded && totalBatteries <= 8 && // Limit to 8 batteries max
        (totalPrice < bestConfig.totalPrice || 
         (totalPrice === bestConfig.totalPrice && parallel > bestConfig.parallel) || // Prefer more parallel connections
         bestConfig.totalCapacity < energyNeeded)) {
      bestConfig = {
        battery,
        series,
        parallel,
        totalBatteries,
        totalPrice,
        totalCapacity
      };
    }
  }

  // If still no configuration meets requirements, try parallel-only with exact voltage batteries
  if (bestConfig.totalCapacity < energyNeeded && exactVoltageBatteries.length > 0) {
    console.warn(`Exact voltage batteries don't meet capacity requirement (${energyNeeded.toFixed(1)}kWh needed). Using parallel configuration.`);
    
    // Find the best parallel configuration with exact voltage batteries
    for (const battery of exactVoltageBatteries) {
      const batteryKwh = parseFloat(battery.capacity.replace('KWH', ''));
      
      // Calculate parallel needed to achieve required capacity
      const parallel = Math.ceil(energyNeeded / batteryKwh);
      
      const totalBatteries = parallel; // No series, only parallel
      const totalPrice = battery.price * totalBatteries;
      const totalCapacity = batteryKwh * parallel;

      // Check if this configuration is better than current best (even if it doesn't meet full requirement)
      if (totalBatteries <= 8 && // Limit to 8 batteries max
          (totalPrice < bestConfig.totalPrice || bestConfig.totalCapacity < energyNeeded)) {
        bestConfig = {
          battery,
          series: 1,
          parallel,
          totalBatteries,
          totalPrice,
          totalCapacity
        };
      }
    }
  }

  if (bestConfig.totalCapacity < energyNeeded) {
    throw new Error(`Cannot meet ${energyNeeded.toFixed(1)}kWh requirement with available batteries. Maximum available: ${bestConfig.totalCapacity.toFixed(1)}kWh`);
  }

  // Calculate total system capacity in Ah (CORRECT: Total system capacity)
  const totalSystemCapacityAh = (bestConfig.totalCapacity * 1000) / systemVoltage;

  return {
    type: bestConfig.battery.name.includes('Tubular') ? 'Tubular' : 'Lithium',
    capacityAh: Math.round(totalSystemCapacityAh), // CORRECT: Total system capacity
    series: bestConfig.series,
    parallel: bestConfig.parallel,
    totalBatteries: bestConfig.totalBatteries,
    price: bestConfig.totalPrice,
    name: bestConfig.battery.name
  };
}

function selectPanels(requiredKwp: number): {
  wattage: number;
  count: number;
  totalWattage: number;
  price: number;
  name: string;
} {
  // Select panel size based on system capacity
  const panelSize = PANEL_SIZES.find(p => requiredKwp <= p.maxSystemKw) || PANEL_SIZES[PANEL_SIZES.length - 1];
  
  // Find panel in pricing database
  const panel = SOLAR_PANEL_PRICING.find(p => p.capacity === `${panelSize.watts}W`);
  
  if (!panel) {
    throw new Error(`No pricing found for ${panelSize.watts}W panel`);
  }
  
  // Calculate number of panels needed
  const panelCount = Math.ceil((requiredKwp * 1000) / panelSize.watts);
  
  return {
    wattage: panelSize.watts,
    count: panelCount,
    totalWattage: panelSize.watts * panelCount,
    price: panel.price * panelCount,
    name: panel.name
  };
}

// Function to calculate DC breaker rating for 500VDC systems
function calculateDcBreakerRating(maxDcCurrent: number): number {
  // Find the next available breaker rating that can handle the current
  const breaker = AVAILABLE_DC_BREAKER_RATINGS.find(rating => rating >= maxDcCurrent);
  return breaker || AVAILABLE_DC_BREAKER_RATINGS[AVAILABLE_DC_BREAKER_RATINGS.length - 1];
}

export function calculateSolarComponents(
  appliances: Appliance[],
  backupHours: number,
  worstMonthPvout: number
): SolarComponents {
  try {
    // Validate inputs
    validateInputs(backupHours);

    // Calculate daily energy demand from appliance load profile
    const dailyEnergyDemand = calculateEnergyDemand(appliances);
    
    // Validate calculated energy demand
    if (dailyEnergyDemand < MIN_DAILY_ENERGY || dailyEnergyDemand > MAX_DAILY_ENERGY) {
      throw new Error(`Calculated daily energy demand (${dailyEnergyDemand.toFixed(1)}kWh) is outside the supported range of ${MIN_DAILY_ENERGY}-${MAX_DAILY_ENERGY} kWh. Please adjust your appliance selection.`);
    }

    const requiredKwp = dailyEnergyDemand / (worstMonthPvout * SYSTEM_CONSTANTS.SOLAR_EFFICIENCY);
    const requiredPanelWatts = requiredKwp * 1000;

    // Check system size limit and throw error if exceeded
    if (requiredPanelWatts > MAX_SYSTEM_SIZE_KWP * 1000) {
      throw new Error(
        `System design (${(requiredPanelWatts/1000).toFixed(1)}kWp) exceeds the maximum supported limit of ${MAX_SYSTEM_SIZE_KWP}kWp. ` +
        'Please reduce your energy consumption or contact support for custom solutions.'
      );
    }

    // Select components using pricing database
    const maxLoad = calculateMaxLoad(appliances);
    const inverter = selectInverter(dailyEnergyDemand, maxLoad, requiredPanelWatts);
    const systemVoltage = inverter.voltage;
    const battery = selectBattery(dailyEnergyDemand, systemVoltage, backupHours);
    const panels = selectPanels(requiredKwp);

    // Calculate cable requirements using pricing database
    // CORRECT: Calculate actual DC current from panels with proper voltage
    const panelVoltage = 24; // Typical panel voltage (Vmp) - should be configurable
    const maxDcCurrent = (panels.totalWattage / panelVoltage) * SYSTEM_CONSTANTS.DC_SAFETY_MARGIN;
    
    // CORRECT: Cable sizing based on current carrying capacity and voltage drop
    // Consider voltage drop: 3% maximum for DC circuits
    const maxVoltageDrop = panelVoltage * 0.03; // 3% voltage drop
    const cableLength = 20; // Estimated cable length in meters
    
    // Calculate minimum cable size based on current and voltage drop
    let cableSize: string;
    if (maxDcCurrent <= 20) {
      cableSize = '6mm²'; // Good for up to 20A with low voltage drop
    } else if (maxDcCurrent <= 32) {
      cableSize = '10mm²'; // Good for up to 32A
    } else if (maxDcCurrent <= 50) {
      cableSize = '16mm²'; // Good for up to 50A
    } else if (maxDcCurrent <= 80) {
      cableSize = '25mm²'; // Good for up to 80A
    } else {
      cableSize = '35mm²'; // For very high current systems
    }

    const cable = CABLE_PRICING.find(c => c.capacity === cableSize);
    if (!cable) {
      throw new Error(`No pricing found for ${cableSize} cable`);
    }
    const cablePrice = cable.price * cableLength;

    // Calculate breaker requirements using pricing database
    // CORRECT: DC breaker sizing with proper safety margins
    const dcBreakerRating = calculateDcBreakerRating(maxDcCurrent);
    let dcBreaker = getBreakerByRating(`${dcBreakerRating}A`, '500VDC');
    
    // CORRECT: AC breaker sizing based on inverter output current
    const acOutputCurrent = (inverter.watts / SYSTEM_CONSTANTS.AC_VOLTAGE) * SYSTEM_CONSTANTS.AC_SAFETY_MARGIN;
    const acBreakerRating = acOutputCurrent <= 16 ? '16A' : acOutputCurrent <= 32 ? '32A' : '63A';
    let acBreaker = getBreakerByRating(acBreakerRating, '230VAC');
    
    // If exact breakers not found, use fallback options
    if (!dcBreaker) {
      console.warn(`DC breaker ${dcBreakerRating}A not found, using 63A as fallback`);
      const fallbackDcBreaker = getBreakerByRating('63A', '500VDC');
      if (!fallbackDcBreaker) {
        throw new Error('No suitable DC breakers found in pricing database');
      }
      dcBreaker = fallbackDcBreaker;
    }
    
    if (!acBreaker) {
      console.warn(`AC breaker ${acBreakerRating} not found, using 32A as fallback`);
      const fallbackAcBreaker = getBreakerByRating('32A', '230VAC');
      if (!fallbackAcBreaker) {
        throw new Error('No suitable AC breakers found in pricing database');
      }
      acBreaker = fallbackAcBreaker;
    }
    
    const totalBreakerPrice = dcBreaker.price + acBreaker.price;

    // Calculate total system cost
    const totalSystemCost = inverter.price + battery.price + panels.price + cablePrice + totalBreakerPrice;

    return {
      systemSize: {
        kwp: panels.totalWattage / 1000,
        watts: panels.totalWattage,
        panels: panels.count,
        panelWatts: panels.wattage
      },
      inverter: {
        watts: inverter.watts,
        voltage: inverter.voltage,
        mppt: inverter.mppt,
        maxPvInput: inverter.maxPvInput,
        price: inverter.price,
        name: inverter.name
      },
      batteryConfiguration: {
        type: battery.type,
        capacityAh: battery.capacityAh,
        series: battery.series,
        parallel: battery.parallel,
        totalBatteries: battery.totalBatteries,
        price: battery.price,
        name: battery.name
      },
      systemVoltage: systemVoltage,
      cables: {
        size: cableSize,
        length: cableLength,
        price: cablePrice,
        name: cable.name
      },
      breakers: {
        dc: {
          size: `${dcBreakerRating}A-DC`,
          current: dcBreakerRating,
          voltage: dcBreaker.voltage,
          price: dcBreaker.price,
          name: dcBreaker.name
        },
        ac: {
          size: `${acBreaker.capacity}-AC`,
          current: parseInt(acBreaker.capacity),
          voltage: acBreaker.voltage,
          price: acBreaker.price,
          name: acBreaker.name
        }
      },
      solarPanels: {
        watts: panels.wattage,
        quantity: panels.count,
        price: panels.price,
        name: panels.name
      },
      totalCost: totalSystemCost,
      costBreakdown: {
        inverter: inverter.price,
        battery: battery.price,
        panels: panels.price,
        cables: cablePrice,
        breakers: totalBreakerPrice
      }
    };
  } catch (error) {
    console.error('Error calculating solar components:', error);
    throw error;
  }
}

export type NigerianRegion = 'north' | 'middle' | 'south';

export const getNigerianRegion = (latitude: number): NigerianRegion => {
  if (latitude >= 10) return 'north';
  if (latitude >= 7) return 'middle';
  return 'south';
};