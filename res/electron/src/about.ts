import { remote } from 'electron';

window.addEventListener('load', async ()=>{
    document.getElementById('close')?.addEventListener('click', ()=>{
        remote.getCurrentWindow().close();
    });
});