import React, { useState, useEffect } from 'react';
import { defaultAppliances } from '../../data/appliances';
import { Appliance, LocationData } from '../../types';
import { VALIDATION_CONSTANTS } from '../../utils/constants';
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
  const [applianceEnergy, setApplianceEnergy] = useState(0);
  const [appliances, setAppliances] = useState<Appliance[]>(defaultAppliances);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [backupHours, setBackupHours] = useState(8);
  const [isReadyToCalculate, setIsReadyToCalculate] = useState(false);

  // Ensure backup hours stays within valid range using centralized constants
  const handleBackupHoursChange = (hours: number) => {
    const validHours = Math.max(VALIDATION_CONSTANTS.MIN_BACKUP_HOURS, Math.min(VALIDATION_CONSTANTS.MAX_BACKUP_HOURS, hours));
    setBackupHours(validHours);
  };

  // Calculate critical load energy
  const criticalLoadEnergy = appliances
    .filter((a) => a.isSelected && a.isCritical)
    .reduce((sum, appliance) => {
      const hoursPerDay = appliance.timeSlots
        .filter(slot => slot.selected)
        .reduce((hours, slot) => {
          if (slot.durationMinutes) {
            return hours + (slot.durationMinutes / 60);
          }
          const slotHours = slot.end > slot.start 
            ? slot.end - slot.start 
            : (24 - slot.start) + slot.end;
          return hours + slotHours;
        }, 0);
      return sum + (appliance.watts * appliance.quantity * hoursPerDay) / 1000;
    }, 0);

  // Check if ready to calculate
  useEffect(() => {
    setIsReadyToCalculate(!!location && applianceEnergy > 0);
  }, [location, applianceEnergy]);

  const handleLocationSelect = (locationData: { latitude: number; longitude: number }) => {
    // Find the city name from the coordinates or use a generic name
    const cityName = `Location (${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)})`;
    setLocation({
      city: cityName,
      latitude: locationData.latitude,
      longitude: locationData.longitude
    });
  };

  const handleCalculate = () => {
    if (!location || applianceEnergy <= 0) return;
    
    onCalculate({
      dailyEnergyDemand: applianceEnergy,
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
              Build your energy profile and calculate the perfect solar setup for your Nigerian home or business
            </p>
          </div>
          
          {/* Appliance Load Profile */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Build Your Energy Profile</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select your appliances and set their usage patterns to calculate your daily energy consumption accurately.
            </p>
            
            <ApplianceSelector
              appliances={appliances}
              onAppliancesChange={setAppliances}
              onTotalEnergyChange={setApplianceEnergy}
            />
          </div>
          
          {/* Location & Backup Duration */}
          <LocationInput
            onLocationSelect={handleLocationSelect}
          />
          
          <BackupDurationInput
            backupHours={backupHours}
            onChange={handleBackupHoursChange}
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
                {!location ? 'Please select your location to continue' : 'Please add appliances to your energy profile'}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InputSection;