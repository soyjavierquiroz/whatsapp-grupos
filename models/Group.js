const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    groupId: { type: String, required: true, unique: true }, // ID único del grupo en WhatsApp
    name: { type: String, required: true }, // Nombre del grupo
    adminNumber: { type: String, required: true }, // Número del administrador del grupo
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null }, // Proyecto asociado (opcional)
    createdAt: { type: Date, default: Date.now } // Fecha de registro
});

module.exports = mongoose.model('Group', GroupSchema);
