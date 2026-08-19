

// --- CONSOLIDATED FROM: ./api/AppRegistry/middleware/AppRegistryAuth.ts ---

declare module "koa";
declare module "@nestjs/common";

import { Request, Response, NextFunction, Router } from 'express';
import { Context as KoaContext, Next as KoaNext } from 'koa';
import * as crypto from 'crypto';
import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  NestMiddleware, 
  createParamDecorator, 
  UnauthorizedException, 
  ForbiddenException 
} from '@nestjs/common';

/**
 * Standard Token Claims for App Registry Invocation Tokens
 */
export interface AppRegistryClaims {
  appId: string;
  tenantId: string;
  scopes: string[];
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  jti?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Verified Application Authentication Context injected into Requests
 */
export interface AppRegistryAuthContext {
  appId: string;
  tenantId: string;
  scopes: string[];
  claims: AppRegistryClaims;
  issuedAt: Date;
  expiresAt: Date;
  tokenRaw: string;
}

/**
 * Extended Express Request with App Auth Context
 */
export interface AppAuthExpressRequest extends Request {
  appAuth?: AppRegistryAuthContext;
}

/**
 * Extended Koa Context with App Auth Context
 */
export interface AppAuthKoaContext extends KoaContext {
  state: KoaContext['state'] & {
    appAuth?: AppRegistryAuthContext;
  };
  get(header: string): string;
  status: number;
  body: any;
}

/**
 * Configuration Options for the App Registry Auth Middleware
 */
export interface AppRegistryAuthOptions {
  secretOrPublicKey?: string | Buffer;
  issuer?: string;
  audience?: string;
  clockToleranceSeconds?: number;
  headerName?: string;
  tenantHeaderName?: string;
  allowUnsignedDevTokens?: boolean;
}

export const DEFAULT_OPTIONS: Required<AppRegistryAuthOptions> = {
  secretOrPublicKey: process.env.APP_REGISTRY_SECRET || 'oko-app-registry-master-secret-32B',
  issuer: process.env.APP_REGISTRY_ISSUER || 'oko:app-registry',
  audience: process.env.APP_REGISTRY_AUDIENCE || 'oko:api-gateway',
  clockToleranceSeconds: 30,
  headerName: 'authorization',
  tenantHeaderName: 'x-tenant-id',
  allowUnsignedDevTokens: process.env.NODE_ENV === 'development'
};

/**
 * Utility: Parse Bearer token from header value
 */
export function extractBearerToken(headerValue?: string): string | null {
  if (!headerValue) return null;
  const parts = headerValue.trim().split(' ');
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
    return parts[1];
  }
  return headerValue.trim();
}

/**
 * Utility: Safe Base64URL decoding
 */
export function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Utility: HMAC-SHA256 signature verification
 */
export function verifyHmacSignature(token: string, secret: string | Buffer): AppRegistryClaims | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  const dataToSign = `${headerB64}.${payloadB64}`;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(dataToSign)
    .digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(signatureB64), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    return JSON.parse(base64UrlDecode(payloadB64)) as AppRegistryClaims;
  } catch {
    return null;
  }
}

/**
 * Core validation logic for claims
 */
export function validateClaims(
  claims: AppRegistryClaims,
  options: Required<AppRegistryAuthOptions>,
  tenantIdHeader?: string
): { valid: boolean; error?: string } {
  const now = Math.floor(Date.now() / 1000);

  if (claims.exp && now - options.clockToleranceSeconds > claims.exp) {
    return { valid: false, error: 'App invocation token expired' };
  }

  if (claims.iat && now + options.clockToleranceSeconds < claims.iat) {
    return { valid: false, error: 'App invocation token issued in the future' };
  }

  if (options.issuer && claims.iss !== options.issuer) {
    return { valid: false, error: `Invalid issuer. Expected: ${options.issuer}, Got: ${claims.iss}` };
  }

  if (options.audience && claims.aud !== options.audience) {
    return { valid: false, error: `Invalid audience. Expected: ${options.audience}, Got: ${claims.aud}` };
  }

  if (!claims.appId) {
    return { valid: false, error: 'Token missing required claim: appId' };
  }

  if (!claims.tenantId) {
    return { valid: false, error: 'Token missing required claim: tenantId' };
  }

  if (tenantIdHeader && tenantIdHeader.toLowerCase() !== claims.tenantId.toLowerCase()) {
    return { valid: false, error: `Tenant context mismatch between header (${tenantIdHeader}) and token (${claims.tenantId})` };
  }

  return { valid: true };
}

/**
 * Scope Matcher with Wildcard support (e.g. 'apps:read', 'apps:*', '*')
 */
export function hasRequiredScopes(userScopes: string[], requiredScopes: string[]): boolean {
  if (!requiredScopes || requiredScopes.length === 0) return true;
  if (!userScopes || userScopes.length === 0) return false;

  return requiredScopes.every(required => {
    return userScopes.some(granted => {
      if (granted === '*' || granted === required) return true;
      if (granted.endsWith(':*')) {
        const prefix = granted.slice(0, -2);
        return required.startsWith(`${prefix}:`);
      }
      return false;
    });
  });
}

/**
 * Token Generation Utility
 */
export interface TokenGenerationPayload {
  appId: string;
  tenantId: string;
  scopes: string[];
  metadata?: Record<string, unknown>;
  expiresInSeconds?: number;
}

export function generateAppRegistryToken(
  payload: TokenGenerationPayload,
  secret: string | Buffer = DEFAULT_OPTIONS.secretOrPublicKey,
  issuer: string = DEFAULT_OPTIONS.issuer,
  audience: string = DEFAULT_OPTIONS.audience
): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + (payload.expiresInSeconds || 3600);
  
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const claims: AppRegistryClaims = {
    appId: payload.appId,
    tenantId: payload.tenantId,
    scopes: payload.scopes,
    iss: issuer,
    aud: audience,
    iat,
    exp,
    jti: crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'),
    metadata: payload.metadata
  };

  const base64UrlEncode = (str: string) => {
    return Buffer.from(str).toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(claims));
  const dataToSign = `${headerB64}.${payloadB64}`;

  const signatureB64 = crypto
    .createHmac('sha256', secret)
    .update(dataToSign)
    .digest('base64url');

  return `${dataToSign}.${signatureB64}`;
}

/**
 * Express Middleware: App Registry Token Verification & Context Hydration
 */
export function expressAppRegistryAuth(customOptions?: AppRegistryAuthOptions) {
  const opts: Required<AppRegistryAuthOptions> = { ...DEFAULT_OPTIONS, ...customOptions };

  return (req: AppAuthExpressRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers[opts.headerName.toLowerCase()] as string | undefined;
    const rawToken = extractBearerToken(authHeader);

    if (!rawToken) {
      res.status(401).json({ error: 'Unauthorized', message: 'App invocation token missing' });
      return;
    }

    let claims = verifyHmacSignature(rawToken, opts.secretOrPublicKey);

    if (!claims && opts.allowUnsignedDevTokens) {
      try {
        const parts = rawToken.split('.');
        if (parts.length >= 2) {
          claims = JSON.parse(base64UrlDecode(parts[1])) as AppRegistryClaims;
        }
      } catch {
        claims = null;
      }
    }

    if (!claims) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid token signature or format' });
      return;
    }

    const tenantHeader = req.headers[opts.tenantHeaderName.toLowerCase()] as string | undefined;
    const validation = validateClaims(claims, opts, tenantHeader);

    if (!validation.valid) {
      res.status(403).json({ error: 'Forbidden', message: validation.error });
      return;
    }

    req.appAuth = {
      appId: claims.appId,
      tenantId: claims.tenantId,
      scopes: claims.scopes || [],
      claims,
      issuedAt: new Date(claims.iat * 1000),
      expiresAt: new Date(claims.exp * 1000),
      tokenRaw: rawToken
    };

    next();
  };
}

export const AppRegistryAuth = expressAppRegistryAuth();

/**
 * Express Scope Guard Middleware
 */
export function expressRequireScopes(...requiredScopes: string[]) {
  return (req: AppAuthExpressRequest, res: Response, next: NextFunction): void => {
    if (!req.appAuth) {
      res.status(401).json({ error: 'Unauthorized', message: 'App authentication context missing' });
      return;
    }

    const grantedScopes = req.appAuth.scopes;
    if (!hasRequiredScopes(grantedScopes, requiredScopes)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Insufficient app scopes. Required: [${requiredScopes.join(', ')}], Granted: [${grantedScopes.join(', ')}]`
      });
      return;
    }

    next();
  };
}

/**
 * Express API Router for App Registry Authentication Management
 */
export function createAppRegistryAuthRouter(options?: AppRegistryAuthOptions): Router {
  const router = Router();
  const opts = { ...DEFAULT_OPTIONS, ...options };

  router.post('/token', (req, res) => {
    try {
      const { appId, tenantId, scopes, metadata, expiresInSeconds } = req.body;
      if (!appId || !tenantId) {
        return res.status(400).json({ error: 'Bad Request', message: 'appId and tenantId are required' });
      }

      const token = generateAppRegistryToken({
        appId,
        tenantId,
        scopes: scopes || [],
        metadata: metadata || {},
        expiresInSeconds: expiresInSeconds || 3600
      }, opts.secretOrPublicKey, opts.issuer, opts.audience);

      return res.json({
        access_token: token,
        token_type: 'Bearer',
        expires_in: expiresInSeconds || 3600
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  });

  router.post('/verify', (req, res) => {
    try {
      const authHeader = req.headers[opts.headerName.toLowerCase()] as string | undefined;
      const token = extractBearerToken(authHeader) || req.body.token;

      if (!token) {
        return res.status(400).json({ error: 'Bad Request', message: 'Token is missing' });
      }

      const claims = verifyHmacSignature(token, opts.secretOrPublicKey);
      if (!claims) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token signature or format' });
      }

      const validation = validateClaims(claims, opts);
      if (!validation.valid) {
        return res.status(403).json({ error: 'Forbidden', message: validation.error });
      }

      return res.json({ valid: true, claims });
    } catch (err: any) {
      return res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  });

  router.get('/config', (req, res) => {
    return res.json({
      issuer: opts.issuer,
      audience: opts.audience,
      clockToleranceSeconds: opts.clockToleranceSeconds,
      headerName: opts.headerName,
      tenantHeaderName: opts.tenantHeaderName,
      algorithms: ['HS256']
    });
  });

  return router;
}

/**
 * Koa Middleware: App Registry Token Verification & Context Hydration
 */
export function koaAppRegistryAuth(customOptions?: AppRegistryAuthOptions) {
  const opts: Required<AppRegistryAuthOptions> = { ...DEFAULT_OPTIONS, ...customOptions };

  return async (ctx: AppAuthKoaContext, next: KoaNext): Promise<void> => {
    const authHeader = ctx.get(opts.headerName);
    const rawToken = extractBearerToken(authHeader);

    if (!rawToken) {
      ctx.status = 401;
      ctx.body = { error: 'Unauthorized', message: 'App invocation token missing' };
      return;
    }

    let claims = verifyHmacSignature(rawToken, opts.secretOrPublicKey);

    if (!claims && opts.allowUnsignedDevTokens) {
      try {
        const parts = rawToken.split('.');
        if (parts.length >= 2) {
          claims = JSON.parse(base64UrlDecode(parts[1])) as AppRegistryClaims;
        }
      } catch {
        claims = null;
      }
    }

    if (!claims) {
      ctx.status = 401;
      ctx.body = { error: 'Unauthorized', message: 'Invalid token signature or format' };
      return;
    }

    const tenantHeader = ctx.get(opts.tenantHeaderName);
    const validation = validateClaims(claims, opts, tenantHeader);

    if (!validation.valid) {
      ctx.status = 403;
      ctx.body = { error: 'Forbidden', message: validation.error };
      return;
    }

    ctx.state.appAuth = {
      appId: claims.appId,
      tenantId: claims.tenantId,
      scopes: claims.scopes || [],
      claims,
      issuedAt: new Date(claims.iat * 1000),
      expiresAt: new Date(claims.exp * 1000),
      tokenRaw: rawToken
    };

    await next();
  };
}

/**
 * Koa Scope Guard Middleware
 */
export function koaRequireScopes(...requiredScopes: string[]) {
  return async (ctx: AppAuthKoaContext, next: KoaNext): Promise<void> => {
    if (!ctx.state.appAuth) {
      ctx.status = 401;
      ctx.body = { error: 'Unauthorized', message: 'App authentication context missing' };
      return;
    }

    const grantedScopes = ctx.state.appAuth.scopes;
    if (!hasRequiredScopes(grantedScopes, requiredScopes)) {
      ctx.status = 403;
      ctx.body = {
        error: 'Forbidden',
        message: `Insufficient app scopes. Required: [${requiredScopes.join(', ')}], Granted: [${grantedScopes.join(', ')}]`
      };
      return;
    }

    await next();
  };
}

/**
 * Koa API Router for App Registry Authentication Management
 */
export function createAppRegistryAuthKoaRouter(koaRouterInstance: any, options?: AppRegistryAuthOptions): any {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  koaRouterInstance.post('/token', async (ctx: any) => {
    try {
      const { appId, tenantId, scopes, metadata, expiresInSeconds } = ctx.request.body as any;
      if (!appId || !tenantId) {
        ctx.status = 400;
        ctx.body = { error: 'Bad Request', message: 'appId and tenantId are required' };
        return;
      }

      const token = generateAppRegistryToken({
        appId,
        tenantId,
        scopes: scopes || [],
        metadata: metadata || {},
        expiresInSeconds: expiresInSeconds || 3600
      }, opts.secretOrPublicKey, opts.issuer, opts.audience);

      ctx.body = {
        access_token: token,
        token_type: 'Bearer',
        expires_in: expiresInSeconds || 3600
      };
    } catch (err: any) {
      ctx.status = 500;
      ctx.body = { error: 'Internal Server Error', message: err.message };
    }
  });

  koaRouterInstance.post('/verify', async (ctx: any) => {
    try {
      const authHeader = ctx.get(opts.headerName);
      const token = extractBearerToken(authHeader) || (ctx.request.body as any)?.token;

      if (!token) {
        ctx.status = 400;
        ctx.body = { error: 'Bad Request', message: 'Token is missing' };
        return;
      }

      const claims = verifyHmacSignature(token, opts.secretOrPublicKey);
      if (!claims) {
        ctx.status = 401;
        ctx.body = { error: 'Unauthorized', message: 'Invalid token signature or format' };
        return;
      }

      const validation = validateClaims(claims, opts);
      if (!validation.valid) {
        ctx.status = 403;
        ctx.body = { error: 'Forbidden', message: validation.error };
        return;
      }

      ctx.body = { valid: true, claims };
    } catch (err: any) {
      ctx.status = 500;
      ctx.body = { error: 'Internal Server Error', message: err.message };
    }
  });

  koaRouterInstance.get('/config', async (ctx: any) => {
    ctx.body = {
      issuer: opts.issuer,
      audience: opts.audience,
      clockToleranceSeconds: opts.clockToleranceSeconds,
      headerName: opts.headerName,
      tenantHeaderName: opts.tenantHeaderName,
      algorithms: ['HS256']
    };
  });

  return koaRouterInstance;
}

/**
 * NestJS Guard: App Registry Token Verification
 */
@Injectable()
export class NestAppRegistryGuard implements CanActivate {
  constructor(private readonly options?: AppRegistryAuthOptions) {}

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const req = http.getRequest<AppAuthExpressRequest>();
    const opts = { ...DEFAULT_OPTIONS, ...this.options };

    const authHeader = req.headers[opts.headerName.toLowerCase()] as string | undefined;
    const rawToken = extractBearerToken(authHeader);

    if (!rawToken) {
      throw new UnauthorizedException('App invocation token missing');
    }

    let claims = verifyHmacSignature(rawToken, opts.secretOrPublicKey);

    if (!claims && opts.allowUnsignedDevTokens) {
      try {
        const parts = rawToken.split('.');
        if (parts.length >= 2) {
          claims = JSON.parse(base64UrlDecode(parts[1])) as AppRegistryClaims;
        }
      } catch {
        claims = null;
      }
    }

    if (!claims) {
      throw new UnauthorizedException('Invalid token signature or format');
    }

    const tenantHeader = req.headers[opts.tenantHeaderName.toLowerCase()] as string | undefined;
    const validation = validateClaims(claims, opts, tenantHeader);

    if (!validation.valid) {
      throw new ForbiddenException(validation.error || 'Forbidden');
    }

    req.appAuth = {
      appId: claims.appId,
      tenantId: claims.tenantId,
      scopes: claims.scopes || [],
      claims,
      issuedAt: new Date(claims.iat * 1000),
      expiresAt: new Date(claims.exp * 1000),
      tokenRaw: rawToken
    };

    return true;
  }
}

/**
 * NestJS Guard: Scope Verification
 */
@Injectable()
export class NestRequireScopesGuard implements CanActivate {
  constructor(private readonly requiredScopes: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const req = http.getRequest<AppAuthExpressRequest>();

    if (!req.appAuth) {
      throw new UnauthorizedException('App authentication context missing');
    }

    const grantedScopes = req.appAuth.scopes;
    if (!hasRequiredScopes(grantedScopes, this.requiredScopes)) {
      throw new ForbiddenException(
        `Insufficient app scopes. Required: [${this.requiredScopes.join(', ')}], Granted: [${grantedScopes.join(', ')}]`
      );
    }

    return true;
  }
}

/**
 * NestJS Middleware: App Registry Token Verification
 */
@Injectable()
export class NestAppRegistryMiddleware implements NestMiddleware {
  constructor(private readonly options?: AppRegistryAuthOptions) {}

  use(req: AppAuthExpressRequest, res: Response, next: () => void) {
    const opts = { ...DEFAULT_OPTIONS, ...this.options };
    const authHeader = req.headers[opts.headerName.toLowerCase()] as string | undefined;
    const rawToken = extractBearerToken(authHeader);

    if (!rawToken) {
      throw new UnauthorizedException('App invocation token missing');
    }

    let claims = verifyHmacSignature(rawToken, opts.secretOrPublicKey);

    if (!claims && opts.allowUnsignedDevTokens) {
      try {
        const parts = rawToken.split('.');
        if (parts.length >= 2) {
          claims = JSON.parse(base64UrlDecode(parts[1])) as AppRegistryClaims;
        }
      } catch {
        claims = null;
      }
    }

    if (!claims) {
      throw new UnauthorizedException('Invalid token signature or format');
    }

    const tenantHeader = req.headers[opts.tenantHeaderName.toLowerCase()] as string | undefined;
    const validation = validateClaims(claims, opts, tenantHeader);

    if (!validation.valid) {
      throw new ForbiddenException(validation.error || 'Forbidden');
    }

    req.appAuth = {
      appId: claims.appId,
      tenantId: claims.tenantId,
      scopes: claims.scopes || [],
      claims,
      issuedAt: new Date(claims.iat * 1000),
      expiresAt: new Date(claims.exp * 1000),
      tokenRaw: rawToken
    };

    next();
  }
}

/**
 * NestJS Custom Decorators
 */
export const CurrentAppAuth = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AppAuthExpressRequest>();
    return request.appAuth;
  }
);

export const CurrentAppId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AppAuthExpressRequest>();
    return request.appAuth?.appId;
  }
);

export const CurrentTenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AppAuthExpressRequest>();
    return request.appAuth?.tenantId;
  }
);

export default {
  AppRegistryAuth,
  expressAppRegistryAuth,
  expressRequireScopes,
  createAppRegistryAuthRouter,
  koaAppRegistryAuth,
  koaRequireScopes,
  createAppRegistryAuthKoaRouter,
  hasRequiredScopes,
  generateAppRegistryToken,
  extractBearerToken,
  verifyHmacSignature,
  validateClaims,
  NestAppRegistryGuard,
  NestRequireScopesGuard,
  NestAppRegistryMiddleware,
  CurrentAppAuth,
  CurrentAppId,
  CurrentTenantId,
  DEFAULT_OPTIONS
};