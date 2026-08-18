/*
This file has been completely reimplemented to serve as a Gemini API Playground.
It demonstrates various features of the Google Gemini API based on the provided documentation,
including content generation, system instructions, configuration, multimodal input, streaming, and chat.
*/
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Sparkles, Bot, User, Settings, Image as ImageIcon, Send, Loader2, CornerDownLeft, FileUp } from 'lucide-react';

// --- TYPE DEFINITIONS ---

type Role = 'user' | 'model';

interface ChatMessage {
  role: Role;
  text: string;
}

type DemoTab = 'generate' | 'chat' | 'multimodal';

// --- MOCK API SIMULATION ---

const mockResponses = {
  "How does AI work?": "Artificial intelligence (AI) is a broad field of computer science that deals with the creation of intelligent agents, which are systems that can reason, learn, and act autonomously. At its core, AI involves developing algorithms and statistical models that enable computers to perform tasks that typically require human intelligence, such as understanding natural language, recognizing patterns, and making decisions.",
  "Hello there": "Hello! I am a large language model, trained by Google. How can I help you today?",
  "I have 2 dogs in my house.": "That sounds lovely! Dogs can be wonderful companions.",
  "How many paws are in my house?": "Since you have 2 dogs, and each dog has 4 paws, there would be a total of 8 paws in your house!",
  "Tell me about this instrument": "This appears to be a pipe organ, a magnificent musical instrument that produces sound by driving pressurized air through pipes. It's often found in churches and concert halls and is known for its vast tonal range and complexity. The keyboard, pedals, and stops allow a musician to control a huge variety of sounds."
};

const streamResponse = async (text: string, callback: (chunk: string) => void) => {
  const words = text.split(' ');
  for (let i = 0; i < words.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 50));
    callback(words.slice(0, i + 1).join(' '));
  }
};

// --- UI SUB-COMPONENTS ---

const ConfigPanel: React.FC<{
  systemInstruction: string;
  setSystemInstruction: (val: string) => void;
  temperature: number;
  setTemperature: (val: number) => void;
  thinkingEnabled: boolean;
  setThinkingEnabled: (val: boolean) => void;
}> = ({ systemInstruction, setSystemInstruction, temperature, setTemperature, thinkingEnabled, setThinkingEnabled }) => (
  <Card className="bg-gray-800/50 border-gray-700">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg"><Settings className="w-5 h-5 text-cyan-400" />Configuration</CardTitle>
      <CardDescription>Guide the model's behavior and output.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-300">System Instruction</label>
        <Textarea
          placeholder="You are a cat. Your name is Neko."
          className="mt-2"
          value={systemInstruction}
          onChange={(e) => setSystemInstruction(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-300">Temperature: {temperature.toFixed(1)}</label>
        <Slider
          defaultValue={[temperature]}
          max={1}
          step={0.1}
          onValueChange={(value) => setTemperature(value[0])}
          className="mt-2"
        />
        <p className="text-xs text-gray-500 mt-1">Lower values for less random, more deterministic responses.</p>
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">Enable Thinking (2.5 Pro/Flash)</label>
        <Switch checked={thinkingEnabled} onCheckedChange={setThinkingEnabled} />
      </div>
    </CardContent>
  </Card>
);

const ResponseDisplay: React.FC<{ response: string; isLoading: boolean; title?: string }> = ({ response, isLoading, title = "Model Response" }) => (
  <Card className="h-full bg-gray-800/50 border-gray-700">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg"><Bot className="w-5 h-5 text-cyan-400" />{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Generating response...</span>
        </div>
      ) : (
        <p className="text-gray-200 whitespace-pre-wrap">{response || <span className="text-gray-500">The model's response will appear here.</span>}</p>
      )}
    </CardContent>
  </Card>
);

const ChatInterface: React.FC = () => {
  const [history, setHistory] = useState<ChatMessage[]>([
    { role: 'model', text: "Great to meet you. What would you like to know?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const newHistory: ChatMessage[] = [...history, { role: 'user', text: input }];
    setHistory(newHistory);
    setInput('');
    setIsLoading(true);

    const mockRes = mockResponses[input as keyof typeof mockResponses] || "I'm not sure how to respond to that, but I'm ready to help with other questions!";
    
    // Simulate streaming response
    let streamedText = '';
    await streamResponse(mockRes, (chunk) => {
      streamedText = chunk;
      setHistory([...newHistory, { role: 'model', text: streamedText + '...' }]);
    });

    setHistory([...newHistory, { role: 'model', text: mockRes }]);
    setIsLoading(false);
  };

  return (
    <Card className="h-full flex flex-col bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="w-5 h-5 text-cyan-400" />Multi-turn Chat</CardTitle>
        <CardDescription>Converse with the model, which remembers previous turns.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-4 pr-6">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-cyan-400" /></div>}
            <div className={`p-3 rounded-lg max-w-[80%] ${msg.role === 'model' ? 'bg-gray-700/50 text-gray-200' : 'bg-blue-600 text-white'}`}>
              {msg.text}
            </div>
            {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-gray-200" /></div>}
          </div>
        ))}
        {isLoading && (
           <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-cyan-400" /></div>
             <div className="p-3 rounded-lg bg-gray-700/50 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-gray-400">...</span>
             </div>
           </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="relative w-full">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
            className="pr-12"
          />
          <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={handleSendMessage} disabled={isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const MultimodalInterface: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleGenerate = async () => {
        if (!image) {
            alert("Please upload an image first.");
            return;
        }
        setIsLoading(true);
        setResponse('');
        const mockRes = mockResponses["Tell me about this instrument"];
        await streamResponse(mockRes, (chunk) => setResponse(chunk));
        setIsLoading(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><ImageIcon className="w-5 h-5 text-cyan-400" />Multimodal Input</CardTitle>
                    <CardDescription>Combine text and media files in your prompts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="aspect-video bg-gray-900/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700">
                        {image ? (
                            <img src={image} alt="upload preview" className="max-h-full max-w-full object-contain rounded-md" />
                        ) : (
                            <div className="text-center text-gray-500">
                                <FileUp className="w-10 h-10 mx-auto" />
                                <p>Upload an image to get started</p>
                            </div>
                        )}
                    </div>
                    <Input type="file" accept="image/*" onChange={handleImageUpload} />
                    <Textarea placeholder="e.g., Tell me about this instrument" value={prompt} onChange={e => setPrompt(e.target.value)} />
                </CardContent>
                <CardFooter>
                    <Button variant="premium" onClick={handleGenerate} disabled={isLoading || !image}>
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Generate Description
                    </Button>
                </CardFooter>
            </Card>
            <ResponseDisplay response={response} isLoading={isLoading} title="Image Analysis" />
        </div>
    );
};


// --- MAIN VIEW COMPONENT ---

const GeminiAPIDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DemoTab>('generate');
  
  // State for "Generate Content" tab
  const [prompt, setPrompt] = useState('How does AI work?');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);

  // State for Config
  const [systemInstruction, setSystemInstruction] = useState('');
  const [temperature, setTemperature] = useState(0.9);
  const [thinkingEnabled, setThinkingEnabled] = useState(true);

  const handleGenerateContent = useCallback(async () => {
    setIsLoading(true);
    setResponse('');
    
    let mockResKey = prompt as keyof typeof mockResponses;
    if (systemInstruction.toLowerCase().includes("cat")) {
        mockResKey = "Hello there"; // Use a different response for the cat persona
    }
    
    let mockRes = mockResponses[mockResKey] || "I'm sorry, I don't have a pre-canned response for that. But I am a powerful AI model!";
    
    if (systemInstruction.toLowerCase().includes("cat")) {
        mockRes = "Meow! I'm Neko, the cat. I prefer to talk about naps and chasing laser pointers. Purrrr."
    }

    if (isStreaming) {
      await streamResponse(mockRes, (chunk) => setResponse(chunk));
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResponse(mockRes);
    }
    
    setIsLoading(false);
  }, [prompt, isStreaming, systemInstruction]);

  const renderContent = () => {
    switch (activeTab) {
      case 'generate':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <ConfigPanel 
                systemInstruction={systemInstruction}
                setSystemInstruction={setSystemInstruction}
                temperature={temperature}
                setTemperature={setTemperature}
                thinkingEnabled={thinkingEnabled}
                setThinkingEnabled={setThinkingEnabled}
              />
            </div>
            <div className="lg:col-span-2 space-y-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><CornerDownLeft className="w-5 h-5 text-cyan-400" />Generate Content</CardTitle>
                  <CardDescription>Provide a prompt and see what the model generates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={5}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Switch id="streaming-mode" checked={isStreaming} onCheckedChange={setIsStreaming} />
                        <label htmlFor="streaming-mode" className="text-sm font-medium text-gray-300">Stream Response</label>
                    </div>
                    <Button variant="premium" onClick={handleGenerateContent} disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Generate
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <ResponseDisplay response={response} isLoading={isLoading} />
            </div>
          </div>
        );
      case 'chat':
        return <ChatInterface />;
      case 'multimodal':
        return <MultimodalInterface />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-white">Gemini API Playground</h1>
        <p className="text-gray-400 mt-1">Explore the capabilities of Google's Gemini models interactively.</p>
      </header>

      <div className="flex space-x-2 border-b border-gray-700">
        {(['generate', 'chat', 'multimodal'] as DemoTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-cyan-400 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default GeminiAPIDashboard;