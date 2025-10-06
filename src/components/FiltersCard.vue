<template>
  <v-card class="pa-4">
    <h3 class="text-h6 font-weight-bold mb-3">Filtros & orden</h3>
    
    <!-- Selector de ordenamiento -->
    <div class="mb-3">
      <v-label class="text-subtitle-2 font-weight-medium mb-2 d-block">
        Ordenar por:
      </v-label>
      <v-select
        :model-value="sortBy"
        @update:model-value="$emit('update:sortBy', $event); $emit('update')"
        :items="sortOptions"
        variant="outlined"
        density="compact"
        hide-details
      />
    </div>

    <!-- Dirección de orden -->
    <div class="mb-3">
      <v-label class="text-subtitle-2 font-weight-medium mb-2 d-block">
        Dirección:
      </v-label>
      <v-btn-toggle
        :model-value="order"
        @update:model-value="$emit('update:order', $event); $emit('update')"
        mandatory
        divided
        density="compact"
        class="w-100 toggle-rounded"
      >
        <v-btn value="ASC" size="small" class="flex-grow-1">
          <v-icon>mdi-arrow-up</v-icon> Ascendente
        </v-btn>
        <v-btn value="DESC" size="small" class="flex-grow-1">
          <v-icon>mdi-arrow-down</v-icon> Descendente
        </v-btn>
      </v-btn-toggle>
    </div>

    <!-- Filtro de recurrencia -->
    <div class="mb-3">
      <v-label class="text-subtitle-2 font-weight-medium mb-2 d-block">
        Tipo de lista:
      </v-label>
      <v-select
        :model-value="recurring"
        @update:model-value="$emit('update:recurring', $event); $emit('update')"
        :items="recurringOptions"
        variant="outlined"
        density="compact"
        hide-details
      />
    </div>

    <!-- Selector de etiquetas (si hay disponibles) -->
    <div v-if="availableTags && availableTags.length > 0">
      <v-label class="text-subtitle-2 font-weight-medium mb-2 d-block">
        Filtrar por etiquetas:
      </v-label>
      <v-combobox
        :model-value="selectedTags"
        @update:model-value="$emit('update:selectedTags', $event); $emit('update')"
        :items="availableTags"
        variant="outlined"
        density="compact"
        multiple
        chips
        closable-chips
        hide-details
        placeholder="Seleccionar etiquetas..."
      >
        <template #chip="{ props, item }">
          <v-chip
            v-bind="props"
            size="small"
            variant="tonal"
            color="primary"
            class="chip-rounded"
          >
            {{ item.title || item }}
          </v-chip>
        </template>
      </v-combobox>
    </div>
  </v-card>
</template>

<script setup>
defineProps({
  sortBy: {
    type: String,
    default: 'updatedAt'
  },
  order: {
    type: String,
    default: 'DESC'
  },
  recurring: {
    type: [String, Boolean, Object],
    default: null
  },
  selectedTags: {
    type: Array,
    default: () => []
  },
  availableTags: {
    type: Array,
    default: () => []
  }
})

defineEmits(['update:sortBy', 'update:order', 'update:recurring', 'update:selectedTags', 'update'])

const sortOptions = [
  { title: 'Nombre', value: 'name' },
  { title: 'Fecha de creación', value: 'createdAt' },
  { title: 'Última actualización', value: 'updatedAt' },
  { title: 'Última compra', value: 'lastPurchasedAt' },
  { title: 'Propietario', value: 'owner' }
]

const recurringOptions = [
  { title: 'Todas', value: null },
  { title: 'Recurrentes', value: true },
  { title: 'No recurrentes', value: false }
]
</script>

<style scoped>
/* Campos de texto con bordes más redondeados */
:deep(.v-field) {
  border-radius: 12px !important;
}

/* Chips redondeados */
.chip-rounded {
  border-radius: 999px !important;
}

/* Button toggle más redondeado */
.toggle-rounded {
  border-radius: 8px !important;
  overflow: hidden;
}

:deep(.toggle-rounded .v-btn) {
  border-radius: 0 !important;
}

:deep(.toggle-rounded .v-btn:first-child) {
  border-radius: 8px 0 0 8px !important;
}

:deep(.toggle-rounded .v-btn:last-child) {
  border-radius: 0 8px 8px 0 !important;
}
</style>
