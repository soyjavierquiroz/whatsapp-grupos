// Cargar variables de entorno desde .env (si existe)
require('dotenv').config();

// Importar Express para crear el servidor web
const express = require('express');
const app = express();

const client = require('./whatsapp');
client.initialize();

// Middleware para parsear JSON en las solicitudes
app.use(express.json());

// Ruta de prueba para verificar que el servidor funciona
app.get('/', (req, res) => {
    res.send('🚀 Servidor WhatsApp Bot funcionando!');
});

// Definir el puerto (usar .env o valor por defecto 3000)
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
