# 🚀 GitHub Repository Analyzer

A comprehensive full-stack application that analyzes GitHub repositories and generates Docker deployment configurations. Features a clean separation between frontend and backend with proper project structure.

## 📁 Project Structure

```
repo_analyser/
├── backend/                    # Node.js Backend API
│   ├── app.js                 # Main Express server
│   ├── package.json           # Backend dependencies
│   ├── .env                   # Environment variables
│   ├── utils/                 # Analysis utilities
│   │   ├── analyzer.js        # Repository analysis logic
│   │   ├── generator.js       # File generation logic
│   │   └── fileChecker.js     # Issue detection logic
│   ├── templates/             # File generation templates
│   │   ├── Dockerfile.template
│   │   ├── docker-compose.template
│   │   └── README.template
│   ├── config/                # Configuration files
│   └── temp/                  # Temporary analysis storage
├── frontend/                   # Static Frontend
│   ├── package.json           # Frontend dependencies
│   └── public/                # Static web files
│       ├── index.html         # Main web interface
│       ├── style.css          # Styling
│       └── favicon.ico        # Website icon
├── package.json               # Root project configuration
├── docker-compose.yml         # Docker configuration
├── Dockerfile                 # Container configuration
└── README.md                  # This file
```

## ✨ Features

### 🔍 **Repository Analysis**
- **Comprehensive Analysis**: Analyzes 15+ different aspects of repositories
- **Project Type Detection**: Automatically identifies Node.js, Python, Java, React, and other project types
- **File Structure Analysis**: Examines project organization and best practices
- **Dependency Detection**: Identifies frameworks, libraries, and build tools

### 🐳 **Docker Integration**
- **Auto-Generation**: Creates Dockerfile and docker-compose.yml when missing
- **Smart Templates**: Generates appropriate configurations based on project type
- **Best Practices**: Includes security, performance, and maintainability recommendations
- **Multi-Platform Support**: Works with various programming languages and frameworks

### 🤖 **AI-Powered Assistant**
- **Interactive Chat**: AI chatbot for Docker and deployment questions
- **Expert Guidance**: Get instant help with configuration and best practices
- **Context-Aware**: Understands your specific project requirements

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Clean Interface**: Simple and intuitive user experience
- **Real-time Updates**: Live progress tracking during analysis
- **Interactive Results**: Organized display of analysis results

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git** (for repository cloning)
- **OpenAI API Key** (for AI chat feature)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Surabhi-M-R/complete-git-analyser.git
   cd complete-git-analyser
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Edit backend/.env file
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run start:backend    # Backend only (port 3000)
   npm run start:frontend   # Frontend only (port 8080)
   ```

5. **Access the application**
   - **Main Application**: http://localhost:3000
   - **Frontend Only**: http://localhost:8080 (if running separately)

## 🔧 Available Scripts

### Root Level Commands
```bash
npm run dev                 # Start both frontend and backend
npm run start:backend       # Start only backend (port 3000)
npm run start:frontend      # Start only frontend (port 8080)
npm run install:all         # Install all dependencies
npm run build               # Build frontend for production
```

### Backend Commands
```bash
cd backend
npm start                   # Start backend server
npm run dev                 # Start with nodemon (auto-restart)
```

### Frontend Commands
```bash
cd frontend
npm start                   # Start frontend server
npm run dev                 # Start development server
```

## 🌐 API Endpoints

### Repository Analysis
```http
POST /api/analyze
Content-Type: application/json

{
  "repoUrl": "https://github.com/username/repository"
}
```

### AI Chat
```http
POST /api/chat
Content-Type: application/json

{
  "message": "How do I optimize my Dockerfile?"
}
```

### Health Check
```http
GET /api/test
```

### File Downloads
```http
GET /download/:analysisId/:fileType
GET /download/:analysisId/all
```

## 🔍 Analysis Features

### **Project Detection**
- Node.js (package.json, Express, React, Vue, Angular)
- Python (requirements.txt, Django, Flask, FastAPI)
- Java (pom.xml, Maven, Gradle)
- PHP (composer.json, Laravel, Symfony)
- Go (go.mod, Gin, Echo)
- Ruby (Gemfile, Rails, Sinatra)

### **File Analysis**
- Dockerfile validation and optimization
- docker-compose.yml configuration
- README.md completeness
- .gitignore best practices
- Environment file security

### **Issue Detection**
- Missing configuration files
- Security vulnerabilities
- Performance optimizations
- Best practice violations
- Documentation gaps

## 🛠️ Technologies Used

### **Backend**
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Socket.io** - Real-time communication
- **simple-git** - Git operations
- **OpenAI API** - AI chat functionality
- **fs-extra** - Enhanced file operations
- **archiver** - ZIP file creation

### **Frontend**
- **HTML5** - Markup language
- **CSS3** - Styling and animations
- **JavaScript** - Client-side functionality
- **Socket.io Client** - Real-time updates

## 🔒 Security Features

- **Environment Variable Protection**: Detects and warns about exposed secrets
- **File Size Monitoring**: Identifies large files that shouldn't be in version control
- **Dependency Scanning**: Checks for known vulnerabilities
- **Best Practice Enforcement**: Validates security configurations

## 🚀 Deployment

### **Docker Deployment**
```bash
# Build and run with Docker
docker-compose up --build
```

### **Production Build**
```bash
# Install dependencies
npm run install:all

# Start production server
npm run start:backend
```

## 🔧 Configuration

### **Environment Variables** (`backend/.env`)
```env
# OpenAI API Key for AI chat functionality
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:8080

# File Upload Configuration
MAX_FILE_SIZE=50mb
UPLOAD_DIR=./temp

# Git Configuration
GIT_TIMEOUT=30000
GIT_DEPTH=1
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing the AI chat functionality
- **GitHub** for repository access and metadata
- **Docker** for containerization best practices
- **Node.js** and **Express** communities for excellent tooling

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Surabhi-M-R/complete-git-analyser/issues) page
2. Create a new issue with detailed information
3. Use the AI chat assistant for quick help

---

**Made with ❤️ by [Surabhi M R](https://github.com/Surabhi-M-R)**

*Transform your GitHub repositories into production-ready applications with just a few clicks!* 🚀