import React, { useState, useMemo, useEffect, FC, createContext, useContext, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Card from './Card';
import type { AIPlanStep, AIQuestion, AIPlan } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

// ================================================================================================
// QUANTUM WEAVER: FINOS PRO (v1.0 - MVP)
// DEVELOPER: PRODUCTION-READY REFACTOR
// FOCUS: UNIFIED BUSINESS FINANCIAL DASHBOARD & AI-POWERED TRANSACTION INTELLIGENCE (MVP SCOPE)
// ================================================================================================

// This file has been refactored to align with production standards for a Minimum Viable Product (MVP).
// Key changes include:
// 1.  **Mock Data & API Replacement:** All internal mock data arrays/maps and complex mock resolver logic
//     within `graphqlRequest` have been removed. A new `apiClient` function simulates
//     network calls to a hypothetical `/api/graphql` endpoint, returning simplified
//     client-side mock data to ensure the frontend remains functional during development.
//     In a production environment, this `apiClient` would connect to a real GraphQL backend.
// 2.  **Authentication Abstraction:** The hardcoded `userId` has been replaced with a placeholder
//     `AuthContext` and `useAuth` hook, simulating an authenticated user. This sets the stage
//     for a secure JWT/OAuth2 compliant authentication flow.
// 3.  **MVP Scope Enforcement:** Modules deemed outside the MVP ("Talent & HR", "Legal & Compliance")
//     have been removed from the UI and navigation. The focus is now on "Unified business financial dashboard"
//     and "AI-powered transaction intelligence" as defined in the refactoring plan.
// 4.  **Code Quality & Consistency:** Minor cleanups, type refinements, and added comments for clarity.

// --- ARCHIVED / FUTURE MODULES NOTES ---
// Components and functionalities removed from the MVP (e.g., TeamOrchestrator, LegalShield,
// detailed user management outside profile updates) are considered for future development
// and would be moved to a `/future-modules` directory in a full project setup.

const gql = String.raw; // Kept for GraphQL query definitions; would ideally be code-generated.

// --- AUTHENTICATION CONTEXT (PLACEHOLDER) ---
// This context simulates user authentication. In a production app, this would integrate
// with a real authentication system (e.g., JWT, OAuth2), fetching user details from
// secure storage or an authentication provider upon app load.

interface AuthContextType {
    isAuthenticated: boolean;
    userId: string | null;
    login: (id: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    // In a production app, userId would be retrieved from secure session storage (e.g., HTTP-only cookie, localStorage after validation),
    // and validated against a backend session or JWT token.
    const [userId, setUserId] = useState<string | null>('user_001_mvp'); // Hardcoded for MVP, to be replaced by actual auth
    const isAuthenticated = !!userId;

    const login = useCallback((id: string) => {
        // Placeholder: In a real app, this would involve API calls to authenticate,
        // receive JWT, store session, etc.
        setUserId(id);
        console.log(`User ${id} logged in (mock).`);
    }, []);

    const logout = useCallback(() => {
        // Placeholder: In a real app, this would involve invalidating tokens/sessions.
        setUserId(null);
        console.log("User logged out (mock).");
    }, []);

    const value = useMemo(() => ({ isAuthenticated, userId, login, logout }), [isAuthenticated, userId, login, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// --- MOCK DATA GENERATORS (CLIENT-SIDE) ---
// These functions generate data on the client side to simulate API responses for the MVP.
// In a production environment, this data would be fetched directly from the backend via `apiClient`.

interface FinancialRecord { month: string; revenue: number; expenses: number; cashBalance: number; burnRate: number; }
interface MarketCompetitor { name: string; marketShare: number; threatLevel: number; growthRate: number; }
interface SystemAlert { id: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; message: string; timestamp: number; }

function generateMockFinancials(): FinancialRecord[] {
    return Array.from({ length: 12 }, (_, i) => ({
        month: `Month ${i + 1}`,
        revenue: 12000 * Math.pow(1.1, i) + Math.random() * 3000,
        expenses: 9000 * Math.pow(1.03, i) + Math.random() * 1500,
        cashBalance: 600000 - (i * 7000),
        burnRate: 18000 + Math.random() * 1500,
    }));
}

function generateMockCompetitors(): MarketCompetitor[] {
    return [
        { name: 'Legacy Corp', marketShare: 40, threatLevel: 35, growthRate: 3 },
        { name: 'StartUp X', marketShare: 20, threatLevel: 80, growthRate: 120 },
        { name: 'TechGiant Y', marketShare: 28, threatLevel: 65, growthRate: 12 },
        { name: 'Our Venture', marketShare: 12, threatLevel: 0, growthRate: 250 },
    ];
}

function generateMockSystemAlerts(): SystemAlert[] {
    return [
        { id: 'a1', severity: 'MEDIUM', message: 'Competitor "StartUp X" launched new product in Q1.', timestamp: Date.now() - 50000 },
        { id: 'a2', severity: 'LOW', message: 'Cash flow positive projection advanced by 3 weeks.', timestamp: Date.now() - 150000 },
        { id: 'a3', severity: 'HIGH', message: 'Critical vulnerability detected in a third-party library.', timestamp: Date.now() - 300000 },
    ];
}

// Local mock state for development, replaces global mutable vars.
// In a real app, this state would be managed by a backend database.
const mockWorkflowsState = new Map<string, WorkflowStatusPayload>();
const mockUserProfilesState = new Map<string, UserProfile>();

// --- UNIFIED API CLIENT (SIMULATED) ---
// This function acts as the unified API connector, replacing the previous ad-hoc mock logic.
// In a production environment, this would perform actual network requests (e.g., fetch, axios)
// to a GraphQL backend, handling concerns like authentication, error parsing, and potentially
// retries/rate-limiting (though the latter two are typically backend/middleware concerns for GraphQL).

// MOCK_API_BASE_URL is a placeholder. A real deployment would use an environment variable.
const MOCK_API_BASE_URL = '/api/graphql';

async function apiClient<T, V>(query: string, variables?: V): Promise<T> {
    console.debug("Quantum Weaver API Request (Simulated):", { query: query.substring(0, 50) + '...', variables });

    // Simulate network latency for a more realistic development experience
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 300));

    // --- REAL API CLIENT STRUCTURE (COMMENTED OUT FOR FRONTEND MOCKING) ---
    /*
    const token = getAuthToken(); // Assume a function to retrieve current auth token
    const response = await fetch(MOCK_API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }), // Include token if available
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        // Implement robust error handling, e.g., re-authentication for 401,
        // circuit breaking for repeated 5xx errors.
        console.error('API Error:', errorBody);
        throw new Error(errorBody.errors?.[0]?.message || `API request failed with status ${response.status}`);
    }

    const { data, errors } = await response.json();
    if (errors) {
        // Handle GraphQL specific errors
        console.error('GraphQL Errors:', errors);
        throw new Error(errors[0].message || 'GraphQL errors occurred');
    }
    return data;
    */

    // --- TEMPORARY CLIENT-SIDE MOCK RESPONSES FOR MVP DEVELOPMENT ---
    // These responses simulate what a backend would return for the MVP scope.
    // They replace the complex mock resolver logic that was previously in `graphqlRequest`.

    if (query.includes('StartBusinessPlanAnalysis')) {
        const { plan, userId } = variables as { plan: string, userId: string };
        const workflowId = `wf-${Date.now()}-${userId}`;
        // Simulate immediate completion for quick UI feedback in MVP.
        const loanAmount = Math.floor(Math.random() * 500000) + 100000;
        const viability = Math.min(99, 60 + (plan.length / 200) * 20 + Math.random() * 10);
        const marketFit = Math.min(98, 50 + (plan.length / 300) * 30 + Math.random() * 10);
        const risk = Math.max(2, 100 - viability - marketFit + Math.random() * 5);

        const mockResult = {
            feedback: "Initial analysis complete. This plan shows strong potential with strategic adjustments. Further details are available in the 'Coaching Plan' section.",
            questions: [
                { id: 'q1', question: 'How will the proposed model handle rapid market shifts?', category: 'Resilience' },
                { id: 'q2', question: 'What is the projected ROI for initial capital deployment?', category: 'Finance' }
            ],
            coachingPlan: {
                title: "Accelerated Market Entry Protocol",
                summary: "A focused plan to validate market fit and secure early adopters.",
                steps: [
                    { title: "Target Market Validation", description: "Conduct A/B testing on core value propositions across diverse user segments.", timeline: '2 Weeks', category: 'Validation' },
                    { title: "Minimum Viable Product (MVP) Launch", description: "Release a feature-complete core product to a controlled user group.", timeline: '4 Weeks', category: 'Product' },
                ]
            },
            loanAmount: loanAmount,
            metrics: { viability, marketFit, risk },
            growthProjections: Array.from({ length: 12 }, (_, i) => ({
                month: i,
                users: Math.floor(100 * Math.pow(1.2, i)),
                revenue: Math.floor(1000 * Math.pow(1.3, i))
            })),
            potentialMentors: [
                { id: 'm1', name: 'Dr. Anya Sharma', expertise: 'AI Ethics', bio: 'Pioneered explainable AI frameworks for financial compliance.', imageUrl: 'https://i.pravatar.cc/150?u=anyasharma' }
            ]
        };
        // Store this mock result in local mock state to simulate persistent workflow state
        const newWorkflow: WorkflowStatusPayload = {
            workflowId,
            status: 'ANALYSIS_COMPLETE', // Immediately complete for MVP
            result: mockResult,
            error: null,
            userId,
            businessPlan: plan,
        };
        mockWorkflowsState.set(workflowId, newWorkflow);
        return { startBusinessPlanAnalysis: { workflowId, status: 'ANALYSIS_COMPLETE' } } as unknown as T;
    }

    if (query.includes('GetBusinessPlanAnalysisStatus')) {
        const vars = variables as { workflowId: string };
        const wf = mockWorkflowsState.get(vars.workflowId);
        if (wf) return { getBusinessPlanAnalysisStatus: wf } as unknown as T;
        throw new Error(`Workflow ${vars.workflowId} not found.`);
    }

    if (query.includes('GetFinancialData')) {
        return { getFinancialData: generateMockFinancials() } as unknown as T;
    }
    if (query.includes('GetMarketIntelligence')) {
        return { getMarketIntelligence: generateMockCompetitors() } as unknown as T;
    }
    // Team and Legal are outside MVP scope, returning empty arrays.
    if (query.includes('GetTeamStructure')) {
        return { getTeamStructure: [] } as unknown as T;
    }
    if (query.includes('GetLegalStatus')) {
        return { getLegalStatus: [] } as unknown as T;
    }
    if (query.includes('GetSystemAlerts')) {
        return { getSystemAlerts: generateMockSystemAlerts() } as unknown as T;
    }
    if (query.includes('GenerateAiContent')) {
        const vars = variables as { prompt: string, context: string };
        let text = "AI Insight: Data analysis suggests optimal resource reallocation for Q3.";
        if (vars.prompt.includes('risk')) text = "Risk Analysis: Transitioning to next-gen payment rails is critical. Estimated risk reduction: 15%.";
        else if (vars.prompt.includes('market')) text = "Market Opportunity: Untapped segment identified in sub-Saharan Africa for micro-lending. Estimated TAM: $20B.";
        else if (vars.prompt.includes('hiring')) text = "Talent Strategy: Focus on AI-native skillsets and cross-functional team leads.";
        return { generateTextWithContext: text } as unknown as T;
    }
    if (query.includes('GenerateAIChatResponse')) {
        const responses = [
            "Current projections indicate 18 months of runway under current burn. A 10% increase in R&D reduces this to 12 months. Do you want to simulate a capital raise?",
            "Competitor analysis shows 'InnovateCo' is rapidly gaining ground in your core market. A strategic counter-move is advised.",
            "Compliance status is 92%. The pending legal review for 'Data Residency Policy' is the main outstanding item.",
            "Your team's AI readiness score is excellent. Dr. Chen's expertise is pivotal.",
            "The system detects an opportunity for a 15% efficiency gain by automating routine tasks. Shall I initiate a pilot?"
        ];
        return { generateAIChatResponse: responses[Math.floor(Math.random() * responses.length)] } as unknown as T;
    }
    if (query.includes('GetUserProfile')) {
        const vars = variables as { userId: string };
        const profile = mockUserProfilesState.get(vars.userId) || {
            userId: vars.userId,
            username: `Architect_${vars.userId.substring(0, 3)}`,
            email: `${vars.userId}@finos.io`,
            preferences: { notificationSettings: { emailEnabled: true, smsEnabled: true, inAppEnabled: true }, theme: 'dark' },
            googleId: 'g_123'
        };
        return { getUserProfile: profile } as unknown as T;
    }
    if (query.includes('UpdateUserProfile')) {
        const vars = variables as { userId: string, profile: UserProfileUpdateInput };
        let profile = mockUserProfilesState.get(vars.userId) || {
            userId: vars.userId, username: '', email: '',
            preferences: { notificationSettings: { emailEnabled: true, smsEnabled: true, inAppEnabled: true }, theme: 'dark' }
        };
        profile = {
            ...profile,
            ...vars.profile,
            preferences: {
                ...profile.preferences,
                ...(vars.profile.preferences || {}),
                notificationSettings: {
                    ...profile.preferences.notificationSettings,
                    ...(vars.profile.preferences?.notificationSettings || {})
                }
            }
        };
        mockUserProfilesState.set(vars.userId, profile);
        return { updateUserProfile: profile } as unknown as T;
    }
    if (query.includes('GetUserPlans')) {
        const vars = variables as { userId: string };
        const plans = Array.from(mockWorkflowsState.values()).filter(wf => wf.userId === vars.userId);
        return { getUserPlans: plans } as unknown as T;
    }

    throw new Error(`Unknown Query (Simulated): ${query.substring(0, 30)}`);
}

// --- GRAPHQL QUERIES & MUTATIONS ---
// These are definitions of GraphQL operations. In a production environment, these
// would often be managed by a GraphQL client (e.g., Apollo Client, Relay) or
// code-generated from a GraphQL schema.

const START_ANALYSIS_MUTATION = gql`mutation StartBusinessPlanAnalysis($plan: String!, $userId: ID!) { startBusinessPlanAnalysis(plan: $plan, userId: $userId) { workflowId status } }`;
const GET_ANALYSIS_STATUS_QUERY = gql`query GetBusinessPlanAnalysisStatus($workflowId: ID!) { getBusinessPlanAnalysisStatus(workflowId: $workflowId) { workflowId status result { feedback questions { id question category } coachingPlan { title summary steps { title description category timeline } } loanAmount metrics { viability marketFit risk } growthProjections { month users revenue } potentialMentors { id name expertise bio imageUrl } } error businessPlan } }`;
const GET_FINANCIALS_QUERY = gql`query GetFinancialData { getFinancialData { month revenue expenses cashBalance burnRate } }`;
const GET_MARKET_QUERY = gql`query GetMarketIntelligence { getMarketIntelligence { name marketShare threatLevel growthRate } }`;
// GET_TEAM_QUERY and GET_LEGAL_QUERY are outside MVP scope, but kept for type definition.
const GET_TEAM_QUERY = gql`query GetTeamStructure { getTeamStructure { id name role performance satisfaction aiPotential } }`;
const GET_LEGAL_QUERY = gql`query GetLegalStatus { getLegalStatus { id name status riskScore } }`;
const GET_ALERTS_QUERY = gql`query GetSystemAlerts { getSystemAlerts { id severity message timestamp } }`;
const GENERATE_AI_CONTENT_MUTATION = gql`mutation GenerateAiContent($prompt: String!, $context: String!) { generateTextWithContext(prompt: $prompt, context: $context) }`;
const GENERATE_AI_CHAT_MUTATION = gql`mutation GenerateAIChatResponse($message: String!, $context: String!) { generateAIChatResponse(message: $message, context: $context) }`;
const GET_USER_PROFILE_QUERY = gql`query GetUserProfile($userId: ID!) { getUserProfile(userId: $userId) { userId username email googleId preferences { theme notificationSettings { emailEnabled smsEnabled inAppEnabled } } } }`;
const UPDATE_USER_PROFILE_MUTATION = gql`mutation UpdateUserProfile($userId: ID!, $profile: UserProfileUpdateInput!) { updateUserProfile(userId: $userId, profile: $profile) { userId username email googleId preferences { theme notificationSettings { emailEnabled smsEnabled inAppEnabled } } } }`;
const GET_USER_PLANS_QUERY = gql`query GetUserPlans($userId: ID!) { getUserPlans(userId: $userId) { workflowId status businessPlan result { loanAmount metrics { viability marketFit risk } } } }`;

// --- TYPES ---
// These types reflect the data structures expected from the API.

interface Metrics { viability: number; marketFit: number; risk: number; }
interface GrowthProjection { month: number; users: number; revenue: number; }
interface Mentor { id: string; name: string; expertise: string; bio: string; imageUrl: string; }
interface WorkflowStatusPayload {
    workflowId: string;
    status: 'PENDING' | 'ANALYSIS_COMPLETE' | 'APPROVED' | 'FAILED' | 'REQUIRE_REVISION' | 'PENDING_APPROVAL';
    result?: {
        feedback?: string;
        questions?: AIQuestion[];
        coachingPlan?: AIPlan;
        loanAmount?: number;
        metrics?: Metrics;
        growthProjections?: GrowthProjection[];
        potentialMentors?: Mentor[];
    } | null;
    error?: string | null;
    userId: string;
    businessPlan: string;
}
interface UserProfile {
    userId: string;
    username: string;
    email: string;
    googleId?: string;
    preferences: {
        theme?: 'dark' | 'light';
        notificationSettings: { emailEnabled: boolean; smsEnabled: boolean; inAppEnabled: boolean; };
    };
}
interface UserProfileUpdateInput {
    username?: string;
    email?: string;
    googleId?: string;
    preferences?: {
        theme?: 'dark' | 'light';
        notificationSettings?: { emailEnabled?: boolean; smsEnabled?: boolean; inAppEnabled?: boolean; };
    };
}
// Note: Employee and LegalDoc types are defined but their data won't be displayed in MVP.
interface Employee { id: string; name: string; role: string; performance: number; satisfaction: number; aiPotential: number; }
interface LegalDoc { id: string; name: string; status: 'DRAFT' | 'REVIEW' | 'SIGNED' | 'EXPIRED'; riskScore: number; }


// --- REACT QUERY HOOKS ---
// These hooks integrate React Query with the `apiClient` for data fetching and mutations.

const useStartAnalysis = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (args: { plan: string, userId: string }) => apiClient<{ startBusinessPlanAnalysis: { workflowId: string, status: string } }, typeof args>(START_ANALYSIS_MUTATION, args),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userPlans'] })
    });
};
const useAnalysisStatus = (workflowId: string | null) => useQuery({
    queryKey: ['analysisStatus', workflowId],
    queryFn: () => apiClient<{ getBusinessPlanAnalysisStatus: WorkflowStatusPayload }, { workflowId: string }>(GET_ANALYSIS_STATUS_QUERY, { workflowId: workflowId! }),
    enabled: !!workflowId,
    // For MVP, analysis completes immediately, so no refetchInterval for pending status.
    // In a real app, 'PENDING' status would trigger refetchInterval.
    // refetchInterval: (query) => query.state.data?.getBusinessPlanAnalysisStatus.status === 'PENDING' ? 2000 : false
});
const useFinancials = () => useQuery({ queryKey: ['financials'], queryFn: () => apiClient<{ getFinancialData: FinancialRecord[] }, {}>(GET_FINANCIALS_QUERY) });
const useMarket = () => useQuery({ queryKey: ['market'], queryFn: () => apiClient<{ getMarketIntelligence: MarketCompetitor[] }, {}>(GET_MARKET_QUERY) });
// useTeam and useLegal are kept for consistency but their data will be empty in MVP.
const useTeam = () => useQuery({ queryKey: ['team'], queryFn: () => apiClient<{ getTeamStructure: Employee[] }, {}>(GET_TEAM_QUERY) });
const useLegal = () => useQuery({ queryKey: ['legal'], queryFn: () => apiClient<{ getLegalStatus: LegalDoc[] }, {}>(GET_LEGAL_QUERY) });
const useAlerts = () => useQuery({ queryKey: ['alerts'], queryFn: () => apiClient<{ getSystemAlerts: SystemAlert[] }, {}>(GET_ALERTS_QUERY), refetchInterval: 10000 });
const useGenerateAiContent = () => useMutation({ mutationFn: (vars: { prompt: string, context: string }) => apiClient<{ generateTextWithContext: string }, typeof vars>(GENERATE_AI_CONTENT_MUTATION, vars) });
const useGenerateAiChat = () => useMutation({ mutationFn: (vars: { message: string, context: string }) => apiClient<{ generateAIChatResponse: string }, typeof vars>(GENERATE_AI_CHAT_MUTATION, vars) });
const useUserProfile = (userId: string) => useQuery({ queryKey: ['userProfile', userId], queryFn: () => apiClient<{ getUserProfile: UserProfile }, { userId: string }>(GET_USER_PROFILE_QUERY, { userId }) });
const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (args: { userId: string, profile: UserProfileUpdateInput }) => apiClient<{ updateUserProfile: UserProfile }, typeof args>(UPDATE_USER_PROFILE_MUTATION, args),
        onSuccess: (data, variables) => queryClient.invalidateQueries({ queryKey: ['userProfile', variables.userId] })
    });
};
const useUserPlans = (userId: string) => useQuery({ queryKey: ['userPlans', userId], queryFn: () => apiClient<{ getUserPlans: WorkflowStatusPayload[] }, { userId: string }>(GET_USER_PLANS_QUERY, { userId }) });

// ================================================================================================
// UI COMPONENTS (Refactored for MVP)
// ================================================================================================

const COLORS = ['#06b6d4', '#6366f1', '#10b981', '#f59e0b', '#ef4444'];

const Badge: FC<{ children: React.ReactNode, color?: string }> = ({ children, color = 'bg-gray-700' }) => (
    <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${color}`}>{children}</span>
);

const AIInsightBubble: FC<{ context: string, trigger?: string }> = ({ context, trigger }) => {
    const { mutate, data, isPending, isError, error } = useGenerateAiContent();
    const [isOpen, setIsOpen] = useState(false);

    const handleAnalyze = () => {
        setIsOpen(true);
        if (!data && !isPending) mutate({ prompt: `Analyze this context: ${trigger || 'general'}`, context });
    };

    return (
        <div className="relative inline-block ml-2">
            <button onClick={handleAnalyze} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </button>
            {isOpen && (
                <div className="absolute z-50 w-64 p-3 mt-2 -ml-32 bg-gray-900 border border-cyan-500/50 rounded-lg shadow-xl text-xs text-gray-300">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-cyan-400">Quantum Insight</span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">&times;</button>
                    </div>
                    {isPending ? <div className="animate-pulse">Computing vectors...</div> :
                     isError ? <div className="text-red-400">Error: {error?.message || "Failed to generate insight."}</div> :
                     (data?.generateTextWithContext || "Analysis complete.")}
                </div>
            )}
        </div>
    );
};

const FinancialDashboard: FC = () => {
    const { data, isLoading, isError, error } = useFinancials();
    const records = data?.getFinancialData || [];

    if (isLoading) return <Card title="Financial Trajectory"><div>Loading financial data...</div></Card>;
    if (isError) return <Card title="Financial Trajectory"><div className="text-red-400">Error loading financials: {error?.message}</div></Card>;
    if (records.length === 0) return <Card title="Financial Trajectory"><div>No financial data available.</div></Card>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card title="Current Cash" className="border-l-4 border-green-500">
                    <div className="text-2xl font-bold text-white">${records[records.length - 1]?.cashBalance.toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-1">Runway: ~18 Months <AIInsightBubble context="Cash flow analysis" /></div>
                </Card>
                <Card title="Monthly Burn" className="border-l-4 border-red-500">
                    <div className="text-2xl font-bold text-white">${records[records.length - 1]?.burnRate.toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-1">-2.5% vs last month</div>
                </Card>
                <Card title="Revenue (MRR)" className="border-l-4 border-cyan-500">
                    <div className="text-2xl font-bold text-white">${records[records.length - 1]?.revenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-1">+15% MoM Growth</div>
                </Card>
                <Card title="Net Margin" className="border-l-4 border-indigo-500">
                    <div className="text-2xl font-bold text-white">{(records[records.length - 1]?.revenue - records[records.length - 1]?.expenses).toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-1">Approaching Break-even</div>
                </Card>
            </div>
            <Card title="Financial Trajectory">
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={records}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} />
                            <YAxis stroke="#9ca3af" fontSize={10} tickFormatter={(val) => `$${val/1000}k`} />
                            <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2} name="Revenue" />
                            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                            <Line type="monotone" dataKey="cashBalance" stroke="#10b981" strokeWidth={2} name="Cash Reserves" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

const MarketIntelligence: FC = () => {
    const { data, isLoading, isError, error } = useMarket();
    const competitors = data?.getMarketIntelligence || [];

    if (isLoading) return <Card title="Market Share Distribution"><div>Loading market intelligence...</div></Card>;
    if (isError) return <Card title="Market Share Distribution"><div className="text-red-400">Error loading market data: {error?.message}</div></Card>;
    if (competitors.length === 0) return <Card title="Market Share Distribution"><div>No market data available.</div></Card>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Market Share Distribution">
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={competitors} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="marketShare">
                                {competitors.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>
            <Card title="Competitor Threat Matrix">
                <div className="space-y-4">
                    {competitors.map((comp, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                            <div>
                                <div className="font-bold text-white">{comp.name}</div>
                                <div className="text-xs text-gray-400">Growth: {comp.growthRate}% YoY</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-400 mb-1">Threat Level</div>
                                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div className={`h-full ${comp.threatLevel > 70 ? 'bg-red-500' : comp.threatLevel > 40 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${comp.threatLevel}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

// --- ARCHIVED COMPONENTS (Out of MVP Scope) ---
// The following components are retained in the codebase for reference but are not
// part of the initial MVP interface to simplify the product. They represent future
// modules (e.g., in a `/future-modules` directory).

/*
const TeamOrchestrator: FC = () => {
    // This component is out of MVP scope.
    const { data } = useTeam();
    const team = data?.getTeamStructure || [];

    if (team.length === 0) return null; // Or a placeholder indicating future availability

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {team.map(member => (
                    <Card key={member.id} className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-white">{member.name}</h3>
                            <p className="text-cyan-400 text-sm mb-3">{member.role}</p>
                            <div className="space-y-2">
                                <div>
                                    <div className="flex justify-between text-xs text-gray-400"><span>Performance</span><span>{member.performance}%</span></div>
                                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-1"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${member.performance}%` }}></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs text-gray-400"><span>AI Adaptability</span><span>{member.aiPotential}%</span></div>
                                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-1"><div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${member.aiPotential}%` }}></div></div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            <Card title="Recruitment Pipeline (AI Sourced)">
                <div className="text-sm text-gray-400 italic mb-2">The Quantum Weaver has identified 3 potential candidates matching your culture vectors.</div>
                <div className="space-y-2">
                    <div className="p-2 bg-gray-800 rounded flex justify-between items-center">
                        <span>Candidate #8842 (Ex-Google DeepMind)</span>
                        <button className="px-3 py-1 bg-cyan-600/20 text-cyan-400 text-xs rounded hover:bg-cyan-600/40">Initiate Contact</button>
                    </div>
                    <div className="p-2 bg-gray-800 rounded flex justify-between items-center">
                        <span>Candidate #1029 (Fintech Founder)</span>
                        <button className="px-3 py-1 bg-cyan-600/20 text-cyan-400 text-xs rounded hover:bg-cyan-600/40">Initiate Contact</button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const LegalShield: FC = () => {
    // This component is out of MVP scope.
    const { data } = useLegal();
    const docs = data?.getLegalStatus || [];

    if (docs.length === 0) return null; // Or a placeholder indicating future availability

    return (
        <Card title="Compliance & Legal Governance">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-gray-800 text-gray-200 uppercase font-medium">
                        <tr>
                            <th className="p-3">Document</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Risk Score</th>
                            <th className="p-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {docs.map(doc => (
                            <tr key={doc.id} className="hover:bg-gray-800/50 transition-colors">
                                <td className="p-3 font-medium text-white">{doc.name}</td>
                                <td className="p-3">
                                    <Badge color={doc.status === 'SIGNED' ? 'bg-green-900 text-green-200' : doc.status === 'REVIEW' ? 'bg-yellow-900 text-yellow-200' : 'bg-gray-700'}>
                                        {doc.status}
                                    </Badge>
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center">
                                        <span className={`mr-2 ${doc.riskScore > 50 ? 'text-red-400' : 'text-green-400'}`}>{doc.riskScore}</span>
                                        <AIInsightBubble context={`Legal risk for ${doc.name}`} />
                                    </div>
                                </td>
                                <td className="p-3">
                                    <button className="text-cyan-400 hover:underline">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
*/

const GlobalChatOverlay: FC<{ context: string }> = ({ context }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ sender: 'user' | 'ai', text: string }[]>([]);
    const { mutate, isPending, isError, error } = useGenerateAiChat();

    const handleSend = () => {
        if (!input.trim()) return;
        const msg = input;
        setMessages(prev => [...prev, { sender: 'user', text: msg }]);
        setInput('');
        mutate({ message: msg, context }, {
            onSuccess: (data) => setMessages(prev => [...prev, { sender: 'ai', text: data.generateAIChatResponse }]),
            onError: (err) => setMessages(prev => [...prev, { sender: 'ai', text: `Error: ${err.message}` }])
        });
    };

    return (
        <div className={`fixed bottom-0 right-0 z-50 transition-all duration-300 ${isOpen ? 'w-96 h-[600px]' : 'w-12 h-12'} bg-gray-900 border-t border-l border-gray-700 shadow-2xl rounded-tl-xl overflow-hidden`}>
            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="w-full h-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                </button>
            )}
            {isOpen && (
                <div className="flex flex-col h-full">
                    <div className="p-3 bg-gray-800 flex justify-between items-center border-b border-gray-700">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="font-bold text-white text-sm">AI Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">&times;</button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-black/20 custom-scrollbar">
                        {messages.length === 0 && <div className="text-center text-gray-500 text-xs mt-10">System Online. Awaiting input.</div>}
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-2 rounded-lg text-sm ${m.sender === 'user' ? 'bg-cyan-700 text-white' : 'bg-gray-800 text-gray-300'}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isPending && <div className="text-xs text-gray-500 animate-pulse">Computing...</div>}
                        {isError && <div className="text-xs text-red-400">Error: {error?.message}</div>}
                    </div>
                    <div className="p-3 bg-gray-800 border-t border-gray-700">
                        <div className="flex space-x-2">
                            <input
                                className="flex-grow bg-gray-900 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-cyan-500"
                                placeholder="Command the system..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSend()}
                                disabled={isPending}
                            />
                            <button onClick={handleSend} className="px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-500 disabled:opacity-50" disabled={isPending}>Send</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SystemAlertsWidget: FC = () => {
    const { data, isLoading, isError, error } = useAlerts();
    const alerts = data?.getSystemAlerts || [];
    if (isLoading) return <div className="mb-6 text-gray-500">Loading alerts...</div>;
    if (isError) return <div className="mb-6 text-red-400">Error loading alerts: {error?.message}</div>;
    if (alerts.length === 0) return null;

    return (
        <div className="mb-6 space-y-2">
            {alerts.map(alert => (
                <div key={alert.id} className={`p-3 rounded-lg border flex items-start space-x-3 ${alert.severity === 'HIGH' ? 'bg-red-900/20 border-red-500/50' : 'bg-blue-900/20 border-blue-500/50'}`}>
                    <div className={`mt-1 w-2 h-2 rounded-full ${alert.severity === 'HIGH' ? 'bg-red-500 animate-ping' : 'bg-blue-500'}`}></div>
                    <div>
                        <div className="text-sm font-bold text-white">{alert.severity} PRIORITY ALERT</div>
                        <div className="text-xs text-gray-300">{alert.message}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- MAIN VIEW CONTROLLER ---

const QuantumWeaverContent: FC = () => {
    const { userId } = useAuth(); // Get userId from AuthContext
    const [activeModule, setActiveModule] = useState<'DASHBOARD' | 'STRATEGY' | 'FINANCE' | 'MARKET'>('DASHBOARD'); // MVP modules only
    const { data: userPlans } = useUserPlans(userId || ''); // Pass userId from auth context
    const { mutate: startAnalysis, isPending: isStarting } = useStartAnalysis();
    const [planInput, setPlanInput] = useState('');
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

    // Determine active workflow for Strategy View
    // Prioritize selectedWorkflowId, then the most recent plan, otherwise null
    const activeWorkflowId = selectedWorkflowId || (userPlans?.getUserPlans?.[0]?.workflowId) || null;
    const { data: analysisStatus, isLoading: isAnalysisLoading, isError: isAnalysisError, error: analysisError } = useAnalysisStatus(activeWorkflowId);
    const workflowData = analysisStatus?.getBusinessPlanAnalysisStatus;

    // Fetch user profile for sidebar display
    const { data: userProfileData } = useUserProfile(userId || '');
    const userProfile = userProfileData?.getUserProfile;

    const renderModule = () => {
        switch (activeModule) {
            case 'FINANCE': return <FinancialDashboard />;
            case 'MARKET': return <MarketIntelligence />;
            case 'STRATEGY':
                return (
                    <div className="space-y-6">
                        {!activeWorkflowId ? (
                            <Card title="Initialize Strategic Core">
                                <textarea
                                    value={planInput}
                                    onChange={(e) => setPlanInput(e.target.value)}
                                    placeholder="Input strategic parameters for analysis (e.g., 'Develop a market entry strategy for Southeast Asia fintech market')."
                                    className="w-full h-32 bg-gray-800 border border-gray-600 rounded-lg p-3 text-white mb-4 focus:ring-2 focus:ring-cyan-500 outline-none"
                                />
                                <button
                                    onClick={() => userId && startAnalysis({ plan: planInput, userId })}
                                    disabled={isStarting || !planInput.trim() || !userId}
                                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                                >
                                    {isStarting ? 'Processing...' : 'Execute Analysis Protocol'}
                                </button>
                                {!userId && <p className="text-red-400 text-sm mt-2">Authentication required to start analysis.</p>}
                            </Card>
                        ) : (
                            <>
                                {isAnalysisLoading && <div className="text-center p-10 text-cyan-400 animate-pulse">Quantum Analysis in Progress...</div>}
                                {isAnalysisError && <div className="text-center p-10 text-red-400">Error loading analysis: {analysisError?.message}</div>}
                                {workflowData?.result && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <Card title="Strategic Output">
                                            <p className="text-gray-300 mb-4">{workflowData.result.feedback}</p>
                                            <div className="grid grid-cols-3 gap-2 mb-4">
                                                <div className="bg-gray-800 p-2 rounded text-center">
                                                    <div className="text-xs text-gray-400">Viability</div>
                                                    <div className="text-xl font-bold text-green-400">{workflowData.result.metrics?.viability.toFixed(0)}%</div>
                                                </div>
                                                <div className="bg-gray-800 p-2 rounded text-center">
                                                    <div className="text-xs text-gray-400">Market Fit</div>
                                                    <div className="text-xl font-bold text-indigo-400">{workflowData.result.metrics?.marketFit.toFixed(0)}%</div>
                                                </div>
                                                <div className="bg-gray-800 p-2 rounded text-center">
                                                    <div className="text-xs text-gray-400">Risk</div>
                                                    <div className="text-xl font-bold text-red-400">{workflowData.result.metrics?.risk.toFixed(0)}%</div>
                                                </div>
                                            </div>
                                            {workflowData.result.coachingPlan && (
                                                <div className="mt-4 p-3 bg-gray-800 border border-indigo-700 rounded-lg">
                                                    <h4 className="font-bold text-indigo-400 text-sm mb-2">{workflowData.result.coachingPlan.title}</h4>
                                                    <p className="text-xs text-gray-400">{workflowData.result.coachingPlan.summary}</p>
                                                    {/* Further details like steps could be rendered here */}
                                                </div>
                                            )}
                                            <button onClick={() => setSelectedWorkflowId(null)} className="text-xs text-cyan-400 hover:underline mt-4">Initiate New Analysis</button>
                                        </Card>
                                        <Card title="Growth Projection">
                                            <div className="h-48">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={workflowData.result.growthProjections}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                        <XAxis dataKey="month" hide />
                                                        <YAxis hide />
                                                        <Tooltip contentStyle={{ backgroundColor: '#111827' }} />
                                                        <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                            {workflowData.result.potentialMentors && workflowData.result.potentialMentors.length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="font-bold text-gray-300 text-sm mb-2">Potential Mentors</h4>
                                                    <div className="flex items-center space-x-2">
                                                        {workflowData.result.potentialMentors.map(mentor => (
                                                            <div key={mentor.id} className="flex items-center space-x-2 bg-gray-800 p-2 rounded-lg text-xs">
                                                                <img src={mentor.imageUrl} alt={mentor.name} className="w-6 h-6 rounded-full" />
                                                                <span className="text-white">{mentor.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );
            case 'DASHBOARD':
            default:
                return (
                    <div className="space-y-6">
                        <SystemAlertsWidget />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card title="Financial Health" className="cursor-pointer hover:border-cyan-500 transition-colors" onClick={() => setActiveModule('FINANCE')}>
                                <div className="text-3xl font-bold text-green-400">94/100</div>
                                <div className="text-sm text-gray-400 mt-2">Runway Optimized</div>
                            </Card>
                            <Card title="Market Position" className="cursor-pointer hover:border-cyan-500 transition-colors" onClick={() => setActiveModule('MARKET')}>
                                <div className="text-3xl font-bold text-indigo-400">Leader</div>
                                <div className="text-sm text-gray-400 mt-2">Top 5% in Sector</div>
                            </Card>
                            <Card title="Operational Efficiency" className="cursor-pointer hover:border-cyan-500 transition-colors">
                                {/* This card is descriptive, but navigation is handled by MVP scope. No direct module for it. */}
                                <div className="text-3xl font-bold text-cyan-400">98.2%</div>
                                <div className="text-sm text-gray-400 mt-2">AI Automation Active</div>
                            </Card>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <FinancialDashboard />
                            <MarketIntelligence />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-950 text-white overflow-hidden font-sans">
            {/* SIDEBAR NAVIGATION */}
            <div className="w-64 bg-black border-r border-gray-800 flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-2xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">FINOS<span className="text-white text-xs align-top">PRO</span></h1>
                    <p className="text-xs text-gray-500 mt-1">Business OS v1.0 (MVP)</p>
                </div>
                <nav className="flex-grow p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {[
                        { id: 'DASHBOARD', label: 'Command Center', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                        { id: 'STRATEGY', label: 'Quantum Strategy', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                        { id: 'FINANCE', label: 'Treasury & Finance', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                        { id: 'MARKET', label: 'Market Intelligence', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                        // Removed 'TEAM' and 'LEGAL' from MVP navigation
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveModule(item.id as any)}
                            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${activeModule === item.id ? 'bg-cyan-900/30 text-cyan-400 border-r-2 border-cyan-400' : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'}`}
                        >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
                            <span className="text-sm font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
                            {userProfile?.username ? userProfile.username.substring(0,2).toUpperCase() : 'AU'}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white">{userProfile?.username || 'Authenticated User'}</div>
                            <div className="text-xs text-gray-500">Standard Access</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto custom-scrollbar bg-gray-950 relative">
                {/* HEADER */}
                <header className="sticky top-0 z-20 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">{activeModule === 'DASHBOARD' ? 'System Overview' : activeModule.charAt(0) + activeModule.slice(1).toLowerCase()}</h2>
                        <p className="text-xs text-gray-400">System Status: <span className="text-green-400">Nominal</span> | AI Latency: 12ms</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="p-2 text-gray-400 hover:text-white relative">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* CONTENT */}
                <div className="p-6 pb-24">
                    {/* NARRATIVE CONTEXT */}
                    <div className="mb-8 p-4 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg">
                        <h3 className="text-sm font-bold text-cyan-500 uppercase tracking-wider mb-2">System Operational Guidelines 1.0 (MVP)</h3>
                        <p className="text-gray-300 text-sm leading-relaxed italic">
                            "This Minimum Viable Product focuses on core financial oversight and strategic AI-driven insights. Iterative development will introduce further modules as validated by business need. Stability and security are paramount."
                            <br/><span className="text-gray-500 not-italic mt-1 block">&mdash; System Administrator</span>
                        </p>
                    </div>

                    {renderModule()}
                </div>

                {/* GLOBAL CHAT */}
                {userId && <GlobalChatOverlay context={activeModule} />}
            </main>
        </div>
    );
};

const queryClient = new QueryClient();

const QuantumWeaverView: FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <QuantumWeaverContent />
            </AuthProvider>
        </QueryClientProvider>
    );
};

export default QuantumWeaverView;