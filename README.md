# OFI — Viáticos & Gastos · Guía de Despliegue en Render

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Laravel 11 + Sanctum |
| Base de datos | Render PostgreSQL 15 |
| Notificaciones | Web Push (VAPID) + Service Worker |
| Archivos | Almacenamiento local `/uploads` |
| Despliegue | Render (Blueprint via `render.yaml`) |

---

## Estructura del monorepo

```
ofi/
├── backend/          ← Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   ├── Policies/
│   │   └── Services/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/api.php
│   ├── config/
│   │   ├── cors.php
│   │   └── database.php
│   └── .env.example
├── frontend/         ← React SPA
│   ├── public/
│   │   └── sw.js    ← Service Worker
│   ├── src/
│   │   └── services/api.js
│   └── vite.config.js
└── render.yaml       ← Blueprint de despliegue
```

---

## Despliegue en Render (paso a paso)

### 1. Generar claves VAPID

```bash
# Instala web-push localmente (Node.js requerido)
npx web-push generate-vapid-keys
```

Guarda las claves — las necesitarás en el paso 4.

### 2. Conectar repositorio

1. Ve a [dashboard.render.com](https://dashboard.render.com)
2. **New → Blueprint**
3. Conecta tu repositorio de GitHub/GitLab
4. Render detecta el `render.yaml` y provisiona automáticamente:
   - Base de datos PostgreSQL `ofi-db`
   - Servicio web `ofi-backend` (Laravel)
   - Sitio estático `ofi-frontend` (React)

### 3. Variables de entorno automáticas

Render inyecta estas variables desde la base de datos:

| Variable | Fuente |
|---|---|
| `DB_HOST` | `ofi-db.host` |
| `DB_PORT` | `ofi-db.port` |
| `DB_DATABASE` | `ofi-db.database` |
| `DB_USERNAME` | `ofi-db.user` |
| `DB_PASSWORD` | `ofi-db.password` |
| `APP_KEY` | Auto-generada por Render |

### 4. Variables secretas (configurar manualmente en el dashboard)

En **ofi-backend → Environment**:

```
JWT_SECRET=<cadena-aleatoria-64-chars>
VAPID_PUBLIC_KEY=<tu-clave-publica-vapid>
VAPID_PRIVATE_KEY=<tu-clave-privada-vapid>
```

En **ofi-frontend → Environment**:

```
VITE_VAPID_PUBLIC_KEY=<misma-clave-publica-vapid>
```

### 5. Primera migración y seed

Render ejecuta `php artisan migrate --force` automáticamente en cada deploy.

Para insertar datos de prueba (solo una vez):

```bash
# Desde la shell del servicio en Render
php artisan db:seed --force
```

Usuarios de prueba creados:

| Email | Contraseña | Rol |
|---|---|---|
| admin@olam.com | password | Admin |
| gerente.finanzas@olam.com | password | Aprobador |
| osmar@olam.com | password | Usuario |
| laura@olam.com | password | Usuario |

---

## Endpoints API principales

```
POST   /api/auth/login                 Iniciar sesión
POST   /api/auth/logout                Cerrar sesión
GET    /api/auth/me                    Usuario actual

GET    /api/requests                   Listar solicitudes (filtros: status, type, q)
POST   /api/requests                   Crear borrador
GET    /api/requests/{id}              Ver detalle
PUT    /api/requests/{id}              Actualizar borrador
DELETE /api/requests/{id}              Eliminar borrador
GET    /api/requests/stats             Estadísticas del dashboard

POST   /api/requests/{id}/submit       Enviar a aprobación
POST   /api/requests/{id}/approve      Aprobar (approver/admin)
POST   /api/requests/{id}/reject       Rechazar (approver/admin)
POST   /api/requests/{id}/comment      Añadir comentario
GET    /api/requests/{id}/history      Historial de aprobación
GET    /api/requests/{id}/audit        Auditoría completa

POST   /api/requests/{id}/files        Subir archivo (multipart)
DELETE /api/files/{id}                 Eliminar archivo

GET    /api/notifications              Listar notificaciones
POST   /api/notifications/read         Marcar todas como leídas
POST   /api/notifications/{id}/read    Marcar una como leída
POST   /api/push/subscribe             Registrar suscripción push
DELETE /api/push/unsubscribe           Cancelar suscripción

GET    /api/audit-logs                 Logs de auditoría (solo admin)
```

---

## Flujo de aprobación

```
DRAFT ──submit──▶ PENDING ──(approver takes)──▶ IN_REVIEW
                     │                              │
                     └──approve──▶ APPROVED ◀──────┘
                     │
                     └──reject──▶  REJECTED
```

Cada transición:
1. Actualiza `requests.status`
2. Inserta registro en `approvals`
3. Crea notificación en DB para el destinatario
4. Envía Web Push si el usuario tiene suscripción activa
5. Registra en `audit_logs`

---

## Desarrollo local

```bash
# Backend
cd backend
cp .env.example .env
# Editar .env con tu PostgreSQL local
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve

# Frontend
cd frontend
npm install
# Crear .env.local:
# VITE_API_URL=http://localhost:8000
# VITE_VAPID_PUBLIC_KEY=<tu-clave>
npm run dev
```
