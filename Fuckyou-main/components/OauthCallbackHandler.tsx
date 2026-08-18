import React, { useState, useEffect } from 'react';

interface OauthCallbackHandlerProps {
  onExchangeToken?: (code: string, state: string) => void;
  onCancel?: () => void;
  defaultStoredState?: string;
}

interface CallbackParams {
  code: string | null;
  state: string | null;
  error: string | null;
  error_description: string | null;
  error_uri: string | null;
}

export default function OauthCallbackHandler({
  onExchangeToken,
  onCancel,
  defaultStoredState = 'secure_random_state_123456'
}: OauthCallbackHandlerProps) {
  const [params, setParams] = useState<CallbackParams>({
    code: null,
    state: null,
    error: null,
    error_description: null,
    error_uri: null,
  });

  const [storedState, setStoredState] = useState<string>('');
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'success' | 'mismatch' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [isExchanging, setIsExchanging] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(false);

  // Helper to add logs
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  // Initialize and parse parameters
  useEffect(() => {
    // Initialize stored state in sessionStorage if not present
    if (typeof window !== 'undefined') {
      const existing = sessionStorage.getItem('oauth_state');
      if (!existing) {
        sessionStorage.setItem('oauth_state', defaultStoredState);
        setStoredState(defaultStoredState);
      } else {
        setStoredState(existing);
      }

      // Parse URL parameters
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const error_description = searchParams.get('error_description');
      const error_uri = searchParams.get('error_uri');

      if (code || state || error) {
        setParams({ code, state, error, error_description, error_uri });
        setIsSimulationMode(false);
      } else {
        // No active query params, enable simulation mode automatically
        setIsSimulationMode(true);
        addLog('No active OAuth callback parameters detected in URL. Simulation mode enabled.');
      }
    }
  }, [defaultStoredState]);

  // Run validation when parameters or storedState changes
  useEffect(() => {
    if (!params.code && !params.state && !params.error) {
      return;
    }

    setValidationStatus('validating');
    addLog('Initiating OAuth callback validation...');
    addLog(`Received State: "${params.state || 'none'}"`);
    addLog(`Expected State: "${storedState}"`);

    // Simulate a brief validation delay for realistic UX
    const timer = setTimeout(() => {
      if (params.error) {
        setValidationStatus('error');
        addLog(`OAuth Error detected: ${params.error}`);
        if (params.error_description) {
          addLog(`Description: ${params.error_description}`);
        }
        return;
      }

      if (!params.state) {
        setValidationStatus('mismatch');
        addLog('Validation Failed: State parameter is missing entirely.');
        return;
      }

      if (params.state === storedState) {
        setValidationStatus('success');
        addLog('Validation Success: State matches. CSRF protection verified.');
        addLog(`Authorization Code acquired: ${params.code?.substring(0, 8)}...`);
      } else {
        setValidationStatus('mismatch');
        addLog('CRITICAL WARNING: State mismatch detected! Potential CSRF attack.');
        addLog(`Expected: "${storedState}" but received: "${params.state}"`);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [params, storedState]);

  // Simulation Triggers
  const simulateSuccess = () => {
    addLog('Simulating successful OAuth redirect...');
    sessionStorage.setItem('oauth_state', defaultStoredState);
    setStoredState(defaultStoredState);
    setParams({
      code: 'splat_auth_code_987654321_prod',
      state: defaultStoredState,
      error: null,
      error_description: null,
      error_uri: null
    });
  };

  const simulateCsrfAttack = () => {
    addLog('Simulating CSRF attack redirect (mismatched state)...');
    sessionStorage.setItem('oauth_state', defaultStoredState);
    setStoredState(defaultStoredState);
    setParams({
      code: 'malicious_auth_code_hijack_attempt',
      state: 'attacker_forged_state_xyz',
      error: null,
      error_description: null,
      error_uri: null
    });
  };

  const simulateError = () => {
    addLog('Simulating OAuth provider error redirect...');
    setParams({
      code: null,
      state: defaultStoredState,
      error: 'access_denied',
      error_description: 'The resource owner or authorization server denied the request.',
      error_uri: 'https://tools.ietf.org/html/rfc6749#section-4.1.2.1'
    });
  };

  const handleExchange = async () => {
    if (!params.code || !params.state) return;
    setIsExchanging(true);
    addLog('Initiating token exchange request...');
    
    // Simulate API call
    setTimeout(() => {
      setIsExchanging(false);
      addLog('Token exchange completed successfully! Access token issued.');
      if (onExchangeToken) {
        onExchangeToken(params.code!, params.state!);
      }
    }, 1500);
  };

  const clearSimulation = () => {
    setParams({ code: null, state: null, error: null, error_description: null, error_uri: null });
    setValidationStatus('idle');
    setLogs([]);
    addLog('Simulation cleared. Ready for input.');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
              OAuth 2.0 Sandbox
            </span>
            {isSimulationMode && (
              <span className="px-2.5 py-1 text-xs font-semibold bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 animate-pulse">
                Simulation Active
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-2 text-white">
            Redirect Callback Handler
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Simulates and validates incoming authorization code redirects (`redirect_uri`).
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={clearSimulation}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            Reset State
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Exit
            </button>
          )}
        </div>
      </div>

      {/* Simulation Controls Panel */}
      <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800/80">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Simulation Controls
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={simulateSuccess}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-xl font-medium text-sm transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Simulate Success
          </button>

          <button
            onClick={simulateCsrfAttack}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 rounded-xl font-medium text-sm transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Simulate CSRF Attack
          </button>

          <button
            onClick={simulateError}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 rounded-xl font-medium text-sm transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Simulate Provider Error
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Left/Middle: Parameters & Validation Status */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Validation Status Banner */}
          {validationStatus !== 'idle' && (
            <div className={`p-5 rounded-xl border flex items-start gap-4 transition-all duration-300 ${
              validationStatus === 'validating' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' :
              validationStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
              validationStatus === 'mismatch' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' :
              'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              <div className="mt-0.5">
                {validationStatus === 'validating' && (
                  <svg className="animate-spin h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {validationStatus === 'success' && (
                  <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )}
                {validationStatus === 'mismatch' && (
                  <svg className="h-5 w-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {validationStatus === 'error' && (
                  <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-white">
                  {validationStatus === 'validating' && 'Validating Security State...'}
                  {validationStatus === 'success' && 'State Validation Passed'}
                  {validationStatus === 'mismatch' && 'Security Alert: State Mismatch!'}
                  {validationStatus === 'error' && 'OAuth Provider Returned Error'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {validationStatus === 'validating' && 'Comparing incoming state parameter with local session storage to prevent CSRF attacks.'}
                  {validationStatus === 'success' && 'The state parameter matches the initiated session. It is safe to exchange this code for an access token.'}
                  {validationStatus === 'mismatch' && 'The state parameter received does not match the state generated by this client. This request may have been forged.'}
                  {validationStatus === 'error' && (params.error_description || 'The authorization server encountered an error or the user denied access.')}
                </p>
              </div>
            </div>
          )}

          {/* Parameters Table */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            <div className="px-4 py-3 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Incoming Query Parameters
              </span>
              <span className="text-xs text-slate-500">
                Parsed from redirect URI
              </span>
            </div>
            <div className="divide-y divide-slate-800/60">
              {/* Code */}
              <div className="p-4 grid grid-cols-3 gap-4 items-start">
                <div className="text-xs font-mono text-slate-400">code</div>
                <div className="col-span-2">
                  {params.code ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-slate-900 px-2 py-1 rounded border border-slate-800 text-indigo-300 break-all">
                        {params.code}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600 italic">null (missing)</span>
                  )}
                </div>
              </div>

              {/* State */}
              <div className="p-4 grid grid-cols-3 gap-4 items-start">
                <div className="text-xs font-mono text-slate-400">state</div>
                <div className="col-span-2">
                  {params.state ? (
                    <div className="space-y-1">
                      <span className="font-mono text-xs bg-slate-900 px-2 py-1 rounded border border-slate-800 text-slate-300 break-all inline-block">
                        {params.state}
                      </span>
                      {validationStatus === 'success' && (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                          ✓ Matches local session state
                        </span>
                      )}
                      {validationStatus === 'mismatch' && (
                        <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-1">
                          ✗ Mismatch! Expected: {storedState || 'none'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600 italic">null (missing)</span>
                  )}
                </div>
              </div>

              {/* Error */}
              {params.error && (
                <div className="p-4 grid grid-cols-3 gap-4 items-start bg-rose-950/10">
                  <div className="text-xs font-mono text-rose-400">error</div>
                  <div className="col-span-2">
                    <span className="font-mono text-xs bg-rose-950/30 px-2 py-1 rounded border border-rose-900/30 text-rose-300">
                      {params.error}
                    </span>
                  </div>
                </div>
              )}

              {/* Error Description */}
              {params.error_description && (
                <div className="p-4 grid grid-cols-3 gap-4 items-start bg-rose-950/10">
                  <div className="text-xs font-mono text-rose-400">error_description</div>
                  <div className="col-span-2 text-xs text-rose-300/90">
                    {params.error_description}
                  </div>
                </div>
              )}

              {/* Error URI */}
              {params.error_uri && (
                <div className="p-4 grid grid-cols-3 gap-4 items-start bg-rose-950/10">
                  <div className="text-xs font-mono text-rose-400">error_uri</div>
                  <div className="col-span-2">
                    <a
                      href={params.error_uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:underline break-all"
                    >
                      {params.error_uri}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Area */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end items-center p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 text-center sm:text-left mr-auto">
              {validationStatus === 'success' && 'Security checks passed. Ready to exchange code.'}
              {validationStatus === 'mismatch' && 'Exchange blocked due to security validation failure.'}
              {validationStatus === 'error' && 'Exchange blocked due to provider error.'}
              {validationStatus === 'idle' && 'Awaiting callback parameters...'}
            </div>

            <button
              onClick={handleExchange}
              disabled={validationStatus !== 'success' || isExchanging}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${
                validationStatus === 'success'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isExchanging ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Exchanging Code...
                </>
              ) : (
                <>
                  Exchange Code for Token
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Column: Security Context & Logs */}
        <div className="space-y-6">
          
          {/* Security Context Card */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Security Context
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 block">Stored Session State</span>
                <span className="font-mono text-xs text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800 block mt-1 truncate">
                  {storedState || 'None initialized'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-900">
                <span className="text-[10px] text-slate-500 block">CSRF Protection Mechanism</span>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  The client generates a cryptographically strong random state parameter before initiating the request, storing it locally. The auth server returns this exact state. Matching them guarantees the response originated from your initiated flow.
                </p>
              </div>
            </div>
          </div>

          {/* Real-time Logs Terminal */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col h-[320px]">
            <div className="px-4 py-2.5 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Execution Logs
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="p-4 font-mono text-[11px] text-slate-300 space-y-2 overflow-y-auto flex-1 bg-slate-950">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic">Awaiting events...</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed border-l-2 border-slate-800 pl-2">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}