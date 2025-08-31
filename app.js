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

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

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
  res.setHeader('Content-Type', 'application/json');
  res.json({
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// Test analyze route with simple response
app.post('/test-analyze', (req, res) => {
  console.log('Test analyze route called');
  res.setHeader('Content-Type', 'application/json');
  res.json({
    success: true,
    message: 'Test response working',
    testData: 'This is a test response'
  });
});

// Download individual file route
app.get('/download/:fileType/:analysisId', async (req, res) => {
  const { fileType, analysisId } = req.params;
  
  try {
    const tempDir = path.join(__dirname, 'temp', analysisId);
    const filePath = path.join(tempDir, getFileName(fileType));
    
    console.log('Individual download request:', { fileType, analysisId, filePath });
    
    if (await fs.pathExists(filePath)) {
      const fileName = getFileName(fileType);
      console.log(`Sending file: ${fileName}`);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', getContentType(fileType));
      res.sendFile(filePath);
    } else {
      console.log(`File not found: ${filePath}`);
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
    console.log('Download request for analysis ID:', analysisId);
    console.log('Temp directory:', tempDir);
    
    if (!await fs.pathExists(tempDir)) {
      console.log('Temp directory does not exist');
      return res.status(404).json({ error: 'Analysis not found' });
    }
    
    // List all files in temp directory
    const allFiles = await fs.readdir(tempDir);
    console.log('Files in temp directory:', allFiles);
    
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level
    });
    
    res.attachment(`repository-files-${analysisId}.zip`);
    archive.pipe(res);
    
    // Add files to zip
    const files = ['Dockerfile', 'docker-compose.yml', 'README.md'];
    let filesAdded = 0;
    
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      if (await fs.pathExists(filePath)) {
        console.log(`Adding file to zip: ${file}`);
        archive.file(filePath, { name: file });
        filesAdded++;
      } else {
        console.log(`File not found: ${file}`);
      }
    }
    
    console.log(`Total files added to zip: ${filesAdded}`);
    await archive.finalize();
    console.log('Zip file created successfully');
  } catch (error) {
    console.error('Zip download error:', error);
    res.status(500).json({ error: 'Zip download failed' });
  }
});

app.post('/analyze', async (req, res) => {
  const { repoUrl } = req.body;
  
  console.log('Received analyze request for:', repoUrl);
  
  if (!repoUrl) {
    console.log('No repository URL provided');
    return res.status(400).json({ 
      success: false, 
      message: 'Repository URL is required' 
    });
  }

  try {
    // Create a unique directory for this analysis
    const analysisId = Date.now();
    const projectDir = path.join(__dirname, 'temp', analysisId.toString());
    
    console.log('Creating project directory:', projectDir);
    await fs.ensureDir(projectDir);

    // Clone the repository
    console.log('Cloning repository:', repoUrl);
    await simpleGit().clone(repoUrl, projectDir);
    console.log('Repository cloned successfully');

    // Analyze the repository
    console.log('Analyzing repository...');
    const analysis = await analyzer.analyzeRepository(projectDir);
    console.log('Analysis completed:', analysis);
    
    // Generate missing files
    console.log('Generating missing files...');
    const generatedFiles = await generator.generateFiles(projectDir, analysis);
    console.log('Files generated:', Object.keys(generatedFiles));
    
    // Save generated files to temp directory
    console.log('Saving generated files to temp directory...');
    if (generatedFiles.dockerfile) {
      await fs.writeFile(path.join(projectDir, 'Dockerfile'), generatedFiles.dockerfile);
      console.log('Dockerfile saved');
    }
    if (generatedFiles.compose) {
      await fs.writeFile(path.join(projectDir, 'docker-compose.yml'), generatedFiles.compose);
      console.log('docker-compose.yml saved');
    }
    if (generatedFiles.readme) {
      await fs.writeFile(path.join(projectDir, 'README.md'), generatedFiles.readme);
      console.log('README.md saved');
    }
    
    // Check for issues and best practices
    console.log('Checking for issues...');
    const issues = fileChecker.checkForIssues(projectDir, analysis);
    console.log('Issues found:', issues.length);
    
    // Get file contents for display
    console.log('Reading file contents...');
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

    console.log('Sending response...');
    
    // Set proper headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    
    // Send response with analysis ID for downloads
    const responseData = {
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
    };
    
    console.log('Response data prepared, sending...');
    res.status(200).json(responseData);
    console.log('Response sent successfully');

  } catch (error) {
    console.error('Error analyzing repository:', error);
    console.error('Error stack:', error.stack);
    
    // Set proper headers for error response
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    
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