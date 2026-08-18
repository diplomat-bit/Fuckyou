// components/views/megadashboard/infra/ContainerRegistryView.tsx
import React, { useContext, useState } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { GoogleGenAI } from "@google/genai";

const ContainerRegistryView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("ContainerRegistryView must be within DataProvider");
    
    const { containerImages } = context;
    const [isOptimizerOpen, setOptimizerOpen] = useState(false);
    const [dockerfile, setDockerfile] = useState("FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nCMD [\"npm\", \"start\"]");
    const [optimized, setOptimized] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleOptimize = async () => {
        setIsLoading(true); setOptimized('');
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const prompt = `You are a DevOps expert. Analyze this Dockerfile and suggest optimizations for smaller size and better security:\n\`\`\`dockerfile\n${dockerfile}\n\`\`\``;
            const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt});
            setOptimized(response.text);
        } catch(err) { console.error(err); } finally { setIsLoading(false); }
    };
    
    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Container Registry</h2>
                    <button onClick={() => setOptimizerOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Dockerfile Optimizer</button>
                </div>
                <Card title="Image Repository">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30"><tr><th>Repository</th><th>Tag</th><th>Size</th><th>Last Push</th></tr></thead>
                        <tbody>{containerImages.map(img => <tr key={img.id}><td className="px-6 py-4 font-mono text-white">{img.repository}</td><td className="font-mono">{img.tag}</td><td>{img.size}</td><td>{img.lastPush}</td></tr>)}</tbody>
                    </table>
                </Card>
            </div>
            {isOptimizerOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setOptimizerOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Dockerfile Optimizer</h3></div>
                        <div className="p-6 grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                           <textarea value={dockerfile} onChange={e => setDockerfile(e.target.value)} className="w-full h-80 bg-gray-900/50 p-2 rounded font-mono text-sm" />
                           <div className="bg-gray-900/50 p-4 rounded text-sm whitespace-pre-line">{isLoading ? 'Optimizing...' : optimized}</div>
                        </div>
                         <div className="p-4 border-t border-gray-700"><button onClick={handleOptimize} disabled={isLoading} className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50">{isLoading ? '...' : 'Optimize'}</button></div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default ContainerRegistryView;
