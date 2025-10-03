<template>
  <v-card class="pa-4">
    <h3 class="text-h6 font-weight-bold mb-3">Resumen</h3>
    
    <!-- Grid de métricas en dos columnas -->
    <div class="metrics-grid">
      <div 
        v-for="metric in metrics" 
        :key="metric.key"
        class="metric-item"
        @click="onMetricClick(metric)"
      >
        <div class="metric-content">
          <div class="metric-label">{{ metric.label }}</div>
          <div class="metric-number">{{ metric.value }}</div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({
      totalLists: 0,
      totalItems: 0,
      completedItems: 0,
      pendingItems: 0,
      sharedLists: 0,
      completedLists: 0
    })
  }
})

const emit = defineEmits(['metric-click'])

const metrics = computed(() => [
  {
    key: 'totalLists',
    label: 'Listas',
    value: props.stats.totalLists,
    filter: 'all'
  },
  {
    key: 'completedLists',
    label: 'Completadas',
    value: props.stats.completedLists,
    filter: 'completed'
  },
  {
    key: 'totalItems',
    label: 'Items',
    value: props.stats.totalItems,
    filter: 'all'
  },
  {
    key: 'completedItems',
    label: 'Completados',
    value: props.stats.completedItems,
    filter: 'completed'
  },
  {
    key: 'pendingItems',
    label: 'Pendientes',
    value: props.stats.pendingItems,
    filter: 'pending'
  },
  {
    key: 'sharedLists',
    label: 'Compartidas',
    value: props.stats.sharedLists,
    filter: 'shared'
  }
])

function onMetricClick(metric) {
  emit('metric-click', metric)
}
</script>

<style scoped>
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.metric-item {
  background-color: #F5F5F5;
  border-radius: 8px;
  padding: 12px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.metric-item:hover {
  background-color: #EEEEEE;
  border-color: var(--brand-50);
  transform: translateY(-1px);
}

.metric-content {
  text-align: center;
}

.metric-label {
  font-size: 0.75rem;
  color: #000;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.metric-number {
  font-size: 1.25rem;
  font-weight: bold;
  color: #000;
  line-height: 1.2;
}

/* Responsive: en móvil, una sola columna */
@media (max-width: 600px) {
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .metric-item {
    padding: 10px 6px;
  }
  
  .metric-number {
    font-size: 1.1rem;
  }
  
  .metric-label {
    font-size: 0.7rem;
  }
}
</style>
