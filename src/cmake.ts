import { TextDecoder, TextEncoder } from 'util';
import * as vscode from 'vscode';

export async function cmakeConsole(context:vscode.ExtensionContext) {
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

        content = decoder.decode(await vscode.workspace.fs.readFile(vscode.Uri.file(context.extensionUri.path + res + '/main.cpp')));

        uri = vscode.Uri.file(ws + '/main.cpp');
        await vscode.workspace.fs.writeFile(uri, encoder.encode(content));

        vscode.window.showTextDocument(uri, { preview: false });
        vscode.window.showInformationMessage(`CMake console project "${nm}" created`);
    }
    else {
        vscode.window.showErrorMessage('Workspace folder is undefined')
    }
}