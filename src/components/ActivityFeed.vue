<template>
  <section class="pa-4">
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="text-subtitle-1 font-weight-medium">Actividad reciente</div>
      <v-btn
        v-if="recentNotifications.length > 0"
        icon="mdi-bell"
        size="small"
        variant="text"
        :to="{ name: 'notifications' }"
      >
        <v-badge
          v-if="unreadCount > 0"
          :content="unreadCount"
          color="error"
        >
          <v-icon>mdi-bell</v-icon>
        </v-badge>
        <v-icon v-else>mdi-bell-outline</v-icon>
      </v-btn>
    </div>

    <!-- Empty state -->
    <div v-if="recentNotifications.length === 0" class="text-center py-6">
      <v-icon size="48" color="grey-lighten-1">mdi-bell-outline</v-icon>
      <p class="text-body-2 text-medium-emphasis mt-2">
        No hay actividad reciente
      </p>
    </div>

    <!-- Notifications timeline -->
    <v-timeline v-else density="compact" side="end" align="start">
      <v-timeline-item
        v-for="notification in recentNotifications"
        :key="notification.id"
        :dot-color="notification.color || 'primary'"
        size="small"
      >
        <div
          class="notification-item"
          :class="{ 'notification-unread': !notification.read }"
          @click="goToNotification(notification)"
        >
          <div class="d-flex ga-2 align-start">
            <v-icon :color="notification.color || 'primary'" size="20">
              {{ notification.icon || 'mdi-bell' }}
            </v-icon>
            <div style="flex: 1;">
              <div class="text-body-2">
                {{ notification.title }}
              </div>
              <div v-if="notification.subtitle" class="text-caption text-medium-emphasis">
                {{ notification.subtitle }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ formatTime(notification.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </v-timeline-item>
    </v-timeline>

    <!-- View all link -->
    <div v-if="recentNotifications.length > 0" class="text-center mt-2">
      <v-btn
        variant="text"
        size="small"
        :to="{ name: 'notifications' }"
        class="text-caption"
      >
        Ver todas las notificaciones
      </v-btn>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'

const router = useRouter()
const notificationsStore = useNotificationsStore()

// Initialize notifications
notificationsStore.init()

// Computed properties from store
const recentNotifications = computed(() => notificationsStore.recentNotifications)
const unreadCount = computed(() => notificationsStore.unreadCount)

function goToNotification(notification) {
  // Mark as read
  notificationsStore.markAsRead(notification.id)

  // Navigate to the linked resource if available
  if (notification.to) {
    router.push(notification.to)
  } else {
    // Otherwise go to notifications page
    router.push({ name: 'notifications' })
  }
}

function formatTime(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'ahora mismo'
  if (diffMins < 60) return `hace ${diffMins} min`
  if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  if (diffDays === 1) return 'ayer'
  if (diffDays < 7) return `hace ${diffDays} días`

  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
.notification-item {
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: rgba(25, 118, 210, 0.08);
}

.notification-unread {
  background-color: rgba(25, 118, 210, 0.05);
  font-weight: 500;
}
</style>
