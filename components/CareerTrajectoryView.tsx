// components/views/blueprints/CareerTrajectoryView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

const CareerTrajectoryView: React.FC = () => {
    const [resume, setResume] = useState(`Experience:\nSoftware Engineer at Acme Corp (2020-2024)\n- Worked on a team to build software.\n- Fixed bugs and improved performance.`);
    const [jobDesc, setJobDesc] = useState(`Job: Senior Software Engineer at Innovate Inc.\nRequirements:\n- 5+ years of experience.\n- Expertise in agile development and CI/CD pipelines.\n- Proven ability to mentor junior engineers.`);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setSuggestions([]);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `You are an expert career coach. Analyze the Job Description and suggest specific, actionable improvements for the Resume to make it a stronger match. For each suggestion, provide the 'original' text and the 'improved' text.
            **Job Description:**\n${jobDesc}\n\n**Resume:**\n${resume}`;
            const schema = { type: Type.OBJECT, properties: { improvements: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { original: {type: 'STRING'}, improved: {type: 'STRING'} }}}}};
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: schema }
            });
            setSuggestions(JSON.parse(response.text).improvements);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white tracking-wider">Blueprint 108: Career Trajectory</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Your Resume"><textarea value={resume} onChange={e => setResume(e.target.value)} className="w-full h-80 bg-gray-900/50 p-2 rounded text-sm font-mono" /></Card>
                <Card title="Target Job Description"><textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} className="w-full h-80 bg-gray-900/50 p-2 rounded text-sm" /></Card>
            </div>
            <div className="text-center">
                <button onClick={handleAnalyze} disabled={isLoading} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white disabled:opacity-50">{isLoading ? 'Analyzing...' : 'Generate Resume Suggestions'}</button>
            </div>
             {(isLoading || suggestions.length > 0) && (
                <Card title="AI Suggestions">
                    {isLoading ? <p>Analyzing...</p> : (
                        <div className="space-y-4">
                            {suggestions.map((s, i) => (
                                <div key={i} className="p-3 bg-gray-900/50 rounded-lg">
                                    <p className="text-xs text-gray-400">Original:</p>
                                    <p className="text-sm text-red-400 line-through">"{s.original}"</p>
                                    <p className="text-xs text-gray-400 mt-2">Improved:</p>
                                    <p className="text-sm text-green-400">"{s.improved}"</p>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};

export default CareerTrajectoryView;
