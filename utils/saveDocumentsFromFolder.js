const fs = require('fs');
const path = require('path');
const Document = require('../models/Document'); 
const processDocument = require('../utils/indexdocument');

async function saveDocumentsFromFolder(filePath, content) {
    try {
        const existingDocument = await Document.findOne({ fileName: filePath });
        if (existingDocument) {
            console.log(`Document already exists: ${filePath}`);
            return;
        }

        const document = new Document({ fileName: filePath, content });
        await document.save();
        console.log("Document saved:", filePath);
    } catch (error) {
        console.error('Error saving document:', error.message);
    }
}

async function saveProcessedDocument(fileName, content) {
    try {
        const existingDocument = await Document.findOne({ fileName });
        if (existingDocument) {
            console.log(`Processed document already exists: ${fileName}`);
            return;
        }

        const { index, frequency } = processDocument(content);
        const document = new Document({
            fileName,
            content,
            indexdoc: { index, frequency }
        });
        await document.save();
        console.log("Processed document saved successfully!");
    } catch (error) {
        console.error("Error saving processed document:", error.message);
    }
}


module.exports = {saveDocumentsFromFolder,saveProcessedDocument};
