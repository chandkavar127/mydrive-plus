const admin = require('firebase-admin');
const { logger } = require('../utils/logger');

let initialized = false;
let firebaseEnabled = false;

const hasFirebaseConfig = () => {
  if (process.env.FIREBASE_ENABLED === 'false') {
    return false;
  }

  return [
    process.env.FIREBASE_PROJECT_ID,
    process.env.FIREBASE_PRIVATE_KEY,
    process.env.FIREBASE_CLIENT_EMAIL,
    process.env.FIREBASE_STORAGE_BUCKET,
  ].every(Boolean);
};

const initFirebase = () => {
  if (initialized) return firebaseEnabled;

  if (!hasFirebaseConfig()) {
    initialized = true;
    firebaseEnabled = false;
    logger.warn('⚠️  Firebase configuration missing or disabled. File uploads will be unavailable.');
    return false;
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  initialized = true;
  firebaseEnabled = true;
  logger.info('✅ Firebase initialized');
  return true;
};

const getBucket = () => {
  if (!firebaseEnabled) {
    throw new Error('Firebase storage is disabled');
  }
  return admin.storage().bucket();
};

const isFirebaseEnabled = () => firebaseEnabled;

module.exports = { initFirebase, getBucket, isFirebaseEnabled };
