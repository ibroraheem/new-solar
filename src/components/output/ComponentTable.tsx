import React from 'react';
import { SolarComponents } from '../../types';
import { formatPrice } from '../../data/pricing';

interface ComponentTableProps {
  components: SolarComponents;
  dailyEnergyDemand: number;
}

const ComponentTable: React.FC<ComponentTableProps> = ({ components, dailyEnergyDemand }) => {
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
        <h2 className="text-xl font-semibold text-gray-900">System Components & Pricing</h2>
        <p className="text-sm text-gray-600 mt-1">
          Complete breakdown of all components with current market prices
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Component
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Specification
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Price
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* System Overview */}
            <tr className="bg-blue-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-blue-900">System Overview</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-blue-800">
                  {components.systemSize.kwp.toFixed(1)}kWp System
                </div>
                <div className="text-xs text-blue-600">
                  Daily Energy: {dailyEnergyDemand.toFixed(1)}kWh
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-blue-800">1 System</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-blue-800">-</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-blue-900">{formatPrice(components.totalCost)}</div>
              </td>
            </tr>

            {/* Inverter */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">Inverter</div>
                <div className="text-xs text-gray-500">{components.inverter.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{components.inverter.watts}W</div>
                <div className="text-xs text-gray-500">
                  {components.inverter.voltage}V, MPPT: {components.inverter.mppt}A
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">1</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatPrice(components.inverter.price)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-gray-900">{formatPrice(components.costBreakdown.inverter)}</div>
              </td>
            </tr>

            {/* Battery System */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">Battery System</div>
                <div className="text-xs text-gray-500">{components.batteryConfiguration.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{getBatteryConfig()}</div>
                <div className="text-xs text-gray-500">
                  {components.batteryConfiguration.type} Technology
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{components.batteryConfiguration.totalBatteries}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatPrice(components.batteryConfiguration.price / components.batteryConfiguration.totalBatteries)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-gray-900">{formatPrice(components.costBreakdown.battery)}</div>
              </td>
            </tr>

            {/* Solar Panels */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">Solar Panels</div>
                <div className="text-xs text-gray-500">{components.solarPanels.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{components.solarPanels.watts}W each</div>
                <div className="text-xs text-gray-500">High-efficiency monocrystalline</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{components.solarPanels.quantity}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatPrice(components.solarPanels.price / components.solarPanels.quantity)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-gray-900">{formatPrice(components.costBreakdown.panels)}</div>
              </td>
            </tr>

            {/* Cables */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">Cables & Wiring</div>
                <div className="text-xs text-gray-500">{components.cables.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{components.cables.size} DC Cable</div>
                <div className="text-xs text-gray-500">UV resistant, outdoor rated</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{components.cables.length}m</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatPrice(components.cables.price / components.cables.length)}/m</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-gray-900">{formatPrice(components.costBreakdown.cables)}</div>
              </td>
            </tr>

            {/* Protection Devices */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">Protection Devices</div>
                <div className="text-xs text-gray-500">Circuit breakers & surge protection</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {components.breakers.dc.current}A DC + {components.breakers.ac.current}A AC
                </div>
                <div className="text-xs text-gray-500">
                  {components.breakers.dc.voltage} / {components.breakers.ac.voltage}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">2</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatPrice(components.breakers.dc.price)} + {formatPrice(components.breakers.ac.price)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-gray-900">{formatPrice(components.costBreakdown.breakers)}</div>
              </td>
            </tr>

            {/* Total Row */}
            <tr className="bg-green-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-bold text-green-900">TOTAL</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-green-800">Complete System</div>
                <div className="text-xs text-green-600">Including 20% markup</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-green-800">-</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-green-800">-</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-lg font-bold text-green-900">{formatPrice(components.totalCost)}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Additional Information */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Warranty:</span>
            <span className="text-gray-600 ml-2">2-5 years on components</span>
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
      </div>
    </div>
  );
};

export { ComponentTable };