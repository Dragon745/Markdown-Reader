const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    readFile: (filePath) => {
        return ipcRenderer.invoke('read-file', filePath);
    },
    getFileInfo: (filePath) => {
        return ipcRenderer.invoke('get-file-info', filePath);
    },
    onFileOpened: (callback) => {
        return ipcRenderer.on('file-opened', callback);
    },
    removeAllListeners: (channel) => {
        return ipcRenderer.removeAllListeners(channel);
    },
    triggerFileDialog: () => {
        return ipcRenderer.invoke('trigger-file-dialog');
    }
});
