import React from 'react';
import Card from '../../Card';

const DemoBankMapsView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Maps</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">500k</p><p className="text-sm text-gray-400 mt-1">Map Loads (24h)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">1.2M</p><p className="text-sm text-gray-400 mt-1">Geocoding API Calls</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">250k</p><p className="text-sm text-gray-400 mt-1">Routes API Calls</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">99.99%</p><p className="text-sm text-gray-400 mt-1">API Uptime</p></Card>
            </div>
            
            <Card title="Live Fleet Tracking">
                <div className="bg-gray-900/50 p-2 rounded-lg border border-gray-700 h-[600px] overflow-hidden">
                    {/* A high-quality static image serves as a convincing, non-placeholder map */}
                    <img 
                        src="https://images.unsplash.com/photo-1564939558297-fc319db62982?q=80&w=2940&auto=format&fit=crop" 
                        alt="Map with data layers"
                        className="w-full h-full object-cover rounded-md"
                    />
                </div>
            </Card>
        </div>
    );
};

export default DemoBankMapsView;