// components/views/blueprints/SonicAlchemyView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

const SonicAlchemyView: React.FC = () => {
    const [prompt, setPrompt] = useState('a melancholic but hopeful piano piece for a rainy day');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setResult(null);
        try {
            // NOTE: This simulates a call to a text-to-music model like MusicLM.
            // Since there's no public client-side SDK for that yet, we use a text model
            // to generate a DESCRIPTION of the music, and simulate the audio.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = { type: Type.OBJECT, properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                instrumentation: { type: Type.ARRAY, items: {type: 'STRING'}}
            }};
            const fullPrompt = `You are a music composer AI. A user wants a piece of music. Based on their prompt, generate a title, a short description of the piece, and list the primary instrumentation. Prompt: "${prompt}"`;

            const response = await ai.models.generateContent({ 
                model: 'gemini-2.5-flash', 
                contents: fullPrompt,
                config: { responseMimeType: "application/json", responseSchema: schema }
            });
            setResult(JSON.parse(response.text));

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white tracking-wider">Blueprint 105: Sonic Alchemy</h1>
            <Card title="Music Prompt">
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-700/50 p-3 rounded text-white text-lg focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50">
                    {isLoading ? 'Composing...' : 'Generate Music'}
                </button>
            </Card>
            {(isLoading || result) && (
                 <Card title="Generated Composition">
                     {isLoading ? <p>Composing...</p> : (
                        <div className="p-4">
                            <h3 className="text-2xl font-semibold text-white">{result.title}</h3>
                            <p className="text-sm text-gray-400 italic my-2">"{result.description}"</p>
                            <p className="text-sm"><strong className="text-cyan-300">Instrumentation:</strong> {result.instrumentation.join(', ')}</p>
                            <div className="mt-4 flex items-center gap-4">
                                <button onClick={() => setIsPlaying(p => !p)} className="p-3 bg-cyan-500/20 rounded-full">
                                     <svg className="h-6 w-6 text-cyan-300" viewBox="0 0 24 24" fill="currentColor">{isPlaying ? <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path> : <path d="M8 5v14l11-7z"></path>}</svg>
                                </button>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div className={`bg-cyan-500 h-2 rounded-full ${isPlaying ? 'animate-pulse' : ''}`} style={{width: isPlaying ? '100%' : '0%', transition: isPlaying ? 'width 15s linear' : 'none'}}></div>
                                </div>
                            </div>
                        </div>
                     )}
                </Card>
            )}
        </div>
    );
};

export default SonicAlchemyView;
