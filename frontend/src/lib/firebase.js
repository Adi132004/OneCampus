import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const AUTH_STORAGE_KEY = "onecampus-auth-user";
let app = null;
let auth = null;

function getStoredAuthUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeAuthUser(user) {
  if (typeof window === "undefined") return;
  if (user) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return;
  }
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

export function getFirebaseAuth() {
  if (!isFirebaseConfigured()) return null;
  if (!app) app = initializeApp(firebaseConfig);
  if (!auth) auth = getAuth(app);
  return auth;
}

export function getCurrentAuthUser() {
  return getStoredAuthUser();
}

export function isSignedIn() {
  return Boolean(getCurrentAuthUser());
}

export function subscribeToAuth(callback) {
  const storedUser = getStoredAuthUser();
  callback(storedUser);

  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) return () => {};

  return firebaseAuth.onAuthStateChanged((user) => {
    if (user) {
      const profile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
      storeAuthUser(profile);
      callback(profile);
      return;
    }

    storeAuthUser(null);
    callback(null);
  });
}

export async function signInWithGoogle() {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    const demoUser = {
      uid: "demo-user",
      email: "demo@onecampus.com",
      displayName: "Demo User",
      photoURL: "",
    };
    storeAuthUser(demoUser);
    return demoUser;
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });

  const result = await signInWithPopup(firebaseAuth, provider);
  const user = result.user;
  const profile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
  storeAuthUser(profile);
  return profile;
}
