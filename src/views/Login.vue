<template>
  <v-container class="py-12 d-flex justify-center">
    <v-card class="pa-6 card" max-width="420">
      <div class="text-center mb-6">
        <img 
          src="@/assets/Logo_Comprartir-removebg.png" 
          alt="Comprartir Logo" 
          class="logo mb-3"
        />
        <div class="text-h5 font-weight-bold mb-1">Iniciar sesión</div>
        <div class="text-body-2 text-medium-emphasis">
          Accedé con tu email y contraseña
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
        <v-text-field
            v-model="email"
            label="Email"
            type="email"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required, rules.email]"
            autocomplete="email"
            hide-details="auto"
            class="mb-3"
            :disabled="loading"
            prepend-inner-icon="mdi-email-outline"
        />
        <v-text-field
            v-model="password"
            label="Contraseña"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required, rules.minLength]"
            autocomplete="current-password"
            hide-details="auto"
            class="mb-5"
            :disabled="loading"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
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
          Iniciar sesión
        </v-btn>
      </v-form>

      <div class="text-center">
        <div class="text-caption text-medium-emphasis mb-2">
          ¿Olvidaste tu contraseña? 
          <a href="#" @click.prevent="showForgotPassword" class="text-primary">Recuperarla</a>
        </div>
        
        <v-divider class="my-4"></v-divider>
        
        <div class="text-caption text-medium-emphasis">
          ¿No tenés cuenta? 
          <router-link to="/register" class="text-primary">Registrate</router-link>
        </div>
      </div>
    </v-card>

    <!-- Modal para recuperar contraseña -->
    <v-dialog v-model="forgotPasswordDialog" max-width="400">
      <v-card class="pa-6">
        <v-card-title class="text-h6 mb-4">Recuperar contraseña</v-card-title>
        
        <v-form ref="forgotForm" @submit.prevent="sendPasswordRecovery">
          <v-text-field
              v-model="forgotEmail"
              label="Email"
              type="email"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required, rules.email]"
              hide-details="auto"
              class="mb-4"
              :disabled="forgotLoading"
          />
          
          <div class="d-flex ga-2">
            <v-btn
                variant="outlined"
                @click="forgotPasswordDialog = false"
                :disabled="forgotLoading"
                block
            >
              Cancelar
            </v-btn>
            <v-btn
                type="submit"
                color="primary"
                variant="elevated"
                class="btn-solid-primary"
                :loading="forgotLoading"
                block
            >
              Enviar
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login, sendPasswordRecoveryCode, isLoggedIn } from '@/services/auth'

const route = useRoute()
const router = useRouter()

// Estado del formulario principal
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const valid = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const form = ref(null)

// Estado del modal de recuperación
const forgotPasswordDialog = ref(false)
const forgotEmail = ref('')
const forgotLoading = ref(false)
const forgotForm = ref(null)

// Validaciones
const rules = {
  required: v => (!!v || v === 0) || 'Campo requerido',
  email: v => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(v) || 'Email inválido'
  },
  minLength: v => (v && v.length >= 6) || 'La contraseña debe tener al menos 6 caracteres'
}

// Verificar si ya está logueado
onMounted(() => {
  if (isLoggedIn()) {
    const redirectTo = route.query.r || '/'
    router.replace(redirectTo)
  }
})

// Función principal de login
async function onSubmit() {
  errorMsg.value = ''
  successMsg.value = ''
  
  const validation = await form.value?.validate()
  if (!validation?.valid) return
  
  try {
    loading.value = true
    await login({ 
      email: email.value.trim().toLowerCase(), 
      password: password.value 
    })
    
    successMsg.value = '¡Bienvenido! Redirigiendo...'
    
    // Pequeño delay para mostrar el mensaje de éxito
    setTimeout(() => {
      const redirectTo = route.query.r || '/'
      router.replace(redirectTo)
    }, 1000)
    
  } catch (error) {
    console.error('Login error:', error)
    
    // Manejo detallado de errores según el swagger
    let message = 'Error al iniciar sesión'
    
    if (error?.response?.status === 400) {
      message = 'Email o contraseña incorrectos'
    } else if (error?.response?.status === 401) {
      message = 'Credenciales inválidas'
    } else if (error?.response?.status === 404) {
      message = 'Usuario no encontrado'
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

// Mostrar modal de recuperación de contraseña
function showForgotPassword() {
  forgotEmail.value = email.value
  forgotPasswordDialog.value = true
}

// Enviar código de recuperación
async function sendPasswordRecovery() {
  const validation = await forgotForm.value?.validate()
  if (!validation?.valid) return
  
  try {
    forgotLoading.value = true
    await sendPasswordRecoveryCode(forgotEmail.value.trim().toLowerCase())
    
    forgotPasswordDialog.value = false
    successMsg.value = 'Se enviaron las instrucciones de recuperación a tu email'
    
  } catch (error) {
    console.error('Password recovery error:', error)
    
    let message = 'Error al enviar el código de recuperación'
    if (error?.response?.status === 404) {
      message = 'No existe una cuenta con ese email'
    } else if (error?.response?.data?.message) {
      message = error.response.data.message
    }
    
    errorMsg.value = message
  } finally {
    forgotLoading.value = false
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

.text-primary:hover {
  text-decoration: underline;
}

a {
  transition: all 0.2s ease;
}
</style>
