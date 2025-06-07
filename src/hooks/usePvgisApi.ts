import { useState } from 'react';
import { PvgisData } from '../types';
import { NigerianRegion, getNigerianRegion } from '../utils/calculations';

interface MonthlyData {
  month: number;
  pvout: number;
  eday: number; // Daily energy output for 1kWp
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
      E_d: number; // Daily energy output
      H_d: number; // Daily radiation
    }[];
  };
}

// List of proxy servers to try if CORS fails
const PROXY_SERVERS = [
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest='
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

    const pvgisUrl = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${latitude}&lon=${longitude}&peakpower=1&loss=14&outputformat=basic`;

    // Try each proxy server in sequence
    for (const proxy of PROXY_SERVERS) {
      try {
        const response = await fetch(proxy + encodeURIComponent(pvgisUrl), {
          method: 'GET',
          headers: {
            'Accept': 'text/html',
          },
        });

        if (!response.ok) {
          continue; // Try next proxy if this one fails
        }

        const text = await response.text();
        
        // Parse the HTML table response
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const table = doc.querySelector('table');
        
        if (!table) {
          continue; // Try next proxy if no table found
        }

        // Extract monthly data from the table
        const rows = Array.from(table.querySelectorAll('tr')).slice(1); // Skip header row
        const monthlyData = rows.map((row, index) => {
          const cells = row.querySelectorAll('td');
          const eday = parseFloat(cells[1]?.textContent || '0'); // E_day value for 1kWp
          return {
            month: index + 1,
            pvout: eday * 30, // Convert daily to monthly values
            eday // Store the daily value for 1kWp
          };
        });

        // Extract annual total
        const annualRow = rows[rows.length - 1];
        const annualEday = parseFloat(annualRow.querySelectorAll('td')[1]?.textContent || '0');

        // Find the worst daily value (minimum E_day)
        const worstDayPvout = Math.min(...monthlyData.map(month => month.eday));

        const transformedData: PvgisData = {
          monthly: monthlyData.map(({ month, pvout }) => ({ month, pvout })),
          annual: {
            pvout: annualEday * 30 / 12 // Convert annual daily average to monthly
          },
          meta: {
            latitude,
            longitude,
            elevation: 0,
            worstDayPvout // This is the minimum E_day for 1kWp
          }
        };

        setLoading(false);
        return transformedData;
      } catch (err) {
        console.error(`Error with proxy ${proxy}:`, err);
        continue; // Try next proxy
      }
    }

    // If all proxies fail, use fallback data
    console.error('All proxies failed, using fallback data');
    setError('Failed to fetch solar data. Using regional averages.');
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
