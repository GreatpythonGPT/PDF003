const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers
ipcMain.handle('open-files', async () => {
  const {canceled, filePaths} = await dialog.showOpenDialog({
    properties:['openFile','multiSelections'],
    filters:[{name:'Images', extensions:['png','jpg','jpeg','gif','bmp'] }]
  });
  if (canceled) return [];
  return filePaths;
});

ipcMain.handle('save-file', async () => {
  const {canceled, filePath} = await dialog.showSaveDialog({
    defaultPath: 'output.pdf',
    filters: [{name: 'PDF', extensions: ['pdf']}]
  });
  if (canceled) return null;
  return filePath;
});

