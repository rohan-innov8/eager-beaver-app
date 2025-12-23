import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAiCA-6CyVmMtaOFmn5Tq_qMkTjr8x6GH0",
  authDomain: "gen-lang-client-0117673930.firebaseapp.com",
  projectId: "gen-lang-client-0117673930",
  storageBucket: "gen-lang-client-0117673930.firebasestorage.app",
  messagingSenderId: "900319124614",
  appId: "1:900319124614:web:31e50492d5389e1a584507",
  measurementId: "G-KFGL977WR6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with local persistence enabled
// This prevents hanging if the network is slow or DB is not ready
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Initialize other Services
export const auth = getAuth(app);
export const storage = getStorage(app);