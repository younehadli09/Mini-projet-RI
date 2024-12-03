const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const documentsRoutes = require('./routes/documents');

dotenv.config();

const app = express();

// Middleware pour parser les JSON
app.use(express.json());

// Connexion à MongoDB
mongoose
    .connect(process.env.MONGO_URI, {

    })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.log('Error connecting to MongoDB:', error);
    });

// Définir les routes
const API = process.env.API_URL || '/api';
app.use(`${API}/documents`, documentsRoutes);

// Démarrer le serveur
const PORT =  3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});