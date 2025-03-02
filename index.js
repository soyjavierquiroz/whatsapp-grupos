const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Importar rutas de WhatsApp
const whatsappRoutes = require('./routes/whatsapp');
app.use('/api/whatsapp', whatsappRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});
