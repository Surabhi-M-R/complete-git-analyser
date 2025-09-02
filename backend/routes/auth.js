// Authentication Routes
const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const databaseService = require('../services/databaseService');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Register user with Firebase Auth
    const result = await authService.registerUser(email, password, displayName);

    if (result.success) {
      // Save user profile to Firestore
      await databaseService.saveUserProfile(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName || displayName,
        createdAt: new Date().toISOString()
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: result.user
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Sign in user
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Sign in user with Firebase Auth
    const result = await authService.signInUser(email, password);

    if (result.success) {
      // Get user token
      const tokenResult = await authService.getUserToken();
      
      res.json({
        success: true,
        message: 'User signed in successfully',
        user: result.user,
        token: tokenResult.token
      });
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Sign out user
router.post('/signout', async (req, res) => {
  try {
    const result = await authService.signOutUser();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const result = await authService.resetPassword(email);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get current user
router.get('/current-user', async (req, res) => {
  try {
    const user = authService.getCurrentUser();
    
    if (user) {
      res.json({
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'No user is currently signed in'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get user token
router.get('/token', async (req, res) => {
  try {
    const result = await authService.getUserToken();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = authService.getCurrentUser();
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const result = await databaseService.getUserProfile(user.uid);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const user = authService.getCurrentUser();
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { displayName, preferences } = req.body;
    const profileData = { displayName, preferences, updatedAt: new Date().toISOString() };

    const result = await databaseService.updateDocument('user_profiles', user.uid, profileData);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
