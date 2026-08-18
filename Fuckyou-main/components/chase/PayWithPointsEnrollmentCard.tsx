"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ShieldCheck,
  CreditCard,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  ChevronRight,
  Lock,
  Layers,
  Key,
  Flame,
  Check,
  Copy,
  ExternalLink,
  Zap,
  Sliders,
  Terminal,
  Info
} from "lucide-react";

// ============================================================================
// Types & Swagger 2.0 Definitions for CLPWPE (Card Loyalty Pay With Points Enrollment)
// ============================================================================

export type MerchantDefinedProductCode =
  | "SAPPHIRE_RESERVE"
  | "JPM_RESERVE"
  | "SAPPHIRE_PREFERRED"
  | "SAPPHIRE_NO_FEE"
  | "INK_BUSINESS_PREFERRED"
  | "INK_PLUS"
  | "INK_BUSINESS_CASH"
  | "INK_CASH"
  | "INK_BUSINESS_UNLIMITED"
  | "FREEDOM_UNLIMITED"
  | "FREEDOM"
  | "FREEDOM_STUDENT"
  | "SLATE";

export type EnrollmentStatusName =
  | "AUTOENROLLED"
  | "ENROLLED"
  | "UN-ENROLLED"
  | "OPTED_OUT"
  | "OPTED_IN"
  | "NOT_ENROLLED";

export type EnrollmentTypeCode = "AUTOENROLL" | "ENROLL";
export type ChannelType = "WEB" | "MOBILE_WEB" | "MOBILE_APP" | "POS_TERMINAL";

export interface TransactionModel {
  merchantDefinedProductCode?: MerchantDefinedProductCode;
}

export interface EnrollmentModel {
  enrollmentStatusName?: EnrollmentStatusName;
  enrollmentStatusDate?: string; // YYYY-MM-DD
}

export interface EnrollmentResponse {
  enrollment?: EnrollmentModel;
  product?: TransactionModel;
}

export interface ChaseApiError {
  errorDescription: string;
  serviceErrorCode?: string;
  externalErrorCode?: string;
  httpStatusCode?: number;
}

export interface RequestAuditLog {
  id: string;
  timestamp: string;
  method: "POST" | "PUT" | "GET";
  endpoint: string;
  headers: Record<string, string>;
  status: number;
  response: EnrollmentResponse | ChaseApiError;
  durationMs: number;
}

export interface PayWithPointsEnrollmentCardProps {
  initialAccountUuid?: string;
  initialExternalAccountId?: string;
  initialProductCode?: MerchantDefinedProductCode;
  initialStatus?: EnrollmentStatusName;
  onEnrollmentChange?: (response: EnrollmentResponse) => void;
  className?: string;
}

// ============================================================================
// Card Metadata & Product Branding Config
// ============================================================================

const PRODUCT_CONFIGS: Record<
  MerchantDefinedProductCode,
  {
    name: string;
    tier: string;
    gradient: string;
    accentColor: string;
    pointMultiplier: string;
    pointsValuation: string;
    cardBg: string;
    textColor: string;
    badgeBg: string;
  }
> = {
  JPM_RESERVE: {
    name: "J.P. Morgan Reserve",
    tier: "Private Banking Palladium",
    gradient: "from-zinc-950 via-neutral-900 to-stone-900",
    accentColor: "#D4AF37",
    pointMultiplier: "3x Points",
    pointsValuation: "1.50¢ / pt on Travel",
    cardBg: "bg-gradient-to-br from-black via-zinc-900 to-stone-900 border-amber-500/30",
    textColor: "text-amber-200",
    badgeBg: "bg-amber-950/80 text-amber-300 border-amber-500/40"
  },
  SAPPHIRE_RESERVE: {
    name: "Chase Sapphire Reserve®",
    tier: "Signature Infinite Rewards",
    gradient: "from-blue-950 via-slate-900 to-indigo-950",
    accentColor: "#38bdf8",
    pointMultiplier: "3x Travel & Dining",
    pointsValuation: "1.50¢ / pt on Pay with Points",
    cardBg: "bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 border-sky-500/30",
    textColor: "text-sky-200",
    badgeBg: "bg-sky-950/80 text-sky-300 border-sky-500/40"
  },
  SAPPHIRE_PREFERRED: {
    name: "Chase Sapphire Preferred®",
    tier: "Premier Travel Rewards",
    gradient: "from-sky-900 via-blue-900 to-slate-900",
    accentColor: "#60a5fa",
    pointMultiplier: "2x Travel & 3x Dining",
    pointsValuation: "1.25¢ / pt on Pay with Points",
    cardBg: "bg-gradient-to-br from-blue-950 via-sky-950 to-slate-900 border-blue-500/30",
    textColor: "text-blue-200",
    badgeBg: "bg-blue-950/80 text-blue-300 border-blue-500/40"
  },
  SAPPHIRE_NO_FEE: {
    name: "Chase Sapphire® Classic",
    tier: "Member Preferred",
    gradient: "from-blue-900 via-slate-800 to-neutral-900",
    accentColor: "#93c5fd",
    pointMultiplier: "2x Dining",
    pointsValuation: "1.00¢ / pt on Pay with Points",
    cardBg: "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-950 border-slate-600/30",
    textColor: "text-slate-200",
    badgeBg: "bg-slate-900 text-slate-300 border-slate-600"
  },
  INK_BUSINESS_PREFERRED: {
    name: "Ink Business Preferred®",
    tier: "Commercial Enterprise",
    gradient: "from-stone-900 via-zinc-850 to-teal-950",
    accentColor: "#2dd4bf",
    pointMultiplier: "3x Business Categories",
    pointsValuation: "1.25¢ / pt on Pay with Points",
    cardBg: "bg-gradient-to-br from-zinc-950 via-teal-950 to-stone-900 border-teal-500/30",
    textColor: "text-teal-200",
    badgeBg: "bg-teal-950/80 text-teal-300 border-teal-500/40"
  },
  INK_PLUS: {
    name: "Ink Plus® Business",
    tier: "Commercial Legacy",
    gradient: "from-zinc-900 via-slate-900 to-emerald-950",
    accentColor: "#34d399",
    pointMultiplier: "5x Telecom & Office",
    pointsValuation: "1.00¢ / pt on Pay with Points",
    cardBg: "bg-gradient-to-br from-zinc-950 via-emerald-950 to-slate-900 border-emerald-500/30",
    textColor: "text-emerald-200",
    badgeBg: "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
  },
  INK_BUSINESS_CASH: {
    name: "Ink Business Cash®",
    tier: "Commercial Rewards",
    gradient: "from-slate-900 via-neutral-900 to-teal-900",
    accentColor: "#14b8a6",
    pointMultiplier: "5% Cash Back Categories",
    pointsValuation: "1.00¢ / pt on Pay with Points",
    cardBg: "bg-gradient-to-br from-slate-950 via-teal-950 to-neutral-900 border-teal-500/30",
    textColor: "text-teal-200",
    badgeBg: "bg-teal-950/80 text-teal-300 border-teal-500/40"
  },
  INK_CASH: {
    name: "Ink Cash® Classic",
    tier: "Commercial Classic",
    gradient: "from-neutral-900 via-slate-850 to-zinc-900",
    accentColor: "#a3e635",
    pointMultiplier: "3% Business Categories",
    pointsValuation: "1.00¢ / pt on Pay with Points",
    cardBg: "bg-gradient-to-br from-zinc-900 via-stone-900 to-slate-950 border-lime-500/30",
    textColor: "text-lime-200",
    badgeBg: "bg-lime-950/80 text-lime-300 border-lime-500/40"
  },
  INK_BUSINESS_UNLIMITED: {
    name: "Ink Business Unlimited®",
    tier: "Commercial Unlimited",
    gradient: "from-stone-900 via-zinc-900 to-slate-950",
    accentColor: "#38bdf8",
    pointMultiplier: "1.5% Unlimited Everything",
    pointsValuation: "1.00¢ / pt on Pay with Points",
    cardBg: "bg-gradient-to-br from-neutral-950 via-zinc-900 to-stone-950 border-sky-500/30",
    textColor: "text-sky-200",
    badgeBg: "bg-sky-950/80 text-sky-300 border-sky-500/40"
  },
  FREEDOM_UNLIMITED: {
    name: "Chase Freedom Unlimited®",
    tier: "Consumer Cash & Points",
    gradient: "from-blue-900 via-cyan-950 to-slate-900",
    accentColor: "#38bdf8",
    pointMultiplier: "1.5% on all purchases + 3% Dining",
    pointsValuation: "1.00¢ / pt on Pay with Points",
    cardBg: "bg-gradient-to-br from-slate-900 via-sky-950 to-blue-950 border-sky-500/30",
    textColor: "text-sky-200",
    badgeBg: "bg-sky-950/80 text-sky-300 border-sky-500/40"
  },
  FREEDOM: {
    name: "Chase Freedom®",
    tier: "Rotating 5% Categories",
    gradient: "from-blue-950 via-slate-900 to-cyan-900",
    accentColor: "#0ea5e9",
    pointMultiplier: "5% Quarterly Bonus",
    pointsValuation: "1.00¢ / pt on Pay with Points",
    cardBg: "bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 border-blue-500/30",
    textColor: "text-cyan-200",
    badgeBg: "bg-cyan-950/80 text-cyan-300 border-cyan-500/40"
  },
  FREEDOM_STUDENT: {
    name: "Chase Freedom® Student",
    tier: "NextGen Builder",
    gradient: "from-indigo-950 via-slate-900 to-blue-900",
    accentColor: "#818cf8",
    pointMultiplier: "1% Cash Back + Good Standing Bonus",
    pointsValuation: "1.00¢ / pt on Pay with Points",
    cardBg: "bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 border-indigo-500/30",
    textColor: "text-indigo-200",
    badgeBg: "bg-indigo-950/80 text-indigo-300 border-indigo-500/40"
  },
  SLATE: {
    name: "Chase Slate Edge℠",
    tier: "Financial Management",
    gradient: "from-slate-800 via-zinc-900 to-stone-900",
    accentColor: "#94a3b8",
    pointMultiplier: "Rate Reduction Benefit",
    pointsValuation: "1.00¢ / pt on Pay with Points",
    cardBg: "bg-gradient-to-br from-slate-900 via-zinc-900 to-stone-950 border-slate-600/30",
    textColor: "text-slate-200",
    badgeBg: "bg-slate-900 text-slate-300 border-slate-600"
  }
};

// ============================================================================
// Helper Utilities
// ============================================================================

function generateTraceId(): string {
  // 128-bit number represented as a 32-character lowercase hex string
  const array = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function generateUuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "7b30c6a5-573e-436f-87ba-1d9c2cf1d5a8";
}

function formatDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ============================================================================
// Main Component
// ============================================================================

export const PayWithPointsEnrollmentCard: React.FC<PayWithPointsEnrollmentCardProps> = ({
  initialAccountUuid = "9c824c13-a447-49d7-8321-dfb5b882da03",
  initialExternalAccountId = "EXT-CHASE-77291-NYC",
  initialProductCode = "SAPPHIRE_RESERVE",
  initialStatus = "NOT_ENROLLED",
  onEnrollmentChange,
  className = ""
}) => {
  // State: API Parameters & Configuration
  const [accountUuid, setAccountUuid] = useState<string>(initialAccountUuid);
  const [externalAccountId, setExternalAccountId] = useState<string>(initialExternalAccountId);
  const [productCode, setProductCode] = useState<MerchantDefinedProductCode>(initialProductCode);
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatusName>(initialStatus);
  const [enrollmentStatusDate, setEnrollmentStatusDate] = useState<string>(formatDate());

  // State: Request Headers & Parameters
  const [enrollmentType, setEnrollmentType] = useState<EnrollmentTypeCode>("ENROLL");
  const [channelType, setChannelType] = useState<ChannelType>("WEB");
  const [bearerToken, setBearerToken] = useState<string>(
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImNwbS1jby1rZXktMTAxIn0.chase.sandbox.token.mock"
  );
  const [additionalAuth2, setAdditionalAuth2] = useState<string>("");

  // State: UI & Operation States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeAction, setActiveAction] = useState<"ENROLL" | "UNENROLL" | "PING" | null>(null);
  const [lastTraceId, setLastTraceId] = useState<string>(generateTraceId());
  const [errorState, setErrorState] = useState<ChaseApiError | null>(null);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);
  const [showInspector, setShowInspector] = useState<boolean>(false);
  const [showConfigDrawer, setShowConfigDrawer] = useState<boolean>(false);
  const [simulatedErrorMode, setSimulatedErrorMode] = useState<string>("NONE");
  const [auditLogs, setAuditLogs] = useState<RequestAuditLog[]>([]);
  const [copiedTrace, setCopiedTrace] = useState<boolean>(false);

  const product = useMemo(() => PRODUCT_CONFIGS[productCode] || PRODUCT_CONFIGS.SAPPHIRE_RESERVE, [productCode]);

  const isEnrolled = useMemo(() => {
    return (
      enrollmentStatus === "ENROLLED" ||
      enrollmentStatus === "AUTOENROLLED" ||
      enrollmentStatus === "OPTED_IN"
    );
  }, [enrollmentStatus]);

  // ============================================================================
  // Simulated CLPWPE API Gateway Handler
  // ============================================================================

  const executeApiCall = useCallback(
    async (
      method: "POST" | "PUT" | "GET",
      targetEnrollmentType: EnrollmentTypeCode = enrollmentType
    ): Promise<EnrollmentResponse> => {
      const traceId = generateTraceId();
      setLastTraceId(traceId);
      setIsLoading(true);
      setErrorState(null);
      setSuccessNotification(null);

      const startTime = performance.now();
      const endpoint =
        method === "GET"
          ? "/ping"
          : `/merchants/programs/pay-with-points/enrollments/${accountUuid}`;

      const headers: Record<string, string> = {
        "trace-id": traceId,
        "external-account-identifier": externalAccountId,
        "enrollment-type-code": targetEnrollmentType,
        "channel-type": channelType,
        authorization: `Bearer ${bearerToken}`
      };

      if (additionalAuth2) {
        headers["authorization2"] = additionalAuth2;
      }

      // Simulate network & OAuth token verification delay
      await new Promise((resolve) => setTimeout(resolve, 850));

      // Check simulated error injections
      let mockError: ChaseApiError | null = null;

      if (simulatedErrorMode === "401_AUTH_FAILURE") {
        mockError = {
          httpStatusCode: 401,
          serviceErrorCode: "OAUTH_TOKEN_EXPIRED",
          externalErrorCode: "INVALID_CUSTOMER_TOKEN",
          errorDescription: "Authorization Failure. Customer Token does not match. Re-authentication required."
        };
      } else if (simulatedErrorMode === "409_601_NOT_ELIGIBLE") {
        mockError = {
          httpStatusCode: 409,
          serviceErrorCode: "601",
          externalErrorCode: "ACCOUNT_INELIGIBLE_FOR_REWARDS",
          errorDescription: "601 : Account is not eligible for Pay with Points program participation."
        };
      } else if (simulatedErrorMode === "409_101_NOT_FOUND") {
        mockError = {
          httpStatusCode: 409,
          serviceErrorCode: "101",
          externalErrorCode: "CARD_ACCOUNT_NOT_FOUND",
          errorDescription: "101 : Account is not found in Firms customer enterprise system."
        };
      } else if (simulatedErrorMode === "409_179_MULTIPLE") {
        mockError = {
          httpStatusCode: 409,
          serviceErrorCode: "179",
          externalErrorCode: "MULTIPLE_ACCOUNTS_CONFLICT",
          errorDescription: "179 : Multiple accounts found for the provided external account identifier."
        };
      } else if (simulatedErrorMode === "503_MAINTENANCE") {
        mockError = {
          httpStatusCode: 503,
          serviceErrorCode: "9102",
          externalErrorCode: "SERVICE_UNAVAILABLE",
          errorDescription: "Service is down for maintenance. 9102/9103: Service is temporarily unavailable. Please try again later."
        };
      }

      const durationMs = Math.round(performance.now() - startTime);

      if (mockError) {
        setIsLoading(false);
        setErrorState(mockError);

        const errorLog: RequestAuditLog = {
          id: generateUuid(),
          timestamp: new Date().toISOString(),
          method,
          endpoint,
          headers,
          status: mockError.httpStatusCode || 500,
          response: mockError,
          durationMs
        };
        setAuditLogs((prev) => [errorLog, ...prev.slice(0, 9)]);
        throw new Error(mockError.errorDescription);
      }

      // Success payload generation
      const newStatus: EnrollmentStatusName =
        method === "PUT"
          ? "UN-ENROLLED"
          : targetEnrollmentType === "AUTOENROLL"
          ? "AUTOENROLLED"
          : "ENROLLED";

      const currentDate = formatDate();
      const responseData: EnrollmentResponse = {
        enrollment: {
          enrollmentStatusName: newStatus,
          enrollmentStatusDate: currentDate
        },
        product: {
          merchantDefinedProductCode: productCode
        }
      };

      setEnrollmentStatus(newStatus);
      setEnrollmentStatusDate(currentDate);
      setIsLoading(false);

      const successLog: RequestAuditLog = {
        id: generateUuid(),
        timestamp: new Date().toISOString(),
        method,
        endpoint,
        headers,
        status: 200,
        response: responseData,
        durationMs
      };
      setAuditLogs((prev) => [successLog, ...prev.slice(0, 9)]);

      if (onEnrollmentChange) {
        onEnrollmentChange(responseData);
      }

      return responseData;
    },
    [
      accountUuid,
      externalAccountId,
      enrollmentType,
      channelType,
      bearerToken,
      additionalAuth2,
      productCode,
      simulatedErrorMode,
      onEnrollmentChange
    ]
  );

  // ============================================================================
  // Action Handlers
  // ============================================================================

  const handleEnroll = async (type: EnrollmentTypeCode) => {
    setActiveAction("ENROLL");
    try {
      await executeApiCall("POST", type);
      setSuccessNotification(
        type === "AUTOENROLL"
          ? "Account auto-enrolled successfully in Chase Pay with Points."
          : "Cardholder successfully enrolled in Pay with Points program."
      );
    } catch {
      // Error handled inside executeApiCall
    } finally {
      setActiveAction(null);
    }
  };

  const handleUnEnroll = async () => {
    setActiveAction("UNENROLL");
    try {
      await executeApiCall("PUT");
      setSuccessNotification("Cardholder successfully un-enrolled from Pay with Points.");
    } catch {
      // Handled
    } finally {
      setActiveAction(null);
    }
  };

  const handlePingHealth = async () => {
    setActiveAction("PING");
    try {
      const traceId = generateTraceId();
      setLastTraceId(traceId);
      setIsLoading(true);
      await new Promise((res) => setTimeout(res, 400));
      setIsLoading(false);
      setSuccessNotification("200 OK — CLPWPE Health check verified operational on api.chase.com.");
    } catch {
      // Handled
    } finally {
      setActiveAction(null);
    }
  };

  const handleCopyTraceId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(lastTraceId);
      setCopiedTrace(true);
      setTimeout(() => setCopiedTrace(false), 2000);
    }
  };

  // Status visual badge styling
  const statusBadgeInfo = useMemo(() => {
    switch (enrollmentStatus) {
      case "ENROLLED":
        return {
          bg: "bg-emerald-950/80 border-emerald-500/50 text-emerald-300",
          icon: CheckCircle2,
          label: "ENROLLED"
        };
      case "AUTOENROLLED":
        return {
          bg: "bg-cyan-950/80 border-cyan-500/50 text-cyan-300",
          icon: Zap,
          label: "AUTO-ENROLLED"
        };
      case "OPTED_IN":
        return {
          bg: "bg-blue-950/80 border-blue-500/50 text-blue-300",
          icon: Check,
          label: "OPTED IN"
        };
      case "OPTED_OUT":
        return {
          bg: "bg-amber-950/80 border-amber-500/50 text-amber-300",
          icon: AlertTriangle,
          label: "OPTED OUT"
        };
      case "UN-ENROLLED":
        return {
          bg: "bg-rose-950/80 border-rose-500/50 text-rose-300",
          icon: XCircle,
          label: "UN-ENROLLED"
        };
      case "NOT_ENROLLED":
      default:
        return {
          bg: "bg-zinc-800/80 border-zinc-600/50 text-zinc-300",
          icon: Clock,
          label: "NOT ENROLLED"
        };
    }
  }, [enrollmentStatus]);

  const StatusIcon = statusBadgeInfo.icon;

  return (
    <div
      className={`relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-neutral-950 border border-slate-800/80 shadow-2xl shadow-blue-950/20 text-slate-100 font-sans ${className}`}
    >
      {/* ==================================================================== */}
      {/* Top Banner & Chase Corporate Identity Header */}
      {/* ==================================================================== */}
      <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Chase Octagon Minimal Logo SVG */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-700 via-sky-600 to-blue-500 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="w-6 h-6 text-white fill-current"
              aria-label="Chase Logo"
            >
              <polygon points="12,12 88,12 88,32 32,32 32,88 12,88" />
              <polygon points="88,88 88,12 68,12 68,68 12,68 12,88" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-white">
                Chase Pay with Points
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                CLPWPE API v1.0.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Rewards & Benefits Solutions • 2-Legged OAuth2 Secured
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Ping health check button */}
          <button
            type="button"
            onClick={handlePingHealth}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/60 rounded-lg transition-colors disabled:opacity-50"
            title="Check /ping health status"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-emerald-400 ${
                activeAction === "PING" ? "animate-spin" : ""
              }`}
            />
            <span>Ping Service</span>
          </button>

          {/* Inspector Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowInspector(!showInspector)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
              showInspector
                ? "bg-sky-500/20 border-sky-500/50 text-sky-300"
                : "bg-slate-800/90 hover:bg-slate-700/90 border-slate-700/60 text-slate-300"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>Trace & Logs ({auditLogs.length})</span>
          </button>

          {/* Config Settings Trigger */}
          <button
            type="button"
            onClick={() => setShowConfigDrawer(!showConfigDrawer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
              showConfigDrawer
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                : "bg-slate-800/90 hover:bg-slate-700/90 border-slate-700/60 text-slate-300"
            }`}
            title="Configure headers and test scenarios"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Sim Sandbox</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* Error & Success Alert Notifications */}
      {/* ==================================================================== */}
      {errorState && (
        <div className="mx-6 mt-4 p-4 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-rose-300 text-sm">
                  API Error HTTP {errorState.httpStatusCode || 400} (
                  {errorState.serviceErrorCode || "SVC_ERR"})
                </span>
                {errorState.externalErrorCode && (
                  <span className="font-mono text-[10px] bg-rose-900/60 px-2 py-0.5 rounded border border-rose-700/50 text-rose-300">
                    {errorState.externalErrorCode}
                  </span>
                )}
              </div>
              <p className="text-rose-200/90 leading-relaxed">
                {errorState.errorDescription}
              </p>
            </div>
            <button
              onClick={() => setErrorState(null)}
              className="text-rose-400 hover:text-rose-200 text-sm p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {successNotification && (
        <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successNotification}</span>
          </div>
          <button
            onClick={() => setSuccessNotification(null)}
            className="text-emerald-400 hover:text-emerald-200 text-sm p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Interactive Main Body */}
      {/* ==================================================================== */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Physical Card Display + Status Badge */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card Visualization */}
          <div
            className={`relative aspect-[1.586/1] w-full rounded-2xl p-5 flex flex-col justify-between overflow-hidden shadow-2xl border transition-all duration-300 ${product.cardBg}`}
          >
            {/* Holographic dynamic gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none opacity-40" />

            {/* Top row: Chip & Contactless icon */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                {/* EMV Smart Chip */}
                <div className="w-10 h-7 rounded bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 p-0.5 shadow-inner border border-amber-600/40 relative overflow-hidden">
                  <div className="w-full h-full border border-amber-900/20 grid grid-cols-3 grid-rows-2 opacity-60">
                    <div className="border-r border-b border-amber-900/40" />
                    <div className="border-r border-b border-amber-900/40" />
                    <div className="border-b border-amber-900/40" />
                    <div className="border-r border-amber-900/40" />
                    <div className="border-r border-amber-900/40" />
                    <div />
                  </div>
                </div>

                {/* NFC Contactless waves */}
                <svg
                  className="w-5 h-5 text-slate-300/80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M8.5 10a4 4 0 0 1 0 4" />
                  <path d="M12 7a8 8 0 0 1 0 10" />
                  <path d="M15.5 4a12 12 0 0 1 0 16" />
                </svg>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 block">
                  Reward Product Code
                </span>
                <span className="text-xs font-bold tracking-tight text-white">
                  {productCode}
                </span>
              </div>
            </div>

            {/* Middle: Masked Account Number & Cardholder Name */}
            <div className="z-10 my-2">
              <p className="text-sm font-mono tracking-widest text-slate-200 drop-shadow">
                •••• •••• •••• 8842
              </p>
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                <span>{product.name}</span>
                <span>EXP 09/29</span>
              </div>
            </div>

            {/* Bottom Row: Program Points Rate & Chase Branding */}
            <div className="flex items-end justify-between z-10 pt-2 border-t border-white/10">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Program Benefit
                </span>
                <span className="text-xs font-bold text-sky-300">
                  {product.pointMultiplier}
                </span>
              </div>

              <div className="text-right">
                <span className="text-base font-bold tracking-widest text-white font-serif">
                  CHASE
                </span>
              </div>
            </div>
          </div>

          {/* Status & Last Updated Metadata Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                Participation Status
              </span>
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadgeInfo.bg}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                <span>{statusBadgeInfo.label}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                Status Modified
              </span>
              <span className="font-mono text-slate-200 font-medium">
                {enrollmentStatusDate}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Points Value
              </span>
              <span className="text-slate-200 font-medium">
                {product.pointsValuation}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Enrollment Action Hub */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Action Banner */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  Pay with Points Program Enrollment
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Allows Chase cardholders to seamlessly spend Ultimate Rewards®
                  points at merchant checkout. Manage customer authorization
                  lifecycle and self-enrollment state.
                </p>
              </div>
            </div>

            {/* Quick Action Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Button: Standard Self-Enroll */}
              <button
                type="button"
                onClick={() => handleEnroll("ENROLL")}
                disabled={isLoading}
                className="group relative flex flex-col items-start p-3.5 rounded-xl bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:scale-[0.98] border border-blue-400/30 text-white shadow-lg shadow-blue-900/30 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-100 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                    Self-Enroll
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-xs text-blue-100/80 text-left">
                  Initiate POST with <code className="font-mono text-[10px] bg-blue-900/50 px-1 py-0.5 rounded">ENROLL</code>
                </span>
              </button>

              {/* Button: Auto-Enroll */}
              <button
                type="button"
                onClick={() => handleEnroll("AUTOENROLL")}
                disabled={isLoading}
                className="group relative flex flex-col items-start p-3.5 rounded-xl bg-gradient-to-b from-slate-800 to-slate-850 hover:bg-slate-750 active:scale-[0.98] border border-slate-700 text-slate-100 shadow-md transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-sky-400" />
                    Auto-Enroll
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-xs text-slate-400 text-left">
                  Simulate instant partner onboarding flow
                </span>
              </button>
            </div>

            {/* Secondary Option: Un-Enroll */}
            {isEnrolled && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Cardholder requests program opt-out or removal?
                </span>
                <button
                  type="button"
                  onClick={handleUnEnroll}
                  disabled={isLoading}
                  className="px-3.5 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 active:scale-[0.98] border border-rose-500/40 rounded-lg transition-all disabled:opacity-50"
                >
                  {isLoading && activeAction === "UNENROLL" ? (
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Un-enrolling...
                    </span>
                  ) : (
                    "Un-Enroll (PUT Request)"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Identifier Badges & Verification Parameters */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Account Identifier UUID (Path Param)
              </span>
              <button
                type="button"
                onClick={() => setAccountUuid(generateUuid())}
                className="text-[11px] text-sky-400 hover:text-sky-300 font-mono underline"
              >
                Regen UUID
              </button>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 font-mono text-[11px] text-sky-300 flex items-center justify-between break-all">
              <span>{accountUuid}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(accountUuid);
                }}
                className="p-1 text-slate-500 hover:text-slate-300 ml-2"
                title="Copy Account UUID"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  External Account ID
                </label>
                <input
                  type="text"
                  value={externalAccountId}
                  onChange={(e) => setExternalAccountId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Channel Type Header
                </label>
                <select
                  value={channelType}
                  onChange={(e) => setChannelType(e.target.value as ChannelType)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="WEB">WEB</option>
                  <option value="MOBILE_WEB">MOBILE_WEB</option>
                  <option value="MOBILE_APP">MOBILE_APP</option>
                  <option value="POS_TERMINAL">POS_TERMINAL</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* Simulation Sandbox Drawer (Headers, Error Injections, Product Switch) */}
      {/* ==================================================================== */}
      {showConfigDrawer && (
        <div className="p-6 border-t border-slate-800 bg-slate-950/90 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              API Sandbox Simulator & Error Injection Controls
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              Base Path: /card/loyalty/earn-rewards/enrollment/v1
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Product Switcher */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Reward Product Code (RPC)
              </label>
              <select
                value={productCode}
                onChange={(e) =>
                  setProductCode(e.target.value as MerchantDefinedProductCode)
                }
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {Object.keys(PRODUCT_CONFIGS).map((code) => (
                  <option key={code} value={code}>
                    {code} ({PRODUCT_CONFIGS[code as MerchantDefinedProductCode].name})
                  </option>
                ))}
              </select>
            </div>

            {/* Error Injection Switcher */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Simulated Gateway Response
              </label>
              <select
                value={simulatedErrorMode}
                onChange={(e) => setSimulatedErrorMode(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300 focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="NONE">200 OK — Normal Success Flow</option>
                <option value="401_AUTH_FAILURE">401 — OAuth Token Expired</option>
                <option value="409_601_NOT_ELIGIBLE">409 Code 601 — Account Not Eligible</option>
                <option value="409_101_NOT_FOUND">409 Code 101 — Account Not Found</option>
                <option value="409_179_MULTIPLE">409 Code 179 — Multiple Accounts Found</option>
                <option value="503_MAINTENANCE">503 Code 9102 — Maintenance Outage</option>
              </select>
            </div>

            {/* Default Enrollment Type Code */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Default enrollment-type-code Header
              </label>
              <select
                value={enrollmentType}
                onChange={(e) =>
                  setEnrollmentType(e.target.value as EnrollmentTypeCode)
                }
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ENROLL">ENROLL (Self-Enrollment Flow)</option>
                <option value="AUTOENROLL">AUTOENROLL (Automated Merchant Flow)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                OAuth2 Bearer Token (Authorization Header)
              </label>
              <input
                type="text"
                value={bearerToken}
                onChange={(e) => setBearerToken(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                authorization2 Header (Optional 3-Legged Extension)
              </label>
              <input
                type="text"
                placeholder="Optional secondary signature hash"
                value={additionalAuth2}
                onChange={(e) => setAdditionalAuth2(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Trace Inspector & Audit Log Drawer */}
      {/* ==================================================================== */}
      {showInspector && (
        <div className="p-6 border-t border-slate-800 bg-slate-950/95 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">
                CLPWPE Wire Inspection & Audit Log
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400">
                Active Trace ID:
              </span>
              <button
                type="button"
                onClick={handleCopyTraceId}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[10px] text-sky-300 hover:text-sky-200 transition-colors"
                title="Copy 128-bit hex trace ID"
              >
                <span>{lastTraceId}</span>
                {copiedTrace ? (
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                ) : (
                  <Copy className="w-2.5 h-2.5 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {auditLogs.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
              <Info className="w-6 h-6 text-slate-600" />
              <span>No transactions recorded in this session. Trigger an action above to capture payloads.</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.method === "POST"
                            ? "bg-blue-900/80 text-blue-300 border border-blue-700"
                            : log.method === "PUT"
                            ? "bg-amber-900/80 text-amber-300 border border-amber-700"
                            : "bg-emerald-900/80 text-emerald-300 border border-emerald-700"
                        }`}
                      >
                        {log.method}
                      </span>
                      <span
                        className={`font-semibold ${
                          log.status === 200
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {log.status} {log.status === 200 ? "OK" : "ERROR"}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        {log.endpoint}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{log.durationMs}ms</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800/80 overflow-x-auto">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                        Request Headers
                      </span>
                      <pre className="text-slate-300 text-[10px] leading-tight">
                        {JSON.stringify(log.headers, null, 2)}
                      </pre>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800/80 overflow-x-auto">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                        Response Payload
                      </span>
                      <pre className="text-sky-300 text-[10px] leading-tight">
                        {JSON.stringify(log.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* Footer Branding & Security Badges */}
      {/* ==================================================================== */}
      <div className="px-6 py-3.5 bg-slate-950/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            2-Legged OAuth2 Active
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            PCI DSS Tier-1 Compliant
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-500">
            api.chase.com
          </span>
          <a
            href="https://developer.chase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
          >
            <span>Documentation</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PayWithPointsEnrollmentCard;