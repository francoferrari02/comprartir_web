<template>
  <v-card class="pa-4 mb-4" elevation="2">
    <v-card-title class="text-h6 font-weight-bold">Añadir productos</v-card-title>
    <v-card-text>
      <!-- Buscador -->
      <v-text-field
        v-model="model"
        prepend-inner-icon="mdi-magnify"
        label="Buscar producto"
        variant="outlined"
        density="comfortable"
        hide-details
        clearable
        class="mb-2"
      />
      <!-- Sugerencias -->
      <div v-if="model && suggestions.length">
        <div class="text-caption mb-1">Sugerencias</div>
        <v-list density="compact">
          <v-list-item v-for="s in suggestions" :key="s" class="d-flex align-center">
            <span class="flex-grow-1">{{ s }}</span>
            <v-btn color="secondary" size="small" variant="flat" @click="$emit('add-item', s)">
              <v-icon left>mdi-plus</v-icon> Añadir
            </v-btn>
          </v-list-item>
        </v-list>
      </div>
      <!-- Recomendados -->
      <div v-else-if="recommended.length">
        <div class="text-caption mb-1">Recomendados</div>
        <v-list density="compact">
          <v-list-item v-for="r in recommended" :key="r" class="d-flex align-center">
            <span class="flex-grow-1">{{ r }}</span>
            <v-btn color="secondary" size="small" variant="flat" @click="$emit('add-item', r)">
              <v-icon left>mdi-plus</v-icon> Añadir
            </v-btn>
          </v-list-item>
        </v-list>
      </div>
      <div v-else class="text-medium-emphasis text-caption">No hay sugerencias.</div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: String,
  suggestions: Array,
  recommended: Array
})
const emit = defineEmits(['update:modelValue', 'add-item'])
const model = computed({
  get: () => props.modelValue ?? '',
  set: v => emit('update:modelValue', v)
})
</script>
