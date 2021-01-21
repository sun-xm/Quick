import { TextDecoder, TextEncoder } from 'util';
import * as vscode from 'vscode';

export async function cmakeConsole(context: vscode.ExtensionContext) {
    if (undefined != vscode.workspace.name && undefined != vscode.workspace.workspaceFolders) {
        let nm = vscode.workspace.name;
        let ws = vscode.workspace.workspaceFolders[0].uri.path;

        let uri: vscode.Uri;
        let res = '/res/cmake/console';

        let decoder = new TextDecoder();
        let encoder = new TextEncoder();
        
        let content: string;
        content = decoder.decode(await vscode.workspace.fs.readFile(vscode.Uri.file(context.extensionUri.path + res + '/CMakeLists.txt')));
        content = content.replace('__name__', nm);

        uri = vscode.Uri.file(ws + '/CMakeLists.txt');
        await vscode.workspace.fs.writeFile(uri, encoder.encode(content));

        vscode.window.showTextDocument(uri, { preview: false });

        await vscode.workspace.fs.copy(vscode.Uri.file(context.extensionUri.path + res + '/main.cpp'),
                                       vscode.Uri.file(ws + '/main.cpp'), { overwrite: true });

        vscode.window.showInformationMessage(`CMake console project "${nm}" created`);
    }
    else {
        vscode.window.showErrorMessage('Workspace folder is undefined')
    }
}

export async function cmakeQtWidgets(context: vscode.ExtensionContext) {
    if (undefined != vscode.workspace.name && undefined != vscode.workspace.workspaceFolders) {
        let nm = vscode.workspace.name;
        let ws = vscode.workspace.workspaceFolders[0].uri.path;

        let uri: vscode.Uri;
        let res = '/res/cmake/qtWidgets';

        let decoder = new TextDecoder();
        let encoder = new TextEncoder();
        
        let content: string;
        content = decoder.decode(await vscode.workspace.fs.readFile(vscode.Uri.file(context.extensionUri.path + res + '/CMakeLists.txt')));
        content = content.replace('__name__', nm);

        uri = vscode.Uri.file(ws + '/CMakeLists.txt');
        await vscode.workspace.fs.writeFile(uri, encoder.encode(content));

        vscode.window.showTextDocument(uri, { preview: false });

        await vscode.workspace.fs.copy(vscode.Uri.file(context.extensionUri.path + res + '/main.cpp'),
                                       vscode.Uri.file(ws + '/main.cpp'), { overwrite: true });

        await vscode.workspace.fs.copy(vscode.Uri.file(context.extensionUri.path + res + '/mainwindow.cpp'),
                                       vscode.Uri.file(ws + '/mainwindow.cpp'), { overwrite: true });

        await vscode.workspace.fs.copy(vscode.Uri.file(context.extensionUri.path + res + '/mainwindow.h'),
                                       vscode.Uri.file(ws + '/mainwindow.h'), { overwrite: true });

        await vscode.workspace.fs.copy(vscode.Uri.file(context.extensionUri.path + res + '/mainwindow.ui'),
                                       vscode.Uri.file(ws + '/mainwindow.ui'), { overwrite: true });

        vscode.window.showInformationMessage(`CMake Qt Widgets project "${nm}" created`);
    }
    else {
        vscode.window.showErrorMessage('Workspace folder is undefined')
    }
}

export async function cmakeViewWindow(context: vscode.ExtensionContext) {
    if (undefined != vscode.workspace.name && undefined != vscode.workspace.workspaceFolders) {
        let nm = vscode.workspace.name;
        let ws = vscode.workspace.workspaceFolders[0].uri.path;

        let uri: vscode.Uri;
        let res = '/res/cmake/view';

        let decoder = new TextDecoder();
        let encoder = new TextEncoder();
        
        let content: string;
        content = decoder.decode(await vscode.workspace.fs.readFile(vscode.Uri.file(context.extensionUri.path + res + '/CMakeLists.txt.win')));
        content = content.replace('__name__', nm);

        uri = vscode.Uri.file(ws + '/CMakeLists.txt');
        await vscode.workspace.fs.writeFile(uri, encoder.encode(content));

        vscode.window.showTextDocument(uri, { preview: false });

        await vscode.workspace.fs.copy(vscode.Uri.file(context.extensionUri.path + res + '/View'),
                                       vscode.Uri.file(ws + '/View'), { overwrite: true });

        await vscode.workspace.fs.copy(vscode.Uri.file(context.extensionUri.path + res + '/Application.h.win'),
                                       vscode.Uri.file(ws + '/Application.h'), { overwrite: true });

        await vscode.workspace.fs.copy(vscode.Uri.file(context.extensionUri.path + res + '/Application.cpp.win'),
                                       vscode.Uri.file(ws + '/Application.cpp'), { overwrite: true });

        vscode.window.showInformationMessage(`CMake View window project "${nm}" created`);
    }
    else {
        vscode.window.showErrorMessage('Workspace folder is undefined')
    }
}