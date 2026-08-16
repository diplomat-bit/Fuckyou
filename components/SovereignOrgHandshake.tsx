import React, { useState } from 'react';
import { Copy, RefreshCw, Key, ShieldCheck, Check, ExternalLink } from 'lucide-react';

const CLIENT_ID = "IdAxBDkXxeqce3MmSjmNQzT7mKJx2yG7";
const TENANT_URL = "https://modern-treasury-production.us.auth0.com";
const REDIRECT_URI = "https://app.moderntreasury.com/auth/auth0/callback";
const ORG_ID = "7e61b1b1-e6b1-4088-8cb3-a99544dbc1c0";

const SovereignOrgHandshake: React.FC = () => {
  const [verifier, setVerifier] = useState('');
  const [challenge, setChallenge] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [tokenResponse, setTokenResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedVerifier, setCopiedVerifier] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const generatePKCE = async () => {
    try {
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      const verifierStr = btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      setVerifier(verifierStr);

      const encoder = new TextEncoder();
      const data = encoder.encode(verifierStr);
      const digest = await window.crypto.subtle.digest('SHA-256', data);
      const challengeStr = btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      setChallenge(challengeStr);
      setErrorMsg(null);
    } catch (err) {
      console.error('PKCE generation error:', err);
      setErrorMsg('Failed to generate PKCE challenge');
    }
  };

  const authorizeUrl = `${TENANT_URL}/authorize?response_type=code&code_challenge=${challenge}&code_challenge_method=S256&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=openid%20profile%20email%20offline_access&organization=${ORG_ID}`;

  const copyToClipboard = (text: string, type: 'url' | 'verifier') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedVerifier(true);
      setTimeout(() => setCopiedVerifier(false), 2000);
    }
  };

  const exchangeCode = async () => {
    if (!authCode.trim()) {
      setErrorMsg('Please enter a valid authorization code');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`${TENANT_URL}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: CLIENT_ID,
          code_verifier: verifier,
          code: authCode.trim(),
          redirect_uri: REDIRECT_URI,
          organization: ORG_ID
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error_description || data.error || 'Token exchange failed');
      }
      setTokenResponse(data);
    } catch (error: any) {
      console.error('Token exchange failed', error);
      setErrorMsg(error.message || 'Token exchange request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900/90 backdrop-blur-md border border-indigo-500/30 rounded-3xl text-white space-y-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Sovereign Org Handshake
            </h2>
            <p className="text-xs text-slate-400">Modern Treasury OAuth 2.0 PKCE Bridge</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
            ORG: {ORG_ID.slice(0, 8)}...
          </span>
        </div>
      </div>

      {!challenge && (
        <div className="text-center py-8 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-4">
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Initiate the secure Proof Key for Code Exchange (PKCE) protocol to perform OAuth authorization handshake with Modern Treasury tenant.
          </p>
          <button
            onClick={generatePKCE}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 mx-auto"
          >
            <Key className="w-4 h-4" />
            Generate PKCE Challenge
          </button>
        </div>
      )}

      {challenge && (
        <div className="space-y-5">
          <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                1. Authorization Endpoint URL
              </span>
              <button
                onClick={() => copyToClipboard(authorizeUrl, 'url')}
                className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 transition"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedUrl ? 'Copied' : 'Copy Link'}
              </button>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-3">
              <a
                href={authorizeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 text-xs font-mono break-all line-clamp-2"
              >
                {authorizeUrl}
              </a>
              <a
                href={authorizeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-md transition shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                2. Code Verifier (Generated)
              </span>
              <button
                onClick={() => copyToClipboard(verifier, 'verifier')}
                className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 transition"
              >
                {copiedVerifier ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedVerifier ? 'Copied' : 'Copy Verifier'}
              </button>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 break-all">
              {verifier}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block">
              3. Enter Returned Authorization Code
            </label>
            <input
              type="text"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder="Paste code parameter from callback URL..."
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono transition"
            />
          </div>

          <button
            onClick={exchangeCode}
            disabled={loading || !authCode.trim()}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all text-sm"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            Execute Final Code Exchange
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-mono">
          <strong>Error:</strong> {errorMsg}
        </div>
      )}

      {tokenResponse && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
            Token Exchange Result
          </span>
          <pre className="p-4 bg-slate-950 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-mono overflow-x-auto">
            {JSON.stringify(tokenResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SovereignOrgHandshake;
