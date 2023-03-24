import * as process from 'child_process';
import * as vscode from 'vscode';

export async function openUiFile(uri: vscode.Uri) {
    let designer = vscode.workspace.getConfiguration('quick').get<string>('designerPath')?.trim();

    if (null == designer || 0 == designer.length) {
        let paths = await vscode.window.showOpenDialog({ canSelectMany: false });
        if (null != paths && paths.length > 0) {
            designer = paths[0].fsPath;
        }

        if (null == designer || 0 == designer.length) {
            vscode.window.showErrorMessage('Path to Qt Designer is not defined');
            return;
        }

        let option = await vscode.window.showQuickPick([
            { label: 'Save path to user settings', choice: 0 },
            { label: 'Save path to workspace settings', choice: 1 },
            { label: 'Do not save', choice: 2 }
        ]);

        switch (option?.choice) {
            case 0: {
                vscode.workspace.getConfiguration('quick').update('designerPath', designer, vscode.ConfigurationTarget.Global);
                break;
            }

            case 1: {
                vscode.workspace.getConfiguration('quick').update('designerPath', designer, vscode.ConfigurationTarget.Workspace);
                break;
            }

            default: {
                break;
            }
        }
    }

    process.exec(designer + ' ' + uri.fsPath);
}