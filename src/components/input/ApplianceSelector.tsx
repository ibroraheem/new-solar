import React, { useState, useEffect } from 'react';
import { Search, Plus, Power, Clock, Trash2, X, CheckSquare, Square, Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { Appliance, ApplianceCategory, TimeSlot } from '../../types';
import { applianceCategories } from '../../data/appliances';

interface ApplianceSelectorProps {
  appliances: Appliance[];
  onAppliancesChange: (appliances: Appliance[]) => void;
  onTotalEnergyChange: (value: number) => void;
}

const TimeSlotIcon = ({ name }: { name: TimeSlot['name'] }) => {
  switch (name) {
    case 'morning':
      return <Sunrise className="h-4 w-4" />;
    case 'afternoon':
      return <Sun className="h-4 w-4" />;
    case 'evening':
      return <Sunset className="h-4 w-4" />;
    case 'night':
      return <Moon className="h-4 w-4" />;
  }
};

const ApplianceSelector: React.FC<ApplianceSelectorProps> = ({
  appliances,
  onAppliancesChange,
  onTotalEnergyChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('home');
  const [showAddCustomForm, setShowAddCustomForm] = useState(false);
  const [customAppliance, setCustomAppliance] = useState({
    name: '',
    watts: 0,
  });

  useEffect(() => {
    const totalEnergy = calculateTotalEnergy(appliances);
    onTotalEnergyChange(totalEnergy);
  }, [appliances, onTotalEnergyChange]);

  const filteredAppliances = appliances.filter((appliance) => {
    const matchesSearch = appliance.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || appliance.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedAppliances = appliances.filter((appliance) => appliance.isSelected);

  const handleToggleSelect = (id: string) => {
    const updatedAppliances = appliances.map((appliance) =>
      appliance.id === id ? { ...appliance, isSelected: !appliance.isSelected } : appliance
    );
    onAppliancesChange(updatedAppliances);
  };

  const handleToggleCritical = (id: string) => {
    const updatedAppliances = appliances.map((appliance) =>
      appliance.id === id ? { ...appliance, isCritical: !appliance.isCritical } : appliance
    );
    onAppliancesChange(updatedAppliances);
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    const updatedAppliances = appliances.map((appliance) =>
      appliance.id === id ? { ...appliance, quantity } : appliance
    );
    onAppliancesChange(updatedAppliances);
  };

  const handleTimeSlotToggle = (applianceId: string, slotId: string) => {
    const updatedAppliances = appliances.map((appliance) =>
      appliance.id === applianceId
        ? {
            ...appliance,
            timeSlots: appliance.timeSlots.map((slot) =>
              slot.id === slotId
                ? { ...slot, selected: !slot.selected, durationMinutes: slot.selected ? undefined : 60 }
                : slot
            ),
          }
        : appliance
    );
    onAppliancesChange(updatedAppliances);
  };

  const handleDurationChange = (applianceId: string, slotId: string, minutes: number) => {
    // Get the time slot to calculate max duration
    const appliance = appliances.find(a => a.id === applianceId);
    const timeSlot = appliance?.timeSlots.find(s => s.id === slotId);
    
    if (!appliance || !timeSlot) return;
    
    // Calculate max duration in minutes for this time slot
    const slotDuration = timeSlot.end > timeSlot.start 
      ? timeSlot.end - timeSlot.start 
      : (24 - timeSlot.start) + timeSlot.end;
    const maxMinutes = slotDuration * 60;
    
    // Validate input
    let validatedMinutes = Math.max(1, Math.min(minutes, maxMinutes));
    
    const updatedAppliances = appliances.map((appliance) =>
      appliance.id === applianceId
        ? {
            ...appliance,
            timeSlots: appliance.timeSlots.map((slot) =>
              slot.id === slotId
                ? { ...slot, durationMinutes: validatedMinutes }
                : slot
            ),
          }
        : appliance
    );
    onAppliancesChange(updatedAppliances);
  };

  const calculateDailyHours = (timeSlots: TimeSlot[]): number => {
    return timeSlots.reduce((total, slot) => {
      if (!slot.selected) return total;
      if (slot.durationMinutes) {
        return total + (slot.durationMinutes / 60);
      }
      const hours = slot.end > slot.start 
        ? slot.end - slot.start 
        : (24 - slot.start) + slot.end;
      return total + hours;
    }, 0);
  };

  const handleAddCustomAppliance = () => {
    if (!customAppliance.name || customAppliance.watts <= 0) return;
    
    const newAppliance: Appliance = {
      id: `custom-${Date.now()}`,
      name: customAppliance.name,
      watts: customAppliance.watts,
      quantity: 1,
      isSelected: true,
      isCritical: false,
      category: 'custom',
      timeSlots: [
        { id: '1', name: 'morning', start: 6, end: 12, selected: false },
        { id: '2', name: 'afternoon', start: 12, end: 17, selected: false },
        { id: '3', name: 'evening', start: 17, end: 22, selected: false },
        { id: '4', name: 'night', start: 22, end: 6, selected: false }
      ]
    };
    
    onAppliancesChange([...appliances, newAppliance]);
    setCustomAppliance({ name: '', watts: 0 });
    setShowAddCustomForm(false);
  };

  const handleRemoveAppliance = (id: string) => {
    const updatedAppliances = appliances.filter((appliance) => appliance.id !== id);
    onAppliancesChange(updatedAppliances);
  };

  const calculateDailyEnergy = (appliance: Appliance): number => {
    const hoursPerDay = calculateDailyHours(appliance.timeSlots);
    return (appliance.watts * appliance.quantity * hoursPerDay) / 1000;
  };

  const calculateTotalEnergy = (appliances: Appliance[]): number => {
    return appliances
      .filter((a) => a.isSelected)
      .reduce((sum, appliance) => sum + calculateDailyEnergy(appliance), 0);
  };

  const getTimeSlotDuration = (slot: TimeSlot): string => {
    const hours = slot.end > slot.start 
      ? slot.end - slot.start 
      : (24 - slot.start) + slot.end;
    return `${slot.start}:00-${slot.end}:00 (${hours}h max)`;
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Appliance-based Calculator</h3>
      
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            placeholder="Search appliances..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          className="border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:ring-green-500 focus:border-green-500"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {applianceCategories.map((category) => (
            <option key={category.key} value={category.key}>
              {category.name}
            </option>
          ))}
        </select>
        
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          onClick={() => setShowAddCustomForm(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Custom
        </button>
      </div>
      
      {showAddCustomForm && (
        <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Add Custom Appliance</h4>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={() => setShowAddCustomForm(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appliance Name
              </label>
              <input
                type="text"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500"
                value={customAppliance.name}
                onChange={(e) => setCustomAppliance({ ...customAppliance, name: e.target.value })}
                placeholder="e.g., Water Pump"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Power Rating (Watts)
              </label>
              <input
                type="number"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500"
                value={customAppliance.watts || ''}
                onChange={(e) => setCustomAppliance({ ...customAppliance, watts: Number(e.target.value) })}
                min="1"
                placeholder="e.g., 750"
              />
            </div>
          </div>
          
          <button
            type="button"
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            onClick={handleAddCustomAppliance}
          >
            Add Appliance
          </button>
        </div>
      )}
      
      <div className="mb-4">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Available Appliances</h4>
        <div className="border border-gray-200 rounded-md overflow-hidden max-h-60 overflow-y-auto">
          {filteredAppliances.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredAppliances.map((appliance) => (
                <li
                  key={appliance.id}
                  className={`p-3 hover:bg-gray-50 flex items-center justify-between ${
                    appliance.isSelected ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => handleToggleSelect(appliance.id)}
                      className="mr-2 text-gray-500 hover:text-green-600"
                    >
                      {appliance.isSelected ? (
                        <CheckSquare className="h-5 w-5 text-green-500" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                    <span className="font-medium">{appliance.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm mr-4 flex items-center">
                      <Power className="h-4 w-4 mr-1" />
                      {appliance.watts}W
                    </span>
                    {appliance.category === 'custom' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAppliance(appliance.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-gray-500 text-center">No appliances found</p>
          )}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-sm text-gray-700 mb-2">Selected Appliances</h4>
        {selectedAppliances.length > 0 ? (
          <div className="border border-gray-200 rounded-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appliance
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Power
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Slots
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Daily
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Critical
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedAppliances.map((appliance) => (
                  <tr key={appliance.id}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {appliance.name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {appliance.watts}W
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      <input
                        type="number"
                        min="1"
                        max="99"
                        className="w-12 border border-gray-300 rounded-md shadow-sm p-1 text-center"
                        value={appliance.quantity}
                        onChange={(e) => handleQuantityChange(appliance.id, parseInt(e.target.value))}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-wrap gap-2">
                        {appliance.timeSlots.map((slot) => (
                          <div key={slot.id} className="relative group">
                            <button
                              onClick={() => handleTimeSlotToggle(appliance.id, slot.id)}
                              className={`p-1.5 rounded ${
                                slot.selected
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-gray-100 text-gray-400'
                              } hover:bg-green-50`}
                              title={getTimeSlotDuration(slot)}
                            >
                              <TimeSlotIcon name={slot.name} />
                            </button>
                            {slot.selected && (
                              <div className="mt-1">
                                <input
                                  type="number"
                                  min="1"
                                  max={
                                    (slot.end > slot.start 
                                      ? slot.end - slot.start 
                                      : (24 - slot.start) + slot.end) * 60
                                  }
                                  className="w-16 border border-gray-300 rounded-md shadow-sm p-1 text-center text-sm"
                                  placeholder="mins"
                                  value={slot.durationMinutes || ''}
                                  onChange={(e) => handleDurationChange(appliance.id, slot.id, parseInt(e.target.value))}
                                />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  {getTimeSlotDuration(slot)}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {calculateDailyEnergy(appliance).toFixed(2)} kWh
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      <button
                        type="button"
                        onClick={() => handleToggleCritical(appliance.id)}
                        className={`${
                          appliance.isCritical ? 'text-orange-500' : 'text-gray-300'
                        } hover:text-orange-600`}
                      >
                        <CheckSquare className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-3 py-2 text-sm font-medium text-gray-700 text-right">
                    Total Daily Energy:
                  </td>
                  <td colSpan={2} className="px-3 py-2 text-sm font-bold text-green-700">
                    {calculateTotalEnergy(appliances).toFixed(2)} kWh
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="p-4 text-gray-500 text-center border border-gray-200 rounded-md">
            No appliances selected
          </p>
        )}
        
        <div className="mt-2 text-sm text-gray-600 flex items-center gap-4">
          <div className="flex items-center">
            <CheckSquare className="h-4 w-4 text-orange-500 mr-1" />
            <span>Critical loads</span>
          </div>
          <div className="flex items-center">
            <Moon className="h-4 w-4 text-blue-500 mr-1" />
            <span>Night-time loads</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplianceSelector;