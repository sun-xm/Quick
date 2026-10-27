import * as chp  from 'child_process';
import * as fs   from 'fs';
import * as ext  from './extension';
import * as os   from 'os';
import * as path from 'path';
import * as vsc  from 'vscode';

export async function check() {
    try {
        const res: any = await new Promise((res, rej)=>{
            const curl = chp.spawn('curl', ['-s', 'https://api.github.com/repos/sun-xm/Quick/releases/latest'], { windowsHide: true });

            let stderr = "";
            let stdout = "";
            curl.stderr.on('data', d => stderr += d);
            curl.stdout.on('data', d => stdout += d);
            curl.on('close', code =>{
                if (0 != code) {
                    rej(new Error(stderr));
                    return;
                }

                res(JSON.parse(stdout));
            });
        });

        const remoteVer = res.tag_name.match(/(\d+)\.(\d+)\.(\d+)/).slice(1).map(Number);

        const bytes = await vsc.workspace.fs.readFile(vsc.Uri.file(path.join(__dirname, '../package.json')));
        const content = Buffer.from(bytes).toString('utf-8');
        const localVer = JSON.parse(content).version.split('.').map(Number);

        let newer = false;
        for (let i = 0; i < Math.min(localVer.length, remoteVer.length); i++) {
            if (remoteVer[i] > localVer[i]) {
                newer = true;
                break;
            }
        }

        if (true/*newer*/) {
            for (const asset of res.assets) {
                if ('application/vsix' === asset.content_type) {
                    if ('Yes' == await vsc.window.showInformationMessage('Quick: new version found. Update now ?', 'Yes', 'No')) {
                        await update(asset.browser_download_url);
                        vsc.window.showInformationMessage(`Quick: Updated to version ${res.tag_name}`);
                    }
                    break;
                }
            }
        }
        else {
            vsc.window.showInformationMessage('Quick: no newer version found');
        }
    } catch (err) {
        ext.output(`${err}`);
        vsc.window.showErrorMessage('Failed to check update');
    }
}

async function update(url: string) {
    const status = vsc.window.createStatusBarItem();
    status.text = '$(sync~spin) Downloading Quick';
    status.show();

    const tmpdir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "quick-"));
    try {
        const file = path.join(tmpdir, "quick.vsix");
        await new Promise<void>((rsv, rej)=>{
            const curl = chp.spawn('curl', ['-fL', '-sS', '-o', file, url], { windowsHide: true });

            let stderr = "";
            let stdout = "";
            curl.stderr.on('data', d => stderr += d);
            curl.stdout.on('data', d => stdout += d);
            curl.on('close', code =>{
                if (0 != code) {
                    rej(new Error(stderr));
                    return;
                }
                rsv();
            });
        });

        await vsc.commands.executeCommand('workbench.extensions.installExtension', vsc.Uri.file(file));

    } finally {
        status.hide();
        await fs.promises.rmdir(tmpdir, { recursive: true });
    }
}