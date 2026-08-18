import React, { useState, useEffect } from 'react';

interface SoundscapeState {
  weather: string;
  activityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  currentTrack: string; // e.g., "Calm Rain & Lo-fi Beats"
}

const DynamicSoundscapeGeneratorView: React.FC = () => {
  const [state, setState] = useState<SoundscapeState | null>(null);

  useEffect(() => {
    // MOCK LIVE DATA FEED
    const updateState = () => {
      const activity: SoundscapeState['activityLevel'] = Math.random() > 0.66 ? 'HIGH' : Math.random() > 0.33 ? 'MEDIUM' : 'LOW';
      setState({
        weather: "Cloudy",
        activityLevel: activity,
        currentTrack: activity === 'HIGH' ? "Uptempo Electronic" : "Ambient Focus Tones",
      });
    }
    updateState();
    const interval = setInterval(updateState, 5000);
    return () => clearInterval(interval);
  }, []);
  
  if (!state) return <div className="bg-gray-800 text-white p-6 rounded-lg">Initializing soundscape...</div>;
  
  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Dynamic Office Soundscape</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-400">Current Weather</p>
          <p className="text-xl font-semibold">{state.weather}</p>
        </div>
        <div className="p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-400">Office Activity Level</p>
          <p className="text-xl font-semibold">{state.activityLevel}</p>
        </div>
        <div className="p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-400">Now Playing</p>
          <p className="text-xl font-semibold">{state.currentTrack}</p>
        </div>
      </div>
      <div className="mt-6 text-center">
        <p className="text-gray-400 mb-2">Audio Simulation</p>
        <div className="w-full h-12 bg-gray-900 rounded-full flex items-center justify-center">
            <p className="text-cyan-300">♪ ♫ ♪</p>
        </div>
      </div>
    </div>
  );
};
export default DynamicSoundscapeGeneratorView;
