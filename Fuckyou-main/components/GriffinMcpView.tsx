import React, { useState, useEffect, useRef, useMemo } from 'react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
}

interface DocSection {
  id: string;
  title: string;
  description: string;
  path: string;
}

interface ApiOperation {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  title: string;
  description: string;
  parameters?: {
    name: string;
    in: 'path' | 'query' | 'header' | 'body';
    required: boolean;
    type: string;
    description: string;
  }[];
  requestSchema?: any;
  responseSchema?: any;
}

interface ConsoleLog {
  timestamp: string;
  type: 'info' | 'sent' | 'received' | 'error';
  message: string;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text?: string;
  isThinking?: boolean;
  thinkingText?: string;
  toolCall?: {
    name: string;
    args: any;
    response: any;
  };
}

// ==========================================
// MOCK DATA FOR HIGH-FIDELITY SIMULATION
// ==========================================

const SERVICES: Service[] = [
  {
    id: "cross-border-services",
    title: "Cross Border Services",
    description: "Send money globally to bank accounts, mobile wallets, cards, and cash-out locations with real-time FX rates.",
    category: "Payments"
  },
  {
    id: "open-banking-us",
    title: "Open Banking US",
    description: "Securely access financial data, verify account ownership, check balances, and initiate payments via FAPI 2.0.",
    category: "Open Finance"
  },
  {
    id: "consumer-clarity",
    title: "Consumer Clarity",
    description: "Provide detailed merchant and purchase information to reduce chargebacks and improve customer experience.",
    category: "Fraud & Risk"
  },
  {
    id: "mastercard-send",
    title: "Mastercard Send",
    description: "Real-time push payments platform to send funds to billions of card, bank, and digital wallet accounts globally.",
    category: "Payments"
  },
  {
    id: "loyalty-management",
    title: "Loyalty Management",
    description: "Build and manage rewards programs, points systems, and merchant-specific offers with ease.",
    category: "Loyalty"
  },
  {
    id: "account-validation",
    title: "Account Validation",
    description: "Verify bank account details and ownership in real-time before initiating transfers to prevent fraud.",
    category: "Fraud & Risk"
  }
];

const DOCUMENTATION: Record<string, DocSection[]> = {
  "cross-border-services": [
    { id: "overview", title: "Overview", description: "Introduction to Cross Border Services and key capabilities.", path: "/overview" },
    { id: "getting-started", title: "Getting Started", description: "Sandbox setup, credentials, and authentication.", path: "/getting-started" },
    { id: "payment-flows", title: "Payment Flows", description: "Step-by-step guide to initiating cross-border transfers.", path: "/payment-flows" },
    { id: "error-handling", title: "Error Handling", description: "Common error codes and troubleshooting.", path: "/error-handling" }
  ],
  "open-banking-us": [
    { id: "overview", title: "Overview", description: "Introduction to Open Banking US APIs.", path: "/overview" },
    { id: "consent-management", title: "Consent Management", description: "How to handle user consent and authorization.", path: "/consent" },
    { id: "data-retrieval", title: "Data Retrieval", description: "Fetching accounts, transactions, and balances.", path: "/data" }
  ]
};

const DOC_CONTENT: Record<string, string> = {
  "cross-border-services/overview": `
# Cross Border Services Overview

Mastercard Cross Border Services enables financial institutions to offer their customers a fast, secure, and cost-effective way to send money globally.

### Key Features
* **Global Reach**: Send money to over 100 countries in 60+ currencies.
* **Flexible Delivery**: Deliver funds to bank accounts, mobile wallets, cards, or cash pick-up locations.
* **Real-Time FX**: Access competitive, real-time foreign exchange rates.
* **Compliance Built-In**: Integrated screening and compliance checks.
  `,
  "cross-border-services/getting-started": `
# Getting Started with Cross Border Services

To begin integrating with Cross Border Services, follow these steps:

1. **Create a Mastercard Developers Account**: Sign up at developer.mastercard.com.
2. **Create a Project**: Create a new project and select "Cross Border Services".
3. **Download Credentials**: Download your signing key (.p12 file) and note your Consumer Key.
4. **Configure SDK**: Initialize the Mastercard SDK with your credentials.

\`\`\`javascript
const MastercardAPI = require('mastercard-api-core');
const config = {
  consumerKey: "your-consumer-key",
  privateKeyPath: "./path/to/key.p12",
  keyAlias: "keyalias",
  keyPassword: "keystorepassword"
};
MastercardAPI.init(config);
\`\`\`
  `,
  "open-banking-us/overview": `
# Open Banking US Overview

Mastercard Open Banking US APIs provide secure, permissioned access to consumer financial data, enabling innovative financial services and applications.

### Key Capabilities
* **Account Verification**: Verify account ownership and details instantly.
* **Balance Checks**: Retrieve real-time account balances to prevent overdrafts.
* **Transaction History**: Access up to 24 months of historical transaction data.
* **Payment Initiation**: Securely initiate bank transfers.
  `
};

const API_OPERATIONS: Record<string, ApiOperation[]> = {
  "cross-border-services": [
    {
      method: "POST",
      path: "/transfers",
      title: "Create Transfer",
      description: "Initiate a new cross-border payment to a bank account, wallet, or card.",
      parameters: [
        { name: "partnerId", in: "path", required: true, type: "string", description: "Your unique partner identifier." }
      ],
      requestSchema: {
        sender: {
          firstName: "John",
          lastName: "Doe",
          address: "123 Main St, New York, NY"
        },
        receiver: {
          firstName: "Jane",
          lastName: "Smith",
          accountNumber: "987654321",
          bankBic: "BARCGB22XXX"
        },
        amount: 1500.00,
        currency: "GBP",
        paymentReference: "Family Support"
      },
      responseSchema: {
        transferId: "tx_982374923",
        status: "SUBMITTED",
        fxRate: 0.78,
        feeAmount: 5.00,
        estimatedDelivery: "2026-08-18T12:00:00Z"
      }
    },
    {
      method: "GET",
      path: "/transfers/{transferId}",
      title: "Get Transfer Status",
      description: "Retrieve the current status and details of a specific transfer.",
      parameters: [
        { name: "partnerId", in: "path", required: true, type: "string", description: "Your unique partner identifier." },
        { name: "transferId", in: "path", required: true, type: "string", description: "The ID of the transfer to retrieve." }
      ],
      responseSchema: {
        transferId: "tx_982374923",
        status: "COMPLETED",
        fxRate: 0.78,
        feeAmount: 5.00,
        completedAt: "2026-08-17T09:15:00Z"
      }
    }
  ],
  "open-banking-us": [
    {
      method: "POST",
      path: "/customers",
      title: "Create Customer",
      description: "Register a new customer in the Open Banking system to begin consent flow.",
      requestSchema: {
        username: "user_9923",
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example.com"
      },
      responseSchema: {
        customerId: "cust_882374",
        createdAt: "2026-08-17T08:00:00Z"
      }
    }
  ]
};

const INTEGRATION_GUIDES = {
  oauth10a: `
# Mastercard OAuth 1.0a Integration Guide

Mastercard uses a custom OAuth 1.0a signature mechanism to secure API requests. Every request must include an Authorization header containing a cryptographic signature.

### Signature Components
1. **Consumer Key**: Provided in your Mastercard Developers project.
2. **Signature Method**: RSA-SHA256
3. **Timestamp**: Current epoch time in seconds.
4. **Nonce**: A unique, random string for each request.
5. **Signature**: Base64 encoded RSA signature of the Signature Base String.

### Step-by-Step Implementation

#### 1. Generate the Signature Base String
The Signature Base String is a concatenation of:
* HTTP Method (uppercase, e.g., POST)
* Percent-encoded Base URL (e.g., https%3A%2F%2Fsandbox.api.mastercard.com%2Ftransfers)
* Percent-encoded, sorted query parameters and OAuth parameters.

#### 2. Sign the Base String
Sign the Signature Base String using your private key (.p12 file) with the SHA-256 hashing algorithm.

#### 3. Format the Authorization Header
\`\`\`http
Authorization: OAuth oauth_consumer_key="your-consumer-key",
                     oauth_signature_method="RSA-SHA256",
                     oauth_timestamp="1784392800",
                     oauth_nonce="random-nonce-string",
                     oauth_version="1.0",
                     oauth_signature="base64-encoded-signature"
\`\`\`
  `,
  oauth20: `
# Mastercard OAuth 2.0 Integration Guide

Certain modern Mastercard APIs utilize OAuth 2.0 Client Credentials grant flow for authentication.

### Authentication Flow
1. **Request Access Token**: Send a POST request to the token endpoint with your client credentials.
2. **Receive Token**: The server returns an access token and its expiration time.
3. **Call API**: Include the token in the Authorization: Bearer <token> header of your API requests.

### Token Request Example
\`\`\`http
POST /oauth2/token HTTP/1.1
Host: api.mastercard.com
Content-Type: application/x-www-form-urlencoded
Authorization: Basic <base64-encoded-client-id-and-secret>

grant_type=client_credentials
\`\`\`

### Token Response Example
\`\`\`json
{
  "access_token": "mc_oauth_token_982374923874",
  "token_type": "Bearer",
  "expires_in": 3600
}
\`\`\`
  `,
  openfinance: `
# Mastercard Open Finance Integration Guide

Mastercard Open Finance APIs adhere to the Financial-grade API (FAPI) 2.0 Security Profile to ensure the highest level of security for financial data sharing.

### Key Security Requirements
* **Mutual TLS (mTLS)**: Required for both transport security and client authentication.
* **JWS/JWE**: Request and response payloads must be signed (JWS) and encrypted (JWE).
* **Consent Management**: Explicit user consent must be obtained and managed via OAuth 2.0 authorization flows.

### Integration Steps
1. **Establish mTLS Connection**: Configure your HTTP client with your Mastercard-issued client certificate.
2. **Obtain Consent**: Redirect the user to the bank's authorization page to grant access.
3. **Exchange Authorization Code**: Exchange the code for an access token.
4. **Call Protected Endpoints**: Retrieve financial data using the access token over the mTLS connection.
  `
};

// ==========================================
// CUSTOM SVG ICONS (FOR ROBUSTNESS)
// ==========================================

const TerminalIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const BookOpenIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const CpuIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const KeyIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m-3.436-3.436L4 16.586V20h3.414l11.022-11.022a9 9 0 10-12.586 12.586" />
  </svg>
);

const CodeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15.89M9.582 9l-.582-.582m0 0l-.582.582m.582-.582V3" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function GriffinMcpView() {
  // Connection State
  const [connectionMode, setConnectionMode] = useState<'simulated' | 'remote' | 'local'>('simulated');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const [serverUrl, setServerUrl] = useState('https://developer.mcp.mastercard.com');
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);

  // Navigation State
  const [activeTab, setActiveTab] = useState<'chat' | 'services' | 'api' | 'guides' | 'tools'>('chat');

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: "Hello! I am your Mastercard Developers AI Assistant, powered by the Model Context Protocol (MCP) Agent Toolkit. I can programmatically discover available services, retrieve integration guides, and explore API specifications. How can I help you today?"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Service Discovery State
  const [selectedService, setSelectedService] = useState<string>('cross-border-services');
  const [selectedDocSection, setSelectedDocSection] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Raw Tool Runner State
  const [selectedTool, setSelectedTool] = useState<string>('get-services-list');
  const [toolParams, setToolParams] = useState<Record<string, string>>({});
  const [toolResult, setToolResult] = useState<any>(null);
  const [isExecutingTool, setIsExecutingTool] = useState(false);

  // Copy State
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // ==========================================
  // INITIALIZATION & LOGGING
  // ==========================================

  const addLog = (type: ConsoleLog['type'], message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [{ timestamp, type, message }, ...prev].slice(0, 100));
  };

  useEffect(() => {
    // Simulate initial connection logs
    addLog('info', 'Initializing Model Context Protocol (MCP) Client...');
    addLog('sent', `Connecting to Mastercard Developers MCP Server via ${connectionMode === 'simulated' ? 'Simulated Sandbox' : connectionMode === 'remote' ? 'Remote HTTP' : 'Local Stdio'}...`);
    
    const timer1 = setTimeout(() => {
      addLog('received', 'JSON-RPC Handshake: { jsonrpc: "2.0", method: "initialize", params: { protocolVersion: "2024-11-05" } }');
    }, 600);

    const timer2 = setTimeout(() => {
      addLog('info', 'Mastercard Developers MCP Server successfully connected and initialized.');
      addLog('info', 'Discovered 9 tools: get-services-list, get-documentation, get-documentation-section-content, get-documentation-page, get-oauth10a-integration-guide, get-oauth20-integration-guide, get-openfinance-integration-guide, get-api-operation-list, get-api-operation-details.');
      setConnectionStatus('connected');
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [connectionMode]);

  const handleReconnect = () => {
    setConnectionStatus('connecting');
    setConsoleLogs([]);
    addLog('info', 'Reconnecting to MCP Server...');
    setTimeout(() => {
      setConnectionStatus('connected');
      addLog('info', 'Reconnection successful.');
    }, 1000);
  };

  // ==========================================
  // CHAT SIMULATION ENGINE
  // ==========================================

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    await delay(800);

    let toolCalls: any[] = [];
    let finalResponse = "";

    const lowerText = text.toLowerCase();

    if (lowerText.includes('service') || lowerText.includes('product') || lowerText.includes('offer') || lowerText.includes('list')) {
      toolCalls.push({
        name: 'get-services-list',
        args: {},
        response: SERVICES
      });
      finalResponse = `I have discovered **${SERVICES.length} available services** on the Mastercard Developers platform using the \`get-services-list\` tool. Here are the key products you can integrate with:

${SERVICES.map(s => `* **${s.title}** (\`${s.id}\`): ${s.description}`).join('\n')}

Would you like me to retrieve the integration guide or API operations for any of these services?`;
    } else if (lowerText.includes('oauth 1') || lowerText.includes('oauth1')) {
      toolCalls.push({
        name: 'get-oauth10a-integration-guide',
        args: {},
        response: INTEGRATION_GUIDES.oauth10a
      });
      finalResponse = `I have retrieved the comprehensive **OAuth 1.0a Integration Guide** using the \`get-oauth10a-integration-guide\` tool. 

Mastercard uses a custom OAuth 1.0a signature mechanism to secure API requests. Every request must include an \`Authorization\` header containing a cryptographic signature signed with your private key (\`.p12\` file).

I have loaded the full guide in the **Integration Guides** tab for you to read, or you can ask me specific questions about the signature base string or header formatting!`;
    } else if (lowerText.includes('oauth 2') || lowerText.includes('oauth2')) {
      toolCalls.push({
        name: 'get-oauth20-integration-guide',
        args: {},
        response: INTEGRATION_GUIDES.oauth20
      });
      finalResponse = `I have retrieved the **OAuth 2.0 Integration Guide** using the \`get-oauth20-integration-guide\` tool. 

Certain modern Mastercard APIs utilize OAuth 2.0 Client Credentials grant flow for authentication. This requires requesting an access token from the token endpoint and including it as a Bearer token in your API requests.

I have loaded the full guide in the **Integration Guides** tab for you to read!`;
    } else if (lowerText.includes('open finance') || lowerText.includes('openfinance') || lowerText.includes('fapi')) {
      toolCalls.push({
        name: 'get-openfinance-integration-guide',
        args: {},
        response: INTEGRATION_GUIDES.openfinance
      });
      finalResponse = `I have retrieved the **Open Finance Integration Guide** using the \`get-openfinance-integration-guide\` tool.

Mastercard Open Finance APIs adhere to the Financial-grade API (FAPI) 2.0 Security Profile, requiring Mutual TLS (mTLS), JWS/JWE payload signing/encryption, and explicit consent management.

I have loaded the full guide in the **Integration Guides** tab for you to read!`;
    } else if (lowerText.includes('cross border') || lowerText.includes('cross-border') || lowerText.includes('transfer')) {
      toolCalls.push({
        name: 'get-api-operation-list',
        args: { serviceId: 'cross-border-services' },
        response: API_OPERATIONS['cross-border-services']
      });
      finalResponse = `I have retrieved the API operations for **Cross Border Services** using the \`get-api-operation-list\` tool. Here are the available endpoints:

${API_OPERATIONS['cross-border-services'].map(op => `* **${op.method} ${op.path}** - *${op.title}*: ${op.description}`).join('\n')}

Would you like me to fetch the detailed request/response schema for any of these operations?`;
    } else {
      toolCalls.push({
        name: 'get-services-list',
        args: {},
        response: SERVICES
      });
      finalResponse = `I'm here to help you integrate with Mastercard Developers using the Agent Toolkit. I have access to tools for service discovery, documentation retrieval, and API specification exploration.

To get started, you can ask me:
* "What services are available?"
* "How do I integrate with OAuth 1.0a?"
* "Show me the API operations for Cross Border Services."`;
    }

    // Render tool calls one by one with delays to simulate real agent execution
    for (const tc of toolCalls) {
      addLog('sent', `JSON-RPC Request: { jsonrpc: "2.0", method: "tools/call", params: { name: "${tc.name}", arguments: ${JSON.stringify(tc.args)} } }`);
      
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'agent',
        isThinking: true,
        thinkingText: `Analyzing request and preparing to call tool \`${tc.name}\`...`
      }]);
      await delay(1200);
      
      addLog('received', `JSON-RPC Response: { jsonrpc: "2.0", result: { content: [ { type: "text", text: "..." } ] } }`);

      // Replace thinking with actual tool call
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          id: Math.random().toString(),
          sender: 'agent',
          toolCall: {
            name: tc.name,
            args: tc.args,
            response: tc.response
          }
        };
        return updated;
      });
      await delay(1000);
    }

    // Add final response
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'agent',
      text: finalResponse
    }]);
    setIsTyping(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ==========================================
  // RAW TOOL RUNNER EXECUTION
  // ==========================================

  const handleExecuteTool = async () => {
    setIsExecutingTool(true);
    addLog('sent', `JSON-RPC Request: { jsonrpc: "2.0", method: "tools/call", params: { name: "${selectedTool}", arguments: ${JSON.stringify(toolParams)} } }`);
    
    await delay(1000);

    let result: any = null;
    switch (selectedTool) {
      case 'get-services-list':
        result = SERVICES;
        break;
      case 'get-documentation':
        result = DOCUMENTATION[toolParams.serviceId || 'cross-border-services'] || { error: "Service not found" };
        break;
      case 'get-documentation-section-content':
        const key = `${toolParams.serviceId || 'cross-border-services'}/${toolParams.sectionId || 'overview'}`;
        result = DOC_CONTENT[key] ? { content: DOC_CONTENT[key] } : { error: "Section not found" };
        break;
      case 'get-oauth10a-integration-guide':
        result = { guide: INTEGRATION_GUIDES.oauth10a };
        break;
      case 'get-oauth20-integration-guide':
        result = { guide: INTEGRATION_GUIDES.oauth20 };
        break;
      case 'get-openfinance-integration-guide':
        result = { guide: INTEGRATION_GUIDES.openfinance };
        break;
      case 'get-api-operation-list':
        result = API_OPERATIONS[toolParams.serviceId || 'cross-border-services'] || { error: "Service not found" };
        break;
      case 'get-api-operation-details':
        const ops = API_OPERATIONS[toolParams.serviceId || 'cross-border-services'] || [];
        const op = ops.find(o => o.path === toolParams.operationPath) || ops[0];
        result = op || { error: "Operation not found" };
        break;
      default:
        result = { error: "Unknown tool" };
    }

    addLog('received', `JSON-RPC Response: { jsonrpc: "2.0", result: { ... } }`);
    setToolResult(result);
    setIsExecutingTool(false);
  };

  // ==========================================
  // UTILITIES
  // ==========================================

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredServices = useMemo(() => {
    return SERVICES.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans">
      {/* ==========================================
          TOP HEADER & CONNECTION BAR
          ========================================== */}
      <div className="bg-slate-900/80 border-b border-slate-800 p-4 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center font-bold text-white shadow-lg shadow-amber-500/20">
              M
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                Griffin MCP Command Center
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Mastercard Developers Agent Toolkit
                </span>
              </h1>
              <p className="text-xs text-slate-400">Model Context Protocol (MCP) Client Interface for Service Discovery & Integration Guides</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Transport:</span>
            <select 
              value={connectionMode} 
              onChange={(e) => setConnectionMode(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="simulated">Simulated Sandbox</option>
              <option value="remote">Remote HTTP (mcp.mastercard.com)</option>
              <option value="local">Local Stdio (npx -y @mastercard/...)</option>
            </select>
          </div>

          {connectionMode === 'remote' && (
            <input 
              type="text" 
              value={serverUrl} 
              onChange={(e) => setServerUrl(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500 w-48"
            />
          )}

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <span className={`w-2.5 h-2.5 rounded-full ${
              connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
              connectionStatus === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-xs font-medium capitalize text-slate-300">{connectionStatus}</span>
          </div>

          <button 
            onClick={handleReconnect}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Reconnect Server"
          >
            <RefreshIcon />
          </button>
        </div>
      </div>

      {/* ==========================================
          MAIN CONTENT AREA
          ========================================== */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT NAVIGATION PANEL */}
        <div className="w-64 bg-slate-900/40 border-r border-slate-800/80 flex flex-col justify-between">
          <div className="p-4 space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Command Center</div>
            
            <button 
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'chat' 
                  ? 'bg-gradient-to-r from-amber-500/10 to-red-500/10 text-amber-400 border border-amber-500/20 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <ChatIcon />
              AI Agent Assistant
            </button>

            <button 
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'services' 
                  ? 'bg-gradient-to-r from-amber-500/10 to-red-500/10 text-amber-400 border border-amber-500/20 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <GlobeIcon />
              Service Discovery
            </button>

            <button 
              onClick={() => setActiveTab('api')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'api' 
                  ? 'bg-gradient-to-r from-amber-500/10 to-red-500/10 text-amber-400 border border-amber-500/20 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <CodeIcon />
              API Specification Explorer
            </button>

            <button 
              onClick={() => setActiveTab('guides')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'guides' 
                  ? 'bg-gradient-to-r from-amber-500/10 to-red-500/10 text-amber-400 border border-amber-500/20 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <BookOpenIcon />
              Integration Guides
            </button>

            <button 
              onClick={() => setActiveTab('tools')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'tools' 
                  ? 'bg-gradient-to-r from-amber-500/10 to-red-500/10 text-amber-400 border border-amber-500/20 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <CpuIcon />
              Raw Tool Runner
            </button>
          </div>

          {/* REAL-TIME PROTOCOL CONSOLE LOGS */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Protocol Console</span>
              <button 
                onClick={() => setConsoleLogs([])}
                className="text-[10px] text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            </div>
            <div className="h-40 overflow-y-auto font-mono text-[10px] space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
              {consoleLogs.length === 0 ? (
                <div className="text-slate-600 italic">No protocol events logged yet.</div>
              ) : (
                consoleLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    <span className="text-slate-600">[{log.timestamp}]</span>{' '}
                    <span className={`font-semibold ${
                      log.type === 'sent' ? 'text-blue-400' :
                      log.type === 'received' ? 'text-emerald-400' :
                      log.type === 'error' ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {log.type === 'sent' ? '--> ' : log.type === 'received' ? '<-- ' : ''}
                    </span>
                    <span className="text-slate-300">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/20">
          
          {/* ==========================================
              TAB 1: AI AGENT ASSISTANT
              ========================================== */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-3xl rounded-2xl p-4 border ${
                      msg.sender === 'user' 
                        ? 'bg-amber-500/10 border-amber-500/20 text-slate-100' 
                        : 'bg-slate-900/80 border-slate-800 text-slate-300'
                    }`}>
                      {/* Sender Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          msg.sender === 'user' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400'
                        }`}>
                          {msg.sender === 'user' ? 'U' : 'AI'}
                        </div>
                        <span className="text-xs font-semibold text-slate-400">
                          {msg.sender === 'user' ? 'You' : 'Mastercard Developers Agent'}
                        </span>
                      </div>

                      {/* Message Text */}
                      {msg.text && (
                        <div className="text-sm leading-relaxed whitespace-pre-wrap space-y-2">
                          {msg.text.split('\n').map((line, i) => {
                            if (line.startsWith('* **')) {
                              const match = line.match(/\* \*\*(.*?)\*\* \((.*?)\): (.*)/);
                              if (match) {
                                return (
                                  <div key={i} className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 my-2 flex justify-between items-center">
                                    <div>
                                      <h4 className="font-bold text-slate-200">{match[1]}</h4>
                                      <p className="text-xs text-slate-400">{match[3]}</p>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        setSelectedService(match[2]);
                                        setActiveTab('services');
                                      }}
                                      className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg transition-all"
                                    >
                                      Explore Docs
                                    </button>
                                  </div>
                                );
                              }
                            }
                            return <p key={i}>{line}</p>;
                          })}
                        </div>
                      )}

                      {/* Thinking State */}
                      {msg.isThinking && (
                        <div className="flex items-center gap-3 text-xs text-slate-400 italic">
                          <svg className="animate-spin h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {msg.thinkingText}
                        </div>
                      )}

                      {/* Tool Call Block */}
                      {msg.toolCall && (
                        <div className="mt-2 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
                          <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex justify-between items-center">
                            <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                              <CpuIcon />
                              Tool Call: {msg.toolCall.name}
                            </span>
                            <span className="text-[10px] text-slate-500">Model Context Protocol</span>
                          </div>
                          <div className="p-3 space-y-2">
                            <div>
                              <span className="text-slate-500">Arguments:</span>
                              <pre className="text-slate-300 mt-1 bg-slate-900/50 p-2 rounded border border-slate-800/40 overflow-x-auto">
                                {JSON.stringify(msg.toolCall.args, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <span className="text-slate-500">Response:</span>
                              <pre className="text-emerald-400 mt-1 bg-slate-900/50 p-2 rounded border border-slate-800/40 overflow-x-auto max-h-40 overflow-y-auto">
                                {JSON.stringify(msg.toolCall.response, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Suggestions */}
              <div className="px-6 py-3 bg-slate-950/40 border-t border-slate-800/60 flex flex-wrap gap-2">
                <button 
                  onClick={() => handleSendMessage("What services are available on Mastercard Developers?")}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-full transition-all"
                >
                  🔍 List Services
                </button>
                <button 
                  onClick={() => handleSendMessage("How do I integrate with OAuth 1.0a?")}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-full transition-all"
                >
                  🔑 OAuth 1.0a Guide
                </button>
                <button 
                  onClick={() => handleSendMessage("Show me the API operations for Cross Border Services.")}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-full transition-all"
                >
                  💳 Cross Border APIs
                </button>
                <button 
                  onClick={() => handleSendMessage("What is the security profile for Open Finance?")}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-full transition-all"
                >
                  🛡️ Open Finance Security
                </button>
              </div>

              {/* Input Bar */}
              <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex gap-3">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                  placeholder="Ask the AI Agent about Mastercard Developers services, guides, or APIs..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <button 
                  onClick={() => handleSendMessage(inputText)}
                  className="bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-slate-950 font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/10"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 2: SERVICE DISCOVERY
              ========================================== */}
          {activeTab === 'services' && (
            <div className="flex-1 flex flex-col overflow-hidden p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Service Discovery</h2>
                  <p className="text-xs text-slate-400">Discovered Mastercard Developers Products and Services via `get-services-list`</p>
                </div>
                <div className="relative w-64">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search services..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                  <div className="absolute left-3 top-2.5 text-slate-500">
                    <SearchIcon />
                  </div>
                </div>
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto flex-1 pr-2">
                {filteredServices.map((service) => (
                  <div 
                    key={service.id}
                    className={`bg-slate-900/60 border rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 ${
                      selectedService === service.id ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-slate-800/80'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/50">
                          {service.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">ID: {service.id}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-200 mb-2">{service.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">{service.description}</p>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-800/60">
                      <button 
                        onClick={() => {
                          setSelectedService(service.id);
                          setSelectedDocSection('overview');
                          setActiveTab('services'); // Keep on services but show details
                        }}
                        className="flex-1 text-center text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg transition-all border border-slate-700/50"
                      >
                        Explore Docs
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedService(service.id);
                          setActiveTab('api');
                        }}
                        className="flex-1 text-center text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 py-2 rounded-lg transition-all border border-amber-500/20"
                      >
                        View APIs
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Service Documentation Panel */}
              {selectedService && DOCUMENTATION[selectedService] && (
                <div className="mt-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col md:flex-row gap-6 h-80 overflow-hidden">
                  <div className="w-full md:w-64 border-r border-slate-800/60 pr-4 flex flex-col gap-1 overflow-y-auto">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Documentation Sections</div>
                    {DOCUMENTATION[selectedService].map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setSelectedDocSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          selectedDocSection === section.id 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        }`}
                      >
                        {section.title}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2">
                    <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed">
                      {DOC_CONTENT[`${selectedService}/${selectedDocSection}`] ? (
                        <div className="space-y-4">
                          {DOC_CONTENT[`${selectedService}/${selectedDocSection}`].split('\n').map((line, i) => {
                            if (line.startsWith('# ')) {
                              return <h3 key={i} className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">{line.replace('# ', '')}</h3>;
                            }
                            if (line.startsWith('### ')) {
                              return <h4 key={i} className="text-sm font-bold text-amber-400 mt-4">{line.replace('### ', '')}</h4>;
                            }
                            if (line.startsWith('* ')) {
                              return <li key={i} className="ml-4 list-disc">{line.replace('* ', '')}</li>;
                            }
                            if (line.startsWith('`')) {
                              return <pre key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">{line.replace(/`/g, '')}</pre>;
                            }
                            return <p key={i}>{line}</p>;
                          })}
                        </div>
                      ) : (
                        <div className="text-slate-500 italic">Select a section to view content.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              TAB 3: API SPECIFICATION EXPLORER
              ========================================== */}
          {activeTab === 'api' && (
            <div className="flex-1 flex flex-col overflow-hidden p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">API Specification Explorer</h2>
                  <p className="text-xs text-slate-400">Browse API operations, request/response schemas, and parameters via `get-api-operation-list`</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Select Service:</span>
                  <select 
                    value={selectedService} 
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {SERVICES.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* API Operations List */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {API_OPERATIONS[selectedService] ? (
                  API_OPERATIONS[selectedService].map((op, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden">
                      {/* Operation Header */}
                      <div className="bg-slate-900/80 px-5 py-4 border-b border-slate-800/60 flex flex-wrap justify-between items-center gap-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            op.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            op.method === 'GET' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {op.method}
                          </span>
                          <span className="font-mono text-xs text-slate-300 font-semibold">{op.path}</span>
                          <span className="text-xs text-slate-500">|</span>
                          <span className="text-xs font-medium text-slate-200">{op.title}</span>
                        </div>
                        <span className="text-xs text-slate-400 italic">{op.description}</span>
                      </div>

                      {/* Operation Details */}
                      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Parameters */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Request Parameters</h4>
                          {op.parameters && op.parameters.length > 0 ? (
                            <div className="border border-slate-800/80 rounded-xl overflow-hidden">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                                    <th className="p-3">Name</th>
                                    <th className="p-3">In</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Required</th>
                                    <th className="p-3">Description</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                                  {op.parameters.map((p, pIdx) => (
                                    <tr key={pIdx} className="hover:bg-slate-900/20">
                                      <td className="p-3 font-mono text-amber-400">{p.name}</td>
                                      <td className="p-3 capitalize">{p.in}</td>
                                      <td className="p-3 font-mono text-slate-400">{p.type}</td>
                                      <td className="p-3">
                                        {p.required ? (
                                          <span className="text-red-400 font-semibold">Yes</span>
                                        ) : 'No'}
                                      </td>
                                      <td className="p-3 text-slate-400">{p.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500 italic bg-slate-950/20 p-4 rounded-xl border border-slate-800/40">
                              No request parameters required.
                            </div>
                          )}

                          {/* Request Body Schema */}
                          {op.requestSchema && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Request Body Schema</h4>
                                <button 
                                  onClick={() => handleCopy(JSON.stringify(op.requestSchema, null, 2), `req-${idx}`)}
                                  className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                                >
                                  {copiedText === `req-${idx}` ? <CheckIcon /> : <CopyIcon />}
                                  {copiedText === `req-${idx}` ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-60 overflow-y-auto">
                                {JSON.stringify(op.requestSchema, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>

                        {/* Right: Response Schema */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Response Schema (200 OK)</h4>
                            <button 
                              onClick={() => handleCopy(JSON.stringify(op.responseSchema, null, 2), `res-${idx}`)}
                              className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                            >
                              {copiedText === `res-${idx}` ? <CheckIcon /> : <CopyIcon />}
                              {copiedText === `res-${idx}` ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-80 overflow-y-auto">
                            {JSON.stringify(op.responseSchema, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic text-center py-12">No API operations found for this service.</div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 4: INTEGRATION GUIDES
              ========================================== */}
          {activeTab === 'guides' && (
            <div className="flex-1 flex flex-col overflow-hidden p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Integration Guides</h2>
                  <p className="text-xs text-slate-400">Comprehensive security and integration guides retrieved via dedicated MCP tools</p>
                </div>
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button 
                    onClick={() => setSelectedDocSection('oauth10a')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedDocSection === 'oauth10a' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    OAuth 1.0a
                  </button>
                  <button 
                    onClick={() => setSelectedDocSection('oauth20')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedDocSection === 'oauth20' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    OAuth 2.0
                  </button>
                  <button 
                    onClick={() => setSelectedDocSection('openfinance')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedDocSection === 'openfinance' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Open Finance
                  </button>
                </div>
              </div>

              {/* Guide Content Reader */}
              <div className="flex-1 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto prose prose-invert text-slate-300 text-sm leading-relaxed space-y-6">
                  {selectedDocSection === 'oauth10a' && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-3">Mastercard OAuth 1.0a Integration Guide</h3>
                      <p>Mastercard uses a custom OAuth 1.0a signature mechanism to secure API requests. Every request must include an <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-400 font-mono text-xs">Authorization</code> header containing a cryptographic signature.</p>
                      
                      <h4 className="text-base font-bold text-amber-400 mt-6">Signature Components</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Consumer Key</strong>: Provided in your Mastercard Developers project.</li>
                        <li><strong>Signature Method</strong>: <code className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-300 font-mono text-xs">RSA-SHA256</code></li>
                        <li><strong>Timestamp</strong>: Current epoch time in seconds.</li>
                        <li><strong>Nonce</strong>: A unique, random string for each request.</li>
                        <li><strong>Signature</strong>: Base64 encoded RSA signature of the Signature Base String.</li>
                      </ul>

                      <h4 className="text-base font-bold text-amber-400 mt-6">Step-by-Step Implementation</h4>
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                        <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider">1. Generate the Signature Base String</h5>
                        <p className="text-xs text-slate-400">The Signature Base String is a concatenation of the HTTP Method, percent-encoded Base URL, and sorted query parameters.</p>
                        
                        <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider mt-4">2. Sign the Base String</h5>
                        <p className="text-xs text-slate-400">Sign the Signature Base String using your private key (<code className="bg-slate-950 px-1 py-0.5 rounded text-slate-300 font-mono text-[10px]">.p12</code> file) with the SHA-256 hashing algorithm.</p>
                      </div>

                      <h4 className="text-base font-bold text-amber-400 mt-6">Authorization Header Format</h4>
                      <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
{`Authorization: OAuth oauth_consumer_key="your-consumer-key",
                     oauth_signature_method="RSA-SHA256",
                     oauth_timestamp="1784392800",
                     oauth_nonce="random-nonce-string",
                     oauth_version="1.0",
                     oauth_signature="base64-encoded-signature"`}
                      </pre>
                    </div>
                  )}

                  {selectedDocSection === 'oauth20' && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-3">Mastercard OAuth 2.0 Integration Guide</h3>
                      <p>Certain modern Mastercard APIs utilize OAuth 2.0 Client Credentials grant flow for authentication.</p>

                      <h4 className="text-base font-bold text-amber-400 mt-6">Authentication Flow</h4>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li><strong>Request Access Token</strong>: Send a POST request to the token endpoint with your client credentials.</li>
                        <li><strong>Receive Token</strong>: The server returns an access token and its expiration time.</li>
                        <li><strong>Call API</strong>: Include the token in the <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-400 font-mono text-xs">Authorization: Bearer &lt;token&gt;</code> header of your API requests.</li>
                      </ol>

                      <h4 className="text-base font-bold text-amber-400 mt-6">Token Request Example</h4>
                      <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
{`POST /oauth2/token HTTP/1.1
Host: api.mastercard.com
Content-Type: application/x-www-form-urlencoded
Authorization: Basic <base64-encoded-client-id-and-secret>

grant_type=client_credentials`}
                      </pre>

                      <h4 className="text-base font-bold text-amber-400 mt-6">Token Response Example</h4>
                      <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
{`{
  "access_token": "mc_oauth_token_982374923874",
  "token_type": "Bearer",
  "expires_in": 3600
}`}
                      </pre>
                    </div>
                  )}

                  {selectedDocSection === 'openfinance' && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-3">Mastercard Open Finance Integration Guide</h3>
                      <p>Mastercard Open Finance APIs adhere to the Financial-grade API (FAPI) 2.0 Security Profile to ensure the highest level of security for financial data sharing.</p>

                      <h4 className="text-base font-bold text-amber-400 mt-6">Key Security Requirements</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Mutual TLS (mTLS)</strong>: Required for both transport security and client authentication.</li>
                        <li><strong>JWS/JWE</strong>: Request and response payloads must be signed (JWS) and encrypted (JWE).</li>
                        <li><strong>Consent Management</strong>: Explicit user consent must be obtained and managed via OAuth 2.0 authorization flows.</li>
                      </ul>

                      <h4 className="text-base font-bold text-amber-400 mt-6">Integration Steps</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                          <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-2">1. Establish mTLS Connection</h5>
                          <p className="text-xs text-slate-400">Configure your HTTP client with your Mastercard-issued client certificate to establish a secure mutual TLS tunnel.</p>
                        </div>
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                          <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-2">2. Obtain Consent</h5>
                          <p className="text-xs text-slate-400">Redirect the user to the bank's authorization page to grant access to their financial accounts and transaction history.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 5: RAW TOOL RUNNER
              ========================================== */}
          {activeTab === 'tools' && (
            <div className="flex-1 flex flex-col overflow-hidden p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-100">Raw Tool Runner</h2>
                <p className="text-xs text-slate-400">Directly execute Model Context Protocol (MCP) tools and inspect raw JSON-RPC payloads</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                {/* Left: Tool Selection & Parameters */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select MCP Tool</label>
                      <select 
                        value={selectedTool} 
                        onChange={(e) => {
                          setSelectedTool(e.target.value);
                          setToolParams({});
                          setToolResult(null);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="get-services-list">get-services-list</option>
                        <option value="get-documentation">get-documentation</option>
                        <option value="get-documentation-section-content">get-documentation-section-content</option>
                        <option value="get-oauth10a-integration-guide">get-oauth10a-integration-guide</option>
                        <option value="get-oauth20-integration-guide">get-oauth20-integration-guide</option>
                        <option value="get-openfinance-integration-guide">get-openfinance-integration-guide</option>
                        <option value="get-api-operation-list">get-api-operation-list</option>
                        <option value="get-api-operation-details">get-api-operation-details</option>
                      </select>
                    </div>

                    {/* Dynamic Parameters Form */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tool Parameters</h4>
                      
                      {selectedTool === 'get-services-list' && (
                        <p className="text-xs text-slate-500 italic">No parameters required for this tool.</p>
                      )}

                      {(selectedTool === 'get-documentation' || selectedTool === 'get-api-operation-list') && (
                        <div>
                          <label className="block text-xs text-slate-400 mb-1.5">serviceId (required)</label>
                          <input 
                            type="text" 
                            placeholder="e.g., cross-border-services"
                            value={toolParams.serviceId || ''}
                            onChange={(e) => setToolParams(prev => ({ ...prev, serviceId: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      )}

                      {selectedTool === 'get-documentation-section-content' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-slate-400 mb-1.5">serviceId (required)</label>
                            <input 
                              type="text" 
                              placeholder="e.g., cross-border-services"
                              value={toolParams.serviceId || ''}
                              onChange={(e) => setToolParams(prev => ({ ...prev, serviceId: e.target.value }))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1.5">sectionId (required)</label>
                            <input 
                              type="text" 
                              placeholder="e.g., getting-started"
                              value={toolParams.sectionId || ''}
                              onChange={(e) => setToolParams(prev => ({ ...prev, sectionId: e.target.value }))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      )}

                      {selectedTool === 'get-api-operation-details' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-slate-400 mb-1.5">serviceId (required)</label>
                            <input 
                              type="text" 
                              placeholder="e.g., cross-border-services"
                              value={toolParams.serviceId || ''}
                              onChange={(e) => setToolParams(prev => ({ ...prev, serviceId: e.target.value }))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1.5">operationPath (required)</label>
                            <input 
                              type="text" 
                              placeholder="e.g., /transfers"
                              value={toolParams.operationPath || ''}
                              onChange={(e) => setToolParams(prev => ({ ...prev, operationPath: e.target.value }))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      )}

                      {selectedTool.startsWith('get-oauth') && (
                        <p className="text-xs text-slate-500 italic">No parameters required for this tool.</p>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={handleExecuteTool}
                    disabled={isExecutingTool}
                    className="w-full bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-slate-950 font-semibold py-3 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 mt-6"
                  >
                    {isExecutingTool ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Executing Tool...
                      </>
                    ) : (
                      <>
                        <CpuIcon />
                        Execute Tool
                      </>
                    )}
                  </button>
                </div>

                {/* Right: JSON-RPC Payloads & Result */}
                <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
                  {/* JSON-RPC Request Payload */}
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col h-1/3 overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">JSON-RPC Request Payload</span>
                      <button 
                        onClick={() => handleCopy(JSON.stringify({
                          jsonrpc: "2.0",
                          id: 1,
                          method: "tools/call",
                          params: {
                            name: selectedTool,
                            arguments: toolParams
                          }
                        }, null, 2), 'req-payload')}
                        className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                      >
                        {copiedText === 'req-payload' ? <CheckIcon /> : <CopyIcon />}
                        {copiedText === 'req-payload' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-blue-400 overflow-y-auto flex-1">
                      {JSON.stringify({
                        jsonrpc: "2.0",
                        id: 1,
                        method: "tools/call",
                        params: {
                          name: selectedTool,
                          arguments: toolParams
                        }
                      }, null, 2)}
                    </pre>
                  </div>

                  {/* JSON-RPC Response Payload */}
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col h-2/3 overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">JSON-RPC Response Result</span>
                      {toolResult && (
                        <button 
                          onClick={() => handleCopy(JSON.stringify(toolResult, null, 2), 'res-payload')}
                          className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                        >
                          {copiedText === 'res-payload' ? <CheckIcon /> : <CopyIcon />}
                          {copiedText === 'res-payload' ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-y-auto flex-1">
                      {toolResult ? (
                        <pre>{JSON.stringify({
                          jsonrpc: "2.0",
                          id: 1,
                          result: {
                            content: [
                              {
                                type: "text",
                                text: JSON.stringify(toolResult, null, 2)
                              }
                            ]
                          }
                        }, null, 2)}</pre>
                      ) : (
                        <div className="text-slate-600 italic h-full flex items-center justify-center">
                          Execute the tool to view the raw JSON-RPC response payload.
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