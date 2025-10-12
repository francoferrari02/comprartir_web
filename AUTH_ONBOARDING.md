# 🔐 Acceso a Comprartir - Guía Rápida para el Equipo

Esta guía explica cómo crear una cuenta, verificarla con Ethereal Email y acceder a la aplicación en tu entorno local.

---

## ✅ Prerrequisitos

1. **Backend** corriendo en `http://localhost:8080`:
   ```bash
   cd api
   npm install
   npm run api
   ```
2. **Frontend** corriendo en `http://localhost:5173` (o `5174` si el puerto está ocupado):
   ```bash
   npm install
   npm run dev -- --host
   ```
3. **Credenciales Ethereal (solo para ver emails de verificación)**
   - Usuario: `berry.kuphal@ethereal.email`
   - Password: `cwufHpuQweX2TbDm6C`

> 💡 Ethereal es un buzón de pruebas. Los emails NO se envían a direcciones reales.

---

## 📝 Paso a Paso

### 1. Crear la cuenta
1. Abrí el navegador en: **http://localhost:5173/register**
2. Completá el formulario con tus datos (nombre, apellido, email, password)
3. Hacé clic en **“Registrar”**

### 2. Obtener el código de verificación
1. Abrí https://ethereal.email/login
2. Ingresá con:
   - Usuario: `berry.kuphal@ethereal.email`
   - Password: `cwufHpuQweX2TbDm6C`
3. En el buzón vas a ver un email con asunto similar a **“Verify your account”**
4. Copiá el código hexadecimal que aparece (por ejemplo: `f35ccb776d57f5d3`)

### 3. Verificar la cuenta
1. Volvé a la app y abrí: **http://localhost:5173/verify**
2. Pegá el **email** que usaste al registrarte y el **código** copiado de Ethereal
3. Presioná **“Verificar”**
4. Si todo salió bien, vas a ser redirigido automáticamente al login

### 4. Iniciar sesión
1. Abrí: **http://localhost:5173/login**
2. Ingresá tu email y password
3. ¡Listo! Ya estás dentro de la app ✅

---

## 🚑 Problemas Comunes

| Problema | Causa probable | Solución |
|----------|----------------|----------|
| No llega el email a Ethereal | Backend no corre / SMTP mal configurado | Revisá la terminal del backend. Deberías ver “✅ Mailer service up and running!” |
| Error CORS al registrar | Front corriendo en puerto distinto | Confirmá que el backend permite el puerto (env `FRONT_ORIGIN`) |
| Código inválido al verificar | Código copiado incompleto o expirado | Volvé a Ethereal y confirmá que el código coincide. Podés reenviar el registro |

---

## 📎 Enlaces útiles

- API Docs Swagger: http://localhost:8080/docs
- Bandeja directa de Ethereal: https://ethereal.email/messages
- Guía de diagnóstico de errores 500: `api/ERROR_500_FIXED.md`
- Fix de CORS documentado: `api/CORS_FIX.md`

---

**Última actualización:** 12 de octubre de 2025
