import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Fingerprint, 
  Smartphone, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  RefreshCw, 
  X, 
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface MfaConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (mfaToken: string) => void;
  actionName?: string;
  errorContext?: string;
}

type MfaMethod = 'totp' | 'hardware' | 'biometric';
type FlowStatus = 'idle' | 'verifying' | 'success' | 'error';

export default function MfaConfirmationModal({
  isOpen,
  onClose,
  onSuccess,
  actionName = "secure transaction confirmation",
  errorContext
}: MfaConfirmationModalProps) {
  const [activeMethod, setActiveMethod] = useState<MfaMethod>('totp');
  const [status, setStatus] = useState<FlowStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // TOTP State
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [totpTimer, setTotpTimer] = useState<number>(30);
  const otpInputsRef = useRef<HTMLInputElement[]>([]);

  // Hardware Key State
  const [hardwareStep, setHardwareStep] = useState<'idle' | 'waiting' | 'scanning' | 'success' | 'error'>('idle');

  // Biometric State
  const [biometricStep, setBiometricStep] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');

  // Reset state when modal opens/closes or method changes
  useEffect(() => {
    if (isOpen) {
      resetFlow();
    }
  }, [isOpen, activeMethod]);

  // TOTP Countdown Timer
  useEffect(() => {
    if (!isOpen || activeMethod !== 'totp' || status === 'success') return;
    
    const interval = setInterval(() => {
      setTotpTimer((prev) => {
        if (prev <= 1) {
          // Simulate generating a new TOTP window
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, activeMethod, status]);

  const resetFlow = () => {
    setStatus('idle');
    setErrorMessage('');
    setOtp(new Array(6).fill(''));
    setHardwareStep('idle');
    setBiometricStep('idle');
    if (otpInputsRef.current[0]) {
      otpInputsRef.current[0].focus();
    }
  };

  // Handle OTP Input Changes
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/[^0-9]/g, '');
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input
    if (index < 5 && element.value) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-submit if all fields are filled
    if (newOtp.every(val => val !== '')) {
      triggerTotpVerification(newOtp.join(''));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (!otp[index] && index > 0) {
        // If current is empty, move back and clear previous
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpInputsRef.current[index - 1]?.focus();
      } else {
        // Clear current
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      triggerTotpVerification(pastedData);
    }
  };

  // Simulated Verification Handlers
  const triggerTotpVerification = async (code: string) => {
    setStatus('verifying');
    setErrorMessage('');
    
    // Simulate API call to /confirmation with MFA token
    setTimeout(() => {
      // Demo logic: "000000" triggers error, any other 6 digits succeeds
      if (code === '000000') {
        setStatus('error');
        setErrorMessage('Invalid verification code. Please check your authenticator app and try again.');
      } else {
        setStatus('success');
        setTimeout(() => {
          onSuccess('mfa_token_totp_verified_success');
        }, 1200);
      }
    }, 1500);
  };

  const triggerHardwareVerification = () => {
    setHardwareStep('waiting');
    setStatus('verifying');
    setErrorMessage('');

    // Simulate hardware key insertion and touch
    setTimeout(() => {
      setHardwareStep('scanning');
      setTimeout(() => {
        // Simulate success
        setHardwareStep('success');
        setStatus('success');
        setTimeout(() => {
          onSuccess('mfa_token_webauthn_verified_success');
        }, 1200);
      }, 2000);
    }, 1500);
  };

  const triggerBiometricVerification = () => {
    setBiometricStep('scanning');
    setStatus('verifying');
    setErrorMessage('');

    // Simulate FaceID/TouchID prompt
    setTimeout(() => {
      // 90% success rate simulation
      const isSuccess = Math.random() > 0.1;
      if (isSuccess) {
        setBiometricStep('success');
        setStatus('success');
        setTimeout(() => {
          onSuccess('mfa_token_biometric_verified_success');
        }, 1200);
      } else {
        setBiometricStep('error');
        setStatus('error');
        setErrorMessage('Biometric authentication failed. Please try again or use another method.');
      }
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md transition-opacity duration-300">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl transition-all duration-300 scale-100">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="h-6 w-6 animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-slate-100">Two-Factor Authentication</h3>
          <p className="mt-1.5 text-xs text-slate-400 px-4">
            To complete the <span className="text-indigo-400 font-medium">{actionName}</span>, please verify your identity using one of your registered MFA methods.
          </p>
          {errorContext && (
            <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-left text-xs text-amber-400 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorContext}</span>
            </div>
          )}
        </div>

        {/* Method Tabs */}
        {status !== 'success' && (
          <div className="mb-6 grid grid-cols-3 gap-1 rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setActiveMethod('totp')}
              disabled={status === 'verifying'}
              className={`flex flex-col items-center justify-center rounded-md py-2 text-xs font-medium transition-all ${
                activeMethod === 'totp'
                  ? 'bg-slate-800 text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 disabled:opacity-50'
              }`}
            >
              <Smartphone className="mb-1 h-4 w-4" />
              App Code
            </button>
            <button
              onClick={() => setActiveMethod('hardware')}
              disabled={status === 'verifying'}
              className={`flex flex-col items-center justify-center rounded-md py-2 text-xs font-medium transition-all ${
                activeMethod === 'hardware'
                  ? 'bg-slate-800 text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 disabled:opacity-50'
              }`}
            >
              <Cpu className="mb-1 h-4 w-4" />
              Security Key
            </button>
            <button
              onClick={() => setActiveMethod('biometric')}
              disabled={status === 'verifying'}
              className={`flex flex-col items-center justify-center rounded-md py-2 text-xs font-medium transition-all ${
                activeMethod === 'biometric'
                  ? 'bg-slate-800 text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 disabled:opacity-50'
              }`}
            >
              <Fingerprint className="mb-1 h-4 w-4" />
              Biometrics
            </button>
          </div>
        )}

        {/* Dynamic Content Area */}
        <div className="min-h-[200px] flex flex-col justify-between">
          
          {/* 1. TOTP Method */}
          {activeMethod === 'totp' && status !== 'success' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-2">
              <div className="text-center">
                <p className="text-sm text-slate-300">Enter the 6-digit code from your authenticator app</p>
                <p className="text-xs text-slate-500 mt-1">Demo: Enter any code (except 000000) to succeed</p>
              </div>

              {/* OTP Inputs */}
              <div className="flex justify-center gap-2.5 my-2">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    ref={(el) => (otpInputsRef.current[index] = el as HTMLInputElement)}
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    disabled={status === 'verifying'}
                    className="h-12 w-10 rounded-lg border border-slate-700 bg-slate-950 text-center text-lg font-semibold text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 transition-all"
                  />
                ))}
              </div>

              {/* Timer & Refresh */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="relative flex h-4 w-4 items-center justify-center">
                  <svg className="h-full w-full -rotate-90">
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      className="text-slate-800"
                      strokeWidth="2"
                      fill="transparent"
                    />
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      className="text-indigo-500 transition-all duration-1000"
                      strokeWidth="2"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 6}
                      strokeDashoffset={2 * Math.PI * 6 * (1 - totpTimer / 30)}
                    />
                  </svg>
                </div>
                <span>Code expires in {totpTimer}s</span>
              </div>
            </div>
          )}

          {/* 2. Hardware Key Method */}
          {activeMethod === 'hardware' && status !== 'success' && (
            <div className="flex flex-col items-center justify-center space-y-6 py-4 text-center">
              {hardwareStep === 'idle' && (
                <>
                  <div className="rounded-full bg-slate-950 p-4 border border-slate-800">
                    <KeyRound className="h-10 w-10 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-300 font-medium">Use your physical security key</p>
                    <p className="text-xs text-slate-500 mt-1">Insert your USB security key or hold your NFC key close to your device.</p>
                  </div>
                  <button
                    onClick={triggerHardwareVerification}
                    className="w-full rounded-lg bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
                  >
                    Activate Security Key
                  </button>
                </>
              )}

              {hardwareStep === 'waiting' && (
                <>
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
                    <div className="rounded-full bg-slate-950 p-4 border border-indigo-500/30">
                      <KeyRound className="h-8 w-8 text-indigo-400 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-200 font-medium">Waiting for key interaction...</p>
                    <p className="text-xs text-slate-400 mt-1">Please touch the gold disc or button on your security key.</p>
                  </div>
                </>
              )}

              {hardwareStep === 'scanning' && (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 border border-indigo-500/30">
                    <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-200 font-medium">Verifying credentials...</p>
                    <p className="text-xs text-slate-400 mt-1">Communicating securely with your hardware token.</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 3. Biometric Method */}
          {activeMethod === 'biometric' && status !== 'success' && (
            <div className="flex flex-col items-center justify-center space-y-6 py-4 text-center">
              {biometricStep === 'idle' && (
                <>
                  <div className="rounded-full bg-slate-950 p-4 border border-slate-800">
                    <Fingerprint className="h-10 w-10 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-300 font-medium">Use Touch ID / Face ID</p>
                    <p className="text-xs text-slate-500 mt-1">Authenticate instantly using your device's built-in biometric scanner.</p>
                  </div>
                  <button
                    onClick={triggerBiometricVerification}
                    className="w-full rounded-lg bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
                  >
                    Scan Biometrics
                  </button>
                </>
              )}

              {biometricStep === 'scanning' && (
                <>
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse" />
                    <div className="rounded-full bg-slate-950 p-4 border border-indigo-500/30">
                      <Fingerprint className="h-8 w-8 text-indigo-400 animate-bounce" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-200 font-medium">Scanning biometrics...</p>
                    <p className="text-xs text-slate-400 mt-1">Please look at your camera or place your finger on the scanner.</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="rounded-full bg-emerald-500/10 p-4 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-12 w-12 animate-bounce" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-100">Authentication Successful</h4>
                <p className="text-xs text-slate-400 mt-1">Your identity has been verified. Proceeding to confirmation...</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Redirecting</span>
              </div>
            </div>
          )}

          {/* Error Message Display */}
          {status === 'error' && errorMessage && (
            <div className="mt-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 flex items-start gap-2.5 animate-in slide-in-from-bottom-2 duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Verification Failed</p>
                <p className="mt-0.5 text-rose-300/90 leading-relaxed">{errorMessage}</p>
                <button 
                  onClick={resetFlow}
                  className="mt-2 flex items-center gap-1 text-rose-400 hover:text-rose-300 font-medium transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          {status !== 'success' && (
            <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
              <button
                onClick={onClose}
                className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel transaction
              </button>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-500/70" />
                <span>End-to-end encrypted</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}