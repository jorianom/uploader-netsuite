
import { readFile } from 'fs/promises';
import axios from 'axios'
import crypto from 'crypto';
import oauth from 'oauth-1.0a';
import FormData from 'form-data';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const fielUpload = async (filePath: string) => {
    vscode.window.showInformationMessage(`Archivo activo: ${path.basename(filePath)}`);

    const data = await readFile(filePath);
    let flagValidateFile = validateFile(data.toString(), filePath);
    if (!flagValidateFile) {
        return;
    }
    sendFile(filePath);
}
async function sendFile(filePath: string) {
    const config = vscode.workspace.getConfiguration('uploaderNetSuite');

    const url = config.get<string>('urlScript') ?? '';
    const consumerKey = config.get<string>('consumerKey') ?? '';
    const consumerSecret = config.get<string>('consumerSecret') ?? '';
    const accessToken = config.get<string>('accessToken') ?? '';
    const tokenSecret = config.get<string>('tokenSecret') ?? '';
    const realm = config.get<string>('realm') ?? '';

    // Crear un objeto FormData
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    let fileContents = fs.readFileSync(filePath, 'base64');
    let filename = path.basename(filePath);
    const data = {
        fileContents,
        filename
    }
    console.log('Form Data:', form);
    let oauth1 = new oauth({
        consumer: {
            key: consumerKey,
            secret: consumerSecret,
        },
        signature_method: 'HMAC-SHA256',
        hash_function(base_string, key) {

            console.log('Base String:', base_string);
            console.log('Key:', key);
            return crypto.createHmac('sha256', key).update(base_string).digest('base64');
        },
    });
    let token = {
        key: accessToken,
        secret: tokenSecret,
    };
    const request_data = {
        url: url,
        method: 'POST',
    };

    const authHeaders = oauth1.toHeader(oauth1.authorize(request_data, token));
    authHeaders['Authorization'] += `, realm="${realm}"`; // Añade el realm
    console.log('Headers:', authHeaders['Authorization']);
    try {
        // Enviar la petición POST
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

const getAuthorization = (consumerKey: string, consumerSecret: string, accessToken: string, tokenSecret: string, realm: string) => {
    const oauthTimestamp = Math.floor(Date.now() / 1000);
    const oauthNonce = crypto.randomBytes(16).toString('hex');
    const oauthSignatureMethod = 'HMAC-SHA256';
    const oauthVersion = '1.0';
    // Generar `oauth_signature`
    const baseString = 'tu_base_string'; // Reemplaza con tu base string (URL, parámetros, etc.)
    const signingKey = 'consumer_secret&token_secret'; // Reemplaza con tu consumer secret y token secret

    const oauthSignature = crypto.createHmac('sha256', signingKey)
        .update(baseString)
        .digest('base64');

    // Crear el header de autorización OAuth
    const authHeader = `OAuth realm="${realm}",oauth_consumer_key="${consumerKey}",oauth_token="${accessToken}",oauth_signature_method="${oauthSignatureMethod}",oauth_timestamp="${oauthTimestamp}",oauth_nonce="${oauthNonce}",oauth_version="${oauthVersion}",oauth_signature="${encodeURIComponent(oauthSignature)}"`;
    return authHeader;
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

export { fielUpload }