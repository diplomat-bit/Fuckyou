import { SignJWT, importPKCS8 } from 'jose';

export interface IpaApplicant {
  firstName: string;
  lastName: string;
  email: string;
  nationalId: string;
  annualIncome: number;
  employmentStatus: 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | 'STUDENT';
}

export interface IpaRequestPayload {
  applicationId?: string;
  applicant: IpaApplicant;
  requestedAmount: number;
  currency: string;
  termMonths: number;
  purpose?: string;
}

export interface IpaResponse {
  ipaId: string;
  status: 'APPROVED' | 'DECLINED' | 'MANUAL_REVIEW' | 'ERROR';
  approvedAmount?: number;
  interestRate?: number;
  validUntil?: string;
  decisionReason?: string;
  referenceId: string;
}

export class IpaServiceError extends Error {
  constructor(public statusCode: number, message: string, public details?: any) {
    super(message);
    this.name = 'IpaServiceError';
    Object.setPrototypeOf(this, IpaServiceError.prototype);
  }
}

export class IpaService {
  private readonly baseUrl: string;
  private readonly privateKeyPem: string;
  private readonly keyId: string;

  /**
   * Initialize the IPA Service
   * @param baseUrl The base URL for the IPA API
   * @param privateKeyPem PKCS8 formatted private key for JWS signing
   * @param keyId Key Identifier for the JWS header
   */
  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_IPA_API_URL || 'https://api.example.com/ipa',
    privateKeyPem: string = process.env.IPA_PRIVATE_KEY || '',
    keyId: string = process.env.IPA_KEY_ID || 'default-key-id'
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.privateKeyPem = privateKeyPem;
    this.keyId = keyId;
  }

  /**
   * Generates a UUID v4 for request tracking
   */
  private generateRequestId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Generates a detached JWS signature for the given payload
   */
  private async generateSignature(payload: object): Promise<string> {
    if (!this.privateKeyPem) {
      console.warn('IpaService: No private key provided. Skipping JWS signature generation.');
      return '';
    }

    try {
      const privateKey = await importPKCS8(this.privateKeyPem, 'RS256');
      const jws = await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'RS256', kid: this.keyId, typ: 'JWT' })
        .setIssuedAt()
        .setExpirationTime('5m')
        .sign(privateKey);
      
      return jws;
    } catch (error) {
      throw new Error(`Failed to generate JWS signature: ${(error as Error).message}`);
    }
  }

  /**
   * Submits an In-Principle Approval request
   */
  public async submitApproval(payload: IpaRequestPayload): Promise<IpaResponse> {
    const endpoint = `${this.baseUrl}/v1/approvals/in-principle`;
    const requestId = this.generateRequestId();
    const signature = await this.generateSignature(payload);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Request-ID': requestId,
    };

    if (signature) {
      headers['X-JWS-Signature'] = signature;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new IpaServiceError(
          response.status,
          `IPA API Error: ${response.statusText}`,
          errorData
        );
      }

      const data: IpaResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof IpaServiceError) {
        throw error;
      }
      throw new IpaServiceError(
        500,
        'Internal Service Error during IPA submission',
        (error as Error).message
      );
    }
  }

  /**
   * Retrieves the status of an existing IPA request
   */
  public async getApprovalStatus(ipaId: string): Promise<IpaResponse> {
    const endpoint = `${this.baseUrl}/v1/approvals/in-principle/${encodeURIComponent(ipaId)}`;
    const requestId = this.generateRequestId();

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'X-Request-ID': requestId,
    };

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new IpaServiceError(
          response.status,
          `IPA API Error: ${response.statusText}`,
          errorData
        );
      }

      const data: IpaResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof IpaServiceError) {
        throw error;
      }
      throw new IpaServiceError(
        500,
        'Internal Service Error during IPA status retrieval',
        (error as Error).message
      );
    }
  }
}

export const ipaService = new IpaService();