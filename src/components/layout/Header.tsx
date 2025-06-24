import React from 'react';
import { Sun } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-green-700 via-green-500 to-yellow-400 text-white shadow-lg animate-fade-in">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="relative flex items-center justify-center h-12 w-12 bg-yellow-300 rounded-full shadow-lg animate-bounce-slow">
            <Sun className="h-8 w-8 text-green-700" />
            <span className="absolute bottom-0 right-0 bg-green-700 text-xs text-white px-2 py-0.5 rounded-full border-2 border-yellow-300 shadow">NG</span>
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-lg font-display">SolarMate</h1>
            <span className="block text-xs font-semibold bg-green-800 bg-opacity-80 px-2 py-0.5 rounded-full mt-1 text-yellow-200 shadow">Made in Nigeria</span>
          </div>
        </div>
        <div className="hidden md:block text-center flex-1">
          <span className="text-lg font-semibold italic text-yellow-100 drop-shadow">Smart Solar Sizing for Nigeria</span>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <a href="#calculator" className="hover:text-yellow-200 transition-colors font-semibold">Calculator</a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-yellow-200 transition-colors font-semibold">How It Works</a>
            </li>
            <li>
              <a href="#about" className="hover:text-yellow-200 transition-colors font-semibold">About</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;