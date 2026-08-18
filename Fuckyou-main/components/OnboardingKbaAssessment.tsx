import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  HelpCircle, 
  Clock, 
  Lock, 
  Globe, 
  RefreshCw,
  Check,
  AlertCircle
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type KbaProvider = 'veda' | 'transunion_hk' | 'bureau_recommended';

export interface KbaOption {
  value: string;
  label: string;
}

export interface KbaQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'free_text';
  options?: KbaOption[];
  helpText?: string;
  required?: boolean;
}

export interface OnboardingKbaAssessmentProps {
  provider: KbaProvider;
  questions: KbaQuestion[];
  onSubmit: (answers: Record<string, string>) => void | Promise<void>;
  onCancel?: () => void;
  onTimeout?: () => void;
  isLoading?: boolean;
  error?: string | null;
  timeoutSeconds?: number; // Optional countdown timer for security compliance
  title?: string;
  subtitle?: string;
}

// ==========================================
// PROVIDER CONFIGURATIONS
// ==========================================

const PROVIDER_METADATA = {
  veda: {
    name: 'Veda (Equifax Australia)',
    region: 'Australia',
    logoBg: 'bg-blue-600',
    accentColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Secure identity verification compliant with Australian AML/CTF regulations.',
  },
  transunion_hk: {
    name: 'TransUnion Hong Kong',
    region: 'Hong Kong',
    logoBg: 'bg-teal-600',
    accentColor: 'text-teal-600',
    borderColor: 'border-teal-200',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    description: 'Knowledge-based verification matching official credit registry records in HK.',
  },
  bureau_recommended: {
    name: 'Bureau Recommended Assessment',
    region: 'Global / Multi-Bureau',
    logoBg: 'bg-indigo-600',
    accentColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Dynamic verification routing through optimal local credit bureaus.',
  },
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function OnboardingKbaAssessment({
  provider,
  questions = [],
  onSubmit,
  onCancel,
  onTimeout,
  isLoading = false,
  error = null,
  timeoutSeconds = 300, // Default 5 minutes
  title,
  subtitle,
}: OnboardingKbaAssessmentProps) {
  // State Management
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(timeoutSeconds);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const meta = PROVIDER_METADATA[provider] || PROVIDER_METADATA.bureau_recommended;

  // Countdown Timer Effect
  useEffect(() => {
    if (!isTimerActive || timeLeft <= 0 || isSubmitted) {
      if (timeLeft === 0 && onTimeout) {
        onTimeout();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onTimeout) onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTimerActive, onTimeout, isSubmitted]);

  // Format time helper (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Current Question Selector
  const currentQuestion = questions[currentStep];
  const totalQuestions = questions.length;
  const progressPercentage = totalQuestions > 0 ? Math.round(((currentStep + 1) / totalQuestions) * 100) : 0;

  // Handlers
  const handleOptionSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setValidationError(null);
  };

  const handleTextChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setValidationError(null);
  };

  const toggleHelp = (questionId: string) => {
    setShowHelp((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const validateCurrentStep = (): boolean => {
    if (!currentQuestion) return false;
    const answer = answers[currentQuestion.id];
    if (currentQuestion.required !== false && (!answer || answer.trim() === '')) {
      setValidationError('Please answer this question to proceed.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalQuestions - 1) {
        setCurrentStep((prev) => prev + 1);
        setValidationError(null);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setValidationError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    // Ensure all questions are answered
    const unanswered = questions.filter(
      (q) => q.required !== false && (!answers[q.id] || answers[q.id].trim() === '')
    );

    if (unanswered.length > 0) {
      setValidationError(`Please complete all questions. You have unanswered items.`);
      // Jump to first unanswered question
      const firstUnansweredIndex = questions.findIndex((q) => q.id === unanswered[0].id);
      if (firstUnansweredIndex !== -1) {
        setCurrentStep(firstUnansweredIndex);
      }
      return;
    }

    try {
      setIsTimerActive(false);
      setIsSubmitted(true);
      await onSubmit(answers);
    } catch (err) {
      setIsTimerActive(true);
      setIsSubmitted(false);
    }
  };

  // Render Empty State
  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900">No Questions Available</h3>
        <p className="text-slate-500 mt-2 text-sm">
          We couldn't load the identity verification questions. Please contact support or try again.
        </p>
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-6 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  // Render Timeout State
  if (timeLeft === 0) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 bg-white rounded-2xl border border-red-100 shadow-lg text-center animate-fade-in">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Session Expired</h3>
        <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
          For your security, identity verification sessions expire after {Math.round(timeoutSeconds / 60)} minutes of inactivity. No data has been saved.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-all"
            >
              Cancel Verification
            </button>
          )}
          <button
            onClick={() => {
              setTimeLeft(timeoutSeconds);
              setCurrentStep(0);
              setAnswers({});
              setIsTimerActive(true);
              setValidationError(null);
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Restart Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-6 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden transition-all duration-300">
      {/* Header Banner */}
      <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${meta.logoBg} flex items-center justify-center text-white shadow-sm`}>
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {title || 'Identity Verification Assessment'}
              </h2>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${meta.badgeColor} flex items-center gap-1`}>
                <Globe className="w-3 h-3" />
                {meta.region}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Powered by <span className="font-medium text-slate-700">{meta.name}</span>
            </p>
          </div>
        </div>

        {/* Timer & Security Badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
            timeLeft < 60 
              ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>Time Left: {formatTime(timeLeft)}</span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-lg">
            <Lock className="w-3 h-3" />
            <span>256-bit SSL</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5 relative">
        <div 
          className="bg-blue-600 h-1.5 transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Main Content Area */}
      <div className="p-6 sm:p-8">
        {/* Subtitle / Instructions */}
        {currentStep === 0 && (
          <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-slate-600 leading-relaxed">
            <p className="font-semibold text-blue-900 mb-1">Security Notice:</p>
            {subtitle || (
              <>
                This Knowledge-Based Assessment (KBA) helps verify your identity using secure, historical record checks. 
                Please answer the questions accurately. These questions are generated dynamically and are timed for security.
              </>
            )}
          </div>
        )}

        {/* Error Alert */}
        {(error || validationError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-sm text-red-800 animate-shake">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Verification Alert</p>
              <p className="text-xs text-red-700 mt-0.5">{error || validationError}</p>
            </div>
          </div>
        )}

        {/* Question Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {currentQuestion && (
            <div className="space-y-4 animate-fade-in">
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Question {currentStep + 1} of {totalQuestions}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900 leading-snug">
                    {currentQuestion.text}
                  </h3>
                </div>
                {currentQuestion.helpText && (
                  <button
                    type="button"
                    onClick={() => toggleHelp(currentQuestion.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Show help"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Help Text Box */}
              {currentQuestion.helpText && showHelp[currentQuestion.id] && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed animate-slide-down">
                  <span className="font-semibold text-slate-800 block mb-1">Helpful Tip:</span>
                  {currentQuestion.helpText}
                </div>
              )}

              {/* Question Input Types */}
              <div className="mt-6">
                {/* MULTIPLE CHOICE */}
                {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                  <div className="grid grid-cols-1 gap-3">
                    {currentQuestion.options.map((option) => {
                      const isSelected = answers[currentQuestion.id] === option.value;
                      return (
                        <label
                          key={option.value}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                              {option.label}
                            </span>
                          </div>
                          <input
                            type="radio"
                            name={currentQuestion.id}
                            value={option.value}
                            checked={isSelected}
                            onChange={() => handleOptionSelect(currentQuestion.id, option.value)}
                            className="sr-only"
                          />
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* TRUE / FALSE */}
                {currentQuestion.type === 'true_false' && (
                  <div className="grid grid-cols-2 gap-4">
                    {['true', 'false'].map((val) => {
                      const isSelected = answers[currentQuestion.id] === val;
                      const labelText = val === 'true' ? 'True' : 'False';
                      return (
                        <label
                          key={val}
                          className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center mb-2 ${
                            isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                          </div>
                          <span className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                            {labelText}
                          </span>
                          <input
                            type="radio"
                            name={currentQuestion.id}
                            value={val}
                            checked={isSelected}
                            onChange={() => handleOptionSelect(currentQuestion.id, val)}
                            className="sr-only"
                          />
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* FREE TEXT */}
                {currentQuestion.type === 'free_text' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleTextChange(currentQuestion.id, e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                      required={currentQuestion.required !== false}
                    />
                    <p className="text-[11px] text-slate-400">
                      Please ensure spelling matches official documents exactly.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            {/* Left Side: Cancel or Back */}
            <div>
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-4 py-2.5 text-slate-500 hover:text-slate-700 text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )
              )}
            </div>

            {/* Right Side: Next or Submit */}
            <div>
              {currentStep < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all"
                >
                  Next Question
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Submit Verification
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Footer Security Disclaimer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Your responses are encrypted and processed securely.</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="#privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
          <span>•</span>
          <a href="#terms" className="hover:text-slate-600 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}