import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  RefreshCw, 
  Terminal, 
  Cpu, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Key, 
  FileText, 
  Zap, 
  Search, 
  Filter, 
  Download, 
  Play, 
  Pause,
  Sliders,
  Eye,
  EyeOff,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { callGemini } from '../services/geminiService';
import { DataContext } from '../context/DataContext';
import Card from './Card';

// Types for dCVV2 Console
interface Dcvv2Log {
  id: string;
  timestamp: string;
  cardToken: string;
  bin: string;
  channel: 'Mobile App' | 'E-Commerce' | 'Digital Wallet' | 'IoT Device';
  status: 'Success' | 'Blocked' | 'Suspicious' | 'Expired';
  riskScore: number; // 0 to 100
  ipAddress: string;
  location: string;
  failureReason?: string;
}

interface SecurityMetrics {
  totalGenerations: number;
  activeEnrollments: number;
  blockedAttempts: number;
  averageLatencyMs: number;
  successRate: number;
}

export default function VisaDcvv2SecurityConsole() {
  const dataContext = useContext(DataContext);
  
  // State Management
  const [logs, setLogs] = useState<Dcvv2Log[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalGenerations: 142850,
    activeEnrollments: 48200,
    blockedAttempts: 1240,
    averageLatencyMs: 42,
    successRate: 99.13
  });
  const [isLive, setIsLive] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [channelFilter, setChannelFilter] = useState<string>('All');
  const [policyInterval, setPolicyInterval] = useState<number>(60); // in seconds
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});
  
  // Gemini Threat Intelligence State
  const [geminiAnalysis, setGeminiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [threatLevel, setThreatLevel] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Low');
  const [aiPrompt, setAiPrompt] = useState<string>(
    "Analyze the current dCVV2 generation logs for potential brute-force attacks, BIN attacks, or anomalous geographic patterns. Provide a structured mitigation strategy."
  );

  // Generate Initial Mock Logs
  useEffect(() => {
    const channels: Dcvv2Log['channel'][] = ['Mobile App', 'E-Commerce', 'Digital Wallet', 'IoT Device'];
    const statuses: Dcvv2Log['status'][] = ['Success', 'Success', 'Success', 'Success', 'Success', 'Blocked', 'Suspicious', 'Expired'];
    const locations = ['New York, USA', 'London, UK', 'Tokyo, Japan', 'Frankfurt, Germany', 'Singapore', 'Sydney, Australia', 'São Paulo, Brazil', 'Lagos, Nigeria'];
    const failureReasons = ['Invalid CVV Key', 'Account Locked', 'Velocity Limit Exceeded', 'Suspicious IP Range'];

    const initialLogs: Dcvv2Log[] = Array.from({ length: 50 }).map((_, i) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const riskScore = status === 'Success' ? Math.floor(Math.random() * 25) : 
                        status === 'Suspicious' ? Math.floor(Math.random() * 40) + 40 : 
                        Math.floor(Math.random() * 30) + 70;
      
      return {
        id: `DCVV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        timestamp: new Date(Date.now() - i * 3 * 60000).toISOString(),
        cardToken: `4111-XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
        bin: '411111',
        channel: channels[Math.floor(Math.random() * channels.length)],
        status,
        riskScore,
        ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        location: locations[Math.floor(Math.random() * locations.length)],
        failureReason: status === 'Blocked' ? failureReasons[Math.floor(Math.random() * failureReasons.length)] : undefined
      };
    });

    setLogs(initialLogs);
  }, []);

  // Live Log Stream Simulation
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const channels: Dcvv2Log['channel'][] = ['Mobile App', 'E-Commerce', 'Digital Wallet', 'IoT Device'];
      const statuses: Dcvv2Log['status'][] = ['Success', 'Success', 'Success', 'Success', 'Success', 'Blocked', 'Suspicious'];
      const locations = ['New York, USA', 'London, UK', 'Tokyo, Japan', 'Frankfurt, Germany', 'Singapore', 'Sydney, Australia', 'São Paulo, Brazil', 'Lagos, Nigeria'];
      const failureReasons = ['Invalid CVV Key', 'Account Locked', 'Velocity Limit Exceeded', 'Suspicious IP Range'];

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const riskScore = status === 'Success' ? Math.floor(Math.random() * 25) : 
                        status === 'Suspicious' ? Math.floor(Math.random() * 40) + 40 : 
                        Math.floor(Math.random() * 30) + 70;

      const newLog: Dcvv2Log = {
        id: `DCVV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        cardToken: `4111-XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
        bin: '411111',
        channel: channels[Math.floor(Math.random() * channels.length)],
        status,
        riskScore,
        ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        location: locations[Math.floor(Math.random() * locations.length)],
        failureReason: status === 'Blocked' ? failureReasons[Math.floor(Math.random() * failureReasons.length)] : undefined
      };

      setLogs(prev => [newLog, ...prev.slice(0, 99)]);
      
      // Update Metrics dynamically
      setMetrics(prev => {
        const isBlocked = status === 'Blocked';
        const total = prev.totalGenerations + 1;
        const blocked = prev.blockedAttempts + (isBlocked ? 1 : 0);
        const successRate = ((total - blocked) / total) * 100;
        return {
          ...prev,
          totalGenerations: total,
          blockedAttempts: blocked,
          successRate: parseFloat(successRate.toFixed(2)),
          averageLatencyMs: Math.max(30, Math.min(80, prev.averageLatencyMs + (Math.random() * 4 - 2)))
        };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Trigger Simulated Attack
  const triggerSimulatedAttack = () => {
    const attackLogs: Dcvv2Log[] = Array.from({ length: 10 }).map((_, i) => ({
      id: `DCVV-ATTACK-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      timestamp: new Date(Date.now() - i * 1000).toISOString(),
      cardToken: `4111-XXXX-XXXX-9999`,
      bin: '411111',
      channel: 'E-Commerce',
      status: 'Blocked',
      riskScore: 98,
      ipAddress: '185.220.101.5', // Known Tor exit node mock
      location: 'Unknown (Tor Network)',
      failureReason: 'Velocity Limit Exceeded'
    }));

    setLogs(prev => [...attackLogs, ...prev]);
    setMetrics(prev => ({
      ...prev,
      blockedAttempts: prev.blockedAttempts + 10,
      totalGenerations: prev.totalGenerations + 10,
      successRate: parseFloat((((prev.totalGenerations + 10 - (prev.blockedAttempts + 10)) / (prev.totalGenerations + 10)) * 100).toFixed(2))
    }));
    setThreatLevel('High');
    
    // Auto-trigger Gemini analysis on attack
    runGeminiThreatAnalysis("CRITICAL ALERT: A sudden burst of blocked dCVV2 requests has been detected from IP 185.220.101.5 targeting card token ending in 9999. Analyze this pattern immediately.");
  };

  // Run Gemini Threat Intelligence Analysis
  const runGeminiThreatAnalysis = async (customPrompt?: string) => {
    setIsAnalyzing(true);
    try {
      const promptToUse = customPrompt || aiPrompt;
      const logSummary = logs.slice(0, 15).map(l => 
        `[${l.timestamp}] Token: ${l.cardToken} | Status: ${l.status} | Risk: ${l.riskScore} | IP: ${l.ipAddress} | Loc: ${l.location} | Reason: ${l.failureReason || 'N/A'}`
      ).join('\n');

      const fullPrompt = `
        You are Visa's Advanced AI Threat Intelligence Agent integrated into the dCVV2 Security Console.
        Analyze the following real-time dCVV2 generation logs and metrics:
        
        METRICS:
        - Total Generations: ${metrics.totalGenerations}
        - Active Enrollments: ${metrics.activeEnrollments}
        - Blocked Attempts: ${metrics.blockedAttempts}
        - Success Rate: ${metrics.successRate}%
        - Avg Latency: ${metrics.averageLatencyMs}ms
        
        RECENT LOGS:
        ${logSummary}
        
        USER DIRECTIVE:
        ${promptToUse}
        
        Provide a highly professional, executive-level security analysis. Include:
        1. Threat Assessment (Anomalies, potential BIN attacks, brute-force indicators)
        2. Geographic Risk Mapping
        3. Actionable Mitigation Steps (e.g., dynamic threshold adjustments, IP blacklisting, step-up authentication triggers)
        4. Recommended dCVV2 Policy Interval (currently set to ${policyInterval}s)
      `;

      const response = await callGemini(fullPrompt);
      setGeminiAnalysis(response);
      
      // Dynamically adjust threat level based on response keywords
      if (response.toLowerCase().includes('critical') || response.toLowerCase().includes('attack')) {
        setThreatLevel('Critical');
      } else if (response.toLowerCase().includes('high') || response.toLowerCase().includes('anomaly')) {
        setThreatLevel('High');
      } else if (response.toLowerCase().includes('medium') || response.toLowerCase().includes('warning')) {
        setThreatLevel('Medium');
      } else {
        setThreatLevel('Low');
      }
    } catch (error) {
      console.error("Gemini Threat Analysis failed:", error);
      setGeminiAnalysis("Error generating threat intelligence. Please verify your Gemini API configuration.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.cardToken.includes(searchTerm) || log.id.includes(searchTerm) || log.ipAddress.includes(searchTerm) || log.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
      const matchesChannel = channelFilter === 'All' || log.channel === channelFilter;
      return matchesSearch && matchesStatus && matchesChannel;
    });
  }, [logs, searchTerm, statusFilter, channelFilter]);

  // Chart Data: Status Distribution
  const statusChartData = useMemo(() => {
    const counts = logs.reduce((acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [logs]);

  // Chart Data: Channel Distribution
  const channelChartData = useMemo(() => {
    const counts = logs.reduce((acc, log) => {
      acc[log.channel] = (acc[log.channel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [logs]);

  // Chart Data: Risk Score Trend over last 20 logs
  const riskTrendData = useMemo(() => {
    return [...logs].reverse().slice(-20).map((log, index) => ({
      index,
      riskScore: log.riskScore,
      status: log.status,
      timestamp: new Date(log.timestamp).toLocaleTimeString()
    }));
  }, [logs]);

  const COLORS = {
    Success: '#10B981', // Emerald
    Blocked: '#EF4444', // Red
    Suspicious: '#F59E0B', // Amber
    Expired: '#6B7280', // Gray
    'Mobile App': '#3B82F6',
    'E-Commerce': '#8B5CF6',
    'Digital Wallet': '#EC4899',
    'IoT Device': '#14B8A6'
  };

  const toggleTokenVisibility = (id: string) => {
    setShowTokens(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Shield className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Visa dCVV2 Security Console
              </h1>
              <p className="text-sm text-slate-400">
                Real-time dynamic CVV2 generation logs, active enrollment metrics, and Gemini-driven threat intelligence.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all border ${
              isLive 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isLive ? <Activity className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" />}
            {isLive ? 'Live Streaming' : 'Stream Paused'}
          </button>

          <button
            onClick={triggerSimulatedAttack}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 rounded-lg font-medium text-sm transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            Simulate Attack
          </button>

          <button
            onClick={() => runGeminiThreatAnalysis()}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-medium text-sm shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            <Cpu className="w-4 h-4" />
            {isAnalyzing ? 'Analyzing...' : 'Run AI Audit'}
          </button>
        </div>
      </div>

      {/* Threat Level Banner */}
      <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
        threatLevel === 'Critical' ? 'bg-red-950/40 border-red-500/40 text-red-200' :
        threatLevel === 'High' ? 'bg-orange-950/40 border-orange-500/40 text-orange-200' :
        threatLevel === 'Medium' ? 'bg-yellow-950/40 border-yellow-500/40 text-yellow-200' :
        'bg-slate-900/40 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center gap-3">
          <AlertTriangle className={`w-6 h-6 ${
            threatLevel === 'Critical' || threatLevel === 'High' ? 'text-red-400 animate-bounce' : 'text-slate-400'
          }`} />
          <div>
            <span className="font-semibold">System Threat Level: </span>
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
              threatLevel === 'Critical' ? 'bg-red-500 text-white' :
              threatLevel === 'High' ? 'bg-orange-500 text-white' :
              threatLevel === 'Medium' ? 'bg-yellow-500 text-slate-950' :
              'bg-emerald-500 text-white'
            }`}>
              {threatLevel}
            </span>
            <span className="ml-3 text-xs text-slate-400">
              {threatLevel === 'Critical' ? 'Immediate mitigation required. High volume of blocked requests detected.' :
               threatLevel === 'High' ? 'Anomalous activity detected. Review AI recommendations.' :
               threatLevel === 'Medium' ? 'Minor anomalies detected. System operating within normal thresholds.' :
               'All systems nominal. No active threats detected.'}
            </span>
          </div>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-900/50 border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Generations</p>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-slate-100">{metrics.totalGenerations.toLocaleString()}</h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +12.4% from last hour
            </p>
          </div>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Enrollments</p>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-slate-100">{metrics.activeEnrollments.toLocaleString()}</h3>
            <p className="text-xs text-indigo-400 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3" />
              Securely enrolled cards
            </p>
          </div>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Blocked Attempts</p>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-red-400">{metrics.blockedAttempts.toLocaleString()}</h3>
            <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3" />
              Fraud attempts mitigated
            </p>
          </div>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Latency</p>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-slate-100">{metrics.averageLatencyMs.toFixed(0)} ms</h3>
            <p className="text-xs text-teal-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" />
              Within SLA limit (100ms)
            </p>
          </div>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Success Rate</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-emerald-400">{metrics.successRate}%</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              Target: &gt;99.0%
            </p>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Trend */}
        <Card className="bg-slate-900/40 border-slate-800 p-5 col-span-1 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-200">Real-Time Risk Score Trend</h3>
              <p className="text-xs text-slate-400">Risk evaluation of the last 20 dCVV2 generation requests</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> High Risk (&gt;70)
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Low Risk (&lt;30)
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrendData}>
                <defs>
                  <linearGradient id="riskColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="timestamp" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Area type="monotone" dataKey="riskScore" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#riskColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Distribution Charts */}
        <Card className="bg-slate-900/40 border-slate-800 p-5">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Request Channels</h3>
          <div className="h-64 flex flex-col justify-between">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {channelChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#3B82F6'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {channelChartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] }}></span>
                  <span className="text-slate-300 truncate">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Gemini Threat Intelligence Panel */}
      <Card className="bg-slate-900/40 border-slate-800 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-200">Gemini Threat Intelligence Agent</h3>
              <p className="text-xs text-slate-400">AI-driven anomaly detection, risk assessment, and policy recommendations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Policy Refresh Interval:</span>
            <select 
              value={policyInterval} 
              onChange={(e) => setPolicyInterval(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value={30}>30 Seconds</option>
              <option value={60}>60 Seconds (Default)</option>
              <option value={300}>5 Minutes</option>
              <option value={3600}>1 Hour</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Prompt Input */}
          <div className="space-y-4 col-span-1">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                Analysis Directive
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                placeholder="Instruct Gemini to analyze specific patterns..."
              />
            </div>

            <button
              onClick={() => runGeminiThreatAnalysis()}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm shadow-lg shadow-indigo-500/10 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Generating Intelligence...' : 'Generate Threat Report'}
            </button>

            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-lg space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Active Security Policies</h4>
              <div className="flex justify-between text-xs text-slate-400">
                <span>dCVV2 Rotation:</span>
                <span className="text-indigo-400 font-medium">Every {policyInterval}s</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Velocity Limit:</span>
                <span className="text-indigo-400 font-medium">5 req / min per card</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Geographic Lock:</span>
                <span className="text-emerald-400 font-medium">Enabled (Multi-region)</span>
              </div>
            </div>
          </div>

          {/* AI Analysis Output */}
          <div className="col-span-1 lg:col-span-2 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col h-80 lg:h-auto overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                Threat Intelligence Output
              </span>
              {isAnalyzing && (
                <span className="text-xs text-indigo-400 animate-pulse flex items-center gap-1">
                  <Activity className="w-3 h-3 animate-spin" /> Gemini is thinking...
                </span>
              )}
            </div>

            {geminiAnalysis ? (
              <div className="text-sm text-slate-300 space-y-3 font-mono leading-relaxed whitespace-pre-wrap">
                {geminiAnalysis}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center p-6">
                <Cpu className="w-12 h-12 text-slate-700 mb-2 animate-pulse" />
                <p className="text-sm">No active threat report generated.</p>
                <p className="text-xs text-slate-600 mt-1">Click "Generate Threat Report" to run Gemini AI analysis on current logs.</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Real-Time Logs Table */}
      <Card className="bg-slate-900/40 border-slate-800 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-200">dCVV2 Generation Logs</h3>
            <p className="text-xs text-slate-400">Real-time audit trail of dynamic CVV2 requests</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search token, IP, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 w-full md:w-64"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Success">Success</option>
                <option value="Blocked">Blocked</option>
                <option value="Suspicious">Suspicious</option>
                <option value="Expired">Expired</option>
              </select>

              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Channels</option>
                <option value="Mobile App">Mobile App</option>
                <option value="E-Commerce">E-Commerce</option>
                <option value="Digital Wallet">Digital Wallet</option>
                <option value="IoT Device">IoT Device</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Request ID</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Card Token</th>
                <th className="p-4">Channel</th>
                <th className="p-4">Location / IP</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4">Status</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 font-mono text-xs text-slate-400">{log.id}</td>
                    <td className="p-4 text-xs">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-4 font-mono flex items-center gap-2">
                      <span>{showTokens[log.id] ? log.cardToken : 'XXXX-XXXX-XXXX-' + log.cardToken.split('-')[3]}</span>
                      <button 
                        onClick={() => toggleTokenVisibility(log.id)}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showTokens[log.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                        {log.channel}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-medium text-slate-200">{log.location}</div>
                      <div className="text-xs text-slate-500 font-mono">{log.ipAddress}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              log.riskScore > 70 ? 'bg-red-500' :
                              log.riskScore > 40 ? 'bg-yellow-500' :
                              'bg-emerald-500'
                            }`}
                            style={{ width: `${log.riskScore}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${
                          log.riskScore > 70 ? 'text-red-400' :
                          log.riskScore > 40 ? 'text-yellow-400' :
                          'text-emerald-400'
                        }`}>
                          {log.riskScore}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        log.status === 'Blocked' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        log.status === 'Suspicious' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {log.status === 'Success' && <ShieldCheck className="w-3 h-3" />}
                        {log.status === 'Blocked' && <ShieldAlert className="w-3 h-3" />}
                        {log.status === 'Suspicious' && <AlertTriangle className="w-3 h-3" />}
                        {log.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-400 max-w-xs truncate">
                      {log.failureReason || <span className="text-slate-600">N/A</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No logs match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}