// components/FeatureGuard.tsx
import React, { useContext } from 'react';
import { View } from '../types';
import { DataContext } from '../context/DataContext';
import Paywall from './Paywall';
import { PAYWALL_DATA } from '../data/platform/paywallData';

interface FeatureGuardProps {
    view: View;
    children: React.ReactNode;
}

const FALLBACK_DETAILS = {
    appName: "Sovereign Enterprise Module™",
    price: 49,
    valuationLogic: "Foundational infrastructure for the autonomous architect.",
    implementationEssentials: "Proprietary AI integration, high-fidelity security, and real-time data sync.",
    scalability: "Unlimited organizational scale."
};

/**
 * @description The FeatureGuard acts as the system's access control layer.
 * It verifies if a sovereign has "paid attention" to a specific module before
 * granting entry. If not, it presents the sacred Paywall.
 */
const FeatureGuard: React.FC<FeatureGuardProps> = ({ view, children }) => {
    const context = useContext(DataContext);
    
    if (!context) {
        throw new Error("FeatureGuard must be used within a DataProvider");
    }

    const { unlockedFeatures, unlockFeature } = context;

    // The MetaDashboard is the launchpad and remains accessible to all.
    // Settings is also open so the sovereign can always adjust their frequency.
    if (view === View.MetaDashboard || view === View.Settings) {
        return <>{children}</>;
    }

    const isUnlocked = unlockedFeatures.has(view);

    if (!isUnlocked) {
        const details = PAYWALL_DATA[view] || FALLBACK_DETAILS;
        
        return (
            <div className="animate-fade-in h-full flex items-center justify-center">
                <Paywall 
                    details={details} 
                    onUnlock={() => unlockFeature(view)} 
                />
            </div>
        );
    }

    return <div className="animate-reveal">{children}</div>;
};

export default FeatureGuard;
