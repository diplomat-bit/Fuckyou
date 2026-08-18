// components/views/platform/DemoBankGISView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

const DemoBankGISView: React.FC = () => {
    const [prompt, setPrompt] = useState("a polygon for Central Park in New York City");
    const [generatedGeoJson, setGeneratedGeoJson] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedGeoJson(null);
        try {
            // Using the provided API endpoint directly without an API key
            const response = await fetch("https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io/ai/oracle/simulate/advanced", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: `Generate a simple GeoJSON object for the following location: "${prompt}". Provide a few coordinate points to define the shape.`,
                    scenarios: [
                        {
                            name: "GeoJSON Generation",
                            events: [],
                            sensitivityAnalysisParams: []
                        }
                    ],
                    // The API schema implies these might be expected, even if not used for this specific generation
                    globalEconomicFactors: {},
                    personalAssumptions: {}
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // Assuming the API returns GeoJSON directly or within a specific field
            // Adjust 'data.scenarioResults[0].geojson' based on the actual API response structure
            // For this mock, we'll assume the response contains a 'geojson' field directly
            if (data.scenarioResults && data.scenarioResults.length > 0 && data.scenarioResults[0].geojson) {
                setGeneratedGeoJson(data.scenarioResults[0].geojson);
            } else if (data.geojson) { // Fallback if geojson is at the root
                setGeneratedGeoJson(data.geojson);
            } else {
                // If the API doesn't return GeoJSON directly, we might need to parse a narrative
                // and extract coordinates. For this example, we'll assume a direct GeoJSON response.
                console.error("Unexpected API response format:", data);
                setGeneratedGeoJson({ error: "Could not parse GeoJSON from response." });
            }

        } catch (error) {
            console.error("Error generating GeoJSON:", error);
            setGeneratedGeoJson({ error: `Failed to generate GeoJSON: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank GIS Platform</h2>
            <Card title="AI GeoJSON Generator">
                <p className="text-gray-400 mb-4">Describe a location or shape, and our AI will generate a GeoJSON representation.</p>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full h-24 bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="e.g., A point for the Eiffel Tower"
                />
                <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">
                    {isLoading ? 'Generating...' : 'Generate GeoJSON'}
                </button>
            </Card>

            {(isLoading || generatedGeoJson) && (
                <Card title="Generated GeoJSON">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded max-h-96 overflow-auto">
                        {isLoading ? 'Generating...' : JSON.stringify(generatedGeoJson, null, 2)}
                    </pre>
                </Card>
            )}
        </div>
    );
};

export default DemoBankGISView;