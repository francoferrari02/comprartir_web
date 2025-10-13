<template>
  <v-app-bar app color="white" elevation="1" height="72" density="comfortable" class="border-b header-fix">
    <div class="appbar-shell header-content-fix">
      <div class="header-brand">
        <router-link to="/" class="brand-link" aria-label="Inicio">
          <v-img :src="logoSrc" alt="Comprartir" width="52" height="52" class="brand-logo" cover />
          <span class="brand text-h6 font-weight-bold d-none d-sm-inline">Comprartir</span>
        </router-link>
      </div>

      <!-- Menú hamburguesa para móvil -->
      <v-menu v-if="isAuthenticated" location="bottom start" offset="8" class="d-lg-none">
        <template #activator="{ props }">
          <v-btn icon class="mobile-menu-btn d-lg-none" v-bind="props" aria-label="Menú">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
        </template>
        <v-card class="dropdown-menu" min-width="240">
          <v-list density="comfortable">
            <v-list-item
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              :title="link.label"
              :prepend-icon="link.icon"
              :active="isNavActive(link.to)"
            />
          </v-list>
        </v-card>
      </v-menu>

      <!-- Nav para pantallas grandes -->
      <div class="header-nav d-none d-lg-flex" v-if="isAuthenticated" role="navigation" aria-label="Secciones principales">
        <v-btn
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="nav-btn"
          :class="{ 'nav-btn--active': isNavActive(link.to) }"
          variant="text"
          height="42"
          :aria-current="isNavActive(link.to) ? 'page' : undefined"
        >
          <v-icon size="18" class="mr-2">{{ link.icon }}</v-icon>
          {{ link.label }}
        </v-btn>
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
      <div v-if="isAuthenticated" class="header-actions">
        <!-- Notificaciones: menú al pasar el mouse -->
        <v-menu open-on-hover location="bottom end" offset="8" close-on-content-click>
          <template #activator="{ props }">
            <v-btn icon class="actions-btn" aria-label="Notificaciones" v-bind="props">
              <v-icon size="22">mdi-bell-outline</v-icon>
            </v-btn>
          </template>

          <v-card class="dropdown-menu" min-width="320">
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
                    <v-avatar size="32" class="mr-3">
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
            <v-btn icon class="actions-btn" aria-label="Menú de usuario" v-bind="props">
              <v-avatar size="40">
                <v-icon size="22">mdi-account</v-icon>
              </v-avatar>
            </v-btn>
          </template>

          <v-card class="dropdown-menu" min-width="280">
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
              <v-list-item
                  title="Cambiar contraseña"
                  prepend-icon="mdi-lock-reset"
                  @click="handleChangePassword"
              />
            </v-list>
          </v-card>
        </v-menu>
      </div>
    </div>
  </v-app-bar>
</template>

<script setup>
import { ref, computed, inject, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { logout, getProfile, forgotPassword } from '@/services/auth.service'
import { useNotificationsStore } from '@/stores/notifications'
import logoSrc from '@/assets/Logo_Comprartir.png'

const router = useRouter()
const route = useRoute()
const isAuthenticated = inject('isAuthenticated')
const updateAuthState = inject('updateAuthState')

// Notifications store
const notificationsStore = useNotificationsStore()

// User info from localStorage
const userEmail = ref('')

const navLinks = [
  { to: '/', label: 'Inicio', icon: 'mdi-home-outline' },
  { to: '/lists', label: 'Listas', icon: 'mdi-view-list' },
  { to: '/pantries', label: 'Despensas', icon: 'mdi-fridge' },
  { to: '/historial', label: 'Historial', icon: 'mdi-history' }
]

// Computed
const unreadCount = computed(() => notificationsStore.unreadCount)
const notifications = computed(() => notificationsStore.recentNotifications)

const changePasswordLoading = ref(false)

const isNavActive = target => {
  const path = route?.path ?? ''
  if (target === '/') return path === '/'
  return path === target || path.startsWith(`${target}/`)
}

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

async function loadUserEmail() {
  if (!isAuthenticated?.value) {
    userEmail.value = ''
    return
  }

  try {
    const profile = await getProfile()
    userEmail.value = typeof profile?.email === 'string' ? profile.email.trim().toLowerCase() : ''
  } catch (error) {
    console.error('Error loading user email:', error)
    userEmail.value = ''
  }
}

async function handleChangePassword() {
  if (changePasswordLoading.value) return

  let normalizedEmail = userEmail.value ? userEmail.value.trim().toLowerCase() : ''

  if (!normalizedEmail) {
    try {
      const profile = await getProfile()
      normalizedEmail = typeof profile?.email === 'string' ? profile.email.trim().toLowerCase() : ''
    } catch (error) {
      console.error('Error fetching profile before change password:', error)
    }
  }

  if (!normalizedEmail) {
    router.push({ path: '/forgot-password' })
    return
  }

  changePasswordLoading.value = true

  try {
    await forgotPassword(normalizedEmail)
    router.push({
      path: '/reset-password',
      query: {
        email: normalizedEmail,
        autoSent: '1'
      }
    })
  } catch (error) {
    console.error('Error sending verification code for password change:', error)
    router.push({
      path: '/forgot-password',
      query: { email: normalizedEmail }
    })
  } finally {
    changePasswordLoading.value = false
  }
}

onMounted(() => {
  // Initialize notifications
  if (isAuthenticated.value) {
    notificationsStore.init()
  }
  loadUserEmail()
})

watch(
  () => isAuthenticated?.value,
  value => {
    if (value) {
      notificationsStore.init()
      loadUserEmail()
    } else {
      userEmail.value = ''
    }
  }
)
</script>

<style scoped>
.border-b { 
  border-bottom: 1px solid #E5E7EB; 
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

.header-fix {
  min-height: 72px !important;
  z-index: 1002 !important;
  overflow: visible !important;
}

.header-fix :deep(.v-toolbar__content) {
  padding: 0 !important;
}

.header-content-fix {
  position: relative;
  align-items: center !important;
  display: flex !important;
  flex-direction: row !important;
  min-height: 64px !important;
  height: 100%;
  width: 100%;
  overflow: visible !important;
  padding: 0 !important;
}

.appbar-shell {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 72px;
  padding: 0 20px;
}

.header-brand {
  flex-shrink: 0;
  z-index: 1;
}

.mobile-menu-btn {
  margin-left: auto;
  margin-right: 8px;
}

.header-nav {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex: 1;
  max-width: 600px;
  margin: 0 auto;
}

.header-actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  flex-shrink: 0;
}

/* Logo como link neutro */
.brand-link{
  display: inline-flex;
  align-items: center;
  height: 64px;
  padding: 0;
  text-decoration: none;
  color: inherit;
  gap: 12px;
  justify-self: start;
}
.brand-link:focus, .brand-link:active { outline: none; }

.brand-logo {
  border-radius: 12px;
  box-shadow: 0 12px 28px -18px rgba(42, 42, 68, 0.35);
}

.brand { letter-spacing: .2px; }

.nav-group{
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  justify-self: center;
}

.nav-btn {
  background: #ffffff !important;
  border: 1px solid #d9dde5 !important;
  border-radius: 999px !important;
  text-transform: none !important;
  font-weight: 600;
  color: #2a2a44 !important;
  padding: 0 20px !important;
  transition: box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
  min-width: 0 !important;
}

.nav-btn .v-icon {
  color: inherit !important;
}

.nav-btn:hover,
.nav-btn:focus-visible {
  box-shadow: 0 14px 32px -20px rgba(42, 42, 68, 0.4);
  border-color: #c7cddb !important;
}

.nav-btn--active {
  background: #2a2a44 !important;
  border-color: #2a2a44 !important;
  color: #ffffff !important;
  box-shadow: 0 18px 42px -22px rgba(42, 42, 68, 0.6);
}

.nav-btn--active .v-icon {
  color: #ffffff !important;
}

.auth-group{
  display: flex;
  gap: 8px;
  align-items: center;
  justify-self: center;
  margin-left: auto;
}

.actions-btn {
  height: 52px !important;
  width: 52px !important;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.88) !important;
  border: 1px solid rgba(217, 221, 229, 0.6) !important;
  box-shadow: 0 18px 42px -24px rgba(42, 42, 68, 0.45);
  color: #2a2a44 !important;
}

.actions-btn:hover,
.actions-btn:focus-visible {
  box-shadow: 0 24px 58px -22px rgba(42, 42, 68, 0.58);
  background: rgba(255, 255, 255, 0.98) !important;
}

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

@media (max-width: 1264px) {
  .appbar-shell {
    padding: 0 16px;
  }
}

@media (max-width: 960px) {
  .appbar-shell {
    padding: 0 12px;
    gap: 8px;
  }

  .header-brand {
    padding-left: 0;
  }

  .header-actions {
    padding-right: 0;
    gap: 8px;
  }

  .actions-btn {
    height: 44px !important;
    width: 44px !important;
  }
}

@media (max-width: 600px) {
  .brand {
    font-size: 1rem !important;
  }

  .brand-logo {
    width: 44px !important;
    height: 44px !important;
  }
}
</style>