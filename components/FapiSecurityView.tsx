

// --- CONSOLIDATED FROM: ./components/CitiB2B/FapiSecurityView.tsx ---

import React, { useState, useEffect, useCallback } from 'react';

// ==========================================
// CRYPTOGRAPHIC & UTILITY HELPER FUNCTIONS
// ==========================================

function base64urlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(escape(atob(base64)));
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate RS256 Keypair for JWS Signing
async function generateSigningKeyPair(): Promise<{ publicKey: JsonWebKey; privateKey: JsonWebKey }> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: { name: "SHA-256" }
    },
    true,
    ["sign", "verify"]
  );

  const publicKey = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateKey = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);

  publicKey.alg = "RS256";
  privateKey.alg = "RS256";

  return { publicKey, privateKey };
}

// Generate RSA-OAEP-256 Keypair for JWE Decryption
async function generateEncryptionKeyPair(): Promise<{ publicKey: JsonWebKey; privateKey: JsonWebKey }> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: { name: "SHA-256" }
    },
    true,
    ["encrypt", "decrypt"]
  );

  const publicKey = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateKey = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);

  publicKey.alg = "RSA-OAEP-256";
  privateKey.alg = "RSA-OAEP-256";

  return { publicKey, privateKey };
}

// Sign JWS Compact Serialization
async function signJwsCompact(payload: string, privateKeyJwk: JsonWebKey): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT",
    kid: privateKeyJwk.kid || "client-signing-key"
  };
  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(payload);
  const dataToSign = new TextEncoder().encode(`${headerB64}.${payloadB64}`);

  const privateKey = await window.crypto.subtle.importKey(
    "jwk",
    privateKeyJwk,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: { name: "SHA-256" }
    },
    false,
    ["sign"]
  );

  const signatureBuffer = await window.crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    dataToSign
  );

  const signatureB64 = arrayBufferToBase64Url(signatureBuffer);
  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

// Encrypt JWE JSON Serialization (For Mocking/Testing)
async function encryptJweJson(plaintext: string, publicKeyJwk: JsonWebKey): Promise<any> {
  const publicKey = await window.crypto.subtle.importKey(
    "jwk",
    publicKeyJwk,
    {
      name: "RSA-OAEP",
      hash: { name: "SHA-256" }
    },
    true,
    ["encrypt"]
  );

  // Generate random 256-bit CEK
  const cek = window.crypto.getRandomValues(new Uint8Array(32));

  // Encrypt CEK with RSA-OAEP-256
  const encryptedKeyBuffer = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    cek
  );

  // Generate random 96-bit IV for AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Encrypt plaintext with AES-GCM
  const aesKey = await window.crypto.subtle.importKey(
    "raw",
    cek,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const plaintextBuffer = new TextEncoder().encode(plaintext);
  const aad = "eyJhbGciOiJSU0EtT0FFUC0yNTYiLCJlbmMiOiJBMjU2R0NNIn0"; // base64url of {"alg":"RSA-OAEP-256","enc":"A256GCM"}
  const aadBuffer = new TextEncoder().encode(aad);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
      additionalData: aadBuffer,
      tagLength: 128
    },
    aesKey,
    plaintextBuffer
  );

  const encryptedBytes = new Uint8Array(encryptedBuffer);
  const ciphertextBytes = encryptedBytes.slice(0, encryptedBytes.length - 16);
  const tagBytes = encryptedBytes.slice(encryptedBytes.length - 16);

  return {
    header: {
      alg: "RSA-OAEP-256",
      enc: "A256GCM",
      kid: publicKeyJwk.kid || "Citi_2020-02-10",
      cty: "text/plain"
    },
    encrypted_key: arrayBufferToBase64Url(encryptedKeyBuffer),
    iv: arrayBufferToBase64Url(iv.buffer),
    ciphertext: arrayBufferToBase64Url(ciphertextBytes.buffer),
    authTag: arrayBufferToBase64Url(tagBytes.buffer),
    aad: aad
  };
}

// Decrypt JWE JSON Serialization
async function decryptJweJson(jwe: any, privateKeyJwk: JsonWebKey): Promise<string> {
  const privateKey = await window.crypto.subtle.importKey(
    "jwk",
    privateKeyJwk,
    {
      name: "RSA-OAEP",
      hash: { name: "SHA-256" }
    },
    false,
    ["decrypt"]
  );

  const encryptedKeyBuffer = base64UrlToArrayBuffer(jwe.encrypted_key);
  const cekBuffer = await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedKeyBuffer
  );

  const enc = jwe.header?.enc || "A256GCM";
  const ivBuffer = base64UrlToArrayBuffer(jwe.iv);
  const ciphertextBuffer = base64UrlToArrayBuffer(jwe.ciphertext);

  if (enc === "A256GCM") {
    const aesKey = await window.crypto.subtle.importKey(
      "raw",
      cekBuffer,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const tagBuffer = base64UrlToArrayBuffer(jwe.authTag);
    const combinedBuffer = new Uint8Array(ciphertextBuffer.byteLength + tagBuffer.byteLength);
    combinedBuffer.set(new Uint8Array(ciphertextBuffer), 0);
    combinedBuffer.set(new Uint8Array(tagBuffer), ciphertextBuffer.byteLength);

    const aadBuffer = jwe.aad ? new TextEncoder().encode(jwe.aad) : undefined;

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBuffer,
        additionalData: aadBuffer,
        tagLength: 128
      },
      aesKey,
      combinedBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  } else if (enc === "A256CBC-HS512") {
    const cekBytes = new Uint8Array(cekBuffer);
    if (cekBytes.length !== 64) {
      throw new Error("Invalid CEK length for A256CBC-HS512. Expected 64 bytes.");
    }
    const encKeyBytes = cekBytes.slice(32, 64);

    const aesKey = await window.crypto.subtle.importKey(
      "raw",
      encKeyBytes,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: ivBuffer
      },
      aesKey,
      ciphertextBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  } else {
    throw new Error(`Unsupported encryption algorithm: ${enc}`);
  }
}

// ==========================================
// MAIN REACT COMPONENT
// ==========================================

export default function FapiSecurityView() {
  const [activeTab, setActiveTab] = useState<'keys' | 'jws' | 'jwe' | 'api'>('keys');

  // Key State
  const [signingKeys, setSigningKeys] = useState<{ publicKey: JsonWebKey; privateKey: JsonWebKey } | null>(null);
  const [encryptionKeys, setEncryptionKeys] = useState<{ publicKey: JsonWebKey; privateKey: JsonWebKey } | null>(null);
  const [keyLoading, setKeyLoading] = useState(false);

  // JWS State
  const [jwsPayload, setJwsPayload] = useState<string>(JSON.stringify({
    iss: "client_id_12345",
    sub: "client_id_12345",
    aud: "https://sandbox.api.citibank.com/api/accounts/account-transactions/partner/v1",
    jti: "unique-jwt-id-99999",
    exp: Math.floor(Date.now() / 1000) + 300
  }, null, 2));
  const [generatedJws, setGeneratedJws] = useState<string>('');

  // JWE State
  const [jweInput, setJweInput] = useState<string>('');
  const [decryptedPlaintext, setDecryptedPlaintext] = useState<string>('');
  const [jweError, setJweError] = useState<string>('');

  // API Client State
  const [clientId, setClientId] = useState<string>('citi-sandbox-client-id-98765');
  const [authToken, setAuthToken] = useState<string>('Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IkNpdGlfMjAyMC0wMi0xMCJ9...');
  const [accountId, setAccountId] = useState<string>('da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6');
  const [txFromDate, setTxFromDate] = useState<string>('2026-01-01');
  const [txToDate, setTxToDate] = useState<string>('2026-08-17');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [useMockServer, setUseMockServer] = useState<boolean>(true);

  // Generate Keys on Mount if empty
  const handleGenerateAllKeys = async () => {
    setKeyLoading(true);
    try {
      const signPair = await generateSigningKeyPair();
      const encPair = await generateEncryptionKeyPair();
      
      // Add mock Key IDs
      signPair.publicKey.kid = "client-signing-key-2026";
      signPair.privateKey.kid = "client-signing-key-2026";
      encPair.publicKey.kid = "client-encryption-key-2026";
      encPair.privateKey.kid = "client-encryption-key-2026";

      setSigningKeys(signPair);
      setEncryptionKeys(encPair);
    } catch (err) {
      console.error("Error generating keys:", err);
    } finally {
      setKeyLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateAllKeys();
  }, []);

  // Handle JWS Sign
  const handleSignJws = async () => {
    if (!signingKeys) {
      alert("Please generate signing keys first.");
      return;
    }
    try {
      const jws = await signJwsCompact(jwsPayload, signingKeys.privateKey);
      setGeneratedJws(jws);
    } catch (err: any) {
      alert("Error signing JWS: " + err.message);
    }
  };

  // Handle JWE Decrypt
  const handleDecryptJwe = async () => {
    if (!encryptionKeys) {
      setJweError("Please generate encryption keys first.");
      return;
    }
    try {
      setJweError('');
      const parsedJwe = JSON.parse(jweInput);
      const plaintext = await decryptJweJson(parsedJwe, encryptionKeys.privateKey);
      setDecryptedPlaintext(plaintext);
    } catch (err: any) {
      setJweError("Decryption failed: " + err.message);
      setDecryptedPlaintext('');
    }
  };

  // Generate a Mock JWE for testing
  const handleGenerateMockJwe = async () => {
    if (!encryptionKeys) {
      alert("Please generate encryption keys first.");
      return;
    }
    try {
      const mockRoutingNumber = "122401710"; // Standard ABA routing number
      const jweObj = await encryptJweJson(mockRoutingNumber, encryptionKeys.publicKey);
      setJweInput(JSON.stringify(jweObj, null, 2));
      setDecryptedPlaintext('');
      setJweError('');
    } catch (err: any) {
      alert("Error generating mock JWE: " + err.message);
    }
  };

  // Simulate API Calls
  const handleCallApi = async (endpoint: 'details' | 'routing' | 'transactions') => {
    setApiLoading(true);
    setApiResponse(null);

    const uuid = crypto.randomUUID();
    const headers = {
      'Authorization': authToken,
      'uuid': uuid,
      'Accept': 'application/json',
      'client_id': clientId
    };

    if (!useMockServer) {
      // Real API Call
      try {
        let url = '';
        if (endpoint === 'details') {
          url = `/api/accounts/account-transactions/partner/v1/accounts/details`;
        } else if (endpoint === 'routing') {
          url = `/api/accounts/account-transactions/partner/v1/accounts/${accountId}/encrypt/accountRoutingNumber`;
        } else {
          url = `/api/accounts/account-transactions/partner/v1/accounts/${accountId}/transactions?transactionFromDate=${txFromDate}&transactionToDate=${txToDate}`;
        }

        const res = await fetch(url, { headers });
        if (res.status === 204) {
          setApiResponse({ status: 204, message: "No Content" });
        } else {
          const data = await res.json();
          setApiResponse({ status: res.status, headers, data });
        }
      } catch (err: any) {
        setApiResponse({ error: err.message, headers });
      } finally {
        setApiLoading(false);
      }
    } else {
      // Simulated FAPI Mock Server
      setTimeout(async () => {
        let mockData: any = {};
        if (endpoint === 'details') {
          mockData = {
            accountGroupDetails: [
              {
                accountGroup: "CHECKING",
                checkingAccountsDetails: [
                  {
                    productName: "Business Checking",
                    accountNickname: "Primary Operating Account",
                    accountDescription: "Business Checking - 9594",
                    balanceType: "ASSET",
                    displayAccountNumber: "XXXXXX9594",
                    accountId: accountId,
                    currencyCode: "USD",
                    accountStatus: "ACTIVE",
                    currentBalance: 145250.60,
                    availableBalance: 142000.00
                  }
                ],
                totalCurrentBalance: { localCurrencyCode: "USD", localCurrencyBalanceAmount: 145250.60 },
                totalAvailableBalance: { localCurrencyCode: "USD", localCurrencyBalanceAmount: 142000.00 }
              }
            ],
            customer: {
              customerId: "bd12a6d89815aed77be876225b9a2c7f6648f0af82e84198f49d1b7e51a23fae1621936bc1addf5fdceca25c3aae5f92071fb1d6218dae32ca83b199c29962ee"
            }
          };
        } else if (endpoint === 'routing') {
          // Generate a real JWE encrypted with the user's current public key if available
          let encryptedPayload = null;
          if (encryptionKeys) {
            encryptedPayload = await encryptJweJson("122401710", encryptionKeys.publicKey);
          } else {
            encryptedPayload = {
              header: { alg: "RSA-OAEP-256", enc: "A256GCM", kid: "Citi_2020-02-10", cty: "text/plain" },
              encrypted_key: "mock-encrypted-key",
              iv: "mock-iv",
              ciphertext: "mock-ciphertext",
              authTag: "mock-tag",
              aad: "mock-aad"
            };
          }
          mockData = {
            encryptedAccountNumber: {
              encryptedPayload: encryptedPayload
            },
            routingNumber: "122401710"
          };
        } else {
          mockData = {
            checkingAccountTransactions: [
              {
                accountId: accountId,
                currencyCode: "USD",
                debitCreditMemo: "DEBIT",
                displayAccountNumber: "XXXXXX9594",
                transactionAmount: 1250.00,
                transactionDate: "2026-08-10",
                transactionDescription: "WIRE TRANSFER TO PARTNER B2B",
                transactionId: "TXN" + Math.floor(Math.random() * 10000000),
                transactionStatus: "POSTED",
                transactionType: "TRANSFER"
              },
              {
                accountId: accountId,
                currencyCode: "USD",
                debitCreditMemo: "CREDIT",
                displayAccountNumber: "XXXXXX9594",
                transactionAmount: 5400.00,
                transactionDate: "2026-08-12",
                transactionDescription: "ACH DEPOSIT CITI CUSTOMER",
                transactionId: "TXN" + Math.floor(Math.random() * 10000000),
                transactionStatus: "POSTED",
                transactionType: "DEPOSIT"
              }
            ]
          };
        }

        setApiResponse({
          status: 200,
          simulated: true,
          headers,
          data: mockData
        });
        setApiLoading(false);
      }, 600);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">FAPI 2.0</span>
              <h1 className="text-2xl font-bold tracking-tight text-white">Citi B2B Security &amp; Token Manager</h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Generate cryptographic keypairs, sign client assertions (JWS), and decrypt sensitive payloads (JWE) for Financial-grade APIs.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setUseMockServer(true)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${useMockServer ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Simulated Sandbox
            </button>
            <button
              onClick={() => setUseMockServer(false)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${!useMockServer ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Live Gateway
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${activeTab === 'keys' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            Key Management
          </button>
          <button
            onClick={() => setActiveTab('jws')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${activeTab === 'jws' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            JWS Signer (RS256)
          </button>
          <button
            onClick={() => setActiveTab('jwe')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${activeTab === 'jwe' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            JWE Decrypter (RSA-OAEP)
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${activeTab === 'api' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            API Sandbox Client
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 gap-8">
          
          {/* TAB 1: KEY MANAGEMENT */}
          {activeTab === 'keys' && (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-white">Cryptographic Key Generation</h2>
                  <button
                    onClick={handleGenerateAllKeys}
                    disabled={keyLoading}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-md flex items-center gap-2"
                  >
                    {keyLoading ? (
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H19.5" /></svg>
                    )}
                    Generate New Keypairs
                  </button>
                </div>
                <p className="text-sm text-slate-400 mb-6">
                  FAPI requires asymmetric cryptography. We generate an <strong>RS256</strong> keypair for signing client assertions (JWS) and an <strong>RSA-OAEP-256</strong> keypair for decrypting sensitive fields like routing numbers (JWE).
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Signing Keys */}
                  <div className="bg-slate-900 rounded-lg p-5 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">JWS Signing Keypair (RS256)</h3>
                      <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded border border-blue-800">Active</span>
                    </div>
                    {signingKeys ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Public Key (JWK)</label>
                          <pre className="bg-slate-950 p-3 rounded text-xs text-slate-300 overflow-x-auto max-h-40 border border-slate-800">
                            {JSON.stringify(signingKeys.publicKey, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Private Key (JWK - Keep Secret)</label>
                          <pre className="bg-slate-950 p-3 rounded text-xs text-red-400/90 overflow-x-auto max-h-40 border border-slate-800">
                            {JSON.stringify(signingKeys.privateKey, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No signing keys generated yet.</p>
                    )}
                  </div>

                  {/* Encryption Keys */}
                  <div className="bg-slate-900 rounded-lg p-5 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">JWE Decryption Keypair (RSA-OAEP-256)</h3>
                      <span className="text-xs bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">Active</span>
                    </div>
                    {encryptionKeys ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Public Key (JWK)</label>
                          <pre className="bg-slate-950 p-3 rounded text-xs text-slate-300 overflow-x-auto max-h-40 border border-slate-800">
                            {JSON.stringify(encryptionKeys.publicKey, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Private Key (JWK - Keep Secret)</label>
                          <pre className="bg-slate-950 p-3 rounded text-xs text-red-400/90 overflow-x-auto max-h-40 border border-slate-800">
                            {JSON.stringify(encryptionKeys.privateKey, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No encryption keys generated yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JWS SIGNER */}
          {activeTab === 'jws' && (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                <h2 className="text-lg font-semibold text-white mb-2">JSON Web Signature (JWS) Generator</h2>
                <p className="text-sm text-slate-400 mb-6">
                  Sign client assertions or request payloads using your private signing key. This generates a compact JWS token (`header.payload.signature`) used for secure client authentication.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">JWS Payload (JSON)</label>
                      <textarea
                        value={jwsPayload}
                        onChange={(e) => setJwsPayload(e.target.value)}
                        rows={10}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={handleSignJws}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md"
                    >
                      Sign Payload with Private Key
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Generated JWS Compact Token</label>
                      <div className="relative">
                        <textarea
                          readOnly
                          value={generatedJws}
                          rows={10}
                          placeholder="Your signed JWS token will appear here..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-blue-300 focus:outline-none"
                        />
                        {generatedJws && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(generatedJws);
                              alert("Copied to clipboard!");
                            }}
                            className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded border border-slate-700"
                          >
                            Copy
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: JWE DECRYPTER */}
          {activeTab === 'jwe' && (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-white">JSON Web Encryption (JWE) Decrypter</h2>
                  <button
                    onClick={handleGenerateMockJwe}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-600 transition-all"
                  >
                    Generate Mock JWE
                  </button>
                </div>
                <p className="text-sm text-slate-400 mb-6">
                  Decrypt sensitive payloads returned by Citi endpoints (such as the encrypted account routing number). Paste the JWE JSON object below to decrypt it using your private encryption key.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">JWE JSON Input</label>
                      <textarea
                        value={jweInput}
                        onChange={(e) => setJweInput(e.target.value)}
                        placeholder='Paste JWE JSON object here... (e.g. {"header": ..., "ciphertext": ...})'
                        rows={12}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={handleDecryptJwe}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md"
                    >
                      Decrypt JWE Payload
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Decryption Output</label>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 min-h-[200px] flex flex-col justify-between">
                        {decryptedPlaintext ? (
                          <div>
                            <span className="text-xs bg-emerald-900/50 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-800 font-semibold">Decrypted Successfully</span>
                            <div className="mt-4">
                              <span className="text-xs text-slate-400 block">Plaintext Routing Number:</span>
                              <span className="text-2xl font-bold text-white tracking-wider font-mono">{decryptedPlaintext}</span>
                            </div>
                          </div>
                        ) : jweError ? (
                          <div className="text-red-400 text-sm font-mono">
                            <span className="font-bold block mb-1">Error:</span>
                            {jweError}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic">Awaiting decryption input...</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: API CLIENT */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                <h2 className="text-lg font-semibold text-white mb-2">Citi FAPI Sandbox Client</h2>
                <p className="text-sm text-slate-400 mb-6">
                  Simulate or execute live requests to the Citi B2B Accounts API. The client automatically injects required FAPI headers like `uuid` and `client_id`.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Configuration Panel */}
                  <div className="bg-slate-900 rounded-lg p-5 border border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">API Configuration</h3>
                    
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Client ID</label>
                      <input
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Authorization Token</label>
                      <input
                        type="text"
                        value={authToken}
                        onChange={(e) => setAuthToken(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Account ID (for specific queries)</label>
                      <input
                        type="text"
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Tx From Date</label>
                        <input
                          type="date"
                          value={txFromDate}
                          onChange={(e) => setTxFromDate(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Tx To Date</label>
                        <input
                          type="date"
                          value={txToDate}
                          onChange={(e) => setTxToDate(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <button
                        onClick={() => handleCallApi('details')}
                        disabled={apiLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-semibold py-2 rounded transition-all"
                      >
                        GET /accounts/details
                      </button>
                      <button
                        onClick={() => handleCallApi('routing')}
                        disabled={apiLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white text-xs font-semibold py-2 rounded transition-all"
                      >
                        GET /accounts/&#123;id&#125;/encrypt/routing
                      </button>
                      <button
                        onClick={() => handleCallApi('transactions')}
                        disabled={apiLoading}
                        className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white text-xs font-semibold py-2 rounded transition-all"
                      >
                        GET /accounts/&#123;id&#125;/transactions
                      </button>
                    </div>
                  </div>

                  {/* Response Panel */}
                  <div className="lg:col-span-2 bg-slate-900 rounded-lg p-5 border border-slate-800 flex flex-col justify-between min-h-[400px]">
                    <div className="space-y-4 h-full flex flex-col">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Response Console</h3>
                        {apiResponse && (
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${apiResponse.status === 200 ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-800' : 'bg-red-900/50 text-red-300 border border-red-800'}`}>
                            HTTP {apiResponse.status}
                          </span>
                        )}
                      </div>

                      {apiLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center">
                          <span className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></span>
                          <span className="text-xs text-slate-400">Executing FAPI Request...</span>
                        </div>
                      ) : apiResponse ? (
                        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                          <div>
                            <span className="text-xs text-slate-400 block mb-1">Injected Headers:</span>
                            <pre className="bg-slate-950 p-2.5 rounded text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
                              {JSON.stringify(apiResponse.headers, null, 2)}
                            </pre>
                          </div>
                          <div className="flex-1 flex flex-col overflow-hidden">
                            <span className="text-xs text-slate-400 block mb-1">Response Body:</span>
                            <pre className="flex-1 bg-slate-950 p-3 rounded text-xs font-mono text-slate-300 overflow-auto border border-slate-800 max-h-80">
                              {JSON.stringify(apiResponse.data, null, 2)}
                            </pre>
                          </div>
                          {apiResponse.data?.encryptedAccountNumber?.encryptedPayload && (
                            <div className="bg-blue-950/40 border border-blue-800/60 rounded-lg p-3 flex justify-between items-center">
                              <div className="text-xs text-blue-300">
                                <strong className="block">Encrypted Payload Detected!</strong>
                                You can load this JWE directly into the Decrypter tab to test decryption.
                              </div>
                              <button
                                onClick={() => {
                                  setJweInput(JSON.stringify(apiResponse.data.encryptedAccountNumber.encryptedPayload, null, 2));
                                  setActiveTab('jwe');
                                }}
                                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded transition-all"
                              >
                                Load in Decrypter
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-xs text-slate-500 italic">
                          Select an endpoint on the left to execute a request.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}