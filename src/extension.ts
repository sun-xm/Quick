import * as vscode from 'vscode';
import * as cmake from './cmake';
import * as designer from './designer'
import * as electron from './electron';
import * as submodule from './submodule';

export function activate(context: vscode.ExtensionContext) {
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

	context.subscriptions.push(vscode.commands.registerCommand('quick.electronApp', ()=>{
		electron.app(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.electronMod', ()=>{
		electron.mod(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.openUiFile', (uri: vscode.Uri)=>{
		designer.openUiFile(uri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.updateSubmodules', (uri: vscode.Uri)=>{
		submodule.update(uri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.removeSubmodule', (uri: vscode.Uri)=>{
		submodule.remove(uri);
	}));

	// auto hide panel
	vscode.window.onDidChangeTextEditorSelection(selection=>{
		if (vscode.workspace.getConfiguration('quick').get<boolean>('autoHide')) {
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

	submodule.setContext();
}

export function deactivate() {}