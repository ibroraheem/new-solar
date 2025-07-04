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
  name: string;
} {
  // Calculate peak power needed - use the higher of max load or calculated peak
  const peakHoursPerDay = 5; // Typical peak usage hours
  const calculatedPeakPower = (dailyEnergyDemand / peakHoursPerDay) * 1000;
  const actualMaxLoad = maxLoad;
  
  // Use the higher value to ensure inverter can handle both scenarios
  const peakPowerNeeded = Math.max(calculatedPeakPower, actualMaxLoad);

  // Start with inverter based on load requirements
  let inverter = getInverterByWatts(peakPowerNeeded);
  
  if (!inverter) {
    throw new Error(`No suitable inverter found for ${peakPowerNeeded.toFixed(0)}W peak power requirement`);
  }

  // Check if we need to upsize inverter for PV requirements
  let inverterKva = parseFloat(inverter.capacity.replace('KVA', ''));
  let inverterWatts = inverterKva * 1000;
  
  // If required PV exceeds 120% of current inverter, find a larger one
  // But don't go more than 2x the original size to avoid over-sizing
  const originalInverter = inverter;
  const maxAllowedOversize = 2.0;
  const originalKva = inverterKva;
  
  while (requiredPanelWatts > inverterWatts * 1.2) {
    // Find next bigger inverter
    const nextKva = inverterKva + 0.5; // Step up by 0.5KVA increments
    const nextInverter = INVERTER_PRICING.find(inv => {
      const invKva = parseFloat(inv.capacity.replace('KVA', ''));
      return invKva >= nextKva;
    });
    
    if (nextInverter) {
      const nextKvaValue = parseFloat(nextInverter.capacity.replace('KVA', ''));
      
      // Stop if next inverter is more than 2x the original size
      if (nextKvaValue > originalKva * maxAllowedOversize) {
        console.warn(`Inverter up-sizing limited to ${maxAllowedOversize}x original size to prevent over-sizing`);
        break;
      }
      
      inverter = nextInverter;
      inverterKva = nextKvaValue;
      inverterWatts = inverterKva * 1000;
    } else {
      // No larger inverter available
      break;
    }
  }

  // Convert KVA to watts
  const kva = parseFloat(inverter.capacity.replace('KVA', ''));
  const watts = kva * 1000;
  
  // CORRECT: Assign voltage based on real inverter specifications
  let voltage: number;
  if (kva <= 2) {
    voltage = 12;
  } else if (kva <= 4.2) {
    voltage = 24;
  } else {
    voltage = 48;
  }
  
  let mppt: number;
  if (voltage === 12) {
    mppt = 80;
  } else if (voltage === 24) {
    mppt = 100;
  } else {
    mppt = 120;
  }
  
  const maxPvInput = watts * 1.2;

  return {
    watts,
    voltage,
    mppt,
    maxPvInput,
    name: inverter.name
  };
}

function selectBattery(
  dailyEnergyDemand: number,
  systemVoltage: number,
  backupHours: number,
  inverterWatts: number
): {
  type: string;
  capacityAh: number;
  series: number;
  parallel: number;
  totalBatteries: number;
  name: string;
} {
  // Calculate energy needed for backup period (not hourly average)
  // Use the actual daily energy demand for the backup period
  const energyNeeded = (dailyEnergyDemand * backupHours / 24) / EFFICIENCY_FACTOR;

  // Calculate minimum battery capacity based on C-rate requirements
  // Standard C-rate for deep cycle batteries: 0.1C to 0.2C
  const cRate = 0.15; // 15% of capacity per hour (conservative)
  const minCapacityAh = (inverterWatts / systemVoltage) / cRate;
  
  // Calculate capacity needed for runtime
  const runtimeCapacityAh = (energyNeeded * 1000) / systemVoltage;
  
  // Use the higher of the two requirements
  const requiredCapacityAh = Math.max(minCapacityAh, runtimeCapacityAh);

  // Prefer lithium batteries first
  const lithiumBatteries = BATTERY_PRICING.filter(bat => bat.name.toLowerCase().includes('lithium'));
  const tubularBatteries = BATTERY_PRICING.filter(bat => bat.name.toLowerCase().includes('tubular'));

  function findBestConfig(batteries: typeof BATTERY_PRICING) {
    let bestConfig = null;
    let bestBatteryCount = Infinity;
    let bestEfficiency = Infinity;

    // Try to find best config for given battery type
    const exactVoltageBatteries = batteries.filter(bat => {
      const batVoltage = parseInt(bat.voltage?.replace('V', '') || '0');
      return batVoltage === systemVoltage;
    });

    // Check exact voltage matches first - prioritize single battery
    for (const battery of exactVoltageBatteries) {
      const batteryKwh = parseFloat(battery.capacity.replace('KWH', ''));
      const batteryCapacityAh = (batteryKwh * 1000) / systemVoltage;
      
      // Try single battery first
      if (batteryCapacityAh >= requiredCapacityAh) {
        const efficiency = batteryCapacityAh / requiredCapacityAh;
        if (!bestConfig || batteryCapacityAh < bestConfig.totalCapacityAh) {
          bestConfig = {
            battery,
            series: 1,
            parallel: 1,
            totalBatteries: 1,
            totalCapacity: batteryKwh,
            totalCapacityAh: batteryCapacityAh
          };
          bestBatteryCount = 1;
          bestEfficiency = efficiency;
        }
      }
      
      // If single battery doesn't work, try parallel (but only if we haven't found a single battery solution)
      if (!bestConfig || bestBatteryCount > 1) {
        const parallel = Math.ceil(requiredCapacityAh / batteryCapacityAh);
        const totalBatteries = parallel;
        const totalCapacity = batteryKwh * parallel;
        const totalCapacityAh = batteryCapacityAh * parallel;
        
        if (totalCapacityAh >= requiredCapacityAh && totalBatteries <= 8) {
          const efficiency = totalCapacityAh / requiredCapacityAh;
          if (!bestConfig || totalBatteries < bestBatteryCount || 
              (totalBatteries === bestBatteryCount && efficiency < bestEfficiency)) {
            bestConfig = {
              battery,
              series: 1,
              parallel,
              totalBatteries,
              totalCapacity,
              totalCapacityAh
            };
            bestBatteryCount = totalBatteries;
            bestEfficiency = efficiency;
          }
        }
      }
    }

    // If no exact voltage match, try series configuration
    if (!bestConfig) {
      const availableBatteries = batteries.filter(bat => {
        const batVoltage = parseInt(bat.voltage?.replace('V', '') || '0');
        return batVoltage > 0 && systemVoltage % batVoltage === 0;
      });

      for (const battery of availableBatteries) {
        const batteryKwh = parseFloat(battery.capacity.replace('KWH', ''));
        const batteryVoltage = parseInt(battery.voltage?.replace('V', '') || '0');
        const batteryCapacityAh = (batteryKwh * 1000) / batteryVoltage;
        const series = systemVoltage / batteryVoltage;
        
        // Try single series string first
        if (batteryCapacityAh * series >= requiredCapacityAh) {
          const efficiency = (batteryCapacityAh * series) / requiredCapacityAh;
          if (!bestConfig || series < bestBatteryCount || 
              (series === bestBatteryCount && efficiency < bestEfficiency)) {
            bestConfig = {
              battery,
              series,
              parallel: 1,
              totalBatteries: series,
              totalCapacity: batteryKwh * series,
              totalCapacityAh: batteryCapacityAh * series
            };
            bestBatteryCount = series;
            bestEfficiency = efficiency;
          }
        }
        
        // If single series doesn't work, try series-parallel
        if (!bestConfig || bestBatteryCount > series) {
          const parallel = Math.ceil(requiredCapacityAh / (batteryCapacityAh * series));
          const totalBatteries = series * parallel;
          const totalCapacity = batteryKwh * series * parallel;
          const totalCapacityAh = batteryCapacityAh * series * parallel;
          
          if (totalCapacityAh >= requiredCapacityAh && totalBatteries <= 8) {
            const efficiency = totalCapacityAh / requiredCapacityAh;
            if (!bestConfig || totalBatteries < bestBatteryCount || 
                (totalBatteries === bestBatteryCount && efficiency < bestEfficiency)) {
              bestConfig = {
                battery,
                series,
                parallel,
                totalBatteries,
                totalCapacity,
                totalCapacityAh
              };
              bestBatteryCount = totalBatteries;
              bestEfficiency = efficiency;
            }
          }
        }
      }
    }

    return bestConfig;
  }

  let bestConfig = findBestConfig(lithiumBatteries);
  let type = 'Lithium';
  
  if (!bestConfig) {
    bestConfig = findBestConfig(tubularBatteries);
    type = 'Tubular';
  }
  
  if (!bestConfig) {
    throw new Error(`Cannot meet battery requirement (${requiredCapacityAh.toFixed(1)}Ah) with available batteries for ${systemVoltage}V system.`);
  }

  // Calculate C-rate for validation
  const actualCrate = (inverterWatts / systemVoltage) / bestConfig.totalCapacityAh;
  if (actualCrate > 0.3) {
    console.warn(`High C-rate detected: ${actualCrate.toFixed(2)}C. Consider larger battery for better longevity.`);
  }
  
  return {
    type,
    capacityAh: Math.round(bestConfig.totalCapacityAh),
    series: bestConfig.series,
    parallel: bestConfig.parallel,
    totalBatteries: bestConfig.totalBatteries,
    name: bestConfig.battery.name
  };
}

function selectPanels(requiredKwp: number, inverterWatts: number): {
  wattage: number;
  count: number;
  totalWattage: number;
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
  let panelWatts = requiredKwp * 1000;
  
  // Cap panel wattage at 120% of inverter capacity (industry standard)
  const maxPanelWatts = inverterWatts * 1.2;
  if (panelWatts > maxPanelWatts) {
    panelWatts = maxPanelWatts;
    console.warn(`Panel wattage capped at ${maxPanelWatts}W (120% of inverter ${inverterWatts}W) to maintain system compatibility`);
  }
  
  const panelCount = Math.ceil(panelWatts / panelSize.watts);
  const actualTotalWattage = panelSize.watts * panelCount;
  
  return {
    wattage: panelSize.watts,
    count: panelCount,
    totalWattage: actualTotalWattage,
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

    // Calculate battery charging requirements first
    const maxLoad = calculateMaxLoad(appliances);
    
    // Start with initial inverter selection based on load
    let inverter = selectInverter(dailyEnergyDemand, maxLoad, 0);
    const systemVoltage = inverter.voltage;
    const battery = selectBattery(dailyEnergyDemand, systemVoltage, backupHours, inverter.watts);

    // Calculate battery charging requirements
    const batteryCapacityKwh = (battery.capacityAh * systemVoltage) / 1000;
    const usableBatteryCapacity = batteryCapacityKwh * (battery.type === 'Lithium' ? 0.9 : 0.5); // 90% for lithium, 50% for tubular
    const batteryChargingRequirement = usableBatteryCapacity * 0.9; // Charge to 90% of usable capacity

    // Total daily energy requirement: load + battery charging
    const totalDailyEnergyRequirement = dailyEnergyDemand + batteryChargingRequirement;

    // Calculate required PV size - ensure generation slightly exceeds demand (5% margin)
    const requiredKwp = (totalDailyEnergyRequirement / (worstMonthPvout * SYSTEM_CONSTANTS.SOLAR_EFFICIENCY)) * 1.05;
    const requiredPanelWatts = requiredKwp * 1000;

    // Check system size limit and throw error if exceeded
    if (requiredPanelWatts > MAX_SYSTEM_SIZE_KWP * 1000) {
      throw new Error(
        `System design (${(requiredPanelWatts/1000).toFixed(1)}kWp) exceeds the maximum supported limit of ${MAX_SYSTEM_SIZE_KWP}kWp. ` +
        'Please reduce your energy consumption or contact support for custom solutions.'
      );
    }

    // If required panels exceed current inverter capacity, try to upsize inverter
    if (requiredPanelWatts > inverter.watts * 1.2) {
      // Re-select inverter with actual panel requirements
      inverter = selectInverter(dailyEnergyDemand, maxLoad, requiredPanelWatts);
    }

    // Ensure PV doesn't exceed 120% of inverter power rating
    const maxAllowedPvWatts = inverter.watts * 1.2;
    const finalPanelWatts = Math.min(requiredPanelWatts, maxAllowedPvWatts);
    const finalRequiredKwp = finalPanelWatts / 1000;

    // Select panels using the final requirements
    const panels = selectPanels(finalRequiredKwp, inverter.watts);

    // Calculate breaker requirements using pricing database
    const panelVoltage = 24; // Typical panel voltage (Vmp) - should be configurable
    const maxDcCurrent = (panels.totalWattage / panelVoltage) * SYSTEM_CONSTANTS.DC_SAFETY_MARGIN;
    const dcBreakerRating = calculateDcBreakerRating(maxDcCurrent);
    let dcBreaker = getBreakerByRating(`${dcBreakerRating}A`, '500VDC');
    const acOutputCurrent = (inverter.watts / SYSTEM_CONSTANTS.AC_VOLTAGE) * SYSTEM_CONSTANTS.AC_SAFETY_MARGIN;
    const acBreakerRating = acOutputCurrent <= 16 ? '16A' : acOutputCurrent <= 32 ? '32A' : '63A';
    let acBreaker = getBreakerByRating(acBreakerRating, '230VAC');
    if (!dcBreaker) {
      const fallbackDcBreaker = getBreakerByRating('63A', '500VDC');
      if (!fallbackDcBreaker) {
        throw new Error('No suitable DC breakers found in pricing database');
      }
      dcBreaker = fallbackDcBreaker;
    }
    if (!acBreaker) {
      const fallbackAcBreaker = getBreakerByRating('32A', '230VAC');
      if (!fallbackAcBreaker) {
        throw new Error('No suitable AC breakers found in pricing database');
      }
      acBreaker = fallbackAcBreaker;
    }

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
        name: inverter.name
      },
      batteryConfiguration: {
        type: battery.type,
        capacityAh: battery.capacityAh,
        series: battery.series,
        parallel: battery.parallel,
        totalBatteries: battery.totalBatteries,
        name: battery.name
      },
      systemVoltage: systemVoltage,
      cables: {
        size: '',
        name: ''
      },
      breakers: {
        dc: {
          size: `${dcBreakerRating}A-DC`,
          current: dcBreakerRating,
          voltage: dcBreaker.voltage,
          name: dcBreaker.name
        },
        ac: {
          size: `${acBreaker.capacity}-AC`,
          current: parseInt(acBreaker.capacity),
          voltage: acBreaker.voltage,
          name: acBreaker.name
        }
      },
      solarPanels: {
        watts: panels.wattage,
        quantity: panels.count,
        name: panels.name
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