import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Activity, 
  AlertTriangle, 
  Save, 
  RefreshCw, 
  Cpu, 
  HardDrive, 
  Clock, 
  Bell, 
  CheckCircle, 
  ShieldAlert, 
  Sliders, 
  Play, 
  Check,
  X
} from 'lucide-react';

// Define interfaces for Threshold Configuration
export interface ThresholdConfig {
  appId: string;
  appName: string;
  latencyWarning: number;      // ms
  latencyCritical: number;     // ms
  errorRateWarning: number;    // %
  errorRateCritical: number;   // %
  memoryWarning: number;       // MB
  memoryCritical: number;      // MB
  cpuWarning: number;          // %
  cpuCritical: number;         // %
  notifyChannels: {
    email: boolean;
    webhook: boolean;
    slack: boolean;
  };
  isEnabled: boolean;
}

// Define interfaces for Current Live Metrics
export interface LiveMetric {
  appId: string;
  latency: number;
  errorRate: number;
  memory: number;
  cpu: number;
  timestamp: string;
}

// Mock Registered Micro-apps from the project tree
const REGISTERED_APPS = [
  { id: 'audit_compliance_tracker', name: 'Audit Compliance Tracker' },
  { id: 'b2b_cash_flow_stress_tester', name: 'B2B Cash Flow Stress Tester' },
  { id: 'b2b_corporate_liquidity_forecaster', name: 'B2B Corporate Liquidity Forecaster' },
  { id: 'citiconnect_integration_gateway', name: 'CitiConnect Integration Gateway' },
  { id: 'pqc_crypto_bridge_simulator', name: 'PQC Crypto Bridge Simulator' },
  { id: 'voter_registration_portal', name: 'Voter Registration Portal' },
  { id: 'card_tokenization_service', name: 'Card Tokenization Service' },
  { id: 'treasury_reconciliation_engine', name: 'Treasury Reconciliation Engine' }
];

// Default Thresholds Template
const DEFAULT_THRESHOLDS = (appId: string, appName: string): ThresholdConfig => ({
  appId,
  appName,
  latencyWarning: 200,
  latencyCritical: 500,
  errorRateWarning: 1.5,
  errorRateCritical: 5.0,
  memoryWarning: 512,
  memoryCritical: 1024,
  cpuWarning: 70,
  cpuCritical: 90,
  notifyChannels: {
    email: true,
    webhook: false,
    slack: true
  },
  isEnabled: true
});

export default function AppMetricsThresholdsEditor() {
  // State Management
  const [apps] = useState(REGISTERED_APPS);
  const [selectedAppId, setSelectedAppId] = useState<string>(REGISTERED_APPS[0].id);
  const [thresholds, setThresholds] = useState<Record<string, ThresholdConfig>>({});
  const [liveMetrics, setLiveMetrics] = useState<Record<string, LiveMetric>>({});
  const [editingConfig, setEditingConfig] = useState<ThresholdConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [simulationActive, setSimulationActive] = useState<boolean>(false);

  // Initialize Thresholds and Live Metrics
  useEffect(() => {
    setIsLoading(true);
    // Simulate API fetch from AppMetricsCollector
    setTimeout(() => {
      const initialThresholds: Record<string, ThresholdConfig> = {};
      const initialMetrics: Record<string, LiveMetric> = {};

      apps.forEach(app => {
        initialThresholds[app.id] = DEFAULT_THRESHOLDS(app.id, app.name);
        initialMetrics[app.id] = {
          appId: app.id,
          latency: Math.floor(Math.random() * 150) + 50,
          errorRate: parseFloat((Math.random() * 2).toFixed(2)),
          memory: Math.floor(Math.random() * 300) + 200,
          cpu: Math.floor(Math.random() * 40) + 15,
          timestamp: new Date().toLocaleTimeString()
        };
      });

      setThresholds(initialThresholds);
      setLiveMetrics(initialMetrics);
      setEditingConfig({ ...initialThresholds[selectedAppId] });
      setIsLoading(false);
      showNotification('info', 'Loaded threshold configurations from AppMetricsCollector API.');
    }, 800);
  }, []);

  // Update editing form when selected app changes
  useEffect(() => {
    if (thresholds[selectedAppId]) {
      setEditingConfig({ ...thresholds[selectedAppId] });
    }
  }, [selectedAppId, thresholds]);

  // Live Metrics Simulation Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (simulationActive) {
      interval = setInterval(() => {
        setLiveMetrics(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(appId => {
            // Introduce occasional spikes to test thresholds
            const spike = Math.random() > 0.85;
            updated[appId] = {
              appId,
              latency: spike ? Math.floor(Math.random() * 600) + 100 : Math.floor(Math.random() * 120) + 40,
              errorRate: spike ? parseFloat((Math.random() * 8).toFixed(2)) : parseFloat((Math.random() * 1.2).toFixed(2)),
              memory: Math.floor(Math.random() * 200) + (spike ? 600 : 250),
              cpu: Math.floor(Math.random() * 30) + (spike ? 65 : 20),
              timestamp: new Date().toLocaleTimeString()
            };
          });
          return updated;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [simulationActive]);

  // Helper to trigger notifications
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle Input Changes in Editor
  const handleInputChange = (field: keyof ThresholdConfig, value: any) => {
    if (!editingConfig) return;
    setEditingConfig(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleNotificationToggle = (channel: 'email' | 'webhook' | 'slack') => {
    if (!editingConfig) return;
    setEditingConfig(prev => {
      if (!prev) return null;
      return {
        ...prev,
        notifyChannels: {
          ...prev.notifyChannels,
          [channel]: !prev.notifyChannels[channel]
        }
      };
    });
  };

  // Save Thresholds to AppMetricsCollector API
  const handleSave = async () => {
    if (!editingConfig) return;

    // Validation
    if (editingConfig.latencyWarning >= editingConfig.latencyCritical) {
      showNotification('error', 'Latency Warning threshold must be less than Critical threshold.');
      return;
    }
    if (editingConfig.errorRateWarning >= editingConfig.errorRateCritical) {
      showNotification('error', 'Error Rate Warning threshold must be less than Critical threshold.');
      return;
    }
    if (editingConfig.memoryWarning >= editingConfig.memoryCritical) {
      showNotification('error', 'Memory Warning threshold must be less than Critical threshold.');
      return;
    }
    if (editingConfig.cpuWarning >= editingConfig.cpuCritical) {
      showNotification('error', 'CPU Warning threshold must be less than Critical threshold.');
      return;
    }

    setIsSaving(true);
    // Simulate API PUT request to /api/AppRegistry/services/AppMetricsCollector
    setTimeout(() => {
      setThresholds(prev => ({
        ...prev,
        [selectedAppId]: { ...editingConfig }
      }));
      setIsSaving(false);
      showNotification('success', `Successfully updated thresholds for ${editingConfig.appName}.`);
    }, 1000);
  };

  // Reset to default values
  const handleResetToDefault = () => {
    const defaultConf = DEFAULT_THRESHOLDS(selectedAppId, thresholds[selectedAppId]?.appName || selectedAppId);
    setEditingConfig(defaultConf);
    showNotification('info', 'Reset form to default recommended thresholds.');
  };

  // Check if a metric breaches thresholds
  const getMetricStatus = (appId: string, metricType: 'latency' | 'errorRate' | 'memory' | 'cpu') => {
    const metric = liveMetrics[appId];
    const thresh = thresholds[appId];
    if (!metric || !thresh || !thresh.isEnabled) return 'normal';

    let current = 0;
    let warn = 0;
    let crit = 0;

    switch (metricType) {
      case 'latency':
        current = metric.latency;
        warn = thresh.latencyWarning;
        crit = thresh.latencyCritical;
        break;
      case 'errorRate':
        current = metric.errorRate;
        warn = thresh.errorRateWarning;
        crit = thresh.errorRateCritical;
        break;
      case 'memory':
        current = metric.memory;
        warn = thresh.memoryWarning;
        crit = thresh.memoryCritical;
        break;
      case 'cpu':
        current = metric.cpu;
        warn = thresh.cpuWarning;
        crit = thresh.cpuCritical;
        break;
    }

    if (current >= crit) return 'critical';
    if (current >= warn) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status: 'normal' | 'warning' | 'critical') => {
    if (status === 'critical') return 'text-red-500 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50';
    if (status === 'warning') return 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50';
    return 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-8 h-8 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight">AppMetrics Thresholds Editor</h1>
          </div>
          <p className="text-slate-400 mt-1 text-sm">
            Configure performance guardrails, latency limits, and alert triggers for registered micro-apps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSimulationActive(!simulationActive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              simulationActive 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Play className={`w-4 h-4 ${simulationActive ? 'animate-pulse' : ''}`} />
            {simulationActive ? 'Simulation Active' : 'Simulate Live Metrics'}
          </button>
          <button
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 500);
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            title="Refresh Configs"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl transition-all duration-300 animate-bounce ${
          notification.type === 'success' ? 'bg-emerald-950 border-emerald-800 text-emerald-200' :
          notification.type === 'error' ? 'bg-red-950 border-red-800 text-red-200' :
          'bg-slate-800 border-slate-700 text-slate-200'
        }`}>
          {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
          {notification.type === 'error' && <ShieldAlert className="w-5 h-5 text-red-400" />}
          {notification.type === 'info' && <Activity className="w-5 h-5 text-indigo-400" />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Micro-apps List */}
        <div className="lg:col-span-4 bg-slate-950 rounded-xl border border-slate-800 p-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-200">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Registered Micro-Apps
          </h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {apps.map(app => {
              const isSelected = app.id === selectedAppId;
              const appMetric = liveMetrics[app.id];
              const appThresh = thresholds[app.id];
              
              // Determine overall status
              let overallStatus: 'normal' | 'warning' | 'critical' = 'normal';
              if (appThresh?.isEnabled) {
                const statuses = [
                  getMetricStatus(app.id, 'latency'),
                  getMetricStatus(app.id, 'errorRate'),
                  getMetricStatus(app.id, 'memory'),
                  getMetricStatus(app.id, 'cpu')
                ];
                if (statuses.includes('critical')) overallStatus = 'critical';
                else if (statuses.includes('warning')) overallStatus = 'warning';
              }

              return (
                <button
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all flex flex-col gap-2 ${
                    isSelected 
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-950/20' 
                      : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="font-medium text-sm text-slate-200 truncate max-w-[180px]">
                      {app.name}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border ${getStatusColor(overallStatus)}`}>
                      {overallStatus}
                    </span>
                  </div>

                  {appMetric && (
                    <div className="grid grid-cols-4 gap-1 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <div>
                        <span className="block text-[9px] text-slate-500">LAT</span>
                        <span className={getMetricStatus(app.id, 'latency') !== 'normal' ? 'text-amber-400 font-semibold' : ''}>
                          {appMetric.latency}ms
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-500">ERR</span>
                        <span className={getMetricStatus(app.id, 'errorRate') !== 'normal' ? 'text-red-400 font-semibold' : ''}>
                          {appMetric.errorRate}%
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-500">MEM</span>
                        <span>{appMetric.memory}MB</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-500">CPU</span>
                        <span>{appMetric.cpu}%</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Threshold Editor Form & Live Preview */}
        <div className="lg:col-span-8 space-y-6">
          {editingConfig ? (
            <>
              {/* Threshold Configuration Form */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-6">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">
                      Configure Thresholds: <span className="text-indigo-400">{editingConfig.appName}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      App ID: <code className="text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded">{editingConfig.appId}</code>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400 font-medium">Monitoring Status:</label>
                    <button
                      onClick={() => handleInputChange('isEnabled', !editingConfig.isEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        editingConfig.isEnabled ? 'bg-indigo-600' : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          editingConfig.isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Threshold Sliders & Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Latency Thresholds */}
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80 space-y-4">
                    <div className="flex items-center gap-2 text-slate-200 font-medium text-sm">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      Latency Thresholds (ms)
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Warning Limit</span>
                          <span className="text-amber-400 font-semibold">{editingConfig.latencyWarning} ms</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="1000"
                          step="10"
                          value={editingConfig.latencyWarning}
                          onChange={(e) => handleInputChange('latencyWarning', parseInt(e.target.value))}
                          className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Critical Limit</span>
                          <span className="text-red-400 font-semibold">{editingConfig.latencyCritical} ms</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="2000"
                          step="20"
                          value={editingConfig.latencyCritical}
                          onChange={(e) => handleInputChange('latencyCritical', parseInt(e.target.value))}
                          className="w-full accent-red-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Error Rate Thresholds */}
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80 space-y-4">
                    <div className="flex items-center gap-2 text-slate-200 font-medium text-sm">
                      <AlertTriangle className="w-4 h-4 text-indigo-400" />
                      Error Rate Thresholds (%)
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Warning Limit</span>
                          <span className="text-amber-400 font-semibold">{editingConfig.errorRateWarning}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="10"
                          step="0.1"
                          value={editingConfig.errorRateWarning}
                          onChange={(e) => handleInputChange('errorRateWarning', parseFloat(e.target.value))}
                          className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Critical Limit</span>
                          <span className="text-red-400 font-semibold">{editingConfig.errorRateCritical}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="25"
                          step="0.5"
                          value={editingConfig.errorRateCritical}
                          onChange={(e) => handleInputChange('errorRateCritical', parseFloat(e.target.value))}
                          className="w-full accent-red-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Memory Thresholds */}
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80 space-y-4">
                    <div className="flex items-center gap-2 text-slate-200 font-medium text-sm">
                      <HardDrive className="w-4 h-4 text-indigo-400" />
                      Memory Limits (MB)
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Warning Limit</span>
                          <span className="text-amber-400 font-semibold">{editingConfig.memoryWarning} MB</span>
                        </div>
                        <input
                          type="range"
                          min="128"
                          max="2048"
                          step="64"
                          value={editingConfig.memoryWarning}
                          onChange={(e) => handleInputChange('memoryWarning', parseInt(e.target.value))}
                          className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Critical Limit</span>
                          <span className="text-red-400 font-semibold">{editingConfig.memoryCritical} MB</span>
                        </div>
                        <input
                          type="range"
                          min="256"
                          max="4096"
                          step="128"
                          value={editingConfig.memoryCritical}
                          onChange={(e) => handleInputChange('memoryCritical', parseInt(e.target.value))}
                          className="w-full accent-red-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CPU Thresholds */}
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/80 space-y-4">
                    <div className="flex items-center gap-2 text-slate-200 font-medium text-sm">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      CPU Utilization (%)
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Warning Limit</span>
                          <span className="text-amber-400 font-semibold">{editingConfig.cpuWarning}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          step="5"
                          value={editingConfig.cpuWarning}
                          onChange={(e) => handleInputChange('cpuWarning', parseInt(e.target.value))}
                          className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Critical Limit</span>
                          <span className="text-red-400 font-semibold">{editingConfig.cpuCritical}%</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="100"
                          step="5"
                          value={editingConfig.cpuCritical}
                          onChange={(e) => handleInputChange('cpuCritical', parseInt(e.target.value))}
                          className="w-full accent-red-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Notification Channels */}
                <div className="mt-6 pt-6 border-t border-slate-800">
                  <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    Alert Dispatch Channels
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {['email', 'webhook', 'slack'].map((channel) => {
                      const isChecked = editingConfig.notifyChannels[channel as keyof typeof editingConfig.notifyChannels];
                      return (
                        <button
                          key={channel}
                          type="button"
                          onClick={() => handleNotificationToggle(channel as 'email' | 'webhook' | 'slack')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-medium transition-all ${
                            isChecked 
                              ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isChecked ? 'bg-indigo-600 border-indigo-500' : 'border-slate-700'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="capitalize">{channel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Reset to Recommended Defaults
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingConfig({ ...thresholds[selectedAppId] })}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Discard Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-indigo-950/30"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save Thresholds'}
                    </button>
                  </div>
                </div>

              </div>

              {/* Live Preview & Threshold Comparison */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  Live Metrics vs Threshold Guardrails
                </h3>

                {liveMetrics[selectedAppId] ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Latency Card */}
                    <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-slate-400 font-medium">Latency</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase border ${getStatusColor(getMetricStatus(selectedAppId, 'latency'))}`}>
                          {getMetricStatus(selectedAppId, 'latency')}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-slate-100">
                        {liveMetrics[selectedAppId].latency} <span className="text-xs font-normal text-slate-500">ms</span>
                      </div>
                      <div className="mt-2 text-[10px] text-slate-500 space-y-0.5">
                        <div className="flex justify-between">
                          <span>Warning:</span>
                          <span className="text-amber-500/80">{thresholds[selectedAppId]?.latencyWarning}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Critical:</span>
                          <span className="text-red-500/80">{thresholds[selectedAppId]?.latencyCritical}ms</span>
                        </div>
                      </div>
                    </div>

                    {/* Error Rate Card */}
                    <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-slate-400 font-medium">Error Rate</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase border ${getStatusColor(getMetricStatus(selectedAppId, 'errorRate'))}`}>
                          {getMetricStatus(selectedAppId, 'errorRate')}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-slate-100">
                        {liveMetrics[selectedAppId].errorRate} <span className="text-xs font-normal text-slate-500">%</span>
                      </div>
                      <div className="mt-2 text-[10px] text-slate-500 space-y-0.5">
                        <div className="flex justify-between">
                          <span>Warning:</span>
                          <span className="text-amber-500/80">{thresholds[selectedAppId]?.errorRateWarning}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Critical:</span>
                          <span className="text-red-500/80">{thresholds[selectedAppId]?.errorRateCritical}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Memory Card */}
                    <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-slate-400 font-medium">Memory</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase border ${getStatusColor(getMetricStatus(selectedAppId, 'memory'))}`}>
                          {getMetricStatus(selectedAppId, 'memory')}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-slate-100">
                        {liveMetrics[selectedAppId].memory} <span className="text-xs font-normal text-slate-500">MB</span>
                      </div>
                      <div className="mt-2 text-[10px] text-slate-500 space-y-0.5">
                        <div className="flex justify-between">
                          <span>Warning:</span>
                          <span className="text-amber-500/80">{thresholds[selectedAppId]?.memoryWarning}MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Critical:</span>
                          <span className="text-red-500/80">{thresholds[selectedAppId]?.memoryCritical}MB</span>
                        </div>
                      </div>
                    </div>

                    {/* CPU Card */}
                    <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-slate-400 font-medium">CPU</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase border ${getStatusColor(getMetricStatus(selectedAppId, 'cpu'))}`}>
                          {getMetricStatus(selectedAppId, 'cpu')}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-slate-100">
                        {liveMetrics[selectedAppId].cpu} <span className="text-xs font-normal text-slate-500">%</span>
                      </div>
                      <div className="mt-2 text-[10px] text-slate-500 space-y-0.5">
                        <div className="flex justify-between">
                          <span>Warning:</span>
                          <span className="text-amber-500/80">{thresholds[selectedAppId]?.cpuWarning}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Critical:</span>
                          <span className="text-red-500/80">{thresholds[selectedAppId]?.cpuCritical}%</span>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No live metrics available. Click "Simulate Live Metrics" to generate real-time data.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-12 text-center">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-slate-300">Loading Threshold Configurations</h3>
              <p className="text-slate-500 text-sm mt-1">Connecting to AppMetricsCollector API...</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}