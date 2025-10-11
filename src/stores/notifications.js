// src/stores/notifications.js
import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    loading: false,
    error: null,
    // Cargar desde localStorage para persistencia
    _initialized: false
  }),

  getters: {
    unreadCount: (state) => {
      return state.notifications.filter(n => !n.read).length
    },

    unreadNotifications: (state) => {
      return state.notifications.filter(n => !n.read).sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      )
    },

    allNotifications: (state) => {
      return [...state.notifications].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      )
    },

    recentNotifications: (state) => {
      return state.notifications
        .filter(n => !n.read)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    }
  },

  actions: {
    // Inicializar notificaciones desde localStorage
    init() {
      if (this._initialized) return

      try {
        const stored = localStorage.getItem('notifications')
        if (stored) {
          this.notifications = JSON.parse(stored)
          console.log('📬 Notifications loaded from storage:', this.notifications.length)
        }
        this._initialized = true
      } catch (error) {
        console.error('Error loading notifications from storage:', error)
      }
    },

    // Guardar en localStorage
    _persist() {
      try {
        localStorage.setItem('notifications', JSON.stringify(this.notifications))
      } catch (error) {
        console.error('Error saving notifications to storage:', error)
      }
    },

    // Agregar nueva notificación
    add(notification) {
      const newNotification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        read: false,
        createdAt: new Date().toISOString(),
        ...notification
      }

      this.notifications.unshift(newNotification)
      this._persist()

      console.log('📬 New notification added:', newNotification.title)

      // Limitar a 100 notificaciones
      if (this.notifications.length > 100) {
        this.notifications = this.notifications.slice(0, 100)
        this._persist()
      }

      return newNotification
    },

    // Marcar como leída
    markAsRead(notificationId) {
      const notification = this.notifications.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
        this._persist()
      }
    },

    // Marcar todas como leídas
    markAllAsRead() {
      this.notifications.forEach(n => n.read = true)
      this._persist()
    },

    // Eliminar notificación
    remove(notificationId) {
      const index = this.notifications.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        this.notifications.splice(index, 1)
        this._persist()
      }
    },

    // Limpiar todas las notificaciones leídas
    clearRead() {
      this.notifications = this.notifications.filter(n => !n.read)
      this._persist()
    },

    // Limpiar todas las notificaciones
    clearAll() {
      this.notifications = []
      this._persist()
    },

    // Tipos de notificaciones específicas

    notifyListShared(data) {
      return this.add({
        type: 'list_shared',
        title: `${data.sharedBy} te compartió una lista`,
        subtitle: `Lista: ${data.listName}`,
        message: `Ahora tienes acceso a la lista "${data.listName}"`,
        icon: 'mdi-share-variant',
        color: 'primary',
        to: `/lists/${data.listId}`,
        actionText: 'Ver lista',
        metadata: data
      })
    },

    notifyPantryShared(data) {
      return this.add({
        type: 'pantry_shared',
        title: `${data.sharedBy} te compartió una despensa`,
        subtitle: `Despensa: ${data.pantryName}`,
        message: `Ahora tienes acceso a la despensa "${data.pantryName}"`,
        icon: 'mdi-fridge',
        color: 'success',
        to: `/pantries/${data.pantryId}`,
        actionText: 'Ver despensa',
        metadata: data
      })
    },

    notifyItemAdded(data) {
      return this.add({
        type: 'item_added',
        title: `${data.addedBy} agregó un producto`,
        subtitle: `${data.itemName} en ${data.listName || data.pantryName}`,
        message: `Se agregó "${data.itemName}" a ${data.type === 'list' ? 'la lista' : 'la despensa'} compartida`,
        icon: 'mdi-plus-circle',
        color: 'info',
        to: data.type === 'list' ? `/lists/${data.listId}` : `/pantries/${data.pantryId}`,
        actionText: 'Ver',
        metadata: data
      })
    },

    notifyItemPurchased(data) {
      return this.add({
        type: 'item_purchased',
        title: `${data.purchasedBy} marcó un producto`,
        subtitle: `${data.itemName} en ${data.listName}`,
        message: `"${data.itemName}" fue marcado como comprado`,
        icon: 'mdi-check-bold',
        color: 'success',
        to: `/lists/${data.listId}`,
        actionText: 'Ver lista',
        metadata: data
      })
    },

    notifyListCompleted(data) {
      return this.add({
        type: 'list_completed',
        title: 'Lista completada',
        subtitle: `${data.listName}`,
        message: `Todos los productos de "${data.listName}" han sido comprados`,
        icon: 'mdi-check-all',
        color: 'success',
        to: `/lists/${data.listId}`,
        actionText: 'Ver lista',
        metadata: data
      })
    },

    notifyAccessRevoked(data) {
      return this.add({
        type: 'access_revoked',
        title: 'Acceso revocado',
        subtitle: `${data.itemType}: ${data.itemName}`,
        message: `Ya no tienes acceso a ${data.itemType === 'list' ? 'la lista' : 'la despensa'} "${data.itemName}"`,
        icon: 'mdi-lock',
        color: 'warning',
        metadata: data
      })
    }
  }
})

