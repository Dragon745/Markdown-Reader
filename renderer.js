// DOM Elements
const dropZone = document.getElementById('dropZone');
const openFileBtn = document.getElementById('openFileBtn');
const markdownContainer = document.getElementById('markdownContainer');
const markdownContent = document.getElementById('markdownContent');
const fileInfo = document.getElementById('fileInfo');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');

// New DOM Elements
const settingsBtn = document.getElementById('settingsBtn');
const helpBtn = document.getElementById('helpBtn');
const settingsModal = document.getElementById('settingsModal');
const helpModal = document.getElementById('helpModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const closeHelpBtn = document.getElementById('closeHelpBtn');
const closeHelpBtn2 = document.getElementById('closeHelpBtn2');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const resetSettingsBtn = document.getElementById('resetSettingsBtn');
const themeSelect = document.getElementById('themeSelect');
const fontSizeSelect = document.getElementById('fontSizeSelect');
const lineHeightSelect = document.getElementById('lineHeightSelect');
const toggleThemeBtn = document.getElementById('toggleThemeBtn');
const printBtn = document.getElementById('printBtn');
const exportBtn = document.getElementById('exportBtn');
const copyPathBtn = document.getElementById('copyPathBtn');
const reloadFileBtn = document.getElementById('reloadFileBtn');
const appStatus = document.getElementById('appStatus');

let currentFile = null;
let currentTheme = 'auto';
let currentFontSize = 'medium';
let currentLineHeight = 'normal';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check if electronAPI is available
    if (!window.electronAPI) {
        console.error('Electron API is not available!');
        return;
    }

    setupEventListeners();
    setupDragAndDrop();
    loadSettings();
    updateAppStatus('Ready');
});

function setupEventListeners() {
    // File operations
    openFileBtn.addEventListener('click', async () => {
        try {
            const result = await window.electronAPI.triggerFileDialog();
        } catch (error) {
            console.error('Error triggering file dialog:', error);
        }
    });

    // Settings modal
    settingsBtn.addEventListener('click', () => openModal(settingsModal));
    closeSettingsBtn.addEventListener('click', () => closeModal(settingsModal));
    saveSettingsBtn.addEventListener('click', saveSettings);
    resetSettingsBtn.addEventListener('click', resetSettings);

    // Help modal
    helpBtn.addEventListener('click', () => openModal(helpModal));
    closeHelpBtn.addEventListener('click', () => closeModal(helpModal));
    closeHelpBtn2.addEventListener('click', () => closeModal(helpModal));

    // File actions
    copyPathBtn.addEventListener('click', copyFilePath);
    reloadFileBtn.addEventListener('click', reloadCurrentFile);
    printBtn.addEventListener('click', printDocument);
    exportBtn.addEventListener('click', exportAsHTML);
    toggleThemeBtn.addEventListener('click', toggleTheme);

    // Listen for files opened via menu
    window.electronAPI.onFileOpened((event, filePath) => {
        loadMarkdownFile(filePath);
    });

    // Settings change listeners
    themeSelect.addEventListener('change', (e) => {
        currentTheme = e.target.value;
        applyTheme(currentTheme);
    });

    fontSizeSelect.addEventListener('change', (e) => {
        currentFontSize = e.target.value;
        applyFontSize(currentFontSize);
    });

    lineHeightSelect.addEventListener('click', (e) => {
        currentLineHeight = e.target.value;
        applyLineHeight(currentLineHeight);
    });

}

function setupDragAndDrop() {
    console.log('Setting up drag and drop...');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    dropZone.addEventListener('drop', handleDrop, false);

    // Make drop zone clickable to open file dialog
    dropZone.addEventListener('click', async () => {
        try {
            const result = await window.electronAPI.triggerFileDialog();
        } catch (error) {
            console.error('Error triggering file dialog from drop zone:', error);
        }
    });
}

// Prevent default drag behaviors
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop zone
function highlight(e) {
    dropZone.classList.add('drag-over');
}

// Unhighlight drop zone
function unhighlight(e) {
    dropZone.classList.remove('drag-over');
}

// Handle dropped files
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        const file = files[0];

        // Check if it's a markdown file
        if (isMarkdownFile(file.name)) {
            if (file.path) {
                loadMarkdownFile(file.path);
            } else {
                console.warn('File path not available, file object:', file);
                showError('Could not access file path. Please use the "Open File" button instead.');
            }
        } else {
            showError('Please drop a markdown file (.md, .markdown, or .txt)');
        }
    }
}

// Check if file is a markdown file
function isMarkdownFile(filename) {
    const markdownExtensions = ['.md', '.markdown', '.txt'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return markdownExtensions.includes(extension);
}

// Load and render markdown file
async function loadMarkdownFile(filePath) {
    try {
        updateAppStatus('Loading file...');
        showLoading();

        // Read file content using Electron API
        const result = await window.electronAPI.readFile(filePath);

        if (result.success) {
            // Get file info
            const fileInfoResult = await window.electronAPI.getFileInfo(filePath);

            if (fileInfoResult.success) {
                currentFile = fileInfoResult;
                displayFileInfo(fileInfoResult);
                renderMarkdown(result.content);
                showMarkdown();
                updateAppStatus('File loaded successfully');
            } else {
                throw new Error('Failed to get file info');
            }
        } else {
            throw new Error(result.error || 'Failed to read file');
        }
    } catch (error) {
        console.error('Error loading file:', error);
        showError(error.message || 'Failed to load file');
        updateAppStatus('Error loading file');
    }
}

// Display file information
function displayFileInfo(fileInfoData) {
    const fileNameElement = document.getElementById('fileName');
    const fileSizeElement = document.getElementById('fileSize');
    const filePathElement = document.getElementById('filePath');

    if (fileNameElement && fileSizeElement && filePathElement) {
        fileNameElement.textContent = fileInfoData.fileName;
        fileSizeElement.textContent = formatFileSize(fileInfoData.fileSize);
        filePathElement.textContent = fileInfoData.filePath || 'Path not available';

        if (fileInfo) {
            fileInfo.style.display = 'flex';
        }
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Render markdown content
function renderMarkdown(content) {
    try {
        // Configure marked options
        marked.setOptions({
            highlight: function (code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (err) {
                        console.warn('Highlight.js error:', err);
                    }
                }
                return hljs.highlightAuto(code).value;
            },
            breaks: true,
            gfm: true
        });

        // Render markdown to HTML
        const html = marked.parse(content);
        markdownContent.innerHTML = html;

        // Apply syntax highlighting to code blocks
        markdownContent.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

    } catch (error) {
        console.error('Error rendering markdown:', error);
        throw new Error('Failed to render markdown content');
    }
}

// Show loading state
function showLoading() {
    hideAllStates();
    if (loadingState) {
        loadingState.style.display = 'flex';
    }
}

// Show markdown content
function showMarkdown() {
    hideAllStates();
    markdownContainer.style.display = 'block';
    markdownContainer.classList.add('fade-in');
}

// Show error state
function showError(message) {
    hideAllStates();
    if (errorMessage) {
        errorMessage.textContent = message;
        errorState.style.display = 'flex';
        errorState.classList.add('fade-in');
    }
}

// Hide all states
function hideAllStates() {
    dropZone.style.display = 'none';
    markdownContainer.style.display = 'none';
    if (loadingState) {
        loadingState.style.display = 'none';
    }
    if (errorState) {
        errorState.style.display = 'none';
    }
}

// Reset application to initial state
function resetApp() {
    currentFile = null;
    if (fileInfo) {
        fileInfo.style.display = 'none';
    }
    markdownContent.innerHTML = '';
    hideAllStates();
    dropZone.style.display = 'block';
    dropZone.classList.add('fade-in');
    updateAppStatus('Ready');
}

// Modal functions
function openModal(modal) {
    modal.style.display = 'block';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
    }, 10);
}

function closeModal(modal) {
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 250);
}

// Settings functions
function loadSettings() {
    const savedTheme = localStorage.getItem('theme') || 'auto';
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    const savedLineHeight = localStorage.getItem('lineHeight') || 'normal';

    currentTheme = savedTheme;
    currentFontSize = savedFontSize;
    currentLineHeight = savedLineHeight;

    themeSelect.value = savedTheme;
    fontSizeSelect.value = savedFontSize;
    lineHeightSelect.value = savedLineHeight;

    applyTheme(currentTheme);
    applyFontSize(currentFontSize);
    applyLineHeight(currentLineHeight);
}

function saveSettings() {
    localStorage.setItem('theme', currentTheme);
    localStorage.setItem('fontSize', currentFontSize);
    localStorage.setItem('lineHeight', currentLineHeight);

    closeModal(settingsModal);
    updateAppStatus('Settings saved');

    // Show success feedback
    showToast('Settings saved successfully!');
}

function resetSettings() {
    currentTheme = 'auto';
    currentFontSize = 'medium';
    currentLineHeight = 'normal';

    themeSelect.value = currentTheme;
    fontSizeSelect.value = currentFontSize;
    lineHeightSelect.value = currentLineHeight;

    applyTheme(currentTheme);
    applyFontSize(currentFontSize);
    applyLineHeight(currentLineHeight);

    updateAppStatus('Settings reset to defaults');
    showToast('Settings reset to defaults');
}

function applyTheme(theme) {
    const root = document.documentElement;

    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
        root.setAttribute('data-theme', theme);
    }

    // Update the toggle button icon based on current theme
    updateThemeToggleIcon();
}

function applyFontSize(size) {
    const sizes = {
        small: '0.875rem',
        medium: '1rem',
        large: '1.125rem'
    };

    document.documentElement.style.setProperty('--base-font-size', sizes[size]);
}

function applyLineHeight(height) {
    const heights = {
        tight: '1.4',
        normal: '1.6',
        relaxed: '1.8'
    };

    document.documentElement.style.setProperty('--base-line-height', heights[height]);
}

function toggleTheme() {
    const currentDataTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentDataTheme === 'light' ? 'dark' : 'light';

    // Apply the new theme
    document.documentElement.setAttribute('data-theme', newTheme);
    currentTheme = newTheme;

    // Update theme select if it's not set to auto
    if (themeSelect.value !== 'auto') {
        themeSelect.value = newTheme;
    }

    // Save the theme preference
    localStorage.setItem('theme', newTheme);

    // Update app status
    updateAppStatus(`Theme switched to ${newTheme}`);

    // Show feedback
    showToast(`Theme switched to ${newTheme} mode`);
}

function updateThemeToggleIcon() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const toggleBtn = document.getElementById('toggleThemeBtn');

    if (toggleBtn) {
        const icon = toggleBtn.querySelector('svg');
        if (icon) {
            if (currentTheme === 'dark') {
                // Show sun icon for dark theme
                icon.innerHTML = '<path d="M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M12,22L9.61,18.58C10.35,18.85 11.16,19 12,19C12.84,19 13.65,18.85 14.39,18.58L12,22M2,12L5.42,14.39C5.15,13.65 5,12.84 5,12C5,11.16 5.15,10.35 5.42,9.61L2,12M22,12L18.58,9.61C18.85,10.35 19,11.16 19,12C19,12.84 18.85,13.65 18.58,14.39L22,12Z"/>';
            } else {
                // Show moon icon for light theme
                icon.innerHTML = '<path d="M17.75,4.09L15.22,6.03L17.75,7.97L17.75,4.09M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>';
            }
        }
    }
}

// File action functions
function copyFilePath() {
    if (currentFile && currentFile.filePath) {
        navigator.clipboard.writeText(currentFile.filePath).then(() => {
            showToast('File path copied to clipboard!');
        }).catch(() => {
            showToast('Failed to copy file path');
        });
    }
}

function reloadCurrentFile() {
    if (currentFile && currentFile.filePath) {
        loadMarkdownFile(currentFile.filePath);
    }
}

function printDocument() {
    if (markdownContainer.style.display !== 'none') {
        window.print();
    }
}

function exportAsHTML() {
    if (markdownContainer.style.display !== 'none' && markdownContent.innerHTML) {
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentFile ? currentFile.fileName.replace(/\.(md|markdown|txt)$/i, '') : 'Markdown Document'}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; }
        h1, h2, h3, h4, h5, h6 { color: #1a202c; }
        code { background: #f7fafc; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: monospace; }
        pre { background: #2d3748; color: #e2e8f0; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
        blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; }
        table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
        th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f7fafc; font-weight: 600; }
    </style>
</head>
<body>
    ${markdownContent.innerHTML}
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentFile ? currentFile.fileName.replace(/\.(md|markdown|txt)$/i, '') : 'document'}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Document exported as HTML!');
    }
}

// Utility functions
function updateAppStatus(status) {
    if (appStatus) {
        appStatus.textContent = status;
    }
}

function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast fade-in';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: var(--primary-600);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        font-weight: 500;
        max-width: 300px;
        word-wrap: break-word;
    `;

    document.body.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 250);
    }, 3000);
}

// Handle window resize
window.addEventListener('resize', () => {
    // Recalculate any layout-dependent elements if needed
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + O to open file
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        openFileBtn.click();
    }

    // Ctrl/Cmd + P to print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        if (markdownContainer.style.display !== 'none') {
            printDocument();
        }
    }

    // Ctrl/Cmd + S to export
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (markdownContainer.style.display !== 'none') {
            exportAsHTML();
        }
    }

    // Escape to reset
    if (e.key === 'Escape') {
        if (settingsModal.style.display === 'block') {
            closeModal(settingsModal);
        } else if (helpModal.style.display === 'block') {
            closeModal(helpModal);
        } else {
            resetApp();
        }
    }
});

// Handle beforeunload to clean up
window.addEventListener('beforeunload', () => {
    // Clean up any resources if needed
    window.electronAPI.removeAllListeners('file-opened');
});

// Export functions for global access
window.resetApp = resetApp;
