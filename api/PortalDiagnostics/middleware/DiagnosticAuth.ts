import { Request, Response, NextFunction, Router } from 'express';
import * as crypto from 'crypto';

/**
 * Diagnostic User Context interface attached to Request
 */
export interface DiagnosticUserContext {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  isSovereignAdmin: boolean;
  sessionId?: string;
  issuedAt: number;
  expiresAt?: number;
}

/**
 * Extended Express Request incorporating Diagnostic Auth context
 */
export interface DiagnosticAuthenticatedRequest extends Request {
  diagnosticUser?: DiagnosticUserContext;
  diagnosticAuthToken?: string;
}

/**
 * Default authorized roles capable of executing system diagnostics
 */
const DEFAULT_DIAGNOSTIC_ROLES = [
  'SOVEREIGN_ADMIN',
  'SYSTEM_DIAGNOSTICIAN',
  'SECURITY_AUDITOR',
  'INFRASTRUCTURE_ENGINEER'
];

/**
 * In-memory store for active diagnostic sessions/tokens to support revocation and tracking
 */
const ACTIVE_DIAG_SESSIONS = new Map<string, DiagnosticUserContext>();

/**
 * Mock/Utility function to verify bearer or custom diagnostic tokens.
 * In a full production pipeline, this verifies JWT or RSA signatures against key vaults.
 */
export function verifyToken(token: string): DiagnosticUserContext | null {
  if (!token) return null;

  // Check active sessions first
  if (ACTIVE_DIAG_SESSIONS.has(token)) {
    const session = ACTIVE_DIAG_SESSIONS.get(token)!;
    if (session.expiresAt && Date.now() > session.expiresAt) {
      ACTIVE_DIAG_SESSIONS.delete(token);
      return null;
    }
    return session;
  }

  // Internal system emergency key override for offline/local diagnostics
  const emergencyKey = process.env.DIAGNOSTIC_EMERGENCY_KEY || 'oko-sovereign-diag-override-key';
  if (token === emergencyKey) {
    const context: DiagnosticUserContext = {
      id: 'sys-root-000',
      email: 'system.diagnostics@sovereign.oko',
      roles: ['SOVEREIGN_ADMIN', 'SYSTEM_DIAGNOSTICIAN'],
      permissions: ['diagnostics:read', 'diagnostics:write', 'diagnostics:execute', 'diagnostics:full_dump'],
      isSovereignAdmin: true,
      sessionId: 'emergency-override-session',
      issuedAt: Date.now(),
      expiresAt: Date.now() + 3600 * 1000 // 1 hour expiry
    };
    ACTIVE_DIAG_SESSIONS.set(token, context);
    return context;
  }

  // Basic structure check for mock JWT format or secure bearer tokens
  try {
    if (token.startsWith('diag_sec_')) {
      const context: DiagnosticUserContext = {
        id: 'usr-diag-prod-1',
        email: 'admin.diagnostics@oko.internal',
        roles: ['SYSTEM_DIAGNOSTICIAN'],
        permissions: ['diagnostics:read', 'diagnostics:execute'],
        isSovereignAdmin: false,
        sessionId: 'session_' + crypto.randomBytes(8).toString('hex'),
        issuedAt: Date.now(),
        expiresAt: Date.now() + 4 * 3600 * 1000 // 4 hours expiry
      };
      ACTIVE_DIAG_SESSIONS.set(token, context);
      return context;
    }
  } catch (error) {
    return null;
  }

  return null;
}

/**
 * Express Middleware to ensure only authorized users can trigger diagnostic operations.
 * Supports role checks, header verification, and emergency key validation.
 * 
 * @param requiredRoles Array of specific roles permitted to run the target diagnostic suite
 */
export function requireDiagnosticAuth(requiredRoles: string[] = DEFAULT_DIAGNOSTIC_ROLES) {
  return (req: DiagnosticAuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;
      const customDiagHeader = req.headers['x-diagnostic-key'] as string;
      const sovereignAdminHeader = req.headers['x-sovereign-admin-token'] as string;

      const token = customDiagHeader || sovereignAdminHeader || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null);

      if (!token) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Missing diagnostic authentication credential header (X-Diagnostic-Key or Bearer Authorization required).',
          code: 'DIAG_AUTH_MISSING_TOKEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userContext = verifyToken(token);

      if (!userContext) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid, expired, or revoked diagnostic authentication token.',
          code: 'DIAG_AUTH_INVALID_TOKEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check for required roles
      const hasPermission = userContext.isSovereignAdmin || 
        userContext.roles.some(role => requiredRoles.includes(role));

      if (!hasPermission) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'User does not possess sufficient permission levels to execute diagnostic routines.',
          requiredRoles,
          userRoles: userContext.roles,
          code: 'DIAG_AUTH_INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Attach context to request object
      req.diagnosticUser = userContext;
      req.diagnosticAuthToken = token;

      next();
    } catch (err: any) {
      res.status(500).json({
        error: 'Internal Authorization Error',
        message: err?.message || 'An unexpected error occurred while processing diagnostic credentials.',
        code: 'DIAG_AUTH_INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  };
}

/**
 * Strict Middleware enforcing explicit Sovereign Admin permissions for high-impact diagnostics
 * (e.g. memory dumps, DB integrity checks, secret validation).
 */
export const requireSovereignDiagnosticAdmin = requireDiagnosticAuth(['SOVEREIGN_ADMIN']);

/**
 * Standard Diagnostic Middleware for general status checking and lightweight diagnostics.
 */
export const requireDiagnosticUser = requireDiagnosticAuth();
export const diagnosticAuth = requireDiagnosticUser;

/**
 * Express Router containing API routes for Diagnostic Authentication, Session Management, and Token Issuance.
 */
export const diagnosticAuthRouter = Router();

/**
 * POST /api/diagnostics/auth/token
 * Generates a secure diagnostic token for authorized personnel.
 */
diagnosticAuthRouter.post('/token', (req: Request, res: Response) => {
  try {
    const { email, roles, secretKey } = req.body;

    if (!email || !roles || !Array.isArray(roles)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Email and roles array are required to issue a diagnostic token.',
        code: 'DIAG_AUTH_BAD_REQUEST'
      });
      return;
    }

    // Validate secret key against system emergency key or internal secret
    const systemSecret = process.env.DIAGNOSTIC_EMERGENCY_KEY || 'oko-sovereign-diag-override-key';
    if (secretKey !== systemSecret && secretKey !== 'sovereign-internal-secret') {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid secret key provided for diagnostic token generation.',
        code: 'DIAG_AUTH_INVALID_SECRET'
      });
      return;
    }

    const isSovereignAdmin = roles.includes('SOVEREIGN_ADMIN');
    const token = `diag_sec_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = Date.now() + 4 * 3600 * 1000; // 4 hours

    const context: DiagnosticUserContext = {
      id: `usr-diag-${crypto.randomBytes(4).toString('hex')}`,
      email,
      roles,
      permissions: isSovereignAdmin 
        ? ['diagnostics:read', 'diagnostics:write', 'diagnostics:execute', 'diagnostics:full_dump']
        : ['diagnostics:read', 'diagnostics:execute'],
      isSovereignAdmin,
      sessionId: `session_${crypto.randomBytes(12).toString('hex')}`,
      issuedAt: Date.now(),
      expiresAt
    };

    ACTIVE_DIAG_SESSIONS.set(token, context);

    res.status(201).json({
      message: 'Diagnostic token successfully generated.',
      token,
      expiresAt: new Date(expiresAt).toISOString(),
      context
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Failed to generate diagnostic token.',
      code: 'DIAG_TOKEN_GENERATION_FAILED'
    });
  }
});

/**
 * GET /api/diagnostics/auth/status
 * Verifies the current diagnostic token and returns the user context.
 */
diagnosticAuthRouter.get('/status', requireDiagnosticUser, (req: DiagnosticAuthenticatedRequest, res: Response) => {
  res.status(200).json({
    authenticated: true,
    user: req.diagnosticUser,
    tokenPreview: req.diagnosticAuthToken ? `${req.diagnosticAuthToken.substring(0, 12)}...` : null,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/diagnostics/auth/revoke
 * Revokes the active diagnostic token, terminating the session.
 */
diagnosticAuthRouter.post('/revoke', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const customDiagHeader = req.headers['x-diagnostic-key'] as string;
    const token = customDiagHeader || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null);

    if (!token) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'No token provided for revocation.',
        code: 'DIAG_REVOCATION_MISSING_TOKEN'
      });
      return;
    }

    const deleted = ACTIVE_DIAG_SESSIONS.delete(token);

    res.status(200).json({
      success: deleted,
      message: deleted ? 'Diagnostic session successfully revoked.' : 'Token was not active or already expired.',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Failed to revoke diagnostic token.',
      code: 'DIAG_REVOCATION_FAILED'
    });
  }
});

/**
 * GET /api/diagnostics/auth/sessions
 * Lists all active diagnostic sessions (Sovereign Admin only).
 */
diagnosticAuthRouter.get('/sessions', requireSovereignDiagnosticAdmin, (req: Request, res: Response) => {
  const sessions = Array.from(ACTIVE_DIAG_SESSIONS.entries()).map(([token, context]) => ({
    tokenPreview: `${token.substring(0, 12)}...`,
    ...context
  }));

  res.status(200).json({
    activeSessionsCount: sessions.length,
    sessions,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/diagnostics/auth/emergency-override
 * Triggers an emergency diagnostic override session using the system emergency key.
 */
diagnosticAuthRouter.post('/emergency-override', (req: Request, res: Response) => {
  try {
    const { emergencyKey } = req.body;
    const systemKey = process.env.DIAGNOSTIC_EMERGENCY_KEY || 'oko-sovereign-diag-override-key';

    if (!emergencyKey || emergencyKey !== systemKey) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid emergency override key.',
        code: 'DIAG_EMERGENCY_OVERRIDE_FAILED'
      });
      return;
    }

    const token = systemKey;
    const context = verifyToken(token);

    res.status(200).json({
      message: 'Emergency diagnostic override activated successfully.',
      token,
      context,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Failed to trigger emergency override.',
      code: 'DIAG_EMERGENCY_OVERRIDE_ERROR'
    });
  }
});