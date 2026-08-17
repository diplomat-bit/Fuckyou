import React, { useState, useContext, useMemo, useEffect, useRef } from 'react';
import { useMsal } from "@azure/msal-react";
import { DataContext } from '../context/DataContext';
import { useFirebase } from '../context/FirebaseContext';
import {
  Search,
  Bell,
  User,
  Cpu,
  Activity,
  Shield,
  LogOut,
  LogIn,
  Settings,
  Menu,
  ChevronDown,
  Globe,
  Terminal,
  Database,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertTriangle,
  Sliders,
  Key,
  CreditCard,
  Info,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  X,
  HelpCircle,
  BookOpen
} from 'lucide-react';

// Safe context accessors to prevent crashes if providers are missing
const useSafeDataContext = () => {
  try {
    const context = useContext(DataContext);
    return context || {};
  } catch (e) {
    return {};
  }
};

const useSafeFirebase = () => {
  try {
    const firebase = useFirebase();
    return firebase || {};
  } catch (e) {
    return {};
  }
};

const useSafeMsal = () => {
  try {
    const msal = useMsal();
    return msal || { instance: null, accounts: [], inProgress: 'none' };
  } catch (e) {
    return { instance: null, accounts: [], inProgress: 'none' };
  }
};

interface HeaderProps {
  openTab?: (id: string, name: string) => void;
  setView?: (view: any) => void;
  toggleSidebar?: () => void;
}

interface SearchItem {
  id: string;
  name: string;
  category: string;
  description?: string;
}

const SEARCHABLE_ITEMS: SearchItem[] = [
  { id: 'files-vault', name: 'Files & Dossier Vault', category: 'Security', description: 'Secure document and credential storage' },
  { id: 'dashboard', name: 'Executive Command Dashboard', category: 'Core', description: 'Overview of all sovereign operations' },
  { id: 'data-ingest', name: 'Neural Ingest', category: 'Data', description: 'Real-time data pipeline and ingestion' },
  { id: 'portal-hub', name: 'Sovereign Portal Hub', category: 'Core', description: 'Central gateway for external portals' },
  { id: 'billing-identity', name: 'Identity Vault', category: 'Security', description: 'Billing profiles and sovereign identities' },
  { id: 'legion-architect', name: 'Legion I: Architect', category: 'AI Legions', description: 'AI system architecture and design' },
  { id: 'legion-ghost', name: 'Legion II: Ghost', category: 'AI Legions', description: 'Stealth operations and proxy management' },
  { id: 'legion-visualizer', name: 'Legion III: Visualizer', category: 'AI Legions', description: 'Creative suite and UI generation' },
  { id: 'legion-voice', name: 'Legion IV: Voice', category: 'AI Legions', description: 'Real-time voice synthesis and control' },
  { id: 'legion-auditor', name: 'Legion V: Auditor', category: 'AI Legions', description: 'Compliance and security auditing' },
  { id: 'legion-live', name: 'Legion VI: Live', category: 'AI Legions', description: 'Live portal monitoring and telemetry' },
  { id: 'identity-citadel', name: 'Identity Citadel', category: 'Security', description: 'Multi-factor and biometric authentication' },
  { id: 'global-ledger', name: 'Global Ledger', category: 'Finance', description: 'Unified transaction ledger' },
  { id: 'wealth-nexus', name: 'Wealth Nexus', category: 'Finance', description: 'Asset management and portfolio tracking' },
  { id: 'trading-bots', name: 'Trading Bots', category: 'Finance', description: 'Automated algorithmic trading terminals' },
  { id: 'citi-gateway', name: 'Citi Sovereign Gateway', category: 'Integrations', description: 'Citi Treasury and payment initiation' },
  { id: 'alpaca-broker', name: 'Alpaca Broker API Suite', category: 'Integrations', description: 'Alpaca trading and account management' },
  { id: 'api-keys', name: 'API Keys & Secrets', category: 'Settings', description: 'Manage integration credentials' },
  { id: 'mcp-server', name: 'Mastercard Developers MCP Server', category: 'MCP', description: 'Model Context Protocol server status' },
];

export default function Header({ openTab, setView, toggleSidebar }: HeaderProps) {
  const { systemStatus, bypassAuth, setBypassAuth } = useSafeDataContext();
  const { user, signOut: firebaseSignOut } = useSafeFirebase();
  const { instance: msalInstance, accounts: msalAccounts } = useSafeMsal();

  // Local UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Refs for click-outside handling
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'MCP Server Connected',
      description: 'Mastercard Developers MCP Server running on stdio transport.',
      type: 'success',
      time: 'Just now',
      read: false,
    },
    {
      id: '2',
      title: 'Alpaca Order Executed',
      description: 'TQQQ AI Quant Strategy executed BUY order for 50 shares.',
      type: 'info',
      time: '5m ago',
      read: false,
    },
    {
      id: '3',
      title: 'Citi Gateway Handshake',
      description: 'Sovereign Org Handshake completed with Citi Treasury Hub.',
      type: 'success',
      time: '15m ago',
      read: true,
    },
    {
      id: '4',
      title: 'Security Alert',
      description: 'New API Key generated for Legion IV: Voice.',
      type: 'warning',
      time: '1h ago',
      read: true,
    },
  ]);

  // Dynamic Notification Generator to simulate live system activity
  useEffect(() => {
    const mockEvents = [
      { title: 'Mastercard API Call', description: 'get-services-list tool invoked by Agent.', type: 'info' },
      { title: 'Stripe Treasury Sync', description: 'Sovereign ledger synchronized with Stripe Treasury.', type: 'success' },
      { title: 'Plaid Link Active', description: 'Plaid-Alpaca Liquidity Bridge verified.', type: 'success' },
      { title: 'Legion V Audit', description: 'Legion V: Auditor completed compliance scan.', type: 'warning' },
    ];

    const interval = setInterval(() => {
      const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      setNotifications(prev => [
        {
          id: Date.now().toString(),
          title: randomEvent.title,
          description: randomEvent.description,
          type: randomEvent.type,
          time: 'Just now',
          read: false,
        },
        ...prev
      ]);
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered search results
  const filteredSearchItems = useMemo(() => {
    if (!searchQuery) return SEARCHABLE_ITEMS.slice(0, 5);
    return SEARCHABLE_ITEMS.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const handleSearchItemClick = (item: SearchItem) => {
    if (openTab) {
      openTab(item.id, item.name);
    } else if (setView) {
      setView(item.id);
    }
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogout = async () => {
    if (firebaseSignOut) {
      await firebaseSignOut();
    }
    if (msalInstance && msalAccounts.length > 0) {
      msalInstance.logoutPopup().catch(console.error);
    }
    setIsProfileOpen(false);
  };

  // Determine active user profile details
  const activeUser = useMemo(() => {
    if (user) {
      return {
        name: user.displayName || 'Sovereign User',
        email: user.email || 'user@sovereign.org',
        avatar: user.photoURL || null,
        provider: 'Firebase'
      };
    }
    if (msalAccounts && msalAccounts.length > 0) {
      return {
        name: msalAccounts[0].name || 'Azure Operator',
        email: msalAccounts[0].username || 'operator@azure.com',
        avatar: null,
        provider: 'Azure AD'
      };
    }
    return {
      name: 'Sovereign Administrator',
      email: 'admin@sovereign.nexus',
      avatar: null,
      provider: bypassAuth ? 'Bypass Mode' : 'Local'
    };
  }, [user, msalAccounts, bypassAuth]);

  return (
    <header className="h-16 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40 select-none">
      
      {/* Left Section: Brand & Sidebar Toggle */}
      <div className="flex items-center space-x-4">
        {toggleSidebar && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors lg:hidden"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Mastercard Developers Agent Toolkit Branding */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            {/* Mathematically accurate Mastercard overlapping circles SVG */}
            <svg className="h-6 w-10 drop-shadow-[0_0_8px_rgba(247,158,27,0.2)]" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="#EB001B" fillOpacity="0.9" />
              <circle cx="28" cy="12" r="12" fill="#F79E1B" fillOpacity="0.9" />
              <path d="M20 4.5C18.2 6.5 17.1 9.1 17.1 12C17.1 14.9 18.2 17.5 20 19.5C21.8 17.5 22.9 14.9 22.9 12C22.9 9.1 21.8 6.5 20 4.5Z" fill="#FF5F00" />
            </svg>
          </div>
          <div className="hidden md:flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-100 tracking-wide">Mastercard</span>
              <span className="text-xs font-medium text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">Developers</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Agent Toolkit MCP
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: Quick Search Command Palette */}
      <div ref={searchRef} className="flex-1 max-w-md mx-8 relative hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search tools, guides, or APIs... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Dropdown */}
        {isSearchFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto backdrop-blur-xl">
            <div className="p-2 border-b border-slate-900 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>{searchQuery ? 'SEARCH RESULTS' : 'SUGGESTED COMMANDS'}</span>
              <span>ESC TO CLOSE</span>
            </div>
            <div className="p-1.5">
              {filteredSearchItems.length > 0 ? (
                filteredSearchItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSearchItemClick(item)}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-900/80 flex items-start justify-between transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">
                        {item.name}
                      </div>
                      {item.description && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {item.description}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-colors">
                      {item.category}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-slate-500">
                  No matching tools or views found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Section: Status, Notifications, Profile */}
      <div className="flex items-center space-x-4">
        
        {/* System Status Indicator */}
        <div ref={statusRef} className="relative">
          <button
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800/80 px-3 py-1.5 rounded-xl hover:bg-slate-900 transition-all"
          >
            <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-slate-300 hidden md:inline">SYS: ACTIVE</span>
            <ChevronDown className="h-3 w-3 text-slate-500" />
          </button>

          {isStatusOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 backdrop-blur-xl">
              <h3 className="text-xs font-bold text-slate-400 font-mono mb-3 tracking-wider">SYSTEM TELEMETRY</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-2">
                    <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                    Mastercard MCP Server
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    CONNECTED
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-blue-400" />
                    Azure MSAL Auth
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    msalAccounts.length > 0 
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}>
                    {msalAccounts.length > 0 ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-2">
                    <Database className="h-3.5 w-3.5 text-violet-400" />
                    Firebase Database
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    ONLINE
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-amber-400" />
                    Citi Sovereign Gateway
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    VERIFIED
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>LATENCY: 42ms</span>
                <span>VERSION: 1.0.4</span>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all relative"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 text-[9px] font-bold text-slate-950 rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
              <div className="p-3 border-b border-slate-900 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-mono">NOTIFICATIONS</span>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-900">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 hover:bg-slate-900/40 transition-colors relative group ${
                        !notif.read ? 'bg-slate-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            notif.type === 'success' ? 'bg-emerald-500' :
                            notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                          <h4 className="text-xs font-semibold text-slate-200">{notif.title}</h4>
                        </div>
                        <button
                          onClick={() => handleClearNotification(notif.id)}
                          className="text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{notif.description}</p>
                      <span className="text-[9px] text-slate-600 font-mono mt-1.5 block">{notif.time}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No new notifications.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 p-1 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-900 transition-all"
          >
            {activeUser.avatar ? (
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="h-7 w-7 rounded-lg object-cover border border-slate-700"
              />
            ) : (
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-bold text-xs border border-emerald-400/20">
                {activeUser.name.charAt(0)}
              </div>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 pr-1" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
              {/* User Info Header */}
              <div className="p-4 border-b border-slate-900 bg-slate-900/20">
                <div className="text-sm font-semibold text-slate-200 truncate">{activeUser.name}</div>
                <div className="text-xs text-slate-500 truncate mt-0.5">{activeUser.email}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[9px] font-mono bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                    {activeUser.provider}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                    <Shield className="h-2.5 w-2.5" />
                    ADMIN
                  </span>
                </div>
              </div>

              {/* Dropdown Actions */}
              <div className="p-1.5 space-y-0.5">
                <button
                  onClick={() => {
                    if (openTab) openTab('settings', 'Core Settings');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-xs text-slate-300 flex items-center space-x-2.5 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-500" />
                  <span>Account Settings</span>
                </button>
                <button
                  onClick={() => {
                    if (openTab) openTab('api-keys', 'API Keys & Secrets');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-xs text-slate-300 flex items-center space-x-2.5 transition-colors"
                >
                  <Key className="h-3.5 w-3.5 text-slate-500" />
                  <span>API Credentials</span>
                </button>

                {/* Bypass Auth Toggle */}
                {setBypassAuth && (
                  <div className="px-3 py-2 flex items-center justify-between border-t border-slate-900 mt-1.5 pt-1.5">
                    <span className="text-xs text-slate-400 flex items-center gap-2">
                      {bypassAuth ? (
                        <Unlock className="h-3.5 w-3.5 text-amber-400" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-slate-500" />
                      )}
                      Bypass Auth
                    </span>
                    <button
                      onClick={() => setBypassAuth(!bypassAuth)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                        bypassAuth ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-slate-950 transition-transform ${
                          bypassAuth ? 'translate-x-4.5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <div className="p-1.5 border-t border-slate-900 bg-slate-900/10">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-950/30 hover:text-red-400 text-xs text-slate-400 flex items-center space-x-2.5 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Disconnect Session</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}