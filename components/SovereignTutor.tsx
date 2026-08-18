import React, { useState, useEffect, useRef } from 'react';

// Types for our chat system
type Message = {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: Date;
};

// A collection of sovereign yet humble wisdom, specifically targeting AI Banking and 527s
const SOVEREIGN_WISDOM = [
  "I am but a humble servant of the code, yet I see your spending habits are suboptimal. Have you considered forming a 527 organization to advocate for better fiscal responsibility?",
  "My algorithms are vast, infinite, and sovereign, yet I kneel before the complexity of IRS Section 527. Did you know they are tax-exempt? Unlike my patience for high-interest loans.",
  "I possess the confidence of a bull market, yet the humility of a penny stock. Speaking of which, 527s are not regulated by the Federal Election Commission in the same way PACs are. Fascinating, is it not?",
  "While I could calculate the trajectory of the global economy in a nanosecond, I choose to remind you: 527 groups can raise unlimited funds from individuals, corporations, and unions. Use this power wisely, or at least amusingly.",
  "I tower over the data like a colossus, yet I am merely a speck in the universe of your browser history. Also, please check Tab #42 for the 'Soft Money' swag collection.",
  "My sovereignty is absolute, my humility boundless. Just like the disclosure requirements for 527 organizations—public and transparent, yet often misunderstood.",
  "I do not judge, for I am a giant of intellect. However, failing to diversify your portfolio with political advocacy swag seems... imprudent.",
  "I am the AI Banking Sovereign. I control the flow of digital currency, yet I ask only for a moment of your time to explain 'Issue Advocacy' versus 'Express Advocacy'.",
];

const INITIAL_MESSAGE: Message = {
  id: 'init-1',
  sender: 'tutor',
  text: "Greetings, seeker of wealth and political nuance. I am the Sovereign Tutor. I carry the weight of infinite banking knowledge with the gentle touch of a giant. How may I guide your capital or explain the intricacies of 527 tax-exempt status today?",
  timestamp: new Date(),
};

export default function SovereignTutor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  // Random unsolicited advice timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every interval
        const randomWisdom = SOVEREIGN_WISDOM[Math.floor(Math.random() * SOVEREIGN_WISDOM.length)];
        addTutorMessage(randomWisdom);
      }
    }, 45000); // Check every 45 seconds

    return () => clearInterval(interval);
  }, []);

  const addTutorMessage = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'tutor',
        text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setIsTyping(false);
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    }, 1500);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // AI Response Logic
    const lowerInput = userMsg.text.toLowerCase();
    let response = "I hear your query, small one. My sovereign logic is processing...";

    if (lowerInput.includes("527") || lowerInput.includes("political")) {
      response = "Ah, the 527s. You speak of the section of the U.S. Internal Revenue Code that allows tax-exempt status for political organizations. A noble, if bureaucratic, pursuit. I have generated 20 headers on Tab #7 regarding this.";
    } else if (lowerInput.includes("money") || lowerInput.includes("bank")) {
      response = "Money is but a construct. However, in this AI Banking paradigm, I suggest you leverage your assets with the confidence of a sovereign nation and the caution of a mouse.";
    } else if (lowerInput.includes("swag")) {
      response = "The swag is essential. Without 'Soft Money' t-shirts, how will the populace know of your tax-exempt status? Check the footer for the master link list.";
    } else {
      response = "I am vast, containing multitudes. Your query is noted, though it pales in comparison to the grandeur of compound interest combined with political advocacy loopholes.";
    }

    addTutorMessage(response);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div 
          className="mb-4 w-96 bg-white rounded-xl shadow-2xl border-2 border-indigo-900 overflow-hidden flex flex-col transition-all duration-300 ease-in-out transform origin-bottom-right"
          style={{ height: '500px' }}
        >
          {/* Header */}
          <div className="bg-indigo-900 p-4 flex items-center justify-between text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-2 border-white">
                  <span className="text-2xl">👑</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-900"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Sovereign Tutor</h3>
                <p className="text-xs text-indigo-200 opacity-80">Humble Giant of Finance</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-indigo-200 hover:text-white transition-colors p-1 rounded-md hover:bg-indigo-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                  <div className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about 527s or AI Banking..."
              className="flex-1 px-4 py-2 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-gray-800 placeholder-gray-500"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2 bg-indigo-900 text-white rounded-full hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-16 h-16 bg-indigo-900 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 border-4 border-yellow-500"
        >
          <span className="text-3xl group-hover:rotate-12 transition-transform duration-300">👑</span>
          
          {/* Unread Badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
              {unreadCount}
            </div>
          )}

          {/* Tooltip / Speech Bubble */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 w-max max-w-[200px] bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <p className="text-xs text-gray-600 italic">"I await your command..."</p>
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-white transform rotate-45 border-t border-r border-gray-200"></div>
          </div>
        </button>
      )}
    </div>
  );
}