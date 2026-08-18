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
