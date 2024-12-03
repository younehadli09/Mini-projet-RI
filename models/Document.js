const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    indexdoc: {
        index: [String], 
        frequency: { type: Map, of: Number } 
    }
});

module.exports = mongoose.model('Document', DocumentSchema);
