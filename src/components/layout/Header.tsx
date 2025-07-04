import React, { useState } from 'react';
import { Sun, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-green-700 via-green-500 to-yellow-400 text-white shadow-lg animate-fade-in">
      <div className="container mx-auto px-4 py-6">
        {/* Mobile Header */}
        <div className="flex items-center justify-between md:hidden">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center h-12 w-12 bg-yellow-300 rounded-full shadow-lg">
              <Sun className="h-7 w-7 text-green-700" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight drop-shadow-lg font-display text-green-900">SolarMate</h1>
              <p className="text-xs text-yellow-900 font-medium">Design your perfect solar system</p>
            </div>
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-green-900 hover:text-yellow-900 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-yellow-300">
            <nav className="pt-4">
              <ul className="flex flex-col space-y-3 text-lg font-semibold">
                <li>
                  <a href="#calculator" className="block hover:text-yellow-200 transition-colors" onClick={() => setIsMenuOpen(false)}>Calculator</a>
                </li>
                <li>
                  <a href="#how-it-works" className="block hover:text-yellow-200 transition-colors" onClick={() => setIsMenuOpen(false)}>How It Works</a>
                </li>
                <li>
                  <a href="#about" className="block hover:text-yellow-200 transition-colors" onClick={() => setIsMenuOpen(false)}>About</a>
                </li>
                <li>
                  <a href="/faq" className="block hover:text-yellow-200 transition-colors" onClick={() => setIsMenuOpen(false)}>FAQ</a>
                </li>
              </ul>
            </nav>
          </div>
        )}

        {/* Desktop Header */}
        <div className="hidden md:flex flex-col items-center justify-center py-4">
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
      </div>
    </header>
  );
};

export default Header;