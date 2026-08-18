import React from 'react';
import { Home, Building2, MapPin, DollarSign, ArrowRight } from 'lucide-react';

interface RealEstateAlpacaBridgeProps {
  title: string;
  description: string;
  price: number;
  location: string;
}

export const RealEstateAlpacaBridge: React.FC<RealEstateAlpacaBridgeProps> = ({
  title,
  description,
  price,
  location,
}) => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Home className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>

      <p className="text-gray-600 mb-6">{description}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2 text-gray-700">
          <DollarSign className="w-5 h-5 text-green-600" />
          <span className="font-semibold">${price.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin className="w-5 h-5 text-red-500" />
          <span>{location}</span>
        </div>
      </div>

      <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
        View Property Details
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};