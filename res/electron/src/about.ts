import * as remote from '@electron/remote';

window.addEventListener('load', async ()=>{
    document.getElementById('close')?.addEventListener('click', ()=>{
        remote.getCurrentWindow().close();
    });
});