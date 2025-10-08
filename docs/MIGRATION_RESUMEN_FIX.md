# 🚀 Guía de Migración: Panel de Resumen con Estadísticas Reales

## ¿Qué cambió?

El panel de Resumen ahora usa el store de Pinia como fuente única de verdad para todas las estadísticas, garantizando que los números sean siempre correctos y reactivos.

## Cambios en la API del Store

### Nuevos getters (computed, reactivos)

```javascript
const listsStore = useListsStore()

// Usar en lugar de calcular manualmente
listsStore.totalLists       // Total de listas
listsStore.totalItems        // Suma de todos los ítems
listsStore.purchasedItems    // Ítems marcados como comprados
listsStore.pendingItems      // Ítems pendientes
listsStore.completedLists    // Listas 100% compradas
listsStore.sharedLists       // Listas compartidas
```

### Nuevas acciones

```javascript
// Guardar items de una lista específica en el cache global
listsStore.setItemsForList(listId, items)

// Toggle local sin refetch (optimistic update)
listsStore.localToggleItem(listId, itemId, purchased)

// Actualizar todo el cache de una vez (útil si se implementa /stats)
listsStore.setAllItemsByList(new Map([[1, [...]], [2, [...]]]))
```

## Patrón de uso recomendado

### En vistas de listado (ej: Lists.vue)

```javascript
import { useListsStore } from '@/stores/lists'

const listsStore = useListsStore()

// 1. Cargar listas
async function fetchLists() {
  const response = await getShoppingLists(params)
  lists.value = response.data
  listsStore.setLists(lists.value) // ← Actualizar store
  
  // 2. Cargar items de cada lista para estadísticas
  await fetchItemCounts()
}

async function fetchItemCounts() {
  await Promise.all(
    lists.value.map(async (list) => {
      const itemsResponse = await getListItems(list.id)
      const items = itemsResponse.data || []
      // ← Guardar en store
      listsStore.setItemsForList(list.id, items)
    })
  )
}

// 3. Usar getters en computed
const summaryStats = computed(() => ({
  totalLists: listsStore.totalLists,
  totalItems: listsStore.totalItems,
  completedItems: listsStore.purchasedItems,
  // etc...
}))
```

### En vistas de detalle (ej: ListDetail.vue)

```javascript
import { useListsStore } from '@/stores/lists'

const listsStore = useListsStore()

// Al cargar items de la lista actual
async function fetchItems() {
  const items = await getListItems(listId)
  items.value = items
  // ← Actualiza automáticamente itemsByList
  listsStore.setCurrentItems(items)
}

// Al marcar/desmarcar un item
async function toggleProduct(itemId) {
  const updated = await toggleItemPurchased(listId, itemId, !item.purchased)
  
  // Actualizar local
  items.value[index] = { ...items.value[index], ...updated }
  
  // ← Sincronizar con store para que el Resumen reaccione
  listsStore.localToggleItem(listId, itemId, updated.purchased)
}
```

## Beneficios de este patrón

✅ **Reactivo**: Los cambios se propagan automáticamente a todos los componentes que usan el store
✅ **Centralizado**: Una sola fuente de verdad, no hay duplicación de lógica
✅ **Optimizado**: Updates optimistas locales sin necesidad de refetch completo
✅ **Mantenible**: Fácil de extender con nuevas estadísticas

## Checklist para nuevos features

Cuando agregues funcionalidad que modifique listas o ítems:

- [ ] ¿Actualizas el store además del estado local?
- [ ] ¿Usas los getters del store en lugar de calcular manualmente?
- [ ] ¿Llamas a `localToggleItem` cuando cambies el estado `purchased`?
- [ ] ¿Actualizas `itemsByList` cuando cargues ítems de una lista?

## Retrocompatibilidad

✅ Todos los getters y acciones existentes siguen funcionando
✅ No se requieren cambios en componentes que no usan estadísticas
✅ `currentList` y `currentItems` siguen funcionando como antes

## Preguntas frecuentes

**P: ¿Necesito cargar todos los items de todas las listas siempre?**
R: Solo si vas a mostrar el panel de Resumen. En el futuro podemos implementar un endpoint `/api/lists/stats` que devuelva solo los conteos sin cargar todos los items.

**P: ¿Qué pasa si tengo 100+ listas?**
R: El código actual carga los items en paralelo con `Promise.all`, pero si el rendimiento es un problema, considera:
- Implementar paginación en `fetchItemCounts`
- Usar un endpoint de stats en el backend
- Agregar un límite con `per_page: 20` y solo cargar stats de las listas visibles

**P: ¿Puedo usar este patrón en otras vistas (Pantries, etc.)?**
R: ¡Sí! Es un patrón general aplicable a cualquier feature con estadísticas agregadas.

## Migración de código existente

### ANTES ❌
```javascript
const summaryStats = computed(() => {
  let total = 0
  let purchased = 0
  lists.value.forEach(list => {
    const counts = listItemsCounts.value[list.id]
    if (counts) {
      total += counts.total
      purchased += counts.bought
    }
  })
  return { total, purchased }
})
```

### DESPUÉS ✅
```javascript
const summaryStats = computed(() => ({
  totalItems: listsStore.totalItems,
  purchasedItems: listsStore.purchasedItems
}))
```

---

**Última actualización**: 2025-10-08
**Autor**: AI Assistant
**Revisores**: [Tu equipo]

