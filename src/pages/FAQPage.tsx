import React from 'react';

const FAQPage: React.FC = () => (
  <div className="max-w-2xl mx-auto py-10 px-4">
    <h1 className="text-3xl font-bold mb-6 text-green-700">Frequently Asked Questions</h1>
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">How is my solar system size calculated?</h2>
        <p className="text-gray-700">We use your selected appliances, their usage times, and your location's solar data to estimate the minimum system size needed to meet your energy needs year-round. Our calculations are based on the worst-month scenario to ensure reliability.</p>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Why do I need a professional solar audit?</h2>
        <p className="text-gray-700">While our calculator provides a good starting point, a professional audit includes site survey, shading analysis, electrical load verification, and compliance checks. This ensures optimal system performance and safety.</p>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">What's included in a professional solar audit?</h2>
        <p className="text-gray-700">Our comprehensive audit (₦25,000) includes site survey, roof assessment, electrical load analysis, shading analysis, detailed cost breakdown, installation timeline, and warranty & maintenance planning.</p>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Can I use this app for both homes and offices?</h2>
        <p className="text-gray-700">Absolutely! The app supports both home and office appliances and usage patterns. Just select the relevant appliances and usage times for accurate calculations.</p>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">How do I get help or request a custom quote?</h2>
        <p className="text-gray-700">Contact us via WhatsApp (+2349066730744) or email (ibroraheem95@gmail.com) for professional consultation, custom system design, and installation services. Professional audits are ₦25,000.</p>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">What warranty do you provide?</h2>
        <p className="text-gray-700">We offer 1-5 years warranty on major components depending on the manufacturer. Our professional installation includes comprehensive warranty coverage and ongoing support.</p>
      </div>
    </div>
  </div>
);

export default FAQPage; 