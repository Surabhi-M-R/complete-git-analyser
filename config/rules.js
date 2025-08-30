module.exports = {
  projectTypes: {
    nodejs: {
      requiredFiles: ['package.json'],
      recommendedFiles: ['.gitignore', 'README.md', 'Dockerfile', '.env.example'],
      ignorePatterns: ['node_modules/', 'dist/', 'build/', 'coverage/', '*.log']
    },
    python: {
      requiredFiles: ['requirements.txt'],
      recommendedFiles: ['.gitignore', 'README.md', 'Dockerfile', '.env.example'],
      ignorePatterns: ['__pycache__/', '*.pyc', 'env/', 'venv/']
    },
    java: {
      requiredFiles: ['pom.xml'],
      recommendedFiles: ['.gitignore', 'README.md', 'Dockerfile', '.env.example'],
      ignorePatterns: ['target/', '*.jar', '*.war']
    }
  },
  gitignore: {
    common: [
      '.DS_Store',
      'Thumbs.db',
      '.env',
      'node_modules/',
      'dist/',
      'build/',
      '*.log',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*'
    ],
    nodejs: [
      'package-lock.json',
      'yarn.lock'
    ],
    python: [
      '__pycache__/',
      '*.py[cod]',
      '*$py.class',
      '*.so',
      '.Python',
      'env/',
      'venv/',
      'ENV/'
    ],
    java: [
      'target/',
      '*.jar',
      '*.war',
      '*.ear'
    ]
  }
};