<template>
  <v-app>
    <Header @new-list="onNewList" />

    <v-main>
      <v-container fluid class="py-8 bg-surface">
        <div class="shell">
          <v-row>
            <!-- COLUMNA IZQUIERDA (principal) -->
            <v-col cols="12" md="8" class="left-col">
              <!-- Hero -->

              <v-card class="card card--hover pa-7 mb-4">
                <div class="d-flex align-center ga-6">
                  <v-img :src="logo" class="rounded-lg" max-width="172" />
                  <div>
                    <h1 class="text-h5 font-weight-bold mb-2">Bienvenido a Comprartir</h1>
                    <p class="text-body-2 text-medium-emphasis mb-4">
                      Organizá y compartí tus listas de compras con amigos y familiares.
                    </p>
                    <div class="d-flex ga-3">
                      <v-btn color="primary" prepend-icon="mdi-plus" class="btn-rounded" @click="onNewList">
                        Nueva lista
                      </v-btn>
                      <v-btn variant="outlined" class="btn-rounded" to="/listas">Ver todas</v-btn>
                    </div>
                  </div>
                </div>
              </v-card>


              <!-- Listas recientes -->
              <RecentLists mode="cards" class="card mb-4" />


            </v-col>

            <!-- COLUMNA DERECHA (sidebar) -->
            <v-col cols="12" md="4" class="right-col">
              <SharedWithMe class="card mb-4" />
              <ActivityFeed class="card mb-4" />
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import Header from './components/Header.vue'
import RecentLists from './components/RecentLists.vue'
import SharedWithMe from './components/SharedWithMe.vue'
import ActivityFeed from './components/ActivityFeed.vue'
import logo from '@/assets/Logo_Comprartir.png'

const q = ref('')
function onNewList(){ /* abrir modal o route */ }
function useTemplate(t){ /* crear lista desde plantilla t */ }
</script>

<style scoped>
.shell {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
}

.left-col {
  min-width: 0;
  padding-right: 24px;
}

.right-col {
  min-width: 280px;
}

@media (min-width: 960px) {
  .right-col {
    position: sticky;
    top: 88px;
  }
}
</style>

<style>
/* Importa los estilos globales si no lo has hecho en main.js */
@import '@/assets/styles.css';

.font-hanken {
  font-family: 'Hanken Grotesk', sans-serif;
}
</style>



