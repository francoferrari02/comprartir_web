# 📧 Ethereal Email - Credenciales de Desarrollo

## 🔐 Tus Credenciales

```
Nombre:   Berry Kuphal
Email:    berry.kuphal@ethereal.email
Password: cwufHpuQweX2TbDm6C
```

---

## 🚀 Cómo Usar

### **Ver emails recibidos:**

1. Abrí: https://ethereal.email/login
2. Ingresá:
   - **Username:** `berry.kuphal@ethereal.email`
   - **Password:** `cwufHpuQweX2TbDm6C`
3. Verás todos los emails enviados por tu aplicación

### **O usá el script:**

```bash
cd api
./ethereal-inbox.sh
```

---

## 📨 ¿Qué emails deberías ver?

Después de registrar un usuario, deberías recibir:

1. **Email de verificación** con un código de 6 dígitos
2. **Email de bienvenida** (opcional)

Si hacés "Olvidé mi contraseña":
- **Email de reset de contraseña** con un link

---

## ✅ Configuración Actual

Las credenciales ya están configuradas en:

📄 **`api/.env`**
```env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=berry.kuphal@ethereal.email
SMTP_PASS=cwufHpuQweX2TbDm6C
```

---

## 🔄 Reiniciar el servidor

Después de cambiar las credenciales, reiniciá el backend:

```bash
cd api
npm run dev
```

---

## 🧪 Probar el envío de emails

1. Registrate en la app: http://localhost:5174/register
2. Ingresá tus datos
3. Hacé click en "Registrar"
4. Abrí Ethereal: https://ethereal.email/login
5. Deberías ver el email de verificación

---

## 📌 Importante

⚠️ **Ethereal es solo para desarrollo:**
- Los emails NO se envían a direcciones reales
- Solo vos podés verlos en https://ethereal.email
- Perfecto para testear sin enviar emails reales

---

## 🆘 Problemas Comunes

### No recibo emails:
1. Verificá que el servidor esté corriendo (`npm run dev`)
2. Revisá los logs del servidor por errores de SMTP
3. Verificá que las credenciales en `.env` sean correctas

### Error "Invalid login":
- Copiá y pegá las credenciales exactas
- No agregues espacios extras

---

**Fecha:** 12 de Octubre, 2025
