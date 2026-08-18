import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Globe, Zap, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';

interface CollectionFlowState {
  step: 'init' | 'kyc' | 'routing' | 'complete';
  status: 'idle' | 'processing' | 'success' | 'error';
}

export const SovereignAccountCollection: React.FC = () => {
  const [state, setState] = useState<CollectionFlowState>({ step: 'init', status: 'idle' });
  const [formData, setFormData] = useState({ country: 'US', entityName: '', taxId: '' });

  const initiateFlow = async () => {
    setState({ step: 'init', status: 'processing' });
    try {
      const response = await fetch('/api/account_collection_flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Citibank-AI-Auth': 'SOVEREIGN_PREMIUM_TOKEN' },
        body: JSON.stringify({ ...formData, timestamp: Date.now() })
      });
      if (!response.ok) throw new Error('Sovereign routing failed');
      setState({ step: 'kyc', status: 'idle' });
    } catch (e) {
      setState({ step: 'init', status: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans border border-zinc-800 rounded-2xl shadow-2xl shadow-black">
      <header className="mb-12 border-b border-zinc-800 pb-6">
        <h1 className="text-4xl font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
          Sovereign Account Collection
        </h1>
        <p className="text-zinc-500 mt-2">Citibank x Modern Treasury AI-Orchestrated Onboarding</p>
      </header>

      <AnimatePresence mode="wait">
        {state.step === 'init' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <input 
                placeholder="Entity Legal Name" 
                className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg w-full focus:border-amber-500 outline-none transition-all"
                onChange={(e) => setFormData({...formData, entityName: e.target.value})}
              />
              <select 
                className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg w-full"
                onChange={(e) => setFormData({...formData, country: e.target.value})}
              >
                <option value="US">United States</option>
                <option value="CH">Switzerland</option>
                <option value="SG">Singapore</option>
              </select>
            </div>
            <button 
              onClick={initiateFlow}
              className="flex items-center gap-2 bg-amber-500 text-black px-8 py-4 rounded-full font-bold hover:bg-amber-400 transition-all"
            >
              {state.status === 'processing' ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
              Initialize Sovereign Flow
            </button>
          </motion.div>
        )}

        {state.step === 'kyc' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-4 mb-6">
              <ShieldCheck className="text-emerald-500" size={32} />
              <div>
                <h2 className="text-xl font-semibold">AI-Driven KYC/AML Verification</h2>
                <p className="text-zinc-500">Analyzing global sanctions and entity risk profiles...</p>
              </div>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div className="h-full bg-emerald-500" animate={{ width: ['0%', '100%'] }} transition={{ duration: 3 }} />
            </div>
          </motion.div>
        )}

        {state.step === 'complete' && (
          <motion.div className="text-center py-20">
            <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold">Account Collection Secured</h2>
            <p className="text-zinc-400">Modern Treasury routing protocols active.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};