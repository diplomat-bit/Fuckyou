

// --- CONSOLIDATED FROM: ./pipelines/Pipeline18_PortfolioRebalancing.tsx ---

import React, { useState, useEffect } from 'react';

interface Asset {
  id: string;
  symbol: string;
  currentAllocation: number;
  targetAllocation: number;
  currentValue: number;
}

interface RebalancingResult {
  assetId: string;
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  amount: number;
}

const Pipeline18_PortfolioRebalancing: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([
    { id: '1', symbol: 'AAPL', currentAllocation: 0.4, targetAllocation: 0.3, currentValue: 40000 },
    { id: '2', symbol: 'GOOGL', currentAllocation: 0.2, targetAllocation: 0.3, currentValue: 20000 },
    { id: '3', symbol: 'TSLA', currentAllocation: 0.4, targetAllocation: 0.4, currentValue: 40000 },
  ]);

  const [rebalancePlan, setRebalancePlan] = useState<RebalancingResult[]>([]);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(100000);

  const calculateRebalance = () => {
    const plan: RebalancingResult[] = assets.map((asset) => {
      const targetValue = totalPortfolioValue * asset.targetAllocation;
      const diff = targetValue - asset.currentValue;

      if (Math.abs(diff) < 100) {
        return { assetId: asset.id, symbol: asset.symbol, action: 'HOLD', amount: 0 };
      }

      return {
        assetId: asset.id,
        symbol: asset.symbol,
        action: diff > 0 ? 'BUY' : 'SELL',
        amount: Math.abs(diff),
      };
    });

    setRebalancePlan(plan);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Pipeline 18: Portfolio Rebalancing</h2>
      <div className="mb-4">
        <p>Total Portfolio Value: ${totalPortfolioValue.toLocaleString()}</p>
        <button 
          onClick={calculateRebalance}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Run Optimization
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Symbol</th>
            <th className="p-2 border">Action</th>
            <th className="p-2 border">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rebalancePlan.map((item) => (
            <tr key={item.assetId} className="text-center">
              <td className="p-2 border">{item.symbol}</td>
              <td className={`p-2 border font-bold ${
                item.action === 'BUY' ? 'text-green-600' : 
                item.action === 'SELL' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {item.action}
              </td>
              <td className="p-2 border">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Pipeline18_PortfolioRebalancing;