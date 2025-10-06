<template>
  <v-card class="card card--hover pa-4 mb-4">
    <v-card-title class="text-h6 font-weight-bold">Añadir productos</v-card-title>
    <v-card-text>
      <!-- Product name input -->
      <v-text-field
        v-model="itemName"
        prepend-inner-icon="mdi-cart-plus"
        label="Nombre del producto"
        variant="outlined"
        density="comfortable"
        hide-details="auto"
        clearable
        class="mb-3"
        @keyup.enter="addProduct"
      />

      <!-- Quantity and unit -->
      <div class="d-flex gap-2 mb-3">
        <v-text-field
          v-model.number="quantity"
          type="number"
          label="Cantidad"
          variant="outlined"
          density="comfortable"
          hide-details
          min="1"
          style="max-width: 100px"
        />
        <v-select
          v-model="unit"
          :items="units"
          label="Unidad"
          variant="outlined"
          density="comfortable"
          hide-details
        />
      </div>

      <!-- Add button -->
      <v-btn
        block
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        class="btn-rounded"
        :disabled="!itemName || !itemName.trim()"
        :loading="loading"
        @click="addProduct"
      >
        Añadir producto
      </v-btn>

      <!-- Suggestions -->
      <div v-if="suggestions && suggestions.length" class="mt-4">
        <div class="text-caption text-medium-emphasis mb-2">Sugerencias</div>
        <v-chip
          v-for="s in suggestions"
          :key="s"
          class="ma-1 chip-rounded"
          size="small"
          variant="outlined"
          @click="quickAdd(s)"
        >
          <v-icon start size="small">mdi-plus-circle-outline</v-icon>
          {{ s }}
        </v-chip>
      </div>

      <!-- Recommended -->
      <div v-else-if="recommended && recommended.length" class="mt-4">
        <div class="text-caption text-medium-emphasis mb-2">Recomendados</div>
        <v-chip
          v-for="r in recommended"
          :key="r"
          class="ma-1 chip-rounded"
          size="small"
          variant="outlined"
          @click="quickAdd(r)"
        >
          <v-icon start size="small">mdi-plus-circle-outline</v-icon>
          {{ r }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  suggestions: {
    type: Array,
    default: () => []
  },
  recommended: {
    type: Array,
    default: () => ['Leche', 'Pan', 'Huevos', 'Arroz', 'Aceite']
  }
})

const emit = defineEmits(['update:modelValue', 'add-item'])

const itemName = ref(props.modelValue)
const quantity = ref(1)
const unit = ref('unidad')

const units = [
  'unidad',
  'kg',
  'gramos',
  'litros',
  'ml',
  'paquete',
  'caja',
  'bolsa',
  'docena'
]

function addProduct() {
  if (!itemName.value || !itemName.value.trim()) return

  emit('add-item', {
    name: itemName.value.trim(),
    quantity: quantity.value,
    unit: unit.value
  })

  // Reset form
  itemName.value = ''
  quantity.value = 1
  unit.value = 'unidad'
}

function quickAdd(productName) {
  itemName.value = productName
  addProduct()
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

/* Botones redondeados */
.btn-rounded {
  border-radius: 999px !important;
  text-transform: none;
  font-weight: 500;
}

/* Chips redondeados */
.chip-rounded {
  border-radius: 999px !important;
}

/* Campos de texto con bordes más redondeados */
:deep(.v-field) {
  border-radius: 12px !important;
}
</style>
