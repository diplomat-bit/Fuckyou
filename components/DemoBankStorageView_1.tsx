import React from 'react';
import Card from '../../Card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// In a real app, this data would come from a dedicated file or a live API call
const dataGrowthData = [
    { name: 'Jan', size: 120 }, { name: 'Feb', size: 150 },
    { name: 'Mar', size: 180 }, { name: 'Apr', size: 220 },
    { name: 'May', size: 280 }, { name: 'Jun', size: 350 },
];
const mockFiles = [
    { name: 'production-backups/', type: 'folder', size: '150 TB', modified: '2024-07-23' },
    { name: 'analytics-datasets/', type: 'folder', size: '80 TB', modified: '2024-07-22' },
    { name: 'ml-models/', type: 'folder', size: '45 TB', modified: '2024-07-20' },
    { name: 'user-assets/', type: 'folder', size: '75 TB', modified: '2024-07-23' },
    { name: 'archive.zip', type: 'file', size: '2 TB', modified: '2024-06-30' },
];
const FolderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
const FileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;

const DemoBankStorageView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Storage</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">352 TB</p><p className="text-sm text-gray-400 mt-1">Total Data Stored</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">1 PB</p><p className="text-sm text-gray-400 mt-1">Total Capacity</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">12.5M</p><p className="text-sm text-gray-400 mt-1">Total Objects</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">99.999%</p><p className="text-sm text-gray-400 mt-1">Durability</p></Card>
            </div>
            
            <Card title="Data Growth (TB)">
                 <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dataGrowthData}>
                        <defs><linearGradient id="colorSize" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" unit=" TB" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                        <Area type="monotone" dataKey="size" stroke="#10b981" fill="url(#colorSize)" />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            <Card title="Storage Browser: /datalake-prod">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Size</th>
                                <th scope="col" className="px-6 py-3">Last Modified</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockFiles.map(file => (
                                <tr key={file.name} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                                        {file.type === 'folder' ? <FolderIcon /> : <FileIcon />}
                                        {file.name}
                                    </td>
                                    <td className="px-6 py-4 font-mono">{file.size}</td>
                                    <td className="px-6 py-4">{file.modified}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankStorageView;
