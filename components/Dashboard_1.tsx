import React, { useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { View } from '../types';

// Import Widgets
import AccountList from '../components/AccountList';
import TransactionList from '../components/TransactionList';
import TimeSeriesChart from '../components/TimeSeriesChart';
import AIPredictionWidget from '../components/AIPredictionWidget';
import ExpectedPaymentsTable from '../components/ExpectedPaymentsTable';
import PayoutsDashboard from '../components/PayoutsDashboard';

import { DollarSign, TrendingUp, Users, ShieldCheck } from 'lucide-react';

// A simple wrapper for dashboard widgets to provide a consistent look and feel.
const WidgetCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-gray-950/50 border border-gray-800 rounded-2xl flex flex-col overflow-hidden backdrop-blur-sm ${className}`}>
    <div className="px-4 py-3 border-b border-gray-800 bg-black/20">
      <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase font-mono">{title}</h3>
    </div>
    <div className="p-4 flex-1 overflow-auto custom-scrollbar">
      {children}
    </div>
  </div>
);

// A simple metric card component
const MetricCard: React.FC<{ title: string; value: string; icon: React.ReactNode; change?: string; changeType?: 'increase' | 'decrease' }> = ({ title, value, icon, change, changeType }) => (
    <div className="bg-gray-950/50 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-sm hover:border-cyan-500/30 transition-colors duration-300">
        <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400 font-mono">{title}</span>
            <div className="text-cyan-400">{icon}</div>
        </div>
        <div className="mt-2">
            <p className="text-3xl font-bold text-white tracking-tighter">{value}</p>
            {change && (
                <p className={`text-xs mt-1 flex items-center ${changeType === 'increase' ? 'text-green-400' : 'text-red-400'}`}>
                    {change}
                </p>
            )}
        </div>
    </div>
);


// Define the structure for our view registry
interface DashboardWidgetConfig {
  id: string;
  title: string;
  component: React.FC<any>;
  gridSpan: string; // e.g., 'col-span-1', 'col-span-2 row-span-2'
  props?: any;
}

// The Dashboard component
const Dashboard = () => {
  const context = useContext(DataContext);

  if (!context) {
    return <div>Loading Dashboard...</div>;
  }

  const { accounts, transactions } = context;

  // Mock data for charts and other components that might need it
  const mockChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Cash Flow',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: 'rgba(6, 182, 212, 0.8)',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // This is our "viewRegistry" for the dashboard widgets
  const viewRegistry: DashboardWidgetConfig[] = [
    {
      id: 'accounts',
      title: 'Financial Accounts',
      component: AccountList,
      gridSpan: 'col-span-1 lg:col-span-2 row-span-2',
      props: { accounts: accounts.slice(0, 5) }, // Show first 5 accounts
    },
    {
      id: 'transactions',
      title: 'Recent Transactions',
      component: TransactionList,
      gridSpan: 'col-span-1 lg:col-span-3 row-span-3',
      props: { transactions: transactions.slice(0, 10) }, // Show recent 10 transactions
    },
    {
      id: 'cashflow',
      title: 'Cash Flow Overview',
      component: TimeSeriesChart,
      gridSpan: 'col-span-1 lg:col-span-3 row-span-2',
      props: { data: mockChartData },
    },
    {
      id: 'ai-predictions',
      title: 'AI Financial Advisor',
      component: AIPredictionWidget,
      gridSpan: 'col-span-1 lg:col-span-2 row-span-2',
      props: {},
    },
    {
      id: 'expected-payments',
      title: 'Upcoming Payments',
      component: ExpectedPaymentsTable,
      gridSpan: 'col-span-1 lg:col-span-3 row-span-2',
      props: {},
    },
    {
      id: 'payouts',
      title: 'Recent Payouts',
      component: PayoutsDashboard,
      gridSpan: 'col-span-1 lg:col-span-2 row-span-2',
      props: {},
    },
  ];

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance?.cash?.total ?? 0), 0);

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tighter">Sovereign Dashboard</h1>
        <p className="text-gray-400 mt-1">Your unified command center for financial operations.</p>
      </header>

      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
            title="Total Balance" 
            value={`$${(totalBalance / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<DollarSign size={24} />}
            change="+2.5% vs last month"
            changeType="increase"
        />
        <MetricCard 
            title="Monthly Volume" 
            value="$1.2M" 
            icon={<TrendingUp size={24} />}
            change="+10.1% vs last month"
            changeType="increase"
        />
        <MetricCard 
            title="Active Customers" 
            value="3,402" 
            icon={<Users size={24} />}
            change="-1.2% vs last month"
            changeType="decrease"
        />
        <MetricCard 
            title="System Status" 
            value="All Systems Nominal" 
            icon={<ShieldCheck size={24} />}
        />
      </div>

      {/* Main Widget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {viewRegistry.map(({ id, title, component: Component, gridSpan, props }) => (
          <div key={id} className={gridSpan}>
            <WidgetCard title={title} className="h-full">
              <Component {...props} />
            </WidgetCard>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;