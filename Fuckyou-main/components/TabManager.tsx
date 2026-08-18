import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Pin, 
  PinOff, 
  MoreVertical, 
  Layers, 
  Check, 
  Trash2, 
  Copy, 
  ArrowLeftRight,
  Maximize2,
  Minimize2,
  Sparkles,
  TrendingUp,
  Shield,
  Cpu
} from 'lucide-react';

export interface Tab {
  id: string;
  name: string;
  isPinned?: boolean;
  moduleCode?: string;
}

interface TabManagerProps {
  tabs: Tab[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onCloseAll?: () => void;
  onCloseOthers?: (id: string) => void;
  onPinTab?: (id: string) => void;
  onReorderTabs?: (tabs: Tab[]) => void;
  onDuplicateTab?: (id: string, name: string) => void;
}

export default function TabManager({
  tabs = [],
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCloseAll,
  onCloseOthers,
  onPinTab,
  onReorderTabs,
  onDuplicateTab
}: TabManagerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    tabId: string;
    tabName: string;
    isPinned: boolean;
  } | null>(null);

  // Check if scroll buttons are needed
  const checkScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftScroll(scrollLeft > 2);
      setShowRightScroll(scrollLeft + clientWidth < scrollWidth - 2);
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      // Initial check with a slight timeout to allow rendering
      const timer = setTimeout(checkScroll, 100);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
        clearTimeout(timer);
      };
    }
  }, [tabs, checkScroll]);

  // Scroll active tab into view
  useEffect(() => {
    if (activeTabId) {
      const activeElement = document.getElementById(`tab-${activeTabId}`);
      const container = scrollContainerRef.current;
      if (activeElement && container) {
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();

        if (activeRect.left < containerRect.left) {
          container.scrollBy({
            left: activeRect.left - containerRect.left - 20,
            behavior: 'smooth'
          });
        } else if (activeRect.right > containerRect.right) {
          container.scrollBy({
            left: activeRect.right - containerRect.right + 20,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [activeTabId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + W to close active tab
      if (e.altKey && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeTabId) {
          onCloseTab(activeTabId);
        }
      }
      // Ctrl + Alt + ArrowRight / ArrowLeft to switch tabs
      if (e.ctrlKey && e.altKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        if (currentIndex !== -1) {
          let nextIndex = currentIndex + (e.key === 'ArrowRight' ? 1 : -1);
          if (nextIndex >= tabs.length) nextIndex = 0;
          if (nextIndex < 0) nextIndex = tabs.length - 1;
          if (tabs[nextIndex]) {
            onSelectTab(tabs[nextIndex].id);
          }
        }
      }
      // Ctrl + Alt + F to search tabs
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId, onSelectTab, onCloseTab]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close context menu on click outside
  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 240;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleContextMenu = (e: React.MouseEvent, tab: Tab) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      tabId: tab.id,
      tabName: tab.name,
      isPinned: !!tab.isPinned
    });
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Set transparent drag image or custom styling if desired
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    if (onReorderTabs) {
      const newTabs = [...tabs];
      const [draggedItem] = newTabs.splice(draggedIndex, 1);
      newTabs.splice(index, 0, draggedItem);
      onReorderTabs(newTabs);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const filteredTabs = tabs.filter(tab => 
    tab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tab.moduleCode && tab.moduleCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Helper to get visual indicators based on module code or name
  const getTabTheme = (tab: Tab) => {
    const code = tab.moduleCode || '';
    if (code.startsWith('AQ-SEC') || code.includes('SEC')) {
      return { color: 'text-cyan-400 border-cyan-500/30', glow: 'shadow-cyan-950/20', icon: Shield };
    }
    if (code.startsWith('AQ-ALP') || code.includes('TRD') || code.includes('PRT')) {
      return { color: 'text-emerald-400 border-emerald-500/30', glow: 'shadow-emerald-950/20', icon: TrendingUp };
    }
    if (code.startsWith('AQ-SYS') || code.includes('UTL')) {
      return { color: 'text-purple-400 border-purple-500/30', glow: 'shadow-purple-950/20', icon: Cpu };
    }
    return { color: 'text-blue-400 border-blue-500/30', glow: 'shadow-blue-950/20', icon: Sparkles };
  };

  return (
    <div className="relative flex flex-col w-full bg-slate-950 border-b border-slate-800/80 select-none z-30">
      {/* Tab Bar Container */}
      <div className="flex items-center justify-between h-12 px-2 gap-2 bg-slate-900/40 backdrop-blur-md">
        
        {/* Left Scroll Button */}
        {showLeftScroll && (
          <button 
            onClick={() => handleScroll('left')}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all duration-150 shadow-md z-10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Tabs Scroll Area */}
        <div 
          ref={scrollContainerRef}
          className="flex items-center flex-1 overflow-x-auto no-scrollbar h-full gap-1.5 py-1 scroll-smooth"
          style={{ scrollbarWidth: 'none' }}
        >
          {tabs.map((tab, index) => {
            const isActive = tab.id === activeTabId;
            const theme = getTabTheme(tab);
            const IconComponent = theme.icon;

            return (
              <div
                key={tab.id}
                id={`tab-${tab.id}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onContextMenu={(e) => handleContextMenu(e, tab)}
                onClick={() => onSelectTab(tab.id)}
                className={`
                  relative flex items-center h-9 px-3.5 rounded-lg cursor-pointer transition-all duration-200 group border
                  ${isActive 
                    ? `bg-slate-900/90 text-slate-100 border-slate-700/80 shadow-lg ${theme.glow}` 
                    : 'bg-slate-950/40 text-slate-400 border-transparent hover:bg-slate-900/40 hover:text-slate-200 hover:border-slate-800/60'
                  }
                  ${draggedIndex === index ? 'opacity-40 scale-95' : ''}
                `}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-full" />
                )}

                {/* Tab Icon */}
                <IconComponent className={`w-3.5 h-3.5 mr-2 flex-shrink-0 transition-colors duration-200 ${isActive ? theme.color : 'text-slate-500 group-hover:text-slate-400'}`} />

                {/* Tab Name */}
                <span className="text-xs font-medium tracking-wide whitespace-nowrap max-w-[140px] overflow-hidden text-ellipsis">
                  {tab.name}
                </span>

                {/* Module Code Badge */}
                {tab.moduleCode && (
                  <span className="ml-1.5 px-1 py-0.5 text-[9px] font-mono rounded bg-slate-950/80 text-slate-500 border border-slate-800/60 group-hover:text-slate-400">
                    {tab.moduleCode}
                  </span>
                )}

                {/* Pinned Indicator */}
                {tab.isPinned && (
                  <Pin className="w-2.5 h-2.5 ml-1.5 text-amber-500/80 rotate-45 flex-shrink-0" />
                )}

                {/* Close Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className={`
                    ml-2 p-0.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all duration-150
                    ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                  `}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {tabs.length === 0 && (
            <div className="flex items-center text-slate-500 text-xs italic px-4">
              No active workspaces. Select a service from the sidebar to begin.
            </div>
          )}
        </div>

        {/* Right Scroll Button */}
        {showRightScroll && (
          <button 
            onClick={() => handleScroll('right')}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all duration-150 shadow-md z-10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Utility Actions */}
        <div className="flex items-center gap-1 border-l border-slate-800/80 pl-2 ml-1">
          {/* Search / Quick Switcher Trigger */}
          <button
            onClick={() => setIsSearchOpen(prev => !prev)}
            title="Search Workspaces (Ctrl+Alt+F)"
            className={`p-1.5 rounded-lg transition-all duration-150 ${isSearchOpen ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'}`}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-all duration-150"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close All Trigger */}
          {onCloseAll && tabs.length > 0 && (
            <button
              onClick={onCloseAll}
              title="Close All Workspaces"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all duration-150"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Switcher / Search Dropdown */}
      {isSearchOpen && (
        <div className="absolute top-12 right-2 w-80 bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="relative flex items-center mb-2">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search active workspaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
            {filteredTabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              const theme = getTabTheme(tab);
              const IconComponent = theme.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onSelectTab(tab.id);
                    setIsSearchOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all duration-150 ${isActive ? 'bg-slate-900 text-slate-100 border border-slate-800' : 'hover:bg-slate-900/50 text-slate-400 hover:text-slate-200'}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <IconComponent className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? theme.color : 'text-slate-500'}`} />
                    <span className="text-xs font-medium truncate">{tab.name}</span>
                    {tab.moduleCode && (
                      <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-950 text-slate-500 border border-slate-800/60">
                        {tab.moduleCode}
                      </span>
                    )}
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                </button>
              );
            })}

            {filteredTabs.length === 0 && (
              <div className="text-center py-4 text-xs text-slate-500">
                No matching workspaces found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Context Menu */}
      {contextMenu && contextMenu.visible && (
        <div 
          className="fixed bg-slate-950/95 border border-slate-800/80 rounded-xl shadow-2xl py-1.5 w-52 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 border-b border-slate-900 text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">
            {contextMenu.tabName}
          </div>

          {/* Pin / Unpin Option */}
          {onPinTab && (
            <button
              onClick={() => {
                onPinTab(contextMenu.tabId);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-900 hover:text-slate-100 transition-colors"
            >
              {contextMenu.isPinned ? (
                <>
                  <PinOff className="w-3.5 h-3.5 text-amber-500" />
                  <span>Unpin Workspace</span>
                </>
              ) : (
                <>
                  <Pin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pin Workspace</span>
                </>
              )}
            </button>
          )}

          {/* Duplicate Option */}
          {onDuplicateTab && (
            <button
              onClick={() => {
                onDuplicateTab(contextMenu.tabId, contextMenu.tabName);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-900 hover:text-slate-100 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Duplicate Workspace</span>
            </button>
          )}

          {/* Close Others Option */}
          {onCloseOthers && (
            <button
              onClick={() => {
                onCloseOthers(contextMenu.tabId);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-900 hover:text-slate-100 transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
              <span>Close Other Workspaces</span>
            </button>
          )}

          <div className="h-px bg-slate-900 my-1" />

          {/* Close Option */}
          <button
            onClick={() => {
              onCloseTab(contextMenu.tabId);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close Workspace</span>
          </button>
        </div>
      )}
    </div>
  );
}