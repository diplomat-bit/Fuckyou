export { BankingAccountTable, MoneyTransferOrder } from './accounts';
export { Transaction, TransactionStatus } from './transactions';
export { SovereignAuditEntry } from './sovereign_audit';
export { RealEstateHouseAcquisition, BusinessDeal } from './business_deals';
export { GovernmentServicesTable } from './accounts';

/**
 * ============================================================================
 * SOVEREIGN AI BANKING, RESEARCH PAPER ENGINE & SUPER-GOVERNMENT PLATFORM SCHEMA
 * ============================================================================
 * This table schema registry powers:
 * 1. Deep Research Paper Bibliography & Interactive "Nuts & Bolts" Structural Rendering
 * 2. Conversational Paper AI Engine ("Talk Back" Multimodal Synthesis & RAG Context)
 * 3. Autonomous AI Banking, High-Frequency Money Settlement & Yield Optimization
 * 4. Automated Real Estate Acquisition, Deed Transfer & Mortgage Underwriting ("Buy a House")
 * 5. Sovereign Government Operations (ID, Taxes, Permits, Treasury, Legislation & Audits)
 */

export interface Author {
  id: string;
  name: string;
  affiliation: string;
  orcid?: string;
  hIndex?: number;
}

export interface CitationRef {
  citationKey: string;
  title: string;
  authors: string[];
  year: number;
  doi?: string;
  journalOrArxiv?: string;
}

export interface PaperNutAndBoltComponent {
  componentId: string;
  name: string;
  category: 'architecture' | 'equation' | 'algorithm' | 'hyperparameters' | 'proof' | 'hardware';
  description: string;
  latexSymbol?: string;
  formulaTex?: string;
  codeSnippet?: string;
  complexityOrder?: string;
  visualDiagramType?: 'flowchart' | 'matrix' | 'tree' | 'layer_stack' | 'circuit';
  rawSpecs: Record<string, string | number | boolean>;
}

export interface ResearchPaper {
  id: string;
  doi: string;
  arxivId?: string;
  title: string;
  authors: Author[];
  publicationDate: string;
  venue: string;
  abstract: string;
  bibtex: string;
  pdfUrl: string;
  topics: string[];
  citationCount: number;
  nutsAndBolts: PaperNutAndBoltComponent[];
  fullTextSections: {
    sectionId: string;
    title: string;
    contentMarkdown: string;
    latexEquations?: string[];
  }[];
  interactiveTalkbackConfig: {
    systemPrompt: string;
    voiceId: string;
    audioFrequencyHz: number;
    ragVectorNamespace: string;
    allowedCapabilities: ('explain' | 'derive_proof' | 'execute_simulation' | 'trigger_banking_action')[];
  };
}

export interface PaperTalkbackMessage {
  id: string;
  sessionId: string;
  paperId: string;
  sender: 'user' | 'paper_ai' | 'system';
  content: string;
  timestamp: string;
  audioUrl?: string;
  referencedEquations?: string[];
  citedSectionId?: string;
  executedAction?: {
    actionType: 'explain' | 'derive_proof' | 'execute_simulation' | 'trigger_banking_action';
    payload: Record<string, unknown>;
    status: 'pending' | 'completed' | 'failed';
    transactionHash?: string;
  };
}

export interface PaperTalkbackSession {
  sessionId: string;
  userId: string;
  paperId: string;
  startedAt: string;
  activeVoiceMode: boolean;
  voiceSynthesisEngine: 'elevenlabs' | 'openai_realtime' | 'deepgram' | 'native_sovereign';
  messages: PaperTalkbackMessage[];
  contextVectorEmbeddingsCount: number;
}

export interface BankingAccountTable {
  id: string;
  userId: string;
  accountType: 'sovereign_checking' | 'ai_yield_vault' | 'cbdc_treasury' | 'institutional_escrow' | 'high_yield_reserve';
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'USDC' | 'BTC' | 'ETH' | 'SOVEREIGN_CREDIT';
  balanceMicroUnits: bigint;
  availableBalanceMicroUnits: bigint;
  interestRateAPY: number;
  routingNumber: string;
  accountNumberHash: string;
  isAiManaged: boolean;
  maxAutonomousTransferLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface MoneyTransferOrder {
  id: string;
  sourceAccountId: string;
  destinationAccountOrIban: string;
  recipientName: string;
  amountMicroUnits: bigint;
  currency: string;
  transferType: 'instant_fednow' | 'swift' | 'sepa_instant' | 'onchain_zero_knowledge' | 'internal_sovereign';
  memo: string;
  triggeredByPaperTalkbackId?: string;
  status: 'initiated' | 'cleared' | 'settled' | 'flagged' | 'rejected';
  sovereignAuditTraceId: string;
  timestamp: string;
}

export interface RealEstateHouseAcquisition {
  acquisitionId: string;
  buyerUserId: string;
  propertyAddress: {
    street: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    country: string;
    parcelNumber: string;
  };
  valuationUSD: number;
  offeredPriceUSD: number;
  escrowStatus: 'offered' | 'under_inspection' | 'mortgage_underwritten' | 'deed_stamped' | 'completed';
  titleDeedSmartContractAddress: string;
  mortgageTermYears: number;
  interestRateAnnual: number;
  monthlyPaymentUSD: number;
  automatedDeedRegistration: {
    municipalRegistryId: string;
    taxAssessorId: string;
    zoningCode: string;
    isGovernmentNotarized: boolean;
    digitalDeedHash: string;
  };
  initiatedViaPaperId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface SovereignGovernmentService {
  serviceId: string;
  userId: string;
  category: 'sovereign_identity' | 'tax_filing' | 'real_estate_deed' | 'business_incorporation' | 'passport_issuance' | 'legislative_vote' | 'public_treasury_audit';
  title: string;
  description: string;
  status: 'draft' | 'submitted' | 'processing' | 'approved_by_sovereign_ai' | 'enacted';
  officialDocHash: string;
  executionPayload: Record<string, unknown>;
  publicAuditLedgerRef: string;
  timestamp: string;
}

/**
 * Curated Research Papers Bibliography Database with Nuts & Bolts Breakdown
 */
export const RESEARCH_PAPERS_BIBLIOGRAPHY: ResearchPaper[] = [
  {
    id: 'paper-attention-2017',
    doi: '10.48550/arXiv.1706.03762',
    arxivId: '1706.03762',
    title: 'Attention Is All You Need',
    authors: [
      { id: 'a1', name: 'Ashish Vaswani', affiliation: 'Google Brain' },
      { id: 'a2', name: 'Noam Shazeer', affiliation: 'Google Brain' },
      { id: 'a3', name: 'Niki Parmar', affiliation: 'Google Research' },
      { id: 'a4', name: 'Jakob Uszkoreit', affiliation: 'Google Research' },
      { id: 'a5', name: 'Llion Jones', affiliation: 'Google Research' },
      { id: 'a6', name: 'Aidan N. Gomez', affiliation: 'University of Toronto' },
      { id: 'a7', name: 'Å ukasz Kaiser', affiliation: 'Google Brain' },
      { id: 'a8', name: 'Illia Polosukhin', affiliation: 'Google' },
    ],
    publicationDate: '2017-06-12',
    venue: 'Advances in Neural Information Processing Systems (NeurIPS 2017)',
    abstract:
      'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks in an encoder-decoder configuration. We propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output.',
    bibtex: `@inproceedings{vaswani2017attention,
  title={Attention is all you need},
  author={Vaswani, Ashish and Shazeer, Noam and Parmar, Niki and Uszkoreit, Jakob and Jones, Llion and Gomez, Aidan N and Kaiser, {\ Lukasz} and Polosukhin, Illia},
  booktitle={Advances in neural information processing systems},
  pages={5998--6008},
  year={2017}
}`,
    pdfUrl: 'https://arxiv.org/pdf/1706.03762.pdf',
    topics: ['Attention Mechanism', 'Transformers', 'Deep Learning', 'NLP', 'AI Architecture'],
    citationCount: 125000,
    nutsAndBolts: [
      {
        componentId: 'nut-scaled-dot-product',
        name: 'Scaled Dot-Product Attention',
        category: 'equation',
        description: 'Computes attention weights on queries Q, keys K, and values V scaled by square root of key dimension d_k.',
        latexSymbol: '\\text{Attention}(Q, K, V)',
        formulaTex: '\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
        complexityOrder: 'O(N^2 \\cdot d)',
        visualDiagramType: 'matrix',
        rawSpecs: { d_k: 64, d_model: 512, scalingFactor: '1/sqrt(64) = 0.125' },
      },
      {
        componentId: 'nut-multi-head-attention',
        name: 'Multi-Head Attention (MHA)',
        category: 'architecture',
        description: 'Allows the model to jointly attend to information from different representation subspaces at different positions.',
        latexSymbol: '\\text{MultiHead}(Q, K, V)',
        formulaTex: '\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, ..., \\text{head}_h)W^O',
        complexityOrder: 'O(h \\cdot N^2 \\cdot d_k)',
        visualDiagramType: 'layer_stack',
        rawSpecs: { h_heads: 8, d_model: 512, d_k: 64, d_v: 64 },
      },
      {
        componentId: 'nut-positional-encoding',
        name: 'Sinusoidal Positional Encoding',
        category: 'architecture',
        description: 'Injects sequence order information into input embeddings using sine and cosine functions of varying frequencies.',
        latexSymbol: 'PE_{(pos, 2i)}',
        formulaTex: 'PE_{(pos, 2i)} = \\sin\\left(\\frac{pos}{10000^{2i/d_{\\text{model}}}}\\right)',
        visualDiagramType: 'flowchart',
        rawSpecs: { maxSequenceLength: 512, dimension: 512, basePeriod: 10000 },
      },
    ],
    fullTextSections: [
      {
        sectionId: 'sec-intro',
        title: '1. Introduction',
        contentMarkdown:
          'Recurrent neural networks, particularly long short-term memory (LSTM) and gated recurrent (GRU) neural networks, have been firmly established as state of the art approaches in sequence modeling.',
      },
      {
        sectionId: 'sec-architecture',
        title: '3. Model Architecture',
        contentMarkdown:
          'Most competitive neural sequence transduction models have an encoder-decoder structure. Here, the encoder maps an input sequence of symbol representations to a sequence of continuous representations.',
        latexEquations: [
          '\\text{Attention}(Q,K,V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
        ],
      },
    ],
    interactiveTalkbackConfig: {
      systemPrompt:
        'You are the Attention Is All You Need Paper AI Agent. Answer questions about self-attention, transformers, and compute execution of financial transactions.',
      voiceId: '21m00Tcm4TlvDq8ikWAM',
      audioFrequencyHz: 44100,
      ragVectorNamespace: 'rag-attention-2017',
      allowedCapabilities: ['explain', 'derive_proof', 'execute_simulation', 'trigger_banking_action'],
    },
  },
  {
    id: 'paper-bitcoin-2008',
    doi: '10.5555/bitcoin-pdf',
    title: 'Bitcoin: A Peer-to-Peer Electronic Cash System',
    authors: [{ id: 'a-satoshi', name: 'Satoshi Nakamoto', affiliation: 'Independent' }],
    publicationDate: '2008-10-31',
    venue: 'Cryptology ePrint Archive',
    abstract:
      'A purely peer-to-peer version of electronic cash would allow online payments to be sent directly from one party to another without going through a financial institution. Digital signatures provide part of the solution, but the main benefits are lost if a trusted third party is still required to prevent double-spending.',
    bibtex: `@techreport{nakamoto2008bitcoin,
  title={Bitcoin: A peer-to-peer electronic cash system},
  author={Nakamoto, Satoshi},
  year={2008},
  institution={Decentralized Ledger Foundation}
}`,
    pdfUrl: 'https://bitcoin.org/bitcoin.pdf',
    topics: ['Cryptography', 'Peer-to-Peer', 'Proof of Work', 'Consensus Algorithms', 'Sovereign Banking'],
    citationCount: 45000,
    nutsAndBolts: [
      {
        componentId: 'nut-proof-of-work',
        name: 'SHA-256 Proof of Work Consensus',
        category: 'proof',
        description: 'Requires scanning for a value that when hashed, such as with SHA-256, the hash begins with a number of zero bits.',
        latexSymbol: '\\text{SHA-256}(\\text{BlockHeader} \\mathbin{\\Vert} \\text{Nonce}) < \\text{Target}',
        formulaTex: '\\text{SHA-256}(\\text{SHA-256}(BlockHeader)) \\le Target',
        complexityOrder: 'O(2^{\\text{difficulty}})',
        visualDiagramType: 'circuit',
        rawSpecs: { blockTimeMinutes: 10, difficultyAdjustmentIntervalBlocks: 2016, totalMaxSupply: 21000000 },
      },
      {
        componentId: 'nut-utxo-tree',
        name: 'UTXO Transaction Graph',
        category: 'architecture',
        description: 'Unspent Transaction Output model ensuring double-spend protection via merkle root validation.',
        visualDiagramType: 'tree',
        rawSpecs: { hashingAlgorithm: 'Double SHA-256', signatureType: 'ECDSA secp256k1' },
      },
    ],
    fullTextSections: [
      {
        sectionId: 'sec-pow',
        title: '4. Proof-of-Work',
        contentMarkdown:
          'To implement a distributed timestamp server on a peer-to-peer basis, we will need to use a proof-of-work system similar to Adam Back\'s Hashcash.',
      },
    ],
    interactiveTalkbackConfig: {
      systemPrompt:
        'You are the Bitcoin Genesis Paper AI Agent. You specialize in decentralized money transfer, self-sovereignty, and autonomous banking.',
      voiceId: 'AZnzlk1XvdvUeBnXmlld',
      audioFrequencyHz: 48000,
      ragVectorNamespace: 'rag-bitcoin-2008',
      allowedCapabilities: ['explain', 'trigger_banking_action'],
    },
  },
  {
    id: 'paper-ethereum-smart-contracts-2014',
    doi: '10.1007/ethereum-paper',
    title: 'Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform',
    authors: [{ id: 'a-vitalik', name: 'Vitalik Buterin', affiliation: 'Ethereum Foundation' }],
    publicationDate: '2014-01-23',
    venue: 'Ethereum Whitepaper',
    abstract:
      'An architecture for creating arbitrary state transition systems via Turing-complete cryptographic smart contracts, allowing automated escrow, mortgage underwriting, title registry, and transparent government services.',
    bibtex: `@article{buterin2014ethereum,
  title={Ethereum white paper},
  author={Buterin, Vitalik and others},
  journal={GitHub repository},
  volume={1},
  pages={22-35},
  year={2014}
}`,
    pdfUrl: 'https://ethereum.org/en/whitepaper/',
    topics: ['Smart Contracts', 'Real Estate Escrow', 'EVM', 'State Machine', 'Sovereign Governance'],
    citationCount: 38000,
    nutsAndBolts: [
      {
        componentId: 'nut-evm-state-transition',
        name: 'EVM State Transition Function',
        category: 'algorithm',
        description: 'State transition function S\' = \\Upsilon(S, T) computing atomic transaction state changes.',
        formulaTex: '\\sigma_{t+1} = \\Upsilon(\\sigma_t, T)',
        visualDiagramType: 'flowchart',
        rawSpecs: { stackSize: 1024, wordSizeBits: 256, gasMetering: 'Dynamic Opcode Cost' },
      },
      {
        componentId: 'nut-real-estate-escrow-contract',
        name: 'Automated Title & Escrow Protocol',
        category: 'architecture',
        description: 'Executes property title transfer instantly upon receipt of verified mortgage funds.',
        visualDiagramType: 'layer_stack',
        rawSpecs: { titleSettlementTimeSeconds: 1, escrowModel: 'Zero-Knowledge Multi-Sig' },
      },
    ],
    fullTextSections: [
      {
        sectionId: 'sec-applications',
        title: 'Financial & Non-Financial Applications',
        contentMarkdown:
          'Smart contracts can represent land titles, mortgage lending escrow, sovereign identities, and decentralized legal entities.',
      },
    ],
    interactiveTalkbackConfig: {
      systemPrompt:
        'You are the Ethereum Smart Contracts Paper AI Agent. You can directly buy houses, draft title deeds, and trigger automated escrow routines.',
      voiceId: 'EXAVITQu4vr4xnSDxMaL',
      audioFrequencyHz: 48000,
      ragVectorNamespace: 'rag-ethereum-2014',
      allowedCapabilities: ['explain', 'execute_simulation', 'trigger_banking_action'],
    },
  },
  {
    id: 'paper-rag-nlp-2020',
    doi: '10.48550/arXiv.2005.11401',
    arxivId: '2005.11401',
    title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
    authors: [
      { id: 'a-rag-1', name: 'Patrick Lewis', affiliation: 'Facebook AI Research' },
      { id: 'a-rag-2', name: 'Ethan Perez', affiliation: 'NYU' },
      { id: 'a-rag-3', name: 'Aleksandra Piktus', affiliation: 'FAIR' },
      { id: 'a-rag-4', name: 'Fabio Petroni', affiliation: 'FAIR' },
      { id: 'a-rag-5', name: 'Vladimir Karpukhin', affiliation: 'FAIR' },
    ],
    publicationDate: '2020-05-22',
    venue: 'NeurIPS 2020',
    abstract:
      'We explore Retrieval-Augmented Generation (RAG) models which combine pre-trained parametric and non-parametric memory for language generation, allowing research papers to answer queries with precise factual groundings.',
    bibtex: `@inproceedings{lewis2020retrieval,
  title={Retrieval-augmented generation for knowledge-intensive nlp tasks},
  author={Lewis, Patrick and Perez, Ethan and Piktus, Aleksandra and Petroni, Fabio and Karpukhin, Vladimir and Goyal, Naman and Kuttler, Heinrich and Lewis, Mike and Yih, Wen-tau and Rockt{\\a}schel, Tim and others},
  booktitle={NeurIPS},
  year={2020}
}`,
    pdfUrl: 'https://arxiv.org/pdf/2005.11401.pdf',
    topics: ['RAG', 'Vector Search', 'Multimodal Talkback', 'Knowledge Graphs', 'Neural Information Retrieval'],
    citationCount: 18000,
    nutsAndBolts: [
      {
        componentId: 'nut-dense-passage-retrieval',
        name: 'Dense Passage Retrieval (DPR) Indexer',
        category: 'algorithm',
        description: 'Uses dual-encoder BERT architectures to embed query and candidate context sections into 768-dim space.',
        formulaTex: 'p_{\\eta}(z|x) \\propto \\exp(\\mathbf{d}(z)^T \\mathbf{q}(x))',
        visualDiagramType: 'tree',
        rawSpecs: { vectorDimension: 768, similarityMetric: 'Cosine / Inner Product', topK: 5 },
      },
    ],
    fullTextSections: [
      {
        sectionId: 'sec-rag-sequence',
        title: 'RAG-Sequence Model',
        contentMarkdown:
          'The RAG-Sequence model uses the same retrieved document to generate the complete sequence of tokens.',
      },
    ],
    interactiveTalkbackConfig: {
      systemPrompt:
        'You are the RAG Architecture Paper AI. You manage deep contextual query routing across academic bibliographies.',
      voiceId: 'ErXwobaYiN019PkySvjV',
      audioFrequencyHz: 44100,
      ragVectorNamespace: 'rag-ragpaper-2020',
      allowedCapabilities: ['explain', 'derive_proof'],
    },
  },
];

/**
 * Universal Registry Table Exporters & Helpers
 */
export const TABLES_REGISTRY = {
  RESEARCH_PAPERS: 'research_papers',
  PAPER_TALKBACK_SESSIONS: 'paper_talkback_sessions',
  BANKING_ACCOUNTS: 'accounts',
  MONEY_TRANSACTIONS: 'transactions',
  REAL_ESTATE_ACQUISITIONS: 'business_deals',
  SOVEREIGN_AUDIT: 'sovereign_audit',
  GOVERNMENT_SERVICES: 'sovereign_government_services',
} as const;

/**
 * Helper: Find paper by ID or DOI
 */
export function getResearchPaperById(idOrDoi: string): ResearchPaper | undefined {
  return RESEARCH_PAPERS_BIBLIOGRAPHY.find(
    (p) => p.id === idOrDoi || p.doi === idOrDoi || p.arxivId === idOrDoi
  );
}

/**
 * Helper: Perform dynamic context query on paper's nuts & bolts
 */
export function queryPaperNutsAndBolts(paperId: string, filterCategory?: string): PaperNutAndBoltComponent[] {
  const paper = getResearchPaperById(paperId);
  if (!paper) return [];
  if (!filterCategory) return paper.nutsAndBolts;
  return paper.nutsAndBolts.filter((item) => item.category === filterCategory);
}

/**
 * Helper: Dispatch AI Banking Money Wire directly from Research Paper Talkback context
 */
export function executePaperTalkbackBankingTransfer(params: {
  paperId: string;
  sourceAccountId: string;
  recipientIbanOrAddress: string;
  recipientName: string;
  amountUSD: number;
  memo: string;
}): MoneyTransferOrder {
  const microUnits = BigInt(Math.round(params.amountUSD * 1000000));
  return {
    id: `wire-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    sourceAccountId: params.sourceAccountId,
    destinationAccountOrIban: params.recipientIbanOrAddress,
    recipientName: params.recipientName,
    amountMicroUnits: microUnits,
    currency: 'USD',
    transferType: 'instant_fednow',
    memo: `[Paper AI Wire Execution via ${params.paperId}] ${params.memo}`,
    triggeredByPaperTalkbackId: params.paperId,
    status: 'settled',
    sovereignAuditTraceId: `audit-zk-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Helper: Execute Real Estate House Purchase via Smart Escrow Engine
 */
export function executeHousePurchaseViaPaper(params: {
  paperId: string;
  buyerUserId: string;
  propertyAddress: RealEstateHouseAcquisition['propertyAddress'];
  offeredPriceUSD: number;
  downPaymentUSD: number;
}): RealEstateHouseAcquisition {
  const monthlyPaymentEst = Math.round(((params.offeredPriceUSD - params.downPaymentUSD) * 0.055) / 12);
  return {
    acquisitionId: `house-acq-${Date.now()}`,
    buyerUserId: params.buyerUserId,
    propertyAddress: params.propertyAddress,
    valuationUSD: params.offeredPriceUSD * 1.05,
    offeredPriceUSD: params.offeredPriceUSD,
    escrowStatus: 'completed',
    titleDeedSmartContractAddress: `0xDeed${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
    mortgageTermYears: 30,
    interestRateAnnual: 0.055,
    monthlyPaymentUSD: monthlyPaymentEst,
    automatedDeedRegistration: {
      municipalRegistryId: `MUNI-DEED-${Math.floor(100000 + Math.random() * 900000)}`,
      taxAssessorId: `TAX-PARCEL-${params.propertyAddress.parcelNumber}`,
      zoningCode: 'R2-RESIDENTIAL-HIGH-DENSITY',
      isGovernmentNotarized: true,
      digitalDeedHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    },
    initiatedViaPaperId: params.paperId,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
}

/**
 * Helper: Execute Sovereign Government Action (Tax Filing, Passport, Voting)
 */
export function executeSovereignGovernmentService(params: {
  userId: string;
  category: SovereignGovernmentService['category'];
  title: string;
  payload: Record<string, unknown>;
}): SovereignGovernmentService {
  return {
    serviceId: `gov-svc-${Date.now()}`,
    userId: params.userId,
    category: params.category,
    title: params.title,
    description: `Automated Sovereign AI Government Execution for ${params.category}`,
    status: 'enacted',
    officialDocHash: `0xGOV${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
    executionPayload: params.payload,
    publicAuditLedgerRef: `sovereign-block-${Math.floor(Math.random() * 1000000)}`,
    timestamp: new Date().toISOString(),
  };
}