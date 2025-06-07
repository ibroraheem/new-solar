import { useState, useCallback } from 'react';
import { LocationData, PvgisData } from '../types';
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
  pvgisData: PvgisResponse | null;
  loading: boolean;
  error: string | null;
  fetchPvgisData: (latitude: number, longitude: number) => Promise<void>;
}

export const usePvgisApi = (): UsePvgisApiReturn => {
  const [pvgisData, setPvgisData] = useState<PvgisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getNigerianRegion = (latitude: number): 'north' | 'middle' | 'south' => {
    if (latitude > 10) return 'north';
    if (latitude > 8) return 'middle';
    return 'south';
  };

  const fetchPvgisData = useCallback(async (latitude: number, longitude: number) => {
    setLoading(true);
    setError(null);

    try {
      // First try the Netlify Functions proxy
      const proxyUrl = `/api/pvgis-proxy?lat=${latitude}&lon=${longitude}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPvgisData(data);
    } catch (error) {
      console.error('Error fetching PVGIS data:', error);
      setError('Failed to fetch solar data. Using regional averages instead.');
      
      // Fallback to Nigerian regional data
      const region = getNigerianRegion(latitude);
      const fallbackData = getFallbackData(region);
      setPvgisData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  return { pvgisData, loading, error, fetchPvgisData };
};

// Fallback data for Nigerian regions
const getFallbackData = (region: NigerianRegion): PvgisResponse => {
  const monthlyData: Record<NigerianRegion, number[]> = {
    'north': [5.2, 5.8, 6.2, 6.5, 6.3, 5.8, 5.2, 5.0, 5.5, 6.0, 5.8, 5.3],
    'middle': [5.0, 5.5, 5.9, 6.2, 6.0, 5.5, 5.0, 4.8, 5.2, 5.7, 5.5, 5.0],
    'south': [4.8, 5.2, 5.5, 5.8, 5.6, 5.2, 4.8, 4.6, 5.0, 5.4, 5.2, 4.8]
  };

  return {
    inputs: {
      location: {
        latitude: 0,
        longitude: 0
      },
      meteo_data: {
        radiation_db: "PVGIS-SARAH2",
        meteo_db: "ERA5"
      },
      mounting_system: {
        fixed: {
          slope: {
            value: 0,
            optimal: false
          },
          azimuth: {
            value: 0,
            optimal: false
          }
        }
      },
      pv_module: {
        technology: "crystSi",
        peak_power: 1,
        system_loss: 14
      }
    },
    outputs: {
      monthly: monthlyData[region].map((value: number, index: number) => ({
        month: index + 1,
        H_d: value,
        H_i: value * 1.1,
        H_kt: 0.5,
        T2m: 25,
        WS10m: 2,
        Int: 0
      }))
    }
  };
};
