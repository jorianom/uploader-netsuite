import { message } from "../utils/utils";
import { sendFile } from "./serviceNetsuite";
import * as vscode from 'vscode';
import * as fs from 'fs';
import path from "path";
import { readFile } from "fs/promises";

const backupFile = async (filename: string, fileContent: string, isProd: Boolean = false) => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        message('No hay carpetas abiertas en el espacio de trabajo.', true);
        return '';
    }
    let backupFolder = `backup${isProd ? 'PD' : ''}`;
    createBackupFolder(Array.from(workspaceFolders), backupFolder);
    const currentDir = workspaceFolders[0].uri.fsPath;
    const backupFilePath = path.join(currentDir, backupFolder, filename);
    if (fs.existsSync(backupFilePath)) {
        return backupFilePath;
    }
    try {
        await fs.promises.writeFile(backupFilePath, fileContent, 'utf8');
        message('Archivo guardado correctamente en backup');
        return backupFilePath;
    } catch (error: any) {
        message('Error al guardar el archivo ' + error.message, true);
        return '';
    }
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

const compareFiles = (file1Uri: vscode.Uri, file2Uri: vscode.Uri) => {
    const title = `Comparación entre Archivo Local y Archivo PROD`;
    vscode.commands.executeCommand('vscode.diff', file1Uri, file2Uri, title)
        .then(
            () => console.log('Comparación de archivos realizada con éxito.'),
            (err) => vscode.window.showErrorMessage(`Error comparando archivos: ${err}`)
        );
}


const createBackupFolder = (workspaceFolders: vscode.WorkspaceFolder[], backupFolder: string) => {
    const currentDir = workspaceFolders[0].uri.fsPath;
    const backupFolderPath = path.join(currentDir, backupFolder);
    if (!fs.existsSync(backupFolderPath)) {
        fs.mkdirSync(backupFolderPath);
        // message('Carpeta de respaldo creada correctamente.');
    }
}

export { compareFiles, fileUpload, backupFile, getFileData, validateFile, createBackupFolder };