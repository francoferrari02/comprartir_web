# Solución al Problema de CORS y Registro de Usuarios

## ✅ Cambios Realizados

### 1. Configuración de CORS Actualizada en el Backend

He actualizado el archivo `api/src/app.ts` con una configuración de CORS más completa:

```typescript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

Esta configuración permite:
- ✅ Peticiones desde localhost en los puertos 5173, 5174 y 3000
- ✅ Credenciales (cookies, headers de autenticación)
- ✅ Todos los métodos HTTP necesarios
- ✅ Headers personalizados requeridos por la aplicación

## 🔧 Cómo Reiniciar el Backend Manualmente

Para aplicar los cambios de CORS, necesitas reiniciar el backend:

### Paso 1: Detener el backend actual
```bash
# Encuentra el proceso del backend
lsof -i :8080

# Mata el proceso (reemplaza PID con el número que aparece)
kill -9 PID

# O mata todos los procesos de ts-node
pkill -9 -f "ts-node"
```

### Paso 2: Esperar que el puerto se libere
```bash
# Verifica que el puerto esté libre
sleep 3
lsof -i :8080  # No debería mostrar nada
```

### Paso 3: Iniciar el backend
```bash
cd /Users/keoni/Documents/GitHub/comprartir_web/api
npm run api
```

El backend debería mostrar algo como:
```
[dotenv] injecting env from .env
Server running on port 8080
```

## 📋 Verificación

Una vez que el backend esté corriendo:

1. **Verifica que esté escuchando en el puerto 8080:**
   ```bash
   lsof -i :8080
   ```

2. **Prueba el registro de usuarios:**
   - Ve a http://localhost:5173/register (o 5174 según el puerto de tu frontend)
   - Intenta crear un nuevo usuario
   - Ya NO deberías ver errores de CORS

## 🐛 Si Sigues Teniendo Problemas

### Error: "address already in use"
Si ves el error `EADDRINUSE`, significa que el puerto 8080 todavía está en uso:
```bash
# Solución: Mata TODOS los procesos de Node
pkill -9 node

# Espera 5 segundos
sleep 5

# Reinicia solo el backend
cd api && npm run api
```

### Error: "No 'Access-Control-Allow-Origin' header"
Si aún ves errores de CORS:
1. Verifica que el backend esté usando el archivo `app.ts` actualizado
2. Reinicia COMPLETAMENTE el backend (no hot-reload)
3. Limpia el caché del navegador (Cmd+Shift+R en Mac)

## 🎯 Resumen de Cambios Implementados en esta Sesión

1. ✅ **Sistema de Notificaciones Completo**
   - Store de notificaciones en Pinia
   - Servicio de notificaciones
   - Composable useNotifications
   - Notificaciones implementadas en ListDetail y PantryDetail

2. ✅ **Home Dashboard Actualizado**
   - SharedWithMe: Muestra listas compartidas reales
   - ActivityFeed: Muestra notificaciones reales del sistema

3. ✅ **Configuración de CORS Mejorada**
   - Backend configurado para aceptar peticiones del frontend
   - Múltiples puertos permitidos para desarrollo

## 📝 Notas Importantes

- El backend DEBE ser reiniciado completamente para que los cambios de CORS surtan efecto
- Los cambios de hot-reload NO aplican para la configuración de middleware
- Si tienes problemas persistentes con el puerto 8080, considera cambiar el puerto en el backend temporalmente

---

**Creado:** 11 de Octubre, 2025
**Archivos modificados:** 
- `api/src/app.ts` (configuración de CORS)
- `src/stores/notifications.js` (store de notificaciones)
- `src/services/notifications.service.js` (servicio limpio)
- `src/components/SharedWithMe.vue` (datos reales)
- `src/components/ActivityFeed.vue` (notificaciones reales)

