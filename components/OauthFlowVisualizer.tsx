import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  ArrowRight, 
  Lock, 
  User, 
  Server, 
  Database, 
  Code, 
  CheckCircle2, 
  Terminal, 
  Info, 
  HelpCircle, 
  ChevronRight, 
  ShieldAlert, 
  Key, 
  Globe, 
  RefreshCw,
  Layers,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

// --- TYPES & INTERFACES ---
type ActorId = 'user_agent' | 'client_app' | 'auth_server' | 'resource_server';

interface Actor {
  id: ActorId;
  name: string;
  role: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

interface FlowStep {
  id: number;
  key: string;
  title: string;
  sender: ActorId;
  receiver: ActorId;
  label: string;
  direction: 'forward' | 'backward';
  description: string;
  technicalDetails: string;
  requestSnippet?: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
  };
  responseSnippet?: {
    status: string;
    headers: Record<string, string>;
    body?: string;
  };
}

// --- CONSTANTS & DATA ---
const ACTORS: Actor[] = [
  {
    id: 'user_agent',
    name: 'User Agent (Browser)',
    role: 'Resource Owner / Browser',
    icon: User,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'The user interacting with the browser to grant access to their protected resources.'
  },
  {
    id: 'client_app',
    name: 'Client Application',
    role: 'Third-Party App (Your Server)',
    icon: Globe,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    description: 'The application requesting access to the user\'s account on the resource server.'
  },
  {
    id: 'auth_server',
    name: 'Authorization Server',
    role: 'Identity Provider (IdP)',
    icon: Server,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    description: 'Authenticates the user, obtains authorization, and issues access tokens to the client.'
  },
  {
    id: 'resource_server',
    name: 'Resource Server',
    role: 'API Gateway / Database',
    icon: Database,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    description: 'Hosts the protected user data and accepts access tokens to authorize requests.'
  }
];

const FLOW_STEPS: FlowStep[] = [
  {
    id: 1,
    key: 'initiate',
    title: '1. Initiate Authorization',
    sender: 'user_agent',
    receiver: 'client_app',
    label: 'Click "Login with OAuth"',
    direction: 'forward',
    description: 'The user clicks the login button in the client application, initiating the OAuth flow.',
    technicalDetails: 'The client application prepares to redirect the user to the Authorization Server with specific query parameters to request access.',
    requestSnippet: {
      method: 'GET',
      url: 'https://my-awesome-app.com/login',
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      }
    }
  },
  {
    id: 2,
    key: 'redirect_auth',
    title: '2. Redirect to Auth Server',
    sender: 'client_app',
    receiver: 'user_agent',
    label: '302 Redirect to Auth URL',
    direction: 'backward',
    description: 'The client redirects the user\'s browser to the Authorization Server with client_id, redirect_uri, scope, and state.',
    technicalDetails: 'The "state" parameter is a random string used to prevent Cross-Site Request Forgery (CSRF) attacks.',
    responseSnippet: {
      status: '302 Found',
      headers: {
        'Location': 'https://auth.provider.com/oauth/authorize?response_type=code&client_id=client_abc123&redirect_uri=https://my-awesome-app.com/callback&scope=read:profile%20read:email&state=secure_random_state_xyz789',
        'Cache-Control': 'no-store'
      }
    }
  },
  {
    id: 3,
    key: 'user_consent',
    title: '3. User Consent & Login',
    sender: 'user_agent',
    receiver: 'auth_server',
    label: 'Authenticate & Grant Access',
    direction: 'forward',
    description: 'The user logs into the Authorization Server (if not already logged in) and approves the requested permissions (scopes).',
    technicalDetails: 'The Authorization Server authenticates the user directly. The client application never sees the user\'s credentials (password).',
    requestSnippet: {
      method: 'POST',
      url: 'https://auth.provider.com/login/consent',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'session_id=auth_session_998877'
      },
      body: 'approve=true&scopes[]=read:profile&scopes[]=read:email&csrf_token=token_abc'
    }
  },
  {
    id: 4,
    key: 'auth_code_redirect',
    title: '4. Redirect with Auth Code',
    sender: 'auth_server',
    receiver: 'user_agent',
    label: '302 Redirect with Code & State',
    direction: 'backward',
    description: 'The Authorization Server redirects the browser back to the client\'s redirect_uri, appending a temporary authorization code and the state.',
    technicalDetails: 'The authorization code is short-lived (usually 1-10 minutes) and can only be used once to prevent interception risks.',
    responseSnippet: {
      status: '302 Found',
      headers: {
        'Location': 'https://my-awesome-app.com/callback?code=auth_code_temp_987654321&state=secure_random_state_xyz789',
        'Cache-Control': 'no-store'
      }
    }
  },
  {
    id: 5,
    key: 'token_exchange',
    title: '5. Exchange Code for Token',
    sender: 'client_app',
    receiver: 'auth_server',
    label: 'POST /oauth/token (Code + Secret)',
    direction: 'forward',
    description: 'The client application sends a secure back-channel POST request to exchange the authorization code for an access token.',
    technicalDetails: 'This request happens server-to-server. The client includes its client_secret, which must never be exposed to the browser.',
    requestSnippet: {
      method: 'POST',
      url: 'https://auth.provider.com/oauth/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: 'grant_type=authorization_code&code=auth_code_temp_987654321&redirect_uri=https://my-awesome-app.com/callback&client_id=client_abc123&client_secret=super_secret_client_key_456'
    },
    responseSnippet: {
      status: '200 OK',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({
        access_token: 'at_secure_access_token_abc123xyz',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'rt_secure_refresh_token_789qwe',
        scope: 'read:profile read:email'
      }, null, 2)
    }
  },
  {
    id: 6,
    key: 'api_request',
    title: '6. Request Protected Resource',
    sender: 'client_app',
    receiver: 'resource_server',
    label: 'GET /api/user (Bearer Token)',
    direction: 'forward',
    description: 'The client application requests the user\'s profile data from the Resource Server, presenting the access token in the Authorization header.',
    technicalDetails: 'The token is sent as a Bearer token. The Resource Server will validate this token before returning any data.',
    requestSnippet: {
      method: 'GET',
      url: 'https://api.provider.com/v1/user/profile',
      headers: {
        'Authorization': 'Bearer at_secure_access_token_abc123xyz',
        'Accept': 'application/json'
      }
    }
  },
  {
    id: 7,
    key: 'api_response',
    title: '7. Return Protected Resource',
    sender: 'resource_server',
    receiver: 'client_app',
    label: '200 OK with User Data',
    direction: 'backward',
    description: 'The Resource Server validates the token and returns the requested user profile data to the client application.',
    technicalDetails: 'If the token is expired or invalid, the Resource Server would return a 401 Unauthorized status.',
    responseSnippet: {
      status: '200 OK',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: JSON.stringify({
        id: 'usr_998877',
        name: 'Alex Morgan',
        email: 'alex.morgan@example.com',
        avatar_url: 'https://api.provider.com/avatars/alex.jpg',
        email_verified: true
      }, null, 2)
    }
  }
];

export default function OauthFlowVisualizer() {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1); // -1 means idle
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(3000); // ms per step
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'request' | 'response'>('request');
  const [simulatedConsole, setSimulatedConsole] = useState<string[]>([
    'System: OAuth 2.0 Simulator Initialized.',
    'System: Ready to start 3-Legged Authorization Code Flow.'
  ]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const consoleEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll console to bottom
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [simulatedConsole]);

  // Handle Auto-play logic
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= FLOW_STEPS.length - 1) {
            setIsPlaying(false);
            return prev; // Stop at the end
          }
          const nextIndex = prev + 1;
          logStepToConsole(nextIndex);
          return nextIndex;
        });
      }, playSpeed);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playSpeed]);

  const logStepToConsole = (index: number) => {
    const step = FLOW_STEPS[index];
    if (!step) return;

    const senderName = ACTORS.find(a => a.id === step.sender)?.name || step.sender;
    const receiverName = ACTORS.find(a => a.id === step.receiver)?.name || step.receiver;

    const logsToAdd = [
      `>>> [STEP ${step.id}] ${step.title}`,
      `From: ${senderName} -> To: ${receiverName}`,
      `Action: ${step.label}`
    ];

    if (step.requestSnippet) {
      logsToAdd.push(`HTTP Request: ${step.requestSnippet.method} ${step.requestSnippet.url}`);
    }
    if (step.responseSnippet) {
      logsToAdd.push(`HTTP Response Status: ${step.responseSnippet.status}`);
    }

    setSimulatedConsole(prev => [...prev, ...logsToAdd, '----------------------------------------']);
  };

  const handleNext = () => {
    if (currentStepIndex < FLOW_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      logStepToConsole(nextIndex);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      logStepToConsole(prevIndex);
    } else if (currentStepIndex === 0) {
      setCurrentStepIndex(-1);
      setSimulatedConsole(prev => [...prev, 'System: Reset to initial state.', '----------------------------------------']);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(-1);
    setSimulatedConsole([
      'System: Simulator Reset.',
      'System: Ready to start 3-Legged Authorization Code Flow.'
    ]);
  };

  const handleStepClick = (index: number) => {
    setIsPlaying(false);
    setCurrentStepIndex(index);
    logStepToConsole(index);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const currentStep = currentStepIndex >= 0 ? FLOW_STEPS[currentStepIndex] : null;

  // Helper to check if a connection line is active
  const isLineActive = (sender: ActorId, receiver: ActorId, stepKey: string) => {
    if (!currentStep) return false;
    return currentStep.key === stepKey && currentStep.sender === sender && currentStep.receiver === receiver;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col gap-6 font-sans selection:bg-emerald-500/30">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Interactive Sandbox
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              OAuth 2.0
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            3-Legged OAuth2 Flow Visualizer
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Visualize the secure exchange of authorization codes, client secrets, and access tokens between the User, Client App, Authorization Server, and Resource API.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all duration-200"
              title="Reset Flow"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (currentStepIndex === FLOW_STEPS.length - 1) {
                  setCurrentStepIndex(-1);
                }
                setIsPlaying(!isPlaying);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isPlaying 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
              }`}
            >
              {isPlaying ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  {currentStepIndex === FLOW_STEPS.length - 1 ? 'Restart Auto-Play' : 'Auto-Play'}
                </>
              )}
            </button>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Speed:</span>
            <select
              value={playSpeed}
              onChange={(e) => setPlaySpeed(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value={5000}>Slow (5s)</option>
              <option value={3000}>Medium (3s)</option>
              <option value={1500}>Fast (1.5s)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Diagram (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Actor Cards Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ACTORS.map((actor) => {
              const Icon = actor.icon;
              const isActorActive = currentStep 
                ? currentStep.sender === actor.id || currentStep.receiver === actor.id
                : false;

              return (
                <div 
                  key={actor.id}
                  className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden ${
                    isActorActive 
                      ? `${actor.bgColor} ${actor.borderColor} ring-1 ring-offset-2 ring-offset-slate-950 ring-emerald-500/30 scale-[1.02]` 
                      : 'bg-slate-900/40 border-slate-800/80 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${actor.bgColor} ${actor.color} mb-3`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-100">{actor.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{actor.role}</p>
                  
                  {/* Active Indicator Dot */}
                  {isActorActive && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sequence Flow Diagram */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
            
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Interactive Sequence Flow
                </h3>
                <span className="text-xs text-slate-500">Click any step to jump directly to it</span>
              </div>

              {/* Step Timeline List */}
              <div className="flex flex-col gap-3">
                {FLOW_STEPS.map((step, index) => {
                  const isActive = currentStepIndex === index;
                  const isPast = currentStepIndex > index;
                  const senderActor = ACTORS.find(a => a.id === step.sender);
                  const receiverActor = ACTORS.find(a => a.id === step.receiver);

                  return (
                    <button
                      key={step.id}
                      onClick={() => handleStepClick(index)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isActive 
                          ? 'bg-slate-800/90 border-emerald-500/50 shadow-lg shadow-emerald-950/20 translate-x-1' 
                          : isPast
                            ? 'bg-slate-900/60 border-slate-800/60 opacity-80 hover:opacity-100'
                            : 'bg-slate-950/40 border-slate-900/80 opacity-40 hover:opacity-80'
                      }`}
                    >
                      {/* Left: Step Number & Title */}
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isActive 
                            ? 'bg-emerald-500 text-slate-950' 
                            : isPast 
                              ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}>
                          {isPast ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                        </div>
                        <div>
                          <h4 className={`font-semibold text-sm ${isActive ? 'text-emerald-400' : 'text-slate-200'}`}>
                            {step.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 md:line-clamp-none">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Right: Visual Flow Indicator */}
                      <div className="flex items-center gap-2 shrink-0 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/60 text-xs">
                        <span className={`font-medium ${senderActor?.color}`}>
                          {senderActor?.name.split(' ')[0]}
                        </span>
                        <ArrowRight className={`w-3 h-3 text-slate-500 ${isActive ? 'animate-pulse text-emerald-400' : ''}`} />
                        <span className={`font-medium ${receiverActor?.color}`}>
                          {receiverActor?.name.split(' ')[0]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step Detail Card */}
          {currentStep ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Active Step Details</span>
                    <h3 className="text-xl font-bold text-slate-100 mt-1">{currentStep.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700 text-xs text-slate-300">
                    <Info className="w-3.5 h-3.5 text-emerald-400" />
                    Interactive Guide
                  </div>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed">
                  {currentStep.description}
                </p>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-blue-400" />
                    Under the Hood (Technical Context)
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {currentStep.technicalDetails}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
              <div className="p-4 rounded-full bg-slate-900 text-slate-500">
                <Play className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-300">Simulator is Idle</h3>
              <p className="text-xs text-slate-500 max-w-md">
                Click "Auto-Play" or select the first step above to begin simulating the 3-Legged OAuth2 Authorization Code Flow.
              </p>
              <button
                onClick={() => handleStepClick(0)}
                className="mt-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all duration-200"
              >
                Start Flow
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Console & Code Snippets (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Step Navigation Controls */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xl">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex < 0}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all duration-200"
            >
              Back
            </button>
            <div className="text-xs text-slate-400 font-mono shrink-0">
              {currentStepIndex >= 0 ? `${currentStepIndex + 1} / ${FLOW_STEPS.length}` : '0 / 7'}
            </div>
            <button
              onClick={handleNext}
              disabled={currentStepIndex === FLOW_STEPS.length - 1}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-xs font-semibold transition-all duration-200"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Live HTTP Inspector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[420px]">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">HTTP Inspector</span>
              </div>
              {currentStep && (
                <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                  {currentStep.requestSnippet && (
                    <button
                      onClick={() => setActiveTab('request')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all duration-150 ${
                        activeTab === 'request' 
                          ? 'bg-slate-800 text-emerald-400' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Request
                    </button>
                  )}
                  {currentStep.responseSnippet && (
                    <button
                      onClick={() => setActiveTab('response')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all duration-150 ${
                        activeTab === 'response' 
                          ? 'bg-slate-800 text-emerald-400' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Response
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs bg-slate-950/40 flex flex-col gap-3">
              {currentStep ? (
                <>
                  {activeTab === 'request' && currentStep.requestSnippet && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">HTTP Request</span>
                        <button
                          onClick={() => copyToClipboard(
                            `${currentStep.requestSnippet?.method} ${currentStep.requestSnippet?.url}\n` +
                            Object.entries(currentStep.requestSnippet?.headers || {}).map(([k, v]) => `${k}: ${v}`).join('\n') +
                            (currentStep.requestSnippet?.body ? `\n\n${currentStep.requestSnippet.body}` : ''),
                            'req'
                          )}
                          className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-800 transition-all"
                          title="Copy Request"
                        >
                          {copiedText === 'req' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto">
                        <div className="text-emerald-400 font-bold">
                          {currentStep.requestSnippet.method} <span className="text-slate-300 font-normal break-all">{currentStep.requestSnippet.url}</span>
                        </div>
                        <div className="text-slate-500 mt-2 border-t border-slate-900 pt-2">
                          {Object.entries(currentStep.requestSnippet.headers).map(([key, val]) => (
                            <div key={key} className="break-all">
                              <span className="text-blue-400">{key}:</span> <span className="text-slate-300">{val}</span>
                            </div>
                          ))}
                        </div>
                        {currentStep.requestSnippet.body && (
                          <div className="text-amber-400 mt-3 border-t border-slate-900 pt-2 break-all">
                            {currentStep.requestSnippet.body}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'response' && currentStep.responseSnippet && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">HTTP Response</span>
                        <button
                          onClick={() => copyToClipboard(
                            `HTTP/1.1 ${currentStep.responseSnippet?.status}\n` +
                            Object.entries(currentStep.responseSnippet?.headers || {}).map(([k, v]) => `${k}: ${v}`).join('\n') +
                            (currentStep.responseSnippet?.body ? `\n\n${currentStep.responseSnippet.body}` : ''),
                            'res'
                          )}
                          className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-800 transition-all"
                          title="Copy Response"
                        >
                          {copiedText === 'res' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto">
                        <div className="text-purple-400 font-bold">
                          HTTP/1.1 <span className="text-emerald-400">{currentStep.responseSnippet.status}</span>
                        </div>
                        <div className="text-slate-500 mt-2 border-t border-slate-900 pt-2">
                          {Object.entries(currentStep.responseSnippet.headers).map(([key, val]) => (
                            <div key={key} className="break-all">
                              <span className="text-blue-400">{key}:</span> <span className="text-slate-300">{val}</span>
                            </div>
                          ))}
                        </div>
                        {currentStep.responseSnippet.body && (
                          <div className="text-slate-300 mt-3 border-t border-slate-900 pt-2 whitespace-pre overflow-x-auto">
                            {currentStep.responseSnippet.body}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Fallback if tab is empty for this step */}
                  {((activeTab === 'request' && !currentStep.requestSnippet) || 
                    (activeTab === 'response' && !currentStep.responseSnippet)) && (
                    <div className="text-slate-500 text-center py-8">
                      No {activeTab} payload for this step.
                    </div>
                  )}
                </>
              ) : (
                <div className="text-slate-500 text-center py-12 flex flex-col items-center gap-2">
                  <Terminal className="w-8 h-8 text-slate-700" />
                  <span>Select a step to inspect HTTP payloads</span>
                </div>
              )}
            </div>
          </div>

          {/* Live Console Logs */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[240px]">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Event Log</span>
              </div>
              <button
                onClick={() => setSimulatedConsole(['System: Console cleared.'])}
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] bg-slate-950/20 flex flex-col gap-1.5 text-slate-400">
              {simulatedConsole.map((log, idx) => {
                let colorClass = 'text-slate-400';
                if (log.startsWith('>>>')) colorClass = 'text-emerald-400 font-bold mt-2';
                else if (log.startsWith('System:')) colorClass = 'text-blue-400';
                else if (log.startsWith('HTTP Request:')) colorClass = 'text-amber-400/90';
                else if (log.startsWith('HTTP Response Status:')) colorClass = 'text-purple-400/90';

                return (
                  <div key={idx} className={`${colorClass} break-all`}>
                    {log}
                  </div>
                );
              })}
              <div ref={consoleEndRef} />
            </div>
          </div>

        </div>
      </div>

      {/* Footer / Educational Info */}
      <footer className="mt-auto pt-8 border-t border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-500">
        <div className="flex flex-col gap-2">
          <h4 className="font-bold text-slate-400 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            Why 3-Legged?
          </h4>
          <p className="leading-relaxed">
            It involves three distinct parties: the Resource Owner (User), the Client Application (Your App), and the Authorization Server (Identity Provider). This ensures credentials are never shared with the client.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="font-bold text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Security Best Practices
          </h4>
          <p className="leading-relaxed">
            Always use the <code className="text-slate-300">state</code> parameter to prevent CSRF. Keep your <code className="text-slate-300">client_secret</code> secure on your backend server, never exposing it to the browser or client-side code.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="font-bold text-slate-400 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            Token Exchange
          </h4>
          <p className="leading-relaxed">
            The temporary authorization code is exchanged server-to-server for an access token. This prevents the access token from being exposed in the browser history or redirect URLs.
          </p>
        </div>
      </footer>
    </div>
  );
}