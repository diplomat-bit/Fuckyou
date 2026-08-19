

// --- CONSOLIDATED FROM: ./components/CitiB2B/ApiConsole.tsx ---

import React, { useState, useEffect, useMemo } from 'react';

// Define the endpoints structure
interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  hasPathParams: boolean;
  hasQueryParams: boolean;
}

const ENDPOINTS: Endpoint[] = [
  {
    id: 'getAccountsDetails',
    method: 'GET',
    path: '/accounts/details',
    summary: 'Retrieve details of all accounts',
    description: 'Returns account details for all accounts held by Citi customers who have authorized your app. Supports cards, checking & savings, loans, line of credit, brokerage and retirement accounts.',
    hasPathParams: false,
    hasQueryParams: false,
  },
  {
    id: 'getRoutingNumber',
    method: 'GET',
    path: '/accounts/{accountId}/encrypt/accountRoutingNumber',
    summary: 'Retrieve routing number and encrypted account number',
    description: 'Retrieve routing number (clear text) and encrypted account number of a specific account.',
    hasPathParams: true,
    hasQueryParams: false,
  },
  {
    id: 'getTransactionsDetails',
    method: 'GET',
    path: '/accounts/{accountId}/transactions',
    summary: 'Retrieve transactions',
    description: 'Returns an array of transactions for the specified account. Supports cards, checking, savings, loans, line of credit and brokerage account transactions.',
    hasPathParams: true,
    hasQueryParams: true,
  }
];

// Helper to generate a random UUID
const generateUUID = (): string => {
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  // Fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Mock responses matching the OpenAPI schemas
const MOCK_RESPONSES: Record<string, any> = {
  getAccountsDetails: {
    accountGroupDetails: [
      {
        accountGroup: "CHECKING",
        checkingAccountsDetails: [
          {
            productName: "Business Checking",
            accountNickname: "My checking account",
            accountDescription: "Business Checking - 9594",
            balanceType: "ASSET",
            displayAccountNumber: "XXXXXX9594",
            accountId: "da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6",
            currencyCode: "USD",
            accountStatus: "ACTIVE",
            currentBalance: 10000.25,
            availableBalance: 15000.25
          }
        ],
        totalCurrentBalance: {
          localCurrencyCode: "USD",
          localCurrencyBalanceAmount: 10000.25
        },
        totalAvailableBalance: {
          localCurrencyCode: "USD",
          localCurrencyBalanceAmount: 15000.25
        }
      },
      {
        accountGroup: "CREDITCARD",
        creditCardAccountsDetails: [
          {
            productName: "Citi Rewards+℠ Card",
            accountDescription: "Citi Rewards+℠ Card - 7899",
            balanceType: "LIABILITY",
            displayAccountNumber: "XXXXXXXXXXXX7899",
            accountId: "8035a60debb671e89bd451c9ad0f283e8f1b8868dd4dc65520ceb7bdfeb4142999f574c9db37917ef0edfae296745142543e3ad2bc034887f37212ecbde83ee0",
            currencyCode: "USD",
            accountStatus: "ACTIVE",
            availableCredit: 15000,
            creditLimit: 20000,
            purchasesAPR: 23.45,
            minimumDueAmount: 1500,
            paymentDueDate: "2026-09-27",
            currentBalance: 10000.25,
            lastStatementBalance: 5000.25,
            lastStatementDate: "2026-08-27",
            advancesAPR: 23.45,
            cashAdvanceLimit: 5000,
            cashAdvanceAvailableAmount: 2500,
            lastPaymentAmount: 1500.25,
            lastPaymentDate: "2026-08-12"
          }
        ],
        totalCurrentBalance: {
          localCurrencyCode: "USD",
          localCurrencyBalanceAmount: 10000.25
        }
      }
    ],
    customer: {
      customerId: "bd12a6d89815aed77be876225b9a2c7f6648f0af82e84198f49d1b7e51a23fae1621936bc1addf5fdceca25c3aae5f92071fb1d6218dae32ca83b199c29962ee"
    }
  },
  getRoutingNumber: {
    encryptedAccountNumber: {
      encryptedPayload: {
        header: {
          zip: "DEF",
          alg: "RSA-OAEP-256",
          enc: "A256CBC-HS512",
          kid: "Citi_2020-02-10",
          x5c: [
            "07cceb63ea50b385336e7f6887",
            "MIID8TCCAtmgAwIBAgIUHhjRZWi"
          ],
          cty: "text/plain"
        },
        encrypted_key: "8b3021f817b01a64c419213d70bbd0552c",
        iv: "cf532cc7c81046e66541791001",
        ciphertext: "47ecwvmLhO1amdatjLdSr8Q+B8CRVXUX6Ez7JiFieEaeKtrRu99JDoX4u1FQarMkZZDaJ65 eVuZ4RXU4xvNeEJHToQx3iboo1hyDLOhMdoSLPJQfx46",
        authTag: "PGdwAzKMbpt9jTE6YDEZ2GNMCTlrPuL4Hu2gAFOtZbA",
        aad: "n_WoDmI9OQFDy4suLquWqKNoctGXQIjpjNGOrUD2uDk7gzJBSSaiD4UYdise45GhaVhbiZeVU"
      }
    },
    routingNumber: "122401710"
  },
  getTransactionsDetails: {
    checkingAccountTransactions: [
      {
        accountId: "da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6",
        checkNumber: 1007,
        currencyCode: "USD",
        debitCreditMemo: "DEBIT",
        displayAccountNumber: "XXXXX1035",
        transactionAmount: 12.22,
        transactionDate: "2026-08-15",
        transactionDescription: "AUTOMATED PHONE + TRANSFER FROM August 15 10:35 5058",
        transactionDescriptionExtension: "TELEPHONE Reference# 545226",
        transactionId: "0507777777777000001519171200000",
        transactionStatus: "POSTED",
        transactionType: "PAYMENT"
      }
    ],
    creditCardAccountTransactions: [
      {
        accountId: "da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6",
        currencyCode: "USD",
        debitCreditMemo: "DEBIT",
        displayAccountNumber: "XXXXX1035",
        foreignCurrency: 22.16,
        merchantCategory: "4411",
        merchantDescription: "CRUISE LINES",
        merchantCountry: "SAN FRANCISCO CA",
        transactionDate: "2026-08-14",
        transactionPostingDate: "2026-08-15",
        transactionId: "172470002",
        transactionAmount: 50.55,
        transactionDescription: "PRE-AUTHORIZED TRANSFER TO CreditCard",
        transactionStatus: "BILLED",
        transactionType: "PAYMENT",
        memberName: "ISLASHERNANDEZ,WERNER"
      }
    ]
  }
};

export const ApiConsole: React.FC = () => {
  // Selected Endpoint
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(ENDPOINTS[0]);

  // Base URL
  const [baseUrl, setBaseUrl] = useState<string>('https://sandbox.api.citibank.com/api/accounts/account-transactions/partner/v1');

  // Headers
  const [authorization, setAuthorization] = useState<string>('Bearer mock-oauth-token-xyz-987654321');
  const [uuid, setUuid] = useState<string>(generateUUID());
  const [clientId, setClientId] = useState<string>('citi-partner-client-id-abc-123');
  const [accept, setAccept] = useState<string>('application/json');

  // Path Parameters
  const [accountId, setAccountId] = useState<string>('da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6');

  // Query Parameters
  const [transactionFromDate, setTransactionFromDate] = useState<string>('2026-08-01');
  const [transactionToDate, setTransactionToDate] = useState<string>('2026-08-17');

  // Console Mode (Mock vs Live)
  const [isMockMode, setIsMockMode] = useState<boolean>(true);

  // Response State
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseStatusText, setResponseStatusText] = useState<string>('');
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [requestUrl, setRequestUrl] = useState<string>('');
  const [requestHeadersUsed, setRequestHeadersUsed] = useState<Record<string, string>>({});

  // Copy to Clipboard State
  const [copied, setCopied] = useState<boolean>(false);

  // Generate a new UUID on mount
  useEffect(() => {
    setUuid(generateUUID());
  }, []);

  // Compute the actual request URL based on parameters
  const computedUrl = useMemo(() => {
    let path = selectedEndpoint.path;
    if (selectedEndpoint.hasPathParams) {
      path = path.replace('{accountId}', encodeURIComponent(accountId));
    }
    const url = new URL(baseUrl.replace(/\/$/, '') + path);
    if (selectedEndpoint.hasQueryParams) {
      url.searchParams.append('transactionFromDate', transactionFromDate);
      url.searchParams.append('transactionToDate', transactionToDate);
    }
    return url.toString();
  }, [selectedEndpoint, baseUrl, accountId, transactionFromDate, transactionToDate]);

  // Handle sending the request
  const handleSendRequest = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponseStatusText('');
    setResponseTime(null);
    setResponseHeaders({});
    setResponseBody('');

    const headers: Record<string, string> = {
      'Authorization': authorization,
      'uuid': uuid,
      'client_id': clientId,
      'Accept': accept,
    };

    setRequestUrl(computedUrl);
    setRequestHeadersUsed(headers);

    const startTime = performance.now();

    if (isMockMode) {
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 400));
      const endTime = performance.now();
      
      setResponseStatus(200);
      setResponseStatusText('OK (Mocked)');
      setResponseTime(Math.round(endTime - startTime));
      setResponseHeaders({
        'content-type': 'application/json; charset=utf-8',
        'x-mock-response': 'true',
        'cache-control': 'no-cache',
      });
      setResponseBody(JSON.stringify(MOCK_RESPONSES[selectedEndpoint.id], null, 2));
      setIsLoading(false);
    } else {
      try {
        const response = await fetch(computedUrl, {
          method: selectedEndpoint.method,
          headers: headers,
        });
        const endTime = performance.now();

        setResponseStatus(response.status);
        setResponseStatusText(response.statusText);
        setResponseTime(Math.round(endTime - startTime));

        const resHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          resHeaders[key] = value;
        });
        setResponseHeaders(resHeaders);

        const text = await response.text();
        try {
          const json = JSON.parse(text);
          setResponseBody(JSON.stringify(json, null, 2));
        } catch {
          setResponseBody(text);
        }
      } catch (err: any) {
        const endTime = performance.now();
        setResponseStatus(0);
        setResponseStatusText('Error');
        setResponseTime(Math.round(endTime - startTime));
        setResponseBody(JSON.stringify({
          error: 'Failed to fetch',
          message: err.message || 'The request could not be completed. This might be due to CORS restrictions or network connectivity issues.',
          tip: 'If you are testing locally, ensure CORS is enabled on your server, or switch to "Mock Mode" to preview responses.'
        }, null, 2));
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Copy response body to clipboard
  const handleCopy = () => {
    if (!responseBody) return;
    navigator.clipboard.writeText(responseBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg font-bold tracking-wider text-sm shadow-lg shadow-blue-500/20">
            CITI
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Accounts &amp; Transactions API Console</h1>
            <p className="text-xs text-slate-400">Interactive B2B Partner API Sandbox</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Console Mode:</span>
          <div className="bg-slate-800 p-1 rounded-lg flex items-center border border-slate-700">
            <button
              onClick={() => setIsMockMode(true)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                isMockMode
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mock Mode
            </button>
            <button
              onClick={() => setIsMockMode(false)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                !isMockMode
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live API
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: Request Builder */}
        <div className="w-full lg:w-1/2 border-r border-slate-800 flex flex-col overflow-y-auto p-6 space-y-6">
          {/* Endpoint Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Endpoint
            </label>
            <div className="space-y-2">
              {ENDPOINTS.map((ep) => {
                const isSelected = selectedEndpoint.id === ep.id;
                return (
                  <button
                    key={ep.id}
                    onClick={() => setSelectedEndpoint(ep)}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-slate-800/80 border-blue-500/50 shadow-lg shadow-blue-500/5'
                        : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded border border-green-500/20">
                        {ep.method}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-200">
                        {ep.path}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium pl-1">
                      {ep.summary}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Base URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="https://api.citi.com/..."
            />
          </div>

          {/* Headers Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Headers
              </label>
              <span className="text-[10px] text-slate-500">All headers are required</span>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 space-y-4">
              {/* Authorization */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Authorization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={authorization}
                  onChange={(e) => setAuthorization(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
                  placeholder="Bearer {accessToken}"
                />
              </div>

              {/* UUID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-medium text-slate-400">
                    uuid <span className="text-red-500">*</span>
                  </label>
                  <button
                    onClick={() => setUuid(generateUUID())}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H19M9 5a7 7 0 0112.007 4.993l-.007.007H19" />
                    </svg>
                    Regenerate
                  </button>
                </div>
                <input
                  type="text"
                  value={uuid}
                  onChange={(e) => setUuid(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
                  placeholder="128-bit random UUID"
                />
              </div>

              {/* Client ID */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  client_id <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
                  placeholder="client_id generated during onboarding"
                />
              </div>

              {/* Accept */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Accept <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={accept}
                  onChange={(e) => setAccept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
                  placeholder="application/json"
                />
              </div>
            </div>
          </div>

          {/* Parameters Section */}
          {(selectedEndpoint.hasPathParams || selectedEndpoint.hasQueryParams) && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Parameters
              </label>
              <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 space-y-4">
                {/* Path Parameters */}
                {selectedEndpoint.hasPathParams && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      accountId (Path) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
                      placeholder="Encrypted Account token or account guid"
                    />
                  </div>
                )}

                {/* Query Parameters */}
                {selectedEndpoint.hasQueryParams && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        transactionFromDate (Query) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={transactionFromDate}
                        onChange={(e) => setTransactionFromDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        transactionToDate (Query) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={transactionToDate}
                        onChange={(e) => setTransactionToDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Send Button */}
          <div className="pt-4">
            <button
              onClick={handleSendRequest}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.001 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending Request...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Send Request
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: Response Viewer */}
        <div className="w-full lg:w-1/2 bg-slate-950 flex flex-col overflow-hidden">
          {/* Response Header Info */}
          <div className="border-b border-slate-800 p-4 flex items-center justify-between bg-slate-950/80">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Response
              </span>
              {responseStatus !== null && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    responseStatus >= 200 && responseStatus < 300
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}
                >
                  {responseStatus} {responseStatusText}
                </span>
              )}
            </div>
            {responseTime !== null && (
              <span className="text-xs text-slate-400 font-medium">
                Time: <strong className="text-slate-200">{responseTime} ms</strong>
              </span>
            )}
          </div>

          {/* Response Body & Details */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Request Details Sent */}
            {requestUrl && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Request Sent
                </h3>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/20 mt-0.5">
                      {selectedEndpoint.method}
                    </span>
                    <span className="text-xs font-mono text-slate-300 break-all">
                      {requestUrl}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Headers Sent
                    </span>
                    <div className="grid grid-cols-1 gap-1 text-xs font-mono">
                      {Object.entries(requestHeadersUsed).map(([key, val]) => (
                        <div key={key} className="flex items-start gap-2">
                          <span className="text-slate-500 min-w-[100px]">{key}:</span>
                          <span className="text-slate-300 break-all">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Response Headers */}
            {Object.keys(responseHeaders).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Response Headers
                </h3>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-xs font-mono space-y-1">
                  {Object.entries(responseHeaders).map(([key, val]) => (
                    <div key={key} className="flex items-start gap-2">
                      <span className="text-slate-500 min-w-[120px]">{key}:</span>
                      <span className="text-slate-300 break-all">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Response Body */}
            <div className="space-y-2 flex-1 flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Response Body
                </h3>
                {responseBody && (
                  <button
                    onClick={handleCopy}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-5 4h5m-5 4h5m-2 5h2" />
                        </svg>
                        Copy JSON
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
                {responseBody ? (
                  <pre className="flex-1 p-4 overflow-auto text-xs font-mono text-slate-300 leading-relaxed select-text">
                    <code>{responseBody}</code>
                  </pre>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                    <svg className="w-12 h-12 mb-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium">No request sent yet</p>
                    <p className="text-xs text-slate-600 mt-1 max-w-xs">
                      Configure your headers and parameters, then click "Send Request" to view the response.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};