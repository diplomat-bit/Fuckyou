// components/views/personal/PersonalizationView.tsx
import React, { useContext, useState } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { IllusionType } from '../../../types';
import { GoogleGenAI } from '@google/genai';

const PersonalizationView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("PersonalizationView must be within a DataProvider.");

    const { customBackgroundUrl, setCustomBackgroundUrl, activeIllusion, setActiveIllusion } = context;

    const [imageUrl, setImageUrl] = useState('');
    const [aiPrompt, setAiPrompt] = useState('An isolated lighthouse on a stormy sea, digital painting');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    
    const handleGenerate = async () => {
        setIsGenerating(true);
        setError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: aiPrompt,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
            });
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            const generatedUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
            setCustomBackgroundUrl(generatedUrl);
        } catch (err) {
            setError('Could not generate image. The model may have safety concerns with your prompt.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Personalization</h2>
            <Card title="Dynamic Visuals">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                        <h4 className="font-semibold text-white">Aurora Illusion</h4>
                        <p className="text-sm text-gray-400">A dynamic, flowing gradient inspired by the northern lights.</p>
                    </div>
                    <input type="radio" name="theme" className="radio radio-primary" checked={activeIllusion === 'aurora'} onChange={() => setActiveIllusion('aurora')} />
                </div>
                 <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg mt-2">
                    <div><h4 className="font-semibold text-white">None</h4><p className="text-sm text-gray-400">Default dark theme.</p></div>
                    <input type="radio" name="theme" className="radio radio-primary" checked={activeIllusion === 'none'} onChange={() => setActiveIllusion('none')} />
                </div>
            </Card>
            
            <Card title="AI Background Generator">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <p className="text-gray-400 mb-4">Describe the background you want, and our AI will create it for you.</p>
                        <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} className="w-full h-24 bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                        <button onClick={handleGenerate} disabled={isGenerating} className="w-full mt-2 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50">{isGenerating ? 'Generating...' : 'Generate & Set Background'}</button>
                        {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
                    </div>
                    <div className="h-48 rounded-lg bg-gray-900/50 flex items-center justify-center">
                        {isGenerating ? <p className="text-cyan-300">Generating...</p> : <p className="text-gray-500">Preview will appear here</p>}
                    </div>
                </div>
            </Card>

            <Card title="Custom Background Image">
                <p className="text-gray-400 mb-4">Or, paste an image URL for a static background.</p>
                <div className="flex gap-2">
                    <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <button onClick={() => setCustomBackgroundUrl(imageUrl)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">Set Image</button>
                </div>
            </Card>
        </div>
    );
};

export default PersonalizationView;
