import React, { createContext, useContext, useState, useCallback } from 'react';
import { useIsAuthenticated } from "@azure/msal-react";
import { useFirebase } from './FirebaseContext';

export interface IPortalContext {
  isFirebaseLinked: boolean;
  isGoogleLinked: boolean;
  isMsalLinked: boolean;
  isAgeVerified: boolean;
  isTermsAccepted: boolean;
  isPrivacyAccepted: boolean;
  isMsalBypass: boolean;
  isSovereignBypass: boolean;
  isBiometricVerified: boolean;
  clearanceLevel: string;
  
  setGoogleLinked: (val: boolean) => void;
  setAgeVerified: (val: boolean) => void;
  setTermsAccepted: (val: boolean) => void;
  setPrivacyAccepted: (val: boolean) => void;
  setMsalBypass: (val: boolean) => void;
  setSovereignBypass: (val: boolean) => void;
  setBiometricVerified: (val: boolean) => void;
  setClearanceLevel: (level: string) => void;
  
  resetPortalAuth: () => void;
  
  // Master check: is the user authorized in the OS portal?
  isPortalAuthorized: boolean;
}

const PortalContext = createContext<IPortalContext | undefined>(undefined);

const SafeMsalCheck = (): boolean => {
  try {
    return useIsAuthenticated();
  } catch {
    return false;
  }
};

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  let isFirebaseLinked = false;
  try {
    const { user } = useFirebase();
    isFirebaseLinked = !!user;
  } catch {
    isFirebaseLinked = false;
  }

  const isMsalAuthenticated = SafeMsalCheck();

  const [isGoogleLinked, setGoogleLinkedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('oko_google_linked') === 'true';
    } catch {
      return false;
    }
  });

  const [isAgeVerified, setAgeVerifiedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('oko_age_verified') === 'true';
    } catch {
      return false;
    }
  });

  const [isTermsAccepted, setTermsAcceptedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('oko_terms_accepted') === 'true';
    } catch {
      return false;
    }
  });

  const [isPrivacyAccepted, setPrivacyAcceptedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('oko_privacy_accepted') === 'true';
    } catch {
      return false;
    }
  });

  const [isMsalBypass, setMsalBypassState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('oko_msal_bypass') === 'true';
    } catch {
      return false;
    }
  });

  const [isSovereignBypass, setSovereignBypassState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('oko_sovereign_bypass') === 'true';
    } catch {
      return false;
    }
  });

  const [isBiometricVerified, setBiometricVerifiedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('oko_biometric_verified') === 'true';
    } catch {
      return false;
    }
  });

  const [clearanceLevel, setClearanceLevelState] = useState<string>(() => {
    try {
      return localStorage.getItem('oko_clearance_level') || 'TOP_SECRET';
    } catch {
      return 'TOP_SECRET';
    }
  });

  const setGoogleLinked = useCallback((val: boolean) => {
    setGoogleLinkedState(val);
    try {
      localStorage.setItem('oko_google_linked', String(val));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  const setAgeVerified = useCallback((val: boolean) => {
    setAgeVerifiedState(val);
    try {
      localStorage.setItem('oko_age_verified', String(val));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  const setTermsAccepted = useCallback((val: boolean) => {
    setTermsAcceptedState(val);
    try {
      localStorage.setItem('oko_terms_accepted', String(val));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  const setPrivacyAccepted = useCallback((val: boolean) => {
    setPrivacyAcceptedState(val);
    try {
      localStorage.setItem('oko_privacy_accepted', String(val));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  const setMsalBypass = useCallback((val: boolean) => {
    setMsalBypassState(val);
    try {
      localStorage.setItem('oko_msal_bypass', String(val));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  const setSovereignBypass = useCallback((val: boolean) => {
    setSovereignBypassState(val);
    try {
      localStorage.setItem('oko_sovereign_bypass', String(val));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  const setBiometricVerified = useCallback((val: boolean) => {
    setBiometricVerifiedState(val);
    try {
      localStorage.setItem('oko_biometric_verified', String(val));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  const setClearanceLevel = useCallback((level: string) => {
    setClearanceLevelState(level);
    try {
      localStorage.setItem('oko_clearance_level', level);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  const resetPortalAuth = useCallback(() => {
    setGoogleLinkedState(false);
    setAgeVerifiedState(false);
    setTermsAcceptedState(false);
    setPrivacyAcceptedState(false);
    setMsalBypassState(false);
    setSovereignBypassState(false);
    setBiometricVerifiedState(false);
    setClearanceLevelState('TOP_SECRET');

    const keys = [
      'oko_google_linked',
      'oko_age_verified',
      'oko_terms_accepted',
      'oko_privacy_accepted',
      'oko_msal_bypass',
      'oko_sovereign_bypass',
      'oko_biometric_verified',
      'oko_clearance_level'
    ];
    keys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {}
    });
  }, []);

  const isMsalLinked = isMsalAuthenticated || isMsalBypass;

  // Master check: user is authorized if any auth vector or bypass is active AND age & terms are accepted
  const isPortalAuthorized =
    (isFirebaseLinked || isMsalLinked || isGoogleLinked || isSovereignBypass || isBiometricVerified) &&
    isAgeVerified &&
    isTermsAccepted;

  return (
    <PortalContext.Provider
      value={{
        isFirebaseLinked,
        isGoogleLinked,
        isMsalLinked,
        isAgeVerified,
        isTermsAccepted,
        isPrivacyAccepted,
        isMsalBypass,
        isSovereignBypass,
        isBiometricVerified,
        clearanceLevel,
        setGoogleLinked,
        setAgeVerified,
        setTermsAccepted,
        setPrivacyAccepted,
        setMsalBypass,
        setSovereignBypass,
        setBiometricVerified,
        setClearanceLevel,
        resetPortalAuth,
        isPortalAuthorized,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};