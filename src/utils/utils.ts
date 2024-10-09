import * as vscode from 'vscode';


const message = (message: string, error: boolean = false) => {
    if (error) {
        vscode.window.showErrorMessage(message);
    } else {
        vscode.window.showInformationMessage(message);
    }
}

const getVariablesAuth = (isProd: Boolean = false) => {
    let config = vscode.workspace.getConfiguration(`uploaderNetsuite`) ?? '';
    const url = config.get<string>(`urlScript${isProd ? 'PD' : ''}`) ?? '';
    const consumerKey = config.get<string>(`consumerKey${isProd ? 'PD' : ''}`) ?? '';
    const consumerSecret = config.get<string>(`consumerSecret${isProd ? 'PD' : ''}`) ?? '';
    const accessToken = config.get<string>(`accessToken${isProd ? 'PD' : ''}`) ?? '';
    const tokenSecret = config.get<string>(`tokenSecret${isProd ? 'PD' : ''}`) ?? '';
    const realm = isProd ? config.get<string>('realm')?.replace('_SB2', '') ?? '' : config.get<string>('realm') ?? '';

    return { url, consumerKey, consumerSecret, accessToken, tokenSecret, realm };
}

const validateVariablesAuth = (isProd: Boolean = false) => {
    let variables = getVariablesAuth(isProd);
    return Object.values(variables).every(value => value !== null && value !== undefined && value !== '');
}

const validateEditor = (flag: Boolean = false) => {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        const document = activeEditor.document;
        if (document.isDirty) {
            document.save();
        }
        return activeEditor;
    } else {
        message('No hay ningún editor activo para subir el archivo.', true);
        return null;
    }
}

const saveFileByPath = async (filePath: string) => {
    try {
        const document = await vscode.workspace.openTextDocument(filePath);
        if (document.isDirty) {
            await document.save();
        }
    } catch (error) {
        message('Error al intentar guardar el archivo: ' + error, true);
    }
};

const ValidateConfig = (isProd: Boolean = false) => {
    if (validateVariablesAuth(isProd)) {
        const filePath = validateEditor()?.document.uri.fsPath;
        return filePath
    } else {
        message('Por favor, configure las variables de autenticación en el archivo settings.json', true);
        return '';
    }
}

const closeWindow = () => {
    vscode.commands.executeCommand('workbench.action.closeActiveEditor')
        .then(
            () => console.log('cerrada con éxito.'),
            (err) => console.log(`Error cerrando la ventana: ${err}`)
        );
};

export { message, getVariablesAuth, validateVariablesAuth, validateEditor, ValidateConfig, saveFileByPath, closeWindow };