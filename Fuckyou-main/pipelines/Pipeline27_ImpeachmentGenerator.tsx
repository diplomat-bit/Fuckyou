import React, { useState, useMemo } from 'react';
import {
  FileText,
  AlertTriangle,
  Scale,
  CheckCircle2,
  Clock,
  Search,
  Download,
  Copy,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
  ShieldAlert,
  UserCheck,
  FolderOpen,
  ArrowRight,
  BookOpen,
  Sliders,
  Check,
  RefreshCw,
  ExternalLink,
  Gavel,
  FileCheck,
  SplitSquareVertical,
  Plus
} from 'lucide-react';

interface ContradictionItem {
  id: string;
  sourceA: {
    title: string;
    date: string;
    excerpt: string;
    citation: string;
  };
  sourceB: {
    title: string;
    date: string;
    excerpt: string;
    citation: string;
  };
  category: 'Direct Factual Inconsistency' | 'Omission Under Oath' | 'Timeline Conflict' | 'Prior Inconsistent Statement (FRE 613)';
  severity: 'Critical' | 'High' | 'Moderate';
  confidenceScore: number;
  statutoryBasis: string;
  crossExamQuestion: string;
}

interface ArticleOfImpeachment {
  articleNumber: string;
  title: string;
  statute: string;
  summary: string;
  factualBasis: string[];
  exhibitCitations: string[];
  status: 'Drafted' | 'Reviewed' | 'Approved';
}

const mockContradictions: ContradictionItem[] = [
  {
    id: 'CONT-1049',
    sourceA: {
      title: 'Sworn Deposition - Phase 1',
      date: '2023-11-14',
      excerpt: '"I had no direct knowledge of the escrow account transfers or authorization memos until early February 2024."',
      citation: 'Dep. Tr. Vol II, p. 142:12-18'
    },
    sourceB: {
      title: 'Subpoenaed Email Records (Ex. 44)',
      date: '2023-10-02',
      excerpt: '"Approved. Disperse the escrow tranches as outlined in the memo before month-end audit."',
      citation: 'Bates Stamp SEC-004921'
    },
    category: 'Prior Inconsistent Statement (FRE 613)',
    severity: 'Critical',
    confidenceScore: 98.4,
    statutoryBasis: '18 U.S.C. § 1621 (Perjury) / FRE 801(d)(1)(A)',
    crossExamQuestion: 'Mr. Witness, in your deposition you swore under oath you had zero knowledge until February, yet on October 2nd you emailed "Approved. Disperse the escrow tranches," did you not?'
  },
  {
    id: 'CONT-1052',
    sourceA: {
      title: 'Congressional Hearing Testimony',
      date: '2024-02-18',
      excerpt: '"All classified briefing materials remained strictly within the SCIF facility at all times."',
      citation: 'House Oversight Hearing Tr. p. 89'
    },
    sourceB: {
      title: 'Keycard Access & Transport Logs',
      date: '2024-01-09',
      excerpt: 'Bates Document Bag #4 logged out to residential perimeter detail without SCIF return receipt.',
      citation: 'DoD Inspector General Log Ex. 88-B'
    },
    category: 'Direct Factual Inconsistency',
    severity: 'High',
    confidenceScore: 94.1,
    statutoryBasis: '5 U.S.C. § 7324 & 18 U.S.C. § 793(f)',
    crossExamQuestion: 'You stated to Congress that all briefing packets remained inside the SCIF, but DoD chain-of-custody logs show Bag 4 removed to private quarters on Jan 9th, correct?'
  },
  {
    id: 'CONT-1065',
    sourceA: {
      title: 'Financial Disclosure Form SF-278',
      date: '2023-05-15',
      excerpt: 'Reported zero beneficial ownership or capital gain distributions from foreign advisory partnerships.',
      citation: 'OGE SF-278 Schedule C, Line 4'
    },
    sourceB: {
      title: 'FinCEN SAR Filing & Banking Records',
      date: '2023-04-12',
      excerpt: 'Wire receipt #99218: $450,000 disbursement from Helix Global Partners LP to personal holding entity.',
      citation: 'FinCEN SAR Ledger Vol. IV'
    },
    category: 'Omission Under Oath',
    severity: 'Critical',
    confidenceScore: 99.1,
    statutoryBasis: 'Ethics in Government Act (5 U.S.C. App. § 101 et seq.)',
    crossExamQuestion: 'On your certified ethics disclosure you marked zero foreign partnership income, yet wire records show $450,000 transferred three weeks prior, isn\'t that true?'
  }
];

const mockArticles: ArticleOfImpeachment[] = [
  {
    articleNumber: 'Article I',
    title: 'Perjury and Making False Sworn Statements to an Investigative Committee',
    statute: '18 U.S.C. § 1621 & Article II, Section 4',
    summary: 'Willfully and corruptly testifying falsely under oath regarding knowledge and direct authorization of clandestine off-book financial conveyances.',
    factualBasis: [
      'Contradiction CONT-1049 proves knowledge of escrow transfers four months prior to sworn deposition denial.',
      'Subpoenaed metadata verifies personal drafting and digital signature of authorization memo.'
    ],
    exhibitCitations: ['Ex. 44 (Email)', 'Dep. Tr. Vol II, p. 142', 'Forensic Metadata Report R-9'],
    status: 'Approved'
  },
  {
    articleNumber: 'Article II',
    title: 'Abuse of Power and Misappropriation of Protected Public Resources',
    statute: 'Article II, Section 4 (High Crimes and Misdemeanors)',
    summary: 'Systematic circumvention of statutory classification safeguards and chain-of-custody protocols for personal and non-governmental objectives.',
    factualBasis: [
      'Unlawful removal of restricted briefing material documented in CONT-1052.',
      'Violation of executive order directives and continuous misrepresentation before legislative committees.'
    ],
    exhibitCitations: ['DoD IG Log Ex. 88-B', 'SCIF Access Ledger Jan 2024', 'House Oversight Tr. p. 89'],
    status: 'Reviewed'
  },
  {
    articleNumber: 'Article III',
    title: 'Failure to Disclose Disqualifying Financial Interests & Ethics Violations',
    statute: '5 U.S.C. App. § 101 et seq. & False Claims Act',
    summary: 'Intentional omission of substantial foreign capital distributions on mandatory executive branch financial disclosures.',
    factualBasis: [
      'Failure to declare $450,000 Helix Global LP disbursement as evidenced in CONT-1065.',
      'Maintaining active beneficial interests while presiding over regulatory oversight matters directly impacting Helix Global.'
    ],
    exhibitCitations: ['SF-278 Schedule C', 'FinCEN Wire Tr. #99218', 'Entity Incorporation Registry #09-88'],
    status: 'Drafted'
  }
];

export default function Pipeline27_ImpeachmentGenerator() {
  const [activeTab, setActiveTab] = useState<'overview' | 'inconsistencies' | 'articles' | 'packet' | 'preview'>('inconsistencies');
  const [selectedContradiction, setSelectedContradiction] = useState<ContradictionItem>(mockContradictions[0]);
  const [contradictionsList, setContradictionsList] = useState<ContradictionItem[]>(mockContradictions);
  const [articlesList, setArticlesList] = useState<ArticleOfImpeachment[]>(mockArticles);
  const [subjectName, setSubjectName] = useState('Director Marcus Vance, Esq.');
  const [jurisdiction, setJurisdiction] = useState('Federal (US District Court / House Judiciary Committee)');
  const [proceedingType, setProceedingType] = useState('Congressional Impeachment & Trial Cross-Examination');
  const [searchFilter, setSearchFilter] = useState('');
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(100);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Filter contradictions
  const filteredContradictions = useMemo(() => {
    return contradictionsList.filter(c =>
      c.sourceA.excerpt.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.sourceB.excerpt.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.statutoryBasis.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [contradictionsList, searchFilter]);

  const handleCopyClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleSimulateRegenerate = () => {
    setIsGeneratingDoc(true);
    setGenerationProgress(20);
    setTimeout(() => setGenerationProgress(55), 400);
    setTimeout(() => setGenerationProgress(85), 800);
    setTimeout(() => {
      setGenerationProgress(100);
      setIsGeneratingDoc(false);
    }, 1100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-950/70 border border-red-700/50 rounded-lg text-red-400">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-800/40">
                Pipeline #27
              </span>
              <h1 className="text-lg font-bold text-white tracking-tight">Automated Impeachment Documentation Engine</h1>
            </div>
            <p className="text-xs text-slate-400">FRE 613/801 Inconsistency Extraction & Congressional Articles Generator</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">Evidentiary Strength</div>
            <div className="text-sm font-semibold text-emerald-400 flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 97.4% Irrefutable
            </div>
          </div>
          <button
            onClick={handleSimulateRegenerate}
            disabled={isGeneratingDoc}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 active:scale-95 text-white font-medium text-xs rounded-lg shadow-lg shadow-red-950/40 border border-red-500/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingDoc ? 'animate-spin' : ''}`} />
            {isGeneratingDoc ? `Compiling (${generationProgress}%)` : 'Regenerate Document'}
          </button>
        </div>
      </header>

      {/* Target Spec Header Meta */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
            <span className="text-slate-500 uppercase tracking-wider font-mono block text-[10px]">Target / Witness</span>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none w-full border-b border-transparent focus:border-red-500/50"
            />
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
            <span className="text-slate-500 uppercase tracking-wider font-mono block text-[10px]">Jurisdiction</span>
            <input
              type="text"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none w-full border-b border-transparent focus:border-red-500/50"
            />
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
            <span className="text-slate-500 uppercase tracking-wider font-mono block text-[10px]">Proceeding Category</span>
            <input
              type="text"
              value={proceedingType}
              onChange={(e) => setProceedingType(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none w-full border-b border-transparent focus:border-red-500/50"
            />
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-slate-500 uppercase tracking-wider font-mono block text-[10px]">Detected Contradictions</span>
              <span className="text-slate-200 font-bold text-sm">{filteredContradictions.length} Verified Items</span>
            </div>
            <span className="px-2 py-1 bg-red-950/80 border border-red-700/60 rounded text-[11px] text-red-300 font-mono">
              3 High Impact
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1 px-6 border-b border-slate-800 bg-slate-950 text-xs font-medium">
        <button
          onClick={() => setActiveTab('inconsistencies')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'inconsistencies'
              ? 'border-red-500 text-red-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <SplitSquareVertical className="w-3.5 h-3.5" />
          Contradiction Matrix (FRE 613)
        </button>

        <button
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'articles'
              ? 'border-red-500 text-red-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          Articles of Impeachment ({articlesList.length})
        </button>

        <button
          onClick={() => setActiveTab('packet')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'packet'
              ? 'border-red-500 text-red-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Cross-Examination Outline
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-red-500 text-red-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          Final Formal Resolution View
        </button>
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* TAB 1: INCONSISTENCIES MATRIX */}
        {activeTab === 'inconsistencies' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List Column */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter by citation, keyword, statute..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500/60"
                />
              </div>

              <div className="flex flex-col gap-2">
                {filteredContradictions.map((item) => {
                  const isSelected = selectedContradiction.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedContradiction(item)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-900 border-red-500/80 shadow-lg shadow-red-950/20 ring-1 ring-red-500/30'
                          : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[11px] font-bold text-red-400">{item.id}</span>
                        <span className="px-2 py-0.5 bg-red-950 text-red-300 text-[10px] rounded border border-red-800/50 font-semibold">
                          {item.severity}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-200 mb-1">{item.category}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-2 italic mb-2">
                        "{item.sourceA.excerpt}"
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/60">
                        <span>Score: {item.confidenceScore}%</span>
                        <span className="truncate max-w-[180px]">{item.statutoryBasis}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detail Column (Side-by-Side Comparison) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-red-400">Contradiction Analysis</span>
                    <h2 className="text-base font-bold text-white">{selectedContradiction.id} — {selectedContradiction.category}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">Governing Statutory Authority</span>
                    <span className="text-xs font-semibold text-amber-300">{selectedContradiction.statutoryBasis}</span>
                  </div>
                </div>

                {/* Direct Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Prior Statement (A) */}
                  <div className="bg-slate-950/80 border border-amber-900/30 rounded-lg p-4 relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wide text-amber-400 font-semibold">Statement A (Sworn Record)</span>
                      <span className="text-[10px] text-slate-500">{selectedContradiction.sourceA.date}</span>
                    </div>
                    <div className="text-xs font-medium text-slate-300 mb-2">{selectedContradiction.sourceA.title}</div>
                    <blockquote className="text-xs text-amber-200/90 italic bg-amber-950/20 p-2.5 rounded border border-amber-800/20 mb-2">
                      {selectedContradiction.sourceA.excerpt}
                    </blockquote>
                    <div className="text-[10px] font-mono text-slate-500">{selectedContradiction.sourceA.citation}</div>
                  </div>

                  {/* Conflicting Record (B) */}
                  <div className="bg-slate-950/80 border border-red-900/30 rounded-lg p-4 relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wide text-red-400 font-semibold">Statement B (Hard Evidence)</span>
                      <span className="text-[10px] text-slate-500">{selectedContradiction.sourceB.date}</span>
                    </div>
                    <div className="text-xs font-medium text-slate-300 mb-2">{selectedContradiction.sourceB.title}</div>
                    <blockquote className="text-xs text-red-200/90 italic bg-red-950/20 p-2.5 rounded border border-red-800/20 mb-2">
                      {selectedContradiction.sourceB.excerpt}
                    </blockquote>
                    <div className="text-[10px] font-mono text-slate-500">{selectedContradiction.sourceB.citation}</div>
                  </div>
                </div>

                {/* Generated Cross Exam Foundation */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Suggested Rule 613 Impeachment Line of Questioning
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900 p-3 rounded border border-slate-800">
                    {selectedContradiction.crossExamQuestion}
                  </p>
                </div>

                {/* Foundation Checklist */}
                <div className="bg-slate-950/50 border border-slate-800/80 rounded-lg p-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2 font-bold">Rule 613 / Foundation Checklist</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-300">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Check className="w-3.5 h-3.5" /> Prior Statement Fixed in Time/Place
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Check className="w-3.5 h-3.5" /> Witness Opportunity to Explain/Deny
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Check className="w-3.5 h-3.5" /> Extrinsic Proof Inadmissibility Guarded
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-4">
                <button
                  onClick={() => handleCopyClipboard(selectedContradiction.crossExamQuestion)}
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedNotification ? 'Copied to Clipboard!' : 'Copy Cross Exam Question'}
                </button>

                <button
                  onClick={() => setActiveTab('articles')}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium"
                >
                  View Related Article <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ARTICLES OF IMPEACHMENT */}
        {activeTab === 'articles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div>
                <h2 className="text-sm font-bold text-white">Drafted Articles of Impeachment & Misconduct Counts</h2>
                <p className="text-xs text-slate-400">
                  Synthesized from verified evidentiary contradictions according to Constitutional & Statutory criteria.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Subject: <strong className="text-slate-200">{subjectName}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {articlesList.map((article, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-red-950 border border-red-800/80 rounded text-red-300 font-mono text-xs font-bold">
                        {article.articleNumber}
                      </span>
                      <h3 className="text-sm font-bold text-slate-100">{article.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-amber-300 bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded">
                        {article.statute}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold font-mono ${
                        article.status === 'Approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {article.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                    {article.summary}
                  </p>

                  <div className="bg-slate-950/70 rounded-lg p-3 border border-slate-800/80 mb-3">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1.5 font-bold">
                      Factual & Evidentiary Grounds
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                      {article.factualBasis.map((f, fIdx) => (
                        <li key={fIdx} className="leading-snug">{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Attached Exhibits:</span>
                    {article.exhibitCitations.map((ex, exIdx) => (
                      <span key={exIdx} className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CROSS-EXAMINATION PACKET */}
        {activeTab === 'packet' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <h2 className="text-base font-bold text-white">Trial & Hearing Impeachment Packet</h2>
                <p className="text-xs text-slate-400">Step-by-step cross-examination playbook designed for immediate trial use.</p>
              </div>
              <button
                onClick={() => handleCopyClipboard("Cross-Examination Outline Copied")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded text-slate-200 border border-slate-700"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Complete Sequence
              </button>
            </div>

            <div className="space-y-6">
              {mockContradictions.map((c, index) => (
                <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-red-400">
                      PHASE {index + 1}: COMMIT - CREDIT - CONFRONT ({c.id})
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Target: {c.statutoryBasis}</span>
                  </div>

                  {/* 3-C Strategy */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-4">
                    <div className="bg-slate-900 p-3 rounded border border-slate-800">
                      <span className="text-[10px] font-mono uppercase text-amber-400 block font-bold mb-1">1. Commit</span>
                      <p className="text-slate-300">
                        Re-affirm the testimony given today without letting the witness qualify or soften the claim.
                      </p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-800">
                      <span className="text-[10px] font-mono uppercase text-sky-400 block font-bold mb-1">2. Credit</span>
                      <p className="text-slate-300">
                        Authenticate the prior sworn venue ({c.sourceA.title}), verifying oath obligations and clarity.
                      </p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-800">
                      <span className="text-[10px] font-mono uppercase text-red-400 block font-bold mb-1">3. Confront</span>
                      <p className="text-slate-300">
                        Present the contradictory evidence ({c.sourceB.citation}) and demand yes/no confirmation.
                      </p>
                    </div>
                  </div>

                  <div className="bg-red-950/20 border border-red-900/40 rounded p-3 text-xs font-mono text-red-200">
                    <span className="text-[10px] text-red-400 font-bold block mb-1 uppercase font-sans">Formal Scripted Question:</span>
                    {c.crossExamQuestion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PREVIEW / FORMAL RESOLUTION */}
        {activeTab === 'preview' && (
          <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl text-slate-200 font-serif leading-relaxed">
            {/* Header & Seal Symbolism */}
            <div className="text-center pb-6 border-b-2 border-slate-800 mb-6 font-sans">
              <div className="inline-flex items-center justify-center p-3 bg-red-950/60 rounded-full border border-red-700/40 text-red-400 mb-2">
                <Gavel className="w-8 h-8" />
              </div>
              <h2 className="text-xs uppercase tracking-widest font-mono text-red-400 font-bold">
                Official Resolution of Impeachment & High Misconduct
              </h2>
              <h1 className="text-xl font-bold text-white mt-1">
                IN THE MATTER OF THE IMPEACHMENT OF {subjectName.toUpperCase()}
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Jurisdiction: {jurisdiction} | Document Ref: RES-2025-IMP-027
              </p>
            </div>

            {/* Formal Text */}
            <div className="space-y-6 text-xs text-slate-300">
              <p className="font-semibold text-slate-200 text-center italic">
                Resolved, That the named subject, {subjectName}, is impeached for high crimes, misdemeanors, and perjury under oath, and that the following Articles of Impeachment be exhibited:
              </p>

              {articlesList.map((art, idx) => (
                <div key={idx} className="space-y-2 border-t border-slate-800/80 pt-4">
                  <h3 className="font-sans font-bold text-sm text-red-400 text-center tracking-wider">
                    {art.articleNumber.toUpperCase()}
                  </h3>
                  <h4 className="font-sans font-semibold text-xs text-center text-slate-200 mb-2">
                    {art.title.toUpperCase()}
                  </h4>
                  <p className="text-justify indent-6 leading-normal">
                    {art.summary} In that on multiple dates and venues subject to statutory solemnity, said official acted in direct contravention of governing laws, specifically citing {art.statute}.
                  </p>
                  <p className="text-justify indent-6 leading-normal">
                    Wherefore, by reason of the premises, {subjectName} was and is guilty of high misconduct, warranting disqualification and formal impeachment from office.
                  </p>
                </div>
              ))}
            </div>

            {/* Document Footer */}
            <div className="mt-10 pt-6 border-t-2 border-slate-800 flex items-center justify-between font-sans text-[11px] text-slate-400">
              <div>
                <span>Automated Integrity Verification: </span>
                <span className="font-mono text-emerald-400 font-bold">SHA256: 9e88a1004bc...</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyClipboard("Document text exported.")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Export Resolution
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Status Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 px-6 py-2.5 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Statutory Audit: Strict FRE Compliant
          </span>
          <span className="hidden sm:inline-block">|</span>
          <span className="font-mono text-slate-400">Engine: Contradiction-Transformer v4.9</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400">Pipeline #27 • Ready</span>
        </div>
      </footer>
    </div>
  );
}