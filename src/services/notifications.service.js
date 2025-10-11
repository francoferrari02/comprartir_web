// src/services/notifications.service.js
import { useNotificationsStore } from '@/stores/notifications'

/**
 * Servicio de notificaciones para disparar notificaciones en la app
 * Este servicio se puede llamar desde cualquier parte de la aplicación
 */

class NotificationService {
  constructor() {
    this.store = null
  }

  init() {
    if (!this.store) {
      this.store = useNotificationsStore()
      this.store.init()
    }
  }

  // Lista compartida
  listShared(listName, listId, sharedByName) {
    this.init()
    return this.store.notifyListShared({
      listName,
      listId,
      sharedBy: sharedByName
    })
  }

  // Despensa compartida
  pantryShared(pantryName, pantryId, sharedByName) {
    this.init()
    return this.store.notifyPantryShared({
      pantryName,
      pantryId,
      sharedBy: sharedByName
    })
  }

  // Item agregado a lista/despensa compartida
  itemAdded(itemName, containerName, containerId, addedByName, type = 'list') {
    this.init()
    return this.store.notifyItemAdded({
      itemName,
      [type === 'list' ? 'listName' : 'pantryName']: containerName,
      [type === 'list' ? 'listId' : 'pantryId']: containerId,
      addedBy: addedByName,
      type
    })
  }

  // Item marcado como comprado
  itemPurchased(itemName, listName, listId, purchasedByName) {
    this.init()
    return this.store.notifyItemPurchased({
      itemName,
      listName,
      listId,
      purchasedBy: purchasedByName
    })
  }

  // Lista completada
  listCompleted(listName, listId) {
    this.init()
    return this.store.notifyListCompleted({
      listName,
      listId
    })
  }

  // Acceso revocado
  accessRevoked(itemName, itemType) {
    this.init()
    return this.store.notifyAccessRevoked({
      itemName,
      itemType
    })
  }

  // Notificación genérica
  notify(notification) {
    this.init()
    return this.store.add(notification)
  }
}

export const notificationService = new NotificationService()
