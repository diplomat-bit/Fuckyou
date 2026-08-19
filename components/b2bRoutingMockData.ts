

// --- CONSOLIDATED FROM: ./components/data/b2bRoutingMockData.ts ---

export interface BankRoutingInfo {
  routingNumber: string;
  bankName: string;
  status: 'active' | 'suspended' | 'inactive';
  address: string;
  city: string;
  state: string;
  zip: string;
  supportedRails: ('ACH' | 'Wire' | 'RTP')[];
}

export interface TemplateRecipient {
  id: string;
  name: string;
  routingNumber: string;
  accountNumber: string;
  accountType: 'checking' | 'savings';
  amount: number;
  memo: string;
}

export interface BatchTransactionTemplate {
  id: string;
  name: string;
  description: string;
  paymentType: 'ACH' | 'Wire' | 'RTP';
  sourceRoutingNumber: string;
  sourceAccountNumber: string;
  recipients: TemplateRecipient[];
  totalAmount: number;
  category: 'Payroll' | 'Vendor Payment' | 'Tax' | 'Treasury' | 'Operations';
}

export const mockRoutingDirectory: Record<string, BankRoutingInfo> = {
  '021000021': {
    routingNumber: '021000021',
    bankName: 'JPMorgan Chase Bank, N.A.',
    status: 'active',
    address: '270 Park Avenue',
    city: 'New York',
    state: 'NY',
    zip: '10017',
    supportedRails: ['ACH', 'Wire', 'RTP']
  },
  '121000248': {
    routingNumber: '121000248',
    bankName: 'Wells Fargo Bank, N.A.',
    status: 'active',
    address: '420 Montgomery Street',
    city: 'San Francisco',
    state: 'CA',
    zip: '94104',
    supportedRails: ['ACH', 'Wire', 'RTP']
  },
  '026009593': {
    routingNumber: '026009593',
    bankName: 'Bank of America, N.A.',
    status: 'active',
    address: '100 North Tryon Street',
    city: 'Charlotte',
    state: 'NC',
    zip: '28255',
    supportedRails: ['ACH', 'Wire', 'RTP']
  },
  '021000089': {
    routingNumber: '021000089',
    bankName: 'Citibank, N.A.',
    status: 'active',
    address: '388 Greenwich Street',
    city: 'New York',
    state: 'NY',
    zip: '10013',
    supportedRails: ['ACH', 'Wire', 'RTP']
  },
  '031000053': {
    routingNumber: '031000053',
    bankName: 'PNC Bank, N.A.',
    status: 'active',
    address: '300 Fifth Avenue',
    city: 'Pittsburgh',
    state: 'PA',
    zip: '15222',
    supportedRails: ['ACH', 'Wire', 'RTP']
  },
  '091000022': {
    routingNumber: '091000022',
    bankName: 'U.S. Bank, N.A.',
    status: 'active',
    address: '800 Nicollet Mall',
    city: 'Minneapolis',
    state: 'MN',
    zip: '55402',
    supportedRails: ['ACH', 'Wire', 'RTP']
  },
  '051405515': {
    routingNumber: '051405515',
    bankName: 'Capital One, N.A.',
    status: 'active',
    address: '1680 Capital One Drive',
    city: 'McLean',
    state: 'VA',
    zip: '22102',
    supportedRails: ['ACH', 'Wire']
  },
  '031201360': {
    routingNumber: '031201360',
    bankName: 'TD Bank, N.A.',
    status: 'active',
    address: '1701 Route 70 East',
    city: 'Cherry Hill',
    state: 'NJ',
    zip: '08034',
    supportedRails: ['ACH', 'Wire']
  },
  '021200025': {
    routingNumber: '021200025',
    bankName: 'The Bank of New York Mellon',
    status: 'active',
    address: '240 Greenwich Street',
    city: 'New York',
    state: 'NY',
    zip: '10286',
    supportedRails: ['ACH', 'Wire', 'RTP']
  },
  '021001033': {
    routingNumber: '021001033',
    bankName: 'HSBC Bank USA, N.A.',
    status: 'active',
    address: '452 Fifth Avenue',
    city: 'New York',
    state: 'NY',
    zip: '10018',
    supportedRails: ['ACH', 'Wire']
  },
  '121140399': {
    routingNumber: '121140399',
    bankName: 'Silicon Valley Bank (Division of First Citizens)',
    status: 'active',
    address: '3003 Tasman Drive',
    city: 'Santa Clara',
    state: 'CA',
    zip: '95054',
    supportedRails: ['ACH', 'Wire']
  },
  '021000128': {
    routingNumber: '021000128',
    bankName: 'Signature Bank (Bridge Bank)',
    status: 'suspended',
    address: '565 Fifth Avenue',
    city: 'New York',
    state: 'NY',
    zip: '10017',
    supportedRails: ['ACH']
  }
};

export const initialBatchTemplates: BatchTransactionTemplate[] = [
  {
    id: 'tpl_payroll_01',
    name: 'Standard Bi-Weekly Payroll',
    description: 'Standard payroll distribution for corporate headquarters staff.',
    paymentType: 'ACH',
    sourceRoutingNumber: '021000021', // Chase
    sourceAccountNumber: '123456789012',
    category: 'Payroll',
    totalAmount: 48500.00,
    recipients: [
      {
        id: 'rec_pay_01',
        name: 'Jane Doe',
        routingNumber: '121000248', // Wells Fargo
        accountNumber: '9876543210',
        accountType: 'checking',
        amount: 4500.00,
        memo: 'Payroll Period Ending 15-Oct'
      },
      {
        id: 'rec_pay_02',
        name: 'John Smith',
        routingNumber: '026009593', // BofA
        accountNumber: '5544332211',
        accountType: 'checking',
        amount: 5200.00,
        memo: 'Payroll Period Ending 15-Oct'
      },
      {
        id: 'rec_pay_03',
        name: 'Alice Johnson',
        routingNumber: '031000053', // PNC
        accountNumber: '1122334455',
        accountType: 'savings',
        amount: 3800.00,
        memo: 'Payroll Period Ending 15-Oct'
      },
      {
        id: 'rec_pay_04',
        name: 'Bob Miller',
        routingNumber: '091000022', // US Bank
        accountNumber: '9988776655',
        accountType: 'checking',
        amount: 35000.00,
        memo: 'Executive Payroll Period Ending 15-Oct'
      }
    ]
  },
  {
    id: 'tpl_vendor_01',
    name: 'Monthly Supplier Disbursements',
    description: 'Recurring payments to primary hardware and cloud infrastructure vendors.',
    paymentType: 'Wire',
    sourceRoutingNumber: '026009593', // BofA
    sourceAccountNumber: '987654321098',
    category: 'Vendor Payment',
    totalAmount: 185000.00,
    recipients: [
      {
        id: 'rec_vend_01',
        name: 'Apex Cloud Solutions LLC',
        routingNumber: '021000089', // Citi
        accountNumber: '4455667788',
        accountType: 'checking',
        amount: 125000.00,
        memo: 'INV-2023-8902 Cloud Hosting'
      },
      {
        id: 'rec_vend_02',
        name: 'Global Logistics Corp',
        routingNumber: '051405515', // Capital One
        accountNumber: '3322110099',
        accountType: 'checking',
        amount: 60000.00,
        memo: 'INV-2023-771 Freight Services'
      }
    ]
  },
  {
    id: 'tpl_treasury_01',
    name: 'End-of-Day Liquidity Sweep',
    description: 'Sweep excess operational cash into high-yield treasury reserve accounts.',
    paymentType: 'RTP',
    sourceRoutingNumber: '021000021', // Chase
    sourceAccountNumber: '123456789012',
    category: 'Treasury',
    totalAmount: 500000.00,
    recipients: [
      {
        id: 'rec_tres_01',
        name: 'Corporate Reserve Fund A',
        routingNumber: '021200025', // BNY Mellon
        accountNumber: '887766554433',
        accountType: 'checking',
        amount: 300000.00,
        memo: 'Liquidity Sweep Segment A'
      },
      {
        id: 'rec_tres_02',
        name: 'Corporate Reserve Fund B',
        routingNumber: '021000089', // Citi
        accountNumber: '112233445566',
        accountType: 'checking',
        amount: 200000.00,
        memo: 'Liquidity Sweep Segment B'
      }
    ]
  },
  {
    id: 'tpl_tax_01',
    name: 'Quarterly Estimated Tax Payments',
    description: 'Federal and state corporate estimated tax distributions.',
    paymentType: 'ACH',
    sourceRoutingNumber: '121000248', // Wells Fargo
    sourceAccountNumber: '556677889900',
    category: 'Tax',
    totalAmount: 75000.00,
    recipients: [
      {
        id: 'rec_tax_01',
        name: 'Internal Revenue Service',
        routingNumber: '021000021', // Chase (IRS Depository)
        accountNumber: '100000000001',
        accountType: 'checking',
        amount: 60000.00,
        memo: 'Q3 Corporate Estimated Tax Form 1120'
      },
      {
        id: 'rec_tax_02',
        name: 'State Franchise Tax Board',
        routingNumber: '121000248', // Wells Fargo (State Depository)
        accountNumber: '200000000002',
        accountType: 'checking',
        amount: 15000.00,
        memo: 'Q3 State Franchise Tax'
      }
    ]
  }
];

/**
 * Validates an ABA Routing Transit Number (RTN) using the standard checksum algorithm.
 * Formula: 3(d1 + d4 + d7) + 7(d2 + d5 + d8) + (d3 + d6 + d9) mod 10 = 0
 */
export function validateRoutingNumber(routing: string): boolean {
  const cleanRouting = routing.replace(/\D/g, '');
  if (cleanRouting.length !== 9) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i += 3) {
    sum += parseInt(cleanRouting.charAt(i), 10) * 3;
    sum += parseInt(cleanRouting.charAt(i + 1), 10) * 7;
    sum += parseInt(cleanRouting.charAt(i + 2), 10) * 1;
  }

  return sum !== 0 && sum % 10 === 0;
}

/**
 * Looks up a routing number in the mock directory.
 * Returns the bank info if found, or a generic object if valid but unknown.
 */
export function lookupRoutingNumber(routing: string): BankRoutingInfo | null {
  const cleanRouting = routing.replace(/\D/g, '');
  
  if (mockRoutingDirectory[cleanRouting]) {
    return mockRoutingDirectory[cleanRouting];
  }

  if (validateRoutingNumber(cleanRouting)) {
    return {
      routingNumber: cleanRouting,
      bankName: 'Unknown Financial Institution (Valid Checksum)',
      status: 'active',
      address: '123 Financial Way',
      city: 'Metropolis',
      state: 'US',
      zip: '00000',
      supportedRails: ['ACH', 'Wire']
    };
  }

  return null;
}