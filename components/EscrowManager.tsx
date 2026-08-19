

// --- CONSOLIDATED FROM: ./components/real-estate/EscrowManager.tsx ---

import React, { useState } from 'react';
import { RefreshCw, Send, Copy, CheckCircle2, FileText, Folder, File } from 'lucide-react';

interface WorkspaceFile {
  name: string;
  type: 'file' | 'folder';
  desc?: string;
  status?: string;
  size?: string;
  children?: WorkspaceFile[];
}

const AVAILABLE_HOUSES = [
  {
    id: '1',
    title: 'Sovereign Villa',
    address: '1209 North Orange St, Wilmington, DE',
    type: 'Residential',
    beds: 4,
    baths: 3.5,
    sqft: 3200,
    riskScore: 12,
    price: 1250000,
    imageBg: 'from-blue-600 to-indigo-900',
  },
  {
    id: '2',
    title: 'Decentralized Loft',
    address: '848 Brickell Ave, Miami, FL',
    type: 'Condo',
    beds: 2,
    baths: 2,
    sqft: 1450,
    riskScore: 8,
    price: 850000,
    imageBg: 'from-purple-600 to-pink-900',
  },
  {
    id: '3',
    title: 'Smart Contract Estate',
    address: '2711 Centerville Rd, Wilmington, DE',
    type: 'Commercial',
    beds: 0,
    baths: 4,
    sqft: 5500,
    riskScore: 15,
    price: 3400000,
    imageBg: 'from-emerald-600 to-teal-900',
  },
];

const WORKSPACE_DATA: WorkspaceFile[] = [
  {
    name: 'contracts',
    type: 'folder',
    children: [
      { name: 'EscrowVault.sol', type: 'file', desc: 'Smart contract managing multi-sig escrow funds.', status: 'Audited', size: '14.2 KB' },
      { name: 'DeedToken.sol', type: 'file', desc: 'ERC-721 contract representing property deeds.', status: 'Audited', size: '8.4 KB' },
    ],
  },
  {
    name: 'scripts',
    type: 'folder',
    children: [
      { name: 'deploy.js', type: 'file', desc: 'Deployment script for Ethereum mainnet.', status: 'Ready', size: '2.1 KB' },
    ],
  },
  {
    name: 'package.json',
    type: 'file',
    desc: 'Project dependencies and scripts.',
    status: 'Valid',
    size: '1.2 KB',
  },
];

export default function EscrowManager() {
  const [activeTab, setActiveTab] = useState<'fedwire' | 'house_buyer' | 'gov_hub' | 'escrow_ledger' | 'workspace'>('fedwire');
  const [wireSenderAccount, setWireSenderAccount] = useState('US89WELS00001928374655');
  const [wireRecipient, setWireRecipient] = useState('US12CHAS00009876543210');
  const [wireAmount, setWireAmount] = useState(1250000);
  const [wirePurpose, setWirePurpose] = useState('1033');
  const [isSendingWire, setIsSendingWire] = useState(false);
  const [wireSuccessMessage, setWireSuccessMessage] = useState('');
  const [wireXmlPayload, setWireXmlPayload] = useState(`<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>FEDWIRE-20231027-009182</MsgId>
      <CreDtTm>2023-10-27T14:30:00Z</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>OKO-ESCROW-9921</EndToEndId>
      </PmtId>
      <IntrBkSttlmAmt Ccy="USD">1250000.00</IntrBkSttlmAmt>
      <Dbtr>
        <Nm>Oko Escrow Agent LLC</Nm>
      </Dbtr>
      <Cdtr>
        <Nm>Sovereign Title & Escrow</Nm>
      </Cdtr>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`);

  const [buyingHouseId, setBuyingHouseId] = useState<string | null>(null);
  const [buyHouseStatus, setBuyHouseStatus] = useState('');
  const [selectedWorkspaceFile, setSelectedWorkspaceFile] = useState<WorkspaceFile | null>(null);

  const [currentTx, setCurrentTx] = useState({
    govApiStatus: {
      countyRecorder: true,
      taxAssessor: true,
      eIDASNotary: 'CONNECTED',
      titleRegistry: true,
    },
    steps: [
      { id: '1', label: 'Deposit Funds', description: 'Buyer deposits purchase price into smart contract escrow.', status: 'completed', updatedAt: '10:15 AM' },
      { id: '2', label: 'Title Search & Insurance', description: 'Automated title verification and policy issuance.', status: 'completed', updatedAt: '11:00 AM' },
      { id: '3', label: 'Digital Signature', description: 'Both parties sign closing documents via eIDAS.', status: 'current', updatedAt: 'Just now' },
      { id: '4', label: 'Deed Transfer', description: 'County recorder API updates ownership registry.', status: 'pending', updatedAt: '-' },
    ],
    documents: [
      { id: 'doc1', name: 'Purchase and Sale Agreement', signed: true },
      { id: 'doc2', name: 'Warranty Deed', signed: false },
      { id: 'doc3', name: 'Escrow Instructions', signed: false },
    ],
  });

  const handleExecuteWireTransfer = () => {
    setIsSendingWire(true);
    setWireSuccessMessage('');
    setTimeout(() => {
      setIsSendingWire(false);
      setWireSuccessMessage('ISO 20022 Fedwire transfer executed successfully. Transaction Hash: 0x8f3c...92a1');
    }, 2000);
  };

  const handleBuyHouse = (house: typeof AVAILABLE_HOUSES[0]) => {
    setBuyingHouseId(house.id);
    setBuyHouseStatus(`Initiating autonomous purchase for ${house.title}...`);
    setTimeout(() => {
      setBuyHouseStatus('Verifying buyer credentials and proof of funds...');
      setTimeout(() => {
        setBuyHouseStatus('Executing smart contract escrow deposit...');
        setTimeout(() => {
          setBuyHouseStatus('Purchase completed successfully!');
          setBuyingHouseId(null);
          setTimeout(() => setBuyHouseStatus(''), 3000);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const handleSyncGovAll = () => {
    alert('All Government APIs synchronized successfully!');
  };

  const handleSignDocument = (docId: string) => {
    setCurrentTx(prev => ({
      ...prev,
      documents: prev.documents.map(doc => doc.id === docId ? { ...doc, signed: true } : doc)
    }));
  };

  const renderFileTree = (nodes: WorkspaceFile[]) => {
    return (
      <div className="space-y-1">
        {nodes.map((node, idx) => (
          <div key={idx} className="pl-2">
            <div
              onClick={() => node.type === 'file' && setSelectedWorkspaceFile(node)}
              className={`flex items-center gap-2 py-1 px-2 rounded text-xs cursor-pointer hover:bg-slate-800 ${node.type === 'file' ? 'text-slate-300' : 'text-slate-400 font-semibold'}`}
            >
              {node.type === 'folder' ? (
                <Folder className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <File className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{node.name}</span>
            </div>
            {node.children && renderFileTree(node.children)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Oko Escrow Manager</h1>
            <p className="text-sm text-slate-400">Autonomous real estate settlement, ISO 20022 Fedwire integration, and sovereign government APIs.</p>
          </div>
          <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
            {(['fedwire', 'house_buyer', 'gov_hub', 'escrow_ledger', 'workspace'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1 & 2: FEDWIRE SETTLEMENT */}
        {activeTab === 'fedwire' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">ISO 20022 Fedwire Settlement</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] text-slate-400 font-mono block mb-1">Debtor Account (Sender)</label>
                    <input
                      type="text"
                      value={wireSenderAccount}
                      onChange={(e) => setWireSenderAccount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-mono block mb-1">Creditor Account (Escrow Vault)</label>
                    <input
                      type="text"
                      value={wireRecipient}
                      onChange={(e) => setWireRecipient(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-slate-400 font-mono block mb-1">Amount (USD)</label>
                      <input
                        type="number"
                        value={wireAmount}
                        onChange={(e) => setWireAmount(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 font-mono block mb-1">Purpose Code</label>
                      <input
                        type="text"
                        value={wirePurpose}
                        onChange={(e) => setWirePurpose(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleExecuteWireTransfer}
                    disabled={isSendingWire}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950 disabled:opacity-50"
                  >
                    {isSendingWire ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Transmitting ISO 20022 Wire...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Execute Fedwire Settlement</>
                    )}
                  </button>

                  {wireSuccessMessage && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-[11px] font-mono">
                      {wireSuccessMessage}
                    </div>
                  )}
                </div>

                {/* XML Payload Display */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live ISO 20022 XML Payload</h3>
                    <button className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap h-[300px] bg-slate-900 p-4 rounded-lg border border-slate-800">
                    {wireXmlPayload}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUTONOMOUS HOUSE BUYER */}
        {activeTab === 'house_buyer' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AVAILABLE_HOUSES.map((house) => (
              <div key={house.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                <div className={`h-32 bg-gradient-to-br ${house.imageBg} p-4 flex items-end`}>
                  <div className="bg-slate-950/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-white border border-white/10">
                    {house.type}
                  </div>
                </div>
                <div className="p-5 flex-1">
                  <h3 className="text-lg font-bold text-white">{house.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{house.address}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div className="bg-slate-800 p-2 rounded">Beds: {house.beds}</div>
                    <div className="bg-slate-800 p-2 rounded">Baths: {house.baths}</div>
                    <div className="bg-slate-800 p-2 rounded">Sqft: {house.sqft}</div>
                    <div className="bg-slate-800 p-2 rounded">Risk: {house.riskScore}/100</div>
                  </div>
                  <div className="mt-4 text-xl font-bold text-emerald-400">${house.price.toLocaleString()}</div>
                </div>
                <div className="p-5 border-t border-slate-800">
                  <button
                    onClick={() => handleBuyHouse(house)}
                    disabled={buyingHouseId !== null}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {buyingHouseId === house.id ? 'Processing...' : '1-Click Autonomous Purchase'}
                  </button>
                </div>
              </div>
            ))}
            {buyHouseStatus && (
              <div className="fixed bottom-8 right-8 bg-slate-900 border border-emerald-500/50 p-4 rounded-xl shadow-2xl z-50 flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
                <p className="text-xs text-white font-mono">{buyHouseStatus}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: GOVERNMENT HUB */}
        {activeTab === 'gov_hub' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Sovereign Government & County API Hub</h2>
                <p className="text-xs text-slate-400">Real-time synchronization with county recorders, tax assessors, and eIDAS notary services.</p>
              </div>
              <button
                onClick={handleSyncGovAll}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Sync All APIs
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(currentTx.govApiStatus).map(([key, value]) => (
                <div key={key} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${value === true ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    {typeof value === 'boolean' ? (value ? 'CONNECTED' : 'DISCONNECTED') : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ESCROW LEDGER */}
        {activeTab === 'escrow_ledger' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Escrow Workflow Steps</h3>
                <div className="space-y-4">
                  {currentTx.steps.map((step, idx) => (
                    <div key={step.id} className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${step.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : step.status === 'current' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-600'}`}>
                        {step.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-white">{step.label}</h4>
                        <p className="text-[11px] text-slate-400">{step.description}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{step.updatedAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Closing Documents</h3>
                <div className="space-y-2">
                  {currentTx.documents.map(doc => (
                    <div key={doc.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="text-[11px] text-slate-300">{doc.name}</span>
                      </div>
                      <button onClick={() => handleSignDocument(doc.id)} className="text-[10px] bg-emerald-600 text-white px-2 py-1 rounded">Sign</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: WORKSPACE EXPLORER */}
        {activeTab === 'workspace' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex gap-6">
            <div className="w-64 border-r border-slate-800 pr-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Oko-main</h3>
              {renderFileTree(WORKSPACE_DATA)}
            </div>
            <div className="flex-1">
              {selectedWorkspaceFile ? (
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                  <h2 className="text-lg font-bold text-white">{selectedWorkspaceFile.name}</h2>
                  <p className="text-xs text-slate-400 mt-2">{selectedWorkspaceFile.desc}</p>
                  <div className="mt-4 flex gap-4 text-[11px] text-slate-500">
                    <span>Status: {selectedWorkspaceFile.status}</span>
                    <span>Size: {selectedWorkspaceFile.size}</span>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-xs">Select a file to view details</div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
