import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export interface AccountGroup {
  id: string;
  name: string;
  description: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
}

export interface TransferPurpose {
  code: string;
  label: string;
  description: string;
  category: 'personal' | 'business' | 'treasury' | 'other';
}

export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  currency: string;
  flag: string;
  phoneCode: string;
}

export interface ReferenceDataContextType {
  accountGroups: AccountGroup[];
  transferPurposes: TransferPurpose[];
  countries: Country[];
  isLoading: boolean;
  error: string | null;
  getAccountGroup: (id: string) => AccountGroup | undefined;
  getAccountGroupLabel: (id: string) => string;
  getTransferPurpose: (code: string) => TransferPurpose | undefined;
  getTransferPurposeLabel: (code: string) => string;
  getCountry: (code: string) => Country | undefined;
  getCountryName: (code: string) => string;
  refresh: () => Promise<void>;
}

const ReferenceDataContext = createContext<ReferenceDataContextType | undefined>(undefined);

// Mock Data matching Swagger specifications and standard financial schemas
const MOCK_ACCOUNT_GROUPS: AccountGroup[] = [
  { id: 'AG001', name: 'Liquid Assets', description: 'Cash, bank balances, and highly liquid short-term investments', type: 'asset' },
  { id: 'AG002', name: 'Receivables', description: 'Amounts owed by customers and other debtors', type: 'asset' },
  { id: 'AG003', name: 'Operating Expenses', description: 'Day-to-day operational expenditures', type: 'expense' },
  { id: 'AG004', name: 'Short-term Liabilities', description: 'Obligations due within one fiscal year', type: 'liability' },
  { id: 'AG005', name: 'Retained Earnings', description: 'Cumulative net earnings retained in the business', type: 'equity' },
  { id: 'AG006', name: 'Sales Revenue', description: 'Inflow of economic benefits from core operations', type: 'revenue' },
  { id: 'AG007', name: 'Long-term Investments', description: 'Assets held for capital appreciation or long-term yield', type: 'asset' },
];

const MOCK_TRANSFER_PURPOSES: TransferPurpose[] = [
  { code: 'SALA', label: 'Salary Payment', description: 'Regular payroll or wage disbursement', category: 'personal' },
  { code: 'GIFT', label: 'Gift / Family Support', description: 'Non-commercial personal remittance to family or friends', category: 'personal' },
  { code: 'GDDS', label: 'Purchase of Goods', description: 'Payment for physical merchandise or inventory', category: 'business' },
  { code: 'SCVE', label: 'Services Rendered', description: 'Payment for professional, technical, or consulting services', category: 'business' },
  { code: 'RENT', label: 'Rent / Lease Payment', description: 'Payment for commercial or residential property lease', category: 'business' },
  { code: 'TAXS', label: 'Tax Payment', description: 'Settlement of corporate, personal, or sales taxes', category: 'treasury' },
  { code: 'TREA', label: 'Treasury Management', description: 'Internal liquidity transfer or capital restructuring', category: 'treasury' },
  { code: 'OTHR', label: 'Other Miscellaneous', description: 'Other transactions not covered by standard codes', category: 'other' },
];

const MOCK_COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸', phoneCode: '+1' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧', phoneCode: '+44' },
  { code: 'DE', name: 'Germany', currency: 'EUR', flag: '🇩🇪', phoneCode: '+49' },
  { code: 'FR', name: 'France', currency: 'EUR', flag: '🇫🇷', phoneCode: '+33' },
  { code: 'CA', name: 'Canada', currency: 'CAD', flag: '🇨🇦', phoneCode: '+1' },
  { code: 'JP', name: 'Japan', currency: 'JPY', flag: '🇯🇵', phoneCode: '+81' },
  { code: 'AU', name: 'Australia', currency: 'AUD', flag: '🇦🇺', phoneCode: '+61' },
  { code: 'SG', name: 'Singapore', currency: 'SGD', flag: '🇸🇬', phoneCode: '+65' },
  { code: 'CH', name: 'Switzerland', currency: 'CHF', flag: '🇨🇭', phoneCode: '+41' },
  { code: 'BR', name: 'Brazil', currency: 'BRL', flag: '🇧🇷', phoneCode: '+55' },
];

export const ReferenceDataCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accountGroups, setAccountGroups] = useState<AccountGroup[]>([]);
  const [transferPurposes, setTransferPurposes] = useState<TransferPurpose[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadReferenceData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulating network latency for fetching reference data
      await new Promise((resolve) => setTimeout(resolve, 600));
      
      setAccountGroups(MOCK_ACCOUNT_GROUPS);
      setTransferPurposes(MOCK_TRANSFER_PURPOSES);
      setCountries(MOCK_COUNTRIES);
    } catch (err) {
      setError('Failed to load reference data cache.');
      console.error('ReferenceDataCacheProvider Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  const getAccountGroup = useCallback((id: string) => {
    return accountGroups.find((group) => group.id === id);
  }, [accountGroups]);

  const getAccountGroupLabel = useCallback((id: string) => {
    const group = getAccountGroup(id);
    return group ? group.name : id;
  }, [getAccountGroup]);

  const getTransferPurpose = useCallback((code: string) => {
    return transferPurposes.find((purpose) => purpose.code === code);
  }, [transferPurposes]);

  const getTransferPurposeLabel = useCallback((code: string) => {
    const purpose = getTransferPurpose(code);
    return purpose ? purpose.label : code;
  }, [getTransferPurpose]);

  const getCountry = useCallback((code: string) => {
    return countries.find((country) => country.code.toUpperCase() === code.toUpperCase());
  }, [countries]);

  const getCountryName = useCallback((code: string) => {
    const country = getCountry(code);
    return country ? `${country.flag} ${country.name}` : code;
  }, [getCountry]);

  const contextValue = useMemo(() => ({
    accountGroups,
    transferPurposes,
    countries,
    isLoading,
    error,
    getAccountGroup,
    getAccountGroupLabel,
    getTransferPurpose,
    getTransferPurposeLabel,
    getCountry,
    getCountryName,
    refresh: loadReferenceData,
  }), [
    accountGroups,
    transferPurposes,
    countries,
    isLoading,
    error,
    getAccountGroup,
    getAccountGroupLabel,
    getTransferPurpose,
    getTransferPurposeLabel,
    getCountry,
    getCountryName,
    loadReferenceData,
  ]);

  return (
    <ReferenceDataContext.Provider value={contextValue}>
      {children}
    </ReferenceDataContext.Provider>
  );
};

export const useReferenceData = (): ReferenceDataContextType => {
  const context = useContext(ReferenceDataContext);
  if (context === undefined) {
    throw new Error('useReferenceData must be used within a ReferenceDataCacheProvider');
  }
  return context;
};