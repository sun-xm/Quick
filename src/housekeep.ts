import * as cp from 'child_process';
import * as os from 'os';
import * as ws from './workspace';

export async function cleanup() {
    if (!ws.first()) {
        return undefined;
    }

    switch (os.platform()) {
        case 'win32': {
            return Promise.all([
                new Promise<void>((resolve)=>{
                    cp.exec('del /q .vscode\\VC.DB', { cwd: ws.first()!.uri.fsPath }, ()=>resolve());
                }),
                new Promise<void>((resolve)=>{
                    cp.exec('rmdir /q /s .vscode\\ipch', { cwd: ws.first()!.uri.fsPath }, ()=>resolve());
                })
            ]);
        }

        default: {
            return undefined;
        }
    }
}