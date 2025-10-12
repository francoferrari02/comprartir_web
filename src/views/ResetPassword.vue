<template>
  <v-container class="py-12 d-flex justify-center">
    <v-card class="pa-6 card" max-width="420">
      <div class="text-center mb-6">
        <img 
          src="@/assets/Logo_Comprartir-removebg.png" 
          alt="Comprartir Logo" 
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
          role="alert"
          aria-live="polite"
      >{{ errorMsg }}</v-alert>

      <v-alert
          v-if="successMsg"
          type="success"
          variant="tonal"
          border="start"
          class="mb-4"
          role="alert"
          aria-live="polite"
      >{{ successMsg }}</v-alert>

      <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
        <v-text-field
            v-model="code"
            label="Código de verificación"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            hide-details="auto"
            class="mb-3"
            :disabled="loading"
            prepend-inner-icon="mdi-key-outline"
            autofocus
        />
        
        <v-text-field
            v-model="password"
            label="Nueva contraseña"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required, rules.password]"
            autocomplete="new-password"
            hide-details="auto"
            class="mb-2"
            :disabled="loading"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
        />

        <!-- Live password feedback -->
        <div v-if="password" class="mb-3 px-1">
          <div class="text-caption d-flex align-center mb-1" :class="passwordValidation.minLength ? 'text-success' : 'text-medium-emphasis'">
            <v-icon size="16" class="mr-1">{{ passwordValidation.minLength ? 'mdi-check-circle' : 'mdi-circle-outline' }}</v-icon>
            Al menos {{ MIN_PASSWORD_LENGTH }} caracteres
          </div>
          <div class="text-caption d-flex align-center" :class="passwordValidation.hasLetterAndNumber ? 'text-success' : 'text-medium-emphasis'">
            <v-icon size="16" class="mr-1">{{ passwordValidation.hasLetterAndNumber ? 'mdi-check-circle' : 'mdi-circle-outline' }}</v-icon>
            Al menos una letra y un número
          </div>
        </div>

        <v-text-field
            v-model="confirmPassword"
            label="Confirmar nueva contraseña"
            :type="showConfirmPassword ? 'text' : 'password'"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required, rules.passwordMatch]"
            autocomplete="new-password"
            hide-details="auto"
            class="mb-5"
            :disabled="loading"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
            @keyup.enter="onSubmit"
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
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resetPassword } from '@/services/auth.service'

const route = useRoute()
const router = useRouter()

// Configurable password length
const MIN_PASSWORD_LENGTH = 8

// Estado del formulario
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

// Password validation computed
const passwordValidation = computed(() => ({
  minLength: password.value.length >= MIN_PASSWORD_LENGTH,
  hasLetterAndNumber: /[a-zA-Z]/.test(password.value) && /\d/.test(password.value)
}))

// Validaciones
const rules = {
  required: v => (!!v || v === 0) || 'Campo requerido',
  password: v => {
    if (!v) return 'Campo requerido'
    if (v.length < MIN_PASSWORD_LENGTH) return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
    if (!/[a-zA-Z]/.test(v) || !/\d/.test(v)) return 'Debe contener al menos una letra y un número'
    return true
  },
  passwordMatch: v => {
    if (!v) return 'Campo requerido'
    return v === password.value || 'Las contraseñas no coinciden'
  }
}

// Obtener código y email de la URL si están presentes
onMounted(() => {
  if (route.query.code) {
    code.value = route.query.code
  }
  if (route.query.email) {
    emailHint.value = route.query.email
  }

  // Dev-only: Auto-fill code from backend response if available
  if (import.meta.env.DEV && route.query.devCode) {
    code.value = route.query.devCode
    console.log('🔧 DEV MODE: Auto-filled code from backend response')
  }
})

// Función principal de reset
async function onSubmit() {
  errorMsg.value = ''
  successMsg.value = ''
  
  const validation = await form.value?.validate()
  if (!validation?.valid) {
    // Focus on first error field
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

    // Redirigir al login después de ~1s
    setTimeout(() => {
      router.push('/login')
    }, 1000)

  } catch (error) {
    console.error('Password reset error:', error)
    
    // Manejo detallado de errores
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

    // Focus on code field if error is related to code
    if (message.toLowerCase().includes('código')) {
      setTimeout(() => {
        form.value.$el.querySelector('input[type="text"]')?.focus()
      }, 100)
    }
  } finally {
    loading.value = false
  }
}

// Solicitar nuevo código - volver a forgot-password con email prefilled
function requestNewCode() {
  const query = emailHint.value ? { email: emailHint.value } : {}
  router.push({
    path: '/forgot-password',
    query
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

.text-success {
  color: #4DA851 !important;
}

a {
  transition: all 0.2s ease;
}
</style>