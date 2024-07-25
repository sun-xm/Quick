import * as vscode from 'vscode';

export async function start() {
    let panel = vscode.window.createWebviewPanel('webview', 'My webview', vscode.ViewColumn.One, { enableScripts: true });
    panel.webview.html = await getHtml();
    panel.webview.onDidReceiveMessage(msg=>onCommand(msg));
}

async function getHtml() {
    let html = (await vscode.workspace.fs.readFile(vscode.Uri.file(`${__dirname}/../html/mywebview/index.html`))).toString();
    let script = (await vscode.workspace.fs.readFile(vscode.Uri.file(`${__dirname}/../html/mywebview/script.js`))).toString();
    return eval('`' + html + '`');
}

function onCommand(message: any) {
    switch (message.command) {
        case 'onButtonClicked': {
            onButtonClicked(message.param);
            break;
        }
    }
}

function onButtonClicked(param: any) {
    vscode.window.showInformationMessage(param);
}