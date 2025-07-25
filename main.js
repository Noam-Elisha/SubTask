// filepath: d:\OneDrive\1Documents\4Websites\SubTask\main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icon.png'), // <-- Add this line
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  win.setMenuBarVisibility(false);
  win.loadFile('index.html');
}

const dataPath = path.join(app.getPath('userData'), 'data.json');

ipcMain.handle('save-data', async (event, data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  return true;
});

ipcMain.handle('load-data', async () => {
  if (!fs.existsSync(dataPath)) return { projects: [] };
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});