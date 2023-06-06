import { TextDecoder } from 'util';
import * as vscode from 'vscode';
import * as cp from 'child_process';
import { Uri } from 'vscode';

const fs = vscode.workspace.fs;
const dec = new TextDecoder();

export async function setContext() {
    if (!vscode.workspace.workspaceFolders || 0 == vscode.workspace.workspaceFolders.length) {
        return;
    }

    vscode.commands.executeCommand('setContext', 'quick.submodules', await list(vscode.workspace.workspaceFolders[0].uri, vscode.Uri.file('.gitmodules')));
}

export async function update(uri: vscode.Uri) {
    if (!uri.path.endsWith('/.gitmodules')) {
        vscode.window.showErrorMessage('Invalid git module filename');
        return;
    }

    if (!vscode.workspace.workspaceFolders || 0 == vscode.workspace.workspaceFolders.length) {
        vscode.window.showErrorMessage('.gitmodules is not in default workspace');
        return;
    }

    let ws = vscode.workspace.workspaceFolders[0].uri;
    if (!uri.path.startsWith(ws.path)) {
        vscode.window.showErrorMessage('.gitmodules is not in default workspace');
        return;
    }

    let modules = await list(ws, vscode.Uri.file('.gitmodules'));
    if (0 == modules.length) {
        vscode.window.showInformationMessage('No submodule found in .gitmodules');
        return;
    }

    vscode.window.showInformationMessage('Updating submodules');

    let success = true;
    await Promise.all(modules.map(async(module)=>{
        await exec('git submodule update --init ' + module, { cwd: ws.fsPath }, (error, stdout, stderr)=>{
            if (error && 0 != error.code) {
                success = false;
                vscode.window.showErrorMessage('Failed to update submodule ' + module + ':\n' + stderr);
            }
        });
    }));

    if (success) {
        vscode.window.showInformationMessage('Submodules have been updated');
    }
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

    let relative = uri.path.substring(ws.path.length);
    if ('/' == relative[0]) {
        relative = relative.substring(1);
    }
    vscode.window.showInformationMessage('Removing submodule ' + relative);

    cp.exec('git rm ' + uri.fsPath, { cwd: ws.fsPath }, async(error, stdout, stderr)=>{
        if (error && 0 != error.code) {
            vscode.window.showErrorMessage(stderr);
            return;
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

async function list(folder: vscode.Uri, file: vscode.Uri) {
    let modules : string[] = [];

    let path = Uri.joinPath(folder, file.path);
    try {
        await fs.stat(path);
    } catch {
        return modules;
    }

    let lines = dec.decode(await fs.readFile(path)).split('\n');

    const regex = /\s*path\s*=\s*(\S+)\s*/;
    lines.forEach((line: string)=>{
        let result = regex.exec(line);
        if (result) {
            // let uri = vscode.Uri.file(path + '/' + result[1]);
            let uri = vscode.Uri.joinPath(folder, result[1]);
            modules.push(uri.fsPath);
        }
    });

    return modules;
}

async function exec(command: string, options: cp.ExecOptions, callback?: (error: cp.ExecException | null, stdout: string, stderr: string) => void) {
    return new Promise<void>((resolve, reject)=>{
        cp.exec(command, options, (error, stdout, stderr)=>{
            if (callback) {
                callback(error, stdout, stderr);
            }
            resolve();
        });
    });
}