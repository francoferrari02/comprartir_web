<template>
  <div class="d-flex align-center mb-2 product-item">
    <!-- Círculo/icono (sin funcionalidad de toggle para despensas) -->
    <v-icon class="mr-2" color="primary" size="small">
      mdi-package-variant
    </v-icon>

    <!-- Nombre del producto y detalles -->
    <div class="flex-grow-1 ml-2">
      <!-- Modo de visualización -->
      <div v-if="!editing">
        <span class="product-name" @dblclick="startEdit">
          {{ product.name }}
        </span>
        <v-btn
          icon="mdi-pencil"
          size="x-small"
          variant="text"
          class="ml-1"
          style="opacity: 0.6;"
          @click="startEdit"
        />
        <span v-if="product.quantity" class="text-caption text-medium-emphasis ml-2">
          {{ product.quantity }} {{ product.unit || 'unidad' }}
        </span>
      </div>
      <!-- Modo de edición del nombre -->
      <div v-else>
        <v-text-field
          v-model="editedName"
          variant="outlined"
          density="compact"
          hide-details
          autofocus
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
          @blur="saveEdit"
        />
      </div>
    </div>

    <!-- Botón detalles/editar cantidad -->
    <v-btn icon size="small" variant="text" @click="$emit('edit')">
      <v-icon>mdi-information-outline</v-icon>
    </v-btn>

    <!-- Botón eliminar -->
    <v-btn icon size="small" variant="text" color="error" @click="$emit('delete')">
      <v-icon>mdi-delete</v-icon>
    </v-btn>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete', 'edit', 'update-name'])

const editing = ref(false)
const editedName = ref('')

function startEdit() {
  editedName.value = props.product.name
  editing.value = true
}

function cancelEdit() {
  editing.value = false
  editedName.value = ''
}

function saveEdit() {
  if (editing.value && editedName.value.trim() && editedName.value.trim() !== props.product.name) {
    emit('update-name', editedName.value.trim())
  }
  editing.value = false
}
</script>

<style scoped>
.product-item {
  transition: background 0.15s;
  border-radius: 8px;
  padding: 8px;
}

.product-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.product-name {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  cursor: text;
}

.product-name:hover {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  padding: 2px 4px;
  margin: -2px -4px;
}
</style>
