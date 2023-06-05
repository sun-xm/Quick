import { TextDecoder } from 'util';
import * as vscode from 'vscode';
import * as os from 'os';

const fs = vscode.workspace.fs;
const dec = new TextDecoder();

export async function list() {
    const path = vscode.workspace.workspaceFolders![0].uri.path;
    const file = vscode.Uri.file(path + '/.gitmodules');

    try {
        await fs.stat(file);
    } catch {
        return;
    }

    let modules : string[] = [];

    let regex = /\s*path\s*=\s*(\S+)\s*/;
    dec.decode(await fs.readFile(file)).split('\n').forEach((line: string)=>{
        let result = regex.exec(line);
        if (result) {
            let m = path + '/' + result[1];

            if ('win32' == os.platform()) {
                if ('/' == m[0]) {
                    m = m.substring(1);
                }

                m = m.replace(/\//g, '\\');
            }

            modules.push(m);
        }
    });

    vscode.commands.executeCommand('setContext', 'quick.submodules', modules);
}

export async function remove(uri: vscode.Uri) {
}