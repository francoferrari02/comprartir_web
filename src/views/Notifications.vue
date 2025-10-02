<template>
  <v-container class="py-8">
    <h1 class="text-h5 font-weight-bold mb-4">Notificaciones</h1>

    <v-alert
        type="info"
        variant="tonal"
        class="mb-4"
        border="start"
    >
      Mostrando tus notificaciones recientes. Próximamente: filtros y marcado como leído.
    </v-alert>

    <v-list lines="two" density="comfortable" class="card">
      <v-list-item
          v-for="n in notifications"
          :key="n.id"
          :title="n.title"
          :subtitle="n.subtitle"
      >
        <template #prepend>
          <v-avatar size="32" class="mr-2" variant="tonal" color="primary">
            <v-icon v-if="n.icon">{{ n.icon }}</v-icon>
          </v-avatar>
        </template>
        <template #append>
          <div class="text-caption text-medium-emphasis">{{ n.time }}</div>
        </template>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
/* DEMO: podés traerlas de un store o fetch */
const notifications = ref([
  { id: 'n1', title: 'Sofía marcó “Tomates”', subtitle: 'Lista: Verdulería', time: 'hace 5 min', icon: 'mdi-check-bold' },
  { id: 'n2', title: 'Juan te compartió “Farmacia”', subtitle: 'Nuevo acceso como Editor', time: 'hace 20 min', icon: 'mdi-account-plus' },
  { id: 'n3', title: 'Vencimiento mañana', subtitle: 'Lista: Cumple Emma', time: 'hace 1 h', icon: 'mdi-bell-alert' },
])
</script>

<style scoped>
.card {
  border-radius: var(--radius-md, 16px);
  border: 1px solid var(--border, #E5E7EB);
  background: #fff;
}
</style>
