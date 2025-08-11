// DOM Elements
const dropZone = document.getElementById('dropZone');
const openFileBtn = document.getElementById('openFileBtn');
const markdownContainer = document.getElementById('markdownContainer');
const markdownContent = document.getElementById('markdownContent');
const fileInfo = document.getElementById('fileInfo');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');

let currentFile = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Setting up application...');

    // Check if electronAPI is available
    if (window.electronAPI) {
        console.log('Electron API is available:', Object.keys(window.electronAPI));
    } else {
        console.error('Electron API is not available!');
    }

    setupEventListeners();
    setupDragAndDrop();
    console.log('Application setup complete');
});

function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Fix: Connect the open file button to trigger the file dialog
    openFileBtn.addEventListener('click', async () => {
        console.log('Open file button clicked');
        try {
            // Use the electronAPI to trigger file selection
            // We'll simulate the menu action by sending a custom event
            const result = await window.electronAPI.triggerFileDialog();
            console.log('File dialog result:', result);
        } catch (error) {
            console.error('Error triggering file dialog:', error);
        }
    });

    // Listen for files opened via menu
    window.electronAPI.onFileOpened((event, filePath) => {
        console.log('File opened event received:', filePath);
        loadMarkdownFile(filePath);
    });

    console.log('Event listeners setup complete');
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

    // Fix: Make drop zone clickable to open file dialog
    dropZone.addEventListener('click', async () => {
        console.log('Drop zone clicked');
        try {
            const result = await window.electronAPI.triggerFileDialog();
            console.log('File dialog result from drop zone:', result);
        } catch (error) {
            console.error('Error triggering file dialog from drop zone:', error);
        }
    });

    console.log('Drag and drop setup complete');
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
    console.log('File dropped:', e.dataTransfer.files);
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        const file = files[0];
        console.log('Dropped file:', file);
        console.log('File properties:', {
            name: file.name,
            path: file.path,
            size: file.size,
            type: file.type
        });

        // Check if it's a markdown file
        if (isMarkdownFile(file.name)) {
            // In Electron, we need to get the file path from the file object
            // The file.path property should contain the full path
            if (file.path) {
                console.log('Loading file from path:', file.path);
                loadMarkdownFile(file.path);
            } else {
                // Fallback: try to construct path or show error
                console.warn('File path not available, file object:', file);
                showError('Could not access file path. Please use the "Open File" button instead.');
            }
        } else {
            showError('Please drop a markdown file (.md or .markdown)');
        }
    }
}

// Check if file is a markdown file
function isMarkdownFile(filename) {
    const markdownExtensions = ['.md', '.markdown'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return markdownExtensions.includes(extension);
}

// Load and render markdown file
async function loadMarkdownFile(filePath) {
    try {
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
            } else {
                throw new Error('Failed to get file info');
            }
        } else {
            throw new Error(result.error || 'Failed to read file');
        }
    } catch (error) {
        console.error('Error loading file:', error);
        showError(error.message || 'Failed to load file');
    }
}

// Display file information
function displayFileInfo(fileInfoData) {
    // Find the file info elements in the header
    const fileNameElement = document.getElementById('fileName');
    const fileSizeElement = document.getElementById('fileSize');

    if (fileNameElement && fileSizeElement) {
        fileNameElement.textContent = fileInfoData.fileName;
        fileSizeElement.textContent = formatFileSize(fileInfoData.fileSize);
        // Show the file info section
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
    console.log('Showing markdown content...');
    hideAllStates();
    markdownContainer.style.display = 'block';

    // Debug: Check container dimensions
    console.log('Markdown container dimensions:', {
        offsetHeight: markdownContainer.offsetHeight,
        scrollHeight: markdownContainer.scrollHeight,
        clientHeight: markdownContainer.clientHeight,
        style: {
            display: markdownContainer.style.display,
            height: markdownContainer.style.height,
            overflow: markdownContainer.style.overflow
        }
    });

    // Debug: Check content dimensions
    console.log('Markdown content dimensions:', {
        offsetHeight: markdownContent.offsetHeight,
        scrollHeight: markdownContent.scrollHeight,
        clientHeight: markdownContent.clientHeight
    });
}

// Show error state
function showError(message) {
    hideAllStates();
    if (errorMessage) {
        errorMessage.textContent = message;
        errorState.style.display = 'flex';
    }
}

// Hide all states
function hideAllStates() {
    console.log('Hiding all states...');
    dropZone.style.display = 'none';
    markdownContainer.style.display = 'none';
    if (loadingState) {
        loadingState.style.display = 'none';
    }
    if (errorState) {
        errorState.style.display = 'none';
    }
    console.log('All states hidden');
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
        console.log('Ctrl/Cmd + O pressed');
    }

    // Escape to reset
    if (e.key === 'Escape') {
        resetApp();
    }
});

// Handle beforeunload to clean up
window.addEventListener('beforeunload', () => {
    // Clean up any resources if needed
    window.electronAPI.removeAllListeners('file-opened');
});

// Export functions for global access
window.resetApp = resetApp;
