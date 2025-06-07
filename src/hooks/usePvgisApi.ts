import { useState, useCallback } from 'react';
import { LocationData, PvgisData } from '../types';

interface MonthlyData {
  month: number;
  pvout: number;
}

interface PvgisResponse {
  outputs?: {
    monthly?: Array<{
      month: number;
      'H(i)_d': number;
      E_d: number;
    }>;
  };
  inputs?: {
    location?: {
      elevation: number;
    };
  };
}

// List of proxy servers to try if CORS fails
const PROXY_SERVERS = [
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest='
];

export const usePvgisApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithProxy = async (url: string, proxyIndex: number = 0): Promise<Response> => {
    try {
      // First try direct fetch
      const response = await fetch(url);
      return response;
    } catch (err) {
      // If direct fetch fails and we have proxies to try
      if (proxyIndex < PROXY_SERVERS.length) {
        try {
          const proxyUrl = PROXY_SERVERS[proxyIndex] + encodeURIComponent(url);
          const response = await fetch(proxyUrl);
          return response;
        } catch (proxyErr) {
          // Try next proxy
          return fetchWithProxy(url, proxyIndex + 1);
        }
      }
      // If all proxies fail, throw the original error
      throw err;
    }
  };

  const fetchPvgisData = useCallback(async (location: LocationData): Promise<PvgisData | null> => {
    setIsLoading(true);
    setError(null);

    let retries = 3;
    const timeout = 10000; // 10 second timeout

    while (retries > 0) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const baseUrl = `https://re.jrc.ec.europa.eu/api/v5_2/seriescalc?` +
          `lat=${location.latitude}&lon=${location.longitude}` +
          `&startyear=2023&endyear=2023&outputformat=json` +
          `&mountingplace=fixed&pvtechchoice=crystSi&peakpower=1&loss=14`;

        const response = await fetchWithProxy(baseUrl);
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json() as PvgisResponse;

        if (!data.outputs?.monthly || !Array.isArray(data.outputs.monthly)) {
          throw new Error('Invalid PVGIS response format');
        }

        // Convert daily to monthly kWh/m²
        const monthly: MonthlyData[] = data.outputs.monthly.map((month) => ({
          month: month.month,
          pvout: month['H(i)_d'] * 30,
        }));

        const annualTotal = monthly.reduce((sum: number, m: MonthlyData) => sum + m.pvout, 0);

        // Extract the minimum daily energy production (worst day PVOUT)
        const worstDayPvout = Math.min(...data.outputs.monthly.map((m) => m.E_d));

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
        retries--;
        
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            setError('Request timed out. Please try again.');
          } else if (err.message.includes('API error: 429')) {
            setError('Too many requests. Please try again later.');
          } else if (err.message.includes('API error: 500')) {
            setError('Server error. Using estimated values.');
          } else if (err.message.includes('Failed to fetch')) {
            setError('Network error. Using estimated values.');
          }
        }
        
        if (retries === 0) {
          setError('Failed to fetch solar data after multiple attempts. Using estimated values.');
          return getEstimatedNigerianData(location);
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries))); // Exponential backoff
      }
    }
    return null;
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
