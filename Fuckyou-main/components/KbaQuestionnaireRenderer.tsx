'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Lock, 
  HelpCircle,
  RefreshCw,
  Info
} from 'lucide-react';

export interface KbaOption {
  id: string;
  label: string;
  description?: string;
}

export interface KbaQuestion {
  id: string;
  prompt: string;
  category?: 'FINANCIAL' | 'RESIDENTIAL' | 'VEHICLE' | 'EMPLOYMENT' | 'GENERAL';
  options: KbaOption[];
  allowNoneOfAbove?: boolean;
  helpText?: string;
}

export interface KbaQuestionnairePayload {
  sessionToken: string;
  transactionId: string;
  timeLimitSeconds?: number;
  questions: KbaQuestion[];
  instructions?: string;
}

export interface KbaAnswerSubmission {
  questionId: string;
  selectedOptionId: string;
}

export interface KbaQuestionnaireRendererProps {
  payload: KbaQuestionnairePayload;
  onSubmit: (submission: {
    transactionId: string;
    sessionToken: string;
    answers: KbaAnswerSubmission[];
    timeTakenSeconds: number;
  }) => Promise<void> | void;
  onTimeout?: () => void;
  onCancel?: () => void;
  displayMode?: 'wizard' | 'single-page';
  className?: string;
  isSubmitting?: boolean;
}

export const KbaQuestionnaireRenderer: React.FC<KbaQuestionnaireRendererProps> = ({
  payload,
  onSubmit,
  onTimeout,
  onCancel,
  displayMode = 'wizard',
  className = '',
  isSubmitting = false,
}) => {
  const { sessionToken, transactionId, timeLimitSeconds = 180, questions, instructions } = payload;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(timeLimitSeconds);
  const [hasTimedOut, setHasTimedOut] = useState<boolean>(false);
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  const [startTime] = useState<number>(Date.now());
  const [validationError, setValidationError] = useState<string | null>(null);

  // Timer countdown hook
  useEffect(() => {
    if (timeRemaining <= 0) {
      setHasTimedOut(true);
      if (onTimeout) onTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setHasTimedOut(true);
          if (onTimeout) onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, onTimeout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (hasTimedOut || isSubmitting) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
    setValidationError(null);
  };

  const isCurrentQuestionAnswered = useMemo(() => {
    const currentQ = questions[currentStep];
    return currentQ ? Boolean(answers[currentQ.id]) : false;
  }, [answers, currentStep, questions]);

  const totalAnsweredCount = useMemo(() => {
    return Object.keys(answers).length;
  }, [answers]);

  const isAllAnswered = useMemo(() => {
    return questions.every((q) => Boolean(answers[q.id]));
  }, [answers, questions]);

  const handleNext = () => {
    if (!isCurrentQuestionAnswered) {
      setValidationError('Please select an option before proceeding to the next question.');
      return;
    }
    setValidationError(null);
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setValidationError(null);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!isAllAnswered) {
      setValidationError('Please answer all questions before submitting your verification.');
      return;
    }

    const formattedAnswers: KbaAnswerSubmission[] = Object.entries(answers).map(
      ([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      })
    );

    const timeTakenSeconds = Math.floor((Date.now() - startTime) / 1000);

    await onSubmit({
      transactionId,
      sessionToken,
      answers: formattedAnswers,
      timeTakenSeconds,
    });
  }, [answers, isAllAnswered, onSubmit, sessionToken, startTime, transactionId]);

  if (hasTimedOut) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl backdrop-blur-xl text-center">
        <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Session Expired</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-6 text-sm">
          For security and identity protection protocols, Knowledge-Based Assessment sessions have a strict time limit. Your session has timed out.
        </p>
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={onCancel || (() => window.location.reload())}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-all border border-slate-700 hover:border-slate-600 focus:ring-2 focus:ring-slate-500/30"
          >
            Cancel & Return
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-sans ${className}`}>
      {/* Top Security & Timer Header */}
      <div className="bg-slate-950/70 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-slate-100">Identity Verification</h3>
              <span className="text-[10px] px-2 py-0.5 font-mono font-medium rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                IPA ENCRYPTED
              </span>
            </div>
            <p className="text-xs text-slate-400">Knowledge-Based Assessment Protocol</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs">
            <Clock className={`w-4 h-4 ${timeRemaining < 30 ? 'text-amber-400 animate-spin' : 'text-slate-400'}`} />
            <span className={timeRemaining < 30 ? 'text-amber-400 font-bold' : ''}>
              {formatTime(timeRemaining)}
            </span>
          </div>

          <div className="text-xs font-medium text-slate-400">
            Progress: <span className="text-indigo-400 font-bold">{totalAnsweredCount}</span>/{questions.length}
          </div>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-800/40 h-1">
        <div 
          className="h-1 bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
          style={{ width: `${(totalAnsweredCount / questions.length) * 100}%` }}
        />
      </div>

      {/* Main Container */}
      <div className="p-6 md:p-8 space-y-6">
        {instructions && (
          <div className="flex items-start gap-3 p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl text-xs text-slate-300 leading-relaxed">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>{instructions}</span>
          </div>
        )}

        {validationError && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Wizard Mode Render */}
        {displayMode === 'wizard' ? (
          <div>
            {questions[currentStep] && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400">
                    Question {currentStep + 1} of {questions.length}
                  </span>
                  {questions[currentStep].category && (
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-800/70 border border-slate-700/50 px-2.5 py-0.5 rounded-full">
                      {questions[currentStep].category}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg md:text-xl font-medium text-slate-100 leading-snug">
                    {questions[currentStep].prompt}
                  </h2>
                  {questions[currentStep].helpText && (
                    <button
                      type="button"
                      onClick={() => setActiveHelp(activeHelp === questions[currentStep].id ? null : questions[currentStep].id)}
                      className="text-xs text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors mt-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{activeHelp === questions[currentStep].id ? 'Hide info' : 'Need help understanding?'}</span>
                    </button>
                  )}
                </div>

                {activeHelp === questions[currentStep].id && questions[currentStep].helpText && (
                  <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg text-xs text-indigo-200">
                    {questions[currentStep].helpText}
                  </div>
                )}

                {/* Question Options */}
                <div className="grid grid-cols-1 gap-2.5 pt-2">
                  {questions[currentStep].options.map((option) => {
                    const isSelected = answers[questions[currentStep].id] === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelectOption(questions[currentStep].id, option.id)}
                        disabled={isSubmitting}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
                          isSelected
                            ? 'bg-indigo-600/10 border-indigo-500/50 ring-1 ring-indigo-500/30 text-slate-100'
                            : 'bg-slate-800/30 hover:bg-slate-800/60 border-slate-700/60 hover:border-slate-600 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-indigo-400 bg-indigo-500'
                                : 'border-slate-600 bg-slate-800'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <div>
                            <span className="text-sm font-medium">{option.label}</span>
                            {option.description && (
                              <p className="text-xs text-slate-400 mt-0.5">{option.description}</p>
                            )}
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Single Page / List Mode */
          <div className="space-y-8">
            {questions.map((question, index) => (
              <div key={question.id} className="p-5 bg-slate-950/40 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-indigo-400 tracking-wide">
                    Question {index + 1}
                  </span>
                  {question.category && (
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                      {question.category}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-medium text-slate-100">{question.prompt}</h3>
                <div className="grid grid-cols-1 gap-2">
                  {question.options.map((opt) => {
                    const isSelected = answers[question.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(question.id, opt.id)}
                        disabled={isSubmitting}
                        className={`w-full flex items-center justify-between p-3.5 rounded-lg border text-left text-sm transition-all ${
                          isSelected
                            ? 'bg-indigo-600/10 border-indigo-500 text-slate-100 ring-1 ring-indigo-500/20'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Controls & Footer */}
        <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between gap-3">
          {displayMode === 'wizard' ? (
            <>
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 0 || isSubmitting}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:pointer-events-none flex items-center space-x-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-3">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                )}

                {currentStep < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5 transition-all focus:ring-2 focus:ring-indigo-400"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isAllAnswered || isSubmitting}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-600/20 flex items-center space-x-2 transition-all disabled:opacity-50 disabled:pointer-events-none focus:ring-2 focus:ring-emerald-400"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Complete Verification</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm font-medium"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isAllAnswered || isSubmitting}
                className="ml-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-600/20 flex items-center space-x-2 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Answers...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit & Verify</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KbaQuestionnaireRenderer;