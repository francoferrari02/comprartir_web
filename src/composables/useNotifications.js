// src/composables/useNotifications.js
import { watch, onMounted } from 'vue'
import { notificationService } from '@/services/notifications.service'

/**
 * Composable para manejar notificaciones automáticas
 * Úsalo en componentes donde ocurran acciones importantes
 */
export function useNotifications() {
  return {
    // Disparar notificación cuando se comparte una lista
    notifyListShared(listName, listId, sharedByName) {
      return notificationService.listShared(listName, listId, sharedByName)
    },

    // Disparar notificación cuando se comparte una despensa
    notifyPantryShared(pantryName, pantryId, sharedByName) {
      return notificationService.pantryShared(pantryName, pantryId, sharedByName)
    },

    // Disparar notificación cuando se agrega un item
    notifyItemAdded(itemName, containerName, containerId, addedByName, type = 'list') {
      return notificationService.itemAdded(itemName, containerName, containerId, addedByName, type)
    },

    // Disparar notificación cuando se marca un item como comprado
    notifyItemPurchased(itemName, listName, listId, purchasedByName) {
      return notificationService.itemPurchased(itemName, listName, listId, purchasedByName)
    },

    // Disparar notificación cuando se completa una lista
    notifyListCompleted(listName, listId) {
      return notificationService.listCompleted(listName, listId)
    },

    // Disparar notificación cuando se revoca acceso
    notifyAccessRevoked(itemName, itemType) {
      return notificationService.accessRevoked(itemName, itemType)
    },

    // Notificación genérica
    notify(notification) {
      return notificationService.notify(notification)
    }
  }
}

