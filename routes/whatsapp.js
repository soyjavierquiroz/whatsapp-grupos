const express = require('express');
const router = express.Router();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const os = require('os'); // Detectar el sistema operativo

console.log(`🖥️ Sistema operativo detectado: ${os.platform()}`);

// Configuración del cliente de WhatsApp

const clientConfig = {
    puppeteer: {
        headless: true,
        args: process.platform === 'linux' ? ['--no-sandbox', '--disable-setuid-sandbox'] : []
    },
};


// Usar LocalAuth solo en DigitalOcean (Linux)
if (os.platform() === 'linux') {
    console.log('🟢 Ejecutando en Linux: Usando LocalAuth');
    clientConfig.authStrategy = new LocalAuth();
} else {
    console.log('🟡 Ejecutando en Windows: No se usa LocalAuth');
}

// Inicializar el cliente de WhatsApp
const client = new Client(clientConfig);

// Evento: Generar QR en la terminal
client.on('qr', qr => {
    console.log('📸 Escanea este QR con tu teléfono:');
    qrcode.generate(qr, { small: true });
});

// Evento: Cliente listo
client.on('ready', () => {
    console.log('✅ Cliente de WhatsApp listo');
});

// Inicializar el cliente
client.initialize();

module.exports = router;
