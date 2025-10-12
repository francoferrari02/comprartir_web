<template>
  <section class="pantries-carousel">
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
          <article v-for="pantry in pantries" :key="pantry.id" class="card-item">
            <PantryItem
              :id="pantry.id"
              :name="pantry.name"
              :total-items="pantry.totalItems"
              :shared-with="pantry.sharedWith || []"
              @delete="$emit('delete-pantry', pantry)"
              @edit="$emit('edit-pantry', pantry)"
            />
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'
import PantryItem from './PantryItem.vue'

const theme = useTheme()
const primaryBg = computed(() => theme.current.value.colors?.primaryBg || '#E9F7F0')

defineProps({
  pantries: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['delete-pantry', 'edit-pantry'])

/* Drag to scroll */
const strip = ref(null)
let isDown = false, startX = 0, startLeft = 0, hasMoved = false

function onDown(e) {
  isDown = true
  startX = e.pageX
  startLeft = strip.value.scrollLeft
  hasMoved = false // Resetear el flag de movimiento
  strip.value.classList.add('grabbing')
}

function onMove(e) {
  if (!isDown) return
  const distance = Math.abs(e.pageX - startX)
  if (distance > 5) { // Solo considerar como drag si se mueve más de 5px
    hasMoved = true
    strip.value.scrollLeft = startLeft - (e.pageX - startX)
  }
}

function onUp(e) {
  isDown = false
  strip.value?.classList.remove('grabbing')

  // Si se movió, prevenir clics en los elementos hijos
  if (hasMoved) {
    e.preventDefault()
    e.stopPropagation()
  }

  hasMoved = false
}

/* rueda vertical -> scroll horizontal */
function onWheel(e) {
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    strip.value.scrollLeft += e.deltaY
  }
}
</script>

<style scoped>
:root {
  --card-bg: #fff;
}

/* contenedor general */
.pantries-carousel {
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
</style>
