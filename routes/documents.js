const express = require('express');
const router = express.Router();
const fs = require("fs");
const path = require('path');
const searchQuery = require('../utils/query')
const Document = require('../models/Document');



const {saveDocumentsFromFolder,saveProcessedDocument} = require('../utils/saveDocumentsFromFolder'); 

router.post('/save', async (req, res) => {
    const folderPath = path.join(__dirname, '../Collection_TIME'); 

    if (!folderPath) {
        return res.status(400).json({ message: 'Folder path is required' });
    }

    try {
        const files = fs.readdirSync(folderPath);

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            if (fs.statSync(filePath).isFile()) {
                const content = fs.readFileSync(filePath, 'utf8');

                // Process and save the processed document (removing double logic)
                await saveProcessedDocument(file, content);
            }
        }

        res.status(200).json({ message: 'Documents saved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error saving documents', error: err.message });
    }
});
const buildInvertedIndexWithTFIDF = require('../utils/creationfichierinverse');

router.post('/build-inverted-index', async (req, res) => {
    try {
        await buildInvertedIndexWithTFIDF(); // Build the inverted index
        res.status(200).json({ message: 'Inverted index created successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating inverted index', error: error.message });
    }
});

router.post('/search', async (req, res) => {
    try {
        const { request } = req.body;

        if (!request) {
            return res.status(400).json({ message: 'Query cannot be empty' });
        }

        // Perform the query logic (assuming `searchQuery` returns an array of file names and scores)
        const results = await searchQuery(request);

        // Fetch matching documents from the database
        const fileNames = results.map(r => r.fileName);
        const documents = await Document.find({ fileName: { $in: fileNames } });
        // Map scores to the corresponding documents
        const documentContents = documents.map(doc => {
            const matchingResult = results.find(r => r.fileName === doc.fileName);
            return {
                fileName: doc.fileName,
                content: doc.content,
                score: matchingResult ? matchingResult.score : 0
            };
        });
        

        res.status(200).json({ results: documentContents });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error searching', error: error.message });
    }
});



module.exports = router;
