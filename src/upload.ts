import * as chp from 'child_process';
import * as threads from './threads';
import * as vscode from 'vscode';

export async function start(uri: vscode.Uri) {
    const panel = vscode.window.createWebviewPanel('upload-user-content', 'Upload User Content', vscode.ViewColumn.One, { enableScripts: true });
    panel.webview.html = await getHtml();
    panel.webview.onDidReceiveMessage(msg=>onCommand(panel, msg));
    if (uri) {
        panel.webview.postMessage({ command: 'onBrowse', params: uri.fsPath });
    }

    const session = await vscode.authentication.getSession('github', ['repo'], { createIfNone: true });
    if (session) {
        panel.webview.postMessage({ command: 'onToken', params: session.accessToken });
    }
}

async function getHtml() {
    const html = (await vscode.workspace.fs.readFile(vscode.Uri.file(`${__dirname}/../html/upload-user-content/index.html`))).toString();
    const script = (await vscode.workspace.fs.readFile(vscode.Uri.file(`${__dirname}/../html/upload-user-content/script.js`))).toString();
    return eval('`' + html + '`');
}

async function getTreeSHA(params: any): Promise<string> {
    const args = [
        '-s',
        '-H', `Authorization: Bearer ${params.token}`,
        '-H', 'Accept: application/vnd.github+json',
        `https://api.github.com/repos/${params.orgnization}/${params.repository}/branches/${params.branch}`
    ];

    return new Promise((res, rej)=>{
        const curl = chp.spawn('curl', args, { windowsHide: true });

        let output = '';
        curl.stdout.on('data', d=>output += d.toString());
        curl.stderr.on('data', d=>console.error(`${d}`));
        curl.on('close', code=>{
            if (0 != code) {
                rej(new Error(`curl failed with code ${code}`));
                return;
            }

            const json = JSON.parse(output);
            const tree = json.commit?.commit?.tree?.sha;
            res(tree??'');
        });
    });
}

async function getBlobSHA(params: any, tree: string): Promise<string> {
    if (!tree) {
        return '';
    }

    const args = [
        '-s',
        '-H', `Authorization: Bearer ${params.token}`,
        '-H', 'Accept: application/vnd.github+json',
        `https://api.github.com/repos/${params.orgnization}/${params.repository}/git/trees/${tree}?recursive=1`
    ];

    return new Promise((res, rej)=>{
        const curl = chp.spawn('curl', args, { windowsHide: true });

        let output = '';
        curl.stdout.on('data', d=>output += d.toString());
        curl.stderr.on('data', d=>console.error(`${d}`));
        curl.on('close', code=>{
            if (0 != code) {
                rej(new Error(`curl failed with code ${code}`));
                return;
            }

            const json = JSON.parse(output);
            const blob = json.tree.find((f: any)=>f.path == params.path);
            res(blob?.sha??'');
        });
    });
}

async function onCommand(panel: vscode.WebviewPanel, message: any) {
    switch (message.command) {
        case 'onBrowse': {
            onBrowse(panel, message.params);
            break;
        }

        case 'onUpload': {
            onUpload(panel, message.params);
            break;
        }
    }
}

async function onBrowse(panel: vscode.WebviewPanel, file: string) {
    const uris = await vscode.window.showOpenDialog({
        title: 'Select upload file',
        defaultUri: vscode.Uri.file(file)
    });

    if (!uris || 0 == uris.length) {
        return;
    }

    panel.webview.postMessage({ command: 'onBrowse', params: uris[0].fsPath });
}

async function onUpload(panel: vscode.WebviewPanel, params: any) {
    try
    {
        const tree = await getTreeSHA(params);
        const blob = await getBlobSHA(params, tree);

        params.blob = blob;
        await threads.exec((params)=>{
            const fs  = require('fs');
            const fr = fs.openSync(`${params.file}`, 'r');
            const fw = fs.openSync(`${params.file}.b64`, 'w');

            const sha = params.blob ? `"sha": "${params.blob}",` : '';
            fs.writeSync(fw, Buffer.from(`{"message": "${params.message}", "branch": "${params.branch}", ${sha} "content":"`));

            const buf = Buffer.alloc(3 * 128 * 1024);
            let bytes = 0;
            while((bytes = fs.readSync(fr, buf, 0, buf.byteLength, null)) > 0) {
                const b64 = buf.subarray(0, bytes).toString('base64');
                fs.writeSync(fw, Buffer.from(b64));
            }
            fs.writeSync(fw, Buffer.from("\"}"));

            fs.closeSync(fr);
            fs.closeSync(fw);
        }, params);

        const args = [
            '-X', 'PUT',
            '-H', `Authorization: Bearer ${params.token}`,
            '-H', 'Accept: application/vnd.github+json',
            '-H', 'X-GitHub-Api-Version: 2022-11-28',
            '-H', 'Content-Type: application/json',
            '--data-binary', `@${params.file}.b64`,
            '--connect-timeout', '10',
            '--progress-bar',
            `https://api.github.com/repos/${params.orgnization}/${params.repository}/contents/${params.path}`
        ];

        await new Promise<void>((res, rej)=>{
            const curl = chp.spawn('curl', args, { windowsHide: true });
            curl.stdout.on('data', d=>panel.webview.postMessage({ command: 'onResult', params: d.toString() }));
            curl.stderr.on('data', d=>panel.webview.postMessage({ command: 'onUpload', params: d.toString() }));
            curl.on('close', code=>{
                if (0 === code) {
                    res();
                } else {
                    rej(new Error(`curl failed with code ${code}`));
                }
            });
        });
    } catch (error)
    {
        panel.webview.postMessage({ command: 'onResult', params: JSON.stringify(error) });
    }

    require('fs').rmSync(`${params.file}.b64`);
}