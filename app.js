const express = require('express');
const simpleGit = require('simple-git');
const fs = require('fs-extra');
const path = require('path');
const analyzer = require('./utils/analyzer');
const generator = require('./utils/generator');
const fileChecker = require('./utils/fileChecker');
const archiver = require('archiver');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Favicon middleware to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content response
});

// Add error handling middleware for debugging
app.use((err, req, res, next) => {
  console.error('Express error:', err.stack);
  res.status(500).send('Something broke! Check the console for details.');
});

// Routes
app.get('/', (req, res) => {
  try {
    console.log('Serving index.html from public directory');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } catch (error) {
    console.error('Error serving index page:', error);
    res.status(500).send('Error serving page: ' + error.message);
  }
});

// Test route to verify server is working
app.get('/test', (req, res) => {
  res.json({
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// Download individual file route
app.get('/download/:fileType/:analysisId', async (req, res) => {
  const { fileType, analysisId } = req.params;
  
  try {
    const tempDir = path.join(__dirname, 'temp', analysisId);
    const filePath = path.join(tempDir, getFileName(fileType));
    
    if (await fs.pathExists(filePath)) {
      const fileName = getFileName(fileType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', getContentType(fileType));
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Download all files as zip route
app.get('/download-all/:analysisId', async (req, res) => {
  const { analysisId } = req.params;
  
  try {
    const tempDir = path.join(__dirname, 'temp', analysisId);
    
    if (!await fs.pathExists(tempDir)) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level
    });
    
    res.attachment(`repository-files-${analysisId}.zip`);
    archive.pipe(res);
    
    // Add files to zip
    const files = ['Dockerfile', 'docker-compose.yml', 'README.md'];
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      if (await fs.pathExists(filePath)) {
        archive.file(filePath, { name: file });
      }
    }
    
    await archive.finalize();
  } catch (error) {
    console.error('Zip download error:', error);
    res.status(500).json({ error: 'Zip download failed' });
  }
});

// Helper functions
function getFileName(fileType) {
  const fileNames = {
    'dockerfile': 'Dockerfile',
    'compose': 'docker-compose.yml',
    'readme': 'README.md'
  };
  return fileNames[fileType] || fileType;
}

function getContentType(fileType) {
  const contentTypes = {
    'dockerfile': 'text/plain',
    'compose': 'application/x-yaml',
    'readme': 'text/markdown'
  };
  return contentTypes[fileType] || 'text/plain';
}

app.post('/analyze', async (req, res) => {
  const { repoUrl } = req.body;
  
  if (!repoUrl) {
    return res.status(400).json({ 
      success: false, 
      message: 'Repository URL is required' 
    });
  }

  try {
    // Create a unique directory for this analysis
    const analysisId = Date.now();
    const projectDir = path.join(__dirname, 'temp', analysisId.toString());
    
    await fs.ensureDir(projectDir);

    // Clone the repository
    await simpleGit().clone(repoUrl, projectDir);
    console.log('Repository cloned successfully');

    // Analyze the repository
    const analysis = await analyzer.analyzeRepository(projectDir);
    
    // Generate missing files
    const generatedFiles = await generator.generateFiles(projectDir, analysis);
    
    // Check for issues and best practices
    const issues = fileChecker.checkForIssues(projectDir, analysis);
    
    // Get file contents for display
    const fileContents = {
      dockerfile: analysis.dockerfile.exists ? 
        await fs.readFile(path.join(projectDir, 'Dockerfile'), 'utf8') : 
        generatedFiles.dockerfile,
      compose: analysis.compose.exists ? 
        await fs.readFile(path.join(projectDir, 'docker-compose.yml'), 'utf8') : 
        generatedFiles.compose,
      readme: analysis.readme.exists ? 
        await fs.readFile(path.join(projectDir, 'README.md'), 'utf8') : 
        generatedFiles.readme
    };

    // Send response with analysis ID for downloads
    res.json({
      success: true,
      message: 'Analysis completed successfully',
      analysisId: analysisId.toString(),
      analysis,
      issues,
      files: fileContents,
      generated: {
        dockerfile: !analysis.dockerfile.exists,
        compose: !analysis.compose.exists,
        readme: !analysis.readme.exists
      }
    });

  } catch (error) {
    console.error('Error analyzing repository:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error analyzing repository',
      error: error.message 
    });
  }
});

// Start the server with better error handling
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
    console.log(`📁 Public directory: ${path.join(__dirname, 'public')}`);
    
    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log(`📁 Created temp directory: ${tempDir}`);
    }
    
    // Verify public directory exists
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      console.error(`❌ Public directory does not exist: ${publicDir}`);
    } else {
      console.log(`✅ Public directory exists: ${publicDir}`);
      const publicFiles = fs.readdirSync(publicDir);
      console.log(`📄 Public files found: ${publicFiles.join(', ')}`);
    }
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`❌ Port ${port} is busy, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('❌ Server error:', err);
    }
  });
  
  return server;
};

startServer(PORT);