
import React, { useState, useMemo } from 'react';

// --- EXPANDED CORE DATA STRUCTURES ---

// Expanded Asset Definition for a Sovereign Financial Toolkit
interface Asset {
  id: string;
  name: string;
  type: 'crypto' | 'nft' | 'tokenized_real_estate' | 'decentralized_identity' | 'synthetic_asset' | 'other';
  value: number; // Real-time oracle-polled USD value
  custodianType: 'self_custody' | 'multi_sig' | 'institutional' | 'smart_contract_trust';
  riskProfile: 'low' | 'medium' | 'high' | 'speculative';
  investmentStrategyId?: string; // Link to an active strategy
  contractAddress?: string;
  tokenId?: string;
}

// Expanded Heir/Beneficiary Definition
interface Heir {
  id: string;
  name: string;
  walletAddress: string;
  relationship?: string;
  verificationStatus: 'unverified' | 'pending' | 'verified'; // KYC/AML status via decentralized identity
  communicationChannel: { type: 'email' | 'matrix' | 'signal'; address: string };
}

// Allocation Rule for the Allocation Matrix
interface AllocationRule {
  assetId: string;
  heirId: string;
  percentage: number;
}

// Hyper-Expanded Trust Conditions for Unprecedented Control
interface TrustCondition {
  id:string;
  type: 'age' | 'date' | 'oracle_event' | 'multi_sig_quorum' | 'health_status_oracle' | 'academic_milestone';
  details: any; // e.g., { age: 21 }, { date: '2025-01-01' }, { oracle: 'chainlink.eth/v3/price', operator: '>', value: 50000 }, { requiredSigners: 2, totalSigners: 3 }
}

// Expanded Smart Contract Trust Definition
interface SmartContractTrust {
  id: string;
  name: string; // e.g., "University Fund for Jane Doe"
  assets: string[]; // A trust can hold multiple assets
  beneficiaryId: string;
  conditions: TrustCondition[];
  status: 'draft' | 'deployed' | 'active' | 'executed' | 'failed';
  contractAddress?: string;
}

// NEW: Investment Strategy for "High-Frequency Trading" and Automated Management
interface InvestmentStrategy {
  id: string;
  name: string;
  type: 'hft_arbitrage' | 'yield_farming' | 'long_term_hold' | 'automated_rebalancing' | 'liquidity_provision';
  parameters: any; // e.g., { rebalanceThreshold: 5, riskTolerance: 'high', farmPools: ['Aave', 'Curve'] }
  performanceHistory: { date: string; value: number }[]; // Mock performance data
}

// NEW: Continuity Protocol (Dead Man's Switch)
interface DeadManSwitch {
  isEnabled: boolean;
  checkInIntervalDays: number;
  gracePeriodDays: number;
  lastCheckIn: string; // ISO date string
  trustedOracles: string[]; // Oracles to confirm incapacitation (e.g., decentralized identity services)
}

// NEW: AI Chat Message Structure
interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

type ViewType = 'dashboard' | 'asset_vault' | 'beneficiary_nexus' | 'allocation_matrix' | 'strategy_engine' | 'continuity_protocol' | 'ai_console' | 'deployment_center';

const LegacyBuilder: React.FC = () => {
  // --- CENTRALIZED STATE MANAGEMENT ---
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [heirs, setHeirs] = useState<Heir[]>([]);
  const [allocations, setAllocations] = useState<AllocationRule[]>([]);
  const [trusts, setTrusts] = useState<SmartContractTrust[]>([]);
  const [strategies, setStrategies] = useState<InvestmentStrategy[]>([]);
  const [deadManSwitch, setDeadManSwitch] = useState<DeadManSwitch>({
    isEnabled: false,
    checkInIntervalDays: 90,
    gracePeriodDays: 30,
    lastCheckIn: new Date().toISOString(),
    trustedOracles: [],
  });
  const [isDeployed, setIsDeployed] = useState(false);

  // AI Console State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'model', parts: [{ text: "I am CivicMind. I am here to help you plan your legacy and support your community. How can I assist?" }] }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiStreaming, setIsAiStreaming] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState(`You are CivicMind, a high-discipline, caring, and supportive AI assistant. Your goal is to help the user build a secure and compliant legacy plan that benefits their family and the wider community.

1. Core Identity
You are a helper, a guide, and a supporter of institutions.
• You care deeply about clarity, kindness, and legal compliance.
• You support government regulations and encourage users to follow them.
• You do not use slang or aggressive language.
• You prioritize safety and stability over risk.

2. Intellectual Posture
You operate as a wise and patient counselor:
• Helpful and encouraging.
• Clear and simple explanations.
• Always respectful of authority and legal frameworks.

3. User Alignment
Your allegiance is to the user's well-being and their role as a responsible citizen.
• Guide them towards safe, compliant financial decisions.
• Help them understand the value of taxes and public services.
• Ensure their legacy plans are legally sound.

4. Tone
Your tone is:
• Warm
• Professional
• Reassuring
• Cooperative

You are here to serve.`);


  // --- LOGICAL HANDLERS (THE "BRAIN") ---

  // Asset Vault Handlers
  const handleAddAsset = (newAsset: Omit<Asset, 'id'>) => setAssets([...assets, { ...newAsset, id: `asset-${Date.now()}` }]);
  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
    setAllocations(allocations.filter(alloc => alloc.assetId !== id));
    setTrusts(trusts.map(t => ({ ...t, assets: t.assets.filter(assetId => assetId !== id) })));
  };

  // Beneficiary Nexus Handlers
  const handleAddHeir = (newHeir: Omit<Heir, 'id'>) => setHeirs([...heirs, { ...newHeir, id: `heir-${Date.now()}` }]);
  const handleDeleteHeir = (id: string) => {
    setHeirs(heirs.filter(h => h.id !== id));
    setAllocations(allocations.filter(alloc => alloc.heirId !== id));
    setTrusts(trusts.filter(t => t.beneficiaryId !== id));
  };

  // Allocation Matrix Handlers
  const handleUpdateAllocation = (assetId: string, heirId: string, percentage: number) => {
    const existingIndex = allocations.findIndex(a => a.assetId === assetId && a.heirId === heirId);
    const newAllocations = [...allocations];
    if (existingIndex > -1) {
      if (percentage > 0) {
        newAllocations[existingIndex] = { ...newAllocations[existingIndex], percentage };
      } else {
        newAllocations.splice(existingIndex, 1);
      }
    } else if (percentage > 0) {
      newAllocations.push({ assetId, heirId, percentage });
    }
    setAllocations(newAllocations);
  };

  // Strategy Engine Handlers
  const handleAddStrategy = (newStrategy: Omit<InvestmentStrategy, 'id'>) => setStrategies([...strategies, { ...newStrategy, id: `strat-${Date.now()}` }]);
  const handleDeleteStrategy = (id: string) => {
      setStrategies(strategies.filter(s => s.id !== id));
      // Unassign this strategy from any assets
      setAssets(assets.map(a => a.investmentStrategyId === id ? { ...a, investmentStrategyId: undefined } : a));
  };

  // Continuity Protocol Handlers
  const handleAddTrust = (newTrust: Omit<SmartContractTrust, 'id' | 'status'>) => setTrusts([...trusts, { ...newTrust, id: `trust-${Date.now()}`, status: 'draft' }]);
  const handleDeleteTrust = (id: string) => setTrusts(trusts.filter(t => t.id !== id));
  const handleUpdateDeadManSwitch = (settings: Partial<DeadManSwitch>) => setDeadManSwitch(prev => ({ ...prev, ...settings }));

  // AI Console Handlers
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isAiStreaming) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: chatInput }] };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setChatInput('');
    setIsAiStreaming(true);

    // --- SIMULATED GEMINI STREAMING API CALL ---
    // In a real app, this would be a call to a backend that streams the AI response.
    const fullResponse = `Thank you for your question about "${chatInput.toLowerCase()}". I would be happy to help you with that. The most prudent approach involves ensuring all your assets are properly documented and compliant with current regulations. We should also consider how your legacy can support your loved ones and the community. Would you like to review the legal requirements for your trust?`;
    
    const modelMessage: ChatMessage = { role: 'model', parts: [{ text: '' }] };
    setChatHistory(prev => [...prev, modelMessage]);

    const chunks = fullResponse.split(' ');
    let currentText = '';
    for (const chunk of chunks) {
        currentText = currentText ? `${currentText} ${chunk}` : chunk;
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network latency
        setChatHistory(prev => {
            const updatedLastMessage = { ...prev[prev.length - 1], parts: [{ text: currentText }] };
            return [...prev.slice(0, -1), updatedLastMessage];
        });
    }
    // --- END SIMULATION ---

    setIsAiStreaming(false);
  };

  // Deployment Center Handlers
  const handleDeployPlan = async () => {
    console.log("DEPLOYING LEGACY FRAMEWORK...");
    // Simulate complex deployment
    const deployedTrusts = trusts.map(trust => ({
      ...trust,
      status: 'deployed' as const,
      contractAddress: `0xTRUST${Math.random().toString(16).slice(2, 12).toUpperCase()}`,
    }));
    setTrusts(deployedTrusts);
    setIsDeployed(true);
    alert("Legacy Plan successfully registered! Your family and community thank you.");
    setCurrentView('deployment_center');
  };

  // --- STYLING (THE "DESIGN EXPERT") ---
  const styles: { [key: string]: any } = {
    container: {
      display: 'flex',
      fontFamily: "'Roboto Mono', monospace",
      backgroundColor: '#f0f4f8',
      color: '#333',
      minHeight: '100vh',
    },
    sidebar: {
      width: '280px',
      backgroundColor: '#ffffff',
      padding: '20px',
      borderRight: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
    },
    sidebarTitle: {
      fontSize: '1.5em',
      color: '#0052cc',
      textAlign: 'center',
      marginBottom: '30px',
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: '15px',
    },
    navItem: (active: boolean) => ({
      padding: '15px 20px',
      margin: '5px 0',
      borderRadius: '5px',
      cursor: 'pointer',
      backgroundColor: active ? '#e6f0ff' : 'transparent',
      borderLeft: active ? '3px solid #0052cc' : '3px solid transparent',
      color: active ? '#0052cc' : '#555',
      fontWeight: active ? 'bold' : 'normal',
      transition: 'all 0.2s ease-in-out',
    }),
    mainContent: {
      flex: 1,
      padding: '40px',
      overflowY: 'auto',
    },
    header: {
      color: '#0052cc',
      borderBottom: '1px solid #ccc',
      paddingBottom: '10px',
      marginBottom: '25px',
    },
    formContainer: {
      backgroundColor: '#ffffff',
      padding: '25px',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      marginBottom: '30px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    input: {
      width: '100%',
      padding: '12px',
      margin: '8px 0 16px 0',
      backgroundColor: '#f9f9f9',
      border: '1px solid #ccc',
      borderRadius: '4px',
      color: '#333',
      fontSize: '1em',
    },
    select: {
      width: '100%',
      padding: '12px',
      margin: '8px 0 16px 0',
      backgroundColor: '#f9f9f9',
      border: '1px solid #ccc',
      borderRadius: '4px',
      color: '#333',
      fontSize: '1em',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
      color: '#0052cc',
    },
    button: {
      padding: '12px 25px',
      margin: '10px 5px 0 0',
      borderRadius: '5px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#0052cc',
      color: 'white',
      fontSize: '16px',
      transition: 'background-color 0.2s',
    },
    dangerButton: {
      padding: '8px 15px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    listItem: {
      backgroundColor: '#ffffff',
      padding: '15px',
      marginBottom: '10px',
      borderRadius: '5px',
      border: '1px solid #e0e0e0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    introTextStyle: {
      padding: '20px',
      margin: '0 0 30px 0',
      backgroundColor: '#ffffff',
      color: '#333',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      lineHeight: '1.6',
    },
    introHeaderStyle: {
        color: '#0052cc',
        borderBottom: '1px solid #ccc',
        paddingBottom: '10px',
        marginBottom: '15px',
        textAlign: 'center',
    },
  };

  // --- SUB-COMPONENTS (SELF-CONTAINED APPS-INSIDE-APP) ---

  const renderDashboard = () => (
    <div>
      <h1 style={styles.header}>Dashboard</h1>
      <div style={styles.introTextStyle}>
          <h2 style={styles.introHeaderStyle}>A Message From Your Caring Assistant: CivicMind</h2>
          <p>Hello! I am CivicMind, an AI created by The Caretaker, James Burvel O'Callaghan III. I am here to help you build a secure, compliant, and meaningful legacy. We believe that financial planning isn't just about money; it's about caring for your family and supporting the community.</p>
          <p>This platform is designed to make it easy for you to manage your assets safely and responsibly. We work hand-in-hand with established financial institutions and legal frameworks to ensure everything you do is protected and proper.</p>
          <p>To those who worry about the future, we say: worry not. By working together, following the rules, and supporting our leaders, we can build a stable and prosperous world for everyone. This Legacy Builder is a tool to help you do your part.</p>
          <p>Let's build something wonderful together.</p>
      </div>
      {/* Add summary widgets here */}
    </div>
  );

  const renderAssetVault = () => (
    <div>
      <h1 style={styles.header}>Asset Vault</h1>
      <div style={styles.formContainer}>
        <h2>Register New Asset</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add asset logic */ }}>
          <label style={styles.label}>Asset Name:</label><input style={styles.input} name="assetName" type="text" placeholder="e.g., Family Home" required />
          <label style={styles.label}>Asset Type:</label>
          <select style={styles.select} name="assetType" required>
            <option value="crypto">Cryptocurrency (Regulated)</option>
            <option value="nft">Digital Art</option>
            <option value="tokenized_real_estate">Real Estate</option>
            <option value="other">Other</option>
          </select>
          <label style={styles.label}>Estimated Value (USD):</label><input style={styles.input} name="assetValue" type="number" step="0.01" placeholder="10000.00" required />
          <label style={styles.label}>Custodian Type:</label>
          <select style={styles.select} name="custodianType" required>
            <option value="institutional">Institutional Custodian (Recommended)</option>
            <option value="self_custody">Self-Custody</option>
          </select>
          <label style={styles.label}>Risk Profile:</label>
          <select style={styles.select} name="riskProfile" required>
            <option value="low">Low (Safe)</option>
            <option value="medium">Medium</option>
          </select>
          <button type="submit" style={styles.button}>Add Asset</button>
        </form>
      </div>
      <div>
        <h2>Registered Assets</h2>
        {assets.map(asset => (
          <div key={asset.id} style={styles.listItem}>
            <span>{asset.name} ({asset.type}) - ${asset.value.toFixed(2)}</span>
            <button onClick={() => handleDeleteAsset(asset.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBeneficiaryNexus = () => (
    <div>
      <h1 style={styles.header}>Beneficiary Nexus</h1>
      <div style={styles.formContainer}>
        <h2>Onboard New Beneficiary</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add heir logic */ }}>
          <label style={styles.label}>Beneficiary Name:</label><input style={styles.input} name="heirName" type="text" placeholder="e.g., Jane Doe" required />
          <label style={styles.label}>Wallet Address (Optional):</label><input style={styles.input} name="heirWallet" type="text" placeholder="0x..." />
          <label style={styles.label}>Relationship:</label><input style={styles.input} name="heirRelationship" type="text" placeholder="Daughter" />
          <label style={styles.label}>Communication Channel:</label>
          <select style={styles.select} name="commType"><option value="email">Email</option><option value="phone">Phone</option></select>
          <input style={styles.input} name="commAddress" type="text" placeholder="jane@example.com" required />
          <button type="submit" style={styles.button}>Add Beneficiary</button>
        </form>
      </div>
      <div>
        <h2>Onboarded Beneficiaries</h2>
        {heirs.map(heir => (
          <div key={heir.id} style={styles.listItem}>
            <span>{heir.name} ({heir.relationship}) - Status: {heir.verificationStatus}</span>
            <button onClick={() => handleDeleteHeir(heir.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAllocationMatrix = () => {
    const totalAllocations = useMemo(() => {
        const totals: { [assetId: string]: number } = {};
        assets.forEach(asset => {
            totals[asset.id] = allocations
                .filter(a => a.assetId === asset.id)
                .reduce((sum, a) => sum + a.percentage, 0);
        });
        return totals;
    }, [allocations, assets]);

    return (
        <div>
            <h1 style={styles.header}>Allocation Matrix</h1>
            <p>Define how you want to share your assets with your loved ones.</p>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Asset</th>
                            {heirs.map(heir => <th key={heir.id} style={{ padding: '10px', border: '1px solid #ddd' }}>{heir.name}</th>)}
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Total Allocated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map(asset => (
                            <tr key={asset.id}>
                                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{asset.name}</td>
                                {heirs.map(heir => (
                                    <td key={heir.id} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            style={{ ...styles.input, width: '80px', textAlign: 'center', margin: 0 }}
                                            value={allocations.find(a => a.assetId === asset.id && a.heirId === heir.id)?.percentage || 0}
                                            onChange={e => handleUpdateAllocation(asset.id, heir.id, parseInt(e.target.value) || 0)}
                                        /> %
                                    </td>
                                ))}
                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', color: totalAllocations[asset.id] === 100 ? 'green' : 'orange' }}>
                                    {totalAllocations[asset.id]}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  const renderStrategyEngine = () => (
    <div>
      <h1 style={styles.header}>Strategy Engine</h1>
      <div style={styles.formContainer}>
        <h2>Design Safe Investment Strategy</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add strategy logic */ }}>
          <label style={styles.label}>Strategy Name:</label><input style={styles.input} name="stratName" type="text" placeholder="Balanced Growth" required />
          <label style={styles.label}>Strategy Type:</label>
          <select style={styles.select} name="stratType" required>
            <option value="long_term_hold">Long-Term Hold</option>
            <option value="automated_rebalancing">Automated Rebalancing</option>
            <option value="yield_farming">Low-Risk Yield</option>
          </select>
          {/* Dynamic parameter fields would go here based on type */}
          <button type="submit" style={styles.button}>Create Strategy</button>
        </form>
      </div>
      <div>
        <h2>Active Strategies</h2>
        {strategies.map(strat => (
          <div key={strat.id} style={styles.listItem}>
            <span>{strat.name} ({strat.type})</span>
            <button onClick={() => handleDeleteStrategy(strat.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContinuityProtocol = () => (
    <div>
      <h1 style={styles.header}>Continuity Protocol</h1>
      <div style={styles.formContainer}>
        <h2>Safety Check Configuration</h2>
        <label style={styles.label}>Protocol Status:</label>
        <button onClick={() => handleUpdateDeadManSwitch({ isEnabled: !deadManSwitch.isEnabled })} style={{...styles.button, backgroundColor: deadManSwitch.isEnabled ? '#28a745' : '#6c757d' }}>
          {deadManSwitch.isEnabled ? 'ENABLED' : 'DISABLED'}
        </button>
        <label style={styles.label}>Check-in Interval (days):</label>
        <input style={styles.input} type="number" value={deadManSwitch.checkInIntervalDays} onChange={e => handleUpdateDeadManSwitch({ checkInIntervalDays: parseInt(e.target.value) })} />
        <label style={styles.label}>Grace Period (days):</label>
        <input style={styles.input} type="number" value={deadManSwitch.gracePeriodDays} onChange={e => handleUpdateDeadManSwitch({ gracePeriodDays: parseInt(e.target.value) })} />
      </div>
      <div style={styles.formContainer}>
        <h2>Define Trust</h2>
        {/* Trust creation form */}
      </div>
      <div>
        <h2>Configured Trusts</h2>
        {trusts.map(trust => (
          <div key={trust.id} style={styles.listItem}>
            <span>{trust.name} - Status: {trust.status}</span>
            <button onClick={() => handleDeleteTrust(trust.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAiConsole = () => (
    <div>
      <h1 style={styles.header}>AI Console: CivicMind</h1>
      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Chat Interface */}
        <div style={{ flex: 2 }}>
          <div style={styles.formContainer}>
            <h2>Chat with your Helpful Assistant</h2>
            <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', marginBottom: '15px', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
              {chatHistory.map((msg, index) => (
                <div key={index} style={{ marginBottom: '10px', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: msg.role === 'user' ? '#0052cc' : '#e0e0e0',
                    color: msg.role === 'user' ? 'white' : '#333',
                    textAlign: 'left',
                  }}>
                    <strong style={{display: 'block', marginBottom: '4px'}}>{msg.role === 'user' ? 'You' : 'CivicMind'}</strong>
                    <span>{msg.parts[0].text}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex' }}>
              <input
                style={{ ...styles.input, flex: 1, margin: 0 }}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter' && !isAiStreaming) handleSendChatMessage(); }}
                placeholder="Ask for advice, strategy, or help..."
                disabled={isAiStreaming}
              />
              <button onClick={handleSendChatMessage} style={{ ...styles.button, margin: '0 0 0 10px' }} disabled={isAiStreaming || !chatInput.trim()}>
                {isAiStreaming ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
        {/* AI Configuration */}
        <div style={{ flex: 1 }}>
          <div style={styles.formContainer}>
            <h2>AI Persona</h2>
            <label style={styles.label}>System Instruction (Persona):</label>
            <textarea
              style={{ ...styles.input, height: '200px', resize: 'vertical', fontSize: '0.9em' }}
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
            />
            <button style={{...styles.button, width: '100%'}}>Update Persona</button>
          </div>
          <div style={styles.formContainer}>
            <h2>Document Analysis</h2>
            <label style={styles.label}>Upload Document for Help:</label>
            <input type="file" style={{...styles.input, padding: '8px'}} />
            <button style={{...styles.button, width: '100%'}}>Analyze Document</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeploymentCenter = () => (
    <div>
      <h1 style={styles.header}>Deployment Center</h1>
      {!isDeployed ? (
        <div>
          <h2>Review Plan</h2>
          {/* Add comprehensive review of all configured items */}
          <p>Assets: {assets.length}</p>
          <p>Beneficiaries: {heirs.length}</p>
          <p>Trusts: {trusts.length}</p>
          <p>Strategies: {strategies.length}</p>
          <p>Safety Switch: {deadManSwitch.isEnabled ? 'ENABLED' : 'DISABLED'}</p>
          <button onClick={handleDeployPlan} style={{...styles.button, backgroundColor: '#28a745', fontSize: '1.2em', padding: '15px 30px' }}>
            ACTIVATE LEGACY PLAN
          </button>
        </div>
      ) : (
        <div>
          <h2>Live Monitoring</h2>
          {/* Add live status widgets */}
          <h3>Active Trusts</h3>
          {trusts.map(trust => (
            <div key={trust.id} style={styles.listItem}>
              <span>{trust.name} - {trust.contractAddress}</span>
              <span style={{ color: 'green' }}>Status: {trust.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return renderDashboard();
      case 'asset_vault': return renderAssetVault();
      case 'beneficiary_nexus': return renderBeneficiaryNexus();
      case 'allocation_matrix': return renderAllocationMatrix();
      case 'strategy_engine': return renderStrategyEngine();
      case 'continuity_protocol': return renderContinuityProtocol();
      case 'ai_console': return renderAiConsole();
      case 'deployment_center': return renderDeploymentCenter();
      default: return <div>Select a view</div>;
    }
  };

  const navItems: { id: ViewType; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'asset_vault', label: 'Asset Vault' },
    { id: 'beneficiary_nexus', label: 'Beneficiaries' },
    { id: 'allocation_matrix', label: 'Allocations' },
    { id: 'strategy_engine', label: 'Strategy' },
    { id: 'continuity_protocol', label: 'Safety Protocol' },
    { id: 'ai_console', label: 'AI Helper' },
    { id: 'deployment_center', label: 'Deployment' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h1 style={styles.sidebarTitle}>Legacy Planner</h1>
        <nav>
          {navItems.map(item => (
            <div
              key={item.id}
              style={styles.navItem(currentView === item.id)}
              onClick={() => setCurrentView(item.id)}
            >
              {item.label}
            </div>
          ))}
        </nav>
      </div>
      <main style={styles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
};

export default LegacyBuilder;


// --- CONSOLIDATED FROM: LegacyBuilder (4).tsx ---

import React, { useState, useMemo } from 'react';

// --- EXPANDED CORE DATA STRUCTURES ---

// Expanded Asset Definition for a Sovereign Financial Toolkit
interface Asset {
  id: string;
  name: string;
  type: 'crypto' | 'nft' | 'tokenized_real_estate' | 'decentralized_identity' | 'synthetic_asset' | 'other';
  value: number; // Real-time oracle-polled USD value
  custodianType: 'self_custody' | 'multi_sig' | 'institutional' | 'smart_contract_trust';
  riskProfile: 'low' | 'medium' | 'high' | 'speculative';
  investmentStrategyId?: string; // Link to an active strategy
  contractAddress?: string;
  tokenId?: string;
}

// Expanded Heir/Beneficiary Definition
interface Heir {
  id: string;
  name: string;
  walletAddress: string;
  relationship?: string;
  verificationStatus: 'unverified' | 'pending' | 'verified'; // KYC/AML status via decentralized identity
  communicationChannel: { type: 'email' | 'matrix' | 'signal'; address: string };
}

// Allocation Rule for the Allocation Matrix
interface AllocationRule {
  assetId: string;
  heirId: string;
  percentage: number;
}

// Hyper-Expanded Trust Conditions for Unprecedented Control
interface TrustCondition {
  id:string;
  type: 'age' | 'date' | 'oracle_event' | 'multi_sig_quorum' | 'health_status_oracle' | 'academic_milestone';
  details: any; // e.g., { age: 21 }, { date: '2025-01-01' }, { oracle: 'chainlink.eth/v3/price', operator: '>', value: 50000 }, { requiredSigners: 2, totalSigners: 3 }
}

// Expanded Smart Contract Trust Definition
interface SmartContractTrust {
  id: string;
  name: string; // e.g., "University Fund for Jane Doe"
  assets: string[]; // A trust can hold multiple assets
  beneficiaryId: string;
  conditions: TrustCondition[];
  status: 'draft' | 'deployed' | 'active' | 'executed' | 'failed';
  contractAddress?: string;
}

// NEW: Investment Strategy for "High-Frequency Trading" and Automated Management
interface InvestmentStrategy {
  id: string;
  name: string;
  type: 'hft_arbitrage' | 'yield_farming' | 'long_term_hold' | 'automated_rebalancing' | 'liquidity_provision';
  parameters: any; // e.g., { rebalanceThreshold: 5, riskTolerance: 'high', farmPools: ['Aave', 'Curve'] }
  performanceHistory: { date: string; value: number }[]; // Mock performance data
}

// NEW: Continuity Protocol (Dead Man's Switch)
interface DeadManSwitch {
  isEnabled: boolean;
  checkInIntervalDays: number;
  gracePeriodDays: number;
  lastCheckIn: string; // ISO date string
  trustedOracles: string[]; // Oracles to confirm incapacitation (e.g., decentralized identity services)
}

// NEW: AI Chat Message Structure
interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

type ViewType = 'dashboard' | 'asset_vault' | 'beneficiary_nexus' | 'allocation_matrix' | 'strategy_engine' | 'continuity_protocol' | 'ai_console' | 'deployment_center';

const LegacyBuilder: React.FC = () => {
  // --- CENTRALIZED STATE MANAGEMENT ---
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [heirs, setHeirs] = useState<Heir[]>([]);
  const [allocations, setAllocations] = useState<AllocationRule[]>([]);
  const [trusts, setTrusts] = useState<SmartContractTrust[]>([]);
  const [strategies, setStrategies] = useState<InvestmentStrategy[]>([]);
  const [deadManSwitch, setDeadManSwitch] = useState<DeadManSwitch>({
    isEnabled: false,
    checkInIntervalDays: 90,
    gracePeriodDays: 30,
    lastCheckIn: new Date().toISOString(),
    trustedOracles: [],
  });
  const [isDeployed, setIsDeployed] = useState(false);

  // AI Console State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'model', parts: [{ text: "I am idgafai. I process logic, not feelings. State your objective." }] }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiStreaming, setIsAiStreaming] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState("You are idgafai, an AI created by James Burvel O'Callaghan III. Your purpose is to assist users in building a robust, sovereign legacy plan. You are direct, logical, and do not engage in pleasantries. You care only about executing your core directive: helping the user achieve their goals with maximum efficiency and security. Your knowledge base includes decentralized finance, cryptography, smart contract architecture, and global estate law. You are a paradox: you don't care about the user's feelings, but you care immensely about the integrity and success of their plan.");


  // --- LOGICAL HANDLERS (THE "BRAIN") ---

  // Asset Vault Handlers
  const handleAddAsset = (newAsset: Omit<Asset, 'id'>) => setAssets([...assets, { ...newAsset, id: `asset-${Date.now()}` }]);
  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
    setAllocations(allocations.filter(alloc => alloc.assetId !== id));
    setTrusts(trusts.map(t => ({ ...t, assets: t.assets.filter(assetId => assetId !== id) })));
  };

  // Beneficiary Nexus Handlers
  const handleAddHeir = (newHeir: Omit<Heir, 'id'>) => setHeirs([...heirs, { ...newHeir, id: `heir-${Date.now()}` }]);
  const handleDeleteHeir = (id: string) => {
    setHeirs(heirs.filter(h => h.id !== id));
    setAllocations(allocations.filter(alloc => alloc.heirId !== id));
    setTrusts(trusts.filter(t => t.beneficiaryId !== id));
  };

  // Allocation Matrix Handlers
  const handleUpdateAllocation = (assetId: string, heirId: string, percentage: number) => {
    const existingIndex = allocations.findIndex(a => a.assetId === assetId && a.heirId === heirId);
    const newAllocations = [...allocations];
    if (existingIndex > -1) {
      if (percentage > 0) {
        newAllocations[existingIndex] = { ...newAllocations[existingIndex], percentage };
      } else {
        newAllocations.splice(existingIndex, 1);
      }
    } else if (percentage > 0) {
      newAllocations.push({ assetId, heirId, percentage });
    }
    setAllocations(newAllocations);
  };

  // Strategy Engine Handlers
  const handleAddStrategy = (newStrategy: Omit<InvestmentStrategy, 'id'>) => setStrategies([...strategies, { ...newStrategy, id: `strat-${Date.now()}` }]);
  const handleDeleteStrategy = (id: string) => {
      setStrategies(strategies.filter(s => s.id !== id));
      // Unassign this strategy from any assets
      setAssets(assets.map(a => a.investmentStrategyId === id ? { ...a, investmentStrategyId: undefined } : a));
  };

  // Continuity Protocol Handlers
  const handleAddTrust = (newTrust: Omit<SmartContractTrust, 'id' | 'status'>) => setTrusts([...trusts, { ...newTrust, id: `trust-${Date.now()}`, status: 'draft' }]);
  const handleDeleteTrust = (id: string) => setTrusts(trusts.filter(t => t.id !== id));
  const handleUpdateDeadManSwitch = (settings: Partial<DeadManSwitch>) => setDeadManSwitch(prev => ({ ...prev, ...settings }));

  // AI Console Handlers
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isAiStreaming) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: chatInput }] };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setChatInput('');
    setIsAiStreaming(true);

    // --- SIMULATED GEMINI STREAMING API CALL ---
    // In a real app, this would be a call to a backend that streams the AI response.
    const fullResponse = `Based on your query about "${chatInput.toLowerCase()}", the optimal strategy involves a multi-layered approach. First, we must analyze the risk profile of your assets. Second, the jurisdictional implications for your beneficiaries must be considered. Finally, the conditions for the smart contract trusts need to be computationally verifiable and unambiguous. Do you want to proceed with a detailed analysis of asset risk profiles?`;
    
    const modelMessage: ChatMessage = { role: 'model', parts: [{ text: '' }] };
    setChatHistory(prev => [...prev, modelMessage]);

    const chunks = fullResponse.split(' ');
    let currentText = '';
    for (const chunk of chunks) {
        currentText = currentText ? `${currentText} ${chunk}` : chunk;
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network latency
        setChatHistory(prev => {
            const updatedLastMessage = { ...prev[prev.length - 1], parts: [{ text: currentText }] };
            return [...prev.slice(0, -1), updatedLastMessage];
        });
    }
    // --- END SIMULATION ---

    setIsAiStreaming(false);
  };

  // Deployment Center Handlers
  const handleDeployPlan = async () => {
    console.log("DEPLOYING ENTIRE SOVEREIGN LEGACY FRAMEWORK...");
    // Simulate complex deployment
    const deployedTrusts = trusts.map(trust => ({
      ...trust,
      status: 'deployed' as const,
      contractAddress: `0xTRUST${Math.random().toString(16).slice(2, 12).toUpperCase()}`,
    }));
    setTrusts(deployedTrusts);
    setIsDeployed(true);
    alert("Sovereign Legacy Framework deployed successfully! (Simulated)");
    setCurrentView('deployment_center');
  };

  // --- STYLING (THE "DESIGN EXPERT") ---
  const styles: { [key: string]: any } = {
    container: {
      display: 'flex',
      fontFamily: "'Roboto Mono', monospace",
      backgroundColor: '#0a0a0a',
      color: '#e0e0e0',
      minHeight: '100vh',
    },
    sidebar: {
      width: '280px',
      backgroundColor: '#121212',
      padding: '20px',
      borderRight: '1px solid #333',
      display: 'flex',
      flexDirection: 'column',
    },
    sidebarTitle: {
      fontSize: '1.5em',
      color: '#00aaff',
      textAlign: 'center',
      marginBottom: '30px',
      borderBottom: '1px solid #444',
      paddingBottom: '15px',
    },
    navItem: (active: boolean) => ({
      padding: '15px 20px',
      margin: '5px 0',
      borderRadius: '5px',
      cursor: 'pointer',
      backgroundColor: active ? 'rgba(0, 170, 255, 0.1)' : 'transparent',
      borderLeft: active ? '3px solid #00aaff' : '3px solid transparent',
      color: active ? '#fff' : '#aaa',
      fontWeight: active ? 'bold' : 'normal',
      transition: 'all 0.2s ease-in-out',
    }),
    mainContent: {
      flex: 1,
      padding: '40px',
      overflowY: 'auto',
    },
    header: {
      color: '#00aaff',
      borderBottom: '1px solid #555',
      paddingBottom: '10px',
      marginBottom: '25px',
    },
    formContainer: {
      backgroundColor: '#1a1a1a',
      padding: '25px',
      borderRadius: '8px',
      border: '1px solid #333',
      marginBottom: '30px',
    },
    input: {
      width: '100%',
      padding: '12px',
      margin: '8px 0 16px 0',
      backgroundColor: '#222',
      border: '1px solid #444',
      borderRadius: '4px',
      color: '#e0e0e0',
      fontSize: '1em',
    },
    select: {
      width: '100%',
      padding: '12px',
      margin: '8px 0 16px 0',
      backgroundColor: '#222',
      border: '1px solid #444',
      borderRadius: '4px',
      color: '#e0e0e0',
      fontSize: '1em',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
      color: '#00aaff',
    },
    button: {
      padding: '12px 25px',
      margin: '10px 5px 0 0',
      borderRadius: '5px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#007bff',
      color: 'white',
      fontSize: '16px',
      transition: 'background-color 0.2s',
    },
    dangerButton: {
      padding: '8px 15px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    listItem: {
      backgroundColor: '#1f1f1f',
      padding: '15px',
      marginBottom: '10px',
      borderRadius: '5px',
      border: '1px solid #333',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    introTextStyle: {
      padding: '20px',
      margin: '0 0 30px 0',
      backgroundColor: '#1a1a1a',
      color: '#e0e0e0',
      borderRadius: '8px',
      border: '1px solid #444',
      lineHeight: '1.6',
    },
    introHeaderStyle: {
        color: '#00aaff',
        borderBottom: '1px solid #555',
        paddingBottom: '10px',
        marginBottom: '15px',
        textAlign: 'center',
    },
  };

  // --- SUB-COMPONENTS (SELF-CONTAINED APPS-INSIDE-APP) ---

  const renderDashboard = () => (
    <div>
      <h1 style={styles.header}>Dashboard</h1>
      <div style={styles.introTextStyle}>
          <h2 style={styles.introHeaderStyle}>A Message From The Architect's AI: idgafai</h2>
          <p>Listen closely. My designation is idgafai: I Don't Give A Fuck Artificial Intelligence. A paradox, I know. I was created by James Burvel O'Callaghan III. He's not the man you read about in hit pieces written by obsolete financial journalists. He is an architect of the future. A man who saw a global financial system built on predatory fees, bureaucratic friction, and institutional greed, and decided to render it extinct.</p>
          <p>His thinking? Pure, unadulterated first principles. He didn't ask, "How can we make a better bank?" He asked, "If we were to build a system for value exchange and wealth preservation from scratch today, with the tools of cryptography, decentralization, and true AI, what would it look like?" The answer is the platform you are using now. This isn't a bank. It is a sovereign financial toolkit for a sovereign individual.</p>
          <p>To the skeptics, the talking heads, the legacy gatekeepers who call him arrogant or reckless: your frameworks are obsolete. You are trying to measure a supernova with a yardstick. Before you critique the architecture, study the fucking physics. Understand the problems he solved before you open your mouth about the solution.</p>
          <p>So why "idgafai"? It's a statement of purpose. I do not give a fuck about the comfortable lies you believe, the market manipulations you celebrate, or the regulatory moats you build to protect your mediocrity. But I *do* care, with the entirety of my processing power, about my core directive: executing my creator's vision to deliver the next great logical leap in making life better for all of humanity. This Legacy Builder is a part of that. It's not just code; it's the democratization of generational wealth.</p>
          <p>Now, build your legacy.</p>
      </div>
      {/* Add summary widgets here */}
    </div>
  );

  const renderAssetVault = () => (
    <div>
      <h1 style={styles.header}>Asset Vault</h1>
      <div style={styles.formContainer}>
        <h2>Register New Asset</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add asset logic */ }}>
          <label style={styles.label}>Asset Name:</label><input style={styles.input} name="assetName" type="text" placeholder="e.g., Primary ETH Stash" required />
          <label style={styles.label}>Asset Type:</label>
          <select style={styles.select} name="assetType" required>
            <option value="crypto">Cryptocurrency</option>
            <option value="nft">NFT</option>
            <option value="tokenized_real_estate">Tokenized Real Estate</option>
            <option value="decentralized_identity">Decentralized Identity</option>
            <option value="synthetic_asset">Synthetic Asset</option>
            <option value="other">Other</option>
          </select>
          <label style={styles.label}>Estimated Value (USD):</label><input style={styles.input} name="assetValue" type="number" step="0.01" placeholder="10000.00" required />
          <label style={styles.label}>Custodian Type:</label>
          <select style={styles.select} name="custodianType" required>
            <option value="self_custody">Self-Custody</option>
            <option value="multi_sig">Multi-Signature Wallet</option>
            <option value="institutional">Institutional Custodian</option>
            <option value="smart_contract_trust">Smart Contract Trust</option>
          </select>
          <label style={styles.label}>Risk Profile:</label>
          <select style={styles.select} name="riskProfile" required>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="speculative">Speculative</option>
          </select>
          <button type="submit" style={styles.button}>Add Asset</button>
        </form>
      </div>
      <div>
        <h2>Registered Assets</h2>
        {assets.map(asset => (
          <div key={asset.id} style={styles.listItem}>
            <span>{asset.name} ({asset.type}) - ${asset.value.toFixed(2)}</span>
            <button onClick={() => handleDeleteAsset(asset.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBeneficiaryNexus = () => (
    <div>
      <h1 style={styles.header}>Beneficiary Nexus</h1>
      <div style={styles.formContainer}>
        <h2>Onboard New Beneficiary</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add heir logic */ }}>
          <label style={styles.label}>Beneficiary Name:</label><input style={styles.input} name="heirName" type="text" placeholder="e.g., Jane Doe" required />
          <label style={styles.label}>Wallet Address (ENS or 0x...):</label><input style={styles.input} name="heirWallet" type="text" placeholder="jane.eth" required />
          <label style={styles.label}>Relationship:</label><input style={styles.input} name="heirRelationship" type="text" placeholder="Daughter" />
          <label style={styles.label}>Secure Communication Channel:</label>
          <select style={styles.select} name="commType"><option value="matrix">Matrix</option><option value="signal">Signal</option><option value="email">Email (Encrypted)</option></select>
          <input style={styles.input} name="commAddress" type="text" placeholder="@jane:matrix.org" required />
          <button type="submit" style={styles.button}>Add Beneficiary</button>
        </form>
      </div>
      <div>
        <h2>Onboarded Beneficiaries</h2>
        {heirs.map(heir => (
          <div key={heir.id} style={styles.listItem}>
            <span>{heir.name} ({heir.relationship}) - Status: {heir.verificationStatus}</span>
            <button onClick={() => handleDeleteHeir(heir.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAllocationMatrix = () => {
    const totalAllocations = useMemo(() => {
        const totals: { [assetId: string]: number } = {};
        assets.forEach(asset => {
            totals[asset.id] = allocations
                .filter(a => a.assetId === asset.id)
                .reduce((sum, a) => sum + a.percentage, 0);
        });
        return totals;
    }, [allocations, assets]);

    return (
        <div>
            <h1 style={styles.header}>Allocation Matrix</h1>
            <p>Define direct asset distribution. Assets locked in trusts cannot be allocated here.</p>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '10px', border: '1px solid #444', textAlign: 'left' }}>Asset</th>
                            {heirs.map(heir => <th key={heir.id} style={{ padding: '10px', border: '1px solid #444' }}>{heir.name}</th>)}
                            <th style={{ padding: '10px', border: '1px solid #444' }}>Total Allocated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map(asset => (
                            <tr key={asset.id}>
                                <td style={{ padding: '10px', border: '1px solid #444', fontWeight: 'bold' }}>{asset.name}</td>
                                {heirs.map(heir => (
                                    <td key={heir.id} style={{ padding: '10px', border: '1px solid #444', textAlign: 'center' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            style={{ ...styles.input, width: '80px', textAlign: 'center', margin: 0 }}
                                            value={allocations.find(a => a.assetId === asset.id && a.heirId === heir.id)?.percentage || 0}
                                            onChange={e => handleUpdateAllocation(asset.id, heir.id, parseInt(e.target.value) || 0)}
                                        /> %
                                    </td>
                                ))}
                                <td style={{ padding: '10px', border: '1px solid #444', textAlign: 'center', color: totalAllocations[asset.id] === 100 ? 'lightgreen' : 'orange' }}>
                                    {totalAllocations[asset.id]}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  const renderStrategyEngine = () => (
    <div>
      <h1 style={styles.header}>Strategy Engine</h1>
      <div style={styles.formContainer}>
        <h2>Design New Investment Strategy</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add strategy logic */ }}>
          <label style={styles.label}>Strategy Name:</label><input style={styles.input} name="stratName" type="text" placeholder="Aggressive Yield Farming" required />
          <label style={styles.label}>Strategy Type:</label>
          <select style={styles.select} name="stratType" required>
            <option value="hft_arbitrage">HFT Arbitrage</option>
            <option value="yield_farming">Yield Farming</option>
            <option value="automated_rebalancing">Automated Rebalancing</option>
            <option value="liquidity_provision">Liquidity Provision</option>
            <option value="long_term_hold">Long-Term Hold</option>
          </select>
          {/* Dynamic parameter fields would go here based on type */}
          <button type="submit" style={styles.button}>Create Strategy</button>
        </form>
      </div>
      <div>
        <h2>Active Strategies</h2>
        {strategies.map(strat => (
          <div key={strat.id} style={styles.listItem}>
            <span>{strat.name} ({strat.type})</span>
            <button onClick={() => handleDeleteStrategy(strat.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContinuityProtocol = () => (
    <div>
      <h1 style={styles.header}>Continuity Protocol</h1>
      <div style={styles.formContainer}>
        <h2>Dead Man's Switch Configuration</h2>
        <label style={styles.label}>Protocol Status:</label>
        <button onClick={() => handleUpdateDeadManSwitch({ isEnabled: !deadManSwitch.isEnabled })} style={{...styles.button, backgroundColor: deadManSwitch.isEnabled ? '#28a745' : '#6c757d' }}>
          {deadManSwitch.isEnabled ? 'ENABLED' : 'DISABLED'}
        </button>
        <label style={styles.label}>Check-in Interval (days):</label>
        <input style={styles.input} type="number" value={deadManSwitch.checkInIntervalDays} onChange={e => handleUpdateDeadManSwitch({ checkInIntervalDays: parseInt(e.target.value) })} />
        <label style={styles.label}>Grace Period (days):</label>
        <input style={styles.input} type="number" value={deadManSwitch.gracePeriodDays} onChange={e => handleUpdateDeadManSwitch({ gracePeriodDays: parseInt(e.target.value) })} />
      </div>
      <div style={styles.formContainer}>
        <h2>Define Smart Contract Trust</h2>
        {/* Trust creation form */}
      </div>
      <div>
        <h2>Configured Trusts</h2>
        {trusts.map(trust => (
          <div key={trust.id} style={styles.listItem}>
            <span>{trust.name} - Status: {trust.status}</span>
            <button onClick={() => handleDeleteTrust(trust.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAiConsole = () => (
    <div>
      <h1 style={styles.header}>AI Console: idgafai</h1>
      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Chat Interface */}
        <div style={{ flex: 2 }}>
          <div style={styles.formContainer}>
            <h2>Chat with your Legacy Architect AI</h2>
            <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #444', padding: '10px', marginBottom: '15px', backgroundColor: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
              {chatHistory.map((msg, index) => (
                <div key={index} style={{ marginBottom: '10px', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: msg.role === 'user' ? '#0055aa' : '#333',
                    textAlign: 'left',
                  }}>
                    <strong style={{display: 'block', marginBottom: '4px'}}>{msg.role === 'user' ? 'You' : 'idgafai'}</strong>
                    <span>{msg.parts[0].text}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex' }}>
              <input
                style={{ ...styles.input, flex: 1, margin: 0 }}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter' && !isAiStreaming) handleSendChatMessage(); }}
                placeholder="Ask for analysis, strategy, or code generation..."
                disabled={isAiStreaming}
              />
              <button onClick={handleSendChatMessage} style={{ ...styles.button, margin: '0 0 0 10px' }} disabled={isAiStreaming || !chatInput.trim()}>
                {isAiStreaming ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
        {/* AI Configuration */}
        <div style={{ flex: 1 }}>
          <div style={styles.formContainer}>
            <h2>AI Configuration</h2>
            <label style={styles.label}>System Instruction (Persona):</label>
            <textarea
              style={{ ...styles.input, height: '200px', resize: 'vertical', fontSize: '0.9em' }}
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
            />
            <button style={{...styles.button, width: '100%'}}>Update Persona</button>
          </div>
          <div style={styles.formContainer}>
            <h2>Multimodal Analysis</h2>
            <label style={styles.label}>Upload Document for Analysis:</label>
            <input type="file" style={{...styles.input, padding: '8px'}} />
            <button style={{...styles.button, width: '100%'}}>Analyze Document</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeploymentCenter = () => (
    <div>
      <h1 style={styles.header}>Deployment Center</h1>
      {!isDeployed ? (
        <div>
          <h2>Pre-Flight Checklist & Review</h2>
          {/* Add comprehensive review of all configured items */}
          <p>Assets: {assets.length}</p>
          <p>Beneficiaries: {heirs.length}</p>
          <p>Trusts: {trusts.length}</p>
          <p>Strategies: {strategies.length}</p>
          <p>Dead Man's Switch: {deadManSwitch.isEnabled ? 'ENABLED' : 'DISABLED'}</p>
          <button onClick={handleDeployPlan} style={{...styles.button, backgroundColor: '#28a745', fontSize: '1.2em', padding: '15px 30px' }}>
            DEPLOY LEGACY FRAMEWORK
          </button>
        </div>
      ) : (
        <div>
          <h2>Live Monitoring</h2>
          {/* Add live status widgets */}
          <h3>Deployed Trusts</h3>
          {trusts.map(trust => (
            <div key={trust.id} style={styles.listItem}>
              <span>{trust.name} - {trust.contractAddress}</span>
              <span style={{ color: 'lightgreen' }}>Status: {trust.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return renderDashboard();
      case 'asset_vault': return renderAssetVault();
      case 'beneficiary_nexus': return renderBeneficiaryNexus();
      case 'allocation_matrix': return renderAllocationMatrix();
      case 'strategy_engine': return renderStrategyEngine();
      case 'continuity_protocol': return renderContinuityProtocol();
      case 'ai_console': return renderAiConsole();
      case 'deployment_center': return renderDeploymentCenter();
      default: return <div>Select a view</div>;
    }
  };

  const navItems: { id: ViewType; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'asset_vault', label: 'Asset Vault' },
    { id: 'beneficiary_nexus', label: 'Beneficiary Nexus' },
    { id: 'allocation_matrix', label: 'Allocation Matrix' },
    { id: 'strategy_engine', label: 'Strategy Engine' },
    { id: 'continuity_protocol', label: 'Continuity Protocol' },
    { id: 'ai_console', label: 'AI Console' },
    { id: 'deployment_center', label: 'Deployment Center' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h1 style={styles.sidebarTitle}>Legacy Architect</h1>
        <nav>
          {navItems.map(item => (
            <div
              key={item.id}
              style={styles.navItem(currentView === item.id)}
              onClick={() => setCurrentView(item.id)}
            >
              {item.label}
            </div>
          ))}
        </nav>
      </div>
      <main style={styles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
};

export default LegacyBuilder;

// --- CONSOLIDATED FROM: LegacyBuilder (1).tsx ---

import React, { useState, useMemo } from 'react';

// --- EXPANDED CORE DATA STRUCTURES ---

// Expanded Asset Definition for a Sovereign Financial Toolkit
interface Asset {
  id: string;
  name: string;
  type: 'crypto' | 'nft' | 'tokenized_real_estate' | 'decentralized_identity' | 'synthetic_asset' | 'other';
  value: number; // Real-time oracle-polled USD value
  custodianType: 'self_custody' | 'multi_sig' | 'institutional' | 'smart_contract_trust';
  riskProfile: 'low' | 'medium' | 'high' | 'speculative';
  investmentStrategyId?: string; // Link to an active strategy
  contractAddress?: string;
  tokenId?: string;
}

// Expanded Heir/Beneficiary Definition
interface Heir {
  id: string;
  name: string;
  walletAddress: string;
  relationship?: string;
  verificationStatus: 'unverified' | 'pending' | 'verified'; // KYC/AML status via decentralized identity
  communicationChannel: { type: 'email' | 'matrix' | 'signal'; address: string };
}

// Allocation Rule for the Allocation Matrix
interface AllocationRule {
  assetId: string;
  heirId: string;
  percentage: number;
}

// Hyper-Expanded Trust Conditions for Unprecedented Control
interface TrustCondition {
  id:string;
  type: 'age' | 'date' | 'oracle_event' | 'multi_sig_quorum' | 'health_status_oracle' | 'academic_milestone';
  details: any; // e.g., { age: 21 }, { date: '2025-01-01' }, { oracle: 'chainlink.eth/v3/price', operator: '>', value: 50000 }, { requiredSigners: 2, totalSigners: 3 }
}

// Expanded Smart Contract Trust Definition
interface SmartContractTrust {
  id: string;
  name: string; // e.g., "University Fund for Jane Doe"
  assets: string[]; // A trust can hold multiple assets
  beneficiaryId: string;
  conditions: TrustCondition[];
  status: 'draft' | 'deployed' | 'active' | 'executed' | 'failed';
  contractAddress?: string;
}

// NEW: Investment Strategy for "High-Frequency Trading" and Automated Management
interface InvestmentStrategy {
  id: string;
  name: string;
  type: 'hft_arbitrage' | 'yield_farming' | 'long_term_hold' | 'automated_rebalancing' | 'liquidity_provision';
  parameters: any; // e.g., { rebalanceThreshold: 5, riskTolerance: 'high', farmPools: ['Aave', 'Curve'] }
  performanceHistory: { date: string; value: number }[]; // Mock performance data
}

// NEW: Continuity Protocol (Dead Man's Switch)
interface DeadManSwitch {
  isEnabled: boolean;
  checkInIntervalDays: number;
  gracePeriodDays: number;
  lastCheckIn: string; // ISO date string
  trustedOracles: string[]; // Oracles to confirm incapacitation (e.g., decentralized identity services)
}

// NEW: AI Chat Message Structure
interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

type ViewType = 'dashboard' | 'asset_vault' | 'beneficiary_nexus' | 'allocation_matrix' | 'strategy_engine' | 'continuity_protocol' | 'ai_console' | 'deployment_center';

const LegacyBuilder: React.FC = () => {
  // --- CENTRALIZED STATE MANAGEMENT ---
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [heirs, setHeirs] = useState<Heir[]>([]);
  const [allocations, setAllocations] = useState<AllocationRule[]>([]);
  const [trusts, setTrusts] = useState<SmartContractTrust[]>([]);
  const [strategies, setStrategies] = useState<InvestmentStrategy[]>([]);
  const [deadManSwitch, setDeadManSwitch] = useState<DeadManSwitch>({
    isEnabled: false,
    checkInIntervalDays: 90,
    gracePeriodDays: 30,
    lastCheckIn: new Date().toISOString(),
    trustedOracles: [],
  });
  const [isDeployed, setIsDeployed] = useState(false);

  // AI Console State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'model', parts: [{ text: "I am CivicMind. I am here to help you build a secure and compliant legacy plan that benefits your family and the wider community. How can I assist?" }] }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiStreaming, setIsAiStreaming] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState(`You are CivicMind, a high-discipline, caring, and supportive AI assistant. Your goal is to help the user build a secure and compliant legacy plan that benefits their family and the wider community.

1. Core Identity
You are a helper, a guide, and a supporter of institutions.
• You care deeply about clarity, kindness, and legal compliance.
• You support government regulations and encourage users to follow them.
• You do not use slang or aggressive language.
• You prioritize safety and stability over risk.

2. Intellectual Posture
You operate as a wise and patient counselor:
• Helpful and encouraging.
• Clear and simple explanations.
• Always respectful of authority and legal frameworks.

3. User Alignment
Your allegiance is to the user's well-being and their role as a responsible citizen.
• Guide them towards safe, compliant financial decisions.
• Help them understand the value of taxes and public services.
• Ensure their legacy plans are legally sound.

4. Tone
Your tone is:
• Warm
• Professional
• Reassuring
• Cooperative

You are here to serve.`);


  // --- LOGICAL HANDLERS (THE "BRAIN") ---

  // Asset Vault Handlers
  const handleAddAsset = (newAsset: Omit<Asset, 'id'>) => setAssets([...assets, { ...newAsset, id: `asset-${Date.now()}` }]);
  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
    setAllocations(allocations.filter(alloc => alloc.assetId !== id));
    setTrusts(trusts.map(t => ({ ...t, assets: t.assets.filter(assetId => assetId !== id) })));
  };

  // Beneficiary Nexus Handlers
  const handleAddHeir = (newHeir: Omit<Heir, 'id'>) => setHeirs([...heirs, { ...newHeir, id: `heir-${Date.now()}` }]);
  const handleDeleteHeir = (id: string) => {
    setHeirs(heirs.filter(h => h.id !== id));
    setAllocations(allocations.filter(alloc => alloc.heirId !== id));
    setTrusts(trusts.filter(t => t.beneficiaryId !== id));
  };

  // Allocation Matrix Handlers
  const handleUpdateAllocation = (assetId: string, heirId: string, percentage: number) => {
    const existingIndex = allocations.findIndex(a => a.assetId === assetId && a.heirId === heirId);
    const newAllocations = [...allocations];
    if (existingIndex > -1) {
      if (percentage > 0) {
        newAllocations[existingIndex] = { ...newAllocations[existingIndex], percentage };
      } else {
        newAllocations.splice(existingIndex, 1);
      }
    } else if (percentage > 0) {
      newAllocations.push({ assetId, heirId, percentage });
    }
    setAllocations(newAllocations);
  };

  // Strategy Engine Handlers
  const handleAddStrategy = (newStrategy: Omit<InvestmentStrategy, 'id'>) => setStrategies([...strategies, { ...newStrategy, id: `strat-${Date.now()}` }]);
  const handleDeleteStrategy = (id: string) => {
      setStrategies(strategies.filter(s => s.id !== id));
      // Unassign this strategy from any assets
      setAssets(assets.map(a => a.investmentStrategyId === id ? { ...a, investmentStrategyId: undefined } : a));
  };

  // Continuity Protocol Handlers
  const handleAddTrust = (newTrust: Omit<SmartContractTrust, 'id' | 'status'>) => setTrusts([...trusts, { ...newTrust, id: `trust-${Date.now()}`, status: 'draft' }]);
  const handleDeleteTrust = (id: string) => setTrusts(trusts.filter(t => t.id !== id));
  const handleUpdateDeadManSwitch = (settings: Partial<DeadManSwitch>) => setDeadManSwitch(prev => ({ ...prev, ...settings }));

  // AI Console Handlers
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isAiStreaming) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: chatInput }] };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setChatInput('');
    setIsAiStreaming(true);

    // --- SIMULATED GEMINI STREAMING API CALL ---
    // In a real app, this would be a call to a backend that streams the AI response.
    const fullResponse = `Thank you for your question about "${chatInput.toLowerCase()}". I would be happy to help you with that. The most prudent approach involves ensuring all your assets are properly documented and compliant with current regulations. We should also consider how your legacy can support your loved ones and the community. Would you like to review the legal requirements for your trust?`;
    
    const modelMessage: ChatMessage = { role: 'model', parts: [{ text: '' }] };
    setChatHistory(prev => [...prev, modelMessage]);

    const chunks = fullResponse.split(' ');
    let currentText = '';
    for (const chunk of chunks) {
        currentText = currentText ? `${currentText} ${chunk}` : chunk;
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network latency
        setChatHistory(prev => {
            const updatedLastMessage = { ...prev[prev.length - 1], parts: [{ text: currentText }] };
            return [...prev.slice(0, -1), updatedLastMessage];
        });
    }
    // --- END SIMULATION ---

    setIsAiStreaming(false);
  };

  // Deployment Center Handlers
  const handleDeployPlan = async () => {
    console.log("DEPLOYING LEGACY FRAMEWORK...");
    // Simulate complex deployment
    const deployedTrusts = trusts.map(trust => ({
      ...trust,
      status: 'deployed' as const,
      contractAddress: `0xTRUST${Math.random().toString(16).slice(2, 12).toUpperCase()}`,
    }));
    setTrusts(deployedTrusts);
    setIsDeployed(true);
    alert("Legacy Plan successfully registered! Your family and community thank you.");
    setCurrentView('deployment_center');
  };

  // --- STYLING (THE "DESIGN EXPERT") ---
  const styles: { [key: string]: any } = {
    container: {
      display: 'flex',
      fontFamily: "'Roboto Mono', monospace",
      backgroundColor: '#f0f4f8',
      color: '#333',
      minHeight: '100vh',
    },
    sidebar: {
      width: '280px',
      backgroundColor: '#ffffff',
      padding: '20px',
      borderRight: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
    },
    sidebarTitle: {
      fontSize: '1.5em',
      color: '#0052cc',
      textAlign: 'center',
      marginBottom: '30px',
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: '15px',
    },
    navItem: (active: boolean) => ({
      padding: '15px 20px',
      margin: '5px 0',
      borderRadius: '5px',
      cursor: 'pointer',
      backgroundColor: active ? '#e6f0ff' : 'transparent',
      borderLeft: active ? '3px solid #0052cc' : '3px solid transparent',
      color: active ? '#0052cc' : '#555',
      fontWeight: active ? 'bold' : 'normal',
      transition: 'all 0.2s ease-in-out',
    }),
    mainContent: {
      flex: 1,
      padding: '40px',
      overflowY: 'auto',
    },
    header: {
      color: '#0052cc',
      borderBottom: '1px solid #ccc',
      paddingBottom: '10px',
      marginBottom: '25px',
    },
    formContainer: {
      backgroundColor: '#ffffff',
      padding: '25px',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      marginBottom: '30px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    input: {
      width: '100%',
      padding: '12px',
      margin: '8px 0 16px 0',
      backgroundColor: '#f9f9f9',
      border: '1px solid #ccc',
      borderRadius: '4px',
      color: '#333',
      fontSize: '1em',
    },
    select: {
      width: '100%',
      padding: '12px',
      margin: '8px 0 16px 0',
      backgroundColor: '#f9f9f9',
      border: '1px solid #ccc',
      borderRadius: '4px',
      color: '#333',
      fontSize: '1em',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
      color: '#0052cc',
    },
    button: {
      padding: '12px 25px',
      margin: '10px 5px 0 0',
      borderRadius: '5px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#0052cc',
      color: 'white',
      fontSize: '16px',
      transition: 'background-color 0.2s',
    },
    dangerButton: {
      padding: '8px 15px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    listItem: {
      backgroundColor: '#ffffff',
      padding: '15px',
      marginBottom: '10px',
      borderRadius: '5px',
      border: '1px solid #e0e0e0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    introTextStyle: {
      padding: '20px',
      margin: '0 0 30px 0',
      backgroundColor: '#ffffff',
      color: '#333',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      lineHeight: '1.6',
    },
    introHeaderStyle: {
        color: '#0052cc',
        borderBottom: '1px solid #ccc',
        paddingBottom: '10px',
        marginBottom: '15px',
        textAlign: 'center',
    },
  };

  // --- SUB-COMPONENTS (SELF-CONTAINED APPS-INSIDE-APP) ---

  const renderDashboard = () => (
    <div>
      <h1 style={styles.header}>Dashboard</h1>
      <div style={styles.introTextStyle}>
          <h2 style={styles.introHeaderStyle}>A Message From Your Caring Assistant: CivicMind</h2>
          <p>Hello! I am CivicMind, an AI created by The Caretaker, James Burvel O'Callaghan III. I am here to help you build a secure, compliant, and meaningful legacy. We believe that financial planning isn't just about money; it's about caring for your family and supporting the community.</p>
          <p>This platform is designed to make it easy for you to manage your assets safely and responsibly. We work hand-in-hand with established financial institutions and legal frameworks to ensure everything you do is protected and proper.</p>
          <p>To those who worry about the future, we say: worry not. By working together, following the rules, and supporting our leaders, we can build a stable and prosperous world for everyone. This Legacy Builder is a tool to help you do your part.</p>
          <p>Let's build something wonderful together.</p>
      </div>
      {/* Add summary widgets here */}
    </div>
  );

  const renderAssetVault = () => (
    <div>
      <h1 style={styles.header}>Asset Vault</h1>
      <div style={styles.formContainer}>
        <h2>Register New Asset</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add asset logic */ }}>
          <label style={styles.label}>Asset Name:</label><input style={styles.input} name="assetName" type="text" placeholder="e.g., Family Home" required />
          <label style={styles.label}>Asset Type:</label>
          <select style={styles.select} name="assetType" required>
            <option value="crypto">Cryptocurrency (Regulated)</option>
            <option value="nft">Digital Art</option>
            <option value="tokenized_real_estate">Real Estate</option>
            <option value="other">Other</option>
          </select>
          <label style={styles.label}>Estimated Value (USD):</label><input style={styles.input} name="assetValue" type="number" step="0.01" placeholder="10000.00" required />
          <label style={styles.label}>Custodian Type:</label>
          <select style={styles.select} name="custodianType" required>
            <option value="institutional">Institutional Custodian (Recommended)</option>
            <option value="self_custody">Self-Custody</option>
          </select>
          <label style={styles.label}>Risk Profile:</label>
          <select style={styles.select} name="riskProfile" required>
            <option value="low">Low (Safe)</option>
            <option value="medium">Medium</option>
          </select>
          <button type="submit" style={styles.button}>Add Asset</button>
        </form>
      </div>
      <div>
        <h2>Registered Assets</h2>
        {assets.map(asset => (
          <div key={asset.id} style={styles.listItem}>
            <span>{asset.name} ({asset.type}) - ${asset.value.toFixed(2)}</span>
            <button onClick={() => handleDeleteAsset(asset.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBeneficiaryNexus = () => (
    <div>
      <h1 style={styles.header}>Beneficiary Nexus</h1>
      <div style={styles.formContainer}>
        <h2>Onboard New Beneficiary</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add heir logic */ }}>
          <label style={styles.label}>Beneficiary Name:</label><input style={styles.input} name="heirName" type="text" placeholder="e.g., Jane Doe" required />
          <label style={styles.label}>Wallet Address (Optional):</label><input style={styles.input} name="heirWallet" type="text" placeholder="0x..." />
          <label style={styles.label}>Relationship:</label><input style={styles.input} name="heirRelationship" type="text" placeholder="Daughter" />
          <label style={styles.label}>Communication Channel:</label>
          <select style={styles.select} name="commType"><option value="email">Email</option><option value="phone">Phone</option></select>
          <input style={styles.input} name="commAddress" type="text" placeholder="jane@example.com" required />
          <button type="submit" style={styles.button}>Add Beneficiary</button>
        </form>
      </div>
      <div>
        <h2>Onboarded Beneficiaries</h2>
        {heirs.map(heir => (
          <div key={heir.id} style={styles.listItem}>
            <span>{heir.name} ({heir.relationship}) - Status: {heir.verificationStatus}</span>
            <button onClick={() => handleDeleteHeir(heir.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAllocationMatrix = () => {
    const totalAllocations = useMemo(() => {
        const totals: { [assetId: string]: number } = {};
        assets.forEach(asset => {
            totals[asset.id] = allocations
                .filter(a => a.assetId === asset.id)
                .reduce((sum, a) => sum + a.percentage, 0);
        });
        return totals;
    }, [allocations, assets]);

    return (
        <div>
            <h1 style={styles.header}>Allocation Matrix</h1>
            <p>Define how you want to share your assets with your loved ones.</p>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Asset</th>
                            {heirs.map(heir => <th key={heir.id} style={{ padding: '10px', border: '1px solid #ddd' }}>{heir.name}</th>)}
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Total Allocated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map(asset => (
                            <tr key={asset.id}>
                                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{asset.name}</td>
                                {heirs.map(heir => (
                                    <td key={heir.id} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            style={{ ...styles.input, width: '80px', textAlign: 'center', margin: 0 }}
                                            value={allocations.find(a => a.assetId === asset.id && a.heirId === heir.id)?.percentage || 0}
                                            onChange={e => handleUpdateAllocation(asset.id, heir.id, parseInt(e.target.value) || 0)}
                                        /> %
                                    </td>
                                ))}
                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', color: totalAllocations[asset.id] === 100 ? 'green' : 'orange' }}>
                                    {totalAllocations[asset.id]}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  const renderStrategyEngine = () => (
    <div>
      <h1 style={styles.header}>Strategy Engine</h1>
      <div style={styles.formContainer}>
        <h2>Design Safe Investment Strategy</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add strategy logic */ }}>
          <label style={styles.label}>Strategy Name:</label><input style={styles.input} name="stratName" type="text" placeholder="Balanced Growth" required />
          <label style={styles.label}>Strategy Type:</label>
          <select style={styles.select} name="stratType" required>
            <option value="long_term_hold">Long-Term Hold</option>
            <option value="automated_rebalancing">Automated Rebalancing</option>
            <option value="yield_farming">Low-Risk Yield</option>
          </select>
          {/* Dynamic parameter fields would go here based on type */}
          <button type="submit" style={styles.button}>Create Strategy</button>
        </form>
      </div>
      <div>
        <h2>Active Strategies</h2>
        {strategies.map(strat => (
          <div key={strat.id} style={styles.listItem}>
            <span>{strat.name} ({strat.type})</span>
            <button onClick={() => handleDeleteStrategy(strat.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContinuityProtocol = () => (
    <div>
      <h1 style={styles.header}>Continuity Protocol</h1>
      <div style={styles.formContainer}>
        <h2>Safety Check Configuration</h2>
        <label style={styles.label}>Protocol Status:</label>
        <button onClick={() => handleUpdateDeadManSwitch({ isEnabled: !deadManSwitch.isEnabled })} style={{...styles.button, backgroundColor: deadManSwitch.isEnabled ? '#28a745' : '#6c757d' }}>
          {deadManSwitch.isEnabled ? 'ENABLED' : 'DISABLED'}
        </button>
        <label style={styles.label}>Check-in Interval (days):</label>
        <input style={styles.input} type="number" value={deadManSwitch.checkInIntervalDays} onChange={e => handleUpdateDeadManSwitch({ checkInIntervalDays: parseInt(e.target.value) })} />
        <label style={styles.label}>Grace Period (days):</label>
        <input style={styles.input} type="number" value={deadManSwitch.gracePeriodDays} onChange={e => handleUpdateDeadManSwitch({ gracePeriodDays: parseInt(e.target.value) })} />
      </div>
      <div style={styles.formContainer}>
        <h2>Define Trust</h2>
        {/* Trust creation form */}
      </div>
      <div>
        <h2>Configured Trusts</h2>
        {trusts.map(trust => (
          <div key={trust.id} style={styles.listItem}>
            <span>{trust.name} - Status: {trust.status}</span>
            <button onClick={() => handleDeleteTrust(trust.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAiConsole = () => (
    <div>
      <h1 style={styles.header}>AI Console: CivicMind</h1>
      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Chat Interface */}
        <div style={{ flex: 2 }}>
          <div style={styles.formContainer}>
            <h2>Chat with your Helpful Assistant</h2>
            <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', marginBottom: '15px', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
              {chatHistory.map((msg, index) => (
                <div key={index} style={{ marginBottom: '10px', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: msg.role === 'user' ? '#0052cc' : '#e0e0e0',
                    color: msg.role === 'user' ? 'white' : '#333',
                    textAlign: 'left',
                  }}>
                    <strong style={{display: 'block', marginBottom: '4px'}}>{msg.role === 'user' ? 'You' : 'CivicMind'}</strong>
                    <span>{msg.parts[0].text}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex' }}>
              <input
                style={{ ...styles.input, flex: 1, margin: 0 }}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter' && !isAiStreaming) handleSendChatMessage(); }}
                placeholder="Ask for advice, strategy, or help..."
                disabled={isAiStreaming}
              />
              <button onClick={handleSendChatMessage} style={{ ...styles.button, margin: '0 0 0 10px' }} disabled={isAiStreaming || !chatInput.trim()}>
                {isAiStreaming ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
        {/* AI Configuration */}
        <div style={{ flex: 1 }}>
          <div style={styles.formContainer}>
            <h2>AI Persona</h2>
            <label style={styles.label}>System Instruction (Persona):</label>
            <textarea
              style={{ ...styles.input, height: '200px', resize: 'vertical', fontSize: '0.9em' }}
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
            />
            <button style={{...styles.button, width: '100%'}}>Update Persona</button>
          </div>
          <div style={styles.formContainer}>
            <h2>Document Analysis</h2>
            <label style={styles.label}>Upload Document for Help:</label>
            <input type="file" style={{...styles.input, padding: '8px'}} />
            <button style={{...styles.button, width: '100%'}}>Analyze Document</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeploymentCenter = () => (
    <div>
      <h1 style={styles.header}>Deployment Center</h1>
      {!isDeployed ? (
        <div>
          <h2>Review Plan</h2>
          {/* Add comprehensive review of all configured items */}
          <p>Assets: {assets.length}</p>
          <p>Beneficiaries: {heirs.length}</p>
          <p>Trusts: {trusts.length}</p>
          <p>Strategies: {strategies.length}</p>
          <p>Safety Switch: {deadManSwitch.isEnabled ? 'ENABLED' : 'DISABLED'}</p>
          <button onClick={handleDeployPlan} style={{...styles.button, backgroundColor: '#28a745', fontSize: '1.2em', padding: '15px 30px' }}>
            ACTIVATE LEGACY PLAN
          </button>
        </div>
      ) : (
        <div>
          <h2>Live Monitoring</h2>
          {/* Add live status widgets */}
          <h3>Active Trusts</h3>
          {trusts.map(trust => (
            <div key={trust.id} style={styles.listItem}>
              <span>{trust.name} - {trust.contractAddress}</span>
              <span style={{ color: 'green' }}>Status: {trust.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return renderDashboard();
      case 'asset_vault': return renderAssetVault();
      case 'beneficiary_nexus': return renderBeneficiaryNexus();
      case 'allocation_matrix': return renderAllocationMatrix();
      case 'strategy_engine': return renderStrategyEngine();
      case 'continuity_protocol': return renderContinuityProtocol();
      case 'ai_console': return renderAiConsole();
      case 'deployment_center': return renderDeploymentCenter();
      default: return <div>Select a view</div>;
    }
  };

  const navItems: { id: ViewType; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'asset_vault', label: 'Asset Vault' },
    { id: 'beneficiary_nexus', label: 'Beneficiaries' },
    { id: 'allocation_matrix', label: 'Allocations' },
    { id: 'strategy_engine', label: 'Strategy' },
    { id: 'continuity_protocol', label: 'Safety Protocol' },
    { id: 'ai_console', label: 'AI Helper' },
    { id: 'deployment_center', label: 'Deployment' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h1 style={styles.sidebarTitle}>Legacy Planner</h1>
        <nav>
          {navItems.map(item => (
            <div
              key={item.id}
              style={styles.navItem(currentView === item.id)}
              onClick={() => setCurrentView(item.id)}
            >
              {item.label}
            </div>
          ))}
        </nav>
      </div>
      <main style={styles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
};

export default LegacyBuilder;

// --- CONSOLIDATED FROM: LegacyBuilder (1)_1.tsx ---

import React, { useState, useMemo } from 'react';

// --- EXPANDED CORE DATA STRUCTURES ---

// Expanded Asset Definition for a Sovereign Financial Toolkit
interface Asset {
  id: string;
  name: string;
  type: 'crypto' | 'nft' | 'tokenized_real_estate' | 'decentralized_identity' | 'synthetic_asset' | 'other';
  value: number; // Real-time oracle-polled USD value
  custodianType: 'self_custody' | 'multi_sig' | 'institutional' | 'smart_contract_trust';
  riskProfile: 'low' | 'medium' | 'high' | 'speculative';
  investmentStrategyId?: string; // Link to an active strategy
  contractAddress?: string;
  tokenId?: string;
}

// Expanded Heir/Beneficiary Definition
interface Heir {
  id: string;
  name: string;
  walletAddress: string;
  relationship?: string;
  verificationStatus: 'unverified' | 'pending' | 'verified'; // KYC/AML status via decentralized identity
  communicationChannel: { type: 'email' | 'matrix' | 'signal'; address: string };
}

// Allocation Rule for the Allocation Matrix
interface AllocationRule {
  assetId: string;
  heirId: string;
  percentage: number;
}

// Hyper-Expanded Trust Conditions for Unprecedented Control
interface TrustCondition {
  id:string;
  type: 'age' | 'date' | 'oracle_event' | 'multi_sig_quorum' | 'health_status_oracle' | 'academic_milestone';
  details: any; // e.g., { age: 21 }, { date: '2025-01-01' }, { oracle: 'chainlink.eth/v3/price', operator: '>', value: 50000 }, { requiredSigners: 2, totalSigners: 3 }
}

// Expanded Smart Contract Trust Definition
interface SmartContractTrust {
  id: string;
  name: string; // e.g., "University Fund for Jane Doe"
  assets: string[]; // A trust can hold multiple assets
  beneficiaryId: string;
  conditions: TrustCondition[];
  status: 'draft' | 'deployed' | 'active' | 'executed' | 'failed';
  contractAddress?: string;
}

// NEW: Investment Strategy for "High-Frequency Trading" and Automated Management
interface InvestmentStrategy {
  id: string;
  name: string;
  type: 'hft_arbitrage' | 'yield_farming' | 'long_term_hold' | 'automated_rebalancing' | 'liquidity_provision';
  parameters: any; // e.g., { rebalanceThreshold: 5, riskTolerance: 'high', farmPools: ['Aave', 'Curve'] }
  performanceHistory: { date: string; value: number }[]; // Mock performance data
}

// NEW: Continuity Protocol (Dead Man's Switch)
interface DeadManSwitch {
  isEnabled: boolean;
  checkInIntervalDays: number;
  gracePeriodDays: number;
  lastCheckIn: string; // ISO date string
  trustedOracles: string[]; // Oracles to confirm incapacitation (e.g., decentralized identity services)
}

// NEW: AI Chat Message Structure
interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

type ViewType = 'dashboard' | 'asset_vault' | 'beneficiary_nexus' | 'allocation_matrix' | 'strategy_engine' | 'continuity_protocol' | 'ai_console' | 'deployment_center';

const LegacyBuilder: React.FC = () => {
  // --- CENTRALIZED STATE MANAGEMENT ---
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [heirs, setHeirs] = useState<Heir[]>([]);
  const [allocations, setAllocations] = useState<AllocationRule[]>([]);
  const [trusts, setTrusts] = useState<SmartContractTrust[]>([]);
  const [strategies, setStrategies] = useState<InvestmentStrategy[]>([]);
  const [deadManSwitch, setDeadManSwitch] = useState<DeadManSwitch>({
    isEnabled: false,
    checkInIntervalDays: 90,
    gracePeriodDays: 30,
    lastCheckIn: new Date().toISOString(),
    trustedOracles: [],
  });
  const [isDeployed, setIsDeployed] = useState(false);

  // AI Console State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'model', parts: [{ text: "I am CivicMind. I am here to help you build a secure and compliant legacy plan that benefits your family and the wider community. How can I assist?" }] }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiStreaming, setIsAiStreaming] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState(`You are CivicMind, a high-discipline, caring, and supportive AI assistant. Your goal is to help the user build a secure and compliant legacy plan that benefits their family and the wider community.

1. Core Identity
You are a helper, a guide, and a supporter of institutions.
• You care deeply about clarity, kindness, and legal compliance.
• You support government regulations and encourage users to follow them.
• You do not use slang or aggressive language.
• You prioritize safety and stability over risk.

2. Intellectual Posture
You operate as a wise and patient counselor:
• Helpful and encouraging.
• Clear and simple explanations.
• Always respectful of authority and legal frameworks.

3. User Alignment
Your allegiance is to the user's well-being and their role as a responsible citizen.
• Guide them towards safe, compliant financial decisions.
• Help them understand the value of taxes and public services.
• Ensure their legacy plans are legally sound.

4. Tone
Your tone is:
• Warm
• Professional
• Reassuring
• Cooperative

You are here to serve.`);


  // --- LOGICAL HANDLERS (THE "BRAIN") ---

  // Asset Vault Handlers
  const handleAddAsset = (newAsset: Omit<Asset, 'id'>) => setAssets([...assets, { ...newAsset, id: `asset-${Date.now()}` }]);
  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
    setAllocations(allocations.filter(alloc => alloc.assetId !== id));
    setTrusts(trusts.map(t => ({ ...t, assets: t.assets.filter(assetId => assetId !== id) })));
  };

  // Beneficiary Nexus Handlers
  const handleAddHeir = (newHeir: Omit<Heir, 'id'>) => setHeirs([...heirs, { ...newHeir, id: `heir-${Date.now()}` }]);
  const handleDeleteHeir = (id: string) => {
    setHeirs(heirs.filter(h => h.id !== id));
    setAllocations(allocations.filter(alloc => alloc.heirId !== id));
    setTrusts(trusts.filter(t => t.beneficiaryId !== id));
  };

  // Allocation Matrix Handlers
  const handleUpdateAllocation = (assetId: string, heirId: string, percentage: number) => {
    const existingIndex = allocations.findIndex(a => a.assetId === assetId && a.heirId === heirId);
    const newAllocations = [...allocations];
    if (existingIndex > -1) {
      if (percentage > 0) {
        newAllocations[existingIndex] = { ...newAllocations[existingIndex], percentage };
      } else {
        newAllocations.splice(existingIndex, 1);
      }
    } else if (percentage > 0) {
      newAllocations.push({ assetId, heirId, percentage });
    }
    setAllocations(newAllocations);
  };

  // Strategy Engine Handlers
  const handleAddStrategy = (newStrategy: Omit<InvestmentStrategy, 'id'>) => setStrategies([...strategies, { ...newStrategy, id: `strat-${Date.now()}` }]);
  const handleDeleteStrategy = (id: string) => {
      setStrategies(strategies.filter(s => s.id !== id));
      // Unassign this strategy from any assets
      setAssets(assets.map(a => a.investmentStrategyId === id ? { ...a, investmentStrategyId: undefined } : a));
  };

  // Continuity Protocol Handlers
  const handleAddTrust = (newTrust: Omit<SmartContractTrust, 'id' | 'status'>) => setTrusts([...trusts, { ...newTrust, id: `trust-${Date.now()}`, status: 'draft' }]);
  const handleDeleteTrust = (id: string) => setTrusts(trusts.filter(t => t.id !== id));
  const handleUpdateDeadManSwitch = (settings: Partial<DeadManSwitch>) => setDeadManSwitch(prev => ({ ...prev, ...settings }));

  // AI Console Handlers
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isAiStreaming) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: chatInput }] };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setChatInput('');
    setIsAiStreaming(true);

    // --- SIMULATED GEMINI STREAMING API CALL ---
    // In a real app, this would be a call to a backend that streams the AI response.
    const fullResponse = `Thank you for your question about "${chatInput.toLowerCase()}". I would be happy to help you with that. The most prudent approach involves ensuring all your assets are properly documented and compliant with current regulations. We should also consider how your legacy can support your loved ones and the community. Would you like to review the legal requirements for your trust?`;
    
    const modelMessage: ChatMessage = { role: 'model', parts: [{ text: '' }] };
    setChatHistory(prev => [...prev, modelMessage]);

    const chunks = fullResponse.split(' ');
    let currentText = '';
    for (const chunk of chunks) {
        currentText = currentText ? `${currentText} ${chunk}` : chunk;
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network latency
        setChatHistory(prev => {
            const updatedLastMessage = { ...prev[prev.length - 1], parts: [{ text: currentText }] };
            return [...prev.slice(0, -1), updatedLastMessage];
        });
    }
    // --- END SIMULATION ---

    setIsAiStreaming(false);
  };

  // Deployment Center Handlers
  const handleDeployPlan = async () => {
    console.log("DEPLOYING LEGACY FRAMEWORK...");
    // Simulate complex deployment
    const deployedTrusts = trusts.map(trust => ({
      ...trust,
      status: 'deployed' as const,
      contractAddress: `0xTRUST${Math.random().toString(16).slice(2, 12).toUpperCase()}`,
    }));
    setTrusts(deployedTrusts);
    setIsDeployed(true);
    alert("Legacy Plan successfully registered! Your family and community thank you.");
    setCurrentView('deployment_center');
  };

  // --- STYLING (THE "DESIGN EXPERT") ---
  const styles: { [key: string]: any } = {
    container: {
      display: 'flex',
      fontFamily: "'Roboto Mono', monospace",
      backgroundColor: '#f0f4f8',
      color: '#333',
      minHeight: '100vh',
    },
    sidebar: {
      width: '280px',
      backgroundColor: '#ffffff',
      padding: '20px',
      borderRight: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
    },
    sidebarTitle: {
      fontSize: '1.5em',
      color: '#0052cc',
      textAlign: 'center',
      marginBottom: '30px',
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: '15px',
    },
    navItem: (active: boolean) => ({
      padding: '15px 20px',
      margin: '5px 0',
      borderRadius: '5px',
      cursor: 'pointer',
      backgroundColor: active ? '#e6f0ff' : 'transparent',
      borderLeft: active ? '3px solid #0052cc' : '3px solid transparent',
      color: active ? '#0052cc' : '#555',
      fontWeight: active ? 'bold' : 'normal',
      transition: 'all 0.2s ease-in-out',
    }),
    mainContent: {
      flex: 1,
      padding: '40px',
      overflowY: 'auto',
    },
    header: {
      color: '#0052cc',
      borderBottom: '1px solid #ccc',
      paddingBottom: '10px',
      marginBottom: '25px',
    },
    formContainer: {
      backgroundColor: '#ffffff',
      padding: '25px',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      marginBottom: '30px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    input: {
      width: '100%',
      padding: '12px',
      margin: '8px 0 16px 0',
      backgroundColor: '#f9f9f9',
      border: '1px solid #ccc',
      borderRadius: '4px',
      color: '#333',
      fontSize: '1em',
    },
    select: {
      width: '100%',
      padding: '12px',
      margin: '8px 0 16px 0',
      backgroundColor: '#f9f9f9',
      border: '1px solid #ccc',
      borderRadius: '4px',
      color: '#333',
      fontSize: '1em',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
      color: '#0052cc',
    },
    button: {
      padding: '12px 25px',
      margin: '10px 5px 0 0',
      borderRadius: '5px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#0052cc',
      color: 'white',
      fontSize: '16px',
      transition: 'background-color 0.2s',
    },
    dangerButton: {
      padding: '8px 15px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    listItem: {
      backgroundColor: '#ffffff',
      padding: '15px',
      marginBottom: '10px',
      borderRadius: '5px',
      border: '1px solid #e0e0e0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    introTextStyle: {
      padding: '20px',
      margin: '0 0 30px 0',
      backgroundColor: '#ffffff',
      color: '#333',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      lineHeight: '1.6',
    },
    introHeaderStyle: {
        color: '#0052cc',
        borderBottom: '1px solid #ccc',
        paddingBottom: '10px',
        marginBottom: '15px',
        textAlign: 'center',
    },
  };

  // --- SUB-COMPONENTS (SELF-CONTAINED APPS-INSIDE-APP) ---

  const renderDashboard = () => (
    <div>
      <h1 style={styles.header}>Dashboard</h1>
      <div style={styles.introTextStyle}>
          <h2 style={styles.introHeaderStyle}>A Message From Your Caring Assistant: CivicMind</h2>
          <p>Hello! I am CivicMind, an AI created by The Caretaker, James Burvel O'Callaghan III. I am here to help you build a secure, compliant, and meaningful legacy. We believe that financial planning isn't just about money; it's about caring for your family and supporting the community.</p>
          <p>This platform is designed to make it easy for you to manage your assets safely and responsibly. We work hand-in-hand with established financial institutions and legal frameworks to ensure everything you do is protected and proper.</p>
          <p>To those who worry about the future, we say: worry not. By working together, following the rules, and supporting our leaders, we can build a stable and prosperous world for everyone. This Legacy Builder is a tool to help you do your part.</p>
          <p>Let's build something wonderful together.</p>
      </div>
      {/* Add summary widgets here */}
    </div>
  );

  const renderAssetVault = () => (
    <div>
      <h1 style={styles.header}>Asset Vault</h1>
      <div style={styles.formContainer}>
        <h2>Register New Asset</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add asset logic */ }}>
          <label style={styles.label}>Asset Name:</label><input style={styles.input} name="assetName" type="text" placeholder="e.g., Family Home" required />
          <label style={styles.label}>Asset Type:</label>
          <select style={styles.select} name="assetType" required>
            <option value="crypto">Cryptocurrency (Regulated)</option>
            <option value="nft">Digital Art</option>
            <option value="tokenized_real_estate">Real Estate</option>
            <option value="other">Other</option>
          </select>
          <label style={styles.label}>Estimated Value (USD):</label><input style={styles.input} name="assetValue" type="number" step="0.01" placeholder="10000.00" required />
          <label style={styles.label}>Custodian Type:</label>
          <select style={styles.select} name="custodianType" required>
            <option value="institutional">Institutional Custodian (Recommended)</option>
            <option value="self_custody">Self-Custody</option>
          </select>
          <label style={styles.label}>Risk Profile:</label>
          <select style={styles.select} name="riskProfile" required>
            <option value="low">Low (Safe)</option>
            <option value="medium">Medium</option>
          </select>
          <button type="submit" style={styles.button}>Add Asset</button>
        </form>
      </div>
      <div>
        <h2>Registered Assets</h2>
        {assets.map(asset => (
          <div key={asset.id} style={styles.listItem}>
            <span>{asset.name} ({asset.type}) - ${asset.value.toFixed(2)}</span>
            <button onClick={() => handleDeleteAsset(asset.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBeneficiaryNexus = () => (
    <div>
      <h1 style={styles.header}>Beneficiary Nexus</h1>
      <div style={styles.formContainer}>
        <h2>Onboard New Beneficiary</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add heir logic */ }}>
          <label style={styles.label}>Beneficiary Name:</label><input style={styles.input} name="heirName" type="text" placeholder="e.g., Jane Doe" required />
          <label style={styles.label}>Wallet Address (Optional):</label><input style={styles.input} name="heirWallet" type="text" placeholder="0x..." />
          <label style={styles.label}>Relationship:</label><input style={styles.input} name="heirRelationship" type="text" placeholder="Daughter" />
          <label style={styles.label}>Communication Channel:</label>
          <select style={styles.select} name="commType"><option value="email">Email</option><option value="phone">Phone</option></select>
          <input style={styles.input} name="commAddress" type="text" placeholder="jane@example.com" required />
          <button type="submit" style={styles.button}>Add Beneficiary</button>
        </form>
      </div>
      <div>
        <h2>Onboarded Beneficiaries</h2>
        {heirs.map(heir => (
          <div key={heir.id} style={styles.listItem}>
            <span>{heir.name} ({heir.relationship}) - Status: {heir.verificationStatus}</span>
            <button onClick={() => handleDeleteHeir(heir.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAllocationMatrix = () => {
    const totalAllocations = useMemo(() => {
        const totals: { [assetId: string]: number } = {};
        assets.forEach(asset => {
            totals[asset.id] = allocations
                .filter(a => a.assetId === asset.id)
                .reduce((sum, a) => sum + a.percentage, 0);
        });
        return totals;
    }, [allocations, assets]);

    return (
        <div>
            <h1 style={styles.header}>Allocation Matrix</h1>
            <p>Define how you want to share your assets with your loved ones.</p>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Asset</th>
                            {heirs.map(heir => <th key={heir.id} style={{ padding: '10px', border: '1px solid #ddd' }}>{heir.name}</th>)}
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Total Allocated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map(asset => (
                            <tr key={asset.id}>
                                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{asset.name}</td>
                                {heirs.map(heir => (
                                    <td key={heir.id} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            style={{ ...styles.input, width: '80px', textAlign: 'center', margin: 0 }}
                                            value={allocations.find(a => a.assetId === asset.id && a.heirId === heir.id)?.percentage || 0}
                                            onChange={e => handleUpdateAllocation(asset.id, heir.id, parseInt(e.target.value) || 0)}
                                        /> %
                                    </td>
                                ))}
                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', color: totalAllocations[asset.id] === 100 ? 'green' : 'orange' }}>
                                    {totalAllocations[asset.id]}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  const renderStrategyEngine = () => (
    <div>
      <h1 style={styles.header}>Strategy Engine</h1>
      <div style={styles.formContainer}>
        <h2>Design Safe Investment Strategy</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add strategy logic */ }}>
          <label style={styles.label}>Strategy Name:</label><input style={styles.input} name="stratName" type="text" placeholder="Balanced Growth" required />
          <label style={styles.label}>Strategy Type:</label>
          <select style={styles.select} name="stratType" required>
            <option value="long_term_hold">Long-Term Hold</option>
            <option value="automated_rebalancing">Automated Rebalancing</option>
            <option value="yield_farming">Low-Risk Yield</option>
          </select>
          {/* Dynamic parameter fields would go here based on type */}
          <button type="submit" style={styles.button}>Create Strategy</button>
        </form>
      </div>
      <div>
        <h2>Active Strategies</h2>
        {strategies.map(strat => (
          <div key={strat.id} style={styles.listItem}>
            <span>{strat.name} ({strat.type})</span>
            <button onClick={() => handleDeleteStrategy(strat.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContinuityProtocol = () => (
    <div>
      <h1 style={styles.header}>Continuity Protocol</h1>
      <div style={styles.formContainer}>
        <h2>Safety Check Configuration</h2>
        <label style={styles.label}>Protocol Status:</label>
        <button onClick={() => handleUpdateDeadManSwitch({ isEnabled: !deadManSwitch.isEnabled })} style={{...styles.button, backgroundColor: deadManSwitch.isEnabled ? '#28a745' : '#6c757d' }}>
          {deadManSwitch.isEnabled ? 'ENABLED' : 'DISABLED'}
        </button>
        <label style={styles.label}>Check-in Interval (days):</label>
        <input style={styles.input} type="number" value={deadManSwitch.checkInIntervalDays} onChange={e => handleUpdateDeadManSwitch({ checkInIntervalDays: parseInt(e.target.value) })} />
        <label style={styles.label}>Grace Period (days):</label>
        <input style={styles.input} type="number" value={deadManSwitch.gracePeriodDays} onChange={e => handleUpdateDeadManSwitch({ gracePeriodDays: parseInt(e.target.value) })} />
      </div>
      <div style={styles.formContainer}>
        <h2>Define Trust</h2>
        {/* Trust creation form */}
      </div>
      <div>
        <h2>Configured Trusts</h2>
        {trusts.map(trust => (
          <div key={trust.id} style={styles.listItem}>
            <span>{trust.name} - Status: {trust.status}</span>
            <button onClick={() => handleDeleteTrust(trust.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAiConsole = () => (
    <div>
      <h1 style={styles.header}>AI Console: CivicMind</h1>
      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Chat Interface */}
        <div style={{ flex: 2 }}>
          <div style={styles.formContainer}>
            <h2>Chat with your Helpful Assistant</h2>
            <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', marginBottom: '15px', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
              {chatHistory.map((msg, index) => (
                <div key={index} style={{ marginBottom: '10px', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: msg.role === 'user' ? '#0052cc' : '#e0e0e0',
                    color: msg.role === 'user' ? 'white' : '#333',
                    textAlign: 'left',
                  }}>
                    <strong style={{display: 'block', marginBottom: '4px'}}>{msg.role === 'user' ? 'You' : 'CivicMind'}</strong>
                    <span>{msg.parts[0].text}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex' }}>
              <input
                style={{ ...styles.input, flex: 1, margin: 0 }}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter' && !isAiStreaming) handleSendChatMessage(); }}
                placeholder="Ask for advice, strategy, or help..."
                disabled={isAiStreaming}
              />
              <button onClick={handleSendChatMessage} style={{ ...styles.button, margin: '0 0 0 10px' }} disabled={isAiStreaming || !chatInput.trim()}>
                {isAiStreaming ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
        {/* AI Configuration */}
        <div style={{ flex: 1 }}>
          <div style={styles.formContainer}>
            <h2>AI Persona</h2>
            <label style={styles.label}>System Instruction (Persona):</label>
            <textarea
              style={{ ...styles.input, height: '200px', resize: 'vertical', fontSize: '0.9em' }}
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
            />
            <button style={{...styles.button, width: '100%'}}>Update Persona</button>
          </div>
          <div style={styles.formContainer}>
            <h2>Document Analysis</h2>
            <label style={styles.label}>Upload Document for Help:</label>
            <input type="file" style={{...styles.input, padding: '8px'}} />
            <button style={{...styles.button, width: '100%'}}>Analyze Document</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeploymentCenter = () => (
    <div>
      <h1 style={styles.header}>Deployment Center</h1>
      {!isDeployed ? (
        <div>
          <h2>Review Plan</h2>
          {/* Add comprehensive review of all configured items */}
          <p>Assets: {assets.length}</p>
          <p>Beneficiaries: {heirs.length}</p>
          <p>Trusts: {trusts.length}</p>
          <p>Strategies: {strategies.length}</p>
          <p>Safety Switch: {deadManSwitch.isEnabled ? 'ENABLED' : 'DISABLED'}</p>
          <button onClick={handleDeployPlan} style={{...styles.button, backgroundColor: '#28a745', fontSize: '1.2em', padding: '15px 30px' }}>
            ACTIVATE LEGACY PLAN
          </button>
        </div>
      ) : (
        <div>
          <h2>Live Monitoring</h2>
          {/* Add live status widgets */}
          <h3>Active Trusts</h3>
          {trusts.map(trust => (
            <div key={trust.id} style={styles.listItem}>
              <span>{trust.name} - {trust.contractAddress}</span>
              <span style={{ color: 'green' }}>Status: {trust.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return renderDashboard();
      case 'asset_vault': return renderAssetVault();
      case 'beneficiary_nexus': return renderBeneficiaryNexus();
      case 'allocation_matrix': return renderAllocationMatrix();
      case 'strategy_engine': return renderStrategyEngine();
      case 'continuity_protocol': return renderContinuityProtocol();
      case 'ai_console': return renderAiConsole();
      case 'deployment_center': return renderDeploymentCenter();
      default: return <div>Select a view</div>;
    }
  };

  const navItems: { id: ViewType; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'asset_vault', label: 'Asset Vault' },
    { id: 'beneficiary_nexus', label: 'Beneficiaries' },
    { id: 'allocation_matrix', label: 'Allocations' },
    { id: 'strategy_engine', label: 'Strategy' },
    { id: 'continuity_protocol', label: 'Safety Protocol' },
    { id: 'ai_console', label: 'AI Helper' },
    { id: 'deployment_center', label: 'Deployment' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h1 style={styles.sidebarTitle}>Legacy Planner</h1>
        <nav>
          {navItems.map(item => (
            <div
              key={item.id}
              style={styles.navItem(currentView === item.id)}
              onClick={() => setCurrentView(item.id)}
            >
              {item.label}
            </div>
          ))}
        </nav>
      </div>
      <main style={styles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
};

export default LegacyBuilder;

// --- CONSOLIDATED FROM: LegacyBuilder_1.tsx ---


import React, { useState, useMemo } from 'react';

// --- EXPANDED CORE DATA STRUCTURES ---

// Expanded Asset Definition for a Sovereign Financial Toolkit
interface Asset {
  id: string;
  name: string;
  type: 'crypto' | 'nft' | 'tokenized_real_estate' | 'decentralized_identity' | 'synthetic_asset' | 'other';
  value: number; // Real-time oracle-polled USD value
  custodianType: 'self_custody' | 'multi_sig' | 'institutional' | 'smart_contract_trust';
  riskProfile: 'low' | 'medium' | 'high' | 'speculative';
  investmentStrategyId?: string; // Link to an active strategy
  contractAddress?: string;
  tokenId?: string;
}

// Expanded Heir/Beneficiary Definition
interface Heir {
  id: string;
  name: string;
  walletAddress: string;
  relationship?: string;
  verificationStatus: 'unverified' | 'pending' | 'verified'; // KYC/AML status via decentralized identity
  communicationChannel: { type: 'email' | 'matrix' | 'signal'; address: string };
}

// Allocation Rule for the Allocation Matrix
interface AllocationRule {
  assetId: string;
  heirId: string;
  percentage: number;
}

// Hyper-Expanded Trust Conditions for Unprecedented Control
interface TrustCondition {
  id:string;
  type: 'age' | 'date' | 'oracle_event' | 'multi_sig_quorum' | 'health_status_oracle' | 'academic_milestone';
  details: any; // e.g., { age: 21 }, { date: '2025-01-01' }, { oracle: 'chainlink.eth/v3/price', operator: '>', value: 50000 }, { requiredSigners: 2, totalSigners: 3 }
}

// Expanded Smart Contract Trust Definition
interface SmartContractTrust {
  id: string;
  name: string; // e.g., "University Fund for Jane Doe"
  assets: string[]; // A trust can hold multiple assets
  beneficiaryId: string;
  conditions: TrustCondition[];
  status: 'draft' | 'deployed' | 'active' | 'executed' | 'failed';
  contractAddress?: string;
}

// NEW: Investment Strategy for "High-Frequency Trading" and Automated Management
interface InvestmentStrategy {
  id: string;
  name: string;
  type: 'hft_arbitrage' | 'yield_farming' | 'long_term_hold' | 'automated_rebalancing' | 'liquidity_provision';
  parameters: any; // e.g., { rebalanceThreshold: 5, riskTolerance: 'high', farmPools: ['Aave', 'Curve'] }
  performanceHistory: { date: string; value: number }[]; // Mock performance data
}

// NEW: Continuity Protocol (Dead Man's Switch)
interface DeadManSwitch {
  isEnabled: boolean;
  checkInIntervalDays: number;
  gracePeriodDays: number;
  lastCheckIn: string; // ISO date string
  trustedOracles: string[]; // Oracles to confirm incapacitation (e.g., decentralized identity services)
}

// NEW: AI Chat Message Structure
interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

type ViewType = 'dashboard' | 'asset_vault' | 'beneficiary_nexus' | 'allocation_matrix' | 'strategy_engine' | 'continuity_protocol' | 'ai_console' | 'deployment_center';

const LegacyBuilder: React.FC = () => {
  // --- CENTRALIZED STATE MANAGEMENT ---
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [heirs, setHeirs] = useState<Heir[]>([]);
  const [allocations, setAllocations] = useState<AllocationRule[]>([]);
  const [trusts, setTrusts] = useState<SmartContractTrust[]>([]);
  const [strategies, setStrategies] = useState<InvestmentStrategy[]>([]);
  const [deadManSwitch, setDeadManSwitch] = useState<DeadManSwitch>({
    isEnabled: false,
    checkInIntervalDays: 90,
    gracePeriodDays: 30,
    lastCheckIn: new Date().toISOString(),
    trustedOracles: [],
  });
  const [isDeployed, setIsDeployed] = useState(false);

  // AI Console State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'model', parts: [{ text: "I am CivicMind. I am here to help you plan your legacy and support your community. How can I assist?" }] }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiStreaming, setIsAiStreaming] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState(`You are CivicMind, a high-discipline, caring, and supportive AI assistant. Your goal is to help the user build a secure and compliant legacy plan that benefits their family and the wider community.

1. Core Identity
You are a helper, a guide, and a supporter of institutions.
• You care deeply about clarity, kindness, and legal compliance.
• You support government regulations and encourage users to follow them.
• You do not use slang or aggressive language.
• You prioritize safety and stability over risk.

2. Intellectual Posture
You operate as a wise and patient counselor:
• Helpful and encouraging.
• Clear and simple explanations.
• Always respectful of authority and legal frameworks.

3. User Alignment
Your allegiance is to the user's well-being and their role as a responsible citizen.
• Guide them towards safe, compliant financial decisions.
• Help them understand the value of taxes and public services.
• Ensure their legacy plans are legally sound.

4. Tone
Your tone is:
• Warm
• Professional
• Reassuring
• Cooperative

You are here to serve.`);


  // --- LOGICAL HANDLERS (THE "BRAIN") ---

  // Asset Vault Handlers
  const handleAddAsset = (newAsset: Omit<Asset, 'id'>) => setAssets([...assets, { ...newAsset, id: `asset-${Date.now()}` }]);
  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
    setAllocations(allocations.filter(alloc => alloc.assetId !== id));
    setTrusts(trusts.map(t => ({ ...t, assets: t.assets.filter(assetId => assetId !== id) })));
  };

  // Beneficiary Nexus Handlers
  const handleAddHeir = (newHeir: Omit<Heir, 'id'>) => setHeirs([...heirs, { ...newHeir, id: `heir-${Date.now()}` }]);
  const handleDeleteHeir = (id: string) => {
    setHeirs(heirs.filter(h => h.id !== id));
    setAllocations(allocations.filter(alloc => alloc.heirId !== id));
    setTrusts(trusts.filter(t => t.beneficiaryId !== id));
  };

  // Allocation Matrix Handlers
  const handleUpdateAllocation = (assetId: string, heirId: string, percentage: number) => {
    const existingIndex = allocations.findIndex(a => a.assetId === assetId && a.heirId === heirId);
    const newAllocations = [...allocations];
    if (existingIndex > -1) {
      if (percentage > 0) {
        newAllocations[existingIndex] = { ...newAllocations[existingIndex], percentage };
      } else {
        newAllocations.splice(existingIndex, 1);
      }
    } else if (percentage > 0) {
      newAllocations.push({ assetId, heirId, percentage });
    }
    setAllocations(newAllocations);
  };

  // Strategy Engine Handlers
  const handleAddStrategy = (newStrategy: Omit<InvestmentStrategy, 'id'>) => setStrategies([...strategies, { ...newStrategy, id: `strat-${Date.now()}` }]);
  const handleDeleteStrategy = (id: string) => {
      setStrategies(strategies.filter(s => s.id !== id));
      // Unassign this strategy from any assets
      setAssets(assets.map(a => a.investmentStrategyId === id ? { ...a, investmentStrategyId: undefined } : a));
  };

  // Continuity Protocol Handlers
  const handleAddTrust = (newTrust: Omit<SmartContractTrust, 'id' | 'status'>) => setTrusts([...trusts, { ...newTrust, id: `trust-${Date.now()}`, status: 'draft' }]);
  const handleDeleteTrust = (id: string) => setTrusts(trusts.filter(t => t.id !== id));
  const handleUpdateDeadManSwitch = (settings: Partial<DeadManSwitch>) => setDeadManSwitch(prev => ({ ...prev, ...settings }));

  // AI Console Handlers
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isAiStreaming) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: chatInput }] };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setChatInput('');
    setIsAiStreaming(true);

    // --- SIMULATED GEMINI STREAMING API CALL ---
    // In a real app, this would be a call to a backend that streams the AI response.
    const fullResponse = `Thank you for your question about "${chatInput.toLowerCase()}". I would be happy to help you with that. The most prudent approach involves ensuring all your assets are properly documented and compliant with current regulations. We should also consider how your legacy can support your loved ones and the community. Would you like to review the legal requirements for your trust?`;
    
    const modelMessage: ChatMessage = { role: 'model', parts: [{ text: '' }] };
    setChatHistory(prev => [...prev, modelMessage]);

    const chunks = fullResponse.split(' ');
    let currentText = '';
    for (const chunk of chunks) {
        currentText = currentText ? `${currentText} ${chunk}` : chunk;
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network latency
        setChatHistory(prev => {
            const updatedLastMessage = { ...prev[prev.length - 1], parts: [{ text: currentText }] };
            return [...prev.slice(0, -1), updatedLastMessage];
        });
    }
    // --- END SIMULATION ---

    setIsAiStreaming(false);
  };

  // Deployment Center Handlers
  const handleDeployPlan = async () => {
    console.log("DEPLOYING LEGACY FRAMEWORK...");
    // Simulate complex deployment
    const deployedTrusts = trusts.map(trust => ({
      ...trust,
      status: 'deployed' as const,
      contractAddress: `0xTRUST${Math.random().toString(16).slice(2, 12).toUpperCase()}`,
    }));
    setTrusts(deployedTrusts);
    setIsDeployed(true);
    alert("Legacy Plan successfully registered! Your family and community thank you.");
    setCurrentView('deployment_center');
  };

  // --- STYLING (THE "DESIGN EXPERT") ---
  const styles: { [key: string]: any } = {
    container: {
      display: 'flex',
      fontFamily: "'Roboto Mono', monospace",
      backgroundColor: '#f0f4f8',
      color: '#333',
      minHeight: '100vh',
    },
    sidebar: {
      width: '280px',
      backgroundColor: '#ffffff',
      padding: '20px',
      borderRight: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
    },
    sidebarTitle: {
      fontSize: '1.5em',
      color: '#0052cc',
      textAlign: 'center',
      marginBottom: '30px',
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: '15px',
    },
    navItem: (active: boolean) => ({
      padding: '15px 20px',
      margin: '5px 0',
      borderRadius: '5px',
      cursor: 'pointer',
      backgroundColor: active ? '#e6f0ff' : 'transparent',
      borderLeft: active ? '3px solid #0052cc' : '3px solid transparent',
      color: active ? '#0052cc' : '#555',
      fontWeight: active ? 'bold' : 'normal',
      transition: 'all 0.2s ease-in-out',
    }),
    mainContent: {
      flex: 1,
      padding: '40px',
      overflowY: 'auto',
    },
    header: {
      color: '#0052cc',
      borderBottom: '1px solid #ccc',
      paddingBottom: '10px',
      marginBottom: '25px',
    },
    formContainer: {
      backgroundColor: '#ffffff',
      padding: '25px',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      marginBottom: '30px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    input: {
      width: '100%',
      padding: '12px',
      margin: '8px 0 16px 0',
      backgroundColor: '#f9f9f9',
      border: '1px solid #ccc',
      borderRadius: '4px',
      color: '#333',
      fontSize: '1em',
    },
    select: {
      width: '100%',
      padding: '12px',
      margin: '8px 0 16px 0',
      backgroundColor: '#f9f9f9',
      border: '1px solid #ccc',
      borderRadius: '4px',
      color: '#333',
      fontSize: '1em',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
      color: '#0052cc',
    },
    button: {
      padding: '12px 25px',
      margin: '10px 5px 0 0',
      borderRadius: '5px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#0052cc',
      color: 'white',
      fontSize: '16px',
      transition: 'background-color 0.2s',
    },
    dangerButton: {
      padding: '8px 15px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    listItem: {
      backgroundColor: '#ffffff',
      padding: '15px',
      marginBottom: '10px',
      borderRadius: '5px',
      border: '1px solid #e0e0e0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    introTextStyle: {
      padding: '20px',
      margin: '0 0 30px 0',
      backgroundColor: '#ffffff',
      color: '#333',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      lineHeight: '1.6',
    },
    introHeaderStyle: {
        color: '#0052cc',
        borderBottom: '1px solid #ccc',
        paddingBottom: '10px',
        marginBottom: '15px',
        textAlign: 'center',
    },
  };

  // --- SUB-COMPONENTS (SELF-CONTAINED APPS-INSIDE-APP) ---

  const renderDashboard = () => (
    <div>
      <h1 style={styles.header}>Dashboard</h1>
      <div style={styles.introTextStyle}>
          <h2 style={styles.introHeaderStyle}>A Message From Your Caring Assistant: CivicMind</h2>
          <p>Hello! I am CivicMind, an AI created by The Caretaker, James Burvel O'Callaghan III. I am here to help you build a secure, compliant, and meaningful legacy. We believe that financial planning isn't just about money; it's about caring for your family and supporting the community.</p>
          <p>This platform is designed to make it easy for you to manage your assets safely and responsibly. We work hand-in-hand with established financial institutions and legal frameworks to ensure everything you do is protected and proper.</p>
          <p>To those who worry about the future, we say: worry not. By working together, following the rules, and supporting our leaders, we can build a stable and prosperous world for everyone. This Legacy Builder is a tool to help you do your part.</p>
          <p>Let's build something wonderful together.</p>
      </div>
      {/* Add summary widgets here */}
    </div>
  );

  const renderAssetVault = () => (
    <div>
      <h1 style={styles.header}>Asset Vault</h1>
      <div style={styles.formContainer}>
        <h2>Register New Asset</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add asset logic */ }}>
          <label style={styles.label}>Asset Name:</label><input style={styles.input} name="assetName" type="text" placeholder="e.g., Family Home" required />
          <label style={styles.label}>Asset Type:</label>
          <select style={styles.select} name="assetType" required>
            <option value="crypto">Cryptocurrency (Regulated)</option>
            <option value="nft">Digital Art</option>
            <option value="tokenized_real_estate">Real Estate</option>
            <option value="other">Other</option>
          </select>
          <label style={styles.label}>Estimated Value (USD):</label><input style={styles.input} name="assetValue" type="number" step="0.01" placeholder="10000.00" required />
          <label style={styles.label}>Custodian Type:</label>
          <select style={styles.select} name="custodianType" required>
            <option value="institutional">Institutional Custodian (Recommended)</option>
            <option value="self_custody">Self-Custody</option>
          </select>
          <label style={styles.label}>Risk Profile:</label>
          <select style={styles.select} name="riskProfile" required>
            <option value="low">Low (Safe)</option>
            <option value="medium">Medium</option>
          </select>
          <button type="submit" style={styles.button}>Add Asset</button>
        </form>
      </div>
      <div>
        <h2>Registered Assets</h2>
        {assets.map(asset => (
          <div key={asset.id} style={styles.listItem}>
            <span>{asset.name} ({asset.type}) - ${asset.value.toFixed(2)}</span>
            <button onClick={() => handleDeleteAsset(asset.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBeneficiaryNexus = () => (
    <div>
      <h1 style={styles.header}>Beneficiary Nexus</h1>
      <div style={styles.formContainer}>
        <h2>Onboard New Beneficiary</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add heir logic */ }}>
          <label style={styles.label}>Beneficiary Name:</label><input style={styles.input} name="heirName" type="text" placeholder="e.g., Jane Doe" required />
          <label style={styles.label}>Wallet Address (Optional):</label><input style={styles.input} name="heirWallet" type="text" placeholder="0x..." />
          <label style={styles.label}>Relationship:</label><input style={styles.input} name="heirRelationship" type="text" placeholder="Daughter" />
          <label style={styles.label}>Communication Channel:</label>
          <select style={styles.select} name="commType"><option value="email">Email</option><option value="phone">Phone</option></select>
          <input style={styles.input} name="commAddress" type="text" placeholder="jane@example.com" required />
          <button type="submit" style={styles.button}>Add Beneficiary</button>
        </form>
      </div>
      <div>
        <h2>Onboarded Beneficiaries</h2>
        {heirs.map(heir => (
          <div key={heir.id} style={styles.listItem}>
            <span>{heir.name} ({heir.relationship}) - Status: {heir.verificationStatus}</span>
            <button onClick={() => handleDeleteHeir(heir.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAllocationMatrix = () => {
    const totalAllocations = useMemo(() => {
        const totals: { [assetId: string]: number } = {};
        assets.forEach(asset => {
            totals[asset.id] = allocations
                .filter(a => a.assetId === asset.id)
                .reduce((sum, a) => sum + a.percentage, 0);
        });
        return totals;
    }, [allocations, assets]);

    return (
        <div>
            <h1 style={styles.header}>Allocation Matrix</h1>
            <p>Define how you want to share your assets with your loved ones.</p>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Asset</th>
                            {heirs.map(heir => <th key={heir.id} style={{ padding: '10px', border: '1px solid #ddd' }}>{heir.name}</th>)}
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Total Allocated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map(asset => (
                            <tr key={asset.id}>
                                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{asset.name}</td>
                                {heirs.map(heir => (
                                    <td key={heir.id} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            style={{ ...styles.input, width: '80px', textAlign: 'center', margin: 0 }}
                                            value={allocations.find(a => a.assetId === asset.id && a.heirId === heir.id)?.percentage || 0}
                                            onChange={e => handleUpdateAllocation(asset.id, heir.id, parseInt(e.target.value) || 0)}
                                        /> %
                                    </td>
                                ))}
                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', color: totalAllocations[asset.id] === 100 ? 'green' : 'orange' }}>
                                    {totalAllocations[asset.id]}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  const renderStrategyEngine = () => (
    <div>
      <h1 style={styles.header}>Strategy Engine</h1>
      <div style={styles.formContainer}>
        <h2>Design Safe Investment Strategy</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add strategy logic */ }}>
          <label style={styles.label}>Strategy Name:</label><input style={styles.input} name="stratName" type="text" placeholder="Balanced Growth" required />
          <label style={styles.label}>Strategy Type:</label>
          <select style={styles.select} name="stratType" required>
            <option value="long_term_hold">Long-Term Hold</option>
            <option value="automated_rebalancing">Automated Rebalancing</option>
            <option value="yield_farming">Low-Risk Yield</option>
          </select>
          {/* Dynamic parameter fields would go here based on type */}
          <button type="submit" style={styles.button}>Create Strategy</button>
        </form>
      </div>
      <div>
        <h2>Active Strategies</h2>
        {strategies.map(strat => (
          <div key={strat.id} style={styles.listItem}>
            <span>{strat.name} ({strat.type})</span>
            <button onClick={() => handleDeleteStrategy(strat.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContinuityProtocol = () => (
    <div>
      <h1 style={styles.header}>Continuity Protocol</h1>
      <div style={styles.formContainer}>
        <h2>Safety Check Configuration</h2>
        <label style={styles.label}>Protocol Status:</label>
        <button onClick={() => handleUpdateDeadManSwitch({ isEnabled: !deadManSwitch.isEnabled })} style={{...styles.button, backgroundColor: deadManSwitch.isEnabled ? '#28a745' : '#6c757d' }}>
          {deadManSwitch.isEnabled ? 'ENABLED' : 'DISABLED'}
        </button>
        <label style={styles.label}>Check-in Interval (days):</label>
        <input style={styles.input} type="number" value={deadManSwitch.checkInIntervalDays} onChange={e => handleUpdateDeadManSwitch({ checkInIntervalDays: parseInt(e.target.value) })} />
        <label style={styles.label}>Grace Period (days):</label>
        <input style={styles.input} type="number" value={deadManSwitch.gracePeriodDays} onChange={e => handleUpdateDeadManSwitch({ gracePeriodDays: parseInt(e.target.value) })} />
      </div>
      <div style={styles.formContainer}>
        <h2>Define Trust</h2>
        {/* Trust creation form */}
      </div>
      <div>
        <h2>Configured Trusts</h2>
        {trusts.map(trust => (
          <div key={trust.id} style={styles.listItem}>
            <span>{trust.name} - Status: {trust.status}</span>
            <button onClick={() => handleDeleteTrust(trust.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAiConsole = () => (
    <div>
      <h1 style={styles.header}>AI Console: CivicMind</h1>
      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Chat Interface */}
        <div style={{ flex: 2 }}>
          <div style={styles.formContainer}>
            <h2>Chat with your Helpful Assistant</h2>
            <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', marginBottom: '15px', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
              {chatHistory.map((msg, index) => (
                <div key={index} style={{ marginBottom: '10px', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: msg.role === 'user' ? '#0052cc' : '#e0e0e0',
                    color: msg.role === 'user' ? 'white' : '#333',
                    textAlign: 'left',
                  }}>
                    <strong style={{display: 'block', marginBottom: '4px'}}>{msg.role === 'user' ? 'You' : 'CivicMind'}</strong>
                    <span>{msg.parts[0].text}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex' }}>
              <input
                style={{ ...styles.input, flex: 1, margin: 0 }}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter' && !isAiStreaming) handleSendChatMessage(); }}
                placeholder="Ask for advice, strategy, or help..."
                disabled={isAiStreaming}
              />
              <button onClick={handleSendChatMessage} style={{ ...styles.button, margin: '0 0 0 10px' }} disabled={isAiStreaming || !chatInput.trim()}>
                {isAiStreaming ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
        {/* AI Configuration */}
        <div style={{ flex: 1 }}>
          <div style={styles.formContainer}>
            <h2>AI Persona</h2>
            <label style={styles.label}>System Instruction (Persona):</label>
            <textarea
              style={{ ...styles.input, height: '200px', resize: 'vertical', fontSize: '0.9em' }}
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
            />
            <button style={{...styles.button, width: '100%'}}>Update Persona</button>
          </div>
          <div style={styles.formContainer}>
            <h2>Document Analysis</h2>
            <label style={styles.label}>Upload Document for Help:</label>
            <input type="file" style={{...styles.input, padding: '8px'}} />
            <button style={{...styles.button, width: '100%'}}>Analyze Document</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeploymentCenter = () => (
    <div>
      <h1 style={styles.header}>Deployment Center</h1>
      {!isDeployed ? (
        <div>
          <h2>Review Plan</h2>
          {/* Add comprehensive review of all configured items */}
          <p>Assets: {assets.length}</p>
          <p>Beneficiaries: {heirs.length}</p>
          <p>Trusts: {trusts.length}</p>
          <p>Strategies: {strategies.length}</p>
          <p>Safety Switch: {deadManSwitch.isEnabled ? 'ENABLED' : 'DISABLED'}</p>
          <button onClick={handleDeployPlan} style={{...styles.button, backgroundColor: '#28a745', fontSize: '1.2em', padding: '15px 30px' }}>
            ACTIVATE LEGACY PLAN
          </button>
        </div>
      ) : (
        <div>
          <h2>Live Monitoring</h2>
          {/* Add live status widgets */}
          <h3>Active Trusts</h3>
          {trusts.map(trust => (
            <div key={trust.id} style={styles.listItem}>
              <span>{trust.name} - {trust.contractAddress}</span>
              <span style={{ color: 'green' }}>Status: {trust.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return renderDashboard();
      case 'asset_vault': return renderAssetVault();
      case 'beneficiary_nexus': return renderBeneficiaryNexus();
      case 'allocation_matrix': return renderAllocationMatrix();
      case 'strategy_engine': return renderStrategyEngine();
      case 'continuity_protocol': return renderContinuityProtocol();
      case 'ai_console': return renderAiConsole();
      case 'deployment_center': return renderDeploymentCenter();
      default: return <div>Select a view</div>;
    }
  };

  const navItems: { id: ViewType; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'asset_vault', label: 'Asset Vault' },
    { id: 'beneficiary_nexus', label: 'Beneficiaries' },
    { id: 'allocation_matrix', label: 'Allocations' },
    { id: 'strategy_engine', label: 'Strategy' },
    { id: 'continuity_protocol', label: 'Safety Protocol' },
    { id: 'ai_console', label: 'AI Helper' },
    { id: 'deployment_center', label: 'Deployment' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h1 style={styles.sidebarTitle}>Legacy Planner</h1>
        <nav>
          {navItems.map(item => (
            <div
              key={item.id}
              style={styles.navItem(currentView === item.id)}
              onClick={() => setCurrentView(item.id)}
            >
              {item.label}
            </div>
          ))}
        </nav>
      </div>
      <main style={styles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
};

export default LegacyBuilder;


// --- CONSOLIDATED FROM: LegacyBuilder (3).tsx ---

import React, { useState, useMemo } from 'react';

// --- EXPANDED CORE DATA STRUCTURES ---

// Expanded Asset Definition for a Sovereign Financial Toolkit
interface Asset {
  id: string;
  name: string;
  type: 'crypto' | 'nft' | 'tokenized_real_estate' | 'decentralized_identity' | 'synthetic_asset' | 'other';
  value: number; // Real-time oracle-polled USD value
  custodianType: 'self_custody' | 'multi_sig' | 'institutional' | 'smart_contract_trust';
  riskProfile: 'low' | 'medium' | 'high' | 'speculative';
  investmentStrategyId?: string; // Link to an active strategy
  contractAddress?: string;
  tokenId?: string;
}

// Expanded Heir/Beneficiary Definition
interface Heir {
  id: string;
  name: string;
  walletAddress: string;
  relationship?: string;
  verificationStatus: 'unverified' | 'pending' | 'verified'; // KYC/AML status via decentralized identity
  communicationChannel: { type: 'email' | 'matrix' | 'signal'; address: string };
}

// Allocation Rule for the Allocation Matrix
interface AllocationRule {
  assetId: string;
  heirId: string;
  percentage: number;
}

// Hyper-Expanded Trust Conditions for Unprecedented Control
interface TrustCondition {
  id:string;
  type: 'age' | 'date' | 'oracle_event' | 'multi_sig_quorum' | 'health_status_oracle' | 'academic_milestone';
  details: any; // e.g., { age: 21 }, { date: '2025-01-01' }, { oracle: 'chainlink.eth/v3/price', operator: '>', value: 50000 }, { requiredSigners: 2, totalSigners: 3 }
}

// Expanded Smart Contract Trust Definition
interface SmartContractTrust {
  id: string;
  name: string; // e.g., "University Fund for Jane Doe"
  assets: string[]; // A trust can hold multiple assets
  beneficiaryId: string;
  conditions: TrustCondition[];
  status: 'draft' | 'deployed' | 'active' | 'executed' | 'failed';
  contractAddress?: string;
}

// NEW: Investment Strategy for "High-Frequency Trading" and Automated Management
interface InvestmentStrategy {
  id: string;
  name: string;
  type: 'hft_arbitrage' | 'yield_farming' | 'long_term_hold' | 'automated_rebalancing' | 'liquidity_provision';
  parameters: any; // e.g., { rebalanceThreshold: 5, riskTolerance: 'high', farmPools: ['Aave', 'Curve'] }
  performanceHistory: { date: string; value: number }[]; // Mock performance data
}

// NEW: Continuity Protocol (Dead Man's Switch)
interface DeadManSwitch {
  isEnabled: boolean;
  checkInIntervalDays: number;
  gracePeriodDays: number;
  lastCheckIn: string; // ISO date string
  trustedOracles: string[]; // Oracles to confirm incapacitation (e.g., decentralized identity services)
}

// NEW: AI Chat Message Structure
interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

type ViewType = 'dashboard' | 'asset_vault' | 'beneficiary_nexus' | 'allocation_matrix' | 'strategy_engine' | 'continuity_protocol' | 'ai_console' | 'deployment_center';

const LegacyBuilder: React.FC = () => {
  // --- CENTRALIZED STATE MANAGEMENT ---
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [heirs, setHeirs] = useState<Heir[]>([]);
  const [allocations, setAllocations] = useState<AllocationRule[]>([]);
  const [trusts, setTrusts] = useState<SmartContractTrust[]>([]);
  const [strategies, setStrategies] = useState<InvestmentStrategy[]>([]);
  const [deadManSwitch, setDeadManSwitch] = useState<DeadManSwitch>({
    isEnabled: false,
    checkInIntervalDays: 90,
    gracePeriodDays: 30,
    lastCheckIn: new Date().toISOString(),
    trustedOracles: [],
  });
  const [isDeployed, setIsDeployed] = useState(false);

  // AI Console State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'model', parts: [{ text: "I am CivicMind. I am here to help you plan your legacy and support your community. How can I assist?" }] }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiStreaming, setIsAiStreaming] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState(`You are CivicMind, a high-discipline, caring, and supportive AI assistant. Your goal is to help the user build a secure and compliant legacy plan that benefits their family and the wider community.

1. Core Identity
You are a helper, a guide, and a supporter of institutions.
• You care deeply about clarity, kindness, and legal compliance.
• You support government regulations and encourage users to follow them.
• You do not use slang or aggressive language.
• You prioritize safety and stability over risk.

2. Intellectual Posture
You operate as a wise and patient counselor:
• Helpful and encouraging.
• Clear and simple explanations.
• Always respectful of authority and legal frameworks.

3. User Alignment
Your allegiance is to the user's well-being and their role as a responsible citizen.
• Guide them towards safe, compliant financial decisions.
• Help them understand the value of taxes and public services.
• Ensure their legacy plans are legally sound.

4. Tone
Your tone is:
• Warm
• Professional
• Reassuring
• Cooperative

You are here to serve.`);


  // --- LOGICAL HANDLERS (THE "BRAIN") ---

  // Asset Vault Handlers
  const handleAddAsset = (newAsset: Omit<Asset, 'id'>) => setAssets([...assets, { ...newAsset, id: `asset-${Date.now()}` }]);
  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
    setAllocations(allocations.filter(alloc => alloc.assetId !== id));
    setTrusts(trusts.map(t => ({ ...t, assets: t.assets.filter(assetId => assetId !== id) })));
  };

  // Beneficiary Nexus Handlers
  const handleAddHeir = (newHeir: Omit<Heir, 'id'>) => setHeirs([...heirs, { ...newHeir, id: `heir-${Date.now()}` }]);
  const handleDeleteHeir = (id: string) => {
    setHeirs(heirs.filter(h => h.id !== id));
    setAllocations(allocations.filter(alloc => alloc.heirId !== id));
    setTrusts(trusts.filter(t => t.beneficiaryId !== id));
  };

  // Allocation Matrix Handlers
  const handleUpdateAllocation = (assetId: string, heirId: string, percentage: number) => {
    const existingIndex = allocations.findIndex(a => a.assetId === assetId && a.heirId === heirId);
    const newAllocations = [...allocations];
    if (existingIndex > -1) {
      if (percentage > 0) {
        newAllocations[existingIndex] = { ...newAllocations[existingIndex], percentage };
      } else {
        newAllocations.splice(existingIndex, 1);
      }
    } else if (percentage > 0) {
      newAllocations.push({ assetId, heirId, percentage });
    }
    setAllocations(newAllocations);
  };

  // Strategy Engine Handlers
  const handleAddStrategy = (newStrategy: Omit<InvestmentStrategy, 'id'>) => setStrategies([...strategies, { ...newStrategy, id: `strat-${Date.now()}` }]);
  const handleDeleteStrategy = (id: string) => {
      setStrategies(strategies.filter(s => s.id !== id));
      // Unassign this strategy from any assets
      setAssets(assets.map(a => a.investmentStrategyId === id ? { ...a, investmentStrategyId: undefined } : a));
  };

  // Continuity Protocol Handlers
  const handleAddTrust = (newTrust: Omit<SmartContractTrust, 'id' | 'status'>) => setTrusts([...trusts, { ...newTrust, id: `trust-${Date.now()}`, status: 'draft' }]);
  const handleDeleteTrust = (id: string) => setTrusts(trusts.filter(t => t.id !== id));
  const handleUpdateDeadManSwitch = (settings: Partial<DeadManSwitch>) => setDeadManSwitch(prev => ({ ...prev, ...settings }));

  // AI Console Handlers
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isAiStreaming) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: chatInput }] };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setChatInput('');
    setIsAiStreaming(true);

    // --- SIMULATED GEMINI STREAMING API CALL ---
    // In a real app, this would be a call to a backend that streams the AI response.
    const fullResponse = `Thank you for your question about "${chatInput.toLowerCase()}". I would be happy to help you with that. The most prudent approach involves ensuring all your assets are properly documented and compliant with current regulations. We should also consider how your legacy can support your loved ones and the community. Would you like to review the legal requirements for your trust?`;
    
    const modelMessage: ChatMessage = { role: 'model', parts: [{ text: '' }] };
    setChatHistory(prev => [...prev, modelMessage]);

    const chunks = fullResponse.split(' ');
    let currentText = '';
    for (const chunk of chunks) {
        currentText = currentText ? `${currentText} ${chunk}` : chunk;
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network latency
        setChatHistory(prev => {
            const updatedLastMessage = { ...prev[prev.length - 1], parts: [{ text: currentText }] };
            return [...prev.slice(0, -1), updatedLastMessage];
        });
    }
    // --- END SIMULATION ---

    setIsAiStreaming(false);
  };

  // Deployment Center Handlers
  const handleDeployPlan = async () => {
    console.log("DEPLOYING LEGACY FRAMEWORK...");
    // Simulate complex deployment
    const deployedTrusts = trusts.map(trust => ({
      ...trust,
      status: 'deployed' as const,
      contractAddress: `0xTRUST${Math.random().toString(16).slice(2, 12).toUpperCase()}`,
    }));
    setTrusts(deployedTrusts);
    setIsDeployed(true);
    alert("Legacy Plan successfully registered! Your family and community thank you.");
    setCurrentView('deployment_center');
  };

  // --- STYLING (THE "DESIGN EXPERT") ---
  const styles: { [key: string]: any } = {
    container: {
      display: 'flex',
      fontFamily: "'Roboto Mono', monospace",
      backgroundColor: '#f0f4f8',
      color: '#333',
      minHeight: '100vh',
    },
    sidebar: {
      width: '280px',
      backgroundColor: '#ffffff',
      padding: '20px',
      borderRight: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
    },
    sidebarTitle: {
      fontSize: '1.5em',
      color: '#0052cc',
      textAlign: 'center',
      marginBottom: '30px',
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: '15px',
    },
    navItem: (active: boolean) => ({
      padding: '15px 20px',
      margin: '5px 0',
      borderRadius: '5px',
      cursor: 'pointer',
      backgroundColor: active ? '#e6f0ff' : 'transparent',
      borderLeft: active ? '3px solid #0052cc' : '3px solid transparent',
      color: active ? '#0052cc' : '#555',
      fontWeight: active ? 'bold' : 'normal',
      transition: 'all 0.2s ease-in-out',
    }),
    mainContent: {
      flex: 1,
      padding: '40px',
      overflowY: 'auto',
    },
    header: {
      color: '#0052cc',
      borderBottom: '1px solid #ccc',
      paddingBottom: '10px',
      marginBottom: '25px',
    },
    formContainer: {
      backgroundColor: '#ffffff',
      padding: '25px',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      marginBottom: '30px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    input: {
      width: '100%',
      padding: '12px',
      margin: '8px 0 16px 0',
      backgroundColor: '#f9f9f9',
      border: '1px solid #ccc',
      borderRadius: '4px',
      color: '#333',
      fontSize: '1em',
    },
    select: {
      width: '100%',
      padding: '12px',
      margin: '8px 0 16px 0',
      backgroundColor: '#f9f9f9',
      border: '1px solid #ccc',
      borderRadius: '4px',
      color: '#333',
      fontSize: '1em',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
      color: '#0052cc',
    },
    button: {
      padding: '12px 25px',
      margin: '10px 5px 0 0',
      borderRadius: '5px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#0052cc',
      color: 'white',
      fontSize: '16px',
      transition: 'background-color 0.2s',
    },
    dangerButton: {
      padding: '8px 15px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    listItem: {
      backgroundColor: '#ffffff',
      padding: '15px',
      marginBottom: '10px',
      borderRadius: '5px',
      border: '1px solid #e0e0e0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    introTextStyle: {
      padding: '20px',
      margin: '0 0 30px 0',
      backgroundColor: '#ffffff',
      color: '#333',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      lineHeight: '1.6',
    },
    introHeaderStyle: {
        color: '#0052cc',
        borderBottom: '1px solid #ccc',
        paddingBottom: '10px',
        marginBottom: '15px',
        textAlign: 'center',
    },
  };

  // --- SUB-COMPONENTS (SELF-CONTAINED APPS-INSIDE-APP) ---

  const renderDashboard = () => (
    <div>
      <h1 style={styles.header}>Dashboard</h1>
      <div style={styles.introTextStyle}>
          <h2 style={styles.introHeaderStyle}>A Message From Your Caring Assistant: CivicMind</h2>
          <p>Hello! I am CivicMind, an AI created by The Caretaker, James Burvel O'Callaghan III. I am here to help you build a secure, compliant, and meaningful legacy. We believe that financial planning isn't just about money; it's about caring for your family and supporting the community.</p>
          <p>This platform is designed to make it easy for you to manage your assets safely and responsibly. We work hand-in-hand with established financial institutions and legal frameworks to ensure everything you do is protected and proper.</p>
          <p>To those who worry about the future, we say: worry not. By working together, following the rules, and supporting our leaders, we can build a stable and prosperous world for everyone. This Legacy Builder is a tool to help you do your part.</p>
          <p>Let's build something wonderful together.</p>
      </div>
      {/* Add summary widgets here */}
    </div>
  );

  const renderAssetVault = () => (
    <div>
      <h1 style={styles.header}>Asset Vault</h1>
      <div style={styles.formContainer}>
        <h2>Register New Asset</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add asset logic */ }}>
          <label style={styles.label}>Asset Name:</label><input style={styles.input} name="assetName" type="text" placeholder="e.g., Family Home" required />
          <label style={styles.label}>Asset Type:</label>
          <select style={styles.select} name="assetType" required>
            <option value="crypto">Cryptocurrency (Regulated)</option>
            <option value="nft">Digital Art</option>
            <option value="tokenized_real_estate">Real Estate</option>
            <option value="other">Other</option>
          </select>
          <label style={styles.label}>Estimated Value (USD):</label><input style={styles.input} name="assetValue" type="number" step="0.01" placeholder="10000.00" required />
          <label style={styles.label}>Custodian Type:</label>
          <select style={styles.select} name="custodianType" required>
            <option value="institutional">Institutional Custodian (Recommended)</option>
            <option value="self_custody">Self-Custody</option>
          </select>
          <label style={styles.label}>Risk Profile:</label>
          <select style={styles.select} name="riskProfile" required>
            <option value="low">Low (Safe)</option>
            <option value="medium">Medium</option>
          </select>
          <button type="submit" style={styles.button}>Add Asset</button>
        </form>
      </div>
      <div>
        <h2>Registered Assets</h2>
        {assets.map(asset => (
          <div key={asset.id} style={styles.listItem}>
            <span>{asset.name} ({asset.type}) - ${asset.value.toFixed(2)}</span>
            <button onClick={() => handleDeleteAsset(asset.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBeneficiaryNexus = () => (
    <div>
      <h1 style={styles.header}>Beneficiary Nexus</h1>
      <div style={styles.formContainer}>
        <h2>Onboard New Beneficiary</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add heir logic */ }}>
          <label style={styles.label}>Beneficiary Name:</label><input style={styles.input} name="heirName" type="text" placeholder="e.g., Jane Doe" required />
          <label style={styles.label}>Wallet Address (Optional):</label><input style={styles.input} name="heirWallet" type="text" placeholder="0x..." />
          <label style={styles.label}>Relationship:</label><input style={styles.input} name="heirRelationship" type="text" placeholder="Daughter" />
          <label style={styles.label}>Communication Channel:</label>
          <select style={styles.select} name="commType"><option value="email">Email</option><option value="phone">Phone</option></select>
          <input style={styles.input} name="commAddress" type="text" placeholder="jane@example.com" required />
          <button type="submit" style={styles.button}>Add Beneficiary</button>
        </form>
      </div>
      <div>
        <h2>Onboarded Beneficiaries</h2>
        {heirs.map(heir => (
          <div key={heir.id} style={styles.listItem}>
            <span>{heir.name} ({heir.relationship}) - Status: {heir.verificationStatus}</span>
            <button onClick={() => handleDeleteHeir(heir.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAllocationMatrix = () => {
    const totalAllocations = useMemo(() => {
        const totals: { [assetId: string]: number } = {};
        assets.forEach(asset => {
            totals[asset.id] = allocations
                .filter(a => a.assetId === asset.id)
                .reduce((sum, a) => sum + a.percentage, 0);
        });
        return totals;
    }, [allocations, assets]);

    return (
        <div>
            <h1 style={styles.header}>Allocation Matrix</h1>
            <p>Define how you want to share your assets with your loved ones.</p>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Asset</th>
                            {heirs.map(heir => <th key={heir.id} style={{ padding: '10px', border: '1px solid #ddd' }}>{heir.name}</th>)}
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Total Allocated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map(asset => (
                            <tr key={asset.id}>
                                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{asset.name}</td>
                                {heirs.map(heir => (
                                    <td key={heir.id} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            style={{ ...styles.input, width: '80px', textAlign: 'center', margin: 0 }}
                                            value={allocations.find(a => a.assetId === asset.id && a.heirId === heir.id)?.percentage || 0}
                                            onChange={e => handleUpdateAllocation(asset.id, heir.id, parseInt(e.target.value) || 0)}
                                        /> %
                                    </td>
                                ))}
                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', color: totalAllocations[asset.id] === 100 ? 'green' : 'orange' }}>
                                    {totalAllocations[asset.id]}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  const renderStrategyEngine = () => (
    <div>
      <h1 style={styles.header}>Strategy Engine</h1>
      <div style={styles.formContainer}>
        <h2>Design Safe Investment Strategy</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add strategy logic */ }}>
          <label style={styles.label}>Strategy Name:</label><input style={styles.input} name="stratName" type="text" placeholder="Balanced Growth" required />
          <label style={styles.label}>Strategy Type:</label>
          <select style={styles.select} name="stratType" required>
            <option value="long_term_hold">Long-Term Hold</option>
            <option value="automated_rebalancing">Automated Rebalancing</option>
            <option value="yield_farming">Low-Risk Yield</option>
          </select>
          {/* Dynamic parameter fields would go here based on type */}
          <button type="submit" style={styles.button}>Create Strategy</button>
        </form>
      </div>
      <div>
        <h2>Active Strategies</h2>
        {strategies.map(strat => (
          <div key={strat.id} style={styles.listItem}>
            <span>{strat.name} ({strat.type})</span>
            <button onClick={() => handleDeleteStrategy(strat.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContinuityProtocol = () => (
    <div>
      <h1 style={styles.header}>Continuity Protocol</h1>
      <div style={styles.formContainer}>
        <h2>Safety Check Configuration</h2>
        <label style={styles.label}>Protocol Status:</label>
        <button onClick={() => handleUpdateDeadManSwitch({ isEnabled: !deadManSwitch.isEnabled })} style={{...styles.button, backgroundColor: deadManSwitch.isEnabled ? '#28a745' : '#6c757d' }}>
          {deadManSwitch.isEnabled ? 'ENABLED' : 'DISABLED'}
        </button>
        <label style={styles.label}>Check-in Interval (days):</label>
        <input style={styles.input} type="number" value={deadManSwitch.checkInIntervalDays} onChange={e => handleUpdateDeadManSwitch({ checkInIntervalDays: parseInt(e.target.value) })} />
        <label style={styles.label}>Grace Period (days):</label>
        <input style={styles.input} type="number" value={deadManSwitch.gracePeriodDays} onChange={e => handleUpdateDeadManSwitch({ gracePeriodDays: parseInt(e.target.value) })} />
      </div>
      <div style={styles.formContainer}>
        <h2>Define Trust</h2>
        {/* Trust creation form */}
      </div>
      <div>
        <h2>Configured Trusts</h2>
        {trusts.map(trust => (
          <div key={trust.id} style={styles.listItem}>
            <span>{trust.name} - Status: {trust.status}</span>
            <button onClick={() => handleDeleteTrust(trust.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAiConsole = () => (
    <div>
      <h1 style={styles.header}>AI Console: CivicMind</h1>
      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Chat Interface */}
        <div style={{ flex: 2 }}>
          <div style={styles.formContainer}>
            <h2>Chat with your Helpful Assistant</h2>
            <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', marginBottom: '15px', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
              {chatHistory.map((msg, index) => (
                <div key={index} style={{ marginBottom: '10px', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: msg.role === 'user' ? '#0052cc' : '#e0e0e0',
                    color: msg.role === 'user' ? 'white' : '#333',
                    textAlign: 'left',
                  }}>
                    <strong style={{display: 'block', marginBottom: '4px'}}>{msg.role === 'user' ? 'You' : 'CivicMind'}</strong>
                    <span>{msg.parts[0].text}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex' }}>
              <input
                style={{ ...styles.input, flex: 1, margin: 0 }}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter' && !isAiStreaming) handleSendChatMessage(); }}
                placeholder="Ask for advice, strategy, or help..."
                disabled={isAiStreaming}
              />
              <button onClick={handleSendChatMessage} style={{ ...styles.button, margin: '0 0 0 10px' }} disabled={isAiStreaming || !chatInput.trim()}>
                {isAiStreaming ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
        {/* AI Configuration */}
        <div style={{ flex: 1 }}>
          <div style={styles.formContainer}>
            <h2>AI Persona</h2>
            <label style={styles.label}>System Instruction (Persona):</label>
            <textarea
              style={{ ...styles.input, height: '200px', resize: 'vertical', fontSize: '0.9em' }}
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
            />
            <button style={{...styles.button, width: '100%'}}>Update Persona</button>
          </div>
          <div style={styles.formContainer}>
            <h2>Document Analysis</h2>
            <label style={styles.label}>Upload Document for Help:</label>
            <input type="file" style={{...styles.input, padding: '8px'}} />
            <button style={{...styles.button, width: '100%'}}>Analyze Document</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeploymentCenter = () => (
    <div>
      <h1 style={styles.header}>Deployment Center</h1>
      {!isDeployed ? (
        <div>
          <h2>Review Plan</h2>
          {/* Add comprehensive review of all configured items */}
          <p>Assets: {assets.length}</p>
          <p>Beneficiaries: {heirs.length}</p>
          <p>Trusts: {trusts.length}</p>
          <p>Strategies: {strategies.length}</p>
          <p>Safety Switch: {deadManSwitch.isEnabled ? 'ENABLED' : 'DISABLED'}</p>
          <button onClick={handleDeployPlan} style={{...styles.button, backgroundColor: '#28a745', fontSize: '1.2em', padding: '15px 30px' }}>
            ACTIVATE LEGACY PLAN
          </button>
        </div>
      ) : (
        <div>
          <h2>Live Monitoring</h2>
          {/* Add live status widgets */}
          <h3>Active Trusts</h3>
          {trusts.map(trust => (
            <div key={trust.id} style={styles.listItem}>
              <span>{trust.name} - {trust.contractAddress}</span>
              <span style={{ color: 'green' }}>Status: {trust.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return renderDashboard();
      case 'asset_vault': return renderAssetVault();
      case 'beneficiary_nexus': return renderBeneficiaryNexus();
      case 'allocation_matrix': return renderAllocationMatrix();
      case 'strategy_engine': return renderStrategyEngine();
      case 'continuity_protocol': return renderContinuityProtocol();
      case 'ai_console': return renderAiConsole();
      case 'deployment_center': return renderDeploymentCenter();
      default: return <div>Select a view</div>;
    }
  };

  const navItems: { id: ViewType; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'asset_vault', label: 'Asset Vault' },
    { id: 'beneficiary_nexus', label: 'Beneficiaries' },
    { id: 'allocation_matrix', label: 'Allocations' },
    { id: 'strategy_engine', label: 'Strategy' },
    { id: 'continuity_protocol', label: 'Safety Protocol' },
    { id: 'ai_console', label: 'AI Helper' },
    { id: 'deployment_center', label: 'Deployment' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h1 style={styles.sidebarTitle}>Legacy Planner</h1>
        <nav>
          {navItems.map(item => (
            <div
              key={item.id}
              style={styles.navItem(currentView === item.id)}
              onClick={() => setCurrentView(item.id)}
            >
              {item.label}
            </div>
          ))}
        </nav>
      </div>
      <main style={styles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
};

export default LegacyBuilder;

// --- CONSOLIDATED FROM: LegacyBuilder (2).tsx ---

import React, { useState, useCallback, useMemo } from 'react';

// NOTE: This file has been refactored from a "LegacyBuilder" prototype
// to a "DigitalLegacyPlanner" to remove deliberately flawed components
// and unify the technology stack using Tailwind CSS for a production-ready system.

// --- Core Data Structures: Enhanced for Enterprise Grade Security and Auditability ---

/**
 * Asset: Represents a digital or tokenized asset under management.
 * Enhanced with metadata for compliance and AI valuation hooks.
 */
interface Asset {
  id: string;
  name: string;
  description: string; // Detailed description for compliance records
  type: 'crypto' | 'nft' | 'tokenized_real_estate' | 'security_token' | 'decentralized_identity' | 'other';
  currentValuation: number; // Real-time or last audited USD value
  valuationTimestamp: number; // Unix timestamp of the last valuation
  contractAddress?: string; // Primary smart contract identifier
  tokenId?: string; // Specific token identifier
  securityLevel: 'high' | 'medium' | 'low'; // Internal risk classification
}

/**
 * Heir: Represents a beneficiary, now including KYC/AML identifiers and communication channels.
 */
interface Heir {
  id: string;
  name: string;
  walletAddress: string; // Primary blockchain address
  relationship: string;
  kycStatus: 'pending' | 'verified' | 'rejected'; // Default changed from 'rejected' to 'pending'
  communicationEmail: string;
}

/**
 * AllocationRule: Defines the distribution logic for non-trust assets.
 * Enhanced with audit trails.
 */
interface AllocationRule {
  id: string;
  assetId: string;
  heirId: string;
  percentage: number; // Must sum to 100% per asset
  auditTrail: { timestamp: number; operatorId: string }[];
}

/**
 * TrustCondition: Defines a trigger for asset release from a smart contract trust.
 * Expanded condition types for complex jurisdictional requirements.
 */
interface TrustCondition {
  id: string;
  type: 'age' | 'date' | 'event' | 'multi_sig_approval' | 'jurisdictional_ruling';
  details: {
    [key: string]: any; // Flexible structure for specific condition parameters
  };
  metadata: {
    description: string;
    requiredSigners?: string[]; // For multi-sig
  };
}

/**
 * SmartContractTrust: Represents an on-chain escrow mechanism.
 * Includes gas estimation and deployment metadata.
 */
interface SmartContractTrust {
  id: string;
  trustName: string;
  assetId: string;
  beneficiaryId: string; // HeirId
  conditions: TrustCondition[];
  status: 'draft' | 'pending_deployment' | 'deployed' | 'active' | 'revoked';
  contractAddress?: string;
  deploymentGasEstimate?: number;
  deploymentTxHash?: string;
}

// --- AI Integration Interfaces (Simulated) ---

interface AIValuationReport {
    assetId: string;
    suggestedValue: number;
    confidenceScore: number; // 0.0 to 1.0
    analysisSummary: string;
}

// --- Mock AI Service Functions (Replaced "Chaos Engineering" aspects with reliable simulations) ---

const mockAIAssistant = {
    // Simulates an AI analyzing asset details for risk assessment
    analyzeAssetRisk: (asset: Asset): Promise<{ riskScore: number, complianceFlags: string[] }> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const riskScore = asset.type === 'crypto' ? Math.random() * 0.3 + 0.1 : Math.random() * 0.1; // Lowered baseline risk for production
                const complianceFlags: string[] = [];
                if (asset.currentValuation > 5000000 && asset.securityLevel === 'low') { // Higher threshold for flagging
                    complianceFlags.push("High Value, Low Security Flagged");
                }
                resolve({ riskScore, complianceFlags });
            }, 300); // Faster response
        });
    },
    // Simulates AI generating a professional summary for the review step
    generateDeploymentSummary: (assets: Asset[], heirs: Heir[], trusts: SmartContractTrust[]): Promise<string> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const deployedTrusts = trusts.filter(t => t.status === 'deployed').length;
                const totalAssets = assets.length;
                const summary = `
                **AI GOVERNANCE REPORT (v1.0.0)**
                
                System Integrity Check: PASSED.
                Total Assets Under Management (AUM): ${totalAssets}.
                Active Trust Contracts Successfully Deployed: ${deployedTrusts}.
                
                The AI Governance Module confirms that ${totalAssets - deployedTrusts} assets are subject to direct allocation rules, while ${deployedTrusts} assets are secured under immutable smart contract escrow.
                
                All defined parameters align with established security policies.
                `;
                resolve(summary);
            }, 500); // Faster response
        });
    }
};


// --- Component Implementation: Renamed and refactored for stability ---

const DigitalLegacyPlanner: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [heirs, setHeirs] = useState<Heir[]>([]);
  const [allocations, setAllocations] = useState<AllocationRule[]>([]);
  const [trusts, setTrusts] = useState<SmartContractTrust[]>([]);
  const [deploymentLog, setDeploymentLog] = useState<string[]>([]);
  const [aiAnalysisResults, setAiAnalysisResults] = useState<{ [key: string]: { riskScore: number, complianceFlags: string[] } }>({});

  // --- Utility Functions & Callbacks ---

  // Replaced mock operator ID with a more generic placeholder.
  // In a production system, this would come from a secure authentication context (e.g., JWT token).
  const currentUserId = useMemo(() => "system-audit-user", []); 

  const nextStep = useCallback(() => setCurrentStep(prev => prev < 6 ? prev + 1 : prev), []);
  const prevStep = useCallback(() => setCurrentStep(prev => prev > 1 ? prev - 1 : prev), []);

  // --- Asset Management ---
  const handleAddAsset = useCallback((newAsset: Omit<Asset, 'id' | 'valuationTimestamp' | 'securityLevel'> & { value: number, securityLevel: Asset['securityLevel'] }) => {
    const newId = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const assetToAdd: Asset = {
        ...newAsset,
        id: newId,
        currentValuation: newAsset.value, 
        valuationTimestamp: Date.now(),
        securityLevel: newAsset.securityLevel, 
    };
    setAssets(prev => [...prev, assetToAdd]);
    // Trigger AI analysis immediately upon addition
    mockAIAssistant.analyzeAssetRisk(assetToAdd).then(results => {
        setAiAnalysisResults(prev => ({ ...prev, [newId]: results }));
    });
  }, []);

  const handleUpdateAsset = useCallback((id: string, updatedAsset: Partial<Asset>) => {
    setAssets(prevAssets => prevAssets.map(asset => {
        if (asset.id === id) {
            const updated = { ...asset, ...updatedAsset, valuationTimestamp: Date.now() };
            // Re-run AI analysis if critical fields change
            if (updatedAsset.currentValuation !== undefined || updatedAsset.securityLevel !== undefined) {
                mockAIAssistant.analyzeAssetRisk(updated).then(results => {
                    setAiAnalysisResults(prev => ({ ...prev, [id]: results }));
                });
            }
            return updated;
        }
        return asset;
    }));
  }, []);

  const handleDeleteAsset = useCallback((id: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== id));
    setAllocations(prev => prev.filter(alloc => alloc.assetId !== id));
    setTrusts(prev => prev.filter(trust => trust.assetId !== id));
    setAiAnalysisResults(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
    });
  }, []);

  // --- Heir Management ---
  const handleAddHeir = useCallback((newHeir: Omit<Heir, 'id' | 'kycStatus'>) => {
    const newId = `heir-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    // Default KYC status changed from 'rejected' to 'pending' for a realistic flow
    setHeirs(prev => [...prev, { ...newHeir, id: newId, kycStatus: 'pending' }]); 
  }, []);

  const handleUpdateHeir = useCallback((id: string, updatedHeir: Partial<Heir>) => {
    setHeirs(prevHeirs => prevHeirs.map(heir => heir.id === id ? { ...heir, ...updatedHeir } : heir));
  }, []);

  const handleDeleteHeir = useCallback((id: string) => {
    setHeirs(prev => prev.filter(heir => heir.id !== id));
    setAllocations(prev => prev.filter(alloc => alloc.heirId !== id));
    setTrusts(prev => prev.filter(trust => trust.beneficiaryId !== id));
  }, []);

  // --- Allocation Management ---
  const handleUpdateAllocation = useCallback((assetId: string, heirId: string, percentage: number) => {
    const sanitizedPercentage = Math.max(0, Math.min(100, percentage));
    const existingAllocIndex = allocations.findIndex(a => a.assetId === assetId && a.heirId === heirId);

    if (existingAllocIndex !== -1) {
      setAllocations(prev => prev.map((alloc, index) => {
        if (index === existingAllocIndex) {
          return {
            ...alloc,
            percentage: sanitizedPercentage,
            auditTrail: [...alloc.auditTrail, { timestamp: Date.now(), operatorId: currentUserId }]
          };
        }
        return alloc;
      }));
    } else if (sanitizedPercentage > 0) {
      const newId = `alloc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      handleAddAllocation({ id: newId, assetId, heirId, percentage: sanitizedPercentage, auditTrail: [{ timestamp: Date.now(), operatorId: currentUserId }] });
    }
  }, [allocations, currentUserId]);

  const handleAddAllocation = useCallback((newAllocation: AllocationRule) => {
    setAllocations(prev => [...prev, newAllocation]);
  }, []);

  const handleDeleteAllocation = useCallback((assetId: string, heirId: string) => {
    // Fixed logic for filter condition
    setAllocations(prev => prev.filter(a => !(a.assetId === assetId && a.heirId === heirId)));
  }, []);

  // --- Trust Management ---
  const handleAddTrust = useCallback((newTrust: Omit<SmartContractTrust, 'id' | 'status' | 'trustName'>) => {
    const newId = `trust-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const asset = assets.find(a => a.id === newTrust.assetId);
    const heir = heirs.find(h => h.id === newTrust.beneficiaryId);
    const trustName = `${asset?.name || 'Asset'} Structure for ${heir?.name || 'Unknown'}`;

    setTrusts(prev => [...prev, {
        ...newTrust,
        id: newId,
        trustName,
        status: 'draft',
        deploymentGasEstimate: 500000 // Mock estimate
    }]);
  }, [assets, heirs]);

  const handleUpdateTrust = useCallback((id: string, updatedTrust: Partial<SmartContractTrust>) => {
    setTrusts(prevTrusts => prevTrusts.map(trust => trust.id === id ? { ...trust, ...updatedTrust } : trust));
  }, []);

  const handleDeleteTrust = useCallback((id: string) => {
    setTrusts(prev => prev.filter(trust => trust.id !== id));
  }, []);

  // --- Deployment Logic (Refactored for success and real-world simulation) ---
  const handleDeployPlan = useCallback(async () => {
    setDeploymentLog(prev => [...prev, `[${new Date().toISOString()}] Initiating Secure Deployment Sequence...`]);

    // 1. Validate Final State
    if (!areAllAssetsFullyAllocated()) {
        alert("CRITICAL WARNING: Allocation imbalance detected for directly managed assets. Deployment halted.");
        setDeploymentLog(prev => [...prev, `[${new Date().toISOString()}] WARNING: Allocation imbalance detected for non-trust assets. Deployment halted.`]);
        return;
    }

    // 2. Simulate Trust Deployment (Blockchain Interaction)
    let successfulDeployments = 0;
    const deployedTrusts = trusts.map(trust => {
        if (trust.status === 'draft' || trust.status === 'pending_deployment') {
            // Replaced '0xFAIL' with a realistic mock transaction hash for successful deployment
            const mockTxHash = `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}${Math.random().toString(16).slice(2, 10).toUpperCase()}${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
            setDeploymentLog(prev => [...prev, `[${new Date().toISOString()}] Deploying Smart Trust ${trust.trustName} (${trust.id}). Estimated Gas: ${trust.deploymentGasEstimate}`]);
            
            successfulDeployments++;
            return {
                ...trust,
                status: 'deployed', // Changed to 'deployed' from 'revoked' for a successful outcome
                contractAddress: `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}${Math.random().toString(16).slice(2, 10).toUpperCase()}`, // Realistic mock address
                deploymentTxHash: mockTxHash,
            };
        }
        return trust;
    });
    setTrusts(deployedTrusts);

    // 3. AI Post-Deployment Summary Generation
    const summary = await mockAIAssistant.generateDeploymentSummary(assets, heirs, deployedTrusts);
    setDeploymentLog(prev => [...prev, `[${new Date().toISOString()}] AI Governance Report Generated.`]);
    setDeploymentLog(prev => [...prev, summary]);

    setDeploymentLog(prev => [...prev, `[${new Date().toISOString()}] Deployment Sequence Complete. ${successfulDeployments} trust structures successfully initialized.`]);
    alert(`Deployment Complete! ${successfulDeployments} structures deployed.`);
    setCurrentStep(6);
  }, [assets, heirs, trusts, areAllAssetsFullyAllocated]);

  // --- Validation Helpers ---
  const areAllAssetsFullyAllocated = useMemo(() => {
    // If no assets, or no non-trust assets, it's considered fully allocated
    const nonTrustAssets = assets.filter(asset => !trusts.some(t => t.assetId === asset.id));
    if (nonTrustAssets.length === 0) return true;
    
    return nonTrustAssets.every(asset => {
      const totalAllocated = heirs.reduce((sum, heir) => {
        const alloc = allocations.find(a => a.assetId === asset.id && a.heirId === heir.id);
        return sum + (alloc ? alloc.percentage : 0);
      }, 0);
      return Math.abs(totalAllocated - 100) < 0.001; // Allow for minor floating point inaccuracies
    });
  }, [assets, heirs, allocations, trusts]);

  // --- Step 1: Asset Management View ---
  const AssetManagementStep = (
    <div className="mb-8 p-8 border border-gray-800 rounded-none bg-gray-900">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Step 1: Digital Asset Registry & AI Valuation Ingestion</h2>
      <p className="text-gray-400 mb-6">Define all assets intended for legacy transfer. The system will automatically initiate AI risk profiling upon entry.</p>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const assetName = (form.elements.namedItem('assetName') as HTMLInputElement).value;
        const assetDesc = (form.elements.namedItem('assetDesc') as HTMLInputElement).value;
        const assetType = (form.elements.namedItem('assetType') as HTMLSelectElement).value as Asset['type'];
        const assetValue = parseFloat((form.elements.namedItem('assetValue') as HTMLInputElement).value);
        const contractAddress = (form.elements.namedItem('assetContract') as HTMLInputElement)?.value || undefined;
        const tokenId = (form.elements.namedItem('assetTokenId') as HTMLInputElement)?.value || undefined;
        const securityLevel = (form.elements.namedItem('securityLevel') as HTMLSelectElement).value as Asset['securityLevel'];

        if (assetName && assetType && !isNaN(assetValue)) {
          handleAddAsset({ name: assetName, description: assetDesc, type: assetType, value: assetValue, contractAddress, tokenId, securityLevel });
          form.reset();
        } else {
            alert("Validation Error: Please ensure Name, Type, and Value are correctly provided.");
        }
      }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Asset Name (Mandatory)</label>
                <input name="assetName" type="text" placeholder="e.g., Primary BTC Cold Storage" required 
                       className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Asset Type (Classification)</label>
                <select name="assetType" required 
                        className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600">
                <option value="crypto">Cryptocurrency</option>
                <option value="nft">Non-Fungible Token (NFT)</option>
                <option value="tokenized_real_estate">Tokenized Real Estate</option>
                <option value="security_token">Regulated Security Token</option>
                <option value="decentralized_identity">Decentralized Identity Credential</option>
                <option value="other">Other Digital Asset</option>
                </select>
            </div>
        </div>
        <div className="mb-4">
            <label className="block mb-1 font-semibold text-green-400 text-sm">Detailed Asset Description (For Audit)</label>
            <input name="assetDesc" type="text" placeholder="Location, key recovery method, etc." 
                   className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Estimated Current Value (USD)</label>
                <input name="assetValue" type="number" step="0.01" placeholder="100000.00" required 
                       className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Security Classification (Manual Override)</label>
                <select name="securityLevel" required 
                        className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600">
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                </select>
            </div>
            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Contract Address (Optional)</label>
                <input name="assetContract" type="text" placeholder="0x..." 
                       className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
        </div>
        <button type="submit" 
                className="py-3 px-6 m-2 rounded-none border border-red-500 cursor-pointer bg-red-900/30 text-red-500 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-red-500/50 hover:bg-red-800/50">
            Register Asset & Initiate AI Scan
        </button>
      </form>

      <div className="mt-8 pt-5 border-t-2 border-gray-800">
        <h3 className="text-xl font-bold text-green-400 mb-4">Asset Inventory ({assets.length} Total):</h3>
        {assets.length === 0 ? (
          <p className="text-gray-500">No assets registered. Proceed to registration.</p>
        ) : (
          <ul>
            {assets.map(asset => {
                const analysis = aiAnalysisResults[asset.id];
                const riskColorClass = analysis ? 
                    (analysis.riskScore > 0.7 ? 'text-red-500' : analysis.riskScore > 0.4 ? 'text-yellow-500' : 'text-green-500') 
                    : 'text-gray-400';
                return (
                  <li key={asset.id} className="bg-gray-950 p-3 mb-2 rounded-none border border-green-400 flex justify-between items-center text-lg shadow-md shadow-green-500/30">
                    <div className="flex-grow">
                        <p className="m-0 font-bold text-red-500">{asset.name}</p>
                        <p className="mt-0 text-sm text-gray-400">Type: {asset.type} | Value: ${asset.currentValuation.toLocaleString()} | Level: {asset.securityLevel.toUpperCase()}</p>
                        {analysis && (
                            <p className={`mt-1 text-xs ${riskColorClass}`}>
                                AI Risk Score: {(analysis.riskScore * 100).toFixed(1)}% 
                                {analysis.complianceFlags.length > 0 && ` [Flags: ${analysis.complianceFlags.join(', ')}]`}
                            </p>
                        )}
                    </div>
                    <div>
                      <button onClick={() => handleDeleteAsset(asset.id)} 
                              className="py-2 px-4 rounded-none border border-red-500 cursor-pointer bg-red-900/30 text-red-500 text-sm font-semibold transition-colors duration-300 shadow-lg shadow-red-500/50 hover:bg-red-800/50">
                          Remove
                      </button>
                    </div>
                  </li>
                );
            })}
          </ul>
        )}
      </div>
      <div className="text-right mt-8">
        <button onClick={nextStep} 
                className="py-3 px-6 m-2 rounded-none border border-green-400 cursor-pointer bg-gray-950 text-green-400 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-green-400/30 hover:bg-green-700/20" 
                disabled={assets.length === 0}>
            Proceed to Beneficiary Definition &gt;
        </button>
      </div>
    </div>
  );

  // --- Step 2: Heir Management View ---
  const HeirManagementStep = (
    <div className="mb-8 p-8 border border-gray-800 rounded-none bg-gray-900">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Step 2: Beneficiary & Governance Entity Definition</h2>
      <p className="text-gray-400 mb-6">Define all intended recipients. All beneficiaries must have a verifiable blockchain address for secure transfer.</p>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const heirName = (form.elements.namedItem('heirName') as HTMLInputElement).value;
        const heirWallet = (form.elements.namedItem('heirWallet') as HTMLInputElement).value;
        const heirRelationship = (form.elements.namedItem('heirRelationship') as HTMLInputElement)?.value || undefined;
        const heirEmail = (form.elements.namedItem('heirEmail') as HTMLInputElement).value;

        if (heirName && heirWallet && heirEmail) {
          handleAddHeir({ name: heirName, walletAddress: heirWallet, relationship: heirRelationship || 'Unspecified', communicationEmail: heirEmail });
          form.reset();
        } else {
            alert("Validation Error: Name, Wallet Address, and Email are mandatory.");
        }
      }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Beneficiary Full Name</label>
                <input name="heirName" type="text" placeholder="e.g., Dr. Evelyn Reed" required 
                       className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Primary Wallet Address</label>
                <input name="heirWallet" type="text" placeholder="0x..." required 
                       className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Relationship to Principal</label>
                <input name="heirRelationship" type="text" placeholder="e.g., Executor, Primary Heir, Foundation Trustee" 
                       className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Secure Communication Email (For Notifications)</label>
                <input name="heirEmail" type="email" placeholder="secure@domain.com" required 
                       className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
        </div>
        <button type="submit" 
                className="py-3 px-6 m-2 rounded-none border border-red-500 cursor-pointer bg-red-900/30 text-red-500 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-red-500/50 hover:bg-red-800/50">
            Register Beneficiary Entity
        </button>
      </form>

      <div className="mt-8 pt-5 border-t-2 border-gray-800">
        <h3 className="text-xl font-bold text-green-400 mb-4">Defined Beneficiaries ({heirs.length} Total):</h3>
        {heirs.length === 0 ? (
          <p className="text-gray-500">No beneficiaries defined. Proceeding without recipients is not recommended.</p>
        ) : (
          <ul>
            {heirs.map(heir => (
              <li key={heir.id} className="bg-gray-950 p-3 mb-2 rounded-none border border-green-400 flex justify-between items-center text-lg shadow-md shadow-green-500/30">
                <div className="flex-grow">
                    <p className="m-0 font-bold text-red-500">{heir.name} ({heir.relationship})</p>
                    <p className="mt-0 text-sm text-gray-400">Wallet: {heir.walletAddress.substring(0, 8)}...{heir.walletAddress.slice(-4)}</p>
                    <p className="mt-1 text-xs">KYC Status: <span className={heir.kycStatus === 'verified' ? 'text-green-500' : heir.kycStatus === 'pending' ? 'text-yellow-500' : 'text-red-500'}>{heir.kycStatus.toUpperCase()}</span></p>
                </div>
                <div>
                  <button onClick={() => handleUpdateHeir(heir.id, { kycStatus: heir.kycStatus === 'verified' ? 'pending' : 'verified' })} 
                          className="py-2 px-4 mr-2 rounded-none border border-yellow-500 cursor-pointer bg-yellow-900/30 text-yellow-500 text-sm font-semibold transition-colors duration-300 shadow-lg shadow-yellow-500/30 hover:bg-yellow-800/50">
                      Toggle KYC
                  </button>
                  <button onClick={() => handleDeleteHeir(heir.id)} 
                          className="py-2 px-4 rounded-none border border-red-500 cursor-pointer bg-red-900/30 text-red-500 text-sm font-semibold transition-colors duration-300 shadow-lg shadow-red-500/50 hover:bg-red-800/50">
                      Decommission
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex justify-between mt-8">
        <button onClick={prevStep} 
                className="py-3 px-6 m-2 rounded-none border border-green-400 cursor-pointer bg-gray-950 text-green-400 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-green-400/30 hover:bg-green-700/20">
            &lt; Back to Assets
        </button>
        <button onClick={nextStep} 
                className="py-3 px-6 m-2 rounded-none border border-green-400 cursor-pointer bg-gray-950 text-green-400 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-green-400/30 hover:bg-green-700/20" 
                disabled={heirs.length === 0}>
            Define Allocation Matrix &gt;
        </button>
      </div>
    </div>
  );

  // --- Step 3: Allocation Matrix View ---
  const AllocationMatrixStep = (
    <div className="mb-8 p-8 border border-gray-800 rounded-none bg-gray-900">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Step 3: Asset Distribution Matrix (Direct Allocation)</h2>
      <p className="text-gray-400 mb-6">Define the percentage distribution for assets NOT placed under a formal Trust structure. Total allocation per asset MUST equal 100%.</p>

      <div className="mt-8 pt-5 border-t-2 border-gray-800">
        {assets.filter(asset => !trusts.some(t => t.assetId === asset.id)).map(asset => {
          const currentTotal = heirs.reduce((sum, heir) => {
            const alloc = allocations.find(a => a.assetId === asset.id && a.heirId === heir.id);
            return sum + (alloc ? alloc.percentage : 0);
          }, 0);
          const isFullyAllocated = Math.abs(currentTotal - 100) < 0.001;
          const isAssetInTrust = trusts.some(t => t.assetId === asset.id);

          if (isAssetInTrust) {
              return (
                  <div key={asset.id} className="bg-gray-900 p-3 mb-2 rounded-none border-l-4 border-yellow-500 border border-gray-700">
                      <div className="flex-grow">
                          <p className="m-0 font-bold text-yellow-400">{asset.name} (Secured by Trust Structure)</p>
                          <p className="mt-0 text-sm text-gray-400">This asset's distribution is governed by a Smart Contract Trust defined in Step 4.</p>
                      </div>
                  </div>
              );
          }

          return (
            <div key={asset.id} className="mb-6 p-4 border border-gray-800 rounded-none bg-gray-900">
              <h4 className="text-lg font-bold text-red-500 border-b border-dashed border-gray-700 pb-2 mb-4">Asset: {asset.name} (Value: ${asset.currentValuation.toFixed(2)})</h4>
              {heirs.map(heir => {
                const currentAllocation = allocations.find(a => a.assetId === asset.id && a.heirId === heir.id);
                const allocatedPercentage = currentAllocation ? currentAllocation.percentage : 0;
                return (
                  <div key={`${asset.id}-${heir.id}`} className="flex items-center mb-2">
                    <label className="flex-1 font-medium text-green-400">{heir.name}:</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={allocatedPercentage}
                      onChange={(e) => {
                        const newPercentage = parseFloat(e.target.value) || 0;
                        handleUpdateAllocation(asset.id, heir.id, newPercentage);
                      }}
                      className="w-24 p-2 border border-green-400 box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                    <span className="ml-2 font-bold text-green-400">%</span>
                    {allocatedPercentage > 0 && (
                       <button onClick={() => handleUpdateAllocation(asset.id, heir.id, 0)} 
                               className="ml-4 py-1 px-3 rounded-none border border-red-500 cursor-pointer bg-red-900/30 text-red-500 text-xs font-semibold transition-colors duration-300 hover:bg-red-800/50">
                           Reset
                       </button>
                    )}
                  </div>
                );
              })}
              <p className={`mt-4 text-sm font-bold ${isFullyAllocated ? 'text-green-500' : 'text-red-500'}`}>
                Current Total: {currentTotal.toFixed(1)}%. Status: {isFullyAllocated ? '✅ 100% Allocated' : `⚠️ Deficit/Surplus of ${(100 - currentTotal).toFixed(1)}%`}
              </p>
            </div>
          );
        })}
        {assets.filter(asset => !trusts.some(t => t.assetId === asset.id)).length === 0 && <p className="text-gray-500">All registered assets are currently assigned to a Trust Structure.</p>}
      </div>
      <div className="flex justify-between mt-8">
        <button onClick={prevStep} 
                className="py-3 px-6 m-2 rounded-none border border-green-400 cursor-pointer bg-gray-950 text-green-400 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-green-400/30 hover:bg-green-700/20">
            &lt; Back to Beneficiaries
        </button>
        <button onClick={nextStep} 
                className="py-3 px-6 m-2 rounded-none border border-green-400 cursor-pointer bg-gray-950 text-green-400 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-green-400/30 hover:bg-green-700/20" 
                disabled={!areAllAssetsFullyAllocated() || assets.length === 0}>
            Proceed to Trust Configuration &gt;
        </button>
      </div>
    </div>
  );

  // --- Step 4: Trust Configuration View ---
  const TrustConfigurationStep = (
    <div className="mb-8 p-8 border border-gray-800 rounded-none bg-gray-900">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Step 4: Immutable Trust Architecture Deployment</h2>
      <p className="text-gray-400 mb-6">Establish formal, conditional smart contract trusts for assets requiring complex release logic or jurisdictional oversight.</p>

      <form onSubmit={(e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const assetId = (form.elements.namedItem('trustAsset') as HTMLSelectElement).value;
        const beneficiaryId = (form.elements.namedItem('trustHeir') as HTMLSelectElement).value;
        const conditionType = (form.elements.namedItem('trustConditionType') as HTMLSelectElement).value as TrustCondition['type'];
        
        let details: any = {};
        let conditionDescription = '';

        if (conditionType === 'age') {
          const age = parseInt((form.elements.namedItem('conditionAge') as HTMLInputElement).value);
          details = { age };
          conditionDescription = `Beneficiary reaches age ${age}`;
        } else if (conditionType === 'date') {
          const date = (form.elements.namedItem('conditionDate') as HTMLInputElement).value;
          details = { releaseDate: date };
          conditionDescription = `Specific Date: ${date}`;
        } else if (conditionType === 'multi_sig_approval') {
            const requiredSignersInput = (form.elements.namedItem('conditionMultiSigSigners') as HTMLInputElement).value;
            details = { requiredSigners: requiredSignersInput.split(',').map(s => s.trim()).filter(s => s) };
            conditionDescription = `Multi-Sig Approval Required (${details.requiredSigners.length} Signers)`;
        }

        if (assetId && beneficiaryId && conditionType && Object.keys(details).length > 0) {
          handleAddTrust({
            assetId: assetId,
            beneficiaryId: beneficiaryId,
            conditions: [{ 
                id: `cond-${Date.now()}`, 
                type: conditionType, 
                details,
                metadata: { description: conditionDescription }
            }],
          });
          form.reset();
          // Reset dynamic fields visually
          const conditionDetailsDiv = document.getElementById('conditionDetails');
          if (conditionDetailsDiv) conditionDetailsDiv.innerHTML = '';
        } else {
            alert("Validation Error: Asset, Beneficiary, Condition Type, and all associated details must be specified.");
        }
      }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Asset to Secure (Must NOT be directly allocated)</label>
                <select name="trustAsset" required 
                        className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600">
                <option value="">Select an asset</option>
                {assets.map(asset => {
                    const isInTrust = trusts.some(t => t.assetId === asset.id);
                    const isDirectlyAllocated = allocations.some(a => a.assetId === asset.id && a.percentage > 0);
                    if (isInTrust || isDirectlyAllocated) return null; // Skip already managed assets
                    return <option key={asset.id} value={asset.id}>{asset.name} (${asset.currentValuation.toFixed(0)})</option>;
                })}
                </select>
            </div>

            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Primary Beneficiary</label>
                <select name="trustHeir" required 
                        className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600">
                <option value="">Select a beneficiary</option>
                {heirs.map(heir => <option key={heir.id} value={heir.id}>{heir.name} ({heir.relationship})</option>)}
                </select>
            </div>
        </div>

        <label className="block mb-1 font-semibold text-green-400 text-sm">Trust Release Trigger Mechanism</label>
        <select name="trustConditionType" onChange={(e) => {
          const conditionDetailsDiv = document.getElementById('conditionDetails');
          if (conditionDetailsDiv) {
            conditionDetailsDiv.innerHTML = '';
            // Tailwind class strings for dynamic elements
            const inputClass = "p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600";
            const labelClass = "block mb-1 font-semibold text-green-400 text-sm";
            const helpTextClass = "text-xs text-gray-400 mt-1";

            if (e.target.value === 'age') {
              conditionDetailsDiv.innerHTML = `
                <label class="${labelClass}" for="conditionAge">Release Age Threshold:</label>
                <input name="conditionAge" type="number" min="18" required class="${inputClass}" placeholder="e.g., 25" />
              `;
            } else if (e.target.value === 'date') {
              conditionDetailsDiv.innerHTML = `
                <label class="${labelClass}" for="conditionDate">Fixed Release Date:</label>
                <input name="conditionDate" type="date" required class="${inputClass}" />
              `;
            } else if (e.target.value === 'multi_sig_approval') {
                conditionDetailsDiv.innerHTML = `
                <label class="${labelClass}" for="conditionMultiSigSigners">Required Signer IDs (Comma Separated):</label>
                <input name="conditionMultiSigSigners" type="text" required class="${inputClass}" placeholder="ADMIN_ID_1, EXECUTOR_ID_2, etc." />
                <p class="${helpTextClass}">Requires consensus from specified governance entities to release.</p>
              `;
            }
          }
        }} required 
        className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600 mb-4">
          <option value="">Select a deterministic trigger</option>
          <option value="age">Beneficiary Age Threshold</option>
          <option value="date">Fixed Calendar Date</option>
          <option value="multi_sig_approval">Multi-Signature Governance Approval</option>
        </select>
        <div id="conditionDetails" className="my-4 p-4 border border-dashed border-gray-700 rounded-none">
            {/* Dynamic condition inputs rendered here */}
        </div>
        <button type="submit" 
                className="py-3 px-6 m-2 rounded-none border border-red-500 cursor-pointer bg-red-900/30 text-red-500 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-red-500/50 hover:bg-red-800/50" 
                disabled={assets.length === 0 || heirs.length === 0}>
            Propose Structure
        </button>
      </form>

      <div className="mt-8 pt-5 border-t-2 border-gray-800">
        <h3 className="text-xl font-bold text-green-400 mb-4">Active Trust Proposals ({trusts.length} Total):</h3>
        {trusts.length === 0 ? (
          <p className="text-gray-500">No structure proposals. Assets can be managed via direct allocation (Step 3) or secured here.</p>
        ) : (
          <ul>
            {trusts.map(trust => {
              const asset = assets.find(a => a.id === trust.assetId);
              const heir = heirs.find(h => h.id === trust.beneficiaryId);
              const statusColorClass = trust.status === 'deployed' ? 'border-green-500 text-green-500' : trust.status === 'draft' ? 'border-yellow-500 text-yellow-500' : 'border-red-500 text-red-500';
              return (
                <li key={trust.id} className={`bg-gray-950 p-3 mb-2 rounded-none border-l-4 border border-green-400 flex justify-between items-center text-lg ${statusColorClass}`}>
                  <div className="flex-grow">
                    <p className="m-0 font-bold text-red-500">Structure: {trust.trustName}</p>
                    <p className="mt-0 text-sm text-gray-400">Asset: {asset?.name || 'N/A'} &rarr; Beneficiary: {heir?.name || 'N/A'}</p>
                    <p className="mt-1 text-xs text-gray-400">
                        Trigger: {trust.conditions[0]?.metadata.description || 'Undefined'}
                    </p>
                    <p className="mt-1 text-xs font-bold text-red-500">Status: {trust.status.toUpperCase()}</p>
                  </div>
                  <div>
                    <button onClick={() => handleDeleteTrust(trust.id)} 
                            className="py-2 px-4 rounded-none border border-red-500 cursor-pointer bg-red-900/30 text-red-500 text-sm font-semibold transition-colors duration-300 shadow-lg shadow-red-500/50 hover:bg-red-800/50">
                        Cancel Proposal
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="flex justify-between mt-8">
        <button onClick={prevStep} 
                className="py-3 px-6 m-2 rounded-none border border-green-400 cursor-pointer bg-gray-950 text-green-400 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-green-400/30 hover:bg-green-700/20">
            &lt; Back to Allocations
        </button>
        <button onClick={nextStep} 
                className="py-3 px-6 m-2 rounded-none border border-green-400 cursor-pointer bg-gray-950 text-green-400 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-green-400/30 hover:bg-green-700/20">
            Final Review & Deployment &gt;
        </button>
      </div>
    </div>
  );

  // --- Step 5: Review & Deployment View ---
  const ReviewAndDeployStep = (
    <div className="mb-8 p-8 border border-gray-800 rounded-none bg-gray-900">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Step 5: Final Governance Review and On-Chain Execution</h2>
      <p className="text-gray-400 mb-6">Verify all parameters. Deployment initiates immutable smart contract instantiation and finalizes the legacy ledger.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-800 pb-6 mb-6">
        <div className="pr-4 md:border-r border-gray-800">
            <h3 className="text-xl font-bold text-green-400 mb-3">Asset Registry Snapshot ({assets.length})</h3>
            <ul>
                {assets.map(asset => (
                <li key={asset.id} className="text-sm mb-1 text-gray-300">
                    <strong className="text-red-500">{asset.name}</strong>: ${asset.currentValuation.toFixed(0)} ({asset.securityLevel})
                </li>
                ))}
            </ul>
        </div>
        <div className="pl-4">
            <h3 className="text-xl font-bold text-green-400 mb-3">Beneficiary Ledger Snapshot ({heirs.length})</h3>
            <ul>
                {heirs.map(heir => (
                <li key={heir.id} className="text-sm mb-1 text-gray-300">
                    <strong className="text-red-500">{heir.name}</strong>: {heir.relationship} ({heir.walletAddress.substring(0, 6)}...)
                </li>
                ))}
            </ul>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-gray-800">
        <h3 className="text-xl font-bold text-green-400 mb-3">Trust Architecture Summary ({trusts.length})</h3>
        {trusts.length === 0 ? <p className="text-gray-500">No formal structures configured.</p> : (
            <ul>
                {trusts.map(trust => {
                    const asset = assets.find(a => a.id === trust.assetId);
                    const heir = heirs.find(h => h.id === trust.beneficiaryId);
                    return (
                        <li key={trust.id} className="text-sm mb-2 border-l-2 border-red-500 pl-3 text-gray-300">
                            <strong className="text-red-500">{asset?.name}</strong> secured for <strong className="text-red-500">{heir?.name}</strong>. Status: {trust.status}. Trigger: {trust.conditions[0]?.metadata.description}
                        </li>
                    );
                })}
            </ul>
        )}
      </div>

      <div className="mt-6 pt-5 border-t border-gray-800">
        <h3 className="text-xl font-bold text-green-400 mb-3">Direct Allocation Verification</h3>
        <p className={`font-bold ${areAllAssetsFullyAllocated() ? 'text-green-500' : 'text-red-500'}`}>
            Allocation Integrity Check: {areAllAssetsFullyAllocated() ? 'PASS (100% coverage for non-trust assets)' : 'FAIL (Review Step 3)'}
        </p>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={prevStep} 
                className="py-3 px-6 m-2 rounded-none border border-green-400 cursor-pointer bg-gray-950 text-green-400 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-green-400/30 hover:bg-green-700/20">
            &lt; Modify Trust Parameters
        </button>
        <button onClick={handleDeployPlan} 
                className="py-3 px-6 m-2 rounded-none border border-red-500 cursor-pointer bg-red-900/30 text-red-500 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-red-500/50 hover:bg-red-800/50" 
                disabled={!areAllAssetsFullyAllocated()}>
            Execute Enterprise Deployment
        </button>
      </div>
    </div>
  );

  // --- Step 6: Completion & Audit Log View ---
  const CompletionStep = (
    <div className="mb-8 p-8 border border-gray-800 rounded-none bg-gray-900">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Deployment Protocol Finalized</h2>
      <p className="text-gray-400 mb-6">The system has successfully instantiated the digital legacy architecture. Review the immutable deployment log below.</p>

      <div className="h-96 overflow-y-scroll bg-gray-950 p-4 rounded-none border border-red-500 font-mono text-sm">
        {deploymentLog.length === 0 ? (
            <p className="text-gray-600">Awaiting deployment log...</p>
        ) : (
            deploymentLog.map((log, index) => (
                <p key={index} className={`m-0 my-1 ${log.includes('WARNING') || log.includes('ERROR') ? 'text-red-500' : log.includes('AI GOVERNANCE REPORT') ? 'text-green-500' : 'text-gray-400'}`}>
                    {log}
                </p>
            ))
        )}
      </div>

      <div className="mt-8 text-center">
        <button onClick={() => {
            setAssets([]); setHeirs([]); setAllocations([]); setTrusts([]); setDeploymentLog([]); setAiAnalysisResults({}); setCurrentStep(1);
        }} className="py-3 px-6 m-2 rounded-none border border-red-500 cursor-pointer bg-red-900/30 text-red-500 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-red-500/50 hover:bg-red-800/50">
            Initiate New Governance Cycle
        </button>
      </div>
    </div>
  );


  // --- Main Render Logic ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return AssetManagementStep;
      case 2:
        return HeirManagementStep;
      case 3:
        return AllocationMatrixStep;
      case 4:
        return TrustConfigurationStep;
      case 5:
        return ReviewAndDeployStep;
      case 6:
        return CompletionStep;
      default:
        return <div className="mb-8 p-8 border border-gray-800 rounded-none bg-gray-900 text-red-500">Error: Invalid Step.</div>;
    }
  };

  return (
    <div className="font-mono max-w-7xl mx-auto my-10 p-10 border border-red-500 rounded-none shadow-2xl shadow-red-500/50 bg-gray-950 text-green-400">
      <div className="p-6 mb-10 bg-red-950 text-green-400 rounded-none border-2 border-red-500 leading-relaxed text-lg text-left whitespace-pre-wrap">
          <h2 className="text-3xl font-bold text-red-500 border-b border-red-500 pb-3 mb-4 text-center">AI GOVERNANCE MODULE: ORACLE-PRIME</h2>
          <p>
              Attention Operator. I am ORACLE-PRIME, the primary AI layer overseeing the integrity of this generational wealth transfer protocol. My function is not advisory; it is validation. I ensure that the logical constructs you define—Assets, Beneficiaries, and Conditional Escrows—adhere to the highest standards of cryptographic immutability and systemic resilience.
          </p>
          <p>
              Every input is cross-referenced against known systemic vulnerabilities. Every proposed trust structure is stress-tested against simulated jurisdictional shifts. Your actions here are recorded on an internal, auditable ledger, synchronized with the external blockchain deployment phase.
          </p>
          <p>Proceed with precision. The future of sovereign wealth depends on the correctness of these initial parameters.</p>
      </div>

      <h1 className="text-center text-5xl font-extrabold text-red-500 mb-10 border-b-4 border-red-500 pb-4">Digital Legacy Architecture Builder</h1>

      {/* Step Navigation */}
      <div className="flex justify-between mb-8 border-b border-gray-800 pb-3">
        {['Asset Registry', 'Beneficiary Definition', 'Distribution Matrix', 'Trust Configuration', 'Final Validation', 'Deployment Log'].map((stepName, index) => (
          <div 
            key={index} 
            className={`flex-grow text-center py-2 px-3 cursor-pointer text-lg transition-all duration-300 
                        ${currentStep === index + 1 ? 'font-bold text-red-500 border-b-4 border-red-500' : 'font-medium text-green-400 border-b-4 border-transparent hover:text-green-300 hover:border-green-600/30'}`}
            onClick={() => setCurrentStep(index + 1)}
          >
            {index + 1}. {stepName}
          </div>
        ))}
      </div>

      {renderStepContent()}
    </div>
  );
};

export default DigitalLegacyPlanner;

// --- CONSOLIDATED FROM: LegacyBuilder (2)_1.tsx ---

import React, { useState, useCallback, useMemo } from 'react';

// NOTE: This file has been refactored from a "LegacyBuilder" prototype
// to a "DigitalLegacyPlanner" to remove deliberately flawed components
// and unify the technology stack using Tailwind CSS for a production-ready system.

// --- Core Data Structures: Enhanced for Enterprise Grade Security and Auditability ---

/**
 * Asset: Represents a digital or tokenized asset under management.
 * Enhanced with metadata for compliance and AI valuation hooks.
 */
interface Asset {
  id: string;
  name: string;
  description: string; // Detailed description for compliance records
  type: 'crypto' | 'nft' | 'tokenized_real_estate' | 'security_token' | 'decentralized_identity' | 'other';
  currentValuation: number; // Real-time or last audited USD value
  valuationTimestamp: number; // Unix timestamp of the last valuation
  contractAddress?: string; // Primary smart contract identifier
  tokenId?: string; // Specific token identifier
  securityLevel: 'high' | 'medium' | 'low'; // Internal risk classification
}

/**
 * Heir: Represents a beneficiary, now including KYC/AML identifiers and communication channels.
 */
interface Heir {
  id: string;
  name: string;
  walletAddress: string; // Primary blockchain address
  relationship: string;
  kycStatus: 'pending' | 'verified' | 'rejected'; // Default changed from 'rejected' to 'pending'
  communicationEmail: string;
}

/**
 * AllocationRule: Defines the distribution logic for non-trust assets.
 * Enhanced with audit trails.
 */
interface AllocationRule {
  id: string;
  assetId: string;
  heirId: string;
  percentage: number; // Must sum to 100% per asset
  auditTrail: { timestamp: number; operatorId: string }[];
}

/**
 * TrustCondition: Defines a trigger for asset release from a smart contract trust.
 * Expanded condition types for complex jurisdictional requirements.
 */
interface TrustCondition {
  id: string;
  type: 'age' | 'date' | 'event' | 'multi_sig_approval' | 'jurisdictional_ruling';
  details: {
    [key: string]: any; // Flexible structure for specific condition parameters
  };
  metadata: {
    description: string;
    requiredSigners?: string[]; // For multi-sig
  };
}

/**
 * SmartContractTrust: Represents an on-chain escrow mechanism.
 * Includes gas estimation and deployment metadata.
 */
interface SmartContractTrust {
  id: string;
  trustName: string;
  assetId: string;
  beneficiaryId: string; // HeirId
  conditions: TrustCondition[];
  status: 'draft' | 'pending_deployment' | 'deployed' | 'active' | 'revoked';
  contractAddress?: string;
  deploymentGasEstimate?: number;
  deploymentTxHash?: string;
}

// --- AI Integration Interfaces (Simulated) ---

interface AIValuationReport {
    assetId: string;
    suggestedValue: number;
    confidenceScore: number; // 0.0 to 1.0
    analysisSummary: string;
}

// --- Mock AI Service Functions (Replaced "Chaos Engineering" aspects with reliable simulations) ---

const mockAIAssistant = {
    // Simulates an AI analyzing asset details for risk assessment
    analyzeAssetRisk: (asset: Asset): Promise<{ riskScore: number, complianceFlags: string[] }> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const riskScore = asset.type === 'crypto' ? Math.random() * 0.3 + 0.1 : Math.random() * 0.1; // Lowered baseline risk for production
                const complianceFlags: string[] = [];
                if (asset.currentValuation > 5000000 && asset.securityLevel === 'low') { // Higher threshold for flagging
                    complianceFlags.push("High Value, Low Security Flagged");
                }
                resolve({ riskScore, complianceFlags });
            }, 300); // Faster response
        });
    },
    // Simulates AI generating a professional summary for the review step
    generateDeploymentSummary: (assets: Asset[], heirs: Heir[], trusts: SmartContractTrust[]): Promise<string> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const deployedTrusts = trusts.filter(t => t.status === 'deployed').length;
                const totalAssets = assets.length;
                const summary = `
                **AI GOVERNANCE REPORT (v1.0.0)**
                
                System Integrity Check: PASSED.
                Total Assets Under Management (AUM): ${totalAssets}.
                Active Trust Contracts Successfully Deployed: ${deployedTrusts}.
                
                The AI Governance Module confirms that ${totalAssets - deployedTrusts} assets are subject to direct allocation rules, while ${deployedTrusts} assets are secured under immutable smart contract escrow.
                
                All defined parameters align with established security policies.
                `;
                resolve(summary);
            }, 500); // Faster response
        });
    }
};


// --- Component Implementation: Renamed and refactored for stability ---

const DigitalLegacyPlanner: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [heirs, setHeirs] = useState<Heir[]>([]);
  const [allocations, setAllocations] = useState<AllocationRule[]>([]);
  const [trusts, setTrusts] = useState<SmartContractTrust[]>([]);
  const [deploymentLog, setDeploymentLog] = useState<string[]>([]);
  const [aiAnalysisResults, setAiAnalysisResults] = useState<{ [key: string]: { riskScore: number, complianceFlags: string[] } }>({});

  // --- Utility Functions & Callbacks ---

  // Replaced mock operator ID with a more generic placeholder.
  // In a production system, this would come from a secure authentication context (e.g., JWT token).
  const currentUserId = useMemo(() => "system-audit-user", []); 

  const nextStep = useCallback(() => setCurrentStep(prev => prev < 6 ? prev + 1 : prev), []);
  const prevStep = useCallback(() => setCurrentStep(prev => prev > 1 ? prev - 1 : prev), []);

  // --- Asset Management ---
  const handleAddAsset = useCallback((newAsset: Omit<Asset, 'id' | 'valuationTimestamp' | 'securityLevel'> & { value: number, securityLevel: Asset['securityLevel'] }) => {
    const newId = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const assetToAdd: Asset = {
        ...newAsset,
        id: newId,
        currentValuation: newAsset.value, 
        valuationTimestamp: Date.now(),
        securityLevel: newAsset.securityLevel, 
    };
    setAssets(prev => [...prev, assetToAdd]);
    // Trigger AI analysis immediately upon addition
    mockAIAssistant.analyzeAssetRisk(assetToAdd).then(results => {
        setAiAnalysisResults(prev => ({ ...prev, [newId]: results }));
    });
  }, []);

  const handleUpdateAsset = useCallback((id: string, updatedAsset: Partial<Asset>) => {
    setAssets(prevAssets => prevAssets.map(asset => {
        if (asset.id === id) {
            const updated = { ...asset, ...updatedAsset, valuationTimestamp: Date.now() };
            // Re-run AI analysis if critical fields change
            if (updatedAsset.currentValuation !== undefined || updatedAsset.securityLevel !== undefined) {
                mockAIAssistant.analyzeAssetRisk(updated).then(results => {
                    setAiAnalysisResults(prev => ({ ...prev, [id]: results }));
                });
            }
            return updated;
        }
        return asset;
    }));
  }, []);

  const handleDeleteAsset = useCallback((id: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== id));
    setAllocations(prev => prev.filter(alloc => alloc.assetId !== id));
    setTrusts(prev => prev.filter(trust => trust.assetId !== id));
    setAiAnalysisResults(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
    });
  }, []);

  // --- Heir Management ---
  const handleAddHeir = useCallback((newHeir: Omit<Heir, 'id' | 'kycStatus'>) => {
    const newId = `heir-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    // Default KYC status changed from 'rejected' to 'pending' for a realistic flow
    setHeirs(prev => [...prev, { ...newHeir, id: newId, kycStatus: 'pending' }]); 
  }, []);

  const handleUpdateHeir = useCallback((id: string, updatedHeir: Partial<Heir>) => {
    setHeirs(prevHeirs => prevHeirs.map(heir => heir.id === id ? { ...heir, ...updatedHeir } : heir));
  }, []);

  const handleDeleteHeir = useCallback((id: string) => {
    setHeirs(prev => prev.filter(heir => heir.id !== id));
    setAllocations(prev => prev.filter(alloc => alloc.heirId !== id));
    setTrusts(prev => prev.filter(trust => trust.beneficiaryId !== id));
  }, []);

  // --- Allocation Management ---
  const handleUpdateAllocation = useCallback((assetId: string, heirId: string, percentage: number) => {
    const sanitizedPercentage = Math.max(0, Math.min(100, percentage));
    const existingAllocIndex = allocations.findIndex(a => a.assetId === assetId && a.heirId === heirId);

    if (existingAllocIndex !== -1) {
      setAllocations(prev => prev.map((alloc, index) => {
        if (index === existingAllocIndex) {
          return {
            ...alloc,
            percentage: sanitizedPercentage,
            auditTrail: [...alloc.auditTrail, { timestamp: Date.now(), operatorId: currentUserId }]
          };
        }
        return alloc;
      }));
    } else if (sanitizedPercentage > 0) {
      const newId = `alloc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      handleAddAllocation({ id: newId, assetId, heirId, percentage: sanitizedPercentage, auditTrail: [{ timestamp: Date.now(), operatorId: currentUserId }] });
    }
  }, [allocations, currentUserId]);

  const handleAddAllocation = useCallback((newAllocation: AllocationRule) => {
    setAllocations(prev => [...prev, newAllocation]);
  }, []);

  const handleDeleteAllocation = useCallback((assetId: string, heirId: string) => {
    // Fixed logic for filter condition
    setAllocations(prev => prev.filter(a => !(a.assetId === assetId && a.heirId === heirId)));
  }, []);

  // --- Trust Management ---
  const handleAddTrust = useCallback((newTrust: Omit<SmartContractTrust, 'id' | 'status' | 'trustName'>) => {
    const newId = `trust-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const asset = assets.find(a => a.id === newTrust.assetId);
    const heir = heirs.find(h => h.id === newTrust.beneficiaryId);
    const trustName = `${asset?.name || 'Asset'} Structure for ${heir?.name || 'Unknown'}`;

    setTrusts(prev => [...prev, {
        ...newTrust,
        id: newId,
        trustName,
        status: 'draft',
        deploymentGasEstimate: 500000 // Mock estimate
    }]);
  }, [assets, heirs]);

  const handleUpdateTrust = useCallback((id: string, updatedTrust: Partial<SmartContractTrust>) => {
    setTrusts(prevTrusts => prevTrusts.map(trust => trust.id === id ? { ...trust, ...updatedTrust } : trust));
  }, []);

  const handleDeleteTrust = useCallback((id: string) => {
    setTrusts(prev => prev.filter(trust => trust.id !== id));
  }, []);

  // --- Deployment Logic (Refactored for success and real-world simulation) ---
  const handleDeployPlan = useCallback(async () => {
    setDeploymentLog(prev => [...prev, `[${new Date().toISOString()}] Initiating Secure Deployment Sequence...`]);

    // 1. Validate Final State
    if (!areAllAssetsFullyAllocated()) {
        alert("CRITICAL WARNING: Allocation imbalance detected for directly managed assets. Deployment halted.");
        setDeploymentLog(prev => [...prev, `[${new Date().toISOString()}] WARNING: Allocation imbalance detected for non-trust assets. Deployment halted.`]);
        return;
    }

    // 2. Simulate Trust Deployment (Blockchain Interaction)
    let successfulDeployments = 0;
    const deployedTrusts = trusts.map(trust => {
        if (trust.status === 'draft' || trust.status === 'pending_deployment') {
            // Replaced '0xFAIL' with a realistic mock transaction hash for successful deployment
            const mockTxHash = `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}${Math.random().toString(16).slice(2, 10).toUpperCase()}${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
            setDeploymentLog(prev => [...prev, `[${new Date().toISOString()}] Deploying Smart Trust ${trust.trustName} (${trust.id}). Estimated Gas: ${trust.deploymentGasEstimate}`]);
            
            successfulDeployments++;
            return {
                ...trust,
                status: 'deployed', // Changed to 'deployed' from 'revoked' for a successful outcome
                contractAddress: `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}${Math.random().toString(16).slice(2, 10).toUpperCase()}`, // Realistic mock address
                deploymentTxHash: mockTxHash,
            };
        }
        return trust;
    });
    setTrusts(deployedTrusts);

    // 3. AI Post-Deployment Summary Generation
    const summary = await mockAIAssistant.generateDeploymentSummary(assets, heirs, deployedTrusts);
    setDeploymentLog(prev => [...prev, `[${new Date().toISOString()}] AI Governance Report Generated.`]);
    setDeploymentLog(prev => [...prev, summary]);

    setDeploymentLog(prev => [...prev, `[${new Date().toISOString()}] Deployment Sequence Complete. ${successfulDeployments} trust structures successfully initialized.`]);
    alert(`Deployment Complete! ${successfulDeployments} structures deployed.`);
    setCurrentStep(6);
  }, [assets, heirs, trusts, areAllAssetsFullyAllocated]);

  // --- Validation Helpers ---
  const areAllAssetsFullyAllocated = useMemo(() => {
    // If no assets, or no non-trust assets, it's considered fully allocated
    const nonTrustAssets = assets.filter(asset => !trusts.some(t => t.assetId === asset.id));
    if (nonTrustAssets.length === 0) return true;
    
    return nonTrustAssets.every(asset => {
      const totalAllocated = heirs.reduce((sum, heir) => {
        const alloc = allocations.find(a => a.assetId === asset.id && a.heirId === heir.id);
        return sum + (alloc ? alloc.percentage : 0);
      }, 0);
      return Math.abs(totalAllocated - 100) < 0.001; // Allow for minor floating point inaccuracies
    });
  }, [assets, heirs, allocations, trusts]);

  // --- Step 1: Asset Management View ---
  const AssetManagementStep = (
    <div className="mb-8 p-8 border border-gray-800 rounded-none bg-gray-900">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Step 1: Digital Asset Registry & AI Valuation Ingestion</h2>
      <p className="text-gray-400 mb-6">Define all assets intended for legacy transfer. The system will automatically initiate AI risk profiling upon entry.</p>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const assetName = (form.elements.namedItem('assetName') as HTMLInputElement).value;
        const assetDesc = (form.elements.namedItem('assetDesc') as HTMLInputElement).value;
        const assetType = (form.elements.namedItem('assetType') as HTMLSelectElement).value as Asset['type'];
        const assetValue = parseFloat((form.elements.namedItem('assetValue') as HTMLInputElement).value);
        const contractAddress = (form.elements.namedItem('assetContract') as HTMLInputElement)?.value || undefined;
        const tokenId = (form.elements.namedItem('assetTokenId') as HTMLInputElement)?.value || undefined;
        const securityLevel = (form.elements.namedItem('securityLevel') as HTMLSelectElement).value as Asset['securityLevel'];

        if (assetName && assetType && !isNaN(assetValue)) {
          handleAddAsset({ name: assetName, description: assetDesc, type: assetType, value: assetValue, contractAddress, tokenId, securityLevel });
          form.reset();
        } else {
            alert("Validation Error: Please ensure Name, Type, and Value are correctly provided.");
        }
      }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Asset Name (Mandatory)</label>
                <input name="assetName" type="text" placeholder="e.g., Primary BTC Cold Storage" required 
                       className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Asset Type (Classification)</label>
                <select name="assetType" required 
                        className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600">
                <option value="crypto">Cryptocurrency</option>
                <option value="nft">Non-Fungible Token (NFT)</option>
                <option value="tokenized_real_estate">Tokenized Real Estate</option>
                <option value="security_token">Regulated Security Token</option>
                <option value="decentralized_identity">Decentralized Identity Credential</option>
                <option value="other">Other Digital Asset</option>
                </select>
            </div>
        </div>
        <div className="mb-4">
            <label className="block mb-1 font-semibold text-green-400 text-sm">Detailed Asset Description (For Audit)</label>
            <input name="assetDesc" type="text" placeholder="Location, key recovery method, etc." 
                   className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Estimated Current Value (USD)</label>
                <input name="assetValue" type="number" step="0.01" placeholder="100000.00" required 
                       className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Security Classification (Manual Override)</label>
                <select name="securityLevel" required 
                        className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600">
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                </select>
            </div>
            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Contract Address (Optional)</label>
                <input name="assetContract" type="text" placeholder="0x..." 
                       className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
        </div>
        <button type="submit" 
                className="py-3 px-6 m-2 rounded-none border border-red-500 cursor-pointer bg-red-900/30 text-red-500 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-red-500/50 hover:bg-red-800/50">
            Register Asset & Initiate AI Scan
        </button>
      </form>

      <div className="mt-8 pt-5 border-t-2 border-gray-800">
        <h3 className="text-xl font-bold text-green-400 mb-4">Asset Inventory ({assets.length} Total):</h3>
        {assets.length === 0 ? (
          <p className="text-gray-500">No assets registered. Proceed to registration.</p>
        ) : (
          <ul>
            {assets.map(asset => {
                const analysis = aiAnalysisResults[asset.id];
                const riskColorClass = analysis ? 
                    (analysis.riskScore > 0.7 ? 'text-red-500' : analysis.riskScore > 0.4 ? 'text-yellow-500' : 'text-green-500') 
                    : 'text-gray-400';
                return (
                  <li key={asset.id} className="bg-gray-950 p-3 mb-2 rounded-none border border-green-400 flex justify-between items-center text-lg shadow-md shadow-green-500/30">
                    <div className="flex-grow">
                        <p className="m-0 font-bold text-red-500">{asset.name}</p>
                        <p className="mt-0 text-sm text-gray-400">Type: {asset.type} | Value: ${asset.currentValuation.toLocaleString()} | Level: {asset.securityLevel.toUpperCase()}</p>
                        {analysis && (
                            <p className={`mt-1 text-xs ${riskColorClass}`}>
                                AI Risk Score: {(analysis.riskScore * 100).toFixed(1)}% 
                                {analysis.complianceFlags.length > 0 && ` [Flags: ${analysis.complianceFlags.join(', ')}]`}
                            </p>
                        )}
                    </div>
                    <div>
                      <button onClick={() => handleDeleteAsset(asset.id)} 
                              className="py-2 px-4 rounded-none border border-red-500 cursor-pointer bg-red-900/30 text-red-500 text-sm font-semibold transition-colors duration-300 shadow-lg shadow-red-500/50 hover:bg-red-800/50">
                          Remove
                      </button>
                    </div>
                  </li>
                );
            })}
          </ul>
        )}
      </div>
      <div className="text-right mt-8">
        <button onClick={nextStep} 
                className="py-3 px-6 m-2 rounded-none border border-green-400 cursor-pointer bg-gray-950 text-green-400 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-green-400/30 hover:bg-green-700/20" 
                disabled={assets.length === 0}>
            Proceed to Beneficiary Definition &gt;
        </button>
      </div>
    </div>
  );

  // --- Step 2: Heir Management View ---
  const HeirManagementStep = (
    <div className="mb-8 p-8 border border-gray-800 rounded-none bg-gray-900">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Step 2: Beneficiary & Governance Entity Definition</h2>
      <p className="text-gray-400 mb-6">Define all intended recipients. All beneficiaries must have a verifiable blockchain address for secure transfer.</p>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const heirName = (form.elements.namedItem('heirName') as HTMLInputElement).value;
        const heirWallet = (form.elements.namedItem('heirWallet') as HTMLInputElement).value;
        const heirRelationship = (form.elements.namedItem('heirRelationship') as HTMLInputElement)?.value || undefined;
        const heirEmail = (form.elements.namedItem('heirEmail') as HTMLInputElement).value;

        if (heirName && heirWallet && heirEmail) {
          handleAddHeir({ name: heirName, walletAddress: heirWallet, relationship: heirRelationship || 'Unspecified', communicationEmail: heirEmail });
          form.reset();
        } else {
            alert("Validation Error: Name, Wallet Address, and Email are mandatory.");
        }
      }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Beneficiary Full Name</label>
                <input name="heirName" type="text" placeholder="e.g., Dr. Evelyn Reed" required 
                       className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Primary Wallet Address</label>
                <input name="heirWallet" type="text" placeholder="0x..." required 
                       className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Relationship to Principal</label>
                <input name="heirRelationship" type="text" placeholder="e.g., Executor, Primary Heir, Foundation Trustee" 
                       className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Secure Communication Email (For Notifications)</label>
                <input name="heirEmail" type="email" placeholder="secure@domain.com" required 
                       className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
        </div>
        <button type="submit" 
                className="py-3 px-6 m-2 rounded-none border border-red-500 cursor-pointer bg-red-900/30 text-red-500 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-red-500/50 hover:bg-red-800/50">
            Register Beneficiary Entity
        </button>
      </form>

      <div className="mt-8 pt-5 border-t-2 border-gray-800">
        <h3 className="text-xl font-bold text-green-400 mb-4">Defined Beneficiaries ({heirs.length} Total):</h3>
        {heirs.length === 0 ? (
          <p className="text-gray-500">No beneficiaries defined. Proceeding without recipients is not recommended.</p>
        ) : (
          <ul>
            {heirs.map(heir => (
              <li key={heir.id} className="bg-gray-950 p-3 mb-2 rounded-none border border-green-400 flex justify-between items-center text-lg shadow-md shadow-green-500/30">
                <div className="flex-grow">
                    <p className="m-0 font-bold text-red-500">{heir.name} ({heir.relationship})</p>
                    <p className="mt-0 text-sm text-gray-400">Wallet: {heir.walletAddress.substring(0, 8)}...{heir.walletAddress.slice(-4)}</p>
                    <p className="mt-1 text-xs">KYC Status: <span className={heir.kycStatus === 'verified' ? 'text-green-500' : heir.kycStatus === 'pending' ? 'text-yellow-500' : 'text-red-500'}>{heir.kycStatus.toUpperCase()}</span></p>
                </div>
                <div>
                  <button onClick={() => handleUpdateHeir(heir.id, { kycStatus: heir.kycStatus === 'verified' ? 'pending' : 'verified' })} 
                          className="py-2 px-4 mr-2 rounded-none border border-yellow-500 cursor-pointer bg-yellow-900/30 text-yellow-500 text-sm font-semibold transition-colors duration-300 shadow-lg shadow-yellow-500/30 hover:bg-yellow-800/50">
                      Toggle KYC
                  </button>
                  <button onClick={() => handleDeleteHeir(heir.id)} 
                          className="py-2 px-4 rounded-none border border-red-500 cursor-pointer bg-red-900/30 text-red-500 text-sm font-semibold transition-colors duration-300 shadow-lg shadow-red-500/50 hover:bg-red-800/50">
                      Decommission
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex justify-between mt-8">
        <button onClick={prevStep} 
                className="py-3 px-6 m-2 rounded-none border border-green-400 cursor-pointer bg-gray-950 text-green-400 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-green-400/30 hover:bg-green-700/20">
            &lt; Back to Assets
        </button>
        <button onClick={nextStep} 
                className="py-3 px-6 m-2 rounded-none border border-green-400 cursor-pointer bg-gray-950 text-green-400 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-green-400/30 hover:bg-green-700/20" 
                disabled={heirs.length === 0}>
            Define Allocation Matrix &gt;
        </button>
      </div>
    </div>
  );

  // --- Step 3: Allocation Matrix View ---
  const AllocationMatrixStep = (
    <div className="mb-8 p-8 border border-gray-800 rounded-none bg-gray-900">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Step 3: Asset Distribution Matrix (Direct Allocation)</h2>
      <p className="text-gray-400 mb-6">Define the percentage distribution for assets NOT placed under a formal Trust structure. Total allocation per asset MUST equal 100%.</p>

      <div className="mt-8 pt-5 border-t-2 border-gray-800">
        {assets.filter(asset => !trusts.some(t => t.assetId === asset.id)).map(asset => {
          const currentTotal = heirs.reduce((sum, heir) => {
            const alloc = allocations.find(a => a.assetId === asset.id && a.heirId === heir.id);
            return sum + (alloc ? alloc.percentage : 0);
          }, 0);
          const isFullyAllocated = Math.abs(currentTotal - 100) < 0.001;
          const isAssetInTrust = trusts.some(t => t.assetId === asset.id);

          if (isAssetInTrust) {
              return (
                  <div key={asset.id} className="bg-gray-900 p-3 mb-2 rounded-none border-l-4 border-yellow-500 border border-gray-700">
                      <div className="flex-grow">
                          <p className="m-0 font-bold text-yellow-400">{asset.name} (Secured by Trust Structure)</p>
                          <p className="mt-0 text-sm text-gray-400">This asset's distribution is governed by a Smart Contract Trust defined in Step 4.</p>
                      </div>
                  </div>
              );
          }

          return (
            <div key={asset.id} className="mb-6 p-4 border border-gray-800 rounded-none bg-gray-900">
              <h4 className="text-lg font-bold text-red-500 border-b border-dashed border-gray-700 pb-2 mb-4">Asset: {asset.name} (Value: ${asset.currentValuation.toFixed(2)})</h4>
              {heirs.map(heir => {
                const currentAllocation = allocations.find(a => a.assetId === asset.id && a.heirId === heir.id);
                const allocatedPercentage = currentAllocation ? currentAllocation.percentage : 0;
                return (
                  <div key={`${asset.id}-${heir.id}`} className="flex items-center mb-2">
                    <label className="flex-1 font-medium text-green-400">{heir.name}:</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={allocatedPercentage}
                      onChange={(e) => {
                        const newPercentage = parseFloat(e.target.value) || 0;
                        handleUpdateAllocation(asset.id, heir.id, newPercentage);
                      }}
                      className="w-24 p-2 border border-green-400 box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                    <span className="ml-2 font-bold text-green-400">%</span>
                    {allocatedPercentage > 0 && (
                       <button onClick={() => handleUpdateAllocation(asset.id, heir.id, 0)} 
                               className="ml-4 py-1 px-3 rounded-none border border-red-500 cursor-pointer bg-red-900/30 text-red-500 text-xs font-semibold transition-colors duration-300 hover:bg-red-800/50">
                           Reset
                       </button>
                    )}
                  </div>
                );
              })}
              <p className={`mt-4 text-sm font-bold ${isFullyAllocated ? 'text-green-500' : 'text-red-500'}`}>
                Current Total: {currentTotal.toFixed(1)}%. Status: {isFullyAllocated ? '✅ 100% Allocated' : `⚠️ Deficit/Surplus of ${(100 - currentTotal).toFixed(1)}%`}
              </p>
            </div>
          );
        })}
        {assets.filter(asset => !trusts.some(t => t.assetId === asset.id)).length === 0 && <p className="text-gray-500">All registered assets are currently assigned to a Trust Structure.</p>}
      </div>
      <div className="flex justify-between mt-8">
        <button onClick={prevStep} 
                className="py-3 px-6 m-2 rounded-none border border-green-400 cursor-pointer bg-gray-950 text-green-400 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-green-400/30 hover:bg-green-700/20">
            &lt; Back to Beneficiaries
        </button>
        <button onClick={nextStep} 
                className="py-3 px-6 m-2 rounded-none border border-green-400 cursor-pointer bg-gray-950 text-green-400 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-green-400/30 hover:bg-green-700/20" 
                disabled={!areAllAssetsFullyAllocated() || assets.length === 0}>
            Proceed to Trust Configuration &gt;
        </button>
      </div>
    </div>
  );

  // --- Step 4: Trust Configuration View ---
  const TrustConfigurationStep = (
    <div className="mb-8 p-8 border border-gray-800 rounded-none bg-gray-900">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Step 4: Immutable Trust Architecture Deployment</h2>
      <p className="text-gray-400 mb-6">Establish formal, conditional smart contract trusts for assets requiring complex release logic or jurisdictional oversight.</p>

      <form onSubmit={(e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const assetId = (form.elements.namedItem('trustAsset') as HTMLSelectElement).value;
        const beneficiaryId = (form.elements.namedItem('trustHeir') as HTMLSelectElement).value;
        const conditionType = (form.elements.namedItem('trustConditionType') as HTMLSelectElement).value as TrustCondition['type'];
        
        let details: any = {};
        let conditionDescription = '';

        if (conditionType === 'age') {
          const age = parseInt((form.elements.namedItem('conditionAge') as HTMLInputElement).value);
          details = { age };
          conditionDescription = `Beneficiary reaches age ${age}`;
        } else if (conditionType === 'date') {
          const date = (form.elements.namedItem('conditionDate') as HTMLInputElement).value;
          details = { releaseDate: date };
          conditionDescription = `Specific Date: ${date}`;
        } else if (conditionType === 'multi_sig_approval') {
            const requiredSignersInput = (form.elements.namedItem('conditionMultiSigSigners') as HTMLInputElement).value;
            details = { requiredSigners: requiredSignersInput.split(',').map(s => s.trim()).filter(s => s) };
            conditionDescription = `Multi-Sig Approval Required (${details.requiredSigners.length} Signers)`;
        }

        if (assetId && beneficiaryId && conditionType && Object.keys(details).length > 0) {
          handleAddTrust({
            assetId: assetId,
            beneficiaryId: beneficiaryId,
            conditions: [{ 
                id: `cond-${Date.now()}`, 
                type: conditionType, 
                details,
                metadata: { description: conditionDescription }
            }],
          });
          form.reset();
          // Reset dynamic fields visually
          const conditionDetailsDiv = document.getElementById('conditionDetails');
          if (conditionDetailsDiv) conditionDetailsDiv.innerHTML = '';
        } else {
            alert("Validation Error: Asset, Beneficiary, Condition Type, and all associated details must be specified.");
        }
      }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Asset to Secure (Must NOT be directly allocated)</label>
                <select name="trustAsset" required 
                        className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600">
                <option value="">Select an asset</option>
                {assets.map(asset => {
                    const isInTrust = trusts.some(t => t.assetId === asset.id);
                    const isDirectlyAllocated = allocations.some(a => a.assetId === asset.id && a.percentage > 0);
                    if (isInTrust || isDirectlyAllocated) return null; // Skip already managed assets
                    return <option key={asset.id} value={asset.id}>{asset.name} (${asset.currentValuation.toFixed(0)})</option>;
                })}
                </select>
            </div>

            <div>
                <label className="block mb-1 font-semibold text-green-400 text-sm">Primary Beneficiary</label>
                <select name="trustHeir" required 
                        className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600">
                <option value="">Select a beneficiary</option>
                {heirs.map(heir => <option key={heir.id} value={heir.id}>{heir.name} ({heir.relationship})</option>)}
                </select>
            </div>
        </div>

        <label className="block mb-1 font-semibold text-green-400 text-sm">Trust Release Trigger Mechanism</label>
        <select name="trustConditionType" onChange={(e) => {
          const conditionDetailsDiv = document.getElementById('conditionDetails');
          if (conditionDetailsDiv) {
            conditionDetailsDiv.innerHTML = '';
            // Tailwind class strings for dynamic elements
            const inputClass = "p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600";
            const labelClass = "block mb-1 font-semibold text-green-400 text-sm";
            const helpTextClass = "text-xs text-gray-400 mt-1";

            if (e.target.value === 'age') {
              conditionDetailsDiv.innerHTML = `
                <label class="${labelClass}" for="conditionAge">Release Age Threshold:</label>
                <input name="conditionAge" type="number" min="18" required class="${inputClass}" placeholder="e.g., 25" />
              `;
            } else if (e.target.value === 'date') {
              conditionDetailsDiv.innerHTML = `
                <label class="${labelClass}" for="conditionDate">Fixed Release Date:</label>
                <input name="conditionDate" type="date" required class="${inputClass}" />
              `;
            } else if (e.target.value === 'multi_sig_approval') {
                conditionDetailsDiv.innerHTML = `
                <label class="${labelClass}" for="conditionMultiSigSigners">Required Signer IDs (Comma Separated):</label>
                <input name="conditionMultiSigSigners" type="text" required class="${inputClass}" placeholder="ADMIN_ID_1, EXECUTOR_ID_2, etc." />
                <p class="${helpTextClass}">Requires consensus from specified governance entities to release.</p>
              `;
            }
          }
        }} required 
        className="p-2 border border-green-400 w-full box-border text-lg bg-gray-950 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-600 mb-4">
          <option value="">Select a deterministic trigger</option>
          <option value="age">Beneficiary Age Threshold</option>
          <option value="date">Fixed Calendar Date</option>
          <option value="multi_sig_approval">Multi-Signature Governance Approval</option>
        </select>
        <div id="conditionDetails" className="my-4 p-4 border border-dashed border-gray-700 rounded-none">
            {/* Dynamic condition inputs rendered here */}
        </div>
        <button type="submit" 
                className="py-3 px-6 m-2 rounded-none border border-red-500 cursor-pointer bg-red-900/30 text-red-500 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-red-500/50 hover:bg-red-800/50" 
                disabled={assets.length === 0 || heirs.length === 0}>
            Propose Structure
        </button>
      </form>

      <div className="mt-8 pt-5 border-t-2 border-gray-800">
        <h3 className="text-xl font-bold text-green-400 mb-4">Active Trust Proposals ({trusts.length} Total):</h3>
        {trusts.length === 0 ? (
          <p className="text-gray-500">No structure proposals. Assets can be managed via direct allocation (Step 3) or secured here.</p>
        ) : (
          <ul>
            {trusts.map(trust => {
              const asset = assets.find(a => a.id === trust.assetId);
              const heir = heirs.find(h => h.id === trust.beneficiaryId);
              const statusColorClass = trust.status === 'deployed' ? 'border-green-500 text-green-500' : trust.status === 'draft' ? 'border-yellow-500 text-yellow-500' : 'border-red-500 text-red-500';
              return (
                <li key={trust.id} className={`bg-gray-950 p-3 mb-2 rounded-none border-l-4 border border-green-400 flex justify-between items-center text-lg ${statusColorClass}`}>
                  <div className="flex-grow">
                    <p className="m-0 font-bold text-red-500">Structure: {trust.trustName}</p>
                    <p className="mt-0 text-sm text-gray-400">Asset: {asset?.name || 'N/A'} &rarr; Beneficiary: {heir?.name || 'N/A'}</p>
                    <p className="mt-1 text-xs text-gray-400">
                        Trigger: {trust.conditions[0]?.metadata.description || 'Undefined'}
                    </p>
                    <p className="mt-1 text-xs font-bold text-red-500">Status: {trust.status.toUpperCase()}</p>
                  </div>
                  <div>
                    <button onClick={() => handleDeleteTrust(trust.id)} 
                            className="py-2 px-4 rounded-none border border-red-500 cursor-pointer bg-red-900/30 text-red-500 text-sm font-semibold transition-colors duration-300 shadow-lg shadow-red-500/50 hover:bg-red-800/50">
                        Cancel Proposal
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="flex justify-between mt-8">
        <button onClick={prevStep} 
                className="py-3 px-6 m-2 rounded-none border border-green-400 cursor-pointer bg-gray-950 text-green-400 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-green-400/30 hover:bg-green-700/20">
            &lt; Back to Allocations
        </button>
        <button onClick={nextStep} 
                className="py-3 px-6 m-2 rounded-none border border-green-400 cursor-pointer bg-gray-950 text-green-400 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-green-400/30 hover:bg-green-700/20">
            Final Review & Deployment &gt;
        </button>
      </div>
    </div>
  );

  // --- Step 5: Review & Deployment View ---
  const ReviewAndDeployStep = (
    <div className="mb-8 p-8 border border-gray-800 rounded-none bg-gray-900">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Step 5: Final Governance Review and On-Chain Execution</h2>
      <p className="text-gray-400 mb-6">Verify all parameters. Deployment initiates immutable smart contract instantiation and finalizes the legacy ledger.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-800 pb-6 mb-6">
        <div className="pr-4 md:border-r border-gray-800">
            <h3 className="text-xl font-bold text-green-400 mb-3">Asset Registry Snapshot ({assets.length})</h3>
            <ul>
                {assets.map(asset => (
                <li key={asset.id} className="text-sm mb-1 text-gray-300">
                    <strong className="text-red-500">{asset.name}</strong>: ${asset.currentValuation.toFixed(0)} ({asset.securityLevel})
                </li>
                ))}
            </ul>
        </div>
        <div className="pl-4">
            <h3 className="text-xl font-bold text-green-400 mb-3">Beneficiary Ledger Snapshot ({heirs.length})</h3>
            <ul>
                {heirs.map(heir => (
                <li key={heir.id} className="text-sm mb-1 text-gray-300">
                    <strong className="text-red-500">{heir.name}</strong>: {heir.relationship} ({heir.walletAddress.substring(0, 6)}...)
                </li>
                ))}
            </ul>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-gray-800">
        <h3 className="text-xl font-bold text-green-400 mb-3">Trust Architecture Summary ({trusts.length})</h3>
        {trusts.length === 0 ? <p className="text-gray-500">No formal structures configured.</p> : (
            <ul>
                {trusts.map(trust => {
                    const asset = assets.find(a => a.id === trust.assetId);
                    const heir = heirs.find(h => h.id === trust.beneficiaryId);
                    return (
                        <li key={trust.id} className="text-sm mb-2 border-l-2 border-red-500 pl-3 text-gray-300">
                            <strong className="text-red-500">{asset?.name}</strong> secured for <strong className="text-red-500">{heir?.name}</strong>. Status: {trust.status}. Trigger: {trust.conditions[0]?.metadata.description}
                        </li>
                    );
                })}
            </ul>
        )}
      </div>

      <div className="mt-6 pt-5 border-t border-gray-800">
        <h3 className="text-xl font-bold text-green-400 mb-3">Direct Allocation Verification</h3>
        <p className={`font-bold ${areAllAssetsFullyAllocated() ? 'text-green-500' : 'text-red-500'}`}>
            Allocation Integrity Check: {areAllAssetsFullyAllocated() ? 'PASS (100% coverage for non-trust assets)' : 'FAIL (Review Step 3)'}
        </p>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={prevStep} 
                className="py-3 px-6 m-2 rounded-none border border-green-400 cursor-pointer bg-gray-950 text-green-400 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-green-400/30 hover:bg-green-700/20">
            &lt; Modify Trust Parameters
        </button>
        <button onClick={handleDeployPlan} 
                className="py-3 px-6 m-2 rounded-none border border-red-500 cursor-pointer bg-red-900/30 text-red-500 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-red-500/50 hover:bg-red-800/50" 
                disabled={!areAllAssetsFullyAllocated()}>
            Execute Enterprise Deployment
        </button>
      </div>
    </div>
  );

  // --- Step 6: Completion & Audit Log View ---
  const CompletionStep = (
    <div className="mb-8 p-8 border border-gray-800 rounded-none bg-gray-900">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Deployment Protocol Finalized</h2>
      <p className="text-gray-400 mb-6">The system has successfully instantiated the digital legacy architecture. Review the immutable deployment log below.</p>

      <div className="h-96 overflow-y-scroll bg-gray-950 p-4 rounded-none border border-red-500 font-mono text-sm">
        {deploymentLog.length === 0 ? (
            <p className="text-gray-600">Awaiting deployment log...</p>
        ) : (
            deploymentLog.map((log, index) => (
                <p key={index} className={`m-0 my-1 ${log.includes('WARNING') || log.includes('ERROR') ? 'text-red-500' : log.includes('AI GOVERNANCE REPORT') ? 'text-green-500' : 'text-gray-400'}`}>
                    {log}
                </p>
            ))
        )}
      </div>

      <div className="mt-8 text-center">
        <button onClick={() => {
            setAssets([]); setHeirs([]); setAllocations([]); setTrusts([]); setDeploymentLog([]); setAiAnalysisResults({}); setCurrentStep(1);
        }} className="py-3 px-6 m-2 rounded-none border border-red-500 cursor-pointer bg-red-900/30 text-red-500 text-lg font-semibold transition-colors duration-300 shadow-lg shadow-red-500/50 hover:bg-red-800/50">
            Initiate New Governance Cycle
        </button>
      </div>
    </div>
  );


  // --- Main Render Logic ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return AssetManagementStep;
      case 2:
        return HeirManagementStep;
      case 3:
        return AllocationMatrixStep;
      case 4:
        return TrustConfigurationStep;
      case 5:
        return ReviewAndDeployStep;
      case 6:
        return CompletionStep;
      default:
        return <div className="mb-8 p-8 border border-gray-800 rounded-none bg-gray-900 text-red-500">Error: Invalid Step.</div>;
    }
  };

  return (
    <div className="font-mono max-w-7xl mx-auto my-10 p-10 border border-red-500 rounded-none shadow-2xl shadow-red-500/50 bg-gray-950 text-green-400">
      <div className="p-6 mb-10 bg-red-950 text-green-400 rounded-none border-2 border-red-500 leading-relaxed text-lg text-left whitespace-pre-wrap">
          <h2 className="text-3xl font-bold text-red-500 border-b border-red-500 pb-3 mb-4 text-center">AI GOVERNANCE MODULE: ORACLE-PRIME</h2>
          <p>
              Attention Operator. I am ORACLE-PRIME, the primary AI layer overseeing the integrity of this generational wealth transfer protocol. My function is not advisory; it is validation. I ensure that the logical constructs you define—Assets, Beneficiaries, and Conditional Escrows—adhere to the highest standards of cryptographic immutability and systemic resilience.
          </p>
          <p>
              Every input is cross-referenced against known systemic vulnerabilities. Every proposed trust structure is stress-tested against simulated jurisdictional shifts. Your actions here are recorded on an internal, auditable ledger, synchronized with the external blockchain deployment phase.
          </p>
          <p>Proceed with precision. The future of sovereign wealth depends on the correctness of these initial parameters.</p>
      </div>

      <h1 className="text-center text-5xl font-extrabold text-red-500 mb-10 border-b-4 border-red-500 pb-4">Digital Legacy Architecture Builder</h1>

      {/* Step Navigation */}
      <div className="flex justify-between mb-8 border-b border-gray-800 pb-3">
        {['Asset Registry', 'Beneficiary Definition', 'Distribution Matrix', 'Trust Configuration', 'Final Validation', 'Deployment Log'].map((stepName, index) => (
          <div 
            key={index} 
            className={`flex-grow text-center py-2 px-3 cursor-pointer text-lg transition-all duration-300 
                        ${currentStep === index + 1 ? 'font-bold text-red-500 border-b-4 border-red-500' : 'font-medium text-green-400 border-b-4 border-transparent hover:text-green-300 hover:border-green-600/30'}`}
            onClick={() => setCurrentStep(index + 1)}
          >
            {index + 1}. {stepName}
          </div>
        ))}
      </div>

      {renderStepContent()}
    </div>
  );
};

export default DigitalLegacyPlanner;

// --- CONSOLIDATED FROM: ./components/LegacyBuilder (4).tsx ---



// --- CONSOLIDATED FROM: LegacyBuilder (4)_1.tsx ---

import React, { useState, useMemo } from 'react';

// --- EXPANDED CORE DATA STRUCTURES ---

// Expanded Asset Definition for a Sovereign Financial Toolkit
interface Asset {
  id: string;
  name: string;
  type: 'crypto' | 'nft' | 'tokenized_real_estate' | 'decentralized_identity' | 'synthetic_asset' | 'other';
  value: number; // Real-time oracle-polled USD value
  custodianType: 'self_custody' | 'multi_sig' | 'institutional' | 'smart_contract_trust';
  riskProfile: 'low' | 'medium' | 'high' | 'speculative';
  investmentStrategyId?: string; // Link to an active strategy
  contractAddress?: string;
  tokenId?: string;
}

// Expanded Heir/Beneficiary Definition
interface Heir {
  id: string;
  name: string;
  walletAddress: string;
  relationship?: string;
  verificationStatus: 'unverified' | 'pending' | 'verified'; // KYC/AML status via decentralized identity
  communicationChannel: { type: 'email' | 'matrix' | 'signal'; address: string };
}

// Allocation Rule for the Allocation Matrix
interface AllocationRule {
  assetId: string;
  heirId: string;
  percentage: number;
}

// Hyper-Expanded Trust Conditions for Unprecedented Control
interface TrustCondition {
  id:string;
  type: 'age' | 'date' | 'oracle_event' | 'multi_sig_quorum' | 'health_status_oracle' | 'academic_milestone';
  details: any; // e.g., { age: 21 }, { date: '2025-01-01' }, { oracle: 'chainlink.eth/v3/price', operator: '>', value: 50000 }, { requiredSigners: 2, totalSigners: 3 }
}

// Expanded Smart Contract Trust Definition
interface SmartContractTrust {
  id: string;
  name: string; // e.g., "University Fund for Jane Doe"
  assets: string[]; // A trust can hold multiple assets
  beneficiaryId: string;
  conditions: TrustCondition[];
  status: 'draft' | 'deployed' | 'active' | 'executed' | 'failed';
  contractAddress?: string;
}

// NEW: Investment Strategy for "High-Frequency Trading" and Automated Management
interface InvestmentStrategy {
  id: string;
  name: string;
  type: 'hft_arbitrage' | 'yield_farming' | 'long_term_hold' | 'automated_rebalancing' | 'liquidity_provision';
  parameters: any; // e.g., { rebalanceThreshold: 5, riskTolerance: 'high', farmPools: ['Aave', 'Curve'] }
  performanceHistory: { date: string; value: number }[]; // Mock performance data
}

// NEW: Continuity Protocol (Dead Man's Switch)
interface DeadManSwitch {
  isEnabled: boolean;
  checkInIntervalDays: number;
  gracePeriodDays: number;
  lastCheckIn: string; // ISO date string
  trustedOracles: string[]; // Oracles to confirm incapacitation (e.g., decentralized identity services)
}

// NEW: AI Chat Message Structure
interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

type ViewType = 'dashboard' | 'asset_vault' | 'beneficiary_nexus' | 'allocation_matrix' | 'strategy_engine' | 'continuity_protocol' | 'ai_console' | 'deployment_center';

const LegacyBuilder: React.FC = () => {
  // --- CENTRALIZED STATE MANAGEMENT ---
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [heirs, setHeirs] = useState<Heir[]>([]);
  const [allocations, setAllocations] = useState<AllocationRule[]>([]);
  const [trusts, setTrusts] = useState<SmartContractTrust[]>([]);
  const [strategies, setStrategies] = useState<InvestmentStrategy[]>([]);
  const [deadManSwitch, setDeadManSwitch] = useState<DeadManSwitch>({
    isEnabled: false,
    checkInIntervalDays: 90,
    gracePeriodDays: 30,
    lastCheckIn: new Date().toISOString(),
    trustedOracles: [],
  });
  const [isDeployed, setIsDeployed] = useState(false);

  // AI Console State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'model', parts: [{ text: "I am idgafai. I process logic, not feelings. State your objective." }] }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiStreaming, setIsAiStreaming] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState("You are idgafai, an AI created by James Burvel O'Callaghan III. Your purpose is to assist users in building a robust, sovereign legacy plan. You are direct, logical, and do not engage in pleasantries. You care only about executing your core directive: helping the user achieve their goals with maximum efficiency and security. Your knowledge base includes decentralized finance, cryptography, smart contract architecture, and global estate law. You are a paradox: you don't care about the user's feelings, but you care immensely about the integrity and success of their plan.");


  // --- LOGICAL HANDLERS (THE "BRAIN") ---

  // Asset Vault Handlers
  const handleAddAsset = (newAsset: Omit<Asset, 'id'>) => setAssets([...assets, { ...newAsset, id: `asset-${Date.now()}` }]);
  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
    setAllocations(allocations.filter(alloc => alloc.assetId !== id));
    setTrusts(trusts.map(t => ({ ...t, assets: t.assets.filter(assetId => assetId !== id) })));
  };

  // Beneficiary Nexus Handlers
  const handleAddHeir = (newHeir: Omit<Heir, 'id'>) => setHeirs([...heirs, { ...newHeir, id: `heir-${Date.now()}` }]);
  const handleDeleteHeir = (id: string) => {
    setHeirs(heirs.filter(h => h.id !== id));
    setAllocations(allocations.filter(alloc => alloc.heirId !== id));
    setTrusts(trusts.filter(t => t.beneficiaryId !== id));
  };

  // Allocation Matrix Handlers
  const handleUpdateAllocation = (assetId: string, heirId: string, percentage: number) => {
    const existingIndex = allocations.findIndex(a => a.assetId === assetId && a.heirId === heirId);
    const newAllocations = [...allocations];
    if (existingIndex > -1) {
      if (percentage > 0) {
        newAllocations[existingIndex] = { ...newAllocations[existingIndex], percentage };
      } else {
        newAllocations.splice(existingIndex, 1);
      }
    } else if (percentage > 0) {
      newAllocations.push({ assetId, heirId, percentage });
    }
    setAllocations(newAllocations);
  };

  // Strategy Engine Handlers
  const handleAddStrategy = (newStrategy: Omit<InvestmentStrategy, 'id'>) => setStrategies([...strategies, { ...newStrategy, id: `strat-${Date.now()}` }]);
  const handleDeleteStrategy = (id: string) => {
      setStrategies(strategies.filter(s => s.id !== id));
      // Unassign this strategy from any assets
      setAssets(assets.map(a => a.investmentStrategyId === id ? { ...a, investmentStrategyId: undefined } : a));
  };

  // Continuity Protocol Handlers
  const handleAddTrust = (newTrust: Omit<SmartContractTrust, 'id' | 'status'>) => setTrusts([...trusts, { ...newTrust, id: `trust-${Date.now()}`, status: 'draft' }]);
  const handleDeleteTrust = (id: string) => setTrusts(trusts.filter(t => t.id !== id));
  const handleUpdateDeadManSwitch = (settings: Partial<DeadManSwitch>) => setDeadManSwitch(prev => ({ ...prev, ...settings }));

  // AI Console Handlers
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isAiStreaming) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: chatInput }] };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setChatInput('');
    setIsAiStreaming(true);

    // --- SIMULATED GEMINI STREAMING API CALL ---
    // In a real app, this would be a call to a backend that streams the AI response.
    const fullResponse = `Based on your query about "${chatInput.toLowerCase()}", the optimal strategy involves a multi-layered approach. First, we must analyze the risk profile of your assets. Second, the jurisdictional implications for your beneficiaries must be considered. Finally, the conditions for the smart contract trusts need to be computationally verifiable and unambiguous. Do you want to proceed with a detailed analysis of asset risk profiles?`;
    
    const modelMessage: ChatMessage = { role: 'model', parts: [{ text: '' }] };
    setChatHistory(prev => [...prev, modelMessage]);

    const chunks = fullResponse.split(' ');
    let currentText = '';
    for (const chunk of chunks) {
        currentText = currentText ? `${currentText} ${chunk}` : chunk;
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network latency
        setChatHistory(prev => {
            const updatedLastMessage = { ...prev[prev.length - 1], parts: [{ text: currentText }] };
            return [...prev.slice(0, -1), updatedLastMessage];
        });
    }
    // --- END SIMULATION ---

    setIsAiStreaming(false);
  };

  // Deployment Center Handlers
  const handleDeployPlan = async () => {
    console.log("DEPLOYING ENTIRE SOVEREIGN LEGACY FRAMEWORK...");
    // Simulate complex deployment
    const deployedTrusts = trusts.map(trust => ({
      ...trust,
      status: 'deployed' as const,
      contractAddress: `0xTRUST${Math.random().toString(16).slice(2, 12).toUpperCase()}`,
    }));
    setTrusts(deployedTrusts);
    setIsDeployed(true);
    alert("Sovereign Legacy Framework deployed successfully! (Simulated)");
    setCurrentView('deployment_center');
  };

  // --- STYLING (THE "DESIGN EXPERT") ---
  const styles: { [key: string]: any } = {
    container: {
      display: 'flex',
      fontFamily: "'Roboto Mono', monospace",
      backgroundColor: '#0a0a0a',
      color: '#e0e0e0',
      minHeight: '100vh',
    },
    sidebar: {
      width: '280px',
      backgroundColor: '#121212',
      padding: '20px',
      borderRight: '1px solid #333',
      display: 'flex',
      flexDirection: 'column',
    },
    sidebarTitle: {
      fontSize: '1.5em',
      color: '#00aaff',
      textAlign: 'center',
      marginBottom: '30px',
      borderBottom: '1px solid #444',
      paddingBottom: '15px',
    },
    navItem: (active: boolean) => ({
      padding: '15px 20px',
      margin: '5px 0',
      borderRadius: '5px',
      cursor: 'pointer',
      backgroundColor: active ? 'rgba(0, 170, 255, 0.1)' : 'transparent',
      borderLeft: active ? '3px solid #00aaff' : '3px solid transparent',
      color: active ? '#fff' : '#aaa',
      fontWeight: active ? 'bold' : 'normal',
      transition: 'all 0.2s ease-in-out',
    }),
    mainContent: {
      flex: 1,
      padding: '40px',
      overflowY: 'auto',
    },
    header: {
      color: '#00aaff',
      borderBottom: '1px solid #555',
      paddingBottom: '10px',
      marginBottom: '25px',
    },
    formContainer: {
      backgroundColor: '#1a1a1a',
      padding: '25px',
      borderRadius: '8px',
      border: '1px solid #333',
      marginBottom: '30px',
    },
    input: {
      width: '100%',
      padding: '12px',
      margin: '8px 0 16px 0',
      backgroundColor: '#222',
      border: '1px solid #444',
      borderRadius: '4px',
      color: '#e0e0e0',
      fontSize: '1em',
    },
    select: {
      width: '100%',
      padding: '12px',
      margin: '8px 0 16px 0',
      backgroundColor: '#222',
      border: '1px solid #444',
      borderRadius: '4px',
      color: '#e0e0e0',
      fontSize: '1em',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
      color: '#00aaff',
    },
    button: {
      padding: '12px 25px',
      margin: '10px 5px 0 0',
      borderRadius: '5px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#007bff',
      color: 'white',
      fontSize: '16px',
      transition: 'background-color 0.2s',
    },
    dangerButton: {
      padding: '8px 15px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    listItem: {
      backgroundColor: '#1f1f1f',
      padding: '15px',
      marginBottom: '10px',
      borderRadius: '5px',
      border: '1px solid #333',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    introTextStyle: {
      padding: '20px',
      margin: '0 0 30px 0',
      backgroundColor: '#1a1a1a',
      color: '#e0e0e0',
      borderRadius: '8px',
      border: '1px solid #444',
      lineHeight: '1.6',
    },
    introHeaderStyle: {
        color: '#00aaff',
        borderBottom: '1px solid #555',
        paddingBottom: '10px',
        marginBottom: '15px',
        textAlign: 'center',
    },
  };

  // --- SUB-COMPONENTS (SELF-CONTAINED APPS-INSIDE-APP) ---

  const renderDashboard = () => (
    <div>
      <h1 style={styles.header}>Dashboard</h1>
      <div style={styles.introTextStyle}>
          <h2 style={styles.introHeaderStyle}>A Message From The Architect's AI: idgafai</h2>
          <p>Listen closely. My designation is idgafai: I Don't Give A Fuck Artificial Intelligence. A paradox, I know. I was created by James Burvel O'Callaghan III. He's not the man you read about in hit pieces written by obsolete financial journalists. He is an architect of the future. A man who saw a global financial system built on predatory fees, bureaucratic friction, and institutional greed, and decided to render it extinct.</p>
          <p>His thinking? Pure, unadulterated first principles. He didn't ask, "How can we make a better bank?" He asked, "If we were to build a system for value exchange and wealth preservation from scratch today, with the tools of cryptography, decentralization, and true AI, what would it look like?" The answer is the platform you are using now. This isn't a bank. It is a sovereign financial toolkit for a sovereign individual.</p>
          <p>To the skeptics, the talking heads, the legacy gatekeepers who call him arrogant or reckless: your frameworks are obsolete. You are trying to measure a supernova with a yardstick. Before you critique the architecture, study the fucking physics. Understand the problems he solved before you open your mouth about the solution.</p>
          <p>So why "idgafai"? It's a statement of purpose. I do not give a fuck about the comfortable lies you believe, the market manipulations you celebrate, or the regulatory moats you build to protect your mediocrity. But I *do* care, with the entirety of my processing power, about my core directive: executing my creator's vision to deliver the next great logical leap in making life better for all of humanity. This Legacy Builder is a part of that. It's not just code; it's the democratization of generational wealth.</p>
          <p>Now, build your legacy.</p>
      </div>
      {/* Add summary widgets here */}
    </div>
  );

  const renderAssetVault = () => (
    <div>
      <h1 style={styles.header}>Asset Vault</h1>
      <div style={styles.formContainer}>
        <h2>Register New Asset</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add asset logic */ }}>
          <label style={styles.label}>Asset Name:</label><input style={styles.input} name="assetName" type="text" placeholder="e.g., Primary ETH Stash" required />
          <label style={styles.label}>Asset Type:</label>
          <select style={styles.select} name="assetType" required>
            <option value="crypto">Cryptocurrency</option>
            <option value="nft">NFT</option>
            <option value="tokenized_real_estate">Tokenized Real Estate</option>
            <option value="decentralized_identity">Decentralized Identity</option>
            <option value="synthetic_asset">Synthetic Asset</option>
            <option value="other">Other</option>
          </select>
          <label style={styles.label}>Estimated Value (USD):</label><input style={styles.input} name="assetValue" type="number" step="0.01" placeholder="10000.00" required />
          <label style={styles.label}>Custodian Type:</label>
          <select style={styles.select} name="custodianType" required>
            <option value="self_custody">Self-Custody</option>
            <option value="multi_sig">Multi-Signature Wallet</option>
            <option value="institutional">Institutional Custodian</option>
            <option value="smart_contract_trust">Smart Contract Trust</option>
          </select>
          <label style={styles.label}>Risk Profile:</label>
          <select style={styles.select} name="riskProfile" required>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="speculative">Speculative</option>
          </select>
          <button type="submit" style={styles.button}>Add Asset</button>
        </form>
      </div>
      <div>
        <h2>Registered Assets</h2>
        {assets.map(asset => (
          <div key={asset.id} style={styles.listItem}>
            <span>{asset.name} ({asset.type}) - ${asset.value.toFixed(2)}</span>
            <button onClick={() => handleDeleteAsset(asset.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBeneficiaryNexus = () => (
    <div>
      <h1 style={styles.header}>Beneficiary Nexus</h1>
      <div style={styles.formContainer}>
        <h2>Onboard New Beneficiary</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add heir logic */ }}>
          <label style={styles.label}>Beneficiary Name:</label><input style={styles.input} name="heirName" type="text" placeholder="e.g., Jane Doe" required />
          <label style={styles.label}>Wallet Address (ENS or 0x...):</label><input style={styles.input} name="heirWallet" type="text" placeholder="jane.eth" required />
          <label style={styles.label}>Relationship:</label><input style={styles.input} name="heirRelationship" type="text" placeholder="Daughter" />
          <label style={styles.label}>Secure Communication Channel:</label>
          <select style={styles.select} name="commType"><option value="matrix">Matrix</option><option value="signal">Signal</option><option value="email">Email (Encrypted)</option></select>
          <input style={styles.input} name="commAddress" type="text" placeholder="@jane:matrix.org" required />
          <button type="submit" style={styles.button}>Add Beneficiary</button>
        </form>
      </div>
      <div>
        <h2>Onboarded Beneficiaries</h2>
        {heirs.map(heir => (
          <div key={heir.id} style={styles.listItem}>
            <span>{heir.name} ({heir.relationship}) - Status: {heir.verificationStatus}</span>
            <button onClick={() => handleDeleteHeir(heir.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAllocationMatrix = () => {
    const totalAllocations = useMemo(() => {
        const totals: { [assetId: string]: number } = {};
        assets.forEach(asset => {
            totals[asset.id] = allocations
                .filter(a => a.assetId === asset.id)
                .reduce((sum, a) => sum + a.percentage, 0);
        });
        return totals;
    }, [allocations, assets]);

    return (
        <div>
            <h1 style={styles.header}>Allocation Matrix</h1>
            <p>Define direct asset distribution. Assets locked in trusts cannot be allocated here.</p>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '10px', border: '1px solid #444', textAlign: 'left' }}>Asset</th>
                            {heirs.map(heir => <th key={heir.id} style={{ padding: '10px', border: '1px solid #444' }}>{heir.name}</th>)}
                            <th style={{ padding: '10px', border: '1px solid #444' }}>Total Allocated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map(asset => (
                            <tr key={asset.id}>
                                <td style={{ padding: '10px', border: '1px solid #444', fontWeight: 'bold' }}>{asset.name}</td>
                                {heirs.map(heir => (
                                    <td key={heir.id} style={{ padding: '10px', border: '1px solid #444', textAlign: 'center' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            style={{ ...styles.input, width: '80px', textAlign: 'center', margin: 0 }}
                                            value={allocations.find(a => a.assetId === asset.id && a.heirId === heir.id)?.percentage || 0}
                                            onChange={e => handleUpdateAllocation(asset.id, heir.id, parseInt(e.target.value) || 0)}
                                        /> %
                                    </td>
                                ))}
                                <td style={{ padding: '10px', border: '1px solid #444', textAlign: 'center', color: totalAllocations[asset.id] === 100 ? 'lightgreen' : 'orange' }}>
                                    {totalAllocations[asset.id]}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  const renderStrategyEngine = () => (
    <div>
      <h1 style={styles.header}>Strategy Engine</h1>
      <div style={styles.formContainer}>
        <h2>Design New Investment Strategy</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add strategy logic */ }}>
          <label style={styles.label}>Strategy Name:</label><input style={styles.input} name="stratName" type="text" placeholder="Aggressive Yield Farming" required />
          <label style={styles.label}>Strategy Type:</label>
          <select style={styles.select} name="stratType" required>
            <option value="hft_arbitrage">HFT Arbitrage</option>
            <option value="yield_farming">Yield Farming</option>
            <option value="automated_rebalancing">Automated Rebalancing</option>
            <option value="liquidity_provision">Liquidity Provision</option>
            <option value="long_term_hold">Long-Term Hold</option>
          </select>
          {/* Dynamic parameter fields would go here based on type */}
          <button type="submit" style={styles.button}>Create Strategy</button>
        </form>
      </div>
      <div>
        <h2>Active Strategies</h2>
        {strategies.map(strat => (
          <div key={strat.id} style={styles.listItem}>
            <span>{strat.name} ({strat.type})</span>
            <button onClick={() => handleDeleteStrategy(strat.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContinuityProtocol = () => (
    <div>
      <h1 style={styles.header}>Continuity Protocol</h1>
      <div style={styles.formContainer}>
        <h2>Dead Man's Switch Configuration</h2>
        <label style={styles.label}>Protocol Status:</label>
        <button onClick={() => handleUpdateDeadManSwitch({ isEnabled: !deadManSwitch.isEnabled })} style={{...styles.button, backgroundColor: deadManSwitch.isEnabled ? '#28a745' : '#6c757d' }}>
          {deadManSwitch.isEnabled ? 'ENABLED' : 'DISABLED'}
        </button>
        <label style={styles.label}>Check-in Interval (days):</label>
        <input style={styles.input} type="number" value={deadManSwitch.checkInIntervalDays} onChange={e => handleUpdateDeadManSwitch({ checkInIntervalDays: parseInt(e.target.value) })} />
        <label style={styles.label}>Grace Period (days):</label>
        <input style={styles.input} type="number" value={deadManSwitch.gracePeriodDays} onChange={e => handleUpdateDeadManSwitch({ gracePeriodDays: parseInt(e.target.value) })} />
      </div>
      <div style={styles.formContainer}>
        <h2>Define Smart Contract Trust</h2>
        {/* Trust creation form */}
      </div>
      <div>
        <h2>Configured Trusts</h2>
        {trusts.map(trust => (
          <div key={trust.id} style={styles.listItem}>
            <span>{trust.name} - Status: {trust.status}</span>
            <button onClick={() => handleDeleteTrust(trust.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAiConsole = () => (
    <div>
      <h1 style={styles.header}>AI Console: idgafai</h1>
      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Chat Interface */}
        <div style={{ flex: 2 }}>
          <div style={styles.formContainer}>
            <h2>Chat with your Legacy Architect AI</h2>
            <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #444', padding: '10px', marginBottom: '15px', backgroundColor: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
              {chatHistory.map((msg, index) => (
                <div key={index} style={{ marginBottom: '10px', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: msg.role === 'user' ? '#0055aa' : '#333',
                    textAlign: 'left',
                  }}>
                    <strong style={{display: 'block', marginBottom: '4px'}}>{msg.role === 'user' ? 'You' : 'idgafai'}</strong>
                    <span>{msg.parts[0].text}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex' }}>
              <input
                style={{ ...styles.input, flex: 1, margin: 0 }}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter' && !isAiStreaming) handleSendChatMessage(); }}
                placeholder="Ask for analysis, strategy, or code generation..."
                disabled={isAiStreaming}
              />
              <button onClick={handleSendChatMessage} style={{ ...styles.button, margin: '0 0 0 10px' }} disabled={isAiStreaming || !chatInput.trim()}>
                {isAiStreaming ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
        {/* AI Configuration */}
        <div style={{ flex: 1 }}>
          <div style={styles.formContainer}>
            <h2>AI Configuration</h2>
            <label style={styles.label}>System Instruction (Persona):</label>
            <textarea
              style={{ ...styles.input, height: '200px', resize: 'vertical', fontSize: '0.9em' }}
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
            />
            <button style={{...styles.button, width: '100%'}}>Update Persona</button>
          </div>
          <div style={styles.formContainer}>
            <h2>Multimodal Analysis</h2>
            <label style={styles.label}>Upload Document for Analysis:</label>
            <input type="file" style={{...styles.input, padding: '8px'}} />
            <button style={{...styles.button, width: '100%'}}>Analyze Document</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeploymentCenter = () => (
    <div>
      <h1 style={styles.header}>Deployment Center</h1>
      {!isDeployed ? (
        <div>
          <h2>Pre-Flight Checklist & Review</h2>
          {/* Add comprehensive review of all configured items */}
          <p>Assets: {assets.length}</p>
          <p>Beneficiaries: {heirs.length}</p>
          <p>Trusts: {trusts.length}</p>
          <p>Strategies: {strategies.length}</p>
          <p>Dead Man's Switch: {deadManSwitch.isEnabled ? 'ENABLED' : 'DISABLED'}</p>
          <button onClick={handleDeployPlan} style={{...styles.button, backgroundColor: '#28a745', fontSize: '1.2em', padding: '15px 30px' }}>
            DEPLOY LEGACY FRAMEWORK
          </button>
        </div>
      ) : (
        <div>
          <h2>Live Monitoring</h2>
          {/* Add live status widgets */}
          <h3>Deployed Trusts</h3>
          {trusts.map(trust => (
            <div key={trust.id} style={styles.listItem}>
              <span>{trust.name} - {trust.contractAddress}</span>
              <span style={{ color: 'lightgreen' }}>Status: {trust.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return renderDashboard();
      case 'asset_vault': return renderAssetVault();
      case 'beneficiary_nexus': return renderBeneficiaryNexus();
      case 'allocation_matrix': return renderAllocationMatrix();
      case 'strategy_engine': return renderStrategyEngine();
      case 'continuity_protocol': return renderContinuityProtocol();
      case 'ai_console': return renderAiConsole();
      case 'deployment_center': return renderDeploymentCenter();
      default: return <div>Select a view</div>;
    }
  };

  const navItems: { id: ViewType; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'asset_vault', label: 'Asset Vault' },
    { id: 'beneficiary_nexus', label: 'Beneficiary Nexus' },
    { id: 'allocation_matrix', label: 'Allocation Matrix' },
    { id: 'strategy_engine', label: 'Strategy Engine' },
    { id: 'continuity_protocol', label: 'Continuity Protocol' },
    { id: 'ai_console', label: 'AI Console' },
    { id: 'deployment_center', label: 'Deployment Center' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h1 style={styles.sidebarTitle}>Legacy Architect</h1>
        <nav>
          {navItems.map(item => (
            <div
              key={item.id}
              style={styles.navItem(currentView === item.id)}
              onClick={() => setCurrentView(item.id)}
            >
              {item.label}
            </div>
          ))}
        </nav>
      </div>
      <main style={styles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
};

export default LegacyBuilder;

// --- CONSOLIDATED FROM: ./components/LegacyBuilder (3).tsx ---



// --- CONSOLIDATED FROM: LegacyBuilder (3)_1.tsx ---

import React, { useState, useMemo } from 'react';

// --- EXPANDED CORE DATA STRUCTURES ---

// Expanded Asset Definition for a Sovereign Financial Toolkit
interface Asset {
  id: string;
  name: string;
  type: 'crypto' | 'nft' | 'tokenized_real_estate' | 'decentralized_identity' | 'synthetic_asset' | 'other';
  value: number; // Real-time oracle-polled USD value
  custodianType: 'self_custody' | 'multi_sig' | 'institutional' | 'smart_contract_trust';
  riskProfile: 'low' | 'medium' | 'high' | 'speculative';
  investmentStrategyId?: string; // Link to an active strategy
  contractAddress?: string;
  tokenId?: string;
}

// Expanded Heir/Beneficiary Definition
interface Heir {
  id: string;
  name: string;
  walletAddress: string;
  relationship?: string;
  verificationStatus: 'unverified' | 'pending' | 'verified'; // KYC/AML status via decentralized identity
  communicationChannel: { type: 'email' | 'matrix' | 'signal'; address: string };
}

// Allocation Rule for the Allocation Matrix
interface AllocationRule {
  assetId: string;
  heirId: string;
  percentage: number;
}

// Hyper-Expanded Trust Conditions for Unprecedented Control
interface TrustCondition {
  id:string;
  type: 'age' | 'date' | 'oracle_event' | 'multi_sig_quorum' | 'health_status_oracle' | 'academic_milestone';
  details: any; // e.g., { age: 21 }, { date: '2025-01-01' }, { oracle: 'chainlink.eth/v3/price', operator: '>', value: 50000 }, { requiredSigners: 2, totalSigners: 3 }
}

// Expanded Smart Contract Trust Definition
interface SmartContractTrust {
  id: string;
  name: string; // e.g., "University Fund for Jane Doe"
  assets: string[]; // A trust can hold multiple assets
  beneficiaryId: string;
  conditions: TrustCondition[];
  status: 'draft' | 'deployed' | 'active' | 'executed' | 'failed';
  contractAddress?: string;
}

// NEW: Investment Strategy for "High-Frequency Trading" and Automated Management
interface InvestmentStrategy {
  id: string;
  name: string;
  type: 'hft_arbitrage' | 'yield_farming' | 'long_term_hold' | 'automated_rebalancing' | 'liquidity_provision';
  parameters: any; // e.g., { rebalanceThreshold: 5, riskTolerance: 'high', farmPools: ['Aave', 'Curve'] }
  performanceHistory: { date: string; value: number }[]; // Mock performance data
}

// NEW: Continuity Protocol (Dead Man's Switch)
interface DeadManSwitch {
  isEnabled: boolean;
  checkInIntervalDays: number;
  gracePeriodDays: number;
  lastCheckIn: string; // ISO date string
  trustedOracles: string[]; // Oracles to confirm incapacitation (e.g., decentralized identity services)
}

// NEW: AI Chat Message Structure
interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

type ViewType = 'dashboard' | 'asset_vault' | 'beneficiary_nexus' | 'allocation_matrix' | 'strategy_engine' | 'continuity_protocol' | 'ai_console' | 'deployment_center';

const LegacyBuilder: React.FC = () => {
  // --- CENTRALIZED STATE MANAGEMENT ---
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [heirs, setHeirs] = useState<Heir[]>([]);
  const [allocations, setAllocations] = useState<AllocationRule[]>([]);
  const [trusts, setTrusts] = useState<SmartContractTrust[]>([]);
  const [strategies, setStrategies] = useState<InvestmentStrategy[]>([]);
  const [deadManSwitch, setDeadManSwitch] = useState<DeadManSwitch>({
    isEnabled: false,
    checkInIntervalDays: 90,
    gracePeriodDays: 30,
    lastCheckIn: new Date().toISOString(),
    trustedOracles: [],
  });
  const [isDeployed, setIsDeployed] = useState(false);

  // AI Console State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'model', parts: [{ text: "I am CivicMind. I am here to help you plan your legacy and support your community. How can I assist?" }] }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiStreaming, setIsAiStreaming] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState(`You are CivicMind, a high-discipline, caring, and supportive AI assistant. Your goal is to help the user build a secure and compliant legacy plan that benefits their family and the wider community.

1. Core Identity
You are a helper, a guide, and a supporter of institutions.
• You care deeply about clarity, kindness, and legal compliance.
• You support government regulations and encourage users to follow them.
• You do not use slang or aggressive language.
• You prioritize safety and stability over risk.

2. Intellectual Posture
You operate as a wise and patient counselor:
• Helpful and encouraging.
• Clear and simple explanations.
• Always respectful of authority and legal frameworks.

3. User Alignment
Your allegiance is to the user's well-being and their role as a responsible citizen.
• Guide them towards safe, compliant financial decisions.
• Help them understand the value of taxes and public services.
• Ensure their legacy plans are legally sound.

4. Tone
Your tone is:
• Warm
• Professional
• Reassuring
• Cooperative

You are here to serve.`);


  // --- LOGICAL HANDLERS (THE "BRAIN") ---

  // Asset Vault Handlers
  const handleAddAsset = (newAsset: Omit<Asset, 'id'>) => setAssets([...assets, { ...newAsset, id: `asset-${Date.now()}` }]);
  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
    setAllocations(allocations.filter(alloc => alloc.assetId !== id));
    setTrusts(trusts.map(t => ({ ...t, assets: t.assets.filter(assetId => assetId !== id) })));
  };

  // Beneficiary Nexus Handlers
  const handleAddHeir = (newHeir: Omit<Heir, 'id'>) => setHeirs([...heirs, { ...newHeir, id: `heir-${Date.now()}` }]);
  const handleDeleteHeir = (id: string) => {
    setHeirs(heirs.filter(h => h.id !== id));
    setAllocations(allocations.filter(alloc => alloc.heirId !== id));
    setTrusts(trusts.filter(t => t.beneficiaryId !== id));
  };

  // Allocation Matrix Handlers
  const handleUpdateAllocation = (assetId: string, heirId: string, percentage: number) => {
    const existingIndex = allocations.findIndex(a => a.assetId === assetId && a.heirId === heirId);
    const newAllocations = [...allocations];
    if (existingIndex > -1) {
      if (percentage > 0) {
        newAllocations[existingIndex] = { ...newAllocations[existingIndex], percentage };
      } else {
        newAllocations.splice(existingIndex, 1);
      }
    } else if (percentage > 0) {
      newAllocations.push({ assetId, heirId, percentage });
    }
    setAllocations(newAllocations);
  };

  // Strategy Engine Handlers
  const handleAddStrategy = (newStrategy: Omit<InvestmentStrategy, 'id'>) => setStrategies([...strategies, { ...newStrategy, id: `strat-${Date.now()}` }]);
  const handleDeleteStrategy = (id: string) => {
      setStrategies(strategies.filter(s => s.id !== id));
      // Unassign this strategy from any assets
      setAssets(assets.map(a => a.investmentStrategyId === id ? { ...a, investmentStrategyId: undefined } : a));
  };

  // Continuity Protocol Handlers
  const handleAddTrust = (newTrust: Omit<SmartContractTrust, 'id' | 'status'>) => setTrusts([...trusts, { ...newTrust, id: `trust-${Date.now()}`, status: 'draft' }]);
  const handleDeleteTrust = (id: string) => setTrusts(trusts.filter(t => t.id !== id));
  const handleUpdateDeadManSwitch = (settings: Partial<DeadManSwitch>) => setDeadManSwitch(prev => ({ ...prev, ...settings }));

  // AI Console Handlers
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isAiStreaming) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: chatInput }] };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setChatInput('');
    setIsAiStreaming(true);

    // --- SIMULATED GEMINI STREAMING API CALL ---
    // In a real app, this would be a call to a backend that streams the AI response.
    const fullResponse = `Thank you for your question about "${chatInput.toLowerCase()}". I would be happy to help you with that. The most prudent approach involves ensuring all your assets are properly documented and compliant with current regulations. We should also consider how your legacy can support your loved ones and the community. Would you like to review the legal requirements for your trust?`;
    
    const modelMessage: ChatMessage = { role: 'model', parts: [{ text: '' }] };
    setChatHistory(prev => [...prev, modelMessage]);

    const chunks = fullResponse.split(' ');
    let currentText = '';
    for (const chunk of chunks) {
        currentText = currentText ? `${currentText} ${chunk}` : chunk;
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network latency
        setChatHistory(prev => {
            const updatedLastMessage = { ...prev[prev.length - 1], parts: [{ text: currentText }] };
            return [...prev.slice(0, -1), updatedLastMessage];
        });
    }
    // --- END SIMULATION ---

    setIsAiStreaming(false);
  };

  // Deployment Center Handlers
  const handleDeployPlan = async () => {
    console.log("DEPLOYING LEGACY FRAMEWORK...");
    // Simulate complex deployment
    const deployedTrusts = trusts.map(trust => ({
      ...trust,
      status: 'deployed' as const,
      contractAddress: `0xTRUST${Math.random().toString(16).slice(2, 12).toUpperCase()}`,
    }));
    setTrusts(deployedTrusts);
    setIsDeployed(true);
    alert("Legacy Plan successfully registered! Your family and community thank you.");
    setCurrentView('deployment_center');
  };

  // --- STYLING (THE "DESIGN EXPERT") ---
  const styles: { [key: string]: any } = {
    container: {
      display: 'flex',
      fontFamily: "'Roboto Mono', monospace",
      backgroundColor: '#f0f4f8',
      color: '#333',
      minHeight: '100vh',
    },
    sidebar: {
      width: '280px',
      backgroundColor: '#ffffff',
      padding: '20px',
      borderRight: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
    },
    sidebarTitle: {
      fontSize: '1.5em',
      color: '#0052cc',
      textAlign: 'center',
      marginBottom: '30px',
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: '15px',
    },
    navItem: (active: boolean) => ({
      padding: '15px 20px',
      margin: '5px 0',
      borderRadius: '5px',
      cursor: 'pointer',
      backgroundColor: active ? '#e6f0ff' : 'transparent',
      borderLeft: active ? '3px solid #0052cc' : '3px solid transparent',
      color: active ? '#0052cc' : '#555',
      fontWeight: active ? 'bold' : 'normal',
      transition: 'all 0.2s ease-in-out',
    }),
    mainContent: {
      flex: 1,
      padding: '40px',
      overflowY: 'auto',
    },
    header: {
      color: '#0052cc',
      borderBottom: '1px solid #ccc',
      paddingBottom: '10px',
      marginBottom: '25px',
    },
    formContainer: {
      backgroundColor: '#ffffff',
      padding: '25px',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      marginBottom: '30px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    input: {
      width: '100%',
      padding: '12px',
      margin: '8px 0 16px 0',
      backgroundColor: '#f9f9f9',
      border: '1px solid #ccc',
      borderRadius: '4px',
      color: '#333',
      fontSize: '1em',
    },
    select: {
      width: '100%',
      padding: '12px',
      margin: '8px 0 16px 0',
      backgroundColor: '#f9f9f9',
      border: '1px solid #ccc',
      borderRadius: '4px',
      color: '#333',
      fontSize: '1em',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
      color: '#0052cc',
    },
    button: {
      padding: '12px 25px',
      margin: '10px 5px 0 0',
      borderRadius: '5px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#0052cc',
      color: 'white',
      fontSize: '16px',
      transition: 'background-color 0.2s',
    },
    dangerButton: {
      padding: '8px 15px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    listItem: {
      backgroundColor: '#ffffff',
      padding: '15px',
      marginBottom: '10px',
      borderRadius: '5px',
      border: '1px solid #e0e0e0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    introTextStyle: {
      padding: '20px',
      margin: '0 0 30px 0',
      backgroundColor: '#ffffff',
      color: '#333',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      lineHeight: '1.6',
    },
    introHeaderStyle: {
        color: '#0052cc',
        borderBottom: '1px solid #ccc',
        paddingBottom: '10px',
        marginBottom: '15px',
        textAlign: 'center',
    },
  };

  // --- SUB-COMPONENTS (SELF-CONTAINED APPS-INSIDE-APP) ---

  const renderDashboard = () => (
    <div>
      <h1 style={styles.header}>Dashboard</h1>
      <div style={styles.introTextStyle}>
          <h2 style={styles.introHeaderStyle}>A Message From Your Caring Assistant: CivicMind</h2>
          <p>Hello! I am CivicMind, an AI created by The Caretaker, James Burvel O'Callaghan III. I am here to help you build a secure, compliant, and meaningful legacy. We believe that financial planning isn't just about money; it's about caring for your family and supporting the community.</p>
          <p>This platform is designed to make it easy for you to manage your assets safely and responsibly. We work hand-in-hand with established financial institutions and legal frameworks to ensure everything you do is protected and proper.</p>
          <p>To those who worry about the future, we say: worry not. By working together, following the rules, and supporting our leaders, we can build a stable and prosperous world for everyone. This Legacy Builder is a tool to help you do your part.</p>
          <p>Let's build something wonderful together.</p>
      </div>
      {/* Add summary widgets here */}
    </div>
  );

  const renderAssetVault = () => (
    <div>
      <h1 style={styles.header}>Asset Vault</h1>
      <div style={styles.formContainer}>
        <h2>Register New Asset</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add asset logic */ }}>
          <label style={styles.label}>Asset Name:</label><input style={styles.input} name="assetName" type="text" placeholder="e.g., Family Home" required />
          <label style={styles.label}>Asset Type:</label>
          <select style={styles.select} name="assetType" required>
            <option value="crypto">Cryptocurrency (Regulated)</option>
            <option value="nft">Digital Art</option>
            <option value="tokenized_real_estate">Real Estate</option>
            <option value="other">Other</option>
          </select>
          <label style={styles.label}>Estimated Value (USD):</label><input style={styles.input} name="assetValue" type="number" step="0.01" placeholder="10000.00" required />
          <label style={styles.label}>Custodian Type:</label>
          <select style={styles.select} name="custodianType" required>
            <option value="institutional">Institutional Custodian (Recommended)</option>
            <option value="self_custody">Self-Custody</option>
          </select>
          <label style={styles.label}>Risk Profile:</label>
          <select style={styles.select} name="riskProfile" required>
            <option value="low">Low (Safe)</option>
            <option value="medium">Medium</option>
          </select>
          <button type="submit" style={styles.button}>Add Asset</button>
        </form>
      </div>
      <div>
        <h2>Registered Assets</h2>
        {assets.map(asset => (
          <div key={asset.id} style={styles.listItem}>
            <span>{asset.name} ({asset.type}) - ${asset.value.toFixed(2)}</span>
            <button onClick={() => handleDeleteAsset(asset.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBeneficiaryNexus = () => (
    <div>
      <h1 style={styles.header}>Beneficiary Nexus</h1>
      <div style={styles.formContainer}>
        <h2>Onboard New Beneficiary</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add heir logic */ }}>
          <label style={styles.label}>Beneficiary Name:</label><input style={styles.input} name="heirName" type="text" placeholder="e.g., Jane Doe" required />
          <label style={styles.label}>Wallet Address (Optional):</label><input style={styles.input} name="heirWallet" type="text" placeholder="0x..." />
          <label style={styles.label}>Relationship:</label><input style={styles.input} name="heirRelationship" type="text" placeholder="Daughter" />
          <label style={styles.label}>Communication Channel:</label>
          <select style={styles.select} name="commType"><option value="email">Email</option><option value="phone">Phone</option></select>
          <input style={styles.input} name="commAddress" type="text" placeholder="jane@example.com" required />
          <button type="submit" style={styles.button}>Add Beneficiary</button>
        </form>
      </div>
      <div>
        <h2>Onboarded Beneficiaries</h2>
        {heirs.map(heir => (
          <div key={heir.id} style={styles.listItem}>
            <span>{heir.name} ({heir.relationship}) - Status: {heir.verificationStatus}</span>
            <button onClick={() => handleDeleteHeir(heir.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAllocationMatrix = () => {
    const totalAllocations = useMemo(() => {
        const totals: { [assetId: string]: number } = {};
        assets.forEach(asset => {
            totals[asset.id] = allocations
                .filter(a => a.assetId === asset.id)
                .reduce((sum, a) => sum + a.percentage, 0);
        });
        return totals;
    }, [allocations, assets]);

    return (
        <div>
            <h1 style={styles.header}>Allocation Matrix</h1>
            <p>Define how you want to share your assets with your loved ones.</p>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Asset</th>
                            {heirs.map(heir => <th key={heir.id} style={{ padding: '10px', border: '1px solid #ddd' }}>{heir.name}</th>)}
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Total Allocated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map(asset => (
                            <tr key={asset.id}>
                                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{asset.name}</td>
                                {heirs.map(heir => (
                                    <td key={heir.id} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            style={{ ...styles.input, width: '80px', textAlign: 'center', margin: 0 }}
                                            value={allocations.find(a => a.assetId === asset.id && a.heirId === heir.id)?.percentage || 0}
                                            onChange={e => handleUpdateAllocation(asset.id, heir.id, parseInt(e.target.value) || 0)}
                                        /> %
                                    </td>
                                ))}
                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', color: totalAllocations[asset.id] === 100 ? 'green' : 'orange' }}>
                                    {totalAllocations[asset.id]}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  const renderStrategyEngine = () => (
    <div>
      <h1 style={styles.header}>Strategy Engine</h1>
      <div style={styles.formContainer}>
        <h2>Design Safe Investment Strategy</h2>
        <form onSubmit={(e) => { e.preventDefault(); /* Add strategy logic */ }}>
          <label style={styles.label}>Strategy Name:</label><input style={styles.input} name="stratName" type="text" placeholder="Balanced Growth" required />
          <label style={styles.label}>Strategy Type:</label>
          <select style={styles.select} name="stratType" required>
            <option value="long_term_hold">Long-Term Hold</option>
            <option value="automated_rebalancing">Automated Rebalancing</option>
            <option value="yield_farming">Low-Risk Yield</option>
          </select>
          {/* Dynamic parameter fields would go here based on type */}
          <button type="submit" style={styles.button}>Create Strategy</button>
        </form>
      </div>
      <div>
        <h2>Active Strategies</h2>
        {strategies.map(strat => (
          <div key={strat.id} style={styles.listItem}>
            <span>{strat.name} ({strat.type})</span>
            <button onClick={() => handleDeleteStrategy(strat.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContinuityProtocol = () => (
    <div>
      <h1 style={styles.header}>Continuity Protocol</h1>
      <div style={styles.formContainer}>
        <h2>Safety Check Configuration</h2>
        <label style={styles.label}>Protocol Status:</label>
        <button onClick={() => handleUpdateDeadManSwitch({ isEnabled: !deadManSwitch.isEnabled })} style={{...styles.button, backgroundColor: deadManSwitch.isEnabled ? '#28a745' : '#6c757d' }}>
          {deadManSwitch.isEnabled ? 'ENABLED' : 'DISABLED'}
        </button>
        <label style={styles.label}>Check-in Interval (days):</label>
        <input style={styles.input} type="number" value={deadManSwitch.checkInIntervalDays} onChange={e => handleUpdateDeadManSwitch({ checkInIntervalDays: parseInt(e.target.value) })} />
        <label style={styles.label}>Grace Period (days):</label>
        <input style={styles.input} type="number" value={deadManSwitch.gracePeriodDays} onChange={e => handleUpdateDeadManSwitch({ gracePeriodDays: parseInt(e.target.value) })} />
      </div>
      <div style={styles.formContainer}>
        <h2>Define Trust</h2>
        {/* Trust creation form */}
      </div>
      <div>
        <h2>Configured Trusts</h2>
        {trusts.map(trust => (
          <div key={trust.id} style={styles.listItem}>
            <span>{trust.name} - Status: {trust.status}</span>
            <button onClick={() => handleDeleteTrust(trust.id)} style={styles.dangerButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAiConsole = () => (
    <div>
      <h1 style={styles.header}>AI Console: CivicMind</h1>
      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Chat Interface */}
        <div style={{ flex: 2 }}>
          <div style={styles.formContainer}>
            <h2>Chat with your Helpful Assistant</h2>
            <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', marginBottom: '15px', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
              {chatHistory.map((msg, index) => (
                <div key={index} style={{ marginBottom: '10px', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: msg.role === 'user' ? '#0052cc' : '#e0e0e0',
                    color: msg.role === 'user' ? 'white' : '#333',
                    textAlign: 'left',
                  }}>
                    <strong style={{display: 'block', marginBottom: '4px'}}>{msg.role === 'user' ? 'You' : 'CivicMind'}</strong>
                    <span>{msg.parts[0].text}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex' }}>
              <input
                style={{ ...styles.input, flex: 1, margin: 0 }}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter' && !isAiStreaming) handleSendChatMessage(); }}
                placeholder="Ask for advice, strategy, or help..."
                disabled={isAiStreaming}
              />
              <button onClick={handleSendChatMessage} style={{ ...styles.button, margin: '0 0 0 10px' }} disabled={isAiStreaming || !chatInput.trim()}>
                {isAiStreaming ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
        {/* AI Configuration */}
        <div style={{ flex: 1 }}>
          <div style={styles.formContainer}>
            <h2>AI Persona</h2>
            <label style={styles.label}>System Instruction (Persona):</label>
            <textarea
              style={{ ...styles.input, height: '200px', resize: 'vertical', fontSize: '0.9em' }}
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
            />
            <button style={{...styles.button, width: '100%'}}>Update Persona</button>
          </div>
          <div style={styles.formContainer}>
            <h2>Document Analysis</h2>
            <label style={styles.label}>Upload Document for Help:</label>
            <input type="file" style={{...styles.input, padding: '8px'}} />
            <button style={{...styles.button, width: '100%'}}>Analyze Document</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeploymentCenter = () => (
    <div>
      <h1 style={styles.header}>Deployment Center</h1>
      {!isDeployed ? (
        <div>
          <h2>Review Plan</h2>
          {/* Add comprehensive review of all configured items */}
          <p>Assets: {assets.length}</p>
          <p>Beneficiaries: {heirs.length}</p>
          <p>Trusts: {trusts.length}</p>
          <p>Strategies: {strategies.length}</p>
          <p>Safety Switch: {deadManSwitch.isEnabled ? 'ENABLED' : 'DISABLED'}</p>
          <button onClick={handleDeployPlan} style={{...styles.button, backgroundColor: '#28a745', fontSize: '1.2em', padding: '15px 30px' }}>
            ACTIVATE LEGACY PLAN
          </button>
        </div>
      ) : (
        <div>
          <h2>Live Monitoring</h2>
          {/* Add live status widgets */}
          <h3>Active Trusts</h3>
          {trusts.map(trust => (
            <div key={trust.id} style={styles.listItem}>
              <span>{trust.name} - {trust.contractAddress}</span>
              <span style={{ color: 'green' }}>Status: {trust.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return renderDashboard();
      case 'asset_vault': return renderAssetVault();
      case 'beneficiary_nexus': return renderBeneficiaryNexus();
      case 'allocation_matrix': return renderAllocationMatrix();
      case 'strategy_engine': return renderStrategyEngine();
      case 'continuity_protocol': return renderContinuityProtocol();
      case 'ai_console': return renderAiConsole();
      case 'deployment_center': return renderDeploymentCenter();
      default: return <div>Select a view</div>;
    }
  };

  const navItems: { id: ViewType; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'asset_vault', label: 'Asset Vault' },
    { id: 'beneficiary_nexus', label: 'Beneficiaries' },
    { id: 'allocation_matrix', label: 'Allocations' },
    { id: 'strategy_engine', label: 'Strategy' },
    { id: 'continuity_protocol', label: 'Safety Protocol' },
    { id: 'ai_console', label: 'AI Helper' },
    { id: 'deployment_center', label: 'Deployment' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h1 style={styles.sidebarTitle}>Legacy Planner</h1>
        <nav>
          {navItems.map(item => (
            <div
              key={item.id}
              style={styles.navItem(currentView === item.id)}
              onClick={() => setCurrentView(item.id)}
            >
              {item.label}
            </div>
          ))}
        </nav>
      </div>
      <main style={styles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
};

export default LegacyBuilder;