const fs = require('fs-extra');
const path = require('path');

class FileGenerator {
  async generateFiles(projectDir, analysis) {
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
    let dockerfileContent = '';
    
    switch (analysis.projectType) {
      case 'nodejs':
        dockerfileContent = `# Generated Dockerfile for Node.js application
FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port
EXPOSE 3000

# Define command to run application
CMD [ "npm", "start" ]
`;
        break;

      case 'python':
        dockerfileContent = `# Generated Dockerfile for Python application
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["python", "app.py"]
`;
        break;

      case 'java':
        dockerfileContent = `# Generated Dockerfile for Java application
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
`;
        break;

      default:
        dockerfileContent = `# Generated Dockerfile
FROM ubuntu:latest

# Set working directory
WORKDIR /app

# Copy application code
COPY . .

# Install dependencies (update based on your application)
# RUN apt-get update && apt-get install -y \\

# Expose port (update based on your application)
EXPOSE 3000

# Command to run the application (update based on your application)
CMD ["echo", "Update this Dockerfile for your specific application"]
`;
    }

    return dockerfileContent;
  }

  generateDockerCompose(analysis) {
    let serviceName = 'app';
    let port = 3000;

    if (analysis.package.exists && analysis.package.path === 'package.json') {
      serviceName = analysis.package.content.name || 'app';
    }

    // Adjust port based on project type
    switch (analysis.projectType) {
      case 'nodejs':
        port = 3000;
        break;
      case 'python':
        port = 8000;
        break;
      case 'java':
        port = 8080;
        break;
      default:
        port = 3000;
    }

    return `version: '3.8'
services:
  ${serviceName}:
    build: .
    ports:
      - "${port}:${port}"
    environment:
      - NODE_ENV=production
    volumes:
      - .:/app
      - /app/node_modules

  # Uncomment to add a database service
  # db:
  #   image: postgres:13
  #   environment:
  #     - POSTGRES_DB=mydb
  #     - POSTGRES_USER=user
  #     - POSTGRES_PASSWORD=password
  #   volumes:
  #     - postgres_data:/var/lib/postgresql/data

# volumes:
#   postgres_data:
`;
  }

  generateReadme(analysis, projectDir) {
    const projectName = analysis.package.exists && analysis.package.path === 'package.json' 
      ? analysis.package.content.name 
      : 'Your Project';
    
    const projectDescription = analysis.package.exists && analysis.package.path === 'package.json' 
      ? analysis.package.content.description 
      : 'Description of your project';

    return `# ${projectName}

${projectDescription}

## Docker Setup

This project includes Docker configuration for easy deployment.

### Prerequisites

- Docker
- Docker Compose

### Building and Running

1. Build the Docker image:
   \`\`\`bash
   docker build -t ${projectName} .
   \`\`\`

2. Run the container:
   \`\`\`bash
   docker run -p 3000:3000 ${projectName}
   \`\`\`

### Using Docker Compose

1. Start the application:
   \`\`\`bash
   docker-compose up
   \`\`\`

2. Run in detached mode:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

### Development

For development with hot-reload, you may want to mount your source code as a volume:

\`\`\`bash
docker run -p 3000:3000 -v $(pwd):/app ${projectName}
\`\`\`

## Environment Variables

Create a \`.env\` file in the root directory with the following variables:

\`\`\`
NODE_ENV=development
PORT=3000
# Add other environment variables your application needs
\`\`\`

## Deployment

### To Docker Hub

1. Build the image:
   \`\`\`bash
   docker build -t yourusername/${projectName} .
   \`\`\`

2. Push to Docker Hub:
   \`\`\`bash
   docker push yourusername/${projectName}
   \`\`\`

### To Cloud Platforms

This application can be deployed to various cloud platforms that support Docker:

- AWS ECS/EKS
- Google Cloud Run
- Azure Container Instances
- Heroku Container Registry
- DigitalOcean App Platform

Check the respective platform documentation for deployment instructions.
`;
  }
}

module.exports = new FileGenerator();