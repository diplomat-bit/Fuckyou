import { Router, json, urlencoded } from "express";
import type { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { logger } from "./utils/logger.js";
import { complianceEngine } from "./utils/complianceEngine.js";
import { vault } from "./utils/vault.js";

const router = Router();

const handlePar = async (req: Request, res: Response) => {
  const uuidHeader = (req.headers['uuid'] || req.headers['x-request-id'] || `uuid-${uuidv4()}`) as string;
  const clientIdHeader = req.headers['client_id'] as string;

  const {
    client_id,
    response_type,
    redirect_uri,
    scope,
    partnerUserIdentifier
  } = req.body || {};

  const effectiveClientId = client_id || clientIdHeader;
  logger.info("[PAR] Push Authorization Request received", { uuid: uuidHeader, client_id: effectiveClientId });

  const validationResult = await complianceEngine.validateRequest(
    "push_authorization",
    req.body,
    { uuid: uuidHeader, clientId: effectiveClientId, headers: req.headers }
  );

  const isCompliant = typeof validationResult === "boolean"
    ? validationResult
    : (validationResult?.isCompliant ?? validationResult?.valid ?? validationResult?.isValid ?? true);

  if (!isCompliant) {
    return res.status(403).json({ error: "Compliance validation failed for FAPI request" });
  }

  const requestUriToken = `urn:ietf:params:oauth:request_uri:req_${uuidv4()}`;
  
  res.setHeader("X-FAPI-Interaction-ID", uuidv4());
  res.status(201).json({
    request_uri: requestUriToken,
    expires_in: 600
  });
};

router.post("/api/v1/push/authorization", json(), urlencoded({ extended: true }), handlePar);
router.post("/openapi/iam/tokenManagement/partner/authCode/oauth2/cgw/v1/push/authorization", json(), urlencoded({ extended: true }), handlePar);
router.post("/push/authorization", json(), urlencoded({ extended: true }), handlePar);

router.get("/.well-known/openid-configuration", (req: Request, res: Response) => {
  const publicConfigPath = path.join(process.cwd(), "public", "oidc-config.json");
  if (fs.existsSync(publicConfigPath)) {
    return res.sendFile(publicConfigPath);
  }
  res.json({
    issuer: "https://auth.aibanking.dev/",
    authorization_endpoint: "https://auth.aibanking.dev/authorize",
    token_endpoint: "https://auth.aibanking.dev/oauth/token",
    pushed_authorization_request_endpoint: "https://auth.aibanking.dev/push/authorization",
    jwks_uri: "https://auth.aibanking.dev/.well-known/jwks.json",
    grant_types_supported: ["authorization_code", "client_credentials", "refresh_token"],
    response_types_supported: ["code", "id_token"],
    scopes_supported: ["openid", "accounts", "payments", "sovereign", "identity"],
    token_endpoint_auth_methods_supported: ["tls_client_auth", "private_key_jwt"],
    tls_client_certificate_bound_access_tokens: true
  });
});

router.get("/.well-known/jwks.json", async (req: Request, res: Response) => {
  const publicKeys = await vault.getPublicKeys();
  if (publicKeys && typeof publicKeys === "object" && "keys" in publicKeys) {
    res.json(publicKeys);
  } else {
    res.json({ keys: Array.isArray(publicKeys) ? publicKeys : [publicKeys].filter(Boolean) });
  }
});

router.post("/oauth/token", json(), urlencoded({ extended: true }), async (req: Request, res: Response) => {
  res.setHeader("X-FAPI-Interaction-ID", uuidv4());
  
  const scope = req.body?.scope || "openid accounts";
  const token = await vault.generateSecureToken("sovereign_user", scope);

  res.json({
    access_token: typeof token === "string" ? token : (token?.accessToken || token?.access_token || token?.token),
    token_type: (typeof token === "object" && (token?.tokenType || token?.token_type)) || "Bearer",
    expires_in: (typeof token === "object" && (token?.expiresIn || token?.expires_in)) || 3600,
    refresh_token: typeof token === "object" ? (token?.refreshToken || token?.refresh_token) : undefined,
    id_token: typeof token === "object" ? (token?.idToken || token?.id_token) : undefined
  });
});

router.post("/api/v1/certificates/issue", json(), async (req: Request, res: Response) => {
  const { commonName, organization, country } = req.body || {};
  try {
    const cert = await vault.issueCertificate(
      commonName || "aibanking.dev",
      organization || "AI Banking Corp",
      country || "US"
    );
    res.json({
      certificateId: cert?.id || cert?.certificateId || uuidv4(),
      commonName: cert?.commonName || commonName,
      organization: cert?.organization || organization,
      country: cert?.country || country,
      certificatePem: cert?.pem || cert?.certificatePem || cert?.certificate || cert,
      status: cert?.status || "ISSUED",
      createdAt: cert?.createdAt || new Date().toISOString()
    });
  } catch (error: any) {
    logger.error("Certificate issuance failed", error);
    res.status(500).json({ error: "Internal Security Vault Error" });
  }
});

router.post("/api/v1/mfa/challenge", json(), async (req: Request, res: Response) => {
  const { userId, factorType } = req.body || {};
  try {
    const challengeId = `mfa_ch_${uuidv4().substring(0, 8)}`;
    logger.info(`MFA challenge initiated for ${userId}`);
    res.json({
      challengeId,
      userId: userId || "sovereign_user",
      factorType: factorType || "TOTP",
      status: "PENDING_VERIFICATION",
      expiresIn: 300
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;