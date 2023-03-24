import * as vscode from 'vscode';
import { copyDirect, copyText } from './copy'

async function isEmpty(folder: vscode.Uri) {
    return 0 == (await vscode.workspace.fs.readDirectory(folder)).length;
}

async function isWorkspaceValid() {
    return undefined != vscode.workspace.name && undefined != vscode.workspace.workspaceFolders && await isEmpty(vscode.workspace.workspaceFolders[0].uri);
}

export async function cmakeConsole(context: vscode.ExtensionContext) {
    if (await isWorkspaceValid()) {
        let nm = (await vscode.window.showInputBox({ prompt: 'Input project name', value: vscode.workspace.name }))?.trim();
        if (undefined == nm || 0 == nm.length) {
            return;
        }

        let ws = vscode.workspace.workspaceFolders![0].uri.path;
        let rs = context.extensionUri.path + '/res/cmake/console';

        await copyText(`${rs}/CMakeLists.txt`, `${ws}/CMakeLists.txt`, [[/__name__/g, nm]]);
        vscode.window.showTextDocument(vscode.Uri.file(`${ws}/CMakeLists.txt`), { preview: false });

        await copyText(`${rs}/main.cpp`, `${ws}/main.cpp`);

        vscode.window.showInformationMessage(`CMake console project "${nm}" created`);
    }
    else {
        vscode.window.showErrorMessage('Workspace folder is undefined or not empty');
    }
}

export async function cmakeQtWidgets(context: vscode.ExtensionContext) {
    if (await isWorkspaceValid()) {
        let nm = (await vscode.window.showInputBox({ prompt: 'Input project name', value: vscode.workspace.name }))?.trim();
        if (undefined == nm || 0 == nm.length) {
            return;
        }

        let ws = vscode.workspace.workspaceFolders![0].uri.path;
        let rs = context.extensionUri.path + '/res/cmake/qtWidgets';

        await copyText(`${rs}/CMakeLists.txt`, `${ws}/CMakeLists.txt`, [[/__name__/g, nm]]);
        vscode.window.showTextDocument(vscode.Uri.file(`${ws}/CMakeLists.txt`), { preview: false });

        await copyText(`${rs}/main.cpp`,       `${ws}/main.cpp`);
        await copyText(`${rs}/mainwindow.cpp`, `${ws}/mainwindow.cpp`);
        await copyText(`${rs}/mainwindow.h`,   `${ws}/mainwindow.h`);
        await copyText(`${rs}/mainwindow.ui`,  `${ws}/mainwindow.ui`);

        vscode.window.showInformationMessage(`CMake Qt Widgets project "${nm}" created`);
    }
    else {
        vscode.window.showErrorMessage('Workspace folder is undefined or not empty');
    }
}

export async function cmakeW32View(context: vscode.ExtensionContext) {
    if (await isWorkspaceValid()) {

        let nm = (await vscode.window.showInputBox({ prompt: 'Input project name', value: vscode.workspace.name }))?.trim();
        if (undefined == nm || 0 == nm.length) {
            return;
        }
        let type = await vscode.window.showQuickPick(['Window', 'Dialog']);

        if (undefined == type) {
            return;
        }

        let ws = vscode.workspace.workspaceFolders![0].uri.path;
        let rs = context.extensionUri.path + '/res/cmake/view';

        await copyDirect(`${rs}/View`, `${ws}/View`);

        switch (type) {
            case 'Window': {
                rs += '/Window';
                break;
            }

            case 'Dialog': {
                rs += '/Dialog';
                await copyText(`${rs}/resource.h`, `${ws}/resource.h`, [[/__name__/g, nm]]);
                await copyDirect(`${rs}/Application.rc`,  `${ws}/${nm}.rc`);
                break;
            }

            default: break;
        }

        await copyText(`${rs}/CMakeLists.txt`, `${ws}/CMakeLists.txt`, [[/__name__/g, nm]]);
        vscode.window.showTextDocument(vscode.Uri.file(`${ws}/CMakeLists.txt`), { preview: false });

        await copyText(`${rs}/Application.h`, `${ws}/Application.h`);
        await copyText(`${rs}/Application.cpp`, `${ws}/Application.cpp`);

        vscode.window.showInformationMessage(`CMake Win32 View ${type.toLowerCase()} project "${nm}" created`);
    }
    else {
        vscode.window.showErrorMessage('Workspace folder is undefined or not empty');
    }
}

export async function cmakeCsConsole(context: vscode.ExtensionContext) {
    if (await isWorkspaceValid()) {
        let nm = (await vscode.window.showInputBox({ prompt: 'Input project name', value: vscode.workspace.name }))?.trim();
        if (undefined == nm || 0 == nm.length) {
            return;
        }

        let ws = vscode.workspace.workspaceFolders![0].uri.path;
        let rs = context.extensionUri.path + '/res/cmake/cs/console'

        await copyDirect(`${rs}/Properties`, `${ws}/Properties`);
        await copyText(`${rs}/CMakeLists.txt`, `${ws}/CMakeLists.txt`, [[/__name__/g, nm]]);
        vscode.window.showTextDocument(vscode.Uri.file(`${ws}/CMakeLists.txt`), { preview: false });

        await copyText(`${rs}/App.config`, `${ws}/App.config`);
        await copyText(`${rs}/Program.cs`, `${ws}/Program.cs`);

        vscode.window.showInformationMessage(`CMake C# console project "${nm}" created`);

    } else {
        vscode.window.showErrorMessage('Workspace folder is undefined or not empty');
    }
}

export async function cmakeCsWpf(context: vscode.ExtensionContext) {
    if (await isWorkspaceValid()) {
        let nm = (await vscode.window.showInputBox({ prompt: 'Input project name', value: vscode.workspace.name }))?.trim();
        if (undefined == nm || 0 == nm.length) {
            return;
        }

        let ws = vscode.workspace.workspaceFolders![0].uri.path;
        let rs = context.extensionUri.path + '/res/cmake/cs/wpf';

        await copyDirect(`${rs}/Properties`, `${ws}/Properties`)
        await copyText(`${rs}/CMakeLists.txt`, `${ws}/CMakeLists.txt`, [[/__name__/g, nm]]);
        vscode.window.showTextDocument(vscode.Uri.file(`${ws}/CMakeLists.txt`), { preview: false });

        await copyText(`${rs}/App.config`,  `${ws}/App.config`);
        await copyText(`${rs}/App.xaml`,    `${ws}/App.xaml`);
        await copyText(`${rs}/App.xaml.cs`, `${ws}/App.xaml.cs`);

        await copyText(`${rs}/MainWindow.xaml`,    `${ws}/MainWindow.xaml`);
        await copyText(`${rs}/MainWindow.xaml.cs`, `${ws}/MainWindow.xaml.cs`);

        vscode.window.showInformationMessage(`CMake C# WPF project "${nm}" created`);
    }
    else {
        vscode.window.showErrorMessage('Workspace folder is undefined or not empty');
    }
}