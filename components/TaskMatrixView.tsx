// components/views/productivity/TaskMatrixView.tsx
import React, { useState, useMemo } from 'react';
import Card from '../../Card';
import { Task, TaskPriority } from '../../../types';

// Mock data to start with
const MOCK_TASKS: Task[] = [
    { id: '1', text: 'Finalize Q3 budget report', completed: false, dueDate: '2024-08-15', priority: 'High', category: 'Finance', createdAt: Date.now() - 100000 },
    { id: '2', text: 'Draft "The First Covenant" document', completed: true, dueDate: '2024-07-30', priority: 'Urgent', category: 'Strategy', createdAt: Date.now() - 200000 },
    { id: '3', text: 'Onboard new AI model to production', completed: false, dueDate: '2024-08-20', priority: 'Medium', category: 'Engineering', createdAt: Date.now() - 50000 },
    { id: '4', text: 'Schedule team offsite', completed: false, dueDate: null, priority: 'Low', category: 'HR', createdAt: Date.now() },
];

const PRIORITY_STYLES: Record<TaskPriority, { icon: React.ReactNode, color: string }> = {
    'Low': { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>, color: 'text-gray-400' },
    'Medium': { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>, color: 'text-cyan-400' },
    'High': { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>, color: 'text-yellow-400' },
    'Urgent': { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'text-red-400' }
};

const TaskMatrixView: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ status: 'all', priority: 'all', category: 'all' });

    const categories = useMemo(() => ['all', ...Array.from(new Set(tasks.map(t => t.category)))], [tasks]);

    const filteredTasks = useMemo(() => {
        return tasks
            .filter(task => searchTerm === '' || task.text.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(task => filters.status === 'all' || (filters.status === 'completed' ? task.completed : !task.completed))
            .filter(task => filters.priority === 'all' || task.priority === filters.priority)
            .filter(task => filters.category === 'all' || task.category === filters.category);
    }, [tasks, searchTerm, filters]);

    const toggleTask = (id: string) => {
        setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
    };

    const handleDelete = (id: string) => {
        setTasks(tasks.filter(task => task.id !== id));
        setTaskToDelete(null);
    };

    const addTask = (text: string, dueDate: string | null, priority: TaskPriority, category: string) => {
        const newTask: Task = {
            id: Date.now().toString(), text, dueDate, priority, category, completed: false, createdAt: Date.now()
        };
        setTasks([newTask, ...tasks]);
    };

    return (
        <div className="space-y-6">
            <style>{`
                .task-item-enter {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                .task-item-enter-active {
                    opacity: 1;
                    transform: translateY(0);
                    transition: opacity 300ms, transform 300ms;
                }
                .task-completed span {
                    text-decoration: line-through;
                    color: #6b7280;
                    transition: all 0.3s ease-in-out;
                }
                 .task-completed .checkbox-anim {
                    transform: scale(1.2);
                    transition: transform 0.2s ease-out;
                }
            `}</style>

            <h2 className="text-3xl font-bold text-white tracking-wider">Task Matrix</h2>
            
            <AddTaskForm onAddTask={addTask} categories={categories.filter(c => c !== 'all')} />

            <Card>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white"
                    />
                    <select onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="bg-gray-700/50 border-gray-600 rounded-lg p-2 text-sm">
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                    </select>
                     <select onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))} className="bg-gray-700/50 border-gray-600 rounded-lg p-2 text-sm">
                        <option value="all">All Priorities</option>
                        {Object.keys(PRIORITY_STYLES).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} className="bg-gray-700/50 border-gray-600 rounded-lg p-2 text-sm">
                        {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
                    </select>
                </div>

                <div className="space-y-3">
                    {filteredTasks.map(task => (
                        <div key={task.id} className={`flex items-center justify-between p-3 bg-gray-800/50 rounded-lg transition-all duration-300 ${task.completed ? 'task-completed opacity-60' : ''}`}>
                            <div className="flex items-center gap-4 flex-grow">
                                <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="checkbox checkbox-cyan checkbox-sm checkbox-anim" />
                                <div className={`${PRIORITY_STYLES[task.priority].color}`}>{PRIORITY_STYLES[task.priority].icon}</div>
                                <span className="flex-grow">{task.text}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs flex-shrink-0 ml-4">
                                <span className="px-2 py-1 bg-gray-700 rounded-full">{task.category}</span>
                                {task.dueDate && <span className="text-gray-400">{task.dueDate}</span>}
                                <button onClick={() => setTaskToDelete(task)} className="text-gray-500 hover:text-red-400">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredTasks.length === 0 && <p className="text-center text-gray-500 py-8">No tasks match your criteria.</p>}
                </div>
            </Card>

            {taskToDelete && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-sm w-full p-6 text-center">
                        <h3 className="text-lg font-semibold text-white">Confirm Deletion</h3>
                        <p className="text-gray-400 my-4">Are you sure you want to delete this task? "{taskToDelete.text}"</p>
                        <div className="flex gap-4">
                            <button onClick={() => setTaskToDelete(null)} className="w-full py-2 bg-gray-600/50 hover:bg-gray-600 rounded">Cancel</button>
                            <button onClick={() => handleDelete(taskToDelete.id)} className="w-full py-2 bg-red-600 hover:bg-red-700 rounded">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AddTaskForm: React.FC<{onAddTask: Function, categories: string[]}> = ({ onAddTask, categories }) => {
    const [text, setText] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('Medium');
    const [category, setCategory] = useState('General');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        onAddTask(text, dueDate || null, priority, category);
        setText(''); setDueDate('');
    };

    return (
        <Card>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 items-center">
                <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Add a new sovereign objective..." className="flex-grow bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white w-full"/>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white"/>
                <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className="bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white">
                    {Object.keys(PRIORITY_STYLES).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input list="categories" value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" className="bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white w-32"/>
                <datalist id="categories">
                    {categories.map(c => <option key={c} value={c} />)}
                </datalist>
                <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg w-full md:w-auto">Add Task</button>
            </form>
        </Card>
    );
}

export default TaskMatrixView;
