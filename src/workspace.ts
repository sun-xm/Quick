import * as vscode from 'vscode';

export function first() {
    return vscode.workspace?.workspaceFolders?.[0];
}

export function relative(absoluteUri: vscode.Uri) {
    let ws = first();
    if (!ws) {
        return null;
    }

    if (!absoluteUri.path.startsWith(ws.uri.path)) {
        return null;
    }

    let relative = absoluteUri.path.substring(ws.uri.path.length);
    if (relative.length > 0 && '/' == relative[0]) {
        relative = relative.substring(1);
    }

    return relative;
}

export async function isEmpty(wsp: vscode.Uri) {
    return 0 == ((await vscode.workspace.fs.readDirectory(wsp)).length);
}