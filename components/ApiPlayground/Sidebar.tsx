import React, { useState } from 'react';

interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  category: string;
}

interface SidebarProps {
  endpoints: Endpoint[];
  onSelect: (endpoint: Endpoint) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ endpoints, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEndpoints = endpoints.filter(
    (ep) =>
      ep.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ep.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(filteredEndpoints.map((ep) => ep.category)));

  return (
    <div className="w-64 h-full bg-gray-900 text-white flex flex-col border-r border-gray-800">
      <div className="p-4">
        <input
          type="text"
          placeholder="Search endpoints..."
          className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:border-blue-500 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {categories.map((category) => (
          <div key={category} className="mb-4">
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {category}
            </h3>
            <ul>
              {filteredEndpoints
                .filter((ep) => ep.category === category)
                .map((ep) => (
                  <li
                    key={ep.id}
                    onClick={() => onSelect(ep)}
                    className="px-4 py-2 hover:bg-gray-800 cursor-pointer flex items-center gap-2 text-sm transition-colors"
                  >
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        ep.method === 'GET' ? 'bg-green-900 text-green-300' :
                        ep.method === 'POST' ? 'bg-blue-900 text-blue-300' :
                        ep.method === 'PUT' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-red-900 text-red-300'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="truncate">{ep.path}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};