import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  CreditCard, ShieldCheck, Zap, RefreshCw, Settings, 
  Save, Plus, Trash2, Search, Filter, ChevronRight, 
  AlertTriangle, CheckCircle2, FileText, Cpu, Layers,
  Terminal, Sparkles, Lock, Globe, ArrowRight, ExternalLink
} from 'lucide-react';
import { callGemini } from '../services/geminiService';
import Card from './Card';

interface BuyerTemplate {
  id: string;
  name: string;
  proxyConfig: { host: string; port: number; auth: boolean };
  billingProfile: { currency: string; cycle: string; limit: number };
  paymentControls: { maxTransaction: number; velocityLimit: number; allowedMccs: string[] };
  approvalWorkflow: { autoApprove: boolean; threshold: number; approverEmail: string };
}

export const VisaBuyerManager: React.FC = () => {
  const [templates, setTemplates] = useState<BuyerTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<BuyerTemplate | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleOptimizeWithGemini = async (template: BuyerTemplate) => {
    setIsOptimizing(true);
    try {
      const prompt = `Optimize this Visa Buyer Template for maximum efficiency and security: ${JSON.stringify(template)}`;
      const response = await callGemini(prompt);
      setStatusMessage("Template optimized by Gemini AI.");
      console.log("Optimization result:", response);
    } catch (error) {
      setStatusMessage("Failed to optimize template.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const addTemplate = () => {
    const newTemplate: BuyerTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Buyer Template",
      proxyConfig: { host: "proxy.visa.internal", port: 8080, auth: true },
      billingProfile: { currency: "USD", cycle: "MONTHLY", limit: 50000 },
      paymentControls: { maxTransaction: 10000, velocityLimit: 5, allowedMccs: ["5411", "5812"] },
      approvalWorkflow: { autoApprove: false, threshold: 5000, approverEmail: "admin@sovereign.com" }
    };
    setTemplates([...templates, newTemplate]);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-100">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="text-blue-500" /> Visa Buyer Manager
          </h1>
          <p className="text-slate-400">Configure VPA buyers, proxy settings, and automated payment workflows.</p>
        </div>
        <button 
          onClick={addTemplate}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
        >
          <Plus size={18} /> Create New Template
        </button>
      </div>

      {statusMessage && (
        <div className="bg-blue-900/30 border border-blue-500/50 p-3 rounded-lg text-blue-200 text-sm">
          {statusMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {templates.map(t => (
            <Card key={t.id} className={`cursor-pointer transition-all ${selectedTemplate?.id === t.id ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setSelectedTemplate(t)}>
              <div className="flex justify-between items-center">
                <span className="font-semibold">{t.name}</span>
                <ChevronRight size={16} />
              </div>
            </Card>
          ))}
        </div>

        {selectedTemplate && (
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Settings className="text-slate-500" /> Configuration: {selectedTemplate.name}
                </h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOptimizeWithGemini(selectedTemplate)}
                    disabled={isOptimizing}
                    className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded flex items-center gap-2 text-sm"
                  >
                    {isOptimizing ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                    Optimize with Gemini
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded flex items-center gap-2 text-sm">
                    <Save size={14} /> Save
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Proxy & Network</h3>
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                      <Globe size={16} className="text-blue-400" />
                      <span className="text-sm">{selectedTemplate.proxyConfig.host}:{selectedTemplate.proxyConfig.port}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Payment Controls</h3>
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldCheck size={16} className="text-green-400" />
                      <span className="text-sm">Limit: ${selectedTemplate.paymentControls.maxTransaction}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Approval Workflow</h3>
                <div className="flex items-center justify-between bg-slate-900 p-4 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-3">
                    <Lock size={16} className="text-amber-400" />
                    <span className="text-sm">Auto-Approve: {selectedTemplate.approvalWorkflow.autoApprove ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <span className="text-xs text-slate-500">{selectedTemplate.approvalWorkflow.approverEmail}</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisaBuyerManager;