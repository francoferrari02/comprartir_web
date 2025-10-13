<template>
  <v-container fluid class="py-8 bg-surface">
    <div class="view-shell">
      <AppBreadcrumbs :items="breadcrumbs" />

      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="text-h4 font-weight-bold mb-2">Notificaciones</h1>
          <p class="text-body-2 text-medium-emphasis">
            Mantente al día con las actualizaciones de tus listas y despensas
          </p>
        </div>

        <!-- Actions -->
        <div class="d-flex gap-2">
          <v-btn
            v-if="unreadCount > 0"
            variant="tonal"
            color="primary"
            prepend-icon="mdi-check-all"
            @click="markAllAsRead"
          >
            Marcar todas como leídas
          </v-btn>
          <v-menu>
            <template #activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                variant="text"
                v-bind="props"
              />
            </template>
            <v-list density="compact">
              <v-list-item
                prepend-icon="mdi-broom"
                title="Limpiar leídas"
                @click="clearRead"
              />
              <v-list-item
                prepend-icon="mdi-delete-outline"
                title="Eliminar todas"
                @click="confirmClearAll"
              />
            </v-list>
          </v-menu>
        </div>
      </div>

      <!-- Filters -->
      <v-card class="card mb-4">
        <v-card-text class="pa-4">
          <v-chip-group
            v-model="selectedFilter"
            mandatory
            selected-class="text-primary"
          >
            <v-chip value="all" variant="outlined">
              Todas ({{ allNotifications.length }})
            </v-chip>
            <v-chip value="unread" variant="outlined">
              No leídas ({{ unreadCount }})
            </v-chip>
            <v-chip value="list_shared" variant="outlined">
              <v-icon start>mdi-share-variant</v-icon>
              Listas compartidas
            </v-chip>
            <v-chip value="pantry_shared" variant="outlined">
              <v-icon start>mdi-fridge</v-icon>
              Despensas compartidas
            </v-chip>
            <v-chip value="item_added" variant="outlined">
              <v-icon start>mdi-plus-circle</v-icon>
              Items agregados
            </v-chip>
          </v-chip-group>
        </v-card-text>
      </v-card>

      <!-- Empty State -->
      <div v-if="filteredNotifications.length === 0" class="text-center py-16">
        <v-icon size="80" color="grey-lighten-1" class="mb-4">
          mdi-bell-outline
        </v-icon>
        <h2 class="text-h5 mb-2">No hay notificaciones</h2>
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ selectedFilter === 'all' ? 'No tienes notificaciones aún' : 'No hay notificaciones de este tipo' }}
        </p>
      </div>

      <!-- Notifications List -->
      <v-card v-else class="card">
        <v-list lines="three" class="pa-0">
          <template v-for="(notification, index) in filteredNotifications" :key="notification.id">
            <v-list-item
              :class="{ 'bg-blue-lighten-5': !notification.read }"
              @click="handleNotificationClick(notification)"
            >
              <template #prepend>
                <v-avatar
                  size="40"
                  :color="notification.color || 'primary'"
                  variant="tonal"
                  class="mr-3"
                >
                  <v-icon :icon="notification.icon || 'mdi-bell'" />
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-medium mb-1">
                {{ notification.title }}
                <v-chip
                  v-if="!notification.read"
                  size="x-small"
                  color="primary"
                  class="ml-2"
                >
                  Nuevo
                </v-chip>
              </v-list-item-title>

              <v-list-item-subtitle class="mb-1">
                {{ notification.subtitle }}
              </v-list-item-subtitle>

              <v-list-item-subtitle v-if="notification.message" class="text-caption">
                {{ notification.message }}
              </v-list-item-subtitle>

              <template #append>
                <div class="d-flex flex-column align-end gap-2">
                  <span class="text-caption text-medium-emphasis">
                    {{ formatTime(notification.createdAt) }}
                  </span>

                  <div class="d-flex gap-1">
                    <v-btn
                      v-if="notification.to"
                      icon="mdi-open-in-new"
                      size="x-small"
                      variant="text"
                      @click.stop="goToNotificationTarget(notification)"
                    >
                      <v-tooltip activator="parent" location="top">
                        {{ notification.actionText || 'Abrir' }}
                      </v-tooltip>
                    </v-btn>

                    <v-btn
                      v-if="!notification.read"
                      icon="mdi-check"
                      size="x-small"
                      variant="text"
                      color="success"
                      @click.stop="markAsRead(notification.id)"
                    >
                      <v-tooltip activator="parent" location="top">
                        Marcar como leída
                      </v-tooltip>
                    </v-btn>

                    <v-btn
                      icon="mdi-delete-outline"
                      size="x-small"
                      variant="text"
                      color="error"
                      @click.stop="removeNotification(notification.id)"
                    >
                      <v-tooltip activator="parent" location="top">
                        Eliminar
                      </v-tooltip>
                    </v-btn>
                  </div>
                </div>
              </template>
            </v-list-item>

            <v-divider v-if="index < filteredNotifications.length - 1" />
          </template>
        </v-list>
      </v-card>

      <!-- Confirm Delete All Dialog -->
      <v-dialog v-model="confirmDialog" max-width="400">
        <v-card>
          <v-card-title class="pa-4">
            Eliminar todas las notificaciones
          </v-card-title>
          <v-card-text class="pa-4">
            ¿Estás seguro de que deseas eliminar todas las notificaciones? Esta acción no se puede deshacer.
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn variant="text" @click="confirmDialog = false">
              Cancelar
            </v-btn>
            <v-btn color="error" variant="flat" @click="clearAll">
              Eliminar todas
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Snackbar -->
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="3000"
      >
        {{ snackbar.message }}
      </v-snackbar>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'
import AppBreadcrumbs from '@/components/AppBreadcrumbs.vue'

const router = useRouter()
const notificationsStore = useNotificationsStore()

// State
const selectedFilter = ref('all')
const confirmDialog = ref(false)
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const breadcrumbs = computed(() => [
  { title: 'Inicio', to: { name: 'home' } },
  { title: 'Notificaciones' }
])

// Computed
const allNotifications = computed(() => notificationsStore.allNotifications)
const unreadCount = computed(() => notificationsStore.unreadCount)

const filteredNotifications = computed(() => {
  if (selectedFilter.value === 'all') {
    return allNotifications.value
  } else if (selectedFilter.value === 'unread') {
    return notificationsStore.unreadNotifications
  } else {
    return allNotifications.value.filter(n => n.type === selectedFilter.value)
  }
})

// Methods
function handleNotificationClick(notification) {
  if (!notification.read) {
    notificationsStore.markAsRead(notification.id)
  }

  if (notification.to) {
    router.push(notification.to)
  }
}

function goToNotificationTarget(notification) {
  if (notification.to) {
    if (!notification.read) {
      notificationsStore.markAsRead(notification.id)
    }
    router.push(notification.to)
  }
}

function markAsRead(notificationId) {
  notificationsStore.markAsRead(notificationId)
  showSnackbar('Notificación marcada como leída')
}

function markAllAsRead() {
  notificationsStore.markAllAsRead()
  showSnackbar('Todas las notificaciones marcadas como leídas')
}

function removeNotification(notificationId) {
  notificationsStore.remove(notificationId)
  showSnackbar('Notificación eliminada')
}

function clearRead() {
  notificationsStore.clearRead()
  showSnackbar('Notificaciones leídas eliminadas')
}

function confirmClearAll() {
  confirmDialog.value = true
}

function clearAll() {
  notificationsStore.clearAll()
  confirmDialog.value = false
  showSnackbar('Todas las notificaciones eliminadas')
}

function formatTime(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours} h`
  if (diffDays < 7) return `Hace ${diffDays} días`

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

function showSnackbar(message, color = 'success') {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

// Lifecycle
onMounted(() => {
  notificationsStore.init()
})
</script>

<style scoped>
.card {
  border-radius: 12px;
  overflow: hidden;
}

.gap-2 {
  gap: 8px;
}
</style>
