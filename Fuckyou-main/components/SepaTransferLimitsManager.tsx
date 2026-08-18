import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Settings, 
  Save, 
  X, 
  ArrowRight, 
  Info, 
  Landmark, 
  TrendingUp, 
  HelpCircle,
  Sliders,
  Check
} from 'lucide-react';

interface LimitConfig {
  dailyLimit: number;
  dailyUsed: number;
  monthlyLimit: number;
  monthlyUsed: number;
}

export default function SepaTransferLimitsManager() {
  // Core State
  const [limits, setLimits] = useState<LimitConfig>({
    dailyLimit: 10000,
    dailyUsed: 3250,
    monthlyLimit: 50000,
    monthlyUsed: 18400,
  });

  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [tempDailyLimit, setTempDailyLimit] = useState(limits.dailyLimit.toString());
  const [tempMonthlyLimit, setTempMonthlyLimit] = useState(limits.monthlyLimit.toString());
  
  // Simulation State
  const [simulatedAmount, setSimulatedAmount] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [iban, setIban] = useState<string>('');
  const [simulationResult, setSimulationResult] = useState<{
    status: 'idle' | 'success' | 'warning' | 'error';
    message: string;
    details?: string[];
  }>({ status: 'idle', message: '' });

  // Formatters
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Derived Values
  const dailyRemaining = Math.max(0, limits.dailyLimit - limits.dailyUsed);
  const monthlyRemaining = Math.max(0, limits.monthlyLimit - limits.monthlyUsed);

  const dailyPercentage = Math.min(100, (limits.dailyUsed / limits.dailyLimit) * 100);
  const monthlyPercentage = Math.min(100, (limits.monthlyUsed / limits.monthlyLimit) * 100);

  // Handlers
  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    const newDaily = parseFloat(tempDailyLimit);
    const newMonthly = parseFloat(tempMonthlyLimit);

    if (isNaN(newDaily) || newDaily <= 0 || isNaN(newMonthly) || newMonthly <= 0) {
      alert('Please enter valid positive numbers for limits.');
      return;
    }

    if (newDaily > newMonthly) {
      alert('Daily limit cannot exceed the monthly limit.');
      return;
    }

    setLimits(prev => ({
      ...prev,
      dailyLimit: newDaily,
      monthlyLimit: newMonthly
    }));
    setIsEditing(false);
    
    // Re-evaluate current simulation if any
    if (simulatedAmount) {
      evaluateTransfer(parseFloat(simulatedAmount), newDaily, newMonthly);
    }
  };

  const evaluateTransfer = (amount: number, customDaily?: number, customMonthly?: number) => {
    const dLimit = customDaily ?? limits.dailyLimit;
    const mLimit = customMonthly ?? limits.monthlyLimit;
    
    const dRemaining = dLimit - limits.dailyUsed;
    const mRemaining = mLimit - limits.monthlyUsed;

    if (isNaN(amount) || amount <= 0) {
      setSimulationResult({ status: 'idle', message: '' });
      return;
    }

    const warnings: string[] = [];
    let status: 'success' | 'warning' | 'error' = 'success';

    // Check hard stops (exceeding total limit directly)
    if (amount > dLimit) {
      status = 'error';
      warnings.push(`The transfer amount (${formatCurrency(amount)}) exceeds your absolute Daily Limit of ${formatCurrency(dLimit)}.`);
    }
    if (amount > mLimit) {
      status = 'error';
      warnings.push(`The transfer amount (${formatCurrency(amount)}) exceeds your absolute Monthly Limit of ${formatCurrency(mLimit)}.`);
    }

    // Check remaining capacity warnings
    if (status !== 'error') {
      if (amount > dRemaining) {
        status = 'warning';
        warnings.push(`This transfer exceeds your remaining Daily Limit by ${formatCurrency(amount - dRemaining)}.`);
      }
      if (amount > mRemaining) {
        status = 'warning';
        warnings.push(`This transfer exceeds your remaining Monthly Limit by ${formatCurrency(amount - mRemaining)}.`);
      }
    }

    if (status === 'error') {
      setSimulationResult({
        status: 'error',
        message: 'Transfer Blocked',
        details: warnings
      });
    } else if (status === 'warning') {
      setSimulationResult({
        status: 'warning',
        message: 'Limit Warning',
        details: warnings
      });
    } else {
      setSimulationResult({
        status: 'success',
        message: 'Transfer Allowed',
        details: [
          `This transfer fits comfortably within your remaining limits.`,
          `Remaining Daily after transfer: ${formatCurrency(dRemaining - amount)}`,
          `Remaining Monthly after transfer: ${formatCurrency(mRemaining - amount)}`
        ]
      });
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSimulatedAmount(val);
    evaluateTransfer(parseFloat(val));
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-rose-500';
    if (percentage >= 75) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getProgressTrackColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-rose-100 dark:bg-rose-950/30';
    if (percentage >= 75) return 'bg-amber-100 dark:bg-amber-950/30';
    return 'bg-emerald-100 dark:bg-emerald-950/30';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-3xl shadow-xl border border-slate-200/60 dark:border-slate-800/60 transition-all duration-300">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
            <Landmark className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                SEPA Instant
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">Transfer Limits Manager</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Configure, monitor, and simulate your Single Euro Payments Area transaction thresholds.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setTempDailyLimit(limits.dailyLimit.toString());
            setTempMonthlyLimit(limits.monthlyLimit.toString());
            setIsEditing(!isEditing);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 font-medium text-sm transition-all duration-200 shadow-sm"
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4" /> Cancel Edit
            </>
          ) : (
            <>
              <Settings className="w-4 h-4" /> Configure Limits
            </>
          )}
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Limits Display & Configuration */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Edit Limits Form */}
          {isEditing && (
            <form onSubmit={handleSaveLimits} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 shadow-md space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Adjust SEPA Thresholds</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Daily Limit (€)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>
                    <input
                      type="number"
                      value={tempDailyLimit}
                      onChange={(e) => setTempDailyLimit(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="e.g. 10000"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Monthly Limit (€)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>
                    <input
                      type="number"
                      value={tempMonthlyLimit}
                      onChange={(e) => setTempMonthlyLimit(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="e.g. 50000"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Limits Progress Cards */}
          <div className="space-y-6">
            
            {/* Daily Limit Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Daily Limit Status</span>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(limits.dailyLimit)}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Remaining Today</span>
                  <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatCurrency(dailyRemaining)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressBarColor(dailyPercentage)}`}
                    style={{ width: `${dailyPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span>Used: {formatCurrency(limits.dailyUsed)} ({dailyPercentage.toFixed(0)}%)</span>
                  <span>Limit: {formatCurrency(limits.dailyLimit)}</span>
                </div>
              </div>
            </div>

            {/* Monthly Limit Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Monthly Limit Status</span>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(limits.monthlyLimit)}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Remaining This Month</span>
                  <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatCurrency(monthlyRemaining)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressBarColor(monthlyPercentage)}`}
                    style={{ width: `${monthlyPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span>Used: {formatCurrency(limits.monthlyUsed)} ({monthlyPercentage.toFixed(0)}%)</span>
                  <span>Limit: {formatCurrency(limits.monthlyLimit)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Info / Guidelines */}
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200">About SEPA Instant Limits</p>
              <p>SEPA Instant transfers are processed 24/7 within 10 seconds. For security reasons, daily and monthly limits are enforced. You can adjust your limits up to your maximum pre-approved tier limit.</p>
            </div>
          </div>

        </div>

        {/* Right Column: Preprocess Transfer Simulator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold">Preprocess Transfer Simulator</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Test a SEPA transfer request against your current remaining limits before execution.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Recipient IBAN
                </label>
                <input
                  type="text"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-mono"
                  placeholder="DE89 3704 0044 0532 0130 00"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Transfer Amount (€)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">€</span>
                  <input
                    type="number"
                    value={simulatedAmount}
                    onChange={handleAmountChange}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-semibold"
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Simulation Result Alert Box */}
            {simulatedAmount && (
              <div className="animate-in fade-in zoom-in-95 duration-150">
                {simulationResult.status === 'success' && (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{simulationResult.message}</span>
                    </div>
                    {simulationResult.details && (
                      <ul className="text-xs text-emerald-700 dark:text-emerald-400/90 list-disc pl-5 space-y-1">
                        {simulationResult.details.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {simulationResult.status === 'warning' && (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>{simulationResult.message}</span>
                    </div>
                    {simulationResult.details && (
                      <ul className="text-xs text-amber-700 dark:text-amber-400/90 list-disc pl-5 space-y-1">
                        {simulationResult.details.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {simulationResult.status === 'error' && (
                  <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 space-y-2">
                    <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-semibold text-sm">
                      <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span>{simulationResult.message}</span>
                    </div>
                    {simulationResult.details && (
                      <ul className="text-xs text-rose-700 dark:text-rose-400/90 list-disc pl-5 space-y-1">
                        {simulationResult.details.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Button */}
            <button
              disabled={simulationResult.status === 'error' || !simulatedAmount || !recipientName || !iban}
              onClick={() => {
                const amt = parseFloat(simulatedAmount);
                setLimits(prev => ({
                  ...prev,
                  dailyUsed: prev.dailyUsed + amt,
                  monthlyUsed: prev.monthlyUsed + amt
                }));
                setSimulatedAmount('');
                setRecipientName('');
                setIban('');
                setSimulationResult({ status: 'idle', message: '' });
                alert('SEPA Transfer simulated successfully! Limits updated.');
              }}
              className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                simulationResult.status === 'error' || !simulatedAmount || !recipientName || !iban
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
              }`}
            >
              <span>Execute Simulated Transfer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}