import { ChartData } from 'chart.js';

export interface Appliance {
  id: string;
  name: string;
  watts: number;
  quantity: number;
  timeSlots: TimeSlot[];
  isSelected: boolean;
  isCritical: boolean;
  category: 'home' | 'office' | 'custom';
}

export interface TimeSlot {
  id: string;
  name: 'morning' | 'afternoon' | 'evening' | 'night';
  start: number; // 24-hour format
  end: number; // 24-hour format
  selected: boolean;
  durationMinutes?: number; // Optional duration in minutes for short-use appliances
}

export interface ApplianceCategory {
  name: string;
  key: 'home' | 'office' | 'custom';
}

export interface LocationData {
  city: string;
  latitude: number;
  longitude: number;
}

export interface PvgisData {
  monthly: {
    month: number;
    pvout: number;
    eday: number; // Daily energy output for 1kWp system
  }[];
  annual: {
    pvout: number;
  };
  meta: {
    latitude: number;
    longitude: number;
    elevation: number;
    worstDayPvout: number; // E_d value from worst month
  };
}

export interface SolarComponents {
  systemSize: {
    kwp: number;
    watts: number;
    panels: number;
    panelWatts: number;
  };
  inverter: {
    watts: number;
    voltage: number;
    mppt: number;
    maxPvInput: number;
    price: number;
    name: string;
  };
  batteryConfiguration: {
    type: string;
    capacityAh: number;
    series: number;
    parallel: number;
    totalBatteries: number;
    price: number;
    name: string;
  };
  systemVoltage: number;
  cables: {
    size: string;
    price: number;
    name: string;
  };
  breakers: {
    dc: {
      size: string;
      current: number;
      voltage: string;
      price: number;
      name: string;
    };
    ac: {
      size: string;
      current: number;
      voltage: string;
      price: number;
      name: string;
    };
  };
  solarPanels: {
    watts: number;
    quantity: number;
    price: number;
    name: string;
  };
  totalCost: number;
  costBreakdown: {
    inverter: number;
    battery: number;
    panels: number;
    cables: number;
    breakers: number;
  };
}

export const TIME_SLOTS: TimeSlot[] = [
  { id: '1', name: 'morning', start: 6, end: 12, selected: false },
  { id: '2', name: 'afternoon', start: 12, end: 17, selected: false },
  { id: '3', name: 'evening', start: 17, end: 22, selected: false },
  { id: '4', name: 'night', start: 22, end: 6, selected: false }
];