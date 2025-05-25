const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(express.json());

// Servir archivos estáticos
app.use(express.static('public'));

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Servidor funcionando',
        env: process.env.NODE_ENV,
        turso_url: process.env.TURSO_DATABASE_URL ? 'Configurado' : 'No configurado',
        turso_token: process.env.TURSO_AUTH_TOKEN ? 'Configurado' : 'No configurado'
    });
});

// Servir página de candidatos
app.get('/candidatos', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-candidatos.html'));
});

// Servir página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Exportar para Vercel
module.exports = app;
