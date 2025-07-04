import React from 'react';
import { PvgisData, SolarComponents, Appliance } from '../../types';
import { calculateEnergyDemand } from '../../utils/calculations';

interface EnvironmentalImpactProps {
  pvgisData: PvgisData | null;
  appliances: Appliance[];
  solarComponents: SolarComponents;
  isFallbackData: boolean;
}

const EnvironmentalImpact: React.FC<EnvironmentalImpactProps> = ({
  pvgisData,
  appliances,
  solarComponents,
  isFallbackData,
}) => {
  // Calculate daily energy demand from appliances
  const dailyEnergyDemand = calculateEnergyDemand(appliances);

  // Environmental impact calculations
  const calculateEnvironmentalImpact = () => {
    if (!pvgisData?.monthly) return null;

    // Calculate annual energy generation
    const annualGeneration = pvgisData.monthly.reduce((sum, month) => 
      sum + (solarComponents.solarPanels.watts * solarComponents.solarPanels.quantity * (month.pvout / 30) * 0.75 * 30) / 1000, 0
    );

    // Nigerian grid emission factor (kg CO2/kWh) - based on thermal power plants
    const gridEmissionFactor = 0.85; // kg CO2 per kWh for Nigerian grid mix
    
    // Annual CO2 emissions avoided
    const annualCO2Reduction = annualGeneration * gridEmissionFactor;
    
    // Trees equivalent (1 tree absorbs ~22kg CO2 per year)
    const treesEquivalent = annualCO2Reduction / 22;
    
    // Car emissions equivalent (average car emits ~4.6 metric tons CO2 per year)
    const carEmissionsEquivalent = annualCO2Reduction / 4600;
    
    // Coal burning equivalent (1 kg coal produces ~2.5 kg CO2)
    const coalAvoided = annualCO2Reduction / 2.5;

    return {
      annualGeneration,
      annualCO2Reduction,
      treesEquivalent,
      carEmissionsEquivalent,
      coalAvoided
    };
  };

  const environmentalData = calculateEnvironmentalImpact();

  if (!environmentalData) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">🌱 Environmental Impact</h3>
        <p className="text-gray-600">Environmental impact data will be available once solar data is loaded.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-2">🌱</span>
        <h3 className="text-lg font-medium text-gray-900">Environmental Impact</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-6">
        Your solar system will make a significant positive impact on the environment by reducing carbon emissions and promoting clean energy.
        {isFallbackData && <span className="text-yellow-600"> (Using estimated data)</span>}
      </p>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center mb-2">
            <span className="text-xl mr-2">🌳</span>
            <span className="font-semibold text-green-900">CO₂ Reduction</span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {environmentalData.annualCO2Reduction.toFixed(0)}
          </div>
          <div className="text-sm text-green-600">kg CO₂/year</div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center mb-2">
            <span className="text-xl mr-2">🌲</span>
            <span className="font-semibold text-blue-900">Trees Equivalent</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {environmentalData.treesEquivalent.toFixed(0)}
          </div>
          <div className="text-sm text-blue-600">trees planted</div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center mb-2">
            <span className="text-xl mr-2">🚗</span>
            <span className="font-semibold text-orange-900">Car Emissions</span>
          </div>
          <div className="text-2xl font-bold text-orange-700">
            {environmentalData.carEmissionsEquivalent.toFixed(1)}
          </div>
          <div className="text-sm text-orange-600">cars off road</div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center mb-2">
            <span className="text-xl mr-2">🏭</span>
            <span className="font-semibold text-purple-900">Coal Avoided</span>
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {environmentalData.coalAvoided.toFixed(0)}
          </div>
          <div className="text-sm text-purple-600">kg coal/year</div>
        </div>
      </div>

      {/* Detailed Impact Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">🌍 Climate Impact</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• <strong>{environmentalData.annualCO2Reduction.toFixed(0)} kg CO₂</strong> emissions avoided annually</li>
            <li>• Equivalent to <strong>{environmentalData.treesEquivalent.toFixed(0)} trees</strong> absorbing CO₂</li>
            <li>• Reduces your carbon footprint by <strong>{((environmentalData.annualCO2Reduction / 5000) * 100).toFixed(1)}%</strong> (vs average Nigerian)</li>
            <li>• Contributes to Nigeria's renewable energy goals</li>
          </ul>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">🚗 Transportation Equivalent</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Equivalent to taking <strong>{environmentalData.carEmissionsEquivalent.toFixed(1)} cars</strong> off the road</li>
            <li>• Avoids burning <strong>{environmentalData.coalAvoided.toFixed(0)} kg</strong> of coal annually</li>
            <li>• Reduces air pollution and respiratory health impacts</li>
            <li>• Supports Nigeria's commitment to clean energy</li>
          </ul>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
        <div className="text-center">
          <h4 className="font-semibold text-green-900 mb-2">🌱 Make an Even Bigger Impact!</h4>
          <p className="text-green-800 text-sm mb-3">
            Your solar system is just the beginning. Consider these additional steps to maximize your environmental impact:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="bg-white p-3 rounded border border-green-100">
              <strong>💡 Energy Efficiency</strong><br/>
              Upgrade to LED lights and energy-efficient appliances
            </div>
            <div className="bg-white p-3 rounded border border-green-100">
              <strong>🌿 Green Lifestyle</strong><br/>
              Reduce, reuse, recycle, and consider electric vehicles
            </div>
            <div className="bg-white p-3 rounded border border-green-100">
              <strong>🌍 Community Impact</strong><br/>
              Share your solar journey and inspire others
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalImpact; 