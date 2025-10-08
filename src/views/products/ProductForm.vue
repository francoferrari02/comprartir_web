<template>
  <v-container fluid class="pa-4">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <!-- Header -->
        <div class="d-flex align-center mb-6">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            @click="$router.back()"
            class="mr-2"
          />
          <div>
            <h1 class="text-h4 font-weight-bold">
              {{ isEditMode ? 'Editar Producto' : 'Nuevo Producto' }}
            </h1>
            <p class="text-body-2 text-medium-emphasis">
              {{ isEditMode ? 'Actualiza la información del producto' : 'Completa los datos del nuevo producto' }}
            </p>
          </div>
        </div>

        <!-- Loading State -->
        <v-card v-if="loading && isEditMode" elevation="1">
          <v-card-text>
            <v-skeleton-loader type="article" />
          </v-card-text>
        </v-card>

        <!-- Error Alert -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          closable
          class="mb-4"
          @click:close="error = ''"
        >
          {{ error }}
        </v-alert>

        <!-- Form Card -->
        <v-card v-if="!loading || !isEditMode" elevation="1">
          <v-card-text class="pa-6">
            <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
              <v-row>
                <!-- Product Name -->
                <v-col cols="12">
                  <v-text-field
                    v-model="form.name"
                    label="Nombre del producto *"
                    prepend-inner-icon="mdi-package-variant"
                    variant="outlined"
                    density="comfortable"
                    :rules="[rules.required]"
                    :disabled="submitting"
                    counter="100"
                    maxlength="100"
                    hide-details="auto"
                  />
                </v-col>

                <!-- Category -->
                <v-col cols="12">
                  <v-select
                    v-model="form.category_id"
                    :items="categories"
                    item-title="name"
                    item-value="id"
                    label="Categoría *"
                    prepend-inner-icon="mdi-tag"
                    variant="outlined"
                    density="comfortable"
                    :rules="[rules.required]"
                    :disabled="submitting"
                    hide-details="auto"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template #prepend>
                          <v-avatar :color="getCategoryColor(item.raw.id)" size="32">
                            <v-icon size="18" color="white">mdi-tag</v-icon>
                          </v-avatar>
                        </template>
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>

                <!-- Metadata (optional JSON) -->
                <v-col cols="12">
                  <v-textarea
                    v-model="metadataText"
                    label="Metadata (JSON opcional)"
                    prepend-inner-icon="mdi-code-json"
                    variant="outlined"
                    density="comfortable"
                    :disabled="submitting"
                    :rules="[rules.validJson]"
                    rows="4"
                    hide-details="auto"
                    placeholder='{"key": "value"}'
                  />
                  <p class="text-caption text-medium-emphasis mt-2">
                    Información adicional en formato JSON. Ejemplo: {"color": "rojo", "marca": "Acme"}
                  </p>
                </v-col>
              </v-row>

              <!-- Actions -->
              <v-divider class="my-6" />
              <div class="d-flex justify-end gap-2">
                <v-btn
                  variant="outlined"
                  @click="$router.back()"
                  :disabled="submitting"
                >
                  Cancelar
                </v-btn>
                <v-btn
                  type="submit"
                  color="primary"
                  variant="elevated"
                  :loading="submitting"
                  :disabled="!valid"
                >
                  {{ isEditMode ? 'Guardar Cambios' : 'Crear Producto' }}
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useCategoriesStore } from '@/stores/categories'

const router = useRouter()
const route = useRoute()
const store = useProductsStore()
const categoriesStore = useCategoriesStore()

const props = defineProps({
  id: {
    type: [String, Number],
    default: null
  }
})

const formRef = ref(null)
const valid = ref(false)
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const metadataText = ref('')

const form = ref({
  name: '',
  category_id: null,
  metadata: {}
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const isEditMode = computed(() => !!props.id || !!route.params.id)

const categories = computed(() => categoriesStore.items || [])

const rules = {
  required: (v) => !!v || 'Este campo es requerido',
  validJson: (v) => {
    if (!v) return true
    try {
      JSON.parse(v)
      return true
    } catch {
      return 'Debe ser un JSON válido'
    }
  }
}

const getCategoryColor = (categoryId) => {
  const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error']
  return colors[categoryId % colors.length]
}

const loadProduct = async () => {
  const productId = props.id || route.params.id
  if (!productId) return

  loading.value = true
  error.value = ''

  try {
    await store.open(productId)
    if (store.current) {
      form.value = {
        name: store.current.name || '',
        category_id: store.current.category_id || store.current.category?.id || null,
        metadata: store.current.metadata || {}
      }

      if (store.current.metadata && Object.keys(store.current.metadata).length > 0) {
        metadataText.value = JSON.stringify(store.current.metadata, null, 2)
      }
    }
  } catch (err) {
    error.value = err.message || 'Error al cargar el producto'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  const validation = await formRef.value?.validate()
  if (!validation?.valid) return

  submitting.value = true
  error.value = ''

  try {
    // Parse metadata if provided
    let metadata = {}
    if (metadataText.value.trim()) {
      try {
        metadata = JSON.parse(metadataText.value)
      } catch {
        error.value = 'El formato del metadata no es válido'
        submitting.value = false
        return
      }
    }

    const payload = {
      name: form.value.name.trim(),
      category_id: form.value.category_id,
      metadata
    }

    if (isEditMode.value) {
      const productId = props.id || route.params.id
      await store.patch(productId, payload)
      showSnackbar('Producto actualizado exitosamente', 'success')
      setTimeout(() => {
        router.push(`/products/${productId}`)
      }, 500)
    } else {
      const created = await store.add(payload)
      showSnackbar('Producto creado exitosamente', 'success')
      setTimeout(() => {
        router.push('/products')
      }, 500)
    }
  } catch (err) {
    error.value = err.message || 'Error al guardar el producto'
  } finally {
    submitting.value = false
  }
}

const showSnackbar = (message, color = 'success') => {
  snackbar.value = { show: true, message, color }
}

onMounted(async () => {
  await categoriesStore.fetch()
  if (isEditMode.value) {
    await loadProduct()
  }
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>

