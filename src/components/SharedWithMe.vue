<template>
  <section class="pa-4">
    <div class="section-head">
      <div class="section-title text-subtitle-1 font-weight-bold">Compartidos conmigo</div>
    </div>

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
import { getShoppingLists, getListItems } from '@/services/lists'
import { getProfile } from '@/services/auth'

const sharedLists = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    // Obtener usuario actual desde el servidor
    const currentUser = await getProfile()
    console.log('👤 Current user:', currentUser)

    // Obtener todas las listas
    const response = await getShoppingLists({ per_page: 100 })
    const allLists = Array.isArray(response.data) ? response.data : []
    console.log('📋 All lists:', allLists.length)

    // Filtrar SOLO las listas donde NO soy el owner (compartidas conmigo)
    const listsSharedWithMe = allLists.filter(list => {
      const isShared = list.owner && list.owner.id !== currentUser.id
      console.log(`Lista "${list.name}" - Owner: ${list.owner?.id}, Current: ${currentUser.id}, Is Shared: ${isShared}`)
      return isShared
    })

    console.log('📋 Lists shared with me (filtered):', listsSharedWithMe.length)

    // Obtener el conteo de items para cada lista compartida (máximo 5)
    const listsToShow = listsSharedWithMe.slice(0, 5)
    const listsWithCounts = await Promise.all(
      listsToShow.map(async (list) => {
        try {
          const itemsResponse = await getListItems(list.id, { per_page: 1000 })
          const items = Array.isArray(itemsResponse.data) ? itemsResponse.data : []
          return {
            ...list,
            itemCount: items.length
          }
        } catch (error) {
          console.error(`Error loading items for list ${list.id}:`, error)
          return {
            ...list,
            itemCount: 0
          }
        }
      })
    )

    sharedLists.value = listsWithCounts
    console.log('📋 Shared lists with counts:', sharedLists.value)
  } catch (error) {
    console.error('Error loading shared lists:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  margin-bottom: 12px;
}

.section-title {
  letter-spacing: 0.2px;
}

.list-item-hover {
  cursor: pointer;
  transition: background-color 0.2s;
}

.list-item-hover:hover {
  background-color: rgba(25, 118, 210, 0.08);
}
</style>
