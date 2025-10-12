<template>
  <v-card class="pa-4">
    <h3 class="text-h6 font-weight-bold mb-3">Filtros & orden</h3>
    
    <!-- Selector de ordenamiento -->
    <div class="mb-3">
      <label class="app-input-label" for="filters-card-sort">Ordenar por:</label>
      <v-select
        id="filters-card-sort"
        :model-value="sortBy"
        @update:model-value="$emit('update:sortBy', $event); $emit('update')"
        :items="sortOptions"
        density="compact"
        hide-details
        class="app-input"
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
      <label class="app-input-label" for="filters-card-recurring">Tipo de lista:</label>
      <v-select
        id="filters-card-recurring"
        :model-value="recurring"
        @update:model-value="$emit('update:recurring', $event); $emit('update')"
        :items="recurringOptions"
        density="compact"
        hide-details
        class="app-input"
      />
    </div>

    <!-- Selector de etiquetas (si hay disponibles) -->
    <div v-if="availableTags && availableTags.length > 0">
      <label class="app-input-label" for="filters-card-tags">Filtrar por etiquetas:</label>
      <v-combobox
        id="filters-card-tags"
        :model-value="selectedTags"
        @update:model-value="$emit('update:selectedTags', $event); $emit('update')"
        :items="availableTags"
        density="compact"
        multiple
        chips
        closable-chips
        hide-details
        placeholder="Seleccionar etiquetas..."
        class="app-input"
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
