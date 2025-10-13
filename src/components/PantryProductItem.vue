<template>
  <div class="d-flex align-center mb-2 product-item">
    <!-- Icono de producto (sin funcionalidad de toggle para despensas) -->
    <v-btn icon size="small" variant="text" disabled>
      <v-icon color="primary">
        mdi-package-variant
      </v-icon>
    </v-btn>

    <!-- Nombre del producto -->
    <div class="flex-grow-1 ml-2">
      <span class="product-name">
        {{ productDisplayName }}
      </span>
    </div>

    <!-- Controles de cantidad -->
    <div class="quantity-controls d-flex align-center">
      <!-- Botón decrementar -->
      <v-btn
        icon
        size="small"
        variant="text"
        color="primary"
        :disabled="updating || product.quantity <= 0"
        @click="decrementQuantity"
      >
        <v-icon>mdi-minus</v-icon>
      </v-btn>

      <!-- Cantidad y unidad -->
      <div class="quantity-display mx-2">
        <span class="text-body-2 font-weight-bold">
          {{ product.quantity || 0 }}
        </span>
        <span class="text-caption text-medium-emphasis ml-1">
          {{ product.unit || 'un' }}
        </span>
      </div>

      <!-- Botón incrementar -->
      <v-btn
        icon
        size="small"
        variant="text"
        color="primary"
        :disabled="updating"
        @click="incrementQuantity"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </div>

    <!-- Botón detalles -->
    <v-btn icon size="small" variant="text" class="ml-2" @click="$emit('edit')">
      <v-icon>mdi-information-outline</v-icon>
    </v-btn>

    <!-- Botón eliminar -->
    <v-btn icon size="small" variant="text" color="error" @click="$emit('delete')">
      <v-icon>mdi-delete</v-icon>
    </v-btn>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete', 'edit', 'update-name', 'update-quantity'])

const updating = ref(false)

// Computed para obtener el nombre del producto desde diferentes estructuras posibles
const productDisplayName = computed(() => {
  // Probar diferentes estructuras que puede tener la respuesta del backend
  return (
    props.product.product?.name ||      // Estructura anidada (lo más común)
    props.product.productName ||         // Campo directo productName
    props.product.name ||                // Campo directo name
    `Producto #${props.product.id}`     // Fallback si no hay nombre
  )
})

async function incrementQuantity() {
  if (updating.value) return
  
  updating.value = true
  const newQuantity = (props.product.quantity || 0) + 1
  
  emit('update-quantity', {
    itemId: props.product.id,
    quantity: newQuantity
  })
  
  // Reset updating después de un pequeño delay
  setTimeout(() => {
    updating.value = false
  }, 500)
}

async function decrementQuantity() {
  if (updating.value || props.product.quantity <= 0) return
  
  updating.value = true
  const newQuantity = Math.max(0, (props.product.quantity || 0) - 1)
  
  emit('update-quantity', {
    itemId: props.product.id,
    quantity: newQuantity
  })
  
  // Reset updating después de un pequeño delay
  setTimeout(() => {
    updating.value = false
  }, 500)
}
</script>

<style scoped>
.product-item {
  transition: background 0.15s;
  border-radius: 8px;
  padding: 8px;
}

.product-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.product-name {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
}

.quantity-controls {
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 4px 8px;
}

.quantity-display {
  min-width: 60px;
  text-align: center;
}
</style>
