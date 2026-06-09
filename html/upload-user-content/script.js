const vscode = acquireVsCodeApi();

window.addEventListener('message', event=>{
    switch (event.data.command) {
        case 'onBrowse': {
            const file = event.data.params;
            document.getElementById('file').value = file;
            break;
        }

        case 'onUpload': {
            onUpload(event.data.params);
            break;
        }

        case 'onResult': {
            onResult(event.data.params);
            break;
        }
    }
});

function trimSlash(str) {
    return str.replace(/^\/+|\/+$/g, '');
}

function onBrowse() {
    const file = document.getElementById('file').value.trim();
    vscode.postMessage({ command: 'onBrowse', params: file });
}

function onUpload(params) {
    document.getElementById('log').textContent = params;
}

function onResult(params) {
    document.getElementById('result').textContent = params;
}

function upload() {
    const log = document.getElementById('log');
    const file = trimSlash(document.getElementById('file').value.trim());
    const path = trimSlash(document.getElementById('path').value.trim());
    const token = trimSlash(document.getElementById('token').value.trim());
    const branch = trimSlash(document.getElementById('branch').value.trim());
    const message = trimSlash(document.getElementById('message').value.trim());
    const repository = trimSlash(document.getElementById('repository').value.trim());
    const orgnization = trimSlash(document.getElementById('orgnization').value.trim());

    if ('' === file) {
        log.textContent = 'error empty file path';
        return;
    }

    if ('' === path) {
        log.textContent = 'error empty remote path';
        return;
    }

    if ('' === token) {
        log.textContent = 'error empty user token';
        return;
    }

    if ('' === branch) {
        log.textContent = 'error empty branch name';
        return;
    }

    if ('' === message) {
        log.textContent = 'error empty commit message';
        return;
    }

    if ('' === repository) {
        log.textContent = 'error empty code repository';
        return;
    }

    if ('' === orgnization) {
        log.textContent = 'error empty repository owner';
        return;
    }

    log.textContent = '';
    document.getElementById('result').textContent = '';

    vscode.postMessage({ command: 'onUpload', params: { file: file, path: path, token: token, branch: branch, message: message, repository: repository, orgnization: orgnization }});
}

function updateUrl() {
    const orgniz = trimSlash(document.getElementById('orgnization').value.trim());
    const repo   = trimSlash(document.getElementById('repository').value.trim());
    const path   = trimSlash(document.getElementById('path').value.trim());
    document.getElementById('url').value = `https://api.github.com/repos/${orgniz}/${repo}/contents/${path}`;
}