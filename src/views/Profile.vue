<template>
  <v-container class="py-10 profile-view">
    <v-row>
      <v-col cols="12" md="11" lg="10" class="mx-auto">
        <h1 class="text-h4 text-md-h4 font-weight-bold mb-6">Mi Perfil</h1>

        <v-card v-if="loading" class="profile-card">
          <div class="profile-card__body">
            <v-skeleton-loader type="image, article"></v-skeleton-loader>
          </div>
        </v-card>

        <v-card v-else-if="profile" class="profile-card">
          <div class="profile-card__body">
            <div class="profile-card__header">
              <div class="profile-card__meta">
                <span class="overline text-medium-emphasis">Información personal</span>
                <h2 class="text-h5 font-weight-bold mb-0">Detalles de tu cuenta</h2>
              </div>
              <div class="profile-card__actions">
                <v-btn
                  v-if="!isEditing"
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-pencil"
                  class="edit-btn"
                  @click="startEditing"
                >
                  Editar
                </v-btn>
                <div v-else class="edit-actions">
                  <v-btn
                    variant="text"
                    class="cancel-btn"
                    @click="cancelEditing"
                    :disabled="saving"
                  >
                    Cancelar
                  </v-btn>
                  <v-btn
                    color="primary"
                    variant="elevated"
                    prepend-icon="mdi-content-save-outline"
                    class="save-btn"
                    @click="saveProfile"
                    :loading="saving"
                    :disabled="!valid || !hasChanges || saving"
                  >
                    Guardar cambios
                  </v-btn>
                </div>
              </div>
            </div>

            <div class="profile-layout">
            <div class="profile-avatar">
              <div class="avatar-wrapper">
                <v-avatar size="132" class="avatar-image" color="primary" variant="tonal">
                  <img v-if="avatarPreview" :src="avatarPreview" alt="Foto de perfil" class="avatar-img" />
                  <v-icon v-else size="64" color="primary-darken-1">mdi-account-circle</v-icon>
                </v-avatar>

                <v-btn
                  class="avatar-change-btn"
                  size="small"
                  color="primary"
                  variant="elevated"
                  prepend-icon="mdi-camera"
                  :disabled="!isEditing"
                  @click="triggerAvatarUpload"
                >
                  Cambiar foto
                </v-btn>
                <input
                  ref="avatarInput"
                  class="d-none"
                  type="file"
                  accept="image/*"
                  @change="onAvatarSelected"
                >
              </div>

              <button
                type="button"
                class="avatar-remove"
                :disabled="!isEditing || !avatarPreview"
                @click="handleRemovePhoto"
              >
                Quitar foto
              </button>
            </div>

            <div class="profile-form">
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

              <v-form ref="form" v-model="valid" class="profile-form__fields">
                <div class="field-group">
                  <label class="field-label" for="profile-name">Nombre</label>
                  <v-text-field
                    id="profile-name"
                    v-model="editProfile.name"
                    placeholder="Tu nombre"
                    variant="solo"
                    density="comfortable"
                    hide-details="auto"
                    :rules="[rules.required, rules.maxLength(50)]"
                    :disabled="!isEditing || saving"
                    class="field-input"
                  />
                </div>

                <div class="field-group">
                  <label class="field-label" for="profile-surname">Apellido</label>
                  <v-text-field
                    id="profile-surname"
                    v-model="editProfile.surname"
                    placeholder="Tu apellido"
                    variant="solo"
                    density="comfortable"
                    hide-details="auto"
                    :rules="[rules.maxLength(50)]"
                    :disabled="!isEditing || saving"
                    class="field-input"
                  />
                </div>

                <div class="field-group">
                  <label class="field-label" for="profile-email">Email</label>
                  <v-text-field
                    id="profile-email"
                    v-model="editProfile.email"
                    placeholder="tu@correo.com"
                    type="email"
                    variant="solo"
                    density="comfortable"
                    hide-details="auto"
                    :disabled="true"
                    class="field-input"
                    hint="No es posible cambiar el email desde esta pantalla"
                    persistent-hint
                  />
                </div>

                <div class="field-group">
                  <label class="field-label" for="profile-language">Idioma</label>
                  <v-select
                    id="profile-language"
                    v-model="editProfile.language"
                    :items="languageOptions"
                    item-title="label"
                    item-value="value"
                    placeholder="Seleccioná un idioma"
                    variant="solo"
                    density="comfortable"
                    hide-details="auto"
                    :disabled="!isEditing || saving"
                    class="field-input"
                    prepend-inner-icon="mdi-earth"
                  />
                </div>

                <div class="form-section">
                  <span class="form-section__label text-medium-emphasis">Tema</span>
                  <v-btn-toggle
                    v-model="editProfile.theme"
                    class="theme-toggle"
                    mandatory
                    divided
                    :disabled="!isEditing"
                  >
                    <v-btn
                      v-for="option in themeOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </v-btn>
                  </v-btn-toggle>
                </div>

                <div class="form-section form-section--stack">
                  <span class="form-section__label text-medium-emphasis">Notificaciones</span>
                  <v-checkbox
                    v-model="editProfile.notificationsEmail"
                    label="Notificaciones por email"
                    color="primary"
                    density="comfortable"
                    :disabled="!isEditing"
                  />
                  <v-checkbox
                    v-model="editProfile.notificationsWeb"
                    label="Notificaciones web"
                    color="primary"
                    density="comfortable"
                    :disabled="!isEditing"
                  />
                </div>
              </v-form>
            </div>
            </div>
          </div>
        </v-card>

        <v-alert v-else type="error" variant="tonal" border="start">
          Error al cargar el perfil.
          <v-btn variant="text" color="primary" @click="loadProfile">Reintentar</v-btn>
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { getProfile, updateProfile } from '@/services/auth.service'

const profile = ref(null)
const editProfile = ref({
  name: '',
  surname: '',
  email: '',
  language: 'es-AR',
  theme: 'system',
  notificationsEmail: true,
  notificationsWeb: true,
  avatarUrl: '',
  avatarFile: null,
  avatarRemoved: false
})

const loading = ref(true)
const saving = ref(false)
const valid = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const form = ref(null)
const isEditing = ref(false)

const avatarInput = ref(null)
const avatarPreview = ref('')
let avatarObjectUrl = null

const languageOptions = [
  { label: 'Español (AR)', value: 'es-AR' },
  { label: 'Español (ES)', value: 'es-ES' },
  { label: 'Inglés (US)', value: 'en-US' }
]

const themeOptions = [
  { label: 'Claro', value: 'light' },
  { label: 'Oscuro', value: 'dark' },
  { label: 'Sistema', value: 'system' }
]

const rules = {
  required: v => (!!v || v === 0) || 'Campo requerido',
  email: v => {
    if (!v) return 'Campo requerido'
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(v) || 'Email inválido'
  },
  maxLength: max => v => {
    if (!v) return true
    return v.length <= max || `Máximo ${max} caracteres`
  }
}

const hasChanges = computed(() => {
  if (!profile.value) return false

  const base = profile.value
  return (
    editProfile.value.name !== (base.name || '') ||
    editProfile.value.surname !== (base.surname || '') ||
    editProfile.value.language !== (base.language || 'es-AR') ||
    editProfile.value.theme !== (base.theme || 'system') ||
    editProfile.value.notificationsEmail !== (base.notificationsEmail ?? true) ||
    editProfile.value.notificationsWeb !== (base.notificationsWeb ?? true) ||
    editProfile.value.avatarFile !== null ||
    editProfile.value.avatarRemoved
  )
})

async function loadProfile() {
  loading.value = true
  errorMsg.value = ''

  try {
    const data = await getProfile()
    profile.value = data
    editProfile.value = {
      name: data.name || '',
      surname: data.surname || '',
      email: data.email || '',
      language: data.language || 'es-AR',
      theme: data.theme || 'system',
      notificationsEmail: data.notificationsEmail ?? true,
      notificationsWeb: data.notificationsWeb ?? true,
      avatarUrl: data.avatarUrl || '',
      avatarFile: null,
      avatarRemoved: false
    }
    setAvatarPreview(editProfile.value.avatarUrl)
  } catch (error) {
    console.error('Error loading profile:', error)
    errorMsg.value = error?.response?.data?.message || error?.message || 'Error al cargar el perfil'
  } finally {
    loading.value = false
  }
}

function setAvatarPreview(url) {
  if (avatarObjectUrl) {
    URL.revokeObjectURL(avatarObjectUrl)
    avatarObjectUrl = null
  }

  avatarPreview.value = url || ''
}

function triggerAvatarUpload() {
  if (!isEditing.value) return
  avatarInput.value?.click()
}

function onAvatarSelected(event) {
  if (!isEditing.value) return
  const file = event.target?.files?.[0]
  if (!file) return

  if (avatarObjectUrl) {
    URL.revokeObjectURL(avatarObjectUrl)
  }

  avatarObjectUrl = URL.createObjectURL(file)
  avatarPreview.value = avatarObjectUrl
  editProfile.value.avatarFile = file
  editProfile.value.avatarRemoved = false
}

function handleRemovePhoto() {
  if (!isEditing.value) return
  if (!avatarPreview.value) return

  setAvatarPreview('')
  editProfile.value.avatarFile = null
  editProfile.value.avatarRemoved = true
}

async function saveProfile() {
  if (!isEditing.value) return
  errorMsg.value = ''
  successMsg.value = ''

  const validation = await form.value?.validate()
  if (!validation?.valid) return

  try {
    saving.value = true

    let payload
    if (editProfile.value.avatarFile) {
      payload = new FormData()
      payload.append('name', editProfile.value.name.trim())
      payload.append('surname', editProfile.value.surname ?? '')
      payload.append('language', editProfile.value.language)
      payload.append('theme', editProfile.value.theme)
      payload.append('notificationsEmail', String(editProfile.value.notificationsEmail))
      payload.append('notificationsWeb', String(editProfile.value.notificationsWeb))
      payload.append('avatar', editProfile.value.avatarFile)
    } else {
      payload = {
        name: editProfile.value.name.trim(),
        surname: editProfile.value.surname ?? '',
        language: editProfile.value.language,
        theme: editProfile.value.theme,
        notificationsEmail: editProfile.value.notificationsEmail,
        notificationsWeb: editProfile.value.notificationsWeb,
        avatarRemoved: editProfile.value.avatarRemoved
      }
    }

    const updated = await updateProfile(payload)
    profile.value = updated

    editProfile.value = {
      name: updated.name || '',
      surname: updated.surname || '',
      email: updated.email || '',
      language: updated.language || 'es-AR',
      theme: updated.theme || 'system',
      notificationsEmail: updated.notificationsEmail ?? true,
      notificationsWeb: updated.notificationsWeb ?? true,
      avatarUrl: updated.avatarUrl || '',
      avatarFile: null,
      avatarRemoved: false
    }
    setAvatarPreview(editProfile.value.avatarUrl)

    successMsg.value = 'Perfil actualizado exitosamente'
    isEditing.value = false
  } catch (error) {
    console.error('Error updating profile:', error)

    let message = 'Error al actualizar el perfil'
    if (error?.response?.data?.message) {
      message = error.response.data.message
    } else if (error?.message) {
      message = error.message
    }

    errorMsg.value = message
  } finally {
    saving.value = false
  }
}

function startEditing() {
  isEditing.value = true
  successMsg.value = ''
  errorMsg.value = ''
  form.value?.resetValidation()
}

function cancelEditing() {
  if (!profile.value) {
    isEditing.value = false
    return
  }
  editProfile.value = {
    name: profile.value.name || '',
    surname: profile.value.surname || '',
    email: profile.value.email || '',
    language: profile.value.language || 'es-AR',
    theme: profile.value.theme || 'system',
    notificationsEmail: profile.value.notificationsEmail ?? true,
    notificationsWeb: profile.value.notificationsWeb ?? true,
    avatarUrl: profile.value.avatarUrl || '',
    avatarFile: null,
    avatarRemoved: false
  }
  setAvatarPreview(editProfile.value.avatarUrl)
  isEditing.value = false
  form.value?.resetValidation()
}

onMounted(() => {
  loadProfile()
})

onBeforeUnmount(() => {
  if (avatarObjectUrl) {
    URL.revokeObjectURL(avatarObjectUrl)
  }
})
</script>

<style scoped>
.profile-view {
  background-color: #f5f6f8;
}

.profile-card {
  border-radius: 28px;
  border: 1px solid #e5e7eb;
  background: linear-gradient(145deg, #ffffff 0%, #fbfbfe 100%);
  box-shadow: 0 32px 72px -36px rgba(42, 42, 68, 0.28);
  overflow: hidden;
  max-width: 1100px;
  margin: 0 auto;
}

.profile-card__body {
  padding: clamp(24px, 4vw, 48px);
}

.profile-card__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: clamp(24px, 4vw, 40px);
}

.profile-card__meta .overline {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-weight: 600;
}

.profile-card__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.edit-actions {
  display: inline-flex;
  gap: 12px;
  align-items: center;
}

.edit-btn {
  border-radius: 999px !important;
  font-weight: 600 !important;
}

.cancel-btn {
  font-weight: 600 !important;
  color: #6b7280 !important;
  text-transform: none !important;
}

.profile-layout {
  display: grid;
  grid-template-columns: minmax(200px, 260px) minmax(0, 1fr);
  gap: clamp(24px, 5vw, 56px);
  align-items: start;
}

.profile-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.avatar-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.avatar-image {
  box-shadow: 0 24px 48px -30px rgba(42, 42, 68, 0.45);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-change-btn {
  position: absolute;
  bottom: -18px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 999px !important;
  padding-inline: 14px !important;
  font-weight: 600;
  box-shadow: 0 18px 42px -20px rgba(42, 42, 68, 0.35);
}

.avatar-remove {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.avatar-remove:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  text-decoration: none;
}

.avatar-remove:hover,
.avatar-remove:focus-visible {
  color: #374151;
}

.profile-form__fields {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #4b5563;
}

.field-input :deep(.v-field) {
  border-radius: 18px;
  background-color: rgba(255, 255, 255, 0.82);
  box-shadow: inset 0 2px 8px rgba(42, 42, 68, 0.08);
  border: 1px solid rgba(42, 42, 68, 0.08);
  min-height: 54px;
}

.field-input :deep(.v-field__overlay) {
  background: transparent;
}

.field-input :deep(.v-field__outline) {
  display: none;
}

.field-input :deep(.v-text-field__details) {
  margin: 0;
  padding-inline: 4px;
}

.profile-form__fields {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid rgba(42, 42, 68, 0.08);
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.65);
}

.form-section--stack {
  flex-direction: column;
  align-items: flex-start;
}

.form-section__label {
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.theme-toggle {
  border-radius: 999px;
  padding: 4px;
  background-color: rgba(42, 42, 68, 0.06);
}

.theme-toggle :deep(.v-btn) {
  min-width: 90px;
  border-radius: 999px;
  text-transform: none;
  font-weight: 600;
  color: #2a2a44;
}

.theme-toggle :deep(.v-btn--active) {
  background-color: #2a2a44 !important;
  color: #ffffff !important;
  box-shadow: 0 18px 42px -24px rgba(42, 42, 68, 0.6);
}

.form-section :deep(.v-label) {
  font-weight: 500;
}

.save-btn {
  border-radius: 16px !important;
  font-weight: 700 !important;
  letter-spacing: 0.4px;
  padding-inline: 28px !important;
  box-shadow: 0 24px 48px -28px rgba(35, 117, 70, 0.55);
  background-color: #64b883 !important;
}

.save-btn:hover,
.save-btn:focus-visible {
  background-color: #4da76e !important;
}

@media (max-width: 1100px) {
  .profile-layout {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .profile-form__fields {
    align-items: stretch;
  }

  .form-section {
    align-items: stretch;
  }

  .theme-toggle {
    justify-content: center;
  }

  .save-btn {
    align-self: stretch;
  }
}

@media (max-width: 600px) {
  .profile-card__body {
    padding: 24px;
  }

  .avatar-change-btn {
    bottom: -14px;
  }
}
</style>
