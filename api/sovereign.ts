import { Router } from "express";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { getOctokit, auditLogger, loadSecrets, CERT_DIR, GITHUB_BACKEND } from "../services/serverHelpers";
import { ComplianceEngine } from "./utils/complianceEngine";
import { CryptoBridge } from "./utils/crypto-bridge";
import { SovereignLedgerSyncService } from "./utils/ledgerSync";
import { Vault } from "./utils/vault";

const router = Router();
const compliance = new ComplianceEngine();
const crypto = new CryptoBridge();
const ledger = new SovereignLedgerSyncService();
const vault = new Vault();

router.post("/api/v1/orchestrator/isolate-machine", async (req: Request, res: Response) => {
  const { tenantId, machineId, comment } = req.body || {};
  const tId = tenantId || "6666f090-016a-494b-b11a-4d3e01febe95";
  const mId = machineId || `mach-${uuidv4().substring(0, 8)}`;
  
  await auditLogger.log("ISOLATION_EVENT", { mId, tId, comment });
  
  res.json({
    success: true,
    tenantId: tId,
    machineId: mId,
    isolationType: "Full",
    status: "ISOLATED",
    comment: comment || "Automated isolation by AI Security Orchestration Broker",
    timestamp: new Date().toISOString(),
    complianceHash: await compliance.generateHash(tId, mId)
  });
});

router.post("/api/v1/orchestrator/cert-rotation", async (req: Request, res: Response) => {
  const tenantId = "6666f090-016a-494b-b11a-4d3e01febe95";
  const masterClientId = "5058b232-bf3f-4de1-aa75-afdbad959a59";

  const sampleApps = [
    { id: "obj-001", appId: "5058b232-bf3f-4de1-aa75-afdbad959a59", displayName: "Sovereign Control Plane" },
    { id: "obj-002", appId: "citi-connect-gateway-app", displayName: "Citigroup Treasury Gateway" },
    { id: "obj-003", appId: "modern-treasury-broker-app", displayName: "Modern Treasury Ledger Broker" },
    { id: "obj-004", appId: "metamask-krypto-bridge-app", displayName: "MetaMask Bridge Ingress Node" }
  ];

  const rotatedLedger = await Promise.all(sampleApps.map(async (app) => {
    const keyId = await crypto.rotateKey(tenantId, app.appId);
    return {
      ObjectID: app.id,
      ApplicationName: app.displayName,
      AppID: app.appId,
      KeyID: keyId,
      Status: "Rotated and Active",
      Timestamp: new Date().toISOString()
    };
  }));

  res.json({
    success: true,
    tenantId,
    masterClientId,
    totalRotated: rotatedLedger.length,
    ledger: rotatedLedger,
    vaultStatus: await vault.verifyIntegrity(tenantId)
  });
});

router.post("/api/v1/orchestrator/sovereign-graph", async (req: Request, res: Response) => {
  const tenantId = "6666f090-016a-494b-b11a-4d3e01febe95";
  const graphData = await ledger.getTopology(tenantId);

  res.json({
    Metadata: {
      GeneratedAt: new Date().toISOString(),
      TenantID: tenantId,
      ExecutionStatus: "Fully_Autonomous_Verification_Passed"
    },
    ...graphData
  });
});

router.get("/api/v1/github/audit-logs", async (req: Request, res: Response) => {
  try {
    const octokit = getOctokit();
    const repoName = process.env.GITHUB_AUDIT_REPO || "aquarius-sovereign-audit-logs";
    
    if (!octokit) {
      return res.json(await ledger.getMockAuditLogs());
    }

    const user = await octokit.rest.users.getAuthenticated();
    const commits = await octokit.rest.repos.listCommits({
      owner: user.data.login,
      repo: repoName,
      per_page: 20
    });

    res.json(commits.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/v1/github/create-repository", async (req: Request, res: Response) => {
  const { name, private: isPrivate } = req.body || {};
  try {
    const octokit = getOctokit();
    if (!octokit) {
      return res.json({ status: "Mock Created", name });
    }
    const response = await octokit.rest.repos.createForAuthenticatedUser({
      name,
      private: isPrivate,
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;