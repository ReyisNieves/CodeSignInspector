# CodeSign Inspector Setup Guide

## Prerequisites

### Backend (.NET 8)
- .NET 8 SDK or later
- Windows: Windows 10/11 for Authenticode validation
- macOS: Xcode Command Line Tools for codesign
- Linux: GPG tools for signature validation

### Frontend (Electron)
- Node.js 18 or later
- npm or yarn package manager

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/ReyisNieves/CodeSignInspector.git
cd CodeSignInspector
```

### 2. Setup Backend

#### Install .NET 8 SDK
Download from: https://dotnet.microsoft.com/download/dotnet/8.0

#### Build and Run Backend
```bash
cd backend/API
dotnet restore
dotnet build
dotnet run
```

The API will be available at `http://localhost:5000`

### 3. Setup Frontend

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Development Mode
```bash
# Terminal 1: Start the backend
cd backend/API
dotnet run

# Terminal 2: Start the frontend
cd frontend
npm run dev:renderer

# Terminal 3: Start Electron
cd frontend
npm run dev
```

#### Production Build
```bash
cd frontend
npm run build
npm run dist
```

## Platform-Specific Notes

### Windows
- Requires Windows Trust API for Authenticode validation
- Administrator privileges may be needed for some signature validations
- Supports EXE, DLL, SYS, MSI files

### macOS
- Requires Xcode Command Line Tools: `xcode-select --install`
- Uses `codesign` command for validation
- Supports APP, PKG files

### Linux
- Requires GPG tools: `sudo apt-get install gnupg` (Ubuntu/Debian)
- Limited signature support (GPG signatures, some embedded signatures)
- Supports ELF, SO files with detached signatures

## Configuration

### Backend Configuration
Edit `backend/API/appsettings.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  },
  "AllowedHosts": "*",
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://localhost:5000"
      }
    }
  }
}
```

### Frontend Configuration
Settings are managed through the UI Settings tab or by editing local storage.

## Troubleshooting

### Backend Issues
1. **Port conflicts**: Change the port in `Program.cs` or `appsettings.json`
2. **Permission errors**: Run with appropriate permissions for file access
3. **Missing dependencies**: Ensure all NuGet packages are restored

### Frontend Issues
1. **Node version**: Ensure Node.js 18+ is installed
2. **Electron build errors**: Clear node_modules and reinstall
3. **API connection**: Verify backend is running and accessible

### Platform-Specific Issues

#### Windows
- **WinTrust errors**: Ensure running on Windows with appropriate permissions
- **Certificate errors**: Check Windows certificate store

#### macOS
- **codesign not found**: Install Xcode Command Line Tools
- **Permission errors**: Grant necessary file system permissions

#### Linux
- **GPG errors**: Install GPG tools and ensure proper configuration
- **Missing signatures**: Linux executables often don't have embedded signatures

## Building for Distribution

### Backend
```bash
cd backend/API
dotnet publish -c Release -r win-x64 --self-contained
dotnet publish -c Release -r osx-x64 --self-contained
dotnet publish -c Release -r linux-x64 --self-contained
```

### Frontend
```bash
cd frontend
npm run build
npm run dist
```

This will create installers for all platforms in the `frontend/dist` directory.

## API Documentation

Once running, visit `http://localhost:5000/swagger` for interactive API documentation.

## Support

For issues, please check:
1. This setup guide
2. GitHub Issues
3. Platform-specific documentation
