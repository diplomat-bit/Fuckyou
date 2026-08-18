
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import Card from './Card';
// CSS is loaded via index.html to prevent ESM loader errors
// import 'leaflet/dist/leaflet.css'; 

// Fix for default marker icon in leaflet
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface LocationData {
    name: string;
    coordinates: [number, number]; // [Longitude, Latitude] in original data, but Leaflet wants [Lat, Lng]
    liquidity: number; // USD equivalent
    currencies: string[];
}

const LOCATIONS: LocationData[] = [
    { name: "New York (HQ)", coordinates: [-74.006, 40.7128], liquidity: 15000000, currencies: ["USD"] },
    { name: "London", coordinates: [-0.1276, 51.5074], liquidity: 8500000, currencies: ["GBP", "EUR"] },
    { name: "Singapore", coordinates: [103.8198, 1.3521], liquidity: 5200000, currencies: ["SGD", "USD"] },
    { name: "Tokyo", coordinates: [139.6917, 35.6895], liquidity: 12000000, currencies: ["JPY"] },
    { name: "Frankfurt", coordinates: [8.6821, 50.1109], liquidity: 4100000, currencies: ["EUR"] },
    { name: "Sao Paulo", coordinates: [-46.6333, -23.5505], liquidity: 900000, currencies: ["BRL"] },
];

const GlobalPositionMap: React.FC = () => {
    const [selectedMarker, setSelectedMarker] = useState<LocationData | null>(null);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Global Liquidity Map</h2>
            
            <Card className="p-0 bg-gray-900 border-gray-700 overflow-hidden relative h-[600px]">
                <div className="absolute top-4 left-4 z-[400] bg-black/60 backdrop-blur p-3 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-400 uppercase font-bold">Total Global Liquidity</p>
                    <p className="text-2xl font-extrabold text-white">$45.7M</p>
                </div>

                {selectedMarker && (
                    <div className="absolute bottom-4 left-4 z-[400] bg-gray-800/90 backdrop-blur p-4 rounded-xl border border-cyan-500/50 w-64 animate-fadeIn">
                        <h3 className="font-bold text-white text-lg mb-1">{selectedMarker.name}</h3>
                        <p className="text-2xl font-mono text-cyan-400 mb-3">${selectedMarker.liquidity.toLocaleString()}</p>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-400 font-bold uppercase">Held Currencies</p>
                            <div className="flex gap-2">
                                {selectedMarker.currencies.map(c => (
                                    <span key={c} className="px-2 py-1 bg-gray-700 rounded text-xs text-white font-mono">{c}</span>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between">
                            <button className="text-xs text-cyan-400 hover:text-white transition">View Accounts</button>
                            <button className="text-xs text-cyan-400 hover:text-white transition">Initiate Transfer</button>
                        </div>
                        <button 
                            className="absolute top-2 right-2 text-gray-400 hover:text-white"
                            onClick={() => setSelectedMarker(null)}
                        >
                            ✕
                        </button>
                    </div>
                )}

                <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%', background: '#1f2937' }} scrollWheelZoom={true}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    {LOCATIONS.map((loc) => (
                        <React.Fragment key={loc.name}>
                             {/* Circle for liquidity visualization */}
                            <Circle
                                center={[loc.coordinates[1], loc.coordinates[0]]}
                                pathOptions={{ 
                                    fillColor: selectedMarker?.name === loc.name ? "#06b6d4" : "rgba(6, 182, 212, 0.5)", 
                                    color: '#fff', 
                                    weight: 1, 
                                    fillOpacity: 0.5 
                                }}
                                radius={Math.log(loc.liquidity) * 40000}
                                eventHandlers={{
                                    click: () => setSelectedMarker(loc),
                                }}
                            />
                            {/* Marker for precise location */}
                            <Marker 
                                position={[loc.coordinates[1], loc.coordinates[0]]} 
                                icon={icon}
                                eventHandlers={{
                                    click: () => setSelectedMarker(loc),
                                }}
                            >
                            </Marker>
                        </React.Fragment>
                    ))}
                </MapContainer>
            </Card>
        </div>
    );
};

export default GlobalPositionMap;
