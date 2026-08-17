import React, { useState, useMemo } from 'react';
import { Copy, Check, Terminal, Code, FileText, Shield, Cpu, ArrowRight } from 'lucide-react';

export interface OauthRequestPayloadViewerProps {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: Record<string, string> | string;
  className?: string;
  title?: string;
  description?: string;
}

export default function OauthRequestPayloadViewer({
  method = 'POST',
  url = 'https://api.gateway.ibm.com/oauth2/v1/token',
  headers = {
    'Authorization': 'Basic dGVzdC1jbGllbnQtaWQ6dGVzdC1jbGllbnQtc2VjcmV0',
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-IBM-Client-Id': '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
    'X-IBM-Client-Secret': 'wX9yZ2aB3cDeFgHiJkLmNoPqRsTuVwXyZ1aB2cDe',
    'Accept': 'application/json'
  },
  body = {
    grant_type: 'client_credentials',
    scope: 'openid profile api:read api:write',
    client_id: '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d'
  },
  className = '',
  title = 'OAuth 2.0 Request Payload',
  description = 'Inspect the raw HTTP request payload, headers, and urlencoded body required for secure client authentication.'
}: OauthRequestPayloadViewerProps) {
  const [activeTab, setActiveTab] = useState<'raw' | 'curl' | 'json'>('raw');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Format body to urlencoded string
  const urlEncodedBody = useMemo(() => {
    if (typeof body === 'string') return body;
    return Object.entries(body)
      .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
      .join('&');
  }, [body]);

  // Format headers to raw HTTP string
  const rawHeadersString = useMemo(() => {
    return Object.entries(headers)
      .map(([key, val]) => `${key}: ${val}`)
      .join('\n');
  }, [headers]);

  // Generate Raw HTTP Request representation
  const rawHttpRequest = useMemo(() => {
    const urlObj = new URL(url);
    const path = urlObj.pathname + urlObj.search;
    return `${method} ${path} HTTP/1.1\nHost: ${urlObj.host}\n${rawHeadersString}\n\n${urlEncodedBody}`;
  }, [method, url, rawHeadersString, urlEncodedBody]);

  // Generate cURL command
  const curlCommand = useMemo(() => {
    const headerLines = Object.entries(headers)
      .map(([key, val]) => `  -H "${key}: ${val}"`)
      .join(' \\\n');
    const bodyData = typeof body === 'string' ? body : urlEncodedBody;
    return `curl -X ${method} "${url}" \\\n${headerLines} \\\n  -d "${bodyData}"`;
  }, [method, url, headers, body, urlEncodedBody]);

  // Generate JSON representation
  const jsonRepresentation = useMemo(() => {
    return JSON.stringify(
      {
        request: {
          method,
          url,
          headers,
          body: typeof body === 'string' ? body : body
        }
      },
      null,
      2
    );
  }, [method, url, headers, body]);

  const handleCopy = async (text: string, type: 'raw' | 'curl' | 'json' | 'headers' | 'body') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getActiveCodeString = () => {
    switch (activeTab) {
      case 'curl':
        return curlCommand;
      case 'json':
        return jsonRepresentation;
      case 'raw':
      default:
        return rawHttpRequest;
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden font-sans ${className}`}>
      {/* Header Section */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Developer Security Tools</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">{title}</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">{description}</p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md uppercase tracking-wide">
              {method}
            </span>
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-md border border-slate-800 max-w-xs truncate" title={url}>
              {url}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900/30 border-b border-slate-800/80">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('raw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
              activeTab === 'raw'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Raw HTTP
          </button>
          <button
            onClick={() => setActiveTab('curl')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
              activeTab === 'curl'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            cURL Command
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
              activeTab === 'json'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            JSON Payload
          </button>
        </div>

        <button
          onClick={() => handleCopy(getActiveCodeString(), activeTab)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-all duration-200"
        >
          {copiedText === activeTab ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Display Area */}
      <div className="relative group">
        <div className="overflow-x-auto max-h-[450px] p-6 font-mono text-xs leading-relaxed text-slate-300 bg-slate-950/90 selection:bg-indigo-500/30">
          {activeTab === 'raw' && (
            <div className="space-y-4">
              {/* Request Line */}
              <div>
                <span className="text-pink-400 font-bold">{method}</span>{' '}
                <span className="text-amber-300">{new URL(url).pathname + new URL(url).search}</span>{' '}
                <span className="text-slate-500">HTTP/1.1</span>
                <br />
                <span className="text-slate-400">Host:</span> <span className="text-slate-300">{new URL(url).host}</span>
              </div>

              {/* Headers Section */}
              <div className="border-t border-slate-900 pt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider font-sans font-semibold">Headers</span>
                  <button
                    onClick={() => handleCopy(rawHeadersString, 'headers')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-500 hover:text-slate-300 p-1 rounded"
                    title="Copy Headers Only"
                  >
                    {copiedText === 'headers' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="space-y-1">
                  {Object.entries(headers).map(([key, val]) => {
                    const isSensitive = key.toLowerCase().includes('secret') || key.toLowerCase().includes('authorization');
                    return (
                      <div key={key} className="hover:bg-slate-900/50 py-0.5 px-1 rounded transition-colors">
                        <span className="text-indigo-400 font-medium">{key}:</span>{' '}
                        <span className={isSensitive ? 'text-rose-400/90 font-semibold' : 'text-slate-300'}>
                          {val}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Body Section */}
              <div className="border-t border-slate-900 pt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider font-sans font-semibold">Body (urlencoded)</span>
                  <button
                    onClick={() => handleCopy(urlEncodedBody, 'body')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-500 hover:text-slate-300 p-1 rounded"
                    title="Copy Body Only"
                  >
                    {copiedText === 'body' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900/80 break-all text-emerald-400/90">
                  {urlEncodedBody.split('&').map((param, idx) => {
                    const [k, v] = param.split('=');
                    return (
                      <span key={idx} className="inline-block mr-2 mb-1">
                        <span className="text-amber-400/90">{k}</span>
                        <span className="text-slate-500">=</span>
                        <span className="text-emerald-300">{v}</span>
                        {idx < urlEncodedBody.split('&').length - 1 && <span className="text-slate-500 mr-1">&</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'curl' && (
            <pre className="whitespace-pre-wrap text-slate-300">
              <span className="text-slate-500"># Execute this command in your terminal to request a token</span>
              <br />
              <span className="text-pink-400">curl</span> <span className="text-slate-400">-X</span> <span className="text-emerald-400">{method}</span> <span className="text-amber-300">"{url}"</span> \<br />
              {Object.entries(headers).map(([key, val], idx) => {
                const isSensitive = key.toLowerCase().includes('secret') || key.toLowerCase().includes('authorization');
                return (
                  <span key={key}>
                    {'  '}<span className="text-slate-400">-H</span> <span className="text-indigo-300">"{key}: <span className={isSensitive ? 'text-rose-400' : 'text-slate-300'}>{val}</span>"</span> \<br />
                  </span>
                );
              })}
              {'  '}<span className="text-slate-400">-d</span> <span className="text-emerald-300">"{urlEncodedBody}"</span>
            </pre>
          )}

          {activeTab === 'json' && (
            <pre className="whitespace-pre text-slate-300">
              {JSON.stringify({ request: { method, url, headers, body } }, null, 2)
                .replace(/"([^"]+)":/g, '"<span class="text-indigo-400">$1</span>":')
                .split('\n')
                .map((line, i) => (
                  <code key={i} dangerouslySetInnerHTML={{ __html: line + '\n' }} />
                ))}
            </pre>
          )}
        </div>
      </div>

      {/* Footer / Developer Guide */}
      <div className="p-4 bg-slate-900/80 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>IBM API Connect & DataPower Gateway Compatible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Learn more about OAuth 2.0 Client Credentials</span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
        </div>
      </div>
    </div>
  );
}