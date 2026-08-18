import React from 'react';
import { View } from '../types';

interface HeaderProps {
  onMenuClick: () => void;
  setActiveView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, setActiveView }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-700 shadow-md">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick} 
          className="mr-4 p-1 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition duration-150"
          aria-label="Toggle Navigation Menu"
        >
          {/* Menu Icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        {/* 
          Refactoring Goal 6: Choose a Realistic MVP Scope. 
          Renamed the application from 'THE AI ENCYCLOPEDIA' (prototype scope) 
          to focus on the selected 'Treasury Automation Module' MVP. 
        */}
        <h1 className="text-xl font-bold text-teal-400 tracking-wide">Treasury Intelligence Platform</h1>
      </div>
      
      <button 
        onClick={() => setActiveView('api_settings' as View)} 
        className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition duration-150"
        title="Settings"
        aria-label="Open Settings"
      >
        {/* Settings Icon */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      </button>
    </header>
  );
};

export default Header;