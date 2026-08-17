import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  TrendingUp,
  DollarSign,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Cpu,
  Send,
  Download,
  Plus,
  Trash2,
  Sliders,
  ShieldCheck,
  Database,
  ArrowRight,
  Info,
  Filter,
  Search,
  ChevronRight,
  Sparkles,
  Check,
  HelpCircle
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  source: 'Finicity' | 'Citi';
  category: TaxCategory;
  originalCategory: string;
  suggestedCategory?: TaxCategory;
  confidence?: number; // AI confidence score
  deductiblePercentage: number; // 0 to 100
  notes?: string;
}

export type TaxCategory =
  | 'W2_INCOME'
  | 'BUSINESS_INCOME'
  | 'CAPITAL_GAINS'
  | 'INTEREST_INCOME'
  | 'ORDINARY_EXPENSE'
  | 'BIZ_SOFTWARE'
  | 'BIZ_RENT'
  | 'BIZ_SUPPLIES'
  | 'BIZ_TRAVEL'
  | 'CHARITABLE_DONATION'
  | 'MEDICAL_EXPENSE'
  | 'STATE_LOCAL_TAX'
  | 'MORTGAGE_INTEREST'
  | 'UNCATEGORIZED'
  | 'NON_DEDUCTIBLE';

interface TaxBracket {
  rate: number;
  singleMax: number;
  marriedMax: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  suggestions?: { label: string; action: () => void }[];
}

// ==========================================
// CONSTANTS & TAX CONFIGURATION (2025/2026)
// ==========================================

const TAX_CATEGORIES: Record<TaxCategory, { label: string; group: 'income' | 'deduction' | 'other'; defaultDeductible: number }> = {
  W2_INCOME: { label: 'W-2 Wages & Salary', group: 'income', defaultDeductible: 0 },
  BUSINESS_INCOME: { label: 'Schedule C Business Gross Receipts', group: 'income', defaultDeductible: 0 },
  CAPITAL_GAINS: { label: 'Schedule D Capital Gains/Losses', group: 'income', defaultDeductible: 0 },
  INTEREST_INCOME: { label: 'Taxable Interest (1099-INT)', group: 'income', defaultDeductible: 0 },
  ORDINARY_EXPENSE: { label: 'General Business Expense', group: 'deduction', defaultDeductible: 100 },
  BIZ_SOFTWARE: { label: 'Software & Cloud Services (Sec 179)', group: 'deduction', defaultDeductible: 100 },
  BIZ_RENT: { label: 'Rent & Lease (Office/Coworking)', group: 'deduction', defaultDeductible: 100 },
  BIZ_SUPPLIES: { label: 'Office Supplies & Materials', group: 'deduction', defaultDeductible: 100 },
  BIZ_TRAVEL: { label: 'Business Travel & Meals (50% deductible)', group: 'deduction', defaultDeductible: 50 },
  CHARITABLE_DONATION: { label: 'Charitable Contributions (Schedule A)', group: 'deduction', defaultDeductible: 100 },
  MEDICAL_EXPENSE: { label: 'Medical & Dental Expenses (Schedule A)', group: 'deduction', defaultDeductible: 100 },
  STATE_LOCAL_TAX: { label: 'State & Local Taxes (SALT - Cap $40k)', group: 'deduction', defaultDeductible: 100 },
  MORTGAGE_INTEREST: { label: 'Home Mortgage Interest (Schedule A)', group: 'deduction', defaultDeductible: 100 },
  UNCATEGORIZED: { label: 'Uncategorized Transaction', group: 'other', defaultDeductible: 0 },
  NON_DEDUCTIBLE: { label: 'Personal / Non-Deductible Expense', group: 'other', defaultDeductible: 0 },
};

// 2025/2026 Federal Income Tax Brackets (Single vs Married Filing Jointly)
const FEDERAL_BRACKETS: TaxBracket[] = [
  { rate: 0.10, singleMax: 11600, marriedMax: 23200 },
  { rate: 0.12, singleMax: 47150, marriedMax: 94300 },
  { rate: 0.22, singleMax: 100525, marriedMax: 201050 },
  { rate: 0.24, singleMax: 191950, marriedMax: 383900 },
  { rate: 0.32, singleMax: 243725, marriedMax: 487450 },
  { rate: 0.35, singleMax: 609350, marriedMax: 731200 },
  { rate: 0.37, singleMax: Infinity, marriedMax: Infinity },
];

const STANDARD_DEDUCTIONS = {
  single: 15000,
  married_joint: 30000,
  married_separate: 15000,
  head_household: 22500,
};

// ==========================================
// INITIAL MOCK DATA
// ==========================================

const INITIAL_FINICITY_TRANSACTIONS: Transaction[] = [
  {
    id: 'fin-01',
    date: '2026-01-15',
    description: 'Stripe Payout - Sovereign SaaS LLC',
    amount: 12450.00,
    type: 'income',
    source: 'Finicity',
    category: 'BUSINESS_INCOME',
    originalCategory: 'Deposits / Merchant Payouts',
    deductiblePercentage: 0,
  },
  {
    id: 'fin-02',
    date: '2026-01-30',
    description: 'Acme Corp - W2 Payroll Direct Deposit',
    amount: 5800.00,
    type: 'income',
    source: 'Finicity',
    category: 'W2_INCOME',
    originalCategory: 'Payroll / Direct Deposit',
    deductiblePercentage: 0,
    notes: 'Federal withholding of $850 applied at source'
  },
  {
    id: 'fin-03',
    date: '2026-02-10',
    description: 'Finicity High Yield Savings Interest',
    amount: 142.50,
    type: 'income',
    source: 'Finicity',
    category: 'INTEREST_INCOME',
    originalCategory: 'Interest Earned',
    deductiblePercentage: 0,
  },
  {
    id: 'fin-04',
    date: '2026-02-15',
    description: 'Stripe Payout - Sovereign SaaS LLC',
    amount: 14100.00,
    type: 'income',
    source: 'Finicity',
    category: 'BUSINESS_INCOME',
    originalCategory: 'Deposits / Merchant Payouts',
    deductiblePercentage: 0,
  },
  {
    id: 'fin-05',
    date: '2026-02-28',
    description: 'Acme Corp - W2 Payroll Direct Deposit',
    amount: 5800.00,
    type: 'income',
    source: 'Finicity',
    category: 'W2_INCOME',
    originalCategory: 'Payroll / Direct Deposit',
    deductiblePercentage: 0,
  }
];

const INITIAL_CITI_TRANSACTIONS: Transaction[] = [
  {
    id: 'citi-01',
    date: '2026-01-05',
    description: 'Amazon Web Services - Cloud Hosting',
    amount: 412.80,
    type: 'expense',
    source: 'Citi',
    category: 'BIZ_SOFTWARE',
    originalCategory: 'Computers & Electronics',
    deductiblePercentage: 100,
  },
  {
    id: 'citi-02',
    date: '2026-01-12',
    description: 'WeWork - Monthly Hot Desk Access',
    amount: 350.00,
    type: 'expense',
    source: 'Citi',
    category: 'BIZ_RENT',
    originalCategory: 'Real Estate / Rent',
    deductiblePercentage: 100,
  },
  {
    id: 'citi-03',
    date: '2026-01-18',
    description: 'Staples - Office Chairs & Paper',
    amount: 289.45,
    type: 'expense',
    source: 'Citi',
    category: 'BIZ_SUPPLIES',
    originalCategory: 'Office Supplies',
    deductiblePercentage: 100,
  },
  {
    id: 'citi-04',
    date: '2026-01-22',
    description: 'Delta Air Lines - Flight to Tech Conf',
    amount: 540.00,
    type: 'expense',
    source: 'Citi',
    category: 'BIZ_TRAVEL',
    originalCategory: 'Travel / Airlines',
    deductiblePercentage: 100,
  },
  {
    id: 'citi-05',
    date: '2026-01-25',
    description: 'Citi Brokerage - Capital Gain Distribution',
    amount: 2450.00,
    type: 'income',
    source: 'Citi',
    category: 'CAPITAL_GAINS',
    originalCategory: 'Investment / Dividends',
    deductiblePercentage: 0,
  },
  {
    id: 'citi-06',
    date: '2026-02-02',
    description: 'OpenAI API - LLM Tokens for Agent',
    amount: 185.20,
    type: 'expense',
    source: 'Citi',
    category: 'UNCATEGORIZED',
    originalCategory: 'Software / Services',
    suggestedCategory: 'BIZ_SOFTWARE',
    confidence: 94,
    deductiblePercentage: 0,
  },
  {
    id: 'citi-07',
    date: '2026-02-08',
    description: 'Doctors Without Borders - Donation',
    amount: 500.00,
    type: 'expense',
    source: 'Citi',
    category: 'CHARITABLE_DONATION',
    originalCategory: 'Charity / Non-profit',
    deductiblePercentage: 100,
  },
  {
    id: 'citi-08',
    date: '2026-02-14',
    description: 'Whole Foods Market - Groceries',
    amount: 184.30,
    type: 'expense',
    source: 'Citi',
    category: 'NON_DEDUCTIBLE',
    originalCategory: 'Groceries / Food',
    deductiblePercentage: 0,
  },
  {
    id: 'citi-09',
    date: '2026-02-20',
    description: 'Home Depot - Office Shelving Unit',
    amount: 320.00,
    type: 'expense',
    source: 'Citi',
    category: 'UNCATEGORIZED',
    originalCategory: 'Home Improvement',
    suggestedCategory: 'BIZ_SUPPLIES',
    confidence: 82,
    deductiblePercentage: 0,
  }
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function IrsTaxFiling() {
  // State Management
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [filingStatus, setFilingStatus] = useState<'single' | 'married_joint' | 'married_separate' | 'head_household'>('single');
  const [deductionType, setDeductionType] = useState<'standard' | 'itemized'>('standard');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'form1040' | 'scheduleC' | 'ai_assistant'>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSource, setFilterSource] = useState<'all' | 'Finicity' | 'Citi'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [w2Withholding, setW2Withholding] = useState<number>(1700); // Mocked W2 withholding
  const [quarterlyEstimatedPayments, setQuarterlyEstimatedPayments] = useState<number>(2500);
  const [isGeneratingForm, setIsGeneratingForm] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  // AI Chat State
  const [chatInput, setChatInput] = useState<string>('');
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);

  // Initialize transactions with mock data
  useEffect(() => {
    const combined = [...INITIAL_FINICITY_TRANSACTIONS, ...INITIAL_CITI_TRANSACTIONS];
    setTransactions(combined);

    // Initialize AI Chat with welcome message
    setAiMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: "Hello! I am your Sovereign AI Tax Assistant. I have aggregated your financial data from Finicity (Mastercard Open Banking) and your Citi Credit & Brokerage accounts. I've identified several potential tax deductions and pre-populated your IRS Form 1040 and Schedule C. How can I help you optimize your tax liability today?",
        timestamp: new Date(),
        suggestions: [
          { label: "Find missing deductions", action: () => handleAiCommand("find_deductions") },
          { label: "Review Schedule C expenses", action: () => handleAiCommand("review_schedule_c") },
          { label: "Estimate my self-employment tax", action: () => handleAiCommand("estimate_se_tax") }
        ]
      }
    ]);
  }, []);

  // Trigger toast notifications
  const triggerToast = (message: string) => {
    setShowSuccessToast(message);
    setTimeout(() => setShowSuccessToast(null), 4000);
  };

  // ==========================================
  // TAX CALCULATIONS (useMemo)
  // ==========================================

  const taxCalculations = useMemo(() => {
    let w2Income = 0;
    let businessIncome = 0;
    let capitalGains = 0;
    let interestIncome = 0;

    let businessExpenses = 0;
    let itemizedDeductionsTotal = 0;

    transactions.forEach(tx => {
      const amount = tx.amount;
      const deductibleAmount = amount * (tx.deductiblePercentage / 100);

      if (tx.type === 'income') {
        switch (tx.category) {
          case 'W2_INCOME':
            w2Income += amount;
            break;
          case 'BUSINESS_INCOME':
            businessIncome += amount;
            break;
          case 'CAPITAL_GAINS':
            capitalGains += amount;
            break;
          case 'INTEREST_INCOME':
            interestIncome += amount;
            break;
        }
      } else if (tx.type === 'expense') {
        // Business expenses reduce Schedule C net profit
        if ([
          'ORDINARY_EXPENSE',
          'BIZ_SOFTWARE',
          'BIZ_RENT',
          'BIZ_SUPPLIES',
          'BIZ_TRAVEL'
        ].includes(tx.category)) {
          businessExpenses += deductibleAmount;
        }
        // Itemized deductions (Schedule A)
        else if ([
          'CHARITABLE_DONATION',
          'MEDICAL_EXPENSE',
          'STATE_LOCAL_TAX',
          'MORTGAGE_INTEREST'
        ].includes(tx.category)) {
          itemizedDeductionsTotal += deductibleAmount;
        }
      }
    });

    // Schedule C Net Profit
    const scheduleCNetProfit = Math.max(0, businessIncome - businessExpenses);

    // Self-Employment Tax Calculation (15.3% on 92.35% of net profit)
    const seTaxableEarnings = scheduleCNetProfit * 0.9235;
    const selfEmploymentTax = Math.round(seTaxableEarnings * 0.153);
    
    // Deductible portion of SE Tax (50% of SE Tax is an above-the-line deduction)
    const deductibleSeTax = Math.round(selfEmploymentTax * 0.5);

    // Adjusted Gross Income (AGI)
    // AGI = W2 + Net Biz Profit + Capital Gains + Interest - Deductible SE Tax
    const grossIncome = w2Income + scheduleCNetProfit + capitalGains + interestIncome;
    const agi = Math.max(0, grossIncome - deductibleSeTax);

    // Deductions
    const standardDeductionAmount = STANDARD_DEDUCTIONS[filingStatus];
    const finalDeductionAmount = deductionType === 'standard' 
      ? standardDeductionAmount 
      : Math.max(standardDeductionAmount, itemizedDeductionsTotal);

    // Taxable Income
    const taxableIncome = Math.max(0, agi - finalDeductionAmount);

    // Calculate Federal Income Tax based on brackets
    let federalIncomeTax = 0;
    let remainingTaxable = taxableIncome;
    let previousLimit = 0;

    for (let i = 0; i < FEDERAL_BRACKETS.length; i++) {
      const bracket = FEDERAL_BRACKETS[i];
      const limit = filingStatus === 'married_joint' ? bracket.marriedMax : bracket.singleMax;
      const bracketRange = limit - previousLimit;

      if (remainingTaxable > bracketRange) {
        federalIncomeTax += bracketRange * bracket.rate;
        remainingTaxable -= bracketRange;
        previousLimit = limit;
      } else {
        federalIncomeTax += remainingTaxable * bracket.rate;
        break;
      }
    }

    federalIncomeTax = Math.round(federalIncomeTax);

    // Total Tax Liability
    const totalTaxLiability = federalIncomeTax + selfEmploymentTax;

    // Total Payments
    const totalPayments = w2Withholding + quarterlyEstimatedPayments;

    // Refund or Amount Owed
    const balance = totalPayments - totalTaxLiability;
    const isRefund = balance >= 0;
    const finalBalanceAmount = Math.abs(balance);

    // Audit Risk Score (0-100)
    // Calculated based on: ratio of expenses to business income, uncategorized transactions, high deductions
    let auditRiskScore = 15; // Base risk
    if (businessIncome > 0) {
      const expenseRatio = businessExpenses / businessIncome;
      if (expenseRatio > 0.6) auditRiskScore += 25;
      else if (expenseRatio > 0.4) auditRiskScore += 10;
    }
    const uncategorizedCount = transactions.filter(t => t.category === 'UNCATEGORIZED').length;
    auditRiskScore += uncategorizedCount * 8;
    if (deductionType === 'itemized' && itemizedDeductionsTotal > 25000) auditRiskScore += 15;
    auditRiskScore = Math.min(95, auditRiskScore);

    return {
      w2Income,
      businessIncome,
      businessExpenses,
      scheduleCNetProfit,
      capitalGains,
      interestIncome,
      grossIncome,
      deductibleSeTax,
      agi,
      deductionAmount: finalDeductionAmount,
      taxableIncome,
      selfEmploymentTax,
      federalIncomeTax,
      totalTaxLiability,
      totalPayments,
      isRefund,
      finalBalanceAmount,
      auditRiskScore,
      itemizedDeductionsTotal
    };
  }, [transactions, filingStatus, deductionType, w2Withholding, quarterlyEstimatedPayments]);

  // ==========================================
  // TRANSACTION ACTIONS
  // ==========================================

  const handleCategoryChange = (id: string, newCategory: TaxCategory) => {
    setTransactions(prev =>
      prev.map(tx => {
        if (tx.id === id) {
          const defaultDeductible = TAX_CATEGORIES[newCategory].defaultDeductible;
          return {
            ...tx,
            category: newCategory,
            deductiblePercentage: defaultDeductible,
            // Clear suggestion once user acts
            suggestedCategory: undefined,
            confidence: undefined
          };
        }
        return tx;
      })
    );
    triggerToast("Transaction category updated. Tax estimates recalculated.");
  };

  const handleDeductibleChange = (id: string, percentage: number) => {
    setTransactions(prev =>
      prev.map(tx => (tx.id === id ? { ...tx, deductiblePercentage: Math.min(100, Math.max(0, percentage)) } : tx))
    );
  };

  const handleAcceptSuggestion = (id: string, suggested: TaxCategory) => {
    handleCategoryChange(id, suggested);
  };

  const handleSyncData = () => {
    setIsSyncing(true);
    setSyncProgress(10);
    
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsSyncing(false);
            // Add a new mock transaction to simulate fresh data sync
            const newTx: Transaction = {
              id: `sync-${Date.now()}`,
              date: '2026-03-01',
              description: 'Citi Brokerage - Q1 Dividend Payout',
              amount: 850.00,
              type: 'income',
              source: 'Citi',
              category: 'UNCATEGORIZED',
              originalCategory: 'Investment / Dividends',
              suggestedCategory: 'CAPITAL_GAINS',
              confidence: 91,
              deductiblePercentage: 0,
            };
            setTransactions(prevTxs => [newTx, ...prevTxs]);
            triggerToast("Successfully synchronized latest Finicity & Citi transactions. 1 new transaction found.");
          }, 500);
          return 100;
        }
        return prev + 30;
      });
    }, 300);
  };

  // ==========================================
  // AI ASSISTANT CHAT LOGIC
  // ==========================================

  const handleSendChat = (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const newUserMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date()
    };

    setAiMessages(prev => [...prev, newUserMessage]);
    if (!textToSend) setChatInput('');

    // Simulate AI response
    setTimeout(() => {
      let aiText = "I've analyzed your request. Let me check your aggregated Finicity and Citi ledger.";
      let suggestions: { label: string; action: () => void }[] = [];

      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes('deduct') || lowerQuery.includes('find') || lowerQuery.includes('missing')) {
        const uncategorized = transactions.filter(t => t.category === 'UNCATEGORIZED');
        if (uncategorized.length > 0) {
          aiText = `I found ${uncategorized.length} uncategorized transactions that might qualify for deductions. For example, "${uncategorized[0].description}" ($${uncategorized[0].amount}) is currently uncategorized. I suggest classifying it as ${TAX_CATEGORIES[uncategorized[0].suggestedCategory || 'BIZ_SOFTWARE'].label} which would increase your deductions and lower your tax liability.`;
          suggestions = [
            { label: `Accept Suggestion for ${uncategorized[0].description.substring(0, 12)}...`, action: () => handleAcceptSuggestion(uncategorized[0].id, uncategorized[0].suggestedCategory || 'BIZ_SOFTWARE') },
            { label: "View all uncategorized", action: () => { setActiveTab('transactions'); setFilterCategory('UNCATEGORIZED'); } }
          ];
        } else {
          aiText = "Excellent news! All your transactions are currently categorized. Your Schedule C and Schedule A deductions are fully optimized. Your current total deductions stand at $" + taxCalculations.deductionAmount.toLocaleString() + ".";
        }
      } else if (lowerQuery.includes('schedule c') || lowerQuery.includes('business') || lowerQuery.includes('self-employment')) {
        aiText = `Your Schedule C Net Profit is currently estimated at $${taxCalculations.scheduleCNetProfit.toLocaleString()} (Gross Receipts of $${taxCalculations.businessIncome.toLocaleString()} minus $${taxCalculations.businessExpenses.toLocaleString()} in business expenses). This results in an estimated Self-Employment Tax of $${taxCalculations.selfEmploymentTax.toLocaleString()}.`;
        suggestions = [
          { label: "View Schedule C Form", action: () => setActiveTab('scheduleC') },
          { label: "Review Business Expenses", action: () => { setActiveTab('transactions'); setFilterCategory('BIZ_SOFTWARE'); } }
        ];
      } else if (lowerQuery.includes('bracket') || lowerQuery.includes('rate') || lowerQuery.includes('taxable')) {
        aiText = `With a taxable income of $${taxCalculations.taxableIncome.toLocaleString()}, you fall into the 22% marginal tax bracket. Your effective federal income tax rate is approximately ${((taxCalculations.federalIncomeTax / (taxCalculations.taxableIncome || 1)) * 100).toFixed(1)}%.`;
      } else {
        aiText = "I can help you analyze your Finicity bank feeds and Citi credit card statements to maximize your write-offs. I can also help you fill out Form 1040 and Schedule C. What would you like me to do?";
        suggestions = [
          { label: "Find missing deductions", action: () => handleAiCommand("find_deductions") },
          { label: "Review Schedule C expenses", action: () => handleAiCommand("review_schedule_c") },
          { label: "Estimate my self-employment tax", action: () => handleAiCommand("estimate_se_tax") }
        ];
      }

      const newAiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date(),
        suggestions
      };

      setAiMessages(prev => [...prev, newAiMessage]);
    }, 800);
  };

  const handleAiCommand = (command: string) => {
    if (command === 'find_deductions') {
      handleSendChat("Find missing deductions and analyze uncategorized transactions.");
    } else if (command === 'review_schedule_c') {
      handleSendChat("Review my Schedule C business income and expenses.");
    } else if (command === 'estimate_se_tax') {
      handleSendChat("Estimate my self-employment tax liability.");
    }
  };

  // ==========================================
  // EXPORT & SUBMIT SIMULATION
  // ==========================================

  const handleGenerateFilingPackage = () => {
    setIsGeneratingForm(true);
    setTimeout(() => {
      setIsGeneratingForm(false);
      triggerToast("IRS Tax Filing Package (Form 1040, Schedule C, Schedule D) generated successfully as JSON/TXF.");
      
      // Download simulation
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        taxYear: 2026,
        filingStatus,
        calculations: taxCalculations,
        transactions: transactions
      }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `IRS_Filing_Draft_2026_${filingStatus}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }, 1500);
  };

  // ==========================================
  // FILTERED TRANSACTIONS
  // ==========================================

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tx.originalCategory.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSource = filterSource === 'all' || tx.source === filterSource;
      const matchesCategory = filterCategory === 'all' || tx.category === filterCategory;
      return matchesSearch && matchesSource && matchesCategory;
    });
  }, [transactions, searchQuery, filterSource, filterCategory]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-900/90 border border-emerald-500 text-emerald-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce">
          <CheckCircle className="text-emerald-400 w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Tax Engine Updated</p>
            <p className="text-xs text-emerald-300">{showSuccessToast}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-red-600 text-white p-1.5 rounded-lg font-bold text-xs tracking-wider">IRS</div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Sovereign Tax Filing Assistant
              <span className="text-xs font-normal bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                Tax Year 2026 (Draft)
              </span>
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Aggregating real-time <span className="text-emerald-400 font-semibold">Finicity Open Banking</span> and <span className="text-blue-400 font-semibold">Citi Ledger</span> feeds to automate IRS Form 1040 & Schedule C.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSyncData}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isSyncing 
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
            {isSyncing ? `Syncing Ledger (${syncProgress}%)` : 'Sync Finicity & Citi'}
          </button>

          <button
            onClick={handleGenerateFilingPackage}
            disabled={isGeneratingForm}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-900/20 transition-all duration-200"
          >
            {isGeneratingForm ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating Package...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export IRS Filing Package
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Controls & Quick Stats (3 cols) */}
        <div className="lg:col-span-3 space-y-6">