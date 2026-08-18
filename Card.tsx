import React, { useState, useEffect, useRef, useCallback, ReactNode } from 'react';

/**
 * QUANTUM FINANCIAL - ELITE COMPONENT SUITE
 * Component: Card (High-Performance Container)
 * Description: A "Golden Ticket" container designed for the Quantum Financial ecosystem.
 * Features: Audit-ready interactions, glassmorphism, and state-aware transitions.
 */

export type CardVariant = 'default' | 'outline' | 'ghost' | 'interactive' | 'premium' | 'security';

export interface CardHeaderAction {
  id: string;
  icon: React.ReactElement;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  label: string;
  disabled?: boolean;
  isSensitive?: boolean; // Triggers enhanced audit logging
}

export interface CardProps {
  title?: string;
  titleTooltip?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  headerActions?: CardHeaderAction[];
  footerContent?: ReactNode;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
  isLoading?: boolean;
  errorState?: string | null;
  onRetry?: () => void;
  className?: string;
  style?: React.CSSProperties;
  variant?: CardVariant;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  isMetric?: boolean;
  loadingIndicator?: ReactNode;
  showSecurityBadge?: boolean;
}

// Simulated Audit Storage for Global Compliance
const logAuditAction = (action: string, metadata: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[AUDIT_LOG][${timestamp}] Action: ${action}`, metadata);
  // In a real environment, this would push to a secure immutable ledger
};

const getVariantClasses = (variant: CardVariant): string => {
  switch (variant) {
    case 'outline': 
      return 'bg-slate-900/40 border border-slate-700/50 shadow-xl backdrop-blur-md';
    case 'ghost': 
      return 'bg-transparent border-none shadow-none';
    case 'interactive': 
      return 'bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl transition-all duration-500 hover:bg-slate-800/60 hover:border-cyan-500/50 hover:shadow-cyan-500/10 cursor-pointer group';
    case 'premium':
      return 'bg-gradient-to-br from-slate-800/80 to-slate-900/90 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.15)]';
    case 'security':
      return 'bg-slate-900/80 backdrop-blur-2xl border border-emerald-500/30 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.1)]';
    default: 
      return 'bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl';
  }
};

const getPaddingClasses = (padding: string): string => {
    switch(padding) {
        case 'sm': return 'p-4';
        case 'lg': return 'p-10';
        case 'none': return 'p-0';
        default: return 'p-8';
    }
};

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse p-2">
    <div className="flex items-center justify-between">
        <div className="h-7 bg-slate-700/50 rounded-lg w-1/3"></div>
        <div className="h-8 bg-slate-700/50 rounded-full w-8"></div>
    </div>
    <div className="space-y-4">
      <div className="h-4 bg-slate-700/40 rounded-md w-full"></div>
      <div className="h-4 bg-slate-700/40 rounded-md w-11/12"></div>
      <div className="h-4 bg-slate-700/40 rounded-md w-4/5"></div>
    </div>
    <div className="pt-4 flex space-x-3">
      <div className="h-10 bg-slate-700/50 rounded-lg w-24"></div>
      <div className="h-10 bg-slate-700/50 rounded-lg w-24"></div>
    </div>
  </div>
);

const ErrorDisplay: React.FC<{ message: string; onRetry?: () => void; }> = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-red-500/5 border border-red-500/20 rounded-xl">
        <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 animate-pulse"></div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-red-500 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <h4 className="text-xl font-bold text-white tracking-tight">System Alert</h4>
        <p className="text-slate-400 mt-2 mb-6 max-w-sm leading-relaxed">{message}</p>
        {onRetry && (
            <button 
                onClick={onRetry} 
                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-semibold transition-all shadow-lg shadow-red-500/20 active:scale-95"
            >
                Re-initialize Connection
            </button>
        )}
    </div>
);

const CardHeader: React.FC<any> = ({ title, titleTooltip, subtitle, icon, isCollapsible, isCollapsed, toggleCollapse, actions, showSecurityBadge }) => {
  if (!title && !subtitle && (!actions || actions.length === 0) && !isCollapsible && !icon) return null;
  
  return (
    <div className={`flex items-start justify-between ${isCollapsible ? 'cursor-pointer select-none' : 'cursor-default'} mb-6`} onClick={() => isCollapsible && toggleCollapse()}>
      <div className="flex items-center flex-1 pr-4 min-w-0">
        {icon && (
          <div className="mr-4 p-2.5 bg-slate-800/50 rounded-xl border border-slate-700/50 text-cyan-400 group-hover:text-cyan-300 transition-colors">
            {icon}
          </div>
        )}
        <div className="min-w-0">
            {title && (
            <div className="flex items-center">
                <h3 className="text-xl font-bold text-white tracking-tight truncate group-hover:text-cyan-50 transition-colors">{title}</h3>
                {showSecurityBadge && (
                  <span className="ml-2 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest rounded">Encrypted</span>
                )}
                {titleTooltip && (
                  <div className="group/tooltip relative ml-2">
                    <span className="text-slate-500 hover:text-cyan-400 cursor-help transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block w-48 p-2 bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg shadow-2xl z-50">
                      {titleTooltip}
                    </div>
                  </div>
                )}
            </div>
            )}
            {subtitle && <p className="text-sm font-medium text-slate-500 mt-1 truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center space-x-1.5 flex-shrink-0">
        {actions?.map((action: CardHeaderAction) => (
          <button 
            key={action.id} 
            onClick={(e) => {
              e.stopPropagation();
              logAuditAction('HEADER_ACTION_TRIGGERED', { actionId: action.id, label: action.label, sensitive: action.isSensitive });
              action.onClick(e);
            }} 
            aria-label={action.label} 
            disabled={action.disabled} 
            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all disabled:opacity-30"
          >
            {React.cloneElement(action.icon, { className: 'h-5 w-5' })}
          </button>
        ))}
        {isCollapsible && (
          <button 
            onClick={(e) => { e.stopPropagation(); toggleCollapse(); }} 
            className="p-2 text-slate-500 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

const Card: React.FC<CardProps> = ({ 
  title, 
  titleTooltip, 
  subtitle, 
  icon, 
  children, 
  className = '', 
  style, 
  variant = 'default', 
  padding = 'md', 
  headerActions, 
  footerContent, 
  isCollapsible = false, 
  defaultCollapsed = false, 
  isLoading = false, 
  errorState = null, 
  onRetry, 
  loadingIndicator, 
  onClick, 
  isMetric = false,
  showSecurityBadge = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(isCollapsible && defaultCollapsed);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | string>('auto');

  const toggleCollapse = useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    logAuditAction('CARD_COLLAPSE_TOGGLED', { title, newState: newState ? 'collapsed' : 'expanded' });
  }, [isCollapsed, title]);
  
  useEffect(() => {
    if (isCollapsible) {
      if (isCollapsed) setContentHeight(0);
      else {
        const height = contentRef.current?.scrollHeight;
        setContentHeight(height ? `${height}px` : 'auto');
      }
    }
  }, [isCollapsed, isCollapsible, children]);

  const baseClasses = getVariantClasses(variant);
  const paddingClasses = getPaddingClasses(isMetric && padding === 'md' ? 'sm' : padding);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      logAuditAction('CARD_CLICKED', { title, variant });
      onClick(e);
    }
  };

  return (
    <div 
      className={`${baseClasses} ${className} relative overflow-hidden group/card transition-all duration-300` .trim()} 
      style={style} 
      onClick={handleCardClick}
    >
      {/* Premium Accent Glow */}
      {variant === 'premium' && (
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none"></div>
      )}
      
      <div className={`${paddingClasses} ${isMetric ? 'text-center' : ''}`}>
        <CardHeader 
          title={title} 
          titleTooltip={titleTooltip} 
          subtitle={subtitle} 
          icon={icon} 
          isCollapsible={isCollapsible} 
          isCollapsed={isCollapsed} 
          toggleCollapse={toggleCollapse} 
          actions={headerActions}
          showSecurityBadge={showSecurityBadge}
        />
        
        <div className="relative">
            {isLoading ? (
              <div className="py-4">{loadingIndicator || <LoadingSkeleton />}</div>
            ) : errorState ? (
              <div className="py-4"><ErrorDisplay message={errorState} onRetry={onRetry} /></div>
            ) : (
                <div 
                  style={{ height: isCollapsible ? contentHeight : 'auto' }} 
                  className="transition-[height] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden"
                >
                  <div ref={contentRef}>
                     <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                        {children}
                     </div>
                     {footerContent && (
                        <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-between">
                          {footerContent}
                        </div>
                     )}
                  </div>
                </div>
            )}
        </div>
      </div>
      
      {/* Audit Trail Visual Indicator (Subtle) */}
      <div className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent w-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000"></div>
    </div>
  );
};

export default Card;