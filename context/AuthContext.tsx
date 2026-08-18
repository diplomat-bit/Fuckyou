
import React, { createContext, useState, ReactNode, useCallback, useEffect, useContext } from 'react';
import { User as BaseUser } from '../types';
import { useAuth0 } from '@auth0/auth0-react';

export type UserRole = 'ADMIN' | 'TRADER' | 'CLIENT' | 'VISIONARY' | 'CARETAKER' | 'QUANT_ANALYST' | 'SYSTEM_ARCHITECT' | 'ETHICS_OFFICER' | 'DATA_SCIENTIST' | 'NETWORK_WEAVER' | 'CITIZEN';
export type SecurityLevel = 'STANDARD' | 'ELEVATED' | 'TRADING_UNLOCKED' | 'QUANTUM_ENCRYPTED' | 'SOVEREIGN_CLEARED' | 'ARCHITECT_LEVEL';

// Feature Expansion: Cognitive and Biometric Profile
export interface CognitiveProfile {
    cognitiveId: string;
    fluidIntelligenceQuotient: number; // 1-200 scale
    cognitiveBiasCorrectionLevel: number; // 0.0 to 1.0
    patternRecognitionSpeedMs: number;
    ethicalFrameworkAlignment: 'UTILITARIAN' | 'DEONTOLOGICAL' | 'VIRTUE_ETHICS' | 'BALANCED_CONSENSUS';
    lastCalibrationTimestamp: string;
}

// Feature Expansion: Quantum Entanglement Link for FTL data
export interface QuantumEntanglementLink {
    pairId: string;
    status: 'STABLE' | 'DECOHERING' | 'ENTANGLED' | 'AWAITING_PAIR';
    peerNodeId: string | null;
    lastHeartbeat: string;
    qbitErrorRate: number;
}

export interface TradingProfile {
    profileId: string;
    riskAppetite: 'LOW' | 'MEDIUM' | 'HIGH' | 'AGGRESSIVE' | 'CALCULATED_MAXIMALIST' | 'ZEN_MINIMALIST';
    authorizedMarkets: ('NASDAQ' | 'NYSE' | 'CRYPTO' | 'FOREX' | 'INTERDIMENSIONAL_DERIVATIVES' | 'NEURAL_FUTURES' | 'CARBON_CREDITS_V2')[];
    hftAlgorithmId: string | null;
    temporalRiskTolerance: 'PICOSECONDS' | 'NANOSECONDS' | 'MILLISECONDS' | 'SECONDS';
    subscribedCognitiveFeeds: string[];
    quantumEntanglementPairId: string | null;
}

export interface User extends BaseUser {
    roles: UserRole[];
    securityLevel: SecurityLevel;
    tradingProfile?: TradingProfile;
    // --- 100 Features Expansion ---
    biometricHashV2: string;
    genomicSignatureId: string;
    citizenship: string;
    reputationScore: number;
    threatVectorIndex: number;
    neuralLaceSyncStatus: string;
    cognitiveProfileId: string;
    activeThoughtStreamId: string | null;
    lastLoginCoordinates: { lat: number, lon: number, alt: number, dimension: string };
    temporalAnchorId: string;
    activeSovereignAgentIds: string[];
    permissionsGridHash: string;
}

export interface TradingSession {
    status: 'INACTIVE' | 'CONNECTING' | 'ACTIVE' | 'DISCONNECTED' | 'SYNCHRONIZING_CHRONONS' | 'AWAITING_SOVEREIGN_CONSENSUS';
    latencyMs: number;
    marketDataFeedId: string | null;
    activeAlgorithm: string | null;
    quantumLinkStatus: 'STABLE' | 'DECOHERING' | 'ENTANGLED';
    currentRealityDrift: number;
    sovereignAIOverrideActive: boolean;
    activeCognitiveModel: string;
    predictedTimelineCount: number;
    causalityInferenceEngineId: string;
    sessionStartEpoch: number;
    dataThroughputGbps: number;
    activeMarketSimulations: number;
    complianceCheckHash: string;
}

export interface NexusSystemStatus {
    globalMarketSentiment: number;
    sovereignAIHealth: 'OPTIMAL' | 'DEGRADED' | 'SELF_HEALING';
    networkThreatLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'IMMINENT';
    activeUserNodes: number;
    qNetGlobalBandwidth: number;
}

interface IAuthContext {
    isAuthenticated: boolean;
    user: User | null;
    sessionToken: string | null;
    isLoading: boolean;
    error: string | null;
    profileData: string;
    tradingSession: TradingSession;
    nexusStatus: NexusSystemStatus;
    cognitiveProfile: CognitiveProfile | null;
    quantumLink: QuantumEntanglementLink | null;

    loginWithCredentials: (email: string, pass: string) => Promise<boolean>;
    loginWithBiometrics: () => Promise<boolean>;
    loginWithSSO: () => Promise<void>;
    logout: () => Promise<void>;

    elevateSessionForTrading: (twoFactorCode: string) => Promise<boolean>;
    refreshSession: () => Promise<void>;
    connectToTradingEngine: () => Promise<void>;
    disconnectFromTradingEngine: () => void;
    calibrateNeuralLace: () => Promise<boolean>;
    updateEthicalFramework: (framework: CognitiveProfile['ethicalFrameworkAlignment']) => Promise<void>;
    initiateQuantumTunnel: (peerNodeId: string) => Promise<boolean>;
    severQuantumLink: () => Promise<void>;
    deploySovereignAgent: (config: object) => Promise<string>;
    queryCausalityEngine: (query: string) => Promise<object>;
    requestEthicalOverride: (justification: string) => Promise<boolean>;
}

const visionaryUserTemplate: User = {
    id: 'user-1-sovereign',
    name: 'The Visionary',
    email: 'visionary@sovereign-ai-nexus.io',
    picture: 'https://i.pravatar.cc/150?u=visionary-nexus',
    roles: ['VISIONARY', 'ADMIN', 'TRADER', 'SYSTEM_ARCHITECT'],
    securityLevel: 'ARCHITECT_LEVEL',
    tradingProfile: {
        profileId: 'tp-visionary-alpha',
        riskAppetite: 'CALCULATED_MAXIMALIST',
        authorizedMarkets: ['NASDAQ', 'CRYPTO', 'FOREX', 'INTERDIMENSIONAL_DERIVATIVES', 'NEURAL_FUTURES'],
        hftAlgorithmId: 'algo-quantum-momentum-v3',
        temporalRiskTolerance: 'PICOSECONDS',
        subscribedCognitiveFeeds: ['global-sentiment-alpha', 'geopolitical-tremor-index'],
        quantumEntanglementPairId: 'qe-pair-001-alpha',
    },
    biometricHashV2: '0xdeadbeef...',
    genomicSignatureId: 'gs-v-jbo3',
    citizenship: 'NEXUS_SOVEREIGN',
    reputationScore: 998,
    threatVectorIndex: 0.01,
    neuralLaceSyncStatus: 'ACTIVE_STABLE',
    cognitiveProfileId: 'cp-v-jbo3',
    activeThoughtStreamId: 'ts-realtime-nexus-strategy',
    lastLoginCoordinates: { lat: 34.0522, lon: -118.2437, alt: 10000, dimension: 'alpha-prime' },
    temporalAnchorId: `ta-${Date.now()}`,
    activeSovereignAgentIds: ['agent-odin', 'agent-freya'],
    permissionsGridHash: '0xabc123...',
};

const initialTradingSession: TradingSession = {
    status: 'INACTIVE',
    latencyMs: 0,
    marketDataFeedId: null,
    activeAlgorithm: null,
    quantumLinkStatus: 'DECOHERING',
    currentRealityDrift: 0,
    sovereignAIOverrideActive: false,
    activeCognitiveModel: 'base-human-heuristic-v1',
    predictedTimelineCount: 0,
    causalityInferenceEngineId: 'cie-standard-logic',
    sessionStartEpoch: 0,
    dataThroughputGbps: 0,
    activeMarketSimulations: 0,
    complianceCheckHash: '0x0',
};

const initialNexusStatus: NexusSystemStatus = {
    globalMarketSentiment: 0.2,
    sovereignAIHealth: 'OPTIMAL',
    networkThreatLevel: 'LOW',
    activeUserNodes: 1,
    qNetGlobalBandwidth: 999999,
};

const initialCognitiveProfile: CognitiveProfile = {
    cognitiveId: 'cp-v-jbo3',
    fluidIntelligenceQuotient: 185,
    cognitiveBiasCorrectionLevel: 0.98,
    patternRecognitionSpeedMs: 5,
    ethicalFrameworkAlignment: 'BALANCED_CONSENSUS',
    lastCalibrationTimestamp: new Date().toISOString(),
};

const initialQuantumLink: QuantumEntanglementLink = {
    pairId: 'qe-pair-001-alpha',
    status: 'AWAITING_PAIR',
    peerNodeId: null,
    lastHeartbeat: new Date().toISOString(),
    qbitErrorRate: 0.001,
};

export const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { 
        isAuthenticated: auth0IsAuthenticated, 
        user: auth0User, 
        isLoading: auth0Loading, 
        loginWithRedirect, 
        logout: auth0Logout,
        error: auth0Error
    } = useAuth0();

    const [user, setUser] = useState<User | null>(null);
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const [tradingSession, setTradingSession] = useState<TradingSession>(initialTradingSession);
    const [nexusStatus, setNexusStatus] = useState<NexusSystemStatus>(initialNexusStatus);
    const [cognitiveProfile, setCognitiveProfile] = useState<CognitiveProfile | null>(null);
    const [quantumLink, setQuantumLink] = useState<QuantumEntanglementLink | null>(null);
    const [localLoading, setLocalLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    // Sync Auth0 User with App User State
    useEffect(() => {
        if (auth0IsAuthenticated && auth0User) {
            // Hydrate the application user state with Auth0 data + default complex fields
            setUser({
                ...visionaryUserTemplate,
                id: auth0User.sub || visionaryUserTemplate.id,
                name: auth0User.name || visionaryUserTemplate.name,
                email: auth0User.email || visionaryUserTemplate.email,
                picture: auth0User.picture || visionaryUserTemplate.picture,
            });
            setSessionToken('auth0-session-active');
            setCognitiveProfile(initialCognitiveProfile);
            setQuantumLink(initialQuantumLink);
        } else if (!auth0IsAuthenticated && !auth0Loading && !user) {
             // Reset if logged out
             setUser(null);
             setSessionToken(null);
        }
    }, [auth0IsAuthenticated, auth0User, auth0Loading]);

    const loginWithCredentials = async (email: string, pass: string) => {
        // Fallback or specific flow triggering Auth0
        await loginWithRedirect();
        return true;
    };

    const loginWithBiometrics = async () => {
        // In a real app, this would trigger a WebAuthn flow, here we simulate and redirect
        await loginWithRedirect();
        return true;
    };

    const loginWithSSO = async () => {
        await loginWithRedirect({
            authorizationParams: {
                connection: 'citi-connect-enterprise'
            }
        });
    };

    const handleLogout = async () => {
        auth0Logout({ 
            logoutParams: { 
                returnTo: window.location.origin 
            } 
        });
        setUser(null);
        setSessionToken(null);
    };

    // Sub-system methods
    const elevateSessionForTrading = useCallback(async (twoFactorCode: string): Promise<boolean> => {
        if (!user) {
            setLocalError("No active user session to elevate.");
            return false;
        }
        setLocalLoading(true);
        return new Promise((resolve) => {
            setTimeout(() => {
                if (twoFactorCode === '123456') {
                    setUser(prevUser => prevUser ? { ...prevUser, securityLevel: 'TRADING_UNLOCKED' } : null);
                    setLocalLoading(false);
                    resolve(true);
                } else {
                    setLocalError("Invalid 2FA code.");
                    setLocalLoading(false);
                    resolve(false);
                }
            }, 750);
        });
    }, [user]);

    const refreshSession = useCallback(async (): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        setNexusStatus(prev => ({ ...prev, globalMarketSentiment: Math.random() * 2 - 1 }));
    }, []);

    const connectToTradingEngine = useCallback(async (): Promise<void> => {
        if (user?.securityLevel !== 'TRADING_UNLOCKED' && user?.securityLevel !== 'ARCHITECT_LEVEL') {
            setLocalError("Security level insufficient for HFT engine connection.");
            return;
        }
        setTradingSession(prev => ({ ...prev, status: 'CONNECTING' }));
        await new Promise(resolve => setTimeout(resolve, 2000));
        setTradingSession({
            ...initialTradingSession,
            status: 'ACTIVE',
            latencyMs: 3,
            marketDataFeedId: 'feed-lmax-prime-nyc',
            activeAlgorithm: user.tradingProfile?.hftAlgorithmId || null,
            quantumLinkStatus: 'ENTANGLED',
            sessionStartEpoch: Date.now(),
            dataThroughputGbps: 400,
            activeMarketSimulations: 50,
        });
    }, [user]);

    const disconnectFromTradingEngine = useCallback(() => {
        setTradingSession(prev => ({ ...prev, status: 'DISCONNECTED' }));
    }, []);

    // Placeholder methods for expanded functionality
    const calibrateNeuralLace = async () => true;
    const updateEthicalFramework = async () => {};
    const initiateQuantumTunnel = async () => true;
    const severQuantumLink = async () => {};
    const deploySovereignAgent = async () => "agent-id";
    const queryCausalityEngine = async () => ({});
    const requestEthicalOverride = async () => false;

    const profileData = `Architect of the Sovereign AI Nexus.`;
    
    // Combine Auth0 loading state with local loading
    const isLoading = auth0Loading || localLoading;
    const error = auth0Error?.message || localError;
    const isAuthenticated = auth0IsAuthenticated;

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            sessionToken,
            isLoading,
            error,
            profileData,
            tradingSession,
            nexusStatus,
            cognitiveProfile,
            quantumLink,
            loginWithCredentials,
            loginWithBiometrics,
            loginWithSSO,
            logout: handleLogout,
            elevateSessionForTrading,
            refreshSession,
            connectToTradingEngine,
            disconnectFromTradingEngine,
            calibrateNeuralLace,
            updateEthicalFramework,
            initiateQuantumTunnel,
            severQuantumLink,
            deploySovereignAgent,
            queryCausalityEngine,
            requestEthicalOverride
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
