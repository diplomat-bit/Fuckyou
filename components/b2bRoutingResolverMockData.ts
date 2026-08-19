

// --- CONSOLIDATED FROM: ./components/data/b2bRoutingResolverMockData.ts ---

export interface RoutingRegistryEntry {
  routingNumber: string;
  bankName: string;
  endpointUrl: string;
  publicKey: string;
  supportedRails: ('ACH' | 'Fedwire' | 'RTP' | 'Swift')[];
  status: 'ACTIVE' | 'SUSPENDED' | 'MAINTENANCE';
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface SandboxPayloads {
  resolutionRequest: string;
  resolutionResponse: string;
  paymentInstruction: string;
  signedPayload: string;
}

// Pre-generated mock RSA-2048 Key Pairs for cryptographic signing and verification simulation
export const mockKeyPairs: {
  resolver: KeyPair;
  chase: KeyPair;
  wellsFargo: KeyPair;
  bankOfAmerica: KeyPair;
} = {
  resolver: {
    publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzV1C3v9X8z9m8z9m8z9m
G3v9X8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9IDAQAB
-----END PUBLIC KEY-----`,
    privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAzV1C3v9X8z9m8z9m8z9mG3v9X8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9IDAQAB
AoIBAQDK9g3v9X8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z
9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z
9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z
9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z
9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z
-----END RSA PRIVATE KEY-----`
  },
  chase: {
    publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAt3V9X8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9IDAQAB
-----END PUBLIC KEY-----`,
    privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAt3V9X8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9IDAQAB
AoIBAQCp9g3v9X8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z
9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z
-----END RSA PRIVATE KEY-----`
  },
  wellsFargo: {
    publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw8V9X8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9IDAQAB
-----END PUBLIC KEY-----`,
    privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAw8V9X8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9IDAQAB
AoIBAQCl9g3v9X8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z
-----END RSA PRIVATE KEY-----`
  },
  bankOfAmerica: {
    publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr7V9X8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9IDAQAB
-----END PUBLIC KEY-----`,
    privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAr7V9X8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9IDAQAB
AoIBAQCg9g3v9X8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z
-----END RSA PRIVATE KEY-----`
  }
};

// Initial ABA Routing Registry Mock Data
export const initialRoutingRegistry: RoutingRegistryEntry[] = [
  {
    routingNumber: '021000021',
    bankName: 'JPMorgan Chase Bank, N.A.',
    endpointUrl: 'https://api.jpmorgan.com/v2/b2b/payments/resolve',
    publicKey: mockKeyPairs.chase.publicKey,
    supportedRails: ['ACH', 'Fedwire', 'RTP'],
    status: 'ACTIVE',
    address: {
      street: '270 Park Avenue',
      city: 'New York',
      state: 'NY',
      zip: '10017'
    }
  },
  {
    routingNumber: '121000248',
    bankName: 'Wells Fargo Bank, N.A.',
    endpointUrl: 'https://api.wellsfargo.com/v1/routing/resolver',
    publicKey: mockKeyPairs.wellsFargo.publicKey,
    supportedRails: ['ACH', 'Fedwire', 'RTP'],
    status: 'ACTIVE',
    address: {
      street: '420 Montgomery Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94104'
    }
  },
  {
    routingNumber: '026009593',
    bankName: 'Bank of America, N.A.',
    endpointUrl: 'https://b2b.bankofamerica.com/api/v3/resolve',
    publicKey: mockKeyPairs.bankOfAmerica.publicKey,
    supportedRails: ['ACH', 'Fedwire', 'RTP', 'Swift'],
    status: 'ACTIVE',
    address: {
      street: '100 North Tryon Street',
      city: 'Charlotte',
      state: 'NC',
      zip: '28255'
    }
  },
  {
    routingNumber: '091000022',
    bankName: 'U.S. Bank, N.A.',
    endpointUrl: 'https://api.usbank.com/b2b/routing/v1',
    publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA61V9X8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
-----END PUBLIC KEY-----`,
    supportedRails: ['ACH', 'Fedwire'],
    status: 'MAINTENANCE',
    address: {
      street: '800 Nicollet Mall',
      city: 'Minneapolis',
      state: 'MN',
      zip: '55402'
    }
  },
  {
    routingNumber: '031000053',
    bankName: 'PNC Bank, N.A.',
    endpointUrl: 'https://developer.pnc.com/api/routing-resolver',
    publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA52V9X8z9m8z9m8z9m8z9
m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9
-----END PUBLIC KEY-----`,
    supportedRails: ['ACH', 'Fedwire', 'RTP'],
    status: 'SUSPENDED',
    address: {
      street: '300 Fifth Avenue',
      city: 'Pittsburgh',
      state: 'PA',
      zip: '15222'
    }
  }
];

// Default Sandbox Payloads for testing and simulation
export const defaultSandboxPayloads: SandboxPayloads = {
  resolutionRequest: JSON.stringify(
    {
      header: {
        messageId: "MSG-982347109-XYZ",
        timestamp: new Date().toISOString(),
        senderId: "ORIGINATOR-CORP-01",
        version: "1.0.0"
      },
      query: {
        targetRoutingNumber: "021000021",
        requestedRails: ["RTP", "Fedwire"],
        verificationRequired: true
      }
    },
    null,
    2
  ),

  resolutionResponse: JSON.stringify(
    {
      header: {
        messageId: "MSG-982347109-XYZ-RESP",
        correlationId: "MSG-982347109-XYZ",
        timestamp: new Date().toISOString(),
        responderId: "B2B-ROUTING-RESOLVER-01"
      },
      resolution: {
        routingNumber: "021000021",
        bankName: "JPMorgan Chase Bank, N.A.",
        status: "ACTIVE",
        endpointUrl: "https://api.jpmorgan.com/v2/b2b/payments/resolve",
        supportedRails: ["ACH", "Fedwire", "RTP"],
        publicKeyFingerprint: "SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      },
      signature: "MEQCID3g8X9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9mAiAt8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m"
    },
    null,
    2
  ),

  paymentInstruction: JSON.stringify(
    {
      instructionId: "PMT-20231027-88391",
      endToEndId: "E2E-992817364",
      amount: {
        currency: "USD",
        value: "250000.00"
      },
      debtor: {
        name: "Acme Industrial Corp",
        accountNumber: "1100229938",
        routingNumber: "121000248"
      },
      creditor: {
        name: "Global Logistics Partners LLC",
        accountNumber: "9988776655",
        routingNumber: "021000021"
      },
      paymentMethod: "RTP",
      remittanceInformation: "Invoice INV-2023-08912 - Net 30"
    },
    null,
    2
  ),

  signedPayload: JSON.stringify(
    {
      payload: {
        action: "UPDATE_ENDPOINT",
        routingNumber: "121000248",
        newEndpointUrl: "https://api-secure.wellsfargo.com/v2/routing/resolver",
        timestamp: new Date().toISOString()
      },
      signature: "MEYCIQDr9X8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9mIhAO8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m8z9m",
      signerPublicKeyFingerprint: "SHA256:8f4398a2b9c10d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e"
    },
    null,
    2
  )
};