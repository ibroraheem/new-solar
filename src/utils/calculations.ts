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

// DC Breaker ratings for 500VDC systems (common in Nigerian market)
const DC_BREAKER_RATINGS = [16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000];

// Input validation
function validateInputs(dailyEnergyDemand: number, backupHours: number): void {
  if (dailyEnergyDemand < MIN_DAILY_ENERGY || dailyEnergyDemand > MAX_DAILY_ENERGY) {
    throw new Error(`Daily energy demand must be between ${MIN_DAILY_ENERGY} and ${MAX_DAILY_ENERGY} kWh`);
  }
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

function selectInverter(
  dailyEnergyDemand: number,
  requiredPanelWatts: number
): {
  watts: number;
  voltage: number;
  mppt: number;
  maxPvInput: number;
  price: number;
  name: string;
} {
  // Use centralized peak power margin instead of hardcoded value
  const peakPowerNeeded = dailyEnergyDemand * 1000 * SYSTEM_CONSTANTS.PEAK_POWER_MARGIN;

  // Use pricing database to find suitable inverter
  const inverter = getInverterByWatts(peakPowerNeeded);
  
  if (!inverter) {
    throw new Error(`No suitable inverter found for ${peakPowerNeeded}W requirement`);
  }

  // Convert KVA to watts and determine voltage based on capacity
  const kva = parseFloat(inverter.capacity.replace('KVA', ''));
  const watts = kva * 1000;
  
  // Determine voltage based on inverter capacity
  let voltage = 48; // Default for larger systems
  if (kva <= 2) voltage = 12;
  else if (kva <= 4.2) voltage = 24;
  
  // Determine MPPT current based on voltage
  const mppt = voltage === 12 ? 80 : 120;
  
  // Estimate max PV input (typically 1.5x inverter capacity)
  const maxPvInput = watts * 1.5;

  return {
    watts,
    voltage,
    mppt,
    maxPvInput,
    price: inverter.markupPrice,
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
  // Calculate hourly demand and add 30% buffer for efficiency losses using centralized constants
  const hourlyDemand = dailyEnergyDemand / 24; // Convert daily to hourly
  const energyNeeded = (hourlyDemand * backupHours * SYSTEM_CONSTANTS.PEAK_POWER_MARGIN) / EFFICIENCY_FACTOR;

  // Use pricing database to find suitable battery
  const battery = getBatteryByCapacity(energyNeeded);
  
  if (!battery) {
    throw new Error(`No suitable battery found for ${energyNeeded.toFixed(1)}kWh requirement`);
  }

  const batteryKwh = parseFloat(battery.capacity.replace('KWH', ''));
  const parallel = Math.ceil(energyNeeded / batteryKwh);
  
  // Validate parallel configuration
  if (parallel > 4) {
    console.warn('High number of parallel batteries. Consider using a higher capacity battery.');
  }

  const capacityAh = (batteryKwh * 1000) / systemVoltage;
  const totalPrice = battery.markupPrice * parallel;

  // Determine series configuration based on voltage
  let series = 1;
  if (systemVoltage === 24) series = 2;
  else if (systemVoltage === 48) series = 4;

  return {
    type: 'Lithium', // All batteries in pricing are lithium
    capacityAh: Math.round(capacityAh),
    series,
    parallel,
    totalBatteries: parallel,
    price: totalPrice,
    name: battery.name
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
    price: panel.markupPrice * panelCount,
    name: panel.name
  };
}

// Function to calculate DC breaker rating for 500VDC systems
function calculateDcBreakerRating(maxDcCurrent: number): number {
  // Find the next available breaker rating that can handle the current
  const breaker = DC_BREAKER_RATINGS.find(rating => rating >= maxDcCurrent);
  return breaker || DC_BREAKER_RATINGS[DC_BREAKER_RATINGS.length - 1];
}

export function calculateSolarComponents(
  dailyEnergyDemand: number,
  backupHours: number,
  worstMonthPvout: number
): SolarComponents {
  try {
    // Validate inputs
    validateInputs(dailyEnergyDemand, backupHours);

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
    const inverter = selectInverter(dailyEnergyDemand, requiredPanelWatts);
    const systemVoltage = inverter.voltage;
    const battery = selectBattery(dailyEnergyDemand, systemVoltage, backupHours);
    const panels = selectPanels(requiredKwp);

    // Calculate cable requirements using pricing database
    const maxCurrent = panels.totalWattage / (systemVoltage * 0.8); // 80% efficiency
    const cableSize = maxCurrent <= 32 ? '6mm²' : maxCurrent <= 50 ? '10mm²' : maxCurrent <= 80 ? '16mm²' : '25mm²';
    const cableLength = 20; // Estimated cable length in meters
    
    const cable = CABLE_PRICING.find(c => c.capacity === cableSize);
    if (!cable) {
      throw new Error(`No pricing found for ${cableSize} cable`);
    }
    const cablePrice = cable.markupPrice * cableLength;

    // Calculate breaker requirements using pricing database
    const dcBreakerRating = calculateDcBreakerRating(maxCurrent);
    const dcBreaker = BREAKER_PRICING.find(b => b.capacity === `${dcBreakerRating}A` && b.voltage === '500VDC');
    const acBreaker = BREAKER_PRICING.find(b => b.capacity === (inverter.watts <= 2000 ? '16A' : '32A') && b.voltage === '230VAC');
    
    if (!dcBreaker || !acBreaker) {
      throw new Error('No suitable breakers found');
    }
    
    const totalBreakerPrice = dcBreaker.markupPrice + acBreaker.markupPrice;

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
          price: dcBreaker.markupPrice,
          name: dcBreaker.name
        },
        ac: {
          size: `${acBreaker.capacity}-AC`,
          current: parseInt(acBreaker.capacity),
          voltage: acBreaker.voltage,
          price: acBreaker.markupPrice,
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
