import React from 'react';
import { Sun } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-green-700 via-green-500 to-yellow-400 text-white shadow-lg animate-fade-in">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <span className="flex items-center justify-center h-16 w-16 bg-yellow-300 rounded-full shadow-lg animate-bounce-slow mb-2">
            <Sun className="h-10 w-10 text-green-700" />
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg font-display text-green-900">SolarMate</h1>
          <span className="block text-lg md:text-xl font-medium text-yellow-900 mt-1 drop-shadow-sm italic">Design your perfect solar system. Effortlessly.</span>
        </div>
        <nav className="mt-6">
          <ul className="flex space-x-8 text-lg font-semibold">
            <li>
              <a href="#calculator" className="hover:text-yellow-200 transition-colors">Calculator</a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-yellow-200 transition-colors">How It Works</a>
            </li>
            <li>
              <a href="#about" className="hover:text-yellow-200 transition-colors">About</a>
            </li>
            <li>
              <a href="/faq" className="hover:text-yellow-200 transition-colors">FAQ</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;