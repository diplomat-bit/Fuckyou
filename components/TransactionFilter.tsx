"use client";

import React, { useState } from "react";

/* =======================
   Types
======================= */

export type TransactionFilters = {
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
};

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
};

interface TransactionFilterProps {
  filters: TransactionFilters;
  onApplyFilters: (filters: TransactionFilters) => void;
  resetFilters: () => void;
  logAction: (
    type: string,
    message: string,
    severity: "low" | "medium" | "high"
  ) => void;
}

/* =======================
   Constants
======================= */

const QUANTUM_CATEGORIES = [
  "Food",
  "Travel",
  "Subscriptions",
  "Payroll",
  "Infrastructure",
  "Taxes",
  "Misc",
];

/* =======================
   Component
======================= */

const TransactionFilter: React.FC<TransactionFilterProps> = ({
  filters,
  onApplyFilters,
  resetFilters,
  logAction,
}) => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isMfaVerified, setIsMfaVerified] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);

  /* =======================
     AI Handler
  ======================= */

  const handleAiCommand = async () => {
    if (!userInput.trim()) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: userInput,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setUserInput("");
    setIsAiLoading(true);

    logAction("AI_QUERY", `User asked: "${userInput}"`, "low");

    try {
      const prompt = `
You are the Quantum Financial AI Core.

Current Filter State:
${JSON.stringify(filters, null, 2)}

Available Categories:
${QUANTUM_CATEGORIES.join(", ")}

User Instruction:
"${userInput}"

Respond ONLY in valid JSON:
{
  "response": string,
  "update": object | null,
  "action": "EXPORT" | "MFA_TRIGGER" | "RESET" | null
}

Tone: Elite, Secure, Professional.
Use "Quantum Financial".
`;

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          mfaVerified: isMfaVerified,
        }),
      });

      if (!res.ok) {
        throw new Error(`AI backend error: ${res.status}`);
      }

      const data = await res.json();
      const rawText: string = data.text;

      let aiData: {
        response: string;
        update: TransactionFilters | null;
        action: string | null;
      };

      try {
        aiData = JSON.parse(rawText);
      } catch {
        aiData = {
          response: rawText,
          update: null,
          action: null,
        };
      }

      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiData.response,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      if (aiData.update) {
        const newFilters = { ...filters, ...aiData.update };
        onApplyFilters(newFilters);

        logAction(
          "AI_FILTER_UPDATE",
          `AI updated filters: ${JSON.stringify(aiData.update)}`,
          "medium"
        );
      }

      if (aiData.action === "MFA_TRIGGER") {
        setShowMfaModal(true);
      }

      if (aiData.action === "RESET") {
        resetFilters();
      }
    } catch (err) {
      console.error("AI Core Error:", err);

      setChatHistory((prev) => [
        ...prev,
        {
          role: "system",
          content:
            "Neural link interrupted. Quantum AI Core is temporarily unavailable.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      logAction("AI_FAILURE", "AI backend request failed", "high");
    } finally {
      setIsAiLoading(false);
    }
  };

  /* =======================
     Render
  ======================= */

  return (
    <div className="transaction-filter">
      <h2>Quantum Transaction Filter</h2>

      {/* Chat Window */}
      <div className="chat-window">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            <strong>{msg.role.toUpperCase()}:</strong> {msg.content}
            <div className="timestamp">{msg.timestamp}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input">
        <input
          type="text"
          value={userInput}
          placeholder="Ask Quantum AI to filter transactions…"
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAiCommand()}
          disabled={isAiLoading}
        />
        <button onClick={handleAiCommand} disabled={isAiLoading}>
          {isAiLoading ? "Processing…" : "Send"}
        </button>
      </div>

      {/* MFA Modal */}
      {showMfaModal && (
        <div className="mfa-modal">
          <p>MFA verification required to proceed.</p>
          <button
            onClick={() => {
              setIsMfaVerified(true);
              setShowMfaModal(false);
              logAction("MFA_VERIFIED", "User completed MFA", "medium");
            }}
          >
            Verify MFA
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionFilter;


// --- CONSOLIDATED FROM: TransactionFilter (1).tsx ---


import React, { useState } from 'react';

interface TransactionFilterProps {
  onApplyFilters: (filters: TransactionFilters) => void;
  availableCategories?: string[];
}

export interface TransactionFilters {
  fromDate?: string; // YYYY-MM-DD
  toDate?: string;   // YYYY-MM-DD
  minAmount?: number;
  maxAmount?: number;
  category?: string;
}

const defaultCategories = [
  'All', 'ATM Fee', 'Advertising', 'Air Travel', 'Alcohol & Bars', 'Allowance',
  'Amusement', 'Arts', 'Auto & Transport', 'Auto Insurance', 'Auto Payment',
  'Baby Supplies', 'Babysitter & Day Care', 'Bank Fee', 'Bills & Utilities',
  'Bonus', 'Books', 'Books & Supplies', 'Business Services', 'Buy', 'Cash & ATM',
  'Charity', 'Check', 'Child Support', 'Clothing', 'Coffee Shops', 'Credit Card Payment',
  'Dentist', 'Deposit', 'Dividend & Cap Gains', 'Doctor', 'Education', 'Electronics & Software',
  'Entertainment', 'Eye Care', 'Fast Food', 'Federal Tax', 'Fees & Charges',
  'Finance Charge', 'Financial', 'Financial Advisor', 'Food & Dining', 'Furnishings',
  'Gas & Fuel', 'Gift', 'Gifts & Donations', 'Groceries', 'Gym', 'Hair',
  'Health & Fitness', 'Health Insurance', 'Hobbies', 'Home', 'Home Improvement',
  'Home Insurance', 'Home Phone', 'Home Services', 'Home Supplies', 'Hotel',
  'Income', 'Interest Income', 'Internet', 'Investments', 'Kids', 'Kids Activities',
  'Late Fee', 'Laundry', 'Lawn & Garden', 'Legal', 'Life Insurance', 'Loan Fees and Charges',
  'Loan Insurance', 'Loan Interest', 'Loan Payment', 'Loan Principal', 'Loans',
  'Local Tax', 'Low Balance', 'Mobile Phone', 'Mortgage & Rent', 'Movies & DVDs', 'Music',
  'Newspapers & Magazines', 'Office Supplies', 'Parking', 'Paycheck', 'Personal Care',
  'Pet Food & Supplies', 'Pet Grooming', 'Pets', 'Pharmacy', 'Printing', 'Property Tax',
  'Public Transportation', 'Reimbursement', 'Rental Car & Taxi', 'Restaurants', 'Sales Tax',
  'Sell', 'Services & Parts', 'Service Fee', 'Shipping', 'Shopping', 'Spa & Massage',
  'Sporting Goods', 'Sports', 'State Tax', 'Streaming Services', 'Student Loan', 'Taxes',
  'Television', 'Toys', 'Trade Commissions', 'Transfer', 'Transfer for Cash Spending',
  'Travel', 'Tuition', 'Uncategorized', 'Utilities', 'Vacation', 'Veterinary',
  'Internet / Broadband Charges'
];

const TransactionFilter: React.FC<TransactionFilterProps> = ({ onApplyFilters, availableCategories }) => {
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('All');

  const categoriesToDisplay = availableCategories && availableCategories.length > 0
    ? ['All', ...availableCategories.filter(c => c !== 'All')]
    : defaultCategories;

  const handleApplyFilters = () => {
    const filters: TransactionFilters = {
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      category: category !== 'All' ? category : undefined,
    };
    onApplyFilters(filters);
  };

  const handleResetFilters = () => {
    setFromDate('');
    setToDate('');
    setMinAmount('');
    setMaxAmount('');
    setCategory('All');
    onApplyFilters({});
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Filter Transactions</h3>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="fromDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>From Date:</label>
        <input
          type="date"
          id="fromDate"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="toDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>To Date:</label>
        <input
          type="date"
          id="toDate"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="minAmount" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Min Amount:</label>
        <input
          type="number"
          id="minAmount"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
          placeholder="e.g. 10.00"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="maxAmount" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Max Amount:</label>
        <input
          type="number"
          id="maxAmount"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
          placeholder="e.g. 100.00"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="category" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category:</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
        >
          {categoriesToDisplay.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleApplyFilters} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Apply Filters</button>
        <button onClick={handleResetFilters} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reset Filters</button>
      </div>
    </div>
  );
};

export default TransactionFilter;


// --- CONSOLIDATED FROM: TransactionFilter (2).tsx ---

import React, { useState } from 'react';

// --- Citibankdemobusinessinc.finance.transactionfilter ---

/**
 * @namespace Citibankdemobusinessinc.finance.transactionfilter
 * @description Manages filtering of financial transactions.
 */

/**
 * @interface TransactionFilters
 * @description Defines the structure for transaction filtering criteria.
 * @property {string} [fromDate] - The start date for filtering (YYYY-MM-DD).
 * @property {string} [toDate] - The end date for filtering (YYYY-MM-DD).
 * @property {number} [minAmount] - The minimum transaction amount.
 * @property {number} [maxAmount] - The maximum transaction amount.
 * @property {string} [category] - The transaction category to filter by.
 */
export interface TransactionFilters {
  fromDate?: string; // YYYY-MM-DD
  toDate?: string;   // YYYY-MM-DD
  minAmount?: number;
  maxAmount?: number;
  category?: string;
}

/**
 * @function generateDefaultCategories
 * @description Generates a default list of transaction categories.
 * @returns {string[]} An array of default category strings.
 */
const generateDefaultCategories = (): string[] => [
  'All', 'ATM Fee', 'Advertising', 'Air Travel', 'Alcohol & Bars', 'Allowance',
  'Amusement', 'Arts', 'Auto & Transport', 'Auto Insurance', 'Auto Payment',
  'Baby Supplies', 'Babysitter & Day Care', 'Bank Fee', 'Bills & Utilities',
  'Bonus', 'Books', 'Books & Supplies', 'Business Services', 'Buy', 'Cash & ATM',
  'Charity', 'Check', 'Child Support', 'Clothing', 'Coffee Shops', 'Credit Card Payment',
  'Dentist', 'Deposit', 'Dividend & Cap Gains', 'Doctor', 'Education', 'Electronics & Software',
  'Entertainment', 'Eye Care', 'Fast Food', 'Federal Tax', 'Fees & Charges',
  'Finance Charge', 'Financial', 'Financial Advisor', 'Food & Dining', 'Furnishings',
  'Gas & Fuel', 'Gift', 'Gifts & Donations', 'Groceries', 'Gym', 'Hair',
  'Health & Fitness', 'Health Insurance', 'Hobbies', 'Home', 'Home Improvement',
  'Home Insurance', 'Home Phone', 'Home Services', 'Home Supplies', 'Hotel',
  'Income', 'Interest Income', 'Internet', 'Investments', 'Kids', 'Kids Activities',
  'Late Fee', 'Laundry', 'Lawn & Garden', 'Legal', 'Life Insurance', 'Loan Fees and Charges',
  'Loan Insurance', 'Loan Interest', 'Loan Payment', 'Loan Principal', 'Loans',
  'Local Tax', 'Low Balance', 'Mobile Phone', 'Mortgage & Rent', 'Movies & DVDs', 'Music',
  'Newspapers & Magazines', 'Office Supplies', 'Parking', 'Paycheck', 'Personal Care',
  'Pet Food & Supplies', 'Pet Grooming', 'Pets', 'Pharmacy', 'Printing', 'Property Tax',
  'Public Transportation', 'Reimbursement', 'Rental Car & Taxi', 'Restaurants', 'Sales Tax',
  'Sell', 'Services & Parts', 'Service Fee', 'Shipping', 'Shopping', 'Spa & Massage',
  'Sporting Goods', 'Sports', 'State Tax', 'Streaming Services', 'Student Loan', 'Taxes',
  'Television', 'Toys', 'Trade Commissions', 'Transfer', 'Transfer for Cash Spending',
  'Travel', 'Tuition', 'Uncategorized', 'Utilities', 'Vacation', 'Veterinary',
  'Internet / Broadband Charges'
];

/**
 * @interface TransactionFilterProps
 * @description Props for the TransactionFilter component.
 * @property {function(filters: TransactionFilters): void} onApplyFilters - Callback function when filters are applied.
 * @property {string[]} [availableCategories] - Optional list of available categories.
 */
interface TransactionFilterProps {
  onApplyFilters: (filters: TransactionFilters) => void;
  availableCategories?: string[];
}

/**
 * @component TransactionFilter
 * @description A React component for filtering financial transactions.
 * @param {TransactionFilterProps} props - The component's props.
 * @returns {JSX.Element} The rendered TransactionFilter component.
 */
const TransactionFilter: React.FC<TransactionFilterProps> = ({ onApplyFilters, availableCategories }) => {
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('All');

  // Dynamically determine categories to display, falling back to defaults if none provided.
  const categoriesToDisplay = availableCategories && availableCategories.length > 0
    ? ['All', ...availableCategories.filter(c => c !== 'All')]
    : generateDefaultCategories();

  /**
   * @function handleApplyFilters
   * @description Gathers current filter states and calls the onApplyFilters callback.
   */
  const handleApplyFilters = () => {
    const filters: TransactionFilters = {
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      category: category !== 'All' ? category : undefined,
    };
    onApplyFilters(filters);
  };

  /**
   * @function handleResetFilters
   * @description Resets all filter states to their default values and calls onApplyFilters with an empty object.
   */
  const handleResetFilters = () => {
    setFromDate('');
    setToDate('');
    setMinAmount('');
    setMaxAmount('');
    setCategory('All');
    onApplyFilters({});
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Filter Transactions</h3>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="fromDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>From Date:</label>
        <input
          type="date"
          id="fromDate"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="toDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>To Date:</label>
        <input
          type="date"
          id="toDate"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="minAmount" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Min Amount:</label>
        <input
          type="number"
          id="minAmount"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
          placeholder="e.g. 10.00"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="maxAmount" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Max Amount:</label>
        <input
          type="number"
          id="maxAmount"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
          placeholder="e.g. 100.00"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="category" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category:</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
        >
          {categoriesToDisplay.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleApplyFilters} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Apply Filters</button>
        <button onClick={handleResetFilters} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reset Filters</button>
      </div>
    </div>
  );
};

export default TransactionFilter;
// --- End Citibankdemobusinessinc.finance.transactionfilter ---

// --- CONSOLIDATED FROM: TransactionFilter (2)_1.tsx ---

import React, { useState } from 'react';

// --- Citibankdemobusinessinc.finance.transactionfilter ---

/**
 * @namespace Citibankdemobusinessinc.finance.transactionfilter
 * @description Manages filtering of financial transactions.
 */

/**
 * @interface TransactionFilters
 * @description Defines the structure for transaction filtering criteria.
 * @property {string} [fromDate] - The start date for filtering (YYYY-MM-DD).
 * @property {string} [toDate] - The end date for filtering (YYYY-MM-DD).
 * @property {number} [minAmount] - The minimum transaction amount.
 * @property {number} [maxAmount] - The maximum transaction amount.
 * @property {string} [category] - The transaction category to filter by.
 */
export interface TransactionFilters {
  fromDate?: string; // YYYY-MM-DD
  toDate?: string;   // YYYY-MM-DD
  minAmount?: number;
  maxAmount?: number;
  category?: string;
}

/**
 * @function generateDefaultCategories
 * @description Generates a default list of transaction categories.
 * @returns {string[]} An array of default category strings.
 */
const generateDefaultCategories = (): string[] => [
  'All', 'ATM Fee', 'Advertising', 'Air Travel', 'Alcohol & Bars', 'Allowance',
  'Amusement', 'Arts', 'Auto & Transport', 'Auto Insurance', 'Auto Payment',
  'Baby Supplies', 'Babysitter & Day Care', 'Bank Fee', 'Bills & Utilities',
  'Bonus', 'Books', 'Books & Supplies', 'Business Services', 'Buy', 'Cash & ATM',
  'Charity', 'Check', 'Child Support', 'Clothing', 'Coffee Shops', 'Credit Card Payment',
  'Dentist', 'Deposit', 'Dividend & Cap Gains', 'Doctor', 'Education', 'Electronics & Software',
  'Entertainment', 'Eye Care', 'Fast Food', 'Federal Tax', 'Fees & Charges',
  'Finance Charge', 'Financial', 'Financial Advisor', 'Food & Dining', 'Furnishings',
  'Gas & Fuel', 'Gift', 'Gifts & Donations', 'Groceries', 'Gym', 'Hair',
  'Health & Fitness', 'Health Insurance', 'Hobbies', 'Home', 'Home Improvement',
  'Home Insurance', 'Home Phone', 'Home Services', 'Home Supplies', 'Hotel',
  'Income', 'Interest Income', 'Internet', 'Investments', 'Kids', 'Kids Activities',
  'Late Fee', 'Laundry', 'Lawn & Garden', 'Legal', 'Life Insurance', 'Loan Fees and Charges',
  'Loan Insurance', 'Loan Interest', 'Loan Payment', 'Loan Principal', 'Loans',
  'Local Tax', 'Low Balance', 'Mobile Phone', 'Mortgage & Rent', 'Movies & DVDs', 'Music',
  'Newspapers & Magazines', 'Office Supplies', 'Parking', 'Paycheck', 'Personal Care',
  'Pet Food & Supplies', 'Pet Grooming', 'Pets', 'Pharmacy', 'Printing', 'Property Tax',
  'Public Transportation', 'Reimbursement', 'Rental Car & Taxi', 'Restaurants', 'Sales Tax',
  'Sell', 'Services & Parts', 'Service Fee', 'Shipping', 'Shopping', 'Spa & Massage',
  'Sporting Goods', 'Sports', 'State Tax', 'Streaming Services', 'Student Loan', 'Taxes',
  'Television', 'Toys', 'Trade Commissions', 'Transfer', 'Transfer for Cash Spending',
  'Travel', 'Tuition', 'Uncategorized', 'Utilities', 'Vacation', 'Veterinary',
  'Internet / Broadband Charges'
];

/**
 * @interface TransactionFilterProps
 * @description Props for the TransactionFilter component.
 * @property {function(filters: TransactionFilters): void} onApplyFilters - Callback function when filters are applied.
 * @property {string[]} [availableCategories] - Optional list of available categories.
 */
interface TransactionFilterProps {
  onApplyFilters: (filters: TransactionFilters) => void;
  availableCategories?: string[];
}

/**
 * @component TransactionFilter
 * @description A React component for filtering financial transactions.
 * @param {TransactionFilterProps} props - The component's props.
 * @returns {JSX.Element} The rendered TransactionFilter component.
 */
const TransactionFilter: React.FC<TransactionFilterProps> = ({ onApplyFilters, availableCategories }) => {
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('All');

  // Dynamically determine categories to display, falling back to defaults if none provided.
  const categoriesToDisplay = availableCategories && availableCategories.length > 0
    ? ['All', ...availableCategories.filter(c => c !== 'All')]
    : generateDefaultCategories();

  /**
   * @function handleApplyFilters
   * @description Gathers current filter states and calls the onApplyFilters callback.
   */
  const handleApplyFilters = () => {
    const filters: TransactionFilters = {
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      category: category !== 'All' ? category : undefined,
    };
    onApplyFilters(filters);
  };

  /**
   * @function handleResetFilters
   * @description Resets all filter states to their default values and calls onApplyFilters with an empty object.
   */
  const handleResetFilters = () => {
    setFromDate('');
    setToDate('');
    setMinAmount('');
    setMaxAmount('');
    setCategory('All');
    onApplyFilters({});
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Filter Transactions</h3>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="fromDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>From Date:</label>
        <input
          type="date"
          id="fromDate"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="toDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>To Date:</label>
        <input
          type="date"
          id="toDate"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="minAmount" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Min Amount:</label>
        <input
          type="number"
          id="minAmount"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
          placeholder="e.g. 10.00"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="maxAmount" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Max Amount:</label>
        <input
          type="number"
          id="maxAmount"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
          placeholder="e.g. 100.00"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="category" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category:</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
        >
          {categoriesToDisplay.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleApplyFilters} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Apply Filters</button>
        <button onClick={handleResetFilters} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reset Filters</button>
      </div>
    </div>
  );
};

export default TransactionFilter;
// --- End Citibankdemobusinessinc.finance.transactionfilter ---

// --- CONSOLIDATED FROM: TransactionFilter_1.tsx ---

"use client";

import React, { useState } from "react";

/* =======================
   Types
======================= */

export type TransactionFilters = {
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
};

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
};

interface TransactionFilterProps {
  filters: TransactionFilters;
  onApplyFilters: (filters: TransactionFilters) => void;
  resetFilters: () => void;
  logAction: (
    type: string,
    message: string,
    severity: "low" | "medium" | "high"
  ) => void;
}

/* =======================
   Constants
======================= */

const QUANTUM_CATEGORIES = [
  "Food",
  "Travel",
  "Subscriptions",
  "Payroll",
  "Infrastructure",
  "Taxes",
  "Misc",
];

/* =======================
   Component
======================= */

const TransactionFilter: React.FC<TransactionFilterProps> = ({
  filters,
  onApplyFilters,
  resetFilters,
  logAction,
}) => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isMfaVerified, setIsMfaVerified] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);

  /* =======================
     AI Handler
  ======================= */

  const handleAiCommand = async () => {
    if (!userInput.trim()) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: userInput,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setUserInput("");
    setIsAiLoading(true);

    logAction("AI_QUERY", `User asked: "${userInput}"`, "low");

    try {
      const prompt = `
You are the Quantum Financial AI Core.

Current Filter State:
${JSON.stringify(filters, null, 2)}

Available Categories:
${QUANTUM_CATEGORIES.join(", ")}

User Instruction:
"${userInput}"

Respond ONLY in valid JSON:
{
  "response": string,
  "update": object | null,
  "action": "EXPORT" | "MFA_TRIGGER" | "RESET" | null
}

Tone: Elite, Secure, Professional.
Use "Quantum Financial".
`;

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          mfaVerified: isMfaVerified,
        }),
      });

      if (!res.ok) {
        throw new Error(`AI backend error: ${res.status}`);
      }

      const data = await res.json();
      const rawText: string = data.text;

      let aiData: {
        response: string;
        update: TransactionFilters | null;
        action: string | null;
      };

      try {
        aiData = JSON.parse(rawText);
      } catch {
        aiData = {
          response: rawText,
          update: null,
          action: null,
        };
      }

      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiData.response,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      if (aiData.update) {
        const newFilters = { ...filters, ...aiData.update };
        onApplyFilters(newFilters);

        logAction(
          "AI_FILTER_UPDATE",
          `AI updated filters: ${JSON.stringify(aiData.update)}`,
          "medium"
        );
      }

      if (aiData.action === "MFA_TRIGGER") {
        setShowMfaModal(true);
      }

      if (aiData.action === "RESET") {
        resetFilters();
      }
    } catch (err) {
      console.error("AI Core Error:", err);

      setChatHistory((prev) => [
        ...prev,
        {
          role: "system",
          content:
            "Neural link interrupted. Quantum AI Core is temporarily unavailable.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      logAction("AI_FAILURE", "AI backend request failed", "high");
    } finally {
      setIsAiLoading(false);
    }
  };

  /* =======================
     Render
  ======================= */

  return (
    <div className="transaction-filter">
      <h2>Quantum Transaction Filter</h2>

      {/* Chat Window */}
      <div className="chat-window">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            <strong>{msg.role.toUpperCase()}:</strong> {msg.content}
            <div className="timestamp">{msg.timestamp}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input">
        <input
          type="text"
          value={userInput}
          placeholder="Ask Quantum AI to filter transactions…"
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAiCommand()}
          disabled={isAiLoading}
        />
        <button onClick={handleAiCommand} disabled={isAiLoading}>
          {isAiLoading ? "Processing…" : "Send"}
        </button>
      </div>

      {/* MFA Modal */}
      {showMfaModal && (
        <div className="mfa-modal">
          <p>MFA verification required to proceed.</p>
          <button
            onClick={() => {
              setIsMfaVerified(true);
              setShowMfaModal(false);
              logAction("MFA_VERIFIED", "User completed MFA", "medium");
            }}
          >
            Verify MFA
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionFilter;
