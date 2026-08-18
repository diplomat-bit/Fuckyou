import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, Copy, Check, Key, Lock, RefreshCw, ShieldCheck, Info } from 'lucide-react';

interface OauthClientCredentialsFormProps {
  onHeaderChange?: (headerValue: string) => void;
  initialClientId?: string;
  initialClientSecret?: string;
}

export default function OauthClientCredentialsForm({
  onHeaderChange,
  initialClientId = '',
  initialClientSecret = '',
}: OauthClientCredentialsFormProps) {
  const [clientId, setClientId] = useState(initialClientId);
  const [clientSecret, setClientSecret] = useState(initialClientSecret);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Safe Base64 encoding supporting UTF-8 characters
  const base64Encode = (str: string): string => {
    try {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
    } catch (e) {
      return '';
    }
  };

  // Compute the Basic Authorization Header
  const basicAuthHeader = useMemo(() => {
    if (!clientId.trim() && !clientSecret.trim()) return '';
    const credentials = `${clientId}:${clientSecret}`;
    const encoded = base64Encode(credentials);
    const headerValue = `Basic ${encoded}`;
    
    if (onHeaderChange) {
      onHeaderChange(headerValue);
    }
    return headerValue;
  }, [clientId, clientSecret, onHeaderChange]);

  // Copy to clipboard helper
  const handleCopy = async (text: string, fieldName: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Generate mock credentials for testing
  const handleGenerateMock = () => {
    const randomHex = (size: number) => 
      Array.from({ length: size }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    setClientId(`client_${randomHex(16)}`);
    setClientSecret(`secret_${randomHex(32)}`);
  };

  // Clear all fields
  const handleClear = () => {
    setClientId('');
    setClientSecret('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">OAuth 2.0 Client Credentials</h3>
            <p className="text-xs text-slate-400">Generate HTTP Basic Authorization headers for client authentication</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleGenerateMock}
            className="px-3 py-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 rounded-lg transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Demo Credentials
          </button>
          {(clientId || clientSecret) && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-300 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-all"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Form Body */}
      <div className="p-6 space-y-6">
        {/* Client ID Input */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm font-medium text-slate-300">
            <span className="flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-400" />
              Client ID
            </span>
            {clientId && (
              <button
                type="button"
                onClick={() => handleCopy(clientId, 'clientId')}
                className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
              >
                {copiedField === 'clientId' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </label>
          <div className="relative">
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="e.get. client_id_7f8a9b..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all font-mono text-sm"
            />
          </div>
        </div>

        {/* Client Secret Input */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm font-medium text-slate-300">
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" />
              Client Secret
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                {showSecret ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Show</span>
                  </>
                )}
              </button>
              {clientSecret && (
                <button
                  type="button"
                  onClick={() => handleCopy(clientSecret, 'clientSecret')}
                  className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
                >
                  {copiedField === 'clientSecret' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </label>
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="••••••••••••••••••••••••••••••••"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all font-mono text-sm tracking-wider"
            />
          </div>
        </div>

        {/* Generated Authorization Header Output */}
        <div className="pt-4 border-t border-slate-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              Authorization Header
              <span className="px-2 py-0.5 text-[10px] font-medium bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">
                HTTP Basic
              </span>
            </span>
            {basicAuthHeader && (
              <button
                type="button"
                onClick={() => handleCopy(basicAuthHeader, 'authHeader')}
                className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
              >
                {copiedField === 'authHeader' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied Header!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Header</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="relative group">
            <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <div className="relative w-full min-h-[80px] p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 break-all flex flex-col justify-between gap-2">
              {basicAuthHeader ? (
                <>
                  <span className="text-indigo-400 select-all">{basicAuthHeader}</span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Format: <code className="text-slate-400">Basic Base64(client_id:client_secret)</code>
                  </span>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-2 text-slate-500 text-center">
                  <Info className="w-5 h-5 mb-1 text-slate-600" />
                  <span>Enter Client ID and Client Secret to generate the header</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-4 bg-slate-950/30 border-t border-slate-800/40 flex items-center gap-2 text-xs text-slate-400">
        <Info className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>
          This header is typically sent in the <code className="text-slate-300 bg-slate-800 px-1 py-0.5 rounded">Authorization</code> request header to the token endpoint (<code className="text-slate-300 bg-slate-800 px-1 py-0.5 rounded">/oauth/token</code>).
        </span>
      </div>
    </div>
  );
}