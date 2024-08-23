import * as vscode from 'vscode';
import * as wsp from './workspace';
import { copyText, createFolder } from './copy';

export async function app(context: vscode.ExtensionContext) {
    if (!wsp.first()) {
        vscode.window.showErrorMessage('Workspace folder is undefined or not empty');
        return;
    }

    let nm = (await vscode.window.showInputBox({ prompt: 'Input application name', value: vscode.workspace.name }))?.trim();
    if (undefined == nm || 0 == nm.length) {
        return;
    }

    let ws = wsp.first()!.uri.path;
    let rs = context.extensionUri.path + '/res/electron';

    await copyText(`${rs}/_gitignore`,        `${ws}/.gitignore`);
    await copyText(`${rs}/eslint.config.mjs`, `${ws}/eslint.config.mjs`);
    await copyText(`${rs}/_package.json`,     `${ws}/package.json`, [[/__name__/g, nm]]);
    await copyText(`${rs}/package-lock.json`, `${ws}/package-lock.json`, [[/__name__/g, nm]]);
    await copyText(`${rs}/tsconfig.json`,     `${ws}/tsconfig.json`);

    await createFolder(`${ws}/.vscode`);
    await copyText(`${rs}/.vscode/launch.json`, `${ws}/.vscode/launch.json`);

    await createFolder(`${ws}/css`);
    await copyText(`${rs}/css/about.css`,  `${ws}/css/about.css`);
    await copyText(`${rs}/css/index.css`,  `${ws}/css/index.css`);
    await copyText(`${rs}/css/menu.css`,   `${ws}/css/menu.css`);
    await copyText(`${rs}/css/title.css`,  `${ws}/css/title.css`);
    await copyText(`${rs}/css/status.css`, `${ws}/css/status.css`);

    await createFolder(`${ws}/html`);
    await copyText(`${rs}/html/about.html`,        `${ws}/html/about.html`);
    await copyText(`${rs}/html/content.html`,      `${ws}/html/content.html`);
    await copyText(`${rs}/html/index.html`,        `${ws}/html/index.html`);
    await copyText(`${rs}/html/title.html`,        `${ws}/html/title.html`, [[/__name__/g, nm]]);
    await copyText(`${rs}/html/menu_color.html`,   `${ws}/html/menu_color.html`);
    await copyText(`${rs}/html/menu_file.html`,    `${ws}/html/menu_file.html`);
    await copyText(`${rs}/html/menu_help.html`,    `${ws}/html/menu_help.html`);
    await copyText(`${rs}/html/menu_option.html`,  `${ws}/html/menu_option.html`);

    await createFolder(`${ws}/img`);
    await copyText(`${rs}/img/check.svg`,      `${ws}/img/check.svg`);
    await copyText(`${rs}/img/close.svg`,      `${ws}/img/close.svg`);
    await copyText(`${rs}/img/check.svg`,      `${ws}/img/check.svg`);
    await copyText(`${rs}/img/icon.svg`,       `${ws}/img/icon.svg`);
    await copyText(`${rs}/img/maximize.svg`,   `${ws}/img/maximize.svg`);
    await copyText(`${rs}/img/minimize.svg`,   `${ws}/img/minimize.svg`);
    await copyText(`${rs}/img/radio.svg`,      `${ws}/img/radio.svg`);
    await copyText(`${rs}/img/restore.svg`,    `${ws}/img/restore.svg`);
    await copyText(`${rs}/img/submenu.svg`,    `${ws}/img/submenu.svg`);

    await createFolder(`${ws}/src`);
    await copyText(`${rs}/src/about.ts`,      `${ws}/src/about.ts`);
    await copyText(`${rs}/src/index.ts`,      `${ws}/src/index.ts`);
    await copyText(`${rs}/src/title.ts`,      `${ws}/src/title.ts`);
    await copyText(`${rs}/src/content.ts`,    `${ws}/src/content.ts`);
    await copyText(`${rs}/src/status.ts`,     `${ws}/src/status.ts`);
    await copyText(`${rs}/src/main.ts`,       `${ws}/src/main.ts`);
    await copyText(`${rs}/src/menu.ts`,       `${ws}/src/menu.ts`);
    await copyText(`${rs}/src/module.ts`,     `${ws}/src/module.ts`);
    await copyText(`${rs}/src/dynamic.ts`,    `${ws}/src/dynamic.ts`);

    vscode.tasks.executeTask(new vscode.Task({ type: 'shell'}, vscode.TaskScope.Workspace, 'npm install', 'npm', new vscode.ShellExecution('npm install')));
}

export async function mod(context: vscode.ExtensionContext) {
    if (!wsp.first()) {
        vscode.window.showErrorMessage('Workspace folder is undefined');
    }

    let name = (await vscode.window.showInputBox({ prompt: 'Input module class name' }))?.trim();
    if (!name) {
        return;
    }

    let dest = (await vscode.window.showInputBox({ prompt: 'Input source file folder', value: 'src' }))?.trim();
    if (!dest) {
        return;
    }

    let ws = wsp.first()!.uri.path;
    let rs = context.extensionUri.path + '/res/electron';
    let file = name.toLowerCase() + '.ts';
    let path = `${ws}/` + (dest.length > 0 ? `${dest}/${file}` : `${file}`);

    await copyText(`${rs}/src/new_module.ts`, path, [[/__module__/g, name]]);
    vscode.window.showTextDocument(vscode.Uri.file(path), { preview: false });
    vscode.window.showInformationMessage(`Electron module "${name}" added`);
}