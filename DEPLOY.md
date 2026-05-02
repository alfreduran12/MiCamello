# MiCamello — Documentación

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16.2.4 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4, Shadcn/UI |
| Base de datos | SQLite vía libSQL (`@libsql/client`) |
| ORM | Drizzle ORM |
| Autenticación | NextAuth.js v4 (credentials provider) |
| Editor de notas | TipTap v3 (rich text, tablas, imágenes, slash commands) |
| Iconos | Lucide React |
| Parseo de archivos | mammoth (Word .docx), xlsx/SheetJS (Excel), nativo (PDF, CSV) |
| Servidor de producción | Node.js 20 + PM2 |
| Proxy inverso | Nginx (configurado por el hosting) |
| CDN / DNS | Cloudflare |

---

## Características

### Módulos
- **Dashboard** — métricas globales, tareas próximas, actividad reciente
- **Notas** — editor rich text estilo Notion con slash commands; adjuntar y previsualizar PDF, Word, Excel y CSV
- **Proyectos** — gestión con estado, deadline y color
- **Repositorios** — listado con stack, stars y heatmap de actividad 2026
- **Tareas** — lista con prioridades y fechas límite
- **Actividades** — registro de horas por proyecto y tipo
- **Contratos** — gestión de contratos con clientes y valores
- **Contactos** — directorio con empresa y rol
- **Usuarios** — administración (solo admin)

### Funcionalidades destacadas
- Tema claro/oscuro automático (detecta preferencia del SO)
- Logo dinámico: `logonegro.png` en modo claro, `logoblanco.png` en modo oscuro
- Responsive completo: sidebar colapsable, layout adaptado a móvil
- Heatmap de actividad anual (2026) en sección Repositorios
- Previsualización de archivos adjuntos en notas
- Autosave de notas con debounce de 800ms
- Middleware de autenticación con excepciones para archivos estáticos

---

## Variables de entorno

Crear `.env` en la raíz del proyecto (nunca commitear):

```env
DATABASE_URL=file:/ruta/absoluta/al/data.db
NEXTAUTH_SECRET=tu_secreto_seguro
NEXTAUTH_URL=https://tu-dominio.com
```

---

## Despliegue en VPS (Ubuntu)

### 1. Instalar Node.js 20 y PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
node -v && npm -v  # verificar
```

### 2. Clonar el repositorio

```bash
git clone https://github.com/alfreduran12/MiCamello.git /ruta/proyecto
cd /ruta/proyecto
```

> Si aparece error de permisos de git:
> ```bash
> git config --global --add safe.directory /ruta/proyecto
> ```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
nano .env  # completar DATABASE_URL, NEXTAUTH_SECRET y NEXTAUTH_URL
```

### 4. Instalar dependencias

```bash
npm install
```

### 5. Migrar la base de datos

```bash
npm run db:migrate
```

### 6. Build de producción

```bash
# Asegurarse de que next.config.ts NO tenga output: 'standalone'
npm run build
```

### 7. Iniciar con PM2

```bash
# Reemplazar 3005 con el puerto que usa tu vhost
PORT=3005 pm2 start npm --name "micamello" -- start
pm2 save
pm2 startup  # para que arranque automático al reiniciar el servidor
```

---

## Actualizar en producción

```bash
cd /ruta/proyecto
git pull origin main
npm install          # solo si cambiaron dependencias
npm run db:migrate   # solo si hubo cambios de esquema
npm run build
pm2 restart micamello
```

---

## Solución de problemas

| Error | Causa | Solución |
|-------|-------|----------|
| `fatal: detected dubious ownership` | Repo clonado por otro usuario | `git config --global --add safe.directory /ruta` |
| `Permission denied` en git pull | Permisos mezclados entre root y usuario | Usar siempre el mismo usuario para git y PM2 |
| `Could not find a production build` | Falta ejecutar build | `npm run build` |
| Warning `output: standalone` | Config incorrecta | Eliminar `output: 'standalone'` de `next.config.ts` |
| Estáticos 404 (`_next/static/chunks/...`) | Modo standalone activo | Quitar standalone y hacer rebuild |
| Logo muestra "Logo" (alt text) | `NEXTAUTH_URL` incorrecto o middleware bloqueando imágenes | Actualizar `.env` con el dominio real |
| 502 Bad Gateway | App caída o puerto incorrecto | `pm2 logs micamello` y verificar puerto del vhost |

---

## Repositorio

[https://github.com/alfreduran12/MiCamello](https://github.com/alfreduran12/MiCamello)
