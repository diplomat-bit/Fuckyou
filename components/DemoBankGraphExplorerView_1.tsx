import React from 'react';
import Card from '../../Card';

const DemoBankGraphExplorerView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Graph Explorer</h2>
            
            <Card title="Data Relationship Graph">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-grow bg-gray-900/50 p-4 rounded-lg border border-gray-700 relative h-96 lg:h-[600px] overflow-hidden">
                        {/* Static SVG representing a complex graph */}
                        <svg width="100%" height="100%" viewBox="0 0 800 600">
                            <defs>
                                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
                                </marker>
                            </defs>
                            {/* Links */}
                            <line x1="150" y1="300" x2="300" y2="150" stroke="#9ca3af" markerEnd="url(#arrow)" />
                            <line x1="150" y1="300" x2="300" y2="450" stroke="#9ca3af" markerEnd="url(#arrow)" />
                            <line x1="300" y1="150" x2="500" y2="150" stroke="#9ca3af" markerEnd="url(#arrow)" />
                            <line x1="300" y1="150" x2="500" y2="300" stroke="#9ca3af" markerEnd="url(#arrow)" />
                            <line x1="300" y1="450" x2="500" y2="300" stroke="#9ca3af" markerEnd="url(#arrow)" />
                            <line x1="500" y1="150" x2="650" y2="300" stroke="#9ca3af" markerEnd="url(#arrow)" />
                             <line x1="500" y1="300" x2="650" y2="300" stroke="#9ca3af" markerEnd="url(#arrow)" />

                            {/* Nodes */}
                            <g transform="translate(150, 300)">
                                <circle r="30" fill="#facc15" stroke="#fff" strokeWidth="2" />
                                <text fill="#111827" textAnchor="middle" dy=".3em" fontWeight="bold">User</text>
                            </g>
                             <g transform="translate(300, 150)">
                                <circle r="30" fill="#ef4444" stroke="#fff" strokeWidth="2" />
                                <text fill="#fff" textAnchor="middle" dy=".3em" fontWeight="bold">TXN</text>
                            </g>
                             <g transform="translate(300, 450)">
                                <circle r="30" fill="#6366f1" stroke="#fff" strokeWidth="2" />
                                <text fill="#fff" textAnchor="middle" dy=".3em" fontWeight="bold">Goal</text>
                            </g>
                            <g transform="translate(500, 150)">
                                <circle r="30" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
                                <text fill="#fff" textAnchor="middle" dy=".3em" fontWeight="bold">Budget</text>
                            </g>
                             <g transform="translate(500, 300)">
                                <circle r="30" fill="#f97316" stroke="#fff" strokeWidth="2" />
                                <text fill="#fff" textAnchor="middle" dy=".3em" fontWeight="bold">Anomaly</text>
                            </g>
                             <g transform="translate(650, 300)">
                                <circle r="30" fill="#0ea5e9" stroke="#fff" strokeWidth="2" />
                                <text fill="#fff" textAnchor="middle" dy=".3em" fontWeight="bold">PO</text>
                            </g>
                        </svg>
                    </div>
                    <div className="lg:w-80 flex-shrink-0">
                        <Card title="Selected Entity: Anomaly">
                            <div className="space-y-2 text-sm">
                                <div><span className="text-gray-400">ID:</span> <span className="font-mono text-white">anom_1</span></div>
                                <div><span className="text-gray-400">Type:</span> <span className="text-white">FinancialAnomaly</span></div>
                                <div><span className="text-gray-400">Severity:</span> <span className="text-orange-400">High</span></div>
                                <div className="pt-2">
                                    <p className="font-semibold text-cyan-300">Relationships:</p>
                                    <ul className="list-disc list-inside text-gray-300 mt-1">
                                        <li>Related to <span className="font-mono">PO #po_005</span></li>
                                        <li>Flagged from <span className="font-mono">TXN #ctx_...</span></li>
                                        <li>Notified <span className="font-mono">User 'Visionary'</span></li>
                                    </ul>
                                </div>
                                 <button className="mt-4 w-full text-xs py-1 bg-gray-600 hover:bg-gray-700 rounded">Expand Neighbors</button>
                            </div>
                        </Card>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankGraphExplorerView;
