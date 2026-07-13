import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBLZqmndUXy-GIarRKixt6U2jykNVQM4Uo",
  authDomain: "trusthire-a1.firebaseapp.com",
  projectId: "trusthire-a1",
  storageBucket: "trusthire-a1.firebasestorage.app",
  messagingSenderId: "863713698989",
  appId: "1:863713698989:web:7a1c9e2b73fd3820231224",
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db }
