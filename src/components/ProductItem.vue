<template>
  <div class="d-flex align-center mb-2 product-item" :class="{ 'product-done': product.purchased }">
    <!-- Círculo/tick -->
    <v-btn icon size="small" variant="text" @click="$emit('toggle')">
      <v-icon :color="product.purchased ? 'success' : 'grey'">
        {{ product.purchased ? 'mdi-check-circle' : 'mdi-circle-outline' }}
      </v-icon>
    </v-btn>

    <!-- Nombre del producto y detalles -->
    <div class="flex-grow-1 ml-2">
      <span
        class="product-name"
        :class="{ 'text-decoration-line-through text-medium-emphasis': product.purchased }"
      >
        {{ productDisplayName }}
      </span>
      <span v-if="product.quantity" class="text-caption text-medium-emphasis ml-2">
        {{ product.quantity }} {{ product.unit || 'un' }}
      </span>
    </div>

    <!-- Botón detalles -->
    <v-btn icon size="small" variant="text" @click="$emit('details')">
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

defineEmits(['toggle', 'details', 'delete', 'update'])

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

.product-done {
  opacity: 0.65;
}

.product-name {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
}
</style>
