<template>
  <v-app-bar app color="white" elevation="1" density="comfortable" class="border-b">
    <div class="appbar-shell">
      <!-- Marca -->
      <div class="d-flex align-center">
        <v-btn to="/" variant="text" height="56" class="px-2" aria-label="Inicio">
          <v-img :src="logoSrc" alt="Compartir" width="40" class="mr-3" />
          <span class="brand text-h6 font-weight-bold d-none d-sm-inline">Compartir</span>
        </v-btn>
      </div>

      <!-- Buscador -->
      <v-text-field
          v-model="search"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-magnify"
          placeholder="Buscar listas, personas o plantillas"
          hide-details
          class="search mx-4"
      />

      <!-- Acciones -->
      <div class="d-flex align-center">
        <v-btn color="primary" prepend-icon="mdi-plus" class="btn-rounded mr-2" @click="$emit('new-list')">
          Nueva lista
        </v-btn>

        <v-btn icon class="mr-1" aria-label="Notificaciones">
          <v-badge color="error" :content="3" offset-x="6" offset-y="6">
            <v-icon>mdi-bell-outline</v-icon>
          </v-badge>
        </v-btn>

        <v-menu>
          <template #activator="{ props }">
            <v-btn icon v-bind="props" aria-label="Cuenta">
              <v-avatar size="32"><v-img src="https://i.pravatar.cc/64?img=3" alt="Usuario"/></v-avatar>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item title="Mi perfil" prepend-icon="mdi-account-circle" />
            <v-list-item title="Preferencias" prepend-icon="mdi-cog" />
            <v-divider />
            <v-list-item title="Cerrar sesión" prepend-icon="mdi-logout" />
          </v-list>
        </v-menu>
      </div>
    </div>
  </v-app-bar>
</template>

<script setup>
import { ref } from 'vue'
import logoSrc from '../assets/Logo_Comprartir.png'
const search = ref('')
</script>

<style scoped>
.border-b { border-bottom: 1px solid #E5E7EB; }

/* la barra adopta el mismo ancho que .shell de la página */
.appbar-shell {
  max-width: 1280px; margin: 0 auto; padding: 0 16px;
  display: grid; grid-template-columns: auto 1fr auto; align-items: center; width: 100%; box-sizing: border-box;
}
.search { max-width: 560px; width: 100%; }
.brand { letter-spacing: .2px; }
.btn-rounded { border-radius: 999px; }
</style>
