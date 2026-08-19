

// --- CONSOLIDATED FROM: ./services/CitiAlpacaBridgeService.ts ---

import { v4 as uuidv4 } from 'uuid';
import { alpacaJournalsService } from './AlpacaJournalsService';

export interface CitiAlpacaSyncRecord {
  id: string;
  citi_wire_reference: string;
  citi_consent_id: string;
  amount: string;
  currency: string;
  alpaca_account_id: string;
  alpaca_journal_id: string;
  iso20022_message_type: 'pacs.008.001.08' | 'pacs.009.001.08';
  status: 'SETTLED' | 'IN_TRANSIT' | 'FAILED';
  timestamp: string;
  error_message?: string;
}

export class CitiAlpacaBridgeService {
  private static instance: CitiAlpacaBridgeService;
  private syncRecords: Map<string, CitiAlpacaSyncRecord[]> = new Map();

  private constructor() {
    this.seedDefaults();
  }

  public static getInstance(): CitiAlpacaBridgeService {
    if (!CitiAlpacaBridgeService.instance) {
      CitiAlpacaBridgeService.instance = new CitiAlpacaBridgeService();
    }
    return CitiAlpacaBridgeService.instance;
  }

  private seedDefaults() {
    const sampleAccountId = 'b9b19618-22dd-4e80-8432-fc9e1ba0b27d';
    this.syncRecords.set(sampleAccountId, [
      {
        id: uuidv4(),
        citi_wire_reference: 'CITI_UK_PAY_889021',
        citi_consent_id: '3IPY201998765409',
        amount: '250000.00',
        currency: 'USD',
        alpaca_account_id: sampleAccountId,
        alpaca_journal_id: uuidv4(),
        iso20022_message_type: 'pacs.008.001.08',
        status: 'SETTLED',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ]);
  }

  public async getSyncRecords(accountId: string): Promise<CitiAlpacaSyncRecord[]> {
    return this.syncRecords.get(accountId) || [];
  }

  public async getSyncRecordById(accountId: string, recordId: string): Promise<CitiAlpacaSyncRecord | null> {
    const records = this.syncRecords.get(accountId) || [];
    return records.find(r => r.id === recordId) || null;
  }

  public async executeCitiToAlpacaIso20022Wire(
    accountId: string,
    amountUSD: string,
    citiConsentId: string,
    messageType: 'pacs.008.001.08' | 'pacs.009.001.08' = 'pacs.008.001.08'
  ): Promise<CitiAlpacaSyncRecord> {
    if (!accountId) {
      throw new Error('Alpaca account ID is required');
    }
    if (!amountUSD || parseFloat(amountUSD) <= 0) {
      throw new Error('Invalid wire transfer amount');
    }
    if (!citiConsentId) {
      throw new Error('Citi consent ID is required');
    }

    const citiRef = `CITI_WIRE_${uuidv4().substring(0, 8).toUpperCase()}`;

    try {
      // Execute instant JNLC Journal in Alpaca
      const journal = await alpacaJournalsService.createSingleJournal(
        'CITI_TREASURY_CORRESPONDENT_OMNIBUS',
        accountId,
        amountUSD,
        'JNLC',
        `Citi Open Banking FAPI Wire (${citiRef})`
      );

      const record: CitiAlpacaSyncRecord = {
        id: uuidv4(),
        citi_wire_reference: citiRef,
        citi_consent_id: citiConsentId,
        amount: amountUSD,
        currency: 'USD',
        alpaca_account_id: accountId,
        alpaca_journal_id: journal?.id || uuidv4(),
        iso20022_message_type: messageType,
        status: 'SETTLED',
        timestamp: new Date().toISOString()
      };

      const list = this.syncRecords.get(accountId) || [];
      this.syncRecords.set(accountId, [record, ...list]);
      return record;
    } catch (error: any) {
      const failedRecord: CitiAlpacaSyncRecord = {
        id: uuidv4(),
        citi_wire_reference: citiRef,
        citi_consent_id: citiConsentId,
        amount: amountUSD,
        currency: 'USD',
        alpaca_account_id: accountId,
        alpaca_journal_id: '',
        iso20022_message_type: messageType,
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        error_message: error?.message || 'Unknown error during Alpaca journal creation'
      };

      const list = this.syncRecords.get(accountId) || [];
      this.syncRecords.set(accountId, [failedRecord, ...list]);
      return failedRecord;
    }
  }

  public async updateRecordStatus(
    accountId: string,
    recordId: string,
    status: 'SETTLED' | 'IN_TRANSIT' | 'FAILED',
    errorMessage?: string
  ): Promise<CitiAlpacaSyncRecord | null> {
    const records = this.syncRecords.get(accountId) || [];
    const recordIndex = records.findIndex(r => r.id === recordId);
    if (recordIndex === -1) {
      return null;
    }

    const updatedRecord = {
      ...records[recordIndex],
      status,
      error_message: errorMessage,
      timestamp: new Date().toISOString()
    };

    records[recordIndex] = updatedRecord;
    this.syncRecords.set(accountId, records);
    return updatedRecord;
  }
}

export const citiAlpacaBridgeService = CitiAlpacaBridgeService.getInstance();
export default CitiAlpacaBridgeService;