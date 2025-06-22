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

    // Try multiple proxy strategies
    for (let i = 0; i < PROXY_OPTIONS.length; i++) {
      const proxy = PROXY_OPTIONS[i];
      try {
        console.log(`Attempting PVGIS fetch via proxy ${i + 1}: ${proxy}`);
        
        let url: string;
        if (proxy === '/.netlify/functions/pvgis-proxy') {
          // Netlify function
          url = `${proxy}?lat=${latitude}&lon=${longitude}`;
        } else {
          // Public CORS proxy
          const pvgisUrl = `https://re.jrc.ec.europa.eu/api/v5_2/seriescalc?` +
            `lat=${latitude}&lon=${longitude}` +
            `&startyear=2020&endyear=2020` +
            `&outputformat=json` +
            `&pvtechchoice=crystSi` +
            `&peakpower=1` +
            `&loss=14` +
            `&raddatabase=PVGIS-SARAH2` +
            `&angle=35&aspect=0`;
          url = proxy + encodeURIComponent(pvgisUrl);
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(15000) // 15 second timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json() as PvgisResponse;
        console.log('PVGIS Response received via proxy', i + 1, ':', data);

        // Validate response structure
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
          monthly: monthlyData.map(({ month, pvout, eday }: MonthlyDataPoint) => ({ 
            month, 
            pvout,
            eday // Include the daily E_d value
          })),
          annual: {
            pvout: data.outputs.monthly.reduce((sum: number, month: PvgisMonthlyData) => sum + month.E_d, 0) * 30 / 12
          },
          meta: {
            latitude,
            longitude,
            elevation: 0,
            worstDayPvout: data.worstMonth?.E_day || Math.min(...monthlyData.map(m => m.eday))
          }
        };

        setLoading(false);
        console.log('Successfully fetched PVGIS data via proxy', i + 1);
        return transformedData;

      } catch (err) {
        console.warn(`Proxy ${i + 1} failed:`, err);
        if (i === PROXY_OPTIONS.length - 1) {
          // All proxies failed, use fallback data
          throw err;
        }
        // Continue to next proxy
        continue;
      }
    }

    // If we get here, all proxies failed
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
