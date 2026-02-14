import { initializeApp, deleteApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: 'fake-api-key',
  authDomain: 'readingconnect-lit.firebaseapp.com',
  projectId: 'readingconnect-lit',
  storageBucket: 'readingconnect-lit.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456'
};

let app: FirebaseApp | null = null;

export function initializeTestApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(firebaseConfig);
    
    const auth = getAuth(app);
    connectAuthEmulator(auth, 'http://localhost:9099');
    
    const db = getFirestore(app);
    connectFirestoreEmulator(db, 'localhost', 8080);
    
    const functions = getFunctions(app);
    connectFunctionsEmulator(functions, 'localhost', 5001);
  }
  return app;
}

export async function cleanupTestApp() {
  if (app) {
    await deleteApp(app);
    app = null;
  }
}

export async function createTestUser(email: string, password: string): Promise<string> {
  const testApp = initializeTestApp();
  const auth = getAuth(testApp);
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user.uid;
}

export async function signInTestUser(email: string, password: string): Promise<string> {
  const testApp = initializeTestApp();
  const auth = getAuth(testApp);
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user.uid;
}

export function getTestFirestore() {
  const testApp = initializeTestApp();
  return getFirestore(testApp);
}

export function getTestFunctions() {
  const testApp = initializeTestApp();
  return getFunctions(testApp);
}
