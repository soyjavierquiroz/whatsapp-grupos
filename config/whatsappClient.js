const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const os = require('os');

console.log(`🖥️ Sistema operativo detectado: ${os.platform()}`);

const puppeteerOptions = {
    headless: true,
    executablePath: '/usr/bin/chromium-browser', // Forzamos la ruta del ejecutable
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage'
    ]
};

// 📌 Asegurar que no se dupliquen instancias del cliente
if (!global.clientInstance) {
    console.log("🚀 Iniciando WhatsApp Web...");
    global.clientInstance = new Client({
        authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
        puppeteer: puppeteerOptions
    });

    const client = global.clientInstance;

    client.on('qr', qr => {
        console.log('📸 Escanea este QR con tu teléfono para conectar WhatsApp:');
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('✅ Cliente de WhatsApp listo y vinculado.');
    });

    client.on('disconnected', async (reason) => {
        console.log(`⚠️ Se perdió la conexión con WhatsApp: ${reason}`);
        console.log('⏳ Esperando 10 segundos antes de reconectar...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        console.log('🔄 Intentando reconectar a WhatsApp...');
        client.initialize();
    });

    client.initialize();
} else {
    console.log("⚠️ Cliente de WhatsApp ya estaba inicializado, evitando duplicados.");
}

module.exports = global.clientInstance;
