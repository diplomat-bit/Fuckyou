export interface HttpHeaders {
  [key: string]: string;
}

export interface Account {
  accountId: string;
  accountName: string;
  accountType: 'SAVINGS' | 'CHECKING' | 'INVESTMENT' | 'LOAN' | string;
  balance: number;
  currency: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED' | string;
  lastUpdated: string;
}

export interface AccountGroupSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  currency: string;
  accounts: Account[];
  refreshTimestamp: string;
}

export interface CreditCard {
  cardId: string;
  cardName: string;
  cardNumberLastFour: string;
  outstandingBalance: number;
  creditLimit: number;
  availableCredit: number;
  dueDate: string;
  minimumPaymentDue: number;
  apr: number;
  status: 'ACTIVE' | 'BLOCKED' | 'EXPIRED' | string;
}

export interface CreditCardAccountSummary {
  totalCreditLimit: number;
  totalOutstandingBalance: number;
  totalAvailableCredit: number;
  currency: string;
  cards: CreditCard[];
  refreshTimestamp: string;
}

export interface AccountSummaryRow {
  timestamp: Date;
  method: string;
  url: string;
  statusCode: number;
  requestHeaders: HttpHeaders;
  responseHeaders: HttpHeaders;
  accountGroupSummary: AccountGroupSummary | null;
  creditCardAccountSummary: CreditCardAccountSummary | null;
  rawRow?: string[];
}

/**
 * Parses a single line of a CSV file, respecting RFC 4180 rules for double quotes and commas.
 */
export function parseCsvRow(text: string): string[] {
  const result: string[] = [];
  let insideQuote = false;
  let entry = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        entry += '"';
        i++; // Skip the second quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      result.push(entry.trim());
      entry = '';
    } else {
      entry += char;
    }
  }
  result.push(entry.trim());
  return result;
}

/**
 * Parses an entire CSV string into a 2D array of fields, correctly handling newlines inside quotes.
 */
export function parseCsv(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let entry = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        entry += '"';
        i++; // Skip the second quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      row.push(entry.trim());
      entry = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      row.push(entry.trim());
      entry = '';
      if (row.length > 0 && (row.length > 1 || row[0] !== '')) {
        lines.push(row);
      }
      row = [];
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip the \n of \r\n
      }
    } else {
      entry += char;
    }
  }
  
  if (entry || row.length > 0) {
    row.push(entry.trim());
    if (row.length > 0 && (row.length > 1 || row[0] !== '')) {
      lines.push(row);
    }
  }

  return lines;
}

/**
 * Serializes an array of string fields into a single RFC 4180 compliant CSV row.
 */
export function serializeCsvRow(fields: string[]): string {
  return fields
    .map(field => {
      const clean = field.replace(/"/g, '""');
      if (clean.includes(',') || clean.includes('\n') || clean.includes('\r') || clean.includes('"')) {
        return `"${clean}"`;
      }
      return clean;
    })
    .join(',');
}

/**
 * Parses raw HTTP headers (either in JSON format or standard HTTP raw format) into a key-value map.
 */
export function parseHttpHeaders(rawHeaders: string): HttpHeaders {
  const headers: HttpHeaders = {};
  if (!rawHeaders) return headers;

  const trimmed = rawHeaders.trim();
  
  // Try parsing as JSON first
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const normalized: HttpHeaders = {};
      for (const key of Object.keys(parsed)) {
        normalized[key.toLowerCase()] = String(parsed[key]);
      }
      return normalized;
    } catch {
      // Fallback to standard raw header parsing if JSON parsing fails
    }
  }

  // Parse standard raw HTTP headers (Key: Value)
  const lines = trimmed.split(/\r?\n/);
  for (const line of lines) {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex !== -1) {
      const key = line.substring(0, separatorIndex).trim().toLowerCase();
      const value = line.substring(separatorIndex + 1).trim();
      if (key) {
        headers[key] = value;
      }
    }
  }
  return headers;
}

/**
 * Safely parses a nested JSON payload from a CSV cell, handling potential escaping issues.
 */
export function safeParseJson<T>(rawJson: string): T | null {
  if (!rawJson) return null;
  const trimmed = rawJson.trim();
  if (!trimmed) return null;

  try {
    let cleanJson = trimmed;
    // Strip wrapping quotes if the CSV parser left them intact
    if (cleanJson.startsWith('"') && cleanJson.endsWith('"')) {
      cleanJson = cleanJson.slice(1, -1).replace(/""/g, '"');
    }
    return JSON.parse(cleanJson) as T;
  } catch (e) {
    console.warn('Failed to parse nested JSON payload in account summary CSV:', rawJson, e);
    return null;
  }
}

/**
 * Parses the entire CSV content of the account-summary file into strongly-typed TypeScript objects.
 */
export function parseAccountSummaryCsv(csvContent: string): AccountSummaryRow[] {
  const allRows = parseCsv(csvContent);
  if (allRows.length < 2) return [];

  const headerRow = allRows[0];
  const rows: AccountSummaryRow[] = [];

  // Dynamically map header names to indices to ensure robustness against column reordering
  const indices = {
    timestamp: headerRow.findIndex(h => /timestamp/i.test(h)),
    method: headerRow.findIndex(h => /method/i.test(h)),
    url: headerRow.findIndex(h => /url/i.test(h)),
    statusCode: headerRow.findIndex(h => /status/i.test(h) || /code/i.test(h)),
    requestHeaders: headerRow.findIndex(h => /request.*header/i.test(h)),
    responseHeaders: headerRow.findIndex(h => /response.*header/i.test(h)),
    accountGroupSummary: headerRow.findIndex(h => /account.*group/i.test(h)),
    creditCardAccountSummary: headerRow.findIndex(h => /credit.*card/i.test(h)),
  };

  for (let i = 1; i < allRows.length; i++) {
    const rawRow = allRows[i];
    const validIndices = Object.values(indices).filter(idx => idx !== -1);
    const maxIndex = validIndices.length > 0 ? Math.max(...validIndices) : -1;

    if (rawRow.length < maxIndex + 1) {
      // Skip incomplete or malformed rows
      continue;
    }

    const getValue = (index: number): string => (index !== -1 && rawRow[index] ? rawRow[index] : '');

    const timestampStr = getValue(indices.timestamp);
    const timestamp = timestampStr ? new Date(timestampStr) : new Date();
    const statusCode = parseInt(getValue(indices.statusCode), 10) || 200;

    const row: AccountSummaryRow = {
      timestamp: isNaN(timestamp.getTime()) ? new Date() : timestamp,
      method: getValue(indices.method) || 'GET',
      url: getValue(indices.url) || '/api/account-summary',
      statusCode,
      requestHeaders: parseHttpHeaders(getValue(indices.requestHeaders)),
      responseHeaders: parseHttpHeaders(getValue(indices.responseHeaders)),
      accountGroupSummary: safeParseJson<AccountGroupSummary>(getValue(indices.accountGroupSummary)),
      creditCardAccountSummary: safeParseJson<CreditCardAccountSummary>(getValue(indices.creditCardAccountSummary)),
      rawRow,
    };

    rows.push(row);
  }

  return rows;
}

/**
 * Serializes an array of AccountSummaryRow objects back into a standard CSV string.
 */
export function serializeAccountSummaryCsv(rows: AccountSummaryRow[]): string {
  const headers = [
    'Timestamp',
    'Method',
    'URL',
    'StatusCode',
    'RequestHeaders',
    'ResponseHeaders',
    'AccountGroupSummary',
    'CreditCardAccountSummary',
  ];

  const csvLines = [serializeCsvRow(headers)];

  for (const row of rows) {
    const reqHeadersStr = JSON.stringify(row.requestHeaders);
    const resHeadersStr = JSON.stringify(row.responseHeaders);
    const groupSummaryStr = row.accountGroupSummary ? JSON.stringify(row.accountGroupSummary) : '';
    const ccSummaryStr = row.creditCardAccountSummary ? JSON.stringify(row.creditCardAccountSummary) : '';

    const fields = [
      row.timestamp.toISOString(),
      row.method,
      row.url,
      row.statusCode.toString(),
      reqHeadersStr,
      resHeadersStr,
      groupSummaryStr,
      ccSummaryStr,
    ];

    csvLines.push(serializeCsvRow(fields));
  }

  return csvLines.join('\n');
}

/**
 * Generates a mock AccountGroupSummary structure for testing and simulation.
 */
export function createMockAccountGroupSummary(): AccountGroupSummary {
  return {
    totalAssets: 154200.50,
    totalLiabilities: 12500.00,
    netWorth: 141700.50,
    currency: 'USD',
    accounts: [
      {
        accountId: 'act_8839102',
        accountName: 'Citi Priority Checking',
        accountType: 'CHECKING',
        balance: 12450.75,
        currency: 'USD',
        status: 'ACTIVE',
        lastUpdated: new Date().toISOString()
      },
      {
        accountId: 'act_1102938',
        accountName: 'Citi Accelerate Savings',
        accountType: 'SAVINGS',
        balance: 141749.75,
        currency: 'USD',
        status: 'ACTIVE',
        lastUpdated: new Date().toISOString()
      }
    ],
    refreshTimestamp: new Date().toISOString()
  };
}

/**
 * Generates a mock CreditCardAccountSummary structure for testing and simulation.
 */
export function createMockCreditCardAccountSummary(): CreditCardAccountSummary {
  return {
    totalCreditLimit: 50000.00,
    totalOutstandingBalance: 3450.20,
    totalAvailableCredit: 46549.80,
    currency: 'USD',
    cards: [
      {
        cardId: 'crd_99201',
        cardName: 'Citi Double Cash Card',
        cardNumberLastFour: '4321',
        outstandingBalance: 1250.40,
        creditLimit: 20000.00,
        availableCredit: 18749.60,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        minimumPaymentDue: 35.00,
        apr: 18.99,
        status: 'ACTIVE'
      },
      {
        cardId: 'crd_11029',
        cardName: 'Citi Custom Cash Card',
        cardNumberLastFour: '8765',
        outstandingBalance: 2199.80,
        creditLimit: 30000.00,
        availableCredit: 27800.20,
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        minimumPaymentDue: 75.00,
        apr: 19.99,
        status: 'ACTIVE'
      }
    ],
    refreshTimestamp: new Date().toISOString()
  };
}

/**
 * Type guard to validate if an object conforms to the AccountGroupSummary interface.
 */
export function isAccountGroupSummary(obj: any): obj is AccountGroupSummary {
  return (
    obj &&
    typeof obj.totalAssets === 'number' &&
    typeof obj.totalLiabilities === 'number' &&
    typeof obj.netWorth === 'number' &&
    Array.isArray(obj.accounts)
  );
}

/**
 * Type guard to validate if an object conforms to the CreditCardAccountSummary interface.
 */
export function isCreditCardAccountSummary(obj: any): obj is CreditCardAccountSummary {
  return (
    obj &&
    typeof obj.totalCreditLimit === 'number' &&
    typeof obj.totalOutstandingBalance === 'number' &&
    Array.isArray(obj.cards)
  );
}