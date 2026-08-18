import React, { useState } from 'react';
import { UserPlus, Check, X, CreditCard, Tag, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

export interface AdhocPayee {
  name: string;
  accountNumber: string;
  routingNumber?: string;
  bankName?: string;
  email?: string;
  phoneNumber?: string;
  lastTransferAmount?: string;
  currency?: string;
}

interface AdhocPayeeSaverProps {
  adhocPayee: AdhocPayee;
  onSave: (savedPayee: AdhocPayee & { nickname: string; category: string }) => Promise<void>;
  onDismiss: () => void;
}

const CATEGORIES = [
  { id: 'friends', label: 'Friends & Family', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  { id: 'utilities', label: 'Utilities', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { id: 'rent', label: 'Rent & Housing', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { id: 'services', label: 'Professional Services', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { id: 'other', label: 'Other', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
];

export default function AdhocPayeeSaver({ adhocPayee, onSave, onDismiss }: AdhocPayeeSaverProps) {
  const [nickname, setNickname] = useState(adhocPayee.name);
  const [selectedCategory, setSelectedCategory] = useState('friends');
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('Please enter a nickname or name for the payee.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        ...adhocPayee,
        nickname: nickname.trim(),
        category: selectedCategory,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to save payee. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const maskAccountNumber = (accNum: string) => {
    if (accNum.length <= 4) return accNum;
    return `•••• ${accNum.slice(-4)}`;
  };

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl transition-all duration-300 hover:border-slate-700">
      {!isSuccess ? (
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Save Payee Details?</h3>
                <p className="text-xs text-slate-400">Add to your list for faster future transfers.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Transfer Summary Card */}
          <div className="rounded-xl bg-slate-900/50 p-4 border border-slate-800/80 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Recent Transfer</span>
              {adhocPayee.lastTransferAmount && (
                <span className="font-semibold text-emerald-400">
                  {adhocPayee.currency || '$'}{adhocPayee.lastTransferAmount}
                </span>
              )}
            </div>
            <div className="h-px bg-slate-800" />
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block text-slate-500 mb-0.5">Account Name</span>
                <span className="font-medium text-slate-200 truncate block">{adhocPayee.name}</span>
              </div>
              <div>
                <span className="block text-slate-500 mb-0.5">Bank Details</span>
                <span className="font-medium text-slate-200 flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {adhocPayee.bankName || 'Standard Bank'} ({maskAccountNumber(adhocPayee.accountNumber)})
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
            <div>
              <label htmlFor="nickname" className="block text-xs font-medium text-slate-300 mb-1.5">
                Payee Nickname / Display Name
              </label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Landlord, Mom, Electric Bill"
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Select Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onDismiss}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              disabled={isSaving}
            >
              Maybe Later
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save Payee
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Success State */
        <div className="p-8 text-center space-y-6 animate-fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-8 ring-emerald-500/5">
            <Check className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Payee Saved Successfully!</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              <span className="font-medium text-slate-200">{nickname}</span> has been added to your permanent payee list under <span className="font-medium text-slate-200">{CATEGORIES.find(c => c.id === selectedCategory)?.label}</span>.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 bg-slate-900/50 py-2 px-4 rounded-lg border border-slate-800/50 w-fit mx-auto">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Encrypted & secured in your address book</span>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}