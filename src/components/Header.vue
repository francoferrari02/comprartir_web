<template>
  <v-app-bar app color="white" elevation="1" density="comfortable" class="border-b">
    <div class="appbar-shell">
      <!-- Logo como link (no queda “presionado”) -->
      <router-link to="/" class="brand-link" aria-label="Inicio">
        <v-img :src="logoSrc" alt="Compartir" width="40" class="mr-3" />
        <span class="brand text-h6 font-weight-bold d-none d-sm-inline">Compartir</span>
      </router-link>


      <!-- Nav a la derecha -->
      <div class="nav-group">
        <v-btn to="/lists"       color="primary" variant="elevated" size="small" class="btn-rounded btn-solid-primary" prepend-icon="mdi-view-list">Listas</v-btn>
        <v-btn to="/historial"   color="primary" variant="elevated" size="small" class="btn-rounded btn-solid-primary" prepend-icon="mdi-history">Historial</v-btn>
        <v-btn to="/preferences" color="primary" variant="elevated" size="small" class="btn-rounded btn-solid-primary" prepend-icon="mdi-cog">Preferencias</v-btn>
        <v-btn to="/profile"     color="primary" variant="elevated" size="small" class="btn-rounded btn-solid-primary" prepend-icon="mdi-account-circle">Perfil</v-btn>
        <v-btn to="/help"        color="primary" variant="elevated" size="small" class="btn-rounded btn-solid-primary" prepend-icon="mdi-help-circle">Ayuda</v-btn>
      </div>

      <!-- Notificaciones: menú al pasar el mouse -->
      <v-menu open-on-hover location="bottom end" offset="8" close-on-content-click>
        <template #activator="{ props }">
          <v-btn icon class="ml-2" aria-label="Notificaciones" v-bind="props">
            <v-badge :content="unreadCount" color="error" offset-x="6" offset-y="6">
              <v-icon>mdi-bell-outline</v-icon>
            </v-badge>
          </v-btn>
        </template>

        <v-card min-width="320" elevation="2">
          <v-list density="comfortable">
            <v-list-subheader>Notificaciones</v-list-subheader>

            <template v-if="notifications.length">
              <v-list-item
                  v-for="n in notifications"
                  :key="n.id"
                  :title="n.title"
                  :subtitle="n.subtitle"
                  :to="n.to || undefined"
                  lines="two"
              >
                <template #prepend>
                  <v-avatar size="28" class="mr-2" variant="tonal" color="primary">
                    <v-icon v-if="n.icon">{{ n.icon }}</v-icon>
                  </v-avatar>
                </template>
                <template #append>
                  <span class="text-caption text-medium-emphasis">{{ n.time }}</span>
                </template>
              </v-list-item>
            </template>

            <template v-else>
              <v-list-item title="No hay notificaciones" subtitle="Te avisamos cuando haya novedades" />
            </template>

            <v-divider class="my-2" />
            <v-list-item title="Ver todas" to="/notifications" append-icon="mdi-chevron-right" />
          </v-list>
        </v-card>
      </v-menu>
    </div>
  </v-app-bar>
</template>

<script setup>
import { ref, computed } from 'vue'
import logoSrc from '../assets/Logo_Comprartir-removebg.png'


/* Demo: reemplazá por tu store/fetch */
const notifications = ref([
  { id: 'n1', title: 'Sofía marcó “Tomates”', subtitle: 'Lista: Verdulería', time: 'hace 5 min', icon: 'mdi-check-bold', to: '/lists' },
  { id: 'n2', title: 'Juan te compartió “Farmacia”', subtitle: 'Editor agregado', time: 'hace 20 min', icon: 'mdi-account-plus', to: '/lists' },
  { id: 'n3', title: 'Vence mañana', subtitle: 'Lista: Cumple Emma', time: 'hace 1 h', icon: 'mdi-bell-alert', to: '/lists' },
])
const unreadCount = computed(() => notifications.value.length)
</script>

<style scoped>
.border-b { 
  border-bottom: 1px solid #E5E7EB; 
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

/* Layout: brand | nav | notif */
.appbar-shell{
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  width: 100%;
}

/* Logo como link neutro */
.brand-link{
  display: inline-flex; align-items: center; height: 56px; padding: 0 8px;
  text-decoration: none; color: inherit;
}
.brand-link:focus, .brand-link:active { outline: none; }

.brand { letter-spacing: .2px; }

.nav-group{ display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

/* Botones sólidos con hover oscuro (usa variables globales o fallback) */
.btn-solid-primary.v-btn--has-bg{
  background-color: var(--btn-bg, #4DA851) !important;
  color: var(--btn-fg, #fff) !important;
  border-color: transparent !important;
}
.btn-solid-primary:hover,
.btn-solid-primary:focus-visible{
  background-color: var(--btn-bg-hover, #3E8E47) !important;
}

@media (max-width: 900px){  .nav-group { display: none; } }
</style>
