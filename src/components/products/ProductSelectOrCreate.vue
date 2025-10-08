<template>
  <v-autocomplete
    :model-value="internalId"
    :items="options"
    :loading="isSearching || isCreating"
    :label="label"
    :placeholder="placeholder"
    :autofocus="autofocus"
    :disabled="disabled || isCreating"
    item-title="name"
    item-value="id"
    clearable
    no-filter
    v-model:search="search"
    @update:model-value="onSelect"
    @update:search="onSearch"
    @keydown.enter.prevent="onEnter"
  >
    <template #no-data>
      <v-list-item>
        <v-list-item-title>
          {{ search ? 'No se encontraron productos' : 'Escribí para buscar productos' }}
        </v-list-item-title>
      </v-list-item>
    </template>

    <template #append-item>
      <v-divider v-if="canShowCreate" />
      <v-list-item
        v-if="canShowCreate"
        :disabled="isCreating"
        @click="createFromQuery"
        class="create-item"
      >
        <template #prepend>
          <v-icon color="primary">mdi-plus</v-icon>
        </template>
        <v-list-item-title>
          Crear "{{ search }}"
        </v-list-item-title>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { searchProducts, ensureProduct } from '@/services/products.service'

const props = defineProps({
  modelValue: { type: [String, Number, Object, null], default: null },
  label: { type: String, default: 'Producto' },
  placeholder: { type: String, default: 'Escribe para buscar o crear…' },
  autofocus: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'created'])

const options = ref([])
const search = ref('')
const isSearching = ref(false)
const isCreating = ref(false)
const internalId = ref(null)
let debounceT = null

const canShowCreate = computed(() => {
  const q = (search.value || '').trim()
  return q.length > 0 && options.value.length === 0 && !isSearching.value
})

function normalizeToId(val) {
  if (!val) return null
  if (typeof val === 'object') return val.id ?? null
  return val
}

function onSelect(val) {
  const id = normalizeToId(val)
  internalId.value = id
  emit('update:modelValue', id)
}

function onSearch(val) {
  if (debounceT) clearTimeout(debounceT)
  debounceT = setTimeout(() => {
    search.value = val || ''
    fetchOptions()
  }, 250)
}

async function fetchOptions() {
  const q = (search.value || '').trim()
  if (q.length < 1) {
    options.value = []
    return
  }
  isSearching.value = true
  try {
    const data = await searchProducts({ name: q, page: 1, per_page: 10 })
    // Try common shapes
    const list = Array.isArray(data) ? data : (data.data ?? data.items ?? data.results ?? data.products ?? [])
    options.value = list || []
  } catch (e) {
    console.error('searchProducts error', e)
    options.value = []
  } finally {
    isSearching.value = false
  }
}

async function createFromQuery() {
  const name = (search.value || '').trim()
  if (!name) return
  isCreating.value = true
  try {
    // Use ensureProduct to avoid duplicates
    const product = await ensureProduct(name)
    // Update list optimistically so it appears selectable
    if (product && product.id) {
      options.value = [product, ...options.value]
      internalId.value = product.id
      emit('update:modelValue', product.id)
      emit('created', product)
    }
  } catch (e) {
    console.error('ensureProduct error', e)
  } finally {
    isCreating.value = false
  }
}

function onEnter() {
  // If there are no options and we have a query, create.
  if (canShowCreate.value) {
    createFromQuery()
  }
}

// Reset internal state when modelValue becomes null (parent reset)
watch(() => props.modelValue, (val) => {
  const newId = normalizeToId(val)
  internalId.value = newId

  // Si el parent resetea a null, limpiar todo el estado interno
  if (val === null) {
    search.value = ''
    options.value = []
    internalId.value = null
  }
}, { immediate: true })

onMounted(() => {
  // If parent incorrectly passes an object, normalize to its id immediately
  internalId.value = normalizeToId(props.modelValue)
})
</script>

<style scoped>
.create-item { cursor: pointer; }
</style>
