import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io';
// NOTE: In a real application, this token would be retrieved from a successful login via /users/login
const MOCK_ACCESS_TOKEN = 'mock_jwt_for_auth_in_blueprint'; 

type UIPersona = 'ANALYTICAL_INTROVERT' | 'CREATIVE_EXTRAVERT' | 'DEFAULT';

interface UIState {
  persona: UIPersona;
  layout: 'DENSE' | 'SPARSE';
  colorTheme: 'MONOCHROME' | 'VIBRANT';
  componentSet: string[];
}

// Helper function to map API data to UI state based on AI insights
const mapApiDataToUIState = (profile: any, preferences: any): UIState => {
    const aiPersona = profile?.aiPersona || 'DEFAULT';
    const theme = preferences?.theme || 'Light-Default';
    const interactionMode = preferences?.aiInteractionMode || 'balanced';

    let persona: UIPersona = 'DEFAULT';
    let layout: 'DENSE' | 'SPARSE' = 'SPARSE';
    let colorTheme: 'MONOCHROME' | 'VIBRANT' = 'VIBRANT';
    let componentSet: string[] = ['Chat', 'QuickActions'];

    // 1. Determine Persona and Core Components based on AI Persona
    if (aiPersona.includes('Planner') || aiPersona.includes('Saver')) {
        persona = 'ANALYTICAL_INTROVERT';
        componentSet = ['DataGrid', 'Chart', 'ExportButton', 'RiskMetrics'];
    } else if (aiPersona.includes('Visionary') || aiPersona.includes('Pro')) {
        persona = 'CREATIVE_EXTRAVERT';
        componentSet = ['MoodBoard', 'AIAdvisor', 'Marketplace', 'Web3Dashboard'];
    }

    // 2. Determine Theme based on user preference
    if (theme.includes('Dark-Quantum') || theme.includes('Monochrome')) {
        colorTheme = 'MONOCHROME';
    }

    // 3. Determine Layout based on AI interaction mode
    if (interactionMode === 'proactive') {
        layout = 'DENSE';
    }

    return { persona, layout, colorTheme, componentSet };
};


const AdaptiveUITailorView: React.FC = () => {
  const [uiState, setUiState] = useState<UIState>({ 
    persona: 'DEFAULT', 
    layout: 'SPARSE', 
    colorTheme: 'VIBRANT', 
    componentSet: ['Loading...']
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdaptiveUI = async () => {
      setLoading(true);
      setError(null);

      const headers = {
        'Authorization': `Bearer ${MOCK_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      };

      try {
        // Fetch User Profile (for aiPersona)
        const profileResponse = await fetch(`${API_BASE_URL}/users/me`, { headers });
        if (!profileResponse.ok) throw new Error(`Failed to fetch profile: ${profileResponse.statusText}`);
        const profile = await profileResponse.json();

        // Fetch User Preferences (for theme and interaction mode)
        const preferencesResponse = await fetch(`${API_BASE_URL}/users/me/preferences`, { headers });
        if (!preferencesResponse.ok) throw new Error(`Failed to fetch preferences: ${preferencesResponse.statusText}`);
        const preferences = await preferencesResponse.json();

        // Apply AI-driven tailoring
        const newUiState = mapApiDataToUIState(profile, preferences);
        setUiState(newUiState);

      } catch (err) {
        console.error("Error fetching adaptive UI data:", err);
        setError(`Error: ${(err as Error).message}. Using default UI.`);
        setUiState({
            persona: 'DEFAULT',
            layout: 'SPARSE',
            colorTheme: 'VIBRANT',
            componentSet: ['ErrorPanel', 'FallbackChat']
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdaptiveUI();
  }, []);

  const themeClass = uiState.colorTheme === 'MONOCHROME' ? 'bg-gray-900 text-gray-200' : 'bg-indigo-600 text-white';
  const layoutStyle = uiState.layout === 'DENSE' ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-4';

  return (
    <div className={`${themeClass} p-6 rounded-xl shadow-2xl transition-all duration-500`}>
      <h1 className="text-3xl font-extrabold mb-2">
        Quantum Core 3.0 UI
      </h1>
      {loading ? (
        <p className="text-lg animate-pulse">Analyzing user profile via AI...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">
            Adaptive Mode: {uiState.persona}
          </h2>
          <p className="text-sm opacity-80 mb-4">
            Layout: {uiState.layout} | Theme: {uiState.colorTheme}
          </p>
          <div className="mt-4 p-4 border border-dashed border-gray-500 rounded-lg">
            <h3 className="text-lg font-bold mb-3">Bad Ass Components Activated:</h3>
            <div className={layoutStyle}>
                {uiState.componentSet.map(comp => (
                    <div 
                        key={comp} 
                        className={`p-4 rounded-lg shadow-md 
                            ${uiState.colorTheme === 'MONOCHROME' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-indigo-700 hover:bg-indigo-800'}
                            ${uiState.layout === 'DENSE' ? 'text-sm' : 'text-base'}
                        `}
                    >
                        {comp}
                    </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default AdaptiveUITailorView;