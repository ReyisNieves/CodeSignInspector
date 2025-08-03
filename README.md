# 🛡️ CodeSignInspector

**Cross-Platform Code Signing Validation & Reporting Tool**

[![Build Status](https://github.com/ReyisNieves/CodeSignInspector/workflows/CI/badge.svg)](https://github.com/ReyisNieves/CodeSignInspector/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![.NET](https://img.shields.io/badge/.NET-8.0-purple.svg)](https://dotnet.microsoft.com/download/dotnet/8.0)
[![Electron](https://img.shields.io/badge/Electron-27.0+-blue.svg)](https://electronjs.org/)

CodeSignInspector is a comprehensive desktop application that helps developers, security engineers, and release teams ensure the integrity and trust of executable binaries across Windows, macOS, and Linux platforms.

## ✨ Features

### 🔍 **Multi-Platform Signature Validation**
- **Windows**: Authenticode signatures (EXE, DLL, SYS, MSI)
- **macOS**: Apple code signatures (APP, PKG) 
- **Linux**: GPG signatures and embedded signatures (ELF, SO)

### 📊 **Comprehensive Reporting**
- Interactive dashboard with real-time statistics
- Export reports in JSON, CSV, and HTML formats
- Certificate chain analysis and validation
- Expiration tracking and alerts

### 🚀 **Advanced Features**
- **Batch Processing**: Scan entire directories recursively
- **Real-time Validation**: Validate individual files instantly
- **Certificate Management**: Whitelist/blacklist certificate authorities
- **Flexible Filtering**: Search and filter results by status, signer, algorithm
- **Background Scanning**: Optional automated monitoring

### 🎨 **Modern User Interface**
- Intuitive Electron-based desktop application
- Cross-platform compatibility
- Dark/light theme support
- Responsive design

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Electron UI   │◄──►│  .NET 8 API     │
│   (Frontend)    │    │   (Backend)     │
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

## 🚀 Quick Start

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- Platform-specific tools:
  - **Windows**: Windows 10/11
  - **macOS**: Xcode Command Line Tools
  - **Linux**: GPG tools

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ReyisNieves/CodeSignInspector.git
   cd CodeSignInspector
   ```

2. **Start the backend**
   ```bash
   cd backend/API
   dotnet restore
   dotnet run
   ```

3. **Start the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Open the application**
   The Electron app will launch automatically, or visit `http://localhost:3000`

## 📖 Documentation

- [📋 Setup Guide](docs/SETUP.md) - Detailed installation and configuration
- [🔌 API Documentation](docs/API.md) - REST API reference
- [💡 Examples](examples/) - Usage examples and scripts

## 🖼️ Screenshots

### Dashboard Overview
![Dashboard](docs/screenshots/dashboard.png)

### File Validation
![File Validation](docs/screenshots/file-validator.png)

### Directory Scanner
![Directory Scanner](docs/screenshots/directory-scanner.png)

### Settings Panel
![Settings](docs/screenshots/settings.png)

## 🛠️ Development

### Backend (.NET 8)
```bash
cd backend/API
dotnet watch run                 # Development with hot reload
dotnet test ../Tests/           # Run tests
dotnet publish -c Release       # Build for production
```

### Frontend (Electron + React)
```bash
cd frontend
npm run dev:renderer            # Start webpack dev server
npm run dev                     # Start Electron in development
npm run build                   # Build for production
npm run dist                    # Create distribution packages
```

### Project Structure
```
CodeSignInspector/
├── backend/                    # .NET 8 Backend
│   ├── API/                   # REST API
│   ├── CodeSignEngine/        # Core validation logic
│   └── Tests/                 # Unit tests
├── frontend/                   # Electron Frontend
│   ├── src/                   # React application
│   ├── public/                # Static assets
│   └── main.js                # Electron main process
├── docs/                       # Documentation
├── examples/                   # Usage examples
└── .github/workflows/          # CI/CD pipelines
```

## 🔒 Security Considerations

- **File Access**: The application requires read access to files being validated
- **Network Access**: OCSP/CRL checking may require internet connectivity
- **Privileges**: Some operations may require elevated privileges
- **Trust Validation**: Always verify the application's own signature before use

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Microsoft for .NET 8 and comprehensive cryptography APIs
- Electron team for the cross-platform framework
- Open source community for various libraries and tools

## 📞 Support

- 📧 **Email**: support@codesigninspector.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/ReyisNieves/CodeSignInspector/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/ReyisNieves/CodeSignInspector/discussions)

## 🗺️ Roadmap

- [ ] **v1.1**: Azure Key Vault integration
- [ ] **v1.2**: GitHub Actions CI/CD integration
- [ ] **v1.3**: SBOM (Software Bill of Materials) support
- [ ] **v1.4**: TUF (The Update Framework) integration
- [ ] **v1.5**: REST API for remote validation
- [ ] **v2.0**: Cloud-based signature validation service

---

**Made with ❤️ by the CodeSignInspector team**
Code Sign Inspector application
