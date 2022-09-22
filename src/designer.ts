import * as vscode from 'vscode';
import * as os from 'os';

let terminal: vscode.Terminal | undefined;
let onClose: (t: vscode.Terminal) => any;

export function openUiFile(uri: vscode.Uri) {
    if (!terminal) {
        terminal = vscode.window.createTerminal("Designer");

        if (!onClose) {
            onClose = (t: vscode.Terminal)=>{
                if (t == terminal) {
                    terminal = undefined;
                }
            };

            vscode.window.onDidCloseTerminal(onClose);
        }
    }

    let cmd = 'designer ' + uri.fsPath;
    if ('win32' != os.platform()) {
        cmd += ' &';
    }

    terminal.show(false);
    terminal.sendText(cmd);
}