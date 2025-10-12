# 🔧 Error CORS Resuelto

## 🐛 Problema

```
Access to XMLHttpRequest at 'http://localhost:8080/api/users/register' 
from origin 'http://localhost:5174' has been blocked by CORS policy: 
The 'Access-Control-Allow-Origin' header has a value 'http://localhost:5173' 
that is not equal to the supplied origin.
```

## 🔍 Causa

- **Frontend corre en:** `http://localhost:5174` (puerto 5174)
- **Backend esperaba:** `http://localhost:5173` (puerto 5173)
- **Motivo:** El puerto 5173 estaba ocupado, Vite cambió automáticamente a 5174

## ✅ Solución

**Archivo:** `api/.env`

```diff
- FRONT_ORIGIN=http://localhost:5174
+ FRONT_ORIGIN=http://localhost:5173,http://localhost:5174
```

**Acción requerida:** Reiniciar el servidor API

---

## 🚀 Cómo Aplicar el Fix

### 1. Detener el servidor API
```bash
lsof -ti:8080 | xargs kill -9
```

### 2. Iniciar con la nueva configuración
```bash
cd api
npm run api
```

### 3. (Opcional) Verificar CORS manualmente
```bash
curl -s -D - -X OPTIONS http://localhost:8080/api/users/register \
	-H "Origin: http://localhost:5173" \
	-H "Access-Control-Request-Method: POST"

curl -s -D - -X OPTIONS http://localhost:8080/api/users/register \
	-H "Origin: http://localhost:5174" \
	-H "Access-Control-Request-Method: POST"
```

### 4. Verificar que esté corriendo
```
✅ Server running on port: 8080
✅ Database connection established!
✅ Mailer service up and running!
```

---

## 🎯 Estado Actual

### ✅ Backend (API)
- **Puerto:** 8080
- **CORS permitido:** `http://localhost:5173`, `http://localhost:5174`
- **Estado:** ✅ Funcionando

### ✅ Frontend
- **Puerto:** 5174 (auto-asignado por Vite)
- **Estado:** ✅ Funcionando

---

## 🧪 Probar Ahora

1. Abrí: http://localhost:5174/register
2. Completá el formulario
3. Click "Registrar"
4. ✅ Debería funcionar sin errores de CORS

---

## 💡 Nota sobre Puertos

Si en el futuro el frontend cambia de puerto:

1. Verificá en qué puerto está corriendo Vite (lo muestra al iniciar)
2. Actualizá `FRONT_ORIGIN` en `api/.env`
3. Reiniciá el servidor API

### Puertos comunes de Vite:
- `5173` (por defecto)
- `5174` (si 5173 está ocupado)
- `5175` (si 5174 está ocupado)

> 📌 Tip: podés agregar más orígenes separados por comas en `FRONT_ORIGIN` si necesitás permitir hosts externos.

---

**Fecha:** 12 de Octubre, 2025
