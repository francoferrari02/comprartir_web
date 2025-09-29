<template>
  <!-- Barra superior de la aplicación -->
  <v-app-bar elevation="2" color="white" app>
    <!-- Lado izquierdo: Título + navegación -->
    <v-toolbar-title class="font-weight-bold text-primary">
      <!-- Nombre de la app -->
      Comprartir
    </v-toolbar-title>

    <!-- Botones de navegación -->
    <v-btn
      color="primary"
      class="ml-4 mr-2 text-white"
      prepend-icon="mdi-home"
      rounded
    >
      Inicio
    </v-btn>
    <v-btn variant="tonal" class="mr-2" prepend-icon="mdi-format-list-bulleted">
      Listas
    </v-btn>
    <v-btn variant="tonal" class="mr-2" prepend-icon="mdi-history">
      Historial
    </v-btn>
    <v-btn variant="tonal" prepend-icon="mdi-account">
      Perfil
    </v-btn>

    <!-- Separa izquierda de derecha -->
    <v-spacer></v-spacer>

    <!-- Buscador -->
    <v-text-field
      v-model="search"
      density="comfortable"
      variant="outlined"
      prepend-inner-icon="mdi-magnify"
      label="Buscar"
      hide-details
      class="mr-4"
      style="max-width: 320px"
    />

    <!-- Acciones derechas -->
    <v-btn variant="text" prepend-icon="mdi-printer">Imprimir</v-btn>
    <v-btn variant="text" prepend-icon="mdi-cog">Preferencias</v-btn>
    <v-btn variant="text" prepend-icon="mdi-help-circle">Ayuda</v-btn>
  </v-app-bar>
</template>

<script setup>
// Componente de cabecera de la app
// - Muestra el nombre y navegación principal
// - Incluye buscador y acciones rápidas
import { ref } from 'vue'

const search = ref('')
</script>

<style scoped>
/* Estilos sutiles para coherencia visual */
.text-primary {
  color: #0D47A1 !important;
}
</style>
