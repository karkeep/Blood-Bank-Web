// src/lib/firebase-config.ts
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnvX0CZWeSWOP14lDRIofFXEZkoy2Nim8",
  authDomain: "blood-bank-f759d.firebaseapp.com",
  databaseURL: "https://blood-bank-f759d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "blood-bank-f759d",
  storageBucket: "blood-bank-f759d.firebasestorage.app",
  messagingSenderId: "131654509538",
  appId: "1:131654509538:web:8724207409d99bc5f64fbb",
  // Note: Analytics has been migrated to Supabase - see /lib/analytics.ts
};

// Check if app is initialized already to avoid duplicate apps
let app: ReturnType<typeof initializeApp> | undefined;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // Ignore the duplicate app initialization error
  console.error("Firebase initialization error:", error);
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
  }
}

// Initialize Firebase services
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Set local persistence for Auth to remember user sessions
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Auth persistence error:", error);
  });

// Helper flag to check initialization
const isInitialized = !!app;

// Export the initialized services
// Note: For analytics, use the Supabase analytics service from /lib/analytics.ts
export { app, auth, database, storage, isInitialized };
