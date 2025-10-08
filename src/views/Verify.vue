<template>
  <v-container class="py-12 d-flex justify-center">
    <v-card class="pa-6 card" max-width="420">
      <div class="text-center mb-6">
        <img
          src="@/assets/Logo_Comprartir-removebg.png"
          alt="Comprartir Logo"
          class="logo mb-3"
        />
        <div class="text-h5 font-weight-bold mb-1">Verificar cuenta</div>
        <div class="text-body-2 text-medium-emphasis">
          Ingresá el código que recibiste por email
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
          role="alert"
          aria-live="assertive"
      >{{ errorMsg }}</v-alert>

      <v-alert
          v-if="successMsg"
          type="success"
          variant="tonal"
          border="start"
          class="mb-4"
          closable
          @click:close="successMsg = ''"
          role="status"
          aria-live="polite"
      >{{ successMsg }}</v-alert>

      <v-alert
          v-if="infoMsg"
          type="info"
          variant="tonal"
          border="start"
          class="mb-4"
          closable
          @click:close="infoMsg = ''"
          role="status"
          aria-live="polite"
      >{{ infoMsg }}</v-alert>

      <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
        <v-text-field
            v-model="email"
            label="Email"
            type="email"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required, rules.email]"
            hide-details="auto"
            class="mb-3"
            :disabled="loading"
            prepend-inner-icon="mdi-email-outline"
        />

        <v-text-field
            v-model="code"
            label="Código de verificación"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            hide-details="auto"
            class="mb-5"
            :disabled="loading"
            prepend-inner-icon="mdi-key-outline"
            autofocus
        />

        <v-btn
            type="submit"
            color="primary"
            variant="elevated"
            class="btn-rounded btn-solid-primary mb-3"
            :loading="loading"
            :disabled="!valid"
            block
        >
          Verificar cuenta
        </v-btn>
      </v-form>

      <div class="text-center">
        <div class="text-caption text-medium-emphasis mb-2">
          ¿No recibiste el código?
          <a
            href="#"
            @click.prevent="resendCode"
            class="text-primary"
            :class="{ 'text-disabled': resendDisabled }"
          >
            {{ resendButtonText }}
          </a>
        </div>

        <v-divider class="my-4"></v-divider>

        <div class="text-caption text-medium-emphasis">
          <router-link to="/login" class="text-primary">Volver al inicio de sesión</router-link>
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { verifyAccount, sendVerification } from '@/services/auth.service'

const route = useRoute()
const router = useRouter()

// Estado del formulario
const code = ref('')
const email = ref('')
const loading = ref(false)
const valid = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const infoMsg = ref('')
const form = ref(null)

// Resend cooldown state
const resendCooldown = ref(0)
const resendTimer = ref(null)

// Validaciones
const rules = {
  required: v => (!!v || v === 0) || 'Campo requerido',
  email: v => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(v) || 'Email inválido'
  }
}

// Computed for resend button
const resendDisabled = computed(() => resendCooldown.value > 0)
const resendButtonText = computed(() => {
  if (resendCooldown.value > 0) {
    return `Reenviar (${resendCooldown.value}s)`
  }
  return 'Reenviar'
})

// Obtener código y email de la URL si están presentes
onMounted(() => {
  if (route.query.code) {
    code.value = route.query.code
  }
  if (route.query.email) {
    email.value = route.query.email
  }

  // Show info message if coming from login with unverified account
  if (route.query.from === 'login') {
    infoMsg.value = 'Tu cuenta no está verificada. Por favor, ingresa el código que recibiste por email.'
  }
})

// Cleanup timer on unmount
onUnmounted(() => {
  if (resendTimer.value) {
    clearInterval(resendTimer.value)
  }
})

// Start cooldown timer
function startCooldown() {
  resendCooldown.value = 30
  resendTimer.value = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(resendTimer.value)
      resendTimer.value = null
    }
  }, 1000)
}

// Función principal de verificación
async function onSubmit() {
  errorMsg.value = ''
  successMsg.value = ''
  infoMsg.value = ''

  const validation = await form.value?.validate()
  if (!validation?.valid) return

  try {
    loading.value = true
    await verifyAccount({ code: code.value.trim() })

    successMsg.value = '¡Cuenta verificada exitosamente! Redirigiendo al login...'

    // Redirigir al login después de un breve delay
    setTimeout(() => {
      router.push({ path: '/login', query: { verified: 'true' } })
    }, 2000)

  } catch (error) {
    console.error('Verification error:', error)

    let message = 'Error al verificar la cuenta'

    if (error?.response?.status === 400) {
      message = 'Código inválido o expirado'
    } else if (error?.response?.status === 401) {
      message = 'Código de verificación inválido'
    } else if (error?.response?.status === 409) {
      message = 'Esta cuenta ya está verificada'
      // Redirect to login after showing message
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else if (error?.response?.data?.message) {
      message = error.response.data.message
    } else if (error?.message) {
      message = error.message
    }

    errorMsg.value = message
  } finally {
    loading.value = false
  }
}

// Reenviar código de verificación
async function resendCode() {
  if (resendDisabled.value) return

  if (!email.value) {
    errorMsg.value = 'Por favor, ingresa tu email para reenviar el código.'
    return
  }

  errorMsg.value = ''
  successMsg.value = ''
  infoMsg.value = ''

  try {
    await sendVerification(email.value)
    successMsg.value = 'Te reenviamos un código de verificación. Revisá tu email.'
    startCooldown()
  } catch (error) {
    console.error('Resend verification error:', error)

    let message = 'Error al reenviar el código'
    if (error?.response?.status === 404) {
      message = 'No existe una cuenta con ese email'
    } else if (error?.response?.status === 409) {
      message = 'Esta cuenta ya está verificada'
    } else if (error?.response?.data?.message) {
      message = error.response.data.message
    } else if (error?.message) {
      message = error.message
    }

    errorMsg.value = message
  }
}
</script>

<style scoped>
.card {
  border-radius: var(--radius-md, 16px);
  border: 1px solid var(--border, #E5E7EB);
  background: #fff;
}

.logo {
  height: 60px;
  width: auto;
  object-fit: contain;
}

.text-primary {
  color: var(--brand, #4DA851) !important;
  text-decoration: none;
  font-weight: 500;
}

.text-primary:hover:not(.text-disabled) {
  text-decoration: underline;
}

.text-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

a {
  transition: all 0.2s ease;
}
</style>
