import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { ConfigError, HttpError } from "./http.js";

// Server-side Firebase. Reads data the browser is not allowed to (passwords,
// billing) and bypasses security rules, so it must only run in /api.
//
// FIREBASE_SERVICE_ACCOUNT: the service-account JSON from Firebase console →
// Project settings → Service accounts → Generate new private key. Paste the
// whole JSON, or its base64 encoding, as one env var.

let app: App | null = null;

const loadServiceAccount = () => {
  const raw = (process.env.FIREBASE_SERVICE_ACCOUNT || "").trim();
  if (!raw) return null;
  const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed.private_key === "string") parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    return parsed;
  } catch {
    throw new ConfigError("FIREBASE_SERVICE_ACCOUNT is not valid JSON.");
  }
};

const getAdminApp = (): App => {
  if (app) return app;
  const existing = getApps()[0];
  if (existing) return (app = existing);
  const serviceAccount = loadServiceAccount();
  if (serviceAccount) {
    app = initializeApp({ credential: cert(serviceAccount) });
  } else if (process.env.FIRESTORE_EMULATOR_HOST) {
    app = initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "demo-trinetra" });
  } else {
    throw new ConfigError("Email service is not configured: FIREBASE_SERVICE_ACCOUNT is missing.");
  }
  return app;
};

export const adminDb = (): Firestore => getFirestore(getAdminApp());

/** Verifies a Firebase ID token from the browser and returns the caller's uid. */
export const verifyIdToken = async (token: string | null): Promise<string> => {
  if (!token) throw new HttpError(401, "Sign-in required.");
  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(token);
    return decoded.uid;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(401, "Invalid or expired sign-in. Please log in again.");
  }
};
