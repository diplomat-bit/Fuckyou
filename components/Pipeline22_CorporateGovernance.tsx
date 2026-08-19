

// --- CONSOLIDATED FROM: ./pipelines/Pipeline22_CorporateGovernance.tsx ---

import React, { useState } from 'react';
import { ShieldCheck, FileText, AlertTriangle, CheckCircle, Search } from 'lucide-react';

interface GovernanceAuditResult {
  id: string;
  category: string;
  status: 'compliant' | 'non-compliant' | 'warning';
  description: string;
  remediation: string;
}

const Pipeline22_CorporateGovernance: React.FC = () => {
  const [auditData] = useState<GovernanceAuditResult[]>([
    { id: 'CG-001', category: 'Board Composition', status: 'compliant', description: 'Independent directors meet the 50% threshold.', remediation: 'None required.' },
    { id: 'CG-002', category: 'Conflict of Interest', status: 'warning', description: 'Annual disclosures pending for 3 executive members.', remediation: 'Send reminder notifications.' },
    { id: 'CG-003', category: 'Regulatory Filing', status: 'non-compliant', description: 'Q3 SEC filing missing required ESG annex.', remediation: 'Draft and submit supplemental filing.' },
  ]);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="text-blue-600" />
          Pipeline 22: Corporate Governance Audit
        </h1>
        <p className="text-slate-600">Automated compliance monitoring and governance reporting dashboard.</p>
      </header>

      <div className="grid gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Audit Findings</h2>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              <Search size={16} /> Run Full Audit
            </button>
          </div>

          <div className="space-y-4">
            {auditData.map((item) => (
              <div key={item.id} className="border-l-4 border-slate-200 bg-slate-50 p-4 rounded-r flex items-start gap-4">
                <div className="mt-1">
                  {item.status === 'compliant' && <CheckCircle className="text-green-500" />}
                  {item.status === 'warning' && <AlertTriangle className="text-yellow-500" />}
                  {item.status === 'non-compliant' && <AlertTriangle className="text-red-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-800">{item.category}</span>
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                      item.status === 'compliant' ? 'bg-green-100 text-green-700' : 
                      item.status === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                  <div className="mt-3 text-xs bg-white p-2 rounded border border-slate-200">
                    <span className="font-semibold text-slate-500">Remediation:</span> {item.remediation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText size={18} /> Compliance Documentation
            </h3>
            <ul className="text-sm text-blue-600 space-y-2">
              <li className="cursor-pointer hover:underline">Board Charter 2024.pdf</li>
              <li className="cursor-pointer hover:underline">Code of Ethics Policy.docx</li>
              <li className="cursor-pointer hover:underline">Whistleblower Protocol.pdf</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-semibold mb-4">Audit Summary</h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>Last Scan: 2023-10-27 09:00 UTC</p>
              <p>Compliance Score: 88%</p>
              <p>Pending Actions: 2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pipeline22_CorporateGovernance;