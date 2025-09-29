<template>
  <!-- Tarjeta de bienvenida principal -->
  <v-card elevation="2" class="pa-8 text-center">
    <!-- Ícono/Logo de la app (placeholder con ícono de carrito) -->
    <v-icon size="56" color="primary" class="mb-4">mdi-cart</v-icon>

    <div class="text-h4 font-weight-bold mb-2">Bienvenido a Comprartir</div>
    <div class="text-subtitle-1 mb-6">Organizá y compartí tus listas de compras en segundos</div>

    <div class="d-flex flex-wrap justify-center ga-3 mb-6">
      <v-btn color="secondary" prepend-icon="mdi-plus" size="large" rounded>
        Crear nueva lista
      </v-btn>
      <v-btn variant="outlined" prepend-icon="mdi-format-list-bulleted" size="large" rounded>
        Ver todas las listas
      </v-btn>
      <v-btn variant="text" prepend-icon="mdi-upload" size="large" rounded>
        Importar
      </v-btn>
    </div>

    <!-- Buscador inferior -->
    <v-text-field
      v-model="query"
      prepend-inner-icon="mdi-magnify"
      label="Buscar en tus listas"
      variant="outlined"
      hide-details
    />
  </v-card>
</template>

<script setup>
// Tarjeta de bienvenida con acciones principales
import { ref } from 'vue'

const query = ref('')
</script>

<style scoped>
/* Animación sutil al pasar el mouse por botones */
.v-btn {
  transition: transform .15s ease;
}
.v-btn:hover {
  transform: translateY(-1px);
}
</style>
