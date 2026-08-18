import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { datadogLogs } from '@datadog/browser-logs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SpeedInsights } from '@vercel/speed-insights/react';

/* ---------- Datadog ---------- */
datadogLogs.init({
  clientToken: 'pub71d163b6b3e6eb0c97a06e848c97301e',
  site: 'us5.datadoghq.com',
  forwardErrorsToLogs: true,
  sessionSampleRate: 100,
});

/* ---------- React Query ---------- */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30,
    },
  },
});

/* ---------- Mount Logic ---------- */
const rootElement = document.getElementById('root');
const loadingElement = document.getElementById('loading');

if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);

// The 'sync' function handles the handover from static HTML to React
const hideLoader = () => {
  if (loadingElement) loadingElement.style.display = 'none';
  if (rootElement) rootElement.style.display = 'flex';
};

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* We pass the hideLoader logic into App, 
        or simply call it here after the first render 
      */}
      <App onMount={hideLoader} />
      <SpeedInsights />
    </QueryClientProvider>
  </React.StrictMode>
);
