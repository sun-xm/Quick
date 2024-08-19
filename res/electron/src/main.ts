import { app, BrowserWindow, ipcMain, webContents } from 'electron';
import * as remote from '@electron/remote/main';

remote.initialize();

function createWindow() {
    let win = new BrowserWindow({ width: 800, height: 600, frame: false, show: false, webPreferences: { nodeIntegration: true, contextIsolation: false }});
    win.once('ready-to-show', ()=>win.show());
    win.setMenu(null);
    win.loadFile('html/index.html');
    // win.webContents.openDevTools({ mode: 'detach' });
    remote.enable(win.webContents);
}

app.on('ready', ()=>{
    createWindow();

    app.on('activate', ()=>{
        if (0 == BrowserWindow.getAllWindows().length) {
            createWindow();
        }
    });
});

app.on('window-all-closed', ()=>{
    if ('darwin' != process.platform) {
        app.quit();
    }
});

ipcMain.on('enable-remote', (event, webContentsId)=>{
    remote.enable(webContents.fromId(webContentsId));
});