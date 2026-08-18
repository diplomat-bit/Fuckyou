import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// Define the global/Illuminati-level roles within the system
export type UserRole =
  | 'CITIZEN'
  | 'MERCHANT'
  | 'GOVERNMENT_OFFICIAL'
  | 'SUPPLY_CHAIN_DIRECTOR'
  | 'ILLUMINATI_OPERATIVE'
  | 'SYSTEM_ADMIN';

// Granular permissions covering all aspects of the global offline network
export type Permission =
  // Property & Assets
  | 'asset:buy:real_estate'
  | 'asset:sell:real_estate'
  | 'asset:buy:vehicle'
  | 'asset:sell:vehicle'
  | 'asset:transfer:global'
  // Supply Chain & Commerce
  | 'supply:create_order'
  | 'supply:manage_logistics'
  | 'supply:override_quota'
  // Government & Sovereign Operations
  | 'gov:issue_currency'
  | 'gov:levy_tax'
  | 'gov:modify_registry'
  | 'gov:enforce_law'
  // System & Illuminati Control
  | 'system:override_all'
  | 'system:manage_nodes'
  | 'system:read_global_ledger';

export interface UserPayload {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  clearanceLevel: number; // 1 (lowest) to 10 (highest/Illuminati)
  jurisdiction: string;   // e.g., "GLOBAL", "US-EAST", "EU-WEST"
  fingerprint: string;    // Hardware/network binding fingerprint for offline security
}

// Extend Express Request interface to include the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      token?: string;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'ILLUMINATI_OFFLINE_NETWORK_SUPER_SECRET_2026_#@!';

/**
 * Authentication Middleware
 * Verifies the JSON Web Token (JWT) provided in the Authorization header.
 * Supports offline verification using local cryptographic keys.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Authorization token missing or malformed. Bearer token required.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify token using the local offline-capable secret/public key
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;

    // Optional: Verify hardware/network fingerprint if provided in headers to prevent token theft
    const clientFingerprint = req.headers['x-device-fingerprint'] as string;
    if (decoded.fingerprint && decoded.fingerprint !== clientFingerprint) {
      res.status(403).json({
        success: false,
        error: 'Security Violation',
        message: 'Device fingerprint mismatch. Access denied on this offline node.',
      });
      return;
    }

    // Attach user payload and token to the request object
    req.user = decoded;
    req.token = token;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token Expired',
        message: 'The provided authentication token has expired.',
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: 'Invalid Token',
      message: 'Authentication token verification failed.',
    });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts access to endpoints based on user roles.
 * Supports checking against multiple allowed roles.
 */
export const requireRole = (allowedRoles: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required to access this resource.',
      });
      return;
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // System Admin and Illuminati Operatives bypass standard role checks
    if (req.user.role === 'SYSTEM_ADMIN' || req.user.role === 'ILLUMINATI_OPERATIVE') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. Required role: [${roles.join(', ')}]. Your role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
};

/**
 * Granular Permission-Based Access Control Middleware
 * Restricts access based on specific operational permissions.
 * Can require all specified permissions or at least one (any).
 */
export const requirePermission = (
  requiredPermissions: Permission | Permission[],
  strategy: 'ALL' | 'ANY' = 'ALL'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required to access this resource.',
      });
      return;
    }

    // System Admin and Illuminati Operatives bypass all permission checks
    if (req.user.role === 'SYSTEM_ADMIN' || req.user.permissions.includes('system:override_all')) {
      return next();
    }

    const permissionsToCheck = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    const hasPermission = strategy === 'ALL'
      ? permissionsToCheck.every((perm) => req.user!.permissions.includes(perm))
      : permissionsToCheck.some((perm) => req.user!.permissions.includes(perm));

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. Missing required permissions: [${permissionsToCheck.join(', ')}] using strategy: ${strategy}`,
      });
      return;
    }

    next();
  };
};

/**
 * Security Clearance Level Middleware
 * Restricts access based on numeric clearance levels (e.g., Level 10 for top-tier Illuminati operations).
 */
export const requireClearance = (minLevel: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required to access this resource.',
      });
      return;
    }

    if (req.user.clearanceLevel < minLevel) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. Insufficient clearance level. Required: Level ${minLevel}, Your Level: ${req.user.clearanceLevel}`,
      });
      return;
    }

    next();
  };
};

/**
 * Jurisdiction-Based Access Control Middleware
 * Restricts operations to specific geographic or administrative jurisdictions.
 * Global jurisdiction ('GLOBAL') bypasses regional restrictions.
 */
export const requireJurisdiction = (allowedJurisdictions: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required to access this resource.',
      });
      return;
    }

    const jurisdictions = Array.isArray(allowedJurisdictions)
      ? allowedJurisdictions
      : [allowedJurisdictions];

    // Global jurisdiction or System Admin bypasses regional checks
    if (
      req.user.jurisdiction === 'GLOBAL' ||
      req.user.role === 'SYSTEM_ADMIN' ||
      req.user.role === 'ILLUMINATI_OPERATIVE'
    ) {
      return next();
    }

    if (!jurisdictions.includes(req.user.jurisdiction)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. This operation is restricted to jurisdictions: [${jurisdictions.join(', ')}]. Your jurisdiction: ${req.user.jurisdiction}`,
      });
      return;
    }

    next();
  };
};

/**
 * Helper to generate a secure JWT for the offline network.
 * Useful for authentication endpoints or node-to-node handshakes.
 */
export const generateToken = (payload: Omit<UserPayload, 'fingerprint'>, fingerprint: string, expiresIn: string = '24h'): string => {
  const tokenPayload: UserPayload = {
    ...payload,
    fingerprint,
  };
  return jwt.sign(tokenPayload, JWT_SECRET, { expiresIn });
};