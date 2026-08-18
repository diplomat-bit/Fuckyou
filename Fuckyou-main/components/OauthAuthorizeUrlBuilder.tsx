import React, { useState, useEffect, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Play, 
  Info, 
  Settings, 
  Globe, 
  Lock, 
  Eye, 
  ArrowRight, 
  Sparkles,
  RotateCcw,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

// Types & Interfaces
interface QueryParams {
  baseUrl: string;
  client_id: string;
  response_type: string;
  redirect_uri: string;
  scope: string;
  state: string;
  businessCode: string;
  locale: string;
  countryCode: string;
}

interface ValidationErrors {
  baseUrl?: string;
  client_id?: string;
  redirect_uri?: string;
  businessCode?: string;
  countryCode?: string;
  locale?: string;
}

interface Preset {
  name: string;
  description: string;
  params: Partial<QueryParams>;
}

const PRESETS: Preset[] = [
  {
    name: 'Standard Web App (Auth Code)',
    description: 'Recommended for server-side applications using Authorization Code Flow.',
    params: {
      response_type: 'code',
      scope: 'openid profile email offline_access',
      baseUrl: 'https://auth.example.com/oauth/authorize',
      redirect_uri: 'https://my-app.com/api/auth/callback',
    }
  },
  {
    name: 'Single Page Application (PKCE)',
    description: 'For React/Vue/Angular apps running in the browser.',
    params: {
      response_type: 'code',
      scope: 'openid profile read:transactions',
      baseUrl: 'https://identity.example.com/authorize',
      redirect_uri: 'http://localhost:3000/callback',
    }
  },
  {
    name: 'B2B Enterprise Portal',
    description: 'Configured with business code, locale, and country code routing.',
    params: {
      response_type: 'code',
      scope: 'openid organization.read write:reports',
      baseUrl: 'https://enterprise.auth.com/oauth2/v1/authorize',
      redirect_uri: 'https://portal.enterprise.com/login/callback',
      businessCode: 'ENT',
      locale: 'en-US',
      countryCode: 'US',
    }
  }
];

export default function OauthAuthorizeUrlBuilder() {
  // Form State
  const [params, setParams] = useState<QueryParams>({
    baseUrl: 'https://auth.example.com/oauth/authorize',
    client_id: 'cli_9876543210alpha',
    response_type: 'code',
    redirect_uri: 'https://my-app.com/callback',
    scope: 'openid profile email',
    state: 'st_random_9988776655',
    businessCode: 'USA',
    locale: 'en-US',
    countryCode: 'US',
  });

  // UI States
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [activeTab, setActiveTab] = useState<'builder' | 'presets'>('builder');
  
  // Simulation States
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState<'idle' | 'login' | 'consent' | 'redirecting' | 'success'>('idle');
  const [simUsername, setSimUsername] = useState('developer@example.com');
  const [simPassword, setSimPassword] = useState('••••••••••••');
  const [simApprovedScopes, setSimApprovedScopes] = useState<string[]>([]);

  // Generate Random State Parameter
  const generateState = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'st_';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setParams(prev => ({ ...prev, state: result }));
  };

  // Handle Input Changes
  const handleInputChange = (key: keyof QueryParams, value: string) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  // Apply Preset
  const applyPreset = (preset: Preset) => {
    setParams(prev => ({
      ...prev,
      ...preset.params,
    }));
    setActiveTab('builder');
  };

  // Reset Form
  const handleReset = () => {
    setParams({
      baseUrl: 'https://auth.example.com/oauth/authorize',
      client_id: '',
      response_type: 'code',
      redirect_uri: '',
      scope: '',
      state: '',
      businessCode: '',
      locale: '',
      countryCode: '',
    });
  };

  // Validation Logic
  useEffect(() => {
    const newErrors: ValidationErrors = {};

    // Base URL validation
    if (!params.baseUrl) {
      newErrors.baseUrl = 'Base URL is required';
    } else {
      try {
        new URL(params.baseUrl);
      } catch {
        newErrors.baseUrl = 'Must be a valid absolute URL (e.g., https://...)';
      }
    }

    // Client ID validation
    if (!params.client_id) {
      newErrors.client_id = 'Client ID is required';
    }

    // Redirect URI validation
    if (params.redirect_uri) {
      try {
        new URL(params.redirect_uri);
      } catch {
        newErrors.redirect_uri = 'Must be a valid absolute URL';
      }
    } else {
      newErrors.redirect_uri = 'Redirect URI is required';
    }

    // Business Code validation (Exactly 3 alphanumeric characters)
    if (params.businessCode && !/^[a-zA-Z0-9]{3}$/.test(params.businessCode)) {
      newErrors.businessCode = 'Business Code must be exactly 3 alphanumeric characters';
    }

    // Country Code validation (Exactly 2 letters)
    if (params.countryCode && !/^[a-zA-Z]{2}$/.test(params.countryCode)) {
      newErrors.countryCode = 'Country Code must be exactly 2 letters (ISO 3166-1 alpha-2)';
    }

    // Locale validation (e.g., en, en-US, fr-FR)
    if (params.locale && !/^[a-z]{2}(-[A-Z]{2})?$/.test(params.locale)) {
      newErrors.locale = 'Locale format should be like "en" or "en-US"';
    }

    setErrors(newErrors);
  }, [params]);

  // Construct Live URL
  const constructedUrl = useMemo(() => {
    try {
      if (!params.baseUrl) return '';
      const url = new URL(params.baseUrl);
      
      if (params.client_id) url.searchParams.set('client_id', params.client_id);
      if (params.response_type) url.searchParams.set('response_type', params.response_type);
      if (params.redirect_uri) url.searchParams.set('redirect_uri', params.redirect_uri);
      if (params.scope) url.searchParams.set('scope', params.scope);
      if (params.state) url.searchParams.set('state', params.state);
      if (params.businessCode) url.searchParams.set('businessCode', params.businessCode);
      if (params.locale) url.searchParams.set('locale', params.locale);
      if (params.countryCode) url.searchParams.set('countryCode', params.countryCode);

      return url.toString();
    } catch {
      return 'Invalid Configuration';
    }
  }, [params]);

  // Copy to Clipboard
  const copyToClipboard = () => {
    if (constructedUrl && constructedUrl !== 'Invalid Configuration') {
      navigator.clipboard.writeText(constructedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Simulation Flow Handlers
  const startSimulation = () => {
    if (Object.keys(errors).length > 0) return;
    setIsSimulating(true);
    setSimStep('login');
    setSimApprovedScopes(params.scope ? params.scope.split(' ') : []);
  };

  const handleSimLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSimStep('consent');
  };

  const handleSimConsent = () => {
    setSimStep('redirecting');
    setTimeout(() => {
      setSimStep('success');
    }, 2000);
  };

  const closeSimulation = () => {
    setIsSimulating(false);
    setSimStep('idle');
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold tracking-wider text-indigo-400 bg-indigo-950/50 border border-indigo-800 rounded-full uppercase">
                OAuth 2.0 Tooling
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-900">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Ready
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
              Authorize URL Builder
            </h1>
            <p className="text-slate-400 mt-1 text-sm max-w-2xl">
              Construct, validate, and simulate OAuth2 <code className="text-indigo-300 bg-slate-800/50 px-1.5 py-0.5 rounded">/authorize</code> requests with real-time parameter validation and interactive flow simulation.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Form
            </button>
            <button
              onClick={startSimulation}
              disabled={hasErrors}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-lg transition-all ${
                hasErrors 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20 hover:shadow-indigo-900/40'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              Simulate Flow
            </button>
          </div>
        </header>

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs & Presets */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tabs */}
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => setActiveTab('builder')}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'builder'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                URL Parameters
              </button>
              <button
                onClick={() => setActiveTab('presets')}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'presets'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Quick Presets
              </button>
            </div>

            {activeTab === 'presets' ? (
              /* Presets Tab */
              <div className="grid grid-cols-1 gap-4">
                {PRESETS.map((preset, idx) => (
                  <div 
                    key={idx}
                    onClick={() => applyPreset(preset)}
                    className="p-5 bg-slate-800/40 border border-slate-800 hover:border-indigo-500/50 rounded-xl cursor-pointer transition-all hover:bg-slate-800/80 group"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                        {preset.name}
                      </h3>
                      <span className="text-xs text-indigo-400 bg-indigo-950/50 px-2 py-1 rounded border border-indigo-900">
                        Apply
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">{preset.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {Object.entries(preset.params).map(([key, val]) => (
                        <span key={key} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                          <strong className="text-slate-500">{key}:</strong> {val}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Builder Tab */
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 space-y-6">
                
                {/* Base URL & Client ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-indigo-400" />
                      Authorization Endpoint
                    </label>
                    <input
                      type="text"
                      value={params.baseUrl}
                      onChange={(e) => handleInputChange('baseUrl', e.target.value)}
                      placeholder="https://auth.example.com/oauth/authorize"
                      className={`w-full bg-slate-900 border ${errors.baseUrl ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'} rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all`}
                    />
                    {errors.baseUrl && (
                      <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> {errors.baseUrl}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-400" />
                      Client ID <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={params.client_id}
                      onChange={(e) => handleInputChange('client_id', e.target.value)}
                      placeholder="Enter client_id"
                      className={`w-full bg-slate-900 border ${errors.client_id ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'} rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all`}
                    />
                    {errors.client_id && (
                      <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> {errors.client_id}
                      </p>
                    )}
                  </div>
                </div>

                {/* Response Type & Redirect URI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Response Type
                    </label>
                    <select
                      value={params.response_type}
                      onChange={(e) => handleInputChange('response_type', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    >
                      <option value="code">code (Authorization Code Flow)</option>
                      <option value="token">token (Implicit Flow)</option>
                      <option value="id_token">id_token (OIDC Implicit)</option>
                      <option value="code id_token">code id_token (Hybrid Flow)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Redirect URI <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={params.redirect_uri}
                      onChange={(e) => handleInputChange('redirect_uri', e.target.value)}
                      placeholder="https://my-app.com/callback"
                      className={`w-full bg-slate-900 border ${errors.redirect_uri ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'} rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all`}
                    />
                    {errors.redirect_uri && (
                      <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> {errors.redirect_uri}
                      </p>
                    )}
                  </div>
                </div>

                {/* Scope & State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Scope (Space separated)</span>
                      <span className="text-[10px] text-slate-500 normal-case">e.g. openid profile email</span>
                    </label>
                    <input
                      type="text"
                      value={params.scope}
                      onChange={(e) => handleInputChange('scope', e.target.value)}
                      placeholder="openid profile email"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>State (CSRF Protection)</span>
                      <button 
                        type="button"
                        onClick={generateState}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> Generate Random
                      </button>
                    </label>
                    <input
                      type="text"
                      value={params.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Random security string"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Advanced / Custom Routing Parameters */}
                <div className="pt-4 border-t border-slate-800/60">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-4 flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5" />
                    Routing & Localization Parameters
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-400 flex items-center justify-between">
                        <span>Business Code</span>
                        <span className="text-[10px] text-slate-500">3 Alphanumeric</span>
                      </label>
                      <input
                        type="text"
                        maxLength={3}
                        value={params.businessCode}
                        onChange={(e) => handleInputChange('businessCode', e.target.value.toUpperCase())}
                        placeholder="USA"
                        className={`w-full bg-slate-900 border ${errors.businessCode ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'} rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all`}
                      />
                      {errors.businessCode && (
                        <p className="text-[11px] text-rose-400 mt-1">{errors.businessCode}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-400 flex items-center justify-between">
                        <span>Locale</span>
                        <span className="text-[10px] text-slate-500">e.g. en-US</span>
                      </label>
                      <input
                        type="text"
                        value={params.locale}
                        onChange={(e) => handleInputChange('locale', e.target.value)}
                        placeholder="en-US"
                        className={`w-full bg-slate-900 border ${errors.locale ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'} rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all`}
                      />
                      {errors.locale && (
                        <p className="text-[11px] text-rose-400 mt-1">{errors.locale}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-400 flex items-center justify-between">
                        <span>Country Code</span>
                        <span className="text-[10px] text-slate-500">2 Letters</span>
                      </label>
                      <input
                        type="text"
                        maxLength={2}
                        value={params.countryCode}
                        onChange={(e) => handleInputChange('countryCode', e.target.value.toUpperCase())}
                        placeholder="US"
                        className={`w-full bg-slate-900 border ${errors.countryCode ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'} rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all`}
                      />
                      {errors.countryCode && (
                        <p className="text-[11px] text-rose-400 mt-1">{errors.countryCode}</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Right Column: Live Preview & Validation Summary */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Preview Panel */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between h-full min-h-[400px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-400" />
                    Live URL Preview
                  </h2>
                  <span className="text-xs text-slate-500 font-mono">GET Request</span>
                </div>

                {/* URL Display Box */}
                <div className="relative bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs break-all select-all group min-h-[120px] flex items-start justify-between gap-4">
                  <div className="text-slate-300 leading-relaxed">
                    {constructedUrl ? (
                      <>
                        <span className="text-indigo-400 font-semibold">{params.baseUrl}</span>
                        {constructedUrl.includes('?') && (
                          <>
                            <span className="text-slate-500">?</span>
                            {constructedUrl.split('?')[1].split('&').map((param, idx) => {
                              const [key, val] = param.split('=');
                              return (
                                <span key={idx} className="block pl-4">
                                  <span className="text-emerald-400">{key}</span>
                                  <span className="text-slate-500">=</span>
                                  <span className="text-amber-300">{decodeURIComponent(val)}</span>
                                  {idx < constructedUrl.split('?')[1].split('&').length - 1 && <span className="text-slate-500">&</span>}
                                </span>
                              );
                            })}
                          </>
                        )}
                      </>
                    ) : (
                      <span className="text-slate-600 italic">Awaiting valid configuration...</span>
                    )}
                  </div>
                  
                  <button
                    onClick={copyToClipboard}
                    disabled={!constructedUrl || constructedUrl === 'Invalid Configuration'}
                    className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all"
                    title="Copy URL"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Parameter Breakdown Table */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Parameter Breakdown</h3>
                  <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl overflow-hidden text-xs">
                    <div className="grid grid-cols-3 bg-slate-900 px-4 py-2 border-b border-slate-800 text-slate-400 font-semibold">
                      <div>Parameter</div>
                      <div className="col-span-2">Value</div>
                    </div>
                    <div className="divide-y divide-slate-800/40 max-h-[180px] overflow-y-auto">
                      {Object.entries(params).map(([key, val]) => {
                        if (!val || key === 'baseUrl') return null;
                        return (
                          <div key={key} className="grid grid-cols-3 px-4 py-2 hover:bg-slate-900/30 transition-colors">
                            <div className="font-mono text-indigo-400 font-medium">{key}</div>
                            <div className="col-span-2 font-mono text-slate-300 truncate" title={val}>
                              {val}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Validation Status Footer */}
              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {hasErrors ? (
                    <>
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                      <span className="text-xs text-rose-400 font-medium">
                        {Object.keys(errors).length} validation issue(s) found
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs text-emerald-400 font-medium">
                        Configuration is valid
                      </span>
                    </>
                  )}
                </div>

                <button
                  onClick={startSimulation}
                  disabled={hasErrors}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    hasErrors
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30'
                  }`}
                >
                  Test Flow <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Simulation Modal / Overlay */}
      {isSimulating && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  OAuth2 Redirection Simulator
                </h3>
              </div>
              <button 
                onClick={closeSimulation}
                className="text-slate-400 hover:text-slate-200 text-sm font-medium"
              >
                Close
              </button>
            </div>

            {/* Simulation Steps */}
            <div className="p-6 flex-1">
              
              {/* Step Progress Indicator */}
              <div className="flex items-center justify-between mb-8 border-b border-slate-800/60 pb-4 text-xs">
                <div className={`flex items-center gap-1.5 ${simStep === 'login' ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${simStep === 'login' ? 'border-indigo-500 bg-indigo-950' : 'border-slate-800'}`}>1</span>
                  User Login
                </div>
                <div className="h-px bg-slate-800 flex-1 mx-4"></div>
                <div className={`flex items-center gap-1.5 ${simStep === 'consent' ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${simStep === 'consent' ? 'border-indigo-500 bg-indigo-950' : 'border-slate-800'}`}>2</span>
                  Consent Screen
                </div>
                <div className="h-px bg-slate-800 flex-1 mx-4"></div>
                <div className={`flex items-center gap-1.5 ${simStep === 'redirecting' || simStep === 'success' ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${simStep === 'redirecting' || simStep === 'success' ? 'border-indigo-500 bg-indigo-950' : 'border-slate-800'}`}>3</span>
                  Callback Redirect
                </div>
              </div>

              {/* Step 1: Login Screen */}
              {simStep === 'login' && (
                <form onSubmit={handleSimLogin} className="space-y-4 max-w-md mx-auto">
                  <div className="text-center space-y-1 mb-6">
                    <div className="w-12 h-12 bg-indigo-950/50 border border-indigo-500/30 rounded-full flex items-center justify-center mx-auto">
                      <UserCheck className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h4 className="text-lg font-bold text-white">Sign in to authorize</h4>
                    <p className="text-xs text-slate-400">The authorization server requests user authentication.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs text-slate-400">Username / Email</label>
                    <input 
                      type="email" 
                      required
                      value={simUsername}
                      onChange={(e) => setSimUsername(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs text-slate-400">Password</label>
                    <input 
                      type="password" 
                      required
                      value={simPassword}
                      onChange={(e) => setSimPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg text-sm transition-all mt-6"
                  >
                    Continue to Consent
                  </button>
                </form>
              )}

              {/* Step 2: Consent Screen */}
              {simStep === 'consent' && (
                <div className="space-y-6 max-w-md mx-auto">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 bg-indigo-950/50 border border-indigo-500/30 rounded-full flex items-center justify-center mx-auto">
                      <ShieldAlert className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h4 className="text-lg font-bold text-white">Authorize Application</h4>
                    <p className="text-xs text-slate-400">
                      <span className="text-indigo-400 font-semibold">{params.client_id}</span> is requesting access to your account.
                    </p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Requested Permissions:</span>
                    <div className="space-y-2">
                      {simApprovedScopes.length > 0 ? (
                        simApprovedScopes.map((scope, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            <div>
                              <code className="text-indigo-300 font-semibold">{scope}</code>
                              <p className="text-[10px] text-slate-500">Allows access to {scope} resources.</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic">No scopes requested.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSimStep('login')}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-lg text-sm transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSimConsent}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg text-sm transition-all"
                    >
                      Authorize Access
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Redirecting Animation */}
              {simStep === 'redirecting' && (
                <div className="text-center py-12 space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-white">Redirecting back to application</h4>
                    <p className="text-xs text-slate-400">Sending authorization code and state parameters...</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 max-w-md mx-auto font-mono text-xs text-slate-400 truncate">
                    {params.redirect_uri}
                  </div>
                </div>
              )}

              {/* Step 4: Success Callback Screen */}
              {simStep === 'success' && (
                <div className="space-y-6 max-w-lg mx-auto">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 bg-emerald-950/50 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h4 className="text-lg font-bold text-white">Redirection Successful!</h4>
                    <p className="text-xs text-slate-400">Your application received the callback parameters successfully.</p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Callback URL Received:</span>
                      <div className="bg-slate-900 border border-slate-800 rounded p-2.5 font-mono text-xs text-emerald-400 break-all">
                        {params.redirect_uri}?{params.response_type === 'code' ? 'code' : 'access_token'}=mock_auth_token_xyz123&state={params.state || 'none'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-900 p-3 rounded border border-slate-800">
                        <span className="text-slate-500 block">Returned State</span>
                        <code className="text-indigo-300 font-mono">{params.state || 'N/A'}</code>
                        <span className="text-[10px] text-emerald-400 block mt-1">✓ Matches original state</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded border border-slate-800">
                        <span className="text-slate-500 block">Returned {params.response_type === 'code' ? 'Code' : 'Token'}</span>
                        <code className="text-indigo-300 font-mono">mock_auth_token_xyz123</code>
                        <span className="text-[10px] text-slate-500 block mt-1">Ready for exchange</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSimStep('login')}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-lg text-sm transition-all"
                    >
                      Restart Simulation
                    </button>
                    <button 
                      onClick={closeSimulation}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg text-sm transition-all"
                    >
                      Finish & Close
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full border-t border-slate-800/60 pt-6 mt-12 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400">OAuth2 URL Builder</span>
          <span>•</span>
          <span>Production-Ready Component</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://oauth.net/2/" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
            OAuth 2.0 Spec <ExternalLink className="w-3 h-3" />
          </a>
          <span>•</span>
          <a href="https://openid.net/connect/" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
            OIDC Core <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>

    </div>
  );
}