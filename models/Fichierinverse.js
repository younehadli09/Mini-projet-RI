const mongoose = require('mongoose');

const FichierInverseSchema = new mongoose.Schema({
    terme: { type: String, required: true }, 
    nb_doc: { type: Number, required: true }, 
    posting: [
        {
            fileName: { type: String, required: true }, 
            frequency: { type: Number, required: true } 
        }
    ]
});

module.exports = mongoose.model('FichierInverse', FichierInverseSchema);
