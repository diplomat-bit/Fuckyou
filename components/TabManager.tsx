import React from 'react';
import { X, Pin, Circle } from 'lucide-react';

export interface Tab {
    id: string;
    name: string;
    icon?: React.ReactNode;
    isPinned?: boolean;
    isDirty?: boolean;
    badge?: string | number;
}

export interface TabManagerProps {
    tabs: Tab[];
    activeTab: string | null;
    onTabClick: (id: string) => void;
    onTabClose?: (id: string) => void;
    onCloseAll?: () => void;
    onTabPin?: (id: string) => void;
    className?: string;
}

const TabManager: React.FC<TabManagerProps> = ({
    tabs,
    activeTab,
    onTabClick,
    onTabClose,
    onCloseAll,
    onTabPin,
    className = ''
}) => {
    if (!tabs || tabs.length === 0) {
        return null;
    }

    return (
        <div className={`flex items-center justify-between bg-[#020617]/95 backdrop-blur-md border-b border-slate-800/80 px-2 pt-2 text-xs font-mono overflow-x-auto no-scrollbar ${className}`}>
            <div className="flex items-center gap-1 min-w-0 overflow-x-auto no-scrollbar scroll-smooth">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <div
                            key={tab.id}
                            onClick={() => onTabClick(tab.id)}
                            className={`group relative flex items-center gap-2 px-3 py-2 rounded-t-lg cursor-pointer transition-all duration-200 select-none border-t border-x ${
                                isActive
                                    ? 'bg-[#0f172a] border-lime-500/50 border-b-transparent text-lime-400 font-bold shadow-[0_-2px_10px_rgba(163,230,53,0.1)] z-10'
                                    : 'bg-[#020617] border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                            }`}
                        >
                            {/* Active Top Accent Line */}
                            {isActive && (
                                <span className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-lime-500 via-emerald-400 to-cyan-500 rounded-t-lg" />
                            )}

                            {/* Icon / Pin */}
                            {tab.isPinned ? (
                                <Pin size={11} className="text-amber-400 fill-amber-400/20" />
                            ) : tab.icon ? (
                                <span className={`flex items-center justify-center ${isActive ? 'text-lime-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                    {tab.icon}
                                </span>
                            ) : null}

                            {/* Title */}
                            <span className="truncate max-w-[140px] text-[11px] uppercase tracking-wider">
                                {tab.name}
                            </span>

                            {/* Unsaved / Dirty Indicator */}
                            {tab.isDirty && !isActive && (
                                <Circle size={6} className="fill-amber-400 text-amber-400 animate-pulse" />
                            )}

                            {/* Badge */}
                            {tab.badge !== undefined && (
                                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                                    isActive ? 'bg-lime-950 text-lime-300 border border-lime-800' : 'bg-slate-800 text-slate-400'
                                }`}>
                                    {tab.badge}
                                </span>
                            )}

                            {/* Close Button */}
                            {onTabClose && !tab.isPinned && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTabClose(tab.id);
                                    }}
                                    className={`p-0.5 rounded hover:bg-red-500/20 hover:text-red-400 transition-colors ${
                                        isActive ? 'opacity-80 hover:opacity-100 text-slate-400' : 'opacity-0 group-hover:opacity-100 text-slate-500'
                                    }`}
                                    title="Close tab"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Optional Tab Controls */}
            {onCloseAll && tabs.length > 1 && (
                <div className="flex items-center pl-2 pb-1">
                    <button
                        type="button"
                        onClick={onCloseAll}
                        className="text-[10px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded hover:bg-slate-800/60 uppercase tracking-widest transition-colors whitespace-nowrap"
                        title="Close all tabs"
                    >
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );
};

export default TabManager;