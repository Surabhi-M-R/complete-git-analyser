// Firebase Configuration for Frontend
// This file contains the Firebase configuration for client-side use
// 
// SECURITY NOTE: Firebase client-side API keys are designed to be public
// However, for better security practices, we use environment variables

// Function to get environment variable (works in both Node.js and browser)
function getEnvVar(name, defaultValue) {
  // In browser, we'll use a simple approach
  // In production, you should use a build process to inject these values
  if (typeof window !== 'undefined' && window.FIREBASE_CONFIG) {
    return window.FIREBASE_CONFIG[name] || defaultValue;
  }
  return defaultValue;
}

// Configuration object - uses environment variables with fallbacks
const firebaseConfig = {
  apiKey: getEnvVar('FIREBASE_API_KEY', "AIzaSyB6rxGQewpeZ-zbVwETTE0OFvSiN0_Kkcs"),
  authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN', "zeroops-77de2.firebaseapp.com"),
  projectId: getEnvVar('FIREBASE_PROJECT_ID', "zeroops-77de2"),
  storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET', "zeroops-77de2.firebasestorage.app"),
  messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID', "511958088139"),
  appId: getEnvVar('FIREBASE_APP_ID', "1:511958088139:web:521c94d1921b0412339e4e"),
  measurementId: getEnvVar('FIREBASE_MEASUREMENT_ID', "G-FGVTV2WRKB")
};

// Export for use in other scripts
window.firebaseConfig = firebaseConfig;

// Log configuration status
console.log('🔥 Firebase configuration loaded for project:', firebaseConfig.projectId);

// Warning for development
if (firebaseConfig.apiKey.includes('AIzaSyB6rxGQewpeZ-zbVwETTE0OFvSiN0_Kkcs')) {
  console.warn('⚠️  Using default Firebase config. For production, use environment variables.');
}
