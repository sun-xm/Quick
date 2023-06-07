import * as vscode from 'vscode';

export function first() {
    if (!vscode.workspace.workspaceFolders || 0 == vscode.workspace.workspaceFolders.length) {
        return null;
    }

    return vscode.workspace.workspaceFolders[0];
}