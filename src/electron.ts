import * as vscode from 'vscode';
import { copyText, createFolder } from './copy'

async function isEmpty(folder: vscode.Uri) {
    return 0 == (await vscode.workspace.fs.readDirectory(folder)).length;
}

export async function electronApp(context: vscode.ExtensionContext) {
    if (undefined != vscode.workspace.name && 
        undefined != vscode.workspace.workspaceFolders &&
        await isEmpty(vscode.workspace.workspaceFolders[0].uri)) {

        let nm = (await vscode.window.showInputBox({ prompt: 'Input application name', value: vscode.workspace.name }))?.trim();
        if (undefined == nm || 0 == nm.length) {
            return;
        }

        let ws = vscode.workspace.workspaceFolders[0].uri.path;
        let res = context.extensionUri.path + '/res/electron';

        await copyText(`${res}/_gitignore`, `${ws}/.gitignore`);
        await copyText(`${res}/package.json_`, `${ws}/package.json`, [[/__name__/g, nm]]);
        await copyText(`${res}/package-lock.json_`, `${ws}/package-lock.json`, [[/__name__/g, nm]]);
        await copyText(`${res}/tsconfig.json_`, `${ws}/tsconfig.json`);

        await createFolder(`${ws}/.vscode`);
        await copyText(`${res}/.vscode/launch.json_`, `${ws}/.vscode/launch.json`);

        await createFolder(`${ws}/css`);
        await copyText(`${res}/css/about.css`,  `${ws}/css/about.css`);
        await copyText(`${res}/css/index.css`,  `${ws}/css/index.css`);
        await copyText(`${res}/css/menu.css`,   `${ws}/css/menu.css`);
        await copyText(`${res}/css/title.css`,  `${ws}/css/title.css`);
        await copyText(`${res}/css/status.css`, `${ws}/css/status.css`);
        
        await createFolder(`${ws}/html`);
        await copyText(`${res}/html/about.html`,        `${ws}/html/about.html`);
        await copyText(`${res}/html/index.html`,        `${ws}/html/index.html`);
        await copyText(`${res}/html/title.html`,        `${ws}/html/title.html`, [[/__name__/g, nm]]);
        await copyText(`${res}/html/menu_color.html`,   `${ws}/html/menu_color.html`);
        await copyText(`${res}/html/menu_file.html`,    `${ws}/html/menu_file.html`);
        await copyText(`${res}/html/menu_help.html`,    `${ws}/html/menu_help.html`);
        await copyText(`${res}/html/menu_option.html`,  `${ws}/html/menu_option.html`);

        await createFolder(`${ws}/img`);
        await copyText(`${res}/img/check.svg`,      `${ws}/img/check.svg`);
        await copyText(`${res}/img/close.svg`,      `${ws}/img/close.svg`);
        await copyText(`${res}/img/check.svg`,      `${ws}/img/check.svg`);
        await copyText(`${res}/img/icon.svg`,       `${ws}/img/icon.svg`);
        await copyText(`${res}/img/maximize.svg`,   `${ws}/img/maximize.svg`);
        await copyText(`${res}/img/minimize.svg`,   `${ws}/img/minimize.svg`);
        await copyText(`${res}/img/radio.svg`,      `${ws}/img/radio.svg`);
        await copyText(`${res}/img/restore.svg`,    `${ws}/img/restore.svg`);
        await copyText(`${res}/img/submenu.svg`,    `${ws}/img/submenu.svg`);

        await createFolder(`${ws}/src`);
        await copyText(`${res}/src/about.ts_`,      `${ws}/src/about.ts`);
        await copyText(`${res}/src/index.ts_`,      `${ws}/src/index.ts`);
        await copyText(`${res}/src/title.ts_`,      `${ws}/src/title.ts`);
        await copyText(`${res}/src/content.ts_`,    `${ws}/src/content.ts`);
        await copyText(`${res}/src/status.ts_`,     `${ws}/src/status.ts`);
        await copyText(`${res}/src/main.ts_`,       `${ws}/src/main.ts`);
        await copyText(`${res}/src/menu.ts_`,       `${ws}/src/menu.ts`);
        await copyText(`${res}/src/module.ts_`,     `${ws}/src/module.ts`);
        await copyText(`${res}/src/dynamic.ts_`,    `${ws}/src/dynamic.ts`);

        vscode.window.showInformationMessage(`Electron project "${nm}" created. Run "npm install" to start`);
    }
    else {
        vscode.window.showErrorMessage('Workspace folder is undefined or not empty');
    }
}

export async function electronMod(context: vscode.ExtensionContext) {
    if (undefined != vscode.workspace.name && 
        undefined != vscode.workspace.workspaceFolders) {

        let name = (await vscode.window.showInputBox({ prompt: 'Input module class name' }))?.trim();
        if (undefined != name && name.length > 0) {
            let dest = (await vscode.window.showInputBox({ prompt: 'Input source file folder', value: 'src' }))?.trim();

            if (undefined != dest) {
                let ws = vscode.workspace.workspaceFolders[0].uri.path;
                let res = context.extensionUri.path + '/res/electron';
                let file = name.toLowerCase() + '.ts';
                let path = `${ws}/` + (dest.length > 0 ? `${dest}/${file}` : `${file}`);

                await copyText(`${res}/src/new_module.ts_`, path, [[/__module__/g, name]]);
                vscode.window.showTextDocument(vscode.Uri.file(path), { preview: false });
                vscode.window.showInformationMessage(`Electron module "${name}" added`);
            }
        }
    }
    else {
        vscode.window.showErrorMessage('Workspace folder is undefined');
    }
}