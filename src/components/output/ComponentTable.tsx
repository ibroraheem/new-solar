import React from 'react';
import { SolarComponents, Appliance } from '../../types';
import { calculateEnergyDemand } from '../../utils/calculations';

interface ComponentTableProps {
  components: SolarComponents;
  appliances: Appliance[];
}

const ComponentTable: React.FC<ComponentTableProps> = ({ components, appliances }) => {
  // Calculate daily energy demand from appliances
  const dailyEnergyDemand = calculateEnergyDemand(appliances);

  // Format battery configuration display
  const getBatteryConfig = () => {
    const singleBatteryCapacity = (components.batteryConfiguration.capacityAh * components.systemVoltage) / 1000;
    const totalCapacity = singleBatteryCapacity * components.batteryConfiguration.parallel;
    
    if (components.batteryConfiguration.totalBatteries === 1) {
      return `${totalCapacity.toFixed(1)}kWh`;
    }
    return `${totalCapacity.toFixed(1)}kWh (${components.batteryConfiguration.series} series × ${components.batteryConfiguration.parallel} parallel)`;
  };

  // Calculate total battery capacity
  const getTotalBatteryCapacity = () => {
    const singleBatteryCapacity = (components.batteryConfiguration.capacityAh * components.systemVoltage) / 1000;
    return singleBatteryCapacity * components.batteryConfiguration.parallel;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Your System Includes</h2>
        <p className="text-sm text-gray-600 mb-4">A modern, reliable solar solution tailored to your needs</p>
      </div>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* System Overview Card */}
        <div className="rounded-xl bg-blue-50 p-5 shadow flex flex-col items-start">
          ⚡
          <div className="font-semibold text-blue-900 text-lg mb-1">System Overview</div>
          <div className="text-blue-800 text-sm mb-1">{components.systemSize.kwp.toFixed(1)}kWp System</div>
          <div className="text-xs text-blue-600">Daily Energy: {dailyEnergyDemand.toFixed(1)}kWh</div>
        </div>
        {/* Inverter Card */}
        <div className="rounded-xl bg-white p-5 shadow flex flex-col items-start border border-blue-100">
          🔌
          <div className="font-semibold text-blue-900 text-lg mb-1">Inverter</div>
          <div className="text-gray-700 text-sm mb-1">{components.inverter.name}</div>
          <div className="text-xs text-gray-500">{components.inverter.watts}W, {components.inverter.voltage}V, MPPT: {components.inverter.mppt}A</div>
        </div>
        {/* Battery Card */}
        <div className="rounded-xl bg-yellow-50 p-5 shadow flex flex-col items-start border border-yellow-100">
          🔋
          <div className="font-semibold text-yellow-900 text-lg mb-1">Battery System</div>
          <div className="text-gray-700 text-sm mb-1">{components.batteryConfiguration.name}</div>
          <div className="text-xs text-gray-500">{getBatteryConfig()} ({components.batteryConfiguration.type})</div>
          <div className="text-xs text-gray-500">{components.batteryConfiguration.totalBatteries} units</div>
        </div>
        {/* Solar Panel Card */}
        <div className="rounded-xl bg-green-50 p-5 shadow flex flex-col items-start border border-green-100">
          ☀️
          <div className="font-semibold text-green-900 text-lg mb-1">Solar Panels</div>
          <div className="text-gray-700 text-sm mb-1">{components.solarPanels.name}</div>
          <div className="text-xs text-gray-500">{components.solarPanels.watts}W each</div>
          <div className="text-xs text-gray-500">{components.solarPanels.quantity} panels</div>
        </div>
        {/* Protection Devices Card */}
        <div className="rounded-xl bg-purple-50 p-5 shadow flex flex-col items-start border border-purple-100">
          🛡️
          <div className="font-semibold text-purple-900 text-lg mb-1">Protection Devices</div>
          <div className="text-gray-700 text-sm mb-1">Circuit Breakers</div>
          <div className="text-xs text-gray-500">{components.breakers.dc.current}A DC + {components.breakers.ac.current}A AC</div>
          <div className="text-xs text-gray-500">{components.breakers.dc.voltage} / {components.breakers.ac.voltage}</div>
        </div>
        {/* Surge Protector Card */}
        <div className="rounded-xl bg-red-50 p-5 shadow flex flex-col items-start border border-red-100">
          ⚠️
          <div className="font-semibold text-red-900 text-lg mb-1">Surge Protector (DC)</div>
          <div className="text-gray-700 text-sm mb-1">600V, Schneider</div>
          <div className="text-xs text-gray-500">Protects against voltage spikes</div>
        </div>
      </div>
      {/* Additional Information & CTA */}
      <div className="px-6 py-6 bg-gray-50 border-t border-gray-200 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <span className="font-medium text-gray-700">Warranty:</span>
            <span className="text-gray-600 ml-2">1-5 years on major components</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Installation:</span>
            <span className="text-gray-600 ml-2">Professional installation included</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Support:</span>
            <span className="text-gray-600 ml-2">24/7 technical support</span>
          </div>
        </div>
        
        {/* Professional Audit Lead Magnet */}
        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-blue-900 mb-2">🚀 Ready for Professional Installation?</h3>
            <p className="text-blue-800 mb-4">
              This is your preliminary system design. For accurate pricing, site assessment, and professional installation, 
              we recommend a comprehensive audit by our certified solar engineers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-2">📋 Professional Audit Includes:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Site survey & roof assessment</li>
                <li>• Electrical load analysis</li>
                <li>• Shading analysis</li>
                <li>• Detailed cost breakdown</li>
                <li>• Installation timeline</li>
                <li>• Warranty & maintenance plan</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-100">
              <h4 className="font-semibold text-green-900 mb-2">💡 Why Choose Professional Audit?</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Accurate system sizing</li>
                <li>• Optimized component selection</li>
                <li>• Compliance with local codes</li>
                <li>• Maximum energy efficiency</li>
                <li>• Long-term reliability</li>
                <li>• Peace of mind guarantee</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center">
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-semibold">Professional Audit Fee: ₦25,000</p>
              <p className="text-yellow-700 text-sm">Comprehensive site assessment and detailed system design</p>
            </div>
            <a 
              href="https://wa.me/2349066730744?text=Hi! I just used the SolarMate calculator and would like to book a professional solar audit for ₦25,000. Can you help me with the next steps?" 
              className="inline-flex items-center px-8 py-4 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors font-semibold text-lg"
            >
              ⚡ Book Professional Solar Audit
            </a>
            <p className="text-sm text-gray-600 mt-2">Professional consultation • Detailed site assessment • Installation support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ComponentTable };
export default ComponentTable;