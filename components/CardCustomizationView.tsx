import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Palette, ShieldCheck, Zap, Layers, Download } from 'lucide-react';

interface CardConfig {
  brandColor: string;
  cardType: 'physical' | 'virtual';
  features: string[];
  holderName: string;
}

const BRAND_COLORS = [
  { name: 'Mastercard Red', value: '#EB001B' },
  { name: 'Midnight', value: '#1e293b' },
  { name: 'Royal Gold', value: '#D4AF37' },
  { name: 'Cyber Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
];

const AVAILABLE_FEATURES = [
  { id: 'contactless', label: 'Contactless Enabled', icon: Zap },
  { id: 'biometric', label: 'Biometric Auth', icon: ShieldCheck },
  { id: 'multi-currency', label: 'Multi-Currency', icon: Layers },
];

const CardCustomizationView: React.FC = () => {
  const [config, setConfig] = useState<CardConfig>({
    brandColor: '#EB001B',
    cardType: 'physical',
    features: ['contactless'],
    holderName: 'SOVEREIGN HOLDER',
  });

  const toggleFeature = (featureId: string) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-slate-100">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Card Customization Studio</h1>
        <p className="text-slate-400">Configure your Mastercard identity, branding, and security features.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Preview Section */}
        <div className="flex flex-col items-center justify-center bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
          <motion.div
            animate={{ backgroundColor: config.brandColor }}
            className="w-full max-w-sm aspect-[1.586/1] rounded-2xl shadow-2xl p-6 flex flex-col justify-between relative overflow-hidden transition-colors duration-500"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-8 bg-white/20 rounded-md backdrop-blur-sm" />
              <div className="text-white font-bold tracking-widest text-lg">MASTERCARD</div>
            </div>
            <div className="text-white font-mono text-xl tracking-widest">
              **** **** **** 4242
            </div>
            <div className="text-white font-medium uppercase tracking-wider">
              {config.holderName || 'CARD HOLDER'}
            </div>
          </motion.div>
          <div className="mt-8 text-sm text-slate-500">Live Preview: {config.cardType.toUpperCase()} CARD</div>
        </div>

        {/* Controls Section */}
        <div className="space-y-8">
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-emerald-400" /> Brand Identity
            </h3>
            <div className="flex gap-4">
              {BRAND_COLORS.map(color => (
                <button
                  key={color.value}
                  onClick={() => setConfig(prev => ({ ...prev, brandColor: color.value }))}
                  className={`w-10 h-10 rounded-full border-2 ${config.brandColor === color.value ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4">Card Format</h3>
            <div className="flex gap-4">
              {(['physical', 'virtual'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setConfig(prev => ({ ...prev, cardType: type }))}
                  className={`px-6 py-2 rounded-lg border ${config.cardType === type ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-800 border-slate-700'}`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4">Security & Features</h3>
            <div className="grid grid-cols-1 gap-3">
              {AVAILABLE_FEATURES.map(feature => {
                const Icon = feature.icon;
                const isSelected = config.features.includes(feature.id);
                return (
                  <button
                    key={feature.id}
                    onClick={() => toggleFeature(feature.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${isSelected ? 'bg-slate-800 border-emerald-500' : 'bg-slate-900 border-slate-800'}`}
                  >
                    <Icon className={isSelected ? 'text-emerald-400' : 'text-slate-500'} />
                    <span>{feature.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Download className="w-5 h-5" /> Provision Card Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardCustomizationView;

// --- CONSOLIDATED FROM: CardCustomizationView_1.tsx ---

// components/views/personal/CardCustomizationView.tsx
import React, { useState } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import Card from '../../Card';

const CardCustomizationView: React.FC = () => {
    const [baseImage, setBaseImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('Add a phoenix rising from the center, with its wings made of glowing data streams.');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [cardStory, setCardStory] = useState('');
    const [isStoryLoading, setIsStoryLoading] = useState(false);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string));
            reader.onerror = error => reject(error);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            setBaseImage(base64);
            setGeneratedImage(null);
        }
    };

    const handleGenerate = async () => {
        if (!baseImage || !prompt) return;
        setIsLoading(true); setError(''); setGeneratedImage(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const base64Data = baseImage.split(',')[1];
            const mimeType = baseImage.match(/:(.*?);/)?.[1] || 'image/jpeg';
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts: [{ inlineData: { data: base64Data, mimeType: mimeType } }, { text: prompt }] },
                config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
            });

            const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
            if (imagePart?.inlineData) {
                setGeneratedImage(`data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`);
            } else { setError("The AI didn't return an image. Try a different prompt."); }
        } catch (err) {
            setError("Sorry, I couldn't edit the image. Please try again.");
        } finally { setIsLoading(false); }
    };

     const generateCardStory = async () => {
        setIsStoryLoading(true); setCardStory('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const storyPrompt = `Based on this generative AI prompt for a credit card design, write a short, inspiring "Card Story" (2-3 sentences) about what this card represents. Prompt: "${prompt}"`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: storyPrompt });
            setCardStory(response.text);
        } catch (err) {
            setCardStory("Could not generate a story for this design.");
        } finally { setIsStoryLoading(false); }
    };

    const displayImage = generatedImage || baseImage;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Card Customization Forge</h2>
             <Card title="Design Your Card">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div>
                         <p className="text-gray-400 mb-4">1. Upload a base image.</p>
                         <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-600/50 file:text-cyan-200 hover:file:bg-cyan-600"/>
                         <p className="text-gray-400 my-4">2. Describe your changes with AI.</p>
                         <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., Make this image look like a watercolor painting" className="w-full h-24 bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" disabled={isLoading || !baseImage}/>
                         <button onClick={handleGenerate} disabled={isLoading || !baseImage || !prompt} className="mt-4 w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50">{isLoading ? 'Generating...' : 'Generate Image'}</button>
                         {error && <p className="text-red-400 text-center mt-2">{error}</p>}
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="text-gray-400 mb-2">Card Preview</p>
                        <div className="w-full max-w-sm aspect-[85.6/54] rounded-xl bg-gray-900/50 overflow-hidden shadow-2xl border border-gray-600 flex items-center justify-center">
                            {isLoading && <div className="text-cyan-300">Generating...</div>}
                            {!isLoading && displayImage && <img src={displayImage} alt="Card Preview" className="w-full h-full object-cover"/>}
                            {!isLoading && !displayImage && <div className="text-gray-500">Upload an image to start</div>}
                        </div>
                    </div>
                </div>
            </Card>
             <Card title="AI-Generated Card Story">
                {isStoryLoading ? <p>Generating story...</p> : cardStory ? <p className="text-gray-300 italic">"{cardStory}"</p> : <p className="text-gray-400">Generate a story for your unique card design.</p>}
                 <button onClick={generateCardStory} disabled={isStoryLoading || !displayImage} className="mt-4 px-4 py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg text-sm disabled:opacity-50">{isStoryLoading ? 'Writing...' : 'Generate Story'}</button>
             </Card>
        </div>
    );
};

export default CardCustomizationView;


// --- CONSOLIDATED FROM: ./views/personal/CardCustomizationView.tsx ---

// components/views/personal/CardCustomizationView.tsx
import React, { useState } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import Card from '../../Card';

const CardCustomizationView: React.FC = () => {
    const [baseImage, setBaseImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('Add a phoenix rising from the center, with its wings made of glowing data streams.');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [cardStory, setCardStory] = useState('');
    const [isStoryLoading, setIsStoryLoading] = useState(false);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string));
            reader.onerror = error => reject(error);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            setBaseImage(base64);
            setGeneratedImage(null);
        }
    };

    const handleGenerate = async () => {
        if (!baseImage || !prompt) return;
        setIsLoading(true); setError(''); setGeneratedImage(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const base64Data = baseImage.split(',')[1];
            const mimeType = baseImage.match(/:(.*?);/)?.[1] || 'image/jpeg';
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts: [{ inlineData: { data: base64Data, mimeType: mimeType } }, { text: prompt }] },
                config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
            });

            const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
            if (imagePart?.inlineData) {
                setGeneratedImage(`data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`);
            } else { setError("The AI didn't return an image. Try a different prompt."); }
        } catch (err) {
            setError("Sorry, I couldn't edit the image. Please try again.");
        } finally { setIsLoading(false); }
    };

     const generateCardStory = async () => {
        setIsStoryLoading(true); setCardStory('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const storyPrompt = `Based on this generative AI prompt for a credit card design, write a short, inspiring "Card Story" (2-3 sentences) about what this card represents. Prompt: "${prompt}"`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: storyPrompt });
            setCardStory(response.text);
        } catch (err) {
            setCardStory("Could not generate a story for this design.");
        } finally { setIsStoryLoading(false); }
    };

    const displayImage = generatedImage || baseImage;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Card Customization Forge</h2>
             <Card title="Design Your Card">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div>
                         <p className="text-gray-400 mb-4">1. Upload a base image.</p>
                         <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-600/50 file:text-cyan-200 hover:file:bg-cyan-600"/>
                         <p className="text-gray-400 my-4">2. Describe your changes with AI.</p>
                         <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., Make this image look like a watercolor painting" className="w-full h-24 bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" disabled={isLoading || !baseImage}/>
                         <button onClick={handleGenerate} disabled={isLoading || !baseImage || !prompt} className="mt-4 w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50">{isLoading ? 'Generating...' : 'Generate Image'}</button>
                         {error && <p className="text-red-400 text-center mt-2">{error}</p>}
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="text-gray-400 mb-2">Card Preview</p>
                        <div className="w-full max-w-sm aspect-[85.6/54] rounded-xl bg-gray-900/50 overflow-hidden shadow-2xl border border-gray-600 flex items-center justify-center">
                            {isLoading && <div className="text-cyan-300">Generating...</div>}
                            {!isLoading && displayImage && <img src={displayImage} alt="Card Preview" className="w-full h-full object-cover"/>}
                            {!isLoading && !displayImage && <div className="text-gray-500">Upload an image to start</div>}
                        </div>
                    </div>
                </div>
            </Card>
             <Card title="AI-Generated Card Story">
                {isStoryLoading ? <p>Generating story...</p> : cardStory ? <p className="text-gray-300 italic">"{cardStory}"</p> : <p className="text-gray-400">Generate a story for your unique card design.</p>}
                 <button onClick={generateCardStory} disabled={isStoryLoading || !displayImage} className="mt-4 px-4 py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg text-sm disabled:opacity-50">{isStoryLoading ? 'Writing...' : 'Generate Story'}</button>
             </Card>
        </div>
    );
};

export default CardCustomizationView;


// --- CONSOLIDATED FROM: ./components/views/personal/CardCustomizationView.tsx ---

// components/views/personal/CardCustomizationView.tsx
import React, { useState } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import Card from '../../Card';

const CardCustomizationView: React.FC = () => {
    const [baseImage, setBaseImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('Add a phoenix rising from the center, with its wings made of glowing data streams.');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [cardStory, setCardStory] = useState('');
    const [isStoryLoading, setIsStoryLoading] = useState(false);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string));
            reader.onerror = error => reject(error);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            setBaseImage(base64);
            setGeneratedImage(null);
        }
    };

    const handleGenerate = async () => {
        if (!baseImage || !prompt) return;
        setIsLoading(true); setError(''); setGeneratedImage(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const base64Data = baseImage.split(',')[1];
            const mimeType = baseImage.match(/:(.*?);/)?.[1] || 'image/jpeg';
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts: [{ inlineData: { data: base64Data, mimeType: mimeType } }, { text: prompt }] },
                config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
            });

            const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
            if (imagePart?.inlineData) {
                setGeneratedImage(`data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`);
            } else { setError("The AI didn't return an image. Try a different prompt."); }
        } catch (err) {
            setError("Sorry, I couldn't edit the image. Please try again.");
        } finally { setIsLoading(false); }
    };

     const generateCardStory = async () => {
        setIsStoryLoading(true); setCardStory('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const storyPrompt = `Based on this generative AI prompt for a credit card design, write a short, inspiring "Card Story" (2-3 sentences) about what this card represents. Prompt: "${prompt}"`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: storyPrompt });
            setCardStory(response.text);
        } catch (err) {
            setCardStory("Could not generate a story for this design.");
        } finally { setIsStoryLoading(false); }
    };

    const displayImage = generatedImage || baseImage;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Card Customization Forge</h2>
             <Card title="Design Your Card">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div>
                         <p className="text-gray-400 mb-4">1. Upload a base image.</p>
                         <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-600/50 file:text-cyan-200 hover:file:bg-cyan-600"/>
                         <p className="text-gray-400 my-4">2. Describe your changes with AI.</p>
                         <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., Make this image look like a watercolor painting" className="w-full h-24 bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" disabled={isLoading || !baseImage}/>
                         <button onClick={handleGenerate} disabled={isLoading || !baseImage || !prompt} className="mt-4 w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50">{isLoading ? 'Generating...' : 'Generate Image'}</button>
                         {error && <p className="text-red-400 text-center mt-2">{error}</p>}
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="text-gray-400 mb-2">Card Preview</p>
                        <div className="w-full max-w-sm aspect-[85.6/54] rounded-xl bg-gray-900/50 overflow-hidden shadow-2xl border border-gray-600 flex items-center justify-center">
                            {isLoading && <div className="text-cyan-300">Generating...</div>}
                            {!isLoading && displayImage && <img src={displayImage} alt="Card Preview" className="w-full h-full object-cover"/>}
                            {!isLoading && !displayImage && <div className="text-gray-500">Upload an image to start</div>}
                        </div>
                    </div>
                </div>
            </Card>
             <Card title="AI-Generated Card Story">
                {isStoryLoading ? <p>Generating story...</p> : cardStory ? <p className="text-gray-300 italic">"{cardStory}"</p> : <p className="text-gray-400">Generate a story for your unique card design.</p>}
                 <button onClick={generateCardStory} disabled={isStoryLoading || !displayImage} className="mt-4 px-4 py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg text-sm disabled:opacity-50">{isStoryLoading ? 'Writing...' : 'Generate Story'}</button>
             </Card>
        </div>
    );
};

export default CardCustomizationView;
