const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  selectFile: () => ipcRenderer.invoke('select-file'),
  saveReport: (data, defaultPath) => ipcRenderer.invoke('save-report', data, defaultPath),
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
});
