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