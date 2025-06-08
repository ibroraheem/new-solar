import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PaymentProvider } from './context/PaymentContext';
import { PaymentPage } from './pages/PaymentPage';
import { PremiumFeature } from './components/PremiumFeature';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import InputSection from './components/input/InputSection';
import OutputSection from './components/output/OutputSection';
import { usePvgisApi } from './hooks/usePvgisApi';
import { calculateSolarComponents, calculateWorstMonthPvout } from './utils/calculations';
import { LocationData, PvgisData, SolarComponents, Appliance } from './types';
import { SystemOverview } from './components/SystemOverview';
import { InverterSelection } from './components/InverterSelection';
import { ComponentSelection } from './components/ComponentSelection';
import { PDFReport } from './components/PDFReport';

const App: React.FC = () => {
  const [calculationResult, setCalculationResult] = useState<{
    dailyEnergyDemand: number;
    pvoutData: PvgisData | null;
    worstMonthPvout: number;
    recommendedComponents: SolarComponents;
    backupHours: number;
    appliances: Appliance[];
    isFallbackData: boolean;
  } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { fetchPvgisData, loading, error, isFallbackData } = usePvgisApi();

  const handleCalculate = async (params: {
    dailyEnergyDemand: number;
    location: LocationData;
    backupHours: number;
    appliances: Appliance[];
  }) => {
    setShowResults(false);
    
    try {
      const pvgisData = await fetchPvgisData(params.location.latitude, params.location.longitude);
      const worstMonthPvout = calculateWorstMonthPvout(pvgisData);
      
      const recommendedComponents = calculateSolarComponents(
        params.dailyEnergyDemand,
        params.backupHours,
        worstMonthPvout
      );
      
      setCalculationResult({
        dailyEnergyDemand: params.dailyEnergyDemand,
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
    }
  };

  return (
    <PaymentProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<SystemOverview />} />
            <Route path="/upgrade" element={<PaymentPage />} />

            {/* Premium routes */}
            <Route
              path="/inverters"
              element={
                <PremiumFeature>
                  <InverterSelection />
                </PremiumFeature>
              }
            />
            <Route
              path="/components"
              element={
                <PremiumFeature>
                  <ComponentSelection />
                </PremiumFeature>
              }
            />
            <Route
              path="/report"
              element={
                <PremiumFeature>
                  <PDFReport />
                </PremiumFeature>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </PaymentProvider>
  );
};

export default App;