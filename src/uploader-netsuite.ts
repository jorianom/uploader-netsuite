
import { readFile } from 'fs/promises';
import axios, { get } from 'axios'
import crypto from 'crypto';
import oauth from 'oauth-1.0a';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';


const fileDownload = async (filePath: string, activeEditor: vscode.TextEditor, backup: boolean = false) => {
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
        if (!response.data.success) {
            let error = response.data.message;
            message('Hubo un problema al recuperar el archivo ' + error, true);
        } else {
            if (backup) {
                backupFile(data.filename, response.data.fileContent);
            } else {
                // message('El archivo ha sido recuperado exitosamente.');
                updateFile(response.data.fileContent, activeEditor);
            }
        }
    } catch (error) {
        message('Error al recuperar el archivo ' + error, true);
        console.error('Error al recuperar el archivo:', error);
    }
}

async function sendFile(filePath: string) {
    let { url, consumerKey, consumerSecret, accessToken, tokenSecret, realm } = getVariablesAuth();
    let data = { ...getFileData(filePath), method: 'PUSH' };
    let authHeaders = getAuthorization(consumerKey, consumerSecret, accessToken, tokenSecret, realm, url, 'POST');
    try {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            fileDownload(filePath, activeEditor, true);
        } else {
            message('No hay ningún editor activo para hacer backup del archivo.', true);
        }
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
const createBackupFolder = (workspaceFolders: vscode.WorkspaceFolder[]) => {
    const currentDir = workspaceFolders[0].uri.fsPath;
    const backupFolderPath = path.join(currentDir, 'backup');
    if (!fs.existsSync(backupFolderPath)) {
        fs.mkdirSync(backupFolderPath);
        // message('Carpeta de respaldo creada correctamente.');
    }
}
const backupFile = async (filename: string, fileContent: string) => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        message('No hay carpetas abiertas en el espacio de trabajo.', true);
        return;
    }
    createBackupFolder(Array.from(workspaceFolders));
    const currentDir = workspaceFolders[0].uri.fsPath;
    const backupFilePath = path.join(currentDir, 'backup', filename);
    if (fs.existsSync(backupFilePath)) {
        return;
    }
    fs.writeFile(backupFilePath, fileContent, 'utf8', (err) => {
        if (err) {
            message('Error al guardar el archivo ' + err.message, true);
        } else {
            message('Archivo guardado correctamente en backup');
        }
    });
}
const fileUpload = async (filePath: string) => {
    message('Archivo en proceso de envío... ' + path.basename(filePath));
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
        message('El archivo no es un archivo .js', true);
        flag = false;
    }
    const hasNApiVersion = data.includes('@NApiVersion');
    const hasNScriptType = data.includes('@NScriptType');
    if (!hasNApiVersion || !hasNScriptType) {
        flag = false;
        message('El archivo no tiene las etiquetas correspondientes de netsuite', true);
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

export { fileUpload, fileDownload, validateVariablesAuth, message }