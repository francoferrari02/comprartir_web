// Demo script para probar notificaciones
// Pega esto en la consola del navegador cuando estés logueado

import { notificationService } from '@/services/notifications.service'

// Función helper para generar notificaciones de prueba
window.testNotifications = function() {
  console.log('🎯 Generando notificaciones de prueba...')

  // 1. Lista compartida
  notificationService.listShared('Compras del Supermercado', 1, 'Juan Pérez')
  console.log('✅ Notificación 1: Lista compartida')

  // 2. Despensa compartida
  setTimeout(() => {
    notificationService.pantryShared('Despensa Principal', 1, 'María García')
    console.log('✅ Notificación 2: Despensa compartida')
  }, 500)

  // 3. Item agregado a lista
  setTimeout(() => {
    notificationService.itemAdded('Leche Descremada', 'Compras Semanales', 2, 'Pedro López', 'list')
    console.log('✅ Notificación 3: Item agregado a lista')
  }, 1000)

  // 4. Item agregado a despensa
  setTimeout(() => {
    notificationService.itemAdded('Arroz Integral', 'Despensa Casa', 3, 'Ana Martínez', 'pantry')
    console.log('✅ Notificación 4: Item agregado a despensa')
  }, 1500)

  // 5. Item comprado
  setTimeout(() => {
    notificationService.itemPurchased('Pan Integral', 'Compras Semanales', 2, 'Carlos Rodríguez')
    console.log('✅ Notificación 5: Item comprado')
  }, 2000)

  // 6. Lista completada
  setTimeout(() => {
    notificationService.listCompleted('Compras del Fin de Semana', 4)
    console.log('✅ Notificación 6: Lista completada')
  }, 2500)

  // 7. Acceso revocado
  setTimeout(() => {
    notificationService.accessRevoked('Lista Privada', 'list')
    console.log('✅ Notificación 7: Acceso revocado')
  }, 3000)

  console.log('🎉 ¡7 notificaciones generadas! Revisa el icono de campana en el header')
}

console.log('💡 Para probar las notificaciones, ejecuta: testNotifications()')

