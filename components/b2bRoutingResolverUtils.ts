

// --- CONSOLIDATED FROM: ./components/utils/b2bRoutingResolverUtils.ts ---

/**
 * Utility functions for ABA Mod 10 checksum validation, mock JWE encryption/decryption,
 * payment rail decision logic, and ISO 20022 XML generation.
 */

// ==========================================
// 1. ABA Routing Number Validation (Mod 10)
// ==========================================

/**
 * Validates a 9-digit ABA Routing Transit Number (RTN) using the Mod 10 checksum algorithm.
 * Formula: 3(d1 + d4 + d7) + 7(d2 + d5 + d8) + (d3 + d6 + d9) mod 10 === 0
 */
export function validateABARouting(routingNumber: string): boolean {
  const clean = routingNumber.replace(/\D/g, '');
  if (clean.length !== 9) {
    return false;
  }

  const d = clean.split('').map(Number);
  const sum =
    3 * (d[0] + d[3] + d[6]) +
    7 * (d[1] + d[4] + d[7]) +
    1 * (d[2] + d[5] + d[8]);

  return sum % 10 === 0;
}


// ==========================================
// 2. Mock JWE Encryption / Decryption
// ==========================================

/**
 * Helper: Converts an ArrayBuffer to a Base64URL string.
 */
function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Helper: Converts a Base64URL string to an ArrayBuffer.
 */
function base64UrlToBuffer(base64url: string): ArrayBuffer {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Helper: Derives a 256-bit AES key from a secret string using SHA-256.
 */
async function deriveKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const secretBuffer = encoder.encode(secret);
  const hash = await crypto.subtle.digest('SHA-256', secretBuffer);
  return crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a payload into a mock JWE compact serialization string using AES-GCM-256.
 * Format: BASE64URL(UTF8(Protected Header)) . BASE64URL(Encrypted Key) . BASE64URL(IV) . BASE64URL(Ciphertext) . BASE64URL(Authentication Tag)
 * Since this is direct encryption ("dir"), the Encrypted Key section is empty.
 */
export async function encryptJWE(payload: string, secretKey: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const key = await deriveKey(secretKey);
    
    // Generate a random 12-byte IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Protected Header
    const header = {
      alg: 'dir',
      enc: 'A256GCM',
      kid: 'mock-key-id-1'
    };
    const headerB64 = bufferToBase64Url(encoder.encode(JSON.stringify(header)));
    
    // Encrypt payload
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        additionalData: encoder.encode(headerB64) // AAD is the protected header
      },
      key,
      encoder.encode(payload)
    );

    // Web Crypto API appends the 16-byte Auth Tag at the end of the cipher text buffer
    const tagLength = 16;
    const ciphertextBuffer = encryptedBuffer.slice(0, encryptedBuffer.byteLength - tagLength);
    const tagBuffer = encryptedBuffer.slice(encryptedBuffer.byteLength - tagLength);

    const ivB64 = bufferToBase64Url(iv.buffer);
    const ciphertextB64 = bufferToBase64Url(ciphertextBuffer);
    const tagB64 = bufferToBase64Url(tagBuffer);

    // JWE Compact Serialization: header.encryptedKey.iv.ciphertext.tag
    return `${headerB64}..${ivB64}.${ciphertextB64}.${tagB64}`;
  } catch (error) {
    throw new Error(`JWE Encryption failed: ${(error as Error).message}`);
  }
}

/**
 * Decrypts a mock JWE compact serialization string using AES-GCM-256.
 */
export async function decryptJWE(jwe: string, secretKey: string): Promise<string> {
  try {
    const parts = jwe.split('.');
    if (parts.length !== 5) {
      throw new Error('Invalid JWE compact serialization format');
    }

    const [headerB64, encryptedKeyB64, ivB64, ciphertextB64, tagB64] = parts;
    
    if (encryptedKeyB64 !== '') {
      throw new Error('Only direct encryption ("dir") JWE is supported in this mock');
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const key = await deriveKey(secretKey);

    const iv = new Uint8Array(base64UrlToBuffer(ivB64));
    const ciphertext = new Uint8Array(base64UrlToBuffer(ciphertextB64));
    const tag = new Uint8Array(base64UrlToBuffer(tagB64));

    // Reconstruct the Web Crypto AES-GCM encrypted buffer (ciphertext + tag)
    const encryptedBuffer = new Uint8Array(ciphertext.length + tag.length);
    encryptedBuffer.set(ciphertext, 0);
    encryptedBuffer.set(tag, ciphertext.length);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        additionalData: encoder.encode(headerB64)
      },
      key,
      encryptedBuffer
    );

    return decoder.decode(decryptedBuffer);
  } catch (error) {
    throw new Error(`JWE Decryption failed: ${(error as Error).message}`);
  }
}


// ==========================================
// 3. Payment Rail Decision Logic
// ==========================================

export type UrgencyLevel = 'instant' | 'same-day' | 'standard';

export interface PaymentRailParams {
  amount: number;
  urgency: UrgencyLevel;
  allowFedNow?: boolean;
  allowRTP?: boolean;
  cutoffHour?: number; // 0-23, default is current hour
}

export interface PaymentRailDecision {
  rail: 'FedNow' | 'RTP' | 'ACH_SameDay' | 'ACH_Standard' | 'Fedwire';
  fee: number;
  estimatedSettlement: string;
  reasoning: string;
}

/**
 * Determines the optimal payment rail based on amount, urgency, and network availability.
 */
export function determinePaymentRail(params: PaymentRailParams): PaymentRailDecision {
  const { amount, urgency, allowFedNow = true, allowRTP = true } = params;
  const currentHour = params.cutoffHour !== undefined ? params.cutoffHour : new Date().getHours();

  if (amount <= 0) {
    throw new Error('Payment amount must be greater than zero');
  }

  // 1. Instant Urgency
  if (urgency === 'instant') {
    // FedNow Limit: typically $500,000
    if (allowFedNow && amount <= 500000) {
      return {
        rail: 'FedNow',
        fee: 1.00,
        estimatedSettlement: 'Immediate (24/7/365)',
        reasoning: 'Selected FedNow for instant settlement within the $500k limit.'
      };
    }
    // RTP Limit: typically $1,000,000
    if (allowRTP && amount <= 1000000) {
      return {
        rail: 'RTP',
        fee: 1.50,
        estimatedSettlement: 'Immediate (24/7/365)',
        reasoning: 'Selected RTP for instant settlement within the $1M limit.'
      };
    }
    // If amount exceeds instant limits, fall back to Fedwire or Same-Day ACH
    if (amount > 1000000) {
      return {
        rail: 'Fedwire',
        fee: 25.00,
        estimatedSettlement: currentHour < 18 ? 'Same-Day (within hours)' : 'Next Business Day',
        reasoning: 'Amount exceeds instant rail limits. Routed to Fedwire for high-value real-time settlement.'
      };
    }
  }

  // 2. Same-Day Urgency
  if (urgency === 'same-day' || urgency === 'instant') {
    // Fedwire for high value
    if (amount > 1000000) {
      return {
        rail: 'Fedwire',
        fee: 25.00,
        estimatedSettlement: currentHour < 18 ? 'Same-Day (within hours)' : 'Next Business Day',
        reasoning: 'High-value transaction routed via Fedwire.'
      };
    }
    // Same-Day ACH Limit: $1,000,000. Cutoff is typically around 16:00 (4 PM)
    if (amount <= 1000000 && currentHour < 16) {
      return {
        rail: 'ACH_SameDay',
        fee: 2.50,
        estimatedSettlement: 'Same-Day (by end of business)',
        reasoning: 'Routed via Same-Day ACH within the $1M limit and before the 4 PM cutoff.'
      };
    }
    // If past cutoff, fall back to Standard ACH or Fedwire if urgent
    if (urgency === 'instant') {
      return {
        rail: 'Fedwire',
        fee: 25.00,
        estimatedSettlement: currentHour < 18 ? 'Same-Day' : 'Next Business Day',
        reasoning: 'Instant requested but past ACH cutoff. Routed to Fedwire.'
      };
    }
  }

  // 3. Standard Urgency (Default / Lowest Cost)
  return {
    rail: 'ACH_Standard',
    fee: 0.25,
    estimatedSettlement: '1-2 Business Days',
    reasoning: 'Standard non-urgent transaction routed via cost-effective Standard ACH.'
  };
}


// ==========================================
// 4. ISO 20022 XML Generation (pain.001.001.08)
// ==========================================

export interface Pain001Data {
  msgId: string;
  creDtTm: string;
  nbOfTxs: number;
  ctrlSum: number;
  initgPtyName: string;
  paymentInfoId: string;
  reqdExctnDt: string; // YYYY-MM-DD
  dbtrName: string;
  dbtrAccount: string; // IBAN or Account Number
  dbtrRouting: string; // BIC or ABA Routing
  cdtrName: string;
  cdtrAccount: string; // IBAN or Account Number
  cdtrRouting: string; // BIC or ABA Routing
  amount: number;
  currency: string;
  remittanceInfo?: string;
}

/**
 * Helper: Escapes special characters for XML safety.
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Generates a valid ISO 20022 pain.001.001.08 Customer Credit Transfer Initiation XML.
 */
export function generatePain001XML(data: Pain001Data): string {
  const msgId = escapeXml(data.msgId);
  const creDtTm = escapeXml(data.creDtTm);
  const initgPtyName = escapeXml(data.initgPtyName);
  const paymentInfoId = escapeXml(data.paymentInfoId);
  const reqdExctnDt = escapeXml(data.reqdExctnDt);
  const dbtrName = escapeXml(data.dbtrName);
  const dbtrAccount = escapeXml(data.dbtrAccount);
  const dbtrRouting = escapeXml(data.dbtrRouting);
  const cdtrName = escapeXml(data.cdtrName);
  const cdtrAccount = escapeXml(data.cdtrAccount);
  const cdtrRouting = escapeXml(data.cdtrRouting);
  const remittanceInfo = data.remittanceInfo ? escapeXml(data.remittanceInfo) : 'B2B Payment';

  const isIban = (account: string) => /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/i.test(account);
  const isBic = (routing: string) => /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i.test(routing);

  // Debtor Account Block
  const dbtrAcctBlock = isIban(dbtrAccount)
    ? `<Id><IBAN>${dbtrAccount}</IBAN></Id>`
    : `<Id><Othr><Id>${dbtrAccount}</Id></Othr></Id>`;

  // Debtor Agent Block
  const dbtrAgtBlock = isBic(dbtrRouting)
    ? `<FinInstnId><BICFI>${dbtrRouting}</BICFI></FinInstnId>`
    : `<FinInstnId><ClrSysMmbId><ClrSysId><Cd>USABA</Cd></ClrSysId><MmbId>${dbtrRouting}</MmbId></ClrSysMmbId></FinInstnId>`;

  // Creditor Account Block
  const cdtrAcctBlock = isIban(cdtrAccount)
    ? `<Id><IBAN>${cdtrAccount}</IBAN></Id>`
    : `<Id><Othr><Id>${cdtrAccount}</Id></Othr></Id>`;

  // Creditor Agent Block
  const cdtrAgtBlock = isBic(cdtrRouting)
    ? `<FinInstnId><BICFI>${cdtrRouting}</BICFI></FinInstnId>`
    : `<FinInstnId><ClrSysMmbId><ClrSysId><Cd>USABA</Cd></ClrSysId><MmbId>${cdtrRouting}</MmbId></ClrSysMmbId></FinInstnId>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.08" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${msgId}</MsgId>
      <CreDtTm>${creDtTm}</CreDtTm>
      <NbOfTxs>${data.nbOfTxs}</NbOfTxs>
      <CtrlSum>${data.ctrlSum.toFixed(2)}</CtrlSum>
      <InitgPty>
        <Nm>${initgPtyName}</Nm>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${paymentInfoId}</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <NbOfTxs>${data.nbOfTxs}</NbOfTxs>
      <CtrlSum>${data.ctrlSum.toFixed(2)}</CtrlSum>
      <ReqdExctnDt>
        <Dt>${reqdExctnDt}</Dt>
      </ReqdExctnDt>
      <Dbtr>
        <Nm>${dbtrName}</Nm>
      </Dbtr>
      <DbtrAcct>
        ${dbtrAcctBlock}
      </DbtrAcct>
      <DbtrAgt>
        ${dbtrAgtBlock}
      </DbtrAgt>
      <CdtTrfTxInf>
        <PmtId>
          <EndToEndId>${msgId}-E2E</EndToEndId>
          <UETR>${crypto.randomUUID()}</UETR>
        </PmtId>
        <Amt>
          <InstdAmt Ccy="${data.currency}">${data.amount.toFixed(2)}</InstdAmt>
        </Amt>
        <CdtrAgt>
          ${cdtrAgtBlock}
        </CdtrAgt>
        <Cdtr>
          <Nm>${cdtrName}</Nm>
        </Cdtr>
        <CdtrAcct>
          ${cdtrAcctBlock}
        </CdtrAcct>
        <RmtInf>
          <Ustrd>${remittanceInfo}</Ustrd>
        </RmtInf>
      </CdtTrfTxInf>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`.trim();
}