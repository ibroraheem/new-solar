import React from 'react';
import { Sun } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sun className="h-8 w-8 text-yellow-300" />
          <h1 className="text-2xl font-bold tracking-tight">SolarMate</h1>
          <span className="hidden md:inline-block text-sm bg-green-700 px-2 py-0.5 rounded-full">
            Nigeria
          </span>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <a href="#calculator" className="hover:text-yellow-200 transition-colors">
                Calculator
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-yellow-200 transition-colors">
                How It Works
              </a>
            </li>
            <li>
              <a href="#about" className="hover:text-yellow-200 transition-colors">
                About
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;