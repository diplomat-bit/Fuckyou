// components/views/platform/InventionsView.tsx
import React, { useState, useEffect } from 'react';
import Card from '../../Card';

interface Document {
    path: string;
    title: string;
    type: 'Invention' | 'Prototype';
}

// In a real app with a backend, we'd fetch this list from an API.
// Here, we hardcode it to represent the files we are creating.
const DOCUMENT_LIST: Document[] = Array.from({ length: 100 }, (_, i) => ({
    path: `/inventions/${String(i + 1).padStart(3, '0')}_${'invention_name'}.md`,
    title: `Invention #${String(i + 1).padStart(3, '0')}`,
    type: 'Invention'
}));

const PROTOTYPE_LIST: Document[] = Array.from({ length: 100 }, (_, i) => ({
    path: `/prototypes/prototype_${String(i + 1).padStart(3, '0')}.md`,
    title: `Prototype #${String(i + 1).padStart(3, '0')}`,
    type: 'Prototype'
}));

// Manually update the known titles for the files we have full content for.
const updateKnownTitles = (doc: Document) => {
    const knownTitles: Record<string, string> = {
        '/inventions/001_generative_ui_background.md': "Generative UI Backgrounds",
        '/inventions/002_ai_contextual_prompt_suggestion.md': "AI Contextual Prompts",
        '/prototypes/prototype_001.md': "The Sovereign's Key",
        '/prototypes/prototype_002.md': "The Oracle's Lens",
        '/prototypes/prototype_003.md': "The Weaver's Blueprints",
    };
    if (knownTitles[doc.path]) {
        return { ...doc, title: knownTitles[doc.path] };
    }
    return doc;
};


const InventionsView: React.FC = () => {
    const [documentList, setDocumentList] = useState<Document[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [docContent, setDocContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Manually create the full list for the demo
        const allDocs = [...DOCUMENT_LIST.slice(0, 75), ...PROTOTYPE_LIST].map(updateKnownTitles);
        setDocumentList(allDocs);
        setSelectedDoc(allDocs.find(d => d.path === '/prototypes/prototype_001.md') || null);
    }, []);

    useEffect(() => {
        if (selectedDoc) {
            setIsLoading(true);
            setDocContent('');
            fetch(selectedDoc.path)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Document not found');
                    }
                    return response.text();
                })
                .then(text => {
                    setDocContent(text);
                })
                .catch(error => {
                    setDocContent(`# Error\n\nCould not load document: \`${selectedDoc.path}\`\n\nThis is a conceptual blueprint. The full content for all 100+ items would be generated in a complete implementation.`);
                })
                .finally(() => setIsLoading(false));
        }
    }, [selectedDoc]);

    const filteredDocs = documentList.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Invention & Prototype Codex</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[75vh]">
                <div className="lg:col-span-1">
                    <Card title="Registry" className="h-full flex flex-col" padding="none">
                        <div className="p-4 border-b border-gray-700/60">
                             <input 
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white"
                            />
                        </div>
                        <div className="flex-grow overflow-y-auto p-4 space-y-2">
                            {filteredDocs.map(doc => (
                                <button
                                    key={doc.path}
                                    onClick={() => setSelectedDoc(doc)}
                                    className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${selectedDoc?.path === doc.path ? 'bg-cyan-500/20 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
                                >
                                    <span className={`text-xs font-bold ${doc.type === 'Prototype' ? 'text-indigo-300' : 'text-cyan-300'}`}>{doc.type}</span>
                                    <p className="truncate">{doc.title}</p>
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-3">
                    <Card className="h-full">
                        <div className="h-full overflow-y-auto prose prose-invert max-w-none prose-pre:bg-gray-900/50 prose-pre:p-4 prose-pre:rounded-lg">
                            {isLoading ? <p>Loading document...</p> : <pre className="font-sans whitespace-pre-wrap">{docContent}</pre>}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default InventionsView;
