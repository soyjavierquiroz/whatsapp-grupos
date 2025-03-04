const express = require('express');
const router = express.Router();
const { scanGroups } = require('../services/groupScanner');
const client = require('../config/whatsappClient'); // Importamos el cliente de WhatsApp

/**
 * 📌 Nueva Ruta: Escanea los grupos y filtra por nombre.
 * ✅ Se usa `GET` en lugar de `POST` para poder llamarlo desde el navegador.
 * ✅ Si no se pasa `filterText`, se buscan todos los grupos.
 */
router.get('/scan-groups', async (req, res) => {
    const adminNumber = client.info?.wid._serialized; // Obtener el número de WhatsApp conectado
    if (!adminNumber) {
        return res.status(500).json({ error: '⚠️ WhatsApp no está conectado.' });
    }

    const filterText = req.query.filterText ? decodeURIComponent(req.query.filterText) : ''; // Solución al bug
    console.log(`🛠️ Escaneo de grupos solicitado con filtro: "${filterText}"`);

    try {
        const grupos = await scanGroups(client, adminNumber, filterText);
        res.json({ success: true, total: grupos.length, grupos });
    } catch (error) {
        res.status(500).json({ error: '❌ Error al escanear grupos.', details: error.message });
    }
});

module.exports = router;
