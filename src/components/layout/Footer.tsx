import React from 'react';
import { Sun, Twitter, Facebook, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-green-900 via-green-700 to-yellow-500 text-white py-10 border-t-4 border-yellow-400 shadow-inner animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sun className="h-7 w-7 text-yellow-300 animate-spin-slow" />
              <h2 className="text-2xl font-extrabold font-display">SolarMate</h2>
            </div>
            <span className="inline-block text-xs font-semibold bg-green-800 bg-opacity-80 px-2 py-0.5 rounded-full mb-2 text-yellow-200 shadow">Made in Nigeria</span>
            <p className="text-gray-200 mb-4">
              Smart solar sizing for Nigerian homes and businesses.<br />
              Get accurate solar system recommendations tailored to your needs.
            </p>
            <div className="flex space-x-4 mt-2">
              <a href="#" className="text-yellow-300 hover:text-white transition-colors">
                <Twitter size={22} />
              </a>
              <a href="#" className="text-yellow-300 hover:text-white transition-colors">
                <Facebook size={22} />
              </a>
              <a href="#" className="text-yellow-300 hover:text-white transition-colors">
                <Instagram size={22} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#calculator" className="text-gray-200 hover:text-white transition-colors">Solar Calculator</a>
              </li>
              <li>
                <a href="#how-it-works" className="text-gray-200 hover:text-white transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#about" className="text-gray-200 hover:text-white transition-colors">About Us</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-200 mb-2">Abuja, Nigeria</p>
            <p className="text-gray-200 mb-2">ibroraheem95@gmail.com</p>
            <p className="text-gray-200">+2349066730744</p>
          </div>
        </div>
        
        <div className="border-t border-yellow-300 mt-8 pt-6 text-center text-yellow-100">
          <p>&copy; {currentYear} SolarMate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;