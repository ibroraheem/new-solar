import React from 'react';

const FAQPage: React.FC = () => (
  <div className="max-w-2xl mx-auto py-10 px-4">
    <h1 className="text-3xl font-bold mb-6 text-green-700">Frequently Asked Questions</h1>
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">How is my solar system size calculated?</h2>
        <p className="text-gray-700">We use your selected appliances, their usage times, and your location's solar data to estimate the minimum system size needed to meet your energy needs year-round.</p>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Are the prices shown accurate for Nigeria?</h2>
        <p className="text-gray-700">Yes, all prices are based on current Nigerian market rates. However, prices can change due to market fluctuations. Always confirm with your installer or supplier.</p>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Why is cable price not included?</h2>
        <p className="text-gray-700">Cable prices can vary greatly depending on installation specifics. We recommend the correct size and length, but do not include the price in the total system cost.</p>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Can I use this app for both homes and offices?</h2>
        <p className="text-gray-700">Absolutely! The app supports both home and office appliances and usage patterns. Just select the relevant appliances and usage times.</p>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">How do I get help or request a custom quote?</h2>
        <p className="text-gray-700">Visit our Contact page to reach us via WhatsApp or email for support or a custom system design.</p>
      </div>
    </div>
  </div>
);

export default FAQPage; 