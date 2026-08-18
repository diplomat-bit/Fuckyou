// components/views/platform/DemoBankProjectsView.tsx
import React, { useState, useMemo, useContext } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";
import { DataContext } from '../../../context/DataContext';
import { ProjectTask, ProjectStatus } from '../../../types';

const COLUMNS: ProjectStatus[] = ['Backlog', 'In Progress', 'Review', 'Done'];


const DemoBankProjectsView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("ProjectsView must be within a DataProvider");
    
    // In a real app, you might have multiple projects. For this demo, we'll use the first one.
    const project = context.projects[0];

    const [tasks, setTasks] = useState<ProjectTask[]>(project.tasks);
    const [isTaskModalOpen, setTaskModalOpen] = useState(false);
    const [prompt, setPrompt] = useState("Launch new marketing website");
    const [isLoading, setIsLoading] = useState(false);

    const columns = useMemo(() => {
        return COLUMNS.map(status => ({
            status,
            tasks: tasks.filter(task => task.status === status),
        }));
    }, [tasks]);
    
    const handleGenerateTasks = async () => {
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = { type: Type.OBJECT, properties: { tasks: { type: Type.ARRAY, items: { type: Type.STRING } } } };
            const fullPrompt = `You are a project manager. Break down the following project goal into a short list of 5-7 actionable tasks: "${prompt}".`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt, config: { responseMimeType: "application/json", responseSchema: schema } });
            const result = JSON.parse(response.text);
            const newTasks: ProjectTask[] = result.tasks.map((title: string) => ({
                id: `task-${Date.now()}-${Math.random()}`,
                title,
                status: 'Backlog',
                assignee: 'Unassigned'
            }));
            setTasks(prev => [...prev, ...newTasks]);
            setTaskModalOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const TaskCardUI: React.FC<{ task: ProjectTask }> = ({ task }) => (
        <div className="p-3 bg-gray-800/80 rounded-lg border border-gray-700 hover:border-cyan-500 cursor-pointer">
            <p className="text-sm text-gray-200">{task.title}</p>
            <p className="text-xs text-gray-400 mt-2">Assignee: {task.assignee}</p>
        </div>
    );

    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Projects</h2>
                    <button onClick={() => setTaskModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">Generate Tasks with AI</button>
                </div>
                <Card title={`Project Board: ${project.name}`}>
                     <div className="flex gap-6 overflow-x-auto p-2">
                        {columns.map(column => (
                            <div key={column.status} className="w-72 flex-shrink-0 bg-gray-900/50 rounded-lg p-3">
                                <h3 className="font-semibold text-white mb-4 px-2">{column.status} ({column.tasks.length})</h3>
                                <div className="space-y-3 h-[60vh] overflow-y-auto pr-2">
                                    {column.tasks.map(task => <TaskCardUI key={task.id} task={task} />)}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            {isTaskModalOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setTaskModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Task Generator</h3></div>
                        <div className="p-6 space-y-4">
                            <label className="text-sm text-gray-400">Enter a project goal:</label>
                            <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full bg-gray-700/50 p-2 rounded text-white" />
                            <button onClick={handleGenerateTasks} disabled={isLoading} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">{isLoading ? 'Generating...' : 'Generate Tasks'}</button>
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default DemoBankProjectsView;