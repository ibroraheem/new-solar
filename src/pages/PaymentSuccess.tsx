import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePayment } from '../context/PaymentContext';
import toast from 'react-hot-toast';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyPayment, isPremium } = usePayment();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');

    if (reference || trxref) {
      const paymentRef = reference || trxref;
      
      if (paymentRef) {
        verifyPayment(paymentRef)
          .then(() => {
            toast.success('Payment verified successfully! Welcome to Premium!');
            setIsVerifying(false);
          })
          .catch((error) => {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed. Please contact support.');
            setIsVerifying(false);
          });
      }
    } else {
      setIsVerifying(false);
    }
  }, [searchParams, verifyPayment]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we verify your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. You now have access to all premium features.
        </p>

        {isPremium ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="font-medium text-green-800 mb-2">Premium Features Unlocked:</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Advanced Inverter Selection</li>
                <li>• Component Comparison Tool</li>
                <li>• Detailed PDF Reports</li>
                <li>• Multiple System Designs</li>
                <li>• Cost Analysis</li>
                <li>• Technical Support</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Start Using Premium Features
              </button>
              
              <button
                onClick={() => navigate('/inverters')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Advanced Inverter Selection
              </button>
              
              <button
                onClick={() => navigate('/components')}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
              >
                Component Comparison
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-800">
                Your payment was successful, but we're having trouble activating your premium access. 
                Please contact support with your payment reference.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Return to Calculator
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            A confirmation email has been sent to your email address.
          </p>
        </div>
      </div>
    </div>
  );
};

export { PaymentSuccess }; 