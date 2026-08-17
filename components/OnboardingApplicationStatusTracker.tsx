import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  FileCheck, 
  ArrowRight, 
  Loader2, 
  Calendar, 
  Info, 
  ChevronRight, 
  UserCheck, 
  FileText, 
  TrendingUp,
  RefreshCw,
  Sparkles
} from 'lucide-react';

// Types & Interfaces
export interface Stage {
  id: string;
  title: string;
  description: string;
  status: 'upcoming' | 'current' | 'completed' | 'failed';
  updatedAt?: string;
}

export interface OnboardingApplicationStatusTrackerProps {
  applicationId?: string;
  applicantName?: string;
  initialStageIndex?: number;
  ipaExpirationDate?: string; // ISO string
  initialBureauStatus?: 'idle' | 'pending' | 'success' | 'failed';
  bureauScore?: number;
  onFinalSubmit?: () => Promise<{ success: boolean; message?: string }>;
}

export default function OnboardingApplicationStatusTracker({
  applicationId = "APP-2024-89021",
  applicantName = "Sarah Jenkins",
  initialStageIndex = 2,
  ipaExpirationDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
  initialBureauStatus = 'success',
  bureauScore = 742,
  onFinalSubmit
}: OnboardingApplicationStatusTrackerProps) {
  
  // Component States
  const [currentStageIndex, setCurrentStageIndex] = useState(initialStageIndex);
  const [bureauStatus, setBureauStatus] = useState(initialBureauStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Mock Stages Data
  const [stages, setStages] = useState<Stage[]>([
    {
      id: 'profile',
      title: 'Profile Creation',
      description: 'Personal details and identity verification completed.',
      status: 'completed',
      updatedAt: '2 hours ago'
    },
    {
      id: 'bureau',
      title: 'Bureau Pull & Credit Check',
      description: 'Automated credit history and risk assessment.',
      status: 'completed',
      updatedAt: '1 hour ago'
    },
    {
      id: 'ipa',
      title: 'In Principle Approval (IPA)',
      description: 'Conditional approval and credit limit determination.',
      status: 'current',
      updatedAt: 'Just now'
    },
    {
      id: 'review',
      title: 'Final Review & Submission',
      description: 'Review terms, sign disclosures, and submit for final underwriting.',
      status: 'upcoming'
    },
    {
      id: 'disbursement',
      title: 'Account Activation',
      description: 'Final contract generation and funds disbursement.',
      status: 'upcoming'
    }
  ]);

  // Sync stages with currentStageIndex
  useEffect(() => {
    setStages(prevStages => 
      prevStages.map((stage, index) => {
        let status: Stage['status'] = 'upcoming';
        if (index < currentStageIndex) status = 'completed';
        else if (index === currentStageIndex) status = 'current';
        return { ...stage, status };
      })
    );
  }, [currentStageIndex]);

  // IPA Expiration Countdown Timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(ipaExpirationDate) - +new Date();
      if (difference <= 0) {
        return 'Expired';
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      return `${days}d ${hours}h ${minutes}m remaining`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [ipaExpirationDate]);

  // Handle Final Submission Trigger
  const handleFinalSubmission = async () => {
    if (!termsAccepted) return;
    
    setIsSubmitting(true);
    setSubmissionResult('idle');
    
    try {
      if (onFinalSubmit) {
        const res = await onFinalSubmit();
        if (res.success) {
          setSubmissionResult('success');
          setCurrentStageIndex(4); // Move to Account Activation
          setSubmissionMessage(res.message || "Application successfully submitted!");
        } else {
          setSubmissionResult('error');
          setSubmissionMessage(res.message || "Submission failed. Please try again.");
        }
      } else {
        // Simulated API Call
        await new Promise(resolve => setTimeout(resolve, 2500));
        setSubmissionResult('success');
        setCurrentStageIndex(4);
        setSubmissionMessage("Your application has been successfully submitted for final underwriting. You will receive an email confirmation shortly.");
      }
    } catch (error) {
      setSubmissionResult('error');
      setSubmissionMessage("An unexpected error occurred. Please contact support.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to render stage icons
  const renderStageIcon = (status: Stage['status'], index: number) => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        );
      case 'current':
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 border-2 border-indigo-500 animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <span className="text-sm font-bold">{index + 1}</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 text-slate-500 border border-slate-700">
            <span className="text-sm font-semibold">{index + 1}</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-indigo-400 uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Onboarding Portal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Application Status Tracker
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Applicant: <span className="text-slate-200 font-medium">{applicantName}</span> • ID: <span className="font-mono text-slate-300">{applicationId}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <div className="text-xs">
            <span className="text-slate-400 block">System Status</span>
            <span className="text-slate-200 font-medium">All integrations operational</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        
        {/* Left Column: Visual Timeline (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Application Journey
          </h2>
          
          <div className="relative pl-4 border-l-2 border-slate-800 ml-5 space-y-8 py-2">
            {stages.map((stage, index) => {
              const isLast = index === stages.length - 1;
              const isCurrent = stage.status === 'current';
              const isCompleted = stage.status === 'completed';

              return (
                <div key={stage.id} className="relative group">
                  {/* Timeline Connector Line Highlight */}
                  {!isLast && (
                    <div className={`absolute left-[-22px] top-10 bottom-[-32px] w-0.5 transition-colors duration-500 ${
                      isCompleted ? 'bg-emerald-500/50' : 'bg-slate-800'
                    }`} />
                  )}

                  {/* Stage Icon Anchor */}
                  <div className="absolute left-[-36px] top-0 transition-transform duration-300 group-hover:scale-105">
                    {renderStageIcon(stage.status, index)}
                  </div>

                  {/* Stage Content Card */}
                  <div className={`ml-6 p-4 rounded-xl border transition-all duration-300 ${
                    isCurrent 
                      ? 'bg-slate-900/60 border-indigo-500/40 shadow-[0_4px_20px_rgba(99,102,241,0.05)]' 
                      : isCompleted 
                        ? 'bg-slate-900/20 border-slate-800/60 hover:border-slate-700' 
                        : 'bg-transparent border-transparent opacity-60'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-semibold text-base ${
                        isCurrent ? 'text-indigo-300' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                      }`}>
                        {stage.title}
                      </h3>
                      {stage.updatedAt && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {stage.updatedAt}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                      {stage.description}
                    </p>

                    {/* Interactive elements inside specific stages */}
                    {stage.id === 'ipa' && isCurrent && (
                      <div className="mt-4 p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-medium text-indigo-200">In Principle Approval Active</span>
                        </div>
                        <button 
                          onClick={() => setCurrentStageIndex(3)}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                        >
                          Proceed to Review <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Status Cards & Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* IPA Expiration Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">IPA Expiration</span>
                <h3 className="text-lg font-bold text-white mt-1">In Principle Approval</h3>
              </div>
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Time Remaining:</span>
                <span className="text-amber-400 font-semibold font-mono">{timeLeft}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                {/* Simulated progress bar (e.g., 14 days left of 30) */}
                <div className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full rounded-full" style={{ width: '46%' }} />
              </div>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Must complete final submission before expiration to lock in rates.
              </p>
            </div>
          </div>

          {/* Bureau Pull Status Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Credit Assessment</span>
                <h3 className="text-lg font-bold text-white mt-1">Bureau Pull Status</h3>
              </div>
              
              {bureauStatus === 'success' && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Verified
                </span>
              )}
              {bureauStatus === 'pending' && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Pulling
                </span>
              )}
              {bureauStatus === 'failed' && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Failed
                </span>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <span className="text-xs text-slate-500 block">Credit Score</span>
                <span className="text-xl font-bold text-white font-mono">{bureauScore}</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Excellent Range</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <span className="text-xs text-slate-500 block">Inquiries</span>
                <span className="text-xl font-bold text-white font-mono">1</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Last 30 Days</span>
              </div>
            </div>
          </div>

          {/* Final Submission Action Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-400" />
              Final Submission
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Review your terms and submit your application for final underwriting.
            </p>

            {currentStageIndex < 3 ? (
              <div className="mt-4 p-4 bg-slate-950 rounded-lg border border-slate-800 text-center">
                <p className="text-xs text-slate-400">
                  Please complete the previous stages to unlock final submission.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {/* Terms Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    disabled={currentStageIndex > 3 || isSubmitting}
                    className="mt-1 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 disabled:opacity-50"
                  />
                  <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                    I confirm that all provided information is accurate, and I agree to the terms of service and credit disclosure agreements.
                  </span>
                </label>

                {/* Submit Button */}
                {currentStageIndex === 3 && (
                  <button
                    onClick={handleFinalSubmission}
                    disabled={!termsAccepted || isSubmitting}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                      termsAccepted && !isSubmitting
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.4)] active:scale-[0.98]'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing Application...
                      </>
                    ) : (
                      <>
                        Submit Final Application
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}

                {/* Submission Feedback */}
                {submissionResult === 'success' && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Application Submitted!
                    </div>
                    <p className="text-slate-300 leading-relaxed">{submissionMessage}</p>
                  </div>
                )}

                {submissionResult === 'error' && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Submission Failed
                    </div>
                    <p className="text-slate-300 leading-relaxed">{submissionMessage}</p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Interactive Simulation Panel (For Demo/UI Kit Value) */}
      <div className="mt-12 pt-6 border-t border-slate-800/60">
        <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              Interactive Simulation Controls
            </h4>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-medium">
              Developer Sandbox
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => {
                setCurrentStageIndex(1);
                setSubmissionResult('idle');
                setTermsAccepted(false);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Reset to Stage 2
            </button>
            <button 
              onClick={() => {
                setCurrentStageIndex(2);
                setSubmissionResult('idle');
                setTermsAccepted(false);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Reset to Stage 3 (IPA)
            </button>
            <button 
              onClick={() => {
                setCurrentStageIndex(3);
                setSubmissionResult('idle');
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Jump to Stage 4 (Review)
            </button>
            <button 
              onClick={() => {
                setBureauStatus(prev => prev === 'success' ? 'failed' : 'success');
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Toggle Bureau Status
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}