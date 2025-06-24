import React, { useState } from 'react';
import { Appliance } from '../../types';
import { appliancePresets } from '../../data/appliances';

interface PresetSelectorProps {
  onPresetSelect: (appliances: Appliance[]) => void;
  existingAppliances: Appliance[];
}

const PresetSelector: React.FC<PresetSelectorProps> = ({
  onPresetSelect,
  existingAppliances,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const getCategoryIcon = (presetId: string) => {
    switch (presetId) {
      case 'basic-home':
        return '🏠';
      case 'family-home':
        return '👨‍👩‍👧‍👦';
      case 'small-office':
        return '💼';
      default:
        return '🔌';
    }
  };

  const handlePresetSelect = (preset: any) => {
    // Convert preset appliances to full Appliance objects
    const fullAppliances: Appliance[] = preset.appliances.map((appliance: any, index: number) => ({
      id: `preset-${preset.id}-${index}`,
      name: appliance.name || '',
      watts: appliance.watts || 0,
      quantity: appliance.quantity || 1,
      isSelected: true,
      isCritical: appliance.isCritical || false,
      category: appliance.category || 'home',
      timeSlots: appliance.timeSlots || [
        { id: '1', name: 'morning', start: 6, end: 12, selected: false },
        { id: '2', name: 'afternoon', start: 12, end: 17, selected: false },
        { id: '3', name: 'evening', start: 17, end: 22, selected: false },
        { id: '4', name: 'night', start: 22, end: 6, selected: false }
      ]
    }));

    // Merge with existing appliances: if exists, update and select; if not, add
    const updatedAppliances = [...existingAppliances];
    fullAppliances.forEach(presetApp => {
      const idx = updatedAppliances.findIndex(a => a.name.toLowerCase() === presetApp.name.toLowerCase());
      if (idx !== -1) {
        // Update existing appliance: select and update properties
        updatedAppliances[idx] = {
          ...updatedAppliances[idx],
          ...presetApp,
          isSelected: true
        };
      } else {
        updatedAppliances.push(presetApp);
      }
    });

    onPresetSelect(updatedAppliances);
    setSelectedPreset(preset.id);
  };

  const categories = [
    { key: 'basic', name: 'Basic', icon: '🏠' },
    { key: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦' },
    { key: 'off-grid', name: 'Off-Grid', icon: '🏔' },
    { key: 'business', name: 'Business', icon: '💼' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-green-600">⚡</span>
        <h4 className="text-sm font-medium text-gray-900">Quick Setup Presets</h4>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {appliancePresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetSelect(preset)}
            className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
              selectedPreset === preset.id
                ? 'border-green-500 bg-green-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getCategoryIcon(preset.id)}
                <span className="font-medium text-sm">{preset.name}</span>
              </div>
              {selectedPreset === preset.id && (
                <span className="text-green-600">✔️</span>
              )}
            </div>
            <p className="text-xs text-gray-600 mb-2">{preset.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {preset.appliances.length} appliances
              </span>
              <span className="text-xs text-green-600 font-medium">
                Load Preset
              </span>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-700">
          💡 Presets will add appliances to your current selection. You can customize time slots and quantities after loading.
        </p>
      </div>
    </div>
  );
};

export default PresetSelector; 