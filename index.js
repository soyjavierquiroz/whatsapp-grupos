const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const client = require('./config/whatsappClient'); // Cliente de WhatsApp

const app = express();
const port = 3000;

let isBotReady = false; // Estado de vinculación del bot

// 🛠️ Middlewares
app.use(cors());
app.use(bodyParser.json());

// 📌 Importar rutas de WhatsApp
const whatsappRoutes = require('./routes/whatsappRoutes');
app.use('/api/whatsapp', whatsappRoutes);

// 📌 Endpoint para verificar el estado del bot
app.get('/api/status', (req, res) => {
    res.json({ 
        whatsappConnected: isBotReady,
        message: isBotReady ? "✅ Bot vinculado y listo" : "⚠️ Bot aún no vinculado"
    });
});

// 📌 Iniciar el servidor INMEDIATAMENTE
app.listen(port, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});

// 📌 Verificar si el bot está vinculado a WhatsApp
console.log("🔍 Verificando estado de vinculación de WhatsApp...");

client.on('ready', () => {
    isBotReady = true;
    console.log('✅ Cliente de WhatsApp listo y vinculado.');
});

// 📌 Si falla la autenticación, mostrar error sin cerrar el servidor
client.on('auth_failure', () => {
    console.error('❌ Fallo de autenticación: El bot no está vinculado a WhatsApp.');
    isBotReady = false;
});

// 📌 Manejo de errores global
app.use((err, req, res, next) => {
    console.error('❌ Error en el servidor:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// 📌 Inicializar WhatsApp
client.initialize();
