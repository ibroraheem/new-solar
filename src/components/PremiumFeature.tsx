import React from 'react';
import { usePayment } from '../context/PaymentContext';

interface PremiumFeatureProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PremiumFeature: React.FC<PremiumFeatureProps> = ({ 
  children, 
  fallback = (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
      <p className="text-gray-600 mb-4">
        This feature is only available for premium users. Upgrade now to access all features!
      </p>
      <button
        onClick={() => window.location.href = '/upgrade'}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Upgrade to Premium
      </button>
    </div>
  )
}) => {
  const { isPremium } = usePayment();

  if (!isPremium) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}; 