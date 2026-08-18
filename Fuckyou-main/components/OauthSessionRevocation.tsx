import React, { useState, useEffect, useCallback } from 'react';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  Trash2, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Clock, 
  MapPin, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

// Define Session Interface
export interface Session {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

// Initial Mock Data
const INITIAL_SESSIONS: Session[] = [
  {
    id: 'sess_01H7X',
    deviceName: 'MacBook Pro 16"',
    deviceType: 'desktop',
    browser: 'Chrome 116.0.0',
    ipAddress: '192.168.1.105',
    location: 'San Francisco, CA, USA',
    lastActive: 'Active now',
    isCurrent: true,
  },
  {
    id: 'sess_02J8Y',
    deviceName: 'iPhone 14 Pro',
    deviceType: 'mobile',
    browser: 'Safari Mobile 16.5',
    ipAddress: '172.56.21.89',
    location: 'New York, NY, USA',
    lastActive: '2 hours ago',
    isCurrent: false,
  },
  {
    id: 'sess_03K9Z',
    deviceName: 'iPad Air',
    deviceType: 'tablet',
    browser: 'Safari Mobile 16.5',
    ipAddress: '172.56.21.90',
    location: 'New York, NY, USA',
    lastActive: '3 days ago',
    isCurrent: false,
  },
  {
    id: 'sess_04L1A',
    deviceName: 'Windows PC - Dell XPS',
    deviceType: 'desktop',
    browser: 'Firefox 115.0',
    ipAddress: '184.22.109.5',
    location: 'London, UK',
    lastActive: '5 days ago',
    isCurrent: false,
  },
];

export default function OauthSessionRevocation() {
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [isRevoking, setIsRevoking] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [sessionToRevokeSingle, setSessionToRevokeSingle] = useState<string | null>(null);

  // Clear feedback alert after 5 seconds
  useEffect(() => {
    if (feedback.type) {
      const timer = setTimeout(() => {
        setFeedback({ type: null, message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Toggle individual session selection
  const handleToggleSelect = (id: string, isCurrent: boolean) => {
    if (isCurrent) return; // Prevent selecting current session for bulk delete easily without warning
    const newSelected = new Set(selectedSessions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSessions(newSelected);
  };

  // Toggle select all (excluding current session)
  const handleToggleSelectAll = () => {
    const activeSelectable = sessions.filter(s => !s.isCurrent);
    if (selectedSessions.size === activeSelectable.length) {
      setSelectedSessions(new Set());
    } else {
      setSelectedSessions(new Set(activeSelectable.map(s => s.id)));
    }
  };

  // Trigger Session Revocation API Call
  const handleRevokeSessions = async (idsToRevoke: string[]) => {
    setIsRevoking(true);
    setFeedback({ type: null, message: '' });

    try {
      // Simulate API call to /sessions (DELETE)
      // In production, replace this with:
      // const response = await fetch('/sessions', {
      //   method: 'DELETE',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ sessionIds: idsToRevoke })
      // });
      
      await new Promise((resolve) => setTimeout(resolve, 1200)); // Simulate network latency

      // Simulate successful response
      setSessions((prev) => prev.filter((session) => !idsToRevoke.includes(session.id)));
      setSelectedSessions((prev) => {
        const next = new Set(prev);
        idsToRevoke.forEach(id => next.delete(id));
        return next;
      });

      setFeedback({
        type: 'success',
        message: `Successfully terminated ${idsToRevoke.length} session${idsToRevoke.length > 1 ? 's' : ''}.`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: 'Failed to revoke sessions. Please try again later.',
      });
    } finally {
      setIsRevoking(false);
      setShowConfirmModal(false);
      setSessionToRevokeSingle(null);
    }
  };

  const confirmBulkRevoke = () => {
    if (selectedSessions.size === 0) return;
    setShowConfirmModal(true);
  };

  const confirmSingleRevoke = (id: string) => {
    setSessionToRevokeSingle(id);
    setShowConfirmModal(true);
  };

  const executeRevocation = () => {
    if (sessionToRevokeSingle) {
      handleRevokeSessions([sessionToRevokeSingle]);
    } else {
      handleRevokeSessions(Array.from(selectedSessions));
    }
  };

  const handleResetDemo = () => {
    setSessions(INITIAL_SESSIONS);
    setSelectedSessions(new Set());
    setFeedback({ type: 'success', message: 'Demo sessions restored.' });
  };

  const getDeviceIcon = (type: 'desktop' | 'mobile' | 'tablet') => {
    switch (type) {
      case 'desktop':
        return <Monitor className="w-5 h-5 text-slate-400" />;
      case 'mobile':
        return <Smartphone className="w-5 h-5 text-slate-400" />;
      case 'tablet':
        return <Tablet className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-500" />
            Active Sessions
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage and revoke your active OAuth sessions across all devices.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDemo}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Demo
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback.type && (
        <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 border animate-fadeIn ${
          feedback.type === 'success' 
            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200' 
            : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="text-sm font-medium">{feedback.message}</div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={
              sessions.filter(s => !s.isCurrent).length > 0 &&
              selectedSessions.size === sessions.filter(s => !s.isCurrent).length
            }
            onChange={handleToggleSelectAll}
            disabled={sessions.filter(s => !s.isCurrent).length === 0}
            className="w-4.5 h-4.5 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer disabled:opacity-50"
          />
          <span className="text-sm font-medium text-slate-300">
            {selectedSessions.size > 0 
              ? `${selectedSessions.size} session${selectedSessions.size > 1 ? 's' : ''} selected` 
              : 'Select all other sessions'
            }
          </span>
        </div>

        <button
          onClick={confirmBulkRevoke}
          disabled={selectedSessions.size === 0 || isRevoking}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            selectedSessions.size > 0
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          Revoke Selected
        </button>
      </div>

      {/* Sessions List */}
      <div className="mt-6 overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-slate-800 rounded-xl">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-950">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-slate-400 sm:pl-6">
                    Device / Browser
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-400">
                    IP Address
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-400">
                    Location
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-400">
                    Last Active
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      <ShieldAlert className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                      <p className="text-base font-medium text-slate-400">No active sessions found</p>
                      <p className="text-xs text-slate-500 mt-1">All sessions have been revoked.</p>
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr 
                      key={session.id}
                      className={`transition-colors hover:bg-slate-800/40 ${
                        session.isCurrent ? 'bg-emerald-950/5' : ''
                      }`}
                    >
                      {/* Device & Browser */}
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={selectedSessions.has(session.id)}
                              onChange={() => handleToggleSelect(session.id, session.isCurrent)}
                              disabled={session.isCurrent}
                              className={`w-4.5 h-4.5 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer ${
                                session.isCurrent ? 'opacity-20 cursor-not-allowed' : ''
                              }`}
                            />
                          </div>
                          <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                            {getDeviceIcon(session.deviceType)}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              {session.deviceName}
                              {session.isCurrent && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Current Session
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">{session.browser}</div>
                          </div>
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300">
                        <div className="font-mono text-xs bg-slate-950 px-2 py-1 rounded border border-slate-800 inline-block">
                          {session.ipAddress}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {session.location}
                        </div>
                      </td>

                      {/* Last Active */}
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span className={session.isCurrent ? 'text-emerald-400 font-medium' : ''}>
                            {session.lastActive}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        {!session.isCurrent && (
                          <button
                            onClick={() => confirmSingleRevoke(session.id)}
                            className="text-slate-400 hover:text-rose-400 p-1.5 hover:bg-rose-950/30 rounded-lg transition-all border border-transparent hover:border-rose-500/20"
                            title="Revoke Session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl transform scale-100 transition-all">
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Revoke Session Access?</h3>
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to terminate the selected session(s)? The connected device will be immediately logged out and will require re-authentication to access your account.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSessionToRevokeSingle(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                disabled={isRevoking}
              >
                Cancel
              </button>
              <button
                onClick={executeRevocation}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-lg shadow-rose-950/50"
                disabled={isRevoking}
              >
                {isRevoking ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Revoking...
                  </>
                ) : (
                  'Confirm Revocation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}