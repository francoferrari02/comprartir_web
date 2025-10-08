// src/stores/lists.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useListsStore = defineStore('lists', () => {
  // State
  const lists = ref([])
  const currentList = ref(null)
  const currentItems = ref([])
  const itemsByList = ref(new Map()) // Cache de items por lista para estadísticas globales
  const isLoading = ref(false)
  const filters = ref({
    search: '',
    recurring: null,
    owner: '',
    sort_by: 'updatedAt',
    order: 'DESC'
  })
  const itemsFilters = ref({
    search: '',
    purchased: null,
    category_id: null,
    pantry_id: null,
    sort_by: 'createdAt',
    order: 'ASC'
  })

  // Getters - Para la lista actual
  const listsCount = computed(() => lists.value.length)
  const recurringListsCount = computed(() =>
    lists.value.filter(l => l.recurring).length
  )
  const currentListItems = computed(() => currentItems.value)
  const purchasedItemsCount = computed(() =>
    currentItems.value.filter(i => i.purchased).length
  )
  const pendingItemsCount = computed(() =>
    currentItems.value.filter(i => !i.purchased).length
  )

  // Getters - Para estadísticas globales (todas las listas)
  const totalLists = computed(() => lists.value.length)

  const totalItems = computed(() => {
    let count = 0
    itemsByList.value.forEach(items => {
      count += items.length
    })
    return count
  })

  const purchasedItems = computed(() => {
    let count = 0
    itemsByList.value.forEach(items => {
      count += items.filter(i => i.purchased === true).length
    })
    return count
  })

  const pendingItems = computed(() => totalItems.value - purchasedItems.value)

  const completedLists = computed(() => {
    return lists.value.filter(list => {
      const items = itemsByList.value.get(list.id) || []
      if (items.length === 0) return false
      const purchased = items.filter(i => i.purchased === true).length
      return purchased === items.length
    }).length
  })

  const sharedLists = computed(() => {
    return lists.value.filter(l =>
      l.sharedWith && Array.isArray(l.sharedWith) && l.sharedWith.length > 0
    ).length
  })

  // Actions
  function setLists(newLists) {
    lists.value = newLists
  }

  function addList(list) {
    lists.value.unshift(list)
  }

  function updateList(id, updates) {
    const index = lists.value.findIndex(l => l.id === id)
    if (index !== -1) {
      lists.value[index] = { ...lists.value[index], ...updates }
    }
    if (currentList.value?.id === id) {
      currentList.value = { ...currentList.value, ...updates }
    }
  }

  function removeList(id) {
    lists.value = lists.value.filter(l => l.id !== id)
    itemsByList.value.delete(id)
    if (currentList.value?.id === id) {
      currentList.value = null
      currentItems.value = []
    }
  }

  function setCurrentList(list) {
    currentList.value = list
  }

  function setCurrentItems(items) {
    currentItems.value = items
    // También actualizar el cache global cuando cambian los items actuales
    if (currentList.value?.id) {
      itemsByList.value.set(currentList.value.id, items)
    }
  }

  // Nuevo: setear items para una lista específica sin cambiar currentItems
  function setItemsForList(listId, items) {
    itemsByList.value.set(listId, items)
  }

  // Nuevo: actualizar el cache de todas las listas
  function setAllItemsByList(itemsMap) {
    itemsByList.value = new Map(itemsMap)
  }

  function addItem(item) {
    currentItems.value.push(item)
    // Actualizar cache global
    if (currentList.value?.id) {
      const cached = itemsByList.value.get(currentList.value.id) || []
      itemsByList.value.set(currentList.value.id, [...cached, item])
    }
  }

  function updateItem(itemId, updates) {
    const index = currentItems.value.findIndex(i => i.id === itemId)
    if (index !== -1) {
      currentItems.value[index] = { ...currentItems.value[index], ...updates }
    }
    // Actualizar cache global
    if (currentList.value?.id) {
      const cached = itemsByList.value.get(currentList.value.id) || []
      const cachedIndex = cached.findIndex(i => i.id === itemId)
      if (cachedIndex !== -1) {
        cached[cachedIndex] = { ...cached[cachedIndex], ...updates }
        itemsByList.value.set(currentList.value.id, [...cached])
      }
    }
  }

  function removeItem(itemId) {
    currentItems.value = currentItems.value.filter(i => i.id !== itemId)
    // Actualizar cache global
    if (currentList.value?.id) {
      const cached = itemsByList.value.get(currentList.value.id) || []
      itemsByList.value.set(currentList.value.id, cached.filter(i => i.id !== itemId))
    }
  }

  // Nuevo: toggle local del estado purchased de un item sin hacer fetch
  function localToggleItem(listId, itemId, purchased) {
    // Actualizar en currentItems si es la lista actual
    if (currentList.value?.id === listId) {
      const index = currentItems.value.findIndex(i => i.id === itemId)
      if (index !== -1) {
        currentItems.value[index] = {
          ...currentItems.value[index],
          purchased
        }
      }
    }

    // Actualizar en el cache global
    const items = itemsByList.value.get(listId) || []
    const idx = items.findIndex(i => i.id === itemId)
    if (idx !== -1) {
      items[idx] = { ...items[idx], purchased }
      itemsByList.value.set(listId, [...items])
    }
  }

  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function setItemsFilters(newFilters) {
    itemsFilters.value = { ...itemsFilters.value, ...newFilters }
  }

  function resetFilters() {
    filters.value = {
      search: '',
      recurring: null,
      owner: '',
      sort_by: 'updatedAt',
      order: 'DESC'
    }
  }

  function resetItemsFilters() {
    itemsFilters.value = {
      search: '',
      purchased: null,
      category_id: null,
      pantry_id: null,
      sort_by: 'createdAt',
      order: 'ASC'
    }
  }

  function $reset() {
    lists.value = []
    currentList.value = null
    currentItems.value = []
    itemsByList.value = new Map()
    isLoading.value = false
    resetFilters()
    resetItemsFilters()
  }

  return {
    // State
    lists,
    currentList,
    currentItems,
    itemsByList,
    isLoading,
    filters,
    itemsFilters,
    // Getters - Lista actual
    listsCount,
    recurringListsCount,
    currentListItems,
    purchasedItemsCount,
    pendingItemsCount,
    // Getters - Estadísticas globales
    totalLists,
    totalItems,
    purchasedItems,
    pendingItems,
    completedLists,
    sharedLists,
    // Actions
    setLists,
    addList,
    updateList,
    removeList,
    setCurrentList,
    setCurrentItems,
    setItemsForList,
    setAllItemsByList,
    addItem,
    updateItem,
    removeItem,
    localToggleItem,
    setFilters,
    setItemsFilters,
    resetFilters,
    resetItemsFilters,
    $reset
  }
})
