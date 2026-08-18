import React, { useState } from 'react';
import Card from '../../Card';

// In a real app, this data would come from a dedicated file or a live API call
const exampleQueries = [
    "FROM transactions SELECT description, amount WHERE amount > 100 AND category = 'Shopping' ORDER BY date DESC LIMIT 10;",
    "FROM accounts GET balance, type, name;",
    "FROM anomalies SELECT severity, details WHERE riskScore > 80;"
];
const mockResults = {
    headers: ['description', 'amount'],
    rows: [
        ['New Tech Gadget', 299.99],
        ['Flight Tickets', 450.00],
    ]
};

const DemoBankDBQLView: React.FC = () => {
    const [query, setQuery] = useState(exampleQueries[0]);
    const [results, setResults] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const runQuery = () => {
        setIsLoading(true);
        setResults(null);
        setTimeout(() => {
            setResults(mockResults);
            setIsLoading(false);
        }, 1500);
    };
    
    // Simple syntax highlighter
    const highlightedQuery = query.split(/(\s+)/).map((word, i) => {
        const upperWord = word.toUpperCase();
        if (['FROM', 'SELECT', 'WHERE', 'AND', 'ORDER', 'BY', 'DESC', 'ASC', 'LIMIT', 'GET'].includes(upperWord)) {
            return <span key={i} className="text-cyan-400">{word}</span>;
        }
        if (['transactions', 'accounts', 'anomalies'].includes(word)) {
            return <span key={i} className="text-green-400">{word}</span>;
        }
         if (['>', '=', '<'].includes(word)) {
            return <span key={i} className="text-yellow-400">{word}</span>;
        }
        return <span key={i}>{word}</span>;
    });

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Query Language (DBQL)</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card title="Query Editor">
                        <div className="bg-gray-900 font-mono text-sm p-4 rounded-lg border border-gray-700 h-48 overflow-auto whitespace-pre-wrap">
                            {highlightedQuery}
                        </div>
                        <button onClick={runQuery} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50">
                            {isLoading ? 'Running...' : 'Run Query'}
                        </button>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Card title="Example Queries">
                        <div className="space-y-2">
                            {exampleQueries.map((q, i) => (
                                <button key={i} onClick={() => setQuery(q)} className="w-full text-left p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-xs font-mono text-gray-300">
                                    {q}
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
            
            <Card title="Results">
                {isLoading && <p className="text-center text-gray-400">Executing query...</p>}
                {results && (
                    <div className="overflow-x-auto">
                         <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    {results.headers.map((h: string) => <th key={h} scope="col" className="px-6 py-3">{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {results.rows.map((row: any[], i: number) => (
                                    <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        {row.map((cell, j) => <td key={j} className="px-6 py-4 font-mono text-white">{cell}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {!isLoading && !results && <p className="text-center text-gray-500">Query results will appear here.</p>}
            </Card>
        </div>
    );
};

export default DemoBankDBQLView;
