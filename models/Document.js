const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    fileName: { type: String },
    content: { type: String},  
    indexdoc: {
        index: [String], 
        frequency: { type: Map, of: Number } 
    }
});

module.exports = mongoose.model('Document', DocumentSchema);
