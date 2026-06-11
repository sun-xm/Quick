const vscode = acquireVsCodeApi();

window.addEventListener('message', event=>{
    switch (event.data.command) {
        case 'onBrowse': {
            document.getElementById('file').value = event.data.params;
            break;
        }

        case 'onUpload': {
            document.getElementById('progress').value = Number(event.data.params.match(/(\d+(?:\.\d+)?)%/)?.[1]);
            break;
        }

        case 'onResult': {
            document.getElementById('upload').disabled = false;
            document.getElementById('result').textContent = event.data.params;
            break;
        }

        case 'onToken': {
            document.getElementById('token').value = event.data.params;
            break;
        }
    }
});

function trimSlash(str) {
    return str.replace(/^\/+|\/+$/g, '');
}

function updateMsg() {
    document.getElementById('message').value = `Upload "${document.getElementById('path').value}"`;
}

function browse() {
    const file = document.getElementById('file').value.trim();
    vscode.postMessage({ command: 'onBrowse', params: file });
}

function upload() {
    const rst = document.getElementById('result');
    const file = trimSlash(document.getElementById('file').value.trim());
    const path = trimSlash(document.getElementById('path').value.trim());
    const token = trimSlash(document.getElementById('token').value.trim());
    const branch = trimSlash(document.getElementById('branch').value.trim());
    const message = trimSlash(document.getElementById('message').value.trim());
    const repository = trimSlash(document.getElementById('repository').value.trim());
    const orgnization = trimSlash(document.getElementById('orgnization').value.trim());

    const result = document.getElementById('result');

    if ('' === file) {
        result.textContent = 'error empty file path';
        return;
    }

    if ('' === path) {
        result.textContent = 'error empty remote path';
        return;
    }

    if ('' === token) {
        result.textContent = 'error empty user token';
        return;
    }

    if ('' === branch) {
        result.textContent = 'error empty branch name';
        return;
    }

    if ('' === message) {
        result.textContent = 'error empty commit message';
        return;
    }

    if ('' === repository) {
        result.textContent = 'error empty code repository';
        return;
    }

    if ('' === orgnization) {
        result.textContent = 'error empty repository owner';
        return;
    }

    result.textContent = 'Uploading ...';
    document.getElementById('upload').disabled = true;
    document.getElementById('progress').value = 0;

    vscode.postMessage({ command: 'onUpload', params: { file: file, path: path, token: token, branch: branch, message: message, repository: repository, orgnization: orgnization }});
}