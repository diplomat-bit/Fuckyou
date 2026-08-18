
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ArrowUpRight, DollarSign, Target, Zap, TrendingUp, Briefcase, Cpu, ShieldCheck, BarChart3, Rocket, Search, Loader2, MessageSquareText, UserCheck, Globe, BrainCircuit, Atom, Scale, Users, Network, SlidersHorizontal, AlertTriangle, CheckCircle, Clock, ExternalLink, X } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

// --- Types ---

interface Startup {
  id: number;
  name: string;
  ticker: string;
  sector: string;
  valuation: number; // in millions USD
  fundraisingGoal: number; // in millions USD
  amountRaised: number; // in millions USD
  investors: number;
  description: string;
  growthRate: number; // percentage
  stage: 'Seed' | 'Series A' | 'Growth' | 'Pre-IPO' | 'Decentralized Genesis';
  syndicateLead: string;
  complianceScore: number; // 0-100
  techStack: string[];
  threatVector: {
    geopolitical: number;
    market: number;
    technological: number;
  };
  governanceModel: 'Centralized' | 'DAO Hybrid' | 'Fully Autonomous';
  quantumEntanglementID: string;
  founderReputationScore: number;
  marketSaturation: number;
  ipPortfolioStrength: number;
  societalImpactRating: 'A' | 'B' | 'C';
  hyperlaneConnectivity: boolean;
  aiMetrics: {
    riskScore: number;
    growthProjection: number;
    sentiment: string;
    disruptionIndex: number;
    marketPenetrationVector: number;
    geinScore: number;
    alphaFactor: number;
    teamSynergy: number;
  };
}

// --- AI Service Logic ---

const getAIAnalysis = async (startup: Startup) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Perform a comprehensive venture capital analysis for the following company:
    Name: ${startup.name}
    Ticker: ${startup.ticker}
    Sector: ${startup.sector}
    Description: ${startup.description}
    Valuation: $${startup.valuation}M
    Stage: ${startup.stage}
    
    Include a summary of current market trends in ${startup.sector} using your search tools, and provide an "Alpha Factor" projection. Be professional and data-driven.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "Analysis unavailable.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        uri: chunk.web?.uri,
        title: chunk.web?.title
    })).filter((s: any) => s.uri && s.title) || [];

    return { text, sources };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return { text: "Error connecting to Sovereign AI Core. Using cached heuristic model.", sources: [] };
  }
};

const aiAnalyzeDealFlow = (startup: Partial<Startup>): Startup['aiMetrics'] => {
    const baseRisk = 100 - (startup.growthRate || 0) * 1.5 - ((startup.founderReputationScore || 0) / 10);
    const riskScore = Math.max(10, Math.min(95, baseRisk + ((startup.valuation || 0) / 1000) - ((startup.ipPortfolioStrength || 0) / 10)));
    const growthProjection = (startup.growthRate || 0) * (1 + ((startup.amountRaised || 0) / (startup.fundraisingGoal || 1)) * 0.1);
    const disruptionIndex = ((startup.growthRate || 0) * 0.5) + ((startup.valuation || 0) / 100) + (100 - (startup.complianceScore || 0)) * 0.2 + ((startup.ipPortfolioStrength || 0) * 0.1);
    const marketPenetrationVector = Math.random() * 90;
    
    let sentiment = 'Neutral';
    if (growthProjection > 40) sentiment = 'Highly Positive';
    else if (riskScore < 30) sentiment = 'Low Risk/High Reward';
    else if (riskScore > 70) sentiment = 'Caution Advised';

    const geinScore = (startup.societalImpactRating === 'A' ? 200 : startup.societalImpactRating === 'B' ? 100 : 25) + ((startup.valuation || 0) / 5) + ((startup.ipPortfolioStrength || 0) * 1.5) + (startup.hyperlaneConnectivity ? 50 : 0);
    const alphaFactor = 1 + ((startup.founderReputationScore || 0) / 200) + (disruptionIndex / 500);
    const teamSynergy = Math.floor(Math.random() * 15) + 85;

    return {
        riskScore: parseFloat(riskScore.toFixed(1)),
        growthProjection: parseFloat(growthProjection.toFixed(2)),
        sentiment: sentiment,
        disruptionIndex: parseFloat(disruptionIndex.toFixed(1)),
        marketPenetrationVector: parseFloat(marketPenetrationVector.toFixed(1)),
        geinScore: parseFloat(geinScore.toFixed(1)),
        alphaFactor: parseFloat(alphaFactor.toFixed(2)),
        teamSynergy: parseFloat(teamSynergy.toFixed(1)),
    };
};

// --- Mock Data ---

const generateMockStartups = (count: number): Startup[] => {
  const sectors = ['Fintech', 'HealthTech', 'AgriTech', 'EdTech', 'Clean Energy', 'AI/ML', 'Logistics', 'Quantum Computing', 'BioPharma', 'Web3 Infrastructure'];
  const stages: Startup['stage'][] = ['Seed', 'Series A', 'Growth', 'Pre-IPO', 'Decentralized Genesis'];
  const governanceModels: Startup['governanceModel'][] = ['Centralized', 'DAO Hybrid', 'Fully Autonomous'];
  const techStacks = [['PQL', 'Rust', 'WASM'], ['Solidity', 'React', 'Node.js'], ['Python', 'TensorFlow', 'Kubernetes'], ['Go', 'Postgres', 'gRPC']];
  const societalImpactRatings: Startup['societalImpactRating'][] = ['A', 'B', 'C'];

  return Array.from({ length: count }, (_, i) => {
    const valuation = Math.floor(Math.random() * 900) + 10;
    const goal = Math.floor(valuation * 0.1) + 1;
    const raised = Math.floor(Math.random() * goal * 0.95) + 0.1;
    const growth = Math.random() * 50 + 5;
    const compliance = Math.floor(Math.random() * 30) + 70;
    const founderReputationScore = Math.floor(Math.random() * 40) + 60;
    const marketSaturation = Math.random() * 70;
    const ipPortfolioStrength = Math.floor(Math.random() * 50) + 50;
    const hyperlaneConnectivity = Math.random() > 0.3;

    const baseStartup: Omit<Startup, 'aiMetrics'> = {
      id: i + 1,
      name: `Ascendant Dynamics ${i + 1}`,
      ticker: `AD${1000 + i}`,
      sector: sectors[i % sectors.length],
      valuation: parseFloat(valuation.toFixed(1)),
      fundraisingGoal: parseFloat(goal.toFixed(1)),
      amountRaised: parseFloat(raised.toFixed(1)),
      investors: Math.floor(Math.random() * 20) + 1,
      description: `A paradigm-shifting enterprise leveraging distributed ledger technology for next-generation supply chain optimization and verifiable provenance tracking across global markets.`,
      growthRate: parseFloat(growth.toFixed(1)),
      stage: stages[i % stages.length],
      syndicateLead: `Global Capital Partners ${i % 3 + 1}`,
      complianceScore: compliance,
      techStack: techStacks[i % techStacks.length],
      threatVector: {
        geopolitical: parseFloat((Math.random() * 30).toFixed(1)),
        market: parseFloat((Math.random() * 50 + 20).toFixed(1)),
        technological: parseFloat((Math.random() * 40 + 10).toFixed(1)),
      },
      governanceModel: governanceModels[i % governanceModels.length],
      quantumEntanglementID: `QE-0x${(Math.random().toString(16) + '0000000000000').substr(2, 12).toUpperCase()}`,
      founderReputationScore,
      marketSaturation: parseFloat(marketSaturation.toFixed(1)),
      ipPortfolioStrength,
      societalImpactRating: societalImpactRatings[i % societalImpactRatings.length],
      hyperlaneConnectivity,
    };

    const aiMetrics = aiAnalyzeDealFlow(baseStartup);
    return { ...baseStartup, aiMetrics } as Startup;
  });
};

const mockStartups_initial = generateMockStartups(100);

// --- Components ---

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string; change?: string; aiInsight?: string; }> = ({ icon: Icon, title, value, change, aiInsight }) => (
  <Card className="bg-gray-900 border-l-4 border-cyan-500/50 hover:shadow-cyan-500/20 shadow-lg transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-300 uppercase tracking-wider">{title}</CardTitle>
      <Icon className="h-5 w-5 text-cyan-400" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-extrabold text-white">{value}</div>
      {change && <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{change} vs QTD</p>}
      {aiInsight && (
        <div className="mt-3 pt-2 border-t border-gray-800">
            <p className="text-xs text-gray-500 flex items-center">
                <Cpu className="w-3 h-3 mr-1 text-indigo-400"/> AI Insight: {aiInsight}
            </p>
        </div>
      )}
    </CardContent>
  </Card>
);

const StartupCard: React.FC<{ startup: Startup; onInvest: (startup: Startup, amount: number) => void; onViewDetails: (startup: Startup) => void; }> = ({ startup, onInvest, onViewDetails }) => {
  const [investmentAmount, setInvestmentAmount] = useState('');
  const progress = (startup.amountRaised / startup.fundraisingGoal) * 100;

  const handleInvest = () => {
    const amount = parseFloat(investmentAmount);
    if (!isNaN(amount) && amount > 0) {
      onInvest(startup, amount);
      setInvestmentAmount('');
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 overflow-hidden group hover:border-cyan-500/50 transition-all">
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-900/30 rounded-lg flex items-center justify-center text-cyan-400 font-bold">
            {startup.ticker.substring(0, 2)}
          </div>
          <div>
            <CardTitle className="text-white text-lg">{startup.name}</CardTitle>
            <p className="text-xs text-gray-500">{startup.sector} • {startup.stage}</p>
          </div>
        </div>
        <Badge variant={startup.aiMetrics.riskScore > 70 ? 'destructive' : 'default'} className="text-[10px]">
          {startup.aiMetrics.sentiment}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <p className="text-xs text-gray-400 line-clamp-2">{startup.description}</p>
        
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>Progress: ${startup.amountRaised}M / ${startup.fundraisingGoal}M</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-2 bg-gray-900/50 rounded border border-gray-700">
            <p className="text-[10px] text-gray-500 uppercase">Valuation</p>
            <p className="text-sm font-bold text-white font-mono">${startup.valuation}M</p>
          </div>
          <div className="p-2 bg-gray-900/50 rounded border border-gray-700">
            <p className="text-[10px] text-gray-500 uppercase">Growth</p>
            <p className="text-sm font-bold text-green-400 font-mono">+{startup.growthRate}%</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input 
            type="number" 
            placeholder="Amount (M)" 
            value={investmentAmount}
            onChange={e => setInvestmentAmount(e.target.value)}
            className="flex-1 bg-gray-900 border-gray-700 text-white h-9 text-xs"
          />
          <Button onClick={handleInvest} className="bg-cyan-600 hover:bg-cyan-500 h-9 px-3 text-xs text-white">
            Invest
          </Button>
          <Button variant="outline" onClick={() => onViewDetails(startup)} className="h-9 px-3 text-xs border-gray-700 text-gray-300">
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const VentureCapitalDesk: React.FC = () => {
    const [startups, setStartups] = useState<Startup[]>(mockStartups_initial);
    const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<{ text: string, sources: any[] } | null>(null);

    const handleInvest = (startup: Startup, amount: number) => {
        setStartups(prev => prev.map(s => {
            if (s.id === startup.id) {
                return { ...s, amountRaised: s.amountRaised + amount, investors: s.investors + 1 };
            }
            return s;
        }));
    };

    const handleViewDetails = async (startup: Startup) => {
        setSelectedStartup(startup);
        setIsAnalysisLoading(true);
        setAiAnalysis(null);
        const analysis = await getAIAnalysis(startup);
        setAiAnalysis(analysis);
        setIsAnalysisLoading(false);
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end border-b border-gray-800 pb-4">
                <div>
                    <h2 className="text-4xl font-extrabold text-white tracking-tighter">VENTURE CAPITAL DESK</h2>
                    <p className="text-gray-400 text-sm">Managing Alpha-Tier Growth Opportunities</p>
                </div>
                <div className="flex gap-4">
                    <StatCard icon={TrendingUp} title="AUM" value="$1.2B" change="+14.2%" />
                    <StatCard icon={Target} title="Active Deals" value="42" change="+3" />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {startups.map(startup => (
                    <StartupCard 
                        key={startup.id} 
                        startup={startup} 
                        onInvest={handleInvest} 
                        onViewDetails={handleViewDetails} 
                    />
                ))}
            </div>

            {selectedStartup && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-4xl w-full bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-white text-2xl">{selectedStartup.name} Analysis</CardTitle>
                            <Button variant="ghost" onClick={() => setSelectedStartup(null)} className="text-gray-400">
                                <X size={24} />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-cyan-400 font-bold uppercase text-xs tracking-widest">Company Overview</h4>
                                    <p className="text-gray-300 text-sm">{selectedStartup.description}</p>
                                    <Separator className="bg-gray-800" />
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-gray-500">Sector</span><span className="text-white">{selectedStartup.sector}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Stage</span><span className="text-white">{selectedStartup.stage}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Valuation</span><span className="text-white">${selectedStartup.valuation}M</span></div>
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                    <h4 className="text-indigo-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                                        <BrainCircuit size={16} /> Sovereign AI Intelligence Report
                                    </h4>
                                    <div className="bg-gray-950 rounded-xl p-6 border border-indigo-500/30">
                                        {isAnalysisLoading ? (
                                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                                <p className="text-indigo-300 font-mono text-xs animate-pulse">SYNCHRONIZING WITH SOVEREIGN AI CORE...</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{aiAnalysis?.text}</p>
                                                {aiAnalysis?.sources && aiAnalysis.sources.length > 0 && (
                                                    <div className="pt-4 border-t border-gray-800">
                                                        <h5 className="text-[10px] text-gray-500 uppercase font-bold mb-2">Grounding Sources</h5>
                                                        <div className="flex flex-wrap gap-2">
                                                            {aiAnalysis.sources.map((source, i) => (
                                                                <a key={i} href={source.uri} target="_blank" rel="noreferrer" className="text-[10px] bg-gray-900 border border-gray-700 px-2 py-1 rounded text-cyan-400 hover:border-cyan-400 transition-colors flex items-center gap-1">
                                                                    <Globe size={10} /> {source.title}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default VentureCapitalDesk;
