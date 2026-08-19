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

// --- CONSOLIDATED FROM: Sidebar_1.tsx ---

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

// --- CONSOLIDATED FROM: Sidebar (4).tsx ---


import React, { useContext, useState } from 'react';
import { View, NavItem } from '../types';
import { NAV_ITEMS } from '../constants';
import { DataContext } from '../context/DataContext';

// The James Burvel O’Callaghan III Code - Citibankdemobusinessinc - Sidebar Component

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const A_CitibankLogo: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20,50 C20,20 80,20 80,50 C80,80 20,80 20,50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M20,50 C20,80 80,80 80,50 C80,20 20,20 20,50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
    </svg>
);

const B_SidebarHeader: React.FC<{ setIsOpen: (isOpen: boolean) => void }> = ({ setIsOpen }) => (
    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700/50">
        <div className="flex items-center">
            <A_CitibankLogo className="h-8 w-8 text-cyan-400" />
            <span className="ml-3 text-lg font-bold text-white tracking-tight">Citibankdemobusinessinc</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
);

const C_SidebarNavigationItem: React.FC<{ item: NavItem, isActive: boolean, handleNavClick: (view: View) => void }> = ({ item, isActive, handleNavClick }) => (
    <button
        onClick={() => handleNavClick(item.view)}
        className={`flex items-center w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
            isActive
                ? 'bg-cyan-500/20 text-cyan-300 border-l-2 border-cyan-500'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white border-l-2 border-transparent'
        }`}
    >
        {item.icon && <item.icon className="w-5 h-5 mr-3"/>}
        <span>{item.title}</span>
    </button>
);


const D_SidebarNavigationGroup: React.FC<{ groupTitle?: string, items: NavItem[], activeView: View, handleNavClick: (view: View) => void }> = ({ groupTitle, items, activeView, handleNavClick }) => (
    <div >
        {groupTitle && <h3 className="px-2 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{groupTitle}</h3>}
        {items.map((subItem, index) => {
            const isActive = activeView === subItem.view;
            return (
                <C_SidebarNavigationItem key={index} item={subItem} isActive={isActive} handleNavClick={handleNavClick} />
            );
        })}
    </div>
);

const E_Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const context = useContext(DataContext);
    if (!context) throw new Error("Sidebar must be used within a DataProvider");
    const { activeView, setActiveView } = context;

    const handleNavClick = (view: View) => {
        setActiveView(view);
        setIsOpen(false);
    };

    const F_renderNavigation = () => (
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto custom-scrollbar">
            {NAV_ITEMS.map((item, index) => (
                <D_SidebarNavigationGroup
                    key={index}
                    groupTitle={item.group}
                    items={item.items}
                    activeView={activeView}
                    handleNavClick={handleNavClick}
                />
            ))}
        </nav>
    );

    const G_renderOverlay = () => (
        <div
            className={`fixed inset-0 bg-black/60 z-30 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsOpen(false)}
        ></div>
    );

    const H_renderSidebar = () => (
        <div className={`flex flex-col w-64 bg-gray-900/50 backdrop-blur-lg border-r border-gray-700/50 fixed lg:relative inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
            <B_SidebarHeader setIsOpen={setIsOpen} />
            {F_renderNavigation()}
        </div>
    );

    return (
        <>
            {G_renderOverlay()}
            {H_renderSidebar()}
        </>
    );
};

export default E_Sidebar;


// --- CONSOLIDATED FROM: Sidebar (4)_1.tsx ---


import React, { useContext, useState } from 'react';
import { View, NavItem } from '../types';
import { NAV_ITEMS } from '../constants';
import { DataContext } from '../context/DataContext';

// The James Burvel O’Callaghan III Code - Citibankdemobusinessinc - Sidebar Component

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const A_CitibankLogo: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20,50 C20,20 80,20 80,50 C80,80 20,80 20,50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M20,50 C20,80 80,80 80,50 C80,20 20,20 20,50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
    </svg>
);

const B_SidebarHeader: React.FC<{ setIsOpen: (isOpen: boolean) => void }> = ({ setIsOpen }) => (
    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700/50">
        <div className="flex items-center">
            <A_CitibankLogo className="h-8 w-8 text-cyan-400" />
            <span className="ml-3 text-lg font-bold text-white tracking-tight">Citibankdemobusinessinc</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
);

const C_SidebarNavigationItem: React.FC<{ item: NavItem, isActive: boolean, handleNavClick: (view: View) => void }> = ({ item, isActive, handleNavClick }) => (
    <button
        onClick={() => handleNavClick(item.view)}
        className={`flex items-center w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
            isActive
                ? 'bg-cyan-500/20 text-cyan-300 border-l-2 border-cyan-500'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white border-l-2 border-transparent'
        }`}
    >
        {item.icon && <item.icon className="w-5 h-5 mr-3"/>}
        <span>{item.title}</span>
    </button>
);


const D_SidebarNavigationGroup: React.FC<{ groupTitle?: string, items: NavItem[], activeView: View, handleNavClick: (view: View) => void }> = ({ groupTitle, items, activeView, handleNavClick }) => (
    <div >
        {groupTitle && <h3 className="px-2 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{groupTitle}</h3>}
        {items.map((subItem, index) => {
            const isActive = activeView === subItem.view;
            return (
                <C_SidebarNavigationItem key={index} item={subItem} isActive={isActive} handleNavClick={handleNavClick} />
            );
        })}
    </div>
);

const E_Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const context = useContext(DataContext);
    if (!context) throw new Error("Sidebar must be used within a DataProvider");
    const { activeView, setActiveView } = context;

    const handleNavClick = (view: View) => {
        setActiveView(view);
        setIsOpen(false);
    };

    const F_renderNavigation = () => (
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto custom-scrollbar">
            {NAV_ITEMS.map((item, index) => (
                <D_SidebarNavigationGroup
                    key={index}
                    groupTitle={item.group}
                    items={item.items}
                    activeView={activeView}
                    handleNavClick={handleNavClick}
                />
            ))}
        </nav>
    );

    const G_renderOverlay = () => (
        <div
            className={`fixed inset-0 bg-black/60 z-30 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsOpen(false)}
        ></div>
    );

    const H_renderSidebar = () => (
        <div className={`flex flex-col w-64 bg-gray-900/50 backdrop-blur-lg border-r border-gray-700/50 fixed lg:relative inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
            <B_SidebarHeader setIsOpen={setIsOpen} />
            {F_renderNavigation()}
        </div>
    );

    return (
        <>
            {G_renderOverlay()}
            {H_renderSidebar()}
        </>
    );
};

export default E_Sidebar;


// --- CONSOLIDATED FROM: Sidebar (1).tsx ---


import React, { useContext } from 'react';
import { View } from '../types';
import { NAV_ITEMS } from '../constants';
import { DataContext } from '../context/DataContext';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const InfiniteIntelligenceLogo: React.FC<{className?: string}> = ({className}) => (
     <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20,50 C20,20 80,20 80,50 C80,80 20,80 20,50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M20,50 C20,80 80,80 80,50 C80,20 20,20 20,50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
    </svg>
);


const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const context = useContext(DataContext);
    if (!context) throw new Error("Sidebar must be used within a DataProvider");
    const { activeView, setActiveView } = context;
    
    const handleNavClick = (view: View) => {
        setActiveView(view);
        setIsOpen(false); // Close sidebar on navigation
    };

    return (
        <>
            {/* Overlay */}
             <div 
                className={`fixed inset-0 bg-black/60 z-30 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
             ></div>

            {/* Sidebar */}
            <div className={`flex flex-col w-64 bg-gray-900/50 backdrop-blur-lg border-r border-gray-700/50 fixed lg:relative inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700/50">
                    <div className="flex items-center">
                        <InfiniteIntelligenceLogo className="h-8 w-8 text-cyan-400" />
                        <span className="ml-3 text-lg font-bold text-white tracking-tight">Infinite Intelligence</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                        {/* Close Icon */}
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* Navigation */}
                <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {NAV_ITEMS.map((item, index) => (
                        <div key={index}>
                            {item.group && <h3 className="px-2 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.group}</h3>}
                            {item.items.map(subItem => {
                                const isActive = activeView === subItem.view;
                                return (
                                    <button
                                        key={subItem.view}
                                        onClick={() => handleNavClick(subItem.view)}
                                        className={`flex items-center w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                            isActive
                                                ? 'bg-cyan-500/20 text-cyan-300 border-l-2 border-cyan-500'
                                                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white border-l-2 border-transparent'
                                        }`}
                                    >
                                        {subItem.icon && <subItem.icon className="w-5 h-5 mr-3"/>}
                                        <span>{subItem.title}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;


// --- CONSOLIDATED FROM: Sidebar (2).tsx ---


import React, { useState, useMemo } from 'react';
import { View } from '../types';
import { NAV_ITEMS, NavItem } from '../constants';

const DemoBankLogo: React.FC<{className?: string}> = ({className}) => (
     <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="4"/>
        <path d="M30 70V30H55C65 30 65 40 55 40H30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M55 70V30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

interface SidebarProps {
    activeView: View;
    setActiveView: (view: View) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredNavItems = useMemo(() => {
        if (!searchTerm.trim()) {
            return NAV_ITEMS;
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        
        // FIX: The simplified filter identifies NavLink items and filters them by label,
        // while preserving headers and dividers to maintain the sidebar's structure.
        const filteredLinks = NAV_ITEMS.filter(item => {
            if (item.id) {
                return item.label.toLowerCase().includes(lowercasedTerm);
            }
            return false;
        });

        const finalItems: NavItem[] = [];
        let currentHeader: NavItem | null = null;
        let lastItemWasLink = false;

        NAV_ITEMS.forEach(item => {
            if (item.type === 'header') {
                currentHeader = item;
                return;
            }
            
            if (item.type === 'divider') {
                if (lastItemWasLink) {
                    finalItems.push(item);
                    lastItemWasLink = false;
                }
                currentHeader = null;
                return;
            }

            if (filteredLinks.includes(item)) {
                if (currentHeader && !finalItems.includes(currentHeader)) {
                    finalItems.push(currentHeader);
                }
                finalItems.push(item);
                lastItemWasLink = true;
            }
        });

        return finalItems;

    }, [searchTerm]);

    return (
        <>
            {/* Overlay for mobile */}
            <div className={`fixed inset-0 bg-black/60 z-30 lg:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={() => setIsOpen(false)}></div>
            
            <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-900/70 backdrop-blur-lg border-r border-gray-700/50 z-40 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex items-center justify-between h-20 border-b border-gray-700/50 px-6 flex-shrink-0">
                    <div className="flex items-center space-x-2 text-cyan-400">
                       <DemoBankLogo className="h-10 w-10" />
                       <span className="font-bold text-lg text-white">DEMO BANK</span>
                    </div>
                </div>

                <div className="p-4 flex-shrink-0">
                    <input 
                        type="text"
                        placeholder="Search modules..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                </div>

                <nav className="flex-grow overflow-y-auto px-4 pb-4">
                    <ul>
                        {filteredNavItems.map((item, index) => {
                            // FIX: Using property existence ('id') to narrow the NavItem union.
                            // NavLink is the only member with a defined 'id', which allows us to safely
                            // access its properties and avoids the 'never' inference error.
                            if (item.id) {
                                const isActive = activeView === item.id;
                                return (
                                    <li key={item.id}>
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setActiveView(item.id as View);
                                            }}
                                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 ${isActive ? 'bg-cyan-500/20 text-cyan-200' : 'text-gray-300 hover:bg-gray-700/50'}`}
                                        >
                                            {/* FIX: Cast icon to React.ReactElement<any> to avoid prop type errors during cloning */}
                                            {item.icon && React.cloneElement(item.icon as React.ReactElement<any>, { className: 'h-5 w-5 flex-shrink-0' })}
                                            <span>{item.label}</span>
                                        </a>
                                    </li>
                                );
                            } else if (item.type === 'header') {
                                return <li key={`header-${index}`} className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</li>;
                            } else if (item.type === 'divider') {
                                return <li key={`divider-${index}`}><hr className="my-3 border-gray-700/50" /></li>;
                            } else {
                                return null;
                            }
                        })}
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;


// --- CONSOLIDATED FROM: Sidebar (3).tsx ---

import React from 'react';
import { View } from '../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
  const menuItems = Object.values(View);

  return (
    <div className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 bg-gray-900 border-b border-gray-800">
        <span className="text-2xl font-semibold text-white">Menu</span>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {menuItems.map((view) => (
          <button
            key={view}
            onClick={() => { setActiveView(view); setIsOpen(false); }}
            className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeView === view ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            {view}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

// --- CONSOLIDATED FROM: Sidebar (3)_1.tsx ---

import React from 'react';
import { View } from '../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
  const menuItems = Object.values(View);

  return (
    <div className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 bg-gray-900 border-b border-gray-800">
        <span className="text-2xl font-semibold text-white">Menu</span>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {menuItems.map((view) => (
          <button
            key={view}
            onClick={() => { setActiveView(view); setIsOpen(false); }}
            className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeView === view ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            {view}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

// --- CONSOLIDATED FROM: Sidebar (5).tsx ---

import React, { useState, useMemo } from 'react';
import { View } from '../types';
import {
    AcademicCapIcon,
    AdjustmentsIcon,
    BeakerIcon,
    BellIcon,
    BriefcaseIcon,
    CashIcon,
    ChartBarIcon,
    ChevronRightIcon,
    ChipIcon,
    CloudIcon,
    CogIcon,
    CubeTransparentIcon,
    CurrencyDollarIcon,
    DatabaseIcon,
    DocumentReportIcon,
    EyeIcon,
    FireIcon,
    GlobeAltIcon,
    GlobeIcon,
    HomeIcon,
    KeyIcon,
    LibraryIcon,
    LightningBoltIcon,
    LockClosedIcon,
    LogoutIcon,
    PresentationChartLineIcon,
    PuzzleIcon,
    ReceiptTaxIcon,
    ScaleIcon,
    ShareIcon,
    ShieldCheckIcon,
    SparklesIcon,
    SwitchHorizontalIcon,
    TerminalIcon,
    TrendingUpIcon,
    UsersIcon,
} from '@heroicons/react/outline';

const DemoBankLogo: React.FC<{className?: string}> = ({className}) => (
     <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="4"/>
        <path d="M30 70V30H55C65 30 65 40 55 40H30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M55 70V30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// Expanded Navigation Item Types for a more complex, futuristic sidebar
export interface NavHeader {
    type: 'header';
    label: string;
}

export interface NavDivider {
    type: 'divider';
}

export interface NavLink {
    type?: 'link';
    id: View;
    label: string;
    description: string;
    icon: React.ReactElement;
}

export interface NavGroup {
    type: 'group';
    label: string;
    icon: React.ReactElement;
    children: (NavLink | NavGroup)[];
}

export type NavItem = NavHeader | NavDivider | NavLink | NavGroup;

// Massively expanded navigation structure as per instructions
const NAV_ITEMS: NavItem[] = [
    { type: 'header', label: 'Core Banking' },
    { id: 'dashboard', label: 'Global Dashboard', description: 'Unified operational overview of all sectors.', icon: <HomeIcon /> },
    { id: 'accounts', label: 'Customer Accounts', description: 'Manage retail and corporate accounts.', icon: <UsersIcon /> },
    { id: 'transactions', label: 'Transaction Ledger', description: 'Browse and audit all financial movements.', icon: <LibraryIcon /> },
    { type: 'divider' },
    {
        type: 'group',
        label: 'High-Frequency Trading',
        icon: <LightningBoltIcon />,
        children: [
            { id: 'hft_dashboard', label: 'HFT Command Center', description: 'Real-time trading analytics & P/L.', icon: <ChartBarIcon /> },
            { id: 'hft_market_data', label: 'Market Data Feeds', description: 'Connect to low-latency data sources.', icon: <CloudIcon /> },
            {
                type: 'group',
                label: 'Algorithmic Strategies',
                icon: <AdjustmentsIcon />,
                children: [
                    { id: 'hft_strategy_builder', label: 'Strategy Builder', description: 'Design, code, and backtest models.', icon: <BeakerIcon /> },
                    { id: 'hft_quant_ide', label: 'Quantum IDE', description: 'Develop in a quantum-native environment.', icon: <TerminalIcon /> },
                    { id: 'hft_live_strategies', label: 'Live Strategies', description: 'Monitor and manage active trading bots.', icon: <ChipIcon /> },
                ]
            },
            { id: 'hft_risk_management', label: 'Risk Control Matrix', description: 'Pre-trade and post-trade risk controls.', icon: <ShieldCheckIcon /> },
            { id: 'hft_reporting', label: 'Execution Analysis', description: 'Analyze slippage, latency, and fill rates.', icon: <DocumentReportIcon /> },
        ]
    },
    {
        type: 'group',
        label: 'Wealth & Asset Management',
        icon: <TrendingUpIcon />,
        children: [
            { id: 'wm_client_portfolios', label: 'Client Portfolios', description: 'Holistic view of client assets and performance.', icon: <BriefcaseIcon /> },
            { id: 'wm_market_research', label: 'Market Research', description: 'AI-driven insights and market analysis.', icon: <GlobeAltIcon /> },
            { id: 'wm_trade_execution', label: 'Trade Execution', description: 'Place and manage orders across asset classes.', icon: <CurrencyDollarIcon /> },
            { id: 'wm_compliance', label: 'Robo-Compliance', description: 'Automated regulatory adherence checks.', icon: <ShieldCheckIcon /> },
        ]
    },
    { type: 'divider' },
    {
        type: 'group',
        label: 'Global Entity Interaction Network (GEIN)',
        icon: <GlobeIcon />,
        children: [
            { id: 'gein_overview', label: 'GEIN Overview', description: 'Macro-level view of the global network.', icon: <EyeIcon /> },
            {
                type: 'group',
                label: 'Data Ingestion & Fusion',
                icon: <PuzzleIcon />,
                children: [
                    { id: 'gein_ingest_sentient', label: 'Sentient World Simulation', description: 'Ingest data from global SWS feeds.', icon: <CloudIcon /> },
                    { id: 'gein_ingest_quantum', label: 'Quantum Entanglement Feeds', description: 'Real-time quantum state data.', icon: <CubeTransparentIcon /> },
                    { id: 'gein_ingest_noospheric', label: 'Noospheric Resonance', description: 'Tap into collective consciousness data.', icon: <ShareIcon /> },
                ]
            },
            {
                type: 'group',
                label: 'Holistic Analysis Engine',
                icon: <ChipIcon />,
                children: [
                    { id: 'gein_analysis_cross_dim', label: 'Cross-Dimensional Matrix', description: 'Correlate data across realities.', icon: <SwitchHorizontalIcon /> },
                    { id: 'gein_analysis_geopolitical', label: 'Geopolitical Vector Analysis', description: 'Model nation-state interactions.', icon: <ScaleIcon /> },
                    { id: 'gein_analysis_memetic', label: 'Memetic Trajectory Engine', description: 'Track and predict idea propagation.', icon: <FireIcon /> },
                ]
            },
            {
                type: 'group',
                label: 'Predictive Simulation',
                icon: <BeakerIcon />,
                children: [
                    { id: 'gein_sim_singularity', label: 'Economic Singularity', description: 'Simulate post-scarcity economies.', icon: <TrendingUpIcon /> },
                    { id: 'gein_sim_first_contact', label: 'First Contact Scenarios', description: 'Model potential exopolitical events.', icon: <GlobeAltIcon /> },
                    { id: 'gein_sim_timeline', label: 'Timeline Vulnerability', description: 'Identify and mitigate temporal paradoxes.', icon: <LightningBoltIcon /> },
                ]
            },
            { id: 'gein_visualization', label: 'Network Visualization', description: 'Render the GEIN in a 4D interface.', icon: <PresentationChartLineIcon /> },
            { id: 'gein_ethics', label: 'Ethical Oversight', description: 'AI-driven ethical and moral compass.', icon: <ShieldCheckIcon /> },
        ]
    },
    { type: 'divider' },
    {
        type: 'group',
        label: 'Future Technologies Division',
        icon: <SparklesIcon />,
        children: [
            { id: 'future_quantum_if', label: 'Quantum Interface', description: 'Access quantum computing financial models.', icon: <CubeTransparentIcon /> },
            { id: 'future_neuralink', label: 'Neuralink Analytics', description: 'Brain-computer interface data streams.', icon: <ShareIcon /> },
            { id: 'future_web5', label: 'Web5 Integration', description: 'Manage decentralized identity and data.', icon: <KeyIcon /> },
            { id: 'future_biocomputing', label: 'Bio-Computing Cloud', description: 'Leverage DNA-based data storage & processing.', icon: <ChipIcon /> },
            {
                type: 'group',
                label: 'DAO Governance',
                icon: <UsersIcon />,
                children: [
                    { id: 'dao_treasury', label: 'DAO Treasury', description: 'Monitor and manage decentralized assets.', icon: <CashIcon /> },
                    { id: 'dao_governance', label: 'Governance Portal', description: 'Vote on and create on-chain proposals.', icon: <ScaleIcon /> },
                    { id: 'dao_reputation', label: 'Reputation Engine', description: 'Manage on-chain identity and trust scores.', icon: <AcademicCapIcon /> },
                ]
            },
            {
                type: 'group',
                label: 'Metaverse Operations',
                icon: <CubeTransparentIcon />,
                children: [
                    { id: 'meta_asset_mgmt', label: 'Digital Asset Management', description: 'Manage virtual real estate and NFTs.', icon: <HomeIcon /> },
                    { id: 'meta_econ_monitor', label: 'Virtual Economy Monitor', description: 'Track economic indicators in the metaverse.', icon: <ChartBarIcon /> },
                ]
            },
        ]
    },
    { type: 'divider' },
    { type: 'header', label: 'Administration' },
    { id: 'reporting', label: 'Regulatory Reporting', description: 'Generate and submit compliance reports.', icon: <DocumentReportIcon /> },
    {
        type: 'group',
        label: 'Security & Identity',
        icon: <ShieldCheckIcon />,
        children: [
            { id: 'security_center', label: 'Threat Intelligence', description: 'Real-time global threat detection.', icon: <ShieldCheckIcon /> },
            { id: 'security_iam', label: 'Identity & Access', description: 'Manage multi-factor biometric access.', icon: <KeyIcon /> },
            { id: 'security_crypto', label: 'Cryptography Mgmt', description: 'Control post-quantum encryption keys.', icon: <LockClosedIcon /> },
        ]
    },
    { id: 'audit_logs', label: 'Audit Logs', description: 'Immutable logs of all system activities.', icon: <DatabaseIcon /> },
    { id: 'settings', label: 'System Settings', description: 'Configure global platform parameters.', icon: <CogIcon /> },
    { id: 'knowledge_base', label: 'Knowledge Base', description: 'Documentation and training materials.', icon: <AcademicCapIcon /> },
];


interface SidebarProps {
    activeView: View;
    setActiveView: (view: View) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['High-Frequency Trading']));

    const toggleGroup = (label: string) => {
        setOpenGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(label)) {
                newSet.delete(label);
            } else {
                newSet.add(label);
            }
            return newSet;
        });
    };

    const { filteredItems, forceOpen } = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase().trim();
        if (!lowercasedTerm) {
            return { filteredItems: NAV_ITEMS, forceOpen: new Set<string>() };
        }

        const newForceOpen = new Set<string>();

        function filterAndMark(items: NavItem[]): (NavItem | null)[] {
            return items.map(item => {
                if (item.type === 'group') {
                    const newChildren = filterAndMark(item.children);
                    if (newChildren.some(child => child !== null)) {
                        newForceOpen.add(item.label);
                        return { ...item, children: newChildren.filter(c => c !== null) as (NavLink | NavGroup)[] };
                    }
                }
                if (item.id) { // NavLink
                    if (item.label.toLowerCase().includes(lowercasedTerm) || item.description.toLowerCase().includes(lowercasedTerm)) {
                        return item;
                    }
                }
                if (item.type === 'header' || item.type === 'divider') {
                    return item;
                }
                return null;
            });
        }

        let partiallyFiltered = filterAndMark(NAV_ITEMS).filter(item => item !== null) as NavItem[];
        
        const finalFiltered: NavItem[] = [];
        for (let i = 0; i < partiallyFiltered.length; i++) {
            const item = partiallyFiltered[i];
            if (item.type === 'header') {
                let hasContent = false;
                for (let j = i + 1; j < partiallyFiltered.length; j++) {
                    const nextItem = partiallyFiltered[j];
                    if (nextItem.type === 'header') break;
                    if (nextItem.type !== 'divider') {
                        hasContent = true;
                        break;
                    }
                }
                if (hasContent) finalFiltered.push(item);
            } else if (item.type === 'divider') {
                const prevItem = finalFiltered[finalFiltered.length - 1];
                const nextItem = partiallyFiltered[i + 1];
                if (prevItem && nextItem && prevItem.type !== 'header' && prevItem.type !== 'divider' && nextItem.type !== 'header') {
                    finalFiltered.push(item);
                }
            } else {
                finalFiltered.push(item);
            }
        }

        return { filteredItems: finalFiltered, forceOpen: newForceOpen };
    }, [searchTerm]);

    const renderNavItems = (items: NavItem[], level = 0): React.ReactNode => {
        return items.map((item, index) => {
            if (item.type === 'header') {
                return <li key={`header-${item.label}-${index}`} className="px-3 pt-6 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</li>;
            }
            if (item.type === 'divider') {
                return <li key={`divider-${index}`}><hr className="my-3 border-gray-700/50" /></li>;
            }
            if (item.type === 'group') {
                const isGroupOpen = openGroups.has(item.label) || (searchTerm.length > 0 && forceOpen.has(item.label));
                return (
                    <li key={item.label}>
                        <button
                            onClick={() => toggleGroup(item.label)}
                            className="w-full flex items-center justify-between space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 text-gray-300 hover:bg-gray-700/50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            style={{ paddingLeft: `${0.75 + level * 1.25}rem` }}
                        >
                            <div className="flex items-center space-x-3">
                                {React.cloneElement(item.icon, { className: 'h-5 w-5 flex-shrink-0' })}
                                <span className="font-medium">{item.label}</span>
                            </div>
                            <ChevronRightIcon className={`h-4 w-4 transition-transform duration-200 ${isGroupOpen ? 'rotate-90' : ''}`} />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isGroupOpen ? 'max-h-[1000px]' : 'max-h-0'}`}>
                            <ul className="pt-1">
                                {renderNavItems(item.children, level + 1)}
                            </ul>
                        </div>
                    </li>
                );
            }
            const isActive = activeView === item.id;
            return (
                <li key={item.id}>
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setActiveView(item.id);
                            if (window.innerWidth < 1024) setIsOpen(false);
                        }}
                        className={`flex flex-col items-start rounded-lg transition-colors duration-200 group ${isActive ? 'bg-cyan-500/20' : 'hover:bg-gray-700/50'}`}
                        style={{ paddingLeft: `${0.75 + level * 1.25}rem`, paddingRight: '0.75rem', paddingTop: '0.6rem', paddingBottom: '0.6rem' }}
                    >
                        <div className="flex items-center space-x-3">
                            {React.cloneElement(item.icon, { className: `h-5 w-5 flex-shrink-0 ${isActive ? 'text-cyan-300' : 'text-gray-400 group-hover:text-gray-200'}` })}
                            <span className={`text-sm font-medium ${isActive ? 'text-cyan-200' : 'text-gray-300 group-hover:text-white'}`}>{item.label}</span>
                        </div>
                        <p className={`pl-8 text-xs transition-colors mt-1 ${isActive ? 'text-cyan-300/80' : 'text-gray-500 group-hover:text-gray-400'}`}>
                            {item.description}
                        </p>
                    </a>
                </li>
            );
        });
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 z-30 lg:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={() => setIsOpen(false)}></div>
            
            <aside className={`fixed top-0 left-0 h-full w-72 bg-gray-900/70 backdrop-blur-lg border-r border-gray-700/50 z-40 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex items-center justify-between h-20 border-b border-gray-700/50 px-6 flex-shrink-0">
                    <div className="flex items-center space-x-3 text-cyan-400">
                       <DemoBankLogo className="h-10 w-10" />
                       <span className="font-bold text-lg text-white tracking-wide">DEMO BANK</span>
                    </div>
                </div>

                <div className="p-4 flex-shrink-0">
                    <input 
                        type="text"
                        placeholder="Search modules & apps..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                </div>

                <nav className="flex-grow overflow-y-auto px-2 pb-4">
                    <ul>
                        {renderNavItems(filteredItems)}
                    </ul>
                </nav>

                <div className="mt-auto flex-shrink-0 border-t border-gray-700/50 p-4">
                    <div className="flex items-center space-x-4">
                        <img className="h-10 w-10 rounded-full" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
                        <div className="flex-grow">
                            <p className="text-sm font-semibold text-white">Jane Doe</p>
                            <p className="text-xs text-gray-400">Quantum Analyst</p>
                        </div>
                        <button className="p-2 rounded-full text-gray-400 hover:bg-gray-700/50 hover:text-white">
                            <LogoutIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;

// --- CONSOLIDATED FROM: Sidebar (5)_1.tsx ---

import React, { useState, useMemo } from 'react';
import { View } from '../types';
import {
    AcademicCapIcon,
    AdjustmentsIcon,
    BeakerIcon,
    BellIcon,
    BriefcaseIcon,
    CashIcon,
    ChartBarIcon,
    ChevronRightIcon,
    ChipIcon,
    CloudIcon,
    CogIcon,
    CubeTransparentIcon,
    CurrencyDollarIcon,
    DatabaseIcon,
    DocumentReportIcon,
    EyeIcon,
    FireIcon,
    GlobeAltIcon,
    GlobeIcon,
    HomeIcon,
    KeyIcon,
    LibraryIcon,
    LightningBoltIcon,
    LockClosedIcon,
    LogoutIcon,
    PresentationChartLineIcon,
    PuzzleIcon,
    ReceiptTaxIcon,
    ScaleIcon,
    ShareIcon,
    ShieldCheckIcon,
    SparklesIcon,
    SwitchHorizontalIcon,
    TerminalIcon,
    TrendingUpIcon,
    UsersIcon,
} from '@heroicons/react/outline';

const DemoBankLogo: React.FC<{className?: string}> = ({className}) => (
     <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="4"/>
        <path d="M30 70V30H55C65 30 65 40 55 40H30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M55 70V30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// Expanded Navigation Item Types for a more complex, futuristic sidebar
export interface NavHeader {
    type: 'header';
    label: string;
}

export interface NavDivider {
    type: 'divider';
}

export interface NavLink {
    type?: 'link';
    id: View;
    label: string;
    description: string;
    icon: React.ReactElement;
}

export interface NavGroup {
    type: 'group';
    label: string;
    icon: React.ReactElement;
    children: (NavLink | NavGroup)[];
}

export type NavItem = NavHeader | NavDivider | NavLink | NavGroup;

// Massively expanded navigation structure as per instructions
const NAV_ITEMS: NavItem[] = [
    { type: 'header', label: 'Core Banking' },
    { id: 'dashboard', label: 'Global Dashboard', description: 'Unified operational overview of all sectors.', icon: <HomeIcon /> },
    { id: 'accounts', label: 'Customer Accounts', description: 'Manage retail and corporate accounts.', icon: <UsersIcon /> },
    { id: 'transactions', label: 'Transaction Ledger', description: 'Browse and audit all financial movements.', icon: <LibraryIcon /> },
    { type: 'divider' },
    {
        type: 'group',
        label: 'High-Frequency Trading',
        icon: <LightningBoltIcon />,
        children: [
            { id: 'hft_dashboard', label: 'HFT Command Center', description: 'Real-time trading analytics & P/L.', icon: <ChartBarIcon /> },
            { id: 'hft_market_data', label: 'Market Data Feeds', description: 'Connect to low-latency data sources.', icon: <CloudIcon /> },
            {
                type: 'group',
                label: 'Algorithmic Strategies',
                icon: <AdjustmentsIcon />,
                children: [
                    { id: 'hft_strategy_builder', label: 'Strategy Builder', description: 'Design, code, and backtest models.', icon: <BeakerIcon /> },
                    { id: 'hft_quant_ide', label: 'Quantum IDE', description: 'Develop in a quantum-native environment.', icon: <TerminalIcon /> },
                    { id: 'hft_live_strategies', label: 'Live Strategies', description: 'Monitor and manage active trading bots.', icon: <ChipIcon /> },
                ]
            },
            { id: 'hft_risk_management', label: 'Risk Control Matrix', description: 'Pre-trade and post-trade risk controls.', icon: <ShieldCheckIcon /> },
            { id: 'hft_reporting', label: 'Execution Analysis', description: 'Analyze slippage, latency, and fill rates.', icon: <DocumentReportIcon /> },
        ]
    },
    {
        type: 'group',
        label: 'Wealth & Asset Management',
        icon: <TrendingUpIcon />,
        children: [
            { id: 'wm_client_portfolios', label: 'Client Portfolios', description: 'Holistic view of client assets and performance.', icon: <BriefcaseIcon /> },
            { id: 'wm_market_research', label: 'Market Research', description: 'AI-driven insights and market analysis.', icon: <GlobeAltIcon /> },
            { id: 'wm_trade_execution', label: 'Trade Execution', description: 'Place and manage orders across asset classes.', icon: <CurrencyDollarIcon /> },
            { id: 'wm_compliance', label: 'Robo-Compliance', description: 'Automated regulatory adherence checks.', icon: <ShieldCheckIcon /> },
        ]
    },
    { type: 'divider' },
    {
        type: 'group',
        label: 'Global Entity Interaction Network (GEIN)',
        icon: <GlobeIcon />,
        children: [
            { id: 'gein_overview', label: 'GEIN Overview', description: 'Macro-level view of the global network.', icon: <EyeIcon /> },
            {
                type: 'group',
                label: 'Data Ingestion & Fusion',
                icon: <PuzzleIcon />,
                children: [
                    { id: 'gein_ingest_sentient', label: 'Sentient World Simulation', description: 'Ingest data from global SWS feeds.', icon: <CloudIcon /> },
                    { id: 'gein_ingest_quantum', label: 'Quantum Entanglement Feeds', description: 'Real-time quantum state data.', icon: <CubeTransparentIcon /> },
                    { id: 'gein_ingest_noospheric', label: 'Noospheric Resonance', description: 'Tap into collective consciousness data.', icon: <ShareIcon /> },
                ]
            },
            {
                type: 'group',
                label: 'Holistic Analysis Engine',
                icon: <ChipIcon />,
                children: [
                    { id: 'gein_analysis_cross_dim', label: 'Cross-Dimensional Matrix', description: 'Correlate data across realities.', icon: <SwitchHorizontalIcon /> },
                    { id: 'gein_analysis_geopolitical', label: 'Geopolitical Vector Analysis', description: 'Model nation-state interactions.', icon: <ScaleIcon /> },
                    { id: 'gein_analysis_memetic', label: 'Memetic Trajectory Engine', description: 'Track and predict idea propagation.', icon: <FireIcon /> },
                ]
            },
            {
                type: 'group',
                label: 'Predictive Simulation',
                icon: <BeakerIcon />,
                children: [
                    { id: 'gein_sim_singularity', label: 'Economic Singularity', description: 'Simulate post-scarcity economies.', icon: <TrendingUpIcon /> },
                    { id: 'gein_sim_first_contact', label: 'First Contact Scenarios', description: 'Model potential exopolitical events.', icon: <GlobeAltIcon /> },
                    { id: 'gein_sim_timeline', label: 'Timeline Vulnerability', description: 'Identify and mitigate temporal paradoxes.', icon: <LightningBoltIcon /> },
                ]
            },
            { id: 'gein_visualization', label: 'Network Visualization', description: 'Render the GEIN in a 4D interface.', icon: <PresentationChartLineIcon /> },
            { id: 'gein_ethics', label: 'Ethical Oversight', description: 'AI-driven ethical and moral compass.', icon: <ShieldCheckIcon /> },
        ]
    },
    { type: 'divider' },
    {
        type: 'group',
        label: 'Future Technologies Division',
        icon: <SparklesIcon />,
        children: [
            { id: 'future_quantum_if', label: 'Quantum Interface', description: 'Access quantum computing financial models.', icon: <CubeTransparentIcon /> },
            { id: 'future_neuralink', label: 'Neuralink Analytics', description: 'Brain-computer interface data streams.', icon: <ShareIcon /> },
            { id: 'future_web5', label: 'Web5 Integration', description: 'Manage decentralized identity and data.', icon: <KeyIcon /> },
            { id: 'future_biocomputing', label: 'Bio-Computing Cloud', description: 'Leverage DNA-based data storage & processing.', icon: <ChipIcon /> },
            {
                type: 'group',
                label: 'DAO Governance',
                icon: <UsersIcon />,
                children: [
                    { id: 'dao_treasury', label: 'DAO Treasury', description: 'Monitor and manage decentralized assets.', icon: <CashIcon /> },
                    { id: 'dao_governance', label: 'Governance Portal', description: 'Vote on and create on-chain proposals.', icon: <ScaleIcon /> },
                    { id: 'dao_reputation', label: 'Reputation Engine', description: 'Manage on-chain identity and trust scores.', icon: <AcademicCapIcon /> },
                ]
            },
            {
                type: 'group',
                label: 'Metaverse Operations',
                icon: <CubeTransparentIcon />,
                children: [
                    { id: 'meta_asset_mgmt', label: 'Digital Asset Management', description: 'Manage virtual real estate and NFTs.', icon: <HomeIcon /> },
                    { id: 'meta_econ_monitor', label: 'Virtual Economy Monitor', description: 'Track economic indicators in the metaverse.', icon: <ChartBarIcon /> },
                ]
            },
        ]
    },
    { type: 'divider' },
    { type: 'header', label: 'Administration' },
    { id: 'reporting', label: 'Regulatory Reporting', description: 'Generate and submit compliance reports.', icon: <DocumentReportIcon /> },
    {
        type: 'group',
        label: 'Security & Identity',
        icon: <ShieldCheckIcon />,
        children: [
            { id: 'security_center', label: 'Threat Intelligence', description: 'Real-time global threat detection.', icon: <ShieldCheckIcon /> },
            { id: 'security_iam', label: 'Identity & Access', description: 'Manage multi-factor biometric access.', icon: <KeyIcon /> },
            { id: 'security_crypto', label: 'Cryptography Mgmt', description: 'Control post-quantum encryption keys.', icon: <LockClosedIcon /> },
        ]
    },
    { id: 'audit_logs', label: 'Audit Logs', description: 'Immutable logs of all system activities.', icon: <DatabaseIcon /> },
    { id: 'settings', label: 'System Settings', description: 'Configure global platform parameters.', icon: <CogIcon /> },
    { id: 'knowledge_base', label: 'Knowledge Base', description: 'Documentation and training materials.', icon: <AcademicCapIcon /> },
];


interface SidebarProps {
    activeView: View;
    setActiveView: (view: View) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['High-Frequency Trading']));

    const toggleGroup = (label: string) => {
        setOpenGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(label)) {
                newSet.delete(label);
            } else {
                newSet.add(label);
            }
            return newSet;
        });
    };

    const { filteredItems, forceOpen } = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase().trim();
        if (!lowercasedTerm) {
            return { filteredItems: NAV_ITEMS, forceOpen: new Set<string>() };
        }

        const newForceOpen = new Set<string>();

        function filterAndMark(items: NavItem[]): (NavItem | null)[] {
            return items.map(item => {
                if (item.type === 'group') {
                    const newChildren = filterAndMark(item.children);
                    if (newChildren.some(child => child !== null)) {
                        newForceOpen.add(item.label);
                        return { ...item, children: newChildren.filter(c => c !== null) as (NavLink | NavGroup)[] };
                    }
                }
                if (item.id) { // NavLink
                    if (item.label.toLowerCase().includes(lowercasedTerm) || item.description.toLowerCase().includes(lowercasedTerm)) {
                        return item;
                    }
                }
                if (item.type === 'header' || item.type === 'divider') {
                    return item;
                }
                return null;
            });
        }

        let partiallyFiltered = filterAndMark(NAV_ITEMS).filter(item => item !== null) as NavItem[];
        
        const finalFiltered: NavItem[] = [];
        for (let i = 0; i < partiallyFiltered.length; i++) {
            const item = partiallyFiltered[i];
            if (item.type === 'header') {
                let hasContent = false;
                for (let j = i + 1; j < partiallyFiltered.length; j++) {
                    const nextItem = partiallyFiltered[j];
                    if (nextItem.type === 'header') break;
                    if (nextItem.type !== 'divider') {
                        hasContent = true;
                        break;
                    }
                }
                if (hasContent) finalFiltered.push(item);
            } else if (item.type === 'divider') {
                const prevItem = finalFiltered[finalFiltered.length - 1];
                const nextItem = partiallyFiltered[i + 1];
                if (prevItem && nextItem && prevItem.type !== 'header' && prevItem.type !== 'divider' && nextItem.type !== 'header') {
                    finalFiltered.push(item);
                }
            } else {
                finalFiltered.push(item);
            }
        }

        return { filteredItems: finalFiltered, forceOpen: newForceOpen };
    }, [searchTerm]);

    const renderNavItems = (items: NavItem[], level = 0): React.ReactNode => {
        return items.map((item, index) => {
            if (item.type === 'header') {
                return <li key={`header-${item.label}-${index}`} className="px-3 pt-6 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</li>;
            }
            if (item.type === 'divider') {
                return <li key={`divider-${index}`}><hr className="my-3 border-gray-700/50" /></li>;
            }
            if (item.type === 'group') {
                const isGroupOpen = openGroups.has(item.label) || (searchTerm.length > 0 && forceOpen.has(item.label));
                return (
                    <li key={item.label}>
                        <button
                            onClick={() => toggleGroup(item.label)}
                            className="w-full flex items-center justify-between space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 text-gray-300 hover:bg-gray-700/50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            style={{ paddingLeft: `${0.75 + level * 1.25}rem` }}
                        >
                            <div className="flex items-center space-x-3">
                                {React.cloneElement(item.icon, { className: 'h-5 w-5 flex-shrink-0' })}
                                <span className="font-medium">{item.label}</span>
                            </div>
                            <ChevronRightIcon className={`h-4 w-4 transition-transform duration-200 ${isGroupOpen ? 'rotate-90' : ''}`} />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isGroupOpen ? 'max-h-[1000px]' : 'max-h-0'}`}>
                            <ul className="pt-1">
                                {renderNavItems(item.children, level + 1)}
                            </ul>
                        </div>
                    </li>
                );
            }
            const isActive = activeView === item.id;
            return (
                <li key={item.id}>
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setActiveView(item.id);
                            if (window.innerWidth < 1024) setIsOpen(false);
                        }}
                        className={`flex flex-col items-start rounded-lg transition-colors duration-200 group ${isActive ? 'bg-cyan-500/20' : 'hover:bg-gray-700/50'}`}
                        style={{ paddingLeft: `${0.75 + level * 1.25}rem`, paddingRight: '0.75rem', paddingTop: '0.6rem', paddingBottom: '0.6rem' }}
                    >
                        <div className="flex items-center space-x-3">
                            {React.cloneElement(item.icon, { className: `h-5 w-5 flex-shrink-0 ${isActive ? 'text-cyan-300' : 'text-gray-400 group-hover:text-gray-200'}` })}
                            <span className={`text-sm font-medium ${isActive ? 'text-cyan-200' : 'text-gray-300 group-hover:text-white'}`}>{item.label}</span>
                        </div>
                        <p className={`pl-8 text-xs transition-colors mt-1 ${isActive ? 'text-cyan-300/80' : 'text-gray-500 group-hover:text-gray-400'}`}>
                            {item.description}
                        </p>
                    </a>
                </li>
            );
        });
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 z-30 lg:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={() => setIsOpen(false)}></div>
            
            <aside className={`fixed top-0 left-0 h-full w-72 bg-gray-900/70 backdrop-blur-lg border-r border-gray-700/50 z-40 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex items-center justify-between h-20 border-b border-gray-700/50 px-6 flex-shrink-0">
                    <div className="flex items-center space-x-3 text-cyan-400">
                       <DemoBankLogo className="h-10 w-10" />
                       <span className="font-bold text-lg text-white tracking-wide">DEMO BANK</span>
                    </div>
                </div>

                <div className="p-4 flex-shrink-0">
                    <input 
                        type="text"
                        placeholder="Search modules & apps..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                </div>

                <nav className="flex-grow overflow-y-auto px-2 pb-4">
                    <ul>
                        {renderNavItems(filteredItems)}
                    </ul>
                </nav>

                <div className="mt-auto flex-shrink-0 border-t border-gray-700/50 p-4">
                    <div className="flex items-center space-x-4">
                        <img className="h-10 w-10 rounded-full" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
                        <div className="flex-grow">
                            <p className="text-sm font-semibold text-white">Jane Doe</p>
                            <p className="text-xs text-gray-400">Quantum Analyst</p>
                        </div>
                        <button className="p-2 rounded-full text-gray-400 hover:bg-gray-700/50 hover:text-white">
                            <LogoutIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;