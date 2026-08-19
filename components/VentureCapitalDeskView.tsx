





import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ArrowUpRight, DollarSign, Target, Zap, TrendingUp, Briefcase, Cpu, ShieldCheck, BarChart3, Rocket, Search, Loader2, MessageSquareText, UserCheck, Globe, BrainCircuit, Atom, Scale, Users, Network, SlidersHorizontal, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

// --- AI Integration Mockup ---
// In a real system, these would be complex API calls to the core AI engine.
const aiAnalyzeDealFlow = (startup: Startup): { riskScore: number; growthProjection: number; sentiment: string; disruptionIndex: number; marketPenetrationVector: number; geinScore: number; alphaFactor: number; teamSynergy: number; } => {
    // Simulating deep AI analysis based on internal metrics
    const baseRisk = 100 - startup.growthRate * 1.5 - (startup.founderReputationScore / 10);
    const riskScore = Math.max(10, Math.min(95, baseRisk + (startup.valuation / 1000) - startup.ipPortfolioStrength / 10));
    const growthProjection = startup.growthRate * (1 + (startup.amountRaised / startup.fundraisingGoal) * 0.1);
    const disruptionIndex = (startup.growthRate * 0.5) + (startup.valuation / 100) + (100 - startup.complianceScore) * 0.2 + startup.ipPortfolioStrength * 0.1;
    const marketPenetrationVector = Math.random() * 90;
    
    let sentiment = 'Neutral';
    if (growthProjection > 40) sentiment = 'Highly Positive';
    else if (riskScore < 30) sentiment = 'Low Risk/High Reward';
    else if (riskScore > 70) sentiment = 'Caution Advised';

    const geinScore = (startup.societalImpactRating === 'A' ? 200 : startup.societalImpactRating === 'B' ? 100 : 25) + (startup.valuation / 5) + (startup.ipPortfolioStrength * 1.5) + (startup.hyperlaneConnectivity ? 50 : 0);
    const alphaFactor = 1 + (startup.founderReputationScore / 200) + (disruptionIndex / 500);
    const teamSynergy = Math.floor(Math.random() * 15) + 85; // 85-100%

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

const aiGenerateExecutiveSummary = (startup: Startup): string => {
    const analysis = startup.aiMetrics;
    return `AI Executive Summary for ${startup.name} (${startup.ticker}):
    Valuation: $${startup.valuation}M. Goal: $${startup.fundraisingGoal}M raised: $${startup.amountRaised}M.
    The proprietary AI risk assessment places this opportunity at a ${analysis.riskScore}% risk score, with a projected Alpha Factor of ${analysis.alphaFactor}x. The overall sentiment is ${analysis.sentiment}.
    With a Disruption Index of ${analysis.disruptionIndex} and a GEIN Score of ${analysis.geinScore}, this asset is poised for significant market capture and positive societal impact. The AI recommends immediate allocation based on sector alignment, stage maturity, and a positive quantum entanglement forecast.`;
};

// --- Mock Data Structure (Simulating the 100 integrated companies) ---

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
  // New features based on instruction
  founderReputationScore: number; // 0-100
  marketSaturation: number; // percentage
  ipPortfolioStrength: number; // 0-100
  societalImpactRating: 'A' | 'B' | 'C';
  hyperlaneConnectivity: boolean;
  aiMetrics: {
    riskScore: number;
    growthProjection: number;
    sentiment: string;
    disruptionIndex: number;
    marketPenetrationVector: number;
    geinScore: number; // Global Economic Impact Nexus
    alphaFactor: number;
    teamSynergy: number;
  };
}

const generateMockStartups = (count: number): Startup[] => {
  const sectors = ['Fintech', 'HealthTech', 'AgriTech', 'EdTech', 'Clean Energy', 'AI/ML', 'Logistics', 'Quantum Computing', 'BioPharma', 'Web3 Infrastructure'];
  const stages: Startup['stage'][] = ['Seed', 'Series A', 'Growth', 'Pre-IPO', 'Decentralized Genesis'];
  const governanceModels: Startup['governanceModel'][] = ['Centralized', 'DAO Hybrid', 'Fully Autonomous'];
  const techStacks = [['PQL', 'Rust', 'WASM'], ['Solidity', 'React', 'Node.js'], ['Python', 'TensorFlow', 'Kubernetes'], ['Go', 'Postgres', 'gRPC']];
  const societalImpactRatings: Startup['societalImpactRating'][] = ['A', 'B', 'C'];

  return Array.from({ length: count }, (_, i) => {
    const valuation = Math.floor(Math.random() * 900) + 10; // 10M to 1000M
    const goal = Math.floor(valuation * 0.1) + 1; // 1M to 100M
    const raised = Math.floor(Math.random() * goal * 0.95) + 0.1;
    const growth = Math.random() * 50 + 5;
    const compliance = Math.floor(Math.random() * 30) + 70; // Mostly compliant
    const founderReputationScore = Math.floor(Math.random() * 40) + 60; // 60-100
    const marketSaturation = Math.random() * 70; // 0-70%
    const ipPortfolioStrength = Math.floor(Math.random() * 50) + 50; // 50-100
    const hyperlaneConnectivity = Math.random() > 0.3; // 70% chance of true

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

    const aiMetrics = aiAnalyzeDealFlow(baseStartup as Startup);

    return { ...baseStartup, aiMetrics };
  });
};

const mockStartups: Startup[] = generateMockStartups(100);

// --- Sub-components for better structure ---

interface StatCardProps { 
    icon: React.ElementType; 
    title: string; 
    value: string; 
    change?: string; 
    aiInsight?: string; 
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, change, aiInsight }) => (
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

interface StartupCardProps { 
    startup: Startup; 
    onInvest: (startup: Startup, amount: number) => void;
    onViewDetails: (startup: Startup) => void;
}

const StartupCard: React.FC<StartupCardProps> = ({ startup, onInvest, onViewDetails }) => {
  const [investmentAmount, setInvestmentAmount] = useState('');
  const progress = (startup.amountRaised / startup.fundraisingGoal) * 100;
  const ai = startup.aiMetrics;

  const handleInvest = () => {
    const amount = parseFloat(investmentAmount);
    if (!isNaN(amount) && amount > 0 && amount <= (startup.fundraisingGoal - startup.amountRaised) * 1000000) {
      onInvest(startup, amount);
      setInvestmentAmount('');
    } else if (amount > (startup.fundraisingGoal - startup.amountRaised) * 1000000) {
        alert(`Investment exceeds remaining goal of $${(startup.fundraisingGoal - startup.amountRaised).toFixed(2)}M.`);
    } else {
        alert("Please enter a valid positive investment amount.");
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'bg-green-600/20 text-green-400 border-green-500';
    if (score < 60) return 'bg-yellow-600/20 text-yellow-400 border-yellow-500';
    return 'bg-red-600/20 text-red-400 border-red-500';
  };

  return (
    <Card className="flex flex-col h-full bg-gray-900 border border-gray-800 hover:border-cyan-500/50 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-white hover:text-cyan-400 cursor-pointer" onClick={() => onViewDetails(startup)}>{startup.name}</CardTitle>
            <p className="text-sm text-gray-400 mt-1 flex items-center">
                <Globe className="w-3 h-3 mr-1"/> {startup.sector} | <span className='ml-1 font-mono text-xs text-gray-500'>{startup.ticker}</span>
            </p>
          </div>
          <Badge variant="default" className={`text-xs font-semibold ${startup.stage === 'Pre-IPO' ? 'bg-purple-600' : 'bg-cyan-600'}`}>{startup.stage}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4 pt-0">
        <p className="text-sm text-gray-400 line-clamp-3 italic">{startup.description}</p>
        
        <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-800 pt-3">
            <div className='flex flex-col'>
                <span className="text-xs text-gray-500 uppercase">Valuation</span>
                <span className="font-bold text-white">${startup.valuation.toFixed(1)}M</span>
            </div>
            <div className='flex flex-col'>
                <span className="text-xs text-gray-500 uppercase">Governance</span>
                <span className="font-semibold text-indigo-400 text-sm">{startup.governanceModel}</span>
            </div>
        </div>

        {/* AI Metrics Snapshot */}
        <div className="space-y-2 p-2 bg-gray-800/50 rounded-lg border border-indigo-700/50">
            <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-300 flex items-center'><TrendingUp className='w-3 h-3 mr-1'/> Projected Growth</span>
                <span className='font-bold text-green-400'>{ai.growthProjection.toFixed(1)}%</span>
            </div>
            <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-300 flex items-center'><BrainCircuit className='w-3 h-3 mr-1'/> Disruption Index</span>
                <span className='font-bold text-yellow-400'>{ai.disruptionIndex.toFixed(1)}</span>
            </div>
            <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-300 flex items-center'><Globe className='w-3 h-3 mr-1'/> GEIN Score</span>
                <span className='font-bold text-cyan-400'>{ai.geinScore.toFixed(0)}</span>
            </div>
            <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-300 flex items-center'><Zap className='w-3 h-3 mr-1'/> AI Sentiment</span>
                <Badge variant="secondary" className={`px-2 py-0.5 text-xs ${getRiskColor(ai.riskScore)} border`}>{ai.sentiment}</Badge>
            </div>
        </div>

        {/* Fundraising Progress */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Capital Deployed</span>
            <span className='font-semibold'>{progress.toFixed(1)}%</span>
          </div>
          <Progress value={((startup.amountRaised / startup.fundraisingGoal) * 100)} className='h-2 bg-gray-700' />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>${startup.amountRaised.toFixed(1)}M raised</span>
            <span>Goal: ${startup.fundraisingGoal.toFixed(1)}M</span>
          </div>
        </div>

        {/* Investment Interface */}
        <div className="flex space-x-2 pt-2 border-t border-gray-800">
          <Input 
            type="number" 
            placeholder="USD (M)" 
            className="flex-grow text-sm bg-gray-800 border-gray-700 focus:border-cyan-500" 
            value={investmentAmount} 
            onChange={(e) => setInvestmentAmount(e.target.value)}
            min="0.01"
            step="0.1"
          />
          <Button 
            variant="default"
            onClick={handleInvest} 
            disabled={!investmentAmount || parseFloat(investmentAmount) <= 0}
            className="bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            Commit
          </Button>
        </div>
        <Button variant="outline" className='w-full text-xs' onClick={() => onViewDetails(startup)}>
            Deep Dive Analysis <ArrowUpRight className="ml-1 h-3 w-3"/>
        </Button>
      </CardContent>
    </Card>
  );
};

// --- Modal for Deep Dive Analysis ---
interface DetailModalProps {
    startup: Startup;
    onClose: () => void;
    onInvest: (startup: Startup, amount: number) => void;
}

const DeepDiveModal: React.FC<DetailModalProps> = ({ startup, onClose, onInvest }) => {
    const [localInvestment, setLocalInvestment] = useState('');
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('synthesis');

    const ai = startup.aiMetrics;
    const remainingGoal = startup.fundraisingGoal - startup.amountRaised;

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setSummary(aiGenerateExecutiveSummary(startup));
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [startup]);

    const handleCommit = () => {
        const amount = parseFloat(localInvestment);
        if (!isNaN(amount) && amount > 0 && amount <= remainingGoal) {
            onInvest(startup, amount * 1000000); // Convert Millions input to USD
            onClose();
        } else {
            alert(`Invalid amount. Must be between $0.01M and $${remainingGoal.toFixed(2)}M.`);
        }
    };

    const tabs = [
        { id: 'synthesis', label: 'AI Synthesis', icon: MessageSquareText },
        { id: 'financials', label: 'Financials', icon: BarChart3 },
        { id: 'risk', label: 'Risk Matrix', icon: ShieldCheck },
        { id: 'team', label: 'Team & Leadership', icon: Users },
        { id: 'market', label: 'Market Landscape', icon: Network },
        { id: 'tech', label: 'Technology & IP', icon: Atom },
        { id: 'gein', label: 'GEIN Analysis', icon: Globe },
        { id: 'governance', label: 'Governance', icon: Scale },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-gray-950 border-cyan-500/50 shadow-2xl">
                <CardHeader className="flex-shrink-0 bg-gray-950 z-10 border-b border-gray-800 flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="text-3xl text-white">{startup.name} Deep Dive</CardTitle>
                        <p className="text-md text-cyan-400 mt-1">{startup.sector} | {startup.ticker} | {startup.stage}</p>
                    </div>
                    <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
                        <Cpu className="w-6 h-6 rotate-90" />
                    </Button>
                </CardHeader>
                <div className="flex flex-grow overflow-hidden">
                    <nav className="w-48 flex-shrink-0 border-r border-gray-800 p-4 space-y-2">
                        {tabs.map(tab => (
                            <Button
                                key={tab.id}
                                variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                                className={`w-full justify-start ${activeTab === tab.id ? 'bg-cyan-800/50 text-white' : 'text-gray-400'}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon className="w-4 h-4 mr-2" />
                                {tab.label}
                            </Button>
                        ))}
                        <Separator className="my-4 bg-gray-700" />
                        <div className='p-4 bg-gray-800 rounded-lg space-y-3'>
                            <p className='text-sm text-gray-300'>Commit Capital (M):</p>
                            <Input 
                                type="number" 
                                placeholder={`Max: ${remainingGoal.toFixed(2)}M`} 
                                className="w-full text-lg bg-gray-700 border-gray-600 focus:border-cyan-500" 
                                value={localInvestment} 
                                onChange={(e) => setLocalInvestment(e.target.value)}
                                min="0.01"
                                step="0.1"
                            />
                            <Button 
                                variant="default"
                                onClick={handleCommit} 
                                disabled={!localInvestment || parseFloat(localInvestment) <= 0 || parseFloat(localInvestment) > remainingGoal}
                                className="w-full bg-green-600 hover:bg-green-700 text-white text-base py-2"
                            >
                                <UserCheck className='w-4 h-4 mr-2'/> Execute
                            </Button>
                        </div>
                    </nav>
                    <CardContent className="flex-grow overflow-y-auto p-6 space-y-6">
                        {activeTab === 'synthesis' && (
                            <div>
                                <div className="p-4 bg-indigo-900/20 border border-indigo-700 rounded-lg">
                                    <h3 className="text-xl font-semibold text-indigo-300 flex items-center mb-2"><MessageSquareText className='w-5 h-5 mr-2'/> AI Synthesis Report</h3>
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-8 text-gray-400"><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Generating Billion-Dollar Insights...</div>
                                    ) : (
                                        <p className="whitespace-pre-wrap text-gray-200 leading-relaxed text-sm">{summary}</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                    <StatCard icon={DollarSign} title="Valuation" value={`$${startup.valuation.toFixed(1)}M`} aiInsight={`AI projects ${ai.growthProjection.toFixed(1)}% growth.`} />
                                    <StatCard icon={Target} title="Remaining Raise" value={`$${remainingGoal.toFixed(2)}M`} />
                                    <StatCard icon={BrainCircuit} title="Disruption Index" value={`${ai.disruptionIndex}`} change="+5.2%" />
                                    <StatCard icon={Zap} title="AI Risk Score" value={`${ai.riskScore}%`} />
                                </div>
                            </div>
                        )}
                        {activeTab === 'financials' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Financial Overview</h3>
                                <div className='space-y-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Fundraising Trajectory</p>
                                        <Progress value={((startup.amountRaised / startup.fundraisingGoal) * 100)} className='h-3 bg-gray-700 mt-2' />
                                        <p className='text-xs text-gray-500 mt-1'>${startup.amountRaised.toFixed(1)}M of ${startup.fundraisingGoal.toFixed(1)}M raised ({(startup.amountRaised / startup.fundraisingGoal * 100).toFixed(1)}%)</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Capitalization Table (Simulated)</p>
                                        <div className='text-sm mt-2 space-y-1 text-gray-300'>
                                            <p>Founders: 45%</p>
                                            <p>Seed Investors: 20%</p>
                                            <p>Series A (Current): 25% (Target)</p>
                                            <p>ESOP: 10%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'risk' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">AI-Powered Risk Matrix</h3>
                                <div className='space-y-4 p-3 bg-gray-900 rounded-lg'>
                                    {Object.entries(startup.threatVector).map(([key, value]) => (
                                        <div key={key}>
                                            <div className='flex justify-between text-sm text-gray-300 capitalize mb-1'>
                                                <span>{key} Threat</span>
                                                <span className={(value as number) > 50 ? 'text-red-400' : (value as number) > 25 ? 'text-yellow-400' : 'text-green-400'}>{value}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-700 rounded">
                                                <div className={`h-2 rounded ${(value as number) > 50 ? 'bg-red-500' : (value as number) > 25 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${value}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'team' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Team & Leadership Analysis</h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Founder Reputation Score</p>
                                        <p className='text-2xl font-bold text-cyan-400 mt-1'>{startup.founderReputationScore}/100</p>
                                        <p className='text-xs text-gray-400'>AI analysis indicates strong prior exits and domain expertise.</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>AI-Projected Team Synergy</p>
                                        <p className='text-2xl font-bold text-green-400 mt-1'>{ai.teamSynergy}%</p>
                                        <p className='text-xs text-gray-400'>Optimal skill distribution and communication efficiency.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'market' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Market Landscape</h3>
                                <div className='space-y-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Sector</p>
                                        <p className='text-lg font-bold text-white mt-1'>{startup.sector}</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Market Saturation</p>
                                        <p className='text-lg font-bold text-yellow-400 mt-1'>{startup.marketSaturation}%</p>
                                        <p className='text-xs text-gray-400'>Significant greenfield opportunity remains.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'tech' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Technology & IP Moat</h3>
                                <div className='space-y-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Core Tech Stack</p>
                                        <div className='flex flex-wrap gap-2 mt-2'>
                                            {startup.techStack.map(tech => <Badge key={tech} variant="secondary">{tech}</Badge>)}
                                        </div>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>IP Portfolio Strength</p>
                                        <p className='text-lg font-bold text-indigo-400 mt-1'>{startup.ipPortfolioStrength}/100</p>
                                        <p className='text-xs text-gray-400'>Multiple patents filed in key jurisdictions.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'gein' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Global Economic Impact Nexus (GEIN)</h3>
                                <div className='space-y-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>GEIN Score</p>
                                        <p className='text-3xl font-extrabold text-cyan-400 mt-1'>{ai.geinScore}</p>
                                        <p className='text-xs text-gray-400'>Composite score indicating potential for positive global economic and societal impact.</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Societal Impact Rating</p>
                                        <p className='text-2xl font-bold text-green-400 mt-1'>Grade: {startup.societalImpactRating}</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Hyperlane Connectivity</p>
                                        <p className={`text-lg font-bold mt-1 ${startup.hyperlaneConnectivity ? 'text-green-400' : 'text-yellow-400'}`}>{startup.hyperlaneConnectivity ? 'Established' : 'Pending'}</p>
                                        <p className='text-xs text-gray-400'>Integration with next-generation decentralized data fabrics.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'governance' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Governance & Compliance</h3>
                                <div className='space-y-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Governance Model</p>
                                        <p className='text-lg font-bold text-cyan-400 mt-1'>{startup.governanceModel}</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Compliance Score</p>
                                        <p className='text-lg font-bold text-green-400 mt-1'>{startup.complianceScore}%</p>
                                        <p className='text-xs text-gray-400'>AI projects minimal regulatory friction.</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Syndicate Lead</p>
                                        <p className='text-lg font-bold text-indigo-400 mt-1'>{startup.syndicateLead}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </div>
            </Card>
        </div>
    );
};


// --- Main Component: VentureCapitalDesk ---

const VentureCapitalDesk: React.FC = () => {
  const [startups, setStartups] = useState<Startup[]>(mockStartups); 
  const [searchTerm, setSearchTerm] = useState('');
  const [portfolioValue] = useState(15000000000); // Mock portfolio value: $15 Billion
  const [deployedCapital] = useState(4200000000); // Mock deployed capital: $4.2 Billion
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);

  const handleInvest = useCallback((investedStartup: Startup, amount: number) => {
    setStartups(prevStartups =>
      prevStartups.map(s =>
        s.id === investedStartup.id
          ? { 
              ...s, 
              amountRaised: s.amountRaised + amount / 1000000, 
              investors: s.investors + 1,
              aiMetrics: aiAnalyzeDealFlow({ ...s, amountRaised: s.amountRaised + amount / 1000000 } as Startup)
            }
          : s
      )
    );
    console.log(`Investment of $${(amount / 1000000).toFixed(2)}M committed to ${investedStartup.name}`);
  }, []);

  const filteredStartups = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return startups
        .filter(s => 
            s.name.toLowerCase().includes(lowerSearchTerm) ||
            s.sector.toLowerCase().includes(lowerSearchTerm) ||
            s.ticker.toLowerCase().includes(lowerSearchTerm)
        )
        .sort((a, b) => b.aiMetrics.disruptionIndex - a.aiMetrics.disruptionIndex);
  }, [startups, searchTerm]);

  const totalPortfolioExposure = useMemo(() => {
      return startups.reduce((sum, s) => sum + s.amountRaised, 0);
  }, [startups]);

  const handleViewDetails = useCallback((startup: Startup) => {
    setSelectedStartup(startup);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedStartup(null);
  }, []);

  return (
    <div className="space-y-8 p-4 md:p-8 min-h-screen bg-gray-950 text-white">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-cyan-400">Quantum Capital Nexus</h1>
          <p className="text-lg text-gray-400 mt-1">Advanced Investment Platform // Portfolio Management Layer 7</p>
        </div>
        <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30">
          Execute Automated Allocation <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </header>

      <Card className="bg-gray-900 border-2 border-red-700/50 shadow-xl shadow-red-900/10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-400 flex items-center"><Cpu className='w-6 h-6 mr-2'/> IDGAF.AI Protocol Mandate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-300">
          <p className="text-base italic border-l-4 border-red-500 pl-3">
            "I DO GIVE A F$#%"
          </p>
          <p className="text-sm text-gray-500"> Core Directive 001, Deployed by the Architect.</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Briefcase} title="Total Portfolio Value" value={`$${(portfolioValue / 1000000000).toFixed(2)}B`} change="+1.8%" aiInsight="AI predicts sustained 1.5% MoM appreciation." />
        <StatCard icon={DollarSign} title="Capital Deployed" value={`$${(deployedCapital / 1000000000).toFixed(2)}B`} aiInsight={`Exposure at ${((totalPortfolioExposure / portfolioValue) * 100).toFixed(1)}% of fund capacity.`} />
        <StatCard icon={Rocket} title="Avg. Disruption Index" value={`${(startups.reduce((sum, s) => sum + s.aiMetrics.disruptionIndex, 0) / startups.length).toFixed(1)}`} change="+0.4%" aiInsight="Sector diversification optimized." />
        <StatCard icon={Globe} title="Avg. GEIN Score" value={`${(startups.reduce((sum, s) => sum + s.aiMetrics.geinScore, 0) / startups.length).toFixed(0)}`} change="+1.2%" aiInsight="Positive societal impact correlation." />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center pt-4 border-t border-gray-800">
        <div className="relative flex-grow w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
                placeholder="Search by Name, Ticker, or Sector (e.g., 'Fintech' or 'AD1005')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 bg-gray-800 border-gray-700 focus:border-cyan-500"
            />
        </div>
        <Badge variant="secondary" className='text-sm py-2 px-4 bg-gray-800 border border-gray-700 text-gray-300'>
            Displaying {filteredStartups.length} Opportunities
        </Badge>
      </div>

      {filteredStartups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStartups.map(startup => (
            <StartupCard 
                key={startup.id} 
                startup={startup} 
                onInvest={handleInvest} 
                onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-700 rounded-xl bg-gray-900/50">
            <Target className="w-10 h-10 mx-auto text-gray-600 mb-3"/>
            <h3 className="text-xl font-semibold text-gray-400">No Opportunities Match Query</h3>
            <p className="text-gray-500">Adjust your search parameters or wait for the next AI pipeline ingestion cycle.</p>
        </div>
      )}

      {selectedStartup && (
        <DeepDiveModal 
            startup={selectedStartup} 
            onClose={handleCloseDetails} 
            onInvest={handleInvest}
        />
      )}
    </div>
  );
};

export default VentureCapitalDesk;

// --- CONSOLIDATED FROM: VentureCapitalDeskView (2).tsx ---


import React, { useState, useCallback, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Tabs, Tab, Form, Table, Navbar, Nav, NavDropdown, ListGroup, ProgressBar, Alert, Breadcrumb, InputGroup, FormControl, Dropdown, DropdownButton, OverlayTrigger, Tooltip, Popover } from 'react-bootstrap';
import { DealFlow } from './DealFlow';
import { InvestmentForm } from './InvestmentForm';
import { PortfolioCompanyList } from './PortfolioCompanyList';
import { PortfolioCompanyDetails } from './PortfolioCompanyDetails';

// The James Burvel O'Callaghan III Code - Venture Capital Desk View

const VentureCapitalDeskView = () => {

    // A. State Variables
    const [A1_activeTab, A2_setActiveTab] = useState('A3_dealFlow');
    const [A4_selectedCompany, A5_setSelectedCompany] = useState<string | null>(null);
    const [A6_searchTerm, A7_setSearchTerm] = useState('');
    const [A8_showSettings, A9_setShowSettings] = useState(false);
    const [AA_dealFlowData, AB_setDealFlowData] = useState([
        { id: '1', companyName: 'AlphaTech Solutions', stage: 'Seed', industry: 'Software', location: 'San Francisco', investmentNeeded: 500000, status: 'Active' },
        { id: '2', companyName: 'Beta Innovations', stage: 'Series A', industry: 'Biotech', location: 'Boston', investmentNeeded: 2000000, status: 'Review' },
        { id: '3', companyName: 'Gamma Dynamics', stage: 'Series B', industry: 'AI', location: 'New York', investmentNeeded: 5000000, status: 'Approved' },
    ]);
    const [AC_portfolioCompanies, AD_setPortfolioCompanies] = useState([
        { id: 'pc1', name: 'Delta Corp', industry: 'Fintech', location: 'London', valuation: 10000000 },
        { id: 'pc2', name: 'Epsilon Ventures', industry: 'Healthcare', location: 'Chicago', valuation: 5000000 },
    ]);
    const [AE_investmentAmount, AF_setInvestmentAmount] = useState(100000);
    const [AG_riskTolerance, AH_setRiskTolerance] = useState('Medium');
    const [AI_showNotifications, AJ_setShowNotifications] = useState(false);
    const [AK_notifications, AL_setNotifications] = useState([
        { id: 'n1', message: 'New deal flow: AlphaTech Solutions', type: 'info' },
        { id: 'n2', message: 'Portfolio company Delta Corp valuation increased', type: 'success' },
    ]);
    const [AM_userProfile, AN_setUserProfile] = useState({ name: 'John Doe', title: 'Investment Manager', email: 'john.doe@example.com' });
    const [AO_marketData, AP_setMarketData] = useState({ dow: 34000, nasdaq: 14000, sp500: 4400 });

    // B. Handlers and Callbacks
    const B1_handleSelectCompany = useCallback((companyId: string) => { A5_setSelectedCompany(companyId); A2_setActiveTab('B2_portfolioCompaniesDetails'); }, [A5_setSelectedCompany, A2_setActiveTab]);
    const B3_handleBackToPortfolio = useCallback(() => { A5_setSelectedCompany(null); A2_setActiveTab('B4_portfolioCompanies'); }, [A5_setSelectedCompany, A2_setActiveTab]);
    const B5_handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { A7_setSearchTerm(e.target.value); }, [A7_setSearchTerm]);
    const B6_handleSettingsToggle = useCallback(() => { A9_setShowSettings(!A8_showSettings); }, [A8_showSettings, A9_setShowSettings]);
    const B7_handleInvestmentAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { AF_setInvestmentAmount(parseInt(e.target.value, 10) || 0); }, [AF_setInvestmentAmount]);
    const B8_handleRiskToleranceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => { AH_setRiskTolerance(e.target.value); }, [AH_setRiskTolerance]);
    const B9_handleShowNotifications = useCallback(() => { AJ_setShowNotifications(!AI_showNotifications); }, [AI_showNotifications, AJ_setShowNotifications]);
    const BA_addDealFlow = useCallback((newDeal: any) => { AB_setDealFlowData([...AA_dealFlowData, { ...newDeal, id: String(Date.now()) }]); }, [AA_dealFlowData, AB_setDealFlowData]);
    const BB_updateDealFlowStatus = useCallback((id: string, status: string) => { AB_setDealFlowData(AA_dealFlowData.map(deal => deal.id === id ? { ...deal, status } : deal)); }, [AA_dealFlowData, AB_setDealFlowData]);
    const BC_removeDealFlow = useCallback((id: string) => { AB_setDealFlowData(AA_dealFlowData.filter(deal => deal.id !== id)); }, [AA_dealFlowData, AB_setDealFlowData]);
    const BD_addPortfolioCompany = useCallback((newCompany: any) => { AD_setPortfolioCompanies([...AC_portfolioCompanies, { ...newCompany, id: String(Date.now()) }]); }, [AC_portfolioCompanies, AD_setPortfolioCompanies]);
    const BE_updatePortfolioCompany = useCallback((id: string, updatedCompany: any) => { AD_setPortfolioCompanies(AC_portfolioCompanies.map(company => company.id === id ? { ...company, ...updatedCompany } : company)); }, [AC_portfolioCompanies, AD_setPortfolioCompanies]);
    const BF_removePortfolioCompany = useCallback((id: string) => { AD_setPortfolioCompanies(AC_portfolioCompanies.filter(company => company.id !== id)); }, [AC_portfolioCompanies, AD_setPortfolioCompanies]);
    const BG_createNotification = useCallback((message: string, type: string) => { AL_setNotifications([...AK_notifications, { id: String(Date.now()), message, type }]); }, [AK_notifications, AL_setNotifications]);
    const BH_removeNotification = useCallback((id: string) => { AL_setNotifications(AK_notifications.filter(notification => notification.id !== id)); }, [AK_notifications, AL_setNotifications]);

    // C. Memoized Values
    const C1_filteredDealFlow = useMemo(() => AA_dealFlowData.filter(deal => deal.companyName.toLowerCase().includes(A6_searchTerm.toLowerCase())), [AA_dealFlowData, A6_searchTerm]);
    const C2_totalInvestment = useMemo(() => AC_portfolioCompanies.reduce((acc, company) => acc + company.valuation, 0), [AC_portfolioCompanies]);
    const C3_riskAdjustedInvestment = useMemo(() => { return AG_riskTolerance === 'High' ? AE_investmentAmount * 1.5 : AG_riskTolerance === 'Low' ? AE_investmentAmount * 0.5 : AE_investmentAmount; }, [AE_investmentAmount, AG_riskTolerance]);

    // D. Component Rendering
    return (
        <Container fluid className="mt-3">
            <Navbar bg="light" expand="lg">
                <Navbar.Brand>The James Burvel O'Callaghan III Code - VC Desk</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link onClick={() => A2_setActiveTab('D1_dealFlow')}>Deal Flow</Nav.Link>
                        <Nav.Link onClick={() => A2_setActiveTab('D2_investmentForm')}>New Investment</Nav.Link>
                        <Nav.Link onClick={() => A2_setActiveTab('D3_portfolioCompanies')}>Portfolio Companies</Nav.Link>
                        <NavDropdown title="More" id="basic-nav-dropdown">
                            <NavDropdown.Item onClick={B6_handleSettingsToggle}>Settings</NavDropdown.Item>
                            <NavDropdown.Item onClick={B9_handleShowNotifications}>Notifications ({AK_notifications.length})</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item>Help</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Form inline>
                        <InputGroup>
                            <FormControl type="text" placeholder="Search Companies" className="mr-sm-2" value={A6_searchTerm} onChange={B5_handleSearchChange} />
                            <InputGroup.Append>
                                <Button variant="outline-success">Search</Button>
                            </InputGroup.Append>
                        </InputGroup>
                    </Form>
                </Navbar.Collapse>
            </Navbar>

            {AI_showNotifications && (
                <ListGroup className="mt-3">
                    {AK_notifications.map(notification => (
                        <ListGroup.Item key={notification.id} variant={notification.type}>
                            {notification.message}
                            <Button variant="outline-danger" size="sm" className="float-right" onClick={() => BH_removeNotification(notification.id)}>
                                Dismiss
                            </Button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}

            <Row>
                <Col>
                    <h1>Venture Capital Desk</h1>
                    <p>Manage investments, track deal flow, and oversee portfolio companies. User: {AM_userProfile.name} ({AM_userProfile.title})</p>
                    <Alert variant="info">Market Data: Dow {AP_marketData.dow}, Nasdaq {AP_marketData.nasdaq}, S&P 500 {AP_marketData.sp500}</Alert>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Tabs
                        activeKey={A1_activeTab}
                        onSelect={(tab) => A2_setActiveTab(tab || 'D4_dealFlow')}
                        id="vc-desk-tabs"
                        className="mb-3"
                    >
                        <Tab eventKey="D5_dealFlow" title="Deal Flow">
                            <DealFlowTable dealFlowData={C1_filteredDealFlow} updateDealFlowStatus={BB_updateDealFlowStatus} removeDealFlow={BC_removeDealFlow} />
                            <NewDealFlowForm addDealFlow={BA_addDealFlow} />
                        </Tab>
                        <Tab eventKey="D6_investmentForm" title="New Investment">
                            <InvestmentFormSection investmentAmount={AE_investmentAmount} riskTolerance={AG_riskTolerance} handleInvestmentAmountChange={B7_handleInvestmentAmountChange} handleRiskToleranceChange={B8_handleRiskToleranceChange} riskAdjustedInvestment={C3_riskAdjustedInvestment} />
                        </Tab>
                        {A4_selectedCompany ? (
                            <Tab eventKey="D7_portfolioCompaniesDetails" title="Portfolio Company Details">
                                <Button onClick={B3_handleBackToPortfolio} variant="link">Back to Portfolio</Button>
                                <PortfolioCompanyDetails companyId={A4_selectedCompany} />
                            </Tab>
                        ) : (
                            <Tab eventKey="D8_portfolioCompanies" title="Portfolio Companies">
                                <PortfolioCompanyList onSelectCompany={B1_handleSelectCompany} portfolioCompanies={AC_portfolioCompanies} />
                                <PortfolioSummary totalInvestment={C2_totalInvestment} />
                            </Tab>
                        )}

                    </Tabs>
                </Col>
            </Row>

            {A8_showSettings && (
                <SettingsPanel userProfile={AM_userProfile} setUserProfile={AN_setUserProfile} />
            )}

            <Footer />
        </Container>
    );
};

// E. Sub-Components

const DealFlowTable = ({ dealFlowData, updateDealFlowStatus, removeDealFlow }: { dealFlowData: any[], updateDealFlowStatus: (id: string, status: string) => void, removeDealFlow: (id: string) => void }) => {
    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Company</th>
                    <th>Stage</th>
                    <th>Industry</th>
                    <th>Location</th>
                    <th>Investment Needed</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {dealFlowData.map(deal => (
                    <tr key={deal.id}>
                        <td>{deal.companyName}</td>
                        <td>{deal.stage}</td>
                        <td>{deal.industry}</td>
                        <td>{deal.location}</td>
                        <td>{deal.investmentNeeded}</td>
                        <td>
                            <Form.Control as="select" value={deal.status} onChange={(e) => updateDealFlowStatus(deal.id, e.target.value)}>
                                <option>Active</option>
                                <option>Review</option>
                                <option>Approved</option>
                                <option>Rejected</option>
                            </Form.Control>
                        </td>
                        <td>
                            <Button variant="danger" size="sm" onClick={() => removeDealFlow(deal.id)}>Remove</Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

const NewDealFlowForm = ({ addDealFlow }: { addDealFlow: (newDeal: any) => void }) => {
    const [E1_companyName, E2_setCompanyName] = useState('');
    const [E3_stage, E4_setStage] = useState('');
    const [E5_industry, E6_setIndustry] = useState('');
    const [E7_location, E8_setLocation] = useState('');
    const [E9_investmentNeeded, EA_setInvestmentNeeded] = useState(0);

    const EB_handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addDealFlow({ companyName: E1_companyName, stage: E3_stage, industry: E5_industry, location: E7_location, investmentNeeded: E9_investmentNeeded, status: 'Active' });
        E2_setCompanyName('');
        E4_setStage('');
        E6_setIndustry('');
        E8_setLocation('');
        EA_setInvestmentNeeded(0);
    };

    return (
        <Card>
            <Card.Body>
                <Card.Title>Add New Deal Flow</Card.Title>
                <Form onSubmit={EB_handleSubmit}>
                    <Form.Group controlId="formCompanyName">
                        <Form.Label>Company Name</Form.Label>
                        <Form.Control type="text" placeholder="Enter company name" value={E1_companyName} onChange={(e) => E2_setCompanyName(e.target.value)} required />
                    </Form.Group>
                    <Form.Group controlId="formStage">
                        <Form.Label>Stage</Form.Label>
                        <Form.Control type="text" placeholder="Enter stage" value={E3_stage} onChange={(e) => E4_setStage(e.target.value)} required />
                    </Form.Group>
                    <Form.Group controlId="formIndustry">
                        <Form.Label>Industry</Form.Label>
                        <Form.Control type="text" placeholder="Enter industry" value={E5_industry} onChange={(e) => E6_setIndustry(e.target.value)} required />
                    </Form.Group>
                    <Form.Group controlId="formLocation">
                        <Form.Label>Location</Form.Label>
                        <Form.Control type="text" placeholder="Enter location" value={E7_location} onChange={(e) => E8_setLocation(e.target.value)} required />
                    </Form.Group>
                    <Form.Group controlId="formInvestmentNeeded">
                        <Form.Label>Investment Needed</Form.Label>
                        <Form.Control type="number" placeholder="Enter investment needed" value={E9_investmentNeeded} onChange={(e) => EA_setInvestmentNeeded(parseInt(e.target.value, 10) || 0)} required />
                    </Form.Group>
                    <Button variant="primary" type="submit">Add Deal</Button>
                </Form>
            </Card.Body>
        </Card>
    );
};

const InvestmentFormSection = ({ investmentAmount, riskTolerance, handleInvestmentAmountChange, handleRiskToleranceChange, riskAdjustedInvestment }: { investmentAmount: number, riskTolerance: string, handleInvestmentAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void, handleRiskToleranceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, riskAdjustedInvestment: number }) => {
    return (
        <Card>
            <Card.Body>
                <Card.Title>Investment Parameters</Card.Title>
                <Form>
                    <Form.Group controlId="formInvestmentAmount">
                        <Form.Label>Investment Amount</Form.Label>
                        <Form.Control type="number" placeholder="Enter investment amount" value={investmentAmount} onChange={handleInvestmentAmountChange} />
                    </Form.Group>
                    <Form.Group controlId="formRiskTolerance">
                        <Form.Label>Risk Tolerance</Form.Label>
                        <Form.Control as="select" value={riskTolerance} onChange={handleRiskToleranceChange}>
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </Form.Control>
                    </Form.Group>
                    <Alert variant="success">Risk Adjusted Investment: ${riskAdjustedInvestment}</Alert>
                </Form>
            </Card.Body>
        </Card>
    );
};

const PortfolioSummary = ({ totalInvestment }: { totalInvestment: number }) => {
    return (
        <Card>
            <Card.Body>
                <Card.Title>Portfolio Summary</Card.Title>
                <Card.Text>Total Investment: ${totalInvestment}</Card.Text>
            </Card.Body>
        </Card>
    );
};

const SettingsPanel = ({ userProfile, setUserProfile }: { userProfile: any, setUserProfile: (profile: any) => void }) => {
    const [F1_name, F2_setName] = useState(userProfile.name);
    const [F3_title, F4_setTitle] = useState(userProfile.title);
    const [F5_email, F6_setEmail] = useState(userProfile.email);

    const F7_handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setUserProfile({ name: F1_name, title: F3_title, email: F5_email });
    };

    return (
        <Card>
            <Card.Body>
                <Card.Title>Settings</Card.Title>
                <Form onSubmit={F7_handleSubmit}>
                    <Form.Group controlId="formName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" value={F1_name} onChange={(e) => F2_setName(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="formTitle">
                        <Form.Label>Title</Form.Label>
                        <Form.Control type="text" value={F3_title} onChange={(e) => F4_setTitle(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="formEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" value={F5_email} onChange={(e) => F6_setEmail(e.target.value)} />
                    </Form.Group>
                    <Button variant="primary" type="submit">Update Profile</Button>
                </Form>
            </Card.Body>
        </Card>
    );
};

const Footer = () => {
    return (
        <footer className="mt-5 text-center">
            <p>&copy; 2024 The James Burvel O'Callaghan III Code. All rights reserved.</p>
        </footer>
    );
};

export default VentureCapitalDeskView;

const aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

// --- CONSOLIDATED FROM: VentureCapitalDeskView_1.tsx ---







import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ArrowUpRight, DollarSign, Target, Zap, TrendingUp, Briefcase, Cpu, ShieldCheck, BarChart3, Rocket, Search, Loader2, MessageSquareText, UserCheck, Globe, BrainCircuit, Atom, Scale, Users, Network, SlidersHorizontal, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

// --- AI Integration Mockup ---
// In a real system, these would be complex API calls to the core AI engine.
const aiAnalyzeDealFlow = (startup: Startup): { riskScore: number; growthProjection: number; sentiment: string; disruptionIndex: number; marketPenetrationVector: number; geinScore: number; alphaFactor: number; teamSynergy: number; } => {
    // Simulating deep AI analysis based on internal metrics
    const baseRisk = 100 - startup.growthRate * 1.5 - (startup.founderReputationScore / 10);
    const riskScore = Math.max(10, Math.min(95, baseRisk + (startup.valuation / 1000) - startup.ipPortfolioStrength / 10));
    const growthProjection = startup.growthRate * (1 + (startup.amountRaised / startup.fundraisingGoal) * 0.1);
    const disruptionIndex = (startup.growthRate * 0.5) + (startup.valuation / 100) + (100 - startup.complianceScore) * 0.2 + startup.ipPortfolioStrength * 0.1;
    const marketPenetrationVector = Math.random() * 90;
    
    let sentiment = 'Neutral';
    if (growthProjection > 40) sentiment = 'Highly Positive';
    else if (riskScore < 30) sentiment = 'Low Risk/High Reward';
    else if (riskScore > 70) sentiment = 'Caution Advised';

    const geinScore = (startup.societalImpactRating === 'A' ? 200 : startup.societalImpactRating === 'B' ? 100 : 25) + (startup.valuation / 5) + (startup.ipPortfolioStrength * 1.5) + (startup.hyperlaneConnectivity ? 50 : 0);
    const alphaFactor = 1 + (startup.founderReputationScore / 200) + (disruptionIndex / 500);
    const teamSynergy = Math.floor(Math.random() * 15) + 85; // 85-100%

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

const aiGenerateExecutiveSummary = (startup: Startup): string => {
    const analysis = startup.aiMetrics;
    return `AI Executive Summary for ${startup.name} (${startup.ticker}):
    Valuation: $${startup.valuation}M. Goal: $${startup.fundraisingGoal}M raised: $${startup.amountRaised}M.
    The proprietary AI risk assessment places this opportunity at a ${analysis.riskScore}% risk score, with a projected Alpha Factor of ${analysis.alphaFactor}x. The overall sentiment is ${analysis.sentiment}.
    With a Disruption Index of ${analysis.disruptionIndex} and a GEIN Score of ${analysis.geinScore}, this asset is poised for significant market capture and positive societal impact. The AI recommends immediate allocation based on sector alignment, stage maturity, and a positive quantum entanglement forecast.`;
};

// --- Mock Data Structure (Simulating the 100 integrated companies) ---

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
  // New features based on instruction
  founderReputationScore: number; // 0-100
  marketSaturation: number; // percentage
  ipPortfolioStrength: number; // 0-100
  societalImpactRating: 'A' | 'B' | 'C';
  hyperlaneConnectivity: boolean;
  aiMetrics: {
    riskScore: number;
    growthProjection: number;
    sentiment: string;
    disruptionIndex: number;
    marketPenetrationVector: number;
    geinScore: number; // Global Economic Impact Nexus
    alphaFactor: number;
    teamSynergy: number;
  };
}

const generateMockStartups = (count: number): Startup[] => {
  const sectors = ['Fintech', 'HealthTech', 'AgriTech', 'EdTech', 'Clean Energy', 'AI/ML', 'Logistics', 'Quantum Computing', 'BioPharma', 'Web3 Infrastructure'];
  const stages: Startup['stage'][] = ['Seed', 'Series A', 'Growth', 'Pre-IPO', 'Decentralized Genesis'];
  const governanceModels: Startup['governanceModel'][] = ['Centralized', 'DAO Hybrid', 'Fully Autonomous'];
  const techStacks = [['PQL', 'Rust', 'WASM'], ['Solidity', 'React', 'Node.js'], ['Python', 'TensorFlow', 'Kubernetes'], ['Go', 'Postgres', 'gRPC']];
  const societalImpactRatings: Startup['societalImpactRating'][] = ['A', 'B', 'C'];

  return Array.from({ length: count }, (_, i) => {
    const valuation = Math.floor(Math.random() * 900) + 10; // 10M to 1000M
    const goal = Math.floor(valuation * 0.1) + 1; // 1M to 100M
    const raised = Math.floor(Math.random() * goal * 0.95) + 0.1;
    const growth = Math.random() * 50 + 5;
    const compliance = Math.floor(Math.random() * 30) + 70; // Mostly compliant
    const founderReputationScore = Math.floor(Math.random() * 40) + 60; // 60-100
    const marketSaturation = Math.random() * 70; // 0-70%
    const ipPortfolioStrength = Math.floor(Math.random() * 50) + 50; // 50-100
    const hyperlaneConnectivity = Math.random() > 0.3; // 70% chance of true

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

    const aiMetrics = aiAnalyzeDealFlow(baseStartup as Startup);

    return { ...baseStartup, aiMetrics };
  });
};

const mockStartups: Startup[] = generateMockStartups(100);

// --- Sub-components for better structure ---

interface StatCardProps { 
    icon: React.ElementType; 
    title: string; 
    value: string; 
    change?: string; 
    aiInsight?: string; 
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, change, aiInsight }) => (
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

interface StartupCardProps { 
    startup: Startup; 
    onInvest: (startup: Startup, amount: number) => void;
    onViewDetails: (startup: Startup) => void;
}

const StartupCard: React.FC<StartupCardProps> = ({ startup, onInvest, onViewDetails }) => {
  const [investmentAmount, setInvestmentAmount] = useState('');
  const progress = (startup.amountRaised / startup.fundraisingGoal) * 100;
  const ai = startup.aiMetrics;

  const handleInvest = () => {
    const amount = parseFloat(investmentAmount);
    if (!isNaN(amount) && amount > 0 && amount <= (startup.fundraisingGoal - startup.amountRaised) * 1000000) {
      onInvest(startup, amount);
      setInvestmentAmount('');
    } else if (amount > (startup.fundraisingGoal - startup.amountRaised) * 1000000) {
        alert(`Investment exceeds remaining goal of $${(startup.fundraisingGoal - startup.amountRaised).toFixed(2)}M.`);
    } else {
        alert("Please enter a valid positive investment amount.");
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'bg-green-600/20 text-green-400 border-green-500';
    if (score < 60) return 'bg-yellow-600/20 text-yellow-400 border-yellow-500';
    return 'bg-red-600/20 text-red-400 border-red-500';
  };

  return (
    <Card className="flex flex-col h-full bg-gray-900 border border-gray-800 hover:border-cyan-500/50 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-white hover:text-cyan-400 cursor-pointer" onClick={() => onViewDetails(startup)}>{startup.name}</CardTitle>
            <p className="text-sm text-gray-400 mt-1 flex items-center">
                <Globe className="w-3 h-3 mr-1"/> {startup.sector} | <span className='ml-1 font-mono text-xs text-gray-500'>{startup.ticker}</span>
            </p>
          </div>
          <Badge variant="default" className={`text-xs font-semibold ${startup.stage === 'Pre-IPO' ? 'bg-purple-600' : 'bg-cyan-600'}`}>{startup.stage}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4 pt-0">
        <p className="text-sm text-gray-400 line-clamp-3 italic">{startup.description}</p>
        
        <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-800 pt-3">
            <div className='flex flex-col'>
                <span className="text-xs text-gray-500 uppercase">Valuation</span>
                <span className="font-bold text-white">${startup.valuation.toFixed(1)}M</span>
            </div>
            <div className='flex flex-col'>
                <span className="text-xs text-gray-500 uppercase">Governance</span>
                <span className="font-semibold text-indigo-400 text-sm">{startup.governanceModel}</span>
            </div>
        </div>

        {/* AI Metrics Snapshot */}
        <div className="space-y-2 p-2 bg-gray-800/50 rounded-lg border border-indigo-700/50">
            <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-300 flex items-center'><TrendingUp className='w-3 h-3 mr-1'/> Projected Growth</span>
                <span className='font-bold text-green-400'>{ai.growthProjection.toFixed(1)}%</span>
            </div>
            <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-300 flex items-center'><BrainCircuit className='w-3 h-3 mr-1'/> Disruption Index</span>
                <span className='font-bold text-yellow-400'>{ai.disruptionIndex.toFixed(1)}</span>
            </div>
            <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-300 flex items-center'><Globe className='w-3 h-3 mr-1'/> GEIN Score</span>
                <span className='font-bold text-cyan-400'>{ai.geinScore.toFixed(0)}</span>
            </div>
            <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-300 flex items-center'><Zap className='w-3 h-3 mr-1'/> AI Sentiment</span>
                <Badge variant="secondary" className={`px-2 py-0.5 text-xs ${getRiskColor(ai.riskScore)} border`}>{ai.sentiment}</Badge>
            </div>
        </div>

        {/* Fundraising Progress */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Capital Deployed</span>
            <span className='font-semibold'>{progress.toFixed(1)}%</span>
          </div>
          <Progress value={((startup.amountRaised / startup.fundraisingGoal) * 100)} className='h-2 bg-gray-700' />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>${startup.amountRaised.toFixed(1)}M raised</span>
            <span>Goal: ${startup.fundraisingGoal.toFixed(1)}M</span>
          </div>
        </div>

        {/* Investment Interface */}
        <div className="flex space-x-2 pt-2 border-t border-gray-800">
          <Input 
            type="number" 
            placeholder="USD (M)" 
            className="flex-grow text-sm bg-gray-800 border-gray-700 focus:border-cyan-500" 
            value={investmentAmount} 
            onChange={(e) => setInvestmentAmount(e.target.value)}
            min="0.01"
            step="0.1"
          />
          <Button 
            variant="default"
            onClick={handleInvest} 
            disabled={!investmentAmount || parseFloat(investmentAmount) <= 0}
            className="bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            Commit
          </Button>
        </div>
        <Button variant="outline" className='w-full text-xs' onClick={() => onViewDetails(startup)}>
            Deep Dive Analysis <ArrowUpRight className="ml-1 h-3 w-3"/>
        </Button>
      </CardContent>
    </Card>
  );
};

// --- Modal for Deep Dive Analysis ---
interface DetailModalProps {
    startup: Startup;
    onClose: () => void;
    onInvest: (startup: Startup, amount: number) => void;
}

const DeepDiveModal: React.FC<DetailModalProps> = ({ startup, onClose, onInvest }) => {
    const [localInvestment, setLocalInvestment] = useState('');
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('synthesis');

    const ai = startup.aiMetrics;
    const remainingGoal = startup.fundraisingGoal - startup.amountRaised;

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setSummary(aiGenerateExecutiveSummary(startup));
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [startup]);

    const handleCommit = () => {
        const amount = parseFloat(localInvestment);
        if (!isNaN(amount) && amount > 0 && amount <= remainingGoal) {
            onInvest(startup, amount * 1000000); // Convert Millions input to USD
            onClose();
        } else {
            alert(`Invalid amount. Must be between $0.01M and $${remainingGoal.toFixed(2)}M.`);
        }
    };

    const tabs = [
        { id: 'synthesis', label: 'AI Synthesis', icon: MessageSquareText },
        { id: 'financials', label: 'Financials', icon: BarChart3 },
        { id: 'risk', label: 'Risk Matrix', icon: ShieldCheck },
        { id: 'team', label: 'Team & Leadership', icon: Users },
        { id: 'market', label: 'Market Landscape', icon: Network },
        { id: 'tech', label: 'Technology & IP', icon: Atom },
        { id: 'gein', label: 'GEIN Analysis', icon: Globe },
        { id: 'governance', label: 'Governance', icon: Scale },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-gray-950 border-cyan-500/50 shadow-2xl">
                <CardHeader className="flex-shrink-0 bg-gray-950 z-10 border-b border-gray-800 flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="text-3xl text-white">{startup.name} Deep Dive</CardTitle>
                        <p className="text-md text-cyan-400 mt-1">{startup.sector} | {startup.ticker} | {startup.stage}</p>
                    </div>
                    <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
                        <Cpu className="w-6 h-6 rotate-90" />
                    </Button>
                </CardHeader>
                <div className="flex flex-grow overflow-hidden">
                    <nav className="w-48 flex-shrink-0 border-r border-gray-800 p-4 space-y-2">
                        {tabs.map(tab => (
                            <Button
                                key={tab.id}
                                variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                                className={`w-full justify-start ${activeTab === tab.id ? 'bg-cyan-800/50 text-white' : 'text-gray-400'}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon className="w-4 h-4 mr-2" />
                                {tab.label}
                            </Button>
                        ))}
                        <Separator className="my-4 bg-gray-700" />
                        <div className='p-4 bg-gray-800 rounded-lg space-y-3'>
                            <p className='text-sm text-gray-300'>Commit Capital (M):</p>
                            <Input 
                                type="number" 
                                placeholder={`Max: ${remainingGoal.toFixed(2)}M`} 
                                className="w-full text-lg bg-gray-700 border-gray-600 focus:border-cyan-500" 
                                value={localInvestment} 
                                onChange={(e) => setLocalInvestment(e.target.value)}
                                min="0.01"
                                step="0.1"
                            />
                            <Button 
                                variant="default"
                                onClick={handleCommit} 
                                disabled={!localInvestment || parseFloat(localInvestment) <= 0 || parseFloat(localInvestment) > remainingGoal}
                                className="w-full bg-green-600 hover:bg-green-700 text-white text-base py-2"
                            >
                                <UserCheck className='w-4 h-4 mr-2'/> Execute
                            </Button>
                        </div>
                    </nav>
                    <CardContent className="flex-grow overflow-y-auto p-6 space-y-6">
                        {activeTab === 'synthesis' && (
                            <div>
                                <div className="p-4 bg-indigo-900/20 border border-indigo-700 rounded-lg">
                                    <h3 className="text-xl font-semibold text-indigo-300 flex items-center mb-2"><MessageSquareText className='w-5 h-5 mr-2'/> AI Synthesis Report</h3>
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-8 text-gray-400"><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Generating Billion-Dollar Insights...</div>
                                    ) : (
                                        <p className="whitespace-pre-wrap text-gray-200 leading-relaxed text-sm">{summary}</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                    <StatCard icon={DollarSign} title="Valuation" value={`$${startup.valuation.toFixed(1)}M`} aiInsight={`AI projects ${ai.growthProjection.toFixed(1)}% growth.`} />
                                    <StatCard icon={Target} title="Remaining Raise" value={`$${remainingGoal.toFixed(2)}M`} />
                                    <StatCard icon={BrainCircuit} title="Disruption Index" value={`${ai.disruptionIndex}`} change="+5.2%" />
                                    <StatCard icon={Zap} title="AI Risk Score" value={`${ai.riskScore}%`} />
                                </div>
                            </div>
                        )}
                        {activeTab === 'financials' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Financial Overview</h3>
                                <div className='space-y-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Fundraising Trajectory</p>
                                        <Progress value={((startup.amountRaised / startup.fundraisingGoal) * 100)} className='h-3 bg-gray-700 mt-2' />
                                        <p className='text-xs text-gray-500 mt-1'>${startup.amountRaised.toFixed(1)}M of ${startup.fundraisingGoal.toFixed(1)}M raised ({(startup.amountRaised / startup.fundraisingGoal * 100).toFixed(1)}%)</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Capitalization Table (Simulated)</p>
                                        <div className='text-sm mt-2 space-y-1 text-gray-300'>
                                            <p>Founders: 45%</p>
                                            <p>Seed Investors: 20%</p>
                                            <p>Series A (Current): 25% (Target)</p>
                                            <p>ESOP: 10%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'risk' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">AI-Powered Risk Matrix</h3>
                                <div className='space-y-4 p-3 bg-gray-900 rounded-lg'>
                                    {Object.entries(startup.threatVector).map(([key, value]) => (
                                        <div key={key}>
                                            <div className='flex justify-between text-sm text-gray-300 capitalize mb-1'>
                                                <span>{key} Threat</span>
                                                <span className={(value as number) > 50 ? 'text-red-400' : (value as number) > 25 ? 'text-yellow-400' : 'text-green-400'}>{value}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-700 rounded">
                                                <div className={`h-2 rounded ${(value as number) > 50 ? 'bg-red-500' : (value as number) > 25 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${value}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'team' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Team & Leadership Analysis</h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Founder Reputation Score</p>
                                        <p className='text-2xl font-bold text-cyan-400 mt-1'>{startup.founderReputationScore}/100</p>
                                        <p className='text-xs text-gray-400'>AI analysis indicates strong prior exits and domain expertise.</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>AI-Projected Team Synergy</p>
                                        <p className='text-2xl font-bold text-green-400 mt-1'>{ai.teamSynergy}%</p>
                                        <p className='text-xs text-gray-400'>Optimal skill distribution and communication efficiency.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'market' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Market Landscape</h3>
                                <div className='space-y-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Sector</p>
                                        <p className='text-lg font-bold text-white mt-1'>{startup.sector}</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Market Saturation</p>
                                        <p className='text-lg font-bold text-yellow-400 mt-1'>{startup.marketSaturation}%</p>
                                        <p className='text-xs text-gray-400'>Significant greenfield opportunity remains.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'tech' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Technology & IP Moat</h3>
                                <div className='space-y-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Core Tech Stack</p>
                                        <div className='flex flex-wrap gap-2 mt-2'>
                                            {startup.techStack.map(tech => <Badge key={tech} variant="secondary">{tech}</Badge>)}
                                        </div>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>IP Portfolio Strength</p>
                                        <p className='text-lg font-bold text-indigo-400 mt-1'>{startup.ipPortfolioStrength}/100</p>
                                        <p className='text-xs text-gray-400'>Multiple patents filed in key jurisdictions.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'gein' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Global Economic Impact Nexus (GEIN)</h3>
                                <div className='space-y-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>GEIN Score</p>
                                        <p className='text-3xl font-extrabold text-cyan-400 mt-1'>{ai.geinScore}</p>
                                        <p className='text-xs text-gray-400'>Composite score indicating potential for positive global economic and societal impact.</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Societal Impact Rating</p>
                                        <p className='text-2xl font-bold text-green-400 mt-1'>Grade: {startup.societalImpactRating}</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Hyperlane Connectivity</p>
                                        <p className={`text-lg font-bold mt-1 ${startup.hyperlaneConnectivity ? 'text-green-400' : 'text-yellow-400'}`}>{startup.hyperlaneConnectivity ? 'Established' : 'Pending'}</p>
                                        <p className='text-xs text-gray-400'>Integration with next-generation decentralized data fabrics.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'governance' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Governance & Compliance</h3>
                                <div className='space-y-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Governance Model</p>
                                        <p className='text-lg font-bold text-cyan-400 mt-1'>{startup.governanceModel}</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Compliance Score</p>
                                        <p className='text-lg font-bold text-green-400 mt-1'>{startup.complianceScore}%</p>
                                        <p className='text-xs text-gray-400'>AI projects minimal regulatory friction.</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Syndicate Lead</p>
                                        <p className='text-lg font-bold text-indigo-400 mt-1'>{startup.syndicateLead}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </div>
            </Card>
        </div>
    );
};


// --- Main Component: VentureCapitalDesk ---

const VentureCapitalDesk: React.FC = () => {
  const [startups, setStartups] = useState<Startup[]>(mockStartups); 
  const [searchTerm, setSearchTerm] = useState('');
  const [portfolioValue] = useState(15000000000); // Mock portfolio value: $15 Billion
  const [deployedCapital] = useState(4200000000); // Mock deployed capital: $4.2 Billion
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);

  const handleInvest = useCallback((investedStartup: Startup, amount: number) => {
    setStartups(prevStartups =>
      prevStartups.map(s =>
        s.id === investedStartup.id
          ? { 
              ...s, 
              amountRaised: s.amountRaised + amount / 1000000, 
              investors: s.investors + 1,
              aiMetrics: aiAnalyzeDealFlow({ ...s, amountRaised: s.amountRaised + amount / 1000000 } as Startup)
            }
          : s
      )
    );
    console.log(`Investment of $${(amount / 1000000).toFixed(2)}M committed to ${investedStartup.name}`);
  }, []);

  const filteredStartups = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return startups
        .filter(s => 
            s.name.toLowerCase().includes(lowerSearchTerm) ||
            s.sector.toLowerCase().includes(lowerSearchTerm) ||
            s.ticker.toLowerCase().includes(lowerSearchTerm)
        )
        .sort((a, b) => b.aiMetrics.disruptionIndex - a.aiMetrics.disruptionIndex);
  }, [startups, searchTerm]);

  const totalPortfolioExposure = useMemo(() => {
      return startups.reduce((sum, s) => sum + s.amountRaised, 0);
  }, [startups]);

  const handleViewDetails = useCallback((startup: Startup) => {
    setSelectedStartup(startup);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedStartup(null);
  }, []);

  return (
    <div className="space-y-8 p-4 md:p-8 min-h-screen bg-gray-950 text-white">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-cyan-400">Quantum Capital Nexus</h1>
          <p className="text-lg text-gray-400 mt-1">Advanced Investment Platform // Portfolio Management Layer 7</p>
        </div>
        <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30">
          Execute Automated Allocation <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </header>

      <Card className="bg-gray-900 border-2 border-red-700/50 shadow-xl shadow-red-900/10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-400 flex items-center"><Cpu className='w-6 h-6 mr-2'/> IDGAF.AI Protocol Mandate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-300">
          <p className="text-base italic border-l-4 border-red-500 pl-3">
            "I DO GIVE A F$#%"
          </p>
          <p className="text-sm text-gray-500"> Core Directive 001, Deployed by the Architect.</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Briefcase} title="Total Portfolio Value" value={`$${(portfolioValue / 1000000000).toFixed(2)}B`} change="+1.8%" aiInsight="AI predicts sustained 1.5% MoM appreciation." />
        <StatCard icon={DollarSign} title="Capital Deployed" value={`$${(deployedCapital / 1000000000).toFixed(2)}B`} aiInsight={`Exposure at ${((totalPortfolioExposure / portfolioValue) * 100).toFixed(1)}% of fund capacity.`} />
        <StatCard icon={Rocket} title="Avg. Disruption Index" value={`${(startups.reduce((sum, s) => sum + s.aiMetrics.disruptionIndex, 0) / startups.length).toFixed(1)}`} change="+0.4%" aiInsight="Sector diversification optimized." />
        <StatCard icon={Globe} title="Avg. GEIN Score" value={`${(startups.reduce((sum, s) => sum + s.aiMetrics.geinScore, 0) / startups.length).toFixed(0)}`} change="+1.2%" aiInsight="Positive societal impact correlation." />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center pt-4 border-t border-gray-800">
        <div className="relative flex-grow w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
                placeholder="Search by Name, Ticker, or Sector (e.g., 'Fintech' or 'AD1005')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 bg-gray-800 border-gray-700 focus:border-cyan-500"
            />
        </div>
        <Badge variant="secondary" className='text-sm py-2 px-4 bg-gray-800 border border-gray-700 text-gray-300'>
            Displaying {filteredStartups.length} Opportunities
        </Badge>
      </div>

      {filteredStartups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStartups.map(startup => (
            <StartupCard 
                key={startup.id} 
                startup={startup} 
                onInvest={handleInvest} 
                onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-700 rounded-xl bg-gray-900/50">
            <Target className="w-10 h-10 mx-auto text-gray-600 mb-3"/>
            <h3 className="text-xl font-semibold text-gray-400">No Opportunities Match Query</h3>
            <p className="text-gray-500">Adjust your search parameters or wait for the next AI pipeline ingestion cycle.</p>
        </div>
      )}

      {selectedStartup && (
        <DeepDiveModal 
            startup={selectedStartup} 
            onClose={handleCloseDetails} 
            onInvest={handleInvest}
        />
      )}
    </div>
  );
};

export default VentureCapitalDesk;

// --- CONSOLIDATED FROM: VentureCapitalDeskView (1).tsx ---


import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Tabs, Tab } from 'react-bootstrap';
import { DealFlow } from './DealFlow';
import { InvestmentForm } from './InvestmentForm';
import { PortfolioCompanyList } from './PortfolioCompanyList';
import { PortfolioCompanyDetails } from './PortfolioCompanyDetails';

const VentureCapitalDeskView = () => {
    const [activeTab, setActiveTab] = useState('dealFlow');
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null); // Assuming string is company ID

    const handleSelectCompany = (companyId: string) => {
        setSelectedCompany(companyId);
        setActiveTab('portfolioCompaniesDetails');
    };

    const handleBackToPortfolio = () => {
        setSelectedCompany(null);
        setActiveTab('portfolioCompanies');
    }


    return (
        <Container fluid className="mt-3">
            <Row>
                <Col>
                    <h1>Venture Capital Desk</h1>
                    <p>Manage investments, track deal flow, and oversee portfolio companies.</p>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(tab) => setActiveTab(tab || 'dealFlow')}
                        id="vc-desk-tabs"
                        className="mb-3"
                    >
                        <Tab eventKey="dealFlow" title="Deal Flow">
                            <DealFlow />
                        </Tab>
                        <Tab eventKey="investmentForm" title="New Investment">
                            <InvestmentForm />
                        </Tab>
                        {selectedCompany ? (
                            <Tab eventKey="portfolioCompaniesDetails" title="Portfolio Company Details">
                                <Button onClick={handleBackToPortfolio} variant="link">Back to Portfolio</Button>
                                <PortfolioCompanyDetails companyId={selectedCompany} />
                            </Tab>
                        ) : (
                            <Tab eventKey="portfolioCompanies" title="Portfolio Companies">
                                <PortfolioCompanyList onSelectCompany={handleSelectCompany} />
                            </Tab>
                        )}

                    </Tabs>
                </Col>
            </Row>
        </Container>
    );
};

export default VentureCapitalDeskView;


// --- CONSOLIDATED FROM: VentureCapitalDeskView (1)_1.tsx ---


import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Tabs, Tab } from 'react-bootstrap';
import { DealFlow } from './DealFlow';
import { InvestmentForm } from './InvestmentForm';
import { PortfolioCompanyList } from './PortfolioCompanyList';
import { PortfolioCompanyDetails } from './PortfolioCompanyDetails';

const VentureCapitalDeskView = () => {
    const [activeTab, setActiveTab] = useState('dealFlow');
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null); // Assuming string is company ID

    const handleSelectCompany = (companyId: string) => {
        setSelectedCompany(companyId);
        setActiveTab('portfolioCompaniesDetails');
    };

    const handleBackToPortfolio = () => {
        setSelectedCompany(null);
        setActiveTab('portfolioCompanies');
    }


    return (
        <Container fluid className="mt-3">
            <Row>
                <Col>
                    <h1>Venture Capital Desk</h1>
                    <p>Manage investments, track deal flow, and oversee portfolio companies.</p>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(tab) => setActiveTab(tab || 'dealFlow')}
                        id="vc-desk-tabs"
                        className="mb-3"
                    >
                        <Tab eventKey="dealFlow" title="Deal Flow">
                            <DealFlow />
                        </Tab>
                        <Tab eventKey="investmentForm" title="New Investment">
                            <InvestmentForm />
                        </Tab>
                        {selectedCompany ? (
                            <Tab eventKey="portfolioCompaniesDetails" title="Portfolio Company Details">
                                <Button onClick={handleBackToPortfolio} variant="link">Back to Portfolio</Button>
                                <PortfolioCompanyDetails companyId={selectedCompany} />
                            </Tab>
                        ) : (
                            <Tab eventKey="portfolioCompanies" title="Portfolio Companies">
                                <PortfolioCompanyList onSelectCompany={handleSelectCompany} />
                            </Tab>
                        )}

                    </Tabs>
                </Col>
            </Row>
        </Container>
    );
};

export default VentureCapitalDeskView;
