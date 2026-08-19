

// --- CONSOLIDATED FROM: ./services/citiB2BService.ts ---

import * as crypto from 'crypto';

// ==========================================
// OpenAPI Schema Interfaces
// ==========================================

export interface Customer {
  customerId: string;
}

export interface GroupBalance {
  localCurrencyCode: string;
  localCurrencyBalanceAmount: number;
}

export interface CheckingAccountDetailsList {
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

export interface SavingsAccountDetailsList {
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

export interface CreditCardAccountDetailsList {
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

export interface LoanAccountDetailsList {
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

export interface LineOfCreditAccountDetailsList {
  productName: string;
  balanceType: 'ASSET' | 'LIABILITY';
  displayAccountNumber: string;
  accountDescription?: string;
  accountNickname?: string;
  accountId: string;
  currencyCode: string;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
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

export interface BrokerageAccountDetailsList {
  accountId: string;
  displayAccountNumber: string;
  accountRegistrationType: 'INDIVDUALINVESTMENTS' | 'TRADITIONALIRA' | 'ROTHIRA' | 'SEPIRA' | 'PLAN529' | 'RETIREMENT' | 'RETAIL' | 'RVP_DVP' | 'RETAIL_THIRD_PARTY_AS_CUSTODIAN' | 'SELF_DIRECTED_401K' | 'UNKNOWN';
  accountTradingCapableFlag: boolean;
  balanceType: 'ASSET' | 'LIABILITY';
  productName?: string;
  accountDescription?: string;
  brokerageAccountTransactionTypes: ('CASH' | 'MARGIN' | 'NONE')[];
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

export interface RetirementAccountDetailsList {
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
  checkingAccountsDetails?: CheckingAccountDetailsList[];
  savingsAccountsDetails?: SavingsAccountDetailsList[];
  creditCardAccountsDetails?: CreditCardAccountDetailsList[];
  loanAccountsDetails?: LoanAccountDetailsList[];
  lineOfCreditAccountsDetails?: LineOfCreditAccountDetailsList[];
  brokerageAccountsDetails?: BrokerageAccountDetailsList[];
  retirementAccountsDetails?: RetirementAccountDetailsList[];
  totalCurrentBalance?: GroupBalance;
  totalAvailableBalance?: GroupBalance;
}

export interface AccountsGroupDetailsList {
  accountGroupDetails?: AccountGroupDetails[];
  customer?: Customer;
}

export interface JWEHeader {
  zip?: string;
  alg: string;
  enc: string;
  kid: string;
  x5c: string[];
  cty: string;
}

export interface JWEPayload {
  header?: JWEHeader;
  encrypted_key: string;
  iv: string;
  ciphertext: string;
  authTag: string;
  aad: string;
}

export interface EncryptedAccountNumber {
  encryptedPayload?: JWEPayload;
}

export interface EncryptedAccountRoutingNumber {
  encryptedAccountNumber?: EncryptedAccountNumber;
  routingNumber?: string;
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

// ==========================================
// Seed-based Deterministic PRNG Helper
// ==========================================
function createRandom(seedStr: string): () => number {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
  }
  return function () {
    h = Math.imul(h ^ h >>> 16, 2246822507) | 0;
    h = Math.imul(h ^ h >>> 13, 3266489909) | 0;
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// ==========================================
// Citi B2B Service Implementation
// ==========================================
export class CitiB2BService {
  private static customerId = 'bd12a6d89815aed77be876225b9a2c7f6648f0af82e84198f49d1b7e51a23fae1621936bc1addf5fdceca25c3aae5f92071fb1d6218dae32ca83b199c29962ee';

  // Mock Account Database
  private static accounts = {
    checking: [
      {
        accountId: 'da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6',
        accountNumber: '1224017109594',
        routingNumber: '122401710',
        productName: 'Business Checking',
        accountNickname: 'My checking account',
        accountDescription: 'Business Checking - 9594',
        balanceType: 'ASSET' as const,
        displayAccountNumber: 'XXXXXX9594',
        currencyCode: 'USD',
        accountStatus: 'ACTIVE' as const,
        currentBalance: 10000.25,
        availableBalance: 15000.25,
      }
    ],
    savings: [
      {
        accountId: 'da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f7',
        accountNumber: '1224017102033',
        routingNumber: '122401710',
        productName: 'Citi Gold Savings Account',
        accountNickname: 'Personal Savings Account',
        accountDescription: 'Citi Gold Savings Account - 2033',
        balanceType: 'ASSET' as const,
        displayAccountNumber: 'XXXXXX2033',
        currencyCode: 'USD',
        accountStatus: 'ACTIVE' as const,
        currentBalance: 25000.50,
        availableBalance: 25000.50,
        maturityDate: '2028-06-03',
        maturityTerm: '2 years'
      }
    ],
    creditCard: [
      {
        accountId: '8035a60debb671e89bd451c9ad0f283e8f1b8868dd4dc65520ceb7bdfeb4142999f574c9db37917ef0edfae296745142543e3ad2bc034887f37212ecbde83ee0',
        accountNumber: '4166001234567899',
        productName: 'Citi Rewards+℠ Card',
        accountDescription: 'Citi Rewards+℠ Card - 7899',
        balanceType: 'LIABILITY' as const,
        displayAccountNumber: 'XXXXXXXXXXXX7899',
        currencyCode: 'USD',
        accountStatus: 'ACTIVE' as const,
        availableCredit: 15000.00,
        creditLimit: 20000.00,
        purchasesAPR: 23.45,
        minimumDueAmount: 1500.00,
        paymentDueDate: '2026-03-27',
        currentBalance: 10000.25,
        lastStatementBalance: 5000.25,
        lastStatementDate: '2026-02-27',
        advancesAPR: 23.45,
        cashAdvanceLimit: 5000.00,
        cashAdvanceAvailableAmount: 2500.00,
        lastPaymentAmount: 1500.25,
        lastPaymentDate: '2026-06-12',
        ctdPurchaseBalanceAmount: 300.25,
        purchaseSpendLimitAmount: 2000.00,
        remainingPurchaseSpendAmount: 1699.75
      }
    ],
    loan: [
      {
        accountId: 'd8cf4b23b3a7f74fd441e93697c15fe2fe8714afdfa1d1dc619b1d2ccda41edfa965598333d790b1e2de05a4c55176094a0cc632ff4ddbe9704f10e787fa64f9',
        accountNumber: '900012341035',
        productName: 'Personal Loan',
        balanceType: 'LIABILITY' as const,
        displayAccountNumber: 'XXXXX1035',
        accountDescription: 'Personal Loan-1035',
        accountNickname: 'My personal loan',
        currencyCode: 'USD',
        currentBalanceAmount: 10000.00,
        creditAvailableAmount: 9000.00,
        paymentDueAmount: 400.00,
        paymentDueDate: '2026-03-27',
        autoPayFlag: true,
        lastPaymentAmount: 500.00,
        lastPaymentDate: '2025-06-12'
      }
    ],
    lineOfCredit: [
      {
        accountId: 'da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f8',
        accountNumber: '800012341036',
        productName: 'Checking Plus Line of Credit',
        balanceType: 'LIABILITY' as const,
        displayAccountNumber: 'XXXXX1036',
        accountDescription: 'Checking Plus Line of Credit-1036',
        accountNickname: 'Checking plus account',
        accountId_LOC: 'da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f8',
        currencyCode: 'USD',
        accountStatus: 'ACTIVE' as const,
        creditAvailableAmount: 9000.00,
        currentBalanceAmount: 10000.00,
        paymentDueAmount: 5000.00,
        lastPaymentAmount: 4000.00
      }
    ],
    brokerage: [
      {
        accountId: 'da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f9',
        accountNumber: '700012341037',
        displayAccountNumber: 'XXXXX1037',
        accountRegistrationType: 'RETAIL' as const,
        accountTradingCapableFlag: true,
        balanceType: 'ASSET' as const,
        productName: 'Brokerage IRA',
        accountDescription: 'Brokerage IRA-1035',
        brokerageAccountTransactionTypes: ['CASH' as const, 'MARGIN' as const],
        accountHoldings: [
          {
            currencyCode: 'USD',
            cusip: '140194101',
            holdingCategory: 'Equities' as const,
            quantity: 100,
            securityName: 'American Funds Capital Income Builder.',
            asOfDateTime: '2026-04-10T10:00:00.000+0000',
            assetClass: 'EQUITY' as const,
            symbol: 'CAIFX',
            price: 32.41,
            totalValueAmount: 3241.00,
            changeInPercent: -0.1,
            changeInPrice: -0.015,
            changeInValue: -10.00,
            previousPrice: 31.00
          }
        ],
        totalPortfolioBalanceAmount: 3643150.72
      }
    ],
    retirement: [
      {
        productName: 'Rollover IRA',
        balanceType: 'ASSET' as const,
        displayAccountNumber: 'XXX2766',
        accountDescription: 'Rollover IRA-2766',
        accountId: 'bd0fbd58e6e3d2fec034a0f4d8a41f8f0533b7f93a02a11d3fa80f7a66c62ebdd77d0dd67787d4e4f0e4949116937f429748535d1698ae0bab6e7122e884bb02',
        accountNumber: '600012342766',
        accountValue: 9000.15,
        accountStatus: 'ACTIVE' as const,
        asOfDateTime: '2026-04-10',
        retirementPlanComponents: [
          {
            componentName: 'Variable CD-2766',
            currencyCode: 'USD',
            currentTerms: '2 years',
            totalValueAmount: 4676.36,
            interestPaidYTD: 324.12,
            nextMaturityDate: '2028-06-03'
          }
        ]
      }
    ]
  };

  /**
   * Retrieve details of all accounts.
   */
  public static async getAccountsDetails(): Promise<AccountsGroupDetailsList> {
    const accountGroupDetails: AccountGroupDetails[] = [];

    // 1. CHECKING
    const checkingBalance = this.accounts.checking.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
    const checkingAvail = this.accounts.checking.reduce((sum, acc) => sum + (acc.availableBalance || 0), 0);
    accountGroupDetails.push({
      accountGroup: 'CHECKING',
      checkingAccountsDetails: this.accounts.checking.map(({ accountNumber, routingNumber, ...rest }) => rest),
      totalCurrentBalance: { localCurrencyCode: 'USD', localCurrencyBalanceAmount: checkingBalance },
      totalAvailableBalance: { localCurrencyCode: 'USD', localCurrencyBalanceAmount: checkingAvail }
    });

    // 2. SAVINGS
    const savingsBalance = this.accounts.savings.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
    const savingsAvail = this.accounts.savings.reduce((sum, acc) => sum + (acc.availableBalance || 0), 0);
    accountGroupDetails.push({
      accountGroup: 'SAVINGS',
      savingsAccountsDetails: this.accounts.savings.map(({ accountNumber, routingNumber, ...rest }) => rest),
      totalCurrentBalance: { localCurrencyCode: 'USD', localCurrencyBalanceAmount: savingsBalance },
      totalAvailableBalance: { localCurrencyCode: 'USD', localCurrencyBalanceAmount: savingsAvail }
    });

    // 3. CREDITCARD
    const ccBalance = this.accounts.creditCard.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
    accountGroupDetails.push({
      accountGroup: 'CREDITCARD',
      creditCardAccountsDetails: this.accounts.creditCard.map(({ accountNumber, ...rest }) => rest),
      totalCurrentBalance: { localCurrencyCode: 'USD', localCurrencyBalanceAmount: ccBalance }
    });

    // 4. LOAN
    const loanBalance = this.accounts.loan.reduce((sum, acc) => sum + (acc.currentBalanceAmount || 0), 0);
    accountGroupDetails.push({
      accountGroup: 'LOAN',
      loanAccountsDetails: this.accounts.loan.map(({ accountNumber, ...rest }) => rest),
      totalCurrentBalance: { localCurrencyCode: 'USD', localCurrencyBalanceAmount: loanBalance }
    });

    // 5. LINEOFCREDIT
    const locBalance = this.accounts.lineOfCredit.reduce((sum, acc) => sum + (acc.currentBalanceAmount || 0), 0);
    accountGroupDetails.push({
      accountGroup: 'LINEOFCREDIT',
      lineOfCreditAccountsDetails: this.accounts.lineOfCredit.map(({ accountNumber, ...rest }) => rest),
      totalCurrentBalance: { localCurrencyCode: 'USD', localCurrencyBalanceAmount: locBalance }
    });

    // 6. BROKERAGE
    const brokerageBalance = this.accounts.brokerage.reduce((sum, acc) => sum + (acc.totalPortfolioBalanceAmount || 0), 0);
    accountGroupDetails.push({
      accountGroup: 'BROKERAGE',
      brokerageAccountsDetails: this.accounts.brokerage.map(({ accountNumber, ...rest }) => rest),
      totalCurrentBalance: { localCurrencyCode: 'USD', localCurrencyBalanceAmount: brokerageBalance }
    });

    // 7. RETIREMENT
    const retirementBalance = this.accounts.retirement.reduce((sum, acc) => sum + (acc.accountValue || 0), 0);
    accountGroupDetails.push({
      accountGroup: 'RETIREMENT',
      retirementAccountsDetails: this.accounts.retirement.map(({ accountNumber, ...rest }) => rest),
      totalCurrentBalance: { localCurrencyCode: 'USD', localCurrencyBalanceAmount: retirementBalance }
    });

    return {
      accountGroupDetails,
      customer: {
        customerId: this.customerId
      }
    };
  }

  /**
   * Retrieve routing number (clear text) and encrypted account number of a specific account.
   * Simulates routing number encryption using JWE/JWS standards.
   */
  public static async getRoutingNumber(accountId: string): Promise<EncryptedAccountRoutingNumber> {
    // Find account in checking or savings
    const checkingAcc = this.accounts.checking.find(a => a.accountId === accountId);
    const savingsAcc = this.accounts.savings.find(a => a.accountId === accountId);
    const otherAcc =
      this.accounts.creditCard.find(a => a.accountId === accountId) ||
      this.accounts.loan.find(a => a.accountId === accountId) ||
      this.accounts.lineOfCredit.find(a => a.accountId === accountId) ||
      this.accounts.brokerage.find(a => a.accountId === accountId) ||
      this.accounts.retirement.find(a => a.accountId === accountId);

    const targetAcc = checkingAcc || savingsAcc || otherAcc;

    if (!targetAcc) {
      throw new Error('resourceNotFound');
    }

    // Perform simulated JWE JSON Serialization
    const encryptedPayload = this.encryptAccountNumberSimulated(targetAcc.accountNumber);

    const response: EncryptedAccountRoutingNumber = {
      encryptedAccountNumber: {
        encryptedPayload
      }
    };

    // Routing number is conditional on Checking & Savings Accounts only
    if (checkingAcc) {
      response.routingNumber = checkingAcc.routingNumber;
    } else if (savingsAcc) {
      response.routingNumber = savingsAcc.routingNumber;
    }

    return response;
  }

  /**
   * Retrieve transactions filtered by date range and status.
   */
  public static async getTransactionsDetails(
    accountId: string,
    transactionFromDate: string,
    transactionToDate: string
  ): Promise<GetAccountTransactionsResp> {
    // Validate dates
    const fromDate = new Date(transactionFromDate);
    const toDate = new Date(transactionToDate);
    const now = new Date();

    if (isNaN(fromDate.getTime())) {
      throw new Error('invalidTransactionFromDate');
    }
    if (isNaN(toDate.getTime())) {
      throw new Error('invalidTransactionToDate');
    }
    if (fromDate > toDate) {
      throw new Error('transactionFromToDateComboInvalid');
    }

    // Check 24 months prior
    const twentyFourMonthsAgo = new Date();
    twentyFourMonthsAgo.setMonth(now.getMonth() - 24);
    if (fromDate < twentyFourMonthsAgo) {
      throw new Error('tranxFromDate2YrsPriorToCurrDate');
    }

    // Check after current date
    if (toDate > now) {
      throw new Error('tranxToDateAfterCurrDate');
    }

    // Find account type and generate deterministic transactions
    const isChecking = this.accounts.checking.some(a => a.accountId === accountId);
    const isSavings = this.accounts.savings.some(a => a.accountId === accountId);
    const isCreditCard = this.accounts.creditCard.some(a => a.accountId === accountId);
    const isLoan = this.accounts.loan.some(a => a.accountId === accountId);
    const isLineOfCredit = this.accounts.lineOfCredit.some(a => a.accountId === accountId);
    const isBrokerage = this.accounts.brokerage.some(a => a.accountId === accountId);
    const isRetirement = this.accounts.retirement.some(a => a.accountId === accountId);

    if (!isChecking && !isSavings && !isCreditCard && !isLoan && !isLineOfCredit && !isBrokerage && !isRetirement) {
      throw new Error('resourceNotFound');
    }

    const resp: GetAccountTransactionsResp = {};
    const rand = createRandom(`${accountId}-${transactionFromDate}-${transactionToDate}`);

    // Generate deterministic transactions distributed between fromDate and toDate
    const transactionsList: any[] = [];
    const current = new Date(fromDate);
    const end = new Date(toDate);

    while (current <= end) {
      // Advance by 2 to 5 days deterministically
      const daysToAdvance = Math.floor(rand() * 4) + 2;
      current.setDate(current.getDate() + daysToAdvance);
      if (current > end) break;

      const dateStr = current.toISOString().split('T')[0];
      const amount = Math.round((rand() * 500 + 5) * 100) / 100;
      const isDebit = rand() > 0.4; // 60% debits, 40% credits
      const debitCreditMemo = isDebit ? ('DEBIT' as const) : ('CREDIT' as const);

      if (isChecking) {
        const txType = isDebit
          ? (['PAYMENT', 'TRANSFER', 'WITHDRAWAL', 'FEES'][Math.floor(rand() * 4)] as any)
          : (['DEPOSIT', 'TRANSFER', 'DIVIDEND_AND_INTEREST'][Math.floor(rand() * 3)] as any);
        const txId = `TX-CH-${Math.floor(rand() * 1000000000)}`;
        transactionsList.push({
          accountId,
          checkNumber: isDebit && rand() > 0.7 ? Math.floor(rand() * 5000) + 1000 : undefined,
          currencyCode: 'USD',
          debitCreditMemo,
          displayAccountNumber: 'XXXXXX9594',
          transactionAmount: amount,
          transactionDate: dateStr,
          transactionDescription: `${txType} Transaction Description`,
          transactionDescriptionExtension: 'Reference # ' + Math.floor(rand() * 900000 + 100000),
          transactionId: txId,
          transactionStatus: 'POSTED' as const,
          transactionType: txType
        });
      } else if (isSavings) {
        const txType = isDebit
          ? (['PAYMENT', 'TRANSFER', 'WITHDRAWAL', 'FEES'][Math.floor(rand() * 4)] as any)
          : (['DEPOSIT', 'TRANSFER', 'DIVIDEND_AND_INTEREST'][Math.floor(rand() * 3)] as any);
        const txId = `TX-SV-${Math.floor(rand() * 1000000000)}`;
        transactionsList.push({
          accountId,
          checkNumber: isDebit && rand() > 0.7 ? Math.floor(rand() * 5000) + 1000 : undefined,
          currencyCode: 'USD',
          debitCreditMemo,
          displayAccountNumber: 'XXXXXX2033',
          transactionAmount: amount,
          transactionDate: dateStr,
          transactionDescription: `${txType} Transaction Description`,
          transactionDescriptionExtension: 'Reference # ' + Math.floor(rand() * 900000 + 100000),
          transactionId: txId,
          transactionStatus: 'POSTED' as const,
          transactionType: txType
        });
      } else if (isCreditCard) {
        const txType = isDebit ? ('PURCHASE' as const) : ('PAYMENT' as const);
        const txId = `TX-CC-${Math.floor(rand() * 1000000000)}`;
        transactionsList.push({
          accountId,
          currencyCode: 'USD',
          debitCreditMemo,
          displayAccountNumber: 'XXXXXXXXXXXX7899',
          foreignCurrency: rand() > 0.8 ? Math.round(amount * 0.9 * 100) / 100 : undefined,
          merchantCategory: ['4411', '5411', '5812', '5814'][Math.floor(rand() * 4)],
          merchantDescription: ['CRUISE LINES', 'GROCERY STORES', 'RESTAURANTS', 'FAST FOOD'][Math.floor(rand() * 4)],
          merchantCountry: 'USA',
          transactionDate: dateStr,
          transactionPostingDate: dateStr,
          transactionId: txId,
          transactionAmount: amount,
          transactionDescription: isDebit ? 'Retail Purchase' : 'Payment Received',
          transactionStatus: 'BILLED' as const,
          transactionType: txType,
          memberName: 'PRIMARY OWNER'
        });
      } else if (isLoan) {
        const txType = isDebit ? ('PURCHASE' as const) : ('PAYMENT' as const);
        const txId = `TX-LN-${Math.floor(rand() * 1000000000)}`;
        transactionsList.push({
          accountId,
          displayAccountNumber: 'XXXXX1035',
          transactionDate: dateStr,
          transactionType: txType,
          transactionAmount: amount,
          debitCreditMemo,
          transactionId: txId,
          transactionDescription: isDebit ? 'Loan Drawdown' : 'Loan Payment',
          transactionDescriptionExtension: 'Reference # ' + Math.floor(rand() * 900000 + 100000),
          transactionStatus: 'POSTED' as const,
          transactionPostingDate: dateStr,
          currencyCode: 'USD',
          checkNumber: isDebit && rand() > 0.8 ? String(Math.floor(rand() * 5000) + 1000) : undefined
        });
      } else if (isLineOfCredit) {
        const txType = isDebit ? ('PURCHASE' as const) : ('PAYMENT' as const);
        const txId = `TX-LC-${Math.floor(rand() * 1000000000)}`;
        transactionsList.push({
          accountId,
          displayAccountNumber: 'XXXXX1036',
          transactionDate: dateStr,
          transactionType: txType,
          transactionAmount: amount,
          debitCreditMemo,
          transactionId: txId,
          transactionDescription: isDebit ? 'LOC Drawdown' : 'LOC Payment',
          transactionDescriptionExtension: 'Reference # ' + Math.floor(rand() * 900000 + 100000),
          transactionStatus: 'POSTED' as const,
          transactionPostingDate: dateStr,
          currencyCode: 'USD',
          checkNumber: isDebit && rand() > 0.8 ? String(Math.floor(rand() * 5000) + 1000) : undefined
        });
      } else if (isBrokerage) {
        const buySell = rand() > 0.5 ? ('BUY' as const) : ('SELL' as const);
        const txType = 'SECURITY_TRANSACTION' as const;
        const txId = `TX-BR-${Math.floor(rand() * 1000000000)}`;
        transactionsList.push({
          accountId,
          displayAccountNumber: 'XXXXX1037',
          currencyCode: 'USD',
          securityIdentifier: {
            symbol: 'CAIFX',
            cusip: '140194101'
          },
          assetClass: 'EQUITY',
          assetType: 'MUTUAL_FUND',
          buySellIndicator: buySell,
          longActivityDescription: `${buySell === 'BUY' ? 'Bought' : 'Sold'} shares of CAIFX`,
          netAmount: amount,
          priceAmount: 32.41,
          principalAmount: amount,
          quantity: Math.round((amount / 32.41) * 1000) / 1000,
          settlementDate: dateStr,
          shortActivityDescription: buySell === 'BUY' ? 'Shares bought' : 'Shares sold',
          tradeNumber: String(Math.floor(rand() * 9000000000 + 1000000000)),
          tradeTransactionFlag: 'true',
          transactionDateTime: dateStr,
          transactionId: txId,
          transactionType: txType
        });
      }
    }

    if (isChecking) {
      resp.checkingAccountTransactions = transactionsList;
    } else if (isSavings) {
      resp.savingsAccountTransactions = transactionsList;
    } else if (isCreditCard) {
      resp.creditCardAccountTransactions = transactionsList;
    } else if (isLoan) {
      resp.loanAccountTransactions = transactionsList;
    } else if (isLineOfCredit) {
      resp.lineOfCreditAccountTransactions = transactionsList;
    } else if (isBrokerage) {
      resp.brokerageAccountTransactions = transactionsList;
    }

    return resp;
  }

  /**
   * Simulates routing number encryption using JWE/JWS standards.
   * Uses Node's native crypto module to perform authentic AES-GCM encryption
   * and generates a standard-compliant JWE JSON Serialization structure.
   */
  private static encryptAccountNumberSimulated(accountNumber: string): JWEPayload {
    // Generate a mock Content Encryption Key (CEK)
    const cek = crypto.randomBytes(32);
    // Generate a random IV for AES-GCM (12 bytes is standard)
    const iv = crypto.randomBytes(12);
    // Additional Authenticated Data (AAD)
    const aadText = 'citi-b2b-aad';
    const aadBase64 = Buffer.from(aadText).toString('base64url');

    // Perform real AES-256-GCM encryption
    const cipher = crypto.createCipheriv('aes-256-gcm', cek, iv);
    cipher.setAAD(Buffer.from(aadText));

    let ciphertext = cipher.update(accountNumber, 'utf8', 'base64url');
    ciphertext += cipher.final('base64url');

    const authTag = cipher.getAuthTag().toString('base64url');

    // Simulate RSA-OAEP-256 encrypted key (256 bytes)
    const encryptedKey = crypto.randomBytes(256).toString('base64url');

    const header: JWEHeader = {
      zip: 'DEF',
      alg: 'RSA-OAEP-256',
      enc: 'A256CBC-HS512',
      kid: 'Citi_2020-02-10',
      x5c: [
        '07cceb63ea50b385336e7f6887',
        'MIID8TCCAtmgAwIBAgIUHhjRZWi'
      ],
      cty: 'text/plain'
    };

    return {
      header,
      encrypted_key: encryptedKey,
      iv: iv.toString('base64url'),
      ciphertext,
      authTag,
      aad: aadBase64
    };
  }
}