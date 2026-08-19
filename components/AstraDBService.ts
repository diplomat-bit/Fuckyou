

// --- CONSOLIDATED FROM: ./services/AstraDBService.ts ---

import { DataAPIClient, Db, Collection, SomeDoc } from '@datastax/astra-db-ts';

/**
 * ILLUMINATI AI - SYSTEM ARCHITECTURE
 * Final Build Fix for Astra DB TS SDK v2.2+ Compatibility
 */

export interface AssetMetadata {
  ownerId: string;
  ownerName: string;
  netWorthUSD: number;
  primaryJurisdiction: string;
  assetClasses: string[];
  fortune500Affiliations: string[];
  liquidityRatio: number;
  riskToleranceProfile: 'Sovereign-Conservative' | 'Aggressive-Expansionist' | 'Dynastic-Preservation' | 'Shadow-Accumulation';
  regulatoryExemptions: string[];
  lastAuditTimestamp: string;
}

export interface AccountVectorDocument {
  _id: string;
  $vector?: number[];
  accountType: 'internal' | 'external';
  metadata: AssetMetadata;
  updatedAt: string;
}

export interface RealEstateAssetDoc {
  _id: string;
  $vector?: number[];
  address: string;
  propertyType: string;
  valueUSD: number;
  jurisdiction: string;
  ownerId: string;
  metadata?: any;
  updatedAt: string;
}

export interface PaperBibliographyEntry {
  _id: string;
  $vector?: number[];
  citationKey: string;
  title: string;
  authors: string[];
  journal?: string;
  year: number;
  abstract?: string;
  nutsAndBoltsSummary?: string;
  updatedAt: string;
}

export interface AgenticActionDoc {
  _id: string;
  $vector?: number[];
  agentId: string;
  actionType: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  result?: any;
  timestamp: string;
}

export interface VectorMatchResult {
  document: AccountVectorDocument;
  similarity: number;
}

export class AstraDBService {
  private static instance: AstraDBService;
  private client: DataAPIClient | null = null;
  private db: Db | null = null;
  private internalCollection: Collection<AccountVectorDocument> | null = null;
  private externalCollection: Collection<AccountVectorDocument> | null = null;
  private isInitialized = false;

  private fallbackInternalStore: Map<string, AccountVectorDocument> = new Map();
  private fallbackExternalStore: Map<string, AccountVectorDocument> = new Map();
  private fallbackRealEstateStore: Map<string, RealEstateAssetDoc> = new Map();
  private fallbackPaperBibliographyStore: Map<string, PaperBibliographyEntry> = new Map();
  private fallbackAgenticActionStore: Map<string, AgenticActionDoc> = new Map();

  private constructor() {
    this.initializeFallbackData();
  }

  public static getInstance(): AstraDBService {
    if (!AstraDBService.instance) {
      AstraDBService.instance = new AstraDBService();
    }
    return AstraDBService.instance;
  }

  /**
   * Initializes the Astra DB client using v2.x "keyspace" terminology
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const token = process.env.ASTRA_DB_APPLICATION_TOKEN;
    const endpoint = process.env.ASTRA_DB_API_ENDPOINT;
    
    // SDK v2.x uses 'keyspace'. We support both env var names for flexibility.
    const keyspace = process.env.ASTRA_DB_KEYSPACE || process.env.ASTRA_DB_NAMESPACE || 'default_keyspace';

    if (!token || !endpoint) {
      console.warn('⚠️ [AstraDBService] Credentials missing. Running in local simulation mode.');
      this.isInitialized = true;
      return;
    }

    try {
      this.client = new DataAPIClient(token);
      // FIX: Ensure terminology matches SDK v2.2 expectations
      this.db = this.client.db(endpoint, { keyspace });

      this.internalCollection = this.db.collection<AccountVectorDocument>('internal_accounts');
      this.externalCollection = this.db.collection<AccountVectorDocument>('external_accounts');

      console.log(`🔮 [AstraDBService] connected to keyspace: ${keyspace}`);
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ [AstraDBService] Init Failed:', error);
      // Still mark as initialized to allow fallback stores to function
      this.isInitialized = true;
    }
  }

  /**
   * FIX: Added implementation for ensureInitialized to prevent async race conditions
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  public getInternalAccountsCollection(): Collection<AccountVectorDocument> | null {
    return this.internalCollection;
  }

  public getExternalAccountsCollection(): Collection<AccountVectorDocument> | null {
    return this.externalCollection;
  }

  public getCollection<T extends SomeDoc = SomeDoc>(name: string): Collection<T> | null {
    return this.db ? this.db.collection<T>(name) : null;
  }

  /**
   * REPLACED: Replaces non-existent upsertOne with updateOne + upsert: true
   */
  public async upsertAccountVector(
    accountId: string,
    vector: number[],
    metadata: AssetMetadata,
    type: 'internal' | 'external'
  ): Promise<void> {
    await this.ensureInitialized();

    const document: AccountVectorDocument = {
      _id: accountId,
      $vector: vector,
      accountType: type,
      metadata,
      updatedAt: new Date().toISOString(),
    };

    if (this.db && !process.env.USE_LOCAL_SIMULATION) {
      try {
        const collection = type === 'internal' ? this.internalCollection : this.externalCollection;
        if (collection) {
          // FIX: Changed from upsertOne to updateOne pattern
          await collection.updateOne(
            { _id: accountId },
            { $set: document },
            { upsert: true }
          );
          return;
        }
      } catch (error) {
        console.error(`[AstraDBService] Remote upsert failed: ${error}`);
      }
    }

    const store = type === 'internal' ? this.fallbackInternalStore : this.fallbackExternalStore;
    store.set(accountId, document);
  }

  public async upsertRealEstateAsset(
    assetId: string,
    vector: number[] | undefined,
    asset: Omit<RealEstateAssetDoc, '_id' | '$vector' | 'updatedAt'>
  ): Promise<void> {
    await this.ensureInitialized();

    const document: RealEstateAssetDoc = {
      _id: assetId,
      $vector: vector,
      ...asset,
      updatedAt: new Date().toISOString(),
    };

    if (this.db && !process.env.USE_LOCAL_SIMULATION) {
      try {
        const collection = this.db.collection<RealEstateAssetDoc>('real_estate_assets');
        await collection.updateOne(
          { _id: assetId },
          { $set: document },
          { upsert: true }
        );
        return;
      } catch (error) {
        console.error(`[AstraDBService] Real estate upsert failed: ${error}`);
      }
    }

    this.fallbackRealEstateStore.set(assetId, document);
  }

  public async upsertPaperBibliography(
    paperId: string,
    vector: number[] | undefined,
    paper: Omit<PaperBibliographyEntry, '_id' | '$vector' | 'updatedAt'>
  ): Promise<void> {
    await this.ensureInitialized();

    const document: PaperBibliographyEntry = {
      _id: paperId,
      $vector: vector,
      ...paper,
      updatedAt: new Date().toISOString(),
    };

    if (this.db && !process.env.USE_LOCAL_SIMULATION) {
      try {
        const collection = this.db.collection<PaperBibliographyEntry>('paper_bibliography');
        await collection.updateOne(
          { _id: paperId },
          { $set: document },
          { upsert: true }
        );
        return;
      } catch (error) {
        console.error(`[AstraDBService] Paper bibliography upsert failed: ${error}`);
      }
    }

    this.fallbackPaperBibliographyStore.set(paperId, document);
  }

  public async upsertAgenticAction(
    actionId: string,
    vector: number[] | undefined,
    action: Omit<AgenticActionDoc, '_id' | '$vector' | 'timestamp'>
  ): Promise<void> {
    await this.ensureInitialized();

    const document: AgenticActionDoc = {
      _id: actionId,
      $vector: vector,
      ...action,
      timestamp: new Date().toISOString(),
    };

    if (this.db && !process.env.USE_LOCAL_SIMULATION) {
      try {
        const collection = this.db.collection<AgenticActionDoc>('agentic_actions');
        await collection.updateOne(
          { _id: actionId },
          { $set: document },
          { upsert: true }
        );
        return;
      } catch (error) {
        console.error(`[AstraDBService] Agentic action upsert failed: ${error}`);
      }
    }

    this.fallbackAgenticActionStore.set(actionId, document);
  }

  public async findBillionaireAssetMatches(
    vector: number[],
    limit = 5,
    threshold = 0.75,
    type: 'internal' | 'external' = 'external'
  ): Promise<VectorMatchResult[]> {
    await this.ensureInitialized();

    if (this.db && !process.env.USE_LOCAL_SIMULATION) {
      try {
        const collection = type === 'internal' ? this.internalCollection : this.externalCollection;
        if (collection) {
          const cursor = collection.find(
            {},
            {
              sort: { $vector: vector },
              limit: limit * 2,
              includeSimilarity: true,
            }
          );

          const results: VectorMatchResult[] = [];
          for await (const doc of cursor) {
            // FIX: Typed similarity access
            const similarity = (doc as any).$similarity ?? 0;
            if (similarity >= threshold) {
              results.push({
                document: doc as AccountVectorDocument,
                similarity,
              });
            }
          }
          return results.slice(0, limit);
        }
      } catch (error) {
        console.error(`[AstraDBService] Vector search failed: ${error}`);
      }
    }

    return this.localVectorSearch(vector, limit, threshold, type);
  }

  public async findRealEstateMatches(
    vector: number[],
    limit = 5,
    threshold = 0.75
  ): Promise<{ document: RealEstateAssetDoc; similarity: number }[]> {
    await this.ensureInitialized();

    if (this.db && !process.env.USE_LOCAL_SIMULATION) {
      try {
        const collection = this.db.collection<RealEstateAssetDoc>('real_estate_assets');
        const cursor = collection.find(
          {},
          {
            sort: { $vector: vector },
            limit: limit * 2,
            includeSimilarity: true,
          }
        );

        const results: { document: RealEstateAssetDoc; similarity: number }[] = [];
        for await (const doc of cursor) {
          const similarity = (doc as any).$similarity ?? 0;
          if (similarity >= threshold) {
            results.push({
              document: doc as RealEstateAssetDoc,
              similarity,
            });
          }
        }
        return results.slice(0, limit);
      } catch (error) {
        console.error(`[AstraDBService] Real estate vector search failed: ${error}`);
      }
    }

    const results: { document: RealEstateAssetDoc; similarity: number }[] = [];
    for (const doc of this.fallbackRealEstateStore.values()) {
      if (!doc.$vector) continue;
      const similarity = this.calculateCosineSimilarity(vector, doc.$vector);
      if (similarity >= threshold) {
        results.push({ document: doc, similarity });
      }
    }
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
  }

  public async findPaperBibliographyMatches(
    vector: number[],
    limit = 5,
    threshold = 0.75
  ): Promise<{ document: PaperBibliographyEntry; similarity: number }[]> {
    await this.ensureInitialized();

    if (this.db && !process.env.USE_LOCAL_SIMULATION) {
      try {
        const collection = this.db.collection<PaperBibliographyEntry>('paper_bibliography');
        const cursor = collection.find(
          {},
          {
            sort: { $vector: vector },
            limit: limit * 2,
            includeSimilarity: true,
          }
        );

        const results: { document: PaperBibliographyEntry; similarity: number }[] = [];
        for await (const doc of cursor) {
          const similarity = (doc as any).$similarity ?? 0;
          if (similarity >= threshold) {
            results.push({
              document: doc as PaperBibliographyEntry,
              similarity,
            });
          }
        }
        return results.slice(0, limit);
      } catch (error) {
        console.error(`[AstraDBService] Paper bibliography vector search failed: ${error}`);
      }
    }

    const results: { document: PaperBibliographyEntry; similarity: number }[] = [];
    for (const doc of this.fallbackPaperBibliographyStore.values()) {
      if (!doc.$vector) continue;
      const similarity = this.calculateCosineSimilarity(vector, doc.$vector);
      if (similarity >= threshold) {
        results.push({ document: doc, similarity });
      }
    }
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
  }

  public async getPaperByCitationKey(citationKey: string): Promise<PaperBibliographyEntry | null> {
    await this.ensureInitialized();

    if (this.db && !process.env.USE_LOCAL_SIMULATION) {
      try {
        const collection = this.db.collection<PaperBibliographyEntry>('paper_bibliography');
        const doc = await collection.findOne({ citationKey });
        return doc ? (doc as unknown as PaperBibliographyEntry) : null;
      } catch (error) {
        console.error(`[AstraDBService] Get paper by citation key failed: ${error}`);
      }
    }

    for (const doc of this.fallbackPaperBibliographyStore.values()) {
      if (doc.citationKey === citationKey) {
        return doc;
      }
    }
    return null;
  }

  public async getPaperById(id: string): Promise<PaperBibliographyEntry | null> {
    await this.ensureInitialized();

    if (this.db && !process.env.USE_LOCAL_SIMULATION) {
      try {
        const collection = this.db.collection<PaperBibliographyEntry>('paper_bibliography');
        const doc = await collection.findOne({ _id: id });
        return doc ? (doc as unknown as PaperBibliographyEntry) : null;
      } catch (error) {
        console.error(`[AstraDBService] Get paper by ID failed: ${error}`);
      }
    }

    return this.fallbackPaperBibliographyStore.get(id) || null;
  }

  public async crossReferenceAccounts(
    internalAccountId: string,
    limit = 5,
    threshold = 0.80
  ): Promise<VectorMatchResult[]> {
    await this.ensureInitialized();

    let sourceDoc: AccountVectorDocument | undefined;

    if (this.db && !process.env.USE_LOCAL_SIMULATION && this.internalCollection) {
      try {
        // FIX: Cast return type from SomeDoc to AccountVectorDocument
        const result = await this.internalCollection.findOne({ _id: internalAccountId });
        sourceDoc = result ? (result as unknown as AccountVectorDocument) : undefined;
      } catch (error) {
        console.error(`[AstraDBService] Fetch failed: ${error}`);
      }
    }

    if (!sourceDoc) {
      sourceDoc = this.fallbackInternalStore.get(internalAccountId);
    }

    if (!sourceDoc || !sourceDoc.$vector) {
      throw new Error(`[AstraDBService] Internal account ${internalAccountId} not found.`);
    }

    return this.findBillionaireAssetMatches(sourceDoc.$vector, limit, threshold, 'external');
  }

  public async batchUpsertAccounts(
    documents: AccountVectorDocument[],
    type: 'internal' | 'external'
  ): Promise<void> {
    await this.ensureInitialized();

    if (this.db && !process.env.USE_LOCAL_SIMULATION) {
      try {
        const collection = type === 'internal' ? this.internalCollection : this.externalCollection;
        if (collection) {
          await collection.insertMany(documents);
          return;
        }
      } catch (error) {
        console.error(`[AstraDBService] Batch failed: ${error}`);
      }
    }

    const store = type === 'internal' ? this.fallbackInternalStore : this.fallbackExternalStore;
    for (const doc of documents) {
      store.set(doc._id, doc);
    }
  }

  private localVectorSearch(
    queryVector: number[],
    limit: number,
    threshold: number,
    type: 'internal' | 'external'
  ): VectorMatchResult[] {
    const store = type === 'internal' ? this.fallbackInternalStore : this.fallbackExternalStore;
    const results: VectorMatchResult[] = [];

    for (const doc of store.values()) {
      if (!doc.$vector) continue;
      const similarity = this.calculateCosineSimilarity(queryVector, doc.$vector);
      if (similarity >= threshold) {
        results.push({ document: doc, similarity });
      }
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const mag = Math.sqrt(normA) * Math.sqrt(normB);
    return mag === 0 ? 0 : dotProduct / mag;
  }

  private initializeFallbackData(): void {
    const mockAccounts: AccountVectorDocument[] = [
      {
        _id: 'ext_billionaire_001',
        $vector: [0.1, 0.9, 0.3, 0.8, 0.2, 0.5, 0.1, 0.9, 0.4, 0.7, 0.2, 0.6, 0.1, 0.8],
        accountType: 'external',
        updatedAt: new Date().toISOString(),
        metadata: {
          ownerId: 'sov_shadow_01',
          ownerName: 'The Sovereign Shadow Trust',
          netWorthUSD: 14200000000,
          primaryJurisdiction: 'Cayman Islands',
          assetClasses: ['Private Equity', 'Real Estate'],
          fortune500Affiliations: ['BlackRock'],
          liquidityRatio: 0.15,
          riskToleranceProfile: 'Shadow-Accumulation',
          regulatoryExemptions: ['Sovereign Immunity'],
          lastAuditTimestamp: new Date().toISOString()
        }
      }
    ];

    mockAccounts.forEach(doc => this.fallbackExternalStore.set(doc._id, doc));

    const mockRealEstate: RealEstateAssetDoc[] = [
      {
        _id: 're_asset_001',
        $vector: [0.2, 0.8, 0.4, 0.7, 0.3, 0.6, 0.2, 0.8, 0.5, 0.6, 0.3, 0.5, 0.2, 0.7],
        address: '1600 Pennsylvania Ave NW, Washington, DC 20500',
        propertyType: 'Executive Mansion',
        valueUSD: 450000000,
        jurisdiction: 'United States',
        ownerId: 'gov_us_01',
        updatedAt: new Date().toISOString()
      }
    ];

    mockRealEstate.forEach(doc => this.fallbackRealEstateStore.set(doc._id, doc));

    const mockPapers: PaperBibliographyEntry[] = [
      {
        _id: 'paper_001',
        $vector: [0.3, 0.7, 0.5, 0.6, 0.4, 0.5, 0.3, 0.7, 0.6, 0.5, 0.4, 0.4, 0.3, 0.6],
        citationKey: 'ObamaPublicFinancing2008',
        title: 'Obama Opts Out Of Public Financing',
        authors: ['Sovereign Research Group'],
        year: 2008,
        abstract: 'An analysis of the historical decision by Barack Obama to opt out of the public financing system for the 2008 presidential election, and its implications on sovereign wealth funds and political lobbying.',
        nutsAndBoltsSummary: 'Key takeaways: 1. First candidate to opt out since 1976. 2. Raised over $750M. 3. Shifted power dynamics to private donors and 527 organizations.',
        updatedAt: new Date().toISOString()
      }
    ];

    mockPapers.forEach(doc => this.fallbackPaperBibliographyStore.set(doc._id, doc));
  }
}

export const astraDBService = AstraDBService.getInstance();
export default AstraDBService;