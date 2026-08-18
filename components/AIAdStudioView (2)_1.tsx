/*
    Refactoring Note: The previous philosophical commentary has been removed to align with production-ready documentation standards.
    This file now focuses purely on technical implementation and architectural clarity.

    System Goal: Convert experimental prototype into a stable, coherent, production-ready platform.
    This module, AIAdStudioView.tsx, is a core component for the "AI-powered transaction intelligence" / "AI-powered creative" MVP candidate.
    It has been refactored to align with enhanced security, modularity, and maintainability.
*/
// components/AIAdStudioView.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef, Reducer, useReducer } from 'react';
import { GoogleGenAI } from "@google/genai";
import Card from './Card'; // Assuming Card is a common UI component with consistent styling

// --- AI Generation Constants ---
const POLLING_MESSAGES = [ // Simplified polling messages for clarity and professionalism
    "Initializing AI Video Generation Engine...",
    "Analyzing prompt and scene directives...",
    "Allocating GPU compute resources...",
    "Synthesizing initial frame sequences...",
    "Applying stylistic and motion controls...",
    "Optimizing data stream for encoding...",
    "Finalizing video asset compilation..."
];
const MAX_SCENE_DURATION = 60;
const MIN_SCENE_DURATION = 1;
const MAX_PROJECTS_DISPLAY = 50;

// SECTION: Type Definitions (Standardized & Expanded)
// =======================================================

export type GenerationState = 'idle' | 'generating' | 'polling' | 'done' | 'error';
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | '21:9' | '3:2' | '2:3';
export type VideoModel = 'veo-3.1-ultra-hq' | 'imagen-video-4-pro' | 'lumiere-hd-001-enterprise' | 'phoenix-v2-stable';
export type GenerationMode = 'single_prompt' | 'storyboard_sequence' | 'ai_script_to_video'; // 'ai_script_to_video' is a future module
export type AppTheme = 'dark' | 'light' | 'system';
export type AssetType = 'video' | 'image_sequence' | 'audio_track';

export interface GenerationSettings {
    model: VideoModel;
    aspectRatio: AspectRatio;
    duration: number; // in seconds (for single prompt mode)
    negativePrompt: string;
    seed: number; // -1 for random, positive integer for deterministic
    stylizationStrength: number; // 0-100 (Creativity/Adherence balance)
    motionControl: 'default' | 'smooth' | 'dynamic';
    fidelityLevel: 'standard' | 'high_res' | '4k_preview';
    audioStyle: 'none' | 'cinematic_orchestral' | 'upbeat_synthwave' | 'corporate_minimal';
}

export interface StoryboardScene {
    id: string;
    prompt: string;
    aiDirectorNotes: string; // Specific instructions for the AI director for this frame
    duration: number; // Scene-specific duration
    visualReferenceUrl?: string; // Optional image reference for style transfer
}

export interface VideoAsset {
    id: string;
    projectId: string;
    assetType: AssetType;
    url: string; // Primary content URL
    metadataUrl?: string; // Secondary metadata/manifest URL
    prompt: string; // The primary prompt used for generation
    creationDate: string;
    lastAccessed: string;
    settings: GenerationSettings;
    generationMode: GenerationMode;
    storyboard?: StoryboardScene[];
    isFavorite: boolean;
    costCredits: number; // Estimated cost in internal credits
}

export interface AdProject {
    id: string;
    name: string;
    clientName: string; // New field for enterprise context
    creationDate: string;
    lastModified: string;
    assets: VideoAsset[];
    aiSummary: string; // AI-generated summary of the project's goal
}

export interface AppConfig {
    apiKey: string | null;
    theme: AppTheme;
    autoSave: boolean;
    defaultSettings: GenerationSettings;
    aiQuotaRemaining: number;
}

// SECTION: Mock Backend API (For MVP Development)
// ===================================================
// NOTE: This MockBackendAPI is for local development and demonstration purposes only.
// In a production environment, this entire class MUST be replaced with a secure,
// standards-compliant backend API (e.g., RESTful, gRPC) integrated with a proper
// database and authentication/authorization layer.
// All API Key management should be handled server-side via AWS Secrets Manager or Vault.
export class MockBackendAPI {
    private projects: AdProject[] = [];
    private latency: number = 150; // Reduced latency for perceived responsiveness
    private readonly STORAGE_KEY = 'ai_ad_studio_enterprise_projects_v2';

    constructor() {
        this.loadFromLocalStorage();
    }

    private async simulateLatency(minMs: number = this.latency): Promise<void> {
        const actualLatency = minMs + Math.random() * 100;
        return new Promise(resolve => setTimeout(resolve, actualLatency));
    }

    private saveToLocalStorage(): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.projects));
        } catch (error) {
            console.error("CRITICAL: Failed to persist projects to local storage:", error);
        }
    }

    private loadFromLocalStorage(): void {
        try {
            const storedProjects = localStorage.getItem(this.STORAGE_KEY);
            if (storedProjects) {
                this.projects = JSON.parse(storedProjects);
            } else {
                this.initializeDefaultData();
            }
        } catch (error) {
            console.error("CRITICAL: Failed to load projects from local storage. Starting fresh:", error);
            this.initializeDefaultData();
        }
    }
    
    private initializeDefaultData(): void {
        const defaultSettings: GenerationSettings = {
            model: 'veo-3.1-ultra-hq',
            aspectRatio: '16:9',
            duration: 10,
            negativePrompt: 'blurry, low quality, watermark, text, artifacts, noise, low frame rate',
            seed: -1,
            stylizationStrength: 75,
            motionControl: 'dynamic',
            fidelityLevel: 'high_res',
            audioStyle: 'cinematic_orchestral',
        };
        
        const defaultProject: AdProject = {
            id: `proj_${Date.now()}`,
            name: 'Q1 2025 Launch Campaign',
            clientName: 'Global Dynamics Corp.',
            creationDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            assets: [],
            aiSummary: 'Initial project setup for high-impact video advertising targeting Gen Z demographics.',
        };
        this.projects.push(defaultProject);
        this.saveToLocalStorage();
    }

    // --- Project Operations ---
    
    public async getProjects(): Promise<AdProject[]> {
        await this.simulateLatency();
        return JSON.parse(JSON.stringify(this.projects)).slice(0, MAX_PROJECTS_DISPLAY);
    }
    
    public async getProjectById(id: string): Promise<AdProject | null> {
        await this.simulateLatency();
        const project = this.projects.find(p => p.id === id);
        return project ? JSON.parse(JSON.stringify(project)) : null;
    }
    
    public async createProject(name: string, clientName: string = 'Unassigned Client'): Promise<AdProject> {
        await this.simulateLatency();
        const newProject: AdProject = {
            id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            clientName,
            creationDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            assets: [],
            aiSummary: `New project initialized for ${name}. Awaiting director input.`,
        };
        this.projects.push(newProject);
        this.saveToLocalStorage();
        return { ...newProject };
    }
    
    public async renameProject(id: string, newName: string): Promise<AdProject | null> {
        await this.simulateLatency();
        const project = this.projects.find(p => p.id === id);
        if (project) {
            project.name = newName;
            project.lastModified = new Date().toISOString();
            this.saveToLocalStorage();
            return { ...project };
        }
        return null;
    }
    
    public async deleteProject(id: string): Promise<boolean> {
        await this.simulateLatency();
        const initialLength = this.projects.length;
        this.projects = this.projects.filter(p => p.id !== id);
        this.saveToLocalStorage();
        return this.projects.length < initialLength;
    }
    
    // --- Asset Operations ---
    
    public async addAssetToProject(projectId: string, asset: Omit<VideoAsset, 'id' | 'projectId' | 'creationDate' | 'lastAccessed'>): Promise<VideoAsset> {
        await this.simulateLatency(300); // Longer latency for asset creation
        const project = this.projects.find(p => p.id === projectId);
        if (!project) {
            throw new Error('Project not found during asset addition');
        }
        const now = new Date().toISOString();
        const newAsset: VideoAsset = {
            ...asset,
            id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            projectId,
            creationDate: now,
            lastAccessed: now,
        };
        project.assets.unshift(newAsset); // Add to the beginning
        project.lastModified = now;
        this.saveToLocalStorage();
        return { ...newAsset };
    }

    public async deleteAsset(projectId: string, assetId: string): Promise<boolean> {
        await this.simulateLatency();
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            const initialLength = project.assets.length;
            project.assets = project.assets.filter(a => a.id !== assetId);
            project.lastModified = new Date().toISOString();
            this.saveToLocalStorage();
            return project.assets.length < initialLength;
        }
        return false;
    }

    public async toggleFavoriteAsset(projectId: string, assetId: string): Promise<VideoAsset | null> {
        await this.simulateLatency();
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            const asset = project.assets.find(a => a.id === assetId);
            if(asset) {
                asset.isFavorite = !asset.isFavorite;
                asset.lastAccessed = new Date().toISOString();
                project.lastModified = new Date().toISOString();
                this.saveToLocalStorage();
                return { ...asset };
            }
        }
        return null;
    }
    
    public async updateAssetAccessTime(projectId: string, assetId: string): Promise<void> {
        await this.simulateLatency(50);
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            const asset = project.assets.find(a => a.id === assetId);
            if(asset) {
                asset.lastAccessed = new Date().toISOString();
                project.lastModified = new Date().toISOString();
                this.saveToLocalStorage();
            }
        }
    }
}

// Instantiate the mock API globally for the module
export const mockApi = new MockBackendAPI();


// SECTION: AI Integration Service (Standardized API Connector Pattern)
// ====================================================================
// This service encapsulates all direct calls to external AI APIs.
// It should handle rate limiting, retries, circuit breakers, and schema validation
// in a production environment. For this MVP, we simulate these patterns.
export class VideoGenerationService {
    private genAIClient: GoogleGenAI | null = null;
    private apiKey: string | null = null;
    private readonly MAX_POLLING_ATTEMPTS = 60; // Max 60 attempts * 8s = 8 minutes timeout
    private readonly POLLING_INTERVAL_MS = 8000; // Poll every 8 seconds

    public setApiKey(key: string | null): void {
        this.apiKey = key;
        this.genAIClient = key ? new GoogleGenAI({ apiKey: key }) : null;
    }

    private checkClient(): GoogleGenAI {
        if (!this.genAIClient || !this.apiKey) {
            throw new Error("AI Service not initialized: API Key is missing or invalid.");
        }
        return this.genAIClient;
    }

    // Unified API connector for video generation
    public async generateVideoAsset(
        mode: GenerationMode,
        singlePrompt: string,
        scenes: StoryboardScene[],
        settings: GenerationSettings
    ): Promise<{ url: string; prompt: string; costCredits: number; storyboard?: StoryboardScene[] }> {
        const ai = this.checkClient();
        
        const finalPrompt = synthesizeDirectorPrompt(mode, singlePrompt, scenes);
        const estimatedCost = mode === 'storyboard_sequence' ? 500 : 100; // Mock cost calculation

        // Simulate rate limiting / circuit breaker check
        console.info("[AI Service] Checking API rate limits and circuit breaker status...");
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate a quick check

        const apiPayload: any = {
            model: settings.model,
            prompt: finalPrompt,
            config: {
                numberOfVideos: 1,
                aspectRatio: settings.aspectRatio,
                duration: mode === 'single_prompt' ? settings.duration : undefined,
                fidelity: settings.fidelityLevel,
                stylization: settings.stylizationStrength / 100,
                motionProfile: settings.motionControl,
                audioTrack: settings.audioStyle,
                seed: settings.seed,
                negativePrompt: settings.negativePrompt,
            },
        };

        console.log(`[AI Service] Executing ${mode} generation with payload:`, apiPayload);
        
        let operation;
        try {
            operation = await ai.models.generateVideos(apiPayload);
            console.info("[AI Service] Generation operation initiated.");
        } catch (initialError: any) {
            console.error("[AI Service] Initial generation request failed:", initialError);
            throw new Error(`AI Request Failure: ${initialError.message || 'Unknown API error.'}`);
        }

        let attempts = 0;
        // Polling loop with explicit timeout
        while (!operation.done && attempts < this.MAX_POLLING_ATTEMPTS) {
            attempts++;
            console.debug(`[AI Service] Polling for video generation status (attempt ${attempts})...`);
            await new Promise(resolve => setTimeout(resolve, this.POLLING_INTERVAL_MS));
            
            try {
                operation = await ai.operations.getVideosOperation({ operation: operation });
            } catch (pollError: any) {
                console.error(`[AI Service] Polling failed on attempt ${attempts}:`, pollError);
                // Implement retry logic here if needed (e.g., exponential backoff)
                throw new Error(`AI Polling Failure: ${pollError.message || 'Unknown polling error.'}`);
            }
        }

        if (attempts >= this.MAX_POLLING_ATTEMPTS) {
            console.error("[AI Service] Video generation timed out.");
            throw new Error("AI Generation Timeout: Operation exceeded maximum allowed time.");
        }

        if (operation.error) {
            console.error("[AI Service] Generation operation reported error:", operation.error);
            throw new Error(`AI Generation Error: ${operation.error.message || 'Unknown backend error.'}`);
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            console.error("[AI Service] Generation succeeded, but no download link was provided.");
            throw new Error('AI Asset Retrieval Error: Generation successful, but asset manifest empty.');
        }

        // Simulate fetching the actual file (using the mock API key for the fetch URL for demo)
        // In production, this download link would likely be temporary, signed, and not require the client's API key.
        const videoResponse = await fetch(`${downloadLink}&key=${this.apiKey}`);
        if (!videoResponse.ok) {
            console.error(`[AI Service] Failed to retrieve asset blob: ${videoResponse.statusText}`);
            throw new Error(`Download Protocol Error: Failed to retrieve asset (${videoResponse.statusText})`);
        }
        const videoBlob = await videoResponse.blob();
        const objectURL = URL.createObjectURL(videoBlob);
        
        console.info("[AI Service] Video asset successfully generated and retrieved.");

        return {
            url: objectURL,
            prompt: finalPrompt,
            costCredits: estimatedCost,
            storyboard: mode === 'storyboard_sequence' ? scenes : undefined,
        };
    }

    // AI utility for summarizing prompts (explainability notes)
    public async generateDirectorSummary(fullPrompt: string): Promise<string> {
        const ai = this.checkClient();
        
        // This uses a text-specific model for efficiency
        const directorPrompt = `Analyze the following video generation sequence prompt and generate a concise, high-level summary of the intended visual narrative, target emotion, and required technical execution style.
        PROMPT: ${fullPrompt}`;
        
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: directorPrompt }] }],
                config: { temperature: 0.3, maxOutputTokens: 200 } // Limit output for conciseness
            });
            return response.candidates?.[0]?.content?.parts?.[0]?.text || "Summary generation failed or returned empty.";
        } catch (err: any) {
            console.error("[AI Service] Director summary generation failed:", err);
            throw new Error(`AI Summary Generation Failed: ${err.message || 'Unknown AI error.'}`);
        }
    }
}

// Instantiate the AI Service
export const videoGenerationService = new VideoGenerationService();


// SECTION: Utility Functions (Standardized)
// ==========================

export const generateUniqueId = (): string => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatDate = (isoString: string): string => {
    try {
        return new Date(isoString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        });
    } catch {
        return 'Invalid Timestamp';
    }
};

export const getAspectRatioClass = (aspectRatio: AspectRatio): string => {
    switch (aspectRatio) {
        case '16:9': return 'aspect-[16/9]';
        case '9:16': return 'aspect-[9/16]';
        case '1:1': return 'aspect-square';
        case '4:5': return 'aspect-[4/5]';
        case '21:9': return 'aspect-[21/9]';
        case '3:2': return 'aspect-[3/2]';
        case '2:3': return 'aspect-[2/3]';
        default: return 'aspect-video';
    }
};

// --- AI Utility: Prompt Synthesis ---
export const synthesizeDirectorPrompt = (mode: GenerationMode, singlePrompt: string, scenes: StoryboardScene[]): string => {
    if (mode === 'single_prompt') {
        return `[SINGLE_SHOT_AD] ${singlePrompt}`;
    }
    if (mode === 'storyboard_sequence') {
        const scenePrompts = scenes.map((scene, index) =>
            `Scene ${index + 1} (${scene.duration}s): [VISUAL_FOCUS] ${scene.prompt}. [DIRECTOR_NOTES] ${scene.aiDirectorNotes || 'Maintain visual consistency with previous scene.'}`
        ).join(' ||| ');
        return `[STORYBOARD_AD] Total Scenes: ${scenes.length}. Sequence: ${scenePrompts}`;
    }
    return singlePrompt; // Fallback for 'ai_script_to_video' or other future modes
};


// SECTION: Reducer for Complex State Management (Component-level standard)
// =============================================================
// Note: While this component uses useReducer for its state, for a larger application
// global state management (e.g., Zustand or Redux Toolkit) would be recommended
// for truly centralized, scalable state across multiple views/components.
type AppState = {
    projects: AdProject[];
    currentProjectId: string | null;
    isLoading: boolean;
    error: string | null;
    config: AppConfig;
};

type AppAction =
    | { type: 'SET_PROJECTS'; payload: AdProject[] }
    | { type: 'SET_CURRENT_PROJECT'; payload: string | null }
    | { type: 'ADD_PROJECT'; payload: AdProject }
    | { type: 'UPDATE_PROJECT'; payload: AdProject }
    | { type: 'REMOVE_PROJECT'; payload: string }
    | { type: 'ADD_ASSET'; payload: { projectId: string; asset: VideoAsset } }
    | { type: 'REMOVE_ASSET'; payload: { projectId: string; assetId: string } }
    | { type: 'UPDATE_ASSET'; payload: { projectId: string; asset: VideoAsset } }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'UPDATE_CONFIG'; payload: Partial<AppConfig> }
    | { type: 'UPDATE_PROJECT_SUMMARY'; payload: { projectId: string; summary: string } };

const initialAppState: AppState = {
    projects: [],
    currentProjectId: null,
    isLoading: true,
    error: null,
    config: {
        apiKey: null,
        theme: 'dark',
        autoSave: true,
        aiQuotaRemaining: 10000, // Mock initial quota
        defaultSettings: {
            model: 'veo-3.1-ultra-hq',
            aspectRatio: '16:9',
            duration: 10,
            negativePrompt: 'blurry, low quality, watermark, text, artifacts, noise, low frame rate',
            seed: -1,
            stylizationStrength: 75,
            motionControl: 'dynamic',
            fidelityLevel: 'high_res',
            audioStyle: 'cinematic_orchestral',
        },
    },
};

const appReducer: Reducer<AppState, AppAction> = (state, action): AppState => {
    switch (action.type) {
        case 'SET_PROJECTS':
            const firstProjectId = action.payload.length > 0 ? action.payload[0].id : null;
            return {
                ...state,
                projects: action.payload,
                currentProjectId: state.currentProjectId && action.payload.some(p => p.id === state.currentProjectId)
                    ? state.currentProjectId
                    : firstProjectId,
                isLoading: false,
            };
        case 'SET_CURRENT_PROJECT':
            return { ...state, currentProjectId: action.payload };
        case 'ADD_PROJECT':
            return { ...state, projects: [...state.projects, action.payload] };
        case 'UPDATE_PROJECT':
            return {
                ...state,
                projects: state.projects.map(p => (p.id === action.payload.id ? action.payload : p)),
            };
        case 'REMOVE_PROJECT':
            const remainingProjects = state.projects.filter(p => p.id !== action.payload);
            const newCurrentProjectId = state.currentProjectId === action.payload
                ? remainingProjects.length > 0 ? remainingProjects[0].id : null
                : state.currentProjectId;
            return {
                ...state,
                projects: remainingProjects,
                currentProjectId: newCurrentProjectId,
            };
        case 'ADD_ASSET':
        case 'REMOVE_ASSET':
        case 'UPDATE_ASSET':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id !== action.payload.projectId) return p;
                    let newAssets: VideoAsset[];
                    if (action.type === 'ADD_ASSET') {
                        newAssets = [action.payload.asset, ...p.assets];
                    } else if (action.type === 'REMOVE_ASSET') {
                        newAssets = p.assets.filter(a => a.id !== action.payload.assetId);
                    } else { // UPDATE_ASSET
                        newAssets = p.assets.map(a => a.id === action.payload.asset.id ? action.payload.asset : a);
                    }
                    return { ...p, assets: newAssets, lastModified: new Date().toISOString() };
                }),
            };
        case 'UPDATE_CONFIG':
            return { ...state, config: { ...state.config, ...action.payload } };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false };
        case 'UPDATE_PROJECT_SUMMARY':
             return {
                ...state,
                projects: state.projects.map(p => (p.id === action.payload.projectId ? { ...p, aiSummary: action.payload.summary, lastModified: new Date().toISOString() } : p)),
            };
        default:
            return state;
    }
};

// SECTION: Child Components (AI-Enhanced UI Elements)
// ==================================================

export const ProjectSidebar: React.FC<{
    projects: AdProject[];
    currentProjectId: string | null;
    onSelectProject: (id: string) => void;
    onCreateProject: (name: string, client: string) => void;
    onDeleteProject: (id: string) => void;
    onRenameProject: (id: string, newName: string) => void;
}> = ({ projects, currentProjectId, onSelectProject, onCreateProject, onDeleteProject, onRenameProject }) => {
    const [newProjectName, setNewProjectName] = useState('');
    const [newClientName, setNewClientName] = useState('');
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renamingText, setRenamingText] = useState('');

    const handleCreateProject = () => {
        if (newProjectName.trim()) {
            onCreateProject(newProjectName.trim(), newClientName.trim() || 'Unassigned Client');
            setNewProjectName('');
            setNewClientName('');
        }
    };

    const handleRename = (id: string) => {
        if (renamingText.trim() && renamingId) {
            onRenameProject(id, renamingText.trim());
        }
        setRenamingId(null);
        setRenamingText('');
    };

    return (
        <div className="bg-gray-900 border-r border-gray-700 w-72 p-4 flex flex-col h-full shadow-2xl">
            <h3 className="text-2xl font-extrabold text-cyan-400 mb-4 border-b border-gray-700 pb-2">Project Nexus</h3>
            
            {/* New Project Creation Block */}
            <div className="mb-4 p-3 bg-gray-800/70 rounded-lg border border-gray-700">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">New Initiative</h4>
                <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                    placeholder="Project Name (e.g., Q2 Campaign)"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm text-white mb-2 focus:ring-cyan-500"
                />
                <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                    placeholder="Client Name (Optional)"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm text-white mb-2 focus:ring-cyan-500"
                />
                <button onClick={handleCreateProject} disabled={!newProjectName.trim()} className="w-full bg-cyan-700 hover:bg-cyan-600 text-white p-2 rounded-md text-sm font-medium disabled:opacity-30">
                    Initiate Project
                </button>
            </div>

            <h4 className="text-md font-semibold text-gray-300 mb-2 uppercase tracking-wider">Active Projects ({projects.length})</h4>
            <ul className="space-y-1 overflow-y-auto flex-grow custom-scrollbar">
                {projects.map(project => (
                    <li key={project.id}>
                        <div
                            className={`group flex flex-col p-2 rounded-lg cursor-pointer transition-colors ${currentProjectId === project.id ? 'bg-cyan-700/50 text-white shadow-lg border border-cyan-500' : 'text-gray-300 hover:bg-gray-800/50 border border-transparent'}`}
                            onClick={() => onSelectProject(project.id)}
                        >
                            <div className="flex items-center justify-between w-full">
                                {renamingId === project.id ? (
                                    <input
                                        type="text"
                                        value={renamingText}
                                        onChange={(e) => setRenamingText(e.target.value)}
                                        onBlur={() => handleRename(project.id)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleRename(project.id)}
                                        className="bg-gray-600 text-white w-full text-sm p-1 rounded focus:outline-none"
                                        autoFocus
                                    />
                                ) : (
                                    <span className="truncate font-medium text-sm">{project.name}</span>
                                )}
                                <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button title="Rename" onClick={(e) => { e.stopPropagation(); setRenamingId(project.id); setRenamingText(project.name); }} className="text-gray-400 hover:text-yellow-400 text-xs p-1">✏️</button>
                                    <button title="Delete" onClick={(e) => { e.stopPropagation(); if(window.confirm(`Confirm deletion of Project: "${project.name}"?`)) onDeleteProject(project.id);}} className="text-gray-400 hover:text-red-500 text-xs p-1">🗑️</button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">Client: {project.clientName}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export const GenerationControls: React.FC<{
    settings: GenerationSettings;
    onSettingsChange: (newSettings: Partial<GenerationSettings>) => void;
    isGenerating: boolean;
    aiQuota: number;
}> = ({ settings, onSettingsChange, isGenerating, aiQuota }) => {
    
    const handleRangeChange = (key: keyof GenerationSettings, value: string) => {
        onSettingsChange({ [key]: parseInt(value, 10) });
    };
    
    const handleSelectChange = (key: keyof GenerationSettings, value: string) => {
        onSettingsChange({ [key]: value });
    };

    return (
        <Card title="AI Generation Matrix Configuration" className="shadow-xl border-cyan-800/50">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                
                {/* Model Selection */}
                <div className="col-span-2 lg:col-span-1">
                    <label className="block text-xs font-medium text-cyan-400 mb-1 uppercase">AI Model Core</label>
                    <select
                        value={settings.model}
                        onChange={e => handleSelectChange('model', e.target.value)}
                        disabled={isGenerating}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm focus:ring-cyan-500"
                    >
                        <option value="veo-3.1-ultra-hq">Veo 3.1 (Ultra HQ)</option>
                        <option value="imagen-video-4-pro">Imagen Video 4 (Pro)</option>
                        <option value="lumiere-hd-001-enterprise">Lumiere HD (Enterprise)</option>
                        <option value="phoenix-v2-stable">Phoenix v2 (Stable)</option>
                    </select>
                </div>
                
                {/* Aspect Ratio */}
                <div>
                    <label className="block text-xs font-medium text-cyan-400 mb-1 uppercase">Output Ratio</label>
                    <select
                        value={settings.aspectRatio}
                        onChange={e => handleSelectChange('aspectRatio', e.target.value)}
                        disabled={isGenerating}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm"
                    >
                        <option value="16:9">16:9 (Widescreen)</option>
                        <option value="9:16">9:16 (Vertical/Mobile)</option>
                        <option value="1:1">1:1 (Square)</option>
                        <option value="4:5">4:5 (Portrait)</option>
                        <option value="21:9">21:9 (Cinematic)</option>
                        <option value="3:2">3:2 (Standard Photo)</option>
                        <option value="2:3">2:3 (Poster)</option>
                    </select>
                </div>
                
                {/* Duration (Single Mode Only) */}
                <div>
                    <label className="block text-xs font-medium text-cyan-400 mb-1 uppercase">Duration (s): {settings.duration}</label>
                    <input
                        type="range"
                        min={MIN_SCENE_DURATION}
                        max={30} // Capped at 30 for single prompt for cost control
                        step="1"
                        value={settings.duration}
                        onChange={e => handleRangeChange('duration', e.target.value)}
                        disabled={isGenerating}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-cyan-500 [&::-moz-range-thumb]:bg-cyan-500"
                    />
                </div>
                
                {/* Fidelity Level */}
                <div>
                    <label className="block text-xs font-medium text-cyan-400 mb-1 uppercase">Fidelity Level</label>
                    <select
                        value={settings.fidelityLevel}
                        onChange={e => handleSelectChange('fidelityLevel', e.target.value)}
                        disabled={isGenerating}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm"
                    >
                        <option value="standard">Standard (Fast)</option>
                        <option value="high_res">High Resolution</option>
                        <option value="4k_preview">4K Preview (High Cost)</option>
                    </select>
                </div>
                
                {/* Stylization Strength */}
                <div className="col-span-2 lg:col-span-1">
                    <label className="block text-xs font-medium text-cyan-400 mb-1 uppercase">Creativity/Adherence: {settings.stylizationStrength}%</label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={settings.stylizationStrength}
                        onChange={e => handleRangeChange('stylizationStrength', e.target.value)}
                        disabled={isGenerating}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-cyan-500 [&::-moz-range-thumb]:bg-cyan-500"
                    />
                </div>
                
                {/* Motion Control */}
                <div>
                    <label className="block text-xs font-medium text-cyan-400 mb-1 uppercase">Motion Profile</label>
                    <select
                        value={settings.motionControl}
                        onChange={e => handleSelectChange('motionControl', e.target.value)}
                        disabled={isGenerating}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm"
                    >
                        <option value="dynamic">Dynamic (Complex)</option>
                        <option value="smooth">Smooth (Subtle)</option>
                        <option value="default">Default</option>
                    </select>
                </div>
                
                {/* Audio Style */}
                <div>
                    <label className="block text-xs font-medium text-cyan-400 mb-1 uppercase">Audio Track</label>
                    <select
                        value={settings.audioStyle}
                        onChange={e => handleSelectChange('audioStyle', e.target.value)}
                        disabled={isGenerating}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm"
                    >
                        <option value="none">None (Muted)</option>
                        <option value="cinematic_orchestral">Cinematic Orchestral</option>
                        <option value="upbeat_synthwave">Upbeat Synthwave</option>
                        <option value="corporate_minimal">Corporate Minimal</option>
                    </select>
                </div>
                
                {/* Seed Control */}
                <div className="col-span-2 lg:col-span-1">
                     <label className="block text-xs font-medium text-cyan-400 mb-1 uppercase">Seed (Deterministic)</label>
                     <div className="flex">
                        <input
                            type="number"
                            value={settings.seed === -1 ? '' : settings.seed}
                            onChange={e => onSettingsChange({ seed: parseInt(e.target.value, 10) || -1 })}
                            placeholder="Random (-1)"
                            disabled={isGenerating}
                            className="w-full bg-gray-700 border border-gray-600 rounded-l-lg p-2 text-white text-sm"
                        />
                        <button onClick={() => onSettingsChange({seed: -1})} title="Use Random Seed" className="bg-gray-600 hover:bg-gray-500 p-2 rounded-r-lg text-sm font-bold">🎲</button>
                     </div>
                </div>
                
                {/* Quota Display */}
                <div className="col-span-2 lg:col-span-1">
                    <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">AI Compute Quota</label>
                    <div className="w-full bg-gray-700 rounded-lg h-8 flex items-center">
                        <div 
                            className={`h-full rounded-l-lg text-xs font-bold flex items-center px-2 transition-all duration-500 ${aiQuota > 1000 ? 'bg-green-600' : aiQuota > 200 ? 'bg-yellow-600' : 'bg-red-600'}`}
                            style={{ width: `${Math.min(100, (aiQuota / 10000) * 100)}%` }}
                        >
                            {aiQuota.toLocaleString()}
                        </div>
                        <span className="text-xs text-gray-300 px-2 flex-shrink-0">/ 10,000</span>
                    </div>
                </div>
                
                {/* Negative Prompt */}
                <div className="col-span-full">
                    <label className="block text-xs font-medium text-cyan-400 mb-1 uppercase">Negative Prompt (Artifact Suppression)</label>
                    <input
                        type="text"
                        value={settings.negativePrompt}
                        onChange={e => handleSelectChange('negativePrompt', e.target.value)}
                        placeholder="e.g., blurry, text, watermark, ugly, low resolution"
                        disabled={isGenerating}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm"
                    />
                </div>
            </div>
        </Card>
    );
};

export const AssetGrid: React.FC<{
    assets: VideoAsset[];
    onDelete: (assetId: string) => void;
    onToggleFavorite: (assetId: string) => void;
    onSelect: (asset: VideoAsset) => void;
}> = ({ assets, onDelete, onToggleFavorite, onSelect }) => {
    if (assets.length === 0) {
        return (
            <div className="text-center py-16 text-gray-500 border border-dashed border-gray-700 rounded-lg">
                <p className="text-lg mb-2">📦 Asset Repository Empty</p>
                <p>Generate your first video asset using the controls above to populate this library.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {assets.map(asset => (
                <div key={asset.id} className="group relative aspect-video bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-cyan-500 transition-all duration-200 shadow-lg">
                    {/* Placeholder for actual video preview */}
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <span className="text-xs text-gray-500">Preview Unavailable</span>
                    </div>
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <div className="flex justify-end space-x-2">
                            <button title="Favorite" onClick={() => onToggleFavorite(asset.id)} className={`text-xl ${asset.isFavorite ? 'text-yellow-400' : 'text-white/70 hover:text-white'}`}>
                                {asset.isFavorite ? '★' : '☆'}
                            </button>
                            <button title="Delete Asset" onClick={() => onDelete(asset.id)} className="text-white/70 hover:text-red-500">🗑️</button>
                        </div>
                        <div className="bg-black/50 p-1 rounded-md">
                            <p className="text-xs text-white truncate font-mono">{asset.id.substring(0, 8)}...</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Cost: {asset.costCredits} Credits</p>
                            <button onClick={() => onSelect(asset)} className="mt-1 w-full text-xs bg-cyan-600/80 hover:bg-cyan-500 text-white py-1 rounded transition-colors">Analyze & View</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const StoryboardEditor: React.FC<{
    scenes: StoryboardScene[];
    setScenes: React.Dispatch<React.SetStateAction<StoryboardScene[]>>;
    isGenerating: boolean;
    onGenerateDirectorSummary: (prompt: string) => Promise<string>;
    onScenePromptChange: (id: string, prompt: string) => void;
    onSceneNotesChange: (id: string, notes: string) => void;
    onSceneDurationChange: (id: string, duration: number) => void;
    onUpdateProjectSummary: (projectId: string, summary: string) => void; // Added prop
    currentProjectId: string | null; // Added prop
}> = ({ scenes, setScenes, isGenerating, onGenerateDirectorSummary, onScenePromptChange, onSceneNotesChange, onSceneDurationChange, onUpdateProjectSummary, currentProjectId }) => {
    const [isSummarizing, setIsSummarizing] = useState(false);

    const addScene = () => {
        setScenes(prev => [...prev, { id: generateUniqueId(), prompt: '', aiDirectorNotes: '', duration: 5 }]);
    };

    const removeScene = (id: string) => {
        setScenes(prev => prev.filter(s => s.id !== id));
    };
    
    const totalDuration = useMemo(() => scenes.reduce((acc, scene) => acc + scene.duration, 0), [scenes]);

    const handleGenerateSummary = useCallback(async () => {
        if (isGenerating || !currentProjectId) return;
        setIsSummarizing(true);
        const sequencePrompt = synthesizeDirectorPrompt('storyboard_sequence', '', scenes);
        try {
            const summary = await onGenerateDirectorSummary(sequencePrompt);
            onUpdateProjectSummary(currentProjectId, summary); // Update project summary
        } catch (e) {
            console.error("Failed to generate director summary:", e);
            alert('Failed to generate director summary. See console for details.');
        } finally {
            setIsSummarizing(false);
        }
    }, [isGenerating, scenes, onGenerateDirectorSummary, onUpdateProjectSummary, currentProjectId]);

    return (
        <div className="space-y-4 p-3 bg-gray-800/50 rounded-xl border border-gray-700">
            <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Storyboard Sequence Editor</h4>
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {scenes.map((scene, index) => (
                    <div key={scene.id} className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded-lg shadow-inner border border-gray-600">
                        <span className="font-extrabold text-lg text-cyan-400 mt-2 w-6 flex-shrink-0">{index + 1}</span>
                        <div className="flex-grow space-y-2">
                            {/* Prompt Input */}
                            <textarea
                                value={scene.prompt}
                                onChange={e => onScenePromptChange(scene.id, e.target.value)}
                                placeholder={`Scene ${index + 1} Visual Description...`}
                                className="w-full h-16 bg-gray-800 border border-gray-600 rounded-lg p-2 text-white text-sm focus:ring-cyan-500 resize-none"
                                disabled={isGenerating}
                            />
                            {/* Director Notes Input */}
                            <textarea
                                value={scene.aiDirectorNotes}
                                onChange={e => onSceneNotesChange(scene.id, e.target.value)}
                                placeholder={`AI Director Notes (e.g., Camera movement, lighting style, character emotion)...`}
                                className="w-full h-12 bg-gray-800 border border-gray-600 rounded-lg p-2 text-white text-xs italic focus:ring-yellow-500 resize-none"
                                disabled={isGenerating}
                            />
                            
                            {/* Duration Control */}
                             <div className="flex items-center space-x-2 pt-1">
                                <label className="text-xs text-gray-400">Duration:</label>
                                 <input
                                    type="range"
                                    min={MIN_SCENE_DURATION}
                                    max={MAX_SCENE_DURATION}
                                    value={scene.duration}
                                    onChange={e => onSceneDurationChange(scene.id, parseInt(e.target.value, 10))}
                                    disabled={isGenerating}
                                    className="w-32 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-cyan-500 [&::-moz-range-thumb]:bg-cyan-500"
                                />
                                <span className="text-xs text-white w-8 font-bold">{scene.duration}s</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => removeScene(scene.id)} 
                            disabled={isGenerating || scenes.length <= 1} 
                            title="Remove Scene"
                            className="text-gray-400 hover:text-red-500 disabled:opacity-30 mt-2 p-1"
                        >🗑️</button>
                    </div>
                ))}
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                <button onClick={addScene} disabled={isGenerating || scenes.length >= 20} className="py-2 px-4 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded-lg disabled:opacity-50 flex items-center space-x-1">
                    <span>+ Add Scene Block</span>
                </button>
                <div className="flex items-center space-x-3">
                    <button onClick={handleGenerateSummary} disabled={isGenerating || isSummarizing || !currentProjectId} className="py-2 px-4 text-sm bg-yellow-700/50 hover:bg-yellow-700 text-white rounded-lg disabled:opacity-50 flex items-center space-x-1">
                        {isSummarizing ? (
                            <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                <span>AI Directing...</span>
                            </>
                        ) : (
                            <span>✨ Synthesize Director Notes</span>
                        )}
                    </button>
                    <p className="text-sm text-gray-400">Total Estimated Duration: <span className="font-bold text-white">{totalDuration}s</span></p>
                </div>
            </div>
        </div>
    );
};

// SECTION: Main Component (The Sovereign Interface)
// =========================================================

const AIAdStudioView: React.FC = () => {
    // --- Core State Management ---
    const [prompt, setPrompt] = useState('A hyper-realistic, cinematic 15-second commercial showcasing a self-driving electric vehicle navigating a rain-slicked Tokyo street at midnight, emphasizing speed and safety.');
    const [generationState, setGenerationState] = useState<GenerationState>('idle');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pollingMessageIndex, setPollingMessageIndex] = useState(0);
    const [pollingIntervalId, setPollingIntervalId] = useState<number | null>(null);

    // --- Application State (via Reducer) ---
    const [appState, dispatch] = useReducer(appReducer, initialAppState);
    const [generationSettings, setGenerationSettings] = useState<GenerationSettings>(initialAppState.config.defaultSettings);
    const [generationMode, setGenerationMode] = useState<GenerationMode>('single_prompt');
    const [scenes, setScenes] = useState<StoryboardScene[]>([
        { id: generateUniqueId(), prompt: 'Extreme close-up on a single raindrop hitting a polished chrome surface.', aiDirectorNotes: 'Shallow depth of field, high contrast.', duration: 3 },
        { id: generateUniqueId(), prompt: 'Wide shot of the vehicle accelerating smoothly away from a blurred neon sign.', aiDirectorNotes: 'Smooth tracking shot, cinematic color grading.', duration: 7 },
    ]);
    const [selectedAsset, setSelectedAsset] = useState<VideoAsset | null>(null);
    
    const isGenerating = generationState === 'generating' || generationState === 'polling';
    
    // API Key Input Ref
    const apiKeyInputRef = useRef<HTMLInputElement>(null);

    // Derived State
    const currentProject = useMemo(() => {
        return appState.projects.find(p => p.id === appState.currentProjectId);
    }, [appState.projects, appState.currentProjectId]);
    
    const currentProjectAssets = useMemo(() => {
        return currentProject?.assets || [];
    }, [currentProject]);

    // --- Effects ---
    useEffect(() => {
        // 1. Load initial projects and configuration
        mockApi.getProjects().then(projects => {
            dispatch({ type: 'SET_PROJECTS', payload: projects });
        }).catch(err => {
            dispatch({ type: 'SET_ERROR', payload: 'System initialization failed: Cannot load project manifest.' });
            console.error(err);
        });

        // 2. Load API key from persistent storage and set on AI service
        // WARNING: Storing API keys directly in localStorage or environment variables
        // on the client-side is INSECURE for production applications.
        // For a secure, production-ready system, implement a robust OAuth2/OIDC flow
        // where API keys are managed server-side (e.g., AWS Secrets Manager) and
        // client requests are authenticated via short-lived, backend-issued tokens (e.g., JWT).
        const storedApiKey = process.env.REACT_APP_API_KEY || localStorage.getItem('google_genai_api_key');
        if (storedApiKey) {
            dispatch({ type: 'UPDATE_CONFIG', payload: { apiKey: storedApiKey } });
            videoGenerationService.setApiKey(storedApiKey);
        }
    }, []);

    useEffect(() => {
        // 3. Cleanup interval on state change/unmount
        return () => {
            if (pollingIntervalId) {
                clearInterval(pollingIntervalId);
            }
        };
    }, [pollingIntervalId]);

    useEffect(() => {
        // 4. Cleanup blob URL
        return () => {
            if (videoUrl && videoUrl.startsWith('blob:')) {
                URL.revokeObjectURL(videoUrl);
            }
        };
    }, [videoUrl]);
    
    // --- Handlers ---
    
    const handleUpdateConfig = useCallback((payload: Partial<AppConfig>) => {
        dispatch({ type: 'UPDATE_CONFIG', payload });
        if (payload.apiKey !== undefined) {
            videoGenerationService.setApiKey(payload.apiKey);
        }
    }, []);

    const handleApiKeySave = () => {
        const key = apiKeyInputRef.current?.value;
        if (key && key.length > 20) { // Basic validation for non-empty and reasonable length
            // WARNING: See comment in useEffect for security implications of client-side API key storage.
            localStorage.setItem('google_genai_api_key', key);
            handleUpdateConfig({ apiKey: key });
            setError(null);
            alert("API Key successfully registered. System ready for secure connection.");
        } else {
            setError("Invalid key format detected. Key must be substantial.");
        }
    };
    
    // Project Management
    const handleCreateProject = useCallback(async (name: string, client: string) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const newProject = await mockApi.createProject(name, client);
            dispatch({ type: 'ADD_PROJECT', payload: newProject });
            dispatch({ type: 'SET_CURRENT_PROJECT', payload: newProject.id });
        } catch (err: any) {
            dispatch({ type: 'SET_ERROR', payload: `Failed to initiate new project: ${err.message || 'Unknown error.'}` });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, []);

    const handleDeleteProject = useCallback(async (id: string) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            await mockApi.deleteProject(id);
            dispatch({ type: 'REMOVE_PROJECT', payload: id });
        } catch (err: any) {
            dispatch({ type: 'SET_ERROR', payload: `Failed to decommission project: ${err.message || 'Unknown error.'}` });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, []);
    
    const handleRenameProject = useCallback(async (id: string, newName: string) => {
        try {
            const updatedProject = await mockApi.renameProject(id, newName);
            if (updatedProject) {
                dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
            }
        } catch (err: any) {
            dispatch({ type: 'SET_ERROR', payload: `Failed to rename project: ${err.message || 'Unknown error.'}` });
        }
    }, []);

    // Asset Management
    const handleDeleteAsset = useCallback(async (assetId: string) => {
        if (!currentProject) return;
        try {
            await mockApi.deleteAsset(currentProject.id, assetId);
            dispatch({ type: 'REMOVE_ASSET', payload: { projectId: currentProject.id, assetId }});
            if (selectedAsset?.id === assetId) {
                setSelectedAsset(null);
            }
        } catch (err: any) {
            dispatch({ type: 'SET_ERROR', payload: `Failed to purge asset: ${err.message || 'Unknown error.'}` });
        }
    }, [currentProject, selectedAsset]);
    
    const handleToggleFavorite = useCallback(async (assetId: string) => {
        if (!currentProject) return;
        try {
            const updatedAsset = await mockApi.toggleFavoriteAsset(currentProject.id, assetId);
            if(updatedAsset) {
                dispatch({ type: 'UPDATE_ASSET', payload: { projectId: currentProject.id, asset: updatedAsset }});
            }
        } catch (err: any) {
            dispatch({ type: 'SET_ERROR', payload: `Failed to update asset metadata: ${err.message || 'Unknown error.'}` });
        }
    }, [currentProject]);
    
    const handleAssetSelect = useCallback(async (asset: VideoAsset) => {
        await mockApi.updateAssetAccessTime(asset.projectId, asset.id);
        dispatch({ type: 'UPDATE_ASSET', payload: { projectId: asset.projectId, asset: {...asset, lastAccessed: new Date().toISOString()} }});
        setSelectedAsset(asset);
    }, []);
    
    // AI Director Summary Generation
    const handleGenerateDirectorSummary = useCallback(async (fullPrompt: string): Promise<string> => {
        try {
            return await videoGenerationService.generateDirectorSummary(fullPrompt);
        } catch (err: any) {
            console.error("Error generating director summary:", err);
            throw err; // Re-throw to be caught by the calling component
        }
    }, []);

    const handleUpdateProjectSummary = useCallback((projectId: string, summary: string) => {
        dispatch({ type: 'UPDATE_PROJECT_SUMMARY', payload: { projectId, summary } });
    }, []);

    // --- Core Generation Execution ---
    const handleGenerate = async () => {
        if (!appState.config.apiKey) {
            setError('Authentication Failure: API Key is required for compute access.');
            setGenerationState('error');
            return;
        }

        if(!currentProject) {
            setError('Project Context Missing: Select or create a project before generation.');
            setGenerationState('error');
            return;
        }
        
        if (appState.config.aiQuotaRemaining <= 0) {
            setError('Quota Exhausted: Compute resources are unavailable. Contact administration for quota refresh.');
            setGenerationState('error');
            return;
        }

        setGenerationState('generating');
        setError(null);
        if (videoUrl && videoUrl.startsWith('blob:')) {
            URL.revokeObjectURL(videoUrl);
        }
        setVideoUrl(null);
        setPollingMessageIndex(0);
        if (pollingIntervalId) {
            clearInterval(pollingIntervalId);
        }
        
        // Start visual feedback loop for polling messages
        const intervalId: number = window.setInterval(() => {
            setPollingMessageIndex(prev => (prev + 1) % POLLING_MESSAGES.length);
        }, 2000);
        setPollingIntervalId(intervalId);

        try {
            const { url, prompt: generatedPrompt, costCredits, storyboard: generatedStoryboard } = await videoGenerationService.generateVideoAsset(
                generationMode,
                prompt,
                scenes,
                generationSettings
            );
            
            clearInterval(intervalId);
            setPollingIntervalId(null);

            setVideoUrl(url);
            setGenerationState('done');

            // Save Asset to Project Manifest
            const newAssetData: Omit<VideoAsset, 'id' | 'projectId' | 'creationDate' | 'lastAccessed'> = {
                assetType: 'video',
                url: url,
                prompt: generatedPrompt,
                settings: generationSettings,
                generationMode,
                storyboard: generatedStoryboard,
                isFavorite: false,
                costCredits: costCredits,
            };

            const newAsset = await mockApi.addAssetToProject(currentProject.id, newAssetData);
            dispatch({ type: 'ADD_ASSET', payload: { projectId: currentProject.id, asset: newAsset } });
            
            // Update Quota
            handleUpdateConfig({ aiQuotaRemaining: Math.max(0, appState.config.aiQuotaRemaining - costCredits) });

        } catch (err: any) {
            console.error("Generation Pipeline Interrupted:", err);
            setError(String(err?.message || 'A critical error halted the generation pipeline.'));
            setGenerationState('error');
            if (pollingIntervalId) {
                clearInterval(pollingIntervalId);
                setPollingIntervalId(null);
            }
        }
    };

    // --- Render Logic ---
    if (appState.isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
                <div className="text-center text-white">
                    <div className="animate-pulse text-3xl mb-2">Initializing Sovereign Compute Layer...</div>
                    <p className="text-cyan-400">Establishing secure connection to GenAI Fabric.</p>
                </div>
            </div>
        );
    }

    if (!appState.config.apiKey) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
                <div className="max-w-lg w-full bg-gray-800 p-10 rounded-xl shadow-2xl border border-red-700/50">
                    <h2 className="text-3xl font-extrabold text-red-400 mb-4">ACCESS DENIED: Authentication Required</h2>
                    <p className="text-gray-300 mb-6">The AI Core requires a valid API key for resource allocation and computation. Input your credentials below to proceed.</p>
                    {/* WARNING: This API key input and local storage mechanism is INSECURE for production.
                        It is included for MVP demonstration purposes only.
                        A production application must use a secure backend for API key management and
                        user authentication via robust protocols like OAuth2/OIDC.
                        Sensitive data like API keys should never be exposed client-side. */}
                    <div className="space-y-4">
                        <input
                            ref={apiKeyInputRef}
                            type="password"
                            placeholder="Enter Google GenAI API Key (e.g., AIzaSy...)"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-red-500 focus:border-red-500"
                        />
                        {error && <p className="text-sm text-red-400">{error}</p>}
                        <button onClick={handleApiKeySave} className="w-full py-3 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold transition-colors">
                            Authorize Compute Access
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 text-center">
                        For production, API keys will be managed securely server-side. This local input is for development.
                    </p>
                </div>
            </div>
        );
    }
    
    // --- Main Application View ---
    return (
        <div className="flex h-screen overflow-hidden bg-gray-950 text-white">
            {/* Sidebar */}
            <ProjectSidebar 
                projects={appState.projects}
                currentProjectId={appState.currentProjectId}
                onSelectProject={id => dispatch({ type: 'SET_CURRENT_PROJECT', payload: id })}
                onCreateProject={handleCreateProject}
                onDeleteProject={handleDeleteProject}
                onRenameProject={handleRenameProject}
            />
            
            {/* Main Content Area */}
            <main className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                
                {/* Header Bar */}
                <header className="flex justify-between items-center pb-4 border-b border-gray-800 sticky top-0 bg-gray-950 z-10">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tighter text-white">AI Video Synthesis Platform</h1>
                        <p className="text-sm text-gray-400">Current Context: {currentProject?.name || "System Initialization"}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-cyan-400">Quota Remaining: {appState.config.aiQuotaRemaining.toLocaleString()}</p>
                        <button onClick={() => handleUpdateConfig({ apiKey: null })} className="text-xs text-red-400 hover:text-red-300 mt-1">Revoke API Key (Local)</button>
                    </div>
                </header>

                {currentProject ? (
                <>
                {/* Generation Panel */}
                <Card title={`Generation Module: ${currentProject.name}`} className="bg-gray-900/70 border-l-4 border-cyan-500 shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Column 1: Mode & Controls */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="flex bg-gray-800 rounded-lg p-1 shadow-inner">
                                <button onClick={() => setGenerationMode('single_prompt')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${generationMode === 'single_prompt' ? 'bg-cyan-600 shadow-md' : 'text-gray-300 hover:bg-gray-700'}`}>Single Prompt</button>
                                <button onClick={() => setGenerationMode('storyboard_sequence')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${generationMode === 'storyboard_sequence' ? 'bg-cyan-600 shadow-md' : 'text-gray-300 hover:bg-gray-700'}`}>Storyboard Sequence</button>
                                {/* Future Module: <button onClick={() => setGenerationMode('ai_script_to_video')} disabled className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${generationMode === 'ai_script_to_video' ? 'bg-cyan-600 shadow-md' : 'text-gray-300 hover:bg-gray-700 disabled:opacity-50'}`}>AI Script (Future)</button> */}
                            </div>
                            
                            <GenerationControls 
                                settings={generationSettings} 
                                onSettingsChange={ (partial) => setGenerationSettings(s => ({...s, ...partial}))} 
                                isGenerating={isGenerating} 
                                aiQuota={appState.config.aiQuotaRemaining}
                            />
                        </div>
                        
                        {/* Column 2: Prompt Input */}
                        <div className="lg:col-span-2 space-y-4">
                            <Card title={generationMode === 'single_prompt' ? "Primary Prompt Input (Max 500 Chars)" : "Project AI Summary"} className="h-full">
                                {generationMode === 'single_prompt' ? (
                                    <textarea 
                                        value={prompt} 
                                        onChange={e => setPrompt(e.target.value)} 
                                        placeholder="Describe the scene, style, and required action with high detail..." 
                                        maxLength={500}
                                        className="w-full h-40 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-cyan-500 resize-none" 
                                    />
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-sm text-gray-400 italic">
                                            {currentProject.aiSummary || "Click 'Synthesize Director Notes' below to generate a narrative summary based on your storyboard."}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            (This summary is stored as the project's high-level objective and provides explainability.)
                                        </p>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                    
                    {/* Storyboard Editor (Conditional) */}
                    {generationMode === 'storyboard_sequence' && (
                        <div className="mt-6">
                            <StoryboardEditor 
                                scenes={scenes} 
                                setScenes={setScenes} 
                                isGenerating={isGenerating} 
                                onGenerateDirectorSummary={handleGenerateDirectorSummary}
                                onScenePromptChange={(id, p) => setScenes(prev => prev.map(s => s.id === id ? {...s, prompt: p} : s))}
                                onSceneNotesChange={(id, n) => setScenes(prev => prev.map(s => s.id === id ? {...s, aiDirectorNotes: n} : s))}
                                onSceneDurationChange={(id, d) => setScenes(prev => prev.map(s => s.id === id ? {...s, duration: d} : s))}
                                onUpdateProjectSummary={handleUpdateProjectSummary}
                                currentProjectId={currentProject.id}
                            />
                        </div>
                    )}
                    
                    {/* Execution Button */}
                    <div className="mt-6 pt-4 border-t border-gray-800 flex justify-center">
                        <button 
                            onClick={handleGenerate} 
                            disabled={isGenerating || (generationMode === 'single_prompt' && !prompt.trim()) || (generationMode === 'storyboard_sequence' && scenes.some(s => !s.prompt.trim()))} 
                            className="w-1/2 py-3 text-lg font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-lg transition-all disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-[1.01]"
                        >
                            {generationState === 'polling' ? (
                                <div className="flex items-center justify-center space-x-3">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Processing... ({POLLING_MESSAGES[pollingMessageIndex]})</span>
                                </div>
                            ) : generationState === 'generating' ? (
                                <span>Initiating Compute Sequence...</span>
                            ) : (
                                <span>Execute Generation Run</span>
                            )}
                        </button>
                    </div>
                    {error && (
                        <div className="mt-4 p-3 bg-red-900/50 border border-red-600 rounded-lg text-sm text-red-300">
                            ERROR: {error}
                        </div>
                    )}
                </Card>
                
                {/* Video Preview Area */}
                <Card title="Real-Time Preview & Output" className="bg-gray-900/70 border-l-4 border-gray-500 shadow-xl">
                    <div className={`mx-auto max-h-[60vh] w-full bg-black rounded-xl flex items-center justify-center border border-gray-700 overflow-hidden`}>
                        {generationState === 'done' && videoUrl ? (
                            <video src={videoUrl} controls autoPlay muted loop className="w-full h-full object-contain rounded-xl" />
                        ) : generationState === 'polling' || generationState === 'generating' ? (
                            <div className="text-center p-12">
                                <div className="relative w-20 h-20 mx-auto mb-4">
                                    <div className="absolute inset-0 border-8 border-cyan-500/20 rounded-full"></div>
                                    <div className="absolute inset-2 border-8 border-t-cyan-500 border-transparent rounded-full animate-spin"></div>
                                </div>
                                <p className="text-xl font-semibold text-cyan-300">Rendering Frame Sequence...</p>
                                <p className="text-sm text-gray-400 mt-1">{POLLING_MESSAGES[pollingMessageIndex]}</p>
                            </div>
                        ) : error ? (
                             <p className="text-red-400 p-8 text-center text-lg">Generation Failed. Review error log above.</p>
                        ) : (
                             <p className="text-gray-600 p-12 text-lg">Output Preview Window. Awaiting first successful generation.</p>
                        )}
                    </div>
                </Card>
                
                {/* Asset Library */}
                <Card title={`Asset Repository (${currentProjectAssets.length} Items)`} className="bg-gray-900/70 border-l-4 border-yellow-500 shadow-xl">
                    <AssetGrid 
                        assets={currentProjectAssets}
                        onDelete={handleDeleteAsset}
                        onToggleFavorite={handleToggleFavorite}
                        onSelect={handleAssetSelect}
                    />
                </Card>
                </>
                ) : (
                    <div className="flex items-center justify-center h-[70vh] bg-gray-900/50 rounded-xl border border-dashed border-gray-700">
                        <div className="text-center p-10">
                            <p className="text-2xl font-semibold text-gray-400 mb-3">No Active Project Context</p>
                            <p className="text-gray-500">Use the Project Nexus sidebar to create a new campaign or select an existing one.</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Asset Detail Modal (Enhanced) */}
            {selectedAsset && (
                 <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm" onClick={() => setSelectedAsset(null)}>
                    <div className="bg-gray-800 rounded-xl max-w-5xl w-[90%] md:w-[80%] p-6 space-y-6 shadow-3xl border border-cyan-600/50" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                            <h3 className="text-2xl font-bold text-white">Asset Manifest Viewer: {selectedAsset.id.substring(0, 12)}</h3>
                            <button onClick={() => setSelectedAsset(null)} className="text-gray-400 hover:text-white text-2xl p-1">✕</button>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Video/Preview Area */}
                            <div className="lg:col-span-2 space-y-3">
                                <div className={`aspect-video bg-black rounded-lg border border-gray-600 overflow-hidden`}>
                                    <video src={selectedAsset.url} controls autoPlay loop muted className="w-full h-full object-contain"></video>
                                </div>
                                <p className="text-sm text-gray-400 italic">Asset Type: {selectedAsset.assetType}</p>
                            </div>
                            
                            {/* Metadata Column */}
                            <div className="lg:col-span-1 text-sm space-y-3 bg-gray-700/30 p-4 rounded-lg">
                                <h4 className="font-bold text-cyan-300 border-b border-gray-600 pb-1 mb-2">Generation Metadata</h4>
                                <p><strong>Created:</strong> {formatDate(selectedAsset.creationDate)}</p>
                                <p><strong>Last Accessed:</strong> {formatDate(selectedAsset.lastAccessed)}</p>
                                <p><strong>Estimated Cost:</strong> <span className="text-yellow-300">{selectedAsset.costCredits} Credits</span></p>
                                <p><strong>Favorite:</strong> {selectedAsset.isFavorite ? 'Yes' : 'No'}</p>
                                
                                <h4 className="font-bold text-cyan-300 border-b border-gray-600 pb-1 mt-4 mb-2">Settings Snapshot</h4>
                                <p><strong>Model:</strong> {selectedAsset.settings.model}</p>
                                <p><strong>Ratio:</strong> {selectedAsset.settings.aspectRatio}</p>
                                <p><strong>Style Strength:</strong> {selectedAsset.settings.stylizationStrength}%</p>
                                <p><strong>Motion:</strong> {selectedAsset.settings.motionControl}</p>
                                
                                {selectedAsset.generationMode === 'storyboard_sequence' && selectedAsset.storyboard && (
                                    <>
                                        <h4 className="font-bold text-cyan-300 border-b border-gray-600 pb-1 mt-4 mb-2">Storyboard Breakdown ({selectedAsset.storyboard.length} Scenes)</h4>
                                        <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                                            {selectedAsset.storyboard.map((scene, i) => (
                                                <p key={scene.id} className="text-xs bg-gray-800 p-1 rounded truncate">
                                                    {i+1}. ({scene.duration}s) {scene.prompt.substring(0, 40)}...
                                                </p>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                            <a href={selectedAsset.url} download={`ad_asset_${selectedAsset.id}.mp4`} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium">Download Raw Asset</a>
                            <button onClick={() => {
                                handleToggleFavorite(selectedAsset.id);
                                setSelectedAsset(s => s ? {...s, isFavorite: !s.isFavorite} : null);
                            }} className={`py-2 px-4 rounded-lg font-medium transition-colors ${selectedAsset.isFavorite ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-500 hover:bg-gray-400'} text-white`}>
                                {selectedAsset.isFavorite ? 'Unmark Favorite' : 'Mark as Favorite'}
                            </button>
                            <button onClick={() => {
                                if(window.confirm("Permanently delete this asset? This action cannot be undone.")) {
                                    handleDeleteAsset(selectedAsset.id);
                                    setSelectedAsset(null);
                                }
                            }} className="py-2 px-4 bg-red-700 hover:bg-red-600 text-white rounded-lg font-medium">Delete Asset</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAdStudioView;