// components/views/megadashboard/digitalassets/SmartContractsView.tsx
import React, { useState } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

const SmartContractsView: React.FC = () => {
    const [isAuditorOpen, setAuditorOpen] = useState(false);
    const [code, setCode] = useState('contract SimpleStore { uint256 public myNumber; function set(uint256 x) public { myNumber = x; } }');
    const [auditReport, setAuditReport] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAudit = async () => {
        setIsLoading(true);
        setAuditReport('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `You are a smart contract security auditor. Analyze the following Solidity code for potential vulnerabilities like reentrancy, integer overflow, or access control issues. Provide a brief report. Code: \`\`\`solidity\n${code}\n\`\`\``;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setAuditReport(response.text);
        } catch (err) {
            setAuditReport("Error generating audit report.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Smart Contract Management</h2>
                    <button onClick={() => setAuditorOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Security Auditor</button>
                </div>
            </div>
            {isAuditorOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setAuditorOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Security Auditor</h3></div>
                        <div className="p-6 space-y-4">
                             <textarea value={code} onChange={e => setCode(e.target.value)} className="w-full h-40 bg-gray-900/50 p-2 rounded text-white font-mono text-sm" />
                             <button onClick={handleAudit} disabled={isLoading} className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50">{isLoading ? 'Auditing...' : 'Audit Code'}</button>
                            <Card title="Audit Report"><div className="min-h-[10rem] text-sm text-gray-300 whitespace-pre-line">{isLoading ? '...' : auditReport}</div></Card>
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default SmartContractsView;
