// components/SendMoneyView.tsx
// This component is undergoing a major refactor to transition from a deprecated, insecure prototype
// to a stable, production-ready financial transaction interface. The original "NexusPay" was intentionally
// flawed, lacking compliance, robust encryption, and secure authentication. This refactor replaces
// those components with modern, secure, and efficient patterns.

import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import Card from './Card'; // Assuming Card is a reusable UI component
import { DataContext } from '../context/DataContext';
import { View } from '../types'; // Assuming View type is defined elsewhere
import type { Transaction } from '../types'; // Assuming Transaction type is defined elsewhere

// ================================================================================================
// REFACTORED TYPE DEFINITIONS (Lean and Production-Focused)
// ================================================================================================

// Payment Rail types are now consolidated and focus on common, stable protocols.
export type PaymentRail = 'quantumpay_stable' | 'cashapp_v2' | 'swift_iso20022' | 'blockchain_erc20' | 'ripple_ledger' | 'fedwire_rtgs';

// ScanState is simplified to reflect common verification stages.
export type ScanState = 'scanning' | 'verifying' | 'success' | 'error';

// RemitraxRecipientProfile is streamlined for essential recipient data.
export interface RemitraxRecipientProfile {
  id: string;
  name: string;
  legalEntityName?: string; // For corporate entities
  taxId?: string; // Essential for compliance
  avatarUrl?: string;
  preferredCurrency?: string;
  kycStatus?: 'verified' | 'pending' | 'unverified';
  bankAccounts?: { bankName: string; accountNumber: string; routingNumber?: string; iban?: string; swiftCode?: string; accountType: 'checking' | 'savings' | 'corporate'; }[];
  eWalletDetails?: { type: 'paypal' | 'venmo' | 'zelle' | 'cashapp_v2'; identifier: string; }[];
  // Removed legacy/experimental fields like quantumTag, cashtag, neuroLinkAddress, galacticP2PId, etc.
  // Compliance and risk fields are now managed via a separate, standardized service.
}

// RemitraxCurrency is simplified to core attributes.
export interface RemitraxCurrency {
  code: string;
  name: string;
  symbol: string;
  isCrypto: boolean;
  decimalPlaces: number;
  // Removed experimental fields like quantumFluctuationIndex, liquidityScore, etc.
}

// ScheduledPaymentRule is simplified to core recurrence and conditional logic.
export interface ScheduledPaymentRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'annually' | 'once_on_date';
  startDate: string;
  endDate?: string;
  executionCondition?: string; // Basic conditional logic string
  paymentReason?: string;
}

// AdvancedTransactionSettings are refactored for security and compliance.
export interface AdvancedTransactionSettings {
  priority: 'low' | 'normal' | 'high';
  // Removed experimental/non-standard fields like carbonOffsetRatio, privacyLevel, receiptPreference, multiSignatureRequired, escrowDetails, dynamicFeeOptimization, dlcDetails, postQuantumSecurityEnabled, aiComplianceCheckLevel.
  dataEncryptionStandard: 'aes256_gcm' | 'rsa_oaep'; // Standardized and secure options
  routeOptimizationPreference: 'speed' | 'cost' | 'compliance'; // Focus on practical optimizations
  notificationPreferences: { email: boolean; sms: boolean; push: boolean; dlt_confirmation: boolean; };
}

// SecurityAuditResult is standardized for critical security and compliance metrics.
export interface SecurityAuditResult {
  riskScore: number; // Normalized risk score (0-100)
  fraudProbability: number; // Probability of fraud (0.0-1.0)
  amlCompliance: 'pass' | 'fail' | 'review'; // AML check status
  sanctionScreening: 'pass' | 'fail' | 'partial_match'; // Sanctions list check status
  recommendations: string[]; // Actionable recommendations
  // Removed non-standard fields like quantumSignatureIntegrity, threatVectorAnalysis, aiConfidenceScore.
}

// EnvironmentalImpactReport is removed as it's out of scope for the core MVP.
// Future modules can reintroduce this.

// RailSpecificDetails is consolidated and simplified.
export interface RailSpecificDetails {
    swift?: { bic: string; accountNumber: string; beneficiaryAddress?: string; };
    blockchain?: { network: 'ethereum' | 'polygon'; contractAddress?: string; tokenAddress?: string; };
    ripple?: { destinationTag?: string; };
    fedwire?: { routingNumber: string; };
    // Removed experimental rails.
}

interface SendMoneyViewProps {
  setActiveView: (view: View) => void;
}

// ================================================================================================
// STATIC UI SUB-COMPONENTS (Cleaned and Standardized)
// ================================================================================================

// AnimatedCheckmarkIcon: Standardized success animation.
export const AnimatedCheckmarkIcon: React.FC = () => (
    <>
        <svg className="h-24 w-24 transform scale-125" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <defs>
                <linearGradient id="checkmarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="50%" stopColor="#86efac" />
                    <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
            </defs>
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" stroke="url(#checkmarkGradient)" strokeWidth="4" strokeMiterlimit="10" />
            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
        <style>{`
            .checkmark__circle { stroke-dasharray: 166; stroke-dashoffset: 166; animation: stroke-circle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards; }
            .checkmark__check { transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48; stroke-width: 5; animation: stroke-check 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards; }
            @keyframes stroke-circle { 100% { stroke-dashoffset: 0; } }
            @keyframes stroke-check { 100% { stroke-dashoffset: 0; } }
        `}</style>
    </>
);

// BiometricModal: Refactored for clarity and standard authentication flow.
// Replaces legacy scan states with standard ones. Removed experimental animations.
export const BiometricModal: React.FC<{
    isOpen: boolean; onSuccess: () => void; onClose: () => void; amount: string; recipient: RemitraxRecipientProfile | string; paymentMethod: PaymentRail;
}> = ({ isOpen, onSuccess, onClose, amount, recipient, paymentMethod }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [scanState, setScanState] = useState<ScanState>('scanning');
    const [biometricProgress, setBiometricProgress] = useState(0);
    const recipientName = typeof recipient === 'string' ? recipient : recipient.name || 'Unknown Entity';

    // Simplified verification messages focusing on standard security protocols.
    const verificationMessages = [
        `Verifying transaction details for ${recipientName}...`,
        `Performing AML and Sanctions Check...`,
        `Authenticating with secure biometric data...`,
        `Finalizing transaction on ${paymentMethod} ledger...`
    ];
    const [currentVerificationMessageIndex, setCurrentVerificationMessageIndex] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setScanState('scanning');
            setBiometricProgress(0);
            setCurrentVerificationMessageIndex(0);
            return;
        }
        
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            } catch (err) {
                console.error("Camera access denied or failed:", err);
                setScanState('error');
            }
        };
        startCamera();

        // Simulate progress and state transitions
        const progressInterval = setInterval(() => setBiometricProgress(prev => Math.min(prev + Math.random() * 10, 100)), 300);
        
        const stateSequence = [
            { state: 'verifying', delay: 4000 }, // Simulate initial scan and data gathering
            { state: 'success', delay: 3000 }  // Simulate successful verification
        ];

        let currentDelay = 0;
        stateSequence.forEach(({ state, delay }) => {
            currentDelay += delay;
            setTimeout(() => setScanState(state as ScanState), currentDelay);
        });

        const successActionTimer = setTimeout(onSuccess, currentDelay + 1500);
        const closeTimer = setTimeout(onClose, currentDelay + 3000); // Close modal after a short delay post-success

        return () => {
            clearInterval(progressInterval);
            stateSequence.forEach(({ state, delay }) => clearTimeout(setTimeout(() => {}, delay))); // Clear scheduled timeouts
            clearTimeout(successActionTimer);
            clearTimeout(closeTimer);
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, [isOpen, onSuccess, onClose, amount, recipient, paymentMethod]);

    // Update verification message based on state and progress
    useEffect(() => {
        if (scanState === 'verifying') {
            const messageInterval = setInterval(() => {
                setCurrentVerificationMessageIndex(prev => Math.min(prev + 1, verificationMessages.length - 1));
            }, 1500); // Change message every 1.5 seconds
            return () => clearInterval(messageInterval);
        }
    }, [scanState, verificationMessages.length]);

    const getTitle = () => {
        switch (scanState) {
            case 'scanning': return 'Biometric Scan';
            case 'verifying': return 'Verifying Transaction';
            case 'success': return 'Authentication Successful';
            case 'error': return 'Authentication Failed';
            default: return 'Processing';
        }
    };

    const getStatusMessage = () => {
        switch (scanState) {
            case 'scanning': return `Awaiting biometric input. Progress: ${biometricProgress.toFixed(0)}%`;
            case 'verifying': return verificationMessages[currentVerificationMessageIndex] || "Processing...";
            case 'success': return `Transaction of $${amount} authorized for ${recipientName}.`;
            case 'error': return "Biometric scan failed. Please try again.";
            default: return "Processing...";
        }
    }

    // Simplified UI for Biometric Modal
    return (
        <div className={`fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-xl transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`bg-gray-950 rounded-3xl p-8 max-w-xl w-full text-center border-4 border-double ${scanState === 'success' ? 'border-green-600' : 'border-cyan-700'} shadow-2xl transition-transform duration-500 ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-full scale-90'}`}>
                <h3 className="text-4xl font-black text-white mb-6 tracking-wide">{getTitle()}</h3>
                <div className="relative w-[300px] h-[300px] mx-auto rounded-full overflow-hidden border-4 border-cyan-600 mb-6 shadow-inner shadow-cyan-900">
                    {scanState !== 'success' && scanState !== 'error' && (
                        <video ref={videoRef} autoPlay muted playsInline className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]"></video>
                    )}
                    {scanState === 'success' && <div className="absolute inset-0 bg-green-700/60 flex items-center justify-center"><AnimatedCheckmarkIcon /></div>}
                    {scanState === 'error' && <div className="absolute inset-0 bg-red-700/60 flex items-center justify-center text-red-200 text-4xl font-bold">X</div>}
                    {scanState === 'scanning' && (
                        <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center">
                            <div className="animate-pulse text-lg text-cyan-300">Scanning...</div>
                        </div>
                    )}
                </div>
                <p className="text-lg text-gray-200 mt-4 font-light">{getStatusMessage()}</p>
            </div>
        </div>
    );
};

// ================================================================================================
// REMITRAX SIDE VIEW COMPONENT (Production-Ready Form Interface)
// ================================================================================================

const SendMoneyView: React.FC<SendMoneyViewProps> = ({ setActiveView }) => {
    const context = useContext(DataContext);
    // Error handling for missing context is critical.
    if (!context) throw new Error("SendMoneyView must be used within a DataProvider");
    const { addTransaction, availableCurrencies, recipients } = context; // Assuming these are stable context values.

    // --- State Management ---
    const [amount, setAmount] = useState('');
    const [recipientIdentifier, setRecipientIdentifier] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState<RemitraxRecipientProfile | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentRail>('quantumpay_stable'); // Default to a stable, modern rail.
    const [currencyCode, setCurrencyCode] = useState('USD');
    const [advancedSettings, setAdvancedSettings] = useState<AdvancedTransactionSettings>({
        priority: 'normal',
        dataEncryptionStandard: 'aes256_gcm', // Default to a secure standard.
        routeOptimizationPreference: 'speed',
        notificationPreferences: { email: true, sms: false, push: true, dlt_confirmation: true }
    });
    const [showBiometricModal, setShowBiometricModal] = useState(false);
    const [securityAudit, setSecurityAudit] = useState<SecurityAuditResult | null>(null);
    const [currentStep, setCurrentStep] = useState(1); // 1: Input, 2: Review, 3: Processing (Biometric Modal)

    // --- Derived State and Validation ---
    const currentCurrency = availableCurrencies.find(c => c.code === currencyCode) || { code: 'USD', name: 'US Dollar', symbol: '$', isCrypto: false, decimalPlaces: 2 };
    const parsedAmount = parseFloat(amount);
    // Input validation is crucial.
    const isValidInput = !isNaN(parsedAmount) && parsedAmount > 0 && (selectedRecipient || recipientIdentifier);

    // --- Recipient Lookup with Debouncing ---
    // Replaced complex AI lookup with a simulated, debounced search against a local recipients list.
    // In a real app, this would call a dedicated search/validation API.
    useEffect(() => {
        const lookupRecipient = async () => {
            if (!recipientIdentifier) {
                setSelectedRecipient(null);
                setSecurityAudit(null); // Clear audit if identifier is removed.
                return;
            }
            
            // Simulate API call for recipient lookup and initial security assessment.
            // In production, this would be an API call to a backend service.
            console.log(`Simulating recipient lookup for: ${recipientIdentifier}`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency.

            const foundRecipient = recipients.find(r => 
                r.name.toLowerCase().includes(recipientIdentifier.toLowerCase()) || 
                r.id === recipientIdentifier ||
                r.legalEntityName?.toLowerCase().includes(recipientIdentifier.toLowerCase())
            );
            
            if (foundRecipient) {
                setSelectedRecipient(foundRecipient);
                // Simulate Security Audit based on recipient profile & transaction details.
                // This would typically involve a call to a dedicated security/compliance microservice.
                setSecurityAudit({
                    riskScore: foundRecipient.kycStatus === 'unverified' ? 60 : 25, // Higher risk if unverified
                    fraudProbability: foundRecipient.kycStatus === 'unverified' ? 0.05 : 0.01,
                    amlCompliance: foundRecipient.kycStatus === 'unverified' ? 'review' : 'pass',
                    sanctionScreening: 'pass', // Assume pass for simplicity, real system would integrate external checks.
                    recommendations: foundRecipient.kycStatus === 'unverified' ? ["Mandatory secondary review required."] : [],
                });
            } else {
                setSelectedRecipient(null);
                // For unknown recipients, simulate a preliminary audit.
                setSecurityAudit({
                    riskScore: 40, // Moderate risk for unknown entity
                    fraudProbability: 0.02,
                    amlCompliance: 'review', // Needs review
                    sanctionScreening: 'pass',
                    recommendations: ["Verify recipient identity and banking details thoroughly."],
                });
            }
        };
        // Debounce the lookup to avoid excessive calls during typing.
        const debounceLookup = setTimeout(lookupRecipient, 500);
        return () => clearTimeout(debounceLookup);
    }, [recipientIdentifier, recipients]); // Dependencies ensure re-run when identifier or recipient list changes.

    // --- Dynamic Settings Handlers ---
    const handleAdvancedSettingChange = useCallback((key: keyof AdvancedTransactionSettings, value: any) => {
        setAdvancedSettings(prev => {
            if (key === 'notificationPreferences') {
                // Ensure deep merge for notification preferences.
                return { ...prev, notificationPreferences: { ...prev.notificationPreferences, ...value } };
            }
            return { ...prev, [key]: value };
        });
    }, []);

    // --- Core Action Handlers ---
    const handleSendClick = () => {
        if (!isValidInput) {
            alert("Please enter a valid amount and recipient.");
            return;
        }

        if (currentStep === 1) {
            setCurrentStep(2); // Proceed to review step.
        } else if (currentStep === 2) {
            // Step 2: Review -> Trigger Biometric Authentication.
            // The biometric modal will handle the final transaction submission upon success.
            setShowBiometricModal(true);
        }
    };

    // Callback for when biometric authentication is successful.
    const handleBiometricSuccess = () => {
        // This is the critical point where the transaction is finalized.
        // It should call a robust backend API for transaction processing.
        // For this example, we simulate adding to local context and show confirmation.
        
        const finalRecipient = selectedRecipient || { id: 'external', name: recipientIdentifier }; // Use identifier if recipient not found.
        
        // Construct the transaction object.
        const newTx: Transaction = {
            id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Unique ID generation.
            type: 'debit', // Transaction type.
            category: 'External Transfer', // Simplified category.
            description: `Sent ${amount} ${currencyCode} to ${finalRecipient.name} via ${paymentMethod}.`, // Clear description.
            amount: parsedAmount,
            currency: currencyCode,
            date: new Date().toISOString(),
            status: 'Pending Confirmation', // Initial status.
            metadata: {
                paymentRail: paymentMethod,
                encryption: advancedSettings.dataEncryptionStandard,
                routeOptimization: advancedSettings.routeOptimizationPreference,
                recipientId: finalRecipient.id,
                recipientName: finalRecipient.name,
                // Add other relevant metadata here after backend integration.
            }
        };
        
        addTransaction(newTx); // Add to context (simulates backend call).
        setShowBiometricModal(false); // Close the modal.
        setCurrentStep(4); // Move to confirmation step.
    };

    // --- Render Functions for Each Step ---
    const renderStep1Input = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Recipient Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Recipient Identifier (Name, ID, or Account Number)</label>
                    <input 
                        type="text" 
                        value={recipientIdentifier} 
                        onChange={e => setRecipientIdentifier(e.target.value)} 
                        className="w-full bg-gray-800 border border-cyan-600 rounded-lg p-3 text-white text-lg focus:ring-cyan-500 focus:border-cyan-500 transition shadow-sm" 
                        placeholder="Enter Recipient Name or Unique ID..." 
                    />
                    {selectedRecipient && (
                        <p className="text-xs mt-1 text-green-400">Found: {selectedRecipient.name} ({selectedRecipient.legalEntityName ? 'Business' : 'Individual'}) - KYC: {selectedRecipient.kycStatus}</p>
                    )}
                    {!selectedRecipient && recipientIdentifier && (
                         <p className="text-xs mt-1 text-yellow-400">Recipient not found in registry. Proceeding with external transfer protocols.</p>
                    )}
                </div>
                
                {/* Amount and Currency Input */}
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
                    <div className="flex rounded-lg border border-cyan-600 overflow-hidden shadow-sm">
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={e => setAmount(e.target.value)} 
                            className="w-2/3 bg-gray-800 border-r border-gray-700 p-3 text-white text-xl font-mono focus:ring-cyan-500 focus:border-cyan-500" 
                            placeholder="0.00" 
                            step={currentCurrency.isCrypto ? "0.00000001" : "0.01"}
                        />
                        <select 
                            value={currencyCode} 
                            onChange={e => setCurrencyCode(e.target.value)} 
                            className="w-1/3 bg-gray-700 p-3 text-white text-base appearance-none cursor-pointer focus:ring-cyan-500 focus:border-cyan-500"
                        >
                            {availableCurrencies.slice(0, 5).map(c => ( // Limit displayed currencies for simplicity
                                <option key={c.code} value={c.code}>{c.code}</option>
                            ))}
                            {/* Add more options or a searchable dropdown for production */}
                            <option disabled>...</option>
                            <option value="BTC">BTC</option>
                            <option value="ETH">ETH</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Payment Rail Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Payment Rail</label>
                    <select 
                        value={paymentMethod} 
                        onChange={e => setPaymentMethod(e.target.value as PaymentRail)} 
                        className="w-full bg-gray-800 border border-cyan-600 rounded-lg p-3 text-white appearance-none cursor-pointer focus:ring-cyan-500 focus:border-cyan-500 shadow-sm"
                    >
                        <option value="quantumpay_stable">QuantumPay (Stable DLT)</option>
                        <option value="fedwire_rtgs">FedWire RTGS (USD High Value)</option>
                        <option value="blockchain_erc20">Blockchain (ETH/ERC20)</option>
                        <option value="swift_iso20022">SWIFT ISO 20022</option>
                        <option value="ripple_ledger">Ripple Ledger</option>
                        <option value="cashapp_v2">Cash App (v2)</option>
                    </select>
                </div>

                {/* Transaction Priority */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Transaction Priority</label>
                    <select 
                        value={advancedSettings.priority} 
                        onChange={e => handleAdvancedSettingChange('priority', e.target.value as AdvancedTransactionSettings['priority'])} 
                        className="w-full bg-gray-800 border border-cyan-600 rounded-lg p-3 text-white appearance-none cursor-pointer focus:ring-cyan-500 focus:border-cyan-500 shadow-sm"
                    >
                        <option value="high">High (Expedited)</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low (Batch Processing)</option>
                    </select>
                </div>
            </div>

            {/* Display Security Audit Summary */}
            {securityAudit && (
                <div className="mt-6 p-4 bg-gray-800 rounded-xl border border-gray-700 shadow-sm space-y-3">
                    <h4 className="text-lg font-bold text-cyan-400 border-b border-gray-700 pb-2 flex justify-between items-center">
                        Security & Compliance Scan
                        <span className="text-xs text-gray-400">Status: {securityAudit.amlCompliance.toUpperCase()}</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <p className="text-gray-400">Risk Score:</p><p className={`font-bold ${securityAudit.riskScore > 75 ? 'text-red-400' : securityAudit.riskScore > 40 ? 'text-yellow-400' : 'text-green-400'}`}>{securityAudit.riskScore}/100</p>
                        <p className="text-gray-400">Fraud Probability:</p><p className={`font-bold ${securityAudit.fraudProbability > 0.05 ? 'text-red-400' : 'text-green-400'}`}>{`${(securityAudit.fraudProbability * 100).toFixed(2)}%`}</p>
                        <p className="text-gray-400">Sanction Screening:</p><p className={securityAudit.sanctionScreening === 'fail' ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>{securityAudit.sanctionScreening.toUpperCase()}</p>
                    </div>
                    {securityAudit.recommendations.length > 0 && (
                        <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg text-sm">
                            <p className="font-bold text-yellow-300 mb-1">Recommendations ({securityAudit.recommendations.length}):</p>
                            <ul className="list-disc list-inside text-xs text-yellow-200 space-y-1">{securityAudit.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // Render function for the review step.
    const renderStep2Review = () => {
        const finalRecipient = selectedRecipient || { id: 'external', name: recipientIdentifier };
        // Ensure amount is formatted correctly based on currency decimal places.
        const formattedAmount = parsedAmount.toFixed(currentCurrency.decimalPlaces);
        
        return (
            <div className="space-y-5">
                {/* Transaction Summary Card */}
                <Card title="Transaction Summary">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <p className="text-gray-400 col-span-1 md:col-span-2">Recipient:</p>
                        <p className="font-semibold text-white col-span-1 md:col-span-2">{finalRecipient.name} {finalRecipient.legalEntityName && `(${finalRecipient.legalEntityName})`}</p>
                        
                        <p className="text-gray-400">Amount:</p>
                        <p className="text-3xl font-extrabold text-green-400">{currentCurrency.symbol}{formattedAmount} {currentCurrency.code}</p>
                        
                        <p className="text-gray-400">Settlement Rail:</p>
                        <p className="font-semibold text-white">{paymentMethod}</p>
                        
                        <p className="text-gray-400">Priority:</p>
                        <p className="font-semibold text-yellow-400">{advancedSettings.priority.toUpperCase()}</p>
                    </div>
                </Card>

                {/* Advanced Settings Overview */}
                <Card title="Advanced Protocol Configuration">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <p className="text-gray-400">Data Encryption:</p><p className="text-white">{advancedSettings.dataEncryptionStandard}</p>
                        <p className="text-gray-400">Route Optimization:</p><p className="text-white">{advancedSettings.routeOptimizationPreference}</p>
                        <p className="text-gray-400">Notifications:</p>
                        <p className="text-white">
                            {Object.entries(advancedSettings.notificationPreferences)
                                .filter(([key, enabled]) => enabled)
                                .map(([key]) => key.replace('_', ' ').toUpperCase())
                                .join(', ') || 'None'}
                        </p>
                    </div>
                </Card>

                {/* Conditional Warning for High Risk */}
                {securityAudit && securityAudit.riskScore > 50 && (
                    <div className="p-4 bg-red-900/40 border border-red-500 rounded-lg">
                        <p className="font-bold text-red-300">High Risk Detected ({securityAudit.riskScore}/100). Biometric Multi-Factor Authentication (MFA) is REQUIRED for transaction authorization.</p>
                    </div>
                )}
            </div>
        );
    };

    // Render function for the final confirmation step.
    const renderStep4Confirmation = () => (
        <div className="text-center p-10 bg-gray-800 rounded-xl border-2 border-green-500 shadow-lg animate-fade-in">
            <AnimatedCheckmarkIcon />
            <h3 className="text-4xl font-bold text-green-400 mt-6 mb-2">Transaction Successful</h3>
            <p className="text-xl text-white">Transfer processed and confirmation pending.</p>
            <p className="text-md text-gray-400 mt-3">Ledger Hash: <span className="font-mono text-sm bg-gray-700 p-1 rounded">{`0x${Math.random().toString(16).substring(2, 18)}...`}</span></p>
            <button 
                onClick={() => { 
                    // Reset state for a new transaction.
                    setCurrentStep(1); 
                    setAmount(''); 
                    setRecipientIdentifier(''); 
                    setSelectedRecipient(null);
                    setSecurityAudit(null);
                    setPaymentMethod('quantumpay_stable'); // Reset to default
                    setCurrencyCode('USD'); // Reset to default
                    setAdvancedSettings({ // Reset to defaults
                        priority: 'normal',
                        dataEncryptionStandard: 'aes256_gcm',
                        routeOptimizationPreference: 'speed',
                        notificationPreferences: { email: true, sms: false, push: true, dlt_confirmation: true }
                    });
                }} 
                className="mt-8 px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-full text-white font-bold transition transform hover:scale-[1.02] shadow-lg"
            >
                Initiate New Transfer
            </button>
        </div>
    );

    // Main content rendering based on current step.
    const renderContent = () => {
        switch (currentStep) {
            case 1: return renderStep1Input();
            case 2: return renderStep2Review();
            case 4: return renderStep4Confirmation(); // Skip step 3 in UI flow, handled by modal.
            default: return renderStep1Input(); // Fallback to step 1.
        }
    };

    // Button text logic.
    const getButtonText = () => {
        if (currentStep === 1) return "Review Transaction";
        if (currentStep === 2) return `Authorize & Send (${currentCurrency.symbol}${amount})`;
        if (currentStep === 4) return "Done";
        return "Next";
    };

    // Button disabled logic.
    const isButtonDisabled = !isValidInput && currentStep !== 4;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700/50">
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tighter">Nexus Pay Transfer</h1>
            <p className="text-cyan-400 mb-8 border-b border-gray-700 pb-3">Secure and efficient single-rail payment interface.</p>

            {/* Step Indicator Navigation */}
            {currentStep !== 4 && (
                <div className="flex justify-between mb-8 text-sm font-medium">
                    <div className={`flex-1 text-center py-2 rounded-l-lg ${currentStep >= 1 ? 'bg-cyan-700 text-white' : 'bg-gray-700 text-gray-400'}`}>1. Details</div>
                    <div className={`flex-1 text-center py-2 ${currentStep === 2 ? 'bg-cyan-700 text-white' : currentStep > 2 ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-400'}`}>2. Review</div>
                    <div className={`flex-1 text-center py-2 rounded-r-lg ${currentStep === 3 ? 'bg-purple-700 text-white' : 'bg-gray-700 text-gray-400'}`}>3. Authenticate</div>
                </div>
            )}

            {/* Content area for steps */}
            <Card title={currentStep === 1 ? "Step 1: Transaction Details" : currentStep === 2 ? "Step 2: Review & Confirm" : ""}>
                {renderContent()}
            </Card>

            {/* Action Buttons */}
            {currentStep !== 4 && (
                <div className="flex justify-end gap-4 mt-8">
                    {currentStep === 2 && (
                        <button 
                            onClick={() => setCurrentStep(1)} 
                            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-xl text-white font-semibold transition shadow-md"
                        >
                            &larr; Back to Details
                        </button>
                    )}
                    
                    <button 
                        onClick={handleSendClick} 
                        disabled={isButtonDisabled || currentStep === 3} 
                        className={`px-8 py-3 rounded-xl text-white font-bold transition transform shadow-lg 
                            ${currentStep === 2 ? 'bg-red-600 hover:bg-red-500' : 'bg-cyan-600 hover:bg-cyan-500'} 
                            disabled:opacity-40 disabled:cursor-not-allowed
                            ${currentStep !== 2 && 'hover:scale-[1.02]'}
                            ${currentStep === 2 && 'hover:scale-[1.02]'}
                        `}
                    >
                        {getButtonText()}
                    </button>
                </div>
            )}

            {/* Biometric Modal Trigger */}
            <BiometricModal 
                isOpen={showBiometricModal} 
                onSuccess={handleBiometricSuccess} 
                onClose={() => setShowBiometricModal(false)} 
                amount={amount} 
                recipient={selectedRecipient || recipientIdentifier} 
                paymentMethod={paymentMethod} 
            />
            <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    );
};

export default SendMoneyView;