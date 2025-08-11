# 🚀 Automated Release Guide

## ✨ **How It Works**

1. **Push a tag** → GitHub Actions automatically builds and releases
2. **No manual work** → Everything happens automatically
3. **Professional releases** → Consistent formatting every time

## 🎯 **Quick Release Process**

### **Step 1: Commit Your Changes**

```bash
git add .
git commit -m "Ready for release v1.0.0"
git push origin main
```

### **Step 2: Create and Push Release Tag**

```bash
# Option A: Use the release script
node scripts/release.js

# Option B: Manual commands
git tag v1.0.0
git push origin v1.0.0
```

### **Step 3: Watch the Magic Happen**

- GitHub Actions automatically builds your Windows app
- Creates a professional release with all artifacts
- Uploads installer and portable versions

## 📁 **What Gets Released**

- **Windows Installer**: `.exe` setup file
- **Windows Portable**: Standalone `.exe` file
- **Release Notes**: Auto-generated from commits
- **Build Artifacts**: All necessary files

## 🔧 **Customization**

### **Update Version**

Edit `package.json`:

```json
{
  "version": "1.0.1"
}
```

### **Modify Workflow**

Edit `.github/workflows/release.yml` to:

- Add more platforms
- Change build settings
- Modify release behavior

## 🚨 **Important Notes**

- **Tags must start with `v`** (e.g., `v1.0.0`, `v2.1.3`)
- **All changes must be committed** before tagging
- **Check Actions tab** on GitHub to monitor progress
- **Releases are public by default**

## 🎉 **That's It!**

Your Markdown Reader Pro will now have professional, automated releases every time you push a version tag!
