// components/views/megadashboard/ecosystem/MultiCurrencyView.tsx
import React, { useState } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

const MultiCurrencyView: React.FC = () => {
    const [isForecastModalOpen, setForecastModalOpen] = useState(false);
    const [currencyPair, setCurrencyPair] = useState("USD/EUR");
    const [forecast, setForecast] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleGenerate = async () => {
        setIsLoading(true);
        setForecast('');
        try {
            // NOTE: The API key is not needed for this specific endpoint as per the OpenAPI spec.
            // However, the GoogleGenAI library requires an API key for initialization.
            // For this example, we'll use a placeholder. In a real application,
            // you would fetch this securely or use a different method if the library allowed.
            const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || "YOUR_PLACEHOLDER_API_KEY"; // Replace with your actual key or fetch securely
            const genAI = new GoogleGenAI({ apiKey: API_KEY });
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `Provide a brief, high-level FX volatility forecast for the currency pair "${currencyPair}" for the next 30 days.`;
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            setForecast(text);
        } catch (err) {
            console.error("Error generating forecast:", err);
            setForecast("Error generating forecast. Please check console for details.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Multi-Currency Accounts</h2>
                     <button onClick={() => setForecastModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI FX Forecast</button>
                </div>
                <Card title="Account Balances">
                    <p className="text-gray-400">This section would show wallet balances for different currencies like USD, EUR, GBP, etc.</p>
                </Card>
            </div>
             {isForecastModalOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setForecastModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI FX Volatility Forecast</h3></div>
                        <div className="p-6 space-y-4">
                             <input type="text" value={currencyPair} onChange={e => setCurrencyPair(e.target.value)} className="w-full bg-gray-700/50 p-2 rounded text-white" />
                             <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50">{isLoading ? 'Generating...' : 'Generate Forecast'}</button>
                            <Card title={`Forecast for ${currencyPair}`}><div className="min-h-[10rem] text-sm text-gray-300 whitespace-pre-line">{isLoading ? '...' : forecast}</div></Card>
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default MultiCurrencyView;