# Node.js Setup Guide

## 🚀 Quick Setup

This project requires **Node.js version 20.19.0** to match the production server environment.

### Automatic Setup

Run the setup script to automatically configure the correct Node.js version:

```bash
./setup-node.sh
```

### Manual Setup

If you prefer to set up manually:

1. **Install NVM** (if not already installed):
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   ```

2. **Load NVM**:
   ```bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   ```

3. **Install Node.js 20.19.0**:
   ```bash
   nvm install 20.19.0
   nvm use 20.19.0
   nvm alias default 20.19.0
   ```

4. **Verify installation**:
   ```bash
   node --version  # Should show v20.19.0
   npm --version   # Should show 10.8.2
   ```

## 📋 Available Commands

### Development
```bash
npm run dev        # Start development server with hot reload
npm run build      # Build the TypeScript project
npm run type-start # Start with ts-node (alternative)
```

### Production
```bash
npm start          # Start production server
```

## 🔧 Version Management

### Using .nvmrc
The project includes a `.nvmrc` file that automatically sets the correct Node.js version:

```bash
nvm use            # Automatically uses version from .nvmrc
```

### Switching Versions
```bash
nvm list           # List installed versions
nvm use 20.19.0    # Switch to specific version
nvm alias default 20.19.0  # Set as default
```

## 🐛 Troubleshooting

### Version Mismatch Issues
If you encounter version-related issues:

1. **Check current version**:
   ```bash
   node --version
   ```

2. **Switch to correct version**:
   ```bash
   nvm use 20.19.0
   ```

3. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Public Endpoints Not Loading
If public endpoints load indefinitely:

1. **Verify Node.js version** matches server (20.19.0)
2. **Check Redis connection** is working
3. **Verify MongoDB connection** is active
4. **Check server logs** for error messages

## 📊 Current Status

- ✅ **Node.js Version**: 20.19.0 (matches production server)
- ✅ **NPM Version**: 10.8.2
- ✅ **NVM**: Installed and configured
- ✅ **Public Endpoints**: Working correctly
- ✅ **Redis Caching**: Functional
- ✅ **MongoDB Connection**: Active

## 🎯 Next Steps

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Test public endpoints**:
   ```bash
   curl http://localhost:3000/events/public?page=1&limit=5
   ```

3. **Monitor server logs** for any issues

---

**Note**: Always use Node.js 20.19.0 for this project to ensure compatibility with the production server environment.
