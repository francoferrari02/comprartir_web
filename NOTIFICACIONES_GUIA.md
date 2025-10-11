# Sistema de Notificaciones - Guía de Uso

## 📬 Descripción

El sistema de notificaciones permite mostrar eventos importantes a los usuarios, como cuando se comparten listas/despensas o cuando se agregan items a recursos compartidos.

## 🏗️ Arquitectura

### 1. **Store de Notificaciones** (`stores/notifications.js`)
- Maneja el estado de todas las notificaciones
- Persistencia en localStorage
- Getters para filtrar notificaciones (leídas, no leídas, por tipo)
- Acciones para agregar, marcar como leída, eliminar

### 2. **Servicio de Notificaciones** (`services/notifications.service.js`)
- API simplificada para disparar notificaciones
- Métodos específicos para cada tipo de evento

### 3. **Composable** (`composables/useNotifications.js`)
- Hook de Vue para usar en componentes
- Métodos reactivos para disparar notificaciones

## 📝 Tipos de Notificaciones

### Lista Compartida
```javascript
notificationService.listShared('Mi Lista', 123, 'Juan Pérez')
```

### Despensa Compartida
```javascript
notificationService.pantryShared('Mi Despensa', 456, 'María García')
```

### Item Agregado
```javascript
notificationService.itemAdded('Leche', 'Compras Semanales', 123, 'Pedro López', 'list')
```

### Item Comprado
```javascript
notificationService.itemPurchased('Leche', 'Compras Semanales', 123, 'Ana Martínez')
```

### Lista Completada
```javascript
notificationService.listCompleted('Compras Semanales', 123)
```

### Acceso Revocado
```javascript
notificationService.accessRevoked('Mi Lista', 'list')
```

## 💡 Cómo Usar en tus Componentes

### Ejemplo 1: Compartir una Lista

```vue
<script setup>
import { useNotifications } from '@/composables/useNotifications'

const { notifyListShared } = useNotifications()

async function shareShopping() {
  // ... lógica de compartir lista ...
  
  // Disparar notificación SOLO si el backend indica que se compartió con éxito
  // y la acción la hizo OTRO usuario (para notificar al receptor)
  const response = await shareShoppingList(listId, email)
  
  // En un escenario real, esto vendría de un webhook o WebSocket
  // Por ahora, podemos dispararlo manualmente en desarrollo:
  notifyListShared(list.name, list.id, currentUser.name)
}
</script>
```

### Ejemplo 2: Agregar Item a Lista Compartida

```vue
<script setup>
import { useNotifications } from '@/composables/useNotifications'

const { notifyItemAdded } = useNotifications()

async function addItemToList() {
  const item = await addListItem(listId, itemData)
  
  // Si la lista está compartida, notificar a los otros usuarios
  if (list.sharedWith?.length > 0) {
    notifyItemAdded(
      item.productName,
      list.name,
      list.id,
      currentUser.name,
      'list'
    )
  }
}
</script>
```

## 🎨 UI de Notificaciones

### En el Header
- Badge con contador de no leídas
- Menú desplegable al hover con últimas 5 notificaciones
- Link a página completa de notificaciones

### Página de Notificaciones (`/notifications`)
- Filtros por tipo (todas, no leídas, por categoría)
- Marcar como leída individual o todas
- Eliminar individual o todas
- Click para ir al recurso relacionado
- Timestamps relativos ("Hace 5 min", "Hace 2 horas")

## 📊 Persistencia

Las notificaciones se guardan en `localStorage` con la key `notifications`. Esto permite que persistan entre sesiones y recargas de página.

## 🔮 Futuro: Integración con Backend

Cuando el backend implemente notificaciones:

1. **Endpoint GET `/api/notifications`**
   - Fetch inicial de notificaciones del servidor
   - Sincronizar con localStorage

2. **WebSocket / Server-Sent Events**
   - Recibir notificaciones en tiempo real
   - Actualizar store automáticamente

3. **Endpoint POST `/api/notifications/{id}/read`**
   - Marcar como leída en el servidor
   - Sincronizar estado

## 🎯 Ejemplos de Integración

### En ListDetail.vue
```javascript
// Cuando se comparte la lista
async function shareList() {
  const result = await shareShoppingList(listId, shareEmail.value)
  notifyListShared(list.value.name, list.value.id, currentUser.name)
}

// Cuando se agrega un item
async function addItem() {
  const item = await addListItem(listId, itemData)
  if (list.value.sharedWith?.length > 0) {
    notifyItemAdded(item.productName, list.value.name, list.value.id, currentUser.name, 'list')
  }
}
```

### En PantryDetail.vue
```javascript
// Cuando se comparte la despensa
async function sharePantry() {
  const result = await sharePantryService(pantryId, shareEmail.value)
  notifyPantryShared(pantry.value.name, pantry.value.id, currentUser.name)
}

// Cuando se agrega un item
async function addItem() {
  const item = await addPantryItem(pantryId, itemData)
  if (pantry.value.sharedWith?.length > 0) {
    notifyItemAdded(item.productName, pantry.value.name, pantry.value.id, currentUser.name, 'pantry')
  }
}
```

## 🧪 Testing

Para probar las notificaciones durante desarrollo:

```javascript
import { notificationService } from '@/services/notifications.service'

// En la consola del navegador:
notificationService.listShared('Compras del Super', 1, 'Juan Pérez')
notificationService.pantryShared('Despensa Principal', 1, 'María López')
notificationService.itemAdded('Leche', 'Compras Semanales', 1, 'Pedro García', 'list')
```

## 📱 Features Implementadas

- ✅ Store de notificaciones con Pinia
- ✅ Persistencia en localStorage
- ✅ Badge en Header con contador
- ✅ Menú desplegable con últimas notificaciones
- ✅ Página completa de notificaciones
- ✅ Filtros por tipo
- ✅ Marcar como leída/eliminar
- ✅ Timestamps relativos
- ✅ Links a recursos relacionados
- ✅ Tipos específicos de notificaciones
- ✅ Composable para fácil uso

## 🚀 Próximos Pasos

1. Integrar en componentes existentes (ListDetail, PantryDetail)
2. Agregar notificaciones de backend cuando estén disponibles
3. Implementar WebSocket/SSE para notificaciones en tiempo real
4. Agregar sonido/animación para nuevas notificaciones
5. Preferencias de notificaciones (qué recibir, frecuencia)

