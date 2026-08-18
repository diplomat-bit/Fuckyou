// components/ImpactTracker.tsx
import React, { useContext } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';

const TreeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" opacity="0.1" />
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v1.333a1 1 0 01-2 0V4a1 1 0 011-1zm6.5 6.25a.75.75 0 00-1.5 0v.516a1.5 1.5 0 01-2.34 1.283l-.431-.248a.75.75 0 00-1.06.432l-.25 1.002a.75.75 0 101.45.362l.1-.401a.25.25 0 01.432-.106l.39.225a2.75 2.75 0 004.288-2.352V9.25zM3.5 9.25a.75.75 0 00-1.5 0v.516a2.75 2.75 0 004.288 2.352l.39-.225a.25.25 0 01.432.106l.1.401a.75.75 0 101.45-.362l-.25-1.002a.75.75 0 00-1.06-.432l-.431.248A1.5 1.5 0 013.5 9.766V9.25z" clipRule="evenodd" />
    </svg>
);

const ImpactTracker: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) return <div>Loading...</div>;
    const { impactData } = context;

    return (
        <Card>
            <div className="flex items-center gap-4">
                <TreeIcon className="w-12 h-12 text-green-400 flex-shrink-0" />
                <div>
                    <p className="text-lg font-bold text-white">{impactData.treesPlanted} Trees Planted</p>
                    <p className="text-sm text-gray-400">You're making a positive impact on the planet!</p>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${impactData.progressToNextTree}%` }}></div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ImpactTracker;
