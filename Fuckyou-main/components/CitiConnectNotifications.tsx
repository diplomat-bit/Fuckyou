import React, { useState, useMemo } from 'react';
import { 
  Landmark, 
  Megaphone, 
  Bell, 
  Activity, 
  Shield, 
  Info, 
  RefreshCw, 
  Smartphone, 
  Mail, 
  Settings2, 
  CheckCircle2,
  Search,
  Filter,
  TrendingUp,
  Home,
  Brain,
  DollarSign,
  FileText,
  Trash2,
  AlertTriangle,
  PlusCircle
} from 'lucide-react';

interface Notification {
  id: string;
  channel: 'CITI' | 'ALPACA' | 'REAL_ESTATE' | 'SOVEREIGN' | 'TREASURY' | 'TAX_LIENS';
  type: string;
  title: string;
  message: string;
  time: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  read: boolean;
}

export default function CitiConnectNotifications() {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  
  // Channel subscription states
  const [subscriptions, setSubscriptions] = useState({
    CITI: true,
    ALPACA: true,
    REAL_ESTATE: true,
    SOVEREIGN: true,
    TREASURY: true,
    TAX_LIENS: false,
  });

  const [notifications, setNotifications] = useState<Notification[]>([
    { 
      id: '1', 
      channel: 'CITI',
      type: 'PAYMENT_CLEARANCE', 
      title: 'Payment Executed', 
      message: 'Transfer CIT-9283-A has cleared SWIFT mesh.', 
      time: '2 mins ago', 
      severity: 'success',
      read: false
    },
    { 
      id: '2', 
      channel: 'SOVEREIGN',
      type: 'SECURITY_HANDSHAKE', 
      title: 'New Access Token', 
      message: 'Sovereign Enclave successfully refreshed Citi credentials.', 
      time: '1 hour ago', 
      severity: 'info',
      read: false
    },
    { 
      id: '3', 
      channel: 'ALPACA',
      type: 'ORDER_EXECUTED', 
      title: 'TQQQ Buy Order', 
      message: 'TQQQ Algorithm executed BUY order of 150 shares at $54.20.', 
      time: '2 hours ago', 
      severity: 'success',
      read: true
    },
    { 
      id: '4', 
      channel: 'CITI',
      type: 'GATEWAY_ERROR', 
      title: 'Stop Payment Failed', 
      message: 'Stop request for CIT-8211 timed out at clearing host.', 
      time: 'Yesterday', 
      severity: 'warning',
      read: false
    },
    { 
      id: '5', 
      channel: 'REAL_ESTATE',
      type: 'ESCROW_RELEASED', 
      title: 'Escrow Funds Disbursed', 
      message: 'Escrow manager released $450,000.00 to deed registrar.', 
      time: 'Yesterday', 
      severity: 'success',
      read: true
    },
    { 
      id: '6', 
      channel: 'TREASURY',
      type: 'LEDGER_SYNC', 
      title: 'Modern Treasury Sync', 
      message: 'Reconciled 1,240 transactions across Plaid and Citi ledgers.', 
      time: '2 days ago', 
      severity: 'info',
      read: true
    },
    { 
      id: '7', 
      channel: 'TAX_LIENS',
      type: 'AUCTION_WON', 
      title: 'Tax Lien Certificate Won', 
      message: 'Certificate #FL-2024-091 won at 18% maximum interest rate.', 
      time: '3 days ago', 
      severity: 'success',
      read: true
    }
  ]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const toggleSubscription = (channel: keyof typeof subscriptions) => {
    setSubscriptions(prev => ({
      ...prev,
      [channel]: !prev[channel]
    }));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const triggerTestNotification = () => {
    const channels: Array<Notification['channel']> = ['CITI', 'ALPACA', 'REAL_ESTATE', 'SOVEREIGN', 'TREASURY', 'TAX_LIENS'];
    const randomChannel = channels[Math.floor(Math.random() * channels.length)];
    
    const templates: Record<Notification['channel'], Partial<Notification>[]> = {
      CITI: [
        { type: 'INCOMING_REMITTANCE', title: 'Funds Received', message: 'Incoming ACH of $25,000.00 detected on Main-01.', severity: 'success' },
        { type: 'MFA_CHALLENGE', title: 'MFA Handshake Required', message: 'Citi API gateway requested secondary biometric verification.', severity: 'warning' }
      ],
      ALPACA: [
        { type: 'REBALANCING_COMPLETED', title: 'Portfolio Rebalanced', message: 'Alpaca rebalancing engine successfully aligned assets to target weights.', severity: 'success' },
        { type: 'MARGIN_WARNING', title: 'Collateral Ratio Alert', message: 'Alpaca collateral ratio dropped below 120% threshold.', severity: 'warning' }
      ],
      REAL_ESTATE: [
        { type: 'DEED_REGISTRATION', title: 'Deed Registered', message: 'Property deed transfer successfully recorded on-chain.', severity: 'success' }
      ],
      SOVEREIGN: [
        { type: 'SENTRY_ALERT', title: 'Anomalous Activity', message: 'Sovereign Sentry detected unusual trading volume on TQQQ.', severity: 'warning' },
        { type: 'AI_INSIGHT', title: 'Gemini AI Recommendation', message: 'AI Advisor suggests hedging with BTC swing strategy.', severity: 'info' }
      ],
      TREASURY: [
        { type: 'STRIPE_TRANSFER', title: 'Stripe Payout Initiated', message: 'Stripe Treasury initiated payout of $12,450.00 to Citi.', severity: 'info' }
      ],
      TAX_LIENS: [
        { type: 'FORECLOSURE_TRACKER', title: 'Foreclosure Initiated', message: 'Foreclosure tracking started for Lien Certificate #FL-2024-091.', severity: 'info' }
      ]
    };

    const channelTemplates = templates[randomChannel];
    const template = channelTemplates[Math.floor(Math.random() * channelTemplates.length)];

    const newNotification: Notification = {
      id: Date.now().toString(),
      channel: randomChannel,
      type: template.type || 'GENERIC_EVENT',
      title: template.title || 'System Event',
      message: template.message || 'An automated system event has occurred.',
      time: 'Just now',
      severity: template.severity || 'info',
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchesChannel = selectedChannel === 'ALL' || n.channel === selectedChannel;
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            n.type.toLowerCase().includes(searchQuery.toLowerCase());
      const isSubscribed = subscriptions[n.channel];
      return matchesChannel && matchesSearch && isSubscribed;
    });
  }, [notifications, selectedChannel, searchQuery, subscriptions]);

  const getChannelIcon = (channel: Notification['channel']) => {
    switch (channel) {
      case 'CITI': return <Landmark size={16} className="text-blue-400" />;
      case 'ALPACA': return <TrendingUp size={16} className="text-emerald-400" />;
      case 'REAL_ESTATE': return <Home size={16} className="text-amber-400" />;
      case 'SOVEREIGN': return <Brain size={16} className="text-pink-400" />;
      case 'TREASURY': return <DollarSign size={16} className="text-purple-400" />;
      case 'TAX_LIENS': return <FileText size={16} className="text-red-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-gray-300 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20">
              <Megaphone className="text-pink-500" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">SOVEREIGN_NOTIFICATIONS</h1>
              <p className="text-pink-500/60 text-sm uppercase tracking-[0.2em] font-bold">Unified Push Subscription Mesh</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={triggerTestNotification}
              className="px-4 py-2.5 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 rounded-xl text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center space-x-2 transition-all"
            >
              <PlusCircle size={16} />
              <span>Trigger Test Event</span>
            </button>
            <button 
              onClick={handleRefresh}
              className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
              title="Refresh Stream"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500/50 transition-all"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {['ALL', 'CITI', 'ALPACA', 'REAL_ESTATE', 'SOVEREIGN', 'TREASURY', 'TAX_LIENS'].map(channel => (
              <button
                key={channel}
                onClick={() => setSelectedChannel(channel)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  selectedChannel === channel 
                    ? 'bg-pink-500/20 border-pink-500/40 text-white' 
                    : 'bg-black/20 border-white/5 text-gray-400 hover:bg-white/5'
                }`}
              >
                {channel.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Notification Stream */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">Live_Event_Stream ({filteredNotifications.length})</h2>
              {filteredNotifications.length > 0 && (
                <button 
                  onClick={clearAll}
                  className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 flex items-center space-x-1 transition-colors"
                >
                  <Trash2 size={12} />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {filteredNotifications.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center space-y-4">
                <Bell className="mx-auto text-gray-600 animate-pulse" size={40} />
                <div className="space-y-1">
                  <p className="text-sm text-white font-bold">No Notifications Found</p>
                  <p className="text-xs text-gray-500">Try adjusting your filters, search query, or trigger a test event.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map(alert => (
                  <div 
                    key={alert.id} 
                    onClick={() => markAsRead(alert.id)}
                    className={`bg-white/5 p-5 rounded-2xl border transition-all cursor-pointer relative group ${
                      alert.read ? 'border-white/5 opacity-70' : 'border-white/15 bg-white/[0.07]'
                    } hover:bg-white/10`}
                  >
                    {!alert.read && (
                      <span className="absolute top-4 right-4 w-2 h-2 bg-pink-500 rounded-full" />
                    )}
                    
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl border ${
                        alert.severity === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                        alert.severity === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                        alert.severity === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                        'bg-blue-500/10 border-blue-500/20 text-blue-500'
                      }`}>
                        {alert.severity === 'warning' || alert.severity === 'error' ? <AlertTriangle size={18} /> : <Bell size={18} />}
                      </div>
                      
                      <div className="flex-grow space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span className="p-1 bg-black/40 rounded border border-white/5">
                              {getChannelIcon(alert.channel)}
                            </span>
                            <h4 className="text-white font-bold text-sm tracking-tight">{alert.title}</h4>
                          </div>
                          <span className="text-[10px] text-gray-600 font-mono">{alert.time}</span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed pr-8">{alert.message}</p>
                        
                        <div className="pt-3 flex items-center justify-between">
                          <span className="text-[9px] font-mono text-gray-500 border border-white/5 px-2 py-0.5 rounded uppercase tracking-widest">
                            {alert.type}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(alert.id);
                            }}
                            className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Controls */}
          <div className="space-y-6">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-8">
              
              {/* Real-time Push Toggle */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-white font-bold text-sm">Real-time Push</h3>
                    <p className="text-[10px] text-gray-500">mTLS Secure Alerts</p>
                  </div>
                  <button 
                    onClick={() => setEnabled(!enabled)}
                    className={`w-12 h-6 rounded-full transition-all flex items-center p-1 ${enabled ? 'bg-pink-600' : 'bg-gray-800'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Channel Subscriptions */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Channel Subscriptions</h4>
                <div className="space-y-2">
                  {(Object.keys(subscriptions) as Array<keyof typeof subscriptions>).map(channel => (
                    <div key={channel} className="flex items-center justify-between p-2.5 bg-black/40 rounded-xl border border-white/5">
                      <div className="flex items-center space-x-2.5">
                        {getChannelIcon(channel)}
                        <span className="text-xs font-mono text-gray-300">{channel.replace('_', ' ')}</span>
                      </div>
                      <button 
                        onClick={() => toggleSubscription(channel)}
                        className={`w-8 h-4 rounded-full transition-all flex items-center p-0.5 ${subscriptions[channel] ? 'bg-pink-600/80' : 'bg-gray-800'}`}
                      >
                        <div className={`w-3 h-3 bg-white rounded-full transition-all ${subscriptions[channel] ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Channels */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Delivery Channels</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                    <div className="flex items-center space-x-3">
                      <Smartphone size={16} className="text-gray-400" />
                      <span className="text-xs">Sovereign App</span>
                    </div>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                    <div className="flex items-center space-x-3">
                      <Mail size={16} className="text-gray-400" />
                      <span className="text-xs">Encrypted Email</span>
                    </div>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Advanced Config */}
              <div className="pt-4 border-t border-white/5">
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center space-x-2 transition-all">
                  <Settings2 size={14} />
                  <span>ADVANCED_CONFIG</span>
                </button>
              </div>

              {/* Encrypted Push Info */}
              <div className="p-4 bg-pink-500/5 rounded-2xl border border-pink-500/10">
                <div className="flex items-center space-x-2 text-pink-500 mb-2">
                  <Shield size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted Push</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  All notifications are encrypted using the user's Sovereign Public Key before being dispatched via the push relay server.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}