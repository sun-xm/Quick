import * as vscode from 'vscode';

export async function pickFile(args: any): Promise<string> {
    const uris = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        defaultUri: args?.defaultUri,
        filters: args?.filters,
        openLabel: args?.openLabel,
        title: args?.title
    });

    if (!uris || 0 == uris.length) {
        return '';
    }

    return uris[0].fsPath;
}

export async function pickFiles(args: any) : Promise<string> {
    const uris = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: true,
        defaultUri: args?.defaultUri,
        filters: args?.filters,
        openLabel: args?.openLabel,
        title: args?.title
    });

    if (!uris || 0 == uris.length) {
        return '';
    }

    let paths = uris[0].fsPath;
    for (let i = 1; i < uris.length; i++) {
        paths += ';' + uris[i].fsPath;
    }

    return paths;
}

export async function pickFolder(args: any): Promise<string> {
    console.debug(args);

    const uris = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        defaultUri: args?.defaultUri,
        openLabel: args?.openLabel,
        title: args?.title
    });

    if (!uris || 0 == uris.length) {
        return '';
    }

    return uris[0].fsPath;
}