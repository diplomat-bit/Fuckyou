import React, { useState, useCallback, useRef, useContext } from 'react';
import { View } from '../types';
import { brain } from '../services/SovereignIntelligence';
import { Mic, Zap, Loader2, Sparkles, X, Volume2, VolumeX, MessageSquare, Command } from 'lucide-react';
import { DataContext } from '../context/DataContext';

interface VoiceControlProps {
    setActiveView: (view: View) => void;
}

const VoiceControl: React.FC<VoiceControlProps> = ({ setActiveView }) => {
    const context = useContext(DataContext);
    const sessionId = context?.sessionId;
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [speechEnabled, setSpeechEnabled] = useState(true);
    const [showTextInput, setShowTextInput] = useState(false);
    const [manualCommand, setManualCommand] = useState('');
    const recognitionRef = useRef<any>(null);

    const speakResponse = useCallback((text: string) => {
        if (!speechEnabled || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 0.9;
        window.speechSynthesis.speak(utterance);
    }, [speechEnabled]);

    const processTranscript = async (text: string) => {
        if (!text.trim()) return;
        
        setIsProcessing(true);
        setFeedback("Parsing Directive...");
        
        try {
            const result = await brain.interpretVoiceCommand(text, sessionId);
            setFeedback(result.message);
            speakResponse(result.message);
            
            if (result.view) {
                setTimeout(() => {
                    setActiveView(result.view as View);
                    setFeedback("");
                }, 1000);
            } else {
                setTimeout(() => setFeedback(""), 4000);
            }
        } catch (e) {
            const errMsg = "Command failed to execute.";
            setFeedback(errMsg);
            speakResponse(errMsg);
            setTimeout(() => setFeedback(""), 2500);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualCommand.trim()) {
            processTranscript(manualCommand);
            setManualCommand('');
            setShowTextInput(false);
        }
    };

    const toggleListening = useCallback(() => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setFeedback("Speech Recognition Engine Unavailable");
            setShowTextInput(true);
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;
            
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
                setFeedback("Listening for Sovereign Directive...");
            };

            recognition.onresult = (event: any) => {
                const result = event.results[0][0];
                if (result.confidence < 0.35) {
                    setFeedback("Signal Unclear. Please Repeat.");
                    return;
                }
                processTranscript(result.transcript);
            };

            recognition.onerror = (event: any) => {
                if (event.error === 'no-speech') {
                    setFeedback("No speech detected.");
                } else if (event.error === 'not-allowed') {
                    setFeedback("Microphone access denied.");
                    setShowTextInput(true);
                } else {
                    setFeedback("Vocal signal lost.");
                }
                setIsListening(false);
            };

            recognition.onend = () => setIsListening(false);
            recognition.start();
        } catch (err) {
            setFeedback("Error initializing microphone.");
            setIsListening(false);
        }
    }, [isListening]);

    return (
        <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-4 font-mono">
            {/* Command Feedback Overlay */}
            {feedback && (
                <div className="bg-black/90 border border-cyan-500/40 px-6 py-3.5 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.35)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 flex items-center gap-3 max-w-md">
                    {isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin text-cyan-400 shrink-0" />
                    ) : (
                        <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                    )}
                    <span className="text-[11px] font-bold text-cyan-50 tracking-[0.12em] uppercase leading-tight">
                        {feedback}
                    </span>
                    {!isProcessing && (
                        <button onClick={() => setFeedback("")} className="ml-2 text-gray-500 hover:text-white transition-colors shrink-0">
                            <X size={14}/>
                        </button>
                    )}
                </div>
            )}

            {/* Direct Command Text Fallback Modal */}
            {showTextInput && (
                <form 
                    onSubmit={handleManualSubmit}
                    className="bg-black/90 border border-cyan-500/50 p-3 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.4)] backdrop-blur-xl flex items-center gap-2 animate-in fade-in zoom-in-95"
                >
                    <Command size={16} className="text-cyan-400 ml-2" />
                    <input
                        type="text"
                        value={manualCommand}
                        onChange={(e) => setManualCommand(e.target.value)}
                        placeholder="Type directive (e.g. 'Open Dashboard')..."
                        className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none px-2 py-1 w-64 border-b border-cyan-500/30 focus:border-cyan-400"
                        autoFocus
                    />
                    <button 
                        type="submit"
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-black text-[10px] font-black uppercase rounded-lg transition-all"
                    >
                        Exec
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setShowTextInput(false)}
                        className="text-gray-500 hover:text-white p-1"
                    >
                        <X size={14} />
                    </button>
                </form>
            )}

            {/* Action Bar */}
            <div className="flex items-center gap-3">
                {/* Audio Toggle */}
                <button
                    onClick={() => setSpeechEnabled(!speechEnabled)}
                    className="p-3 bg-black/80 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-105"
                    title={speechEnabled ? "Voice Feedback Enabled" : "Voice Feedback Muted"}
                >
                    {speechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-gray-500" />}
                </button>

                {/* Text Directive Launcher */}
                <button
                    onClick={() => setShowTextInput(!showTextInput)}
                    className="p-3 bg-black/80 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-105"
                    title="Type Directive"
                >
                    <MessageSquare size={16} />
                </button>

                {/* Primary Voice Mic Button */}
                <button 
                    onClick={toggleListening}
                    disabled={isProcessing}
                    className={`relative group p-6 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 disabled:opacity-50 ${
                        isListening 
                            ? 'bg-rose-600 shadow-rose-500/50 ring-4 ring-rose-500/30' 
                            : 'bg-cyan-600 shadow-cyan-500/40 hover:bg-cyan-500'
                    }`}
                >
                    {/* Orbital Pulse Rings */}
                    <div className={`absolute inset-0 rounded-full border-2 border-white/20 ${isListening ? 'animate-ping' : ''}`} />
                    <div className={`absolute inset-[-8px] rounded-full border border-cyan-400/20 transition-opacity ${isListening ? 'opacity-100 animate-spin-slow' : 'opacity-0'}`} />
                    
                    <div className="relative z-10 text-white">
                        {isListening ? <Zap className="w-8 h-8 animate-pulse text-amber-200" /> : <Mic className="w-8 h-8" />}
                    </div>

                    {/* Status Tooltip */}
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-black/90 border border-cyan-500/30 text-cyan-400 text-[9px] font-black uppercase tracking-[0.3em] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none backdrop-blur-md shadow-xl">
                        {isListening ? 'Listening...' : 'Sovereign Voice Command'}
                    </div>
                </button>
            </div>

            <style>{`
                .animate-spin-slow { animation: spin 8s infinite linear; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default VoiceControl;