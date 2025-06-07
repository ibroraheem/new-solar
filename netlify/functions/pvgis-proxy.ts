import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
        body: JSON.stringify({ error: 'Missing latitude or longitude parameters' }),
      };
    }

    // Log the request parameters
    console.log('Fetching PVGIS data for:', { lat, lon });

    const pvgisUrl = `https://re.jrc.ec.europa.eu/api/seriescalc?lat=${lat}&lon=${lon}&startyear=2020&endyear=2020&outputformat=json&mountingplace=building&pvtechchoice=crystSi&peakpower=1&loss=14`;
    
    console.log('PVGIS URL:', pvgisUrl);

    const response = await fetch(pvgisUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('PVGIS API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: 'PVGIS API error',
          details: errorText
        }),
      };
    }

    const data = await response.json();
    console.log('PVGIS response received:', { 
      hasOutputs: !!data.outputs,
      monthlyDataLength: data.outputs?.monthly?.length
    });

    // Extract monthly data and find minimum E_day
    const monthlyData = data.outputs.monthly;
    let minEday = Infinity;
    let minEdayMonth = 0;

    monthlyData.forEach((month: { month: number; E_d: number }) => {
      if (month.E_d < minEday) {
        minEday = month.E_d;
        minEdayMonth = month.month;
      }
    });

    // Return both the full data and the minimum E_day info
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ...data,
        worstMonth: {
          month: minEdayMonth,
          E_day: minEday
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
      } : error
    });

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch PVGIS data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

export { handler }; 