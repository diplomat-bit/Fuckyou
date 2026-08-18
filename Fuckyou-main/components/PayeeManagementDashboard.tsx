import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Eye, 
  CheckCircle, 
  X, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Building, 
  User, 
  Mail, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  MoreVertical, 
  Edit3,
  Check,
  TrendingUp,
  Users,
  Clock,
  ShieldAlert
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================
export interface Payee {
  id: string;
  name: string;
  email: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  status: 'Active' | 'Pending MFA' | 'Suspended';
  category: 'Vendor' | 'Utility' | 'Contractor' | 'Employee' | 'Other';
  createdAt: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
}

// ==========================================
// INITIAL MOCK DATA
// ==========================================
const INITIAL_PAYEES: Payee[] = [
  {
    id: 'pay-1',
    name: 'Acme Corporation',
    email: 'billing@acme.com',
    accountNumber: '•••• 8901',
    routingNumber: '121000248',
    bankName: 'Chase Bank',
    status: 'Active',
    category: 'Vendor',
    createdAt: '2023-01-15',
    lastPaymentDate: '2023-10-24',
    lastPaymentAmount: 4500.00,
  },
  {
    id: 'pay-2',
    name: 'Pacific Gas & Electric',
    email: 'payments@pge.com',
    accountNumber: '•••• 4321',
    routingNumber: '121000248',
    bankName: 'Wells Fargo',
    status: 'Active',
    category: 'Utility',
    createdAt: '2023-02-10',
    lastPaymentDate: '2023-10-18',
    lastPaymentAmount: 342.50,
  },
  {
    id: 'pay-3',
    name: 'Sarah Jenkins',
    email: 'sarah.j@designco.io',
    accountNumber: '•••• 5678',
    routingNumber: '021000021',
    bankName: 'Citibank',
    status: 'Pending MFA',
    category: 'Contractor',
    createdAt: '2023-10-28',
  },
  {
    id: 'pay-4',
    name: 'Apex Logistics',
    email: 'finance@apexlogistics.com',
    accountNumber: '•••• 9012',
    routingNumber: '021000021',
    bankName: 'Bank of America',
    status: 'Suspended',
    category: 'Vendor',
    createdAt: '2022-11-05',
    lastPaymentDate: '2023-08-12',
    lastPaymentAmount: 12800.00,
  },
  {
    id: 'pay-5',
    name: 'David Miller',
    email: 'david.miller@company.com',
    accountNumber: '•••• 3456',
    routingNumber: '321171184',
    bankName: 'PNC Bank',
    status: 'Active',
    category: 'Employee',
    createdAt: '2023-05-20',
    lastPaymentDate: '2023-10-25',
    lastPaymentAmount: 3200.00,
  }
];

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================
export default function PayeeManagementDashboard() {
  const [payees, setPayees] = useState<Payee[]>(INITIAL_PAYEES);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Modal & Wizard States
  const [isAddWizardOpen, setIsAddWizardOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isMfaOpen, setIsMfaOpen] = useState(false);

  // Selected Payee States
  const [selectedPayee, setSelectedPayee] = useState<Payee | null>(null);
  const [payeeToDelete, setPayeeToDelete] = useState<Payee | null>(null);
  const [pendingNewPayee, setPendingNewPayee] = useState<Partial<Payee> | null>(null);

  // Notification Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Filter Logic
  const filteredPayees = useMemo(() => {
    return payees.filter((payee) => {
      const matchesSearch = 
        payee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payee.bankName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || payee.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || payee.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [payees, searchQuery, statusFilter, categoryFilter]);

  // Stats Calculations
  const stats = useMemo(() => {
    const total = payees.length;
    const active = payees.filter(p => p.status === 'Active').length;
    const pendingMfa = payees.filter(p => p.status === 'Pending MFA').length;
    const totalPaid = payees.reduce((sum, p) => sum + (p.lastPaymentAmount || 0), 0);
    return { total, active, pendingMfa, totalPaid };
  }, [payees]);

  // Handlers
  const handleAddPayeeInitiate = (newPayeeData: Partial<Payee>) => {
    setPendingNewPayee(newPayeeData);
    setIsAddWizardOpen(false);
    setIsMfaOpen(true); // Trigger MFA Flow
  };

  const handleMfaSuccess = () => {
    if (pendingNewPayee) {
      const completePayee: Payee = {
        id: `pay-${Date.now()}`,
        name: pendingNewPayee.name || 'Unknown',
        email: pendingNewPayee.email || '',
        accountNumber: `•••• ${pendingNewPayee.accountNumber?.slice(-4) || '0000'}`,
        routingNumber: pendingNewPayee.routingNumber || '',
        bankName: pendingNewPayee.bankName || 'Unknown Bank',
        status: 'Active',
        category: (pendingNewPayee.category as any) || 'Other',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setPayees([completePayee, ...payees]);
      setPendingNewPayee(null);
      showToast(`Payee "${completePayee.name}" successfully added!`);
    }
    setIsMfaOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (payeeToDelete) {
      setPayees(payees.filter(p => p.id !== payeeToDelete.id));
      showToast(`Payee "${payeeToDelete.name}" has been removed.`, 'info');
      setPayeeToDelete(null);
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans pb-12">
      {/* Header Banner */}
      <header className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 text-white py-8 px-6 sm:px-8 lg:px-12 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-sm font-semibold tracking-wider uppercase mb-1">
              <ShieldCheck className="w-4 h-4" /> Secure Treasury Operations
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Payee Management
            </h1>
            <p className="mt-2 text-slate-300 max-w-xl text-sm sm:text-base">
              Configure, verify, and monitor outbound payment destinations. Multi-factor authentication is enforced for all new payee creations.
            </p>
          </div>
          <button
            onClick={() => setIsAddWizardOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            Add New Payee
          </button>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Payees</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Destinations</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pending MFA Verification</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingMfa}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Disbursed (MTD)</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                ${stats.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <PayeeListFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
        />

        {/* Payees Table / Grid */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">Payee Details</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Bank Account</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Last Payment</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredPayees.length > 0 ? (
                  filteredPayees.map((payee) => (
                    <tr key={payee.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                            {payee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{payee.name}</h4>
                            <p className="text-xs text-slate-500">{payee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {payee.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700">{payee.bankName}</span>
                          <span className="text-xs text-slate-400">{payee.accountNumber}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          payee.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : payee.status === 'Pending MFA'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            payee.status === 'Active' 
                              ? 'bg-emerald-500' 
                              : payee.status === 'Pending MFA'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`} />
                          {payee.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {payee.lastPaymentDate ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700">
                              ${payee.lastPaymentAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs text-slate-400">{payee.lastPaymentDate}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No payments yet</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedPayee(payee);
                              setIsDetailsOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setPayeeToDelete(payee);
                              setIsDeleteOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Payee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="max-w-sm mx-auto flex flex-col items-center">
                        <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
                          <Search className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No payees found</h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Try adjusting your search terms or filters to find what you're looking for.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl border border-slate-800 animate-slide-in">
          <div className={`p-1.5 rounded-lg ${
            toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            <Check className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      {/* MODALS & WIZARDS */}
      {isAddWizardOpen && (
        <AddPayeeWizard 
          onClose={() => setIsAddWizardOpen(false)} 
          onSubmit={handleAddPayeeInitiate} 
        />
      )}

      {isMfaOpen && (
        <PayeeCreationMfaFlow 
          onClose={() => {
            setIsMfaOpen(false);
            setPendingNewPayee(null);
          }}
          onVerify={handleMfaSuccess}
          payeeName={pendingNewPayee?.name || 'New Payee'}
        />
      )}

      {isDetailsOpen && selectedPayee && (
        <PayeeDetailsModal 
          payee={selectedPayee} 
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedPayee(null);
          }} 
        />
      )}

      {isDeleteOpen && payeeToDelete && (
        <PayeeDeleteConfirmation 
          payeeName={payeeToDelete.name}
          onClose={() => {
            setIsDeleteOpen(false);
            setPayeeToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: PAYEE LIST FILTERS
// ==========================================
interface FiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
}

function PayeeListFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter
}: FiltersProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
      {/* Search Input */}
      <div className="relative w-full lg:max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by payee name, email, or bank..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending MFA">Pending MFA</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-40 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        >
          <option value="All">All Categories</option>
          <option value="Vendor">Vendor</option>
          <option value="Utility">Utility</option>
          <option value="Contractor">Contractor</option>
          <option value="Employee">Employee</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: ADD PAYEE WIZARD
// ==========================================
interface AddWizardProps {
  onClose: () => void;
  onSubmit: (data: Partial<Payee>) => void;
}

function AddPayeeWizard({ onClose, onSubmit }: AddWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Vendor',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Payee name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Invalid email address';
      }
    } else if (step === 2) {
      if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
      if (!formData.accountNumber.trim()) {
        newErrors.accountNumber = 'Account number is required';
      } else if (formData.accountNumber.length < 8) {
        newErrors.accountNumber = 'Must be at least 8 digits';
      }
      if (!formData.routingNumber.trim()) {
        newErrors.routingNumber = 'Routing number is required';
      } else if (formData.routingNumber.length !== 9) {
        newErrors.routingNumber = 'Routing number must be exactly 9 digits';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
        
        {/* Wizard Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Add New Payee</h3>
            <p className="text-xs text-slate-400 mt-0.5">Step {step} of 3: {step === 1 ? 'Basic Information' : step === 2 ? 'Bank Details' : 'Review & Confirm'}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 flex">
          <div className={`h-full bg-indigo-600 transition-all duration-300 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Payee Name / Entity</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp or Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                      errors.name ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="email"
                    placeholder="e.g. billing@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                      errors.email ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="Vendor">Vendor</option>
                  <option value="Utility">Utility</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Employee">Employee</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Bank Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="e.g. Chase Bank"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                      errors.bankName ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.bankName && <p className="text-xs text-rose-500 mt-1">{errors.bankName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Account Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="password"
                      placeholder="Account Number"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                        errors.accountNumber ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  {errors.accountNumber && <p className="text-xs text-rose-500 mt-1">{errors.accountNumber}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Routing Number</label>
                  <input
                    type="text"
                    placeholder="9-digit Routing"
                    maxLength={9}
                    value={formData.routingNumber}
                    onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value.replace(/\D/g, '') })}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                      errors.routingNumber ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                  {errors.routingNumber && <p className="text-xs text-rose-500 mt-1">{errors.routingNumber}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">Review Payee Details</h4>
              
              <div className="grid grid-cols-2 gap-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Name</span>
                  <span className="font-semibold text-slate-800">{formData.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Category</span>
                  <span className="font-semibold text-slate-800">{formData.category}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Email</span>
                  <span className="font-semibold text-slate-800">{formData.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Bank Name</span>
                  <span className="font-semibold text-slate-800">{formData.bankName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Routing Number</span>
                  <span className="font-semibold text-slate-800">{formData.routingNumber}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Account Number</span>
                  <span className="font-semibold text-slate-800">•••• •••• {formData.accountNumber.slice(-4)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 p-3 rounded-lg mt-4">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <strong>Security Notice:</strong> Submitting this form will trigger a Multi-Factor Authentication (MFA) challenge to authorize this new payee destination.
                </p>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 transition-colors"
              >
                Request MFA Authorization
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: PAYEE DETAILS MODAL
// ==========================================
interface DetailsProps {
  payee: Payee;
  onClose: () => void;
}

function PayeeDetailsModal({ payee, onClose }: DetailsProps) {
  // Mock transaction history for the payee
  const mockTransactions = [
    { id: 'tx-101', date: '2023-10-24', amount: payee.lastPaymentAmount || 1200.00, status: 'Settled' },
    { id: 'tx-102', date: '2023-09-15', amount: (payee.lastPaymentAmount || 1200.00) * 0.9, status: 'Settled' },
    { id: 'tx-103', date: '2023-08-10', amount: (payee.lastPaymentAmount || 1200.00) * 1.1, status: 'Settled' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
              {payee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold">{payee.name}</h3>
              <p className="text-xs text-slate-400">Payee Profile & History</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Grid Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Information</h4>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Category</span>
                  <span className="font-semibold text-slate-800">{payee.category}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Email</span>
                  <span className="font-semibold text-slate-800">{payee.email}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Status</span>
                  <span className={`font-semibold ${
                    payee.status === 'Active' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>{payee.status}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Created On</span>
                  <span className="font-semibold text-slate-800">{payee.createdAt}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bank Destination</h4>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Bank Name</span>
                  <span className="font-semibold text-slate-800">{payee.bankName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Account Number</span>
                  <span className="font-semibold text-slate-800">{payee.accountNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Routing Number</span>
                  <span className="font-semibold text-slate-800">{payee.routingNumber}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Disbursements</h4>
            <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-500 font-semibold uppercase">
                    <th className="py-2.5 px-4">Transaction ID</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 text-slate-700">
                  {payee.lastPaymentDate ? (
                    mockTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="py-2.5 px-4 font-mono">{tx.id}</td>
                        <td className="py-2.5 px-4">{tx.date}</td>
                        <td className="py-2.5 px-4 font-semibold">${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                            <Check className="w-3 h-3" /> {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                        No transaction history available for this payee.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: DELETE CONFIRMATION
// ==========================================
interface DeleteProps {
  payeeName: string;
  onClose: () => void;
  onConfirm: () => void;
}

function PayeeDeleteConfirmation({ payeeName, onClose, onConfirm }: DeleteProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Remove Payee Destination?</h3>
            <p className="text-sm text-slate-500 mt-2">
              Are you sure you want to delete <strong className="text-slate-800">"{payeeName}"</strong>? This action will immediately revoke all scheduled disbursements to this destination.
            </p>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-rose-600/10 transition-colors"
          >
            Confirm Deletion
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: MFA FLOW MODAL
// ==========================================
interface MfaProps {
  onClose: () => void;
  onVerify: () => void;
  payeeName: string;
}

function PayeeCreationMfaFlow({ onClose, onVerify, payeeName }: MfaProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`mfa-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`mfa-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Simulate secure verification delay
    setTimeout(() => {
      setIsSubmitting(false);
      onVerify();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold">Security Verification</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-600">
              To authorize adding <strong className="text-slate-900">"{payeeName}"</strong> as a verified payee, please enter the 6-digit code sent to your registered authenticator app.
            </p>
          </div>

          {/* Code Inputs */}
          <div className="flex justify-center gap-2">
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`mfa-input-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-xl font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            ))}
          </div>

          {error && <p className="text-xs text-rose-500 text-center">{error}</p>}

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying Security Token...
                </>
              ) : (
                'Verify & Authorize Payee'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1"
            >
              Cancel Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}