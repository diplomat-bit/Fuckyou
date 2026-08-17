import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Key,
  Trash2,
  RefreshCw,
  Plus,
  Eye,
  EyeOff,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  Search,
  Database,
  Info,
  Copy,
  Check,
  X,
  Lock,
  ExternalLink,
  Layers,
  Sliders,
  FileText
} from 'lucide-react';

// --- TYPES & INTERFACES ---
export interface OAuthToken {
  id: string;
  provider: string;
  clientId: string;
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  scopes: string[];
  expiresAt: string; // ISO String
  issuedAt: string; // ISO String
  storageType: 'local' | 'session';
  keyName: string;
}

interface TokenStorageManagerProps {
  storageKeyPrefix?: string;
  onTokenRevoked?: (token: OAuthToken) => void;
  onTokenRefreshed?: (token: OAuthToken) => Promise<OAuthToken>;
  className?: string;
}

// --- MOCK DATA FOR DEMO PURPOSES (If storage is empty) ---
const MOCK_TOKENS: OAuthToken[] = [
  {
    id: 'mock-google-id',
    provider: 'Google Cloud Platform',
    clientId: '603948572910-v8df9a8f7a8s7df8a.apps.googleusercontent.com',
    accessToken: 'ya29.a0AfH6SMC_Z8X9Y7Z6W5V4U3T2S1R0Q9P8O7N6M5L4K3J2I1H0G9F8E7D6C5B4A3',
    refreshToken: '1//0e_Y7X8W9V0U1T2S3R4Q5P6O7N8M9L0K1J2I3H4G5F6E7D8C9B0A',
    idToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiIxMjM0NTY3ODkwIiwiYXVkIjoiY2xpZW50X2lkIiwiZXhwIjoxNzExOTIzNDU2LCJpYXQiOjE3MTE4ODY2NTZ9',
    scopes: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/drive.readonly'],
    expiresAt: new Date(Date.now() + 3600 * 1000 * 2).toISOString(), // 2 hours from now
    issuedAt: new Date(Date.now() - 3600 * 1000 * 0.5).toISOString(),
    storageType: 'local',
    keyName: 'oauth_token_google'
  },
  {
    id: 'mock-github-id',
    provider: 'GitHub API',
    clientId: 'Iv1.8a7b6c5d4e3f2g1h',
    accessToken: 'gho_16charAnumericTokenStringForGitHubAccess',
    scopes: ['repo', 'user', 'read:org'],
    expiresAt: new Date(Date.now() - 1800 * 1000).toISOString(), // Expired 30 mins ago
    issuedAt: new Date(Date.now() - 7200 * 1000).toISOString(),
    storageType: 'session',
    keyName: 'oauth_token_github'
  },
  {
    id: 'mock-auth0-id',
    provider: 'Auth0 Identity',
    clientId: 'auth0|65a1b2c3d4e5f6g7h8i9j0k1',
    accessToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik16Z3dOekV6...[truncated]',
    refreshToken: 'v1.M0ck_R3fr3sh_T0k3n_Stn_Auth0_987654321',
    scopes: ['openid', 'profile', 'email', 'offline_access', 'read:appointments'],
    expiresAt: new Date(Date.now() + 300 * 1000).toISOString(), // Expiring in 5 mins
    issuedAt: new Date(Date.now() - 3300 * 1000).toISOString(),
    storageType: 'local',
    keyName: 'oauth_token_auth0'
  }
];

export default function OauthTokenStorageManager({
  storageKeyPrefix = 'oauth_token_',
  onTokenRevoked,
  onTokenRefreshed,
  className = ''
}: TokenStorageManagerProps) {
  // --- STATE ---
  const [tokens, setTokens] = useState<OAuthToken[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [storageFilter, setStorageFilter] = useState<'all' | 'local' | 'session'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'expiring'>('all');
  const [revealedTokens, setRevealedTokens] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Form State for New Token
  const [newProvider, setNewProvider] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newAccessToken, setNewAccessToken] = useState('');
  const [newRefreshToken, setNewRefreshToken] = useState('');
  const [newScopes, setNewScopes] = useState('');
  const [newExpiresIn, setNewExpiresIn] = useState('3600'); // in seconds
  const [newStorageType, setNewStorageType] = useState<'local' | 'session'>('local');

  // --- TICK CLOCK FOR EXPIRATION COUNTDOWNS ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- LOAD TOKENS FROM STORAGE ---
  const loadTokensFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return;

    const loadedTokens: OAuthToken[] = [];

    // Helper to parse and validate token from storage
    const parseToken = (key: string, value: string, type: 'local' | 'session'): OAuthToken | null => {
      try {
        const parsed = JSON.parse(value);
        if (parsed && parsed.accessToken && parsed.provider) {
          return {
            id: parsed.id || `${type}-${key}`,
            provider: parsed.provider,
            clientId: parsed.clientId || 'Unknown Client ID',
            accessToken: parsed.accessToken,
            refreshToken: parsed.refreshToken,
            idToken: parsed.idToken,
            scopes: Array.isArray(parsed.scopes) ? parsed.scopes : (parsed.scopes ? parsed.scopes.split(' ') : []),
            expiresAt: parsed.expiresAt || new Date(Date.now() + 3600 * 1000).toISOString(),
            issuedAt: parsed.issuedAt || new Date().toISOString(),
            storageType: type,
            keyName: key
          };
        }
      } catch (e) {
        // Not a valid JSON or token structure, skip
      }
      return null;
    };

    // Scan Local Storage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(storageKeyPrefix)) {
        const val = localStorage.getItem(key);
        if (val) {
          const token = parseToken(key, val, 'local');
          if (token) loadedTokens.push(token);
        }
      }
    }

    // Scan Session Storage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(storageKeyPrefix)) {
        const val = sessionStorage.getItem(key);
        if (val) {
          const token = parseToken(key, val, 'session');
          if (token) loadedTokens.push(token);
        }
      }
    }

    // If no tokens found, populate with mock data for demonstration
    if (loadedTokens.length === 0) {
      MOCK_TOKENS.forEach(mock => {
        const storage = mock.storageType === 'local' ? localStorage : sessionStorage;
        storage.setItem(mock.keyName, JSON.stringify(mock));
        loadedTokens.push(mock);
      });
      showNotification('info', 'Initialized storage with demo OAuth tokens.');
    }

    setTokens(loadedTokens);
  }, [storageKeyPrefix]);

  useEffect(() => {
    loadTokensFromStorage();
  }, [loadTokensFromStorage]);

  // --- NOTIFICATION HELPER ---
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- COPY TO CLIPBOARD ---
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showNotification('success', 'Token copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- TOGGLE VISIBILITY ---
  const toggleVisibility = (id: string) => {
    setRevealedTokens(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- DELETE / REVOKE TOKEN ---
  const handleDeleteToken = async (token: OAuthToken) => {
    if (confirm(`Are you sure you want to revoke and delete the token for ${token.provider}?`)) {
      try {
        // Call external revocation callback if provided
        if (onTokenRevoked) {
          await onTokenRevoked(token);
        }

        // Remove from physical storage
        if (token.storageType === 'local') {
          localStorage.removeItem(token.keyName);
        } else {
          sessionStorage.removeItem(token.keyName);
        }

        showNotification('success', `Successfully revoked token for ${token.provider}`);
        loadTokensFromStorage();
      } catch (error) {
        showNotification('error', `Failed to revoke token: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  // --- REFRESH TOKEN ---
  const handleRefreshToken = async (token: OAuthToken) => {
    if (!token.refreshToken) {
      showNotification('error', 'No refresh token available for this provider.');
      return;
    }

    try {
      showNotification('info', `Refreshing token for ${token.provider}...`);

      let updatedToken: OAuthToken;

      if (onTokenRefreshed) {
        // Use custom refresh handler if provided
        updatedToken = await onTokenRefreshed(token);
      } else {
        // Simulate API refresh call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate new access token and extend expiration by 1 hour
        updatedToken = {
          ...token,
          accessToken: 'refreshed_access_token_' + Math.random().toString(36).substring(2, 15),
          expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
          issuedAt: new Date().toISOString()
        };
      }

      // Save back to storage
      const storage = updatedToken.storageType === 'local' ? localStorage : sessionStorage;
      storage.setItem(updatedToken.keyName, JSON.stringify(updatedToken));

      showNotification('success', `Successfully refreshed token for ${token.provider}!`);
      loadTokensFromStorage();
    } catch (error) {
      showNotification('error', `Failed to refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // --- ADD MANUAL TOKEN ---
  const handleAddToken = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProvider || !newAccessToken) {
      showNotification('error', 'Provider and Access Token are required.');
      return;
    }

    const keyName = `${storageKeyPrefix}${newProvider.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const expiresAt = new Date(Date.now() + parseInt(newExpiresIn) * 1000).toISOString();
    const issuedAt = new Date().toISOString();

    const tokenPayload: OAuthToken = {
      id: `${newStorageType}-${keyName}-${Date.now()}`,
      provider: newProvider,
      clientId: newClientId || 'Manual Entry',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken || undefined,
      scopes: newScopes ? newScopes.split(',').map(s => s.trim()) : [],
      expiresAt,
      issuedAt,
      storageType: newStorageType,
      keyName
    };

    const storage = newStorageType === 'local' ? localStorage : sessionStorage;
    storage.setItem(keyName, JSON.stringify(tokenPayload));

    showNotification('success', `Token for ${newProvider} added successfully!`);
    setIsAddModalOpen(false);
    
    // Reset Form
    setNewProvider('');
    setNewClientId('');
    setNewAccessToken('');
    setNewRefreshToken('');
    setNewScopes('');
    setNewExpiresIn('3600');
    
    loadTokensFromStorage();
  };

  // --- EXPORT ALL TOKENS ---
  const handleExportTokens = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tokens, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `oauth_tokens_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showNotification('success', 'Tokens exported successfully.');
    } catch (error) {
      showNotification('error', 'Failed to export tokens.');
    }
  };

  // --- IMPORT TOKENS ---
  const handleImportTokens = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          const importedTokens = Array.isArray(parsed) ? parsed : [parsed];
          
          let count = 0;
          importedTokens.forEach((tok: any) => {
            if (tok.provider && tok.accessToken && tok.keyName) {
              const storage = tok.storageType === 'session' ? sessionStorage : localStorage;
              storage.setItem(tok.keyName, JSON.stringify(tok));
              count++;
            }
          });

          showNotification('success', `Successfully imported ${count} tokens.`);
          loadTokensFromStorage();
        } catch (error) {
          showNotification('error', 'Invalid JSON file format.');
        }
      };
    }
  };

  // --- CLEAR ALL TOKENS ---
  const handleClearAll = () => {
    if (confirm('Are you absolutely sure you want to clear ALL stored OAuth tokens? This will log you out of connected services.')) {
      tokens.forEach(token => {
        if (token.storageType === 'local') {
          localStorage.removeItem(token.keyName);
        } else {
          sessionStorage.removeItem(token.keyName);
        }
      });
      showNotification('success', 'All tokens cleared from storage.');
      setTokens([]);
    }
  };

  // --- CALCULATE EXPIRATION STATUS ---
  const getExpirationDetails = (expiresAtStr: string) => {
    const expiresAt = new Date(expiresAtStr);
    const diffMs = expiresAt.getTime() - currentTime.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec <= 0) {
      return { status: 'expired' as const, text: 'Expired', percent: 0, color: 'bg-rose-500', textColor: 'text-rose-500' };
    }

    const totalDuration = 3600; // Assume standard 1 hour for percentage calculation if we don't have issuedAt
    const percent = Math.max(0, Math.min(100, (diffSec / totalDuration) * 100));

    if (diffSec < 300) { // Less than 5 mins
      return {
        status: 'expiring' as const,
        text: `Expiring in ${Math.floor(diffSec / 60)}m ${diffSec % 60}s`,
        percent,
        color: 'bg-amber-500 animate-pulse',
        textColor: 'text-amber-500'
      };
    }

    const hours = Math.floor(diffSec / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);
    const text = hours > 0 ? `${hours}h ${mins}m remaining` : `${mins}m remaining`;

    return {
      status: 'active' as const,
      text,
      percent,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-500'
    };
  };

  // --- FILTERED TOKENS ---
  const filteredTokens = useMemo(() => {
    return tokens.filter(token => {
      // Search filter
      const matchesSearch = 
        token.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.scopes.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

      // Storage filter
      const matchesStorage = storageFilter === 'all' || token.storageType === storageFilter;

      // Status filter
      const exp = getExpirationDetails(token.expiresAt);
      const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;

      return matchesSearch && matchesStorage && matchesStatus;
    });
  }, [tokens, searchQuery, storageFilter, statusFilter, currentTime]);

  // --- STATS COUNTERS ---
  const stats = useMemo(() => {
    let active = 0;
    let expired = 0;
    let expiring = 0;

    tokens.forEach(t => {
      const details = getExpirationDetails(t.expiresAt);
      if (details.status === 'active') active++;
      else if (details.status === 'expired') expired++;
      else if (details.status === 'expiring') expiring++;
    });

    return { total: tokens.length, active, expired, expiring };
  }, [tokens, currentTime]);

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl ${className}`}>
      
      {/* --- NOTIFICATION TOAST --- */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 transform translate-y-0 ${
          notification.type === 'success' ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200' :
          notification.type === 'error' ? 'bg-rose-950/90 border-rose-500 text-rose-200' :
          'bg-blue-950/90 border-blue-500 text-blue-200'
        }`}>
          {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
          {notification.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
          {notification.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">OAuth Token Storage Manager</h1>
              <p className="text-sm text-slate-400">Inspect, refresh, revoke, and manage active OAuth 2.0 credentials stored in client-side storage.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Add Token Manually
          </button>

          <button
            onClick={handleExportTokens}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-all"
            title="Export tokens as JSON"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportTokens}
              className="hidden"
            />
          </label>

          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-sm font-semibold rounded-xl border border-rose-900/50 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* --- STATS OVERVIEW --- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
        <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Stored</div>
          <div className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            {stats.total}
          </div>
        </div>
        <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active & Valid</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {stats.active}
          </div>
        </div>
        <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Expiring Soon</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {stats.expiring}
          </div>
        </div>
        <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Expired</div>
          <div className="text-2xl font-bold text-rose-400 mt-1 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {stats.expired}
          </div>
        </div>
      </div>

      {/* --- FILTERS & SEARCH --- */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by provider, client ID, or scope..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Storage Filter */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400 px-2.5">Storage:</span>
            {(['all', 'local', 'session'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setStorageFilter(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                  storageFilter === type
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400 px-2.5">Status:</span>
            {(['all', 'active', 'expiring', 'expired'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- TOKENS LIST / GRID --- */}
      {filteredTokens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-950/30 rounded-2xl border border-dashed border-slate-800">
          <Lock className="w-12 h-12 text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-300">No tokens found</h3>
          <p className="text-sm text-slate-500 text-center max-w-md mt-1">
            No OAuth tokens match your current search or filter criteria. Try clearing filters or add a token manually.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredTokens.map((token) => {
            const exp = getExpirationDetails(token.expiresAt);
            const isRevealed = !!revealedTokens[token.id];

            return (
              <div
                key={token.id}
                className="bg-slate-950/60 rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 overflow-hidden"
              >
                {/* Token Header */}
                <div className="p-5 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-800 rounded-xl text-indigo-400 border border-slate-700">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white">{token.provider}</h3>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                          token.storageType === 'local'
                            ? 'bg-blue-950/50 border-blue-800 text-blue-400'
                            : 'bg-purple-950/50 border-purple-800 text-purple-400'
                        }`}>
                          {token.storageType} storage
                        </span>
                        <span className="text-xs text-slate-500 font-mono">({token.keyName})</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-mono flex items-center gap-1">
                        Client ID: <span className="text-slate-300 select-all">{token.clientId}</span>
                      </p>
                    </div>
                  </div>

                  {/* Expiration Status Badge */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className={`text-xs font-bold ${exp.textColor} flex items-center gap-1.5 justify-end`}>
                        <Clock className="w-3.5 h-3.5" />
                        {exp.text}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Expires: {new Date(token.expiresAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Token Body */}
                <div className="p-5 space-y-4">
                  {/* Access Token Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        Access Token
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleVisibility(token.id)}
                          className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                          title={isRevealed ? "Hide Token" : "Show Token"}
                        >
                          {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(token.accessToken, token.id)}
                          className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                          title="Copy Token"
                        >
                          {copiedId === token.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type={isRevealed ? "text" : "password"}
                        readOnly
                        value={token.accessToken}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 focus:outline-none select-all"
                      />
                    </div>
                  </div>

                  {/* Refresh Token Field (If exists) */}
                  {token.refreshToken && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                          Refresh Token
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleVisibility(`${token.id}-refresh`)}
                            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                            title={revealedTokens[`${token.id}-refresh`] ? "Hide Token" : "Show Token"}
                          >
                            {revealedTokens[`${token.id}-refresh`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(token.refreshToken!, `${token.id}-refresh`)}
                            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                            title="Copy Refresh Token"
                          >
                            {copiedId === `${token.id}-refresh` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type={revealedTokens[`${token.id}-refresh`] ? "text" : "password"}
                          readOnly
                          value={token.refreshToken}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 focus:outline-none select-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Scopes */}
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block mb-1.5">Authorized Scopes</span>
                    <div className="flex flex-wrap gap-1.5">
                      {token.scopes.length > 0 ? (
                        token.scopes.map((scope, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-mono rounded-md hover:border-indigo-500/30 transition-colors"
                          >
                            {scope}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">No scopes specified</span>
                      )}
                    </div>
                  </div>

                  {/* Expiration Progress Bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Issued: {new Date(token.issuedAt).toLocaleTimeString()}</span>
                      <span>Expires: {new Date(token.expiresAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${exp.color}`}
                        style={{ width: `${exp.percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Token Footer Actions */}
                <div className="px-5 py-3.5 bg-slate-950/80 border-t border-slate-800/60 flex items-center justify-between gap-4">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5" />
                    ID: <span className="font-mono">{token.id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {token.refreshToken && (
                      <button
                        onClick={() => handleRefreshToken(token)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-semibold rounded-lg border border-indigo-500/20 transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refresh Token
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteToken(token)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 text-xs font-semibold rounded-lg border border-rose-900/30 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- ADD TOKEN MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Add OAuth Token Manually</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddToken} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Provider Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Google, GitHub"
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Storage Type</label>
                  <select
                    value={newStorageType}
                    onChange={(e) => setNewStorageType(e.target.value as 'local' | 'session')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="local">Local Storage (Persistent)</option>
                    <option value="session">Session Storage (Tab Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Client ID</label>
                <input
                  type="text"
                  placeholder="OAuth Client ID (Optional)"
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Access Token *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Paste access token string..."
                  value={newAccessToken}
                  onChange={(e) => setNewAccessToken(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Refresh Token</label>
                <input
                  type="text"
                  placeholder="Paste refresh token string (Optional)"
                  value={newRefreshToken}
                  onChange={(e) => setNewRefreshToken(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Expires In (Seconds)</label>
                  <input
                    type="number"
                    placeholder="3600"
                    value={newExpiresIn}
                    onChange={(e) => setNewExpiresIn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Scopes (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="read:user, write:repo"
                    value={newScopes}
                    onChange={(e) => setNewScopes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                >
                  Save Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}