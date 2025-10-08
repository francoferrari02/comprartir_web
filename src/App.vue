<template>
  <v-app>
    <Header v-if="isAuthenticated" @new-list="onNewList" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, provide, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Header from './components/Header.vue'
import { isLoggedIn } from './services/auth.service'

const router = useRouter()

// Estado global de autenticación real
const isAuthenticated = ref(isLoggedIn())
provide('isAuthenticated', isAuthenticated)

// Función para actualizar estado de autenticación
function updateAuthState() {
  isAuthenticated.value = isLoggedIn()
}
provide('updateAuthState', updateAuthState)

// Check auth on mount
onMounted(() => {
  updateAuthState()
})

// Watch for route changes to update auth state
watch(() => router.currentRoute.value.path, () => {
  updateAuthState()
})

function onNewList(){ /* abrir modal o route */ }
</script>

<style scoped>
/* App no contiene estilos de la home; esas van en src/views/Home.vue */
</style>
