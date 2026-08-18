import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, FileText, Upload, Download } from 'lucide-react';

interface DocumentItem {
  id: string;
  name: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  lastUpdated: string;
  description: string;
}

const initialDocuments: DocumentItem[] = [
  { id: '1', name: 'Product Specification Sheet', status: 'approved', lastUpdated: '2023-10-15', description: 'Detailed technical specifications of the product.' },
  { id: '2', name: 'Safety Compliance Certificate', status: 'submitted', lastUpdated: '2023-10-20', description: 'Official safety testing results.' },
  { id: '3', name: 'User Manual Draft', status: 'pending', lastUpdated: '2023-10-22', description: 'Draft version of the end-user documentation.' },
  { id: '4', name: 'Quality Assurance Report', status: 'rejected', lastUpdated: '2023-10-21', description: 'Internal QA audit findings.' },
];

const StatusBadge = ({ status }: { status: DocumentItem['status'] }) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    submitted: 'bg-blue-100 text-blue-800 border-blue-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  };

  const icons = {
    pending: <Clock className="w-3 h-3 mr-1" />,
    submitted: <Upload className="w-3 h-3 mr-1" />,
    approved: <CheckCircle className="w-3 h-3 mr-1" />,
    rejected: <AlertCircle className="w-3 h-3 mr-1" />,
  };

  return (
    <span className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function RequiredDocumentList() {
  const [documents] = useState<DocumentItem[]>(initialDocuments);

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Required Documents</h2>
        <p className="text-sm text-gray-500">Track the status of your application requirements.</p>
      </div>
      <div className="divide-y divide-gray-100">
        {documents.map((doc) => (
          <div key={doc.id} className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">{doc.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                <p className="text-[10px] text-gray-400 mt-1">Last updated: {doc.lastUpdated}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <StatusBadge status={doc.status} />
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-right">
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
          View All Documents
        </button>
      </div>
    </div>
  );
}