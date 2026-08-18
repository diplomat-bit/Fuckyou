import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Upload,
  Sliders,
  Calendar,
  Mail,
  MessageSquare,
  BarChart3,
  Play,
  Pause,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  Users,
  DollarSign,
  Percent,
  ArrowRight,
  Plus,
  Sparkles,
  Terminal,
  RefreshCw,
  Bell,
  ChevronRight,
  FileText,
  SlidersHorizontal,
  Send,
  Check,
  X,
  Info
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  fico: number;
  balance: number;
  currentApr: number;
  promoApr: number;
  estimatedSavings: number;
}

interface Batch {
  id: string;
  name: string;
  createdAt: string;
  targetCount: number;
  totalVolume: number;
  avgSavings: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Paused';
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface QueueItem {
  id: string;
  batchName: string;
  channel: 'Email' | 'SMS' | 'Omnichannel';
  progress: number;
  status: 'Queued' | 'Sending' | 'Completed' | 'Paused';
  sentCount: number;
  totalCount: number;
}

// ==========================================
// MOCK DATA
// ==========================================
const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'CUST-001', name: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '+1 (555) 234-5678', fico: 745, balance: 8500, currentApr: 22.9, promoApr: 1.9, estimatedSavings: 1450 },
  { id: 'CUST-002', name: 'Michael Chen', email: 'mchen@example.com', phone: '+1 (555) 876-5432', fico: 680, balance: 12000, currentApr: 24.5, promoApr: 2.9, estimatedSavings: 2100 },
  { id: 'CUST-003', name: 'Amanda Rodriguez', email: 'amanda.r@example.com', phone: '+1 (555) 345-6789', fico: 720, balance: 4500, currentApr: 19.8, promoApr: 1.9, estimatedSavings: 680 },
  { id: 'CUST-004', name: 'David Kim', email: 'dkim@example.com', phone: '+1 (555) 987-6543', fico: 610, balance: 9800, currentApr: 26.9, promoApr: 4.9, estimatedSavings: 1600 },
  { id: 'CUST-005', name: 'Rachel Taylor', email: 'rachel.t@example.com', phone: '+1 (555) 456-7890', fico: 790, balance: 15000, currentApr: 18.9, promoApr: 0.0, estimatedSavings: 2835 },
  { id: 'CUST-006', name: 'James Wilson', email: 'jwilson@example.com', phone: '+1 (555) 765-4321', fico: 655, balance: 3200, currentApr: 21.9, promoApr: 2.9, estimatedSavings: 510 },
  { id: 'CUST-007', name: 'Jessica Martinez', email: 'jess.m@example.com', phone: '+1 (555) 567-8901', fico: 715, balance: 6700, currentApr: 23.2, promoApr: 1.9, estimatedSavings: 1120 },
  { id: 'CUST-008', name: 'Robert Thompson', email: 'rthompson@example.com', phone: '+1 (555) 654-3210', fico: 590, balance: 11500, currentApr: 28.9, promoApr: 4.9, estimatedSavings: 2150 },
  { id: 'CUST-009', name: 'Emily Davis', email: 'emily.d@example.com', phone: '+1 (555) 678-9012', fico: 810, balance: 18500, currentApr: 17.4, promoApr: 0.0, estimatedSavings: 3220 },
  { id: 'CUST-010', name: 'William Larson', email: 'wlarson@example.com', phone: '+1 (555) 543-2109', fico: 675, balance: 5400, currentApr: 20.5, promoApr: 2.9, estimatedSavings: 780 },
];

const INITIAL_BATCHES: Batch[] = [
  { id: 'BATCH-2023-001', name: 'Q3 Prime High-Balance Offer', createdAt: '2023-10-15 09:30', targetCount: 1250, totalVolume: 9375000, avgSavings: 1850, status: 'Completed' },
  { id: 'BATCH-2023-002', name: 'Near-Prime Recovery Campaign', createdAt: '2023-10-28 14:15', targetCount: 840, totalVolume: 4620000, avgSavings: 1100, status: 'Completed' },
  { id: 'BATCH-2023-003', name: 'Super-Prime 0% APR Special', createdAt: '2023-11-05 11:00', targetCount: 2100, totalVolume: 23100000, avgSavings: 3100, status: 'Processing' },
];

const INITIAL_QUEUE: QueueItem[] = [
  { id: 'Q-001', batchName: 'Super-Prime 0% APR Special', channel: 'Omnichannel', progress: 68, status: 'Sending', sentCount: 1428, totalCount: 2100 },
  { id: 'Q-002', batchName: 'Holiday Debt Consolidation', channel: 'Email', progress: 0, status: 'Queued', sentCount: 0, totalCount: 1550 },
  { id: 'Q-003', batchName: 'FICO 660+ Standard Promo', channel: 'SMS', progress: 0, status: 'Paused', sentCount: 320, totalCount: 980 },
];

const INITIAL_LOGS: LogEntry[] = [
  { id: 'log-1', timestamp: '10:45:12', type: 'info', message: 'System initialized. Connected to core banking API.' },
  { id: 'log-2', timestamp: '10:46:05', type: 'success', message: 'Successfully imported portfolio segment: "Active Cardholders Q4".' },
  { id: 'log-3', timestamp: '10:50:00', type: 'info', message: 'Batch scheduler triggered "Super-Prime 0% APR Special" dispatch.' },
  { id: 'log-4', timestamp: '10:52:18', type: 'warning', message: 'API rate limit warning: Approaching 85% of SMS gateway capacity. Throttling applied.' },
];

export default function BalanceTransferBatchSuite() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'processor' | 'scheduler' | 'campaign' | 'analytics'>('processor');

  // Global Shared State
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [notifications, setNotifications] = useState<{ id: string; text: string; type: 'success' | 'info' | 'error' }[]>([]);

  // ---------------------------------------------------------
  // MODULE 1: PORTFOLIO BATCH PROCESSOR STATE
  // ---------------------------------------------------------
  const [ficoRange, setFicoRange] = useState<number>(660);
  const [minBalance, setMinBalance] = useState<number>(3000);
  const [maxCurrentApr, setMaxCurrentApr] = useState<number>(18);
  const [newBatchName, setNewBatchName] = useState<string>('Custom Segment Offer ' + new Date().toLocaleDateString());
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Filtered customers based on criteria
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => c.fico >= ficoRange && c.balance >= minBalance && c.currentApr >= maxCurrentApr);
  }, [customers, ficoRange, minBalance, maxCurrentApr]);

  // Calculated metrics for the filtered batch
  const batchMetrics = useMemo(() => {
    const count = filteredCustomers.length;
    const totalVolume = filteredCustomers.reduce((sum, c) => sum + c.balance, 0);
    const avgSavings = count > 0 ? Math.round(filteredCustomers.reduce((sum, c) => sum + c.estimatedSavings, 0) / count) : 0;
    const avgApr = count > 0 ? Number((filteredCustomers.reduce((sum, c) => sum + c.currentApr, 0) / count).toFixed(1)) : 0;
    return { count, totalVolume, avgSavings, avgApr };
  }, [filteredCustomers]);

  // ---------------------------------------------------------
  // MODULE 2: BATCH SCHEDULER STATE
  // ---------------------------------------------------------
  const [scheduleFreq, setScheduleFreq] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [scheduleTime, setScheduleTime] = useState<string>('09:00');
  const [throttleLimit, setThrottleLimit] = useState<number>(1500);
  const [blackoutWeekends, setBlackoutWeekends] = useState<boolean>(true);
  const [webhookUrl, setWebhookUrl] = useState<string>('https://api.fintechbank.com/v1/bt-dispatch');
  const [activeSchedules, setActiveSchedules] = useState([
    { id: 'SCH-1', name: 'Weekly High-Savings Sweep', frequency: 'Weekly (Mon 9:00 AM)', criteria: 'FICO > 700, Bal > $5k', status: 'Active' },
    { id: 'SCH-2', name: 'Monthly Near-Prime Re-engagement', frequency: 'Monthly (1st at 10:00 AM)', criteria: 'FICO 620-699, Bal > $3k', status: 'Active' }
  ]);

  // ---------------------------------------------------------
  // MODULE 3: CAMPAIGN & PERSONALIZATION STATE
  // ---------------------------------------------------------
  const [campaignChannel, setCampaignChannel] = useState<'email' | 'sms'>('email');
  const [emailSubject, setEmailSubject] = useState<string>('Slash your credit card interest! Save up to {savings} today.');
  const [emailBody, setEmailBody] = useState<string>(
    `Hi {first_name},\n\nWe noticed you are paying high interest rates on your other credit cards. Why pay more when you can transfer your balance to us?\n\nHere is your exclusive offer:\n• Promotional APR: {promo_apr}% for 18 months\n• Your Current Estimated APR: {current_apr}%\n• Your Potential Savings: {savings}\n\nTransfer up to {max_transfer} of your balance today and start saving instantly.\n\nBest regards,\nFintech Bank Team`
  );
  const [smsBody, setSmsBody] = useState<string>(
    `Hi {first_name}! Cut your interest rate to {promo_apr}% APR. Transfer your balance of {balance} and save around {savings}. Apply in 1-click: https://ftb.co/bt-save`
  );
  const [personalizationRules, setPersonalizationRules] = useState([
    { id: 'R-1', condition: 'FICO >= 740', offer: '0.0% APR for 18 months (No Fee)' },
    { id: 'R-2', condition: 'FICO 680 - 739', offer: '1.9% APR for 15 months (2% Fee)' },
    { id: 'R-3', condition: 'FICO < 680', offer: '3.9% APR for 12 months (3% Fee)' }
  ]);
  const [newRuleCondition, setNewRuleCondition] = useState<string>('');
  const [newRuleOffer, setNewRuleOffer] = useState<string>('');

  // Live Preview Customer Selector
  const [previewCustomerIndex, setPreviewCustomerIndex] = useState<number>(0);
  const previewCustomer = customers[previewCustomerIndex] || customers[0];

  // Helper to replace placeholders
  const renderTemplate = (template: string, customer: Customer) => {
    if (!customer) return '';
    const firstName = customer.name.split(' ')[0];
    return template
      .replace(/{first_name}/g, firstName)
      .replace(/{balance}/g, `$${customer.balance.toLocaleString()}`)
      .replace(/{current_apr}/g, `${customer.currentApr}%`)
      .replace(/{promo_apr}/g, `${customer.promoApr}%`)
      .replace(/{savings}/g, `$${customer.estimatedSavings.toLocaleString()}`)
      .replace(/{max_transfer}/g, `$${Math.round(customer.balance * 1.2).toLocaleString()}`);
  };

  // ---------------------------------------------------------
  // MODULE 4: ANALYTICS & DISPATCHER STATE
  // ---------------------------------------------------------
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Simulated background processing for dispatch queue
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDispatching) {
      interval = setInterval(() => {
        setQueue(prevQueue => {
          let updated = false;
          const nextQueue = prevQueue.map(item => {
            if (item.status === 'Sending') {
              updated = true;
              const increment = Math.floor(Math.random() * 40) + 10;
              const nextSent = Math.min(item.sentCount + increment, item.totalCount);
              const nextProgress = Math.round((nextSent / item.totalCount) * 100);
              const nextStatus = nextSent === item.totalCount ? 'Completed' : 'Sending';

              if (nextStatus === 'Completed') {
                addLog('success', `Batch dispatch completed for "${item.batchName}". Sent ${item.totalCount} messages.`);
              }

              return {
                ...item,
                sentCount: nextSent,
                progress: nextProgress,
                status: nextStatus
              };
            }
            return item;
          });

          // If nothing was updated or all sending items are completed, stop dispatching
          const activeSending = nextQueue.some(item => item.status === 'Sending');
          if (!activeSending) {
            setIsDispatching(false);
            addLog('info', 'All active dispatch queues have finished processing.');
          }

          return nextQueue;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isDispatching]);

  // ---------------------------------------------------------
  // UTILITY FUNCTIONS
  // ---------------------------------------------------------
  const addNotification = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const addLog = (type: 'info' | 'success' | 'warning' | 'error', message: string) => {
    const timestamp = new Date().toTimeString().split(' ')[0];
    setLogs(prev => [...prev, { id: Math.random().toString(), timestamp, type, message }]);
  };

  // Action: Simulate CSV Upload
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      setUploadProgress(10);
      addLog('info', `Uploading file: ${e.target.files[0].name}...`);

      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            // Add some mock customers to simulate new data
            const newCustomers: Customer[] = [
              { id: 'CUST-101', name: 'Robert Downey', email: 'rdowney@example.com', phone: '+1 (555) 111-2222', fico: 760, balance: 14200, currentApr: 21.9, promoApr: 0.0, estimatedSavings: 2600 },
              { id: 'CUST-102', name: 'Scarlett Johansson', email: 'scarlett@example.com', phone: '+1 (555) 333-4444', fico: 695, balance: 8900, currentApr: 23.4, promoApr: 1.9, estimatedSavings: 1400 },
              { id: 'CUST-103', name: 'Chris Evans', email: 'cevans@example.com', phone: '+1 (555) 555-6666', fico: 640, balance: 5100, currentApr: 25.9, promoApr: 2.9, estimatedSavings: 850 },
            ];
            setCustomers(prevCust => [...newCustomers, ...prevCust]);
            addNotification('Portfolio file uploaded successfully!', 'success');
            addLog('success', `Successfully parsed 3 new high-value customer records from CSV.`);
            return 0;
          }
          return prev + 30;
        });
      }, 400);
    }
  };

  // Action: Generate Batch
  const handleGenerateBatch = () => {
    if (batchMetrics.count === 0) {
      addNotification('No customers match the current criteria.', 'error');
      return;
    }

    const batchId = `BATCH-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`;
    const newBatch: Batch = {
      id: batchId,
      name: newBatchName,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      targetCount: batchMetrics.count,
      totalVolume: batchMetrics.totalVolume,
      avgSavings: batchMetrics.avgSavings,
      status: 'Pending'
    };

    setBatches(prev => [newBatch, ...prev]);
    
    // Automatically add to Dispatcher Queue
    const newQueueItem: QueueItem = {
      id: `Q-${Math.floor(Math.random() * 900) + 100}`,
      batchName: newBatchName,
      channel: campaignChannel === 'email' ? 'Email' : 'SMS',
      progress: 0,
      status: 'Queued',
      sentCount: 0,
      totalCount: batchMetrics.count
    };
    setQueue(prev => [newQueueItem, ...prev]);

    addNotification(`Batch "${newBatchName}" generated and queued!`, 'success');
    addLog('success', `Created batch "${newBatchName}" with ${batchMetrics.count} targets. Total Volume: $${batchMetrics.totalVolume.toLocaleString()}`);
    
    // Reset batch name input
    setNewBatchName('Custom Segment Offer ' + new Date().toLocaleDateString());
  };

  // Action: Save Schedule
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const newSch = {
      id: `SCH-${Math.floor(Math.random() * 900) + 100}`,
      name: `Auto-Sweep (FICO ${ficoRange}+)`,
      frequency: `${scheduleFreq.charAt(0).toUpperCase() + scheduleFreq.slice(1)} at ${scheduleTime}`,
      criteria: `FICO > ${ficoRange}, Bal > $${minBalance.toLocaleString()}`,
      status: 'Active'
    };
    setActiveSchedules(prev => [newSch, ...prev]);
    addNotification('Automation schedule saved successfully!', 'success');
    addLog('info', `New schedule configured: ${newSch.name} running ${newSch.frequency}`);
  };

  // Action: Add Personalization Rule
  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleCondition || !newRuleOffer) return;
    const newRule = {
      id: `R-${Math.floor(Math.random() * 900) + 100}`,
      condition: newRuleCondition,
      offer: newRuleOffer
    };
    setPersonalizationRules(prev => [...prev, newRule]);
    setNewRuleCondition('');
    setNewRuleOffer('');
    addNotification('Personalization rule added!', 'success');
  };

  // Action: Delete Rule
  const handleDeleteRule = (id: string) => {
    setPersonalizationRules(prev => prev.filter(r => r.id !== id));
    addNotification('Rule removed.', 'info');
  };

  // Action: Control Dispatch Queue
  const handleStartDispatch = () => {
    // Set all queued items to sending
    setQueue(prev => prev.map(item => item.status === 'Queued' || item.status === 'Paused' ? { ...item, status: 'Sending' } : item));
    setIsDispatching(true);
    addLog('info', 'Dispatch engine started. Processing outbound queues...');
    addNotification('Dispatch engine started', 'info');
  };

  const handlePauseDispatch = () => {
    setQueue(prev => prev.map(item => item.status === 'Sending' ? { ...item, status: 'Paused' } : item));
    setIsDispatching(false);
    addLog('warning', 'Dispatch engine paused by operator.');
    addNotification('Dispatch engine paused', 'info');
  };

  const handleClearQueue = () => {
    setQueue([]);
    setIsDispatching(false);
    addLog('info', 'Dispatch queue cleared.');
    addNotification('Queue cleared', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      
      {/* TOAST NOTIFICATIONS */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`p-4 rounded-lg shadow-xl border flex items-center gap-3 animate-slide-in ${
              n.type === 'success' ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200' :
              n.type === 'error' ? 'bg-rose-950/90 border-rose-500 text-rose-200' :
              'bg-blue-950/90 border-blue-500 text-blue-200'
            }`}
          >
            {n.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
            {n.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {n.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
            <span className="text-sm font-medium">{n.text}</span>
          </div>
        ))}
      </div>

      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <RefreshCw className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Balance Transfer Batch Suite
            </h1>
            <p className="text-xs text-slate-400 font-medium">Enterprise Portfolio Optimization & Dispatch</p>
          </div>
        </div>

        {/* Global Stats Bar */}
        <div className="hidden lg:flex items-center gap-6 text-xs border-l border-slate-800 pl-6">
          <div className="flex flex-col">
            <span className="text-slate-500 uppercase tracking-wider font-semibold">Total Portfolio Size</span>
            <span className="text-slate-200 font-bold text-sm">{customers.length.toLocaleString()} Accounts</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 uppercase tracking-wider font-semibold">Active Batches</span>
            <span className="text-slate-200 font-bold text-sm">{batches.length} Batches</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 uppercase tracking-wider font-semibold">Engine Status</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Operational
            </span>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/30 p-4 flex flex-col gap-2 shrink-0">
          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider px-3 mb-2">
            Modules
          </div>
          
          <button
            onClick={() => setActiveTab('processor')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'processor'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Portfolio Processor
          </button>

          <button
            onClick={() => setActiveTab('scheduler')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'scheduler'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Batch Scheduler
          </button>

          <button
            onClick={() => setActiveTab('campaign')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'campaign'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            Campaign & Preview
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics & Dispatch
          </button>

          <div className="mt-auto border-t border-slate-800 pt-4">
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                Live Engine Logs
              </div>
              <div className="h-24 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 scrollbar-thin">
                {logs.slice(-4).map(log => (
                  <div key={log.id} className="truncate">
                    <span className="text-slate-600">[{log.timestamp}]</span>{' '}
                    <span className={
                      log.type === 'success' ? 'text-emerald-400' :
                      log.type === 'warning' ? 'text-amber-400' :
                      log.type === 'error' ? 'text-rose-400' : 'text-slate-300'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-900/10">
          
          {/* =========================================================
              MODULE 1: PORTFOLIO BATCH PROCESSOR
              ========================================================= */}
          {activeTab === 'processor' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Top Banner / Upload Zone */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  <div>
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                      <Sparkles className="w-4 h-4" /> Portfolio Segmentation
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Filter & Generate High-Yield Batches</h2>
                    <p className="text-slate-400 text-sm max-w-xl">
                      Adjust the sliders to segment your portfolio based on risk tolerance, current APR, and balance thresholds. Generate optimized balance transfer offers instantly.
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4">
                      <div className="text-slate-500 text-xs font-semibold uppercase">Target Audience</div>
                      <div className="text-2xl font-bold text-white mt-1 flex items-baseline gap-1.5">
                        {batchMetrics.count}
                        <span className="text-xs text-slate-400 font-normal">/ {customers.length} total</span>
                      </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4">
                      <div className="text-slate-500 text-xs font-semibold uppercase">Est. Transfer Volume</div>
                      <div className="text-2xl font-bold text-indigo-400 mt-1">
                        ${batchMetrics.totalVolume.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4">
                      <div className="text-slate-500 text-xs font-semibold uppercase">Avg. Customer Savings</div>
                      <div className="text-2xl font-bold text-emerald-400 mt-1">
                        ${batchMetrics.avgSavings.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CSV Upload Card */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Import Portfolio</h3>
                    <p className="text-slate-400 text-xs mb-4">Upload a CSV file containing customer credit profiles to expand your target pool.</p>
                  </div>

                  <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 text-center transition-all relative group cursor-pointer">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <div className="space-y-3 py-4">
                        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                        <div className="text-sm text-slate-300 font-medium">Processing file... {uploadProgress}%</div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 max-w-[150px] mx-auto">
                          <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 py-4">
                        <Upload className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 mx-auto transition-colors" />
                        <div className="text-sm text-slate-300 font-semibold">Click or drag CSV here</div>
                        <p className="text-[10px] text-slate-500">Supports FICO, Balance, APR, and Contact fields</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sliders & Live Table */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Sliders Panel */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-bold text-white">Segmentation Criteria</h3>
                  </div>

                  {/* FICO Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Minimum FICO Score</span>
                      <span className="text-indigo-400 font-bold">{ficoRange}+</span>
                    </div>
                    <input
                      type="range"
                      min="580"
                      max="800"
                      step="10"
                      value={ficoRange}
                      onChange={(e) => setFicoRange(Number(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>Fair (580)</span>
                      <span>Good (670)</span>
                      <span>Excellent (740+)</span>
                    </div>
                  </div>

                  {/* Balance Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Minimum Card Balance</span>
                      <span className="text-indigo-400 font-bold">${minBalance.toLocaleString()}+</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="15000"
                      step="500"
                      value={minBalance}
                      onChange={(e) => setMinBalance(Number(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>$1,000</span>
                      <span>$7,500</span>
                      <span>$15,000</span>
                    </div>
                  </div>

                  {/* Current APR Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Minimum Current APR</span>
                      <span className="text-indigo-400 font-bold">{maxCurrentApr}%+</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="28"
                      step="1"
                      value={maxCurrentApr}
                      onChange={(e) => setMaxCurrentApr(Number(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>12%</span>
                      <span>20%</span>
                      <span>28%</span>
                    </div>
                  </div>

                  {/* Batch Generation Form */}
                  <div className="border-t border-slate-800 pt-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-semibold">Batch Name</label>
                      <input
                        type="text"
                        value={newBatchName}
                        onChange={(e) => setNewBatchName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        placeholder="Enter batch name..."
                      />
                    </div>

                    <button
                      onClick={handleGenerateBatch}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                    >
                      <Plus className="w-4 h-4" />
                      Generate & Queue Batch
                    </button>
                  </div>
                </div>

                {/* Live Preview Table */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <h3 className="font-bold text-white">Target Audience Preview</h3>
                    </div>
                    <span className="text-xs bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-800/50 font-semibold">
                      {filteredCustomers.length} Matches
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[380px] scrollbar-thin">
                    {filteredCustomers.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                        <AlertCircle className="w-8 h-8 mb-2 text-slate-600" />
                        <p className="text-sm">No customers match the selected criteria.</p>
                        <p className="text-xs text-slate-600">Try lowering the FICO or Balance thresholds.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 text-xs font-semibold">
                            <th className="pb-2">Customer</th>
                            <th className="pb-2">FICO</th>
                            <th className="pb-2">Current Balance</th>
                            <th className="pb-2">Current APR</th>
                            <th className="pb-2 text-right">Est. Savings</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-xs">
                          {filteredCustomers.map(cust => (
                            <tr key={cust.id} className="hover:bg-slate-800/20 transition-colors">
                              <td className="py-3 font-medium text-slate-200">
                                <div>{cust.name}</div>
                                <div className="text-[10px] text-slate-500">{cust.email}</div>
                              </td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded font-semibold ${
                                  cust.fico >= 740 ? 'bg-emerald-950 text-emerald-400' :
                                  cust.fico >= 670 ? 'bg-blue-950 text-blue-400' : 'bg-amber-950 text-amber-400'
                                }`}>
                                  {cust.fico}
                                </span>
                              </td>
                              <td className="py-3 font-semibold text-slate-300">${cust.balance.toLocaleString()}</td>
                              <td className="py-3 text-slate-400">{cust.currentApr}%</td>
                              <td className="py-3 text-right text-emerald-400 font-bold">${cust.estimatedSavings.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* =========================================================
              MODULE 2: BATCH SCHEDULER & AUTOMATION
              ========================================================= */}
          {activeTab === 'scheduler' && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Scheduler Form */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h3 className="font-bold text-white">Configure Automation Schedule</h3>
                      <p className="text-xs text-slate-400">Set up recurring balance transfer sweeps based on live portfolio updates.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveSchedule} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Frequency */}
                      <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Run Frequency</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['daily', 'weekly', 'monthly'] as const).map(freq => (
                            <button
                              key={freq}
                              type="button"
                              onClick={() => setScheduleFreq(freq)}
                              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all capitalize ${
                                scheduleFreq === freq
                                  ? 'bg-indigo-600 border-indigo-500 text-white'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              {freq}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Time of Day */}
                      <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Preferred Dispatch Time</label>
                        <input
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Throttle Limit */}
                      <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Max Dispatch Rate (per hour)</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="100"
                            max="5000"
                            step="100"
                            value={throttleLimit}
                            onChange={(e) => setThrottleLimit(Number(e.target.value))}
                            className="flex-1 accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-sm font-bold text-indigo-400 w-16 text-right">{throttleLimit}/hr</span>
                        </div>
                      </div>

                      {/* Blackout Dates Toggle */}
                      <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Blackout Windows</label>
                        <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-2.5">
                          <span className="text-xs text-slate-300">Avoid Weekend Dispatches</span>
                          <button
                            type="button"
                            onClick={() => setBlackoutWeekends(!blackoutWeekends)}
                            className={`w-10 h-6 rounded-full transition-colors relative ${
                              blackoutWeekends ? 'bg-indigo-600' : 'bg-slate-800'
                            }`}
                          >
                            <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                              blackoutWeekends ? 'translate-x-4' : ''
                            }`}></span>
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Webhook Integration */}
                    <div className="space-y-2 border-t border-slate-800/80 pt-6">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Webhook Dispatch URL</label>
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active Connection
                        </span>
                      </div>
                      <input
                        type="url"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                        placeholder="https://api.yourbank.com/v1/bt-webhook"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                    >
                      <Settings className="w-4 h-4" />
                      Save & Activate Automation Schedule
                    </button>
                  </form>
                </div>

                {/* Active Schedules List */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <h3 className="font-bold text-white">Active Schedules</h3>
                    </div>

                    <div className="space-y-3">
                      {activeSchedules.map(sch => (
                        <div key={sch.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="font-semibold text-sm text-slate-200">{sch.name}</div>
                            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-full font-bold">
                              {sch.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {sch.frequency}
                          </div>
                          <div className="text-[11px] text-indigo-400 font-mono bg-indigo-950/30 px-2 py-1 rounded border border-indigo-900/30">
                            Criteria: {sch.criteria}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 mt-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
                      <Info className="w-4 h-4 text-indigo-400" />
                      Automation Engine Info
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Schedules run automatically in the background. If blackout windows are active, dispatches scheduled for weekends will queue and execute on the next business day at the same time.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* =========================================================
              MODULE 3: CAMPAIGN & PERSONALIZATION ENGINE
              ========================================================= */}
          {activeTab === 'campaign' && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Template Builder */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-indigo-400" />
                      <div>
                        <h3 className="font-bold text-white">Campaign Template Builder</h3>
                        <p className="text-xs text-slate-400">Design personalized messages with dynamic customer placeholders.</p>
                      </div>
                    </div>

                    {/* Channel Selector */}
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => setCampaignChannel('email')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          campaignChannel === 'email' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5" /> Email
                      </button>
                      <button
                        onClick={() => setCampaignChannel('sms')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          campaignChannel === 'sms' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> SMS
                      </button>
                    </div>
                  </div>

                  {/* Placeholder Helper Buttons */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Insert Dynamic Placeholders</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { tag: '{first_name}', label: 'First Name' },
                        { tag: '{balance}', label: 'Current Balance' },
                        { tag: '{current_apr}', label: 'Current APR' },
                        { tag: '{promo_apr}', label: 'Promo APR' },
                        { tag: '{savings}', label: 'Est. Savings' },
                        { tag: '{max_transfer}', label: 'Max Transfer Limit' }
                      ].map(item => (
                        <button
                          key={item.tag}
                          onClick={() => {
                            if (campaignChannel === 'email') {
                              setEmailBody(prev => prev + ' ' + item.tag);
                            } else {
                              setSmsBody(prev => prev + ' ' + item.tag);
                            }
                          }}
                          className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-lg font-mono transition-colors"
                        >
                          {item.tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Template Inputs */}
                  {campaignChannel === 'email' ? (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-semibold">Email Subject Line</label>
                        <input
                          type="text"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-semibold">Email Body (HTML/Text)</label>
                        <textarea
                          rows={8}
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-slate-400 font-semibold">SMS Message Body</label>
                        <span className="text-[10px] text-slate-500 font-mono">{smsBody.length} characters</span>
                      </div>
                      <textarea
                        rows={6}
                        value={smsBody}
                        onChange={(e) => setSmsBody(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {/* Personalization Rules Builder */}
                  <div className="border-t border-slate-800 pt-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <h4 className="font-bold text-white text-sm">Dynamic Offer Rules</h4>
                    </div>

                    <div className="space-y-3">
                      {personalizationRules.map(rule => (
                        <div key={rule.id} className="flex items-center justify-between bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-indigo-400 bg-indigo-950/50 px-2 py-1 rounded border border-indigo-900/30">
                              IF {rule.condition}
                            </span>
                            <span className="text-slate-300">Offer: <strong className="text-white">{rule.offer}</strong></span>
                          </div>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Rule Form */}
                    <form onSubmit={handleAddRule} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Condition (e.g. FICO > 720)"
                        value={newRuleCondition}
                        onChange={(e) => setNewRuleCondition(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Offer (e.g. 0% APR for 15mo)"
                        value={newRuleOffer}
                        onChange={(e) => setNewRuleOffer(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Rule
                      </button>
                    </form>
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="font-bold text-white">Live Preview</h3>
                      
                      {/* Customer Selector for Preview */}
                      <select
                        value={previewCustomerIndex}
                        onChange={(e) => setPreviewCustomerIndex(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        {customers.map((c, idx) => (
                          <option key={c.id} value={idx}>{c.name} (FICO {c.fico})</option>
                        ))}
                      </select>
                    </div>

                    {/* Rendered Preview */}
                    {campaignChannel === 'email' ? (
                      <div className="bg-white text-slate-800 rounded-xl p-4 shadow-inner space-y-3 text-xs min-h-[300px] flex flex-col">
                        <div className="border-b border-slate-100 pb-2 space-y-1">
                          <div><span className="text-slate-400 font-semibold">To:</span> {previewCustomer?.email}</div>
                          <div><span className="text-slate-400 font-semibold">Subject:</span> <span className="font-medium text-slate-900">{renderTemplate(emailSubject, previewCustomer)}</span></div>
                        </div>
                        <div className="whitespace-pre-wrap text-slate-600 leading-relaxed flex-1">
                          {renderTemplate(emailBody, previewCustomer)}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 min-h-[300px] flex flex-col justify-end relative overflow-hidden">
                        <div className="absolute top-4 left-4 right-4 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {renderTemplate(smsBody, previewCustomer)}
                        </div>
                        <div className="text-center text-[10px] text-slate-500 mt-auto">
                          Simulated Mobile Device Preview
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 mt-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      Personalization Active
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      The system automatically matches the customer's FICO score against your dynamic rules to inject the correct promotional APR and fee structure.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* =========================================================
              MODULE 4: ANALYTICS & DISPATCHER DASHBOARD
              ========================================================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
                  <div className="bg-indigo-950 text-indigo-400 p-3 rounded-xl border border-indigo-800/50">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs font-semibold uppercase">Total Dispatched</div>
                    <div className="text-2xl font-bold text-white mt-0.5">14,280</div>
                    <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5 mt-0.5">
                      +12% from last month
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
                  <div className="bg-emerald-950 text-emerald-400 p-3 rounded-xl border border-emerald-800/50">
                    <Percent className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs font-semibold uppercase">Conversion Rate</div>
                    <div className="text-2xl font-bold text-white mt-0.5">4.82%</div>
                    <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5 mt-0.5">
                      +0.4% industry avg
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
                  <div className="bg-amber-950 text-amber-400 p-3 rounded-xl border border-amber-800/50">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs font-semibold uppercase">Total Volume Saved</div>
                    <div className="text-2xl font-bold text-white mt-0.5">$2.4M</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                      Across all active campaigns
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
                  <div className="bg-blue-950 text-blue-400 p-3 rounded-xl border border-blue-800/50">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs font-semibold uppercase">Active Audience</div>
                    <div className="text-2xl font-bold text-white mt-0.5">4,630</div>
                    <div className="text-[10px] text-indigo-400 font-medium mt-0.5">
                      Currently in dispatch queue
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Dispatch Volume Trend (SVG Chart) */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <h3 className="font-bold text-white">Dispatch Volume Trend</h3>
                    <span className="text-xs text-slate-400">Last 6 Months</span>
                  </div>

                  <div className="h-48 w-full relative mt-4">
                    {/* Simple SVG Line Chart */}
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="0" y1="40" x2="600" y2="40" stroke="#1e293b" strokeDasharray="4" />
                      <line x1="0" y1="100" x2="600" y2="100" stroke="#1e293b" strokeDasharray="4" />
                      <line x1="0" y1="160" x2="600" y2="160" stroke="#1e293b" strokeDasharray="4" />

                      {/* Area under line */}
                      <path
                        d="M 0 180 L 100 140 L 200 150 L 300 90 L 400 110 L 500 50 L 600 60 L 600 200 L 0 200 Z"
                        fill="url(#chartGrad)"
                      />

                      {/* Line */}
                      <path
                        d="M 0 180 L 100 140 L 200 150 L 300 90 L 400 110 L 500 50 L 600 60"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      {/* Data Points */}
                      <circle cx="100" cy="140" r="4" fill="#818cf8" />
                      <circle cx="200" cy="150" r="4" fill="#818cf8" />
                      <circle cx="300" cy="90" r="4" fill="#818cf8" />
                      <circle cx="400" cy="110" r="4" fill="#818cf8" />
                      <circle cx="500" cy="50" r="4" fill="#818cf8" />
                      <circle cx="600" cy="60" r="4" fill="#818cf8" />
                    </svg>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 mt-2 px-2">
                    <span>May</span>
                    <span>Jun</span>
                    <span>Jul</span>
                    <span>Aug</span>
                    <span>Sep</span>
                    <span>Oct</span>
                    <span>Nov</span>
                  </div>
                </div>

                {/* Conversion by FICO Range (SVG Bar Chart) */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <h3 className="font-bold text-white">Conversion by FICO</h3>
                    <span className="text-xs text-slate-400">Avg %</span>
                  </div>

                  <div className="space-y-4 my-auto">
                    {[
                      { range: 'Super Prime (740+)', rate: '6.8%', width: 'w-[85%]', color: 'bg-emerald-500' },
                      { range: 'Prime (670-739)', rate: '4.2%', width: 'w-[60%]', color: 'bg-indigo-500' },
                      { range: 'Near Prime (620-669)', rate: '2.5%', width: 'w-[35%]', color: 'bg-amber-500' },
                      { range: 'Subprime (<620)', rate: '1.1%', width: 'w-[15%]', color: 'bg-rose-500' }
                    ].map(item => (
                      <div key={item.range} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400 font-medium">{item.range}</span>
                          <span className="text-white font-bold">{item.rate}</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800">
                          <div className={`${item.color} h-full rounded-full ${item.width}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Dispatcher Queue & Live Logs */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Dispatcher Queue */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-indigo-400" />
                      <h3 className="font-bold text-white">Live Dispatch Queue</h3>
                    </div>

                    {/* Queue Controls */}
                    <div className="flex items-center gap-2">
                      {isDispatching ? (
                        <button
                          onClick={handlePauseDispatch}
                          className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all"
                        >
                          <Pause className="w-3.5 h-3.5" /> Pause Engine
                        </button>
                      ) : (
                        <button
                          onClick={handleStartDispatch}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all"
                        >
                          <Play className="w-3.5 h-3.5" /> Start Engine
                        </button>
                      )}
                      <button
                        onClick={handleClearQueue}
                        className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Clear
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[300px] scrollbar-thin">
                    {queue.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                        <CheckCircle className="w-8 h-8 mb-2 text-slate-600" />
                        <p className="text-sm">All queues are empty.</p>
                        <p className="text-xs text-slate-600">Generate a new batch to queue dispatches.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 text-xs font-semibold">
                            <th className="pb-2">Batch Name</th>
                            <th className="pb-2">Channel</th>
                            <th className="pb-2">Progress</th>
                            <th className="pb-2">Status</th>
                            <th className="pb-2 text-right">Sent / Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-xs">
                          {queue.map(item => (
                            <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                              <td className="py-3 font-semibold text-slate-200">{item.batchName}</td>
                              <td className="py-3">
                                <span className="flex items-center gap-1 text-slate-400">
                                  {item.channel === 'Email' ? <Mail className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                                  {item.channel}
                                </span>
                              </td>
                              <td className="py-3 w-1/4">
                                <div className="space-y-1">
                                  <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800">
                                    <div
                                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                                      style={{ width: `${item.progress}%` }}
                                    ></div>
                                  </div>
                                  <div className="text-[10px] text-slate-500">{item.progress}% completed</div>
                                </div>
                              </td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' :
                                  item.status === 'Sending' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/50 animate-pulse' :
                                  item.status === 'Paused' ? 'bg-amber-950 text-amber-400 border border-amber-800/50' :
                                  'bg-slate-950 text-slate-400 border border-slate-800'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="py-3 text-right font-mono text-slate-300">
                                {item.sentCount} / {item.totalCount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Live Console Logs */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col h-[380px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-indigo-400" />
                      <h3 className="font-bold text-white">Live Engine Console</h3>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>

                  <div className="flex-1 bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-y-auto space-y-2 border border-slate-800/80 scrollbar-thin">
                    {logs.map(log => (
                      <div key={log.id} className="leading-relaxed">
                        <span className="text-slate-600">[{log.timestamp}]</span>{' '}
                        <span className={`font-bold ${
                          log.type === 'success' ? 'text-emerald-400' :
                          log.type === 'warning' ? 'text-amber-400' :
                          log.type === 'error' ? 'text-rose-400' : 'text-indigo-400'
                        }`}>
                          {log.type.toUpperCase()}:
                        </span>{' '}
                        <span className="text-slate-300">{log.message}</span>
                      </div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}