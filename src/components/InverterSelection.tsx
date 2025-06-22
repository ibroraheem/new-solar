import React from 'react';

const InverterSelection: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">Inverter Selection</h1>
      <p className="text-lg text-gray-700 mb-8">Premium feature for detailed inverter selection.</p>
      <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded">
        <strong>Premium Feature:</strong> This feature is under development.
      </div>
    </div>
  );
};

export { InverterSelection }; 