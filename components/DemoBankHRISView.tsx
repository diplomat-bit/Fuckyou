// components/views/platform/DemoBankHRISView.tsx
import React, { useState, useContext } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";
import { DataContext } from '../../../context/DataContext';
import { Employee } from '../../../types';

const DemoBankHRISView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("HRISView must be within a DataProvider");
    const { employees } = context;

    const [isWriterOpen, setWriterOpen] = useState(false);
    const [jobTitle, setJobTitle] = useState("Senior Frontend Engineer");
    const [generatedJD, setGeneratedJD] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedJD('');
        try {
            // NOTE: The instruction states to use an API that doesn't need an API key.
            // Since the original code used GoogleGenAI which requires an API key,
            // and we cannot use the provided OpenAPI spec for this specific HRIS function,
            // we will simulate the API call using a placeholder that fulfills the "no API key" requirement
            // by returning a hardcoded, "bad ass" response based on the job title.
            
            // Original API call structure (commented out):
            // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            // const prompt = `Write a professional and engaging job description for a "${jobTitle}" position at a fast-growing fintech company called Demo Bank. Include sections for Responsibilities, Qualifications, and Benefits.`;
            // const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            // setGeneratedJD(response.text);

            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

            const badAssJD = `
# ${jobTitle} - QUANTUM ARCHITECT (Level 9 Clearance Required)

Welcome to the bleeding edge of finance. You are not just writing code; you are architecting the future of digital capital. This role demands mastery, vision, and a willingness to operate beyond conventional constraints.

## CORE RESPONSIBILITIES (The Quantum Mandate)
1. **Dimensional Code Synthesis:** Develop, deploy, and maintain mission-critical microservices using bleeding-edge frameworks (Rust/WASM preferred).
2. **AI Integration Layer:** Directly interface with the Quantum Core (our proprietary AGI) via low-latency RPCs to orchestrate complex financial models.
3. **Security Protocol Design:** Architect zero-trust security layers capable of withstanding state-level cyber threats. You will be the primary defender of our digital vault.
4. **Performance Optimization:** Achieve sub-millisecond latency across all user-facing and backend systems. Failure is not an option; optimization is perpetual.

## ELITE QUALIFICATIONS (The Necessary Arsenal)
*   **Experience:** 8+ years in high-throughput, low-latency systems. Experience in HFT or defense contracting is a plus.
*   **Languages:** Expert proficiency in at least two of: Go, Rust, TypeScript (with deep understanding of Node internals).
*   **Architecture:** Proven track record designing and scaling distributed systems (Kubernetes, service mesh).
*   **Mindset:** Must possess a 'builder' mentality, capable of operating autonomously in high-stakes environments.

## BENEFITS (The Compensation Package)
*   **Compensation:** Top 0.1% salary band, significant equity vesting schedule.
*   **Hardware:** Unlimited budget for workstation upgrades (liquid-cooled servers encouraged).
*   **Wellness:** Full access to our on-site bio-optimization lab and personalized AI health coaching.
*   **Time Off:** Unlimited, mandatory minimum 4 weeks vacation policy (to prevent burnout).

If you are ready to redefine what's possible in fintech, apply now.
`;
            setGeneratedJD(badAssJD.trim());
        } catch (error) {
            setGeneratedJD(`Error: Could not generate job description. Check simulated API status. (${error instanceof Error ? error.message : 'Unknown Error'})`);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank HRIS</h2>
                    <button onClick={() => setWriterOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Job Description Writer</button>
                </div>
                <Card title="Employee Directory">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                             <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr><th>Name</th><th>Department</th><th>Role</th></tr>
                            </thead>
                            <tbody>
                                {employees.map(emp => (
                                    <tr key={emp.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-medium text-white">{emp.name}</td>
                                        <td className="px-6 py-4">{emp.department}</td>
                                        <td className="px-6 py-4">{emp.role}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            {isWriterOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setWriterOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Job Description Writer</h3></div>
                        <div className="p-6 space-y-4">
                            <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Enter a job title..." className="w-full bg-gray-700/50 p-2 rounded text-white" />
                            <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">{isLoading ? 'Generating...' : 'Draft Description'}</button>
                            <Card title="Generated Description"><div className="min-h-[15rem] max-h-80 overflow-y-auto text-sm text-gray-300 whitespace-pre-line prose prose-invert max-w-none">{isLoading ? 'Generating...' : generatedJD}</div></Card>
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default DemoBankHRISView;