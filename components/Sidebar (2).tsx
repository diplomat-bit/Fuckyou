
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
