import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  // Enable CORS with proper configuration
  const headers = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://your-domain.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const { lat, lon } = event.queryStringParameters || {};

    if (!lat || !lon) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing latitude or longitude parameters',
          required: ['lat', 'lon'],
          received: { lat, lon }
        }),
      };
    }

    // Validate coordinates
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid coordinates provided',
          received: { lat, lon }
        }),
      };
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Coordinates out of valid range',
          latitude: { min: -90, max: 90, received: latitude },
          longitude: { min: -180, max: 180, received: longitude }
        }),
      };
    }

    // Log the request parameters
    console.log('Fetching PVGIS data for:', { latitude, longitude });

    // Use the correct PVGIS API endpoint (PVcalc instead of seriescalc)
    const pvgisUrl = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?` +
      `lat=${latitude}&lon=${longitude}` +
      `&peakpower=1` +
      `&loss=14` +
      `&angle=35&aspect=0` +
      `&mountingplace=free` +
      `&outputformat=json`;

    console.log('PVGIS URL:', pvgisUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(pvgisUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SolarSystemDesigner/1.0',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PVGIS API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: pvgisUrl
      });
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: 'PVGIS API error',
          status: response.status,
          statusText: response.statusText,
          details: errorText
        }),
      };
    }

    const data = await response.json();
    console.log('PVGIS response received:', {
      hasOutputs: !!data.outputs,
      hasMonthly: !!data.outputs?.monthly,
      hasFixed: !!data.outputs?.monthly?.fixed,
      monthlyDataLength: data.outputs?.monthly?.fixed?.length,
      responseSize: JSON.stringify(data).length
    });

    if (!data.outputs?.monthly?.fixed) {
      console.error('Invalid PVGIS response structure:', data);
      throw new Error('Invalid response structure from PVGIS API - missing monthly.fixed data');
    }

    // Extract monthly data and find the month with lowest E_m (monthly energy)
    const monthlyData = data.outputs.monthly.fixed as Array<{ month: number; E_d: number; E_m: number }>;
    let minEm = Infinity;
    let worstMonth: { month: number; E_d: number; E_m: number } | null = null;

    monthlyData.forEach((month) => {
      if (month.E_m < minEm) {
        minEm = month.E_m;
        worstMonth = month;
      }
    });

    if (!worstMonth) {
      throw new Error('Could not determine worst month from PVGIS data');
    }

    console.log('Calculated worst month:', { 
      month: worstMonth.month, 
      E_d: worstMonth.E_d, 
      E_m: worstMonth.E_m 
    });

    // Return the data in the format expected by the frontend
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        outputs: {
          monthly: monthlyData.map((month) => ({
            month: month.month,
            E_d: month.E_d
          }))
        },
        worstMonth: {
          month: worstMonth.month,
          E_day: worstMonth.E_d
        },
        meta: {
          source: 'PVGIS API v5_2',
          coordinates: { latitude, longitude },
          timestamp: new Date().toISOString()
        }
      }),
    };
  } catch (error) {
    // Log the full error details
    console.error('Error in PVGIS proxy:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      event: {
        httpMethod: event.httpMethod,
        path: event.path,
        queryStringParameters: event.queryStringParameters
      }
    });

    // Return a more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTimeout = errorMessage.includes('timeout') || errorMessage.includes('abort');
    const isNetworkError = errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('ENOTFOUND');

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch PVGIS data',
        details: errorMessage,
        type: isTimeout ? 'timeout' : isNetworkError ? 'network' : 'unknown',
        timestamp: new Date().toISOString()
      }),
    };
  }
};

export { handler }; 