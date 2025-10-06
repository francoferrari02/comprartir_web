<template>
  <v-card class="pa-4" elevation="2">
    <v-card-title class="text-h6 font-weight-bold">Compartir lista</v-card-title>
    <v-card-text>
      <div class="mb-2">Agrega colaboradores en segundos</div>
      <!-- Buscador de usuario -->
      <v-text-field
        v-model="userQuery"
        prepend-inner-icon="mdi-account-search"
        label="Buscar usuario (mail o nombre)"
        variant="outlined"
        density="comfortable"
        hide-details
        clearable
        class="mb-2"
      />
      <!-- Acciones rápidas -->
      <v-btn block color="primary" variant="tonal" prepend-icon="mdi-link-variant" class="mb-2" @click="copyLink">
        Copiar enlace
      </v-btn>
      <v-btn block color="secondary" variant="tonal" prepend-icon="mdi-account-plus">
        Invitar por email
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
const userQuery = ref('')
function copyLink() {
  navigator.clipboard.writeText(window.location.href)
}
</script>
