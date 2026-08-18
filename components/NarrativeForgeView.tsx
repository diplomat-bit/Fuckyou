// components/views/blueprints/NarrativeForgeView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

const NarrativeForgeView: React.FC = () => {
    const [script, setScript] = useState(
`[SCENE START]

INT. COFFEE SHOP - NIGHT

A coffee shop, moments before closing. Rain streaks down the windows.
ALEX (30s), tired and cynical, wipes down a counter.
MAYA (30s), energetic and optimistic, enters, shaking off an umbrella.

MAYA
You're still here.

ALEX
The world needs its caffeine, even at the bitter end.

MAYA
(Smiling)
The world needs its dreamers more. That's why I'm here. I have an idea.

ALEX
(Scoffs)
Another one? Does this one also involve teaching squirrels to code?
`
    );
    const [prompt, setPrompt] = useState('Suggest a witty, sarcastic comeback for Alex.');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setSuggestions([]);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = { type: Type.OBJECT, properties: { suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } } };
            const fullPrompt = `You are an expert screenwriter. Based on the following scene context, generate 3 alternative lines of dialogue for the character Alex that match the user's request.

            **Scene Context:**
            ${script}
            
            **User Request:**
            ${prompt}`;

            const response = await ai.models.generateContent({ 
                model: 'gemini-2.5-flash', 
                contents: fullPrompt, 
                config: { responseMimeType: "application/json", responseSchema: schema }
            });
            const result = JSON.parse(response.text);
            setSuggestions(result.suggestions);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white tracking-wider">Blueprint 103: Narrative Forge</h1>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card title="Script Editor">
                        <textarea
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            className="w-full h-[60vh] bg-gray-900/50 p-4 rounded-lg font-mono text-sm text-gray-300 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Card title="AI Co-Writer">
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-gray-300">Your Request:</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={3}
                                className="w-full bg-gray-700/50 p-2 rounded text-white"
                            />
                            <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50">
                                {isLoading ? 'Generating...' : 'Get Suggestions'}
                            </button>
                            {suggestions.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-300">Suggestions:</h4>
                                    {suggestions.map((s, i) => (
                                        <p key={i} className="text-sm p-2 bg-gray-900/50 rounded italic">"{s}"</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default NarrativeForgeView;
