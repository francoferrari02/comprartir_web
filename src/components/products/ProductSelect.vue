<template>
  <v-autocomplete
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :items="products"
    :loading="loading"
    :search="search"
    @update:search="onSearchUpdate"
    item-title="name"
    item-value="id"
    :label="label"
    :placeholder="placeholder"
    variant="outlined"
    density="comfortable"
    :clearable="clearable"
    :disabled="disabled"
    :rules="rules"
    hide-details="auto"
    return-object
  >
    <template #prepend-inner>
      <v-icon>mdi-package-variant</v-icon>
    </template>

    <template #item="{ props, item }">
      <v-list-item v-bind="props">
        <template #prepend>
          <v-avatar color="primary" size="32">
            <v-icon size="18">mdi-package-variant</v-icon>
          </v-avatar>
        </template>
        <template #subtitle v-if="item.raw.category">
          {{ item.raw.category.name || 'Sin categoría' }}
        </template>
      </v-list-item>
    </template>

    <template #append-item v-if="showCreateLink">
      <v-divider class="mb-2" />
      <v-list-item @click="$emit('create-product')" link>
        <template #prepend>
          <v-icon color="primary">mdi-plus-circle</v-icon>
        </template>
        <v-list-item-title class="text-primary">
          Crear nuevo producto
        </v-list-item-title>
      </v-list-item>
    </template>

    <template #no-data>
      <v-list-item>
        <v-list-item-title>
          {{ search ? 'No se encontraron productos' : 'Escribe para buscar productos' }}
        </v-list-item-title>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getProducts } from '@/services/products.service'

const props = defineProps({
  modelValue: {
    type: [Object, Number, String],
    default: null
  },
  categoryId: {
    type: [Number, String],
    default: null
  },
  label: {
    type: String,
    default: 'Producto'
  },
  placeholder: {
    type: String,
    default: 'Buscar producto...'
  },
  clearable: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  rules: {
    type: Array,
    default: () => []
  },
  showCreateLink: {
    type: Boolean,
    default: true
  }
})

defineEmits(['update:modelValue', 'create-product'])

const products = ref([])
const loading = ref(false)
const search = ref('')
let debounceTimer = null

const fetchProducts = async (searchQuery = '') => {
  loading.value = true
  try {
    const params = {
      name: searchQuery,
      page: 1,
      per_page: 20,
      sort_by: 'name',
      order: 'ASC'
    }

    if (props.categoryId) {
      params.category_id = props.categoryId
    }

    const data = await getProducts(params)

    // Handle different response formats
    if (Array.isArray(data)) {
      products.value = data
    } else {
      products.value = data.items || data.data || data.results || data.products || []
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    products.value = []
  } finally {
    loading.value = false
  }
}

const onSearchUpdate = (value) => {
  search.value = value

  // Debounce search
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    fetchProducts(value)
  }, 250)
}

// Watch categoryId changes
watch(() => props.categoryId, () => {
  fetchProducts(search.value)
})

// Initial load
fetchProducts()
</script>

