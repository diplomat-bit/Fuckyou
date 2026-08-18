// components/IntegrationCodex.tsx
// This is the sacred heart of the platform's new vision: a universal, AI-powered
// component that reveals the infinite connections of any module it inhabits.

// FIX: Added useEffect to the React import to resolve 'Cannot find name' error.
import React, { useState, useRef, useEffect } from 'react';
import { View } from '../types';
import Card from './Card';
import { INTEGRATION_DATA } from '../data/integrationData';
import { GoogleGenAI, Chat } from "@google/genai";
import type { Language } from '../types';


// ================================================================================================
// ICON COMPONENTS (Self-contained for portability)
// ================================================================================================
const TypeScriptIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#3178C6" d="M0 0h24v24H0z"/><path fill="#fff" d="M9.4 16.6h1.4v-1.4H9.4v1.4zm2.8 0h1.4v-1.4h-1.4v1.4zm2.8 0h1.4v-1.4h-1.4v1.4zM21 4H3v16h18V4zm-3.5 14H16v-1.4h-1.4v-1.4H16v-1.4h1.4v4.2zM12.6 18v-1.4h1.4V18h-1.4zm-2.8 0v-1.4h1.4V18H9.8zm-2.8 0v-1.4h1.4V18H7zm-2.1-4.2H6.3V18H4.9v-4.2h1.4v1.4H4.9v1.4h1.4v-1.4zM16.8 14h-1.4v-1.4h1.4v-1.4h1.4V14h-1.4zm-4.2-1.4H11.2V14h1.4v-1.4zm-2.8 0H8.4V14h1.4v-1.4z"/></svg>;
const PythonIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#3776AB" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 13h-2v2h-4v-2H8v-2h2V9H8V7h4v2h2v2h2v2z"/><path fill="#FFD43B" d="M12 15h2v-2h-2v2zm-4 0h2v-2H8v2z"/></svg>;
const GoIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#00ADD8" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4v-2h2v2h-2zm0-4V7h2v2h-2z"/></svg>;

// ================================================================================================
// MAIN COMPONENT: IntegrationCodex
// ================================================================================================

interface IntegrationCodexProps {
    module: View;
}

const IntegrationCodex: React.FC<IntegrationCodexProps> = ({ module }) => {
    const [activeTab, setActiveTab] = useState<'integrations' | 'useCases' | 'oracle'>('integrations');
    const data = INTEGRATION_DATA[module];

    if (!data) {
        return null; // Don't render if there's no integration data for this module
    }

    return (
        <Card title="Integration Codex" className="mt-6" isCollapsible defaultCollapsed>
            <div className="flex border-b border-gray-700 mb-4">
                <TabButton label="Integrations" isActive={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} />
                <TabButton label="Use Cases" isActive={activeTab === 'useCases'} onClick={() => setActiveTab('useCases')} />
                <TabButton label="Nexus Oracle" isActive={activeTab === 'oracle'} onClick={() => setActiveTab('oracle')} />
            </div>
            <div>
                {activeTab === 'integrations' && <IntegrationsPanel integrations={data.integrations} />}
                {activeTab === 'useCases' && <UseCasesPanel useCases={data.useCases} />}
                {activeTab === 'oracle' && <NexusOraclePanel moduleName={module} />}
            </div>
        </Card>
    );
};

const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${isActive ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-gray-400 hover:text-white'}`}>
        {label}
    </button>
);


// ================================================================================================
// PANELS
// ================================================================================================

const IntegrationsPanel: React.FC<{integrations: any[]}> = ({ integrations }) => {
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(integrations[0]?.name || null);
    const [selectedLanguage, setSelectedLanguage] = useState<Language>('typescript');
    const [copySuccess, setCopySuccess] = useState('');

    const activeSnippet = integrations
        .find(p => p.name === selectedPlatform)?.snippets
        .find((s: any) => s.language === selectedLanguage);
    
    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-2">
                {integrations.map(platform => (
                    <button key={platform.name} onClick={() => setSelectedPlatform(platform.name)} className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${selectedPlatform === platform.name ? 'bg-cyan-500/20' : 'hover:bg-gray-700/50'}`}>
                        <div className="w-8 h-8 flex-shrink-0">{platform.logo}</div>
                        <span className="text-sm font-medium text-white">{platform.name}</span>
                    </button>
                ))}
            </div>
            <div className="md:col-span-3">
                {integrations.find(p => p.name === selectedPlatform) && (
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <p className="text-sm text-gray-300 mb-4">{integrations.find(p => p.name === selectedPlatform)!.description}</p>
                        <div className="flex gap-2 mb-2 p-1 bg-gray-800/50 rounded-lg w-min">
                            <LangButton lang="typescript" Icon={TypeScriptIcon} selected={selectedLanguage} setSelected={setSelectedLanguage} />
                            <LangButton lang="python" Icon={PythonIcon} selected={selectedLanguage} setSelected={setSelectedLanguage} />
                            <LangButton lang="go" Icon={GoIcon} selected={selectedLanguage} setSelected={setSelectedLanguage} />
                        </div>
                        <div className="relative">
                             <pre className="text-xs text-gray-300 bg-black/50 p-4 rounded-lg overflow-x-auto font-mono">
                                <code>{activeSnippet?.code || 'Select a language.'}</code>
                            </pre>
                            <button onClick={() => handleCopy(activeSnippet?.code)} className="absolute top-2 right-2 text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded">
                                {copySuccess || 'Copy'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const LangButton: React.FC<{lang: Language, Icon: React.FC, selected: Language, setSelected: (l: Language) => void}> = ({ lang, Icon, selected, setSelected }) => (
    <button onClick={() => setSelected(lang)} className={`p-1 rounded-md ${selected === lang ? 'bg-cyan-600' : 'hover:bg-gray-700'}`}>
        <Icon />
    </button>
);


const UseCasesPanel: React.FC<{useCases: any[]}> = ({ useCases }) => (
    <div className="space-y-4">
        {useCases.map(useCase => (
            <div key={useCase.title} className="p-3 bg-gray-800/50 rounded-lg border-l-4 border-indigo-500">
                <h4 className="font-semibold text-white">{useCase.title}</h4>
                <p className="text-sm text-gray-400 mt-1">{useCase.description}</p>
            </div>
        ))}
    </div>
);


const NexusOraclePanel: React.FC<{ moduleName: string }> = ({ moduleName }) => {
    const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        if (!chatRef.current) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction: `You are the Nexus Oracle, an expert AI assistant within the "${moduleName}" module of Demo Bank. Your purpose is to help users understand how to integrate with other platforms. Provide clear, step-by-step plans and generate code snippets when asked. Be concise and helpful.` }
            });
        }
    }, [moduleName]);

     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

     const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim() || !chatRef.current) return;

        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'user', text: messageText }]);
        setInput('');

        try {
            const result = await chatRef.current.sendMessage({ message: messageText });
            setMessages(prev => [...prev, { role: 'model', text: result.text }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: "An error occurred. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-96 bg-gray-900/50 rounded-lg">
             <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.length === 0 && <p className="text-gray-400 text-sm text-center p-4">Ask the Oracle how to build an integration. For example: "How do I create a new customer in Stripe?"</p>}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md p-3 rounded-lg text-sm whitespace-pre-line ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200'}`}>{msg.text}</div>
                    </div>
                ))}
                {isLoading && <div className="flex justify-start"><div className="p-3 rounded-lg bg-gray-700 text-gray-200">...</div></div>}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-2 border-t border-gray-700">
                <form onSubmit={e => {e.preventDefault(); handleSendMessage(input);}} className="flex gap-2">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask the Oracle..." className="w-full bg-gray-700/50 p-2 rounded text-sm text-white" disabled={isLoading} />
                    <button type="submit" disabled={isLoading || !input.trim()} className="px-4 bg-cyan-600 rounded disabled:opacity-50">Send</button>
                </form>
            </div>
        </div>
    );
};


export default IntegrationCodex;