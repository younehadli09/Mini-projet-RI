const Document = require('../models/Document');
const FichierInverse = require('../models/Fichierinverse');
const mongoose = require('mongoose');

async function buildInvertedIndexWithTFIDF() {
    try {
        const documents = await Document.find(); // Fetch all documents
        const totalDocs = documents.length; // Total number of documents in the collection

        if (totalDocs === 0) {
            console.log("No documents found in the collection.");
            return;
        }

        const invertedIndex = {}; // Object to hold terms and their data

        // Build the inverted index
        for (const doc of documents) {
            const { fileName, indexdoc } = doc;
            const { index, frequency } = indexdoc;
            console.log(indexdoc.index)

            // Iterate over each term in the document
            for (const term of index) {
                // Skip terms with undefined frequency
                if (frequency.get(term) === undefined || isNaN(frequency.get(term))) {
                    continue;
                }

          
                const tf = frequency.get(term); // Frequency of the term in the document
                
                // Initialize the term in the inverted index if not already present
                if (!invertedIndex[term]) {
                    invertedIndex[term] = {
                        nb_doc: 0, // Number of documents containing this term
                        posting: [] // Posting list for the term
                    };
                }

                // Add this document to the term's posting list
                invertedIndex[term].posting.push({
                    fileName: fileName,
                    tf: tf // Store the term frequency for now
                });

                // Increment the document count for this term
                invertedIndex[term].nb_doc += 1;
            }
        }

        for (const term in invertedIndex) {
            const termData = invertedIndex[term];
            const { nb_doc, posting } = termData;

            // Calculate IDF for the term
            const idf = Math.log10(totalDocs/nb_doc);

            // Sort the posting list alphabetically by fileName
            posting.sort((a, b) => a.fileName.localeCompare(b.fileName));

            // Calculate tf*idf for each document in the posting list
            const updatedPosting = posting.map(post => {
                const tfidf = post.tf * idf;

                // Ensure that the frequency (tf * idf) is a valid number
                if (isNaN(tfidf)) {
                    console.warn(`Invalid tf*idf value for term: ${term} in document: ${post.fileName}`);
                    return null; // Skip invalid entries
                }

                return {
                    fileName: post.fileName,
                    frequency: tfidf // tf*idf calculation
                };
            }).filter(post => post !== null); // Filter out any null entries

            // Create or update the term in the FichierInverse collection
            // await FichierInverse.updateOne(
            //     { terme: term }, // Find the document by term
            //     {
            //         terme: term,
            //         nb_doc: nb_doc,
            //         posting: updatedPosting
            //     },
            //     { upsert: true } // Create a new document if it doesn't exist
            // );
        }

        console.log("Inverted index with tf*idf has been built and saved successfully!");
    } catch (error) {
        console.error("Error building the inverted index with tf*idf:", error.message);
    }
}

module.exports = buildInvertedIndexWithTFIDF;
