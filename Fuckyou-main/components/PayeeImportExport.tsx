import React, { useState, useRef, DragEvent } from 'react';
import { 
  Upload, 
  Download, 
  FileJson, 
  AlertCircle, 
  CheckCircle2, 
  FileSpreadsheet, 
  ArrowRight, 
  Info, 
  X, 
  Check,
  RefreshCw
} from 'lucide-react';

// Define TypeScript interfaces matching the OpenAPI schemas
export interface InternalDomesticPayeeAdd {
  payeeType: 'internal';
  name: string;
  accountNumber: string;
  routingNumber?: string;
  email?: string;
  memo?: string;
}

export interface ExternalDomesticPayeeAdd {
  payeeType: 'external';
  name: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  email?: string;
  swiftCode?: string;
}

export type PayeeImportInput = InternalDomesticPayeeAdd | ExternalDomesticPayeeAdd;

interface ValidationError {
  index: number;
  payeeName: string;
  errors: string[];
}

interface PayeeImportExportProps {
  currentPayees?: any[];
  onImportSuccess?: (validPayees: PayeeImportInput[]) => void;
}

export default function PayeeImportExport({ 
  currentPayees = [], 
  onImportSuccess 
}: PayeeImportExportProps) {
  const [dragActive, setDragActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [validPayeesCount, setValidPayeesCount] = useState<number>(0);
  const [parsedPayees, setParsedPayees] = useState<PayeeImportInput[]>([]);
  const [rawJsonText, setRawJsonText] = useState<string>('');
  const [importMode, setImportMode] = useState<'file' | 'text'>('file');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Schema Validation Logic
  const validatePayees = (data: any): { valid: PayeeImportInput[]; errors: ValidationError[] } => {
    const errorsList: ValidationError[] = [];
    const validList: PayeeImportInput[] = [];

    if (!Array.isArray(data)) {
      return {
        valid: [],
        errors: [{ index: 0, payeeName: 'Root Level', errors: ['Imported data must be a JSON array of payee objects.'] }]
      };
    }

    data.forEach((item, index) => {
      const errors: string[] = [];
      const name = item.name || `Payee #${index + 1}`;

      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        errors.push("Field 'name' is required and must be a non-empty string.");
      }

      if (!item.payeeType || (item.payeeType !== 'internal' && item.payeeType !== 'external')) {
        errors.push("Field 'payeeType' is required and must be either 'internal' or 'external'.");
      }

      if (!item.accountNumber || typeof item.accountNumber !== 'string' || item.accountNumber.trim() === '') {
        errors.push("Field 'accountNumber' is required and must be a string.");
      } else if (!/^\d+$/.test(item.accountNumber)) {
        errors.push("Field 'accountNumber' must contain only digits.");
      }

      // Schema-specific validation
      if (item.payeeType === 'internal') {
        // Internal Domestic Payee validation
        if (item.routingNumber && !/^\d{9}$/.test(item.routingNumber)) {
          errors.push("Optional 'routingNumber' for internal payees must be exactly 9 digits.");
        }
      } else if (item.payeeType === 'external') {
        // External Domestic Payee validation
        if (!item.routingNumber || typeof item.routingNumber !== 'string' || !/^\d{9}$/.test(item.routingNumber)) {
          errors.push("Field 'routingNumber' is required for external payees and must be exactly 9 digits.");
        }
        if (!item.bankName || typeof item.bankName !== 'string' || item.bankName.trim() === '') {
          errors.push("Field 'bankName' is required for external payees.");
        }
      }

      if (item.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)) {
        errors.push("Field 'email' must be a valid email address format.");
      }

      if (errors.length > 0) {
        errorsList.push({ index, payeeName: name, errors });
      } else {
        validList.push(item as PayeeImportInput);
      }
    });

    return { valid: validList, errors: errorsList };
  };

  const handleDataProcessing = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      const { valid, errors } = validatePayees(parsed);
      
      setParsedPayees(valid);
      setValidationErrors(errors);
      setValidPayeesCount(valid.length);

      if (errors.length > 0) {
        setNotification({
          type: 'error',
          message: `Found validation issues in ${errors.length} record(s). Please review the errors below.`
        });
      } else if (valid.length > 0) {
        setNotification({
          type: 'success',
          message: `Successfully validated all ${valid.length} payees! Ready to import.`
        });
      } else {
        setNotification({
          type: 'error',
          message: 'No valid payee records found in the provided data.'
        });
      }
    } catch (e) {
      setValidationErrors([{ index: 0, payeeName: 'JSON Parser', errors: ['Invalid JSON format. Please check your syntax.'] }]);
      setParsedPayees([]);
      setValidPayeesCount(0);
      setNotification({
        type: 'error',
        message: 'Failed to parse JSON. Please ensure the file or text is valid JSON.'
      });
    }
  };

  // Drag and Drop Handlers
  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setRawJsonText(text);
        handleDataProcessing(text);
      }
    };
    reader.readAsText(file);
  };

  const handleTextSubmit = () => {
    handleDataProcessing(rawJsonText);
  };

  const executeImport = () => {
    if (parsedPayees.length > 0 && onImportSuccess) {
      onImportSuccess(parsedPayees);
      setNotification({
        type: 'success',
        message: `Successfully imported ${parsedPayees.length} payees into your list!`
      });
      // Reset state
      setParsedPayees([]);
      setValidationErrors([]);
      setValidPayeesCount(0);
      setRawJsonText('');
    }
  };

  // Export Logic
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentPayees, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `payees_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const downloadTemplate = () => {
    const template = [
      {
        payeeType: "internal",
        name: "Acme Internal Corp",
        accountNumber: "1234567890",
        routingNumber: "123456789",
        email: "billing@acmeinternal.com",
        memo: "Monthly internal settlement"
      },
      {
        payeeType: "external",
        name: "Global Logistics Ltd",
        accountNumber: "9876543210",
        routingNumber: "987654321",
        bankName: "Apex National Bank",
        email: "finance@globallogistics.com"
      }
    ];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(template, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "payee_import_template.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-950 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-indigo-400" />
            Payee Data Center
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Import and validate payee lists using OpenAPI schemas, or export your current directory.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 hover:bg-indigo-950/80 border border-indigo-900/50 rounded-lg transition-all flex items-center gap-2"
          >
            <Download className="h-3.5 w-3.5" />
            Download Template
          </button>
          <button
            onClick={handleExport}
            disabled={currentPayees.length === 0}
            className="px-4 py-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-900/50 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-3.5 w-3.5" />
            Export Current ({currentPayees.length})
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`p-4 flex items-start justify-between border-b ${
          notification.type === 'success' 
            ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300' 
            : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        
        {/* Left Panel: Import Area */}
        <div className="lg:col-span-7 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Import Payees</h3>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setImportMode('file')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  importMode === 'file' 
                    ? 'bg-indigo-600 text-white shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                File Upload
              </button>
              <button
                onClick={() => setImportMode('text')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  importMode === 'text' 
                    ? 'bg-indigo-600 text-white shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Paste JSON
              </button>
            </div>
          </div>

          {importMode === 'file' ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[240px] ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-950/20' 
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="p-4 bg-slate-900 rounded-full border border-slate-800 mb-4 shadow-inner">
                <Upload className="h-8 w-8 text-indigo-400" />
              </div>
              <p className="text-sm font-medium text-slate-200">
                Drag and drop your JSON file here, or <span className="text-indigo-400 hover:underline">browse</span>
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Supports standard JSON arrays matching Internal/External Domestic Payee schemas.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={rawJsonText}
                onChange={(e) => setRawJsonText(e.target.value)}
                placeholder="Paste your JSON array here..."
                className="w-full h-60 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleTextSubmit}
                  disabled={!rawJsonText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Validate JSON
                </button>
              </div>
            </div>
          )}

          {/* Schema Info Card */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex gap-3">
            <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-slate-200">Schema Validation Rules</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong>Internal Payees:</strong> Requires <code className="text-indigo-300">payeeType: "internal"</code>, <code className="text-indigo-300">name</code>, and <code className="text-indigo-300">accountNumber</code>.
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong>External Payees:</strong> Requires <code className="text-indigo-300">payeeType: "external"</code>, <code className="text-indigo-300">name</code>, <code className="text-indigo-300">accountNumber</code>, <code className="text-indigo-300">routingNumber</code> (9 digits), and <code className="text-indigo-300">bankName</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel: Validation Results & Actions */}
        <div className="lg:col-span-5 p-6 bg-slate-950/30 flex flex-col justify-between min-h-[400px]">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Validation Status</h3>
              <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800 text-slate-400">
                OpenAPI v3.0
              </span>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">{validPayeesCount}</div>
                <div className="text-xs text-slate-400 mt-1">Valid Records</div>
              </div>
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-center">
                <div className={`text-2xl font-bold ${validationErrors.length > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                  {validationErrors.length}
                </div>
                <div className="text-xs text-slate-400 mt-1">Invalid Records</div>
              </div>
            </div>

            {/* Error Log / Success State */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Details</h4>
              
              {validationErrors.length === 0 && parsedPayees.length === 0 && (
                <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm">
                  No data loaded yet. Upload a file or paste JSON to run validation.
                </div>
              )}

              {validationErrors.length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {validationErrors.map((err, idx) => (
                    <div key={idx} className="bg-rose-950/20 border border-rose-900/30 rounded-lg p-3 text-xs">
                      <div className="flex items-center justify-between text-rose-300 font-semibold mb-1">
                        <span>{err.payeeName}</span>
                        <span className="text-[10px] bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800/50">
                          Index {err.index}
                        </span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-rose-400/90">
                        {err.errors.map((msg, mIdx) => (
                          <li key={mIdx}>{msg}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {parsedPayees.length > 0 && validationErrors.length === 0 && (
                <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 text-center space-y-3">
                  <div className="inline-flex p-2 bg-emerald-950 rounded-full border border-emerald-800/50 text-emerald-400">
                    <Check className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-emerald-300">All Checks Passed</h5>
                    <p className="text-xs text-emerald-500/90 mt-1">
                      All records conform perfectly to the OpenAPI schemas.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6 border-t border-slate-800/80 mt-6">
            <button
              onClick={executeImport}
              disabled={parsedPayees.length === 0}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 disabled:shadow-none"
            >
              <span>Import {parsedPayees.length} Valid Payees</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}