// components/views/platform/EconomicSynthesisEngineView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ParameterSlider: React.FC<{label: string, value: number, min: number, max: number, step: number, onChange: (value: number) => void, format: (value: number) => string}> = ({ label, value, min, max, step, onChange, format }) => (
    <div>
        <div className="flex justify-between items-baseline mb-1"><label className="block text-sm font-medium text-gray-300">{label}</label><span className="text-sm font-mono text-cyan-300">{format(value)}</span></div>
        <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-cyan" />
    </div>
);

const EconomicSynthesisEngineView: React.FC = () => {
    const [params, setParams] = useState({
        interestRate: 2.5,
        fiscalSpending: 20, // as % of GDP
        riskAversion: 0.5, // 0 to 1
        techShock: 0.02, // 2% annual shock
    });
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);

    const handleSimulate = async () => {
        setIsLoading(true);
        setResult(null);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const prompt = `You are a world-class macroeconomic simulator. Run a 10-year agent-based model simulation for a synthetic economy with the following parameters:
- Base Interest Rate: ${params.interestRate}%
- Fiscal Spending: ${params.fiscalSpending}% of GDP
- Agent Risk Aversion: ${params.riskAversion}
- Annual Technological Shock Rate: ${params.techShock * 100}%

Provide a narrative summary of the economic trajectory and a JSON object with a time-series array for 'gdp' (in billions), 'inflation' (%), and 'unemployment' (%).`;
            
            const schema = {
                type: Type.OBJECT, properties: {
                    narrativeSummary: { type: Type.STRING },
                    timeSeries: { type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            year: { type: Type.NUMBER },
                            gdp: { type: Type.NUMBER },
                            inflation: { type: Type.NUMBER },
                            unemployment: { type: Type.NUMBER },
                        }
                    }}
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: schema }
            });
            setResult(JSON.parse(response.text));

        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Economic Synthesis Engine</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card title="Economic Parameters">
                        <div className="space-y-4">
                            <ParameterSlider label="Base Interest Rate" value={params.interestRate} min={0} max={10} step={0.25} onChange={v => setParams(p => ({...p, interestRate: v}))} format={v => `${v.toFixed(2)}%`} />
                            <ParameterSlider label="Fiscal Spending (% GDP)" value={params.fiscalSpending} min={10} max={50} step={1} onChange={v => setParams(p => ({...p, fiscalSpending: v}))} format={v => `${v}%`} />
                            <ParameterSlider label="Agent Risk Aversion" value={params.riskAversion} min={0} max={1} step={0.1} onChange={v => setParams(p => ({...p, riskAversion: v}))} format={v => v.toFixed(1)} />
                            <ParameterSlider label="Tech Innovation Rate" value={params.techShock} min={0} max={0.1} step={0.01} onChange={v => setParams(p => ({...p, techShock: v}))} format={v => `${(v*100).toFixed(0)}%`} />
                            <button onClick={handleSimulate} disabled={isLoading} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg disabled:opacity-50 mt-4">{isLoading ? 'Simulating...' : 'Run 10-Year Simulation'}</button>
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card title="Simulation Results">
                        <div className="min-h-[400px]">
                            {isLoading && <p>Synthesizing economic trajectory...</p>}
                            {result ? (
                                <div className="space-y-4">
                                    <p className="text-sm italic text-gray-300">"{result.narrativeSummary}"</p>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={result.timeSeries}>
                                            <XAxis dataKey="year" stroke="#9ca3af" />
                                            <YAxis stroke="#9ca3af" />
                                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                                            <Legend />
                                            <Area type="monotone" dataKey="gdp" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="GDP (Billions)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : !isLoading && <p className="text-gray-500">Simulation output will appear here.</p>}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EconomicSynthesisEngineView;