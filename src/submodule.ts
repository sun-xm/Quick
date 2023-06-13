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

    let gitmodules = vscode.Uri.joinPath(wsp.first()!.uri, '.gitmodules');
    let modules = (await list(gitmodules)).map(module=>{
        return vscode.Uri.joinPath(wsp.first()!.uri, module.path!).fsPath;
    });

    vscode.commands.executeCommand('setContext', 'quick.gitmodules', [gitmodules.fsPath]);
    vscode.commands.executeCommand('setContext', 'quick.submodules', modules);
}

export async function add() {
    if (!wsp.first()) {
        vscode.window.showErrorMessage('Invalid workspace');
        return;
    }

    let reposit = (await vscode.window.showInputBox({ prompt: 'Input repository link', value: vscode.workspace.getConfiguration('quick').get<string>('defaultGitService') }))?.trim();
    if (!reposit?.length) {
        return;
    }

    let branch = (await vscode.window.showInputBox({ prompt: 'Input remote branch'}));
    if (!branch?.length) {
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
        chp.exec('git submodule add -b ' + branch + ' ' + reposit + ' ' + path, { cwd: wsp.first()!.uri.fsPath }, (error, stdout, stderr)=>{
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

export async function initAll() {
    if (!wsp.first()) {
        vscode.window.showErrorMessage('.gitmodules is not in default workspace');
        return;
    }

    let gitmodules = vscode.Uri.joinPath(wsp.first()!.uri, '.gitmodules');

    let modules = await list(gitmodules);
    if (!modules?.length) {
        vscode.window.showInformationMessage('No submodule found in .gitmodules');
        return;
    }

    vscode.window.showInformationMessage('Initializing submodules');

    let success = true;
    await Promise.all(modules.map(module=>new Promise<void>((resolve, rejuect)=>{
        chp.exec('git submodule update --init ' + module.path, { cwd: wsp.first()!.uri.fsPath }, (error, stdout, stderr)=>{
            if (error?.code) {
                success = false;
                vscode.window.showErrorMessage('Failed to initialize submodule ' + module.name);
                ext.output(stderr);
                resolve();
                return;
            }

            if (!module.branch) {
                resolve();
                return;
            }

            chp.exec('git checkout ' + module.branch, { cwd: vscode.Uri.joinPath(wsp.first()!.uri, module.path!).fsPath }, (error, stdout, stderr)=>{
                if (error?.code) {
                    vscode.window.showWarningMessage('Failed to checkout branch ' + module.branch + ' for submodule ' + module.name);
                    ext.output(stderr);
                }

                resolve();
            });
        });
    })));

    if (success) {
        vscode.window.showInformationMessage('Submodules have been initialized');
    }
}

export async function updateAll() {
    if (!wsp.first()) {
        return;
    }

    vscode.window.showInformationMessage('Updating submodules');

    return new Promise<void>((resolve, reject)=>{
        chp.exec('git submodule update --remote --rebase', { cwd: wsp.first()!.uri.fsPath }, (error, stdout, stderr)=>{
            if (error?.code) {
                vscode.window.showErrorMessage('Failed to update submodules');
                ext.output(stderr);

            } else {
                vscode.window.showInformationMessage('Submodules have been updated');
            }

            resolve();
        });
    });
}

export async function update(uri: vscode.Uri) {
    let relative = wsp.relative(uri);
    if (!relative) {
        return;
    }

    vscode.window.showInformationMessage('Updating submudule ' + relative);

    return new Promise<void>((resolve, reject)=>{
        chp.exec('git submodule update --remote --rebase ' + relative, { cwd: wsp.first()!.uri.fsPath }, (error, stdout, stderr)=>{
            if (error?.code) {
                vscode.window.showErrorMessage('Failed to update submodule');
                ext.output(stderr);
                resolve();
                return;
            }

            vscode.window.showInformationMessage('Submodule ' + relative + ' has been updated');
            resolve();
        });
    });
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

class Module {
    name:   string | undefined;
    path:   string | undefined;
    url:    string | undefined;
    branch: string | undefined;
}

export async function list(file: vscode.Uri) {
    let modules: Module[] = [];

    try {
        await fs.stat(file);
    } catch {
        return modules;
    }

    const name = /\[submodule \"(.+)\"\]\s*/;
    const path = /\s*path\s*=\s*(.+)\s*/;
    const url  = /\s*url\s*=\s*(.+)\s*/;
    const branch = /\s*branch\s*=\s*(.+)\s*/;

    let lines = dec.decode(await fs.readFile(file)).split('\n');
    lines.forEach(line=>{
        let match = name.exec(line);
        if (match) {
            let m = new Module();
            m.name = match[1];
            modules.push(m);
            return;
        }

        match = path.exec(line);
        if (match) {
            modules[modules.length - 1].path = match[1];
            return;
        }

        match = url.exec(line);
        if (match) {
            modules[modules.length - 1].url = match[1];
            return;
        }

        match = branch.exec(line);
        if (match) {
            modules[modules.length - 1].branch = match[1];
        }
    });

    return modules;
}