import { OnboardingApplication, CompanyDetails, ContactPerson, FinancialProfile, ProductSelection, ApplicationAddRequest, ApplicationAddResponse, ApplicationInquiryResponse, ApplicationUpdateRequest, ApplicationUpdateResponse, FinalSubmitResponse } from './OnboardingMockDataService.types';

// Inline types to ensure self-containment and zero dependency issues
export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CompanyDetails {
  legalName: string;
  tradeName?: string;
  registrationNumber: string;
  countryOfIncorporation: string;
  vatNumber?: string;
  registeredAddress: Address;
  businessAddress?: Address;
  industrySector: string;
  dateOfIncorporation: string;
}

export interface ContactPerson {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'DIRECTOR' | 'UBO' | 'AUTHORIZED_SIGNATORY' | 'PRIMARY_CONTACT';
  ownershipPercentage?: number;
  dateOfBirth?: string;
  nationality?: string;
}

export interface FinancialProfile {
  expectedAnnualTurnover: number;
  currency: string;
  sourceOfFunds: string;
  countriesOfOperation: string[];
}

export interface ProductSelection {
  cashManagement: boolean;
  tradeFinance: boolean;
  foreignExchange: boolean;
  liquidityManagement: boolean;
}

export interface OnboardingApplication {
  applicationId: string;
  controlFlowId: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ACTION_REQUIRED';
  companyDetails: CompanyDetails;
  contacts: ContactPerson[];
  financialProfile: FinancialProfile;
  productSelection: ProductSelection;
  createdAt: string;
  updatedAt: string;
  comments?: string;
}

export interface ApplicationAddRequest {
  countryOfIncorporation: string;
  legalName: string;
  primaryContactEmail: string;
}

export interface ApplicationAddResponse {
  controlFlowId: string;
  applicationId: string;
  status: string;
  createdAt: string;
}

export interface ApplicationInquiryResponse {
  application: OnboardingApplication | null;
  success: boolean;
  validationErrors?: string[];
}

export interface ApplicationUpdateRequest {
  companyDetails?: Partial<CompanyDetails>;
  contacts?: ContactPerson[];
  financialProfile?: Partial<FinancialProfile>;
  productSelection?: Partial<ProductSelection>;
}

export interface ApplicationUpdateResponse {
  applicationId: string;
  controlFlowId: string;
  status: string;
  updatedAt: string;
  success: boolean;
  validationErrors?: string[];
}

export interface FinalSubmitResponse {
  applicationId: string;
  controlFlowId: string;
  status: 'SUBMITTED' | 'FAILED';
  submissionTimestamp: string;
  message: string;
  nextSteps?: string[];
}

const STORAGE_KEY = 'emea_onboarding_applications';

export class OnboardingMockDataService {
  private static getStore(): Record<string, OnboardingApplication> {
    if (typeof window === 'undefined') {
      return {};
    }
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  private static saveStore(store: Record<string, OnboardingApplication>): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
  }

  private static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Generates a fully populated mock application for testing and UI demonstration.
   */
  public static generateMockApplication(
    country: string = 'DE',
    legalName: string = 'Acme EMEA Solutions GmbH'
  ): OnboardingApplication {
    const appId = `APP-${Math.floor(100000 + Math.random() * 900000)}`;
    const flowId = `CF-${this.generateUUID().substring(0, 8).toUpperCase()}`;
    const now = new Date().toISOString();

    return {
      applicationId: appId,
      controlFlowId: flowId,
      status: 'DRAFT',
      companyDetails: {
        legalName,
        tradeName: 'Acme Tech Europe',
        registrationNumber: 'HRB 123456 B',
        countryOfIncorporation: country,
        vatNumber: `DE${Math.floor(100000000 + Math.random() * 900000000)}`,
        registeredAddress: {
          street: 'Friedrichstraße 95',
          city: 'Berlin',
          postalCode: '10117',
          country: country,
        },
        businessAddress: {
          street: 'Friedrichstraße 95',
          city: 'Berlin',
          postalCode: '10117',
          country: country,
        },
        industrySector: 'Technology & Software Services',
        dateOfIncorporation: '2018-04-12',
      },
      contacts: [
        {
          id: this.generateUUID(),
          firstName: 'Sarah',
          lastName: 'Schmidt',
          email: 's.schmidt@acme-emea.de',
          phone: '+49 30 1234567',
          role: 'PRIMARY_CONTACT',
          nationality: 'DE',
          dateOfBirth: '1984-11-23',
        },
        {
          id: this.generateUUID(),
          firstName: 'Hans',
          lastName: 'Müller',
          email: 'h.mueller@acme-emea.de',
          phone: '+49 30 7654321',
          role: 'DIRECTOR',
          nationality: 'DE',
          dateOfBirth: '1972-05-14',
        },
        {
          id: this.generateUUID(),
          firstName: 'Elena',
          lastName: 'Rostova',
          email: 'e.rostova@acme-emea.de',
          phone: '+49 30 9988776',
          role: 'UBO',
          ownershipPercentage: 65,
          nationality: 'EE',
          dateOfBirth: '1990-08-02',
        },
      ],
      financialProfile: {
        expectedAnnualTurnover: 15000000,
        currency: 'EUR',
        sourceOfFunds: 'Operating Revenue & Venture Capital',
        countriesOfOperation: ['DE', 'FR', 'NL', 'PL'],
      },
      productSelection: {
        cashManagement: true,
        tradeFinance: false,
        foreignExchange: true,
        liquidityManagement: true,
      },
      createdAt: now,
      updatedAt: now,
      comments: 'Initial mock application generated for EMEA onboarding flow.',
    };
  }

  /**
   * API: POST /api/v1/application/add
   * Initializes a new onboarding application.
   */
  public static createApplication(request: ApplicationAddRequest): ApplicationAddResponse {
    const store = this.getStore();
    const mockApp = this.generateMockApplication(request.countryOfIncorporation, request.legalName);
    
    // Override primary contact email with requested email
    if (mockApp.contacts[0]) {
      mockApp.contacts[0].email = request.primaryContactEmail;
    }

    store[mockApp.applicationId] = mockApp;
    this.saveStore(store);

    return {
      controlFlowId: mockApp.controlFlowId,
      applicationId: mockApp.applicationId,
      status: mockApp.status,
      createdAt: mockApp.createdAt,
    };
  }

  /**
   * API: GET /api/v1/application/inquiry
   * Retrieves the current state of an application.
   */
  public static getApplication(applicationId: string): ApplicationInquiryResponse {
    const store = this.getStore();
    const application = store[applicationId];

    if (!application) {
      return {
        application: null,
        success: false,
        validationErrors: ['Application not found.'],
      };
    }

    return {
      application,
      success: true,
    };
  }

  /**
   * API: PUT /api/v1/application/update
   * Updates specific sections of the onboarding application.
   */
  public static updateApplication(
    applicationId: string,
    updates: ApplicationUpdateRequest
  ): ApplicationUpdateResponse {
    const store = this.getStore();
    const application = store[applicationId];

    if (!application) {
      return {
        applicationId,
        controlFlowId: '',
        status: 'ERROR',
        updatedAt: new Date().toISOString(),
        success: false,
        validationErrors: ['Application not found.'],
      };
    }

    // Apply updates safely
    if (updates.companyDetails) {
      application.companyDetails = {
        ...application.companyDetails,
        ...updates.companyDetails,
        registeredAddress: {
          ...application.companyDetails.registeredAddress,
          ...(updates.companyDetails.registeredAddress || {}),
        },
        businessAddress: updates.companyDetails.businessAddress
          ? {
              ...application.companyDetails.businessAddress,
              ...updates.companyDetails.businessAddress,
            }
          : application.companyDetails.businessAddress,
      } as CompanyDetails;
    }

    if (updates.contacts) {
      application.contacts = updates.contacts;
    }

    if (updates.financialProfile) {
      application.financialProfile = {
        ...application.financialProfile,
        ...updates.financialProfile,
      } as FinancialProfile;
    }

    if (updates.productSelection) {
      application.productSelection = {
        ...application.productSelection,
        ...updates.productSelection,
      } as ProductSelection;
    }

    application.updatedAt = new Date().toISOString();
    store[applicationId] = application;
    this.saveStore(store);

    // Perform soft validation
    const validationErrors: string[] = [];
    if (application.contacts.filter(c => c.role === 'UBO').reduce((sum, c) => sum + (c.ownershipPercentage || 0), 0) > 100) {
      validationErrors.push('Total UBO ownership percentage cannot exceed 100%.');
    }

    return {
      applicationId: application.applicationId,
      controlFlowId: application.controlFlowId,
      status: application.status,
      updatedAt: application.updatedAt,
      success: true,
      validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
    };
  }

  /**
   * API: POST /api/v1/application/submit
   * Validates and finalizes the application submission.
   */
  public static submitApplication(applicationId: string): FinalSubmitResponse {
    const store = this.getStore();
    const application = store[applicationId];

    if (!application) {
      return {
        applicationId,
        controlFlowId: '',
        status: 'FAILED',
        submissionTimestamp: new Date().toISOString(),
        message: 'Submission failed. Application not found.',
      };
    }

    // Strict validation before final submission
    const errors: string[] = [];
    
    if (!application.companyDetails.registrationNumber) {
      errors.push('Company registration number is required.');
    }
    if (!application.companyDetails.vatNumber) {
      errors.push('VAT number is required for EMEA compliance.');
    }
    if (application.contacts.length === 0) {
      errors.push('At least one contact person must be provided.');
    }
    
    const hasUbo = application.contacts.some(c => c.role === 'UBO');
    const hasDirector = application.contacts.some(c => c.role === 'DIRECTOR');
    
    if (!hasUbo) {
      errors.push('At least one Ultimate Beneficial Owner (UBO) must be declared.');
    }
    if (!hasDirector) {
      errors.push('At least one Director must be declared.');
    }

    if (errors.length > 0) {
      return {
        applicationId,
        controlFlowId: application.controlFlowId,
        status: 'FAILED',
        submissionTimestamp: new Date().toISOString(),
        message: `Submission rejected due to validation errors: ${errors.join(' ')}`,
        nextSteps: ['Please complete all mandatory fields in the company and contact sections.'],
      };
    }

    // Transition state to SUBMITTED
    application.status = 'SUBMITTED';
    application.updatedAt = new Date().toISOString();
    store[applicationId] = application;
    this.saveStore(store);

    // Simulate background compliance review transition
    setTimeout(() => {
      const currentStore = this.getStore();
      if (currentStore[applicationId]) {
        currentStore[applicationId].status = 'UNDER_REVIEW';
        this.saveStore(currentStore);
      }
    }, 10000);

    return {
      applicationId,
      controlFlowId: application.controlFlowId,
      status: 'SUBMITTED',
      submissionTimestamp: application.updatedAt,
      message: 'Application successfully submitted to EMEA Compliance Operations.',
      nextSteps: [
        'Our compliance team will review your corporate structure and UBO declarations.',
        'You will receive an email notification once the review is complete or if further documentation is required.',
        'Please prepare corporate registry extracts and passport copies for all declared UBOs and Directors.',
      ],
    };
  }

  /**
   * Helper to list all applications in the mock store (useful for dashboard views).
   */
  public static listApplications(): OnboardingApplication[] {
    const store = this.getStore();
    return Object.values(store).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Helper to reset the mock database to a clean state with default mock data.
   */
  public static resetDatabase(): OnboardingApplication[] {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    const defaultApp1 = this.generateMockApplication('DE', 'Siemens Energy Partner GmbH');
    const defaultApp2 = this.generateMockApplication('FR', 'LVMH Logistics SAS');
    defaultApp2.status = 'UNDER_REVIEW';
    
    const store = {
      [defaultApp1.applicationId]: defaultApp1,
      [defaultApp2.applicationId]: defaultApp2,
    };
    
    this.saveStore(store);
    return Object.values(store);
  }
}