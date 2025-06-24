import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputSection from './input/InputSection';
import OutputSection from './output/OutputSection';
import { usePvgisApi } from '../hooks/usePvgisApi';
import { calculateSolarComponents, calculateWorstMonthPvout } from '../utils/calculations';
import { LocationData, PvgisData, SolarComponents, Appliance } from '../types';

const SystemOverview: React.FC = () => {
  const [calculationResult, setCalculationResult] = useState<{
    pvoutData: PvgisData | null;
    worstMonthPvout: number;
    recommendedComponents: SolarComponents;
    backupHours: number;
    appliances: Appliance[];
    isFallbackData: boolean;
  } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const { fetchPvgisData, loading, error, isFallbackData } = usePvgisApi();
  const navigate = useNavigate();

  const handleCalculate = async (params: {
    dailyEnergyDemand: number;
    location: LocationData;
    backupHours: number;
    appliances: Appliance[];
  }) => {
    setShowResults(false);
    setCalculationError(null);
    
    try {
      const pvgisData = await fetchPvgisData(params.location.latitude, params.location.longitude);
      const worstMonthPvout = calculateWorstMonthPvout(pvgisData);
      
      const recommendedComponents = calculateSolarComponents(
        params.appliances,
        params.backupHours,
        worstMonthPvout
      );
      
      setCalculationResult({
        pvoutData: pvgisData,
        worstMonthPvout,
        recommendedComponents,
        backupHours: params.backupHours,
        appliances: params.appliances,
        isFallbackData
      });
      
      setShowResults(true);
      
      setTimeout(() => {
        window.scrollTo({
          top: document.getElementById('results')?.offsetTop || 0,
          behavior: 'smooth',
        });
      }, 100);
    } catch (err) {
      console.error('Error calculating solar system:', err);
      setCalculationError(err instanceof Error ? err.message : 'An error occurred during calculation');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <div className="text-center flex-1">
              <h1 className="text-5xl font-extrabold text-green-700 mb-2 drop-shadow-lg font-display animate-fade-in">SolarMate</h1>
              <p className="text-xl text-yellow-700 font-semibold mb-2 animate-fade-in">Smart Solar Sizing for Nigeria</p>
              <span className="inline-block text-xs font-semibold bg-green-800 bg-opacity-80 px-2 py-0.5 rounded-full text-yellow-200 shadow animate-fade-in">Made in Nigeria</span>
            </div>
          </div>
          <div className="mt-4 mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded shadow animate-fade-in">
            <span className="text-yellow-800 font-semibold">
              All prices shown are based on the Nigerian market (₦) and are subject to change due to market fluctuations. For the most accurate and up-to-date pricing, please contact our team.
            </span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {calculationError && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border-2 border-red-300 text-red-800 px-6 py-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Calculation Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{calculationError}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Section */}
      <InputSection onCalculate={handleCalculate} />

      {/* Output Section */}
      {calculationResult && (
        <div id="results">
          <OutputSection
            visible={showResults}
            appliances={calculationResult.appliances}
            pvgisData={calculationResult.pvoutData}
            worstMonthPvout={calculationResult.worstMonthPvout}
            solarComponents={calculationResult.recommendedComponents}
            backupHours={calculationResult.backupHours}
            isFallbackData={calculationResult.isFallbackData}
          />
        </div>
      )}
    </div>
  );
};

export { SystemOverview };
export default SystemOverview; 