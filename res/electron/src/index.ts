import * as remote     from '@electron/remote';
import { ipcRenderer } from 'electron';
import { Module }      from './module';
import { Title }       from './title';
import { Content }     from './content';
import { Status }      from './status';

function onCmdExit() {
    remote.getCurrentWindow().close();
}

function onCmdAbout() {
    const win = new remote.BrowserWindow({ width: 400, height: 300, frame: false, parent: remote.getCurrentWindow(), show: false, modal: true, resizable: false, minimizable: false, webPreferences: { nodeIntegration: true, contextIsolation: false }});
    win.once('ready-to-show', ()=>win.show());
    win.setMenu(null);
    win.loadFile('html/about.html');
    ipcRenderer.send('enable-remote', win.webContents.id);
}

window.addEventListener('load', async ()=>{
    const title = await Module.load<Title>(document.getElementById('title')!);
    await title?.onload();

    title?.file?.onCommand('exit', onCmdExit);
    title?.help?.onCommand('about', onCmdAbout);

    title?.color?.onCommand('red',   ()=>Status.show('Red is selected'));
    title?.color?.onCommand('blue',  ()=>Status.show('Blue is selected'));
    title?.color?.onCommand('green', ()=>Status.show('Green is selected'));

    title?.option?.onCommand('opt1', (i)=>Status.show('Option1 is ' + (i.isChecked() ? 'checked' : 'unchecked')));
    title?.option?.onCommand('opt2', (i)=>Status.show('Option2 is ' + (i.isChecked() ? 'checked' : 'unchecked')));

    (await Module.load<Content>(document.getElementById('content')!))?.context(title?.color);

    Status.init(document.getElementById('status'));
});