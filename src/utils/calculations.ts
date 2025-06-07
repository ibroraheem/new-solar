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

import { Appliance, SolarComponents, TimeSlot } from '../types';

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
  
  // Find the month with lowest daily average
  const worstMonth = pvgisData.monthly.reduce((worst, month) => 
    month.pvout < worst.pvout ? month : worst
  );
  
  // Convert monthly total to daily average
  return worstMonth.pvout / 30;
}

function selectInverter(
  dailyEnergyDemand: number,
  requiredPanelWatts: number
): typeof INVERTER_CONFIGS[0] {
  const peakPowerNeeded = (dailyEnergyDemand * 1000) / 4 * 1.5;

  const inverter = INVERTER_CONFIGS.find(inv =>
    inv.watts >= peakPowerNeeded &&
    inv.maxPvInput >= requiredPanelWatts
  );

  if (!inverter) {
    throw new Error('No suitable inverter found for the required load and PV input.');
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
  // Add 30% buffer to the energy storage requirement
  const energyNeeded = dailyEnergyDemand * backupHours * 1.3; // kWh needed with 30% buffer

  if (systemVoltage === 12) {
    // Use Tubular batteries for 12V systems
    const batteryKwh = BATTERY_CONFIGS.tubular.kwh;
    const parallel = Math.ceil(energyNeeded / batteryKwh);

    return {
      type: 'Tubular',
      capacityAh: BATTERY_CONFIGS.tubular.ah,
      series: 1,
      parallel: parallel,
      totalBatteries: parallel
    };
  } else {
    // Find suitable lithium battery
    const battery = BATTERY_CONFIGS.lithium
      .filter(b => b.voltage === systemVoltage)
      .find(b => b.kwh >= energyNeeded);

    if (!battery) {
      // If no single battery is large enough, use the largest available
      const largest = BATTERY_CONFIGS.lithium
        .filter(b => b.voltage === systemVoltage)
        .reduce((max, curr) => curr.kwh > max.kwh ? curr : max);

      const unitsNeeded = Math.ceil(energyNeeded / largest.kwh);
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
  const requiredKwp = dailyEnergyDemand / (worstMonthPvout * 0.75);
  const requiredPanelWatts = requiredKwp * 1000;

  // ⛔ Reject if over 12.6kW limit
  if (requiredPanelWatts > 12600) {
    throw new Error('System design exceeds 12.6kWp limit. Please reduce energy consumption or improve efficiency.');
  }

  // Select inverter that can handle both load and PV capacity
  const inverter = selectInverter(dailyEnergyDemand, requiredPanelWatts);

  // Select panels
  const panels = selectPanels(requiredKwp);

  // Select batteries
  const batteries = selectBattery(dailyEnergyDemand, inverter.voltage, backupHours);

  // Currents
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
}
