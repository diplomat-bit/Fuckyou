// components/views/megadashboard/analytics/DataLakesView.tsx
import React, { useState, useContext } from 'react';
import Card from '../../../Card';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { DataContext } from '../../../../context/DataContext';

const DataLakesView: React.FC = () => {
    const context = useContext(DataContext);
    if(!context) throw new Error("DataLakesView must be within a DataProvider");

    const { dataLakeStats } = context;

    const [prompt, setPrompt] = useState("real-time user clickstream data");
    const [generatedSchema, setGeneratedSchema] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const generateSchema = async () => {
        setIsLoading(true);
        setGeneratedSchema(null);
        try {
            // Using the provided API endpoint directly for schema generation
            const response = await fetch('https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io/ai/oracle/simulate/advanced', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: `You are a data architect AI. Design a simple, effective table schema for a new data source described as: "${prompt}". Provide column names and appropriate data types.`,
                    scenarios: [
                        {
                            name: "Schema Generation",
                            events: [],
                            durationYears: 0,
                            sensitivityAnalysisParams: []
                        }
                    ],
                    globalEconomicFactors: {},
                    personalAssumptions: {}
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const result = await response.json();
            // Assuming the API returns the schema in a predictable format within the response
            // This part might need adjustment based on the actual API response structure
            if (result.scenarioResults && result.scenarioResults.length > 0 && result.scenarioResults[0].narrativeSummary) {
                // Attempt to parse the narrative summary as JSON, assuming it contains the schema
                try {
                    setGeneratedSchema(JSON.parse(result.scenarioResults[0].narrativeSummary));
                } catch (parseError) {
                    console.error("Failed to parse schema from API response:", parseError);
                    setGeneratedSchema({ error: "Could not parse schema from response.", rawResponse: result.scenarioResults[0].narrativeSummary });
                }
            } else {
                setGeneratedSchema({ error: "No schema found in API response.", rawResponse: result });
            }
        } catch (err) {
            console.error("Error generating schema:", err);
            setGeneratedSchema({ error: "An error occurred while generating the schema.", details: (err as Error).message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Data Lake Management</h2>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">22.4 PB</p><p className="text-sm text-gray-400 mt-1">Total Volume</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">1,250</p><p className="text-sm text-gray-400 mt-1">Datasets</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">5.2 TB/day</p><p className="text-sm text-gray-400 mt-1">Ingestion Rate</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">500</p><p className="text-sm text-gray-400 mt-1">Active Queries</p></Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                    <Card title="AI Schema Suggester">
                        <p className="text-sm text-gray-400 mb-4">Describe a new data source to ingest.</p>
                        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full h-24 bg-gray-700/50 p-2 rounded text-white" />
                        <button onClick={generateSchema} disabled={isLoading} className="w-full mt-2 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg disabled:opacity-50">{isLoading ? 'Generating...' : 'Suggest Schema'}</button>
                        {generatedSchema && (
                            <pre className="text-xs mt-4 bg-gray-900/50 p-2 rounded max-h-48 overflow-auto">
                                {JSON.stringify(generatedSchema, null, 2)}
                            </pre>
                        )}
                    </Card>
                </div>
                <div className="lg:col-span-3">
                    <Card title="Data Volume by Domain (PB)">
                        <ResponsiveContainer width="100%" height={400}>
                            <Treemap data={dataLakeStats} dataKey="size" ratio={16 / 9} stroke="#fff" fill="#8884d8">
                                 <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(value: number) => `${value} PB`}/>
                            </Treemap>
                        </ResponsiveContainer>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DataLakesView;