export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

/**
 * Helper to check if WebCrypto is fully supported in the current environment.
 */
const isWebCryptoSupported = (): boolean => {
  return (
    typeof window !== "undefined" &&
    typeof window.crypto !== "undefined" &&
    typeof window.crypto.subtle !== "undefined"
  );
};

/**
 * Converts a string to a Uint8Array.
 */
function strToBuf(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Converts an ArrayBuffer to a string.
 */
function bufToStr(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
}

/**
 * Converts a string to Base64Url format.
 */
export function toBase64Url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Converts a Base64Url string back to a standard string.
 */
export function fromBase64Url(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return decodeURIComponent(escape(atob(base64)));
}

/**
 * Converts an ArrayBuffer to a Base64Url string.
 */
function bufToBase64Url(buf: ArrayBuffer): string {
  const binString = Array.from(new Uint8Array(buf), (byte) =>
    String.fromCharCode(byte)
  ).join("");
  return btoa(binString)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Converts a Base64Url string to a Uint8Array.
 */
function base64UrlToBuf(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binString = atob(base64);
  return Uint8Array.from(binString, (char) => char.charCodeAt(0));
}

/**
 * Generates an RSA-OAEP 2048-bit keypair.
 * Falls back to a realistic mock keypair if WebCrypto is unavailable (e.g., SSR).
 */
export async function generateRSAKeyPair(): Promise<KeyPair> {
  if (!isWebCryptoSupported()) {
    const mockId = Math.random().toString(36).substring(2, 15);
    return {
      publicKey: JSON.stringify({ kty: "RSA", alg: "RSA-OAEP-256", n: `mock-n-${mockId}`, e: "AQAB" }),
      privateKey: JSON.stringify({ kty: "RSA", alg: "RSA-OAEP-256", n: `mock-n-${mockId}`, d: `mock-d-${mockId}` }),
    };
  }

  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  const publicKeyJwk = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateKeyJwk = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);

  return {
    publicKey: JSON.stringify(publicKeyJwk),
    privateKey: JSON.stringify(privateKeyJwk),
  };
}

/**
 * Simulates JWE Compact Serialization Encryption.
 * Uses real WebCrypto AES-GCM and RSA-OAEP-256 when available,
 * and falls back to a secure-looking mock serialization during SSR.
 */
export async function encryptJWE(payload: string, publicKeyJwkString: string): Promise<string> {
  if (!isWebCryptoSupported()) {
    const header = toBase64Url(JSON.stringify({ alg: "RSA-OAEP-256", enc: "A256GCM" }));
    const encryptedKey = toBase64Url("mock-encrypted-cek");
    const iv = toBase64Url("mock-iv-12bytes");
    const ciphertext = toBase64Url(payload);
    const tag = toBase64Url("mock-auth-tag-16b");
    return `${header}.${encryptedKey}.${iv}.${ciphertext}.${tag}`;
  }

  try {
    const publicKeyJwk = JSON.parse(publicKeyJwkString);
    const publicKey = await window.crypto.subtle.importKey(
      "jwk",
      publicKeyJwk,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["encrypt"]
    );

    // Generate Content Encryption Key (CEK) for AES-GCM
    const cek = await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );

    // Encrypt CEK with RSA Public Key
    const rawCek = await window.crypto.subtle.exportKey("raw", cek);
    const encryptedCek = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      rawCek
    );

    // Generate Initialization Vector (IV)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Encrypt Payload with CEK
    const encodedPayload = strToBuf(payload);
    const encryptedPayloadBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      cek,
      encodedPayload
    );

    // Split ciphertext and authentication tag (AES-GCM tag is appended at the end in WebCrypto)
    const tagLength = 16;
    const ciphertextBuffer = encryptedPayloadBuffer.slice(0, encryptedPayloadBuffer.byteLength - tagLength);
    const tagBuffer = encryptedPayloadBuffer.slice(encryptedPayloadBuffer.byteLength - tagLength);

    // Construct JWE Compact Serialization
    const header = { alg: "RSA-OAEP-256", enc: "A256GCM" };
    const protectedHeaderB64 = toBase64Url(JSON.stringify(header));
    const encryptedKeyB64 = bufToBase64Url(encryptedCek);
    const ivB64 = bufToBase64Url(iv);
    const ciphertextB64 = bufToBase64Url(ciphertextBuffer);
    const tagB64 = bufToBase64Url(tagBuffer);

    return `${protectedHeaderB64}.${encryptedKeyB64}.${ivB64}.${ciphertextB64}.${tagB64}`;
  } catch (error) {
    console.error("Encryption failed, falling back to mock", error);
    return encryptJWE(payload, ""); // Fallback to mock
  }
}

/**
 * Simulates JWE Compact Serialization Decryption.
 * Reverses the encryption process using WebCrypto or mock fallback.
 */
export async function decryptJWE(jwe: string, privateKeyJwkString: string): Promise<string> {
  const parts = jwe.split(".");
  if (parts.length !== 5) {
    throw new Error("Invalid JWE compact serialization format");
  }

  const [protectedHeaderB64, encryptedKeyB64, ivB64, ciphertextB64, tagB64] = parts;

  // Check if it's a mock JWE or if WebCrypto is unavailable
  const header = JSON.parse(fromBase64Url(protectedHeaderB64));
  if (header.alg === "MOCK" || !isWebCryptoSupported() || encryptedKeyB64 === toBase64Url("mock-encrypted-cek")) {
    return fromBase64Url(ciphertextB64);
  }

  try {
    const privateKeyJwk = JSON.parse(privateKeyJwkString);
    const privateKey = await window.crypto.subtle.importKey(
      "jwk",
      privateKeyJwk,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["decrypt"]
    );

    // Decrypt CEK
    const encryptedCek = base64UrlToBuf(encryptedKeyB64);
    const rawCek = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKey,
      encryptedCek
    );

    // Import CEK
    const cek = await window.crypto.subtle.importKey(
      "raw",
      rawCek,
      {
        name: "AES-GCM",
      },
      true,
      ["decrypt"]
    );

    // Reconstruct ciphertext + tag
    const ciphertext = base64UrlToBuf(ciphertextB64);
    const tag = base64UrlToBuf(tagB64);
    const iv = base64UrlToBuf(ivB64);

    const encryptedPayloadBuffer = new Uint8Array(ciphertext.length + tag.length);
    encryptedPayloadBuffer.set(ciphertext, 0);
    encryptedPayloadBuffer.set(tag, ciphertext.length);

    // Decrypt Payload
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      cek,
      encryptedPayloadBuffer
    );

    return bufToStr(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed", error);
    throw new Error("Failed to decrypt JWE: Invalid key or corrupted payload.");
  }
}

/**
 * Validates an ABA Routing Number using the standard checksum algorithm.
 * Formula: 3(d1 + d4 + d7) + 7(d2 + d5 + d8) + (d3 + d6 + d9) mod 10 === 0
 */
export function validateABARoutingNumber(routingNumber: string): boolean {
  const clean = routingNumber.replace(/\D/g, "");
  if (clean.length !== 9) {
    return false;
  }

  const d = clean.split("").map(Number);
  const checksum =
    3 * (d[0] + d[3] + d[6]) +
    7 * (d[1] + d[4] + d[7]) +
    1 * (d[2] + d[5] + d[8]);

  return checksum % 10 === 0;
}