

// --- CONSOLIDATED FROM: ./components/CitiB2B/MockDataGenerator.tsx ---

import React, { useState, useEffect, useCallback } from 'react';

// ==========================================
// TYPE DEFINITIONS (Matching OpenAPI Schemas)
// ==========================================

export interface Customer {
  customerId: string;
}

export interface GroupBalance {
  localCurrencyCode: string;
  localCurrencyBalanceAmount: number;
}

export interface CheckingAccountDetails {
  productName: string;
  accountNickname?: string;
  accountDescription?: string;
  balanceType: 'ASSET' | 'LIABILITY';
  displayAccountNumber: string;
  accountId: string;
  currencyCode: string;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  currentBalance?: number;
  availableBalance?: number;
}

export interface SavingsAccountDetails {
  productName: string;
  accountNickname?: string;
  accountDescription?: string;
  balanceType: 'ASSET' | 'LIABILITY';
  displayAccountNumber: string;
  accountId: string;
  currencyCode: string;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  currentBalance?: number;
  availableBalance?: number;
  maturityDate?: string;
  maturityTerm?: string;
}

export interface CreditCardAccountDetails {
  productName: string;
  accountDescription?: string;
  balanceType: 'ASSET' | 'LIABILITY';
  displayAccountNumber: string;
  accountId: string;
  currencyCode: string;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  availableCredit?: number;
  creditLimit?: number;
  purchasesAPR?: number;
  minimumDueAmount?: number;
  paymentDueDate?: string;
  currentBalance?: number;
  lastStatementBalance?: number;
  lastStatementDate?: string;
  advancesAPR?: number;
  cashAdvanceLimit?: number;
  cashAdvanceAvailableAmount?: number;
  lastPaymentAmount?: number;
  lastPaymentDate?: string;
  ctdPurchaseBalanceAmount?: number;
  purchaseSpendLimitAmount?: number;
  remainingPurchaseSpendAmount?: number;
}

export interface LoanAccountDetails {
  productName: string;
  balanceType: 'ASSET' | 'LIABILITY';
  displayAccountNumber: string;
  accountDescription?: string;
  accountNickname?: string;
  accountId: string;
  currencyCode: string;
  currentBalanceAmount?: number;
  creditAvailableAmount?: number;
  paymentDueAmount?: number;
  paymentDueDate?: string;
  autoPayFlag?: boolean;
  lastPaymentAmount?: number;
  lastPaymentDate?: string;
}

export interface LineOfCreditAccountDetails {
  productName: string;
  balanceType: 'ASSET' | 'LIABILITY';
  displayAccountNumber: string;
  accountDescription?: string;
  accountNickname?: string;
  accountId: string;
  currencyCode: string;
  accountStatus?: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  creditAvailableAmount?: number;
  currentBalanceAmount?: number;
  paymentDueAmount?: number;
  lastPaymentAmount?: number;
}

export interface AccountHolding {
  currencyCode: string;
  cusip: string;
  holdingCategory: 'Fixed Income' | 'Cash, Money Funds, Bank Deposits' | 'Mutual Funds' | 'Equities' | 'Others';
  quantity?: number;
  securityName?: string;
  asOfDateTime?: string;
  assetClass?: 'FIXED INCOME' | 'CASH' | 'MUTUAL FUND' | 'EQUITY' | 'OTHER';
  symbol?: string;
  price?: number;
  totalValueAmount?: number;
  changeInPercent?: number;
  changeInPrice?: number;
  changeInValue?: number;
  previousPrice?: number;
}

export interface BrokerageAccountDetails {
  accountId: string;
  displayAccountNumber: string;
  accountRegistrationType: 'INDIVDUALINVESTMENTS' | 'TRADITIONALIRA' | 'ROTHIRA' | 'SEPIRA' | 'PLAN529' | 'RETIREMENT' | 'RETAIL' | 'RVP_DVP' | 'RETAIL_THIRD_PARTY_AS_CUSTODIAN' | 'SELF_DIRECTED_401K' | 'UNKNOWN';
  accountTradingCapableFlag: boolean;
  balanceType: 'ASSET' | 'LIABILITY';
  productName?: string;
  accountDescription?: string;
  brokerageAccountTransactionTypes?: ('CASH' | 'MARGIN' | 'NONE')[];
  accountHoldings?: AccountHolding[];
  totalPortfolioBalanceAmount?: number;
}

export interface RetirementPlanComponent {
  componentName: string;
  currencyCode: string;
  currentTerms?: string;
  totalValueAmount: number;
  interestPaidYTD?: number;
  nextMaturityDate?: string;
}

export interface RetirementAccountDetails {
  productName: string;
  balanceType: 'ASSET' | 'LIABILITY';
  displayAccountNumber: string;
  accountDescription?: string;
  accountId: string;
  accountValue?: number;
  accountStatus: 'ACTIVE';
  asOfDateTime?: string;
  retirementPlanComponents?: RetirementPlanComponent[];
}

export interface AccountGroupDetails {
  accountGroup: 'CHECKING' | 'SAVINGS' | 'CREDITCARD' | 'LOAN' | 'LINEOFCREDIT' | 'BROKERAGE' | 'RETIREMENT';
  checkingAccountsDetails?: CheckingAccountDetails[];
  savingsAccountsDetails?: SavingsAccountDetails[];
  creditCardAccountsDetails?: CreditCardAccountDetails[];
  loanAccountsDetails?: LoanAccountDetails[];
  lineOfCreditAccountsDetails?: LineOfCreditAccountDetails[];
  brokerageAccountsDetails?: BrokerageAccountDetails[];
  retirementAccountsDetails?: RetirementAccountDetails[];
  totalCurrentBalance?: GroupBalance;
  totalAvailableBalance?: GroupBalance;
}

export interface AccountsGroupDetailsList {
  accountGroupDetails?: AccountGroupDetails[];
  customer?: Customer;
}

export interface CheckingAccountTransaction {
  accountId: string;
  checkNumber?: number;
  currencyCode: string;
  debitCreditMemo?: 'DEBIT' | 'CREDIT';
  displayAccountNumber?: string;
  transactionAmount: number;
  transactionDate: string;
  transactionDescription?: string;
  transactionDescriptionExtension?: string;
  transactionId?: string;
  transactionStatus?: 'PENDING' | 'POSTED';
  transactionType?: 'DEPOSIT' | 'PAYMENT' | 'TRANSFER' | 'WITHDRAWAL_OR_DEPOSIT' | 'WITHDRAWAL' | 'DIVIDEND_AND_INTEREST' | 'FEES' | 'ADJUSTMENTS' | 'TRANSACTION_VOID' | 'FEE_WAIVED' | 'OTHER';
}

export interface SavingsAccountTransaction {
  accountId: string;
  checkNumber?: number;
  currencyCode: string;
  debitCreditMemo?: 'DEBIT' | 'CREDIT';
  displayAccountNumber?: string;
  transactionAmount: number;
  transactionDate: string;
  transactionDescription?: string;
  transactionDescriptionExtension?: string;
  transactionId?: string;
  transactionStatus?: 'PENDING' | 'POSTED';
  transactionType?: 'DEPOSIT' | 'PAYMENT' | 'TRANSFER' | 'WITHDRAWAL_OR_DEPOSIT' | 'WITHDRAWAL' | 'DIVIDEND_AND_INTEREST' | 'FEES' | 'ADJUSTMENTS' | 'TRANSACTION_VOID' | 'FEE_WAIVED' | 'OTHER';
}

export interface CreditCardAccountTransaction {
  accountId: string;
  currencyCode: string;
  debitCreditMemo?: 'DEBIT' | 'CREDIT';
  displayAccountNumber?: string;
  foreignCurrency?: number;
  merchantCategory?: string;
  merchantDescription?: string;
  merchantCountry?: string;
  transactionDate: string;
  transactionPostingDate?: string;
  transactionId?: string;
  transactionAmount: number;
  transactionDescription?: string;
  transactionStatus: 'PENDING' | 'BILLED' | 'UNBILLED' | 'UNPROCESSED_PAYMENTS';
  transactionType: 'PAYMENT' | 'PURCHASE' | 'CASH_ADVANCES' | 'FEES' | 'INTEREST_CHARGES' | 'ADJUSTMENT' | 'CREDIT';
  memberName?: string;
}

export interface LoanAccountTransaction {
  accountId: string;
  displayAccountNumber?: string;
  transactionDate: string;
  transactionType: 'PAYMENT' | 'PURCHASE' | 'CASH_ADVANCE' | 'FEE' | 'INTEREST_CHARGED' | 'PURCHASE_CREDIT' | 'CREDIT';
  transactionAmount: number;
  debitCreditMemo?: 'DEBIT' | 'CREDIT';
  transactionId?: string;
  transactionDescription?: string;
  transactionDescriptionExtension?: string;
  transactionStatus?: 'PENDING' | 'POSTED';
  transactionPostingDate?: string;
  currencyCode: string;
  checkNumber?: string;
}

export interface LineOfCreditAccountTransaction {
  accountId: string;
  displayAccountNumber?: string;
  transactionDate: string;
  transactionType: 'PAYMENT' | 'PURCHASE' | 'CASH_ADVANCE' | 'FEE' | 'INTEREST_CHARGED' | 'PURCHASE_CREDIT' | 'CREDIT';
  transactionAmount: number;
  debitCreditMemo?: 'DEBIT' | 'CREDIT';
  transactionId?: string;
  transactionDescription?: string;
  transactionDescriptionExtension?: string;
  transactionStatus?: 'PENDING' | 'POSTED';
  transactionPostingDate?: string;
  currencyCode: string;
  checkNumber?: string;
}

export interface SecurityIdentifier {
  symbol?: string;
  cusip?: string;
}

export interface BrokerageAccountTransaction {
  accountId: string;
  displayAccountNumber?: string;
  currencyCode: string;
  securityIdentifier?: SecurityIdentifier;
  assetClass: string;
  assetType: string;
  buySellIndicator?: 'BUY' | 'SELL' | 'NONE';
  longActivityDescription: string;
  netAmount?: number;
  priceAmount?: number;
  principalAmount?: number;
  quantity?: number;
  settlementDate?: string;
  shortActivityDescription: string;
  tradeNumber?: string;
  tradeTransactionFlag?: string;
  transactionDateTime: string;
  transactionId: string;
  transactionType: 'PAYMENT' | 'PURCHASE' | 'CASH_ADVANCES' | 'FEES' | 'INTEREST_CHARGES' | 'PURCHASE_CREDIT' | 'CREDIT' | 'WITHDRAWAL_OR_DEPOSIT' | 'SECURITY_TRANSACTION' | 'DIVIDEND_AND_INTEREST' | 'OTHER' | 'COMMON_STOCK_TRANSACTION' | 'PREFERRED_STOCK_TRANSACTION' | 'OPTIONS_TRANSACTION' | 'MUTUAL_FUND_TRANSACTION' | 'BOND_TRANSACTION' | 'CERTIFICATE_OF_DEPOSIT_TRANSACTION' | 'ADJUSTMENTS';
}

export interface GetAccountTransactionsResp {
  checkingAccountTransactions?: CheckingAccountTransaction[];
  savingsAccountTransactions?: SavingsAccountTransaction[];
  creditCardAccountTransactions?: CreditCardAccountTransaction[];
  loanAccountTransactions?: LoanAccountTransaction[];
  lineOfCreditAccountTransactions?: LineOfCreditAccountTransaction[];
  brokerageAccountTransactions?: BrokerageAccountTransaction[];
}

export interface EncryptedAccountRoutingNumber {
  encryptedAccountNumber?: {
    encryptedPayload?: {
      header?: {
        zip?: string;
        alg?: string;
        enc?: string;
        kid?: string;
        x5c?: string[];
        cty?: string;
      };
      encrypted_key?: string;
      iv?: string;
      ciphertext?: string;
      authTag?: string;
      aad?: string;
    };
  };
  routingNumber?: string;
}

export interface ErrorResponse {
  type: 'error' | 'warn' | 'invalid' | 'fatal';
  code: string;
  details?: string;
  location?: string;
  moreInfo?: string;
}

export interface ErrorList {
  errors: ErrorResponse[];
}

// ==========================================
// SCENARIO CONFIGURATIONS & CONSTANTS
// ==========================================

type ScenarioType = 
  | 'standard' 
  | 'high_net_worth' 
  | 'no_accounts' 
  | 'unauthorized' 
  | 'forbidden' 
  | 'server_error' 
  | 'high_volume_tx' 
  | 'empty_tx' 
  | 'cd_maturity_edge';

interface GeneratorConfig {
  scenario: ScenarioType;
  balanceMultiplier: number;
  currencyCode: string;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  transactionCount: number;
  customCustomerId: string;
}

const DEFAULT_CONFIG: GeneratorConfig = {
  scenario: 'standard',
  balanceMultiplier: 1.0,
  currencyCode: 'USD',
  accountStatus: 'ACTIVE',
  transactionCount: 5,
  customCustomerId: 'bd12a6d89815aed77be876225b9a2c7f6648f0af82e84198f49d1b7e51a23fae1621936bc1addf5fdceca25c3aae5f92071fb1d6218dae32ca83b199c29962ee',
};

// ==========================================
// MAIN REACT COMPONENT
// ==========================================

export function MockDataGenerator() {
  const [config, setConfig] = useState<GeneratorConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions' | 'routing' | 'errors'>('accounts');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [generatedAccounts, setGeneratedAccounts] = useState<AccountsGroupDetailsList | ErrorList | null>(null);
  const [generatedTransactions, setGeneratedTransactions] = useState<GetAccountTransactionsResp | ErrorList | null>(null);
  const [generatedRouting, setGeneratedRouting] = useState<EncryptedAccountRoutingNumber | ErrorList | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Helper to generate unique IDs
  const generateId = (prefix: string) => {
    return `${prefix}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  };

  // Generate Accounts Details based on configuration
  const handleGenerateAccounts = useCallback((cfg: GeneratorConfig) => {
    const { scenario, balanceMultiplier, currencyCode, accountStatus, customCustomerId } = cfg;

    // Handle Error Scenarios
    if (scenario === 'unauthorized') {
      return {
        errors: [
          {
            type: 'error' as const,
            code: 'unAuthorized',
            details: 'Authorization credentials are missing or invalid',
            moreInfo: 'https://developer.citi.com/errors/unAuthorized'
          }
        ]
      };
    }

    if (scenario === 'forbidden') {
      return {
        errors: [
          {
            type: 'error' as const,
            code: 'accessNotConfigured',
            details: 'The request operation is not configured to access this resource',
            location: 'Channel/Country/Business',
            moreInfo: 'https://developer.citi.com/errors/accessNotConfigured'
          }
        ]
      };
    }

    if (scenario === 'server_error') {
      return {
        errors: [
          {
            type: 'fatal' as const,
            code: 'serverUnavailable',
            details: 'The request failed due to an internal error/server unavailability',
            moreInfo: 'https://developer.citi.com/errors/serverUnavailable'
          }
        ]
      };
    }

    if (scenario === 'no_accounts') {
      return {
        errors: [
          {
            type: 'invalid' as const,
            code: 'noAccounts',
            details: 'No active accounts or No accounts linked for customer',
            location: 'client_id'
          }
        ]
      };
    }

    // Standard & Custom Data Generation
    const accountGroupDetails: AccountGroupDetails[] = [];

    // 1. Checking Accounts
    const checkingDetails: CheckingAccountDetails[] = [
      {
        productName: scenario === 'high_net_worth' ? 'Citi Alliance Business Checking' : 'Business Checking',
        accountNickname: 'Primary Operating Account',
        accountDescription: `Business Checking - ${scenario === 'high_net_worth' ? '8899' : '9594'}`,
        balanceType: 'ASSET',
        displayAccountNumber: scenario === 'high_net_worth' ? 'XXXXXXXX8899' : 'XXXXXX9594',
        accountId: 'checking_acc_101',
        currencyCode,
        accountStatus,
        currentBalance: Math.round(25000 * balanceMultiplier * 100) / 100,
        availableBalance: Math.round(28500 * balanceMultiplier * 100) / 100,
      }
    ];

    accountGroupDetails.push({
      accountGroup: 'CHECKING',
      checkingAccountsDetails: checkingDetails,
      totalCurrentBalance: {
        localCurrencyCode: currencyCode,
        localCurrencyBalanceAmount: checkingDetails[0].currentBalance || 0
      },
      totalAvailableBalance: {
        localCurrencyCode: currencyCode,
        localCurrencyBalanceAmount: checkingDetails[0].availableBalance || 0
      }
    });

    // 2. Savings Accounts
    const savingsDetails: SavingsAccountDetails[] = [
      {
        productName: 'Citi Gold Savings Account',
        accountNickname: 'Reserve Fund',
        accountDescription: 'Citi Gold Savings Account - 2033',
        balanceType: 'ASSET',
        displayAccountNumber: 'XXXXXX2033',
        accountId: 'savings_acc_202',
        currencyCode,
        accountStatus,
        currentBalance: Math.round(150000 * balanceMultiplier * 100) / 100,
        availableBalance: Math.round(150000 * balanceMultiplier * 100) / 100,
        ...(scenario === 'cd_maturity_edge' ? {
          maturityDate: '2026-09-15',
          maturityTerm: '1 Year'
        } : {})
      }
    ];

    accountGroupDetails.push({
      accountGroup: 'SAVINGS',
      savingsAccountsDetails: savingsDetails,
      totalCurrentBalance: {
        localCurrencyCode: currencyCode,
        localCurrencyBalanceAmount: savingsDetails[0].currentBalance || 0
      },
      totalAvailableBalance: {
        localCurrencyCode: currencyCode,
        localCurrencyBalanceAmount: savingsDetails[0].availableBalance || 0
      }
    });

    // 3. Credit Cards
    const creditCardDetails: CreditCardAccountDetails[] = [
      {
        productName: 'Citi Rewards+℠ Card',
        accountDescription: 'Citi Rewards+℠ Card - 7899',
        balanceType: 'LIABILITY',
        displayAccountNumber: 'XXXXXXXXXXXX7899',
        accountId: 'credit_card_303',
        currencyCode,
        accountStatus,
        availableCredit: Math.round(15000 * balanceMultiplier * 100) / 100,
        creditLimit: Math.round(20000 * balanceMultiplier * 100) / 100,
        purchasesAPR: 23.45,
        minimumDueAmount: Math.round(150 * balanceMultiplier * 100) / 100,
        paymentDueDate: '2026-09-27',
        currentBalance: Math.round(4500 * balanceMultiplier * 100) / 100,
        lastStatementBalance: Math.round(3200 * balanceMultiplier * 100) / 100,
        lastStatementDate: '2026-08-27',
        advancesAPR: 25.24,
        cashAdvanceLimit: 5000,
        cashAdvanceAvailableAmount: 4500,
        lastPaymentAmount: 1200,
        lastPaymentDate: '2026-08-12'
      }
    ];

    accountGroupDetails.push({
      accountGroup: 'CREDITCARD',
      creditCardAccountsDetails: creditCardDetails,
      totalCurrentBalance: {
        localCurrencyCode: currencyCode,
        localCurrencyBalanceAmount: creditCardDetails[0].currentBalance || 0
      }
    });

    // 4. Brokerage Accounts (Only for High Net Worth or Standard)
    if (scenario === 'high_net_worth' || scenario === 'standard') {
      const brokerageDetails: BrokerageAccountDetails[] = [
        {
          accountId: 'brokerage_acc_404',
          displayAccountNumber: 'XXXXX1035',
          accountRegistrationType: 'INDIVDUALINVESTMENTS',
          accountTradingCapableFlag: true,
          balanceType: 'ASSET',
          productName: 'Citi Personal Wealth Management',
          accountDescription: 'Brokerage Account - 1035',
          brokerageAccountTransactionTypes: ['CASH', 'MARGIN'],
          totalPortfolioBalanceAmount: Math.round(450000 * balanceMultiplier * 100) / 100,
          accountHoldings: [
            {
              currencyCode,
              cusip: '140194101',
              holdingCategory: 'Equities',
              quantity: 500,
              securityName: 'Citi Global Growth Fund',
              asOfDateTime: '2026-08-15T10:00:00.000Z',
              assetClass: 'EQUITY',
              symbol: 'CGGF',
              price: 120.50,
              totalValueAmount: Math.round(60250 * balanceMultiplier * 100) / 100,
              changeInPercent: 1.25,
              changeInPrice: 1.50,
              changeInValue: 750,
              previousPrice: 119.00
            },
            {
              currencyCode,
              cusip: '594918104',
              holdingCategory: 'Mutual Funds',
              quantity: 1200,
              securityName: 'Citi Conservative Income Fund',
              asOfDateTime: '2026-08-15T10:00:00.000Z',
              assetClass: 'MUTUAL FUND',
              symbol: 'CCIF',
              price: 45.75,
              totalValueAmount: Math.round(54900 * balanceMultiplier * 100) / 100,
              changeInPercent: -0.45,
              changeInPrice: -0.21,
              changeInValue: -252,
              previousPrice: 45.96
            }
          ]
        }
      ];

      accountGroupDetails.push({
        accountGroup: 'BROKERAGE',
        brokerageAccountsDetails: brokerageDetails,
        totalCurrentBalance: {
          localCurrencyCode: currencyCode,
          localCurrencyBalanceAmount: brokerageDetails[0].totalPortfolioBalanceAmount || 0
        }
      });
    }

    // 5. Retirement Accounts
    if (scenario === 'high_net_worth') {
      const retirementDetails: RetirementAccountDetails[] = [
        {
          productName: 'Rollover IRA',
          balanceType: 'ASSET',
          displayAccountNumber: 'XXX2766',
          accountDescription: 'Rollover IRA - 2766',
          accountId: 'retirement_acc_505',
          accountValue: Math.round(320000 * balanceMultiplier * 100) / 100,
          accountStatus: 'ACTIVE',
          asOfDateTime: '2026-08-15',
          retirementPlanComponents: [
            {
              componentName: 'Variable CD-2766',
              currencyCode,
              currentTerms: '2 Years',
              totalValueAmount: Math.round(150000 * balanceMultiplier * 100) / 100,
              interestPaidYTD: 4500,
              nextMaturityDate: '2027-06-03'
            }
          ]
        }
      ];

      accountGroupDetails.push({
        accountGroup: 'RETIREMENT',
        retirementAccountsDetails: retirementDetails,
        totalCurrentBalance: {
          localCurrencyCode: currencyCode,
          localCurrencyBalanceAmount: retirementDetails[0].accountValue || 0
        }
      });
    }

    return {
      accountGroupDetails,
      customer: {
        customerId: customCustomerId
      }
    };
  }, []);

  // Generate Transactions based on configuration
  const handleGenerateTransactions = useCallback((cfg: GeneratorConfig, targetAccountId: string) => {
    const { scenario, currencyCode, transactionCount } = cfg;

    if (scenario === 'unauthorized') {
      return {
        errors: [
          {
            type: 'error' as const,
            code: 'unAuthorized',
            details: 'Authorization credentials are missing or invalid'
          }
        ]
      };
    }

    if (scenario === 'empty_tx') {
      return {}; // 204 No Content equivalent
    }

    const count = scenario === 'high_volume_tx' ? 50 : transactionCount;
    const accountId = targetAccountId || 'checking_acc_101';

    const checkingAccountTransactions: CheckingAccountTransaction[] = [];
    const savingsAccountTransactions: SavingsAccountTransaction[] = [];
    const creditCardAccountTransactions: CreditCardAccountTransaction[] = [];
    const brokerageAccountTransactions: BrokerageAccountTransaction[] = [];

    const descriptions = [
      'ACH Deposit / Citi Payroll Services',
      'Vendor Payment / Office Depot',
      'Wire Transfer In / Global Partners LLC',
      'Citi Credit Card AutoPay',
      'ATM Cash Withdrawal / Broadway Branch',
      'Monthly Maintenance Fee',
      'Interest Payment Credit',
      'Merchant Refund / Amazon Web Services',
      'Utility Bill / Consolidated Edison',
      'SaaS Subscription / Slack Technologies'
    ];

    const merchants = [
      { desc: 'OFFICE DEPOT', cat: '5943', name: 'OFFICE SUPPLIES' },
      { desc: 'AMAZON WEB SERVICES', cat: '7372', name: 'COMPUTER PROGRAMMING' },
      { desc: 'CON EDISON', cat: '4900', name: 'UTILITIES' },
      { desc: 'SLACK TECHNOLOGIES', cat: '7372', name: 'SOFTWARE SERVICES' },
      { desc: 'UBER TRIP', cat: '4121', name: 'TAXICABS/LIMOUSINES' },
      { desc: 'STARBUCKS COFFEE', cat: '5812', name: 'EATING PLACES' }
    ];

    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const amount = Math.round((Math.random() * 1500 + 5) * 100) / 100;
      const isDebit = Math.random() > 0.4;

      if (accountId.startsWith('checking')) {
        checkingAccountTransactions.push({
          accountId,
          currencyCode,
          debitCreditMemo: isDebit ? 'DEBIT' : 'CREDIT',
          displayAccountNumber: 'XXXXXX9594',
          transactionAmount: amount,
          transactionDate: dateString,
          transactionDescription: descriptions[i % descriptions.length],
          transactionDescriptionExtension: `Reference ID: TXN-${100000 + i}`,
          transactionId: generateId('TXN_CHK'),
          transactionStatus: i === 0 ? 'PENDING' : 'POSTED',
          transactionType: isDebit ? 'PAYMENT' : 'DEPOSIT'
        });
      } else if (accountId.startsWith('savings')) {
        savingsAccountTransactions.push({
          accountId,
          currencyCode,
          debitCreditMemo: isDebit ? 'DEBIT' : 'CREDIT',
          displayAccountNumber: 'XXXXXX2033',
          transactionAmount: amount,
          transactionDate: dateString,
          transactionDescription: isDebit ? 'Transfer to Checking' : 'Interest Paid',
          transactionId: generateId('TXN_SAV'),
          transactionStatus: 'POSTED',
          transactionType: isDebit ? 'TRANSFER' : 'DIVIDEND_AND_INTEREST'
        });
      } else if (accountId.startsWith('credit')) {
        const merchant = merchants[i % merchants.length];
        creditCardAccountTransactions.push({
          accountId,
          currencyCode,
          debitCreditMemo: isDebit ? 'DEBIT' : 'CREDIT',
          displayAccountNumber: 'XXXXXXXXXXXX7899',
          transactionAmount: amount,
          transactionDate: dateString,
          transactionPostingDate: dateString,
          transactionId: generateId('TXN_CC'),
          transactionDescription: `Purchase at ${merchant.desc}`,
          transactionStatus: i === 0 ? 'PENDING' : 'BILLED',
          transactionType: isDebit ? 'PURCHASE' : 'PAYMENT',
          merchantCategory: merchant.cat,
          merchantDescription: merchant.name,
          merchantCountry: 'USA',
          memberName: 'JOHN DOE'
        });
      } else if (accountId.startsWith('brokerage')) {
        brokerageAccountTransactions.push({
          accountId,
          currencyCode,
          assetClass: 'EQUITY',
          assetType: 'COMMON_STOCK',
          buySellIndicator: isDebit ? 'BUY' : 'SELL',
          longActivityDescription: `${isDebit ? 'Bought' : 'Sold'} ${Math.round(amount / 10)} shares of C @ $61.50`,
          shortActivityDescription: isDebit ? 'Buy Trade' : 'Sell Trade',
          transactionDateTime: `${dateString}T14:30:00.000Z`,
          transactionId: generateId('TXN_BRK'),
          transactionType: isDebit ? 'PURCHASE' : 'CREDIT',
          netAmount: amount,
          priceAmount: 61.50,
          quantity: Math.round(amount / 10),
          settlementDate: dateString,
          tradeNumber: `TRD-${500000 + i}`,
          tradeTransactionFlag: 'true',
          securityIdentifier: {
            symbol: 'C',
            cusip: '172967GD7'
          }
        });
      }
    }

    const response: GetAccountTransactionsResp = {};
    if (checkingAccountTransactions.length > 0) response.checkingAccountTransactions = checkingAccountTransactions;
    if (savingsAccountTransactions.length > 0) response.savingsAccountTransactions = savingsAccountTransactions;
    if (creditCardAccountTransactions.length > 0) response.creditCardAccountTransactions = creditCardAccountTransactions;
    if (brokerageAccountTransactions.length > 0) response.brokerageAccountTransactions = brokerageAccountTransactions;

    return response;
  }, []);

  // Generate Routing Number Payload
  const handleGenerateRouting = useCallback((cfg: GeneratorConfig) => {
    const { scenario } = cfg;

    if (scenario === 'unauthorized') {
      return {
        errors: [
          {
            type: 'error' as const,
            code: 'unAuthorized',
            details: 'Authorization credentials are missing or invalid'
          }
        ]
      };
    }

    return {
      encryptedAccountNumber: {
        encryptedPayload: {
          header: {
            zip: 'DEF',
            alg: 'RSA-OAEP-256',
            enc: 'A256CBC-HS512',
            kid: 'Citi_2026-02-10',
            x5c: [
              'MIID8TCCAtmgAwIBAgIUHhjRZWi...',
              '07cceb63ea50b385336e7f6887...'
            ],
            cty: 'text/plain'
          },
          encrypted_key: '8b3021f817b01a64c419213d70bbd0552c...',
          iv: 'cf532cc7c81046e66541791001...',
          ciphertext: '47ecwvmLhO1amdatjLdSr8Q+B8CRVXUX6Ez7JiFieEaeKtrRu99JDoX4u1FQarMkZZDaJ65...',
          authTag: 'PGdwAzKMbpt9jTE6YDEZ2GNMCTlrPuL4Hu2gAFOtZbA...',
          aad: 'n_WoDmI9OQFDy4suLquWqKNoctGXQIjpjNGOrUD2uDk7gzJBSSaiD4UYdise45GhaVhbiZeVU...'
        }
      },
      routingNumber: '122401710'
    };
  }, []);

  // Trigger regeneration when config or selected account changes
  useEffect(() => {
    const accounts = handleGenerateAccounts(config);
    setGeneratedAccounts(accounts);

    // Auto-select first available account ID if none selected
    let firstId = '';
    if ('accountGroupDetails' in accounts && accounts.accountGroupDetails) {
      const firstGroup = accounts.accountGroupDetails[0];
      if (firstGroup.checkingAccountsDetails?.[0]) {
        firstId = firstGroup.checkingAccountsDetails[0].accountId;
      } else if (firstGroup.savingsAccountsDetails?.[0]) {
        firstId = firstGroup.savingsAccountsDetails[0].accountId;
      } else if (firstGroup.creditCardAccountsDetails?.[0]) {
        firstId = firstGroup.creditCardAccountsDetails[0].accountId;
      } else if (firstGroup.brokerageAccountsDetails?.[0]) {
        firstId = firstGroup.brokerageAccountsDetails[0].accountId;
      }
    }

    const activeId = selectedAccountId || firstId || 'checking_acc_101';
    if (!selectedAccountId && firstId) {
      setSelectedAccountId(firstId);
    }

    setGeneratedTransactions(handleGenerateTransactions(config, activeId));
    setGeneratedRouting(handleGenerateRouting(config));
  }, [config, selectedAccountId, handleGenerateAccounts, handleGenerateTransactions, handleGenerateRouting]);

  // Copy JSON to Clipboard
  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    });
  };

  // Download JSON File
  const handleDownloadJSON = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Get current JSON string based on active tab
  const getCurrentJSON = () => {
    switch (activeTab) {
      case 'accounts':
        return JSON.stringify(generatedAccounts, null, 2);
      case 'transactions':
        return JSON.stringify(generatedTransactions, null, 2);
      case 'routing':
        return JSON.stringify(generatedRouting, null, 2);
      case 'errors':
        return JSON.stringify(
          {
            httpCode: activeTab === 'errors' ? '400' : '200',
            errors: [
              {
                type: 'error',
                code: 'invalidRequest',
                details: 'Missing or invalid parameters',
                location: 'Authorization'
              }
            ]
          },
          null,
          2
        );
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6">
      {/* Header */}
      <header className="border-b border-slate-800 pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sky-400 flex items-center gap-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Citi B2B API Mock Data Generator
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Generate and customize compliant mock payloads for testing Citi Accounts & Transactions B2B API endpoints.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          OpenAPI 3.0.1 Compliant
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Panel: Controls */}
        <div className="lg:col-span-4 bg-slate-800/50 border border-slate-800 rounded-xl p-5 flex flex-col gap-5">
          <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2">Configuration</h2>
          
          {/* Scenario Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Test Scenario</label>
            <select
              value={config.scenario}
              onChange={(e) => setConfig({ ...config, scenario: e.target.value as ScenarioType })}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
            >
              <option value="standard">Standard Customer (Multi-Account)</option>
              <option value="high_net_worth">High Net Worth (Retirement & Brokerage)</option>
              <option value="high_volume_tx">High Transaction Volume (Load Testing)</option>
              <option value="cd_maturity_edge">CD Account Maturity Edge Case</option>
              <option value="empty_tx">Empty Transactions (204 No Content)</option>
              <option value="no_accounts">No Accounts Linked (400 Bad Request)</option>
              <option value="unauthorized">Unauthorized Access (401 Error)</option>
              <option value="forbidden">Access Not Configured (403 Error)</option>
              <option value="server_error">Internal Server Error (500 Error)</option>
            </select>
          </div>

          {/* Balance Multiplier */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Balance Multiplier</label>
              <span className="text-xs font-mono text-sky-400 bg-sky-950/50 px-2 py-0.5 rounded">{config.balanceMultiplier}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="10.0"
              step="0.1"
              value={config.balanceMultiplier}
              onChange={(e) => setConfig({ ...config, balanceMultiplier: parseFloat(e.target.value) })}
              disabled={['unauthorized', 'forbidden', 'server_error', 'no_accounts'].includes(config.scenario)}
              className="w-full accent-sky-500 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Currency Code */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Currency Code (ISO 4217)</label>
            <select
              value={config.currencyCode}
              onChange={(e) => setConfig({ ...config, currencyCode: e.target.value })}
              disabled={['unauthorized', 'forbidden', 'server_error', 'no_accounts'].includes(config.scenario)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors disabled:opacity-50"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="SGD">SGD - Singapore Dollar</option>
              <option value="HKD">HKD - Hong Kong Dollar</option>
            </select>
          </div>

          {/* Account Status */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Account Status</label>
            <div className="grid grid-cols-3 gap-2">
              {(['ACTIVE', 'INACTIVE', 'CLOSED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setConfig({ ...config, accountStatus: status })}
                  disabled={['unauthorized', 'forbidden', 'server_error', 'no_accounts'].includes(config.scenario)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    config.accountStatus === status
                      ? 'bg-sky-500/10 border-sky-500 text-sky-400'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  } disabled:opacity-50`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Count */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Mock Transactions Count</label>
            <input
              type="number"
              min="1"
              max="100"
              value={config.transactionCount}
              onChange={(e) => setConfig({ ...config, transactionCount: parseInt(e.target.value) || 5 })}
              disabled={['unauthorized', 'forbidden', 'server_error', 'no_accounts', 'empty_tx', 'high_volume_tx'].includes(config.scenario)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Custom Customer ID */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Customer ID (Persistent Hash)</label>
            <input
              type="text"
              value={config.customCustomerId}
              onChange={(e) => setConfig({ ...config, customCustomerId: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-sky-500 transition-colors"
              placeholder="Enter custom hash..."
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              setConfig(DEFAULT_CONFIG);
              setSelectedAccountId('');
            }}
            className="mt-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H19M9 11l3-3m0 0l3 3m-3-3v12" />
            </svg>
            Reset to Defaults
          </button>
        </div>

        {/* Right Panel: JSON Output & Tabs */}
        <div className="lg:col-span-8 bg-slate-800/30 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          
          {/* Tabs Header */}
          <div className="bg-slate-800/80 border-b border-slate-800 px-4 pt-3 flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('accounts')}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'accounts'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Accounts Details
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'transactions'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('routing')}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'routing'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Routing & Encrypted Acc
              </button>
              <button
                onClick={() => setActiveTab('errors')}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'errors'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Error Templates
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pb-3">
              <button
                onClick={() => handleCopyToClipboard(getCurrentJSON(), activeTab)}
                className="bg-slate-900 hover:bg-slate-950 text-slate-300 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                {copySuccess === activeTab ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy JSON
                  </>
                )}
              </button>
              <button
                onClick={() => handleDownloadJSON(getCurrentJSON(), `citi_b2b_${activeTab}_mock.json`)}
                className="bg-slate-900 hover:bg-slate-950 text-slate-300 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>

          {/* Sub-controls for specific tabs */}
          {activeTab === 'transactions' && !['unauthorized', 'forbidden', 'server_error', 'no_accounts'].includes(config.scenario) && (
            <div className="bg-slate-800/40 border-b border-slate-800 px-4 py-2 flex items-center gap-3 text-xs">
              <span className="text-slate-400 font-medium">Target Account ID:</span>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="checking_acc_101">Checking Account (checking_acc_101)</option>
                <option value="savings_acc_202">Savings Account (savings_acc_202)</option>
                <option value="credit_card_303">Credit Card (credit_card_303)</option>
                {config.scenario === 'high_net_worth' || config.scenario === 'standard' ? (
                  <option value="brokerage_acc_404">Brokerage Account (brokerage_acc_404)</option>
                ) : null}
              </select>
            </div>
          )}

          {/* JSON Display Area */}
          <div className="flex-1 p-4 overflow-auto max-h-[600px] font-mono text-xs bg-slate-950/80">
            <pre className="text-sky-300">
              <code>{getCurrentJSON()}</code>
            </pre>
          </div>

          {/* Footer Info */}
          <div className="bg-slate-800/50 border-t border-slate-800 px-4 py-3 text-xs text-slate-400 flex justify-between items-center">
            <span>Endpoint Path: <strong className="text-slate-300 font-mono">
              {activeTab === 'accounts' && '/accounts/details'}
              {activeTab === 'transactions' && `/accounts/${selectedAccountId || '{accountId}'}/transactions`}
              {activeTab === 'routing' && `/accounts/${selectedAccountId || '{accountId}'}/encrypt/accountRoutingNumber`}
              {activeTab === 'errors' && '/accounts/details (Error Simulation)'}
            </strong></span>
            <span className="text-slate-500">Content-Type: application/json</span>
          </div>

        </div>
      </div>
    </div>
  );
}