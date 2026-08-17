import { Router, Request, Response } from 'express';
import { citiB2BMockService } from './citiB2BMockService';

// ============================================================================
// TypeScript Interfaces matching the OpenAPI Specification
// ============================================================================

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

export interface Http400Response {
  code: string;
  type: string;
  moreInformation: string;
}

export interface Http401Response {
  code: string;
  type: string;
  moreInformation: string;
}

export interface Http404Response {
  httpCode: string;
  httpMessage: string;
  moreInformation: string;
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

export interface GroupBalance {
  localCurrencyCode?: string;
  localCurrencyBalanceAmount?: number;
}

export interface Customer {
  customerId?: string;
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

export interface RetirementAccountDetailsList {
  productName: string;
  balanceType: 'ASSET' | 'LIABILITY';
  displayAccountNumber: string;
  accountDescription?: string;
  accountId: string;
  accountValue?: number;
  accountStatus: 'ACTIVE';
  asOfDateTime?: string;
  retirementPlanComponents?: {
    componentName: string;
    currencyCode: string;
    currentTerms?: string;
    totalValueAmount: number;
    interestPaidYTD?: number;
    nextMaturityDate?: string;
  }[];
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

// ============================================================================
// Request Validation Helpers
// ============================================================================

interface ValidationError {
  status: number;
  body: any;
}

/**
 * Validates the common headers required by all endpoints.
 * Formats the error response based on the endpoint's expected error schema.
 */
function validateCommonHeaders(req: Request, errorType: 'ErrorList' | 'Http400_401'): ValidationError | null {
  const authorization = req.header('Authorization');
  const uuid = req.header('uuid');
  const accept = req.header('Accept');
  const clientId = req.header('client_id');

  if (!authorization || !uuid || !accept || !clientId) {
    if (errorType === 'Http400_401') {
      return {
        status: 400,
        body: {
          code: 'invalidRequest',
          type: 'invalid',
          moreInformation: 'Missing required headers: Authorization, uuid, Accept, or client_id.'
        } as Http400Response
      };
    } else {
      return {
        status: 400,
        body: {
          errors: [
            {
              type: 'invalid',
              code: 'invalidRequest',
              details: 'Missing required headers: Authorization, uuid, Accept, or client_id.',
              location: 'headers'
            }
          ]
        } as ErrorList
      };
    }
  }

  // Validate UUID format (128-bit random UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    if (errorType === 'Http400_401') {
      return {
        status: 400,
        body: {
          code: 'invalidRequest',
          type: 'invalid',
          moreInformation: 'Header uuid must be a valid 128-bit UUID.'
        } as Http400Response
      };
    } else {
      return {
        status: 400,
        body: {
          errors: [
            {
              type: 'invalid',
              code: 'invalidRequest',
              details: 'Header uuid must be a valid 128-bit UUID.',
              location: 'uuid'
            }
          ]
        } as ErrorList
      };
    }
  }

  // Validate Authorization format (Bearer + space + token)
  if (!authorization.startsWith('Bearer ')) {
    if (errorType === 'Http400_401') {
      return {
        status: 401,
        body: {
          code: '401',
          type: 'unAuthorized',
          moreInformation: 'Authorization credentials are missing or invalid.'
        } as Http401Response
      };
    } else {
      return {
        status: 401,
        body: {
          errors: [
            {
              type: 'error',
              code: 'unAuthorized',
              details: 'Authorization credentials are missing or invalid.',
              location: 'Authorization'
            }
          ]
        } as ErrorList
      };
    }
  }

  return null;
}

/**
 * Validates the query parameters for the transactions endpoint.
 */
function validateQueryDates(transactionFromDate: any, transactionToDate: any): ValidationError | null {
  if (!transactionFromDate || !transactionToDate) {
    return {
      status: 400,
      body: {
        errors: [
          {
            type: 'invalid',
            code: 'invalidRequest',
            details: 'Missing required query parameters: transactionFromDate and transactionToDate are both required.',
            location: 'query'
          }
        ]
      } as ErrorList
    };
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(transactionFromDate as string)) {
    return {
      status: 400,
      body: {
        errors: [
          {
            type: 'error',
            code: 'invalidTransactionFromDate',
            details: 'The transactionFromDate provided is invalid. The date format must be YYYY-MM-DD.',
            location: 'transactionFromDate'
          }
        ]
      } as ErrorList
    };
  }

  if (!dateRegex.test(transactionToDate as string)) {
    return {
      status: 400,
      body: {
        errors: [
          {
            type: 'error',
            code: 'invalidTransactionToDate',
            details: 'The transactionToDate provided is invalid. The date format must be YYYY-MM-DD.',
            location: 'transactionToDate'
          }
        ]
      } as ErrorList
    };
  }

  const fromDate = new Date(transactionFromDate as string);
  const toDate = new Date(transactionToDate as string);

  if (isNaN(fromDate.getTime())) {
    return {
      status: 400,
      body: {
        errors: [
          {
            type: 'error',
            code: 'invalidTransactionFromDate',
            details: 'The transactionFromDate provided is an invalid date.',
            location: 'transactionFromDate'
          }
        ]
      } as ErrorList
    };
  }

  if (isNaN(toDate.getTime())) {
    return {
      status: 400,
      body: {
        errors: [
          {
            type: 'error',
            code: 'invalidTransactionToDate',
            details: 'The transactionToDate provided is an invalid date.',
            location: 'transactionToDate'
          }
        ]
      } as ErrorList
    };
  }

  // transactionFromDate > transactionToDate
  if (fromDate > toDate) {
    return {
      status: 400,
      body: {
        errors: [
          {
            type: 'error',
            code: 'transactionFromToDateComboInvalid',
            details: 'The transactionFromDate value is greater (later) than the transactionToDate value.',
            location: 'transactionFromDate'
          }
        ]
      } as ErrorList
    };
  }

  // transactionFromDate should not be 24 months prior to current date
  const currentDate = new Date();
  const twentyFourMonthsAgo = new Date();
  twentyFourMonthsAgo.setMonth(currentDate.getMonth() - 24);
  if (fromDate < twentyFourMonthsAgo) {
    return {
      status: 400,
      body: {
        errors: [
          {
            type: 'error',
            code: 'tranxFromDate2YrsPriorToCurrDate',
            details: 'Transaction from date should not be 24 months prior to current date.',
            location: 'transactionFromDate'
          }
        ]
      } as ErrorList
    };
  }

  // transactionToDate should not be after current date
  if (toDate > currentDate) {
    return {
      status: 400,
      body: {
        errors: [
          {
            type: 'error',
            code: 'tranxToDateAfterCurrDate',
            details: 'Transaction to date should not be after current date.',
            location: 'transactionToDate'
          }
        ]
      } as ErrorList
    };
  }

  return null;
}

// ============================================================================
// Express Router Implementation
// ============================================================================

const router = Router();

/**
 * GET /accounts/details
 * Retrieve details of all accounts.
 */
router.get('/accounts/details', async (req: Request, res: Response) => {
  const validationError = validateCommonHeaders(req, 'ErrorList');
  if (validationError) {
    return res.status(validationError.status).json(validationError.body);
  }

  try {
    const clientId = req.header('client_id')!;
    const data = await citiB2BMockService.getAccountsDetails(clientId);

    if (!data || !data.accountGroupDetails || data.accountGroupDetails.length === 0) {
      return res.status(400).json({
        errors: [
          {
            type: 'error',
            code: 'noAccounts',
            details: 'No active accounts or No accounts linked for customer',
            location: 'client_id'
          }
        ]
      } as ErrorList);
    }

    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({
      errors: [
        {
          type: 'fatal',
          code: 'serverUnavailable',
          details: error.message || 'The request failed due to an internal error'
        }
      ]
    } as ErrorList);
  }
});

/**
 * GET /accounts/{accountId}/encrypt/accountRoutingNumber
 * Retrieve routing number (clear text) and encrypted account number of a specific account.
 */
router.get('/accounts/:accountId/encrypt/accountRoutingNumber', async (req: Request, res: Response) => {
  const validationError = validateCommonHeaders(req, 'Http400_401');
  if (validationError) {
    return res.status(validationError.status).json(validationError.body);
  }

  const { accountId } = req.params;
  if (!accountId) {
    return res.status(400).json({
      code: 'invalidRequest',
      type: 'invalid',
      moreInformation: 'Missing or invalid Parameters: accountId is required.'
    } as Http400Response);
  }

  try {
    const data = await citiB2BMockService.getRoutingNumber(accountId);

    if (!data) {
      return res.status(404).json({
        httpCode: '404',
        httpMessage: 'Not Found',
        moreInformation: 'The requested resource was not found'
      } as Http404Response);
    }

    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({
      errors: [
        {
          type: 'fatal',
          code: 'serverUnavailable',
          details: error.message || 'The request failed due to an internal error/server unavailability'
        }
      ]
    } as ErrorList);
  }
});

/**
 * GET /accounts/{accountId}/transactions
 * Retrieve transactions for a specific account.
 */
router.get('/accounts/:accountId/transactions', async (req: Request, res: Response) => {
  const headerValidationError = validateCommonHeaders(req, 'ErrorList');
  if (headerValidationError) {
    return res.status(headerValidationError.status).json(headerValidationError.body);
  }

  const { accountId } = req.params;
  if (!accountId) {
    return res.status(400).json({
      errors: [
        {
          type: 'invalid',
          code: 'invalidRequest',
          details: 'Missing or invalid request parameters: accountId is required.',
          location: 'accountId'
        }
      ]
    } as ErrorList);
  }

  const { transactionFromDate, transactionToDate } = req.query;
  const queryValidationError = validateQueryDates(transactionFromDate, transactionToDate);
  if (queryValidationError) {
    return res.status(queryValidationError.status).json(queryValidationError.body);
  }

  try {
    const data = await citiB2BMockService.getTransactions(
      accountId,
      transactionFromDate as string,
      transactionToDate as string
    );

    if (!data) {
      return res.status(404).json({
        errors: [
          {
            type: 'error',
            code: 'resourceNotFound',
            details: 'Resource not found',
            location: 'accountId'
          }
        ]
      } as ErrorList);
    }

    // Check if there are no transactions across all categories to return 204 No Content
    const hasTransactions =
      (data.checkingAccountTransactions && data.checkingAccountTransactions.length > 0) ||
      (data.savingsAccountTransactions && data.savingsAccountTransactions.length > 0) ||
      (data.creditCardAccountTransactions && data.creditCardAccountTransactions.length > 0) ||
      (data.loanAccountTransactions && data.loanAccountTransactions.length > 0) ||
      (data.lineOfCreditAccountTransactions && data.lineOfCreditAccountTransactions.length > 0) ||
      (data.brokerageAccountTransactions && data.brokerageAccountTransactions.length > 0);

    if (!hasTransactions) {
      return res.status(204).send();
    }

    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({
      errors: [
        {
          type: 'fatal',
          code: 'serverUnavailable',
          details: error.message || 'The request failed due to an internal error'
        }
      ]
    } as ErrorList);
  }
});

export default router;