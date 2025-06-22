import React from 'react';
import { Zap, Sun, Battery, TrendingUp, AlertTriangle } from 'lucide-react';

interface EnergySummaryProps {
  totalDailyEnergy: number;
  solarOutput: number;
  batteryCapacity: number;
  systemSize: number;
  isMobile?: boolean;
}

const EnergySummary: React.FC<EnergySummaryProps> = ({
  totalDailyEnergy,
  solarOutput,
  batteryCapacity,
  systemSize,
  isMobile = false,
}) => {
  const energyDeficit = totalDailyEnergy - solarOutput;
  const hasDeficit = energyDeficit > 0;
  const batteryDays = batteryCapacity / totalDailyEnergy;

  const getStatusColor = (value: number, threshold: number) => {
    if (value >= threshold) return 'text-green-600';
    if (value >= threshold * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (value: number, threshold: number) => {
    if (value >= threshold) return <Sun className="h-4 w-4 text-green-600" />;
    if (value >= threshold * 0.8) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  if (isMobile) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Energy Summary</h3>
        
        <div className="space-y-3">
          {/* Daily Energy Need */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Daily Need</span>
            </div>
            <span className="text-lg font-bold text-blue-700">
              {totalDailyEnergy.toFixed(1)} kWh
            </span>
          </div>

          {/* Solar Output */}
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(solarOutput, totalDailyEnergy)}
              <span className="text-sm font-medium text-gray-700">Solar Output</span>
            </div>
            <span className={`text-lg font-bold ${getStatusColor(solarOutput, totalDailyEnergy)}`}>
              {solarOutput.toFixed(1)} kWh
            </span>
          </div>

          {/* Battery Capacity */}
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Battery className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Battery</span>
            </div>
            <span className="text-lg font-bold text-purple-700">
              {batteryCapacity.toFixed(1)} kWh
            </span>
          </div>

          {/* System Size */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">System Size</span>
            </div>
            <span className="text-lg font-bold text-gray-700">
              {systemSize.toFixed(1)} kW
            </span>
          </div>
        </div>

        {/* Status Summary */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            {hasDeficit ? (
              <span className="text-sm text-red-600 font-medium">Needs Optimization</span>
            ) : (
              <span className="text-sm text-green-600 font-medium">Well Sized</span>
            )}
          </div>
          
          {hasDeficit && (
            <p className="text-xs text-red-600">
              Energy deficit: {energyDeficit.toFixed(1)} kWh/day
            </p>
          )}
          
          <p className="text-xs text-gray-600 mt-1">
            Battery backup: {batteryDays.toFixed(1)} days
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Energy Summary</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Energy Need */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-700">
            {totalDailyEnergy.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">kWh/day</div>
          <div className="text-xs text-gray-500 mt-1">Energy Need</div>
        </div>

        {/* Solar Output */}
        <div className="text-center p-4 bg-green-50 rounded-lg">
          {getStatusIcon(solarOutput, totalDailyEnergy)}
          <div className={`text-2xl font-bold ${getStatusColor(solarOutput, totalDailyEnergy)}`}>
            {solarOutput.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">kWh/day</div>
          <div className="text-xs text-gray-500 mt-1">Solar Output</div>
        </div>

        {/* Battery Capacity */}
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <Battery className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-700">
            {batteryCapacity.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">kWh</div>
          <div className="text-xs text-gray-500 mt-1">Battery Capacity</div>
        </div>

        {/* System Size */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <TrendingUp className="h-8 w-8 text-gray-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-700">
            {systemSize.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">kW</div>
          <div className="text-xs text-gray-500 mt-1">System Size</div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-700">System Status: </span>
            {hasDeficit ? (
              <span className="text-sm text-red-600 font-medium">Needs Optimization</span>
            ) : (
              <span className="text-sm text-green-600 font-medium">Well Sized</span>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Battery backup: <span className="font-medium">{batteryDays.toFixed(1)} days</span>
            </div>
            {hasDeficit && (
              <div className="text-sm text-red-600">
                Deficit: {energyDeficit.toFixed(1)} kWh/day
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergySummary; 