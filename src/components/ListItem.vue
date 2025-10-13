<template>
  <!-- Tarjeta compacta para representar una lista reciente -->
  <v-card
    :class="['pa-4 card card--hover', { 'card-clickable': cardClickable }]"
    elevation="1"
    min-width="240"
    style="flex:1 1 auto;"
    @click="handleCardClick"
  >
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="d-flex align-center ga-2 list-title-container">
        <div class="text-h6 font-weight-bold list-title">{{ name }}</div>
        <v-icon
          v-if="recurring"
          size="small"
          color="primary"
          class="recurring-icon"
        >
          mdi-sync
        </v-icon>
      </div>
      <v-chip size="small" class="chip-rounded chip-counter">{{ bought }}/{{ total }}</v-chip>
    </div>

    <!-- Mostrar usuarios compartidos si existen, o espacio reservado si no -->
    <div class="shared-section mb-2">
      <v-chip-group v-if="showShared && sharedWith && sharedWith.length > 0">
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

    <v-progress-linear :model-value="progress" color="primary" height="6" rounded />

    <!-- Botonera: tres botones del mismo tamaño en una línea horizontal -->
    <div v-if="showActions" class="d-flex align-center ga-2 mt-4">
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-open-in-new"
        class="btn-open-pill text-body-2 font-weight-medium"
        data-testid="btn-open-list"
        @click.stop="openList"
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
  bought: { type: Number, required: true },
  total: { type: Number, required: true },
  sharedWith: { type: Array, default: () => [] },
  recurring: { type: Boolean, default: false },
  showActions: { type: Boolean, default: true },
  showShared: { type: Boolean, default: true },
  cardClickable: { type: Boolean, default: false },
})

const progress = computed(() =>
    props.total ? Math.round((props.bought / props.total) * 100) : 0
)

const emit = defineEmits(['delete', 'edit'])

function handleCardClick() {
  if (!props.cardClickable) {
    return
  }
  openList()
}

function openList() {
  // Navegación directa sin depender de eventos
  if (!props.id && props.id !== 0) {
    console.warn('⚠️ ListItem.openList: ID inválido', props.id)
    return
  }

  console.debug('🚀 ListItem.openList -> Navegando a list-detail con id:', props.id)
  router.push({
    name: 'list-detail',
    params: { id: String(props.id) }
  })
}
</script>

<style scoped>
.list-title {
  color: var(--text);
}

.list-title-container {
  flex: 1;
  min-width: 0;
}

.recurring-icon {
  flex-shrink: 0;
  opacity: 0.8;
}

/* Sección de usuarios compartidos con altura fija */
.shared-section {
  min-height: 32px; /* Altura mínima para mantener consistencia */
  display: flex;
  align-items: center;
}

/* Chips redondeados */
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

.card-clickable {
  cursor: pointer;
}
</style>
