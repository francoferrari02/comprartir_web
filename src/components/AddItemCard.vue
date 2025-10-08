<template>
  <v-card class="card card--hover pa-4 mb-4">
    <v-card-title class="text-h6 font-weight-bold d-flex align-center justify-space-between">
      Añadir productos
      <v-btn
        icon="mdi-package-variant-plus"
        size="small"
        variant="text"
        color="primary"
        @click="openCreateProduct"
      />
    </v-card-title>
    <v-card-text>
      <!-- Product selector with autocomplete -->
      <ProductSelect
        v-model="selectedProduct"
        label="Buscar producto"
        placeholder="Escribe para buscar..."
        :category-id="categoryFilter"
        :show-create-link="true"
        class="mb-3"
        @create-product="openCreateProduct"
      />

      <!-- Category filter (optional) -->
      <v-select
        v-model="categoryFilter"
        :items="categoryOptions"
        item-title="name"
        item-value="id"
        label="Filtrar por categoría"
        variant="outlined"
        density="comfortable"
        clearable
        hide-details
        prepend-inner-icon="mdi-filter"
        class="mb-3"
      />

      <!-- Quantity and unit -->
      <div class="d-flex gap-2 mb-3">
        <v-text-field
          v-model.number="quantity"
          type="number"
          label="Cantidad"
          variant="outlined"
          density="comfortable"
          hide-details
          min="0.01"
          step="0.01"
          style="max-width: 120px"
        />
        <v-select
          v-model="unit"
          :items="units"
          label="Unidad"
          variant="outlined"
          density="comfortable"
          hide-details
        />
      </div>

      <!-- Add button -->
      <v-btn
        block
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        class="btn-rounded"
        :disabled="!selectedProduct"
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

    <!-- Create Product Dialog -->
    <v-dialog v-model="createProductDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h6 pa-4">Crear Nuevo Producto</v-card-title>
        <v-card-text class="pa-4">
          <v-text-field
            v-model="newProduct.name"
            label="Nombre del producto *"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            class="mb-3"
            autofocus
          />
          <v-select
            v-model="newProduct.category_id"
            :items="categories"
            item-title="name"
            item-value="id"
            label="Categoría *"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            prepend-inner-icon="mdi-tag"
          />
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="createProductDialog = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="creatingProduct"
            @click="createProduct"
          >
            Crear y Usar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ProductSelect from '@/components/products/ProductSelect.vue'
import { useCategoriesStore } from '@/stores/categories'
import { useProductsStore } from '@/stores/products'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  recentProducts: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['add-item'])

const categoriesStore = useCategoriesStore()
const productsStore = useProductsStore()

const selectedProduct = ref(null)
const categoryFilter = ref(null)
const quantity = ref(1)
const unit = ref('unidad')

const createProductDialog = ref(false)
const creatingProduct = ref(false)
const newProduct = ref({
  name: '',
  category_id: null
})

const units = [
  'unidad',
  'kg',
  'gramos',
  'litros',
  'ml',
  'paquete',
  'caja',
  'bolsa',
  'docena',
  'lata',
  'botella'
]

const categories = computed(() => categoriesStore.items || [])

const categoryOptions = computed(() => {
  return [
    { name: 'Todas las categorías', id: null },
    ...categories.value
  ]
})

const rules = {
  required: (v) => !!v || 'Este campo es requerido'
}

function addProduct() {
  if (!selectedProduct.value) return

  emit('add-item', {
    product_id: selectedProduct.value.id || selectedProduct.value,
    productName: selectedProduct.value.name,
    quantity: quantity.value,
    unit: unit.value,
    metadata: {}
  })

  // Reset form
  selectedProduct.value = null
  quantity.value = 1
  unit.value = 'unidad'
  categoryFilter.value = null
}

function quickAdd(product) {
  selectedProduct.value = product
  addProduct()
}

function openCreateProduct() {
  newProduct.value = {
    name: '',
    category_id: categoryFilter.value || null
  }
  createProductDialog.value = true
}

async function createProduct() {
  if (!newProduct.value.name || !newProduct.value.category_id) return

  creatingProduct.value = true
  try {
    const created = await productsStore.add({
      name: newProduct.value.name,
      category_id: newProduct.value.category_id,
      metadata: {}
    })

    // Use the newly created product
    selectedProduct.value = created
    createProductDialog.value = false

    // Optionally add it immediately
    addProduct()
  } catch (error) {
    console.error('Error creating product:', error)
  } finally {
    creatingProduct.value = false
  }
}

onMounted(async () => {
  if (categories.value.length === 0) {
    await categoriesStore.fetch()
  }
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.chip-rounded {
  border-radius: 16px;
}

.btn-rounded {
  border-radius: 999px;
}
</style>
