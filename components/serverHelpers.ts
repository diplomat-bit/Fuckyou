

// --- CONSOLIDATED FROM: ./services/serverHelpers.ts ---

import dotenv from "dotenv";
dotenv.config();
import express from "express";
import type { Request, Response } from "express";
import path from "path";
import fs from "fs";
import https from "https";
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { GoogleGenAI } from "@google/genai";
import { Octokit } from "octokit";
import ModernTreasury from 'modern-treasury';
import Stripe from 'stripe';
import * as AlpacaModule from '@alpacahq/alpaca-trade-api';

const Alpaca: any = (AlpacaModule as any).Alpaca || (AlpacaModule as any).default || AlpacaModule;

export const SECRETS_FILE = path.join(process.cwd(), "secrets.json");

export const loadSecrets = (): Record<string, any> => {
  if (fs.existsSync(SECRETS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(SECRETS_FILE, "utf-8"));
    } catch (e) {
      console.error("Error parsing secrets file:", e);
      return {};
    }
  }
  return {};
};

export const saveSecrets = (secrets: any) => {
  fs.writeFileSync(SECRETS_FILE, JSON.stringify(secrets, null, 2));
};

// Initialize secrets if file doesn't exist
try {
  if (!fs.existsSync(SECRETS_FILE)) {
    saveSecrets({});
  }
} catch (e) {
  console.error("Error initializing secrets file:", e);
}

let alpacaInstance: any = null;
let lastKeyId: string | null = null;
let lastSecretKey: string | null = null;
let lastBaseUrl: string | null = null;

export const getAlpaca = () => {
  const secrets = loadSecrets();
  const keyId = process.env.ALPACA_API_KEY_ID || secrets.ALPACA_API_KEY_ID || '';
  const secretKey = process.env.ALPACA_API_SECRET_KEY || secrets.ALPACA_API_SECRET_KEY || '';
  const baseUrl = process.env.ALPACA_API_BASE_URL || secrets.ALPACA_API_BASE_URL;

  if (!alpacaInstance || lastKeyId !== keyId || lastSecretKey !== secretKey || lastBaseUrl !== baseUrl) {
    lastKeyId = keyId;
    lastSecretKey = secretKey;
    lastBaseUrl = baseUrl;

    const isPaper = keyId.startsWith("PK") || (baseUrl ? !baseUrl.includes('api.alpaca.markets') : true);
    let resolvedBaseUrl = baseUrl ? baseUrl.trim() : (isPaper ? "https://paper-api.alpaca.markets" : "https://api.alpaca.markets");
    if (resolvedBaseUrl) {
      resolvedBaseUrl = resolvedBaseUrl.replace(/\/v2\/?$/, '');
      resolvedBaseUrl = resolvedBaseUrl.replace(/\/+$/, '');
    }

    const config: any = {
      keyId,
      secretKey,
      secret: secretKey,
      baseUrl: resolvedBaseUrl,
      paper: isPaper,
      usePolygon: false
    };

    alpacaInstance = new Alpaca(config);
  }
  return alpacaInstance;
};

export const getMTClient = () => {
  const secrets = loadSecrets();
  const organizationID = process.env.MODERN_TREASURY_ORGANIZATION_ID || secrets.MODERN_TREASURY_ORGANIZATION_ID;
  const apiKey = process.env.MODERN_TREASURY_API_KEY || secrets.MODERN_TREASURY_API_KEY;
  if (!organizationID || !apiKey) {
    return null;
  }
  return new ModernTreasury({ organizationID, apiKey });
};

let octokitInstance: Octokit | null = null;
export const getOctokit = () => {
  if (!octokitInstance) {
    const token = process.env.GITHUB_ACCESS_TOKEN;
    if (!token) {
      throw new Error("GITHUB_ACCESS_TOKEN is required");
    }
    octokitInstance = new Octokit({ auth: token });
  }
  return octokitInstance;
};

export class GitHubAuditLogger {
  private repoName = process.env.GITHUB_AUDIT_REPO || "audit-logs";
  private owner: string | null = null;
  private isInitializing = false;
  private hasFailedPermanently = false;

  async init() {
    if (this.owner || this.isInitializing || this.hasFailedPermanently) return;
    this.isInitializing = true;
    try {
      const octokit = getOctokit();
      const user = await octokit.rest.users.getAuthenticated();
      this.owner = user.data.login;

      try {
        await octokit.rest.repos.get({ owner: this.owner, repo: this.repoName });
      } catch (e: any) {
        if (e.status === 404) {
          try {
            await octokit.rest.repos.createForAuthenticatedUser({
              name: this.repoName,
              private: true,
              description: "Audit Vault",
            });
            await new Promise(r => setTimeout(r, 2000));
            await octokit.rest.repos.createOrUpdateFileContents({
              owner: this.owner,
              repo: this.repoName,
              path: "README.md",
              message: "Initialize Audit Vault",
              content: Buffer.from("# Audit Vault").toString("base64"),
            });
          } catch (createErr: any) {
            this.hasFailedPermanently = true;
            throw createErr;
          }
        } else {
          throw e;
        }
      }
    } catch (err: any) {
      this.hasFailedPermanently = true;
    } finally {
      this.isInitializing = false;
    }
  }

  async log(sessionId: string, fileName: string, data: any) {
    if (this.hasFailedPermanently) return;
    try {
      await this.init();
      if (!this.owner || this.hasFailedPermanently) return;
      
      const octokit = getOctokit();
      const path = `sessions/${sessionId}/${fileName}.json`;
      const content = JSON.stringify(data, null, 2);
      
      let sha: string | undefined;
      try {
        const existing = await octokit.rest.repos.getContent({
          owner: this.owner,
          repo: this.repoName,
          path,
        });
        if (!Array.isArray(existing.data)) {
          sha = (existing.data as any).sha;
        }
      } catch (e) {}

      await octokit.rest.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repoName,
        path,
        message: `Audit Log: ${sessionId} - ${fileName}`,
        content: Buffer.from(content).toString("base64"),
        sha,
      });
    } catch (err: any) {
      console.error(`Failed to log to GitHub (${fileName}):`, err);
    }
  }
}

export const auditLogger = new GitHubAuditLogger();

export const getGeminiClient = (req?: Request) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required");
  }

  let referer = process.env.APP_REFERER || "https://localhost:3000";
  if (req) {
    const rawReferer = req.headers.referer || req.headers.referrer;
    if (typeof rawReferer === "string" && rawReferer.trim() !== "") {
      referer = rawReferer;
    }
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
        'Referer': referer
      }
    }
  });
};

let stripeClient: Stripe | null = null;
export const getStripe = () => {
  if (!stripeClient) {
    const secrets = loadSecrets();
    const key = process.env.STRIPE_SECRET_KEY || secrets.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is missing");
    stripeClient = new Stripe(key);
  }
  return stripeClient;
};

let plaidClientInstance: PlaidApi | null = null;
export const getPlaidClient = () => {
  if (!plaidClientInstance) {
    const secrets = loadSecrets();
    const clientId = process.env.PLAID_CLIENT_ID || secrets.PLAID_CLIENT_ID;
    const secret = process.env.PLAID_SECRET || secrets.PLAID_SECRET;
    const env = process.env.PLAID_ENV || secrets.PLAID_ENV || 'sandbox';
    
    if (!clientId || !secret) throw new Error("Plaid credentials missing");

    const plaidConfig = new Configuration({
      basePath: PlaidEnvironments[env as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': clientId,
          'PLAID-SECRET': secret,
        },
      },
    });
    plaidClientInstance = new PlaidApi(plaidConfig);
  }
  return plaidClientInstance;
};

const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
export let adminDb: any = null;

if (fs.existsSync(firebaseConfigPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
    if (config.projectId) {
      initializeApp({
        projectId: config.projectId,
      });
      adminDb = getFirestore();
    }
  } catch (e) {
    console.error("Firebase Admin Init Error:", e);
  }
}

export const GITHUB_BACKEND = process.env.GITHUB_BACKEND || "";
export const CERT_DIR = process.env.CERT_DIR || "./certs";
export const TENANT_ID = process.env.TENANT_ID || "";

// Loaded as a comma-separated string from ENV
export const SOVEREIGN_USERS = process.env.SOVEREIGN_USERS 
  ? process.env.SOVEREIGN_USERS.split(',').map(u => u.trim()) 
  : [];

export let httpsAgent: https.Agent | null = null;
try {
  const crtPath = path.join(CERT_DIR, "root_authority.crt");
  const keyPath = path.join(CERT_DIR, "root_authority.key");
  if (fs.existsSync(crtPath) && fs.existsSync(keyPath)) {
    httpsAgent = new https.Agent({
      cert: fs.readFileSync(crtPath),
      key: fs.readFileSync(keyPath),
      keepAlive: true,
      rejectUnauthorized: false
    });
  }
} catch (e) {
  console.warn("mTLS Trust Agent Notice:", e);
}

export let mtEventsCache: any[] = [];
export let stripeEventsCache: any[] = [];

export let financialAccountsStore: any[] = [
  {
    object: "treasury.financial_account",
    id: "fa_123_singularity",
    status: "open",
    balance: { cash: { usd: 9000 } }
    // ... rest of mock object
  }
];

export const PRODUCT_CATALOG = [
  { id: "prod_agentic_compute", name: "Sovereign Agentic Compute Node", price: 49.00, description: "Dedicated TPU core allocation for autonomous agent execution." },
  { id: "prod_wealth_intelligence", name: "Quantum Wealth Advisor License", price: 99.00, description: "Advanced predictive ledger algorithms & high-net-worth macro indexing." },
  { id: "prod_privacy_shield", name: "Sovereign Shield Encryption Node", price: 29.00, description: "Double-blinded on-chain data privacy guardian." }
];

export function parseOFXAccountBlock(block: string, org: string, fid: string, idx: number, accounts: any[], transactions: any[]) {
  const bankIdMatch = block.match(/<BANKID>(.*?)(?=\r|\n|<)/i);
  const acctIdMatch = block.match(/<ACCTID>(.*?)(?=\r|\n|<)/i);
  const acctTypeMatch = block.match(/<ACCTTYPE>(.*?)(?=\r|\n|<)/i);
  const balAmtMatch = block.match(/<BALAMT>(.*?)(?=\r|\n|<)/i);

  const bankId = bankIdMatch ? bankIdMatch[1].trim() : '003456789';
  const acctId = acctIdMatch ? acctIdMatch[1].trim() : `CKG-${idx + 1}`;
  const acctType = acctTypeMatch ? acctTypeMatch[1].trim() : 'CHECKING';
  const ledgerBalance = balAmtMatch ? parseFloat(balAmtMatch[1].trim()) : 0;

  accounts.push({ id: acctId, bankId, acctId, acctType, org, fid, ledgerBalance, currency: 'USD' });

  const trnRegex = /<STMTTRN>([\s\S]*?)(?=(?:<\/STMTTRN>|<STMTTRN>|<\/BANKTRANLIST>|$))/gi;
  let trnMatch;
  while ((trnMatch = trnRegex.exec(block)) !== null) {
    const trnContent = trnMatch[1];
    const typeM = trnContent.match(/<TRNTYPE>(.*?)(?=\r|\n|<)/i);
    const dateM = trnContent.match(/<DTPOSTED>(.*?)(?=\r|\n|<)/i);
    const amtM = trnContent.match(/<TRNAMT>(.*?)(?=\r|\n|<)/i);
    const fitidM = trnContent.match(/<FITID>(.*?)(?=\r|\n|<)/i);
    const nameM = trnContent.match(/<NAME>(.*?)(?=\r|\n|<)/i);

    if (fitidM || amtM) {
      transactions.push({
        id: fitidM ? fitidM[1].trim() : `TRN-${Date.now()}`,
        accountId: acctId,
        type: typeM ? typeM[1].trim() : 'DEBIT',
        postedDate: dateM ? dateM[1].trim() : '20240101',
        amount: amtM ? parseFloat(amtM[1].trim()) : 0,
        name: nameM ? nameM[1].trim() : 'TRANSACTION'
      });
    }
  }
}

export function parseOFXContent(ofxText: string) {
  const accounts: any[] = [];
  const transactions: any[] = [];
  const orgMatch = ofxText.match(/<ORG>(.*?)(?=\r|\n|<)/i);
  const fidMatch = ofxText.match(/<FID>(.*?)(?=\r|\n|<)/i);
  const org = orgMatch ? orgMatch[1].trim() : 'Unknown Bank';
  const fid = fidMatch ? fidMatch[1].trim() : '00000';

  const stmtBlocks = ofxText.split(/<STMTTRNRS>/i).slice(1);
  stmtBlocks.forEach((block, idx) => parseOFXAccountBlock(block, org, fid, idx, accounts, transactions));

  return { organization: org, fid, accountCount: accounts.length, transactionCount: transactions.length, accounts, transactions };
  }
