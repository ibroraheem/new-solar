import React, { useState } from 'react';
import { Zap } from 'lucide-react';

interface ManualInputProps {
  initialValue: number;
  onEnergyUpdate: (value: number) => void;
}

const ManualInput: React.FC<ManualInputProps> = ({ initialValue, onEnergyUpdate }) => {
  const [energyValue, setEnergyValue] = useState(initialValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setEnergyValue(isNaN(value) ? 0 : value);
    onEnergyUpdate(isNaN(value) ? 0 : value);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Manual Energy Input</h3>
      
      <div className="mb-4">
        <label htmlFor="manual-energy" className="block text-gray-700 text-sm font-medium mb-2">
          Daily Energy Consumption (kWh)
        </label>
        <div className="relative mt-1 rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Zap className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="number"
            id="manual-energy"
            className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            placeholder="Enter value"
            min="0"
            step="0.1"
            value={energyValue || ''}
            onChange={handleInputChange}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">kWh/day</span>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-600">
        Enter your total daily energy consumption in kilowatt-hours (kWh).
        If you're not sure, use the appliance-based calculator for a detailed estimation.
      </p>
    </div>
  );
};

export default ManualInput;