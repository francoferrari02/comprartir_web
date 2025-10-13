<template>
  <v-card>
    <v-card-title class="text-h6 font-weight-bold pa-4">
      <v-icon class="mr-2">mdi-chart-box-outline</v-icon>
      Resumen
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-4">
      <div v-if="loading" class="text-center py-4">
        <v-progress-circular indeterminate size="32" />
      </div>
      <div v-else>
        <!-- Sub-tarjeta de Despensas (con botones clicables) -->
        <div class="summary-sub-card mb-3">
          <div class="sub-card-header mb-3">
            <v-icon size="small" class="mr-1" color="primary">mdi-fridge-outline</v-icon>
            <span class="text-subtitle-2 font-weight-bold">Despensas</span>
          </div>
          
          <!-- Todas las despensas - Botón -->
          <v-btn
            variant="flat"
            color="white"
            block
            class="stat-button mb-2"
            @click="$emit('filter-all-pantries')"
          >
            <div class="d-flex align-center justify-space-between w-100">
              <span class="text-body-2 font-weight-bold">Total</span>
              <v-chip
                size="small"
                color="primary"
                variant="flat"
              >
                {{ stats.totalPantries }}
              </v-chip>
            </div>
          </v-btn>

          <!-- Despensas compartidas - Botón -->
          <v-btn
            variant="flat"
            color="white"
            block
            class="stat-button"
            @click="$emit('filter-shared-pantries')"
          >
            <div class="d-flex align-center justify-space-between w-100">
              <span class="text-body-2 font-weight-bold">Compartidas conmigo</span>
              <v-chip
                size="small"
                color="success"
                variant="flat"
              >
                {{ stats.sharedPantries }}
              </v-chip>
            </div>
          </v-btn>
        </div>

        <v-divider class="my-3" />

        <!-- Sub-tarjeta de Categorías (info-only) -->
        <div class="summary-sub-card">
          <div class="sub-card-header mb-3">
            <v-icon size="small" class="mr-1" color="primary">mdi-shape-outline</v-icon>
            <span class="text-subtitle-2 font-weight-bold">Categorías principales</span>
          </div>
          
          <div v-if="stats.topCategories && stats.topCategories.length > 0">
            <!-- Top categorías -->
            <div
              v-for="(category, index) in stats.topCategories"
              :key="category.name"
              class="stat-info-item"
              :class="{ 'mb-2': index < stats.topCategories.length - 1 }"
            >
              <div class="d-flex align-center justify-space-between w-100">
                <span class="text-body-2 font-weight-bold">{{ category.name }}</span>
                <v-chip
                  size="small"
                  color="grey"
                  variant="tonal"
                >
                  {{ category.count }}
                </v-chip>
              </div>
            </div>
          </div>
          
          <!-- Empty state -->
          <div v-else class="text-center py-3">
            <v-icon size="32" color="grey-lighten-1">mdi-package-variant-closed</v-icon>
            <p class="text-body-2 text-medium-emphasis mt-2">
              No hay productos en las despensas
            </p>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    default: () => ({
      totalPantries: 0,
      sharedPantries: 0,
      topCategories: []
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['filter-all-pantries', 'filter-shared-pantries'])
</script>

<style scoped>
.summary-card {
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.summary-sub-card {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 16px;
}

.sub-card-header {
  display: flex;
  align-items: center;
}

.stat-button {
  border-radius: 50px !important;
  padding: 12px 16px !important;
  text-transform: none;
  letter-spacing: normal;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
  transition: all 0.2s ease;
  height: auto !important;
}

.stat-button:hover {
  box-shadow: 0 2px 6px rgba(0,0,0,0.15) !important;
  transform: translateY(-1px);
}

.stat-button :deep(.v-btn__content) {
  width: 100%;
  justify-content: space-between;
}

.stat-button :deep(.v-btn__content) > div {
  width: 100%;
}

.stat-info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: white;
  border-radius: 50px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.stat-info-item:last-child {
  margin-bottom: 0;
}
</style>
