import React, { useState } from 'react';
import { Shield, Key, CheckCircle, RefreshCw, Lock, Terminal } from 'lucide-react';

export const DcrAuthComponent: React.FC = () => {
  const [clientId, setClientId] = useState('dcr-client-sov-9981');
  const [tokenStatus, setTokenStatus] = useState<'ISSUED' | 'REVOKED' | 'EXPIRED'>('ISSUED');
  const [tokenValue, setTokenValue] = useState('eyJhbGciOiJSUzI1NiIsImtpZCI6InNvdXYxIn0.eyJzdWIiOiJzb3YtYWRtaW4iLCJzY29wZSI6ImNpdGk6YXBpOmZ1bGwiLCJpYXQiOjE3MjM4NTE2MDB9...');
  const [regenerating, setRegenerating] = useState(false);

  const handleRegenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      setRegenerating(false);
      setTokenValue('eyJhbGciOiJSUzI1NiIsImtpZCI6InNvdXYyIn0.eyJzdWIiOiJzb3YtYWRtaW4iLCJzY29wZSI6ImNpdGk6YXBpOmZ1bGwiLCJpYXQiOjE3MjM4NTI2MDB9...');
      setTokenStatus('ISSUED');
    }, 700);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-900 text-slate-100 min-h-screen rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-purple-400">
            <Shield className="w-7 h-7" /> DCR Authentication & Dynamic Client Registration
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage OAuth 2.0 dynamic client registration, cryptographic tokens, andFAPI security profiles.</p>
        </div>
        <button 
          onClick={handleRegenerate}
          disabled={regenerating}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-purple-900/40"
        >
          <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} /> Rotate DCR Token
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-400" /> Client Registration Metadata
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 uppercase font-semibold">Client ID</label>
              <input 
                type="text" 
                value={clientId} 
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-slate-200 mt-1 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase font-semibold">Grant Types</label>
              <div className="flex gap-2 mt-1">
                <span className="px-2.5 py-1 bg-purple-950 text-purple-300 border border-purple-800 rounded text-xs font-mono">authorization_code</span>
                <span className="px-2.5 py-1 bg-purple-950 text-purple-300 border border-purple-800 rounded text-xs font-mono">refresh_token</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase font-semibold">Token Status</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1 px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" /> {tokenStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" /> Active Signed JWT Token
          </h2>
          <div className="space-y-3">
            <textarea 
              rows={7}
              readOnly
              value={tokenValue}
              className="w-full bg-slate-950 font-mono text-xs text-purple-300 p-3 rounded-lg border border-slate-700/80 focus:outline-none"
            />
            <p className="text-xs text-slate-400">Token is cryptographically signed using RS256 with Hardware Security Module (HSM) backing.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
