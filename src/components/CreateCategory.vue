<template>
  <v-dialog
    :model-value="modelValue"
    max-width="600"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">Crear Nueva Categoría</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="closeDialog"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-6">
        <v-form ref="formRef" @submit.prevent="submitForm">
          <v-text-field
            v-model="form.name"
            label="Nombre de la categoría *"
            placeholder="Ej: Supermercado, Farmacia, etc."
            variant="outlined"
            :rules="nameRules"
            :error-messages="errors.name"
            prepend-inner-icon="mdi-tag"
            required
            autofocus
            @input="errors.name = ''"
          />

          <v-textarea
            v-model="metadataText"
            label="Metadata (JSON opcional)"
            placeholder='{"color": "blue", "icon": "cart"}'
            variant="outlined"
            rows="4"
            :error-messages="errors.metadata"
            hint="Ingrese un objeto JSON válido o déjelo vacío"
            persistent-hint
            @input="errors.metadata = ''"
          />
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="text"
          @click="closeDialog"
          :disabled="store.creating"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="store.creating"
          @click="submitForm"
        >
          Crear Categoría
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useCategoriesStore } from '@/stores/categories'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'success'])

const store = useCategoriesStore()
const formRef = ref(null)

// Form data
const form = ref({
  name: '',
})

const metadataText = ref('')

const errors = ref({
  name: '',
  metadata: '',
})

// Validation rules
const nameRules = [
  (v) => !!v || 'El nombre es requerido',
  (v) => (v && v.length >= 2) || 'El nombre debe tener al menos 2 caracteres',
  (v) => (v && v.length <= 100) || 'El nombre no puede exceder 100 caracteres',
]

// Methods
function validateMetadata() {
  if (!metadataText.value.trim()) {
    return true // Empty metadata is valid
  }

  try {
    JSON.parse(metadataText.value)
    errors.value.metadata = ''
    return true
  } catch (error) {
    errors.value.metadata = 'El metadata debe ser un JSON válido'
    return false
  }
}

async function submitForm() {
  // Validate form
  const { valid } = await formRef.value.validate()
  if (!valid) return

  // Validate metadata
  if (!validateMetadata()) return

  try {
    // Parse metadata
    let metadata = {}
    if (metadataText.value.trim()) {
      metadata = JSON.parse(metadataText.value)
    }

    // Create category
    await store.createCategory({
      name: form.value.name.trim(),
      metadata,
    })

    // Success
    emit('success')
    resetForm()
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 400) {
      errors.value.name = error.response?.data?.message || 'Datos inválidos'
    } else if (error.response?.status === 401) {
      errors.value.name = 'No autorizado. Por favor inicia sesión nuevamente.'
    } else {
      errors.value.name = 'Error al crear la categoría. Intenta nuevamente.'
    }
  }
}

function closeDialog() {
  emit('update:modelValue', false)
  resetForm()
}

function resetForm() {
  form.value = {
    name: '',
  }
  metadataText.value = ''
  errors.value = {
    name: '',
    metadata: '',
  }
  formRef.value?.resetValidation()
}

// Reset form when dialog closes
watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})
</script>

<style scoped>
:deep(.v-field__input) {
  font-family: monospace;
}
</style>
