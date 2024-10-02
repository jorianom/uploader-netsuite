// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as uploaderNetsuite from './uploader-netsuite';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Gracias, la extensión "uploader-netsuite" esta activa!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const pushFile = vscode.commands.registerCommand('uploader-netsuite.Netsuite:Push File', async () => {
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor) {
			const document = activeEditor.document;
			if (document.isDirty) {
				await document.save();
			}
			if (uploaderNetsuite.validateVariablesAuth()) {
				const filePath = activeEditor.document.uri.fsPath;
				uploaderNetsuite.fileUpload(filePath);
			} else {
				uploaderNetsuite.message('Por favor, configure las variables de autenticación en el archivo settings.json', true);
			}
		} else {
			uploaderNetsuite.message('No hay ningún editor activo para subir el archivo.', true);
		}
	});

	const pullFile = vscode.commands.registerCommand('uploader-netsuite.Netsuite:Pull File', async () => {
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor) {
			const filePath = activeEditor.document.uri.fsPath;
			uploaderNetsuite.fileDownload(filePath, activeEditor);
		} else {
			uploaderNetsuite.message('No hay ningún editor activo para descargar el archivo.', true);
		}
	});

	context.subscriptions.push(pushFile);
	context.subscriptions.push(pullFile);
}

// This method is called when your extension is deactivated
export function deactivate() { }
