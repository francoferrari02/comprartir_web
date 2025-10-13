# Comprartir — Guía de Desarrollo

Aplicación web para gestión de listas de compras y despensas compartidas. Frontend Vue 3 + Backend Node.js/TypeScript con autenticación JWT y verificación de cuenta por email.

## 📋 Requisitos

- **Node.js** 20.19.x o 22.12.x+ (recomendado con nvm)
- **npm** 10.x
- **Sistema Operativo:** macOS/Linux/Windows

### Comandos útiles con nvm:

```bash
nvm install 22.12.0
nvm use 22.12.0
node -v   # v22.12.0
npm -v    # 10.x
```

## 📁 Estructura del Proyecto

```
.
├── api/                 # Backend (Node + TypeScript + Express)
│   ├── .env            # Variables del backend
│   ├── src/            # Código fuente del API
│   │   ├── controllers/
│   │   ├── entities/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   └── docs/           # Documentación Swagger
├── src/                # Frontend (Vue 3 + Vuetify)
│   ├── components/     # Componentes Vue
│   ├── views/          # Vistas/Páginas
│   ├── stores/         # Pinia stores
│   ├── services/       # Servicios API
│   └── router/         # Configuración de rutas
├── .env                # Variables del frontend
└── vite.config.js      # Configuración de Vite

```

## 🚀 Instalación y Configuración

### 1. Configurar el Backend (API)

**a) Instalar dependencias:**

```bash
cd api
npm install
```

**b) Verificar el archivo `api/.env`:**

El archivo ya está configurado con las siguientes variables esenciales:

```env
JWT_TOKEN=NVxsegCfdWTXEUjvw5eFv3PjIkxVVWVT
FRONT_ORIGIN=http://localhost:5173,http://localhost:5174

# Mailer (Ethereal - para desarrollo)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=berry.kuphal@ethereal.email
SMTP_PASS=cwufHpuQweX2TbDm6C

REGISTRATION_SUBJECT="Welcome to Grocery Manager!"
RESET_PASSWORD_SUBJECT="Reset Your Password"
PANTRY_SHARED_SUBJECT="Someone shared a pantry with you"
LIST_SHARED_SUBJECT="Someone shared a shopping list with you"
```

**c) Iniciar el servidor:**

```bash
npm run api
```

Deberías ver:

```
Server running on port: 8080
Docs served on: http://localhost:8080/docs
Database connection established!
Mailer service up and running!
```

**URLs importantes:**
- API Base: `http://localhost:8080/api`
- Documentación: `http://localhost:8080/docs`

### 2. Configurar el Frontend

**a) Instalar dependencias (desde la raíz del proyecto):**

```bash
cd ..  # Volver a la raíz
npm install
```

**b) Verificar el archivo `.env`:**

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCKS=false
```

**c) Iniciar el servidor de desarrollo:**

```bash
npm run dev
```

Abre tu navegador en la URL que indique Vite (normalmente `http://localhost:5173`).

## 👤 Credenciales de Prueba

### Usuario de prueba (ya verificado):

- **Email:** `demo@example.com`
- **Contraseña:** `123456`

Este usuario ya está creado y verificado, puedes iniciar sesión directamente.

## ✉️ Sistema de Verificación de Email

El backend usa **Ethereal Email** (servicio de testing) para enviar códigos de verificación en desarrollo.

### Crear y verificar una cuenta nueva:

#### Opción A — Desde la interfaz web:

1. **Registro:** Ve a `/register` y crea una cuenta
2. **Verificación:** Serás redirigido a `/verify?email=tu@correo.com`
3. **Obtener código:** 
   - Opción 1: Revisa la consola del backend (el código se imprime)
   - Opción 2: Accede a [Ethereal Email](https://ethereal.email/login) con:
     - Usuario: `berry.kuphal@ethereal.email`
     - Contraseña: `cwufHpuQweX2TbDm6C`
4. **Verificar:** Copia el código y pégalo en la página de verificación

#### Opción B — Desde la terminal (más rápido):

```bash
# 1. Registrar usuario
curl -X POST 'http://localhost:8080/api/users/register' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Tu Nombre",
    "surname": "Tu Apellido",
    "email": "tu@correo.com",
    "password": "12345678"
  }'

# 2. Solicitar código de verificación (la respuesta incluye el código en dev)
curl -X POST "http://localhost:8080/api/users/send-verification?email=tu@correo.com"

# Respuesta: {"code":"abc123def456"}

# 3. Verificar la cuenta
curl -X POST 'http://localhost:8080/api/users/verify-account' \
  -H 'Content-Type: application/json' \
  -d '{"code":"abc123def456"}'

# 4. Iniciar sesión
curl -X POST 'http://localhost:8080/api/users/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "tu@correo.com",
    "password": "12345678"
  }'
```

## 🔧 Scripts Disponibles

### Frontend (raíz del proyecto):

```bash
npm run dev       # Iniciar servidor de desarrollo
npm run build     # Construir para producción
npm run preview   # Vista previa de la build de producción
```

### Backend (carpeta api/):

```bash
npm run api       # Iniciar servidor API en modo desarrollo
```

## 🎯 Funcionalidades Principales

### ✅ Implementadas:

- **Autenticación completa:** Registro, login, verificación por email, recuperación de contraseña
- **Listas de compras:** Crear, editar, eliminar, compartir con otros usuarios
- **Listas recurrentes:** Marcar listas como recurrentes (con ícono de loop)
- **Despensas:** Gestión de productos almacenados
- **Productos:** Búsqueda y gestión de productos
- **Historial:** Registro de compras realizadas
- **Notificaciones:** Sistema de notificaciones en tiempo real
- **Compartir:** Compartir listas y despensas con otros usuarios
- **Filtros avanzados:** Filtrar listas por tipo (recurrentes/no recurrentes), ordenamiento, búsqueda
- **Responsive:** Menú hamburguesa en pantallas pequeñas

## 🐛 Problemas Comunes y Soluciones

### ❌ No llega el email:
**Solución:** En desarrollo usamos Ethereal (no Gmail). Obtén el código desde:
- La consola del backend
- O accede a https://ethereal.email/login con las credenciales del `.env`

### ❌ Error 401 "Account not verified":
**Solución:** Verifica tu cuenta usando el código en `/verify`

### ❌ Error 401 "Token missing":
**Solución:** Asegúrate de iniciar sesión. El token se guarda en `localStorage['accessToken']`

### ❌ Error CORS:
**Solución:** 
- Verifica que el backend esté corriendo en el puerto 8080
- Confirma que `VITE_API_BASE_URL=http://localhost:8080/api`
- Asegúrate de que `VITE_USE_MOCKS=false`

### ❌ Los datos se borran al reiniciar:
**Solución:** La base de datos usa SQLite y es persistente. Los datos se mantienen entre reinicios en el archivo de base de datos del backend.

## 📚 Tecnologías Utilizadas

### Frontend:
- **Vue 3** - Framework progresivo
- **Vuetify 3** - Framework de componentes Material Design
- **Pinia** - State management
- **Vue Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Vite** - Build tool

### Backend:
- **Node.js** - Runtime
- **TypeScript** - Tipado estático
- **Express** - Framework web
- **SQLite** - Base de datos
- **JWT** - Autenticación
- **Nodemailer** - Envío de emails
- **Swagger** - Documentación API

## 📖 Enlaces Útiles

- **Documentación API:** http://localhost:8080/docs
- **Ethereal Email (testing):** https://ethereal.email/login
- **Vue 3:** https://vuejs.org/
- **Vuetify 3:** https://vuetifyjs.com/

## 🤝 Desarrollo

Para trabajar en el proyecto:

1. Asegúrate de tener ambos servidores corriendo (API y Frontend)
2. Los cambios en el frontend se recargan automáticamente (HMR)
3. Los cambios en el backend requieren reiniciar el servidor
4. Revisa la consola del navegador y del backend para debugging

---


