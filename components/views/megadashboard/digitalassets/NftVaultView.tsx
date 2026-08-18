// components/views/megadashboard/digitalassets/NftVaultView.tsx
import React, { useState } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

const NftVaultView: React.FC = () => {
    const [isValuationModalOpen, setValuationModalOpen] = useState(false);
    const [nftName, setNftName] = useState("CryptoPunk #7804");
    const [valuation, setValuation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleGenerate = async () => {
        setIsLoading(true);
        setValuation('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Provide a brief, high-level valuation analysis for the NFT named "${nftName}", considering its collection, rarity, and recent market trends.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setValuation(response.text);
        } catch (err) {
            setValuation("Error generating valuation.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">NFT Vault</h2>
                     <button onClick={() => setValuationModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Valuation</button>
                </div>
                <Card title="Your Collection">
                     <p className="text-gray-400">This would display a gallery of the user's NFTs.</p>
                </Card>
            </div>
             {isValuationModalOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setValuationModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI NFT Valuation Estimator</h3></div>
                        <div className="p-6 space-y-4">
                             <input type="text" value={nftName} onChange={e => setNftName(e.target.value)} className="w-full bg-gray-700/50 p-2 rounded text-white" />
                             <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50">{isLoading ? 'Estimating...' : 'Estimate Value'}</button>
                            <Card title={`Valuation for ${nftName}`}><div className="min-h-[10rem] text-sm text-gray-300 whitespace-pre-line">{isLoading ? '...' : valuation}</div></Card>
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default NftVaultView;
