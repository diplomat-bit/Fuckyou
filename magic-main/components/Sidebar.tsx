import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { View } from '../types';
import { NAV_ITEMS } from '../constants';
import { DataContext } from '../context/DataContext';
import { Crown, Sparkles, Terminal, Building2 } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

// Logo Component
const InfiniteIntelligenceLogo: React.FC<{className?: string}> = ({className}) => (
     <svg className={className} viewBox="0 0 100 100" fill="none">
        <path d="M20,50 C20,20 80,20 80,50 C80,80 20,80 20,50" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <path d="M20,50 C20,80 80,80 80,50 C80,20 20,20 20,50" stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
        <circle cx="50" cy="50" r="10" fill="currentColor" className="animate-pulse" />
    </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const context = useContext(DataContext);
    const navigate = useNavigate();

    if (!context) return null;
    const { activeView, setActiveView } = context;
    
    const handleNavClick = (view: View) => {
        setActiveView(view);
        setIsOpen(false);
    };

    return (
        <>
             {/* Mobile Overlay */}
             <div 
                className={`fixed inset-0 bg-black/80 z-30 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
             ></div>

            {/* Sidebar Container */}
            <div className={`flex flex-col w-72 bg-black border-r border-gray-800 fixed lg:relative inset-y-0 left-0 z-40 transform transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                
                {/* Header */}
                <div className="flex items-center justify-between h-20 px-6 border-b border-gray-800">
                    <div className="flex items-center">
                        <InfiniteIntelligenceLogo className="h-10 w-10 text-indigo-500" />
                        <div className="ml-3">
                            <span className="text-lg font-black text-white tracking-tighter uppercase italic">Nexus OS</span>
                            <div className="flex items-center gap-1">
                                <Terminal size={10} className="text-emerald-500" />
                                <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest leading-none">Kernel: v5.2.7-LTS</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Scrollable Navigation Area */}
                <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar">
                    
                    {/* Special Showcase Section */}
                    <div className="space-y-2">
                        <h3 className="px-3 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                            Showcase
                            <div className="h-px bg-gray-800 flex-1"></div>
                        </h3>
                        <div className="space-y-1">
                            <button
                                onClick={() => navigate('/business-demo')}
                                className="flex items-center w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 group text-amber-400 hover:text-amber-200 hover:bg-amber-900/20 border border-amber-500/20"
                            >
                                <Building2 className="w-4 h-4 mr-3 transition-colors text-amber-400 group-hover:text-amber-200" />
                                <span className="flex-1">Enterprise Demo</span>
                                <Sparkles size={12} className="text-amber-400 animate-pulse" />
                            </button>
                        </div>
                    </div>

                    {/* Standard Navigation Groups */}
                    {NAV_ITEMS.map((group, groupIndex) => (
                        <div key={`group-${groupIndex}`} className="space-y-2">
                            <h3 className="px-3 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                {group.group}
                                <div className="h-px bg-gray-800 flex-1"></div>
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = activeView === item.view;
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.view}
                                            onClick={() => handleNavClick(item.view)}
                                            className={`flex items-center w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 group ${
                                                isActive
                                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                                                    : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800/50'
                                            }`}
                                        >
                                            {Icon && <Icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-indigo-400'}`} />}
                                            <span className="flex-1">{item.title}</span>
                                            {isActive && <Sparkles size={12} className="text-indigo-300 animate-pulse" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer User Profile */}
                <div className="p-4 border-t border-gray-900 bg-gray-950/50 mt-auto">
                    <div className="flex items-center gap-3 p-3 bg-indigo-900/10 border border-indigo-500/20 rounded-2xl">
                        <Crown className="text-indigo-400" size={16} />
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-white uppercase tracking-tighter truncate">The Caretaker</p>
                            <p className="text-[8px] font-mono text-indigo-400 uppercase tracking-widest">Sovereign Admin</p>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;