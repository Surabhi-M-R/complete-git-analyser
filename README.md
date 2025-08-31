# GitHub Repository Analyzer

A web application that analyzes GitHub repositories for Docker and cloud deployment readiness. It checks for missing files, generates Docker configurations, and provides recommendations for best practices.

## Features

- **Repository Analysis**: Analyzes GitHub repositories for project structure and configuration files
- **Docker Support**: Generates Dockerfile and docker-compose.yml files if missing
- **Issue Detection**: Identifies potential issues and security concerns
- **Best Practices**: Provides recommendations for deployment and development
- **File Generation**: Automatically generates missing configuration files
- **AI Chat Assistant**: Interactive AI chatbot for Docker and deployment questions

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git (for cloning repositories)

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `env.example` to `.env`
   - Add your OpenAI API key to the `.env` file:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     ```
   - Get your API key from: https://platform.openai.com/api-keys

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Enter a GitHub repository URL (e.g., `https://github.com/username/repository.git`)

4. Click "Analyze Repository" to get a comprehensive analysis

### AI Chat Assistant

The application includes an AI chat assistant that can help you with:
- Docker configuration questions
- Deployment best practices
- Repository analysis explanations
- General development questions

To use the chat:
1. Scroll down to the "🤖 AI Assistant" section
2. Type your question in the chat input
3. Press Enter or click "Send"
4. Get instant AI-powered responses

**Note**: Make sure you have set up your OpenAI API key in the `.env` file for the chat feature to work.

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   - The application will automatically try the next available port
   - Check the console output for the actual port number

2. **Blank screen**
   - Make sure you're accessing the correct URL (check the port number)
   - Open browser developer tools (F12) to check for JavaScript errors
   - Ensure all files are properly loaded

3. **Favicon 404 error**
   - This is now fixed with the favicon middleware
   - The error should no longer appear in the console

4. **WebSocket connection errors**
   - If you see WebSocket errors, make sure you're not using Live Server
   - Access the application directly at `http://localhost:3000`

### File Structure

```
repo_analyser/
├── app.js              # Main Express application
├── package.json        # Dependencies and scripts
├── public/             # Static files (CSS, favicon)
│   ├── style.css       # Application styles
│   └── favicon.ico     # Favicon file
├── views/              # EJS templates
│   └── index.ejs       # Main page template
├── utils/              # Utility modules
│   ├── analyzer.js     # Repository analysis logic
│   ├── generator.js    # File generation logic
│   └── fileChecker.js  # Issue detection logic
└── temp/               # Temporary files (created automatically)
```

## API Endpoints

- `GET /` - Main application page
- `POST /analyze` - Analyze a repository
  - Body: `{ "repoUrl": "https://github.com/username/repo.git" }`
- `POST /chat` - AI chat endpoint
  - Body: `{ "message": "Your question here" }`

## Supported Project Types

- Node.js (package.json)
- Python (requirements.txt)
- Java (pom.xml)
- PHP (composer.json)
- Go (go.mod)
- Ruby (Gemfile)
- Clojure (project.clj)

## Generated Files

The application can generate:
- **Dockerfile**: Container configuration
- **docker-compose.yml**: Multi-container setup
- **README.md**: Project documentation

## Security Features

- Detects sensitive files (.env, .key, etc.)
- Identifies large files that shouldn't be in version control
- Checks for proper .gitignore configuration
- Validates environment variable handling

## Development

To run in development mode with auto-restart:
```bash
npm run dev
```

## Dependencies

- **express**: Web framework
- **ejs**: Template engine
- **simple-git**: Git operations
- **fs-extra**: Enhanced file system operations
- **axios**: HTTP client
- **highlight.js**: Code syntax highlighting
- **openai**: OpenAI API client
- **dotenv**: Environment variable management

## License

MIT License
