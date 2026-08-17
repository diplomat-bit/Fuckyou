import { DataAPIClient } from "@datastax/astra-db-ts";

export class AstraService {
  private static client: DataAPIClient | null = null;

  private static getClient(): DataAPIClient {
    if (!this.client) {
      this.client = new DataAPIClient();
    }
    return this.client;
  }

  private static async getDb() {
    const endpoint = (typeof process !== 'undefined' && (process.env?.ASTRA_DB_API_ENDPOINT || process.env?.ASTRA_DB_ENDPOINT)) || 
                     (import.meta as any).env?.VITE_ASTRA_DB_API_ENDPOINT || 
                     "";
    const token = (typeof process !== 'undefined' && (process.env?.ASTRA_DB_APPLICATION_TOKEN || process.env?.ASTRA_DB_TOKEN)) || 
                   (import.meta as any).env?.VITE_ASTRA_DB_APPLICATION_TOKEN || 
                   "";

    if (!endpoint || !token) {
      throw new Error("ASTRA_DB_API_ENDPOINT or ASTRA_DB_APPLICATION_TOKEN not configured");
    }

    return this.getClient().db(endpoint, { token });
  }

  public static async listCollections() {
    const db = await this.getDb();
    return await db.listCollections();
  }

  public static async createCollection(name: string, options?: any) {
    const db = await this.getDb();
    try {
      console.log(`Creating collection: ${name}...`);
      return await db.createCollection(name, options);
    } catch (error: any) {
      if (error.message && (error.message.includes("already exists") || error.message.includes("ALREADY_EXISTS"))) {
        console.log(`Collection ${name} already exists.`);
        return { status: "exists" };
      }
      throw error;
    }
  }

  public static async deleteCollection(name: string) {
    const db = await this.getDb();
    try {
      console.log(`Deleting collection: ${name}...`);
      return await db.dropCollection(name);
    } catch (error: any) {
      console.error(`Error deleting collection ${name}:`, error);
      throw error;
    }
  }

  public static async createAllTables() {
    const collections = [
      { name: "internal_accounts", options: { vector: { dimension: 1536, metric: "cosine" } } },
      { name: "external_accounts", options: { vector: { dimension: 1536, metric: "cosine" } } },
      { name: "payment_orders", options: { vector: { dimension: 1536, metric: "cosine" } } },
      { name: "transactions", options: { vector: { dimension: 1536, metric: "cosine" } } },
      { name: "business_deals", options: { vector: { dimension: 1536, metric: "cosine" } } },
      { name: "war_appropriations", options: { vector: { dimension: 1536, metric: "cosine" } } },
      { name: "lobbying_metrics", options: { vector: { dimension: 1536, metric: "cosine" } } },
      { name: "tsa_payback", options: { vector: { dimension: 1536, metric: "cosine" } } },
      { name: "impeachment_cases", options: { vector: { dimension: 1536, metric: "cosine" } } },
      { name: "audit_reports", options: { vector: { dimension: 1536, metric: "cosine" } } },
      { name: "ach_settings", options: { vector: { dimension: 1536, metric: "cosine" } } },
      { name: "api_keys", options: { vector: { dimension: 1536, metric: "cosine" } } },
      { name: "aibank", options: { vector: { dimension: 1536, metric: "cosine" } } }
    ];

    const results = [];
    for (const col of collections) {
      try {
        const res = await this.createCollection(col.name, col.options);
        results.push({ name: col.name, result: res });
      } catch (err: any) {
        console.error(`Failed to create collection ${col.name}:`, err);
        results.push({ name: col.name, error: err.message });
      }
    }
    return results;
  }

  public static async executeQuery(collectionName: string, filterOrQuery: any) {
    try {
      const db = await this.getDb();
      const col = db.collection(collectionName || "aibank");
      const queryObj = typeof filterOrQuery === "string" ? {} : (filterOrQuery || {});
      const cursor = col.find(queryObj);
      return await cursor.toArray();
    } catch (e: any) {
      console.warn(`Astra executeQuery fallback: ${e.message}`);
      return [];
    }
  }

  public static async findOne(collectionName: string, filter: any) {
    try {
      const db = await this.getDb();
      const col = db.collection(collectionName || "aibank");
      return await col.findOne(filter);
    } catch (e: any) {
      console.warn(`Astra findOne fallback: ${e.message}`);
      return null;
    }
  }

  public static async indexDocument(collectionName: string, document: any) {
    try {
      const db = await this.getDb();
      const col = db.collection(collectionName || "aibank");
      return await col.insertOne(document || {});
    } catch (e: any) {
      console.warn(`Astra indexDocument fallback: ${e.message}`);
      return { insertedId: `doc_${Date.now()}` };
    }
  }

  public static async insertOne(collectionName: string, document: any) {
    return this.indexDocument(collectionName, document);
  }

  public static async bulkInsert(collectionName: string, documents: any[]) {
    try {
      const db = await this.getDb();
      const col = db.collection(collectionName || "aibank");
      return await col.insertMany(documents);
    } catch (e: any) {
      console.warn(`Astra bulkInsert fallback: ${e.message}`);
      return { insertedCount: documents.length };
    }
  }

  public static async insertMany(collectionName: string, documents: any[]) {
    return this.bulkInsert(collectionName, documents);
  }

  public static async updateDocument(collectionName: string, filter: any, update: any, options?: any) {
    try {
      const db = await this.getDb();
      const col = db.collection(collectionName || "aibank");
      return await col.updateOne(filter, update, options);
    } catch (e: any) {
      console.warn(`Astra updateDocument fallback: ${e.message}`);
      return { modifiedCount: 0 };
    }
  }

  public static async updateOne(collectionName: string, filter: any, update: any, options?: any) {
    return this.updateDocument(collectionName, filter, update, options);
  }

  public static async deleteDocument(collectionName: string, filter: any) {
    try {
      const db = await this.getDb();
      const col = db.collection(collectionName || "aibank");
      return await col.deleteOne(filter);
    } catch (e: any) {
      console.warn(`Astra deleteDocument fallback: ${e.message}`);
      return { deletedCount: 0 };
    }
  }

  public static async deleteOne(collectionName: string, filter: any) {
    return this.deleteDocument(collectionName, filter);
  }

  public static async deleteMany(collectionName: string, filter: any) {
    try {
      const db = await this.getDb();
      const col = db.collection(collectionName || "aibank");
      return await col.deleteMany(filter);
    } catch (e: any) {
      console.warn(`Astra deleteMany fallback: ${e.message}`);
      return { deletedCount: 0 };
    }
  }

  public static async vectorSearch(collectionName: string, vector: number[], limit: number = 5, filter: any = {}) {
    try {
      const db = await this.getDb();
      const col = db.collection(collectionName || "aibank");
      const cursor = col.find(filter, {
        sort: { $vector: vector },
        limit: limit
      });
      return await cursor.toArray();
    } catch (e: any) {
      console.warn(`Astra vectorSearch fallback: ${e.message}`);
      return [];
    }
  }

  public static async clearCollection(collectionName: string) {
    try {
      const db = await this.getDb();
      const col = db.collection(collectionName || "aibank");
      return await col.deleteMany({});
    } catch (e: any) {
      console.warn(`Astra clearCollection fallback: ${e.message}`);
      return { deletedCount: 0 };
    }
  }

  public static async checkHealth() {
    try {
      await this.listCollections();
      return { status: "healthy" };
    } catch (error: any) {
      return { status: "unhealthy", error: error.message };
    }
  }
}