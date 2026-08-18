// components/views/megadashboard/analytics/DataCatalogView.tsx
import React, { useState, useContext } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";
import { DataContext } from '../../../../context/DataContext';
import type { DataSet } from '../../../../types';

const DataCatalogView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("DataCatalogView must be within DataProvider");
    
    const { dataCatalogItems } = context;

    const [searchTerm, setSearchTerm] = useState("Show me data about customer lifetime value");
    const [results, setResults] = useState<DataSet[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDataset, setSelectedDataset] = useState<DataSet | null>(null);
    const [aiExplanation, setAiExplanation] = useState('');
    const [isExplaining, setIsExplaining] = useState(false);

    const handleSearch = async () => {
        setIsLoading(true);
        // AI-powered search simulation
        setTimeout(() => {
            setResults(dataCatalogItems.filter(d => d.description.toLowerCase().includes('customer') || d.name.toLowerCase().includes('customer')));
            setIsLoading(false);
        }, 1000);
    };

    const explainColumn = async (column: { name: string; type: string; description: string }) => {
        setIsExplaining(true);
        setAiExplanation('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `In simple terms, explain what the data column "${column.name}" (type: ${column.type}) with description "${column.description}" likely represents and how it might be used.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setAiExplanation(response.text);
        } catch (err) { console.error(err); } finally { setIsExplaining(false); }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">AI Data Catalog</h2>
            <Card>
                <div className="flex gap-2">
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Ask about data, e.g., 'Find datasets about user churn'" className="w-full bg-gray-700/50 p-3 rounded-lg text-white" />
                    <button onClick={handleSearch} disabled={isLoading} className="px-6 bg-cyan-600 hover:bg-cyan-700 rounded-lg disabled:opacity-50">{isLoading ? '...' : 'Search'}</button>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-2">Search Results</h3>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {results.map(ds => (
                        <div key={ds.id} onClick={() => { setSelectedDataset(ds); setAiExplanation(''); }} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedDataset?.id === ds.id ? 'bg-cyan-500/20' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}>
                            <h4 className="font-semibold text-white">{ds.name}</h4>
                            <p className="text-sm text-gray-400">{ds.description}</p>
                        </div>
                    ))}
                    {isLoading && <p className="text-gray-400">Searching...</p>}
                    </div>
                </div>
                <div className="md:col-span-3">
                    {selectedDataset ? (
                        <Card title={`Details: ${selectedDataset.name}`}>
                             <h4 className="font-semibold text-cyan-300">Schema</h4>
                             <ul className="text-sm space-y-2 mt-2">
                                {selectedDataset.schema.map(col => <li key={col.name} className="flex justify-between items-center p-2 bg-gray-900/50 rounded-md"><span>{col.name} <em className="text-gray-500">{col.type}</em></span><button onClick={() => explainColumn(col)} className="text-xs text-cyan-400 hover:underline">Explain with AI</button></li>)}
                             </ul>
                            {(isExplaining || aiExplanation) && <div className="mt-4 p-3 bg-gray-900/50 rounded text-xs text-gray-300 italic">{isExplaining ? 'Thinking...' : `"${aiExplanation}"`}</div>}
                        </Card>
                    ) : <div className="flex items-center justify-center h-full text-gray-500">Select a dataset to view details</div>}
                </div>
            </div>
        </div>
    );
};

export default DataCatalogView;