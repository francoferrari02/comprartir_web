<template>
  <v-card class="card card--hover pa-4 mb-4">
    <v-card-title class="text-h6 font-weight-bold d-flex align-center justify-space-between">
      Añadir productos
    </v-card-title>
    <v-card-text>
      <!-- Product select/create -->
      <ProductSelectOrCreate
        v-model="selectedProductId"
        label="Producto"
        placeholder="Escribe para buscar o crear…"
        class="mb-3"
        :disabled="loading"
        :category-key="selectedCategoryKey"
        @product-selected="onProductSelected"
        @created="onProductSelected"
        @category-required="onCategoryRequired"
      />

      <div class="mb-3">
        <label class="app-input-label" for="add-item-category">Categoría</label>
        <v-select
          id="add-item-category"
          v-model="selectedCategoryKey"
          :items="categoryOptions"
          item-title="title"
          item-value="value"
          density="comfortable"
          placeholder="Seleccioná una categoría"
          :error="Boolean(categoryError)"
          :error-messages="categoryError ? [categoryError] : []"
          class="app-input"
        >
          <template #selection="{ item }">
            <div class="d-flex align-center" style="gap: 8px;">
              <v-icon size="18" color="#2a2a44">{{ item?.raw?.icon }}</v-icon>
              <span>{{ item?.raw?.title }}</span>
            </div>
          </template>
          <template #item="{ props, item }">
            <v-list-item v-bind="props">
              <template #prepend>
                <v-icon color="#2a2a44">{{ item.raw.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ item.raw.title }}</v-list-item-title>
            </v-list-item>
          </template>
        </v-select>
      </div>

      <!-- Quantity and unit -->
      <div class="d-flex gap-2 mb-3">
        <div style="max-width: 120px; width: 100%;">
          <label class="app-input-label" for="add-item-quantity">Cantidad</label>
          <v-text-field
            id="add-item-quantity"
            v-model.number="quantity"
            type="number"
            density="comfortable"
            hide-details
            min="0.01"
            step="0.01"
            class="app-input"
          />
        </div>
        <div class="flex-grow-1">
          <label class="app-input-label" for="add-item-unit">Unidad</label>
          <v-select
            id="add-item-unit"
            v-model="unit"
            :items="units"
            density="comfortable"
            hide-details
            class="app-input"
          />
        </div>
      </div>

      <!-- Add button -->
      <v-btn
        block
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        class="btn-rounded"
        :disabled="!selectedProductId"
        :loading="loading"
        @click="addProduct"
      >
        Añadir a la lista
      </v-btn>

      <!-- Quick add suggestions -->
      <div v-if="recentProducts && recentProducts.length" class="mt-4">
        <div class="text-caption text-medium-emphasis mb-2">Agregados recientemente</div>
        <v-chip
          v-for="product in recentProducts"
          :key="product.id"
          class="ma-1 chip-rounded"
          size="small"
          variant="outlined"
          @click="quickAdd(product)"
        >
          <v-icon start size="small">mdi-plus-circle-outline</v-icon>
          {{ product.name }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import ProductSelectOrCreate from '@/components/products/ProductSelectOrCreate.vue'
import { CATEGORY_DEFINITIONS, CATEGORY_BY_KEY, CATEGORY_KEY_BY_NAME } from '@/constants/categories'

const props = defineProps({
  loading: { type: Boolean, default: false },
  recentProducts: { type: Array, default: () => [] }
})

const emit = defineEmits(['add-item'])

const selectedProductId = ref(null)
const selectedCategoryKey = ref(null)
const categoryError = ref('')
const quantity = ref(1)
const unit = ref('un')

const categoryOptions = CATEGORY_DEFINITIONS.map(category => ({
  title: category.name,
  value: category.key,
  icon: category.icon,
}))

const units = [
  'un',
  'kg',
  'g',
  'l',
  'ml',
  'paquete',
  'caja',
  'bolsa',
  'docena',
  'lata',
  'botella'
]

async function addProduct() {
  if (!selectedProductId.value) return

  const itemToEmit = {
    productId: selectedProductId.value,
    quantity: quantity.value || 1,
    unit: unit.value || 'un',
    metadata: {}
  }

  emit('add-item', itemToEmit)

  // Reset form
  selectedProductId.value = null
  selectedCategoryKey.value = null
  categoryError.value = ''
  quantity.value = 1
  unit.value = 'un'
}

function quickAdd(product) {
  const id = typeof product === 'object' ? product?.id : product
  if (!id) return
  selectedProductId.value = id
  addProduct()
}

function onProductSelected(product) {
  if (!product) {
    return
  }
  const key = deriveCategoryKey(product)
  if (key) {
    selectedCategoryKey.value = key
  }
}

function onCategoryRequired() {
  categoryError.value = 'Seleccioná una categoría para crear este producto'
}

function deriveCategoryKey(product) {
  const metadataKey = product?.category?.metadata?.key
  if (metadataKey && CATEGORY_BY_KEY[metadataKey]) {
    return metadataKey
  }

  const name = product?.category?.name?.toLowerCase()
  if (name && CATEGORY_KEY_BY_NAME[name]) {
    return CATEGORY_KEY_BY_NAME[name]
  }

  return null
}

watch(selectedCategoryKey, (value) => {
  if (value) {
    categoryError.value = ''
  }
})
</script>

<style scoped>
.gap-2 { gap: 8px; }
.chip-rounded { border-radius: 16px; }
</style>
