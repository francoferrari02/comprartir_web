<template>
  <v-container class="py-12 d-flex justify-center">
    <v-card class="pa-6 card" max-width="420">
      <div class="text-center mb-6">
        <img
          src="@/assets/Logo_Comprartir-removebg.png"
          alt="Comprartir Logo"
          class="logo mb-3"
        />
        <div class="text-h5 font-weight-bold mb-1">Recuperar contraseña</div>
        <div class="text-body-2 text-medium-emphasis">
          Ingresá tu email y te enviaremos un código para restablecer tu contraseña
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
          aria-live="polite"
      >{{ errorMsg }}</v-alert>

      <v-alert
          v-if="successMsg"
          type="success"
          variant="tonal"
          border="start"
          class="mb-4"
          closable
          @click:close="successMsg = ''"
          role="alert"
          aria-live="polite"
      >{{ successMsg }}</v-alert>

      <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
        <div class="mb-5">
          <label class="app-input-label" for="forgot-email">Email</label>
          <v-text-field
              id="forgot-email"
              v-model="email"
              type="email"
              density="comfortable"
              :rules="[rules.required, rules.email]"
              autocomplete="email"
              hide-details="auto"
              class="app-input"
              :disabled="loading || emailSent"
              prepend-inner-icon="mdi-email-outline"
              autofocus
              @keyup.enter="onSubmit"
          />
        </div>

        <v-btn
            v-if="!emailSent"
            type="submit"
            color="primary"
            variant="elevated"
            class="btn-rounded btn-solid-primary mb-3"
            :loading="loading"
            :disabled="!valid"
            block
        >
          Enviar código
        </v-btn>

        <template v-else>
          <v-btn
              color="primary"
              variant="elevated"
              class="btn-rounded btn-solid-primary mb-3"
              @click="goToReset"
              block
          >
            Ingresar código
          </v-btn>

          <v-btn
              variant="outlined"
              color="primary"
              class="btn-rounded mb-3"
              :loading="resending"
              :disabled="resendCooldown > 0"
              @click="resendCode"
              block
          >
            {{ resendCooldown > 0 ? `Reenviar código (${resendCooldown}s)` : 'Reenviar código' }}
          </v-btn>
        </template>
      </v-form>

      <div class="text-center">
        <div class="text-caption text-medium-emphasis">
          ¿Recordaste tu contraseña?
          <router-link to="/login" class="text-primary">Iniciar sesión</router-link>
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { forgotPassword } from '@/services/auth.service'

const route = useRoute()
const router = useRouter()

// Estado del formulario
const email = ref('')
const loading = ref(false)
const resending = ref(false)
const valid = ref(false)
const emailSent = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const form = ref(null)
const resendCooldown = ref(0)
let cooldownInterval = null

// Validaciones
const rules = {
  required: v => (!!v || v === 0) || 'Campo requerido',
  email: v => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(v) || 'Email inválido'
  }
}

// Obtener email de la URL si está presente
onMounted(() => {
  if (route.query.email) {
    email.value = route.query.email
  }
})

onUnmounted(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
  }
})

// Iniciar cooldown de 30 segundos
function startCooldown() {
  resendCooldown.value = 30
  cooldownInterval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownInterval)
      cooldownInterval = null
    }
  }, 1000)
}

// Función principal
async function onSubmit() {
  errorMsg.value = ''
  successMsg.value = ''

  const validation = await form.value?.validate()
  if (!validation?.valid) return

  try {
    loading.value = true
    await forgotPassword(email.value.trim().toLowerCase())

    emailSent.value = true
    successMsg.value = 'Te enviamos un código a tu correo. Revisá tu bandeja de entrada.'
    startCooldown()

  } catch (error) {
    console.error('Forgot password error:', error)

    let message = 'Error al enviar el código de recuperación'

    if (error?.status === 404 || error?.response?.status === 404) {
      message = 'Email no registrado'
    } else if (error?.status === 400 || error?.response?.status === 400) {
      message = 'Email inválido'
    } else if (error?.message && !error?.isNetworkError) {
      message = error.message
    } else if (error?.isNetworkError) {
      message = 'No pudimos procesar tu solicitud. Verificá tu conexión.'
    }

    errorMsg.value = message
  } finally {
    loading.value = false
  }
}

// Reenviar código
async function resendCode() {
  errorMsg.value = ''
  successMsg.value = ''

  try {
    resending.value = true
    await forgotPassword(email.value.trim().toLowerCase())

    successMsg.value = 'Código reenviado exitosamente'
    startCooldown()

  } catch (error) {
    console.error('Resend code error:', error)

    let message = 'Error al reenviar el código'
    if (error?.message && !error?.isNetworkError) {
      message = error.message
    } else if (error?.isNetworkError) {
      message = 'No pudimos procesar tu solicitud. Verificá tu conexión.'
    }

    errorMsg.value = message
  } finally {
    resending.value = false
  }
}

// Redirigir a la página de reset con email
function goToReset() {
  router.push({
    path: '/reset-password',
    query: { email: email.value }
  })
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

.text-primary:hover {
  text-decoration: underline;
}

a {
  transition: all 0.2s ease;
}
</style>
