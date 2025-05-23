import * as vscode 		from 'vscode';
import * as cmake 		from './cmake';
import * as config 		from './config';
import * as designer 	from './designer';
import * as electron 	from './electron';
import * as housekeep 	from './housekeep';
import * as mywebview 	from './mywebview';
import * as nodejs 		from './nodejs';
import * as submodule 	from './submodule';
import * as unchange 	from './unchange';

export function activate(context: vscode.ExtensionContext) {
	setStorage(context.storageUri);
	setAutoHide();

	submodule.monitor(context);
	unchange.monitor(context);

	context.subscriptions.push(vscode.commands.registerCommand('quick.cmakeConsole', ()=>{
		cmake.console(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.cmakeQtWidgets', ()=>{
		cmake.qtWidgets(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.cmakeW32View', ()=>{
		cmake.w32View(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.cmakeCsConsole', ()=>{
		cmake.csConsole(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.cmakeCsWpf', ()=>{
		cmake.csWpf(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.cmakeCsLib', ()=>{
		cmake.csLib(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.cmakeTargets', async()=>{
		await vscode.commands.executeCommand('cmake.setDefaultTarget');
		vscode.commands.executeCommand('cmake.selectLaunchTarget');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.electronApp', ()=>{
		electron.app(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.electronMod', ()=>{
		electron.mod(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.nodejsProject', ()=>{
		nodejs.project(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.openUiFile', (uri: vscode.Uri)=>{
		designer.openUiFile(uri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.addSubmodule', ()=>{
		submodule.add();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.initSubmodules', (uri: vscode.Uri)=>{
		submodule.initAll();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.initSubmodule', ()=>{
		submodule.init();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.updateSubmodules', (uri: vscode.Uri)=>{
		submodule.updateAll();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.updateSubmodule', (uri: vscode.Uri)=>{
		submodule.update(uri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.removeSubmodule', (uri: vscode.Uri)=>{
		submodule.remove(uri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.webview', async()=>{
		mywebview.start();
	}));
}

export async function deactivate() {
	if (config.cleanupOnExit()) {
		await housekeep.cleanup();
	}
	if (config.cleanAllOnExit()) {
		await housekeep.cleanAll();
	}

	if (outchan) {
		outchan.dispose();
	}
}

export function output(info: string) {
	if (!outchan) {
		outchan = vscode.window.createOutputChannel('quick');
	}
	outchan.append(info);
	outchan.show();
}

export let extStorage: vscode.Uri;
export let wspStorage: vscode.Uri;
export let usrStorage: vscode.Uri;

function setStorage(uri: vscode.Uri | undefined) {
    if (uri) {
        extStorage = uri;

		let idx = uri.path.lastIndexOf('/');
		if (idx > 0) {
			idx = uri.path.lastIndexOf('/', idx - 1);
		}
		wspStorage = vscode.Uri.file(uri.path.substring(0, idx));
		usrStorage = vscode.Uri.joinPath(wspStorage, '../');

		console.debug(wspStorage);
		console.debug(usrStorage);
    }
}

function setAutoHide() {
	vscode.window.onDidChangeTextEditorSelection(selection=>{
		if (!config.panelAutoHide()) {
			return;
		}

		if (vscode.debug.activeDebugSession) {
			return;
		}

		if (vscode.TextEditorSelectionChangeKind.Mouse != selection.kind) {
			return;
		}

		if (1 != selection.selections.length) {
			return;
		}

		if (!selection.selections[0].isEmpty) {
			return;
		}

		let name = vscode.window.activeTextEditor?.document.fileName;
		if (!name?.includes('.') && !name?.includes('\\') && !name?.includes('/')) {
			return;
		}

		if (name.startsWith('extension-output-ms-vscode.')) {
			return;
		}

		vscode.commands.executeCommand('workbench.action.closePanel');
	});
}

let outchan: vscode.OutputChannel;