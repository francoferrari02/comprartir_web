<template>
  <v-dialog :model-value="modelValue" max-width="600" @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="dialog-card">
      <v-card-title class="text-h6 pa-4 d-flex align-center justify-space-between">
        <span>Detalles del producto</span>
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          @click="close"
        />
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <!-- Nombre del producto -->
        <div class="mb-3">
          <label class="app-input-label" for="product-detail-name">Producto</label>
          <v-text-field
            id="product-detail-name"
            v-model="form.productName"
            density="comfortable"
            prepend-inner-icon="mdi-package-variant"
            placeholder="Nombre del producto"
            class="app-input"
            :rules="[v => !!v || 'El nombre es requerido']"
          />
        </div>

        <!-- Categoría del producto -->
        <div class="mb-3">
          <label class="app-input-label" for="product-detail-category">Categoría</label>
          <v-select
            id="product-detail-category"
            v-model="form.categoryId"
            :items="availableCategories"
            item-title="name"
            item-value="id"
            density="comfortable"
            prepend-inner-icon="mdi-tag-outline"
            placeholder="Selecciona una categoría"
            class="app-input"
            clearable
          >
            <template #item="{ props: itemProps, item }">
              <v-list-item v-bind="itemProps">
                <template #prepend>
                  <v-icon :icon="item.raw.metadata?.icon || 'mdi-tag-outline'" size="small" class="mr-2" />
                </template>
              </v-list-item>
            </template>
            <template #selection="{ item }">
              <div class="d-flex align-center">
                <v-icon :icon="item.raw.metadata?.icon || 'mdi-tag-outline'" size="small" class="mr-2" />
                <span>{{ item.title }}</span>
              </div>
            </template>
          </v-select>
          <p class="text-caption text-medium-emphasis mt-1">
            {{ form.categoryId ? 'Categoría asignada' : 'Sin categoría asignada' }}
          </p>
        </div>

        <!-- Cantidad -->
        <div class="mb-3">
          <label class="app-input-label" for="product-detail-quantity">Cantidad</label>
          <v-text-field
            id="product-detail-quantity"
            v-model.number="form.quantity"
            type="number"
            density="comfortable"
            prepend-inner-icon="mdi-counter"
            min="0.01"
            step="0.01"
            class="app-input"
          />
        </div>

        <!-- Unidad -->
        <div class="mb-3">
          <label class="app-input-label" for="product-detail-unit">Unidad</label>
          <v-select
            id="product-detail-unit"
            v-model="form.unit"
            :items="unitOptions"
            density="comfortable"
            prepend-inner-icon="mdi-scale-balance"
            class="app-input"
          />
        </div>

        <!-- Descripción/Notas (metadata) -->
        <div class="mb-3">
          <label class="app-input-label" for="product-detail-description">Notas o descripción (opcional)</label>
          <v-textarea
            id="product-detail-description"
            v-model="form.description"
            density="comfortable"
            rows="3"
            prepend-inner-icon="mdi-text"
            placeholder="Ej: Marca específica, variedad, recordatorios..."
            class="app-input"
          />
        </div>

      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4 d-flex justify-space-between">
        <!-- Botón eliminar a la izquierda -->
        <v-btn
          color="error"
          variant="outlined"
          prepend-icon="mdi-delete"
          class="btn-rounded"
          @click="handleDelete"
        >
          Eliminar
        </v-btn>

        <!-- Botones de acción a la derecha -->
        <div class="d-flex gap-2">
          <v-btn
            variant="text"
            class="btn-rounded"
            @click="close"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="btn-rounded"
            :loading="loading"
            @click="handleSave"
          >
            Guardar cambios
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCategoriesStore } from '@/stores/categories'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'save', 'delete'])

const categoriesStore = useCategoriesStore()

const unitOptions = [
  { title: 'Unidad', value: 'un' },
  { title: 'Kilogramos', value: 'kg' },
  { title: 'Gramos', value: 'g' },
  { title: 'Litros', value: 'l' },
  { title: 'Mililitros', value: 'ml' },
  { title: 'Paquete', value: 'paq' },
  { title: 'Caja', value: 'caja' },
  { title: 'Docena', value: 'docena' }
]

// Form state
const form = ref({
  productName: '',
  categoryId: null,
  quantity: 1,
  unit: 'un',
  description: ''
})

// Computed available categories from store
const availableCategories = computed(() => {
  return categoriesStore.items || []
})

// Watch for product changes to update form
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    // Get product entity (could be nested in product.product)
    const productEntity = newProduct.product || newProduct
    
    // Extract category
    const category = productEntity.category || newProduct.category
    
    form.value = {
      productName: productEntity.name || newProduct.productName || newProduct.name || '',
      categoryId: category?.id || null,
      quantity: newProduct.quantity || 1,
      unit: newProduct.unit || 'un',
      description: newProduct.metadata?.description || newProduct.metadata?.notes || ''
    }
    
    console.log('📝 ProductDetailCard loaded product:', newProduct)
    console.log('📝 Form categoryId:', form.value.categoryId)
    console.log('📝 Category object:', category)
  }
}, { immediate: true, deep: true })

function close() {
  emit('update:modelValue', false)
}

function handleSave() {
  if (!form.value.productName.trim()) {
    alert('El nombre del producto es requerido')
    return
  }

  const updates = {
    productName: form.value.productName.trim(),
    categoryId: form.value.categoryId, // Send ID or null
    quantity: Number(form.value.quantity),
    unit: form.value.unit,
    description: form.value.description
  }

  console.log('💾 Saving product updates:', updates)
  emit('save', updates)
}

function handleDelete() {
  if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
    emit('delete')
  }
}
</script>

<style scoped>
.dialog-card {
  border-radius: 12px;
}

.app-input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 8px;
}

.gap-2 {
  gap: 8px;
}
</style>
