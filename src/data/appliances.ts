import { Appliance, ApplianceCategory, TIME_SLOTS } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const applianceCategories: ApplianceCategory[] = [
  { name: 'Home Appliances', key: 'home' },
  { name: 'Office Equipment', key: 'office' },
  { name: 'Custom Appliances', key: 'custom' },
];

const createAppliance = (
  name: string,
  watts: number,
  category: 'home' | 'office' | 'custom',
  timeSlots: { name: 'morning' | 'afternoon' | 'evening' | 'night'; selected: boolean }[]
): Appliance => ({
  id: uuidv4(),
  name,
  watts,
  quantity: 1,
  hoursPerDay: 4,
  isSelected: false,
  isCritical: false,
  category,
  timeSlots: TIME_SLOTS.map(baseSlot => ({
    ...baseSlot,
    selected: timeSlots.some(slot => slot.name === baseSlot.name && slot.selected)
  }))
});

// Helper for common time patterns
const timePatterns = {
  allDay: [
    { name: 'morning', selected: true },
    { name: 'afternoon', selected: true },
    { name: 'evening', selected: true },
    { name: 'night', selected: true }
  ],
  dayOnly: [
    { name: 'morning', selected: true },
    { name: 'afternoon', selected: true },
    { name: 'evening', selected: false },
    { name: 'night', selected: false }
  ],
  eveningNight: [
    { name: 'morning', selected: false },
    { name: 'afternoon', selected: false },
    { name: 'evening', selected: true },
    { name: 'night', selected: true }
  ],
  nightOnly: [
    { name: 'morning', selected: false },
    { name: 'afternoon', selected: false },
    { name: 'evening', selected: false },
    { name: 'night', selected: true }
  ]
} as const;

export const defaultAppliances: Appliance[] = [
  // Home Appliances - Night-focused
  createAppliance('LED Bulb', 10, 'home', timePatterns.eveningNight),
  createAppliance('Ceiling Fan', 80, 'home', timePatterns.eveningNight),
  createAppliance('Standing Fan', 90, 'home', timePatterns.eveningNight),
  createAppliance('Table Fan', 40, 'home', timePatterns.eveningNight),
  createAppliance('Pressing Iron', 1200, 'home', [
    { name: 'morning', selected: true },
    { name: 'afternoon', selected: false },
    { name: 'evening', selected: true },
    { name: 'night', selected: false }
  ]),
  createAppliance('Blender', 350, 'home', [
    { name: 'morning', selected: true },
    { name: 'afternoon', selected: false },
    { name: 'evening', selected: true },
    { name: 'night', selected: false }
  ]),
  createAppliance('Electric Kettle', 2000, 'home', [
    { name: 'morning', selected: true },
    { name: 'afternoon', selected: false },
    { name: 'evening', selected: true },
    { name: 'night', selected: false }
  ]),
  createAppliance('Electric Cooker', 2500, 'home', [
    { name: 'morning', selected: true },
    { name: 'afternoon', selected: false },
    { name: 'evening', selected: true },
    { name: 'night', selected: false }
  ]),
  createAppliance('Microwave Oven', 1300, 'home', [
    { name: 'morning', selected: true },
    { name: 'afternoon', selected: false },
    { name: 'evening', selected: true },
    { name: 'night', selected: false }
  ]),
  createAppliance('Refrigerator (Small)', 120, 'home', timePatterns.allDay),
  createAppliance('Refrigerator (Large)', 250, 'home', timePatterns.allDay),
  createAppliance('Freezer (Chest)', 500, 'home', timePatterns.allDay),
  createAppliance('TV (32" LED)', 70, 'home', timePatterns.eveningNight),
  createAppliance('TV (50" LCD)', 150, 'home', timePatterns.eveningNight),
  createAppliance('DSTV/Decoder', 20, 'home', timePatterns.eveningNight),
  createAppliance('Home Theatre', 80, 'home', timePatterns.eveningNight),
  createAppliance('Washing Machine', 800, 'home', [
    { name: 'morning', selected: true },
    { name: 'afternoon', selected: true },
    { name: 'evening', selected: false },
    { name: 'night', selected: false }
  ]),
  createAppliance('Water Dispenser', 600, 'home', timePatterns.allDay),
  createAppliance('Laptop', 60, 'home', timePatterns.eveningNight),
  createAppliance('Desktop Computer', 200, 'home', timePatterns.eveningNight),
  createAppliance('Wi-Fi Router', 15, 'home', timePatterns.allDay),
  createAppliance('Phone Charger', 10, 'home', timePatterns.eveningNight),

  // Office Equipment - Day-focused
  createAppliance('Desktop Computer + Monitor', 250, 'office', timePatterns.dayOnly),
  createAppliance('Laptop', 60, 'office', timePatterns.dayOnly),
  createAppliance('Printer (Inkjet)', 40, 'office', timePatterns.dayOnly),
  createAppliance('Printer (LaserJet)', 400, 'office', timePatterns.dayOnly),
  createAppliance('Photocopier', 800, 'office', timePatterns.dayOnly),
  createAppliance('Projector', 300, 'office', timePatterns.dayOnly),
  createAppliance('Shredder', 200, 'office', timePatterns.dayOnly),
  createAppliance('Air Conditioner (1HP)', 1000, 'office', timePatterns.dayOnly),
  createAppliance('Air Conditioner (1.5HP)', 1500, 'office', timePatterns.dayOnly),
  createAppliance('Standing Fan', 90, 'office', timePatterns.dayOnly),
  createAppliance('Conference Speaker', 150, 'office', timePatterns.dayOnly),
  createAppliance('Office Refrigerator', 200, 'office', timePatterns.allDay),
  createAppliance('Electric Kettle', 2000, 'office', [
    { name: 'morning', selected: true },
    { name: 'afternoon', selected: true },
    { name: 'evening', selected: false },
    { name: 'night', selected: false }
  ]),
];