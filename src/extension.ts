import * as vscode from 'vscode';
import { cmakeConsole, cmakeQtWidgets, cmakeW32View } from './cmake';
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

	context.subscriptions.push(vscode.commands.registerCommand('quick.electronApp', ()=>{
		electronApp(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.electronMod', ()=>{
		electronMod(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.openUiFile', (uri: vscode.Uri)=>{
		openUiFile(uri);
	}));
}

export function deactivate() {}
