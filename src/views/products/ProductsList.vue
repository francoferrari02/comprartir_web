<template>
  <v-container fluid class="pa-4">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <h1 class="text-h4 font-weight-bold">Productos</h1>
        <p class="text-body-2 text-medium-emphasis">
          Gestiona tu catálogo de productos
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="$router.push('/products/new')"
      >
        Nuevo Producto
      </v-btn>
    </div>

    <!-- Filters Card -->
    <v-card class="mb-4" elevation="1">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <label class="app-input-label" for="products-filter-name">Buscar por nombre</label>
            <v-text-field
              id="products-filter-name"
              v-model="filters.name"
              prepend-inner-icon="mdi-magnify"
              density="comfortable"
              clearable
              hide-details
              class="app-input"
              @update:model-value="debouncedSearch"
            />
          </v-col>
          <v-col cols="12" md="3">
            <label class="app-input-label" for="products-filter-category">Categoría</label>
            <v-select
              id="products-filter-category"
              v-model="filters.category_id"
              :items="categoryOptions"
              item-title="name"
              item-value="id"
              prepend-inner-icon="mdi-tag"
              density="comfortable"
              clearable
              hide-details
              class="app-input"
              @update:model-value="applyFilters"
            />
          </v-col>
          <v-col cols="12" md="2">
            <label class="app-input-label" for="products-filter-sort">Ordenar por</label>
            <v-select
              id="products-filter-sort"
              v-model="filters.sort_by"
              :items="sortOptions"
              density="comfortable"
              hide-details
              class="app-input"
              @update:model-value="applyFilters"
            />
          </v-col>
          <v-col cols="12" md="2">
            <label class="app-input-label" for="products-filter-order">Orden</label>
            <v-select
              id="products-filter-order"
              v-model="filters.order"
              :items="orderOptions"
              density="comfortable"
              hide-details
              class="app-input"
              @update:model-value="applyFilters"
            />
          </v-col>
          <v-col cols="12" md="1">
            <v-btn
              icon="mdi-refresh"
              variant="outlined"
              @click="resetFilters"
              :loading="store.loading"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Error Alert -->
    <v-alert
      v-if="store.error"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="store.error = ''"
    >
      {{ store.error }}
    </v-alert>

    <!-- Data Table -->
    <v-card elevation="1">
      <v-data-table
        :headers="headers"
        :items="store.items"
        :loading="store.loading"
        :items-per-page="filters.per_page"
        hide-default-footer
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar color="primary" size="32" class="mr-3">
              <v-icon size="18">mdi-package-variant</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.name }}</div>
            </div>
          </div>
        </template>

        <template #item.category="{ item }">
          <v-chip
            v-if="item.category"
            size="small"
            variant="tonal"
            :color="getCategoryColor(item.category.id)"
          >
            {{ item.category.name }}
          </v-chip>
          <span v-else class="text-medium-emphasis">Sin categoría</span>
        </template>

        <template #item.createdAt="{ item }">
          <span class="text-body-2">
            {{ formatDate(item.createdAt) }}
          </span>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              @click="$router.push(`/products/${item.id}`)"
            />
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              @click="$router.push(`/products/${item.id}/edit`)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="confirmDelete(item)"
            />
          </div>
        </template>

        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>

        <template #no-data>
          <div class="text-center py-8">
            <v-icon size="64" color="grey">mdi-package-variant-closed</v-icon>
            <p class="text-h6 mt-4">No hay productos</p>
            <p class="text-body-2 text-medium-emphasis">
              Crea tu primer producto para comenzar
            </p>
            <v-btn
              color="primary"
              class="mt-4"
              prepend-icon="mdi-plus"
              @click="$router.push('/products/new')"
            >
              Crear Producto
            </v-btn>
          </div>
        </template>
      </v-data-table>

      <!-- Pagination -->
      <v-divider />
      <div class="d-flex align-center justify-space-between pa-4">
        <div class="text-body-2 text-medium-emphasis">
          Mostrando {{ store.items.length }} de {{ store.total }} productos
        </div>
        <v-pagination
          v-model="filters.page"
          :length="store.totalPages"
          :total-visible="5"
          @update:model-value="applyFilters"
        />
      </div>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirmar eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar el producto
          <strong>{{ itemToDelete?.name }}</strong>?
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
import { ref, onMounted, computed } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useCategoriesStore } from '@/stores/categories'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useProductsStore()
const categoriesStore = useCategoriesStore()

const filters = ref({
  name: '',
  category_id: '',
  page: 1,
  per_page: 10,
  sort_by: 'createdAt',
  order: 'DESC'
})

const deleteDialog = ref(false)
const itemToDelete = ref(null)
const deleting = ref(false)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const headers = [
  { title: 'Nombre', key: 'name', sortable: false },
  { title: 'Categoría', key: 'category', sortable: false },
  { title: 'Creado', key: 'createdAt', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' }
]

const sortOptions = [
  { title: 'Nombre', value: 'name' },
  { title: 'Fecha creación', value: 'createdAt' },
  { title: 'Última actualización', value: 'updatedAt' }
]

const orderOptions = [
  { title: 'Ascendente', value: 'ASC' },
  { title: 'Descendente', value: 'DESC' }
]

const categoryOptions = computed(() => {
  return [
    { name: 'Todas las categorías', id: '' },
    ...(categoriesStore.items || [])
  ]
})

let debounceTimer = null
const debouncedSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    filters.value.page = 1
    applyFilters()
  }, 300)
}

const applyFilters = async () => {
  store.updateFilters(filters.value)
  await store.fetch()
}

const resetFilters = () => {
  filters.value = {
    name: '',
    category_id: '',
    page: 1,
    per_page: 10,
    sort_by: 'createdAt',
    order: 'DESC'
  }
  applyFilters()
}

const confirmDelete = (item) => {
  itemToDelete.value = item
  deleteDialog.value = true
}

const deleteProduct = async () => {
  deleting.value = true
  try {
    await store.remove(itemToDelete.value.id)
    deleteDialog.value = false
    showSnackbar('Producto eliminado exitosamente', 'success')
  } catch (error) {
    showSnackbar(error.message, 'error')
  } finally {
    deleting.value = false
  }
}

const showSnackbar = (message, color = 'success') => {
  snackbar.value = { show: true, message, color }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getCategoryColor = (categoryId) => {
  const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error']
  return colors[categoryId % colors.length]
}

onMounted(async () => {
  await categoriesStore.fetch()
  await applyFilters()
})
</script>

<style scoped>
.gap-1 {
  gap: 4px;
}
</style>

