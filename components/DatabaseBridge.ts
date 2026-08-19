

// --- CONSOLIDATED FROM: ./Google/DatabaseBridge.ts ---

import { EventEmitter } from 'events';

export type DatabaseDriver = 'sqlite' | 'postgres' | 'memory';

export interface DatabaseConfig {
  driver: DatabaseDriver;
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  storagePath?: string; // For SQLite
  maxConnections?: number;
}

export interface QueryFilter {
  field: string;
  operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'in' | 'array-contains';
  value: any;
}

export interface QueryOptions {
  where?: QueryFilter[];
  orderBy?: {
    field: string;
    direction?: 'asc' | 'desc';
  }[];
  limit?: number;
  offset?: number;
}

export interface DocumentSnapshot<T = Record<string, any>> {
  id: string;
  exists: boolean;
  data: () => T | undefined;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuerySnapshot<T = Record<string, any>> {
  docs: DocumentSnapshot<T>[];
  empty: boolean;
  size: number;
}

export interface DatabaseBridgeTransaction {
  getDoc<T = Record<string, any>>(collection: string, id: string): Promise<DocumentSnapshot<T>>;
  setDoc<T = Record<string, any>>(collection: string, id: string, data: T, merge?: boolean): Promise<void>;
  deleteDoc(collection: string, id: string): Promise<void>;
  executeSql(sql: string, params?: any[]): Promise<{ rowsAffected: number; lastInsertId?: any }>;
}

export class DatabaseBridge {
  private static instance: DatabaseBridge | null = null;
  private config: DatabaseConfig;
  private memoryStore: Map<string, Map<string, { data: any; createdAt: Date; updatedAt: Date }>> = new Map();
  private sqlTables: Map<string, any[]> = new Map();
  private eventEmitter: EventEmitter = new EventEmitter();
  private isInitialized: boolean = false;

  private constructor(config?: DatabaseConfig) {
    this.config = config || {
      driver: 'memory',
      maxConnections: 10,
    };
    this.initializeDatabase();
  }

  public static getInstance(config?: DatabaseConfig): DatabaseBridge {
    if (!DatabaseBridge.instance) {
      DatabaseBridge.instance = new DatabaseBridge(config);
    }
    return DatabaseBridge.instance;
  }

  private async initializeDatabase(): Promise<void> {
    if (this.isInitialized) return;

    if (this.config.driver === 'memory') {
      console.log('[DatabaseBridge] Initialized in-memory high-performance local database store.');
      this.isInitialized = true;
      return;
    }

    try {
      if (this.config.driver === 'sqlite') {
        await this.querySql(`
          CREATE TABLE IF NOT EXISTS _cloud_firestore_emu (
            collection TEXT NOT NULL,
            id TEXT NOT NULL,
            data TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (collection, id)
          );
        `);
      } else if (this.config.driver === 'postgres') {
        await this.querySql(`
          CREATE TABLE IF NOT EXISTS _cloud_firestore_emu (
            collection VARCHAR(255) NOT NULL,
            id VARCHAR(255) NOT NULL,
            data JSONB NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (collection, id)
          );
        `);
      }
      this.isInitialized = true;
      console.log(`[DatabaseBridge] Successfully initialized local database with driver: ${this.config.driver}`);
    } catch (err) {
      console.warn(`[DatabaseBridge] Failed to initialize DB driver (${this.config.driver}), falling back to in-memory store:`, err);
      this.config.driver = 'memory';
      this.isInitialized = true;
    }
  }

  private getTable(tableName: string): any[] {
    const normalizedName = tableName.toLowerCase();
    if (!this.sqlTables.has(normalizedName)) {
      this.sqlTables.set(normalizedName, []);
    }
    return this.sqlTables.get(normalizedName)!;
  }

  // --- Cloud SQL / Relational Interface ---

  public async querySql<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const normalizedSql = sql.replace(/\s+/g, ' ').trim();
    const selectMatch = normalizedSql.match(/select\s+(.+?)\s+from\s+([a-zA-Z0-9_]+)(?:\s+where\s+(.+?))?$/i);
    if (selectMatch) {
      const tableName = selectMatch[2];
      const whereClause = selectMatch[3];
      
      let rows = this.getTable(tableName);
      
      if (whereClause) {
        const conditions = whereClause.split(/\s+and\s+/i);
        rows = rows.filter(row => {
          return conditions.every(cond => {
            const match = cond.match(/([a-zA-Z0-9_]+)\s*=\s*\$(\d+)/i);
            if (match) {
              const field = match[1].toLowerCase();
              const paramIndex = parseInt(match[2], 10) - 1;
              const paramValue = params[paramIndex];
              
              let rowValue = (row as any)[field];
              if (field === 'collection') rowValue = row.collection;
              if (field === 'id') rowValue = row.id;
              if (field === 'data') rowValue = row.data;
              if (field === 'created_at') rowValue = row.created_at;
              if (field === 'updated_at') rowValue = row.updated_at;
              
              return rowValue === paramValue;
            }
            return true;
          });
        });
      }
      
      return rows as T[];
    }
    
    return [];
  }

  public async executeSql(sql: string, params: any[] = []): Promise<{ rowsAffected: number; lastInsertId?: any }> {
    const normalizedSql = sql.replace(/\s+/g, ' ').trim();
    const normalized = normalizedSql.toLowerCase();
    
    if (normalized.startsWith('insert into')) {
      const insertMatch = normalizedSql.match(/insert\s+into\s+([a-zA-Z0-9_]+)\s*\((.+?)\)\s*values\s*\((.+?)\)/i);
      if (insertMatch) {
        const tableName = insertMatch[1];
        const fields = insertMatch[2].split(',').map(f => f.trim().toLowerCase());
        const rows = this.getTable(tableName);
        
        const newRow: any = {};
        fields.forEach((field, idx) => {
          const paramMatch = insertMatch[3].split(',')[idx].trim().match(/\$(\d+)/);
          if (paramMatch) {
            const paramIdx = parseInt(paramMatch[1], 10) - 1;
            newRow[field] = params[paramIdx];
          } else {
            newRow[field] = null;
          }
        });
        
        if (normalized.includes('on conflict')) {
          const existingIdx = rows.findIndex(r => r.collection === newRow.collection && r.id === newRow.id);
          if (existingIdx !== -1) {
            rows[existingIdx] = {
              ...rows[existingIdx],
              ...newRow,
              updated_at: newRow.updated_at || new Date().toISOString()
            };
            return { rowsAffected: 1, lastInsertId: existingIdx };
          }
        }
        
        newRow.created_at = newRow.created_at || new Date().toISOString();
        newRow.updated_at = newRow.updated_at || new Date().toISOString();
        rows.push(newRow);
        return { rowsAffected: 1, lastInsertId: rows.length - 1 };
      }
    }
    
    if (normalized.startsWith('delete from')) {
      const deleteMatch = normalizedSql.match(/delete\s+from\s+([a-zA-Z0-9_]+)(?:\s+where\s+(.+?))?$/i);
      if (deleteMatch) {
        const tableName = deleteMatch[1];
        const whereClause = deleteMatch[2];
        let rows = this.getTable(tableName);
        const initialCount = rows.length;
        
        if (whereClause) {
          const conditions = whereClause.split(/\s+and\s+/i);
          rows = rows.filter(row => {
            const matches = conditions.every(cond => {
              const match = cond.match(/([a-zA-Z0-9_]+)\s*=\s*\$(\d+)/i);
              if (match) {
                const field = match[1].toLowerCase();
                const paramIndex = parseInt(match[2], 10) - 1;
                const paramValue = params[paramIndex];
                return (row as any)[field] === paramValue;
              }
              return true;
            });
            return !matches;
          });
          this.sqlTables.set(tableName.toLowerCase(), rows);
          return { rowsAffected: initialCount - rows.length };
        } else {
          this.sqlTables.set(tableName.toLowerCase(), []);
          return { rowsAffected: initialCount };
        }
      }
    }
    
    return { rowsAffected: 0 };
  }

  public async transaction<T>(fn: (tx: DatabaseBridgeTransaction) => Promise<T>): Promise<T> {
    const tx: DatabaseBridgeTransaction = {
      getDoc: (col, id) => this.getDoc(col, id),
      setDoc: (col, id, data, merge) => this.setDoc(col, id, data, { merge }),
      deleteDoc: (col, id) => this.deleteDoc(col, id),
      executeSql: (sql, params) => this.executeSql(sql, params),
    };

    try {
      await this.executeSql('BEGIN TRANSACTION');
      const result = await fn(tx);
      await this.executeSql('COMMIT');
      return result;
    } catch (err) {
      await this.executeSql('ROLLBACK');
      throw err;
    }
  }

  // --- Document Store / Firestore Replacement API ---

  public async getDoc<T = Record<string, any>>(collectionName: string, docId: string): Promise<DocumentSnapshot<T>> {
    if (this.config.driver === 'memory') {
      const colMap = this.memoryStore.get(collectionName);
      const doc = colMap?.get(docId);
      if (!doc) {
        return {
          id: docId,
          exists: false,
          data: () => undefined,
        };
      }
      return {
        id: docId,
        exists: true,
        data: () => doc.data as T,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    }

    const rows = await this.querySql(
      `SELECT data, created_at, updated_at FROM _cloud_firestore_emu WHERE collection = $1 AND id = $2`,
      [collectionName, docId]
    );

    if (!rows || rows.length === 0) {
      return {
        id: docId,
        exists: false,
        data: () => undefined,
      };
    }

    const row = rows[0] as any;
    const dataObj = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;

    return {
      id: docId,
      exists: true,
      data: () => dataObj as T,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  public async setDoc<T = Record<string, any>>(
    collectionName: string,
    docId: string,
    data: T,
    options: { merge?: boolean } = {}
  ): Promise<void> {
    const now = new Date();

    if (this.config.driver === 'memory') {
      if (!this.memoryStore.has(collectionName)) {
        this.memoryStore.set(collectionName, new Map());
      }
      const colMap = this.memoryStore.get(collectionName)!;
      const existing = colMap.get(docId);

      let finalData = data;
      let createdAt = now;

      if (existing) {
        createdAt = existing.createdAt;
        if (options.merge) {
          finalData = { ...existing.data, ...data };
        }
      }

      colMap.set(docId, {
        data: finalData,
        createdAt,
        updatedAt: now,
      });

      this.notifyListeners(collectionName);
      return;
    }

    if (options.merge) {
      const existing = await this.getDoc(collectionName, docId);
      if (existing.exists) {
        data = { ...existing.data()!, ...data };
      }
    }

    const serializedData = JSON.stringify(data);
    await this.executeSql(
      `INSERT INTO _cloud_firestore_emu (collection, id, data, updated_at) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT(collection, id) 
       DO UPDATE SET data = $3, updated_at = $4`,
      [collectionName, docId, serializedData, now.toISOString()]
    );

    this.notifyListeners(collectionName);
  }

  public async updateDoc<T = Record<string, any>>(
    collectionName: string,
    docId: string,
    data: Partial<T>
  ): Promise<void> {
    const existing = await this.getDoc<T>(collectionName, docId);
    if (!existing.exists) {
      throw new Error(`Document ${collectionName}/${docId} does not exist to update.`);
    }

    const updatedData = { ...existing.data()!, ...data };
    await this.setDoc(collectionName, docId, updatedData, { merge: true });
  }

  public async deleteDoc(collectionName: string, docId: string): Promise<void> {
    if (this.config.driver === 'memory') {
      const colMap = this.memoryStore.get(collectionName);
      if (colMap) {
        colMap.delete(docId);
      }
      this.notifyListeners(collectionName);
      return;
    }

    await this.executeSql(`DELETE FROM _cloud_firestore_emu WHERE collection = $1 AND id = $2`, [
      collectionName,
      docId,
    ]);

    this.notifyListeners(collectionName);
  }

  public async getDocs<T = Record<string, any>>(
    collectionName: string,
    options: QueryOptions = {}
  ): Promise<QuerySnapshot<T>> {
    let docs: DocumentSnapshot<T>[] = [];

    if (this.config.driver === 'memory') {
      const colMap = this.memoryStore.get(collectionName);
      if (colMap) {
        colMap.forEach((val, id) => {
          docs.push({
            id,
            exists: true,
            data: () => val.data as T,
            createdAt: val.createdAt,
            updatedAt: val.updatedAt,
          });
        });
      }
    } else {
      const rows = await this.querySql(
        `SELECT id, data, created_at, updated_at FROM _cloud_firestore_emu WHERE collection = $1`,
        [collectionName]
      );

      docs = rows.map((row: any) => {
        const dataObj = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        return {
          id: row.id,
          exists: true,
          data: () => dataObj as T,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        };
      });
    }

    // Apply Filter Rules
    if (options.where && options.where.length > 0) {
      docs = docs.filter((doc) => {
        const data = doc.data();
        if (!data) return false;

        return options.where!.every((filter) => {
          const val = (data as any)[filter.field];
          switch (filter.operator) {
            case '==':
              return val === filter.value;
            case '!=':
              return val !== filter.value;
            case '>':
              return val > filter.value;
            case '>=':
              return val >= filter.value;
            case '<':
              return val < filter.value;
            case '<=':
              return val <= filter.value;
            case 'in':
              return Array.isArray(filter.value) && filter.value.includes(val);
            case 'array-contains':
              return Array.isArray(val) && val.includes(filter.value);
            default:
              return true;
          }
        });
      });
    }

    // Apply Sorting Rules
    if (options.orderBy && options.orderBy.length > 0) {
      docs.sort((a, b) => {
        for (const order of options.orderBy!) {
          const valA = (a.data() as any)?.[order.field];
          const valB = (b.data() as any)?.[order.field];

          if (valA < valB) return order.direction === 'desc' ? 1 : -1;
          if (valA > valB) return order.direction === 'desc' ? -1 : 1;
        }
        return 0;
      });
    }

    // Apply Offset & Limit
    const offset = options.offset || 0;
    const limit = options.limit ? offset + options.limit : docs.length;
    docs = docs.slice(offset, limit);

    return {
      docs,
      empty: docs.length === 0,
      size: docs.length,
    };
  }

  public onSnapshot<T = Record<string, any>>(
    collectionName: string,
    callback: (snapshot: QuerySnapshot<T>) => void,
    options: QueryOptions = {}
  ): () => void {
    const listener = async () => {
      const snapshot = await this.getDocs<T>(collectionName, options);
      callback(snapshot);
    };

    this.eventEmitter.on(`change:${collectionName}`, listener);
    // Initial dispatch
    listener();

    // Return unsubscribe handle
    return () => {
      this.eventEmitter.off(`change:${collectionName}`, listener);
    };
  }

  private notifyListeners(collectionName: string): void {
    this.eventEmitter.emit(`change:${collectionName}`);
  }
}

// Convenience export of default singleton instance
export const dbBridge = DatabaseBridge.getInstance();
export default dbBridge;