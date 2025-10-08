Comprartir — Guía de uso (DEV)

Aplicación web Comprartir (frontend Vue + backend Node/TS) conectada a la API real con autenticación JWT y verificación de cuenta por código enviado por email (modo desarrollo con Ethereal).

Requisitos

Node.js 22.x (recomendado con nvm)

npm 10.x

macOS/Linux/Windows

Comandos útiles con nvm:

nvm install 22.20.0
nvm use 22.20.0
node -v   # v22.20.0
npm -v    # 10.x

Estructura (resumen)
.
├─ api/                 # Backend (Node + TS)
│  ├─ .env              # Variables del backend (JWT + SMTP de prueba)
│  └─ src/...
├─ src/                 # Frontend (Vue + Vite)
├─ .env.local           # Variables del frontend
└─ vite.config.js

1) Levantar el Backend (API)

Ir a la carpeta api e instalar dependencias:

cd api
npm install


Verificar api/.env (ya debería existir). Debe tener al menos:

JWT_TOKEN=...cualquier_clave_larga...
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...@ethereal.email
SMTP_PASS=...
PORT=8080


Correr la API:

npm run api


Verás algo como:

Server running on port: 8080
Docs served on: http://localhost:8080/docs
Database connection established!
Mailer service up and running!


Docs: http://localhost:8080/docs

Base URL real (front): http://localhost:8080/api

2) Levantar el Frontend

En la raíz del proyecto (no dentro de api/), configurar .env.local:

VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCKS=false


Instalar y ejecutar:

npm install
npm run dev


Abrí el navegador en la URL que te indique Vite (p.ej. http://localhost:5173).

3) Usuario de prueba (listo para usar)

Email: demo@example.com

Contraseña: 123456

Esta cuenta ya está creada y verificada, por lo que podés iniciar sesión directamente desde la página de Login.

4) Crear una cuenta nueva y verificarla

La API, en modo desarrollo, envía el código de verificación a un buzón Ethereal (correo de testing). Además, por conveniencia, el endpoint que dispara el envío devuelve el código en el JSON de respuesta.

Opción A — Todo desde la UI

Ir a Registro y crear una cuenta (Nombre/Apellido/Email/Contraseña).

Al registrarte, te redirige a /verify?email=tu@correo.com
.

En tu mail de desarrollo (Ethereal) llega un email con:

Asunto: Verifica tu cuenta de Comprartir

Cuerpo: Copia y pega el siguiente token 'TOKEN_ENVIADO' en la pagina de verificacion...

Copiá el token y pegalo en la página /verify, luego presioná Verificar.

Después podés iniciar sesión normalmente.

Si intentás loguear sin verificar, el login te enviará a /verify para que pegues el código.

Opción B — Usando la consola (rápido para dev)

Pedí que te envíen el código:

curl -s -X POST "http://localhost:8080/api/users/send-verification?email=tu@correo.com"


Respuesta típica:

{"code":"e85c5eed504cdeea"}


Verificá la cuenta:

curl -i -X POST 'http://localhost:8080/api/users/verify-account' \
-H 'Content-Type: application/json' \
--data '{"code":"e85c5eed504cdeea"}'


Listo: ya podés iniciar sesión desde la UI.

También podés entrar a https://ethereal.email
y abrir la casilla con SMTP_USER/SMTP_PASS de api/.env para ver el mail “real” de prueba.

5) Smoke test rápido por consola (opcional)
# Registro (si querés otro usuario)
curl -i -X POST 'http://localhost:8080/api/users/register' \
-H 'Content-Type: application/json' \
--data '{"name":"Kalani","surname":"Dubovitsky","email":"tu@correo.com","password":"12345678"}'

# Enviar verificación (dev devuelve el code)
curl -s -X POST "http://localhost:8080/api/users/send-verification?email=tu@correo.com"

# Verificar
curl -i -X POST 'http://localhost:8080/api/users/verify-account' \
-H 'Content-Type: application/json' \
--data '{"code":"PEGAR_CODE"}'

# Login
curl -s -X POST 'http://localhost:8080/api/users/login' \
-H 'Content-Type: application/json' \
--data '{"email":"tu@correo.com","password":"12345678"}'

6) Persistencia de datos (¿se borra al reiniciar?)

La API levanta una base local (embebida o de archivo). En la práctica, los usuarios y datos deberían persistir entre reinicios mientras no borres los archivos de datos del backend ni cambies su modo de ejecución.

Si al reiniciar la API notás que tu usuario desaparece, probablemente esa ejecución está en modo no persistente (in-memory) o se regeneró el archivo de datos. En ese caso:

Volvé a registrar y verificar el usuario (2 minutos), o

Revisá la configuración de persistencia/documentación del backend para forzar modo persistente en tu entorno.
7) Problemas comunes

No llega el mail a Gmail: en dev se usa Ethereal (correo de testing). Usá la Opción B (consola) para obtener el código, o iniciá sesión en Ethereal con SMTP_USER/SMTP_PASS del api/.env.

401 “Account not verified”: verificá tu cuenta con el token en /verify.

401 “Token missing”: el frontend no está mandando el Authorization: Bearer <token>. Asegurate de iniciar sesión en la UI (o setear localStorage['accessToken']).

CORS en el navegador: el backend ya expone Access-Control-Allow-Origin: *. Si persiste, revisá que el front apunte a VITE_API_BASE_URL=http://localhost:8080/api y que no estén activos mocks (VITE_USE_MOCKS=false).

8) Variables importantes

Frontend (.env.local)

VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCKS=false


Backend (api/.env)

JWT_TOKEN=...
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...@ethereal.email
SMTP_PASS=...
PORT=8080

9) Atajos útiles

Correr API y Front juntos (opcional):

// package.json (raíz)
{
"scripts": {
"dev:all": "concurrently -n api,web -c green,blue \"npm --prefix api run api\" \"npm run dev\""
},
"devDependencies": {
"concurrently": "^9.0.0"
}
}

npm i -D concurrently
npm run dev:all