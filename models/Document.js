const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    fileName: { type: String, unique: true, required: true },
    content: { type: String, required: true },
    indexdoc: {
        index: [String],
        frequency: mongoose.Schema.Types.Mixed
    }
});

module.exports = mongoose.model('Document', DocumentSchema);