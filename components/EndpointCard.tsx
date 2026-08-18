import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle, 
  Info, 
  Code, 
  Terminal, 
  Settings,
  FileJson
} from 'lucide-react';

export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
}

export interface ResponseSchema {
  status: number;
  description: string;
  schema?: string; // JSON string representation
}

export interface EndpointData {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  baseUrl?: string;
  description: string;
  headers?: Parameter[];
  queryParams?: Parameter[];
  bodySchema?: string; // JSON schema description or raw JSON
  defaultBody?: string; // Initial JSON body for playground
  responses: ResponseSchema[];
}

interface EndpointCardProps {
  endpoint: EndpointData;
  defaultBaseUrl?: string;
}

export default function EndpointCard({ endpoint, defaultBaseUrl = 'https://api.example.com' }: EndpointCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'schema' | 'try'>('schema');
  const [copied, setCopied] = useState(false);
  const [curlCopied, setCurlCopied] = useState(false);
  
  // Playground States
  const [baseUrl, setBaseUrl] = useState(endpoint.baseUrl || defaultBaseUrl);
  const [headerValues, setHeaderValues] = useState<Record<string, string>>({});
  const [queryValues, setQueryValues] = useState<Record<string, string>>({});
  const [bodyValue, setBodyValue] = useState(endpoint.defaultBody || '');
  
  // Response States
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Initialize default values
  useEffect(() => {
    const initialHeaders: Record<string, string> = {};
    endpoint.headers?.forEach(h => {
      if (h.defaultValue) initialHeaders[h.name] = h.defaultValue;
    });
    setHeaderValues(initialHeaders);

    const initialQueries: Record<string, string> = {};
    endpoint.queryParams?.forEach(q => {
      if (q.defaultValue) initialQueries[q.name] = q.defaultValue;
    });
    setQueryValues(initialQueries);
  }, [endpoint]);

  const handleCopy = (text: string, setCopyState: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopyState(true);
    setTimeout(() => setCopyState(false), 2000);
  };

  // Build full URL with query parameters
  const buildFullUrl = () => {
    let url = `${baseUrl.replace(/\/$/, '')}${endpoint.path}`;
    const params = new URLSearchParams();
    Object.entries(queryValues).forEach(([key, val]) => {
      if (val) params.append(key, val);
    });
    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  };

  // Generate cURL command
  const generateCurl = () => {
    const fullUrl = buildFullUrl();
    let curl = `curl -X ${endpoint.method} "${fullUrl}"`;
    
    Object.entries(headerValues).forEach(([key, val]) => {
      if (val) curl += ` \\\n  -H "${key}: ${val}"`;
    });

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(endpoint.method) && bodyValue) {
      curl += ` \\\n  -H "Content-Type: application/json"`;
      curl += ` \\\n  -d '${bodyValue.replace(/'/g, "'\\''")}'`;
    }
    return curl;
  };

  // Execute API Request
  const handleSendRequest = async () => {
    setLoading(true);
    setError(null);
    setResponseStatus(null);
    setResponseBody('');
    setResponseHeaders({});
    const startTime = performance.now();

    try {
      const fullUrl = buildFullUrl();
      const headers: Record<string, string> = { ...headerValues };
      
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(endpoint.method) && bodyValue) {
        headers['Content-Type'] = 'application/json';
      }

      const options: RequestInit = {
        method: endpoint.method,
        headers,
        body: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(endpoint.method) && bodyValue ? bodyValue : undefined,
      };

      const response = await fetch(fullUrl, options);
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setResponseStatus(response.status);

      // Extract headers
      const resHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        resHeaders[key] = value;
      });
      setResponseHeaders(resHeaders);

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        setResponseBody(JSON.stringify(json, null, 2));
      } catch {
        setResponseBody(text || '(Empty Response)');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to execute request. Check CORS configuration or network connection.');
    } finally {
      setLoading(false);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'POST': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'PUT': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'DELETE': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'PATCH': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md">
      {/* Header / Summary */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer select-none gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getMethodColor(endpoint.method)}`}>
            {endpoint.method}
          </span>
          <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {endpoint.path}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate hidden md:inline">
            {endpoint.description}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
              setActiveTab('try');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Try It
          </button>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-4">
            <button
              onClick={() => setActiveTab('schema')}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === 'schema'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileJson className="w-4 h-4" />
              Schema & Docs
            </button>
            <button
              onClick={() => setActiveTab('try')}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === 'try'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Try It Out
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'schema' ? (
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{endpoint.description}</p>
                </div>

                {/* Headers Schema */}
                {endpoint.headers && endpoint.headers.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Headers</h4>
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                          <tr>
                            <th className="px-4 py-2 font-medium text-slate-500">Name</th>
                            <th className="px-4 py-2 font-medium text-slate-500">Type</th>
                            <th className="px-4 py-2 font-medium text-slate-500">Required</th>
                            <th className="px-4 py-2 font-medium text-slate-500">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {endpoint.headers.map((h) => (
                            <tr key={h.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                              <td className="px-4 py-2 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{h.name}</td>
                              <td className="px-4 py-2 text-xs text-slate-500">{h.type}</td>
                              <td className="px-4 py-2 text-xs">
                                {h.required ? (
                                  <span className="text-rose-500 font-medium">Yes</span>
                                ) : (
                                  <span className="text-slate-400">No</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400">{h.description || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Query Parameters Schema */}
                {endpoint.queryParams && endpoint.queryParams.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Query Parameters</h4>
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                          <tr>
                            <th className="px-4 py-2 font-medium text-slate-500">Parameter</th>
                            <th className="px-4 py-2 font-medium text-slate-500">Type</th>
                            <th className="px-4 py-2 font-medium text-slate-500">Required</th>
                            <th className="px-4 py-2 font-medium text-slate-500">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {endpoint.queryParams.map((q) => (
                            <tr key={q.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                              <td className="px-4 py-2 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{q.name}</td>
                              <td className="px-4 py-2 text-xs text-slate-500">{q.type}</td>
                              <td className="px-4 py-2 text-xs">
                                {q.required ? (
                                  <span className="text-rose-500 font-medium">Yes</span>
                                ) : (
                                  <span className="text-slate-400">No</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400">{q.description || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Request Body Schema */}
                {endpoint.bodySchema && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Request Body Schema</h4>
                    <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto max-h-60 border border-slate-800">
                      {endpoint.bodySchema}
                    </pre>
                  </div>
                )}

                {/* Responses Schema */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Responses</h4>
                  <div className="space-y-3">
                    {endpoint.responses.map((res) => (
                      <div key={res.status} className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              res.status >= 200 && res.status < 300 
                                ? 'bg-emerald-500/10 text-emerald-500' 
                                : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {res.status}
                            </span>
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{res.description}</span>
                          </div>
                        </div>
                        {res.schema && (
                          <pre className="p-4 text-xs font-mono bg-slate-900 text-slate-100 overflow-x-auto max-h-48">
                            {res.schema}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Try It Out Interactive Panel */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Inputs */}
                <div className="space-y-5">
                  {/* Base URL Config */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Base URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Headers Input */}
                  {endpoint.headers && endpoint.headers.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Headers</label>
                      <div className="space-y-2">
                        {endpoint.headers.map((h) => (
                          <div key={h.name} className="flex items-center gap-2">
                            <span className="w-1/3 text-xs font-mono text-slate-600 dark:text-slate-400 truncate" title={h.name}>
                              {h.name} {h.required && <span className="text-rose-500">*</span>}
                            </span>
                            <input
                              type="text"
                              placeholder={h.defaultValue || h.type}
                              value={headerValues[h.name] || ''}
                              onChange={(e) => setHeaderValues({ ...headerValues, [h.name]: e.target.value })}
                              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Query Params Input */}
                  {endpoint.queryParams && endpoint.queryParams.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Query Parameters</label>
                      <div className="space-y-2">
                        {endpoint.queryParams.map((q) => (
                          <div key={q.name} className="flex items-center gap-2">
                            <span className="w-1/3 text-xs font-mono text-slate-600 dark:text-slate-400 truncate" title={q.name}>
                              {q.name} {q.required && <span className="text-rose-500">*</span>}
                            </span>
                            <input
                              type="text"
                              placeholder={q.defaultValue || q.type}
                              value={queryValues[q.name] || ''}
                              onChange={(e) => setQueryValues({ ...queryValues, [q.name]: e.target.value })}
                              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Request Body Input */}
                  {['POST', 'PUT', 'PATCH', 'DELETE'].includes(endpoint.method) && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Request Body (JSON)</label>
                      <textarea
                        rows={6}
                        value={bodyValue}
                        onChange={(e) => setBodyValue(e.target.value)}
                        placeholder="{}"
                        className="w-full p-3 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSendRequest}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Request
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right Column: cURL & Response */}
                <div className="space-y-5">
                  {/* cURL Preview */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">cURL Command</label>
                      <button
                        onClick={() => handleCopy(generateCurl(), setCurlCopied)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title="Copy cURL"
                      >
                        {curlCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto max-h-40 border border-slate-800 whitespace-pre-wrap break-all">
                      {generateCurl()}
                    </pre>
                  </div>

                  {/* Response Output */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Response</label>
                      {responseStatus && (
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-500">
                            Time: <span className="font-semibold text-slate-700 dark:text-slate-300">{responseTime}ms</span>
                          </span>
                          <span className={`font-bold px-2 py-0.5 rounded ${
                            responseStatus >= 200 && responseStatus < 300 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            Status: {responseStatus}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Response Body Display */}
                    <div className="relative">
                      {loading && (
                        <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
                          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                      )}

                      {error && (
                        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold">Request Failed</p>
                            <p className="mt-0.5 opacity-90">{error}</p>
                          </div>
                        </div>
                      )}

                      {!error && !responseBody && !loading && (
                        <div className="p-8 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                          Click "Send Request" to execute the API call and view the response.
                        </div>
                      )}

                      {responseBody && (
                        <div className="space-y-3">
                          <div className="relative">
                            <button
                              onClick={() => handleCopy(responseBody, setCopied)}
                              className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 transition-colors z-10"
                              title="Copy Response"
                            >
                              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto max-h-80 border border-slate-800">
                              {responseBody}
                            </pre>
                          </div>

                          {/* Response Headers */}
                          {Object.keys(responseHeaders).length > 0 && (
                            <details className="group border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                              <summary className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 cursor-pointer select-none">
                                <span>Response Headers</span>
                                <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                              </summary>
                              <div className="p-3 bg-slate-900 border-t border-slate-800 text-[11px] font-mono text-slate-300 space-y-1 max-h-40 overflow-y-auto">
                                {Object.entries(responseHeaders).map(([key, val]) => (
                                  <div key={key} className="flex">
                                    <span className="text-indigo-400 font-semibold shrink-0 mr-2">{key}:</span>
                                    <span className="break-all">{val}</span>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}