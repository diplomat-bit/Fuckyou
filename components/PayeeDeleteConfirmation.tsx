import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, X, CheckCircle, Loader2, ShieldAlert, ArrowRight, Info } from 'lucide-react';

export interface Payee {
  id: string;
  nickname: string;
  maskedAccountNumber: string;
  type: 'Individual' | 'Business' | 'Utility' | 'Other';
  bankName?: string;
  avatarColor?: string;
}

interface PayeeDeleteConfirmationProps {
  isOpen: boolean;
  payee: Payee | null;
  onClose: () => void;
  onSuccess?: (payeeId: string) => void;
  onSimulatedDelete?: (payeeId: string) => Promise<void>;
}

export default function PayeeDeleteConfirmation({
  isOpen,
  payee,
  onClose,
  onSuccess,
  onSimulatedDelete,
}: PayeeDeleteConfirmationProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

  // Reset state when modal opens/closes or payee changes
  useEffect(() => {
    if (isOpen) {
      setIsDeleting(false);
      setIsSuccess(false);
      setError(null);
      setConfirmText('');
      setIsCheckboxChecked(false);
    }
  }, [isOpen, payee]);

  if (!isOpen || !payee) return null;

  const isConfirmEnabled = isCheckboxChecked && confirmText.trim().toLowerCase() === 'delete';

  const handleDelete = async () => {
    if (!isConfirmEnabled) return;

    setIsDeleting(true);
    setError(null);

    try {
      // Simulate API call DELETE /payees/{payeeId}
      if (onSimulatedDelete) {
        await onSimulatedDelete(payee.id);
      } else {
        // Default simulation delay
        await new Promise((resolve) => setTimeout(resolve, 1800));
      }
      
      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(payee.id);
        }
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to delete payee. Please try again or contact support.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={!isDeleting && !isSuccess ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        
        {/* Close Button */}
        {!isDeleting && !isSuccess && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Success State */}
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 dark:text-emerald-400 animate-bounce">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Payee Removed</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {payee.nickname} has been successfully deleted from your list.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Syncing changes across devices...
            </div>
          </div>
        ) : (
          /* Main Confirmation Form */
          <div>
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Delete Payee?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            {/* Payee Card Details */}
            <div className="mt-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-semibold text-white ${payee.avatarColor || 'bg-slate-600'}`}>
                  {payee.nickname.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {payee.nickname}
                    </p>
                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                      {payee.type}
                    </span>
                  </div>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {payee.bankName || 'Standard Electronic Transfer'} • {payee.maskedAccountNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning Alert */}
            <div className="mt-4 flex gap-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 text-xs text-amber-800 dark:text-amber-300 border border-amber-100 dark:border-amber-950/30">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-semibold">Important:</span> Any scheduled or recurring transfers to this payee will be automatically cancelled.
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/20 p-3 text-xs text-red-600 dark:text-red-400 border border-red-100 dark:border-red-950/30">
                {error}
              </div>
            )}

            {/* Security Verification Fields */}
            <div className="mt-5 space-y-4">
              {/* Checkbox Confirmation */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isCheckboxChecked}
                  onChange={(e) => setIsCheckboxChecked(e.target.checked)}
                  disabled={isDeleting}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-offset-slate-900"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 select-none group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                  I confirm that I want to permanently remove this payee and cancel all associated scheduled payments.
                </span>
              </label>

              {/* Text Verification */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  To verify, type <span className="font-bold text-red-600 dark:text-red-400">DELETE</span> below:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={isDeleting}
                  placeholder="Type DELETE to confirm"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder-slate-600 dark:focus:border-red-500"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="w-full sm:w-auto rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!isConfirmEnabled || isDeleting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-red-600/10"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting Payee...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Payee
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}