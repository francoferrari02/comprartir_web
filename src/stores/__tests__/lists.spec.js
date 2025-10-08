/**
 * Tests básicos para verificar que los getters del store de listas funcionan correctamente
 * Ejecutar con: npm run test (si está configurado) o copiar en una herramienta de testing
 */

import { setActivePinia, createPinia } from 'pinia'
import { useListsStore } from '@/stores/lists'

describe('Lists Store - Summary Statistics', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('calcula totalLists correctamente', () => {
    const store = useListsStore()

    store.setLists([
      { id: 1, name: 'Lista 1' },
      { id: 2, name: 'Lista 2' },
      { id: 3, name: 'Lista 3' }
    ])

    expect(store.totalLists).toBe(3)
  })

  it('calcula totalItems de todas las listas', () => {
    const store = useListsStore()

    store.setLists([
      { id: 1, name: 'Lista 1' },
      { id: 2, name: 'Lista 2' }
    ])

    store.setItemsForList(1, [
      { id: 1, name: 'Item 1', purchased: false },
      { id: 2, name: 'Item 2', purchased: true },
      { id: 3, name: 'Item 3', purchased: false }
    ])

    store.setItemsForList(2, [
      { id: 4, name: 'Item 4', purchased: true },
      { id: 5, name: 'Item 5', purchased: false }
    ])

    expect(store.totalItems).toBe(5)
  })

  it('calcula purchasedItems correctamente', () => {
    const store = useListsStore()

    store.setLists([{ id: 1, name: 'Lista 1' }])

    store.setItemsForList(1, [
      { id: 1, name: 'Item 1', purchased: true },
      { id: 2, name: 'Item 2', purchased: true },
      { id: 3, name: 'Item 3', purchased: false }
    ])

    expect(store.purchasedItems).toBe(2)
    expect(store.pendingItems).toBe(1)
  })

  it('calcula completedLists (todas las items purchased)', () => {
    const store = useListsStore()

    store.setLists([
      { id: 1, name: 'Lista 1' },
      { id: 2, name: 'Lista 2' },
      { id: 3, name: 'Lista 3' }
    ])

    // Lista 1: todos comprados (completada)
    store.setItemsForList(1, [
      { id: 1, purchased: true },
      { id: 2, purchased: true }
    ])

    // Lista 2: algunos comprados (no completada)
    store.setItemsForList(2, [
      { id: 3, purchased: true },
      { id: 4, purchased: false }
    ])

    // Lista 3: sin items (no cuenta como completada)
    store.setItemsForList(3, [])

    expect(store.completedLists).toBe(1)
  })

  it('localToggleItem actualiza el estado purchased reactivamente', () => {
    const store = useListsStore()

    store.setLists([{ id: 1, name: 'Lista 1' }])

    store.setItemsForList(1, [
      { id: 1, name: 'Item 1', purchased: false },
      { id: 2, name: 'Item 2', purchased: false }
    ])

    expect(store.purchasedItems).toBe(0)

    // Marcar item 1 como comprado
    store.localToggleItem(1, 1, true)

    expect(store.purchasedItems).toBe(1)
    expect(store.pendingItems).toBe(1)

    // Marcar item 2 como comprado
    store.localToggleItem(1, 2, true)

    expect(store.purchasedItems).toBe(2)
    expect(store.completedLists).toBe(1) // Ahora la lista está completa
  })

  it('removeItem actualiza las estadísticas', () => {
    const store = useListsStore()

    store.setCurrentList({ id: 1, name: 'Lista 1' })
    store.setCurrentItems([
      { id: 1, purchased: true },
      { id: 2, purchased: false }
    ])

    expect(store.totalItems).toBe(2)

    store.removeItem(1)

    expect(store.totalItems).toBe(1)
    expect(store.purchasedItems).toBe(0)
  })

  it('calcula sharedLists correctamente', () => {
    const store = useListsStore()

    store.setLists([
      { id: 1, name: 'Lista 1', sharedWith: [] },
      { id: 2, name: 'Lista 2', sharedWith: [{ id: 10, email: 'user@example.com' }] },
      { id: 3, name: 'Lista 3', sharedWith: [{ id: 11 }, { id: 12 }] },
      { id: 4, name: 'Lista 4' } // sin sharedWith
    ])

    expect(store.sharedLists).toBe(2) // Lista 2 y 3
  })

  it('maneja casos edge: listas vacías', () => {
    const store = useListsStore()

    store.setLists([])

    expect(store.totalLists).toBe(0)
    expect(store.totalItems).toBe(0)
    expect(store.purchasedItems).toBe(0)
    expect(store.completedLists).toBe(0)
    expect(store.sharedLists).toBe(0)
  })
})

/**
 * Tests de integración simulando el flujo real
 */
describe('Lists Store - Integration Flow', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('simula el flujo completo: cargar listas → marcar items → verificar resumen', () => {
    const store = useListsStore()

    // 1. Usuario carga la página /lists
    store.setLists([
      { id: 1, name: 'Supermercado', recurring: false },
      { id: 2, name: 'Farmacia', recurring: true }
    ])

    // 2. Se cargan los items de cada lista
    store.setItemsForList(1, [
      { id: 1, name: 'Leche', purchased: false },
      { id: 2, name: 'Pan', purchased: false },
      { id: 3, name: 'Huevos', purchased: true }
    ])

    store.setItemsForList(2, [
      { id: 4, name: 'Aspirina', purchased: false }
    ])

    // 3. Verificar el resumen inicial
    expect(store.totalLists).toBe(2)
    expect(store.totalItems).toBe(4)
    expect(store.purchasedItems).toBe(1)
    expect(store.pendingItems).toBe(3)
    expect(store.completedLists).toBe(0)

    // 4. Usuario entra a la lista 1 y marca items
    store.localToggleItem(1, 1, true) // Leche comprada
    store.localToggleItem(1, 2, true) // Pan comprado

    // 5. Verificar que el resumen se actualizó
    expect(store.purchasedItems).toBe(3)
    expect(store.pendingItems).toBe(1)
    expect(store.completedLists).toBe(1) // Lista 1 completada

    // 6. Usuario vuelve a /lists y el resumen debe mostrar los datos correctos
    // (sin necesidad de refetch)
    expect(store.totalLists).toBe(2)
    expect(store.totalItems).toBe(4)
    expect(store.purchasedItems).toBe(3)
    expect(store.completedLists).toBe(1)
  })
})

