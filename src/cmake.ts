import * as vscode from 'vscode';
import * as wsp from './workspace';
import { copyDirect, copyText, listFiles } from './copy';

async function isEmpty(folder: vscode.Uri) {
    return 0 == (await vscode.workspace.fs.readDirectory(folder)).length;
}

async function isWorkspaceValid() {
    return wsp.first() && await isEmpty(wsp.first()!.uri);
}

export async function console(context: vscode.ExtensionContext) {
    if (!await isWorkspaceValid) {
        vscode.window.showErrorMessage('Workspace folder is undefined or not empty');
        return;
    }

    let nm = (await vscode.window.showInputBox({ prompt: 'Input project name', value: vscode.workspace.name }))?.trim();
    if (!nm) {
        return;
    }

    let ws = wsp.first()!.uri.path;
    let rs = context.extensionUri.path + '/res/cmake/console';

    await copyText(`${rs}/CMakeLists.txt`, `${ws}/CMakeLists.txt`, [[/__name__/g, nm]]);
    vscode.window.showTextDocument(vscode.Uri.file(`${ws}/CMakeLists.txt`), { preview: false });

    await copyText(`${rs}/main.cpp`, `${ws}/main.cpp`);

    vscode.window.showInformationMessage(`CMake console project "${nm}" created`);
}

export async function qtWidgets(context: vscode.ExtensionContext) {
    if (!await isWorkspaceValid) {
        vscode.window.showErrorMessage('Workspace folder is undefined or not empty');
        return;
    }

    let nm = (await vscode.window.showInputBox({ prompt: 'Input project name', value: vscode.workspace.name }))?.trim();
    if (!nm) {
        return;
    }

    let ws = vscode.workspace.workspaceFolders![0].uri.path;
    let rs = context.extensionUri.path + '/res/cmake/qtWidgets';

    await copyText(`${rs}/CMakeLists.txt`, `${ws}/CMakeLists.txt`, [[/__name__/g, nm]]);
    vscode.window.showTextDocument(vscode.Uri.file(`${ws}/CMakeLists.txt`), { preview: false });

    let src = ['main.cpp',
                'mainwindow.h',
                'mainwindow.cpp',
                'mainwindow.ui'];

    src.forEach(async file=>{
        await copyText(`${rs}/${file}`, `${ws}/${file}`);
    });

    vscode.window.showInformationMessage(`CMake Qt Widgets project "${nm}" created`);
}

export async function w32View(context: vscode.ExtensionContext) {
    if (!await isWorkspaceValid()) {
        vscode.window.showErrorMessage('Workspace folder is undefined or not empty');
        return;
    }

    let nm = (await vscode.window.showInputBox({ prompt: 'Input project name', value: vscode.workspace.name }))?.trim();
    if (!nm) {
        return;
    }

    let type = await vscode.window.showQuickPick(['Window', 'Dialog']);
    if (!type) {
        return;
    }

    let ws = wsp.first()!.uri.path;
    let rs = context.extensionUri.path + '/res/cmake/win32';

    let src = await listFiles(`${rs}/W32`);
    src.forEach(async file=>{
        await copyText(`${rs}/W32/${file}`, `${ws}/W32/${file}`);
    });

    switch (type) {
        case 'Window': {
            rs += '/Window';
            await copyText(`${rs}/AppWindow.h`, `${ws}/AppWindow.h`);
            await copyText(`${rs}/AppWindow.cpp`, `${ws}/AppWindow.cpp`, [[/__name__/g, nm]]);
            break;
        }

        case 'Dialog': {
            rs += '/Dialog';
            await copyText(`${rs}/AppDialog.h`, `${ws}/AppDialog.h`);
            await copyText(`${rs}/AppDialog.cpp`, `${ws}/AppDialog.cpp`, [[/__name__/g, nm]]);
            await copyText(`${rs}/resource.h`, `${ws}/resource.h`, [[/__name__/g, nm]]);
            await copyDirect(`${rs}/Application.rc`,  `${ws}/${nm}.rc`);
            break;
        }

        default: break;
    }

    await copyText(`${rs}/CMakeLists.txt`, `${ws}/CMakeLists.txt`, [[/__name__/g, nm]]);
    vscode.window.showTextDocument(vscode.Uri.file(`${ws}/CMakeLists.txt`), { preview: false });

    await copyText(`${rs}/main.cpp`, `${ws}/main.cpp`);

    vscode.window.showInformationMessage(`CMake Win32 ${type.toLowerCase()} project "${nm}" created`);

    let files = await listFiles(`${ws}`, /\.cpp$/);
}

export async function csConsole(context: vscode.ExtensionContext) {
    if (!await isWorkspaceValid) {
        vscode.window.showErrorMessage('Workspace folder is undefined or not empty');
        return;
    }

    let nm = (await vscode.window.showInputBox({ prompt: 'Input project name', value: vscode.workspace.name }))?.trim();
    if (!nm) {
        return;
    }

    let ws = wsp.first()!.uri.path;
    let rs = context.extensionUri.path + '/res/cmake/cs/console';

    await copyText(`${rs}/CMakeLists.txt`, `${ws}/CMakeLists.txt`, [[/__name__/g, nm]]);
    vscode.window.showTextDocument(vscode.Uri.file(`${ws}/CMakeLists.txt`), { preview: false });

    let src = ['App.config', 'Program.cs', 'Properties/AssemblyInfo.cs'];
    src.forEach(async file => {
        await copyText(`${rs}/${file}`, `${ws}/${file}`, [[/__name__/g, nm!]]);
    });

    vscode.window.showInformationMessage(`CMake C# console project "${nm}" created`);
}

export async function csWpf(context: vscode.ExtensionContext) {
    if (!await isWorkspaceValid()) {
        vscode.window.showErrorMessage('Workspace folder is undefined or not empty');
        return;
    }

    let nm = (await vscode.window.showInputBox({ prompt: 'Input project name', value: vscode.workspace.name }))?.trim();
    if (!nm) {
        return;
    }

    let ws = wsp.first()!.uri.path;
    let rs = context.extensionUri.path + '/res/cmake/cs/wpf';

    await copyText(`${rs}/CMakeLists.txt`, `${ws}/CMakeLists.txt`, [[/__name__/g, nm]]);
    vscode.window.showTextDocument(vscode.Uri.file(`${ws}/CMakeLists.txt`), { preview: false });

    let src = ['App.config',
                'App.xaml',
                'App.xaml.cs',
                'MainWindow.xaml',
                'MainWindow.xaml.cs',
                'Properties/AssemblyInfo.cs',
                'Properties/Resources.Designer.cs',
                'Properties/Resources.resx',
                'Properties/Settings.Designer.cs',
                'Properties/Settings.settings'];

    src.forEach(async file => {
        await copyText(`${rs}/${file}`, `${ws}/${file}`, [[/__name__/g, nm!]]);
    });

    vscode.window.showInformationMessage(`CMake C# WPF project "${nm}" created`);
}

export async function csLib(context: vscode.ExtensionContext) {
    if  (!await isWorkspaceValid()) {
        vscode.window.showErrorMessage('Workspace folder is undefined or not empty');
        return;
    }

    let nm = (await vscode.window.showInputBox({ prompt: 'Input project name', value: vscode.workspace.name }))?.trim();
    if (!nm) {
        return;
    }

    let ws = wsp.first()!.uri.path;
    let rs = context.extensionUri.path + '/res/cmake/cs/lib';

    await copyText(`${rs}/CMakeLists.txt`, `${ws}/CMakeLists.txt`, [[/__name__/g, nm]]);
    vscode.window.showTextDocument(vscode.Uri.file(`${ws}/CMakeLists.txt`), { preview: false });

    let src = ['Class1.cs', 'Properties/AssemblyInfo.cs'];
    await src.forEach(async file => {
        await copyText(`${rs}/${file}`, `${ws}/${file}`, [[/__name__/g, nm!]]);
    });

    vscode.window.showInformationMessage(`CMake C# WPF project "${nm}" created`);
}