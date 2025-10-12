<template>
  <!-- Tarjeta compacta para representar una lista reciente -->
  <v-card class="pa-4 card card--hover" elevation="1" min-width="240" style="flex:1 1 auto;">
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="text-subtitle-1 font-weight-medium">{{ name }}</div>
      <v-chip size="small" color="secondary" variant="tonal" class="chip-rounded">{{ bought }}/{{ total }}</v-chip>
    </div>

    <div class="text-caption mb-2">{{ bought }}/{{ total }} comprados</div>

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

    <v-progress-linear :model-value="progress" color="primary" height="6" rounded />

    <!-- Botonera: tres botones del mismo tamaño en una línea horizontal -->
    <div class="d-flex flex-nowrap ga-2 mt-4">
      <v-btn
        size="small"
        variant="flat"
        prepend-icon="mdi-open-in-new"
        class="btn-uniform btn-open"
        data-testid="btn-open-list"
        @click.stop="openList"
      >
        Abrir
      </v-btn>
      <v-btn
        size="small"
        variant="outlined"
        prepend-icon="mdi-pencil"
        class="btn-uniform btn-edit"
        @click.stop="emit('edit')"
      >
        Editar
      </v-btn>
      <v-btn
        size="small"
        variant="outlined"
        prepend-icon="mdi-delete"
        class="btn-uniform btn-delete"
        @click.stop="emit('delete')"
      >
        Eliminar
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
})

const progress = computed(() =>
    props.total ? Math.round((props.bought / props.total) * 100) : 0
)

const emit = defineEmits(['delete', 'edit'])

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
/* Botones uniformes del mismo tamaño con forma de píldora */
.btn-uniform {
  flex: 1;
  min-width: 0;
  border-radius: 999px !important;
  text-transform: none;
  font-weight: 500;
  font-size: 0.75rem !important;
  padding: 0 12px !important;
  height: 32px !important;
}

/* Botón Abrir - Verde sólido */
.btn-open {
  background-color: var(--brand) !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
}

.btn-open:hover {
  background-color: var(--brand-700) !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important;
}

/* Botón Editar - Gris con borde sutil */
.btn-edit {
  background-color: #f5f5f5 !important;
  color: #374151 !important;
  border: 1px solid #d1d5db !important;
}

.btn-edit:hover {
  background-color: #e5e5e5 !important;
  border-color: #9ca3af !important;
}

/* Botón Eliminar - Rojo con fondo claro y borde sutil */
.btn-delete {
  background-color: #fef2f2 !important;
  color: #dc2626 !important;
  border: 1px solid #fecaca !important;
}

.btn-delete:hover {
  background-color: #fee2e2 !important;
  border-color: #f87171 !important;
}

/* Override de iconos para que se vean bien */
.btn-uniform :deep(.v-icon) {
  font-size: 16px !important;
  margin-right: 4px;
}

/* Chips redondeados */
.chip-rounded {
  border-radius: 999px !important;
}
</style>
