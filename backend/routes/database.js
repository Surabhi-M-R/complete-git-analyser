// Database Routes for Analysis Results
const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');
const authService = require('../services/authService');

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  const user = authService.getCurrentUser();
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  req.user = user;
  next();
};

// Save analysis result
router.post('/analysis', requireAuth, async (req, res) => {
  try {
    const { repositoryUrl, analysisData, generatedFiles, issues, files } = req.body;

    // Validate input
    if (!repositoryUrl || !analysisData) {
      return res.status(400).json({
        success: false,
        error: 'Repository URL and analysis data are required'
      });
    }

    const analysisResult = {
      repositoryUrl,
      analysis: analysisData,
      generated: generatedFiles,
      issues,
      files
    };

    const result = await databaseService.saveAnalysisResult(req.user.uid, analysisResult);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get user's analysis history
router.get('/analysis/history', requireAuth, async (req, res) => {
  try {
    const result = await databaseService.getUserAnalysisHistory(req.user.uid);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get specific analysis result
router.get('/analysis/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await databaseService.getDocument('analysis_results', id);
    
    // Check if the analysis belongs to the current user
    if (result.success && result.data.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Delete analysis result
router.delete('/analysis/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if the analysis belongs to the current user
    const analysisResult = await databaseService.getDocument('analysis_results', id);
    
    if (!analysisResult.success) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }
    
    if (analysisResult.data.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    const result = await databaseService.deleteDocument('analysis_results', id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get user statistics
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const historyResult = await databaseService.getUserAnalysisHistory(req.user.uid);
    
    if (!historyResult.success) {
      return res.status(500).json(historyResult);
    }
    
    const analyses = historyResult.data;
    const stats = {
      totalAnalyses: analyses.length,
      repositoriesAnalyzed: [...new Set(analyses.map(a => a.repositoryUrl))].length,
      lastAnalysisDate: analyses.length > 0 ? analyses[0].createdAt : null,
      averageIssuesPerAnalysis: analyses.length > 0 
        ? Math.round(analyses.reduce((sum, a) => sum + (a.issues?.length || 0), 0) / analyses.length)
        : 0
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Search analyses
router.get('/analysis/search', requireAuth, async (req, res) => {
  try {
    const { query: searchQuery, limit: limitCount = 10 } = req.query;
    
    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    // Get user's analysis history
    const historyResult = await databaseService.getUserAnalysisHistory(req.user.uid);
    
    if (!historyResult.success) {
      return res.status(500).json(historyResult);
    }
    
    // Filter analyses based on search query
    const analyses = historyResult.data.filter(analysis => 
      analysis.repositoryUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (analysis.analysisData?.summary && analysis.analysisData.summary.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    // Limit results
    const limitedResults = analyses.slice(0, parseInt(limitCount));
    
    res.json({
      success: true,
      data: limitedResults,
      total: analyses.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
