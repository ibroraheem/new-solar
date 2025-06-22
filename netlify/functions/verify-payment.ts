import { Handler } from '@netlify/functions';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production';

const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://your-domain.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
    const reference = event.queryStringParameters?.reference;

    if (!reference) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing reference parameter' }),
      };
    }

    // Verify the transaction with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status, data } = response.data;

    if (status && data.status === 'success') {
      // Generate a secure JWT token
      const tokenPayload = {
        userId: data.customer?.email || 'anonymous',
        reference: reference,
        amount: data.amount,
        paidAt: data.paid_at,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      };

      const accessToken = jwt.sign(tokenPayload, JWT_SECRET);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          accessToken,
          message: 'Payment verified successfully',
          amount: data.amount / 100, // Convert from kobo to naira
          currency: 'NGN'
        }),
      };
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Payment verification failed',
          status: data.status
        }),
      };
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to verify payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

export { handler }; 