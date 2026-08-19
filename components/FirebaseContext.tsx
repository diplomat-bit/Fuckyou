

// --- CONSOLIDATED FROM: ./context/FirebaseContext.tsx ---

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db, handleFirestoreError, signInWithGoogle, logout } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  name: string;
  title?: string;
  email: string;
  loyaltyTier?: string;
  avatarUrl?: string;
  usdBalance?: number;
  fiatBalance?: number;
  cryptoBalance?: number;
  app_metadata?: {
    subscription_status?: string;
    is_pro?: boolean;
  };
  user_metadata?: {
    theme?: string;
    discovery_source?: string;
  };
}

interface FirebaseContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  error: any;
  signInWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [error, setError] = useState<any>(null);

  const refreshProfile = async () => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (err) {
      console.error("Manual profile refresh failed:", err);
      if (handleFirestoreError) {
        // FIX: Added 3rd argument 'refreshProfile' and used string 'read'
        handleFirestoreError(err, 'read' as any, 'refreshProfile');
      }
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error("No authenticated user to update profile for.");
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userDocRef, updates, { merge: true });
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err) {
      console.error("Failed to update user profile:", err);
      if (handleFirestoreError) {
        // FIX: Added 3rd argument 'updateUserProfile' and used string 'write'
        handleFirestoreError(err, 'write' as any, 'updateUserProfile');
      }
      throw err;
    }
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        try {
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            const newProfile: UserProfile = {
              id: currentUser.uid,
              name: currentUser.displayName || 'Anonymous User',
              title: 'Sovereign Member',
              email: currentUser.email || '',
              loyaltyTier: 'Bronze',
              avatarUrl: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`,
              usdBalance: 0,
              fiatBalance: 0,
              cryptoBalance: 0,
              app_metadata: {
                subscription_status: 'none',
                is_pro: false
              },
              user_metadata: {
                theme: 'dark',
                discovery_source: 'direct'
              }
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          } else {
            setUserProfile(userDoc.data() as UserProfile);
          }
        } catch (err) {
          console.error("Firestore profile fetch/create failed:", err);
          if (handleFirestoreError) {
            // FIX: Added 3rd argument and used string 'read'
            handleFirestoreError(err, 'read' as any, 'authChangeProfileFetch');
          }
          const fallbackProfile: UserProfile = {
            id: currentUser.uid,
            name: currentUser.displayName || 'Anonymous User',
            title: 'Sovereign Member',
            email: currentUser.email || '',
            loyaltyTier: 'Bronze',
            avatarUrl: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`,
            usdBalance: 1000,
            fiatBalance: 1000,
            cryptoBalance: 0,
            app_metadata: { subscription_status: 'none', is_pro: false },
            user_metadata: { theme: 'dark', discovery_source: 'direct' }
          };
          setUserProfile(fallbackProfile);
          setError(err);
        }

        if (unsubscribeProfile) {
          unsubscribeProfile();
        }

        try {
          unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              setUserProfile(docSnap.data() as UserProfile);
            }
          }, (err) => {
            console.warn("Firestore profile onSnapshot failed:", err);
            if (handleFirestoreError) {
              // FIX: Added 3rd argument and used string 'read'
              handleFirestoreError(err, 'read' as any, 'profileSnapshot');
            }
          });
        } catch (snapErr) {
          console.warn("Firestore onSnapshot subscription failed:", snapErr);
        }

        setLoading(false);
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  return (
    <FirebaseContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      isAuthReady, 
      error, 
      signInWithGoogle, 
      logout,
      updateUserProfile,
      refreshProfile
    }}>
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
