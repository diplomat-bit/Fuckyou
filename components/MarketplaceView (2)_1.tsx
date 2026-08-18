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
