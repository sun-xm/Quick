import * as process from 'child_process';
import * as vscode from 'vscode';

export function openUiFile(uri: vscode.Uri) {
    process.exec(vscode.workspace.getConfiguration('quick').get<string>('designerPath') + ' ' + uri.fsPath);
}