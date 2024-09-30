// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { readFile } from 'fs/promises';
import * as uploaderNetsuite from './uploader-netsuite';
import * as fs from 'fs';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "uploader-netsuite" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const pushFile = vscode.commands.registerCommand('uploader-netsuite.Netsuite:Push File', async () => {
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor) {
			
			const document = activeEditor.document;
			if (document.isDirty) {
				await document.save();
				vscode.window.showInformationMessage(`Archivo guardado: ${document.fileName}`);
			}
			const filePath = activeEditor.document.uri.fsPath;
			uploaderNetsuite.fileUpload(filePath);
		}
	});
	const pullFile = vscode.commands.registerCommand('uploader-netsuite.Netsuite:Pull File', async () => {
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor) {
			const filePath = activeEditor.document.uri.fsPath;
			uploaderNetsuite.fileDownload(filePath);
		}
	});

	context.subscriptions.push(pushFile);
	context.subscriptions.push(pullFile);
}

// This method is called when your extension is deactivated
export function deactivate() { }
