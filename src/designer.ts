import * as process from 'child_process';
import * as vscode from 'vscode';
import * as config from './config';
import * as extension from './extension';

export async function openUiFile(uri: vscode.Uri) {
    let designer = config.designerPath();

    if (!designer || !await exists(designer)) {
        let paths = await vscode.window.showOpenDialog({ canSelectMany: false, title: 'Choose Qt Designer path' });
        if (!paths) {
            return;
        }

        designer = paths[0].fsPath;

        if (!designer) {
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
                config.setDesignerPath(designer, vscode.ConfigurationTarget.Global);
                break;
            }

            case 1: {
                config.setDesignerPath(designer, vscode.ConfigurationTarget.Workspace);
                break;
            }

            default: {
                break;
            }
        }
    }

    process.exec(designer + ' ' + uri.fsPath, (error, stdout, stderr)=>{
        if (error?.code) {
            extension.output(stderr);
        }
    });
}

async function exists(path: string) {
    try {
        await vscode.workspace.fs.stat(vscode.Uri.file(path));
        return true;
    } catch {
        return false;
    }
}