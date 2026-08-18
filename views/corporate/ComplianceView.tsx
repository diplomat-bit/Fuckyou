// components/views/corporate/ComplianceView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../Card';

// Define the Anomaly type based on the OpenAPI spec for /corporate/anomalies
interface Anomaly {
    id: string;
    description: string;
    details: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    status: 'New' | 'Under Review' | 'Resolved' | 'Dismissed';
    entityType: string;
    entityId: string;
    timestamp: string; // ISO date string
    riskScore: number;
    aiConfidenceScore: number;
    recommendedAction: string;
    relatedTransactions: string[];
    resolutionNotes?: string; // Optional, used when updating status
}

const API_BASE_URL = 'https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io';

const ComplianceView: React.FC = () => {
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // useCallback to memoize the fetch function and prevent unnecessary re-renders
    const fetchAnomalies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch only 'New' and 'Under Review' anomalies for the "Open Cases" view
            // The API supports multiple 'status' query parameters
            const response = await fetch(`${API_BASE_URL}/corporate/anomalies?status=New&status=Under%20Review`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAnomalies(data.data || []);
        } catch (err) {
            console.error("Failed to fetch anomalies:", err);
            setError("Failed to load AI-detected financial anomalies.");
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array means this function is created once

    // useEffect to call fetchAnomalies when the component mounts
    useEffect(() => {
        fetchAnomalies();
    }, [fetchAnomalies]); // Re-run if fetchAnomalies changes (which it won't due to useCallback)

    // Function to update the status of an anomaly
    const updateAnomalyStatus = useCallback(async (anomalyId: string, newStatus: Anomaly['status'], notes?: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/corporate/anomalies/${anomalyId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus, resolutionNotes: notes }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // After successful update, re-fetch anomalies to reflect changes in the UI
            fetchAnomalies();
        } catch (err) {
            console.error(`Failed to update anomaly ${anomalyId} status:`, err);
            setError(`Failed to update anomaly status for ${anomalyId}.`);
        }
    }, [fetchAnomalies]); // Re-run if fetchAnomalies changes

    // Helper component for displaying status badges with appropriate styling
    const StatusBadge: React.FC<{ status: Anomaly['status'] }> = ({ status }) => {
        let badgeClass = '';
        switch (status) {
            case 'New':
                badgeClass = 'bg-red-500/20 text-red-300';
                break;
            case 'Under Review':
                badgeClass = 'bg-yellow-500/20 text-yellow-300';
                break;
            case 'Resolved':
                badgeClass = 'bg-green-500/20 text-green-300';
                break;
            case 'Dismissed':
                badgeClass = 'bg-gray-500/20 text-gray-300';
                break;
            default:
                badgeClass = 'bg-gray-500/20 text-gray-300';
        }
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${badgeClass}`}>{status.toLowerCase()}</span>
        );
    };

    // Display loading state
    if (loading) {
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white tracking-wider">Compliance Center</h2>
                <Card title="AI-Detected Financial Anomalies">
                    <p className="text-gray-400">Loading AI-detected financial anomalies...</p>
                </Card>
            </div>
        );
    }

    // Display error state
    if (error) {
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white tracking-wider">Compliance Center</h2>
                <Card title="AI-Detected Financial Anomalies">
                    <p className="text-red-400">Error: {error}</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Compliance Center</h2>

            <Card title="AI-Detected Financial Anomalies">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Anomaly ID</th>
                                <th scope="col" className="px-6 py-3">Description</th>
                                <th scope="col" className="px-6 py-3">Entity</th>
                                <th scope="col" className="px-6 py-3">Severity</th>
                                <th scope="col" className="px-6 py-3">Timestamp</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {anomalies.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No new or under review anomalies found.</td>
                                </tr>
                            ) : (
                                anomalies.map(anomaly => (
                                    <tr key={anomaly.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-mono text-white">{anomaly.id}</td>
                                        <td className="px-6 py-4 font-medium text-white">{anomaly.description}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{anomaly.entityType}<br/>{anomaly.entityId}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                                anomaly.severity === 'Critical' ? 'bg-red-600/20 text-red-400' :
                                                anomaly.severity === 'High' ? 'bg-orange-600/20 text-orange-400' :
                                                'bg-yellow-500/20 text-yellow-300'
                                            }`}>
                                                {anomaly.severity.toLowerCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{new Date(anomaly.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-4"><StatusBadge status={anomaly.status} /></td>
                                        <td className="px-6 py-4 space-x-2">
                                            {anomaly.status === 'New' && (
                                                <button
                                                    onClick={() => updateAnomalyStatus(anomaly.id, 'Under Review', 'Initiated review based on UI action.')}
                                                    className="text-xs text-blue-400 hover:underline"
                                                >
                                                    Start Review
                                                </button>
                                            )}
                                            {anomaly.status === 'Under Review' && (
                                                <>
                                                    <button
                                                        onClick={() => updateAnomalyStatus(anomaly.id, 'Resolved', 'Resolved after investigation.')}
                                                        className="text-xs text-green-400 hover:underline"
                                                    >
                                                        Resolve
                                                    </button>
                                                    <button
                                                        onClick={() => updateAnomalyStatus(anomaly.id, 'Dismissed', 'Dismissed as false positive.')}
                                                        className="text-xs text-gray-400 hover:underline"
                                                    >
                                                        Dismiss
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Additional sections hinting at broader API integration */}
            <Card title="AI-Powered Fraud Detection Rules" isCollapsible defaultCollapsed>
                <p className="text-gray-400 text-sm">This section would allow administrators to view and manage the automated rules that trigger fraud alerts and compliance cases (e.g., 'Block payments to sanctioned countries', 'Flag all transactions over $10,000').</p>
                <p className="text-gray-500 text-xs mt-2">API Endpoint: <code className="bg-gray-800 p-1 rounded">/corporate/risk/fraud/rules</code></p>
            </Card>

            <Card title="AI-Generated Compliance Audit Reports" isCollapsible defaultCollapsed>
                <p className="text-gray-400 text-sm">This section would display comprehensive AI-generated compliance audit reports, allowing for review, download, and tracking of regulatory adherence.</p>
                <p className="text-gray-500 text-xs mt-2">API Endpoint: <code className="bg-gray-800 p-1 rounded">/corporate/compliance/audits</code></p>
            </Card>
        </div>
    );
};

export default ComplianceView;