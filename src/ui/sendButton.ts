import * as vscode from 'vscode';
import { sendPost } from '../services/serviceNetsuite';
import { getFileData } from '../services/serviceFiles';
import { closeWindow, saveFileByPath } from '../utils/utils';
import path from 'path';

let sendButton: vscode.StatusBarItem | undefined;

const createSendButton = (localFilePath: string, compareFilePath: string, compareFileBackupPath: string) => {
    if (sendButton) {
        sendButton.show();
        return;
    }
    sendButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    sendButton.text = `$(cloud-upload) Enviar archivo a NetSuite`;
    sendButton.tooltip = 'Clic para enviar el archivo a NetSuite';
    sendButton.command = 'uploader-netsuite.sendFileToNetSuitePD';  // El comando que ejecutará el envío
    sendButton.show();
    const disposable = vscode.commands.registerCommand('uploader-netsuite.sendFileToNetSuitePD', async () => {
        showSendNotification(localFilePath, sendButton);
    });
    // Escuchar el cierre del editor de comparación
    const closeListener = vscode.workspace.onDidCloseTextDocument((closedDocument) => {
        if (closedDocument.uri.fsPath === compareFilePath || closedDocument.uri.fsPath === compareFileBackupPath) {
            sendButton?.dispose();
            sendButton = undefined;
            closeListener.dispose();
        }
    });
    vscode.workspace.onDidCloseTextDocument(() => {
        disposable.dispose();
    });
};

const showSendNotification = (localFilePath: string, sendButton: vscode.StatusBarItem | undefined) => {
    vscode.window.showInformationMessage(
        `¿Deseas enviar el archivo: ${path.basename(localFilePath)} a NetSuite?`,
        'Enviar',
        'Cancelar'
    ).then(selection => {
        if (selection === 'Enviar') {
            saveFileByPath(localFilePath);
            let data = { ...getFileData(localFilePath), method: 'PUSH' };
            sendPost(data, true);
            sendButton?.dispose();
            sendButton = undefined;
            closeWindow();
        } else {
            vscode.window.showInformationMessage('Envio cancelado.');
        }
    });
};

export { createSendButton, showSendNotification };