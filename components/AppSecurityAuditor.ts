

// --- CONSOLIDATED FROM: ./api/AppRegistry/utils/AppSecurityAuditor.ts ---

export type SecuritySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type SecurityCategory = 
  | 'CORS' 
  | 'PAYLOAD_VALIDATION' 
  | 'SECRET_INJECTION' 
  | 'HEADER_SECURITY' 
  | 'RATE_LIMITING';

export interface SecurityFinding {
  id: string;
  ruleId: string;
  title: string;
  description: string;
  category: SecurityCategory;
  severity: SecuritySeverity;
  remediation: string;
  metadata?: Record<string, unknown>;
}

export interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  allowCredentials?: boolean;
  maxAge?: number;
}

export interface RequestPayload {
  body?: unknown;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface AuditTarget {
  appId: string;
  endpoint?: string;
  corsConfig?: CorsConfig;
  payload?: RequestPayload;
  headers?: Record<string, string>;
  environmentVars?: Record<string, string>;
}

export interface AuditReport {
  appId: string;
  timestamp: string;
  passed: boolean;
  overallRiskScore: number; // 0 to 100 (0 = safe, 100 = critical risk)
  summary: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    infoCount: number;
  };
  findings: SecurityFinding[];
}

import { Router, Request, Response } from 'express';

export class AppSecurityAuditor {
  private static instance: AppSecurityAuditor;
  public static getInstance(): AppSecurityAuditor {
    if (!AppSecurityAuditor.instance) {
      AppSecurityAuditor.instance = new AppSecurityAuditor();
    }
    return AppSecurityAuditor.instance;
  }

  private static readonly SECRET_PATTERNS: Array<{ name: string; pattern: RegExp; severity: SecuritySeverity }> = [
    { name: 'AWS Access Key ID', pattern: /\b(AKIA|ASIA)[0-9A-Z]{16}\b/, severity: 'CRITICAL' },
    { name: 'AWS Secret Access Key', pattern: /\b[A-Za-z0-9/+=]{40}\b/, severity: 'HIGH' },
    { name: 'GitHub Personal Access Token', pattern: /\bghp_[a-zA-Z0-9]{36}\b/, severity: 'CRITICAL' },
    { name: 'Generic Private Key', pattern: /-----BEGIN\s+(RSA|EC|DSA|OPENSSH|PRIVATE)\s+KEY-----/, severity: 'CRITICAL' },
    { name: 'JSON Web Token (JWT)', pattern: /\beyJ[a-zA-Z0-9_-]+\.ey[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/, severity: 'HIGH' },
    { name: 'Stripe API Key', pattern: /\b(sk_live|pk_live|rk_live)_[0-9a-zA-Z]{24,99}\b/, severity: 'CRITICAL' },
    { name: 'Slack Bot Token', pattern: /\bxoxb-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24}\b/, severity: 'CRITICAL' },
    { name: 'Generic Password Parameter', pattern: /(?:password|passwd|secret|api_key|access_token|bearer)\s*[:=]\s*["']([^"'\s]{8,})["']/i, severity: 'HIGH' }
  ];

  private static readonly INJECTION_PATTERNS: Array<{ name: string; pattern: RegExp; severity: SecuritySeverity }> = [
    { name: 'SQL Injection Attack', pattern: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|UNION|EXEC|TRUNCATE)\b)|(['";]--|\/\*|\*\/)/i, severity: 'CRITICAL' },
    { name: 'NoSQL Injection Attack', pattern: /(\$gt|\$lt|\$ne|\$regex|\$where|\$or|\$and)\s*:/i, severity: 'HIGH' },
    { name: 'Cross-Site Scripting (XSS)', pattern: /(<script\b[^>]*>|javascript:|onerror\s*=|onload\s*=|eval\(|document\.cookie)/i, severity: 'HIGH' },
    { name: 'Command Injection', pattern: /(;|\&\&|\|\||\`|\$\().*(wget|curl|nc|bash|sh|cmd|exec|system)/i, severity: 'CRITICAL' },
    { name: 'Directory Traversal', pattern: /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\/)/i, severity: 'HIGH' }
  ];

  private static readonly CUSTOM_SECRET_PATTERNS: Array<{ name: string; pattern: RegExp; severity: SecuritySeverity }> = [];
  private static readonly CUSTOM_INJECTION_PATTERNS: Array<{ name: string; pattern: RegExp; severity: SecuritySeverity }> = [];

  /**
   * Registers a custom secret pattern dynamically.
   */
  public static registerSecretPattern(name: string, patternStr: string, severity: SecuritySeverity): void {
    this.CUSTOM_SECRET_PATTERNS.push({
      name,
      pattern: new RegExp(patternStr, 'i'),
      severity
    });
  }

  /**
   * Registers a custom injection pattern dynamically.
   */
  public static registerInjectionPattern(name: string, patternStr: string, severity: SecuritySeverity): void {
    this.CUSTOM_INJECTION_PATTERNS.push({
      name,
      pattern: new RegExp(patternStr, 'i'),
      severity
    });
  }

  /**
   * Retrieves all active rules (default and custom).
   */
  public static getRules() {
    return {
      defaultSecrets: this.SECRET_PATTERNS.map(p => ({ name: p.name, pattern: p.pattern.source, severity: p.severity })),
      customSecrets: this.CUSTOM_SECRET_PATTERNS.map(p => ({ name: p.name, pattern: p.pattern.source, severity: p.severity })),
      defaultInjections: this.INJECTION_PATTERNS.map(p => ({ name: p.name, pattern: p.pattern.source, severity: p.severity })),
      customInjections: this.CUSTOM_INJECTION_PATTERNS.map(p => ({ name: p.name, pattern: p.pattern.source, severity: p.severity }))
    };
  }

  /**
   * Executes a complete security audit against the targeted application configuration and payload context.
   */
  public runFullAudit(target: AuditTarget): AuditReport {
    const findings: SecurityFinding[] = [];

    if (target.corsConfig) {
      findings.push(...this.auditCors(target.corsConfig));
    }

    if (target.payload) {
      findings.push(...this.auditPayload(target.payload));
    }

    if (target.headers) {
      findings.push(...this.auditHeaders(target.headers));
    }

    if (target.environmentVars) {
      findings.push(...this.auditSecrets(target.environmentVars, 'ENVIRONMENT'));
    }

    const summary = {
      criticalCount: findings.filter(f => f.severity === 'CRITICAL').length,
      highCount: findings.filter(f => f.severity === 'HIGH').length,
      mediumCount: findings.filter(f => f.severity === 'MEDIUM').length,
      lowCount: findings.filter(f => f.severity === 'LOW').length,
      infoCount: findings.filter(f => f.severity === 'INFO').length,
    };

    const overallRiskScore = this.calculateRiskScore(summary);
    const passed = summary.criticalCount === 0 && summary.highCount === 0;

    return {
      appId: target.appId,
      timestamp: new Date().toISOString(),
      passed,
      overallRiskScore,
      summary,
      findings
    };
  }

  /**
   * Evaluates CORS configuration for wildcard vulnerabilities, insecure credential handling, and weak origins.
   */
  public auditCors(cors: CorsConfig): SecurityFinding[] {
    const findings: SecurityFinding[] = [];

    if (cors.allowedOrigins.includes('*')) {
      if (cors.allowCredentials) {
        findings.push({
          id: `CORS-${Date.now()}-1`,
          ruleId: 'CORS_WILDCARD_WITH_CREDENTIALS',
          title: 'Wildcard Origin with Credentials Enabled',
          description: 'CORS policy enables Access-Control-Allow-Origin: * while Access-Control-Allow-Credentials is set to true. Modern browsers reject this, or it exposes authenticated data.',
          category: 'CORS',
          severity: 'CRITICAL',
          remediation: 'Specify exact trusted domains in allowedOrigins rather than using wildcard "*" when credentials are true.'
        });
      } else {
        findings.push({
          id: `CORS-${Date.now()}-2`,
          ruleId: 'CORS_WILDCARD_ORIGIN',
          title: 'Unrestricted Cross-Origin Resource Sharing',
          description: 'CORS origin is set to "*", allowing any site to perform requests against this endpoint.',
          category: 'CORS',
          severity: 'MEDIUM',
          remediation: 'Restrict origins to specific domains or trusted subdomains if API serves sensitive endpoints.'
        });
      }
    }

    for (const origin of cors.allowedOrigins) {
      if (origin.startsWith('http://') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        findings.push({
          id: `CORS-${Date.now()}-3`,
          ruleId: 'CORS_INSECURE_HTTP',
          title: 'Insecure HTTP Origin Allowed',
          description: `Allowed origin "${origin}" uses unencrypted HTTP protocol, leaving requests vulnerable to Man-In-The-Middle (MITM) attacks.`,
          category: 'CORS',
          severity: 'HIGH',
          remediation: 'Enforce HTTPS for all allowed CORS origins in non-development environments.'
        });
      }
    }

    if (cors.allowedMethods && cors.allowedMethods.includes('*')) {
      findings.push({
        id: `CORS-${Date.now()}-4`,
        ruleId: 'CORS_WILDCARD_METHODS',
        title: 'Wildcard HTTP Methods Permitted',
        description: 'Allowing all HTTP methods ("*") broadens the attack surface for unexpected request types.',
        category: 'CORS',
        severity: 'LOW',
        remediation: 'Explicitly state required methods (e.g., GET, POST, PUT, DELETE).'
      });
    }

    return findings;
  }

  /**
   * Audits request payloads for malicious injection vectors and accidental secret exposure.
   */
  public auditPayload(payload: RequestPayload): SecurityFinding[] {
    const findings: SecurityFinding[] = [];
    const stringified = JSON.stringify(payload);

    if (!stringified) return findings;

    // Secret Leakage Check inside payload
    findings.push(...this.auditSecrets(payload, 'PAYLOAD'));

    const allInjectionPatterns = [...AppSecurityAuditor.INJECTION_PATTERNS, ...AppSecurityAuditor.CUSTOM_INJECTION_PATTERNS];

    // Code/Data Injection Detection
    for (const pattern of allInjectionPatterns) {
      if (pattern.pattern.test(stringified)) {
        findings.push({
          id: `PAYLOAD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          ruleId: `INJECTION_DETECTED_${pattern.name.toUpperCase().replace(/\s+/g, '_')}`,
          title: `Potential ${pattern.name} Detected`,
          description: `Payload payload matched structural pattern associated with ${pattern.name}.`,
          category: 'PAYLOAD_VALIDATION',
          severity: pattern.severity,
          remediation: 'Sanitize input, use parameterized database queries, and encode HTML/JavaScript responses.',
          metadata: { sampleMatch: stringified.substring(0, 150) }
        });
      }
    }

    return findings;
  }

  /**
   * Verifies headers for proper security configuration (e.g. CSP, HSTS, X-Frame-Options, Authorization).
   */
  public auditHeaders(headers: Record<string, string>): SecurityFinding[] {
    const findings: SecurityFinding[] = [];
    const lowerHeaders = Object.keys(headers).reduce<Record<string, string>>((acc, key) => {
      acc[key.toLowerCase()] = headers[key];
      return acc;
    }, {});

    if (!lowerHeaders['content-security-policy']) {
      findings.push({
        id: `HDR-${Date.now()}-1`,
        ruleId: 'HEADER_MISSING_CSP',
        title: 'Missing Content-Security-Policy Header',
        description: 'Content-Security-Policy header is absent, increasing exposure to XSS and data injection.',
        category: 'HEADER_SECURITY',
        severity: 'MEDIUM',
        remediation: 'Implement a strict Content-Security-Policy (CSP) header.'
      });
    }

    if (!lowerHeaders['strict-transport-security']) {
      findings.push({
        id: `HDR-${Date.now()}-2`,
        ruleId: 'HEADER_MISSING_HSTS',
        title: 'Missing HTTP Strict Transport Security (HSTS)',
        description: 'HSTS header is missing, allowing potential protocol downgrade attacks to unencrypted HTTP.',
        category: 'HEADER_SECURITY',
        severity: 'HIGH',
        remediation: 'Set Strict-Transport-Security header (e.g., max-age=31536000; includeSubDomains).'
      });
    }

    if (!lowerHeaders['x-frame-options'] && !lowerHeaders['content-security-policy']?.includes('frame-ancestors')) {
      findings.push({
        id: `HDR-${Date.now()}-3`,
        ruleId: 'HEADER_MISSING_X_FRAME_OPTIONS',
        title: 'Missing Clickjacking Protection',
        description: 'Neither X-Frame-Options nor CSP frame-ancestors is configured, rendering application frameable.',
        category: 'HEADER_SECURITY',
        severity: 'MEDIUM',
        remediation: 'Add X-Frame-Options: DENY or SAMEORIGIN header.'
      });
    }

    return findings;
  }

  /**
   * Scans arbitrary structures (environment variables or payload objects) for leaked API keys, tokens, or standard credentials.
   */
  public auditSecrets(source: unknown, locationContext: string): SecurityFinding[] {
    const findings: SecurityFinding[] = [];
    const serialized = typeof source === 'string' ? source : JSON.stringify(source);

    if (!serialized) return findings;

    const allSecretPatterns = [...AppSecurityAuditor.SECRET_PATTERNS, ...AppSecurityAuditor.CUSTOM_SECRET_PATTERNS];

    for (const item of allSecretPatterns) {
      if (item.pattern.test(serialized)) {
        findings.push({
          id: `SEC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          ruleId: `SECRET_EXPOSURE_${item.name.toUpperCase().replace(/\s+/g, '_')}`,
          title: `Secret Leakage Detected (${item.name})`,
          description: `A credential matching the signature of ${item.name} was discovered within ${locationContext}.`,
          category: 'SECRET_INJECTION',
          severity: item.severity,
          remediation: 'Revoke and rotate the exposed token immediately. Secure credentials using environment secrets or a managed vault.'
        });
      }
    }

    return findings;
  }

  /**
   * Calculates an integer risk index from 0 to 100 based on findings count and weighted severity.
   */
  private calculateRiskScore(summary: { criticalCount: number; highCount: number; mediumCount: number; lowCount: number; infoCount: number }): number {
    const rawScore = 
      (summary.criticalCount * 40) +
      (summary.highCount * 20) +
      (summary.mediumCount * 10) +
      (summary.lowCount * 3) +
      (summary.infoCount * 1);

    return Math.min(100, rawScore);
  }
}

export const defaultAppSecurityAuditor = new AppSecurityAuditor();

// --- API ROUTES INTEGRATION ---
export const AppSecurityAuditorRouter = Router();
const auditHistory: AuditReport[] = [];

/**
 * POST /api/audit/run
 * Executes a full security audit on the provided target and stores the report in history.
 */
AppSecurityAuditorRouter.post('/run', (req: Request, res: Response) => {
  try {
    const target = req.body as AuditTarget;
    if (!target || !target.appId) {
      return res.status(400).json({ error: 'Missing required field: appId' });
    }

    const auditor = new AppSecurityAuditor();
    const report = auditor.runFullAudit(target);
    
    auditHistory.push(report);

    return res.status(200).json(report);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to execute security audit', details: error.message });
  }
});

/**
 * GET /api/audit/history
 * Retrieves paginated audit history.
 */
AppSecurityAuditorRouter.get('/history', (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    
    const paginatedHistory = auditHistory.slice(offset, offset + limit);
    return res.status(200).json({
      total: auditHistory.length,
      limit,
      offset,
      history: paginatedHistory
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve audit history', details: error.message });
  }
});

/**
 * GET /api/audit/history/:appId
 * Retrieves audit history for a specific application.
 */
AppSecurityAuditorRouter.get('/history/:appId', (req: Request, res: Response) => {
  try {
    const { appId } = req.params;
    const appHistory = auditHistory.filter(report => report.appId === appId);
    return res.status(200).json({
      appId,
      total: appHistory.length,
      history: appHistory
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve app audit history', details: error.message });
  }
});

/**
 * GET /api/audit/stats
 * Retrieves aggregated statistics of all audits performed.
 */
AppSecurityAuditorRouter.get('/stats', (req: Request, res: Response) => {
  try {
    if (auditHistory.length === 0) {
      return res.status(200).json({
        totalAudits: 0,
        passedAudits: 0,
        failedAudits: 0,
        averageRiskScore: 0,
        severityCounts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
      });
    }

    let passedCount = 0;
    let totalRiskScore = 0;
    const severityCounts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };

    for (const report of auditHistory) {
      if (report.passed) passedCount++;
      totalRiskScore += report.overallRiskScore;
      severityCounts.critical += report.summary.criticalCount;
      severityCounts.high += report.summary.highCount;
      severityCounts.medium += report.summary.mediumCount;
      severityCounts.low += report.summary.lowCount;
      severityCounts.info += report.summary.infoCount;
    }

    return res.status(200).json({
      totalAudits: auditHistory.length,
      passedAudits: passedCount,
      failedAudits: auditHistory.length - passedCount,
      averageRiskScore: Math.round((totalRiskScore / auditHistory.length) * 100) / 100,
      severityCounts
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to calculate audit statistics', details: error.message });
  }
});

/**
 * POST /api/audit/rules/secret
 * Registers a new custom secret pattern.
 */
AppSecurityAuditorRouter.post('/rules/secret', (req: Request, res: Response) => {
  try {
    const { name, pattern, severity } = req.body;
    if (!name || !pattern || !severity) {
      return res.status(400).json({ error: 'Missing required fields: name, pattern, severity' });
    }

    AppSecurityAuditor.registerSecretPattern(name, pattern, severity as SecuritySeverity);
    return res.status(201).json({ message: 'Custom secret pattern registered successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to register custom secret pattern', details: error.message });
  }
});

/**
 * POST /api/audit/rules/injection
 * Registers a new custom injection pattern.
 */
AppSecurityAuditorRouter.post('/rules/injection', (req: Request, res: Response) => {
  try {
    const { name, pattern, severity } = req.body;
    if (!name || !pattern || !severity) {
      return res.status(400).json({ error: 'Missing required fields: name, pattern, severity' });
    }

    AppSecurityAuditor.registerInjectionPattern(name, pattern, severity as SecuritySeverity);
    return res.status(201).json({ message: 'Custom injection pattern registered successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to register custom injection pattern', details: error.message });
  }
});

/**
 * GET /api/audit/rules
 * Retrieves all active rules.
 */
AppSecurityAuditorRouter.get('/rules', (req: Request, res: Response) => {
  try {
    const rules = AppSecurityAuditor.getRules();
    return res.status(200).json(rules);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve rules', details: error.message });
  }
});

/**
 * DELETE /api/audit/history
 * Clears the audit history.
 */
AppSecurityAuditorRouter.delete('/history', (req: Request, res: Response) => {
  try {
    auditHistory.length = 0;
    return res.status(200).json({ message: 'Audit history cleared successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to clear audit history', details: error.message });
  }
});

export default AppSecurityAuditor;