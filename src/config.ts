import * as vscode from 'vscode';

export function cleanupOnExit() {
    return get<boolean>('cleanupOnExit');
}

export function cleanAllOnExit() {
    return get<boolean>('cleanAllOnExit');
}

export function defaultGitService() {
    return get<string>('defaultGitService')?.trim();
}

export function designerPath() {
    return get<string>('designerPath')?.trim();
}

export function setDesignerPath(path: string, target: vscode.ConfigurationTarget) {
    set('designerPath', path, target);
}

export function panelAutoHide() {
    return get<boolean>('panelAutoHide');
}

export function enableUnchange() {
    return get<boolean>('enableUnchange');
}

function get<T>(name: string) {
    return vscode.workspace.getConfiguration('quick').get<T>(name);
}

function set<T>(name: string, value: T, target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global) {
    vscode.workspace.getConfiguration('quick').update(name, value, target);
}