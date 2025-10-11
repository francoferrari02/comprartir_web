<template>
  <section class="pa-4">
    <div class="text-subtitle-1 font-weight-medium mb-2">Compartidos conmigo</div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-4">
      <v-progress-circular indeterminate color="primary" size="32" />
    </div>

    <!-- Empty state -->
    <div v-else-if="sharedLists.length === 0" class="text-center py-6">
      <v-icon size="48" color="grey-lighten-1">mdi-share-variant-outline</v-icon>
      <p class="text-body-2 text-medium-emphasis mt-2">
        No hay listas compartidas contigo
      </p>
    </div>

    <!-- Lists -->
    <v-list v-else density="comfortable">
      <v-list-item
        v-for="list in sharedLists"
        :key="list.id"
        :to="`/lists/${list.id}`"
        class="list-item-hover"
      >
        <template #prepend>
          <v-avatar size="28" color="primary">
            <v-icon size="16">mdi-format-list-bulleted</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title class="font-weight-medium">{{ list.name }}</v-list-item-title>
        <v-list-item-subtitle>
          Propietario: {{ list.owner?.name || list.owner?.email || 'Desconocido' }}
        </v-list-item-subtitle>
        <template #append>
          <v-chip size="small" variant="tonal" color="primary">
            {{ list.itemCount || 0 }} items
          </v-chip>
        </template>
      </v-list-item>
    </v-list>

    <!-- View all link -->
    <div v-if="sharedLists.length > 0" class="text-center mt-2">
      <v-btn
        variant="text"
        size="small"
        :to="{ name: 'lists' }"
        class="text-caption"
      >
        Ver todas las listas
      </v-btn>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getShoppingLists } from '@/services/lists'

const sharedLists = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    // Obtener todas las listas y filtrar las compartidas conmigo (donde no soy owner)
    const response = await getShoppingLists({ per_page: 100 })
    const allLists = response.data || response || []

    // Obtener ID del usuario actual
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

    // Filtrar listas donde no soy el owner (son compartidas conmigo)
    sharedLists.value = allLists
      .filter(list => list.owner && list.owner.id !== currentUser.id)
      .slice(0, 5) // Mostrar máximo 5

    console.log('📋 Shared lists loaded:', sharedLists.value.length)
  } catch (error) {
    console.error('Error loading shared lists:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.list-item-hover {
  cursor: pointer;
  transition: background-color 0.2s;
}

.list-item-hover:hover {
  background-color: rgba(25, 118, 210, 0.08);
}
</style>
