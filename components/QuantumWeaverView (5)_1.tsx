// components/views/platform/QuantumWeaverView.tsx
import React, { useState, useContext, useEffect } from 'react';
import { WeaverStage, AIPlan, AIQuestion } from '../../../types';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

// ================================================================================================
// STAGE-SPECIFIC SUB-COMPONENTS
// ================================================================================================
const PitchStage: React.FC<{ onSubmit: (plan: string) => void; isLoading: boolean; }> = ({ onSubmit, isLoading }) => {
    const [plan, setPlan] = useState('');
    return (
        <Card title="Quantum Weaver: Business Incubator" subtitle="Pitch your business idea to our AI venture capitalist.">
            <p className="text-gray-400 mb-4 text-sm">Submit your plan for analysis. Promising ideas will receive simulated seed funding and a personalized, AI-generated coaching plan to accelerate growth.</p>
            <textarea
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                placeholder="Describe your business idea, target market, value proposition, and what makes it unique..."
                className="w-full h-48 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                disabled={isLoading}
                aria-label="Business plan input"
            />
            <button
                onClick={() => onSubmit(plan)}
                disabled={!plan.trim() || isLoading}
                className="w-full mt-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors"
            >
                {isLoading ? 'Submitting to AI...' : 'Pitch to Plato AI'}
            </button>
        </Card>
    );
};
const AnalysisStage: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
    <Card>
        <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
                <div className="absolute inset-4 border-4 border-t-cyan-500 border-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-2xl font-semibold text-white mt-6">{title}</h3>
            <p className="text-gray-400 mt-2">{subtitle}</p>
        </div>
    </Card>
);
const TestStage: React.FC<{ feedback: string; questions: AIQuestion[]; onPass: () => void; isLoading: boolean; }> = ({ feedback, questions, onPass, isLoading }) => (
    <Card title="Plato's Initial Assessment">
        <div className="p-4 bg-gray-900/50 rounded-lg mb-6">
            <p className="text-lg text-cyan-300 mb-2 font-semibold">Initial Feedback:</p>
            <div className="text-gray-300 italic"><p>"{feedback}"</p></div>
        </div>
        <p className="text-lg text-cyan-300 mb-4 font-semibold">Sample Assessment Questions:</p>
        <div className="space-y-4 mb-6">
            {questions.map((q) => (
                <div key={q.id} className="p-3 bg-gray-800/50 rounded-lg border-l-4 border-cyan-500">
                    <p className="font-semibold text-gray-200">{q.question}</p>
                    <p className="text-xs text-cyan-400 mt-1 uppercase tracking-wider">{q.category}</p>
                </div>
            ))}
        </div>
        <button
            onClick={onPass}
            disabled={isLoading}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors"
        >
            {isLoading ? "Finalizing..." : "Simulate Passing the Test"}
        </button>
    </Card>
);
const ApprovedStage: React.FC<{ loanAmount: number; coachingPlan: AIPlan; }> = ({ loanAmount, coachingPlan }) => (
    <div className="space-y-6">
        <Card>
            <div className="text-center p-6">
                <h2 className="text-3xl font-bold text-white">Congratulations! Your vision is funded.</h2>
                <p className="text-cyan-300 text-5xl font-light my-4">${loanAmount.toLocaleString()}</p>
                <p className="text-gray-400">simulated seed funding has been deposited into your account.</p>
            </div>
        </Card>
        <Card title={coachingPlan.title || "Your AI-Generated Coaching Plan"}>
            <p className="text-sm text-gray-400 mb-4">{coachingPlan.summary}</p>
            <div className="space-y-4">
                {coachingPlan.steps.map((step, index) => (
                    <div key={index} className="p-4 bg-gray-800/50 rounded-lg border-l-4 border-indigo-500">
                        <h4 className="font-semibold text-white">{step.title}</h4>
                        <p className="text-sm text-gray-400 mt-1">{step.description}</p>
                        <p className="text-xs text-indigo-300 mt-2 font-mono">Timeline: {step.timeline}</p>
                    </div>
                ))}
            </div>
        </Card>
    </div>
);
const ErrorStage: React.FC<{ error: string }> = ({ error }) => (
    <Card>
        <div className="flex flex-col items-center justify-center h-64 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">An Error Occurred</h3>
            <p className="text-red-300">{error}</p>
        </div>
    </Card>
);

// ================================================================================================
// MAIN VIEW COMPONENT: QuantumWeaverView (Loomis Quantum)
// ================================================================================================

const QuantumWeaverView: React.FC = () => {
    const [weaverState, setWeaverState] = useState<{
        stage: WeaverStage;
        businessPlan: string;
        feedback: string;
        questions: AIQuestion[];
        loanAmount: number;
        coachingPlan: AIPlan | null;
        error: string | null;
    }>({ stage: WeaverStage.Pitch, businessPlan: '', feedback: '', questions: [], loanAmount: 0, coachingPlan: null, error: null });

    const isLoading = weaverState.stage === WeaverStage.Analysis || weaverState.stage === WeaverStage.FinalReview;

    const pitchBusinessPlan = async (plan: string) => {
        setWeaverState(prev => ({ ...prev, stage: WeaverStage.Analysis, businessPlan: plan }));
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Analyze this business plan and provide brief initial feedback (2-3 sentences) and 3 insightful follow-up questions for the founder. Plan: "${plan}"`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT, properties: {
                            feedback: { type: Type.STRING },
                            questions: { type: Type.ARRAY, items: {
                                type: Type.OBJECT, properties: {
                                    question: { type: Type.STRING }, category: { type: Type.STRING }
                                }
                            }}
                        }
                    }
                }
            });
            const parsed = JSON.parse(response.text);
            const questionsWithIds = parsed.questions.map((q: any, i: number) => ({...q, id: `q_${Date.now()}_${i}`}));
            setWeaverState(prev => ({ ...prev, stage: WeaverStage.Test, feedback: parsed.feedback, questions: questionsWithIds }));
        } catch (error) {
            setWeaverState(prev => ({ ...prev, stage: WeaverStage.Error, error: "Failed to analyze business plan." }));
        }
    };
    
    const simulateTestPass = async () => {
        setWeaverState(prev => ({ ...prev, stage: WeaverStage.FinalReview }));
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `This business plan has been approved for seed funding. Determine an appropriate seed funding amount (between $50k-$250k) and create a 4-step coaching plan with a title, description, and timeline for each step. Plan: "${weaverState.businessPlan}"`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT, properties: {
                            loanAmount: { type: Type.NUMBER },
                            coachingPlan: { type: Type.OBJECT, properties: {
                                title: { type: Type.STRING }, summary: { type: Type.STRING },
                                steps: { type: Type.ARRAY, items: {
                                    type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, timeline: { type: Type.STRING } }
                                }}
                            }}
                        }
                    }
                }
            });
            const parsed = JSON.parse(response.text);
            setWeaverState(prev => ({ ...prev, stage: WeaverStage.Approved, loanAmount: parsed.loanAmount, coachingPlan: parsed.coachingPlan }));
        } catch (error) {
            setWeaverState(prev => ({ ...prev, stage: WeaverStage.Error, error: "Failed to finalize funding." }));
        }
    };

    const renderStage = () => {
        switch(weaverState.stage) {
            case WeaverStage.Pitch: return <PitchStage onSubmit={pitchBusinessPlan} isLoading={isLoading} />;
            case WeaverStage.Analysis: return <AnalysisStage title="Plato is Analyzing Your Plan" subtitle="The AI is reviewing your business model, market fit, and potential." />;
            case WeaverStage.Test: return <TestStage feedback={weaverState.feedback} questions={weaverState.questions} onPass={simulateTestPass} isLoading={isLoading} />;
            case WeaverStage.FinalReview: return <AnalysisStage title="Final Review in Progress" subtitle="Plato is determining the loan amount and generating your coaching plan." />;
            case WeaverStage.Approved: return weaverState.coachingPlan ? <ApprovedStage loanAmount={weaverState.loanAmount} coachingPlan={weaverState.coachingPlan} /> : <ErrorStage error="There was an issue loading your approval details." />;
            case WeaverStage.Error: return <ErrorStage error={weaverState.error || "An unknown error occurred."} />;
            default: return <PitchStage onSubmit={pitchBusinessPlan} isLoading={isLoading} />;
        }
    }
    
    return <div className="space-y-6">{renderStage()}</div>
};

export default QuantumWeaverView;