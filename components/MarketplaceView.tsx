import React, { useContext, useState, useEffect, useReducer, useCallback, useMemo, FC, ChangeEvent, FormEvent, ReactNode } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import type { MarketplaceProduct, View } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

//================================================================================================
// TYPE DEFINITIONS
//================================================================================================

/**
 * Represents the author of an AI agent.
 */
export interface AgentAuthor {
    id: string;
    name: string;
    avatarUrl: string;
    profileUrl: string;
    verified: boolean;
    bio: string;
    agentsPublished: number;
}

/**
 * Represents a user review for an AI agent.
 */
export interface AgentReview {
    id: string;
    author: {
        name: string;
        avatarUrl: string;
    };
    rating: number; // 1-5
    comment: string;
    createdAt: Date;
    helpfulVotes: number;
}

/**
 * Represents the pricing model for an AI agent.
 */
export interface AgentPricing {
    type: 'one-time' | 'subscription' | 'free';
    amount: number; // in USD
    subscriptionInterval?: 'monthly' | 'yearly';
}

/**
 * Technical specifications for the agent.
 */
export interface AgentSpecs {
    version: string;
    releaseDate: Date;
    requiredApiVersion: string;
    dependencies: string[];
    supportedLanguages: string[];
    computeRequirements: {
        cpu: string;
        ram: string;
        gpu?: string;
    };
}

/**
 * Represents a single version in the agent's changelog.
 */
export interface AgentChangelogEntry {
    version: string;
    releaseDate: Date;
    changes: string[];
}

/**
 * Core interface for an AI Agent in the marketplace.
 */
export interface Agent {
    id: string;
    name: string;
    author: AgentAuthor;
    category: string;
    tags: string[];
    shortDescription: string;
    longDescription: string;
    imageUrl: string;
    rating: number; // average rating 1-5
    reviewCount: number;
    reviews: AgentReview[];
    pricing: AgentPricing;
    specs: AgentSpecs;
    changelog: AgentChangelogEntry[];
    downloads: number;
    createdAt: Date;
    updatedAt: Date;
    featured: boolean;
    documentationUrl: string;
    demoUrl?: string;
}

//================================================================================================
// MOCK DATA GENERATION
// This section simulates a real-world backend by providing extensive mock data.
//================================================================================================

const MOCK_AUTHORS: AgentAuthor[] = [
    { id: 'author-1', name: 'SynthCore Labs', avatarUrl: 'https://i.pravatar.cc/40?u=synthcore', profileUrl: '#', verified: true, bio: 'Pioneering AI for financial markets.', agentsPublished: 5 },
    { id: 'author-2', name: 'DataWeaver Inc.', avatarUrl: 'https://i.pravatar.cc/40?u=dataweaver', profileUrl: '#', verified: true, bio: 'Weaving intelligence from raw data.', agentsPublished: 8 },
    { id: 'author-3', name: 'LogicForge AI', avatarUrl: 'https://i.pravatar.cc/40?u=logicforge', profileUrl: '#', verified: false, bio: 'Crafting bespoke AI solutions for business automation.', agentsPublished: 3 },
    { id: 'author-4', name: 'QuantumLeap AI', avatarUrl: 'https://i.pravatar.cc/40?u=quantumleap', profileUrl: '#', verified: true, bio: 'Next-generation AI for complex problem solving.', agentsPublished: 12 },
    { id: 'author-5', name: 'Eva Neuro', avatarUrl: 'https://i.pravatar.cc/40?u=eva', profileUrl: '#', verified: false, bio: 'Independent researcher focusing on NLP agents.', agentsPublished: 2 },
];

const MOCK_CATEGORIES = ['Finance', 'Marketing', 'Data Analysis', 'Customer Support', 'Content Creation', 'Code Generation', 'Personal Assistant'];

const MOCK_TAGS = ['stocks', 'crypto', 'reporting', 'automation', 'seo', 'chat', 'email', 'analytics', 'python', 'api', 'research', 'summarization', 'forecasting'];

const MOCK_COMMENTS = [
    "This agent transformed our workflow. Highly recommended!",
    "Decent, but has a steep learning curve.",
    "A game-changer for our marketing team. The automation capabilities are top-notch.",
    "Could use more documentation, but the support team was helpful.",
    "It's good for the price, but lacks some advanced features.",
    "Incredible performance and very reliable. Has not failed us once.",
    "I found a few bugs, but the developer is very responsive and issues fixes quickly.",
    "The best agent in this category, hands down.",
    "Simple, effective, and does exactly what it promises.",
    "Overpriced for what it offers. There are better free alternatives.",
];

/**
 * A utility function to generate a large set of mock agents.
 * @param count The number of agents to generate.
 * @returns An array of mock `Agent` objects.
 */
export const generateMockAgents = (count: number): Agent[] => {
    const agents: Agent[] = [];
    for (let i = 1; i <= count; i++) {
        const author = MOCK_AUTHORS[i % MOCK_AUTHORS.length];
        const category = MOCK_CATEGORIES[i % MOCK_CATEGORIES.length];
        const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const reviews: AgentReview[] = Array.from({ length: Math.floor(Math.random() * 50) + 5 }, (_, k) => ({
            id: `review-${i}-${k}`,
            author: { name: `User ${k + 1}`, avatarUrl: `https://i.pravatar.cc/40?u=reviewuser${i}_${k}` },
            rating: Math.floor(Math.random() * 3) + 3, // 3, 4, or 5
            comment: MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)],
            createdAt: new Date(createdAt.getTime() + Math.random() * (Date.now() - createdAt.getTime())),
            helpfulVotes: Math.floor(Math.random() * 100),
        }));

        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        
        const pricingType = ['one-time', 'subscription', 'free'][i % 3] as 'one-time' | 'subscription' | 'free';
        const pricing: AgentPricing = {
            type: pricingType,
            amount: pricingType === 'free' ? 0 : (pricingType === 'one-time' ? Math.floor(Math.random() * 400) + 99 : Math.floor(Math.random() * 90) + 9),
            ...(pricingType === 'subscription' && { subscriptionInterval: ['monthly', 'yearly'][i % 2] as 'monthly' | 'yearly' })
        };
        
        const changelog: AgentChangelogEntry[] = [
            { version: '1.2.0', releaseDate: new Date(), changes: ['Added new API integration.', 'Improved performance by 20%.', 'Fixed minor UI bugs.'] },
            { version: '1.1.0', releaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), changes: ['Initial support for multi-language output.', 'Refactored core logic.'] },
            { version: '1.0.0', releaseDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), changes: ['Initial public release.'] },
        ];

        agents.push({
            id: `agent-${i}`,
            name: `${category} Master Agent ${i}`,
            author,
            category,
            tags: [...new Set(Array.from({ length: Math.floor(Math.random() * 3) + 2 }, () => MOCK_TAGS[Math.floor(Math.random() * MOCK_TAGS.length)]))],
            shortDescription: `An autonomous AI agent specializing in ${category.toLowerCase()} tasks and automation.`,
            longDescription: `This is a comprehensive description for the ${category} Master Agent ${i}. It leverages state-of-the-art machine learning models to provide unparalleled insights and automation capabilities. Whether you're a small business or a large enterprise, this agent can be configured to meet your specific needs, streamlining workflows and boosting productivity. It features a user-friendly interface for configuration and monitoring.`,
            imageUrl: `https://picsum.photos/seed/agent${i}/600/400`,
            rating: parseFloat(avgRating.toFixed(1)),
            reviewCount: reviews.length,
            reviews,
            pricing,
            specs: {
                version: '1.2.0',
                releaseDate: new Date(),
                requiredApiVersion: 'v2.1',
                dependencies: ['Node.js v18+', 'Python 3.9+', 'Docker'],
                supportedLanguages: ['English', 'Spanish', 'German'],
                computeRequirements: {
                    cpu: '4 cores',
                    ram: '16GB',
                    gpu: (i % 3 === 0) ? 'NVIDIA RTX 3080 or equivalent' : undefined,
                },
            },
            changelog,
            downloads: Math.floor(Math.random() * 10000) + 500,
            createdAt,
            updatedAt: new Date(createdAt.getTime() + Math.random() * (Date.now() - createdAt.getTime())),
            featured: i % 10 === 0,
            documentationUrl: '#',
            demoUrl: i % 5 === 0 ? '#' : undefined,
        });
    }
    return agents;
};

//================================================================================================
// STATE MANAGEMENT (useReducer)
//================================================================================================

export type FilterState = {
    searchQuery: string;
    categories: Set<string>;
    minRating: number;
    maxPrice: number;
    pricingTypes: Set<'one-time' | 'subscription' | 'free'>;
    tags: Set<string>;
    verifiedAuthor: boolean;
};

export type FilterAction =
    | { type: 'SET_SEARCH_QUERY'; payload: string }
    | { type: 'TOGGLE_CATEGORY'; payload: string }
    | { type: 'SET_MIN_RATING'; payload: number }
    | { type: 'SET_MAX_PRICE'; payload: number }
    | { type: 'TOGGLE_PRICING_TYPE'; payload: 'one-time' | 'subscription' | 'free' }
    | { type: 'TOGGLE_TAG'; payload: string }
    | { type: 'TOGGLE_VERIFIED_AUTHOR' }
    | { type: 'RESET_FILTERS' };

export const initialFilterState: FilterState = {
    searchQuery: '',
    categories: new Set(),
    minRating: 0,
    maxPrice: 500,
    pricingTypes: new Set(),
    tags: new Set(),
    verifiedAuthor: false,
};

export function filterReducer(state: FilterState, action: FilterAction): FilterState {
    switch (action.type) {
        case 'SET_SEARCH_QUERY':
            return { ...state, searchQuery: action.payload };
        case 'TOGGLE_CATEGORY': {
            const newCategories = new Set(state.categories);
            if (newCategories.has(action.payload)) {
                newCategories.delete(action.payload);
            } else {
                newCategories.add(action.payload);
            }
            return { ...state, categories: newCategories };
        }
        case 'SET_MIN_RATING':
            return { ...state, minRating: action.payload };
        case 'SET_MAX_PRICE':
            return { ...state, maxPrice: action.payload };
        case 'TOGGLE_PRICING_TYPE': {
            const newPricingTypes = new Set(state.pricingTypes);
            if (newPricingTypes.has(action.payload)) {
                newPricingTypes.delete(action.payload);
            } else {
                newPricingTypes.add(action.payload);
            }
            return { ...state, pricingTypes: newPricingTypes };
        }
        case 'TOGGLE_TAG': {
            const newTags = new Set(state.tags);
            if (newTags.has(action.payload)) {
                newTags.delete(action.payload);
            } else {
                newTags.add(action.payload);
            }
            return { ...state, tags: newTags };
        }
        case 'TOGGLE_VERIFIED_AUTHOR':
            return { ...state, verifiedAuthor: !state.verifiedAuthor };
        case 'RESET_FILTERS':
            return initialFilterState;
        default:
            return state;
    }
}

//================================================================================================
// HELPER & UTILITY COMPONENTS
//================================================================================================

const Star: FC<{ filled?: boolean; half?: boolean }> = ({ filled, half }) => {
    const starPath = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";
    
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20">
            <defs>
                {half && (
                    <linearGradient id="half-gradient">
                        <stop offset="50%" stopColor="currentColor" className="text-yellow-400" />
                        <stop offset="50%" stopColor="currentColor" className="text-gray-600" />
                    </linearGradient>
                )}
            </defs>
            <path d={starPath} fill={half ? "url(#half-gradient)" : "currentColor"} className={filled ? 'text-yellow-400' : 'text-gray-600'} />
        </svg>
    )
};

/**
 * A reusable component for rendering star ratings.
 */
export const StarRating: FC<{ rating: number; className?: string }> = ({ rating, className = '' }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <div className={`flex items-center text-yellow-400 ${className}`}>
            {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} filled />)}
            {halfStar && <Star half />}
            {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} />)}
        </div>
    );
};

/**
 * A simple loading spinner component.
 */
export const LoadingSpinner: FC = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
    </div>
);

/**
 * A component to display when no results are found.
 */
export const NoResults: FC<{ onReset: () => void }> = ({ onReset }) => (
    <div className="text-center py-16 px-4 bg-gray-800 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-white">No Agents Found</h3>
        <p className="mt-1 text-sm text-gray-400">
            We couldn't find any agents matching your criteria. Try adjusting your filters.
        </p>
        <div className="mt-6">
            <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
            >
                Reset Filters
            </button>
        </div>
    </div>
);

/**
 * A generic modal component.
 */
export const Modal: FC<{ isOpen: boolean; onClose: () => void; title: string; children: ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0" onClick={onClose}></div>
            <div className="relative bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-4xl sm:w-full">
                <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-700">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl leading-6 font-medium text-white" id="modal-title">
                            {title}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <span className="sr-only">Close</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="bg-gray-900 px-4 pt-5 pb-4 sm:p-6 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * Custom hook for managing pagination logic.
 */
export const usePagination = <T,>(items: T[], itemsPerPage: number) => {
    const [currentPage, setCurrentPage] = useState(1);
    const maxPage = Math.ceil(items.length / itemsPerPage);

    const currentData = useMemo(() => {
        const begin = (currentPage - 1) * itemsPerPage;
        const end = begin + itemsPerPage;
        return items.slice(begin, end);
    }, [items, currentPage, itemsPerPage]);

    const next = () => {
        setCurrentPage((page) => Math.min(page + 1, maxPage));
    };

    const prev = () => {
        setCurrentPage((page) => Math.max(page - 1, 1));
    };

    const jump = (page: number) => {
        const pageNumber = Math.max(1, page);
        setCurrentPage(Math.min(pageNumber, maxPage));
    };
    
    useEffect(() => {
        if(currentPage > maxPage && maxPage > 0) {
            setCurrentPage(maxPage);
        } else if (items.length > 0 && currentPage === 0) {
            setCurrentPage(1);
        }
    }, [items, maxPage, currentPage]);

    return { next, prev, jump, currentData, currentPage, maxPage };
};


//================================================================================================
// UI SUB-COMPONENTS
// These components make up the building blocks of the marketplace UI.
//================================================================================================

/**
 * The search bar component at the top of the marketplace.
 */
export const SearchBar: FC<{ query: string; onSearch: (query: string) => void }> = ({ query, onSearch }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
        <input
            type="text"
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
            placeholder="Search for agents by name, tag, or description..."
            className="block w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
        />
    </div>
);


/**
 * The sidebar containing all filtering options.
 */
export const FilterSidebar: FC<{ state: FilterState; dispatch: React.Dispatch<FilterAction> }> = ({ state, dispatch }) => {
    return (
        <aside className="w-full lg:w-1/4 xl:w-1/5 p-4 bg-gray-800/50 rounded-lg h-full self-start sticky top-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                <button
                    onClick={() => dispatch({ type: 'RESET_FILTERS' })}
                    className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                    Reset
                </button>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
                <h4 className="font-semibold text-gray-300 mb-2">Category</h4>
                {MOCK_CATEGORIES.map(category => (
                    <div key={category} className="flex items-center mb-1">
                        <input
                            id={`cat-${category}`}
                            type="checkbox"
                            checked={state.categories.has(category)}
                            onChange={() => dispatch({ type: 'TOGGLE_CATEGORY', payload: category })}
                            className="h-4 w-4 rounded border-gray-500 text-cyan-600 bg-gray-700 focus:ring-cyan-500"
                        />
                        <label htmlFor={`cat-${category}`} className="ml-2 text-sm text-gray-400">{category}</label>
                    </div>
                ))}
            </div>

            {/* Rating Filter */}
            <div className="mb-6">
                <h4 className="font-semibold text-gray-300 mb-2">Minimum Rating</h4>
                <div className="flex items-center space-x-2">
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={state.minRating}
                        onChange={(e) => dispatch({ type: 'SET_MIN_RATING', payload: parseFloat(e.target.value) })}
                        className="w-full"
                    />
                    <span className="text-sm text-gray-300 font-mono w-8 text-center">{state.minRating.toFixed(1)}</span>
                </div>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
                <h4 className="font-semibold text-gray-300 mb-2">Max Price</h4>
                <div className="flex items-center space-x-2">
                     <input
                        type="range"
                        min="0"
                        max="500"
                        step="10"
                        value={state.maxPrice}
                        onChange={(e) => dispatch({ type: 'SET_MAX_PRICE', payload: parseInt(e.target.value) })}
                        className="w-full"
                    />
                    <span className="text-sm text-gray-300 font-mono w-12 text-center">${state.maxPrice}</span>
                </div>
                <div className="mt-2 space-y-1">
                    {(['free', 'one-time', 'subscription'] as const).map(type => (
                        <div key={type} className="flex items-center">
                            <input
                                id={`price-${type}`}
                                type="checkbox"
                                checked={state.pricingTypes.has(type)}
                                onChange={() => dispatch({ type: 'TOGGLE_PRICING_TYPE', payload: type })}
                                className="h-4 w-4 rounded border-gray-500 text-cyan-600 bg-gray-700 focus:ring-cyan-500"
                            />
                            <label htmlFor={`price-${type}`} className="ml-2 text-sm text-gray-400 capitalize">{type}</label>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Author Filter */}
            <div className="mb-6">
                 <h4 className="font-semibold text-gray-300 mb-2">Author</h4>
                 <div className="flex items-center">
                     <input
                         id="verified-author"
                         type="checkbox"
                         checked={state.verifiedAuthor}
                         onChange={() => dispatch({ type: 'TOGGLE_VERIFIED_AUTHOR' })}
                         className="h-4 w-4 rounded border-gray-500 text-cyan-600 bg-gray-700 focus:ring-cyan-500"
                     />
                     <label htmlFor="verified-author" className="ml-2 text-sm text-gray-400">Verified Author Only</label>
                 </div>
            </div>

            {/* Tag Filter */}
            <div>
                 <h4 className="font-semibold text-gray-300 mb-2">Tags</h4>
                 <div className="flex flex-wrap gap-2">
                     {MOCK_TAGS.map(tag => (
                         <button
                            key={tag}
                            onClick={() => dispatch({ type: 'TOGGLE_TAG', payload: tag })}
                            className={`px-2 py-1 text-xs rounded-full border ${state.tags.has(tag) ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
                         >
                           {tag}
                         </button>
                     ))}
                 </div>
            </div>
        </aside>
    );
};

/**
 * A card representing a single agent in the grid view.
 */
export const AgentCard: FC<{ agent: Agent; onSelect: (agent: Agent) => void }> = ({ agent, onSelect }) => (
    <div 
        className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer flex flex-col"
        onClick={() => onSelect(agent)}
    >
        <img className="w-full h-40 object-cover bg-gray-700" src={agent.imageUrl} alt={agent.name} />
        <div className="p-4 flex flex-col flex-grow">
            <div className="flex justify-between items-start">
                <p className="text-sm text-cyan-400">{agent.category}</p>
                <div className="text-lg font-bold text-green-400">
                    {agent.pricing.type === 'free' ? 'Free' : `$${agent.pricing.amount}`}
                    {agent.pricing.type === 'subscription' && <span className="text-xs text-gray-400">/{agent.pricing.subscriptionInterval === 'monthly' ? 'mo' : 'yr'}</span>}
                </div>
            </div>
            <h3 className="text-lg font-semibold text-white mt-1">{agent.name}</h3>
            <div className="flex items-center mt-1">
                <img src={agent.author.avatarUrl} alt={agent.author.name} className="h-6 w-6 rounded-full mr-2" />
                <span className="text-sm text-gray-400">{agent.author.name}</span>
                {agent.author.verified && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-500 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44-1.22a.75.75 0 00-1.06 0L8.25 6.19 6.31 4.25a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.06 0l4.5-4.5a.75.75 0 000-1.06z" clipRule="evenodd" />
                    </svg>
                )}
            </div>
            <p className="text-sm text-gray-400 mt-2 flex-grow">{agent.shortDescription}</p>
            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                <div className="flex items-center">
                    <StarRating rating={agent.rating} />
                    <span className="text-xs text-gray-500 ml-2">({agent.reviewCount})</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 8.586V3a1 1 0 10-2 0v5.586L8.707 7.293zM3 11a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                    </svg>
                    {agent.downloads.toLocaleString()}
                </div>
            </div>
        </div>
    </div>
);

/**
 * The pagination controls for the agent grid.
 */
export const Pagination: FC<{ currentPage: number; maxPage: number; onJump: (page: number) => void }> = ({ currentPage, maxPage, onJump }) => {
    if (maxPage <= 1) return null;

    const pageNumbers: (number | '...')[] = [];
    if (maxPage <= 7) {
        for (let i = 1; i <= maxPage; i++) {
            pageNumbers.push(i);
        }
    } else {
        pageNumbers.push(1);
        if (currentPage > 3) {
            pageNumbers.push('...');
        }
        if (currentPage > 2) {
            pageNumbers.push(currentPage - 1);
        }
        if (currentPage > 1 && currentPage < maxPage) {
            pageNumbers.push(currentPage);
        }
        if (currentPage < maxPage - 1) {
            pageNumbers.push(currentPage + 1);
        }
        if (currentPage < maxPage - 2) {
            pageNumbers.push('...');
        }
        pageNumbers.push(maxPage);
    }

    return (
        <nav className="flex items-center justify-between py-3 text-white" aria-label="Pagination">
            <div className="hidden sm:block">
                <p className="text-sm text-gray-400">
                    Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{maxPage}</span>
                </p>
            </div>
            <div className="flex-1 flex justify-between sm:justify-end">
                <button
                    onClick={() => onJump(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <div className="hidden md:flex items-center mx-2">
                    {pageNumbers.map((page, index) =>
                        page === '...' ? (
                            <span key={index} className="px-4 py-2 text-sm">...</span>
                        ) : (
                            <button
                                key={index}
                                onClick={() => onJump(page as number)}
                                className={`px-4 py-2 border border-gray-600 text-sm font-medium rounded-md mx-1 ${currentPage === page ? 'bg-cyan-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>
                <button
                    onClick={() => onJump(currentPage + 1)}
                    disabled={currentPage === maxPage}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </nav>
    );
};

/**
 * A detailed view of a single agent, shown in a modal.
 */
export const AgentDetailModal: FC<{ agent: Agent | null; onClose: () => void }> = ({ agent, onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews' | 'changelog'>('overview');

    if (!agent) return null;

    const renderTabContent = () => {
        switch(activeTab) {
            case 'specs': return (
                <div className="space-y-4 text-gray-300">
                    <h4 className="text-lg font-semibold text-white">Technical Specifications</h4>
                    <ul className="list-disc list-inside bg-gray-800/50 p-4 rounded-md">
                        <li><strong>Version:</strong> {agent.specs.version} (Released on {agent.specs.releaseDate.toLocaleDateString()})</li>
                        <li><strong>Required API Version:</strong> {agent.specs.requiredApiVersion}</li>
                        <li><strong>Supported Languages:</strong> {agent.specs.supportedLanguages.join(', ')}</li>
                    </ul>
                    <h4 className="text-lg font-semibold text-white mt-4">Dependencies</h4>
                     <ul className="list-disc list-inside bg-gray-800/50 p-4 rounded-md">
                        {agent.specs.dependencies.map(dep => <li key={dep}>{dep}</li>)}
                    </ul>
                    <h4 className="text-lg font-semibold text-white mt-4">Compute Requirements</h4>
                     <ul className="list-disc list-inside bg-gray-800/50 p-4 rounded-md">
                        <li><strong>CPU:</strong> {agent.specs.computeRequirements.cpu}</li>
                        <li><strong>RAM:</strong> {agent.specs.computeRequirements.ram}</li>
                        {agent.specs.computeRequirements.gpu && <li><strong>GPU:</strong> {agent.specs.computeRequirements.gpu}</li>}
                    </ul>
                </div>
            );
            case 'reviews': return (
                <div>
                     <h4 className="text-lg font-semibold text-white mb-4">User Reviews ({agent.reviewCount})</h4>
                     <div className="space-y-6">
                        {agent.reviews.slice(0, 5).map(review => (
                            <div key={review.id} className="border-b border-gray-700 pb-4">
                                <div className="flex items-center mb-2">
                                    <img src={review.author.avatarUrl} alt={review.author.name} className="h-8 w-8 rounded-full mr-3" />
                                    <div>
                                        <p className="font-semibold text-white">{review.author.name}</p>
                                        <p className="text-xs text-gray-500">{review.createdAt.toLocaleDateString()}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <StarRating rating={review.rating} />
                                    </div>
                                </div>
                                <p className="text-gray-400">{review.comment}</p>
                                <p className="text-xs text-gray-500 mt-2">{review.helpfulVotes} people found this helpful.</p>
                            </div>
                        ))}
                     </div>
                </div>
            );
            case 'changelog': return (
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Version History</h4>
                    <div className="space-y-6">
                        {agent.changelog.map(entry => (
                            <div key={entry.version}>
                                <h5 className="font-semibold text-gray-200">Version {entry.version} <span className="text-sm font-normal text-gray-500">- {entry.releaseDate.toLocaleDateString()}</span></h5>
                                <ul className="list-disc list-inside text-gray-400 mt-2 pl-4">
                                    {entry.changes.map((change, i) => <li key={i}>{change}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            );
            case 'overview':
            default:
                 return <p className="text-gray-300 whitespace-pre-wrap">{agent.longDescription}</p>;
        }
    };
    
    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'specs', label: 'Specifications' },
        { id: 'reviews', label: `Reviews (${agent.reviewCount})` },
        { id: 'changelog', label: 'Changelog' },
    ] as const;


    return (
        <Modal isOpen={!!agent} onClose={onClose} title={agent.name}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="md:col-span-2">
                    <img src={agent.imageUrl} alt={agent.name} className="w-full h-64 object-cover rounded-lg bg-gray-700 mb-4" />
                    
                    {/* Tabs */}
                    <div className="border-b border-gray-700 mb-4">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`${
                                        activeTab === tab.id
                                            ? 'border-cyan-500 text-cyan-400'
                                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div>
                        {renderTabContent()}
                    </div>
                </div>

                {/* Right Column */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-green-400 mb-4">
                            {agent.pricing.type === 'free' ? 'Free' : `$${agent.pricing.amount}`}
                            {agent.pricing.type === 'subscription' && <span className="text-base text-gray-400">/{agent.pricing.subscriptionInterval === 'monthly' ? 'mo' : 'yr'}</span>}
                        </div>
                        <button className="w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded hover:bg-cyan-700 transition duration-300">
                           {agent.pricing.type === 'free' ? 'Download' : 'Purchase Agent'}
                        </button>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 space-y-2">
                        <div className="flex justify-between"><span>Version:</span> <span className="font-mono">{agent.specs.version}</span></div>
                        <div className="flex justify-between"><span>Updated:</span> <span>{agent.updatedAt.toLocaleDateString()}</span></div>
                        <div className="flex justify-between"><span>Category:</span> <span className="text-cyan-400">{agent.category}</span></div>
                        <div className="flex justify-between"><span>Downloads:</span> <span>{agent.downloads.toLocaleString()}</span></div>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">Author</h4>
                        <div className="flex items-center">
                            <img src={agent.author.avatarUrl} alt={agent.author.name} className="h-10 w-10 rounded-full mr-3" />
                            <div>
                               <div className="flex items-center">
                                    <p className="font-semibold text-white">{agent.author.name}</p>
                                     {agent.author.verified && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-500 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                           <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44-1.22a.75.75 0 00-1.06 0L8.25 6.19 6.31 4.25a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.06 0l4.5-4.5a.75.75 0 000-1.06z" clipRule="evenodd" />
                                       </svg>
                                    )}
                               </div>
                                <a href={agent.author.profileUrl} className="text-xs text-cyan-400 hover:underline">View Profile</a>
                            </div>
                        </div>
                         <p className="text-xs text-gray-400 mt-2">{agent.author.bio}</p>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {agent.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};


//================================================================================================
// MAIN COMPONENT
//================================================================================================

const AgentMarketplaceView: React.FC = () => {
    const [allAgents, setAllAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [filterState, dispatch] = useReducer(filterReducer, initialFilterState);

    const [sortBy, setSortBy] = useState<'rating' | 'newest' | 'downloads' | 'featured'>('featured');

    // Simulate fetching data from an API
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        // Simulate a network delay
        const timer = setTimeout(() => {
            try {
                const generatedAgents = generateMockAgents(150);
                setAllAgents(generatedAgents);
            } catch (e) {
                setError("Failed to load agent data.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, []);
    
    // Filtering and Sorting Logic
    const filteredAndSortedAgents = useMemo(() => {
        let processedAgents = allAgents.filter(agent => {
            const searchLower = filterState.searchQuery.toLowerCase();
            const nameMatch = agent.name.toLowerCase().includes(searchLower);
            const descMatch = agent.shortDescription.toLowerCase().includes(searchLower);
            const tagMatch = agent.tags.some(t => t.toLowerCase().includes(searchLower));
            const categoryMatch = filterState.categories.size === 0 || filterState.categories.has(agent.category);
            const ratingMatch = agent.rating >= filterState.minRating;
            const priceMatch = (agent.pricing.type === 'free' && filterState.maxPrice >= 0) || (agent.pricing.type !== 'free' && agent.pricing.amount <= filterState.maxPrice);
            const pricingTypeMatch = filterState.pricingTypes.size === 0 || filterState.pricingTypes.has(agent.pricing.type);
            const tagFilterMatch = filterState.tags.size === 0 || agent.tags.some(t => filterState.tags.has(t));
            const authorMatch = !filterState.verifiedAuthor || agent.author.verified;
            
            return (nameMatch || descMatch || tagMatch) && categoryMatch && ratingMatch && priceMatch && pricingTypeMatch && tagFilterMatch && authorMatch;
        });

        // Sorting
        switch (sortBy) {
            case 'featured':
                processedAgents.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating);
                break;
            case 'rating':
                processedAgents.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                processedAgents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                break;
            case 'downloads':
                processedAgents.sort((a, b) => b.downloads - a.downloads);
                break;
        }

        return processedAgents;
    }, [allAgents, filterState, sortBy]);

    const { currentData, currentPage, maxPage, jump } = usePagination(filteredAndSortedAgents, 12);

    const handleSearch = useCallback((query: string) => {
        dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
        jump(1);
    }, [jump]);

    const handleResetFilters = useCallback(() => {
        dispatch({ type: 'RESET_FILTERS' });
        jump(1);
    }, [jump]);

    return (
        <div className="space-y-6">
            <Card title="AI Agent Marketplace" padding="none">
                <div className="p-6 border-b border-gray-700">
                     <p className="text-gray-400 mb-4">Discover, purchase, and deploy autonomous AI agents for various financial and business tasks.</p>
                     <SearchBar query={filterState.searchQuery} onSearch={handleSearch} />
                </div>
                <div className="flex flex-col lg:flex-row">
                    <FilterSidebar state={filterState} dispatch={dispatch} />
                    <main className="w-full lg:w-3/4 xl:w-4/5 p-4">
                        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                            <p className="text-gray-400">Showing {filteredAndSortedAgents.length} agents</p>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-300">Sort by:</span>
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                    className="bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="newest">Newest</option>
                                    <option value="downloads">Most Popular</option>
                                </select>
                            </div>
                        </div>

                        {isLoading ? (
                           <LoadingSpinner />
                        ) : error ? (
                            <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>
                        ) : currentData.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {currentData.map(agent => (
                                        <AgentCard key={agent.id} agent={agent} onSelect={setSelectedAgent} />
                                    ))}
                                </div>
                                <Pagination currentPage={currentPage} maxPage={maxPage} onJump={jump} />
                            </>
                        ) : (
                            <NoResults onReset={handleResetFilters} />
                        )}
                    </main>
                </div>
            </Card>

            <AgentDetailModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
        </div>
    );
};

export default AgentMarketplaceView;

// --- CONSOLIDATED FROM: MarketplaceView (1).tsx ---

import React, { useContext, useState, useEffect, useReducer, useCallback, useMemo, FC, ChangeEvent, FormEvent, ReactNode } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import type { MarketplaceProduct, View } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

//================================================================================================
// TYPE DEFINITIONS
//================================================================================================

/**
 * Represents the author of an AI agent.
 */
export interface AgentAuthor {
    id: string;
    name: string;
    avatarUrl: string;
    profileUrl: string;
    verified: boolean;
    bio: string;
    agentsPublished: number;
}

/**
 * Represents a user review for an AI agent.
 */
export interface AgentReview {
    id: string;
    author: {
        name: string;
        avatarUrl: string;
    };
    rating: number; // 1-5
    comment: string;
    createdAt: Date;
    helpfulVotes: number;
}

/**
 * Represents the pricing model for an AI agent.
 */
export interface AgentPricing {
    type: 'one-time' | 'subscription' | 'free';
    amount: number; // in USD
    subscriptionInterval?: 'monthly' | 'yearly';
}

/**
 * Technical specifications for the agent.
 */
export interface AgentSpecs {
    version: string;
    releaseDate: Date;
    requiredApiVersion: string;
    dependencies: string[];
    supportedLanguages: string[];
    computeRequirements: {
        cpu: string;
        ram: string;
        gpu?: string;
    };
}

/**
 * Represents a single version in the agent's changelog.
 */
export interface AgentChangelogEntry {
    version: string;
    releaseDate: Date;
    changes: string[];
}

/**
 * Core interface for an AI Agent in the marketplace.
 */
export interface Agent {
    id: string;
    name: string;
    author: AgentAuthor;
    category: string;
    tags: string[];
    shortDescription: string;
    longDescription: string;
    imageUrl: string;
    rating: number; // average rating 1-5
    reviewCount: number;
    reviews: AgentReview[];
    pricing: AgentPricing;
    specs: AgentSpecs;
    changelog: AgentChangelogEntry[];
    downloads: number;
    createdAt: Date;
    updatedAt: Date;
    featured: boolean;
    documentationUrl: string;
    demoUrl?: string;
}

//================================================================================================
// MOCK DATA GENERATION
// This section simulates a real-world backend by providing extensive mock data.
//================================================================================================

const MOCK_AUTHORS: AgentAuthor[] = [
    { id: 'author-1', name: 'SynthCore Labs', avatarUrl: 'https://i.pravatar.cc/40?u=synthcore', profileUrl: '#', verified: true, bio: 'Pioneering AI for financial markets.', agentsPublished: 5 },
    { id: 'author-2', name: 'DataWeaver Inc.', avatarUrl: 'https://i.pravatar.cc/40?u=dataweaver', profileUrl: '#', verified: true, bio: 'Weaving intelligence from raw data.', agentsPublished: 8 },
    { id: 'author-3', name: 'LogicForge AI', avatarUrl: 'https://i.pravatar.cc/40?u=logicforge', profileUrl: '#', verified: false, bio: 'Crafting bespoke AI solutions for business automation.', agentsPublished: 3 },
    { id: 'author-4', name: 'QuantumLeap AI', avatarUrl: 'https://i.pravatar.cc/40?u=quantumleap', profileUrl: '#', verified: true, bio: 'Next-generation AI for complex problem solving.', agentsPublished: 12 },
    { id: 'author-5', name: 'Eva Neuro', avatarUrl: 'https://i.pravatar.cc/40?u=eva', profileUrl: '#', verified: false, bio: 'Independent researcher focusing on NLP agents.', agentsPublished: 2 },
];

const MOCK_CATEGORIES = ['Finance', 'Marketing', 'Data Analysis', 'Customer Support', 'Content Creation', 'Code Generation', 'Personal Assistant'];

const MOCK_TAGS = ['stocks', 'crypto', 'reporting', 'automation', 'seo', 'chat', 'email', 'analytics', 'python', 'api', 'research', 'summarization', 'forecasting'];

const MOCK_COMMENTS = [
    "This agent transformed our workflow. Highly recommended!",
    "Decent, but has a steep learning curve.",
    "A game-changer for our marketing team. The automation capabilities are top-notch.",
    "Could use more documentation, but the support team was helpful.",
    "It's good for the price, but lacks some advanced features.",
    "Incredible performance and very reliable. Has not failed us once.",
    "I found a few bugs, but the developer is very responsive and issues fixes quickly.",
    "The best agent in this category, hands down.",
    "Simple, effective, and does exactly what it promises.",
    "Overpriced for what it offers. There are better free alternatives.",
];

/**
 * A utility function to generate a large set of mock agents.
 * @param count The number of agents to generate.
 * @returns An array of mock `Agent` objects.
 */
export const generateMockAgents = (count: number): Agent[] => {
    const agents: Agent[] = [];
    for (let i = 1; i <= count; i++) {
        const author = MOCK_AUTHORS[i % MOCK_AUTHORS.length];
        const category = MOCK_CATEGORIES[i % MOCK_CATEGORIES.length];
        const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const reviews: AgentReview[] = Array.from({ length: Math.floor(Math.random() * 50) + 5 }, (_, k) => ({
            id: `review-${i}-${k}`,
            author: { name: `User ${k + 1}`, avatarUrl: `https://i.pravatar.cc/40?u=reviewuser${i}_${k}` },
            rating: Math.floor(Math.random() * 3) + 3, // 3, 4, or 5
            comment: MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)],
            createdAt: new Date(createdAt.getTime() + Math.random() * (Date.now() - createdAt.getTime())),
            helpfulVotes: Math.floor(Math.random() * 100),
        }));

        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        
        const pricingType = ['one-time', 'subscription', 'free'][i % 3] as 'one-time' | 'subscription' | 'free';
        const pricing: AgentPricing = {
            type: pricingType,
            amount: pricingType === 'free' ? 0 : (pricingType === 'one-time' ? Math.floor(Math.random() * 400) + 99 : Math.floor(Math.random() * 90) + 9),
            ...(pricingType === 'subscription' && { subscriptionInterval: ['monthly', 'yearly'][i % 2] as 'monthly' | 'yearly' })
        };
        
        const changelog: AgentChangelogEntry[] = [
            { version: '1.2.0', releaseDate: new Date(), changes: ['Added new API integration.', 'Improved performance by 20%.', 'Fixed minor UI bugs.'] },
            { version: '1.1.0', releaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), changes: ['Initial support for multi-language output.', 'Refactored core logic.'] },
            { version: '1.0.0', releaseDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), changes: ['Initial public release.'] },
        ];

        agents.push({
            id: `agent-${i}`,
            name: `${category} Master Agent ${i}`,
            author,
            category,
            tags: [...new Set(Array.from({ length: Math.floor(Math.random() * 3) + 2 }, () => MOCK_TAGS[Math.floor(Math.random() * MOCK_TAGS.length)]))],
            shortDescription: `An autonomous AI agent specializing in ${category.toLowerCase()} tasks and automation.`,
            longDescription: `This is a comprehensive description for the ${category} Master Agent ${i}. It leverages state-of-the-art machine learning models to provide unparalleled insights and automation capabilities. Whether you're a small business or a large enterprise, this agent can be configured to meet your specific needs, streamlining workflows and boosting productivity. It features a user-friendly interface for configuration and monitoring.`,
            imageUrl: `https://picsum.photos/seed/agent${i}/600/400`,
            rating: parseFloat(avgRating.toFixed(1)),
            reviewCount: reviews.length,
            reviews,
            pricing,
            specs: {
                version: '1.2.0',
                releaseDate: new Date(),
                requiredApiVersion: 'v2.1',
                dependencies: ['Node.js v18+', 'Python 3.9+', 'Docker'],
                supportedLanguages: ['English', 'Spanish', 'German'],
                computeRequirements: {
                    cpu: '4 cores',
                    ram: '16GB',
                    gpu: (i % 3 === 0) ? 'NVIDIA RTX 3080 or equivalent' : undefined,
                },
            },
            changelog,
            downloads: Math.floor(Math.random() * 10000) + 500,
            createdAt,
            updatedAt: new Date(createdAt.getTime() + Math.random() * (Date.now() - createdAt.getTime())),
            featured: i % 10 === 0,
            documentationUrl: '#',
            demoUrl: i % 5 === 0 ? '#' : undefined,
        });
    }
    return agents;
};

//================================================================================================
// STATE MANAGEMENT (useReducer)
//================================================================================================

export type FilterState = {
    searchQuery: string;
    categories: Set<string>;
    minRating: number;
    maxPrice: number;
    pricingTypes: Set<'one-time' | 'subscription' | 'free'>;
    tags: Set<string>;
    verifiedAuthor: boolean;
};

export type FilterAction =
    | { type: 'SET_SEARCH_QUERY'; payload: string }
    | { type: 'TOGGLE_CATEGORY'; payload: string }
    | { type: 'SET_MIN_RATING'; payload: number }
    | { type: 'SET_MAX_PRICE'; payload: number }
    | { type: 'TOGGLE_PRICING_TYPE'; payload: 'one-time' | 'subscription' | 'free' }
    | { type: 'TOGGLE_TAG'; payload: string }
    | { type: 'TOGGLE_VERIFIED_AUTHOR' }
    | { type: 'RESET_FILTERS' };

export const initialFilterState: FilterState = {
    searchQuery: '',
    categories: new Set(),
    minRating: 0,
    maxPrice: 500,
    pricingTypes: new Set(),
    tags: new Set(),
    verifiedAuthor: false,
};

export function filterReducer(state: FilterState, action: FilterAction): FilterState {
    switch (action.type) {
        case 'SET_SEARCH_QUERY':
            return { ...state, searchQuery: action.payload };
        case 'TOGGLE_CATEGORY': {
            const newCategories = new Set(state.categories);
            if (newCategories.has(action.payload)) {
                newCategories.delete(action.payload);
            } else {
                newCategories.add(action.payload);
            }
            return { ...state, categories: newCategories };
        }
        case 'SET_MIN_RATING':
            return { ...state, minRating: action.payload };
        case 'SET_MAX_PRICE':
            return { ...state, maxPrice: action.payload };
        case 'TOGGLE_PRICING_TYPE': {
            const newPricingTypes = new Set(state.pricingTypes);
            if (newPricingTypes.has(action.payload)) {
                newPricingTypes.delete(action.payload);
            } else {
                newPricingTypes.add(action.payload);
            }
            return { ...state, pricingTypes: newPricingTypes };
        }
        case 'TOGGLE_TAG': {
            const newTags = new Set(state.tags);
            if (newTags.has(action.payload)) {
                newTags.delete(action.payload);
            } else {
                newTags.add(action.payload);
            }
            return { ...state, tags: newTags };
        }
        case 'TOGGLE_VERIFIED_AUTHOR':
            return { ...state, verifiedAuthor: !state.verifiedAuthor };
        case 'RESET_FILTERS':
            return initialFilterState;
        default:
            return state;
    }
}

//================================================================================================
// HELPER & UTILITY COMPONENTS
//================================================================================================

const Star: FC<{ filled?: boolean; half?: boolean }> = ({ filled, half }) => {
    const starPath = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";
    
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20">
            <defs>
                {half && (
                    <linearGradient id="half-gradient">
                        <stop offset="50%" stopColor="currentColor" className="text-yellow-400" />
                        <stop offset="50%" stopColor="currentColor" className="text-gray-600" />
                    </linearGradient>
                )}
            </defs>
            <path d={starPath} fill={half ? "url(#half-gradient)" : "currentColor"} className={filled ? 'text-yellow-400' : 'text-gray-600'} />
        </svg>
    )
};

/**
 * A reusable component for rendering star ratings.
 */
export const StarRating: FC<{ rating: number; className?: string }> = ({ rating, className = '' }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <div className={`flex items-center text-yellow-400 ${className}`}>
            {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} filled />)}
            {halfStar && <Star half />}
            {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} />)}
        </div>
    );
};

/**
 * A simple loading spinner component.
 */
export const LoadingSpinner: FC = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
    </div>
);

/**
 * A component to display when no results are found.
 */
export const NoResults: FC<{ onReset: () => void }> = ({ onReset }) => (
    <div className="text-center py-16 px-4 bg-gray-800 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-white">No Agents Found</h3>
        <p className="mt-1 text-sm text-gray-400">
            We couldn't find any agents matching your criteria. Try adjusting your filters.
        </p>
        <div className="mt-6">
            <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
            >
                Reset Filters
            </button>
        </div>
    </div>
);

/**
 * A generic modal component.
 */
export const Modal: FC<{ isOpen: boolean; onClose: () => void; title: string; children: ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0" onClick={onClose}></div>
            <div className="relative bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-4xl sm:w-full">
                <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-700">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl leading-6 font-medium text-white" id="modal-title">
                            {title}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <span className="sr-only">Close</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="bg-gray-900 px-4 pt-5 pb-4 sm:p-6 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * Custom hook for managing pagination logic.
 */
export const usePagination = <T,>(items: T[], itemsPerPage: number) => {
    const [currentPage, setCurrentPage] = useState(1);
    const maxPage = Math.ceil(items.length / itemsPerPage);

    const currentData = useMemo(() => {
        const begin = (currentPage - 1) * itemsPerPage;
        const end = begin + itemsPerPage;
        return items.slice(begin, end);
    }, [items, currentPage, itemsPerPage]);

    const next = () => {
        setCurrentPage((page) => Math.min(page + 1, maxPage));
    };

    const prev = () => {
        setCurrentPage((page) => Math.max(page - 1, 1));
    };

    const jump = (page: number) => {
        const pageNumber = Math.max(1, page);
        setCurrentPage(Math.min(pageNumber, maxPage));
    };
    
    useEffect(() => {
        if(currentPage > maxPage && maxPage > 0) {
            setCurrentPage(maxPage);
        } else if (items.length > 0 && currentPage === 0) {
            setCurrentPage(1);
        }
    }, [items, maxPage, currentPage]);

    return { next, prev, jump, currentData, currentPage, maxPage };
};


//================================================================================================
// UI SUB-COMPONENTS
// These components make up the building blocks of the marketplace UI.
//================================================================================================

/**
 * The search bar component at the top of the marketplace.
 */
export const SearchBar: FC<{ query: string; onSearch: (query: string) => void }> = ({ query, onSearch }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
        <input
            type="text"
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
            placeholder="Search for agents by name, tag, or description..."
            className="block w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
        />
    </div>
);


/**
 * The sidebar containing all filtering options.
 */
export const FilterSidebar: FC<{ state: FilterState; dispatch: React.Dispatch<FilterAction> }> = ({ state, dispatch }) => {
    return (
        <aside className="w-full lg:w-1/4 xl:w-1/5 p-4 bg-gray-800/50 rounded-lg h-full self-start sticky top-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                <button
                    onClick={() => dispatch({ type: 'RESET_FILTERS' })}
                    className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                    Reset
                </button>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
                <h4 className="font-semibold text-gray-300 mb-2">Category</h4>
                {MOCK_CATEGORIES.map(category => (
                    <div key={category} className="flex items-center mb-1">
                        <input
                            id={`cat-${category}`}
                            type="checkbox"
                            checked={state.categories.has(category)}
                            onChange={() => dispatch({ type: 'TOGGLE_CATEGORY', payload: category })}
                            className="h-4 w-4 rounded border-gray-500 text-cyan-600 bg-gray-700 focus:ring-cyan-500"
                        />
                        <label htmlFor={`cat-${category}`} className="ml-2 text-sm text-gray-400">{category}</label>
                    </div>
                ))}
            </div>

            {/* Rating Filter */}
            <div className="mb-6">
                <h4 className="font-semibold text-gray-300 mb-2">Minimum Rating</h4>
                <div className="flex items-center space-x-2">
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={state.minRating}
                        onChange={(e) => dispatch({ type: 'SET_MIN_RATING', payload: parseFloat(e.target.value) })}
                        className="w-full"
                    />
                    <span className="text-sm text-gray-300 font-mono w-8 text-center">{state.minRating.toFixed(1)}</span>
                </div>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
                <h4 className="font-semibold text-gray-300 mb-2">Max Price</h4>
                <div className="flex items-center space-x-2">
                     <input
                        type="range"
                        min="0"
                        max="500"
                        step="10"
                        value={state.maxPrice}
                        onChange={(e) => dispatch({ type: 'SET_MAX_PRICE', payload: parseInt(e.target.value) })}
                        className="w-full"
                    />
                    <span className="text-sm text-gray-300 font-mono w-12 text-center">${state.maxPrice}</span>
                </div>
                <div className="mt-2 space-y-1">
                    {(['free', 'one-time', 'subscription'] as const).map(type => (
                        <div key={type} className="flex items-center">
                            <input
                                id={`price-${type}`}
                                type="checkbox"
                                checked={state.pricingTypes.has(type)}
                                onChange={() => dispatch({ type: 'TOGGLE_PRICING_TYPE', payload: type })}
                                className="h-4 w-4 rounded border-gray-500 text-cyan-600 bg-gray-700 focus:ring-cyan-500"
                            />
                            <label htmlFor={`price-${type}`} className="ml-2 text-sm text-gray-400 capitalize">{type}</label>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Author Filter */}
            <div className="mb-6">
                 <h4 className="font-semibold text-gray-300 mb-2">Author</h4>
                 <div className="flex items-center">
                     <input
                         id="verified-author"
                         type="checkbox"
                         checked={state.verifiedAuthor}
                         onChange={() => dispatch({ type: 'TOGGLE_VERIFIED_AUTHOR' })}
                         className="h-4 w-4 rounded border-gray-500 text-cyan-600 bg-gray-700 focus:ring-cyan-500"
                     />
                     <label htmlFor="verified-author" className="ml-2 text-sm text-gray-400">Verified Author Only</label>
                 </div>
            </div>

            {/* Tag Filter */}
            <div>
                 <h4 className="font-semibold text-gray-300 mb-2">Tags</h4>
                 <div className="flex flex-wrap gap-2">
                     {MOCK_TAGS.map(tag => (
                         <button
                            key={tag}
                            onClick={() => dispatch({ type: 'TOGGLE_TAG', payload: tag })}
                            className={`px-2 py-1 text-xs rounded-full border ${state.tags.has(tag) ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
                         >
                           {tag}
                         </button>
                     ))}
                 </div>
            </div>
        </aside>
    );
};

/**
 * A card representing a single agent in the grid view.
 */
export const AgentCard: FC<{ agent: Agent; onSelect: (agent: Agent) => void }> = ({ agent, onSelect }) => (
    <div 
        className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer flex flex-col"
        onClick={() => onSelect(agent)}
    >
        <img className="w-full h-40 object-cover bg-gray-700" src={agent.imageUrl} alt={agent.name} />
        <div className="p-4 flex flex-col flex-grow">
            <div className="flex justify-between items-start">
                <p className="text-sm text-cyan-400">{agent.category}</p>
                <div className="text-lg font-bold text-green-400">
                    {agent.pricing.type === 'free' ? 'Free' : `$${agent.pricing.amount}`}
                    {agent.pricing.type === 'subscription' && <span className="text-xs text-gray-400">/{agent.pricing.subscriptionInterval === 'monthly' ? 'mo' : 'yr'}</span>}
                </div>
            </div>
            <h3 className="text-lg font-semibold text-white mt-1">{agent.name}</h3>
            <div className="flex items-center mt-1">
                <img src={agent.author.avatarUrl} alt={agent.author.name} className="h-6 w-6 rounded-full mr-2" />
                <span className="text-sm text-gray-400">{agent.author.name}</span>
                {agent.author.verified && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-500 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44-1.22a.75.75 0 00-1.06 0L8.25 6.19 6.31 4.25a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.06 0l4.5-4.5a.75.75 0 000-1.06z" clipRule="evenodd" />
                    </svg>
                )}
            </div>
            <p className="text-sm text-gray-400 mt-2 flex-grow">{agent.shortDescription}</p>
            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                <div className="flex items-center">
                    <StarRating rating={agent.rating} />
                    <span className="text-xs text-gray-500 ml-2">({agent.reviewCount})</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 8.586V3a1 1 0 10-2 0v5.586L8.707 7.293zM3 11a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                    </svg>
                    {agent.downloads.toLocaleString()}
                </div>
            </div>
        </div>
    </div>
);

/**
 * The pagination controls for the agent grid.
 */
export const Pagination: FC<{ currentPage: number; maxPage: number; onJump: (page: number) => void }> = ({ currentPage, maxPage, onJump }) => {
    if (maxPage <= 1) return null;

    const pageNumbers: (number | '...')[] = [];
    if (maxPage <= 7) {
        for (let i = 1; i <= maxPage; i++) {
            pageNumbers.push(i);
        }
    } else {
        pageNumbers.push(1);
        if (currentPage > 3) {
            pageNumbers.push('...');
        }
        if (currentPage > 2) {
            pageNumbers.push(currentPage - 1);
        }
        if (currentPage > 1 && currentPage < maxPage) {
            pageNumbers.push(currentPage);
        }
        if (currentPage < maxPage - 1) {
            pageNumbers.push(currentPage + 1);
        }
        if (currentPage < maxPage - 2) {
            pageNumbers.push('...');
        }
        pageNumbers.push(maxPage);
    }

    return (
        <nav className="flex items-center justify-between py-3 text-white" aria-label="Pagination">
            <div className="hidden sm:block">
                <p className="text-sm text-gray-400">
                    Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{maxPage}</span>
                </p>
            </div>
            <div className="flex-1 flex justify-between sm:justify-end">
                <button
                    onClick={() => onJump(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <div className="hidden md:flex items-center mx-2">
                    {pageNumbers.map((page, index) =>
                        page === '...' ? (
                            <span key={index} className="px-4 py-2 text-sm">...</span>
                        ) : (
                            <button
                                key={index}
                                onClick={() => onJump(page as number)}
                                className={`px-4 py-2 border border-gray-600 text-sm font-medium rounded-md mx-1 ${currentPage === page ? 'bg-cyan-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>
                <button
                    onClick={() => onJump(currentPage + 1)}
                    disabled={currentPage === maxPage}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </nav>
    );
};

/**
 * A detailed view of a single agent, shown in a modal.
 */
export const AgentDetailModal: FC<{ agent: Agent | null; onClose: () => void }> = ({ agent, onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews' | 'changelog'>('overview');

    if (!agent) return null;

    const renderTabContent = () => {
        switch(activeTab) {
            case 'specs': return (
                <div className="space-y-4 text-gray-300">
                    <h4 className="text-lg font-semibold text-white">Technical Specifications</h4>
                    <ul className="list-disc list-inside bg-gray-800/50 p-4 rounded-md">
                        <li><strong>Version:</strong> {agent.specs.version} (Released on {agent.specs.releaseDate.toLocaleDateString()})</li>
                        <li><strong>Required API Version:</strong> {agent.specs.requiredApiVersion}</li>
                        <li><strong>Supported Languages:</strong> {agent.specs.supportedLanguages.join(', ')}</li>
                    </ul>
                    <h4 className="text-lg font-semibold text-white mt-4">Dependencies</h4>
                     <ul className="list-disc list-inside bg-gray-800/50 p-4 rounded-md">
                        {agent.specs.dependencies.map(dep => <li key={dep}>{dep}</li>)}
                    </ul>
                    <h4 className="text-lg font-semibold text-white mt-4">Compute Requirements</h4>
                     <ul className="list-disc list-inside bg-gray-800/50 p-4 rounded-md">
                        <li><strong>CPU:</strong> {agent.specs.computeRequirements.cpu}</li>
                        <li><strong>RAM:</strong> {agent.specs.computeRequirements.ram}</li>
                        {agent.specs.computeRequirements.gpu && <li><strong>GPU:</strong> {agent.specs.computeRequirements.gpu}</li>}
                    </ul>
                </div>
            );
            case 'reviews': return (
                <div>
                     <h4 className="text-lg font-semibold text-white mb-4">User Reviews ({agent.reviewCount})</h4>
                     <div className="space-y-6">
                        {agent.reviews.slice(0, 5).map(review => (
                            <div key={review.id} className="border-b border-gray-700 pb-4">
                                <div className="flex items-center mb-2">
                                    <img src={review.author.avatarUrl} alt={review.author.name} className="h-8 w-8 rounded-full mr-3" />
                                    <div>
                                        <p className="font-semibold text-white">{review.author.name}</p>
                                        <p className="text-xs text-gray-500">{review.createdAt.toLocaleDateString()}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <StarRating rating={review.rating} />
                                    </div>
                                </div>
                                <p className="text-gray-400">{review.comment}</p>
                                <p className="text-xs text-gray-500 mt-2">{review.helpfulVotes} people found this helpful.</p>
                            </div>
                        ))}
                     </div>
                </div>
            );
            case 'changelog': return (
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Version History</h4>
                    <div className="space-y-6">
                        {agent.changelog.map(entry => (
                            <div key={entry.version}>
                                <h5 className="font-semibold text-gray-200">Version {entry.version} <span className="text-sm font-normal text-gray-500">- {entry.releaseDate.toLocaleDateString()}</span></h5>
                                <ul className="list-disc list-inside text-gray-400 mt-2 pl-4">
                                    {entry.changes.map((change, i) => <li key={i}>{change}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            );
            case 'overview':
            default:
                 return <p className="text-gray-300 whitespace-pre-wrap">{agent.longDescription}</p>;
        }
    };
    
    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'specs', label: 'Specifications' },
        { id: 'reviews', label: `Reviews (${agent.reviewCount})` },
        { id: 'changelog', label: 'Changelog' },
    ] as const;


    return (
        <Modal isOpen={!!agent} onClose={onClose} title={agent.name}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="md:col-span-2">
                    <img src={agent.imageUrl} alt={agent.name} className="w-full h-64 object-cover rounded-lg bg-gray-700 mb-4" />
                    
                    {/* Tabs */}
                    <div className="border-b border-gray-700 mb-4">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`${
                                        activeTab === tab.id
                                            ? 'border-cyan-500 text-cyan-400'
                                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div>
                        {renderTabContent()}
                    </div>
                </div>

                {/* Right Column */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-green-400 mb-4">
                            {agent.pricing.type === 'free' ? 'Free' : `$${agent.pricing.amount}`}
                            {agent.pricing.type === 'subscription' && <span className="text-base text-gray-400">/{agent.pricing.subscriptionInterval === 'monthly' ? 'mo' : 'yr'}</span>}
                        </div>
                        <button className="w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded hover:bg-cyan-700 transition duration-300">
                           {agent.pricing.type === 'free' ? 'Download' : 'Purchase Agent'}
                        </button>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 space-y-2">
                        <div className="flex justify-between"><span>Version:</span> <span className="font-mono">{agent.specs.version}</span></div>
                        <div className="flex justify-between"><span>Updated:</span> <span>{agent.updatedAt.toLocaleDateString()}</span></div>
                        <div className="flex justify-between"><span>Category:</span> <span className="text-cyan-400">{agent.category}</span></div>
                        <div className="flex justify-between"><span>Downloads:</span> <span>{agent.downloads.toLocaleString()}</span></div>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">Author</h4>
                        <div className="flex items-center">
                            <img src={agent.author.avatarUrl} alt={agent.author.name} className="h-10 w-10 rounded-full mr-3" />
                            <div>
                               <div className="flex items-center">
                                    <p className="font-semibold text-white">{agent.author.name}</p>
                                     {agent.author.verified && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-500 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                           <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44-1.22a.75.75 0 00-1.06 0L8.25 6.19 6.31 4.25a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.06 0l4.5-4.5a.75.75 0 000-1.06z" clipRule="evenodd" />
                                       </svg>
                                    )}
                               </div>
                                <a href={agent.author.profileUrl} className="text-xs text-cyan-400 hover:underline">View Profile</a>
                            </div>
                        </div>
                         <p className="text-xs text-gray-400 mt-2">{agent.author.bio}</p>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {agent.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};


//================================================================================================
// MAIN COMPONENT
//================================================================================================

const AgentMarketplaceView: React.FC = () => {
    const [allAgents, setAllAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [filterState, dispatch] = useReducer(filterReducer, initialFilterState);

    const [sortBy, setSortBy] = useState<'rating' | 'newest' | 'downloads' | 'featured'>('featured');

    // Simulate fetching data from an API
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        // Simulate a network delay
        const timer = setTimeout(() => {
            try {
                const generatedAgents = generateMockAgents(150);
                setAllAgents(generatedAgents);
            } catch (e) {
                setError("Failed to load agent data.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, []);
    
    // Filtering and Sorting Logic
    const filteredAndSortedAgents = useMemo(() => {
        let processedAgents = allAgents.filter(agent => {
            const searchLower = filterState.searchQuery.toLowerCase();
            const nameMatch = agent.name.toLowerCase().includes(searchLower);
            const descMatch = agent.shortDescription.toLowerCase().includes(searchLower);
            const tagMatch = agent.tags.some(t => t.toLowerCase().includes(searchLower));
            const categoryMatch = filterState.categories.size === 0 || filterState.categories.has(agent.category);
            const ratingMatch = agent.rating >= filterState.minRating;
            const priceMatch = (agent.pricing.type === 'free' && filterState.maxPrice >= 0) || (agent.pricing.type !== 'free' && agent.pricing.amount <= filterState.maxPrice);
            const pricingTypeMatch = filterState.pricingTypes.size === 0 || filterState.pricingTypes.has(agent.pricing.type);
            const tagFilterMatch = filterState.tags.size === 0 || agent.tags.some(t => filterState.tags.has(t));
            const authorMatch = !filterState.verifiedAuthor || agent.author.verified;
            
            return (nameMatch || descMatch || tagMatch) && categoryMatch && ratingMatch && priceMatch && pricingTypeMatch && tagFilterMatch && authorMatch;
        });

        // Sorting
        switch (sortBy) {
            case 'featured':
                processedAgents.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating);
                break;
            case 'rating':
                processedAgents.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                processedAgents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                break;
            case 'downloads':
                processedAgents.sort((a, b) => b.downloads - a.downloads);
                break;
        }

        return processedAgents;
    }, [allAgents, filterState, sortBy]);

    const { currentData, currentPage, maxPage, jump } = usePagination(filteredAndSortedAgents, 12);

    const handleSearch = useCallback((query: string) => {
        dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
        jump(1);
    }, [jump]);

    const handleResetFilters = useCallback(() => {
        dispatch({ type: 'RESET_FILTERS' });
        jump(1);
    }, [jump]);

    return (
        <div className="space-y-6">
            <Card title="AI Agent Marketplace" padding="none">
                <div className="p-6 border-b border-gray-700">
                     <p className="text-gray-400 mb-4">Discover, purchase, and deploy autonomous AI agents for various financial and business tasks.</p>
                     <SearchBar query={filterState.searchQuery} onSearch={handleSearch} />
                </div>
                <div className="flex flex-col lg:flex-row">
                    <FilterSidebar state={filterState} dispatch={dispatch} />
                    <main className="w-full lg:w-3/4 xl:w-4/5 p-4">
                        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                            <p className="text-gray-400">Showing {filteredAndSortedAgents.length} agents</p>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-300">Sort by:</span>
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                    className="bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="newest">Newest</option>
                                    <option value="downloads">Most Popular</option>
                                </select>
                            </div>
                        </div>

                        {isLoading ? (
                           <LoadingSpinner />
                        ) : error ? (
                            <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>
                        ) : currentData.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {currentData.map(agent => (
                                        <AgentCard key={agent.id} agent={agent} onSelect={setSelectedAgent} />
                                    ))}
                                </div>
                                <Pagination currentPage={currentPage} maxPage={maxPage} onJump={jump} />
                            </>
                        ) : (
                            <NoResults onReset={handleResetFilters} />
                        )}
                    </main>
                </div>
            </Card>

            <AgentDetailModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
        </div>
    );
};

export default AgentMarketplaceView;

// --- CONSOLIDATED FROM: MarketplaceView (3).tsx ---

import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import './ApiSettingsPage.css';

// =================================================================================
// REFACTOR NOTE (Goal 6, 2, 3): Simplified API Key Management for Core MVP Scope
// The original component managed over 200 non-essential API credentials, which is 
// insecure and unmanageable. We have removed the sprawling configuration to focus 
// the system on the core MVP: Multi-bank aggregation, Treasury automation, and AI 
// intelligence.
// 
// CRITICAL SECURITY NOTE (Goal 3): Actual secrets must be stored in a secure vault 
// (like AWS Secrets Manager/Vault). This UI now only handles essential configuration 
// values that link to secure server-side processes or initiate standard OAuth flows.
// =================================================================================
interface ApiKeysState {
  // Core Infrastructure (Required for accessing AWS services, including Secrets Manager)
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  
  // AI & Transaction Intelligence (Goal 5)
  OPENAI_API_KEY: string;

  // Financial Data Aggregation (Core MVP: Multi-bank aggregation)
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;

  // Payment Processing (Core Fintech necessity)
  STRIPE_SECRET_KEY: string;

  // Accounting Integrations (For Unified Business Financial Dashboard)
  QUICKBOOKS_CLIENT_ID: string;
  QUICKBOOKS_CLIENT_SECRET: string;
  XERO_CLIENT_ID: string;
  XERO_CLIENT_SECRET: string;
  
  [key: string]: string; // Index signature for dynamic access
}


const AgentMarketplaceView: React.FC = () => {
    // Note: Component definition name retained (AgentMarketplaceView) for compatibility, 
    // but the functionality is now dedicated API Integration Settings.
  const [keys, setKeys] = useState<ApiKeysState>({} as ApiKeysState);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Removed activeTab state as the form is now unified and streamlined (Goal 6).

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage('Attempting to securely transmit critical configuration identifiers...');
    
    try {
      // Endpoint updated to reflect secure configuration (Goal 4). 
      // This path must ensure secrets are immediately moved to a secure vault server-side.
      const response = await axios.post('http://localhost:4000/api/settings/configure-keys', keys);
      setStatusMessage(`Success: ${response.data.message}`);
      // Clear form inputs upon successful save for security reasons
      setKeys({} as ApiKeysState); 
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Could not save configuration. Please check backend server status and logs.';
      setStatusMessage(`Error: ${errorMessage}`);
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

  const renderMvpApis = () => (
    <>
      <div className="form-section">
        <h2>Core Cloud & Infrastructure (AWS)</h2>
        <p className="section-description">These credentials link the application to secure backend infrastructure and vault systems (e.g., Secrets Manager) (Goal 3).</p>
        {renderInput('AWS_ACCESS_KEY_ID', 'AWS Access Key ID')}
        {renderInput('AWS_SECRET_ACCESS_KEY', 'AWS Secret Access Key')}
      </div>

      <div className="form-section">
        <h2>AI & Transaction Intelligence</h2>
        <p className="section-description">Key for enabling generative models for enhanced financial analysis and alerting (Goal 5).</p>
        {renderInput('OPENAI_API_KEY', 'OpenAI API Key')}
      </div>

      <div className="form-section">
        <h2>Financial Aggregation & Payments</h2>
        <p className="section-description">Essential integrations for multi-bank account data retrieval and core payment processing (MVP Core).</p>
        {renderInput('PLAID_CLIENT_ID', 'Plaid Client ID')}
        {renderInput('PLAID_SECRET', 'Plaid Secret')}
        {renderInput('STRIPE_SECRET_KEY', 'Stripe Secret Key')}
      </div>

      <div className="form-section">
        <h2>Accounting System Integration</h2>
        <p className="section-description">Credentials for connecting to major accounting systems for the Unified Financial Dashboard MVP.</p>
        {renderInput('QUICKBOOKS_CLIENT_ID', 'QuickBooks Client ID')}
        {renderInput('QUICKBOOKS_CLIENT_SECRET', 'QuickBooks Client Secret')}
        {renderInput('XERO_CLIENT_ID', 'Xero Client ID')}
        {renderInput('XERO_CLIENT_SECRET', 'Xero Client Secret')}
      </div>
    </>
  );

  return (
    <div className="settings-container">
      <h1>MVP Integration Configuration</h1>
      <p className="subtitle">
        Securely configure required system identifiers for the core Financial Intelligence platform. 
        Only 10 critical keys are exposed here. All other configurations are handled via server-side secrets management.
      </p>

      <form onSubmit={handleSubmit} className="settings-form">
        {renderMvpApis()}
        
        <div className="form-footer">
          <button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? 'Saving Configuration...' : 'Save Configuration to Backend'}
          </button>
          {statusMessage && <p className={`status-message ${statusMessage.startsWith('Error') ? 'error' : 'success'}`}>{statusMessage}</p>}
        </div>
      </form>
    </div>
  );
};

export default AgentMarketplaceView;

// --- CONSOLIDATED FROM: MarketplaceView_1.tsx ---

import React, { useContext, useState, useEffect, useReducer, useCallback, useMemo, FC, ChangeEvent, FormEvent, ReactNode } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import type { MarketplaceProduct, View } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

//================================================================================================
// TYPE DEFINITIONS
//================================================================================================

/**
 * Represents the author of an AI agent.
 */
export interface AgentAuthor {
    id: string;
    name: string;
    avatarUrl: string;
    profileUrl: string;
    verified: boolean;
    bio: string;
    agentsPublished: number;
}

/**
 * Represents a user review for an AI agent.
 */
export interface AgentReview {
    id: string;
    author: {
        name: string;
        avatarUrl: string;
    };
    rating: number; // 1-5
    comment: string;
    createdAt: Date;
    helpfulVotes: number;
}

/**
 * Represents the pricing model for an AI agent.
 */
export interface AgentPricing {
    type: 'one-time' | 'subscription' | 'free';
    amount: number; // in USD
    subscriptionInterval?: 'monthly' | 'yearly';
}

/**
 * Technical specifications for the agent.
 */
export interface AgentSpecs {
    version: string;
    releaseDate: Date;
    requiredApiVersion: string;
    dependencies: string[];
    supportedLanguages: string[];
    computeRequirements: {
        cpu: string;
        ram: string;
        gpu?: string;
    };
}

/**
 * Represents a single version in the agent's changelog.
 */
export interface AgentChangelogEntry {
    version: string;
    releaseDate: Date;
    changes: string[];
}

/**
 * Core interface for an AI Agent in the marketplace.
 */
export interface Agent {
    id: string;
    name: string;
    author: AgentAuthor;
    category: string;
    tags: string[];
    shortDescription: string;
    longDescription: string;
    imageUrl: string;
    rating: number; // average rating 1-5
    reviewCount: number;
    reviews: AgentReview[];
    pricing: AgentPricing;
    specs: AgentSpecs;
    changelog: AgentChangelogEntry[];
    downloads: number;
    createdAt: Date;
    updatedAt: Date;
    featured: boolean;
    documentationUrl: string;
    demoUrl?: string;
}

//================================================================================================
// MOCK DATA GENERATION
// This section simulates a real-world backend by providing extensive mock data.
//================================================================================================

const MOCK_AUTHORS: AgentAuthor[] = [
    { id: 'author-1', name: 'SynthCore Labs', avatarUrl: 'https://i.pravatar.cc/40?u=synthcore', profileUrl: '#', verified: true, bio: 'Pioneering AI for financial markets.', agentsPublished: 5 },
    { id: 'author-2', name: 'DataWeaver Inc.', avatarUrl: 'https://i.pravatar.cc/40?u=dataweaver', profileUrl: '#', verified: true, bio: 'Weaving intelligence from raw data.', agentsPublished: 8 },
    { id: 'author-3', name: 'LogicForge AI', avatarUrl: 'https://i.pravatar.cc/40?u=logicforge', profileUrl: '#', verified: false, bio: 'Crafting bespoke AI solutions for business automation.', agentsPublished: 3 },
    { id: 'author-4', name: 'QuantumLeap AI', avatarUrl: 'https://i.pravatar.cc/40?u=quantumleap', profileUrl: '#', verified: true, bio: 'Next-generation AI for complex problem solving.', agentsPublished: 12 },
    { id: 'author-5', name: 'Eva Neuro', avatarUrl: 'https://i.pravatar.cc/40?u=eva', profileUrl: '#', verified: false, bio: 'Independent researcher focusing on NLP agents.', agentsPublished: 2 },
];

const MOCK_CATEGORIES = ['Finance', 'Marketing', 'Data Analysis', 'Customer Support', 'Content Creation', 'Code Generation', 'Personal Assistant'];

const MOCK_TAGS = ['stocks', 'crypto', 'reporting', 'automation', 'seo', 'chat', 'email', 'analytics', 'python', 'api', 'research', 'summarization', 'forecasting'];

const MOCK_COMMENTS = [
    "This agent transformed our workflow. Highly recommended!",
    "Decent, but has a steep learning curve.",
    "A game-changer for our marketing team. The automation capabilities are top-notch.",
    "Could use more documentation, but the support team was helpful.",
    "It's good for the price, but lacks some advanced features.",
    "Incredible performance and very reliable. Has not failed us once.",
    "I found a few bugs, but the developer is very responsive and issues fixes quickly.",
    "The best agent in this category, hands down.",
    "Simple, effective, and does exactly what it promises.",
    "Overpriced for what it offers. There are better free alternatives.",
];

/**
 * A utility function to generate a large set of mock agents.
 * @param count The number of agents to generate.
 * @returns An array of mock `Agent` objects.
 */
export const generateMockAgents = (count: number): Agent[] => {
    const agents: Agent[] = [];
    for (let i = 1; i <= count; i++) {
        const author = MOCK_AUTHORS[i % MOCK_AUTHORS.length];
        const category = MOCK_CATEGORIES[i % MOCK_CATEGORIES.length];
        const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const reviews: AgentReview[] = Array.from({ length: Math.floor(Math.random() * 50) + 5 }, (_, k) => ({
            id: `review-${i}-${k}`,
            author: { name: `User ${k + 1}`, avatarUrl: `https://i.pravatar.cc/40?u=reviewuser${i}_${k}` },
            rating: Math.floor(Math.random() * 3) + 3, // 3, 4, or 5
            comment: MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)],
            createdAt: new Date(createdAt.getTime() + Math.random() * (Date.now() - createdAt.getTime())),
            helpfulVotes: Math.floor(Math.random() * 100),
        }));

        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        
        const pricingType = ['one-time', 'subscription', 'free'][i % 3] as 'one-time' | 'subscription' | 'free';
        const pricing: AgentPricing = {
            type: pricingType,
            amount: pricingType === 'free' ? 0 : (pricingType === 'one-time' ? Math.floor(Math.random() * 400) + 99 : Math.floor(Math.random() * 90) + 9),
            ...(pricingType === 'subscription' && { subscriptionInterval: ['monthly', 'yearly'][i % 2] as 'monthly' | 'yearly' })
        };
        
        const changelog: AgentChangelogEntry[] = [
            { version: '1.2.0', releaseDate: new Date(), changes: ['Added new API integration.', 'Improved performance by 20%.', 'Fixed minor UI bugs.'] },
            { version: '1.1.0', releaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), changes: ['Initial support for multi-language output.', 'Refactored core logic.'] },
            { version: '1.0.0', releaseDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), changes: ['Initial public release.'] },
        ];

        agents.push({
            id: `agent-${i}`,
            name: `${category} Master Agent ${i}`,
            author,
            category,
            tags: [...new Set(Array.from({ length: Math.floor(Math.random() * 3) + 2 }, () => MOCK_TAGS[Math.floor(Math.random() * MOCK_TAGS.length)]))],
            shortDescription: `An autonomous AI agent specializing in ${category.toLowerCase()} tasks and automation.`,
            longDescription: `This is a comprehensive description for the ${category} Master Agent ${i}. It leverages state-of-the-art machine learning models to provide unparalleled insights and automation capabilities. Whether you're a small business or a large enterprise, this agent can be configured to meet your specific needs, streamlining workflows and boosting productivity. It features a user-friendly interface for configuration and monitoring.`,
            imageUrl: `https://picsum.photos/seed/agent${i}/600/400`,
            rating: parseFloat(avgRating.toFixed(1)),
            reviewCount: reviews.length,
            reviews,
            pricing,
            specs: {
                version: '1.2.0',
                releaseDate: new Date(),
                requiredApiVersion: 'v2.1',
                dependencies: ['Node.js v18+', 'Python 3.9+', 'Docker'],
                supportedLanguages: ['English', 'Spanish', 'German'],
                computeRequirements: {
                    cpu: '4 cores',
                    ram: '16GB',
                    gpu: (i % 3 === 0) ? 'NVIDIA RTX 3080 or equivalent' : undefined,
                },
            },
            changelog,
            downloads: Math.floor(Math.random() * 10000) + 500,
            createdAt,
            updatedAt: new Date(createdAt.getTime() + Math.random() * (Date.now() - createdAt.getTime())),
            featured: i % 10 === 0,
            documentationUrl: '#',
            demoUrl: i % 5 === 0 ? '#' : undefined,
        });
    }
    return agents;
};

//================================================================================================
// STATE MANAGEMENT (useReducer)
//================================================================================================

export type FilterState = {
    searchQuery: string;
    categories: Set<string>;
    minRating: number;
    maxPrice: number;
    pricingTypes: Set<'one-time' | 'subscription' | 'free'>;
    tags: Set<string>;
    verifiedAuthor: boolean;
};

export type FilterAction =
    | { type: 'SET_SEARCH_QUERY'; payload: string }
    | { type: 'TOGGLE_CATEGORY'; payload: string }
    | { type: 'SET_MIN_RATING'; payload: number }
    | { type: 'SET_MAX_PRICE'; payload: number }
    | { type: 'TOGGLE_PRICING_TYPE'; payload: 'one-time' | 'subscription' | 'free' }
    | { type: 'TOGGLE_TAG'; payload: string }
    | { type: 'TOGGLE_VERIFIED_AUTHOR' }
    | { type: 'RESET_FILTERS' };

export const initialFilterState: FilterState = {
    searchQuery: '',
    categories: new Set(),
    minRating: 0,
    maxPrice: 500,
    pricingTypes: new Set(),
    tags: new Set(),
    verifiedAuthor: false,
};

export function filterReducer(state: FilterState, action: FilterAction): FilterState {
    switch (action.type) {
        case 'SET_SEARCH_QUERY':
            return { ...state, searchQuery: action.payload };
        case 'TOGGLE_CATEGORY': {
            const newCategories = new Set(state.categories);
            if (newCategories.has(action.payload)) {
                newCategories.delete(action.payload);
            } else {
                newCategories.add(action.payload);
            }
            return { ...state, categories: newCategories };
        }
        case 'SET_MIN_RATING':
            return { ...state, minRating: action.payload };
        case 'SET_MAX_PRICE':
            return { ...state, maxPrice: action.payload };
        case 'TOGGLE_PRICING_TYPE': {
            const newPricingTypes = new Set(state.pricingTypes);
            if (newPricingTypes.has(action.payload)) {
                newPricingTypes.delete(action.payload);
            } else {
                newPricingTypes.add(action.payload);
            }
            return { ...state, pricingTypes: newPricingTypes };
        }
        case 'TOGGLE_TAG': {
            const newTags = new Set(state.tags);
            if (newTags.has(action.payload)) {
                newTags.delete(action.payload);
            } else {
                newTags.add(action.payload);
            }
            return { ...state, tags: newTags };
        }
        case 'TOGGLE_VERIFIED_AUTHOR':
            return { ...state, verifiedAuthor: !state.verifiedAuthor };
        case 'RESET_FILTERS':
            return initialFilterState;
        default:
            return state;
    }
}

//================================================================================================
// HELPER & UTILITY COMPONENTS
//================================================================================================

const Star: FC<{ filled?: boolean; half?: boolean }> = ({ filled, half }) => {
    const starPath = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";
    
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20">
            <defs>
                {half && (
                    <linearGradient id="half-gradient">
                        <stop offset="50%" stopColor="currentColor" className="text-yellow-400" />
                        <stop offset="50%" stopColor="currentColor" className="text-gray-600" />
                    </linearGradient>
                )}
            </defs>
            <path d={starPath} fill={half ? "url(#half-gradient)" : "currentColor"} className={filled ? 'text-yellow-400' : 'text-gray-600'} />
        </svg>
    )
};

/**
 * A reusable component for rendering star ratings.
 */
export const StarRating: FC<{ rating: number; className?: string }> = ({ rating, className = '' }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <div className={`flex items-center text-yellow-400 ${className}`}>
            {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} filled />)}
            {halfStar && <Star half />}
            {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} />)}
        </div>
    );
};

/**
 * A simple loading spinner component.
 */
export const LoadingSpinner: FC = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
    </div>
);

/**
 * A component to display when no results are found.
 */
export const NoResults: FC<{ onReset: () => void }> = ({ onReset }) => (
    <div className="text-center py-16 px-4 bg-gray-800 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-white">No Agents Found</h3>
        <p className="mt-1 text-sm text-gray-400">
            We couldn't find any agents matching your criteria. Try adjusting your filters.
        </p>
        <div className="mt-6">
            <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
            >
                Reset Filters
            </button>
        </div>
    </div>
);

/**
 * A generic modal component.
 */
export const Modal: FC<{ isOpen: boolean; onClose: () => void; title: string; children: ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0" onClick={onClose}></div>
            <div className="relative bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-4xl sm:w-full">
                <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-700">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl leading-6 font-medium text-white" id="modal-title">
                            {title}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <span className="sr-only">Close</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="bg-gray-900 px-4 pt-5 pb-4 sm:p-6 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * Custom hook for managing pagination logic.
 */
export const usePagination = <T,>(items: T[], itemsPerPage: number) => {
    const [currentPage, setCurrentPage] = useState(1);
    const maxPage = Math.ceil(items.length / itemsPerPage);

    const currentData = useMemo(() => {
        const begin = (currentPage - 1) * itemsPerPage;
        const end = begin + itemsPerPage;
        return items.slice(begin, end);
    }, [items, currentPage, itemsPerPage]);

    const next = () => {
        setCurrentPage((page) => Math.min(page + 1, maxPage));
    };

    const prev = () => {
        setCurrentPage((page) => Math.max(page - 1, 1));
    };

    const jump = (page: number) => {
        const pageNumber = Math.max(1, page);
        setCurrentPage(Math.min(pageNumber, maxPage));
    };
    
    useEffect(() => {
        if(currentPage > maxPage && maxPage > 0) {
            setCurrentPage(maxPage);
        } else if (items.length > 0 && currentPage === 0) {
            setCurrentPage(1);
        }
    }, [items, maxPage, currentPage]);

    return { next, prev, jump, currentData, currentPage, maxPage };
};


//================================================================================================
// UI SUB-COMPONENTS
// These components make up the building blocks of the marketplace UI.
//================================================================================================

/**
 * The search bar component at the top of the marketplace.
 */
export const SearchBar: FC<{ query: string; onSearch: (query: string) => void }> = ({ query, onSearch }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
        <input
            type="text"
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
            placeholder="Search for agents by name, tag, or description..."
            className="block w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
        />
    </div>
);


/**
 * The sidebar containing all filtering options.
 */
export const FilterSidebar: FC<{ state: FilterState; dispatch: React.Dispatch<FilterAction> }> = ({ state, dispatch }) => {
    return (
        <aside className="w-full lg:w-1/4 xl:w-1/5 p-4 bg-gray-800/50 rounded-lg h-full self-start sticky top-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                <button
                    onClick={() => dispatch({ type: 'RESET_FILTERS' })}
                    className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                    Reset
                </button>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
                <h4 className="font-semibold text-gray-300 mb-2">Category</h4>
                {MOCK_CATEGORIES.map(category => (
                    <div key={category} className="flex items-center mb-1">
                        <input
                            id={`cat-${category}`}
                            type="checkbox"
                            checked={state.categories.has(category)}
                            onChange={() => dispatch({ type: 'TOGGLE_CATEGORY', payload: category })}
                            className="h-4 w-4 rounded border-gray-500 text-cyan-600 bg-gray-700 focus:ring-cyan-500"
                        />
                        <label htmlFor={`cat-${category}`} className="ml-2 text-sm text-gray-400">{category}</label>
                    </div>
                ))}
            </div>

            {/* Rating Filter */}
            <div className="mb-6">
                <h4 className="font-semibold text-gray-300 mb-2">Minimum Rating</h4>
                <div className="flex items-center space-x-2">
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={state.minRating}
                        onChange={(e) => dispatch({ type: 'SET_MIN_RATING', payload: parseFloat(e.target.value) })}
                        className="w-full"
                    />
                    <span className="text-sm text-gray-300 font-mono w-8 text-center">{state.minRating.toFixed(1)}</span>
                </div>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
                <h4 className="font-semibold text-gray-300 mb-2">Max Price</h4>
                <div className="flex items-center space-x-2">
                     <input
                        type="range"
                        min="0"
                        max="500"
                        step="10"
                        value={state.maxPrice}
                        onChange={(e) => dispatch({ type: 'SET_MAX_PRICE', payload: parseInt(e.target.value) })}
                        className="w-full"
                    />
                    <span className="text-sm text-gray-300 font-mono w-12 text-center">${state.maxPrice}</span>
                </div>
                <div className="mt-2 space-y-1">
                    {(['free', 'one-time', 'subscription'] as const).map(type => (
                        <div key={type} className="flex items-center">
                            <input
                                id={`price-${type}`}
                                type="checkbox"
                                checked={state.pricingTypes.has(type)}
                                onChange={() => dispatch({ type: 'TOGGLE_PRICING_TYPE', payload: type })}
                                className="h-4 w-4 rounded border-gray-500 text-cyan-600 bg-gray-700 focus:ring-cyan-500"
                            />
                            <label htmlFor={`price-${type}`} className="ml-2 text-sm text-gray-400 capitalize">{type}</label>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Author Filter */}
            <div className="mb-6">
                 <h4 className="font-semibold text-gray-300 mb-2">Author</h4>
                 <div className="flex items-center">
                     <input
                         id="verified-author"
                         type="checkbox"
                         checked={state.verifiedAuthor}
                         onChange={() => dispatch({ type: 'TOGGLE_VERIFIED_AUTHOR' })}
                         className="h-4 w-4 rounded border-gray-500 text-cyan-600 bg-gray-700 focus:ring-cyan-500"
                     />
                     <label htmlFor="verified-author" className="ml-2 text-sm text-gray-400">Verified Author Only</label>
                 </div>
            </div>

            {/* Tag Filter */}
            <div>
                 <h4 className="font-semibold text-gray-300 mb-2">Tags</h4>
                 <div className="flex flex-wrap gap-2">
                     {MOCK_TAGS.map(tag => (
                         <button
                            key={tag}
                            onClick={() => dispatch({ type: 'TOGGLE_TAG', payload: tag })}
                            className={`px-2 py-1 text-xs rounded-full border ${state.tags.has(tag) ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
                         >
                           {tag}
                         </button>
                     ))}
                 </div>
            </div>
        </aside>
    );
};

/**
 * A card representing a single agent in the grid view.
 */
export const AgentCard: FC<{ agent: Agent; onSelect: (agent: Agent) => void }> = ({ agent, onSelect }) => (
    <div 
        className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer flex flex-col"
        onClick={() => onSelect(agent)}
    >
        <img className="w-full h-40 object-cover bg-gray-700" src={agent.imageUrl} alt={agent.name} />
        <div className="p-4 flex flex-col flex-grow">
            <div className="flex justify-between items-start">
                <p className="text-sm text-cyan-400">{agent.category}</p>
                <div className="text-lg font-bold text-green-400">
                    {agent.pricing.type === 'free' ? 'Free' : `$${agent.pricing.amount}`}
                    {agent.pricing.type === 'subscription' && <span className="text-xs text-gray-400">/{agent.pricing.subscriptionInterval === 'monthly' ? 'mo' : 'yr'}</span>}
                </div>
            </div>
            <h3 className="text-lg font-semibold text-white mt-1">{agent.name}</h3>
            <div className="flex items-center mt-1">
                <img src={agent.author.avatarUrl} alt={agent.author.name} className="h-6 w-6 rounded-full mr-2" />
                <span className="text-sm text-gray-400">{agent.author.name}</span>
                {agent.author.verified && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-500 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44-1.22a.75.75 0 00-1.06 0L8.25 6.19 6.31 4.25a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.06 0l4.5-4.5a.75.75 0 000-1.06z" clipRule="evenodd" />
                    </svg>
                )}
            </div>
            <p className="text-sm text-gray-400 mt-2 flex-grow">{agent.shortDescription}</p>
            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                <div className="flex items-center">
                    <StarRating rating={agent.rating} />
                    <span className="text-xs text-gray-500 ml-2">({agent.reviewCount})</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 8.586V3a1 1 0 10-2 0v5.586L8.707 7.293zM3 11a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                    </svg>
                    {agent.downloads.toLocaleString()}
                </div>
            </div>
        </div>
    </div>
);

/**
 * The pagination controls for the agent grid.
 */
export const Pagination: FC<{ currentPage: number; maxPage: number; onJump: (page: number) => void }> = ({ currentPage, maxPage, onJump }) => {
    if (maxPage <= 1) return null;

    const pageNumbers: (number | '...')[] = [];
    if (maxPage <= 7) {
        for (let i = 1; i <= maxPage; i++) {
            pageNumbers.push(i);
        }
    } else {
        pageNumbers.push(1);
        if (currentPage > 3) {
            pageNumbers.push('...');
        }
        if (currentPage > 2) {
            pageNumbers.push(currentPage - 1);
        }
        if (currentPage > 1 && currentPage < maxPage) {
            pageNumbers.push(currentPage);
        }
        if (currentPage < maxPage - 1) {
            pageNumbers.push(currentPage + 1);
        }
        if (currentPage < maxPage - 2) {
            pageNumbers.push('...');
        }
        pageNumbers.push(maxPage);
    }

    return (
        <nav className="flex items-center justify-between py-3 text-white" aria-label="Pagination">
            <div className="hidden sm:block">
                <p className="text-sm text-gray-400">
                    Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{maxPage}</span>
                </p>
            </div>
            <div className="flex-1 flex justify-between sm:justify-end">
                <button
                    onClick={() => onJump(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <div className="hidden md:flex items-center mx-2">
                    {pageNumbers.map((page, index) =>
                        page === '...' ? (
                            <span key={index} className="px-4 py-2 text-sm">...</span>
                        ) : (
                            <button
                                key={index}
                                onClick={() => onJump(page as number)}
                                className={`px-4 py-2 border border-gray-600 text-sm font-medium rounded-md mx-1 ${currentPage === page ? 'bg-cyan-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>
                <button
                    onClick={() => onJump(currentPage + 1)}
                    disabled={currentPage === maxPage}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </nav>
    );
};

/**
 * A detailed view of a single agent, shown in a modal.
 */
export const AgentDetailModal: FC<{ agent: Agent | null; onClose: () => void }> = ({ agent, onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews' | 'changelog'>('overview');

    if (!agent) return null;

    const renderTabContent = () => {
        switch(activeTab) {
            case 'specs': return (
                <div className="space-y-4 text-gray-300">
                    <h4 className="text-lg font-semibold text-white">Technical Specifications</h4>
                    <ul className="list-disc list-inside bg-gray-800/50 p-4 rounded-md">
                        <li><strong>Version:</strong> {agent.specs.version} (Released on {agent.specs.releaseDate.toLocaleDateString()})</li>
                        <li><strong>Required API Version:</strong> {agent.specs.requiredApiVersion}</li>
                        <li><strong>Supported Languages:</strong> {agent.specs.supportedLanguages.join(', ')}</li>
                    </ul>
                    <h4 className="text-lg font-semibold text-white mt-4">Dependencies</h4>
                     <ul className="list-disc list-inside bg-gray-800/50 p-4 rounded-md">
                        {agent.specs.dependencies.map(dep => <li key={dep}>{dep}</li>)}
                    </ul>
                    <h4 className="text-lg font-semibold text-white mt-4">Compute Requirements</h4>
                     <ul className="list-disc list-inside bg-gray-800/50 p-4 rounded-md">
                        <li><strong>CPU:</strong> {agent.specs.computeRequirements.cpu}</li>
                        <li><strong>RAM:</strong> {agent.specs.computeRequirements.ram}</li>
                        {agent.specs.computeRequirements.gpu && <li><strong>GPU:</strong> {agent.specs.computeRequirements.gpu}</li>}
                    </ul>
                </div>
            );
            case 'reviews': return (
                <div>
                     <h4 className="text-lg font-semibold text-white mb-4">User Reviews ({agent.reviewCount})</h4>
                     <div className="space-y-6">
                        {agent.reviews.slice(0, 5).map(review => (
                            <div key={review.id} className="border-b border-gray-700 pb-4">
                                <div className="flex items-center mb-2">
                                    <img src={review.author.avatarUrl} alt={review.author.name} className="h-8 w-8 rounded-full mr-3" />
                                    <div>
                                        <p className="font-semibold text-white">{review.author.name}</p>
                                        <p className="text-xs text-gray-500">{review.createdAt.toLocaleDateString()}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <StarRating rating={review.rating} />
                                    </div>
                                </div>
                                <p className="text-gray-400">{review.comment}</p>
                                <p className="text-xs text-gray-500 mt-2">{review.helpfulVotes} people found this helpful.</p>
                            </div>
                        ))}
                     </div>
                </div>
            );
            case 'changelog': return (
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Version History</h4>
                    <div className="space-y-6">
                        {agent.changelog.map(entry => (
                            <div key={entry.version}>
                                <h5 className="font-semibold text-gray-200">Version {entry.version} <span className="text-sm font-normal text-gray-500">- {entry.releaseDate.toLocaleDateString()}</span></h5>
                                <ul className="list-disc list-inside text-gray-400 mt-2 pl-4">
                                    {entry.changes.map((change, i) => <li key={i}>{change}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            );
            case 'overview':
            default:
                 return <p className="text-gray-300 whitespace-pre-wrap">{agent.longDescription}</p>;
        }
    };
    
    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'specs', label: 'Specifications' },
        { id: 'reviews', label: `Reviews (${agent.reviewCount})` },
        { id: 'changelog', label: 'Changelog' },
    ] as const;


    return (
        <Modal isOpen={!!agent} onClose={onClose} title={agent.name}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="md:col-span-2">
                    <img src={agent.imageUrl} alt={agent.name} className="w-full h-64 object-cover rounded-lg bg-gray-700 mb-4" />
                    
                    {/* Tabs */}
                    <div className="border-b border-gray-700 mb-4">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`${
                                        activeTab === tab.id
                                            ? 'border-cyan-500 text-cyan-400'
                                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div>
                        {renderTabContent()}
                    </div>
                </div>

                {/* Right Column */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-green-400 mb-4">
                            {agent.pricing.type === 'free' ? 'Free' : `$${agent.pricing.amount}`}
                            {agent.pricing.type === 'subscription' && <span className="text-base text-gray-400">/{agent.pricing.subscriptionInterval === 'monthly' ? 'mo' : 'yr'}</span>}
                        </div>
                        <button className="w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded hover:bg-cyan-700 transition duration-300">
                           {agent.pricing.type === 'free' ? 'Download' : 'Purchase Agent'}
                        </button>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 space-y-2">
                        <div className="flex justify-between"><span>Version:</span> <span className="font-mono">{agent.specs.version}</span></div>
                        <div className="flex justify-between"><span>Updated:</span> <span>{agent.updatedAt.toLocaleDateString()}</span></div>
                        <div className="flex justify-between"><span>Category:</span> <span className="text-cyan-400">{agent.category}</span></div>
                        <div className="flex justify-between"><span>Downloads:</span> <span>{agent.downloads.toLocaleString()}</span></div>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">Author</h4>
                        <div className="flex items-center">
                            <img src={agent.author.avatarUrl} alt={agent.author.name} className="h-10 w-10 rounded-full mr-3" />
                            <div>
                               <div className="flex items-center">
                                    <p className="font-semibold text-white">{agent.author.name}</p>
                                     {agent.author.verified && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-500 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                           <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44-1.22a.75.75 0 00-1.06 0L8.25 6.19 6.31 4.25a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.06 0l4.5-4.5a.75.75 0 000-1.06z" clipRule="evenodd" />
                                       </svg>
                                    )}
                               </div>
                                <a href={agent.author.profileUrl} className="text-xs text-cyan-400 hover:underline">View Profile</a>
                            </div>
                        </div>
                         <p className="text-xs text-gray-400 mt-2">{agent.author.bio}</p>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {agent.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};


//================================================================================================
// MAIN COMPONENT
//================================================================================================

const AgentMarketplaceView: React.FC = () => {
    const [allAgents, setAllAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [filterState, dispatch] = useReducer(filterReducer, initialFilterState);

    const [sortBy, setSortBy] = useState<'rating' | 'newest' | 'downloads' | 'featured'>('featured');

    // Simulate fetching data from an API
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        // Simulate a network delay
        const timer = setTimeout(() => {
            try {
                const generatedAgents = generateMockAgents(150);
                setAllAgents(generatedAgents);
            } catch (e) {
                setError("Failed to load agent data.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, []);
    
    // Filtering and Sorting Logic
    const filteredAndSortedAgents = useMemo(() => {
        let processedAgents = allAgents.filter(agent => {
            const searchLower = filterState.searchQuery.toLowerCase();
            const nameMatch = agent.name.toLowerCase().includes(searchLower);
            const descMatch = agent.shortDescription.toLowerCase().includes(searchLower);
            const tagMatch = agent.tags.some(t => t.toLowerCase().includes(searchLower));
            const categoryMatch = filterState.categories.size === 0 || filterState.categories.has(agent.category);
            const ratingMatch = agent.rating >= filterState.minRating;
            const priceMatch = (agent.pricing.type === 'free' && filterState.maxPrice >= 0) || (agent.pricing.type !== 'free' && agent.pricing.amount <= filterState.maxPrice);
            const pricingTypeMatch = filterState.pricingTypes.size === 0 || filterState.pricingTypes.has(agent.pricing.type);
            const tagFilterMatch = filterState.tags.size === 0 || agent.tags.some(t => filterState.tags.has(t));
            const authorMatch = !filterState.verifiedAuthor || agent.author.verified;
            
            return (nameMatch || descMatch || tagMatch) && categoryMatch && ratingMatch && priceMatch && pricingTypeMatch && tagFilterMatch && authorMatch;
        });

        // Sorting
        switch (sortBy) {
            case 'featured':
                processedAgents.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating);
                break;
            case 'rating':
                processedAgents.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                processedAgents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                break;
            case 'downloads':
                processedAgents.sort((a, b) => b.downloads - a.downloads);
                break;
        }

        return processedAgents;
    }, [allAgents, filterState, sortBy]);

    const { currentData, currentPage, maxPage, jump } = usePagination(filteredAndSortedAgents, 12);

    const handleSearch = useCallback((query: string) => {
        dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
        jump(1);
    }, [jump]);

    const handleResetFilters = useCallback(() => {
        dispatch({ type: 'RESET_FILTERS' });
        jump(1);
    }, [jump]);

    return (
        <div className="space-y-6">
            <Card title="AI Agent Marketplace" padding="none">
                <div className="p-6 border-b border-gray-700">
                     <p className="text-gray-400 mb-4">Discover, purchase, and deploy autonomous AI agents for various financial and business tasks.</p>
                     <SearchBar query={filterState.searchQuery} onSearch={handleSearch} />
                </div>
                <div className="flex flex-col lg:flex-row">
                    <FilterSidebar state={filterState} dispatch={dispatch} />
                    <main className="w-full lg:w-3/4 xl:w-4/5 p-4">
                        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                            <p className="text-gray-400">Showing {filteredAndSortedAgents.length} agents</p>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-300">Sort by:</span>
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                    className="bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="newest">Newest</option>
                                    <option value="downloads">Most Popular</option>
                                </select>
                            </div>
                        </div>

                        {isLoading ? (
                           <LoadingSpinner />
                        ) : error ? (
                            <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>
                        ) : currentData.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {currentData.map(agent => (
                                        <AgentCard key={agent.id} agent={agent} onSelect={setSelectedAgent} />
                                    ))}
                                </div>
                                <Pagination currentPage={currentPage} maxPage={maxPage} onJump={jump} />
                            </>
                        ) : (
                            <NoResults onReset={handleResetFilters} />
                        )}
                    </main>
                </div>
            </Card>

            <AgentDetailModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
        </div>
    );
};

export default AgentMarketplaceView;

// --- CONSOLIDATED FROM: MarketplaceView (2).tsx ---

// components/MarketplaceView.tsx
// RE-ENACTED & EXPANDED: This component has been resurrected from its deprecated state.
// It is now "Agora AI," a fully-featured, AI-curated marketplace. It generates
// personalized product recommendations using Gemini based on user transaction history.

import React, { useContext, useEffect, useState } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import type { MarketplaceProduct, View, Transaction } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// ================================================================================================
// SUB-COMPONENTS
// ================================================================================================

/**
 * @description Renders a single product card in the marketplace.
 * @param {object} props - Component props containing the product and buy handler.
 */
const ProductCard: React.FC<{ product: MarketplaceProduct; onBuy: (product: MarketplaceProduct) => void; }> = ({ product, onBuy }) => (
    <Card className="flex flex-col h-full">
        {/* Product Image */}
        <div className="aspect-video bg-gray-700 rounded-t-xl overflow-hidden">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        </div>
        {/* Product Details */}
        <div className="p-4 flex-grow flex flex-col">
            <h3 className="text-lg font-semibold text-white">{product.name}</h3>
            <p className="text-sm text-gray-400 mt-1"><span className="font-semibold text-cyan-300">Plato's Insight:</span> {product.aiJustification}</p>
            {/* Spacer to push the price and button to the bottom */}
            <div className="flex-grow"></div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700/60">
                <p className="font-mono text-2xl text-cyan-300">${product.price.toFixed(2)}</p>
                <button
                    onClick={() => onBuy(product)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Buy Now
                </button>
            </div>
        </div>
    </Card>
);

/**
 * @description A loading skeleton component displayed while the AI is curating products.
 */
const MarketplaceSkeleton: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-96">
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
            <div className="absolute inset-4 border-4 border-t-cyan-500 border-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-white text-lg mt-6 font-semibold animate-pulse">Plato is curating your products...</p>
        <p className="text-gray-400 mt-1">Analyzing your preferences to find the perfect recommendations.</p>
    </div>
);


// ================================================================================================
// MAIN VIEW COMPONENT: MarketplaceView (Agora AI)
// ================================================================================================

const MarketplaceView: React.FC = () => {
    const context = useContext(DataContext);
    const [products, setProducts] = useState<MarketplaceProduct[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!context) {
        throw new Error("MarketplaceView must be within a DataProvider.");
    }
    
    // FIX: Destructure `addProductToTransactions` from context to resolve property not found error.
    const { transactions, addProductToTransactions } = context;

    /**
     * @description Fetches personalized product recommendations from the Gemini API
     * based on the user's recent transaction history.
     * @param {Transaction[]} userTransactions - The list of user transactions for context.
     */
    const fetchMarketplaceProducts = async (userTransactions: Transaction[]) => {
        setIsLoading(true);
        setError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            // Create a concise summary of recent purchases to use as context for the AI.
            const transactionSummary = userTransactions.slice(0, 10).map(t => t.description).join(', ');
            const prompt = `Based on these recent purchases (${transactionSummary}), generate 5 diverse, compelling, and slightly futuristic product recommendations. Provide a short, one-sentence justification for each recommendation from the AI's perspective. The products should be interesting and varied.`;

            // Define the schema for the expected JSON response from the AI.
            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    products: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                price: { type: Type.NUMBER },
                                category: { type: Type.STRING },
                                aiJustification: { type: Type.STRING }
                            }
                        }
                    }
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema
                }
            });
        
            const parsed = JSON.parse(response.text);
            // Enrich the AI-generated data with unique IDs and placeholder images.
            const productsWithIds = parsed.products.map((p: any, i: number) => ({
                ...p,
                id: `prod_${Date.now()}_${i}`,
                imageUrl: `https://source.unsplash.com/random/400x300?${p.name.split(' ').join(',')}`
            }));
            setProducts(productsWithIds);
        } catch (error) {
            console.error("Error fetching marketplace products:", error);
            setError("Plato AI encountered an error while curating your products. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Fetch products on component mount if they haven't been loaded yet.
    useEffect(() => {
        if (products.length === 0 && transactions.length > 0) {
            fetchMarketplaceProducts(transactions);
        }
    }, [transactions]);

    /**
     * @description Handles the "Buy Now" action for a product.
     * It adds the purchase as a new transaction in the user's history.
     * @param {MarketplaceProduct} product - The product being purchased.
     */
    const handleBuy = (product: MarketplaceProduct) => {
        addProductToTransactions(product);
        // Provide user feedback. In a real app, this would be a more robust notification.
        alert(`${product.name} purchased! The transaction has been added to your history.`);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Plato's Marketplace (Agora AI)</h2>
            <Card>
                <p className="text-gray-400 mb-6 text-sm">
                    Our AI, Plato, has analyzed your recent spending patterns to curate a list of products and services you might find valuable. This is personalization that goes beyond simple recommendations, offering a glimpse into possibilities tailored just for you.
                </p>
                {isLoading && <MarketplaceSkeleton />}
                {error && <p className="text-center text-red-400 py-12">{error}</p>}
                {!isLoading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} onBuy={handleBuy} />
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default MarketplaceView;


// --- CONSOLIDATED FROM: MarketplaceView (2)_1.tsx ---

// components/MarketplaceView.tsx
// RE-ENACTED & EXPANDED: This component has been resurrected from its deprecated state.
// It is now "Agora AI," a fully-featured, AI-curated marketplace. It generates
// personalized product recommendations using Gemini based on user transaction history.

import React, { useContext, useEffect, useState } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import type { MarketplaceProduct, View, Transaction } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// ================================================================================================
// SUB-COMPONENTS
// ================================================================================================

/**
 * @description Renders a single product card in the marketplace.
 * @param {object} props - Component props containing the product and buy handler.
 */
const ProductCard: React.FC<{ product: MarketplaceProduct; onBuy: (product: MarketplaceProduct) => void; }> = ({ product, onBuy }) => (
    <Card className="flex flex-col h-full">
        {/* Product Image */}
        <div className="aspect-video bg-gray-700 rounded-t-xl overflow-hidden">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        </div>
        {/* Product Details */}
        <div className="p-4 flex-grow flex flex-col">
            <h3 className="text-lg font-semibold text-white">{product.name}</h3>
            <p className="text-sm text-gray-400 mt-1"><span className="font-semibold text-cyan-300">Plato's Insight:</span> {product.aiJustification}</p>
            {/* Spacer to push the price and button to the bottom */}
            <div className="flex-grow"></div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700/60">
                <p className="font-mono text-2xl text-cyan-300">${product.price.toFixed(2)}</p>
                <button
                    onClick={() => onBuy(product)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Buy Now
                </button>
            </div>
        </div>
    </Card>
);

/**
 * @description A loading skeleton component displayed while the AI is curating products.
 */
const MarketplaceSkeleton: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-96">
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
            <div className="absolute inset-4 border-4 border-t-cyan-500 border-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-white text-lg mt-6 font-semibold animate-pulse">Plato is curating your products...</p>
        <p className="text-gray-400 mt-1">Analyzing your preferences to find the perfect recommendations.</p>
    </div>
);


// ================================================================================================
// MAIN VIEW COMPONENT: MarketplaceView (Agora AI)
// ================================================================================================

const MarketplaceView: React.FC = () => {
    const context = useContext(DataContext);
    const [products, setProducts] = useState<MarketplaceProduct[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!context) {
        throw new Error("MarketplaceView must be within a DataProvider.");
    }
    
    // FIX: Destructure `addProductToTransactions` from context to resolve property not found error.
    const { transactions, addProductToTransactions } = context;

    /**
     * @description Fetches personalized product recommendations from the Gemini API
     * based on the user's recent transaction history.
     * @param {Transaction[]} userTransactions - The list of user transactions for context.
     */
    const fetchMarketplaceProducts = async (userTransactions: Transaction[]) => {
        setIsLoading(true);
        setError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            // Create a concise summary of recent purchases to use as context for the AI.
            const transactionSummary = userTransactions.slice(0, 10).map(t => t.description).join(', ');
            const prompt = `Based on these recent purchases (${transactionSummary}), generate 5 diverse, compelling, and slightly futuristic product recommendations. Provide a short, one-sentence justification for each recommendation from the AI's perspective. The products should be interesting and varied.`;

            // Define the schema for the expected JSON response from the AI.
            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    products: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                price: { type: Type.NUMBER },
                                category: { type: Type.STRING },
                                aiJustification: { type: Type.STRING }
                            }
                        }
                    }
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema
                }
            });
        
            const parsed = JSON.parse(response.text);
            // Enrich the AI-generated data with unique IDs and placeholder images.
            const productsWithIds = parsed.products.map((p: any, i: number) => ({
                ...p,
                id: `prod_${Date.now()}_${i}`,
                imageUrl: `https://source.unsplash.com/random/400x300?${p.name.split(' ').join(',')}`
            }));
            setProducts(productsWithIds);
        } catch (error) {
            console.error("Error fetching marketplace products:", error);
            setError("Plato AI encountered an error while curating your products. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Fetch products on component mount if they haven't been loaded yet.
    useEffect(() => {
        if (products.length === 0 && transactions.length > 0) {
            fetchMarketplaceProducts(transactions);
        }
    }, [transactions]);

    /**
     * @description Handles the "Buy Now" action for a product.
     * It adds the purchase as a new transaction in the user's history.
     * @param {MarketplaceProduct} product - The product being purchased.
     */
    const handleBuy = (product: MarketplaceProduct) => {
        addProductToTransactions(product);
        // Provide user feedback. In a real app, this would be a more robust notification.
        alert(`${product.name} purchased! The transaction has been added to your history.`);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Plato's Marketplace (Agora AI)</h2>
            <Card>
                <p className="text-gray-400 mb-6 text-sm">
                    Our AI, Plato, has analyzed your recent spending patterns to curate a list of products and services you might find valuable. This is personalization that goes beyond simple recommendations, offering a glimpse into possibilities tailored just for you.
                </p>
                {isLoading && <MarketplaceSkeleton />}
                {error && <p className="text-center text-red-400 py-12">{error}</p>}
                {!isLoading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} onBuy={handleBuy} />
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default MarketplaceView;


// --- CONSOLIDATED FROM: ./views/personal/MarketplaceView.tsx ---

// components/views/personal/MarketplaceView.tsx
import React, { useContext, useEffect, useState } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import type { MarketplaceProduct, View } from '../../../types';
import { GoogleGenAI, Type } from "@google/genai";

const MarketplaceView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("MarketplaceView must be within a DataProvider.");
    
    const { marketplaceProducts, fetchMarketplaceProducts, isMarketplaceLoading, addProductToTransactions } = context;

    useEffect(() => {
        if (marketplaceProducts.length === 0) {
            fetchMarketplaceProducts();
        }
    }, []);

    const handleBuy = (product: MarketplaceProduct) => {
        addProductToTransactions(product);
        alert(`${product.name} purchased! The transaction has been added to your history.`);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Plato's Marketplace</h2>
            <Card>
                <p className="text-gray-400 mb-6">Our AI, Plato, has analyzed your recent spending patterns to curate a list of products and services you might find valuable. This is personalization that goes beyond simple recommendations.</p>
                {isMarketplaceLoading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                         <div className="relative w-24 h-24"><div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div><div className="absolute inset-4 border-4 border-t-cyan-500 border-transparent rounded-full animate-spin"></div></div>
                         <p className="text-white text-lg mt-6 font-semibold animate-pulse">Plato is curating your products...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {marketplaceProducts.map(product => (
                            <Card key={product.id} className="flex flex-col">
                                <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-t-xl" />
                                <div className="p-4 flex-grow flex flex-col">
                                    <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                                    <p className="text-sm text-gray-400 flex-grow mt-2">{product.aiJustification}</p>
                                    <div className="flex justify-between items-center mt-4">
                                        <p className="font-mono text-xl text-cyan-300">${product.price.toFixed(2)}</p>
                                        <button onClick={() => handleBuy(product)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">Buy Now</button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default MarketplaceView;


// --- CONSOLIDATED FROM: ./components/MarketplaceView (1).tsx ---



// --- CONSOLIDATED FROM: MarketplaceView (1)_1.tsx ---

import React, { useContext, useState, useEffect, useReducer, useCallback, useMemo, FC, ChangeEvent, FormEvent, ReactNode } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import type { MarketplaceProduct, View } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

//================================================================================================
// TYPE DEFINITIONS
//================================================================================================

/**
 * Represents the author of an AI agent.
 */
export interface AgentAuthor {
    id: string;
    name: string;
    avatarUrl: string;
    profileUrl: string;
    verified: boolean;
    bio: string;
    agentsPublished: number;
}

/**
 * Represents a user review for an AI agent.
 */
export interface AgentReview {
    id: string;
    author: {
        name: string;
        avatarUrl: string;
    };
    rating: number; // 1-5
    comment: string;
    createdAt: Date;
    helpfulVotes: number;
}

/**
 * Represents the pricing model for an AI agent.
 */
export interface AgentPricing {
    type: 'one-time' | 'subscription' | 'free';
    amount: number; // in USD
    subscriptionInterval?: 'monthly' | 'yearly';
}

/**
 * Technical specifications for the agent.
 */
export interface AgentSpecs {
    version: string;
    releaseDate: Date;
    requiredApiVersion: string;
    dependencies: string[];
    supportedLanguages: string[];
    computeRequirements: {
        cpu: string;
        ram: string;
        gpu?: string;
    };
}

/**
 * Represents a single version in the agent's changelog.
 */
export interface AgentChangelogEntry {
    version: string;
    releaseDate: Date;
    changes: string[];
}

/**
 * Core interface for an AI Agent in the marketplace.
 */
export interface Agent {
    id: string;
    name: string;
    author: AgentAuthor;
    category: string;
    tags: string[];
    shortDescription: string;
    longDescription: string;
    imageUrl: string;
    rating: number; // average rating 1-5
    reviewCount: number;
    reviews: AgentReview[];
    pricing: AgentPricing;
    specs: AgentSpecs;
    changelog: AgentChangelogEntry[];
    downloads: number;
    createdAt: Date;
    updatedAt: Date;
    featured: boolean;
    documentationUrl: string;
    demoUrl?: string;
}

//================================================================================================
// MOCK DATA GENERATION
// This section simulates a real-world backend by providing extensive mock data.
//================================================================================================

const MOCK_AUTHORS: AgentAuthor[] = [
    { id: 'author-1', name: 'SynthCore Labs', avatarUrl: 'https://i.pravatar.cc/40?u=synthcore', profileUrl: '#', verified: true, bio: 'Pioneering AI for financial markets.', agentsPublished: 5 },
    { id: 'author-2', name: 'DataWeaver Inc.', avatarUrl: 'https://i.pravatar.cc/40?u=dataweaver', profileUrl: '#', verified: true, bio: 'Weaving intelligence from raw data.', agentsPublished: 8 },
    { id: 'author-3', name: 'LogicForge AI', avatarUrl: 'https://i.pravatar.cc/40?u=logicforge', profileUrl: '#', verified: false, bio: 'Crafting bespoke AI solutions for business automation.', agentsPublished: 3 },
    { id: 'author-4', name: 'QuantumLeap AI', avatarUrl: 'https://i.pravatar.cc/40?u=quantumleap', profileUrl: '#', verified: true, bio: 'Next-generation AI for complex problem solving.', agentsPublished: 12 },
    { id: 'author-5', name: 'Eva Neuro', avatarUrl: 'https://i.pravatar.cc/40?u=eva', profileUrl: '#', verified: false, bio: 'Independent researcher focusing on NLP agents.', agentsPublished: 2 },
];

const MOCK_CATEGORIES = ['Finance', 'Marketing', 'Data Analysis', 'Customer Support', 'Content Creation', 'Code Generation', 'Personal Assistant'];

const MOCK_TAGS = ['stocks', 'crypto', 'reporting', 'automation', 'seo', 'chat', 'email', 'analytics', 'python', 'api', 'research', 'summarization', 'forecasting'];

const MOCK_COMMENTS = [
    "This agent transformed our workflow. Highly recommended!",
    "Decent, but has a steep learning curve.",
    "A game-changer for our marketing team. The automation capabilities are top-notch.",
    "Could use more documentation, but the support team was helpful.",
    "It's good for the price, but lacks some advanced features.",
    "Incredible performance and very reliable. Has not failed us once.",
    "I found a few bugs, but the developer is very responsive and issues fixes quickly.",
    "The best agent in this category, hands down.",
    "Simple, effective, and does exactly what it promises.",
    "Overpriced for what it offers. There are better free alternatives.",
];

/**
 * A utility function to generate a large set of mock agents.
 * @param count The number of agents to generate.
 * @returns An array of mock `Agent` objects.
 */
export const generateMockAgents = (count: number): Agent[] => {
    const agents: Agent[] = [];
    for (let i = 1; i <= count; i++) {
        const author = MOCK_AUTHORS[i % MOCK_AUTHORS.length];
        const category = MOCK_CATEGORIES[i % MOCK_CATEGORIES.length];
        const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const reviews: AgentReview[] = Array.from({ length: Math.floor(Math.random() * 50) + 5 }, (_, k) => ({
            id: `review-${i}-${k}`,
            author: { name: `User ${k + 1}`, avatarUrl: `https://i.pravatar.cc/40?u=reviewuser${i}_${k}` },
            rating: Math.floor(Math.random() * 3) + 3, // 3, 4, or 5
            comment: MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)],
            createdAt: new Date(createdAt.getTime() + Math.random() * (Date.now() - createdAt.getTime())),
            helpfulVotes: Math.floor(Math.random() * 100),
        }));

        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        
        const pricingType = ['one-time', 'subscription', 'free'][i % 3] as 'one-time' | 'subscription' | 'free';
        const pricing: AgentPricing = {
            type: pricingType,
            amount: pricingType === 'free' ? 0 : (pricingType === 'one-time' ? Math.floor(Math.random() * 400) + 99 : Math.floor(Math.random() * 90) + 9),
            ...(pricingType === 'subscription' && { subscriptionInterval: ['monthly', 'yearly'][i % 2] as 'monthly' | 'yearly' })
        };
        
        const changelog: AgentChangelogEntry[] = [
            { version: '1.2.0', releaseDate: new Date(), changes: ['Added new API integration.', 'Improved performance by 20%.', 'Fixed minor UI bugs.'] },
            { version: '1.1.0', releaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), changes: ['Initial support for multi-language output.', 'Refactored core logic.'] },
            { version: '1.0.0', releaseDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), changes: ['Initial public release.'] },
        ];

        agents.push({
            id: `agent-${i}`,
            name: `${category} Master Agent ${i}`,
            author,
            category,
            tags: [...new Set(Array.from({ length: Math.floor(Math.random() * 3) + 2 }, () => MOCK_TAGS[Math.floor(Math.random() * MOCK_TAGS.length)]))],
            shortDescription: `An autonomous AI agent specializing in ${category.toLowerCase()} tasks and automation.`,
            longDescription: `This is a comprehensive description for the ${category} Master Agent ${i}. It leverages state-of-the-art machine learning models to provide unparalleled insights and automation capabilities. Whether you're a small business or a large enterprise, this agent can be configured to meet your specific needs, streamlining workflows and boosting productivity. It features a user-friendly interface for configuration and monitoring.`,
            imageUrl: `https://picsum.photos/seed/agent${i}/600/400`,
            rating: parseFloat(avgRating.toFixed(1)),
            reviewCount: reviews.length,
            reviews,
            pricing,
            specs: {
                version: '1.2.0',
                releaseDate: new Date(),
                requiredApiVersion: 'v2.1',
                dependencies: ['Node.js v18+', 'Python 3.9+', 'Docker'],
                supportedLanguages: ['English', 'Spanish', 'German'],
                computeRequirements: {
                    cpu: '4 cores',
                    ram: '16GB',
                    gpu: (i % 3 === 0) ? 'NVIDIA RTX 3080 or equivalent' : undefined,
                },
            },
            changelog,
            downloads: Math.floor(Math.random() * 10000) + 500,
            createdAt,
            updatedAt: new Date(createdAt.getTime() + Math.random() * (Date.now() - createdAt.getTime())),
            featured: i % 10 === 0,
            documentationUrl: '#',
            demoUrl: i % 5 === 0 ? '#' : undefined,
        });
    }
    return agents;
};

//================================================================================================
// STATE MANAGEMENT (useReducer)
//================================================================================================

export type FilterState = {
    searchQuery: string;
    categories: Set<string>;
    minRating: number;
    maxPrice: number;
    pricingTypes: Set<'one-time' | 'subscription' | 'free'>;
    tags: Set<string>;
    verifiedAuthor: boolean;
};

export type FilterAction =
    | { type: 'SET_SEARCH_QUERY'; payload: string }
    | { type: 'TOGGLE_CATEGORY'; payload: string }
    | { type: 'SET_MIN_RATING'; payload: number }
    | { type: 'SET_MAX_PRICE'; payload: number }
    | { type: 'TOGGLE_PRICING_TYPE'; payload: 'one-time' | 'subscription' | 'free' }
    | { type: 'TOGGLE_TAG'; payload: string }
    | { type: 'TOGGLE_VERIFIED_AUTHOR' }
    | { type: 'RESET_FILTERS' };

export const initialFilterState: FilterState = {
    searchQuery: '',
    categories: new Set(),
    minRating: 0,
    maxPrice: 500,
    pricingTypes: new Set(),
    tags: new Set(),
    verifiedAuthor: false,
};

export function filterReducer(state: FilterState, action: FilterAction): FilterState {
    switch (action.type) {
        case 'SET_SEARCH_QUERY':
            return { ...state, searchQuery: action.payload };
        case 'TOGGLE_CATEGORY': {
            const newCategories = new Set(state.categories);
            if (newCategories.has(action.payload)) {
                newCategories.delete(action.payload);
            } else {
                newCategories.add(action.payload);
            }
            return { ...state, categories: newCategories };
        }
        case 'SET_MIN_RATING':
            return { ...state, minRating: action.payload };
        case 'SET_MAX_PRICE':
            return { ...state, maxPrice: action.payload };
        case 'TOGGLE_PRICING_TYPE': {
            const newPricingTypes = new Set(state.pricingTypes);
            if (newPricingTypes.has(action.payload)) {
                newPricingTypes.delete(action.payload);
            } else {
                newPricingTypes.add(action.payload);
            }
            return { ...state, pricingTypes: newPricingTypes };
        }
        case 'TOGGLE_TAG': {
            const newTags = new Set(state.tags);
            if (newTags.has(action.payload)) {
                newTags.delete(action.payload);
            } else {
                newTags.add(action.payload);
            }
            return { ...state, tags: newTags };
        }
        case 'TOGGLE_VERIFIED_AUTHOR':
            return { ...state, verifiedAuthor: !state.verifiedAuthor };
        case 'RESET_FILTERS':
            return initialFilterState;
        default:
            return state;
    }
}

//================================================================================================
// HELPER & UTILITY COMPONENTS
//================================================================================================

const Star: FC<{ filled?: boolean; half?: boolean }> = ({ filled, half }) => {
    const starPath = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";
    
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20">
            <defs>
                {half && (
                    <linearGradient id="half-gradient">
                        <stop offset="50%" stopColor="currentColor" className="text-yellow-400" />
                        <stop offset="50%" stopColor="currentColor" className="text-gray-600" />
                    </linearGradient>
                )}
            </defs>
            <path d={starPath} fill={half ? "url(#half-gradient)" : "currentColor"} className={filled ? 'text-yellow-400' : 'text-gray-600'} />
        </svg>
    )
};

/**
 * A reusable component for rendering star ratings.
 */
export const StarRating: FC<{ rating: number; className?: string }> = ({ rating, className = '' }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <div className={`flex items-center text-yellow-400 ${className}`}>
            {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} filled />)}
            {halfStar && <Star half />}
            {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} />)}
        </div>
    );
};

/**
 * A simple loading spinner component.
 */
export const LoadingSpinner: FC = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
    </div>
);

/**
 * A component to display when no results are found.
 */
export const NoResults: FC<{ onReset: () => void }> = ({ onReset }) => (
    <div className="text-center py-16 px-4 bg-gray-800 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-white">No Agents Found</h3>
        <p className="mt-1 text-sm text-gray-400">
            We couldn't find any agents matching your criteria. Try adjusting your filters.
        </p>
        <div className="mt-6">
            <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
            >
                Reset Filters
            </button>
        </div>
    </div>
);

/**
 * A generic modal component.
 */
export const Modal: FC<{ isOpen: boolean; onClose: () => void; title: string; children: ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0" onClick={onClose}></div>
            <div className="relative bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-4xl sm:w-full">
                <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-700">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl leading-6 font-medium text-white" id="modal-title">
                            {title}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <span className="sr-only">Close</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="bg-gray-900 px-4 pt-5 pb-4 sm:p-6 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * Custom hook for managing pagination logic.
 */
export const usePagination = <T,>(items: T[], itemsPerPage: number) => {
    const [currentPage, setCurrentPage] = useState(1);
    const maxPage = Math.ceil(items.length / itemsPerPage);

    const currentData = useMemo(() => {
        const begin = (currentPage - 1) * itemsPerPage;
        const end = begin + itemsPerPage;
        return items.slice(begin, end);
    }, [items, currentPage, itemsPerPage]);

    const next = () => {
        setCurrentPage((page) => Math.min(page + 1, maxPage));
    };

    const prev = () => {
        setCurrentPage((page) => Math.max(page - 1, 1));
    };

    const jump = (page: number) => {
        const pageNumber = Math.max(1, page);
        setCurrentPage(Math.min(pageNumber, maxPage));
    };
    
    useEffect(() => {
        if(currentPage > maxPage && maxPage > 0) {
            setCurrentPage(maxPage);
        } else if (items.length > 0 && currentPage === 0) {
            setCurrentPage(1);
        }
    }, [items, maxPage, currentPage]);

    return { next, prev, jump, currentData, currentPage, maxPage };
};


//================================================================================================
// UI SUB-COMPONENTS
// These components make up the building blocks of the marketplace UI.
//================================================================================================

/**
 * The search bar component at the top of the marketplace.
 */
export const SearchBar: FC<{ query: string; onSearch: (query: string) => void }> = ({ query, onSearch }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
        <input
            type="text"
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
            placeholder="Search for agents by name, tag, or description..."
            className="block w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
        />
    </div>
);


/**
 * The sidebar containing all filtering options.
 */
export const FilterSidebar: FC<{ state: FilterState; dispatch: React.Dispatch<FilterAction> }> = ({ state, dispatch }) => {
    return (
        <aside className="w-full lg:w-1/4 xl:w-1/5 p-4 bg-gray-800/50 rounded-lg h-full self-start sticky top-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                <button
                    onClick={() => dispatch({ type: 'RESET_FILTERS' })}
                    className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                    Reset
                </button>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
                <h4 className="font-semibold text-gray-300 mb-2">Category</h4>
                {MOCK_CATEGORIES.map(category => (
                    <div key={category} className="flex items-center mb-1">
                        <input
                            id={`cat-${category}`}
                            type="checkbox"
                            checked={state.categories.has(category)}
                            onChange={() => dispatch({ type: 'TOGGLE_CATEGORY', payload: category })}
                            className="h-4 w-4 rounded border-gray-500 text-cyan-600 bg-gray-700 focus:ring-cyan-500"
                        />
                        <label htmlFor={`cat-${category}`} className="ml-2 text-sm text-gray-400">{category}</label>
                    </div>
                ))}
            </div>

            {/* Rating Filter */}
            <div className="mb-6">
                <h4 className="font-semibold text-gray-300 mb-2">Minimum Rating</h4>
                <div className="flex items-center space-x-2">
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={state.minRating}
                        onChange={(e) => dispatch({ type: 'SET_MIN_RATING', payload: parseFloat(e.target.value) })}
                        className="w-full"
                    />
                    <span className="text-sm text-gray-300 font-mono w-8 text-center">{state.minRating.toFixed(1)}</span>
                </div>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
                <h4 className="font-semibold text-gray-300 mb-2">Max Price</h4>
                <div className="flex items-center space-x-2">
                     <input
                        type="range"
                        min="0"
                        max="500"
                        step="10"
                        value={state.maxPrice}
                        onChange={(e) => dispatch({ type: 'SET_MAX_PRICE', payload: parseInt(e.target.value) })}
                        className="w-full"
                    />
                    <span className="text-sm text-gray-300 font-mono w-12 text-center">${state.maxPrice}</span>
                </div>
                <div className="mt-2 space-y-1">
                    {(['free', 'one-time', 'subscription'] as const).map(type => (
                        <div key={type} className="flex items-center">
                            <input
                                id={`price-${type}`}
                                type="checkbox"
                                checked={state.pricingTypes.has(type)}
                                onChange={() => dispatch({ type: 'TOGGLE_PRICING_TYPE', payload: type })}
                                className="h-4 w-4 rounded border-gray-500 text-cyan-600 bg-gray-700 focus:ring-cyan-500"
                            />
                            <label htmlFor={`price-${type}`} className="ml-2 text-sm text-gray-400 capitalize">{type}</label>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Author Filter */}
            <div className="mb-6">
                 <h4 className="font-semibold text-gray-300 mb-2">Author</h4>
                 <div className="flex items-center">
                     <input
                         id="verified-author"
                         type="checkbox"
                         checked={state.verifiedAuthor}
                         onChange={() => dispatch({ type: 'TOGGLE_VERIFIED_AUTHOR' })}
                         className="h-4 w-4 rounded border-gray-500 text-cyan-600 bg-gray-700 focus:ring-cyan-500"
                     />
                     <label htmlFor="verified-author" className="ml-2 text-sm text-gray-400">Verified Author Only</label>
                 </div>
            </div>

            {/* Tag Filter */}
            <div>
                 <h4 className="font-semibold text-gray-300 mb-2">Tags</h4>
                 <div className="flex flex-wrap gap-2">
                     {MOCK_TAGS.map(tag => (
                         <button
                            key={tag}
                            onClick={() => dispatch({ type: 'TOGGLE_TAG', payload: tag })}
                            className={`px-2 py-1 text-xs rounded-full border ${state.tags.has(tag) ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
                         >
                           {tag}
                         </button>
                     ))}
                 </div>
            </div>
        </aside>
    );
};

/**
 * A card representing a single agent in the grid view.
 */
export const AgentCard: FC<{ agent: Agent; onSelect: (agent: Agent) => void }> = ({ agent, onSelect }) => (
    <div 
        className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer flex flex-col"
        onClick={() => onSelect(agent)}
    >
        <img className="w-full h-40 object-cover bg-gray-700" src={agent.imageUrl} alt={agent.name} />
        <div className="p-4 flex flex-col flex-grow">
            <div className="flex justify-between items-start">
                <p className="text-sm text-cyan-400">{agent.category}</p>
                <div className="text-lg font-bold text-green-400">
                    {agent.pricing.type === 'free' ? 'Free' : `$${agent.pricing.amount}`}
                    {agent.pricing.type === 'subscription' && <span className="text-xs text-gray-400">/{agent.pricing.subscriptionInterval === 'monthly' ? 'mo' : 'yr'}</span>}
                </div>
            </div>
            <h3 className="text-lg font-semibold text-white mt-1">{agent.name}</h3>
            <div className="flex items-center mt-1">
                <img src={agent.author.avatarUrl} alt={agent.author.name} className="h-6 w-6 rounded-full mr-2" />
                <span className="text-sm text-gray-400">{agent.author.name}</span>
                {agent.author.verified && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-500 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44-1.22a.75.75 0 00-1.06 0L8.25 6.19 6.31 4.25a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.06 0l4.5-4.5a.75.75 0 000-1.06z" clipRule="evenodd" />
                    </svg>
                )}
            </div>
            <p className="text-sm text-gray-400 mt-2 flex-grow">{agent.shortDescription}</p>
            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                <div className="flex items-center">
                    <StarRating rating={agent.rating} />
                    <span className="text-xs text-gray-500 ml-2">({agent.reviewCount})</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 8.586V3a1 1 0 10-2 0v5.586L8.707 7.293zM3 11a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                    </svg>
                    {agent.downloads.toLocaleString()}
                </div>
            </div>
        </div>
    </div>
);

/**
 * The pagination controls for the agent grid.
 */
export const Pagination: FC<{ currentPage: number; maxPage: number; onJump: (page: number) => void }> = ({ currentPage, maxPage, onJump }) => {
    if (maxPage <= 1) return null;

    const pageNumbers: (number | '...')[] = [];
    if (maxPage <= 7) {
        for (let i = 1; i <= maxPage; i++) {
            pageNumbers.push(i);
        }
    } else {
        pageNumbers.push(1);
        if (currentPage > 3) {
            pageNumbers.push('...');
        }
        if (currentPage > 2) {
            pageNumbers.push(currentPage - 1);
        }
        if (currentPage > 1 && currentPage < maxPage) {
            pageNumbers.push(currentPage);
        }
        if (currentPage < maxPage - 1) {
            pageNumbers.push(currentPage + 1);
        }
        if (currentPage < maxPage - 2) {
            pageNumbers.push('...');
        }
        pageNumbers.push(maxPage);
    }

    return (
        <nav className="flex items-center justify-between py-3 text-white" aria-label="Pagination">
            <div className="hidden sm:block">
                <p className="text-sm text-gray-400">
                    Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{maxPage}</span>
                </p>
            </div>
            <div className="flex-1 flex justify-between sm:justify-end">
                <button
                    onClick={() => onJump(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <div className="hidden md:flex items-center mx-2">
                    {pageNumbers.map((page, index) =>
                        page === '...' ? (
                            <span key={index} className="px-4 py-2 text-sm">...</span>
                        ) : (
                            <button
                                key={index}
                                onClick={() => onJump(page as number)}
                                className={`px-4 py-2 border border-gray-600 text-sm font-medium rounded-md mx-1 ${currentPage === page ? 'bg-cyan-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>
                <button
                    onClick={() => onJump(currentPage + 1)}
                    disabled={currentPage === maxPage}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </nav>
    );
};

/**
 * A detailed view of a single agent, shown in a modal.
 */
export const AgentDetailModal: FC<{ agent: Agent | null; onClose: () => void }> = ({ agent, onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews' | 'changelog'>('overview');

    if (!agent) return null;

    const renderTabContent = () => {
        switch(activeTab) {
            case 'specs': return (
                <div className="space-y-4 text-gray-300">
                    <h4 className="text-lg font-semibold text-white">Technical Specifications</h4>
                    <ul className="list-disc list-inside bg-gray-800/50 p-4 rounded-md">
                        <li><strong>Version:</strong> {agent.specs.version} (Released on {agent.specs.releaseDate.toLocaleDateString()})</li>
                        <li><strong>Required API Version:</strong> {agent.specs.requiredApiVersion}</li>
                        <li><strong>Supported Languages:</strong> {agent.specs.supportedLanguages.join(', ')}</li>
                    </ul>
                    <h4 className="text-lg font-semibold text-white mt-4">Dependencies</h4>
                     <ul className="list-disc list-inside bg-gray-800/50 p-4 rounded-md">
                        {agent.specs.dependencies.map(dep => <li key={dep}>{dep}</li>)}
                    </ul>
                    <h4 className="text-lg font-semibold text-white mt-4">Compute Requirements</h4>
                     <ul className="list-disc list-inside bg-gray-800/50 p-4 rounded-md">
                        <li><strong>CPU:</strong> {agent.specs.computeRequirements.cpu}</li>
                        <li><strong>RAM:</strong> {agent.specs.computeRequirements.ram}</li>
                        {agent.specs.computeRequirements.gpu && <li><strong>GPU:</strong> {agent.specs.computeRequirements.gpu}</li>}
                    </ul>
                </div>
            );
            case 'reviews': return (
                <div>
                     <h4 className="text-lg font-semibold text-white mb-4">User Reviews ({agent.reviewCount})</h4>
                     <div className="space-y-6">
                        {agent.reviews.slice(0, 5).map(review => (
                            <div key={review.id} className="border-b border-gray-700 pb-4">
                                <div className="flex items-center mb-2">
                                    <img src={review.author.avatarUrl} alt={review.author.name} className="h-8 w-8 rounded-full mr-3" />
                                    <div>
                                        <p className="font-semibold text-white">{review.author.name}</p>
                                        <p className="text-xs text-gray-500">{review.createdAt.toLocaleDateString()}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <StarRating rating={review.rating} />
                                    </div>
                                </div>
                                <p className="text-gray-400">{review.comment}</p>
                                <p className="text-xs text-gray-500 mt-2">{review.helpfulVotes} people found this helpful.</p>
                            </div>
                        ))}
                     </div>
                </div>
            );
            case 'changelog': return (
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Version History</h4>
                    <div className="space-y-6">
                        {agent.changelog.map(entry => (
                            <div key={entry.version}>
                                <h5 className="font-semibold text-gray-200">Version {entry.version} <span className="text-sm font-normal text-gray-500">- {entry.releaseDate.toLocaleDateString()}</span></h5>
                                <ul className="list-disc list-inside text-gray-400 mt-2 pl-4">
                                    {entry.changes.map((change, i) => <li key={i}>{change}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            );
            case 'overview':
            default:
                 return <p className="text-gray-300 whitespace-pre-wrap">{agent.longDescription}</p>;
        }
    };
    
    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'specs', label: 'Specifications' },
        { id: 'reviews', label: `Reviews (${agent.reviewCount})` },
        { id: 'changelog', label: 'Changelog' },
    ] as const;


    return (
        <Modal isOpen={!!agent} onClose={onClose} title={agent.name}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="md:col-span-2">
                    <img src={agent.imageUrl} alt={agent.name} className="w-full h-64 object-cover rounded-lg bg-gray-700 mb-4" />
                    
                    {/* Tabs */}
                    <div className="border-b border-gray-700 mb-4">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`${
                                        activeTab === tab.id
                                            ? 'border-cyan-500 text-cyan-400'
                                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div>
                        {renderTabContent()}
                    </div>
                </div>

                {/* Right Column */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-green-400 mb-4">
                            {agent.pricing.type === 'free' ? 'Free' : `$${agent.pricing.amount}`}
                            {agent.pricing.type === 'subscription' && <span className="text-base text-gray-400">/{agent.pricing.subscriptionInterval === 'monthly' ? 'mo' : 'yr'}</span>}
                        </div>
                        <button className="w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded hover:bg-cyan-700 transition duration-300">
                           {agent.pricing.type === 'free' ? 'Download' : 'Purchase Agent'}
                        </button>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 space-y-2">
                        <div className="flex justify-between"><span>Version:</span> <span className="font-mono">{agent.specs.version}</span></div>
                        <div className="flex justify-between"><span>Updated:</span> <span>{agent.updatedAt.toLocaleDateString()}</span></div>
                        <div className="flex justify-between"><span>Category:</span> <span className="text-cyan-400">{agent.category}</span></div>
                        <div className="flex justify-between"><span>Downloads:</span> <span>{agent.downloads.toLocaleString()}</span></div>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">Author</h4>
                        <div className="flex items-center">
                            <img src={agent.author.avatarUrl} alt={agent.author.name} className="h-10 w-10 rounded-full mr-3" />
                            <div>
                               <div className="flex items-center">
                                    <p className="font-semibold text-white">{agent.author.name}</p>
                                     {agent.author.verified && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-500 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                           <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44-1.22a.75.75 0 00-1.06 0L8.25 6.19 6.31 4.25a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.06 0l4.5-4.5a.75.75 0 000-1.06z" clipRule="evenodd" />
                                       </svg>
                                    )}
                               </div>
                                <a href={agent.author.profileUrl} className="text-xs text-cyan-400 hover:underline">View Profile</a>
                            </div>
                        </div>
                         <p className="text-xs text-gray-400 mt-2">{agent.author.bio}</p>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {agent.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};


//================================================================================================
// MAIN COMPONENT
//================================================================================================

const AgentMarketplaceView: React.FC = () => {
    const [allAgents, setAllAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [filterState, dispatch] = useReducer(filterReducer, initialFilterState);

    const [sortBy, setSortBy] = useState<'rating' | 'newest' | 'downloads' | 'featured'>('featured');

    // Simulate fetching data from an API
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        // Simulate a network delay
        const timer = setTimeout(() => {
            try {
                const generatedAgents = generateMockAgents(150);
                setAllAgents(generatedAgents);
            } catch (e) {
                setError("Failed to load agent data.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, []);
    
    // Filtering and Sorting Logic
    const filteredAndSortedAgents = useMemo(() => {
        let processedAgents = allAgents.filter(agent => {
            const searchLower = filterState.searchQuery.toLowerCase();
            const nameMatch = agent.name.toLowerCase().includes(searchLower);
            const descMatch = agent.shortDescription.toLowerCase().includes(searchLower);
            const tagMatch = agent.tags.some(t => t.toLowerCase().includes(searchLower));
            const categoryMatch = filterState.categories.size === 0 || filterState.categories.has(agent.category);
            const ratingMatch = agent.rating >= filterState.minRating;
            const priceMatch = (agent.pricing.type === 'free' && filterState.maxPrice >= 0) || (agent.pricing.type !== 'free' && agent.pricing.amount <= filterState.maxPrice);
            const pricingTypeMatch = filterState.pricingTypes.size === 0 || filterState.pricingTypes.has(agent.pricing.type);
            const tagFilterMatch = filterState.tags.size === 0 || agent.tags.some(t => filterState.tags.has(t));
            const authorMatch = !filterState.verifiedAuthor || agent.author.verified;
            
            return (nameMatch || descMatch || tagMatch) && categoryMatch && ratingMatch && priceMatch && pricingTypeMatch && tagFilterMatch && authorMatch;
        });

        // Sorting
        switch (sortBy) {
            case 'featured':
                processedAgents.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating);
                break;
            case 'rating':
                processedAgents.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                processedAgents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                break;
            case 'downloads':
                processedAgents.sort((a, b) => b.downloads - a.downloads);
                break;
        }

        return processedAgents;
    }, [allAgents, filterState, sortBy]);

    const { currentData, currentPage, maxPage, jump } = usePagination(filteredAndSortedAgents, 12);

    const handleSearch = useCallback((query: string) => {
        dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
        jump(1);
    }, [jump]);

    const handleResetFilters = useCallback(() => {
        dispatch({ type: 'RESET_FILTERS' });
        jump(1);
    }, [jump]);

    return (
        <div className="space-y-6">
            <Card title="AI Agent Marketplace" padding="none">
                <div className="p-6 border-b border-gray-700">
                     <p className="text-gray-400 mb-4">Discover, purchase, and deploy autonomous AI agents for various financial and business tasks.</p>
                     <SearchBar query={filterState.searchQuery} onSearch={handleSearch} />
                </div>
                <div className="flex flex-col lg:flex-row">
                    <FilterSidebar state={filterState} dispatch={dispatch} />
                    <main className="w-full lg:w-3/4 xl:w-4/5 p-4">
                        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                            <p className="text-gray-400">Showing {filteredAndSortedAgents.length} agents</p>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-300">Sort by:</span>
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                    className="bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="newest">Newest</option>
                                    <option value="downloads">Most Popular</option>
                                </select>
                            </div>
                        </div>

                        {isLoading ? (
                           <LoadingSpinner />
                        ) : error ? (
                            <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>
                        ) : currentData.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {currentData.map(agent => (
                                        <AgentCard key={agent.id} agent={agent} onSelect={setSelectedAgent} />
                                    ))}
                                </div>
                                <Pagination currentPage={currentPage} maxPage={maxPage} onJump={jump} />
                            </>
                        ) : (
                            <NoResults onReset={handleResetFilters} />
                        )}
                    </main>
                </div>
            </Card>

            <AgentDetailModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
        </div>
    );
};

export default AgentMarketplaceView;

// --- CONSOLIDATED FROM: ./components/MarketplaceView (3).tsx ---



// --- CONSOLIDATED FROM: MarketplaceView (3)_1.tsx ---

import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import './ApiSettingsPage.css';

// =================================================================================
// REFACTOR NOTE (Goal 6, 2, 3): Simplified API Key Management for Core MVP Scope
// The original component managed over 200 non-essential API credentials, which is 
// insecure and unmanageable. We have removed the sprawling configuration to focus 
// the system on the core MVP: Multi-bank aggregation, Treasury automation, and AI 
// intelligence.
// 
// CRITICAL SECURITY NOTE (Goal 3): Actual secrets must be stored in a secure vault 
// (like AWS Secrets Manager/Vault). This UI now only handles essential configuration 
// values that link to secure server-side processes or initiate standard OAuth flows.
// =================================================================================
interface ApiKeysState {
  // Core Infrastructure (Required for accessing AWS services, including Secrets Manager)
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  
  // AI & Transaction Intelligence (Goal 5)
  OPENAI_API_KEY: string;

  // Financial Data Aggregation (Core MVP: Multi-bank aggregation)
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;

  // Payment Processing (Core Fintech necessity)
  STRIPE_SECRET_KEY: string;

  // Accounting Integrations (For Unified Business Financial Dashboard)
  QUICKBOOKS_CLIENT_ID: string;
  QUICKBOOKS_CLIENT_SECRET: string;
  XERO_CLIENT_ID: string;
  XERO_CLIENT_SECRET: string;
  
  [key: string]: string; // Index signature for dynamic access
}


const AgentMarketplaceView: React.FC = () => {
    // Note: Component definition name retained (AgentMarketplaceView) for compatibility, 
    // but the functionality is now dedicated API Integration Settings.
  const [keys, setKeys] = useState<ApiKeysState>({} as ApiKeysState);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Removed activeTab state as the form is now unified and streamlined (Goal 6).

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage('Attempting to securely transmit critical configuration identifiers...');
    
    try {
      // Endpoint updated to reflect secure configuration (Goal 4). 
      // This path must ensure secrets are immediately moved to a secure vault server-side.
      const response = await axios.post('http://localhost:4000/api/settings/configure-keys', keys);
      setStatusMessage(`Success: ${response.data.message}`);
      // Clear form inputs upon successful save for security reasons
      setKeys({} as ApiKeysState); 
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Could not save configuration. Please check backend server status and logs.';
      setStatusMessage(`Error: ${errorMessage}`);
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

  const renderMvpApis = () => (
    <>
      <div className="form-section">
        <h2>Core Cloud & Infrastructure (AWS)</h2>
        <p className="section-description">These credentials link the application to secure backend infrastructure and vault systems (e.g., Secrets Manager) (Goal 3).</p>
        {renderInput('AWS_ACCESS_KEY_ID', 'AWS Access Key ID')}
        {renderInput('AWS_SECRET_ACCESS_KEY', 'AWS Secret Access Key')}
      </div>

      <div className="form-section">
        <h2>AI & Transaction Intelligence</h2>
        <p className="section-description">Key for enabling generative models for enhanced financial analysis and alerting (Goal 5).</p>
        {renderInput('OPENAI_API_KEY', 'OpenAI API Key')}
      </div>

      <div className="form-section">
        <h2>Financial Aggregation & Payments</h2>
        <p className="section-description">Essential integrations for multi-bank account data retrieval and core payment processing (MVP Core).</p>
        {renderInput('PLAID_CLIENT_ID', 'Plaid Client ID')}
        {renderInput('PLAID_SECRET', 'Plaid Secret')}
        {renderInput('STRIPE_SECRET_KEY', 'Stripe Secret Key')}
      </div>

      <div className="form-section">
        <h2>Accounting System Integration</h2>
        <p className="section-description">Credentials for connecting to major accounting systems for the Unified Financial Dashboard MVP.</p>
        {renderInput('QUICKBOOKS_CLIENT_ID', 'QuickBooks Client ID')}
        {renderInput('QUICKBOOKS_CLIENT_SECRET', 'QuickBooks Client Secret')}
        {renderInput('XERO_CLIENT_ID', 'Xero Client ID')}
        {renderInput('XERO_CLIENT_SECRET', 'Xero Client Secret')}
      </div>
    </>
  );

  return (
    <div className="settings-container">
      <h1>MVP Integration Configuration</h1>
      <p className="subtitle">
        Securely configure required system identifiers for the core Financial Intelligence platform. 
        Only 10 critical keys are exposed here. All other configurations are handled via server-side secrets management.
      </p>

      <form onSubmit={handleSubmit} className="settings-form">
        {renderMvpApis()}
        
        <div className="form-footer">
          <button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? 'Saving Configuration...' : 'Save Configuration to Backend'}
          </button>
          {statusMessage && <p className={`status-message ${statusMessage.startsWith('Error') ? 'error' : 'success'}`}>{statusMessage}</p>}
        </div>
      </form>
    </div>
  );
};

export default AgentMarketplaceView;

// --- CONSOLIDATED FROM: ./components/views/personal/MarketplaceView.tsx ---

// components/views/personal/MarketplaceView.tsx
import React, { useContext, useEffect, useState } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import type { MarketplaceProduct, View } from '../../../types';
import { GoogleGenAI, Type } from "@google/genai";

const MarketplaceView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("MarketplaceView must be within a DataProvider.");
    
    const { marketplaceProducts, fetchMarketplaceProducts, isMarketplaceLoading, addProductToTransactions } = context;

    useEffect(() => {
        if (marketplaceProducts.length === 0) {
            fetchMarketplaceProducts();
        }
    }, []);

    const handleBuy = (product: MarketplaceProduct) => {
        addProductToTransactions(product);
        alert(`${product.name} purchased! The transaction has been added to your history.`);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Plato's Marketplace</h2>
            <Card>
                <p className="text-gray-400 mb-6">Our AI, Plato, has analyzed your recent spending patterns to curate a list of products and services you might find valuable. This is personalization that goes beyond simple recommendations.</p>
                {isMarketplaceLoading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                         <div className="relative w-24 h-24"><div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div><div className="absolute inset-4 border-4 border-t-cyan-500 border-transparent rounded-full animate-spin"></div></div>
                         <p className="text-white text-lg mt-6 font-semibold animate-pulse">Plato is curating your products...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {marketplaceProducts.map(product => (
                            <Card key={product.id} className="flex flex-col">
                                <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-t-xl" />
                                <div className="p-4 flex-grow flex flex-col">
                                    <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                                    <p className="text-sm text-gray-400 flex-grow mt-2">{product.aiJustification}</p>
                                    <div className="flex justify-between items-center mt-4">
                                        <p className="font-mono text-xl text-cyan-300">${product.price.toFixed(2)}</p>
                                        <button onClick={() => handleBuy(product)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">Buy Now</button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default MarketplaceView;
