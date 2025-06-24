import { Appliance, ApplianceCategory, TIME_SLOTS } from '../types';

// Simple ID generator
let idCounter = 0;
const generateId = () => `appliance-${++idCounter}`;

export const applianceCategories = [
  { key: 'home', name: 'Home Appliances' },
  { key: 'office', name: 'Office Equipment' },
  { key: 'custom', name: 'Custom' },
];

const createAppliance = (
  name: string,
  watts: number,
  category: 'home' | 'office' | 'custom',
  timeSlots: { name: 'morning' | 'afternoon' | 'evening' | 'night'; selected: boolean }[]
): Appliance => ({
  id: generateId(),
  name,
  watts,
  quantity: 1,
  isSelected: false,
  isCritical: false,
  category,
  timeSlots: TIME_SLOTS.map(baseSlot => ({
    ...baseSlot,
    selected: timeSlots.some(slot => slot.name === baseSlot.name && slot.selected)
  }))
});

// Helper for common time patterns
const timePatterns: {
  allDay: { name: 'morning' | 'afternoon' | 'evening' | 'night'; selected: boolean }[];
  dayOnly: { name: 'morning' | 'afternoon' | 'evening' | 'night'; selected: boolean }[];
  eveningNight: { name: 'morning' | 'afternoon' | 'evening' | 'night'; selected: boolean }[];
  nightOnly: { name: 'morning' | 'afternoon' | 'evening' | 'night'; selected: boolean }[];
} = {
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
};

export const appliances = [
  // Home Appliances
  { id: 'phone-charger', name: 'Phone Charger', watts: 25, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: true },
    { id: '2', name: 'morning', start: 6, end: 12, selected: false },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: false },
    { id: '4', name: 'evening', start: 17, end: 22, selected: true }
  ] },
  { id: 'laptop-standard', name: 'Laptop (Standard)', watts: 65, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: true },
    { id: '2', name: 'morning', start: 6, end: 12, selected: false },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: false },
    { id: '4', name: 'evening', start: 17, end: 22, selected: true }
  ] },
  { id: 'gaming-laptop', name: 'Gaming Laptop', watts: 200, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: true },
    { id: '2', name: 'morning', start: 6, end: 12, selected: false },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: false },
    { id: '4', name: 'evening', start: 17, end: 22, selected: true }
  ] },
  { id: 'led-bulb', name: 'LED Bulb', watts: 10, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: true },
    { id: '2', name: 'morning', start: 6, end: 12, selected: false },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: false },
    { id: '4', name: 'evening', start: 17, end: 22, selected: true }
  ] },
  { id: 'ceiling-fan', name: 'Ceiling Fan', watts: 80, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: true },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: true }
  ] },
  { id: 'standing-fan', name: 'Standing Fan', watts: 100, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: true },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: true }
  ] },
  { id: 'table-fan', name: 'Table Fan', watts: 50, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: true },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: true }
  ] },
  { id: 'electric-kettle', name: 'Electric Kettle', watts: 2000, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
  { id: 'electric-iron', name: 'Electric Iron', watts: 1500, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
  { id: 'refrigerator-small', name: 'Refrigerator (Small)', watts: 150, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: true },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: true }
  ] },
  { id: 'refrigerator-double', name: 'Refrigerator (Double Door)', watts: 400, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: true },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: true }
  ] },
  { id: 'chest-freezer', name: 'Chest Freezer', watts: 300, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: true },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: true }
  ] },
  { id: 'microwave-oven', name: 'Microwave Oven', watts: 1000, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
  { id: 'blender', name: 'Blender', watts: 800, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
  { id: 'electric-cooker', name: 'Electric Cooker', watts: 1500, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
  { id: 'ac-1hp', name: 'Air Conditioner (1HP)', watts: 1000, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: true },
    { id: '2', name: 'morning', start: 6, end: 12, selected: false },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: true }
  ] },
  { id: 'ac-1.5hp', name: 'Air Conditioner (1.5HP)', watts: 1500, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: true },
    { id: '2', name: 'morning', start: 6, end: 12, selected: false },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: true }
  ] },
  { id: 'tv', name: 'TV (32–43 inch)', watts: 100, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: true },
    { id: '2', name: 'morning', start: 6, end: 12, selected: false },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: false },
    { id: '4', name: 'evening', start: 17, end: 22, selected: true }
  ] },
  { id: 'home-theatre', name: 'Home Theatre', watts: 200, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: true },
    { id: '2', name: 'morning', start: 6, end: 12, selected: false },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: false },
    { id: '4', name: 'evening', start: 17, end: 22, selected: true }
  ] },
  { id: 'washing-machine-semi', name: 'Washing Machine (Semi-Auto)', watts: 300, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
  { id: 'washing-machine-auto', name: 'Washing Machine (Auto)', watts: 1200, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
  { id: 'water-pump', name: 'Water Pump (0.5–1HP)', watts: 500, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
  { id: 'dstv-decoder', name: 'DSTV Decoder', watts: 20, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: true },
    { id: '2', name: 'morning', start: 6, end: 12, selected: false },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: false },
    { id: '4', name: 'evening', start: 17, end: 22, selected: true }
  ] },
  { id: 'wifi-router', name: 'Wi-Fi Router', watts: 15, category: 'home', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: true },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: true }
  ] },

  // Office Equipment
  { id: 'desktop-computer', name: 'Desktop Computer', watts: 250, category: 'office', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
  { id: 'office-laptop', name: 'Laptop', watts: 65, category: 'office', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
  { id: 'office-gaming-laptop', name: 'Gaming Laptop', watts: 200, category: 'office', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
  { id: 'inkjet-printer', name: 'Inkjet Printer', watts: 40, category: 'office', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
  { id: 'laser-printer', name: 'Laser Printer', watts: 400, category: 'office', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
  { id: 'photocopier', name: 'Photocopier', watts: 1500, category: 'office', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
  { id: 'scanner', name: 'Scanner', watts: 20, category: 'office', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
  { id: 'projector', name: 'Projector', watts: 250, category: 'office', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
  { id: 'office-fan', name: 'Office Fan', watts: 100, category: 'office', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
  { id: 'office-ac-1.5hp', name: 'Air Conditioner (1.5HP)', watts: 1500, category: 'office', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
  { id: 'paper-shredder', name: 'Paper Shredder', watts: 150, category: 'office', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
  { id: 'water-dispenser', name: 'Water Dispenser', watts: 700, category: 'office', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
  { id: 'charging-station', name: 'Charging Station', watts: 300, category: 'office', timeSlots: [
    { id: '1', name: 'night', start: 22, end: 6, selected: false },
    { id: '2', name: 'morning', start: 6, end: 12, selected: true },
    { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
    { id: '4', name: 'evening', start: 17, end: 22, selected: false }
  ] },
];

// Appliance Presets
export const appliancePresets = [
  {
    id: 'basic-home',
    name: 'Basic Home',
    description: 'LED Bulb (6pm-6am), Ceiling Fan (6pm-6am), Phone Charger (6pm-6am), TV (7pm-11pm)',
    appliances: [
      { id: 'led-bulb', name: 'LED Bulb', watts: 10, category: 'home', timeSlots: [
        { id: '1', name: 'night', start: 22, end: 6, selected: true },
        { id: '2', name: 'morning', start: 6, end: 12, selected: false },
        { id: '3', name: 'afternoon', start: 12, end: 17, selected: false },
        { id: '4', name: 'evening', start: 17, end: 22, selected: true }
      ] },
      { id: 'ceiling-fan', name: 'Ceiling Fan', watts: 80, category: 'home', timeSlots: [
        { id: '1', name: 'night', start: 22, end: 6, selected: true },
        { id: '2', name: 'morning', start: 6, end: 12, selected: false },
        { id: '3', name: 'afternoon', start: 12, end: 17, selected: false },
        { id: '4', name: 'evening', start: 17, end: 22, selected: true }
      ] },
      { id: 'phone-charger', name: 'Phone Charger', watts: 25, category: 'home', timeSlots: [
        { id: '1', name: 'night', start: 22, end: 6, selected: true },
        { id: '2', name: 'morning', start: 6, end: 12, selected: false },
        { id: '3', name: 'afternoon', start: 12, end: 17, selected: false },
        { id: '4', name: 'evening', start: 17, end: 22, selected: true }
      ] },
      { id: 'tv', name: 'TV (32–43 inch)', watts: 100, category: 'home', timeSlots: [
        { id: '1', name: 'night', start: 22, end: 6, selected: false },
        { id: '2', name: 'morning', start: 6, end: 12, selected: false },
        { id: '3', name: 'afternoon', start: 12, end: 17, selected: false },
        { id: '4', name: 'evening', start: 17, end: 22, selected: true }
      ] },
    ]
  },
  {
    id: 'family-home',
    name: 'Family Home',
    description: 'LED Bulb (6pm-6am), Ceiling Fan (6pm-6am), Refrigerator (24hrs), TV (7pm-11pm), Electric Kettle (6am-9am, 12pm-2pm), Washing Machine (6am-9am, 12pm-2pm)',
    appliances: [
      { id: 'led-bulb', name: 'LED Bulb', watts: 10, category: 'home', timeSlots: [
        { id: '1', name: 'night', start: 22, end: 6, selected: true },
        { id: '2', name: 'morning', start: 6, end: 12, selected: false },
        { id: '3', name: 'afternoon', start: 12, end: 17, selected: false },
        { id: '4', name: 'evening', start: 17, end: 22, selected: true }
      ] },
      { id: 'ceiling-fan', name: 'Ceiling Fan', watts: 80, category: 'home', timeSlots: [
        { id: '1', name: 'night', start: 22, end: 6, selected: true },
        { id: '2', name: 'morning', start: 6, end: 12, selected: true },
        { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
        { id: '4', name: 'evening', start: 17, end: 22, selected: true }
      ] },
      { id: 'refrigerator-small', name: 'Refrigerator (Small)', watts: 150, category: 'home', timeSlots: [
        { id: '1', name: 'night', start: 22, end: 6, selected: true },
        { id: '2', name: 'morning', start: 6, end: 12, selected: true },
        { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
        { id: '4', name: 'evening', start: 17, end: 22, selected: true }
      ] },
      { id: 'tv', name: 'TV (32–43 inch)', watts: 100, category: 'home', timeSlots: [
        { id: '1', name: 'night', start: 22, end: 6, selected: false },
        { id: '2', name: 'morning', start: 6, end: 12, selected: false },
        { id: '3', name: 'afternoon', start: 12, end: 17, selected: false },
        { id: '4', name: 'evening', start: 17, end: 22, selected: true }
      ] },
      { id: 'electric-kettle', name: 'Electric Kettle', watts: 2000, category: 'home', timeSlots: [
        { id: '1', name: 'night', start: 22, end: 6, selected: false },
        { id: '2', name: 'morning', start: 6, end: 12, selected: true },
        { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
        { id: '4', name: 'evening', start: 17, end: 22, selected: false }
      ] },
      { id: 'washing-machine-semi', name: 'Washing Machine (Semi-Auto)', watts: 300, category: 'home', timeSlots: [
        { id: '1', name: 'night', start: 22, end: 6, selected: false },
        { id: '2', name: 'morning', start: 6, end: 12, selected: true },
        { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
        { id: '4', name: 'evening', start: 17, end: 22, selected: false }
      ] },
    ]
  },
  {
    id: 'small-office',
    name: 'Small Office',
    description: 'Desktop Computer (8am-5pm), Office Fan (8am-5pm), Inkjet Printer (8am-5pm), Projector (8am-5pm), Water Dispenser (8am-5pm)',
    appliances: [
      { id: 'desktop-computer', name: 'Desktop Computer', watts: 250, category: 'office', timeSlots: [
        { id: '1', name: 'night', start: 22, end: 6, selected: false },
        { id: '2', name: 'morning', start: 6, end: 12, selected: true },
        { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
        { id: '4', name: 'evening', start: 17, end: 22, selected: false }
      ] },
      { id: 'office-fan', name: 'Office Fan', watts: 100, category: 'office', timeSlots: [
        { id: '1', name: 'night', start: 22, end: 6, selected: false },
        { id: '2', name: 'morning', start: 6, end: 12, selected: true },
        { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
        { id: '4', name: 'evening', start: 17, end: 22, selected: false }
      ] },
      { id: 'inkjet-printer', name: 'Inkjet Printer', watts: 40, category: 'office', timeSlots: [
        { id: '1', name: 'night', start: 22, end: 6, selected: false },
        { id: '2', name: 'morning', start: 6, end: 12, selected: true },
        { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
        { id: '4', name: 'evening', start: 17, end: 22, selected: false }
      ] },
      { id: 'projector', name: 'Projector', watts: 250, category: 'office', timeSlots: [
        { id: '1', name: 'night', start: 22, end: 6, selected: false },
        { id: '2', name: 'morning', start: 6, end: 12, selected: true },
        { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
        { id: '4', name: 'evening', start: 17, end: 22, selected: false }
      ] },
      { id: 'water-dispenser', name: 'Water Dispenser', watts: 700, category: 'office', timeSlots: [
        { id: '1', name: 'night', start: 22, end: 6, selected: false },
        { id: '2', name: 'morning', start: 6, end: 12, selected: true },
        { id: '3', name: 'afternoon', start: 12, end: 17, selected: true },
        { id: '4', name: 'evening', start: 17, end: 22, selected: false }
      ] },
    ]
  }
];