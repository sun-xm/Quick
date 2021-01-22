import { Uri, workspace } from 'vscode'
import { TextDecoder, TextEncoder } from 'util';

let fs  = workspace.fs;
let dec = new TextDecoder();
let enc = new TextEncoder();

export async function isEmpty(folder: Uri) {
    return 0 == (await fs.readDirectory(folder)).length;
}

export async function copy(src: string, dst: string, overwrite?: boolean | undefined) {
    return fs.copy(Uri.file(src), Uri.file(dst), { overwrite: overwrite ? true : false });
}

export async function copyReplace(src: string, dst: string, replace: [string, string][], overwrite?: boolean | undefined) {
    if (undefined == overwrite || !overwrite) {
        try {
            await fs.stat(Uri.file(dst));
            return;
        } catch {}
    }

    let content = dec.decode(await fs.readFile(Uri.file(src)));

    replace.forEach(function(r){
        content = content.replace(r[0], r[1]);
    });

    return fs.writeFile(Uri.file(dst), enc.encode(content));
}