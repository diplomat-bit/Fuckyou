import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef
} from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Loader2, 
  RefreshCw, 
  Terminal, 
  ExternalLink, 
  Lock, 
  Unlock,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';

export interface SovereignIframeProps {
  src: string;
  allowedOrigins: string[];
  sandbox?: string;
  requireHandshake?: boolean;
  handshakePayload?: any;
  timeout?: number; // in milliseconds
  onMessage?: (data: any, origin: string) => void;
  onHandshakeSuccess?: () => void;
  onHandshakeFailure?: (error: string) => void;
  className?: string;
  title?: string;
}

export interface SovereignIframeRef {
  sendMessage: (type: string, payload: any) => void;
  reconnect: () => void;
  getAuditLogs: () => AuditLogEntry[];
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  direction: 'IN' | 'OUT' | 'SYSTEM';
  type: string;
  payload: any;
  origin?: string;
}

export const SovereignIframe = forwardRef<SovereignIframeRef, SovereignIframeProps>(({
  src,
  allowedOrigins,
  sandbox = "allow-scripts allow-forms allow-popups allow-same-origin allow-downloads",
  requireHandshake = true,
  handshakePayload = {},
  timeout = 15000,
  onMessage,
  onHandshakeSuccess,
  onHandshakeFailure,
  className = "",
  title = "Sovereign Portal"
}, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [connectionState, setConnectionState] = useState<'initializing' | 'handshaking' | 'connected' | 'failed'>('initializing');
  const [handshakeToken, setHandshakeToken] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [showAuditLog, setShowAuditLog] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const handshakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to add logs
  const addLog = useCallback((direction: 'IN' | 'OUT' | 'SYSTEM', type: string, payload: any, origin?: string) => {
    const newLog: AuditLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      direction,
      type,
      payload,
      origin
    };
    setAuditLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
  }, []);

  // Verify if origin is allowed
  const isOriginAllowed = useCallback((origin: string) => {
    if (allowedOrigins.includes('*')) return true;
    return allowedOrigins.some(allowed => {
      try {
        const allowedUrl = new URL(allowed);
        const originUrl = new URL(origin);
        return allowedUrl.origin === originUrl.origin;
      } catch {
        return allowed === origin || origin.endsWith(allowed.replace(/^\*\./, '.'));
      }
    });
  }, [allowedOrigins]);

  // Send message to iframe
  const sendMessage = useCallback((type: string, payload: any) => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) {
      addLog('SYSTEM', 'SEND_ERROR', { error: 'Iframe window not available' });
      return;
    }

    // Determine target origin
    let targetOrigin = '*';
    try {
      const url = new URL(src);
      targetOrigin = url.origin;
    } catch (e) {
      // Fallback if src is relative or invalid URL
    }

    const messageData = {
      source: 'SOVEREIGN_PARENT',
      type,
      payload,
      token: handshakeToken
    };

    iframeRef.current.contentWindow.postMessage(messageData, targetOrigin);
    addLog('OUT', type, payload, targetOrigin);
  }, [src, handshakeToken, addLog]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    sendMessage,
    reconnect: () => {
      handleInit();
    },
    getAuditLogs: () => auditLogs
  }));

  // Initialize connection & handshake
  const handleInit = useCallback(() => {
    if (handshakeTimeoutRef.current) {
      clearTimeout(handshakeTimeoutRef.current);
    }

    setConnectionState('initializing');
    setErrorMessage('');
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setHandshakeToken(token);
    addLog('SYSTEM', 'INIT_TUNNEL', { src, allowedOrigins, requireHandshake });

    if (!requireHandshake) {
      setConnectionState('connected');
      return;
    }

    // Set timeout for handshake completion
    handshakeTimeoutRef.current = setTimeout(() => {
      setConnectionState(prev => {
        if (prev !== 'connected') {
          const err = `Handshake timed out after ${timeout / 1000}s`;
          setErrorMessage(err);
          addLog('SYSTEM', 'HANDSHAKE_TIMEOUT', { timeout });
          if (onHandshakeFailure) onHandshakeFailure(err);
          return 'failed';
        }
        return prev;
      });
    }, timeout);
  }, [src, allowedOrigins, requireHandshake, timeout, onHandshakeFailure, addLog]);

  // Handle incoming postMessages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 1. Origin Verification
      if (!isOriginAllowed(event.origin)) {
        addLog('SYSTEM', 'BLOCKED_ORIGIN', { origin: event.origin, data: event.data });
        return;
      }

      const data = event.data;
      if (!data || typeof data !== 'object' || data.source !== 'SOVEREIGN_IFRAME') {
        // Ignore messages not matching our protocol structure
        return;
      }

      addLog('IN', data.type, data.payload, event.origin);

      // 2. Handshake Protocol Handling
      if (requireHandshake) {
        if (data.type === 'READY' && connectionState === 'initializing') {
          setConnectionState('handshaking');
          // Send INIT with token and payload
          sendMessage('INIT', { token: handshakeToken, ...handshakePayload });
        } else if (data.type === 'ACK') {
          if (data.token === handshakeToken) {
            setConnectionState('connected');
            if (handshakeTimeoutRef.current) {
              clearTimeout(handshakeTimeoutRef.current);
            }
            addLog('SYSTEM', 'HANDSHAKE_SUCCESS', { origin: event.origin });
            if (onHandshakeSuccess) onHandshakeSuccess();
          } else {
            const err = 'Cryptographic token mismatch during handshake ACK';
            setErrorMessage(err);
            setConnectionState('failed');
            addLog('SYSTEM', 'HANDSHAKE_ERROR', { error: err });
            if (onHandshakeFailure) onHandshakeFailure(err);
          }
        }
      }

      // 3. General Message Forwarding (only if connected or handshake not required)
      if (!requireHandshake || connectionState === 'connected') {
        if (onMessage) {
          onMessage(data, event.origin);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [
    connectionState,
    handshakeToken,
    requireHandshake,
    handshakePayload,
    isOriginAllowed,
    sendMessage,
    onMessage,
    onHandshakeSuccess,
    onHandshakeFailure,
    addLog
  ]);

  // Trigger initialization on mount or src change
  useEffect(() => {
    handleInit();
    return () => {
      if (handshakeTimeoutRef.current) {
        clearTimeout(handshakeTimeoutRef.current);
      }
    };
  }, [src, handleInit]);

  return (
    <div className={`flex flex-col h-full w-full bg-slate-950 rounded-2xl border transition-all duration-300 overflow-hidden ${
      connectionState === 'connected' ? 'border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]' :
      connectionState === 'failed' ? 'border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.05)]' :
      'border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]'
    } ${className}`}>
      
      {/* Secure Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md select-none">
        <div className="flex items-center space-x-3 min-w-0">
          {connectionState === 'connected' ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 animate-pulse" />
          ) : connectionState === 'failed' ? (
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
          ) : (
            <Loader2 className="w-5 h-5 text-amber-400 flex-shrink-0 animate-spin" />
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-200 truncate">{title}</h3>
            <p className="text-xs text-slate-400 truncate font-mono max-w-md">{src}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Connection Status Badge */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-mono border ${
            connectionState === 'connected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            connectionState === 'failed' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
            'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            {connectionState === 'connected' && 'SECURE TUNNEL'}
            {connectionState === 'initializing' && 'INITIALIZING'}
            {connectionState === 'handshaking' && 'HANDSHAKING'}
            {connectionState === 'failed' && 'TUNNEL BLOCKED'}
          </span>

          {/* Audit Log Toggle */}
          <button
            onClick={() => setShowAuditLog(!showAuditLog)}
            className={`p-1.5 rounded-lg border transition-colors ${
              showAuditLog 
                ? 'bg-slate-800 border-slate-700 text-slate-200' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle Security Audit Log"
          >
            <Terminal className="w-4 h-4" />
          </button>

          {/* Reconnect / Reload */}
          <button
            onClick={handleInit}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Reset Secure Connection"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative min-h-0 bg-slate-950">
        {/* Loading / Handshaking Overlay */}
        {(connectionState === 'initializing' || connectionState === 'handshaking') && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-sm p-6 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl animate-pulse"></div>
              <div className="relative p-4 bg-slate-900 border border-amber-500/30 rounded-full">
                <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
              </div>
            </div>
            <h4 className="text-lg font-bold text-slate-200 mb-2">
              {connectionState === 'initializing' ? 'Establishing Secure Tunnel' : 'Verifying Cryptographic Handshake'}
            </h4>
            <p className="text-sm text-slate-400 max-w-md mb-4">
              Establishing an isolated, sandboxed communication channel with the external portal. Verifying origin and security headers.
            </p>
            <div className="w-48 bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div className="bg-amber-500 h-1.5 rounded-full animate-infinite-loading"></div>
            </div>
          </div>
        )}

        {/* Error / Failed Overlay */}
        {connectionState === 'failed' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-sm p-6 text-center">
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-full mb-6">
              <ShieldAlert className="w-12 h-12 text-rose-400" />
            </div>
            <h4 className="text-lg font-bold text-slate-200 mb-2">Secure Connection Failed</h4>
            <p className="text-sm text-rose-400/90 max-w-md mb-6 font-mono bg-rose-950/30 border border-rose-500/10 p-3 rounded-lg">
              {errorMessage || 'The external portal failed to complete the security handshake protocol.'}
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleInit}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Connection</span>
              </button>
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Directly</span>
              </a>
            </div>
          </div>
        )}

        {/* The Sandboxed Iframe */}
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          sandbox={sandbox}
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full border-0 bg-slate-950"
          onLoad={() => {
            if (!requireHandshake) {
              setConnectionState('connected');
            }
          }}
        />

        {/* Security Audit Log Drawer */}
        {showAuditLog && (
          <div className="absolute bottom-0 inset-x-0 h-1/2 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md z-20 flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800/60">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-300 font-mono">SECURITY AUDIT LOG</span>
              </div>
              <button
                onClick={() => setShowAuditLog(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                [CLOSE]
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-3">
              {auditLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-8">No security events recorded yet.</div>
              ) : (
                auditLogs.map(log => (
                  <div key={log.id} className="border-b border-slate-800/40 pb-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span>{log.timestamp}</span>
                      <span className={`px-1.5 py-0.5 rounded ${
                        log.direction === 'IN' ? 'bg-blue-500/10 text-blue-400' :
                        log.direction === 'OUT' ? 'bg-purple-500/10 text-purple-400' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {log.direction}
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-slate-300 font-semibold">{log.type}</span>
                      {log.origin && (
                        <span className="text-slate-500 text-[10px] truncate max-w-xs">({log.origin})</span>
                      )}
                    </div>
                    {log.payload && (
                      <pre className="mt-1 p-1.5 bg-slate-950/60 rounded text-slate-400 overflow-x-auto max-h-24 text-[10px]">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Security Footer Status */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 select-none">
        <div className="flex items-center space-x-1.5">
          <Lock className="w-3 h-3 text-emerald-500/70" />
          <span>Sandboxed Environment Active</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>Allowed Origins: {allowedOrigins.join(', ')}</span>
          <span>•</span>
          <span>Token: {handshakeToken ? `${handshakeToken.substring(0, 6)}...` : 'NONE'}</span>
        </div>
      </div>

      {/* Custom CSS for infinite loading animation */}
      <style>{`
        @keyframes infinite-loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-infinite-loading {
          animation: infinite-loading 1.5s infinite linear;
          width: 100%;
        }
      `}</style>
    </div>
  );
});

SovereignIframe.displayName = 'SovereignIframe';
export default SovereignIframe;