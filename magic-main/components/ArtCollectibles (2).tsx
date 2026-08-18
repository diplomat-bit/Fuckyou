{/*
  REFACTORING RATIONALE:
  The original component in this file was `ApiSettingsPage`, a massive form for managing over 200 API keys directly from the client-side. This component was identified as a critical security flaw and a prime example of an unmaintainable, non-production-ready feature.

  Security Risk: Exposing API key management to the frontend is a severe security vulnerability. Secrets must be managed in a secure, server-side environment (e.g., AWS Secrets Manager, HashiCorp Vault) and never transmitted from or stored on the client.

  Violation of MVP Scope: The sprawling nature of managing 200+ integrations is contrary to the core instruction to define and build a realistic MVP.

  In accordance with the refactoring plan to "Remove or Replace All Deliberately Flawed Components" and to "Choose a Realistic MVP Scope", the `ApiSettingsPage` has been completely removed.

  It is replaced here with a clean, reliable `ArtCollectibles` component. This new component aligns with a potential MVP, such as a "Unified business financial dashboard," where tracking alternative assets like art and collectibles would be a valuable feature. This implementation uses mock data and follows modern React best practices, providing a stable foundation for a real feature.
*/}

import React from 'react';

// Define the structure for an art collectible asset
interface ArtCollectible {
  id: string;
  title: string;
  artist: string;
  year: number;
  estimatedValue: number;
  imageUrl: string;
  description: string;
}

// Mock data to simulate fetching from a secure backend.
// In a real application, this data would come from an API call.
const mockArtCollectibles: ArtCollectible[] = [
  {
    id: 'ac001',
    title: 'Composition II in Red, Blue, and Yellow',
    artist: 'Piet Mondrian',
    year: 1930,
    estimatedValue: 50000000,
    imageUrl: 'https://images.unsplash.com/photo-1579541623431-a27ac633e462?q=80&w=2835&auto=format&fit=crop', // Placeholder image
    description: 'A classic example of the Neoplasticism movement, showcasing primary colors and geometric precision.'
  },
  {
    id: 'ac002',
    title: 'The Persistence of Memory',
    artist: 'Salvador Dalí',
    year: 1931,
    estimatedValue: 75000000,
    imageUrl: 'https://images.unsplash.com/photo-1618331835711-20235b165236?q=80&w=2831&auto=format&fit=crop', // Placeholder image
    description: 'A seminal surrealist work exploring the fluidity of time and subconscious thought.'
  },
  {
    id: 'ac003',
    title: 'CryptoPunk #7523',
    artist: 'Larva Labs',
    year: 2017,
    estimatedValue: 11750000,
    imageUrl: 'https://images.unsplash.com/photo-1639429188228-a3a83defb639?q=80&w=2835&auto=format&fit=crop', // Placeholder image
    description: 'One of the nine rare "Alien" punks, a landmark piece in the history of NFTs and digital art.'
  },
  {
    id: 'ac004',
    title: 'Balloon Dog (Orange)',
    artist: 'Jeff Koons',
    year: 1994,
    estimatedValue: 58400000,
    imageUrl: 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?q=80&w=2787&auto=format&fit=crop', // Placeholder image
    description: 'Iconic stainless steel sculpture, part of the "Celebration" series, challenging perceptions of fine art.'
  },
];

/**
 * A component to display and manage a portfolio of art and other valuable collectibles.
 * This aligns with the MVP goal of a unified financial dashboard.
 */
const ArtCollectibles: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Art & Collectibles</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Tracking the value of your alternative assets.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {mockArtCollectibles.map((collectible) => (
            <div 
              key={collectible.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out"
            >
              {/* Using a generic placeholder for images to avoid broken links */}
              <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                 <img 
                    src={collectible.imageUrl} 
                    alt={collectible.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Art'; }}
                 />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 truncate" title={collectible.title}>
                  {collectible.title}
                </h3>
                <p className="text-md text-gray-600 italic">{collectible.artist} ({collectible.year})</p>
                <p className="mt-2 text-sm text-gray-700 h-20 overflow-hidden">
                  {collectible.description}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Estimated Value</p>
                  <p className="text-xl font-bold text-gray-900">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(collectible.estimatedValue)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtCollectibles;