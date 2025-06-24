import React from 'react';
import { SolarComponents } from '../../types';
import { formatPrice } from '../../data/pricing';

interface CostAnalysisProps {
  components: SolarComponents;
}

const PRICE_PER_KWH_NGN = 225;

const CostAnalysis: React.FC<CostAnalysisProps> = ({ components }) => {
  const { costBreakdown, totalCost } = components;

  const costItems = [
    {
      name: 'Inverter',
      price: costBreakdown.inverter,
      description: `${components.inverter.name} (${components.inverter.watts}W)`,
      percentage: ((costBreakdown.inverter / totalCost) * 100).toFixed(1)
    },
    {
      name: 'Battery System',
      price: costBreakdown.battery,
      description: `${components.batteryConfiguration.name} (${components.batteryConfiguration.totalBatteries} units)`,
      percentage: ((costBreakdown.battery / totalCost) * 100).toFixed(1)
    },
    {
      name: 'Solar Panels',
      price: costBreakdown.panels,
      description: `${components.solarPanels.quantity}x ${components.solarPanels.name}`,
      percentage: ((costBreakdown.panels / totalCost) * 100).toFixed(1)
    },
    {
      name: 'Protection Devices',
      price: costBreakdown.breakers,
      description: `${components.breakers.dc.name} + ${components.breakers.ac.name}`,
      percentage: ((costBreakdown.breakers / totalCost) * 100).toFixed(1)
    },
    {
      name: 'Surge Protector (DC)',
      price: 18000,
      description: 'DC Surge Protector (600V, Schneider)',
      percentage: ((18000 / totalCost) * 100).toFixed(1)
    }
  ];

  const dailyEnergy = components ? (components.systemSize.kwp * 24) : 0;
  const estimatedMonthlySavings = (components ? components.costBreakdown.inverter + components.costBreakdown.battery + components.costBreakdown.panels : 0) > 0
    ? ((components.costBreakdown.inverter + components.costBreakdown.battery + components.costBreakdown.panels) / (components.totalCost / (365 * 5)))
    : 0;
  const monthlySolarKwh = (components ? components.systemSize.kwp * 30 : 0);
  const monthlySavings = (components ? components.systemSize.kwp * 30 * PRICE_PER_KWH_NGN : 0);
  const paybackPeriod = components && components.totalCost > 0 ? (components.totalCost / (monthlySavings > 0 ? monthlySavings : 1)) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Cost Analysis</h2>
      
      {/* Total Cost */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Total System Cost</h3>
            <p className="text-sm text-gray-600">Complete solar system with installation</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">{formatPrice(totalCost)}</div>
            <p className="text-sm text-gray-500">Including 20% markup</p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
        
        {costItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <span className="text-sm text-gray-500">{item.percentage}%</span>
              </div>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
            <div className="text-right ml-4">
              <div className="font-semibold text-gray-900">{formatPrice(item.price)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Costs */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Additional Costs (Not Included)</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Cable prices and length are not included. Only the recommended cable size is shown.</li>
          <li>• Mounting hardware and installation labor are not included in the above prices.</li>
          <li>• Other costs may arise depending on site conditions and installation requirements.</li>
          <li>• Electrical permits and inspections</li>
          <li>• Transportation and delivery</li>
          <li>• Maintenance and monitoring equipment</li>
          <li>• Extended warranty options</li>
        </ul>
      </div>

      {/* ROI Information */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Return on Investment</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-700">Estimated monthly savings:</p>
            <p className="font-semibold text-blue-900">₦{monthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div>
            <p className="text-blue-700">Payback period:</p>
            <p className="font-semibold text-blue-900">{paybackPeriod.toFixed(1)} years</p>
          </div>
        </div>
        <p className="text-xs text-blue-500 mt-1">(Assumes grid price: ₦225/kWh)</p>
      </div>

      {/* Payment Options */}
      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h3 className="font-semibold text-purple-800 mb-2">Payment Options</h3>
        <div className="text-sm text-purple-700 space-y-1">
          <p>• Full payment upfront</p>
          <p>• 50% down payment, balance on completion</p>
          <p>• Financing available through partner banks</p>
          <p>• 30-day money-back guarantee</p>
        </div>
      </div>
    </div>
  );
};

export { CostAnalysis };
export default CostAnalysis; 