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


// --- CONSOLIDATED FROM: ./index.tsx ---

import React, { StrictMode, useState, useEffect, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { DataProvider } from './context/DataContext';
import { FirebaseProvider } from './context/FirebaseContext';
import ErrorBoundary from './components/ErrorBoundary';
import * as Sentry from "@sentry/react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { PortalProvider } from './context/PortalContext';
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";

/**
 * SOVEREIGN OS - GENESIS BLOCK
 * Observability & Neural Core Initialization
 */

// Production-grade error suppression for ResizeObserver issues common in heavy dashboard layouts.
const IGNORED_ERRORS = [
  'ResizeObserver loop completed with undelivered notifications.',
  'ResizeObserver loop limit exceeded'
];

window.addEventListener('error', (e) => {
  if (IGNORED_ERRORS.includes(e.message)) {
    // Prevent the error from bubbling to the console or showing in dev overlays
    e.stopImmediatePropagation();
  }
});

try {
  Sentry.init({
    dsn: "https://61e955ceb70b4912d4815245a6b2bbf4@o4510668129173504.ingest.us.sentry.io/4510668131401728",
    ignoreErrors: IGNORED_ERRORS,
    integrations: Sentry.getDefaultIntegrations({}).filter(
      (integration) => 
        integration.name !== "Fetch" && 
        integration.name !== "XHR"
    ).concat([
      Sentry.browserTracingIntegration(),
      Sentry.browserProfilingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ]),
    // Tracing
    tracesSampleRate: 1.0,
    tracePropagationTargets: [/^https:\/\/.*\.run\.app/, /localhost/],
    // Profiling
    profileSessionSampleRate: 1.0, // Profile every session
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });

  if ((Sentry as any).metrics) {
    (Sentry as any).metrics.count('app_initialization', 1);
  }
} catch (e) {
  console.warn("[Sovereign OS] Observability layer bypass triggered:", e);
}

const ConfigLoader = ({ children }: { children: ReactNode }) => {
  const [pca, setPca] = useState<PublicClientApplication | null>(null);

  useEffect(() => {
    try {
      const currentOrigin = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
        ? window.location.origin
        : window.location.origin + window.location.pathname.replace(/\/$/, '');

      const msalConfig = {
        auth: {
          clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "bff526e7-323a-4ab1-8378-1afdf6936639",
          authority: import.meta.env.VITE_AZURE_AUTHORITY || "https://login.microsoftonline.com/6666f090-016a-494b-b11a-4d3e01febe95",
          redirectUri: currentOrigin, 
          postLogoutRedirectUri: currentOrigin,
        },
        cache: { 
          cacheLocation: "sessionStorage",
          storeAuthStateInCookie: true 
        },
        system: {
          allowRedirectInIframe: true,
          windowHashTimeout: 9000,
          iframeHashTimeout: 9000,
          loadFrameTimeout: 0
        }
      };
      const instance = new PublicClientApplication(msalConfig);
      instance.initialize().then(() => {
        setPca(instance);
      }).catch((e) => {
        console.warn("[Sovereign OS] MSAL init error bypassed:", e);
      });
    } catch (e) {
      console.warn("[Sovereign OS] MSAL instance creation bypassed:", e);
    }
  }, []);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1075077729236-p8v3e3f0v6v9v9v9v9v9v9v9v9v9v9v9.apps.googleusercontent.com";

  let content = <>{children}</>;

  if (googleClientId) {
    content = (
      <GoogleOAuthProvider clientId={googleClientId}>
        {content}
      </GoogleOAuthProvider>
    );
  }

  if (pca) {
    content = (
      <MsalProvider instance={pca}>
        {content}
      </MsalProvider>
    );
  }

  return content;
};

const render = () => {
  const container = document.getElementById('app') || document.getElementById('root');
  
  if (!container) {
    console.error("Critical Error: No mount point detected in DOM.");
    return;
  }

  try {
    console.log("[Sovereign OS] Initiating React Core Synthesis...");
    
    const root = ReactDOM.createRoot(container);
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <ConfigLoader>
            <FirebaseProvider>
              <PortalProvider>
                <DataProvider>
                  <App />
                </DataProvider>
              </PortalProvider>
            </FirebaseProvider>
          </ConfigLoader>
        </ErrorBoundary>
      </StrictMode>
    );
    console.log("[Sovereign OS] Synthesis Active.");
  } catch (err) {
    console.error("React Core Synthesis Failure:", err);
    container.innerHTML = `
      <div style="padding: 40px; color: #ef4444; background: #030712; font-family: 'Geist Mono', monospace; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
        <h1 style="font-size: 3rem; font-weight: 900; letter-spacing: -0.05em; margin-bottom: 20px; color: #f43f5e;">CRITICAL_FAILURE</h1>
        <p style="color: #94a3b8; max-width: 600px; font-size: 1.2rem;">The Sovereign OS kernel failed to initialize. Please check your network and environment credentials.</p>
        <div style="margin-top: 40px; padding: 20px; background: #111827; border: 1px solid #1f2937; border-radius: 12px; color: #6366f1; font-size: 0.9rem; text-align: left; max-width: 80%; overflow: auto;">
          <div style="color: #4ade80; margin-bottom: 10px;">> TRACE_ID: ${Math.random().toString(36).substring(7).toUpperCase()}</div>
          <div style="color: #cbd5e1;">${err instanceof Error ? err.stack || err.message : String(err)}</div>
        </div>
        <button onclick="window.location.reload()" style="margin-top: 30px; padding: 12px 24px; background: #1e1b4b; color: #818cf8; border: 1px solid #312e81; border-radius: 8px; cursor: pointer; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em;">REBOOT_SYSTEM</button>
      </div>
    `;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', render);
} else {
  render();
}

// --- CONSOLIDATED FROM: ./src/index.tsx ---

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Fatal Error: Root element 'root' not found in DOM.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();