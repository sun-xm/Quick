import { TextDecoder, TextEncoder } from 'util';
import * as vscode from 'vscode';
import { isEmpty, copy, copyReplace } from './copy'

export async function cmakeConsole(context: vscode.ExtensionContext) {
    if (undefined != vscode.workspace.name && 
        undefined != vscode.workspace.workspaceFolders &&
        await isEmpty(vscode.workspace.workspaceFolders[0].uri)) {

        let nm = vscode.workspace.name;
        let ws = vscode.workspace.workspaceFolders[0].uri.path;

        let res = context.extensionUri.path + '/res/cmake/console';
        
        await copyReplace(`${res}/CMakeLists.txt`, `${ws}/CMakeLists.txt`, [[/__name__/g, nm]]);
        vscode.window.showTextDocument(vscode.Uri.file(`${ws}/CMakeLists.txt`), { preview: false });

        await copy(`${res}/main.cpp`, `${ws}/main.cpp`);

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

        await copyReplace(`${res}/CMakeLists.txt`, `${ws}/CMakeLists.txt`, [[/__name__/g, nm]]);
        vscode.window.showTextDocument(vscode.Uri.file(`${ws}/CMakeLists.txt`), { preview: false });

        await copy(`${res}/main.cpp`,       `${ws}/main.cpp`);
        await copy(`${res}/mainwindow.cpp`, `${ws}/mainwindow.cpp`);
        await copy(`${res}/mainwindow.h`,   `${ws}/mainwindow.h`);
        await copy(`${res}/mainwindow.ui`,  `${ws}/mainwindow.ui`);

        vscode.window.showInformationMessage(`CMake Qt Widgets project "${nm}" created`);
    }
    else {
        vscode.window.showErrorMessage('Workspace folder is undefined')
    }
}

export async function cmakeViewWindow(context: vscode.ExtensionContext) {
    if (undefined != vscode.workspace.name && 
        undefined != vscode.workspace.workspaceFolders &&
        await isEmpty(vscode.workspace.workspaceFolders[0].uri)) {

        let nm = vscode.workspace.name;
        let ws = vscode.workspace.workspaceFolders[0].uri.path;

        let res = context.extensionUri.path + '/res/cmake/view';
        await copy(`${res}/View`, `${ws}/View`);

        res = res + '/Window';

        await copyReplace(`${res}/CMakeLists.txt`, `${ws}/CMakeLists.txt`, [[/__name__/g, nm]]);
        vscode.window.showTextDocument(vscode.Uri.file(`${ws}/CMakeLists.txt`), { preview: false });

        await copy(`${res}/Application.h`, `${ws}/Application.h`);
        await copy(`${res}/Application.cpp`, `${ws}/Application.cpp`);

        vscode.window.showInformationMessage(`CMake View window project "${nm}" created`);
    }
    else {
        vscode.window.showErrorMessage('Workspace folder is undefined')
    }
}

export async function cmakeViewDialog(context: vscode.ExtensionContext) {
    if (undefined != vscode.workspace.name && 
        undefined != vscode.workspace.workspaceFolders &&
        await isEmpty(vscode.workspace.workspaceFolders[0].uri)) {

        let nm = vscode.workspace.name;
        let ws = vscode.workspace.workspaceFolders[0].uri.path;

        let res = context.extensionUri.path + '/res/cmake/view';
        await copy(`${res}/View`, `${ws}/View`);

        res = res + '/Dialog'

        await copyReplace(`${res}/CMakeLists.txt`, `${ws}/CMakeLists.txt`, [[/__name__/g, nm]]);
        vscode.window.showTextDocument(vscode.Uri.file(`${ws}/CMakeLists.txt`), { preview: false });

        await copyReplace(`${res}/resource.h`, `${ws}/resource.h`, [[/__name__/g, nm]]);

        await copy(`${res}/Application.h`,   `${ws}/Application.h`);
        await copy(`${res}/Application.cpp`, `${ws}/Application.cpp`);
        await copy(`${res}/Application.rc`,  `${ws}/${nm}.rc`);

        vscode.window.showInformationMessage(`CMake View dialog project "${nm}" created`);
    }
    else {
        vscode.window.showErrorMessage('Workspace folder is undefined')
    }
}