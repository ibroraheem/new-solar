import { useState } from 'react';
import { PvgisData } from '../types';
import { NigerianRegion, getNigerianRegion } from '../utils/calculations';

interface MonthlyDataPoint {
  month: number;
  pvout: number;
  eday: number;
}

interface PvgisMonthlyData {
  month: number;
  E_d: number;
}

interface PvgisResponse {
  outputs: {
    monthly: PvgisMonthlyData[];
  };
  worstMonth: {
    month: number;
    E_day: number;
  };
}

// Use only crossorigin.me as proxy
const PROXY_SERVER = 'https://crossorigin.me/';

// Fallback data for Nigerian regions (E_day values for 1kWp)
const NIGERIAN_SOLAR_DATA = {
  north: {
    monthly: [
      { month: 1, eday: 4.8 },
      { month: 2, eday: 5.1 },
      { month: 3, eday: 5.3 },
      { month: 4, eday: 5.2 },
      { month: 5, eday: 5.0 },
      { month: 6, eday: 4.7 },
      { month: 7, eday: 4.5 },
      { month: 8, eday: 4.3 },
      { month: 9, eday: 4.8 },
      { month: 10, eday: 5.0 },
      { month: 11, eday: 5.2 },
      { month: 12, eday: 5.1 }
    ]
  },
  middle: {
    monthly: [
      { month: 1, eday: 4.4 },
      { month: 2, eday: 4.6 },
      { month: 3, eday: 4.5 },
      { month: 4, eday: 4.5 },
      { month: 5, eday: 4.2 },
      { month: 6, eday: 3.9 },
      { month: 7, eday: 3.6 },
      { month: 8, eday: 3.3 },
      { month: 9, eday: 3.7 },
      { month: 10, eday: 4.0 },
      { month: 11, eday: 4.4 },
      { month: 12, eday: 4.4 }
    ]
  },
  south: {
    monthly: [
      { month: 1, eday: 4.0 },
      { month: 2, eday: 4.2 },
      { month: 3, eday: 4.1 },
      { month: 4, eday: 4.0 },
      { month: 5, eday: 3.8 },
      { month: 6, eday: 3.5 },
      { month: 7, eday: 3.2 },
      { month: 8, eday: 3.0 },
      { month: 9, eday: 3.4 },
      { month: 10, eday: 3.7 },
      { month: 11, eday: 4.0 },
      { month: 12, eday: 4.0 }
    ]
  }
};

interface UsePvgisApiReturn {
  fetchPvgisData: (latitude: number, longitude: number) => Promise<PvgisData>;
  loading: boolean;
  error: string | null;
  isFallbackData: boolean;
}

export const usePvgisApi = (): UsePvgisApiReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFallbackData, setIsFallbackData] = useState(false);

  const fetchPvgisData = async (latitude: number, longitude: number): Promise<PvgisData> => {
    setLoading(true);
    setError(null);
    setIsFallbackData(false);

    try {
      console.log('Fetching PVGIS data through Netlify function...');
      const response = await fetch(`/.netlify/functions/pvgis-proxy?lat=${latitude}&lon=${longitude}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as PvgisResponse;
      console.log('PVGIS Response:', data); // Debug log

      // Check if we have the expected data structure
      if (!data || !data.outputs || !Array.isArray(data.outputs.monthly)) {
        throw new Error('Invalid PVGIS data structure received');
      }

      // Transform the data to match our PvgisData type
      const monthlyData: MonthlyDataPoint[] = data.outputs.monthly.map((month: PvgisMonthlyData) => {
        if (typeof month.E_d !== 'number') {
          throw new Error(`Invalid E_d value for month ${month.month}`);
        }
        return {
          month: month.month,
          pvout: month.E_d * 30, // Convert daily to monthly values
          eday: month.E_d // Store the daily value for 1kWp
        };
      });

      const transformedData: PvgisData = {
        monthly: monthlyData.map(({ month, pvout }: MonthlyDataPoint) => ({ month, pvout })),
        annual: {
          pvout: data.outputs.monthly.reduce((sum: number, month: PvgisMonthlyData) => sum + month.E_d, 0) * 30 / 12
        },
        meta: {
          latitude,
          longitude,
          elevation: 0,
          worstDayPvout: data.worstMonth.E_day // Use the minimum E_day from the API
        }
      };

      setLoading(false);
      return transformedData;
    } catch (err) {
      console.error('Error fetching PVGIS data:', err);
      setError('Failed to fetch solar data. Using regional averages.');
      setIsFallbackData(true);
      
      const region = getNigerianRegion(latitude);
      const fallbackData = getRegionalFallbackData(region, latitude);
      setLoading(false);
      return fallbackData;
    }
  };

  return { fetchPvgisData, loading, error, isFallbackData };
};

// Fallback data for Nigerian regions
const getRegionalFallbackData = (region: NigerianRegion, latitude: number): PvgisData => {
  const monthlyData = NIGERIAN_SOLAR_DATA[region].monthly;
  const worstDayPvout = Math.min(...monthlyData.map(month => month.eday));

  return {
    monthly: monthlyData.map(({ month, eday }) => ({
      month,
      pvout: eday * 30 // Convert daily to monthly values
    })),
    annual: {
      pvout: monthlyData.reduce((sum, month) => sum + month.eday, 0) * 30 / 12
    },
    meta: {
      latitude,
      longitude: 0,
      elevation: 0,
      worstDayPvout // This is the minimum E_day for 1kWp
    }
  };
};
