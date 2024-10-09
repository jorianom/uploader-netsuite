import * as vscode from 'vscode';
import { sendPost } from '../services/serviceNetsuite';
import { getFileData } from '../services/serviceFiles';
import { saveFileByPath } from '../utils/utils';

const createSendButton = (localFilePath: string) => {
    const sendButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    sendButton.text = `$(cloud-upload) Enviar archivo a NetSuite`;
    sendButton.tooltip = 'Clic para enviar el archivo a NetSuite';
    sendButton.command = 'uploader-netsuite.sendFileToNetSuitePD';  // El comando que ejecutará el envío
    sendButton.show();
    vscode.commands.getCommands(true).then((commands) => {
        if (!commands.includes('uploader-netsuite.sendFileToNetSuitePD')) {
            vscode.commands.registerCommand('uploader-netsuite.sendFileToNetSuitePD', async () => {
                // sendButton.dispose();
                showSendNotification(localFilePath);
            });
        }
    });
};

const showSendNotification = (localFilePath: string) => {
    vscode.window.showInformationMessage(
        '¿Deseas enviar el archivo a NetSuite?',
        'Enviar',
        'Cancelar'
    ).then(selection => {
        if (selection === 'Enviar') {
            saveFileByPath(localFilePath);
            let data = { ...getFileData(localFilePath), method: 'PUSH' };
            sendPost(data, true);
        } else {
            vscode.window.showInformationMessage('Envio cancelado.');
        }
    });
};

export { createSendButton, showSendNotification };