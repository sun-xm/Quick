import * as ext from './extension';
import * as chp from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';
import * as wsp from './workspace';
import { enableUnchange } from './config';
import { TextDecoder } from 'util';

let unchanges: {[key: string]: vscode.Uri};

export async function monitor(context: vscode.ExtensionContext) {
    if (!wsp.first()) {
        return;
    }

    const watcher = vscode.workspace.createFileSystemWatcher("**/.gitunchange");
    watcher.onDidCreate(()=>synchronize());
    watcher.onDidChange(()=>synchronize());
    watcher.onDidDelete(()=>synchronize());
    context.subscriptions.push(watcher);

    synchronize();
}

async function synchronize() {
    if (!enableUnchange()) {
        return;
    }

    unchanges = await list();

    const assumed = new Array<string>();
    const noassum = new Array<string>();

    await new Promise<void>(resolve=>{
        chp.exec('git ls-files -v', { cwd: wsp.first()!.uri.fsPath }, (error, stdout, stderr)=>{
            if (error?.code) {
                vscode.window.showErrorMessage('Failed to list git files');
                ext.output(stderr);
            }
            else {
                const files = stdout.split('\n');
                files.forEach(file=>{
                    file = file.trim();
                    if (file.startsWith('h '))
                    {
                        assumed.push(vscode.Uri.joinPath(wsp.first()!.uri, file.substring(2)).fsPath);
                    }
                    else if (file.startsWith('H '))
                    {
                        noassum.push(vscode.Uri.joinPath(wsp.first()!.uri, file.substring(2)).fsPath);
                    }
                });
            }
            resolve();
        });
    });

    for (const file of assumed) {
        await unassume(file);
    }
    for (const file of noassum) {
        await assume(file);
    }

    vscode.commands.executeCommand('git.refresh');
}

async function list() {
    const unchg: {[key: string]: vscode.Uri} = {};
    const files = await vscode.workspace.findFiles('**/.gitunchange');

    const decoder = new TextDecoder();

    await Promise.all(files.map(async file=>{
        const dir = vscode.Uri.file(path.dirname(file.fsPath));
        const lns = decoder.decode(await vscode.workspace.fs.readFile(file)).split('\n');

        lns.forEach(line=>{
            line = line.trim();
            if (!line) {
                return;
            }

            let uri = path.isAbsolute(line) ? vscode.Uri.file(line) : vscode.Uri.joinPath(dir, line);
            unchg[uri.fsPath] = uri;
        });
    }));

    return unchg;
}

async function assume(file: string)
{
    if (file in unchanges) {
        await new Promise<void>(resolve=>{
            chp.exec(`git update-index --assume-unchanged ${file}`, { cwd: wsp.first()!.uri.fsPath }, (error, stdout, stderr)=>{
                if (error?.code) {
                    ext.output(stderr);
                    console.log(`Failed to set ${file} --assume-unchanged`);
                }
                else {
                    console.log(`${file} is --assume-unchagned`);
                }
                resolve();
            });
        });
    }
}

async function unassume(file: string)
{
    if (!(file in unchanges)) {
        await new Promise<void>(resolve=>{
            chp.exec(`git update-index --no-assume-unchanged ${file}`, { cwd: wsp.first()!.uri.fsPath }, (error, stdout, stderr)=>{
                if (error?.code) {
                    ext.output(stderr);
                    console.log(`Failed to set ${file} --no-assume-unchanged`);
                }
                else {
                    console.log(`${file} is --no-assume-unchanged`);
                }
                resolve();
            });
        });
    }
}