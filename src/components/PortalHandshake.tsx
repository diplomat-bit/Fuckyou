import React, { useEffect, useRef, useContext } from 'react';
import { useMsal } from "@azure/msal-react";

// Contexts & Providers
import { DataContext } from './context/DataContext';
import { useFirebase } from './context/FirebaseContext';

// Services & Security
import { lastBossService } from './services/LastBossService';
import { securityService } from './services/SecurityService';

// Types & Constants
import { SOVEREIGN_APPS } from './constants';

enum MessageType {
  HANDSHAKE_INIT = 'PORTAL_HANDSHAKE_INIT',
  HANDSHAKE_ACK = 'PORTAL_HANDSHAKE_ACK',
  HANDSHAKE_ERROR = 'PORTAL_HANDSHAKE_ERROR',
  TOKEN_REQUEST = 'PORTAL_TOKEN_REQUEST',
  TOKEN_RESPONSE = 'PORTAL_TOKEN_RESPONSE',
  TOKEN_UPDATE = 'PORTAL_TOKEN_UPDATE',
  SECURE_ACTION = 'PORTAL_SECURE_ACTION',
  SECURE_ACTION_RESPONSE = 'PORTAL_SECURE_ACTION_RESPONSE',
  HEARTBEAT = 'PORTAL_HEARTBEAT'
}

interface ActiveConnection {
  window: Window;
  origin: string;
  appId: string;
  verifiedAt: number;
}

export const PortalHandshake: React.FC = () => {
  const { instance, accounts } = useMsal();
  const firebaseContext = useFirebase();
  const dataContext = useContext(DataContext);

  const activeConnections = useRef<Map<string, ActiveConnection>>(new Map());

  const msalRef = useRef({ instance, accounts });
  const firebaseRef = useRef(firebaseContext);
  const dataRef = useRef(dataContext);

  useEffect(() => {
    msalRef.current = { instance, accounts };
  }, [instance, accounts]);

  useEffect(() => {
    firebaseRef.current = firebaseContext;
  }, [firebaseContext]);

  useEffect(() => {
    dataRef.current = dataContext;
  }, [dataContext]);

  const getAllowedOrigins = (): string[] => {
    if (!SOVEREIGN_APPS) return [];
    if (Array.isArray(SOVEREIGN_APPS)) {
      return SOVEREIGN_APPS.map(app => {
        if (app.origin) return app.origin;
        try {
          return app.url ? new URL(app.url).origin : '';
        } catch {
          return '';
        }
      }).filter(Boolean);
    }
    return Object.values(SOVEREIGN_APPS)
      .map((app: any) => {
        if (app.origin) return app.origin;
        try {
          return app.url ? new URL(app.url).origin : '';
        } catch {
          return '';
        }
      })
      .filter(Boolean);
  };

  const getAppConfig = (appId: string) => {
    if (!SOVEREIGN_APPS) return null;
    if (Array.isArray(SOVEREIGN_APPS)) {
      return SOVEREIGN_APPS.find(app => app.id === appId);
    }
    return (SOVEREIGN_APPS as Record<string, any>)[appId];
  };

  const getOrigin = (urlStr: string): string | null => {
    try {
      return new URL(urlStr).origin;
    } catch (e) {
      console.error(`[PortalHandshake] Invalid URL: ${urlStr}`, e);
      return null;
    }
  };

  const fetchMsalToken = async () => {
    const { instance: msalInstance, accounts: msalAccounts } = msalRef.current;
    if (!msalInstance || !msalAccounts || msalAccounts.length === 0) return null;
    try {
      const response = await msalInstance.acquireTokenSilent({
        scopes: ["User.Read"],
        account: msalAccounts[0]
      });
      return response.accessToken;
    } catch (error) {
      console.warn("[PortalHandshake] Silent MSAL token acquisition failed:", error);
      return null;
    }
  };

  const fetchFirebaseToken = async () => {
    const fb = firebaseRef.current;
    if (!fb) return null;
    const user = fb.user || fb.currentUser;
    if (!user) return null;
    try {
      if (typeof user.getIdToken === 'function') {
        return await user.getIdToken();
      }
    } catch (error) {
      console.error("[PortalHandshake] Firebase token acquisition failed:", error);
    }
    return null;
  };

  const sendError = (source: MessageEventSource, origin: string, message: string, connectionId: string) => {
    try {
      source.postMessage({
        type: MessageType.HANDSHAKE_ERROR,
        payload: { message, timestamp: Date.now() },
        connectionId
      }, origin);
    } catch (e) {
      console.error("[PortalHandshake] Failed to send handshake error message:", e);
    }
  };

  const handleHandshakeInit = async (
    event: MessageEvent,
    payload: { appId: string; nonce: string },
    connectionId: string
  ) => {
    const { origin, source } = event;
    if (!source) return;

    const { appId, nonce } = payload || {};
    if (!appId) {
      sendError(source, origin, "Missing appId in handshake initiation", connectionId);
      return;
    }

    const appConfig = getAppConfig(appId);
    if (!appConfig) {
      sendError(source, origin, `Unauthorized or unregistered appId: ${appId}`, connectionId);
      return;
    }

    const expectedOrigin = appConfig.origin || getOrigin(appConfig.url);
    if (expectedOrigin !== origin) {
      sendError(source, origin, `Origin mismatch for appId: ${appId}`, connectionId);
      return;
    }

    const msalToken = await fetchMsalToken();
    const firebaseToken = await fetchFirebaseToken();

    const connId = connectionId || appId;
    activeConnections.current.set(connId, {
      window: source as Window,
      origin,
      appId,
      verifiedAt: Date.now()
    });

    const ackPayload = {
      status: 'success',
      nonce,
      connectionId: connId,
      tokens: {
        msalToken,
        firebaseToken,
        sessionToken: securityService?.getSessionToken?.() || null
      },
      user: dataRef.current?.user || null,
      timestamp: Date.now()
    };

    source.postMessage({
      type: MessageType.HANDSHAKE_ACK,
      payload: ackPayload,
      connectionId: connId
    }, origin);
  };

  const handleTokenRequest = async (
    event: MessageEvent,
    connectionId: string
  ) => {
    const { origin, source } = event;
    if (!source) return;

    const connection = activeConnections.current.get(connectionId);
    if (!connection || connection.origin !== origin) {
      sendError(source, origin, "Unauthorized or unestablished connection", connectionId);
      return;
    }

    const msalToken = await fetchMsalToken();
    const firebaseToken = await fetchFirebaseToken();

    source.postMessage({
      type: MessageType.TOKEN_RESPONSE,
      payload: {
        tokens: {
          msalToken,
          firebaseToken,
          sessionToken: securityService?.getSessionToken?.() || null
        },
        timestamp: Date.now()
      },
      connectionId
    }, origin);
  };

  const handleSecureAction = async (
    event: MessageEvent,
    payload: { action: string; data: any },
    connectionId: string
  ) => {
    const { origin, source } = event;
    if (!source) return;

    const connection = activeConnections.current.get(connectionId);
    if (!connection || connection.origin !== origin) {
      sendError(source, origin, "Unauthorized connection for secure action", connectionId);
      return;
    }

    const { action, data } = payload || {};
    try {
      let result: any = null;

      if (action === 'AUDIT_LOG' && lastBossService?.logAction) {
        result = await lastBossService.logAction(data);
      } else if (action === 'SIGN_DATA' && securityService?.signPayload) {
        result = await securityService.signPayload(data);
      } else {
        throw new Error(`Unsupported secure action: ${action}`);
      }

      source.postMessage({
        type: MessageType.SECURE_ACTION_RESPONSE,
        payload: {
          status: 'success',
          action,
          result,
          timestamp: Date.now()
        },
        connectionId
      }, origin);
    } catch (error: any) {
      sendError(source, origin, `Secure action failed: ${error.message}`, connectionId);
    }
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const allowedOrigins = getAllowedOrigins();
      if (!allowedOrigins.includes(event.origin)) {
        return;
      }

      const { data } = event;
      if (!data || typeof data !== 'object') return;

      const { type, payload, connectionId } = data;
      if (!type) return;

      switch (type) {
        case MessageType.HANDSHAKE_INIT:
          await handleHandshakeInit(event, payload, connectionId);
          break;
        case MessageType.TOKEN_REQUEST:
          await handleTokenRequest(event, connectionId);
          break;
        case MessageType.SECURE_ACTION:
          await handleSecureAction(event, payload, connectionId);
          break;
        case MessageType.HEARTBEAT:
          const conn = activeConnections.current.get(connectionId);
          if (conn && conn.origin === event.origin) {
            conn.verifiedAt = Date.now();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    const broadcastTokenUpdate = async () => {
      if (activeConnections.current.size === 0) return;

      const msalToken = await fetchMsalToken();
      const firebaseToken = await fetchFirebaseToken();

      activeConnections.current.forEach((connection, connectionId) => {
        try {
          connection.window.postMessage({
            type: MessageType.TOKEN_UPDATE,
            payload: {
              tokens: {
                msalToken,
                firebaseToken,
                sessionToken: securityService?.getSessionToken?.() || null
              },
              timestamp: Date.now()
            },
            connectionId
          }, connection.origin);
        } catch (error) {
          console.error(`[PortalHandshake] Failed to broadcast token update to connection ${connectionId}:`, error);
          activeConnections.current.delete(connectionId);
        }
      });
    };

    broadcastTokenUpdate();
  }, [accounts, firebaseContext?.user]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      activeConnections.current.forEach((connection, connectionId) => {
        if (now - connection.verifiedAt > 60000 || connection.window.closed) {
          activeConnections.current.delete(connectionId);
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default PortalHandshake;