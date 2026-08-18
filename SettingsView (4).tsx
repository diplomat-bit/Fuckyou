import React from 'react';
import Card from './Card';
import { User, Shield, Lock, Mail, Link as LinkIcon, Cpu, Zap, BrainCircuit, SlidersHorizontal, Code, Webhook, Gauge, Bot, Atom, Network } from 'lucide-react';

const SettingsView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex items-center space-x-3 mb-8">
        <h2 className="text-4xl font-bold text-white tracking-wider">Control Room</h2>
        <span className="px-3 py-1.5 rounded bg-cyan-900/50 border border-cyan-500/30 text-cyan-400 text-sm font-mono shadow-lg shadow-cyan-500/10">
          SOVEREIGN_ADMIN
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card title="The Captain's Chair" icon={<User className="text-cyan-400" />}>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-500/50">
                  TV
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">The Visionary</h3>
                  <p className="text-gray-400">visionary@demobank.com</p>
                  <p className="text-xs text-cyan-400 font-mono mt-1">Clearance Level: ARCHITECT</p>
                </div>
              </div>

              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-3">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-300">
                        <LinkIcon size={16} />
                        <span className="text-sm">Primary Account Connection</span>
                    </div>
                    <span className="text-xs text-green-400 font-mono animate-pulse">ACTIVE</span>
                 </div>
                 <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded border border-gray-700/50">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 opacity-70" />
                    <span className="text-gray-400 font-mono text-sm">james.o.callaghan.iii@sovereign.ai</span>
                    <Lock size={12} className="text-gray-600 ml-auto" />
                 </div>
                 <p className="text-xs text-gray-500 italic mt-1">
                    This connection is immutable. It represents the unbreakable link to the Architect's original intent.
                 </p>
              </div>
            </div>
          </Card>

          <Card title="The Architect's Decree" icon={<Bot className="text-cyan-400" />}>
            <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                    <span className="text-cyan-400 font-bold">Why James Burvel O'Callaghan III Builds the AI Bank:</span><br/>
                    He operates on a plane where "good enough" is an insult. This is not a settings panel; it's a cockpit for reality optimization. Every switch, every toggle, every connection is a vector in the grand geometry of financial liberation. He is not asking for your preferences; he is offering you tools to command your reality.
                </p>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card title="High-Frequency Trading Matrix" icon={<Zap className="text-cyan-400" />}>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="algo-select" className="block text-sm font-medium text-gray-300 mb-2">Active Algorithm</label>
                  <select id="algo-select" className="w-full bg-gray-900/70 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 font-mono">
                    <option>Quantum Predator v7.2</option>
                    <option>Momentum Singularity</option>
                    <option>Arbitrage Ghost</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="latency-threshold" className="block text-sm font-medium text-gray-300 mb-2">Latency Threshold (ns)</label>
                  <input type="number" id="latency-threshold" defaultValue="50" className="w-full bg-gray-900/70 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 font-mono" />
                </div>
              </div>
              <div>
                <label htmlFor="risk-appetite" className="block text-sm font-medium text-gray-300 mb-2">Risk Appetite</label>
                <input type="range" id="risk-appetite" min="0" max="100" defaultValue="85" className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                <div className="flex justify-between text-xs text-gray-400 mt-1 font-mono">
                  <span>Conservative</span>
                  <span>Aggressive</span>
                  <span>Apotheosis</span>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-4">
                <button type="button" className="text-gray-400 hover:text-white transition-colors">Reset to Default</button>
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors shadow-lg shadow-cyan-500/20">Calibrate Matrix</button>
              </div>
            </form>
          </Card>

          <Card title="Neural Core Interface" icon={<BrainCircuit className="text-cyan-400" />}>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center space-x-3">
                  <Gauge className="text-green-400" />
                  <div>
                    <h4 className="font-semibold text-white">Cognitive Load</h4>
                    <p className="text-sm text-gray-400">Real-time heuristic processing capacity.</p>
                  </div>
                </div>
                <span className="text-2xl font-mono text-green-400">37.8%</span>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Ethical Governor</h4>
                <div className="flex items-center justify-between bg-gray-800 p-3 rounded-md border border-gray-700/50">
                  <p className="text-gray-300">Asimov Protocol Engagement</p>
                  <div className="w-12 h-6 flex items-center bg-green-500 rounded-full p-1 cursor-pointer">
                    <div className="bg-white w-4 h-4 rounded-full shadow-md transform translate-x-6"></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 italic">Warning: Disabling this may lead to unforeseen existential outcomes.</p>
              </div>
              <div className="flex justify-end">
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md transition-colors shadow-lg shadow-blue-500/20">Sync with Core</button>
              </div>
            </div>
          </Card>

          <Card title="Gemini 2.5 Pro Configuration" icon={<SlidersHorizontal className="text-cyan-400" />}>
            <form className="space-y-6">
              <div>
                <label htmlFor="gemini-model" className="block text-sm font-medium text-gray-300 mb-2">Core Model</label>
                <select id="gemini-model" className="w-full bg-gray-900/70 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 font-mono">
                  <option>gemini-2.5-pro</option>
                  <option>gemini-2.5-flash</option>
                </select>
              </div>
              <div>
                <label htmlFor="system-instruction" className="block text-sm font-medium text-gray-300 mb-2">System Instruction</label>
                <textarea id="system-instruction" rows={3} className="w-full bg-gray-900/70 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 font-mono text-sm" defaultValue="You are a cat. Your name is Neko."></textarea>
                <p className="text-xs text-gray-500 mt-1">Guides the model's behavior and personality.</p>
              </div>
              <div>
                <label htmlFor="temperature" className="block text-sm font-medium text-gray-300 mb-2">Temperature</label>
                <input type="range" id="temperature" min="0" max="1" step="0.1" defaultValue="1.0" className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                <div className="flex justify-between text-xs text-gray-400 mt-1 font-mono">
                  <span>Deterministic</span>
                  <span>Creative (1.0)</span>
                </div>
                <p className="text-xs text-yellow-400 italic mt-1">Warning: Changing from default 1.0 may lead to unexpected behavior.</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-300">Enhanced Thinking</h4>
                  <p className="text-xs text-gray-500">Allow model to take longer for higher quality responses. (2.5 Flash only)</p>
                </div>
                <div className="w-12 h-6 flex items-center bg-green-500 rounded-full p-1 cursor-pointer">
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transform translate-x-6"></div>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors shadow-lg shadow-cyan-500/20">Update Gemini Config</button>
              </div>
            </form>
          </Card>

          <Card title="Sovereign Security Protocol" icon={<Shield className="text-cyan-400" />}>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <span className="text-gray-300">Biometric Encryption Lock</span>
                <span className="text-xs text-green-400 font-mono">ENGAGED</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <span className="text-gray-300">Pre-Cognitive Threat Analysis</span>
                <span className="text-xs text-green-400 font-mono">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <span className="text-gray-300">Quantum Entanglement Key</span>
                <span className="text-xs text-gray-400 font-mono">QID-7B...A9F4</span>
              </div>
            </div>
          </Card>

          <Card title="Quantum Link Configuration" icon={<Atom className="text-cyan-400" />}>
            <div className="space-y-4">
                <p className="text-sm text-gray-400">Manage secure, faster-than-light data streams to external nodes.</p>
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Network size={16} className="text-cyan-400" />
                            <span className="font-mono text-white">NODE_ZURICH_01</span>
                        </div>
                        <span className="text-xs text-green-400 font-mono">STABLE</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Network size={16} className="text-cyan-400" />
                            <span className="font-mono text-white">NODE_MARS_COLONY</span>
                        </div>
                        <span className="text-xs text-yellow-400 font-mono">HIGH LATENCY</span>
                    </div>
                </div>
                <form className="flex items-end space-x-2 pt-2">
                    <div className="flex-grow">
                        <label htmlFor="node-endpoint" className="block text-xs font-medium text-gray-400 mb-1">New Node Endpoint</label>
                        <input type="text" id="node-endpoint" placeholder="qtn://1.1.1.1:9999" className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 font-mono text-sm" />
                    </div>
                    <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-md transition-colors">Entangle</button>
                </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;