const Group = require('../models/Group');

let isScanning = false; // Bandera para evitar escaneos simultáneos
const SCAN_TIMEOUT = 30000; // 30 segundos máximo para evitar bloqueos
const MAX_RETRIES = 3; // Intentos máximos para obtener chats

/**
 * Escanea y obtiene los grupos donde el número conectado está presente,
 * filtrando solo los grupos cuyo nombre contiene una palabra clave.
 *
 * @param {Client} client - Cliente de WhatsApp Web.
 * @param {String} adminNumber - Número de WhatsApp del usuario.
 * @param {String} filterText - Texto base para filtrar grupos (ejemplo: "Ventas").
 * @returns {Array} Lista de grupos encontrados que coinciden con el filtro.
 */
async function scanGroups(client, adminNumber, filterText) {
    if (isScanning) {
        console.log('⚠️ Escaneo en progreso, evitando ejecución duplicada.');
        return [];
    }

    isScanning = true;
    console.log(`🔍 Iniciando escaneo de grupos para ${adminNumber} con filtro: "${filterText}"...`);

    try {
        console.time("⏳ Tiempo total de escaneo");

        console.log("⌛ Esperando 5 segundos para cargar datos de WhatsApp...");
        await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5s

        console.time("⏳ Obtención de chats");
        let chats = [];
        let attempt = 0;

        // 🛠 Validar que WhatsApp está listo antes de obtener chats
        if (!client.info) {
            console.log("⏳ WhatsApp Web aún no está listo. Esperando...");
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        // Intentar obtener los chats hasta 3 veces
        while (attempt < MAX_RETRIES) {
            try {
                attempt++;
                console.log(`🔄 Intento ${attempt} de obtener chats...`);

                // Validar que `client.getChats()` existe antes de llamarlo
                if (!client.getChats) {
                    throw new Error("❌ client.getChats() no está disponible. ¿Está WhatsApp realmente listo?");
                }

                chats = await Promise.race([
                    client.getChats(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error(`⏳ Timeout: getChats() tardó demasiado en intento ${attempt}.`)), SCAN_TIMEOUT))
                ]);

                if (chats.length > 0) break; // Si obtenemos chats, salimos del bucle
            } catch (error) {
                console.log(`⚠️ Intento ${attempt} fallido: ${error.message}`);
                if (attempt >= MAX_RETRIES) throw error;
                console.log("⏳ Reintentando en 5 segundos...");
                await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar antes de reintentar
            }
        }

        console.timeEnd("⏳ Obtención de chats");
        console.log(`📌 Total de chats obtenidos: ${chats.length}`);

        console.log('🔍 Filtrando solo grupos relevantes...');
        console.time("⏳ Filtrado de grupos");

        // 🔍 Mostrar los primeros 10 chats obtenidos para depuración
        console.log('🔎 Ejemplo de los primeros 10 chats obtenidos:', chats.slice(0, 10));

        // 🔹 Aplicamos búsqueda parcial con "CONTIENE"
        const gruposFiltrados = chats
            .filter(chat => {
                // 🔍 Detectar grupos correctamente (en lugar de `isGroup`, usamos `id.server === 'g.us'`)
                if (!chat.id || chat.id.server !== 'g.us') {
                    console.log(`❌ Chat ignorado (no es grupo): ${chat.name || 'Sin nombre'} (${chat.id ? chat.id._serialized : 'ID desconocido'})`);
                    return false;
                }

                // 🚨 Verificar si el grupo tiene nombre
                if (!chat.name) {
                    console.log(`⚠️ Grupo sin nombre detectado: ${chat.id._serialized}`);
                    return false;
                }

                // 🔍 Buscar coincidencias parciales en el nombre del grupo
                if (chat.name.toLowerCase().includes(filterText.toLowerCase().trim())) {
                    console.log(`✅ Coincidencia encontrada: ${chat.name}`);
                    return true;
                }

                return false;
            })
            .map(chat => ({
                groupId: chat.id._serialized,
                name: chat.name,
                adminNumber // Solo referencia, sin validar si es administrador
            }));

        console.timeEnd("⏳ Filtrado de grupos");
        console.log(`📋 Total de grupos filtrados: ${gruposFiltrados.length}`);

        if (gruposFiltrados.length === 0) {
            console.log("❌ No se encontraron grupos con ese nombre.");
            return [];
        }

        console.time("⏳ Guardado en la base de datos");

        for (const grupo of gruposFiltrados) {
            await Group.findOneAndUpdate(
                { groupId: grupo.groupId },
                {
                    groupId: grupo.groupId,
                    name: grupo.name,
                    adminNumber
                },
                { upsert: true, new: true }
            );
        }

        console.timeEnd("⏳ Guardado en la base de datos");
        console.log("✅ Grupos almacenados exitosamente en la base de datos.");

        console.timeEnd("⏳ Tiempo total de escaneo");
        return gruposFiltrados;
    } catch (error) {
        console.error('❌ Error durante el escaneo de grupos:', error.message);
        return [];
    } finally {
        isScanning = false; // Resetear la bandera al finalizar el escaneo
    }
}

module.exports = { scanGroups };
