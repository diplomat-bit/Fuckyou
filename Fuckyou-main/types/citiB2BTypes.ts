export type X5Certificates = string[];

export interface EncryptedAccountRoutingNumberEncryptedAccountNumberEncryptedPayloadHeader {
  zip?: string;
  alg: string;
  enc: string;
  kid: string;
  x5c: X5Certificates;
  cty: string;
}

export interface EncryptedAccountRoutingNumberEncryptedAccountNumberEncryptedPayload {
  header?: EncryptedAccountRoutingNumberEncryptedAccountNumberEncryptedPayloadHeader;
  encrypted_key: string;
  iv: string;
  ciphertext: string;
  authTag: string;
  aad: string;
}

export interface EncryptedAccountRoutingNumberEncryptedAccountNumber {
  encryptedPayload?: EncryptedAccountRoutingNumberEncryptedAccountNumberEncryptedPayload;
}

export interface EncryptedAccountRoutingNumber {
  encryptedAccountNumber?: EncryptedAccountRoutingNumberEncryptedAccountNumber;
  routingNumber?: string;
}

export interface Http400Response {
  code?: string;
  type?: string;
  moreInformation?: string;
}

export interface Http404Response {
  httpCode?: string;
  httpMessage?: string;
  moreInformation?: string;
}

export interface Http401Response {
  code?: string;
  type?: string;
  moreInformation?: string;
}

export interface Customer {
  customerId?: string;
}

export interface AccountsGroupDetailsList {
  accountGroupDetails?: AccountGroupDetails[];
  customer?: Customer;
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

export interface RetirementAccountDetailsListRetirementPlanComponents {
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
  retirementPlanComponents?: RetirementAccountDetailsListRetirementPlanComponents[];
}

export type BrokerageAccountTransactionType = 'CASH' | 'MARGIN' | 'NONE';

export interface BrokerageAccountDetailsList {
  accountId: string;
  displayAccountNumber: string;
  accountRegistrationType: 'INDIVDUALINVESTMENTS' | 'TRADITIONALIRA' | 'ROTHIRA' | 'SEPIRA' | 'PLAN529' | 'RETIREMENT' | 'RETAIL' | 'RVP_DVP' | 'RETAIL_THIRD_PARTY_AS_CUSTODIAN' | 'SELF_DIRECTED_401K' | 'UNKNOWN';
  accountTradingCapableFlag: boolean;
  balanceType: 'ASSET' | 'LIABILITY';
  productName?: string;
  accountDescription?: string;
  brokerageAccountTransactionTypes: BrokerageAccountTransactionType[];
  accountHoldings?: AccountHolding[];
  totalPortfolioBalanceAmount?: number;
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

export interface GroupBalance {
  localCurrencyCode?: string;
  localCurrencyBalanceAmount?: number;
}

export interface GetAccountTransactionsResp {
  checkingAccountTransactions?: CheckingAccountTransaction[];
  savingsAccountTransactions?: SavingsAccountTransaction[];
  creditCardAccountTransactions?: CreditCardAccountTransaction[];
  loanAccountTransactions?: LoanAccountTransaction[];
  lineOfCreditAccountTransactions?: LineOfCreditAccountTransaction[];
  brokerageAccountTransactions?: BrokerageAccountTransaction[];
}

export type DebitCreditMemo = 'DEBIT' | 'CREDIT';

export interface CheckingAccountTransaction {
  accountId: string;
  checkNumber?: number;
  currencyCode: string;
  debitCreditMemo?: DebitCreditMemo;
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
  debitCreditMemo?: DebitCreditMemo;
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
  debitCreditMemo?: DebitCreditMemo;
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
  debitCreditMemo?: DebitCreditMemo;
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
  debitCreditMemo?: DebitCreditMemo;
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

export type BuySellIndicatorType = 'BUY' | 'SELL' | 'NONE';

export interface BrokerageAccountTransaction {
  accountId: string;
  displayAccountNumber?: string;
  currencyCode: string;
  securityIdentifier: SecurityIdentifier;
  assetClass: string;
  assetType: string;
  buySellIndicator: BuySellIndicatorType;
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

export interface ErrorList {
  errors?: ErrorResponse[];
}

export interface ErrorResponse {
  type: 'error' | 'warn' | 'invalid' | 'fatal';
  code: string;
  details?: string;
  location?: string;
  moreInfo?: string;
}