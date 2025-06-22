import React, { createContext, useContext, useState, useEffect } from 'react';

interface PaymentContextType {
  hasPdfAccess: boolean;
  accessToken: string | null;
  initiatePayment: (email: string) => Promise<void>;
  verifyPayment: (reference: string) => Promise<void>;
  revokePdfAccess: () => void;
  logout: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasPdfAccess, setHasPdfAccess] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing token in localStorage
    const storedToken = localStorage.getItem('pdf_access_token');
    if (storedToken) {
      setAccessToken(storedToken);
      setHasPdfAccess(true);
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
        localStorage.setItem('pdf_access_token', data.accessToken);
        setAccessToken(data.accessToken);
        setHasPdfAccess(true);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  };

  const revokePdfAccess = () => {
    localStorage.removeItem('pdf_access_token');
    setAccessToken(null);
    setHasPdfAccess(false);
  };

  const logout = () => {
    localStorage.removeItem('pdf_access_token');
    setAccessToken(null);
    setHasPdfAccess(false);
  };

  return (
    <PaymentContext.Provider
      value={{
        hasPdfAccess,
        accessToken,
        initiatePayment,
        verifyPayment,
        revokePdfAccess,
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