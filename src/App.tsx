import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PaymentProvider } from './context/PaymentContext';
import { PaymentPage } from './pages/PaymentPage';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentCancelled } from './pages/PaymentCancelled';
import { PremiumFeature } from './components/PremiumFeature';
import { SystemOverview } from './components/SystemOverview';
import { InverterSelection } from './components/InverterSelection';
import { ComponentSelection } from './components/ComponentSelection';
import { PDFReport } from './components/PDFReport';
import Toast from './components/ui/Toast';

const App: React.FC = () => {
  return (
    <PaymentProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<SystemOverview />} />
            <Route path="/upgrade" element={<PaymentPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancelled" element={<PaymentCancelled />} />

            {/* Premium routes */}
            <Route
              path="/inverters"
              element={
                <PremiumFeature>
                  <InverterSelection />
                </PremiumFeature>
              }
            />
            <Route
              path="/components"
              element={
                <PremiumFeature>
                  <ComponentSelection />
                </PremiumFeature>
              }
            />
            <Route
              path="/report"
              element={
                <PremiumFeature>
                  <PDFReport />
                </PremiumFeature>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toast />
        </div>
      </Router>
    </PaymentProvider>
  );
};

export default App;