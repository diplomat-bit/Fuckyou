import React, { useState, useEffect } from 'react';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Loader2, 
  Copy, 
  Check, 
  Terminal, 
  Settings, 
  Cpu, 
  RefreshCw, 
  FileJson, 
  Lock, 
  Ban, 
  Info,
  Eye,
  Code,
  Server,
  UserCheck,
  UserX
} from 'lucide-react';

// Define types for our simulator state
type StatusCode = '200' | '204' | '400' | '401' | '403' | '422' | '500';

interface MockResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
}

interface MockRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: any;
}

export default function EligibilitySimulator() {
  // State
  const [selectedStatus, setSelectedStatus] = useState<StatusCode>('200');
  const [latency, setLatency] = useState<number>(600);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');
  const [consoleTab, setConsoleTab] = useState<'response' | 'request'>('response');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Custom request payload state
  const [userId, setUserId] = useState<string>('usr_9a8b7c6d5e');
  const [tierRequested, setTierRequested] = useState<string>('enterprise');
  const [region, setRegion] = useState<string>('us-east-1');

  // Generated Request/Response states
  const [currentRequest, setCurrentRequest] = useState<MockRequest | null>(null);
  const [currentResponse, setCurrentResponse] = useState<MockResponse | null>(null);

  // Trigger copy feedback
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Generate Request/Response templates based on inputs
  const generateMockData = (status: StatusCode): { req: MockRequest; res: MockResponse } => {
    const reqHeaders = {
      'Content-Type': 'application/json',
      'Authorization': status === '401' ? 'Bearer invalid_token_expired_or_missing' : 'Bearer sk_live_51Nx...8a9f',
      'X-Simulator-Latency': `${latency}ms`,
      'User-Agent': 'Mozilla/5.0 (EligibilitySimulator/1.0)'
    };

    const reqBody = {
      userId,
      tierRequested,
      region,
      timestamp: new Date().toISOString(),
      simulationMode: true
    };

    const req: MockRequest = {
      method: 'POST',
      url: 'https://api.platform.com/v1/eligibility/check',
      headers: reqHeaders,
      body: reqBody
    };

    const resHeaders = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
      'X-Request-ID': `req_${Math.random().toString(36).substring(2, 15)}`,
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': status === '422' ? '95' : '99',
      'X-RateLimit-Reset': '1350'
    };

    let resBody: any = null;
    let statusText = '';

    switch (status) {
      case '200':
        statusText = 'OK';
        resBody = {
          eligible: true,
          userId,
          tier: tierRequested,
          score: 94,
          checks: {
            identityVerified: true,
            creditCheckPassed: true,
            amlSanctionCleared: true,
            geographicRestrictionPassed: true
          },
          reasons: [
            "User profile meets all compliance standards for the Enterprise tier.",
            "Geographic region is fully supported."
          ],
          expiresAt: new Date(Date.now() + 86400000 * 30).toISOString() // 30 days from now
        };
        break;
      case '204':
        statusText = 'No Content';
        resBody = null; // No content
        break;
      case '400':
        statusText = 'Bad Request';
        resBody = {
          error: {
            code: 'bad_request',
            message: "The request could not be understood or was missing required parameters.",
            details: "Parameter 'userId' must be a valid prefixed string starting with 'usr_'.",
            help: "https://docs.platform.com/errors/bad_request"
          }
        };
        break;
      case '401':
        statusText = 'Unauthorized';
        resBody = {
          error: {
            code: 'authentication_failed',
            message: "No valid API key provided or token has expired.",
            help: "https://docs.platform.com/errors/authentication"
          }
        };
        break;
      case '403':
        statusText = 'Forbidden';
        resBody = {
          error: {
            code: 'permission_denied',
            message: "You do not have permission to perform this action on the requested resource.",
            details: `Your current subscription tier does not allow requesting the '${tierRequested}' tier.`,
            help: "https://docs.platform.com/errors/forbidden"
          }
        };
        break;
      case '422':
        statusText = 'Unprocessable Entity';
        resBody = {
          error: {
            code: 'validation_failed',
            message: "Validation failed for the provided parameters.",
            errors: [
              {
                field: "region",
                rule: "supported_region",
                message: `The region '${region}' is currently under maintenance or not supported for automated eligibility checks.`
              }
            ],
            help: "https://docs.platform.com/errors/validation"
          }
        };
        break;
      case '500':
        statusText = 'Internal Server Error';
        resBody = {
          error: {
            code: 'internal_server_error',
            message: "An unexpected error occurred on our servers. Please try again later.",
            incidentId: `inc_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
          }
        };
        break;
    }

    return { req, res: { status: parseInt(status), statusText, headers: resHeaders, body: resBody } };
  };

  // Run simulation
  const runSimulation = () => {
    setIsLoading(true);
    
    // Generate fresh data based on current inputs
    const { req, res } = generateMockData(selectedStatus);
    setCurrentRequest(req);

    setTimeout(() => {
      setCurrentResponse(res);
      setIsLoading(false);
    }, latency);
  };

  // Run initial simulation on mount
  useEffect(() => {
    runSimulation();
  }, []);

  // Helper to get status badge color
  const getStatusBadgeClass = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (status >= 400 && status < 500) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Developer Sandbox
            </span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-400">API Simulator v1.2.0</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Eligibility API Simulator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Simulate, test, and debug various API response states to build resilient client-side integrations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={runSimulation}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 disabled:text-slate-400 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            Send Request
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Control Panel (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Simulation Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Settings className="w-4 h-4 text-indigo-400" />
              <h2 className="font-semibold text-sm text-slate-200">Simulation Controls</h2>
            </div>

            {/* Status Code Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-400">Target HTTP Status</label>
              <div className="grid grid-cols-4 gap-2">
                {(['200', '204', '400', '401', '403', '422', '500'] as StatusCode[]).map((status) => {
                  const isSelected = selectedStatus === status;
                  let colorClass = 'hover:bg-slate-800 border-slate-800 text-slate-300';
                  if (isSelected) {
                    if (status === '200' || status === '204') colorClass = 'bg-emerald-500/10 border-emerald-500 text-emerald-400';
                    else if (status === '500') colorClass = 'bg-rose-500/10 border-rose-500 text-rose-400';
                    else colorClass = 'bg-amber-500/10 border-amber-500 text-amber-400';
                  }
                  return (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`py-2 px-1 text-xs font-mono font-bold rounded-lg border transition-all ${colorClass} ${status === '204' ? 'col-span-1' : ''}`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {selectedStatus === '200' && 'Success: Returns full eligibility payload.'}
                {selectedStatus === '204' && 'No Content: Successful request, empty response.'}
                {selectedStatus === '400' && 'Bad Request: Missing or malformed parameters.'}
                {selectedStatus === '401' && 'Unauthorized: Missing or invalid API key.'}
                {selectedStatus === '403' && 'Forbidden: Insufficient permissions for tier.'}
                {selectedStatus === '422' && 'Unprocessable: Validation failed for region.'}
                {selectedStatus === '500' && 'Internal Error: Simulated server crash.'}
              </p>
            </div>

            {/* Latency Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-400">Network Latency</label>
                <span className="text-xs font-mono text-indigo-400 font-semibold">{latency}ms</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="3000" 
                step="50"
                value={latency} 
                onChange={(e) => setLatency(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>50ms (Local)</span>
                <span>1.5s (3G)</span>
                <span>3s (Slow)</span>
              </div>
            </div>
          </div>

          {/* Request Payload Editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <h2 className="font-semibold text-sm text-slate-200">Request Parameters</h2>
            </div>

            {/* User ID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">User ID</label>
              <input 
                type="text" 
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="usr_..."
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Tier Requested */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Requested Tier</label>
              <select 
                value={tierRequested}
                onChange={(e) => setTierRequested(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="standard">Standard Tier</option>
                <option value="premium">Premium Tier</option>
                <option value="enterprise">Enterprise Tier</option>
                <option value="ultra-beta">Ultra Beta (Restricted)</option>
              </select>
            </div>

            {/* Region */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Region</label>
              <select 
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="us-east-1">US East (N. Virginia)</option>
                <option value="eu-west-1">EU (Ireland)</option>
                <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                <option value="us-west-99">US West (Unsupported Region)</option>
              </select>
            </div>
          </div>

        </div>

        {/* Right Column: Visual UI & Developer Console (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Tab Switcher for Visual vs JSON Raw */}
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('visual')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'visual' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Eye className="w-3.5 h-3.5" />
                Visual UI Representation
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'json' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Code className="w-3.5 h-3.5" />
                Raw JSON Inspector
              </button>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 text-xs text-slate-500">
              <Server className="w-3.5 h-3.5" />
              <span>POST /v1/eligibility/check</span>
            </div>
          </div>

          {/* Main Display Area */}
          <div className="min-h-[380px] bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden relative">
            
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-sm font-mono text-slate-400">Simulating API call latency ({latency}ms)...</p>
              </div>
            )}

            {/* Tab 1: Visual UI Representation */}
            {activeTab === 'visual' && (
              <div className="p-6 flex-1 flex flex-col justify-between">
                
                {/* Visual Header */}
                <div className="flex justify-between items-start pb-4 border-b border-slate-800/60">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300">Client-Side UI State</h3>
                    <p className="text-xs text-slate-500">How your application should render this response state.</p>
                  </div>
                  {currentResponse && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${getStatusBadgeClass(currentResponse.status)}`}>
                      HTTP {currentResponse.status} {currentResponse.statusText}
                    </span>
                  )}
                </div>

                {/* Visual State Cards based on Status */}
                <div className="my-auto py-6 flex flex-col items-center justify-center text-center">
                  {currentResponse ? (
                    <>
                      {/* 200 OK - Eligible */}
                      {currentResponse.status === 200 && (
                        <div className="max-w-md flex flex-col items-center gap-4 animate-fade-in">
                          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/5">
                            <UserCheck className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-slate-100">Eligibility Approved</h4>
                            <p className="text-xs text-slate-400 mt-1">
                              User <span className="font-mono text-slate-300">{userId}</span> is fully eligible for the <span className="capitalize font-semibold text-indigo-400">{tierRequested}</span> tier.
                            </p>
                          </div>
                          
                          {/* Details Box */}
                          <div className="w-full bg-slate-950/50 border border-slate-800/80 rounded-lg p-3 text-left text-xs flex flex-col gap-2">
                            <div className="flex justify-between text-slate-400">
                              <span>Compliance Score:</span>
                              <span className="font-mono font-bold text-emerald-400">{currentResponse.body?.score}%</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Expires At:</span>
                              <span className="font-mono text-slate-300">{new Date(currentResponse.body?.expiresAt).toLocaleDateString()}</span>
                            </div>
                            <div className="border-t border-slate-800/60 pt-2 mt-1">
                              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">System Notes:</span>
                              <ul className="list-disc list-inside text-slate-400 mt-1 space-y-1 text-[11px]">
                                {currentResponse.body?.reasons.map((reason: string, idx: number) => (
                                  <li key={idx}>{reason}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 204 No Content */}
                      {currentResponse.status === 204 && (
                        <div className="max-w-md flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                            <Info className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-slate-100">No Content Returned</h4>
                            <p className="text-xs text-slate-400 mt-1">
                              The server successfully processed the request, but returned no content (204 No Content). This is typical for background updates or ping checks.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 400 Bad Request */}
                      {currentResponse.status === 400 && (
                        <div className="max-w-md flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <AlertTriangle className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-slate-100">Invalid Request Parameters</h4>
                            <p className="text-xs text-slate-400 mt-1">
                              {currentResponse.body?.error?.message}
                            </p>
                          </div>
                          <div className="w-full bg-amber-950/10 border border-amber-500/20 rounded-lg p-3 text-left text-xs">
                            <span className="font-semibold text-amber-400">Developer Note:</span>
                            <p className="text-slate-300 mt-1 text-[11px]">{currentResponse.body?.error?.details}</p>
                          </div>
                        </div>
                      )}

                      {/* 401 Unauthorized */}
                      {currentResponse.status === 401 && (
                        <div className="max-w-md flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                            <Lock className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-slate-100">Authentication Required</h4>
                            <p className="text-xs text-slate-400 mt-1">
                              {currentResponse.body?.error?.message}
                            </p>
                          </div>
                          <div className="w-full bg-rose-950/10 border border-rose-500/20 rounded-lg p-3 text-left text-xs">
                            <span className="font-semibold text-rose-400">Action Required:</span>
                            <p className="text-slate-300 mt-1 text-[11px]">Please check your API keys and ensure the Authorization header is correctly formatted as a Bearer token.</p>
                          </div>
                        </div>
                      )}

                      {/* 403 Forbidden */}
                      {currentResponse.status === 403 && (
                        <div className="max-w-md flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                            <Ban className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-slate-100">Access Forbidden</h4>
                            <p className="text-xs text-slate-400 mt-1">
                              {currentResponse.body?.error?.message}
                            </p>
                          </div>
                          <div className="w-full bg-rose-950/10 border border-rose-500/20 rounded-lg p-3 text-left text-xs">
                            <span className="font-semibold text-rose-400">Reason:</span>
                            <p className="text-slate-300 mt-1 text-[11px]">{currentResponse.body?.error?.details}</p>
                          </div>
                        </div>
                      )}

                      {/* 422 Validation Failure */}
                      {currentResponse.status === 422 && (
                        <div className="max-w-md flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <UserX className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-slate-100">Validation Error</h4>
                            <p className="text-xs text-slate-400 mt-1">
                              The server understood the request, but the parameters failed business logic validation.
                            </p>
                          </div>
                          <div className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-left text-xs">
                            <span className="font-semibold text-amber-400">Validation Failures:</span>
                            <div className="mt-2 space-y-2">
                              {currentResponse.body?.error?.errors.map((err: any, idx: number) => (
                                <div key={idx} className="border-l-2 border-amber-500 pl-2 py-0.5">
                                  <p className="font-mono text-slate-200 text-[11px]">{err.field}: {err.rule}</p>
                                  <p className="text-slate-400 text-[10px]">{err.message}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 500 Internal Error */}
                      {currentResponse.status === 500 && (
                        <div className="max-w-md flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                            <ShieldAlert className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-slate-100">Internal Server Error</h4>
                            <p className="text-xs text-slate-400 mt-1">
                              {currentResponse.body?.error?.message}
                            </p>
                          </div>
                          <div className="w-full bg-rose-950/10 border border-rose-500/20 rounded-lg p-3 text-left text-xs">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-semibold text-rose-400">Incident ID:</span>
                              <span className="font-mono text-slate-300">{currentResponse.body?.error?.incidentId}</span>
                            </div>
                            <p className="text-slate-400 mt-1 text-[10px]">Provide this incident ID to support if the issue persists.</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-slate-500 text-xs">No response simulated yet. Click "Send Request" above.</div>
                  )}
                </div>

                {/* Visual Footer Tips */}
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-3 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Integration Tip:</span>{' '}
                    {selectedStatus === '200' && 'Always cache successful eligibility checks locally to reduce API overhead.'}
                    {selectedStatus === '204' && 'Handle 204 responses gracefully by assuming no changes are required.'}
                    {selectedStatus === '400' && 'Implement client-side validation to catch malformed parameters before hitting the API.'}
                    {selectedStatus === '401' && 'Redirect users to the login flow or prompt them to refresh their session token.'}
                    {selectedStatus === '403' && 'Show an upgrade prompt or restricted access screen to upsell premium tiers.'}
                    {selectedStatus === '422' && 'Highlight the specific form fields returned in the validation errors array.'}
                    {selectedStatus === '500' && 'Implement exponential backoff retry logic for all 5xx server errors.'}
                  </div>
                </div>

              </div>
            )}

            {/* Tab 2: Raw JSON Inspector */}
            {activeTab === 'json' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* JSON Header */}
                <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800 bg-slate-950/50">
                  <div className="flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-slate-300">Raw HTTP Payload Inspector</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setConsoleTab('request')}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${consoleTab === 'request' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Request
                    </button>
                    <button
                      onClick={() => setConsoleTab('response')}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${consoleTab === 'response' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Response
                    </button>
                  </div>
                </div>

                {/* JSON Content */}
                <div className="flex-1 p-4 overflow-auto font-mono text-xs bg-slate-950 text-slate-300 flex flex-col gap-4">
                  {consoleTab === 'request' && currentRequest && (
                    <div className="flex flex-col gap-4">
                      {/* Request Line */}
                      <div>
                        <span className="text-indigo-400 font-bold">{currentRequest.method}</span>{' '}
                        <span className="text-slate-200">{currentRequest.url}</span>
                      </div>
                      
                      {/* Request Headers */}
                      <div>
                        <div className="flex justify-between items-center text-slate-500 text-[11px] uppercase tracking-wider font-bold mb-1">
                          <span>Headers</span>
                          <button 
                            onClick={() => handleCopy(JSON.stringify(currentRequest.headers, null, 2), 'req_headers')}
                            className="hover:text-slate-300 flex items-center gap-1 normal-case font-normal"
                          >
                            {copiedField === 'req_headers' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {copiedField === 'req_headers' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <pre className="bg-slate-900/50 border border-slate-800/60 rounded-lg p-3 text-slate-400 overflow-x-auto">
                          {JSON.stringify(currentRequest.headers, null, 2)}
                        </pre>
                      </div>

                      {/* Request Body */}
                      <div>
                        <div className="flex justify-between items-center text-slate-500 text-[11px] uppercase tracking-wider font-bold mb-1">
                          <span>Body (JSON)</span>
                          <button 
                            onClick={() => handleCopy(JSON.stringify(currentRequest.body, null, 2), 'req_body')}
                            className="hover:text-slate-300 flex items-center gap-1 normal-case font-normal"
                          >
                            {copiedField === 'req_body' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {copiedField === 'req_body' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <pre className="bg-slate-900/50 border border-slate-800/60 rounded-lg p-3 text-indigo-300 overflow-x-auto">
                          {JSON.stringify(currentRequest.body, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {consoleTab === 'response' && currentResponse && (
                    <div className="flex flex-col gap-4">
                      {/* Status Line */}
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Status:</span>
                        <span className={`font-bold ${currentResponse.status >= 200 && currentResponse.status < 300 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {currentResponse.status} {currentResponse.statusText}
                        </span>
                      </div>

                      {/* Response Headers */}
                      <div>
                        <div className="flex justify-between items-center text-slate-500 text-[11px] uppercase tracking-wider font-bold mb-1">
                          <span>Headers</span>
                          <button 
                            onClick={() => handleCopy(JSON.stringify(currentResponse.headers, null, 2), 'res_headers')}
                            className="hover:text-slate-300 flex items-center gap-1 normal-case font-normal"
                          >
                            {copiedField === 'res_headers' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {copiedField === 'res_headers' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <pre className="bg-slate-900/50 border border-slate-800/60 rounded-lg p-3 text-slate-400 overflow-x-auto">
                          {JSON.stringify(currentResponse.headers, null, 2)}
                        </pre>
                      </div>

                      {/* Response Body */}
                      <div>
                        <div className="flex justify-between items-center text-slate-500 text-[11px] uppercase tracking-wider font-bold mb-1">
                          <span>Body (JSON)</span>
                          <button 
                            onClick={() => handleCopy(JSON.stringify(currentResponse.body, null, 2), 'res_body')}
                            className="hover:text-slate-300 flex items-center gap-1 normal-case font-normal"
                          >
                            {copiedField === 'res_body' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {copiedField === 'res_body' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <pre className="bg-slate-900/50 border border-slate-800/60 rounded-lg p-3 text-emerald-300 overflow-x-auto">
                          {currentResponse.body ? JSON.stringify(currentResponse.body, null, 2) : '// No Content (204)'}
                        </pre>
                      </div>
                    </div>
                  )}

                  {!currentResponse && (
                    <div className="text-slate-500 text-center py-8">No data available. Trigger a simulation first.</div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Developer Console / Terminal Output */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/30">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-300">Console Logs</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Real-time SDK events</span>
            </div>
            <div className="p-4 font-mono text-xs text-slate-400 bg-slate-950 max-h-[150px] overflow-y-auto flex flex-col gap-1.5">
              <div className="text-slate-500">[{new Date().toLocaleTimeString()}] SDK initialized. Ready for simulation.</div>
              {currentRequest && (
                <div className="text-indigo-400">
                  [{new Date().toLocaleTimeString()}] SDK.checkEligibility() invoked with userId: "{userId}"
                </div>
              )}
              {isLoading && (
                <div className="text-amber-400 animate-pulse">
                  [{new Date().toLocaleTimeString()}] SDK.request() pending... waiting {latency}ms
                </div>
              )}
              {currentResponse && !isLoading && (
                <div className={currentResponse.status >= 200 && currentResponse.status < 300 ? 'text-emerald-400' : 'text-rose-400'}>
                  [{new Date().toLocaleTimeString()}] SDK.response() received {currentResponse.status} {currentResponse.statusText}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}