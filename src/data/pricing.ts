// Pricing database for solar system components
// Base prices provided by user with 20% markup applied

export interface ComponentPrice {
  id: string;
  name: string;
  capacity: string;
  voltage?: string;
  price: number; // Final price (includes markup)
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
    price: 288000, // Final price (includes 20% markup)
    category: 'inverter',
    brand: 'Growatt',
    warranty: '2 Years',
    efficiency: '95%'
  },
  {
    id: 'inv-3.6kva',
    name: '3.6KVA Inverter',
    capacity: '3.6KVA',
    price: 396000, // Final price (includes 20% markup)
    category: 'inverter',
    brand: 'Growatt',
    warranty: '2 Years',
    efficiency: '95%'
  },
  {
    id: 'inv-4.2kva',
    name: '4.2KVA Inverter',
    capacity: '4.2KVA',
    price: 420000, // Final price (includes 20% markup)
    category: 'inverter',
    brand: 'Growatt',
    warranty: '2 Years',
    efficiency: '95%'
  },
  {
    id: 'inv-6.2kva',
    name: '6.2KVA Inverter',
    capacity: '6.2KVA',
    price: 456000, // Final price (includes 20% markup)
    category: 'inverter',
    brand: 'Growatt',
    warranty: '2 Years',
    efficiency: '95%'
  },
  {
    id: 'inv-8.2kva',
    name: '8.2KVA Inverter',
    capacity: '8.2KVA',
    price: 816000, // Final price (includes 20% markup)
    category: 'inverter',
    brand: 'Growatt',
    warranty: '2 Years',
    efficiency: '95%'
  },
  {
    id: 'inv-10.2kva',
    name: '10.2KVA Inverter',
    capacity: '10.2KVA',
    price: 864000, // Final price (includes 20% markup)
    category: 'inverter',
    brand: 'Growatt',
    warranty: '2 Years',
    efficiency: '95%'
  }
];

export const BATTERY_PRICING: ComponentPrice[] = [
  {
    id: 'bat-1.28kwh-12v-lithium',
    name: '1.28KWH Battery (12V) - Lithium',
    capacity: '1.28KWH',
    voltage: '12V',
    price: 280000, // Final price (includes 20% markup)
    category: 'battery',
    brand: 'Pylontech',
    warranty: '5 Years',
    efficiency: '98%'
  },
  {
    id: 'bat-2.56kwh-12v-lithium',
    name: '2.56KWH Battery (12V) - Lithium',
    capacity: '2.56KWH',
    voltage: '12V',
    price: 520000, // Final price (includes 20% markup)
    category: 'battery',
    brand: 'Pylontech',
    warranty: '5 Years',
    efficiency: '98%'
  },
  {
    id: 'bat-2.86kwh-12v-tubular',
    name: '2.86KWH Battery (12V) - Tubular',
    capacity: '2.86KWH',
    voltage: '12V',
    price: 280000,
    category: 'battery',
    brand: 'Trojan',
    warranty: '3 Years',
    efficiency: '85%'
  },
  {
    id: 'bat-3.84kwh-12v-lithium',
    name: '3.84KWH Battery (12V) - Lithium',
    capacity: '3.84KWH',
    voltage: '12V',
    price: 720000, // Final price (includes 20% markup)
    category: 'battery',
    brand: 'Pylontech',
    warranty: '5 Years',
    efficiency: '98%'
  },
  {
    id: 'bat-5kwh-24v',
    name: '5KWH Battery (24V)',
    capacity: '5KWH',
    voltage: '24V',
    price: 1080000, // Final price (includes 20% markup)
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
    price: 1080000, // Final price (includes 20% markup)
    category: 'battery',
    brand: 'Pylontech',
    warranty: '5 Years',
    efficiency: '98%'
  },
  {
    id: 'bat-7.6kwh',
    name: '7.6KWH Battery (24V)',
    capacity: '7.6KWH',
    voltage: '24V',
    price: 1320000, // Final price (includes 20% markup)
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
    price: 1920000, // Final price (includes 20% markup)
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
    price: 2400000, // Final price (includes 20% markup)
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
    price: 102000, // Final price (includes 20% markup)
    brand: 'Canadian Solar',
    warranty: '25 Years',
    efficiency: '20.5%'
  },
  {
    id: 'panel-550w',
    name: '550W Solar Panel',
    capacity: '550W',
    price: 138000, // Final price (includes 20% markup)
    brand: 'Canadian Solar',
    warranty: '25 Years',
    efficiency: '21.5%'
  },
  {
    id: 'panel-600w',
    name: '600W Solar Panel',
    capacity: '600W',
    price: 150000, // Final price (includes 20% markup)
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
    price: 4440, // Final price per meter (includes 20% markup)
    unit: 'per meter'
  },
  {
    id: 'cable-10mm',
    name: '10mm² DC Cable',
    capacity: '10mm²',
    price: 5400, // Final price per meter (includes 20% markup)
    unit: 'per meter'
  },
  {
    id: 'cable-16mm',
    name: '16mm² DC Cable',
    capacity: '16mm²',
    price: 6000, // Final price per meter (includes 20% markup)
    unit: 'per meter'
  },
  {
    id: 'cable-25mm',
    name: '25mm² DC Cable',
    capacity: '25mm²',
    price: 9000, // Final price per meter (includes 20% markup)
    unit: 'per meter'
  },
  {
    id: 'cable-35mm',
    name: '35mm² DC Cable',
    capacity: '35mm²',
    price: 14000, // Final price per meter (includes 20% markup)
    unit: 'per meter'
  }
];

// Surge protector pricing (per unit)
export const SURGE_PROTECTOR_PRICING = [
  {
    id: 'sp-dc-600v',
    name: 'DC Surge Protector (600V)',
    capacity: '600V',
    price: 18000, // Typical price per unit (includes markup)
    unit: 'per unit',
    brand: 'Schneider'
  }
];

// Note: Mounting hardware, combiner box, and installation labor are not included in the pricing database.
// Other costs may arise depending on site conditions and installation requirements.

export const BREAKER_PRICING = [
  {
    id: 'breaker-16a-dc',
    name: '16A DC Breaker',
    capacity: '16A',
    voltage: '500VDC',
    price: 14400, // Final price (includes 20% markup)
    brand: 'Schneider'
  },
  {
    id: 'breaker-20a-dc',
    name: '20A DC Breaker',
    capacity: '20A',
    voltage: '500VDC',
    price: 15600, // Final price (includes 20% markup)
    brand: 'Schneider'
  },
  {
    id: 'breaker-25a-dc',
    name: '25A DC Breaker',
    capacity: '25A',
    voltage: '500VDC',
    price: 16800, // Final price (includes 20% markup)
    brand: 'Schneider'
  },
  {
    id: 'breaker-32a-dc',
    name: '32A DC Breaker',
    capacity: '32A',
    voltage: '500VDC',
    price: 18000, // Final price (includes 20% markup)
    brand: 'Schneider'
  },
  {
    id: 'breaker-40a-dc',
    name: '40A DC Breaker',
    capacity: '40A',
    voltage: '500VDC',
    price: 21600, // Final price (includes 20% markup)
    brand: 'Schneider'
  },
  {
    id: 'breaker-50a-dc',
    name: '50A DC Breaker',
    capacity: '50A',
    voltage: '500VDC',
    price: 26400, // Final price (includes 20% markup)
    brand: 'Schneider'
  },
  {
    id: 'breaker-63a-dc',
    name: '63A DC Breaker',
    capacity: '63A',
    voltage: '500VDC',
    price: 30000, // Final price (includes 20% markup)
    brand: 'Schneider'
  },
  {
    id: 'breaker-16a-ac',
    name: '16A AC Breaker',
    capacity: '16A',
    voltage: '230VAC',
    price: 9600, // Final price (includes 20% markup)
    brand: 'Schneider'
  },
  {
    id: 'breaker-32a-ac',
    name: '32A AC Breaker',
    capacity: '32A',
    voltage: '230VAC',
    price: 14400, // Final price (includes 20% markup)
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

export const getBatteryByCapacityAndVoltage = (capacityKwh: number, voltage: number): ComponentPrice | undefined => {
  return BATTERY_PRICING.find(bat => {
    const batKwh = parseFloat(bat.capacity.replace('KWH', ''));
    const batVoltage = parseInt(bat.voltage?.replace('V', '') || '0');
    return batKwh >= capacityKwh && batVoltage === voltage;
  });
};

// Utility functions for breaker selection
export const getBreakerByRating = (rating: string, voltage: string) => {
  return BREAKER_PRICING.find(b => b.capacity === rating && b.voltage === voltage);
};

export const getAvailableDcBreakerRatings = (): number[] => {
  return BREAKER_PRICING
    .filter(b => b.voltage === '500VDC')
    .map(b => parseInt(b.capacity.replace('A', '')))
    .sort((a, b) => a - b);
};

export const getAvailableAcBreakerRatings = (): string[] => {
  return BREAKER_PRICING
    .filter(b => b.voltage === '230VAC')
    .map(b => b.capacity)
    .sort((a, b) => parseInt(a) - parseInt(b));
}; 