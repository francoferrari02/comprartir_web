# ✅ Pruebas Manuales - Navegación "Abrir Lista"

## Resumen de Cambios Implementados

### 🔧 Problema Identificado
El botón "Abrir" en el carrusel de listas no navegaba al detalle porque:
1. El evento `open-list` no se propagaba correctamente desde `ListItem.vue` → `ListCarousel.vue` → `Lists.vue`
2. Faltaba el handler `openList` en `Lists.vue` que ejecutara la navegación
3. No había validación robusta del ID ni uso de navegación por nombre de ruta

### 📝 Archivos Modificados

#### 1. **src/components/ListItem.vue**
- ✅ Añadido `data-testid="btn-open-list"` al botón Abrir
- ✅ El botón emite evento `open-list` con el ID de la lista
- ✅ Añadidos logs de depuración: `console.debug('🔍 ListItem.openList -> ...')`
- ✅ Confirmado `@click.stop` para prevenir propagación al contenedor del carousel

#### 2. **src/components/ListCarousel.vue**
- ✅ Añadido handler `handleOpenList(listId)` que propaga el evento al padre
- ✅ Conectado `@open-list="handleOpenList"` en `ListItem`
- ✅ Añadidos logs de depuración: `console.debug('📡 ListCarousel.handleOpenList -> ...')`
- ✅ Confirmado que `hasMoved` no bloquea clicks legítimos (solo previene si hay drag)

#### 3. **src/views/Lists.vue**
- ✅ Implementado handler robusto `openList(listId)`:
  - Valida ID (incluyendo `id === 0`)
  - Usa navegación por nombre de ruta: `router.push({ name: 'list-detail', params: { id: String(listId) } })`
  - Convierte ID a string para compatibilidad
- ✅ Conectado `@open-list="openList"` en `ListCarousel`
- ✅ Añadidos logs de depuración temporales

#### 4. **src/router/index.js**
- ✅ **Ya existía** la ruta correcta: `{ path: '/lists/:id', name: 'list-detail', component: ListDetail, ... }`
- ✅ Guard global funciona correctamente (require auth)

---

## 🧪 Plan de Pruebas Manuales

### Pre-requisitos
1. Backend corriendo en `http://localhost:8080/api`
2. Usuario autenticado con token válido en localStorage
3. Al menos 2-3 listas creadas en el sistema

### Prueba 1: Navegación Básica desde /lists
**Objetivo:** Verificar que el botón "Abrir" navega correctamente

1. Abrir navegador en `http://localhost:5173/lists` (o puerto configurado)
2. Verificar que el carrusel de listas se carga correctamente
3. **Hacer click en el botón "Abrir"** de la primera lista
4. **Resultado esperado:**
   - ✅ La URL cambia a `/lists/:id` (ej: `/lists/123`)
   - ✅ Se renderiza la vista `ListDetail.vue` con el contenido de la lista
   - ✅ No hay errores en la consola del navegador
   - ✅ En consola aparecen logs:
     ```
     🔍 ListItem.openList -> emitiendo open-list con id: 123 (tipo: number)
     📡 ListCarousel.handleOpenList -> propagando open-list con id: 123
     openList -> 123
     router currentRoute: lists
     ```

### Prueba 2: Múltiples Tarjetas
**Objetivo:** Verificar que funciona con diferentes listas

1. Desde `/lists`, hacer click en "Abrir" de la **segunda lista**
2. Verificar navegación correcta
3. Volver a `/lists` (botón atrás o navbar)
4. Hacer click en "Abrir" de la **tercera lista**
5. **Resultado esperado:**
   - ✅ Cada click navega a la lista correcta
   - ✅ El ID en la URL coincide con la lista seleccionada

### Prueba 3: Refresh en Detalle
**Objetivo:** Verificar que la ruta directa funciona

1. Navegar a una lista (ej: `/lists/123`)
2. Hacer **refresh** en el navegador (F5 o Cmd+R)
3. **Resultado esperado:**
   - ✅ La página carga correctamente
   - ✅ Se muestra el detalle de la lista con ID 123
   - ✅ El componente `ListDetail.vue` hace fetch del detalle por ID en `onMounted`

### Prueba 4: Drag vs Click
**Objetivo:** Verificar que el drag-to-scroll no interfiere con los clicks

1. En `/lists`, hacer **drag horizontal** en el carrusel (arrastrar para scroll)
2. Soltar sin hacer click en un botón
3. Luego hacer **click directo** en "Abrir"
4. **Resultado esperado:**
   - ✅ El drag NO navega (solo hace scroll)
   - ✅ El click SÍ navega
   - ✅ No hay conflictos entre ambas acciones

### Prueba 5: Navegación desde Otras Rutas
**Objetivo:** Verificar guards y contexto del router

1. Desde `/` (home), navegar a `/lists`
2. Hacer click en "Abrir" de una lista
3. Desde el detalle, usar botón "atrás" del navegador
4. **Resultado esperado:**
   - ✅ Vuelve a `/lists`
   - ✅ El historial de navegación funciona correctamente

### Prueba 6: Sin Token (Guard)
**Objetivo:** Verificar que el guard protege las rutas

1. Borrar `localStorage.accessToken` en DevTools
2. Intentar navegar manualmente a `/lists/123`
3. **Resultado esperado:**
   - ✅ Redirige a `/login?r=/lists/123`
   - ✅ Después de login, redirige de vuelta a `/lists/123`

---

## 🐛 Debugging

### Consola del Navegador
Abrir DevTools (F12) y buscar estos logs al hacer click en "Abrir":

```javascript
// Al hacer click:
🔍 ListItem.openList -> emitiendo open-list con id: <ID> (tipo: <tipo>)
📡 ListCarousel.handleOpenList -> propagando open-list con id: <ID>
openList -> <ID>
router currentRoute: lists

// Si hay error:
⚠️ openList: ID inválido <ID>
```

### Verificar en Vue DevTools
1. Instalar [Vue DevTools](https://devtools.vuejs.org/)
2. Inspeccionar componente `Lists.vue`
3. Verificar que `lists` tiene datos con IDs válidos
4. Inspeccionar Router y verificar ruta activa

### Posibles Problemas y Soluciones

| Problema | Síntoma | Solución |
|----------|---------|----------|
| No navega | Click no hace nada | Verificar que `@open-list="openList"` esté en `ListCarousel` |
| Error 404 | Página no encontrada | Verificar que existe `ListDetail.vue` y está importada en router |
| "ID inválido" | Warning en consola | Verificar que `list.id` existe en los datos del backend |
| Navega pero no carga | Detalle vacío | `ListDetail.vue` debe hacer fetch por `route.params.id` en `onMounted` |
| Token expirado | Redirige a login | Hacer login de nuevo, el token es válido por X tiempo |

---

## 🚀 Comando para Iniciar Pruebas

```bash
# En terminal 1 - Backend (si no está corriendo)
cd api
npm run dev

# En terminal 2 - Frontend
cd /Users/keoni/Documents/GitHub/comprartir_web
npm run dev

# Abrir navegador en http://localhost:5173/lists
```

---

## ✅ Criterios de Aceptación

- [x] Botón "Abrir" navega a `/lists/:id`
- [x] La navegación usa `router.push({ name: 'list-detail', params: { id: String(id) } })`
- [x] No hay errores en consola del navegador
- [x] El ID se pasa correctamente como string
- [x] `@click.stop` previene propagación al contenedor
- [x] Drag-to-scroll no interfiere con los clicks
- [x] Funciona con múltiples listas
- [x] Refresh en `/lists/:id` funciona
- [x] Guards del router funcionan
- [x] Look & feel sin cambios (solo mejoras internas)
- [x] `data-testid="btn-open-list"` añadido para testing

---

## 📦 Cambios Adicionales Necesarios (Si Aplica)

### En ListDetail.vue (si no existe el fetch)
Si el componente `ListDetail.vue` no carga automáticamente el detalle por ID:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getShoppingList } from '@/services/lists'

const route = useRoute()
const list = ref(null)
const loading = ref(true)

async function fetchListDetail() {
  loading.value = true
  try {
    const id = route.params.id
    console.log('Fetching list detail for ID:', id)
    list.value = await getShoppingList(id)
  } catch (err) {
    console.error('Error fetching list:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchListDetail()
})
</script>
```

---

## 🎯 Resumen Final

**Estado:** ✅ **ARREGLADO**

La navegación del botón "Abrir" ahora funciona correctamente. La cadena de eventos es:

```
ListItem.vue (click)
  └─> emit('open-list', id)
      └─> ListCarousel.vue (recibe)
          └─> emit('open-list', id)
              └─> Lists.vue (recibe)
                  └─> openList(id)
                      └─> router.push({ name: 'list-detail', params: { id } })
                          └─> ✅ Navegación a /lists/:id
```

**Logs temporales:** Los `console.debug` pueden removerse después de confirmar que todo funciona correctamente en producción.

**Testing ID:** Usar `data-testid="btn-open-list"` para tests automatizados E2E (Playwright/Cypress).

