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
import { useRouter, useRoute } from 'vue-router'
import Header from './components/Header.vue'
import { isLoggedIn } from './services/auth.service'

const router = useRouter()
const route = useRoute()

// Estado global de autenticación real
const isAuthenticated = ref(isLoggedIn())
provide('isAuthenticated', isAuthenticated)

// Función para actualizar estado de autenticación
function updateAuthState() {
  const newAuthState = isLoggedIn()
  console.log('🔄 Updating auth state:', newAuthState, 'token:', localStorage.getItem('accessToken'))
  isAuthenticated.value = newAuthState
}
provide('updateAuthState', updateAuthState)

// Check auth on mount
onMounted(() => {
  updateAuthState()
  console.log('📱 App mounted - isAuthenticated:', isAuthenticated.value)
})

// Watch for route changes to update auth state
watch(() => route.path, () => {
  updateAuthState()
})

// Watch for storage changes (login/logout in another tab)
window.addEventListener('storage', (e) => {
  if (e.key === 'accessToken') {
    console.log('🔑 Token changed in storage')
    updateAuthState()
  }
})

function onNewList(){ /* abrir modal o route */ }
</script>

<style scoped>
/* App no contiene estilos de la home; esas van en src/views/Home.vue */
</style>
