import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// KEEP THIS — your app uses Firestore data
// @ts-ignore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
