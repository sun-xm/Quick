import * as vscode from 'vscode';
import { cmakeConsole, cmakeQtWidgets, cmakeViewWindow } from './cmake'

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('quick.cmakeConsole', ()=>{
		cmakeConsole(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.cmakeQtWidgets', ()=>{
		cmakeQtWidgets(context);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('quick.cmakeViewWindow', ()=>{
		cmakeViewWindow(context);
	}));
}

export function deactivate() {}
