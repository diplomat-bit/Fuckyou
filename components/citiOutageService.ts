

// --- CONSOLIDATED FROM: ./services/citiOutageService.ts ---

/**
 * CITIBANK INSTITUTIONAL CLIENT GROUP & GLOBAL WEALTH MANAGEMENT
 * API Platform Services - Foundations Outage Maintenance Discovery Layer
 * Standard: Open Banking PSD2 / CDR Discovery API Specification v3.1.8
 * Classification: Tier-0 Mission Critical Treasury Infrastructure
 */

export type OutageSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type OutageStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface AffectedServiceEndpoint {
  serviceId: string;
  serviceName: string;
  apiFamily: 'TREASURY' | 'FX_RATES' | 'PAYMENTS_INSTANT' | 'SECURITIES_LENDING' | 'CREDIT_FACILITY' | 'PSD2_OPEN_BANKING';
  endpointPattern: string;
  degradationType: 'FULL_OUTAGE' | 'LATENCY_SPIKE' | 'PARTIAL_THROTTLING' | 'READ_ONLY_FALLBACK';
  expectedLatencyMultiplier?: number;
}

export interface CitiOutageRecord {
  outageId: string;
  title: string;
  summary: string;
  description: string;
  severity: OutageSeverity;
  status: OutageStatus;
  scheduledStartTime: string; // ISO 8601 UTC
  scheduledEndTime: string;   // ISO 8601 UTC
  actualStartTime?: string;
  actualEndTime?: string;
  isoDuration: string;        // ISO 8601 Duration e.g. "PT4H30M"
  parsedDuration: ParsedDuration;
  affectedServices: AffectedServiceEndpoint[];
  datacenterRegions: string[];
  cdrSpecificationRef: string;
  psd2RegulatoryArticle: string;
  mitigationStrategy: string;
  fallbackActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedDuration {
  raw: string;
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMilliseconds: number;
  humanReadable: string;
}

export interface TelemetryHeaders {
  'x-fapi-interaction-id': string;
  'x-citi-client-id': string;
  'x-citi-timestamp': string;
  'x-citi-correlation-id': string;
  'x-fapi-auth-date'?: string;
  'x-cdr-client-cert-thumbprint'?: string;
  'x-citi-environment': 'PRODUCTION_TIER0' | 'DISASTER_RECOVERY' | 'MOCK_SANDBOX';
  'x-client-ip'?: string;
  'Authorization'?: string;
}

export interface OutageQueryOptions {
  status?: OutageStatus;
  severity?: OutageSeverity;
  serviceFamily?: AffectedServiceEndpoint['apiFamily'];
  fromDate?: string; // ISO 8601
  toDate?: string;   // ISO 8601
  limit?: number;
  offset?: number;
}

export interface CitiOutageDiscoveryResponse {
  data: {
    outages: CitiOutageRecord[];
    pagination: {
      totalRecords: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
    healthMatrix: {
      coreTreasuryHealthy: boolean;
      instantRailsDegraded: boolean;
      fxStreamAvailable: boolean;
      overallSlaScore: number; // e.g. 99.999
    };
  };
  links: {
    self: string;
    first?: string;
    next?: string;
    last?: string;
  };
  meta: {
    totalRecords: number;
    cdrComplianceTier: string;
    psd2TppId: string;
    responseGeneratedAt: string;
    telemetryId: string;
  };
}

export type ServiceOperationalMode = 'MOCK' | 'LIVE_WITH_FALLBACK' | 'LIVE_ONLY';

/**
 * High-precision ISO 8601 Duration Parser
 * Complies with RFC 3339 / ISO 8601 time duration intervals (PnYnMnDTnHnMnS)
 */
export function parseIsoDuration(durationStr: string): ParsedDuration {
  const defaultDuration: ParsedDuration = {
    raw: durationStr || 'PT0S',
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMilliseconds: 0,
    humanReadable: '0s'
  };

  if (!durationStr || typeof durationStr !== 'string') {
    return defaultDuration;
  }

  const iso8601Regex = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;
  const matches = durationStr.match(iso8601Regex);

  if (!matches) {
    return defaultDuration;
  }

  const years = parseInt(matches[1] || '0', 10);
  const months = parseInt(matches[2] || '0', 10);
  const days = parseInt(matches[3] || '0', 10);
  const hours = parseInt(matches[4] || '0', 10);
  const minutes = parseInt(matches[5] || '0', 10);
  const seconds = parseFloat(matches[6] || '0');

  const totalMilliseconds =
    years * 365.25 * 24 * 3600 * 1000 +
    months * 30.44 * 24 * 3600 * 1000 +
    days * 24 * 3600 * 1000 +
    hours * 3600 * 1000 +
    minutes * 60 * 1000 +
    Math.round(seconds * 1000);

  const parts: string[] = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}mo`);
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return {
    raw: durationStr,
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalMilliseconds,
    humanReadable: parts.join(' ')
  };
}

/**
 * Generates ISO FAPI & PSD2 Regulatory Telemetry Headers
 */
export function generateCitiTelemetryHeaders(clientId?: string, thumbprint?: string): TelemetryHeaders {
  const interactionId = `fapi-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)}`;
  const correlationId = `citi-t0-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return {
    'x-fapi-interaction-id': interactionId,
    'x-citi-client-id': clientId || 'CITI-PRIVATE-BANK-AI-999-INST',
    'x-citi-timestamp': new Date().toISOString(),
    'x-citi-correlation-id': correlationId,
    'x-fapi-auth-date': new Date().toUTCString(),
    'x-cdr-client-cert-thumbprint': thumbprint || 'SHA256:7f4a0c8b91e23d44f65c19208a1bb819c991e4a2c6d48293e482bb29801fa882',
    'x-citi-environment': 'PRODUCTION_TIER0'
  };
}

/**
 * Mock Catalog of High-Value Citibank Outage & Maintenance Events
 */
const MOCK_OUTAGES: CitiOutageRecord[] = [
  {
    outageId: 'OUT-CITI-2025-0891',
    title: 'Quantum-Safe HSM Cryptographic Key Rotation & Ledger Re-indexing',
    summary: 'Bi-annual Tier-0 cryptographic enclave refresh across Wall St & Zurich data centers.',
    description: 'Scheduled maintenance for quantum-resistant lattice signature validation clusters and high-throughput SWIFT ISO20022 parsing engines. Automated read-only liquidity routing active.',
    severity: 'MEDIUM',
    status: 'SCHEDULED',
    scheduledStartTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    scheduledEndTime: new Date(Date.now() + 86400000 * 2 + 7200000).toISOString(),
    isoDuration: 'PT2H0M',
    parsedDuration: parseIsoDuration('PT2H0M'),
    affectedServices: [
      {
        serviceId: 'SRV-CITI-SEC-01',
        serviceName: 'HSM Signature Core',
        apiFamily: 'TREASURY',
        endpointPattern: '/v1/treasury/signatures/batch-sign',
        degradationType: 'READ_ONLY_FALLBACK',
        expectedLatencyMultiplier: 1.5
      },
      {
        serviceId: 'SRV-CITI-PSD2-09',
        serviceName: 'Open Banking FAPI Token Gateway',
        apiFamily: 'PSD2_OPEN_BANKING',
        endpointPattern: '/open-banking/v3.1/pisp/payment-consents',
        degradationType: 'PARTIAL_THROTTLING',
        expectedLatencyMultiplier: 2.1
      }
    ],
    datacenterRegions: ['US-EAST-NYC-1', 'EU-CENTRAL-ZURICH-4', 'APAC-SINGAPORE-2'],
    cdrSpecificationRef: 'CDR-DISCOVERY-MAINTENANCE-V1.4',
    psd2RegulatoryArticle: 'RTS Article 32(3) Scheduled Downtime Notification',
    mitigationStrategy: 'Standby hot-failover proxy cluster at London Canary Wharf DC primed for instant rollover.',
    fallbackActive: true,
    createdAt: '2025-02-15T08:00:00.000Z',
    updatedAt: '2025-02-20T14:30:00.000Z'
  },
  {
    outageId: 'OUT-CITI-2025-0412',
    title: 'Institutional FX Liquidity Aggregator Network Uplink Upgrade',
    summary: 'Direct optical interconnect expansion between NY4 Equinix and LD4 Slough.',
    description: 'Ultra-low latency dark fiber switch over. Spot FX quotation streams will experience momentary micro-burst latency fluctuations (<15ms).',
    severity: 'LOW',
    status: 'SCHEDULED',
    scheduledStartTime: new Date(Date.now() + 86400000 * 5).toISOString(),
    scheduledEndTime: new Date(Date.now() + 86400000 * 5 + 5400000).toISOString(),
    isoDuration: 'PT1H30M',
    parsedDuration: parseIsoDuration('PT1H30M'),
    affectedServices: [
      {
        serviceId: 'SRV-CITI-FX-44',
        serviceName: 'Institutional FX ECN Streaming Feed',
        apiFamily: 'FX_RATES',
        endpointPattern: '/v2/fx/streaming/institution/quotes',
        degradationType: 'LATENCY_SPIKE',
        expectedLatencyMultiplier: 3.0
      }
    ],
    datacenterRegions: ['US-EAST-NY4', 'EU-WEST-LD4'],
    cdrSpecificationRef: 'CDR-DISCOVERY-MAINTENANCE-V1.4',
    psd2RegulatoryArticle: 'RTS Article 33 Fallback & Contingency Mechanism',
    mitigationStrategy: 'Cross-connect routing redirected to backup Chicago CME Aurora POP.',
    fallbackActive: false,
    createdAt: '2025-02-18T10:15:00.000Z',
    updatedAt: '2025-02-18T10:15:00.000Z'
  },
  {
    outageId: 'OUT-CITI-2025-0105',
    title: 'Target2 / CHAPS Real-Time Settlement Engine Firmware Patching',
    summary: 'Eurosystem & Bank of England mandatory protocol synchronization.',
    description: 'Routine maintenance window for high-value wholesale clearing rails. Payments queued during window will settle immediately upon gate reopening.',
    severity: 'HIGH',
    status: 'SCHEDULED',
    scheduledStartTime: new Date(Date.now() + 86400000 * 12).toISOString(),
    scheduledEndTime: new Date(Date.now() + 86400000 * 12 + 14400000).toISOString(),
    isoDuration: 'PT4H0M',
    parsedDuration: parseIsoDuration('PT4H0M'),
    affectedServices: [
      {
        serviceId: 'SRV-CITI-PAY-78',
        serviceName: 'Instant Wholesale Settlement Bus',
        apiFamily: 'PAYMENTS_INSTANT',
        endpointPattern: '/v3/payments/high-value/execute',
        degradationType: 'FULL_OUTAGE'
      }
    ],
    datacenterRegions: ['EU-CENTRAL-FRANKFURT-1', 'EU-WEST-LONDON-2'],
    cdrSpecificationRef: 'CDR-DISCOVERY-MAINTENANCE-V1.4',
    psd2RegulatoryArticle: 'PSD2 RTS Chapter 5 Availability and Contingency Measures',
    mitigationStrategy: 'Inbound credit transfers queued in asynchronous Redis Enterprise buffer clusters with zero message loss guarantee.',
    fallbackActive: true,
    createdAt: '2025-02-10T12:00:00.000Z',
    updatedAt: '2025-02-19T09:45:00.000Z'
  }
];

export class CitiOutageService {
  private static instance: CitiOutageService;
  private mode: ServiceOperationalMode = 'LIVE_WITH_FALLBACK';
  private baseUrl: string = 'https://api.citibank.com/foundations/v1/discovery/outages';
  private listeners: Set<(outage: CitiOutageRecord) => void> = new Set();
  private telemetryClientId: string = 'CITI-AI-ULTRA-WEALTH-001';

  private constructor() {}

  public static getInstance(): CitiOutageService {
    if (!CitiOutageService.instance) {
      CitiOutageService.instance = new CitiOutageService();
    }
    return CitiOutageService.instance;
  }

  public setMode(mode: ServiceOperationalMode): void {
    this.mode = mode;
  }

  public setTelemetryClientId(clientId: string): void {
    this.telemetryClientId = clientId;
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Retrieves scheduled outage records with PSD2/CDR filtering & ISO duration parsing
   */
  public async getScheduledOutages(options: OutageQueryOptions = {}): Promise<CitiOutageDiscoveryResponse> {
    const telemetry = generateCitiTelemetryHeaders(this.telemetryClientId);

    if (this.mode === 'MOCK') {
      return this.generateMockResponse(options, telemetry);
    }

    try {
      const queryParams = new URLSearchParams();
      if (options.status) queryParams.append('status', options.status);
      if (options.severity) queryParams.append('severity', options.severity);
      if (options.serviceFamily) queryParams.append('apiFamily', options.serviceFamily);
      if (options.fromDate) queryParams.append('from', options.fromDate);
      if (options.toDate) queryParams.append('to', options.toDate);
      if (options.limit) queryParams.append('limit', options.limit.toString());
      if (options.offset) queryParams.append('offset', options.offset.toString());

      const targetUrl = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...telemetry
        }
      });

      if (!response.ok) {
        throw new Error(`Citi API Outage Discovery Gateway error: HTTP ${response.status} - ${response.statusText}`);
      }

      const rawJson = await response.json();
      
      // Parse ISO durations on the fly for raw live records
      const liveRecords: CitiOutageRecord[] = (rawJson.data?.outages || []).map((outage: any) => ({
        ...outage,
        parsedDuration: parseIsoDuration(outage.isoDuration || outage.duration || 'PT1H')
      }));

      return {
        data: {
          outages: liveRecords,
          pagination: rawJson.data?.pagination || {
            totalRecords: liveRecords.length,
            totalPages: 1,
            currentPage: 1,
            limit: options.limit || 20
          },
          healthMatrix: rawJson.data?.healthMatrix || {
            coreTreasuryHealthy: true,
            instantRailsDegraded: false,
            fxStreamAvailable: true,
            overallSlaScore: 99.999
          }
        },
        links: rawJson.links || { self: targetUrl },
        meta: {
          totalRecords: liveRecords.length,
          cdrComplianceTier: 'CDR-TIER-0-INSTITUTIONAL',
          psd2TppId: this.telemetryClientId,
          responseGeneratedAt: new Date().toISOString(),
          telemetryId: telemetry['x-citi-correlation-id']
        }
      };
    } catch (error) {
      if (this.mode === 'LIVE_WITH_FALLBACK') {
        console.warn(`[CitiOutageService] Live endpoint unreachable. Gracefully falling back to cached mock telemetry. Reason:`, error);
        return this.generateMockResponse(options, telemetry);
      }
      throw error;
    }
  }

  /**
   * Retrieves outages currently active / in-progress
   */
  public async getActiveOutages(): Promise<CitiOutageRecord[]> {
    const response = await this.getScheduledOutages({ status: 'IN_PROGRESS' });
    const now = Date.now();
    
    // Also include outages whose time window overlaps right now
    const all = await this.getScheduledOutages();
    return all.data.outages.filter(o => {
      const start = new Date(o.scheduledStartTime).getTime();
      const end = new Date(o.scheduledEndTime).getTime();
      return o.status === 'IN_PROGRESS' || (now >= start && now <= end);
    });
  }

  /**
   * Fetches specific outage by its Citi Tracking ID
   */
  public async getOutageById(outageId: string): Promise<CitiOutageRecord | null> {
    const response = await this.getScheduledOutages();
    const match = response.data.outages.find(o => o.outageId === outageId);
    return match || null;
  }

  /**
   * Checks if an API service or endpoint is currently degraded or has an upcoming maintenance window
   */
  public async isServiceCurrentlyDegraded(serviceKey: string): Promise<{
    degraded: boolean;
    activeOutage?: CitiOutageRecord;
    upcomingOutage?: CitiOutageRecord;
  }> {
    const all = (await this.getScheduledOutages()).data.outages;
    const now = Date.now();

    const related = all.filter(o =>
      o.affectedServices.some(s =>
        s.serviceId.toLowerCase().includes(serviceKey.toLowerCase()) ||
        s.serviceName.toLowerCase().includes(serviceKey.toLowerCase()) ||
        s.endpointPattern.toLowerCase().includes(serviceKey.toLowerCase()) ||
        s.apiFamily.toLowerCase().includes(serviceKey.toLowerCase())
      )
    );

    const activeOutage = related.find(o => {
      const start = new Date(o.scheduledStartTime).getTime();
      const end = new Date(o.scheduledEndTime).getTime();
      return o.status === 'IN_PROGRESS' || (now >= start && now <= end);
    });

    const upcomingOutage = related.find(o => {
      const start = new Date(o.scheduledStartTime).getTime();
      return start > now && o.status === 'SCHEDULED';
    });

    return {
      degraded: !!activeOutage,
      activeOutage,
      upcomingOutage
    };
  }

  /**
   * Subscribe to real-time outage dispatch updates
   */
  public subscribeToOutageEvents(callback: (outage: CitiOutageRecord) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Simulates broadcasting a new telemetry outage event
   */
  public broadcastSimulatedEvent(record: CitiOutageRecord): void {
    this.listeners.forEach(fn => fn(record));
  }

  private generateMockResponse(options: OutageQueryOptions, telemetry: TelemetryHeaders): CitiOutageDiscoveryResponse {
    let filtered = [...MOCK_OUTAGES];

    if (options.status) {
      filtered = filtered.filter(o => o.status === options.status);
    }
    if (options.severity) {
      filtered = filtered.filter(o => o.severity === options.severity);
    }
    if (options.serviceFamily) {
      filtered = filtered.filter(o => o.affectedServices.some(s => s.apiFamily === options.serviceFamily));
    }
    if (options.fromDate) {
      const fromTime = new Date(options.fromDate).getTime();
      filtered = filtered.filter(o => new Date(o.scheduledStartTime).getTime() >= fromTime);
    }
    if (options.toDate) {
      const toTime = new Date(options.toDate).getTime();
      filtered = filtered.filter(o => new Date(o.scheduledEndTime).getTime() <= toTime);
    }

    const limit = options.limit || 10;
    const offset = options.offset || 0;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      data: {
        outages: paginated,
        pagination: {
          totalRecords: filtered.length,
          totalPages: Math.ceil(filtered.length / limit) || 1,
          currentPage: Math.floor(offset / limit) + 1,
          limit
        },
        healthMatrix: {
          coreTreasuryHealthy: true,
          instantRailsDegraded: false,
          fxStreamAvailable: true,
          overallSlaScore: 99.9994
        }
      },
      links: {
        self: `/foundations/v1/discovery/outages?offset=${offset}&limit=${limit}`
      },
      meta: {
        totalRecords: filtered.length,
        cdrComplianceTier: 'CDR-DISCOVERY-TIER-0-FULL-COMPLIANCE',
        psd2TppId: this.telemetryClientId,
        responseGeneratedAt: new Date().toISOString(),
        telemetryId: telemetry['x-citi-correlation-id']
      }
    };
  }
}

export const citiOutageService = CitiOutageService.getInstance();
export default citiOutageService;