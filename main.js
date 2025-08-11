const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    console.log('Main process: Creating main window...');

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            enableRemoteModule: false
        },
        icon: path.join(__dirname, 'assets', 'icon.png'),
        show: false
    });

    console.log('Main process: Main window created, loading index.html...');

    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        console.log('Main process: Main window ready to show');
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        console.log('Main process: Main window closed');
        mainWindow = null;
    });

    // Open DevTools in development
    if (process.argv.includes('--dev')) {
        console.log('Main process: Opening DevTools for development');
        mainWindow.webContents.openDevTools();
    }

    // Handle file drops
    mainWindow.webContents.on('will-navigate', (event) => {
        event.preventDefault();
    });
}

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open File',
                    accelerator: 'CmdOrCtrl+O',
                    click: async () => {
                        const result = await dialog.showOpenDialog(mainWindow, {
                            properties: ['openFile'],
                            filters: [
                                { name: 'Markdown Files', extensions: ['md', 'markdown'] },
                                { name: 'All Files', extensions: ['*'] }
                            ]
                        });

                        if (!result.canceled && result.filePaths.length > 0) {
                            mainWindow.webContents.send('file-opened', result.filePaths[0]);
                        }
                    }
                },
                {
                    label: 'Open Recent',
                    submenu: []
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectall' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        }
    ];

    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// App lifecycle events
app.whenReady().then(() => {
    console.log('Main process: App is ready, creating window and menu...');
    createWindow();
    createMenu();

    app.on('activate', () => {
        console.log('Main process: App activated');
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    console.log('Main process: All windows closed, quitting app...');
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    console.log('Main process: App is quitting...');
});

// IPC handlers
ipcMain.handle('read-file', async (event, filePath) => {
    console.log('Main process: Reading file:', filePath);
    try {
        const content = await fs.promises.readFile(filePath, 'utf8');
        console.log('Main process: File read successfully, size:', content.length);
        return { success: true, content };
    } catch (error) {
        console.error('Main process: Error reading file:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-file-info', async (event, filePath) => {
    console.log('Main process: Getting file info:', filePath);
    try {
        const stats = await fs.promises.stat(filePath);
        const fileName = path.basename(filePath);
        const fileSize = stats.size;
        const lastModified = stats.mtime;

        console.log('Main process: File info retrieved:', { fileName, fileSize, lastModified });
        return {
            success: true,
            fileName,
            filePath,
            fileSize,
            lastModified
        };
    } catch (error) {
        console.error('Main process: Error getting file info:', error);
        return { success: false, error: error.message };
    }
});

// Add handler for renderer to trigger file dialog
ipcMain.handle('trigger-file-dialog', async (event) => {
    console.log('Main process: File dialog requested by renderer');
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
                { name: 'Markdown Files', extensions: ['md', 'markdown'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        console.log('Main process: File dialog result:', result);

        if (!result.canceled && result.filePaths.length > 0) {
            // Send the file path back to the renderer
            console.log('Main process: Sending file-opened event with path:', result.filePaths[0]);
            mainWindow.webContents.send('file-opened', result.filePaths[0]);
            return { success: true, filePath: result.filePaths[0] };
        } else {
            console.log('Main process: File dialog was canceled');
            return { success: false, canceled: true };
        }
    } catch (error) {
        console.error('Main process: Error in file dialog:', error);
        return { success: false, error: error.message };
    }
});
