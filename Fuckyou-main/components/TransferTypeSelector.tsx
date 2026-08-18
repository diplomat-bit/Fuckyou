import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  Globe, 
  Building, 
  Coins, 
  CreditCard, 
  Info, 
  CheckCircle2, 
  HelpCircle,
  Zap,
  ShieldAlert
} from 'lucide-react';

export type TransferType = 'INTERNAL' | 'EXTERNAL';
export type PaymentMethod = 'SEPA' | 'ACH' | 'WIRE' | 'INSTANT';
export type ChargeBearer = 'SHA' | 'OUR' | 'BEN';
export type CurrencyIndicator = 'SOURCE' | 'DESTINATION';

export interface TransferTypeSelectorValue {
  transferType: TransferType;
  paymentMethod?: PaymentMethod;
  transferCurrencyIndicator?: CurrencyIndicator;
  chargeBearer?: ChargeBearer;
}

interface TransferTypeSelectorProps {
  value: TransferTypeSelectorValue;
  onChange: (value: TransferTypeSelectorValue) => void;
  errors?: {
    transferType?: string;
    paymentMethod?: string;
    transferCurrencyIndicator?: string;
    chargeBearer?: string;
  };
  className?: string;
}

export const TransferTypeSelector: React.FC<TransferTypeSelectorProps> = ({
  value,
  onChange,
  errors = {},
  className = '',
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Handle main transfer type toggle
  const handleTypeChange = (type: TransferType) => {
    if (type === 'INTERNAL') {
      // Reset external-specific fields for internal transfers
      onChange({
        transferType: 'INTERNAL',
        paymentMethod: undefined,
        transferCurrencyIndicator: undefined,
        chargeBearer: undefined,
      });
    } else {
      // Set sensible defaults for external transfers
      onChange({
        transferType: 'EXTERNAL',
        paymentMethod: 'ACH',
        transferCurrencyIndicator: 'SOURCE',
        chargeBearer: 'SHA',
      });
    }
  };

  // Handle sub-field updates
  const updateField = <K extends keyof Omit<TransferTypeSelectorValue, 'transferType'>>(
    key: K,
    val: TransferTypeSelectorValue[K]
  ) => {
    onChange({
      ...value,
      [key]: val,
    });
  };

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-8 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-xl ${className}`}>
      {/* Header Section */}
      <div>
        <h3 className="text-lg font-semibold text-slate-100">Transfer Type</h3>
        <p className="text-sm text-slate-400 mt-1">
          Select whether you are transferring funds internally within our network or externally to another domestic institution.
        </p>
      </div>

      {/* Main Toggle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Internal Transfer Card */}
        <button
          type="button"
          onClick={() => handleTypeChange('INTERNAL')}
          className={`relative flex flex-col items-start p-5 rounded-xl border text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
            value.transferType === 'INTERNAL'
              ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className={`p-2.5 rounded-lg ${
              value.transferType === 'INTERNAL' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'
            }`}>
              <Building className="w-6 h-6" />
            </div>
            {value.transferType === 'INTERNAL' && (
              <CheckCircle2 className="w-5 h-5 text-indigo-400 fill-indigo-500/10" />
            )}
          </div>
          <span className="text-base font-medium text-slate-100">Internal Transfer</span>
          <span className="text-xs text-slate-400 mt-1 leading-relaxed">
            Instant, zero-fee transfers to other accounts registered within our ecosystem.
          </span>
          <div className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <Zap className="w-3 h-3" /> Instant & Free
          </div>
        </button>

        {/* External Transfer Card */}
        <button
          type="button"
          onClick={() => handleTypeChange('EXTERNAL')}
          className={`relative flex flex-col items-start p-5 rounded-xl border text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
            value.transferType === 'EXTERNAL'
              ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className={`p-2.5 rounded-lg ${
              value.transferType === 'EXTERNAL' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'
            }`}>
              <Globe className="w-6 h-6" />
            </div>
            {value.transferType === 'EXTERNAL' && (
              <CheckCircle2 className="w-5 h-5 text-indigo-400 fill-indigo-500/10" />
            )}
          </div>
          <span className="text-base font-medium text-slate-100">External Domestic Transfer</span>
          <span className="text-xs text-slate-400 mt-1 leading-relaxed">
            Transfer funds securely to external domestic banks via standard clearing networks.
          </span>
          <div className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
            Standard Clearing
          </div>
        </button>
      </div>

      {errors.transferType && (
        <div className="flex items-center gap-2 text-sm text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errors.transferType}</span>
        </div>
      )}

      {/* Dynamic Fields for External Transfer */}
      {value.transferType === 'EXTERNAL' && (
        <div className="space-y-6 pt-6 border-t border-slate-800/80 animate-in fade-in slide-in-from-top-4 duration-300">
          
          {/* Payment Method Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                Payment Method
                <button
                  type="button"
                  onMouseEnter={() => setActiveTooltip('paymentMethod')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </label>
              {activeTooltip === 'paymentMethod' && (
                <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 animate-in fade-in duration-150">
                  Select the clearing network for processing this transaction.
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['ACH', 'WIRE', 'SEPA', 'INSTANT'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => updateField('paymentMethod', method)}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all duration-200 ${
                    value.paymentMethod === method
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950/30 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-1.5" />
                  <span className="text-xs font-semibold tracking-wider">{method}</span>
                </button>
              ))}
            </div>
            {errors.paymentMethod && (
              <p className="text-xs text-rose-400 mt-1">{errors.paymentMethod}</p>
            )}
          </div>

          {/* Grid for Charge Bearer & Currency Indicator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Charge Bearer Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  Charge Bearer
                  <button
                    type="button"
                    onMouseEnter={() => setActiveTooltip('chargeBearer')}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </label>
                {activeTooltip === 'chargeBearer' && (
                  <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 animate-in fade-in duration-150">
                    Determines who pays the transaction processing fees.
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {[
                  { id: 'SHA', label: 'Shared (SHA)', desc: 'Fees are shared between sender and recipient.' },
                  { id: 'OUR', label: 'Sender (OUR)', desc: 'You pay all transaction fees.' },
                  { id: 'BEN', label: 'Beneficiary (BEN)', desc: 'Recipient pays all transaction fees.' }
                ].map((bearer) => (
                  <button
                    key={bearer.id}
                    type="button"
                    onClick={() => updateField('chargeBearer', bearer.id as ChargeBearer)}
                    className={`w-full flex items-start p-3 rounded-xl border text-left transition-all duration-200 ${
                      value.chargeBearer === bearer.id
                        ? 'bg-indigo-500/10 border-indigo-500/60 text-indigo-300'
                        : 'bg-slate-950/30 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center h-5 mr-3">
                      <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                        value.chargeBearer === bearer.id ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700'
                      }`}>
                        {value.chargeBearer === bearer.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold block text-slate-200">{bearer.label}</span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">{bearer.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
              {errors.chargeBearer && (
                <p className="text-xs text-rose-400 mt-1">{errors.chargeBearer}</p>
              )}
            </div>

            {/* Currency Indicator Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  Transfer Currency Indicator
                  <button
                    type="button"
                    onMouseEnter={() => setActiveTooltip('currencyIndicator')}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </label>
                {activeTooltip === 'currencyIndicator' && (
                  <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 animate-in fade-in duration-150">
                    Define which currency controls the final settlement amount.
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {[
                  { id: 'SOURCE', label: 'Source Currency', desc: 'The transfer amount is fixed in the sending currency.' },
                  { id: 'DESTINATION', label: 'Destination Currency', desc: 'The recipient receives an exact fixed amount in their currency.' }
                ].map((indicator) => (
                  <button
                    key={indicator.id}
                    type="button"
                    onClick={() => updateField('transferCurrencyIndicator', indicator.id as CurrencyIndicator)}
                    className={`w-full flex items-start p-3 rounded-xl border text-left transition-all duration-200 ${
                      value.transferCurrencyIndicator === indicator.id
                        ? 'bg-indigo-500/10 border-indigo-500/60 text-indigo-300'
                        : 'bg-slate-950/30 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center h-5 mr-3">
                      <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                        value.transferCurrencyIndicator === indicator.id ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700'
                      }`}>
                        {value.transferCurrencyIndicator === indicator.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold block text-slate-200">{indicator.label}</span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">{indicator.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
              {errors.transferCurrencyIndicator && (
                <p className="text-xs text-rose-400 mt-1">{errors.transferCurrencyIndicator}</p>
              )}
            </div>

          </div>

          {/* Informational Footer */}
          <div className="flex items-start gap-3 p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-300">Note on External Transfers:</span> Processing times and final fees are subject to intermediary banking networks and the selected payment method. Ensure all beneficiary details are accurate to prevent delays or rejection fees.
            </div>
          </div>

        </div>
      )}

      {/* Dynamic Fields for Internal Transfer */}
      {value.transferType === 'INTERNAL' && (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-emerald-300">Internal Routing Active:</span> This transaction will bypass external clearing networks. Funds will be credited instantly to the recipient's account upon authorization. No additional fees or charge bearer configurations are required.
          </div>
        </div>
      )}
    </div>
  );
};