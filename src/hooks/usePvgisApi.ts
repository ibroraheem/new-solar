import { useState } from 'react';
import { PvgisData } from '../types';
import { NigerianRegion, getNigerianRegion } from '../utils/calculations';
import axios from 'axios';

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

// Multiple proxy options for CORS
const PROXY_OPTIONS = [
  '/.netlify/functions/pvgis-proxy', // Netlify function (preferred)
  'https://api.allorigins.win/raw?url=', // Public CORS proxy
  'https://cors-anywhere.herokuapp.com/', // Another public proxy
];

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

    // Try proxy servers
    for (let i = 0; i < PROXY_OPTIONS.length; i++) {
      const proxy = PROXY_OPTIONS[i];
      try {
        const response = await axios.get(`${proxy}/pvgis`, {
          params: {
            lat: latitude,
            lon: longitude,
            outputformat: 'json',
            pvtechchoice: 'crystSi',
            mountingplace: 'building',
            loss: 14,
            angle: 0,
            aspect: 0,
            components: 1
          },
          timeout: parseInt(process.env.PVGIS_TIMEOUT || '30000')
        });

        if (response.data && response.data.outputs) {
          const data = response.data;
          
          // Validate the response structure
          if (!data.outputs.monthly || !Array.isArray(data.outputs.monthly)) {
            throw new Error('Invalid PVGIS response structure');
          }

          // Calculate worst month E_d value
          const worstMonth = data.outputs.monthly.reduce((worst: any, month: any) => 
            month.pvout < worst.pvout ? month : worst
          );

          const pvgisData: PvgisData = {
            monthly: data.outputs.monthly.map((month: any) => ({
              month: month.month,
              pvout: month.pvout,
              eday: month.eday || (month.pvout / 30) // Use eday if available, otherwise calculate
            })),
            annual: {
              pvout: data.outputs.annual.pvout
            },
            meta: {
              latitude: data.meta.latitude,
              longitude: data.meta.longitude,
              elevation: data.meta.elevation,
              worstDayPvout: worstMonth.eday || (worstMonth.pvout / 30)
            }
          };

          setLoading(false);
          return pvgisData;
        }
      } catch (err) {
        // Continue to next proxy if this one fails
        continue;
      }
    }

    // If all proxies fail, use fallback data
    console.error('All PVGIS proxies failed, using fallback data');
    setError('Failed to fetch solar data from all sources. Using regional averages.');
    setIsFallbackData(true);
    
    const region = getNigerianRegion(latitude);
    const fallbackData = getRegionalFallbackData(region, latitude);
    setLoading(false);
    return fallbackData;
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
      pvout: eday * 30, // Convert daily to monthly values
      eday // Include the daily E_d value
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
