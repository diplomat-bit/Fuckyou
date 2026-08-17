import React, { useState, useEffect, useRef } from "react";

// --- Types & Interfaces ---
export type ControlFlowState = "IDLE" | "PREPROCESSING" | "MFA_PENDING" | "EXECUTING" | "COMPLETED" | "FAILED";

export interface LogEntry {
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export interface ControlFlowTrackerProps {
  controlFlowId?: string;
  onStateChange?: (state: ControlFlowState) => void;
  onComplete?: (data: { txHash: string; executionTime: string }) => void;
  autoStart?: boolean;
  interactiveMode?: boolean;
}

// --- Inline SVG Icons for self-containment and high performance ---
const CheckIcon = () => (
  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const LoadingSpinner = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={`${className} animate-spin text-indigo-500`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5 text-amber-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const TerminalIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CpuIcon = () => (
  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

export default function ControlFlowTracker({
  controlFlowId: initialControlFlowId,
  onStateChange,
  onComplete,
  autoStart = true,
  interactiveMode = true,
}: ControlFlowTrackerProps) {
  const [controlFlowId, setControlFlowId] = useState<string>(initialControlFlowId || "");
  const [currentState, setCurrentState] = useState<ControlFlowState>("IDLE");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [mfaCode, setMfaCode] = useState<string>("");
  const [mfaError, setMfaError] = useState<string>("");
  const [executionProgress, setExecutionProgress] = useState<number>(0);
  const [txHash, setTxHash] = useState<string>("");
  const [devMode, setDevMode] = useState<boolean>(false);
  
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Sync external controlFlowId changes
  useEffect(() => {
    if (initialControlFlowId) {
      setControlFlowId(initialControlFlowId);
      if (autoStart) {
        startTracking(initialControlFlowId);
      }
    }
  }, [initialControlFlowId]);

  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange(currentState);
    }
  }, [currentState, onStateChange]);

  const addLog = (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }) + "." + String(new Date().getMilliseconds()).padStart(3, "0");
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const generateMockId = () => {
    const randomId = "cf_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now().toString().slice(-4);
    setControlFlowId(randomId);
    addLog(`Generated new Control Flow Session: ${randomId}`, "info");
  };

  const startTracking = (idToTrack?: string) => {
    const activeId = idToTrack || controlFlowId;
    if (!activeId) {
      addLog("Error: Cannot start tracking without a valid Control Flow ID.", "error");
      return;
    }

    setLogs([]);
    setExecutionProgress(0);
    setTxHash("");
    setMfaCode("");
    setMfaError("");
    
    setCurrentState("PREPROCESSING");
    addLog(`Initializing tracking pipeline for ID: ${activeId}`, "info");
    addLog("Fetching pre-execution payload from Preprocess API...", "info");

    // Step 1: Preprocessing Simulation
    setTimeout(() => {
      addLog("Payload signature verified successfully.", "success");
      addLog("Gas estimation complete: 142,350 units.", "info");
      addLog("Policy Engine: No compliance violations detected.", "success");
      
      // Transition to MFA
      setTimeout(() => {
        setCurrentState("MFA_PENDING");
        addLog("MFA Required: Multi-Factor Authentication challenge generated.", "warning");
        addLog("Awaiting user biometric or TOTP confirmation...", "warning");
      }, 1200);
    }, 1500);
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.trim().length < 6) {
      setMfaError("Invalid code. Must be at least 6 digits.");
      addLog("MFA verification failed: Invalid code format.", "error");
      return;
    }

    setMfaError("");
    addLog("Verifying MFA payload with security coordinator...", "info");
    
    setTimeout(() => {
      addLog("MFA Challenge Solved & Cryptographically Signed.", "success");
      setCurrentState("EXECUTING");
      addLog("Broadcasting transaction payload to execution network...", "info");
      simulateExecution();
    }, 1000);
  };

  const simulateExecution = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setExecutionProgress(progress);
      
      if (progress === 20) {
        addLog("Transaction submitted to mempool. Awaiting inclusion...", "info");
      } else if (progress === 50) {
        addLog("Transaction picked up by validator. Simulating state transitions...", "info");
      } else if (progress === 80) {
        addLog("Block proposed. Writing state changes to ledger...", "info");
      } else if (progress >= 100) {
        clearInterval(interval);
        const mockHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        setTxHash(mockHash);
        setCurrentState("COMPLETED");
        addLog(`Transaction executed successfully! Block Hash: ${mockHash.substring(0, 18)}...`, "success");
        addLog("Control Flow Lifecycle Completed.", "success");
        
        if (onComplete) {
          onComplete({ txHash: mockHash, executionTime: "4.8s" });
        }
      }
    }, 400);
  };

  const resetTracker = () => {
    setCurrentState("IDLE");
    setControlFlowId("");
    setLogs([]);
    setExecutionProgress(0);
    setTxHash("");
    setMfaCode("");
    setMfaError("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-ping" />
            <h2 className="text-lg font-semibold tracking-tight text-white">Control Flow Lifecycle Tracker</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitor and orchestrate Preprocess → MFA → Execution pipelines in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setDevMode(!devMode)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              devMode 
                ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-300" 
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {devMode ? "Hide Dev Inspector" : "Show Dev Inspector"}
          </button>
          {currentState !== "IDLE" && (
            <button
              onClick={resetTracker}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Control Panel / ID Input */}
      {currentState === "IDLE" && (
        <div className="p-8 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-indigo-950/50 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <CpuIcon />
          </div>
          <h3 className="text-base font-medium text-slate-200">No Active Control Flow Session</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Provide an existing `controlFlowId` from your preprocess API or generate a mock session to simulate the lifecycle.
          </p>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter controlFlowId (e.g., cf_8f9a2b...)"
                value={controlFlowId}
                onChange={(e) => setControlFlowId(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
              <button
                onClick={generateMockId}
                className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-all"
              >
                Generate Mock
              </button>
            </div>
            <button
              onClick={() => startTracking()}
              disabled={!controlFlowId}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-800 disabled:cursor-not-allowed text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/10 border border-indigo-500/20"
            >
              Initialize Lifecycle Tracker
            </button>
          </div>
        </div>
      )}

      {/* Active Tracking UI */}
      {currentState !== "IDLE" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-slate-800/60">
          
          {/* Left Panel: Visual Stepper & Interactive Actions */}
          <div className="lg:col-span-7 p-6 bg-slate-950 space-y-6">
            
            {/* Session Info */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Active Session</span>
                <div className="text-sm font-mono text-indigo-400 font-medium mt-0.5">{controlFlowId}</div>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-medium text-slate-300">
                {currentState}
              </div>
            </div>

            {/* Visual Stepper */}
            <div className="space-y-4 relative">
              {/* Vertical connector line */}
              <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-800" />

              {/* Step 1: Preprocess */}
              <div className="flex gap-4 relative items-start">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 z-10 ${
                  currentState === "PREPROCESSING" 
                    ? "bg-indigo-950 border-indigo-500 shadow-lg shadow-indigo-500/10" 
                    : currentState !== "IDLE" && currentState !== "PREPROCESSING"
                    ? "bg-emerald-950/30 border-emerald-500/50"
                    : "bg-slate-900 border-slate-800"
                }`}>
                  {currentState !== "PREPROCESSING" && currentState !== "IDLE" ? (
                    <CheckIcon />
                  ) : currentState === "PREPROCESSING" ? (
                    <LoadingSpinner />
                  ) : (
                    <span className="text-xs font-semibold text-slate-500">01</span>
                  )}
                </div>
                <div className="pt-1">
                  <h4 className={`text-sm font-semibold ${currentState === "PREPROCESSING" ? "text-indigo-400" : "text-slate-200"}`}>
                    1. Preprocess API Analysis
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Validating payload, estimating gas, and checking compliance policies.
                  </p>
                </div>
              </div>

              {/* Step 2: MFA */}
              <div className="flex gap-4 relative items-start">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 z-10 ${
                  currentState === "MFA_PENDING" 
                    ? "bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-500/10" 
                    : currentState === "EXECUTING" || currentState === "COMPLETED"
                    ? "bg-emerald-950/30 border-emerald-500/50"
                    : "bg-slate-900 border-slate-800"
                }`}>
                  {currentState === "EXECUTING" || currentState === "COMPLETED" ? (
                    <CheckIcon />
                  ) : currentState === "MFA_PENDING" ? (
                    <ShieldIcon />
                  ) : (
                    <span className="text-xs font-semibold text-slate-500">02</span>
                  )}
                </div>
                <div className="pt-1">
                  <h4 className={`text-sm font-semibold ${currentState === "MFA_PENDING" ? "text-amber-400 animate-pulse" : "text-slate-200"}`}>
                    2. Multi-Factor Authentication
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cryptographic verification of identity via secure MFA challenge.
                  </p>
                </div>
              </div>

              {/* Step 3: Execution */}
              <div className="flex gap-4 relative items-start">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 z-10 ${
                  currentState === "EXECUTING" 
                    ? "bg-blue-950 border-blue-500 shadow-lg shadow-blue-500/10" 
                    : currentState === "COMPLETED"
                    ? "bg-emerald-950/30 border-emerald-500/50"
                    : "bg-slate-900 border-slate-800"
                }`}>
                  {currentState === "COMPLETED" ? (
                    <CheckIcon />
                  ) : currentState === "EXECUTING" ? (
                    <LoadingSpinner className="w-5 h-5 text-blue-500" />
                  ) : (
                    <span className="text-xs font-semibold text-slate-500">03</span>
                  )}
                </div>
                <div className="pt-1">
                  <h4 className={`text-sm font-semibold ${currentState === "EXECUTING" ? "text-blue-400" : "text-slate-200"}`}>
                    3. On-Chain Execution
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Broadcasting signed payload to network and waiting for block confirmation.
                  </p>
                </div>
              </div>

              {/* Step 4: Completed */}
              <div className="flex gap-4 relative items-start">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 z-10 ${
                  currentState === "COMPLETED" 
                    ? "bg-emerald-950 border-emerald-500 shadow-lg shadow-emerald-500/10" 
                    : "bg-slate-900 border-slate-800"
                }`}>
                  {currentState === "COMPLETED" ? (
                    <CheckIcon />
                  ) : (
                    <span className="text-xs font-semibold text-slate-500">04</span>
                  )}
                </div>
                <div className="pt-1">
                  <h4 className={`text-sm font-semibold ${currentState === "COMPLETED" ? "text-emerald-400" : "text-slate-200"}`}>
                    4. Lifecycle Completed
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Transaction finalized, state updated, and receipts generated.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive MFA Action Panel */}
            {currentState === "MFA_PENDING" && interactiveMode && (
              <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-5 space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <ShieldIcon />
                  <h4 className="text-sm font-semibold text-amber-400">Action Required: Verify Identity</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The preprocess API requires MFA confirmation to authorize this transaction. Enter any 6-digit code to simulate approval.
                </p>
                <form onSubmit={handleMfaSubmit} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-center font-mono tracking-widest text-white focus:outline-none focus:border-amber-500 transition-all"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-xs transition-all"
                    >
                      Approve & Execute
                    </button>
                  </div>
                  {mfaError && <p className="text-[11px] text-red-400">{mfaError}</p>}
                </form>
              </div>
            )}

            {/* Execution Progress Bar */}
            {currentState === "EXECUTING" && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Broadcasting & Confirming...</span>
                  <span className="text-blue-400 font-mono font-semibold">{executionProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${executionProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success Receipt */}
            {currentState === "COMPLETED" && (
              <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-5 space-y-3 animate-fadeIn">
                <h4 className="text-sm font-semibold text-emerald-400">Transaction Receipt</h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-500">Status</span>
                    <span className="text-emerald-400 font-semibold">SUCCESS</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-500">Gas Used</span>
                    <span className="text-slate-300">142,350 units</span>
                  </div>
                  <div className="flex flex-col gap-1 py-1">
                    <span className="text-slate-500">Transaction Hash</span>
                    <span className="text-slate-300 break-all bg-slate-950 p-2 rounded border border-slate-900 text-[10px]">
                      {txHash}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Panel: Real-Time Terminal Logs */}
          <div className="lg:col-span-5 p-6 bg-slate-950 flex flex-col h-[450px] lg:h-auto border-t lg:border-t-0 lg:border-l border-slate-800/60">
            <div className="flex items-center gap-2 mb-3">
              <TerminalIcon />
              <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">System Logs</h3>
            </div>
            
            <div className="flex-1 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 font-mono text-[11px] overflow-y-auto space-y-2.5 shadow-inner">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic text-center pt-12">
                  Awaiting pipeline initialization...
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="leading-relaxed flex items-start gap-2">
                    <span className="text-slate-600 select-none">{log.timestamp}</span>
                    <span className={
                      log.type === "success" ? "text-emerald-400" :
                      log.type === "warning" ? "text-amber-400" :
                      log.type === "error" ? "text-red-400" : "text-slate-300"
                    }>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          </div>

        </div>
      )}

      {/* Developer Inspector Mode */}
      {devMode && (
        <div className="p-6 bg-slate-900 border-t border-slate-800 font-mono text-xs space-y-3">
          <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Developer State Inspector</div>
          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-indigo-300 overflow-x-auto">
            {JSON.stringify({
              controlFlowId,
              currentState,
              executionProgress,
              txHash: txHash || null,
              logsCount: logs.length,
              interactiveMode,
              autoStart
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}