import React from 'react';

export interface ErrorResponse {
  type: 'error' | 'warn' | 'invalid' | 'fatal';
  code: 'invalidRequest' | 'noAccounts' | 'unAuthorized' | 'accessNotConfigured' | 'serverUnavailable' | string;
  details?: string;
  location?: string;
  moreInfo?: string;
}

export interface ErrorList {
  errors: ErrorResponse[];
}

interface ErrorDisplayProps {
  /**
   * The error object returned from the Citi B2B API, a standard Error, or a string message.
   */
  error?: ErrorList | ErrorResponse | Error | string | null;
  /**
   * Optional custom title for the error card.
   */
  title?: string;
  /**
   * Optional callback function to retry the failed request.
   */
  onRetry?: () => void;
  /**
   * Optional callback function to dismiss or close the error display.
   */
  onClose?: () => void;
}

/**
 * Normalizes various error formats into a standard array of ErrorResponse objects.
 */
const normalizeErrors = (error: any): ErrorResponse[] => {
  if (!error) return [];

  // 1. If it matches the ErrorList structure
  if (error && typeof error === 'object' && 'errors' in error && Array.isArray(error.errors)) {
    return error.errors;
  }

  // 2. If it is a single ErrorResponse object
  if (error && typeof error === 'object' && 'code' in error && 'type' in error) {
    return [error as ErrorResponse];
  }

  // 3. If it is a standard JavaScript Error object
  if (error instanceof Error) {
    return [
      {
        type: 'fatal',
        code: 'serverUnavailable',
        details: error.message,
      },
    ];
  }

  // 4. If it is a string
  if (typeof error === 'string') {
    return [
      {
        type: 'error',
        code: 'invalidRequest',
        details: error,
      },
    ];
  }

  // 5. Fallback for unhandled formats
  return [
    {
      type: 'fatal',
      code: 'unknownError',
      details: 'An unexpected error occurred. Please try again later.',
    },
  ];
};

/**
 * Returns Tailwind CSS classes for the error type badges.
 */
const getTypeBadgeStyles = (type: ErrorResponse['type']): string => {
  switch (type) {
    case 'invalid':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'warn':
      return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    case 'error':
      return 'bg-red-50 text-red-800 border-red-200';
    case 'fatal':
      return 'bg-rose-900 text-rose-50 border-rose-950';
    default:
      return 'bg-slate-50 text-slate-800 border-slate-200';
  }
};

/**
 * ErrorDisplay Component
 * Renders Citi B2B API errors in a highly structured, accessible, and responsive table format.
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title = 'API Request Error',
  onRetry,
  onClose,
}) => {
  const normalizedErrors = normalizeErrors(error);

  if (normalizedErrors.length === 0) {
    return null;
  }

  // Determine overall severity color for the card border/header
  const hasFatal = normalizedErrors.some((e) => e.type === 'fatal');
  const hasError = normalizedErrors.some((e) => e.type === 'error');
  const headerBgColor = hasFatal
    ? 'bg-rose-950 border-rose-900 text-rose-100'
    : hasError
    ? 'bg-red-50 border-red-200 text-red-900'
    : 'bg-amber-50 border-amber-200 text-amber-900';

  return (
    <div className="w-full my-6 overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${headerBgColor}`}>
        <div className="flex items-center space-x-2">
          {/* Warning/Error Icon */}
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <h3 className="text-sm font-semibold tracking-wide uppercase">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          {onRetry && (
            <button
              onClick={onRetry}
              type="button"
              className="px-2.5 py-1 text-xs font-medium bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 rounded shadow-sm transition-colors"
            >
              Retry
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              type="button"
              className="p-1 rounded-full hover:bg-black/5 transition-colors"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Structured Error Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">
                Type
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-48">
                Code
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Details
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-36">
                Location
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">
                More Info
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {normalizedErrors.map((err, index) => (
              <tr key={`${err.code}-${index}`} className="hover:bg-slate-50/50 transition-colors">
                {/* Type Badge */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getTypeBadgeStyles(
                      err.type
                    )}`}
                  >
                    {err.type}
                  </span>
                </td>

                {/* Error Code */}
                <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-slate-700 font-semibold">
                  {err.code}
                </td>

                {/* Human-readable Details */}
                <td className="px-4 py-3.5 text-slate-600 max-w-md">
                  <div className="text-sm leading-relaxed">{err.details || 'No specific details provided.'}</div>
                </td>

                {/* Field/Header Location */}
                <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
                  {err.location ? (
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">{err.location}</span>
                  ) : (
                    <span className="text-slate-400 italic">N/A</span>
                  )}
                </td>

                {/* Documentation Link */}
                <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                  {err.moreInfo ? (
                    <a
                      href={err.moreInfo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    >
                      View Docs
                      <svg
                        className="w-3 h-3 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                        />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ErrorDisplay;