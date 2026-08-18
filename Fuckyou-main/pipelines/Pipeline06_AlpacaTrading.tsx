import React, { useState, useEffect, useCallback } from 'react';

interface AlpacaTradeConfig {
  apiKey: string;
  apiSecret: string;
  paperTrading: boolean;
  symbol: string;
  quantity: number;
}

interface TradeStatus {
  status: 'idle' | 'executing' | 'success' | 'error';
  message: string;
  lastOrderId?: string;
}

const Pipeline06_AlpacaTrading: React.FC = () => {
  const [config, setConfig] = useState<AlpacaTradeConfig>({
    apiKey: '',
    apiSecret: '',
    paperTrading: true,
    symbol: 'AAPL',
    quantity: 1,
  });

  const [status, setStatus] = useState<TradeStatus>({ status: 'idle', message: '' });

  const executeTrade = useCallback(async () => {
    setStatus({ status: 'executing', message: 'Connecting to Alpaca API...' });

    try {
      const baseUrl = config.paperTrading 
        ? 'https://paper-api.alpaca.markets/v2' 
        : 'https://api.alpaca.markets/v2';

      const response = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'APCA-API-KEY-ID': config.apiKey,
          'APCA-API-SECRET-KEY': config.apiSecret,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: config.symbol,
          qty: config.quantity,
          side: 'buy',
          type: 'market',
          time_in_force: 'gtc',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to execute trade');
      }

      setStatus({ 
        status: 'success', 
        message: `Order placed successfully: ${data.id}`,
        lastOrderId: data.id 
      });
    } catch (error: any) {
      setStatus({ status: 'error', message: error.message });
    }
  }, [config]);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">Alpaca Trading Pipeline</h2>
      
      <input
        type="text"
        placeholder="API Key"
        className="w-full p-2 border rounded"
        onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
      />
      
      <input
        type="password"
        placeholder="API Secret"
        className="w-full p-2 border rounded"
        onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
      />

      <div className="flex items-center space-x-2">
        <input 
          type="checkbox" 
          checked={config.paperTrading}
          onChange={(e) => setConfig({ ...config, paperTrading: e.target.checked })}
        />
        <span>Use Paper Trading</span>
      </div>

      <button
        onClick={executeTrade}
        disabled={status.status === 'executing'}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {status.status === 'executing' ? 'Executing...' : 'Execute Market Buy'}
      </button>

      {status.message && (
        <div className={`p-3 rounded ${status.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {status.message}
        </div>
      )}
    </div>
  );
};

export default Pipeline06_AlpacaTrading;