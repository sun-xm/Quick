import * as vsc from 'vscode';
import * as wsp from './workspace';
import { copyText, createFolder } from './copy';

export async function project(context: vsc.ExtensionContext) {
    if (!wsp.first() || !wsp.isEmpty(wsp.first()!.uri)) {
        vsc.window.showErrorMessage('Workspace folder is unavailable or not empty');
        return;
    }

    const nm = (await vsc.window.showInputBox({ prompt: 'Input project name', value: vsc.workspace.name }))?.trim();
    if (undefined == nm || 0 == nm.length) {
        return;
    }

    const ws = wsp.first()!.uri.path;
    const rs = context.extensionUri.path + '/res/nodejs';

    await copyText(`${rs}/package.json`,  `${ws}/package.json`, [[/__name__/g, nm]]);
    await copyText(`${rs}/tsconfig.json`, `${ws}/tsconfig.json`);

    await createFolder(`${ws}/src`);
    await copyText(`${rs}/src/main.ts`,   `${ws}/src/main.ts`);

    await createFolder(`${ws}/.vscode`);
    await copyText(`${rs}/.vscode/launch.json`, `${ws}/.vscode/launch.json`);

    vsc.tasks.executeTask(new vsc.Task({ type: 'shell'}, vsc.TaskScope.Workspace, 'npm install', 'npm', new vsc.ShellExecution('npm install')));
    vsc.window.showTextDocument(vsc.Uri.file(`${ws}/src/main.ts`), { preview: false });
    vsc.window.showInformationMessage(`CMake console project "${nm}" created`);
}