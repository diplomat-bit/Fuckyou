import React from 'react';
import { AlertCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

export type IpaErrorCode = 
  | 'applicationRejected' 
  | 'manualReview' 
  | 'insufficientFunds' 
  | 'networkTimeout' 
  | 'invalidCredentials'
  | 'unknown';

interface IpaErrorConfig {
  title: string;
  message: string;
  icon: React.ReactNode;
  variant: 'error' | 'warning' | 'info';
}

const ERROR_MAP: Record<IpaErrorCode, IpaErrorConfig> = {
  applicationRejected: {
    title: 'Application Rejected',
    message: 'Your application has been declined based on current eligibility criteria.',
    icon: <XCircle className="w-5 h-5" />,
    variant: 'error',
  },
  manualReview: {
    title: 'Manual Review Required',
    message: 'Your application is currently under manual review. This may take 24-48 hours.',
    icon: <AlertTriangle className="w-5 h-5" />,
    variant: 'warning',
  },
  insufficientFunds: {
    title: 'Insufficient Funds',
    message: 'The transaction could not be completed due to insufficient account balance.',
    icon: <AlertCircle className="w-5 h-5" />,
    variant: 'error',
  },
  networkTimeout: {
    title: 'Connection Timeout',
    message: 'The server is taking too long to respond. Please check your internet connection.',
    icon: <Info className="w-5 h-5" />,
    variant: 'info',
  },
  invalidCredentials: {
    title: 'Authentication Failed',
    message: 'The credentials provided are invalid. Please verify and try again.',
    icon: <XCircle className="w-5 h-5" />,
    variant: 'error',
  },
  unknown: {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred. Please contact support if the issue persists.',
    icon: <AlertCircle className="w-5 h-5" />,
    variant: 'error',
  },
};

interface IpaErrorHandlingProps {
  code: IpaErrorCode;
  className?: string;
}

export const IpaErrorHandling: React.FC<IpaErrorHandlingProps> = ({ code, className = '' }) => {
  const config = ERROR_MAP[code] || ERROR_MAP.unknown;

  const variantStyles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div 
      className={`flex items-start p-4 border rounded-lg shadow-sm ${variantStyles[config.variant]} ${className}`}
      role="alert"
    >
      <div className="flex-shrink-0 mr-3 mt-0.5">
        {config.icon}
      </div>
      <div>
        <h3 className="font-semibold text-sm">{config.title}</h3>
        <p className="text-sm opacity-90 mt-1">{config.message}</p>
      </div>
    </div>
  );
};