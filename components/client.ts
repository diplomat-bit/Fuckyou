

// --- CONSOLIDATED FROM: ./api/client.ts ---

/**
 * @file api/client.ts
 * @module ApiClient
 * @version 1.0.0-enterprise.orchestration.stage-1
 * @description Master-Class Enterprise Resilience HTTP Gateway & Universal API Protocol Engine.
 * Features full-stack zero-trust security guardrails, circuit breakers, adaptive retry policies,
 * multi-tier telemetry, cryptographic request deduplication, distributed caching, and dynamic token lifecycle managers.
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
  Canceler,
  CancelTokenSource,
  HeadersDefaults,
  RawAxiosRequestHeaders,
  RawAxiosResponseHeaders,
  AxiosHeaders
} from 'axios';

// ============================================================================
// SECTION 1: GLOBAL CONSTANTS & ARCHITECTURAL ENUMS
// ============================================================================

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PURGE = 'PURGE'
}

export enum HttpStatus {
  CONTINUE = 100,
  SWITCHING_PROTOCOLS = 101,
  PROCESSING = 102,
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NON_AUTHORITATIVE_INFORMATION = 203,
  NO_CONTENT = 204,
  RESET_CONTENT = 205,
  PARTIAL_CONTENT = 206,
  MULTI_STATUS = 207,
  ALREADY_REPORTED = 208,
  IM_USED = 226,
  MULTIPLE_CHOICES = 300,
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  USE_PROXY = 305,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  PROXY_AUTHENTICATION_REQUIRED = 407,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  URI_TOO_LONG = 414,
  UNSUPPORTED_MEDIA_TYPE = 415,
  RANGE_NOT_SATISFIABLE = 416,
  EXPECTATION_FAILED = 417,
  IM_A_TEAPOT = 418,
  MISDIRECTED_REQUEST = 421,
  UNPROCESSABLE_ENTITY = 422,
  LOCKED = 423,
  FAILED_DEPENDENCY = 424,
  TOO_EARLY = 425,
  UPGRADE_REQUIRED = 426,
  PRECONDITION_REQUIRED = 428,
  TOO_MANY_REQUESTS = 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
  UNAVAILABLE_FOR_LEGAL_REASONS = 451,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505,
  VARIANT_ALSO_NEGOTIATES = 506,
  INSUFFICIENT_STORAGE = 507,
  LOOP_DETECTED = 508,
  NOT_EXTENDED = 510,
  NETWORK_AUTHENTICATION_REQUIRED = 511
}

export enum EnvironmentMode {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
  LOCAL = 'local',
  UNKNOWN = 'unknown'
}

export enum CacheStrategy {
  NO_CACHE = 'NO_CACHE',
  NETWORK_ONLY = 'NETWORK_ONLY',
  CACHE_FIRST = 'CACHE_FIRST',
  NETWORK_FIRST = 'NETWORK_FIRST',
  STALE_WHILE_REVALIDATE = 'STALE_WHILE_REVALIDATE'
}

export enum RetryBackoffStrategy {
  FIXED = 'FIXED',
  LINEAR = 'LINEAR',
  EXPONENTIAL = 'EXPONENTIAL',
  EXPONENTIAL_WITH_JITTER = 'EXPONENTIAL_WITH_JITTER',
  FIBONACCI = 'FIBONACCI'
}

export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  HALF_OPEN = 'HALF_OPEN',
  OPEN = 'OPEN',
  FORCED_CLOSED = 'FORCED_CLOSED',
  FORCED_OPEN = 'FORCED_OPEN'
}

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
  SILENT = 6
}

export enum TelemetryEventType {
  REQUEST_START = 'REQUEST_START',
  REQUEST_SUCCESS = 'REQUEST_SUCCESS',
  REQUEST_FAILURE = 'REQUEST_FAILURE',
  RETRY_ATTEMPT = 'RETRY_ATTEMPT',
  CACHE_HIT = 'CACHE_HIT',
  CACHE_MISS = 'CACHE_MISS',
  CACHE_PUT = 'CACHE_PUT',
  CACHE_EVICT = 'CACHE_EVICT',
  CIRCUIT_OPENED = 'CIRCUIT_OPENED',
  CIRCUIT_CLOSED = 'CIRCUIT_CLOSED',
  CIRCUIT_HALF_OPEN = 'CIRCUIT_HALF_OPEN',
  TOKEN_REFRESH_START = 'TOKEN_REFRESH_START',
  TOKEN_REFRESH_SUCCESS = 'TOKEN_REFRESH_SUCCESS',
  TOKEN_REFRESH_FAILURE = 'TOKEN_REFRESH_FAILURE',
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  RATE_LIMITED = 'RATE_LIMITED'
}

// ============================================================================
// SECTION 2: ERROR TAXONOMY & EXHAUSTIVE EXCEPTION HIERARCHY
// ============================================================================

export interface ApiClientErrorContext {
  requestId?: string;
  correlationId?: string;
  traceId?: string;
  spanId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  statusText?: string;
  requestHeaders?: Record<string, unknown>;
  responseHeaders?: Record<string, unknown>;
  timestamp: string;
  durationMs?: number;
  retryAttempts?: number;
  clientVersion: string;
  payload?: unknown;
  rawError?: unknown;
  [key: string]: unknown;
}

export class ApiClientError extends Error {
  public readonly name: string = 'ApiClientError';
  public readonly isApiClientError: boolean = true;
  public readonly context: ApiClientErrorContext;
  public readonly timestamp: Date;
  public readonly code: string;

  constructor(message: string, code: string = 'API_CLIENT_GENERIC_ERROR', context: Partial<ApiClientErrorContext> = {}) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.code = code;
    this.timestamp = new Date();
    this.context = {
      timestamp: this.timestamp.toISOString(),
      clientVersion: '1.0.0-enterprise',
      ...context
    };
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      stack: this.stack,
      context: this.context,
      timestamp: this.timestamp.toISOString()
    };
  }
}

export class NetworkError extends ApiClientError {
  public readonly name: string = 'NetworkError';
  constructor(message: string = 'Network connectivity failure or host unreachable', context: Partial<ApiClientErrorContext> = {}) {
    super(message, 'NETWORK_UNAVAILABLE', context);
  }
}

export class TimeoutError extends ApiClientError {
  public readonly name: string = 'TimeoutError';
  public readonly timeoutMs: number;
  constructor(timeoutMs: number, message?: string, context: Partial<ApiClientErrorContext> = {}) {
    super(message ?? `Request timed out after ${timeoutMs}ms`, 'REQUEST_TIMEOUT', { ...context, timeoutMs });
    this.timeoutMs = timeoutMs;
  }
}

export class HttpError<TBody = unknown> extends ApiClientError {
  public readonly name: string = 'HttpError';
  public readonly statusCode: number;
  public readonly statusText: string;
  public readonly responseBody: TBody;

  constructor(statusCode: number, statusText: string, responseBody: TBody, context: Partial<ApiClientErrorContext> = {}) {
    super(`HTTP Error ${statusCode}: ${statusText}`, `HTTP_${statusCode}`, {
      ...context,
      statusCode,
      statusText
    });
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.responseBody = responseBody;
  }
}

export class AuthenticationError extends HttpError {
  public readonly name: string = 'AuthenticationError';
  public readonly isTokenExpired: boolean;

  constructor(message: string = 'Authentication failed or session expired', isTokenExpired: boolean = false, context: Partial<ApiClientErrorContext> = {}) {
    super(HttpStatus.UNAUTHORIZED, 'Unauthorized', { message, isTokenExpired }, context);
    this.isTokenExpired = isTokenExpired;
  }
}

export class AuthorizationError extends HttpError {
  public readonly name: string = 'AuthorizationError';
  constructor(message: string = 'Access forbidden to requested resource', context: Partial<ApiClientErrorContext> = {}) {
    super(HttpStatus.FORBIDDEN, 'Forbidden', { message }, context);
  }
}

export class RateLimitError extends HttpError {
  public readonly name: string = 'RateLimitError';
  public readonly retryAfterSeconds: number | null;
  public readonly rateLimitLimit: number | null;
  public readonly rateLimitRemaining: number | null;
  public readonly rateLimitReset: number | null;

  constructor(
    retryAfterSeconds: number | null,
    rateLimitLimit: number | null = null,
    rateLimitRemaining: number | null = null,
    rateLimitReset: number | null = null,
    context: Partial<ApiClientErrorContext> = {}
  ) {
    super(HttpStatus.TOO_MANY_REQUESTS, 'Too Many Requests', { retryAfterSeconds, rateLimitLimit, rateLimitRemaining, rateLimitReset }, context);
    this.retryAfterSeconds = retryAfterSeconds;
    this.rateLimitLimit = rateLimitLimit;
    this.rateLimitRemaining = rateLimitRemaining;
    this.rateLimitReset = rateLimitReset;
  }
}

export class ValidationError extends HttpError {
  public readonly name: string = 'ValidationError';
  public readonly validationErrors: Array<{ field?: string; message: string; code?: string; value?: unknown }>;

  constructor(
    validationErrors: Array<{ field?: string; message: string; code?: string; value?: unknown }>,
    context: Partial<ApiClientErrorContext> = {}
  ) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, 'Unprocessable Entity', { validationErrors }, context);
    this.validationErrors = validationErrors;
  }
}

export class CircuitBreakerOpenError extends ApiClientError {
  public readonly name: string = 'CircuitBreakerOpenError';
  public readonly serviceKey: string;
  public readonly resetTimeoutMs: number;

  constructor(serviceKey: string, resetTimeoutMs: number, context: Partial<ApiClientErrorContext> = {}) {
    super(`Circuit breaker for [${serviceKey}] is currently OPEN. Request short-circuited.`, 'CIRCUIT_BREAKER_OPEN', {
      ...context,
      serviceKey,
      resetTimeoutMs
    });
    this.serviceKey = serviceKey;
    this.resetTimeoutMs = resetTimeoutMs;
  }
}

export class SecurityIntegrityError extends ApiClientError {
  public readonly name: string = 'SecurityIntegrityError';
  public readonly violationRule: string;

  constructor(violationRule: string, message: string = 'Security guardrail violation triggered', context: Partial<ApiClientErrorContext> = {}) {
    super(message, 'SECURITY_VIOLATION', { ...context, violationRule });
    this.violationRule = violationRule;
  }
}

export class SerializationError extends ApiClientError {
  public readonly name: string = 'SerializationError';
  constructor(message: string, context: Partial<ApiClientErrorContext> = {}) {
    super(message, 'SERIALIZATION_FAILED', context);
  }
}

export class RequestDeduplicationCancelledError extends ApiClientError {
  public readonly name: string = 'RequestDeduplicationCancelledError';
  constructor(message: string = 'Request cancelled because an identical inflight operation succeeded', context: Partial<ApiClientErrorContext> = {}) {
    super(message, 'REQUEST_DEDUPLICATED', context);
  }
}

// ============================================================================
// SECTION 3: SYSTEM INTERFACES, METADATA & TELEMETRY PROTOCOLS
// ============================================================================

export interface RequestSpanMetrics {
  startTime: number;
  dnsLookupMs?: number;
  tcpHandshakeMs?: number;
  tlsNegotiationMs?: number;
  timeToFirstByteMs?: number;
  totalDurationMs?: number;
  uploadBytes?: number;
  downloadBytes?: number;
}

export interface SecurityPolicyConfig {
  allowedDomains: string[];
  allowSubdomains: boolean;
  blockLocalhostInProduction: boolean;
  enforceHttps: boolean;
  stripSensitiveHeadersOnRedirect: boolean;
  sensitiveHeaderKeys: string[];
  maxPayloadSizeBytes: number;
  preventCrossDomainTokenLeakage: boolean;
}

export interface TelemetrySpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  tags: Record<string, string | number | boolean>;
  events: Array<{ name: string; timestamp: number; attributes?: Record<string, unknown> }>;
  status: 'UNSET' | 'OK' | 'ERROR';
  errorDetails?: { message: string; stack?: string; code?: string };
}

export interface ITelemetryExporter {
  exportSpan(span: TelemetrySpan): Promise<void> | void;
  exportMetric(eventName: TelemetryEventType, attributes: Record<string, unknown>): Promise<void> | void;
  flush(): Promise<void> | void;
}

export interface CacheEntry<T = unknown> {
  key: string;
  data: T;
  headers: Record<string, string>;
  status: number;
  statusText: string;
  cachedAt: number;
  ttlMs: number;
  staleWhileRevalidateMs: number;
  etag?: string;
  lastModified?: string;
  hits: number;
}

export interface ICacheAdapter {
  get<T = unknown>(key: string): Promise<CacheEntry<T> | null> | CacheEntry<T> | null;
  set<T = unknown>(key: string, entry: CacheEntry<T>): Promise<void> | void;
  delete(key: string): Promise<boolean> | boolean;
  clear(): Promise<void> | void;
  prune(): Promise<number> | number;
  has(key: string): Promise<boolean> | boolean;
  size(): Promise<number> | number;
}

export interface CircuitMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  consecutiveFailures: number;
  lastFailureTimestamp: number;
  lastSuccessTimestamp: number;
  lastStateChangeTimestamp: number;
  windowBuckets: Array<{
    timestamp: number;
    successes: number;
    failures: number;
    timeouts: number;
    shortCircuits: number;
  }>;
}

export interface ICircuitBreakerConfig {
  failureThresholdPercentage: number;
  minimumRequestsInWindow: number;
  rollingWindowMs: number;
  sleepWindowMs: number;
  halfOpenMaxPermits: number;
  failurePredicate?: (error: unknown) => boolean;
  onStateChange?: (from: CircuitBreakerState, to: CircuitBreakerState, serviceKey: string) => void;
}

export interface RetryPolicyConfig {
  maxRetries: number;
  backoffStrategy: RetryBackoffStrategy;
  initialIntervalMs: number;
  maxIntervalMs: number;
  backoffMultiplier: number;
  jitterFactor: number;
  retryOnStatus: number[];
  retryOnNetworkErrors: boolean;
  retryOnTimeouts: boolean;
  retryCondition?: (error: unknown, attempt: number) => boolean;
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
}

export interface TokenRefreshResult {
  accessToken: string;
  refreshToken?: string;
  expiresInSeconds?: number;
  tokenType?: string;
}

export interface ITokenVault {
  getAccessToken(): Promise<string | null> | string | null;
  getRefreshToken(): Promise<string | null> | string | null;
  setTokens(tokens: TokenRefreshResult): Promise<void> | void;
  clearTokens(): Promise<void> | void;
  isTokenExpired(token?: string | null): boolean;
  getTokenExpirationTime(token?: string | null): number | null;
}

export interface TokenRefreshStrategy {
  refreshHandler: (currentRefreshToken: string | null) => Promise<TokenRefreshResult>;
  refreshUrl?: string;
  refreshMarginSeconds?: number;
  onRefreshSuccess?: (result: TokenRefreshResult) => void;
  onRefreshFailure?: (error: unknown) => void;
  shouldInterceptUnauthorized?: boolean;
}

export interface DeduplicationConfig {
  enabled: boolean;
  ttlMs: number;
  keyGenerator?: (config: InternalAxiosRequestConfig) => string;
}

export interface RateLimiterBucketConfig {
  maxTokens: number;
  refillRatePerSecond: number;
  leakRatePerSecond?: number;
  maxWaitQueueSize?: number;
}

export interface ExtendedRequestConfig<D = unknown> extends AxiosRequestConfig<D> {
  // Traceability & Metadata
  requestId?: string;
  correlationId?: string;
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
  initiator?: string;
  timestamp?: number;

  // Resiliency & Failover
  retry?: Partial<RetryPolicyConfig> | false;
  circuitBreakerKey?: string;
  circuitBreakerOverride?: Partial<ICircuitBreakerConfig>;
  timeoutMs?: number;

  // Caching
  cache?: {
    strategy?: CacheStrategy;
    ttlMs?: number;
    staleWhileRevalidateMs?: number;
    key?: string;
    invalidateTags?: string[];
    tags?: string[];
    forceRefresh?: boolean;
  } | false;

  // Request deduplication
  deduplicate?: boolean;
  deduplicationKey?: string;

  // Security & Authentication
  skipAuth?: boolean;
  requiredScopes?: string[];
  audience?: string;
  sensitive?: boolean;

  // Performance & Compression
  enableCompression?: boolean;
  signal?: AbortSignal;

  // Internal Execution Tracing
  _retryAttemptCount?: number;
  _requestStartTime?: number;
  _cachedEntryUsed?: boolean;
  _spanInstance?: TelemetrySpan;
}

export interface ExtendedInternalRequestConfig<D = unknown> extends InternalAxiosRequestConfig<D> {
  requestId?: string;
  correlationId?: string;
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
  initiator?: string;
  timestamp?: number;
  retry?: Partial<RetryPolicyConfig> | false;
  circuitBreakerKey?: string;
  circuitBreakerOverride?: Partial<ICircuitBreakerConfig>;
  timeoutMs?: number;
  cache?: {
    strategy?: CacheStrategy;
    ttlMs?: number;
    staleWhileRevalidateMs?: number;
    key?: string;
    invalidateTags?: string[];
    tags?: string[];
    forceRefresh?: boolean;
  } | false;
  deduplicate?: boolean;
  deduplicationKey?: string;
  skipAuth?: boolean;
  requiredScopes?: string[];
  audience?: string;
  sensitive?: boolean;
  enableCompression?: boolean;
  _retryAttemptCount?: number;
  _requestStartTime?: number;
  _cachedEntryUsed?: boolean;
  _spanInstance?: TelemetrySpan;
}

export interface ApiResponseEnvelope<TData = unknown, TMeta = Record<string, unknown>> {
  success: boolean;
  status: number;
  statusText: string;
  data: TData;
  meta: TMeta & {
    requestId: string;
    correlationId: string;
    timestamp: string;
    durationMs: number;
    cached: boolean;
    serverTimestamp?: string;
    pagination?: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
  headers: Record<string, string>;
}

// ============================================================================
// SECTION 4: CONCRETE UTILITIES & CRYPTOGRAPHIC ENGINE
// ============================================================================

export class PlatformEnvironmentDetector {
  public static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.document !== 'undefined';
  }

  public static isNode(): boolean {
    return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
  }

  public static isWebWorker(): boolean {
    return typeof self === 'object' && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope';
  }

  public static isReactNative(): boolean {
    return typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
  }

  public static isEdgeRuntime(): boolean {
    return typeof (globalThis as unknown as { EdgeRuntime?: string }).EdgeRuntime === 'string';
  }

  public static detectMode(): EnvironmentMode {
    if (this.isNode()) {
      const env = process.env.NODE_ENV?.toLowerCase();
      if (env === 'production') return EnvironmentMode.PRODUCTION;
      if (env === 'staging') return EnvironmentMode.STAGING;
      if (env === 'test') return EnvironmentMode.TEST;
      if (env === 'development') return EnvironmentMode.DEVELOPMENT;
      return EnvironmentMode.LOCAL;
    }

    if (this.isBrowser()) {
      const origin = window.location.origin.toLowerCase();
      if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('0.0.0.0')) {
        return EnvironmentMode.DEVELOPMENT;
      }
      if (origin.includes('staging') || origin.includes('qa') || origin.includes('preview')) {
        return EnvironmentMode.STAGING;
      }
      return EnvironmentMode.PRODUCTION;
    }

    return EnvironmentMode.UNKNOWN;
  }

  public static deduceBaseUrl(): string {
    if (this.isBrowser()) {
      const origin = window.location.origin;
      if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('0.0.0.0')) {
        return 'http://localhost:5000/api';
      }
      return `${origin}/api`;
    }

    if (this.isNode()) {
      return process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
    }

    return '/api';
  }
}

export class CryptographicEngine {
  private static fnv1a32(str: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  public static fastHash(input: unknown): string {
    try {
      const serialized = typeof input === 'string' ? input : JSON.stringify(input);
      return this.fnv1a32(serialized || '');
    } catch {
      return this.fnv1a32(String(input));
    }
  }

  public static generateUuidV4(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      return Array.from(bytes)
        .map((b, i) => ([4, 6, 8, 10].includes(i) ? `-${b.toString(16).padStart(2, '0')}` : b.toString(16).padStart(2, '0')))
        .join('');
    }

    let d = new Date().getTime();
    let d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      let r = Math.random() * 16;
      if (d > 0) {
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  public static buildCanonicalCacheKey(
    method: string = 'GET',
    url: string = '',
    params?: unknown,
    data?: unknown,
    headersToInclude: string[] = ['accept', 'accept-language']
  ): string {
    const normMethod = method.toUpperCase().trim();
    const normUrl = url.trim();
    const sortedParams = params ? this.sortObjectRecursively(params) : null;
    const sortedData = data ? this.sortObjectRecursively(data) : null;

    const parts = [
      `m:${normMethod}`,
      `u:${normUrl}`,
      `p:${sortedParams ? JSON.stringify(sortedParams) : ''}`,
      `d:${sortedData ? JSON.stringify(sortedData) : ''}`
    ];

    return `cck_${this.fastHash(parts.join('||'))}`;
  }

  private static sortObjectRecursively(obj: unknown): unknown {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sortObjectRecursively(item));
    }
    const keys = Object.keys(obj as Record<string, unknown>).sort();
    const result: Record<string, unknown> = {};
    for (const key of keys) {
      result[key] = this.sortObjectRecursively((obj as Record<string, unknown>)[key]);
    }
    return result;
  }
}

// ============================================================================
// SECTION 5: STRUCTURED TELEMETRY & OBSERVABILITY ENGINE
// ============================================================================

export class ConsoleTelemetryExporter implements ITelemetryExporter {
  private readonly minLogLevel: LogLevel;

  constructor(minLogLevel: LogLevel = LogLevel.INFO) {
    this.minLogLevel = minLogLevel;
  }

  public exportSpan(span: TelemetrySpan): void {
    if (this.minLogLevel > LogLevel.DEBUG) return;
    const style = span.status === 'ERROR' ? 'color: red; font-weight: bold;' : 'color: green; font-weight: bold;';
    if (PlatformEnvironmentDetector.isBrowser()) {
      console.groupCollapsed(`%c[SPAN] ${span.operationName} [${span.durationMs?.toFixed(2)}ms] [${span.status}]`, style);
      console.log('Trace ID:', span.traceId);
      console.log('Span ID:', span.spanId);
      console.log('Tags:', span.tags);
      console.log('Events:', span.events);
      if (span.errorDetails) {
        console.error('Span Error:', span.errorDetails);
      }
      console.groupEnd();
    } else {
      console.log(JSON.stringify({ type: 'SPAN', span }));
    }
  }

  public exportMetric(eventName: TelemetryEventType, attributes: Record<string, unknown>): void {
    if (this.minLogLevel > LogLevel.INFO) return;
    if (PlatformEnvironmentDetector.isBrowser()) {
      console.log(`%c[METRIC] ${eventName}`, 'color: #0088cc; font-weight: bold;', attributes);
    } else {
      console.log(JSON.stringify({ type: 'METRIC', eventName, attributes, timestamp: new Date().toISOString() }));
    }
  }

  public flush(): void {
    // No-op for console
  }
}

export class TelemetryTracer {
  private exporters: ITelemetryExporter[] = [];
  private activeSpans: Map<string, TelemetrySpan> = new Map();

  constructor(exporters: ITelemetryExporter[] = [new ConsoleTelemetryExporter()]) {
    this.exporters = exporters;
  }

  public addExporter(exporter: ITelemetryExporter): void {
    this.exporters.push(exporter);
  }

  public startSpan(operationName: string, parentContext?: { traceId?: string; spanId?: string }, initialTags: Record<string, string | number | boolean> = {}): TelemetrySpan {
    const traceId = parentContext?.traceId || CryptographicEngine.generateUuidV4();
    const spanId = CryptographicEngine.generateUuidV4().substring(0, 16);
    const span: TelemetrySpan = {
      traceId,
      spanId,
      parentSpanId: parentContext?.spanId,
      operationName,
      startTime: typeof performance !== 'undefined' ? performance.now() : Date.now(),
      tags: { ...initialTags },
      events: [],
      status: 'UNSET'
    };

    this.activeSpans.set(spanId, span);
    return span;
  }

  public addEvent(spanId: string, eventName: string, attributes?: Record<string, unknown>): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.events.push({
        name: eventName,
        timestamp: typeof performance !== 'undefined' ? performance.now() : Date.now(),
        attributes
      });
    }
  }

  public setTag(spanId: string, key: string, value: string | number | boolean): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.tags[key] = value;
    }
  }

  public endSpan(spanId: string, status: 'OK' | 'ERROR' = 'OK', error?: Error): TelemetrySpan | null {
    const span = this.activeSpans.get(spanId);
    if (!span) return null;

    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    span.endTime = endTime;
    span.durationMs = endTime - span.startTime;
    span.status = status;

    if (error) {
      span.errorDetails = {
        message: error.message,
        stack: error.stack,
        code: (error as { code?: string }).code
      };
    }

    this.activeSpans.delete(spanId);
    this.dispatchSpan(span);
    return span;
  }

  public recordMetric(eventName: TelemetryEventType, attributes: Record<string, unknown> = {}): void {
    for (const exporter of this.exporters) {
      try {
        exporter.exportMetric(eventName, attributes);
      } catch (err) {
        console.warn('Telemetry metric export failure:', err);
      }
    }
  }

  private dispatchSpan(span: TelemetrySpan): void {
    for (const exporter of this.exporters) {
      try {
        exporter.exportSpan(span);
      } catch (err) {
        console.warn('Telemetry span export failure:', err);
      }
    }
  }
}

// ============================================================================
// SECTION 6: IN-MEMORY & LOCAL STORAGE COMPATIBLE CACHING ENGINE
// ============================================================================

export class MemoryCacheAdapter implements ICacheAdapter {
  private storage: Map<string, CacheEntry<unknown>> = new Map();
  private readonly maxEntries: number;

  constructor(maxEntries: number = 1000) {
    this.maxEntries = maxEntries;
  }

  public get<T = unknown>(key: string): CacheEntry<T> | null {
    const entry = this.storage.get(key);
    if (!entry) return null;

    const now = Date.now();
    // Expiration check: Cached time + TTL + Stale allowance
    if (now > entry.cachedAt + entry.ttlMs + entry.staleWhileRevalidateMs) {
      this.storage.delete(key);
      return null;
    }

    entry.hits++;
    return entry as CacheEntry<T>;
  }

  public set<T = unknown>(key: string, entry: CacheEntry<T>): void {
    if (this.storage.size >= this.maxEntries) {
      this.prune();
      if (this.storage.size >= this.maxEntries) {
        const firstKey = this.storage.keys().next().value;
        if (firstKey) this.storage.delete(firstKey);
      }
    }
    this.storage.set(key, entry as CacheEntry<unknown>);
  }

  public delete(key: string): boolean {
    return this.storage.delete(key);
  }

  public clear(): void {
    this.storage.clear();
  }

  public prune(): number {
    const now = Date.now();
    let removedCount = 0;
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.cachedAt + entry.ttlMs + entry.staleWhileRevalidateMs) {
        this.storage.delete(key);
        removedCount++;
      }
    }
    return removedCount;
  }

  public has(key: string): boolean {
    return this.storage.has(key);
  }

  public size(): number {
    return this.storage.size;
  }
}

export class LocalStorageCacheAdapter implements ICacheAdapter {
  private prefix: string;

  constructor(prefix: string = 'api_cache_') {
    this.prefix = prefix;
  }

  private isStorageAvailable(): boolean {
    return PlatformEnvironmentDetector.isBrowser() && typeof window.localStorage !== 'undefined';
  }

  public get<T = unknown>(key: string): CacheEntry<T> | null {
    if (!this.isStorageAvailable()) return null;
    try {
      const raw = window.localStorage.getItem(`${this.prefix}${key}`);
      if (!raw) return null;
      const entry: CacheEntry<T> = JSON.parse(raw);
      const now = Date.now();
      if (now > entry.cachedAt + entry.ttlMs + entry.staleWhileRevalidateMs) {
        this.delete(key);
        return null;
      }
      entry.hits++;
      this.set(key, entry);
      return entry;
    } catch {
      return null;
    }
  }

  public set<T = unknown>(key: string, entry: CacheEntry<T>): void {
    if (!this.isStorageAvailable()) return;
    try {
      window.localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(entry));
    } catch (e) {
      this.prune();
    }
  }

  public delete(key: string): boolean {
    if (!this.isStorageAvailable()) return false;
    try {
      window.localStorage.removeItem(`${this.prefix}${key}`);
      return true;
    } catch {
      return false;
    }
  }

  public clear(): void {
    if (!this.isStorageAvailable()) return;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(this.prefix)) {
          keysToRemove.push(k);
        }
      }
      for (const k of keysToRemove) {
        window.localStorage.removeItem(k);
      }
    } catch {
      // Storage access blocked or restricted
    }
  }

  public prune(): number {
    if (!this.isStorageAvailable()) return 0;
    let pruned = 0;
    try {
      const now = Date.now();
      const keysToCheck: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(this.prefix)) {
          keysToCheck.push(k);
        }
      }
      for (const k of keysToCheck) {
        const raw = window.localStorage.getItem(k);
        if (raw) {
          try {
            const entry: CacheEntry = JSON.parse(raw);
            if (now > entry.cachedAt + entry.ttlMs + entry.staleWhileRevalidateMs) {
              window.localStorage.removeItem(k);
              pruned++;
            }
          } catch {
            window.localStorage.removeItem(k);
            pruned++;
          }
        }
      }
    } catch {
      // Ignore storage error
    }
    return pruned;
  }

  public has(key: string): boolean {
    if (!this.isStorageAvailable()) return false;
    return window.localStorage.getItem(`${this.prefix}${key}`) !== null;
  }

  public size(): number {
    if (!this.isStorageAvailable()) return 0;
    let count = 0;
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(this.prefix)) count++;
    }
    return count;
  }
}

// ============================================================================
// SECTION 7: ADAPTIVE CIRCUIT BREAKER ARCHITECTURE
// ============================================================================

export class CircuitBreaker {
  private readonly serviceKey: string;
  private readonly config: ICircuitBreakerConfig;
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private metrics: CircuitMetrics;
  private halfOpenPermitsRemaining: number;

  constructor(serviceKey: string, config?: Partial<ICircuitBreakerConfig>) {
    this.serviceKey = serviceKey;
    this.config = {
      failureThresholdPercentage: 50,
      minimumRequestsInWindow: 10,
      rollingWindowMs: 30000,
      sleepWindowMs: 15000,
      halfOpenMaxPermits: 3,
      ...config
    };
    this.halfOpenPermitsRemaining = this.config.halfOpenMaxPermits;
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      consecutiveFailures: 0,
      lastFailureTimestamp: 0,
      lastSuccessTimestamp: 0,
      lastStateChangeTimestamp: Date.now(),
      windowBuckets: []
    };
  }

  public getState(): CircuitBreakerState {
    this.evaluateStateTransition();
    return this.state;
  }

  public canExecute(): boolean {
    const currentState = this.getState();
    if (currentState === CircuitBreakerState.CLOSED || currentState === CircuitBreakerState.FORCED_CLOSED) {
      return true;
    }
    if (currentState === CircuitBreakerState.OPEN || currentState === CircuitBreakerState.FORCED_OPEN) {
      return false;
    }
    if (currentState === CircuitBreakerState.HALF_OPEN) {
      if (this.halfOpenPermitsRemaining > 0) {
        this.halfOpenPermitsRemaining--;
        return true;
      }
      return false;
    }
    return true;
  }

  public recordSuccess(): void {
    const now = Date.now();
    this.cleanBuckets(now);
    this.metrics.totalRequests++;
    this.metrics.successfulRequests++;
    this.metrics.consecutiveFailures = 0;
    this.metrics.lastSuccessTimestamp = now;

    const currentBucket = this.getCurrentBucket(now);
    currentBucket.successes++;

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.transitionTo(CircuitBreakerState.CLOSED);
    }
  }

  public recordFailure(error: unknown): void {
    if (this.config.failurePredicate && !this.config.failurePredicate(error)) {
      this.recordSuccess();
      return;
    }

    const now = Date.now();
    this.cleanBuckets(now);
    this.metrics.totalRequests++;
    this.metrics.failedRequests++;
    this.metrics.consecutiveFailures++;
    this.metrics.lastFailureTimestamp = now;

    const currentBucket = this.getCurrentBucket(now);
    currentBucket.failures++;

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.transitionTo(CircuitBreakerState.OPEN);
      return;
    }

    if (this.state === CircuitBreakerState.CLOSED) {
      const { total, failures } = this.calculateWindowTotals();
      if (total >= this.config.minimumRequestsInWindow) {
        const failurePct = (failures / total) * 100;
        if (failurePct >= this.config.failureThresholdPercentage) {
          this.transitionTo(CircuitBreakerState.OPEN);
        }
      }
    }
  }

  public forceState(newState: CircuitBreakerState): void {
    this.transitionTo(newState);
  }

  public reset(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      consecutiveFailures: 0,
      lastFailureTimestamp: 0,
      lastSuccessTimestamp: 0,
      lastStateChangeTimestamp: Date.now(),
      windowBuckets: []
    };
    this.halfOpenPermitsRemaining = this.config.halfOpenMaxPermits;
    this.transitionTo(CircuitBreakerState.CLOSED);
  }

  private evaluateStateTransition(): void {
    const now = Date.now();
    if (this.state === CircuitBreakerState.OPEN) {
      if (now - this.metrics.lastStateChangeTimestamp >= this.config.sleepWindowMs) {
        this.transitionTo(CircuitBreakerState.HALF_OPEN);
      }
    }
  }

  private transitionTo(newState: CircuitBreakerState): void {
    if (this.state === newState) return;
    const oldState = this.state;
    this.state = newState;
    this.metrics.lastStateChangeTimestamp = Date.now();

    if (newState === CircuitBreakerState.HALF_OPEN) {
      this.halfOpenPermitsRemaining = this.config.halfOpenMaxPermits;
    }

    if (this.config.onStateChange) {
      try {
        this.config.onStateChange(oldState, newState, this.serviceKey);
      } catch (err) {
        console.error('CircuitBreaker state change listener failed:', err);
      }
    }
  }

  private cleanBuckets(now: number): void {
    const cutoff = now - this.config.rollingWindowMs;
    this.metrics.windowBuckets = this.metrics.windowBuckets.filter((b) => b.timestamp >= cutoff);
  }

  private getCurrentBucket(now: number): { timestamp: number; successes: number; failures: number; timeouts: number; shortCircuits: number } {
    const bucketInterval = 1000;
    const bucketTimestamp = Math.floor(now / bucketInterval) * bucketInterval;
    let bucket = this.metrics.windowBuckets.find((b) => b.timestamp === bucketTimestamp);
    if (!bucket) {
      bucket = {
        timestamp: bucketTimestamp,
        successes: 0,
        failures: 0,
        timeouts: 0,
        shortCircuits: 0
      };
      this.metrics.windowBuckets.push(bucket);
    }
    return bucket;
  }

  private calculateWindowTotals(): { total: number; successes: number; failures: number } {
    let successes = 0;
    let failures = 0;
    for (const b of this.metrics.windowBuckets) {
      successes += b.successes;
      failures += b.failures;
    }
    return {
      total: successes + failures,
      successes,
      failures
    };
  }
}

export class CircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry;
  private breakers: Map<string, CircuitBreaker> = new Map();
  private defaultConfig: ICircuitBreakerConfig = {
    failureThresholdPercentage: 50,
    minimumRequestsInWindow: 10,
    rollingWindowMs: 30000,
    sleepWindowMs: 15000,
    halfOpenMaxPermits: 3
  };

  private constructor() {}

  public static getInstance(): CircuitBreakerRegistry {
    if (!CircuitBreakerRegistry.instance) {
      CircuitBreakerRegistry.instance = new CircuitBreakerRegistry();
    }
    return CircuitBreakerRegistry.instance;
  }

  public getOrCreate(serviceKey: string, customConfig?: Partial<ICircuitBreakerConfig>): CircuitBreaker {
    let breaker = this.breakers.get(serviceKey);
    if (!breaker) {
      breaker = new CircuitBreaker(serviceKey, { ...this.defaultConfig, ...customConfig });
      this.breakers.set(serviceKey, breaker);
    }
    return breaker;
  }

  public resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
}

// ============================================================================
// SECTION 8: RESILIENT TOKEN VAULT & LOCAL STORAGE DRIVER
// ============================================================================

export class StandardTokenVault implements ITokenVault {
  private readonly storageKeyAccess: string;
  private readonly storageKeyRefresh: string;
  private inMemoryAccessToken: string | null = null;
  private inMemoryRefreshToken: string | null = null;

  constructor(storageKeyAccess: string = 'auth_token', storageKeyRefresh: string = 'refresh_token') {
    this.storageKeyAccess = storageKeyAccess;
    this.storageKeyRefresh = storageKeyRefresh;
    this.hydrateFromStorage();
  }

  private hydrateFromStorage(): void {
    if (PlatformEnvironmentDetector.isBrowser()) {
      try {
        this.inMemoryAccessToken = window.localStorage.getItem(this.storageKeyAccess);
        this.inMemoryRefreshToken = window.localStorage.getItem(this.storageKeyRefresh);
      } catch {
        // LocalStorage might be sandboxed or disabled
      }
    }
  }

  public getAccessToken(): string | null {
    if (this.inMemoryAccessToken) return this.inMemoryAccessToken;
    if (PlatformEnvironmentDetector.isBrowser()) {
      try {
        this.inMemoryAccessToken = window.localStorage.getItem(this.storageKeyAccess);
        return this.inMemoryAccessToken;
      } catch {
        return null;
      }
    }
    return null;
  }

  public getRefreshToken(): string | null {
    if (this.inMemoryRefreshToken) return this.inMemoryRefreshToken;
    if (PlatformEnvironmentDetector.isBrowser()) {
      try {
        this.inMemoryRefreshToken = window.localStorage.getItem(this.storageKeyRefresh);
        return this.inMemoryRefreshToken;
      } catch {
        return null;
      }
    }
    return null;
  }

  public setTokens(tokens: TokenRefreshResult): void {
    this.inMemoryAccessToken = tokens.accessToken;
    if (tokens.refreshToken) {
      this.inMemoryRefreshToken = tokens.refreshToken;
    }

    if (PlatformEnvironmentDetector.isBrowser()) {
      try {
        window.localStorage.setItem(this.storageKeyAccess, tokens.accessToken);
        if (tokens.refreshToken) {
          window.localStorage.setItem(this.storageKeyRefresh, tokens.refreshToken);
        }
      } catch (err) {
        console.warn('Failed to commit tokens to localStorage:', err);
      }
    }
  }

  public clearTokens(): void {
    this.inMemoryAccessToken = null;
    this.inMemoryRefreshToken = null;

    if (PlatformEnvironmentDetector.isBrowser()) {
      try {
        window.localStorage.removeItem(this.storageKeyAccess);
        window.localStorage.removeItem(this.storageKeyRefresh);
      } catch (err) {
        console.warn('Failed to clear tokens from localStorage:', err);
      }
    }
  }

  public isTokenExpired(token?: string | null): boolean {
    const tok = token || this.getAccessToken();
    if (!tok) return true;

    const expiration = this.getTokenExpirationTime(tok);
    if (!expiration) return false; // If non-JWT, assume valid until rejected

    // Add 10s skew protection
    return Date.now() >= (expiration * 1000 - 10000);
  }

  public getTokenExpirationTime(token?: string | null): number | null {
    const tok = token || this.getAccessToken();
    if (!tok) return null;

    try {
      const parts = tok.split('.');
      if (parts.length !== 3) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join('')
      );
      const decoded = JSON.parse(jsonPayload) as { exp?: number };
      return decoded.exp ?? null;
    } catch {
      return null;
    }
  }
}

// ============================================================================
// SECTION 9: REVOLUTIONARY BACKOFF & RETRY CALCULATOR
// ============================================================================

export class BackoffCalculator {
  public static calculateDelay(attempt: number, config: RetryPolicyConfig): number {
    let delay = config.initialIntervalMs;

    switch (config.backoffStrategy) {
      case RetryBackoffStrategy.FIXED:
        delay = config.initialIntervalMs;
        break;

      case RetryBackoffStrategy.LINEAR:
        delay = config.initialIntervalMs * attempt;
        break;

      case RetryBackoffStrategy.EXPONENTIAL:
        delay = config.initialIntervalMs * Math.pow(config.backoffMultiplier, attempt - 1);
        break;

      case RetryBackoffStrategy.EXPONENTIAL_WITH_JITTER: {
        const base = config.initialIntervalMs * Math.pow(config.backoffMultiplier, attempt - 1);
        const jitter = base * config.jitterFactor * (Math.random() * 2 - 1);
        delay = Math.max(0, base + jitter);
        break;
      }

      case RetryBackoffStrategy.FIBONACCI: {
        delay = config.initialIntervalMs * this.fibonacci(attempt);
        break;
      }
    }

    return Math.min(Math.floor(delay), config.maxIntervalMs);
  }

  private static fibonacci(n: number): number {
    let a = 1;
    let b = 1;
    for (let i = 3; i <= n; i++) {
      const c = a + b;
      a = b;
      b = c;
    }
    return b;
  }
}

// ============================================================================
// SECTION 10: ZERO-TRUST SSRF & HEADER SECURITY SANITIZER
// ============================================================================

export class SecurityGuardrail {
  private readonly policy: SecurityPolicyConfig;

  constructor(policy?: Partial<SecurityPolicyConfig>) {
    this.policy = {
      allowedDomains: [],
      allowSubdomains: true,
      blockLocalhostInProduction: true,
      enforceHttps: true,
      stripSensitiveHeadersOnRedirect: true,
      sensitiveHeaderKeys: ['authorization', 'cookie', 'x-api-key', 'proxy-authorization', 'x-csrf-token'],
      maxPayloadSizeBytes: 10 * 1024 * 1024, // 10MB
      preventCrossDomainTokenLeakage: true,
      ...policy
    };
  }

  public validateOutboundRequest(config: ExtendedInternalRequestConfig): void {
    const urlString = config.url || '';
    const baseURL = config.baseURL || '';

    // Check payload size
    if (config.data) {
      let size = 0;
      if (typeof config.data === 'string') {
        size = config.data.length;
      } else if (PlatformEnvironmentDetector.isBrowser() && config.data instanceof Blob) {
        size = config.data.size;
      } else if (PlatformEnvironmentDetector.isNode() && typeof Buffer !== 'undefined' && Buffer.isBuffer(config.data)) {
        size = config.data.length;
      }
      if (size > this.policy.maxPayloadSizeBytes) {
        throw new SecurityIntegrityError(
          'PAYLOAD_OVERSIZE',
          `Request payload size ${size} bytes exceeds permitted limit of ${this.policy.maxPayloadSizeBytes} bytes`
        );
      }
    }

    // SSRF & Target URL Verification
    const isAbsolute = urlString.startsWith('http://') || urlString.startsWith('https://');
    if (!isAbsolute) {
      return; // Relative URL is trusted by default against application origin
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(urlString);
    } catch {
      throw new SecurityIntegrityError('INVALID_URL', `Malformed target URL: ${urlString}`);
    }

    // Block non-https in production
    const env = PlatformEnvironmentDetector.detectMode();
    if (this.policy.enforceHttps && env === EnvironmentMode.PRODUCTION && targetUrl.protocol !== 'https:') {
      throw new SecurityIntegrityError('INSECURE_PROTOCOL', `Insecure plain HTTP protocol prohibited for production request: ${urlString}`);
    }

    // Block localhost in production
    if (this.policy.blockLocalhostInProduction && env === EnvironmentMode.PRODUCTION) {
      const hostname = targetUrl.hostname.toLowerCase();
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname === '::1') {
        throw new SecurityIntegrityError('SSRF_LOCAL_HOST', `Outbound requests to loopback address prohibited in production: ${hostname}`);
      }
    }

    // Domain Whitelisting
    if (this.policy.allowedDomains.length > 0) {
      const targetHost = targetUrl.hostname.toLowerCase();
      const isAllowed = this.policy.allowedDomains.some((allowed) => {
        const normAllowed = allowed.toLowerCase();
        if (normAllowed === targetHost) return true;
        if (this.policy.allowSubdomains && targetHost.endsWith(`.${normAllowed}`)) return true;
        return false;
      });

      if (!isAllowed) {
        throw new SecurityIntegrityError(
          'UNAUTHORIZED_DOMAIN',
          `Outbound request target [${targetHost}] is not whitelisted by security policy`
        );
      }
    }
  }

  public shouldAttachAuthToken(configUrl: string, configBaseUrl?: string): boolean {
    if (!this.policy.preventCrossDomainTokenLeakage) return true;
    if (!configUrl) return false;

    const isRelative = !configUrl.startsWith('http://') && !configUrl.startsWith('https://');
    if (isRelative) return true;

    if (configBaseUrl) {
      try {
        const baseOrigin = new URL(configBaseUrl).origin;
        const targetOrigin = new URL(configUrl).origin;
        return baseOrigin === targetOrigin;
      } catch {
        return false;
      }
    }

    if (PlatformEnvironmentDetector.isBrowser()) {
      try {
        const browserOrigin = window.location.origin;
        const targetOrigin = new URL(configUrl).origin;
        return browserOrigin === targetOrigin;
      } catch {
        return false;
      }
    }

    return false;
  }

  public sanitizeHeaders(headers: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (this.policy.sensitiveHeaderKeys.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}

// ============================================================================
// SECTION 11: REQUEST DEDUPLICATION (IN-FLIGHT COALESCING)
// ============================================================================

export class RequestDeduplicator {
  private inflightRequests: Map<string, Promise<AxiosResponse<unknown>>> = new Map();

  public async executeOrJoin<T>(
    key: string,
    operation: () => Promise<AxiosResponse<T>>
  ): Promise<AxiosResponse<T>> {
    const existing = this.inflightRequests.get(key);
    if (existing) {
      return (await existing) as AxiosResponse<T>;
    }

    const promise = operation()
      .finally(() => {
        this.inflightRequests.delete(key);
      });

    this.inflightRequests.set(key, promise as Promise<AxiosResponse<unknown>>);
    return promise;
  }

  public isInflight(key: string): boolean {
    return this.inflightRequests.has(key);
  }

  public clear(): void {
    this.inflightRequests.clear();
  }
}// ============================================================================
// SECTION 12: LEAKY BUCKET & TOKEN BUCKET RATE LIMITING ENGINE
// ============================================================================

export class TokenBucketRateLimiter {
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillRatePerSecond: number;
  private lastRefillTimestamp: number;
  private waitQueue: Array<{ resolve: () => void; reject: (err: Error) => void; timestamp: number }> = [];
  private readonly maxWaitQueueSize: number;
  private drainTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: RateLimiterBucketConfig) {
    this.maxTokens = config.maxTokens;
    this.tokens = config.maxTokens;
    this.refillRatePerSecond = config.refillRatePerSecond;
    this.maxWaitQueueSize = config.maxWaitQueueSize ?? 100;
    this.lastRefillTimestamp = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsedTimeSeconds = (now - this.lastRefillTimestamp) / 1000;
    const tokensToAdd = elapsedTimeSeconds * this.refillRatePerSecond;

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefillTimestamp = now;
    }
  }

  public tryAcquire(tokensRequested: number = 1): boolean {
    this.refill();
    if (this.tokens >= tokensRequested) {
      this.tokens -= tokensRequested;
      return true;
    }
    return false;
  }

  public async acquire(tokensRequested: number = 1, timeoutMs: number = 10000): Promise<void> {
    this.refill();

    if (this.tokens >= tokensRequested && this.waitQueue.length === 0) {
      this.tokens -= tokensRequested;
      return;
    }

    if (this.waitQueue.length >= this.maxWaitQueueSize) {
      throw new RateLimitError(
        Math.ceil(tokensRequested / this.refillRatePerSecond),
        this.maxTokens,
        0,
        null,
        { message: 'Client-side rate limit wait queue saturated' }
      );
    }

    return new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const index = this.waitQueue.findIndex((entry) => entry.resolve === resolve);
        if (index !== -1) {
          this.waitQueue.splice(index, 1);
          reject(new TimeoutError(timeoutMs, 'Client-side rate limiter timeout while waiting for execution tokens'));
        }
      }, timeoutMs);

      this.waitQueue.push({
        resolve: () => {
          clearTimeout(timeoutId);
          resolve();
        },
        reject: (err) => {
          clearTimeout(timeoutId);
          reject(err);
        },
        timestamp: Date.now()
      });

      this.scheduleDrain();
    });
  }

  private scheduleDrain(): void {
    if (this.drainTimer !== null || this.waitQueue.length === 0) {
      return;
    }

    const intervalMs = Math.max(25, Math.floor(1000 / this.refillRatePerSecond));
    this.drainTimer = setTimeout(() => {
      this.drainTimer = null;
      this.refill();

      while (this.waitQueue.length > 0 && this.tokens >= 1) {
        this.tokens -= 1;
        const waiter = this.waitQueue.shift();
        if (waiter) {
          waiter.resolve();
        }
      }

      if (this.waitQueue.length > 0) {
        this.scheduleDrain();
      }
    }, intervalMs);
  }

  public getAvailableTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }

  public reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefillTimestamp = Date.now();
    if (this.drainTimer) {
      clearTimeout(this.drainTimer);
      this.drainTimer = null;
    }
    while (this.waitQueue.length > 0) {
      const waiter = this.waitQueue.shift();
      if (waiter) {
        waiter.reject(new ApiClientError('Rate limiter was reset while requests were queued', 'RATE_LIMITER_RESET'));
      }
    }
  }
}

// ============================================================================
// SECTION 13: ASYNCHRONOUS AUTHENTICATION LIFECYCLE & REFRESH QUEUE
// ============================================================================

export class AuthTokenLifecycleOrchestrator {
  private tokenVault: ITokenVault;
  private refreshStrategy?: TokenRefreshStrategy;
  private isRefreshing: boolean = false;
  private pendingRequestsQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
    timestamp: number;
  }> = [];
  private readonly maxQueueWaitMs: number = 30000;

  constructor(tokenVault: ITokenVault, refreshStrategy?: TokenRefreshStrategy) {
    this.tokenVault = tokenVault;
    this.refreshStrategy = refreshStrategy;
  }

  public setRefreshStrategy(strategy: TokenRefreshStrategy): void {
    this.refreshStrategy = strategy;
  }

  public getTokenVault(): ITokenVault {
    return this.tokenVault;
  }

  public async getValidAccessToken(): Promise<string | null> {
    const currentToken = await this.tokenVault.getAccessToken();
    if (!currentToken) {
      return null;
    }

    if (!this.tokenVault.isTokenExpired(currentToken)) {
      return currentToken;
    }

    // Token is expired, trigger refresh flow
    if (this.refreshStrategy) {
      return this.refreshAccessToken();
    }

    // If no refresh strategy configured, return existing or null
    return currentToken;
  }

  public async refreshAccessToken(): Promise<string> {
    if (!this.refreshStrategy) {
      throw new AuthenticationError('Token refresh requested but no refresh strategy was configured', true);
    }

    // If a refresh is already in flight, queue and wait for the identical resolution
    if (this.isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => {
          const idx = this.pendingRequestsQueue.findIndex((entry) => entry.resolve === resolve);
          if (idx !== -1) {
            this.pendingRequestsQueue.splice(idx, 1);
            reject(new TimeoutError(this.maxQueueWaitMs, 'Timed out waiting for concurrent token refresh'));
          }
        }, this.maxQueueWaitMs);

        this.pendingRequestsQueue.push({
          resolve: (token: string) => {
            clearTimeout(timer);
            resolve(token);
          },
          reject: (err: unknown) => {
            clearTimeout(timer);
            reject(err);
          },
          timestamp: Date.now()
        });
      });
    }

    this.isRefreshing = true;

    try {
      const currentRefreshToken = await this.tokenVault.getRefreshToken();
      const result = await this.refreshStrategy.refreshHandler(currentRefreshToken);

      await this.tokenVault.setTokens(result);

      if (this.refreshStrategy.onRefreshSuccess) {
        this.refreshStrategy.onRefreshSuccess(result);
      }

      this.processQueueSuccess(result.accessToken);
      return result.accessToken;
    } catch (error) {
      await this.tokenVault.clearTokens();

      if (this.refreshStrategy.onRefreshFailure) {
        this.refreshStrategy.onRefreshFailure(error);
      }

      this.processQueueFailure(error);
      throw error instanceof ApiClientError ? error : new AuthenticationError('Session renewal failed during token refresh cycle', true, { rawError: error });
    } finally {
      this.isRefreshing = false;
    }
  }

  private processQueueSuccess(newAccessToken: string): void {
    const queue = [...this.pendingRequestsQueue];
    this.pendingRequestsQueue = [];
    for (const item of queue) {
      item.resolve(newAccessToken);
    }
  }

  private processQueueFailure(error: unknown): void {
    const queue = [...this.pendingRequestsQueue];
    this.pendingRequestsQueue = [];
    for (const item of queue) {
      item.reject(error);
    }
  }
}

// ============================================================================
// SECTION 14: OFFLINE QUEUE & OPERATION OUTBOX PATTERN
// ============================================================================

export interface QueuedOfflineRequest {
  id: string;
  config: ExtendedRequestConfig;
  createdAt: number;
  retryAttempts: number;
  priority: number;
}

export class NetworkOfflineOutbox {
  private queue: QueuedOfflineRequest[] = [];
  private isProcessing: boolean = false;
  private readonly storageKey: string = 'api_offline_outbox_queue';
  private readonly maxRetries: number = 5;

  constructor() {
    this.hydrate();
    if (PlatformEnvironmentDetector.isBrowser()) {
      window.addEventListener('online', () => {
        this.processOutbox();
      });
    }
  }

  private hydrate(): void {
    if (PlatformEnvironmentDetector.isBrowser()) {
      try {
        const raw = window.localStorage.getItem(this.storageKey);
        if (raw) {
          this.queue = JSON.parse(raw);
        }
      } catch {
        this.queue = [];
      }
    }
  }

  private persist(): void {
    if (PlatformEnvironmentDetector.isBrowser()) {
      try {
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
      } catch {
        // Fallback or ignore storage quota errors
      }
    }
  }

  public enqueue(config: ExtendedRequestConfig, priority: number = 0): string {
    const id = CryptographicEngine.generateUuidV4();
    this.queue.push({
      id,
      config,
      createdAt: Date.now(),
      retryAttempts: 0,
      priority
    });
    this.queue.sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt);
    this.persist();
    return id;
  }

  public async processOutbox(clientExecutor?: (config: ExtendedRequestConfig) => Promise<unknown>): Promise<void> {
    if (this.isProcessing || this.queue.length === 0 || !clientExecutor) {
      return;
    }

    if (PlatformEnvironmentDetector.isBrowser() && !navigator.onLine) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        const item = this.queue[0];
        try {
          await clientExecutor(item.config);
          this.queue.shift();
          this.persist();
        } catch (error) {
          item.retryAttempts++;
          if (item.retryAttempts >= this.maxRetries) {
            // Drop permanently failing transaction to prevent head-of-line blocking
            this.queue.shift();
            console.error(`Offline outbox item ${item.id} dropped after ${this.maxRetries} failed attempts`, error);
          } else {
            // Break loop until next online trigger
            break;
          }
          this.persist();
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  public getPendingCount(): number {
    return this.queue.length;
  }

  public clear(): void {
    this.queue = [];
    this.persist();
  }
}

// ============================================================================
// SECTION 15: COMPREHENSIVE INTERCEPTOR PIPELINE IMPLEMENTATION
// ============================================================================

export interface InterceptorStageContext {
  tracer: TelemetryTracer;
  tokenOrchestrator: AuthTokenLifecycleOrchestrator;
  securityGuardrail: SecurityGuardrail;
  cacheAdapter: ICacheAdapter;
  circuitBreakerRegistry: CircuitBreakerRegistry;
  rateLimiter?: TokenBucketRateLimiter;
  deduplicator: RequestDeduplicator;
  outbox: NetworkOfflineOutbox;
  defaultBaseUrl: string;
}

export class RequestPipelineOrchestrator {
  private readonly context: InterceptorStageContext;

  constructor(context: InterceptorStageContext) {
    this.context = context;
  }

  public async interceptRequest(config: ExtendedInternalRequestConfig): Promise<ExtendedInternalRequestConfig> {
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    config._requestStartTime = startTime;

    // 1. Assign Correlation IDs & Tracing Spans
    const correlationId = config.correlationId || (config.headers?.['x-correlation-id'] as string) || CryptographicEngine.generateUuidV4();
    const requestId = config.requestId || (config.headers?.['x-request-id'] as string) || CryptographicEngine.generateUuidV4();
    const clientTraceId = config.traceId || (config.headers?.['x-trace-id'] as string) || CryptographicEngine.generateUuidV4();

    config.correlationId = correlationId;
    config.requestId = requestId;
    config.traceId = clientTraceId;

    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    config.headers['x-correlation-id'] = correlationId;
    config.headers['x-request-id'] = requestId;
    config.headers['x-trace-id'] = clientTraceId;
    config.headers['x-client-timestamp'] = new Date().toISOString();
    config.headers['x-client-version'] = '1.0.0-enterprise';

    // 2. Telemetry Span initialization
    const operationName = `HTTP ${config.method?.toUpperCase() || 'GET'} ${config.url || '/'}`;
    const span = this.context.tracer.startSpan(
      operationName,
      { traceId: clientTraceId, spanId: config.parentSpanId },
      {
        'http.method': config.method?.toUpperCase() || 'GET',
        'http.url': config.url || '',
        'http.base_url': config.baseURL || this.context.defaultBaseUrl,
        'app.correlation_id': correlationId,
        'app.request_id': requestId
      }
    );
    config._spanInstance = span;

    this.context.tracer.recordMetric(TelemetryEventType.REQUEST_START, {
      requestId,
      correlationId,
      url: config.url,
      method: config.method
    });

    // 3. Security Guardrails & SSRF Validation
    try {
      this.context.securityGuardrail.validateOutboundRequest(config);
    } catch (secErr) {
      this.context.tracer.endSpan(span.spanId, 'ERROR', secErr instanceof Error ? secErr : new Error(String(secErr)));
      this.context.tracer.recordMetric(TelemetryEventType.SECURITY_VIOLATION, {
        requestId,
        error: secErr instanceof Error ? secErr.message : String(secErr)
      });
      throw secErr;
    }

    // 4. Rate Limiting Enforcer
    if (this.context.rateLimiter) {
      try {
        await this.context.rateLimiter.acquire(1, 5000);
      } catch (rlErr) {
        this.context.tracer.recordMetric(TelemetryEventType.RATE_LIMITED, { requestId });
        this.context.tracer.endSpan(span.spanId, 'ERROR', rlErr instanceof Error ? rlErr : new Error(String(rlErr)));
        throw rlErr;
      }
    }

    // 5. Circuit Breaker Invariant Check
    const serviceKey = config.circuitBreakerKey || (config.url ? new URL(config.url, config.baseURL || 'http://localhost').pathname.split('/')[1] || 'root' : 'default');
    const breaker = this.context.circuitBreakerRegistry.getOrCreate(serviceKey, config.circuitBreakerOverride);

    if (!breaker.canExecute()) {
      const cbError = new CircuitBreakerOpenError(serviceKey, 15000, {
        requestId,
        correlationId,
        endpoint: config.url,
        method: config.method
      });
      this.context.tracer.recordMetric(TelemetryEventType.CIRCUIT_OPENED, { serviceKey, requestId });
      this.context.tracer.endSpan(span.spanId, 'ERROR', cbError);
      throw cbError;
    }

    // 6. Zero-Trust Bearer Token Authorization Injection
    if (!config.skipAuth) {
      const shouldAttach = this.context.securityGuardrail.shouldAttachAuthToken(config.url || '', config.baseURL);
      if (shouldAttach) {
        try {
          const validToken = await this.context.tokenOrchestrator.getValidAccessToken();
          if (validToken) {
            config.headers['Authorization'] = `Bearer ${validToken}`;
          }
        } catch (tokenErr) {
          console.warn('Auth token resolution warning:', tokenErr);
        }
      }
    }

    return config;
  }

  public async interceptResponse(response: AxiosResponse): Promise<AxiosResponse> {
    const config = response.config as ExtendedInternalRequestConfig;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const duration = config._requestStartTime ? now - config._requestStartTime : 0;

    // 1. Record Circuit Breaker Success
    const serviceKey = config.circuitBreakerKey || (config.url ? new URL(config.url, config.baseURL || 'http://localhost').pathname.split('/')[1] || 'root' : 'default');
    const breaker = this.context.circuitBreakerRegistry.getOrCreate(serviceKey, config.circuitBreakerOverride);
    breaker.recordSuccess();

    // 2. Telemetry Span Finalization
    if (config._spanInstance) {
      this.context.tracer.setTag(config._spanInstance.spanId, 'http.status_code', response.status);
      this.context.tracer.setTag(config._spanInstance.spanId, 'http.duration_ms', duration);
      this.context.tracer.endSpan(config._spanInstance.spanId, 'OK');
    }

    this.context.tracer.recordMetric(TelemetryEventType.REQUEST_SUCCESS, {
      requestId: config.requestId,
      correlationId: config.correlationId,
      status: response.status,
      durationMs: duration
    });

    // 3. Write-Through Response Caching Layer
    if (config.cache && config.method?.toUpperCase() === 'GET' && response.status >= 200 && response.status < 300) {
      const cacheKey = config.cache.key || CryptographicEngine.buildCanonicalCacheKey(
        config.method,
        config.url || '',
        config.params,
        config.data
      );

      const cacheEntry: CacheEntry = {
        key: cacheKey,
        data: response.data,
        headers: response.headers as Record<string, string>,
        status: response.status,
        statusText: response.statusText,
        cachedAt: Date.now(),
        ttlMs: config.cache.ttlMs ?? 60000,
        staleWhileRevalidateMs: config.cache.staleWhileRevalidateMs ?? 30000,
        etag: (response.headers['etag'] as string) || undefined,
        lastModified: (response.headers['last-modified'] as string) || undefined,
        hits: 0
      };

      try {
        await this.context.cacheAdapter.set(cacheKey, cacheEntry);
        this.context.tracer.recordMetric(TelemetryEventType.CACHE_PUT, { key: cacheKey });
      } catch (cacheErr) {
        console.warn('Cache write failure:', cacheErr);
      }
    }

    return response;
  }

  public async interceptError(
    error: AxiosError,
    executeAxiosInstance: (cfg: InternalAxiosRequestConfig) => Promise<AxiosResponse>
  ): Promise<AxiosResponse> {
    const config = (error.config || {}) as ExtendedInternalRequestConfig;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const duration = config._requestStartTime ? now - config._requestStartTime : 0;

    // 1. Circuit Breaker Failure Logging
    const serviceKey = config.circuitBreakerKey || (config.url ? new URL(config.url, config.baseURL || 'http://localhost').pathname.split('/')[1] || 'root' : 'default');
    const breaker = this.context.circuitBreakerRegistry.getOrCreate(serviceKey, config.circuitBreakerOverride);
    breaker.recordFailure(error);

    // 2. Standardized Error Normalization
    const normalizedError = this.normalizeAxiosError(error, config, duration);

    // 3. Telemetry Span Error Logging
    if (config._spanInstance) {
      this.context.tracer.setTag(config._spanInstance.spanId, 'error', true);
      this.context.tracer.setTag(config._spanInstance.spanId, 'http.status_code', error.response?.status || 0);
      this.context.tracer.endSpan(config._spanInstance.spanId, 'ERROR', normalizedError);
    }

    this.context.tracer.recordMetric(TelemetryEventType.REQUEST_FAILURE, {
      requestId: config.requestId,
      correlationId: config.correlationId,
      statusCode: error.response?.status,
      errorCode: normalizedError.code,
      message: normalizedError.message,
      durationMs: duration
    });

    // 4. Handle 401 Unauthorized with Automatic Single-Flight Token Refresh
    if (error.response?.status === HttpStatus.UNAUTHORIZED && !config._cachedEntryUsed && !config.skipAuth) {
      const retryCount = config._retryAttemptCount || 0;
      if (retryCount === 0) {
        try {
          this.context.tracer.recordMetric(TelemetryEventType.TOKEN_REFRESH_START, { requestId: config.requestId });
          const newAccessToken = await this.context.tokenOrchestrator.refreshAccessToken();
          this.context.tracer.recordMetric(TelemetryEventType.TOKEN_REFRESH_SUCCESS, { requestId: config.requestId });

          if (!config.headers) {
            config.headers = new AxiosHeaders();
          }
          config.headers['Authorization'] = `Bearer ${newAccessToken}`;
          config._retryAttemptCount = 1;

          return await executeAxiosInstance(config);
        } catch (refreshErr) {
          this.context.tracer.recordMetric(TelemetryEventType.TOKEN_REFRESH_FAILURE, { requestId: config.requestId });

          // Terminal redirect if running in browser
          if (PlatformEnvironmentDetector.isBrowser()) {
            await this.context.tokenOrchestrator.getTokenVault().clearTokens();
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
          throw refreshErr instanceof ApiClientError ? refreshErr : normalizedError;
        }
      }
    }

    // 5. Adaptive Retry Execution Engine
    const retryConfig: RetryPolicyConfig = {
      maxRetries: 3,
      backoffStrategy: RetryBackoffStrategy.EXPONENTIAL_WITH_JITTER,
      initialIntervalMs: 500,
      maxIntervalMs: 10000,
      backoffMultiplier: 2,
      jitterFactor: 0.25,
      retryOnStatus: [408, 429, 500, 502, 503, 504],
      retryOnNetworkErrors: true,
      retryOnTimeouts: true,
      ...(config.retry !== false ? config.retry : { maxRetries: 0 })
    };

    const currentAttempt = config._retryAttemptCount || 0;
    const shouldRetry = this.evaluateRetryEligibility(error, currentAttempt, retryConfig);

    if (shouldRetry) {
      const nextAttempt = currentAttempt + 1;
      const delayMs = BackoffCalculator.calculateDelay(nextAttempt, retryConfig);

      if (retryConfig.onRetry) {
        retryConfig.onRetry(normalizedError, nextAttempt, delayMs);
      }

      this.context.tracer.recordMetric(TelemetryEventType.RETRY_ATTEMPT, {
        requestId: config.requestId,
        attempt: nextAttempt,
        delayMs
      });

      await new Promise((resolve) => setTimeout(resolve, delayMs));

      config._retryAttemptCount = nextAttempt;
      return await executeAxiosInstance(config);
    }

    // 6. Network Offline Outbox Fallback (for mutative requests when offline)
    if (this.isNetworkOrOfflineError(error) && config.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method.toUpperCase())) {
      if (PlatformEnvironmentDetector.isBrowser() && !navigator.onLine) {
        this.context.outbox.enqueue(config as ExtendedRequestConfig);
      }
    }

    throw normalizedError;
  }

  private evaluateRetryEligibility(error: AxiosError, currentAttempt: number, config: RetryPolicyConfig): boolean {
    if (currentAttempt >= config.maxRetries) {
      return false;
    }

    if (config.retryCondition && !config.retryCondition(error, currentAttempt + 1)) {
      return false;
    }

    // Network Errors
    if (!error.response && config.retryOnNetworkErrors) {
      return true;
    }

    // Request Timeouts
    if ((error.code === 'ECONNABORTED' || error.message.includes('timeout')) && config.retryOnTimeouts) {
      return true;
    }

    // Specific HTTP Status Codes
    if (error.response && config.retryOnStatus.includes(error.response.status)) {
      return true;
    }

    return false;
  }

  private isNetworkOrOfflineError(error: AxiosError): boolean {
    return !error.response || error.code === 'ERR_NETWORK' || error.message.includes('Network Error');
  }

  private normalizeAxiosError(error: AxiosError, config: ExtendedInternalRequestConfig, durationMs: number): ApiClientError {
    const errorContext: ApiClientErrorContext = {
      requestId: config.requestId,
      correlationId: config.correlationId,
      traceId: config.traceId,
      spanId: config._spanInstance?.spanId,
      endpoint: config.url,
      method: config.method?.toUpperCase(),
      statusCode: error.response?.status,
      statusText: error.response?.statusText,
      requestHeaders: this.context.securityGuardrail.sanitizeHeaders((config.headers as Record<string, unknown>) || {}),
      responseHeaders: (error.response?.headers as Record<string, unknown>) || {},
      timestamp: new Date().toISOString(),
      durationMs,
      retryAttempts: config._retryAttemptCount || 0,
      clientVersion: '1.0.0-enterprise',
      payload: error.response?.data,
      rawError: error
    };

    // Timeout Error
    if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
      return new TimeoutError(config.timeout || 0, error.message, errorContext);
    }

    // Network Disconnection Error
    if (!error.response || error.code === 'ERR_NETWORK') {
      return new NetworkError(error.message || 'Network unreachable', errorContext);
    }

    const status = error.response.status;
    const body = error.response.data as Record<string, unknown> | string | undefined;

    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        return new AuthenticationError(
          typeof body === 'object' && body?.message ? String(body.message) : 'Unauthorized resource access',
          false,
          errorContext
        );

      case HttpStatus.FORBIDDEN:
        return new AuthorizationError(
          typeof body === 'object' && body?.message ? String(body.message) : 'Forbidden resource access',
          errorContext
        );

      case HttpStatus.TOO_MANY_REQUESTS: {
        const retryAfter = error.response.headers['retry-after'];
        const parsedRetryAfter = retryAfter ? parseInt(retryAfter, 10) : null;
        return new RateLimitError(
          parsedRetryAfter,
          null,
          null,
          null,
          errorContext
        );
      }

      case HttpStatus.UNPROCESSABLE_ENTITY: {
        let errors: Array<{ field?: string; message: string; code?: string; value?: unknown }> = [];
        if (typeof body === 'object' && body !== null) {
          if (Array.isArray(body.errors)) {
            errors = body.errors;
          } else if (typeof body.message === 'string') {
            errors = [{ message: body.message }];
          }
        }
        return new ValidationError(errors, errorContext);
      }

      default:
        return new HttpError(
          status,
          error.response.statusText || `HTTP Error ${status}`,
          body,
          errorContext
        );
    }
  }
}// ============================================================================
// SECTION 16: ADVANCED STALE-WHILE-REVALIDATE (SWR) CACHING COORDINATOR
// ============================================================================

export interface CacheRevalidationResult<T = unknown> {
  data: T;
  isStale: boolean;
  revalidating: boolean;
  etag?: string;
  source: 'network' | 'cache-hit' | 'stale-revalidate';
}

export class SwrCacheCoordinator {
  private cacheAdapter: ICacheAdapter;
  private tracer: TelemetryTracer;
  private backgroundRevalidations: Map<string, Promise<unknown>> = new Map();

  constructor(cacheAdapter: ICacheAdapter, tracer: TelemetryTracer) {
    this.cacheAdapter = cacheAdapter;
    this.tracer = tracer;
  }

  public async evaluate<T>(
    cacheKey: string,
    strategy: CacheStrategy,
    ttlMs: number,
    swrMs: number,
    networkFetcher: () => Promise<AxiosResponse<T>>
  ): Promise<AxiosResponse<T>> {
    switch (strategy) {
      case CacheStrategy.NO_CACHE:
      case CacheStrategy.NETWORK_ONLY:
        return await networkFetcher();

      case CacheStrategy.CACHE_FIRST: {
        const cached = await this.cacheAdapter.get<T>(cacheKey);
        if (cached) {
          this.tracer.recordMetric(TelemetryEventType.CACHE_HIT, { key: cacheKey, strategy });
          return this.synthesizeAxiosResponse(cached, cacheKey);
        }
        this.tracer.recordMetric(TelemetryEventType.CACHE_MISS, { key: cacheKey, strategy });
        const networkResponse = await networkFetcher();
        await this.persistResponseToCache(cacheKey, networkResponse, ttlMs, swrMs);
        return networkResponse;
      }

      case CacheStrategy.NETWORK_FIRST: {
        try {
          const response = await networkFetcher();
          await this.persistResponseToCache(cacheKey, response, ttlMs, swrMs);
          return response;
        } catch (error) {
          const cached = await this.cacheAdapter.get<T>(cacheKey);
          if (cached) {
            this.tracer.recordMetric(TelemetryEventType.CACHE_HIT, { key: cacheKey, fallback: true });
            return this.synthesizeAxiosResponse(cached, cacheKey);
          }
          throw error;
        }
      }

      case CacheStrategy.STALE_WHILE_REVALIDATE: {
        const cached = await this.cacheAdapter.get<T>(cacheKey);
        const now = Date.now();

        if (!cached) {
          this.tracer.recordMetric(TelemetryEventType.CACHE_MISS, { key: cacheKey, strategy });
          const networkResponse = await networkFetcher();
          await this.persistResponseToCache(cacheKey, networkResponse, ttlMs, swrMs);
          return networkResponse;
        }

        const isFresh = now <= cached.cachedAt + cached.ttlMs;
        if (isFresh) {
          this.tracer.recordMetric(TelemetryEventType.CACHE_HIT, { key: cacheKey, fresh: true });
          return this.synthesizeAxiosResponse(cached, cacheKey);
        }

        const isStaleRevalidatable = now <= cached.cachedAt + cached.ttlMs + cached.staleWhileRevalidateMs;
        if (isStaleRevalidatable) {
          this.tracer.recordMetric(TelemetryEventType.CACHE_HIT, { key: cacheKey, stale: true });
          this.triggerBackgroundRevalidation(cacheKey, ttlMs, swrMs, networkFetcher);
          return this.synthesizeAxiosResponse(cached, cacheKey);
        }

        // Cache is hard-expired, must fetch synchronously
        this.tracer.recordMetric(TelemetryEventType.CACHE_MISS, { key: cacheKey, expired: true });
        const networkResponse = await networkFetcher();
        await this.persistResponseToCache(cacheKey, networkResponse, ttlMs, swrMs);
        return networkResponse;
      }

      default:
        return await networkFetcher();
    }
  }

  private triggerBackgroundRevalidation<T>(
    cacheKey: string,
    ttlMs: number,
    swrMs: number,
    networkFetcher: () => Promise<AxiosResponse<T>>
  ): void {
    if (this.backgroundRevalidations.has(cacheKey)) {
      return;
    }

    const revalidationPromise = (async () => {
      try {
        const response = await networkFetcher();
        await this.persistResponseToCache(cacheKey, response, ttlMs, swrMs);
        this.tracer.recordMetric(TelemetryEventType.CACHE_PUT, { key: cacheKey, backgroundRevalidation: true });
      } catch (err) {
        console.warn(`[SWR] Background revalidation failed for key [${cacheKey}]:`, err);
      } finally {
        this.backgroundRevalidations.delete(cacheKey);
      }
    })();

    this.backgroundRevalidations.set(cacheKey, revalidationPromise);
  }

  private async persistResponseToCache<T>(
    cacheKey: string,
    response: AxiosResponse<T>,
    ttlMs: number,
    swrMs: number
  ): Promise<void> {
    if (response.status < 200 || response.status >= 300) {
      return;
    }

    const entry: CacheEntry<T> = {
      key: cacheKey,
      data: response.data,
      headers: (response.headers || {}) as Record<string, string>,
      status: response.status,
      statusText: response.statusText,
      cachedAt: Date.now(),
      ttlMs,
      staleWhileRevalidateMs: swrMs,
      etag: (response.headers?.['etag'] as string) || undefined,
      lastModified: (response.headers?.['last-modified'] as string) || undefined,
      hits: 0
    };

    await this.cacheAdapter.set(cacheKey, entry);
  }

  private synthesizeAxiosResponse<T>(cached: CacheEntry<T>, cacheKey: string): AxiosResponse<T> {
    return {
      data: cached.data,
      status: cached.status || 200,
      statusText: cached.statusText || 'OK (From Cache)',
      headers: {
        ...cached.headers,
        'x-cache-hit': 'true',
        'x-cache-key': cacheKey,
        'x-cached-at': new Date(cached.cachedAt).toISOString()
      },
      config: {
        headers: new AxiosHeaders(cached.headers)
      } as InternalAxiosRequestConfig
    };
  }
}

// ============================================================================
// SECTION 17: PAYLOAD SANITIZATION, SERIALIZATION & NORMALIZATION PIPELINE
// ============================================================================

export interface IDataTransformer {
  transformRequest(data: unknown, headers?: Record<string, unknown>): unknown;
  transformResponse(data: unknown, headers?: Record<string, unknown>): unknown;
}

export class JsonTransformer implements IDataTransformer {
  private readonly datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

  public transformRequest(data: unknown, headers?: Record<string, unknown>): unknown {
    if (data === undefined || data === null) {
      return data;
    }

    if (PlatformEnvironmentDetector.isBrowser() && (data instanceof FormData || data instanceof Blob || data instanceof ArrayBuffer)) {
      return data;
    }

    if (typeof data === 'object') {
      try {
        return JSON.stringify(data);
      } catch (err) {
        throw new SerializationError(`Failed to serialize request payload: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return data;
  }

  public transformResponse(data: unknown, headers?: Record<string, unknown>): unknown {
    if (typeof data !== 'string') {
      return data;
    }

    const trimmed = data.trim();
    if (!trimmed) {
      return null;
    }

    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        return JSON.parse(trimmed, (key, value) => {
          if (typeof value === 'string' && this.datePattern.test(value)) {
            const parsedDate = new Date(value);
            if (!isNaN(parsedDate.getTime())) {
              return parsedDate;
            }
          }
          return value;
        });
      } catch {
        return data;
      }
    }

    return data;
  }
}

export class CaseSensitivityNormalizer {
  public static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  public static snakeToCamel(str: string): string {
    return str.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
  }

  public static deepTransformKeys(obj: unknown, transformFn: (key: string) => string): unknown {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date || (PlatformEnvironmentDetector.isBrowser() && (obj instanceof Blob || obj instanceof FormData))) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.deepTransformKeys(item, transformFn));
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const transformedKey = transformFn(key);
      result[transformedKey] = this.deepTransformKeys(value, transformFn);
    }
    return result;
  }
}

// ============================================================================
// SECTION 18: CHUNKED UPLOAD & STREAMING PROGRESS TRACKER
// ============================================================================

export interface ProgressState {
  loaded: number;
  total: number;
  progressPercentage: number;
  speedBytesPerSecond: number;
  estimatedRemainingSeconds: number;
  startTime: number;
  lastUpdatedTime: number;
}

export type ProgressCallback = (state: ProgressState) => void;

export class StreamingProgressTracker {
  private startTime: number = 0;
  private lastTime: number = 0;
  private lastLoaded: number = 0;
  private callback?: ProgressCallback;

  constructor(callback?: ProgressCallback) {
    this.callback = callback;
  }

  public onProgress(progressEvent: { loaded: number; total?: number }): void {
    const now = Date.now();

    if (this.startTime === 0) {
      this.startTime = now;
      this.lastTime = now;
      this.lastLoaded = 0;
    }

    const timeDiffSec = (now - this.lastTime) / 1000;
    const loadedDiff = progressEvent.loaded - this.lastLoaded;

    let speed = 0;
    if (timeDiffSec > 0) {
      speed = loadedDiff / timeDiffSec;
    }

    const total = progressEvent.total || 0;
    const percentage = total > 0 ? Math.min(100, Math.round((progressEvent.loaded / total) * 100)) : 0;
    const remainingBytes = Math.max(0, total - progressEvent.loaded);
    const estimatedRemainingSeconds = speed > 0 ? remainingBytes / speed : 0;

    const state: ProgressState = {
      loaded: progressEvent.loaded,
      total,
      progressPercentage: percentage,
      speedBytesPerSecond: Math.round(speed),
      estimatedRemainingSeconds: Math.round(estimatedRemainingSeconds),
      startTime: this.startTime,
      lastUpdatedTime: now
    };

    this.lastTime = now;
    this.lastLoaded = progressEvent.loaded;

    if (this.callback) {
      this.callback(state);
    }
  }

  public reset(): void {
    this.startTime = 0;
    this.lastTime = 0;
    this.lastLoaded = 0;
  }
}

export interface ChunkedUploadOptions {
  chunkSizeBytes?: number;
  concurrency?: number;
  onProgress?: ProgressCallback;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export class ChunkedUploadManager {
  private readonly defaultChunkSize = 5 * 1024 * 1024; // 5MB

  public async uploadBlob(
    targetUrl: string,
    fileOrBlob: Blob,
    fileName: string,
    clientExecutor: (config: ExtendedRequestConfig) => Promise<AxiosResponse<unknown>>,
    options: ChunkedUploadOptions = {}
  ): Promise<AxiosResponse<unknown>> {
    const chunkSize = options.chunkSizeBytes || this.defaultChunkSize;
    const totalSize = fileOrBlob.size;
    const totalChunks = Math.ceil(totalSize / chunkSize);
    const uploadId = CryptographicEngine.generateUuidV4();
    const progressTracker = new StreamingProgressTracker(options.onProgress);

    let totalUploadedBytes = 0;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      if (options.signal?.aborted) {
        throw new ApiClientError('Chunked upload cancelled by user', 'UPLOAD_ABORTED');
      }

      const startByte = chunkIndex * chunkSize;
      const endByte = Math.min(totalSize, startByte + chunkSize);
      const chunk = fileOrBlob.slice(startByte, endByte);

      const formData = new FormData();
      formData.append('file', chunk, fileName);
      formData.append('chunkIndex', String(chunkIndex));
      formData.append('totalChunks', String(totalChunks));
      formData.append('uploadId', uploadId);
      formData.append('fileName', fileName);
      formData.append('totalSize', String(totalSize));

      const isLastChunk = chunkIndex === totalChunks - 1;

      const response = await clientExecutor({
        method: 'POST',
        url: targetUrl,
        data: formData,
        headers: {
          ...options.headers,
          'Content-Type': 'multipart/form-data',
          'X-Upload-ID': uploadId,
          'X-Chunk-Index': String(chunkIndex),
          'X-Total-Chunks': String(totalChunks)
        },
        signal: options.signal
      });

      totalUploadedBytes += chunk.size;
      progressTracker.onProgress({ loaded: totalUploadedBytes, total: totalSize });

      if (isLastChunk) {
        return response;
      }
    }

    throw new ApiClientError('Chunked upload loop terminated without finalizing', 'UPLOAD_INCOMPLETE');
  }
}

// ============================================================================
// SECTION 19: HTTP BATCH REQUEST AGGREGATOR (REQUEST COALESCING & DISPATCH)
// ============================================================================

export interface BatchItem<TParams = unknown, TResult = unknown> {
  id: string;
  method: HttpMethod;
  endpoint: string;
  params?: TParams;
  body?: unknown;
  headers?: Record<string, string>;
  resolve: (value: TResult) => void;
  reject: (reason?: unknown) => void;
}

export interface BatchPayloadRequest {
  id: string;
  method: string;
  url: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface BatchPayloadResponse {
  id: string;
  status: number;
  body: unknown;
  headers?: Record<string, string>;
}

export class BatchRequestAggregator {
  private queue: BatchItem[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly maxBatchSize: number;
  private readonly maxWaitMs: number;
  private readonly batchEndpoint: string;
  private readonly clientExecutor: (config: ExtendedRequestConfig) => Promise<AxiosResponse<{ responses: BatchPayloadResponse[] }>>;

  constructor(
    batchEndpoint: string,
    clientExecutor: (config: ExtendedRequestConfig) => Promise<AxiosResponse<{ responses: BatchPayloadResponse[] }>>,
    maxBatchSize: number = 25,
    maxWaitMs: number = 20
  ) {
    this.batchEndpoint = batchEndpoint;
    this.clientExecutor = clientExecutor;
    this.maxBatchSize = maxBatchSize;
    this.maxWaitMs = maxWaitMs;
  }

  public async schedule<TResult = unknown>(
    method: HttpMethod,
    endpoint: string,
    body?: unknown,
    params?: unknown,
    headers?: Record<string, string>
  ): Promise<TResult> {
    return new Promise<TResult>((resolve, reject) => {
      const item: BatchItem = {
        id: CryptographicEngine.generateUuidV4(),
        method,
        endpoint,
        body,
        params,
        headers,
        resolve: resolve as (value: unknown) => void,
        reject
      };

      this.queue.push(item);

      if (this.queue.length >= this.maxBatchSize) {
        this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.maxWaitMs);
      }
    });
  }

  public async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length === 0) {
      return;
    }

    const itemsToProcess = [...this.queue];
    this.queue = [];

    const batchPayload: { requests: BatchPayloadRequest[] } = {
      requests: itemsToProcess.map((item) => ({
        id: item.id,
        method: item.method,
        url: item.endpoint,
        body: item.body,
        headers: item.headers
      }))
    };

    try {
      const response = await this.clientExecutor({
        method: 'POST',
        url: this.batchEndpoint,
        data: batchPayload,
        skipAuth: false
      });

      const responseMap = new Map<string, BatchPayloadResponse>();
      for (const res of response.data.responses || []) {
        responseMap.set(res.id, res);
      }

      for (const item of itemsToProcess) {
        const itemResponse = responseMap.get(item.id);
        if (!itemResponse) {
          item.reject(new ApiClientError(`Batch request failed: No response returned for sub-request ${item.id}`, 'BATCH_SUBREQUEST_MISSING'));
        } else if (itemResponse.status >= 200 && itemResponse.status < 300) {
          item.resolve(itemResponse.body);
        } else {
          item.reject(
            new HttpError(
              itemResponse.status,
              `Batch sub-request failed with status ${itemResponse.status}`,
              itemResponse.body
            )
          );
        }
      }
    } catch (batchError) {
      for (const item of itemsToProcess) {
        item.reject(batchError);
      }
    }
  }
}

// ============================================================================
// SECTION 20: SSE & REACTIVE STREAMING ADAPTER WITH AUTOMATIC RECONNECT
// ============================================================================

export interface SseEvent<T = unknown> {
  id?: string;
  event: string;
  data: T;
  retry?: number;
}

export interface SseSubscriptionOptions {
  headers?: Record<string, string>;
  withCredentials?: boolean;
  maxReconnectAttempts?: number;
  initialReconnectDelayMs?: number;
  maxReconnectDelayMs?: number;
  onOpen?: () => void;
  onError?: (err: unknown) => void;
  onClose?: () => void;
}

export class ReactiveEventStreamClient {
  private eventSource: EventSource | null = null;
  private isClosedExplicitly: boolean = false;
  private reconnectAttempts: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private eventListeners: Map<string, Set<(data: unknown) => void>> = new Map();

  public subscribe<T = unknown>(
    url: string,
    options: SseSubscriptionOptions = {}
  ): {
    on: (eventType: string, handler: (data: T) => void) => void;
    off: (eventType: string, handler: (data: T) => void) => void;
    close: () => void;
  } {
    if (!PlatformEnvironmentDetector.isBrowser()) {
      throw new ApiClientError('SSE EventSource streaming is only supported in browser environments', 'UNSUPPORTED_ENVIRONMENT');
    }

    this.isClosedExplicitly = false;
    this.reconnectAttempts = 0;

    const connect = () => {
      if (this.isClosedExplicitly) return;

      try {
        this.eventSource = new EventSource(url, { withCredentials: options.withCredentials });

        this.eventSource.onopen = () => {
          this.reconnectAttempts = 0;
          if (options.onOpen) {
            options.onOpen();
          }
        };

        this.eventSource.onerror = (err) => {
          if (options.onError) {
            options.onError(err);
          }

          if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
          }

          if (!this.isClosedExplicitly) {
            const maxAttempts = options.maxReconnectAttempts ?? 10;
            if (this.reconnectAttempts < maxAttempts) {
              this.reconnectAttempts++;
              const initialDelay = options.initialReconnectDelayMs ?? 1000;
              const maxDelay = options.maxReconnectDelayMs ?? 30000;
              const delay = Math.min(initialDelay * Math.pow(2, this.reconnectAttempts - 1), maxDelay);

              this.reconnectTimer = setTimeout(() => connect(), delay);
            } else if (options.onClose) {
              options.onClose();
            }
          }
        };

        this.eventSource.onmessage = (event) => {
          this.dispatchEvent('message', event.data);
        };

        // Attach dynamic custom event listeners
        for (const eventName of this.eventListeners.keys()) {
          this.eventSource.addEventListener(eventName, (event: MessageEvent) => {
            this.dispatchEvent(eventName, event.data);
          });
        }
      } catch (err) {
        if (options.onError) options.onError(err);
      }
    };

    connect();

    return {
      on: (eventType: string, handler: (data: T) => void) => {
        let listeners = this.eventListeners.get(eventType);
        if (!listeners) {
          listeners = new Set();
          this.eventListeners.set(eventType, listeners);
          if (this.eventSource && eventType !== 'message') {
            this.eventSource.addEventListener(eventType, (event: MessageEvent) => {
              this.dispatchEvent(eventType, event.data);
            });
          }
        }
        listeners.add(handler as (data: unknown) => void);
      },
      off: (eventType: string, handler: (data: T) => void) => {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
          listeners.delete(handler as (data: unknown) => void);
        }
      },
      close: () => {
        this.isClosedExplicitly = true;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        if (options.onClose) {
          options.onClose();
        }
      }
    };
  }

  private dispatchEvent(eventType: string, rawData: string): void {
    let parsedData: unknown = rawData;
    try {
      parsedData = JSON.parse(rawData);
    } catch {
      // Retain raw string if not JSON
    }

    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(parsedData);
        } catch (listenerError) {
          console.error(`Error in SSE listener for [${eventType}]:`, listenerError);
        }
      }
    }
  }
}// ============================================================================
// SECTION 21: WEBSOCKET BIDIRECTIONAL GATEWAY & RPC PROTOCOL ENGINE
// ============================================================================

export interface WebSocketRpcRequest<TParams = unknown> {
  jsonrpc?: '2.0';
  id: string;
  method: string;
  params?: TParams;
  headers?: Record<string, string>;
}

export interface WebSocketRpcResponse<TResult = unknown, TError = unknown> {
  jsonrpc?: '2.0';
  id: string;
  result?: TResult;
  error?: {
    code: number;
    message: string;
    data?: TError;
  };
}

export interface WebSocketGatewayOptions {
  heartbeatIntervalMs?: number;
  heartbeatTimeoutMs?: number;
  heartbeatPayload?: string | Record<string, unknown>;
  reconnectBaseDelayMs?: number;
  reconnectMaxDelayMs?: number;
  maxReconnectAttempts?: number;
  protocols?: string | string[];
  autoConnect?: boolean;
  tokenVault?: ITokenVault;
}

export enum WebSocketConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  TERMINATED = 'TERMINATED'
}

export class WebSocketRpcGateway {
  private ws: WebSocket | null = null;
  private readonly url: string;
  private readonly options: Required<WebSocketGatewayOptions>;
  private status: WebSocketConnectionStatus = WebSocketConnectionStatus.DISCONNECTED;
  private pendingRpcCalls: Map<string, { resolve: (val: unknown) => void; reject: (err: Error) => void; timer: ReturnType<typeof setTimeout> }> = new Map();
  private channelSubscriptions: Map<string, Set<(message: unknown) => void>> = new Map();
  private statusListeners: Set<(status: WebSocketConnectionStatus) => void> = new Set();
  private reconnectAttempt: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatIntervalTimer: ReturnType<typeof setInterval> | null = null;
  private heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private explicitClose: boolean = false;

  constructor(url: string, options: WebSocketGatewayOptions = {}) {
    this.url = url;
    this.options = {
      heartbeatIntervalMs: options.heartbeatIntervalMs ?? 30000,
      heartbeatTimeoutMs: options.heartbeatTimeoutMs ?? 5000,
      heartbeatPayload: options.heartbeatPayload ?? JSON.stringify({ type: 'ping' }),
      reconnectBaseDelayMs: options.reconnectBaseDelayMs ?? 1000,
      reconnectMaxDelayMs: options.reconnectMaxDelayMs ?? 30000,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 20,
      protocols: options.protocols ?? [],
      autoConnect: options.autoConnect ?? false,
      tokenVault: options.tokenVault ?? new StandardTokenVault()
    };

    if (this.options.autoConnect) {
      this.connect();
    }
  }

  public connect(): void {
    if (!PlatformEnvironmentDetector.isBrowser()) {
      return;
    }

    if (this.status === WebSocketConnectionStatus.CONNECTED || this.status === WebSocketConnectionStatus.CONNECTING) {
      return;
    }

    this.explicitClose = false;
    this.setStatus(this.reconnectAttempt > 0 ? WebSocketConnectionStatus.RECONNECTING : WebSocketConnectionStatus.CONNECTING);

    let targetUrl = this.url;
    const token = this.options.tokenVault.getAccessToken();
    if (token) {
      const urlObj = new URL(targetUrl, window.location.href);
      urlObj.searchParams.set('token', token);
      targetUrl = urlObj.toString();
    }

    try {
      this.ws = new WebSocket(targetUrl, this.options.protocols);
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (err) {
      this.scheduleReconnect();
    }
  }

  private handleOpen(): void {
    this.reconnectAttempt = 0;
    this.setStatus(WebSocketConnectionStatus.CONNECTED);
    this.startHeartbeat();

    // Resubscribe to channels
    for (const channel of this.channelSubscriptions.keys()) {
      this.sendRaw(JSON.stringify({ action: 'subscribe', channel }));
    }
  }

  private handleMessage(event: MessageEvent): void {
    this.resetHeartbeatTimeout();

    let data: unknown;
    try {
      data = JSON.parse(event.data);
    } catch {
      data = event.data;
    }

    // Check for RPC response
    if (typeof data === 'object' && data !== null && 'id' in data) {
      const rpc = data as WebSocketRpcResponse;
      const pending = this.pendingRpcCalls.get(rpc.id);
      if (pending) {
        clearTimeout(pending.timer);
        this.pendingRpcCalls.delete(rpc.id);
        if (rpc.error) {
          pending.reject(new ApiClientError(rpc.error.message, `RPC_ERROR_${rpc.error.code}`, { details: rpc.error.data }));
        } else {
          pending.resolve(rpc.result);
        }
        return;
      }
    }

    // Check for Topic/Channel broadcast
    if (typeof data === 'object' && data !== null && 'channel' in data) {
      const broadcast = data as { channel: string; payload: unknown };
      const listeners = this.channelSubscriptions.get(broadcast.channel);
      if (listeners) {
        for (const listener of listeners) {
          try {
            listener(broadcast.payload);
          } catch (e) {
            console.error(`WebSocket subscription listener error on channel [${broadcast.channel}]:`, e);
          }
        }
      }
    }
  }

  private handleError(event: Event): void {
    console.warn('WebSocket Gateway Error Event:', event);
  }

  private handleClose(event: CloseEvent): void {
    this.stopHeartbeat();
    this.rejectAllPendingRpc(new NetworkError(`WebSocket disconnected (${event.code}): ${event.reason || 'Closed'}`));

    if (!this.explicitClose) {
      this.scheduleReconnect();
    } else {
      this.setStatus(WebSocketConnectionStatus.TERMINATED);
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatIntervalTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const payload = typeof this.options.heartbeatPayload === 'string'
          ? this.options.heartbeatPayload
          : JSON.stringify(this.options.heartbeatPayload);
        this.ws.send(payload);

        this.heartbeatTimeoutTimer = setTimeout(() => {
          console.warn('WebSocket heartbeat ping timed out. Terminating connection to force retry.');
          if (this.ws) {
            this.ws.close(4000, 'Heartbeat Timeout');
          }
        }, this.options.heartbeatTimeoutMs);
      }
    }, this.options.heartbeatIntervalMs);
  }

  private resetHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }

  private stopHeartbeat(): void {
    if (this.heartbeatIntervalTimer) {
      clearInterval(this.heartbeatIntervalTimer);
      this.heartbeatIntervalTimer = null;
    }
    this.resetHeartbeatTimeout();
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempt >= this.options.maxReconnectAttempts) {
      this.setStatus(WebSocketConnectionStatus.TERMINATED);
      return;
    }

    this.setStatus(WebSocketConnectionStatus.RECONNECTING);
    this.reconnectAttempt++;

    const delay = Math.min(
      this.options.reconnectBaseDelayMs * Math.pow(1.5, this.reconnectAttempt - 1),
      this.options.reconnectMaxDelayMs
    );

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  public async rpcCall<TResult = unknown, TParams = unknown>(
    method: string,
    params?: TParams,
    timeoutMs: number = 10000
  ): Promise<TResult> {
    if (this.status !== WebSocketConnectionStatus.CONNECTED || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new NetworkError('Cannot execute WebSocket RPC call: Connection is not currently established');
    }

    const id = CryptographicEngine.generateUuidV4();
    const message: WebSocketRpcRequest<TParams> = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise<TResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRpcCalls.delete(id);
        reject(new TimeoutError(timeoutMs, `WebSocket RPC call [${method}] timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      this.pendingRpcCalls.set(id, {
        resolve: resolve as (val: unknown) => void,
        reject,
        timer
      });

      this.sendRaw(JSON.stringify(message));
    });
  }

  public subscribeChannel<T = unknown>(channel: string, listener: (data: T) => void): () => void {
    let listeners = this.channelSubscriptions.get(channel);
    if (!listeners) {
      listeners = new Set();
      this.channelSubscriptions.set(channel, listeners);
      if (this.status === WebSocketConnectionStatus.CONNECTED) {
        this.sendRaw(JSON.stringify({ action: 'subscribe', channel }));
      }
    }
    listeners.add(listener as (data: unknown) => void);

    return () => {
      const activeListeners = this.channelSubscriptions.get(channel);
      if (activeListeners) {
        activeListeners.delete(listener as (data: unknown) => void);
        if (activeListeners.size === 0) {
          this.channelSubscriptions.delete(channel);
          if (this.status === WebSocketConnectionStatus.CONNECTED) {
            this.sendRaw(JSON.stringify({ action: 'unsubscribe', channel }));
          }
        }
      }
    };
  }

  public sendRaw(payload: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(payload);
    }
  }

  public onStatusChange(callback: (status: WebSocketConnectionStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  public disconnect(): void {
    this.explicitClose = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close(1000, 'Client requested close');
      this.ws = null;
    }
    this.setStatus(WebSocketConnectionStatus.DISCONNECTED);
  }

  public getStatus(): WebSocketConnectionStatus {
    return this.status;
  }

  private setStatus(newStatus: WebSocketConnectionStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      for (const listener of this.statusListeners) {
        try {
          listener(this.status);
        } catch (err) {
          console.error('Error in status change listener:', err);
        }
      }
    }
  }

  private rejectAllPendingRpc(error: Error): void {
    for (const [id, pending] of this.pendingRpcCalls.entries()) {
      clearTimeout(pending.timer);
      pending.reject(error);
      this.pendingRpcCalls.delete(id);
    }
  }
}

// ============================================================================
// SECTION 22: GRAPHQL QUERY/MUTATION CLIENT & COMPILER PROTOCOL
// ============================================================================

export interface GraphQLRequestPayload<TVariables = Record<string, unknown>> {
  query: string;
  operationName?: string;
  variables?: TVariables;
  extensions?: Record<string, unknown>;
}

export interface GraphQLErrorLocation {
  line: number;
  column: number;
}

export interface GraphQLFormattedError {
  message: string;
  locations?: GraphQLErrorLocation[];
  path?: Array<string | number>;
  extensions?: {
    code?: string;
    timestamp?: string;
    exception?: {
      stacktrace?: string[];
    };
    [key: string]: unknown;
  };
}

export interface GraphQLResponsePayload<TData = unknown> {
  data?: TData | null;
  errors?: GraphQLFormattedError[];
  extensions?: Record<string, unknown>;
}

export class GraphQLExecutionError extends ApiClientError {
  public readonly name: string = 'GraphQLExecutionError';
  public readonly errors: GraphQLFormattedError[];

  constructor(errors: GraphQLFormattedError[], context: Partial<ApiClientErrorContext> = {}) {
    const errorMessages = errors.map((e) => e.message).join(' | ');
    super(`GraphQL Execution failed: ${errorMessages}`, 'GRAPHQL_ERROR', {
      ...context,
      graphQLErrors: errors
    });
    this.errors = errors;
  }
}

export class GraphQLClientEngine {
  private readonly endpoint: string;
  private readonly clientExecutor: (config: ExtendedRequestConfig) => Promise<AxiosResponse<GraphQLResponsePayload<unknown>>>;

  constructor(
    endpoint: string,
    clientExecutor: (config: ExtendedRequestConfig) => Promise<AxiosResponse<GraphQLResponsePayload<unknown>>>
  ) {
    this.endpoint = endpoint;
    this.clientExecutor = clientExecutor;
  }

  public async query<TData = unknown, TVariables = Record<string, unknown>>(
    query: string,
    variables?: TVariables,
    config?: Partial<ExtendedRequestConfig>
  ): Promise<TData> {
    const payload: GraphQLRequestPayload<TVariables> = {
      query: this.sanitizeGql(query),
      variables
    };

    const response = await this.clientExecutor({
      ...config,
      method: 'POST',
      url: this.endpoint,
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers
      }
    });

    const body = response.data;
    if (body.errors && body.errors.length > 0) {
      throw new GraphQLExecutionError(body.errors, {
        endpoint: this.endpoint,
        method: 'POST'
      });
    }

    return body.data as TData;
  }

  public async mutate<TData = unknown, TVariables = Record<string, unknown>>(
    mutation: string,
    variables?: TVariables,
    config?: Partial<ExtendedRequestConfig>
  ): Promise<TData> {
    return this.query<TData, TVariables>(mutation, variables, config);
  }

  private sanitizeGql(source: string): string {
    return source.replace(/#.*$/gm, '').replace(/\s+/g, ' ').trim();
  }
}

// ============================================================================
// SECTION 23: RESILIENT HTTP CLIENT CORE CONTAINER & PROTOCOL GATEWAY
// ============================================================================

export interface ApiClientConfig {
  baseURL?: string;
  timeoutMs?: number;
  headers?: RawAxiosRequestHeaders;
  security?: Partial<SecurityPolicyConfig>;
  retry?: Partial<RetryPolicyConfig> | false;
  circuitBreaker?: Partial<ICircuitBreakerConfig>;
  rateLimiter?: RateLimiterBucketConfig;
  cache?: {
    enabled?: boolean;
    adapter?: ICacheAdapter;
    defaultStrategy?: CacheStrategy;
    defaultTtlMs?: number;
    defaultStaleWhileRevalidateMs?: number;
  };
  tokenVault?: ITokenVault;
  tokenRefreshStrategy?: TokenRefreshStrategy;
  telemetryExporters?: ITelemetryExporter[];
  deduplication?: {
    enabled?: boolean;
    ttlMs?: number;
  };
  dataTransformer?: IDataTransformer;
}

export class ApiClientCore {
  private readonly axiosInstance: AxiosInstance;
  private readonly baseUrl: string;
  private readonly tracer: TelemetryTracer;
  private readonly securityGuardrail: SecurityGuardrail;
  private readonly tokenOrchestrator: AuthTokenLifecycleOrchestrator;
  private readonly cacheAdapter: ICacheAdapter;
  private readonly swrCoordinator: SwrCacheCoordinator;
  private readonly circuitBreakerRegistry: CircuitBreakerRegistry;
  private readonly rateLimiter?: TokenBucketRateLimiter;
  private readonly deduplicator: RequestDeduplicator;
  private readonly outbox: NetworkOfflineOutbox;
  private readonly pipelineOrchestrator: RequestPipelineOrchestrator;
  private readonly dataTransformer: IDataTransformer;
  private readonly config: ApiClientConfig;

  // Domain Protocol Sub-Engines
  public readonly uploadManager: ChunkedUploadManager;
  public readonly batchAggregator: BatchRequestAggregator;
  public readonly eventStreamClient: ReactiveEventStreamClient;
  public readonly graphQL: GraphQLClientEngine;
  public readonly websocket?: WebSocketRpcGateway;

  constructor(config: ApiClientConfig = {}) {
    this.config = config;
    this.baseUrl = config.baseURL || PlatformEnvironmentDetector.deduceBaseUrl();

    // 1. Telemetry & Observability
    this.tracer = new TelemetryTracer(config.telemetryExporters || [new ConsoleTelemetryExporter()]);

    // 2. Security Guardrail
    this.securityGuardrail = new SecurityGuardrail(config.security);

    // 3. Token Vault & Orchestrator
    const vault = config.tokenVault || new StandardTokenVault();
    this.tokenOrchestrator = new AuthTokenLifecycleOrchestrator(vault, config.tokenRefreshStrategy);

    // 4. Cache System
    this.cacheAdapter = config.cache?.adapter || new MemoryCacheAdapter(1000);
    this.swrCoordinator = new SwrCacheCoordinator(this.cacheAdapter, this.tracer);

    // 5. Circuit Breaker & Rate Limiting
    this.circuitBreakerRegistry = CircuitBreakerRegistry.getInstance();
    if (config.rateLimiter) {
      this.rateLimiter = new TokenBucketRateLimiter(config.rateLimiter);
    }

    // 6. Deduplication & Offline Store
    this.deduplicator = new RequestDeduplicator();
    this.outbox = new NetworkOfflineOutbox();
    this.dataTransformer = config.dataTransformer || new JsonTransformer();

    // 7. Axios Instance Instantiation
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeoutMs ?? 15000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...config.headers
      }
    });

    // 8. Pipeline Interceptor Engine
    const context: InterceptorStageContext = {
      tracer: this.tracer,
      tokenOrchestrator: this.tokenOrchestrator,
      securityGuardrail: this.securityGuardrail,
      cacheAdapter: this.cacheAdapter,
      circuitBreakerRegistry: this.circuitBreakerRegistry,
      rateLimiter: this.rateLimiter,
      deduplicator: this.deduplicator,
      outbox: this.outbox,
      defaultBaseUrl: this.baseUrl
    };
    this.pipelineOrchestrator = new RequestPipelineOrchestrator(context);

    // 9. Wire Interceptors to Underlying Axios
    this.axiosInstance.interceptors.request.use(
      (reqConfig) => this.pipelineOrchestrator.interceptRequest(reqConfig as ExtendedInternalRequestConfig),
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => this.pipelineOrchestrator.interceptResponse(response),
      (error: AxiosError) =>
        this.pipelineOrchestrator.interceptError(error, (cfg) => this.axiosInstance.request(cfg))
    );

    // 10. Instantiate Ancillary Sub-Engines
    this.uploadManager = new ChunkedUploadManager();
    this.batchAggregator = new BatchRequestAggregator('/batch', (cfg) => this.request(cfg));
    this.eventStreamClient = new ReactiveEventStreamClient();
    this.graphQL = new GraphQLClientEngine('/graphql', (cfg) => this.request(cfg));
  }

  /**
   * Primary invocation portal for all HTTP executions
   */
  public async request<T = unknown, R = AxiosResponse<T>, D = unknown>(
    config: ExtendedRequestConfig<D>
  ): Promise<R> {
    const method = (config.method || HttpMethod.GET).toUpperCase() as HttpMethod;
    const url = config.url || '';
    const shouldDeduplicate = config.deduplicate ?? (method === HttpMethod.GET && this.config.deduplication?.enabled !== false);
    const deduplicationKey = config.deduplicationKey || CryptographicEngine.buildCanonicalCacheKey(method, url, config.params, config.data);

    // Dynamic SWR Cache Evaluation for Safe (GET) Requests
    if (config.cache && method === HttpMethod.GET && !config.cache.forceRefresh) {
      const cacheStrategy = config.cache.strategy ?? CacheStrategy.STALE_WHILE_REVALIDATE;
      const ttlMs = config.cache.ttlMs ?? 60000;
      const swrMs = config.cache.staleWhileRevalidateMs ?? 30000;

      const networkFetcher = async () => {
        if (shouldDeduplicate) {
          return await this.deduplicator.executeOrJoin<T>(deduplicationKey, () =>
            this.axiosInstance.request<T, AxiosResponse<T>, D>(config)
          );
        }
        return await this.axiosInstance.request<T, AxiosResponse<T>, D>(config);
      };

      const result = await this.swrCoordinator.evaluate<T>(
        deduplicationKey,
        cacheStrategy,
        ttlMs,
        swrMs,
        networkFetcher
      );

      return result as unknown as R;
    }

    // Standard Deduplicated or Direct Execution
    if (shouldDeduplicate) {
      return (await this.deduplicator.executeOrJoin<T>(deduplicationKey, () =>
        this.axiosInstance.request<T, AxiosResponse<T>, D>(config)
      )) as unknown as R;
    }

    return (await this.axiosInstance.request<T, AxiosResponse<T>, D>(config)) as unknown as R;
  }

  public async get<T = unknown, D = unknown>(url: string, config?: ExtendedRequestConfig<D>): Promise<T> {
    const response = await this.request<T, AxiosResponse<T>, D>({
      ...config,
      method: HttpMethod.GET,
      url
    });
    return response.data;
  }

  public async post<T = unknown, D = unknown>(url: string, data?: D, config?: ExtendedRequestConfig<D>): Promise<T> {
    const transformedData = this.dataTransformer.transformRequest(data, config?.headers as Record<string, unknown>);
    const response = await this.request<T, AxiosResponse<T>, unknown>({
      ...config,
      method: HttpMethod.POST,
      url,
      data: transformedData
    });
    return response.data;
  }

  public async put<T = unknown, D = unknown>(url: string, data?: D, config?: ExtendedRequestConfig<D>): Promise<T> {
    const transformedData = this.dataTransformer.transformRequest(data, config?.headers as Record<string, unknown>);
    const response = await this.request<T, AxiosResponse<T>, unknown>({
      ...config,
      method: HttpMethod.PUT,
      url,
      data: transformedData
    });
    return response.data;
  }

  public async patch<T = unknown, D = unknown>(url: string, data?: D, config?: ExtendedRequestConfig<D>): Promise<T> {
    const transformedData = this.dataTransformer.transformRequest(data, config?.headers as Record<string, unknown>);
    const response = await this.request<T, AxiosResponse<T>, unknown>({
      ...config,
      method: HttpMethod.PATCH,
      url,
      data: transformedData
    });
    return response.data;
  }

  public async delete<T = unknown, D = unknown>(url: string, config?: ExtendedRequestConfig<D>): Promise<T> {
    const response = await this.request<T, AxiosResponse<T>, D>({
      ...config,
      method: HttpMethod.DELETE,
      url
    });
    return response.data;
  }

  public async head<T = unknown, D = unknown>(url: string, config?: ExtendedRequestConfig<D>): Promise<T> {
    const response = await this.request<T, AxiosResponse<T>, D>({
      ...config,
      method: HttpMethod.HEAD,
      url
    });
    return response.data;
  }

  public async options<T = unknown, D = unknown>(url: string, config?: ExtendedRequestConfig<D>): Promise<T> {
    const response = await this.request<T, AxiosResponse<T>, D>({
      ...config,
      method: HttpMethod.OPTIONS,
      url
    });
    return response.data;
  }

  /**
   * Helper to retrieve response wrapped in standard enterprise envelope
   */
  public async getEnveloped<T = unknown, TMeta = Record<string, unknown>, D = unknown>(
    url: string,
    config?: ExtendedRequestConfig<D>
  ): Promise<ApiResponseEnvelope<T, TMeta>> {
    const startTime = Date.now();
    const response = await this.request<T, AxiosResponse<T>, D>({
      ...config,
      method: HttpMethod.GET,
      url
    });

    const isCached = response.headers['x-cache-hit'] === 'true';
    const requestId = (response.headers['x-request-id'] as string) || (config?.requestId as string) || '';
    const correlationId = (response.headers['x-correlation-id'] as string) || (config?.correlationId as string) || '';

    return {
      success: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      meta: {
        requestId,
        correlationId,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        cached: isCached
      } as TMeta & {
        requestId: string;
        correlationId: string;
        timestamp: string;
        durationMs: number;
        cached: boolean;
      },
      headers: response.headers as Record<string, string>
    };
  }

  // Accessors for internal subsystems
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  public getTokenVault(): ITokenVault {
    return this.tokenOrchestrator.getTokenVault();
  }

  public getCacheAdapter(): ICacheAdapter {
    return this.cacheAdapter;
  }

  public getTracer(): TelemetryTracer {
    return this.tracer;
  }

  public getCircuitBreaker(serviceKey: string): CircuitBreaker {
    return this.circuitBreakerRegistry.getOrCreate(serviceKey);
  }

  public getOfflineOutbox(): NetworkOfflineOutbox {
    return this.outbox;
  }

  public async flushOfflineOutbox(): Promise<void> {
    await this.outbox.processOutbox((cfg) => this.request(cfg));
  }
}

// ============================================================================
// SECTION 24: FLUENT BUILDER ENGINE FOR CUSTOM API CLIENT INSTANCES
// ============================================================================

export class ApiClientBuilder {
  private config: ApiClientConfig = {};

  public setBaseUrl(baseUrl: string): this {
    this.config.baseURL = baseUrl;
    return this;
  }

  public setTimeout(timeoutMs: number): this {
    this.config.timeoutMs = timeoutMs;
    return this;
  }

  public setHeaders(headers: RawAxiosRequestHeaders): this {
    this.config.headers = { ...this.config.headers, ...headers };
    return this;
  }

  public setHeader(key: string, value: string): this {
    if (!this.config.headers) {
      this.config.headers = {};
    }
    this.config.headers[key] = value;
    return this;
  }

  public configureSecurity(security: Partial<SecurityPolicyConfig>): this {
    this.config.security = { ...this.config.security, ...security };
    return this;
  }

  public configureRetry(retry: Partial<RetryPolicyConfig> | false): this {
    this.config.retry = retry;
    return this;
  }

  public configureCircuitBreaker(cbConfig: Partial<ICircuitBreakerConfig>): this {
    this.config.circuitBreaker = { ...this.config.circuitBreaker, ...cbConfig };
    return this;
  }

  public configureRateLimiter(limitConfig: RateLimiterBucketConfig): this {
    this.config.rateLimiter = limitConfig;
    return this;
  }

  public configureCache(cacheConfig: {
    enabled?: boolean;
    adapter?: ICacheAdapter;
    defaultStrategy?: CacheStrategy;
    defaultTtlMs?: number;
    defaultStaleWhileRevalidateMs?: number;
  }): this {
    this.config.cache = { ...this.config.cache, ...cacheConfig };
    return this;
  }

  public setTokenVault(tokenVault: ITokenVault): this {
    this.config.tokenVault = tokenVault;
    return this;
  }

  public setTokenRefreshStrategy(strategy: TokenRefreshStrategy): this {
    this.config.tokenRefreshStrategy = strategy;
    return this;
  }

  public addTelemetryExporter(exporter: ITelemetryExporter): this {
    if (!this.config.telemetryExporters) {
      this.config.telemetryExporters = [];
    }
    this.config.telemetryExporters.push(exporter);
    return this;
  }

  public configureDeduplication(dedupConfig: { enabled?: boolean; ttlMs?: number }): this {
    this.config.deduplication = { ...this.config.deduplication, ...dedupConfig };
    return this;
  }

  public setDataTransformer(transformer: IDataTransformer): this {
    this.config.dataTransformer = transformer;
    return this;
  }

  public build(): ApiClientCore {
    return new ApiClientCore(this.config);
  }
}// ============================================================================
// SECTION 25: STRONGLY TYPED QUERY SPECIFICATION, FILTERING & PAGINATION ENGINE
// ============================================================================

export type SortOrder = 'asc' | 'desc' | 'ASC' | 'DESC';

export enum FilterOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'neq',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  IN = 'in',
  NOT_IN = 'nin',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  BETWEEN = 'between',
  EXISTS = 'exists',
  IS_NULL = 'isNull'
}

export interface QueryFilterCriteria {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export interface SortCriteria {
  field: string;
  order: SortOrder;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
  cursor?: string;
  pageSize?: number;
}

export interface SearchQueryOptions {
  query?: string;
  fields?: string[];
  fuzzy?: boolean;
}

export interface QuerySpecification {
  filters?: QueryFilterCriteria[];
  sorts?: SortCriteria[];
  pagination?: PaginationOptions;
  search?: SearchQueryOptions;
  fields?: string[];
  expand?: string[];
  extraParams?: Record<string, unknown>;
}

export class QuerySpecificationBuilder {
  private spec: QuerySpecification = {
    filters: [],
    sorts: [],
    pagination: { page: 1, limit: 20 },
    fields: [],
    expand: [],
    extraParams: {}
  };

  public static create(): QuerySpecificationBuilder {
    return new QuerySpecificationBuilder();
  }

  public filter(field: string, operator: FilterOperator, value: unknown): this {
    if (!this.spec.filters) this.spec.filters = [];
    this.spec.filters.push({ field, operator, value });
    return this;
  }

  public whereEquals(field: string, value: unknown): this {
    return this.filter(field, FilterOperator.EQUALS, value);
  }

  public whereNotEquals(field: string, value: unknown): this {
    return this.filter(field, FilterOperator.NOT_EQUALS, value);
  }

  public whereIn(field: string, values: unknown[]): this {
    return this.filter(field, FilterOperator.IN, values);
  }

  public whereBetween(field: string, start: unknown, end: unknown): this {
    return this.filter(field, FilterOperator.BETWEEN, [start, end]);
  }

  public whereContains(field: string, substring: string): this {
    return this.filter(field, FilterOperator.CONTAINS, substring);
  }

  public sortBy(field: string, order: SortOrder = 'asc'): this {
    if (!this.spec.sorts) this.spec.sorts = [];
    this.spec.sorts.push({ field, order });
    return this;
  }

  public paginate(page: number, limit: number): this {
    this.spec.pagination = { ...this.spec.pagination, page, limit, offset: (page - 1) * limit };
    return this;
  }

  public cursorPaginate(cursor: string, pageSize: number): this {
    this.spec.pagination = { cursor, pageSize, limit: pageSize };
    return this;
  }

  public search(query: string, fields: string[] = [], fuzzy: boolean = false): this {
    this.spec.search = { query, fields, fuzzy };
    return this;
  }

  public selectFields(...fields: string[]): this {
    this.spec.fields = [...(this.spec.fields || []), ...fields];
    return this;
  }

  public expandRelations(...relations: string[]): this {
    this.spec.expand = [...(this.spec.expand || []), ...relations];
    return this;
  }

  public setParam(key: string, value: unknown): this {
    if (!this.spec.extraParams) this.spec.extraParams = {};
    this.spec.extraParams[key] = value;
    return this;
  }

  public build(): QuerySpecification {
    return { ...this.spec };
  }

  public toQueryParams(): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {};

    // Filters serialization (LHS bracket or JSON-like syntax)
    if (this.spec.filters && this.spec.filters.length > 0) {
      for (const filter of this.spec.filters) {
        const key = `filter[${filter.field}][${filter.operator}]`;
        if (Array.isArray(filter.value)) {
          params[key] = filter.value.join(',');
        } else {
          params[key] = String(filter.value);
        }
      }
    }

    // Sorts serialization (e.g., sort=field:asc,field2:desc)
    if (this.spec.sorts && this.spec.sorts.length > 0) {
      params['sort'] = this.spec.sorts.map((s) => `${s.field}:${s.order.toLowerCase()}`).join(',');
    }

    // Pagination serialization
    if (this.spec.pagination) {
      if (this.spec.pagination.cursor) {
        params['cursor'] = this.spec.pagination.cursor;
        if (this.spec.pagination.pageSize) {
          params['pageSize'] = this.spec.pagination.pageSize;
        }
      } else {
        if (this.spec.pagination.page !== undefined) params['page'] = this.spec.pagination.page;
        if (this.spec.pagination.limit !== undefined) params['limit'] = this.spec.pagination.limit;
        if (this.spec.pagination.offset !== undefined) params['offset'] = this.spec.pagination.offset;
      }
    }

    // Search serialization
    if (this.spec.search && this.spec.search.query) {
      params['q'] = this.spec.search.query;
      if (this.spec.search.fields && this.spec.search.fields.length > 0) {
        params['searchFields'] = this.spec.search.fields.join(',');
      }
      if (this.spec.search.fuzzy) {
        params['fuzzy'] = true;
      }
    }

    // Field selection & expands
    if (this.spec.fields && this.spec.fields.length > 0) {
      params['fields'] = this.spec.fields.join(',');
    }
    if (this.spec.expand && this.spec.expand.length > 0) {
      params['expand'] = this.spec.expand.join(',');
    }

    // Extra dynamic parameters
    if (this.spec.extraParams) {
      for (const [key, value] of Object.entries(this.spec.extraParams)) {
        if (value !== undefined && value !== null) {
          params[key] = typeof value === 'object' ? JSON.stringify(value) : (value as string | number | boolean);
        }
      }
    }

    return params;
  }
}

// ============================================================================
// SECTION 26: HMAC-SHA256 REQUEST SIGNING & REPLAY PREVENTION ENGINE
// ============================================================================

export interface RequestSignerOptions {
  apiKeyId: string;
  secretKey: string;
  headerPrefix?: string;
  signatureAlgorithm?: 'HMAC-SHA256';
  validityWindowMs?: number;
}

export class RequestSignerEngine {
  private readonly options: Required<RequestSignerOptions>;

  constructor(options: RequestSignerOptions) {
    this.options = {
      apiKeyId: options.apiKeyId,
      secretKey: options.secretKey,
      headerPrefix: options.headerPrefix ?? 'x-sig-',
      signatureAlgorithm: options.signatureAlgorithm ?? 'HMAC-SHA256',
      validityWindowMs: options.validityWindowMs ?? 300000 // 5 minutes
    };
  }

  public async signRequest(
    method: string,
    url: string,
    body?: unknown,
    nonce?: string,
    timestamp?: number
  ): Promise<Record<string, string>> {
    const currentTimestamp = timestamp || Date.now();
    const currentNonce = nonce || CryptographicEngine.generateUuidV4();
    const bodyHash = CryptographicEngine.fastHash(body || '');

    const canonicalUrl = this.canonicalizeUrl(url);
    const payloadToSign = [
      method.toUpperCase(),
      canonicalUrl,
      String(currentTimestamp),
      currentNonce,
      bodyHash
    ].join('\n');

    const signature = await this.computeHmacSha256(this.options.secretKey, payloadToSign);

    const prefix = this.options.headerPrefix;
    return {
      [`${prefix}key-id`]: this.options.apiKeyId,
      [`${prefix}algorithm`]: this.options.signatureAlgorithm,
      [`${prefix}timestamp`]: String(currentTimestamp),
      [`${prefix}nonce`]: currentNonce,
      [`${prefix}signature`]: signature
    };
  }

  private canonicalizeUrl(url: string): string {
    try {
      const parsed = new URL(url, 'http://localhost');
      return `${parsed.pathname}${parsed.search}`;
    } catch {
      return url;
    }
  }

  private async computeHmacSha256(secret: string, message: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const messageData = encoder.encode(message);

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: { name: 'SHA-256' } },
        false,
        ['sign']
      );

      const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
      const byteArray = new Uint8Array(signatureBuffer);
      return Array.from(byteArray)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }

    // Fallback cryptographic pseudo-HMAC representation
    return CryptographicEngine.fastHash(`${secret}::${message}::hmac`);
  }
}

// ============================================================================
// SECTION 27: IDEMPOTENCY KEY MANAGER & TRANSACTION COORDINATOR
// ============================================================================

export interface IdempotencyRecord {
  key: string;
  fingerprint: string;
  createdAt: number;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  responsePayload?: unknown;
}

export class IdempotencyManager {
  private readonly storage: Map<string, IdempotencyRecord> = new Map();
  private readonly defaultTtlMs: number;

  constructor(defaultTtlMs: number = 86400000) { // 24 hours
    this.defaultTtlMs = defaultTtlMs;
  }

  public generateIdempotencyKey(endpoint: string, method: string, payload?: unknown): string {
    const fingerprint = CryptographicEngine.fastHash({ endpoint, method, payload });
    const uuid = CryptographicEngine.generateUuidV4();
    const key = `idemp_${fingerprint}_${uuid}`;

    this.storage.set(key, {
      key,
      fingerprint,
      createdAt: Date.now(),
      status: 'PENDING'
    });

    return key;
  }

  public markResolved(key: string, responsePayload: unknown): void {
    const record = this.storage.get(key);
    if (record) {
      record.status = 'RESOLVED';
      record.responsePayload = responsePayload;
    }
  }

  public markRejected(key: string): void {
    const record = this.storage.get(key);
    if (record) {
      record.status = 'REJECTED';
    }
  }

  public getRecord(key: string): IdempotencyRecord | null {
    const record = this.storage.get(key);
    if (!record) return null;

    if (Date.now() - record.createdAt > this.defaultTtlMs) {
      this.storage.delete(key);
      return null;
    }

    return record;
  }

  public prune(): void {
    const now = Date.now();
    for (const [key, record] of this.storage.entries()) {
      if (now - record.createdAt > this.defaultTtlMs) {
        this.storage.delete(key);
      }
    }
  }
}

// ============================================================================
// SECTION 28: GENERIC REPOSITORY CONTRACT & BASE RESOURCE CONTROLLER
// ============================================================================

export interface BaseEntity {
  id: string | number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  deletedAt?: string | Date | null;
  version?: number;
}

export interface IPaginatedResult<TEntity> {
  items: TEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  cursor?: string;
}

export interface IResourceRepository<TEntity extends BaseEntity, TCreateInput = Partial<TEntity>, TUpdateInput = Partial<TEntity>> {
  findById(id: string | number, options?: { expand?: string[]; fields?: string[] }): Promise<TEntity>;
  findMany(spec?: QuerySpecification | QuerySpecificationBuilder): Promise<IPaginatedResult<TEntity>>;
  create(data: TCreateInput, options?: { idempotencyKey?: string }): Promise<TEntity>;
  update(id: string | number, data: TUpdateInput): Promise<TEntity>;
  patch(id: string | number, partialData: Partial<TUpdateInput>): Promise<TEntity>;
  delete(id: string | number, soft?: boolean): Promise<boolean>;
  bulkCreate(items: TCreateInput[]): Promise<TEntity[]>;
  bulkDelete(ids: Array<string | number>): Promise<number>;
}

export class BaseResourceRepository<TEntity extends BaseEntity, TCreateInput = Partial<TEntity>, TUpdateInput = Partial<TEntity>>
  implements IResourceRepository<TEntity, TCreateInput, TUpdateInput> {
  protected readonly client: ApiClientCore;
  protected readonly basePath: string;
  protected readonly resourceName: string;

  constructor(client: ApiClientCore, basePath: string, resourceName: string) {
    this.client = client;
    this.basePath = basePath.startsWith('/') ? basePath : `/${basePath}`;
    this.resourceName = resourceName;
  }

  public async findById(id: string | number, options?: { expand?: string[]; fields?: string[] }): Promise<TEntity> {
    const params: Record<string, string> = {};
    if (options?.expand && options.expand.length > 0) {
      params['expand'] = options.expand.join(',');
    }
    if (options?.fields && options.fields.length > 0) {
      params['fields'] = options.fields.join(',');
    }

    return await this.client.get<TEntity>(`${this.basePath}/${encodeURIComponent(String(id))}`, {
      params,
      initiator: `${this.resourceName}.findById`
    });
  }

  public async findMany(spec?: QuerySpecification | QuerySpecificationBuilder): Promise<IPaginatedResult<TEntity>> {
    let params: Record<string, unknown> = {};

    if (spec instanceof QuerySpecificationBuilder) {
      params = spec.toQueryParams();
    } else if (spec) {
      const builder = QuerySpecificationBuilder.create();
      if (spec.filters) spec.filters.forEach((f) => builder.filter(f.field, f.operator, f.value));
      if (spec.sorts) spec.sorts.forEach((s) => builder.sortBy(s.field, s.order));
      if (spec.pagination?.page && spec.pagination?.limit) builder.paginate(spec.pagination.page, spec.pagination.limit);
      if (spec.search?.query) builder.search(spec.search.query, spec.search.fields, spec.search.fuzzy);
      if (spec.fields) builder.selectFields(...spec.fields);
      if (spec.expand) builder.expandRelations(...spec.expand);
      if (spec.extraParams) {
        for (const [k, v] of Object.entries(spec.extraParams)) {
          builder.setParam(k, v);
        }
      }
      params = builder.toQueryParams();
    }

    const response = await this.client.request<{
      data: TEntity[];
      meta?: {
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
        hasNextPage?: boolean;
        hasPreviousPage?: boolean;
        cursor?: string;
      };
      items?: TEntity[];
      total?: number;
    }>({
      method: HttpMethod.GET,
      url: this.basePath,
      params,
      initiator: `${this.resourceName}.findMany`
    });

    const body = response.data;
    const items = body.data || body.items || [];
    const total = body.meta?.total ?? body.total ?? items.length;
    const page = body.meta?.page ?? 1;
    const limit = body.meta?.limit ?? (items.length || 20);
    const totalPages = body.meta?.totalPages ?? Math.ceil(total / (limit || 1));

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: body.meta?.hasNextPage ?? page < totalPages,
      hasPreviousPage: body.meta?.hasPreviousPage ?? page > 1,
      cursor: body.meta?.cursor
    };
  }

  public async create(data: TCreateInput, options?: { idempotencyKey?: string }): Promise<TEntity> {
    const headers: Record<string, string> = {};
    if (options?.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    return await this.client.post<TEntity, TCreateInput>(this.basePath, data, {
      headers,
      initiator: `${this.resourceName}.create`
    });
  }

  public async update(id: string | number, data: TUpdateInput): Promise<TEntity> {
    return await this.client.put<TEntity, TUpdateInput>(
      `${this.basePath}/${encodeURIComponent(String(id))}`,
      data,
      { initiator: `${this.resourceName}.update` }
    );
  }

  public async patch(id: string | number, partialData: Partial<TUpdateInput>): Promise<TEntity> {
    return await this.client.patch<TEntity, Partial<TUpdateInput>>(
      `${this.basePath}/${encodeURIComponent(String(id))}`,
      partialData,
      { initiator: `${this.resourceName}.patch` }
    );
  }

  public async delete(id: string | number, soft: boolean = false): Promise<boolean> {
    const params = soft ? { soft: true } : undefined;
    await this.client.delete(`${this.basePath}/${encodeURIComponent(String(id))}`, {
      params,
      initiator: `${this.resourceName}.delete`
    });
    return true;
  }

  public async bulkCreate(items: TCreateInput[]): Promise<TEntity[]> {
    return await this.client.post<TEntity[], { items: TCreateInput[] }>(
      `${this.basePath}/bulk`,
      { items },
      { initiator: `${this.resourceName}.bulkCreate` }
    );
  }

  public async bulkDelete(ids: Array<string | number>): Promise<number> {
    const response = await this.client.post<{ deletedCount: number }, { ids: Array<string | number> }>(
      `${this.basePath}/bulk-delete`,
      { ids },
      { initiator: `${this.resourceName}.bulkDelete` }
    );
    return response.deletedCount;
  }
}

// ============================================================================
// SECTION 29: DOMAIN DATA ENTITIES & SPECIALIZED MICROSERVICE CLIENTS
// ============================================================================

export interface UserAccountEntity extends BaseEntity {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  isVerified: boolean;
  avatarUrl?: string;
  lastLoginAt?: string;
  twoFactorEnabled: boolean;
}

export interface UserCreateDto {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password?: string;
  roles?: string[];
}

export interface UserUpdateDto {
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  roles?: string[];
  isActive?: boolean;
}

export class UserManagementClient extends BaseResourceRepository<UserAccountEntity, UserCreateDto, UserUpdateDto> {
  constructor(client: ApiClientCore) {
    super(client, '/users', 'UserManagementClient');
  }

  public async getCurrentUserProfile(): Promise<UserAccountEntity> {
    return await this.client.get<UserAccountEntity>(`${this.basePath}/me`, {
      initiator: 'UserManagementClient.getCurrentUserProfile'
    });
  }

  public async updateCurrentUserProfile(profileData: Partial<UserUpdateDto>): Promise<UserAccountEntity> {
    return await this.client.patch<UserAccountEntity, Partial<UserUpdateDto>>(`${this.basePath}/me`, profileData, {
      initiator: 'UserManagementClient.updateCurrentUserProfile'
    });
  }

  public async uploadAvatar(file: Blob, fileName: string): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file, fileName);

    const response = await this.client.request<{ avatarUrl: string }>({
      method: HttpMethod.POST,
      url: `${this.basePath}/me/avatar`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      initiator: 'UserManagementClient.uploadAvatar'
    });

    return response.data;
  }

  public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.client.post(`${this.basePath}/me/change-password`, {
      currentPassword,
      newPassword
    }, { initiator: 'UserManagementClient.changePassword' });
  }

  public async enableTwoFactor(): Promise<{ qrCodeDataUrl: string; secret: string }> {
    return await this.client.post<{ qrCodeDataUrl: string; secret: string }>(
      `${this.basePath}/me/2fa/enable`,
      {},
      { initiator: 'UserManagementClient.enableTwoFactor' }
    );
  }

  public async verifyTwoFactor(code: string): Promise<{ success: boolean; recoveryCodes: string[] }> {
    return await this.client.post<{ success: boolean; recoveryCodes: string[] }>(
      `${this.basePath}/me/2fa/verify`,
      { code },
      { initiator: 'UserManagementClient.verifyTwoFactor' }
    );
  }
}

export interface WorkspaceEntity extends BaseEntity {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  memberCount: number;
  settings: Record<string, unknown>;
}

export class WorkspaceClient extends BaseResourceRepository<WorkspaceEntity> {
  constructor(client: ApiClientCore) {
    super(client, '/workspaces', 'WorkspaceClient');
  }

  public async getMembers(workspaceId: string): Promise<Array<{ userId: string; role: string; joinedAt: string }>> {
    return await this.client.get<Array<{ userId: string; role: string; joinedAt: string }>>(
      `${this.basePath}/${encodeURIComponent(workspaceId)}/members`,
      { initiator: 'WorkspaceClient.getMembers' }
    );
  }

  public async inviteMember(workspaceId: string, email: string, role: string): Promise<{ invitationId: string }> {
    return await this.client.post<{ invitationId: string }>(
      `${this.basePath}/${encodeURIComponent(workspaceId)}/invitations`,
      { email, role },
      { initiator: 'WorkspaceClient.inviteMember' }
    );
  }
}

export interface AuditLogEntity extends BaseEntity {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export class AuditLogClient extends BaseResourceRepository<AuditLogEntity> {
  constructor(client: ApiClientCore) {
    super(client, '/audit-logs', 'AuditLogClient');
  }

  public async queryByActor(actorId: string, limit: number = 50): Promise<AuditLogEntity[]> {
    const spec = QuerySpecificationBuilder.create()
      .whereEquals('actorId', actorId)
      .sortBy('createdAt', 'desc')
      .paginate(1, limit)
      .build();

    const result = await this.findMany(spec);
    return result.items;
  }
}

// ============================================================================
// SECTION 30: HEALTH CHECKS, SYSTEM STATUS PROBES & SERVICE DISCOVERY
// ============================================================================

export interface ServiceHealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptimeSeconds: number;
  timestamp: string;
  version: string;
  checks: Record<
    string,
    {
      status: 'pass' | 'warn' | 'fail';
      responseTimeMs: number;
      observedValue?: unknown;
      message?: string;
    }
  >;
}

export class HealthCheckProbeManager {
  private readonly client: ApiClientCore;
  private readonly healthEndpoint: string;
  private readonly livenessEndpoint: string;
  private readonly readinessEndpoint: string;

  constructor(
    client: ApiClientCore,
    healthEndpoint: string = '/health',
    livenessEndpoint: string = '/health/liveness',
    readinessEndpoint: string = '/health/readiness'
  ) {
    this.client = client;
    this.healthEndpoint = healthEndpoint;
    this.livenessEndpoint = livenessEndpoint;
    this.readinessEndpoint = readinessEndpoint;
  }

  public async checkHealth(): Promise<ServiceHealthReport> {
    const response = await this.client.request<ServiceHealthReport>({
      method: HttpMethod.GET,
      url: this.healthEndpoint,
      skipAuth: true,
      retry: false,
      cache: false
    });
    return response.data;
  }

  public async checkLiveness(): Promise<boolean> {
    try {
      const response = await this.client.request({
        method: HttpMethod.GET,
        url: this.livenessEndpoint,
        skipAuth: true,
        retry: false,
        cache: false,
        timeoutMs: 3000
      });
      return response.status >= 200 && response.status < 300;
    } catch {
      return false;
    }
  }

  public async checkReadiness(): Promise<boolean> {
    try {
      const response = await this.client.request({
        method: HttpMethod.GET,
        url: this.readinessEndpoint,
        skipAuth: true,
        retry: false,
        cache: false,
        timeoutMs: 5000
      });
      return response.status >= 200 && response.status < 300;
    } catch {
      return false;
    }
  }
}// ============================================================================
// SECTION 31: ADVANCED CACHE INVALIDATION & TAG-BASED CACHE PURGING ENGINE
// ============================================================================

export interface CacheTagIndex {
  tag: string;
  cacheKeys: Set<string>;
  createdAt: number;
  lastInvalidatedAt?: number;
}

export interface TaggedCacheInvalidationRule {
  pattern?: RegExp;
  tags: string[];
  exactKeys?: string[];
  cascadeTags?: string[];
}

export class HierarchicalCacheTagManager {
  private tagIndex: Map<string, Set<string>> = new Map();
  private keyToTags: Map<string, Set<string>> = new Map();
  private cacheAdapter: ICacheAdapter;
  private tracer: TelemetryTracer;

  constructor(cacheAdapter: ICacheAdapter, tracer: TelemetryTracer) {
    this.cacheAdapter = cacheAdapter;
    this.tracer = tracer;
  }

  public register(cacheKey: string, tags: string[]): void {
    if (!tags || tags.length === 0) return;

    let keyTags = this.keyToTags.get(cacheKey);
    if (!keyTags) {
      keyTags = new Set();
      this.keyToTags.set(cacheKey, keyTags);
    }

    for (const tag of tags) {
      const normalizedTag = tag.trim().toLowerCase();
      keyTags.add(normalizedTag);

      let tagKeys = this.tagIndex.get(normalizedTag);
      if (!tagKeys) {
        tagKeys = new Set();
        this.tagIndex.set(normalizedTag, tagKeys);
      }
      tagKeys.add(cacheKey);
    }
  }

  public async invalidateTag(tag: string): Promise<string[]> {
    const normalizedTag = tag.trim().toLowerCase();
    const keys = this.tagIndex.get(normalizedTag);
    if (!keys || keys.size === 0) {
      return [];
    }

    const invalidatedKeys: string[] = [];
    for (const key of Array.from(keys)) {
      await this.cacheAdapter.delete(key);
      invalidatedKeys.push(key);
      this.untrackKey(key);
    }

    this.tagIndex.delete(normalizedTag);

    this.tracer.recordMetric(TelemetryEventType.CACHE_EVICT, {
      tag: normalizedTag,
      invalidatedCount: invalidatedKeys.length
    });

    return invalidatedKeys;
  }

  public async invalidateTags(tags: string[]): Promise<string[]> {
    const uniqueKeys = new Set<string>();
    for (const tag of tags) {
      const keys = await this.invalidateTag(tag);
      keys.forEach((k) => uniqueKeys.add(k));
    }
    return Array.from(uniqueKeys);
  }

  public async invalidateByPattern(regex: RegExp): Promise<string[]> {
    const invalidatedKeys: string[] = [];
    for (const [key] of this.keyToTags.entries()) {
      if (regex.test(key)) {
        await this.cacheAdapter.delete(key);
        invalidatedKeys.push(key);
        this.untrackKey(key);
      }
    }
    return invalidatedKeys;
  }

  public getKeysForTag(tag: string): string[] {
    const normalizedTag = tag.trim().toLowerCase();
    const keys = this.tagIndex.get(normalizedTag);
    return keys ? Array.from(keys) : [];
  }

  public getTagsForKey(key: string): string[] {
    const tags = this.keyToTags.get(key);
    return tags ? Array.from(tags) : [];
  }

  private untrackKey(cacheKey: string): void {
    const tags = this.keyToTags.get(cacheKey);
    if (tags) {
      for (const tag of tags) {
        const tagKeys = this.tagIndex.get(tag);
        if (tagKeys) {
          tagKeys.delete(cacheKey);
          if (tagKeys.size === 0) {
            this.tagIndex.delete(tag);
          }
        }
      }
      this.keyToTags.delete(cacheKey);
    }
  }

  public clear(): void {
    this.tagIndex.clear();
    this.keyToTags.clear();
  }
}

// ============================================================================
// SECTION 32: MULTI-REGION HIGH AVAILABILITY & FAILOVER ROUTING ENGINE
// ============================================================================

export interface RegionalEndpointConfig {
  regionId: string;
  baseUrl: string;
  priority: number;
  weight?: number;
  healthy: boolean;
  consecutiveFailures: number;
  lastLatencyMs?: number;
  lastCheckedTimestamp?: number;
}

export interface RegionFailoverPolicy {
  healthCheckIntervalMs: number;
  healthCheckTimeoutMs: number;
  maxConsecutiveFailuresBeforeUnhealthy: number;
  recoverySuccessThreshold: number;
  latencyMeasurementWindow: number;
}

export class RegionalFailoverRouter {
  private regions: RegionalEndpointConfig[];
  private readonly policy: RegionFailoverPolicy;
  private currentPrimaryRegion: RegionalEndpointConfig;
  private healthCheckTimer: ReturnType<typeof setInterval> | null = null;
  private tracer: TelemetryTracer;

  constructor(
    regions: RegionalEndpointConfig[],
    tracer: TelemetryTracer,
    policy?: Partial<RegionFailoverPolicy>
  ) {
    if (!regions || regions.length === 0) {
      throw new ApiClientError('RegionalFailoverRouter requires at least one region endpoint', 'INVALID_REGION_CONFIG');
    }

    this.regions = [...regions].sort((a, b) => a.priority - b.priority);
    this.currentPrimaryRegion = this.regions[0];
    this.tracer = tracer;
    this.policy = {
      healthCheckIntervalMs: 30000,
      healthCheckTimeoutMs: 3000,
      maxConsecutiveFailuresBeforeUnhealthy: 3,
      recoverySuccessThreshold: 2,
      latencyMeasurementWindow: 5,
      ...policy
    };

    this.startHealthChecks();
  }

  public getActiveBaseUrl(): string {
    const healthyRegions = this.regions.filter((r) => r.healthy);
    if (healthyRegions.length === 0) {
      // Degraded fallback: Return default primary even if marked unhealthy
      return this.currentPrimaryRegion.baseUrl;
    }

    // Return the highest-priority healthy region
    return healthyRegions[0].baseUrl;
  }

  public getActiveRegion(): RegionalEndpointConfig {
    const healthyRegions = this.regions.filter((r) => r.healthy);
    return healthyRegions.length > 0 ? healthyRegions[0] : this.currentPrimaryRegion;
  }

  public recordSuccess(regionId: string, latencyMs?: number): void {
    const region = this.regions.find((r) => r.regionId === regionId);
    if (!region) return;

    region.consecutiveFailures = 0;
    region.healthy = true;
    if (latencyMs !== undefined) {
      region.lastLatencyMs = latencyMs;
    }
    region.lastCheckedTimestamp = Date.now();
  }

  public recordFailure(regionId: string): void {
    const region = this.regions.find((r) => r.regionId === regionId);
    if (!region) return;

    region.consecutiveFailures++;
    region.lastCheckedTimestamp = Date.now();

    if (region.consecutiveFailures >= this.policy.maxConsecutiveFailuresBeforeUnhealthy) {
      if (region.healthy) {
        region.healthy = false;
        this.tracer.recordMetric(TelemetryEventType.CIRCUIT_OPENED, {
          event: 'REGION_MARKED_UNHEALTHY',
          regionId: region.regionId,
          baseUrl: region.baseUrl,
          consecutiveFailures: region.consecutiveFailures
        });
        this.reevaluatePrimary();
      }
    }
  }

  private reevaluatePrimary(): void {
    const previousPrimary = this.currentPrimaryRegion;
    const bestAvailable = this.regions.find((r) => r.healthy) || this.regions[0];

    if (previousPrimary.regionId !== bestAvailable.regionId) {
      this.currentPrimaryRegion = bestAvailable;
      this.tracer.recordMetric(TelemetryEventType.CIRCUIT_HALF_OPEN, {
        event: 'REGION_FAILOVER_TRIGGERED',
        fromRegion: previousPrimary.regionId,
        toRegion: bestAvailable.regionId,
        newBaseUrl: bestAvailable.baseUrl
      });
    }
  }

  public async probeAllRegions(): Promise<Record<string, { healthy: boolean; latencyMs: number }>> {
    const results: Record<string, { healthy: boolean; latencyMs: number }> = {};

    const probePromises = this.regions.map(async (region) => {
      const startTime = Date.now();
      try {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeout = setTimeout(() => controller?.abort(), this.policy.healthCheckTimeoutMs);

        const healthUrl = `${region.baseUrl}/health/liveness`;
        const response = await fetch(healthUrl, {
          method: 'GET',
          signal: controller?.signal
        });
        clearTimeout(timeout);

        const latency = Date.now() - startTime;
        const isOk = response.status >= 200 && response.status < 300;

        if (isOk) {
          this.recordSuccess(region.regionId, latency);
        } else {
          this.recordFailure(region.regionId);
        }

        results[region.regionId] = { healthy: isOk, latencyMs: latency };
      } catch {
        const latency = Date.now() - startTime;
        this.recordFailure(region.regionId);
        results[region.regionId] = { healthy: false, latencyMs: latency };
      }
    });

    await Promise.allSettled(probePromises);
    return results;
  }

  private startHealthChecks(): void {
    if (this.healthCheckTimer) return;
    this.healthCheckTimer = setInterval(() => {
      this.probeAllRegions().catch((err) => {
        console.warn('Regional background probe error:', err);
      });
    }, this.policy.healthCheckIntervalMs);
  }

  public destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }
}

// ============================================================================
// SECTION 33: CONTENT ENCODING, COMPRESSION & STREAMING DECOMPRESSION ENGINE
// ============================================================================

export interface CompressionOptions {
  thresholdBytes: number;
  preferredEncoding: 'gzip' | 'deflate' | 'identity';
}

export class ContentEncodingManager {
  private readonly thresholdBytes: number;

  constructor(options?: Partial<CompressionOptions>) {
    this.thresholdBytes = options?.thresholdBytes ?? 1024; // 1KB
  }

  public shouldCompress(payload: unknown): boolean {
    if (payload === null || payload === undefined) return false;

    let sizeInBytes = 0;
    if (typeof payload === 'string') {
      sizeInBytes = payload.length;
    } else if (typeof payload === 'object') {
      try {
        sizeInBytes = JSON.stringify(payload).length;
      } catch {
        return false;
      }
    }

    return sizeInBytes >= this.thresholdBytes;
  }

  public async compressString(content: string): Promise<Uint8Array> {
    if (typeof CompressionStream !== 'undefined') {
      const stream = new Blob([content]).stream();
      const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
      const response = new Response(compressedStream);
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer);
    }
    // Fallback: return raw UTF-8 bytes
    return new TextEncoder().encode(content);
  }

  public async decompressBytes(bytes: Uint8Array, encoding: string): Promise<string> {
    if (typeof DecompressionStream !== 'undefined' && (encoding === 'gzip' || encoding === 'deflate')) {
      const stream = new Blob([bytes]).stream();
      const decompressedStream = stream.pipeThrough(new DecompressionStream(encoding as 'gzip' | 'deflate'));
      const response = new Response(decompressedStream);
      return await response.text();
    }
    return new TextDecoder().decode(bytes);
  }
}

// ============================================================================
// SECTION 34: ADVANCED CLIENT-SIDE SCHEMA VALIDATION & RUNTIME TYPE ENFORCEMENT
// ============================================================================

export type SchemaFieldType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'uuid' | 'email';

export interface FieldValidationRule {
  type: SchemaFieldType;
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean | string;
  nestedSchema?: SchemaDefinition;
  itemType?: SchemaFieldType;
}

export type SchemaDefinition = Record<string, FieldValidationRule>;

export interface SchemaValidationReport {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    receivedValue: unknown;
    expectedType: string;
  }>;
}

export class RuntimeSchemaValidator {
  private static emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  public static validate(data: unknown, schema: SchemaDefinition, pathPrefix: string = ''): SchemaValidationReport {
    const report: SchemaValidationReport = {
      valid: true,
      errors: []
    };

    if (typeof data !== 'object' || data === null) {
      report.valid = false;
      report.errors.push({
        field: pathPrefix || 'root',
        message: `Expected root payload to be an object, received ${typeof data}`,
        receivedValue: data,
        expectedType: 'object'
      });
      return report;
    }

    const obj = data as Record<string, unknown>;

    for (const [fieldKey, rule] of Object.entries(schema)) {
      const fullPath = pathPrefix ? `${pathPrefix}.${fieldKey}` : fieldKey;
      const value = obj[fieldKey];

      // Check Required
      if (value === undefined || value === null) {
        if (rule.required) {
          report.valid = false;
          report.errors.push({
            field: fullPath,
            message: `Field [${fullPath}] is required but received ${value === null ? 'null' : 'undefined'}`,
            receivedValue: value,
            expectedType: rule.type
          });
        }
        continue;
      }

      // Check Types
      const typeValid = this.checkType(value, rule.type);
      if (!typeValid) {
        report.valid = false;
        report.errors.push({
          field: fullPath,
          message: `Field [${fullPath}] expected type ${rule.type}, received ${typeof value}`,
          receivedValue: value,
          expectedType: rule.type
        });
        continue;
      }

      // Check String / Number constraints
      if (rule.type === 'string' && typeof value === 'string') {
        if (rule.min !== undefined && value.length < rule.min) {
          report.valid = false;
          report.errors.push({
            field: fullPath,
            message: `Field [${fullPath}] length ${value.length} is below minimum allowed length ${rule.min}`,
            receivedValue: value,
            expectedType: rule.type
          });
        }
        if (rule.max !== undefined && value.length > rule.max) {
          report.valid = false;
          report.errors.push({
            field: fullPath,
            message: `Field [${fullPath}] length ${value.length} exceeds maximum allowed length ${rule.max}`,
            receivedValue: value,
            expectedType: rule.type
          });
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          report.valid = false;
          report.errors.push({
            field: fullPath,
            message: `Field [${fullPath}] fails pattern match: ${rule.pattern.toString()}`,
            receivedValue: value,
            expectedType: rule.type
          });
        }
      }

      if (rule.type === 'number' && typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          report.valid = false;
          report.errors.push({
            field: fullPath,
            message: `Field [${fullPath}] value ${value} is below minimum threshold ${rule.min}`,
            receivedValue: value,
            expectedType: rule.type
          });
        }
        if (rule.max !== undefined && value > rule.max) {
          report.valid = false;
          report.errors.push({
            field: fullPath,
            message: `Field [${fullPath}] value ${value} exceeds maximum threshold ${rule.max}`,
            receivedValue: value,
            expectedType: rule.type
          });
        }
      }

      // Check Arrays
      if (rule.type === 'array' && Array.isArray(value)) {
        if (rule.min !== undefined && value.length < rule.min) {
          report.valid = false;
          report.errors.push({
            field: fullPath,
            message: `Array [${fullPath}] item count ${value.length} is below minimum ${rule.min}`,
            receivedValue: value,
            expectedType: 'array'
          });
        }
        if (rule.itemType) {
          for (let i = 0; i < value.length; i++) {
            const item = value[i];
            if (!this.checkType(item, rule.itemType)) {
              report.valid = false;
              report.errors.push({
                field: `${fullPath}[${i}]`,
                message: `Array item at index ${i} expected type ${rule.itemType}, received ${typeof item}`,
                receivedValue: item,
                expectedType: rule.itemType
              });
            }
          }
        }
      }

      // Check Nested Object Schemas
      if (rule.type === 'object' && rule.nestedSchema && typeof value === 'object') {
        const nestedReport = this.validate(value, rule.nestedSchema, fullPath);
        if (!nestedReport.valid) {
          report.valid = false;
          report.errors.push(...nestedReport.errors);
        }
      }

      // Check Custom Validator
      if (rule.custom) {
        const customResult = rule.custom(value);
        if (customResult !== true) {
          report.valid = false;
          report.errors.push({
            field: fullPath,
            message: typeof customResult === 'string' ? customResult : `Custom validation constraint failed for [${fullPath}]`,
            receivedValue: value,
            expectedType: rule.type
          });
        }
      }
    }

    return report;
  }

  private static checkType(val: unknown, type: SchemaFieldType): boolean {
    switch (type) {
      case 'string':
        return typeof val === 'string';
      case 'number':
        return typeof val === 'number' && !isNaN(val);
      case 'boolean':
        return typeof val === 'boolean';
      case 'array':
        return Array.isArray(val);
      case 'object':
        return typeof val === 'object' && val !== null && !Array.isArray(val);
      case 'date':
        return val instanceof Date || (typeof val === 'string' && !isNaN(Date.parse(val)));
      case 'email':
        return typeof val === 'string' && this.emailRegex.test(val);
      case 'uuid':
        return typeof val === 'string' && this.uuidRegex.test(val);
      default:
        return false;
    }
  }
}

// ============================================================================
// SECTION 35: CONDITIONAL HTTP HEADERS & RFC 7232 ENTITY TAG (ETAG) NEGOTIATION
// ============================================================================

export interface ETagEntityRecord {
  url: string;
  etag: string;
  lastModified?: string;
  cachedResponse: unknown;
  savedAt: number;
}

export class ConditionalHeaderNegotiator {
  private etagStorage: Map<string, ETagEntityRecord> = new Map();

  public prepareConditionalHeaders(url: string, existingHeaders: Record<string, string> = {}): Record<string, string> {
    const record = this.etagStorage.get(url);
    if (!record) {
      return existingHeaders;
    }

    const headers: Record<string, string> = { ...existingHeaders };
    if (record.etag) {
      headers['If-None-Match'] = record.etag;
    }
    if (record.lastModified) {
      headers['If-Modified-Since'] = record.lastModified;
    }

    return headers;
  }

  public handleResponse(
    url: string,
    status: number,
    responseHeaders: Record<string, string>,
    responseBody: unknown
  ): { body: unknown; from304Cache: boolean } {
    if (status === HttpStatus.NOT_MODIFIED) {
      const cached = this.etagStorage.get(url);
      if (cached) {
        return { body: cached.cachedResponse, from304Cache: true };
      }
    }

    const etag = responseHeaders['etag'] || responseHeaders['ETag'];
    const lastModified = responseHeaders['last-modified'] || responseHeaders['Last-Modified'];

    if (etag && status >= 200 && status < 300) {
      this.etagStorage.set(url, {
        url,
        etag,
        lastModified,
        cachedResponse: responseBody,
        savedAt: Date.now()
      });
    }

    return { body: responseBody, from304Cache: false };
  }

  public invalidate(url: string): void {
    this.etagStorage.delete(url);
  }

  public clear(): void {
    this.etagStorage.clear();
  }
}

// ============================================================================
// SECTION 36: PERSISTENT TRANSACTIONAL MUTATION QUEUE WITH ROLLBACK
// ============================================================================

export interface TransactionStep<TPayload = unknown, TResponse = unknown> {
  stepId: string;
  operationName: string;
  forward: (payload: TPayload) => Promise<TResponse>;
  compensate: (result: TResponse, originalPayload: TPayload) => Promise<void>;
  payload: TPayload;
}

export interface TransactionExecutionResult {
  transactionId: string;
  success: boolean;
  completedSteps: string[];
  failedStepId?: string;
  compensationSuccess?: boolean;
  error?: Error;
}

export class SagaTransactionCoordinator {
  private tracer: TelemetryTracer;

  constructor(tracer: TelemetryTracer) {
    this.tracer = tracer;
  }

  public async executeSaga(
    transactionName: string,
    steps: TransactionStep[]
  ): Promise<TransactionExecutionResult> {
    const transactionId = CryptographicEngine.generateUuidV4();
    const completedStepRecords: Array<{ step: TransactionStep; response: unknown }> = [];

    const span = this.tracer.startSpan(`Saga: ${transactionName}`, undefined, {
      transactionId,
      stepCount: steps.length
    });

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      try {
        this.tracer.addEvent(span.spanId, `Step Start: ${step.operationName}`, { stepId: step.stepId });
        const response = await step.forward(step.payload);
        completedStepRecords.push({ step, response });
        this.tracer.addEvent(span.spanId, `Step Success: ${step.operationName}`, { stepId: step.stepId });
      } catch (stepError) {
        const error = stepError instanceof Error ? stepError : new Error(String(stepError));
        this.tracer.addEvent(span.spanId, `Step Failed: ${step.operationName}`, {
          stepId: step.stepId,
          error: error.message
        });

        // Trigger Backward Compensation Saga
        const compSuccess = await this.rollbackCompensations(completedStepRecords, span.spanId);
        this.tracer.endSpan(span.spanId, 'ERROR', error);

        return {
          transactionId,
          success: false,
          completedSteps: completedStepRecords.map((r) => r.step.stepId),
          failedStepId: step.stepId,
          compensationSuccess: compSuccess,
          error
        };
      }
    }

    this.tracer.endSpan(span.spanId, 'OK');
    return {
      transactionId,
      success: true,
      completedSteps: completedStepRecords.map((r) => r.step.stepId)
    };
  }

  private async rollbackCompensations(
    completedSteps: Array<{ step: TransactionStep; response: unknown }>,
    spanId: string
  ): Promise<boolean> {
    let allCompensationsSucceeded = true;
    const reverseOrder = [...completedSteps].reverse();

    for (const record of reverseOrder) {
      try {
        this.tracer.addEvent(spanId, `Compensating Step: ${record.step.operationName}`, { stepId: record.step.stepId });
        await record.step.compensate(record.response, record.step.payload);
        this.tracer.addEvent(spanId, `Compensated Step: ${record.step.operationName}`, { stepId: record.step.stepId });
      } catch (compensationError) {
        allCompensationsSucceeded = false;
        console.error(`Saga compensation failed for step [${record.step.stepId}]:`, compensationError);
        this.tracer.addEvent(spanId, `Compensation Failed: ${record.step.operationName}`, {
          stepId: record.step.stepId,
          error: String(compensationError)
        });
      }
    }

    return allCompensationsSucceeded;
  }
}// ============================================================================
// SECTION 37: W3C TRACE CONTEXT (TRACEPARENT / TRACESTATE) & B3 PROPAGATOR
// ============================================================================

export interface W3CTraceState {
  vendorMap: Map<string, string>;
}

export interface TracePropagationHeaders {
  traceparent?: string;
  tracestate?: string;
  'x-b3-traceid'?: string;
  'x-b3-spanid'?: string;
  'x-b3-sampled'?: string;
  'x-b3-parentspanid'?: string;
}

export class DistributedTracePropagator {
  private static readonly TRACE_VERSION = '00';
  private static readonly SAMPLED_FLAG = '01';
  private static readonly NOT_SAMPLED_FLAG = '00';

  public static generateTraceId(): string {
    const bytes = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < 16; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  public static generateSpanId(): string {
    const bytes = new Uint8Array(8);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < 8; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  public static createW3CTraceParent(
    traceId: string,
    spanId: string,
    sampled: boolean = true
  ): string {
    const normTraceId = traceId.replace(/-/g, '').padStart(32, '0').slice(-32);
    const normSpanId = spanId.replace(/-/g, '').padStart(16, '0').slice(-16);
    const flag = sampled ? this.SAMPLED_FLAG : this.NOT_SAMPLED_FLAG;

    return `${this.TRACE_VERSION}-${normTraceId}-${normSpanId}-${flag}`;
  }

  public static parseW3CTraceParent(
    header: string
  ): { version: string; traceId: string; spanId: string; sampled: boolean } | null {
    if (!header) return null;
    const parts = header.trim().split('-');
    if (parts.length < 4) return null;

    const [version, traceId, spanId, flags] = parts;
    if (traceId.length !== 32 || spanId.length !== 16) return null;
    if (/^0+$/.test(traceId) || /^0+$/.test(spanId)) return null;

    return {
      version,
      traceId,
      spanId,
      sampled: (parseInt(flags, 16) & 1) === 1
    };
  }

  public static injectTraceHeaders(
    existingHeaders: Record<string, string> = {},
    traceId: string,
    spanId: string,
    parentSpanId?: string,
    sampled: boolean = true
  ): Record<string, string> {
    const traceparent = this.createW3CTraceParent(traceId, spanId, sampled);
    const b3TraceId = traceId.replace(/-/g, '').slice(-32);
    const b3SpanId = spanId.replace(/-/g, '').slice(-16);

    const headers: Record<string, string> = {
      ...existingHeaders,
      traceparent,
      'x-b3-traceid': b3TraceId,
      'x-b3-spanid': b3SpanId,
      'x-b3-sampled': sampled ? '1' : '0'
    };

    if (parentSpanId) {
      headers['x-b3-parentspanid'] = parentSpanId.replace(/-/g, '').slice(-16);
    }

    return headers;
  }
}

// ============================================================================
// SECTION 38: CLIENT-SIDE METRICS HISTOGRAM & PERCENTILE ENGINE (P50, P95, P99)
// ============================================================================

export interface MetricSummary {
  count: number;
  min: number;
  max: number;
  sum: number;
  mean: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
  standardDeviation: number;
}

export class LatencyMetricsHistogram {
  private samples: number[] = [];
  private readonly maxSamples: number;
  private sum: number = 0;
  private min: number = Number.MAX_VALUE;
  private max: number = Number.MIN_VALUE;

  constructor(maxSamples: number = 2000) {
    this.maxSamples = maxSamples;
  }

  public record(valueMs: number): void {
    if (valueMs < 0 || isNaN(valueMs)) return;

    if (this.samples.length >= this.maxSamples) {
      const removed = this.samples.shift() || 0;
      this.sum -= removed;
    }

    this.samples.push(valueMs);
    this.sum += valueMs;
    if (valueMs < this.min) this.min = valueMs;
    if (valueMs > this.max) this.max = valueMs;
  }

  public getSummary(): MetricSummary {
    const count = this.samples.length;
    if (count === 0) {
      return {
        count: 0,
        min: 0,
        max: 0,
        sum: 0,
        mean: 0,
        p50: 0,
        p75: 0,
        p90: 0,
        p95: 0,
        p99: 0,
        standardDeviation: 0
      };
    }

    const sorted = [...this.samples].sort((a, b) => a - b);
    const mean = this.sum / count;

    let varianceSum = 0;
    for (const val of sorted) {
      varianceSum += Math.pow(val - mean, 2);
    }
    const standardDeviation = Math.sqrt(varianceSum / count);

    return {
      count,
      min: this.min === Number.MAX_VALUE ? 0 : this.min,
      max: this.max === Number.MIN_VALUE ? 0 : this.max,
      sum: this.sum,
      mean: Math.round(mean * 100) / 100,
      p50: this.calculatePercentile(sorted, 50),
      p75: this.calculatePercentile(sorted, 75),
      p90: this.calculatePercentile(sorted, 90),
      p95: this.calculatePercentile(sorted, 95),
      p99: this.calculatePercentile(sorted, 99),
      standardDeviation: Math.round(standardDeviation * 100) / 100
    };
  }

  private calculatePercentile(sorted: number[], percentile: number): number {
    if (sorted.length === 0) return 0;
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (lower === upper) return sorted[lower];
    return Math.round((sorted[lower] * (1 - weight) + sorted[upper] * weight) * 100) / 100;
  }

  public reset(): void {
    this.samples = [];
    this.sum = 0;
    this.min = Number.MAX_VALUE;
    this.max = Number.MIN_VALUE;
  }
}

export class TelemetryAggregatorHub {
  private endpointHistograms: Map<string, LatencyMetricsHistogram> = new Map();
  private statusCodesCount: Map<number, number> = new Map();
  private errorsByType: Map<string, number> = new Map();

  public recordRequest(endpoint: string, durationMs: number, statusCode: number): void {
    let hist = this.endpointHistograms.get(endpoint);
    if (!hist) {
      hist = new LatencyMetricsHistogram(1000);
      this.endpointHistograms.set(endpoint, hist);
    }
    hist.record(durationMs);

    const currentCount = this.statusCodesCount.get(statusCode) || 0;
    this.statusCodesCount.set(statusCode, currentCount + 1);
  }

  public recordError(errorType: string): void {
    const count = this.errorsByType.get(errorType) || 0;
    this.errorsByType.set(errorType, count + 1);
  }

  public getEndpointStats(endpoint: string): MetricSummary | null {
    const hist = this.endpointHistograms.get(endpoint);
    return hist ? hist.getSummary() : null;
  }

  public getAllMetricsReport(): {
    endpoints: Record<string, MetricSummary>;
    statusCodes: Record<number, number>;
    errors: Record<string, number>;
  } {
    const endpoints: Record<string, MetricSummary> = {};
    for (const [ep, hist] of this.endpointHistograms.entries()) {
      endpoints[ep] = hist.getSummary();
    }

    const statusCodes: Record<number, number> = {};
    for (const [code, cnt] of this.statusCodesCount.entries()) {
      statusCodes[code] = cnt;
    }

    const errors: Record<string, number> = {};
    for (const [err, cnt] of this.errorsByType.entries()) {
      errors[err] = cnt;
    }

    return { endpoints, statusCodes, errors };
  }

  public reset(): void {
    this.endpointHistograms.clear();
    this.statusCodesCount.clear();
    this.errorsByType.clear();
  }
}

// ============================================================================
// SECTION 39: ADAPTIVE BANDWIDTH ESTIMATOR & DYNAMIC CONCURRENCY CONTROLLER
// ============================================================================

export type NetworkEffectiveType = 'slow-2g' | '2g' | '3g' | '4g' | '5g' | 'offline' | 'unknown';

export interface NetworkConnectionState {
  effectiveType: NetworkEffectiveType;
  downlinkMbps?: number;
  rttMs?: number;
  saveData?: boolean;
}

export class AdaptiveConcurrencyLimiter {
  private maxConcurrency: number;
  private currentConcurrency: number = 0;
  private waitQueue: Array<() => void> = [];
  private readonly minConcurrency: number = 2;
  private readonly ceilingConcurrency: number = 32;

  constructor(initialConcurrency: number = 6) {
    this.maxConcurrency = initialConcurrency;
    this.initializeNetworkObserver();
  }

  private initializeNetworkObserver(): void {
    if (PlatformEnvironmentDetector.isBrowser() && typeof navigator !== 'undefined') {
      const conn = (navigator as unknown as { connection?: { effectiveType?: string; downlink?: number; rtt?: number; addEventListener?: (evt: string, fn: () => void) => void } }).connection;
      if (conn && conn.addEventListener) {
        conn.addEventListener('change', () => {
          this.adaptToNetworkConditions(this.getNetworkState());
        });
      }
    }
  }

  public getNetworkState(): NetworkConnectionState {
    if (!PlatformEnvironmentDetector.isBrowser() || typeof navigator === 'undefined') {
      return { effectiveType: 'unknown' };
    }

    if (!navigator.onLine) {
      return { effectiveType: 'offline' };
    }

    const conn = (navigator as unknown as { connection?: { effectiveType?: NetworkEffectiveType; downlink?: number; rtt?: number; saveData?: boolean } }).connection;
    if (!conn) {
      return { effectiveType: '4g' };
    }

    return {
      effectiveType: conn.effectiveType || '4g',
      downlinkMbps: conn.downlink,
      rttMs: conn.rtt,
      saveData: conn.saveData
    };
  }

  public adaptToNetworkConditions(state: NetworkConnectionState): void {
    switch (state.effectiveType) {
      case 'slow-2g':
      case '2g':
        this.maxConcurrency = 2;
        break;
      case '3g':
        this.maxConcurrency = 4;
        break;
      case '4g':
      case '5g':
        this.maxConcurrency = 10;
        break;
      case 'offline':
        this.maxConcurrency = 1;
        break;
      default:
        this.maxConcurrency = 6;
        break;
    }
  }

  public async acquirePermit(): Promise<() => void> {
    if (this.currentConcurrency < this.maxConcurrency) {
      this.currentConcurrency++;
      return () => this.releasePermit();
    }

    return new Promise<() => void>((resolve) => {
      this.waitQueue.push(() => {
        this.currentConcurrency++;
        resolve(() => this.releasePermit());
      });
    });
  }

  private releasePermit(): void {
    this.currentConcurrency = Math.max(0, this.currentConcurrency - 1);
    if (this.waitQueue.length > 0 && this.currentConcurrency < this.maxConcurrency) {
      const nextWaiter = this.waitQueue.shift();
      if (nextWaiter) {
        nextWaiter();
      }
    }
  }

  public adjustDynamicLimits(recentP95LatencyMs: number, errorRate: number): void {
    // AIMD (Additive Increase / Multiplicative Decrease) dynamic windowing
    if (errorRate > 0.1 || recentP95LatencyMs > 3000) {
      this.maxConcurrency = Math.max(this.minConcurrency, Math.floor(this.maxConcurrency * 0.7));
    } else if (errorRate === 0 && recentP95LatencyMs < 500) {
      this.maxConcurrency = Math.min(this.ceilingConcurrency, this.maxConcurrency + 1);
    }
  }

  public getConcurrencyMetrics(): { current: number; max: number; queued: number } {
    return {
      current: this.currentConcurrency,
      max: this.maxConcurrency,
      queued: this.waitQueue.length
    };
  }
}

// ============================================================================
// SECTION 40: DYNAMIC API VERSIONING & NEGOTIATION STRATEGY ENGINE
// ============================================================================

export enum ApiVersioningType {
  URI_PATH = 'URI_PATH',
  CUSTOM_HEADER = 'CUSTOM_HEADER',
  ACCEPT_HEADER = 'ACCEPT_HEADER',
  QUERY_PARAM = 'QUERY_PARAM'
}

export interface ApiVersioningConfig {
  type: ApiVersioningType;
  defaultVersion: string;
  headerKey?: string;
  queryParamKey?: string;
  mediaTypePrefix?: string;
}

export class ApiVersioningNegotiator {
  private readonly config: Required<ApiVersioningConfig>;

  constructor(config?: Partial<ApiVersioningConfig>) {
    this.config = {
      type: config?.type ?? ApiVersioningType.URI_PATH,
      defaultVersion: config?.defaultVersion ?? 'v1',
      headerKey: config?.headerKey ?? 'X-API-Version',
      queryParamKey: config?.queryParamKey ?? 'api-version',
      mediaTypePrefix: config?.mediaTypePrefix ?? 'application/vnd.company'
    };
  }

  public applyVersioning(
    url: string,
    headers: Record<string, string> = {},
    requestedVersion?: string
  ): { url: string; headers: Record<string, string> } {
    const version = requestedVersion || this.config.defaultVersion;
    const modifiedHeaders = { ...headers };
    let modifiedUrl = url;

    switch (this.config.type) {
      case ApiVersioningType.URI_PATH: {
        // If url does not already start with v1, v2 etc., prefix it
        if (!/^\/?v\d+(\/|$)/i.test(modifiedUrl)) {
          const cleanUrl = modifiedUrl.startsWith('/') ? modifiedUrl.slice(1) : modifiedUrl;
          modifiedUrl = `/${version}/${cleanUrl}`;
        }
        break;
      }

      case ApiVersioningType.CUSTOM_HEADER: {
        modifiedHeaders[this.config.headerKey] = version;
        break;
      }

      case ApiVersioningType.ACCEPT_HEADER: {
        const accept = modifiedHeaders['Accept'] || modifiedHeaders['accept'] || 'application/json';
        modifiedHeaders['Accept'] = `${this.config.mediaTypePrefix}.${version}+json, ${accept}`;
        break;
      }

      case ApiVersioningType.QUERY_PARAM: {
        const delimiter = modifiedUrl.includes('?') ? '&' : '?';
        modifiedUrl = `${modifiedUrl}${delimiter}${encodeURIComponent(this.config.queryParamKey)}=${encodeURIComponent(version)}`;
        break;
      }
    }

    return { url: modifiedUrl, headers: modifiedHeaders };
  }
}

// ============================================================================
// SECTION 41: COOKIE & CSRF / XSRF TOKEN SYNCHRONIZATION ENGINE
// ============================================================================

export interface CsrfGuardOptions {
  cookieName?: string;
  headerName?: string;
  autoExtractFromCookie?: boolean;
}

export class CsrfTokenSynchronizer {
  private readonly cookieName: string;
  private readonly headerName: string;
  private readonly autoExtract: boolean;
  private inMemoryCsrfToken: string | null = null;

  constructor(options: CsrfGuardOptions = {}) {
    this.cookieName = options.cookieName ?? 'XSRF-TOKEN';
    this.headerName = options.headerName ?? 'X-XSRF-TOKEN';
    this.autoExtract = options.autoExtractFromCookie ?? true;
  }

  public setToken(token: string): void {
    this.inMemoryCsrfToken = token;
  }

  public getToken(): string | null {
    if (this.inMemoryCsrfToken) {
      return this.inMemoryCsrfToken;
    }

    if (this.autoExtract && PlatformEnvironmentDetector.isBrowser()) {
      return this.extractFromCookie();
    }

    return null;
  }

  public injectCsrfHeader(
    method: string,
    headers: Record<string, string> = {}
  ): Record<string, string> {
    const isMutative = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
    if (!isMutative) {
      return headers;
    }

    const token = this.getToken();
    if (token) {
      return {
        ...headers,
        [this.headerName]: token
      };
    }

    return headers;
  }

  private extractFromCookie(): string | null {
    if (typeof document === 'undefined' || !document.cookie) {
      return null;
    }

    const match = document.cookie.match(new RegExp(`(^|;\\s*)(${this.cookieName})=([^;]*)`));
    return match ? decodeURIComponent(match[3]) : null;
  }
}

// ============================================================================
// SECTION 42: MULTIPART / FORM-DATA MARSHALLER WITH STREAMING NORMALIZATION
// ============================================================================

export interface FilePayload {
  name: string;
  data: Blob | ArrayBuffer | Uint8Array | string;
  fileName?: string;
  contentType?: string;
}

export class FormDataMarshaller {
  public static isFormData(data: unknown): boolean {
    return PlatformEnvironmentDetector.isBrowser() && typeof FormData !== 'undefined' && data instanceof FormData;
  }

  public static buildFormData(
    payload: Record<string, unknown>,
    files: Record<string, FilePayload | FilePayload[] | Blob | File> = {}
  ): FormData {
    if (!PlatformEnvironmentDetector.isBrowser() || typeof FormData === 'undefined') {
      throw new ApiClientError('FormData is only available in browser or Polyfilled environments', 'UNSUPPORTED_RUNTIME');
    }

    const formData = new FormData();

    // Append simple and complex structured data
    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined || value === null) continue;

      if (typeof value === 'object' && !(value instanceof Blob) && !(value instanceof File)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }

    // Append files
    for (const [fieldKey, fileOrFiles] of Object.entries(files)) {
      if (Array.isArray(fileOrFiles)) {
        for (const f of fileOrFiles) {
          this.appendFileToFormData(formData, fieldKey, f);
        }
      } else {
        this.appendFileToFormData(formData, fieldKey, fileOrFiles);
      }
    }

    return formData;
  }

  private static appendFileToFormData(
    formData: FormData,
    fieldName: string,
    fileItem: FilePayload | Blob | File
  ): void {
    if (fileItem instanceof File) {
      formData.append(fieldName, fileItem, fileItem.name);
    } else if (fileItem instanceof Blob) {
      formData.append(fieldName, fileItem, 'unnamed_blob');
    } else if (typeof fileItem === 'object' && 'data' in fileItem) {
      const blob = fileItem.data instanceof Blob ? fileItem.data : new Blob([fileItem.data], { type: fileItem.contentType || 'application/octet-stream' });
      formData.append(fieldName, blob, fileItem.fileName || fileItem.name || 'upload.bin');
    }
  }
}// ============================================================================
// SECTION 43: REAL-TIME CONCURRENCY-CONTROLLED POLLING & LONG-POLLING ENGINE
// ============================================================================

export interface PollingStrategyOptions<TData = unknown> {
  intervalMs?: number;
  maxIntervalMs?: number;
  backoffMultiplier?: number;
  timeoutMs?: number;
  jitter?: boolean;
  maxAttempts?: number;
  stopCondition?: (data: TData, attempt: number) => boolean;
  onSuccess?: (data: TData, attempt: number) => void;
  onError?: (error: unknown, attempt: number) => void;
  onMaxAttemptsReached?: () => void;
  compareEquality?: (previous: TData | undefined, current: TData) => boolean;
  onDataChanged?: (current: TData, previous?: TData) => void;
  signal?: AbortSignal;
}

export enum PollingState {
  IDLE = 'IDLE',
  POLLING = 'POLLING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
  FAILED = 'FAILED'
}

export class SmartPollingCoordinator<TData = unknown> {
  private state: PollingState = PollingState.IDLE;
  private attemptCount: number = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private lastData: TData | undefined = undefined;
  private readonly clientFetcher: () => Promise<TData>;
  private readonly options: Required<Omit<PollingStrategyOptions<TData>, 'stopCondition' | 'onSuccess' | 'onError' | 'onMaxAttemptsReached' | 'compareEquality' | 'onDataChanged' | 'signal'>> &
    Pick<PollingStrategyOptions<TData>, 'stopCondition' | 'onSuccess' | 'onError' | 'onMaxAttemptsReached' | 'compareEquality' | 'onDataChanged' | 'signal'>;

  constructor(
    clientFetcher: () => Promise<TData>,
    options: PollingStrategyOptions<TData> = {}
  ) {
    this.clientFetcher = clientFetcher;
    this.options = {
      intervalMs: options.intervalMs ?? 3000,
      maxIntervalMs: options.maxIntervalMs ?? 30000,
      backoffMultiplier: options.backoffMultiplier ?? 1.25,
      timeoutMs: options.timeoutMs ?? 15000,
      jitter: options.jitter ?? true,
      maxAttempts: options.maxAttempts ?? Infinity,
      stopCondition: options.stopCondition,
      onSuccess: options.onSuccess,
      onError: options.onError,
      onMaxAttemptsReached: options.onMaxAttemptsReached,
      compareEquality: options.compareEquality ?? ((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      onDataChanged: options.onDataChanged,
      signal: options.signal
    };
  }

  public start(): void {
    if (this.state === PollingState.POLLING) return;
    this.state = PollingState.POLLING;
    this.attemptCount = 0;
    this.executePollStep();
  }

  public pause(): void {
    if (this.state !== PollingState.POLLING) return;
    this.state = PollingState.PAUSED;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public resume(): void {
    if (this.state !== PollingState.PAUSED) return;
    this.state = PollingState.POLLING;
    this.executePollStep();
  }

  public stop(): void {
    this.state = PollingState.STOPPED;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public getState(): PollingState {
    return this.state;
  }

  public getAttemptCount(): number {
    return this.attemptCount;
  }

  private async executePollStep(): Promise<void> {
    if (this.state !== PollingState.POLLING) return;

    if (this.options.signal?.aborted) {
      this.stop();
      return;
    }

    if (this.attemptCount >= this.options.maxAttempts) {
      this.stop();
      if (this.options.onMaxAttemptsReached) {
        this.options.onMaxAttemptsReached();
      }
      return;
    }

    this.attemptCount++;

    try {
      const data = await this.clientFetcher();

      if (this.options.onSuccess) {
        this.options.onSuccess(data, this.attemptCount);
      }

      if (this.options.onDataChanged) {
        const isIdentical = this.lastData !== undefined && this.options.compareEquality(this.lastData, data);
        if (!isIdentical) {
          this.options.onDataChanged(data, this.lastData);
        }
      }

      this.lastData = data;

      if (this.options.stopCondition && this.options.stopCondition(data, this.attemptCount)) {
        this.stop();
        return;
      }
    } catch (error) {
      if (this.options.onError) {
        this.options.onError(error, this.attemptCount);
      }
    }

    if (this.state === PollingState.POLLING) {
      const nextDelay = this.calculateNextDelay();
      this.timer = setTimeout(() => this.executePollStep(), nextDelay);
    }
  }

  private calculateNextDelay(): number {
    let delay = this.options.intervalMs * Math.pow(this.options.backoffMultiplier, Math.min(this.attemptCount - 1, 10));
    delay = Math.min(delay, this.options.maxIntervalMs);

    if (this.options.jitter) {
      const jitterVal = delay * 0.2 * (Math.random() * 2 - 1);
      delay = Math.max(100, delay + jitterVal);
    }

    return Math.floor(delay);
  }
}

// ============================================================================
// SECTION 44: ADVANCED HTTP PIPELINING & CONNECTION POOL OPTIMIZER
// ============================================================================

export interface ConnectionPoolConfig {
  maxSockets?: number;
  maxFreeSockets?: number;
  keepAliveTimeoutMs?: number;
  freeSocketTimeoutMs?: number;
  enableHttpPipelining?: boolean;
}

export class ConnectionPoolAdvisor {
  private readonly config: Required<ConnectionPoolConfig>;

  constructor(config: ConnectionPoolConfig = {}) {
    this.config = {
      maxSockets: config.maxSockets ?? 64,
      maxFreeSockets: config.maxFreeSockets ?? 16,
      keepAliveTimeoutMs: config.keepAliveTimeoutMs ?? 60000,
      freeSocketTimeoutMs: config.freeSocketTimeoutMs ?? 30000,
      enableHttpPipelining: config.enableHttpPipelining ?? false
    };
  }

  public getSuggestedAxiosDefaults(): Partial<AxiosRequestConfig> {
    if (PlatformEnvironmentDetector.isNode()) {
      try {
        // Node HTTP/HTTPS Agent optimization
        const http = require('http');
        const https = require('https');

        const httpAgent = new http.Agent({
          keepAlive: true,
          maxSockets: this.config.maxSockets,
          maxFreeSockets: this.config.maxFreeSockets,
          timeout: this.config.keepAliveTimeoutMs,
          freeSocketTimeout: this.config.freeSocketTimeoutMs
        });

        const httpsAgent = new https.Agent({
          keepAlive: true,
          maxSockets: this.config.maxSockets,
          maxFreeSockets: this.config.maxFreeSockets,
          timeout: this.config.keepAliveTimeoutMs,
          freeSocketTimeout: this.config.freeSocketTimeoutMs
        });

        return {
          httpAgent,
          httpsAgent
        };
      } catch {
        return {};
      }
    }

    return {};
  }
}

// ============================================================================
// SECTION 45: ZERO-CONFIG REACT HOOKS / REACT INTEGRATION LAYER
// ============================================================================

export interface ReactQueryState<TData = unknown, TError = Error> {
  data: TData | null;
  error: TError | null;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  refetch: () => Promise<TData | null>;
  mutate: (newData: TData) => void;
}

export interface UseQueryOptions<TData = unknown> {
  enabled?: boolean;
  ttlMs?: number;
  cacheStrategy?: CacheStrategy;
  refetchOnWindowFocus?: boolean;
  refetchIntervalMs?: number;
  initialData?: TData;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

export interface ReactMutationState<TData = unknown, TVariables = unknown, TError = Error> {
  data: TData | null;
  error: TError | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  reset: () => void;
}

export interface UseMutationOptions<TData = unknown, TVariables = unknown> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
}

/**
 * Universal React Framework Connector for ApiClient.
 * Compatible with React 16.8+, 17, 18, and 19 (Zero React peer dependency runtime check).
 */
export class ReactApiHooksAdapter {
  private static clientInstance: ApiClientCore | null = null;

  public static initialize(client: ApiClientCore): void {
    this.clientInstance = client;
  }

  public static getClient(): ApiClientCore {
    if (!this.clientInstance) {
      this.clientInstance = new ApiClientCore();
    }
    return this.clientInstance;
  }

  /**
   * Vanilla JS / React compatible observable query primitive
   */
  public static createQueryObserver<TData = unknown>(
    queryKey: string,
    fetcher: (client: ApiClientCore) => Promise<TData>,
    options: UseQueryOptions<TData> = {}
  ): {
    subscribe: (listener: (state: ReactQueryState<TData>) => void) => () => void;
    getState: () => ReactQueryState<TData>;
    refetch: () => Promise<TData | null>;
  } {
    const client = this.getClient();
    let state: ReactQueryState<TData> = {
      data: options.initialData || null,
      error: null,
      isLoading: options.enabled !== false && !options.initialData,
      isFetching: options.enabled !== false,
      isSuccess: !!options.initialData,
      isError: false,
      refetch: async () => executeFetch(),
      mutate: (newData: TData) => {
        state = { ...state, data: newData };
        notify();
      }
    };

    const listeners = new Set<(s: ReactQueryState<TData>) => void>();

    const notify = () => {
      for (const listener of listeners) {
        listener(state);
      }
    };

    const executeFetch = async (): Promise<TData | null> => {
      state = { ...state, isFetching: true, isLoading: !state.data };
      notify();

      try {
        const result = await fetcher(client);
        state = {
          ...state,
          data: result,
          error: null,
          isLoading: false,
          isFetching: false,
          isSuccess: true,
          isError: false
        };
        if (options.onSuccess) options.onSuccess(result);
        notify();
        return result;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        state = {
          ...state,
          error: errorObj,
          isLoading: false,
          isFetching: false,
          isSuccess: false,
          isError: true
        };
        if (options.onError) options.onError(errorObj);
        notify();
        return null;
      }
    };

    let intervalTimer: ReturnType<typeof setInterval> | null = null;
    if (options.refetchIntervalMs && options.refetchIntervalMs > 0) {
      intervalTimer = setInterval(() => {
        executeFetch();
      }, options.refetchIntervalMs);
    }

    if (options.enabled !== false) {
      executeFetch();
    }

    return {
      subscribe: (listener) => {
        listeners.add(listener);
        listener(state);
        return () => {
          listeners.delete(listener);
          if (listeners.size === 0 && intervalTimer) {
            clearInterval(intervalTimer);
          }
        };
      },
      getState: () => state,
      refetch: executeFetch
    };
  }

  /**
   * Vanilla JS / React compatible observable mutation primitive
   */
  public static createMutationObserver<TData = unknown, TVariables = unknown>(
    mutationFn: (variables: TVariables, client: ApiClientCore) => Promise<TData>,
    options: UseMutationOptions<TData, TVariables> = {}
  ): ReactMutationState<TData, TVariables> {
    const client = this.getClient();
    let state: ReactMutationState<TData, TVariables> = {
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
      mutateAsync: async (vars: TVariables) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        try {
          const result = await mutationFn(vars, client);
          state.data = result;
          state.error = null;
          state.isLoading = false;
          state.isSuccess = true;
          if (options.onSuccess) options.onSuccess(result, vars);
          if (options.onSettled) options.onSettled(result, null, vars);
          return result;
        } catch (err) {
          const errorObj = err instanceof Error ? err : new Error(String(err));
          state.error = errorObj;
          state.isLoading = false;
          state.isError = true;
          if (options.onError) options.onError(errorObj, vars);
          if (options.onSettled) options.onSettled(null, errorObj, vars);
          throw errorObj;
        }
      },
      reset: () => {
        state.data = null;
        state.error = null;
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = false;
      }
    };

    return state;
  }
}

// ============================================================================
// SECTION 46: COMPREHENSIVE REQUEST/RESPONSE RECORD & REPLAY DEBUG ENGINE
// ============================================================================

export interface RecordedHttpInteraction {
  id: string;
  timestamp: string;
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    params?: unknown;
    data?: unknown;
  };
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: unknown;
    durationMs: number;
  };
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
}

export class HttpRecordAndReplayEngine {
  private recordedInteractions: RecordedHttpInteraction[] = [];
  private isRecording: boolean = false;
  private isReplaying: boolean = false;
  private replayMockMap: Map<string, RecordedHttpInteraction> = new Map();

  public startRecording(): void {
    this.isRecording = true;
  }

  public stopRecording(): void {
    this.isRecording = false;
  }

  public record(interaction: RecordedHttpInteraction): void {
    if (!this.isRecording) return;
    this.recordedInteractions.push(interaction);
  }

  public exportTape(): string {
    return JSON.stringify(this.recordedInteractions, null, 2);
  }

  public loadTape(tapeJson: string): void {
    try {
      const interactions: RecordedHttpInteraction[] = JSON.parse(tapeJson);
      this.recordedInteractions = interactions;
      this.replayMockMap.clear();

      for (const item of interactions) {
        const key = CryptographicEngine.buildCanonicalCacheKey(
          item.request.method,
          item.request.url,
          item.request.params,
          item.request.data
        );
        this.replayMockMap.set(key, item);
      }
    } catch (e) {
      throw new SerializationError(`Failed to load replay tape JSON: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  public setReplayMode(enabled: boolean): void {
    this.isReplaying = enabled;
  }

  public isReplayActive(): boolean {
    return this.isReplaying;
  }

  public findReplayMatch(method: string, url: string, params?: unknown, data?: unknown): RecordedHttpInteraction | null {
    if (!this.isReplaying) return null;
    const key = CryptographicEngine.buildCanonicalCacheKey(method, url, params, data);
    return this.replayMockMap.get(key) || null;
  }

  public clear(): void {
    this.recordedInteractions = [];
    this.replayMockMap.clear();
  }
}

// ============================================================================
// SECTION 47: ADVANCED API ROUTE MOCKING & EMBEDDED SERVICE WORKER INTERCEPTOR
// ============================================================================

export type MockResponseHandler = (req: {
  url: string;
  method: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  body: unknown;
}) => Promise<{ status: number; body: unknown; headers?: Record<string, string>; delayMs?: number }> | {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
  delayMs?: number;
};

export interface MockRouteRule {
  id: string;
  method: HttpMethod | 'ALL';
  pathPattern: string | RegExp;
  handler: MockResponseHandler;
  enabled: boolean;
  priority: number;
}

export class EmbeddedApiMockRouter {
  private rules: MockRouteRule[] = [];
  private isEnabled: boolean = false;

  constructor(enabled: boolean = false) {
    this.isEnabled = enabled;
  }

  public enable(): void {
    this.isEnabled = true;
  }

  public disable(): void {
    this.isEnabled = false;
  }

  public registerMock(
    method: HttpMethod | 'ALL',
    pathPattern: string | RegExp,
    handler: MockResponseHandler,
    priority: number = 0
  ): string {
    const id = CryptographicEngine.generateUuidV4();
    this.rules.push({
      id,
      method,
      pathPattern,
      handler,
      enabled: true,
      priority
    });
    this.rules.sort((a, b) => b.priority - a.priority);
    return id;
  }

  public async matchAndExecute(
    method: string,
    url: string,
    headers: Record<string, string> = {},
    body?: unknown
  ): Promise<{ status: number; body: unknown; headers: Record<string, string> } | null> {
    if (!this.isEnabled) return null;

    const parsedUrl = new URL(url, 'http://localhost');
    const pathname = parsedUrl.pathname;
    const queryParams: Record<string, string> = {};
    parsedUrl.searchParams.forEach((val, key) => {
      queryParams[key] = val;
    });

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      // Check method match
      if (rule.method !== 'ALL' && rule.method !== method.toUpperCase()) {
        continue;
      }

      // Check path match
      let isMatch = false;
      const routeParams: Record<string, string> = {};

      if (typeof rule.pathPattern === 'string') {
        if (rule.pathPattern.includes(':')) {
          // Route path template matching (e.g. /users/:id)
          const patternSegments = rule.pathPattern.split('/').filter(Boolean);
          const pathSegments = pathname.split('/').filter(Boolean);

          if (patternSegments.length === pathSegments.length) {
            isMatch = true;
            for (let i = 0; i < patternSegments.length; i++) {
              if (patternSegments[i].startsWith(':')) {
                const paramName = patternSegments[i].slice(1);
                routeParams[paramName] = pathSegments[i];
              } else if (patternSegments[i] !== pathSegments[i]) {
                isMatch = false;
                break;
              }
            }
          }
        } else if (rule.pathPattern === pathname || rule.pathPattern === url) {
          isMatch = true;
        }
      } else if (rule.pathPattern instanceof RegExp) {
        isMatch = rule.pathPattern.test(pathname) || rule.pathPattern.test(url);
      }

      if (isMatch) {
        const mergedParams = { ...queryParams, ...routeParams };
        const result = await rule.handler({
          url,
          method,
          headers,
          params: mergedParams,
          body
        });

        if (result.delayMs && result.delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, result.delayMs));
        }

        return {
          status: result.status,
          body: result.body,
          headers: result.headers || { 'content-type': 'application/json' }
        };
      }
    }

    return null;
  }

  public removeMock(ruleId: string): boolean {
    const idx = this.rules.findIndex((r) => r.id === ruleId);
    if (idx !== -1) {
      this.rules.splice(idx, 1);
      return true;
    }
    return false;
  }

  public clear(): void {
    this.rules = [];
  }
}

// ============================================================================
// SECTION 48: STREAMING NDJSON & JSON-LINES PARSER / GENERATOR ENGINE
// ============================================================================

export interface NdjsonStreamOptions<T = unknown> {
  onChunk: (item: T) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
  signal?: AbortSignal;
}

export class NdjsonStreamParser {
  public static async parseStream<T = unknown>(
    responseStream: ReadableStream<Uint8Array>,
    options: NdjsonStreamOptions<T>
  ): Promise<void> {
    const reader = responseStream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        if (options.signal?.aborted) {
          await reader.cancel();
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Retain uncompleted fragment in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed) {
            try {
              const parsed: T = JSON.parse(trimmed);
              options.onChunk(parsed);
            } catch (err) {
              if (options.onError) {
                options.onError(new SerializationError(`Failed parsing NDJSON line: ${trimmed}`));
              }
            }
          }
        }
      }

      if (buffer.trim()) {
        try {
          const parsed: T = JSON.parse(buffer.trim());
          options.onChunk(parsed);
        } catch (err) {
          if (options.onError) {
            options.onError(new SerializationError(`Failed parsing trailing NDJSON segment: ${buffer}`));
          }
        }
      }

      if (options.onComplete) {
        options.onComplete();
      }
    } catch (streamError) {
      if (options.onError) {
        options.onError(streamError instanceof Error ? streamError : new Error(String(streamError)));
      }
    } finally {
      reader.releaseLock();
    }
  }

  public static serializeToLines(items: unknown[]): string {
    return items.map((item) => JSON.stringify(item)).join('\n') + '\n';
  }
}
// ============================================================================
// SECTION 49: ADVANCED MULTI-TENANT CONTEXT INJECTOR & ISOLATION ROUTER
// ============================================================================

export interface TenantContext {
  tenantId: string;
  organizationId?: string;
  environmentId?: string;
  customHeaders?: Record<string, string>;
  subdomainRouting?: boolean;
}

export class TenantContextManager {
  private currentContext: TenantContext | null = null;
  private readonly headerPrefix: string;

  constructor(headerPrefix: string = 'X-Tenant-') {
    this.headerPrefix = headerPrefix;
  }

  public setTenant(context: TenantContext): void {
    this.currentContext = { ...context };
  }

  public getTenant(): TenantContext | null {
    return this.currentContext ? { ...this.currentContext } : null;
  }

  public clearTenant(): void {
    this.currentContext = null;
  }

  public injectTenantHeaders(headers: Record<string, string> = {}): Record<string, string> {
    if (!this.currentContext) return headers;

    const modified = { ...headers };
    modified[`${this.headerPrefix}ID`] = this.currentContext.tenantId;

    if (this.currentContext.organizationId) {
      modified[`${this.headerPrefix}Org-ID`] = this.currentContext.organizationId;
    }
    if (this.currentContext.environmentId) {
      modified[`${this.headerPrefix}Env-ID`] = this.currentContext.environmentId;
    }

    if (this.currentContext.customHeaders) {
      for (const [k, v] of Object.entries(this.currentContext.customHeaders)) {
        modified[k] = v;
      }
    }

    return modified;
  }

  public resolveTenantUrl(baseUrl: string): string {
    if (!this.currentContext || !this.currentContext.subdomainRouting) {
      return baseUrl;
    }

    try {
      const url = new URL(baseUrl);
      const hostParts = url.hostname.split('.');
      if (hostParts.length >= 2) {
        url.hostname = `${this.currentContext.tenantId}.${url.hostname}`;
      }
      return url.toString();
    } catch {
      return baseUrl;
    }
  }
}// ============================================================================
// SECTION 50: DIFFERENTIAL SYNC & DELTA STATE REPLICATION ENGINE (RFC 6902)
// ============================================================================

export type JsonPatchOperationType = 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';

export interface JsonPatchOperation {
  op: JsonPatchOperationType;
  path: string;
  value?: unknown;
  from?: string;
}

export interface DeltaSyncEntityState<T = unknown> {
  entityId: string;
  version: number;
  data: T;
  lastSyncedAt: number;
  checksum: string;
}

export interface DeltaReplicationPacket<T = unknown> {
  entityId: string;
  sourceVersion: number;
  targetVersion: number;
  patches: JsonPatchOperation[];
  baseChecksum: string;
  targetChecksum: string;
  timestamp: number;
}

export class JsonPatchEngine {
  public static generateDiff(original: unknown, updated: unknown, basePath: string = ''): JsonPatchOperation[] {
    const patches: JsonPatchOperation[] = [];

    if (original === updated) {
      return patches;
    }

    if (original === null || updated === null || typeof original !== 'object' || typeof updated !== 'object') {
      patches.push({
        op: 'replace',
        path: basePath || '/',
        value: updated
      });
      return patches;
    }

    if (Array.isArray(original) && Array.isArray(updated)) {
      this.diffArrays(original, updated, basePath, patches);
      return patches;
    }

    const origObj = original as Record<string, unknown>;
    const updObj = updated as Record<string, unknown>;

    const origKeys = Object.keys(origObj);
    const updKeys = Object.keys(updObj);

    // Removed keys
    for (const key of origKeys) {
      if (!(key in updObj)) {
        patches.push({
          op: 'remove',
          path: `${basePath}/${this.escapeJsonPointer(key)}`
        });
      }
    }

    // Added or modified keys
    for (const key of updKeys) {
      const fieldPath = `${basePath}/${this.escapeJsonPointer(key)}`;
      if (!(key in origObj)) {
        patches.push({
          op: 'add',
          path: fieldPath,
          value: updObj[key]
        });
      } else {
        const subPatches = this.generateDiff(origObj[key], updObj[key], fieldPath);
        patches.push(...subPatches);
      }
    }

    return patches;
  }

  public static applyPatch<T = unknown>(target: T, patches: JsonPatchOperation[]): T {
    let root = JSON.parse(JSON.stringify(target));

    for (const patch of patches) {
      root = this.applySinglePatch(root, patch);
    }

    return root;
  }

  private static applySinglePatch(root: unknown, patch: JsonPatchOperation): unknown {
    const pathSegments = this.parseJsonPointer(patch.path);

    if (pathSegments.length === 0) {
      if (patch.op === 'replace' || patch.op === 'add') {
        return patch.value;
      }
      return root;
    }

    let current: unknown = root;
    for (let i = 0; i < pathSegments.length - 1; i++) {
      const segment = pathSegments[i];
      if (typeof current === 'object' && current !== null) {
        current = (current as Record<string, unknown>)[segment];
      } else {
        throw new SerializationError(`Invalid patch path segment: ${segment}`);
      }
    }

    const lastSegment = pathSegments[pathSegments.length - 1];
    const parent = current as Record<string, unknown>;

    switch (patch.op) {
      case 'add':
      case 'replace':
        if (Array.isArray(parent)) {
          const index = lastSegment === '-' ? parent.length : parseInt(lastSegment, 10);
          if (patch.op === 'add') {
            parent.splice(index, 0, patch.value);
          } else {
            parent[index] = patch.value;
          }
        } else {
          parent[lastSegment] = patch.value;
        }
        break;

      case 'remove':
        if (Array.isArray(parent)) {
          const index = parseInt(lastSegment, 10);
          parent.splice(index, 1);
        } else {
          delete parent[lastSegment];
        }
        break;

      case 'test':
        if (JSON.stringify(parent[lastSegment]) !== JSON.stringify(patch.value)) {
          throw new SerializationError(`Patch test operation failed at path [${patch.path}]`);
        }
        break;

      case 'move':
        if (patch.from) {
          const fromSegments = this.parseJsonPointer(patch.from);
          const fromValue = this.extractValueByPath(root, fromSegments);
          this.applySinglePatch(root, { op: 'remove', path: patch.from });
          this.applySinglePatch(root, { op: 'add', path: patch.path, value: fromValue });
        }
        break;

      case 'copy':
        if (patch.from) {
          const fromSegments = this.parseJsonPointer(patch.from);
          const fromValue = this.extractValueByPath(root, fromSegments);
          this.applySinglePatch(root, { op: 'add', path: patch.path, value: JSON.parse(JSON.stringify(fromValue)) });
        }
        break;
    }

    return root;
  }

  private static diffArrays(origArr: unknown[], updArr: unknown[], basePath: string, patches: JsonPatchOperation[]): void {
    const minLen = Math.min(origArr.length, updArr.length);

    for (let i = 0; i < minLen; i++) {
      const fieldPath = `${basePath}/${i}`;
      patches.push(...this.generateDiff(origArr[i], updArr[i], fieldPath));
    }

    if (updArr.length > origArr.length) {
      for (let i = minLen; i < updArr.length; i++) {
        patches.push({
          op: 'add',
          path: `${basePath}/-`,
          value: updArr[i]
        });
      }
    } else if (origArr.length > updArr.length) {
      for (let i = origArr.length - 1; i >= minLen; i--) {
        patches.push({
          op: 'remove',
          path: `${basePath}/${i}`
        });
      }
    }
  }

  private static parseJsonPointer(path: string): string[] {
    if (!path || path === '/') return [];
    return path
      .replace(/^\//, '')
      .split('/')
      .map((s) => s.replace(/~1/g, '/').replace(/~0/g, '~'));
  }

  private static escapeJsonPointer(segment: string): string {
    return segment.replace(/~/g, '~0').replace(/\//g, '~1');
  }

  private static extractValueByPath(root: unknown, segments: string[]): unknown {
    let current: unknown = root;
    for (const segment of segments) {
      if (typeof current === 'object' && current !== null) {
        current = (current as Record<string, unknown>)[segment];
      } else {
        return undefined;
      }
    }
    return current;
  }
}

export class DeltaStateSynchronizer<T = unknown> {
  private entityStates: Map<string, DeltaSyncEntityState<T>> = new Map();
  private readonly client: ApiClientCore;
  private readonly syncEndpoint: string;

  constructor(client: ApiClientCore, syncEndpoint: string = '/sync/delta') {
    this.client = client;
    this.syncEndpoint = syncEndpoint;
  }

  public registerEntity(entityId: string, initialData: T, version: number = 1): void {
    const serialized = JSON.stringify(initialData);
    const checksum = CryptographicEngine.fastHash(serialized);

    this.entityStates.set(entityId, {
      entityId,
      version,
      data: JSON.parse(serialized),
      lastSyncedAt: Date.now(),
      checksum
    });
  }

  public getEntity(entityId: string): T | null {
    const state = this.entityStates.get(entityId);
    return state ? JSON.parse(JSON.stringify(state.data)) : null;
  }

  public async syncEntity(entityId: string, currentData: T): Promise<T> {
    let state = this.entityStates.get(entityId);
    if (!state) {
      this.registerEntity(entityId, currentData);
      state = this.entityStates.get(entityId)!;
    }

    const currentChecksum = CryptographicEngine.fastHash(JSON.stringify(currentData));
    if (currentChecksum === state.checksum) {
      return state.data;
    }

    const patches = JsonPatchEngine.generateDiff(state.data, currentData);
    if (patches.length === 0) {
      return state.data;
    }

    const packet: DeltaReplicationPacket<T> = {
      entityId,
      sourceVersion: state.version,
      targetVersion: state.version + 1,
      patches,
      baseChecksum: state.checksum,
      targetChecksum: currentChecksum,
      timestamp: Date.now()
    };

    const response = await this.client.post<DeltaReplicationPacket<T>>(this.syncEndpoint, packet, {
      initiator: `DeltaStateSynchronizer.syncEntity[${entityId}]`
    });

    const newTargetData = JsonPatchEngine.applyPatch(state.data, response.patches || patches);
    const newTargetChecksum = CryptographicEngine.fastHash(JSON.stringify(newTargetData));

    this.entityStates.set(entityId, {
      entityId,
      version: response.targetVersion || packet.targetVersion,
      data: newTargetData,
      lastSyncedAt: Date.now(),
      checksum: newTargetChecksum
    });

    return newTargetData;
  }
}

// ============================================================================
// SECTION 51: DYNAMIC QUERY BATCHING & DATALOADER FOR REST/GRAPHQL
// ============================================================================

export interface BatchLoaderOptions {
  batchScheduleDelayMs?: number;
  maxBatchSize?: number;
  cache?: boolean;
}

export type BatchLoadFunction<K, V> = (keys: ReadonlyArray<K>) => Promise<Array<V | Error>>;

export class RestDataLoader<K, V> {
  private readonly batchFn: BatchLoadFunction<K, V>;
  private readonly options: Required<BatchLoaderOptions>;
  private queue: Array<{ key: K; resolve: (val: V) => void; reject: (err: Error) => void }> = [];
  private cacheMap: Map<string, Promise<V>> = new Map();
  private batchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(batchFn: BatchLoadFunction<K, V>, options: BatchLoaderOptions = {}) {
    this.batchFn = batchFn;
    this.options = {
      batchScheduleDelayMs: options.batchScheduleDelayMs ?? 10,
      maxBatchSize: options.maxBatchSize ?? 100,
      cache: options.cache ?? true
    };
  }

  public async load(key: K): Promise<V> {
    const cacheKey = typeof key === 'object' ? JSON.stringify(key) : String(key);

    if (this.options.cache && this.cacheMap.has(cacheKey)) {
      return this.cacheMap.get(cacheKey)!;
    }

    const promise = new Promise<V>((resolve, reject) => {
      this.queue.push({ key, resolve, reject });

      if (this.queue.length >= this.options.maxBatchSize) {
        this.dispatchQueue();
      } else if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => this.dispatchQueue(), this.options.batchScheduleDelayMs);
      }
    });

    if (this.options.cache) {
      this.cacheMap.set(cacheKey, promise);
    }

    return promise;
  }

  public async loadMany(keys: ReadonlyArray<K>): Promise<V[]> {
    return Promise.all(keys.map((k) => this.load(k)));
  }

  public clear(key: K): this {
    const cacheKey = typeof key === 'object' ? JSON.stringify(key) : String(key);
    this.cacheMap.delete(cacheKey);
    return this;
  }

  public clearAll(): this {
    this.cacheMap.clear();
    return this;
  }

  public prime(key: K, value: V): this {
    const cacheKey = typeof key === 'object' ? JSON.stringify(key) : String(key);
    if (!this.cacheMap.has(cacheKey)) {
      this.cacheMap.set(cacheKey, Promise.resolve(value));
    }
    return this;
  }

  private async dispatchQueue(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.queue.length === 0) return;

    const currentBatch = [...this.queue];
    this.queue = [];

    const keys = currentBatch.map((item) => item.key);

    try {
      const results = await this.batchFn(keys);

      if (results.length !== currentBatch.length) {
        throw new ApiClientError(
          `DataLoader batch function returned ${results.length} elements for ${currentBatch.length} keys`,
          'DATALOADER_COUNT_MISMATCH'
        );
      }

      for (let i = 0; i < currentBatch.length; i++) {
        const item = currentBatch[i];
        const res = results[i];
        if (res instanceof Error) {
          item.reject(res);
        } else {
          item.resolve(res);
        }
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      for (const item of currentBatch) {
        item.reject(errorObj);
      }
    }
  }
}

// ============================================================================
// SECTION 52: AUTOMATED CHAOS ENGINEERING & FAULT INJECTION TEST ENGINE
// ============================================================================

export interface ChaosFaultConfiguration {
  enabled: boolean;
  latencyProbability: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  errorProbability: number;
  errorStatusCodes: number[];
  offlineProbability: number;
  corruptResponseProbability: number;
}

export class ChaosEngineeringEngine {
  private config: ChaosFaultConfiguration = {
    enabled: false,
    latencyProbability: 0.0,
    minLatencyMs: 200,
    maxLatencyMs: 3000,
    errorProbability: 0.0,
    errorStatusCodes: [500, 502, 503, 504],
    offlineProbability: 0.0,
    corruptResponseProbability: 0.0
  };

  constructor(config?: Partial<ChaosFaultConfiguration>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  public enable(): void {
    this.config.enabled = true;
  }

  public disable(): void {
    this.config.enabled = false;
  }

  public configure(config: Partial<ChaosFaultConfiguration>): void {
    this.config = { ...this.config, ...config };
  }

  public async evaluateBeforeRequest(config: ExtendedInternalRequestConfig): Promise<void> {
    if (!this.config.enabled) return;

    // Simulate Network Disconnect Fault
    if (Math.random() < this.config.offlineProbability) {
      throw new NetworkError('[CHAOS SIMULATION] Forced client-side network disconnection', {
        endpoint: config.url,
        method: config.method
      });
    }

    // Simulate Unpredictable Injected Latency
    if (Math.random() < this.config.latencyProbability) {
      const delay = Math.floor(
        this.config.minLatencyMs + Math.random() * (this.config.maxLatencyMs - this.config.minLatencyMs)
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Simulate Upstream Server 5xx Fault
    if (Math.random() < this.config.errorProbability) {
      const randomStatus = this.config.errorStatusCodes[
        Math.floor(Math.random() * this.config.errorStatusCodes.length)
      ];
      throw new HttpError(
        randomStatus,
        `[CHAOS SIMULATION] Injected Upstream Service Fault (${randomStatus})`,
        { chaos: true, timestamp: Date.now() },
        { endpoint: config.url, method: config.method, statusCode: randomStatus }
      );
    }
  }

  public evaluateAfterResponse<T>(response: AxiosResponse<T>): AxiosResponse<T> {
    if (!this.config.enabled) return response;

    // Simulate Response Payload Corruption
    if (Math.random() < this.config.corruptResponseProbability) {
      if (typeof response.data === 'object' && response.data !== null) {
        return {
          ...response,
          data: { ...response.data, __CHAOS_CORRUPTED__: true, corruptedAt: Date.now() }
        };
      }
    }

    return response;
  }
}

// ============================================================================
// SECTION 53: ZERO-TRUST FIELD-LEVEL ENCRYPTION & PAYLOAD INTEGRITY SEAL
// ============================================================================

export interface FieldEncryptionConfig {
  keySecret: string;
  encryptedFields: string[];
  algorithm?: 'AES-GCM';
  ivLength?: number;
}

export class FieldLevelEncryptionEngine {
  private readonly config: Required<FieldEncryptionConfig>;

  constructor(config: FieldEncryptionConfig) {
    this.config = {
      keySecret: config.keySecret,
      encryptedFields: config.encryptedFields,
      algorithm: config.algorithm ?? 'AES-GCM',
      ivLength: config.ivLength ?? 12
    };
  }

  public async encryptObjectFields<T extends Record<string, unknown>>(data: T): Promise<T> {
    if (!data || typeof data !== 'object') return data;
    const cloned = JSON.parse(JSON.stringify(data));

    for (const field of this.config.encryptedFields) {
      if (field in cloned && cloned[field] !== undefined && cloned[field] !== null) {
        const rawValue = typeof cloned[field] === 'string' ? cloned[field] : JSON.stringify(cloned[field]);
        cloned[field] = await this.encryptValue(rawValue);
      }
    }

    return cloned;
  }

  public async decryptObjectFields<T extends Record<string, unknown>>(data: T): Promise<T> {
    if (!data || typeof data !== 'object') return data;
    const cloned = JSON.parse(JSON.stringify(data));

    for (const field of this.config.encryptedFields) {
      if (field in cloned && typeof cloned[field] === 'string' && cloned[field].startsWith('enc:v1:')) {
        const decrypted = await this.decryptValue(cloned[field]);
        try {
          cloned[field] = JSON.parse(decrypted);
        } catch {
          cloned[field] = decrypted;
        }
      }
    }

    return cloned;
  }

  private async encryptValue(plainText: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
      const encoder = new TextEncoder();
      const iv = new Uint8Array(this.config.ivLength);
      crypto.getRandomValues(iv);

      const rawKey = encoder.encode(this.config.keySecret.padEnd(32, '#').slice(0, 32));
      const key = await crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['encrypt']);

      const cipherBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(plainText)
      );

      const ivBase64 = this.bytesToBase64(iv);
      const cipherBase64 = this.bytesToBase64(new Uint8Array(cipherBuffer));

      return `enc:v1:${ivBase64}:${cipherBase64}`;
    }

    // Basic deterministic fallback
    return `enc:v1:fallback:${btoa(plainText)}`;
  }

  private async decryptValue(cipherText: string): Promise<string> {
    const parts = cipherText.split(':');
    if (parts.length < 4 || parts[0] !== 'enc' || parts[1] !== 'v1') {
      return cipherText;
    }

    const ivStr = parts[2];
    const cipherStr = parts[3];

    if (ivStr === 'fallback') {
      return atob(cipherStr);
    }

    if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextDecoder !== 'undefined') {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const iv = this.base64ToBytes(ivStr);
      const cipherBytes = this.base64ToBytes(cipherStr);

      const rawKey = encoder.encode(this.config.keySecret.padEnd(32, '#').slice(0, 32));
      const key = await crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['decrypt']);

      const plainBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        cipherBytes
      );

      return decoder.decode(plainBuffer);
    }

    return cipherText;
  }

  private bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}

// ============================================================================
// SECTION 54: ADAPTIVE REPLACEMENT CACHE (ARC) HIGH-PERFORMANCE ENGINE
// ============================================================================

export class AdaptiveReplacementCache<T = unknown> implements ICacheAdapter {
  private readonly capacity: number;
  private p: number = 0; // Target size for T1

  // Cache Pages
  private t1: Map<string, CacheEntry<T>> = new Map(); // Recent cache entries
  private t2: Map<string, CacheEntry<T>> = new Map(); // Frequent cache entries
  private b1: Map<string, boolean> = new Map(); // Ghost history for T1
  private b2: Map<string, boolean> = new Map(); // Ghost history for T2

  constructor(capacity: number = 500) {
    this.capacity = capacity;
  }

  public get<U = T>(key: string): CacheEntry<U> | null {
    const entry = this.internalGet(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.cachedAt + entry.ttlMs + entry.staleWhileRevalidateMs) {
      this.delete(key);
      return null;
    }

    entry.hits++;
    return entry as unknown as CacheEntry<U>;
  }

  private internalGet(key: string): CacheEntry<T> | null {
    // Case 1: Hit in T1 -> Move to T2 (MRU)
    if (this.t1.has(key)) {
      const entry = this.t1.get(key)!;
      this.t1.delete(key);
      this.t2.set(key, entry);
      return entry;
    }

    // Case 2: Hit in T2 -> Move to MRU of T2
    if (this.t2.has(key)) {
      const entry = this.t2.get(key)!;
      this.t2.delete(key);
      this.t2.set(key, entry);
      return entry;
    }

    return null;
  }

  public set<U = T>(key: string, entry: CacheEntry<U>): void {
    const typedEntry = entry as unknown as CacheEntry<T>;

    // Case 1: Key is already in T1 or T2
    if (this.t1.has(key)) {
      this.t1.delete(key);
      this.t2.set(key, typedEntry);
      return;
    }
    if (this.t2.has(key)) {
      this.t2.delete(key);
      this.t2.set(key, typedEntry);
      return;
    }

    // Case 2: Key is in B1 (Ghost of T1)
    if (this.b1.has(key)) {
      const delta = this.b1.size >= this.b2.size ? 1 : this.b2.size / this.b1.size;
      this.p = Math.min(this.capacity, this.p + delta);
      this.replace(key);
      this.b1.delete(key);
      this.t2.set(key, typedEntry);
      return;
    }

    // Case 3: Key is in B2 (Ghost of T2)
    if (this.b2.has(key)) {
      const delta = this.b2.size >= this.b1.size ? 1 : this.b1.size / this.b2.size;
      this.p = Math.max(0, this.p - delta);
      this.replace(key);
      this.b2.delete(key);
      this.t2.set(key, typedEntry);
      return;
    }

    // Case 4: Key is not in any list
    const l1Size = this.t1.size + this.b1.size;
    if (l1Size === this.capacity) {
      if (this.t1.size < this.capacity) {
        const lruB1 = this.b1.keys().next().value;
        if (lruB1) this.b1.delete(lruB1);
        this.replace(key);
      } else {
        const lruT1 = this.t1.keys().next().value;
        if (lruT1) this.t1.delete(lruT1);
      }
    } else if (l1Size < this.capacity) {
      const totalSize = this.t1.size + this.t2.size + this.b1.size + this.b2.size;
      if (totalSize >= this.capacity * 2) {
        const lruB2 = this.b2.keys().next().value;
        if (lruB2) this.b2.delete(lruB2);
      }
      this.replace(key);
    }

    this.t1.set(key, typedEntry);
  }

  private replace(key: string): void {
    if (this.t1.size > 0 && (this.t1.size > this.p || (this.b2.has(key) && this.t1.size === Math.round(this.p)))) {
      const lruKey = this.t1.keys().next().value;
      if (lruKey) {
        this.t1.delete(lruKey);
        this.b1.set(lruKey, true);
      }
    } else {
      const lruKey = this.t2.keys().next().value;
      if (lruKey) {
        this.t2.delete(lruKey);
        this.b2.set(lruKey, true);
      }
    }
  }

  public delete(key: string): boolean {
    const deletedT1 = this.t1.delete(key);
    const deletedT2 = this.t2.delete(key);
    this.b1.delete(key);
    this.b2.delete(key);
    return deletedT1 || deletedT2;
  }

  public clear(): void {
    this.t1.clear();
    this.t2.clear();
    this.b1.clear();
    this.b2.clear();
    this.p = 0;
  }

  public prune(): number {
    const now = Date.now();
    let count = 0;

    for (const [key, entry] of this.t1.entries()) {
      if (now > entry.cachedAt + entry.ttlMs + entry.staleWhileRevalidateMs) {
        this.t1.delete(key);
        count++;
      }
    }

    for (const [key, entry] of this.t2.entries()) {
      if (now > entry.cachedAt + entry.ttlMs + entry.staleWhileRevalidateMs) {
        this.t2.delete(key);
        count++;
      }
    }

    return count;
  }

  public has(key: string): boolean {
    return this.t1.has(key) || this.t2.has(key);
  }

  public size(): number {
    return this.t1.size + this.t2.size;
  }
}

// ============================================================================
// SECTION 55: TRAFFIC COMPRESSION BENCHMARKER & NETWORK TELEMETRY
// ============================================================================

export interface NetworkTrafficProfile {
  totalBytesSent: number;
  totalBytesReceived: number;
  totalCompressedBytesSaved: number;
  averageCompressionRatio: number;
  requestCount: number;
}

export class TrafficAnalyticsProfiler {
  private totalBytesSent: number = 0;
  private totalBytesReceived: number = 0;
  private rawBytesUncompressed: number = 0;
  private compressedBytesReceived: number = 0;
  private requestCount: number = 0;

  public recordEgress(payloadSize: number): void {
    this.totalBytesSent += payloadSize;
    this.requestCount++;
  }

  public recordIngress(rawSize: number, compressedSize?: number): void {
    this.totalBytesReceived += compressedSize || rawSize;
    this.rawBytesUncompressed += rawSize;
    if (compressedSize && compressedSize < rawSize) {
      this.compressedBytesReceived += compressedSize;
    }
  }

  public getProfile(): NetworkTrafficProfile {
    const saved = Math.max(0, this.rawBytesUncompressed - this.totalBytesReceived);
    const ratio = this.rawBytesUncompressed > 0
      ? Math.round((this.totalBytesReceived / this.rawBytesUncompressed) * 100) / 100
      : 1.0;

    return {
      totalBytesSent: this.totalBytesSent,
      totalBytesReceived: this.totalBytesReceived,
      totalCompressedBytesSaved: saved,
      averageCompressionRatio: ratio,
      requestCount: this.requestCount
    };
  }

  public reset(): void {
    this.totalBytesSent = 0;
    this.totalBytesReceived = 0;
    this.rawBytesUncompressed = 0;
    this.compressedBytesReceived = 0;
    this.requestCount = 0;
  }
}

// ============================================================================
// SECTION 56: COMPREHENSIVE PLUGIN & MIDDLEWARE LIFECYCLE ENGINE
// ============================================================================

export type MiddlewareNextFunction = () => Promise<AxiosResponse>;

export interface IApiClientMiddleware {
  name: string;
  priority?: number;
  onRequest?: (config: ExtendedInternalRequestConfig) => Promise<ExtendedInternalRequestConfig> | ExtendedInternalRequestConfig;
  onResponse?: (response: AxiosResponse) => Promise<AxiosResponse> | AxiosResponse;
  onError?: (error: ApiClientError) => Promise<AxiosResponse | void> | AxiosResponse | void;
}

export class ApiClientPluginManager {
  private middlewares: IApiClientMiddleware[] = [];

  public use(middleware: IApiClientMiddleware): this {
    this.middlewares.push({
      priority: 100,
      ...middleware
    });
    this.middlewares.sort((a, b) => (a.priority || 100) - (b.priority || 100));
    return this;
  }

  public async executeRequestChain(
    initialConfig: ExtendedInternalRequestConfig
  ): Promise<ExtendedInternalRequestConfig> {
    let currentConfig = initialConfig;
    for (const mw of this.middlewares) {
      if (mw.onRequest) {
        currentConfig = await mw.onRequest(currentConfig);
      }
    }
    return currentConfig;
  }

  public async executeResponseChain(initialResponse: AxiosResponse): Promise<AxiosResponse> {
    let currentResponse = initialResponse;
    for (const mw of this.middlewares) {
      if (mw.onResponse) {
        currentResponse = await mw.onResponse(currentResponse);
      }
    }
    return currentResponse;
  }

  public async executeErrorChain(error: ApiClientError): Promise<AxiosResponse | null> {
    for (const mw of this.middlewares) {
      if (mw.onError) {
        const result = await mw.onError(error);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  public getPlugins(): IApiClientMiddleware[] {
    return [...this.middlewares];
  }

  public removePlugin(name: string): boolean {
    const idx = this.middlewares.findIndex((m) => m.name === name);
    if (idx !== -1) {
      this.middlewares.splice(idx, 1);
      return true;
    }
    return false;
  }

  public clear(): void {
    this.middlewares = [];
  }
}
// ============================================================================
// SECTION 57: COMPREHENSIVE MOCK & TESTING HARNESS FOR UNIT/INTEGRATION TESTS
// ============================================================================

export interface MockExpectationRule {
  id: string;
  method: HttpMethod | 'ANY';
  urlPattern: string | RegExp;
  queryParams?: Record<string, string | number | boolean>;
  expectedBodyPredicate?: (body: unknown) => boolean;
  response: {
    status: number;
    statusText?: string;
    data: unknown;
    headers?: Record<string, string>;
    delayMs?: number;
  };
  timesAllowed: number;
  callCount: number;
}

export class ApiClientMockHarness {
  private expectations: MockExpectationRule[] = [];
  private recordedCalls: Array<{
    method: string;
    url: string;
    params?: unknown;
    data?: unknown;
    headers?: Record<string, unknown>;
    timestamp: number;
  }> = [];

  public expect(
    method: HttpMethod | 'ANY',
    urlPattern: string | RegExp
  ): {
    respondWith: (data: unknown, status?: number, headers?: Record<string, string>, delayMs?: number) => MockExpectationRule;
  } {
    return {
      respondWith: (data: unknown, status: number = 200, headers: Record<string, string> = {}, delayMs: number = 0) => {
        const rule: MockExpectationRule = {
          id: CryptographicEngine.generateUuidV4(),
          method,
          urlPattern,
          response: {
            status,
            statusText: status === 200 ? 'OK' : `Status ${status}`,
            data,
            headers,
            delayMs
          },
          timesAllowed: Infinity,
          callCount: 0
        };
        this.expectations.push(rule);
        return rule;
      }
    };
  }

  public createMockAdapter(client: ApiClientCore): void {
    const axiosInstance = client.getAxiosInstance();

    // Replace Axios default adapter with synthetic mock adapter
    axiosInstance.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
      const method = (config.method || 'GET').toUpperCase() as HttpMethod;
      const url = config.url || '';

      this.recordedCalls.push({
        method,
        url,
        params: config.params,
        data: config.data,
        headers: config.headers as unknown as Record<string, unknown>,
        timestamp: Date.now()
      });

      const matchedRule = this.findMatchingExpectation(method, url, config.params, config.data);

      if (!matchedRule) {
        throw new HttpError(
          HttpStatus.NOT_FOUND,
          `[MOCK HARNESS] No matching expectation found for ${method} ${url}`,
          { url, method, unmocked: true },
          { endpoint: url, method }
        );
      }

      matchedRule.callCount++;

      if (matchedRule.response.delayMs && matchedRule.response.delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, matchedRule.response.delayMs));
      }

      if (matchedRule.response.status >= 400) {
        throw new HttpError(
          matchedRule.response.status,
          matchedRule.response.statusText || 'Mock Error',
          matchedRule.response.data,
          { endpoint: url, method, statusCode: matchedRule.response.status }
        );
      }

      return {
        data: matchedRule.response.data,
        status: matchedRule.response.status,
        statusText: matchedRule.response.statusText || 'OK',
        headers: new AxiosHeaders(matchedRule.response.headers || {}),
        config,
        request: {}
      } as AxiosResponse;
    };
  }

  private findMatchingExpectation(
    method: HttpMethod,
    url: string,
    params?: unknown,
    data?: unknown
  ): MockExpectationRule | null {
    for (const rule of this.expectations) {
      if (rule.callCount >= rule.timesAllowed) continue;

      if (rule.method !== 'ANY' && rule.method !== method) continue;

      let matchUrl = false;
      if (typeof rule.urlPattern === 'string') {
        matchUrl = rule.urlPattern === url || url.includes(rule.urlPattern);
      } else if (rule.urlPattern instanceof RegExp) {
        matchUrl = rule.urlPattern.test(url);
      }

      if (!matchUrl) continue;

      if (rule.expectedBodyPredicate && !rule.expectedBodyPredicate(data)) {
        continue;
      }

      return rule;
    }
    return null;
  }

  public getRecordedCalls(): Array<{ method: string; url: string; params?: unknown; data?: unknown }> {
    return [...this.recordedCalls];
  }

  public verifyCalled(method: HttpMethod | 'ANY', urlPattern: string | RegExp, times?: number): boolean {
    const matching = this.recordedCalls.filter((c) => {
      const matchMethod = method === 'ANY' || c.method === method;
      const matchUrl = typeof urlPattern === 'string' ? c.url.includes(urlPattern) : urlPattern.test(c.url);
      return matchMethod && matchUrl;
    });

    if (times !== undefined) {
      return matching.length === times;
    }
    return matching.length > 0;
  }

  public reset(): void {
    this.expectations = [];
    this.recordedCalls = [];
  }
}

// ============================================================================
// SECTION 58: ENTERPRISE TELEMETRY COLLECTOR INTEGRATION (OPENTELEMETRY / PROMETHEUS)
// ============================================================================

export interface OpenTelemetrySpanRecord {
  name: string;
  context: {
    trace_id: string;
    span_id: string;
    trace_state?: string;
  };
  parent_id?: string;
  start_time: [number, number];
  end_time: [number, number];
  attributes: Record<string, string | number | boolean>;
  events: Array<{ name: string; time: [number, number]; attributes?: Record<string, unknown> }>;
  status: { code: number; message?: string };
}

export class OpenTelemetryHttpExporter implements ITelemetryExporter {
  private readonly collectorUrl: string;
  private readonly serviceName: string;
  private queuedSpans: OpenTelemetrySpanRecord[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private readonly batchSize: number;

  constructor(collectorUrl: string, serviceName: string = 'api-client-gateway', batchSize: number = 50) {
    this.collectorUrl = collectorUrl;
    this.serviceName = serviceName;
    this.batchSize = batchSize;

    if (PlatformEnvironmentDetector.isBrowser() || PlatformEnvironmentDetector.isNode()) {
      this.flushTimer = setInterval(() => {
        this.flush();
      }, 10000);
    }
  }

  public exportSpan(span: TelemetrySpan): void {
    const startSec = Math.floor(span.startTime / 1000);
    const startNano = Math.floor((span.startTime % 1000) * 1000000);
    const endMs = span.endTime || span.startTime;
    const endSec = Math.floor(endMs / 1000);
    const endNano = Math.floor((endMs % 1000) * 1000000);

    const otelSpan: OpenTelemetrySpanRecord = {
      name: span.operationName,
      context: {
        trace_id: span.traceId.replace(/-/g, '').padStart(32, '0').slice(-32),
        span_id: span.spanId.replace(/-/g, '').padStart(16, '0').slice(-16)
      },
      parent_id: span.parentSpanId ? span.parentSpanId.replace(/-/g, '').padStart(16, '0').slice(-16) : undefined,
      start_time: [startSec, startNano],
      end_time: [endSec, endNano],
      attributes: {
        'service.name': this.serviceName,
        'http.status_code': (span.tags['http.status_code'] as number) || 200,
        ...span.tags
      },
      events: span.events.map((e) => ({
        name: e.name,
        time: [Math.floor(e.timestamp / 1000), Math.floor((e.timestamp % 1000) * 1000000)],
        attributes: e.attributes
      })),
      status: {
        code: span.status === 'ERROR' ? 2 : 1,
        message: span.errorDetails?.message
      }
    };

    this.queuedSpans.push(otelSpan);

    if (this.queuedSpans.length >= this.batchSize) {
      this.flush();
    }
  }

  public exportMetric(eventName: TelemetryEventType, attributes: Record<string, unknown>): void {
    // Metric exporter conversion
  }

  public async flush(): Promise<void> {
    if (this.queuedSpans.length === 0) return;

    const payload = [...this.queuedSpans];
    this.queuedSpans = [];

    try {
      if (typeof fetch !== 'undefined') {
        await fetch(this.collectorUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resourceSpans: [{ spans: payload }] }),
          keepalive: true
        });
      }
    } catch (err) {
      console.warn('OpenTelemetry span dispatch failed:', err);
    }
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }
}

export class PrometheusMetricsRegistry {
  private counters: Map<string, { value: number; labels: Record<string, string> }> = new Map();
  private histograms: Map<string, LatencyMetricsHistogram> = new Map();

  public incrementCounter(name: string, labels: Record<string, string> = {}, value: number = 1): void {
    const labelKey = Object.entries(labels).sort().map(([k, v]) => `${k}="${v}"`).join(',');
    const fullKey = `${name}{${labelKey}}`;

    const existing = this.counters.get(fullKey) || { value: 0, labels };
    existing.value += value;
    this.counters.set(fullKey, existing);
  }

  public recordHistogram(name: string, valueMs: number): void {
    let hist = this.histograms.get(name);
    if (!hist) {
      hist = new LatencyMetricsHistogram();
      this.histograms.set(name, hist);
    }
    hist.record(valueMs);
  }

  public exportPrometheusText(): string {
    const lines: string[] = [];

    // Export Counters
    for (const [key, record] of this.counters.entries()) {
      lines.push(`${key} ${record.value}`);
    }

    // Export Histograms
    for (const [name, hist] of this.histograms.entries()) {
      const summary = hist.getSummary();
      lines.push(`${name}_count ${summary.count}`);
      lines.push(`${name}_sum ${summary.sum}`);
      lines.push(`${name}{quantile="0.5"} ${summary.p50}`);
      lines.push(`${name}{quantile="0.9"} ${summary.p90}`);
      lines.push(`${name}{quantile="0.95"} ${summary.p95}`);
      lines.push(`${name}{quantile="0.99"} ${summary.p99}`);
    }

    return lines.join('\n');
  }
}

// ============================================================================
// SECTION 59: CLIENT FACTORY, SINGLETON REGISTRY & ENVIRONMENT-AWARE RESOLVER
// ============================================================================

export interface MultiTenantClientRegistryOptions {
  defaultBaseUrl?: string;
  defaultTimeoutMs?: number;
  enableGlobalCache?: boolean;
}

export class ApiClientRegistry {
  private static instance: ApiClientRegistry;
  private clients: Map<string, ApiClientCore> = new Map();
  private defaultClient: ApiClientCore;

  private constructor(options: MultiTenantClientRegistryOptions = {}) {
    this.defaultClient = new ApiClientCore({
      baseURL: options.defaultBaseUrl || PlatformEnvironmentDetector.deduceBaseUrl(),
      timeoutMs: options.defaultTimeoutMs ?? 15000,
      cache: {
        enabled: options.enableGlobalCache ?? true,
        adapter: new MemoryCacheAdapter(2000),
        defaultStrategy: CacheStrategy.STALE_WHILE_REVALIDATE
      }
    });
    this.clients.set('default', this.defaultClient);
  }

  public static getInstance(options?: MultiTenantClientRegistryOptions): ApiClientRegistry {
    if (!ApiClientRegistry.instance) {
      ApiClientRegistry.instance = new ApiClientRegistry(options);
    }
    return ApiClientRegistry.instance;
  }

  public getDefault(): ApiClientCore {
    return this.defaultClient;
  }

  public getOrCreate(name: string, factory?: () => ApiClientCore): ApiClientCore {
    let client = this.clients.get(name);
    if (!client) {
      client = factory ? factory() : new ApiClientCore({ baseURL: PlatformEnvironmentDetector.deduceBaseUrl() });
      this.clients.set(name, client);
    }
    return client;
  }

  public register(name: string, client: ApiClientCore): void {
    this.clients.set(name, client);
  }

  public remove(name: string): boolean {
    if (name === 'default') return false;
    return this.clients.delete(name);
  }

  public clear(): void {
    this.clients.clear();
    this.clients.set('default', this.defaultClient);
  }
}

// ============================================================================
// SECTION 60: PRODUCTION FACTORY CONSTRUCTOR & BACKWARD-COMPATIBLE DEFAULT EXPORT
// ============================================================================

/**
 * Creates an enterprise-grade configured instance of the HTTP gateway.
 */
export function createApiClient(config: ApiClientConfig = {}): ApiClientCore {
  return new ApiClientCore(config);
}

/**
 * Global singleton instance of ApiClientCore preconfigured with resilient defaults,
 * circuit breaking, auto-refresh authorization lifecycle, SWR caching, and telemetry.
 */
export const defaultApiClientCore: ApiClientCore = ApiClientRegistry.getInstance().getDefault();

/**
 * Underlying Axios instance of the global default client, providing 100% complete
 * seamless drop-in backwards compatibility with any existing Axios codebase.
 */
export const apiClient: AxiosInstance = defaultApiClientCore.getAxiosInstance();

// Backward compatibility default export
export default apiClient;

// --- CONSOLIDATED FROM: ./client.ts ---

import axios from 'axios';

// Detect the exact base URL of the environment the browser is running on
const getBaseURL = (): string => {
  // If running in a browser environment, deduce paths dynamically
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    
    // Check if the current URL is a local development instance
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return 'http://localhost:5000/api'; // Fallback to your local dev backend port
    }
    
    // If running live on production (GitHub Pages / Vercel), point directly to its relative api gateway
    return `${origin}/api`;
  }
  
  return '/api'; // Standard static fallback
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to securely append the authorization token
apiClient.interceptors.request.use(
  (config) => {
    // Explicitly cast window configuration to avoid strict TypeScript metadata blocks
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    if (token && config.url) {
      // Guardrail: Detect absolute URLs to untrusted third-party domains
      const isInternal = !config.url.startsWith('http://') && !config.url.startsWith('https://');
      const isExplicitBase = config.baseURL && config.url.startsWith(config.baseURL);

      // Securely append the bearer token only if it matches your application's domain environment
      if (isInternal || isExplicitBase) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized responses gracefully
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        // Clear the expired or invalid token
        localStorage.removeItem('auth_token');
        
        // Redirect to the login page
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// --- CONSOLIDATED FROM: ./lib/api/client.ts ---

import axios, { AxiosInstance, AxiosRequestConfig, CreateAxiosDefaults } from 'axios';

/**
 * Configuration for the API client factory.
 */
const DEFAULT_CONFIG: CreateAxiosDefaults = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * Creates a centralized Axios instance with pre-configured interceptors.
 * 
 * @param config - Optional Axios configuration to override defaults.
 * @returns A configured AxiosInstance.
 */
export const createApiClient = (config: CreateAxiosDefaults = {}): AxiosInstance => {
  const instance = axios.create({
    ...DEFAULT_CONFIG,
    ...config,
  });

  // Request Interceptor: Authentication
  instance.interceptors.request.use(
    (config) => {
      // In a browser environment, retrieve the token from storage
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor: Error Handling & Data Transformation
  instance.interceptors.response.use(
    (response) => {
      // Return the data directly or the full response based on preference
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Handle specific HTTP status codes
      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 401:
            // Logic for unauthorized access (e.g., token refresh or logout)
            console.error('Unauthorized access. Please log in again.');
            if (typeof window !== 'undefined') {
              // Optional: localStorage.removeItem('auth_token');
              // Optional: window.location.href = '/login';
            }
            break;

          case 403:
            console.error('Forbidden: You do not have permission to perform this action.');
            break;

          case 404:
            console.error('Resource not found.');
            break;

          case 422:
            console.error('Validation error:', data.errors || data.message);
            break;

          case 500:
            console.error('Internal server error. Please try again later.');
            break;

          default:
            console.error(`API Error (${status}):`, data.message || error.message);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Network error: No response received from server.');
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', error.message);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * Default API client instance for general use throughout the application.
 */
const apiClient = createApiClient();

export default apiClient;