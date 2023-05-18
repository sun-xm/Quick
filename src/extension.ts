import * as vscode from 'vscode';
import { cmakeConsole, cmakeQtWidgets, cmakeW32View, cmakeCsConsole, cmakeCsWpf, cmakeCsLib } from './cmake';
import { openUiFile } from './designer'
import { electronApp, electronMod } from './electron';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('quick.cmakeConsole', ()=>{
		cmakeConsole(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.cmakeQtWidgets', ()=>{
		cmakeQtWidgets(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.cmakeW32View', ()=>{
		cmakeW32View(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.cmakeCsConsole', ()=>{
		cmakeCsConsole(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.cmakeCsWpf', ()=>{
		cmakeCsWpf(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.cmakeCsLib', ()=>{
		cmakeCsLib(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.electronApp', ()=>{
		electronApp(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.electronMod', ()=>{
		electronMod(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.openUiFile', (uri: vscode.Uri)=>{
		openUiFile(uri);
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

		vscode.commands.executeCommand('workbench.action.closePanel');
	});
}

export function deactivate() {}