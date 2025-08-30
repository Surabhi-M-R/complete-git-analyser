const express = require('express');
const simpleGit = require('simple-git');
const fs = require('fs-extra');
const path = require('path');
const analyzer = require('./utils/analyzer');
const generator = require('./utils/generator');
const fileChecker = require('./utils/fileChecker');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Favicon middleware to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content response
});

app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  try {
    console.log('Rendering index page with title:', 'Repository Analyzer');
    res.render('index', { title: 'Repository Analyzer' });
  } catch (error) {
    console.error('Error rendering index page:', error);
    res.status(500).send('Error rendering page: ' + error.message);
  }
});

// Debug route to test EJS rendering
app.get('/debug', (req, res) => {
  try {
    res.render('index', { title: 'Debug Test' });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Test simple EJS template
app.get('/simple-ejs', (req, res) => {
  try {
    res.render('simple', { title: 'Simple Test' });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Simple HTML test route
app.get('/simple', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Test Page</title>
    </head>
    <body>
        <h1>Test Page - Server is Working!</h1>
        <p>If you can see this, the server is working correctly.</p>
        <p>Now try going to <a href="/">the main page</a></p>
    </body>
    </html>
  `);
});

// Test route to verify server is working
app.get('/test', (req, res) => {
  res.send('Server is running');
});

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

    // Clean up (remove temporary directory)
    await fs.remove(projectDir);

    // Send response
    res.json({
      success: true,
      message: 'Analysis completed successfully',
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

// Start the server
const startServer = (port) => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(PORT);