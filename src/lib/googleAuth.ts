import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
];

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let providerInstance: GoogleAuthProvider | null = null;

// Safe lazy initialization helper
export function getFirebaseAuth(): { auth: Auth | null; provider: GoogleAuthProvider | null } {
  if (authInstance && providerInstance) {
    return { auth: authInstance, provider: providerInstance };
  }

  try {
    if (!appInstance) {
      appInstance = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    }
    if (!authInstance && appInstance) {
      authInstance = getAuth(appInstance);
    }
    if (!providerInstance) {
      providerInstance = new GoogleAuthProvider();
      SCOPES.forEach((scope) => providerInstance!.addScope(scope));
    }
    return { auth: authInstance, provider: providerInstance };
  } catch (err) {
    console.warn('Firebase Auth initialization deferred or unsupported in this sandbox environment:', err);
    return { auth: null, provider: null };
  }
}

// Flags & in-memory token cache (never stored in localStorage or sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  const { auth } = getFirebaseAuth();
  if (!auth) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }

  try {
    return onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        if (cachedAccessToken) {
          if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
        } else if (!isSigningIn) {
          if (onAuthFailure) onAuthFailure();
        }
      } else {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    });
  } catch (err) {
    console.warn('Auth state listener error:', err);
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  const { auth, provider } = getFirebaseAuth();
  if (!auth || !provider) {
    throw new Error('Google Authentication is not supported or restricted in this browser frame.');
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  const { auth } = getFirebaseAuth();
  if (auth) {
    try {
      await auth.signOut();
    } catch {
      // Ignore
    }
  }
  cachedAccessToken = null;
};
