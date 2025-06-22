import React, { useState } from 'react';
import { usePayment } from '../context/PaymentContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PaymentPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { initiatePayment } = usePayment();
  const navigate = useNavigate();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      await initiatePayment(email);
      toast.success('Redirecting to payment gateway...');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const premiumFeatures = [
    {
      title: 'Advanced Inverter Selection',
      description: 'Compare and select from multiple inverter brands and models with detailed specifications',
      icon: '⚡'
    },
    {
      title: 'Component Comparison Tool',
      description: 'Side-by-side comparison of solar panels, batteries, and other components',
      icon: '🔍'
    },
    {
      title: 'Detailed PDF Reports',
      description: 'Generate comprehensive PDF reports with system specifications, costs, and ROI analysis',
      icon: '📄'
    },
    {
      title: 'Multiple System Designs',
      description: 'Save and compare different system configurations for your location',
      icon: '💾'
    },
    {
      title: 'Cost Analysis',
      description: 'Detailed cost breakdown including installation, maintenance, and payback period',
      icon: '💰'
    },
    {
      title: 'Technical Support',
      description: 'Priority access to technical support and installation guidance',
      icon: '🛠️'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upgrade to Premium</h1>
          <p className="text-xl text-gray-600 mb-2">Get access to advanced solar system design features</p>
          <div className="text-3xl font-bold text-green-600">₦10,000</div>
          <p className="text-gray-500">One-time payment • Lifetime access</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Premium Features */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Premium Features</h2>
            <div className="space-y-4">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Complete Your Purchase</h2>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="your@email.com"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  We'll send your access details to this email
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                }`}
              >
                {isLoading ? 'Processing...' : 'Pay ₦10,000 with Paystack'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium text-gray-900 mb-2">What's included:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Lifetime access to all premium features</li>
                <li>• No recurring payments</li>
                <li>• Secure payment via Paystack</li>
                <li>• Instant access after payment</li>
                <li>• 30-day money-back guarantee</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back to Calculator */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Solar Calculator
          </button>
        </div>
      </div>
    </div>
  );
};

export { PaymentPage }; 