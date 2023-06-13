import { TextDecoder } from 'util';
import * as vscode from 'vscode';
import * as chp from 'child_process';
import * as wsp from './workspace';
import * as ext from './extension';

const fs = vscode.workspace.fs;
const dec = new TextDecoder();

export async function setContext() {
    if (!wsp.first()) {
        return;
    }

    vscode.commands.executeCommand('setContext', 'quick.gitmodules', [vscode.Uri.joinPath(wsp.first()!.uri, '.gitmodules').fsPath]);
    vscode.commands.executeCommand('setContext', 'quick.submodules', await list(wsp.first()!.uri, vscode.Uri.file('.gitmodules')));
}

export async function add() {
    if (!wsp.first()) {
        vscode.window.showErrorMessage('Invalid workspace');
        return;
    }

    let reposit = (await vscode.window.showInputBox({ prompt: 'Input repository link', value: vscode.workspace.getConfiguration('quick').get<string>('defaultGitService') }))?.trim();
    if (!reposit || 0 == reposit.length) {
        return;
    }

    let name = reposit.substring(reposit.lastIndexOf('/') + 1);
    name = name.substring(0, name.lastIndexOf('.git'));

    let path = (await vscode.window.showInputBox({ prompt: 'Input the path where module to be placed', value: 'Submodules/' + name }))?.trim();
    if (!path || 0 == path.length) {
        return;
    }

    vscode.window.showInformationMessage('Adding submodule ' + path);

    return new Promise<void>((resolve, reject)=>{
        chp.exec('git submodule add ' + reposit + ' ' + path, { cwd: wsp.first()!.uri.fsPath }, (error, stdout, stderr)=>{
            if (error?.code) {
                vscode.window.showErrorMessage('Failed to add submodule');
                ext.output(stderr);
                resolve();
                return;
            }

            vscode.window.showInformationMessage('Submodule ' + path + ' has been added');
            resolve();
        });
    });
}

export async function pull(uri: vscode.Uri) {
    let relative = wsp.relative(uri);
    if (!relative) {
        return;
    }

    vscode.window.showInformationMessage('Pulling submudule ' + relative);

    return new Promise<void>((resolve, reject)=>{
        chp.exec('git pull -r', { cwd: uri.fsPath }, (error, stdout, stderr)=>{
            if (error?.code) {
                vscode.window.showErrorMessage('Failed to pull submodule');
                ext.output(stderr);
                resolve();
                return;
            }

            vscode.window.showInformationMessage('Submodule ' + relative + ' has been pulled');
            resolve();
        });
    });
}

export async function update(uri: vscode.Uri) {
    if (!uri.path.endsWith('/.gitmodules')) {
        vscode.window.showErrorMessage('Invalid git module filename');
        return;
    }

    if (!wsp.first()) {
        vscode.window.showErrorMessage('.gitmodules is not in default workspace');
        return;
    }

    if (uri.path != vscode.Uri.joinPath(wsp.first()!.uri, '.gitmodules').path) {
        vscode.window.showErrorMessage('.gitmodules is not in default workspace');
        return;
    }

    let modules = await list(wsp.first()!.uri, vscode.Uri.file('.gitmodules'));
    if (0 == modules.length) {
        vscode.window.showInformationMessage('No submodule found in .gitmodules');
        return;
    }

    vscode.window.showInformationMessage('Updating submodules');

    let success = true;
    await Promise.all(modules.map(module=>new Promise<void>((resolve, rejuect)=>{
        chp.exec('git submodule update --init ' + module, { cwd: wsp.first()!.uri.fsPath }, (error, stdout, stderr)=>{
            if (error?.code) {
                success = false;
                vscode.window.showErrorMessage('Failed to update submodule ' + module);
                ext.output(stderr);
            }

            resolve();
        });
    })));

    if (success) {
        vscode.window.showInformationMessage('Submodules have been updated');
    }
}

export async function remove(uri: vscode.Uri) {
    let relative = wsp.relative(uri);
    if (!relative) {
        return;
    }

    vscode.window.showInformationMessage('Removing submodule ' + relative);

    return new Promise<void>((resolve, reject)=>{
        chp.exec('git rm -f ' + uri.fsPath, { cwd: wsp.first()!.uri.fsPath }, async(error, stdout, stderr)=>{
            if (error?.code) {
                vscode.window.showErrorMessage('Failed to remove submodule');
                ext.output(stderr);
                resolve();
                return;
            }

            let trace = vscode.Uri.file(wsp.first()!.uri.fsPath + '/.git/modules/' + relative);
            try {
                await fs.delete(trace, { recursive: true });
            } catch (e) {
                ext.output('' + e);
            }

            chp.exec('git config --local --remove-section submodule.' + relative, {cwd: wsp.first()!.uri.fsPath}, (error, stdout, stderr)=>{
                if (error?.code) {
                    vscode.window.showErrorMessage('Failed to delete config section');
                    ext.output(stderr);
                    return;
                }

                vscode.window.showInformationMessage('Submodule ' + relative + ' has been removed');
                resolve();
            });
        });
    });
}

async function list(folder: vscode.Uri, file: vscode.Uri) {
    let modules : string[] = [];

    let path = vscode.Uri.joinPath(folder, file.path);
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
            let uri = vscode.Uri.joinPath(folder, result[1]);
            modules.push(uri.fsPath);
        }
    });

    return modules;
}