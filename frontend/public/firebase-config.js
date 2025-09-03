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


// Export for use in other scripts
window.firebaseConfig = firebaseConfig;

// Log configuration status
console.log('🔥 Firebase configuration loaded for project:', firebaseConfig.projectId);

// Warning for development
if (firebaseConfig.apiKey.includes('AIzaSyB6rxGQewpeZ-zbVwETTE0OFvSiN0_Kkcs')) {
  console.warn('⚠️  Using default Firebase config. For production, use environment variables.');
}
