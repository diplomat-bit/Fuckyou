import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  RefreshCw, 
  Key, 
  FileJson, 
  Globe, 
  Shield, 
  Info, 
  Terminal, 
  Layers, 
  Eye, 
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lock
} from 'lucide-react';

type SigningAlgorithm = 'RS256' | 'HS256';

// Helper to generate UUID v4
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Helper to encode base64url
const base64url = (source: string): string => {
  try {
    const encoded = btoa(encodeURIComponent(source).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
    return encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  } catch (e) {
    return 'invalid-data';
  }
};

// Simulated JWS Generator (RS256)
const generateMockJWS = (payloadStr: string, privateKey: string): string => {
  const header = JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'key-id-123' });
  let payload = payloadStr;
  try {
    payload = JSON.stringify(JSON.parse(payloadStr));
  } catch (e) {
    // Fallback if invalid JSON
  }
  
  const encodedHeader = base64url(header);
  const encodedPayload = base64url(payload);
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const mockSignature = base64url(`rs256-signature-of(${signatureInput})-using(${privateKey || 'default-key'})`);
  
  return `${encodedHeader}.${encodedPayload}.${mockSignature}`;
};

// Simulated HMAC-SHA256 Generator (HS256)
const generateMockHMAC = (payloadStr: string, secret: string): string => {
  let payload = payloadStr;
  try {
    payload = JSON.stringify(JSON.parse(payloadStr));
  } catch (e) {
    // Fallback if invalid JSON
  }
  
  const signatureInput = `${payload}.${secret || 'default-secret'}`;
  const mockHmac = base64url(`hmac-sha256-of(${signatureInput})`);
  return `sha256=${mockHmac}`;
};

interface Preset {
  name: string;
  description: string;
  clientId: string;
  clientDetails: string;
  acceptLanguage: string;
}

const PRESETS: Record<string, Preset> = {
  mobileApp: {
    name: 'Mobile iOS App',
    description: 'Standard configuration for native iOS applications.',
    clientId: 'client_mobile_ios_prod_992',
    clientDetails: JSON.stringify({
      platform: 'ios',
      os_version: '17.2',
      app_version: '4.12.0',
      device_model: 'iPhone 15 Pro',
      network_type: '5g'
    }, null, 2),
    acceptLanguage: 'en-US'
  },
  webPortal: {
    name: 'Web Dashboard',
    description: 'Configuration optimized for modern desktop web portals.',
    clientId: 'client_web_portal_corp_01',
    clientDetails: JSON.stringify({
      platform: 'web',
      browser: 'Chrome',
      browser_version: '122.0.0',
      os: 'macOS',
      screen_resolution: '2560x1440'
    }, null, 2),
    acceptLanguage: 'en-GB,en;q=0.9,fr-FR;q=0.8'
  },
  partnerApi: {
    name: 'B2B Partner API',
    description: 'High-security server-to-server integration preset.',
    clientId: 'client_partner_backend_secure',
    clientDetails: JSON.stringify({
      platform: 'server',
      environment: 'production',
      sdk_version: 'node-v18.4.2',
      ip_address: '192.168.1.100'
    }, null, 2),
    acceptLanguage: 'en-US'
  }
};

export default function OauthHeaderBuilder() {
  // Main State
  const [token, setToken] = useState<string>('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  const [uuid, setUuid] = useState<string>('');
  const [clientId, setClientId] = useState<string>('client_mobile_ios_prod_992');
  const [clientDetails, setClientDetails] = useState<string>(PRESETS.mobileApp.clientDetails);
  const [acceptLanguage, setAcceptLanguage] = useState<string>('en-US');
  
  // Signing Configuration
  const [signingAlg, setSigningAlg] = useState<SigningAlgorithm>('RS256');
  const [privateKey, setPrivateKey] = useState<string>('-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3T... (Simulated RSA Key)\n-----END PRIVATE KEY-----');
  const [hmacSecret, setHmacSecret] = useState<string>('whsec_9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d');

  // UI States
  const [isJsonValid, setIsJsonValid] = useState<boolean>(true);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'json' | 'curl' | 'fetch' | 'axios'>('json');

  // Initialize UUID on mount
  useEffect(() => {
    setUuid(generateUUID());
  }, []);

  // Validate JSON on change
  useEffect(() => {
    try {
      JSON.parse(clientDetails);
      setIsJsonValid(true);
    } catch (e) {
      setIsJsonValid(false);
    }
  }, [clientDetails]);

  // Dynamic Signature calculation based on algorithm
  const isJws = signingAlg === 'RS256';
  const signatureHeaderKey = isJws ? 'x-jws-signature' : 'x-hmac-signature';
  const signatureValue = isJws
    ? generateMockJWS(isJsonValid ? clientDetails : '{}', privateKey)
    : generateMockHMAC(isJsonValid ? clientDetails : '{}', hmacSecret);

  // Dynamic headers object
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'uuid': uuid,
    'client_id': clientId,
    'clientDetails': isJsonValid ? JSON.stringify(JSON.parse(clientDetails)) : '{}',
    [signatureHeaderKey]: signatureValue,
    'Accept-Language': acceptLanguage,
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const applyPreset = (preset: Preset) => {
    setClientId(preset.clientId);
    setClientDetails(preset.clientDetails);
    setAcceptLanguage(preset.acceptLanguage);
  };

  // Code snippet generators
  const getCurlSnippet = () => {
    const headerLines = Object.entries(headers)
      .map(([key, val]) => `  -H "${key}: ${val}"`)
      .join(' \\\n');
    return `curl -X POST "https://api.securegateway.com/v2/oauth/token" \\\n${headerLines} \\\n  -d '{"grant_type":"client_credentials"}'`;
  };

  const getFetchSnippet = () => {
    return `fetch('https://api.securegateway.com/v2/oauth/token', {
  method: 'POST',
  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')},
  body: JSON.stringify({ grant_type: 'client_credentials' })
});`;
  };

  const getAxiosSnippet = () => {
    return `import axios from 'axios';

const headers = ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n')};

axios.post('https://api.securegateway.com/v2/oauth/token', 
  { grant_type: 'client_credentials' }, 
  { headers }
);`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm tracking-wider uppercase">
              <Sparkles className="w-4 h-4" />
              Developer Security Tools
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-1">
              OAuth Header Builder &amp; Signer
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl text-sm md:text-base">
              Construct, sign, and preview complex API headers. Support for both asymmetric RS256 (JWS) and symmetric HMAC-SHA256 signatures.
            </p>
          </div>
          
          {/* Environment Presets */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 w-full md:w-auto min-w-[280px]">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Load Environment Preset
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.entries(PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(preset)}
                  className="px-2 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 transition-all duration-200 text-center truncate"
                  title={preset.description}
                >
                  {preset.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form & Key Settings */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
              <span className="bg-indigo-500/10 text-indigo-400 p-1.5 rounded-lg">
                <Key className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white">Header Parameters &amp; Signing</h2>
            </div>

            {/* 1. Signing Algorithm Selector */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-3 hover:border-slate-700/50 transition-all">
              <label className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                <span>Signing Algorithm</span>
                <span className="text-xs font-normal text-indigo-400 font-mono">
                  {isJws ? 'Header: x-jws-signature' : 'Header: x-hmac-signature'}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSigningAlg('RS256')}
                  className={`py-2 text-xs font-bold rounded-md transition-all ${
                    isJws 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  RS256 (JWS Asymmetric)
                </button>
                <button
                  type="button"
                  onClick={() => setSigningAlg('HS256')}
                  className={`py-2 text-xs font-bold rounded-md transition-all ${
                    !isJws 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  HMAC-SHA256 (Symmetric)
                </button>
              </div>
            </div>

            {/* 2. Authorization Token */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-3 hover:border-slate-700/50 transition-all">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  Authorization <span className="text-xs text-slate-500 font-normal">(Bearer Token)</span>
                </label>
                <span className="text-xs text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-900/50">Required</span>
              </div>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste JWT or OAuth access token..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
              />
            </div>

            {/* 3. UUID Generator */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-3 hover:border-slate-700/50 transition-all">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  uuid <span className="text-xs text-slate-500 font-normal">(Correlation ID)</span>
                </label>
                <button
                  onClick={() => setUuid(generateUUID())}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Generate New
                </button>
              </div>
              <input
                type="text"
                value={uuid}
                onChange={(e) => setUuid(e.target.value)}
                placeholder="e.g. f81d4fae-7dec-11d0-a765-00a0c91e6bf6"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
              />
            </div>

            {/* 4. Client ID & Accept Language */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-3 hover:border-slate-700/50 transition-all">
                <label className="text-sm font-semibold text-slate-200 block">
                  client_id
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="e.g. client_mobile_ios"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
                />
              </div>

              <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-3 hover:border-slate-700/50 transition-all">
                <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-slate-400" /> Accept-Language
                </label>
                <select
                  value={acceptLanguage}
                  onChange={(e) => setAcceptLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                >
                  <option value="en-US">en-US (English - United States)</option>
                  <option value="en-GB,en;q=0.9,fr-FR;q=0.8">en-GB, fr-FR (Multi-locale)</option>
                  <option value="es-ES">es-ES (Spanish - Spain)</option>
                  <option value="de-DE">de-DE (German - Germany)</option>
                  <option value="ja-JP">ja-JP (Japanese - Japan)</option>
                </select>
              </div>
            </div>

            {/* 5. Client Details JSON Builder */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-3 hover:border-slate-700/50 transition-all">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-indigo-400" />
                  clientDetails <span className="text-xs text-slate-500 font-normal">(JSON Payload)</span>
                </label>
                <div className="flex items-center gap-2">
                  {isJsonValid ? (
                    <span className="text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-900/50 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Valid JSON
                    </span>
                  ) : (
                    <span className="text-xs text-rose-400 bg-rose-950/50 border border-rose-900/50 px-2 py-0.5 rounded flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Invalid JSON
                    </span>
                  )}
                </div>
              </div>
              <textarea
                value={clientDetails}
                onChange={(e) => setClientDetails(e.target.value)}
                rows={5}
                className={`w-full bg-slate-950 border rounded-lg p-3 text-sm font-mono text-slate-300 focus:outline-none focus:ring-2 transition-all ${
                  isJsonValid 
                    ? 'border-slate-800 focus:ring-indigo-500/50 focus:border-indigo-500' 
                    : 'border-rose-500/50 focus:ring-rose-500/30 focus:border-rose-500'
                }`}
              />
            </div>

            {/* 6. Dynamic Key Configuration */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-3 hover:border-slate-700/50 transition-all">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  {isJws ? <Shield className="w-4 h-4 text-indigo-400" /> : <Lock className="w-4 h-4 text-indigo-400" />}
                  {isJws ? 'RSA Private Key (PEM)' : 'HMAC Secret Key'}
                </label>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showKey ? 'Hide Secret' : 'Show Secret'}
                </button>
              </div>

              {isJws ? (
                <textarea
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  rows={showKey ? 4 : 1}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                  readOnly={!showKey}
                />
              ) : (
                <input
                  type={showKey ? 'text' : 'password'}
                  value={hmacSecret}
                  onChange={(e) => setHmacSecret(e.target.value)}
                  placeholder="Enter webhook / HMAC secret..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs font-mono text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              )}
              <p className="text-xs text-slate-500">
                {isJws 
                  ? 'Used to sign clientDetails into an RS256 JWS token.' 
                  : 'Used to compute an HMAC-SHA256 hash over the clientDetails string.'}
              </p>
            </div>

          </div>

          {/* Right Column: Live Output & Snippets */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-900">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg">
                  <Terminal className="w-5 h-5" />
                </span>
                <h2 className="text-lg font-bold text-white">Live Headers Output</h2>
              </div>
              <button
                onClick={() => handleCopy(JSON.stringify(headers, null, 2), 'all-headers')}
                className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
              >
                {copiedField === 'all-headers' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy All
                  </>
                )}
              </button>
            </div>

            {/* Header Field Cards */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">HTTP Header Fields</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              
              <div className="p-4 space-y-4 divide-y divide-slate-800/60">
                {Object.entries(headers).map(([key, value]) => (
                  <div key={key} className="pt-3 first:pt-0 group">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-400 select-all">{key}</span>
                      <button
                        onClick={() => handleCopy(value, key)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 transition-opacity p-1 rounded"
                        title="Copy value"
                      >
                        {copiedField === key ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <div className="text-xs font-mono text-slate-300 mt-1 break-all bg-slate-950/50 p-2 rounded border border-slate-900/80 select-all max-h-24 overflow-y-auto">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Snippet Tabs */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="bg-slate-900 border-b border-slate-800 flex justify-between items-center px-2">
                <div className="flex">
                  {(['json', 'curl', 'fetch', 'axios'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                        activeTab === tab
                          ? 'border-indigo-500 text-indigo-400 bg-indigo-950/10'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const code = 
                      activeTab === 'json' ? JSON.stringify(headers, null, 2) :
                      activeTab === 'curl' ? getCurlSnippet() :
                      activeTab === 'fetch' ? getFetchSnippet() : getAxiosSnippet();
                    handleCopy(code, 'snippet');
                  }}
                  className="text-slate-400 hover:text-slate-200 p-2"
                  title="Copy Code Snippet"
                >
                  {copiedField === 'snippet' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="p-4 bg-slate-950">
                <pre className="text-xs font-mono text-slate-300 overflow-x-auto max-h-96 whitespace-pre-wrap leading-relaxed">
                  {activeTab === 'json' && JSON.stringify(headers, null, 2)}
                  {activeTab === 'curl' && getCurlSnippet()}
                  {activeTab === 'fetch' && getFetchSnippet()}
                  {activeTab === 'axios' && getAxiosSnippet()}
                </pre>
              </div>
            </div>

            {/* Verification Security Note */}
            <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-indigo-300">
                  {isJws ? 'JWS RS256 Verification' : 'HMAC-SHA256 Verification'}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isJws 
                    ? 'Downstream systems verify x-jws-signature using your public RSA certificate to ensure payload authenticity.' 
                    : 'Downstream systems recalculate the HMAC-SHA256 digest using a shared secret to verify the clientDetails payload.'}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
