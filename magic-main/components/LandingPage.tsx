import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
Book, Users, Globe, Shield, Activity, Brain,
ArrowRight, Star, Heart, CheckCircle, Lock,
ChevronRight, GraduationCap, Building, Radio, Cpu,
Infinity, Library
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from './Card';

// --- Types ---
type Tab = 'MISSION' | 'ACADEMY' | 'PLATFORM' | 'MANIFESTO';

const LandingPage: React.FC<{ onLoginClick?: () => void }> = ({ onLoginClick }) => {
const navigate = useNavigate();
const { isAuthenticated, isLoading } = useAuth();
const [activeTab, setActiveTab] = useState<Tab>('MISSION');

// Redirect if logged in
useEffect(() => {
    if (!isLoading && isAuthenticated) {
        navigate('/dashboard');
    }
}, [isAuthenticated, isLoading, navigate]);

const handleJoin = () => onLoginClick ? onLoginClick() : navigate('/login');

// --- Custom Components ---

// 1. Futuristic Loading Screen
if (isLoading) {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
             {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse"></div>
            
            <div className="z-10 flex flex-col items-center gap-6 p-8 border border-gray-800 bg-gray-900/50 backdrop-blur-md rounded-2xl">
                <Radio className="w-16 h-16 text-cyan-400 animate-bounce" />
                <div className="space-y-2 text-center">
                    <p className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">VERIFYING SECURE LINK...</p>
                    <p className="text-gray-500 text-xs">CITIBANK DEMO BUSINESS INC</p>
                </div>
            </div>
        </div>
    );
}

// 2. Tab Navigation Item
const NavTab = ({ id, label, icon: Icon }: { id: Tab, label: string, icon: any }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`group relative flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
            activeTab === id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
        }`}
    >
        <span className={`absolute inset-0 bg-white/5 rounded-lg scale-0 transition-transform ${activeTab === id ? 'scale-100' : 'group-hover:scale-100'}`}></span>
        <Icon size={16} className={activeTab === id ? 'text-cyan-400' : ''} />
        {label}
        {activeTab === id && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_0_10px_cyan]"></span>}
    </button>
);

const renderContent = () => {
    switch(activeTab) {
        case 'MISSION':
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="space-y-8 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-900/10 text-cyan-400 text-xs font-mono mb-4">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            527 POLITICAL ORGANIZATION // ACTIVE
                        </div>

                        <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 leading-[0.9]">
                            CITIBANK<br/>
                            <span className="text-cyan-400 text-6xl">DEMO BUSINESS</span><br/>
                            INC.
                        </h2>
                        
                        <div className="prose prose-invert border-l-2 border-indigo-500 pl-6">
                            <p className="text-xl text-white font-bold leading-tight">
                                We are here to shape policy and advocate for quantum advances in healthcare and AI banking in world commerce.
                            </p>
                            <p className="text-gray-400 pt-4">
                                As a technology-driven company operating at the forefront of innovation, we made the world's first autonomous demo bank. This is the demo for the 527 shaping policy through truth.
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button onClick={handleJoin} className="group relative px-8 py-4 bg-white text-black font-black rounded-sm uppercase tracking-widest overflow-hidden hover:scale-[1.02] transition-transform">
                                <span className="relative z-10 flex items-center gap-3">
                                    Access Demo Bank <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </button>
                            
                            <button onClick={() => setActiveTab('MANIFESTO')} className="px-8 py-4 border border-gray-700 hover:border-cyan-500 text-gray-300 font-bold rounded-sm uppercase tracking-widest transition-colors flex items-center gap-2 bg-black/50 backdrop-blur-sm">
                                <Book size={20} /> The Policy
                            </button>
                        </div>
                    </div>

                    <div className="relative group perspective-1000">
                        {/* Glow Behind */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/30 to-indigo-600/30 blur-[60px] rounded-full animate-pulse"></div>
                        
                        <div className="relative bg-gray-950/80 backdrop-blur-xl border border-gray-700/50 p-8 shadow-2xl overflow-hidden hover:border-cyan-500/50 transition-colors rounded-2xl">
                             {/* Decorative Grid Lines */}
                            <div className="absolute top-0 right-0 p-6 opacity-20"><Globe size={120} /></div>
                            
                            <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <Activity className="text-cyan-500" /> 
                                    <span className="text-xs font-mono text-cyan-500">SYSTEM STATUS: OPTIMAL</span>
                                </div>
                                <Shield size={18} className="text-gray-500" />
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="p-4 bg-gray-900/50 border-l-2 border-cyan-500 rounded-r-lg hover:translate-x-2 transition-transform cursor-default">
                                    <h4 className="font-bold text-white flex items-center gap-2"><GraduationCap size={16} className="text-cyan-400"/> Quantum Healthcare Advocacy</h4>
                                    <p className="text-xs text-gray-400 mt-1">Pushing the boundaries of medical science through policy.</p>
                                </div>
                                <div className="p-4 bg-gray-900/50 border-l-2 border-purple-500 rounded-r-lg hover:translate-x-2 transition-transform cursor-default">
                                    <h4 className="font-bold text-white flex items-center gap-2"><Users size={16} className="text-purple-400"/> AI Banking</h4>
                                    <p className="text-xs text-gray-400 mt-1">The first autonomous bank architecture for world commerce.</p>
                                </div>
                                <div className="p-4 bg-gray-900/50 border-l-2 border-green-500 rounded-r-lg hover:translate-x-2 transition-transform cursor-default">
                                    <h4 className="font-bold text-white flex items-center gap-2"><Infinity size={16} className="text-green-400"/> Truth In Policy</h4>
                                    <p className="text-xs text-gray-400 mt-1">Enhancing user experiences through advanced data analysis.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'ACADEMY':
            return (
                <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <div className="flex justify-center"><Library size={48} className="text-cyan-500/50" /></div>
                        <h2 className="text-4xl font-bold text-white">The Foundation Academy</h2>
                        <p className="text-gray-400 text-lg">Optimizing engagement through deep data analysis.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: "Protocol 527", desc: "The framework of political organization.", icon: Book, color: "text-blue-400", border: "hover:border-blue-500" },
                            { title: "Quantum Health", desc: "Advocating for next-gen medical policy.", icon: Heart, color: "text-purple-400", border: "hover:border-purple-500" },
                            { title: "AI Banking Logic", desc: "Building the autonomous financial web.", icon: Building, color: "text-red-400", border: "hover:border-red-500" },
                        ].map((course, i) => (
                            <Card key={i} className={`bg-gray-900/50 border-gray-800 ${course.border} transition-all duration-300 hover:-translate-y-2`}>
                                <div className="p-6 space-y-4">
                                    <div className={`w-12 h-12 rounded-full bg-gray-950 flex items-center justify-center border border-gray-800 ${course.color} shadow-lg shadow-${course.color}/10`}>
                                        <course.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                                        <p className="text-sm text-gray-400">{course.desc}</p>
                                    </div>
                                    <div className="pt-4 flex items-center text-xs font-mono uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">
                                        Archive Access <ChevronRight size={14} className="ml-2" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            );
        case 'PLATFORM':
            return (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="text-center">
                        <h2 className="text-4xl font-bold text-white mb-4">Innovation at the Forefront</h2>
                        <p className="text-gray-400">Targeting clients seeking to leverage advanced technology solutions.</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Feature 1 */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-1">
                            <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                            <div className="bg-gray-950 rounded-xl p-8 h-full relative z-10 group hover:bg-gray-900 transition-colors">
                                <Activity size={40} className="text-cyan-500 mb-6" />
                                <h3 className="text-2xl font-bold text-white mb-2">Autonomous Demo Bank</h3>
                                <p className="text-gray-400 mb-6">A range of cutting-edge services aimed at enhancing user experiences.</p>
                                <ul className="space-y-3">
                                    {['Real-time optimization', 'Advanced data analysis', 'Secure Traffic Flow'].map((item,i) =>(
                                        <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                            <CheckCircle size={16} className="text-green-500" /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-1">
                            <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                            <div className="bg-gray-950 rounded-xl p-8 h-full relative z-10 group hover:bg-gray-900 transition-colors">
                                <Brain size={40} className="text-purple-500 mb-6" />
                                <h3 className="text-2xl font-bold text-white mb-2">Policy Shaper AI</h3>
                                <p className="text-gray-400 mb-6">Your personal advisor for shaping policy through truth.</p>
                                <ul className="space-y-3">
                                    {['Quantum Healthcare Research', 'Opportunity Scanning', 'Narrative Verification'].map((item,i) =>(
                                        <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                            <CheckCircle size={16} className="text-purple-500" /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'MANIFESTO':
            return (
                <div className="max-w-4xl mx-auto bg-black border border-gray-800 rounded-none p-12 animate-in fade-in duration-700 relative shadow-2xl shadow-cyan-900/20">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500 animate-pulse"></div>
                     <Star className="w-12 h-12 text-yellow-500 mb-8 mx-auto" fill="currentColor" />
                     <h2 className="text-4xl font-extrabold text-white mb-10 text-center uppercase tracking-widest border-b border-gray-800 pb-8">The Foundation Mandate</h2>
                     <div className="space-y-6 text-lg text-gray-300 font-light leading-relaxed">
                         <p>
                             Citibank Demo Business Inc is a <span className="text-cyan-400 font-bold">527 Political Organization</span>. Our mission is not merely financial; it is cognitive.
                         </p>
                         <p>
                             We are technology-driven, operating at the forefront of innovation. We provide cutting-edge services to advocate for <span className="text-white">quantum advances in healthcare</span> and AI banking in world commerce.
                         </p>
                         <p>
                             This platform serves as the autonomous demo for the 527, shaping policy through truth and building a legacy that transcends individual wealth.
                         </p>
                         <div className="mt-12 p-8 bg-gray-900/80 border-l-4 border-cyan-500 italic text-cyan-200 text-center text-xl font-serif">
                             "We shape the future by optimizing the present." <br/>
                             <span className="text-sm not-italic text-gray-500 mt-2 block">— The Architect</span>
                         </div>
                     </div>
                </div>
            );
    }
};

return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden relative">
        
        {/* Animated Background Mesh */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black"></div>
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100"></div>
        </div>

        {/* Navbar */}
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-gray-950/70 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                <div className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                        <Infinity size={24} className="text-white"/>
                    </div>
                    <span className="font-bold tracking-[0.2em] text-sm md:text-lg">CITIBANKDEMO<span className="text-cyan-400">.BUSINESSINC</span></span>
                </div>
                
                <div className="hidden md:flex gap-1 items-center bg-white/5 rounded-full p-1 border border-white/10">
                    <NavTab id="MISSION" label="Mission" icon={Globe} />
                    <NavTab id="ACADEMY" label="Academy" icon={Library} />
                    <NavTab id="PLATFORM" label="Platform" icon={Activity} />
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={handleJoin} className="text-sm font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest hidden md:block">
                        Login
                    </button>
                    <button onClick={handleJoin} className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] flex items-center gap-2">
                        Join <Lock size={12}/>
                    </button>
                </div>
            </div>
        </nav>

        {/* Main Content */}
        <main className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen flex flex-col justify-center z-10">
            {renderContent()}
        </main>

        {/* Footer */}
        <footer className="relative border-t border-gray-900 bg-black/80 backdrop-blur-md py-16 px-6 z-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-cyan-500 mb-2">
                         <Radio size={16} className="animate-pulse"/> <span className="font-mono text-xs">527 ORGANIZATION // BROADCASTING</span>
                    </div>
                    <h4 className="text-lg font-bold text-white leading-relaxed">
                        Citibank Demo Business Inc is a technology-driven company operating at the forefront of innovation.
                    </h4>
                    <p className="text-sm text-gray-400">
                        We target a broad spectrum of businesses seeking advanced tech, optimizing website traffic, and engaging users through deep data analysis.
                    </p>
                </div>
                
                {['Network', 'Resources'].map((head, i) => (
                    <div key={i}>
                        <h5 className="font-bold text-white mb-6 uppercase tracking-widest border-b border-gray-800 pb-2 inline-block">{head}</h5>
                        <ul className="space-y-3 text-sm text-gray-500 font-mono">
                            <li className="hover:text-cyan-400 cursor-pointer transition-colors flex items-center gap-2"><ChevronRight size={10}/> Login Protocol</li>
                            <li className="hover:text-cyan-400 cursor-pointer transition-colors flex items-center gap-2"><ChevronRight size={10}/> Academy Access</li>
                            <li className="hover:text-cyan-400 cursor-pointer transition-colors flex items-center gap-2"><ChevronRight size={10}/> Status</li>
                        </ul>
                    </div>
                ))}
            </div>
            
            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-900 text-center">
                 <Heart className="w-4 h-4 mx-auto text-red-900 mb-4 animate-pulse" />
                <p className="text-[10px] text-gray-700 font-mono uppercase tracking-tight leading-relaxed max-w-2xl mx-auto">
                    COPYRIGHT © 1993-2026 JAMES BURVEL OCALLAGHAN III DBA CITIBANK DEMO BUSINESS DBA 2021-2026 CITIBANK DEMO BUSINESS INC 2023-2026 
                    THE INFINITE INTELLIGENCE FOUNDATION 2023-2026 in general partenership with U 2023-2026
                </p>
            </div>
        </footer>
    </div>
);
};
export default LandingPage;
