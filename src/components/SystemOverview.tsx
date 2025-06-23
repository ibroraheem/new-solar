import React, { useState } from 'react';
import { usePayment } from '../context/PaymentContext';
import { useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';
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
  const { hasPdfAccess } = usePayment();
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-green-700 mb-4">Solar Mate</h1>
              <p className="text-lg text-gray-600">
                Smart solar sizing for Nigeria
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              {!hasPdfAccess && (
                <button
                  onClick={() => navigate('/upgrade')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Download PDF Report
                </button>
              )}
            </div>
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