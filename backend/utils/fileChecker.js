const fs = require('fs-extra');
const path = require('path');

class FileChecker {
  checkForIssues(projectDir, analysis) {
    const issues = [];
    
    console.log('Checking for issues and best practices...');
    
    // Check Dockerfile issues
    if (analysis.dockerfile.exists) {
      issues.push(...this.checkDockerfileIssues(analysis.dockerfile.content));
    }
    
    // Check docker-compose issues
    if (analysis.compose.exists) {
      issues.push(...this.checkDockerComposeIssues(analysis.compose.content));
    }
    
    // Check README issues
    if (analysis.readme.exists) {
      issues.push(...this.checkReadmeIssues(analysis.readme.content, analysis));
    }
    
    // Check security issues
    issues.push(...this.checkSecurityIssues(analysis));
    
    // Check performance issues
    issues.push(...this.checkPerformanceIssues(analysis));
    
    // Check best practices
    issues.push(...this.checkBestPractices(analysis));
    
    // Check missing files
    issues.push(...this.checkMissingFiles(analysis));
    
    // Check environment configuration
    issues.push(...this.checkEnvironmentIssues(analysis));
    
    // Check dependency issues
    issues.push(...this.checkDependencyIssues(analysis));
    
    console.log(`Found ${issues.length} issues and recommendations`);
    
    return issues;
  }

  checkDockerfileIssues(content) {
    const issues = [];
    
    if (!content) return issues;
    
    const lines = content.split('\n');
    
    // Check for common Dockerfile issues
    if (!content.includes('FROM')) {
      issues.push({
        type: 'dockerfile',
        severity: 'critical',
        title: 'Missing FROM instruction',
        message: 'Dockerfile must start with a FROM instruction to specify the base image.'
      });
    }
    
    if (!content.includes('WORKDIR')) {
      issues.push({
        type: 'dockerfile',
        severity: 'medium',
        title: 'Missing WORKDIR instruction',
        message: 'Consider adding a WORKDIR instruction to set the working directory for subsequent instructions.'
      });
    }
    
    if (content.includes('COPY . .') && !content.includes('.dockerignore')) {
      issues.push({
        type: 'dockerfile',
        severity: 'medium',
        title: 'Missing .dockerignore file',
        message: 'Consider adding a .dockerignore file to exclude unnecessary files from the build context.'
      });
    }
    
    if (content.includes('RUN apt-get update') && !content.includes('rm -rf /var/lib/apt/lists/*')) {
      issues.push({
        type: 'dockerfile',
        severity: 'medium',
        title: 'Apt cache not cleaned',
        message: 'Clean apt cache after installing packages to reduce image size.'
      });
    }
    
    if (content.includes('USER root') && !content.includes('USER ')) {
      issues.push({
        type: 'dockerfile',
        severity: 'high',
        title: 'Running as root user',
        message: 'Consider running the application as a non-root user for security.'
      });
    }
    
    if (!content.includes('HEALTHCHECK')) {
      issues.push({
        type: 'dockerfile',
        severity: 'low',
        title: 'Missing health check',
        message: 'Consider adding a HEALTHCHECK instruction to monitor application health.'
      });
    }
    
    if (content.includes('EXPOSE') && !content.includes('CMD') && !content.includes('ENTRYPOINT')) {
      issues.push({
        type: 'dockerfile',
        severity: 'medium',
        title: 'Missing CMD or ENTRYPOINT',
        message: 'Dockerfile should specify how to run the application with CMD or ENTRYPOINT.'
      });
    }
    
    return issues;
  }

  checkDockerComposeIssues(content) {
    const issues = [];
    
    if (!content) return issues;
    
    // Check for common docker-compose issues
    if (!content.includes('version:')) {
      issues.push({
        type: 'docker-compose',
        severity: 'low',
        title: 'Missing version specification',
        message: 'Consider specifying the docker-compose file version for better compatibility.'
      });
    }
    
    if (!content.includes('restart:')) {
      issues.push({
        type: 'docker-compose',
        severity: 'medium',
        title: 'Missing restart policy',
        message: 'Consider adding a restart policy to ensure services restart automatically.'
      });
    }
    
    if (!content.includes('healthcheck:')) {
      issues.push({
        type: 'docker-compose',
        severity: 'low',
        title: 'Missing health checks',
        message: 'Consider adding health checks to monitor service health.'
      });
    }
    
    if (content.includes('environment:') && !content.includes('.env')) {
      issues.push({
        type: 'docker-compose',
        severity: 'medium',
        title: 'Environment variables not externalized',
        message: 'Consider using .env files for environment variables instead of hardcoding them.'
      });
    }
    
    if (!content.includes('networks:') && content.includes('services:')) {
      issues.push({
        type: 'docker-compose',
        severity: 'low',
        title: 'No custom networks defined',
        message: 'Consider defining custom networks for better service isolation.'
      });
    }
    
    return issues;
  }

  checkReadmeIssues(content, analysis) {
    const issues = [];
    
    if (!content) return issues;
    
    const contentLower = content.toLowerCase();
    
    // Check for missing sections
    if (!contentLower.includes('install') && !contentLower.includes('setup')) {
      issues.push({
        type: 'readme',
        severity: 'medium',
        title: 'Missing installation instructions',
        message: 'README should include installation or setup instructions.'
      });
    }
    
    if (!contentLower.includes('usage') && !contentLower.includes('how to')) {
      issues.push({
        type: 'readme',
        severity: 'medium',
        title: 'Missing usage instructions',
        message: 'README should include usage instructions or examples.'
      });
    }
    
    if (!contentLower.includes('docker') && (analysis.dockerfile.exists || analysis.compose.exists)) {
      issues.push({
        type: 'readme',
        severity: 'low',
        title: 'Missing Docker documentation',
        message: 'README should include Docker usage instructions since Docker files are present.'
      });
    }
    
    if (!contentLower.includes('license')) {
      issues.push({
        type: 'readme',
        severity: 'low',
        title: 'Missing license information',
        message: 'Consider adding license information to the README.'
      });
    }
    
    if (!contentLower.includes('contributing')) {
      issues.push({
        type: 'readme',
        severity: 'low',
        title: 'Missing contributing guidelines',
        message: 'Consider adding contributing guidelines for open source projects.'
      });
    }
    
    return issues;
  }

  checkSecurityIssues(analysis) {
    const issues = [];
    
    // Check for security-related issues
    if (analysis.env.exists && analysis.env.files) {
      for (const envFile of analysis.env.files) {
        if (envFile.hasApiKeys && envFile.path !== '.env.example') {
          issues.push({
            type: 'security',
            severity: 'high',
            title: 'API keys in environment file',
            message: `API keys found in ${envFile.path}. Ensure this file is not committed to version control.`
          });
        }
      }
    }
    
    if (analysis.gitignore.exists && !analysis.gitignore.hasEnvFiles) {
      issues.push({
        type: 'security',
        severity: 'high',
        title: 'Environment files not in .gitignore',
        message: 'Environment files (.env) should be added to .gitignore to prevent committing sensitive data.'
      });
    }
    
    if (analysis.package.exists && analysis.package.hasDependencies) {
      // Check for known vulnerable dependencies (basic check)
      const vulnerableDeps = ['lodash', 'moment', 'axios'];
      for (const dep of vulnerableDeps) {
        if (analysis.dependencies.utilities && analysis.dependencies.utilities.includes(dep)) {
          issues.push({
            type: 'security',
            severity: 'medium',
            title: `Potentially vulnerable dependency: ${dep}`,
            message: `Consider updating ${dep} to the latest version and checking for security vulnerabilities.`
          });
        }
      }
    }
    
    return issues;
  }

  checkPerformanceIssues(analysis) {
    const issues = [];
    
    // Check for performance-related issues
    if (analysis.package.exists && analysis.package.hasDevDependencies) {
      issues.push({
        type: 'performance',
        severity: 'low',
        title: 'Dev dependencies in production',
        message: 'Ensure dev dependencies are not included in production builds.'
      });
    }
    
    if (analysis.structure.hasLogs) {
      issues.push({
        type: 'performance',
        severity: 'low',
        title: 'Log directory present',
        message: 'Consider using external logging services instead of local log files.'
      });
    }
    
    if (analysis.totalFiles > 1000) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        title: 'Large number of files',
        message: `Project contains ${analysis.totalFiles} files. Consider optimizing the project structure.`
      });
    }
    
    return issues;
  }

  checkBestPractices(analysis) {
    const issues = [];
    
    // Check for best practices
    if (!analysis.gitignore.exists) {
      issues.push({
        type: 'best-practice',
        severity: 'medium',
        title: 'Missing .gitignore file',
        message: 'Consider adding a .gitignore file to exclude unnecessary files from version control.'
      });
    }
    
    if (analysis.package.exists && !analysis.package.hasScripts) {
      issues.push({
        type: 'best-practice',
        severity: 'low',
        title: 'No npm scripts defined',
        message: 'Consider adding useful npm scripts for common tasks like build, test, and start.'
      });
    }
    
    if (!analysis.structure.hasTests) {
      issues.push({
        type: 'best-practice',
        severity: 'medium',
        title: 'No test directory found',
        message: 'Consider adding tests to ensure code quality and reliability.'
      });
    }
    
    if (!analysis.structure.hasDocs) {
      issues.push({
        type: 'best-practice',
        severity: 'low',
        title: 'No documentation directory',
        message: 'Consider adding a docs directory for project documentation.'
      });
    }
    
    if (analysis.ci.length === 0) {
      issues.push({
        type: 'best-practice',
        severity: 'low',
        title: 'No CI/CD configuration',
        message: 'Consider adding CI/CD configuration for automated testing and deployment.'
      });
    }
    
    return issues;
  }

  checkMissingFiles(analysis) {
    const issues = [];
    
    // Check for commonly missing files
    if (!analysis.dockerfile.exists) {
      issues.push({
        type: 'missing-file',
        severity: 'medium',
        title: 'Missing Dockerfile',
        message: 'Consider adding a Dockerfile for containerized deployment.'
      });
    }
    
    if (!analysis.compose.exists) {
      issues.push({
        type: 'missing-file',
        severity: 'low',
        title: 'Missing docker-compose.yml',
        message: 'Consider adding docker-compose.yml for multi-service development and deployment.'
      });
    }
    
    if (!analysis.readme.exists) {
      issues.push({
        type: 'missing-file',
        severity: 'high',
        title: 'Missing README.md',
        message: 'README.md is essential for project documentation and onboarding.'
      });
    }
    
    if (!analysis.gitignore.exists) {
      issues.push({
        type: 'missing-file',
        severity: 'medium',
        title: 'Missing .gitignore',
        message: '.gitignore file is important to prevent committing unnecessary files.'
      });
    }
    
    if (analysis.linter.length === 0) {
      issues.push({
        type: 'missing-file',
        severity: 'low',
        title: 'No linter configuration',
        message: 'Consider adding linter configuration for code quality and consistency.'
      });
    }
    
    return issues;
  }

  checkEnvironmentIssues(analysis) {
    const issues = [];
    
    // Check environment-related issues
    if (!analysis.env.exists) {
      issues.push({
        type: 'environment',
        severity: 'low',
        title: 'No environment files found',
        message: 'Consider adding .env.example file to document required environment variables.'
      });
    } else if (analysis.env.files) {
      const hasExample = analysis.env.files.some(file => file.path === '.env.example');
      if (!hasExample) {
        issues.push({
          type: 'environment',
          severity: 'medium',
          title: 'Missing .env.example file',
          message: 'Add .env.example file to document required environment variables.'
        });
      }
    }
    
    return issues;
  }

  checkDependencyIssues(analysis) {
    const issues = [];
    
    // Check dependency-related issues
    if (analysis.package.exists && analysis.package.hasDependencies) {
      if (analysis.dependencies.webFramework.length === 0) {
        issues.push({
          type: 'dependency',
          severity: 'low',
          title: 'No web framework detected',
          message: 'Consider using a web framework for better structure and features.'
        });
      }
      
      if (analysis.dependencies.testing.length === 0) {
        issues.push({
          type: 'dependency',
          severity: 'medium',
          title: 'No testing framework detected',
          message: 'Consider adding a testing framework to ensure code quality.'
        });
      }
      
      if (analysis.dependencies.buildTools.length === 0 && analysis.projectType === 'nodejs') {
        issues.push({
          type: 'dependency',
          severity: 'low',
          title: 'No build tool detected',
          message: 'Consider adding a build tool like webpack, vite, or rollup for better development experience.'
        });
      }
    }
    
    return issues;
  }
}

module.exports = new FileChecker();