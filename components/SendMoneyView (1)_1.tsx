
import React, { useState, useContext, useEffect } from 'react';
import Card from './Card';
import { DataContext } from '../context/DataContext';
import { View, PaymentRail, Transaction } from '../types';
import { BiometricModal, SecurityAuditDisplay, SecurityAuditResult } from './payment-components';

const SendMoneyView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("SendMoneyView must be used within a DataProvider");
    const { addTransaction, setActiveView } = context;

    const [amount, setAmount] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentRail>('quantumpay');
    const [showBiometricModal, setShowBiometricModal] = useState(false);
    const [securityAudit, setSecurityAudit] = useState<SecurityAuditResult | null>(null);
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        const auditTimeout = setTimeout(() => {
            if (parseFloat(amount) > 0 && recipientName) {
                setSecurityAudit({
                    riskScore: parseFloat(amount) > 5000 ? 60 : 10,
                    fraudProbability: 0.01,
                    amlCompliance: 'pass',
                    sanctionScreening: 'pass',
                    quantumSignatureIntegrity: 'verified',
                    recommendations: parseFloat(amount) > 5000 ? ["High value transaction. AI monitoring active."] : [],
                    complianceAlerts: [],
                    threatVectorAnalysis: []
                });
            }
        }, 800);
        return () => clearTimeout(auditTimeout);
    }, [amount, recipientName]);

    const handleSendClick = () => {
        if (currentStep === 1) setCurrentStep(2);
        else if (currentStep === 2) setShowBiometricModal(true);
    };

    const handleSuccess = async () => {
        const newTx: Transaction = {
            id: `tx_${Date.now()}`,
            type: 'expense',
            category: 'Transfer',
            description: `Sent to ${recipientName} via ${paymentMethod}`,
            amount: parseFloat(amount),
            date: new Date().toISOString().split('T')[0],
            carbonFootprint: 0.5,
            aiCategoryConfidence: 1.0
        };
        await addTransaction(newTx);
        setShowBiometricModal(false);
        setActiveView(View.Dashboard);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Quantum Pay Portal</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title={currentStep === 1 ? "Initiate Transfer" : "Review Transaction"}>
                    <div className="space-y-6">
                        {currentStep === 1 ? (
                            <>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Recipient</label>
                                    <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 outline-none font-mono" placeholder="Name, @tag, or ID" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Amount (USD)</label>
                                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 outline-none font-mono" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Execution Rail</label>
                                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentRail)} className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 outline-none font-mono appearance-none">
                                        <option value="quantumpay">QuantumPay (Instant Settlement)</option>
                                        <option value="cashapp">Cash App</option>
                                        <option value="swift_global">SWIFT Global (L1)</option>
                                        <option value="blockchain_dlt">Blockchain DLT</option>
                                    </select>
                                </div>
                                <SecurityAuditDisplay auditResult={securityAudit} />
                            </>
                        ) : (
                            <div className="space-y-4 text-gray-100 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                                <div className="flex justify-between border-b border-gray-800 pb-2">
                                    <span className="text-gray-500 text-xs uppercase font-bold">Target</span>
                                    <span className="font-mono text-cyan-400">{recipientName}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-800 pb-2">
                                    <span className="text-gray-500 text-xs uppercase font-bold">Magnitude</span>
                                    <span className="font-mono text-2xl font-black">${parseFloat(amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-800 pb-2">
                                    <span className="text-gray-500 text-xs uppercase font-bold">Protocol</span>
                                    <span className="font-mono text-xs">{paymentMethod.toUpperCase()}</span>
                                </div>
                                <p className="text-[10px] text-yellow-500 font-mono animate-pulse">ESTIMATED_SETTLEMENT: INSTANT_QUANTUM</p>
                            </div>
                        )}
                        
                        <div className="flex justify-end gap-3 mt-8">
                             {currentStep === 2 && <button onClick={() => setCurrentStep(1)} className="px-6 py-3 bg-gray-800 rounded-xl text-white font-bold hover:bg-gray-700 transition-all">BACK</button>}
                             <button onClick={handleSendClick} disabled={!amount || !recipientName} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-black shadow-lg shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest">
                                {currentStep === 1 ? "Review Order" : "Initialize Flow"}
                             </button>
                        </div>
                    </div>
                </Card>

                <Card title="Network Diagnostics">
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-950 rounded-xl border border-gray-800">
                            <p className="text-[10px] text-gray-500 uppercase font-black mb-2">DLT Nodes Status</p>
                            <div className="grid grid-cols-4 gap-2">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-1 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 font-mono text-[10px] text-gray-500">
                            <p>&gt; Requesting path optimization...</p>
                            <p className="text-cyan-400">&gt; Found optimal rail: {paymentMethod}</p>
                            <p>&gt; Validating recipient biometric hash...</p>
                            <p className="text-green-400">&gt; Recipient verified on decentralized identity grid.</p>
                        </div>
                    </div>
                </Card>
            </div>
            <BiometricModal isOpen={showBiometricModal} onSuccess={handleSuccess} onClose={() => setShowBiometricModal(false)} amount={amount} recipient={recipientName} paymentMethod={paymentMethod} securityContext="personal" />
        </div>
    );
};

export default SendMoneyView;
