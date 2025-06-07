import React from 'react';
import { Battery, Sun } from 'lucide-react';

interface BackupDurationInputProps {
  backupHours: number;
  onChange: (hours: number) => void;
}

const BackupDurationInput: React.FC<BackupDurationInputProps> = ({ backupHours, onChange }) => {
  // Ensure backupHours is within valid range
  const validBackupHours = Math.max(8, Math.min(24, backupHours));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    // Ensure the value is within the valid range
    const validValue = Math.max(8, Math.min(24, value));
    onChange(validValue);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-gray-700 text-sm font-medium">
          Backup Duration (Hours)
        </label>
        <div className="flex items-center">
          <Sun className="h-4 w-4 text-yellow-500 mr-1" />
          <span className="text-sm text-gray-500">Nigeria gets 3-6 hours of peak sun daily</span>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Battery className="h-5 w-5 text-green-500 mr-2" />
            <span className="font-medium">{validBackupHours} Hours</span>
          </div>
          <span className="text-sm text-gray-500">
            {getBackupDescription(validBackupHours)}
          </span>
        </div>
        
        <input
          type="range"
          min="8"
          max="24"
          step="4"
          value={validBackupHours}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
        />
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>8h</span>
          <span>12h</span>
          <span>16h</span>
          <span>20h</span>
          <span>24h</span>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>{getBackupRecommendation(validBackupHours)}</p>
        <p className="text-green-600">
          Note: Nigeria receives consistent sunlight year-round, with 3-6 hours of peak sun daily. 
          Our calculations are based on the worst-month scenario to ensure reliability.
        </p>
      </div>
    </div>
  );
};

function getBackupDescription(hours: number): string {
  if (hours <= 8) return "Night-time backup";
  if (hours <= 12) return "Extended backup";
  if (hours <= 16) return "Full day backup";
  return "24-hour backup";
}

function getBackupRecommendation(hours: number): string {
  if (hours <= 8) {
    return "Optimized for night-time use (6pm-6am). Perfect for homes with reliable daytime solar generation.";
  } else if (hours <= 12) {
    return "Balanced option providing extended evening and early morning coverage. Most cost-effective for typical Nigerian homes.";
  } else if (hours <= 16) {
    return "Full day coverage with extra capacity for occasional cloudy days. Recommended for areas with variable weather.";
  } else {
    return "Maximum backup for critical applications. Consider reducing to 12-16 hours for better cost-efficiency in most cases.";
  }
}

export default BackupDurationInput;