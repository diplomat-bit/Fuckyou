import React, { useState, useMemo, useEffect, useCallback } from 'react';

// --- Types & Interfaces ---

export type FloridaCounty = 
  | 'Miami-Dade' 
  | 'Broward' 
  | 'Palm Beach' 
  | 'Hillsborough' 
  | 'Orange' 
  | 'Pinellas' 
  | 'Duval' 
  | 'Lee' 
  | 'Polk' 
  | 'Brevard' 
  | 'Volusia' 
  | 'Pasco';

export type VoterStatus = 'Active' | 'Inactive' | 'Pending Review' | 'Purged' | 'Flagged Discrepancy';
export type PoliticalParty = 'REP' | 'DEM' | 'NPA' | 'LPF' | 'GRE' | 'OTHER';
export type AuditFlag = 'Deceased Match' | 'Out-of-State Move' | 'Duplicate Reg' | 'Invalid Address' | 'Signature Mismatch' | 'None';

export interface VoterRecord {
  voterId: string;
  flRegistrationNum: string;
  firstName: string;
  lastName: string;
  county: FloridaCounty;
  precinct: string;
  party: PoliticalParty;
  status: VoterStatus;
  registrationDate: string;
  lastVotedDate: string | null;
  auditFlag: AuditFlag;
  confidenceScore: number;
  sourceFile: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'warning' | 'error';
  recordsProcessed: number;
  durationMs: number;
  errorCount: number;
}

export interface AuditSummary {
  totalRecords: number;
  activeCount: number;
  flaggedCount: number;
  purgedCount: number;
  integrityScore: number;
  lastRunTimestamp: string;
}

// --- Mock Initial Dataset ---

const INITIAL_VOTER_RECORDS: VoterRecord[] = [
  {
    voterId: 'FL-2024-889102',
    flRegistrationNum: '109283741',
    firstName: 'Marcus',
    lastName: 'Vance',
    county: 'Miami-Dade',
    precinct: 'PCT-302',
    party: 'DEM',
    status: 'Active',
    registrationDate: '2016-04-12',
    lastVotedDate: '2024-03-19',
    auditFlag: 'None',
    confidenceScore: 99.4,
    sourceFile: 'FL_DOS_EXT_2024_03.txt'
  },
  {
    voterId: 'FL-2024-441908',
    flRegistrationNum: '104928172',
    firstName: 'Elena',
    lastName: 'Rodriguez-Cruz',
    county: 'Miami-Dade',
    precinct: 'PCT-411',
    party: 'REP',
    status: 'Flagged Discrepancy',
    registrationDate: '2012-08-05',
    lastVotedDate: '2022-11-08',
    auditFlag: 'Out-of-State Move',
    confidenceScore: 61.2,
    sourceFile: 'FL_DOS_EXT_2024_03.txt'
  },
  {
    voterId: 'FL-2024-110293',
    flRegistrationNum: '119284019',
    firstName: 'William',
    lastName: 'Pendleton',
    county: 'Duval',
    precinct: 'PCT-108',
    party: 'REP',
    status: 'Flagged Discrepancy',
    registrationDate: '1998-10-14',
    lastVotedDate: '2020-11-03',
    auditFlag: 'Deceased Match',
    confidenceScore: 94.8,
    sourceFile: 'FL_DOS_EXT_2024_03.txt'
  },
  {
    voterId: 'FL-2024-773819',
    flRegistrationNum: '120938472',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    county: 'Hillsborough',
    precinct: 'PCT-220',
    party: 'NPA',
    status: 'Active',
    registrationDate: '2020-01-15',
    lastVotedDate: '2024-03-19',
    auditFlag: 'None',
    confidenceScore: 98.9,
    sourceFile: 'FL_DOS_EXT_2024_03.txt'
  },
  {
    voterId: 'FL-2024-662910',
    flRegistrationNum: '103829102',
    firstName: 'Devon',
    lastName: 'Alvarez',
    county: 'Orange',
    precinct: 'PCT-512',
    party: 'DEM',
    status: 'Pending Review',
    registrationDate: '2023-09-22',
    lastVotedDate: null,
    auditFlag: 'Invalid Address',
    confidenceScore: 72.3,
    sourceFile: 'FL_DOS_EXT_2024_03.txt'
  },
  {
    voterId: 'FL-2024-339182',
    flRegistrationNum: '112948192',
    firstName: 'Arthur',
    lastName: 'Kowalski',
    county: 'Pinellas',
    precinct: 'PCT-044',
    party: 'REP',
    status: 'Active',
    registrationDate: '2004-03-11',
    lastVotedDate: '2024-03-19',
    auditFlag: 'None',
    confidenceScore: 99.8,
    sourceFile: 'FL_DOS_EXT_2024_03.txt'
  },
  {
    voterId: 'FL-2024-551092',
    flRegistrationNum: '109382019',
    firstName: 'Chloe',
    lastName: 'Beaumont',
    county: 'Broward',
    precinct: 'PCT-809',
    party: 'DEM',
    status: 'Inactive',
    registrationDate: '2015-06-18',
    lastVotedDate: '2018-11-06',
    auditFlag: 'Signature Mismatch',
    confidenceScore: 54.0,
    sourceFile: 'FL_DOS_EXT_2024_03.txt'
  },
  {
    voterId: 'FL-2024-992013',
    flRegistrationNum: '129384729',
    firstName: 'Jonathan',
    lastName: 'Bauer',
    county: 'Palm Beach',
    precinct: 'PCT-119',
    party: 'NPA',
    status: 'Purged',
    registrationDate: '2000-02-28',
    lastVotedDate: '2016-11-08',
    auditFlag: 'Duplicate Reg',
    confidenceScore: 99.0,
    sourceFile: 'FL_DOS_EXT_2024_03.txt'
  }
];

const INITIAL_STAGES: PipelineStage[] = [
  { id: '1', name: 'FL DOS Ingestion & Unpacking', status: 'completed', recordsProcessed: 1420950, durationMs: 4230, errorCount: 0 },
  { id: '2', name: 'Schema & Field Canonicalization', status: 'completed', recordsProcessed: 1420950, durationMs: 2810, errorCount: 14 },
  { id: '3', name: 'NCOA & Interstate Cross-Audit', status: 'completed', recordsProcessed: 1420936, durationMs: 8400, errorCount: 312 },
  { id: '4', name: 'SSA Death Master File Crosscheck', status: 'completed', recordsProcessed: 1420936, durationMs: 6120, errorCount: 89 },
  { id: '5', name: 'Audit Scoring & Ledger Commitment', status: 'completed', recordsProcessed: 1420936, durationMs: 1980, errorCount: 0 }
];

export default function Pipeline31_FloridaVoterData() {
  // --- States ---
  const [records, setRecords] = useState<VoterRecord[]>(INITIAL_VOTER_RECORDS);
  const [stages, setStages] = useState<PipelineStage[]>(INITIAL_STAGES);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCounty, setSelectedCounty] = useState<string>('ALL');
  const [selectedParty, setSelectedParty] = useState<string>('ALL');
  const [selectedFlag, setSelectedFlag] = useState<string>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<VoterRecord | null>(null);
  const [logStream, setLogStream] = useState<string[]>([
    '[SYSTEM] Florida Voter Audit Stream Initialized.',
    '[SYSTEM] Connected to Florida Division of Elections (DOS) Snapshot 2024-Q1.',
    '[INFO] Real-time integrity scoring model v4.2 loaded.'
  ]);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogStream((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  }, []);

  // --- Filtering ---
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch = 
        r.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.flRegistrationNum.includes(searchTerm) ||
        r.voterId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCounty = selectedCounty === 'ALL' || r.county === selectedCounty;
      const matchParty = selectedParty === 'ALL' || r.party === selectedParty;
      const matchFlag = selectedFlag === 'ALL' || (selectedFlag === 'FLAGGED' ? r.auditFlag !== 'None' : r.auditFlag === selectedFlag);

      return matchSearch && matchCounty && matchParty && matchFlag;
    });
  }, [records, searchTerm, selectedCounty, selectedParty, selectedFlag]);

  // --- KPI Aggregates ---
  const summary: AuditSummary = useMemo(() => {
    const total = records.length;
    const active = records.filter(r => r.status === 'Active').length;
    const flagged = records.filter(r => r.auditFlag !== 'None').length;
    const purged = records.filter(r => r.status === 'Purged').length;
    const avgConfidence = records.reduce((acc, curr) => acc + curr.confidenceScore, 0) / (total || 1);

    return {
      totalRecords: total,
      activeCount: active,
      flaggedCount: flagged,
      purgedCount: purged,
      integrityScore: parseFloat(avgConfidence.toFixed(1)),
      lastRunTimestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
    };
  }, [records]);

  // --- Pipeline Simulation Trigger ---
  const handleRunFullPipeline = () => {
    if (isRunning) return;
    setIsRunning(true);
    addLog('Manual execution triggered: Full Florida Statewide Ingestion & Verification.');

    // Step-by-step state simulation
    const stageIds = ['1', '2', '3', '4', '5'];
    let currentIdx = 0;

    const interval = setInterval(() => {
      if (currentIdx < stageIds.length) {
        const stageId = stageIds[currentIdx];
        setStages((prev) =>
          prev.map((st) =>
            st.id === stageId
              ? { ...st, status: 'running' }
              : st
          )
        );
        addLog(`Executing Stage ${stageId}: ${stages[currentIdx]?.name}...`);

        setTimeout(() => {
          setStages((prev) =>
            prev.map((st) =>
              st.id === stageId
                ? { ...st, status: 'completed', recordsProcessed: Math.floor(1400000 + Math.random() * 50000) }
                : st
            )
          );
        }, 600);

        currentIdx++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
        addLog('Statewide voter data audit completed with 0 fatal errors. Ledger committed.');
      }
    }, 900);
  };

  const handleResolveFlag = (voterId: string) => {
    setRecords((prev) =>
      prev.map((rec) =>
        rec.voterId === voterId
          ? { ...rec, auditFlag: 'None', status: 'Active', confidenceScore: 99.9 }
          : rec
      )
    );
    if (selectedRecord && selectedRecord.voterId === voterId) {
      setSelectedRecord((prev) => (prev ? { ...prev, auditFlag: 'None', status: 'Active', confidenceScore: 99.9 } : null));
    }
    addLog(`Auditor verified & cleared discrepancies for Voter ID: ${voterId}`);
  };

  const handlePurgeRecord = (voterId: string) => {
    setRecords((prev) =>
      prev.map((rec) =>
        rec.voterId === voterId
          ? { ...rec, status: 'Purged', confidenceScore: 0.0 }
          : rec
      )
    );
    if (selectedRecord && selectedRecord.voterId === voterId) {
      setSelectedRecord((prev) => (prev ? { ...prev, status: 'Purged', confidenceScore: 0.0 } : null));
    }
    addLog(`Record purged according to Florida Statute § 98.065: ${voterId}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans antialiased">
      {/* Header */}
      <header className="mb-8 border-b border-slate-800 pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-orange-600/20 text-orange-400 border border-orange-500/30">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Pipeline #31: Florida Voter Data & Audit Engine
                  <span className="text-xs font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                    FL-DOS v24.2
                  </span>
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Statutory voter roll normalization, deceased record cross-matching, out-of-state verification, and precinct auditing.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunFullPipeline}
              disabled={isRunning}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 shadow-lg ${
                isRunning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/20 active:scale-95'
              }`}
            >
              {isRunning ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Processing Roll...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Trigger Statewide Ingestion
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur">
          <div className="text-xs uppercase font-medium text-slate-400 tracking-wider mb-1">Total Sampled</div>
          <div className="text-2xl font-bold text-white font-mono">{summary.totalRecords.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">Source: FL Division of Elections</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur">
          <div className="text-xs uppercase font-medium text-slate-400 tracking-wider mb-1">Active Registrations</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{summary.activeCount}</div>
          <div className="text-xs text-emerald-500/80 mt-1">Verified compliant voters</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur">
          <div className="text-xs uppercase font-medium text-slate-400 tracking-wider mb-1">Flagged for Audit</div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{summary.flaggedCount}</div>
          <div className="text-xs text-amber-500/80 mt-1">Requires supervisor review</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur">
          <div className="text-xs uppercase font-medium text-slate-400 tracking-wider mb-1">Purged / Ineligible</div>
          <div className="text-2xl font-bold text-rose-400 font-mono">{summary.purgedCount}</div>
          <div className="text-xs text-rose-500/80 mt-1">Pursuant to § 98.065</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur">
          <div className="text-xs uppercase font-medium text-slate-400 tracking-wider mb-1">Roll Quality Score</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{summary.integrityScore}%</div>
          <div className="text-xs text-cyan-500/80 mt-1">Weighted confidence index</div>
        </div>
      </div>

      {/* Main Grid: Pipeline Architecture & Real-Time Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pipeline Execution Stages */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center justify-between">
            <span>ETL Execution & Integrity Stages</span>
            <span className="text-xs text-slate-400 font-normal">Statewide Ledger Target: fl_voter_gold_db</span>
          </h2>
          <div className="space-y-3">
            {stages.map((st, index) => (
              <div
                key={st.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80"
              >
                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    0{index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">{st.name}</div>
                    <div className="text-xs text-slate-500 font-mono">
                      Processed: {st.recordsProcessed.toLocaleString()} records • Latency: {st.durationMs}ms
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {st.errorCount > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-mono">
                      {st.errorCount} flags
                    </span>
                  )}
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize flex items-center gap-1.5 ${
                      st.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : st.status === 'running'
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        st.status === 'completed'
                          ? 'bg-emerald-400'
                          : st.status === 'running'
                          ? 'bg-sky-400'
                          : 'bg-slate-400'
                      }`}
                    />
                    {st.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Stream Logs */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-200">Audit Trail Console</h2>
            <button
              onClick={() => setLogStream(['[CLEARED] Audit log buffer wiped.'])}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Clear Log
            </button>
          </div>
          <div className="flex-1 bg-black/60 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-y-auto max-h-[220px] space-y-1.5 border border-slate-800">
            {logStream.map((log, idx) => (
              <div
                key={idx}
                className={
                  log.includes('[ERROR]') || log.includes('purged')
                    ? 'text-rose-400'
                    : log.includes('verified')
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Controls Panel */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Search Voter or ID</label>
            <input
              type="text"
              placeholder="Search name, voter ID, reg #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Florida County</label>
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500/50"
            >
              <option value="ALL">All FL Counties (67)</option>
              <option value="Miami-Dade">Miami-Dade</option>
              <option value="Broward">Broward</option>
              <option value="Palm Beach">Palm Beach</option>
              <option value="Hillsborough">Hillsborough</option>
              <option value="Orange">Orange</option>
              <option value="Pinellas">Pinellas</option>
              <option value="Duval">Duval</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Affiliation</label>
            <select
              value={selectedParty}
              onChange={(e) => setSelectedParty(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500/50"
            >
              <option value="ALL">All Affiliations</option>
              <option value="REP">Republican (REP)</option>
              <option value="DEM">Democrat (DEM)</option>
              <option value="NPA">No Party Affiliation (NPA)</option>
              <option value="LPF">Libertarian (LPF)</option>
              <option value="GRE">Green (GRE)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Audit Flag Filter</label>
            <select
              value={selectedFlag}
              onChange={(e) => setSelectedFlag(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500/50"
            >
              <option value="ALL">All Audit Flags</option>
              <option value="FLAGGED">Only Discrepancies</option>
              <option value="Deceased Match">SSA Deceased Match</option>
              <option value="Out-of-State Move">Out-of-State Relocation</option>
              <option value="Duplicate Reg">Duplicate Registration</option>
              <option value="Invalid Address">Invalid Residential Address</option>
              <option value="Signature Mismatch">Signature Mismatch</option>
              <option value="None">Clean Records</option>
            </select>
          </div>
        </div>
      </div>

      {/* Voter Records Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-semibold text-slate-200">Florida Registered Voter Ledger</h3>
          <span className="text-xs font-mono text-slate-400">
            Displaying {filteredRecords.length} of {records.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/70 text-xs font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Voter Name & ID</th>
                <th className="px-4 py-3">County / Precinct</th>
                <th className="px-4 py-3">Affiliation</th>
                <th className="px-4 py-3">Reg Date</th>
                <th className="px-4 py-3">Last Voted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Audit Flag</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.map((voter) => (
                <tr
                  key={voter.voterId}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedRecord(voter)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">
                      {voter.lastName}, {voter.firstName}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">{voter.voterId} • Reg: {voter.flRegistrationNum}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-200">{voter.county}</div>
                    <div className="text-xs text-slate-500 font-mono">{voter.precinct}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-mono font-medium ${
                        voter.party === 'REP'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : voter.party === 'DEM'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {voter.party}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-400">{voter.registrationDate}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-400">
                    {voter.lastVotedDate || <span className="text-slate-600">Never</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        voter.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : voter.status === 'Purged'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : voter.status === 'Flagged Discrepancy'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {voter.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {voter.auditFlag !== 'None' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {voter.auditFlag}
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-400 font-mono">Passed</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            voter.confidenceScore > 85 ? 'bg-emerald-500' : voter.confidenceScore > 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${voter.confidenceScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-slate-300">{voter.confidenceScore}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {voter.auditFlag !== 'None' && (
                        <button
                          onClick={() => handleResolveFlag(voter.voterId)}
                          title="Verify and Clear Flag"
                          className="p-1 text-xs text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      {voter.status !== 'Purged' && (
                        <button
                          onClick={() => handlePurgeRecord(voter.voterId)}
                          title="Purge Record (§ 98.065)"
                          className="p-1 text-xs text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500">
                    No voter records matching the specified criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Inspector Drawer / Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Voter Roll Dossier</h3>
                <p className="text-xs font-mono text-slate-400">FL Voter Identification: {selectedRecord.voterId}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 font-mono text-sm border-t border-b border-slate-800 py-4 my-4">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans text-xs">Full Name:</span>
                <span className="text-slate-200">{selectedRecord.firstName} {selectedRecord.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans text-xs">State Registration #:</span>
                <span className="text-slate-200">{selectedRecord.flRegistrationNum}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans text-xs">County / Precinct:</span>
                <span className="text-slate-200">{selectedRecord.county} ({selectedRecord.precinct})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans text-xs">Party Registration:</span>
                <span className="text-slate-200">{selectedRecord.party}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans text-xs">Audit Flags:</span>
                <span className={selectedRecord.auditFlag !== 'None' ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                  {selectedRecord.auditFlag}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans text-xs">Confidence Score:</span>
                <span className="text-cyan-400 font-bold">{selectedRecord.confidenceScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans text-xs">Source Batch:</span>
                <span className="text-slate-400 text-xs">{selectedRecord.sourceFile}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-4">
              {selectedRecord.auditFlag !== 'None' && (
                <button
                  onClick={() => handleResolveFlag(selectedRecord.voterId)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium font-sans"
                >
                  Verify & Clear Flag
                </button>
              )}
              {selectedRecord.status !== 'Purged' && (
                <button
                  onClick={() => handlePurgeRecord(selectedRecord.voterId)}
                  className="px-3 py-2 bg-rose-600/20 border border-rose-500/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-medium font-sans"
                >
                  Mark Purged
                </button>
              )}
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium font-sans"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}