import React from 'react';
import { useQuery } from 'react-query'; // Standardized state management (Instruction 2)

// --- REFACTOR RATIONALE ---
// 1. ELIMINATED FLAWED COMPONENT: The original content was a massive, insecure form designed
//    to accept and submit 200+ sensitive API keys directly from the frontend, violating core
//    security principles (Instruction 1). This entire pattern is removed.
// 2. MVP FOCUS: The component is now refactored to align with the chosen MVP scope (Financial
//    Dashboard/Treasury Automation). As its name is CryptoView, it now displays aggregated
//    cryptocurrency balances relevant for treasury management.
// 3. SECURITY REPLACEMENT: API key management is assumed to be handled securely on the
//    backend via AWS Secrets Manager or Vault (Instruction 3). Frontend components only fetch
//    data via secure, authenticated endpoints using a standardized query library.
// 4. STYLE UNIFICATION: Switched to standard component structure using presumed Tailwind CSS classes.
// ----------------------------

// Mock Data Types (should be generated from backend schema validation, Instruction 4)
interface CryptoAsset {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  change24h: number;
  source: string; // e.g., 'Binance', 'Coinbase'
}

/**
 * Mock function to simulate fetching aggregated crypto treasury data.
 * In a production system, this would call a secure, unified backend service.
 */
const mockFetchCryptoData = async (): Promise<CryptoAsset[]> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800)); 
  
  // Placeholder data relevant to a business treasury system
  return [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      balance: 1.503,
      usdValue: 98120.45,
      change24h: 3.45,
      source: 'Coinbase Custody',
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: 15.2,
      usdValue: 56780.00,
      change24h: -1.12,
      source: 'Binance Treasury',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 250000.00,
      usdValue: 250000.00,
      change24h: 0.00,
      source: 'Off-Chain Ledger',
    },
  ];
};

const CryptoView: React.FC = () => {
  // Use React Query for robust asynchronous state handling (Instruction 2)
  const { data: assets, isLoading, isError, error } = useQuery<CryptoAsset[], Error>(
    'cryptoTreasuryData',
    mockFetchCryptoData,
    {
      staleTime: 60000, // Data considered fresh for 1 minute
      retry: 3,        // Retry failed queries
    }
  );

  if (isLoading) {
    return (
      <div className="p-8 bg-white shadow-xl rounded-lg h-96 flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl text-gray-600">Loading Crypto Treasury Data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold">Error Loading Crypto Data</h2>
        <p>Could not fetch assets: {error?.message}. Please check API connector health.</p>
        <p className="text-sm mt-2">Data acquisition failure indicates an issue with the secure backend API integration framework (Instruction 4).</p>
      </div>
    );
  }

  const totalValue = assets?.reduce((sum, asset) => sum + asset.usdValue, 0) || 0;

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Crypto Treasury Overview</h1>
      <p className="text-gray-500 mb-6">Real-time aggregated balances sourced securely from exchanges and custody partners.</p>

      <div className="bg-white p-6 shadow-xl rounded-lg mb-6 border-l-4 border-indigo-500">
        <p className="text-sm font-medium text-gray-500">Total Crypto Treasury Value (USD)</p>
        <p className="text-4xl font-extrabold text-indigo-600 mt-1">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>

      <div className="overflow-x-auto bg-white shadow-xl rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">USD Value</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">24h Change</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Source/Custodian</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assets?.map((asset) => (
              <tr key={asset.symbol} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {asset.symbol} <span className="text-xs text-gray-500 ml-1">({asset.name})</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {asset.balance.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold text-right">
                  ${asset.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    asset.change24h >= 0 
                      ? (asset.change24h === 0 ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-800')
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {asset.change24h > 0 ? '↑' : asset.change24h < 0 ? '↓' : ''} {Math.abs(asset.change24h).toFixed(2)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                  {asset.source}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <p className="mt-8 text-sm text-gray-400">
        Data refreshed every minute via the standardized API connector framework.
      </p>
    </div>
  );
};

export default CryptoView;