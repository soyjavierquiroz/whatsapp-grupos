const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🚀 Iniciando WhatsApp Web...');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let isReady = false;

// Evento: Mostrar el QR en la terminal
client.on('qr', qr => {
    if (!isReady) {
        console.log('🔹 Escanea este QR con tu WhatsApp:');
        qrcode.generate(qr, { small: true });
    }
});

// Evento: Confirmación de conexión exitosa
client.on('ready', () => {
    if (!isReady) {
        isReady = true;
        console.log('✅ Conectado a WhatsApp!');
    }
});

// Manejo de errores
client.on('disconnected', reason => {
    isReady = false;
    console.log('⚠️ Se perdió la conexión con WhatsApp:', reason);
});

client.initialize();
console.log('📡 Cliente de WhatsApp inicializado.');

module.exports = client;
