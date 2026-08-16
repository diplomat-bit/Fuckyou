import React, { useState, useEffect, useMemo } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Key, FileJson, CheckCircle2, XCircle, Search, AlertTriangle, Info } from 'lucide-react';

interface Claim {
  key: string;
  value: any;
  type: 'standard' | 'custom' | 'scope';
}

interface VerificationResult {
  passed: boolean;
  logs: string[];
  matchedScope?: string;
}

const DEFAULT_MOCK_TOKEN = JSON.stringify({
  iss: "https://auth.sovereign-ledger.gov",
  sub: "usr_987654321",
  aud: "api.treasury.gov",
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000),
  roles: ["auditor", "compliance_officer"],
  scope: "read:users write:reports finance:* system:read",
  client_id: "app_55432"
}, null, 2);

const STANDARD_CLAIMS = new Set(['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti', 'client_id', 'scope', 'scp']);

export default function ClaimsInspectorView() {
  const [tokenInput, setTokenInput] = useState<string>(DEFAULT_MOCK_TOKEN);
  const [parsedPayload, setParsedPayload] = useState<Record<string, any> | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  
  const [requiredScope, setRequiredScope] = useState<string>('finance:transfer:execute');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  // Parse token input (handles both raw JSON and JWT formats)
  useEffect(() => {
    try {
      setParseError(null);
      let payloadToParse = tokenInput.trim();

      // Check if it looks like a JWT (3 parts separated by dots)
      if (payloadToParse.split('.').length === 3) {
        const base64Url = payloadToParse.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        payloadToParse = jsonPayload;
      }

      const parsed = JSON.parse(payloadToParse);
      setParsedPayload(parsed);
    } catch (err) {
      setParsedPayload(null);
      setParseError("Invalid JSON or JWT format. Please check your input.");
    }
  }, [tokenInput]);

  const claimsList: Claim[] = useMemo(() => {
    if (!parsedPayload) return [];
    return Object.entries(parsedPayload).map(([key, value]) => {
      let type: Claim['type'] = 'custom';
      if (key === 'scope' || key === 'scp') type = 'scope';
      else if (STANDARD_CLAIMS.has(key)) type = 'standard';
      
      return { key, value, type };
    });
  }, [parsedPayload]);

  const verifyAccess = () => {
    if (!parsedPayload) return;

    const logs: string[] = [];
    logs.push(`Starting scope verification for required scope: "${requiredScope}"`);

    const scopeClaim = parsedPayload.scope || parsedPayload.scp;
    if (!scopeClaim) {
      logs.push("❌ No 'scope' or 'scp' claim found in token.");
      setVerificationResult({ passed: false, logs });
      return;
    }

    const grantedScopes: string[] = typeof scopeClaim === 'string' 
      ? scopeClaim.split(' ') 
      : Array.isArray(scopeClaim) ? scopeClaim : [];

    logs.push(`Found granted scopes: [${grantedScopes.join(', ')}]`);

    let matchedScope: string | undefined;
    let passed = false;

    for (const granted of grantedScopes) {
      logs.push(`Evaluating granted scope: "${granted}" against required: "${requiredScope}"`);
      
      if (granted === requiredScope) {
        logs.push(`✅ Exact match found: "${granted}"`);
        passed = true;
        matchedScope = granted;
        break;
      }

      if (granted === '*') {
        logs.push(`✅ Global wildcard match found: "*"`);
        passed = true;
        matchedScope = granted;
        break;
      }

      const gParts = granted.split(':');
      const rParts = requiredScope.split(':');
      
      let isWildcardMatch = true;
      for (let i = 0; i < Math.max(gParts.length, rParts.length); i++) {
        if (gParts[i] === '*') {
          logs.push(`✅ Wildcard match at level ${i} ("${gParts.slice(0, i+1).join(':')}") covers required scope.`);
          passed = true;
          matchedScope = granted;
          break;
        }
        if (gParts[i] !== rParts[i]) {
          logs.push(`  - Mismatch at segment ${i}: expected "${rParts[i] || '(none)'}", got "${gParts[i] || '(none)'}"`);
          isWildcardMatch = false;
          break;
        }
      }

      if (passed) break;
      if (isWildcardMatch && gParts.length === rParts.length) {
         passed = true;
         matchedScope = granted;
         break;
      }
    }

    if (!passed) {
      logs.push(`❌ Verification failed. No granted scopes satisfy "${requiredScope}".`);
    }

    setVerificationResult({ passed, logs, matchedScope });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center space-x-4 border-b border-slate-700 pb-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Claims Inspector & Scope Verifier</h1>
            <p className="text-slate-400 text-sm mt-1">
              Analyze JWT payloads, inspect claims, and test wildcard scope resolution against required endpoints.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Input & Claims */}
          <div className="space-y-6">
            {/* Token Input Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
              <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-slate-400" />
                  <h2 className="text-sm font-semibold text-slate-200">Token Payload (JSON or JWT)</h2>
                </div>
              </div>
              <div className="p-4">
                <textarea
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full h-48 bg-slate-950 text-emerald-400 font-mono text-sm p-4 rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-y"
                  spellCheck={false}
                />
                {parseError && (
                  <div className="mt-3 flex items-center space-x-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{parseError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Parsed Claims Breakdown */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
              <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50 flex items-center space-x-2">
                <FileJson className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-200">Decoded Claims Breakdown</h2>
              </div>
              <div className="p-0">
                {parsedPayload ? (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900/50 text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Claim</th>
                        <th className="px-4 py-3 font-medium">Value</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {claimsList.map((claim, idx) => (
                        <tr key={idx} className="hover:bg-slate-700/20 transition-colors">
                          <td className="px-4 py-3 font-mono text-blue-300">{claim.key}</td>
                          <td className="px-4 py-3 font-mono text-slate-300 break-all">
                            {typeof claim.value === 'object' 
                              ? JSON.stringify(claim.value) 
                              : String(claim.value)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              claim.type === 'scope' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                              claim.type === 'standard' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                              'bg-slate-600/30 text-slate-300 border border-slate-600/50'
                            }`}>
                              {claim.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                    <Info className="w-8 h-8 mb-2 opacity-50" />
                    <p>Provide a valid JSON or JWT to view claims.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Scope Verification */}
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
              <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50 flex items-center space-x-2">
                <Search className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-200">Scope Verification Engine</h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Required Endpoint Scope
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={requiredScope}
                      onChange={(e) => setRequiredScope(e.target.value)}
                      placeholder="e.g., finance:transfer:execute"
                      className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono text-sm"
                    />
                    <button
                      onClick={verifyAccess}
                      disabled={!parsedPayload}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Test if the token's granted scopes (including wildcards like <code className="text-slate-400">*</code>) satisfy this requirement.
                  </p>
                </div>

                {/* Verification Results */}
                {verificationResult && (
                  <div className="mt-6 border-t border-slate-700 pt-6">
                    <div className={`p-4 rounded-lg border flex items-start space-x-4 ${
                      verificationResult.passed 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : 'bg-red-500/10 border-red-500/30'
                    }`}>
                      {verificationResult.passed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      
                      <div>
                        <h3 className={`text-lg font-semibold ${
                          verificationResult.passed ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {verificationResult.passed ? 'Access Granted' : 'Access Denied'}
                        </h3>
                        {verificationResult.passed && verificationResult.matchedScope && (
                          <p className="text-sm text-emerald-300/80 mt-1">
                            Matched via granted scope: <code className="bg-emerald-900/50 px-1.5 py-0.5 rounded text-emerald-200">{verificationResult.matchedScope}</code>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Execution Logs */}
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Evaluation Trace</h4>
                      <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 font-mono text-xs space-y-2 h-64 overflow-y-auto">
                        {verificationResult.logs.map((log, idx) => (
                          <div key={idx} className={`${
                            log.includes('✅') ? 'text-emerald-400' :
                            log.includes('❌') ? 'text-red-400' :
                            'text-slate-400'
                          }`}>
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {!verificationResult && (
                  <div className="mt-6 border-t border-slate-700 pt-6 flex flex-col items-center justify-center text-slate-500 h-48">
                    <ShieldAlert className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">Enter a required scope and click Verify to run the evaluation engine.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}