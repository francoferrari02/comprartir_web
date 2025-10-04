<template>
  <v-container fluid class="py-8 bg-surface">
    <!-- Pantalla de bienvenida para usuarios no autenticados -->
    <div v-if="!isAuthenticated && !demoMode" class="shell">
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <v-card class="card pa-8 text-center">
            <v-img :src="logo" class="mx-auto mb-6" max-width="200" />
            <h1 class="text-h4 font-weight-bold mb-4">Bienvenido a Comprartir</h1>
            <p class="text-h6 text-medium-emphasis mb-6">
              Organizá y compartí tus listas de compras con amigos y familiares.
            </p>
            
            <!-- Botón para ver demo -->
            <div class="d-flex justify-center ga-4 mb-6">
              <v-btn 
                @click="demoMode = true"
                color="primary" 
                variant="elevated" 
                size="large"
                class="btn-rounded btn-solid-primary" 
                prepend-icon="mdi-eye"
              >
                Ver demo
              </v-btn>
            </div>
            
            <div class="mt-8">
              <v-row>
                <v-col cols="12" md="4">
                  <v-icon color="primary" size="48">mdi-view-list</v-icon>
                  <h3 class="text-h6 mt-3 mb-2">Crea listas</h3>
                  <p class="text-body-2">Organiza tus compras en listas fáciles de usar</p>
                </v-col>
                <v-col cols="12" md="4">
                  <v-icon color="primary" size="48">mdi-share</v-icon>
                  <h3 class="text-h6 mt-3 mb-2">Comparte</h3>
                  <p class="text-body-2">Colabora con familia y amigos en tiempo real</p>
                </v-col>
                <v-col cols="12" md="4">
                  <v-icon color="primary" size="48">mdi-check-circle</v-icon>
                  <h3 class="text-h6 mt-3 mb-2">Controla</h3>
                  <p class="text-body-2">Marca productos como comprados y lleva el control</p>
                </v-col>
              </v-row>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Dashboard para usuarios autenticados o en modo demo -->
    <div v-if="isAuthenticated || demoMode" class="shell">
      <!-- Banner de modo demo -->
      <v-alert
        v-if="demoMode && !isAuthenticated"
        type="info"
        variant="tonal"
        border="start"
        class="mb-4"
        closable
        @click:close="demoMode = false"
      >
        <div class="d-flex align-center justify-space-between">
          <span>
            <v-icon class="me-2">mdi-eye</v-icon>
            Estás viendo el modo demo. Esta es una vista previa de cómo se ve la aplicación cuando estás logueado.
          </span>
        </div>
      </v-alert>

      <v-row>
        <!-- COLUMNA IZQUIERDA (principal) -->
        <v-col cols="12" md="8" class="left-col">
          <!-- Hero -->
          <v-card class="card card--hover pa-7 mb-4 hero-card">
            <div class="d-flex align-center ga-6">
              <v-img :src="logo" class="rounded-lg hero-logo" />
              <div>
                <h1 class="text-h5 font-weight-bold mb-2">Bienvenido a Comprartir</h1>
                <p class="text-body-2 text-medium-emphasis mb-4">
                  Organizá y compartí tus listas de compras con amigos y familiares.
                </p>
                <div class="d-flex ga-3">
                  <v-btn color="primary" prepend-icon="mdi-plus" class="btn-rounded" @click="onNewList">
                    Nueva lista
                  </v-btn>
                  <v-btn variant="outlined" class="btn-rounded" :to="{ name: 'lists' }">Ver todas</v-btn>
                </div>
              </div>
            </div>
          </v-card>

          <!-- Listas recientes -->
          <RecentLists mode="cards"  class="card card--hover mb-4" />

        </v-col>

        <!-- COLUMNA DERECHA (sidebar) -->
        <v-col cols="12" md="4" class="right-col">
          <SharedWithMe class="card card--hover mb-4" />
          <ActivityFeed class="card card--hover mb-4" />
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { isLoggedIn } from '@/services/auth'
import RecentLists from '@/components/RecentLists.vue'
import Templates from '@/components/Templates.vue'
import SharedWithMe from '@/components/SharedWithMe.vue'
import ActivityFeed from '@/components/ActivityFeed.vue'
import logo from '@/assets/Logo_Comprartir.png'

const q = ref('')
const isAuthenticated = ref(false)
const demoMode = ref(false)

// Verificar autenticación al cargar
onMounted(() => {
  isAuthenticated.value = isLoggedIn()
})

function onNewList(){ /* abrir modal o route */ }
function useTemplate(t){ /* crear lista desde plantilla t */ }
</script>

<style scoped>
.shell { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
.left-col { min-width: 0; padding-right: 24px; }
.right-col { min-width: 280px; }
.hero-card { overflow: visible; }
.hero-logo { max-width: 172px; }

@media (min-width: 960px) {
  .right-col { position: sticky; top: 88px; }
}
</style>
