# 🐛 Guía de Diagnóstico - Error 500 en Registro

## 🔍 Problema Identificado

**Error:** `POST http://localhost:8080/api/users/register 500 (Internal Server Error)`

Este es un error del servidor (backend), no del frontend. El error 500 significa que el servidor recibió la petición pero algo falló al procesarla.

---

## ✅ Verificaciones en el Frontend (Ya corregidas)

### 1. **Payload correcto**
Ahora el frontend envía exactamente:
```json
{
  "name": "string",
  "surname": "string",
  "email": "string",
  "password": "string"
}
```

✅ Se removió el campo `metadata: {}` que no estaba en el Swagger

### 2. **Mejor logging**
Ahora verás en la consola del navegador:
- El payload que se envía (con password oculto)
- Detalles del error 500
- Sugerencias de qué revisar

---

## 🔧 Diagnóstico del Backend

### **Paso 1: Verificar que el servidor está corriendo**

```bash
# Verifica que el proceso esté activo
curl http://localhost:8080/api/users/register

# Si responde algo (aunque sea error), el servidor está vivo
```

### **Paso 2: Revisar los logs del servidor**

Busca en los logs de tu servidor Spring Boot (terminal donde corre el backend):

#### **Errores Comunes:**

#### A) **Error de Base de Datos**
```
Caused by: java.sql.SQLException: Connection refused
```
**Solución:** 
- Inicia tu base de datos (MySQL, PostgreSQL, etc.)
- Verifica las credenciales en `application.properties`

#### B) **Campo faltante o tipo incorrecto**
```
MethodArgumentNotValidException
```
**Solución:**
- Verifica que el DTO en el backend coincida con el payload
- Revisa las anotaciones `@NotNull`, `@Email`, etc.

#### C) **Error de mapeo JSON**
```
HttpMessageNotReadableException
```
**Solución:**
- El backend espera campos diferentes
- Verifica nombres de campos (case-sensitive)

#### D) **Constraint de BD violado**
```
ConstraintViolationException
```
**Solución:**
- Email ya existe en la BD
- Algún campo único está duplicado

#### E) **Error en el servicio**
```
NullPointerException
```
**Solución:**
- Falta inyección de dependencias
- Objeto no inicializado

---

## 🔍 Debugging Paso a Paso

### **Opción 1: Usar Swagger UI** (Recomendado)

1. Abre: `http://localhost:8080/swagger-ui.html`
2. Busca `POST /api/users/register`
3. Click en "Try it out"
4. Ingresa datos de prueba:
```json
{
  "name": "Test",
  "surname": "User",
  "email": "test@example.com",
  "password": "password123"
}
```
5. Click "Execute"
6. Observa la respuesta

**Si funciona en Swagger pero NO en el frontend:**
- Hay un problema de CORS
- El payload del frontend difiere ligeramente

**Si NO funciona en Swagger tampoco:**
- Es un problema del backend

---

### **Opción 2: Usar curl**

```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "surname": "User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

### **Opción 3: Ver logs en tiempo real**

Si estás usando Spring Boot con Maven:

```bash
# Terminal donde corre el backend
./mvnw spring-boot:run

# Observa los logs cuando intentas registrarte
```

---

## 🛠️ Soluciones Comunes

### **Solución 1: Verificar application.properties**

```properties
# Debe estar configurado correctamente
spring.datasource.url=jdbc:mysql://localhost:3306/tu_base_datos
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña

# JPA debe crear tablas automáticamente (para desarrollo)
spring.jpa.hibernate.ddl-auto=update
```

### **Solución 2: Verificar el UserController**

```java
@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest request) {
    // Asegúrate de que RegisterRequest tiene:
    // - name (String)
    // - surname (String)
    // - email (String)
    // - password (String)
    
    // Y que userService.register() maneja errores correctamente
    try {
        User user = userService.register(request);
        return ResponseEntity.ok(user);
    } catch (Exception e) {
        log.error("Error registering user", e); // IMPORTANTE: Log del error
        return ResponseEntity.status(500).body("Error interno");
    }
}
```

### **Solución 3: Verificar la entidad User**

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String surname;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    // ... getters, setters, etc.
}
```

### **Solución 4: Agregar logging detallado**

En tu `UserService` o donde manejes el registro:

```java
@Service
public class UserService {
    
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    
    public User register(RegisterRequest request) {
        log.info("Registering user: {}", request.getEmail());
        
        try {
            // Verificar si existe
            if (userRepository.existsByEmail(request.getEmail())) {
                log.warn("User already exists: {}", request.getEmail());
                throw new UserAlreadyExistsException("Email already registered");
            }
            
            // Crear usuario
            User user = new User();
            user.setName(request.getName());
            user.setSurname(request.getSurname());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            
            log.info("Saving user: {}", request.getEmail());
            User savedUser = userRepository.save(user);
            
            log.info("User registered successfully: {}", savedUser.getId());
            return savedUser;
            
        } catch (Exception e) {
            log.error("Error registering user: {}", request.getEmail(), e);
            throw e; // Re-lanza para que el controller lo maneje
        }
    }
}
```

---

## 📋 Checklist de Verificación

En el **Backend**:
- [ ] Servidor Spring Boot está corriendo
- [ ] Base de datos está corriendo y accesible
- [ ] Tabla `users` existe (o se crea automáticamente)
- [ ] No hay errores en los logs al iniciar
- [ ] Endpoint `/api/users/register` existe en el controller
- [ ] `@Valid` y validaciones están configuradas
- [ ] PasswordEncoder está configurado (BCrypt)
- [ ] CORS está habilitado para `http://localhost:5173`

En el **Frontend**:
- [x] Payload correcto (sin `metadata`)
- [x] Headers correctos (`Content-Type: application/json`)
- [x] URL correcta (`http://localhost:8080/api/users/register`)
- [x] Logging mejorado para debugging

---

## 🎯 Próximos Pasos

1. **Intenta registrar desde Swagger UI**
   - Si funciona: problema de CORS o payload
   - Si falla: problema en el backend

2. **Revisa los logs del servidor**
   - Busca el stack trace completo
   - Identifica la causa raíz

3. **Comparte los logs**
   - Copia el error completo del servidor
   - Incluye el stack trace

4. **Prueba con datos más simples**
   ```json
   {
     "name": "A",
     "surname": "B",
     "email": "a@b.c",
     "password": "123456"
   }
   ```

---

## 📞 ¿Necesitas más ayuda?

Si después de revisar esto el error persiste:

1. **Copia el error completo del servidor** (logs de Spring Boot)
2. **Indica qué base de datos usas** (MySQL, PostgreSQL, H2, etc.)
3. **Comparte tu `application.properties`** (sin passwords)
4. **Muestra el `RegisterRequest` DTO** del backend

---

**Última actualización:** 6 de Octubre, 2025
