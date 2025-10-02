<template>
  <!-- Tarjeta compacta para representar una lista reciente -->
  <v-card class="pa-4" elevation="1" min-width="240" style="flex:1 1 auto;">
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="text-subtitle-1 font-weight-medium">{{ name }}</div>
      <v-chip size="small" color="secondary" variant="tonal">{{ bought }}/{{ total }}</v-chip>
    </div>

    <div class="text-caption mb-2">{{ bought }}/{{ total }} comprados</div>

    <v-progress-linear :model-value="progress" color="primary" height="6" rounded />

    <!-- Botonera: wrap correcto + gap -->
    <div class="d-flex flex-wrap ga-2 mt-4">
      <v-btn size="small" variant="flat" prepend-icon="mdi-open-in-new">Abrir</v-btn>
      <v-btn size="small" variant="outlined" prepend-icon="mdi-pencil">Editar</v-btn>
      <v-btn
          size="small"
          variant="outlined"
          color="error"
          class="btn-rounded"
          prepend-icon="mdi-delete"
          @click="emit('delete')"
      >
        Eliminar
      </v-btn>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  bought: { type: Number, required: true },
  total: { type: Number, required: true },
})

const progress = computed(() =>
    props.total ? Math.round((props.bought / props.total) * 100) : 0
)

const emit = defineEmits(['delete'])
</script>

<style scoped>
/* sin cambios visuales extra */
</style>
