import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  arrayUnion, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';

// Handle both Node.js (server) and Vite (client) environments
const getEnvVar = (key: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  return '';
};

const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY') || 'dummy-api-key',
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN') || 'dummy-auth-domain',
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID') || 'dummy-project-id',
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET') || 'dummy-storage-bucket',
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID') || 'dummy-sender-id',
  appId: getEnvVar('VITE_FIREBASE_APP_ID') || 'dummy-app-id'
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  READ = 'READ',
  WRITE = 'WRITE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  GET = 'GET'
}

export const handleFirestoreError = (error: any, operation: OperationType, context: string) => {
  console.error(`[Firestore ${operation}] Error in ${context}:`, error);
  throw error;
};

export {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  orderBy,
  limit,
  serverTimestamp
};
