import React, { useContext, useState, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { CryptoAsset, NFTAsset, EIP6963ProviderDetail } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';

/* ---------- Types ---------- */

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'neutral';
  message: string;
  confidence: number;
  timestamp: string;
}

interface MarketSentiment {
  bullish: number;
  bearish: number;
  neutral: number;
  trend: 'up' | 'down' | 'stable';
}

interface AIChatMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
  timestamp: Date;
}

/* ---------- Small Components ---------- */

const AIStatusBadge: React.FC<{ status: 'active' | 'learning' | 'processing' }> = ({ status }) => {
  const colors = {
    active: 'bg-green-500',
    learning: 'bg-blue-500',
    processing: 'bg-purple-500'
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-900/80 px-3 py-1 rounded-full border border-gray-700">
      <span className={`w-2 h-2 rounded-full animate-pulse ${colors[status]}`} />
      <span className="text-xs font-mono text-gray-300 uppercase">
        Neural Net: {status}
      </span>
    </div>
  );
};

const ConfidenceMeter: React.FC<{ score: number }> = ({ score }) => (
  <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
    <div
      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-1.5 rounded-full"
      style={{ width: `${score}%` }}
    />
  </div>
);

/* ---------- Main Component ---------- */

const CryptoView: React.FC = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('CryptoView must be within DataProvider');

  /* âœ… SAFE DEFAULTS (THIS FIXES THE CRASH) */
  const {
    cryptoAssets = [],
    nftAssets = [],
    walletInfo,
    virtualCard,
    connectWallet,
    disconnectWallet,
    detectedProviders = [],
    issueCard,
    buyCrypto
  } = context;

  const [activeTab, setActiveTab] = useState<'dashboard' | 'intelligence' | 'nft-valuation' | 'defi-bridge'>('dashboard');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isStripeModalOpen, setStripeModalOpen] = useState(false);
  const [buyAmount, setBuyAmount] = useState('1000');

  /* ---------- Derived Data ---------- */

  const portfolioAnalytics = useMemo(() => {
    const totalValue = cryptoAssets.reduce(
      (acc: number, asset: CryptoAsset) => acc + asset.value,
      0
    );

    return {
      totalValue,
      riskScore: Math.min(100, Math.max(0, 100 - totalValue / 1000)),
      diversificationIndex: cryptoAssets.length * 12.5,
      projectedYield: totalValue * 0.052,
      aiConfidence: 80 + (cryptoAssets.length % 15)
    };
  }, [cryptoAssets]);

  const marketSentiment: MarketSentiment = {
    bullish: 65,
    bearish: 25,
    neutral: 10,
    trend: 'up'
  };

  /* ---------- Render ---------- */

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">

      {/* ---------- HEADER ---------- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">NEXUS OS</h1>
        {walletInfo ? (
          <button onClick={disconnectWallet} className="text-red-400">
            Disconnect
          </button>
        ) : (
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="bg-cyan-600 px-4 py-2 rounded"
          >
            Connect Wallet
          </button>
        )}
      </div>

      {/* ---------- DASHBOARD ---------- */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-12 gap-6">

          <div className="col-span-8 space-y-6">

            <div className="grid grid-cols-3 gap-4">
              <Card title="Total Net Worth">
                <h3 className="text-3xl font-bold">
                  ${portfolioAnalytics.totalValue.toLocaleString()}
                </h3>
              </Card>

              <Card title="AI Risk Score">
                <h3 className="text-3xl font-bold">
                  {portfolioAnalytics.riskScore.toFixed(0)}/100
                </h3>
                <ConfidenceMeter score={portfolioAnalytics.riskScore} />
              </Card>

              <Card title="Projected Yield">
                <h3 className="text-3xl font-bold">
                  ${portfolioAnalytics.projectedYield.toFixed(2)}
                </h3>
              </Card>
            </div>

            {/* âœ… FIXED RECHARTS HEIGHT */}
            <Card title="Asset Allocation">
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={cryptoAssets}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                    >
                      {cryptoAssets.map((a, i) => (
                        <Cell key={i} fill={a.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

          </div>

          <div className="col-span-4 space-y-6">
            <Card title="Market Sentiment">
              <p className="text-green-400">
                Bullish: {marketSentiment.bullish}%
              </p>
              <p className="text-red-400">
                Bearish: {marketSentiment.bearish}%
              </p>
            </Card>
          </div>

        </div>
      )}
    </div>
  );
};

export default CryptoView;