import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  Menu, 
  X, 
  Bot, 
  DollarSign, 
  Search,
  Globe,
  Briefcase,
  Settings,
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  Send,
  Building2,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Lock,
  Code,
  Server,
  BookOpen,
  User,
  Palette,
  KeyRound,
  Zap,
  Bell
} from 'lucide-react';

// --- Types ---

type SubLink = {
  title: string;
  href: string;
  description: string;
  icon: React.ReactNode;
};

type Category = {
  id: string;
  label: string;
  icon: React.ReactNode;
  columns: SubLink[][];
  description: string;
};

// --- Data Definition ---

const bankingLinks: SubLink[] = [
  { title: "Dashboard", href: "/dashboard", description: "Real-time financial overview.", icon: <LayoutDashboard size={18} /> },
  { title: "Accounts", href: "/accounts", description: "Manage connected entities.", icon: <Wallet size={18} /> },
  { title: "Transactions", href: "/transactions", description: "AI-categorized history.", icon: <ArrowRightLeft size={18} /> },
  { title: "Global Pay", href: "/send-money", description: "Cross-border settlements.", icon: <Send size={18} /> },
  { title: "Treasury", href: "/modern-treasury", description: "Liquidity management.", icon: <Building2 size={18} /> },
  { title: "Assets", href: "/investments", description: "Portfolio tracking.", icon: <TrendingUp size={18} /> },
];

const bureaucracyLinks: SubLink[] = [
  { title: "Compliance AI", href: "/compliance-oracle", description: "Automated regulatory checks.", icon: <ShieldCheck size={18} /> },
  { title: "Reports", href: "/financial-reporting", description: "GAAP/IFRS statements.", icon: <BarChart3 size={18} /> },
  { title: "Security", href: "/security-center", description: "2FA & Access logs.", icon: <Lock size={18} /> },
  { title: "Dev Portal", href: "/developer-hub", description: "API keys & Webhooks.", icon: <Code size={18} /> },
  { title: "System Status", href: "/api-status", description: "Uptime monitoring.", icon: <Server size={18} /> },
  { title: "Docs", href: "/knowledge-base", description: "Integration guides.", icon: <BookOpen size={18} /> },
];

const settingsLinks: SubLink[] = [
  { title: "My Profile", href: "/settings", description: "Identity verification.", icon: <User size={18} /> },
  { title: "Appearance", href: "/personalization", description: "Dark/Light mode & themes.", icon: <Palette size={18} /> },
  { title: "Auth & SSO", href: "/sso", description: "Enterprise security.", icon: <KeyRound size={18} /> },
];

const chunkLinks = (links: SubLink[], columns: number): SubLink[][] => {
  const result: SubLink[][] = Array.from({ length: columns }, () => []);
  links.forEach((link, index) => {
    result[index % columns].push(link);
  });
  return result;
};

const NAV_DATA: Category[] = [
  { 
    id: 'banking', 
    label: 'Banking', 
    icon: <DollarSign className="w-4 h-4" />, 
    columns: chunkLinks(bankingLinks, 2),
    description: "Enterprise-grade banking infrastructure powered by predictive AI models."
  },
  { 
    id: 'bureaucracy', 
    label: 'Bureaucracy', 
    icon: <Briefcase className="w-4 h-4" />, 
    columns: chunkLinks(bureaucracyLinks, 2),
    description: "Automate compliance, tax reporting, and legal frameworks instantly."
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: <Settings className="w-4 h-4" />, 
    columns: chunkLinks(settingsLinks, 1),
    description: "Control center for account security, preferences, and team access."
  },
];

// --- Components ---

const MegaNavBar: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveCategory(null);
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleCategory = (id: string) => {
    setActiveCategory(prev => prev === id ? null : id);
  };

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 py-2' : 'bg-slate-950 py-4 border-b border-transparent'}
      `}
    >
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group relative z-50">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 shadow-lg group-hover:border-cyan-500/50 transition-colors duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Globe className="w-6 h-6 text-cyan-400 relative z-10 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-50 transition-colors">
                SOVEREIGN
              </span>
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-500 font-semibold group-hover:text-cyan-400 transition-colors">
                Financial OS
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav ref={navRef} className="hidden lg:flex items-center gap-1 h-full">
            {NAV_DATA.map((category) => (
              <div key={category.id} className="relative">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-transparent
                    ${activeCategory === category.id 
                      ? 'bg-slate-800/80 text-cyan-400 border-slate-700/50 shadow-inner' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
                  `}
                >
                  {category.icon}
                  {category.label}
                  <ChevronDown 
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${activeCategory === category.id ? 'rotate-180' : ''}`} 
                  />
                </button>

                {/* Mega Menu Dropdown */}
                <div 
                  className={`
                    absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[800px] 
                    bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-2xl shadow-black/50
                    overflow-hidden transition-all duration-300 origin-top z-50
                    ${activeCategory === category.id 
                      ? 'opacity-100 translate-y-0 visible' 
                      : 'opacity-0 -translate-y-2 invisible pointer-events-none'}
                  `}
                >
                  <div className="flex">
                    {/* Sidebar */}
                    <div className="w-64 bg-slate-950/50 p-6 border-r border-slate-800 flex flex-col">
                      <div className="mb-6">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center mb-4 text-cyan-400 shadow-inner">
                          {category.icon}
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{category.label}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          {category.description}
                        </p>
                      </div>
                      <div className="mt-auto">
                        <Link 
                          to={`/${category.id}`}
                          className="flex items-center justify-between w-full p-3 rounded-lg bg-slate-800/50 hover:bg-cyan-900/20 border border-slate-700 hover:border-cyan-500/30 group transition-all"
                        >
                          <span className="text-sm font-medium text-slate-300 group-hover:text-cyan-400">Overview</span>
                          <ArrowRightLeft className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                        </Link>
                      </div>
                    </div>

                    {/* Links Grid */}
                    <div className="flex-1 p-8 bg-gradient-to-b from-slate-900/50 to-transparent">
                      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        {category.columns.flat().map((link, idx) => (
                          <Link 
                            key={idx} 
                            to={link.href}
                            className="group flex items-start gap-3 p-2 -mx-2 rounded-xl hover:bg-slate-800/50 transition-colors"
                          >
                            <div className="mt-1 p-1.5 rounded-lg bg-slate-800 text-slate-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-colors">
                              {link.icon}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                                {link.title}
                              </div>
                              <div className="text-xs text-slate-500 group-hover:text-slate-400 mt-0.5">
                                {link.description}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Search */}
            <div className={`relative transition-all duration-300 ${searchFocused ? 'w-64' : 'w-48'}`}>
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searchFocused ? 'text-cyan-400' : 'text-slate-500'}`} />
              <input 
                type="text" 
                placeholder="Search..." 
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full bg-slate-900/50 border border-slate-800 text-slate-200 text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:bg-slate-900 transition-all placeholder:text-slate-600"
              />
            </div>

            <div className="h-6 w-[1px] bg-slate-800 mx-1" />

            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
            </button>

            <button className="flex items-center gap-2 bg-white text-slate-950 hover:bg-cyan-50 px-4 py-1.5 rounded-full font-bold text-sm shadow-lg shadow-cyan-500/10 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
              <Zap className="w-4 h-4 fill-current" />
              <span>Upgrade</span>
            </button>
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`
          lg:hidden fixed inset-0 z-40 bg-slate-950 transition-transform duration-300 ease-in-out pt-20 px-4
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full overflow-y-auto pb-10 space-y-8">
          {NAV_DATA.map((category) => (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg border-b border-slate-800 pb-2">
                {category.icon}
                {category.label}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {category.columns.flat().map((link, idx) => (
                  <Link 
                    key={idx} 
                    to={link.href}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800/50 active:bg-slate-800"
                  >
                    <div className="text-slate-400">{link.icon}</div>
                    <div>
                      <div className="text-slate-200 font-medium">{link.title}</div>
                      <div className="text-xs text-slate-500">{link.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t border-slate-800">
             <button className="w-full flex items-center justify-center gap-2 bg-cyan-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-cyan-900/20">
              <Bot className="w-5 h-5" />
              AI Command Center
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MegaNavBar;