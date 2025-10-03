<template>
  <section class="lists-carousel">
    <div class="inner">
      <!-- WRAP con fades a ambos lados -->
      <div class="hs-wrap">
        <!-- STRIP HORIZONTAL: centrado, con padding interno (oculto por los fades) -->
        <div
          ref="strip"
          class="hs"
          @mousedown="onDown"
          @mousemove="onMove"
          @mouseup="onUp"
          @mouseleave="onUp"
          @wheel.passive="onWheel"
        >
          <article v-for="list in lists" :key="list.id" class="card-item">
            <v-card class="pa-5 card list-card" elevation="2">
              <!-- Header con nombre y estado -->
              <div class="d-flex justify-space-between align-start mb-3">
                <div class="list-header">
                  <h3 class="text-h6 font-weight-bold mb-1">{{ list.name }}</h3>
                  <p class="text-body-2 text-medium-emphasis mb-2">{{ list.description }}</p>
                </div>
                <v-chip 
                  size="small" 
                  variant="tonal" 
                  color="primary" 
                  class="status-chip"
                >
                  {{ list.bought }}/{{ list.total }}
                </v-chip>
              </div>

              <!-- Progreso -->
              <div class="mb-4">
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-caption text-medium-emphasis">
                    {{ list.bought }}/{{ list.total }} comprados
                  </span>
                  <span class="text-caption font-weight-medium">
                    {{ Math.round(list.progress) }}%
                  </span>
                </div>
                <v-progress-linear
                  :model-value="list.progress"
                  height="8"
                  color="primary"
                  :track-color="primaryBg"
                  rounded
                />
              </div>

              <!-- Etiquetas -->
              <div class="mb-4" v-if="list.tags.length > 0">
                <div class="d-flex flex-wrap ga-1">
                  <v-chip
                    v-for="tag in list.tags.slice(0, 3)"
                    :key="tag"
                    size="x-small"
                    variant="outlined"
                    color="grey"
                    class="tag-chip"
                  >
                    {{ tag }}
                  </v-chip>
                  <v-chip
                    v-if="list.tags.length > 3"
                    size="x-small"
                    variant="outlined"
                    color="grey"
                    class="tag-chip"
                  >
                    +{{ list.tags.length - 3 }}
                  </v-chip>
                </div>
              </div>

              <!-- Compartido con -->
              <div class="mb-4" v-if="list.sharedWith.length > 0">
                <div class="d-flex align-center ga-2">
                  <v-icon size="small" color="primary">mdi-account-multiple</v-icon>
                  <span class="text-caption text-medium-emphasis">
                    Compartido con {{ list.sharedWith.length }} persona{{ list.sharedWith.length > 1 ? 's' : '' }}
                  </span>
                </div>
              </div>

              <!-- Footer con fecha -->
              <div class="d-flex justify-space-between align-center">
                <span class="text-caption text-medium-emphasis">
                  {{ formatDate(list.lastModified) }}
                </span>
                <v-btn
                  size="small"
                  variant="text"
                  color="primary"
                  class="btn-rounded"
                  @click="openList(list)"
                >
                  Abrir
                </v-btn>
              </div>
            </v-card>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()
const primaryBg = computed(() => theme.current.value.colors?.primaryBg || '#E9F7F0')

defineProps({
  lists: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['open-list'])

/* Drag to scroll */
const strip = ref(null)
let isDown = false, startX = 0, startLeft = 0

function onDown(e) { 
  isDown = true
  startX = e.pageX
  startLeft = strip.value.scrollLeft
  strip.value.classList.add('grabbing')
}

function onMove(e) { 
  if (!isDown) return
  strip.value.scrollLeft = startLeft - (e.pageX - startX)
}

function onUp() { 
  isDown = false
  strip.value?.classList.remove('grabbing')
}

/* rueda vertical -> scroll horizontal */
function onWheel(e) { 
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    strip.value.scrollLeft += e.deltaY
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function openList(list) {
  emit('open-list', list)
}
</script>

<style scoped>
:root {
  --card-bg: #fff;
}

/* contenedor general */
.lists-carousel {
  --card-bg: #fff;
  position: relative;
  overflow: hidden;
  padding: 0;
}

/* ancho controlado y centrado */
.inner {
  max-width: 980px;
  margin: 0 auto;
  padding: 24px 0;
}

/* ----- Fadeouts en ambos lados, sin mover el layout ----- */
.hs-wrap {
  position: relative;
  overflow: hidden;
}

.hs-wrap::before,
.hs-wrap::after {
  content: "";
  position: absolute;
  top: 0;
  height: 100%;
  width: 32px;
  z-index: 2;
  pointer-events: none;
}

.hs-wrap::before {
  left: 0;
  background: linear-gradient(to right, var(--card-bg) 0%, transparent 100%);
}

.hs-wrap::after {
  right: 0;
  background: linear-gradient(to left, var(--card-bg) 0%, transparent 100%);
}

/* ----- Strip horizontal ----- */
.hs {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  overflow-x: auto;
  overflow-y: visible;
  padding: 8px 32px;
  scroll-snap-type: x mandatory;
  scroll-padding-left: 32px;
  cursor: grab;
  scrollbar-gutter: stable both-edges;
}

.hs.grabbing { 
  cursor: grabbing; 
}

/* Tarjetas más altas y menos anchas */
.card-item {
  flex: 0 0 320px;
  scroll-snap-align: start;
}

.list-card {
  height: 100%;
  min-height: 350px;
  display: flex;
  flex-direction: column;
}

.list-header {
  flex: 1;
}

/* Chip usando variables del tema */
.status-chip {
  background-color: var(--brand-50) !important;
  color: var(--brand-700) !important;
  border: 1px solid rgba(77,168,81,.20) !important;
}

.tag-chip {
  font-size: 0.7rem !important;
}

/* Scrollbar a tono con la paleta */
.hs::-webkit-scrollbar { 
  height: 8px; 
}

.hs::-webkit-scrollbar-track { 
  background: var(--brand-50); 
  border-radius: 999px; 
}

.hs::-webkit-scrollbar-thumb { 
  background: var(--brand); 
  border-radius: 999px; 
  border: 2px solid var(--brand-50); 
}

.hs:hover::-webkit-scrollbar-thumb { 
  background: var(--brand-700); 
}

/* Mobile: tarjetas más anchas */
@media (max-width: 599px) {
  .card-item { 
    flex-basis: 85vw; 
  }
  
  .list-card {
    min-height: 240px;
  }
}
</style>
