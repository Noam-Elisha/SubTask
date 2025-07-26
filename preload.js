const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    loadData: () => ipcRenderer.invoke('loadData'),
    saveData: (data) => ipcRenderer.invoke('saveData', data),
    focusWindow: () => ipcRenderer.send('focus-window'),
    showConfirm: (message, title = "Confirm") =>
        ipcRenderer.invoke('show-confirm', { message, title })
});