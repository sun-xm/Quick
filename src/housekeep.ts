import * as cp from 'child_process';
import * as os from 'os';
import * as ws from './workspace';
import * as vscode from 'vscode';
import { output } from './extension';

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
        storage = uri;
    }
}

export async function cleanStorage() {
    let s = storage.fsPath + '\\..\\..\\*';
    switch (os.platform()) {
        case 'win32': {
            return new Promise<void>((resolve)=>{
                cp.exec('for /d %G in (\"' + storage.fsPath + '\\..\\..\\*\") do rd /s /q \"%~G\"', ()=>resolve());
            });
        }

        case 'linux': {
            return new Promise<void>((resolve)=>{
                cp.exec('rm -rf ' + storage.fsPath + '/../../*', ()=>resolve());
            });
        }

        default: {
            return undefined;
        }
    }
}

export let storage: vscode.Uri;