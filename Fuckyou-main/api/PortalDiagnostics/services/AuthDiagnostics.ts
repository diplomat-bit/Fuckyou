import { EventEmitter } from 'events';
import { Request, Response, Router } from 'express';

export interface AuthDiagnosticConfig {
  jwtSecret?: string;
  expectedIssuer?: string;
  expectedAudience?: string;
  tokenMaxAgeSeconds?: number;
  idpCheckTimeoutMs?: number;
}

export interface ClaimVerificationResult {
  claim: string;
  expected: any;
  actual: any;
  valid: boolean;
  message?: string;
}

export interface TokenVerificationReport {
  valid: boolean;
  algorithm?: string;
  keyId?: string;
  issuedAt?: Date;
  expiresAt?: Date;
  timeToLiveSeconds?: number;
  subject?: string;
  issuer?: string;
  audience?: string | string[];
  claimResults: ClaimVerificationResult[];
  errors: string[];
  warnings: string[];
}

export interface PermissionCheckReport {
  principalId: string;
  rolesEvaluated: string[];
  grantedPermissions: string[];
  deniedPermissions: string[];
  missingPermissions: string[];
  authorized: boolean;
  evaluationTimeMs: number;
}

export interface IdentityProviderStatus {
  providerId: string;
  endpoint: string;
  reachable: boolean;
  latencyMs: number;
  statusCode?: number;
  openidConfigurationValid: boolean;
  supportedGrantTypes?: string[];
  supportedSigningAlgs?: string[];
  lastChecked: Date;
  error?: string;
}

export interface SessionDiagnosticResult {
  sessionId: string;
  active: boolean;
  createdAt: Date;
  lastAccessAt: Date;
  idleDurationSeconds: number;
  isExpired: boolean;
  boundIpAddress?: string;
  userAgentMatch: boolean;
  mfaVerified: boolean;
}

export interface DiagnosticSummary {
  timestamp: Date;
  environment: string;
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  tokenReport?: TokenVerificationReport;
  permissionReport?: PermissionCheckReport;
  idpStatuses: IdentityProviderStatus[];
  sessionReport?: SessionDiagnosticResult;
  systemMetrics: {
    totalEvaluations: number;
    failedVerifications: number;
    avgLatencyMs: number;
  };
  remediationSteps: string[];
}

export interface AuthDiagnosticParams {
  token?: string;
  principalId?: string;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  sessionId?: string;
  clientIp?: string;
  clientUserAgent?: string;
  idpEndpoints?: Array<{ providerId: string; url: string }>;
}

export class AuthDiagnosticsService extends EventEmitter {
  private config: AuthDiagnosticConfig;
  private metrics = {
    totalEvaluations: 0,
    failedVerifications: 0,
    totalLatencyMs: 0,
  };

  constructor(config: AuthDiagnosticConfig = {}) {
    super();
    this.config = {
      expectedIssuer: 'https://auth.oko.sovereign.internal',
      expectedAudience: 'oko-portal-api',
      tokenMaxAgeSeconds: 86400,
      idpCheckTimeoutMs: 5000,
      ...config,
    };
  }

  /**
   * Decodes a JWT payload without full cryptographic verification (for client-side/pre-flight inspection).
   */
  public decodeTokenPayload(token: string): { header: any; payload: any } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf-8'));
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
      return { header, payload };
    } catch {
      return null;
    }
  }

  /**
   * Diagnoses and verifies a JWT token structure, metadata, expiration, and configured claims.
   */
  public verifyTokenDiagnostics(token: string, additionalRequiredClaims: Record<string, any> = {}): TokenVerificationReport {
    const startTime = Date.now();
    this.metrics.totalEvaluations++;

    const errors: string[] = [];
    const warnings: string[] = [];
    const claimResults: ClaimVerificationResult[] = [];

    const decoded = this.decodeTokenPayload(token);
    if (!decoded) {
      errors.push('Malformed JWT: Token does not consist of three valid base64url encoded parts.');
      this.metrics.failedVerifications++;
      return {
        valid: false,
        claimResults: [],
        errors,
        warnings,
      };
    }

    const { header, payload } = decoded;

    if (!header.alg) {
      errors.push('Missing algorithm header ("alg").');
    } else if (header.alg === 'none') {
      errors.push('Insecure algorithm "none" specified in JWT header.');
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    let issuedAt: Date | undefined;
    let expiresAt: Date | undefined;
    let timeToLiveSeconds: number | undefined;

    if (payload.iat) {
      issuedAt = new Date(payload.iat * 1000);
      if (payload.iat > nowSeconds + 60) {
        warnings.push(`Token issued in the future (iat: ${issuedAt.toISOString()}). Clock skew detected.`);
      }
    } else {
      warnings.push('Claim "iat" (Issued At) is missing.');
    }

    if (payload.exp) {
      expiresAt = new Date(payload.exp * 1000);
      timeToLiveSeconds = payload.exp - nowSeconds;
      if (nowSeconds >= payload.exp) {
        errors.push(`Token has expired at ${expiresAt.toISOString()} (TTL: ${timeToLiveSeconds}s).`);
      } else if (timeToLiveSeconds < 300) {
        warnings.push(`Token is near expiration (TTL remaining: ${timeToLiveSeconds} seconds).`);
      }
    } else {
      errors.push('Claim "exp" (Expiration Time) is missing.');
    }

    if (this.config.expectedIssuer) {
      const match = payload.iss === this.config.expectedIssuer;
      claimResults.push({
        claim: 'iss',
        expected: this.config.expectedIssuer,
        actual: payload.iss,
        valid: match,
        message: match ? undefined : `Issuer mismatch. Expected "${this.config.expectedIssuer}", got "${payload.iss}".`,
      });
      if (!match) errors.push('Issuer validation failed.');
    }

    if (this.config.expectedAudience) {
      const audList = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
      const match = audList.includes(this.config.expectedAudience);
      claimResults.push({
        claim: 'aud',
        expected: this.config.expectedAudience,
        actual: payload.aud,
        valid: match,
        message: match ? undefined : `Audience mismatch. Expected "${this.config.expectedAudience}".`,
      });
      if (!match) errors.push('Audience validation failed.');
    }

    for (const [key, value] of Object.entries(additionalRequiredClaims)) {
      const actual = payload[key];
      const valid = JSON.stringify(actual) === JSON.stringify(value);
      claimResults.push({
        claim: key,
        expected: value,
        actual,
        valid,
        message: valid ? undefined : `Claim "${key}" value mismatch.`,
      });
      if (!valid) errors.push(`Required claim "${key}" failed validation.`);
    }

    const isValid = errors.length === 0;
    if (!isValid) this.metrics.failedVerifications++;

    this.metrics.totalLatencyMs += Date.now() - startTime;

    return {
      valid: isValid,
      algorithm: header.alg,
      keyId: header.kid,
      issuedAt,
      expiresAt,
      timeToLiveSeconds,
      subject: payload.sub,
      issuer: payload.iss,
      audience: payload.aud,
      claimResults,
      errors,
      warnings,
    };
  }

  /**
   * Evaluates Role-Based and Permission-Based Access Control matrix logic.
   */
  public evaluatePermissions(
    principalId: string,
    assignedRoles: string[],
    rolePermissionMapping: Record<string, string[]>,
    requiredPermissions: string[]
  ): PermissionCheckReport {
    const startTime = Date.now();
    const grantedSet = new Set<string>();

    for (const role of assignedRoles) {
      const perms = rolePermissionMapping[role] || [];
      for (const p of perms) {
        if (p === '*' || p === '*:*') {
          grantedSet.add('*');
        } else {
          grantedSet.add(p);
        }
      }
    }

    const grantedPermissions = Array.from(grantedSet);
    const missingPermissions: string[] = [];
    const deniedPermissions: string[] = [];

    const isWildcardGranted = grantedSet.has('*');

    for (const req of requiredPermissions) {
      if (isWildcardGranted) {
        continue;
      }

      const hasExact = grantedSet.has(req);
      const [domain] = req.split(':');
      const hasDomainWildcard = grantedSet.has(`${domain}:*`);

      if (!hasExact && !hasDomainWildcard) {
        missingPermissions.push(req);
      }
    }

    const authorized = missingPermissions.length === 0;
    const evaluationTimeMs = Date.now() - startTime;

    return {
      principalId,
      rolesEvaluated: assignedRoles,
      grantedPermissions,
      deniedPermissions,
      missingPermissions,
      authorized,
      evaluationTimeMs,
    };
  }

  /**
   * Probes Identity Provider (IdP) OIDC discovery endpoints and measures health and response latency.
   */
  public async probeIdentityProvider(providerId: string, baseUrl: string): Promise<IdentityProviderStatus> {
    const startTime = Date.now();
    const discoveryUrl = `${baseUrl.replace(/\/$/, '')}/.well-known/openid-configuration`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.idpCheckTimeoutMs);

      const response = await fetch(discoveryUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        return {
          providerId,
          endpoint: discoveryUrl,
          reachable: true,
          latencyMs,
          statusCode: response.status,
          openidConfigurationValid: false,
          lastChecked: new Date(),
          error: `HTTP error ${response.status}: ${response.statusText}`,
        };
      }

      const body = await response.json();
      const validConfig = Boolean(body.issuer && body.authorization_endpoint && body.token_endpoint && body.jwks_uri);

      return {
        providerId,
        endpoint: discoveryUrl,
        reachable: true,
        latencyMs,
        statusCode: response.status,
        openidConfigurationValid: validConfig,
        supportedGrantTypes: body.grant_types_supported || [],
        supportedSigningAlgs: body.id_token_signing_alg_values_supported || [],
        lastChecked: new Date(),
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      return {
        providerId,
        endpoint: discoveryUrl,
        reachable: false,
        latencyMs,
        openidConfigurationValid: false,
        lastChecked: new Date(),
        error: err.name === 'AbortError' ? 'IdP request timed out' : err.message,
      };
    }
  }

  /**
   * Diagnoses session integrity including client binding and idle timeout state.
   */
  public diagnoseSession(
    sessionId: string,
    sessionData: {
      createdAt: Date;
      lastAccessAt: Date;
      boundIp?: string;
      userAgentHash?: string;
      mfaVerified?: boolean;
    },
    context: {
      requestIp?: string;
      requestUserAgentHash?: string;
      maxIdleSeconds?: number;
    } = {}
  ): SessionDiagnosticResult {
    const now = new Date();
    const idleDurationSeconds = Math.floor((now.getTime() - sessionData.lastAccessAt.getTime()) / 1000);
    const maxIdle = context.maxIdleSeconds || 3600;
    const isExpired = idleDurationSeconds > maxIdle;

    let userAgentMatch = true;
    if (sessionData.userAgentHash && context.requestUserAgentHash) {
      userAgentMatch = sessionData.userAgentHash === context.requestUserAgentHash;
    }

    return {
      sessionId,
      active: !isExpired && userAgentMatch,
      createdAt: sessionData.createdAt,
      lastAccessAt: sessionData.lastAccessAt,
      idleDurationSeconds,
      isExpired,
      boundIpAddress: sessionData.boundIp,
      userAgentMatch,
      mfaVerified: Boolean(sessionData.mfaVerified),
    };
  }

  /**
   * Runs a complete diagnostic suite covering tokens, permissions, session, and external identity endpoints.
   */
  public async runFullDiagnostics(params: AuthDiagnosticParams): Promise<DiagnosticSummary> {
    const remediationSteps: string[] = [];
    let tokenReport: TokenVerificationReport | undefined;
    let permissionReport: PermissionCheckReport | undefined;
    let sessionReport: SessionDiagnosticResult | undefined;
    const idpStatuses: IdentityProviderStatus[] = [];

    if (params.token) {
      tokenReport = this.verifyTokenDiagnostics(params.token);
      if (!tokenReport.valid) {
        remediationSteps.push('Re-authenticate to receive a newly signed JWT token.');
      }
      if (tokenReport.warnings.some((w) => w.includes('near expiration'))) {
        remediationSteps.push('Execute token refresh flow before current token expires.');
      }
    }

    if (params.principalId && params.requiredPermissions) {
      permissionReport = this.evaluatePermissions(
        params.principalId,
        params.requiredRoles || [],
        {},
        params.requiredPermissions
      );
      if (!permissionReport.authorized) {
        remediationSteps.push(
          `Request elevated RBAC entitlements. Missing permissions: ${permissionReport.missingPermissions.join(', ')}`
        );
      }
    }

    if (params.idpEndpoints && params.idpEndpoints.length > 0) {
      for (const idp of params.idpEndpoints) {
        const status = await this.probeIdentityProvider(idp.providerId, idp.url);
        idpStatuses.push(status);
        if (!status.reachable || !status.openidConfigurationValid) {
          remediationSteps.push(`Check network routing and OIDC configuration for Identity Provider "${idp.providerId}".`);
        }
      }
    }

    let overallStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';

    const hasTokenErrors = tokenReport && !tokenReport.valid;
    const hasPermissionErrors = permissionReport && !permissionReport.authorized;
    const hasUnreachableIdp = idpStatuses.some((s) => !s.reachable);

    if (hasTokenErrors || hasUnreachableIdp) {
      overallStatus = 'CRITICAL';
    } else if (hasPermissionErrors || (tokenReport && tokenReport.warnings.length > 0)) {
      overallStatus = 'DEGRADED';
    }

    const avgLatency =
      this.metrics.totalEvaluations > 0
        ? Math.round(this.metrics.totalLatencyMs / this.metrics.totalEvaluations)
        : 0;

    return {
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'development',
      overallStatus,
      tokenReport,
      permissionReport,
      idpStatuses,
      sessionReport,
      systemMetrics: {
        totalEvaluations: this.metrics.totalEvaluations,
        failedVerifications: this.metrics.failedVerifications,
        avgLatencyMs: avgLatency,
      },
      remediationSteps,
    };
  }

  /**
   * Retrieves current diagnostic metrics.
   */
  public getMetrics() {
    const avgLatency =
      this.metrics.totalEvaluations > 0
        ? Math.round(this.metrics.totalLatencyMs / this.metrics.totalEvaluations)
        : 0;
    return {
      ...this.metrics,
      avgLatencyMs: avgLatency,
    };
  }

  /**
   * Generates an Express Router pre-configured with all diagnostic API endpoints.
   */
  public getRouter(): Router {
    return createAuthDiagnosticsRouter(this);
  }
}

/**
 * Factory function to create an Express Router for the AuthDiagnosticsService.
 */
export function createAuthDiagnosticsRouter(service: AuthDiagnosticsService): Router {
  const router = Router();

  router.post('/verify-token', (req: Request, res: Response) => {
    try {
      const { token, additionalRequiredClaims } = req.body;
      if (!token) {
        return res.status(400).json({ error: 'Missing "token" in request body.' });
      }
      const report = service.verifyTokenDiagnostics(token, additionalRequiredClaims || {});
      return res.json(report);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  router.post('/evaluate-permissions', (req: Request, res: Response) => {
    try {
      const { principalId, assignedRoles, rolePermissionMapping, requiredPermissions } = req.body;
      if (!principalId) {
        return res.status(400).json({ error: 'Missing "principalId" in request body.' });
      }
      const report = service.evaluatePermissions(
        principalId,
        assignedRoles || [],
        rolePermissionMapping || {},
        requiredPermissions || []
      );
      return res.json(report);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  router.post('/probe-idp', async (req: Request, res: Response) => {
    try {
      const { providerId, url } = req.body;
      if (!providerId || !url) {
        return res.status(400).json({ error: 'Missing "providerId" or "url" in request body.' });
      }
      const status = await service.probeIdentityProvider(providerId, url);
      return res.json(status);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  router.post('/diagnose-session', (req: Request, res: Response) => {
    try {
      const { sessionId, sessionData, context } = req.body;
      if (!sessionId || !sessionData) {
        return res.status(400).json({ error: 'Missing "sessionId" or "sessionData" in request body.' });
      }
      const parsedSessionData = {
        ...sessionData,
        createdAt: new Date(sessionData.createdAt),
        lastAccessAt: new Date(sessionData.lastAccessAt),
      };
      const report = service.diagnoseSession(sessionId, parsedSessionData, context || {});
      return res.json(report);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  router.post('/full', async (req: Request, res: Response) => {
    try {
      const params: AuthDiagnosticParams = req.body;
      const summary = await service.runFullDiagnostics(params);
      return res.json(summary);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  router.get('/metrics', (req: Request, res: Response) => {
    try {
      const metrics = service.getMetrics();
      return res.json(metrics);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
}

export default AuthDiagnosticsService;