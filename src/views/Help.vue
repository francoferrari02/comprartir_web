<template>
  <v-container fluid class="py-8 bg-surface">
    <div class="view-shell">
      <AppBreadcrumbs :items="breadcrumbs" />

      <v-card class="card pa-6">
        <h1 class="text-h5 font-weight-bold mb-2">Ayuda</h1>
        <p class="text-body-2 text-medium-emphasis">Contenido en construcción.</p>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import AppBreadcrumbs from '@/components/AppBreadcrumbs.vue'

const breadcrumbs = [
  { title: 'Inicio', to: { name: 'home' } },
  { title: 'Ayuda' }
]
</script>

