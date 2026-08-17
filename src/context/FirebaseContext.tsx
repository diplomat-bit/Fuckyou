import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, User, Auth } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, Firestore } from 'firebase/firestore';

export interface SovereignConfig {
  theme: 'dark' | 'light' | 'cyberpunk';
  mcpServerUrl?: string;
  activeSovereignApps: string[];
  taxSettings?: {
    jurisdiction: string;
    taxYear: number;
    filingStatus: string;
  };
  mastercardSettings?: {
    clientId: string;
    sandboxMode: boolean;
    enabledServices: string[];
  };
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  sovereignConfig?: SovereignConfig;
}

export interface FirebaseContextType {
  user: User | null;
  userProfile: UserProfile | null;
  sovereignConfig: SovereignConfig | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  updateSovereignConfig: (config: Partial<SovereignConfig>) => Promise<void>;
  isFirebaseConfigured: boolean;
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId
);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.error("Failed to initialize Firebase:", err);
  }
}

export const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sovereignConfig, setSovereignConfig] = useState<SovereignConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
      const storedUser = localStorage.getItem('mock_user');
      const storedProfile = localStorage.getItem('mock_profile');
      const storedConfig = localStorage.getItem('mock_config');

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      }
      if (storedConfig) {
        setSovereignConfig(JSON.parse(storedConfig));
      }
      setLoading(false);
      return;
    }

    let unsubProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);
      
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = undefined;
      }

      if (firebaseUser) {
        setUser(firebaseUser);
        
        const userDocRef = doc(db!, 'users', firebaseUser.uid);
        
        unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setUserProfile(data);
            setSovereignConfig(data.sovereignConfig || null);
          } else {
            const defaultProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'Sovereign Agent',
              photoURL: firebaseUser.photoURL,
              role: 'admin',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              sovereignConfig: {
                theme: 'dark',
                activeSovereignApps: ['files-vault', 'dashboard'],
                updatedAt: new Date().toISOString()
              }
            };
            setDoc(userDocRef, defaultProfile).catch(err => {
              console.error("Error creating default profile:", err);
            });
            setUserProfile(defaultProfile);
            setSovereignConfig(defaultProfile.sovereignConfig || null);
          }
          setLoading(false);
        }, (err) => {
          console.error("Error syncing user profile:", err);
          setError(err.message);
          setLoading(false);
        });
      } else {
        setUser(null);
        setUserProfile(null);
        setSovereignConfig(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubProfile) {
        unsubProfile();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured || !auth || !db) {
        const mockUser = {
          uid: 'mock-uid-123',
          email,
          displayName: email.split('@')[0],
          photoURL: null,
          emailVerified: true
        } as unknown as User;

        const mockProfile: UserProfile = {
          uid: 'mock-uid-123',
          email,
          displayName: email.split('@')[0],
          photoURL: null,
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sovereignConfig: {
            theme: 'dark',
            activeSovereignApps: ['files-vault', 'dashboard'],
            updatedAt: new Date().toISOString()
          }
        };

        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        localStorage.setItem('mock_profile', JSON.stringify(mockProfile));
        localStorage.setItem('mock_config', JSON.stringify(mockProfile.sovereignConfig));

        setUser(mockUser);
        setUserProfile(mockProfile);
        setSovereignConfig(mockProfile.sovereignConfig || null);
        setLoading(false);
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setLoading(false);
      throw err;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured || !auth || !db) {
        const mockUser = {
          uid: 'mock-uid-123',
          email,
          displayName,
          photoURL: null,
          emailVerified: true
        } as unknown as User;

        const mockProfile: UserProfile = {
          uid: 'mock-uid-123',
          email,
          displayName,
          photoURL: null,
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sovereignConfig: {
            theme: 'dark',
            activeSovereignApps: ['files-vault', 'dashboard'],
            updatedAt: new Date().toISOString()
          }
        };

        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        localStorage.setItem('mock_profile', JSON.stringify(mockProfile));
        localStorage.setItem('mock_config', JSON.stringify(mockProfile.sovereignConfig));

        setUser(mockUser);
        setUserProfile(mockProfile);
        setSovereignConfig(mockProfile.sovereignConfig || null);
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const defaultProfile: UserProfile = {
        uid: userCredential.user.uid,
        email,
        displayName,
        photoURL: null,
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sovereignConfig: {
          theme: 'dark',
          activeSovereignApps: ['files-vault', 'dashboard'],
          updatedAt: new Date().toISOString()
        }
      };
      await setDoc(userDocRef, defaultProfile);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      setLoading(false);
      throw err;
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured || !auth) {
        localStorage.removeItem('mock_user');
        localStorage.removeItem('mock_profile');
        localStorage.removeItem('mock_config');
        setUser(null);
        setUserProfile(null);
        setSovereignConfig(null);
        setLoading(false);
        return;
      }
      await signOut(auth);
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      setLoading(false);
      throw err;
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    setError(null);
    try {
      if (!isFirebaseConfigured || !auth || !db) {
        if (!userProfile) return;
        const updatedProfile = {
          ...userProfile,
          ...data,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('mock_profile', JSON.stringify(updatedProfile));
        setUserProfile(updatedProfile);
        return;
      }

      if (!user) throw new Error("No authenticated user found");
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  const updateSovereignConfig = async (config: Partial<SovereignConfig>) => {
    setError(null);
    try {
      if (!isFirebaseConfigured || !auth || !db) {
        if (!userProfile) return;
        const currentConfig = sovereignConfig || {
          theme: 'dark',
          activeSovereignApps: [],
          updatedAt: new Date().toISOString()
        };
        const updatedConfig = {
          ...currentConfig,
          ...config,
          updatedAt: new Date().toISOString()
        };
        const updatedProfile = {
          ...userProfile,
          sovereignConfig: updatedConfig,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('mock_profile', JSON.stringify(updatedProfile));
        localStorage.setItem('mock_config', JSON.stringify(updatedConfig));
        setUserProfile(updatedProfile);
        setSovereignConfig(updatedConfig);
        return;
      }

      if (!user) throw new Error("No authenticated user found");
      const userDocRef = doc(db, 'users', user.uid);
      const currentConfig = sovereignConfig || {
        theme: 'dark',
        activeSovereignApps: [],
        updatedAt: new Date().toISOString()
      };
      const updatedConfig = {
        ...currentConfig,
        ...config,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(userDocRef, {
        sovereignConfig: updatedConfig,
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update sovereign config');
      throw err;
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        userProfile,
        sovereignConfig,
        loading,
        error,
        signIn,
        signUp,
        signOutUser,
        updateProfileData,
        updateSovereignConfig,
        isFirebaseConfigured
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};