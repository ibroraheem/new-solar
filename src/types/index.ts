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
  }[];
  annual: {
    pvout: number;
  };
  meta: {
    latitude: number;
    longitude: number;
    elevation: number;
    worstDayPvout: number;
  };
}

export interface SolarComponents {
  systemVoltage: number;
  inverterRating: number;
  batteryType: string;
  batteryConfiguration: {
    capacityAh: number;
    series: number;
    parallel: number;
    totalBatteries: number;
  };
  solarPanels: {
    wattage: number;
    count: number;
    totalWattage: number;
  };
  chargeController: {
    type: 'Built-in MPPT' | 'PWM';
    rating: number;
    count: number;
  };
  cables: {
    acSize: number;
    dcSize: number;
  };
  breakers: {
    acRating: number;
    dcRating: number;
  };
  otherComponents: {
    spd: boolean;
    avr: boolean;
  };
}

export const TIME_SLOTS: TimeSlot[] = [
  { id: '1', name: 'morning', start: 6, end: 12, selected: false },
  { id: '2', name: 'afternoon', start: 12, end: 17, selected: false },
  { id: '3', name: 'evening', start: 17, end: 22, selected: false },
  { id: '4', name: 'night', start: 22, end: 6, selected: false }
];