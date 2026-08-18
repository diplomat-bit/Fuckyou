import React from 'react';
import Card from './Card';
import { NavItem } from '../constants';
import ViewAnalyticsPreview from './analytics/ViewAnalyticsPreview';

interface DashboardTileProps {
    item: NavItem;
    onClick: () => void;
}

const DashboardTile: React.FC<DashboardTileProps> = ({ item, onClick }) => {
    // FIX: Add a type guard to ensure the `item` prop is a `NavLink` before accessing its properties.
    // This resolves errors where `label` and `icon` were not found on the `NavItem` union type.
    if (!('id' in item) || !item.id) return null;

    return (
        <Card 
            variant="interactive" 
            padding="none" // Padding will be handled inside
            className="h-[600px] flex flex-col group"
            onClick={onClick}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="text-cyan-400">
                        {/* FIX: Cast to React.ReactElement<any> to resolve the 'className' prop type error during cloning. */}
                        {React.cloneElement(item.icon as React.ReactElement<any>, { className: 'h-6 w-6'})}
                    </div>
                    {/* FIX: The `label` property is now safely accessible. */}
                    <p className="text-lg font-semibold text-white truncate">{item.label}</p>
                </div>
                 <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">Open Module →</span>
            </div>
            
            {/* Body with Analytics Preview */}
            <div className="flex-grow overflow-hidden">
                <ViewAnalyticsPreview viewId={item.id} />
            </div>
        </Card>
    );
};

export default DashboardTile;