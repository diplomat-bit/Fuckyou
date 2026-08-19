

// --- CONSOLIDATED FROM: ./services/AlpacaFundingService.ts ---

import { v4 as uuidv4 } from 'uuid';

export interface AlpacaRecipientBank {
  id: string;
  account_id: string;
  name: string;
  bank_code: string;
  bank_code_type: 'ABA' | 'BIC';
  account_number: string;
  city: string;
  country: string;
  status: 'APPROVED' | 'QUEUED' | 'REJECTED';
  created_at: string;
}

export interface AlpacaACHRelationship {
  id: string;
  account_id: string;
  account_owner_name: string;
  bank_account_type: 'CHECKING' | 'SAVINGS';
  bank_account_number: string;
  bank_routing_number: string;
  nickname: string;
  status: 'QUEUED' | 'APPROVED' | 'REJECTED';
  created_at: string;
  updated_at: string;
  processor_token?: string; // For Plaid integration
}

export type AlpacaAchRelationship = AlpacaACHRelationship;

export interface AlpacaTransfer {
  id: string;
  account_id: string;
  transfer_type: 'ach' | 'wire';
  relationship_id?: string; // ACH relationship ID or Bank relationship ID
  bank_id?: string;
  amount: string;
  direction: 'INCOMING' | 'OUTGOING';
  status: 'QUEUED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETE';
  created_at: string;
  updated_at: string;
  source_bridge?: 'Citi' | 'Plaid' | 'Stripe' | 'ModernTreasury' | 'TaxLien' | 'Direct';
}

export interface AlpacaInstantFunding {
  id: string;
  account_no: string;
  source_account_no: string;
  amount: string;
  status: 'PENDING' | 'EXECUTED' | 'COMPLETED' | 'CANCELED';
  system_date: string;
  deadline: string;
  created_at: string;
}

export interface AlpacaFundingWallet {
  account_id: string;
  status: 'active' | 'disabled';
  created_at: string;
}

export interface AlpacaCryptoWallet {
  address: string;
  chain: string;
  created_at: string;
  asset: string;
}

export interface AlpacaCryptoWhitelist {
  id: string;
  address: string;
  asset: string;
  chain: string;
  status: 'APPROVED' | 'PENDING';
  created_at: string;
}

export interface AlpacaCryptoWithdrawal {
  id: string;
  account_id: string;
  address: string;
  asset: string;
  chain: string;
  amount: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  tx_hash?: string;
  created_at: string;
}

export class AlpacaFundingService {
  private static instance: AlpacaFundingService;

  private recipientBanks: Map<string, AlpacaRecipientBank[]> = new Map();
  private achRelationships: Map<string, AlpacaACHRelationship[]> = new Map();
  private transfers: Map<string, AlpacaTransfer[]> = new Map();
  private instantFundings: Map<string, AlpacaInstantFunding[]> = new Map();
  private fundingWallets: Map<string, AlpacaFundingWallet> = new Map();
  private cryptoWallets: Map<string, AlpacaCryptoWallet[]> = new Map();
  private cryptoWhitelists: Map<string, AlpacaCryptoWhitelist[]> = new Map();
  private cryptoWithdrawals: Map<string, AlpacaCryptoWithdrawal[]> = new Map();

  private constructor() {
    this.seedDefaults();
  }

  public static getInstance(): AlpacaFundingService {
    if (!AlpacaFundingService.instance) {
      AlpacaFundingService.instance = new AlpacaFundingService();
    }
    return AlpacaFundingService.instance;
  }

  private seedDefaults() {
    const sampleAccountId = 'b9b19618-22dd-4e80-8432-fc9e1ba0b27d';
    const sampleBankId = uuidv4();
    const sampleAchId = uuidv4();

    // Seed Recipient Banks
    this.recipientBanks.set(sampleAccountId, [
      {
        id: sampleBankId,
        account_id: sampleAccountId,
        name: 'Citi Sovereign Institutional Vault',
        bank_code: '021000089',
        bank_code_type: 'ABA',
        account_number: '777888999111',
        city: 'New York',
        country: 'USA',
        status: 'APPROVED',
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      }
    ]);

    // Seed ACH Relationships
    this.achRelationships.set(sampleAccountId, [
      {
        id: sampleAchId,
        account_id: sampleAccountId,
        account_owner_name: 'Awesome Alpaca Sovereign',
        bank_account_type: 'CHECKING',
        bank_account_number: '******4321',
        bank_routing_number: '121000248',
        nickname: 'Sovereign Treasury Checking',
        status: 'APPROVED',
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 15 * 86400000).toISOString()
      }
    ]);

    // Seed Transfers
    this.transfers.set(sampleAccountId, [
      {
        id: uuidv4(),
        account_id: sampleAccountId,
        transfer_type: 'wire',
        relationship_id: sampleBankId,
        amount: '5000000.00',
        direction: 'INCOMING',
        status: 'COMPLETE',
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        source_bridge: 'Citi'
      },
      {
        id: uuidv4(),
        account_id: sampleAccountId,
        transfer_type: 'ach',
        relationship_id: sampleAchId,
        amount: '250000.00',
        direction: 'INCOMING',
        status: 'COMPLETE',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        source_bridge: 'Plaid'
      },
      {
        id: uuidv4(),
        account_id: sampleAccountId,
        transfer_type: 'ach',
        relationship_id: sampleAchId,
        amount: '15000.00',
        direction: 'OUTGOING',
        status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source_bridge: 'Stripe'
      }
    ]);

    // Seed Funding Wallets
    this.fundingWallets.set(sampleAccountId, {
      account_id: sampleAccountId,
      status: 'active',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString()
    });

    // Seed Crypto Wallets
    this.cryptoWallets.set(sampleAccountId, [
      {
        address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        chain: 'ETH',
        asset: 'USDC',
        created_at: new Date(Date.now() - 20 * 86400000).toISOString()
      },
      {
        address: 'Sol11111111111111111111111111111111111111111',
        chain: 'SOL',
        asset: 'SOL',
        created_at: new Date(Date.now() - 20 * 86400000).toISOString()
      },
      {
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        chain: 'BTC',
        asset: 'BTC',
        created_at: new Date(Date.now() - 20 * 86400000).toISOString()
      }
    ]);

    // Seed Crypto Whitelists
    this.cryptoWhitelists.set(sampleAccountId, [
      {
        id: uuidv4(),
        address: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
        asset: 'USDC',
        chain: 'ETH',
        status: 'APPROVED',
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      }
    ]);

    // Seed Crypto Withdrawals
    this.cryptoWithdrawals.set(sampleAccountId, [
      {
        id: uuidv4(),
        account_id: sampleAccountId,
        address: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
        asset: 'USDC',
        chain: 'ETH',
        amount: '50000.00',
        status: 'COMPLETED',
        tx_hash: '0x9f83748291029384756102938475610293847561029384756102938475610293',
        created_at: new Date(Date.now() - 3 * 86400000).toISOString()
      }
    ]);

    // Seed Instant Funding
    this.instantFundings.set('927721227', [
      {
        id: uuidv4(),
        account_no: '927721227',
        source_account_no: '7536050SI',
        amount: '100000.00',
        status: 'COMPLETED',
        system_date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
        deadline: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
        created_at: new Date(Date.now() - 4 * 86400000).toISOString()
      }
    ]);
  }

  // --- Recipient Banks (Wire Relationships) ---

  public async getRecipientBanks(accountId: string): Promise<AlpacaRecipientBank[]> {
    return this.recipientBanks.get(accountId) || [];
  }

  public async createRecipientBank(
    accountId: string,
    bank: Omit<AlpacaRecipientBank, 'id' | 'account_id' | 'status' | 'created_at'>
  ): Promise<AlpacaRecipientBank> {
    const newBank: AlpacaRecipientBank = {
      id: uuidv4(),
      account_id: accountId,
      ...bank,
      status: 'APPROVED',
      created_at: new Date().toISOString()
    };
    const existing = this.recipientBanks.get(accountId) || [];
    this.recipientBanks.set(accountId, [...existing, newBank]);
    return newBank;
  }

  public async deleteRecipientBank(accountId: string, bankId: string): Promise<void> {
    const existing = this.recipientBanks.get(accountId) || [];
    const filtered = existing.filter((b) => b.id !== bankId);
    this.recipientBanks.set(accountId, filtered);
  }

  // --- ACH Relationships ---

  public async getACHRelationships(accountId: string): Promise<AlpacaACHRelationship[]> {
    return this.achRelationships.get(accountId) || [];
  }

  public async createACHRelationship(
    accountId: string,
    ach: Omit<AlpacaACHRelationship, 'id' | 'account_id' | 'status' | 'created_at' | 'updated_at'>
  ): Promise<AlpacaACHRelationship> {
    const newAch: AlpacaACHRelationship = {
      id: uuidv4(),
      account_id: accountId,
      ...ach,
      status: 'APPROVED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const existing = this.achRelationships.get(accountId) || [];
    this.achRelationships.set(accountId, [...existing, newAch]);
    return newAch;
  }

  public async linkPlaidAccount(
    accountId: string,
    processorToken: string,
    bankAccountName: string
  ): Promise<AlpacaACHRelationship> {
    const newAch: AlpacaACHRelationship = {
      id: uuidv4(),
      account_id: accountId,
      account_owner_name: 'Plaid Verified Owner',
      bank_account_type: 'CHECKING',
      bank_account_number: '******9999',
      bank_routing_number: '021000021',
      nickname: bankAccountName || 'Plaid Linked Account',
      status: 'APPROVED',
      processor_token: processorToken,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const existing = this.achRelationships.get(accountId) || [];
    this.achRelationships.set(accountId, [...existing, newAch]);
    return newAch;
  }

  public async deleteACHRelationship(accountId: string, achRelationshipId: string): Promise<void> {
    const existing = this.achRelationships.get(accountId) || [];
    const filtered = existing.filter((ach) => ach.id !== achRelationshipId);
    this.achRelationships.set(accountId, filtered);
  }

  // --- Transfers ---

  public async getTransfers(accountId: string): Promise<AlpacaTransfer[]> {
    return this.transfers.get(accountId) || [];
  }

  public async createTransfer(
    accountId: string,
    transfer: Omit<AlpacaTransfer, 'id' | 'account_id' | 'status' | 'created_at' | 'updated_at'>
  ): Promise<AlpacaTransfer> {
    const newTransfer: AlpacaTransfer = {
      id: uuidv4(),
      account_id: accountId,
      ...transfer,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const existing = this.transfers.get(accountId) || [];
    this.transfers.set(accountId, [newTransfer, ...existing]);

    // Simulate auto-approval/completion after 2 seconds for sandbox realism
    setTimeout(() => {
      newTransfer.status = 'COMPLETE';
      newTransfer.updated_at = new Date().toISOString();
    }, 2000);

    return newTransfer;
  }

  // --- Funding Wallets ---

  public async getFundingWallet(accountId: string): Promise<AlpacaFundingWallet> {
    let wallet = this.fundingWallets.get(accountId);
    if (!wallet) {
      wallet = { account_id: accountId, status: 'active', created_at: new Date().toISOString() };
      this.fundingWallets.set(accountId, wallet);
    }
    return wallet;
  }

  public async createFundingWallet(accountId: string): Promise<AlpacaFundingWallet> {
    const wallet: AlpacaFundingWallet = {
      account_id: accountId,
      status: 'active',
      created_at: new Date().toISOString()
    };
    this.fundingWallets.set(accountId, wallet);
    return wallet;
  }

  // --- Instant Funding ---

  public async getInstantFundings(accountNo: string): Promise<AlpacaInstantFunding[]> {
    return this.instantFundings.get(accountNo) || [];
  }

  public async createInstantFunding(accountNo: string, amount: string): Promise<AlpacaInstantFunding> {
    const item: AlpacaInstantFunding = {
      id: uuidv4(),
      account_no: accountNo,
      source_account_no: '927721227', // Firm sweep account
      amount,
      status: 'EXECUTED',
      system_date: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };
    const list = this.instantFundings.get(accountNo) || [];
    this.instantFundings.set(accountNo, [item, ...list]);
    return item;
  }

  // --- Crypto Wallets & Whitelists ---

  public async getCryptoWallets(accountId: string): Promise<AlpacaCryptoWallet[]> {
    return this.cryptoWallets.get(accountId) || [];
  }

  public async getCryptoWhitelists(accountId: string): Promise<AlpacaCryptoWhitelist[]> {
    return this.cryptoWhitelists.get(accountId) || [];
  }

  public async addCryptoWhitelist(
    accountId: string,
    address: string,
    asset: string,
    chain: string
  ): Promise<AlpacaCryptoWhitelist> {
    const item: AlpacaCryptoWhitelist = {
      id: uuidv4(),
      address,
      asset,
      chain,
      status: 'APPROVED',
      created_at: new Date().toISOString()
    };
    const existing = this.cryptoWhitelists.get(accountId) || [];
    this.cryptoWhitelists.set(accountId, [...existing, item]);
    return item;
  }

  public async deleteCryptoWhitelist(accountId: string, id: string): Promise<void> {
    const existing = this.cryptoWhitelists.get(accountId) || [];
    const filtered = existing.filter((item) => item.id !== id);
    this.cryptoWhitelists.set(accountId, filtered);
  }

  // --- Crypto Withdrawals ---

  public async getCryptoWithdrawals(accountId: string): Promise<AlpacaCryptoWithdrawal[]> {
    return this.cryptoWithdrawals.get(accountId) || [];
  }

  public async requestCryptoWithdrawal(
    accountId: string,
    address: string,
    asset: string,
    chain: string,
    amount: string
  ): Promise<AlpacaCryptoWithdrawal> {
    const withdrawal: AlpacaCryptoWithdrawal = {
      id: uuidv4(),
      account_id: accountId,
      address,
      asset,
      chain,
      amount,
      status: 'PENDING',
      created_at: new Date().toISOString()
    };
    const existing = this.cryptoWithdrawals.get(accountId) || [];
    this.cryptoWithdrawals.set(accountId, [withdrawal, ...existing]);

    // Simulate blockchain execution
    setTimeout(() => {
      withdrawal.status = 'COMPLETED';
      withdrawal.tx_hash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }, 3000);

    return withdrawal;
  }

  // --- Bridge Integrations ---

  public async initiateCitiBridgeWire(
    accountId: string,
    amount: string,
    direction: 'INCOMING' | 'OUTGOING'
  ): Promise<AlpacaTransfer> {
    const banks = await this.getRecipientBanks(accountId);
    const bankId = banks.length > 0 ? banks[0].id : undefined;

    return this.createTransfer(accountId, {
      transfer_type: 'wire',
      relationship_id: bankId,
      amount,
      direction,
      source_bridge: 'Citi'
    });
  }

  public async initiatePlaidBridgeACH(
    accountId: string,
    amount: string,
    direction: 'INCOMING' | 'OUTGOING'
  ): Promise<AlpacaTransfer> {
    const achs = await this.getACHRelationships(accountId);
    const achId = achs.length > 0 ? achs[0].id : undefined;

    return this.createTransfer(accountId, {
      transfer_type: 'ach',
      relationship_id: achId,
      amount,
      direction,
      source_bridge: 'Plaid'
    });
  }

  public async initiateStripeBridgeTransfer(
    accountId: string,
    amount: string,
    direction: 'INCOMING' | 'OUTGOING'
  ): Promise<AlpacaTransfer> {
    return this.createTransfer(accountId, {
      transfer_type: 'ach',
      amount,
      direction,
      source_bridge: 'Stripe'
    });
  }

  public async initiateTaxLienBridgeTransfer(
    accountId: string,
    amount: string
  ): Promise<AlpacaTransfer> {
    return this.createTransfer(accountId, {
      transfer_type: 'wire',
      amount,
      direction: 'OUTGOING',
      source_bridge: 'TaxLien'
    });
  }
}

export const alpacaFundingService = AlpacaFundingService.getInstance();
export default AlpacaFundingService;