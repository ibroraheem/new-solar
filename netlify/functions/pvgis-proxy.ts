import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  // Handle preflight requests
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
        body: JSON.stringify({ error: 'Missing required parameters: lat and lon' }),
      };
    }

    const url = `https://re.jrc.ec.europa.eu/api/v5_2/seriescalc?` +
      `lat=${lat}&lon=${lon}` +
      `&startyear=2023&endyear=2023&outputformat=json` +
      `&mountingplace=fixed&pvtechchoice=crystSi&peakpower=1&loss=14`;

    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('PVGIS proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch PVGIS data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}; 