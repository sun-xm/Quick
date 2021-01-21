import * as vscode from 'vscode';
import { cmakeConsole } from './cmake'

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('quick.cmakeConsole', ()=>{
		cmakeConsole(context);
	}));
}

export function deactivate() {}
