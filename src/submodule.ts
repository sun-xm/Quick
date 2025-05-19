import { TextDecoder } from 'util';
import * as vscode from 'vscode';
import * as chp from 'child_process';
import * as cfg from './config';
import * as ext from './extension';
import * as wsp from './workspace';

const fs = vscode.workspace.fs;
const dec = new TextDecoder();

export function monitor(context: vscode.ExtensionContext) {
    if (!wsp.first()) {
        return;
    }

    const watcher = vscode.workspace.createFileSystemWatcher(vscode.Uri.joinPath(wsp.first()!.uri, '.gitmodules').fsPath);
    watcher.onDidChange(()=>setContext());
    watcher.onDidCreate(()=>setContext());
    watcher.onDidDelete(()=>setContext());
    context.subscriptions.push(watcher);

    setContext();
}

export async function add() {
    if (!wsp.first()) {
        vscode.window.showErrorMessage('Invalid workspace');
        return;
    }

    let reposit = (await vscode.window.showInputBox({ prompt: 'Input repository link', value: cfg.defaultGitService() }))?.trim();
    if (!reposit) {
        return;
    }

    let branch = (await vscode.window.showInputBox({ prompt: 'Input remote branch', value: 'master' }))?.trim();
    if (!branch) {
        return;
    }

    let name = reposit.substring(reposit.lastIndexOf('/') + 1);
    name = name.substring(0, name.lastIndexOf('.git'));

    let path = (await vscode.window.showInputBox({ prompt: 'Input the path where module to be placed', value: `Modules/${name}` }))?.trim();
    if (!path || 0 == path.length) {
        return;
    }

    let status = vscode.window.createStatusBarItem();
    status.text = `$(sync~spin) Adding submodule ${path}`;
    status.show();

    return new Promise<void>(resolve=>{
        chp.exec(`git submodule add -b ${branch} ${reposit} ${path}`, { cwd: wsp.first()!.uri.fsPath }, (error, stdout, stderr)=>{
            if (error?.code) {
                vscode.window.showErrorMessage('Failed to add submodule');
                ext.output(stderr);
                status.hide();
                resolve();
                return;
            }

            vscode.window.showInformationMessage(`Submodule ${path} has been added`);
            status.hide();
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

    let status = vscode.window.createStatusBarItem();
    status.text = '$(sync~spin) Initializing submodules';
    status.show();

    let success = true;

    await new Promise<void>(resolve=>{
        chp.exec('git submodule update --init --no-fetch', { cwd: wsp.first()!.uri.fsPath }, (error, stdout, stderr)=>{
            if (error?.code) {
                vscode.window.showErrorMessage('Failed to initialize submodules');
                ext.output(stderr);
                success = false;
            }
            resolve();
        });
    });

    if (success) {
        for (let module of modules) {
            if (module.branch) {
                status.text = `$(sync~spin) Checking out branch ${module.branch} for submodule ${module.name}`;
                status.show();

                let path = vscode.Uri.joinPath(wsp.first()!.uri, module.path!).fsPath;
                await new Promise<void>(resolve=>{
                    chp.exec(`git checkout ${module.branch}`, { cwd: path }, (error, stdout, stderr)=>{
                        if (error?.code) {
                            vscode.window.showErrorMessage(`Failed to check out branch ${module.branch} for submodule ${module.name}`);
                            ext.output(stderr);
                            success = false;
                        }
                        resolve();
                    });
                });
            }
        }
    }

    if (success) {
        vscode.window.showInformationMessage('Submodules have been initialized');
    }

    status.hide();
}

export async function init() {
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

    let items = modules.map(m=>new ModuleItem(m.name!, m));
    if (undefined == items) {
        console.error('Failed to pick up module items');
        return;
    }

    let item = await vscode.window.showQuickPick(items, { title: 'Pick up submodule to initialize'}) as ModuleItem;
    if (!item) {
        return;
    }

    let status = vscode.window.createStatusBarItem();
    status.text = `$(sync~spin) Initializing submodule ${item.module.name}`;
    status.show();

    let success = true;
    await new Promise<void>(resolve=>{
        chp.exec(`git submodule update --init --no-fetch ${item.module.path}`, { cwd: wsp.first()!.uri.fsPath }, (error, stdout, stderr)=>{
            if (error?.code) {
                vscode.window.showErrorMessage(`Failed to initialize submodule ${item.module.name}`);
                ext.output(stderr);
                success = false;
            }
            resolve();
        });
    });

    if (success && item.module.branch) {
        status.text = `$(sync~spin) Checking out branch ${item.module.branch} for submodule ${item.module.name}`;
        status.show();

        await new Promise<void>(resolve=>{
            let path = vscode.Uri.joinPath(wsp.first()!.uri, item.module.path!).fsPath;
            chp.exec(`git checkout ${item.module.branch}`, { cwd: path }, (error, stdout, stderr)=>{
                if (error?.code) {
                    vscode.window.showErrorMessage(`Failed to check out branch ${item.module.branch} for submodule ${item.module.name}`);
                    ext.output(stderr);
                    success = false;
                }
                resolve();
            });
        });
    }

    if (success) {
        vscode.window.showInformationMessage(`Submodule ${item.module.name} has been initialized`);
    }

    status.hide();
}

export async function updateAll() {
    if (!wsp.first()) {
        return;
    }

    let status = vscode.window.createStatusBarItem();
    status.text = '$(sync~spin) Updating submodules';
    status.show();

    await new Promise<void>(resolve=>{
        chp.exec('git submodule update --remote --rebase', { cwd: wsp.first()!.uri.fsPath }, (error, stdout, stderr)=>{
            if (error?.code) {
                vscode.window.showErrorMessage('Failed to update submodules');
                ext.output(stderr);

            } else {
                vscode.window.showInformationMessage('Submodules have been updated');
            }

            status.hide();
            resolve();
        });
    });
}

export async function update(uri: vscode.Uri) {
    let relative = wsp.relative(uri);
    if (!relative) {
        return;
    }

    let status = vscode.window.createStatusBarItem();
    status.text = `$(sync~spin) Updating submodule ${relative}`;
    status.show();

    await new Promise<void>(resolve=>{
        chp.exec(`git submodule update --remote --rebase ${relative}`, { cwd: wsp.first()!.uri.fsPath }, (error, stdout, stderr)=>{
            if (error?.code) {
                vscode.window.showErrorMessage('Failed to update submodule');
                ext.output(stderr);
            } else {
                vscode.window.showInformationMessage(`Submodule ${relative} has been updated`);
            }

            status.hide();
            resolve();
        });
    });
}

export async function remove(uri: vscode.Uri) {
    let relative = wsp.relative(uri);
    if (!relative) {
        return;
    }

    let status = vscode.window.createStatusBarItem();
    status.text = `$(sync~spin) Removing submodule ${relative}`;
    status.show();

    await new Promise<void>(resolve=>{
        chp.exec(`git rm -f ${uri.fsPath}`, { cwd: wsp.first()!.uri.fsPath }, async(error, stdout, stderr)=>{
            if (error?.code) {
                vscode.window.showErrorMessage('Failed to remove submodule');
                ext.output(stderr);
                status.hide();
                resolve();
                return;
            }

            let trace = vscode.Uri.file(wsp.first()!.uri.fsPath + `/.git/modules/${relative}`);
            try {
                await fs.delete(trace, { recursive: true });
            } catch (e) {
                ext.output(`${e}`);
            }

            chp.exec(`git config --local --remove-section submodule.${relative}`, {cwd: wsp.first()!.uri.fsPath}, (error, stdout, stderr)=>{
                if (error?.code) {
                    vscode.window.showErrorMessage('Failed to delete config section');
                    ext.output(stderr);
                } else {
                    vscode.window.showInformationMessage(`Submodule ${relative} has been removed`);
                }

                status.hide();
                resolve();
            });
        });
    });
}

async function setContext() {
    let gitmodules = vscode.Uri.joinPath(wsp.first()!.uri, '.gitmodules');
    let modules = (await list(gitmodules)).map(module=>{
        return vscode.Uri.joinPath(wsp.first()!.uri, module.path!).fsPath;
    });

    vscode.commands.executeCommand('setContext', 'quick.gitmodules', [gitmodules.fsPath]);
    vscode.commands.executeCommand('setContext', 'quick.submodules', modules);
}

async function list(file: vscode.Uri) {
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

class Module {
    name:   string | undefined;
    path:   string | undefined;
    url:    string | undefined;
    branch: string | undefined;
}

class ModuleItem implements vscode.QuickPickItem {
    constructor(label: string, module: Module) {
        this.label  = label;
        this.module = module;
    }

    label:  string;
    module: Module;
}