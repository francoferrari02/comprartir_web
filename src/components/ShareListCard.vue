<template>
  <v-card class="card card--hover pa-4">
    <v-card-title class="text-h6 font-weight-bold d-flex align-center">
      <v-icon class="mr-2">mdi-share-variant</v-icon>
      Compartir lista
    </v-card-title>
    <v-card-text>
      <!-- Share by email -->
      <div class="mb-4">
        <label class="app-input-label" for="share-email">Email del usuario</label>
        <v-text-field
          id="share-email"
          v-model="email"
          prepend-inner-icon="mdi-email"
          density="comfortable"
          hide-details="auto"
          clearable
          :error-messages="emailError"
          class="app-input"
          @keyup.enter="shareWithUser"
        />
        <v-btn
          block
          color="primary"
          variant="flat"
          prepend-icon="mdi-account-plus"
          class="mt-2 btn-rounded"
          :disabled="!email || !email.trim()"
          :loading="loading"
          @click="shareWithUser"
        >
          Compartir
        </v-btn>
      </div>

      <!-- Copy link -->
      <v-btn
        block
        variant="flat"
        prepend-icon="mdi-link-variant"
        class="mb-4 btn-rounded btn-dark-outline"
        @click="copyLink"
      >
        Copiar enlace
      </v-btn>

      <!-- Shared users list -->
      <div v-if="sharedUsers && sharedUsers.length > 0">
        <v-divider class="mb-3" />
        <div class="text-subtitle-2 mb-2">
          Compartida con ({{ sharedUsers.length }})
        </div>
        <v-list density="compact" class="pa-0">
          <v-list-item
            v-for="user in sharedUsers"
            :key="user.id"
            class="px-0 mb-1"
          >
            <template #prepend>
              <v-avatar color="primary" size="32">
                <v-icon size="small">mdi-account</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title>{{ user.name || user.email }}</v-list-item-title>
            <v-list-item-subtitle class="text-caption">
              {{ user.email }}
            </v-list-item-subtitle>
            <template #append>
              <v-btn
                icon="mdi-close"
                size="x-small"
                variant="text"
                color="error"
                class="icon-btn-rounded"
                :loading="loading"
                @click="revokeAccess(user.userId)"
              />
            </template>
          </v-list-item>
        </v-list>
      </div>
      <div v-else class="text-caption text-medium-emphasis text-center py-2">
        Aún no has compartido esta lista
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  listId: {
    type: Number,
    required: true
  },
  sharedUsers: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['share', 'revoke'])

const email = ref('')
const emailError = ref('')

function shareWithUser() {
  if (!email.value || !email.value.trim()) return

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value.trim())) {
    emailError.value = 'Email inválido'
    return
  }

  emailError.value = ''
  emit('share', email.value.trim())
  email.value = ''
}

function revokeAccess(userId) {
  emit('revoke', userId)
}

function copyLink() {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    // Could emit an event to show a snackbar
    console.log('Link copiado al portapapeles')
  }).catch(err => {
    console.error('Error copiando link:', err)
  })
}
</script>

<style scoped>
/* Botones de icono redondeados */
.icon-btn-rounded {
  border-radius: 50% !important;
}

/* Campos de texto con bordes más redondeados */

</style>
