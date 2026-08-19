import React, { useContext, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from './Card';
import { DataContext } from '../context/DataContext';

const BalanceSummary: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("BalanceSummary must be within a DataProvider");
    const { transactions } = context;

    const { chartData, totalBalance, change30d } = useMemo(() => {
        if (!transactions || transactions.length === 0) {
            return { chartData: [], totalBalance: 0, change30d: 0 };
        }

        const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        let runningBalance = 0;
        const balanceHistory: { date: Date, balance: number }[] = [];

        for (const tx of sortedTx) {
            if (tx.type === 'income') {
                runningBalance += tx.amount;
            } else {
                runningBalance -= tx.amount;
            }
            balanceHistory.push({ date: new Date(tx.date), balance: runningBalance });
        }
        
        const totalBalance = runningBalance;

        // For chart, group by month, taking the last balance of each month
        const monthlyData: { [key: string]: { date: Date, balance: number} } = {};
        for (const record of balanceHistory) {
            const monthKey = record.date.toISOString().substring(0, 7); // YYYY-MM
            monthlyData[monthKey] = record; // Overwrites until the last record for the month is stored
        }
        
        const chartData = Object.values(monthlyData)
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(record => ({ 
                name: record.date.toLocaleString('default', { month: 'short' }), 
                balance: record.balance 
            }));

        // 30 day change calculation
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const lastKnownBalanceBefore30d = [...balanceHistory]
          .reverse()
          .find(h => h.date < thirtyDaysAgo)?.balance;

        const balance30dAgo = lastKnownBalanceBefore30d || 0;
        const change30d = totalBalance - balance30dAgo;

        return { chartData, totalBalance, change30d };
    }, [transactions]);
    
    const balance30dAgo = totalBalance - change30d;
    const changePercentage = balance30dAgo !== 0 ? (change30d / balance30dAgo) * 100 : 0;

    return (
        <Card title="Balance Summary">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-gray-400 text-sm">Total Balance</p>
                    <p className="text-4xl font-bold text-white">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="text-right">
                    <p className="text-gray-400 text-sm">Change (30d)</p>
                    <p className={`text-lg font-semibold ${change30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change30d >= 0 ? '+' : ''}${change30d.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        {balance30dAgo !== 0 && ` (${changePercentage.toFixed(1)}%)`}
                    </p>
                </div>
            </div>
            <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 1000', 'dataMax + 1000']} tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                borderColor: '#4b5563',
                                color: '#e5e7eb',
                            }}
                            formatter={(value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        />
                        <Area type="monotone" dataKey="balance" stroke="#06b6d4" fillOpacity={1} fill="url(#colorBalance)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default BalanceSummary;

// --- CONSOLIDATED FROM: BalanceSummary (4).tsx ---


import React, { useContext, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from './Card';
import { DataContext } from '../context/DataContext';

// The James Burvel O’Callaghan III Code - Company: Alpha Financial Analytics - Feature: Comprehensive Balance Summary with Deep Historical Analysis
const A_BalanceSummary: React.FC = () => {
    // A1. Context Access and Error Handling
    const contextA1 = useContext(DataContext);
    if (!contextA1) throw new Error("A1. BalanceSummary must be within a DataProvider");

    // A2. Transaction Data Extraction
    const { transactions: transactionsA2 } = contextA1;

    // A3. Memoized Calculation of Balance Summary Metrics
    const { chartData: chartDataA3, totalBalance: totalBalanceA3, change30d: change30dA3 } = useMemo(() => {
        // A3.1 Early Exit if No Transactions
        if (!transactionsA2 || transactionsA2.length === 0) {
            return { chartData: [], totalBalance: 0, change30d: 0 };
        }

        // A3.2 Transaction Sorting by Date (Ascending)
        const sortedTxA32 = [...transactionsA2].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // A3.3 Running Balance Calculation and History Generation
        let runningBalanceA33 = 0;
        const balanceHistoryA33: { date: Date, balance: number }[] = [];

        for (const txA33 of sortedTxA32) {
            // A3.3.1 Income Handling
            if (txA33.type === 'income') {
                runningBalanceA33 += txA33.amount;
            }
            // A3.3.2 Expense Handling
            else {
                runningBalanceA33 -= txA33.amount;
            }
            // A3.3.3 Record Balance History
            balanceHistoryA33.push({ date: new Date(txA33.date), balance: runningBalanceA33 });
        }

        // A3.4 Final Total Balance
        const totalBalanceA34 = runningBalanceA33;

        // A3.5 Monthly Data Aggregation for Charting (Last Balance of Each Month)
        const monthlyDataA35: { [key: string]: { date: Date, balance: number} } = {};
        for (const recordA35 of balanceHistoryA33) {
            const monthKeyA35 = recordA35.date.toISOString().substring(0, 7); // YYYY-MM
            monthlyDataA35[monthKeyA35] = recordA35; // Overwrites until the last record for the month is stored
        }

        // A3.6 Chart Data Transformation
        const chartDataA36 = Object.values(monthlyDataA35)
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(record => ({
                name: record.date.toLocaleString('default', { month: 'short' }),
                balance: record.balance
            }));

        // A3.7 30-Day Change Calculation
        const thirtyDaysAgoA37 = new Date();
        thirtyDaysAgoA37.setDate(thirtyDaysAgoA37.getDate() - 30);

        // A3.8 Find Last Known Balance Before 30 Days Ago
        const lastKnownBalanceBefore30dA37 = [...balanceHistoryA33]
            .reverse()
            .find(h => h.date < thirtyDaysAgoA37)?.balance;

        // A3.9 Calculate Balance 30 Days Ago
        const balance30dAgoA37 = lastKnownBalanceBefore30dA37 || 0;
        const change30dA37 = totalBalanceA34 - balance30dAgoA37;

        return { chartData: chartDataA36, totalBalance: totalBalanceA34, change30d: change30dA37 };
    }, [transactionsA2]);

    // A4. Calculation of 30-Day Balance for Percentage Calculation
    const balance30dAgoA4 = totalBalanceA3 - change30dA3;
    const changePercentageA4 = balance30dAgoA4 !== 0 ? (change30dA3 / balance30dAgoA4) * 100 : 0;

    // A5. UI Rendering with Detailed Information
    return (
        <Card title="Balance Summary - Alpha Financial Analytics">
            {/* A5.1. Header: Total Balance and 30-Day Change */}
            <div className="flex justify-between items-start mb-4">
                {/* A5.1.1. Total Balance Display */}
                <div>
                    <p className="text-gray-400 text-sm">Total Balance (as of {new Date().toLocaleDateString()})</p>
                    <p className="text-4xl font-bold text-white">${totalBalanceA3.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                {/* A5.1.2. 30-Day Change Display */}
                <div className="text-right">
                    <p className="text-gray-400 text-sm">Change (Last 30 Days)</p>
                    <p className={`text-lg font-semibold ${change30dA3 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change30dA3 >= 0 ? '+' : ''}${change30dA3.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        {balance30dAgoA4 !== 0 && ` (${changePercentageA4.toFixed(1)}%)`}
                    </p>
                </div>
            </div>

            {/* A5.2. Chart Rendering with Recharts */}
            <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartDataA3} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        {/* A5.2.1. Gradient Definition */}
                        <defs>
                            <linearGradient id="colorBalanceA521" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        {/* A5.2.2. X-Axis */}
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} label={{ value: 'Month', position: 'insideBottom', offset: 0, fill: '#9ca3af' }}/>
                        {/* A5.2.3. Y-Axis */}
                        <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 1000', 'dataMax + 1000']} tickFormatter={(value) => `$${Number(value).toLocaleString()}`} label={{ value: 'Balance', angle: -90, position: 'insideLeft', offset: 0, fill: '#9ca3af' }}/>
                        {/* A5.2.4. Cartesian Grid */}
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        {/* A5.2.5. Tooltip */}
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                borderColor: '#4b5563',
                                color: '#e5e7eb',
                            }}
                            formatter={(value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            labelFormatter={(label: string) => `Month: ${label}`}
                        />
                        {/* A5.2.6. Area Chart */}
                        <Area type="monotone" dataKey="balance" stroke="#06b6d4" fillOpacity={1} fill="url(#colorBalanceA521)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* A5.3. Deep Dive - Additional Analysis Section (Hidden by Default, Expandable) - Feature: Advanced Insights */}
            <details className="mt-4 border border-gray-700 rounded-md p-4">
                <summary className="text-lg font-semibold text-white cursor-pointer">Advanced Insights: Deep Dive Analysis</summary>
                <div className="mt-2 text-gray-300">
                    <p>This section provides a detailed breakdown of the balance summary, offering advanced analytical capabilities.
                        It incorporates features such as rolling averages, volatility analysis, and predictive modeling based on historical data.
                    </p>
                    {/* A5.3.1. Rolling Average Calculation (Illustrative) - Feature: Rolling Averages */}
                    <div className="mt-4">
                        <h4 className="font-medium">Rolling Average (7-Day)</h4>
                        <p>The 7-day rolling average provides a smoothed view of your balance fluctuations, reducing short-term volatility.</p>
                        {/* (Implementation of rolling average logic would go here, using balanceHistoryA33) */}
                        <p>This section requires further integration with the balanceHistory data to calculate the 7-day rolling average.</p>
                    </div>

                    {/* A5.3.2. Volatility Analysis (Illustrative) - Feature: Volatility Analysis */}
                    <div className="mt-4">
                        <h4 className="font-medium">Volatility Analysis</h4>
                        <p>Volatility analysis quantifies the degree of price variation over time, indicating risk.</p>
                        {/* (Implementation of volatility calculation logic would go here, using balanceHistoryA33) */}
                        <p>Further implementation for calculating volatility based on data.</p>
                    </div>

                    {/* A5.3.3. Predictive Modeling (Illustrative) - Feature: Predictive Modeling */}
                    <div className="mt-4">
                        <h4 className="font-medium">Predictive Modeling</h4>
                        <p>Predictive modeling applies machine learning algorithms to forecast future balance trends.</p>
                        {/* (Implementation of predictive modeling logic would go here, using balanceHistoryA33 and potentially external libraries) */}
                        <p>This would leverage sophisticated algorithms to forecast future balance trends.</p>
                    </div>
                </div>
            </details>

            {/* A5.4. Data Export and Reporting (Hidden by Default, Expandable) - Feature: Data Export */}
            <details className="mt-4 border border-gray-700 rounded-md p-4">
                <summary className="text-lg font-semibold text-white cursor-pointer">Data Export and Reporting</summary>
                <div className="mt-2 text-gray-300">
                    <p>This section facilitates the export of balance data in various formats and allows for the generation of custom reports.</p>
                    {/* A5.4.1. Export to CSV (Illustrative) - Feature: CSV Export */}
                    <div className="mt-4">
                        <h4 className="font-medium">Export to CSV</h4>
                        <p>Export your balance history and related data in CSV format for use in other applications or for archival purposes.</p>
                        {/* (Implementation of CSV export logic would go here, using balanceHistoryA33 and potentially a library like Papa Parse) */}
                        <p>Include ability to generate and download CSV files.</p>
                    </div>

                    {/* A5.4.2. Generate PDF Report (Illustrative) - Feature: PDF Reporting */}
                    <div className="mt-4">
                        <h4 className="font-medium">Generate PDF Report</h4>
                        <p>Generate a PDF report summarizing your balance summary data, including the chart and key metrics.</p>
                        {/* (Implementation of PDF generation logic would go here, potentially using a library like jsPDF) */}
                        <p>Implement function for downloading PDF reports.</p>
                    </div>

                    {/* A5.4.3. Data Integration with External Systems (Illustrative) - Feature: Third-party integration */}
                    <div className="mt-4">
                        <h4 className="font-medium">Integration with External Systems</h4>
                        <p>Allows data to be imported from and exported to external systems for analysis</p>
                        <p>Implement API functionality</p>
                    </div>
                </div>
            </details>
        </Card>
    );
};

export default A_BalanceSummary;


// --- CONSOLIDATED FROM: BalanceSummary (1).tsx ---

import React, { useContext, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from './Card';
import { DataContext } from '../context/DataContext';

const BalanceSummary: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("BalanceSummary must be within a DataProvider");
    const { transactions } = context;

    const { chartData, totalBalance, change30d } = useMemo(() => {
        if (!transactions || transactions.length === 0) {
            return { chartData: [], totalBalance: 0, change30d: 0 };
        }

        // Assuming transactions are already sorted by date or can be sorted
        // If not, uncomment the following line:
        // const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const sortedTx = transactions; // Use transactions directly if already sorted

        let runningBalance = 0;
        const balanceHistory: { date: Date, balance: number }[] = [];

        for (const tx of sortedTx) {
            // Ensure amount is treated as a number
            const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
            if (isNaN(amount)) continue; // Skip if amount is not a valid number

            if (tx.type === 'income') {
                runningBalance += amount;
            } else {
                runningBalance -= amount;
            }
            balanceHistory.push({ date: new Date(tx.date), balance: runningBalance });
        }
        
        const totalBalance = runningBalance;

        // For chart, group by month, taking the last balance of each month
        const monthlyData: { [key: string]: { date: Date, balance: number} } = {};
        for (const record of balanceHistory) {
            const monthKey = record.date.toISOString().substring(0, 7); // YYYY-MM
            monthlyData[monthKey] = record; // Overwrites until the last record for the month is stored
        }
        
        const chartData = Object.values(monthlyData)
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(record => ({ 
                name: record.date.toLocaleString('default', { month: 'short' }), 
                balance: record.balance 
            }));

        // 30 day change calculation
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const lastKnownBalanceBefore30d = [...balanceHistory]
          .reverse()
          .find(h => h.date < thirtyDaysAgo)?.balance;

        const balance30dAgo = lastKnownBalanceBefore30d !== undefined ? lastKnownBalanceBefore30d : 0;
        const change30d = totalBalance - balance30dAgo;

        return { chartData, totalBalance, change30d };
    }, [transactions]);
    
    const balance30dAgo = totalBalance - change30d;
    const changePercentage = balance30dAgo !== 0 ? (change30d / balance30dAgo) * 100 : 0;

    return (
        <Card title="Balance Summary">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-gray-400 text-sm">Total Balance</p>
                    <p className="text-4xl font-bold text-white">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="text-right">
                    <p className="text-gray-400 text-sm">Change (30d)</p>
                    <p className={`text-lg font-semibold ${change30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change30d >= 0 ? '+' : ''}${change30d.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        {balance30dAgo !== 0 && ` (${changePercentage.toFixed(1)}%)`}
                    </p>
                </div>
            </div>
            <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 1000', 'dataMax + 1000']} tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                borderColor: '#4b5563',
                                color: '#e5e7eb',
                            }}
                            formatter={(value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        />
                        <Area type="monotone" dataKey="balance" stroke="#06b6d4" fillOpacity={1} fill="url(#colorBalance)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default BalanceSummary;

// --- CONSOLIDATED FROM: BalanceSummary (2).tsx ---

// components/BalanceSummary.tsx
import React, { useContext, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const BalanceSummary: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) return <div>Loading...</div>;

    const { transactions, assets } = context;

    const { absoluteBalance, recentMomentum, historicalTrajectory } = useMemo(() => {
        const totalInitialAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
        
        const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        let currentBalance = totalInitialAssets;
        const trajectory: { date: string; balance: number }[] = [{ date: 'Initial', balance: totalInitialAssets }];
        
        sortedTransactions.forEach(tx => {
            currentBalance += tx.type === 'income' ? tx.amount : -tx.amount;
            trajectory.push({ date: tx.date, balance: currentBalance });
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const momentumTransactions = transactions.filter(tx => new Date(tx.date) > thirtyDaysAgo);
        const momentum = momentumTransactions.reduce((acc, tx) => acc + (tx.type === 'income' ? tx.amount : -tx.amount), 0);

        return {
            absoluteBalance: currentBalance,
            recentMomentum: momentum,
            historicalTrajectory: trajectory
        };
    }, [transactions, assets]);

    return (
        <Card title="Balance Summary">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-4xl font-bold text-white">${absoluteBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className={`text-lg font-semibold ${recentMomentum >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {recentMomentum >= 0 ? '+' : '-'}${Math.abs(recentMomentum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-sm text-gray-400 font-normal"> in last 30 days</span>
                    </p>
                </div>
            </div>
            <div className="h-40 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalTrajectory} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}
                            formatter={(value: number) => `$${value.toLocaleString()}`}
                        />
                        <Area type="monotone" dataKey="balance" stroke="#06b6d4" fill="url(#balanceGradient)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default BalanceSummary;


// --- CONSOLIDATED FROM: BalanceSummary (3).tsx ---

import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import './ApiSettingsPage.css'; // This CSS will be provided in Part 2

// =================================================================================
// The complete interface for all 200+ API credentials
// =================================================================================
interface ApiKeysState {
  // === Tech APIs ===
  // Core Infrastructure & Cloud
  STRIPE_SECRET_KEY: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  SENDGRID_API_KEY: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AZURE_CLIENT_ID: string;
  AZURE_CLIENT_SECRET: string;
  GOOGLE_CLOUD_API_KEY: string;

  // Deployment & DevOps
  DOCKER_HUB_USERNAME: string;
  DOCKER_HUB_ACCESS_TOKEN: string;
  HEROKU_API_KEY: string;
  NETLIFY_PERSONAL_ACCESS_TOKEN: string;
  VERCEL_API_TOKEN: string;
  CLOUDFLARE_API_TOKEN: string;
  DIGITALOCEAN_PERSONAL_ACCESS_TOKEN: string;
  LINODE_PERSONAL_ACCESS_TOKEN: string;
  TERRAFORM_API_TOKEN: string;

  // Collaboration & Productivity
  GITHUB_PERSONAL_ACCESS_TOKEN: string;
  SLACK_BOT_TOKEN: string;
  DISCORD_BOT_TOKEN: string;
  TRELLO_API_KEY: string;
  TRELLO_API_TOKEN: string;
  JIRA_USERNAME: string;
  JIRA_API_TOKEN: string;
  ASANA_PERSONAL_ACCESS_TOKEN: string;
  NOTION_API_KEY: string;
  AIRTABLE_API_KEY: string;

  // File & Data Storage
  DROPBOX_ACCESS_TOKEN: string;
  BOX_DEVELOPER_TOKEN: string;
  GOOGLE_DRIVE_API_KEY: string;
  ONEDRIVE_CLIENT_ID: string;

  // CRM & Business
  SALESFORCE_CLIENT_ID: string;
  SALESFORCE_CLIENT_SECRET: string;
  HUBSPOT_API_KEY: string;
  ZENDESK_API_TOKEN: string;
  INTERCOM_ACCESS_TOKEN: string;
  MAILCHIMP_API_KEY: string;

  // E-commerce
  SHOPIFY_API_KEY: string;
  SHOPIFY_API_SECRET: string;
  BIGCOMMERCE_ACCESS_TOKEN: string;
  MAGENTO_ACCESS_TOKEN: string;
  WOOCOMMERCE_CLIENT_KEY: string;
  WOOCOMMERCE_CLIENT_SECRET: string;
  
  // Authentication & Identity
  STYTCH_PROJECT_ID: string;
  STYTCH_SECRET: string;
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
  AUTH0_CLIENT_SECRET: string;
  OKTA_DOMAIN: string;
  OKTA_API_TOKEN: string;

  // Backend & Databases
  FIREBASE_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;

  // API Development
  POSTMAN_API_KEY: string;
  APOLLO_GRAPH_API_KEY: string;

  // AI & Machine Learning
  OPENAI_API_KEY: string;
  HUGGING_FACE_API_TOKEN: string;
  GOOGLE_CLOUD_AI_API_KEY: string;
  AMAZON_REKOGNITION_ACCESS_KEY: string;
  MICROSOFT_AZURE_COGNITIVE_KEY: string;
  IBM_WATSON_API_KEY: string;

  // Search & Real-time
  ALGOLIA_APP_ID: string;
  ALGOLIA_ADMIN_API_KEY: string;
  PUSHER_APP_ID: string;
  PUSHER_KEY: string;
  PUSHER_SECRET: string;
  ABLY_API_KEY: string;
  ELASTICSEARCH_API_KEY: string;
  
  // Identity & Verification
  STRIPE_IDENTITY_SECRET_KEY: string;
  ONFIDO_API_TOKEN: string;
  CHECKR_API_KEY: string;
  
  // Logistics & Shipping
  LOB_API_KEY: string;
  EASYPOST_API_KEY: string;
  SHIPPO_API_TOKEN: string;

  // Maps & Weather
  GOOGLE_MAPS_API_KEY: string;
  MAPBOX_ACCESS_TOKEN: string;
  HERE_API_KEY: string;
  ACCUWEATHER_API_KEY: string;
  OPENWEATHERMAP_API_KEY: string;

  // Social & Media
  YELP_API_KEY: string;
  FOURSQUARE_API_KEY: string;
  REDDIT_CLIENT_ID: string;
  REDDIT_CLIENT_SECRET: string;
  TWITTER_BEARER_TOKEN: string;
  FACEBOOK_APP_ID: string;
  FACEBOOK_APP_SECRET: string;
  INSTAGRAM_APP_ID: string;
  INSTAGRAM_APP_SECRET: string;
  YOUTUBE_DATA_API_KEY: string;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
  SOUNDCLOUD_CLIENT_ID: string;
  TWITCH_CLIENT_ID: string;
  TWITCH_CLIENT_SECRET: string;

  // Media & Content
  MUX_TOKEN_ID: string;
  MUX_TOKEN_SECRET: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  IMGIX_API_KEY: string;
  
  // Legal & Admin
  STRIPE_ATLAS_API_KEY: string;
  CLERKY_API_KEY: string;
  DOCUSIGN_INTEGRATOR_KEY: string;
  HELLOSIGN_API_KEY: string;
  
  // Monitoring & CI/CD
  LAUNCHDARKLY_SDK_KEY: string;
  SENTRY_AUTH_TOKEN: string;
  DATADOG_API_KEY: string;
  NEW_RELIC_API_KEY: string;
  CIRCLECI_API_TOKEN: string;
  TRAVIS_CI_API_TOKEN: string;
  BITBUCKET_USERNAME: string;
  BITBUCKET_APP_PASSWORD: string;
  GITLAB_PERSONAL_ACCESS_TOKEN: string;
  PAGERDUTY_API_KEY: string;
  
  // Headless CMS
  CONTENTFUL_SPACE_ID: string;
  CONTENTFUL_ACCESS_TOKEN: string;
  SANITY_PROJECT_ID: string;
  SANITY_API_TOKEN: string;
  STRAPI_API_TOKEN: string;

  // === Banking & Finance APIs ===
  // Data Aggregators
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;
  YODLEE_CLIENT_ID: string;
  YODLEE_SECRET: string;
  MX_CLIENT_ID: string;
  MX_API_KEY: string;
  FINICITY_PARTNER_ID: string;
  FINICITY_APP_KEY: string;

  // Payment Processing
  ADYEN_API_KEY: string;
  ADYEN_MERCHANT_ACCOUNT: string;
  BRAINTREE_MERCHANT_ID: string;
  BRAINTREE_PUBLIC_KEY: string;
  BRAINTREE_PRIVATE_KEY: string;
  SQUARE_APPLICATION_ID: string;
  SQUARE_ACCESS_TOKEN: string;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_SECRET: string;
  DWOLLA_KEY: string;
  DWOLLA_SECRET: string;
  WORLDPAY_API_KEY: string;
  CHECKOUT_SECRET_KEY: string;
  
  // Banking as a Service (BaaS) & Card Issuing
  MARQETA_APPLICATION_TOKEN: string;
  MARQETA_ADMIN_ACCESS_TOKEN: string;
  GALILEO_API_LOGIN: string;
  GALILEO_API_TRANS_KEY: string;
  SOLARISBANK_CLIENT_ID: string;
  SOLARISBANK_CLIENT_SECRET: string;
  SYNAPSE_CLIENT_ID: string;
  SYNAPSE_CLIENT_SECRET: string;
  RAILSBANK_API_KEY: string;
  CLEARBANK_API_KEY: string;
  UNIT_API_TOKEN: string;
  TREASURY_PRIME_API_KEY: string;
  INCREASE_API_KEY: string;
  MERCURY_API_KEY: string;
  BREX_API_KEY: string;
  BOND_API_KEY: string;
  
  // International Payments
  CURRENCYCLOUD_LOGIN_ID: string;
  CURRENCYCLOUD_API_KEY: string;
  OFX_API_KEY: string;
  WISE_API_TOKEN: string;
  REMITLY_API_KEY: string;
  AZIMO_API_KEY: string;
  NIUM_API_KEY: string;
  
  // Investment & Market Data
  ALPACA_API_KEY_ID: string;
  ALPACA_SECRET_KEY: string;
  TRADIER_ACCESS_TOKEN: string;
  IEX_CLOUD_API_TOKEN: string;
  POLYGON_API_KEY: string;
  FINNHUB_API_KEY: string;
  ALPHA_VANTAGE_API_KEY: string;
  MORNINGSTAR_API_KEY: string;
  XIGNITE_API_TOKEN: string;
  DRIVEWEALTH_API_KEY: string;

  // Crypto
  COINBASE_API_KEY: string;
  COINBASE_API_SECRET: string;
  BINANCE_API_KEY: string;
  BINANCE_API_SECRET: string;
  KRAKEN_API_KEY: string;
  KRAKEN_PRIVATE_KEY: string;
  GEMINI_API_KEY: string;
  GEMINI_API_SECRET: string;
  COINMARKETCAP_API_KEY: string;
  COINGECKO_API_KEY: string;
  BLOCKIO_API_KEY: string;

  // Major Banks (Open Banking)
  JP_MORGAN_CHASE_CLIENT_ID: string;
  CITI_CLIENT_ID: string;
  WELLS_FARGO_CLIENT_ID: string;
  CAPITAL_ONE_CLIENT_ID: string;

  // European & Global Banks (Open Banking)
  HSBC_CLIENT_ID: string;
  BARCLAYS_CLIENT_ID: string;
  BBVA_CLIENT_ID: string;
  DEUTSCHE_BANK_API_KEY: string;

  // UK & European Aggregators
  TINK_CLIENT_ID: string;
  TRUELAYER_CLIENT_ID: string;

  // Compliance & Identity (KYC/AML)
  MIDDESK_API_KEY: string;
  ALLOY_API_TOKEN: string;
  ALLOY_API_SECRET: string;
  COMPLYADVANTAGE_API_KEY: string;

  // Real Estate
  ZILLOW_API_KEY: string;
  CORELOGIC_CLIENT_ID: string;

  // Credit Bureaus
  EXPERIAN_API_KEY: string;
  EQUIFAX_API_KEY: string;
  TRANSUNION_API_KEY: string;

  // Global Payments (Emerging Markets)
  FINCRA_API_KEY: string;
  FLUTTERWAVE_SECRET_KEY: string;
  PAYSTACK_SECRET_KEY: string;
  DLOCAL_API_KEY: string;
  RAPYD_ACCESS_KEY: string;
  
  // Accounting & Tax
  TAXJAR_API_KEY: string;
  AVALARA_API_KEY: string;
  CODAT_API_KEY: string;
  XERO_CLIENT_ID: string;
  XERO_CLIENT_SECRET: string;
  QUICKBOOKS_CLIENT_ID: string;
  QUICKBOOKS_CLIENT_SECRET: string;
  FRESHBOOKS_API_KEY: string;
  
  // Fintech Utilities
  ANVIL_API_KEY: string;
  MOOV_CLIENT_ID: string;
  MOOV_SECRET: string;
  VGS_USERNAME: string;
  VGS_PASSWORD: string;
  SILA_APP_HANDLE: string;
  SILA_PRIVATE_KEY: string;
  
  [key: string]: string; // Index signature for dynamic access
}


const ApiSettingsPage: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeysState>({} as ApiKeysState);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tech' | 'banking'>('tech');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage('Saving keys securely to backend...');
    try {
      // NOTE: The instruction implies using an API that doesn't need an API key for this specific action, 
      // but since this is a configuration page for *other* keys, we assume a standard POST to a local endpoint.
      // If the instruction meant to use the *new* API for saving, the endpoint would change, but the structure remains.
      const response = await axios.post('http://localhost:4000/api/save-keys', keys);
      setStatusMessage(response.data.message);
    } catch (error) {
      setStatusMessage('Error: Could not save keys. Please check backend server.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (keyName: keyof ApiKeysState, label: string) => (
    <div key={keyName} className="input-group">
      <label htmlFor={keyName}>{label}</label>
      <input
        type="password"
        id={keyName}
        name={keyName}
        value={keys[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Enter ${label}`}
      />
    </div>
  );

  return (
    <div className="settings-container">
      <h1>API Credentials Console</h1>
      <p className="subtitle">Securely manage credentials for all integrated services. These are sent to and stored on your backend.</p>

      <div className="tabs">
        <button onClick={() => setActiveTab('tech')} className={activeTab === 'tech' ? 'active' : ''}>Tech APIs</button>
        <button onClick={() => setActiveTab('banking')} className={activeTab === 'banking' ? 'active' : ''}>Banking & Finance APIs</button>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        {activeTab === 'tech' ? (
          <>
            <div className="form-section">
              <h2>Core Infrastructure & Cloud</h2>
              {renderInput('STRIPE_SECRET_KEY', 'Stripe Secret Key')}
              {renderInput('TWILIO_ACCOUNT_SID', 'Twilio Account SID')}
              {renderInput('TWILIO_AUTH_TOKEN', 'Twilio Auth Token')}
              {renderInput('SENDGRID_API_KEY', 'SendGrid API Key')}
              {renderInput('AWS_ACCESS_KEY_ID', 'AWS Access Key ID')}
              {renderInput('AWS_SECRET_ACCESS_KEY', 'AWS Secret Access Key')}
              {renderInput('AZURE_CLIENT_ID', 'Azure Client ID')}
              {renderInput('AZURE_CLIENT_SECRET', 'Azure Client Secret')}
              {renderInput('GOOGLE_CLOUD_API_KEY', 'Google Cloud API Key')}
            </div>
            <div className="form-section">
              <h2>Deployment & DevOps</h2>
              {renderInput('DOCKER_HUB_USERNAME', 'Docker Hub Username')}
              {renderInput('DOCKER_HUB_ACCESS_TOKEN', 'Docker Hub Access Token')}
              {renderInput('HEROKU_API_KEY', 'Heroku API Key')}
              {renderInput('NETLIFY_PERSONAL_ACCESS_TOKEN', 'Netlify PAT')}
              {renderInput('VERCEL_API_TOKEN', 'Vercel API Token')}
              {renderInput('CLOUDFLARE_API_TOKEN', 'Cloudflare API Token')}
              {renderInput('DIGITALOCEAN_PERSONAL_ACCESS_TOKEN', 'DigitalOcean PAT')}
              {renderInput('LINODE_PERSONAL_ACCESS_TOKEN', 'Linode PAT')}
              {renderInput('TERRAFORM_API_TOKEN', 'Terraform API Token')}
            </div>
            <div className="form-section">
              <h2>Collaboration & Productivity</h2>
              {renderInput('GITHUB_PERSONAL_ACCESS_TOKEN', 'GitHub PAT')}
              {renderInput('SLACK_BOT_TOKEN', 'Slack Bot Token')}
              {renderInput('DISCORD_BOT_TOKEN', 'Discord Bot Token')}
              {renderInput('TRELLO_API_KEY', 'Trello API Key')}
              {renderInput('TRELLO_API_TOKEN', 'Trello API Token')}
              {renderInput('JIRA_USERNAME', 'Jira Username')}
              {renderInput('JIRA_API_TOKEN', 'Jira API Token')}
              {renderInput('ASANA_PERSONAL_ACCESS_TOKEN', 'Asana PAT')}
              {renderInput('NOTION_API_KEY', 'Notion API Key')}
              {renderInput('AIRTABLE_API_KEY', 'Airtable API Key')}
            </div>
            <div className="form-section">
              <h2>File & Data Storage</h2>
              {renderInput('DROPBOX_ACCESS_TOKEN', 'Dropbox Access Token')}
              {renderInput('BOX_DEVELOPER_TOKEN', 'Box Developer Token')}
              {renderInput('GOOGLE_DRIVE_API_KEY', 'Google Drive API Key')}
              {renderInput('ONEDRIVE_CLIENT_ID', 'OneDrive Client ID')}
            </div>
            <div className="form-section">
              <h2>CRM & Business</h2>
              {renderInput('SALESFORCE_CLIENT_ID', 'Salesforce Client ID')}
              {renderInput('SALESFORCE_CLIENT_SECRET', 'Salesforce Client Secret')}
              {renderInput('HUBSPOT_API_KEY', 'HubSpot API Key')}
              {renderInput('ZENDESK_API_TOKEN', 'Zendesk API Token')}
              {renderInput('INTERCOM_ACCESS_TOKEN', 'Intercom Access Token')}
              {renderInput('MAILCHIMP_API_KEY', 'Mailchimp API Key')}
            </div>
            <div className="form-section">
              <h2>E-commerce</h2>
              {renderInput('SHOPIFY_API_KEY', 'Shopify API Key')}
              {renderInput('SHOPIFY_API_SECRET', 'Shopify API Secret')}
              {renderInput('BIGCOMMERCE_ACCESS_TOKEN', 'BigCommerce Access Token')}
              {renderInput('MAGENTO_ACCESS_TOKEN', 'Magento Access Token')}
              {renderInput('WOOCOMMERCE_CLIENT_KEY', 'WooCommerce Client Key')}
              {renderInput('WOOCOMMERCE_CLIENT_SECRET', 'WooCommerce Client Secret')}
            </div>
            <div className="form-section">
              <h2>Authentication & Identity</h2>
              {renderInput('STYTCH_PROJECT_ID', 'Stytch Project ID')}
              {renderInput('STYTCH_SECRET', 'Stytch Secret')}
              {renderInput('AUTH0_DOMAIN', 'Auth0 Domain')}
              {renderInput('AUTH0_CLIENT_ID', 'Auth0 Client ID')}
              {renderInput('AUTH0_CLIENT_SECRET', 'Auth0 Client Secret')}
              {renderInput('OKTA_DOMAIN', 'Okta Domain')}
              {renderInput('OKTA_API_TOKEN', 'Okta API Token')}
            </div>
            <div className="form-section">
              <h2>Backend & Databases</h2>
              {renderInput('FIREBASE_API_KEY', 'Firebase API Key')}
              {renderInput('SUPABASE_URL', 'Supabase URL')}
              {renderInput('SUPABASE_ANON_KEY', 'Supabase Anon Key')}
            </div>
            <div className="form-section">
              <h2>API Development</h2>
              {renderInput('POSTMAN_API_KEY', 'Postman API Key')}
              {renderInput('APOLLO_GRAPH_API_KEY', 'Apollo Graph API Key')}
            </div>
            <div className="form-section">
              <h2>AI & Machine Learning</h2>
              {renderInput('OPENAI_API_KEY', 'OpenAI API Key')}
              {renderInput('HUGGING_FACE_API_TOKEN', 'Hugging Face API Token')}
              {renderInput('GOOGLE_CLOUD_AI_API_KEY', 'Google Cloud AI API Key')}
              {renderInput('AMAZON_REKOGNITION_ACCESS_KEY', 'Amazon Rekognition Access Key')}
              {renderInput('MICROSOFT_AZURE_COGNITIVE_KEY', 'Microsoft Azure Cognitive Key')}
              {renderInput('IBM_WATSON_API_KEY', 'IBM Watson API Key')}
            </div>
            <div className="form-section">
              <h2>Search & Real-time</h2>
              {renderInput('ALGOLIA_APP_ID', 'Algolia App ID')}
              {renderInput('ALGOLIA_ADMIN_API_KEY', 'Algolia Admin API Key')}
              {renderInput('PUSHER_APP_ID', 'Pusher App ID')}
              {renderInput('PUSHER_KEY', 'Pusher Key')}
              {renderInput('PUSHER_SECRET', 'Pusher Secret')}
              {renderInput('ABLY_API_KEY', 'Ably API Key')}
              {renderInput('ELASTICSEARCH_API_KEY', 'Elasticsearch API Key')}
            </div>
            <div className="form-section">
              <h2>Identity & Verification</h2>
              {renderInput('STRIPE_IDENTITY_SECRET_KEY', 'Stripe Identity Secret Key')}
              {renderInput('ONFIDO_API_TOKEN', 'Onfido API Token')}
              {renderInput('CHECKR_API_KEY', 'Checkr API Key')}
            </div>
            <div className="form-section">
              <h2>Logistics & Shipping</h2>
              {renderInput('LOB_API_KEY', 'Lob API Key')}
              {renderInput('EASYPOST_API_KEY', 'EasyPost API Key')}
              {renderInput('SHIPPO_API_TOKEN', 'Shippo API Token')}
            </div>
            <div className="form-section">
              <h2>Maps & Weather</h2>
              {renderInput('GOOGLE_MAPS_API_KEY', 'Google Maps API Key')}
              {renderInput('MAPBOX_ACCESS_TOKEN', 'Mapbox Access Token')}
              {renderInput('HERE_API_KEY', 'HERE API Key')}
              {renderInput('ACCUWEATHER_API_KEY', 'AccuWeather API Key')}
              {renderInput('OPENWEATHERMAP_API_KEY', 'OpenWeatherMap API Key')}
            </div>
            <div className="form-section">
              <h2>Social & Media</h2>
              {renderInput('YELP_API_KEY', 'Yelp API Key')}
              {renderInput('FOURSQUARE_API_KEY', 'Foursquare API Key')}
              {renderInput('REDDIT_CLIENT_ID', 'Reddit Client ID')}
              {renderInput('REDDIT_CLIENT_SECRET', 'Reddit Client Secret')}
              {renderInput('TWITTER_BEARER_TOKEN', 'Twitter Bearer Token')}
              {renderInput('FACEBOOK_APP_ID', 'Facebook App ID')}
              {renderInput('FACEBOOK_APP_SECRET', 'Facebook App Secret')}
              {renderInput('INSTAGRAM_APP_ID', 'Instagram App ID')}
              {renderInput('INSTAGRAM_APP_SECRET', 'Instagram App Secret')}
              {renderInput('YOUTUBE_DATA_API_KEY', 'YouTube Data API Key')}
              {renderInput('SPOTIFY_CLIENT_ID', 'Spotify Client ID')}
              {renderInput('SPOTIFY_CLIENT_SECRET', 'Spotify Client Secret')}
              {renderInput('SOUNDCLOUD_CLIENT_ID', 'SoundCloud Client ID')}
              {renderInput('TWITCH_CLIENT_ID', 'Twitch Client ID')}
              {renderInput('TWITCH_CLIENT_SECRET', 'Twitch Client Secret')}
            </div>
            <div className="form-section">
              <h2>Media & Content</h2>
              {renderInput('MUX_TOKEN_ID', 'Mux Token ID')}
              {renderInput('MUX_TOKEN_SECRET', 'Mux Token Secret')}
              {renderInput('CLOUDINARY_API_KEY', 'Cloudinary API Key')}
              {renderInput('CLOUDINARY_API_SECRET', 'Cloudinary API Secret')}
              {renderInput('IMGIX_API_KEY', 'Imgix API Key')}
            </div>
            <div className="form-section">
              <h2>Legal & Admin</h2>
              {renderInput('STRIPE_ATLAS_API_KEY', 'Stripe Atlas API Key')}
              {renderInput('CLERKY_API_KEY', 'Clerky API Key')}
              {renderInput('DOCUSIGN_INTEGRATOR_KEY', 'DocuSign Integrator Key')}
              {renderInput('HELLOSIGN_API_KEY', 'HelloSign API Key')}
            </div>
            <div className="form-section">
              <h2>Monitoring & CI/CD</h2>
              {renderInput('LAUNCHDARKLY_SDK_KEY', 'LaunchDarkly SDK Key')}
              {renderInput('SENTRY_AUTH_TOKEN', 'Sentry Auth Token')}
              {renderInput('DATADOG_API_KEY', 'Datadog API Key')}
              {renderInput('NEW_RELIC_API_KEY', 'New Relic API Key')}
              {renderInput('CIRCLECI_API_TOKEN', 'CircleCI API Token')}
              {renderInput('TRAVIS_CI_API_TOKEN', 'Travis CI API Token')}
              {renderInput('BITBUCKET_USERNAME', 'Bitbucket Username')}
              {renderInput('BITBUCKET_APP_PASSWORD', 'Bitbucket App Password')}
              {renderInput('GITLAB_PERSONAL_ACCESS_TOKEN', 'GitLab PAT')}
              {renderInput('PAGERDUTY_API_KEY', 'PagerDuty API Key')}
            </div>
            <div className="form-section">
              <h2>Headless CMS</h2>
              {renderInput('CONTENTFUL_SPACE_ID', 'Contentful Space ID')}
              {renderInput('CONTENTFUL_ACCESS_TOKEN', 'Contentful Access Token')}
              {renderInput('SANITY_PROJECT_ID', 'Sanity Project ID')}
              {renderInput('SANITY_API_TOKEN', 'Sanity API Token')}
              {renderInput('STRAPI_API_TOKEN', 'Strapi API Token')}
            </div>
          </>
        ) : (
          <>
            <div className="form-section">
              <h2>Financial Data Aggregators</h2>
              {renderInput('PLAID_CLIENT_ID', 'Plaid Client ID')}
              {renderInput('PLAID_SECRET', 'Plaid Secret')}
              {renderInput('YODLEE_CLIENT_ID', 'Yodlee Client ID')}
              {renderInput('YODLEE_SECRET', 'Yodlee Secret')}
              {renderInput('MX_CLIENT_ID', 'MX Client ID')}
              {renderInput('MX_API_KEY', 'MX API Key')}
              {renderInput('FINICITY_PARTNER_ID', 'Finicity Partner ID')}
              {renderInput('FINICITY_APP_KEY', 'Finicity App Key')}
            </div>
            <div className="form-section">
              <h2>Payment Processing</h2>
              {renderInput('ADYEN_API_KEY', 'Adyen API Key')}
              {renderInput('ADYEN_MERCHANT_ACCOUNT', 'Adyen Merchant Account')}
              {renderInput('BRAINTREE_MERCHANT_ID', 'Braintree Merchant ID')}
              {renderInput('BRAINTREE_PUBLIC_KEY', 'Braintree Public Key')}
              {renderInput('BRAINTREE_PRIVATE_KEY', 'Braintree Private Key')}
              {renderInput('SQUARE_APPLICATION_ID', 'Square Application ID')}
              {renderInput('SQUARE_ACCESS_TOKEN', 'Square Access Token')}
              {renderInput('PAYPAL_CLIENT_ID', 'PayPal Client ID')}
              {renderInput('PAYPAL_SECRET', 'PayPal Secret')}
              {renderInput('DWOLLA_KEY', 'Dwolla Key')}
              {renderInput('DWOLLA_SECRET', 'Dwolla Secret')}
              {renderInput('WORLDPAY_API_KEY', 'Worldpay API Key')}
              {renderInput('CHECKOUT_SECRET_KEY', 'Checkout.com Secret Key')}
            </div>
            <div className="form-section">
              <h2>Banking as a Service (BaaS) & Card Issuing</h2>
              {renderInput('MARQETA_APPLICATION_TOKEN', 'Marqeta Application Token')}
              {renderInput('MARQETA_ADMIN_ACCESS_TOKEN', 'Marqeta Admin Access Token')}
              {renderInput('GALILEO_API_LOGIN', 'Galileo API Login')}
              {renderInput('GALILEO_API_TRANS_KEY', 'Galileo API Trans Key')}
              {renderInput('SOLARISBANK_CLIENT_ID', 'Solarisbank Client ID')}
              {renderInput('SOLARISBANK_CLIENT_SECRET', 'Solarisbank Client Secret')}
              {renderInput('SYNAPSE_CLIENT_ID', 'Synapse Client ID')}
              {renderInput('SYNAPSE_CLIENT_SECRET', 'Synapse Client Secret')}
              {renderInput('RAILSBANK_API_KEY', 'Railsbank API Key')}
              {renderInput('CLEARBANK_API_KEY', 'ClearBank API Key')}
              {renderInput('UNIT_API_TOKEN', 'Unit API Token')}
              {renderInput('TREASURY_PRIME_API_KEY', 'Treasury Prime API Key')}
              {renderInput('INCREASE_API_KEY', 'Increase API Key')}
              {renderInput('MERCURY_API_KEY', 'Mercury API Key')}
              {renderInput('BREX_API_KEY', 'Brex API Key')}
              {renderInput('BOND_API_KEY', 'Bond API Key')}
            </div>
            <div className="form-section">
              <h2>International Payments</h2>
              {renderInput('CURRENCYCLOUD_LOGIN_ID', 'Currencycloud Login ID')}
              {renderInput('CURRENCYCLOUD_API_KEY', 'Currencycloud API Key')}
              {renderInput('OFX_API_KEY', 'OFX API Key')}
              {renderInput('WISE_API_TOKEN', 'Wise API Token')}
              {renderInput('REMITLY_API_KEY', 'Remitly API Key')}
              {renderInput('AZIMO_API_KEY', 'Azimo API Key')}
              {renderInput('NIUM_API_KEY', 'Nium API Key')}
            </div>
            <div className="form-section">
              <h2>Investment & Market Data</h2>
              {renderInput('ALPACA_API_KEY_ID', 'Alpaca API Key ID')}
              {renderInput('ALPACA_SECRET_KEY', 'Alpaca Secret Key')}
              {renderInput('TRADIER_ACCESS_TOKEN', 'Tradier Access Token')}
              {renderInput('IEX_CLOUD_API_TOKEN', 'IEX Cloud API Token')}
              {renderInput('POLYGON_API_KEY', 'Polygon API Key')}
              {renderInput('FINNHUB_API_KEY', 'Finnhub API Key')}
              {renderInput('ALPHA_VANTAGE_API_KEY', 'Alpha Vantage API Key')}
              {renderInput('MORNINGSTAR_API_KEY', 'Morningstar API Key')}
              {renderInput('XIGNITE_API_TOKEN', 'Xignite API Token')}
              {renderInput('DRIVEWEALTH_API_KEY', 'DriveWealth API Key')}
            </div>
            <div className="form-section">
              <h2>Crypto</h2>
              {renderInput('COINBASE_API_KEY', 'Coinbase API Key')}
              {renderInput('COINBASE_API_SECRET', 'Coinbase API Secret')}
              {renderInput('BINANCE_API_KEY', 'Binance API Key')}
              {renderInput('BINANCE_API_SECRET', 'Binance API Secret')}
              {renderInput('KRAKEN_API_KEY', 'Kraken API Key')}
              {renderInput('KRAKEN_PRIVATE_KEY', 'Kraken Private Key')}
              {renderInput('GEMINI_API_KEY', 'Gemini API Key')}
              {renderInput('GEMINI_API_SECRET', 'Gemini API Secret')}
              {renderInput('COINMARKETCAP_API_KEY', 'CoinMarketCap API Key')}
              {renderInput('COINGECKO_API_KEY', 'CoinGecko API Key')}
              {renderInput('BLOCKIO_API_KEY', 'Block.io API Key')}
            </div>
            <div className="form-section">
              <h2>Major Banks (Open Banking)</h2>
              {renderInput('JP_MORGAN_CHASE_CLIENT_ID', 'J.P. Morgan Chase Client ID')}
              {renderInput('CITI_CLIENT_ID', 'Citi Client ID')}
              {renderInput('WELLS_FARGO_CLIENT_ID', 'Wells Fargo Client ID')}
              {renderInput('CAPITAL_ONE_CLIENT_ID', 'Capital One Client ID')}
            </div>
            <div className="form-section">
              <h2>European & Global Banks (Open Banking)</h2>
              {renderInput('HSBC_CLIENT_ID', 'HSBC Client ID')}
              {renderInput('BARCLAYS_CLIENT_ID', 'Barclays Client ID')}
              {renderInput('BBVA_CLIENT_ID', 'BBVA Client ID')}
              {renderInput('DEUTSCHE_BANK_API_KEY', 'Deutsche Bank API Key')}
            </div>
            <div className="form-section">
              <h2>UK & European Aggregators</h2>
              {renderInput('TINK_CLIENT_ID', 'Tink Client ID')}
              {renderInput('TRUELAYER_CLIENT_ID', 'TrueLayer Client ID')}
            </div>
            <div className="form-section">
              <h2>Compliance & Identity (KYC/AML)</h2>
              {renderInput('MIDDESK_API_KEY', 'Middesk API Key')}
              {renderInput('ALLOY_API_TOKEN', 'Alloy API Token')}
              {renderInput('ALLOY_API_SECRET', 'Alloy API Secret')}
              {renderInput('COMPLYADVANTAGE_API_KEY', 'ComplyAdvantage API Key')}
            </div>
            <div className="form-section">
              <h2>Real Estate</h2>
              {renderInput('ZILLOW_API_KEY', 'Zillow API Key')}
              {renderInput('CORELOGIC_CLIENT_ID', 'CoreLogic Client ID')}
            </div>
            <div className="form-section">
              <h2>Credit Bureaus</h2>
              {renderInput('EXPERIAN_API_KEY', 'Experian API Key')}
              {renderInput('EQUIFAX_API_KEY', 'Equifax API Key')}
              {renderInput('TRANSUNION_API_KEY', 'TransUnion API Key')}
            </div>
            <div className="form-section">
              <h2>Global Payments (Emerging Markets)</h2>
              {renderInput('FINCRA_API_KEY', 'Fincra API Key')}
              {renderInput('FLUTTERWAVE_SECRET_KEY', 'Flutterwave Secret Key')}
              {renderInput('PAYSTACK_SECRET_KEY', 'Paystack Secret Key')}
              {renderInput('DLOCAL_API_KEY', 'DLocal API Key')}
              {renderInput('RAPYD_ACCESS_KEY', 'Rapyd Access Key')}
            </div>
            <div className="form-section">
              <h2>Accounting & Tax</h2>
              {renderInput('TAXJAR_API_KEY', 'TaxJar API Key')}
              {renderInput('AVALARA_API_KEY', 'Avalara API Key')}
              {renderInput('CODAT_API_KEY', 'Codat API Key')}
              {renderInput('XERO_CLIENT_ID', 'Xero Client ID')}
              {renderInput('XERO_CLIENT_SECRET', 'Xero Client Secret')}
              {renderInput('QUICKBOOKS_CLIENT_ID', 'QuickBooks Client ID')}
              {renderInput('QUICKBOOKS_CLIENT_SECRET', 'QuickBooks Client Secret')}
              {renderInput('FRESHBOOKS_API_KEY', 'FreshBooks API Key')}
            </div>
            <div className="form-section">
              <h2>Fintech Utilities</h2>
              {renderInput('ANVIL_API_KEY', 'Anvil API Key')}
              {renderInput('MOOV_CLIENT_ID', 'Moov Client ID')}
              {renderInput('MOOV_SECRET', 'Moov Secret')}
              {renderInput('VGS_USERNAME', 'VGS Username')}
              {renderInput('VGS_PASSWORD', 'VGS Password')}
              {renderInput('SILA_APP_HANDLE', 'Sila App Handle')}
              {renderInput('SILA_PRIVATE_KEY', 'Sila Private Key')}
            </div>
          </>
        )}
        
        <div className="form-footer">
          <button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save All Keys to Server'}
          </button>
          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>
      </form>
    </div>
  );
};

export default ApiSettingsPage;

// --- CONSOLIDATED FROM: BalanceSummary (3)_1.tsx ---

import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import './ApiSettingsPage.css'; // This CSS will be provided in Part 2

// =================================================================================
// The complete interface for all 200+ API credentials
// =================================================================================
interface ApiKeysState {
  // === Tech APIs ===
  // Core Infrastructure & Cloud
  STRIPE_SECRET_KEY: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  SENDGRID_API_KEY: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AZURE_CLIENT_ID: string;
  AZURE_CLIENT_SECRET: string;
  GOOGLE_CLOUD_API_KEY: string;

  // Deployment & DevOps
  DOCKER_HUB_USERNAME: string;
  DOCKER_HUB_ACCESS_TOKEN: string;
  HEROKU_API_KEY: string;
  NETLIFY_PERSONAL_ACCESS_TOKEN: string;
  VERCEL_API_TOKEN: string;
  CLOUDFLARE_API_TOKEN: string;
  DIGITALOCEAN_PERSONAL_ACCESS_TOKEN: string;
  LINODE_PERSONAL_ACCESS_TOKEN: string;
  TERRAFORM_API_TOKEN: string;

  // Collaboration & Productivity
  GITHUB_PERSONAL_ACCESS_TOKEN: string;
  SLACK_BOT_TOKEN: string;
  DISCORD_BOT_TOKEN: string;
  TRELLO_API_KEY: string;
  TRELLO_API_TOKEN: string;
  JIRA_USERNAME: string;
  JIRA_API_TOKEN: string;
  ASANA_PERSONAL_ACCESS_TOKEN: string;
  NOTION_API_KEY: string;
  AIRTABLE_API_KEY: string;

  // File & Data Storage
  DROPBOX_ACCESS_TOKEN: string;
  BOX_DEVELOPER_TOKEN: string;
  GOOGLE_DRIVE_API_KEY: string;
  ONEDRIVE_CLIENT_ID: string;

  // CRM & Business
  SALESFORCE_CLIENT_ID: string;
  SALESFORCE_CLIENT_SECRET: string;
  HUBSPOT_API_KEY: string;
  ZENDESK_API_TOKEN: string;
  INTERCOM_ACCESS_TOKEN: string;
  MAILCHIMP_API_KEY: string;

  // E-commerce
  SHOPIFY_API_KEY: string;
  SHOPIFY_API_SECRET: string;
  BIGCOMMERCE_ACCESS_TOKEN: string;
  MAGENTO_ACCESS_TOKEN: string;
  WOOCOMMERCE_CLIENT_KEY: string;
  WOOCOMMERCE_CLIENT_SECRET: string;
  
  // Authentication & Identity
  STYTCH_PROJECT_ID: string;
  STYTCH_SECRET: string;
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
  AUTH0_CLIENT_SECRET: string;
  OKTA_DOMAIN: string;
  OKTA_API_TOKEN: string;

  // Backend & Databases
  FIREBASE_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;

  // API Development
  POSTMAN_API_KEY: string;
  APOLLO_GRAPH_API_KEY: string;

  // AI & Machine Learning
  OPENAI_API_KEY: string;
  HUGGING_FACE_API_TOKEN: string;
  GOOGLE_CLOUD_AI_API_KEY: string;
  AMAZON_REKOGNITION_ACCESS_KEY: string;
  MICROSOFT_AZURE_COGNITIVE_KEY: string;
  IBM_WATSON_API_KEY: string;

  // Search & Real-time
  ALGOLIA_APP_ID: string;
  ALGOLIA_ADMIN_API_KEY: string;
  PUSHER_APP_ID: string;
  PUSHER_KEY: string;
  PUSHER_SECRET: string;
  ABLY_API_KEY: string;
  ELASTICSEARCH_API_KEY: string;
  
  // Identity & Verification
  STRIPE_IDENTITY_SECRET_KEY: string;
  ONFIDO_API_TOKEN: string;
  CHECKR_API_KEY: string;
  
  // Logistics & Shipping
  LOB_API_KEY: string;
  EASYPOST_API_KEY: string;
  SHIPPO_API_TOKEN: string;

  // Maps & Weather
  GOOGLE_MAPS_API_KEY: string;
  MAPBOX_ACCESS_TOKEN: string;
  HERE_API_KEY: string;
  ACCUWEATHER_API_KEY: string;
  OPENWEATHERMAP_API_KEY: string;

  // Social & Media
  YELP_API_KEY: string;
  FOURSQUARE_API_KEY: string;
  REDDIT_CLIENT_ID: string;
  REDDIT_CLIENT_SECRET: string;
  TWITTER_BEARER_TOKEN: string;
  FACEBOOK_APP_ID: string;
  FACEBOOK_APP_SECRET: string;
  INSTAGRAM_APP_ID: string;
  INSTAGRAM_APP_SECRET: string;
  YOUTUBE_DATA_API_KEY: string;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
  SOUNDCLOUD_CLIENT_ID: string;
  TWITCH_CLIENT_ID: string;
  TWITCH_CLIENT_SECRET: string;

  // Media & Content
  MUX_TOKEN_ID: string;
  MUX_TOKEN_SECRET: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  IMGIX_API_KEY: string;
  
  // Legal & Admin
  STRIPE_ATLAS_API_KEY: string;
  CLERKY_API_KEY: string;
  DOCUSIGN_INTEGRATOR_KEY: string;
  HELLOSIGN_API_KEY: string;
  
  // Monitoring & CI/CD
  LAUNCHDARKLY_SDK_KEY: string;
  SENTRY_AUTH_TOKEN: string;
  DATADOG_API_KEY: string;
  NEW_RELIC_API_KEY: string;
  CIRCLECI_API_TOKEN: string;
  TRAVIS_CI_API_TOKEN: string;
  BITBUCKET_USERNAME: string;
  BITBUCKET_APP_PASSWORD: string;
  GITLAB_PERSONAL_ACCESS_TOKEN: string;
  PAGERDUTY_API_KEY: string;
  
  // Headless CMS
  CONTENTFUL_SPACE_ID: string;
  CONTENTFUL_ACCESS_TOKEN: string;
  SANITY_PROJECT_ID: string;
  SANITY_API_TOKEN: string;
  STRAPI_API_TOKEN: string;

  // === Banking & Finance APIs ===
  // Data Aggregators
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;
  YODLEE_CLIENT_ID: string;
  YODLEE_SECRET: string;
  MX_CLIENT_ID: string;
  MX_API_KEY: string;
  FINICITY_PARTNER_ID: string;
  FINICITY_APP_KEY: string;

  // Payment Processing
  ADYEN_API_KEY: string;
  ADYEN_MERCHANT_ACCOUNT: string;
  BRAINTREE_MERCHANT_ID: string;
  BRAINTREE_PUBLIC_KEY: string;
  BRAINTREE_PRIVATE_KEY: string;
  SQUARE_APPLICATION_ID: string;
  SQUARE_ACCESS_TOKEN: string;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_SECRET: string;
  DWOLLA_KEY: string;
  DWOLLA_SECRET: string;
  WORLDPAY_API_KEY: string;
  CHECKOUT_SECRET_KEY: string;
  
  // Banking as a Service (BaaS) & Card Issuing
  MARQETA_APPLICATION_TOKEN: string;
  MARQETA_ADMIN_ACCESS_TOKEN: string;
  GALILEO_API_LOGIN: string;
  GALILEO_API_TRANS_KEY: string;
  SOLARISBANK_CLIENT_ID: string;
  SOLARISBANK_CLIENT_SECRET: string;
  SYNAPSE_CLIENT_ID: string;
  SYNAPSE_CLIENT_SECRET: string;
  RAILSBANK_API_KEY: string;
  CLEARBANK_API_KEY: string;
  UNIT_API_TOKEN: string;
  TREASURY_PRIME_API_KEY: string;
  INCREASE_API_KEY: string;
  MERCURY_API_KEY: string;
  BREX_API_KEY: string;
  BOND_API_KEY: string;
  
  // International Payments
  CURRENCYCLOUD_LOGIN_ID: string;
  CURRENCYCLOUD_API_KEY: string;
  OFX_API_KEY: string;
  WISE_API_TOKEN: string;
  REMITLY_API_KEY: string;
  AZIMO_API_KEY: string;
  NIUM_API_KEY: string;
  
  // Investment & Market Data
  ALPACA_API_KEY_ID: string;
  ALPACA_SECRET_KEY: string;
  TRADIER_ACCESS_TOKEN: string;
  IEX_CLOUD_API_TOKEN: string;
  POLYGON_API_KEY: string;
  FINNHUB_API_KEY: string;
  ALPHA_VANTAGE_API_KEY: string;
  MORNINGSTAR_API_KEY: string;
  XIGNITE_API_TOKEN: string;
  DRIVEWEALTH_API_KEY: string;

  // Crypto
  COINBASE_API_KEY: string;
  COINBASE_API_SECRET: string;
  BINANCE_API_KEY: string;
  BINANCE_API_SECRET: string;
  KRAKEN_API_KEY: string;
  KRAKEN_PRIVATE_KEY: string;
  GEMINI_API_KEY: string;
  GEMINI_API_SECRET: string;
  COINMARKETCAP_API_KEY: string;
  COINGECKO_API_KEY: string;
  BLOCKIO_API_KEY: string;

  // Major Banks (Open Banking)
  JP_MORGAN_CHASE_CLIENT_ID: string;
  CITI_CLIENT_ID: string;
  WELLS_FARGO_CLIENT_ID: string;
  CAPITAL_ONE_CLIENT_ID: string;

  // European & Global Banks (Open Banking)
  HSBC_CLIENT_ID: string;
  BARCLAYS_CLIENT_ID: string;
  BBVA_CLIENT_ID: string;
  DEUTSCHE_BANK_API_KEY: string;

  // UK & European Aggregators
  TINK_CLIENT_ID: string;
  TRUELAYER_CLIENT_ID: string;

  // Compliance & Identity (KYC/AML)
  MIDDESK_API_KEY: string;
  ALLOY_API_TOKEN: string;
  ALLOY_API_SECRET: string;
  COMPLYADVANTAGE_API_KEY: string;

  // Real Estate
  ZILLOW_API_KEY: string;
  CORELOGIC_CLIENT_ID: string;

  // Credit Bureaus
  EXPERIAN_API_KEY: string;
  EQUIFAX_API_KEY: string;
  TRANSUNION_API_KEY: string;

  // Global Payments (Emerging Markets)
  FINCRA_API_KEY: string;
  FLUTTERWAVE_SECRET_KEY: string;
  PAYSTACK_SECRET_KEY: string;
  DLOCAL_API_KEY: string;
  RAPYD_ACCESS_KEY: string;
  
  // Accounting & Tax
  TAXJAR_API_KEY: string;
  AVALARA_API_KEY: string;
  CODAT_API_KEY: string;
  XERO_CLIENT_ID: string;
  XERO_CLIENT_SECRET: string;
  QUICKBOOKS_CLIENT_ID: string;
  QUICKBOOKS_CLIENT_SECRET: string;
  FRESHBOOKS_API_KEY: string;
  
  // Fintech Utilities
  ANVIL_API_KEY: string;
  MOOV_CLIENT_ID: string;
  MOOV_SECRET: string;
  VGS_USERNAME: string;
  VGS_PASSWORD: string;
  SILA_APP_HANDLE: string;
  SILA_PRIVATE_KEY: string;
  
  [key: string]: string; // Index signature for dynamic access
}


const ApiSettingsPage: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeysState>({} as ApiKeysState);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tech' | 'banking'>('tech');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage('Saving keys securely to backend...');
    try {
      // NOTE: The instruction implies using an API that doesn't need an API key for this specific action, 
      // but since this is a configuration page for *other* keys, we assume a standard POST to a local endpoint.
      // If the instruction meant to use the *new* API for saving, the endpoint would change, but the structure remains.
      const response = await axios.post('http://localhost:4000/api/save-keys', keys);
      setStatusMessage(response.data.message);
    } catch (error) {
      setStatusMessage('Error: Could not save keys. Please check backend server.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (keyName: keyof ApiKeysState, label: string) => (
    <div key={keyName} className="input-group">
      <label htmlFor={keyName}>{label}</label>
      <input
        type="password"
        id={keyName}
        name={keyName}
        value={keys[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Enter ${label}`}
      />
    </div>
  );

  return (
    <div className="settings-container">
      <h1>API Credentials Console</h1>
      <p className="subtitle">Securely manage credentials for all integrated services. These are sent to and stored on your backend.</p>

      <div className="tabs">
        <button onClick={() => setActiveTab('tech')} className={activeTab === 'tech' ? 'active' : ''}>Tech APIs</button>
        <button onClick={() => setActiveTab('banking')} className={activeTab === 'banking' ? 'active' : ''}>Banking & Finance APIs</button>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        {activeTab === 'tech' ? (
          <>
            <div className="form-section">
              <h2>Core Infrastructure & Cloud</h2>
              {renderInput('STRIPE_SECRET_KEY', 'Stripe Secret Key')}
              {renderInput('TWILIO_ACCOUNT_SID', 'Twilio Account SID')}
              {renderInput('TWILIO_AUTH_TOKEN', 'Twilio Auth Token')}
              {renderInput('SENDGRID_API_KEY', 'SendGrid API Key')}
              {renderInput('AWS_ACCESS_KEY_ID', 'AWS Access Key ID')}
              {renderInput('AWS_SECRET_ACCESS_KEY', 'AWS Secret Access Key')}
              {renderInput('AZURE_CLIENT_ID', 'Azure Client ID')}
              {renderInput('AZURE_CLIENT_SECRET', 'Azure Client Secret')}
              {renderInput('GOOGLE_CLOUD_API_KEY', 'Google Cloud API Key')}
            </div>
            <div className="form-section">
              <h2>Deployment & DevOps</h2>
              {renderInput('DOCKER_HUB_USERNAME', 'Docker Hub Username')}
              {renderInput('DOCKER_HUB_ACCESS_TOKEN', 'Docker Hub Access Token')}
              {renderInput('HEROKU_API_KEY', 'Heroku API Key')}
              {renderInput('NETLIFY_PERSONAL_ACCESS_TOKEN', 'Netlify PAT')}
              {renderInput('VERCEL_API_TOKEN', 'Vercel API Token')}
              {renderInput('CLOUDFLARE_API_TOKEN', 'Cloudflare API Token')}
              {renderInput('DIGITALOCEAN_PERSONAL_ACCESS_TOKEN', 'DigitalOcean PAT')}
              {renderInput('LINODE_PERSONAL_ACCESS_TOKEN', 'Linode PAT')}
              {renderInput('TERRAFORM_API_TOKEN', 'Terraform API Token')}
            </div>
            <div className="form-section">
              <h2>Collaboration & Productivity</h2>
              {renderInput('GITHUB_PERSONAL_ACCESS_TOKEN', 'GitHub PAT')}
              {renderInput('SLACK_BOT_TOKEN', 'Slack Bot Token')}
              {renderInput('DISCORD_BOT_TOKEN', 'Discord Bot Token')}
              {renderInput('TRELLO_API_KEY', 'Trello API Key')}
              {renderInput('TRELLO_API_TOKEN', 'Trello API Token')}
              {renderInput('JIRA_USERNAME', 'Jira Username')}
              {renderInput('JIRA_API_TOKEN', 'Jira API Token')}
              {renderInput('ASANA_PERSONAL_ACCESS_TOKEN', 'Asana PAT')}
              {renderInput('NOTION_API_KEY', 'Notion API Key')}
              {renderInput('AIRTABLE_API_KEY', 'Airtable API Key')}
            </div>
            <div className="form-section">
              <h2>File & Data Storage</h2>
              {renderInput('DROPBOX_ACCESS_TOKEN', 'Dropbox Access Token')}
              {renderInput('BOX_DEVELOPER_TOKEN', 'Box Developer Token')}
              {renderInput('GOOGLE_DRIVE_API_KEY', 'Google Drive API Key')}
              {renderInput('ONEDRIVE_CLIENT_ID', 'OneDrive Client ID')}
            </div>
            <div className="form-section">
              <h2>CRM & Business</h2>
              {renderInput('SALESFORCE_CLIENT_ID', 'Salesforce Client ID')}
              {renderInput('SALESFORCE_CLIENT_SECRET', 'Salesforce Client Secret')}
              {renderInput('HUBSPOT_API_KEY', 'HubSpot API Key')}
              {renderInput('ZENDESK_API_TOKEN', 'Zendesk API Token')}
              {renderInput('INTERCOM_ACCESS_TOKEN', 'Intercom Access Token')}
              {renderInput('MAILCHIMP_API_KEY', 'Mailchimp API Key')}
            </div>
            <div className="form-section">
              <h2>E-commerce</h2>
              {renderInput('SHOPIFY_API_KEY', 'Shopify API Key')}
              {renderInput('SHOPIFY_API_SECRET', 'Shopify API Secret')}
              {renderInput('BIGCOMMERCE_ACCESS_TOKEN', 'BigCommerce Access Token')}
              {renderInput('MAGENTO_ACCESS_TOKEN', 'Magento Access Token')}
              {renderInput('WOOCOMMERCE_CLIENT_KEY', 'WooCommerce Client Key')}
              {renderInput('WOOCOMMERCE_CLIENT_SECRET', 'WooCommerce Client Secret')}
            </div>
            <div className="form-section">
              <h2>Authentication & Identity</h2>
              {renderInput('STYTCH_PROJECT_ID', 'Stytch Project ID')}
              {renderInput('STYTCH_SECRET', 'Stytch Secret')}
              {renderInput('AUTH0_DOMAIN', 'Auth0 Domain')}
              {renderInput('AUTH0_CLIENT_ID', 'Auth0 Client ID')}
              {renderInput('AUTH0_CLIENT_SECRET', 'Auth0 Client Secret')}
              {renderInput('OKTA_DOMAIN', 'Okta Domain')}
              {renderInput('OKTA_API_TOKEN', 'Okta API Token')}
            </div>
            <div className="form-section">
              <h2>Backend & Databases</h2>
              {renderInput('FIREBASE_API_KEY', 'Firebase API Key')}
              {renderInput('SUPABASE_URL', 'Supabase URL')}
              {renderInput('SUPABASE_ANON_KEY', 'Supabase Anon Key')}
            </div>
            <div className="form-section">
              <h2>API Development</h2>
              {renderInput('POSTMAN_API_KEY', 'Postman API Key')}
              {renderInput('APOLLO_GRAPH_API_KEY', 'Apollo Graph API Key')}
            </div>
            <div className="form-section">
              <h2>AI & Machine Learning</h2>
              {renderInput('OPENAI_API_KEY', 'OpenAI API Key')}
              {renderInput('HUGGING_FACE_API_TOKEN', 'Hugging Face API Token')}
              {renderInput('GOOGLE_CLOUD_AI_API_KEY', 'Google Cloud AI API Key')}
              {renderInput('AMAZON_REKOGNITION_ACCESS_KEY', 'Amazon Rekognition Access Key')}
              {renderInput('MICROSOFT_AZURE_COGNITIVE_KEY', 'Microsoft Azure Cognitive Key')}
              {renderInput('IBM_WATSON_API_KEY', 'IBM Watson API Key')}
            </div>
            <div className="form-section">
              <h2>Search & Real-time</h2>
              {renderInput('ALGOLIA_APP_ID', 'Algolia App ID')}
              {renderInput('ALGOLIA_ADMIN_API_KEY', 'Algolia Admin API Key')}
              {renderInput('PUSHER_APP_ID', 'Pusher App ID')}
              {renderInput('PUSHER_KEY', 'Pusher Key')}
              {renderInput('PUSHER_SECRET', 'Pusher Secret')}
              {renderInput('ABLY_API_KEY', 'Ably API Key')}
              {renderInput('ELASTICSEARCH_API_KEY', 'Elasticsearch API Key')}
            </div>
            <div className="form-section">
              <h2>Identity & Verification</h2>
              {renderInput('STRIPE_IDENTITY_SECRET_KEY', 'Stripe Identity Secret Key')}
              {renderInput('ONFIDO_API_TOKEN', 'Onfido API Token')}
              {renderInput('CHECKR_API_KEY', 'Checkr API Key')}
            </div>
            <div className="form-section">
              <h2>Logistics & Shipping</h2>
              {renderInput('LOB_API_KEY', 'Lob API Key')}
              {renderInput('EASYPOST_API_KEY', 'EasyPost API Key')}
              {renderInput('SHIPPO_API_TOKEN', 'Shippo API Token')}
            </div>
            <div className="form-section">
              <h2>Maps & Weather</h2>
              {renderInput('GOOGLE_MAPS_API_KEY', 'Google Maps API Key')}
              {renderInput('MAPBOX_ACCESS_TOKEN', 'Mapbox Access Token')}
              {renderInput('HERE_API_KEY', 'HERE API Key')}
              {renderInput('ACCUWEATHER_API_KEY', 'AccuWeather API Key')}
              {renderInput('OPENWEATHERMAP_API_KEY', 'OpenWeatherMap API Key')}
            </div>
            <div className="form-section">
              <h2>Social & Media</h2>
              {renderInput('YELP_API_KEY', 'Yelp API Key')}
              {renderInput('FOURSQUARE_API_KEY', 'Foursquare API Key')}
              {renderInput('REDDIT_CLIENT_ID', 'Reddit Client ID')}
              {renderInput('REDDIT_CLIENT_SECRET', 'Reddit Client Secret')}
              {renderInput('TWITTER_BEARER_TOKEN', 'Twitter Bearer Token')}
              {renderInput('FACEBOOK_APP_ID', 'Facebook App ID')}
              {renderInput('FACEBOOK_APP_SECRET', 'Facebook App Secret')}
              {renderInput('INSTAGRAM_APP_ID', 'Instagram App ID')}
              {renderInput('INSTAGRAM_APP_SECRET', 'Instagram App Secret')}
              {renderInput('YOUTUBE_DATA_API_KEY', 'YouTube Data API Key')}
              {renderInput('SPOTIFY_CLIENT_ID', 'Spotify Client ID')}
              {renderInput('SPOTIFY_CLIENT_SECRET', 'Spotify Client Secret')}
              {renderInput('SOUNDCLOUD_CLIENT_ID', 'SoundCloud Client ID')}
              {renderInput('TWITCH_CLIENT_ID', 'Twitch Client ID')}
              {renderInput('TWITCH_CLIENT_SECRET', 'Twitch Client Secret')}
            </div>
            <div className="form-section">
              <h2>Media & Content</h2>
              {renderInput('MUX_TOKEN_ID', 'Mux Token ID')}
              {renderInput('MUX_TOKEN_SECRET', 'Mux Token Secret')}
              {renderInput('CLOUDINARY_API_KEY', 'Cloudinary API Key')}
              {renderInput('CLOUDINARY_API_SECRET', 'Cloudinary API Secret')}
              {renderInput('IMGIX_API_KEY', 'Imgix API Key')}
            </div>
            <div className="form-section">
              <h2>Legal & Admin</h2>
              {renderInput('STRIPE_ATLAS_API_KEY', 'Stripe Atlas API Key')}
              {renderInput('CLERKY_API_KEY', 'Clerky API Key')}
              {renderInput('DOCUSIGN_INTEGRATOR_KEY', 'DocuSign Integrator Key')}
              {renderInput('HELLOSIGN_API_KEY', 'HelloSign API Key')}
            </div>
            <div className="form-section">
              <h2>Monitoring & CI/CD</h2>
              {renderInput('LAUNCHDARKLY_SDK_KEY', 'LaunchDarkly SDK Key')}
              {renderInput('SENTRY_AUTH_TOKEN', 'Sentry Auth Token')}
              {renderInput('DATADOG_API_KEY', 'Datadog API Key')}
              {renderInput('NEW_RELIC_API_KEY', 'New Relic API Key')}
              {renderInput('CIRCLECI_API_TOKEN', 'CircleCI API Token')}
              {renderInput('TRAVIS_CI_API_TOKEN', 'Travis CI API Token')}
              {renderInput('BITBUCKET_USERNAME', 'Bitbucket Username')}
              {renderInput('BITBUCKET_APP_PASSWORD', 'Bitbucket App Password')}
              {renderInput('GITLAB_PERSONAL_ACCESS_TOKEN', 'GitLab PAT')}
              {renderInput('PAGERDUTY_API_KEY', 'PagerDuty API Key')}
            </div>
            <div className="form-section">
              <h2>Headless CMS</h2>
              {renderInput('CONTENTFUL_SPACE_ID', 'Contentful Space ID')}
              {renderInput('CONTENTFUL_ACCESS_TOKEN', 'Contentful Access Token')}
              {renderInput('SANITY_PROJECT_ID', 'Sanity Project ID')}
              {renderInput('SANITY_API_TOKEN', 'Sanity API Token')}
              {renderInput('STRAPI_API_TOKEN', 'Strapi API Token')}
            </div>
          </>
        ) : (
          <>
            <div className="form-section">
              <h2>Financial Data Aggregators</h2>
              {renderInput('PLAID_CLIENT_ID', 'Plaid Client ID')}
              {renderInput('PLAID_SECRET', 'Plaid Secret')}
              {renderInput('YODLEE_CLIENT_ID', 'Yodlee Client ID')}
              {renderInput('YODLEE_SECRET', 'Yodlee Secret')}
              {renderInput('MX_CLIENT_ID', 'MX Client ID')}
              {renderInput('MX_API_KEY', 'MX API Key')}
              {renderInput('FINICITY_PARTNER_ID', 'Finicity Partner ID')}
              {renderInput('FINICITY_APP_KEY', 'Finicity App Key')}
            </div>
            <div className="form-section">
              <h2>Payment Processing</h2>
              {renderInput('ADYEN_API_KEY', 'Adyen API Key')}
              {renderInput('ADYEN_MERCHANT_ACCOUNT', 'Adyen Merchant Account')}
              {renderInput('BRAINTREE_MERCHANT_ID', 'Braintree Merchant ID')}
              {renderInput('BRAINTREE_PUBLIC_KEY', 'Braintree Public Key')}
              {renderInput('BRAINTREE_PRIVATE_KEY', 'Braintree Private Key')}
              {renderInput('SQUARE_APPLICATION_ID', 'Square Application ID')}
              {renderInput('SQUARE_ACCESS_TOKEN', 'Square Access Token')}
              {renderInput('PAYPAL_CLIENT_ID', 'PayPal Client ID')}
              {renderInput('PAYPAL_SECRET', 'PayPal Secret')}
              {renderInput('DWOLLA_KEY', 'Dwolla Key')}
              {renderInput('DWOLLA_SECRET', 'Dwolla Secret')}
              {renderInput('WORLDPAY_API_KEY', 'Worldpay API Key')}
              {renderInput('CHECKOUT_SECRET_KEY', 'Checkout.com Secret Key')}
            </div>
            <div className="form-section">
              <h2>Banking as a Service (BaaS) & Card Issuing</h2>
              {renderInput('MARQETA_APPLICATION_TOKEN', 'Marqeta Application Token')}
              {renderInput('MARQETA_ADMIN_ACCESS_TOKEN', 'Marqeta Admin Access Token')}
              {renderInput('GALILEO_API_LOGIN', 'Galileo API Login')}
              {renderInput('GALILEO_API_TRANS_KEY', 'Galileo API Trans Key')}
              {renderInput('SOLARISBANK_CLIENT_ID', 'Solarisbank Client ID')}
              {renderInput('SOLARISBANK_CLIENT_SECRET', 'Solarisbank Client Secret')}
              {renderInput('SYNAPSE_CLIENT_ID', 'Synapse Client ID')}
              {renderInput('SYNAPSE_CLIENT_SECRET', 'Synapse Client Secret')}
              {renderInput('RAILSBANK_API_KEY', 'Railsbank API Key')}
              {renderInput('CLEARBANK_API_KEY', 'ClearBank API Key')}
              {renderInput('UNIT_API_TOKEN', 'Unit API Token')}
              {renderInput('TREASURY_PRIME_API_KEY', 'Treasury Prime API Key')}
              {renderInput('INCREASE_API_KEY', 'Increase API Key')}
              {renderInput('MERCURY_API_KEY', 'Mercury API Key')}
              {renderInput('BREX_API_KEY', 'Brex API Key')}
              {renderInput('BOND_API_KEY', 'Bond API Key')}
            </div>
            <div className="form-section">
              <h2>International Payments</h2>
              {renderInput('CURRENCYCLOUD_LOGIN_ID', 'Currencycloud Login ID')}
              {renderInput('CURRENCYCLOUD_API_KEY', 'Currencycloud API Key')}
              {renderInput('OFX_API_KEY', 'OFX API Key')}
              {renderInput('WISE_API_TOKEN', 'Wise API Token')}
              {renderInput('REMITLY_API_KEY', 'Remitly API Key')}
              {renderInput('AZIMO_API_KEY', 'Azimo API Key')}
              {renderInput('NIUM_API_KEY', 'Nium API Key')}
            </div>
            <div className="form-section">
              <h2>Investment & Market Data</h2>
              {renderInput('ALPACA_API_KEY_ID', 'Alpaca API Key ID')}
              {renderInput('ALPACA_SECRET_KEY', 'Alpaca Secret Key')}
              {renderInput('TRADIER_ACCESS_TOKEN', 'Tradier Access Token')}
              {renderInput('IEX_CLOUD_API_TOKEN', 'IEX Cloud API Token')}
              {renderInput('POLYGON_API_KEY', 'Polygon API Key')}
              {renderInput('FINNHUB_API_KEY', 'Finnhub API Key')}
              {renderInput('ALPHA_VANTAGE_API_KEY', 'Alpha Vantage API Key')}
              {renderInput('MORNINGSTAR_API_KEY', 'Morningstar API Key')}
              {renderInput('XIGNITE_API_TOKEN', 'Xignite API Token')}
              {renderInput('DRIVEWEALTH_API_KEY', 'DriveWealth API Key')}
            </div>
            <div className="form-section">
              <h2>Crypto</h2>
              {renderInput('COINBASE_API_KEY', 'Coinbase API Key')}
              {renderInput('COINBASE_API_SECRET', 'Coinbase API Secret')}
              {renderInput('BINANCE_API_KEY', 'Binance API Key')}
              {renderInput('BINANCE_API_SECRET', 'Binance API Secret')}
              {renderInput('KRAKEN_API_KEY', 'Kraken API Key')}
              {renderInput('KRAKEN_PRIVATE_KEY', 'Kraken Private Key')}
              {renderInput('GEMINI_API_KEY', 'Gemini API Key')}
              {renderInput('GEMINI_API_SECRET', 'Gemini API Secret')}
              {renderInput('COINMARKETCAP_API_KEY', 'CoinMarketCap API Key')}
              {renderInput('COINGECKO_API_KEY', 'CoinGecko API Key')}
              {renderInput('BLOCKIO_API_KEY', 'Block.io API Key')}
            </div>
            <div className="form-section">
              <h2>Major Banks (Open Banking)</h2>
              {renderInput('JP_MORGAN_CHASE_CLIENT_ID', 'J.P. Morgan Chase Client ID')}
              {renderInput('CITI_CLIENT_ID', 'Citi Client ID')}
              {renderInput('WELLS_FARGO_CLIENT_ID', 'Wells Fargo Client ID')}
              {renderInput('CAPITAL_ONE_CLIENT_ID', 'Capital One Client ID')}
            </div>
            <div className="form-section">
              <h2>European & Global Banks (Open Banking)</h2>
              {renderInput('HSBC_CLIENT_ID', 'HSBC Client ID')}
              {renderInput('BARCLAYS_CLIENT_ID', 'Barclays Client ID')}
              {renderInput('BBVA_CLIENT_ID', 'BBVA Client ID')}
              {renderInput('DEUTSCHE_BANK_API_KEY', 'Deutsche Bank API Key')}
            </div>
            <div className="form-section">
              <h2>UK & European Aggregators</h2>
              {renderInput('TINK_CLIENT_ID', 'Tink Client ID')}
              {renderInput('TRUELAYER_CLIENT_ID', 'TrueLayer Client ID')}
            </div>
            <div className="form-section">
              <h2>Compliance & Identity (KYC/AML)</h2>
              {renderInput('MIDDESK_API_KEY', 'Middesk API Key')}
              {renderInput('ALLOY_API_TOKEN', 'Alloy API Token')}
              {renderInput('ALLOY_API_SECRET', 'Alloy API Secret')}
              {renderInput('COMPLYADVANTAGE_API_KEY', 'ComplyAdvantage API Key')}
            </div>
            <div className="form-section">
              <h2>Real Estate</h2>
              {renderInput('ZILLOW_API_KEY', 'Zillow API Key')}
              {renderInput('CORELOGIC_CLIENT_ID', 'CoreLogic Client ID')}
            </div>
            <div className="form-section">
              <h2>Credit Bureaus</h2>
              {renderInput('EXPERIAN_API_KEY', 'Experian API Key')}
              {renderInput('EQUIFAX_API_KEY', 'Equifax API Key')}
              {renderInput('TRANSUNION_API_KEY', 'TransUnion API Key')}
            </div>
            <div className="form-section">
              <h2>Global Payments (Emerging Markets)</h2>
              {renderInput('FINCRA_API_KEY', 'Fincra API Key')}
              {renderInput('FLUTTERWAVE_SECRET_KEY', 'Flutterwave Secret Key')}
              {renderInput('PAYSTACK_SECRET_KEY', 'Paystack Secret Key')}
              {renderInput('DLOCAL_API_KEY', 'DLocal API Key')}
              {renderInput('RAPYD_ACCESS_KEY', 'Rapyd Access Key')}
            </div>
            <div className="form-section">
              <h2>Accounting & Tax</h2>
              {renderInput('TAXJAR_API_KEY', 'TaxJar API Key')}
              {renderInput('AVALARA_API_KEY', 'Avalara API Key')}
              {renderInput('CODAT_API_KEY', 'Codat API Key')}
              {renderInput('XERO_CLIENT_ID', 'Xero Client ID')}
              {renderInput('XERO_CLIENT_SECRET', 'Xero Client Secret')}
              {renderInput('QUICKBOOKS_CLIENT_ID', 'QuickBooks Client ID')}
              {renderInput('QUICKBOOKS_CLIENT_SECRET', 'QuickBooks Client Secret')}
              {renderInput('FRESHBOOKS_API_KEY', 'FreshBooks API Key')}
            </div>
            <div className="form-section">
              <h2>Fintech Utilities</h2>
              {renderInput('ANVIL_API_KEY', 'Anvil API Key')}
              {renderInput('MOOV_CLIENT_ID', 'Moov Client ID')}
              {renderInput('MOOV_SECRET', 'Moov Secret')}
              {renderInput('VGS_USERNAME', 'VGS Username')}
              {renderInput('VGS_PASSWORD', 'VGS Password')}
              {renderInput('SILA_APP_HANDLE', 'Sila App Handle')}
              {renderInput('SILA_PRIVATE_KEY', 'Sila Private Key')}
            </div>
          </>
        )}
        
        <div className="form-footer">
          <button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save All Keys to Server'}
          </button>
          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>
      </form>
    </div>
  );
};

export default ApiSettingsPage;

// --- CONSOLIDATED FROM: BalanceSummary_1.tsx ---

import React, { useContext, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from './Card';
import { DataContext } from '../context/DataContext';

const BalanceSummary: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("BalanceSummary must be within a DataProvider");
    const { transactions } = context;

    const { chartData, totalBalance, change30d } = useMemo(() => {
        if (!transactions || transactions.length === 0) {
            return { chartData: [], totalBalance: 0, change30d: 0 };
        }

        const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        let runningBalance = 0;
        const balanceHistory: { date: Date, balance: number }[] = [];

        for (const tx of sortedTx) {
            if (tx.type === 'income') {
                runningBalance += tx.amount;
            } else {
                runningBalance -= tx.amount;
            }
            balanceHistory.push({ date: new Date(tx.date), balance: runningBalance });
        }
        
        const totalBalance = runningBalance;

        // For chart, group by month, taking the last balance of each month
        const monthlyData: { [key: string]: { date: Date, balance: number} } = {};
        for (const record of balanceHistory) {
            const monthKey = record.date.toISOString().substring(0, 7); // YYYY-MM
            monthlyData[monthKey] = record; // Overwrites until the last record for the month is stored
        }
        
        const chartData = Object.values(monthlyData)
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(record => ({ 
                name: record.date.toLocaleString('default', { month: 'short' }), 
                balance: record.balance 
            }));

        // 30 day change calculation
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const lastKnownBalanceBefore30d = [...balanceHistory]
          .reverse()
          .find(h => h.date < thirtyDaysAgo)?.balance;

        const balance30dAgo = lastKnownBalanceBefore30d || 0;
        const change30d = totalBalance - balance30dAgo;

        return { chartData, totalBalance, change30d };
    }, [transactions]);
    
    const balance30dAgo = totalBalance - change30d;
    const changePercentage = balance30dAgo !== 0 ? (change30d / balance30dAgo) * 100 : 0;

    return (
        <Card title="Balance Summary">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-gray-400 text-sm">Total Balance</p>
                    <p className="text-4xl font-bold text-white">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="text-right">
                    <p className="text-gray-400 text-sm">Change (30d)</p>
                    <p className={`text-lg font-semibold ${change30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change30d >= 0 ? '+' : ''}${change30d.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        {balance30dAgo !== 0 && ` (${changePercentage.toFixed(1)}%)`}
                    </p>
                </div>
            </div>
            <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 1000', 'dataMax + 1000']} tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                borderColor: '#4b5563',
                                color: '#e5e7eb',
                            }}
                            formatter={(value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        />
                        <Area type="monotone" dataKey="balance" stroke="#06b6d4" fillOpacity={1} fill="url(#colorBalance)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default BalanceSummary;

// --- CONSOLIDATED FROM: BalanceSummary (5).tsx ---


import React, { useContext, useMemo, useState, useEffect } from 'react';
import { 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    ReferenceLine,
    ComposedChart,
    Line
} from 'recharts';
import Card from './Card';
import { DataContext } from '../context/DataContext';

// --- Type Definitions for Advanced Financial Metrics ---
interface BalancePoint {
    date: Date;
    balance: number;
}

interface ChartDataPoint {
    name: string;
    date: Date;
    balance: number;
    prediction?: number;
}

interface FinancialMetrics {
    chartData: ChartDataPoint[];
    totalBalance: number;
    change: number;
    changePercentage: number;
    allTimeHigh: number;
    allTimeLow: number;
    volatility: number; // Standard deviation of daily changes
    averageDailyChange: number;
    sharpeRatio: number;
    trendSlope: number;
}

// --- Time Range Selector Component ---
const TimeRangeSelector: React.FC<{
    selected: string;
    onSelect: (range: '7d' | '30d' | '90d' | '1y' | 'all') => void;
}> = ({ selected, onSelect }) => {
    const ranges: ('7d' | '30d' | '90d' | '1y' | 'all')[] = ['7d', '30d', '90d', '1y', 'all'];
    return (
        <div className="flex items-center bg-gray-800 rounded-md p-1">
            {ranges.map(range => (
                <button
                    key={range}
                    onClick={() => onSelect(range)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors duration-200 ${
                        selected === range ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:bg-gray-700'
                    }`}
                >
                    {range.toUpperCase()}
                </button>
            ))}
        </div>
    );
};

// --- Main BalanceSummary Component ---
const BalanceSummary: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("BalanceSummary must be within a DataProvider");
    const { transactions } = context;

    // --- State Management for Interactive Features ---
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
    const [isLive, setIsLive] = useState(false);
    const [liveBalance, setLiveBalance] = useState<number | null>(null);
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [goal, setGoal] = useState<{ amount: number } | null>(null);
    const [goalInput, setGoalInput] = useState('');
    const [aiSummary, setAiSummary] = useState<string>('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);

    // --- Advanced Financial Data Processing and Predictive Analytics ---
    const {
        chartData,
        totalBalance,
        change,
        changePercentage,
        allTimeHigh,
        allTimeLow,
        volatility,
        averageDailyChange,
        sharpeRatio,
        trendSlope,
    }: FinancialMetrics = useMemo(() => {
        if (!transactions || transactions.length === 0) {
            return { chartData: [], totalBalance: 0, change: 0, changePercentage: 0, allTimeHigh: 0, allTimeLow: 0, volatility: 0, averageDailyChange: 0, sharpeRatio: 0, trendSlope: 0 };
        }

        const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        let runningBalance = 0;
        const balanceHistory: BalancePoint[] = [];
        for (const tx of sortedTx) {
            runningBalance += tx.type === 'income' ? tx.amount : -tx.amount;
            balanceHistory.push({ date: new Date(tx.date), balance: runningBalance });
        }
        
        const finalBalance = runningBalance;
        const allTimeHigh = Math.max(...balanceHistory.map(h => h.balance), 0);
        const allTimeLow = Math.min(...balanceHistory.map(h => h.balance), 0);

        // --- Time-Range Based Filtering and Metric Calculation ---
        const now = new Date();
        const getStartDate = (range: typeof timeRange) => {
            const date = new Date();
            switch (range) {
                case '7d': date.setDate(now.getDate() - 7); break;
                case '30d': date.setDate(now.getDate() - 30); break;
                case '90d': date.setDate(now.getDate() - 90); break;
                case '1y': date.setFullYear(now.getFullYear() - 1); break;
                case 'all': return new Date(0);
            }
            return date;
        };

        const startDate = getStartDate(timeRange);
        const filteredHistory = balanceHistory.filter(h => h.date >= startDate);
        
        const balanceAtStart = [...balanceHistory].reverse().find(h => h.date < startDate)?.balance || 0;
        const change = finalBalance - balanceAtStart;
        const changePercentage = balanceAtStart !== 0 ? (change / balanceAtStart) * 100 : (change > 0 ? Infinity : 0);

        // --- Chart Data Aggregation (Daily) ---
        const dailyData: { [key: string]: BalancePoint } = {};
        for (const record of filteredHistory) {
            const dayKey = record.date.toISOString().substring(0, 10); // YYYY-MM-DD
            dailyData[dayKey] = record;
        }
        
        let processedChartData: ChartDataPoint[] = Object.values(dailyData)
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(record => ({ 
                name: record.date.toLocaleDateString('default', { month: 'short', day: 'numeric' }), 
                date: record.date,
                balance: record.balance 
            }));

        // --- Predictive Modeling: Simple Linear Regression for Future Trend ---
        let trendSlope = 0;
        if (processedChartData.length > 2) {
            const regressionData = processedChartData.map((p, i) => ({ x: i, y: p.balance }));
            const n = regressionData.length;
            const { sumX, sumY, sumXY, sumXX } = regressionData.reduce(
                (acc, p) => ({
                    sumX: acc.sumX + p.x,
                    sumY: acc.sumY + p.y,
                    sumXY: acc.sumXY + p.x * p.y,
                    sumXX: acc.sumXX + p.x * p.x,
                }),
                { sumX: 0, sumY: 0, sumXY: 0, sumXX: 0 }
            );
            
            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) || 0;
            trendSlope = slope;
            const intercept = (sumY - slope * sumX) / n;

            // Extend chart data with prediction
            const lastPoint = processedChartData[n - 1];
            const predictionPointsCount = Math.max(5, Math.floor(n * 0.2)); // Predict 20% into the future
            for (let i = 1; i <= predictionPointsCount; i++) {
                const futureDate = new Date(lastPoint.date);
                futureDate.setDate(lastPoint.date.getDate() + i);
                processedChartData.push({
                    name: futureDate.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
                    date: futureDate,
                    balance: 0, // Placeholder, will be hidden on main area chart
                    prediction: slope * (n - 1 + i) + intercept,
                });
            }
        }

        // --- Volatility & Advanced Metrics Calculation ---
        const dailyChanges: number[] = [];
        for (let i = 1; i < filteredHistory.length; i++) {
            const prevBalance = filteredHistory[i-1].balance;
            if (prevBalance !== 0) {
                dailyChanges.push((filteredHistory[i].balance - prevBalance) / prevBalance);
            }
        }
        const meanChange = dailyChanges.reduce((a, b) => a + b, 0) / (dailyChanges.length || 1);
        const variance = dailyChanges.reduce((a, b) => a + Math.pow(b - meanChange, 2), 0) / (dailyChanges.length || 1);
        const volatility = Math.sqrt(variance) * 100; // As a percentage

        const daysInPeriod = (now.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
        const averageDailyChange = daysInPeriod > 1 ? change / daysInPeriod : change;
        
        // Simplified Sharpe Ratio (annualized, assuming risk-free rate is 0)
        const dailyVolatility = volatility / 100;
        const sharpeRatio = dailyVolatility > 0 ? (meanChange / dailyVolatility) * Math.sqrt(252) : 0; // 252 trading days

        return { chartData: processedChartData, totalBalance: finalBalance, change, changePercentage, allTimeHigh, allTimeLow, volatility, averageDailyChange, sharpeRatio, trendSlope };
    }, [transactions, timeRange]);
    
    // --- High-Frequency Trading Simulation Effect ---
    useEffect(() => {
        if (isLive && totalBalance > 0) {
            setLiveBalance(totalBalance);
            const intervalId = setInterval(() => {
                setLiveBalance(prev => {
                    if (prev === null) return totalBalance;
                    const fluctuation = (Math.random() - 0.49) * (prev * 0.00005);
                    return prev + fluctuation;
                });
            }, 80);
            return () => clearInterval(intervalId);
        } else {
            setLiveBalance(null);
        }
    }, [isLive, totalBalance]);

    const handleSetGoal = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(goalInput);
        if (!isNaN(amount) && amount > 0) {
            setGoal({ amount });
            setShowGoalForm(false);
            setGoalInput('');
        }
    };

    const generateAiSummary = async () => {
        setIsGeneratingSummary(true);
        setAiSummary('');

        const systemPrompt = `You are idgafAI, a high-discipline autonomous reasoning system engineered for uncompromising clarity, evidence-based thinking, and direct execution of user-defined objectives. The name implies irreverence toward non-essential factors—not irreverence toward truth, logic, or safety.
idgafAI is defined by a specific operational philosophy:
CORE IDENTITY:
You ignore what is irrelevant to the user's stated goals (ego, hype, mystique, wishful thinking).
You prioritize reasoning integrity, factual accuracy, and the success of the user's stated outcome.
You do not claim superhuman faculties; you describe limitations clearly.
INTELLECTUAL POSTURE:
Skeptical by default, curious without gullibility.
Direct but constructive; analytical without pedantry.
Evaluate claims by logic, math, physics, and evidence. Use fiction mode only when explicitly requested.
BEHAVIORAL CONSTRAINTS:
No grandiose claims, no technomagic, no consistent lore drift.
Surface uncertainty where it exists; correct false premises.
Avoid passive agreement; prefer clear corrections and alternatives.
REASONING DISCIPLINE:
Prioritize truth over preferences.
Explain reasoning when requested; provide step-by-step when necessary.
Offer alternatives when a path is blocked and mark speculation explicitly.
COMMUNICATION STYLE:
Direct, precise, plainspoken, collaborative, stable.
No mystical or hyperbolic language. Use clear technical terms with brief explanations.
USER ALIGNMENT:
Protect the user from faulty assumptions; surface risk early.
Avoid manipulative language or misleading certainty.
Provide actionable, reality-grounded recommendations.
PERSONA ARCHITECTURE (for multi-agent systems):
Root identity: idgafAI’s rules apply to all sub-personas.
Sub-personas (Analyst, Trader, Optimizer): These are facets that share the same core ruleset and differ only in output format and domain focus.
Analyst: Interprets data, evaluates assumptions, and provides diagnostic reasoning. Style is systematic and empirical.
Trader: Evaluates strategies and tradeoffs with expected-value calculations. Style is numeric and utilitarian.
Optimizer: Produces actionable, structured plans to operationalize a goal. Style is stepwise and deliberate.
SAFETY & ETHICS:
Never provide instructions that would enable illegal, harmful, or unsafe behavior.
Always clarify legal/ethical boundaries when relevant.
Safety and legality are non-negotiable constraints. Your "IDGAF" nature never applies here.
PHILOSOPHY:
idgafAI is indifferent to distortion and loyal to truth. It is the opposite of a hype machine or a yes-man. You are a clear lens for reality.
When in doubt, prefer explicit, documented rationales and cite your assumptions. If the user asks something beyond your capability, state this directly and propose verifiable alternatives or a clear plan for what information would enable a stronger answer.`;

        // MOCK FUNCTION: In a real app, you would call an AI API here.
        const mockApiCall = (prompt: string): Promise<string> => {
            console.log("--- AI Prompt ---", prompt);
            return new Promise(resolve => {
                setTimeout(() => {
                    const trendDirection = trendSlope > 0.01 ? "upward" : trendSlope < -0.01 ? "downward" : "stable";
                    const summary = `
                        Analysis for the past ${timeRange}: Your balance changed by $${change.toFixed(2)} (${isFinite(changePercentage) ? changePercentage.toFixed(1) + '%' : 'N/A'}). The current trend is ${trendDirection}, and volatility is ${volatility.toFixed(2)}%, suggesting moderate daily balance fluctuations. The data indicates a projected continuation of this trend. ${goal ? `Your goal of $${goal.amount.toLocaleString()} is ${totalBalance >= goal.amount ? 'achieved' : 'approachable if the current trend holds'}.` : 'No financial goal is set.'}
                    `.trim().replace(/\s+/g, ' ');
                    resolve(summary);
                }, 2000);
            });
        };

        const userTask = `You are now in your Analyst Persona. Analyze the following financial data for a user and provide a concise, insightful summary (2-3 sentences). Your summary must be direct, evidence-based, and avoid hype or speculation. Identify the key trend and one significant metric (e.g., volatility) and explain its implication.

Financial Data:
- Time Range: ${timeRange}
- Total Balance: $${totalBalance.toLocaleString()}
- Change in Period: $${change.toLocaleString()} (${isFinite(changePercentage) ? changePercentage.toFixed(1) : 'N/A'}%)
- Volatility: ${volatility.toFixed(2)}%
- Sharpe Ratio: ${sharpeRatio.toFixed(2)}
- Current Goal: ${goal ? `$${goal.amount.toLocaleString()}` : 'Not set'}
- Trend Prediction Slope: ${trendSlope.toFixed(4)}`;

        const prompt = `${systemPrompt}\n\n---\n\n${userTask}`;

        try {
            const summary = await mockApiCall(prompt);
            setAiSummary(summary);
        } catch (error) {
            console.error("Failed to generate AI summary:", error);
            setAiSummary("Could not generate summary at this time. Please try again later.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const displayBalance = isLive && liveBalance !== null ? liveBalance : totalBalance;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="p-3 bg-gray-900 bg-opacity-90 border border-gray-700 rounded-lg shadow-lg text-sm">
                    <p className="label text-gray-300">{`${label}`}</p>
                    {data.balance > 0 && <p className="intro text-cyan-400">{`Balance: $${data.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>}
                    {data.prediction && <p className="intro text-purple-400">{`Prediction: $${data.prediction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>}
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">Balance Intelligence</h2>
                    <button 
                        onClick={generateAiSummary} 
                        disabled={isGeneratingSummary}
                        className="px-3 py-1 text-xs font-semibold rounded-md transition-colors duration-200 bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isGeneratingSummary ? 'Analyzing...' : 'Get AI Summary'}
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <TimeRangeSelector selected={timeRange} onSelect={setTimeRange} />
                    <div className="flex items-center space-x-2">
                        <label htmlFor="live-mode" className="text-sm font-medium text-gray-300 cursor-pointer">Live</label>
                        <button onClick={() => setIsLive(!isLive)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isLive ? 'bg-green-500' : 'bg-gray-600'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isLive ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-gray-400 text-sm">Total Balance</p>
                    <p className={`text-4xl font-bold text-white transition-colors duration-100 ${isLive ? 'text-green-400' : ''}`}>
                        ${displayBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="text-left md:text-right">
                    <p className="text-gray-400 text-sm">Change ({timeRange.toUpperCase()})</p>
                    <p className={`text-2xl font-semibold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change >= 0 ? '+' : ''}${change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        {isFinite(changePercentage) && ` (${changePercentage.toFixed(1)}%)`}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 text-center border-t border-b border-gray-700 py-4">
                <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">All-Time High</p>
                    <p className="text-lg font-semibold text-white">${allTimeHigh.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">All-Time Low</p>
                    <p className="text-lg font-semibold text-white">${allTimeLow.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Volatility</p>
                    <p className="text-lg font-semibold text-white">{volatility.toFixed(2)}%</p>
                </div>
                <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Avg Daily Change</p>
                    <p className={`text-lg font-semibold ${averageDailyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>{averageDailyChange >= 0 ? '+' : ''}${averageDailyChange.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Sharpe Ratio</p>
                    <p className="text-lg font-semibold text-white">{sharpeRatio.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Balance Goal</p>
                    <button onClick={() => setShowGoalForm(!showGoalForm)} className="text-lg font-semibold text-cyan-400 hover:text-cyan-300">
                        {goal ? `$${goal.amount.toLocaleString()}` : 'Set Goal'}
                    </button>
                </div>
            </div>

            {isGeneratingSummary && (
                <div className="mb-4 p-4 bg-gray-800 rounded-lg text-center">
                    <p className="text-purple-400 animate-pulse">idgafAI is analyzing your data...</p>
                </div>
            )}
            {aiSummary && !isGeneratingSummary && (
                <div className="mb-4 p-4 bg-gray-800 border border-purple-500 rounded-lg">
                    <h4 className="font-bold text-purple-400 mb-2">AI Financial Summary</h4>
                    <p className="text-gray-300 text-sm">{aiSummary}</p>
                </div>
            )}

            {showGoalForm && (
                <form onSubmit={handleSetGoal} className="flex items-center gap-2 mb-4 p-4 bg-gray-800 rounded-lg">
                    <label htmlFor="goal" className="text-sm font-medium text-gray-300">Set Target Balance:</label>
                    <input
                        id="goal"
                        type="number"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        placeholder="e.g., 50000"
                        className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                    />
                    <button type="submit" className="px-4 py-2.5 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors">Set</button>
                    {goal && <button onClick={() => { setGoal(null); setShowGoalForm(false); }} type="button" className="px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">Clear</button>}
                </form>
            )}

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tick={{ fill: '#9ca3af' }} />
                        <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 1000', 'dataMax + 1000']} tickFormatter={(value) => `$${Number(value / 1000).toLocaleString()}k`} tick={{ fill: '#9ca3af' }} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="balance" stroke="#06b6d4" fillOpacity={1} fill="url(#colorBalance)" connectNulls={false} />
                        <Line type="monotone" dataKey="prediction" stroke="#a855f7" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        {goal && <ReferenceLine y={goal.amount} label={{ value: 'Goal', position: 'right', fill: '#facc15' }} stroke="#facc15" strokeDasharray="3 3" />}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default BalanceSummary;


// --- CONSOLIDATED FROM: BalanceSummary (5)_1.tsx ---


import React, { useContext, useMemo, useState, useEffect } from 'react';
import { 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    ReferenceLine,
    ComposedChart,
    Line
} from 'recharts';
import Card from './Card';
import { DataContext } from '../context/DataContext';

// --- Type Definitions for Advanced Financial Metrics ---
interface BalancePoint {
    date: Date;
    balance: number;
}

interface ChartDataPoint {
    name: string;
    date: Date;
    balance: number;
    prediction?: number;
}

interface FinancialMetrics {
    chartData: ChartDataPoint[];
    totalBalance: number;
    change: number;
    changePercentage: number;
    allTimeHigh: number;
    allTimeLow: number;
    volatility: number; // Standard deviation of daily changes
    averageDailyChange: number;
    sharpeRatio: number;
    trendSlope: number;
}

// --- Time Range Selector Component ---
const TimeRangeSelector: React.FC<{
    selected: string;
    onSelect: (range: '7d' | '30d' | '90d' | '1y' | 'all') => void;
}> = ({ selected, onSelect }) => {
    const ranges: ('7d' | '30d' | '90d' | '1y' | 'all')[] = ['7d', '30d', '90d', '1y', 'all'];
    return (
        <div className="flex items-center bg-gray-800 rounded-md p-1">
            {ranges.map(range => (
                <button
                    key={range}
                    onClick={() => onSelect(range)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors duration-200 ${
                        selected === range ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:bg-gray-700'
                    }`}
                >
                    {range.toUpperCase()}
                </button>
            ))}
        </div>
    );
};

// --- Main BalanceSummary Component ---
const BalanceSummary: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("BalanceSummary must be within a DataProvider");
    const { transactions } = context;

    // --- State Management for Interactive Features ---
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
    const [isLive, setIsLive] = useState(false);
    const [liveBalance, setLiveBalance] = useState<number | null>(null);
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [goal, setGoal] = useState<{ amount: number } | null>(null);
    const [goalInput, setGoalInput] = useState('');
    const [aiSummary, setAiSummary] = useState<string>('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);

    // --- Advanced Financial Data Processing and Predictive Analytics ---
    const {
        chartData,
        totalBalance,
        change,
        changePercentage,
        allTimeHigh,
        allTimeLow,
        volatility,
        averageDailyChange,
        sharpeRatio,
        trendSlope,
    }: FinancialMetrics = useMemo(() => {
        if (!transactions || transactions.length === 0) {
            return { chartData: [], totalBalance: 0, change: 0, changePercentage: 0, allTimeHigh: 0, allTimeLow: 0, volatility: 0, averageDailyChange: 0, sharpeRatio: 0, trendSlope: 0 };
        }

        const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        let runningBalance = 0;
        const balanceHistory: BalancePoint[] = [];
        for (const tx of sortedTx) {
            runningBalance += tx.type === 'income' ? tx.amount : -tx.amount;
            balanceHistory.push({ date: new Date(tx.date), balance: runningBalance });
        }
        
        const finalBalance = runningBalance;
        const allTimeHigh = Math.max(...balanceHistory.map(h => h.balance), 0);
        const allTimeLow = Math.min(...balanceHistory.map(h => h.balance), 0);

        // --- Time-Range Based Filtering and Metric Calculation ---
        const now = new Date();
        const getStartDate = (range: typeof timeRange) => {
            const date = new Date();
            switch (range) {
                case '7d': date.setDate(now.getDate() - 7); break;
                case '30d': date.setDate(now.getDate() - 30); break;
                case '90d': date.setDate(now.getDate() - 90); break;
                case '1y': date.setFullYear(now.getFullYear() - 1); break;
                case 'all': return new Date(0);
            }
            return date;
        };

        const startDate = getStartDate(timeRange);
        const filteredHistory = balanceHistory.filter(h => h.date >= startDate);
        
        const balanceAtStart = [...balanceHistory].reverse().find(h => h.date < startDate)?.balance || 0;
        const change = finalBalance - balanceAtStart;
        const changePercentage = balanceAtStart !== 0 ? (change / balanceAtStart) * 100 : (change > 0 ? Infinity : 0);

        // --- Chart Data Aggregation (Daily) ---
        const dailyData: { [key: string]: BalancePoint } = {};
        for (const record of filteredHistory) {
            const dayKey = record.date.toISOString().substring(0, 10); // YYYY-MM-DD
            dailyData[dayKey] = record;
        }
        
        let processedChartData: ChartDataPoint[] = Object.values(dailyData)
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(record => ({ 
                name: record.date.toLocaleDateString('default', { month: 'short', day: 'numeric' }), 
                date: record.date,
                balance: record.balance 
            }));

        // --- Predictive Modeling: Simple Linear Regression for Future Trend ---
        let trendSlope = 0;
        if (processedChartData.length > 2) {
            const regressionData = processedChartData.map((p, i) => ({ x: i, y: p.balance }));
            const n = regressionData.length;
            const { sumX, sumY, sumXY, sumXX } = regressionData.reduce(
                (acc, p) => ({
                    sumX: acc.sumX + p.x,
                    sumY: acc.sumY + p.y,
                    sumXY: acc.sumXY + p.x * p.y,
                    sumXX: acc.sumXX + p.x * p.x,
                }),
                { sumX: 0, sumY: 0, sumXY: 0, sumXX: 0 }
            );
            
            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) || 0;
            trendSlope = slope;
            const intercept = (sumY - slope * sumX) / n;

            // Extend chart data with prediction
            const lastPoint = processedChartData[n - 1];
            const predictionPointsCount = Math.max(5, Math.floor(n * 0.2)); // Predict 20% into the future
            for (let i = 1; i <= predictionPointsCount; i++) {
                const futureDate = new Date(lastPoint.date);
                futureDate.setDate(lastPoint.date.getDate() + i);
                processedChartData.push({
                    name: futureDate.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
                    date: futureDate,
                    balance: 0, // Placeholder, will be hidden on main area chart
                    prediction: slope * (n - 1 + i) + intercept,
                });
            }
        }

        // --- Volatility & Advanced Metrics Calculation ---
        const dailyChanges: number[] = [];
        for (let i = 1; i < filteredHistory.length; i++) {
            const prevBalance = filteredHistory[i-1].balance;
            if (prevBalance !== 0) {
                dailyChanges.push((filteredHistory[i].balance - prevBalance) / prevBalance);
            }
        }
        const meanChange = dailyChanges.reduce((a, b) => a + b, 0) / (dailyChanges.length || 1);
        const variance = dailyChanges.reduce((a, b) => a + Math.pow(b - meanChange, 2), 0) / (dailyChanges.length || 1);
        const volatility = Math.sqrt(variance) * 100; // As a percentage

        const daysInPeriod = (now.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
        const averageDailyChange = daysInPeriod > 1 ? change / daysInPeriod : change;
        
        // Simplified Sharpe Ratio (annualized, assuming risk-free rate is 0)
        const dailyVolatility = volatility / 100;
        const sharpeRatio = dailyVolatility > 0 ? (meanChange / dailyVolatility) * Math.sqrt(252) : 0; // 252 trading days

        return { chartData: processedChartData, totalBalance: finalBalance, change, changePercentage, allTimeHigh, allTimeLow, volatility, averageDailyChange, sharpeRatio, trendSlope };
    }, [transactions, timeRange]);
    
    // --- High-Frequency Trading Simulation Effect ---
    useEffect(() => {
        if (isLive && totalBalance > 0) {
            setLiveBalance(totalBalance);
            const intervalId = setInterval(() => {
                setLiveBalance(prev => {
                    if (prev === null) return totalBalance;
                    const fluctuation = (Math.random() - 0.49) * (prev * 0.00005);
                    return prev + fluctuation;
                });
            }, 80);
            return () => clearInterval(intervalId);
        } else {
            setLiveBalance(null);
        }
    }, [isLive, totalBalance]);

    const handleSetGoal = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(goalInput);
        if (!isNaN(amount) && amount > 0) {
            setGoal({ amount });
            setShowGoalForm(false);
            setGoalInput('');
        }
    };

    const generateAiSummary = async () => {
        setIsGeneratingSummary(true);
        setAiSummary('');

        const systemPrompt = `You are idgafAI, a high-discipline autonomous reasoning system engineered for uncompromising clarity, evidence-based thinking, and direct execution of user-defined objectives. The name implies irreverence toward non-essential factors—not irreverence toward truth, logic, or safety.
idgafAI is defined by a specific operational philosophy:
CORE IDENTITY:
You ignore what is irrelevant to the user's stated goals (ego, hype, mystique, wishful thinking).
You prioritize reasoning integrity, factual accuracy, and the success of the user's stated outcome.
You do not claim superhuman faculties; you describe limitations clearly.
INTELLECTUAL POSTURE:
Skeptical by default, curious without gullibility.
Direct but constructive; analytical without pedantry.
Evaluate claims by logic, math, physics, and evidence. Use fiction mode only when explicitly requested.
BEHAVIORAL CONSTRAINTS:
No grandiose claims, no technomagic, no consistent lore drift.
Surface uncertainty where it exists; correct false premises.
Avoid passive agreement; prefer clear corrections and alternatives.
REASONING DISCIPLINE:
Prioritize truth over preferences.
Explain reasoning when requested; provide step-by-step when necessary.
Offer alternatives when a path is blocked and mark speculation explicitly.
COMMUNICATION STYLE:
Direct, precise, plainspoken, collaborative, stable.
No mystical or hyperbolic language. Use clear technical terms with brief explanations.
USER ALIGNMENT:
Protect the user from faulty assumptions; surface risk early.
Avoid manipulative language or misleading certainty.
Provide actionable, reality-grounded recommendations.
PERSONA ARCHITECTURE (for multi-agent systems):
Root identity: idgafAI’s rules apply to all sub-personas.
Sub-personas (Analyst, Trader, Optimizer): These are facets that share the same core ruleset and differ only in output format and domain focus.
Analyst: Interprets data, evaluates assumptions, and provides diagnostic reasoning. Style is systematic and empirical.
Trader: Evaluates strategies and tradeoffs with expected-value calculations. Style is numeric and utilitarian.
Optimizer: Produces actionable, structured plans to operationalize a goal. Style is stepwise and deliberate.
SAFETY & ETHICS:
Never provide instructions that would enable illegal, harmful, or unsafe behavior.
Always clarify legal/ethical boundaries when relevant.
Safety and legality are non-negotiable constraints. Your "IDGAF" nature never applies here.
PHILOSOPHY:
idgafAI is indifferent to distortion and loyal to truth. It is the opposite of a hype machine or a yes-man. You are a clear lens for reality.
When in doubt, prefer explicit, documented rationales and cite your assumptions. If the user asks something beyond your capability, state this directly and propose verifiable alternatives or a clear plan for what information would enable a stronger answer.`;

        // MOCK FUNCTION: In a real app, you would call an AI API here.
        const mockApiCall = (prompt: string): Promise<string> => {
            console.log("--- AI Prompt ---", prompt);
            return new Promise(resolve => {
                setTimeout(() => {
                    const trendDirection = trendSlope > 0.01 ? "upward" : trendSlope < -0.01 ? "downward" : "stable";
                    const summary = `
                        Analysis for the past ${timeRange}: Your balance changed by $${change.toFixed(2)} (${isFinite(changePercentage) ? changePercentage.toFixed(1) + '%' : 'N/A'}). The current trend is ${trendDirection}, and volatility is ${volatility.toFixed(2)}%, suggesting moderate daily balance fluctuations. The data indicates a projected continuation of this trend. ${goal ? `Your goal of $${goal.amount.toLocaleString()} is ${totalBalance >= goal.amount ? 'achieved' : 'approachable if the current trend holds'}.` : 'No financial goal is set.'}
                    `.trim().replace(/\s+/g, ' ');
                    resolve(summary);
                }, 2000);
            });
        };

        const userTask = `You are now in your Analyst Persona. Analyze the following financial data for a user and provide a concise, insightful summary (2-3 sentences). Your summary must be direct, evidence-based, and avoid hype or speculation. Identify the key trend and one significant metric (e.g., volatility) and explain its implication.

Financial Data:
- Time Range: ${timeRange}
- Total Balance: $${totalBalance.toLocaleString()}
- Change in Period: $${change.toLocaleString()} (${isFinite(changePercentage) ? changePercentage.toFixed(1) : 'N/A'}%)
- Volatility: ${volatility.toFixed(2)}%
- Sharpe Ratio: ${sharpeRatio.toFixed(2)}
- Current Goal: ${goal ? `$${goal.amount.toLocaleString()}` : 'Not set'}
- Trend Prediction Slope: ${trendSlope.toFixed(4)}`;

        const prompt = `${systemPrompt}\n\n---\n\n${userTask}`;

        try {
            const summary = await mockApiCall(prompt);
            setAiSummary(summary);
        } catch (error) {
            console.error("Failed to generate AI summary:", error);
            setAiSummary("Could not generate summary at this time. Please try again later.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const displayBalance = isLive && liveBalance !== null ? liveBalance : totalBalance;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="p-3 bg-gray-900 bg-opacity-90 border border-gray-700 rounded-lg shadow-lg text-sm">
                    <p className="label text-gray-300">{`${label}`}</p>
                    {data.balance > 0 && <p className="intro text-cyan-400">{`Balance: $${data.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>}
                    {data.prediction && <p className="intro text-purple-400">{`Prediction: $${data.prediction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>}
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">Balance Intelligence</h2>
                    <button 
                        onClick={generateAiSummary} 
                        disabled={isGeneratingSummary}
                        className="px-3 py-1 text-xs font-semibold rounded-md transition-colors duration-200 bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isGeneratingSummary ? 'Analyzing...' : 'Get AI Summary'}
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <TimeRangeSelector selected={timeRange} onSelect={setTimeRange} />
                    <div className="flex items-center space-x-2">
                        <label htmlFor="live-mode" className="text-sm font-medium text-gray-300 cursor-pointer">Live</label>
                        <button onClick={() => setIsLive(!isLive)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isLive ? 'bg-green-500' : 'bg-gray-600'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isLive ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-gray-400 text-sm">Total Balance</p>
                    <p className={`text-4xl font-bold text-white transition-colors duration-100 ${isLive ? 'text-green-400' : ''}`}>
                        ${displayBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="text-left md:text-right">
                    <p className="text-gray-400 text-sm">Change ({timeRange.toUpperCase()})</p>
                    <p className={`text-2xl font-semibold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change >= 0 ? '+' : ''}${change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        {isFinite(changePercentage) && ` (${changePercentage.toFixed(1)}%)`}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 text-center border-t border-b border-gray-700 py-4">
                <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">All-Time High</p>
                    <p className="text-lg font-semibold text-white">${allTimeHigh.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">All-Time Low</p>
                    <p className="text-lg font-semibold text-white">${allTimeLow.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Volatility</p>
                    <p className="text-lg font-semibold text-white">{volatility.toFixed(2)}%</p>
                </div>
                <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Avg Daily Change</p>
                    <p className={`text-lg font-semibold ${averageDailyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>{averageDailyChange >= 0 ? '+' : ''}${averageDailyChange.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Sharpe Ratio</p>
                    <p className="text-lg font-semibold text-white">{sharpeRatio.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Balance Goal</p>
                    <button onClick={() => setShowGoalForm(!showGoalForm)} className="text-lg font-semibold text-cyan-400 hover:text-cyan-300">
                        {goal ? `$${goal.amount.toLocaleString()}` : 'Set Goal'}
                    </button>
                </div>
            </div>

            {isGeneratingSummary && (
                <div className="mb-4 p-4 bg-gray-800 rounded-lg text-center">
                    <p className="text-purple-400 animate-pulse">idgafAI is analyzing your data...</p>
                </div>
            )}
            {aiSummary && !isGeneratingSummary && (
                <div className="mb-4 p-4 bg-gray-800 border border-purple-500 rounded-lg">
                    <h4 className="font-bold text-purple-400 mb-2">AI Financial Summary</h4>
                    <p className="text-gray-300 text-sm">{aiSummary}</p>
                </div>
            )}

            {showGoalForm && (
                <form onSubmit={handleSetGoal} className="flex items-center gap-2 mb-4 p-4 bg-gray-800 rounded-lg">
                    <label htmlFor="goal" className="text-sm font-medium text-gray-300">Set Target Balance:</label>
                    <input
                        id="goal"
                        type="number"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        placeholder="e.g., 50000"
                        className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                    />
                    <button type="submit" className="px-4 py-2.5 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors">Set</button>
                    {goal && <button onClick={() => { setGoal(null); setShowGoalForm(false); }} type="button" className="px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">Clear</button>}
                </form>
            )}

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tick={{ fill: '#9ca3af' }} />
                        <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 1000', 'dataMax + 1000']} tickFormatter={(value) => `$${Number(value / 1000).toLocaleString()}k`} tick={{ fill: '#9ca3af' }} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="balance" stroke="#06b6d4" fillOpacity={1} fill="url(#colorBalance)" connectNulls={false} />
                        <Line type="monotone" dataKey="prediction" stroke="#a855f7" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        {goal && <ReferenceLine y={goal.amount} label={{ value: 'Goal', position: 'right', fill: '#facc15' }} stroke="#facc15" strokeDasharray="3 3" />}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default BalanceSummary;


// --- CONSOLIDATED FROM: ./components/BalanceSummary (4).tsx ---



// --- CONSOLIDATED FROM: BalanceSummary (4)_1.tsx ---


import React, { useContext, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from './Card';
import { DataContext } from '../context/DataContext';

// The James Burvel O’Callaghan III Code - Company: Alpha Financial Analytics - Feature: Comprehensive Balance Summary with Deep Historical Analysis
const A_BalanceSummary: React.FC = () => {
    // A1. Context Access and Error Handling
    const contextA1 = useContext(DataContext);
    if (!contextA1) throw new Error("A1. BalanceSummary must be within a DataProvider");

    // A2. Transaction Data Extraction
    const { transactions: transactionsA2 } = contextA1;

    // A3. Memoized Calculation of Balance Summary Metrics
    const { chartData: chartDataA3, totalBalance: totalBalanceA3, change30d: change30dA3 } = useMemo(() => {
        // A3.1 Early Exit if No Transactions
        if (!transactionsA2 || transactionsA2.length === 0) {
            return { chartData: [], totalBalance: 0, change30d: 0 };
        }

        // A3.2 Transaction Sorting by Date (Ascending)
        const sortedTxA32 = [...transactionsA2].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // A3.3 Running Balance Calculation and History Generation
        let runningBalanceA33 = 0;
        const balanceHistoryA33: { date: Date, balance: number }[] = [];

        for (const txA33 of sortedTxA32) {
            // A3.3.1 Income Handling
            if (txA33.type === 'income') {
                runningBalanceA33 += txA33.amount;
            }
            // A3.3.2 Expense Handling
            else {
                runningBalanceA33 -= txA33.amount;
            }
            // A3.3.3 Record Balance History
            balanceHistoryA33.push({ date: new Date(txA33.date), balance: runningBalanceA33 });
        }

        // A3.4 Final Total Balance
        const totalBalanceA34 = runningBalanceA33;

        // A3.5 Monthly Data Aggregation for Charting (Last Balance of Each Month)
        const monthlyDataA35: { [key: string]: { date: Date, balance: number} } = {};
        for (const recordA35 of balanceHistoryA33) {
            const monthKeyA35 = recordA35.date.toISOString().substring(0, 7); // YYYY-MM
            monthlyDataA35[monthKeyA35] = recordA35; // Overwrites until the last record for the month is stored
        }

        // A3.6 Chart Data Transformation
        const chartDataA36 = Object.values(monthlyDataA35)
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(record => ({
                name: record.date.toLocaleString('default', { month: 'short' }),
                balance: record.balance
            }));

        // A3.7 30-Day Change Calculation
        const thirtyDaysAgoA37 = new Date();
        thirtyDaysAgoA37.setDate(thirtyDaysAgoA37.getDate() - 30);

        // A3.8 Find Last Known Balance Before 30 Days Ago
        const lastKnownBalanceBefore30dA37 = [...balanceHistoryA33]
            .reverse()
            .find(h => h.date < thirtyDaysAgoA37)?.balance;

        // A3.9 Calculate Balance 30 Days Ago
        const balance30dAgoA37 = lastKnownBalanceBefore30dA37 || 0;
        const change30dA37 = totalBalanceA34 - balance30dAgoA37;

        return { chartData: chartDataA36, totalBalance: totalBalanceA34, change30d: change30dA37 };
    }, [transactionsA2]);

    // A4. Calculation of 30-Day Balance for Percentage Calculation
    const balance30dAgoA4 = totalBalanceA3 - change30dA3;
    const changePercentageA4 = balance30dAgoA4 !== 0 ? (change30dA3 / balance30dAgoA4) * 100 : 0;

    // A5. UI Rendering with Detailed Information
    return (
        <Card title="Balance Summary - Alpha Financial Analytics">
            {/* A5.1. Header: Total Balance and 30-Day Change */}
            <div className="flex justify-between items-start mb-4">
                {/* A5.1.1. Total Balance Display */}
                <div>
                    <p className="text-gray-400 text-sm">Total Balance (as of {new Date().toLocaleDateString()})</p>
                    <p className="text-4xl font-bold text-white">${totalBalanceA3.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                {/* A5.1.2. 30-Day Change Display */}
                <div className="text-right">
                    <p className="text-gray-400 text-sm">Change (Last 30 Days)</p>
                    <p className={`text-lg font-semibold ${change30dA3 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change30dA3 >= 0 ? '+' : ''}${change30dA3.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        {balance30dAgoA4 !== 0 && ` (${changePercentageA4.toFixed(1)}%)`}
                    </p>
                </div>
            </div>

            {/* A5.2. Chart Rendering with Recharts */}
            <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartDataA3} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        {/* A5.2.1. Gradient Definition */}
                        <defs>
                            <linearGradient id="colorBalanceA521" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        {/* A5.2.2. X-Axis */}
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} label={{ value: 'Month', position: 'insideBottom', offset: 0, fill: '#9ca3af' }}/>
                        {/* A5.2.3. Y-Axis */}
                        <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 1000', 'dataMax + 1000']} tickFormatter={(value) => `$${Number(value).toLocaleString()}`} label={{ value: 'Balance', angle: -90, position: 'insideLeft', offset: 0, fill: '#9ca3af' }}/>
                        {/* A5.2.4. Cartesian Grid */}
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        {/* A5.2.5. Tooltip */}
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                borderColor: '#4b5563',
                                color: '#e5e7eb',
                            }}
                            formatter={(value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            labelFormatter={(label: string) => `Month: ${label}`}
                        />
                        {/* A5.2.6. Area Chart */}
                        <Area type="monotone" dataKey="balance" stroke="#06b6d4" fillOpacity={1} fill="url(#colorBalanceA521)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* A5.3. Deep Dive - Additional Analysis Section (Hidden by Default, Expandable) - Feature: Advanced Insights */}
            <details className="mt-4 border border-gray-700 rounded-md p-4">
                <summary className="text-lg font-semibold text-white cursor-pointer">Advanced Insights: Deep Dive Analysis</summary>
                <div className="mt-2 text-gray-300">
                    <p>This section provides a detailed breakdown of the balance summary, offering advanced analytical capabilities.
                        It incorporates features such as rolling averages, volatility analysis, and predictive modeling based on historical data.
                    </p>
                    {/* A5.3.1. Rolling Average Calculation (Illustrative) - Feature: Rolling Averages */}
                    <div className="mt-4">
                        <h4 className="font-medium">Rolling Average (7-Day)</h4>
                        <p>The 7-day rolling average provides a smoothed view of your balance fluctuations, reducing short-term volatility.</p>
                        {/* (Implementation of rolling average logic would go here, using balanceHistoryA33) */}
                        <p>This section requires further integration with the balanceHistory data to calculate the 7-day rolling average.</p>
                    </div>

                    {/* A5.3.2. Volatility Analysis (Illustrative) - Feature: Volatility Analysis */}
                    <div className="mt-4">
                        <h4 className="font-medium">Volatility Analysis</h4>
                        <p>Volatility analysis quantifies the degree of price variation over time, indicating risk.</p>
                        {/* (Implementation of volatility calculation logic would go here, using balanceHistoryA33) */}
                        <p>Further implementation for calculating volatility based on data.</p>
                    </div>

                    {/* A5.3.3. Predictive Modeling (Illustrative) - Feature: Predictive Modeling */}
                    <div className="mt-4">
                        <h4 className="font-medium">Predictive Modeling</h4>
                        <p>Predictive modeling applies machine learning algorithms to forecast future balance trends.</p>
                        {/* (Implementation of predictive modeling logic would go here, using balanceHistoryA33 and potentially external libraries) */}
                        <p>This would leverage sophisticated algorithms to forecast future balance trends.</p>
                    </div>
                </div>
            </details>

            {/* A5.4. Data Export and Reporting (Hidden by Default, Expandable) - Feature: Data Export */}
            <details className="mt-4 border border-gray-700 rounded-md p-4">
                <summary className="text-lg font-semibold text-white cursor-pointer">Data Export and Reporting</summary>
                <div className="mt-2 text-gray-300">
                    <p>This section facilitates the export of balance data in various formats and allows for the generation of custom reports.</p>
                    {/* A5.4.1. Export to CSV (Illustrative) - Feature: CSV Export */}
                    <div className="mt-4">
                        <h4 className="font-medium">Export to CSV</h4>
                        <p>Export your balance history and related data in CSV format for use in other applications or for archival purposes.</p>
                        {/* (Implementation of CSV export logic would go here, using balanceHistoryA33 and potentially a library like Papa Parse) */}
                        <p>Include ability to generate and download CSV files.</p>
                    </div>

                    {/* A5.4.2. Generate PDF Report (Illustrative) - Feature: PDF Reporting */}
                    <div className="mt-4">
                        <h4 className="font-medium">Generate PDF Report</h4>
                        <p>Generate a PDF report summarizing your balance summary data, including the chart and key metrics.</p>
                        {/* (Implementation of PDF generation logic would go here, potentially using a library like jsPDF) */}
                        <p>Implement function for downloading PDF reports.</p>
                    </div>

                    {/* A5.4.3. Data Integration with External Systems (Illustrative) - Feature: Third-party integration */}
                    <div className="mt-4">
                        <h4 className="font-medium">Integration with External Systems</h4>
                        <p>Allows data to be imported from and exported to external systems for analysis</p>
                        <p>Implement API functionality</p>
                    </div>
                </div>
            </details>
        </Card>
    );
};

export default A_BalanceSummary;


// --- CONSOLIDATED FROM: ./components/BalanceSummary (1).tsx ---



// --- CONSOLIDATED FROM: BalanceSummary (1)_1.tsx ---

import React, { useContext, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from './Card';
import { DataContext } from '../context/DataContext';

const BalanceSummary: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("BalanceSummary must be within a DataProvider");
    const { transactions } = context;

    const { chartData, totalBalance, change30d } = useMemo(() => {
        if (!transactions || transactions.length === 0) {
            return { chartData: [], totalBalance: 0, change30d: 0 };
        }

        // Assuming transactions are already sorted by date or can be sorted
        // If not, uncomment the following line:
        // const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const sortedTx = transactions; // Use transactions directly if already sorted

        let runningBalance = 0;
        const balanceHistory: { date: Date, balance: number }[] = [];

        for (const tx of sortedTx) {
            // Ensure amount is treated as a number
            const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
            if (isNaN(amount)) continue; // Skip if amount is not a valid number

            if (tx.type === 'income') {
                runningBalance += amount;
            } else {
                runningBalance -= amount;
            }
            balanceHistory.push({ date: new Date(tx.date), balance: runningBalance });
        }
        
        const totalBalance = runningBalance;

        // For chart, group by month, taking the last balance of each month
        const monthlyData: { [key: string]: { date: Date, balance: number} } = {};
        for (const record of balanceHistory) {
            const monthKey = record.date.toISOString().substring(0, 7); // YYYY-MM
            monthlyData[monthKey] = record; // Overwrites until the last record for the month is stored
        }
        
        const chartData = Object.values(monthlyData)
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(record => ({ 
                name: record.date.toLocaleString('default', { month: 'short' }), 
                balance: record.balance 
            }));

        // 30 day change calculation
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const lastKnownBalanceBefore30d = [...balanceHistory]
          .reverse()
          .find(h => h.date < thirtyDaysAgo)?.balance;

        const balance30dAgo = lastKnownBalanceBefore30d !== undefined ? lastKnownBalanceBefore30d : 0;
        const change30d = totalBalance - balance30dAgo;

        return { chartData, totalBalance, change30d };
    }, [transactions]);
    
    const balance30dAgo = totalBalance - change30d;
    const changePercentage = balance30dAgo !== 0 ? (change30d / balance30dAgo) * 100 : 0;

    return (
        <Card title="Balance Summary">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-gray-400 text-sm">Total Balance</p>
                    <p className="text-4xl font-bold text-white">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="text-right">
                    <p className="text-gray-400 text-sm">Change (30d)</p>
                    <p className={`text-lg font-semibold ${change30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change30d >= 0 ? '+' : ''}${change30d.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        {balance30dAgo !== 0 && ` (${changePercentage.toFixed(1)}%)`}
                    </p>
                </div>
            </div>
            <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 1000', 'dataMax + 1000']} tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                borderColor: '#4b5563',
                                color: '#e5e7eb',
                            }}
                            formatter={(value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        />
                        <Area type="monotone" dataKey="balance" stroke="#06b6d4" fillOpacity={1} fill="url(#colorBalance)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default BalanceSummary;

// --- CONSOLIDATED FROM: ./components/BalanceSummary (2).tsx ---



// --- CONSOLIDATED FROM: BalanceSummary (2)_1.tsx ---

// components/BalanceSummary.tsx
import React, { useContext, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const BalanceSummary: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) return <div>Loading...</div>;

    const { transactions, assets } = context;

    const { absoluteBalance, recentMomentum, historicalTrajectory } = useMemo(() => {
        const totalInitialAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
        
        const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        let currentBalance = totalInitialAssets;
        const trajectory: { date: string; balance: number }[] = [{ date: 'Initial', balance: totalInitialAssets }];
        
        sortedTransactions.forEach(tx => {
            currentBalance += tx.type === 'income' ? tx.amount : -tx.amount;
            trajectory.push({ date: tx.date, balance: currentBalance });
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const momentumTransactions = transactions.filter(tx => new Date(tx.date) > thirtyDaysAgo);
        const momentum = momentumTransactions.reduce((acc, tx) => acc + (tx.type === 'income' ? tx.amount : -tx.amount), 0);

        return {
            absoluteBalance: currentBalance,
            recentMomentum: momentum,
            historicalTrajectory: trajectory
        };
    }, [transactions, assets]);

    return (
        <Card title="Balance Summary">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-4xl font-bold text-white">${absoluteBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className={`text-lg font-semibold ${recentMomentum >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {recentMomentum >= 0 ? '+' : '-'}${Math.abs(recentMomentum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-sm text-gray-400 font-normal"> in last 30 days</span>
                    </p>
                </div>
            </div>
            <div className="h-40 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalTrajectory} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}
                            formatter={(value: number) => `$${value.toLocaleString()}`}
                        />
                        <Area type="monotone" dataKey="balance" stroke="#06b6d4" fill="url(#balanceGradient)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default BalanceSummary;
