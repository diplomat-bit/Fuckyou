import React, { useState, useMemo } from 'react';

export type TimeRange = '24H' | '7D' | '30D' | '90D' | 'YTD';
export type ChannelFilter = 'ALL' | 'MOBILE_APP' | 'WEB' | 'MERCHANT_POS' | 'PARTNER_API';

interface MetricCardProps {
  title: string;
  value: string;
  delta: string;
  isPositive: boolean;
  subtitle: string;
  icon: React.ReactNode;
}

const IconTrendingUp: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconShieldCheck: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const IconActivity: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconCreditCard: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const IconUsers: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconDownload: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconRefresh: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

export const ChaseAnalyticsPanel: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30D');
  const [selectedChannel, setSelectedChannel] = useState<ChannelFilter>('ALL');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; date: string; enrollments: number; unenrollments: number } | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Mock enrollment trends data
  const trendData = useMemo(() => {
    return [
      { date: 'Day 1', enrollments: 4200, unenrollments: 120, pointsBurned: '14.2M' },
      { date: 'Day 5', enrollments: 5800, unenrollments: 145, pointsBurned: '19.8M' },
      { date: 'Day 10', enrollments: 7100, unenrollments: 190, pointsBurned: '24.1M' },
      { date: 'Day 15', enrollments: 6400, unenrollments: 160, pointsBurned: '22.4M' },
      { date: 'Day 20', enrollments: 8900, unenrollments: 210, pointsBurned: '31.5M' },
      { date: 'Day 25', enrollments: 11200, unenrollments: 280, pointsBurned: '42.0M' },
      { date: 'Day 30', enrollments: 14500, unenrollments: 310, pointsBurned: '56.7M' },
    ];
  }, [timeRange]);

  // Product Distribution data
  const productDistribution = [
    { code: 'SAPPHIRE_RESERVE', name: 'Chase Sapphire Reserve®', share: 38, count: '1.48M', color: '#0060f6', rpc: 'RPC-CSR-994' },
    { code: 'SAPPHIRE_PREFERRED', name: 'Chase Sapphire Preferred®', share: 29, count: '1.13M', color: '#117aca', rpc: 'RPC-CSP-782' },
    { code: 'FREEDOM_UNLIMITED', name: 'Chase Freedom Unlimited®', share: 18, count: '702K', color: '#00a3e0', rpc: 'RPC-CFU-301' },
    { code: 'INK_BUSINESS_PREFERRED', name: 'Ink Business Preferred®', share: 10, count: '390K', color: '#2563eb', rpc: 'RPC-IBP-512' },
    { code: 'JPM_RESERVE', name: 'J.P. Morgan Reserve (Private Bank)', share: 5, count: '195K', color: '#d4af37', rpc: 'RPC-JPM-001' },
  ];

  // Digital Channel Analytics
  const channelData = [
    { channel: 'MOBILE_APP', label: 'Chase Mobile iOS/Android', count: 1845200, percentage: 48, conversionRate: '94.2%', avgLatency: '28ms' },
    { channel: 'WEB', label: 'Chase.com Direct Portal', count: 1153250, percentage: 30, conversionRate: '89.6%', avgLatency: '34ms' },
    { channel: 'PARTNER_API', label: '2-Legged Partner Gateway', count: 615000, percentage: 16, conversionRate: '98.1%', avgLatency: '19ms' },
    { channel: 'MERCHANT_POS', label: 'In-Store Merchant Terminals', count: 230600, percentage: 6, conversionRate: '82.4%', avgLatency: '62ms' },
  ];

  // API Gateway Error Telemetry (409 Business Errors & 500s)
  const errorTelemetry = [
    { code: '601', title: 'Account Not Eligible', description: 'Customer card product does not participate in Rewards Program.', occurrences: 1420, rate: '0.04%' },
    { code: '101', title: 'Account Not Found', description: 'UUID reference mismatch in Partner Card vault lookup.', occurrences: 312, rate: '0.009%' },
    { code: '104', title: 'Enrollment Not Found', description: 'Un-enrollment attempted for non-participating account.', occurrences: 189, rate: '0.005%' },
    { code: '179', title: 'Multiple Accounts Found', description: 'Ambiguous external customer relationship mapping identifier.', occurrences: 45, rate: '0.001%' },
  ];

  // SVG Chart Geometry
  const chartWidth = 720;
  const chartHeight = 240;
  const padding = 40;

  const maxVal = Math.max(...trendData.map((d) => d.enrollments)) * 1.15;
  const minVal = 0;

  const points = trendData.map((d, index) => {
    const x = padding + (index / (trendData.length - 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - ((d.enrollments - minVal) / (maxVal - minVal)) * (chartHeight - padding * 2);
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="w-full bg-[#0a192f] text-slate-100 rounded-2xl border border-slate-800 shadow-2xl p-6 md:p-8 space-y-8 font-sans">
      {/* Top Banner & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <IconCreditCard className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Card Loyalty Pay With Points Analytics
                <span className="text-xs px-2.5 py-0.5 font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                  LIVE CLPWPE v1.0.0
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Enterprise telemetry, enrollment conversion matrix, and reward product distribution.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Pills */}
          <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex items-center">
            {(['24H', '7D', '30D', '90D', 'YTD'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  timeRange === range
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className={`p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-all ${
              isRefreshing ? 'animate-spin text-blue-400' : ''
            }`}
            title="Refresh Real-Time Metrics"
          >
            <IconRefresh className="w-4 h-4" />
          </button>

          <button
            onClick={() => alert('Exporting full Chase CLPWPE audit report (CSV)...')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 transition-all shadow-sm"
          >
            <IconDownload className="w-4 h-4 text-blue-400" />
            <span>Export Audit Log</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Active Enrolled Accounts"
          value="3,912,450"
          delta="+14.8%"
          isPositive={true}
          subtitle="vs. previous period"
          icon={<IconUsers className="w-5 h-5 text-blue-400" />}
        />
        <MetricCard
          title="Auto-Enrollment Yield"
          value="96.42%"
          delta="+2.1%"
          isPositive={true}
          subtitle="Zero-friction API conversion"
          icon={<IconTrendingUp className="w-5 h-5 text-emerald-400" />}
        />
        <MetricCard
          title="Pay with Points Burn"
          value="182.8M pts"
          delta="+28.4%"
          isPositive={true}
          subtitle="Equivalent to $1.82M USD"
          icon={<IconActivity className="w-5 h-5 text-amber-400" />}
        />
        <MetricCard
          title="OAuth 2-Legged Gateway SLA"
          value="99.998%"
          delta="31ms"
          isPositive={true}
          subtitle="Mean authorization latency"
          icon={<IconShieldCheck className="w-5 h-5 text-indigo-400" />}
        />
      </div>

      {/* Charts Section: Interactive Trend Area Chart + Channel Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SVG Interactive Time Series Chart */}
        <div className="lg:col-span-2 bg-slate-900/60 rounded-2xl p-6 border border-slate-800/80 relative flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2">
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Enrollment Velocity & Velocity Curve</h2>
              <p className="text-xs text-slate-400">Daily net account activations through CLPWPE endpoint</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
                Active Enrollments
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
                Un-Enrollment Rate (&lt;0.8%)
              </span>
            </div>
          </div>

          {/* Pure SVG Area Line Chart */}
          <div className="w-full overflow-x-auto relative py-2">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto drop-shadow-[0_10px_20px_rgba(0,96,246,0.15)]"
            >
              <defs>
                <linearGradient id="chaseBlueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0060f6" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#0060f6" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#0060f6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#0060f6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = padding + ratio * (chartHeight - padding * 2);
                return (
                  <line
                    key={i}
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Gradient Fill Area */}
              <path d={areaD} fill="url(#chaseBlueGradient)" />

              {/* Line */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#lineStrokeGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {points.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint?.date === pt.date ? 6 : 4}
                    className="fill-slate-900 stroke-blue-400 transition-all cursor-pointer"
                    strokeWidth="2.5"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}

              {/* Dynamic scrub line if hovered */}
              {hoveredPoint && (
                <line
                  x1={hoveredPoint.x}
                  y1={padding}
                  x2={hoveredPoint.x}
                  y2={chartHeight - padding}
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div
                className="absolute z-20 bg-slate-950/95 border border-blue-500/40 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                  top: `${(hoveredPoint.y / chartHeight) * 100}%`,
                }}
              >
                <div className="font-bold text-white border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between gap-4">
                  <span>{hoveredPoint.date}</span>
                  <span className="text-blue-400">Net +{hoveredPoint.enrollments - hoveredPoint.unenrollments}</span>
                </div>
                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">Enrollments:</span>
                    <span className="font-semibold text-emerald-400">{hoveredPoint.enrollments.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">Un-enrollments:</span>
                    <span className="font-semibold text-rose-400">{hoveredPoint.unenrollments.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">Points Burned:</span>
                    <span className="font-semibold text-amber-300">{hoveredPoint.pointsBurned}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800/50">
            <span>Aggregated across all verified Merchant Reference UUIDs</span>
            <span className="text-blue-400 font-semibold cursor-pointer hover:underline">
              Inspect Raw Trace IDs →
            </span>
          </div>
        </div>

        {/* Digital Channel Mix Breakdown */}
        <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">Channel Analytics</h2>
                <p className="text-xs text-slate-400">Origin headers & conversion performance</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                channel-type
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {channelData.map((item) => {
                const isSelected = selectedChannel === item.channel || selectedChannel === 'ALL';
                return (
                  <div
                    key={item.channel}
                    onClick={() => setSelectedChannel(selectedChannel === item.channel ? 'ALL' : (item.channel as ChannelFilter))}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/40 border-slate-700/80 hover:border-blue-500/50'
                        : 'bg-slate-900/20 border-slate-800/40 opacity-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-slate-200">{item.label}</span>
                      <span className="text-xs font-mono font-semibold text-blue-400">{item.percentage}%</span>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
                      <span>Vol: {item.count.toLocaleString()}</span>
                      <span>Conv: <strong className="text-emerald-400">{item.conversionRate}</strong></span>
                      <span>p99: <strong className="text-slate-300">{item.avgLatency}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-center">
            <span className="text-xs text-slate-400">
              Filter applied: <strong className="text-blue-400">{selectedChannel}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Product Code (RPC) Distribution & Enterprise Business Logic Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Mix Bar Table */}
        <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800/80">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Reward Product Codes (RPC)</h2>
              <p className="text-xs text-slate-400">Distribution of merchantDefinedProductCode in payloads</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">5 Registered RPCs</span>
          </div>

          <div className="mt-5 space-y-3.5">
            {productDistribution.map((prod) => (
              <div
                key={prod.code}
                onMouseEnter={() => setHoveredSlice(prod.code)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`p-3 rounded-xl border transition-all ${
                  hoveredSlice === prod.code
                    ? 'bg-blue-950/30 border-blue-500/50 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-900/40 border-slate-800/70 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: prod.color }}></span>
                    <span className="text-xs font-bold text-slate-100">{prod.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300">{prod.share}% ({prod.count})</span>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${prod.share}%`, backgroundColor: prod.color }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-mono">
                  <span>ENUM: {prod.code}</span>
                  <span>{prod.rpc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Logic Errors & Gateway Health */}
        <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800/80">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">HTTP 409 & Business Reason Codes</h2>
              <p className="text-xs text-slate-400">Strict schema validation & eligibility exception metrics</p>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
              Error Rate &lt;0.05%
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {errorTelemetry.map((err) => (
              <div
                key={err.code}
                className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-rose-500/30 transition-all flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <span className="px-2 py-1 text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-lg">
                    Code {err.code}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{err.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{err.description}</p>
                  </div>
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className="text-xs font-mono font-bold text-slate-200">{err.occurrences}</span>
                  <p className="text-[10px] text-slate-500">rate {err.rate}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3 rounded-xl bg-blue-950/20 border border-blue-800/40 flex items-center justify-between text-xs text-blue-300">
            <span>Looking for 500 / 9116 internal membership delete exceptions?</span>
            <span className="font-bold underline cursor-pointer hover:text-blue-200">View SRE Panel</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<MetricCardProps> = ({ title, value, delta, isPositive, subtitle, icon }) => {
  return (
    <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800/90 shadow-lg hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between text-slate-400 mb-3">
        <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
        <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">{icon}</div>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-extrabold text-white tracking-tight">{value}</span>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
            isPositive
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          {delta}
        </span>
      </div>
      <p className="text-xs text-slate-400 mt-2">{subtitle}</p>
    </div>
  );
};

export default ChaseAnalyticsPanel;