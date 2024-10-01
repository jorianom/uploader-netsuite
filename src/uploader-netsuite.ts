
import { readFile } from 'fs/promises';
import axios, { get } from 'axios'
import crypto from 'crypto';
import oauth from 'oauth-1.0a';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';


const fileDownload = async (filePath: string, activeEditor: vscode.TextEditor) => {
    let { url, consumerKey, consumerSecret, accessToken, tokenSecret, realm } = getVariablesAuth();
    let authHeaders = getAuthorization(consumerKey, consumerSecret, accessToken, tokenSecret, realm, url, 'POST');
    try {
        let data = {
            filename: path.basename(filePath),
            method: 'PULL'
        }
        const response = await axios.post(url, data, {
            headers: { ...authHeaders, "Content-Type": "application/json" },
        });

        console.log('Respuesta de NetSuite:', response.data);
        if (!response.data.success) {
            let error = response.data.message;
            message('Hubo un problema al obtener el archivo ' + error, true);
        } else {
            message('Archivo obtenido correctamente');
            updateFile(response.data.fileContent, activeEditor);
        }
    } catch (error) {
        message('Error al obtener el archivo ' + error, true);
        console.error('Error al obtener el archivo:', error);
    }
}

async function sendFile(filePath: string) {
    let { url, consumerKey, consumerSecret, accessToken, tokenSecret, realm } = getVariablesAuth();
    let data = { ...getFileData(filePath), method: 'PUSH' };
    let authHeaders = getAuthorization(consumerKey, consumerSecret, accessToken, tokenSecret, realm, url, 'POST');
    try {
        const response = await axios.post(url, data, {
            headers: {
                ...authHeaders,
            }
        });
        console.log('Respuesta de NetSuite:', response.data);
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

const fileUpload = async (filePath: string) => {
    vscode.window.showInformationMessage(`Archivo activo: ${path.basename(filePath)}`);
    const data = await readFile(filePath);
    let flagValidateFile = validateFile(data.toString(), filePath);
    if (!flagValidateFile) {
        return;
    }
    sendFile(filePath);
}

const getFileData = (filePath: string) => {
    let fileContents = fs.readFileSync(filePath, 'base64');
    let filename = path.basename(filePath);
    return {
        fileContents,
        filename
    }
}

const updateFile = async (data: string, activeEditor: vscode.TextEditor) => {
    if (!activeEditor) {
        vscode.window.showErrorMessage('No hay ningún archivo activo para sobrescribir.');
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
    vscode.window.showInformationMessage('El archivo ha sido sobrescrito y guardado exitosamente.');
}

const getVariablesAuth = () => {
    let config = vscode.workspace.getConfiguration('uploaderNetSuite');
    const url = config.get<string>('urlScript') ?? '';
    const consumerKey = config.get<string>('consumerKey') ?? '';
    const consumerSecret = config.get<string>('consumerSecret') ?? '';
    const accessToken = config.get<string>('accessToken') ?? '';
    const tokenSecret = config.get<string>('tokenSecret') ?? '';
    const realm = config.get<string>('realm') ?? '';
    return { url, consumerKey, consumerSecret, accessToken, tokenSecret, realm };
}

const validateVariablesAuth = () => {
    let variables = getVariablesAuth();
    return Object.values(variables).every(value => value !== null && value !== undefined && value !== '');
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

const validateFile = (data: string, filePath: string) => {
    let flag = true;
    if (!filePath.endsWith('.js')) {
        vscode.window.showErrorMessage('El archivo no es un archivo .js');
        flag = false;
    }
    const hasNApiVersion = data.includes('@NApiVersion');
    const hasNScriptType = data.includes('@NScriptType');
    if (!hasNApiVersion || !hasNScriptType) {
        flag = false;
        vscode.window.showErrorMessage('El archivo no tiene las etiquetas correspondientes de netsuite');
    }
    return flag;
}

function message(message: string, error: boolean = false) {
    if (error) {
        vscode.window.showErrorMessage(message);
    } else {
        vscode.window.showInformationMessage(message);
    }
}

export { fileUpload, fileDownload, validateVariablesAuth }