import * as cp from 'child_process';
import * as os from 'os';
import * as wsp from './workspace';
import * as ext from './extension';

export async function cleanup() {
    if (!wsp.first()) {
        return undefined;
    }

    let promises: Promise<void>[] = [];

    switch (os.platform()) {
        case 'win32': {
            promises.push(new Promise<void>((resolve)=>{
                cp.exec('del /q .vscode\\VC.DB', { cwd: wsp.first()!.uri.fsPath }, ()=>resolve());
            }));
            promises.push(new Promise<void>((resolve)=>{
                cp.exec('rmdir /q /s .vscode\\ipch', { cwd: wsp.first()!.uri.fsPath }, ()=>resolve());
            }));
            break;
        }

        case 'linux': {
            promises.push(new Promise<void>((resolve)=>{
                cp.exec('sleep 1s && rm -f .vscode/vc.db', { cwd: wsp.first()!.uri.fsPath }, ()=>resolve());
            }));
            promises.push(new Promise<void>((resolve)=>{
                cp.exec('sleep 1s && rm -rf .vscode/ipch', { cwd: wsp.first()!.uri.fsPath }, ()=>resolve());
            }));
            break;
        }

        default: {
            break;
        }
    }

    return Promise.all(promises);
}

export async function cleanStorage() {
    switch (os.platform()) {
        case 'win32': {
            return new Promise<void>((resolve)=>{
                cp.exec('for /d %G in (\"' + ext.wspStorage.fsPath + '\\*\") do rd /s /q \"%~G\"', ()=>resolve());
            });
        }

        case 'linux': {
            return new Promise<void>((resolve)=>{
                cp.exec('rm -rf ' + ext.wspStorage.fsPath + '/*', (error, stdout, stderr)=>{
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