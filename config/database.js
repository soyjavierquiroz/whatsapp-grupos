const mongoose = require('mongoose');

// URL de conexión desde variables de entorno (.env)
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/whatsapp-bot";


async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000, // 30 segundos para encontrar el servidor
            socketTimeoutMS: 45000 // 45 segundos de espera para operaciones
        });
        console.log("✅ Conectado a MongoDB");
    } catch (error) {
        console.error("❌ Error conectando a MongoDB:", error.message);
        process.exit(1); // Detiene la ejecución si la conexión falla
    }
}

module.exports = connectDB;
