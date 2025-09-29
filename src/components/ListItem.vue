<template>
  <!-- Tarjeta compacta para representar una lista reciente -->
  <v-card class="pa-4" elevation="1" min-width="200" style="flex: 1 1 auto;">
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="text-subtitle-1 font-weight-medium">{{ name }}</div>
      <v-chip size="small" color="secondary" variant="tonal">{{ bought }}/{{ total }}</v-chip>
    </div>

    <div class="text-caption mb-2">{{ bought }}/{{ total }} comprados</div>
    <v-progress-linear :model-value="progress" color="secondary" height="6" rounded></v-progress-linear>

    <div class="d-flex mt-3 ga-2">
      <v-btn size="small" variant="flat" prepend-icon="mdi-open-in-new">Abrir</v-btn>
      <v-btn size="small" variant="outlined" prepend-icon="mdi-pencil">Editar</v-btn>
    </div>
  </v-card>
</template>

<script setup>
// Tarjeta reutilizable para elementos de la lista del carrusel
// Props para nombre, items comprados/total y progreso
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  bought: { type: Number, required: true },
  total: { type: Number, required: true }
})

// Progreso calculado en porcentaje
const progress = computed(() => {
  if (!props.total) return 0
  return Math.round((props.bought / props.total) * 100)
})
</script>

<style scoped>
/* Asegurar consistencia de tamaños dentro del carrusel */
</style>
