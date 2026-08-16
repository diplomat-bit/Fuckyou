import { v4 as uuidv4 } from 'uuid';

export interface AlpacaJournal {
  id: string;
  entry_type: 'JNLC' | 'JNLS';
  from_account: string;
  to_account: string;
  amount?: string;
  status: 'pending' | 'queued' | 'executed' | 'canceled' | 'rejected';
  created_at: string;
  description?: string;
  settle_date?: string;
  symbol?: string;
  qty?: string;
  currency?: string;
  error_message?: string;
}

export interface BatchJournalEntry {
  to_account: string;
  amount?: string;
  symbol?: string;
  qty?: string;
  description?: string;
}

export interface ReverseBatchJournalEntry {
  from_account: string;
  amount?: string;
  symbol?: string;
  qty?: string;
  description?: string;
}

export interface JournalComplianceReport {
  isCompliant: boolean;
  riskScore: number;
  violations: string[];
  zkProof: string;
}

export class AlpacaJournalsService {
  private static instance: AlpacaJournalsService;
  private journals: AlpacaJournal[] = [];
  private journalLimits: Map<string, number> = new Map();

  private constructor() {
    this.seedDefaultJournals();
    this.initializeLimits();
  }

  public static getInstance(): AlpacaJournalsService {
    if (!AlpacaJournalsService.instance) {
      AlpacaJournalsService.instance = new AlpacaJournalsService();
    }
    return AlpacaJournalsService.instance;
  }

  private initializeLimits() {
    this.journalLimits.set('daily_limit', 100000.00);
    this.journalLimits.set('transaction_limit', 50000.00);
  }

  private seedDefaultJournals() {
    this.journals.push({
      id: uuidv4() || '',
      entry_type: 'JNLC',
      from_account: '8f8c8cee-2591-4f83-be12-82c659b5e748',
      to_account: 'b9b19618-22dd-4e80-8432-fc9e1ba0b27d',
      amount: '5000.00',
      status: 'executed',
      created_at: new Date().toISOString(),
      description: 'Initial Sovereign Capital Injection',
      settle_date: new Date().toISOString().split('T')[0]
    });
    this.journals.push({
      id: uuidv4() || '',
      entry_type: 'JNLS',
      from_account: '8f8c8cee-2591-4f83-be12-82c659b5e748',
      to_account: 'b9b19618-22dd-4e80-8432-fc9e1ba0b27d',
      symbol: 'AAPL',
      qty: '10',
      status: 'executed',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      description: 'Sovereign Equity Grant (AAPL)',
      settle_date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
    });
  }

  private async performComplianceCheck(
    fromAccount: string,
    toAccount: string,
    amount?: string,
    symbol?: string,
    qty?: string
  ): Promise<JournalComplianceReport> {
    const violations: string[] = [];
    let riskScore = 0;

    if (amount) {
      const numAmount = parseFloat(amount);
      const txLimit = this.journalLimits.get('transaction_limit') || 50000;
      if (numAmount > txLimit) {
        violations.push(`Transaction amount $${amount} exceeds the single transaction limit of $${txLimit}`);
        riskScore += 40;
      }
    }

    try {
      const { SecurityService } = await import('./SecurityService');
      const security = (SecurityService as any).getInstance();
      if (security && typeof security.verifyAccountAccess === 'function') {
        const isFromAuthorized = await security.verifyAccountAccess(fromAccount);
        const isToAuthorized = await security.verifyAccountAccess(toAccount);
        if (!isFromAuthorized || !isToAuthorized) {
          violations.push('One or both accounts failed security authorization checks');
          riskScore += 50;
        }
      }
    } catch (e) {}

    try {
      const { SovereignIntelligence } = await import('./SovereignIntelligence');
      const sovereign = (SovereignIntelligence as any).getInstance();
      if (sovereign && typeof sovereign.checkSanctionsList === 'function') {
        const isSanctionedFrom = await sovereign.checkSanctionsList(fromAccount);
        const isSanctionedTo = await sovereign.checkSanctionsList(toAccount);
        if (isSanctionedFrom || isSanctionedTo) {
          violations.push('Transaction involves a sanctioned entity or restricted account');
          riskScore += 100;
        }
      }
    } catch (e) {}

    return {
      isCompliant: violations.length === 0,
      riskScore,
      violations,
      zkProof: ''
    };
  }

  private async generateZkProof(journal: AlpacaJournal): Promise<string> {
    try {
      const { ZKPEngine } = await import('./ZKPEngine');
      const zkp = (ZKPEngine as any).getInstance();
      if (zkp && typeof zkp.generateTransactionProof === 'function') {
        const proof = await zkp.generateTransactionProof({
          id: journal.id || '',
          from: journal.from_account || '',
          to: journal.to_account || '',
          amount: journal.amount || '0',
          symbol: journal.symbol || 'USD',
          qty: journal.qty || '0',
          timestamp: journal.created_at || ''
        });
        return proof || '';
      }
    } catch (e) {}
    return '';
  }

  private async syncToLedger(journal: AlpacaJournal): Promise<void> {
    try {
      const { ModernTreasuryService } = await import('./ModernTreasuryService');
      const mt = (ModernTreasuryService as any).getInstance();
      if (mt && typeof mt.recordJournalEntry === 'function') {
        await mt.recordJournalEntry({
          externalId: journal.id || '',
          fromAccount: journal.from_account || '',
          toAccount: journal.to_account || '',
          amount: journal.amount ? parseFloat(journal.amount) : 0,
          currency: journal.currency || 'USD',
          description: journal.description || 'Alpaca Journal Sync'
        });
      }
    } catch (e) {}

    try {
      const { CitiAlpacaBridgeService } = await import('./CitiAlpacaBridgeService');
      const bridge = (CitiAlpacaBridgeService as any).getInstance();
      if (bridge && typeof bridge.syncJournalToCitiLedger === 'function') {
        await bridge.syncJournalToCitiLedger(journal);
      }
    } catch (e) {}
  }

  private async publishJournalEvent(event: string, journal: AlpacaJournal): Promise<void> {
    try {
      const { PulsarService } = await import('./PulsarService');
      const pulsar = (PulsarService as any).getInstance();
      if (pulsar && typeof pulsar.publishEvent === 'function') {
        await pulsar.publishEvent(`alpaca.journals.${event}`, {
          journalId: journal.id || '',
          entryType: journal.entry_type || '',
          fromAccount: journal.from_account || '',
          toAccount: journal.to_account || '',
          amount: journal.amount || '0',
          symbol: journal.symbol || '',
          qty: journal.qty || '0',
          status: journal.status || '',
          timestamp: journal.created_at || ''
        });
      }
    } catch (e) {}
  }

  public async getJournals(): Promise<AlpacaJournal[]> {
    return this.journals;
  }

  public async getJournalById(id: string): Promise<AlpacaJournal | undefined> {
    return this.journals.find(j => j.id === id);
  }

  public async getJournalsByAccount(accountId: string): Promise<AlpacaJournal[]> {
    return this.journals.filter(j => j.from_account === accountId || j.to_account === accountId);
  }

  public async getJournalsByStatus(status: AlpacaJournal['status']): Promise<AlpacaJournal[]> {
    return this.journals.filter(j => j.status === status);
  }

  public async cancelJournal(id: string): Promise<AlpacaJournal> {
    const journal = this.journals.find(j => j.id === id);
    if (!journal) {
      throw new Error(`Journal with ID ${id} not found`);
    }
    if (journal.status !== 'pending' && journal.status !== 'queued') {
      throw new Error(`Journal with ID ${id} cannot be canceled because its status is ${journal.status}`);
    }
    journal.status = 'canceled';
    await this.publishJournalEvent('canceled', journal);
    return journal;
  }

  public async createSingleJournal(
    fromAccount: string,
    toAccount: string,
    amount?: string,
    entryType: 'JNLC' | 'JNLS' = 'JNLC',
    description?: string,
    symbol?: string,
    qty?: string
  ): Promise<AlpacaJournal> {
    const compliance = await this.performComplianceCheck(fromAccount, toAccount, amount, symbol, qty);
    
    let status: AlpacaJournal['status'] = 'executed';
    let errorMessage: string | undefined;

    if (!compliance.isCompliant) {
      if (compliance.riskScore >= 100) {
        status = 'rejected';
        errorMessage = `Compliance Violation: ${compliance.violations.join('; ')}`;
      } else {
        status = 'pending';
        errorMessage = `Pending Approval: ${compliance.violations.join('; ')}`;
      }
    }

    const journal: AlpacaJournal = {
      id: uuidv4() || '',
      entry_type: entryType,
      from_account: fromAccount,
      to_account: toAccount,
      amount: entryType === 'JNLC' ? amount : undefined,
      symbol: entryType === 'JNLS' ? symbol : undefined,
      qty: entryType === 'JNLS' ? qty : undefined,
      status,
      created_at: new Date().toISOString(),
      settle_date: status === 'executed' ? new Date().toISOString().split('T')[0] : undefined,
      description: description || `Single Journal Execution (${entryType})`,
      currency: 'USD',
      error_message: errorMessage
    };

    if (status === 'executed') {
      const zkProof = await this.generateZkProof(journal);
      if (zkProof && zkProof !== '') {
        journal.description += ` [ZKP Verified]`;
      }
    }

    this.journals.unshift(journal);

    if (status === 'executed') {
      await this.syncToLedger(journal);
      await this.publishJournalEvent('created', journal);
      await this.publishJournalEvent('executed', journal);
    } else {
      await this.publishJournalEvent('created', journal);
    }

    return journal;
  }

  public async createBatchJournal(fromAccount: string, entries: BatchJournalEntry[]): Promise<AlpacaJournal[]> {
    const created: AlpacaJournal[] = [];
    for (const entry of entries) {
      const compliance = await this.performComplianceCheck(fromAccount, entry.to_account, entry.amount, entry.symbol, entry.qty);
      
      let status: AlpacaJournal['status'] = 'executed';
      let errorMessage: string | undefined;

      if (!compliance.isCompliant) {
        if (compliance.riskScore >= 100) {
          status = 'rejected';
          errorMessage = `Compliance Violation: ${compliance.violations.join('; ')}`;
        } else {
          status = 'pending';
          errorMessage = `Pending Approval: ${compliance.violations.join('; ')}`;
        }
      }

      const journal: AlpacaJournal = {
        id: uuidv4() || '',
        entry_type: entry.symbol ? 'JNLS' : 'JNLC',
        from_account: fromAccount,
        to_account: entry.to_account,
        amount: entry.amount,
        symbol: entry.symbol,
        qty: entry.qty,
        status,
        created_at: new Date().toISOString(),
        settle_date: status === 'executed' ? new Date().toISOString().split('T')[0] : undefined,
        description: entry.description || 'Batch 1-to-Many Sweep',
        currency: 'USD',
        error_message: errorMessage
      };

      if (status === 'executed') {
        const zkProof = await this.generateZkProof(journal);
        if (zkProof && zkProof !== '') {
          journal.description += ` [ZKP Verified]`;
        }
      }

      this.journals.unshift(journal);
      created.push(journal);

      if (status === 'executed') {
        await this.syncToLedger(journal);
        await this.publishJournalEvent('created', journal);
        await this.publishJournalEvent('executed', journal);
      } else {
        await this.publishJournalEvent('created', journal);
      }
    }
    return created;
  }

  public async createReverseBatchJournal(toAccount: string, entries: ReverseBatchJournalEntry[]): Promise<AlpacaJournal[]> {
    const created: AlpacaJournal[] = [];
    for (const entry of entries) {
      const compliance = await this.performComplianceCheck(entry.from_account, toAccount, entry.amount, entry.symbol, entry.qty);
      
      let status: AlpacaJournal['status'] = 'executed';
      let errorMessage: string | undefined;

      if (!compliance.isCompliant) {
        if (compliance.riskScore >= 100) {
          status = 'rejected';
          errorMessage = `Compliance Violation: ${compliance.violations.join('; ')}`;
        } else {
          status = 'pending';
          errorMessage = `Pending Approval: ${compliance.violations.join('; ')}`;
        }
      }

      const journal: AlpacaJournal = {
        id: uuidv4() || '',
        entry_type: entry.symbol ? 'JNLS' : 'JNLC',
        from_account: entry.from_account,
        to_account: toAccount,
        amount: entry.amount,
        symbol: entry.symbol,
        qty: entry.qty,
        status,
        created_at: new Date().toISOString(),
        settle_date: status === 'executed' ? new Date().toISOString().split('T')[0] : undefined,
        description: entry.description || 'Reverse Batch Many-to-1 Sweep',
        currency: 'USD',
        error_message: errorMessage
      };

      if (status === 'executed') {
        const zkProof = await this.generateZkProof(journal);
        if (zkProof && zkProof !== '') {
          journal.description += ` [ZKP Verified]`;
        }
      }

      this.journals.unshift(journal);
      created.push(journal);

      if (status === 'executed') {
        await this.syncToLedger(journal);
        await this.publishJournalEvent('created', journal);
        await this.publishJournalEvent('executed', journal);
      } else {
        await this.publishJournalEvent('created', journal);
      }
    }
    return created;
  }

  public updateJournalLimit(key: 'daily_limit' | 'transaction_limit', limit: number): void {
    this.journalLimits.set(key, limit);
  }

  public getJournalLimits(): { daily_limit: number; transaction_limit: number } {
    return {
      daily_limit: this.journalLimits.get('daily_limit') || 100000.00,
      transaction_limit: this.journalLimits.get('transaction_limit') || 50000.00
    };
  }
}

export const alpacaJournalsService = AlpacaJournalsService.getInstance();
export default AlpacaJournalsService;