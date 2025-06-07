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

    // Use 'building' for mountingplace as it's more appropriate for residential installations
    const pvgisUrl = `https://re.jrc.ec.europa.eu/api/seriescalc?lat=${lat}&lon=${lon}&startyear=2020&endyear=2020&outputformat=json&mountingplace=building&pvtechchoice=crystSi&peakpower=1&loss=14`;

    const response = await fetch(pvgisUrl);
    const data = await response.json();

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
    console.error('Error fetching PVGIS data:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch PVGIS data' }),
    };
  }
};

export { handler }; 