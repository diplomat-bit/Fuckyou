

// --- CONSOLIDATED FROM: ./components/CitiB2B/CitiB2BDashboard.tsx ---

import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Wallet,
  ArrowLeftRight,
  ShieldCheck,
  Search,
  RefreshCw,
  User,
  AlertCircle,
  Info,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  ChevronDown,
  ChevronUp,
  Database,
  Settings,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';

// ==========================================
// TYPE DEFINITIONS (Aligning with OpenAPI Spec)
// ==========================================

export interface Customer {
  customerId: string;
}

export interface GroupBalance {
  localCurrencyCode?: string;
  localCurrencyBalanceAmount?: number;
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
  accountRegistrationType: string;
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

// JWE Encryption Types
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

// Transaction Types
export interface BaseTransaction {
  accountId: string;
  currencyCode: string;
  displayAccountNumber?: string;
  transactionAmount: number;
  transactionDate: string;
  transactionDescription?: string;
  transactionDescriptionExtension?: string;
  transactionId?: string;
  transactionStatus?: string;
  transactionType: string;
  debitCreditMemo?: 'DEBIT' | 'CREDIT';
}

export interface CheckingAccountTransaction extends BaseTransaction {
  checkNumber?: number;
}

export interface SavingsAccountTransaction extends BaseTransaction {
  checkNumber?: number;
}

export interface CreditCardAccountTransaction extends BaseTransaction {
  foreignCurrency?: number;
  merchantCategory?: string;
  merchantDescription?: string;
  merchantCountry?: string;
  transactionPostingDate?: string;
  memberName?: string;
}

export interface LoanAccountTransaction extends BaseTransaction {
  transactionPostingDate?: string;
  checkNumber?: string;
}

export interface LineOfCreditAccountTransaction extends BaseTransaction {
  transactionPostingDate?: string;
  checkNumber?: string;
}

export interface BrokerageAccountTransaction {
  accountId: string;
  displayAccountNumber?: string;
  currencyCode: string;
  securityIdentifier?: {
    symbol?: string;
    cusip?: string;
  };
  assetClass: string;
  assetType: string;
  buySellIndicator: 'BUY' | 'SELL' | 'NONE';
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
  transactionType: string;
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
// MOCK DATA GENERATOR
// ==========================================

const MOCK_CUSTOMER_ID = "citi-cust-b2b-88921042";

const generateMockAccounts = (): AccountsGroupDetailsList => {
  return {
    customer: { customerId: MOCK_CUSTOMER_ID },
    accountGroupDetails: [
      {
        accountGroup: 'CHECKING',
        totalCurrentBalance: { localCurrencyCode: 'USD', localCurrencyBalanceAmount: 45200.50 },
        totalAvailableBalance: { localCurrencyCode: 'USD', localCurrencyBalanceAmount: 45200.50 },
        checkingAccountsDetails: [
          {
            accountId: "chk_citi_b2b_001",
            productName: "Business Checking Plus",
            accountNickname: "Primary Operating Account",
            accountDescription: "Business Checking Plus - 9594",
            balanceType: "ASSET",
            displayAccountNumber: "XXXXXX9594",
            currencyCode: "USD",
            accountStatus: "ACTIVE",
            currentBalance: 32500.25,
            availableBalance: 32500.25
          },
          {
            accountId: "chk_citi_b2b_002",
            productName: "Payroll Checking",
            accountNickname: "Payroll Reserve",
            accountDescription: "Business Checking - 1204",
            balanceType: "ASSET",
            displayAccountNumber: "XXXXXX1204",
            currencyCode: "USD",
            accountStatus: "ACTIVE",
            currentBalance: 12700.25,
            availableBalance: 12700.25
          }
        ]
      },
      {
        accountGroup: 'SAVINGS',
        totalCurrentBalance: { localCurrencyCode: 'USD', localCurrencyBalanceAmount: 150000.00 },
        totalAvailableBalance: { localCurrencyCode: 'USD', localCurrencyBalanceAmount: 150000.00 },
        savingsAccountsDetails: [
          {
            accountId: "sav_citi_b2b_001",
            productName: "Citi Gold Savings Account",
            accountNickname: "Corporate Reserve",
            accountDescription: "Citi Gold Savings Account - 2033",
            balanceType: "ASSET",
            displayAccountNumber: "XXXXXX2033",
            currencyCode: "USD",
            accountStatus: "ACTIVE",
            currentBalance: 150000.00,
            availableBalance: 150000.00
          }
        ]
      },
      {
        accountGroup: 'CREDITCARD',
        totalCurrentBalance: { localCurrencyCode: 'USD', localCurrencyBalanceAmount: 12450.80 },
        creditCardAccountsDetails: [
          {
            accountId: "cc_citi_b2b_001",
            productName: "Citi Corporate Rewards Card",
            accountDescription: "Citi Corporate Rewards Card - 7899",
            balanceType: "LIABILITY",
            displayAccountNumber: "XXXXXXXXXXXX7899",
            currencyCode: "USD",
            accountStatus: "ACTIVE",
            availableCredit: 37549.20,
            creditLimit: 50000.00,
            purchasesAPR: 18.45,
            minimumDueAmount: 250.00,
            paymentDueDate: "2026-09-15",
            currentBalance: 12450.80,
            lastStatementBalance: 8900.25,
            lastStatementDate: "2026-08-10",
            lastPaymentAmount: 1500.00,
            lastPaymentDate: "2026-08-05"
          }
        ]
      },
      {
        accountGroup: 'LOAN',
        totalCurrentBalance: { localCurrencyCode: 'USD', localCurrencyBalanceAmount: 245000.00 },
        loanAccountsDetails: [
          {
            accountId: "loan_citi_b2b_001",
            productName: "Commercial Term Loan",
            accountDescription: "Commercial Term Loan - 1035",
            balanceType: "LIABILITY",
            displayAccountNumber: "XXXXX1035",
            currencyCode: "USD",
            currentBalanceAmount: 245000.00,
            creditAvailableAmount: 0.00,
            paymentDueAmount: 4200.00,
            paymentDueDate: "2026-09-01",
            autoPayFlag: true,
            lastPaymentAmount: 4200.00,
            lastPaymentDate: "2026-08-01"
          }
        ]
      },
      {
        accountGroup: 'BROKERAGE',
        totalCurrentBalance: { localCurrencyCode: 'USD', localCurrencyBalanceAmount: 1245300.00 },
        brokerageAccountsDetails: [
          {
            accountId: "broker_citi_b2b_001",
            productName: "Citi Private Brokerage",
            accountDescription: "Brokerage Account - 4412",
            displayAccountNumber: "XXXXX4412",
            balanceType: "ASSET",
            accountRegistrationType: "RETAIL",
            accountTradingCapableFlag: true,
            brokerageAccountTransactionTypes: ["CASH", "MARGIN"],
            totalPortfolioBalanceAmount: 1245300.00,
            accountHoldings: [
              {
                currencyCode: "USD",
                cusip: "037833100",
                symbol: "AAPL",
                securityName: "Apple Inc. Common Stock",
                holdingCategory: "Equities",
                assetClass: "EQUITY",
                quantity: 1500,
                price: 185.50,
                totalValueAmount: 278250.00,
                changeInPercent: 1.25,
                changeInPrice: 2.30,
                changeInValue: 3450.00,
                previousPrice: 183.20
              },
              {
                currencyCode: "USD",
                cusip: "594918104",
                symbol: "MSFT",
                securityName: "Microsoft Corp. Common Stock",
                holdingCategory: "Equities",
                assetClass: "EQUITY",
                quantity: 1200,
                price: 415.20,
                totalValueAmount: 498240.00,
                changeInPercent: -0.45,
                changeInPrice: -1.88,
                changeInValue: -2256.00,
                previousPrice: 417.08
              },
              {
                currencyCode: "USD",
                cusip: "citi_cash_001",
                symbol: "USD_CASH",
                securityName: "Citi Treasury Liquid Reserves",
                holdingCategory: "Cash, Money Funds, Bank Deposits",
                assetClass: "CASH",
                quantity: 468810,
                price: 1.00,
                totalValueAmount: 468810.00,
                changeInPercent: 0.00,
                changeInPrice: 0.00,
                changeInValue: 0.00,
                previousPrice: 1.00
              }
            ]
          }
        ]
      }
    ]
  };
};

const generateMockRoutingNumber = (accountId: string): EncryptedAccountRoutingNumber => {
  const isCheckingOrSavings = accountId.startsWith("chk_") || accountId.startsWith("sav_");
  return {
    routingNumber: isCheckingOrSavings ? "122401710" : undefined,
    encryptedAccountNumber: {
      encryptedPayload: {
        header: {
          zip: "DEF",
          alg: "RSA-OAEP-256",
          enc: "A256CBC-HS512",
          kid: "Citi_B2B_Prod_2026",
          x5c: [
            "MIIE+zCCA+OgAwIBAgIUN3V...",
            "MIID8TCCAtmgAwIBAgIUHhj..."
          ],
          cty: "text/plain"
        },
        encrypted_key: "8b3021f817b01a64c419213d70bbd0552c8b3021f817b01a64c419213d70bbd0552c",
        iv: "cf532cc7c81046e66541791001",
        ciphertext: "47ecwvmLhO1amdatjLdSr8Q+B8CRVXUX6Ez7JiFieEaeKtrRu99JDoX4u1FQarMkZZDaJ65eVuZ4RXU4xvNeEJHToQx3iboo1hyDLOhMdoSLPJQfx46",
        authTag: "PGdwAzKMbpt9jTE6YDEZ2GNMCTlrPuL4Hu2gAFOtZbA",
        aad: "n_WoDmI9OQFDy4suLquWqKNoctGXQIjpjNGOrUD2uDk7gzJBSSaiD4UYdise45GhaVhbiZeVU"
      }
    }
  };
};

const generateMockTransactions = (accountId: string): GetAccountTransactionsResp => {
  if (accountId.startsWith("chk_")) {
    return {
      checkingAccountTransactions: [
        {
          accountId,
          transactionId: "TXN_CHK_1001",
          transactionDate: "2026-08-15",
          transactionType: "PAYMENT",
          transactionAmount: 1250.00,
          currencyCode: "USD",
          debitCreditMemo: "DEBIT",
          transactionStatus: "POSTED",
          transactionDescription: "ACH DEBIT - ADP PAYROLL SERVICES",
          transactionDescriptionExtension: "ADP REF: 9921042",
          displayAccountNumber: "XXXXXX9594"
        },
        {
          accountId,
          transactionId: "TXN_CHK_1002",
          transactionDate: "2026-08-14",
          transactionType: "DEPOSIT",
          transactionAmount: 15450.00,
          currencyCode: "USD",
          debitCreditMemo: "CREDIT",
          transactionStatus: "POSTED",
          transactionDescription: "WIRE TRANSFER INWARD - ACME CORP",
          transactionDescriptionExtension: "INVOICE #2026-881",
          displayAccountNumber: "XXXXXX9594"
        },
        {
          accountId,
          transactionId: "TXN_CHK_1003",
          transactionDate: "2026-08-12",
          transactionType: "WITHDRAWAL",
          transactionAmount: 450.00,
          currencyCode: "USD",
          debitCreditMemo: "DEBIT",
          transactionStatus: "POSTED",
          transactionDescription: "ATM WITHDRAWAL - CITI BRANCH 402",
          displayAccountNumber: "XXXXXX9594",
          checkNumber: 1007
        }
      ]
    };
  } else if (accountId.startsWith("sav_")) {
    return {
      savingsAccountTransactions: [
        {
          accountId,
          transactionId: "TXN_SAV_2001",
          transactionDate: "2026-08-01",
          transactionType: "DIVIDEND_AND_INTEREST",
          transactionAmount: 312.50,
          currencyCode: "USD",
          debitCreditMemo: "CREDIT",
          transactionStatus: "POSTED",
          transactionDescription: "INTEREST PAYMENT",
          displayAccountNumber: "XXXXXX2033"
        }
      ]
    };
  } else if (accountId.startsWith("cc_")) {
    return {
      creditCardAccountTransactions: [
        {
          accountId,
          transactionId: "TXN_CC_3001",
          transactionDate: "2026-08-14",
          transactionType: "PURCHASE",
          transactionAmount: 124.50,
          currencyCode: "USD",
          debitCreditMemo: "DEBIT",
          transactionStatus: "BILLED",
          transactionDescription: "AMAZON WEB SERVICES",
          merchantCategory: "7372",
          merchantDescription: "COMPUTER PROGRAMMING SERVICES",
          merchantCountry: "USA",
          transactionPostingDate: "2026-08-15",
          memberName: "SMITH, JOHN"
        },
        {
          accountId,
          transactionId: "TXN_CC_3002",
          transactionDate: "2026-08-11",
          transactionType: "PURCHASE",
          transactionAmount: 850.00,
          currencyCode: "USD",
          debitCreditMemo: "DEBIT",
          transactionStatus: "BILLED",
          transactionDescription: "UNITED AIRLINES",
          merchantCategory: "4511",
          merchantDescription: "AIR CARRIERS",
          merchantCountry: "USA",
          transactionPostingDate: "2026-08-12",
          memberName: "SMITH, JOHN"
        }
      ]
    };
  } else if (accountId.startsWith("loan_")) {
    return {
      loanAccountTransactions: [
        {
          accountId,
          transactionId: "TXN_LOAN_4001",
          transactionDate: "2026-08-01",
          transactionType: "PAYMENT",
          transactionAmount: 4200.00,
          currencyCode: "USD",
          debitCreditMemo: "DEBIT",
          transactionStatus: "POSTED",
          transactionDescription: "MONTHLY TERM LOAN PAYMENT",
          transactionPostingDate: "2026-08-01"
        }
      ]
    };
  } else if (accountId.startsWith("broker_")) {
    return {
      brokerageAccountTransactions: [
        {
          accountId,
          transactionId: "TXN_BRK_5001",
          transactionDateTime: "2026-08-10T14:30:00.000Z",
          transactionType: "SECURITY_TRANSACTION",
          assetClass: "EQUITY",
          assetType: "COMMON_STOCK",
          buySellIndicator: "BUY",
          longActivityDescription: "Bought 100 Shares of AAPL @ $182.10",
          shortActivityDescription: "Shares bought",
          netAmount: 18210.00,
          priceAmount: 182.10,
          quantity: 100,
          currencyCode: "USD",
          settlementDate: "2026-08-12",
          tradeNumber: "TRD_992104"
        }
      ]
    };
  }
  return {};
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function CitiB2BDashboard() {
  // API Configuration State
  const [useMock, setUseMock] = useState<boolean>(true);
  const [apiUrl, setApiUrl] = useState<string>("https://api.citi.com/api/accounts/account-transactions/partner/v1");
  const [clientId, setClientId] = useState<string>("citi-b2b-partner-client-id-xyz");
  const [authToken, setAuthToken] = useState<string>("Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...");
  const [requestUuid, setRequestUuid] = useState<string>("123e4567-e89b-12d3-a456-426614174000");
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Core Dashboard State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [accountsData, setAccountsData] = useState<AccountsGroupDetailsList | null>(null);
  
  // Selected Account State
  const [selectedAccount, setSelectedAccount] = useState<{
    accountId: string;
    group: 'CHECKING' | 'SAVINGS' | 'CREDITCARD' | 'LOAN' | 'LINEOFCREDIT' | 'BROKERAGE' | 'RETIREMENT';
    productName: string;
    displayNum: string;
    details: any;
  } | null>(null);

  // Transactions & Routing State
  const [transactions, setTransactions] = useState<GetAccountTransactionsResp | null>(null);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [txFromDate, setTxFromDate] = useState<string>("2026-08-01");
  const [txToDate, setTxToDate] = useState<string>("2026-08-31");

  const [routingData, setRoutingData] = useState<EncryptedAccountRoutingNumber | null>(null);
  const [routingLoading, setRoutingLoading] = useState<boolean>(false);
  const [routingError, setRoutingError] = useState<string | null>(null);
  const [showEncryptedPayload, setShowEncryptedPayload] = useState<boolean>(false);

  // Fetch Accounts List
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedAccount(null);
    setTransactions(null);
    setRoutingData(null);

    if (useMock) {
      // Simulate network delay
      setTimeout(() => {
        setAccountsData(generateMockAccounts());
        setLoading(false);
      }, 600);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/accounts/details`, {
        method: 'GET',
        headers: {
          'Authorization': authToken,
          'uuid': requestUuid,
          'Accept': 'application/json',
          'client_id': clientId
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data: AccountsGroupDetailsList = await response.json();
      setAccountsData(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch account details.");
    } finally {
      setLoading(false);
    }
  }, [useMock, apiUrl, authToken, requestUuid, clientId]);

  // Fetch Transactions for Selected Account
  const fetchTransactions = useCallback(async (accountId: string) => {
    setTxLoading(true);
    setTxError(null);

    if (useMock) {
      setTimeout(() => {
        setTransactions(generateMockTransactions(accountId));
        setTxLoading(false);
      }, 400);
      return;
    }

    try {
      const queryParams = new URLSearchParams({
        transactionFromDate: txFromDate,
        transactionToDate: txToDate
      });

      const response = await fetch(`${apiUrl}/accounts/${accountId}/transactions?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': authToken,
          'uuid': requestUuid,
          'Accept': 'application/json',
          'client_id': clientId
        }
      });

      if (response.status === 204) {
        setTransactions({});
        setTxLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data: GetAccountTransactionsResp = await response.json();
      setTransactions(data);
    } catch (err: any) {
      setTxError(err.message || "Failed to fetch transactions.");
    } finally {
      setTxLoading(false);
    }
  }, [useMock, apiUrl, authToken, requestUuid, clientId, txFromDate, txToDate]);

  // Fetch Routing & Encrypted Account Number
  const fetchRoutingNumber = useCallback(async (accountId: string) => {
    setRoutingLoading(true);
    setRoutingError(null);

    if (useMock) {
      setTimeout(() => {
        setRoutingData(generateMockRoutingNumber(accountId));
        setRoutingLoading(false);
      }, 400);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/accounts/${accountId}/encrypt/accountRoutingNumber`, {
        method: 'GET',
        headers: {
          'Authorization': authToken,
          'uuid': requestUuid,
          'Accept': 'application/json',
          'client_id': clientId
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data: EncryptedAccountRoutingNumber = await response.json();
      setRoutingData(data);
    } catch (err: any) {
      setRoutingError(err.message || "Failed to fetch routing number.");
    } finally {
      setRoutingLoading(false);
    }
  }, [useMock, apiUrl, authToken, requestUuid, clientId]);

  // Initial Load
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Handle Account Selection
  const handleSelectAccount = (
    accountId: string,
    group: 'CHECKING' | 'SAVINGS' | 'CREDITCARD' | 'LOAN' | 'LINEOFCREDIT' | 'BROKERAGE' | 'RETIREMENT',
    productName: string,
    displayNum: string,
    details: any
  ) => {
    setSelectedAccount({ accountId, group, productName, displayNum, details });
    fetchTransactions(accountId);
    fetchRoutingNumber(accountId);
  };

  // Helper to extract flat list of transactions
  const getFlatTransactions = (): { type: string; list: any[] } => {
    if (!transactions) return { type: 'None', list: [] };
    if (transactions.checkingAccountTransactions) return { type: 'Checking', list: transactions.checkingAccountTransactions };
    if (transactions.savingsAccountTransactions) return { type: 'Savings', list: transactions.savingsAccountTransactions };
    if (transactions.creditCardAccountTransactions) return { type: 'CreditCard', list: transactions.creditCardAccountTransactions };
    if (transactions.loanAccountTransactions) return { type: 'Loan', list: transactions.loanAccountTransactions };
    if (transactions.lineOfCreditAccountTransactions) return { type: 'LineOfCredit', list: transactions.lineOfCreditAccountTransactions };
    if (transactions.brokerageAccountTransactions) return { type: 'Brokerage', list: transactions.brokerageAccountTransactions };
    return { type: 'None', list: [] };
  };

  const { type: txType, list: txList } = getFlatTransactions();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Citi B2B Partner Portal</h1>
              <p className="text-xs text-slate-500 font-medium">Accounts & Transactions API v2.0.0</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Mock Mode Indicator */}
            <button
              onClick={() => setUseMock(!useMock)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                useMock 
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              <span>{useMock ? "Mock Data Mode" : "Live API Mode"}</span>
            </button>

            {/* Config Toggle */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="API Configuration"
            >
              <Settings className="h-5 w-5" />
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchAccounts}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh Accounts"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* API Configuration Panel */}
      {showConfig && (
        <div className="bg-white border-b border-slate-200 shadow-inner transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Settings className="h-4 w-4 text-blue-600" />
                <span>API Gateway Configuration</span>
              </h3>
              <span className="text-xs text-slate-500">Configure headers for live B2B Accounts API requests</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">API Base URL</label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Client ID</label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Authorization Token</label>
                <input
                  type="text"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Request UUID</label>
                <input
                  type="text"
                  value={requestUuid}
                  onChange={(e) => setRequestUuid(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setUseMock(false);
                  fetchAccounts();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded shadow transition-colors"
              >
                Apply & Connect Live
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-red-800">API Connection Error</h3>
              <p className="text-xs text-red-700 mt-1">{error}</p>
              <button 
                onClick={() => setUseMock(true)} 
                className="text-xs font-semibold text-red-600 underline mt-2 hover:text-red-800 block"
              >
                Switch back to Mock Data Mode
              </button>
            </div>
          </div>
        )}

        {/* Customer Info Banner */}
        {accountsData?.customer && (
          <div className="mb-8 bg-gradient-to-r from-blue-900 to-slate-800 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 p-3 rounded-xl">
                <User className="h-8 w-8 text-blue-300" />
              </div>
              <div>
                <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Authorized Customer</span>
                <h2 className="text-xl font-bold tracking-tight mt-0.5">Citi B2B Client Account Summary</h2>
                <p className="text-xs text-slate-300 font-mono mt-1 truncate max-w-md">ID: {accountsData.customer.customerId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 bg-white/5 px-6 py-3 rounded-xl border border-white/10">
              <div>
                <span className="text-xs text-slate-300 block">Total Asset Balance</span>
                <span className="text-lg font-extrabold text-emerald-400">$1,439,000.75</span>
              </div>
              <div className="border-l border-white/10 h-8"></div>
              <div>
                <span className="text-xs text-slate-300 block">Total Liabilities</span>
                <span className="text-lg font-extrabold text-rose-400">$257,450.80</span>
              </div>
            </div>
          </div>
        )}

        {/* Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Accounts List (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Accounts List</h3>
              <span className="text-xs text-slate-400 font-medium">
                {accountsData?.accountGroupDetails?.length || 0} Groups Found
              </span>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-sm text-slate-500 font-medium">Retrieving authorized accounts...</p>
              </div>
            ) : accountsData?.accountGroupDetails ? (
              <div className="space-y-4">
                {accountsData.accountGroupDetails.map((group, gIdx) => {
                  const groupName = group.accountGroup;
                  
                  // Extract accounts in this group
                  const accounts = [
                    ...(group.checkingAccountsDetails || []),
                    ...(group.savingsAccountsDetails || []),
                    ...(group.creditCardAccountsDetails || []),
                    ...(group.loanAccountsDetails || []),
                    ...(group.lineOfCreditAccountsDetails || []),
                    ...(group.brokerageAccountsDetails || []),
                    ...(group.retirementAccountsDetails || [])
                  ];

                  if (accounts.length === 0) return null;

                  return (
                    <div key={gIdx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      {/* Group Header */}
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {groupName === 'CHECKING' || groupName === 'SAVINGS' ? (
                            <Wallet className="h-4 w-4 text-blue-600" />
                          ) : groupName === 'CREDITCARD' ? (
                            <CreditCard className="h-4 w-4 text-indigo-600" />
                          ) : (
                            <ArrowLeftRight className="h-4 w-4 text-emerald-600" />
                          )}
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{groupName}</span>
                        </div>
                        {group.totalCurrentBalance && (
                          <span className="text-xs font-bold text-slate-600">
                            Total: {group.totalCurrentBalance.localCurrencyBalanceAmount?.toLocaleString('en-US', {
                              style: 'currency',
                              currency: group.totalCurrentBalance.localCurrencyCode || 'USD'
                            })}
                          </span>
                        )}
                      </div>

                      {/* Group Accounts */}
                      <div className="divide-y divide-slate-100">
                        {accounts.map((acc: any, aIdx) => {
                          const isSelected = selectedAccount?.accountId === acc.accountId;
                          const balance = acc.currentBalance ?? acc.currentBalanceAmount ?? acc.accountValue ?? 0;
                          const available = acc.availableBalance ?? acc.creditAvailableAmount ?? 0;

                          return (
                            <button
                              key={aIdx}
                              onClick={() => handleSelectAccount(acc.accountId, groupName, acc.productName, acc.displayAccountNumber, acc)}
                              className={`w-full text-left p-4 transition-all flex items-center justify-between hover:bg-slate-50/80 ${
                                isSelected ? 'bg-blue-50/50 border-l-4 border-blue-600 pl-3' : ''
                              }`}
                            >
                              <div className="space-y-1 pr-4 truncate">
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-sm font-bold text-slate-800 truncate">{acc.productName}</h4>
                                  {acc.accountStatus && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                      acc.accountStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {acc.accountStatus}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 font-mono">{acc.displayAccountNumber}</p>
                                {acc.accountNickname && (
                                  <p className="text-[11px] text-slate-400 italic">"{acc.accountNickname}"</p>
                                )}
                              </div>

                              <div className="text-right flex-shrink-0">
                                <span className="text-sm font-extrabold text-slate-900 block">
                                  {balance.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: acc.currencyCode || 'USD'
                                  })}
                                </span>
                                {available > 0 && (
                                  <span className="text-[10px] text-slate-500 block">
                                    Avail: {available.toLocaleString('en-US', {
                                      style: 'currency',
                                      currency: acc.currencyCode || 'USD'
                                    })}
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <Database className="h-8 w-8 text-slate-400 mx-auto mb-4" />
                <p className="text-sm text-slate-500 font-medium">No accounts found.</p>
              </div>
            )}
          </div>

          {/* Right Column: Details, Routing & Transactions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {selectedAccount ? (
              <>
                {/* Account Details Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                        {selectedAccount.group} Account Details
                      </span>
                      <h2 className="text-xl font-extrabold text-slate-900 mt-1">{selectedAccount.productName}</h2>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {selectedAccount.accountId}</p>
                    </div>
                    <div className="bg-slate-100 p-2.5 rounded-xl text-slate-700">
                      {selectedAccount.group === 'CHECKING' || selectedAccount.group === 'SAVINGS' ? (
                        <Wallet className="h-6 w-6" />
                      ) : selectedAccount.group === 'CREDITCARD' ? (
                        <CreditCard className="h-6 w-6" />
                      ) : (
                        <ArrowLeftRight className="h-6 w-6" />
                      )}
                    </div>
                  </div>

                  {/* Dynamic Details Grid based on Account Group */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-xs text-slate-400 block">Balance Type</span>
                      <span className="text-xs font-bold text-slate-700">{selectedAccount.details.balanceType}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Currency</span>
                      <span className="text-xs font-bold text-slate-700">{selectedAccount.details.currencyCode}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Status</span>
                      <span className="text-xs font-bold text-slate-700">{selectedAccount.details.accountStatus || 'ACTIVE'}</span>
                    </div>

                    {/* Checking / Savings Specific */}
                    {selectedAccount.details.currentBalance !== undefined && (
                      <div>
                        <span className="text-xs text-slate-400 block">Ledger Balance</span>
                        <span className="text-xs font-bold text-slate-700">
                          {selectedAccount.details.currentBalance.toLocaleString('en-US', { style: 'currency', currency: selectedAccount.details.currencyCode })}
                        </span>
                      </div>
                    )}
                    {selectedAccount.details.availableBalance !== undefined && (
                      <div>
                        <span className="text-xs text-slate-400 block">Available Balance</span>
                        <span className="text-xs font-bold text-slate-700">
                          {selectedAccount.details.availableBalance.toLocaleString('en-US', { style: 'currency', currency: selectedAccount.details.currencyCode })}
                        </span>
                      </div>
                    )}

                    {/* Credit Card Specific */}
                    {selectedAccount.details.creditLimit !== undefined && (
                      <div>
                        <span className="text-xs text-slate-400 block">Credit Limit</span>
                        <span className="text-xs font-bold text-slate-700">
                          {selectedAccount.details.creditLimit.toLocaleString('en-US', { style: 'currency', currency: selectedAccount.details.currencyCode })}
                        </span>
                      </div>
                    )}
                    {selectedAccount.details.purchasesAPR !== undefined && (
                      <div>
                        <span className="text-xs text-slate-400 block">Purchases APR</span>
                        <span className="text-xs font-bold text-slate-700">{selectedAccount.details.purchasesAPR}%</span>
                      </div>
                    )}
                    {selectedAccount.details.paymentDueDate && (
                      <div>
                        <span className="text-xs text-slate-400 block">Payment Due Date</span>
                        <span className="text-xs font-bold text-slate-700">{selectedAccount.details.paymentDueDate}</span>
                      </div>
                    )}
                    {selectedAccount.details.minimumDueAmount !== undefined && (
                      <div>
                        <span className="text-xs text-slate-400 block">Minimum Due</span>
                        <span className="text-xs font-bold text-slate-700">
                          {selectedAccount.details.minimumDueAmount.toLocaleString('en-US', { style: 'currency', currency: selectedAccount.details.currencyCode })}
                        </span>
                      </div>
                    )}

                    {/* Loan Specific */}
                    {selectedAccount.details.currentBalanceAmount !== undefined && (
                      <div>
                        <span className="text-xs text-slate-400 block">Outstanding Principal</span>
                        <span className="text-xs font-bold text-slate-700">
                          {selectedAccount.details.currentBalanceAmount.toLocaleString('en-US', { style: 'currency', currency: selectedAccount.details.currencyCode })}
                        </span>
                      </div>
                    )}
                    {selectedAccount.details.autoPayFlag !== undefined && (
                      <div>
                        <span className="text-xs text-slate-400 block">Auto Pay</span>
                        <span className="text-xs font-bold text-slate-700">{selectedAccount.details.autoPayFlag ? "Enabled" : "Disabled"}</span>
                      </div>
                    )}
                  </div>

                  {/* Brokerage Holdings Sub-section */}
                  {selectedAccount.group === 'BROKERAGE' && selectedAccount.details.accountHoldings && (
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Portfolio Holdings</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-slate-400 border-b border-slate-100">
                              <th className="pb-2 font-semibold">Asset / Symbol</th>
                              <th className="pb-2 font-semibold text-right">Qty</th>
                              <th className="pb-2 font-semibold text-right">Price</th>
                              <th className="pb-2 font-semibold text-right">Total Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {selectedAccount.details.accountHoldings.map((holding: AccountHolding, hIdx: number) => (
                              <tr key={hIdx} className="text-slate-700">
                                <td className="py-2">
                                  <span className="font-bold text-slate-900 block">{holding.symbol}</span>
                                  <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">{holding.securityName}</span>
                                </td>
                                <td className="py-2 text-right font-mono">{holding.quantity?.toLocaleString()}</td>
                                <td className="py-2 text-right font-mono">${holding.price?.toFixed(2)}</td>
                                <td className="py-2 text-right font-bold text-slate-900 font-mono">
                                  ${holding.totalValueAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionFractionDigits: 2 })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Routing & Secure Encryption Details */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-blue-600" />
                      <span>Routing & Secure JWE Payload</span>
                    </h3>
                    <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                      GET /encrypt/accountRoutingNumber
                    </span>
                  </div>

                  {routingLoading ? (
                    <div className="py-6 text-center">
                      <RefreshCw className="h-6 w-6 text-blue-600 animate-spin mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Retrieving secure routing details...</p>
                    </div>
                  ) : routingError ? (
                    <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{routingError}</span>
                    </div>
                  ) : routingData ? (
                    <div className="space-y-4">
                      {/* Routing Number (Checking/Savings only) */}
                      {routingData.routingNumber && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">ABA Routing Number</span>
                            <span className="text-sm font-mono font-bold text-slate-800">{routingData.routingNumber}</span>
                          </div>
                          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Clear Text</span>
                          </div>
                        </div>
                      )}

                      {/* Encrypted Account Number JWE */}
                      {routingData.encryptedAccountNumber?.encryptedPayload && (
                        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl space-y-3 font-mono text-xs relative overflow-hidden">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-blue-400 font-bold text-[10px] uppercase tracking-wider">Encrypted Account Number (JWE)</span>
                            <button
                              onClick={() => setShowEncryptedPayload(!showEncryptedPayload)}
                              className="text-slate-400 hover:text-white flex items-center space-x-1 text-[10px] transition-colors"
                            >
                              {showEncryptedPayload ? (
                                <>
                                  <EyeOff className="h-3.5 w-3.5" />
                                  <span>Hide Raw JWE</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>Show Raw JWE</span>
                                </>
                              )}
                            </button>
                          </div>

                          {!showEncryptedPayload ? (
                            <div className="space-y-2">
                              <div>
                                <span className="text-slate-500 block text-[10px] uppercase">Ciphertext</span>
                                <p className="text-slate-200 break-all text-[11px] line-clamp-2">
                                  {routingData.encryptedAccountNumber.encryptedPayload.ciphertext}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4 pt-1">
                                <div>
                                  <span className="text-slate-500 block text-[10px] uppercase">Algorithm</span>
                                  <span className="text-slate-200 text-[11px]">
                                    {routingData.encryptedAccountNumber.encryptedPayload.header?.alg || "RSA-OAEP-256"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[10px] uppercase">Encryption</span>
                                  <span className="text-slate-200 text-[11px]">
                                    {routingData.encryptedAccountNumber.encryptedPayload.header?.enc || "A256CBC-HS512"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <pre className="text-[10px] text-slate-300 overflow-x-auto max-h-60 p-2 bg-black/30 rounded border border-slate-800">
                              {JSON.stringify(routingData.encryptedAccountNumber.encryptedPayload, null, 2)}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No routing data available.</p>
                  )}
                </div>

                {/* Transactions Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Header & Date Filters */}
                  <div className="p-6 border-b border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <ArrowLeftRight className="h-5 w-5 text-blue-600" />
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Account Transactions</h3>
                      </div>
                      <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold self-start sm:self-auto">
                        GET /accounts/{"{accountId}"}/transactions
                      </span>
                    </div>

                    {/* Date Range Selectors */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <div className="flex items-center space-x-2 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="date"
                          value={txFromDate}
                          onChange={(e) => setTxFromDate(e.target.value)}
                          className="bg-transparent text-xs text-slate-700 focus:outline-none"
                        />
                      </div>
                      <span className="text-xs text-slate-400">to</span>
                      <div className="flex items-center space-x-2 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="date"
                          value={txToDate}
                          onChange={(e) => setTxToDate(e.target.value)}
                          className="bg-transparent text-xs text-slate-700 focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => fetchTransactions(selectedAccount.accountId)}
                        disabled={txLoading}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3 w-3 ${txLoading ? 'animate-spin' : ''}`} />
                        <span>Apply</span>
                      </button>
                    </div>
                  </div>

                  {/* Transactions List / Table */}
                  {txLoading ? (
                    <div className="p-12 text-center">
                      <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
                      <p className="text-sm text-slate-500 font-medium">Loading transactions...</p>
                    </div>
                  ) : txError ? (
                    <div className="p-6 text-center">
                      <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-red-700 font-medium">{txError}</p>
                    </div>
                  ) : txList && txList.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-bold text-[10px]">
                            <th className="p-4">Date</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Type</th>
                            <th className="p-4 text-right">Amount</th>
                            <th className="p-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {txList.map((tx: any, idx: number) => {
                            const isDebit = tx.debitCreditMemo === 'DEBIT' || tx.buySellIndicator === 'BUY' || tx.transactionAmount > 0 && selectedAccount.group === 'CREDITCARD';
                            const amount = tx.transactionAmount ?? tx.netAmount ?? 0;
                            const date = tx.transactionDate ?? tx.transactionDateTime?.split('T')[0] ?? '';

                            return (
                              <tr key={idx} className="hover:bg-slate-50/50 text-slate-700">
                                <td className="p-4 font-mono whitespace-nowrap">{date}</td>
                                <td className="p-4">
                                  <span className="font-bold text-slate-900 block">
                                    {tx.transactionDescription ?? tx.longActivityDescription}
                                  </span>
                                  {tx.transactionDescriptionExtension && (
                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                      {tx.transactionDescriptionExtension}
                                    </span>
                                  )}
                                  {tx.merchantCategory && (
                                    <span className="inline-block bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded mt-1">
                                      MCC: {tx.merchantCategory} ({tx.merchantDescription})
                                    </span>
                                  )}
                                </td>
                                <td className="p-4">
                                  <span className="inline-block bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                    {tx.transactionType}
                                  </span>
                                </td>
                                <td className={`p-4 text-right font-mono font-bold text-sm whitespace-nowrap ${
                                  isDebit ? 'text-rose-600' : 'text-emerald-600'
                                }`}>
                                  {isDebit ? '-' : '+'}
                                  {amount.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: tx.currencyCode || 'USD'
                                  })}
                                </td>
                                <td className="p-4">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    tx.transactionStatus === 'POSTED' || tx.transactionStatus === 'BILLED'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    {tx.transactionStatus || 'POSTED'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <Info className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 font-medium">No transactions found for the selected date range.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm space-y-4">
                <div className="bg-blue-50 text-blue-600 p-4 rounded-full inline-block">
                  <Wallet className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No Account Selected</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Select an account from the list on the left to view detailed balances, retrieve routing numbers, and inspect transaction history.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-slate-700">Citi B2B Accounts API Integration Dashboard</span>
          </div>
          <p>© 2026 Citi Partner Network. All rights reserved. Confidential B2B API View.</p>
        </div>
      </footer>
    </div>
  );
}