#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Ejecuta este script como root o con sudo"
  exit 1
fi

APP_USER="${APP_USER:-ubuntu}"
APP_DIR="${APP_DIR:-/var/www/crm-ventas}"
DOMAIN="${DOMAIN:-}"
REPO_URL="${REPO_URL:-}"

if [[ -z "${DOMAIN}" || -z "${REPO_URL}" ]]; then
  echo "Faltan variables obligatorias"
  echo "Uso: sudo APP_USER=ubuntu APP_DIR=/var/www/crm-ventas DOMAIN=crm.tudominio.com REPO_URL=https://github.com/tu-usuario/tu-repo.git bash scripts/server-setup.sh"
  exit 1
fi

apt-get update -y
apt-get install -y curl git nginx certbot python3-certbot-nginx

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2

id -u "${APP_USER}" >/dev/null 2>&1 || useradd -m -s /bin/bash "${APP_USER}"
mkdir -p "${APP_DIR}"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

if [[ ! -d "${APP_DIR}/.git" ]]; then
  sudo -u "${APP_USER}" git clone "${REPO_URL}" "${APP_DIR}"
fi

cat /dev/null > /etc/nginx/sites-available/crm-ventas
sed "s/CRM_DOMAIN/${DOMAIN}/g" "${APP_DIR}/deploy/nginx-crm.conf.template" > /etc/nginx/sites-available/crm-ventas
ln -sf /etc/nginx/sites-available/crm-ventas /etc/nginx/sites-enabled/crm-ventas
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

sudo -u "${APP_USER}" bash -lc "cd '${APP_DIR}' && npm ci && npm run build && pm2 start ecosystem.config.cjs --env production && pm2 save"
sudo -u "${APP_USER}" bash -lc "pm2 startup systemd -u '${APP_USER}' --hp /home/'${APP_USER}'" || true

certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos -m "admin@${DOMAIN}" --redirect || true

echo "Servidor inicializado. Revisa SSL y DNS si no quedo emitido el certificado."
