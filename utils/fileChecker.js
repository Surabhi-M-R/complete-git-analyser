const fs = require('fs-extra');
const path = require('path');

class FileChecker {
  checkForIssues(projectDir, analysis) {
    const issues = [];

    // Check for missing .gitignore
    if (!analysis.gitignore.exists) {
      issues.push({
        type: 'warning',
        message: '.gitignore file is missing',
        description: 'A .gitignore file prevents sensitive files and build artifacts from being committed to version control.',
        recommendation: 'Add a .gitignore file with patterns for your project type.',
        severity: 'medium'
      });
    } else {
      // Check if .gitignore has common patterns
      const gitignoreContent = fs.readFileSync(path.join(projectDir, '.gitignore'), 'utf8');
      const commonPatterns = this.getCommonGitignorePatterns(analysis.projectType);
      const missingPatterns = commonPatterns.filter(pattern => 
        !gitignoreContent.includes(pattern)
      );

      if (missingPatterns.length > 0) {
        issues.push({
          type: 'warning',
          message: '.gitignore is missing important patterns',
          description: `Your .gitignore is missing patterns for: ${missingPatterns.join(', ')}`,
          recommendation: 'Add these patterns to your .gitignore file.',
          severity: 'low'
        });
      }
    }

    // Check for .env file in repository (should not be committed)
    if (analysis.env.exists) {
      issues.push({
        type: 'critical',
        message: '.env file found in repository',
        description: '.env files often contain sensitive information like API keys and database credentials.',
        recommendation: 'Remove the .env file from version control and use .env.example with placeholder values instead.',
        severity: 'high'
      });
    }

    // Check for missing .env.example
    if (!fs.existsSync(path.join(projectDir, '.env.example'))) {
      issues.push({
        type: 'suggestion',
        message: '.env.example file is missing',
        description: 'An .env.example file helps other developers understand what environment variables are needed.',
        recommendation: 'Create an .env.example file with placeholder values for all required environment variables.',
        severity: 'low'
      });
    }

    // Check for large files that should be in .gitignore
    const largeFiles = this.checkForLargeFiles(projectDir);
    if (largeFiles.length > 0) {
      issues.push({
        type: 'warning',
        message: 'Potential large files found in repository',
        description: `The following files might be too large for version control: ${largeFiles.join(', ')}`,
        recommendation: 'Consider adding these files to .gitignore or using Git LFS for large files.',
        severity: 'medium'
      });
    }

    // Check for common sensitive files
    const sensitiveFiles = this.checkForSensitiveFiles(projectDir);
    if (sensitiveFiles.length > 0) {
      issues.push({
        type: 'critical',
        message: 'Potential sensitive files found',
        description: `The following files might contain sensitive information: ${sensitiveFiles.join(', ')}`,
        recommendation: 'Remove these files from version control immediately and rotate any exposed credentials.',
        severity: 'high'
      });
    }

    // Check for proper project structure
    if (!analysis.structure.hasSrc && !analysis.structure.hasApp) {
      issues.push({
        type: 'suggestion',
        message: 'Consider organizing code in src/ or app/ directory',
        description: 'A well-organized project structure makes maintenance easier.',
        recommendation: 'Move your source code to a dedicated directory like src/ or app/.',
        severity: 'low'
      });
    }

    return issues;
  }

  getCommonGitignorePatterns(projectType) {
    const commonPatterns = [
      'node_modules/',
      '.env',
      '.DS_Store',
      'dist/',
      'build/',
      '*.log',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      'coverage/',
      '.nyc_output'
    ];

    switch (projectType) {
      case 'nodejs':
        return commonPatterns.concat([
          'package-lock.json',
          'yarn.lock'
        ]);
      case 'python':
        return commonPatterns.concat([
          '__pycache__/',
          '*.py[cod]',
          '*$py.class',
          '*.so',
          '.Python',
          'env/',
          'venv/',
          'ENV/',
          'env.bak/',
          'venv.bak/'
        ]);
      case 'java':
        return commonPatterns.concat([
          'target/',
          '*.jar',
          '*.war',
          '*.ear',
          '*.zip',
          '*.tar.gz',
          '*.rar',
          'hs_err_pid*'
        ]);
      default:
        return commonPatterns;
    }
  }

  checkForLargeFiles(projectDir, maxSize = 1024 * 1024) { // 1MB default
    const largeFiles = [];
    
    const checkDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          // Skip node_modules and other directories that should be ignored
          if (file !== 'node_modules' && !file.startsWith('.')) {
            checkDir(filePath);
          }
        } else if (stat.size > maxSize) {
          largeFiles.push(filePath.replace(projectDir + '/', ''));
        }
      }
    };
    
    checkDir(projectDir);
    return largeFiles;
  }

  checkForSensitiveFiles(projectDir) {
    const sensitivePatterns = [
      /\.env$/,
      /\.key$/,
      /\.pem$/,
      /id_rsa$/,
      /id_dsa$/,
      /\.keystore$/,
      /\.jks$/,
      /\.pfx$/,
      /\.p12$/,
      /\.crt$/,
      /\.csr$/,
      /\.der$/,
      /config\.json$/,
      /credentials\.json$/,
      /\.sublime-project$/,
      /\.sublime-workspace$/,
      /\.htpasswd$/
    ];
    
    const sensitiveFiles = [];
    
    const checkDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        
        if (fs.statSync(filePath).isDirectory()) {
          checkDir(filePath);
        } else {
          for (const pattern of sensitivePatterns) {
            if (pattern.test(file)) {
              sensitiveFiles.push(filePath.replace(projectDir + '/', ''));
              break;
            }
          }
        }
      }
    };
    
    checkDir(projectDir);
    return sensitiveFiles;
  }
}

module.exports = new FileChecker();