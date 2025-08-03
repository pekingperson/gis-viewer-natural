const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  saveFile: (filePath, data) => ipcRenderer.invoke('save-file', filePath, data),
  
  // Menu actions
  onFileSelected: (callback) => ipcRenderer.on('file-selected', callback),
  onGeoJSONSelected: (callback) => ipcRenderer.on('geojson-selected', callback),
  onExportData: (callback) => ipcRenderer.on('export-data', callback),
  onSetTool: (callback) => ipcRenderer.on('set-tool', callback),
  onToggleGrid: (callback) => ipcRenderer.on('toggle-grid', callback),
  onToggleAnnotations: (callback) => ipcRenderer.on('toggle-annotations', callback),
  onZoom: (callback) => ipcRenderer.on('zoom', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
