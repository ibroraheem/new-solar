import React, { createContext, useContext, useState, useEffect } from 'react';

interface PaymentContextType {
  isPremium: boolean;
  accessToken: string | null;
  initiatePayment: (email: string) => Promise<void>;
  verifyPayment: (reference: string) => Promise<void>;
  logout: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing token in localStorage
    const storedToken = localStorage.getItem('premium_access_token');
    if (storedToken) {
      setAccessToken(storedToken);
      setIsPremium(true);
    }
  }, []);

  const initiatePayment = async (email: string) => {
    try {
      const response = await fetch('/.netlify/functions/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.authorizationUrl) {
        // Redirect to Paystack payment page
        window.location.href = data.authorizationUrl;
      } else {
        throw new Error('Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      throw error;
    }
  };

  const verifyPayment = async (reference: string) => {
    try {
      const response = await fetch(`/.netlify/functions/verify-payment?reference=${reference}`);
      const data = await response.json();

      if (data.success && data.accessToken) {
        localStorage.setItem('premium_access_token', data.accessToken);
        setAccessToken(data.accessToken);
        setIsPremium(true);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('premium_access_token');
    setAccessToken(null);
    setIsPremium(false);
  };

  return (
    <PaymentContext.Provider
      value={{
        isPremium,
        accessToken,
        initiatePayment,
        verifyPayment,
        logout,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}; 