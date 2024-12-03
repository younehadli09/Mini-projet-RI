const express = require("express");
const fs = require("fs");
const path = require("path");

const stoplistPath = "/home/matiic/Desktop/Projet RI/stoplist.txt";

let stoplist;
try {
  const stoplistContent = fs.readFileSync(stoplistPath, "utf-8");
  stoplist = stoplistContent.split(/\r?\n/).map(word => word.trim()).filter(word => word);
} catch (error) {
  console.error("Error reading stoplist file:", error.message);
  process.exit(1); 
}

function tokenize(text) {
  return text.split(/[^a-zA-Z]+/).filter((token) => token);
}

// Function to extract a substring
function extract(word, length) {
  return word.slice(0, length);
}

// Function to check for vowels in a word
function hasVowel(word) {
  return /[aeiou]/.test(word);
}

// Function to measure syllable-like structures
function measure(word) {
  return (word.match(/(?:[^aeiou]*[aeiou]+)/g) || []).length;
}

// Function to process individual words
function processWord(word) {
  let L = word.length;

  if (L > 3) {
    if (word.endsWith("ies")) {
      word = extract(word, L - 2);
      L -= 2;
    } else if (word.endsWith("s")) {
      word = extract(word, L - 1);
      L -= 1;
    }
    if (word.endsWith("ed") && hasVowel(extract(word, L - 2))) {
      word = extract(word, L - 1);
      L -= 1;
    }
    if (word.endsWith("y")) {
      word = extract(word, L - 1) + "i";
      L -= 1;
    }
    if (L > 6 && word.endsWith("ation") && measure(word) > 2) {
      word = extract(word, L - 5) + "ate";
      L -= 2;
    }
    if (word.endsWith("ant") && measure(word) > 1) {
      word = extract(word, L - 3);
      L -= 3;
    }
    if (word.endsWith("ate") && measure(word) > 1) {
      word = extract(word, L - 3);
      L -= 3;
    }
    if (word.endsWith("ss") && measure(word) > 1) {
      word = extract(word, L - 1);
      L -= 1;
    }
    if (word.endsWith("al") && measure(word) > 1) {
      word = extract(word, L - 2);
      L -= 2;
    }
    if (word.endsWith("e") && measure(word) > 1) {
      word = extract(word, L - 1);
      L -= 1;
    }
    if (word.endsWith("t") && measure(extract(word, L - 1)) > 1) {
      word = extract(word, L - 1);
      L -= 1;
    }
  }

  return word;
}

// Function to process the entire document
function processDocument(content) {
  const tokens = tokenize(content);
  const index = {};
  const frequency = {};

  for (const token of tokens) {
    const lowerToken = token.toLowerCase();
    if (!stoplist.includes(lowerToken)) {
      const processedWord = processWord(lowerToken);
      if (processedWord in index) {
        frequency[processedWord]++;
      } else {
        index[processedWord] = true;
        frequency[processedWord] = 1;
      }
    }
  }

  return { index: Object.keys(index), frequency };
}



module.exports = processDocument;
