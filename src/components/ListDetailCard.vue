<template>
  <v-card class="pa-6 mb-4" elevation="2">
    <!-- Nombre editable -->
    <div class="d-flex align-center mb-2">
      <div class="text-h5 font-weight-bold flex-grow-1">
        <span v-if="!editingName">{{ list.name }}</span>
        <v-text-field v-else v-model="editName" density="compact" hide-details single-line autofocus @keyup.enter="saveName" @blur="saveName" />
        <v-btn icon size="small" color="primary" variant="text" @click="editingName = !editingName">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </div>
    </div>
    <!-- Barra de progreso -->
    <div class="d-flex align-center mb-4">
      <v-progress-linear :model-value="progress" color="secondary" height="10" rounded class="flex-grow-1 mr-3" />
      <span class="text-body-2 font-weight-medium">{{ list.done }}/{{ list.total }}</span>
    </div>
    <!-- Lista de productos -->
    <div>
      <ProductItem
        v-for="p in products"
        :key="p.id"
        :product="p"
        @toggle="() => $emit('toggle-product', p.id)"
        @delete="() => $emit('delete-product', p.id)"
        @details="() => $emit('show-details', p.id)"
      />
    </div>
    <!-- Mostrar/ocultar completados -->
    <v-btn variant="text" size="small" class="mt-2 mb-4" @click="$emit('toggle-completed')">
      <v-icon left>{{ showCompleted ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
      {{ showCompleted ? 'Ocultar completados' : 'Mostrar completados' }}
    </v-btn>
    <!-- Acciones principales -->
    <div class="d-flex ga-2 mt-4">
      <v-btn color="primary" prepend-icon="mdi-printer" @click="$emit('print-list')">Imprimir</v-btn>
      <v-btn color="secondary" prepend-icon="mdi-refresh" @click="$emit('reset-list')">Reiniciar</v-btn>
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ProductItem from './ProductItem.vue'

const props = defineProps({
  list: Object,
  products: Array,
  showCompleted: Boolean
})
const emit = defineEmits(['update-list-name', 'toggle-product', 'delete-product', 'show-details', 'toggle-completed', 'reset-list', 'print-list'])

const editingName = ref(false)
const editName = ref('')

function saveName() {
  if (editName.value.trim() && editName.value !== props.list.name) {
    emit('update-list-name', editName.value)
  }
  editingName.value = false
}

// Sincroniza el input con el nombre actual
watch(() => props.list.name, (val) => {
  editName.value = val
}, { immediate: true })

const progress = computed(() => {
  if (!props.list.total) return 0
  return Math.round((props.list.done / props.list.total) * 100)
})
</script>
