const vscode = acquireVsCodeApi();

function onButtonClicked() {
    vscode.postMessage({ command: 'onButtonClicked', param: 'Button is clicked' });
}