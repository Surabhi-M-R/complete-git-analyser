# Repository Setup Instructions

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

## Initial Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd repo_analyser
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Edit the `.env` file with your actual configuration:
```env
# OpenAI API Configuration
OPENAI_API_KEY=your_actual_openai_api_key

# Server Configuration
PORT=3000
NODE_ENV=development

# Firebase Configuration (Backend)
FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config values
```

5. Start the backend server:
```bash
npm start
```

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Create environment file:
```bash
cp env.example .env
```

3. Edit the `.env` file with your actual Firebase configuration:
```env
# Firebase Configuration
FIREBASE_API_KEY=your_actual_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Access the Application

1. Make sure the backend server is running on port 3000
2. Open your browser and go to: `http://localhost:3000`
3. You should be redirected to the login page

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication
4. Enable Firestore Database

### 2. Get Firebase Configuration

1. Go to Project Settings > General
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web
4. Copy the configuration values to your `.env` files

### 3. Configure Authentication

1. Go to Authentication > Sign-in method
2. Enable Email/Password authentication
3. Configure authorized domains (add `localhost` for development)

## Security Notes

- **Never commit `.env` files to Git**
- **Never commit Firebase service account keys**
- **Use environment variables for all sensitive configuration**
- **Configure Firebase Security Rules properly**

## Troubleshooting

### Authentication Issues

1. Check browser console for Firebase errors
2. Verify Firebase configuration in `.env` files
3. Ensure Firebase Authentication is enabled
4. Check authorized domains in Firebase Console

### Server Issues

1. Check if port 3000 is available
2. Verify all dependencies are installed
3. Check backend logs for errors
4. Ensure `.env` file exists in backend directory

## Development Workflow

1. Make changes to your code
2. Test locally
3. Commit changes (excluding `.env` files)
4. Push to GitHub
5. Deploy to production with proper environment variables

## Production Deployment

1. Set up environment variables in your hosting platform
2. Configure Firebase Security Rules
3. Add production domains to Firebase authorized domains
4. Use HTTPS in production
