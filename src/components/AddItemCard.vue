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
      />

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
import { ref } from 'vue'
import ProductSelectOrCreate from '@/components/products/ProductSelectOrCreate.vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  recentProducts: { type: Array, default: () => [] }
})

const emit = defineEmits(['add-item'])

const selectedProductId = ref(null)
const quantity = ref(1)
const unit = ref('un')

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
  quantity.value = 1
  unit.value = 'un'
}

function quickAdd(product) {
  const id = typeof product === 'object' ? product?.id : product
  if (!id) return
  selectedProductId.value = id
  addProduct()
}
</script>

<style scoped>
.gap-2 { gap: 8px; }
.chip-rounded { border-radius: 16px; }
</style>
