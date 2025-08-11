# Markdown Reader

A beautiful, cross-platform markdown reader built with Electron that works on Windows, Mac, and Linux. Features drag-and-drop functionality, syntax highlighting, and a modern, responsive UI.

## Features

- 🖥️ **Cross-platform**: Works on Windows, Mac, and Linux
- 📁 **Drag & Drop**: Simply drag markdown files onto the application
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations
- 🔍 **File Browser**: Open files through the menu or button
- ✨ **Syntax Highlighting**: Code blocks with language-specific highlighting
- 📱 **Responsive**: Adapts to different screen sizes
- ⌨️ **Keyboard Shortcuts**: Quick access to common functions
- 🎯 **Easy to Use**: Intuitive interface for reading markdown files

## Screenshots

The application features a clean, modern interface with:

- Gradient background with glassmorphism effects
- Drag-and-drop zone for easy file loading
- Responsive markdown rendering
- File information display
- Professional typography and spacing

## Installation

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Development Setup

1. Clone the repository:

```bash
git clone <your-repo-url>
cd markdown-reader
```

2. Install dependencies:

```bash
npm install
```

3. Start the development version:

```bash
npm start
```

### Building for Production

Build for all platforms:

```bash
npm run build
```

Build for specific platforms:

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## Usage

### Opening Files

1. **Drag & Drop**: Simply drag a markdown file (.md or .markdown) onto the application window
2. **Menu**: Use File → Open File (Ctrl/Cmd + O)
3. **Button**: Click the "Open File" button in the header

### Supported File Formats

- `.md` - Standard markdown files
- `.markdown` - Alternative markdown extension

### Keyboard Shortcuts

- `Ctrl/Cmd + O` - Open file
- `Escape` - Reset to initial state
- `Ctrl/Cmd + R` - Reload application
- `F11` - Toggle fullscreen

## Development

### Project Structure

```
markdown-reader/
├── main.js              # Main Electron process
├── preload.js           # Preload script for secure IPC
├── index.html           # Main application HTML
├── styles.css           # Application styles
├── renderer.js          # Frontend logic
├── package.json         # Project configuration
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

### Key Technologies

- **Electron**: Cross-platform desktop application framework
- **Marked**: Fast markdown parser and compiler
- **Highlight.js**: Syntax highlighting for code blocks
- **Vanilla JavaScript**: No framework dependencies for better performance

### Architecture

The application follows Electron's security best practices:

- **Main Process** (`main.js`): Handles window creation, file system operations, and menu management
- **Preload Script** (`preload.js`): Provides secure APIs for renderer process
- **Renderer Process** (`renderer.js`): Handles UI interactions and markdown rendering

### Security Features

- Context isolation enabled
- Node integration disabled
- Secure IPC communication
- File path validation

## Customization

### Styling

The application uses CSS custom properties and modern CSS features. You can customize:

- Color scheme in `styles.css`
- Typography and spacing
- Animation durations and effects
- Responsive breakpoints

### Adding Features

To add new features:

1. **Main Process**: Add new IPC handlers in `main.js`
2. **Preload**: Expose new APIs in `preload.js`
3. **Renderer**: Implement UI logic in `renderer.js`
4. **Styling**: Add CSS in `styles.css`

## Troubleshooting

### Common Issues

1. **File won't open**: Ensure the file has a `.md` or `.markdown` extension
2. **App won't start**: Check Node.js version and reinstall dependencies
3. **Build fails**: Ensure all build tools are properly installed

### Debug Mode

Run in development mode with DevTools:

```bash
npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Markdown parsing with [Marked](https://marked.js.org/)
- Syntax highlighting with [Highlight.js](https://highlightjs.org/)
- Icons from Material Design Icons

## Support

If you encounter any issues or have questions:

1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information

---

**Enjoy reading your markdown files with style!** 📚✨
