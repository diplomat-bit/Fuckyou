

// --- CONSOLIDATED FROM: ./components/ui/SimpleCharts.tsx ---

import React, { useState, useMemo } from 'react';

export interface ChartDataItem {
  label: string;
  value: number;
  color?: string;
}

export interface SimpleChartsProps {
  departmentData?: ChartDataItem[];
  purposeData?: ChartDataItem[];
  className?: string;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#ef4444', // rose-500
  '#06b6d4', // cyan-500
  '#ec4899', // pink-500
];

const DEFAULT_DEPARTMENTS: ChartDataItem[] = [
  { label: 'Engineering', value: 45 },
  { label: 'Human Resources', value: 25 },
  { label: 'Legal & Compliance', value: 18 },
  { label: 'Operations', value: 12 },
];

const DEFAULT_PURPOSES: ChartDataItem[] = [
  { label: 'Security Audit', value: 120 },
  { label: 'Employee Onboarding', value: 85 },
  { label: 'Policy Review', value: 64 },
  { label: 'Litigation Hold', value: 42 },
  { label: 'Training & Dev', value: 30 },
];

export const SimpleCharts: React.FC<SimpleChartsProps> = ({
  departmentData = DEFAULT_DEPARTMENTS,
  purposeData = DEFAULT_PURPOSES,
  className = '',
}) => {
  // State for interactive hovers
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Process Department Data (Donut Chart)
  const processedPieData = useMemo(() => {
    const total = departmentData.reduce((sum, item) => sum + item.value, 0);
    let accumulatedPercent = 0;

    return departmentData.map((item, index) => {
      const percent = total > 0 ? (item.value / total) * 100 : 0;
      const startPercent = accumulatedPercent;
      accumulatedPercent += percent;

      return {
        ...item,
        percent,
        startPercent,
        color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      };
    });
  }, [departmentData]);

  const totalPieValue = useMemo(() => {
    return departmentData.reduce((sum, item) => sum + item.value, 0);
  }, [departmentData]);

  // Process Purpose Data (Horizontal Bar Chart)
  const processedBarData = useMemo(() => {
    const maxValue = Math.max(...purposeData.map((item) => item.value), 1);
    return purposeData.map((item, index) => ({
      ...item,
      ratio: item.value / maxValue,
      color: item.color || DEFAULT_COLORS[(index + 2) % DEFAULT_COLORS.length],
    }));
  }, [purposeData]);

  // Donut Chart Math Constants
  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 w-full ${className}`}>
      {/* Donut Chart: Department Distribution */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Department Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Active document retrievals grouped by department
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-6">
          {/* SVG Donut */}
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              {/* Background Circle */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke="#f1f5f9"
                className="dark:stroke-slate-800"
                strokeWidth={strokeWidth}
              />
              {/* Segments */}
              {processedPieData.map((item, index) => {
                const strokeDashoffset =
                  circumference - (item.percent / 100) * circumference;
                const rotation = (item.startPercent / 100) * 360;
                const isHovered = hoveredPieIndex === index;

                return (
                  <circle
                    key={item.label}
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform={`rotate(${rotation} 60 60)`}
                    strokeLinecap="round"
                    className="transition-all duration-300 cursor-pointer origin-center"
                    onMouseEnter={() => setHoveredPieIndex(index)}
                    onMouseLeave={() => setHoveredPieIndex(null)}
                  />
                );
              })}
            </svg>

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {hoveredPieIndex !== null ? (
                <>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[90px]">
                    {processedPieData[hoveredPieIndex].label}
                  </span>
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {processedPieData[hoveredPieIndex].value}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {processedPieData[hoveredPieIndex].percent.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {totalPieValue}
                  </span>
                  <span className="text-[10px] text-slate-400">Requests</span>
                </>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2 w-full sm:w-auto flex-1">
            {processedPieData.map((item, index) => (
              <div
                key={item.label}
                className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                  hoveredPieIndex === index
                    ? 'bg-slate-50 dark:bg-slate-800/50'
                    : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                }`}
                onMouseEnter={() => setHoveredPieIndex(index)}
                onMouseLeave={() => setHoveredPieIndex(null)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                    {item.label}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-2">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Horizontal Bar Chart: Retrieval Purpose */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Retrieval Purpose
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Primary reasons for document access requests
          </p>
        </div>

        <div className="flex flex-col gap-4 my-6">
          {processedBarData.map((item, index) => {
            const isHovered = hoveredBarIndex === index;
            return (
              <div
                key={item.label}
                className="group flex flex-col gap-1.5 cursor-pointer"
                onMouseEnter={() => setHoveredBarIndex(index)}
                onMouseLeave={() => setHoveredBarIndex(null)}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                    {item.label}
                  </span>
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    {item.value}
                  </span>
                </div>

                {/* SVG Bar Container */}
                <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${item.ratio * 100}%`,
                      backgroundColor: item.color,
                      opacity: hoveredBarIndex === null || isHovered ? 1 : 0.6,
                      transform: isHovered ? 'scaleY(1.15)' : 'scaleY(1)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};