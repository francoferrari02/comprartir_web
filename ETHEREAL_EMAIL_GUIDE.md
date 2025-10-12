# Cómo Ver los Emails de Desarrollo (Ethereal)

## Tu Configuración Actual

Tu backend está configurado para usar **Ethereal Email**, un servicio de email falso para desarrollo.

### Credenciales de Ethereal
```
Email:    comprartir@ethereal.email
Password: ej4FWfjdtuNMez6Mkw
```

## Cómo Acceder a los Emails

### Opción 1: Desde el Script (Recomendado)
```bash
cd api
./ethereal-inbox.sh
```

### Opción 2: Manual
1. Abrí tu navegador
2. Ve a: **https://ethereal.email/login**
3. Ingresá:
   - Username: `comprartir@ethereal.email`
   - Password: `ej4FWfjdtuNMez6Mkw`
4. Hacé clic en "Sign In"
5. Verás todos los emails enviados por tu aplicación

### Opción 3: Enlace Directo
Si ya iniciaste sesión alguna vez, podés ir directo a:
**https://ethereal.email/messages**

## Qué Vas a Ver en Ethereal

Cuando un usuario:
- **Se registra** → Email con código de verificación de cuenta
- **Recupera contraseña** → Email con código de reset de contraseña
- **Comparte lista/despensa** → Email de notificación

Todos los emails aparecen en la bandeja de Ethereal en tiempo real.

## Ejemplo de Flujo Completo

### 1. Registro de Usuario
```bash
# El usuario se registra en http://localhost:5173/register
# Email: test@example.com
# Password: Password123
```

En Ethereal verás un email con:
- **Subject**: "Welcome to Grocery Manager!"
- **Body**: Código de verificación de 6 dígitos

### 2. Recuperar Contraseña
```bash
# El usuario va a http://localhost:5173/forgot-password
# Ingresa: test@example.com
```

En Ethereal verás un email con:
- **Subject**: "Reset Your Password"
- **Body**: Código de recuperación de 6 dígitos

### 3. Copiar el Código
1. Abrí el email en Ethereal
2. Copiá el código (ejemplo: `ABC123`)
3. Pegalo en la app en `/reset-password`

## Alternativa: Ver Códigos Directamente en la Base de Datos

Si querés ver los códigos sin abrir Ethereal, podés consultar la base de datos:

### Ver código de verificación de cuenta
```bash
cd api/src
sqlite3 db/init.sqlite "SELECT u.email, vt.token, datetime(vt.expirationDate/1000, 'unixepoch') as expires FROM user_verification_token vt JOIN user u ON vt.userId = u.id WHERE u.email = 'TU_EMAIL_AQUI' ORDER BY vt.expirationDate DESC LIMIT 1;"
```

### Ver código de recuperación de contraseña
```bash
cd api/src
sqlite3 db/init.sqlite "SELECT u.email, prt.token, datetime(prt.expirationDate/1000, 'unixepoch') as expires FROM user_password_recovery_token prt JOIN user u ON prt.userId = u.id WHERE u.email = 'TU_EMAIL_AQUI' ORDER BY prt.expirationDate DESC LIMIT 1;"
```

Reemplazá `TU_EMAIL_AQUI` con el email del usuario (ejemplo: `nico@email.com`).

## Troubleshooting

### "No veo emails en Ethereal"
- ✅ Verificá que el API esté corriendo (`npm run api`)
- ✅ Revisá los logs del API en la terminal
- ✅ Verificá que el usuario SMTP sea correcto en `.env`

### "El email no existe en la base de datos"
- El usuario debe estar registrado primero
- Para pruebas, registrá un usuario nuevo en `/register`

### "El código expiró"
- Los códigos expiran en 24 horas
- Solicitá uno nuevo usando "Reenviar código"

## Configuración Actual

Tu `.env` está bien configurado:
```env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=comprartir@ethereal.email
SMTP_PASS=ej4FWfjdtuNMez6Mkw
```

✅ Todo listo para usar Ethereal en desarrollo!

## Para Producción

Cuando pases a producción, cambiá estas variables por un servicio real como:
- **SendGrid**
- **Mailgun**
- **AWS SES**
- **Gmail SMTP** (para pruebas pequeñas)

Ejemplo para Gmail:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
```

