import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { LocationData } from '../../types';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Nigerian cities with their coordinates
const NIGERIAN_CITIES: LocationData[] = [
  { city: 'Abuja', latitude: 9.0765, longitude: 7.3986 },
  { city: 'Aba', latitude: 5.1167, longitude: 7.3667 },
  { city: 'Ado Ekiti', latitude: 7.6167, longitude: 5.2167 },
  { city: 'Akure', latitude: 7.2571, longitude: 5.2058 },
  { city: 'Asaba', latitude: 6.2000, longitude: 6.7333 },
  { city: 'Awka', latitude: 6.2167, longitude: 7.0667 },
  { city: 'Bauchi', latitude: 10.3158, longitude: 9.8442 },
  { city: 'Benin City', latitude: 6.3350, longitude: 5.6037 },
  { city: 'Birnin Kebbi', latitude: 12.4500, longitude: 4.2000 },
  { city: 'Calabar', latitude: 4.9757, longitude: 8.3417 },
  { city: 'Damaturu', latitude: 11.7500, longitude: 11.9667 },
  { city: 'Dutse', latitude: 11.8333, longitude: 9.3333 },
  { city: 'Ekpoma', latitude: 6.7500, longitude: 6.1333 },
  { city: 'Effurun', latitude: 5.5667, longitude: 5.7833 },
  { city: 'Enugu', latitude: 6.4584, longitude: 7.5464 },
  { city: 'Gombe', latitude: 10.2867, longitude: 11.1667 },
  { city: 'Gusau', latitude: 12.1667, longitude: 6.6667 },
  { city: 'Ibadan', latitude: 7.3775, longitude: 3.9470 },
  { city: 'Ikare', latitude: 7.5167, longitude: 5.7500 },
  { city: 'Ilesha', latitude: 7.6167, longitude: 4.7167 },
  { city: 'Ilorin', latitude: 8.5000, longitude: 4.5500 },
  { city: 'Jalingo', latitude: 8.9000, longitude: 11.3667 },
  { city: 'Jos', latitude: 9.8965, longitude: 8.8583 },
  { city: 'Kaduna', latitude: 10.5222, longitude: 7.4383 },
  { city: 'Kano', latitude: 12.0022, longitude: 8.5920 },
  { city: 'Katsina', latitude: 12.9908, longitude: 7.6017 },
  { city: 'Lafia', latitude: 8.5000, longitude: 8.5167 },
  { city: 'Lagos', latitude: 6.4550, longitude: 3.3841 },
  { city: 'Lokoja', latitude: 7.8167, longitude: 6.7333 },
  { city: 'Maiduguri', latitude: 11.8333, longitude: 13.1500 },
  { city: 'Makurdi', latitude: 7.7333, longitude: 8.5333 },
  { city: 'Minna', latitude: 9.6167, longitude: 6.5500 },
  { city: 'Nnewi', latitude: 6.0167, longitude: 6.9167 },
  { city: 'Nsukka', latitude: 6.8667, longitude: 7.3833 },
  { city: 'Ogbomoso', latitude: 8.1333, longitude: 4.2500 },
  { city: 'Ogoja', latitude: 6.6500, longitude: 8.8000 },
  { city: 'Okene', latitude: 7.5500, longitude: 6.2333 },
  { city: 'Ondo', latitude: 7.1000, longitude: 4.8333 },
  { city: 'Onitsha', latitude: 6.1667, longitude: 6.7833 },
  { city: 'Oshogbo', latitude: 7.7667, longitude: 4.5667 },
  { city: 'Owerri', latitude: 5.4836, longitude: 7.0332 },
  { city: 'Owo', latitude: 7.2000, longitude: 5.5833 },
  { city: 'Port Harcourt', latitude: 4.8156, longitude: 7.0498 },
  { city: 'Sapele', latitude: 5.9000, longitude: 5.6833 },
  { city: 'Sokoto', latitude: 13.0622, longitude: 5.2339 },
  { city: 'Ughelli', latitude: 5.5000, longitude: 6.0000 },
  { city: 'Umuahia', latitude: 5.5333, longitude: 7.4833 },
  { city: 'Uyo', latitude: 5.0333, longitude: 7.9333 },
  { city: 'Warri', latitude: 5.5167, longitude: 5.7500 },
  { city: 'Yenagoa', latitude: 4.9167, longitude: 6.2667 },
  { city: 'Yola', latitude: 9.2035, longitude: 12.4954 },
  { city: 'Zaria', latitude: 11.1113, longitude: 7.7227 },
];

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (location: LocationData) => void }) {
  useMapEvents({
    click: (e: any) => {
      const { lat, lng } = e.latlng;
      onLocationSelect({
        city: `Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        latitude: lat,
        longitude: lng,
      });
    },
  });
  return null;
}

interface LocationInputProps {
  onLocationSelect: (location: { latitude: number; longitude: number }) => void;
}

export const LocationInput: React.FC<LocationInputProps> = ({ onLocationSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string>('');

  const filteredCities = searchTerm
    ? NIGERIAN_CITIES.filter((city) =>
        city.city.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : NIGERIAN_CITIES;

  const handleSelectCity = (city: LocationData) => {
    setSelectedLocation(city);
    setShowDropdown(false);
    setSearchTerm(city.city);
    onLocationSelect({ latitude: city.latitude, longitude: city.longitude });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Select Location</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Nigerian Cities
        </label>
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search cities..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  if (e.target.value !== selectedLocation?.city) {
                    setSelectedLocation(null);
                  }
                }}
                onFocus={() => setShowDropdown(true)}
              />
              {selectedLocation && searchTerm === selectedLocation.city && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">
                  {selectedLocation.latitude.toFixed(4)}°, {selectedLocation.longitude.toFixed(4)}°
                </div>
              )}
            </div>

            <button
              type="button"
              className="flex-shrink-0 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => setShowMap(!showMap)}
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          {showDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto">
              <ul className="py-1">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <li
                      key={city.city}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                      onClick={() => handleSelectCity(city)}
                    >
                      <span>{city.city}</span>
                      <span className="text-gray-500 text-sm">
                        {city.latitude.toFixed(4)}°, {city.longitude.toFixed(4)}°
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-500">No cities found</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {showMap && (
        <div className="mt-4 h-96 rounded-lg overflow-hidden shadow-md">
          <MapContainer
            center={[9.0765, 7.3986]} // Center of Nigeria (Abuja)
            zoom={6}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapClickHandler onLocationSelect={handleSelectCity} />
            {selectedLocation && (
              <Marker
                position={[selectedLocation.latitude, selectedLocation.longitude]}
              />
            )}
          </MapContainer>
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600">{error}</div>
      )}

      {!selectedLocation && (
        <p className="mt-2 text-sm text-orange-600">
          Please select your location for accurate solar calculations
        </p>
      )}
    </div>
  );
};

export default LocationInput;