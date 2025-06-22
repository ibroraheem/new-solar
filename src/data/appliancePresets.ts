import { Appliance } from '../types';

export interface AppliancePreset {
  id: string;
  name: string;
  description: string;
  appliances: Partial<Appliance>[];
  category: 'basic' | 'family' | 'off-grid' | 'business';
}

export const appliancePresets: AppliancePreset[] = [
  {
    id: 'basic-home',
    name: 'Basic Home',
    description: 'Essential appliances for a small household',
    category: 'basic',
    appliances: [
      { name: 'Refrigerator', watts: 150, quantity: 1, isCritical: true },
      { name: 'LED Lights', watts: 10, quantity: 8 },
      { name: 'Phone Charger', watts: 5, quantity: 2 },
      { name: 'Laptop', watts: 50, quantity: 1 },
      { name: 'WiFi Router', watts: 10, quantity: 1 },
    ]
  },
  {
    id: 'family-home',
    name: 'Family Home',
    description: 'Complete setup for a family of 4',
    category: 'family',
    appliances: [
      { name: 'Refrigerator', watts: 150, quantity: 1, isCritical: true },
      { name: 'LED Lights', watts: 10, quantity: 12 },
      { name: 'Phone Charger', watts: 5, quantity: 4 },
      { name: 'Laptop', watts: 50, quantity: 2 },
      { name: 'WiFi Router', watts: 10, quantity: 1 },
      { name: 'TV', watts: 100, quantity: 1 },
      { name: 'Microwave', watts: 1100, quantity: 1 },
      { name: 'Coffee Maker', watts: 900, quantity: 1 },
      { name: 'Washing Machine', watts: 500, quantity: 1 },
      { name: 'Electric Kettle', watts: 1500, quantity: 1 },
    ]
  },
  {
    id: 'off-grid-cabin',
    name: 'Off-Grid Cabin',
    description: 'Minimal setup for remote living',
    category: 'off-grid',
    appliances: [
      { name: 'LED Lights', watts: 5, quantity: 4 },
      { name: 'Phone Charger', watts: 5, quantity: 1 },
      { name: 'Laptop', watts: 50, quantity: 1 },
      { name: 'Small Fridge', watts: 80, quantity: 1, isCritical: true },
      { name: 'Water Pump', watts: 750, quantity: 1, isCritical: true },
      { name: 'Electric Kettle', watts: 1500, quantity: 1 },
    ]
  },
  {
    id: 'home-office',
    name: 'Home Office',
    description: 'Setup for remote work',
    category: 'business',
    appliances: [
      { name: 'LED Lights', watts: 10, quantity: 6 },
      { name: 'Laptop', watts: 50, quantity: 1 },
      { name: 'Monitor', watts: 30, quantity: 1 },
      { name: 'WiFi Router', watts: 10, quantity: 1 },
      { name: 'Phone Charger', watts: 5, quantity: 1 },
      { name: 'Coffee Maker', watts: 900, quantity: 1 },
      { name: 'Small Fridge', watts: 80, quantity: 1 },
    ]
  },
  {
    id: 'emergency-backup',
    name: 'Emergency Backup',
    description: 'Critical loads for power outages',
    category: 'basic',
    appliances: [
      { name: 'Refrigerator', watts: 150, quantity: 1, isCritical: true },
      { name: 'LED Lights', watts: 10, quantity: 4 },
      { name: 'Phone Charger', watts: 5, quantity: 2 },
      { name: 'WiFi Router', watts: 10, quantity: 1 },
      { name: 'Medical Device', watts: 100, quantity: 1, isCritical: true },
    ]
  }
];

export const getPresetById = (id: string): AppliancePreset | undefined => {
  return appliancePresets.find(preset => preset.id === id);
};

export const getPresetsByCategory = (category: AppliancePreset['category']): AppliancePreset[] => {
  return appliancePresets.filter(preset => preset.category === category);
}; 