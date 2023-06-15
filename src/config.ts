import * as vscode from 'vscode';

export function defaultGitService() {
    return vscode.workspace.getConfiguration('quick').get<string>('defaultGitService')?.trim();
}

export function designerPath() {
    return vscode.workspace.getConfiguration('quick').get<string>('designerPath')?.trim();
}

export function setDesignerPath(path: string, target: vscode.ConfigurationTarget) {
    vscode.workspace.getConfiguration('quick').update('designerPath', path, target);
}