<template>
  <v-container fluid class="py-12 bg-surface reset-wrapper">
    <div class="view-shell d-flex justify-center">
      <v-card class="reset-card card card--hover pa-8">
        <div class="text-center mb-6">
          <img
            src="@/assets/Logo_Comprartir_Title.png"
            alt="Comprartir"
            class="logo mb-3"
          />
          <div class="text-h5 font-weight-bold mb-1">Restablecer contraseña</div>
          <div class="text-body-2 text-medium-emphasis">
            <template v-if="emailHint">
              Ingresá el código enviado a <strong>{{ emailHint }}</strong>
            </template>
            <template v-else>
              Ingresá el código que recibiste por email y tu nueva contraseña
            </template>
          </div>
        </div>

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

        <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
          <div class="mb-3">
            <label class="app-input-label" for="reset-code">Código</label>
            <v-text-field
              id="reset-code"
              v-model="code"
              type="text"
              density="comfortable"
              :rules="[rules.required]"
              autocomplete="one-time-code"
              hide-details="auto"
              class="app-input"
              :disabled="loading"
              prepend-inner-icon="mdi-shield-key-outline"
            />
          </div>

          <div class="mb-3">
            <label class="app-input-label" for="reset-password">Nueva contraseña</label>
            <v-text-field
              id="reset-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              density="comfortable"
              :rules="[rules.required]"
              autocomplete="new-password"
              hide-details="auto"
              class="app-input"
              :disabled="loading"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
            />
          </div>

          <div class="mb-6">
            <label class="app-input-label" for="reset-confirm-password">Confirmar contraseña</label>
            <v-text-field
              id="reset-confirm-password"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              density="comfortable"
              :rules="[rules.passwordMatch]"
              autocomplete="new-password"
              hide-details="auto"
              class="app-input"
              :disabled="loading"
              prepend-inner-icon="mdi-lock-check-outline"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
            />
          </div>

          <v-btn
            type="submit"
            color="primary"
            variant="elevated"
            class="btn-rounded btn-solid-primary mb-3"
            :loading="loading"
            :disabled="!valid"
            block
          >
            Restablecer contraseña
          </v-btn>
        </v-form>

        <div class="text-center">
          <div class="text-caption text-medium-emphasis mb-2">
            ¿Necesitás un nuevo código?
            <a href="#" @click.prevent="requestNewCode" class="text-primary">Solicitalo acá</a>
          </div>
          <div class="text-caption text-medium-emphasis">
            ¿Recordaste tu contraseña?
            <router-link to="/login" class="text-primary">Iniciar sesión</router-link>
          </div>
        </div>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resetPassword } from '@/services/auth.service'

const route = useRoute()
const router = useRouter()

const code = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const valid = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const form = ref(null)
const emailHint = ref('')

const rules = {
  required: v => (!!v || v === 0) || 'Campo requerido',
  passwordMatch: v => {
    if (!v) return 'Campo requerido'
    return v === password.value || 'Las contraseñas no coinciden'
  }
}

onMounted(() => {
  if (route.query.code) {
    code.value = route.query.code
  }
  if (route.query.email) {
    emailHint.value = route.query.email
  }
  if (route.query.autoSent) {
    successMsg.value = 'Te enviamos un código a tu correo. Revisá tu bandeja de entrada.'
  }

  if (import.meta.env.DEV && route.query.devCode) {
    code.value = route.query.devCode
    console.log('🔧 DEV MODE: Auto-filled code from backend response')
  }
})

async function onSubmit() {
  errorMsg.value = ''
  successMsg.value = ''

  const validation = await form.value?.validate()
  if (!validation?.valid) {
    const firstErrorField = form.value.$el.querySelector('.v-field--error')
    if (firstErrorField) {
      firstErrorField.querySelector('input')?.focus()
    }
    return
  }

  try {
    loading.value = true
    await resetPassword({
      code: code.value.trim(),
      password: password.value
    })

    successMsg.value = 'Contraseña actualizada correctamente'

    setTimeout(() => {
      router.push('/login')
    }, 1000)
  } catch (error) {
    console.error('Password reset error:', error)

    let message = 'No pudimos procesar tu solicitud'

    if (error?.status === 400 || error?.response?.status === 400) {
      message = 'Código inválido o expirado'
    } else if (error?.status === 404 || error?.response?.status === 404) {
      message = 'Código no encontrado o expirado'
    } else if (error?.message && !error?.isNetworkError) {
      message = error.message
    } else if (error?.isNetworkError) {
      message = 'No pudimos procesar tu solicitud. Verificá tu conexión.'
    }

    errorMsg.value = message

    if (message.toLowerCase().includes('código')) {
      setTimeout(() => {
        form.value.$el.querySelector('input[type="text"]')?.focus()
      }, 100)
    }
  } finally {
    loading.value = false
  }
}

function requestNewCode() {
  const query = emailHint.value ? { email: emailHint.value } : {}
  router.push({
    path: '/forgot-password',
    query
  })
}
</script>

<style scoped>
.reset-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reset-card {
  width: 100%;
  max-width: 880px;
  border-radius: var(--radius-lg, 24px);
  border: 1px solid var(--border, #E5E7EB);
  background: #fff;
}

.logo {
  height: clamp(90px, 18vw, 140px);
  width: auto;
  object-fit: contain;
}

.text-primary {
  color: var(--brand, #4DA851) !important;
  text-decoration: none;
  font-weight: 500;
}

.text-primary:hover,
.text-primary:focus-visible {
  text-decoration: underline;
}

a {
  transition: all 0.2s ease;
}
</style>