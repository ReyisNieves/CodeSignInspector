# 🚀 Quick Start Guide

## One-Command Startup

### macOS/Linux
```bash
# Clone and start the complete application
git clone https://github.com/ReyisNieves/CodeSignInspector.git
cd CodeSignInspector
./scripts/start.sh
```

### Windows
```cmd
# Clone and start the complete application
git clone https://github.com/ReyisNieves/CodeSignInspector.git
cd CodeSignInspector
./scripts/start.bat
```

## Development Mode

For development with hot reload:

```bash
# Start backend and frontend with hot reload
./scripts/dev.sh
```

## Available Scripts

### Root Level Scripts
- `npm start` - Start the complete application (backend + frontend)
- `npm run dev` - Development mode with hot reload
- `npm run clean` - Clean all build artifacts and stop processes
- `npm run build:all` - Build both backend and frontend
- `npm run setup` - Initial setup (install dependencies + build)

### VS Code Tasks
Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) and search for:
- **🚀 Start Full Application** - Complete application startup
- **🔧 Development Mode** - Development with hot reload
- **Build Backend** - Build .NET API only
- **Build Frontend** - Build React app only

## What Happens During Startup

1. **🔍 System Check** - Verifies .NET SDK and Node.js installation
2. **🧹 Cleanup** - Stops any existing processes on ports 5000/3000
3. **🔨 Backend Build** - Compiles .NET API project
4. **📦 Frontend Dependencies** - Installs npm packages
5. **🏗️ Frontend Build** - Compiles React/TypeScript application
6. **🚀 Backend Start** - Launches API server on http://localhost:5000
7. **⏳ Health Check** - Waits for backend to be ready
8. **🖥️ Frontend Start** - Launches Electron desktop application

## Troubleshooting

### Port Conflicts
If ports 5000 or 3000 are in use:
```bash
./scripts/clean.sh  # Automatically cleans up processes
```

### Backend Connection Issues
The loading screen will show backend connection status. If the backend fails to start:
1. Check .NET SDK installation: `dotnet --version`
2. Check for port conflicts
3. View backend logs in `tmp/backend.log`

### Frontend Build Issues
If npm build fails:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Electron UI   │◄──►│  .NET 8 API     │
│   (Frontend)    │    │   (Backend)     │
│   Port: 3000    │    │   Port: 5000    │
└─────────────────┘    └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │ Signature Engine│
         │              │                 │
         └──────────────┤ • Windows       │
                        │ • macOS         │
                        │ • Linux         │
                        └─────────────────┘
```

## Next Steps

1. **Validate a File** - Use the File Validator tab
2. **Scan a Directory** - Use the Directory Scanner for batch processing
3. **Generate Reports** - Export results in JSON, CSV, or HTML
4. **Configure Settings** - Customize validation parameters

For detailed documentation, see [docs/SETUP.md](docs/SETUP.md) and [docs/API.md](docs/API.md).
