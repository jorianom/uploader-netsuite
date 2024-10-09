/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * Version    Date            Author               
 * 1.00       2024            GitHub -> @jorianom       
 */
define(['N/file', 'N/log', 'N/query', "N/encode", "N/runtime"], function (file, log, query, encode, runtime) {

    function post(context) {
        try {
            if (context.method == 'PUSH') {
                let uploadedFile = context;
                if (uploadedFile) {
                    const { name, folder } = verifiyFileNetsuite(uploadedFile.filename);
                    submitFile(name, folder, uploadedFile.fileContents);
                    return { success: true };
                } else {
                    return { success: false, message: 'No se recibió ningún archivo' };
                }
            }
            if (context.method == 'PULL') {
                const { id } = verifiyFileNetsuite(context.filename);
                let fileObj = file.load({ id: id });
                let fileContent = fileObj.getContents();
                return { success: true, fileContent };
            }
        } catch (e) {
            log.error('Error en post', e.message);
            return { success: false, message: e.message };
        }
    }

    function sqlQuery(queryStr) {
        let resultSet = query.runSuiteQL({
            query: queryStr
        });
        let result = resultSet.asMappedResults();
        return result;
    }

    function verifiyFileNetsuite(filename, updateContent) {
        let strQuery = `SELECT id, name, folder FROM File WHERE filetype='JAVASCRIPT' and UPPER(name) = UPPER('${filename}')`;
        let result = sqlQuery(strQuery)[0];
        if (!result) {
            throw new Error('No se encontró ningún archivo con ese nombre.');
        } else {
            return { name: result.name, folder: result.folder, id: result.id };
        }
    }

    function submitFile(filename, fileFolderId, updateContent) {
        let newContent = encode.convert({
            string: updateContent,
            inputEncoding: encode.Encoding.BASE_64,
            outputEncoding: encode.Encoding.UTF_8
        });
        let fileObj = file.create({
            name: filename,
            fileType: file.Type.PLAINTEXT,
            contents: newContent,
            encoding: file.Encoding.UTF8,
            folder: fileFolderId
        });
        let updatedFileId = fileObj.save();
        log.debug('Update File ID:', updatedFileId);
    }
    return {
        post: post
    };
});
