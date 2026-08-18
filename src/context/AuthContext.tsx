import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth0, User } from '@auth0/auth0-react';
import { datadogLogs } from '@datadog/browser-logs';

// Define the shape of the AuthContext
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | undefined;
  login: () => Promise<void>;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
  error: Error | undefined;
}

// Create the context with a default undefined value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for consuming the context safely
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider wraps the Auth0 functionality to provide a consistent
 * commercial-grade authentication interface across the application, 
 * integrated with DataDog logging for observability and user context tracking.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    isAuthenticated: auth0IsAuthenticated,
    isLoading: auth0IsLoading,
    user: auth0User,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
    error: auth0Error,
  } = useAuth0();

  // Local state to manage auth status (mirrors Auth0 but provides a stable interface)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | undefined>(undefined);

  // Effect to sync Auth0 state, handle logging, and set DataDog user context
  useEffect(() => {
    setIsLoading(auth0IsLoading);
    setIsAuthenticated(auth0IsAuthenticated);
    setUser(auth0User);

    if (auth0IsAuthenticated && auth0User) {
      // 1. Set DataDog user context for observability
      datadogLogs.setUser({
        id: auth0User.sub,
        email: auth0User.email,
        name: auth0User.name,
      });

      // 2. Log successful authentication only after loading completes
      if (!auth0IsLoading) {
        datadogLogs.logger.info('Session established', {
          userId: auth0User.sub,
          email: auth0User.email,
          context: 'AuthContext'
        });
      }
    } else {
      // 3. Clear DataDog user context on logout/unauthenticated state
      datadogLogs.clearUser();
      
      // 4. Log errors if present
      if (auth0Error) {
        datadogLogs.logger.error('Authentication error', {
          error: auth0Error.message,
          context: 'AuthContext'
        });
      }
    }
  }, [auth0IsLoading, auth0IsAuthenticated, auth0User, auth0Error]);

  // Login handler
  const login = useCallback(async () => {
    try {
      datadogLogs.logger.info('Initiating login redirect', { context: 'AuthContext' });
      await loginWithRedirect();
    } catch (err) {
      // Note: loginWithRedirect usually throws if configuration is wrong or network fails before redirect.
      datadogLogs.logger.error('Login redirect failed', { error: err, context: 'AuthContext' });
      throw err;
    }
  }, [loginWithRedirect]);

  // Logout handler
  const logout = useCallback(() => {
    try {
      datadogLogs.logger.info('Initiating logout', { context: 'AuthContext' });
      auth0Logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });
    } catch (err) {
      datadogLogs.logger.error('Logout failed', { error: err, context: 'AuthContext' });
    }
  }, [auth0Logout]);

  /**
   * Retrieves the access token silently.
   * @returns The access token string or null if retrieval fails.
   */
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!isAuthenticated) {
      return null;
    }
    try {
      const token = await getAccessTokenSilently();
      return token;
    } catch (err) {
      datadogLogs.logger.warn('Failed to retrieve access token silently', { error: err, context: 'AuthContext' });
      return null;
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      login,
      logout,
      getAccessToken,
      error: auth0Error,
    }),
    [isAuthenticated, isLoading, user, login, logout, getAccessToken, auth0Error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};