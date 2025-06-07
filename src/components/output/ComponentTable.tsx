import React from 'react';
import { SolarComponents } from '../../types';
import { Sun, Battery, Zap, PenTool, Cable, Power } from 'lucide-react';

interface ComponentTableProps {
  components: SolarComponents;
  dailyEnergyDemand: number;
}

const ComponentTable: React.FC<ComponentTableProps> = ({ components, dailyEnergyDemand }) => {
  // Format battery configuration display
  const getBatteryConfig = () => {
    if (components.batteryConfiguration.totalBatteries === 1) {
      return `${((components.batteryConfiguration.capacityAh * components.systemVoltage) / 1000).toFixed(1)}kWh`;
    }
    return `${components.batteryConfiguration.series} series × ${components.batteryConfiguration.parallel} parallel (${components.batteryConfiguration.totalBatteries} total)`;
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommended System Components</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Overview */}
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="bg-green-50 px-4 py-3 border-b border-gray-200">
            <h4 className="font-medium text-green-800">System Overview</h4>
          </div>
          <div className="p-4">
            <table className="min-w-full">
              <tbody>
                <tr>
                  <td className="py-2 text-gray-600">Daily Energy Consumption:</td>
                  <td className="py-2 font-medium text-gray-900">{dailyEnergyDemand.toFixed(2)} kWh/day</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">System Voltage:</td>
                  <td className="py-2 font-medium text-gray-900">{components.systemVoltage}V DC</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Total Solar Capacity:</td>
                  <td className="py-2 font-medium text-gray-900">{components.solarPanels.totalWattage/1000}kW<sub>p</sub></td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Total Battery Capacity:</td>
                  <td className="py-2 font-medium text-gray-900">{getBatteryConfig()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Inverter */}
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 border-b border-gray-200 flex items-center">
            <Zap className="h-5 w-5 text-blue-500 mr-2" />
            <h4 className="font-medium text-blue-800">Inverter</h4>
          </div>
          <div className="p-4">
            <table className="min-w-full">
              <tbody>
                <tr>
                  <td className="py-2 text-gray-600">Rating:</td>
                  <td className="py-2 font-medium text-gray-900">{components.inverterRating/1000}kVA</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Type:</td>
                  <td className="py-2 font-medium text-gray-900">Hybrid Inverter</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Input Voltage:</td>
                  <td className="py-2 font-medium text-gray-900">{components.systemVoltage}V DC</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Output Voltage:</td>
                  <td className="py-2 font-medium text-gray-900">230V AC</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Solar Panels */}
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="bg-yellow-50 px-4 py-3 border-b border-gray-200 flex items-center">
            <Sun className="h-5 w-5 text-yellow-500 mr-2" />
            <h4 className="font-medium text-yellow-800">Solar Panels</h4>
          </div>
          <div className="p-4">
            <table className="min-w-full">
              <tbody>
                <tr>
                  <td className="py-2 text-gray-600">Panel Wattage:</td>
                  <td className="py-2 font-medium text-gray-900">{components.solarPanels.wattage}W</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Number of Panels:</td>
                  <td className="py-2 font-medium text-gray-900">{components.solarPanels.count}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Total Capacity:</td>
                  <td className="py-2 font-medium text-gray-900">{components.solarPanels.totalWattage/1000}kW<sub>p</sub></td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Type:</td>
                  <td className="py-2 font-medium text-gray-900">Monocrystalline</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Batteries */}
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="bg-purple-50 px-4 py-3 border-b border-gray-200 flex items-center">
            <Battery className="h-5 w-5 text-purple-500 mr-2" />
            <h4 className="font-medium text-purple-800">Batteries</h4>
          </div>
          <div className="p-4">
            <table className="min-w-full">
              <tbody>
                <tr>
                  <td className="py-2 text-gray-600">Type:</td>
                  <td className="py-2 font-medium text-gray-900">{components.batteryType}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Capacity:</td>
                  <td className="py-2 font-medium text-gray-900">
                    
                    {((components.batteryConfiguration.capacityAh * components.systemVoltage) / 1000).toFixed(1)}kWh
                  </td>
                </tr>
                {components.batteryConfiguration.totalBatteries > 1 && (
                  <>
                    <tr>
                      <td className="py-2 text-gray-600">Configuration:</td>
                      <td className="py-2 font-medium text-gray-900">
                        {components.batteryConfiguration.series} series × 
                        {components.batteryConfiguration.parallel} parallel
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">Total Units:</td>
                      <td className="py-2 font-medium text-gray-900">
                        {components.batteryConfiguration.totalBatteries}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Charge Controller */}
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="bg-green-50 px-4 py-3 border-b border-gray-200 flex items-center">
            <PenTool className="h-5 w-5 text-green-500 mr-2" />
            <h4 className="font-medium text-green-800">Charge Controller</h4>
          </div>
          <div className="p-4">
            <table className="min-w-full">
              <tbody>
                <tr>
                  <td className="py-2 text-gray-600">Type:</td>
                  <td className="py-2 font-medium text-gray-900">{components.chargeController.type}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Rating:</td>
                  <td className="py-2 font-medium text-gray-900">{components.chargeController.rating}A</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">System Voltage:</td>
                  <td className="py-2 font-medium text-gray-900">{components.systemVoltage}V</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Cables & Protection */}
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="bg-orange-50 px-4 py-3 border-b border-gray-200 flex items-center">
            <Cable className="h-5 w-5 text-orange-500 mr-2" />
            <h4 className="font-medium text-orange-800">Cables & Protection</h4>
          </div>
          <div className="p-4">
            <table className="min-w-full">
              <tbody>
                <tr>
                  <td className="py-2 text-gray-600">DC Cable Size:</td>
                  <td className="py-2 font-medium text-gray-900">{components.cables.dcSize} mm²</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">AC Cable Size:</td>
                  <td className="py-2 font-medium text-gray-900">{components.cables.acSize} mm²</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">DC Breaker Rating:</td>
                  <td className="py-2 font-medium text-gray-900">{components.breakers.dcRating}A</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">AC Breaker Rating:</td>
                  <td className="py-2 font-medium text-gray-900">{components.breakers.acRating}A</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Additional Components */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-2">Additional Recommended Components</h4>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>Surge Protection Device (SPD)</li>
          {components.otherComponents.avr && <li>Automatic Voltage Regulator (AVR)</li>}
          <li>AC & DC Disconnects</li>
          <li>Proper Earthing System</li>
          <li>Lightning Arrestor</li>
        </ul>
      </div>
    </div>
  );
};

export default ComponentTable;