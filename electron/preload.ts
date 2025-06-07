import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  selectImages: () => ipcRenderer.invoke('select-images'),
  savePDF: (data: any) => ipcRenderer.invoke('save-pdf', data)
});
