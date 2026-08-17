import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Palette, ShieldCheck, Zap, Layers, Download } from 'lucide-react';

interface CardConfig {
  brandColor: string;
  cardType: 'physical' | 'virtual';
  features: string[];
  holderName: string;
}

const BRAND_COLORS = [
  { name: 'Mastercard Red', value: '#EB001B' },
  { name: 'Midnight', value: '#1e293b' },
  { name: 'Royal Gold', value: '#D4AF37' },
  { name: 'Cyber Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
];

const AVAILABLE_FEATURES = [
  { id: 'contactless', label: 'Contactless Enabled', icon: Zap },
  { id: 'biometric', label: 'Biometric Auth', icon: ShieldCheck },
  { id: 'multi-currency', label: 'Multi-Currency', icon: Layers },
];

const CardCustomizationView: React.FC = () => {
  const [config, setConfig] = useState<CardConfig>({
    brandColor: '#EB001B',
    cardType: 'physical',
    features: ['contactless'],
    holderName: 'SOVEREIGN HOLDER',
  });

  const toggleFeature = (featureId: string) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-slate-100">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Card Customization Studio</h1>
        <p className="text-slate-400">Configure your Mastercard identity, branding, and security features.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Preview Section */}
        <div className="flex flex-col items-center justify-center bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
          <motion.div
            animate={{ backgroundColor: config.brandColor }}
            className="w-full max-w-sm aspect-[1.586/1] rounded-2xl shadow-2xl p-6 flex flex-col justify-between relative overflow-hidden transition-colors duration-500"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-8 bg-white/20 rounded-md backdrop-blur-sm" />
              <div className="text-white font-bold tracking-widest text-lg">MASTERCARD</div>
            </div>
            <div className="text-white font-mono text-xl tracking-widest">
              **** **** **** 4242
            </div>
            <div className="text-white font-medium uppercase tracking-wider">
              {config.holderName || 'CARD HOLDER'}
            </div>
          </motion.div>
          <div className="mt-8 text-sm text-slate-500">Live Preview: {config.cardType.toUpperCase()} CARD</div>
        </div>

        {/* Controls Section */}
        <div className="space-y-8">
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-emerald-400" /> Brand Identity
            </h3>
            <div className="flex gap-4">
              {BRAND_COLORS.map(color => (
                <button
                  key={color.value}
                  onClick={() => setConfig(prev => ({ ...prev, brandColor: color.value }))}
                  className={`w-10 h-10 rounded-full border-2 ${config.brandColor === color.value ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4">Card Format</h3>
            <div className="flex gap-4">
              {(['physical', 'virtual'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setConfig(prev => ({ ...prev, cardType: type }))}
                  className={`px-6 py-2 rounded-lg border ${config.cardType === type ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-800 border-slate-700'}`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4">Security & Features</h3>
            <div className="grid grid-cols-1 gap-3">
              {AVAILABLE_FEATURES.map(feature => {
                const Icon = feature.icon;
                const isSelected = config.features.includes(feature.id);
                return (
                  <button
                    key={feature.id}
                    onClick={() => toggleFeature(feature.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${isSelected ? 'bg-slate-800 border-emerald-500' : 'bg-slate-900 border-slate-800'}`}
                  >
                    <Icon className={isSelected ? 'text-emerald-400' : 'text-slate-500'} />
                    <span>{feature.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Download className="w-5 h-5" /> Provision Card Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardCustomizationView;