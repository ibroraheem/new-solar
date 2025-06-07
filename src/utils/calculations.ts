import { PvgisData, Appliance, SolarComponents, TimeSlot } from '../types';

// Constants for validation
const MAX_SYSTEM_SIZE_KWP = 12.6;
const MIN_DAILY_ENERGY = 0.1; // kWh
const MAX_DAILY_ENERGY = 100; // kWh
const MIN_BACKUP_HOURS = 8;  // Updated to match UI constraints
const MAX_BACKUP_HOURS = 24;
const EFFICIENCY_FACTOR = 0.85; // 85% efficiency for battery calculations

// Available hybrid inverter configurations
const INVERTER_CONFIGS = [
  { watts: 2000, voltage: 12, mppt: 80, maxPvInput: 2000*1.2 },  // 2kVA
  { watts: 3600, voltage: 24, mppt: 120, maxPvInput: 3600*1.2 }, // 3.6kVA
  { watts: 4200, voltage: 24, mppt: 120, maxPvInput: 4200*1.2 }, // 4.2kVA
  { watts: 6200, voltage: 48, mppt: 120, maxPvInput: 6200*1.2 }, // 6.2kVA
  { watts: 8200, voltage: 48, mppt: 120, maxPvInput: 8200*1.2 }, // 8.2kVA
  { watts: 10200, voltage: 48, mppt: 120, maxPvInput: 10200*1.2 } // 10.2kVA
];

// Available battery configurations
const BATTERY_CONFIGS = {
  tubular: { voltage: 12, ah: 220, kwh: 2.64 },
  lithium: [
    { voltage: 24, kwh: 5 },  // Updated to match actual battery capacity
    { voltage: 48, kwh: 5 },
    { voltage: 48, kwh: 7.6 },
    { voltage: 48, kwh: 10 },
    { voltage: 48, kwh: 15.5 }
  ]
};

// Available panel sizes
const PANEL_SIZES = [
  { watts: 400, maxSystemKw: 2.4 },
  { watts: 550, maxSystemKw: 6 },
  { watts: 600, maxSystemKw: 10.2 }
];

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

export function calculateWorstMonthPvout(pvgisData: PvgisData | null): number {
  if (!pvgisData?.monthly?.length) return 3.3; // Default worst month value
  
  const worstMonth = pvgisData.monthly.reduce((worst, month) => 
    month.pvout < worst.pvout ? month : worst
  );
  
  return worstMonth.pvout / 30; // Convert monthly value to daily
}

function selectInverter(
  dailyEnergyDemand: number,
  requiredPanelWatts: number
): typeof INVERTER_CONFIGS[0] {
  const peakPowerNeeded = (dailyEnergyDemand * 1000) / 4 * 1.5;

  // First try to find a suitable inverter
  const inverter = INVERTER_CONFIGS.find(inv =>
    inv.watts >= peakPowerNeeded &&
    inv.maxPvInput >= requiredPanelWatts
  );

  if (!inverter) {
    // If no suitable inverter found, find the closest match
    const closestInverter = INVERTER_CONFIGS.reduce((closest, curr) => {
      const currDiff = Math.abs(curr.watts - peakPowerNeeded);
      const closestDiff = Math.abs(closest.watts - peakPowerNeeded);
      return currDiff < closestDiff ? curr : closest;
    });

    console.warn(
      `No exact match found. Using closest inverter (${closestInverter.watts}W) ` +
      `for required ${peakPowerNeeded}W. System may need optimization.`
    );
    return closestInverter;
  }

  return inverter;
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
} {
  // Add 30% buffer and account for efficiency losses
  const energyNeeded = (dailyEnergyDemand * backupHours * 1.3) / EFFICIENCY_FACTOR;

  if (systemVoltage === 12) {
    const batteryKwh = BATTERY_CONFIGS.tubular.kwh;
    const parallel = Math.ceil(energyNeeded / batteryKwh);
    
    // Validate parallel configuration
    if (parallel > 4) {
      console.warn('High number of parallel batteries. Consider using a higher voltage system.');
    }

    return {
      type: 'Tubular',
      capacityAh: BATTERY_CONFIGS.tubular.ah,
      series: 1,
      parallel,
      totalBatteries: parallel
    };
  } else {
    // Find suitable lithium battery
    const battery = BATTERY_CONFIGS.lithium
      .filter(b => b.voltage === systemVoltage)
      .find(b => b.kwh >= energyNeeded);

    if (!battery) {
      const largest = BATTERY_CONFIGS.lithium
        .filter(b => b.voltage === systemVoltage)
        .reduce((max, curr) => curr.kwh > max.kwh ? curr : max);

      const unitsNeeded = Math.ceil(energyNeeded / largest.kwh);
      
      // Validate parallel configuration
      if (unitsNeeded > 4) {
        console.warn('High number of parallel batteries. Consider using a higher capacity battery.');
      }

      return {
        type: 'Lithium',
        capacityAh: (largest.kwh * 1000) / systemVoltage,
        series: 1,
        parallel: unitsNeeded,
        totalBatteries: unitsNeeded
      };
    }

    return {
      type: 'Lithium',
      capacityAh: (battery.kwh * 1000) / systemVoltage,
      series: 1,
      parallel: 1,
      totalBatteries: 1
    };
  }
}

function selectPanels(requiredKwp: number): {
  wattage: number;
  count: number;
  totalWattage: number;
} {
  // Select panel size based on system capacity
  const panelSize = PANEL_SIZES.find(p => requiredKwp <= p.maxSystemKw) || PANEL_SIZES[PANEL_SIZES.length - 1];
  
  // Calculate number of panels needed
  const panelCount = Math.ceil((requiredKwp * 1000) / panelSize.watts);
  
  return {
    wattage: panelSize.watts,
    count: panelCount,
    totalWattage: panelSize.watts * panelCount
  };
}

export function calculateSolarComponents(
  dailyEnergyDemand: number,
  backupHours: number,
  worstMonthPvout: number
): SolarComponents {
  try {
    // Validate inputs
    validateInputs(dailyEnergyDemand, backupHours);

    const requiredKwp = dailyEnergyDemand / (worstMonthPvout * 0.75);
    const requiredPanelWatts = requiredKwp * 1000;

    // Check system size limit with warning instead of error
    if (requiredPanelWatts > MAX_SYSTEM_SIZE_KWP * 1000) {
      console.warn(
        `System design (${(requiredPanelWatts/1000).toFixed(1)}kWp) exceeds recommended limit of ${MAX_SYSTEM_SIZE_KWP}kWp. ` +
        'Consider reducing energy consumption or improving efficiency.'
      );
    }

    // Select components
    const inverter = selectInverter(dailyEnergyDemand, requiredPanelWatts);
    const panels = selectPanels(requiredKwp);
    const batteries = selectBattery(dailyEnergyDemand, inverter.voltage, backupHours);

    // Calculate currents with safety margins
    const maxDcCurrent = (panels.totalWattage / inverter.voltage) * 1.25;
    const maxAcCurrent = (inverter.watts / 230) * 1.1;

    return {
      systemVoltage: inverter.voltage,
      inverterRating: inverter.watts,
      batteryType: batteries.type,
      batteryConfiguration: batteries,
      solarPanels: panels,
      chargeController: {
        type: 'Built-in MPPT',
        rating: inverter.mppt,
        count: 1
      },
      cables: {
        dcSize: maxDcCurrent <= 50 ? 16 : maxDcCurrent <= 100 ? 25 : 35,
        acSize: maxAcCurrent <= 32 ? 6 : maxAcCurrent <= 50 ? 10 : 16
      },
      breakers: {
        dcRating: Math.ceil(maxDcCurrent),
        acRating: Math.ceil(maxAcCurrent)
      },
      otherComponents: {
        spd: true,
        avr: inverter.watts >= 5000
      }
    };
  } catch (error) {
    console.error('Error in solar calculations:', error);
    throw error; // Re-throw to be handled by the UI
  }
}

export type NigerianRegion = 'north' | 'middle' | 'south';

export const getNigerianRegion = (latitude: number): NigerianRegion => {
  if (latitude >= 10) return 'north';
  if (latitude >= 7) return 'middle';
  return 'south';
};
