# 🚀 Quick Start - Build & Release

## ⚡ 3-Step Process

### 1️⃣ Prepare Icons (5 minutes)

You need to create these icon files:

- `assets/icon.ico` ← Windows icon
- `assets/icon.icns` ← macOS icon
- `assets/icon.png` ← Linux icon (ensure it's 512x512+)

**Quick fix**: Use online converters:

- [Convert SVG to ICO](https://convertio.co/svg-ico/)
- [Convert SVG to ICNS](https://cloudconvert.com/svg-to-icns)

### 2️⃣ Build for All Platforms (10-15 minutes)

```bash
# Option A: Automated script (recommended)
node scripts/build-all-platforms.js

# Option B: Windows batch file
build-all.bat

# Option C: Manual commands
npm run build:win:prod
npm run build:mac:prod
npm run build:linux:prod
```

### 3️⃣ Release on GitHub (5 minutes)

```bash
# Get release guidance
node scripts/release-github.js
```

## 📱 What You'll Get

- **Windows**: Installer (.msi) + Portable (.exe)
- **macOS**: DMG file for installation
- **Linux**: AppImage + DEB package

## 🔧 If Something Goes Wrong

1. **Check icons exist**: `node scripts/prepare-icons.js`
2. **Verify dependencies**: `npm install`
3. **Clean builds**: `npm run clean`
4. **Check logs** in terminal output

## 📚 Full Documentation

- **Build Guide**: `BUILD_GUIDE.md` - Complete step-by-step instructions
- **Technical Docs**: `TECHNICAL_DESIGN.md` - Deep technical details
- **System Maps**: `SYSTEM_MAP.md` - Visual architecture diagrams

---

**Ready to build? Start with step 1 above! 🎯**
