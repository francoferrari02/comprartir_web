<template>
  <v-card>
    <v-card-title class="text-h6 pa-4">
      <v-icon class="mr-2">mdi-chart-box-outline</v-icon>
      Resumen
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-4">
      <div v-if="loading" class="text-center py-4">
        <v-progress-circular indeterminate size="32" />
      </div>
      <div v-else>
        <!-- Sub-tarjeta de Listas -->
        <div class="summary-sub-card mb-3">
          <div class="sub-card-header mb-2">
            <v-icon size="small" class="mr-1" color="primary">mdi-clipboard-list-outline</v-icon>
            <span class="text-subtitle-2 font-weight-bold">Listas</span>
          </div>
          <div class="stat-item mb-2">
            <div class="d-flex align-center justify-space-between">
              <span class="text-body-2">Total de listas</span>
              <span class="text-h6 font-weight-bold">{{ stats.totalLists }}</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="d-flex align-center justify-space-between">
              <span class="text-body-2">Listas completadas</span>
              <span class="text-h6 font-weight-bold text-success">{{ stats.completedLists }}</span>
            </div>
          </div>
        </div>

        <v-divider class="my-3" />

        <!-- Sub-tarjeta de Items -->
        <div class="summary-sub-card">
          <div class="sub-card-header mb-2">
            <v-icon size="small" class="mr-1" color="primary">mdi-cart-outline</v-icon>
            <span class="text-subtitle-2 font-weight-bold">Items</span>
          </div>
          <div class="stat-item mb-2">
            <div class="d-flex align-center justify-space-between">
              <span class="text-body-2">Total de items</span>
              <span class="text-h6 font-weight-bold">{{ stats.totalItems }}</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="d-flex align-center justify-space-between">
              <span class="text-body-2">Items comprados</span>
              <span class="text-h6 font-weight-bold text-success">{{ stats.completedItems }}</span>
            </div>
          </div>
        </div>

        <v-divider class="my-3" />

        <!-- Estadística adicional -->
        <div class="stat-item">
          <div class="d-flex align-center justify-space-between">
            <span class="text-body-2">Listas compartidas</span>
            <span class="text-h6 font-weight-bold">{{ stats.sharedLists }}</span>
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
      totalLists: 0,
      completedLists: 0,
      totalItems: 0,
      completedItems: 0,
      sharedLists: 0
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.summary-sub-card {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.sub-card-header {
  display: flex;
  align-items: center;
}

.stat-item {
  padding: 4px 0;
}
</style>
