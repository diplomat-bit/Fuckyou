// components/views/corporate/AnomalyDetectionView.tsx
import React, { useContext } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { FinancialAnomaly, AnomalyStatus } from '../../../types';
import { GoogleGenAI } from '@google/genai';

const AnomalyDetectionView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("AnomalyDetectionView must be within a DataProvider.");
    // FIX: Destructure `updateAnomalyStatus` from context to fix property not found error.
    const { financialAnomalies, updateAnomalyStatus } = context;

    const SeverityIndicator: React.FC<{ severity: FinancialAnomaly['severity'] }> = ({ severity }) => {
        const colors = { Critical: 'border-red-500', High: 'border-orange-500', Medium: 'border-yellow-500', Low: 'border-blue-500' };
        const textColors = { Critical: 'text-red-300', High: 'text-orange-300', Medium: 'text-yellow-300', Low: 'text-blue-300' };
        return (
            <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-900/50 border ${colors[severity]} ${textColors[severity]}`}>
                <div className={`w-2 h-2 rounded-full ${colors[severity].replace('border-', 'bg-')}`}></div>
                {severity}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">AI-Powered Anomaly Detection</h2>
            <Card>
                <div className="space-y-4">
                {financialAnomalies.map(anomaly => (
                    <div key={anomaly.id} className="p-4 bg-gray-800/50 rounded-lg border-l-4 border-yellow-500">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <SeverityIndicator severity={anomaly.severity} />
                                <h4 className="font-semibold text-white mt-2 text-lg">{anomaly.description}</h4>
                                <p className="text-xs text-gray-400 font-mono mt-1">{anomaly.entityDescription} - {anomaly.timestamp}</p>
                            </div>
                            <div className="text-left sm:text-right flex-shrink-0">
                                <p className="text-xs text-gray-400">Risk Score</p>
                                <p className="text-3xl font-bold text-red-400">{anomaly.riskScore}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-300 mt-3 italic bg-gray-900/30 p-3 rounded-lg">
                            <span className="font-bold text-cyan-300 not-italic">AI Analysis:</span> "{anomaly.details}"
                        </p>
                        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
                            <p className="text-sm text-gray-400">Status: <span className="font-semibold text-cyan-300">{anomaly.status}</span></p>
                            {anomaly.status === 'New' && (
                                <div className="flex gap-2">
                                    <button onClick={() => updateAnomalyStatus(anomaly.id, 'Under Review')} className="text-xs px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-lg">Begin Review</button>
                                    <button onClick={() => updateAnomalyStatus(anomaly.id, 'Dismissed')} className="text-xs px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-lg">Dismiss</button>
                                </div>
                            )}
                             {anomaly.status === 'Under Review' && (
                                <div className="flex gap-2">
                                    <button onClick={() => updateAnomalyStatus(anomaly.id, 'Resolved')} className="text-xs px-3 py-1 bg-green-600/50 hover:bg-green-600 rounded-lg">Mark Resolved</button>
                                    <button onClick={() => updateAnomalyStatus(anomaly.id, 'Dismissed')} className="text-xs px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-lg">Dismiss</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                </div>
            </Card>
        </div>
    );
}

export default AnomalyDetectionView;
