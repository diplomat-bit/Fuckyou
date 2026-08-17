export class SecurityService {
  /**
   * Generates a Mastercard API compliant OAuth 1.0a Authorization header.
   * Uses RSASSA-PKCS1-v1_5 with SHA-256 for signing.
   * 
   * @param uri The full request URI (e.g., 'https://sandbox.api.mastercard.com/service')
   * @param method The HTTP method (e.g., 'POST', 'GET')
   * @param payload The request body payload (string or object), or null if none
   * @param consumerKey The Mastercard Developer Portal Consumer Key
   * @param signingKeyPem The private signing key in PEM format (PKCS#1 or PKCS#8)
   */
  public async generateOAuth1Header(
    uri: string,
    method: string,
    payload: string | object | null,
    consumerKey: string,
    signingKeyPem: string
  ): Promise<string> {
    const urlObj = new URL(uri);
    const methodUpper = method.toUpperCase();
    
    // 1. Generate nonce and timestamp
    const nonce = this.generateNonce(16);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // 2. Compute body hash if applicable
    let bodyHash = '';
    const hasBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(methodUpper) || payload !== null;
    if (hasBody) {
      const bodyStr = typeof payload === 'object' && payload !== null 
        ? JSON.stringify(payload) 
        : (payload || '');
      bodyHash = await this.sha256Base64(bodyStr);
    }
    
    // 3. Collect OAuth parameters
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: consumerKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'RSA-SHA256',
      timestamp: timestamp, // Internal key for sorting, will map to oauth_timestamp
      oauth_version: '1.0',
    };
    
    if (bodyHash) {
      oauthParams['oauth_body_hash'] = bodyHash;
    }
    
    // Map internal keys to standard OAuth keys for the final header
    const finalOauthParams: Record<string, string> = { ...oauthParams };
    if (finalOauthParams['timestamp']) {
      finalOauthParams['oauth_timestamp'] = finalOauthParams['timestamp'];
      delete finalOauthParams['timestamp'];
    }
    
    // 4. Normalize parameters (OAuth params + Query params)
    const normalizedParams = this.normalizeParams(oauthParams, urlObj.searchParams);
    
    // 5. Normalize URL
    const normalizedUrl = this.normalizeUrl(urlObj);
    
    // 6. Construct Signature Base String (SBS)
    const sbs = [
      methodUpper,
      this.rfc3986Encode(normalizedUrl),
      this.rfc3986Encode(normalizedParams)
    ].join('&');
    
    // 7. Sign the SBS
    const privateKey = await this.importPrivateKeyPem(signingKeyPem, 'RSASSA-PKCS1-v1_5', 'SHA-256', ['sign']);
    const encoder = new TextEncoder();
    const signatureBuffer = await window.crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      encoder.encode(sbs)
    );
    
    const signatureBase64 = this.arrayBufferToBase64(signatureBuffer);
    finalOauthParams['oauth_signature'] = signatureBase64;
    
    // 8. Construct Authorization Header
    const headerParts = Object.entries(finalOauthParams).map(
      ([key, val]) => `${key}="${this.rfc3986Encode(val)}"`
    );
    
    return `OAuth ${headerParts.join(', ')}`;
  }

  /**
   * Decrypts a JSON Web Encryption (JWE) compact serialized string.
   * Supports RSA-OAEP / RSA-OAEP-256 key wrapping and AES-GCM content encryption.
   * 
   * @param jwe The JWE string (5 dot-separated parts)
   * @param privateKeyPem The recipient's private decryption key in PEM format
   */
  public async decryptJwe(jwe: string, privateKeyPem: string): Promise<string> {
    const parts = jwe.split('.');
    if (parts.length !== 5) {
      throw new Error('Invalid JWE format. Expected 5 parts.');
    }
    
    const [headerB64, encryptedKeyB64, ivB64, ciphertextB64, tagB64] = parts;
    
    // Decode header to determine algorithms
    const headerJson = new TextDecoder().decode(this.base64UrlDecode(headerB64));
    const header = JSON.parse(headerJson);
    
    const alg = header.alg; // e.g., "RSA-OAEP" or "RSA-OAEP-256"
    const enc = header.enc; // e.g., "A128GCM" or "A256GCM"
    
    if (!alg || !alg.startsWith('RSA-OAEP')) {
      throw new Error(`Unsupported JWE key management algorithm: ${alg}`);
    }
    if (!enc || !enc.endsWith('GCM')) {
      throw new Error(`Unsupported JWE content encryption algorithm: ${enc}`);
    }
    
    // 1. Decrypt Content Encryption Key (CEK)
    const encryptedKeyBytes = this.base64UrlDecode(encryptedKeyB64);
    const rsaHash = alg === 'RSA-OAEP-256' ? 'SHA-256' : 'SHA-1';
    
    const privateKey = await this.importPrivateKeyPem(privateKeyPem, 'RSA-OAEP', rsaHash, ['decrypt']);
    const cekBuffer = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      encryptedKeyBytes
    );
    
    // 2. Decrypt Ciphertext using CEK
    const ivBytes = this.base64UrlDecode(ivB64);
    const ciphertextBytes = this.base64UrlDecode(ciphertextB64);
    const tagBytes = this.base64UrlDecode(tagB64);
    
    const aesKey = await window.crypto.subtle.importKey(
      'raw',
      cekBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    // Web Crypto AES-GCM expects the authentication tag appended to the ciphertext
    const ciphertextWithTag = this.concatUint8Arrays(ciphertextBytes, tagBytes);
    
    // JWE uses the ASCII representation of the protected header as Additional Authenticated Data (AAD)
    const aadBytes = new TextEncoder().encode(headerB64);
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes,
        additionalData: aadBytes
      },
      aesKey,
      ciphertextWithTag
    );
    
    return new TextDecoder().decode(decryptedBuffer);
  }

  /**
   * Verifies a JSON Web Signature (JWS) compact serialized string.
   * Supports RSASSA-PKCS1-v1_5 with SHA-256 (RS256).
   * 
   * @param jws The JWS string (3 dot-separated parts)
   * @param publicKeyPem The sender's public verification key in PEM format
   */
  public async verifyJws(jws: string, publicKeyPem: string): Promise<boolean> {
    const parts = jws.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWS format. Expected 3 parts.');
    }
    
    const [headerB64, payloadB64, signatureB64] = parts;
    
    // Decode header to verify algorithm
    const headerJson = new TextDecoder().decode(this.base64UrlDecode(headerB64));
    const header = JSON.parse(headerJson);
    
    if (header.alg !== 'RS256') {
      throw new Error(`Unsupported JWS algorithm: ${header.alg}. Only RS256 is supported.`);
    }
    
    const publicKey = await this.importPublicKeyPem(publicKeyPem, 'RSASSA-PKCS1-v1_5', 'SHA-256', ['verify']);
    const dataToVerify = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signatureBytes = this.base64UrlDecode(signatureB64);
    
    return await window.crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      signatureBytes,
      dataToVerify
    );
  }

  /**
   * Generates a signed JWT Client Assertion (private_key_jwt) for OAuth 2.0 / FAPI 2.0.
   * 
   * @param clientId The OAuth 2.0 Client ID
   * @param audience The token endpoint URL (audience)
   * @param privateKeyPem The client's private signing key in PEM format
   */
  public async generateClientAssertion(
    clientId: string,
    audience: string,
    privateKeyPem: string
  ): Promise<string> {
    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: clientId,
      sub: clientId,
      aud: audience,
      jti: this.generateNonce(32),
      exp: now + 300, // 5 minutes expiration
      iat: now
    };
    
    const encoder = new TextEncoder();
    const headerB64 = this.base64UrlEncode(encoder.encode(JSON.stringify(header)));
    const payloadB64 = this.base64UrlEncode(encoder.encode(JSON.stringify(payload)));
    
    const dataToSign = `${headerB64}.${payloadB64}`;
    const privateKey = await this.importPrivateKeyPem(privateKeyPem, 'RSASSA-PKCS1-v1_5', 'SHA-256', ['sign']);
    
    const signatureBuffer = await window.crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      encoder.encode(dataToSign)
    );
    
    const signatureB64 = this.base64UrlEncode(new Uint8Array(signatureBuffer));
    return `${dataToSign}.${signatureB64}`;
  }

  /**
   * Encrypts data symmetrically using AES-GCM (256-bit).
   * 
   * @param plaintext The text to encrypt
   * @param keyBytes The 256-bit symmetric key as a Uint8Array
   */
  public async encryptSymmetric(
    plaintext: string,
    keyBytes: Uint8Array
  ): Promise<{ ciphertext: string; iv: string; tag: string }> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const aesKey = await window.crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      new TextEncoder().encode(plaintext)
    );
    
    const encryptedBytes = new Uint8Array(encryptedBuffer);
    // Web Crypto appends the 16-byte authentication tag to the end of the ciphertext
    const ciphertextBytes = encryptedBytes.slice(0, -16);
    const tagBytes = encryptedBytes.slice(-16);
    
    return {
      ciphertext: this.base64UrlEncode(ciphertextBytes),
      iv: this.base64UrlEncode(iv),
      tag: this.base64UrlEncode(tagBytes)
    };
  }

  /**
   * Decrypts data symmetrically using AES-GCM (256-bit).
   * 
   * @param ciphertext Base64URL encoded ciphertext
   * @param iv Base64URL encoded IV
   * @param tag Base64URL encoded authentication tag
   * @param keyBytes The 256-bit symmetric key as a Uint8Array
   */
  public async decryptSymmetric(
    ciphertext: string,
    iv: string,
    tag: string,
    keyBytes: Uint8Array
  ): Promise<string> {
    const ciphertextBytes = this.base64UrlDecode(ciphertext);
    const ivBytes = this.base64UrlDecode(iv);
    const tagBytes = this.base64UrlDecode(tag);
    
    const aesKey = await window.crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const ciphertextWithTag = this.concatUint8Arrays(ciphertextBytes, tagBytes);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBytes },
      aesKey,
      ciphertextWithTag
    );
    
    return new TextDecoder().decode(decryptedBuffer);
  }

  /**
   * Encrypts data asymmetrically using RSA-OAEP (SHA-256).
   * 
   * @param plaintext The text to encrypt
   * @param publicKeyPem The public key in PEM format
   */
  public async encryptAsymmetric(plaintext: string, publicKeyPem: string): Promise<string> {
    const publicKey = await this.importPublicKeyPem(publicKeyPem, 'RSA-OAEP', 'SHA-256', ['encrypt']);
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      new TextEncoder().encode(plaintext)
    );
    return this.base64UrlEncode(new Uint8Array(encryptedBuffer));
  }

  /**
   * Decrypts data asymmetrically using RSA-OAEP (SHA-256).
   * 
   * @param ciphertext Base64URL encoded ciphertext
   * @param privateKeyPem The private key in PEM format
   */
  public async decryptAsymmetric(ciphertext: string, privateKeyPem: string): Promise<string> {
    const privateKey = await this.importPrivateKeyPem(privateKeyPem, 'RSA-OAEP', 'SHA-256', ['decrypt']);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      this.base64UrlDecode(ciphertext)
    );
    return new TextDecoder().decode(decryptedBuffer);
  }

  // ==========================================
  // Cryptographic & Encoding Helpers
  // ==========================================

  private generateNonce(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomValues = new Uint8Array(length);
    window.crypto.getRandomValues(randomValues);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[randomValues[i] % chars.length];
    }
    return result;
  }

  private async sha256Base64(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return this.arrayBufferToBase64(hashBuffer);
  }

  private rfc3986Encode(str: string): string {
    return encodeURIComponent(str)
      .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
  }

  private normalizeParams(oauthParams: Record<string, string>, queryParams: URLSearchParams): string {
    const params: { key: string; value: string }[] = [];
    
    // Add OAuth parameters (mapping internal 'timestamp' to 'oauth_timestamp')
    for (const [key, value] of Object.entries(oauthParams)) {
      const finalKey = key === 'timestamp' ? 'oauth_timestamp' : key;
      params.push({ key: this.rfc3986Encode(finalKey), value: this.rfc3986Encode(value) });
    }
    
    // Add Query parameters
    queryParams.forEach((value, key) => {
      params.push({ key: this.rfc3986Encode(key), value: this.rfc3986Encode(value) });
    });
    
    // Sort alphabetically by key, then by value
    params.sort((a, b) => {
      if (a.key === b.key) {
        return a.value.localeCompare(b.value);
      }
      return a.key.localeCompare(b.key);
    });
    
    return params.map(p => `${p.key}=${p.value}`).join('&');
  }

  private normalizeUrl(urlObj: URL): string {
    const scheme = urlObj.protocol.toLowerCase();
    let host = urlObj.hostname.toLowerCase();
    const port = urlObj.port;
    
    // Only append port if it is non-standard
    if (port) {
      if ((scheme === 'http:' && port !== '80') || (scheme === 'https:' && port !== '443')) {
        host += `:${port}`;
      }
    }
    
    let path = urlObj.pathname;
    if (!path) {
      path = '/';
    }
    
    return `${scheme}//${host}${path}`;
  }

  private async importPrivateKeyPem(
    pem: string,
    alg: string,
    hash: string,
    usages: KeyUsage[]
  ): Promise<CryptoKey> {
    const isPkcs1 = pem.includes('BEGIN RSA PRIVATE KEY');
    const clean = pem
      .replace(/-----BEGIN [A-Z ]+-----/g, '')
      .replace(/-----END [A-Z ]+-----/g, '')
      .replace(/\s+/g, '');
    
    const binary = atob(clean);
    let der = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      der[i] = binary.charCodeAt(i);
    }
    
    // Web Crypto SubtleCrypto.importKey expects PKCS#8 format.
    // If the key is PKCS#1, wrap it in a PKCS#8 structure.
    if (isPkcs1) {
      der = this.wrapPkcs1ToPkcs8(der);
    }
    
    return await window.crypto.subtle.importKey(
      'pkcs8',
      der,
      {
        name: alg,
        hash: { name: hash }
      },
      false,
      usages
    );
  }

  private async importPublicKeyPem(
    pem: string,
    alg: string,
    hash: string,
    usages: KeyUsage[]
  ): Promise<CryptoKey> {
    const clean = pem
      .replace(/-----BEGIN [A-Z ]+-----/g, '')
      .replace(/-----END [A-Z ]+-----/g, '')
      .replace(/\s+/g, '');
    
    const binary = atob(clean);
    const der = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      der[i] = binary.charCodeAt(i);
    }
    
    return await window.crypto.subtle.importKey(
      'spki',
      der,
      {
        name: alg,
        hash: { name: hash }
      },
      false,
      usages
    );
  }

  /**
   * Wraps raw PKCS#1 RSA private key DER bytes into a PKCS#8 PrivateKeyInfo structure.
   */
  private wrapPkcs1ToPkcs8(pkcs1Der: Uint8Array): Uint8Array {
    // OID for rsaEncryption: 1.2.840.113549.1.1.1
    const rsaOid = new Uint8Array([0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01]);
    const nullParams = new Uint8Array([0x05, 0x00]);
    
    const algId = this.encodeDerSequence(this.concatUint8Arrays(rsaOid, nullParams));
    const privateKeyOctet = this.encodeDerOctetString(pkcs1Der);
    const version = new Uint8Array([0x02, 0x01, 0x00]);
    
    return this.encodeDerSequence(this.concatUint8Arrays(version, algId, privateKeyOctet));
  }

  private encodeDerLength(length: number): Uint8Array {
    if (length < 128) {
      return new Uint8Array([length]);
    }
    const bytes: number[] = [];
    let temp = length;
    while (temp > 0) {
      bytes.unshift(temp & 0xff);
      temp >>= 8;
    }
    bytes.unshift(0x80 | bytes.length);
    return new Uint8Array(bytes);
  }

  private encodeDerSequence(contents: Uint8Array): Uint8Array {
    const lenBytes = this.encodeDerLength(contents.length);
    const result = new Uint8Array(1 + lenBytes.length + contents.length);
    result[0] = 0x30; // SEQUENCE tag
    result.set(lenBytes, 1);
    result.set(contents, 1 + lenBytes.length);
    return result;
  }

  private encodeDerOctetString(contents: Uint8Array): Uint8Array {
    const lenBytes = this.encodeDerLength(contents.length);
    const result = new Uint8Array(1 + lenBytes.length + contents.length);
    result[0] = 0x04; // OCTET STRING tag
    result.set(lenBytes, 1);
    result.set(contents, 1 + lenBytes.length);
    return result;
  }

  private concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
    let totalLength = 0;
    for (const arr of arrays) {
      totalLength += arr.length;
    }
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }
    return result;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64UrlEncode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  private base64UrlDecode(str: string): Uint8Array {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}

export const securityService = new SecurityService();