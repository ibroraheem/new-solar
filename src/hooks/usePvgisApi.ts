import { useState } from 'react';
import { PvgisData } from '../types';
import { NigerianRegion, getNigerianRegion } from '../utils/calculations';

interface MonthlyData {
  month: number;
  pvout: number;
}

interface PvgisResponse {
  inputs: {
    location: {
      latitude: number;
      longitude: number;
    };
    meteo_data: {
      radiation_db: string;
      meteo_db: string;
    };
    mounting_system: {
      fixed: {
        slope: {
          value: number;
          optimal: boolean;
        };
        azimuth: {
          value: number;
          optimal: boolean;
        };
      };
    };
    pv_module: {
      technology: string;
      peak_power: number;
      system_loss: number;
    };
  };
  outputs: {
    monthly: {
      month: number;
      H_d: number;
      H_i: number;
      H_kt: number;
      T2m: number;
      WS10m: number;
      Int: number;
    }[];
  };
}

// List of proxy servers to try if CORS fails
const PROXY_SERVERS = [
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest='
];

// Fallback data for Nigerian regions
const NIGERIAN_SOLAR_DATA = {
  north: {
    monthly: [
      { month: 1, pvout: 4.8 },
      { month: 2, pvout: 5.1 },
      { month: 3, pvout: 5.3 },
      { month: 4, pvout: 5.2 },
      { month: 5, pvout: 5.0 },
      { month: 6, pvout: 4.7 },
      { month: 7, pvout: 4.5 },
      { month: 8, pvout: 4.3 },
      { month: 9, pvout: 4.8 },
      { month: 10, pvout: 5.0 },
      { month: 11, pvout: 5.2 },
      { month: 12, pvout: 5.1 }
    ]
  },
  middle: {
    monthly: [
      { month: 1, pvout: 4.4 },
      { month: 2, pvout: 4.6 },
      { month: 3, pvout: 4.5 },
      { month: 4, pvout: 4.5 },
      { month: 5, pvout: 4.2 },
      { month: 6, pvout: 3.9 },
      { month: 7, pvout: 3.6 },
      { month: 8, pvout: 3.3 },
      { month: 9, pvout: 3.7 },
      { month: 10, pvout: 4.0 },
      { month: 11, pvout: 4.4 },
      { month: 12, pvout: 4.4 }
    ]
  },
  south: {
    monthly: [
      { month: 1, pvout: 4.0 },
      { month: 2, pvout: 4.2 },
      { month: 3, pvout: 4.1 },
      { month: 4, pvout: 4.0 },
      { month: 5, pvout: 3.8 },
      { month: 6, pvout: 3.5 },
      { month: 7, pvout: 3.2 },
      { month: 8, pvout: 3.0 },
      { month: 9, pvout: 3.4 },
      { month: 10, pvout: 3.7 },
      { month: 11, pvout: 4.0 },
      { month: 12, pvout: 4.0 }
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
      // First try with CORS mode
      const response = await fetch(
        `/api/pvgis-proxy?lat=${latitude}&lon=${longitude}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      console.error('Error fetching PVGIS data:', err);
      setError('Failed to fetch solar data. Using regional averages.');
      setIsFallbackData(true);
      
      // Fallback to regional averages
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
  const monthlyData = {
    north: [5.2, 5.8, 6.2, 6.5, 6.3, 5.8, 5.2, 5.0, 5.5, 5.8, 5.5, 5.0],
    middle: [4.8, 5.2, 5.5, 5.8, 5.5, 5.0, 4.5, 4.2, 4.8, 5.0, 4.8, 4.5],
    south: [4.2, 4.5, 4.8, 5.0, 4.8, 4.5, 4.0, 3.8, 4.2, 4.5, 4.2, 4.0],
  };

  const pvoutValues = monthlyData[region];
  const worstDayPvout = Math.min(...pvoutValues);

  return {
    monthly: pvoutValues.map((value: number, index: number) => ({
      month: index + 1,
      pvout: value * 30 // Convert daily to monthly values
    })),
    annual: {
      pvout: pvoutValues.reduce((sum, val) => sum + val, 0) * 30 / 12 // Average monthly value
    },
    meta: {
      latitude,
      longitude: 0,
      elevation: 0,
      worstDayPvout
    }
  };
};
