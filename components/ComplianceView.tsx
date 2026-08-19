
import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { ComplianceCase } from '../types';
import iso20022 from '../data/iso20022.json'; // Assuming you'd have a json file
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const ComplianceView: React.FC = () => {
    const context = useContext(DataContext);
    const [searchTerm, setSearchTerm] = useState('');

    if (!context) {
        return <div>Loading...</div>
    }

    const { complianceCases } = context;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open': return <AlertTriangle className="text-red-400" />;
            case 'investigating': return <Clock className="text-yellow-400" />;
            case 'closed': return <CheckCircle className="text-green-400" />;
            default: return null;
        }
    }
    
    const filteredCodes = Object.entries((iso20022 as any).definitions).filter(([key]: [string, any]) => key.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Compliance Dashboard</h2>
            
            <Card title="Active Compliance Cases">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {complianceCases.map(c => (
                        <div key={c.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-white">{c.reason}</p>
                                    <p className="text-xs text-gray-400">{c.entityType}: {c.entityId}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm capitalize">
                                    {getStatusIcon(c.status)}
                                    {c.status}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Opened: {c.openedDate}</p>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="ISO 20022 Code Explorer">
                <input 
                    type="text"
                    placeholder="Search ISO 20022 codes..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 mb-4 bg-gray-900 border border-gray-700 rounded text-white"
                />
                <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {filteredCodes.map(([key, value]: [string, any]) => (
                        <div key={key} className="p-3 border-b border-gray-800">
                            <p className="font-mono font-bold text-cyan-400">{key}</p>
                            <p className="text-xs text-gray-300 mt-1 whitespace-pre-wrap">{value.description}</p>
                            {value.enum && <p className="text-xs text-gray-500 mt-1 font-mono">Values: {value.enum.join(', ')}</p>}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

export default ComplianceView;


// --- CONSOLIDATED FROM: ComplianceView (1).tsx ---


import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { ComplianceCase } from '../types';
import iso20022 from '../data/iso20022.json'; // Assuming you'd have a json file
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const ComplianceView: React.FC = () => {
    const context = useContext(DataContext);
    const [searchTerm, setSearchTerm] = useState('');

    if (!context) {
        return <div>Loading...</div>
    }

    const { complianceCases } = context;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open': return <AlertTriangle className="text-red-400" />;
            case 'investigating': return <Clock className="text-yellow-400" />;
            case 'closed': return <CheckCircle className="text-green-400" />;
            default: return null;
        }
    }
    
    const filteredCodes = Object.entries((iso20022 as any).definitions).filter(([key]: [string, any]) => key.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Compliance Dashboard</h2>
            
            <Card title="Active Compliance Cases">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {complianceCases.map(c => (
                        <div key={c.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-white">{c.reason}</p>
                                    <p className="text-xs text-gray-400">{c.entityType}: {c.entityId}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm capitalize">
                                    {getStatusIcon(c.status)}
                                    {c.status}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Opened: {c.openedDate}</p>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="ISO 20022 Code Explorer">
                <input 
                    type="text"
                    placeholder="Search ISO 20022 codes..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 mb-4 bg-gray-900 border border-gray-700 rounded text-white"
                />
                <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {filteredCodes.map(([key, value]: [string, any]) => (
                        <div key={key} className="p-3 border-b border-gray-800">
                            <p className="font-mono font-bold text-cyan-400">{key}</p>
                            <p className="text-xs text-gray-300 mt-1 whitespace-pre-wrap">{value.description}</p>
                            {value.enum && <p className="text-xs text-gray-500 mt-1 font-mono">Values: {value.enum.join(', ')}</p>}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

export default ComplianceView;


// --- CONSOLIDATED FROM: ComplianceView (2).tsx ---


import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { ComplianceCase } from '../types';
import iso20022 from '../data/iso20022.json';
import { AlertTriangle, CheckCircle, Clock, FileText, MessageSquare, User, Shield, Info, Search, X, Check, AlertOctagon, HelpCircle, Book, Code, Database, Settings, Grid, List, BarChart, PieChart, Calendar, Edit, Trash2, Plus, Download, Upload, ExternalLink } from 'lucide-react';

// The James Burvel O'Callaghan III Code - ComplianceView Component

// A. Company: O'Callaghan Compliance Solutions
// B. Feature: Comprehensive Compliance Monitoring and Reporting
// C. Use Case: Real-time monitoring of transaction data against regulatory requirements.
const A1_OCallaghanComplianceSolutions_ComplianceView = () => {
    const B1_dataContext = useContext(DataContext);
    const C1_useState_searchTerm = useState<string>('');
    const C2_useState_activeTab = useState<string>('A2_ComplianceOverview');
    const C3_useState_selectedCase = useState<ComplianceCase | null>(null);
    const C4_useState_isoSearchTerm = useState<string>('');
    const C5_useState_isoSearchResults = useState<[string, any][]>([]);
    const C6_useState_pageSize = useState<number>(25);
    const C7_useState_currentPage = useState<number>(1);
    const [D1_complianceCases_local, D2_setComplianceCases_local] = useState<ComplianceCase[]>([]);
    const [D3_loading, D4_setLoading] = useState<boolean>(true);
    const [E1_isoCodes, E2_setIsoCodes] = useState<any>((iso20022 as any).definitions);
    const [F1_selectedIsoCode, F2_setSelectedIsoCode] = useState<string | null>(null);

    useEffect(() => {
        if (B1_dataContext?.complianceCases) {
            D2_setComplianceCases_local(B1_dataContext.complianceCases);
            D4_setLoading(false);
        } else {
            D4_setLoading(true);
        }
    }, [B1_dataContext?.complianceCases]);

    const G1_getStatusIcon = useCallback((status: string) => {
        switch (status) {
            case 'open': return <AlertTriangle className="text-red-400" size={16} />;
            case 'investigating': return <Clock className="text-yellow-400" size={16} />;
            case 'closed': return <CheckCircle className="text-green-400" size={16} />;
            default: return <HelpCircle className="text-gray-400" size={16} />;
        }
    }, []);

    const H1_filterComplianceCases = useCallback(() => {
        return D1_complianceCases_local.filter(caseItem => caseItem.reason.toLowerCase().includes(C1_useState_searchTerm[0].toLowerCase()) || caseItem.entityType.toLowerCase().includes(C1_useState_searchTerm[0].toLowerCase()) || caseItem.entityId.toLowerCase().includes(C1_useState_searchTerm[0].toLowerCase()));
    }, [D1_complianceCases_local, C1_useState_searchTerm]);

    const I1_handleCaseSelection = useCallback((caseItem: ComplianceCase) => {
        C3_useState_selectedCase[1](caseItem);
    }, [C3_useState_selectedCase]);

    const J1_closeCaseDetails = useCallback(() => {
        C3_useState_selectedCase[1](null);
    }, [C3_useState_selectedCase]);

    const K1_handleTabChange = useCallback((tabName: string) => {
        C2_useState_activeTab[1](tabName);
    }, [C2_useState_activeTab]);

    const L1_handleSearchInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        C1_useState_searchTerm[1](event.target.value);
    }, [C1_useState_searchTerm]);

    const M1_handleIsoSearchInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        C4_useState_isoSearchTerm[1](event.target.value);
    }, [C4_useState_isoSearchTerm]);

    const N1_performIsoSearch = useCallback(() => {
        const searchTerm = C4_useState_isoSearchTerm[0].toLowerCase();
        const results = Object.entries(E1_isoCodes).filter(([key]: [string, any]) => key.toLowerCase().includes(searchTerm));
        C5_useState_isoSearchResults[1](results);
    }, [C4_useState_isoSearchTerm, E1_isoCodes, C5_useState_isoSearchResults]);

    useEffect(() => {
        N1_performIsoSearch();
    }, [C4_useState_isoSearchTerm[0]]);

    const O1_handlePageSizeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        C6_useState_pageSize[1](parseInt(event.target.value, 10));
        C7_useState_currentPage[1](1);
    }, [C6_useState_pageSize, C7_useState_currentPage]);

    const P1_handlePageChange = useCallback((newPage: number) => {
        C7_useState_currentPage[1](newPage);
    }, [C7_useState_currentPage]);

    const Q1_paginatedCases = useMemo(() => {
        const startIndex = (C7_useState_currentPage[0] - 1) * C6_useState_pageSize[0];
        const endIndex = startIndex + C6_useState_pageSize[0];
        return H1_filterComplianceCases().slice(startIndex, endIndex);
    }, [H1_filterComplianceCases, C7_useState_currentPage[0], C6_useState_pageSize[0]]);

    const R1_totalCases = useMemo(() => H1_filterComplianceCases().length, [H1_filterComplianceCases]);

    const S1_totalPages = useMemo(() => Math.ceil(R1_totalCases / C6_useState_pageSize[0]), [R1_totalCases, C6_useState_pageSize[0]]);

    const T1_renderPagination = useCallback(() => {
        const pageNumbers = [];
        for (let i = 1; i <= S1_totalPages; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => P1_handlePageChange(i)}
                    className={`px-3 py-1 rounded ${C7_useState_currentPage[0] === i ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                    {i}
                </button>
            );
        }
        return (
            <div className="flex justify-center items-center space-x-2 mt-4">
                <button
                    onClick={() => P1_handlePageChange(C7_useState_currentPage[0] - 1)}
                    disabled={C7_useState_currentPage[0] === 1}
                    className="px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
                >
                    Previous
                </button>
                {pageNumbers}
                <button
                    onClick={() => P1_handlePageChange(C7_useState_currentPage[0] + 1)}
                    disabled={C7_useState_currentPage[0] === S1_totalPages}
                    className="px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        );
    }, [C7_useState_currentPage[0], S1_totalPages, P1_handlePageChange]);

    const U1_handleIsoCodeSelection = useCallback((code: string) => {
        F2_setSelectedIsoCode(code);
    }, [F2_setSelectedIsoCode]);

    const V1_renderIsoCodeDetails = useCallback(() => {
        if (!F1_selectedIsoCode) return <div className="text-gray-500">Select an ISO 20022 code to view details.</div>;
        const isoCodeData = E1_isoCodes[F1_selectedIsoCode];
        if (!isoCodeData) return <div className="text-red-500">Error: ISO 20022 code details not found.</div>;

        return (
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h3 className="text-xl font-bold text-white">{F1_selectedIsoCode}</h3>
                <p className="text-sm text-gray-400 mt-1">{isoCodeData.description}</p>
                {isoCodeData.enum && (
                    <div className="mt-2">
                        <p className="text-gray-300 font-bold">Values:</p>
                        <ul className="list-disc list-inside text-gray-500">
                            {isoCodeData.enum.map((value: string) => (
                                <li key={value}>{value}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <button onClick={() => F2_setSelectedIsoCode(null)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                    Close Details
                </button>
            </div>
        );
    }, [F1_selectedIsoCode, E1_isoCodes, F2_setSelectedIsoCode]);

    const W1_renderComplianceOverview = useCallback(() => {
        if (D3_loading) return <div><Info className="animate-spin" /> Loading compliance data...</div>;

        return (
            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <Search className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search compliance cases..."
                        value={C1_useState_searchTerm[0]}
                        onChange={L1_handleSearchInputChange}
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Q1_paginatedCases.map(c => (
                        <div key={c.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 cursor-pointer transition duration-200 ease-in-out" onClick={() => I1_handleCaseSelection(c)}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-white">{c.reason}</p>
                                    <p className="text-xs text-gray-400">{c.entityType}: {c.entityId}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm capitalize">
                                    {G1_getStatusIcon(c.status)}
                                    {c.status}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Opened: {c.openedDate}</p>
                        </div>
                    ))}
                </div>
                {R1_totalCases > 0 ? T1_renderPagination() : <div className="text-gray-500">No compliance cases found.</div>}

                <div className="flex items-center justify-between mt-4">
                    <label htmlFor="pageSize" className="text-gray-300 mr-2">Items per page:</label>
                    <select id="pageSize" value={C6_useState_pageSize[0]} onChange={O1_handlePageSizeChange} className="bg-gray-900 border border-gray-700 rounded text-white">
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <p className="text-gray-400">Showing {Q1_paginatedCases.length} of {R1_totalCases} cases</p>
                </div>
            </div>
        );
    }, [D3_loading, C1_useState_searchTerm[0], L1_handleSearchInputChange, Q1_paginatedCases, G1_getStatusIcon, I1_handleCaseSelection, R1_totalCases, T1_renderPagination, C6_useState_pageSize[0], O1_handlePageSizeChange]);

    const X1_renderCaseDetails = useCallback(() => {
        if (!C3_useState_selectedCase[0]) return null;
        const selectedCase = C3_useState_selectedCase[0];

        return (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 z-50 flex justify-center items-center">
                <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl p-6 relative">
                    <button onClick={J1_closeCaseDetails} className="absolute top-2 right-2 text-gray-500 hover:text-gray-300 focus:outline-none">
                        <X size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-white mb-4">Compliance Case Details</h2>
                    <div className="space-y-2">
                        <p className="text-gray-300"><span className="font-bold">Reason:</span> {selectedCase.reason}</p>
                        <p className="text-gray-300"><span className="font-bold">Entity Type:</span> {selectedCase.entityType}</p>
                        <p className="text-gray-300"><span className="font-bold">Entity ID:</span> {selectedCase.entityId}</p>
                        <p className="text-gray-300"><span className="font-bold">Status:</span> {selectedCase.status}</p>
                        <p className="text-gray-300"><span className="font-bold">Opened Date:</span> {selectedCase.openedDate}</p>
                        {/* Add more details here as needed */}
                    </div>
                </div>
            </div>
        );
    }, [C3_useState_selectedCase[0], J1_closeCaseDetails]);

    const Y1_renderIsoCodeExplorer = useCallback(() => {
        return (
            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <Search className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search ISO 20022 codes..."
                        value={C4_useState_isoSearchTerm[0]}
                        onChange={M1_handleIsoSearchInputChange}
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {C5_useState_isoSearchResults[0].map(([key, value]: [string, any]) => (
                        <div key={key} className="p-3 border-b border-gray-800 hover:bg-gray-700 cursor-pointer" onClick={() => U1_handleIsoCodeSelection(key)}>
                            <p className="font-mono font-bold text-cyan-400">{key}</p>
                            <p className="text-xs text-gray-300 mt-1 whitespace-pre-wrap">{value.description}</p>
                            {value.enum && <p className="text-xs text-gray-500 mt-1 font-mono">Values: {value.enum.join(', ')}</p>}
                        </div>
                    ))}
                </div>
                {V1_renderIsoCodeDetails()}
            </div>
        );
    }, [C4_useState_isoSearchTerm[0], M1_handleIsoSearchInputChange, C5_useState_isoSearchResults[0], U1_handleIsoCodeSelection, V1_renderIsoCodeDetails]);

    const Z1_renderSettingsTab = useCallback(() => {
        return (
            <div className="p-4">
                <h3 className="text-xl font-bold text-white mb-4">Settings</h3>
                <p className="text-gray-400">Configure application settings here.</p>
                {/* Add settings options here */}
            </div>
        );
    }, []);

    const AA1_renderDashboard = () => {
        switch (C2_useState_activeTab[0]) {
            case 'A2_ComplianceOverview': return W1_renderComplianceOverview();
            case 'B2_IsoCodeExplorer': return Y1_renderIsoCodeExplorer();
            case 'C2_Settings': return Z1_renderSettingsTab();
            default: return <div><AlertOctagon className="text-red-500" /> Unknown tab</div>;
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Compliance Dashboard - The James Burvel O'Callaghan III Code</h2>

            <div className="bg-gray-800 rounded-lg shadow-md p-4">
                <nav className="flex space-x-4">
                    <button onClick={() => K1_handleTabChange('A2_ComplianceOverview')} className={`px-4 py-2 rounded ${C2_useState_activeTab[0] === 'A2_ComplianceOverview' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        <FileText className="inline-block mr-2" size={16} /> Compliance Overview
                    </button>
                    <button onClick={() => K1_handleTabChange('B2_IsoCodeExplorer')} className={`px-4 py-2 rounded ${C2_useState_activeTab[0] === 'B2_IsoCodeExplorer' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        <Code className="inline-block mr-2" size={16} /> ISO 20022 Explorer
                    </button>
                    <button onClick={() => K1_handleTabChange('C2_Settings')} className={`px-4 py-2 rounded ${C2_useState_activeTab[0] === 'C2_Settings' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        <Settings className="inline-block mr-2" size={16} /> Settings
                    </button>
                </nav>
            </div>

            {AA1_renderDashboard()}
            {X1_renderCaseDetails()}
        </div>
    );
};

export default A1_OCallaghanComplianceSolutions_ComplianceView;


// --- CONSOLIDATED FROM: ComplianceView_1.tsx ---


import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { ComplianceCase } from '../types';
import iso20022 from '../data/iso20022.json'; // Assuming you'd have a json file
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const ComplianceView: React.FC = () => {
    const context = useContext(DataContext);
    const [searchTerm, setSearchTerm] = useState('');

    if (!context) {
        return <div>Loading...</div>
    }

    const { complianceCases } = context;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open': return <AlertTriangle className="text-red-400" />;
            case 'investigating': return <Clock className="text-yellow-400" />;
            case 'closed': return <CheckCircle className="text-green-400" />;
            default: return null;
        }
    }
    
    const filteredCodes = Object.entries((iso20022 as any).definitions).filter(([key]: [string, any]) => key.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Compliance Dashboard</h2>
            
            <Card title="Active Compliance Cases">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {complianceCases.map(c => (
                        <div key={c.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-white">{c.reason}</p>
                                    <p className="text-xs text-gray-400">{c.entityType}: {c.entityId}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm capitalize">
                                    {getStatusIcon(c.status)}
                                    {c.status}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Opened: {c.openedDate}</p>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="ISO 20022 Code Explorer">
                <input 
                    type="text"
                    placeholder="Search ISO 20022 codes..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 mb-4 bg-gray-900 border border-gray-700 rounded text-white"
                />
                <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {filteredCodes.map(([key, value]: [string, any]) => (
                        <div key={key} className="p-3 border-b border-gray-800">
                            <p className="font-mono font-bold text-cyan-400">{key}</p>
                            <p className="text-xs text-gray-300 mt-1 whitespace-pre-wrap">{value.description}</p>
                            {value.enum && <p className="text-xs text-gray-500 mt-1 font-mono">Values: {value.enum.join(', ')}</p>}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

export default ComplianceView;


// --- CONSOLIDATED FROM: ./views/corporate/ComplianceView.tsx ---

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

// --- CONSOLIDATED FROM: ./components/ComplianceView (1).tsx ---



// --- CONSOLIDATED FROM: ComplianceView (1)_1.tsx ---


import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { ComplianceCase } from '../types';
import iso20022 from '../data/iso20022.json'; // Assuming you'd have a json file
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const ComplianceView: React.FC = () => {
    const context = useContext(DataContext);
    const [searchTerm, setSearchTerm] = useState('');

    if (!context) {
        return <div>Loading...</div>
    }

    const { complianceCases } = context;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open': return <AlertTriangle className="text-red-400" />;
            case 'investigating': return <Clock className="text-yellow-400" />;
            case 'closed': return <CheckCircle className="text-green-400" />;
            default: return null;
        }
    }
    
    const filteredCodes = Object.entries((iso20022 as any).definitions).filter(([key]: [string, any]) => key.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Compliance Dashboard</h2>
            
            <Card title="Active Compliance Cases">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {complianceCases.map(c => (
                        <div key={c.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-white">{c.reason}</p>
                                    <p className="text-xs text-gray-400">{c.entityType}: {c.entityId}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm capitalize">
                                    {getStatusIcon(c.status)}
                                    {c.status}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Opened: {c.openedDate}</p>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="ISO 20022 Code Explorer">
                <input 
                    type="text"
                    placeholder="Search ISO 20022 codes..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 mb-4 bg-gray-900 border border-gray-700 rounded text-white"
                />
                <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {filteredCodes.map(([key, value]: [string, any]) => (
                        <div key={key} className="p-3 border-b border-gray-800">
                            <p className="font-mono font-bold text-cyan-400">{key}</p>
                            <p className="text-xs text-gray-300 mt-1 whitespace-pre-wrap">{value.description}</p>
                            {value.enum && <p className="text-xs text-gray-500 mt-1 font-mono">Values: {value.enum.join(', ')}</p>}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

export default ComplianceView;


// --- CONSOLIDATED FROM: ./components/ComplianceView (2).tsx ---



// --- CONSOLIDATED FROM: ComplianceView (2)_1.tsx ---


import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { ComplianceCase } from '../types';
import iso20022 from '../data/iso20022.json';
import { AlertTriangle, CheckCircle, Clock, FileText, MessageSquare, User, Shield, Info, Search, X, Check, AlertOctagon, HelpCircle, Book, Code, Database, Settings, Grid, List, BarChart, PieChart, Calendar, Edit, Trash2, Plus, Download, Upload, ExternalLink } from 'lucide-react';

// The James Burvel O'Callaghan III Code - ComplianceView Component

// A. Company: O'Callaghan Compliance Solutions
// B. Feature: Comprehensive Compliance Monitoring and Reporting
// C. Use Case: Real-time monitoring of transaction data against regulatory requirements.
const A1_OCallaghanComplianceSolutions_ComplianceView = () => {
    const B1_dataContext = useContext(DataContext);
    const C1_useState_searchTerm = useState<string>('');
    const C2_useState_activeTab = useState<string>('A2_ComplianceOverview');
    const C3_useState_selectedCase = useState<ComplianceCase | null>(null);
    const C4_useState_isoSearchTerm = useState<string>('');
    const C5_useState_isoSearchResults = useState<[string, any][]>([]);
    const C6_useState_pageSize = useState<number>(25);
    const C7_useState_currentPage = useState<number>(1);
    const [D1_complianceCases_local, D2_setComplianceCases_local] = useState<ComplianceCase[]>([]);
    const [D3_loading, D4_setLoading] = useState<boolean>(true);
    const [E1_isoCodes, E2_setIsoCodes] = useState<any>((iso20022 as any).definitions);
    const [F1_selectedIsoCode, F2_setSelectedIsoCode] = useState<string | null>(null);

    useEffect(() => {
        if (B1_dataContext?.complianceCases) {
            D2_setComplianceCases_local(B1_dataContext.complianceCases);
            D4_setLoading(false);
        } else {
            D4_setLoading(true);
        }
    }, [B1_dataContext?.complianceCases]);

    const G1_getStatusIcon = useCallback((status: string) => {
        switch (status) {
            case 'open': return <AlertTriangle className="text-red-400" size={16} />;
            case 'investigating': return <Clock className="text-yellow-400" size={16} />;
            case 'closed': return <CheckCircle className="text-green-400" size={16} />;
            default: return <HelpCircle className="text-gray-400" size={16} />;
        }
    }, []);

    const H1_filterComplianceCases = useCallback(() => {
        return D1_complianceCases_local.filter(caseItem => caseItem.reason.toLowerCase().includes(C1_useState_searchTerm[0].toLowerCase()) || caseItem.entityType.toLowerCase().includes(C1_useState_searchTerm[0].toLowerCase()) || caseItem.entityId.toLowerCase().includes(C1_useState_searchTerm[0].toLowerCase()));
    }, [D1_complianceCases_local, C1_useState_searchTerm]);

    const I1_handleCaseSelection = useCallback((caseItem: ComplianceCase) => {
        C3_useState_selectedCase[1](caseItem);
    }, [C3_useState_selectedCase]);

    const J1_closeCaseDetails = useCallback(() => {
        C3_useState_selectedCase[1](null);
    }, [C3_useState_selectedCase]);

    const K1_handleTabChange = useCallback((tabName: string) => {
        C2_useState_activeTab[1](tabName);
    }, [C2_useState_activeTab]);

    const L1_handleSearchInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        C1_useState_searchTerm[1](event.target.value);
    }, [C1_useState_searchTerm]);

    const M1_handleIsoSearchInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        C4_useState_isoSearchTerm[1](event.target.value);
    }, [C4_useState_isoSearchTerm]);

    const N1_performIsoSearch = useCallback(() => {
        const searchTerm = C4_useState_isoSearchTerm[0].toLowerCase();
        const results = Object.entries(E1_isoCodes).filter(([key]: [string, any]) => key.toLowerCase().includes(searchTerm));
        C5_useState_isoSearchResults[1](results);
    }, [C4_useState_isoSearchTerm, E1_isoCodes, C5_useState_isoSearchResults]);

    useEffect(() => {
        N1_performIsoSearch();
    }, [C4_useState_isoSearchTerm[0]]);

    const O1_handlePageSizeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        C6_useState_pageSize[1](parseInt(event.target.value, 10));
        C7_useState_currentPage[1](1);
    }, [C6_useState_pageSize, C7_useState_currentPage]);

    const P1_handlePageChange = useCallback((newPage: number) => {
        C7_useState_currentPage[1](newPage);
    }, [C7_useState_currentPage]);

    const Q1_paginatedCases = useMemo(() => {
        const startIndex = (C7_useState_currentPage[0] - 1) * C6_useState_pageSize[0];
        const endIndex = startIndex + C6_useState_pageSize[0];
        return H1_filterComplianceCases().slice(startIndex, endIndex);
    }, [H1_filterComplianceCases, C7_useState_currentPage[0], C6_useState_pageSize[0]]);

    const R1_totalCases = useMemo(() => H1_filterComplianceCases().length, [H1_filterComplianceCases]);

    const S1_totalPages = useMemo(() => Math.ceil(R1_totalCases / C6_useState_pageSize[0]), [R1_totalCases, C6_useState_pageSize[0]]);

    const T1_renderPagination = useCallback(() => {
        const pageNumbers = [];
        for (let i = 1; i <= S1_totalPages; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => P1_handlePageChange(i)}
                    className={`px-3 py-1 rounded ${C7_useState_currentPage[0] === i ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                    {i}
                </button>
            );
        }
        return (
            <div className="flex justify-center items-center space-x-2 mt-4">
                <button
                    onClick={() => P1_handlePageChange(C7_useState_currentPage[0] - 1)}
                    disabled={C7_useState_currentPage[0] === 1}
                    className="px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
                >
                    Previous
                </button>
                {pageNumbers}
                <button
                    onClick={() => P1_handlePageChange(C7_useState_currentPage[0] + 1)}
                    disabled={C7_useState_currentPage[0] === S1_totalPages}
                    className="px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        );
    }, [C7_useState_currentPage[0], S1_totalPages, P1_handlePageChange]);

    const U1_handleIsoCodeSelection = useCallback((code: string) => {
        F2_setSelectedIsoCode(code);
    }, [F2_setSelectedIsoCode]);

    const V1_renderIsoCodeDetails = useCallback(() => {
        if (!F1_selectedIsoCode) return <div className="text-gray-500">Select an ISO 20022 code to view details.</div>;
        const isoCodeData = E1_isoCodes[F1_selectedIsoCode];
        if (!isoCodeData) return <div className="text-red-500">Error: ISO 20022 code details not found.</div>;

        return (
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h3 className="text-xl font-bold text-white">{F1_selectedIsoCode}</h3>
                <p className="text-sm text-gray-400 mt-1">{isoCodeData.description}</p>
                {isoCodeData.enum && (
                    <div className="mt-2">
                        <p className="text-gray-300 font-bold">Values:</p>
                        <ul className="list-disc list-inside text-gray-500">
                            {isoCodeData.enum.map((value: string) => (
                                <li key={value}>{value}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <button onClick={() => F2_setSelectedIsoCode(null)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                    Close Details
                </button>
            </div>
        );
    }, [F1_selectedIsoCode, E1_isoCodes, F2_setSelectedIsoCode]);

    const W1_renderComplianceOverview = useCallback(() => {
        if (D3_loading) return <div><Info className="animate-spin" /> Loading compliance data...</div>;

        return (
            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <Search className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search compliance cases..."
                        value={C1_useState_searchTerm[0]}
                        onChange={L1_handleSearchInputChange}
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Q1_paginatedCases.map(c => (
                        <div key={c.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 cursor-pointer transition duration-200 ease-in-out" onClick={() => I1_handleCaseSelection(c)}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-white">{c.reason}</p>
                                    <p className="text-xs text-gray-400">{c.entityType}: {c.entityId}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm capitalize">
                                    {G1_getStatusIcon(c.status)}
                                    {c.status}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Opened: {c.openedDate}</p>
                        </div>
                    ))}
                </div>
                {R1_totalCases > 0 ? T1_renderPagination() : <div className="text-gray-500">No compliance cases found.</div>}

                <div className="flex items-center justify-between mt-4">
                    <label htmlFor="pageSize" className="text-gray-300 mr-2">Items per page:</label>
                    <select id="pageSize" value={C6_useState_pageSize[0]} onChange={O1_handlePageSizeChange} className="bg-gray-900 border border-gray-700 rounded text-white">
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <p className="text-gray-400">Showing {Q1_paginatedCases.length} of {R1_totalCases} cases</p>
                </div>
            </div>
        );
    }, [D3_loading, C1_useState_searchTerm[0], L1_handleSearchInputChange, Q1_paginatedCases, G1_getStatusIcon, I1_handleCaseSelection, R1_totalCases, T1_renderPagination, C6_useState_pageSize[0], O1_handlePageSizeChange]);

    const X1_renderCaseDetails = useCallback(() => {
        if (!C3_useState_selectedCase[0]) return null;
        const selectedCase = C3_useState_selectedCase[0];

        return (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 z-50 flex justify-center items-center">
                <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl p-6 relative">
                    <button onClick={J1_closeCaseDetails} className="absolute top-2 right-2 text-gray-500 hover:text-gray-300 focus:outline-none">
                        <X size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-white mb-4">Compliance Case Details</h2>
                    <div className="space-y-2">
                        <p className="text-gray-300"><span className="font-bold">Reason:</span> {selectedCase.reason}</p>
                        <p className="text-gray-300"><span className="font-bold">Entity Type:</span> {selectedCase.entityType}</p>
                        <p className="text-gray-300"><span className="font-bold">Entity ID:</span> {selectedCase.entityId}</p>
                        <p className="text-gray-300"><span className="font-bold">Status:</span> {selectedCase.status}</p>
                        <p className="text-gray-300"><span className="font-bold">Opened Date:</span> {selectedCase.openedDate}</p>
                        {/* Add more details here as needed */}
                    </div>
                </div>
            </div>
        );
    }, [C3_useState_selectedCase[0], J1_closeCaseDetails]);

    const Y1_renderIsoCodeExplorer = useCallback(() => {
        return (
            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <Search className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search ISO 20022 codes..."
                        value={C4_useState_isoSearchTerm[0]}
                        onChange={M1_handleIsoSearchInputChange}
                        className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {C5_useState_isoSearchResults[0].map(([key, value]: [string, any]) => (
                        <div key={key} className="p-3 border-b border-gray-800 hover:bg-gray-700 cursor-pointer" onClick={() => U1_handleIsoCodeSelection(key)}>
                            <p className="font-mono font-bold text-cyan-400">{key}</p>
                            <p className="text-xs text-gray-300 mt-1 whitespace-pre-wrap">{value.description}</p>
                            {value.enum && <p className="text-xs text-gray-500 mt-1 font-mono">Values: {value.enum.join(', ')}</p>}
                        </div>
                    ))}
                </div>
                {V1_renderIsoCodeDetails()}
            </div>
        );
    }, [C4_useState_isoSearchTerm[0], M1_handleIsoSearchInputChange, C5_useState_isoSearchResults[0], U1_handleIsoCodeSelection, V1_renderIsoCodeDetails]);

    const Z1_renderSettingsTab = useCallback(() => {
        return (
            <div className="p-4">
                <h3 className="text-xl font-bold text-white mb-4">Settings</h3>
                <p className="text-gray-400">Configure application settings here.</p>
                {/* Add settings options here */}
            </div>
        );
    }, []);

    const AA1_renderDashboard = () => {
        switch (C2_useState_activeTab[0]) {
            case 'A2_ComplianceOverview': return W1_renderComplianceOverview();
            case 'B2_IsoCodeExplorer': return Y1_renderIsoCodeExplorer();
            case 'C2_Settings': return Z1_renderSettingsTab();
            default: return <div><AlertOctagon className="text-red-500" /> Unknown tab</div>;
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Compliance Dashboard - The James Burvel O'Callaghan III Code</h2>

            <div className="bg-gray-800 rounded-lg shadow-md p-4">
                <nav className="flex space-x-4">
                    <button onClick={() => K1_handleTabChange('A2_ComplianceOverview')} className={`px-4 py-2 rounded ${C2_useState_activeTab[0] === 'A2_ComplianceOverview' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        <FileText className="inline-block mr-2" size={16} /> Compliance Overview
                    </button>
                    <button onClick={() => K1_handleTabChange('B2_IsoCodeExplorer')} className={`px-4 py-2 rounded ${C2_useState_activeTab[0] === 'B2_IsoCodeExplorer' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        <Code className="inline-block mr-2" size={16} /> ISO 20022 Explorer
                    </button>
                    <button onClick={() => K1_handleTabChange('C2_Settings')} className={`px-4 py-2 rounded ${C2_useState_activeTab[0] === 'C2_Settings' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        <Settings className="inline-block mr-2" size={16} /> Settings
                    </button>
                </nav>
            </div>

            {AA1_renderDashboard()}
            {X1_renderCaseDetails()}
        </div>
    );
};

export default A1_OCallaghanComplianceSolutions_ComplianceView;


// --- CONSOLIDATED FROM: ./components/views/corporate/ComplianceView.tsx ---

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