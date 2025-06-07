import React, { useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import InputSection from './components/input/InputSection';
import OutputSection from './components/output/OutputSection';
import { usePvgisApi } from './hooks/usePvgisApi';
import { calculateSolarComponents, calculateWorstMonthPvout } from './utils/calculations';
import { LocationData, PvgisData, SolarComponents, Appliance } from './types';

function App() {
  const [calculationResult, setCalculationResult] = useState<{
    dailyEnergyDemand: number;
    pvoutData: PvgisData | null;
    worstMonthPvout: number;
    recommendedComponents: SolarComponents;
    backupHours: number;
    appliances: Appliance[];
  } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { fetchPvgisData, isLoading, error } = usePvgisApi();

  const handleCalculate = async (params: {
    dailyEnergyDemand: number;
    location: LocationData;
    backupHours: number;
    appliances: Appliance[];
  }) => {
    setShowResults(false);
    
    try {
      const pvgisData = await fetchPvgisData(params.location);
      const worstMonthPvout = calculateWorstMonthPvout(pvgisData);
      
      const recommendedComponents = calculateSolarComponents(
        params.dailyEnergyDemand,
        params.backupHours / 24, // Convert hours to days for calculation
        worstMonthPvout
      );
      
      setCalculationResult({
        dailyEnergyDemand: params.dailyEnergyDemand,
        pvoutData: pvgisData,
        worstMonthPvout,
        recommendedComponents,
        backupHours: params.backupHours,
        appliances: params.appliances,
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
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-green-600 to-green-500 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">SolarMate</h1>
            <p className="text-xl md:text-2xl mb-8">Smart Solar Sizing for Nigerian Homes & Businesses</p>
            <a
              href="#calculator"
              className="inline-block px-6 py-3 bg-yellow-500 text-white font-medium rounded-md shadow-md hover:bg-yellow-600 transition-colors"
            >
              Start Sizing Your System
            </a>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                SolarMate uses advanced algorithms and Nigerian-specific data to size your solar system perfectly
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Enter Your Energy Needs</h3>
                <p className="text-gray-600">
                  Input your energy requirements manually or use our appliance calculator to estimate your consumption.
                </p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Specify Your Location</h3>
                <p className="text-gray-600">
                  Select your Nigerian city to get accurate solar radiation data for your specific region.
                </p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Your Recommendations</h3>
                <p className="text-gray-600">
                  Receive detailed system recommendations with components sized specifically for your needs.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Calculator Section */}
        <InputSection onCalculate={handleCalculate} />
        
        {/* Results Section */}
        <div id="results">
          {isLoading && (
            <div className="bg-gray-50 py-10 text-center">
              <div className="container mx-auto px-4">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
                  <div className="h-64 bg-gray-200 rounded max-w-4xl mx-auto"></div>
                </div>
                <p className="mt-6 text-gray-600">Calculating your optimal solar system...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-gray-50 py-10 text-center">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-red-700">{error}</p>
                  <p className="mt-2 text-gray-600">
                    Don't worry, we're using estimated values for Nigeria to calculate your system.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {calculationResult && (
            <OutputSection
              visible={showResults}
              dailyEnergyDemand={calculationResult.dailyEnergyDemand}
              pvgisData={calculationResult.pvoutData}
              worstMonthPvout={calculationResult.worstMonthPvout}
              solarComponents={calculationResult.recommendedComponents}
              backupHours={calculationResult.backupHours}
              appliances={calculationResult.appliances}
            />
          )}
        </div>
        
        {/* About Section */}
        <section id="about" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">About SolarMate</h2>
                <p className="mt-4 text-gray-600">
                  Designed specifically for the Nigerian market
                </p>
              </div>
              
              <div className="prose lg:prose-lg mx-auto">
                <p>
                  SolarMate is a specialized solar system sizing tool created specifically for the Nigerian market.
                  We understand the unique challenges of power supply in Nigeria and have designed this tool to help
                  homeowners and businesses find the perfect solar solution.
                </p>
                
                <p>
                  Our calculations take into account Nigeria's solar radiation patterns, typical appliances used in
                  Nigerian homes and offices, and the specific components available in the Nigerian market.
                </p>
                
                <p>
                  Whether you're looking to completely go off-grid or just want backup power during outages,
                  SolarMate will help you size the right system for your needs and budget.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;