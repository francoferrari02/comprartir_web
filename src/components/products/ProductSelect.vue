<template>
  <div>
    <label class="app-input-label" :for="fieldId">{{ label }}</label>
    <v-autocomplete
      :id="fieldId"
      :model-value="modelValue"
      :items="products"
      :loading="loading"
      :placeholder="placeholder"
      :autofocus="autofocus"
      item-title="name"
      item-value="id"
      clearable
      no-filter
      class="app-input"
      :aria-label="label"
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
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
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
  },
  inputId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const products = ref([])
const loading = ref(false)
const searchQuery = ref('')
let searchTimeout = null
const generatedId = `product-select-${Math.random().toString(36).slice(2, 10)}`
const fieldId = computed(() => props.inputId || generatedId)

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

