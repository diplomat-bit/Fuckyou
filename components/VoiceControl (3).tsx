import React, { useState, useEffect, useRef, useCallback, useContext, useMemo } from 'react';
import { View, Transaction, UserProfile, KPI } from '../types';
import { DataContext } from '../context/DataContext';

// --- Refactoring Notes ---
// Original AI Integration Simulation Constants were removed as they represented deliberate flaws.
// The entire `interpretCommandWithAI` function has been replaced with a placeholder for a robust AI command processor.
// Utility functions like `normalizeString` and `formatForTTS` were removed as they contributed to the "flawed" nature of the AI.
// The "VoiceModal" and "VoiceControl" components have been significantly refactored to prepare for a stable AI integration.
// Temporary placeholder logic for AI interpretation is included, which will be replaced by actual API calls.

// --- Constants ---
const AI_API_ENDPOINT = '/api/ai/voice-command'; // Placeholder for actual API endpoint
const MAX_COMMAND_PROCESSING_TIME_MS = 5000; // Timeout for AI processing

// --- AI Command Processing Core (Placeholder) ---
interface CommandResult {
    action: 'navigate' | 'transaction' | 'query' | 'error' | 'noop';
    message: string;
    targetView?: View;
    transactionData?: Partial<Transaction>;
}

/**
 * Processes user commands via a stable AI service.
 * This function will be replaced with actual API calls to a reliable AI model.
 * @param command The user's transcribed utterance.
 * @param context Current application state context.
 * @returns A structured result object detailing the required action.
 */
const interpretCommandWithAI = async (command: string, context: { dataContext: typeof DataContext extends React.Context<any> ? React.ContextType<typeof DataContext> : any; setActiveView: (view: View) => void }): Promise<CommandResult> => {
    // TODO: Replace this placeholder with actual API integration.
    // This includes:
    // 1. Network request to AI_API_ENDPOINT with the command.
    // 2. Error handling for network issues, API errors, and timeouts.
    // 3. Parsing the structured response from the AI.
    // 4. Implementing robust logic based on the AI's interpreted intent.

    console.log(`Simulating AI interpretation for: "${command}"`);

    const fakeResponse: CommandResult = {
        action: 'error',
        message: "AI interpretation is not yet implemented. This is a placeholder.",
    };

    // Simulate network latency and processing
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    // Example of how a *real* interpretation might look after API call
    const upperCommand = command.toUpperCase();
    if (upperCommand.includes('GO TO DASHBOARD')) {
        return { action: 'navigate', message: "Navigating to Dashboard.", targetView: View.Dashboard };
    } else if (upperCommand.includes('SHOW TRANSACTIONS')) {
        return { action: 'query', message: "Fetching recent transactions..." };
    } else if (upperCommand.includes('PAYMENT')) {
        return { action: 'transaction', message: "Processing payment..." };
    } else if (upperCommand.includes('SYSTEM HEALTH')) {
        return { action: 'query', message: "Checking system health..." };
    } else {
        return { action: 'error', message: "AI could not reliably understand the command. Please try again." };
    }

    // Fallback to the fake response if no specific simulation matches
    return fakeResponse;
};


// --- UI Components ---

const MicIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-8 w-8"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const LoadingSpinner = ({ colorClass = "text-blue-400" }: { colorClass?: string }) => (
    <svg className={`animate-spin h-8 w-8 ${colorClass}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M12 0a12 12 0 100 24 12 12 0 000-24zm0 19a7 7 0 110-14 7 7 0 010 14z"></path>
    </svg>
);

interface VoiceModalProps {
    onClose: () => void;
    voiceState: VoiceState;
    transcript: string;
    aiResponse: string;
    processUtterance: (utterance: string) => void;
    isListening: boolean;
}

const VoiceModal: React.FC<VoiceModalProps> = ({ onClose, voiceState, transcript, aiResponse, processUtterance, isListening }) => {
    const commands = useMemo(() => [
        "Go to Dashboard",
        "Show recent transactions",
        "What is the system health?",
        "Initiate payment process",
        "Access user profile"
    ], []);

    const stateText: { [key in VoiceState]: string } = {
        idle: 'Listening...',
        listening: 'Listening...',
        processing: 'Processing Command...',
        speaking: 'Responding...',
        error: 'Error Occurred'
    };

    const isProcessingOrSpeaking = voiceState === 'processing' || voiceState === 'speaking';

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[1000] backdrop-blur-sm transition-all duration-300 scale-100" onClick={onClose}>
            <div className="bg-gray-950 rounded-xl p-8 max-w-lg w-full text-center shadow-lg border border-gray-700 transition-all duration-300 scale-100 hover:scale-[1.02]" onClick={e => e.stopPropagation()}>
                
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <h2 className="text-lg font-bold text-blue-400">Voice Control Interface</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-3xl leading-none">&times;</button>
                </div>

                <div className="relative w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-8 transition-all duration-500"
                     style={{ 
                         backgroundColor: isProcessingOrSpeaking ? 'rgba(59, 130, 246, 0.2)' : 'rgba(55, 65, 81, 0.3)',
                         boxShadow: isProcessingOrSpeaking ? '0 0 40px rgba(59, 130, 246, 0.5)' : 'none'
                     }}>
                    {isProcessingOrSpeaking && (
                        <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping-slow"></div>
                    )}
                    {voiceState === 'listening' && (
                        <div className="absolute inset-0 rounded-full bg-green-500/40 animate-pulse-fast"></div>
                    )}
                    {voiceState === 'error' ? (
                        <svg className="h-16 w-16 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.938 3.622c-.77-1.333-2.684-1.333-3.454 0L3.32 18.37c-.77 1.333.192 3 1.732 3z" /></svg>
                    ) : isProcessingOrSpeaking ? (
                        <LoadingSpinner colorClass={voiceState === 'speaking' ? 'text-blue-500' : 'text-blue-400'} />
                    ) : (
                        <MicIcon className="h-16 w-10 text-gray-300" />
                    )}
                </div>

                <h3 className={`text-3xl font-bold mb-3 transition-colors ${voiceState === 'error' ? 'text-red-500' : 'text-gray-200'}`}>{stateText[voiceState]}</h3>
                
                <div className="min-h-[3rem] mb-4 p-3 bg-gray-800/70 rounded-lg border border-gray-700/50">
                    <p className={`text-base italic transition-opacity ${transcript ? 'text-blue-300' : 'text-gray-500'}`}>
                        {transcript || (voiceState === 'idle' ? 'Say something...' : ' ')}
                    </p>
                </div>

                <div className={`h-16 text-center flex items-center justify-center mb-8 p-3 rounded-lg transition-all duration-500 ${aiResponse.includes('Error') || aiResponse.includes('placeholder') ? 'bg-red-900/50 border border-red-600' : 'bg-gray-800/50 border border-gray-700'}`}>
                    <p className={`text-lg font-mono ${aiResponse.includes('Error') ? 'text-yellow-300' : 'text-blue-200'}`}>{aiResponse}</p>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto p-1 custom-scrollbar">
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">Suggested Commands:</p>
                    {commands.map(cmd => (
                        <button 
                            key={cmd} 
                            onClick={() => !isProcessingOrSpeaking && processUtterance(cmd)} 
                            disabled={isProcessingOrSpeaking}
                            className={`w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-all duration-200 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-between items-center`}
                        >
                            <span className="truncate">{cmd}</span>
                            {!isProcessingOrSpeaking && <span className="text-xs text-blue-400 ml-4">Execute</span>}
                        </button>
                    ))}
                </div>
            </div>
            <style jsx global>{`
                @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                
                @keyframes ping-slow { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.2); opacity: 0.1; } }
                .animate-ping-slow { animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite; }

                @keyframes pulse-fast { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
                .animate-pulse-fast { animation: pulse-fast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #1f2937; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563eb; }
            `}</style>
        </div>
    );
};

// --- Main Voice Control Component ---

interface VoiceControlProps {
    setActiveView: (view: View) => void;
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

const VoiceControl: React.FC<VoiceControlProps> = ({ setActiveView }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [voiceState, setVoiceState] = useState<VoiceState>('idle');
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('Initializing Voice Control...');
    
    const recognitionRef = useRef<any>(null);
    const dataContext = useContext(DataContext);
    const isMounted = useRef(false);
    const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const interpretationContext = useMemo(() => ({ dataContext, setActiveView }), [dataContext, setActiveView]);

    const startListening = useCallback(() => {
        if (!recognitionRef.current) return;

        if (voiceState === 'listening') return; // Already listening

        setTranscript('');
        setVoiceState('listening');
        try {
            recognitionRef.current.start();
        } catch (error) {
            console.warn("Speech recognition start attempt ignored (already active or stopped).", error);
            if (isMounted.current && voiceState !== 'error') {
                setVoiceState('idle');
            }
        }
    }, [voiceState]);
    
    const speak = useCallback((text: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (!isMounted.current) {
                reject(new Error("Component unmounted during speech synthesis."));
                return;
            }
            setVoiceState('speaking');
            setAiResponse(text);
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.1; // Slightly faster speech
            utterance.pitch = 1.0;
            utterance.volume = 0.7;
            
            utterance.onend = () => {
                if(isMounted.current) {
                    resolve();
                }
            };
            utterance.onerror = (e) => {
                if(isMounted.current) {
                     console.error("Speech Synthesis Error:", e);
                     setVoiceState('error');
                     setAiResponse("TTS Engine Failure. Cannot articulate response.");
                }
                reject(e);
            };
            window.speechSynthesis.speak(utterance);
        });
    }, []);

    const processUtterance = useCallback(async (command: string) => {
        if (!isMounted.current) return;
        
        setTranscript(command);
        setVoiceState('processing');

        // Clear any previous timeout
        if (processingTimeoutRef.current) {
            clearTimeout(processingTimeoutRef.current);
        }
        
        // Set a timeout for AI processing
        processingTimeoutRef.current = setTimeout(() => {
            if (voiceState === 'processing') {
                console.error("AI command processing timed out.");
                setVoiceState('error');
                setAiResponse("AI processing timed out. Please try again.");
            }
        }, MAX_COMMAND_PROCESSING_TIME_MS);

        try {
            const result = await interpretCommandWithAI(command, interpretationContext);

            // Clear timeout if processing completes before timeout
            if (processingTimeoutRef.current) {
                clearTimeout(processingTimeoutRef.current);
                processingTimeoutRef.current = null;
            }

            await speak(result.message);

            if (result.action === 'navigate' && result.targetView) {
                setActiveView(result.targetView);
                await new Promise(resolve => setTimeout(resolve, 500)); 
                setIsModalOpen(false);
            } else if (result.action === 'transaction') {
                await new Promise(resolve => setTimeout(resolve, 500)); 
                setIsModalOpen(false);
            } else if (result.action === 'query') {
                if (isMounted.current) setVoiceState('idle');
            } else if (result.action === 'error') {
                if (isMounted.current) {
                    setVoiceState('error');
                    // Do not auto-restart listening on error, let user decide
                }
            }
        } catch (error) {
             if (processingTimeoutRef.current) {
                clearTimeout(processingTimeoutRef.current);
                processingTimeoutRef.current = null;
            }
            console.error("Error processing utterance:", error);
            if (isMounted.current) {
                setVoiceState('error');
                setAiResponse(`An unexpected error occurred: ${error.message}`);
            }
        }

    }, [interpretationContext, speak, setActiveView, voiceState]);

    useEffect(() => {
        isMounted.current = true;
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            setAiResponse("Browser Incompatibility: Voice control requires Web Speech API support.");
            setVoiceState('error');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const result = event.results[i][0];
                if (result.isFinal) {
                    finalTranscript += result.transcript;
                } else {
                    interimTranscript += result.transcript;
                }
            }
            
            if (interimTranscript && !finalTranscript) {
                setTranscript(interimTranscript);
            }

            if (finalTranscript) {
                recognition.stop();
                processUtterance(finalTranscript.trim());
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (isMounted.current) {
                setVoiceState('error');
                setAiResponse(`Recognition Error (${event.error}).`);
            }
        };
        
        recognition.onstart = () => {
             if (isMounted.current) setVoiceState('listening');
        }

        recognition.onend = () => {
            if (isMounted.current && voiceState === 'listening') {
                 setVoiceState('idle');
            }
        };
        
        recognitionRef.current = recognition;
        
        return () => {
            isMounted.current = false;
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            window.speechSynthesis.cancel();
            if (processingTimeoutRef.current) {
                clearTimeout(processingTimeoutRef.current);
            }
        }
    }, [processUtterance, voiceState]);

    const openModal = () => {
        if (voiceState === 'error') {
            setAiResponse('Voice control is in an error state. Cannot proceed.');
            return;
        }
        setAiResponse('Initializing Voice Control...');
        setIsModalOpen(true);
        setVoiceState('idle');
        setTimeout(() => {
            if (isMounted.current) startListening();
        }, 500);
    }
    
    const closeModal = () => {
        setIsModalOpen(false);
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        window.speechSynthesis.cancel();
        if (isMounted.current) {
            setVoiceState('idle');
            if (processingTimeoutRef.current) {
                clearTimeout(processingTimeoutRef.current);
                processingTimeoutRef.current = null;
            }
        }
    }

    return (
        <>
            <button
                onClick={openModal}
                className="fixed bottom-10 right-10 w-20 h-20 bg-blue-700 hover:bg-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white z-40 transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                aria-label="Activate Voice Control"
            >
                <div className={`absolute inset-0 rounded-full transition-opacity duration-500 ${voiceState === 'listening' ? 'bg-green-400/30 animate-ping' : 'bg-white/20'}`}></div>
                <MicIcon className="w-10 h-10" />
            </button>
            {isModalOpen && (
                <VoiceModal
                    onClose={closeModal}
                    voiceState={voiceState}
                    transcript={transcript}
                    aiResponse={aiResponse}
                    processUtterance={processUtterance}
                    isListening={voiceState === 'listening'}
                />
            )}
        </>
    );
};

export default VoiceControl;