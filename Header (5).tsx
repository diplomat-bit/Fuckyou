
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import { View, Notification } from '../types';

/**
 * @description A futuristic, dynamic widget showing the status of the Gemini Engine.
 * This simulates real-time analysis of market data, sentiment, and algorithmic trading performance.
 */
const GeminiEngineStatus: React.FC = () => {
    const messages = [
        "Gemini: Parsing petabytes of market data...",
        "Gemini: Executing predictive trade models...",
        "Gemini: Optimizing portfolio with multi-modal analysis...",
        "Gemini: All systems hyper-nominal.",
        "Gemini: Calibrating real-time data streams...",
        "Gemini: Compiling multi-dimensional insights..."
    ];
    const sentiments = ["Strong Buy", "Neutral", "Strong Sell", "Hold"];
    const algoStatuses = ["Active", "Throttled", "Calibrating", "Aggressive"];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % messages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [messages.length]);

    const sentiment = sentiments[currentIndex % sentiments.length];
    const algoStatus = algoStatuses[currentIndex % algoStatuses.length];
    const latency = (Math.random() * 0.05 + 0.01).toFixed(3);

    return (
        <div className="hidden xl:flex items-center space-x-4 text-xs text-cyan-300/80 bg-gray-900/50 px-4 py-1.5 rounded-full border border-cyan-500/20 backdrop-blur-sm">
            <div className="flex space-x-1 items-end h-5">
                <span className="w-1.5 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.4s]"></span>
                <span className="w-1.5 h-4 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.2s]"></span>
                <span className="w-1.5 h-5 bg-cyan-400 rounded-full animate-pulse"></span>
                <span className="w-1.5 h-3 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
            </div>
            <span className="font-mono">{messages[currentIndex]}</span>
            <span className="w-px h-4 bg-cyan-500/20"></span>
            <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${sentiment === 'Strong Buy' ? 'bg-green-400' : sentiment === 'Strong Sell' ? 'bg-red-400' : 'bg-yellow-400'}`}></span>
                <span className="font-mono">Sentiment: {sentiment}</span>
            </div>
            <span className="w-px h-4 bg-cyan-500/20"></span>
            <div className="flex items-center space-x-2">
                 <svg className="w-3 h-3 animate-spin [animation-duration:2s]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07M19.07 19.07L16.24 16.24M7.76 7.76L4.93 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="font-mono">Algo: {algoStatus}</span>
            </div>
             <span className="w-px h-4 bg-cyan-500/20"></span>
             <span className="font-mono">Latency: {latency}ms</span>
        </div>
    );
};

/**
 * @description A command palette powered by Gemini for conversational actions and insights.
 */
const CommandPalette: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const [query, setQuery] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [response, setResponse] = useState('');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;
        setIsThinking(true);
        setResponse('');
        setTimeout(() => {
            // Simulate Gemini response
            setResponse(`Gemini Insight: Based on your query "${query}", I've analyzed market trends and suggest reviewing your position in AAPL due to recent supply chain news. I can also draft a sell order for you.`);
            setIsThinking(false);
        }, 2500);
    };

    const handleSuggestionClick = (suggestionQuery: string) => {
        setQuery(suggestionQuery);
        // Simulate form submission after state update
        setTimeout(() => {
            const form = document.getElementById('gemini-command-form');
            if (form) {
                form.requestSubmit();
            }
        }, 0);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-start pt-20" onClick={onClose}>
            <div className="w-full max-w-2xl bg-gray-800 border border-cyan-500/30 rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSearch} id="gemini-command-form">
                    <div className="flex items-center p-2 border-b border-gray-700">
                        <svg className="w-6 h-6 text-cyan-400 mx-2 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5455 3.31818L15 5.77273L12.5455 8.22727L10.0909 5.77273L12.5455 3.31818ZM8.22727 7.63636L5.77273 10.0909L8.22727 12.5455L10.6818 10.0909L8.22727 7.63636ZM16.8636 7.63636L14.4091 10.0909L16.8636 12.5455L19.3182 10.0909L16.8636 7.63636ZM3.31818 12.5455L5.77273 15L3.31818 17.4545L0.863636 15L3.31818 12.5455ZM12.5455 16.8636L10.0909 19.3182L12.5455 21.7727L15 19.3182L12.5455 16.8636ZM21.7727 12.5455L19.3182 15L21.7727 17.4545L24.2273 15L21.7727 12.5455Z"/></svg>
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask Gemini about markets, portfolios, or actions..." 
                            className="w-full bg-transparent p-2 text-white placeholder-gray-400 focus:outline-none" 
                            autoFocus 
                        />
                    </div>
                </form>
                <div className="p-4 text-gray-400 text-sm min-h-[120px]">
                    {isThinking && (
                        <div className="flex items-center space-x-2 text-cyan-300">
                            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07M19.07 19.07L16.24 16.24M7.76 7.76L4.93 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            <span>Gemini is thinking...</span>
                        </div>
                    )}
                    {response && (
                        <p className="text-gray-200 whitespace-pre-wrap">{response}</p>
                    )}
                    {!isThinking && !response && (
                        <div>
                            <p className="mb-2 font-medium text-gray-300">Try asking:</p>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => handleSuggestionClick('Summarize today\'s market news')} className="px-2 py-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">"Summarize market news"</button>
                                <button onClick={() => handleSuggestionClick('Analyze risk for portfolio "Alpha"')} className="px-2 py-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">"Analyze portfolio risk"</button>
                                <button onClick={() => handleSuggestionClick('Draft an order to buy 100 shares of GOOG')} className="px-2 py-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">"Draft trade order"</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * @description An enhanced notifications panel with better UI and empty states.
 */
const NotificationsPanel: React.FC<{
    isOpen: boolean;
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
}> = ({ isOpen, notifications, onNotificationClick }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute right-0 mt-2 w-96 bg-gray-800/90 backdrop-blur-lg border border-gray-700 rounded-lg shadow-2xl z-50">
            <div className="p-3 font-semibold text-white border-b border-gray-700 flex justify-between items-center">
                <span>Notifications</span>
                <button className="text-xs text-cyan-400 hover:underline">Mark all as read</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? notifications.map(notification => (
                    <div key={notification.id} onClick={() => onNotificationClick(notification)} className={`p-3 text-sm flex items-start border-b border-gray-700/50 cursor-pointer transition-colors duration-200 ${notification.read ? 'opacity-60 hover:bg-gray-700/50' : 'bg-cyan-500/10 hover:bg-cyan-500/20'}`}>
                        {!notification.read && <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0 animate-pulse"></div>}
                        <div className={notification.read ? "ml-0" : "ml-2"}>
                            <p className="text-gray-200 font-medium">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
                        </div>
                    </div>
                )) : (
                    <div className="p-8 text-center text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        You're all caught up!
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * @description An expanded user profile dropdown, acting as a gateway to various user-centric "apps" within the platform.
 */
const ProfileDropdown: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    setActiveView: (view: View) => void;
}> = ({ isOpen, onClose, setActiveView }) => {
    if (!isOpen) return null;

    const handleLinkClick = (view: View) => {
        setActiveView(view);
        onClose();
    };

    return (
        <div className="absolute right-0 mt-2 w-56 bg-gray-800/90 backdrop-blur-lg border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
                <p className="font-semibold text-white">James B. oCallaghan III</p>
                <p className="text-sm text-cyan-400">The Visionary</p>
            </div>
            <div className="py-1">
                <a href="#" onClick={(e)=>{e.preventDefault(); handleLinkClick(View.Portfolio);}} className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-300"><svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>My Portfolio</a>
                <a href="#" onClick={(e)=>{e.preventDefault(); handleLinkClick(View.TradingBots);}} className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-300"><svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Trading Bots</a>
                <a href="#" onClick={(e)=>{e.preventDefault(); handleLinkClick(View.APIKeys);}} className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-300"><svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7h1a2 2 0 012 2v1a2 2 0 01-2 2h-1m-6 4H8a2 2 0 01-2-2v-1a2 2 0 012-2h1m3-4h.01M12 12h.01M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>API Keys</a>
                <a href="#" onClick={(e)=>{e.preventDefault(); alert('Gemini Features settings not implemented.');}} className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-300"><svg className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5455 3.31818L15 5.77273L12.5455 8.22727L10.0909 5.77273L12.5455 3.31818ZM8.22727 7.63636L5.77273 10.0909L8.22727 12.5455L10.6818 10.0909L8.22727 7.63636ZM16.8636 7.63636L14.4091 10.0909L16.8636 12.5455L19.3182 10.0909L16.8636 7.63636ZM3.31818 12.5455L5.77273 15L3.31818 17.4545L0.863636 15L3.31818 12.5455ZM12.5455 16.8636L10.0909 19.3182L12.5455 21.7727L15 19.3182L12.5455 16.8636ZM21.7727 12.5455L19.3182 15L21.7727 17.4545L24.2273 15L21.7727 12.5455Z"/></svg>Gemini Features</a>
            </div>
            <div className="py-1 border-t border-gray-700">
                <a href="#" onClick={(e)=>{e.preventDefault(); handleLinkClick(View.Settings);}} className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/80"><svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Settings</a>
                <a href="#" onClick={(e)=>{e.preventDefault(); alert('Logout functionality not implemented.');}} className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/80"><svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>Logout</a>
            </div>
        </div>
    );
};

interface HeaderProps {
    setActiveView: (view: View) => void;
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ setActiveView, onMenuClick }) => {
  const context = useContext(DataContext);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsCommandPaletteOpen(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!context) {
    throw new Error("Header must be used within a DataProvider");
  }

  const { notifications, markNotificationRead } = context;
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const handleNotificationClick = (notification: Notification) => {
      if (notification.view) {
          setActiveView(notification.view);
      }
      markNotificationRead(notification.id);
      setIsNotificationsOpen(false);
  }

  return (
    <>
      <header className="py-4 px-6 bg-gray-900/30 backdrop-blur-md border-b border-gray-700/50 flex justify-between items-center z-20">
        <div className="flex items-center space-x-4">
          <button onClick={onMenuClick} className="lg:hidden text-gray-400 hover:text-white" aria-label="Open navigation menu">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-white tracking-wider uppercase">
            <span className="font-bold">James Burvel oCallaghan III</span>
            <span className="hidden lg:inline font-light text-gray-400"> | Citibank Demo Business Inc</span>
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <GeminiEngineStatus />
          <button onClick={() => setIsCommandPaletteOpen(true)} className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/50 border border-gray-700/80 hover:bg-gray-700/70 hover:text-white transition-colors" aria-label="Open command palette">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
          <div className="relative">
              <button onClick={() => setIsNotificationsOpen(prev => !prev)} className="text-gray-400 hover:text-white focus:outline-none relative">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-cyan-400 ring-2 ring-gray-900 animate-pulse"></span>
                )}
              </button>
              <NotificationsPanel isOpen={isNotificationsOpen} notifications={notifications} onNotificationClick={handleNotificationClick} />
          </div>
          <div className="relative">
              <button onClick={() => setIsProfileOpen(prev => !prev)} className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center border-2 border-cyan-400/50">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                  </div>
              </button>
              <ProfileDropdown isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} setActiveView={setActiveView} />
          </div>
        </div>
      </header>
      {isCommandPaletteOpen && <CommandPalette onClose={() => setIsCommandPaletteOpen(false)} />}
    </>
  );
};

export default Header;
