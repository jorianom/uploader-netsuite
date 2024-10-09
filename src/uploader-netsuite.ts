import { ValidateConfig, validateEditor } from './utils/utils';
import { fileUpload } from './services/serviceFiles';
import { compareFilePD, fileDownload } from './services/serviceNetsuite';

const pushFile = () => {
    const activeEditor = validateEditor(true);
    const filePath = ValidateConfig();
    if (filePath && activeEditor) {
        fileUpload(filePath);
    }
}

const pullFile = () => {
    const activeEditor = validateEditor();
    const filePath = ValidateConfig();
    if (filePath && activeEditor) {
        fileDownload(filePath, activeEditor);
    }
}

const pushFilePD = async () => {
    const activeEditor = validateEditor(true);
    const filePath = ValidateConfig(true);
    if (filePath && activeEditor) {
        compareFilePD(filePath, activeEditor);
    }
}

export { pushFile, pushFilePD, pullFile };