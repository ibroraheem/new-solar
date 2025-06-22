import React, { useState } from 'react';
import { FileText, Download, CreditCard } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PdfReportSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { hasPdfAccess, revokePdfAccess } = usePayment();
  const navigate = useNavigate();

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      // Redirect to payment page where user can enter email
      navigate('/upgrade');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!hasPdfAccess) {
      toast.error('Please purchase PDF access first');
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement actual PDF generation and download
      // For now, simulate download
      toast.success('PDF report downloaded successfully!');
      
      // Revoke access after successful download
      setTimeout(() => {
        revokePdfAccess();
        toast.success('Access revoked. Purchase again for another report.');
      }, 2000);
      
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-col md:flex-row items-center">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <FileText className="h-6 w-6 text-green-500 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">Detailed PDF Report</h3>
          </div>
          
          <p className="text-gray-600 mb-4">
            Get a comprehensive report with detailed specifications, sizing calculations,
            and installation guidelines tailored to your energy needs.
          </p>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-500 mr-2">✓</span>
              <span className="text-gray-700">Complete system specifications</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-500 mr-2">✓</span>
              <span className="text-gray-700">Detailed sizing calculations</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-500 mr-2">✓</span>
              <span className="text-gray-700">Installation and maintenance guidelines</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-500 mr-2">✓</span>
              <span className="text-gray-700">Cost saving estimates and ROI analysis</span>
            </li>
          </ul>
        </div>
        
        <div className="w-full md:w-auto flex flex-col items-center">
          <div className="bg-gray-100 rounded-lg p-4 mb-4 w-full text-center">
            <p className="text-gray-500 text-sm">Per project</p>
            <p className="text-3xl font-bold text-gray-900">₦10,000</p>
          </div>
          
          <button
            type="button"
            onClick={hasPdfAccess ? handleDownload : handlePayment}
            disabled={isLoading}
            className={`w-full md:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
            }`}
          >
            {hasPdfAccess ? (
              <>
                <Download className="h-5 w-5 mr-2" />
                {isLoading ? 'Downloading...' : 'Download PDF Report'}
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                {isLoading ? 'Processing...' : 'Pay ₦10,000 with Paystack'}
              </>
            )}
          </button>
          
          <p className="mt-2 text-xs text-gray-500">
            Secure payment via Paystack
          </p>
        </div>
      </div>
      
      <div className="mt-4 border-t border-gray-200 pt-4 text-center">
        <p className="text-sm text-gray-600">
          Need a custom consultation? <a href="https://wa.me/2349066730744" className="text-green-600 hover:text-green-700">Contact our solar experts</a>
        </p>
      </div>
    </div>
  );
};

export default PdfReportSection;
export { PdfReportSection };