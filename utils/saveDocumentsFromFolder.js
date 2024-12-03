const fs = require('fs');
const path = require('path');
const Document = require('../models/Document'); 
const processDocument = require('../utils/indexdocument');

async function saveDocumentsFromFolder(filePath, content) {
    try {
        const document = new Document({
            fileName: filePath,
            content: content,
        });

        await document.save();
        console.log("Fichier enregistré:", filePath);
    } catch (error) {
        console.error('Error saving document:', error.message);
    }
}

async function saveProcessedDocument(fileName, content) {
    const { index, frequency } = processDocument(content);

    const document = new Document({
        fileName,
        content,
        indexdoc: {
            index,    // Array of unique words
            frequency // Object with word frequencies
        }
    });

    try {
        await document.save();
        console.log("Processed document saved successfully!");
    } catch (error) {
        console.error("Error saving processed document:", error.message);
        throw error;
    }
}


module.exports = {saveDocumentsFromFolder,saveProcessedDocument};
