const fs = require('fs');
const express = require('express');
const router = express.Router();
const Document = require('../models/Document'); 
const FichierInverse = require('../models/Fichierinverse');
const mongoose = require('mongoose');
const stoplistPath = "/home/matiic/Desktop/Projet RI/stoplist.txt";




const stoplist = fs
    .readFileSync(stoplistPath, 'utf-8')
    .split(/\r?\n/) // Split into lines
    .map(word => word.trim().toLowerCase()); // Trim and normalize to lowercase



function indexQuery(query) {
    const tokens = query.split(/[\s\W]+/); // Tokenisation
    const indexedTerms = {};
    const frequencies = {};

    for (let token of tokens) {
        token = token.toLowerCase().trim(); // Normalisation en minuscules
        if (stoplist.includes(token)) {
            console.log(`Skipping stop word: ${token}`);
            continue;
        }
            console.log("Token:", token);
console.log("Stoplist match:", stoplist.includes(token));


        // Étape de traitement linguistique
        let word = token;
        let length = word.length;

        if (length > 3) {
            if (word.endsWith('ies')) word = word.slice(0, -2);
            else if (word.endsWith('s')) word = word.slice(0, -1);
            else if (word.endsWith('y')) word = word.slice(0, -1) + 'i';
            if (word.length > 6 && word.endsWith('ation')) word = word.slice(0, -5) + 'ate';
            else if (word.endsWith('ant')) word = word.slice(0, -3);
            else if (word.endsWith('ate')) word = word.slice(0, -3);
            else if (word.endsWith('ss')) word = word.slice(0, -1);
            else if (word.endsWith('al')) word = word.slice(0, -2);
            else if (word.length > 3 && word.endsWith('e')) word = word.slice(0, -1);
            if (word.endsWith('eed') ) word = word.slice(0,-1);
            else if (word.endsWith('ed') && /[aeiou]/.test(word.slice(0, -2))) word = word.slice(0, -1);



           
    
        }

        // Ajouter le mot à l'index
        if (!indexedTerms[word]) {
            indexedTerms[word] = true;
            frequencies[word] = 1;
        } else {
            frequencies[word]++;
        }
    }
   
    return { indexedTerms: Object.keys(indexedTerms), frequencies };
}


async function searchQuery(query) {
    const { indexedTerms, frequencies } = indexQuery(query);
    console.log(indexedTerms);

    const results = {}; // Contiendra le RSV pour chaque document
    const allTermsData = await FichierInverse.find({
        terme: { $in: indexedTerms }
    });

    for (const termData of allTermsData) {
        const term = termData.terme;
        const tfQuery = frequencies[term] || 0; // TF uniquement pour la requête

        for (const posting of termData.posting) {
            const fileName = posting.fileName;
            const tfDoc = posting.frequency; // Poids (tf-idf) pré-calculé dans fichier_inverse

            if (!results[fileName]) results[fileName] = 0;
            results[fileName] += tfDoc * tfQuery; // Produit scalaire (RSV)
        }
    }

    // Trier les documents par RSV décroissant
    const sortedResults = Object.entries(results)
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
        .map(([fileName, score]) => ({ fileName, score }));
        console.log(indexedTerms);
    return sortedResults;
}

module.exports =  searchQuery;