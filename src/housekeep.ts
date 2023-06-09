import * as cp from 'child_process';
import * as os from 'os';
import * as ws from './workspace';
import * as vscode from 'vscode';

export async function cleanup() {
    if (!ws.first()) {
        return undefined;
    }

    let promises: Promise<void>[] = [];

    switch (os.platform()) {
        case 'win32': {
            promises.push(new Promise<void>((resolve)=>{
                cp.exec('del /q .vscode\\VC.DB', { cwd: ws.first()!.uri.fsPath }, ()=>resolve());
            }));
            promises.push(new Promise<void>((resolve)=>{
                cp.exec('rmdir /q /s .vscode\\ipch', { cwd: ws.first()!.uri.fsPath }, ()=>resolve());
            }));
            break;
        }

        case 'linux': {
            promises.push(new Promise<void>((resolve)=>{
                cp.exec('sleep 1s && rm -f .vscode/vc.db', { cwd: ws.first()!.uri.fsPath }, ()=>resolve());
            }));
            promises.push(new Promise<void>((resolve)=>{
                cp.exec('sleep 1s && rm -rf .vscode/ipch', { cwd: ws.first()!.uri.fsPath }, ()=>resolve());
            }));
            break;
        }

        default: {
            break;
        }
    }

    return Promise.all(promises);
}

export function setStorage(uri: vscode.Uri | undefined) {
    if (uri) {
        extStorage = uri;

        let wsp = extStorage.path.substring(0, extStorage.path.lastIndexOf('/'));
        wspStorage = vscode.Uri.file(wsp.substring(0, wsp.lastIndexOf('/')));
    }
}

export async function cleanStorage() {
    switch (os.platform()) {
        case 'win32': {
            return new Promise<void>((resolve)=>{
                cp.exec('for /d %G in (\"' + wspStorage.fsPath + '\\*\") do rd /s /q \"%~G\"', ()=>resolve());
            });
        }

        case 'linux': {
            return new Promise<void>((resolve)=>{
                cp.exec('rm -rf ' + wspStorage.fsPath + '/*', (error, stdout, stderr)=>{
                    resolve();
                    console.log(stdout);
                    console.log(stderr);
                });
            });
        }

        default: {
            return undefined;
        }
    }
}

export let extStorage: vscode.Uri;
export let wspStorage: vscode.Uri;