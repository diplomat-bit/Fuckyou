import React, { useContext, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Card from './Card';
import { DataContext } from '../context/DataContext';

const COLORS = ['#06b6d4', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const InvestmentsPortfolio: React.FC = () => {
  const context = useContext(DataContext);
  if (!context) return null;
  // Mock data structure based on OpenAPI spec for /investments/portfolios/{portfolioId} GET response
  const mockPortfolioData = {
    id: 'portfolio_equity_growth',
    name: 'Aggressive Growth Portfolio',
    type: 'equities',
    currency: 'USD',
    totalValue: 250000,
    unrealizedGainLoss: 25000,
    todayGainLoss: 500,
    lastUpdated: '2024-07-22T10:00:00Z',
    riskTolerance: 'aggressive',
    aiPerformanceInsights: [
      {
        id: 'insight-market-outlook-001',
        title: 'Strong Tech Sector Performance',
        description: 'The AI predicts continued strong performance in the tech sector, which currently forms a significant portion of your portfolio.',
        category: 'investing',
        severity: 'low',
        timestamp: '2024-07-22T14:15:00Z',
      },
    ],
    holdings: [
      { symbol: 'AAPL', name: 'Apple Inc.', quantity: 100, averageCost: 150, currentPrice: 180, marketValue: 18000, percentageOfPortfolio: 7.2, esgScore: 8.5 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', quantity: 50, averageCost: 300, currentPrice: 320, marketValue: 16000, percentageOfPortfolio: 6.4, esgScore: 8.9 },
      // Adding more mock holdings to resemble the structure needed for Pie Chart data (name, value)
      { symbol: 'GOOGL', name: 'Alphabet Inc.', quantity: 30, averageCost: 120, currentPrice: 170, marketValue: 5100, percentageOfPortfolio: 2.04, esgScore: 8.0 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', quantity: 40, averageCost: 100, currentPrice: 185, marketValue: 7400, percentageOfPortfolio: 2.96, esgScore: 6.5 },
      { symbol: 'JPM', name: 'JPMorgan Chase & Co.', quantity: 200, averageCost: 140, currentPrice: 195, marketValue: 39000, percentageOfPortfolio: 15.6, esgScore: 7.2 },
      { symbol: 'VTI', name: 'Vanguard Total Stock Mkt ETF', quantity: 500, averageCost: 180, currentPrice: 220, marketValue: 110000, percentageOfPortfolio: 44.0, esgScore: 7.8 },
    ],
  };

  // Use mock data if context assets are empty or undefined, otherwise use context data
  const assets = useMemo(() => {
    if (context.assets && context.assets.length > 0) {
      return context.assets.map(a => ({
        ...a,
        value: a.value || 0, // Ensure value exists for calculation
        name: a.name || a.symbol || 'Unknown Asset',
      }));
    }
    // Map mock data to fit the expected structure (name, value, color)
    return mockPortfolioData.holdings.map((holding, index) => ({
      id: holding.symbol,
      name: holding.name,
      value: holding.marketValue,
      assetClass: holding.symbol, // Using symbol as a placeholder for assetClass
      performanceYTD: Math.floor(Math.random() * 20) - 5, // Mock YTD performance
      color: COLORS[index % COLORS.length],
    }));
  }, [context.assets]);

  const totalValueCalculated = useMemo(() => assets.reduce((sum, a) => sum + a.value, 0), [assets]);

  // Mock Beta and Sharpe Ratio based on the structure in the original component's return
  const beta = 1.12;
  const sharpe = 2.45;

  return (
    <Card title="Institutional Portfolio" subtitle="Asset classification and risk vectors" className="p-2">
      <div className="space-y-4">
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={assets}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {assets.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', fontSize: '9px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ fontSize: '9px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-1">
          <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-1">Ledger</h4>
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar pr-2 space-y-1">
            {assets.map((asset, i) => (
              <div key={asset.id} className="flex items-center justify-between group cursor-pointer py-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full" style={{ backgroundColor: asset.color || COLORS[i % COLORS.length] }}></div>
                  <div>
                    <p className="text-[11px] font-bold text-white group-hover:text-cyan-400 transition-colors">{asset.name}</p>
                    <p className="text-[8px] text-gray-600 font-mono uppercase">{asset.assetClass}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-mono font-bold text-white">${asset.value.toLocaleString()}</p>
                  <p className={`text-[8px] font-bold ${asset.performanceYTD && asset.performanceYTD >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {asset.performanceYTD && asset.performanceYTD >= 0 ? '+' : ''}{asset.performanceYTD}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-800">
           <div className="flex justify-between items-end">
              <div>
                <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest leading-none">Beta</p>
                <p className="text-sm font-mono font-bold text-white">{beta.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest leading-none">Sharpe</p>
                <p className="text-sm font-mono font-bold text-indigo-400">{sharpe.toFixed(2)}</p>
              </div>
           </div>
        </div>
      </div>
    </Card>
  );
};

export default InvestmentsPortfolio;