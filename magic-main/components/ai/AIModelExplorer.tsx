import React, { useState, useMemo, useCallback, useEffect } from 'react';

// Define the AITool interface based on the new API
interface AITool {
  id: string;
  name: string;
  provider: string;
  description: string;
  accessScope: string;
  category: string;
  parameters: {
    type: 'object';
    properties: {
      [key: string]: {
        type: string;
        description: string;
      };
    };
    required: string[];
  };
}

// API endpoint
const API_URL = 'https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io/ai/advisor/tools';

// Helper to categorize tools
const categorizeTool = (name: string): string => {
  if (name.toLowerCase().includes('money') || name.toLowerCase().includes('payment')) {
    return 'Payments';
  }
  if (name.toLowerCase().includes('account') || name.toLowerCase().includes('balance')) {
    return 'Account Information';
  }
  return 'General';
};

// ToolCard Component: Displays a summary of an AI tool in the list
const ToolCard: React.FC<{ tool: AITool; onSelect: (tool: AITool) => void; isSelected: boolean }> = ({ tool, onSelect, isSelected }) => (
  <div
    className={`p-4 border rounded-lg shadow-sm cursor-pointer transition-all duration-200
                ${isSelected ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' : 'border-gray-200 hover:shadow-md hover:border-gray-300'}`}
    onClick={() => onSelect(tool)}
  >
    <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
    <p className="text-sm text-gray-600 mb-2">{tool.provider} - {tool.category}</p>
    <p className="text-sm text-gray-700 line-clamp-2">{tool.description}</p>
    <div className="mt-3 flex flex-wrap gap-2">
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
        Scope: {tool.accessScope}
      </span>
    </div>
  </div>
);

// ParameterDetail Component: Renders the parameter schema
const ParameterDetail: React.FC<{ parameters: AITool['parameters'] }> = ({ parameters }) => (
  <div>
    <h3 className="font-semibold text-gray-700 mb-2">Parameters:</h3>
    <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-md border">
      {Object.entries(parameters.properties).map(([name, schema]) => (
        <div key={name}>
          <code className="font-mono text-gray-800 font-bold">{name}</code>
          <span className="text-gray-500 ml-2">({schema.type})</span>
          {parameters.required?.includes(name) && <span className="ml-2 text-red-600 font-semibold">Required</span>}
          <p className="text-gray-600 pl-2">{schema.description}</p>
        </div>
      ))}
    </div>
  </div>
);

// ToolDetail Component: Displays comprehensive information about a selected AI tool
const ToolDetail: React.FC<{ tool: AITool }> = ({ tool }) => (
  <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
    <h2 className="text-2xl font-bold text-gray-900 mb-2">{tool.name}</h2>
    <p className="text-md text-gray-600 mb-4">{tool.provider} - {tool.category}</p>

    <p className="text-gray-800 mb-4">{tool.description}</p>

    <div className="grid grid-cols-1 gap-4 mb-4">
      <div>
        <h3 className="font-semibold text-gray-700">Access Scope:</h3>
        <p className="text-gray-600">{tool.accessScope}</p>
      </div>
    </div>

    {tool.parameters && tool.parameters.properties && (
      <ParameterDetail parameters={tool.parameters} />
    )}
  </div>
);

// Main AIModelExplorer Component: Allows users to browse, search, and filter AI tools
const AIModelExplorer: React.FC = () => {
  const [tools, setTools] = useState<AITool[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Transform API data to AITool interface
        const transformedTools: AITool[] = data.data.map((tool: any) => ({
          id: tool.name,
          name: tool.name,
          provider: 'Quantum AI',
          description: tool.description,
          accessScope: tool.accessScope,
          category: categorizeTool(tool.name),
          parameters: tool.parameters,
        }));

        setTools(transformedTools);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTools();
  }, []);

  // Dynamically get all unique categories from the fetched tools
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    tools.forEach(tool => categories.add(tool.category));
    return ['All', ...Array.from(categories).sort()];
  }, [tools]);

  // Filter tools based on search term and category
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tool.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || tool.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, filterCategory, tools]);

  // Callback for selecting a tool from the list
  const handleSelectTool = useCallback((tool: AITool) => {
    setSelectedTool(tool);
  }, []);

  // Effect to manage selectedTool when filteredTools change
  useEffect(() => {
    if (!selectedTool && filteredTools.length > 0) {
      setSelectedTool(filteredTools[0]);
    } else if (selectedTool && !filteredTools.some(t => t.id === selectedTool.id)) {
      setSelectedTool(filteredTools.length > 0 ? filteredTools[0] : null);
    }
  }, [filteredTools, selectedTool]);

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2 text-center">Quantum AI Tool Explorer</h1>
      <p className="text-center text-gray-600 mb-8">Explore the capabilities of the Quantum AI Advisor.</p>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search tools by name or description..."
          className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-3 border border-gray-300 rounded-lg shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500 md:w-auto w-full"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          {allCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Tool List and Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tool List */}
        <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md border border-gray-200 max-h-[calc(100vh-200px)] overflow-y-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Tools ({filteredTools.length})</h2>
          {isLoading ? (
            <p className="text-gray-600 text-center py-8">Loading tools...</p>
          ) : error ? (
            <p className="text-red-600 text-center py-8">Error: {error}</p>
          ) : (
            <div className="space-y-4">
              {filteredTools.length > 0 ? (
                filteredTools.map(tool => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onSelect={handleSelectTool}
                    isSelected={selectedTool?.id === tool.id}
                  />
                ))
              ) : (
                <p className="text-gray-600 text-center py-8">No tools found matching your criteria.</p>
              )}
            </div>
          )}
        </div>

        {/* Tool Detail */}
        <div className="lg:col-span-2">
          {selectedTool ? (
            <ToolDetail tool={selectedTool} />
          ) : (
            <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200 text-center flex items-center justify-center h-full min-h-[300px]">
              <p className="text-gray-600 text-lg">
                {isLoading ? 'Loading...' : 'Select a tool from the left to view its details.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIModelExplorer;