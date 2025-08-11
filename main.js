const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
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

    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Open DevTools in development
    if (process.argv.includes('--dev')) {
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
    createWindow();
    createMenu();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    // Clean up before quitting
});

// IPC handlers
ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const content = await fs.promises.readFile(filePath, 'utf8');
        return { success: true, content };
    } catch (error) {
        console.error('Main process: Error reading file:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-file-info', async (event, filePath) => {
    try {
        const stats = await fs.promises.stat(filePath);
        const fileName = path.basename(filePath);
        const fileSize = stats.size;
        const lastModified = stats.mtime;

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
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
                { name: 'Markdown Files', extensions: ['md', 'markdown'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (!result.canceled && result.filePaths.length > 0) {
            // Send the file path back to the renderer
            mainWindow.webContents.send('file-opened', result.filePaths[0]);
            return { success: true, filePath: result.filePaths[0] };
        } else {
            return { success: false, canceled: true };
        }
    } catch (error) {
        console.error('Main process: Error in file dialog:', error);
        return { success: false, error: error.message };
    }
});
