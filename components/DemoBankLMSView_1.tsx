// components/views/platform/DemoBankLMSView.tsx
import React, { useState, useContext } from 'react';
import Card from '../../Card';
import { DataContext } from '../../../context/DataContext';
import { GoogleGenAI, Type } from "@google/genai";
import { Course } from '../../../types';

const DemoBankLMSView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("LMSView must be within a DataProvider");
    const { courses } = context;

    const [isOutlineModalOpen, setOutlineModalOpen] = useState(false);
    const [topic, setTopic] = useState("Introduction to Corporate Finance");
    const [generatedOutline, setGeneratedOutline] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedOutline(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Generate a 4-module course outline for the topic: "${topic}". For each module, provide a title and 3-4 lesson titles.`;
            const schema = { type: Type.OBJECT, properties: { modules: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, lessons: { type: Type.ARRAY, items: { type: Type.STRING } } } } } } };
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema }});
            setGeneratedOutline(JSON.parse(response.text));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank LMS</h2>
                     <button onClick={() => setOutlineModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Course Outliner</button>
                </div>
                <Card title="Course Catalog">
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                             <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr><th>Title</th><th>Category</th><th>Enrollments</th><th>Completion</th></tr>
                            </thead>
                            <tbody>
                                {courses.map(c => (
                                    <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-medium text-white">{c.title}</td>
                                        <td className="px-6 py-4">{c.category}</td>
                                        <td className="px-6 py-4">{c.enrollment.toLocaleString()}</td>
                                        <td className="px-6 py-4">{c.completionRate}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
             {isOutlineModalOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setOutlineModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Course Outliner</h3></div>
                        <div className="p-6 space-y-4">
                            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Enter a course topic..." className="w-full bg-gray-700/50 p-2 rounded text-white" />
                            <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">{isLoading ? 'Generating...' : 'Generate Outline'}</button>
                            {(isLoading || generatedOutline) && <Card title="Generated Outline"><div className="min-h-[15rem] max-h-80 overflow-y-auto space-y-4 p-2">{isLoading ? <p>Generating...</p> : generatedOutline.modules.map((m: any, i: number) => (<div key={i}><h4 className="font-semibold text-cyan-300">{m.title}</h4><ul className="list-disc list-inside text-sm text-gray-300">{m.lessons.map((l: string, j: number) => <li key={j}>{l}</li>)}</ul></div>))}</div></Card>}
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default DemoBankLMSView;