import { TextEncoder } from 'util';
import * as vscode from 'vscode';

export async function cmakeConsole(context:vscode.ExtensionContext) {
    if (undefined != vscode.workspace.workspaceFolders) {
        let ws  = vscode.workspace.workspaceFolders[0].uri.path;

        let cmake = `\
cmake_minimum_required(VERSION 3.7)\n\
project(${vscode.workspace.name})\n\
add_executable(\${PROJECT_NAME} main.cpp)`

        let uri = vscode.Uri.file(ws + '/CMakeLists.txt');
        await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(cmake));
        vscode.window.showTextDocument(uri);

        let cpp = '\
#include "iostream"\n\n\
int main(int argc, char* argv[])\n\
{\n\
    std::cout << "Hello World!";\n\
}';
        
        uri = vscode.Uri.file(ws + '/main.cpp');
        await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(cpp));
        vscode.window.showTextDocument(uri, { preview: false });
        vscode.window.showInformationMessage(`CMake console project "${vscode.workspace.name}" created`)
    }
    else {
        vscode.window.showErrorMessage('Workspace folder is undefined')
    }
}