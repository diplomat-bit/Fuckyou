import React, { useEffect, useState, useMemo } from 'react';

const Box: React.FC<{ p?: number; mb?: number; className?: string; children: React.ReactNode }> = ({ children, p, mb, className }) => (
  <div style={{ padding: p ? `${p * 4}px` : undefined, marginBottom: mb ? `${mb * 4}px` : undefined }} className={className}>
    {children}
  </div>
);

const Card: React.FC<{ mb?: number; children: React.ReactNode }> = ({ children, mb }) => (
  <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', marginBottom: mb ? `${mb * 4}px` : undefined, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
    {children}
  </div>
);

const Heading: React.FC<{ as?: 'h1' | 'h2' | 'h3'; size?: 'xl' | 'lg' | 'md'; mb?: number; children: React.ReactNode }> = ({ children, as = 'h2', size = 'md', mb }) => {
  const Tag = as;
  const fontSize = size === 'xl' ? '2.5rem' : size === 'lg' ? '2rem' : '1.5rem';
  return <Tag style={{ fontSize, marginBottom: mb ? `${mb * 4}px` : undefined, fontWeight: '600', marginTop: 0 }}>{children}</Tag>;
};

const Text: React.FC<{ mt?: number; children: React.ReactNode }> = ({ children, mt }) => (
  <p style={{ marginTop: mt ? `${mt * 4}px` : undefined, lineHeight: '1.5', marginBlockStart: 0, marginBlockEnd: 0 }}>{children}</p>
);

const Spinner: React.FC = () => (
  <div style={{
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    animation: 'spin 1s linear infinite'
  }}></div>
);

const Alert: React.FC<{ status: 'error' | 'info'; children: React.ReactNode }> = ({ status, children }) => (
  <div style={{ padding: '12px', borderRadius: '4px', backgroundColor: status === 'error' ? '#fdecea' : '#e0f2f7', color: status === 'error' ? '#c53030' : '#2c5282' }}>
    {children}
  </div>
);

const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>{children}</table>
);

const Flex: React.FC<{ direction?: 'row' | 'column'; gap?: number; children: React.ReactNode }> = ({ children, direction = 'row', gap }) => (
  <div style={{ display: 'flex', flexDirection: direction, gap: gap ? `${gap * 4}px` : undefined }}>{children}</div>
);

// Self-contained style injection
const GlobalStyles = () => (
  <style>{`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}</style>
);

type Currency = 'USD' | 'CAD' | 'AED' | 'AFN' | 'ALL' | 'AMD' | 'ANG' | 'AOA' | 'ARS' | 'AUD' | 'AWG' | 'AZN' | 'BAM' | 'BBD' | 'BCH' | 'BDT' | 'BGN' | 'BHD' | 'BIF' | 'BMD' | 'BND' | 'BOB' | 'BRL' | 'BSD' | 'BTC' | 'BTN' | 'BWP' | 'BYN' | 'BYR' | 'BZD' | 'CDF' | 'CHF' | 'CLF' | 'CLP' | 'CNH' | 'CNY' | 'COP' | 'CRC' | 'CUC' | 'CUP' | 'CVE' | 'CZK' | 'DJF' | 'DKK' | 'DOP' | 'DZD' | 'EEK' | 'EGP' | 'ERN' | 'ETB' | 'EUR' | 'FJD' | 'FKP' | 'GBP' | 'GBX' | 'GEL' | 'GGP' | 'GHS' | 'GIP' | 'GMD' | 'GNF' | 'GTQ' | 'GYD' | 'HKD' | 'HNL' | 'HRK' | 'HTG' | 'HUF' | 'IDR' | 'ILS' | 'IMP' | 'INR' | 'IQD' | 'IRR' | 'ISK' | 'JEP' | 'JMD' | 'JOD' | 'JPY' | 'KES' | 'KGS' | 'KHR' | 'KMF' | 'KPW' | 'KRW' | 'KWD' | 'KYD' | 'KZT' | 'LAK' | 'LBP' | 'LKR' | 'LRD' | 'LSL' | 'LTL' | 'LVL' | 'LYD' | 'MAD' | 'MDL' | 'MGA' | 'MKD' | 'MMK' | 'MNT' | 'MOP' | 'MRO' | 'MRU' | 'MTL' | 'MUR' | 'MVR' | 'MWK' | 'MXN' | 'MYR' | 'MZN' | 'NAD' | 'NGN' | 'NIO' | 'NOK' | 'NPR' | 'NZD' | 'OMR' | 'PAB' | 'PEN' | 'PGK' | 'PHP' | 'PKR' | 'PLN' | 'PYG' | 'QAR' | 'RON' | 'RSD' | 'RUB' | 'RWF' | 'SAR' | 'SBD' | 'SCR' | 'SDG' | 'SEK' | 'SGD' | 'SHP' | 'SKK' | 'SLL' | 'SOS' | 'SRD' | 'SSP' | 'STD' | 'SVC' | 'SYP' | 'SZL' | 'THB' | 'TJS' | 'TMM' | 'TMT' | 'TND' | 'TOP' | 'TRY' | 'TTD' | 'TWD' | 'TZS' | 'UAH' | 'UGX' | 'UYU' | 'UZS' | 'VEF' | 'VES' | 'VND' | 'VUV' | 'WST' | 'XAF' | 'XAG' | 'XAU' | 'XBA' | 'XBB' | 'XBC' | 'XBD' | 'XCD' | 'XDR' | 'XFU' | 'XOF' | 'XPD' | 'XPF' | 'XPT' | 'XTS' | 'YER' | 'ZAR' | 'ZMK' | 'ZMW' | 'ZWD' | 'ZWL' | 'ZWN' | 'ZWR';

interface AccountDetail {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  discarded_at: string | null;
  account_number: string;
  account_number_type: 'iban' | 'clabe' | 'wallet_address' | 'pan' | 'other';
  account_number_safe: string;
}

interface RoutingDetail {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  discarded_at: string | null;
  routing_number: string;
  routing_number_type: 'aba' | 'swift' | 'ca_cpa' | 'au_bsb' | 'gb_sort_code' | 'in_ifsc' | 'cnaps' | 'my_branch_code' | 'br_codigo';
  payment_type: 'ach' | 'au_becs' | 'bacs' | 'book' | 'card' | 'check' | 'cross_border' | 'eft' | 'interac' | 'masav' | 'neft' | 'provxchange' | 'rtp' | 'sen' | 'sepa' | 'signet' | 'wire' | null;
  bank_name: string;
}

interface Connection {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  discarded_at: string | null;
  vendor_id: string;
  vendor_customer_id: string | null;
  vendor_name: string;
}

interface InternalAccount {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  account_type: 'checking' | 'savings' | 'other' | 'cash' | 'loan' | 'non_resident' | 'overdraft' | null;
  party_name: string;
  party_type: 'individual' | 'business' | null;
  name: string | null;
  account_details: AccountDetail[];
  routing_details: RoutingDetail[];
  connection: Connection;
  currency: Currency;
  metadata: Record<string, string>;
  parent_account_id: string | null;
  counterparty_id: string | null;
}

interface Balance {
  amount: number;
  currency: Currency;
  balance_type: 'opening_ledger' | 'closing_ledger' | 'current_ledger' | 'opening_available' | 'opening_available_next_business_day' | 'closing_available' | 'current_available' | 'other';
}

interface BalanceReport {
  id: string;
  object: string;
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  balance_report_type: 'intraday' | 'previous_day' | 'real_time' | 'other';
  as_of_date: string;
  as_of_time: string | null;
  balances: Balance[];
  internal_account_id: string;
}

interface ErrorMessage {
  errors?: {
    code?: string;
    message?: string;
    parameter?: string;
  };
  message?: string;
}

const mockInternalAccounts: InternalAccount[] =[
  {
    id: 'ia_12345',
    object: 'internal_account',
    live_mode: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account_type: 'checking',
    party_name: 'My Company Inc.',
    party_type: 'business',
    name: 'Main Checking USD',
    account_details: [],
    routing_details:[],
    connection: {
      id: 'conn_abc',
      object: 'connection',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      discarded_at: null,
      vendor_id: 'vend_1',
      vendor_customer_id: null,
      vendor_name: 'Bank One',
    },
    currency: 'USD',
    metadata: {},
    parent_account_id: null,
    counterparty_id: null,
  },
  {
    id: 'ia_67890',
    object: 'internal_account',
    live_mode: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account_type: 'savings',
    party_name: 'My Company Inc.',
    party_type: 'business',
    name: 'Savings CAD',
    account_details: [],
    routing_details:[],
    connection: {
      id: 'conn_def',
      object: 'connection',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      discarded_at: null,
      vendor_id: 'vend_2',
      vendor_customer_id: null,
      vendor_name: 'Bank Two',
    },
    currency: 'CAD',
    metadata: {},
    parent_account_id: null,
    counterparty_id: null,
  },
];

const mockBalanceReportsData: Record<string, BalanceReport[]> = {
  'ia_12345':[
    {
      id: 'br_usd_1',
      object: 'balance_report',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      balance_report_type: 'real_time',
      as_of_date: '2024-01-26',
      as_of_time: '14:30:00',
      balances:[
        { amount: 1500000, currency: 'USD', balance_type: 'current_available' },
        { amount: 1520000, currency: 'USD', balance_type: 'current_ledger' },
      ],
      internal_account_id: 'ia_12345',
    },
  ],
  'ia_67890':[
    {
      id: 'br_cad_1',
      object: 'balance_report',
      live_mode: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      balance_report_type: 'real_time',
      as_of_date: '2024-01-26',
      as_of_time: '14:30:00',
      balances:[
        { amount: 500000, currency: 'CAD', balance_type: 'current_available' },
        { amount: 510000, currency: 'CAD', balance_type: 'current_ledger' },
      ],
      internal_account_id: 'ia_67890',
    },
  ],
};

const apiClient = {
  listInternalAccounts: async (): Promise<{ data: InternalAccount[] }> => {
    return new Promise(resolve => setTimeout(() => resolve({ data: mockInternalAccounts }), 500));
  },
  listBalanceReports: async (accountId: string, params?: { per_page?: number; balance_report_type?: string }): Promise<{ data: BalanceReport[] }> => {
    return new Promise(resolve => setTimeout(() => {
      let reports = mockBalanceReportsData[accountId] ||[];
      if (params?.balance_report_type) {
        reports = reports.filter(report => report.balance_report_type === params.balance_report_type);
      }
      if (params?.per_page) {
        reports = reports.slice(0, params.per_page);
      }
      resolve({ data: reports });
    }, 300));
  },
};

interface AggregatedCurrencyBalance {
  currency: Currency;
  available_balance: number;
  current_ledger: number;
}

const AccountsDashboardView: React.FC = () => {
  const [internalAccounts, setInternalAccounts] = useState<InternalAccount[]>([]);
  const[accountBalanceReports, setAccountBalanceReports] = useState<Record<string, BalanceReport>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountsAndBalances = async () => {
      try {
        setLoading(true);
        setError(null);
        const accountsResponse = await apiClient.listInternalAccounts();
        const accounts = accountsResponse.data ||[];
        setInternalAccounts(accounts);
        const balancesMap: Record<string, BalanceReport> = {};
        const fetchBalancePromises = accounts.map(async (account) => {
          try {
            const res = await apiClient.listBalanceReports(account.id, { per_page: 1, balance_report_type: 'real_time' });
            if (res.data && res.data.length > 0) balancesMap[account.id] = res.data[0];
          } catch (e) {
            console.warn(`Failed to fetch balance for ${account.id}:`, e);
          }
        });
        await Promise.all(fetchBalancePromises);
        setAccountBalanceReports(balancesMap);
      } catch (err: any) {
        const msg = (err as ErrorMessage).message || err.message || 'Failed to load data.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchAccountsAndBalances();
  },[]);

  const getBalanceAmount = (report: BalanceReport | undefined, type: 'current_available' | 'current_ledger'): number | null => {
    return report?.balances.find(b => b.balance_type === type)?.amount ?? null;
  };

  const totalAggregatedBalances = useMemo((): AggregatedCurrencyBalance[] => {
    const agg: Record<string, { available: number; ledger: number }> = {};
    internalAccounts.forEach(account => {
      const cur = account.currency;
      if (!agg[cur]) agg[cur] = { available: 0, ledger: 0 };
      const report = accountBalanceReports[account.id];
      agg[cur].available += getBalanceAmount(report, 'current_available') || 0;
      agg[cur].ledger += getBalanceAmount(report, 'current_ledger') || 0;
    });
    return Object.entries(agg).map(([cur, b]) => ({
      currency: cur as Currency,
      available_balance: b.available,
      current_ledger: b.ledger,
    }));
  }, [internalAccounts, accountBalanceReports]);

  if (loading) return <Box p={4}><GlobalStyles /><Spinner /><Text mt={2}>Loading accounts overview...</Text></Box>;
  if (error) return <Box p={4}><GlobalStyles /><Alert status="error"><Text>{error}</Text></Alert></Box>;

  return (
    <Box p={4} className="accounts-dashboard-view">
      <GlobalStyles />
      <Heading as="h1" size="xl" mb={6}>Accounts Dashboard</Heading>
      <Card mb={6}>
        <Heading as="h2" size="lg" mb={4}>Total Balances Across Currencies</Heading>
        {totalAggregatedBalances.length > 0 ? (
          <Flex direction="column" gap={2}>
            {totalAggregatedBalances.map((agg) => (
              <Text key={agg.currency}>
                <strong>{agg.currency}:</strong> Available {(agg.available_balance / 100).toFixed(2)} | Ledger {(agg.current_ledger / 100).toFixed(2)}
              </Text>
            ))}
          </Flex>
        ) : <Text>No balances available.</Text>}
      </Card>
      <Card>
        <Heading as="h2" size="lg" mb={4}>Individual Internal Accounts</Heading>
        <Table>
          <thead style={{ borderBottom: '1px solid #e0e0e0' }}>
            <tr>
              <th style={{ padding: '8px', textAlign: 'left' }}>Account</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Currency</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Vendor</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Available</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Ledger</th>
            </tr>
          </thead>
          <tbody>
            {internalAccounts.map(account => {
              const report = accountBalanceReports[account.id];
              const avail = getBalanceAmount(report, 'current_available');
              const ledger = getBalanceAmount(report, 'current_ledger');
              return (
                <tr key={account.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{account.name || account.id}</td>
                  <td style={{ padding: '8px' }}>{account.currency}</td>
                  <td style={{ padding: '8px' }}>{account.account_type || 'N/A'}</td>
                  <td style={{ padding: '8px' }}>{account.connection?.vendor_name || 'N/A'}</td>
                  <td style={{ padding: '8px' }}>{avail !== null ? `${(avail / 100).toFixed(2)}` : 'N/A'}</td>
                  <td style={{ padding: '8px' }}>{ledger !== null ? `${(ledger / 100).toFixed(2)}` : 'N/A'}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </Box>
  );
};

export default AccountsDashboardView;