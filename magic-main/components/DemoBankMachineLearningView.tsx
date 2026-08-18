import React from 'react';
import Card from '../../Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter, ZAxis } from 'recharts';

const trainingRunsData = [
    { name: 'Mon', runs: 5 }, { name: 'Tue', runs: 8 }, { name: 'Wed', runs: 6 },
    { name: 'Thu', runs: 12 }, { name: 'Fri', runs: 10 }, { name: 'Sat', runs: 3 }, { name: 'Sun', runs: 4 },
];

const experimentAccuracyData = [
    { experiment: 1, accuracy: 92.1, params: 1.2 },
    { experiment: 2, accuracy: 93.5, params: 1.5 },
    { experiment: 3, accuracy: 93.2, params: 1.4 },
    { experiment: 4, accuracy: 94.8, params: 2.1 },
    { experiment: 5, accuracy: 94.5, params: 2.0 },
];

const registeredModels = [
    { id: 1, name: 'fraud-detection', version: 3, stage: 'Production' },
    { id: 2, name: 'fraud-detection', version: 4, stage: 'Staging' },
    { id: 3, name: 'churn-predictor', version: 2, stage: 'Production' },
    { id: 4, name: 'product-recommender', version: 1, stage: 'Archived' },
];

const DemoBankMachineLearningView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Machine Learning</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">12</p><p className="text-sm text-gray-400 mt-1">Active Experiments</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">48</p><p className="text-sm text-gray-400 mt-1">Training Runs (7d)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">4</p><p className="text-sm text-gray-400 mt-1">Registered Models</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">2</p><p className="text-sm text-gray-400 mt-1">Models in Production</p></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Training Runs (Last 7 Days)">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={trainingRunsData}>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Bar dataKey="runs" fill="#06b6d4" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Experiment Results (Accuracy vs. Params)">
                     <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart>
                            <XAxis type="number" dataKey="params" name="Parameters (M)" unit="M" stroke="#9ca3af" />
                            <YAxis type="number" dataKey="accuracy" name="Accuracy" unit="%" stroke="#9ca3af" domain={[90, 100]} />
                            <ZAxis dataKey="experiment" range={[100, 101]} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Scatter name="Experiments" data={experimentAccuracyData} fill="#8884d8"/>
                        </ScatterChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <Card title="Registered Models">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Model Name</th>
                                <th scope="col" className="px-6 py-3">Version</th>
                                <th scope="col" className="px-6 py-3">Stage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registeredModels.map(model => (
                                <tr key={model.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-white">{model.name}</td>
                                    <td className="px-6 py-4">{`v${model.version}`}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${model.stage === 'Production' ? 'bg-green-500/20 text-green-300' : model.stage === 'Staging' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-gray-500/20 text-gray-300'}`}>{model.stage}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankMachineLearningView;