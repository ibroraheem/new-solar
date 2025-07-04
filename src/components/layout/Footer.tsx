import React from 'react';
import { Sun } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-green-900 via-green-700 to-yellow-500 text-white py-10 border-t-4 border-yellow-400 shadow-inner animate-fade-in mt-12">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <div className="flex flex-col items-center mb-6">
          <span className="flex items-center justify-center h-10 w-10 bg-yellow-300 rounded-full shadow-lg mb-2">
            <Sun className="h-6 w-6 text-green-700" />
          </span>
          <h2 className="text-2xl font-extrabold font-display text-green-100 drop-shadow">SolarMate</h2>
        </div>
        <p className="text-center text-yellow-100 text-sm max-w-xl mb-4">
          Smart solar system design for Nigerian homes and businesses. Get accurate, professional recommendations and connect with certified installers.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-2xl mt-4 border-t border-yellow-300 pt-6">
          <div className="text-yellow-100 text-xs md:text-sm mb-2 md:mb-0">&copy; {currentYear} SolarMate. All rights reserved.</div>
          <div className="text-yellow-100 text-xs md:text-sm">
            Developed by{' '}
            <a href="https://x.com/ibroraheem" target="_blank" rel="noopener noreferrer" className="underline hover:text-white font-semibold">@ibroraheem</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;