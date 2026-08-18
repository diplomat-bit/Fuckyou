import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  Lock, 
  Smartphone, 
  Mail, 
  Building2, 
  Hash, 
  User,
  RefreshCw
} from 'lucide-react';

// --- Types & Interfaces ---
interface PayeeData {
  name: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  email: string;
  phone: string;
}

type MfaMethod = 'sms' | 'email';

interface ConfirmationResponse {
  success: boolean;
  payeeId: string;
  confirmedAt: string;
  controlFlowId: string;
  referenceNumber: string;
}

type Step = 'details' | 'mfa-select' | 'mfa-verify' | 'success';

export default function PayeeCreationMfaFlow() {
  // --- State ---
  const [step, setStep] = useState<Step>('details');
  const [payeeData, setPayeeData] = useState<PayeeData>({
    name: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    email: '',
    phone: '',
  });
  
  const [selectedMfaMethod, setSelectedMfaMethod] = useState<MfaMethod>('sms');
  const [controlFlowId, setControlFlowId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState<string[]>(new Array(6).fill(''));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResponse | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // --- Cooldown Timer for OTP Resend ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // --- Form Validation Helpers ---
  const isPayeeDataValid = () => {
    const { name, accountNumber, routingNumber, bankName, email, phone } = payeeData;
    return (
      name.trim().length >= 3 &&
      accountNumber.trim().length >= 4 &&
      routingNumber.trim().length === 9 &&
      bankName.trim().length >= 2 &&
      (email.includes('@') || phone.trim().length >= 10)
    );
  };

  const isOtpComplete = () => {
    return otpCode.every(val => val !== '');
  };

  // --- API Simulation Handlers ---
  
  // Step 1 -> Step 2: Initiate Payee Addition & Generate Control Flow ID
  const handleInitiatePayee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPayeeDataValid()) {
      setError('Please fill in all fields correctly. Routing number must be 9 digits.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call to POST /api/v1/payees/initiate
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Generate a mock controlFlowId representing this specific MFA session
      const mockControlFlowId = `cf_id_${Math.random().toString(36).substring(2, 15)}`;
      setControlFlowId(mockControlFlowId);
      setStep('mfa-select');
    } catch (err) {
      setError('Failed to initiate payee creation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 -> Step 3: Trigger MFA Code dispatch
  const handleSendMfaCode = async () => {
    if (!controlFlowId) return;
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call to POST /api/v1/mfa/challenge
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setStep('mfa-verify');
      setResendCooldown(30); // 30 seconds cooldown
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3 -> Step 4: Confirm MFA & Finalize Payee Addition
  const handleVerifyAndConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpComplete() || !controlFlowId) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const enteredOtp = otpCode.join('');

    try {
      // Simulate API call to POST /api/v1/payees/confirmation
      // Payload: { controlFlowId, otpCode: enteredOtp, payeeData }
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate a simple OTP check (e.g., '123456' or just accept any valid 6 digits for demo)
          if (enteredOtp === '000000') {
            reject(new Error('Invalid verification code. Please try again.'));
          } else {
            resolve(true);
          }
        }, 2000);
      });

      const mockConfirmation: ConfirmationResponse = {
        success: true,
        payeeId: `pay_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        confirmedAt: new Date().toISOString(),
        controlFlowId: controlFlowId,
        referenceNumber: `REF-${Math.floor(10000000 + Math.random() * 90000000)}`
      };

      setConfirmationResult(mockConfirmation);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Helper Handlers ---
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otpCode];
    newOtp[index] = element.value;
    setOtpCode(newOtp);

    // Focus next input
    if (element.value !== '' && element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otpCode];
      if (otpCode[index] === '' && index > 0) {
        // Focus previous input and clear it
        newOtp[index - 1] = '';
        setOtpCode(newOtp);
        const prevSibling = (e.currentTarget.previousSibling as HTMLInputElement);
        if (prevSibling) prevSibling.focus();
      } else {
        newOtp[index] = '';
        setOtpCode(newOtp);
      }
    }
  };

  const resetFlow = () => {
    setStep('details');
    setPayeeData({
      name: '',
      accountNumber: '',
      routingNumber: '',
      bankName: '',
      email: '',
      phone: '',
    });
    setControlFlowId(null);
    setOtpCode(new Array(6).fill(''));
    setError(null);
    setConfirmationResult(null);
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300">
      
      {/* Header & Progress Stepper */}
      <div className="bg-slate-900 px-6 py-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Secure Payee Setup</h2>
              <p className="text-xs text-slate-400">Multi-Factor Authentication Protected</p>
            </div>
          </div>

          {/* Stepper Visual */}
          <div className="flex items-center justify-between mt-8 relative">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-800 -translate-y-1/2 z-0"></div>
            
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                step === 'details' 
                  ? 'bg-blue-500 text-white ring-4 ring-blue-500/30' 
                  : 'bg-emerald-500 text-white'
              }`}>
                {step !== 'details' ? '✓' : '1'}
              </div>
              <span className="text-[10px] mt-1.5 font-medium text-slate-400">Payee Info</span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                step === 'mfa-select' 
                  ? 'bg-blue-500 text-white ring-4 ring-blue-500/30' 
                  : step === 'mfa-verify' || step === 'success'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-500'
              }`}>
                {step === 'mfa-verify' || step === 'success' ? '✓' : '2'}
              </div>
              <span className="text-[10px] mt-1.5 font-medium text-slate-400">Verification</span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                step === 'success' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-800 text-slate-500'
              }`}>
                {step === 'success' ? '✓' : '3'}
              </div>
              <span className="text-[10px] mt-1.5 font-medium text-slate-400">Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 sm:p-8">
        
        {/* Error Alert Banner */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-800 text-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Security Alert:</span> {error}
            </div>
          </div>
        )}

        {/* STEP 1: Payee Details Form */}
        {step === 'details' && (
          <form onSubmit={handleInitiatePayee} className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900">Enter Payee Details</h3>
              <p className="text-sm text-slate-500">Provide the bank account details of the recipient you wish to add.</p>
            </div>

            <div className="space-y-4">
              {/* Payee Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Payee Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe Consulting"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={payeeData.name}
                    onChange={(e) => setPayeeData({ ...payeeData, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Bank Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Bank Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Building2 className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chase Bank"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={payeeData.bankName}
                    onChange={(e) => setPayeeData({ ...payeeData, bankName: e.target.value })}
                  />
                </div>
              </div>

              {/* Account & Routing Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Routing Number (9 Digits)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Hash className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      required
                      maxLength={9}
                      placeholder="123456789"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      value={payeeData.routingNumber}
                      onChange={(e) => setPayeeData({ ...payeeData, routingNumber: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Account Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Hash className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="000123456789"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      value={payeeData.accountNumber}
                      onChange={(e) => setPayeeData({ ...payeeData, accountNumber: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info for MFA */}
              <div className="border-t border-slate-100 pt-4 mt-2">
                <p className="text-xs font-medium text-slate-500 mb-3">Provide contact details to receive security verification codes.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Mail className="w-5 h-5" />
                      </span>
                      <input
                        type="email"
                        placeholder="name@domain.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={payeeData.email}
                        onChange={(e) => setPayeeData({ ...payeeData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Mobile Phone</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Smartphone className="w-5 h-5" />
                      </span>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={payeeData.phone}
                        onChange={(e) => setPayeeData({ ...payeeData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPayeeDataValid()}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Secure Request...
                </>
              ) : (
                <>
                  Continue to Verification
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: MFA Method Selection */}
        {step === 'mfa-select' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900">Select Verification Method</h3>
              <p className="text-sm text-slate-500">To protect your account, we need to verify your identity before adding this payee.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* SMS Option */}
              <button
                type="button"
                onClick={() => setSelectedMfaMethod('sms')}
                className={`p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
                  selectedMfaMethod === 'sms'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-3 rounded-lg ${selectedMfaMethod === 'sms' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Text Message (SMS)</div>
                  <div className="text-xs text-slate-500">Send code to {payeeData.phone || 'registered mobile number'}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMfaMethod === 'sms' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                }`}>
                  {selectedMfaMethod === 'sms' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>

              {/* Email Option */}
              <button
                type="button"
                onClick={() => setSelectedMfaMethod('email')}
                className={`p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
                  selectedMfaMethod === 'email'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-3 rounded-lg ${selectedMfaMethod === 'email' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Mail className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Email Verification</div>
                  <div className="text-xs text-slate-500">Send code to {payeeData.email || 'registered email address'}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMfaMethod === 'email' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                }`}>
                  {selectedMfaMethod === 'email' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            </div>

            {/* Control Flow ID Display (Simulated API State) */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Control Flow ID:</span>
              <span className="font-mono font-semibold text-slate-700">{controlFlowId}</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleSendMfaCode}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Send Code
                    <Lock className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: MFA Verification Code Entry */}
        {step === 'mfa-verify' && (
          <form onSubmit={handleVerifyAndConfirm} className="space-y-6 animate-fadeIn">
            <div className="space-y-1 text-center">
              <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Enter Verification Code</h3>
              <p className="text-sm text-slate-500">
                We sent a 6-digit code to your {selectedMfaMethod === 'sms' ? 'phone' : 'email'}.
              </p>
            </div>

            {/* OTP Input Grid */}
            <div className="flex justify-center gap-2 sm:gap-3 py-4">
              {otpCode.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  className="w-12 h-14 text-center text-xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900"
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>

            {/* Resend Code Action */}
            <div className="text-center">
              <button
                type="button"
                disabled={resendCooldown > 0 || isLoading}
                onClick={handleSendMfaCode}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-400 inline-flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification code'}
              </button>
            </div>

            {/* Control Flow ID Display */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Control Flow ID:</span>
              <span className="font-mono font-semibold text-slate-700">{controlFlowId}</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('mfa-select')}
                className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading || !isOtpComplete()}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Verify & Confirm
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Success Confirmation */}
        {step === 'success' && confirmationResult && (
          <div className="space-y-6 text-center animate-fadeIn">
            <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Payee Added Successfully</h3>
              <p className="text-sm text-slate-500">
                The payee has been verified and added to your secure recipient list.
              </p>
            </div>

            {/* Payee Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payee Details</span>
                <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">Verified</span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div>
                  <span className="text-slate-400 block text-xs">Name</span>
                  <span className="font-semibold text-slate-800">{payeeData.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Bank</span>
                  <span className="font-semibold text-slate-800">{payeeData.bankName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Account Number</span>
                  <span className="font-mono font-semibold text-slate-800">••••{payeeData.accountNumber.slice(-4)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Routing Number</span>
                  <span className="font-mono font-semibold text-slate-800">{payeeData.routingNumber}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Reference Number:</span>
                  <span className="font-mono font-semibold text-slate-700">{confirmationResult.referenceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Control Flow ID:</span>
                  <span className="font-mono font-semibold text-slate-700">{confirmationResult.controlFlowId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Confirmed At:</span>
                  <span>{new Date(confirmationResult.confirmedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={resetFlow}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              Add Another Payee
            </button>
          </div>
        )}

      </div>
    </div>
  );
}