import React, { useContext, useState, useMemo } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MLModel } from '../../../../types';
import { GoogleGenAI } from '@google/genai';


const PredictiveModelsView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("PredictiveModelsView must be within a DataProvider");

    const { mlModels, retrainMlModel } = context;
    const [selectedModel, setSelectedModel] = useState<MLModel | null>(mlModels[0] || null);
    const [aiDocs, setAiDocs] = useState('');
    const [isDocsLoading, setIsDocsLoading] = useState(false);

    const generateDocs = async (model: MLModel) => {
        setAiDocs('');
        setIsDocsLoading(true);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const prompt = `Generate a brief, professional documentation entry for this machine learning model. Include a short description, its primary use case, and key features. Model details: Name=${model.name}, Version=${model.version}, Accuracy=${model.accuracy}%.`;
            const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt});
            setAiDocs(response.text);
        } catch(err) {
            setAiDocs("Could not generate documentation.");
        } finally {
            setIsDocsLoading(false);
        }
    };
    
    const StatusBadge: React.FC<{ status: MLModel['status'] }> = ({ status }) => {
        const colors = {
            'Production': 'bg-green-500/20 text-green-300',
            'Staging': 'bg-cyan-500/20 text-cyan-300',
            'Training': 'bg-yellow-500/20 text-yellow-300 animate-pulse',
            'Archived': 'bg-gray-500/20 text-gray-300',
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>{status}</span>;
    };


    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Predictive Models Hub (MLOps)</h2>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                    <Card title="Model Registry">
                         <div className="space-y-2 max-h-96 overflow-y-auto">
                            {mlModels.map(model => (
                                <button key={model.id} onClick={() => setSelectedModel(model)} className={`w-full text-left p-3 rounded-lg border-l-4 transition-colors ${selectedModel?.id === model.id ? 'bg-cyan-500/20 border-cyan-400' : 'bg-gray-800/50 border-transparent hover:bg-gray-700/50'}`}>
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-white">{model.name} <span className="font-mono text-sm text-gray-400">v{model.version}</span></p>
                                        <StatusBadge status={model.status} />
                                    </div>
                                    <p className="text-xs text-gray-400">Accuracy: {model.accuracy}%</p>
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-3">
                    <Card title={selectedModel ? `Performance: ${selectedModel.name} v${selectedModel.version}` : 'Select a Model'}>
                        {selectedModel ? (
                            <>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={selectedModel.performanceHistory}>
                                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                                    <YAxis stroke="#9ca3af" domain={[ 'dataMin - 1', 'dataMax + 1' ]} unit="%" />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                    <Line type="monotone" dataKey="accuracy" stroke="#06b6d4" name="Accuracy" />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={() => generateDocs(selectedModel)} disabled={isDocsLoading} className="text-xs px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-lg">AI Docs</button>
                                <button onClick={() => retrainMlModel(selectedModel.id)} disabled={selectedModel.status === 'Training'} className="text-xs px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded-lg disabled:opacity-50">{selectedModel.status === 'Training' ? 'Training...' : 'Retrain'}</button>
                            </div>
                            </>
                        ) : (
                            <div className="h-80 flex items-center justify-center text-gray-500">Select a model to see its details.</div>
                        )}
                    </Card>
                </div>
            </div>
            
            {(isDocsLoading || aiDocs) && (
                <Card title="AI-Generated Documentation">
                    {isDocsLoading ? <p>Generating...</p> : <p className="text-sm text-gray-300 whitespace-pre-line">{aiDocs}</p>}
                </Card>
            )}

        </div>
    );
};

export default PredictiveModelsView;
