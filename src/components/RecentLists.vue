<!-- src/components/RecentLists.vue -->
<template>
  <section class="lists-section card">
    <div class="inner">
      <div class="d-flex align-center justify-space-between section-head">
        <div class="text-subtitle-1 font-weight-bold px-10">Tus listas recientes</div>
        <v-btn variant="text" class="btn-rounded pe-10" size="small" to="/listas">Ver todas</v-btn>

      </div>

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
          <article v-for="it in items" :key="it.name" class="card-item">
            <v-card class="pa-4 card">
              <div class="d-flex justify-space-between align-start mb-1">
                <div class="text-subtitle-1 font-weight-medium">{{ it.name }}</div>
                <v-chip size="small" variant="tonal" color="primary" class="status-chip">
                  {{ it.bought }}/{{ it.total }}
                </v-chip>
              </div>

              <div class="text-caption text-medium-emphasis mb-2">
                {{ it.bought }}/{{ it.total }} comprados
              </div>

              <v-progress-linear
                  :model-value="pct(it)"
                  height="6"
                  color="primary"
                  :track-color="primaryBg"
                  rounded
                  class="mb-3"
              />
            </v-card>
            <div class="section-footer"></div>
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

// DEMO: cambiá por tus datos
const items = [
  { name: 'Supermercado - Semana', bought: 3, total: 8 },
  { name: 'Verdulería',            bought: 2, total: 5 },
  { name: 'Farmacia',              bought: 1, total: 3 },
  { name: 'Cumple Emma',           bought: 4, total: 7 },
  { name: 'Ferretería',            bought: 0, total: 4 },
]
const pct = (it) => Math.round((it.bought / it.total) * 100)

/* Drag to scroll */
const strip = ref(null)
let isDown = false, startX = 0, startLeft = 0
function onDown(e){ isDown = true; startX = e.pageX; startLeft = strip.value.scrollLeft; strip.value.classList.add('grabbing') }
function onMove(e){ if(!isDown) return; strip.value.scrollLeft = startLeft - (e.pageX - startX) }
function onUp(){ isDown = false; strip.value?.classList.remove('grabbing') }
/* rueda vertical -> scroll horizontal */
function onWheel(e){ if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) strip.value.scrollLeft += e.deltaY }
</script>

<style scoped>
:root{
  --card-bg: #fff; /* Ajustá si tu card usa otro fondo */
}

/* contenedor general (card) */
.lists-section{
  --card-bg: #fff; /* Mueve la variable aquí para asegurar su alcance */
  position: relative;
  overflow: hidden;       /* recorta los fades dentro del card */
  padding: 0;
}

/* ancho controlado y centrado */
.inner{
  max-width: 980px;       /* “más chico y del medio” */
  margin: 0 auto;
  padding: 24px 0;        /* sin padding lateral extra aquí */
}

.section-head{ padding: 0 0 16px 0; }
.section-footer{ padding: 16px 0 0 0; }

/* ----- Fadeouts en ambos lados, sin mover el layout ----- */
.hs-wrap{
  position: relative;
  overflow: hidden;       /* limita visualmente los fades */
}
.hs-wrap::before,
.hs-wrap::after{
  content: "";
  position: absolute;
  top: 0;
  height: 100%;
  width: 28px;            /* ancho del fade; ajustá 24–40 a gusto */
  z-index: 2;
  pointer-events: none;
}
.hs-wrap::before{
  left: 0;
  background: linear-gradient(to right, var(--card-bg) 0%, transparent 100%);
}
.hs-wrap::after{
  right: 0;
  background: linear-gradient(to left, var(--card-bg) 0%, transparent 100%);
}

/* ----- Strip horizontal ----- */
.hs{
  display: flex;
  align-items: flex-start;
  gap: 16px;              /* compacto */
  overflow-x: auto;
  overflow-y: visible;
  padding: 8px 28px;        /* separación REAL con los bordes; queda OCULTA por el fade */
  scroll-snap-type: x mandatory;
  scroll-padding-left:28px;  /* el snap respeta el padding inicial */
  cursor: grab;
  scrollbar-gutter: stable both-edges;
}
.hs.grabbing { cursor: grabbing; }

/* Tarjetas más angostas: deja el 3er ítem “cortado” */
.card-item{
  flex: 0 0 300px;
  scroll-snap-align: start;
}

/* Scrollbar a tono con tu paleta */
.hs::-webkit-scrollbar { height: 8px; }
.hs::-webkit-scrollbar-track { background: var(--brand-50); border-radius: 999px; }
.hs::-webkit-scrollbar-thumb { background: var(--brand); border-radius: 999px; border: 2px solid var(--brand-50); }
.hs:hover::-webkit-scrollbar-thumb { background: var(--brand-700); }

/* Chip en #4DA851 */
.status-chip{
  background-color: var(--brand-50) !important;
  color: var(--brand-700) !important;
  border: 1px solid rgba(77,168,81,.20) !important;
}

/* Mobile: mantené el “peek” */
@media (max-width: 599px){
  .card-item{ flex-basis: 80vw; }
}
</style>
