const fs = require('fs-extra');
const path = require('path');

class RepositoryAnalyzer {
  async analyzeRepository(projectDir) {
    const analysis = {
      projectType: this.detectProjectType(projectDir),
      dockerfile: {
        exists: fs.existsSync(path.join(projectDir, 'Dockerfile')),
        content: null
      },
      compose: {
        exists: fs.existsSync(path.join(projectDir, 'docker-compose.yml')) ||
               fs.existsSync(path.join(projectDir, 'docker-compose.yaml')),
        content: null
      },
      readme: {
        exists: fs.existsSync(path.join(projectDir, 'README.md')) ||
               fs.existsSync(path.join(projectDir, 'README')) ||
               fs.existsSync(path.join(projectDir, 'Readme.md')),
        content: null
      },
      gitignore: {
        exists: fs.existsSync(path.join(projectDir, '.gitignore')),
        content: null
      },
      env: {
        exists: fs.existsSync(path.join(projectDir, '.env')),
        content: null
      },
      package: await this.analyzePackageFile(projectDir),
      structure: await this.analyzeProjectStructure(projectDir)
    };

    return analysis;
  }

  detectProjectType(projectDir) {
    if (fs.existsSync(path.join(projectDir, 'package.json'))) return 'nodejs';
    if (fs.existsSync(path.join(projectDir, 'requirements.txt'))) return 'python';
    if (fs.existsSync(path.join(projectDir, 'pom.xml'))) return 'java';
    if (fs.existsSync(path.join(projectDir, 'composer.json'))) return 'php';
    if (fs.existsSync(path.join(projectDir, 'go.mod'))) return 'go';
    if (fs.existsSync(path.join(projectDir, 'Gemfile'))) return 'ruby';
    if (fs.existsSync(path.join(projectDir, 'project.clj'))) return 'clojure';
    return 'unknown';
  }

  async analyzePackageFile(projectDir) {
    const packagePaths = [
      'package.json',
      'requirements.txt',
      'pom.xml',
      'composer.json',
      'go.mod',
      'Gemfile',
      'project.clj'
    ];

    for (const pkgPath of packagePaths) {
      const fullPath = path.join(projectDir, pkgPath);
      if (fs.existsSync(fullPath)) {
        try {
          const content = await fs.readFile(fullPath, 'utf8');
          return {
            path: pkgPath,
            content: pkgPath === 'package.json' ? JSON.parse(content) : content,
            exists: true
          };
        } catch (error) {
          console.error(`Error reading ${pkgPath}:`, error);
        }
      }
    }

    return { exists: false };
  }

  async analyzeProjectStructure(projectDir) {
    const structure = {
      hasSrc: fs.existsSync(path.join(projectDir, 'src')),
      hasApp: fs.existsSync(path.join(projectDir, 'app')),
      hasPublic: fs.existsSync(path.join(projectDir, 'public')),
      hasStatic: fs.existsSync(path.join(projectDir, 'static')),
      hasConfig: fs.existsSync(path.join(projectDir, 'config')),
      hasTests: fs.existsSync(path.join(projectDir, 'tests')) || 
               fs.existsSync(path.join(projectDir, '__tests__')) ||
               fs.existsSync(path.join(projectDir, 'test')),
      hasDocs: fs.existsSync(path.join(projectDir, 'docs')),
      hasLogs: fs.existsSync(path.join(projectDir, 'logs')),
      hasTmp: fs.existsSync(path.join(projectDir, 'tmp'))
    };

    return structure;
  }
}

module.exports = new RepositoryAnalyzer();