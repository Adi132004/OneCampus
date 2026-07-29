const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const AUTH_STORAGE_KEY = "onecampus-auth-user";
const ACCESS_TOKEN_STORAGE_KEY = "onecampus-access-token";
const REFRESH_TOKEN_STORAGE_KEY = "onecampus-refresh-token";

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

function storeTokens(tokens) {
  if (typeof window === "undefined") return;
  if (tokens?.accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, tokens.accessToken);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }

  if (tokens?.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
}

function clearAuthState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function getCurrentAuthUser() {
  return getStoredAuthUser();
}

export function isSignedIn() {
  return Boolean(getAccessToken());
}

export function subscribeToAuth(callback) {
  const storedUser = getStoredAuthUser();
  callback(storedUser);
  return () => {};
}

export async function loginWithEmailPassword({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Login failed");
  }

  const data = await response.json();
  const profile = {
    email,
    accessToken: data.accessToken,
  };

  storeAuthUser(profile);
  storeTokens(data);
  return profile;
}

export async function registerWithEmailPassword({ name, email, password, campusName }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password, campusName }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Registration failed");
  }

  const data = await response.json();
  const profile = {
    email,
    accessToken: data.accessToken,
  };

  storeAuthUser(profile);
  storeTokens(data);
  return profile;
}

export function logoutUser() {
  clearAuthState();
}

export async function signInWithGoogle() {
  const currentUser = getCurrentAuthUser();
  if (currentUser) return currentUser;

  const demoUser = {
    uid: "demo-user",
    email: "demo@onecampus.com",
    displayName: "Demo User",
    photoURL: "",
  };
  storeAuthUser(demoUser);
  return demoUser;
}
