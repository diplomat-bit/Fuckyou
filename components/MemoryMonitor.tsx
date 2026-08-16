import React, { useState, useEffect } from 'react';

interface MemoryStats {
  usedHeapSize: number;
  totalHeapSize: number;
  heapLimit: number;
  percentage: number;
}

const MemoryMonitor: React.FC = () => {
  const [stats, setStats] = useState<MemoryStats>({
    usedHeapSize: 0,
    totalHeapSize: 0,
    heapLimit: 0,
    percentage: 0,
  });

  useEffect(() => {
    const updateMemory = () => {
      if (performance && (performance as any).memory) {
        const mem = (performance as any).memory;
        const used = mem.usedJSHeapSize;
        const limit = mem.jsHeapSizeLimit;
        const percentage = (used / limit) * 100;

        setStats({
          usedHeapSize: used,
          totalHeapSize: mem.totalJSHeapSize,
          heapLimit: limit,
          percentage: percentage,
        });
      }
    };

    const interval = setInterval(updateMemory, 2000);
    updateMemory();

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (percent: number) => {
    if (percent > 90) return 'text-red-500';
    if (percent > 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  const formatBytes = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="p-4 border border-gray-700 rounded-lg bg-gray-900 text-white font-mono text-xs shadow-xl">
      <h3 className="text-sm font-bold mb-2 border-b border-gray-600 pb-1">System Memory Diagnostics</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Heap Usage:</span>
          <span className={getStatusColor(stats.percentage)}>
            {formatBytes(stats.usedHeapSize)} / {formatBytes(stats.heapLimit)}
          </span>
        </div>
        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${stats.percentage > 90 ? 'bg-red-500' : stats.percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(stats.percentage, 100)}%` }}
          />
        </div>
        {stats.percentage > 80 && (
          <div className="text-red-400 animate-pulse text-[10px] mt-1">
            WARNING: High memory pressure detected.
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryMonitor;