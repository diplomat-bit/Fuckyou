import React, { useState } from 'react';
import { Database, Search, Code, CheckCircle, Layers, FileCode } from 'lucide-react';

export interface SchemaItem {
  name: string;
  version: string;
  category: string;
  fieldsCount: number;
  description: string;
}

export const SchemaCatalogComponent: React.FC = () => {
  const [schemas] = useState<SchemaItem[]>([
    { name: 'camt.053.001.08', version: 'v8.2', category: 'ISO 20022', fieldsCount: 84, description: 'Bank-to-Customer Statement XML Schema Definition.' },
    { name: 'pain.001.001.09', version: 'v9.0', category: 'ISO 20022', fieldsCount: 96, description: 'Customer Credit Transfer Initiation Schema.' },
    { name: 'pacs.008.001.10', version: 'v10.1', category: 'ISO 20022', fieldsCount: 112, description: 'Financial Institution Customer Credit Transfer.' },
    { name: 'CitiAccountPayload', version: 'v2.4', category: 'Proprietary', fieldsCount: 45, description: 'Citibank Sovereign Account Data Ingestion Schema.' },
    { name: 'DcrOAuthRegistration', version: 'v1.0', category: 'Security', fieldsCount: 28, description: 'Dynamic Client Registration specification schema.' }
  ]);
  const [search, setSearch] = useState('');

  const filteredSchemas = schemas.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-900 text-slate-100 min-h-screen rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-cyan-400">
            <Database className="w-7 h-7" /> Schema Catalog & Protocol Registry
          </h1>
          <p className="text-sm text-slate-400 mt-1">Explore, validate, and inspect XML/JSON schemas for institutional messaging and financial bridges.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search schemas by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchemas.map((schema, index) => (
          <div key={index} className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/80 space-y-4 backdrop-blur shadow-xl flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">{schema.category}</span>
                <span className="text-xs font-mono text-slate-400">{schema.version}</span>
              </div>
              <h3 className="text-lg font-bold text-white font-mono">{schema.name}</h3>
              <p className="text-xs text-slate-300">{schema.description}</p>
            </div>
            <div className="pt-4 border-t border-slate-700/60 flex justify-between items-center text-xs text-slate-400">
              <span>Fields: <strong className="text-white font-mono">{schema.fieldsCount}</strong></span>
              <button className="px-3 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 rounded-lg border border-cyan-700 transition font-medium flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5" /> Inspect Schema
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
