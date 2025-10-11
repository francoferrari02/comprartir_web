<template>
  <v-container fluid class="py-8 bg-surface">
    <div class="shell">
      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="text-h4 font-weight-bold mb-2">Historial de Compras</h1>
          <p class="text-body-2 text-medium-emphasis">
            Revisa tus compras anteriores y restaura listas
          </p>
        </div>
      </div>

      <!-- Error Alert -->
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        closable
        class="mb-4"
        @click:close="error = null"
      >
        {{ error }}
      </v-alert>

      <!-- Success Snackbar -->
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="3000"
      >
        {{ snackbar.message }}
        <template #actions>
          <v-btn
            icon="mdi-close"
            size="small"
            @click="snackbar.show = false"
          />
        </template>
      </v-snackbar>

      <!-- Filters -->
      <v-card class="card mb-4">
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="filters.sort_by"
                :items="sortOptions"
                label="Ordenar por"
                variant="outlined"
                density="comfortable"
                hide-details
                @update:model-value="fetchPurchases"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="filters.order"
                :items="orderOptions"
                label="Orden"
                variant="outlined"
                density="comfortable"
                hide-details
                @update:model-value="fetchPurchases"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="filters.per_page"
                :items="perPageOptions"
                label="Resultados por página"
                variant="outlined"
                density="comfortable"
                hide-details
                @update:model-value="onPerPageChange"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        />
        <p class="text-body-1 mt-4">Cargando historial...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="purchases.length === 0" class="text-center py-16">
        <v-icon size="80" color="grey-lighten-1" class="mb-4">
          mdi-cart-outline
        </v-icon>
        <h2 class="text-h5 mb-2">No hay compras registradas</h2>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Las compras que realices aparecerán aquí
        </p>
        <v-btn color="primary" to="/lists" class="btn-pill">
          Ir a mis listas
        </v-btn>
      </div>

      <!-- Purchases List -->
      <div v-else>
        <v-row>
          <v-col
            v-for="purchase in purchases"
            :key="purchase.id"
            cols="12"
          >
            <v-card class="card card--hover">
              <v-card-text class="pa-4">
                <v-row align="center">
                  <!-- Purchase Info -->
                  <v-col cols="12" md="6">
                    <div class="d-flex align-center mb-2">
                      <v-icon color="primary" class="mr-2">mdi-cart-check</v-icon>
                      <h3 class="text-h6 font-weight-bold">
                        {{ purchase.list?.name || 'Lista sin nombre' }}
                      </h3>
                    </div>
                    <p class="text-body-2 text-medium-emphasis mb-1">
                      <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
                      {{ formatDate(purchase.createdAt) }}
                    </p>
                    <p v-if="purchase.list?.description" class="text-body-2 text-medium-emphasis mb-1">
                      {{ purchase.list.description }}
                    </p>
                    <p class="text-body-2 text-medium-emphasis">
                      <v-icon size="small" class="mr-1">mdi-package-variant</v-icon>
                      {{ purchase.items?.length || 0 }} productos comprados
                    </p>
                  </v-col>

                  <!-- Actions -->
                  <v-col cols="12" md="6" class="text-md-right">
                    <v-btn
                      color="primary"
                      variant="outlined"
                      class="btn-pill mr-2"
                      prepend-icon="mdi-eye"
                      @click="viewPurchaseDetails(purchase)"
                    >
                      Ver detalles
                    </v-btn>
                    <v-btn
                      color="primary"
                      variant="flat"
                      class="btn-pill"
                      prepend-icon="mdi-restore"
                      :loading="restoringId === purchase.id"
                      @click="confirmRestore(purchase)"
                    >
                      Restaurar
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="mt-6">
          <div class="d-flex justify-center">
            <v-pagination
              v-model="pagination.currentPage"
              :length="pagination.totalPages"
              :total-visible="7"
              @update:model-value="onPageChange"
            />
          </div>
          <p class="text-center text-body-2 text-medium-emphasis mt-2">
            Mostrando {{ startItem }} - {{ endItem }} de {{ pagination.totalItems }} compras
          </p>
        </div>
      </div>

      <!-- Purchase Details Dialog -->
      <v-dialog v-model="detailsDialog.open" max-width="800" scrollable>
        <v-card v-if="detailsDialog.purchase">
          <v-card-title class="pa-4 d-flex align-center justify-space-between bg-primary">
            <div class="text-white">
              <h2 class="text-h6">{{ detailsDialog.purchase.list?.name || 'Detalles de Compra' }}</h2>
              <p class="text-body-2 mt-1">{{ formatDate(detailsDialog.purchase.createdAt) }}</p>
            </div>
            <v-btn
              icon="mdi-close"
              variant="text"
              color="white"
              @click="detailsDialog.open = false"
            />
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-4" style="max-height: 500px;">
            <!-- Purchase metadata -->
            <div v-if="detailsDialog.purchase.metadata" class="mb-4">
              <h3 class="text-subtitle-1 font-weight-bold mb-2">Información adicional</h3>
              <pre class="text-body-2">{{ JSON.stringify(detailsDialog.purchase.metadata, null, 2) }}</pre>
            </div>

            <!-- Items list -->
            <h3 class="text-subtitle-1 font-weight-bold mb-3">
              Productos ({{ detailsDialog.purchase.items?.length || 0 }})
            </h3>
            <v-list v-if="detailsDialog.purchase.items?.length > 0" density="compact">
              <v-list-item
                v-for="item in detailsDialog.purchase.items"
                :key="item.id"
                class="px-0"
              >
                <template #prepend>
                  <v-icon color="success" class="mr-3">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="font-weight-medium">
                  {{ item.product?.name || item.productName || 'Producto' }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.quantity }} {{ item.unit }}
                  <span v-if="item.product?.category?.name" class="ml-2">
                    • {{ item.product.category.name }}
                  </span>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <p v-else class="text-body-2 text-medium-emphasis">
              No hay productos en esta compra
            </p>
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              variant="text"
              class="btn-rounded"
              @click="detailsDialog.open = false"
            >
              Cerrar
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              class="btn-rounded"
              prepend-icon="mdi-restore"
              :loading="restoringId === detailsDialog.purchase.id"
              @click="confirmRestore(detailsDialog.purchase)"
            >
              Restaurar esta compra
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Restore Confirmation Dialog -->
      <v-dialog v-model="restoreDialog.open" max-width="500">
        <v-card>
          <v-card-title class="pa-4">
            <v-icon color="primary" class="mr-2">mdi-restore</v-icon>
            Restaurar Compra
          </v-card-title>
          <v-card-text class="pa-4">
            <p class="mb-3">
              ¿Deseas restaurar esta compra como una nueva lista de compras?
            </p>
            <p class="text-body-2 text-medium-emphasis">
              Se creará una nueva lista con el nombre:
              <strong>{{ restoreDialog.purchase?.list?.name }}</strong>
            </p>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              variant="text"
              class="btn-rounded"
              @click="restoreDialog.open = false"
            >
              Cancelar
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              class="btn-rounded"
              :loading="restoreDialog.loading"
              @click="executeRestore"
            >
              Restaurar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPurchases, restorePurchase } from '@/services/purchases'

const router = useRouter()

// State
const loading = ref(true)
const error = ref(null)
const purchases = ref([])
const restoringId = ref(null)

// Pagination
const pagination = ref({
  currentPage: 1,
  perPage: 10,
  totalPages: 1,
  totalItems: 0
})

// Filters
const filters = ref({
  list_id: null,
  sort_by: 'createdAt',
  order: 'DESC',
  per_page: 10
})

// Dialogs
const detailsDialog = ref({
  open: false,
  purchase: null
})

const restoreDialog = ref({
  open: false,
  purchase: null,
  loading: false
})

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Computed
const startItem = computed(() => {
  if (purchases.value.length === 0) return 0
  return (pagination.value.currentPage - 1) * pagination.value.perPage + 1
})

const endItem = computed(() => {
  const end = pagination.value.currentPage * pagination.value.perPage
  return Math.min(end, pagination.value.totalItems)
})

// Options
const sortOptions = [
  { title: 'Fecha de compra', value: 'createdAt' },
  { title: 'Lista', value: 'list' },
  { title: 'ID', value: 'id' }
]

const orderOptions = [
  { title: 'Más reciente primero', value: 'DESC' },
  { title: 'Más antiguo primero', value: 'ASC' }
]

const perPageOptions = [
  { title: '5 por página', value: 5 },
  { title: '10 por página', value: 10 },
  { title: '20 por página', value: 20 },
  { title: '50 por página', value: 50 }
]

// Methods
async function fetchPurchases() {
  loading.value = true
  error.value = null

  try {
    const params = {
      page: pagination.value.currentPage,
      per_page: filters.value.per_page,
      sort_by: filters.value.sort_by,
      order: filters.value.order
    }

    if (filters.value.list_id) {
      params.list_id = filters.value.list_id
    }

    console.log('📤 Historial - Fetching purchases with params:', params)
    const response = await getPurchases(params)
    console.log('📥 Historial - Response:', response)

    // Handle different response formats
    if (Array.isArray(response)) {
      purchases.value = response
      // Si no hay paginación explícita, calcular manualmente
      pagination.value.totalItems = response.length
      pagination.value.totalPages = Math.ceil(response.length / filters.value.per_page)
    } else if (response.data) {
      purchases.value = response.data
      if (response.pagination) {
        pagination.value = {
          ...pagination.value,
          ...response.pagination
        }
      }
    }

    console.log('✅ Historial - Purchases loaded:', purchases.value.length)
  } catch (err) {
    console.error('❌ Historial - Error fetching purchases:', err)
    error.value = err.message || 'Error al cargar el historial de compras'
  } finally {
    loading.value = false
  }
}

function viewPurchaseDetails(purchase) {
  console.log('👁️ Historial - Opening details for purchase:', purchase)
  console.log('👁️ Historial - Purchase has items:', purchase.items?.length || 0)
  detailsDialog.value = {
    open: true,
    purchase
  }
}

function confirmRestore(purchase) {
  restoreDialog.value = {
    open: true,
    purchase,
    loading: false
  }
}

async function executeRestore() {
  if (!restoreDialog.value.purchase) return

  restoreDialog.value.loading = true
  restoringId.value = restoreDialog.value.purchase.id

  try {
    const result = await restorePurchase(restoreDialog.value.purchase.id)
    console.log('✅ Purchase restored:', result)

    showSnackbar('Compra restaurada exitosamente como nueva lista', 'success')
    restoreDialog.value.open = false
    detailsDialog.value.open = false

    // Redirect to the new list
    if (result.list?.id) {
      setTimeout(() => {
        router.push(`/lists/${result.list.id}`)
      }, 1000)
    }
  } catch (err) {
    console.error('❌ Error restoring purchase:', err)
    error.value = err.message || 'Error al restaurar la compra'
  } finally {
    restoreDialog.value.loading = false
    restoringId.value = null
  }
}

function onPageChange(page) {
  pagination.value.currentPage = page
  fetchPurchases()
}

function onPerPageChange() {
  pagination.value.currentPage = 1
  pagination.value.perPage = filters.value.per_page
  fetchPurchases()
}

function formatDate(dateString) {
  if (!dateString) return 'Fecha no disponible'

  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Hoy'
  } else if (diffDays === 1) {
    return 'Ayer'
  } else if (diffDays < 7) {
    return `Hace ${diffDays} días`
  } else {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

// Lifecycle
onMounted(() => {
  fetchPurchases()
})
</script>

<style scoped>
.shell {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.btn-pill {
  border-radius: 24px !important;
}

.btn-rounded {
  border-radius: 8px !important;
}

.card {
  border-radius: 12px;
}

.card--hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card--hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
