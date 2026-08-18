import React, { useState, useEffect, useCallback } from 'react';

interface QuantumPacket {
  id: string;
  payload: string;
  entanglementKey: string;
  timestamp: number;
}

const Pipeline15_QuantumBridge: React.FC = () => {
  const [status, setStatus] = useState<'IDLE' | 'ESTABLISHING' | 'SECURE' | 'ERROR'>('IDLE');
  const [bridgeLog, setBridgeLog] = useState<string[]>([]);

  const log = (message: string) => {
    setBridgeLog((prev) => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const establishQuantumLink = useCallback(async () => {
    setStatus('ESTABLISHING');
    log('Initiating QKD (Quantum Key Distribution) handshake...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const mockKey = Math.random().toString(36).substring(2, 15);
      log(`Quantum entanglement established. Key: ${mockKey.slice(0, 8)}...`);
      setStatus('SECURE');
    } catch (err) {
      log('Error: Decoherence detected in quantum channel.');
      setStatus('ERROR');
    }
  }, []);

  useEffect(() => {
    establishQuantumLink();
  }, [establishQuantumLink]);

  const transmitData = async (data: string) => {
    if (status !== 'SECURE') {
      log('Transmission aborted: Channel not secure.');
      return;
    }

    log(`Transmitting encrypted packet: ${data.substring(0, 10)}...`);
    // Simulate quantum-secured transfer
    await new Promise((resolve) => setTimeout(resolve, 800));
    log('Packet delivered via Quantum Bridge.');
  };

  return (
    <div className="p-6 bg-slate-900 text-cyan-400 rounded-lg border border-cyan-800 font-mono">
      <h2 className="text-xl font-bold mb-4">Pipeline 15: QuantumBridge</h2>
      <div className="mb-4">
        <span className="text-gray-400">Status: </span>
        <span className={`font-bold ${status === 'SECURE' ? 'text-green-400' : 'text-yellow-400'}`}>
          {status}
        </span>
      </div>
      
      <div className="bg-black p-4 rounded h-64 overflow-y-auto text-sm border border-gray-700">
        {bridgeLog.map((entry, i) => (
          <div key={i} className="mb-1">{entry}</div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button 
          onClick={() => transmitData('Q-DATA-STREAM-001')}
          disabled={status !== 'SECURE'}
          className="px-4 py-2 bg-cyan-900 hover:bg-cyan-700 disabled:opacity-50 rounded transition-colors"
        >
          Transmit Secure Packet
        </button>
        <button 
          onClick={establishQuantumLink}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
        >
          Re-calibrate Bridge
        </button>
      </div>
    </div>
  );
};

export default Pipeline15_QuantumBridge;