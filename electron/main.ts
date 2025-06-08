import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { PDFDocument, rgb } from 'pdf-lib';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('select-images', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }]
  });
  return canceled ? [] : filePaths;
});

ipcMain.handle('save-pdf', async (_event, args) => {
  const { images, width, topLabel, bottomLabel, title } = args as {
    images: string[];
    width: number;
    topLabel: string;
    bottomLabel: string;
    title: string;
  };

  const doc = await PDFDocument.create();

  if (title) {
    const page = doc.addPage([width, 500]);
    const { width: pw, height: ph } = page.getSize();
    page.drawText(title, {
      x: pw / 2 - (title.length * 12) / 2,
      y: ph / 2,
      size: 24,
      color: rgb(0, 0, 0)
    });
  }

  for (const imgPath of images) {
    const bytes = await fs.promises.readFile(imgPath);
    let image;
    try {
      image = await doc.embedJpg(bytes);
    } catch {
      image = await doc.embedPng(bytes);
    }
    const ratio = width / image.width;
    const height = image.height * ratio;
    const page = doc.addPage([width, height]);
    page.drawImage(image, { x: 0, y: 0, width, height });
    if (topLabel) {
      page.drawText(topLabel, {
        x: 10,
        y: height - 24,
        size: 12,
        color: rgb(0, 0, 0)
      });
    }
    if (bottomLabel) {
      page.drawText(bottomLabel, {
        x: 10,
        y: 10,
        size: 12,
        color: rgb(0, 0, 0)
      });
    }
  }

  const pdfBytes = await doc.save();
  const { filePath } = await dialog.showSaveDialog({
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });
  if (filePath) {
    await fs.promises.writeFile(filePath, pdfBytes);
  }
});
