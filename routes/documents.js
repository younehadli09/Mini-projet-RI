const express = require('express');
const router = express.Router();
const fs = require("fs");
const path = require('path');
const searchQuery = require('../utils/query')


const {saveDocumentsFromFolder,saveProcessedDocument} = require('../utils/saveDocumentsFromFolder'); 

router.post('/save', async (req, res) => {
    const folderPath = "/home/matiic/Desktop/Projet RI/Collection_TIME"; 

    if (!folderPath) {
        return res.status(400).json({ message: 'Folder path is required' });
    }

    try {
        // Save documents from the folder first
        const files = fs.readdirSync(folderPath);

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            if (fs.statSync(filePath).isFile()) {
                const content = fs.readFileSync(filePath, 'utf8');

                // First save the document in its original form
                await saveDocumentsFromFolder(filePath, content);
                
                // Then process and save the processed document
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
        const {request} =  req.body;
        const query = request
        if (!query) {
            return res.status(400).json({ message: 'Query cannot be empty' });
        }
        const results = await searchQuery(query);
        res.status(200).json({ results });
    } catch (error) {
        res.status(500).json({ message: 'Error searching', error: error.message });
    }
});

module.exports = router;