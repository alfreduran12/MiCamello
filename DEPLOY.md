# Guía de Despliegue — MiNotion en VPS con CloudPanel

## Infraestructura

| Elemento | Valor |
|---|---|
| Servidor | VPS (vmi3074966) |
| Panel | CloudPanel |
| Usuario del sistema | `granscalastudio-micamello` |
| Directorio del proyecto | `/home/granscalastudio-micamello/htdocs/micamello.granscalastudio.com/` |
| Dominio | `micamello.granscalastudio.com` |
| Puerto de la app | `3005` |
| Proceso manager | PM2 |
| Base de datos | SQLite (`data.db`) vía Drizzle ORM + @libsql/client |

---

## 1. Estructura del proyecto en el VPS

```
/home/granscalastudio-micamello/htdocs/micamello.granscalastudio.com/
├── .next/
│   └── standalone/
│       └── server.js        ← Entry point de producción
├── src/
├── logs/
│   ├── out.log
│   └── error.log
├── data.db                  ← Base de datos SQLite
├── ecosystem.config.js      ← Configuración de PM2
├── .env                     ← Variables de entorno (no se usa directamente, ver nota)
└── package.json
```

---

## 2. Variables de entorno

> **Importante:** PM2 no carga el archivo `.env` automáticamente con `env_file` en todas las versiones. Las variables deben declararse **directamente en el bloque `env` del `ecosystem.config.js`**.

Variables requeridas:

```
DATABASE_URL=file:/home/granscalastudio-micamello/htdocs/micamello.granscalastudio.com/data.db
NEXTAUTH_URL=https://micamello.granscalastudio.com
NEXTAUTH_SECRET=<string aleatorio largo>
PORT=3005
NODE_ENV=production
HOSTNAME=0.0.0.0
PROJECT_ROOT=/home/granscalastudio-micamello/htdocs/micamello.granscalastudio.com
```

---

## 3. ecosystem.config.js

```js
const path = require('path');

module.exports = {
  apps: [
    {
      name: 'minotion',
      script: path.join(__dirname, '.next/standalone/server.js'),
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 3005,
        HOSTNAME: '0.0.0.0',
        PROJECT_ROOT: __dirname,
        DATABASE_URL: 'file:/home/granscalastudio-micamello/htdocs/micamello.granscalastudio.com/data.db',
        NEXTAUTH_URL: 'https://micamello.granscalastudio.com',
        NEXTAUTH_SECRET: '<tu-secret>',
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      error_file: path.join(__dirname, 'logs/error.log'),
      out_file: path.join(__dirname, 'logs/out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
```

---

## 4. Configuración de Nginx (CloudPanel)

CloudPanel gestiona el SSL automáticamente. En el vhost del dominio, los `location` blocks del proxy apuntan al puerto `3005`:

```nginx
location /_next/static/ {
    proxy_pass http://127.0.0.1:3005;
    proxy_http_version 1.1;
    add_header Cache-Control "public, max-age=31536000, immutable";
}

location / {
    proxy_pass http://127.0.0.1:3005;
    proxy_http_version 1.1;
    proxy_set_header Upgrade           $http_upgrade;
    proxy_set_header Connection        "upgrade";
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout  60s;
    proxy_buffering     off;
}
```

> **Nota sobre http2:** En Nginx ≥ 1.25 la directiva `listen 443 ssl http2` está deprecada.
> Usar `listen 443 ssl;` + `http2 on;` por separado.

> **Nota sobre SSL:** CloudPanel gestiona los certificados en `/etc/nginx/ssl-certificates/`.
> No incluir rutas de certificados en el config custom — CloudPanel las inyecta en su template.

---

## 5. Base de datos

### Migración inicial (crear tablas + usuario admin)

```bash
cd /home/granscalastudio-micamello/htdocs/micamello.granscalastudio.com
npx tsx src/lib/migrate.ts
```

Esto crea todas las tablas y el usuario por defecto:
- **Usuario:** `admin`
- **Contraseña:** `admin123`

> Cambiar la contraseña después del primer login desde **Usuarios → Cambiar mi contraseña**.

### Verificar contenido del DB

```bash
sqlite3 ~/htdocs/micamello.granscalastudio.com/data.db "SELECT id, username, role FROM users;"
```

---

## 6. PM2 — Comandos útiles

```bash
# Ver estado de todos los procesos
pm2 status

# Iniciar desde el ecosystem
pm2 start ecosystem.config.js

# Reiniciar con nuevas variables de entorno
pm2 delete minotion
pm2 start ecosystem.config.js
pm2 save

# Ver variables de entorno cargadas
pm2 env 0 | grep -E "DATABASE_URL|NEXTAUTH|PORT"

# Ver logs en tiempo real
pm2 logs minotion

# Ver últimas N líneas de logs
pm2 logs minotion --lines 50 --nostream

# Guardar lista de procesos para autostart
pm2 save
pm2 startup
```

---

## 7. Primer deploy desde cero

```bash
# 1. Clonar el repositorio
git clone https://github.com/alfreduran12/MiCamello.git /home/granscalastudio-micamello/htdocs/micamello.granscalastudio.com
cd /home/granscalastudio-micamello/htdocs/micamello.granscalastudio.com

# 2. Instalar dependencias
npm install

# 3. Crear el .env con los valores de producción
nano .env

# 4. Build de producción
npm run build

# 5. Crear directorio de logs
mkdir -p logs

# 6. Correr migración (crea tablas y usuario admin)
npx tsx src/lib/migrate.ts

# 7. Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
```

---

## 8. Actualizar el proyecto (deploys posteriores)

```bash
cd /home/granscalastudio-micamello/htdocs/micamello.granscalastudio.com
git pull origin main
npm install
npm run build
pm2 restart minotion
```

---

## 9. Problemas conocidos y soluciones

### 502 Bad Gateway
- Verificar que PM2 esté corriendo: `pm2 status`
- Verificar que el puerto coincida entre app y Nginx: `pm2 logs minotion --lines 5 --nostream`
- El app debe mostrar `http://localhost:3005` en los logs

### Usuario y contraseña incorrectos
- PM2 no carga el `.env` automáticamente → poner vars en el bloque `env` del `ecosystem.config.js`
- Verificar con: `pm2 env 0 | grep DATABASE_URL`
- La ruta del `data.db` debe ser **absoluta**, no relativa
- Verificar que la migración se corrió: `sqlite3 data.db "SELECT * FROM users;"`

### Puerto ya en uso (CloudPanel)
- CloudPanel asigna puertos a apps Node.js; si el puerto deseado está ocupado, elegir otro disponible (ej: 3005)
- Actualizar `PORT` en `ecosystem.config.js` y el `proxy_pass` en el vhost de Nginx

### `env_file` de PM2 no funciona
- Solución: declarar todas las variables directamente en el bloque `env: {}` del `ecosystem.config.js`

### Ruta del DB incorrecta en standalone
- `db.ts` usa `PROJECT_ROOT` env var para resolver rutas relativas
- Siempre usar **ruta absoluta** en `DATABASE_URL` en producción:
  `file:/home/granscalastudio-micamello/htdocs/micamello.granscalastudio.com/data.db`
