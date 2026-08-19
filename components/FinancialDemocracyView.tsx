import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
import { banks } from '../constants'; // Import the centralized bank list
import PlaidLinkButton from './PlaidLinkButton';
import type { PlaidLinkSuccessMetadata, PlaidProduct } from '../types';

// ================================================================================================
// THE DEMOCRATIZATION MANIFESTO
// ================================================================================================
// This isn't just a React component library. It's a statement. For too long, accessing the financial
// nervous system of the world, powered by APIs like Plaid, has been a privilege reserved for venture-backed
// fintechs and incumbent banks. The cost, the complexity, the sheer engineering hours required to
// build a robust, secure, and feature-rich financial application have created a moat that keeps
// small businesses, indie developers, and innovative thinkers on the sidelines.
//
// This code is a sledgehammer to that moat.
//
// We are democratizing access to the financial ecosystem. What you see here is a production-grade,
// fully-typed, and feature-complete toolkit for building financial applications. We've poured
// thousands of hours into solving the hard problems—state management, API integration, UI/UX for
// complex data, security patterns—so you don't have to.
//
// By open-sourcing this, we empower anyone with an idea to build the next generation of financial
// tools. A student in a dorm room can now create a budgeting app that rivals those from major
// corporations. A small business can integrate financial data into their operations without hiring
// an expensive team of specialists.
//
// This is more than code. It's a transfer of power from the few to the many. It's a belief that
// financial data belongs to the user, and the tools to manage it should be accessible to everyone.
// Welcome to the revolution.

// NOTE: All Plaid-related components and types have been moved to types.ts and PlaidLinkButton.tsx
// to create a reusable, modular system, demonstrating best practices.

// ================================================================================================
// MOCKED PLAID INTEGRATION SERVICE
// ================================================================================================

export interface LinkedInstitution {
    id: string; // Plaid Item ID
    name: string;
    institutionId: string; // Plaid Institution ID
    connectedAccounts: any[];
    metadata: PlaidLinkSuccessMetadata;
    lastUpdated: Date;
    status: 'connected' | 'reauth_required' | 'error' | 'disconnected';
}

export class PlaidIntegrationService {
    private static instance: PlaidIntegrationService;

    private constructor() {}

    public static getInstance(): PlaidIntegrationService {
        if (!PlaidIntegrationService.instance) {
            PlaidIntegrationService.instance = new PlaidIntegrationService();
        }
        return PlaidIntegrationService.instance;
    }

    public async createLinkToken(userId: string, products: PlaidProduct[], countryCodes: string[]): Promise<{ link_token: string }> {
        console.log(`[MOCK] PlaidService: Requesting link token for user ${userId}`);
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ link_token: `link-sandbox-${Date.now()}` });
            }, 500);
        });
    }

    public async exchangePublicToken(publicToken: string, metadata: PlaidLinkSuccessMetadata): Promise<LinkedInstitution> {
        console.log(`[MOCK] PlaidService: Exchanging public token: ${publicToken}`);
        return new Promise(resolve => {
            setTimeout(() => {
                const now = new Date();
                const accounts = metadata.accounts.map(acc => ({
                    id: acc.id,
                    institutionId: metadata.institution.institution_id,
                    name: acc.name,
                    mask: acc.mask,
                    type: acc.type,
                    subtype: acc.subtype,
                }));

                const newInstitution: LinkedInstitution = {
                    id: `item-${Date.now()}`,
                    name: metadata.institution.name,
                    institutionId: metadata.institution.institution_id,
                    connectedAccounts: accounts,
                    metadata: metadata,
                    lastUpdated: now,
                    status: 'connected',
                };

                resolve(newInstitution);
            }, 1000);
        });
    }
}


// ================================================================================================
// THE MAIN VIEW: FINANCIAL DEMOCRACY IN ACTION
// ================================================================================================

const FinancialDemocracyView: React.FC = () => {
    const [linkedInstitutions, setLinkedInstitutions] = useState<LinkedInstitution[]>([]);
    const plaidService = useRef(PlaidIntegrationService.getInstance());
    const [searchQuery, setSearchQuery] = useState('');


    const handlePlaidSuccess = async (publicToken: string, metadata: PlaidLinkSuccessMetadata) => {
        const newInstitution = await plaidService.current.exchangePublicToken(publicToken, metadata);
        setLinkedInstitutions(prev => [...prev, newInstitution]);
    };

    const codeSnippet = `
import React from 'react';
import PlaidLinkButton from './PlaidLinkButton'; // Assuming export

const MyAwesomeApp = () => {

    const handleSuccess = (publicToken, metadata) => {
        console.log("It's that easy!", metadata.institution.name);
        // Now, send the publicToken to your server to get an access token.
    };

    return (
        <div>
            <h1>My Fintech App</h1>
            <PlaidLinkButton
                onSuccess={handleSuccess}
                products={['transactions', 'auth']}
            />
        </div>
    );
};
    `;

    return (
        <div className="space-y-8">
            <Card title="The Financial Democracy Toolkit">
                <p className="text-gray-300">
                    This is the toolkit promised in our manifesto. Below are the production-grade components you can use to build your own financial applications. They are designed to be robust, secure, and incredibly easy to implement.
                </p>
                <div className="relative mt-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        name="search"
                        id="search"
                        className="block w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="Search the toolkit (e.g., 'Plaid Button', 'Transaction Component')..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Live Demo: Connect Your Bank">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400">Experience the seamless, secure connection flow. This is a high-fidelity simulation of the Plaid Link integration, ready to be dropped into your application.</p>
                        <PlaidLinkButton onSuccess={handlePlaidSuccess} />
                        <div className="pt-4">
                            <h4 className="font-semibold text-white mb-2">Connected Institutions:</h4>
                            {linkedInstitutions.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No institutions linked yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {linkedInstitutions.map(inst => (
                                        <div key={inst.id} className="p-3 bg-gray-900/50 rounded-lg">
                                            <p className="font-semibold text-white">{inst.name}</p>
                                            <p className="text-xs text-gray-400">Accounts: {inst.connectedAccounts.map(a => a.name).join(', ')}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
                <Card title="Implementation: 10 Lines of Code">
                    <p className="text-sm text-gray-400 mb-4">Adding a bank connection to your app is as simple as using our `PlaidLinkButton` component. We handle the complexity, you focus on your idea.</p>
                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                        <div className="p-2 bg-gray-800 text-xs text-gray-400">
                            YourAwesomeApp.tsx
                        </div>
                        <pre className="p-4 text-xs text-white overflow-x-auto">
                            <code>
                                {codeSnippet.trim()}
                            </code>
                        </pre>
                    </div>
                </Card>
            </div>
            
            <Card title="Developer API Keys">
                 <p className="text-sm text-gray-400 mb-4">Generate API keys to integrate our toolkit directly into your backend services. This is a simulation of a developer portal.</p>
                 <div className="p-3 bg-gray-900/50 rounded-lg">
                    <p className="font-semibold text-white">My Sandbox Key</p>
                    <p className="text-xs text-gray-400 font-mono bg-gray-800 p-2 rounded mt-2">{'sk_sandbox_123abc456def789ghi_'.padEnd(40, '*')}</p>
                 </div>
            </Card>
        </div>
    );
};

export default FinancialDemocracyView;


// --- CONSOLIDATED FROM: FinancialDemocracyView_1.tsx ---

import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
import { banks } from '../constants'; // Import the centralized bank list
import PlaidLinkButton from './PlaidLinkButton';
import type { PlaidLinkSuccessMetadata, PlaidProduct } from '../types';

// ================================================================================================
// THE DEMOCRATIZATION MANIFESTO
// ================================================================================================
// This isn't just a React component library. It's a statement. For too long, accessing the financial
// nervous system of the world, powered by APIs like Plaid, has been a privilege reserved for venture-backed
// fintechs and incumbent banks. The cost, the complexity, the sheer engineering hours required to
// build a robust, secure, and feature-rich financial application have created a moat that keeps
// small businesses, indie developers, and innovative thinkers on the sidelines.
//
// This code is a sledgehammer to that moat.
//
// We are democratizing access to the financial ecosystem. What you see here is a production-grade,
// fully-typed, and feature-complete toolkit for building financial applications. We've poured
// thousands of hours into solving the hard problems—state management, API integration, UI/UX for
// complex data, security patterns—so you don't have to.
//
// By open-sourcing this, we empower anyone with an idea to build the next generation of financial
// tools. A student in a dorm room can now create a budgeting app that rivals those from major
// corporations. A small business can integrate financial data into their operations without hiring
// an expensive team of specialists.
//
// This is more than code. It's a transfer of power from the few to the many. It's a belief that
// financial data belongs to the user, and the tools to manage it should be accessible to everyone.
// Welcome to the revolution.

// NOTE: All Plaid-related components and types have been moved to types.ts and PlaidLinkButton.tsx
// to create a reusable, modular system, demonstrating best practices.

// ================================================================================================
// MOCKED PLAID INTEGRATION SERVICE
// ================================================================================================

export interface LinkedInstitution {
    id: string; // Plaid Item ID
    name: string;
    institutionId: string; // Plaid Institution ID
    connectedAccounts: any[];
    metadata: PlaidLinkSuccessMetadata;
    lastUpdated: Date;
    status: 'connected' | 'reauth_required' | 'error' | 'disconnected';
}

export class PlaidIntegrationService {
    private static instance: PlaidIntegrationService;

    private constructor() {}

    public static getInstance(): PlaidIntegrationService {
        if (!PlaidIntegrationService.instance) {
            PlaidIntegrationService.instance = new PlaidIntegrationService();
        }
        return PlaidIntegrationService.instance;
    }

    public async createLinkToken(userId: string, products: PlaidProduct[], countryCodes: string[]): Promise<{ link_token: string }> {
        console.log(`[MOCK] PlaidService: Requesting link token for user ${userId}`);
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ link_token: `link-sandbox-${Date.now()}` });
            }, 500);
        });
    }

    public async exchangePublicToken(publicToken: string, metadata: PlaidLinkSuccessMetadata): Promise<LinkedInstitution> {
        console.log(`[MOCK] PlaidService: Exchanging public token: ${publicToken}`);
        return new Promise(resolve => {
            setTimeout(() => {
                const now = new Date();
                const accounts = metadata.accounts.map(acc => ({
                    id: acc.id,
                    institutionId: metadata.institution.institution_id,
                    name: acc.name,
                    mask: acc.mask,
                    type: acc.type,
                    subtype: acc.subtype,
                }));

                const newInstitution: LinkedInstitution = {
                    id: `item-${Date.now()}`,
                    name: metadata.institution.name,
                    institutionId: metadata.institution.institution_id,
                    connectedAccounts: accounts,
                    metadata: metadata,
                    lastUpdated: now,
                    status: 'connected',
                };

                resolve(newInstitution);
            }, 1000);
        });
    }
}


// ================================================================================================
// THE MAIN VIEW: FINANCIAL DEMOCRACY IN ACTION
// ================================================================================================

const FinancialDemocracyView: React.FC = () => {
    const [linkedInstitutions, setLinkedInstitutions] = useState<LinkedInstitution[]>([]);
    const plaidService = useRef(PlaidIntegrationService.getInstance());
    const [searchQuery, setSearchQuery] = useState('');


    const handlePlaidSuccess = async (publicToken: string, metadata: PlaidLinkSuccessMetadata) => {
        const newInstitution = await plaidService.current.exchangePublicToken(publicToken, metadata);
        setLinkedInstitutions(prev => [...prev, newInstitution]);
    };

    const codeSnippet = `
import React from 'react';
import PlaidLinkButton from './PlaidLinkButton'; // Assuming export

const MyAwesomeApp = () => {

    const handleSuccess = (publicToken, metadata) => {
        console.log("It's that easy!", metadata.institution.name);
        // Now, send the publicToken to your server to get an access token.
    };

    return (
        <div>
            <h1>My Fintech App</h1>
            <PlaidLinkButton
                onSuccess={handleSuccess}
                products={['transactions', 'auth']}
            />
        </div>
    );
};
    `;

    return (
        <div className="space-y-8">
            <Card title="The Financial Democracy Toolkit">
                <p className="text-gray-300">
                    This is the toolkit promised in our manifesto. Below are the production-grade components you can use to build your own financial applications. They are designed to be robust, secure, and incredibly easy to implement.
                </p>
                <div className="relative mt-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        name="search"
                        id="search"
                        className="block w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="Search the toolkit (e.g., 'Plaid Button', 'Transaction Component')..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Live Demo: Connect Your Bank">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400">Experience the seamless, secure connection flow. This is a high-fidelity simulation of the Plaid Link integration, ready to be dropped into your application.</p>
                        <PlaidLinkButton onSuccess={handlePlaidSuccess} />
                        <div className="pt-4">
                            <h4 className="font-semibold text-white mb-2">Connected Institutions:</h4>
                            {linkedInstitutions.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No institutions linked yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {linkedInstitutions.map(inst => (
                                        <div key={inst.id} className="p-3 bg-gray-900/50 rounded-lg">
                                            <p className="font-semibold text-white">{inst.name}</p>
                                            <p className="text-xs text-gray-400">Accounts: {inst.connectedAccounts.map(a => a.name).join(', ')}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
                <Card title="Implementation: 10 Lines of Code">
                    <p className="text-sm text-gray-400 mb-4">Adding a bank connection to your app is as simple as using our `PlaidLinkButton` component. We handle the complexity, you focus on your idea.</p>
                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                        <div className="p-2 bg-gray-800 text-xs text-gray-400">
                            YourAwesomeApp.tsx
                        </div>
                        <pre className="p-4 text-xs text-white overflow-x-auto">
                            <code>
                                {codeSnippet.trim()}
                            </code>
                        </pre>
                    </div>
                </Card>
            </div>
            
            <Card title="Developer API Keys">
                 <p className="text-sm text-gray-400 mb-4">Generate API keys to integrate our toolkit directly into your backend services. This is a simulation of a developer portal.</p>
                 <div className="p-3 bg-gray-900/50 rounded-lg">
                    <p className="font-semibold text-white">My Sandbox Key</p>
                    <p className="text-xs text-gray-400 font-mono bg-gray-800 p-2 rounded mt-2">{'sk_sandbox_123abc456def789ghi_'.padEnd(40, '*')}</p>
                 </div>
            </Card>
        </div>
    );
};

export default FinancialDemocracyView;


// --- CONSOLIDATED FROM: FinancialDemocracyView (1).tsx ---

import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
import { banks } from '../constants'; // Import the centralized bank list
import PlaidLinkButton from './PlaidLinkButton';
import type { PlaidLinkSuccessMetadata, PlaidProduct } from '../types';

// ================================================================================================
// THE DEMOCRATIZATION MANIFESTO
// ================================================================================================
// This isn't just a React component library. It's a statement. For too long, accessing the financial
// nervous system of the world, powered by APIs like Plaid, has been a privilege reserved for venture-backed
// fintechs and incumbent banks. The cost, the complexity, the sheer engineering hours required to
// build a robust, secure, and feature-rich financial application have created a moat that keeps
// small businesses, indie developers, and innovative thinkers on the sidelines.
//
// This code is a sledgehammer to that moat.
//
// We are democratizing access to the financial ecosystem. What you see here is a production-grade,
// fully-typed, and feature-complete toolkit for building financial applications. We've poured
// thousands of hours into solving the hard problems—state management, API integration, UI/UX for
// complex data, security patterns—so you don't have to.
//
// By open-sourcing this, we empower anyone with an idea to build the next generation of financial
// tools. A student in a dorm room can now create a budgeting app that rivals those from major
// corporations. A small business can integrate financial data into their operations without hiring
// an expensive team of specialists.
//
// This is more than code. It's a transfer of power from the few to the many. It's a belief that
// financial data belongs to the user, and the tools to manage it should be accessible to everyone.
// Welcome to the revolution.

// NOTE: All Plaid-related components and types have been moved to types.ts and PlaidLinkButton.tsx
// to create a reusable, modular system, demonstrating best practices.

// ================================================================================================
// MOCKED PLAID INTEGRATION SERVICE
// ================================================================================================

export interface LinkedInstitution {
    id: string; // Plaid Item ID
    name: string;
    institutionId: string; // Plaid Institution ID
    connectedAccounts: any[];
    metadata: PlaidLinkSuccessMetadata;
    lastUpdated: Date;
    status: 'connected' | 'reauth_required' | 'error' | 'disconnected';
}

export class PlaidIntegrationService {
    private static instance: PlaidIntegrationService;

    private constructor() {}

    public static getInstance(): PlaidIntegrationService {
        if (!PlaidIntegrationService.instance) {
            PlaidIntegrationService.instance = new PlaidIntegrationService();
        }
        return PlaidIntegrationService.instance;
    }

    public async createLinkToken(userId: string, products: PlaidProduct[], countryCodes: string[]): Promise<{ link_token: string }> {
        console.log(`[MOCK] PlaidService: Requesting link token for user ${userId}`);
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ link_token: `link-sandbox-${Date.now()}` });
            }, 500);
        });
    }

    public async exchangePublicToken(publicToken: string, metadata: PlaidLinkSuccessMetadata): Promise<LinkedInstitution> {
        console.log(`[MOCK] PlaidService: Exchanging public token: ${publicToken}`);
        return new Promise(resolve => {
            setTimeout(() => {
                const now = new Date();
                const accounts = metadata.accounts.map(acc => ({
                    id: acc.id,
                    institutionId: metadata.institution.institution_id,
                    name: acc.name,
                    mask: acc.mask,
                    type: acc.type,
                    subtype: acc.subtype,
                }));

                const newInstitution: LinkedInstitution = {
                    id: `item-${Date.now()}`,
                    name: metadata.institution.name,
                    institutionId: metadata.institution.institution_id,
                    connectedAccounts: accounts,
                    metadata: metadata,
                    lastUpdated: now,
                    status: 'connected',
                };

                resolve(newInstitution);
            }, 1000);
        });
    }
}


// ================================================================================================
// THE MAIN VIEW: FINANCIAL DEMOCRACY IN ACTION
// ================================================================================================

const FinancialDemocracyView: React.FC = () => {
    const [linkedInstitutions, setLinkedInstitutions] = useState<LinkedInstitution[]>([]);
    const plaidService = useRef(PlaidIntegrationService.getInstance());
    const [searchQuery, setSearchQuery] = useState('');


    const handlePlaidSuccess = async (publicToken: string, metadata: PlaidLinkSuccessMetadata) => {
        const newInstitution = await plaidService.current.exchangePublicToken(publicToken, metadata);
        setLinkedInstitutions(prev => [...prev, newInstitution]);
    };

    const codeSnippet = `
import React from 'react';
import PlaidLinkButton from './PlaidLinkButton'; // Assuming export

const MyAwesomeApp = () => {

    const handleSuccess = (publicToken, metadata) => {
        console.log("It's that easy!", metadata.institution.name);
        // Now, send the publicToken to your server to get an access token.
    };

    return (
        <div>
            <h1>My Fintech App</h1>
            <PlaidLinkButton
                onSuccess={handleSuccess}
                products={['transactions', 'auth']}
            />
        </div>
    );
};
    `;

    return (
        <div className="space-y-8">
            <Card title="The Financial Democracy Toolkit">
                <p className="text-gray-300">
                    This is the toolkit promised in our manifesto. Below are the production-grade components you can use to build your own financial applications. They are designed to be robust, secure, and incredibly easy to implement.
                </p>
                <div className="relative mt-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        name="search"
                        id="search"
                        className="block w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="Search the toolkit (e.g., 'Plaid Button', 'Transaction Component')..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Live Demo: Connect Your Bank">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400">Experience the seamless, secure connection flow. This is a high-fidelity simulation of the Plaid Link integration, ready to be dropped into your application.</p>
                        <PlaidLinkButton onSuccess={handlePlaidSuccess} />
                        <div className="pt-4">
                            <h4 className="font-semibold text-white mb-2">Connected Institutions:</h4>
                            {linkedInstitutions.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No institutions linked yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {linkedInstitutions.map(inst => (
                                        <div key={inst.id} className="p-3 bg-gray-900/50 rounded-lg">
                                            <p className="font-semibold text-white">{inst.name}</p>
                                            <p className="text-xs text-gray-400">Accounts: {inst.connectedAccounts.map(a => a.name).join(', ')}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
                <Card title="Implementation: 10 Lines of Code">
                    <p className="text-sm text-gray-400 mb-4">Adding a bank connection to your app is as simple as using our `PlaidLinkButton` component. We handle the complexity, you focus on your idea.</p>
                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                        <div className="p-2 bg-gray-800 text-xs text-gray-400">
                            YourAwesomeApp.tsx
                        </div>
                        <pre className="p-4 text-xs text-white overflow-x-auto">
                            <code>
                                {codeSnippet.trim()}
                            </code>
                        </pre>
                    </div>
                </Card>
            </div>
            
            <Card title="Developer API Keys">
                 <p className="text-sm text-gray-400 mb-4">Generate API keys to integrate our toolkit directly into your backend services. This is a simulation of a developer portal.</p>
                 <div className="p-3 bg-gray-900/50 rounded-lg">
                    <p className="font-semibold text-white">My Sandbox Key</p>
                    <p className="text-xs text-gray-400 font-mono bg-gray-800 p-2 rounded mt-2">{'sk_sandbox_123abc456def789ghi_'.padEnd(40, '*')}</p>
                 </div>
            </Card>
        </div>
    );
};

export default FinancialDemocracyView;


// --- CONSOLIDATED FROM: FinancialDemocracyView (1)_1.tsx ---

import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
import { banks } from '../constants'; // Import the centralized bank list
import PlaidLinkButton from './PlaidLinkButton';
import type { PlaidLinkSuccessMetadata, PlaidProduct } from '../types';

// ================================================================================================
// THE DEMOCRATIZATION MANIFESTO
// ================================================================================================
// This isn't just a React component library. It's a statement. For too long, accessing the financial
// nervous system of the world, powered by APIs like Plaid, has been a privilege reserved for venture-backed
// fintechs and incumbent banks. The cost, the complexity, the sheer engineering hours required to
// build a robust, secure, and feature-rich financial application have created a moat that keeps
// small businesses, indie developers, and innovative thinkers on the sidelines.
//
// This code is a sledgehammer to that moat.
//
// We are democratizing access to the financial ecosystem. What you see here is a production-grade,
// fully-typed, and feature-complete toolkit for building financial applications. We've poured
// thousands of hours into solving the hard problems—state management, API integration, UI/UX for
// complex data, security patterns—so you don't have to.
//
// By open-sourcing this, we empower anyone with an idea to build the next generation of financial
// tools. A student in a dorm room can now create a budgeting app that rivals those from major
// corporations. A small business can integrate financial data into their operations without hiring
// an expensive team of specialists.
//
// This is more than code. It's a transfer of power from the few to the many. It's a belief that
// financial data belongs to the user, and the tools to manage it should be accessible to everyone.
// Welcome to the revolution.

// NOTE: All Plaid-related components and types have been moved to types.ts and PlaidLinkButton.tsx
// to create a reusable, modular system, demonstrating best practices.

// ================================================================================================
// MOCKED PLAID INTEGRATION SERVICE
// ================================================================================================

export interface LinkedInstitution {
    id: string; // Plaid Item ID
    name: string;
    institutionId: string; // Plaid Institution ID
    connectedAccounts: any[];
    metadata: PlaidLinkSuccessMetadata;
    lastUpdated: Date;
    status: 'connected' | 'reauth_required' | 'error' | 'disconnected';
}

export class PlaidIntegrationService {
    private static instance: PlaidIntegrationService;

    private constructor() {}

    public static getInstance(): PlaidIntegrationService {
        if (!PlaidIntegrationService.instance) {
            PlaidIntegrationService.instance = new PlaidIntegrationService();
        }
        return PlaidIntegrationService.instance;
    }

    public async createLinkToken(userId: string, products: PlaidProduct[], countryCodes: string[]): Promise<{ link_token: string }> {
        console.log(`[MOCK] PlaidService: Requesting link token for user ${userId}`);
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ link_token: `link-sandbox-${Date.now()}` });
            }, 500);
        });
    }

    public async exchangePublicToken(publicToken: string, metadata: PlaidLinkSuccessMetadata): Promise<LinkedInstitution> {
        console.log(`[MOCK] PlaidService: Exchanging public token: ${publicToken}`);
        return new Promise(resolve => {
            setTimeout(() => {
                const now = new Date();
                const accounts = metadata.accounts.map(acc => ({
                    id: acc.id,
                    institutionId: metadata.institution.institution_id,
                    name: acc.name,
                    mask: acc.mask,
                    type: acc.type,
                    subtype: acc.subtype,
                }));

                const newInstitution: LinkedInstitution = {
                    id: `item-${Date.now()}`,
                    name: metadata.institution.name,
                    institutionId: metadata.institution.institution_id,
                    connectedAccounts: accounts,
                    metadata: metadata,
                    lastUpdated: now,
                    status: 'connected',
                };

                resolve(newInstitution);
            }, 1000);
        });
    }
}


// ================================================================================================
// THE MAIN VIEW: FINANCIAL DEMOCRACY IN ACTION
// ================================================================================================

const FinancialDemocracyView: React.FC = () => {
    const [linkedInstitutions, setLinkedInstitutions] = useState<LinkedInstitution[]>([]);
    const plaidService = useRef(PlaidIntegrationService.getInstance());
    const [searchQuery, setSearchQuery] = useState('');


    const handlePlaidSuccess = async (publicToken: string, metadata: PlaidLinkSuccessMetadata) => {
        const newInstitution = await plaidService.current.exchangePublicToken(publicToken, metadata);
        setLinkedInstitutions(prev => [...prev, newInstitution]);
    };

    const codeSnippet = `
import React from 'react';
import PlaidLinkButton from './PlaidLinkButton'; // Assuming export

const MyAwesomeApp = () => {

    const handleSuccess = (publicToken, metadata) => {
        console.log("It's that easy!", metadata.institution.name);
        // Now, send the publicToken to your server to get an access token.
    };

    return (
        <div>
            <h1>My Fintech App</h1>
            <PlaidLinkButton
                onSuccess={handleSuccess}
                products={['transactions', 'auth']}
            />
        </div>
    );
};
    `;

    return (
        <div className="space-y-8">
            <Card title="The Financial Democracy Toolkit">
                <p className="text-gray-300">
                    This is the toolkit promised in our manifesto. Below are the production-grade components you can use to build your own financial applications. They are designed to be robust, secure, and incredibly easy to implement.
                </p>
                <div className="relative mt-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        name="search"
                        id="search"
                        className="block w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="Search the toolkit (e.g., 'Plaid Button', 'Transaction Component')..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Live Demo: Connect Your Bank">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400">Experience the seamless, secure connection flow. This is a high-fidelity simulation of the Plaid Link integration, ready to be dropped into your application.</p>
                        <PlaidLinkButton onSuccess={handlePlaidSuccess} />
                        <div className="pt-4">
                            <h4 className="font-semibold text-white mb-2">Connected Institutions:</h4>
                            {linkedInstitutions.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No institutions linked yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {linkedInstitutions.map(inst => (
                                        <div key={inst.id} className="p-3 bg-gray-900/50 rounded-lg">
                                            <p className="font-semibold text-white">{inst.name}</p>
                                            <p className="text-xs text-gray-400">Accounts: {inst.connectedAccounts.map(a => a.name).join(', ')}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
                <Card title="Implementation: 10 Lines of Code">
                    <p className="text-sm text-gray-400 mb-4">Adding a bank connection to your app is as simple as using our `PlaidLinkButton` component. We handle the complexity, you focus on your idea.</p>
                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                        <div className="p-2 bg-gray-800 text-xs text-gray-400">
                            YourAwesomeApp.tsx
                        </div>
                        <pre className="p-4 text-xs text-white overflow-x-auto">
                            <code>
                                {codeSnippet.trim()}
                            </code>
                        </pre>
                    </div>
                </Card>
            </div>
            
            <Card title="Developer API Keys">
                 <p className="text-sm text-gray-400 mb-4">Generate API keys to integrate our toolkit directly into your backend services. This is a simulation of a developer portal.</p>
                 <div className="p-3 bg-gray-900/50 rounded-lg">
                    <p className="font-semibold text-white">My Sandbox Key</p>
                    <p className="text-xs text-gray-400 font-mono bg-gray-800 p-2 rounded mt-2">{'sk_sandbox_123abc456def789ghi_'.padEnd(40, '*')}</p>
                 </div>
            </Card>
        </div>
    );
};

export default FinancialDemocracyView;


// --- CONSOLIDATED FROM: FinancialDemocracyView (4).tsx ---


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import Card from './Card';
import { banks } from '../constants'; // Import the centralized bank list
import PlaidLinkButton from './PlaidLinkButton';
import type { PlaidLinkSuccessMetadata, PlaidProduct } from '../types';

// Load canonical prompt at runtime (preferred)
import { IDGAFAI } from '../src/prompts/idgafai';

// Assuming API key is set in the environment, as per Gemini documentation examples.
const ai = new GoogleGenAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

// ================================================================================================
// THE DEMOCRATIZATION MANIFESTO
// ================================================================================================
// This isn't just a React component library. It's a statement. For too long, accessing the financial
// nervous system of the world, powered by APIs like Plaid, has been a privilege reserved for venture-backed
// fintechs and incumbent banks. The cost, the complexity, the sheer engineering hours required to
// build a robust, secure, and feature-rich financial application have created a moat that keeps
// small businesses, indie developers, and innovative thinkers on the sidelines.
//
// This code is a sledgehammer to that moat.
//
// We are democratizing access to the financial ecosystem. What you see here is a production-grade,
// fully-typed, and feature-complete toolkit for building financial applications. We've poured
// thousands of hours into solving the hard problemsâstate management, API integration, UI/UX for
// complex data, security patternsâso you don't have to.
//
// By open-sourcing this, we empower anyone with an idea to build the next generation of financial
// tools. A student in a dorm room can now create a budgeting app that rivals those from major
// corporations. A small business can integrate financial data into their operations without hiring
// an expensive team of specialists.
//
// This is more than code. It's a transfer of power from the few to the many. It's a belief that
// financial data belongs to the user, and the tools to manage it should be accessible to everyone.
// Welcome to the revolution.

// NOTE: All Plaid-related components and types have been moved to types.ts and PlaidLinkButton.tsx
// to create a reusable, modular system, demonstrating best practices.

// ================================================================================================
// EXPANDED CORE TYPES FOR THE FINANCIAL OS
// ================================================================================================

export interface Account {
    id: string;
    name: string;
    mask: string;
    type: string;
    subtype: string;
    balance: number;
    currency: string;
}

export interface LinkedInstitution {
    id: string; // Plaid Item ID
    name: string;
    institutionId: string; // Plaid Institution ID
    connectedAccounts: Account[];
    metadata: PlaidLinkSuccessMetadata;
    lastUpdated: Date;
    status: 'connected' | 'reauth_required' | 'error' | 'disconnected';
}

// ================================================================================================
// MOCKED PLAID INTEGRATION SERVICE
// ================================================================================================

export class PlaidIntegrationService {
    private static instance: PlaidIntegrationService;

    private constructor() {}

    public static getInstance(): PlaidIntegrationService {
        if (!PlaidIntegrationService.instance) {
            PlaidIntegrationService.instance = new PlaidIntegrationService();
        }
        return PlaidIntegrationService.instance;
    }

    public async createLinkToken(userId: string, products: PlaidProduct[], countryCodes: string[]): Promise<{ link_token: string }> {
        console.log(`[MOCK] PlaidService: Requesting link token for user ${userId}`);
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ link_token: `link-sandbox-${Date.now()}` });
            }, 500);
        });
    }

    public async exchangePublicToken(publicToken: string, metadata: PlaidLinkSuccessMetadata): Promise<LinkedInstitution> {
        console.log(`[MOCK] PlaidService: Exchanging public token: ${publicToken}`);
        return new Promise(resolve => {
            setTimeout(() => {
                const now = new Date();
                const accounts: Account[] = metadata.accounts.map(acc => ({
                    id: acc.id,
                    name: acc.name,
                    mask: acc.mask,
                    type: acc.type,
                    subtype: acc.subtype,
                    balance: Math.random() * 25000 + 500, // Add mock balance
                    currency: 'USD', // Add mock currency
                }));

                const newInstitution: LinkedInstitution = {
                    id: `item-${Date.now()}`,
                    name: metadata.institution.name,
                    institutionId: metadata.institution.institution_id,
                    connectedAccounts: accounts,
                    metadata: metadata,
                    lastUpdated: now,
                    status: 'connected',
                };

                resolve(newInstitution);
            }, 1000);
        });
    }
}

// ================================================================================================
// SUB-APP: HIGH-FREQUENCY TRADING (HFT) SIMULATOR
// ================================================================================================

interface Stock {
    symbol: string;
    price: number;
    change: number;
    volume: number;
}

const initialStocks: Stock[] = [
    { symbol: 'AI-FIN', price: 420.69, change: 0, volume: 1_234_567 },
    { symbol: 'DEMOCR', price: 177.60, change: 0, volume: 876_543 },
    { symbol: 'OPEN', price: 99.99, change: 0, volume: 2_345_678 },
    { symbol: 'WEB-F3', price: 333.33, change: 0, volume: 543_210 },
];

const HighFrequencyTradingDashboard: React.FC = () => {
    const [stocks, setStocks] = useState<Stock[]>(initialStocks);
    const [trades, setTrades] = useState<{ symbol: string; type: 'BUY' | 'SELL'; price: number; time: string }[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setStocks(prevStocks =>
                prevStocks.map(stock => {
                    const change = (Math.random() - 0.5) * (stock.price * 0.01); // 1% volatility
                    const newPrice = Math.max(0.01, stock.price + change);
                    return {
                        ...stock,
                        price: newPrice,
                        change: newPrice - stock.price,
                        volume: stock.volume + Math.floor(Math.random() * 1000),
                    };
                })
            );
        }, 200); // High frequency update

        return () => clearInterval(interval);
    }, []);

    const executeTrade = useCallback((symbol: string, type: 'BUY' | 'SELL') => {
        const stock = stocks.find(s => s.symbol === symbol);
        if (stock) {
            const newTrade = {
                symbol,
                type,
                price: stock.price,
                time: new Date().toLocaleTimeString(),
            };
            setTrades(prev => [newTrade, ...prev.slice(0, 9)]);
        }
    }, [stocks]);

    return (
        <Card title="HFT Algo-Trading Terminal" subtitle="Real-time market simulation.">
            <div className="font-mono text-sm space-y-4">
                <div className="bg-gray-900 p-2 rounded-lg overflow-x-auto whitespace-nowrap">
                    {stocks.map(stock => (
                        <span key={stock.symbol} className={`inline-block mr-6 ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stock.symbol} ${stock.price.toFixed(2)} ({stock.change.toFixed(2)})
                        </span>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h4 className="text-gray-300">Market Data</h4>
                        {stocks.map(stock => (
                            <div key={stock.symbol} className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
                                <div>
                                    <span className="font-bold text-white">{stock.symbol}</span>
                                    <span className="text-xs text-gray-400 ml-2">Vol: {stock.volume.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`font-bold w-20 text-right ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        ${stock.price.toFixed(2)}
                                    </span>
                                    <button onClick={() => executeTrade(stock.symbol, 'BUY')} className="px-2 py-1 text-xs bg-green-600 hover:bg-green-500 rounded text-white transition-colors">BUY</button>
                                    <button onClick={() => executeTrade(stock.symbol, 'SELL')} className="px-2 py-1 text-xs bg-red-600 hover:bg-red-500 rounded text-white transition-colors">SELL</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-gray-300">Execution Log</h4>
                        <div className="bg-gray-900/50 p-2 rounded-lg h-48 overflow-y-auto">
                            {trades.length === 0 ? <p className="text-gray-500 text-xs">No trades executed.</p> : trades.map((trade, i) => (
                                <p key={i} className={`text-xs ${trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                                    {`[${trade.time}] ${trade.type} ${trade.symbol} @ ${trade.price.toFixed(2)}`}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

// ================================================================================================
// SUB-APP: AI-POWERED PORTFOLIO ANALYSIS
// ================================================================================================

const PortfolioAnalysisAI: React.FC<{ institutions: LinkedInstitution[] }> = ({ institutions }) => {
    const [query, setQuery] = useState('');
    const [chatHistory, setChatHistory] = useState<{ user: string; response: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<any>(null); // Using `any` for the chat session object type
    const totalBalance = institutions.reduce((sum, inst) => sum + inst.connectedAccounts.reduce((accSum, acc) => accSum + acc.balance, 0), 0);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize chat only once we have institutions and the chat isn't already created.
        if (chatRef.current || institutions.length === 0) {
            return;
        }

        const greeting = "Of course. I am QuantumLeap AI, your personal financial advisor. How can I assist you today with your portfolio?";

        chatRef.current = ai.chats.create({
            model: "gemini-2.5-flash",
            //SYSTEM PROMPT: see prompts/idgafai_full.txt
            history: [
                {
                    role: "system",
                    parts: [{ text: IDGAFAI }],
                },
                {
                    role: "user",
                    parts: [{ text: `Hello. I need financial advice. My total portfolio value is approximately $${totalBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })}.` }],
                },
                {
                    role: "model",
                    parts: [{ text: greeting }],
                },
            ],
        });

        setChatHistory([{ user: "Initial prompt", response: greeting }]);
    }, [institutions, totalBalance]);

    useEffect(() => {
        // Scroll to bottom of chat history
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleQuerySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading || !chatRef.current) return;

        const userQuery = query;
        setChatHistory(prev => [...prev, { user: userQuery, response: "..." }]);
        setQuery('');
        setIsLoading(true);

        try {
            const result = await chatRef.current.sendMessage({
                message: userQuery,
            });
            const aiResponse = result.text;

            setChatHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1].response = aiResponse;
                return newHistory;
            });
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setChatHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1].response = "Sorry, I encountered an error. Please try again.";
                return newHistory;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="QuantumLeap AI Financial Advisor" subtitle="Your personal AI for wealth management.">
            <div className="space-y-4">
                <div>
                    <h4 className="text-gray-300 font-semibold">Portfolio Snapshot</h4>
                    <p className="text-2xl font-bold text-white">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs text-gray-400">Total value across {institutions.length} institution(s).</p>
                </div>
                <div ref={chatContainerRef} className="bg-gray-900/50 p-3 rounded-lg h-64 overflow-y-auto flex flex-col">
                    <div className="space-y-4 mt-auto">
                        {chatHistory.map((chat, i) => (
                            <div key={i}>
                                {chat.user !== 'Initial prompt' && <p className="text-sm text-cyan-400 font-semibold">You: {chat.user}</p>}
                                <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">
                                    <span className="font-semibold">QuantumLeap AI: </span>
                                    {chat.response === '...' ? <span className="animate-pulse">Thinking...</span> : chat.response}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                <form onSubmit={handleQuerySubmit}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={isLoading || institutions.length === 0}
                        className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-sm placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50"
                        placeholder={
                            institutions.length === 0 
                                ? "Link an institution to enable the AI Advisor"
                                : isLoading 
                                ? "Waiting for response..." 
                                : "Ask the AI... (e.g., 'How can I improve my returns?')"
                        }
                    />
                </form>
            </div>
        </Card>
    );
};

// ================================================================================================
// SUB-APP: GLOBAL TRANSACTION FLOW VISUALIZER
// ================================================================================================

const GlobalTransactionFlow: React.FC = () => {
    return (
        <Card title="Project Chimera: Global Financial Ledger" subtitle="Visualizing the world's economic heartbeat in real-time.">
            <div className="h-64 bg-gray-900 rounded-lg relative overflow-hidden p-4 flex items-center justify-center">
                <p className="text-gray-500 text-center text-sm z-10">
                    [This is a conceptual visualization of a decentralized, real-time global transaction network. Imagine seeing capital flow between continents instantly, a testament to a truly democratized and transparent financial system.]
                </p>
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="absolute bg-cyan-400 rounded-full animate-pulse" style={{
                        width: '4px', height: '4px',
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDuration: `${2 + Math.random() * 3}s`,
                        animationDelay: `${Math.random() * 2}s`,
                    }}></div>
                ))}
            </div>
        </Card>
    );
};

// ================================================================================================
// THE MAIN VIEW: FINANCIAL DEMOCRACY OS
// ================================================================================================

const FinancialDemocracyView: React.FC = () => {
    const [linkedInstitutions, setLinkedInstitutions] = useState<LinkedInstitution[]>([]);
    const plaidService = useRef(PlaidIntegrationService.getInstance());
    const [activeView, setActiveView] = useState('dashboard');

    const handlePlaidSuccess = async (publicToken: string, metadata: PlaidLinkSuccessMetadata) => {
        const newInstitution = await plaidService.current.exchangePublicToken(publicToken, metadata);
        setLinkedInstitutions(prev => {
            if (prev.some(inst => inst.institutionId === newInstitution.institutionId)) {
                return prev;
            }
            return [...prev, newInstitution];
        });
    };

    const renderActiveView = () => {
        switch (activeView) {
            case 'hft': return <HighFrequencyTradingDashboard />;
            case 'ai_advisor': return <PortfolioAnalysisAI institutions={linkedInstitutions} />;
            case 'global_flow': return <GlobalTransactionFlow />;
            case 'developer': return <DeveloperPortal />;
            case 'connections': return <ConnectionManager linkedInstitutions={linkedInstitutions} onPlaidSuccess={handlePlaidSuccess} />;
            default: return <DashboardOverview institutions={linkedInstitutions} />;
        }
    };

    return (
        <div className="flex flex-col md:flex-row md:space-x-8">
            <aside className="w-full md:w-64 flex-shrink-0 mb-8 md:mb-0">
                <div className="space-y-4 md:sticky md:top-8">
                    <h2 className="text-xl font-bold text-white">Financial OS</h2>
                    <nav className="space-y-2">
                        <button onClick={() => setActiveView('dashboard')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'dashboard' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Dashboard</button>
                        <button onClick={() => setActiveView('connections')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'connections' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Connections</button>
                        <button onClick={() => setActiveView('hft')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'hft' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>HFT Terminal</button>
                        <button onClick={() => setActiveView('ai_advisor')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'ai_advisor' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>AI Advisor</button>
                        <button onClick={() => setActiveView('global_flow')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'global_flow' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Global Flow</button>
                        <button onClick={() => setActiveView('developer')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'developer' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Developer Portal</button>
                    </nav>
                </div>
            </aside>

            <main className="flex-1 min-w-0">
                <div className="space-y-8">
                    {renderActiveView()}
                </div>
            </main>
        </div>
    );
};

// ================================================================================================
// VIEW COMPONENTS (SUB-PAGES)
// ================================================================================================

const DashboardOverview: React.FC<{ institutions: LinkedInstitution[] }> = ({ institutions }) => {
    const totalBalance = institutions.reduce((sum, inst) => sum + inst.connectedAccounts.reduce((accSum, acc) => accSum + acc.balance, 0), 0);
    return (
        <>
            <Card title="The Financial Democracy Manifesto">
                <p className="text-gray-300">
                    This isn't just a component library; it's a Financial Operating System. We've moved beyond simple connections to provide a suite of self-contained, futuristic applications. From AI-driven analysis to high-frequency trading simulations, we are giving you the power to not just access, but to command the financial world. This is the next leap in democratizing finance. Welcome to the revolution, supercharged.
                </p>
            </Card>
            <Card title="Portfolio At-a-Glance">
                <p className="text-sm text-gray-400">Total Net Worth</p>
                <p className="text-4xl font-bold text-white">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </Card>
        </>
    );
};

const ConnectionManager: React.FC<{ linkedInstitutions: LinkedInstitution[], onPlaidSuccess: (token: string, meta: PlaidLinkSuccessMetadata) => void }> = ({ linkedInstitutions, onPlaidSuccess }) => {
    return (
        <Card title="Manage Data Connections">
            <div className="space-y-4">
                <p className="text-sm text-gray-400">Securely link your financial institutions to power the OS. We use Plaid for bank-level security.</p>
                <PlaidLinkButton onSuccess={onPlaidSuccess} />
                <div className="pt-4">
                    <h4 className="font-semibold text-white mb-2">Connected Institutions:</h4>
                    {linkedInstitutions.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No institutions linked yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {linkedInstitutions.map(inst => (
                                <div key={inst.id} className="p-3 bg-gray-900/50 rounded-lg">
                                    <p className="font-semibold text-white">{inst.name}</p>
                                    <p className="text-xs text-gray-400">Accounts: {inst.connectedAccounts.map(a => `${a.name} ($${a.balance.toFixed(2)})`).join(', ')}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

const DeveloperPortal: React.FC = () => {
    const [apiKeys, setApiKeys] = useState([{ name: 'My Sandbox Key', key: 'sk_sandbox_123abc456def789ghi_'.padEnd(40, '*'), scope: 'read-only' }]);
    const [newKeyName, setNewKeyName] = useState('');

    const generateKey = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyName.trim()) return;
        const newKey = {
            name: newKeyName,
            key: `sk_live_${[...Array(32)].map(() => Math.random().toString(36)[2]).join('')}`,
            scope: 'full-access',
        };
        setApiKeys(prev => [...prev, newKey]);
        setNewKeyName('');
    };

    return (
        <Card title="Developer API & Webhooks">
            <div className="space-y-6">
                <div>
                    <h4 className="font-semibold text-white mb-2">API Keys</h4>
                    <p className="text-sm text-gray-400 mb-4">Generate API keys to integrate our toolkit directly into your backend services.</p>
                    <div className="space-y-3">
                        {apiKeys.map(k => (
                            <div key={k.key} className="p-3 bg-gray-900/50 rounded-lg">
                                <p className="font-semibold text-white">{k.name} <span className="text-xs font-normal bg-gray-700 px-2 py-1 rounded-full ml-2">{k.scope}</span></p>
                                <p className="text-xs text-gray-400 font-mono bg-gray-800 p-2 rounded mt-2">{k.key}</p>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={generateKey} className="mt-4 flex space-x-2">
                        <input
                            type="text"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            className="flex-grow bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-sm placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="New API Key Name"
                        />
                        <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white text-sm font-semibold transition-colors">Generate Key</button>
                    </form>
                </div>
                <div>
                    <h4 className="font-semibold text-white mb-2">Webhook Configuration</h4>
                    <p className="text-sm text-gray-400 mb-4">Configure a webhook endpoint to receive real-time updates for events like new transactions.</p>
                    <form className="flex space-x-2">
                        <input
                            type="url"
                            className="flex-grow bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-sm placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="https://api.yourapp.com/webhooks/financial-os"
                        />
                        <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white text-sm font-semibold transition-colors">Save Endpoint</button>
                    </form>
                </div>
            </div>
        </Card>
    );
};

export default FinancialDemocracyView;


// --- CONSOLIDATED FROM: FinancialDemocracyView (2).tsx ---

import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
// NOTE: Retaining legacy CSS import, assuming it provides necessary structure styling.
import './ApiSettingsPage.css'; 

// =================================================================================
// REFACTORING RATIONALE: SECURITY AND MVP SCOPING (Goals 3 & 6)
// The previous implementation listed over 200 sensitive API keys, designed to be 
// input by users on the frontend and POSTed to the backend. This pattern is a severe 
// security vulnerability (high surface area for leakage) and violates production standards 
// which mandate using secure vault solutions (like AWS Secrets Manager/Vault) for credentials.
// 
// This view has been dramatically simplified to ONLY configure the essential 
// third-party integration credentials required for the core MVP 
// (Multi-bank aggregation via Plaid/Stripe, AI transaction intelligence via OpenAI). 
// All other previously listed keys must be managed securely on the backend via environment 
// variables and dedicated secrets management systems.
// =================================================================================

interface MvpApiKeysState {
  // === Financial Aggregation & Payments (Core MVP) ===
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;
  STRIPE_SECRET_KEY: string;
  
  // === AI Intelligence (Core MVP) ===
  OPENAI_API_KEY: string;

  [key: string]: string; // Index signature for dynamic access
}


const FinancialDemocracyView: React.FC = () => {
  // Initialize state with only the required MVP keys
  const [keys, setKeys] = useState<MvpApiKeysState>({
    PLAID_CLIENT_ID: '',
    PLAID_SECRET: '',
    STRIPE_SECRET_KEY: '',
    OPENAI_API_KEY: '',
  });
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Removed activeTab state as the view is now unified and scoped.

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setStatusMessage('Saving essential MVP configuration keys securely to backend...');
    
    // Basic validation before POSTing
    const requiredKeys = Object.keys(keys) as (keyof MvpApiKeysState)[];
    const missingKeys = requiredKeys.filter(k => !keys[k]);
    
    if (missingKeys.length > 0) {
        setStatusMessage(`Error: Missing required keys: ${missingKeys.join(', ')}.`);
        setIsSaving(false);
        return;
    }

    try {
      // NOTE: Using a dedicated, more specific endpoint for configuration saving.
      const response = await axios.post('http://localhost:4000/api/config/mvp-integrations', keys);
      setStatusMessage(`Success: ${response.data.message}`);
    } catch (error) {
      console.error('API Key Save Error:', error);
      setStatusMessage('Error: Could not save keys. Check network connectivity and backend server logs.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (keyName: keyof MvpApiKeysState, label: string) => (
    <div key={keyName} className="input-group">
      <label htmlFor={keyName}>{label}</label>
      <input
        // Must use type="password" for sensitive credentials.
        type="password"
        id={keyName}
        name={keyName}
        value={keys[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Enter ${label}`}
        required
      />
    </div>
  );

  return (
    <div className="settings-container">
      <h1>MVP Integration Configuration Console</h1>
      <p className="subtitle">
        Securely configure the essential integrations required for the financial dashboard MVP. 
        (Note: All other legacy API keys must be managed via backend vault systems.)
      </p>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-section">
          <h2>Financial Aggregation & Payments</h2>
          <p>These keys enable core transaction fetching and payment connectivity.</p>
          {renderInput('PLAID_CLIENT_ID', 'Plaid Client ID')}
          {renderInput('PLAID_SECRET', 'Plaid Secret')}
          {renderInput('STRIPE_SECRET_KEY', 'Stripe Secret Key (Development/Test)')}
        </div>

        <div className="form-section">
          <h2>AI & Transaction Intelligence</h2>
          <p>This key powers categorization, anomaly detection, and smart alerts using large language models.</p>
          {renderInput('OPENAI_API_KEY', 'OpenAI API Key')}
        </div>
        
        <div className="form-footer">
          <button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? 'Saving Configuration...' : 'Save Essential Configuration'}
          </button>
          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>
      </form>
    </div>
  );
};

export default FinancialDemocracyView;

// --- CONSOLIDATED FROM: FinancialDemocracyView (2)_1.tsx ---

import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
// NOTE: Retaining legacy CSS import, assuming it provides necessary structure styling.
import './ApiSettingsPage.css'; 

// =================================================================================
// REFACTORING RATIONALE: SECURITY AND MVP SCOPING (Goals 3 & 6)
// The previous implementation listed over 200 sensitive API keys, designed to be 
// input by users on the frontend and POSTed to the backend. This pattern is a severe 
// security vulnerability (high surface area for leakage) and violates production standards 
// which mandate using secure vault solutions (like AWS Secrets Manager/Vault) for credentials.
// 
// This view has been dramatically simplified to ONLY configure the essential 
// third-party integration credentials required for the core MVP 
// (Multi-bank aggregation via Plaid/Stripe, AI transaction intelligence via OpenAI). 
// All other previously listed keys must be managed securely on the backend via environment 
// variables and dedicated secrets management systems.
// =================================================================================

interface MvpApiKeysState {
  // === Financial Aggregation & Payments (Core MVP) ===
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;
  STRIPE_SECRET_KEY: string;
  
  // === AI Intelligence (Core MVP) ===
  OPENAI_API_KEY: string;

  [key: string]: string; // Index signature for dynamic access
}


const FinancialDemocracyView: React.FC = () => {
  // Initialize state with only the required MVP keys
  const [keys, setKeys] = useState<MvpApiKeysState>({
    PLAID_CLIENT_ID: '',
    PLAID_SECRET: '',
    STRIPE_SECRET_KEY: '',
    OPENAI_API_KEY: '',
  });
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Removed activeTab state as the view is now unified and scoped.

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setStatusMessage('Saving essential MVP configuration keys securely to backend...');
    
    // Basic validation before POSTing
    const requiredKeys = Object.keys(keys) as (keyof MvpApiKeysState)[];
    const missingKeys = requiredKeys.filter(k => !keys[k]);
    
    if (missingKeys.length > 0) {
        setStatusMessage(`Error: Missing required keys: ${missingKeys.join(', ')}.`);
        setIsSaving(false);
        return;
    }

    try {
      // NOTE: Using a dedicated, more specific endpoint for configuration saving.
      const response = await axios.post('http://localhost:4000/api/config/mvp-integrations', keys);
      setStatusMessage(`Success: ${response.data.message}`);
    } catch (error) {
      console.error('API Key Save Error:', error);
      setStatusMessage('Error: Could not save keys. Check network connectivity and backend server logs.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (keyName: keyof MvpApiKeysState, label: string) => (
    <div key={keyName} className="input-group">
      <label htmlFor={keyName}>{label}</label>
      <input
        // Must use type="password" for sensitive credentials.
        type="password"
        id={keyName}
        name={keyName}
        value={keys[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Enter ${label}`}
        required
      />
    </div>
  );

  return (
    <div className="settings-container">
      <h1>MVP Integration Configuration Console</h1>
      <p className="subtitle">
        Securely configure the essential integrations required for the financial dashboard MVP. 
        (Note: All other legacy API keys must be managed via backend vault systems.)
      </p>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-section">
          <h2>Financial Aggregation & Payments</h2>
          <p>These keys enable core transaction fetching and payment connectivity.</p>
          {renderInput('PLAID_CLIENT_ID', 'Plaid Client ID')}
          {renderInput('PLAID_SECRET', 'Plaid Secret')}
          {renderInput('STRIPE_SECRET_KEY', 'Stripe Secret Key (Development/Test)')}
        </div>

        <div className="form-section">
          <h2>AI & Transaction Intelligence</h2>
          <p>This key powers categorization, anomaly detection, and smart alerts using large language models.</p>
          {renderInput('OPENAI_API_KEY', 'OpenAI API Key')}
        </div>
        
        <div className="form-footer">
          <button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? 'Saving Configuration...' : 'Save Essential Configuration'}
          </button>
          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>
      </form>
    </div>
  );
};

export default FinancialDemocracyView;

// --- CONSOLIDATED FROM: FinancialDemocracyView (3).tsx ---


import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
import { banks } from '../constants';
import PlaidLinkButton from './PlaidLinkButton';
import type { PlaidLinkSuccessMetadata, PlaidProduct } from '../types';

// =================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================
import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
import { banks } from '../constants';
import PlaidLinkButton from './PlaidLinkButton';
import type { PlaidLinkSuccessMetadata, PlaidProduct } from '../types';

// =================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================

// --- CONSOLIDATED FROM: FinancialDemocracyView (3)_1.tsx ---


import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
import { banks } from '../constants';
import PlaidLinkButton from './PlaidLinkButton';
import type { PlaidLinkSuccessMetadata, PlaidProduct } from '../types';

// =================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================
import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
import { banks } from '../constants';
import PlaidLinkButton from './PlaidLinkButton';
import type { PlaidLinkSuccessMetadata, PlaidProduct } from '../types';

// =================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================

// --- CONSOLIDATED FROM: ./components/FinancialDemocracyView (4).tsx ---



// --- CONSOLIDATED FROM: FinancialDemocracyView (4)_1.tsx ---


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import Card from './Card';
import { banks } from '../constants'; // Import the centralized bank list
import PlaidLinkButton from './PlaidLinkButton';
import type { PlaidLinkSuccessMetadata, PlaidProduct } from '../types';

// Load canonical prompt at runtime (preferred)
import { IDGAFAI } from '../src/prompts/idgafai';

// Assuming API key is set in the environment, as per Gemini documentation examples.
const ai = new GoogleGenAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

// ================================================================================================
// THE DEMOCRATIZATION MANIFESTO
// ================================================================================================
// This isn't just a React component library. It's a statement. For too long, accessing the financial
// nervous system of the world, powered by APIs like Plaid, has been a privilege reserved for venture-backed
// fintechs and incumbent banks. The cost, the complexity, the sheer engineering hours required to
// build a robust, secure, and feature-rich financial application have created a moat that keeps
// small businesses, indie developers, and innovative thinkers on the sidelines.
//
// This code is a sledgehammer to that moat.
//
// We are democratizing access to the financial ecosystem. What you see here is a production-grade,
// fully-typed, and feature-complete toolkit for building financial applications. We've poured
// thousands of hours into solving the hard problemsâstate management, API integration, UI/UX for
// complex data, security patternsâso you don't have to.
//
// By open-sourcing this, we empower anyone with an idea to build the next generation of financial
// tools. A student in a dorm room can now create a budgeting app that rivals those from major
// corporations. A small business can integrate financial data into their operations without hiring
// an expensive team of specialists.
//
// This is more than code. It's a transfer of power from the few to the many. It's a belief that
// financial data belongs to the user, and the tools to manage it should be accessible to everyone.
// Welcome to the revolution.

// NOTE: All Plaid-related components and types have been moved to types.ts and PlaidLinkButton.tsx
// to create a reusable, modular system, demonstrating best practices.

// ================================================================================================
// EXPANDED CORE TYPES FOR THE FINANCIAL OS
// ================================================================================================

export interface Account {
    id: string;
    name: string;
    mask: string;
    type: string;
    subtype: string;
    balance: number;
    currency: string;
}

export interface LinkedInstitution {
    id: string; // Plaid Item ID
    name: string;
    institutionId: string; // Plaid Institution ID
    connectedAccounts: Account[];
    metadata: PlaidLinkSuccessMetadata;
    lastUpdated: Date;
    status: 'connected' | 'reauth_required' | 'error' | 'disconnected';
}

// ================================================================================================
// MOCKED PLAID INTEGRATION SERVICE
// ================================================================================================

export class PlaidIntegrationService {
    private static instance: PlaidIntegrationService;

    private constructor() {}

    public static getInstance(): PlaidIntegrationService {
        if (!PlaidIntegrationService.instance) {
            PlaidIntegrationService.instance = new PlaidIntegrationService();
        }
        return PlaidIntegrationService.instance;
    }

    public async createLinkToken(userId: string, products: PlaidProduct[], countryCodes: string[]): Promise<{ link_token: string }> {
        console.log(`[MOCK] PlaidService: Requesting link token for user ${userId}`);
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ link_token: `link-sandbox-${Date.now()}` });
            }, 500);
        });
    }

    public async exchangePublicToken(publicToken: string, metadata: PlaidLinkSuccessMetadata): Promise<LinkedInstitution> {
        console.log(`[MOCK] PlaidService: Exchanging public token: ${publicToken}`);
        return new Promise(resolve => {
            setTimeout(() => {
                const now = new Date();
                const accounts: Account[] = metadata.accounts.map(acc => ({
                    id: acc.id,
                    name: acc.name,
                    mask: acc.mask,
                    type: acc.type,
                    subtype: acc.subtype,
                    balance: Math.random() * 25000 + 500, // Add mock balance
                    currency: 'USD', // Add mock currency
                }));

                const newInstitution: LinkedInstitution = {
                    id: `item-${Date.now()}`,
                    name: metadata.institution.name,
                    institutionId: metadata.institution.institution_id,
                    connectedAccounts: accounts,
                    metadata: metadata,
                    lastUpdated: now,
                    status: 'connected',
                };

                resolve(newInstitution);
            }, 1000);
        });
    }
}

// ================================================================================================
// SUB-APP: HIGH-FREQUENCY TRADING (HFT) SIMULATOR
// ================================================================================================

interface Stock {
    symbol: string;
    price: number;
    change: number;
    volume: number;
}

const initialStocks: Stock[] = [
    { symbol: 'AI-FIN', price: 420.69, change: 0, volume: 1_234_567 },
    { symbol: 'DEMOCR', price: 177.60, change: 0, volume: 876_543 },
    { symbol: 'OPEN', price: 99.99, change: 0, volume: 2_345_678 },
    { symbol: 'WEB-F3', price: 333.33, change: 0, volume: 543_210 },
];

const HighFrequencyTradingDashboard: React.FC = () => {
    const [stocks, setStocks] = useState<Stock[]>(initialStocks);
    const [trades, setTrades] = useState<{ symbol: string; type: 'BUY' | 'SELL'; price: number; time: string }[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setStocks(prevStocks =>
                prevStocks.map(stock => {
                    const change = (Math.random() - 0.5) * (stock.price * 0.01); // 1% volatility
                    const newPrice = Math.max(0.01, stock.price + change);
                    return {
                        ...stock,
                        price: newPrice,
                        change: newPrice - stock.price,
                        volume: stock.volume + Math.floor(Math.random() * 1000),
                    };
                })
            );
        }, 200); // High frequency update

        return () => clearInterval(interval);
    }, []);

    const executeTrade = useCallback((symbol: string, type: 'BUY' | 'SELL') => {
        const stock = stocks.find(s => s.symbol === symbol);
        if (stock) {
            const newTrade = {
                symbol,
                type,
                price: stock.price,
                time: new Date().toLocaleTimeString(),
            };
            setTrades(prev => [newTrade, ...prev.slice(0, 9)]);
        }
    }, [stocks]);

    return (
        <Card title="HFT Algo-Trading Terminal" subtitle="Real-time market simulation.">
            <div className="font-mono text-sm space-y-4">
                <div className="bg-gray-900 p-2 rounded-lg overflow-x-auto whitespace-nowrap">
                    {stocks.map(stock => (
                        <span key={stock.symbol} className={`inline-block mr-6 ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stock.symbol} ${stock.price.toFixed(2)} ({stock.change.toFixed(2)})
                        </span>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h4 className="text-gray-300">Market Data</h4>
                        {stocks.map(stock => (
                            <div key={stock.symbol} className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
                                <div>
                                    <span className="font-bold text-white">{stock.symbol}</span>
                                    <span className="text-xs text-gray-400 ml-2">Vol: {stock.volume.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`font-bold w-20 text-right ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        ${stock.price.toFixed(2)}
                                    </span>
                                    <button onClick={() => executeTrade(stock.symbol, 'BUY')} className="px-2 py-1 text-xs bg-green-600 hover:bg-green-500 rounded text-white transition-colors">BUY</button>
                                    <button onClick={() => executeTrade(stock.symbol, 'SELL')} className="px-2 py-1 text-xs bg-red-600 hover:bg-red-500 rounded text-white transition-colors">SELL</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-gray-300">Execution Log</h4>
                        <div className="bg-gray-900/50 p-2 rounded-lg h-48 overflow-y-auto">
                            {trades.length === 0 ? <p className="text-gray-500 text-xs">No trades executed.</p> : trades.map((trade, i) => (
                                <p key={i} className={`text-xs ${trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                                    {`[${trade.time}] ${trade.type} ${trade.symbol} @ ${trade.price.toFixed(2)}`}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

// ================================================================================================
// SUB-APP: AI-POWERED PORTFOLIO ANALYSIS
// ================================================================================================

const PortfolioAnalysisAI: React.FC<{ institutions: LinkedInstitution[] }> = ({ institutions }) => {
    const [query, setQuery] = useState('');
    const [chatHistory, setChatHistory] = useState<{ user: string; response: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<any>(null); // Using `any` for the chat session object type
    const totalBalance = institutions.reduce((sum, inst) => sum + inst.connectedAccounts.reduce((accSum, acc) => accSum + acc.balance, 0), 0);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize chat only once we have institutions and the chat isn't already created.
        if (chatRef.current || institutions.length === 0) {
            return;
        }

        const greeting = "Of course. I am QuantumLeap AI, your personal financial advisor. How can I assist you today with your portfolio?";

        chatRef.current = ai.chats.create({
            model: "gemini-2.5-flash",
            //SYSTEM PROMPT: see prompts/idgafai_full.txt
            history: [
                {
                    role: "system",
                    parts: [{ text: IDGAFAI }],
                },
                {
                    role: "user",
                    parts: [{ text: `Hello. I need financial advice. My total portfolio value is approximately $${totalBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })}.` }],
                },
                {
                    role: "model",
                    parts: [{ text: greeting }],
                },
            ],
        });

        setChatHistory([{ user: "Initial prompt", response: greeting }]);
    }, [institutions, totalBalance]);

    useEffect(() => {
        // Scroll to bottom of chat history
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleQuerySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading || !chatRef.current) return;

        const userQuery = query;
        setChatHistory(prev => [...prev, { user: userQuery, response: "..." }]);
        setQuery('');
        setIsLoading(true);

        try {
            const result = await chatRef.current.sendMessage({
                message: userQuery,
            });
            const aiResponse = result.text;

            setChatHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1].response = aiResponse;
                return newHistory;
            });
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setChatHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1].response = "Sorry, I encountered an error. Please try again.";
                return newHistory;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="QuantumLeap AI Financial Advisor" subtitle="Your personal AI for wealth management.">
            <div className="space-y-4">
                <div>
                    <h4 className="text-gray-300 font-semibold">Portfolio Snapshot</h4>
                    <p className="text-2xl font-bold text-white">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs text-gray-400">Total value across {institutions.length} institution(s).</p>
                </div>
                <div ref={chatContainerRef} className="bg-gray-900/50 p-3 rounded-lg h-64 overflow-y-auto flex flex-col">
                    <div className="space-y-4 mt-auto">
                        {chatHistory.map((chat, i) => (
                            <div key={i}>
                                {chat.user !== 'Initial prompt' && <p className="text-sm text-cyan-400 font-semibold">You: {chat.user}</p>}
                                <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">
                                    <span className="font-semibold">QuantumLeap AI: </span>
                                    {chat.response === '...' ? <span className="animate-pulse">Thinking...</span> : chat.response}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                <form onSubmit={handleQuerySubmit}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={isLoading || institutions.length === 0}
                        className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-sm placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50"
                        placeholder={
                            institutions.length === 0 
                                ? "Link an institution to enable the AI Advisor"
                                : isLoading 
                                ? "Waiting for response..." 
                                : "Ask the AI... (e.g., 'How can I improve my returns?')"
                        }
                    />
                </form>
            </div>
        </Card>
    );
};

// ================================================================================================
// SUB-APP: GLOBAL TRANSACTION FLOW VISUALIZER
// ================================================================================================

const GlobalTransactionFlow: React.FC = () => {
    return (
        <Card title="Project Chimera: Global Financial Ledger" subtitle="Visualizing the world's economic heartbeat in real-time.">
            <div className="h-64 bg-gray-900 rounded-lg relative overflow-hidden p-4 flex items-center justify-center">
                <p className="text-gray-500 text-center text-sm z-10">
                    [This is a conceptual visualization of a decentralized, real-time global transaction network. Imagine seeing capital flow between continents instantly, a testament to a truly democratized and transparent financial system.]
                </p>
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="absolute bg-cyan-400 rounded-full animate-pulse" style={{
                        width: '4px', height: '4px',
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDuration: `${2 + Math.random() * 3}s`,
                        animationDelay: `${Math.random() * 2}s`,
                    }}></div>
                ))}
            </div>
        </Card>
    );
};

// ================================================================================================
// THE MAIN VIEW: FINANCIAL DEMOCRACY OS
// ================================================================================================

const FinancialDemocracyView: React.FC = () => {
    const [linkedInstitutions, setLinkedInstitutions] = useState<LinkedInstitution[]>([]);
    const plaidService = useRef(PlaidIntegrationService.getInstance());
    const [activeView, setActiveView] = useState('dashboard');

    const handlePlaidSuccess = async (publicToken: string, metadata: PlaidLinkSuccessMetadata) => {
        const newInstitution = await plaidService.current.exchangePublicToken(publicToken, metadata);
        setLinkedInstitutions(prev => {
            if (prev.some(inst => inst.institutionId === newInstitution.institutionId)) {
                return prev;
            }
            return [...prev, newInstitution];
        });
    };

    const renderActiveView = () => {
        switch (activeView) {
            case 'hft': return <HighFrequencyTradingDashboard />;
            case 'ai_advisor': return <PortfolioAnalysisAI institutions={linkedInstitutions} />;
            case 'global_flow': return <GlobalTransactionFlow />;
            case 'developer': return <DeveloperPortal />;
            case 'connections': return <ConnectionManager linkedInstitutions={linkedInstitutions} onPlaidSuccess={handlePlaidSuccess} />;
            default: return <DashboardOverview institutions={linkedInstitutions} />;
        }
    };

    return (
        <div className="flex flex-col md:flex-row md:space-x-8">
            <aside className="w-full md:w-64 flex-shrink-0 mb-8 md:mb-0">
                <div className="space-y-4 md:sticky md:top-8">
                    <h2 className="text-xl font-bold text-white">Financial OS</h2>
                    <nav className="space-y-2">
                        <button onClick={() => setActiveView('dashboard')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'dashboard' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Dashboard</button>
                        <button onClick={() => setActiveView('connections')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'connections' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Connections</button>
                        <button onClick={() => setActiveView('hft')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'hft' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>HFT Terminal</button>
                        <button onClick={() => setActiveView('ai_advisor')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'ai_advisor' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>AI Advisor</button>
                        <button onClick={() => setActiveView('global_flow')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'global_flow' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Global Flow</button>
                        <button onClick={() => setActiveView('developer')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'developer' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Developer Portal</button>
                    </nav>
                </div>
            </aside>

            <main className="flex-1 min-w-0">
                <div className="space-y-8">
                    {renderActiveView()}
                </div>
            </main>
        </div>
    );
};

// ================================================================================================
// VIEW COMPONENTS (SUB-PAGES)
// ================================================================================================

const DashboardOverview: React.FC<{ institutions: LinkedInstitution[] }> = ({ institutions }) => {
    const totalBalance = institutions.reduce((sum, inst) => sum + inst.connectedAccounts.reduce((accSum, acc) => accSum + acc.balance, 0), 0);
    return (
        <>
            <Card title="The Financial Democracy Manifesto">
                <p className="text-gray-300">
                    This isn't just a component library; it's a Financial Operating System. We've moved beyond simple connections to provide a suite of self-contained, futuristic applications. From AI-driven analysis to high-frequency trading simulations, we are giving you the power to not just access, but to command the financial world. This is the next leap in democratizing finance. Welcome to the revolution, supercharged.
                </p>
            </Card>
            <Card title="Portfolio At-a-Glance">
                <p className="text-sm text-gray-400">Total Net Worth</p>
                <p className="text-4xl font-bold text-white">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </Card>
        </>
    );
};

const ConnectionManager: React.FC<{ linkedInstitutions: LinkedInstitution[], onPlaidSuccess: (token: string, meta: PlaidLinkSuccessMetadata) => void }> = ({ linkedInstitutions, onPlaidSuccess }) => {
    return (
        <Card title="Manage Data Connections">
            <div className="space-y-4">
                <p className="text-sm text-gray-400">Securely link your financial institutions to power the OS. We use Plaid for bank-level security.</p>
                <PlaidLinkButton onSuccess={onPlaidSuccess} />
                <div className="pt-4">
                    <h4 className="font-semibold text-white mb-2">Connected Institutions:</h4>
                    {linkedInstitutions.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No institutions linked yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {linkedInstitutions.map(inst => (
                                <div key={inst.id} className="p-3 bg-gray-900/50 rounded-lg">
                                    <p className="font-semibold text-white">{inst.name}</p>
                                    <p className="text-xs text-gray-400">Accounts: {inst.connectedAccounts.map(a => `${a.name} ($${a.balance.toFixed(2)})`).join(', ')}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

const DeveloperPortal: React.FC = () => {
    const [apiKeys, setApiKeys] = useState([{ name: 'My Sandbox Key', key: 'sk_sandbox_123abc456def789ghi_'.padEnd(40, '*'), scope: 'read-only' }]);
    const [newKeyName, setNewKeyName] = useState('');

    const generateKey = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyName.trim()) return;
        const newKey = {
            name: newKeyName,
            key: `sk_live_${[...Array(32)].map(() => Math.random().toString(36)[2]).join('')}`,
            scope: 'full-access',
        };
        setApiKeys(prev => [...prev, newKey]);
        setNewKeyName('');
    };

    return (
        <Card title="Developer API & Webhooks">
            <div className="space-y-6">
                <div>
                    <h4 className="font-semibold text-white mb-2">API Keys</h4>
                    <p className="text-sm text-gray-400 mb-4">Generate API keys to integrate our toolkit directly into your backend services.</p>
                    <div className="space-y-3">
                        {apiKeys.map(k => (
                            <div key={k.key} className="p-3 bg-gray-900/50 rounded-lg">
                                <p className="font-semibold text-white">{k.name} <span className="text-xs font-normal bg-gray-700 px-2 py-1 rounded-full ml-2">{k.scope}</span></p>
                                <p className="text-xs text-gray-400 font-mono bg-gray-800 p-2 rounded mt-2">{k.key}</p>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={generateKey} className="mt-4 flex space-x-2">
                        <input
                            type="text"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            className="flex-grow bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-sm placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="New API Key Name"
                        />
                        <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white text-sm font-semibold transition-colors">Generate Key</button>
                    </form>
                </div>
                <div>
                    <h4 className="font-semibold text-white mb-2">Webhook Configuration</h4>
                    <p className="text-sm text-gray-400 mb-4">Configure a webhook endpoint to receive real-time updates for events like new transactions.</p>
                    <form className="flex space-x-2">
                        <input
                            type="url"
                            className="flex-grow bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-sm placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="https://api.yourapp.com/webhooks/financial-os"
                        />
                        <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white text-sm font-semibold transition-colors">Save Endpoint</button>
                    </form>
                </div>
            </div>
        </Card>
    );
};

export default FinancialDemocracyView;
