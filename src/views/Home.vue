<template>
  <v-container fluid class="py-8 bg-surface">
    <!-- Pantalla de bienvenida para usuarios no autenticados -->
    <div v-if="!isAuthenticated" class="shell">
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <v-card class="card pa-8 text-center">
            <v-img :src="logo" class="mx-auto mb-6" max-width="200" />
            <h1 class="text-h4 font-weight-bold mb-4">Bienvenido a Comprartir</h1>
            <p class="text-h6 text-medium-emphasis mb-6">
              Organizá y compartí tus listas de compras con amigos y familiares.
            </p>

            <div class="mt-8">
              <v-row>
                <v-col cols="12" md="4">
                  <v-icon color="primary" size="48">mdi-view-list</v-icon>
                  <h3 class="text-h6 mt-3 mb-2">Crea listas</h3>
                  <p class="text-body-2">Organiza tus compras en listas fáciles de usar</p>
                </v-col>
                <v-col cols="12" md="4">
                  <v-icon color="primary" size="48">mdi-share</v-icon>
                  <h3 class="text-h6 mt-3 mb-2">Comparte</h3>
                  <p class="text-body-2">Colabora con familia y amigos en tiempo real</p>
                </v-col>
                <v-col cols="12" md="4">
                  <v-icon color="primary" size="48">mdi-check-circle</v-icon>
                  <h3 class="text-h6 mt-3 mb-2">Controla</h3>
                  <p class="text-body-2">Marca productos como comprados y lleva el control</p>
                </v-col>
              </v-row>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Dashboard para usuarios autenticados -->
    <div v-if="isAuthenticated" class="shell">
      <v-row>
        <!-- COLUMNA IZQUIERDA (principal) -->
        <v-col cols="12" md="8" class="left-col">
          <!-- Hero -->
          <v-card class="card card--hover pa-7 mb-4 hero-card">
            <div class="d-flex align-center ga-6">
              <v-img :src="logo" class="rounded-lg hero-logo" />
              <div>
                <h1 class="text-h5 font-weight-bold mb-2">Bienvenido a Comprartir</h1>
                <p class="text-body-2 text-medium-emphasis mb-4">
                  Organizá y compartí tus listas de compras con amigos y familiares.
                </p>
                <div class="d-flex ga-3">
                  <v-btn color="primary" prepend-icon="mdi-plus" class="btn-rounded" @click="openCreateDialog">
                    Nueva lista
                  </v-btn>
                  <v-btn variant="outlined" class="btn-rounded" :to="{ name: 'lists' }">Ver todas</v-btn>
                </div>
              </div>
            </div>
          </v-card>

          <!-- Listas recientes -->
          <RecentLists mode="cards"  class="card card--hover mb-4" />

        </v-col>

        <!-- COLUMNA DERECHA (sidebar) -->
        <v-col cols="12" md="4" class="right-col">
          <SharedWithMe class="card card--hover mb-4" />
          <ActivityFeed class="card card--hover mb-4" />
        </v-col>
      </v-row>

      <!-- Create List Dialog -->
      <v-dialog v-model="createDialog" max-width="600">
        <v-card>
          <v-card-title class="text-h5 pa-4">
            Nueva Lista de Compras
          </v-card-title>
          <v-card-text class="pa-4">
            <v-text-field
                v-model="newList.name"
                label="Nombre de la lista"
                variant="outlined"
                density="comfortable"
                :error-messages="newListErrors.name"
                autofocus
                @keyup.enter="createList"
            />
            <v-textarea
                v-model="newList.description"
                label="Descripción (opcional)"
                variant="outlined"
                density="comfortable"
                rows="3"
            />
            <v-checkbox
                v-model="newList.recurring"
                label="Lista recurrente"
                hint="Las listas recurrentes se pueden reutilizar después de comprarlas"
                persistent-hint
            />
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
                variant="text"
                class="btn-rounded"
                @click="createDialog = false"
            >
              Cancelar
            </v-btn>
            <v-btn
                color="primary"
                variant="flat"
                class="btn-rounded"
                :loading="creating"
                @click="createList"
            >
              Crear
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Success Snackbar -->
      <v-snackbar
          v-model="snackbar.show"
          :color="snackbar.color"
          :timeout="3000"
      >
        {{ snackbar.message }}
        <template #actions>
          <v-btn
              icon="mdi-close"
              size="small"
              @click="snackbar.show = false"
          />
        </template>
      </v-snackbar>

      <!-- Error Alert -->
      <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          closable
          class="mb-4"
          @click:close="error = null"
      >
        {{ error }}
      </v-alert>
    </div>
  </v-container>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { isLoggedIn } from '@/services/auth.service'
import { createShoppingList } from '@/services/lists'
import RecentLists from '@/components/RecentLists.vue'
import SharedWithMe from '@/components/SharedWithMe.vue'
import ActivityFeed from '@/components/ActivityFeed.vue'
import logo from '@/assets/Logo_Comprartir.png'

const router = useRouter()
// Usar el estado global de autenticación desde App.vue
const isAuthenticated = inject('isAuthenticated', ref(false))
const createDialog = ref(false)
const creating = ref(false)
const error = ref(null)

// New list form
const newList = ref({
  name: '',
  description: '',
  recurring: false
})

const newListErrors = ref({
  name: []
})

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Verificar autenticación al cargar
onMounted(() => {
  // Forzar actualización del estado de autenticación
  isAuthenticated.value = isLoggedIn()
  console.log('🔐 Home - isAuthenticated:', isAuthenticated.value, 'token:', localStorage.getItem('accessToken'))
})

function openCreateDialog() {
  newList.value = {
    name: '',
    description: '',
    recurring: false
  }
  newListErrors.value = { name: [] }
  createDialog.value = true
}

async function createList() {
  // Validate
  newListErrors.value = { name: [] }
  if (!newList.value.name.trim()) {
    newListErrors.value.name = ['El nombre es requerido']
    return
  }

  creating.value = true
  error.value = null

  try {
    console.log('🔄 Creating list with data:', {
      name: newList.value.name.trim(),
      description: newList.value.description.trim(),
      recurring: newList.value.recurring
    })

    const created = await createShoppingList({
      name: newList.value.name.trim(),
      description: newList.value.description.trim(),
      recurring: newList.value.recurring
    })

    console.log('✅ List created successfully:', created)

    createDialog.value = false
    showSnackbar('Lista creada exitosamente', 'success')

    // Navigate to the new list
    router.push(`/lists/${created.id}`)
  } catch (err) {
    console.error('❌ Error creating list:', err)

    let errorMessage = 'Error al crear la lista'

    if (typeof err === 'object' && err !== null) {
      if (err.message) {
        errorMessage = err.message
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      }
    } else if (typeof err === 'string') {
      errorMessage = err
    }

    error.value = errorMessage
    showSnackbar(errorMessage, 'error')
  } finally {
    creating.value = false
  }
}

function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}
</script>

<style scoped>
.shell { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
.left-col { min-width: 0; padding-right: 24px; }
.right-col { min-width: 280px; }
.hero-card { overflow: visible; }
.hero-logo { max-width: 172px; }

@media (min-width: 960px) {
  .right-col { position: sticky; top: 88px; }
}
</style>