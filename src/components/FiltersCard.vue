<template>
  <v-card class="pa-4">
    <h3 class="text-h6 font-weight-bold mb-3">Filtros & orden</h3>
    
    <!-- Selector de ordenamiento -->
    <div class="mb-4">
      <v-label class="text-subtitle-2 font-weight-medium mb-2 d-block">
        Ordenar por:
      </v-label>
      <v-select
        :model-value="sortBy"
        @update:model-value="$emit('update:sortBy', $event)"
        :items="sortOptions"
        variant="outlined"
        density="compact"
        hide-details
        class="sort-select"
      />
    </div>

    <!-- Selector de etiquetas -->
    <div>
      <v-label class="text-subtitle-2 font-weight-medium mb-2 d-block">
        Filtrar por etiquetas:
      </v-label>
      <v-combobox
        :model-value="selectedTags"
        @update:model-value="$emit('update:selectedTags', $event)"
        :items="availableTags"
        variant="outlined"
        density="compact"
        multiple
        chips
        closable-chips
        hide-details
        placeholder="Seleccionar etiquetas..."
        class="tags-select"
      >
        <template #chip="{ props, item }">
          <v-chip
            v-bind="props"
            size="small"
            variant="tonal"
            color="primary"
            class="tag-chip"
          >
            {{ item.title }}
          </v-chip>
        </template>
      </v-combobox>
      
      <!-- Etiquetas populares -->
      <div class="mt-2" v-if="popularTags.length > 0">
        <v-label class="text-caption text-medium-emphasis mb-1 d-block">
          Etiquetas populares:
        </v-label>
        <div class="d-flex flex-wrap ga-1">
          <v-chip
            v-for="tag in popularTags"
            :key="tag"
            size="x-small"
            variant="outlined"
            color="grey"
            class="popular-tag"
            @click="toggleTag(tag)"
            :class="{ 'tag-selected': selectedTags.includes(tag) }"
          >
            {{ tag }}
          </v-chip>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  sortBy: {
    type: String,
    default: 'recent'
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

const emit = defineEmits(['update:sortBy', 'update:selectedTags'])

const sortOptions = [
  { title: 'Más recientes', value: 'recent' },
  { title: 'Más completas', value: 'complete' },
  { title: 'Alfabético', value: 'name' },
  { title: 'Más compartidas', value: 'shared' }
]

// Etiquetas más populares (primeras 6)
const popularTags = computed(() => {
  return props.availableTags.slice(0, 6)
})

function toggleTag(tag) {
  const currentTags = [...props.selectedTags]
  const index = currentTags.indexOf(tag)
  
  if (index > -1) {
    currentTags.splice(index, 1)
  } else {
    currentTags.push(tag)
  }
  
  emit('update:selectedTags', currentTags)
}
</script>

<style scoped>
.sort-select,
.tags-select {
  width: 100%;
}

.tag-chip {
  background-color: var(--brand-50) !important;
  color: var(--brand-700) !important;
  border: 1px solid rgba(77,168,81,.20) !important;
}

.popular-tag {
  cursor: pointer;
  transition: all 0.2s ease;
}

.popular-tag:hover {
  background-color: var(--brand-50) !important;
  color: var(--brand-700) !important;
}

.popular-tag.tag-selected {
  background-color: var(--brand) !important;
  color: white !important;
}

/* Estilo para el combobox de etiquetas */
:deep(.v-field__input) {
  min-height: 40px;
}

:deep(.v-chip-group) {
  gap: 4px;
}
</style>
