import React, { useState, useContext, useMemo, useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import {
  LayoutDashboard,
  Shield,
  Database,
  Cpu,
  Layers,
  Compass,
  Folder,
  CreditCard,
  TrendingUp,
  Users,
  LogOut,
  User,
  Lock,
  Globe,
  Terminal,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Activity,
  Settings,
  FileText,
  Briefcase,
  Bell,
  Key,
  DollarSign,
  BarChart2,
  Radio,
  Eye,
  Award,
  Map,
  Vote,
  BookOpen,
  GitBranch,
  Link2,
  Zap,
  Server
} from 'lucide-react';

// Contexts & Providers
import { DataContext } from '../context/DataContext';
import { useFirebase } from '../context/FirebaseContext';

// Services & Security
import { lastBossService } from '../services/LastBossService';
import { securityService } from '../services/SecurityService';

// Types & Constants
import { View, AppView } from '../types';
import { SOVEREIGN_APPS, NAV_ITEMS } from '../constants';

interface Tab {
  id: string;
  name: string;
}

interface SidebarProps {
  activeTab: string | null;
  openTab: (id: string, name: string) => void;
  closeTab?: (id: string) => void;
  openTabs?: Tab[];
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setView?: (view: View | AppView) => void;
  dispatch?: React.Dispatch<any>;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  LayoutDashboard,
  Shield,
  Database,
  Cpu,
  Layers,
  Compass,
  Folder,
  CreditCard,
  TrendingUp,
  Users,
  LogOut,
  User,
  Lock,
  Globe,
  Terminal,
  HelpCircle,
  Settings,
  FileText,
  Briefcase,
  Bell,
  Key,
  DollarSign,
  BarChart2,
  Radio,
  Eye,
  Award,
  Map,
  Vote,
  BookOpen,
  GitBranch,
  Link2,
  Zap,
  Server
};

export default function Sidebar({
  activeTab,
  openTab,
  isSidebarOpen,
  setSidebarOpen,
  setView,
  dispatch
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [securityStatus, setSecurityStatus] = useState<string>('Secure');

  // Defensive context retrieval
  let msalAccounts: any[] = [];
  try {
    const msalInstance = useMsal();
    msalAccounts = msalInstance.accounts || [];
  } catch (e) {
    console.warn("MSAL context not available or not initialized", e);
  }

  let firebaseUser: any = null;
  try {
    const firebaseInstance = useFirebase();
    firebaseUser = firebaseInstance?.user || null;
  } catch (e) {
    console.warn("Firebase context not available", e);
  }

  const dataContext = useContext(DataContext);

  // Fetch security status on mount
  useEffect(() => {
    if (securityService && typeof securityService.getSecurityStatus === 'function') {
      setSecurityStatus(securityService.getSecurityStatus());
    }
  }, []);

  // Resolve active user details
  const userDisplayName = useMemo(() => {
    if (firebaseUser?.displayName) return firebaseUser.displayName;
    if (msalAccounts[0]?.name) return msalAccounts[0].name;
    return 'Sovereign Agent';
  }, [firebaseUser, msalAccounts]);

  const userEmail = useMemo(() => {
    if (firebaseUser?.email) return firebaseUser.email;
    if (msalAccounts[0]?.username) return msalAccounts[0].username;
    return 'agent@sovereign.network';
  }, [firebaseUser, msalAccounts]);

  // Dynamic integration statuses
  const integrationStatuses = useMemo(() => {
    return [
      { id: 'mcp', name: 'Mastercard MCP', status: 'Connected', color: 'bg-emerald-500' },
      { id: 'citi', name: 'Citi Gateway', status: 'Active', color: 'bg-emerald-500' },
      { id: 'alpaca', name: 'Alpaca Broker', status: 'Connected', color: 'bg-emerald-500' },
      { id: 'plaid', name: 'Plaid Link', status: 'Ready', color: 'bg-blue-500' },
      { id: 'firebase', name: 'Firebase Sync', status: 'Online', color: 'bg-emerald-500' },
      { id: 'azure', name: 'Azure AD', status: 'Authenticated', color: 'bg-indigo-500' }
    ];
  }, [dataContext]);

  // Group and filter navigation items
  const groupedNavItems = useMemo(() => {
    const groups: Record<string, Array<{ id: string; name: string; icon: string; view?: any }>> = {};

    const itemsToProcess = Array.isArray(NAV_ITEMS) && NAV_ITEMS.length > 0 
      ? NAV_ITEMS 
      : [
          { id: 'dashboard', name: 'Executive Command', icon: 'LayoutDashboard', category: 'Core Command' },
          { id: 'files-vault', name: 'Files & Dossier Vault', icon: 'Folder', category: 'Core Command' },
          { id: 'billing-identity', name: 'Identity Vault', icon: 'Shield', category: 'Security & Identity' },
          { id: 'citi-gateway', name: 'Citi Sovereign Gateway', icon: 'Globe', category: 'Financial Gateways' },
          { id: 'alpaca-broker', name: 'Alpaca Broker API', icon: 'TrendingUp', category: 'Financial Gateways' }
        ];

    itemsToProcess.forEach((item) => {
      const category = item.category || 'Core Command';
      if (!groups[category]) groups[category] = [];
      
      if (!searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        groups[category].push({
          id: item.id,
          name: item.name,
          icon: item.icon,
          view: item.view || item.id
        });
      }
    });

    if (Array.isArray(SOVEREIGN_APPS)) {
      SOVEREIGN_APPS.forEach((app) => {
        const category = app.category || 'Sovereign Apps';
        if (!groups[category]) groups[category] = [];

        if (!searchQuery || app.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          groups[category].push({
            id: app.id,
            name: app.name,
            icon: app.icon || 'Layers',
            view: app.id
          });
        }
      });
    }

    // Clean up empty categories
    Object.keys(groups).forEach((key) => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });

    return groups;
  }, [searchQuery]);

  const handleItemClick = (id: string, name: string, view?: any) => {
    openTab(id, name);
    if (setView && view) {
      setView(view);
    }
    if (dispatch) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: id });
    }
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Compass;
    return <IconComponent className="w-5 h-5 flex-shrink-0" />;
  };

  return (
    <aside
      className={`h-screen sticky top-0 z-30 flex flex-col bg-slate-950 border-r border-slate-800 text-slate-200 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Header / Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
        {isSidebarOpen ? (
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Cpu className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-white uppercase">Sovereign</span>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest">AGENT TOOLKIT</span>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
        )}

        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Search Bar */}
      {isSidebarOpen && (
        <div className="px-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search command suite..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-800/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {Object.entries(groupedNavItems).map(([category, items]) => (
          <div key={category} className="space-y-1">
            {isSidebarOpen ? (
              <h3 className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {category}
              </h3>
            ) : (
              <div className="border-t border-slate-800/40 my-2" />
            )}

            <div className="space-y-0.5">
              {items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id, item.name, item.view)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-slate-900 to-slate-900/40 border-l-2 border-amber-500 text-white shadow-inner'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
                    }`}
                  >
                    <div className={`${isActive ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {renderIcon(item.icon)}
                    </div>
                    {isSidebarOpen ? (
                      <span className="truncate text-xs tracking-wide">{item.name}</span>
                    ) : (
                      <div className="absolute left-full ml-3 px-2 py-1.5 bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                        {item.name}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Active Integration Statuses */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/40">
        {isSidebarOpen ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Integrations</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {integrationStatuses.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center space-x-2 p-1.5 rounded-lg bg-slate-900/40 border border-slate-800/40 hover:border-slate-700/60 transition-colors cursor-pointer"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${integration.color}`} />
                  <span className="text-[10px] text-slate-400 truncate font-mono">{integration.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            <div className="flex flex-col space-y-1">
              {integrationStatuses.slice(0, 3).map((integration) => (
                <span key={integration.id} className={`h-1.5 w-1.5 rounded-full ${integration.color}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-amber-500 shadow-inner flex-shrink-0">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold text-white truncate">{userDisplayName}</span>
                <span className="text-[10px] text-slate-500 truncate font-mono">{userEmail}</span>
              </div>
            )}
          </div>

          {isSidebarOpen && (
            <button
              onClick={() => {
                if (lastBossService && typeof lastBossService.terminateSession === 'function') {
                  lastBossService.terminateSession();
                }
              }}
              className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-500 hover:text-red-400 transition-colors"
              title="Terminate Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}