<template>
  <v-container class="py-8">
    <v-row>
      <v-col cols="12" md="8" lg="6" class="mx-auto">
        <div class="d-flex justify-space-between align-center mb-6">
          <h1 class="text-h5 font-weight-bold">Mi Perfil</h1>
          <v-btn
              color="error"
              variant="outlined"
              @click="handleLogout"
              prepend-icon="mdi-logout"
          >
            Cerrar sesión
          </v-btn>
        </div>

        <!-- Loading state -->
        <v-card v-if="loading" class="pa-6">
          <v-skeleton-loader type="article, actions"></v-skeleton-loader>
        </v-card>

        <!-- Profile data -->
        <v-card v-else-if="profile" class="pa-6 mb-4">
          <v-card-title class="text-h6 mb-4 px-0">Información personal</v-card-title>

          <v-alert
              v-if="errorMsg"
              type="error"
              variant="tonal"
              border="start"
              class="mb-4"
              closable
              @click:close="errorMsg = ''"
          >{{ errorMsg }}</v-alert>

          <v-alert
              v-if="successMsg"
              type="success"
              variant="tonal"
              border="start"
              class="mb-4"
              closable
              @click:close="successMsg = ''"
          >{{ successMsg }}</v-alert>

          <v-form ref="form" v-model="valid">
            <v-text-field
                v-model="editProfile.name"
                label="Nombre"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required, rules.maxLength(50)]"
                hide-details="auto"
                class="mb-3"
                :disabled="saving"
                prepend-inner-icon="mdi-account-outline"
            />

            <v-text-field
                v-model="editProfile.surname"
                label="Apellido"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required, rules.maxLength(50)]"
                hide-details="auto"
                class="mb-3"
                :disabled="saving"
                prepend-inner-icon="mdi-account-outline"
            />

            <v-text-field
                v-model="editProfile.email"
                label="Email"
                type="email"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="mb-4"
                disabled
                prepend-inner-icon="mdi-email-outline"
                hint="El email no se puede cambiar"
                persistent-hint
            />

            <div class="d-flex ga-2">
              <v-btn
                  variant="outlined"
                  @click="resetForm"
                  :disabled="saving || !hasChanges"
              >
                Cancelar
              </v-btn>
              <v-btn
                  color="primary"
                  variant="elevated"
                  @click="saveProfile"
                  :loading="saving"
                  :disabled="!valid || !hasChanges"
              >
                Guardar cambios
              </v-btn>
            </div>
          </v-form>
        </v-card>

        <!-- Change password section -->
        <v-card v-if="profile" class="pa-6">
          <v-card-title class="text-h6 mb-4 px-0">Cambiar contraseña</v-card-title>

          <v-alert
              v-if="passwordErrorMsg"
              type="error"
              variant="tonal"
              border="start"
              class="mb-4"
              closable
              @click:close="passwordErrorMsg = ''"
          >{{ passwordErrorMsg }}</v-alert>

          <v-alert
              v-if="passwordSuccessMsg"
              type="success"
              variant="tonal"
              border="start"
              class="mb-4"
              closable
              @click:close="passwordSuccessMsg = ''"
          >{{ passwordSuccessMsg }}</v-alert>

          <v-form ref="passwordForm" v-model="passwordValid">
            <v-text-field
                v-model="passwordData.currentPassword"
                label="Contraseña actual"
                type="password"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                hide-details="auto"
                class="mb-3"
                :disabled="changingPassword"
                prepend-inner-icon="mdi-lock-outline"
            />

            <v-text-field
                v-model="passwordData.newPassword"
                label="Nueva contraseña"
                type="password"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required, rules.password]"
                hide-details="auto"
                class="mb-3"
                :disabled="changingPassword"
                prepend-inner-icon="mdi-lock-outline"
            />

            <v-text-field
                v-model="passwordData.confirmPassword"
                label="Confirmar nueva contraseña"
                type="password"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required, rules.passwordMatch]"
                hide-details="auto"
                class="mb-4"
                :disabled="changingPassword"
                prepend-inner-icon="mdi-lock-outline"
            />

            <v-btn
                color="primary"
                variant="elevated"
                @click="handleChangePassword"
                :loading="changingPassword"
                :disabled="!passwordValid"
                block
            >
              Cambiar contraseña
            </v-btn>
          </v-form>
        </v-card>

        <!-- Error loading profile -->
        <v-alert v-else type="error" variant="tonal" border="start">
          Error al cargar el perfil.
          <v-btn variant="text" color="primary" @click="loadProfile">Reintentar</v-btn>
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { getProfile, updateProfile, changePassword, logout } from '@/services/auth.service'

const router = useRouter()
const updateAuthState = inject('updateAuthState')

// Profile data
const profile = ref(null)
const editProfile = ref({
  name: '',
  surname: '',
  email: ''
})
const loading = ref(true)
const saving = ref(false)
const valid = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const form = ref(null)

// Password change data
const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const changingPassword = ref(false)
const passwordValid = ref(false)
const passwordErrorMsg = ref('')
const passwordSuccessMsg = ref('')
const passwordForm = ref(null)

// Validation rules
const rules = {
  required: v => (!!v || v === 0) || 'Campo requerido',
  email: v => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(v) || 'Email inválido'
  },
  password: v => {
    if (!v) return 'Campo requerido'
    if (v.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
    return true
  },
  passwordMatch: v => {
    if (!v) return 'Campo requerido'
    return v === passwordData.value.newPassword || 'Las contraseñas no coinciden'
  },
  maxLength: (max) => v => {
    if (!v) return true
    return v.length <= max || `Máximo ${max} caracteres`
  }
}

// Check if profile has changes (solo nombre y apellido, NO email)
const hasChanges = computed(() => {
  if (!profile.value) return false
  return (
    editProfile.value.name !== profile.value.name ||
    editProfile.value.surname !== profile.value.surname
  )
})

// Load profile data
async function loadProfile() {
  loading.value = true
  errorMsg.value = ''

  try {
    profile.value = await getProfile()
    editProfile.value = {
      name: profile.value.name || '',
      surname: profile.value.surname || '',
      email: profile.value.email || ''
    }
  } catch (error) {
    console.error('Error loading profile:', error)
    errorMsg.value = error?.response?.data?.message || error?.message || 'Error al cargar el perfil'
  } finally {
    loading.value = false
  }
}

// Reset form to original values
function resetForm() {
  if (profile.value) {
    editProfile.value = {
      name: profile.value.name || '',
      surname: profile.value.surname || '',
      email: profile.value.email || ''
    }
  }
  errorMsg.value = ''
  successMsg.value = ''
}

// Save profile changes (solo nombre y apellido, NO email)
async function saveProfile() {
  errorMsg.value = ''
  successMsg.value = ''

  const validation = await form.value?.validate()
  if (!validation?.valid) return

  try {
    saving.value = true
    const updated = await updateProfile({
      name: editProfile.value.name.trim(),
      surname: editProfile.value.surname.trim()
      // NO enviamos email - el backend no debe permitir cambiarlo
    })

    profile.value = updated
    successMsg.value = 'Perfil actualizado exitosamente'

  } catch (error) {
    console.error('Error updating profile:', error)

    let message = 'Error al actualizar el perfil'
    if (error?.response?.status === 400) {
      message = error.response.data?.message || 'Datos inválidos'
    } else if (error?.response?.data?.message) {
      message = error.response.data.message
    } else if (error?.message) {
      message = error.message
    }

    errorMsg.value = message
  } finally {
    saving.value = false
  }
}

// Change password
async function handleChangePassword() {
  passwordErrorMsg.value = ''
  passwordSuccessMsg.value = ''

  const validation = await passwordForm.value?.validate()
  if (!validation?.valid) return

  try {
    changingPassword.value = true
    await changePassword({
      currentPassword: passwordData.value.currentPassword,
      newPassword: passwordData.value.newPassword
    })

    passwordSuccessMsg.value = '¡Contraseña cambiada exitosamente!'

    // Reset password form
    passwordData.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    passwordForm.value?.reset()

  } catch (error) {
    console.error('Error changing password:', error)

    let message = 'Error al cambiar la contraseña'
    if (error?.response?.status === 400) {
      message = 'Contraseña actual incorrecta'
    } else if (error?.response?.status === 401) {
      message = 'Contraseña actual incorrecta'
    } else if (error?.response?.data?.message) {
      message = error.response.data.message
    } else if (error?.message) {
      message = error.message
    }

    passwordErrorMsg.value = message
  } finally {
    changingPassword.value = false
  }
}

// Logout
async function handleLogout() {
  try {
    await logout()
    if (updateAuthState) updateAuthState()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    // Even if logout fails, redirect to login
    router.push('/login')
  }
}

// Load profile on mount
onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.v-card {
  border-radius: var(--radius-md, 16px);
  border: 1px solid var(--border, #E5E7EB);
}
</style>
