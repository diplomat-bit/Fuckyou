// components/views/personal/DashboardView.tsx
import React from 'react';
import { View } from '../../../types';

// Import the restored widget components
import BalanceSummary from '../../BalanceSummary';
import RecentTransactions from '../../RecentTransactions';
import InvestmentPortfolio from '../../InvestmentPortfolio';
import AIInsights from '../../AIInsights';
import ImpactTracker from '../../ImpactTracker';
import WealthTimeline from '../../WealthTimeline';

interface DashboardViewProps {
    setActiveView: (view: View) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Personal Dashboard</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main column */}
                <div className="lg:col-span-2 space-y-6">
                    <BalanceSummary />
                    <RecentTransactions setActiveView={setActiveView} />
                    <WealthTimeline />
                </div>
                {/* Side column */}
                <div className="space-y-6">
                    <InvestmentPortfolio />
                    <AIInsights />
                    <ImpactTracker />
                </div>
            </div>
        </div>
    );
};

export default DashboardView;