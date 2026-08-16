import React from 'react';

export type SystemStatus = 'operational' | 'degraded' | 'down' | 'maintenance' | 'unknown';

interface SystemStatusIndicatorProps {
  status: SystemStatus;
  label?: string;
  showPulse?: boolean;
}

const statusConfig: Record<SystemStatus, { color: string; text: string }> = {
  operational: { color: 'bg-green-500', text: 'Operational' },
  degraded: { color: 'bg-yellow-500', text: 'Degraded' },
  down: { color: 'bg-red-500', text: 'Down' },
  maintenance: { color: 'bg-blue-500', text: 'Maintenance' },
  unknown: { color: 'bg-gray-500', text: 'Unknown' },
};

export const SystemStatusIndicator: React.FC<SystemStatusIndicatorProps> = ({
  status,
  label,
  showPulse = true,
}) => {
  const config = statusConfig[status] || statusConfig.unknown;

  return (
    <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 w-fit">
      <div className="relative flex h-3 w-3">
        {showPulse && status === 'operational' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-3 w-3 ${config.color}`}></span>
      </div>
      <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">
        {label || config.text}
      </span>
    </div>
  );
};

export default SystemStatusIndicator;