<script setup>
// App principal: ensambla los componentes de la pantalla de inicio
import Header from './components/Header.vue'
import QuickActions from './components/QuickActions.vue'
import Suggestions from './components/Suggestions.vue'
import WelcomeCard from './components/WelcomeCard.vue'
import RecentLists from './components/RecentLists.vue'
import KeyboardShortcuts from './components/KeyboardShortcuts.vue'
import Summary from './components/Summary.vue'
</script>

<template>
  <!-- Raíz de la app Vuetify -->
  <v-app>
    <!-- Cabecera fija -->
    <Header />

    <!-- Contenido principal -->
    <v-main>
      <!-- Contenedor fluido con fondo gris claro -->
      <v-container fluid class="py-6" style="background: #F5F5F5;">
        <!-- Tres columnas: 3 / 6 / 3 -->
        <v-row>
          <!-- Columna izquierda -->
          <v-col cols="12" sm="3" md="3" class="d-flex flex-column ga-4">
            <QuickActions />
            <Suggestions />
          </v-col>

          <!-- Columna central (más ancha) -->
          <v-col cols="12" sm="6" md="6" class="d-flex flex-column ga-4 overflow-hidden" style="min-width:0;">
            <!-- Título de sección -->
            <v-row no-gutters class="justify-center">
              <h2 class="text-h5 text-md-h4 text-center">Inicio</h2>
            </v-row>

            <WelcomeCard />
            <RecentLists />
          </v-col>

          <!-- Columna derecha -->
          <v-col cols="12" sm="3" md="3" class="d-flex flex-column ga-4" style="min-width:0;">
            <KeyboardShortcuts />
            <Summary />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
/* Animación sutil para tarjetas */
.v-card { transition: transform .18s ease, box-shadow .18s ease; }
.v-card:hover { transform: translateY(-2px); }
</style>
