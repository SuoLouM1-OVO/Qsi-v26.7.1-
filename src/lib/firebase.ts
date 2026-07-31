import { initializeApp, getApps } from 'firebase/app';
import { initializeFirestore, setLogLevel } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence verbose connection warnings in iframe/sandboxed environments
try {
  setLogLevel('error');
} catch (e) {
  // ignore
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Use initializeFirestore with experimentalForceLongPolling to handle sandboxed/iframe environments reliably
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true
  },
  firebaseConfig.firestoreDatabaseId || '(default)'
);

export const auth = getAuth(app);

// Helper to get persistent local guest ID if Auth isn't enabled in Firebase Console
const getLocalGuestUid = (): string => {
  try {
    let uid = localStorage.getItem('qsi_guest_uid');
    if (!uid) {
      uid = 'guest_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('qsi_guest_uid', uid);
    }
    return uid;
  } catch (e) {
    return 'guest_visitor';
  }
};

// Ensure anonymous sign-in or fallback gracefully for visitors
export const ensureAuth = (): Promise<{ uid: string }> => {
  return new Promise((resolve) => {
    let resolved = false;

    const safeResolve = (u: { uid: string }) => {
      if (!resolved) {
        resolved = true;
        resolve(u);
      }
    };

    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          unsubscribe();
          safeResolve(user);
        } else {
          signInAnonymously(auth)
            .then((cred) => {
              unsubscribe();
              safeResolve(cred.user);
            })
            .catch((err) => {
              console.warn('Firebase anonymous auth notice (using guest session):', err?.code || err?.message || err);
              unsubscribe();
              safeResolve({ uid: getLocalGuestUid() });
            });
        }
      });
    } catch (e) {
      console.warn('Auth init notice:', e);
      safeResolve({ uid: getLocalGuestUid() });
    }

    // Safety timeout to ensure Firestore calls never freeze if auth network hangs
    setTimeout(() => {
      safeResolve({ uid: getLocalGuestUid() });
    }, 1500);
  });
};
