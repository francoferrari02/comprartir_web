// src/stores/lists.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useListsStore = defineStore('lists', () => {
  // State
  const lists = ref([])
  const currentList = ref(null)
  const currentItems = ref([])
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

  // Getters
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
  }

  function addItem(item) {
    currentItems.value.push(item)
  }

  function updateItem(itemId, updates) {
    const index = currentItems.value.findIndex(i => i.id === itemId)
    if (index !== -1) {
      currentItems.value[index] = { ...currentItems.value[index], ...updates }
    }
  }

  function removeItem(itemId) {
    currentItems.value = currentItems.value.filter(i => i.id !== itemId)
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
    resetFilters()
    resetItemsFilters()
  }

  return {
    // State
    lists,
    currentList,
    currentItems,
    filters,
    itemsFilters,
    // Getters
    listsCount,
    recurringListsCount,
    currentListItems,
    purchasedItemsCount,
    pendingItemsCount,
    // Actions
    setLists,
    addList,
    updateList,
    removeList,
    setCurrentList,
    setCurrentItems,
    addItem,
    updateItem,
    removeItem,
    setFilters,
    setItemsFilters,
    resetFilters,
    resetItemsFilters,
    $reset
  }
})

