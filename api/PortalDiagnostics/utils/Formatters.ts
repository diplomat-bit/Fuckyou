/**
 * Portal Diagnostics Formatting Utilities & API Routes
 * Utility functions to format diagnostic data, system metrics, logs, and telemetry into human-readable outputs,
 * combined with a fully-featured Express API router to expose these formatting capabilities as microservices.
 */

import { Router, Request, Response, NextFunction } from 'express';

export interface HealthGrade {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  color: string;
  badgeClass: string;
}

export interface StatusStyle {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  indicatorColor: string;
}

export type DiagnosticSeverity = 'critical' | 'error' | 'warning' | 'info' | 'debug' | 'trace';

/**
 * Formats bytes into a human-readable string (e.g., "12.45 MB").
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  if (!Number.isFinite(bytes) || bytes < 0) return 'N/A';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${value} ${sizes[i]}`;
}

/**
 * Formats duration in milliseconds into human-readable text (e.g., "2h 14m 32s 450ms").
 */
export function formatDuration(ms: number, detailed: boolean = false): string {
  if (!Number.isFinite(ms) || ms < 0) return '0ms';

  if (ms < 1) {
    return `${(ms * 1000).toFixed(0)}µs`;
  }

  if (ms < 1000 && !detailed) {
    return `${Math.round(ms)}ms`;
  }

  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const remainingMs = Math.round(ms % 1000);

  const parts: string[] = [];

  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);
  if (detailed && remainingMs > 0) parts.push(`${remainingMs}ms`);

  if (parts.length === 0) return `${ms.toFixed(2)}ms`;

  return parts.join(' ');
}

/**
 * Formats a latency value with context-aware precision and threshold coloring hints.
 */
export function formatLatency(ms: number): { formatted: string; category: 'optimal' | 'acceptable' | 'degraded' | 'critical' } {
  const formatted = formatDuration(ms);
  let category: 'optimal' | 'acceptable' | 'degraded' | 'critical' = 'optimal';

  if (ms > 2000) {
    category = 'critical';
  } else if (ms > 800) {
    category = 'degraded';
  } else if (ms > 200) {
    category = 'acceptable';
  }

  return { formatted, category };
}

/**
 * Formats timestamps into ISO strings or human-readable relative/absolute strings.
 */
export function formatTimestamp(
  timestamp: Date | string | number | null | undefined,
  options: { relative?: boolean; includeMs?: boolean } = {}
): string {
  if (!timestamp) return 'N/A';

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Invalid Date';

  if (options.relative) {
    return formatRelativeTime(date);
  }

  const iso = date.toISOString();
  if (options.includeMs) {
    return iso.replace('T', ' ').replace('Z', ' UTC');
  }

  return iso.split('.')[0].replace('T', ' ') + ' UTC';
}

/**
 * Returns a human-friendly relative time string (e.g., "5 minutes ago", "in 10 seconds").
 */
export function formatRelativeTime(date: Date, baseDate: Date = new Date()): string {
  const diffMs = baseDate.getTime() - date.getTime();
  const absMs = Math.abs(diffMs);
  const isPast = diffMs >= 0;

  const seconds = Math.floor(absMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let result = '';
  if (seconds < 5) {
    return 'just now';
  } else if (seconds < 60) {
    result = `${seconds}s`;
  } else if (minutes < 60) {
    result = `${minutes}m`;
  } else if (hours < 24) {
    result = `${hours}h`;
  } else {
    result = `${days}d`;
  }

  return isPast ? `${result} ago` : `in ${result}`;
}

/**
 * Formats percentage numbers with custom rounding and optional sign indicators.
 */
export function formatPercentage(value: number, decimals: number = 2, showSign: boolean = false): string {
  if (!Number.isFinite(value)) return '0.00%';

  const formatted = value.toFixed(decimals);
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${formatted}%`;
}

/**
 * Formats diagnostic metrics (e.g. CPU, memory, RPS) with auto-scaling units.
 */
export function formatMetricValue(value: number, unit: string = '', precision: number = 2): string {
  if (!Number.isFinite(value)) return `0 ${unit}`.trim();

  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(precision)} B ${unit}`.trim();
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(precision)} M ${unit}`.trim();
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(precision)} K ${unit}`.trim();
  }

  return `${value.toFixed(precision)} ${unit}`.trim();
}

/**
 * Formats memory profile information into a coherent operational summary string.
 */
export function formatMemoryUsage(heapUsed: number, heapTotal: number, rss?: number): string {
  const usedFormatted = formatBytes(heapUsed);
  const totalFormatted = formatBytes(heapTotal);
  const pct = heapTotal > 0 ? formatPercentage((heapUsed / heapTotal) * 100, 1) : '0%';

  let summary = `Heap: ${usedFormatted} / ${totalFormatted} (${pct})`;
  if (rss !== undefined) {
    summary += ` | RSS: ${formatBytes(rss)}`;
  }

  return summary;
}

/**
 * Provides status badges and UI colors based on system status codes or severity levels.
 */
export function formatStatusBadge(status: string | number): StatusStyle {
  const key = String(status).toLowerCase();

  switch (key) {
    case '200':
    case 'ok':
    case 'healthy':
    case 'active':
    case 'passed':
    case 'success':
      return {
        label: key.toUpperCase(),
        color: '#10B981',
        bgColor: '#D1FAE5',
        borderColor: '#A7F3D0',
        indicatorColor: '#059669',
      };

    case '201':
    case 'created':
      return {
        label: 'CREATED',
        color: '#059669',
        bgColor: '#ECFDF5',
        borderColor: '#6EE7B7',
        indicatorColor: '#047857',
      };

    case '400':
    case 'bad_request':
    case 'warning':
    case 'degraded':
    case 'warn':
      return {
        label: key.toUpperCase(),
        color: '#D97706',
        bgColor: '#FEF3C7',
        borderColor: '#FDE68A',
        indicatorColor: '#B45309',
      };

    case '401':
    case '403':
    case 'unauthorized':
    case 'forbidden':
      return {
        label: key.toUpperCase(),
        color: '#7C3AED',
        bgColor: '#EDE9FE',
        borderColor: '#DDD6FE',
        indicatorColor: '#6D28D9',
      };

    case '404':
    case 'not_found':
      return {
        label: 'NOT FOUND',
        color: '#6B7280',
        bgColor: '#F3F4F6',
        borderColor: '#E5E7EB',
        indicatorColor: '#4B5563',
      };

    case '500':
    case '502':
    case '503':
    case '504':
    case 'error':
    case 'unhealthy':
    case 'failed':
    case 'critical':
      return {
        label: key.toUpperCase(),
        color: '#DC2626',
        bgColor: '#FEE2E2',
        borderColor: '#FCA5A5',
        indicatorColor: '#B91C1C',
      };

    default:
      return {
        label: key.toUpperCase(),
        color: '#4B5563',
        bgColor: '#F3F4F6',
        borderColor: '#E5E7EB',
        indicatorColor: '#374151',
      };
  }
}

/**
 * Formats an HTTP status code with its standard status text phrase.
 */
export function formatHttpStatus(statusCode: number): string {
  const phrases: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    204: 'No Content',
    301: 'Moved Permanently',
    302: 'Found',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    408: 'Request Timeout',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };

  const phrase = phrases[statusCode] || 'Unknown Status';
  return `${statusCode} ${phrase}`;
}

/**
 * Computes a standardized letter grade and color token for system health scores (0-100).
 */
export function formatHealthScore(score: number): HealthGrade {
  const clampedScore = Math.max(0, Math.min(100, score));

  if (clampedScore >= 95) {
    return { score: clampedScore, grade: 'A+', color: '#10B981', badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
  }
  if (clampedScore >= 85) {
    return { score: clampedScore, grade: 'A', color: '#059669', badgeClass: 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20' };
  }
  if (clampedScore >= 70) {
    return { score: clampedScore, grade: 'B', color: '#3B82F6', badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
  }
  if (clampedScore >= 55) {
    return { score: clampedScore, grade: 'C', color: '#F59E0B', badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
  }
  if (clampedScore >= 40) {
    return { score: clampedScore, grade: 'D', color: '#EF4444', badgeClass: 'bg-red-500/10 text-red-500 border-red-500/20' };
  }
  return { score: clampedScore, grade: 'F', color: '#7F1D1D', badgeClass: 'bg-red-900/10 text-red-700 border-red-900/20' };
}

/**
 * Truncates long strings with ellipsis, ideal for stack traces or payload previews.
 */
export function truncateString(str: string, maxLength: number = 100): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength - 3)}...`;
}

/**
 * Formats errors into structured, clean readable string representations.
 */
export function formatErrorStackTrace(error: unknown): string {
  if (!error) return 'No error details provided';

  if (error instanceof Error) {
    if (error.stack) {
      return error.stack;
    }
    return `${error.name}: ${error.message}`;
  }

  if (typeof error === 'object') {
    try {
      return JSON.stringify(error, null, 2);
    } catch {
      return String(error);
    }
  }

  return String(error);
}

/**
 * Safely formats any object or payload as pretty JSON with circular reference protection.
 */
export function formatJsonPretty(data: unknown, indent: number = 2): string {
  const cache = new Set();
  try {
    return JSON.stringify(
      data,
      (_key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (cache.has(value)) {
            return '[Circular Reference]';
          }
          cache.add(value);
        }
        return value;
      },
      indent
    );
  } catch (err) {
    return `[Failed to stringify object: ${err instanceof Error ? err.message : String(err)}]`;
  }
}

/**
 * Formats a key-value record into clean console/diagnostic output lines.
 */
export function formatKeyValuePairs(data: Record<string, unknown>, prefix: string = '  '): string {
  if (!data || Object.keys(data).length === 0) {
    return `${prefix}(empty)`;
  }

  return Object.entries(data)
    .map(([key, value]) => {
      let formattedValue = '';
      if (typeof value === 'object' && value !== null) {
        formattedValue = JSON.stringify(value);
      } else {
        formattedValue = String(value);
      }
      return `${prefix}${key}: ${formattedValue}`;
    })
    .join('\n');
}

/**
 * Generates an ASCII header block for terminal outputs and diagnostics logs.
 */
export function formatDiagnosticReportHeader(
  title: string,
  environment: string,
  timestamp: Date = new Date()
): string {
  const border = '='.repeat(70);
  const formattedTime = formatTimestamp(timestamp, { includeMs: true });

  return [
    border,
    ` DIAGNOSTIC REPORT: ${title.toUpperCase()}`,
    ` ENVIRONMENT:       ${environment.toUpperCase()}`,
    ` GENERATED AT:      ${formattedTime}`,
    border,
  ].join('\n');
}

/**
 * Formats tabular key-value data with proper padding and alignment for terminal rendering.
 */
export function formatTableColumns(rows: Array<Record<string, string | number>>): string {
  if (!rows || rows.length === 0) return '';

  const headers = Object.keys(rows[0]);
  const columnWidths: Record<string, number> = {};

  headers.forEach((h) => {
    columnWidths[h] = h.length;
  });

  rows.forEach((row) => {
    headers.forEach((h) => {
      const val = String(row[h] ?? '');
      if (val.length > (columnWidths[h] || 0)) {
        columnWidths[h] = val.length;
      }
    });
  });

  const headerLine = headers.map((h) => h.padEnd(columnWidths[h] + 2)).join('');
  const separator = headers.map((h) => '-'.repeat(columnWidths[h]).padEnd(columnWidths[h] + 2)).join('');

  const dataLines = rows.map((row) => {
    return headers.map((h) => String(row[h] ?? '').padEnd(columnWidths[h] + 2)).join('');
  });

  return [headerLine, separator, ...dataLines].join('\n');
}

// ============================================================================
// API ROUTES & CONTROLLER INTEGRATION
// ============================================================================

export const formatterRouter = Router();

// Helper to handle async route errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * @route GET /api/diagnostics/formatters/health
 * @desc Check the health of the formatting service
 */
formatterRouter.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Portal Diagnostics Formatters API',
    endpoints: [
      '/bytes',
      '/duration',
      '/latency',
      '/timestamp',
      '/percentage',
      '/metric',
      '/memory',
      '/status-badge',
      '/http-status',
      '/health-score',
      '/truncate',
      '/json-pretty',
      '/key-value',
      '/report-header',
      '/table'
    ]
  });
});

/**
 * @route POST /api/diagnostics/formatters/bytes
 * @desc Format bytes into human-readable string
 */
formatterRouter.post('/bytes', (req: Request, res: Response) => {
  const { bytes, decimals } = req.body;
  if (bytes === undefined || typeof bytes !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid parameter: bytes (number)' });
  }
  const result = formatBytes(bytes, decimals);
  res.json({ input: bytes, formatted: result });
});

/**
 * @route POST /api/diagnostics/formatters/duration
 * @desc Format duration in milliseconds
 */
formatterRouter.post('/duration', (req: Request, res: Response) => {
  const { ms, detailed } = req.body;
  if (ms === undefined || typeof ms !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid parameter: ms (number)' });
  }
  const result = formatDuration(ms, !!detailed);
  res.json({ input: ms, formatted: result });
});

/**
 * @route POST /api/diagnostics/formatters/latency
 * @desc Format latency with category classification
 */
formatterRouter.post('/latency', (req: Request, res: Response) => {
  const { ms } = req.body;
  if (ms === undefined || typeof ms !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid parameter: ms (number)' });
  }
  const result = formatLatency(ms);
  res.json({ input: ms, ...result });
});

/**
 * @route POST /api/diagnostics/formatters/timestamp
 * @desc Format timestamp with relative/absolute options
 */
formatterRouter.post('/timestamp', (req: Request, res: Response) => {
  const { timestamp, relative, includeMs } = req.body;
  const result = formatTimestamp(timestamp, { relative, includeMs });
  res.json({ input: timestamp, formatted: result });
});

/**
 * @route POST /api/diagnostics/formatters/percentage
 * @desc Format percentage with custom rounding
 */
formatterRouter.post('/percentage', (req: Request, res: Response) => {
  const { value, decimals, showSign } = req.body;
  if (value === undefined || typeof value !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid parameter: value (number)' });
  }
  const result = formatPercentage(value, decimals, showSign);
  res.json({ input: value, formatted: result });
});

/**
 * @route POST /api/diagnostics/formatters/metric
 * @desc Format metric value with auto-scaling units
 */
formatterRouter.post('/metric', (req: Request, res: Response) => {
  const { value, unit, precision } = req.body;
  if (value === undefined || typeof value !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid parameter: value (number)' });
  }
  const result = formatMetricValue(value, unit, precision);
  res.json({ input: value, formatted: result });
});

/**
 * @route POST /api/diagnostics/formatters/memory
 * @desc Format memory usage summary
 */
formatterRouter.post('/memory', (req: Request, res: Response) => {
  const { heapUsed, heapTotal, rss } = req.body;
  if (heapUsed === undefined || typeof heapUsed !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid parameter: heapUsed (number)' });
  }
  if (heapTotal === undefined || typeof heapTotal !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid parameter: heapTotal (number)' });
  }
  const result = formatMemoryUsage(heapUsed, heapTotal, rss);
  res.json({ heapUsed, heapTotal, rss, formatted: result });
});

/**
 * @route POST /api/diagnostics/formatters/status-badge
 * @desc Get status badge styling for a status code or string
 */
formatterRouter.post('/status-badge', (req: Request, res: Response) => {
  const { status } = req.body;
  if (status === undefined) {
    return res.status(400).json({ error: 'Missing parameter: status' });
  }
  const result = formatStatusBadge(status);
  res.json({ status, badge: result });
});

/**
 * @route POST /api/diagnostics/formatters/http-status
 * @desc Format HTTP status code with standard phrase
 */
formatterRouter.post('/http-status', (req: Request, res: Response) => {
  const { statusCode } = req.body;
  if (statusCode === undefined || typeof statusCode !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid parameter: statusCode (number)' });
  }
  const result = formatHttpStatus(statusCode);
  res.json({ statusCode, formatted: result });
});

/**
 * @route POST /api/diagnostics/formatters/health-score
 * @desc Compute letter grade and color token for health score
 */
formatterRouter.post('/health-score', (req: Request, res: Response) => {
  const { score } = req.body;
  if (score === undefined || typeof score !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid parameter: score (number)' });
  }
  const result = formatHealthScore(score);
  res.json({ score, healthGrade: result });
});

/**
 * @route POST /api/diagnostics/formatters/truncate
 * @desc Truncate long string with ellipsis
 */
formatterRouter.post('/truncate', (req: Request, res: Response) => {
  const { text, maxLength } = req.body;
  if (text === undefined || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid parameter: text (string)' });
  }
  const result = truncateString(text, maxLength);
  res.json({ originalLength: text.length, truncated: result });
});

/**
 * @route POST /api/diagnostics/formatters/json-pretty
 * @desc Safely format any object as pretty JSON
 */
formatterRouter.post('/json-pretty', (req: Request, res: Response) => {
  const { data, indent } = req.body;
  if (data === undefined) {
    return res.status(400).json({ error: 'Missing parameter: data' });
  }
  const result = formatJsonPretty(data, indent);
  res.json({ formatted: result });
});

/**
 * @route POST /api/diagnostics/formatters/key-value
 * @desc Format key-value record into clean console lines
 */
formatterRouter.post('/key-value', (req: Request, res: Response) => {
  const { data, prefix } = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Missing or invalid parameter: data (object)' });
  }
  const result = formatKeyValuePairs(data, prefix);
  res.json({ formatted: result });
});

/**
 * @route POST /api/diagnostics/formatters/report-header
 * @desc Generate ASCII header block for diagnostic reports
 */
formatterRouter.post('/report-header', (req: Request, res: Response) => {
  const { title, environment, timestamp } = req.body;
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid parameter: title (string)' });
  }
  if (!environment || typeof environment !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid parameter: environment (string)' });
  }
  const parsedTime = timestamp ? new Date(timestamp) : new Date();
  const result = formatDiagnosticReportHeader(title, environment, parsedTime);
  res.json({ formatted: result });
});

/**
 * @route POST /api/diagnostics/formatters/table
 * @desc Format tabular key-value data with proper padding
 */
formatterRouter.post('/table', (req: Request, res: Response) => {
  const { rows } = req.body;
  if (!rows || !Array.isArray(rows)) {
    return res.status(400).json({ error: 'Missing or invalid parameter: rows (array of objects)' });
  }
  const result = formatTableColumns(rows);
  res.json({ formatted: result });
});

export default formatterRouter;