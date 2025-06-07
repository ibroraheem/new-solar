import { useState, useCallback } from 'react';
import { LocationData, PvgisData } from '../types';

export const usePvgisApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPvgisData = useCallback(async (location: LocationData): Promise<PvgisData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const url = `https://re.jrc.ec.europa.eu/api/v5_2/seriescalc?` +
        `lat=${location.latitude}&lon=${location.longitude}` +
        `&startyear=2023&endyear=2023&outputformat=json` +
        `&mountingplace=fixed&pvtechchoice=crystSi&peakpower=1&loss=14`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.outputs?.monthly || !Array.isArray(data.outputs.monthly)) {
        throw new Error('Invalid PVGIS response format');
      }

      // Convert daily to monthly kWh/m²
      const monthly = data.outputs.monthly.map((month: any) => ({
        month: month.month,
        pvout: month['H(i)_d'] * 30,
      }));

      const annualTotal = monthly.reduce((sum, m) => sum + m.pvout, 0);

      // Extract the minimum daily energy production (worst day PVOUT)
      const worstDayPvout = Math.min(...data.outputs.monthly.map((m: any) => m.E_d));

      return {
        monthly,
        annual: {
          pvout: annualTotal,
        },
        meta: {
          latitude: location.latitude,
          longitude: location.longitude,
          elevation: data.inputs?.location?.elevation || 0,
          worstDayPvout,
        },
      };
    } catch (err) {
      console.error('Error fetching PVGIS data:', err);
      setError('Failed to fetch solar data. Using estimated values.');

      return getEstimatedNigerianData(location);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchPvgisData, isLoading, error };
};

// ---- Fallback Function ----

function getEstimatedNigerianData(location: LocationData): PvgisData {
  const estimatedDaily = [
    { month: 1, pvout: 4.40 },
    { month: 2, pvout: 4.64 },
    { month: 3, pvout: 4.49 },
    { month: 4, pvout: 4.54 },
    { month: 5, pvout: 4.20 },
    { month: 6, pvout: 3.90 },
    { month: 7, pvout: 3.55 },
    { month: 8, pvout: 3.30 }, // Worst
    { month: 9, pvout: 3.68 },
    { month: 10, pvout: 4.02 },
    { month: 11, pvout: 4.37 },
    { month: 12, pvout: 4.37 },
  ];

  const regionalFactor = getRegionalFactor(location.latitude);

  const adjustedMonthly = estimatedDaily.map(({ month, pvout }) => ({
    month,
    pvout: pvout * regionalFactor * 30,
  }));

  const annualTotal = adjustedMonthly.reduce((sum, m) => sum + m.pvout, 0);
  const worstDayPvout = Math.min(...estimatedDaily.map(d => d.pvout)) * regionalFactor;

  return {
    monthly: adjustedMonthly,
    annual: {
      pvout: annualTotal,
    },
    meta: {
      latitude: location.latitude,
      longitude: location.longitude,
      elevation: 300,
      worstDayPvout,
    },
  };
}

function getRegionalFactor(latitude: number): number {
  if (latitude > 10) return 1.1; // North
  if (latitude > 8) return 1.0;  // Middle Belt
  return 0.9;                    // South
}
