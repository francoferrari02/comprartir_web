<template>
  <div class="d-flex align-center mb-2 product-item" :class="{ 'product-done': product.done }">
    <!-- Círculo/tick -->
    <v-btn icon size="small" variant="text" @click="$emit('toggle')">
      <v-icon :color="product.done ? 'secondary' : 'grey'">
        {{ product.done ? 'mdi-check-circle' : 'mdi-circle-outline' }}
      </v-icon>
    </v-btn>
    <!-- Nombre del producto -->
    <span class="flex-grow-1 ml-2" :class="{ 'text-decoration-line-through text-medium-emphasis': product.done }">
      {{ product.name }}
    </span>
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
const props = defineProps({ product: Object })
</script>

<style scoped>
.product-item { transition: background 0.15s; border-radius: 8px; }
.product-item:hover { background: #f5f5f5; }
.product-done { opacity: 0.6; }
</style>
