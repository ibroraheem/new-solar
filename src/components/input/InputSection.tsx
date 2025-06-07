import React, { useState, useEffect } from 'react';
import { defaultAppliances } from '../../data/appliances';
import { Appliance, LocationData } from '../../types';
import ManualInput from './ManualInput';
import ApplianceSelector from './ApplianceSelector';
import LocationInput from './LocationInput';
import BackupDurationInput from './BackupDurationInput';

interface InputSectionProps {
  onCalculate: (params: {
    dailyEnergyDemand: number;
    location: LocationData;
    backupHours: number;
    appliances: Appliance[];
  }) => void;
}

const InputSection: React.FC<InputSectionProps> = ({ onCalculate }) => {
  const [inputMethod, setInputMethod] = useState<'manual' | 'appliance'>('manual');
  const [manualEnergy, setManualEnergy] = useState(5); 
  const [applianceEnergy, setApplianceEnergy] = useState(0);
  const [appliances, setAppliances] = useState<Appliance[]>(defaultAppliances);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [backupHours, setBackupHours] = useState(8);
  const [isReadyToCalculate, setIsReadyToCalculate] = useState(false);

  // Calculate critical load energy
  const criticalLoadEnergy = appliances
    .filter((a) => a.isSelected && a.isCritical)
    .reduce((sum, appliance) => {
      return sum + (appliance.watts * appliance.quantity * appliance.hoursPerDay) / 1000;
    }, 0);

  // Check if ready to calculate
  useEffect(() => {
    setIsReadyToCalculate(!!location);
  }, [location]);

  const handleCalculate = () => {
    if (!location) return;
    
    onCalculate({
      dailyEnergyDemand: inputMethod === 'manual' ? manualEnergy : applianceEnergy,
      location,
      backupHours,
      appliances,
    });
  };

  return (
    <section id="calculator" className="bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Solar System Calculator</h2>
            <p className="mt-2 text-gray-600">
              Calculate the perfect solar setup for your Nigerian home or business
            </p>
          </div>
          
          {/* Input Method Selector */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="inline-flex items-center flex-1">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-green-600"
                  name="input-method"
                  checked={inputMethod === 'manual'}
                  onChange={() => setInputMethod('manual')}
                />
                <span className="ml-2 text-gray-700">
                  Manual Input
                  <span className="block text-sm text-gray-500">
                    Enter your daily energy consumption directly
                  </span>
                </span>
              </label>
              <label className="inline-flex items-center flex-1">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-green-600"
                  name="input-method"
                  checked={inputMethod === 'appliance'}
                  onChange={() => setInputMethod('appliance')}
                />
                <span className="ml-2 text-gray-700">
                  Appliance Calculator
                  <span className="block text-sm text-gray-500">
                    Build your energy profile by selecting appliances
                  </span>
                </span>
              </label>
            </div>
          </div>
          
          {/* Input Forms */}
          {inputMethod === 'manual' ? (
            <ManualInput
              initialValue={manualEnergy}
              onEnergyUpdate={setManualEnergy}
            />
          ) : (
            <ApplianceSelector
              appliances={appliances}
              onAppliancesChange={setAppliances}
              onTotalEnergyChange={setApplianceEnergy}
            />
          )}
          
          {/* Location & Backup Duration */}
          <LocationInput
            onLocationSelect={setLocation}
            selectedLocation={location}
          />
          
          <BackupDurationInput
            backupHours={backupHours}
            onChange={setBackupHours}
          />
          
          {/* Calculate Button */}
          <div className="text-center">
            <button
              type="button"
              className={`px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-md ${
                isReadyToCalculate
                  ? 'bg-green-600 hover:bg-green-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isReadyToCalculate}
              onClick={handleCalculate}
            >
              Calculate Your Solar System
            </button>
            
            {!isReadyToCalculate && (
              <p className="mt-2 text-sm text-orange-600">
                Please select your location to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InputSection;