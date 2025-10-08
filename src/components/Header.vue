<template>
  <v-app-bar app color="white" elevation="1" height="64" density="comfortable" class="border-b header-fix">
    <div class="appbar-shell header-content-fix">
      <!-- Logo como link (no queda "presionado") -->
      <router-link to="/" class="brand-link" aria-label="Inicio">
        <v-img :src="logoSrc" alt="Comprartir" width="40" class="mr-3" />
        <span class="brand text-h6 font-weight-bold d-none d-sm-inline">Comprartir</span>
      </router-link>

      <!-- Nav a la derecha - Solo si está logueado -->
      <div v-if="isAuthenticated" class="nav-group">
        <v-btn to="/lists"       color="primary" variant="elevated" size="small" class="btn-rounded btn-solid-primary" prepend-icon="mdi-view-list">Listas</v-btn>
        <v-btn to="/pantries"    color="primary" variant="elevated" size="small" class="btn-rounded btn-solid-primary" prepend-icon="mdi-fridge">Despensas</v-btn>
        <v-btn to="/historial"   color="primary" variant="elevated" size="small" class="btn-rounded btn-solid-primary" prepend-icon="mdi-history">Historial</v-btn>
        <v-btn to="/preferences" color="primary" variant="elevated" size="small" class="btn-rounded btn-solid-primary" prepend-icon="mdi-cog">Preferencias</v-btn>
        <v-btn to="/profile"     color="primary" variant="elevated" size="small" class="btn-rounded btn-solid-primary" prepend-icon="mdi-account-circle">Perfil</v-btn>
        <v-btn to="/help"        color="primary" variant="elevated" size="small" class="btn-rounded btn-solid-primary" prepend-icon="mdi-help-circle">Ayuda</v-btn>
      </div>

      <!-- Nav para usuarios no autenticados -->
      <div v-else class="auth-group">
        <v-btn to="/login" color="primary" variant="outlined" size="small" class="btn-rounded" prepend-icon="mdi-login">
          Iniciar sesión
        </v-btn>
        <v-btn to="/register" color="primary" variant="elevated" size="small" class="btn-rounded btn-solid-primary" prepend-icon="mdi-account-plus">
          Registrarse
        </v-btn>
      </div>

      <!-- Notificaciones y menú de usuario: Solo si está logueado -->
      <template v-if="isAuthenticated">
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

        <!-- Menú de usuario -->
        <v-menu location="bottom end" offset="8">
          <template #activator="{ props }">
            <v-btn icon class="ml-2" aria-label="Menú de usuario" v-bind="props">
              <v-avatar size="32">
                <v-icon>mdi-account</v-icon>
              </v-avatar>
            </v-btn>
          </template>

          <v-card min-width="200" elevation="2">
            <v-list density="comfortable">
              <v-list-item 
                  :title="userEmail || 'Usuario'"
                  subtitle="Ver perfil"
                  to="/profile"
                  prepend-icon="mdi-account-circle"
              />
              <v-divider class="my-1" />
              <v-list-item 
                  title="Cerrar sesión"
                  prepend-icon="mdi-logout"
                  @click="handleLogout"
              />
            </v-list>
          </v-card>
        </v-menu>
      </template>
    </div>
  </v-app-bar>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '@/services/auth.service'
import logoSrc from '../assets/Logo_Comprartir-removebg.png'

// Recibe el estado global de autenticación desde App.vue
const isAuthenticated = inject('isAuthenticated', ref(false))
const updateAuthState = inject('updateAuthState')

const router = useRouter()

// Notificaciones (demo)
const notifications = ref([
  { id: 'n1', title: 'Sofía marcó "Tomates"', subtitle: 'Lista: Verdulería', time: 'hace 5 min', icon: 'mdi-check-bold', to: '/lists' },
  { id: 'n2', title: 'Juan te compartió "Farmacia"', subtitle: 'Editor agregado', time: 'hace 20 min', icon: 'mdi-account-plus', to: '/lists' },
  { id: 'n3', title: 'Vence mañana', subtitle: 'Lista: Cumple Emma', time: 'hace 1 h', icon: 'mdi-bell-alert', to: '/lists' },
])
const unreadCount = computed(() => notifications.value.length)

const userEmail = ref('')

async function handleLogout() {
  try {
    await logout()
    if (updateAuthState) updateAuthState()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    // Even if logout fails, redirect to login
    if (updateAuthState) updateAuthState()
    router.push('/login')
  }
}
</script>

<style scoped>
.border-b { 
  border-bottom: 1px solid #E5E7EB; 
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

.header-fix {
  min-height: 64px !important;
  z-index: 1002 !important;
  overflow: visible !important;
}

.header-content-fix {
  align-items: center !important;
  display: flex !important;
  flex-direction: row !important;
  min-height: 56px !important;
  height: 100%;
  width: 100%;
  overflow: visible !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

.appbar-shell{
  max-width: 1280px;
  margin: 0 auto;
  padding: 8px 16px;
  gap: 12px;
  width: 100%;
}

/* Layout: brand | nav | notif */
.appbar-shell{
  max-width: 1280px;
  margin: 0 auto;
  padding: 8px 16px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 48px;
}

/* Logo como link neutro */
.brand-link{
  display: inline-flex; align-items: center; height: 56px; padding: 0 8px;
  text-decoration: none; color: inherit;
}
.brand-link:focus, .brand-link:active { outline: none; }

.brand { letter-spacing: .2px; }

.nav-group{ display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.auth-group{ display: flex; gap: 8px; align-items: center; }

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

@media (max-width: 900px){  
  .nav-group { display: none; }
  .auth-group { gap: 4px; }
}

@media (max-width: 600px){
  .auth-group .v-btn {
    min-width: auto;
    padding: 0 8px;
  }
  .auth-group .v-btn .v-btn__prepend {
    display: none;
  }
}
</style>