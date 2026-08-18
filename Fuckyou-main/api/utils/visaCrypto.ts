import { createHmac, randomBytes } from 'crypto';

/**
 * Interface representing the options required to generate a dCVV2.
 */
export interface DCVV2GenerationOptions {
  /** Primary Account Number (PAN), 13 to 19 digits */
  pan: string;
  /** Card expiration date in MMYY format */
  expirationDate: string;
  /** 3-digit service code (typically '000' or '999' for dynamic CVV2) */
  serviceCode: string;
  /** Cryptographic Card Verification Key (CVK) in hex format (minimum 256-bit recommended) */
  cvk: string;
  /** Dynamic factor: either an explicit Application Transaction Counter (ATC) or a timestamp */
  dynamicFactor?: string | number;
  /** Validity window in seconds (default: 1800 seconds / 30 minutes) */
  validityWindow?: number;
}

/**
 * Interface representing the options required to verify a dCVV2.
 */
export interface DCVV2VerificationOptions extends DCVV2GenerationOptions {
  /** The dCVV2 value to verify (3 digits) */
  dCvv2: string;
  /** The timestamp when the transaction was received (optional, defaults to current time) */
  receivedAt?: Date;
}

/**
 * Interface representing the generated dynamic credential payload.
 */
export interface DynamicCredentialPayload {
  /** The generated 3-digit dynamic CVV2 */
  dCvv2: string;
  /** The dynamic factor used (e.g., the time-step counter or ATC) */
  dynamicFactor: string;
  /** The ISO timestamp when this dCVV2 expires */
  expiresAt: string;
  /** The validity window duration in seconds */
  validityWindow: number;
}

/**
 * Cryptographic utility simulating Visa's dCVV2 (dynamic Card Verification Value 2)
 * generation and verification algorithms using secure HMAC-SHA256.
 */
export class VisaCrypto {
  private static readonly DEFAULT_VALIDITY_WINDOW = 1800; // 30 minutes in seconds
  private static readonly DEFAULT_SERVICE_CODE = '999';

  /**
   * Generates a secure random 256-bit Card Verification Key (CVK) in hex format.
   * This key is used as the root secret for dCVV2 generation.
   */
  public static generateCVK(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Derives a card-specific Card Verification Key (Unique CVK) from a Master Derivation Key (MDK)
   * and the card's PAN using HMAC-SHA256.
   * 
   * @param pan Primary Account Number
   * @param mdk Master Derivation Key (hex format)
   * @returns Derived card-specific key (hex format)
   */
  public static deriveCardKey(pan: string, mdk: string): string {
    this.validatePan(pan);
    if (!/^[0-9a-fA-F]{64}$/.test(mdk)) {
      throw new Error('Invalid Master Derivation Key (MDK). Must be a 64-character hex string (256-bit).');
    }

    const hmac = createHmac('sha256', Buffer.from(mdk, 'hex'));
    hmac.update(`DERIVE-CARD-KEY|${pan}`);
    return hmac.digest('hex');
  }

  /**
   * Generates a realistic dynamic CVV2 (dCVV2) value and expiration timestamp.
   * Uses a time-step counter (similar to TOTP) if no explicit dynamic factor is provided.
   * 
   * @param options Configuration options for generating the dCVV2
   * @returns DynamicCredentialPayload containing the dCVV2, dynamic factor, and expiration
   */
  public static generateDCVV2(options: DCVV2GenerationOptions): DynamicCredentialPayload {
    const { pan, expirationDate, cvk } = options;
    const serviceCode = options.serviceCode || this.DEFAULT_SERVICE_CODE;
    const validityWindow = options.validityWindow || this.DEFAULT_VALIDITY_WINDOW;

    this.validatePan(pan);
    this.validateExpirationDate(expirationDate);
    this.validateServiceCode(serviceCode);
    this.validateKey(cvk);

    let dynamicFactorStr: string;
    let expiresAt: Date;

    if (options.dynamicFactor !== undefined) {
      dynamicFactorStr = String(options.dynamicFactor);
      // If an explicit factor is provided, expiration is calculated from the current time plus window
      expiresAt = new Date(Date.now() + validityWindow * 1000);
    } else {
      // Time-based dynamic factor (TOTP style)
      const nowMs = Date.now();
      const timeStep = Math.floor(nowMs / (validityWindow * 1000));
      dynamicFactorStr = String(timeStep);
      expiresAt = new Date((timeStep + 1) * validityWindow * 1000);
    }

    const dCvv2 = this.calculateCvv2(pan, expirationDate, serviceCode, dynamicFactorStr, cvk);

    return {
      dCvv2,
      dynamicFactor: dynamicFactorStr,
      expiresAt: expiresAt.toISOString(),
      validityWindow,
    };
  }

  /**
   * Verifies a provided dCVV2 value against the card details and cryptographic key.
   * Supports window-based drift validation for time-based factors (checks current and previous window).
   * 
   * @param options Configuration options and the dCVV2 to verify
   * @returns boolean indicating whether the dCVV2 is valid
   */
  public static verifyDCVV2(options: DCVV2VerificationOptions): boolean {
    const { pan, expirationDate, cvk, dCvv2 } = options;
    const serviceCode = options.serviceCode || this.DEFAULT_SERVICE_CODE;
    const validityWindow = options.validityWindow || this.DEFAULT_VALIDITY_WINDOW;
    const receivedAt = options.receivedAt || new Date();

    if (!/^\d{3}$/.test(dCvv2)) {
      return false;
    }

    try {
      this.validatePan(pan);
      this.validateExpirationDate(expirationDate);
      this.validateServiceCode(serviceCode);
      this.validateKey(cvk);
    } catch {
      return false;
    }

    // If an explicit dynamic factor was provided, verify directly
    if (options.dynamicFactor !== undefined) {
      const expectedCvv2 = this.calculateCvv2(pan, expirationDate, serviceCode, String(options.dynamicFactor), cvk);
      return this.safeCompare(dCvv2, expectedCvv2);
    }

    // Time-based verification with drift tolerance (allows current and previous time step)
    const nowMs = receivedAt.getTime();
    const currentTimeStep = Math.floor(nowMs / (validityWindow * 1000));
    const previousTimeStep = currentTimeStep - 1;

    const expectedCurrent = this.calculateCvv2(pan, expirationDate, serviceCode, String(currentTimeStep), cvk);
    const expectedPrevious = this.calculateCvv2(pan, expirationDate, serviceCode, String(previousTimeStep), cvk);

    return this.safeCompare(dCvv2, expectedCurrent) || this.safeCompare(dCvv2, expectedPrevious);
  }

  /**
   * Internal helper to calculate the 3-digit CVV2 using HMAC-SHA256 and dynamic truncation.
   */
  private static calculateCvv2(
    pan: string,
    expirationDate: string,
    serviceCode: string,
    dynamicFactor: string,
    cvk: string
  ): string {
    // Construct the message block securely
    // Format: PAN | Expiration Date | Service Code | Dynamic Factor
    const message = `${pan}|${expirationDate}|${serviceCode}|${dynamicFactor}`;

    const hmac = createHmac('sha256', Buffer.from(cvk, 'hex'));
    hmac.update(message);
    const hash = hmac.digest();

    // Dynamic Truncation (similar to RFC 4226 / HOTP)
    // Use the last 4 bits of the hash as an offset (0 to 15)
    const offset = hash[hash.length - 1] & 0x0f;

    // Extract a 4-byte dynamic binary code starting at the offset
    const binary =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);

    // Modulo 1000 to get a 3-digit decimal value
    const cvv2Val = binary % 1000;

    // Pad with leading zeros to guarantee exactly 3 digits
    return String(cvv2Val).padStart(3, '0');
  }

  /**
   * Validates the Primary Account Number (PAN) format and Luhn compliance.
   */
  private static validatePan(pan: string): void {
    if (!/^\d{13,19}$/.test(pan)) {
      throw new Error('Invalid PAN format. Must be between 13 and 19 digits.');
    }
    if (!this.luhnCheck(pan)) {
      throw new Error('Invalid PAN. Failed Luhn checksum validation.');
    }
  }

  /**
   * Validates the expiration date format (MMYY).
   */
  private static validateExpirationDate(expirationDate: string): void {
    if (!/^\d{4}$/.test(expirationDate)) {
      throw new Error('Invalid expiration date format. Must be MMYY.');
    }
    const month = parseInt(expirationDate.substring(0, 2), 10);
    if (month < 1 || month > 12) {
      throw new Error('Invalid expiration month. Must be between 01 and 12.');
    }
  }

  /**
   * Validates the service code format (3 digits).
   */
  private static validateServiceCode(serviceCode: string): void {
    if (!/^\d{3}$/.test(serviceCode)) {
      throw new Error('Invalid service code format. Must be exactly 3 digits.');
    }
  }

  /**
   * Validates the cryptographic key format (hex string).
   */
  private static validateKey(key: string): void {
    if (!/^[0-9a-fA-F]{64}$/.test(key)) {
      throw new Error('Invalid Card Verification Key (CVK). Must be a 64-character hex string (256-bit).');
    }
  }

  /**
   * Standard Luhn algorithm check for credit card numbers.
   */
  private static luhnCheck(pan: string): boolean {
    let sum = 0;
    let shouldDouble = false;
    for (let i = pan.length - 1; i >= 0; i--) {
      let digit = parseInt(pan.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  /**
   * Constant-time string comparison to prevent timing attacks.
   */
  private static safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}