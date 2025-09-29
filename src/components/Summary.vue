<template>
  <v-card elevation="2" class="pa-4">
    <v-card-title class="text-h6">Resumen</v-card-title>
    <v-card-text>
      <!-- Contenedores grises con números de resumen -->
      <div class="d-flex flex-wrap ga-3">
        <v-chip color="grey-lighten-3" variant="flat" class="text-body-2">Listas: 3</v-chip>
        <v-chip color="grey-lighten-3" variant="flat" class="text-body-2">Items: 8</v-chip>
        <v-chip color="grey-lighten-3" variant="flat" class="text-body-2">Hechos: 3</v-chip>
        <v-chip color="grey-lighten-3" variant="flat" class="text-body-2">Pendientes: 5</v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
// Resumen con métricas básicas de la actividad del usuario
</script>

<style scoped>
</style>
