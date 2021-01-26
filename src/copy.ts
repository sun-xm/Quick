import { Uri, workspace } from 'vscode'
import { TextDecoder, TextEncoder } from 'util';
import * as os from 'os'

let fs  = workspace.fs;
let dec = new TextDecoder();
let enc = new TextEncoder();

export async function copyDirect(src: string, dst: string, overwrite?: boolean) {
    return fs.copy(Uri.file(src), Uri.file(dst), { overwrite: overwrite ?? false });
}

export async function copyText(src: string, dst: string, replace?: [RegExp, string][], overwrite?: boolean) {
    if (!(overwrite ?? false)) {
        try {
            await fs.stat(Uri.file(dst));
            return;
        } catch {}
    }

    let txt = dec.decode(await fs.readFile(Uri.file(src)));

    if ('win32' != os.platform()) {
        txt = txt.replace(/\r\n/g, '\n');
    }

    if (null != replace) {
        replace.forEach((r)=>{
            txt = txt.replace(r[0], r[1]);
        });
    }

    return fs.writeFile(Uri.file(dst), enc.encode(txt));
}