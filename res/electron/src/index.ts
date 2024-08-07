import { remote } from 'electron';
import { Module } from './module';
import { Title } from './title';
import { Content } from './content';
import { Status } from './status';

function onCmdExit() {
    remote.getCurrentWindow().close();
}

function onCmdAbout() {
    let win = new remote.BrowserWindow({ width: 400, height: 300, frame: false, parent: remote.getCurrentWindow(), show: false, modal: true, resizable: false, minimizable: false, webPreferences: { nodeIntegration: true, enableRemoteModule: true }});
    win.once('ready-to-show', ()=>win.show());
    win.setMenu(null);
    win.loadFile('html/about.html');
}

window.addEventListener('load', async ()=>{
    let title = await Module.load<Title>(document.getElementById('title')!);
    await title?.onload();

    title?.file?.onCommand('exit', onCmdExit);
    title?.help?.onCommand('about', onCmdAbout);

    title?.color?.onCommand('red',   (i)=>Status.show('Red is selected'));
    title?.color?.onCommand('blue',  (i)=>Status.show('Blue is selected'));
    title?.color?.onCommand('green', (i)=>Status.show('Green is selected'));

    title?.option?.onCommand('opt1', (i)=>Status.show('Option1 is ' + (i.isChecked() ? 'checked' : 'unchecked')));
    title?.option?.onCommand('opt2', (i)=>Status.show('Option2 is ' + (i.isChecked() ? 'checked' : 'unchecked')));

    (await Module.load<Content>(document.getElementById('content')!))?.context(title?.color);

    Status.init(document.getElementById('status'));
});