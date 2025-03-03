#!/bin/bash

echo "🚀 Iniciando instalación del bot de WhatsApp..."

# 1️⃣ Actualizar paquetes
echo "🔄 Actualizando el sistema..."
apt update && apt upgrade -y

# 2️⃣ Instalar dependencias necesarias
echo "📦 Instalando dependencias..."
apt install -y nodejs npm nginx certbot python3-certbot-nginx ufw fail2ban git

# 3️⃣ Instalar PM2 globalmente
echo "🛠 Instalando PM2..."
npm install -g pm2

# 4️⃣ Clonar el proyecto desde GitHub
echo "📥 Descargando el código del bot..."
cd /var/www
git clone https://github.com/soyjavierquiroz/whatsapp-grupos.git
cd whatsapp-grupos

# 5️⃣ Instalar dependencias del bot
echo "📦 Instalando dependencias del bot..."
npm install

# 6️⃣ Configurar el Firewall
echo "🔒 Configurando Firewall..."
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 7️⃣ Configurar Nginx
echo "⚙️ Configurando Nginx..."
cat > /etc/nginx/sites-available/whatsapp-bot <<EOF
server {
    listen 80;
    server_name bot.kuruk.in;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -s /etc/nginx/sites-available/whatsapp-bot /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# 8️⃣ Obtener certificado SSL con Let's Encrypt
echo "🔐 Configurando SSL con Let's Encrypt..."
certbot --nginx -d bot.kuruk.in --non-interactive --agree-tos -m tu-email@correo.com --redirect

# 9️⃣ Iniciar el bot con PM2
echo "🚀 Iniciando el bot con PM2..."
pm2 start index.js --name whatsapp-bot
pm2 save
pm2 startup

echo "✅ Instalación completada. El bot ya está funcionando en https://bot.kuruk.in"
