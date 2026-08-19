import React from 'react';

export const Amount: React.FC<{ amount: number; currency: string; className?: string }> = ({ amount, currency, className }) => (
  <span className={className}>
    {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)}
  </span>
);

// --- CONSOLIDATED FROM: ./shared/Amount_2.tsx ---


import React from 'react';

export const Amount: React.FC<{ amount: number; currency: string; className?: string }> = ({ amount, currency, className }) => (
  <span className={className}>
    {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)}
  </span>
);


// --- CONSOLIDATED FROM: ./shared/Amount_1.tsx ---

import React from 'react';

export const Amount: React.FC<{ amount: number; currency: string; className?: string }> = ({ amount, currency, className }) => (
  <span className={className}>
    {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)}
  </span>
);

// --- CONSOLIDATED FROM: ./shared/Amount.tsx ---

import React from 'react';

interface AmountProps {
  amount: number;
  currency?: string;
  className?: string;
}

export const Amount: React.FC<AmountProps> = ({ amount, currency = 'USD', className }) => {
  const safeCurrency = (currency && currency.length === 3) ? currency.toUpperCase() : 'USD';

  try {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: safeCurrency,
    }).format(amount / 100);

    return <span className={className}>{formatted}</span>;
  } catch (e) {
    return <span className={className}>{safeCurrency} {(amount / 100).toFixed(2)}</span>;
  }
};

// --- CONSOLIDATED FROM: ./components/shared (1)/Amount.tsx ---

import React from 'react';

export const Amount: React.FC<{ amount: number; currency: string; className?: string }> = ({ amount, currency, className }) => (
  <span className={className}>
    {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)}
  </span>
);

// --- CONSOLIDATED FROM: ./components/shared/Amount.tsx ---

import React from 'react';

interface AmountProps {
  amount: number;
  currency?: string;
  className?: string;
}

export const Amount: React.FC<AmountProps> = ({ amount, currency = 'USD', className }) => {
  const safeCurrency = (currency && currency.length === 3) ? currency.toUpperCase() : 'USD';

  try {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: safeCurrency,
    }).format(amount / 100);

    return <span className={className}>{formatted}</span>;
  } catch (e) {
    return <span className={className}>{safeCurrency} {(amount / 100).toFixed(2)}</span>;
  }
};

// --- CONSOLIDATED FROM: ./components/shared (2)/Amount.tsx ---


import React from 'react';

export const Amount: React.FC<{ amount: number; currency: string; className?: string }> = ({ amount, currency, className }) => (
  <span className={className}>
    {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)}
  </span>
);
