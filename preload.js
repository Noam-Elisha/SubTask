const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    loadData: () => ipcRenderer.invoke('loadData'),
    saveData: (data) => ipcRenderer.invoke('saveData', data)
});