import { useState } from 'react';

interface MonthlyData {
  month: number;
  E_d: number;
  E_m: number;
  H_i_d: number;
  H_i_m: number;
  SD_m: number;
}

interface PvgisResponse {
  inputs: {
    location: {
      latitude: number;
      longitude: number;
      elevation: number;
    };
    pv_module: {
      technology: string;
      peak_power: number;
      system_loss: number;
    };
  };
  outputs: {
    monthly: {
      fixed: MonthlyData[];
    };
    totals: {
      fixed: {
        E_d: number;
        E_m: number;
        E_y: number;
        H_i_d: number;
        H_i_m: number;
        H_i_y: number;
      };
    };
  };
}

export const usePvgisData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PvgisResponse | null>(null);

  const fetchPvgisData = async (latitude: number, longitude: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/.netlify/functions/pvgis-proxy?lat=${latitude}&lon=${longitude}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch PVGIS data');
      }

      const data = await response.json();
      setData(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    data,
    fetchPvgisData,
  };
}; 