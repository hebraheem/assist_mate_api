var admin = require('firebase-admin'); // Firebase Admin SDK
const { getFirestore } = require('firebase-admin/firestore'); // Firestore from Admin SDK
const { getStorage } = require('firebase-admin/storage'); // Storage from Admin SDK
const dotenv = require('dotenv');
const { initializeApp } = require('firebase/app'); // Firebase Client SDK
const { getAuth, GoogleAuthProvider } = require('firebase/auth'); // Firebase Authentication Client SDK

dotenv.config();

// Initialize Firebase Admin SDK
var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Firebase Client SDK configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSANGER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase Client SDK
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Storage from Admin SDK
const db = getFirestore(admin.app());
const storage = getStorage(admin.app());

// Initialize Firebase Auth (Client SDK)
const auth = getAuth(app);
const googleAuth = new GoogleAuthProvider();

module.exports = {
  admin, // Firebase Admin SDK for server-side
  db, // Firestore from Admin SDK
  storage, // Firebase Storage from Admin SDK
  auth, // Firebase Authentication Client SDK
  googleAuth, // Google Authentication provider (Client SDK)
};
