import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Upload, FileText, X } from 'lucide-react';

type DocumentStatus = 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  status: DocumentStatus;
  applicantType: 'PRIMARY' | 'CO-APPLICANT';
}

const INITIAL_DOCUMENTS: DocumentItem[] = [
  { id: 'doc-001', name: 'Government ID', type: 'Identity', status: 'PENDING', applicantType: 'PRIMARY' },
  { id: 'doc-002', name: 'Proof of Address', type: 'Utility Bill', status: 'PENDING', applicantType: 'PRIMARY' },
  { id: 'doc-003', name: 'Tax Return 2023', type: 'Financial', status: 'SUBMITTED', applicantType: 'PRIMARY' },
  { id: 'doc-004', name: 'Government ID', type: 'Identity', status: 'VERIFIED', applicantType: 'CO-APPLICANT' },
];

const StatusBadge = ({ status }: { status: DocumentStatus }) => {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    SUBMITTED: 'bg-blue-100 text-blue-800 border-blue-200',
    VERIFIED: 'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
  };

  const icons = {
    PENDING: <Clock className="w-3 h-3 mr-1" />,
    SUBMITTED: <Upload className="w-3 h-3 mr-1" />,
    VERIFIED: <CheckCircle className="w-3 h-3 mr-1" />,
    REJECTED: <AlertCircle className="w-3 h-3 mr-1" />,
  };

  return (
    <span className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
};

export default function OnboardingDocumentChecklist() {
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);

  const handleUpload = (id: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, status: 'SUBMITTED' } : doc
    ));
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-900">Required Documents</h2>
        <p className="text-sm text-slate-500">Please upload all necessary documentation to proceed with your application.</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Document Name</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Applicant</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <span className="text-sm font-medium text-slate-900">{doc.name}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{doc.type}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{doc.applicantType}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={doc.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  {doc.status === 'PENDING' || doc.status === 'REJECTED' ? (
                    <button 
                      onClick={() => handleUpload(doc.id)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Upload
                    </button>
                  ) : (
                    <span className="text-sm text-slate-400 cursor-not-allowed">Locked</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          Submit All Documents
        </button>
      </div>
    </div>
  );
}