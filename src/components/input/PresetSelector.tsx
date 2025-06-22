import React, { useState } from 'react';
import { Home, Users, Mountain, Briefcase, Zap, Check } from 'lucide-react';
import { Appliance } from '../../types';
import { appliancePresets, AppliancePreset } from '../../data/appliancePresets';

interface PresetSelectorProps {
  onPresetSelect: (appliances: Appliance[]) => void;
  existingAppliances: Appliance[];
}

const PresetSelector: React.FC<PresetSelectorProps> = ({
  onPresetSelect,
  existingAppliances,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const getCategoryIcon = (category: AppliancePreset['category']) => {
    switch (category) {
      case 'basic':
        return <Home className="h-4 w-4" />;
      case 'family':
        return <Users className="h-4 w-4" />;
      case 'off-grid':
        return <Mountain className="h-4 w-4" />;
      case 'business':
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const handlePresetSelect = (preset: AppliancePreset) => {
    // Convert preset appliances to full Appliance objects
    const fullAppliances: Appliance[] = preset.appliances.map((appliance, index) => ({
      id: `preset-${preset.id}-${index}`,
      name: appliance.name || '',
      watts: appliance.watts || 0,
      quantity: appliance.quantity || 1,
      isSelected: true,
      isCritical: appliance.isCritical || false,
      category: appliance.category || 'home',
      timeSlots: [
        { id: '1', name: 'morning', start: 6, end: 12, selected: false },
        { id: '2', name: 'afternoon', start: 12, end: 17, selected: false },
        { id: '3', name: 'evening', start: 17, end: 22, selected: false },
        { id: '4', name: 'night', start: 22, end: 6, selected: false }
      ]
    }));

    // Merge with existing appliances, avoiding duplicates
    const existingNames = existingAppliances.map(a => a.name.toLowerCase());
    const newAppliances = fullAppliances.filter(a => 
      !existingNames.includes(a.name.toLowerCase())
    );

    const mergedAppliances = [...existingAppliances, ...newAppliances];
    onPresetSelect(mergedAppliances);
    setSelectedPreset(preset.id);
  };

  const categories = [
    { key: 'basic', name: 'Basic', icon: <Home className="h-4 w-4" /> },
    { key: 'family', name: 'Family', icon: <Users className="h-4 w-4" /> },
    { key: 'off-grid', name: 'Off-Grid', icon: <Mountain className="h-4 w-4" /> },
    { key: 'business', name: 'Business', icon: <Briefcase className="h-4 w-4" /> },
  ];

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-5 w-5 text-green-600" />
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
                {getCategoryIcon(preset.category)}
                <span className="font-medium text-sm">{preset.name}</span>
              </div>
              {selectedPreset === preset.id && (
                <Check className="h-4 w-4 text-green-600" />
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