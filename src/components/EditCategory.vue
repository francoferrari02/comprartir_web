<template>
  <v-dialog
    :model-value="modelValue"
    max-width="600"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">Editar Categoría</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="closeDialog"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-6">
        <!-- Loading state -->
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="48"
          />
          <p class="text-body-2 mt-4">Cargando categoría...</p>
        </div>

        <!-- Form -->
        <v-form v-else ref="formRef" @submit.prevent="submitForm">
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

          <!-- Category Info -->
          <v-alert
            v-if="category"
            type="info"
            variant="tonal"
            class="mt-4"
          >
            <div class="text-caption">
              <strong>ID:</strong> {{ category.id }}<br>
              <strong>Creado:</strong> {{ formatDate(category.createdAt) }}<br>
              <strong>Actualizado:</strong> {{ formatDate(category.updatedAt) }}
            </div>
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="text"
          @click="closeDialog"
          :disabled="store.updating"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="store.updating"
          :disabled="loading"
          @click="submitForm"
        >
          Guardar Cambios
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
  category: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'success'])

const store = useCategoriesStore()
const formRef = ref(null)
const loading = ref(false)

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
function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

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

async function loadCategory() {
  if (!props.category?.id) return

  loading.value = true
  try {
    // Fetch fresh data from API
    const freshCategory = await store.fetchCategoryById(props.category.id)
    
    // Populate form with fresh data
    form.value.name = freshCategory.name || ''
    metadataText.value = freshCategory.metadata 
      ? JSON.stringify(freshCategory.metadata, null, 2) 
      : ''
  } catch (error) {
    // If fetch fails, use the passed category data
    form.value.name = props.category.name || ''
    metadataText.value = props.category.metadata 
      ? JSON.stringify(props.category.metadata, null, 2) 
      : ''
  } finally {
    loading.value = false
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

    // Update category
    await store.updateCategory(props.category.id, {
      name: form.value.name.trim(),
      metadata,
    })

    // Success
    emit('success')
    closeDialog()
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 400) {
      errors.value.name = error.response?.data?.message || 'Datos inválidos'
    } else if (error.response?.status === 401) {
      errors.value.name = 'No autorizado. Por favor inicia sesión nuevamente.'
    } else if (error.response?.status === 404) {
      errors.value.name = 'Categoría no encontrada.'
    } else {
      errors.value.name = 'Error al actualizar la categoría. Intenta nuevamente.'
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

// Watch for dialog open and load category data
watch(() => props.modelValue, (newVal) => {
  if (newVal && props.category) {
    loadCategory()
  } else if (!newVal) {
    resetForm()
  }
})
</script>

<style scoped>
:deep(.v-field__input) {
  font-family: monospace;
}
</style>
