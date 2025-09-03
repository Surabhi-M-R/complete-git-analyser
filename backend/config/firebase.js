// Firebase Admin SDK Configuration
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let app, auth, db;

try {
  // Check if Firebase Admin is already initialized
  if (admin.apps.length === 0) {
    // Initialize with default credentials or service account
    // For development, we'll use the project ID from environment or default
    const projectId = process.env.FIREBASE_PROJECT_ID || 'zeroops-77de2';
    
    app = admin.initializeApp({
      projectId: projectId,
      // In production, you would use a service account key file
      // For development, Firebase Admin SDK can use Application Default Credentials
    });
    
    console.log('Firebase Admin SDK initialized successfully');
  } else {
    app = admin.app();
    console.log('Using existing Firebase Admin SDK instance');
  }
  
  // Initialize Firebase services
  auth = admin.auth();
  db = admin.firestore();
  
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error);
  // Fallback: initialize without authentication for development
  app = null;
  auth = null;
  db = null;
}

// Export Firebase services
module.exports = {
  app,
  auth,
  db,
  admin
};
