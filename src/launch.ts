import * as fs     from 'fs';
import * as jsonc  from 'jsonc-parser';
import * as path   from 'path';
import * as vscode from 'vscode';
import * as wsp    from './workspace';

let config: string | undefined;

const status = vscode.window.createStatusBarItem();
status.command = 'quick.startLaunch';

export async function select() {
    config = await vscode.window.showQuickPick(getConfigs(), { placeHolder: 'Select debug config or press ESC to disable' });
    if (config) {
        vscode.commands.executeCommand('setContext', 'quick:launch:enabled', true);
        status.text = `$(play) Quick Launch [${config}]`;
        status.show();
    } else {
        vscode.commands.executeCommand('setContext', 'quick:launch:enabled', false);
        status.hide();
    }
}

export async function start() {
    if (config) {
        vscode.debug.startDebugging(wsp.first(), config);
    }
}

async function getConfigs(): Promise<string[]> {
    const first = wsp.first();
    if (!first) {
        return [];
    }

    const file = path.join(first.uri.fsPath, '.vscode/launch.json');
    if (!await fs.existsSync(file)) {
        return [];
    }

    try {
        const bytes = await vscode.workspace.fs.readFile(vscode.Uri.file(file));
        const chars = Buffer.from(bytes).toString('utf8');
        const json  = jsonc.parse(chars);

        let names : string[] = [];
        for (const config in json?.configurations) {
            const name = json.configurations[config]?.name;
            if (name) {
                names.push(name);
            }
        }

        return names;

    } catch (error) {
        console.error('Failed to load .vscode/launch.json: ' + error);
    }

    return [];
}