<template>
  <div class="d-flex align-center mb-2 product-item">
    <!-- Icono de producto (sin funcionalidad de toggle para despensas) -->
    <v-btn icon size="small" variant="text" disabled>
      <v-icon color="primary">
        mdi-package-variant
      </v-icon>
    </v-btn>

    <!-- Nombre del producto y detalles -->
    <div class="flex-grow-1 ml-2">
      <span class="product-name">
        {{ productName }}
      </span>
      <span v-if="product.quantity" class="text-caption text-medium-emphasis ml-2">
        {{ product.quantity }} {{ product.unit || 'un' }}
      </span>
    </div>

    <!-- Botón detalles/editar cantidad -->
    <v-btn icon size="small" variant="text" @click="$emit('edit')">
      <v-icon>mdi-information-outline</v-icon>
    </v-btn>

    <!-- Botón eliminar -->
    <v-btn icon size="small" variant="text" color="error" @click="$emit('delete')">
      <v-icon>mdi-delete</v-icon>
    </v-btn>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete', 'edit', 'update-name'])

// Computed para obtener el nombre del producto de diferentes posibles estructuras
const productName = computed(() => {
  // Intentar diferentes estructuras que puede devolver la API
  return (
    props.product.product?.name ||      // Estructura anidada (lo más común)
    props.product.productName ||         // Campo directo productName
    props.product.name ||                // Campo directo name
    `Producto #${props.product.id}`     // Fallback si no hay nombre
  )
})
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
</style>
