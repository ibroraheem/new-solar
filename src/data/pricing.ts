// Pricing database for solar system components
// Base prices provided by user with 20% markup applied

export interface ComponentPrice {
  id: string;
  name: string;
  capacity: string;
  voltage?: string;
  basePrice: number;
  markupPrice: number; // 20% markup
  category: 'inverter' | 'battery';
  brand?: string;
  warranty?: string;
  efficiency?: string;
}

export const INVERTER_PRICING: ComponentPrice[] = [
  {
    id: 'inv-2kva',
    name: '2KVA Inverter',
    capacity: '2KVA',
    basePrice: 240000,
    markupPrice: 288000, // 240k + 20%
    category: 'inverter',
    brand: 'Growatt',
    warranty: '2 Years',
    efficiency: '95%'
  },
  {
    id: 'inv-3.6kva',
    name: '3.6KVA Inverter',
    capacity: '3.6KVA',
    basePrice: 330000,
    markupPrice: 396000, // 330k + 20%
    category: 'inverter',
    brand: 'Growatt',
    warranty: '2 Years',
    efficiency: '95%'
  },
  {
    id: 'inv-4.2kva',
    name: '4.2KVA Inverter',
    capacity: '4.2KVA',
    basePrice: 350000,
    markupPrice: 420000, // 350k + 20%
    category: 'inverter',
    brand: 'Growatt',
    warranty: '2 Years',
    efficiency: '95%'
  },
  {
    id: 'inv-6.2kva',
    name: '6.2KVA Inverter',
    capacity: '6.2KVA',
    basePrice: 380000,
    markupPrice: 456000, // 380k + 20%
    category: 'inverter',
    brand: 'Growatt',
    warranty: '2 Years',
    efficiency: '95%'
  },
  {
    id: 'inv-8.2kva',
    name: '8.2KVA Inverter',
    capacity: '8.2KVA',
    basePrice: 680000,
    markupPrice: 816000, // 680k + 20%
    category: 'inverter',
    brand: 'Growatt',
    warranty: '2 Years',
    efficiency: '95%'
  },
  {
    id: 'inv-10.2kva',
    name: '10.2KVA Inverter',
    capacity: '10.2KVA',
    basePrice: 720000,
    markupPrice: 864000, // 720k + 20%
    category: 'inverter',
    brand: 'Growatt',
    warranty: '2 Years',
    efficiency: '95%'
  }
];

export const BATTERY_PRICING: ComponentPrice[] = [
  {
    id: 'bat-5kwh-24v',
    name: '5KWH Battery (24V)',
    capacity: '5KWH',
    voltage: '24V',
    basePrice: 900000,
    markupPrice: 1080000, // 900k + 20%
    category: 'battery',
    brand: 'Pylontech',
    warranty: '5 Years',
    efficiency: '98%'
  },
  {
    id: 'bat-5kwh-48v',
    name: '5KWH Battery (48V)',
    capacity: '5KWH',
    voltage: '48V',
    basePrice: 900000,
    markupPrice: 1080000, // 900k + 20%
    category: 'battery',
    brand: 'Pylontech',
    warranty: '5 Years',
    efficiency: '98%'
  },
  {
    id: 'bat-7.6kwh',
    name: '7.6KWH Battery',
    capacity: '7.6KWH',
    voltage: '48V',
    basePrice: 1100000,
    markupPrice: 1320000, // 1.1m + 20%
    category: 'battery',
    brand: 'Pylontech',
    warranty: '5 Years',
    efficiency: '98%'
  },
  {
    id: 'bat-10kwh',
    name: '10KWH Battery',
    capacity: '10KWH',
    voltage: '48V',
    basePrice: 1600000,
    markupPrice: 1920000, // 1.6m + 20%
    category: 'battery',
    brand: 'Pylontech',
    warranty: '5 Years',
    efficiency: '98%'
  },
  {
    id: 'bat-15.5kwh',
    name: '15.5KWH Battery',
    capacity: '15.5KWH',
    voltage: '48V',
    basePrice: 2000000,
    markupPrice: 2400000, // 2m + 20%
    category: 'battery',
    brand: 'Pylontech',
    warranty: '5 Years',
    efficiency: '98%'
  }
];

// Additional component pricing
export const SOLAR_PANEL_PRICING = [
  {
    id: 'panel-400w',
    name: '400W Solar Panel',
    capacity: '400W',
    basePrice: 85000,
    markupPrice: 102000, // 85k + 20%
    brand: 'Canadian Solar',
    warranty: '25 Years',
    efficiency: '20.5%'
  },
  {
    id: 'panel-550w',
    name: '550W Solar Panel',
    capacity: '550W',
    basePrice: 115000,
    markupPrice: 138000, // 115k + 20%
    brand: 'Canadian Solar',
    warranty: '25 Years',
    efficiency: '21.5%'
  },
  {
    id: 'panel-600w',
    name: '600W Solar Panel',
    capacity: '600W',
    basePrice: 125000,
    markupPrice: 150000, // 125k + 20%
    brand: 'Canadian Solar',
    warranty: '25 Years',
    efficiency: '22.0%'
  }
];

export const CABLE_PRICING = [
  {
    id: 'cable-6mm',
    name: '6mm² DC Cable',
    capacity: '6mm²',
    basePrice: 3700, // per meter
    markupPrice: 4440, // 2.5k + 20%
    unit: 'per meter'
  },
  {
    id: 'cable-10mm',
    name: '10mm² DC Cable',
    capacity: '10mm²',
    basePrice: 4500, // per meter
    markupPrice: 5400, // 3.5k + 20%
    unit: 'per meter'
  },
  {
    id: 'cable-16mm',
    name: '16mm² DC Cable',
    capacity: '16mm²',
    basePrice: 5000, // per meter
    markupPrice: 6000, // 5k + 20%
    unit: 'per meter'
  },
  {
    id: 'cable-25mm',
    name: '25mm² DC Cable',
    capacity: '25mm²',
    basePrice: 7500, // per meter
    markupPrice: 9000, // 7.5k + 20%
    unit: 'per meter'
  }
];

export const BREAKER_PRICING = [
  {
    id: 'breaker-32a-dc',
    name: '32A DC Breaker',
    capacity: '32A',
    voltage: '500VDC',
    basePrice: 15000,
    markupPrice: 18000, // 15k + 20%
    brand: 'Schneider'
  },
  {
    id: 'breaker-40a-dc',
    name: '40A DC Breaker',
    capacity: '40A',
    voltage: '500VDC',
    basePrice: 18000,
    markupPrice: 21600, // 18k + 20%
    brand: 'Schneider'
  },
  {
    id: 'breaker-63a-dc',
    name: '63A DC Breaker',
    capacity: '63A',
    voltage: '500VDC',
    basePrice: 25000,
    markupPrice: 30000, // 25k + 20%
    brand: 'Schneider'
  },
  {
    id: 'breaker-16a-ac',
    name: '16A AC Breaker',
    capacity: '16A',
    voltage: '230VAC',
    basePrice: 8000,
    markupPrice: 9600, // 8k + 20%
    brand: 'Schneider'
  },
  {
    id: 'breaker-32a-ac',
    name: '32A AC Breaker',
    capacity: '32A',
    voltage: '230VAC',
    basePrice: 12000,
    markupPrice: 14400, // 12k + 20%
    brand: 'Schneider'
  }
];

// Utility functions for pricing
export const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    return `₦${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    return `₦${(price / 1000).toFixed(0)}K`;
  }
  return `₦${price.toLocaleString()}`;
};

export const calculateMarkup = (basePrice: number, markupPercentage: number = 20): number => {
  return Math.round(basePrice * (1 + markupPercentage / 100));
};

export const getComponentByCapacity = (capacity: string, category: 'inverter' | 'battery'): ComponentPrice | undefined => {
  const components = category === 'inverter' ? INVERTER_PRICING : BATTERY_PRICING;
  return components.find(comp => comp.capacity === capacity);
};

export const getInverterByWatts = (watts: number): ComponentPrice | undefined => {
  const kva = watts / 1000;
  return INVERTER_PRICING.find(inv => {
    const invKva = parseFloat(inv.capacity.replace('KVA', ''));
    return invKva >= kva;
  });
};

export const getBatteryByCapacity = (capacityKwh: number): ComponentPrice | undefined => {
  return BATTERY_PRICING.find(bat => {
    const batKwh = parseFloat(bat.capacity.replace('KWH', ''));
    return batKwh >= capacityKwh;
  });
}; 