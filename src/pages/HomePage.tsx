import React from 'react';
import { LocationInput } from '../components/input/LocationInput';
import { SolarDataDisplay } from '../components/output/SolarDataDisplay';
import { usePvgisData } from '../hooks/usePvgisData';

export const HomePage: React.FC = () => {
  const { loading, error, data, fetchPvgisData } = usePvgisData();

  const handleLocationSelect = async (location: { latitude: number; longitude: number }) => {
    try {
      await fetchPvgisData(location.latitude, location.longitude);
    } catch (err) {
      console.error('Error fetching PVGIS data:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Solar System Calculator</h1>
          <p className="mt-2 text-lg text-gray-600">
            Enter your location to get detailed solar energy production data
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <LocationInput onLocationSelect={handleLocationSelect} />

          {data && (
            <SolarDataDisplay
              monthlyData={data.outputs.monthly.fixed}
              loading={loading}
              error={error || undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}; 