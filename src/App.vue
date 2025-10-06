<template>
  <v-app>
    <Header v-if="isAuthenticated" @new-list="onNewList" />
    <v-main>
      <div v-if="!isAuthenticated" class="d-flex flex-column align-center justify-center" style="min-height: 60vh;">
        <v-card class="pa-8 text-center" elevation="2">
          <v-icon size="48" color="primary" class="mb-4">mdi-account-circle</v-icon>
          <div class="text-h5 mb-2">¡Bienvenido a Comprartir!</div>
          <div class="mb-6">Para probar la app, inicia sesión demo.</div>
          <v-btn color="primary" size="large" @click="fakeLogin">
            Iniciar sesión demo
          </v-btn>
        </v-card>
      </div>
      <router-view v-else />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, provide } from 'vue'
import Header from './components/Header.vue'

// Estado global de autenticación fake
const isAuthenticated = ref(false)
provide('isAuthenticated', isAuthenticated)

function fakeLogin() {
  isAuthenticated.value = true
}

function onNewList(){ /* abrir modal o route */ }
</script>

<style scoped>
/* App no contiene estilos de la home; esas van en src/views/Home.vue */
</style>
