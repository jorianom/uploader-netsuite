import * as vscode from 'vscode';
import { createSendButton } from '../ui/sendButton';
import { backupFile, compareFiles, getFileData } from './serviceFiles';
import { getVariablesAuth, message } from '../utils/utils';
import axios from 'axios';
import crypto from 'crypto';
import oauth from 'oauth-1.0a';
import path from 'path';

const post = async (url: string, data: any, authHeaders: any) => {
    try {
        const response = await axios.post(url, data, {
            headers: {
                ...authHeaders,
            }
        });
        if (!response.data.success) {
            let error = response.data.message;
            message('Hubo un problema al subir el archivo ' + error, true);
        } else {
            message('Archivo subido correctamente');
        }
    } catch (error) {
        message('Error al enviar el archivo ' + error, true);
        console.error('Error al enviar el archivo:', error);
    }
}

const compareFilePD = async (filePath: string, activeEditor: vscode.TextEditor) => {
    let fileBackup = await fileDownload(filePath, activeEditor, true, true);
    console.log("fileback " + fileBackup);
    if (!fileBackup) {
        message('No fue posible comparar los archivos', true);
        return;
    }
    compareFiles(vscode.Uri.file(filePath), vscode.Uri.file(fileBackup));
    createSendButton(filePath, filePath, fileBackup);
}

const fileDownload = async (filePath: string, activeEditor: vscode.TextEditor, backup: boolean = false, isProd: Boolean = false) => {
    let { url, consumerKey, consumerSecret, accessToken, tokenSecret, realm } = getVariablesAuth(isProd);
    let authHeaders = getAuthorization(consumerKey, consumerSecret, accessToken, tokenSecret, realm, url, 'POST');
    try {
        let data = {
            filename: path.basename(filePath),
            method: 'PULL'
        }
        const response = await axios.post(url, data, {
            headers: { ...authHeaders, "Content-Type": "application/json" },
        });
        if (!response.data.success) {
            let error = response.data.message;
            message('Hubo un problema al recuperar el archivo ' + error, true);
        } else {
            if (backup) {
                return backupFile(data.filename, response.data.fileContent, isProd);
            } else {
                // message('El archivo ha sido recuperado exitosamente.');
                updateFile(response.data.fileContent, activeEditor);
            }
        }
    } catch (error) {
        message('Error al recuperar el archivo ' + error, true);
        console.error('Error al recuperar el archivo:', error);
        return '';
    }
}

const sendPost = async (data: any, isProd: Boolean = false) => {
    let { url, consumerKey, consumerSecret, accessToken, tokenSecret, realm } = getVariablesAuth(isProd);
    let authHeaders = getAuthorization(consumerKey, consumerSecret, accessToken, tokenSecret, realm, url, 'POST');
    try {
        const response = await axios.post(url, data, {
            headers: {
                ...authHeaders,
            }
        });
        if (!response.data.success) {
            let error = response.data.message;
            message('Hubo un problema al subir el archivo ' + error, true);
        } else {
            message('Archivo subido correctamente');
        }
    } catch (error) {
        message('Error al enviar el archivo ' + error, true);
        console.error('Error al enviar el archivo:', error);
    }
}

async function sendFile(filePath: string, isProd: Boolean = false) {
    try {
        let data = { ...getFileData(filePath), method: 'PUSH' };
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            fileDownload(filePath, activeEditor, true);
        } else {
            message('No hay ningún editor activo para hacer backup del archivo.', true);
        }
        sendPost(data);
    } catch (error) {
        message('Error al enviar el archivo ' + error, true);
        console.error('Error al enviar el archivo:', error);
    }
}

const getAuthorization = (consumerKey: string, consumerSecret: string, accessToken: string, tokenSecret: string, realm: string, url: string, method: string) => {
    let oauth1 = new oauth({
        consumer: {
            key: consumerKey,
            secret: consumerSecret,
        },
        signature_method: 'HMAC-SHA256',
        hash_function(base_string, key) {
            return crypto.createHmac('sha256', key).update(base_string).digest('base64');
        },
    });
    let token = {
        key: accessToken,
        secret: tokenSecret,
    };
    const request_data = {
        url: url,
        method: method ?? 'POST',
    };
    const authHeaders = oauth1.toHeader(oauth1.authorize(request_data, token));
    authHeaders['Authorization'] += `, realm="${realm}"`; // Añade el realm
    return authHeaders;
}

const updateFile = async (data: string, activeEditor: vscode.TextEditor) => {
    if (!activeEditor) {
        message('No hay ningún archivo activo para sobrescribir.', true);
        return;
    }
    const document = activeEditor.document;
    const entireRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(document.getText().length)
    );
    await activeEditor.edit(editBuilder => {
        editBuilder.replace(entireRange, data);
    });
    await document.save();
    message('El archivo ha sido sobrescrito y guardado exitosamente.');
}

export { compareFilePD, getAuthorization, sendFile, updateFile, fileDownload, sendPost };