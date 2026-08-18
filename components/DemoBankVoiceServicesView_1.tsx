// components/views/platform/DemoBankVoiceServicesView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

const DemoBankVoiceServicesView: React.FC = () => {
    const [prompt, setPrompt] = useState('Welcome to Demo Bank. How can I help you today?');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedAudio(null);
        // In a real app, this would call a text-to-speech API (e.g., Google TTS).
        // For this demo, we will simulate the generation and store the text itself.
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const validationPrompt = `Is the following text appropriate for a professional voice assistant? Text: "${prompt}"`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: validationPrompt });
            // Simple check for demo purposes
            if(response.text.toLowerCase().includes("yes")){
                setGeneratedAudio(prompt);
            } else {
                setGeneratedAudio("Content may be inappropriate for generation.");
            }
        } catch(e) {
            setGeneratedAudio("Could not generate audio at this time.");
        } finally {
            setIsLoading(false);
            setIsPlaying(false);
        }
    };
    
    const handlePlay = () => {
        setIsPlaying(true);
        // Simulate audio playback duration
        setTimeout(() => setIsPlaying(false), 3000);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Voice Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">500k</p><p className="text-sm text-gray-400 mt-1">TTS Chars (24h)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">1200</p><p className="text-sm text-gray-400 mt-1">Minutes Transcribed</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">98%</p><p className="text-sm text-gray-400 mt-1">Transcription Accuracy</p></Card>
            </div>
            <Card title="AI Text-to-Speech (TTS) Generator">
                <p className="text-gray-400 mb-4">Enter text to generate a simulated audio playback.</p>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full h-24 bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">
                    {isLoading ? 'Generating...' : 'Generate Audio'}
                </button>
            </Card>

            {generatedAudio && (
                <Card title="Generated Audio">
                    <div className="flex items-center gap-4">
                        <button onClick={handlePlay} disabled={isPlaying} className="p-3 bg-cyan-500/20 rounded-full disabled:opacity-50">
                            {isPlaying ? (
                                <svg className="h-6 w-6 text-cyan-300" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
                            ) : (
                                <svg className="h-6 w-6 text-cyan-300" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
                            )}
                        </button>
                        <p className="text-gray-300 italic">"{generatedAudio}"</p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default DemoBankVoiceServicesView;