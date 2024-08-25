// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { readFile } from 'fs/promises';
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
	const disposable = vscode.commands.registerCommand('uploader-netsuite.helloWorld', async () => {
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor) {
			const filePath = activeEditor.document.uri.fsPath;
			console.log(`Archivo activo: ${filePath}`);
			vscode.window.showInformationMessage(`Archivo activo: ${filePath}`);

			const data = await readFile(filePath);
			console.log(data.toString());
			// fs.readFile(filePath, 'utf8', (err, data) => {
			// 	if (err) {
			// 		console.error('Error al leer el archivo:', err);
			// 		return;
			// 	}
			// 	console.log('Contenido del archivo:', data);
			// });
		}
		vscode.window.showInformationMessage('Hello World from uploader-netsuite!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
