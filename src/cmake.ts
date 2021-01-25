import * as vscode from 'vscode';
import { copyDirect, copyText } from './copy'

async function isEmpty(folder: vscode.Uri) {
    return 0 == (await vscode.workspace.fs.readDirectory(folder)).length;
}

export async function cmakeConsole(context: vscode.ExtensionContext) {
    if (undefined != vscode.workspace.name && 
        undefined != vscode.workspace.workspaceFolders &&
        await isEmpty(vscode.workspace.workspaceFolders[0].uri)) {

        let nm = vscode.workspace.name;
        let ws = vscode.workspace.workspaceFolders[0].uri.path;

        let res = context.extensionUri.path + '/res/cmake/console';
        
        await copyText(`${res}/CMakeLists.txt`, `${ws}/CMakeLists.txt`, [[/__name__/g, nm]]);
        vscode.window.showTextDocument(vscode.Uri.file(`${ws}/CMakeLists.txt`), { preview: false });

        await copyText(`${res}/main.cpp`, `${ws}/main.cpp`);

        vscode.window.showInformationMessage(`CMake console project "${nm}" created`);
    }
    else {
        vscode.window.showErrorMessage('Workspace folder is undefined or not empty')
    }
}

export async function cmakeQtWidgets(context: vscode.ExtensionContext) {
    if (undefined != vscode.workspace.name && 
        undefined != vscode.workspace.workspaceFolders &&
        await isEmpty(vscode.workspace.workspaceFolders[0].uri)) {

        let nm = vscode.workspace.name;
        let ws = vscode.workspace.workspaceFolders[0].uri.path;

        let res = context.extensionUri.path + '/res/cmake/qtWidgets';

        await copyText(`${res}/CMakeLists.txt`, `${ws}/CMakeLists.txt`, [[/__name__/g, nm]]);
        vscode.window.showTextDocument(vscode.Uri.file(`${ws}/CMakeLists.txt`), { preview: false });

        await copyText(`${res}/main.cpp`,       `${ws}/main.cpp`);
        await copyText(`${res}/mainwindow.cpp`, `${ws}/mainwindow.cpp`);
        await copyText(`${res}/mainwindow.h`,   `${ws}/mainwindow.h`);
        await copyText(`${res}/mainwindow.ui`,  `${ws}/mainwindow.ui`);

        vscode.window.showInformationMessage(`CMake Qt Widgets project "${nm}" created`);
    }
    else {
        vscode.window.showErrorMessage('Workspace folder is undefined')
    }
}

export async function cmakeW32View(context: vscode.ExtensionContext) {
    if (undefined != vscode.workspace.name && 
        undefined != vscode.workspace.workspaceFolders &&
        await isEmpty(vscode.workspace.workspaceFolders[0].uri)) {

        let nm = vscode.workspace.name;
        let ws = vscode.workspace.workspaceFolders[0].uri.path;
        let res = context.extensionUri.path + '/res/cmake/view';
        let type = await vscode.window.showQuickPick(['Window', 'Dialog']);
        
        if (undefined == type) {
            return;
        }

        await copyDirect(`${res}/View`, `${ws}/View`);

        switch (type) {
            case 'Window': {
                res += '/Window';
                break;
            }
            
            case 'Dialog': {
                res += '/Dialog';
                await copyText(`${res}/resource.h`, `${ws}/resource.h`, [[/__name__/g, nm]]);
                await copyDirect(`${res}/Application.rc`,  `${ws}/${nm}.rc`);
                break;
            }

            default: break;
        }

        await copyText(`${res}/CMakeLists.txt`, `${ws}/CMakeLists.txt`, [[/__name__/g, nm]]);
        vscode.window.showTextDocument(vscode.Uri.file(`${ws}/CMakeLists.txt`), { preview: false });

        await copyText(`${res}/Application.h`, `${ws}/Application.h`);
        await copyText(`${res}/Application.cpp`, `${ws}/Application.cpp`);

        vscode.window.showInformationMessage(`CMake Win32 View ${type.toLowerCase()} project "${nm}" created`);
    }
    else {
        vscode.window.showErrorMessage('Workspace folder is undefined')
    }
}