<template>
  <!-- Tarjeta compacta para representar una despensa -->
  <v-card class="pa-4 card card--hover" elevation="1" min-width="240" style="flex:1 1 auto;">
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="text-h6 font-weight-bold pantry-title">{{ name }}</div>
      <v-chip size="small" class="chip-rounded chip-counter">{{ totalItems }}</v-chip>
    </div>

    <!-- Mostrar usuarios compartidos si existen -->
    <div v-if="sharedWith && sharedWith.length > 0" class="mb-2">
      <v-chip-group>
        <v-chip
          v-for="user in sharedWith"
          :key="user.id || user.email"
          size="x-small"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-account-outline"
        >
          {{ user.name || user.email }}
        </v-chip>
      </v-chip-group>
    </div>

    <v-progress-linear :model-value="itemsPercentage" color="primary" height="6" rounded />

    <!-- Botonera: tres botones del mismo tamaño en una línea horizontal -->
    <div class="d-flex align-center ga-2 mt-4">
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-open-in-new"
        class="btn-open-pill text-body-2 font-weight-medium"
        @click="openPantry"
      >
        Abrir
      </v-btn>
      
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  id: { type: [String, Number], required: true },
  name: { type: String, required: true },
  totalItems: { type: Number, required: true },
  sharedWith: { type: Array, default: () => [] },
})

const itemsPercentage = computed(() => {
  // Para despensas, mostramos un porcentaje basado en si tiene items (100%) o no (0%)
  return props.totalItems > 0 ? 100 : 0
})

const emit = defineEmits(['delete', 'edit'])

function openPantry() {
  router.push(`/pantries/${props.id}`)
}
</script>

<style scoped>
.pantry-title {
  color: var(--text);
}

.chip-rounded {
  border-radius: 999px !important;
}

.chip-counter {
  background-color: #2A2A44 !important;
  color: #ffffff !important;
  border: none !important;
}

.btn-open-pill {
  flex: 1;
  min-width: 0;
  border-radius: 999px !important;
  text-transform: none;
  height: 40px !important;
  padding: 0 20px !important;
}

.btn-open-pill :deep(.v-icon) {
  margin-right: 8px;
}

.btn-icon {
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  flex: 0 0 auto;
}

.btn-icon-dark {
  color: #2A2A44 !important;
}
</style>
