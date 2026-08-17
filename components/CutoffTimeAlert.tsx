import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Info, 
  Zap, 
  AlertCircle,
  Sliders,
  Calendar,
  HelpCircle,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

// Types
type PaymentMethod = 'GIRO' | 'FAST' | 'SWIFT';

interface CutoffConfig {
  name: string;
  fullName: string;
  cutoffTime: string; // HH:MM format (24h)
  processingTime: string;
  fee: string;
  isInstant: boolean;
  alternative: PaymentMethod | null;
  description: string;
}

const CUTOFF_CONFIGS: Record<PaymentMethod, CutoffConfig> = {
  GIRO: {
    name: 'GIRO',
    fullName: 'General Interbank Recurring Order',
    cutoffTime: '15:30', // 3:30 PM
    processingTime: '1-2 Business Days',
    fee: 'Free',
    isInstant: false,
    alternative: 'FAST',
    description: 'Best for non-urgent, high-volume batch payments.'
  },
  SWIFT: {
    name: 'SWIFT',
    fullName: 'Society for Worldwide Interbank Financial Telecommunication',
    cutoffTime: '16:30', // 4:30 PM
    processingTime: '1-3 Business Days',
    fee: '$15.00 - $30.00',
    isInstant: false,
    alternative: 'FAST', // Or custom routing
    description: 'Used for international cross-border wire transfers.'
  },
  FAST: {
    name: 'FAST',
    fullName: 'Fast and Secure Transfers',
    cutoffTime: '23:59', // Virtually 24/7 but let's simulate a midnight settlement cycle or maintenance
    processingTime: 'Instant (Within minutes)',
    fee: '$0.50 or Free',
    isInstant: true,
    alternative: null,
    description: 'Real-time instant interbank transfer up to $200,000.'
  }
};

export default function CutoffTimeAlert() {
  // State
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('GIRO');
  const [systemTime, setSystemTime] = useState<Date>(new Date());
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);
  const [simulatedHour, setSimulatedHour] = useState<number>(14); // Default to 2:00 PM for interesting state
  const [simulatedMinute, setSimulatedMinute] = useState<number>(45); // Default to 45 mins
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // Update real-time clock
  useEffect(() => {
    if (isSimulationMode) return;
    
    const timer = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [isSimulationMode]);

  // Compute active time based on simulation or real system time
  const activeTime = useMemo(() => {
    if (isSimulationMode) {
      const simulatedDate = new Date();
      simulatedDate.setHours(simulatedHour, simulatedMinute, 0, 0);
      return simulatedDate;
    }
    return systemTime;
  }, [isSimulationMode, simulatedHour, simulatedMinute, systemTime]);

  // Calculate countdowns and status for all methods
  const statusData = useMemo(() => {
    const results: Record<PaymentMethod, {
      remainingMs: number;
      hours: number;
      minutes: number;
      seconds: number;
      isPassed: boolean;
      status: 'safe' | 'warning' | 'critical' | 'passed';
      cutoffDate: Date;
    }> = {} as any;

    const currentHours = activeTime.getHours();
    const currentMinutes = activeTime.getMinutes();
    const currentSeconds = activeTime.getSeconds();
    const currentTotalSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;

    (Object.keys(CUTOFF_CONFIGS) as PaymentMethod[]).forEach((method) => {
      const config = CUTOFF_CONFIGS[method];
      const [cutoffH, cutoffM] = config.cutoffTime.split(':').map(Number);
      const cutoffTotalSeconds = cutoffH * 3600 + cutoffM * 60;

      let remainingSeconds = cutoffTotalSeconds - currentTotalSeconds;
      let isPassed = remainingSeconds <= 0;

      // Create concrete cutoff Date object for display
      const cutoffDate = new Date(activeTime);
      cutoffDate.setHours(cutoffH, cutoffM, 0, 0);

      if (isPassed) {
        // If passed, countdown is relative to tomorrow's cutoff
        remainingSeconds = (24 * 3600 - currentTotalSeconds) + cutoffTotalSeconds;
      }

      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;
      const remainingMs = remainingSeconds * 1000;

      // Determine status level
      let status: 'safe' | 'warning' | 'critical' | 'passed' = 'safe';
      if (isPassed) {
        status = 'passed';
      } else if (remainingSeconds <= 15 * 60) { // 15 minutes
        status = 'critical';
      } else if (remainingSeconds <= 60 * 60) { // 1 hour
        status = 'warning';
      }

      results[method] = {
        remainingMs,
        hours,
        minutes,
        seconds,
        isPassed,
        status,
        cutoffDate
      };
    });

    return results;
  }, [activeTime]);

  const currentStatus = statusData[selectedMethod];
  const currentConfig = CUTOFF_CONFIGS[selectedMethod];

  // Format time helper
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  // Format countdown string
  const formatCountdown = (hours: number, minutes: number, seconds: number) => {
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden transition-all duration-300">
      
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 p-6 border-b border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                Smart Routing Active
              </span>
              {isSimulationMode && (
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30 animate-pulse">
                  Simulation Mode
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-400" />
              Bank Cutoff Monitor
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Avoid <code className="text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded text-xs font-mono">transactionMissedCutoffTime</code> errors with real-time tracking.
            </p>
          </div>

          {/* System Time Display */}
          <div className="bg-slate-950/60 backdrop-blur border border-slate-800 rounded-xl p-3 flex items-center gap-4 min-w-[220px]">
            <div className="p-2 bg-slate-900 rounded-lg text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Current Simulated Time</div>
              <div className="text-lg font-mono font-bold text-slate-200">
                {formatTime(activeTime)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Controls Panel */}
      <div className="bg-slate-950/40 border-b border-slate-800/60 p-4 px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-300">Test different times of day:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => setIsSimulationMode(!isSimulationMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isSimulationMode 
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isSimulationMode ? 'Disable Simulation' : 'Enable Simulation'}
          </button>

          {isSimulationMode && (
            <div className="flex items-center gap-3 flex-1 md:flex-none min-w-[240px]">
              <span className="text-xs text-slate-400 font-mono">
                {String(simulatedHour).padStart(2, '0')}:{String(simulatedMinute).padStart(2, '0')}
              </span>
              <input
                type="range"
                min="0"
                max="23"
                value={simulatedHour}
                onChange={(e) => setSimulatedHour(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <input
                type="range"
                min="0"
                max="59"
                value={simulatedMinute}
                onChange={(e) => setSimulatedMinute(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        
        {/* Left Column: Payment Method Selector & Status Cards */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
            Select Payment Method
          </span>
          
          {(Object.keys(CUTOFF_CONFIGS) as PaymentMethod[]).map((method) => {
            const config = CUTOFF_CONFIGS[method];
            const statusInfo = statusData[method];
            const isSelected = selectedMethod === method;

            // Status color mapping
            let statusBorder = 'border-slate-800 hover:border-slate-700';
            let statusBg = 'bg-slate-900/50';
            let badgeColor = 'bg-slate-800 text-slate-400';
            let badgeText = 'Normal';

            if (isSelected) {
              statusBorder = 'border-indigo-500 shadow-lg shadow-indigo-500/5';
              statusBg = 'bg-slate-900';
            }

            if (statusInfo.status === 'critical') {
              badgeColor = 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse';
              badgeText = 'Critical';
              if (isSelected) statusBorder = 'border-rose-500 shadow-lg shadow-rose-500/5';
            } else if (statusInfo.status === 'warning') {
              badgeColor = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
              badgeText = 'Urgent';
              if (isSelected) statusBorder = 'border-amber-500 shadow-lg shadow-amber-500/5';
            } else if (statusInfo.status === 'passed') {
              badgeColor = 'bg-slate-800 text-slate-500';
              badgeText = 'Next Day';
            } else if (config.isInstant) {
              badgeColor = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
              badgeText = 'Instant';
            }

            return (
              <button
                key={method}
                onClick={() => setSelectedMethod(method)}
                className={`w-full text-left p-4 rounded-xl border ${statusBorder} ${statusBg} transition-all duration-200 flex items-center justify-between group`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg transition-colors ${
                    isSelected ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                  }`}>
                    {config.isInstant ? <Zap className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 flex items-center gap-2">
                      {config.name}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>
                        {badgeText}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Cutoff: <span className="font-mono font-semibold text-slate-300">{config.cutoffTime}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Remaining</div>
                  <div className={`text-sm font-mono font-bold ${
                    statusInfo.status === 'critical' ? 'text-rose-400' :
                    statusInfo.status === 'warning' ? 'text-amber-400' :
                    statusInfo.status === 'passed' ? 'text-slate-500' : 'text-emerald-400'
                  }`}>
                    {statusInfo.isPassed ? 'Closed' : `${statusInfo.hours}h ${statusInfo.minutes}m`}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Detailed Countdown & Smart Routing Alert */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Main Countdown Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 relative overflow-hidden flex-1 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{currentConfig.fullName}</h3>
                  <p className="text-xs text-slate-400 mt-1">{currentConfig.description}</p>
                </div>
                <button 
                  onClick={() => setShowInfoModal(true)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>

              {/* Big Countdown Display */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-6 text-center my-6 relative">
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                  {currentStatus.isPassed ? 'Time Until Next Cutoff Cycle' : 'Time Remaining Before Cutoff'}
                </div>
                
                <div className={`text-3xl md:text-4xl font-mono font-black tracking-tight ${
                  currentStatus.status === 'critical' ? 'text-rose-500 animate-pulse' :
                  currentStatus.status === 'warning' ? 'text-amber-400' :
                  currentStatus.status === 'passed' ? 'text-slate-400' : 'text-emerald-400'
                }`}>
                  {formatCountdown(currentStatus.hours, currentStatus.minutes, currentStatus.seconds)}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      currentStatus.status === 'critical' ? 'bg-rose-500' :
                      currentStatus.status === 'warning' ? 'bg-amber-500' :
                      currentStatus.status === 'passed' ? 'bg-slate-600' : 'bg-emerald-500'
                    }`}
                    style={{ 
                      width: currentStatus.isPassed 
                        ? '100%' 
                        : `${Math.max(0, Math.min(100, (currentStatus.remainingMs / (4 * 3600 * 1000)) * 100))}%` 
                    }}
                  />
                </div>

                <div className="flex justify-between items-center mt-3 text-xs text-slate-400">
                  <span>Current: {formatTime(activeTime)}</span>
                  <span className="font-semibold text-slate-300">Cutoff: {currentConfig.cutoffTime}</span>
                </div>
              </div>
            </div>

            {/* Dynamic Alert Banner based on status */}
            <div className="mt-auto">
              {currentStatus.status === 'critical' && (
                <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3">
                  <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-rose-300">Critical Cutoff Warning</h4>
                    <p className="text-xs text-rose-400/90 mt-0.5">
                      This transaction may fail or delay to the next business day. We highly recommend switching to an instant method.
                    </p>
                    {currentConfig.alternative && (
                      <button 
                        onClick={() => setSelectedMethod(currentConfig.alternative as PaymentMethod)}
                        className="mt-3 flex items-center gap-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Switch to {currentConfig.alternative} <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {currentStatus.status === 'warning' && (
                <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                  <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-amber-300">Approaching Cutoff</h4>
                    <p className="text-xs text-amber-400/90 mt-0.5">
                      Cutoff is in less than an hour. Ensure all approvals are completed immediately to avoid processing delays.
                    </p>
                    {currentConfig.alternative && (
                      <button 
                        onClick={() => setSelectedMethod(currentConfig.alternative as PaymentMethod)}
                        className="mt-3 flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Switch to {currentConfig.alternative} <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {currentStatus.status === 'passed' && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
                  <div className="p-1.5 bg-slate-800 text-slate-400 rounded-lg shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-300">Cutoff Time Passed</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Any transaction submitted now will only be processed on the next business day.
                    </p>
                    {currentConfig.alternative && (
                      <button 
                        onClick={() => setSelectedMethod(currentConfig.alternative as PaymentMethod)}
                        className="mt-3 flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Use {currentConfig.alternative} for Instant Settlement <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {currentStatus.status === 'safe' && !currentConfig.isInstant && (
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
                  <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-emerald-400">Safe Window</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      You have plenty of time to submit and approve this transaction before today's cutoff.
                    </p>
                  </div>
                </div>
              )}

              {currentConfig.isInstant && (
                <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-3">
                  <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-indigo-300">Instant Processing Active</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      FAST transfers are processed in real-time 24/7. No cutoff restrictions apply for standard amounts.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Footer Metadata */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Safe Window
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> &lt; 60m Remaining
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse" /> &lt; 15m Remaining
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          Smart Routing saves an average of 14 hours per delayed transaction.
        </div>
      </div>

      {/* Info Modal / Drawer */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <HelpCircle className="text-indigo-400 w-5 h-5" />
              About Bank Cutoff Times
            </h3>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Banks process batch payments (like GIRO and SWIFT) in specific cycles. If a transaction is not fully approved and submitted before the cutoff time, it is held until the next business day's cycle.
            </p>
            <div className="space-y-3 mb-6">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-xs font-bold text-slate-300">GIRO (15:30 SGT)</div>
                <div className="text-xs text-slate-500 mt-0.5">Standard batch processing. Missed cutoffs delay settlement by 24-48 hours.</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-xs font-bold text-slate-300">SWIFT (16:30 SGT)</div>
                <div className="text-xs text-slate-500 mt-0.5">International wire. Missed cutoffs delay global routing networks.</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-xs font-bold text-slate-300">FAST (24/7 Instant)</div>
                <div className="text-xs text-slate-500 mt-0.5">Real-time settlement. Recommended alternative for urgent transfers.</div>
              </div>
            </div>
            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-xl transition-colors text-sm"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}