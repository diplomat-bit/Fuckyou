import React, { useState, useMemo } from "react";
import {
  Play,
  Shield,
  Key,
  Globe,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Terminal,
  Code,
  AlertCircle,
  CheckCircle2,
  Info,
  Layers,
  Cpu
} from "lucide-react";

// Mock JWT Generator for realistic simulation
const generateMockJWT = (clientId: string, scope: string, country: string, business: string) => {
  const header = { alg: "RS256", typ: "JWT", kid: "sim-key-v1" };
  const payload = {
    iss: `https://api.gateway.com/${country}/${business}`,
    sub: clientId || "client_id_placeholder",
    aud: `https://api.gateway.com/${country}/${business}/services`,
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    jti: Math.random().toString(36).substring(2, 15),
    scope: scope || "read write",
    client_id: clientId || "client_id_placeholder",
    context: {
      country_code: country,
      business_code: business,
      environment: "sandbox"
    }
  };
  
  const base64Url = (obj: object) => {
    try {
      return btoa(JSON.stringify(obj))
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
    } catch (e) {
      return "err";
    }
  };
  
  return `${base64Url(header)}.${base64Url(payload)}.mock_signature_hash_value_signature_verification_passed`;
};

export default function OauthClientCredentialsSimulator() {
  // State variables
  const [baseUrl, setBaseUrl] = useState("https://api.sandbox.platform.com");
  const [countryCode, setCountryCode] = useState("us");
  const [businessCode, setBusinessCode] = useState("fintech");
  const [clientId, setClientId] = useState("client_id_8f9a2c4e");
  const [clientSecret, setClientSecret] = useState("client_secret_99a8b7c6d5e4f3g2h1");
  const [grantType, setGrantType] = useState("client_credentials");
  const [scope, setScope] = useState("accounts:read payments:write offline_access");
  
  const [showSecret, setShowSecret] = useState(false);
  const [isMockMode, setIsMockMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"request" | "response" | "jwt-decode">("request");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Response States
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<any>(null);
  const [errorLog, setErrorLog] = useState<string | null>(null);

  // Computed values
  const requestUrl = `${baseUrl}/${countryCode}/${businessCode}/oauth/token`;
  
  const basicAuthHeader = useMemo(() => {
    try {
      return `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
    } catch (e) {
      return "Basic [Invalid Credentials Encoding]";
    }
  }, [clientId, clientSecret]);

  const urlEncodedBody = useMemo(() => {
    const params = new URLSearchParams();
    params.append("grant_type", grantType);
    if (scope) params.append("scope", scope);
    return params.toString();
  }, [grantType, scope]);

  // Copy helper
  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Execute Request
  const handleExecute = async () => {
    setIsLoading(true);
    setErrorLog(null);
    setResponseStatus(null);
    setResponseBody(null);
    setResponseHeaders({});
    setActiveTab("response");

    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (isMockMode) {
      // Mock Simulation Logic
      if (!clientId || !clientSecret) {
        setResponseStatus(401);
        setResponseHeaders({
          "Content-Type": "application/json",
          "Date": new Date().toUTCString(),
          "Server": "MockOAuthGateway/2.0",
          "WWW-Authenticate": 'Basic realm="Access to token endpoint"'
        });
        setResponseBody({
          error: "invalid_client",
          error_description: "Client authentication failed (e.g., unknown client, no client authentication included, or unsupported authentication method)."
        });
        setIsLoading(false);
        return;
      }

      if (grantType !== "client_credentials") {
        setResponseStatus(400);
        setResponseHeaders({
          "Content-Type": "application/json",
          "Date": new Date().toUTCString(),
          "Server": "MockOAuthGateway/2.0"
        });
        setResponseBody({
          error: "unsupported_grant_type",
          error_description: "The authorization grant type is not supported by the authorization server."
        });
        setIsLoading(false);
        return;
      }

      // Success Mock Response
      const mockToken = generateMockJWT(clientId, scope, countryCode, businessCode);
      setResponseStatus(200);
      setResponseHeaders({
        "Content-Type": "application/json;charset=UTF-8",
        "Cache-Control": "no-store",
        "Pragma": "no-cache",
        "Date": new Date().toUTCString(),
        "Server": "MockOAuthGateway/2.0",
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff"
      });
      setResponseBody({
        access_token: mockToken,
        token_type: "Bearer",
        expires_in: 3600,
        scope: scope || "default",
        refresh_token: "mock_refresh_token_" + Math.random().toString(36).substring(2, 10)
      });
    } else {
      // Real HTTP Request Execution
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": basicAuthHeader
        };

        const response = await fetch(requestUrl, {
          method: "POST",
          headers: headers,
          body: urlEncodedBody
        });

        setResponseStatus(response.status);
        
        const headersObj: Record<string, string> = {};
        response.headers.forEach((val, key) => {
          headersObj[key] = val;
        });
        setResponseHeaders(headersObj);

        const text = await response.text();
        try {
          setResponseBody(JSON.parse(text));
        } catch {
          setResponseBody(text);
        }
      } catch (err: any) {
        setErrorLog(err.message || "An error occurred during the live fetch request.");
        setResponseStatus(0);
        setResponseBody({
          error: "network_error",
          error_description: "Failed to fetch. This is likely due to CORS restrictions on the target server or network connectivity issues. Use Mock Mode to simulate the flow locally."
        });
      }
    }
    setIsLoading(false);
  };

  // Decode JWT payload for visualization
  const decodedJWTPayload = useMemo(() => {
    if (!responseBody || !responseBody.access_token) return null;
    const parts = responseBody.access_token.split(".");
    if (parts.length !== 3) return null;
    try {
      const payloadDecoded = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(payloadDecoded);
    } catch (e) {
      return { error: "Could not decode simulated JWT payload" };
    }
  }, [responseBody]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 p-6 border border-slate-800 mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 text-xs font-semibold tracking-wider text-indigo-400 bg-indigo-950/80 border border-indigo-800 rounded-full uppercase">
                OAuth 2.0 Simulator
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800 rounded-full uppercase">
                Client Credentials
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              POST /{`{countryCode}`}/{`{businessCode}`} Token Simulator
            </h1>
            <p className="text-slate-400 mt-1 max-w-2xl text-sm">
              Simulate and test OAuth 2.0 Client Credentials grant requests. Generates standard application/x-www-form-urlencoded payloads and decodes simulated JWT tokens.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-900/90 p-2 rounded-lg border border-slate-800 self-start md:self-center">
            <span className="text-xs font-medium text-slate-400 pl-2">Mode:</span>
            <button
              onClick={() => setIsMockMode(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                isMockMode
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Mock Sandbox
            </button>
            <button
              onClick={() => setIsMockMode(false)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                !isMockMode
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Live Endpoint
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configuration Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/80 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-200">Endpoint Configuration</h2>
            </div>

            {/* Base URL */}
            {!isMockMode && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Base URL
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="https://api.yourdomain.com"
                />
              </div>
            )}

            {/* Path Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  Country Code
                </label>
                <input
                  type="text"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="us"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Business Code
                </label>
                <input
                  type="text"
                  value={businessCode}
                  onChange={(e) => setBusinessCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="fintech"
                />
              </div>
            </div>

            {/* Credentials */}
            <div className="space-y-4 pt-2 border-t border-slate-800/60">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  Client ID
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  placeholder="Enter Client ID"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    Client Secret
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <input
                  type={showSecret ? "text" : "password"}
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  placeholder="Enter Client Secret"
                />
              </div>
            </div>

            {/* Body Parameters */}
            <div className="space-y-4 pt-2 border-t border-slate-800/60">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Grant Type
                </label>
                <select
                  value={grantType}
                  onChange={(e) => setGrantType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="client_credentials">client_credentials</option>
                  <option value="invalid_grant_type">invalid_grant_type (Simulate Error)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Scope (Space Separated)
                </label>
                <input
                  type="text"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  placeholder="e.g. read write"
                />
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecute}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all ${
                isLoading
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : isMockMode
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/50 active:scale-[0.98]"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 active:scale-[0.98]"
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Executing Request...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  {isMockMode ? "Simulate Token Request" : "Send Live POST Request"}
                </>
              )}
            </button>
          </div>

          {/* Info Card */}
          <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/60 flex gap-3">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">About Client Credentials Grant</p>
              <p>
                Used for machine-to-machine (M2M) authentication. The client credentials are sent in the HTTP Authorization header as a Base64 encoded string: <code className="text-indigo-300 font-mono">Basic base64(client_id:client_secret)</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Request/Response Console */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden min-h-[600px]">
          {/* Console Tabs */}
          <div className="flex items-center justify-between bg-slate-950 px-4 border-b border-slate-800">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("request")}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                  activeTab === "request"
                    ? "border-indigo-500 text-indigo-400 bg-indigo-950/10"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Code className="w-4 h-4" />
                Request Preview
              </button>
              <button
                onClick={() => setActiveTab("response")}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all relative ${
                  activeTab === "response"
                    ? "border-indigo-500 text-indigo-400 bg-indigo-950/10"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Terminal className="w-4 h-4" />
                Response Console
                {responseStatus && (
                  <span className={`w-2 h-2 rounded-full ${responseStatus === 200 ? "bg-emerald-500" : "bg-rose-500"}`} />
                )}
              </button>
              {responseBody?.access_token && (
                <button
                  onClick={() => setActiveTab("jwt-decode")}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                    activeTab === "jwt-decode"
                      ? "border-indigo-500 text-indigo-400 bg-indigo-950/10"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  JWT Payload
                </button>
              )}
            </div>

            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider hidden sm:block">
              HTTP/1.1 Client
            </div>
          </div>

          {/* Console Content */}
          <div className="flex-1 p-6 overflow-y-auto font-mono text-sm bg-slate-950/40">
            {activeTab === "request" && (
              <div className="space-y-6">
                {/* HTTP Request Block */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">HTTP Request</span>
                    <button
                      onClick={() => handleCopy(`POST ${requestUrl}\nHost: ${baseUrl.replace("https://", "")}\nContent-Type: application/x-www-form-urlencoded\nAuthorization: ${basicAuthHeader}\n\n${urlEncodedBody}`, "raw-request")}
                      className="text-slate-500 hover:text-slate-300 flex items-center gap-1 text-xs transition-colors"
                    >
                      {copiedField === "raw-request" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedField === "raw-request" ? "Copied" : "Copy Raw"}
                    </button>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 overflow-x-auto text-slate-300">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">POST</span>
                      <span className="text-indigo-400 break-all">{requestUrl}</span>
                    </div>
                    <div className="text-slate-500 text-xs border-b border-slate-900 pb-2 mb-2">Headers</div>
                    <div className="space-y-1 text-xs">
                      <div><span className="text-slate-400">Host:</span> {baseUrl.replace("https://", "")}</div>
                      <div><span className="text-slate-400">Content-Type:</span> <span className="text-amber-400">application/x-www-form-urlencoded</span></div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Authorization:</span> 
                        <span className="text-indigo-300 break-all">{basicAuthHeader}</span>
                      </div>
                    </div>
                    <div className="text-slate-500 text-xs border-b border-slate-900 pb-2 mt-4 mb-2">Body</div>
                    <div className="text-emerald-300 text-xs break-all">{urlEncodedBody}</div>
                  </div>
                </div>

                {/* Curl Command Block */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">cURL Command</span>
                    <button
                      onClick={() => handleCopy(`curl -X POST "${requestUrl}" \\\n  -H "Content-Type: application/x-www-form-urlencoded" \\\n  -H "Authorization: ${basicAuthHeader}" \\\n  -d "${urlEncodedBody}"`, "curl")}
                      className="text-slate-500 hover:text-slate-300 flex items-center gap-1 text-xs transition-colors"
                    >
                      {copiedField === "curl" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedField === "curl" ? "Copied" : "Copy cURL"}
                    </button>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 overflow-x-auto text-slate-300 text-xs leading-relaxed">
                    <span className="text-slate-500">curl -X</span> POST <span className="text-indigo-400">"{requestUrl}"</span> \<br />
                    &nbsp;&nbsp;-H <span className="text-amber-400">"Content-Type: application/x-www-form-urlencoded"</span> \<br />
                    &nbsp;&nbsp;-H <span className="text-amber-400">"Authorization: {basicAuthHeader}"</span> \<br />
                    &nbsp;&nbsp;-d <span className="text-emerald-400">"{urlEncodedBody}"</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "response" && (
              <div className="space-y-6">
                {/* Status Indicator */}
                {responseStatus !== null ? (
                  <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                    responseStatus === 200 
                      ? "bg-emerald-950/30 border-emerald-800/50 text-emerald-400" 
                      : "bg-rose-950/30 border-rose-800/50 text-rose-400"
                  }`}>
                    {responseStatus === 200 ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-sm">
                        HTTP Status: {responseStatus} {responseStatus === 200 ? "OK" : responseStatus === 401 ? "Unauthorized" : "Bad Request"}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {responseStatus === 200 
                          ? "Access token successfully generated and returned." 
                          : "The server rejected the request. Check credentials or parameters."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-3">
                    <Terminal className="w-12 h-12 text-slate-700 animate-pulse" />
                    <div className="text-center">
                      <p className="font-semibold text-slate-400">No response yet</p>
                      <p className="text-xs text-slate-500 max-w-xs mt-1">
                        Configure the parameters on the left and click "Simulate Token Request" to execute.
                      </p>
                    </div>
                  </div>
                )}

                {/* Response Headers & Body */}
                {responseStatus !== null && (
                  <div className="space-y-4">
                    {/* Headers */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Response Headers</span>
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 text-xs space-y-1 text-slate-400">
                        {Object.entries(responseHeaders).map(([key, val]) => (
                          <div key={key}>
                            <span className="text-slate-500">{key}:</span> {val}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Response Body (JSON)</span>
                        <button
                          onClick={() => handleCopy(JSON.stringify(responseBody, null, 2), "response-body")}
                          className="text-slate-500 hover:text-slate-300 flex items-center gap-1 text-xs transition-colors"
                        >
                          {copiedField === "response-body" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedField === "response-body" ? "Copied" : "Copy JSON"}
                        </button>
                      </div>
                      <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 overflow-x-auto text-xs text-slate-300 leading-relaxed">
                        {JSON.stringify(responseBody, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {errorLog && (
                  <div className="p-4 bg-rose-950/20 border border-rose-900/50 rounded-lg text-rose-400 text-xs">
                    <div className="font-bold mb-1">Console Error Log:</div>
                    {errorLog}
                  </div>
                )}
              </div>
            )}

            {activeTab === "jwt-decode" && decodedJWTPayload && (
              <div className="space-y-6">
                <div className="p-4 bg-indigo-950/30 border border-indigo-800/50 rounded-lg text-indigo-400 flex gap-3">
                  <Shield className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm">Decoded Simulated JWT Payload</div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      This is the decoded payload of the simulated access token. In production, resource servers verify this token to authorize API requests.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">JWT Claims</span>
                    <button
                      onClick={() => handleCopy(JSON.stringify(decodedJWTPayload, null, 2), "jwt-claims")}
                      className="text-slate-500 hover:text-slate-300 flex items-center gap-1 text-xs transition-colors"
                    >
                      {copiedField === "jwt-claims" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedField === "jwt-claims" ? "Copied" : "Copy Claims"}
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 overflow-x-auto text-xs text-slate-300 leading-relaxed">
                    {JSON.stringify(decodedJWTPayload, null, 2)}
                  </pre>
                </div>

                {/* Claims Explanation */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80 space-y-3 text-xs">
                  <div className="font-bold text-slate-300 border-b border-slate-800 pb-1.5">Claim Explanations</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-400">
                    <div>
                      <span className="text-indigo-400 font-semibold">iss (Issuer):</span> Identifies the security token service that issued the JWT.
                    </div>
                    <div>
                      <span className="text-indigo-400 font-semibold">sub (Subject):</span> The client ID of the application requesting the token.
                    </div>
                    <div>
                      <span className="text-indigo-400 font-semibold">aud (Audience):</span> The target resource server or API gateway.
                    </div>
                    <div>
                      <span className="text-indigo-400 font-semibold">exp (Expiration):</span> Unix timestamp when the token expires (1 hour from generation).
                    </div>
                    <div>
                      <span className="text-indigo-400 font-semibold">scope:</span> Granted permissions for this token session.
                    </div>
                    <div>
                      <span className="text-indigo-400 font-semibold">context:</span> Custom metadata containing country and business context.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Console Footer */}
          <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Simulator Engine Active</span>
            </div>
            <div>
              {isMockMode ? "Mock Sandbox Mode" : "Live HTTP Mode"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}