import React, { useState } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  HelpCircle, 
  RefreshCw, 
  ArrowRight, 
  LifeBuoy, 
  Edit2, 
  ChevronDown, 
  ChevronUp,
  DollarSign,
  Info
} from 'lucide-react';

// Define the structure of our rich error definitions
interface ErrorDefinition {
  title: string;
  description: string;
  troubleshooting: string[];
  severity: 'warning' | 'error' | 'critical';
  suggestedAction: 'modify_amount' | 'retry_later' | 'contact_support' | 'review_fees' | 'compliance_appeal' | 'none';
}

// Comprehensive mapping of OpenAPI business validation errors
const ERROR_REGISTRY: Record<string, ErrorDefinition> = {
  amountNotEligibleForFASTTransfers: {
    title: 'Amount Ineligible for FAST Transfer',
    description: 'The requested transaction amount exceeds the maximum limit allowed for instant FAST (Fast and Secure Transfers) network routing.',
    troubleshooting: [
      'Reduce the transfer amount to fall within the instant FAST limit (typically up to $200,000 SGD).',
      'Split the transaction into multiple smaller transfers.',
      'Select an alternative transfer method such as GIRO or MEPS (which may take 1-3 business days).'
    ],
    severity: 'warning',
    suggestedAction: 'modify_amount'
  },
  transactionFeesIsHigherThanTransactionAmount: {
    title: 'Transaction Fees Exceed Transfer Amount',
    description: 'The calculated network, gas, or intermediary processing fees for this transaction are higher than the actual amount you are attempting to send.',
    troubleshooting: [
      'Increase the transfer amount to make the transaction economically viable.',
      'Wait for network congestion to decrease, which may lower dynamic transaction fees.',
      'Choose a different funding source or payment rail with lower baseline fees.'
    ],
    severity: 'warning',
    suggestedAction: 'review_fees'
  },
  transactionMissedCutoffTime: {
    title: 'Missed Same-Day Processing Cutoff',
    description: 'This transaction was initiated after the daily clearing network cutoff time. Processing will be delayed until the next business day.',
    troubleshooting: [
      'Proceed with the transaction knowing it will settle on the next business day.',
      'Schedule the transaction to execute automatically early tomorrow morning.',
      'Check if an express/instant processing option is available for an additional fee.'
    ],
    severity: 'warning',
    suggestedAction: 'retry_later'
  },
  transactionRejectedDueToSdnHit: {
    title: 'Security & Compliance Hold',
    description: 'This transaction has been flagged and temporarily suspended by our automated compliance screening system due to potential Specially Designated Nationals (SDN) or sanctions list matches.',
    troubleshooting: [
      'Verify that the recipient\'s legal name and registration details are spelled correctly.',
      'Provide additional supporting documentation (e.g., invoice, identity verification) to clear the false-positive match.',
      'Contact our dedicated compliance operations desk for manual review.'
    ],
    severity: 'critical',
    suggestedAction: 'compliance_appeal'
  },
  insufficientFunds: {
    title: 'Insufficient Available Balance',
    description: 'Your account does not have enough cleared, settled funds to cover both the transaction amount and the associated processing fees.',
    troubleshooting: [
      'Deposit additional funds into your source account.',
      'Wait for pending deposits or incoming transfers to clear completely.',
      'Reduce the transaction amount to match your current available balance.'
    ],
    severity: 'error',
    suggestedAction: 'modify_amount'
  },
  dailyLimitExceeded: {
    title: 'Daily Transaction Limit Reached',
    description: 'This transfer would push your cumulative daily transaction volume past your current security and risk profile limits.',
    troubleshooting: [
      'Request a temporary or permanent daily limit increase through your security settings.',
      'Wait until the daily limit resets (typically at 00:00 UTC / local time).',
      'Coordinate with your account administrator to approve an exception.'
    ],
    severity: 'error',
    suggestedAction: 'contact_support'
  },
  invalidRecipientAccount: {
    title: 'Invalid Recipient Account Details',
    description: 'The receiving bank or routing network rejected the transaction because the account number, routing code, or IBAN format is invalid or inactive.',
    troubleshooting: [
      'Double-check the recipient\'s account number and routing/BIC/SWIFT code for typos.',
      'Confirm with the recipient that their account is active and authorized to receive external transfers.',
      'Ensure the selected currency matches the recipient account\'s native currency.'
    ],
    severity: 'error',
    suggestedAction: 'modify_amount'
  },
  currencyMismatch: {
    title: 'Unsupported Currency Conversion',
    description: 'The requested currency conversion pair is not supported for this specific payment rail or recipient destination.',
    troubleshooting: [
      'Select a standard settlement currency (e.g., USD, EUR, SGD) and let the receiving bank handle conversion.',
      'Verify if your multi-currency wallet has a pre-exchanged balance in the target currency.'
    ],
    severity: 'error',
    suggestedAction: 'modify_amount'
  },
  duplicateTransaction: {
    title: 'Potential Duplicate Transaction Detected',
    description: 'An identical transaction with the same amount, recipient, and reference was processed within the last few minutes. This block prevents accidental double-charging.',
    troubleshooting: [
      'Verify your transaction history to confirm if the previous transfer went through successfully.',
      'Wait at least 5 minutes before attempting the transaction again if you intended to make a separate payment.',
      'Modify the transaction reference or amount slightly if this is indeed a distinct, valid payment.'
    ],
    severity: 'warning',
    suggestedAction: 'retry_later'
  }
};

// Default fallback definition for unmapped or generic errors
const DEFAULT_ERROR_DEFINITION: ErrorDefinition = {
  title: 'Transaction Processing Error',
  description: 'An unexpected business validation rule or system constraint prevented this transaction from completing.',
  troubleshooting: [
    'Review your transaction parameters and try again.',
    'Check our system status page for ongoing network or banking partner outages.',
    'If the issue persists, contact our technical support team with the provided error code.'
  ],
  severity: 'error',
  suggestedAction: 'contact_support'
};

export interface ErrorResponseAlertProps {
  /** The raw error code returned from the API/OpenAPI validation */
  errorCode: string;
  /** Optional raw error message from the server */
  errorMessage?: string;
  /** Optional contextual metadata (e.g., limit amounts, cutoff times, currency) */
  errorDetails?: Record<string, any>;
  /** Callback when user chooses to modify their input parameters */
  onModify?: () => void;
  /** Callback to trigger a retry of the action */
  onRetry?: () => void;
  /** Callback to initiate support/help desk workflows */
  onSupport?: (context: { errorCode: string; details?: any }) => void;
  /** Custom CSS classes to apply to the root container */
  className?: string;
}

export const ErrorResponseAlert: React.FC<ErrorResponseAlertProps> = ({
  errorCode,
  errorMessage,
  errorDetails,
  onModify,
  onRetry,
  onSupport,
  className = ''
}) => {
  const [isTroubleshootingExpanded, setIsTroubleshootingExpanded] = useState(true);

  // Resolve the error definition from registry or fallback
  const errorDef = ERROR_REGISTRY[errorCode] || {
    ...DEFAULT_ERROR_DEFINITION,
    title: errorCode 
      ? errorCode.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) 
      : DEFAULT_ERROR_DEFINITION.title
  };

  // Determine styling based on severity
  const getSeverityStyles = (severity: 'warning' | 'error' | 'critical') => {
    switch (severity) {
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/20',
          border: 'border-amber-200 dark:border-amber-900/50',
          text: 'text-amber-800 dark:text-amber-200',
          subtext: 'text-amber-700 dark:text-amber-300',
          iconColor: 'text-amber-600 dark:text-amber-400',
          icon: AlertTriangle,
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
        };
      case 'critical':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/20',
          border: 'border-rose-300 dark:border-rose-900/50',
          text: 'text-rose-900 dark:text-rose-200',
          subtext: 'text-rose-800 dark:text-rose-300',
          iconColor: 'text-rose-600 dark:text-rose-400',
          icon: ShieldAlert,
          badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
        };
      case 'error':
      default:
        return {
          bg: 'bg-red-50 dark:bg-red-950/20',
          border: 'border-red-200 dark:border-red-900/50',
          text: 'text-red-800 dark:text-red-200',
          subtext: 'text-red-700 dark:text-red-300',
          iconColor: 'text-red-600 dark:text-red-400',
          icon: AlertOctagon,
          badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
        };
    }
  };

  const styles = getSeverityStyles(errorDef.severity);
  const IconComponent = styles.icon;

  return (
    <div 
      className={`rounded-xl border p-5 shadow-sm transition-all duration-200 ${styles.bg} ${styles.border} ${className}`}
      role="alert"
      aria-live="assertive"
    >
      {/* Header Section */}
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg bg-white dark:bg-slate-900 shadow-sm ${styles.iconColor}`}>
          <IconComponent className="h-6 w-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className={`text-base font-semibold tracking-tight ${styles.text}`}>
              {errorDef.title}
            </h3>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-full uppercase tracking-wider ${styles.badge}`}>
              {errorCode || 'UNKNOWN_ERROR'}
            </span>
          </div>
          
          <p className={`text-sm leading-relaxed ${styles.subtext}`}>
            {errorDef.description}
          </p>

          {errorMessage && errorMessage !== errorCode && (
            <div className="mt-2 text-xs font-mono bg-white/50 dark:bg-black/20 p-2 rounded border border-black/5 dark:border-white/5 text-slate-600 dark:text-slate-400 break-all">
              <span className="font-semibold">Server Message:</span> {errorMessage}
            </div>
          )}
        </div>
      </div>

      {/* Contextual Metadata / Details Panel */}
      {errorDetails && Object.keys(errorDetails).length > 0 && (
        <div className="mt-4 ml-12 p-3 rounded-lg bg-white/40 dark:bg-black/10 border border-black/5 dark:border-white/5 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <Info className="h-3.5 w-3.5" />
            <span>Transaction Context</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-slate-600 dark:text-slate-400">
            {Object.entries(errorDetails).map(([key, value]) => (
              <div key={key} className="flex justify-between py-0.5 border-b border-dashed border-black/5 dark:border-white/5">
                <span className="text-slate-500">{key}:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Troubleshooting Accordion */}
      <div className="mt-4 ml-12 border-t border-black/5 dark:border-white/5 pt-3">
        <button
          onClick={() => setIsTroubleshootingExpanded(!isTroubleshootingExpanded)}
          className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          aria-expanded={isTroubleshootingExpanded}
        >
          <span>Troubleshooting & Next Steps</span>
          {isTroubleshootingExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>

        {isTroubleshootingExpanded && (
          <ul className="mt-2 space-y-2">
            {errorDef.troubleshooting.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/80 dark:bg-slate-800 text-xs font-semibold shadow-sm border border-black/5 dark:border-white/5 text-slate-500">
                  {index + 1}
                </span>
                <span className="leading-relaxed pt-0.5">{tip}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Contextual Action Buttons */}
      <div className="mt-5 ml-12 flex flex-wrap items-center gap-2.5">
        {/* Primary Contextual Action */}
        {errorDef.suggestedAction === 'modify_amount' && onModify && (
          <button
            onClick={onModify}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-sm transition-all"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Modify Transaction Details
          </button>
        )}

        {errorDef.suggestedAction === 'review_fees' && onModify && (
          <button
            onClick={onModify}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-sm transition-all"
          >
            <DollarSign className="h-3.5 w-3.5" />
            Adjust Fees or Amount
          </button>
        )}

        {errorDef.suggestedAction === 'retry_later' && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-sm transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry Transaction
          </button>
        )}

        {errorDef.suggestedAction === 'compliance_appeal' && onSupport && (
          <button
            onClick={() => onSupport({ errorCode, details: errorDetails })}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-all"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Submit Compliance Appeal
          </button>
        )}

        {/* Secondary Actions */}
        {onRetry && errorDef.suggestedAction !== 'retry_later' && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </button>
        )}

        {onSupport && errorDef.suggestedAction !== 'compliance_appeal' && (
          <button
            onClick={() => onSupport({ errorCode, details: errorDetails })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            Contact Support
          </button>
        )}
      </div>
    </div>
  );
};