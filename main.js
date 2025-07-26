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
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.setMenuBarVisibility(false);
  win.loadFile('index.html');

  // Open all new window requests in the user's default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

const dataPath = path.join(app.getPath('userData'), 'data.json');

ipcMain.handle('loadData', async () => {
    try {
        if (!fs.existsSync(dataPath)) {
            fs.writeFileSync(dataPath, JSON.stringify({ projects: [] }, null, 2));
        }
        const data = fs.readFileSync(dataPath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        return { projects: [] };
    }
});

ipcMain.handle('saveData', async (event, data) => {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});