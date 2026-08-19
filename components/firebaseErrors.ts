

// --- CONSOLIDATED FROM: ./firebaseErrors.ts ---

import { getAuth, User } from 'firebase/auth';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  let currentUser: User | null = null;
  
  try {
    const auth = getAuth();
    currentUser = auth.currentUser;
  } catch (e) {
    // Silently fail if auth is not initialized
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified ?? false,
      isAnonymous: currentUser?.isAnonymous ?? false,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo: currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL,
      })) ?? [],
    },
    operationType,
    path,
  };

  console.error('Firestore Error:', errInfo);
  throw new Error(JSON.stringify(errInfo));
}