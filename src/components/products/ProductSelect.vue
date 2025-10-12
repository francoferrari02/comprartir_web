<template>
  <v-autocomplete
    :model-value="modelValue"
    :items="products"
    :loading="loading"
    :label="label"
    :placeholder="placeholder"
    :autofocus="autofocus"
    item-title="name"
    item-value="id"
    clearable
    no-filter
    @update:model-value="handleSelect"
    @update:search="handleSearch"
  >
    <template #no-data>
      <v-list-item>
        <v-list-item-title>
          {{ searchQuery ? 'No se encontraron productos' : 'Escribí para buscar productos' }}
        </v-list-item-title>
      </v-list-item>
    </template>

    <template #item="{ props: itemProps, item }">
      <v-list-item v-bind="itemProps">
        <template #title>
          <span class="font-weight-medium">{{ item.raw.name }}</span>
        </template>
        <template #subtitle v-if="item.raw.category">
          <span class="text-caption">{{ item.raw.category.name }}</span>
        </template>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getProducts } from '@/services/products.service'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null
  },
  categoryId: {
    type: [String, Number],
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
  autofocus: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const products = ref([])
const loading = ref(false)
const searchQuery = ref('')
let searchTimeout = null

async function fetchProducts(search = '') {
  loading.value = true
  try {
    const params = {
      name: search,
      per_page: 50,
      sort_by: 'name',
      order: 'ASC'
    }

    if (props.categoryId) {
      params.categoryId = props.categoryId
    }

  const response = await getProducts(params)
  products.value = Array.isArray(response?.data) ? response.data : []
  } catch (error) {
    console.error('Error fetching products:', error)
    products.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch(search) {
  searchQuery.value = search || ''

  // Debounce search
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    fetchProducts(search)
  }, 300)
}

function handleSelect(value) {
  // Normalize: if somehow a full object is passed, extract the id
  const productId = typeof value === 'object' ? value?.id : value
  emit('update:modelValue', productId)
}

// Load initial products
watch(() => props.categoryId, () => {
  fetchProducts(searchQuery.value)
}, { immediate: true })
</script>

<style scoped>
/* Ensure proper spacing and styling */
:deep(.v-autocomplete) {
  width: 100%;
}
</style>

