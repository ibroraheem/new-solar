import React from 'react';
import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  isLoading?: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
  isLoading = false,
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">Calculation Progress</h4>
        <span className="text-sm text-gray-500">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
        <motion.div
          className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        {isLoading && (
          <motion.div
            className="absolute top-0 left-0 h-full bg-green-400 rounded-full"
            animate={{
              x: ["0%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ width: "20%" }}
          />
        )}
      </div>

      {/* Step Labels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {stepLabels.map((label, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 p-2 rounded-md text-xs ${
              index < currentStep
                ? 'bg-green-50 text-green-700'
                : index === currentStep
                ? 'bg-blue-50 text-blue-700'
                : 'bg-gray-50 text-gray-500'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                index < currentStep
                  ? 'bg-green-500'
                  : index === currentStep
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
              }`}
            />
            <span className="font-medium">{label}</span>
            {index === currentStep && isLoading && (
              <motion.div
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Description */}
      {currentStep <= totalSteps && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-700">
            {isLoading ? 'Processing...' : `Currently: ${stepLabels[currentStep - 1]}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator; 