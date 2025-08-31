const fs = require('fs-extra');
const path = require('path');

class RepositoryAnalyzer {
  async analyzeRepository(projectDir) {
    console.log('Starting comprehensive repository analysis...');
    
    const analysis = {
      projectType: await this.detectProjectType(projectDir),
      totalFiles: await this.countTotalFiles(projectDir),
      dockerfile: await this.analyzeDockerfile(projectDir),
      compose: await this.analyzeDockerCompose(projectDir),
      readme: await this.analyzeReadme(projectDir),
      gitignore: await this.analyzeGitignore(projectDir),
      env: await this.analyzeEnvFiles(projectDir),
      package: await this.analyzePackageFile(projectDir),
      structure: await this.analyzeProjectStructure(projectDir),
      dependencies: await this.analyzeDependencies(projectDir),
      entryPoints: await this.findEntryPoints(projectDir),
      ports: await this.detectPorts(projectDir),
      database: await this.detectDatabase(projectDir),
      frameworks: await this.detectFrameworks(projectDir),
      buildTools: await this.detectBuildTools(projectDir),
      testFramework: await this.detectTestFramework(projectDir),
      linter: await this.detectLinter(projectDir),
      ci: await this.detectCI(projectDir)
    };

    console.log('Analysis completed:', {
      projectType: analysis.projectType,
      totalFiles: analysis.totalFiles,
      hasDockerfile: analysis.dockerfile.exists,
      hasCompose: analysis.compose.exists,
      hasReadme: analysis.readme.exists
    });

    return analysis;
  }

  async detectProjectType(projectDir) {
    try {
      // Simple file-based detection without recursive calls
      if (fs.existsSync(path.join(projectDir, 'package.json'))) {
        // Check for specific frameworks
        if (fs.existsSync(path.join(projectDir, 'angular.json'))) return 'angular';
        if (fs.existsSync(path.join(projectDir, 'vue.config.js'))) return 'vue';
        if (fs.existsSync(path.join(projectDir, 'next.config.js'))) return 'nextjs';
        if (fs.existsSync(path.join(projectDir, 'nuxt.config.js'))) return 'nuxt';
        if (fs.existsSync(path.join(projectDir, 'src')) && fs.existsSync(path.join(projectDir, 'public'))) return 'react';
        if (fs.existsSync(path.join(projectDir, 'app.js')) || fs.existsSync(path.join(projectDir, 'server.js'))) return 'express';
        return 'nodejs';
      }
      
      if (fs.existsSync(path.join(projectDir, 'requirements.txt')) || fs.existsSync(path.join(projectDir, 'setup.py'))) {
        if (fs.existsSync(path.join(projectDir, 'manage.py'))) return 'django';
        if (fs.existsSync(path.join(projectDir, 'app.py'))) return 'flask';
        return 'python';
      }
      
      if (fs.existsSync(path.join(projectDir, 'pom.xml')) || fs.existsSync(path.join(projectDir, 'build.gradle'))) {
        if (fs.existsSync(path.join(projectDir, 'src/main/java'))) return 'spring';
        return 'java';
      }
      
      if (fs.existsSync(path.join(projectDir, 'composer.json'))) {
        if (fs.existsSync(path.join(projectDir, 'artisan'))) return 'laravel';
        return 'php';
      }
      
      if (fs.existsSync(path.join(projectDir, 'go.mod'))) return 'go';
      if (fs.existsSync(path.join(projectDir, 'Gemfile'))) return 'ruby';
      if (fs.existsSync(path.join(projectDir, 'Cargo.toml'))) return 'rust';
      if (fs.existsSync(path.join(projectDir, 'pubspec.yaml'))) return 'flutter';
      
      // Check for .NET projects
      const files = await fs.readdir(projectDir);
      const dotnetFiles = files.filter(f => f.endsWith('.csproj') || f.endsWith('.vbproj') || f.endsWith('.fsproj'));
      if (dotnetFiles.length > 0) return 'dotnet';
      
      return 'unknown';
    } catch (error) {
      console.error('Error detecting project type:', error);
      return 'unknown';
    }
  }

  async countTotalFiles(projectDir) {
    try {
      let count = 0;
      const countFiles = async (dir) => {
        const items = await fs.readdir(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = await fs.stat(fullPath);
          
          if (stat.isDirectory()) {
            // Skip node_modules, .git, and other large directories
            if (!['node_modules', '.git', 'dist', 'build', '.next', 'target'].includes(item)) {
              await countFiles(fullPath);
            }
          } else {
            count++;
          }
        }
      };
      
      await countFiles(projectDir);
      return count;
    } catch (error) {
      console.error('Error counting files:', error);
      return 0;
    }
  }

  async getAllFiles(dir, files = [], projectRoot = null) {
    if (!projectRoot) {
      projectRoot = dir;
    }
    
    try {
      const items = await fs.readdir(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = await fs.stat(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules, .git, and other large directories
          if (!['node_modules', '.git', 'dist', 'build', '.next', 'target'].includes(item)) {
            await this.getAllFiles(fullPath, files, projectRoot);
          }
        } else {
          // Get relative path from project root
          const relativePath = path.relative(projectRoot, fullPath);
          files.push(relativePath);
        }
      }
    } catch (error) {
      console.error('Error reading directory:', error);
    }
    return files;
  }

  async analyzeDockerfile(projectDir) {
    const dockerfilePaths = ['Dockerfile', 'Dockerfile.dev', 'Dockerfile.prod'];
    
    for (const dockerfilePath of dockerfilePaths) {
      const fullPath = path.join(projectDir, dockerfilePath);
      if (fs.existsSync(fullPath)) {
        try {
          const content = await fs.readFile(fullPath, 'utf8');
          return {
            exists: true,
            path: dockerfilePath,
            content: content,
            isValid: this.validateDockerfile(content)
          };
        } catch (error) {
          console.error(`Error reading ${dockerfilePath}:`, error);
          // Continue to next file instead of returning null
        }
      }
    }

    return { exists: false, content: null, isValid: false };
  }

  async analyzeDockerCompose(projectDir) {
    const composePaths = ['docker-compose.yml', 'docker-compose.yaml', 'docker-compose.override.yml'];
    
    for (const composePath of composePaths) {
      const fullPath = path.join(projectDir, composePath);
      if (fs.existsSync(fullPath)) {
        try {
          const content = await fs.readFile(fullPath, 'utf8');
          return {
            exists: true,
            path: composePath,
            content: content,
            isValid: this.validateYaml(content)
          };
        } catch (error) {
          console.error(`Error reading ${composePath}:`, error);
        }
      }
    }

    return { exists: false, content: null, isValid: false };
  }

  async analyzeReadme(projectDir) {
    const readmePaths = ['README.md', 'README', 'Readme.md', 'readme.md', 'README.txt'];
    
    for (const readmePath of readmePaths) {
      const fullPath = path.join(projectDir, readmePath);
      if (fs.existsSync(fullPath)) {
        try {
          const content = await fs.readFile(fullPath, 'utf8');
          return {
            exists: true,
            path: readmePath,
            content: content,
            hasDockerInfo: content.toLowerCase().includes('docker'),
            hasInstallation: content.toLowerCase().includes('install'),
            hasUsage: content.toLowerCase().includes('usage') || content.toLowerCase().includes('how to')
          };
        } catch (error) {
          console.error(`Error reading ${readmePath}:`, error);
        }
      }
    }

    return { exists: false, content: null, hasDockerInfo: false, hasInstallation: false, hasUsage: false };
  }

  async analyzeGitignore(projectDir) {
    const gitignorePath = path.join(projectDir, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      try {
        const content = await fs.readFile(gitignorePath, 'utf8');
        return {
          exists: true,
          content: content,
          hasNodeModules: content.includes('node_modules'),
          hasEnvFiles: content.includes('.env'),
          hasLogs: content.includes('logs'),
          hasBuild: content.includes('build') || content.includes('dist')
        };
      } catch (error) {
        console.error('Error reading .gitignore:', error);
      }
    }
    return { exists: false, content: null };
  }

  async analyzeEnvFiles(projectDir) {
    const envPaths = ['.env', '.env.local', '.env.development', '.env.production', '.env.example'];
    const envFiles = [];
    
    for (const envPath of envPaths) {
      const fullPath = path.join(projectDir, envPath);
      if (fs.existsSync(fullPath)) {
        try {
          const content = await fs.readFile(fullPath, 'utf8');
          envFiles.push({
            path: envPath,
            content: content,
            hasDatabaseUrl: content.toLowerCase().includes('database') || content.toLowerCase().includes('db_'),
            hasApiKeys: content.toLowerCase().includes('api') || content.toLowerCase().includes('key'),
            hasPort: content.toLowerCase().includes('port')
          });
        } catch (error) {
          console.error(`Error reading ${envPath}:`, error);
        }
      }
    }

    return {
      exists: envFiles.length > 0,
      files: envFiles,
      count: envFiles.length
    };
  }

  async analyzePackageFile(projectDir) {
    const packagePaths = [
      'package.json',
      'requirements.txt',
      'setup.py',
      'pyproject.toml',
      'pom.xml',
      'build.gradle',
      'composer.json',
      'go.mod',
      'Gemfile',
      'Cargo.toml',
      'pubspec.yaml'
    ];

    for (const pkgPath of packagePaths) {
      const fullPath = path.join(projectDir, pkgPath);
      if (fs.existsSync(fullPath)) {
        try {
          const content = await fs.readFile(fullPath, 'utf8');
          let parsed = content;
          
          if (pkgPath === 'package.json') {
            parsed = JSON.parse(content);
          }
          
          return {
            path: pkgPath,
            content: parsed,
            exists: true,
            hasScripts: parsed.scripts ? Object.keys(parsed.scripts).length > 0 : false,
            hasDependencies: parsed.dependencies ? Object.keys(parsed.dependencies).length > 0 : false,
            hasDevDependencies: parsed.devDependencies ? Object.keys(parsed.devDependencies).length > 0 : false
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
      hasTmp: fs.existsSync(path.join(projectDir, 'tmp')),
      hasPages: fs.existsSync(path.join(projectDir, 'pages')),
      hasComponents: fs.existsSync(path.join(projectDir, 'components')),
      hasViews: fs.existsSync(path.join(projectDir, 'views')),
      hasControllers: fs.existsSync(path.join(projectDir, 'controllers')),
      hasModels: fs.existsSync(path.join(projectDir, 'models')),
      hasRoutes: fs.existsSync(path.join(projectDir, 'routes')),
      hasMiddleware: fs.existsSync(path.join(projectDir, 'middleware')),
      hasUtils: fs.existsSync(path.join(projectDir, 'utils')) || fs.existsSync(path.join(projectDir, 'lib')),
      hasAssets: fs.existsSync(path.join(projectDir, 'assets'))
    };

    return structure;
  }

  async analyzeDependencies(projectDir) {
    const dependencies = {
      database: [],
      webFramework: [],
      testing: [],
      buildTools: [],
      utilities: []
    };

    try {
      const packagePath = path.join(projectDir, 'package.json');
      if (fs.existsSync(packagePath)) {
        const content = await fs.readFile(packagePath, 'utf8');
        const pkg = JSON.parse(content);
        
        const allDeps = {
          ...pkg.dependencies,
          ...pkg.devDependencies
        };

        // Categorize dependencies
        for (const [dep, version] of Object.entries(allDeps)) {
          if (this.isDatabase(dep)) dependencies.database.push(dep);
          if (this.isWebFramework(dep)) dependencies.webFramework.push(dep);
          if (this.isTesting(dep)) dependencies.testing.push(dep);
          if (this.isBuildTool(dep)) dependencies.buildTools.push(dep);
          if (this.isUtility(dep)) dependencies.utilities.push(dep);
        }
      }
    } catch (error) {
      console.error('Error analyzing dependencies:', error);
    }

    return dependencies;
  }

  async findEntryPoints(projectDir) {
    const entryPoints = [];
    const commonEntryPoints = [
      'app.js', 'server.js', 'index.js', 'main.js', 'start.js',
      'app.py', 'main.py', 'server.py', 'manage.py',
      'app.php', 'index.php', 'main.php',
      'main.go', 'server.go',
      'app.rb', 'main.rb', 'server.rb'
    ];

    for (const entryPoint of commonEntryPoints) {
      const fullPath = path.join(projectDir, entryPoint);
      if (fs.existsSync(fullPath)) {
        entryPoints.push(entryPoint);
      }
    }

    return entryPoints;
  }

  async detectPorts(projectDir) {
    const ports = [];
    
    try {
      // Check package.json scripts
      const packagePath = path.join(projectDir, 'package.json');
      if (fs.existsSync(packagePath)) {
        const content = await fs.readFile(packagePath, 'utf8');
        const pkg = JSON.parse(content);
        
        if (pkg.scripts) {
          for (const [script, command] of Object.entries(pkg.scripts)) {
            const portMatch = command.match(/port\s*=\s*(\d+)/i) || 
                            command.match(/-p\s+(\d+)/) ||
                            command.match(/--port\s+(\d+)/);
            if (portMatch) {
              ports.push(parseInt(portMatch[1]));
            }
          }
        }
      }

      // Check common entry point files for ports
      const entryFiles = ['app.js', 'server.js', 'index.js', 'main.js', 'app.py', 'main.py', 'server.py'];
      for (const file of entryFiles) {
        const fullPath = path.join(projectDir, file);
        if (fs.existsSync(fullPath)) {
          try {
            const content = await fs.readFile(fullPath, 'utf8');
            const portMatches = content.match(/port\s*[:=]\s*(\d+)/gi);
            if (portMatches) {
              for (const match of portMatches) {
                const port = parseInt(match.match(/\d+/)[0]);
                if (!ports.includes(port)) {
                  ports.push(port);
                }
              }
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    } catch (error) {
      console.error('Error detecting ports:', error);
    }

    return ports.length > 0 ? ports : [3000, 8000, 8080]; // Default ports
  }

  async detectDatabase(projectDir) {
    const databases = [];
    
    try {
      const dependencies = await this.analyzeDependencies(projectDir);
      databases.push(...dependencies.database);
      
      // Check for database configuration files
      const dbFiles = ['database.yml', 'db.yml', 'config/database.yml'];
      for (const dbFile of dbFiles) {
        const fullPath = path.join(projectDir, dbFile);
        if (fs.existsSync(fullPath)) {
          databases.push('database_config');
        }
      }
    } catch (error) {
      console.error('Error detecting database:', error);
    }

    return databases;
  }

  async detectFrameworks(projectDir) {
    const frameworks = [];
    
    try {
      const dependencies = await this.analyzeDependencies(projectDir);
      frameworks.push(...dependencies.webFramework);
      
      // Check for framework-specific files
      if (fs.existsSync(path.join(projectDir, 'angular.json'))) frameworks.push('angular');
      if (fs.existsSync(path.join(projectDir, 'vue.config.js'))) frameworks.push('vue');
      if (fs.existsSync(path.join(projectDir, 'next.config.js'))) frameworks.push('nextjs');
      if (fs.existsSync(path.join(projectDir, 'nuxt.config.js'))) frameworks.push('nuxt');
      if (fs.existsSync(path.join(projectDir, 'manage.py'))) frameworks.push('django');
      if (fs.existsSync(path.join(projectDir, 'artisan'))) frameworks.push('laravel');
    } catch (error) {
      console.error('Error detecting frameworks:', error);
    }

    return frameworks;
  }

  async detectBuildTools(projectDir) {
    const buildTools = [];
    
    try {
      const dependencies = await this.analyzeDependencies(projectDir);
      buildTools.push(...dependencies.buildTools);
      
      // Check for build tool configuration files
      if (fs.existsSync(path.join(projectDir, 'webpack.config.js'))) buildTools.push('webpack');
      if (fs.existsSync(path.join(projectDir, 'vite.config.js'))) buildTools.push('vite');
      if (fs.existsSync(path.join(projectDir, 'rollup.config.js'))) buildTools.push('rollup');
      if (fs.existsSync(path.join(projectDir, 'tsconfig.json'))) buildTools.push('typescript');
      if (fs.existsSync(path.join(projectDir, 'babel.config.js'))) buildTools.push('babel');
    } catch (error) {
      console.error('Error detecting build tools:', error);
    }

    return buildTools;
  }

  async detectTestFramework(projectDir) {
    const testFrameworks = [];
    
    try {
      const dependencies = await this.analyzeDependencies(projectDir);
      testFrameworks.push(...dependencies.testing);
      
      // Check for test configuration files
      if (fs.existsSync(path.join(projectDir, 'jest.config.js'))) testFrameworks.push('jest');
      if (fs.existsSync(path.join(projectDir, 'cypress.json'))) testFrameworks.push('cypress');
      if (fs.existsSync(path.join(projectDir, 'pytest.ini'))) testFrameworks.push('pytest');
    } catch (error) {
      console.error('Error detecting test framework:', error);
    }

    return testFrameworks;
  }

  async detectLinter(projectDir) {
    const linters = [];
    
    try {
      const dependencies = await this.analyzeDependencies(projectDir);
      
      // Check for linter configuration files
      if (fs.existsSync(path.join(projectDir, '.eslintrc.js'))) linters.push('eslint');
      if (fs.existsSync(path.join(projectDir, '.prettierrc'))) linters.push('prettier');
      if (fs.existsSync(path.join(projectDir, 'flake8'))) linters.push('flake8');
      if (fs.existsSync(path.join(projectDir, 'pylintrc'))) linters.push('pylint');
    } catch (error) {
      console.error('Error detecting linter:', error);
    }

    return linters;
  }

  async detectCI(projectDir) {
    const ciTools = [];
    
    try {
      // Check for CI configuration files
      if (fs.existsSync(path.join(projectDir, '.github/workflows'))) ciTools.push('github-actions');
      if (fs.existsSync(path.join(projectDir, '.gitlab-ci.yml'))) ciTools.push('gitlab-ci');
      if (fs.existsSync(path.join(projectDir, '.travis.yml'))) ciTools.push('travis-ci');
      if (fs.existsSync(path.join(projectDir, 'Jenkinsfile'))) ciTools.push('jenkins');
      if (fs.existsSync(path.join(projectDir, 'azure-pipelines.yml'))) ciTools.push('azure-devops');
    } catch (error) {
      console.error('Error detecting CI:', error);
    }

    return ciTools;
  }

  // Helper methods for dependency categorization
  isDatabase(dep) {
    const databases = ['mysql', 'postgres', 'mongodb', 'redis', 'sqlite', 'mariadb', 'oracle', 'sqlserver'];
    return databases.some(db => dep.toLowerCase().includes(db));
  }

  isWebFramework(dep) {
    const frameworks = ['express', 'koa', 'fastify', 'hapi', 'django', 'flask', 'fastapi', 'laravel', 'symfony', 'spring', 'gin', 'echo'];
    return frameworks.some(fw => dep.toLowerCase().includes(fw));
  }

  isTesting(dep) {
    const testing = ['jest', 'mocha', 'chai', 'cypress', 'playwright', 'pytest', 'unittest', 'junit', 'testng'];
    return testing.some(test => dep.toLowerCase().includes(test));
  }

  isBuildTool(dep) {
    const buildTools = ['webpack', 'vite', 'rollup', 'parcel', 'gulp', 'grunt', 'babel', 'typescript'];
    return buildTools.some(tool => dep.toLowerCase().includes(tool));
  }

  isUtility(dep) {
    const utilities = ['lodash', 'moment', 'axios', 'request', 'fs-extra', 'path', 'util'];
    return utilities.some(util => dep.toLowerCase().includes(util));
  }

  validateDockerfile(content) {
    const requiredCommands = ['FROM', 'WORKDIR', 'COPY', 'RUN', 'CMD'];
    const hasRequired = requiredCommands.some(cmd => content.includes(cmd));
    return hasRequired;
  }

  validateYaml(content) {
    try {
      // Basic YAML validation - check for common YAML structure
      const lines = content.split('\n');
      const hasServices = lines.some(line => line.includes('services:'));
      const hasVersion = lines.some(line => line.includes('version:'));
      return hasServices || hasVersion;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new RepositoryAnalyzer();