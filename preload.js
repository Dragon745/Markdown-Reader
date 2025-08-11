const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script: Setting up contextBridge...');

contextBridge.exposeInMainWorld('electronAPI', {
    readFile: (filePath) => {
        console.log('Preload: readFile called with:', filePath);
        return ipcRenderer.invoke('read-file', filePath);
    },
    getFileInfo: (filePath) => {
        console.log('Preload: getFileInfo called with:', filePath);
        return ipcRenderer.invoke('get-file-info', filePath);
    },
    onFileOpened: (callback) => {
        console.log('Preload: onFileOpened callback registered');
        return ipcRenderer.on('file-opened', callback);
    },
    removeAllListeners: (channel) => {
        console.log('Preload: removeAllListeners called for channel:', channel);
        return ipcRenderer.removeAllListeners(channel);
    },
    triggerFileDialog: () => {
        console.log('Preload: triggerFileDialog called');
        return ipcRenderer.invoke('trigger-file-dialog');
    }
});

console.log('Preload script: contextBridge setup complete');
console.log('Preload script: Available API methods:', ['readFile', 'getFileInfo', 'onFileOpened', 'removeAllListeners', 'triggerFileDialog']);
