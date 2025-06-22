import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancelled: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. You can try again anytime or continue using the free features.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/upgrade')}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            Try Payment Again
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            Return to Calculator
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-2">Free Features Available:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Basic solar system calculation</li>
            <li>• Appliance-based energy calculation</li>
            <li>• Location-based solar data</li>
            <li>• Basic component recommendations</li>
            <li>• System overview and charts</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Need help?</strong> Contact us at support@solarsystemdesign.com
          </p>
        </div>
      </div>
    </div>
  );
};

export { PaymentCancelled }; 