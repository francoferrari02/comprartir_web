<template>
  <v-container fluid class="pa-4">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <!-- Loading State -->
        <v-card v-if="loading" elevation="1">
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

        <!-- Product Detail Card -->
        <v-card v-if="!loading && product" elevation="1">
          <!-- Header -->
          <v-card-title class="pa-6 pb-4">
            <div class="d-flex align-center">
              <v-btn
                icon="mdi-arrow-left"
                variant="text"
                @click="$router.back()"
                class="mr-2"
              />
              <div class="flex-grow-1">
                <h1 class="text-h4 font-weight-bold">{{ product.name }}</h1>
                <p class="text-body-2 text-medium-emphasis mt-1">
                  Detalles del producto
                </p>
              </div>
            </div>
          </v-card-title>

          <v-divider />

          <!-- Product Info -->
          <v-card-text class="pa-6">
            <v-row>
              <!-- Icon -->
              <v-col cols="12" class="text-center mb-4">
                <v-avatar color="primary" size="80">
                  <v-icon size="40" color="white">mdi-package-variant</v-icon>
                </v-avatar>
              </v-col>

              <!-- Name -->
              <v-col cols="12">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="primary">mdi-package-variant</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2 text-medium-emphasis">
                    Nombre
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-h6 font-weight-medium text-high-emphasis mt-1">
                    {{ product.name }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>

              <!-- Category -->
              <v-col cols="12">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="primary">mdi-tag</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2 text-medium-emphasis">
                    Categoría
                  </v-list-item-title>
                  <v-list-item-subtitle class="mt-1">
                    <v-chip
                      v-if="product.category"
                      :color="getCategoryColor(product.category.id)"
                      variant="tonal"
                    >
                      {{ product.category.name }}
                    </v-chip>
                    <span v-else class="text-medium-emphasis">Sin categoría</span>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>

              <!-- Metadata -->
              <v-col cols="12" v-if="hasMetadata">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="primary">mdi-code-json</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2 text-medium-emphasis mb-2">
                    Metadata
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <v-card variant="outlined" class="mt-2">
                      <v-card-text>
                        <pre class="text-body-2">{{ formattedMetadata }}</pre>
                      </v-card-text>
                    </v-card>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>

              <!-- Timestamps -->
              <v-col cols="12" md="6">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="primary">mdi-calendar-plus</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2 text-medium-emphasis">
                    Fecha de creación
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-1 mt-1">
                    {{ formatDate(product.createdAt) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>

              <v-col cols="12" md="6">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="primary">mdi-calendar-edit</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2 text-medium-emphasis">
                    Última actualización
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-1 mt-1">
                    {{ formatDate(product.updatedAt) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider />

          <!-- Actions -->
          <v-card-actions class="pa-4">
            <v-btn
              variant="outlined"
              prepend-icon="mdi-arrow-left"
              @click="$router.back()"
            >
              Volver
            </v-btn>
            <v-spacer />
            <v-btn
              color="error"
              variant="outlined"
              prepend-icon="mdi-delete"
              @click="confirmDelete"
            >
              Eliminar
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-pencil"
              @click="$router.push(`/products/${product.id}/edit`)"
            >
              Editar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirmar eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar el producto
          <strong>{{ product?.name }}</strong>?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :loading="deleting"
            @click="deleteProduct"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

const router = useRouter()
const route = useRoute()
const store = useProductsStore()

const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  }
})

const loading = ref(false)
const error = ref('')
const deleteDialog = ref(false)
const deleting = ref(false)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const product = computed(() => store.current)

const hasMetadata = computed(() => {
  return product.value?.metadata && Object.keys(product.value.metadata).length > 0
})

const formattedMetadata = computed(() => {
  if (!product.value?.metadata) return '{}'
  return JSON.stringify(product.value.metadata, null, 2)
})

const getCategoryColor = (categoryId) => {
  const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error']
  return colors[categoryId % colors.length]
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const confirmDelete = () => {
  deleteDialog.value = true
}

const deleteProduct = async () => {
  deleting.value = true
  try {
    await store.remove(product.value.id)
    showSnackbar('Producto eliminado exitosamente', 'success')
    setTimeout(() => {
      router.push('/products')
    }, 500)
  } catch (err) {
    showSnackbar(err.message || 'Error al eliminar el producto', 'error')
  } finally {
    deleting.value = false
    deleteDialog.value = false
  }
}

const showSnackbar = (message, color = 'success') => {
  snackbar.value = { show: true, message, color }
}

const loadProduct = async () => {
  loading.value = true
  error.value = ''
  try {
    await store.open(props.id || route.params.id)
  } catch (err) {
    error.value = err.message || 'Error al cargar el producto'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Courier New', monospace;
}
</style>

