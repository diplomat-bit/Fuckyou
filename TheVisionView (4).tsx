// components/views/platform/TheVisionView.tsx
import React from 'react';
import Card from '../../Card';

const TheVisionView: React.FC = () => (
    <div className="space-y-8 text-gray-300 max-w-4xl mx-auto animate-fade-in">
        <div className="text-center">
            <h1 className="text-5xl font-bold text-white tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500 pb-2">
                The Winning Vision
            </h1>
            <p className="mt-4 text-lg text-gray-400">This is not a bank. It is a financial co-pilot.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <Card variant="outline"><h3 className="text-xl font-semibold text-cyan-300">Hyper-Personalized</h3><p className="mt-2 text-sm">Every pixel, insight, and recommendation is tailored to your unique financial journey.</p></Card>
            <Card variant="outline"><h3 className="text-xl font-semibold text-cyan-300">Proactive & Predictive</h3><p className="mt-2 text-sm">We don't just show you the past; our AI anticipates your needs and guides your future.</p></Card>
            <Card variant="outline"><h3 className="text-xl font-semibold text-cyan-300">Platform for Growth</h3><p className="mt-2 text-sm">A suite of tools for creators, founders, and businesses to build their visions upon.</p></Card>
        </div>

        <div>
            <h2 className="text-3xl font-semibold text-white mb-4">Core Tenets</h2>
            <ul className="space-y-4">
                <li className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/60">
                    <strong className="text-cyan-400">The AI is a Partner, Not Just a Tool:</strong> Our integration with Google's Gemini API is designed for collaboration. From co-creating your bank card's design to generating a business plan, the AI is a creative and strategic partner.
                </li>
                <li className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/60">
                    <strong className="text-cyan-400">Seamless Integration is Reality:</strong> We demonstrate enterprise-grade readiness with high-fidelity simulations of Plaid, Stripe, Marqeta, and Modern Treasury. This isn't a concept; it's a blueprint for a fully operational financial ecosystem.
                </li>
                <li className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/60">
                    <strong className="text-cyan-400">Finance is a Gateway, Not a Gatekeeper:</strong> Features like the Quantum Weaver Incubator and the AI Ad Studio are designed to empower creation. We provide not just the capital, but the tools to build, market, and grow.
                </li>
                <li className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/60">
                    <strong className="text-cyan-400">The Future is Multi-Rail:</strong> Our platform is fluent in both traditional finance (ISO 20022) and the decentralized future (Web3). The Crypto & Corporate hubs are designed to manage value, no matter how it's represented.
                </li>
            </ul>
        </div>
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
            }
        `}</style>
    </div>
);

export default TheVisionView;
