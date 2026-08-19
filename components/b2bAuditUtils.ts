

// --- CONSOLIDATED FROM: ./components/utils/b2bAuditUtils.ts ---

export interface AuditRecord {
  index: number;
  timestamp: string;
  action: string;
  details: Record<string, any>;
  previousHash: string;
  hash: string;
}

/**
 * Helper to ensure deterministic JSON stringification of objects.
 * This prevents hash mismatches caused by different key orderings.
 */
export function deterministicStringify(obj: any): string {
  if (obj === null) return 'null';
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(deterministicStringify).join(',') + ']';
  }
  const sortedKeys = Object.keys(obj).sort();
  const parts = sortedKeys.map(key => `${JSON.stringify(key)}:${deterministicStringify(obj[key])}`);
  return '{' + parts.join(',') + '}';
}

/**
 * Generates a SHA-256 hash of a given string message.
 * Uses the Web Crypto API (supported in modern browsers and Node.js 15+).
 */
export async function hashSHA256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates an HMAC-SHA256 signature for a message using a secret key.
 */
export async function generateHMAC(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Calculates the hash of an audit record based on its contents and the previous block's hash.
 */
export async function calculateRecordHash(record: Omit<AuditRecord, 'hash'>): Promise<string> {
  const serializedDetails = deterministicStringify(record.details);
  const dataToHash = [
    record.index.toString(),
    record.timestamp,
    record.action,
    serializedDetails,
    record.previousHash
  ].join('|');

  return hashSHA256(dataToHash);
}

/**
 * Creates a new audit record, chaining it to the previous record if provided.
 * If no previous record is provided, it acts as the genesis block.
 */
export async function createAuditRecord(
  action: string,
  details: Record<string, any>,
  previousRecord?: AuditRecord
): Promise<AuditRecord> {
  const index = previousRecord ? previousRecord.index + 1 : 0;
  const timestamp = new Date().toISOString();
  const previousHash = previousRecord ? previousRecord.hash : '0'.repeat(64);

  const recordWithoutHash: Omit<AuditRecord, 'hash'> = {
    index,
    timestamp,
    action,
    details,
    previousHash,
  };

  const hash = await calculateRecordHash(recordWithoutHash);

  return {
    ...recordWithoutHash,
    hash,
  };
}

/**
 * Verifies the integrity of an entire audit ledger (chain of records).
 * Returns true if the chain is valid and untampered, false otherwise.
 */
export async function verifyLedger(chain: AuditRecord[]): Promise<boolean> {
  if (!chain || chain.length === 0) {
    return true;
  }

  for (let i = 0; i < chain.length; i++) {
    const current = chain[i];

    // 1. Verify index sequence
    if (current.index !== i) {
      return false;
    }

    // 2. Verify previous hash link
    if (i > 0) {
      const previous = chain[i - 1];
      if (current.previousHash !== previous.hash) {
        return false;
      }
    } else {
      // Genesis block previous hash check
      if (current.previousHash !== '0'.repeat(64)) {
        return false;
      }
    }

    // 3. Verify current block hash integrity
    const calculatedHash = await calculateRecordHash({
      index: current.index,
      timestamp: current.timestamp,
      action: current.action,
      details: current.details,
      previousHash: current.previousHash,
    });

    if (current.hash !== calculatedHash) {
      return false;
    }
  }

  return true;
}

/**
 * Signs a report payload with HMAC-SHA256.
 */
export async function signReport(reportData: string, secret: string): Promise<string> {
  return generateHMAC(reportData, secret);
}

/**
 * Verifies the HMAC-SHA256 signature of a report payload.
 */
export async function verifyReportSignature(
  reportData: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expectedSignature = await generateHMAC(reportData, secret);
  return expectedSignature === signature;
}