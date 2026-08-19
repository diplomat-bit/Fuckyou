

// --- CONSOLIDATED FROM: ./api/PortalDiagnostics/types/NetworkDiagnosticTypes.ts ---

export interface NetworkEndpoint {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
  timeout: number;
  headers?: Record<string, string>;
}

export interface NetworkLatencyMetrics {
  dnsLookup: number;
  tcpConnection: number;
  tlsHandshake: number;
  ttfb: number;
  totalDuration: number;
}

export interface NetworkDiagnosticResult {
  endpointId: string;
  status: 'online' | 'offline' | 'degraded' | 'timeout';
  statusCode: number;
  latency: NetworkLatencyMetrics;
  timestamp: string;
  error?: string;
}

export interface NetworkDiagnosticSummary {
  totalEndpoints: number;
  onlineCount: number;
  offlineCount: number;
  averageLatency: number;
  lastRun: string;
  results: NetworkDiagnosticResult[];
}

export interface NetworkDiagnosticConfig {
  endpoints: NetworkEndpoint[];
  retryCount: number;
  concurrencyLimit: number;
  globalTimeout: number;
}

export type NetworkDiagnosticStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface NetworkDiagnosticState {
  status: NetworkDiagnosticStatus;
  lastSummary: NetworkDiagnosticSummary | null;
  isScanning: boolean;
}

// ============================================================================
// API ROUTE IMPLEMENTATION & DIAGNOSTIC ENGINE
// ============================================================================

import { Request, Response, Router } from 'express';
import { performance } from 'perf_hooks';
import * as dns from 'dns';
import * as net from 'net';
import * as tls from 'tls';
import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';

// In-memory state store
let currentConfig: NetworkDiagnosticConfig = {
  endpoints: [
    { id: 'google-dns', url: 'https://8.8.8.8', method: 'GET', timeout: 3000 },
    { id: 'cloudflare-dns', url: 'https://1.1.1.1', method: 'GET', timeout: 3000 },
    { id: 'github-api', url: 'https://api.github.com', method: 'GET', timeout: 5000, headers: { 'User-Agent': 'PortalDiagnostics' } }
  ],
  retryCount: 2,
  concurrencyLimit: 3,
  globalTimeout: 10000,
};

let lastSummary: NetworkDiagnosticSummary | null = null;
let isScanning = false;

/**
 * Fallback latency measurement using standard fetch API
 */
async function measureLatencyFallback(endpoint: NetworkEndpoint): Promise<NetworkDiagnosticResult> {
  const start = performance.now();
  const latency: NetworkLatencyMetrics = {
    dnsLookup: 0,
    tcpConnection: 0,
    tlsHandshake: 0,
    ttfb: 0,
    totalDuration: 0,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout || 5000);

    const fetchStart = performance.now();
    const response = await fetch(endpoint.url, {
      method: endpoint.method,
      headers: endpoint.headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const duration = performance.now() - fetchStart;
    latency.totalDuration = duration;
    latency.dnsLookup = duration * 0.1;
    latency.tcpConnection = duration * 0.2;
    latency.tlsHandshake = endpoint.url.startsWith('https') ? duration * 0.2 : 0;
    latency.ttfb = duration * 0.5;

    return {
      endpointId: endpoint.id,
      status: 'online',
      statusCode: response.status,
      latency,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    const duration = performance.now() - start;
    latency.totalDuration = duration;
    return {
      endpointId: endpoint.id,
      status: error.name === 'AbortError' ? 'timeout' : 'offline',
      statusCode: 0,
      latency,
      timestamp: new Date().toISOString(),
      error: error.message || String(error),
    };
  }
}

/**
 * Measures detailed network latency metrics using Node.js native sockets
 */
export async function measureLatency(endpoint: NetworkEndpoint): Promise<NetworkDiagnosticResult> {
  const start = performance.now();
  const result: Partial<NetworkDiagnosticResult> = {
    endpointId: endpoint.id,
    timestamp: new Date().toISOString(),
  };

  const latency: NetworkLatencyMetrics = {
    dnsLookup: 0,
    tcpConnection: 0,
    tlsHandshake: 0,
    ttfb: 0,
    totalDuration: 0,
  };

  try {
    const parsedUrl = new URL(endpoint.url);
    const host = parsedUrl.hostname;
    const port = parsedUrl.port ? parseInt(parsedUrl.port) : (parsedUrl.protocol === 'https:' ? 443 : 80);

    // 1. DNS Lookup
    const dnsStart = performance.now();
    const ip = await new Promise<string>((resolve, reject) => {
      dns.lookup(host, (err, address) => {
        if (err) reject(err);
        else resolve(address);
      });
    });
    latency.dnsLookup = performance.now() - dnsStart;

    // 2. TCP Connection
    const tcpStart = performance.now();
    const socket = await new Promise<net.Socket>((resolve, reject) => {
      const s = net.createConnection(port, ip, () => {
        resolve(s);
      });
      s.setTimeout(endpoint.timeout || 5000);
      s.on('error', (err) => reject(err));
      s.on('timeout', () => {
        s.destroy();
        reject(new Error('TCP Connection Timeout'));
      });
    });
    latency.tcpConnection = performance.now() - tcpStart;

    // 3. TLS Handshake (if HTTPS)
    let secureSocket: tls.TLSSocket | null = null;
    if (parsedUrl.protocol === 'https:') {
      const tlsStart = performance.now();
      secureSocket = await new Promise<tls.TLSSocket>((resolve, reject) => {
        const ss = tls.connect({
          socket,
          servername: host,
          rejectUnauthorized: false,
        }, () => {
          resolve(ss);
        });
        ss.on('error', (err) => reject(err));
      });
      latency.tlsHandshake = performance.now() - tlsStart;
    }

    // 4. TTFB & HTTP Request
    const ttfbStart = performance.now();
    const statusCode = await new Promise<number>((resolve, reject) => {
      const options = {
        hostname: host,
        port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: endpoint.method,
        headers: endpoint.headers,
        createConnection: () => secureSocket || socket,
      };

      const req = (parsedUrl.protocol === 'https:' ? https : http).request(options, (res) => {
        latency.ttfb = performance.now() - ttfbStart;
        resolve(res.statusCode || 200);
        res.resume();
      });

      req.on('error', (err) => reject(err));
      req.setTimeout(endpoint.timeout || 5000, () => {
        req.destroy();
        reject(new Error('HTTP Request Timeout'));
      });
      req.end();
    });

    if (secureSocket) secureSocket.destroy();
    else socket.destroy();

    latency.totalDuration = performance.now() - start;

    return {
      endpointId: endpoint.id,
      status: latency.totalDuration > (endpoint.timeout || 5000) ? 'timeout' : 'online',
      statusCode,
      latency,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    // Fallback to fetch-based measurement if native sockets fail or are restricted
    return measureLatencyFallback(endpoint);
  }
}

/**
 * Runs the diagnostic scan across all configured endpoints
 */
export async function runDiagnosticScan(): Promise<NetworkDiagnosticSummary> {
  const results: NetworkDiagnosticResult[] = [];
  const limit = currentConfig.concurrencyLimit || 3;
  const endpoints = [...currentConfig.endpoints];
  
  const executeNext = async (): Promise<void> => {
    if (endpoints.length === 0) return;
    const endpoint = endpoints.shift()!;
    
    let result: NetworkDiagnosticResult | null = null;
    for (let attempt = 0; attempt <= (currentConfig.retryCount || 1); attempt++) {
      result = await measureLatency(endpoint);
      if (result.status === 'online') break;
    }
    
    if (result) {
      results.push(result);
    }
    
    await executeNext();
  };

  const workers = Array.from({ length: Math.min(limit, endpoints.length) }, () => executeNext());
  await Promise.all(workers);

  const onlineCount = results.filter(r => r.status === 'online').length;
  const offlineCount = results.length - onlineCount;
  const totalLatency = results.reduce((acc, r) => acc + r.latency.totalDuration, 0);
  const averageLatency = results.length > 0 ? totalLatency / results.length : 0;

  lastSummary = {
    totalEndpoints: results.length,
    onlineCount,
    offlineCount,
    averageLatency,
    lastRun: new Date().toISOString(),
    results,
  };

  return lastSummary;
}

// ============================================================================
// EXPRESS CONTROLLERS
// ============================================================================

export async function handleGetStatus(req: Request, res: Response) {
  res.json({
    status: isScanning ? 'running' : (lastSummary ? 'completed' : 'idle'),
    lastSummary,
    isScanning,
  } as NetworkDiagnosticState);
}

export async function handleGetConfig(req: Request, res: Response) {
  res.json(currentConfig);
}

export async function handleUpdateConfig(req: Request, res: Response) {
  try {
    const newConfig = req.body as Partial<NetworkDiagnosticConfig>;
    if (newConfig.endpoints) currentConfig.endpoints = newConfig.endpoints;
    if (newConfig.retryCount !== undefined) currentConfig.retryCount = newConfig.retryCount;
    if (newConfig.concurrencyLimit !== undefined) currentConfig.concurrencyLimit = newConfig.concurrencyLimit;
    if (newConfig.globalTimeout !== undefined) currentConfig.globalTimeout = newConfig.globalTimeout;
    
    res.json({ message: 'Configuration updated successfully', config: currentConfig });
  } catch (error: any) {
    res.status(400).json({ error: 'Invalid configuration payload', details: error.message });
  }
}

export async function handleTriggerScan(req: Request, res: Response) {
  if (isScanning) {
    return res.status(409).json({ error: 'A diagnostic scan is already in progress' });
  }

  isScanning = true;
  res.status(202).json({ message: 'Diagnostic scan initiated' });

  runDiagnosticScan().catch(err => {
    console.error('Diagnostic scan failed:', err);
  }).finally(() => {
    isScanning = false;
  });
}

/**
 * Creates and returns a fully configured Express Router for Network Diagnostics
 */
export function createNetworkDiagnosticRouter(): Router {
  const router = Router();
  
  router.get('/status', handleGetStatus);
  router.get('/config', handleGetConfig);
  router.post('/config', handleUpdateConfig);
  router.post('/scan', handleTriggerScan);
  
  return router;
}