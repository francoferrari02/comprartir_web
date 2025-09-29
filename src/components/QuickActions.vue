<template>
  <!-- Tarjeta de Acciones Rápidas -->
  <v-card elevation="2" class="pa-4">
    <div class="d-flex align-center justify-space-between mb-2">
      <v-card-title class="text-h6 pa-0">Acciones Rápidas</v-card-title>
      <v-btn color="secondary" prepend-icon="mdi-plus" rounded>
        Nueva lista
      </v-btn>
    </div>

    <v-divider class="mb-3"></v-divider>

    <!-- Botones de acción de ancho completo -->
    <v-btn block class="mb-2" prepend-icon="mdi-upload">
      Importar
    </v-btn>
    <v-btn block class="mb-2" prepend-icon="mdi-download">
      Exportar
    </v-btn>
    <v-btn block class="mb-2" prepend-icon="mdi-cog">
      Preferencias
    </v-btn>
    <v-btn block prepend-icon="mdi-help-circle">
      Ayuda
    </v-btn>
  </v-card>
</template>

<script setup>
// Tarjeta con accesos directos a acciones frecuentes del usuario
</script>

<style scoped>
/* Sin estilos extra por ahora para mantener consistencia con Vuetify */
</style>
