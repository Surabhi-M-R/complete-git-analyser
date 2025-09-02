const fs = require('fs-extra');
const path = require('path');

class FileGenerator {
  async generateFiles(projectDir, analysis) {
    console.log('Generating files based on analysis:', {
      projectType: analysis.projectType,
      frameworks: analysis.frameworks,
      dependencies: analysis.dependencies,
      entryPoints: analysis.entryPoints,
      ports: analysis.ports
    });

    const generated = {
      dockerfile: null,
      compose: null,
      readme: null
    };

    // Generate Dockerfile if it doesn't exist
    if (!analysis.dockerfile.exists) {
      generated.dockerfile = this.generateDockerfile(analysis);
    }

    // Generate docker-compose.yml if it doesn't exist
    if (!analysis.compose.exists) {
      generated.compose = this.generateDockerCompose(analysis);
    }

    // Generate README.md if it doesn't exist
    if (!analysis.readme.exists) {
      generated.readme = this.generateReadme(analysis, projectDir);
    }

    return generated;
  }

  generateDockerfile(analysis) {
    console.log('Generating Dockerfile for:', analysis.projectType);
    
    const projectType = analysis.projectType;
    const frameworks = analysis.frameworks || [];
    const entryPoints = analysis.entryPoints || [];
    const ports = analysis.ports || [3000];
    const dependencies = analysis.dependencies || {};
    
    let dockerfileContent = '';
    
    switch (projectType) {
      case 'nodejs':
      case 'react':
      case 'vue':
      case 'angular':
      case 'nextjs':
      case 'nuxt':
      case 'express':
        dockerfileContent = this.generateNodeJSDockerfile(analysis, frameworks, entryPoints, ports, dependencies);
        break;
        
      case 'python':
      case 'django':
      case 'flask':
        dockerfileContent = this.generatePythonDockerfile(analysis, frameworks, entryPoints, ports);
        break;
        
      case 'java':
      case 'spring':
        dockerfileContent = this.generateJavaDockerfile(analysis, frameworks, entryPoints, ports);
        break;
        
      case 'php':
      case 'laravel':
        dockerfileContent = this.generatePHPDockerfile(analysis, frameworks, entryPoints, ports);
        break;
        
      case 'go':
        dockerfileContent = this.generateGoDockerfile(analysis, entryPoints, ports);
        break;
        
      case 'ruby':
        dockerfileContent = this.generateRubyDockerfile(analysis, entryPoints, ports);
        break;
        
      case 'rust':
        dockerfileContent = this.generateRustDockerfile(analysis, entryPoints, ports);
        break;
        
      case 'dotnet':
        dockerfileContent = this.generateDotNetDockerfile(analysis, entryPoints, ports);
        break;
        
      case 'flutter':
        dockerfileContent = this.generateFlutterDockerfile(analysis, entryPoints, ports);
        break;
        
      default:
        dockerfileContent = this.generateGenericDockerfile(analysis, entryPoints, ports);
    }

    return dockerfileContent;
  }

  generateNodeJSDockerfile(analysis, frameworks, entryPoints, ports, dependencies) {
    const port = ports[0] || 3000;
    const entryPoint = entryPoints.find(ep => ['app.js', 'server.js', 'index.js', 'main.js'].includes(ep)) || 'app.js';
    const hasBuildStep = frameworks.includes('react') || frameworks.includes('vue') || frameworks.includes('angular') || frameworks.includes('nextjs');
    const hasDevDependencies = analysis.package.hasDevDependencies;
    
    let dockerfile = `# Generated Dockerfile for ${analysis.projectType} application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application if needed
${hasBuildStep ? `
# Build step for ${frameworks.join(', ')} application
RUN npm run build
` : ''}

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=${port}

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
${hasBuildStep ? `
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
` : `
COPY --from=deps /app/node_modules ./node_modules
COPY . .
`}

# Set correct permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:${port}/health || exit 1

# Start the application
CMD ["node", "${entryPoint}"]
`;

    return dockerfile;
  }

  generatePythonDockerfile(analysis, frameworks, entryPoints, ports) {
    const port = ports[0] || 8000;
    const entryPoint = entryPoints.find(ep => ['app.py', 'main.py', 'server.py', 'manage.py'].includes(ep)) || 'app.py';
    const isDjango = frameworks.includes('django');
    const isFlask = frameworks.includes('flask');
    
    let dockerfile = `# Generated Dockerfile for ${analysis.projectType} application
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=${port}

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \\
    && apt-get install -y --no-install-recommends \\
        gcc \\
        postgresql-client \\
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

${isDjango ? `
# Django specific setup
RUN python manage.py collectstatic --noinput
` : ''}

# Create a non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:${port}/health || exit 1

# Start the application
${isDjango ? `
CMD ["gunicorn", "--bind", "0.0.0.0:${port}", "--workers", "4", "wsgi:application"]
` : `
CMD ["python", "${entryPoint}"]
`}
`;

    return dockerfile;
  }

  generateJavaDockerfile(analysis, frameworks, entryPoints, ports) {
    const port = ports[0] || 8080;
    const isSpring = frameworks.includes('spring');
    
    let dockerfile = `# Generated Dockerfile for ${analysis.projectType} application
FROM maven:3.8.4-openjdk-17 AS build

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# Production stage
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy the built jar
COPY --from=build /app/target/*.jar app.jar

# Create a non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:${port}/actuator/health || exit 1

# Start the application
CMD ["java", "-jar", "app.jar"]
`;

    return dockerfile;
  }

  generatePHPDockerfile(analysis, frameworks, entryPoints, ports) {
    const port = ports[0] || 8000;
    const isLaravel = frameworks.includes('laravel');
    
    let dockerfile = `# Generated Dockerfile for ${analysis.projectType} application
FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    git \\
    curl \\
    libpng-dev \\
    libonig-dev \\
    libxml2-dev \\
    zip \\
    unzip \\
    libzip-dev

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

${isLaravel ? `
# Laravel specific setup
RUN composer install --optimize-autoloader --no-dev
RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache
RUN chown -R www-data:www-data storage bootstrap/cache
` : `
# Install dependencies
RUN composer install --optimize-autoloader --no-dev
`}

# Configure Apache
RUN a2enmod rewrite

# Expose port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:${port}/health || exit 1

# Start Apache
CMD ["apache2-foreground"]
`;

    return dockerfile;
  }

  generateGoDockerfile(analysis, entryPoints, ports) {
    const port = ports[0] || 8080;
    const entryPoint = entryPoints.find(ep => ['main.go', 'server.go'].includes(ep)) || 'main.go';
    
    return `# Generated Dockerfile for ${analysis.projectType} application
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Production stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary
COPY --from=builder /app/main .

# Expose port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:${port}/health || exit 1

# Run the binary
CMD ["./main"]
`;
  }

  generateRubyDockerfile(analysis, entryPoints, ports) {
    const port = ports[0] || 3000;
    
    return `# Generated Dockerfile for ${analysis.projectType} application
FROM ruby:3.2-alpine

# Install system dependencies
RUN apk add --no-cache \\
    build-base \\
    postgresql-dev \\
    tzdata

WORKDIR /app

# Copy Gemfile
COPY Gemfile Gemfile.lock ./

# Install gems
RUN bundle install

# Copy application
COPY . .

# Create a non-root user
RUN adduser -D appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:${port}/health || exit 1

# Start the application
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "${port}"]
`;
  }

  generateRustDockerfile(analysis, entryPoints, ports) {
    const port = ports[0] || 8080;
    
    return `# Generated Dockerfile for ${analysis.projectType} application
FROM rust:1.70-alpine AS builder

WORKDIR /app

# Copy Cargo files
COPY Cargo.toml Cargo.lock ./

# Create a dummy main.rs to build dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release

# Copy source code
COPY src ./src

# Build the application
RUN cargo build --release

# Production stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary
COPY --from=builder /app/target/release/* /root/

# Expose port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:${port}/health || exit 1

# Run the binary
CMD ["./app"]
`;
  }

  generateDotNetDockerfile(analysis, entryPoints, ports) {
    const port = ports[0] || 5000;
    
    return `# Generated Dockerfile for ${analysis.projectType} application
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build

WORKDIR /src

# Copy csproj and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY . ./
RUN dotnet publish -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:7.0

WORKDIR /app

# Copy published app
COPY --from=build /app/publish .

# Expose port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:${port}/health || exit 1

# Start the application
ENTRYPOINT ["dotnet", "app.dll"]
`;
  }

  generateFlutterDockerfile(analysis, entryPoints, ports) {
    const port = ports[0] || 3000;
    
    return `# Generated Dockerfile for ${analysis.projectType} application
FROM ubuntu:20.04

# Install dependencies
RUN apt-get update && apt-get install -y \\
    curl \\
    git \\
    unzip \\
    xz-utils \\
    zip \\
    libglu1-mesa \\
    openjdk-11-jdk

# Set up Flutter
ENV FLUTTER_HOME="/flutter"
ENV PATH="$FLUTTER_HOME/bin:$PATH"

RUN git clone https://github.com/flutter/flutter.git \$FLUTTER_HOME
RUN flutter doctor
RUN flutter config --no-analytics

WORKDIR /app

# Copy pubspec files
COPY pubspec.yaml pubspec.lock ./

# Get dependencies
RUN flutter pub get

# Copy source code
COPY . .

# Build the app
RUN flutter build web

# Install nginx
RUN apt-get install -y nginx

# Copy built app to nginx
RUN cp -r build/web/* /var/www/html/

# Expose port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:${port}/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
`;
  }

  generateGenericDockerfile(analysis, entryPoints, ports) {
    const port = ports[0] || 3000;
    
    return `# Generated Dockerfile for ${analysis.projectType} application
FROM ubuntu:20.04

# Install basic dependencies
RUN apt-get update && apt-get install -y \\
    curl \\
    git \\
    build-essential \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy application files
COPY . .

# Expose port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:${port}/health || exit 1

# Start the application (update this based on your specific application)
CMD ["echo", "Please update this Dockerfile for your specific application"]
`;
  }

  generateDockerCompose(analysis) {
    const projectType = analysis.projectType;
    const frameworks = analysis.frameworks || [];
    const ports = analysis.ports || [3000];
    const dependencies = analysis.dependencies || {};
    const databases = analysis.database || [];
    
    const port = ports[0];
    const serviceName = this.getServiceName(analysis);
    const hasDatabase = databases.length > 0;
    
    let composeContent = `version: '3.8'

services:
  ${serviceName}:
    build: .
    ports:
      - "${port}:${port}"
    environment:
      - NODE_ENV=production
      - PORT=${port}
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:${port}/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

${hasDatabase ? this.generateDatabaseService(databases) : ''}

networks:
  default:
    driver: bridge

volumes:
${hasDatabase ? '  postgres_data:' : ''}
`;

    return composeContent;
  }

  getServiceName(analysis) {
    if (analysis.package.exists && analysis.package.content.name) {
      return analysis.package.content.name.replace(/[^a-zA-Z0-9]/g, '_');
    }
    return 'app';
  }

  generateDatabaseService(databases) {
    const db = databases[0] || 'postgres';
    
    switch (db) {
      case 'mysql':
        return `
  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=app
      - MYSQL_USER=appuser
      - MYSQL_PASSWORD=apppassword
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s`;
        
      case 'mongodb':
        return `
  db:
    image: mongo:6.0
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
      - MONGO_INITDB_DATABASE=app
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s`;
        
      case 'redis':
        return `
  db:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s`;
        
      default:
        return `
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=app
      - POSTGRES_USER=appuser
      - POSTGRES_PASSWORD=apppassword
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d app"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s`;
    }
  }

  generateReadme(analysis, projectDir) {
    const projectName = analysis.package.exists && analysis.package.content.name 
      ? analysis.package.content.name 
      : 'Your Project';
    
    const projectDescription = analysis.package.exists && analysis.package.content.description 
      ? analysis.package.content.description 
      : 'Description of your project';

    const projectType = analysis.projectType;
    const frameworks = analysis.frameworks || [];
    const ports = analysis.ports || [3000];
    const dependencies = analysis.dependencies || {};
    const databases = analysis.database || [];
    
    const port = ports[0];
    const serviceName = this.getServiceName(analysis);

    return `# ${projectName}

${projectDescription}

## 🚀 Quick Start

This project includes Docker configuration for easy deployment and development.

### Prerequisites

- Docker
- Docker Compose

### 🐳 Docker Setup

#### Building and Running

1. **Build the Docker image:**
   \`\`\`bash
   docker build -t ${serviceName} .
   \`\`\`

2. **Run the container:**
   \`\`\`bash
   docker run -p ${port}:${port} ${serviceName}
   \`\`\`

#### Using Docker Compose

1. **Start all services:**
   \`\`\`bash
   docker-compose up
   \`\`\`

2. **Run in detached mode:**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

3. **Stop services:**
   \`\`\`bash
   docker-compose down
   \`\`\`

### 🔧 Development

For development with hot-reload, you may want to mount your source code as a volume:

\`\`\`bash
docker run -p ${port}:${port} -v $(pwd):/app ${serviceName}
\`\`\`

### 🌍 Environment Variables

Create a \`.env\` file in the root directory with the following variables:

\`\`\`
NODE_ENV=development
PORT=${port}
${databases.length > 0 ? `
# Database Configuration
DATABASE_URL=postgresql://appuser:apppassword@db:5432/app
` : ''}
# Add other environment variables your application needs
\`\`\`

### 📊 Project Information

- **Project Type:** ${projectType}
- **Frameworks:** ${frameworks.join(', ') || 'None detected'}
- **Port:** ${port}
- **Database:** ${databases.join(', ') || 'None detected'}

### 🛠️ Available Scripts

${analysis.package.hasScripts ? `
\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
\`\`\`
` : 'No scripts detected in package.json'}

### 🧪 Testing

${dependencies.testing.length > 0 ? `
This project uses the following testing frameworks:
${dependencies.testing.map(test => `- ${test}`).join('\n')}
` : 'No testing frameworks detected'}

### 📦 Dependencies

${dependencies.webFramework.length > 0 ? `
**Web Frameworks:**
${dependencies.webFramework.map(fw => `- ${fw}`).join('\n')}
` : ''}

${dependencies.database.length > 0 ? `
**Databases:**
${dependencies.database.map(db => `- ${db}`).join('\n')}
` : ''}

${dependencies.buildTools.length > 0 ? `
**Build Tools:**
${dependencies.buildTools.map(tool => `- ${tool}`).join('\n')}
` : ''}

### 🚀 Deployment

#### To Docker Hub

1. **Build the image:**
   \`\`\`bash
   docker build -t yourusername/${serviceName} .
   \`\`\`

2. **Push to Docker Hub:**
   \`\`\`bash
   docker push yourusername/${serviceName}
   \`\`\`

#### To Cloud Platforms

This application can be deployed to various cloud platforms that support Docker:

- **AWS ECS/EKS**
- **Google Cloud Run**
- **Azure Container Instances**
- **Heroku Container Registry**
- **DigitalOcean App Platform**
- **Vercel (for frontend applications)**
- **Netlify (for static sites)**

Check the respective platform documentation for deployment instructions.

### 🔍 Health Checks

The application includes health check endpoints:

- **Health Check:** \`http://localhost:${port}/health\`
- **Readiness Check:** \`http://localhost:${port}/ready\`

### 📝 Logs

To view application logs:

\`\`\`bash
# Docker logs
docker logs <container_id>

# Docker Compose logs
docker-compose logs -f
\`\`\`

### 🐛 Troubleshooting

1. **Port already in use:**
   - Change the port in docker-compose.yml
   - Kill processes using the port: \`lsof -ti:${port} | xargs kill -9\`

2. **Database connection issues:**
   - Ensure the database service is running: \`docker-compose ps\`
   - Check database logs: \`docker-compose logs db\`

3. **Build failures:**
   - Clear Docker cache: \`docker system prune -a\`
   - Rebuild without cache: \`docker build --no-cache .\`

### 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Generated by Repository Analyzer** - Docker configuration automatically generated for ${projectType} project.
`;
  }
}

module.exports = new FileGenerator();