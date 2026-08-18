import React, { useState, useEffect, useCallback } from "react";
import {
  Key,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Send,
  ShieldCheck,
  ShieldAlert,
  Info,
  Sliders,
  Terminal,
  Lock,
  Unlock
} from "lucide-react";

// --- Cryptographic & Encoding Helpers using Web Crypto API ---

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function stringToBase64Url(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

interface JwkKeys {
  privateJwk: JsonWebKey | null;
  publicJwk: JsonWebKey | null;
  rawKeyPair: CryptoKeyPair | null;
}

export default function JwsSignatureGenerator() {
  // --- State Management ---
  const [keys, setKeys] = useState<JwkKeys>({
    privateJwk: null,
    publicJwk: null,
    rawKeyPair: null,
  });
  const [keyLoading, setKeyLoading] = useState<boolean>(false);
  const [keyId, setKeyId] = useState<string>("partner-key-2026");
  
  const [payload, setPayload] = useState<string>(
    JSON.stringify(
      {
        transaction_id: "tx_9823401923",
        amount: 1500.0,
        currency: "USD",
        recipient_account: "acc_8829102",
        timestamp: new Date().toISOString(),
      },
      null,
      2
    )
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  // JWS Header State
  const [headerAlg] = useState<string>("RS256");
  
  // Tamper / Simulation Options
  const [tamperType, setTamperType] = useState<"none" | "payload" | "signature" | "wrong_key">("none");
  const [tamperedPayload, setTamperedPayload] = useState<string>("");
  
  // Generated Outputs
  const [jwsHeader, setJwsHeader] = useState<string>("");
  const [jwsPayload, setJwsPayload] = useState<string>("");
  const [jwsSignature, setJwsSignature] = useState<string>("");
  const [fullJws, setFullJws] = useState<string>("");
  const [signingInput, setSigningInput] = useState<string>("");
  
  // Verification Sandbox State
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    logs: string[];
    error?: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // UI States
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sandbox" | "keys" | "logs">("sandbox");

  // --- Generate RSA Key Pair ---
  const generateNewKeyPair = useCallback(async () => {
    setKeyLoading(true);
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSASSA-PKCS1-v1_5",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: { name: "SHA-256" },
        },
        true,
        ["sign", "verify"]
      );

      const privateJwk = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);
      const publicJwk = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);

      setKeys({
        privateJwk,
        publicJwk,
        rawKeyPair: keyPair,
      });
    } catch (err) {
      console.error("Error generating key pair:", err);
    } finally {
      setKeyLoading(false);
    }
  }, []);

  // Initialize keys on mount
  useEffect(() => {
    generateNewKeyPair();
  }, [generateNewKeyPair]);

  // Validate JSON payload in real-time
  useEffect(() => {
    try {
      JSON.parse(payload);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message);
    }
  }, [payload]);

  // --- Generate JWS Signature ---
  const generateJws = useCallback(async () => {
    if (!keys.rawKeyPair || jsonError) return;

    try {
      // 1. Construct JWS Protected Header
      const headerObj = {
        alg: headerAlg,
        kid: keyId,
        typ: "JOSE",
      };
      const headerStr = JSON.stringify(headerObj);
      const headerB64 = stringToBase64Url(headerStr);
      setJwsHeader(headerB64);

      // 2. Construct Payload
      const payloadB64 = stringToBase64Url(payload);
      setJwsPayload(payloadB64);

      // 3. Create Signing Input
      const input = `${headerB64}.${payloadB64}`;
      setSigningInput(input);

      // 4. Sign the input using Private Key
      const encoder = new TextEncoder();
      const inputBuffer = encoder.encode(input);
      
      let signingKey = keys.rawKeyPair.privateKey;

      // If "wrong_key" tamper is selected, generate a temporary key to sign with
      if (tamperType === "wrong_key") {
        const tempKeyPair = await window.crypto.subtle.generateKey(
          {
            name: "RSASSA-PKCS1-v1_5",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: { name: "SHA-256" },
          },
          true,
          ["sign"]
        );
        signingKey = tempKeyPair.privateKey;
      }

      const signatureBuffer = await window.crypto.subtle.sign(
        { name: "RSASSA-PKCS1-v1_5" },
        signingKey,
        inputBuffer
      );

      let signatureB64 = arrayBufferToBase64Url(signatureBuffer);

      // Apply other tamper types
      let finalPayloadB64 = payloadB64;
      if (tamperType === "payload") {
        // Modify the payload content after signing
        const tamperedObj = JSON.parse(payload);
        tamperedObj.amount = tamperedObj.amount + 10000; // Maliciously increase amount
        tamperedObj.recipient_account = "acc_evil_hacker";
        const tamperedStr = JSON.stringify(tamperedObj, null, 2);
        setTamperedPayload(tamperedStr);
        finalPayloadB64 = stringToBase64Url(tamperedStr);
      } else {
        setTamperedPayload("");
      }

      if (tamperType === "signature") {
        // Corrupt the signature string by replacing some characters
        signatureB64 = signatureB64.substring(0, 10) + "XyZ_TAMPERED_" + signatureB64.substring(25);
      }

      setJwsSignature(signatureB64);
      setFullJws(`${headerB64}.${finalPayloadB64}.${signatureB64}`);
    } catch (err) {
      console.error("Error generating JWS:", err);
    }
  }, [keys, payload, jsonError, headerAlg, keyId, tamperType]);

  // Re-generate JWS when inputs or tamper settings change
  useEffect(() => {
    generateJws();
  }, [generateJws]);

  // --- Verify JWS Signature (Simulated API Gateway Validation) ---
  const handleVerifySignature = async () => {
    if (!keys.rawKeyPair || !keys.publicJwk) return;
    setIsVerifying(true);
    setVerificationResult(null);

    const logs: string[] = [];
    logs.push("📥 API Gateway: Received request with 'x-jws-signature' header.");
    
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Parse JWS
      const parts = fullJws.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWS format. Expected 3 dot-separated segments.");
      }

      const [headerPart, payloadPart, signaturePart] = parts;
      logs.push("🔍 Parsing JWS Compact Serialization segments...");
      logs.push(`   - Header Segment: ${headerPart.substring(0, 15)}...`);
      logs.push(`   - Payload Segment: ${payloadPart.substring(0, 15)}...`);
      logs.push(`   - Signature Segment: ${signaturePart.substring(0, 15)}...`);

      // Decode Header to find Key ID
      const decodedHeader = atob(headerPart.replace(/-/g, "+").replace(/_/g, "/"));
      const headerObj = JSON.parse(decodedHeader);
      logs.push(`⚙️ Decoded Header: ${decodedHeader}`);

      if (headerObj.kid !== keyId) {
        logs.push(`❌ Verification Failed: Key ID '${headerObj.kid}' does not match registered partner key ID '${keyId}'.`);
        setVerificationResult({
          verified: false,
          logs,
          error: "401 Unauthorized: Unknown Key ID (kid)",
        });
        setIsVerifying(false);
        return;
      }

      logs.push(`🔑 Matching public key found for kid: '${headerObj.kid}'`);

      // Reconstruct signing input
      const verificationInput = `${headerPart}.${payloadPart}`;
      const encoder = new TextEncoder();
      const inputBuffer = encoder.encode(verificationInput);
      const signatureBuffer = base64UrlToArrayBuffer(signaturePart);

      logs.push("🛡️ Verifying cryptographic signature using Partner Public JWK...");

      // Import public key for verification
      const publicKey = await window.crypto.subtle.importKey(
        "jwk",
        keys.publicJwk,
        {
          name: "RSASSA-PKCS1-v1_5",
          hash: { name: "SHA-256" },
        },
        false,
        ["verify"]
      );

      const isValid = await window.crypto.subtle.verify(
        { name: "RSASSA-PKCS1-v1_5" },
        publicKey,
        signatureBuffer,
        inputBuffer
      );

      if (isValid) {
        logs.push("✅ Cryptographic signature is VALID.");
        const decodedPayload = atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"));
        logs.push(`📦 Decoded Payload: ${decodedPayload}`);
        setVerificationResult({
          verified: true,
          logs,
        });
      } else {
        logs.push("❌ Cryptographic signature verification FAILED. The payload or signature has been altered.");
        setVerificationResult({
          verified: false,
          logs,
          error: "401 Unauthorized: Signature Verification Failed (Tampered Payload/Signature)",
        });
      }
    } catch (err: any) {
      logs.push(`💥 Error during verification: ${err.message}`);
      setVerificationResult({
        verified: false,
        logs,
        error: `400 Bad Request: ${err.message}`,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // --- Copy to Clipboard Helper ---
  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 border-b border-slate-800 pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm tracking-wider uppercase">
              <ShieldCheck className="w-5 h-5" />
              Developer Sandbox Utility
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">
              x-jws-signature Generator &amp; Validator
            </h1>
            <p className="text-slate-400 mt-2 max-w-3xl text-sm md:text-base">
              Simulate and test JSON Web Signature (JWS) header generation for secure API integrations. 
              Sign payloads with a partner JWK, inject faults to test error handling, and verify signatures in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={generateNewKeyPair}
              disabled={keyLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${keyLoading ? "animate-spin" : ""}`} />
              Rotate JWK Keys
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Configuration & Payload Editor (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab("sandbox")}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 ${
                activeTab === "sandbox"
                  ? "border-indigo-500 text-indigo-400 bg-indigo-950/20"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sliders className="w-4 h-4" />
              Sandbox Console
            </button>
            <button
              onClick={() => setActiveTab("keys")}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 ${
                activeTab === "keys"
                  ? "border-indigo-500 text-indigo-400 bg-indigo-950/20"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Key className="w-4 h-4" />
              Active JWK Keys
            </button>
          </div>

          {activeTab === "sandbox" && (
            <>
              {/* Step 1: Payload Configuration */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-900/50 text-indigo-400 text-xs font-bold border border-indigo-800">
                      1
                    </span>
                    <h2 className="text-lg font-semibold text-white">JSON Payload Editor</h2>
                  </div>
                  {jsonError ? (
                    <span className="text-xs bg-red-950/50 text-red-400 border border-red-900 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Invalid JSON
                    </span>
                  ) : (
                    <span className="text-xs bg-emerald-950/50 text-emerald-400 border border-emerald-900 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Valid JSON
                    </span>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    className="w-full h-64 bg-slate-950 text-emerald-400 font-mono text-sm p-4 rounded-lg border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 resize-y"
                    placeholder="Enter JSON payload to sign..."
                  />
                </div>
                {jsonError && (
                  <p className="text-xs text-red-400 mt-2 font-mono bg-red-950/20 p-2 rounded border border-red-900/30">
                    {jsonError}
                  </p>
                )}
              </div>

              {/* Step 2: Signature Settings & Tampering */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-900/50 text-indigo-400 text-xs font-bold border border-indigo-800">
                    2
                  </span>
                  <h2 className="text-lg font-semibold text-white">Signature Settings &amp; Fault Injection</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Key Identifier (kid)
                    </label>
                    <input
                      type="text"
                      value={keyId}
                      onChange={(e) => setKeyId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Algorithm (alg)
                    </label>
                    <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-400 flex items-center justify-between">
                      <span>RS256 (RSA-SHA256)</span>
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>
                </div>

                {/* Fault Injection / Tamper Options */}
                <div className="mt-6 pt-6 border-t border-slate-800">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Simulate API Attack / Fault Scenarios
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setTamperType("none")}
                      className={`p-3 rounded-lg border text-left transition-all duration-200 flex items-start gap-3 ${
                        tamperType === "none"
                          ? "bg-indigo-950/30 border-indigo-500 text-indigo-300"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="mt-0.5">
                        <CheckCircle2 className={`w-4 h-4 ${tamperType === "none" ? "text-indigo-400" : "text-slate-500"}`} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">No Tampering (Valid)</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Generates a perfectly valid JWS signature.</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setTamperType("payload")}
                      className={`p-3 rounded-lg border text-left transition-all duration-200 flex items-start gap-3 ${
                        tamperType === "payload"
                          ? "bg-amber-950/30 border-amber-500 text-amber-300"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="mt-0.5">
                        <AlertTriangle className={`w-4 h-4 ${tamperType === "payload" ? "text-amber-400" : "text-slate-500"}`} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">Modify Payload (MITM)</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Alters payload values after signing.</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setTamperType("signature")}
                      className={`p-3 rounded-lg border text-left transition-all duration-200 flex items-start gap-3 ${
                        tamperType === "signature"
                          ? "bg-red-950/30 border-red-500 text-red-300"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="mt-0.5">
                        <AlertTriangle className={`w-4 h-4 ${tamperType === "signature" ? "text-red-400" : "text-slate-500"}`} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">Corrupt Signature</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Modifies signature bytes to trigger validation failure.</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setTamperType("wrong_key")}
                      className={`p-3 rounded-lg border text-left transition-all duration-200 flex items-start gap-3 ${
                        tamperType === "wrong_key"
                          ? "bg-purple-950/30 border-purple-500 text-purple-300"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="mt-0.5">
                        <Key className={`w-4 h-4 ${tamperType === "wrong_key" ? "text-purple-400" : "text-slate-500"}`} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">Use Unauthorized Key</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Signs with a different, unregistered private key.</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "keys" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-semibold text-white">Partner JWK Key Pair</h2>
                </div>
                <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded-full">
                  RS256 (2048-bit)
                </span>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed">
                In a production environment, the partner generates an asymmetric key pair. The partner keeps the 
                <strong> Private Key</strong> secure to sign payloads, and shares the <strong>Public JWK</strong> with 
                the API Gateway to verify incoming requests.
              </p>

              {/* Public JWK */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Unlock className="w-3 h-3 text-emerald-400" /> Public JWK (Shared with API Gateway)
                  </span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(keys.publicJwk, null, 2), "public_jwk")}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedField === "public_jwk" ? (
                      <>
                        <Check className="w-3 h-3" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy JWK
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-48">
                  {keys.publicJwk ? JSON.stringify(keys.publicJwk, null, 2) : "Generating keys..."}
                </pre>
              </div>

              {/* Private JWK */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-red-400" /> Private JWK (Kept Secret by Partner)
                  </span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(keys.privateJwk, null, 2), "private_jwk")}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedField === "private_jwk" ? (
                      <>
                        <Check className="w-3 h-3" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy JWK
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs font-mono text-red-400/80 overflow-x-auto max-h-48">
                  {keys.privateJwk ? JSON.stringify(keys.privateJwk, null, 2) : "Generating keys..."}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: JWS Output & Verification Sandbox (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Generated Header Output */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                Generated Header
              </h2>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                x-jws-signature
              </span>
            </div>

            {/* JWS Compact Serialization Visualizer */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>JWS Compact Format (Header.Payload.Signature)</span>
                  <button
                    onClick={() => copyToClipboard(fullJws, "full_jws")}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedField === "full_jws" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    Copy Header Value
                  </button>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs break-all leading-relaxed select-all">
                  <span className="text-red-400 font-semibold">{jwsHeader}</span>
                  <span className="text-slate-500">.</span>
                  <span className="text-amber-400 font-semibold">{jwsPayload}</span>
                  <span className="text-slate-500">.</span>
                  <span className="text-indigo-400 font-semibold">{jwsSignature}</span>
                </div>
              </div>

              {/* Color Legend */}
              <div className="flex flex-wrap gap-4 text-[10px] text-slate-400 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span>Header (Base64Url)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Payload (Base64Url)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Signature (Base64Url)</span>
                </div>
              </div>
            </div>

            {/* Tampered Payload Warning */}
            {tamperType === "payload" && tamperedPayload && (
              <div className="mt-4 p-3 bg-amber-950/20 border border-amber-900/50 rounded-lg">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Tampered Payload Sent:
                </div>
                <pre className="text-[10px] font-mono text-amber-300/90 overflow-x-auto max-h-24 bg-slate-950/50 p-2 rounded border border-slate-900">
                  {tamperedPayload}
                </pre>
              </div>
            )}
          </div>

          {/* API Gateway Verification Sandbox */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                API Gateway Verification
              </h2>
              <button
                onClick={handleVerifySignature}
                disabled={isVerifying || !!jsonError}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-xs font-semibold transition-all duration-200"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" /> Test Validation
                  </>
                )}
              </button>
            </div>

            <p className="text-slate-400 text-xs mb-4 leading-relaxed">
              Simulate sending the request to the API Gateway. The gateway will parse the <code>x-jws-signature</code> header, extract the key ID, fetch the partner's public JWK, and verify the signature.
            </p>

            {/* Verification Result Panel */}
            {verificationResult ? (
              <div className="space-y-4">
                {/* Status Badge */}
                <div
                  className={`p-4 rounded-lg border flex items-start gap-3 ${
                    verificationResult.verified
                      ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-300"
                      : "bg-red-950/30 border-red-500/50 text-red-300"
                  }`}
                >
                  <div className="mt-0.5">
                    {verificationResult.verified ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold">
                      {verificationResult.verified ? "Signature Verified Successfully" : "Signature Verification Failed"}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {verificationResult.verified
                        ? "API Gateway accepted the request. The payload integrity is guaranteed."
                        : verificationResult.error || "The signature is invalid or has been tampered with."}
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Logs */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Gateway Execution Logs
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto">
                    {verificationResult.logs.map((log, idx) => (
                      <div key={idx} className="text-slate-300 leading-relaxed">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-slate-800 rounded-lg p-8 text-center text-slate-500">
                <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs">Click "Test Validation" to run the API Gateway signature verification simulation.</p>
              </div>
            )}
          </div>

          {/* Educational Info */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              How JWS Signature Works
            </h3>
            <ol className="text-[11px] text-slate-400 space-y-2 list-decimal list-inside leading-relaxed">
              <li>The partner creates a JSON payload (e.g., payment details).</li>
              <li>The partner signs the payload using their private key (RS256).</li>
              <li>The resulting JWS is sent in the <code>x-jws-signature</code> header.</li>
              <li>The API Gateway extracts the header, matches the <code>kid</code>, and verifies the signature using the partner's public JWK.</li>
            </ol>
          </div>

        </div>
      </main>
    </div>
  );
}