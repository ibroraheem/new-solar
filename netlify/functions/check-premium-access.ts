import { Handler } from '@netlify/functions';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production';

const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://your-domain.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const authHeader = event.headers.authorization;
    
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No access token provided' }),
      };
    }

    // Extract the token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the JWT token
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Check if token is expired
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Token expired' }),
        };
      }

      // Token is valid
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: 'Access granted',
          user: {
            email: decoded.userId,
            reference: decoded.reference,
            amount: decoded.amount
          }
        }),
      };
    } catch (jwtError) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' }),
      };
    }
  } catch (error) {
    console.error('Access check error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to verify access',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

export { handler }; 