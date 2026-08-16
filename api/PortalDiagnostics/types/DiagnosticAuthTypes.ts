import { Request, Response, Router } from 'express';
import * as crypto from 'crypto';

// ==========================================
// 1. ORIGINAL TYPE DEFINITIONS & INTERFACES
// ==========================================

export interface DiagnosticSession {
  sessionId: string;
  userId: string;
  token: string;
  expiresAt: Date;
  permissions: string[];
  mfaVerified: boolean;
}

export interface DiagnosticAuditLog {
  timestamp: Date;
  action: string;
  actorId: string;
  resource: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  metadata?: Record<string, any>;
}

export interface SystemHealthStatus {
  serviceName: string;
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE';
  latencyMs: number;
  lastChecked: Date;
  errorCount: number;
}

export interface DiagnosticUserContext {
  user: {
    id: string;
    role: 'ADMIN' | 'AUDITOR' | 'OPERATOR' | 'GUEST';
    email: string;
  };
  session: DiagnosticSession | null;
  isAuthenticated: boolean;
  lastActivity: Date;
}

export type AuthErrorCode = 
  | 'AUTH_EXPIRED'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'INVALID_TOKEN'
  | 'MFA_REQUIRED'
  | 'ACCOUNT_LOCKED';

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  retryAfter?: number;
}

// ==========================================
// 2. IN-MEMORY DATA STORES (MOCK DB)
// ==========================================

const sessionsStore = new Map<string, DiagnosticSession>();
const auditLogsStore: DiagnosticAuditLog[] = [];
const userDatabase = [
  { id: 'usr_01', email: 'admin@portal.local', password: 'password123', role: 'ADMIN' as const, permissions: ['read:all', 'write:all', 'diagnose:execute', 'mfa:bypass'] },
  { id: 'usr_02', email: 'auditor@portal.local', password: 'password123', role: 'AUDITOR' as const, permissions: ['read:all', 'audit:view'] },
  { id: 'usr_03', email: 'operator@portal.local', password: 'password123', role: 'OPERATOR' as const, permissions: ['read:all', 'diagnose:execute'] },
];

// ==========================================
// 3. HELPER FUNCTIONS & UTILITIES
// ==========================================

export function createSession(userId: string, permissions: string[], mfaRequired: boolean = true): DiagnosticSession {
  const sessionId = `sess_${crypto.randomBytes(16).toString('hex')}`;
  const token = `tok_${crypto.randomBytes(32).toString('hex')}`;
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 2); // 2 hours expiry

  const session: DiagnosticSession = {
    sessionId,
    userId,
    token,
    expiresAt,
    permissions,
    mfaVerified: !mfaRequired,
  };

  sessionsStore.set(token, session);
  return session;
}

export function logDiagnosticAction(
  action: string,
  actorId: string,
  resource: string,
  status: 'SUCCESS' | 'FAILURE' | 'PENDING',
  metadata?: Record<string, any>
): void {
  const log: DiagnosticAuditLog = {
    timestamp: new Date(),
    action,
    actorId,
    resource,
    status,
    metadata,
  };
  auditLogsStore.unshift(log); // Keep newest first
  if (auditLogsStore.length > 1000) {
    auditLogsStore.pop(); // Cap at 1000 logs in memory
  }
}

// ==========================================
// 4. MIDDLEWARE FOR ROUTE PROTECTION
// ==========================================

export interface AuthenticatedRequest extends Request {
  userContext?: DiagnosticUserContext;
}

export function authenticateDiagnosticToken(req: AuthenticatedRequest, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 'INVALID_TOKEN',
      message: 'Authorization header missing or malformed',
    } as AuthError);
  }

  const token = authHeader.split(' ')[1];
  const session = sessionsStore.get(token);

  if (!session) {
    return res.status(401).json({
      code: 'INVALID_TOKEN',
      message: 'Session not found or has been invalidated',
    } as AuthError);
  }

  if (new Date() > new Date(session.expiresAt)) {
    sessionsStore.delete(token);
    return res.status(401).json({
      code: 'AUTH_EXPIRED',
      message: 'Your diagnostic session has expired',
    } as AuthError);
  }

  const user = userDatabase.find(u => u.id === session.userId);
  if (!user) {
    return res.status(401).json({
      code: 'INVALID_TOKEN',
      message: 'User associated with this session no longer exists',
    } as AuthError);
  }

  req.userContext = {
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
    },
    session,
    isAuthenticated: true,
    lastActivity: new Date(),
  };

  next();
}

export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: () => void) => {
    if (!req.userContext || !req.userContext.session) {
      return res.status(401).json({ code: 'INVALID_TOKEN', message: 'Unauthorized' });
    }

    const hasPermission = req.userContext.session.permissions.includes(permission) || 
                          req.userContext.user.role === 'ADMIN';

    if (!hasPermission) {
      logDiagnosticAction(
        'UNAUTHORIZED_ACCESS_ATTEMPT',
        req.userContext.user.id,
        req.originalUrl,
        'FAILURE',
        { requiredPermission: permission }
      );
      return res.status(403).json({
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `Required permission: ${permission}`,
      } as AuthError);
    }

    next();
  };
}

// ==========================================
// 5. API ROUTER IMPLEMENTATION
// ==========================================

const router = Router();

/**
 * @route   POST /api/diagnostics/auth/login
 * @desc    Authenticate user and issue a diagnostic session token
 */
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = userDatabase.find(u => u.email === email && u.password === password);

  if (!user) {
    logDiagnosticAction('LOGIN_ATTEMPT', 'UNKNOWN', email, 'FAILURE', { reason: 'Invalid credentials' });
    return res.status(401).json({
      code: 'INVALID_TOKEN',
      message: 'Invalid email or password',
    } as AuthError);
  }

  // Require MFA for all roles except when bypassed
  const mfaRequired = !user.permissions.includes('mfa:bypass');
  const session = createSession(user.id, user.permissions, mfaRequired);

  logDiagnosticAction('LOGIN_SUCCESS', user.id, 'SESSION_CREATE', 'SUCCESS', {
    sessionId: session.sessionId,
    mfaRequired,
  });

  return res.status(200).json({
    message: mfaRequired ? 'MFA verification required' : 'Authentication successful',
    mfaRequired,
    token: session.token,
    expiresAt: session.expiresAt,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
});

/**
 * @route   POST /api/diagnostics/auth/mfa/verify
 * @desc    Verify MFA code to fully activate the diagnostic session
 */
router.post('/mfa/verify', (req: Request, res: Response) => {
  const { token, code } = req.body;

  if (!token || !code) {
    return res.status(400).json({ message: 'Token and MFA code are required' });
  }

  const session = sessionsStore.get(token);

  if (!session) {
    return res.status(401).json({
      code: 'INVALID_TOKEN',
      message: 'Invalid or expired session token',
    } as AuthError);
  }

  // Simple mock MFA verification (accepts '123456' or '000000')
  if (code !== '123456' && code !== '000000') {
    logDiagnosticAction('MFA_VERIFICATION', session.userId, 'MFA_GATE', 'FAILURE', { sessionId: session.sessionId });
    return res.status(400).json({
      code: 'MFA_REQUIRED',
      message: 'Invalid MFA verification code',
    } as AuthError);
  }

  session.mfaVerified = true;
  sessionsStore.set(token, session);

  logDiagnosticAction('MFA_VERIFICATION', session.userId, 'MFA_GATE', 'SUCCESS', { sessionId: session.sessionId });

  return res.status(200).json({
    message: 'MFA verification successful',
    session,
  });
});

/**
 * @route   POST /api/diagnostics/auth/logout
 * @desc    Invalidate current diagnostic session
 */
router.post('/logout', authenticateDiagnosticToken, (req: AuthenticatedRequest, res: Response) => {
  const token = req.headers.authorization!.split(' ')[1];
  const session = req.userContext?.session;

  if (session) {
    sessionsStore.delete(token);
    logDiagnosticAction('LOGOUT', req.userContext!.user.id, 'SESSION_DESTROY', 'SUCCESS', { sessionId: session.sessionId });
  }

  return res.status(200).json({ message: 'Logged out successfully' });
});

/**
 * @route   GET /api/diagnostics/auth/session
 * @desc    Retrieve current user context and session status
 */
router.get('/session', authenticateDiagnosticToken, (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json(req.userContext);
});

/**
 * @route   GET /api/diagnostics/auth/audit-logs
 * @desc    Retrieve diagnostic audit logs (Auditors and Admins only)
 */
router.get('/audit-logs', authenticateDiagnosticToken, requirePermission('audit:view'), (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({
    total: auditLogsStore.length,
    logs: auditLogsStore,
  });
});

/**
 * @route   GET /api/diagnostics/auth/health
 * @desc    Retrieve system health status metrics
 */
router.get('/health', (req: Request, res: Response) => {
  const healthStatuses: SystemHealthStatus[] = [
    {
      serviceName: 'DiagnosticAuthService',
      status: 'HEALTHY',
      latencyMs: 12,
      lastChecked: new Date(),
      errorCount: 0,
    },
    {
      serviceName: 'PortalDatabaseBridge',
      status: 'HEALTHY',
      latencyMs: 45,
      lastChecked: new Date(),
      errorCount: 0,
    },
    {
      serviceName: 'MfaVerificationGateway',
      status: 'HEALTHY',
      latencyMs: 110,
      lastChecked: new Date(),
      errorCount: 1,
    }
  ];

  return res.status(200).json({
    status: 'ONLINE',
    timestamp: new Date(),
    services: healthStatuses,
  });
});

export { router as diagnosticAuthRouter };