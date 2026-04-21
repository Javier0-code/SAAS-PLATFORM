# 🚀 SaaS Platform — Plataforma Colaborativa

Plataforma SaaS colaborativa para equipos, inspirada en Notion + Trello + ClickUp.

---

## 📁 Estructura del Proyecto

```
saas-platform/
├── backend/                    # Node.js + Express + Sequelize
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js     # Conexión PostgreSQL (Sequelize)
│   │   │   └── migrate.js      # Script de migración
│   │   ├── controllers/        # Lógica de negocio (Etapas 2+)
│   │   ├── middleware/
│   │   │   ├── errorHandler.js # Manejo global de errores
│   │   │   └── requestLogger.js
│   │   ├── models/
│   │   │   ├── index.js        # Registro de modelos + asociaciones
│   │   │   └── User.js         # Modelo de usuario
│   │   ├── routes/
│   │   │   ├── index.js        # Router principal
│   │   │   └── health.js       # Health check endpoint
│   │   ├── utils/
│   │   │   ├── logger.js       # Winston logger
│   │   │   └── response.js     # Helpers de respuesta API
│   │   ├── app.js              # Configuración Express
│   │   └── server.js           # Entry point del servidor
│   ├── .env.example
│   └── package.json
│
└── frontend/                   # React + Vite + Tailwind CSS
    ├── src/
    │   ├── components/
    │   │   └── layout/
    │   │       ├── AppLayout.jsx   # Layout principal (sidebar + topbar)
    │   │       ├── Sidebar.jsx     # Navegación lateral animada
    │   │       └── Topbar.jsx      # Barra superior
    │   ├── context/
    │   │   └── AuthContext.jsx     # Contexto de autenticación
    │   ├── pages/
    │   │   ├── LandingPage.jsx     # Página de inicio
    │   │   ├── LoginPage.jsx       # Login (OAuth en Etapa 2)
    │   │   ├── DashboardPage.jsx   # Dashboard principal
    │   │   └── NotFoundPage.jsx    # 404
    │   ├── services/
    │   │   └── api.js              # Axios + interceptores JWT
    │   ├── index.css               # Tailwind + design system
    │   ├── main.jsx                # Entry point React
    │   └── router.jsx              # React Router v6
    ├── .env.example
    ├── tailwind.config.js          # Design tokens personalizados
    ├── vite.config.js              # Proxy + aliases
    └── package.json
```

---

## ⚡ Instalación y Ejecución

### Pre-requisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm o yarn

---

### 1. Clonar / descomprimir el proyecto

```bash
cd saas-platform
```

---

### 2. Configurar el Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales de PostgreSQL
nano .env
```

**Variables clave en `.env`:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saas_platform
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=un_secreto_muy_largo_y_seguro
```

**Crear la base de datos en PostgreSQL:**
```bash
psql -U postgres -c "CREATE DATABASE saas_platform;"
```

**Correr migraciones:**
```bash
npm run db:migrate
```

**Iniciar el servidor:**
```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm start
```

El backend corre en: **http://localhost:5000**
Health check: **http://localhost:5000/api/health**

---

### 3. Configurar el Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar en desarrollo
npm run dev
```

El frontend corre en: **http://localhost:3000**

---

## 🧪 Verificar que todo funciona

```bash
# Backend health check
curl http://localhost:5000/api/health

# Respuesta esperada:
{
  "success": true,
  "message": "Server is healthy",
  "data": {
    "status": "healthy",
    "services": {
      "database": { "status": "connected" },
      "server": { "status": "running" }
    }
  }
}
```

---

## 🗺️ Roadmap de Etapas

| # | Etapa | Estado |
|---|-------|--------|
| 1 | Configuración del proyecto | ✅ **Completada** |
| 2 | Autenticación (Google OAuth + Apple + JWT) | ⏳ Pendiente |
| 3 | Equipos / Workspaces | ⏳ Pendiente |
| 4 | Proyectos (CRUD + favoritos + tags) | ⏳ Pendiente |
| 5 | Tareas — Kanban drag & drop | ⏳ Pendiente |
| 6 | Comentarios y colaboración | ⏳ Pendiente |
| 7 | Reuniones — Calendario | ⏳ Pendiente |
| 8 | Notas privadas | ⏳ Pendiente |
| 9 | Notificaciones | ⏳ Pendiente |
| 10 | Tiempo real (Socket.io) | ⏳ Pendiente |
| 11 | Historial de actividad | ⏳ Pendiente |
| 12 | UI/UX profesional | ⏳ Pendiente |
| 13 | Escalabilidad | ⏳ Pendiente |

---

## 🛠️ Stack Tecnológico

**Backend:** Node.js · Express · Sequelize ORM · PostgreSQL · JWT · Winston

**Frontend:** React 18 · Vite · Tailwind CSS · Framer Motion · React Query · Zustand · React Router v6

**Próximas integraciones:** Socket.io · Passport.js · @dnd-kit
