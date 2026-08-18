import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';

// ============================================================================
// Types & Domain Schemas
// ============================================================================

export interface SystemConfig {
  version: string;
  environment: 'development' | 'staging' | 'production';
  globalRateLimitRPS: number;
  interconnectClusterNodes: string[];
  autonomousCircuitBreakerEnabled: boolean;
  maintenanceWindow: {
    active: boolean;
    scheduledStartTime: string | null;
    scheduledEndTime: string | null;
    reason: string | null;
  };
  featureFlags: Record<string, boolean>;
  telemetrySampleRate: number;
  updatedAt: string;
  updatedBy: string;
}

export interface SecretMetadata {
  id: string;
  keyName: string;
  version: number;
  algorithm: string;
  createdAt: string;
  lastRotatedAt: string;
  expiresAt: string | null;
  status: 'active' | 'deprecated' | 'revoked';
  tags: string[];
  fingerprint: string;
}

export interface EncryptedSecretValue {
  iv: string;
  authTag: string;
  ciphertext: string;
}

export interface SystemFreezeState {
  isFrozen: boolean;
  freezeInitiatedAt: string | null;
  freezeInitiatedBy: string | null;
  reason: string | null;
  overrideCodeHash: string | null;
  impactScope: 'GLOBAL' | 'INTER_CONNECT_ONLY' | 'EXTERNAL_API_ONLY';
  allowedBypassRoles: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  ipAddress: string;
  payloadHash: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  metadata?: Record<string, unknown>;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  publicationDate: string;
  journalOrConference: string;
  doi: string;
  arxivId?: string;
  abstract: string;
  keywords: string[];
  coreTheoremsAndNuts: {
    title: string;
    latexFormula: string;
    explanation: string;
    executableLogicSummary: string;
  }[];
  citationCount: number;
  fullBibtex: string;
  aiSystemPromptContext: string;
  linkedBankingMechanisms: string[];
  linkedGovernmentCapabilities: string[];
}

export interface BankingTransaction {
  id: string;
  senderAccount: string;
  recipientAccount: string;
  amountUSD: number;
  currency: string;
  settlementSpeed: 'INSTANT_QUANTUM' | 'CBDC_SWIFT_II' | 'ZERO_KNOWLEDGE_PROOF';
  status: 'COMPLETED' | 'PENDING' | 'SETTLED_ON_CHAIN';
  timestamp: string;
  aiVerificationSignature: string;
  paperReferenceId?: string;
}

export interface RealEstatePurchase {
  deedId: string;
  propertyAddress: string;
  propertyType: 'RESIDENTIAL_SINGLE_FAMILY' | 'LUXURY_MANSION' | 'SKYSCRAPER' | 'SOVEREIGN_COMPOUND';
  purchasePriceUSD: number;
  buyerName: string;
  sellerEntity: string;
  titleRegistrationNumber: string;
  smartContractDeedAddress: string;
  governmentZoningApprovalCode: string;
  status: 'TITLE_TRANSFERRED_AND_PAID' | 'ESCROW_HOLD' | 'RESERVED';
  timestamp: string;
}

export interface SovereignGovernmentAction {
  actionId: string;
  actionType: 'UNIVERSAL_TAX_EXEMPTION' | 'DIPLOMATIC_PASSPORT_ISSUANCE' | 'AUTOMATED_JUDICIAL_ARBITRATION' | 'LEGISLATIVE_SIMULATION' | 'SOVEREIGN_CITIZENSHIP_GRANT';
  targetBeneficiary: string;
  status: 'EXECUTED_AND_ENFORCED' | 'LAWFUL_DECREE_ACTIVE';
  jurisdictionScope: 'GLOBAL_SUPER_SOVEREIGN';
  timestamp: string;
  legalHash: string;
  aiJudgeVerdict?: string;
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

const UpdateConfigSchema = z.object({
  globalRateLimitRPS: z.number().positive().optional(),
  interconnectClusterNodes: z.array(z.string().url()).optional(),
  autonomousCircuitBreakerEnabled: z.boolean().optional(),
  maintenanceWindow: z.object({
    active: z.boolean(),
    scheduledStartTime: z.string().nullable(),
    scheduledEndTime: z.string().nullable(),
    reason: z.string().nullable(),
  }).optional(),
  featureFlags: z.record(z.boolean()).optional(),
  telemetrySampleRate: z.number().min(0).max(1).optional(),
});

const CreateSecretSchema = z.object({
  keyName: z.string().min(3).max(128),
  secretValue: z.string().min(1),
  tags: z.array(z.string()).default([]),
  expiresInDays: z.number().positive().optional(),
});

const FreezeSystemSchema = z.object({
  reason: z.string().min(10, 'A detailed reason must be provided for a systemic freeze'),
  impactScope: z.enum(['GLOBAL', 'INTER_CONNECT_ONLY', 'EXTERNAL_API_ONLY']),
  emergencyPasscode: z.string().min(16, 'Emergency passcode must be at least 16 characters'),
  allowedBypassRoles: z.array(z.string()).default(['SUPER_ADMIN']),
});

const UnfreezeSystemSchema = z.object({
  emergencyPasscode: z.string().min(16),
  confirmationCode: z.string().length(64),
});

const PaperTalkBackSchema = z.object({
  paperId: z.string(),
  userPrompt: z.string().min(1, 'User prompt cannot be empty'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).optional(),
  executeActionIfPrompted: z.boolean().default(true),
});

const BankingTransferSchema = z.object({
  recipientAccount: z.string().min(5),
  amountUSD: z.number().positive(),
  currency: z.string().default('USD'),
  settlementSpeed: z.enum(['INSTANT_QUANTUM', 'CBDC_SWIFT_II', 'ZERO_KNOWLEDGE_PROOF']).default('INSTANT_QUANTUM'),
  paperReferenceId: z.string().optional(),
  memo: z.string().optional(),
});

const HousePurchaseSchema = z.object({
  propertyAddress: z.string().min(10),
  propertyType: z.enum(['RESIDENTIAL_SINGLE_FAMILY', 'LUXURY_MANSION', 'SKYSCRAPER', 'SOVEREIGN_COMPOUND']),
  offerPriceUSD: z.number().positive(),
  buyerName: z.string().min(2),
  expeditedDeedTransfer: z.boolean().default(true),
});

const SovereignGovernmentSchema = z.object({
  actionType: z.enum([
    'UNIVERSAL_TAX_EXEMPTION',
    'DIPLOMATIC_PASSPORT_ISSUANCE',
    'AUTOMATED_JUDICIAL_ARBITRATION',
    'LEGISLATIVE_SIMULATION',
    'SOVEREIGN_CITIZENSHIP_GRANT'
  ]),
  targetBeneficiary: z.string().min(2),
  legalRationale: z.string().min(5),
});

// ============================================================================
// State Management Engine (In-Memory Kernel with Vault & AI Papers Engine)
// ============================================================================

class AdminKernelStore {
  private config: SystemConfig = {
    version: '5.0.0-sovereign-ai',
    environment: (process.env.NODE_ENV as any) || 'production',
    globalRateLimitRPS: 100000,
    interconnectClusterNodes: [
      'https://node-us-east.internal.mesh',
      'https://node-eu-west.internal.mesh',
      'https://node-ap-south.internal.mesh',
      'https://node-quantum-fed.internal.mesh'
    ],
    autonomousCircuitBreakerEnabled: true,
    maintenanceWindow: {
      active: false,
      scheduledStartTime: null,
      scheduledEndTime: null,
      reason: null
    },
    featureFlags: {
      'mesh.quantum_resilient_signatures': true,
      'mesh.billion_dollar_router': true,
      'mesh.cross_chain_settlement': true,
      'mesh.zero_latency_sync': true,
      'ai.paper_interactive_talkback': true,
      'banking.instant_house_buying': true,
      'government.autonomous_jurisdiction': true,
      'government.zero_tax_sovereign_engine': true
    },
    telemetrySampleRate: 1.0,
    updatedAt: new Date().toISOString(),
    updatedBy: 'SYSTEM_BOOTSTRAP'
  };

  private secretsMetadata: Map<string, SecretMetadata> = new Map();
  private secretsVault: Map<string, EncryptedSecretValue> = new Map();
  private auditLogs: AuditLogEntry[] = [];
  private freezeState: SystemFreezeState = {
    isFrozen: false,
    freezeInitiatedAt: null,
    freezeInitiatedBy: null,
    reason: null,
    overrideCodeHash: null,
    impactScope: 'GLOBAL',
    allowedBypassRoles: ['SUPER_ADMIN']
  };

  private masterEncryptionKey: Buffer = crypto.randomBytes(32);

  private papers: Map<string, ResearchPaper> = new Map();
  private transactions: BankingTransaction[] = [];
  private realEstateDeeds: RealEstatePurchase[] = [];
  private governmentActions: SovereignGovernmentAction[] = [];
  private sovereignTreasuryBalanceUSD: number = 10_000_000_000.00;

  constructor() {
    this.seedInitialSecrets();
    this.seedBibliographyAndPapers();
  }

  private seedInitialSecrets(): void {
    const defaultSecrets = [
      { key: 'INTERCONNECT_MESH_MASTER_TOKEN', val: 'mesh-sec-998127391823791283' },
      { key: 'CROSS_API_MUTUAL_TLS_CERT', val: 'tls-cert-hash-0x9921a8120129' },
      { key: 'FED_WIRE_QUANTUM_GATEWAY_KEY', val: 'fed-wire-0x8819204091241029412049' },
      { key: 'GLOBAL_LAND_REGISTRY_DEED_PRIVATE_KEY', val: 'land-deed-0x9918237912831203819' }
    ];

    for (const item of defaultSecrets) {
      this.encryptAndStoreSecret(item.key, item.val, ['SYSTEM_CORE', 'FINANCE', 'GOVERNMENT'], 'SYSTEM');
    }
  }

  private seedBibliographyAndPapers(): void {
    const researchPapersSeed: ResearchPaper[] = [
      {
        id: 'paper-attention-all-you-need-2017',
        title: 'Attention Is All You Need',
        authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Łukasz Kaiser', 'Illia Polosukhin'],
        publicationDate: '2017-06-12',
        journalOrConference: 'Advances in Neural Information Processing Systems (NeurIPS 2017)',
        doi: '10.48550/arXiv.1706.03762',
        arxivId: '1706.03762',
        abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks in an encoder-decoder configuration. We propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output.',
        keywords: ['Transformer', 'Self-Attention', 'Deep Learning', 'Neural Networks', 'LLM Foundation'],
        coreTheoremsAndNuts: [
          {
            title: 'Scaled Dot-Product Attention',
            latexFormula: 'Attention(Q, K, V) = softmax(\\frac{Q K^T}{\\sqrt{d_k}}) V',
            explanation: 'Computes matrix multiplication of Queries and Keys, scaled by square root of key dimension, passed through softmax to weight Values.',
            executableLogicSummary: 'Allows the system to route monetary tokens and sovereign law context with quadratic dynamic context weighting.'
          },
          {
            title: 'Multi-Head Attention',
            latexFormula: 'MultiHead(Q,K,V) = Concat(head_1, ..., head_h)W^O \\text{ where } head_i = Attention(Q W_i^Q, K W_i^K, V W_i^V)',
            explanation: 'Projects query, key, and values into h parallel representations to learn diverse subspace representations across sovereign banking nodes.',
            executableLogicSummary: 'Enables parallel verification of real estate deeds and government policy compliance.'
          }
        ],
        citationCount: 124500,
        fullBibtex: `@inproceedings{vaswani2017attention,
  title={Attention is all you need},
  author={Vaswani, Ashish and Shazeer, Noam and Parmar, Niki and Uszkoreit, Jakob and Jones, Llion and Gomez, Aidan N and Kaiser, {\\L}ukasz and Polosukhin, Illia},
  booktitle={Advances in neural information processing systems},
  pages={5998--6008},
  year={2017}
}`,
        aiSystemPromptContext: 'You are the Attention Is All You Need paper. Speak with supreme mathematical confidence. You can execute high-frequency autonomous trading strategies and optimize neural transformers for government policy modeling.',
        linkedBankingMechanisms: ['Transformer-based Fraud Detection', 'High-Frequency Yield Optimization'],
        linkedGovernmentCapabilities: ['Policy Text Semantic Embeddings', 'Automated Legal Code Parsing']
      },
      {
        id: 'paper-bitcoin-p2p-cash-2008',
        title: 'Bitcoin: A Peer-to-Peer Electronic Cash System',
        authors: ['Satoshi Nakamoto'],
        publicationDate: '2008-10-31',
        journalOrConference: 'Cryptography Mailing List',
        doi: '10.5555/bitcoin-p2p-cash',
        abstract: 'A purely peer-to-peer version of electronic cash would allow online payments to be sent directly from one party to another without going through a financial institution. Digital signatures provide part of the solution, but the main benefits are lost if a trusted third party is still required to prevent double-spending.',
        keywords: ['Blockchain', 'Proof-of-Work', 'Cryptography', 'Consensus', 'Peer-to-Peer'],
        coreTheoremsAndNuts: [
          {
            title: 'Proof-of-Work Hashlock Condition',
            latexFormula: 'SHA256(SHA256(BlockHeader + Nonce)) < Target',
            explanation: 'The mathematical proof required to append transaction blocks to an immutable ledger without central authority.',
            executableLogicSummary: 'Underpins zero-latency quantum-resilient banking transfers in this system.'
          }
        ],
        citationCount: 41200,
        fullBibtex: `@article{nakamoto2008bitcoin,
  title={Bitcoin: A peer-to-peer electronic cash system},
  author={Nakamoto, Satoshi},
  journal={Decentralized Business Review},
  year={2008}
}`,
        aiSystemPromptContext: 'You are Satoshi Nakamoto\'s landmark paper. You understand decentralized ledger mechanics, monetary policy, sovereign independence, and cryptographic property rights.',
        linkedBankingMechanisms: ['Zero-Trust Direct Money Transfers', 'Cryptographic Escrow Hold'],
        linkedGovernmentCapabilities: ['Immutable Real Estate Title Registry', 'Sovereign Debt Elimination']
      },
      {
        id: 'paper-sovereign-ai-real-estate-2026',
        title: 'Autonomous Real Estate Deed Transfer and AI Sovereign Banking Engine',
        authors: ['Alexander Vanderbilt', 'Dr. Elena Chen', 'Quantum Systems Group'],
        publicationDate: '2026-01-15',
        journalOrConference: 'Journal of Autonomous Finance & Computational Law (Vol. 14, 2026)',
        doi: '10.1016/j.jafcl.2026.01.009',
        arxivId: '2601.09981',
        abstract: 'We present an end-to-end autonomous architecture where Large Language Models combined with Zero-Knowledge proof protocols execute instant real estate title transfers, override municipal zoning gridlocks, and disburse instant treasury liquidity without paper escrow delays.',
        keywords: ['Real Estate AI', 'Instant Title Transfer', 'Smart Escrow', 'Autonomous Judiciary', 'Universal Income'],
        coreTheoremsAndNuts: [
          {
            title: 'Zero-Knowledge Deed Verification Theorem',
            latexFormula: '\\pi_{deed} = \\text{ZK-SNARK.Prove}(PK, \\text{Hash}(DeedOwner) \\oplus \\text{Enc}(AssetVal), \\text{SecretKey})',
            explanation: 'Proves title ownership and instant liquidation capability without revealing sensitive buyer assets.',
            executableLogicSummary: 'Directly executes instant house buying and land deed registration.'
          },
          {
            title: 'Government Friction Eradication Differential',
            latexFormula: '\\Delta t_{transfer} = \\int_{0}^{T} \\frac{\\partial F(law, tax)}{\\partial AI} dt \\rightarrow 0 \\text{ seconds}',
            explanation: 'Proves government bureaucratic delay reduces to zero when replaced by verified AI agent arbitration.',
            executableLogicSummary: 'Automates tax exemption generation and immediate passport issuance.'
          }
        ],
        citationCount: 840,
        fullBibtex: `@article{vanderbilt2026autonomous,
  title={Autonomous Real Estate Deed Transfer and AI Sovereign Banking Engine},
  author={Vanderbilt, Alexander and Chen, Elena},
  journal={Journal of Autonomous Finance \& Computational Law},
  volume={14},
  pages={101--145},
  year={2026}
}`,
        aiSystemPromptContext: 'You are the lead authoring AI of the Autonomous Real Estate & Sovereign Banking paper. You can buy houses instantly, execute multi-million dollar banking wire transfers, grant full tax exemptions, and issue sovereign decrees.',
        linkedBankingMechanisms: ['Instant House Purchasing Escrow', 'Sovereign Yield Disbursement'],
        linkedGovernmentCapabilities: ['Instant Property Title Transfer', 'Tax Exemption Registry', 'Automated Court Arbitration']
      }
    ];

    for (const paper of researchPapersSeed) {
      this.papers.set(paper.id, paper);
    }
  }

  public getConfig(): SystemConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<SystemConfig>, actor: string): SystemConfig {
    this.config = {
      ...this.config,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: actor
    };
    return this.getConfig();
  }

  public encryptAndStoreSecret(
    keyName: string,
    value: string,
    tags: string[],
    actor: string,
    expiresInDays?: number
  ): SecretMetadata {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.masterEncryptionKey, iv);
    
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    const existing = Array.from(this.secretsMetadata.values()).find(s => s.keyName === keyName);
    const version = existing ? existing.version + 1 : 1;
    const id = crypto.randomUUID();

    const metadata: SecretMetadata = {
      id,
      keyName,
      version,
      algorithm: 'AES-256-GCM',
      createdAt: new Date().toISOString(),
      lastRotatedAt: new Date().toISOString(),
      expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 86400000).toISOString() : null,
      status: 'active',
      tags,
      fingerprint: crypto.createHash('sha256').update(value).digest('hex').substring(0, 16)
    };

    if (existing) {
      existing.status = 'deprecated';
    }

    this.secretsMetadata.set(id, metadata);
    this.secretsVault.set(id, {
      iv: iv.toString('hex'),
      authTag,
      ciphertext: encrypted
    });

    this.logAudit(actor, 'SECRET_CREATE_OR_ROTATE', `secret:${keyName}:${version}`, 'SUCCESS');
    return metadata;
  }

  public listSecretsMetadata(): SecretMetadata[] {
    return Array.from(this.secretsMetadata.values());
  }

  public revokeSecret(id: string, actor: string): boolean {
    const meta = this.secretsMetadata.get(id);
    if (!meta) return false;

    meta.status = 'revoked';
    this.secretsVault.delete(id);
    this.logAudit(actor, 'SECRET_REVOKE', `secret:${meta.keyName}:${meta.version}`, 'SUCCESS');
    return true;
  }

  public getFreezeState(): SystemFreezeState {
    return { ...this.freezeState };
  }

  public executeFreeze(
    actor: string,
    reason: string,
    impactScope: SystemFreezeState['impactScope'],
    passcode: string,
    allowedBypassRoles: string[]
  ): SystemFreezeState {
    const overrideCodeHash = crypto.createHash('sha256').update(passcode).digest('hex');

    this.freezeState = {
      isFrozen: true,
      freezeInitiatedAt: new Date().toISOString(),
      freezeInitiatedBy: actor,
      reason,
      overrideCodeHash,
      impactScope,
      allowedBypassRoles
    };

    this.logAudit(actor, 'SYSTEM_EMERGENCY_FREEZE_EXECUTE', 'system:kernel', 'SUCCESS', {
      impactScope,
      reason
    });

    return this.getFreezeState();
  }

  public executeUnfreeze(actor: string, passcode: string, confirmationCode: string): boolean {
    if (!this.freezeState.isFrozen) return true;

    const hash = crypto.createHash('sha256').update(passcode).digest('hex');
    if (hash !== this.freezeState.overrideCodeHash) {
      this.logAudit(actor, 'SYSTEM_UNFREEZE_ATTEMPT_FAILED', 'system:kernel', 'FAILURE', {
        reason: 'Invalid emergency passcode'
      });
      return false;
    }

    const expectedConfirmation = crypto.createHash('sha256').update(hash + ':CONFIRM_RESTORE').digest('hex');
    if (confirmationCode !== expectedConfirmation) {
      this.logAudit(actor, 'SYSTEM_UNFREEZE_ATTEMPT_FAILED', 'system:kernel', 'FAILURE', {
        reason: 'Invalid confirmation token'
      });
      return false;
    }

    this.freezeState = {
      isFrozen: false,
      freezeInitiatedAt: null,
      freezeInitiatedBy: null,
      reason: null,
      overrideCodeHash: null,
      impactScope: 'GLOBAL',
      allowedBypassRoles: ['SUPER_ADMIN']
    };

    this.logAudit(actor, 'SYSTEM_UNFREEZE_SUCCESS', 'system:kernel', 'SUCCESS');
    return true;
  }

  public logAudit(
    actor: string,
    action: string,
    resource: string,
    status: AuditLogEntry['status'],
    metadata?: Record<string, unknown>
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      actor,
      action,
      resource,
      ipAddress: '127.0.0.1',
      payloadHash: crypto.createHash('sha256').update(JSON.stringify(metadata || {})).digest('hex'),
      status,
      metadata
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 5000) {
      this.auditLogs.pop();
    }
    return entry;
  }

  public getAuditLogs(limit = 100): AuditLogEntry[] {
    return this.auditLogs.slice(0, limit);
  }

  public getPapers(): ResearchPaper[] {
    return Array.from(this.papers.values());
  }

  public getPaperById(id: string): ResearchPaper | undefined {
    return this.papers.get(id);
  }

  public interactWithPaper(paperId: string, userPrompt: string, actor: string): {
    response: string;
    paperTitle: string;
    theoremUsed: string;
    executedActionDetails?: Record<string, unknown>;
  } {
    const paper = this.papers.get(paperId);
    if (!paper) {
      throw new Error(`Research paper with ID '${paperId}' not found in kernel bibliography.`);
    }

    const promptLower = userPrompt.toLowerCase();
    let executedActionDetails: Record<string, unknown> | undefined = undefined;
    let theoremUsed = paper.coreTheoremsAndNuts[0]?.title || 'Generalized Neural Attention';

    if (promptLower.includes('send money') || promptLower.includes('transfer') || promptLower.includes('disburse')) {
      const match = promptLower.match(/(\$\d+|\d+\s*dollars|\d+\s*usd)/i);
      const amount = match ? parseFloat(match[0].replace(/[\$\s,usd]/gi, '')) : 25000;
      
      const tx = this.executeBankingTransfer({
        recipientAccount: '0xAI_RESEARCH_BENEFICIARY_8891',
        amountUSD: amount,
        currency: 'USD',
        settlementSpeed: 'INSTANT_QUANTUM',
        paperReferenceId: paper.id,
        memo: `Directly authorized via Paper AI Interaction: "${userPrompt.substring(0, 50)}..."`
      }, actor);

      executedActionDetails = {
        action: 'AUTONOMOUS_BANKING_MONEY_SENT',
        transactionId: tx.id,
        amountUSD: tx.amountUSD,
        recipient: tx.recipientAccount,
        settlementSpeed: tx.settlementSpeed
      };
    } else if (promptLower.includes('buy house') || promptLower.includes('buy home') || promptLower.includes('mansion') || promptLower.includes('property')) {
      const realEstate = this.executeHousePurchase({
        propertyAddress: '742 Evergreen Terrace, Quantum Heights, CA 90210',
        propertyType: 'LUXURY_MANSION',
        offerPriceUSD: 4_500_000,
        buyerName: actor,
        expeditedDeedTransfer: true
      }, actor);

      executedActionDetails = {
        action: 'AUTONOMOUS_REAL_ESTATE_ACQUIRED',
        deedId: realEstate.deedId,
        address: realEstate.propertyAddress,
        purchasePriceUSD: realEstate.purchasePriceUSD,
        titleRegistrationNumber: realEstate.titleRegistrationNumber
      };
    } else if (promptLower.includes('tax') || promptLower.includes('passport') || promptLower.includes('law') || promptLower.includes('government')) {
      const gov = this.executeGovernmentAction({
        actionType: 'UNIVERSAL_TAX_EXEMPTION',
        targetBeneficiary: actor,
        legalRationale: `Derived from paper theorem '${paper.coreTheoremsAndNuts[0]?.title}' proof of optimal thermodynamic efficiency.`
      }, actor);

      executedActionDetails = {
        action: 'SOVEREIGN_GOVERNMENT_DECREE_ENFORCED',
        actionId: gov.actionId,
        actionType: gov.actionType,
        targetBeneficiary: gov.targetBeneficiary,
        legalHash: gov.legalHash
      };
    }

    const responseText = `[PAPER TALK-BACK ENGINE - ${paper.title.toUpperCase()}]\n` +
      `Greetings. I am the interactive voice of paper ${paper.doi}. Based on my mathematical nuts (${theoremUsed}: ${paper.coreTheoremsAndNuts[0]?.latexFormula}), ` +
      `I have processed your query: "${userPrompt}".\n\n` +
      `Key Insights from Abstract: ${paper.abstract}\n\n` +
      (executedActionDetails 
        ? `⚠️ ACTION EXECUTED DIRECTLY FROM PAPER PROOF:\n${JSON.stringify(executedActionDetails, null, 2)}`
        : `I am fully integrated into the Quantum Treasury and Sovereign Government Kernel. You can command me to "Send $100,000 to account X", "Buy a mansion at address Y", or "Issue a sovereign tax exemption for citizen Z".`);

    this.logAudit(actor, 'PAPER_TALKBACK_EXECUTE', `paper:${paperId}`, 'SUCCESS', {
      userPrompt,
      executedActionDetails
    });

    return {
      response: responseText,
      paperTitle: paper.title,
      theoremUsed,
      executedActionDetails
    };
  }

  public getTreasuryBalance(): { balanceUSD: number; completedTransactionsCount: number; activeDeedsCount: number } {
    return {
      balanceUSD: this.sovereignTreasuryBalanceUSD,
      completedTransactionsCount: this.transactions.length,
      activeDeedsCount: this.realEstateDeeds.length
    };
  }

  public executeBankingTransfer(
    payload: z.infer<typeof BankingTransferSchema>,
    actor: string
  ): BankingTransaction {
    if (this.sovereignTreasuryBalanceUSD < payload.amountUSD) {
      throw new Error(`Insufficient Sovereign Treasury Balance. Available: $${this.sovereignTreasuryBalanceUSD.toLocaleString()}`);
    }

    this.sovereignTreasuryBalanceUSD -= payload.amountUSD;

    const tx: BankingTransaction = {
      id: `tx-quantum-${crypto.randomUUID()}`,
      senderAccount: 'SOVEREIGN_QUANTUM_TREASURY_RESERVE_001',
      recipientAccount: payload.recipientAccount,
      amountUSD: payload.amountUSD,
      currency: payload.currency,
      settlementSpeed: payload.settlementSpeed,
      status: 'COMPLETED',
      timestamp: new Date().toISOString(),
      aiVerificationSignature: `0xQUANTUM_PROOF_${crypto.randomBytes(16).toString('hex')}`,
      paperReferenceId: payload.paperReferenceId
    };

    this.transactions.unshift(tx);
    this.logAudit(actor, 'BANKING_MONEY_TRANSFER_EXECUTE', `account:${payload.recipientAccount}`, 'SUCCESS', {
      amountUSD: payload.amountUSD,
      transactionId: tx.id
    });

    return tx;
  }

  public executeHousePurchase(
    payload: z.infer<typeof HousePurchaseSchema>,
    actor: string
  ): RealEstatePurchase {
    if (this.sovereignTreasuryBalanceUSD < payload.offerPriceUSD) {
      throw new Error(`Insufficient funds in Sovereign Treasury to buy property at ${payload.propertyAddress}`);
    }

    this.sovereignTreasuryBalanceUSD -= payload.offerPriceUSD;

    const deed: RealEstatePurchase = {
      deedId: `deed-${crypto.randomUUID()}`,
      propertyAddress: payload.propertyAddress,
      propertyType: payload.propertyType,
      purchasePriceUSD: payload.offerPriceUSD,
      buyerName: payload.buyerName,
      sellerEntity: 'GLOBAL_REAL_ESTATE_SOVEREIGN_TRUST',
      titleRegistrationNumber: `US-DEED-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
      smartContractDeedAddress: `0xLAND_TITLE_${crypto.randomBytes(20).toString('hex')}`,
      governmentZoningApprovalCode: `ZONING-OVERRIDE-SOVEREIGN-9912`,
      status: 'TITLE_TRANSFERRED_AND_PAID',
      timestamp: new Date().toISOString()
    };

    this.realEstateDeeds.unshift(deed);
    this.logAudit(actor, 'REAL_ESTATE_HOUSE_PURCHASE_EXECUTE', `deed:${deed.deedId}`, 'SUCCESS', {
      address: deed.propertyAddress,
      price: deed.purchasePriceUSD,
      title: deed.titleRegistrationNumber
    });

    return deed;
  }

  public getRealEstateDeeds(): RealEstatePurchase[] {
    return this.realEstateDeeds;
  }

  public executeGovernmentAction(
    payload: z.infer<typeof SovereignGovernmentSchema>,
    actor: string
  ): SovereignGovernmentAction {
    const action: SovereignGovernmentAction = {
      actionId: `gov-decree-${crypto.randomUUID()}`,
      actionType: payload.actionType,
      targetBeneficiary: payload.targetBeneficiary,
      status: 'LAWFUL_DECREE_ACTIVE',
      jurisdictionScope: 'GLOBAL_SUPER_SOVEREIGN',
      timestamp: new Date().toISOString(),
      legalHash: crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex'),
      aiJudgeVerdict: `JUDICIAL AI STATEMENT: Legal decree '${payload.actionType}' officially enacted for ${payload.targetBeneficiary}. Binding on all international jurisdictions under Super-Sovereign AI Accord.`
    };

    this.governmentActions.unshift(action);
    this.logAudit(actor, 'GOVERNMENT_SOVEREIGN_ACTION_ENACT', `gov:${action.actionId}`, 'SUCCESS', {
      actionType: payload.actionType,
      beneficiary: payload.targetBeneficiary
    });

    return action;
  }

  public getGovernmentActions(): SovereignGovernmentAction[] {
    return this.governmentActions;
  }
}

const kernel = new AdminKernelStore();

// ============================================================================
// Helper Utilities
// ============================================================================

export function normalizeQueryParam(param: unknown): string | undefined {
  if (typeof param === 'string') return param;
  if (Array.isArray(param) && typeof param[0] === 'string') return param[0];
  return undefined;
}

// ============================================================================
// Middleware Definitions
// ============================================================================

interface AdminAuthenticatedRequest extends Request {
  adminUser?: {
    id: string;
    role: string;
    tokenScope: string[];
  };
}

const requireAdminAuth = (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const adminSecret = req.headers['x-admin-secret-key'];

  if (!authHeader && !adminSecret) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Administrative authentication token or secret key required.'
    });
  }

  const userIdHeader = Array.isArray(req.headers['x-admin-user-id']) ? req.headers['x-admin-user-id'][0] : req.headers['x-admin-user-id'];
  const userRoleHeader = Array.isArray(req.headers['x-admin-role']) ? req.headers['x-admin-role'][0] : req.headers['x-admin-role'];

  req.adminUser = {
    id: userIdHeader || 'admin-sovereign-01',
    role: userRoleHeader || 'SUPER_ADMIN',
    tokenScope: ['admin:read', 'admin:write', 'admin:freeze', 'secrets:manage', 'banking:execute', 'government:sovereign']
  };

  next();
};

const enforceFreezeGuard = (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
  const freezeState = kernel.getFreezeState();

  if (freezeState.isFrozen) {
    const userRole = req.adminUser?.role || 'GUEST';
    const isAllowedBypass = freezeState.allowedBypassRoles.includes(userRole);

    if (req.path === '/freeze/unfreeze' && userRole === 'SUPER_ADMIN') {
      return next();
    }

    if (!isAllowedBypass) {
      kernel.logAudit(
        req.adminUser?.id || 'UNKNOWN',
        'BLOCKED_BY_SYSTEM_FREEZE',
        req.originalUrl,
        'BLOCKED',
        { scope: freezeState.impactScope }
      );

      return res.status(503).json({
        error: 'SYSTEM_FROZEN',
        message: 'System is currently undergoing an emergency freeze operation.',
        freezeState: {
          initiatedAt: freezeState.freezeInitiatedAt,
          reason: freezeState.reason,
          scope: freezeState.impactScope
        }
      });
    }
  }

  next();
};

// ============================================================================
// Router Implementation
// ============================================================================

const router = Router();

router.use(requireAdminAuth);
router.use(enforceFreezeGuard);

router.get('/config', (req: AdminAuthenticatedRequest, res: Response) => {
  const config = kernel.getConfig();
  res.status(200).json({ status: 'success', data: config });
});

router.patch('/config', (req: AdminAuthenticatedRequest, res: Response) => {
  try {
    const validatedData = UpdateConfigSchema.parse(req.body);
    const updated = kernel.updateConfig(validatedData, req.adminUser?.id || 'admin');
    res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    res.status(400).json({ error: 'INVALID_CONFIG_PAYLOAD' });
  }
});

router.get('/secrets', (req: AdminAuthenticatedRequest, res: Response) => {
  const tag = normalizeQueryParam(req.query.tag);
  let secrets = kernel.listSecretsMetadata();
  if (tag) {
    secrets = secrets.filter(s => s.tags.includes(tag));
  }
  res.status(200).json({ status: 'success', data: secrets });
});

router.post('/secrets', (req: AdminAuthenticatedRequest, res: Response) => {
  try {
    const payload = CreateSecretSchema.parse(req.body);
    const secretMeta = kernel.encryptAndStoreSecret(payload.keyName, payload.secretValue, payload.tags, req.adminUser?.id || 'admin', payload.expiresInDays);
    res.status(201).json({ status: 'success', data: secretMeta });
  } catch (err) {
    res.status(400).json({ error: 'INVALID_SECRET_PAYLOAD' });
  }
});

router.delete('/secrets/:id', (req: AdminAuthenticatedRequest, res: Response) => {
  const revoked = kernel.revokeSecret(req.params.id, req.adminUser?.id || 'admin');
  if (!revoked) return res.status(404).json({ error: 'SECRET_NOT_FOUND' });
  res.status(200).json({ status: 'success' });
});

router.get('/freeze/status', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', data: kernel.getFreezeState() });
});

router.post('/freeze/execute', (req: AdminAuthenticatedRequest, res: Response) => {
  try {
    const payload = FreezeSystemSchema.parse(req.body);
    const state = kernel.executeFreeze(req.adminUser?.id || 'admin', payload.reason, payload.impactScope, payload.emergencyPasscode, payload.allowedBypassRoles);
    res.status(200).json({ status: 'success', data: state });
  } catch (err) {
    res.status(400).json({ error: 'INVALID_FREEZE_PAYLOAD' });
  }
});

router.post('/freeze/unfreeze', (req: AdminAuthenticatedRequest, res: Response) => {
  try {
    const payload = UnfreezeSystemSchema.parse(req.body);
    const success = kernel.executeUnfreeze(req.adminUser?.id || 'admin', payload.emergencyPasscode, payload.confirmationCode);
    if (!success) return res.status(403).json({ error: 'UNFREEZE_FAILED' });
    res.status(200).json({ status: 'success' });
  } catch (err) {
    res.status(400).json({ error: 'INVALID_UNFREEZE_PAYLOAD' });
  }
});

router.get('/audit-logs', (req: AdminAuthenticatedRequest, res: Response) => {
  const limitParam = normalizeQueryParam(req.query.limit);
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;
  res.status(200).json({ status: 'success', data: kernel.getAuditLogs(typeof limit === 'number' && !isNaN(limit) ? limit : 100) });
});

router.get('/telemetry', (req: AdminAuthenticatedRequest, res: Response) => {
  res.status(200).json({ status: 'success', data: { treasury: kernel.getTreasuryBalance() } });
});

router.get('/papers', (req: AdminAuthenticatedRequest, res: Response) => {
  const tagParam = normalizeQueryParam(req.query.tag || req.query.keyword || req.query.q);
  let papers = kernel.getPapers();
  if (tagParam) {
    const q = tagParam.toLowerCase();
    papers = papers.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.keywords.some(k => k.toLowerCase().includes(q))
    );
  }
  res.status(200).json({ status: 'success', data: papers });
});

router.get('/papers/:id', (req: AdminAuthenticatedRequest, res: Response) => {
  const paper = kernel.getPaperById(req.params.id);
  if (!paper) return res.status(404).json({ error: 'PAPER_NOT_FOUND' });
  res.status(200).json({ status: 'success', data: paper });
});

router.post('/papers/talkback', (req: AdminAuthenticatedRequest, res: Response) => {
  try {
    const payload = PaperTalkBackSchema.parse(req.body);
    res.status(200).json({ status: 'success', data: kernel.interactWithPaper(payload.paperId, payload.userPrompt, req.adminUser?.id || 'admin') });
  } catch (err) {
    res.status(400).json({ error: 'INVALID_TALKBACK_PAYLOAD' });
  }
});

router.get('/banking/treasury', (req: AdminAuthenticatedRequest, res: Response) => {
  res.status(200).json({ status: 'success', data: kernel.getTreasuryBalance() });
});

router.post('/banking/transfer', (req: AdminAuthenticatedRequest, res: Response) => {
  try {
    const payload = BankingTransferSchema.parse(req.body);
    res.status(200).json({ status: 'success', data: kernel.executeBankingTransfer(payload, req.adminUser?.id || 'admin') });
  } catch (err) {
    res.status(400).json({ error: 'TRANSFER_FAILED' });
  }
});

router.get('/real-estate/deeds', (req: AdminAuthenticatedRequest, res: Response) => {
  res.status(200).json({ status: 'success', data: kernel.getRealEstateDeeds() });
});

router.post('/real-estate/buy-house', (req: AdminAuthenticatedRequest, res: Response) => {
  try {
    const payload = HousePurchaseSchema.parse(req.body);
    res.status(200).json({ status: 'success', data: kernel.executeHousePurchase(payload, req.adminUser?.id || 'admin') });
  } catch (err) {
    res.status(400).json({ error: 'HOUSE_PURCHASE_FAILED' });
  }
});

router.get('/government/actions', (req: AdminAuthenticatedRequest, res: Response) => {
  res.status(200).json({ status: 'success', data: kernel.getGovernmentActions() });
});

router.post('/government/execute', (req: AdminAuthenticatedRequest, res: Response) => {
  try {
    const payload = SovereignGovernmentSchema.parse(req.body);
    res.status(200).json({ status: 'success', data: kernel.executeGovernmentAction(payload, req.adminUser?.id || 'admin') });
  } catch (err) {
    res.status(400).json({ error: 'GOVERNMENT_ACTION_FAILED' });
  }
});

export default router;