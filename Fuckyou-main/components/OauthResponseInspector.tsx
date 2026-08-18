import React, { useState, useMemo } from "react";
import {
  Check,
  Copy,
  AlertTriangle,
  Info,
  Code,
  Eye,
  BookOpen,
  ShieldCheck,
  Clock,
  Key,
  RefreshCw,
  Layers,
  HelpCircle,
  FileText,
  Terminal
} from "lucide-react";

// --- Types & Interfaces ---

export interface OauthResponseInspectorProps {
  /**
   * The raw JSON string or pre-parsed object representing the OAuth2 response.
   */
  response: string | Record<string, any> | null | undefined;
  /**
   * Optional callback when the user wants to clear or reset the inspector.
   */
  onClear?: () => void;
  /**
   * Optional custom class name for the container.
   */
  className?: string;
}

interface FieldDefinition {
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  type: "credential" | "temporal" | "meta" | "security";
}

// --- OAuth2 Field Dictionary ---
const FIELD_DICTIONARY: Record<string, FieldDefinition> = {
  access_token: {
    label: "Access Token",
    description: "The token used to authenticate requests to the resource server. Keep this secure.",
    icon: Key,
    type: "credential",
  },
  token_type: {
    label: "Token Type",
    description: "The type of token returned (typically 'Bearer'). Dictates how the token is utilized in HTTP headers.",
    icon: Layers,
    type: "meta",
  },
  expires_in: {
    label: "Expires In",
    description: "The lifetime in seconds of the access token. For example, 3600 means the token is valid for 1 hour.",
    icon: Clock,
    type: "temporal",
  },
  refresh_token: {
    label: "Refresh Token",
    description: "A long-lived token used to obtain new access tokens silently without user intervention.",
    icon: RefreshCw,
    type: "credential",
  },
  scope: {
    label: "Scope",
    description: "A space-separated list of permissions granted to the client application.",
    icon: ShieldCheck,
    type: "security",
  },
  id_token: {
    label: "ID Token",
    description: "A JSON Web Token (JWT) containing claims about the identity of the authenticated user (OpenID Connect).",
    icon: FileText,
    type: "credential",
  },
  state: {
    label: "State",
    description: "An opaque value used to maintain state between the request and the callback, preventing CSRF attacks.",
    icon: ShieldCheck,
    type: "security",
  },
  error: {
    label: "Error Code",
    description: "The machine-readable error code identifying the failure reason.",
    icon: AlertTriangle,
    type: "security",
  },
  error_description: {
    label: "Error Description",
    description: "Human-readable ASCII text providing additional information, used to assist the developer.",
    icon: Info,
    type: "meta",
  },
  error_uri: {
    label: "Error URI",
    description: "A URI identifying a human-readable web page with information about the error.",
    icon: HelpCircle,
    type: "meta",
  },
};

// --- OAuth2 Error Code Dictionary ---
const ERROR_DICTIONARY: Record<string, { title: string; explanation: string; resolution: string }> = {
  invalid_request: {
    title: "Invalid Request",
    explanation: "The request is missing a required parameter, includes an unsupported parameter value, repeats a parameter, or is otherwise malformed.",
    resolution: "Check your request parameters (e.g., client_id, redirect_uri, grant_type) for typos, missing fields, or incorrect encoding.",
  },
  invalid_client: {
    title: "Invalid Client",
    explanation: "Client authentication failed (e.g., unknown client, no client authentication included, or unsupported authentication method).",
    resolution: "Verify that the client ID and client secret are correct, and that the authorization server supports the authentication method used.",
  },
  invalid_grant: {
    title: "Invalid Grant",
    explanation: "The provided authorization grant (e.g., authorization code, resource owner credentials) or refresh token is invalid, expired, revoked, or does not match the redirection URI.",
    resolution: "Ensure the authorization code or refresh token hasn't expired or been used already. Verify that the redirect_uri matches the one used in the authorization request.",
  },
  unauthorized_client: {
    title: "Unauthorized Client",
    explanation: "The authenticated client is not authorized to use this authorization grant type.",
    resolution: "Check your client configuration in the identity provider's dashboard. Ensure the grant type (e.g., Authorization Code, Client Credentials) is enabled for this client.",
  },
  unsupported_grant_type: {
    title: "Unsupported Grant Type",
    explanation: "The authorization grant type is not supported by the authorization server.",
    resolution: "Verify that the 'grant_type' parameter is spelled correctly and is supported by the OAuth2 provider's endpoint.",
  },
  invalid_scope: {
    title: "Invalid Scope",
    explanation: "The requested scope is invalid, unknown, malformed, or exceeds the scope granted by the resource owner.",
    resolution: "Check the requested scopes against the provider's documentation. Ensure they are space-separated and that the client has permission to request them.",
  },
  server_error: {
    title: "Server Error",
    explanation: "The authorization server encountered an unexpected condition that prevented it from fulfilling the request.",
    resolution: "This is an issue on the identity provider's side. Retry the request later or check their status page.",
  },
  temporarily_unavailable: {
    title: "Temporarily Unavailable",
    explanation: "The authorization server is currently unable to handle the request due to a temporary overloading or maintenance of the server.",
    resolution: "Retry the request after a short delay.",
  },
};

// --- Helper: Syntax Highlighting for JSON ---
function highlightJson(json: string): string {
  if (!json) return "";
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = "text-amber-500 dark:text-amber-400"; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "text-indigo-600 dark:text-indigo-400 font-semibold"; // key
          } else {
            cls = "text-emerald-600 dark:text-emerald-400 break-all"; // string
          }
        } else if (/true|false/.test(match)) {
          cls = "text-blue-600 dark:text-blue-400"; // boolean
        } else if (/null/.test(match)) {
          cls = "text-gray-500 dark:text-gray-400"; // null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
}

// --- Default Demo Data ---
const DEFAULT_DEMO_RESPONSE = {
  access_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImV4cCI6MTcxOTg3ODQwMH0.signature_here",
  token_type: "Bearer",
  expires_in: 3600,
  refresh_token: "rfr_987654321_xyz_secure_refresh_token",
  scope: "openid profile email read:transactions write:transactions",
  state: "security_state_nonce_998877"
};

export default function OauthResponseInspector({
  response,
  onClear,
  className = "",
}: OauthResponseInspectorProps) {
  const [activeTab, setActiveTab] = useState<"visual" | "raw" | "guide">("visual");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Parse response safely
  const parsedData = useMemo(() => {
    if (!response) {
      return DEFAULT_DEMO_RESPONSE;
    }
    if (typeof response === "string") {
      try {
        return JSON.parse(response);
      } catch (e) {
        return {
          error: "invalid_json",
          error_description: "The response payload could not be parsed as valid JSON.",
          raw_payload: response,
        };
      }
    }
    return response;
  }, [response]);

  const isError = useMemo(() => {
    return !!(parsedData.error || parsedData.error_description);
  }, [parsedData]);

  const formattedJson = useMemo(() => {
    return JSON.stringify(parsedData, null, 2);
  }, [parsedData]);

  // Copy to clipboard helper
  const handleCopy = (text: string, fieldKey: string | "all") => {
    navigator.clipboard.writeText(text);
    if (fieldKey === "all") {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } else {
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Extract error details if applicable
  const errorDetails = useMemo(() => {
    if (!isError) return null;
    const errorCode = String(parsedData.error || "").toLowerCase();
    return ERROR_DICTIONARY[errorCode] || {
      title: "Unknown OAuth2 Error",
      explanation: parsedData.error_description || "An undocumented error occurred during the OAuth2 flow.",
      resolution: "Consult the authorization server's documentation or inspect the network logs for more details.",
    };
  }, [isError, parsedData]);

  return (
    <div className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl overflow-hidden transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${isError ? "bg-rose-500" : "bg-emerald-500"}`} />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
              OAuth 2.0 Response Inspector
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {response ? "Inspecting live response payload" : "Displaying interactive demo response"}
          </p>
        </div>

        {/* Tabs & Actions */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab("visual")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === "visual"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Visual
            </button>
            <button
              onClick={() => setActiveTab("raw")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === "raw"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Raw JSON
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === "guide"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              OAuth Guide
            </button>
          </div>

          {onClear && (
            <button
              onClick={onClear}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 min-h-[380px]">
        {/* Tab 1: Visual Inspector */}
        {activeTab === "visual" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Status Banner */}
            {isError ? (
              <div className="flex items-start gap-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50">
                <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                    OAuth2 Error Detected: {errorDetails?.title}
                  </h4>
                  <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                    {errorDetails?.explanation}
                  </p>
                  {errorDetails?.resolution && (
                    <div className="mt-2 pt-2 border-t border-rose-100 dark:border-rose-900/30">
                      <p className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                        How to resolve:
                      </p>
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                        {errorDetails.resolution}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Successful Access Token Response
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                    The authorization server successfully authenticated the client and issued the requested credentials. You can now use the access token to query protected APIs.
                  </p>
                </div>
              </div>
            )}

            {/* Fields Breakdown */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Response Fields Breakdown
              </h4>
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {Object.entries(parsedData).map(([key, value]) => {
                  const fieldDef = FIELD_DICTIONARY[key];
                  const IconComponent = fieldDef?.icon || HelpCircle;
                  const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);

                  // Determine badge color based on field type
                  let typeBadgeColor = "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300";
                  if (fieldDef?.type === "credential") {
                    typeBadgeColor = "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30";
                  } else if (fieldDef?.type === "security") {
                    typeBadgeColor = "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30";
                  } else if (fieldDef?.type === "temporal") {
                    typeBadgeColor = "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30";
                  }

                  return (
                    <div
                      key={key}
                      className="group relative flex flex-col justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-950/30 hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-all duration-200"
                    >
                      <div>
                        {/* Field Header */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                              {fieldDef?.label || key}
                            </span>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeBadgeColor}`}>
                            {fieldDef?.type || "custom"}
                          </span>
                        </div>

                        {/* Field Description */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                          {fieldDef?.description || "Custom or non-standard OAuth2 response parameter."}
                        </p>
                      </div>

                      {/* Field Value Box */}
                      <div className="relative flex items-center justify-between gap-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 dark:text-slate-300 overflow-hidden">
                        <span className="truncate select-all pr-8">
                          {stringValue}
                        </span>
                        <button
                          onClick={() => handleCopy(stringValue, key)}
                          className="absolute right-2 p-1 rounded-md bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                          title="Copy value"
                        >
                          {copiedField === key ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Raw JSON */}
        {activeTab === "raw" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Terminal className="w-4 h-4" />
                <span>Raw JSON Payload</span>
              </div>
              <button
                onClick={() => handleCopy(formattedJson, "all")}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Payload
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 overflow-x-auto max-h-[450px]">
              <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap break-all">
                <code
                  dangerouslySetInnerHTML={{
                    __html: highlightJson(formattedJson),
                  }}
                />
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: OAuth Guide */}
        {activeTab === "guide" && (
          <div className="space-y-6 animate-fadeIn text-slate-700 dark:text-slate-300">
            <div className="space-y-2">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Understanding OAuth 2.0 Token Responses
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                OAuth 2.0 is an authorization framework that enables applications to obtain limited access to user accounts on an HTTP service. Here is a quick guide to the core concepts of the response payload.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3 p-4 rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-950/30">
                <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  The Access Token Lifecycle
                </h5>
                <p className="text-xs leading-relaxed">
                  The <strong className="text-slate-900 dark:text-slate-100">Access Token</strong> is short-lived (typically 1 hour, indicated by <code className="font-mono text-amber-600 dark:text-amber-400">expires_in</code>). Once expired, the client must request a new one. If a <strong className="text-slate-900 dark:text-slate-100">Refresh Token</strong> is provided, the client can exchange it for a new access token without prompting the user.
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-950/30">
                <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Security Best Practices
                </h5>
                <p className="text-xs leading-relaxed">
                  Never store access tokens or refresh tokens in unencrypted local storage if your app is vulnerable to XSS. Use secure, HTTP-only cookies or in-memory storage. Always validate the <code className="font-mono text-amber-600 dark:text-amber-400">state</code> parameter to prevent Cross-Site Request Forgery (CSRF).
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Common OAuth2 Error Codes Reference
              </h5>
              <div className="divide-y divide-slate-100 dark:divide-slate-900 border border-slate-100 dark:border-slate-900 rounded-xl overflow-hidden">
                {Object.entries(ERROR_DICTIONARY).slice(0, 4).map(([code, details]) => (
                  <div key={code} className="p-4 bg-white dark:bg-slate-950 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded">
                        {code}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        — {details.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {details.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Metadata */}
      <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          <span>Compliant with RFC 6749 (OAuth 2.0 Authorization Framework)</span>
        </div>
        <div>
          <span>Format: JSON (application/json)</span>
        </div>
      </div>
    </div>
  );
}