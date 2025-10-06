<!-- src/components/RecentLists.vue -->
<template>
  <section class="lists-section card">
    <div class="inner">
      <div class="d-flex align-center justify-space-between section-head">
        <div class="text-subtitle-1 font-weight-bold px-10">Tus listas recientes</div>
        <v-btn variant="text" class="btn-rounded pe-10" size="small" to="/lists">Ver todas</v-btn>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="40" />
      </div>

      <!-- Empty state -->
      <div v-else-if="items.length === 0" class="text-center py-8 px-4">
        <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-clipboard-list-outline</v-icon>
        <p class="text-body-2 text-medium-emphasis">No hay listas recientes</p>
      </div>

      <!-- WRAP con fades a ambos lados -->
      <div v-else class="hs-wrap">
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
          <article v-for="it in items" :key="it.id" class="card-item" @click="goToList(it.id)">
            <v-card class="pa-4 card" style="cursor: pointer;">
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
import { ref, computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useRouter } from 'vue-router'
import { getShoppingLists, getListItems } from '@/services/lists'

const theme = useTheme()
const router = useRouter()
const primaryBg = computed(() => theme.current.value.colors?.primaryBg || '#E9F7F0')

const items = ref([])
const loading = ref(false)

const pct = (it) => it.total > 0 ? Math.round((it.bought / it.total) * 100) : 0

// Fetch recent lists (created in last 7 days)
async function fetchRecentLists() {
  loading.value = true
  try {
    // Get lists sorted by creation date (most recent first)
    const response = await getShoppingLists({
      sort_by: 'createdAt',
      order: 'DESC',
      per_page: 10
    })

    const lists = response.data || []

    // Filter lists created in the last 7 days
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const recentLists = lists.filter(list => {
      const createdDate = new Date(list.createdAt)
      return createdDate >= oneWeekAgo
    })

    // Fetch item counts for each list
    const listsWithCounts = await Promise.all(
      recentLists.map(async (list) => {
        try {
          const itemsResponse = await getListItems(list.id, { per_page: 1000 })
          const listItems = itemsResponse.data || []
          const bought = listItems.filter(item => item.purchased).length
          const total = listItems.length

          return {
            id: list.id,
            name: list.name,
            bought,
            total,
            createdAt: list.createdAt
          }
        } catch (err) {
          console.error(`Error fetching items for list ${list.id}:`, err)
          return {
            id: list.id,
            name: list.name,
            bought: 0,
            total: 0,
            createdAt: list.createdAt
          }
        }
      })
    )

    items.value = listsWithCounts
  } catch (err) {
    console.error('Error fetching recent lists:', err)
    items.value = []
  } finally {
    loading.value = false
  }
}

function goToList(id) {
  router.push(`/lists/${id}`)
}

/* Drag to scroll */
const strip = ref(null)
let isDown = false, startX = 0, startLeft = 0
function onDown(e){ isDown = true; startX = e.pageX; startLeft = strip.value.scrollLeft; strip.value.classList.add('grabbing') }
function onMove(e){ if(!isDown) return; strip.value.scrollLeft = startLeft - (e.pageX - startX) }
function onUp(){ isDown = false; strip.value?.classList.remove('grabbing') }
/* rueda vertical -> scroll horizontal */
function onWheel(e){ if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) strip.value.scrollLeft += e.deltaY }

onMounted(() => {
  fetchRecentLists()
})
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
