import React from 'react';

const ContactPage: React.FC = () => (
  <div className="max-w-xl mx-auto py-10 px-4">
    <h1 className="text-3xl font-bold mb-6 text-green-700">Contact Us</h1>
    <p className="mb-4 text-gray-700">For support, questions, or to request a custom solar quote, reach out to us via WhatsApp or email:</p>
    <div className="space-y-4">
      <a
        href="https://wa.me/2349066730744"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition-colors"
      >
        WhatsApp: +234 906 673 0744
      </a>
      <div>
        <span className="block text-gray-700 mb-1">Email:</span>
        <a
          href="mailto:ibroraheem95@gmail.com"
          className="text-blue-600 hover:underline"
        >
          ibroraheem95@gmail.com
        </a>
      </div>
    </div>
  </div>
);

export default ContactPage; 