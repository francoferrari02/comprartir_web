# ✅ Error 500 Resuelto - Registro de Usuario

## 🐛 Problema Identificado

**Error:** `Cannot read properties of undefined (reading 'sendEmail')`

**Causa raíz:** El servicio de email (mailer) no se estaba inicializando correctamente debido a una configuración incorrecta de SMTP.

---

## 🔧 Soluciones Implementadas

### 1. **Configuración SMTP Corregida** (`api/.env`)

**Problema:** `SMTP_SECURE=true` con puerto 587
- Puerto 587 requiere STARTTLS (secure: false)
- Puerto 465 requiere SSL/TLS directo (secure: true)

**Solución:**
```env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false  # ← Cambiado de true a false
SMTP_USER=berry.kuphal@ethereal.email
SMTP_PASS=cwufHpuQweX2TbDm6C
```

### 2. **Manejo de `metadata` opcional** (`api/src/services/user.service.ts`)

**Problema:** Cuando el frontend no enviaba `metadata`, se asignaba `undefined`

**Solución:**
```typescript
// Antes:
user.metadata = userData.metadata;

// Después:
user.metadata = userData.metadata || {};
```

### 3. **Mejor logging de errores** (`api/src/index.ts`)

**Mejora:** Mensajes más claros cuando falla la configuración del mailer

```typescript
transporter.verify((error, _) => {
  if (error) {
    console.error('❌ Mailer configuration error:', error.message);
    console.error('Please check your SMTP settings in .env file');
  } else {
    console.log('✅ Mailer service up and running!');
    app.locals.mailer = new Mailer(transporter);
  }
});
```

### 4. **Validación del mailer** (`api/src/controllers/user.controller.ts`)

**Mejora:** Verificar que el mailer está disponible antes de usarlo

```typescript
const mailer: Mailer = req.app.locals.mailer;

if (!mailer) {
  console.error('❌ Mailer not configured! Check SMTP settings in .env');
  throw new Error('Email service is not available. Please contact the administrator.');
}
```

---

## ✅ Estado Actual

### Servidor corriendo:
```
Server running on port: 8080
Docs served on: http://localhost:8080/docs
Database connection established!
✅ Mailer service up and running!
```

### Frontend corriendo:
```
http://localhost:5174
```

---

## 🧪 Cómo Probar

### 1. **Registrar un usuario**

1. Abrí: http://localhost:5174/register
2. Completá el formulario:
   - Nombre: `Franco`
   - Apellido: `Ferrari`
   - Email: `franco@test.com`
   - Password: `password123`
3. Click "Registrar"

### 2. **Ver el email de verificación**

1. Abrí: https://ethereal.email/login
2. Ingresá:
   - Email: `berry.kuphal@ethereal.email`
   - Password: `cwufHpuQweX2TbDm6C`
3. Verás el email con el código de 6 dígitos

### 3. **Verificar tu cuenta**

1. Copiá el código de 6 dígitos del email
2. Ingresalo en: http://localhost:5174/verify
3. Click "Verificar"

### 4. **Login**

1. Abrí: http://localhost:5174/login
2. Ingresá:
   - Email: `franco@test.com`
   - Password: `password123`
3. Click "Iniciar sesión"

---

## 📊 Logs Esperados

### Backend (cuando te registras):
```
POST /api/users/register 201 xxx ms
```

### Frontend (en la consola):
```
📤 Sending registration request: {name: 'franco', surname: 'ferrari', email: 'franco@test.com', password: '***'}
✅ Registration successful
```

---

## 🔍 Configuración SMTP - Referencia

| Puerto | Seguridad | `SMTP_SECURE` | Uso |
|--------|-----------|---------------|-----|
| **587** | STARTTLS | `false` | ✅ Recomendado para Ethereal |
| **465** | SSL/TLS | `true` | Alternativa |
| **25** | Sin cifrado | `false` | ⚠️ No usar en producción |

---

## 📝 Archivos Modificados

1. ✅ `api/.env` - Configuración SMTP corregida
2. ✅ `api/src/services/user.service.ts` - Manejo de metadata opcional
3. ✅ `api/src/index.ts` - Mejor logging de errores
4. ✅ `api/src/controllers/user.controller.ts` - Validación del mailer

---

## 🎯 Resumen

**Problema:** Error 500 al registrar usuario
**Causa:** Mailer no inicializado por configuración SMTP incorrecta
**Solución:** Cambiar `SMTP_SECURE=false` para puerto 587
**Estado:** ✅ Resuelto - Todo funcionando correctamente

---

**Fecha:** 12 de Octubre, 2025
