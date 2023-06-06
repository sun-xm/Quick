import { TextDecoder } from 'util';
import * as vscode from 'vscode';
import * as cp from 'child_process';

const fs = vscode.workspace.fs;
const dec = new TextDecoder();

export async function setContext() {
    vscode.commands.executeCommand('setContext', 'quick.submodules', await list());
}

export async function remove(uri: vscode.Uri) {
    if (!vscode.workspace.workspaceFolders) {
        return;
    }

    let ws = vscode.workspace.workspaceFolders[0].uri;
    if (!ws) {
        return;
    }

    if (!uri.path.startsWith(ws.path)) {
        return;
    }

    cp.exec('git rm ' + uri.fsPath, { cwd: ws.fsPath }, async(error, stdout, stderr)=>{
        if (error && 0 != error.code) {
            vscode.window.showErrorMessage(stderr);
            return;
        }

        let relative = uri.path.substring(ws.path.length);
        if ('/' == relative[0]) {
            relative = relative.substring(1);
        }

        let trace = vscode.Uri.file(ws.fsPath + '/.git/modules/' + relative);
        await fs.delete(trace, { recursive: true });

        cp.exec('git config --local --remove-section submodule.' + relative, {cwd: ws.fsPath}, (error, stdout, stderr)=>{
            if (error && 0 != error.code) {
                vscode.window.showErrorMessage(stderr);
                return;
            }

            vscode.window.showInformationMessage('Submodule ' + relative + ' has been removed');
        });
    });
}

async function list() {
    const path = vscode.workspace.workspaceFolders![0].uri.path;
    const file = vscode.Uri.file(path + '/.gitmodules');

    try {
        await fs.stat(file);
    } catch {
        return;
    }

    let modules : string[] = [];
    let lines = dec.decode(await fs.readFile(file)).split('\n');

    const regex = /\s*path\s*=\s*(\S+)\s*/;
    lines.forEach((line: string)=>{
        let result = regex.exec(line);
        if (result) {
            let uri = vscode.Uri.file(path + '/' + result[1]);
            modules.push(uri.fsPath);
        }
    });

    return modules;
}