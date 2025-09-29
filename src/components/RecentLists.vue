<template>
  <!-- Sección de listas recientes con carrusel -->
  <div>
    <div class="text-subtitle-1 mb-2 font-weight-medium">Tus listas recientes</div>
    <v-carousel
      height="220"
      show-arrows="hover"
      hide-delimiter-background
      class="rounded elevation-1"
      :continuous="false"
      cycle
    >
      <v-carousel-item v-for="(slide, i) in slides" :key="i">
        <div class="d-flex flex-row flex-nowrap overflow-hidden ga-4 px-4 py-2" style="width: 100%">
          <ListItem v-for="item in slide" :key="item.name" v-bind="item" />
        </div>
      </v-carousel-item>
    </v-carousel>
  </div>
</template>

<script setup>
// Carrusel que agrupa elementos de listas recientes
// Ajusta cantidad por slide según breakpoint para evitar desbordes
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import ListItem from './ListItem.vue'

const items = [
  { name: 'Supermercado - Semana', bought: 3, total: 8 },
  { name: 'Verdulería', bought: 2, total: 5 },
  { name: 'Farmacia', bought: 1, total: 3 },
  { name: 'Limpieza', bought: 4, total: 7 },
  { name: 'Carnicería', bought: 0, total: 4 },
  { name: 'Fiesta Sábado', bought: 5, total: 9 },
]

const display = useDisplay()

// Determina cantidad de tarjetas por slide según tamaño de pantalla
const itemsPerSlide = computed(() => {
  if (display.xs.value) return 1
  if (display.sm.value) return 2
  if (display.md.value) return 2
  return 3 // lg y xl
})

// Agrupa en "slides" de tamaño dinámico
const slides = computed(() => {
  const size = itemsPerSlide.value
  const res = []
  for (let i = 0; i < items.length; i += size) {
    res.push(items.slice(i, i + size))
  }
  return res
})
</script>

<style scoped>
/* Limitar la altura para no invadir la columna derecha (controlado por prop height) */
</style>
