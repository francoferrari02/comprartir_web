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
          Ingresá el código que recibiste por email y tu nueva contraseña
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
            v-model="code"
            label="Código de verificación"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            hide-details="auto"
            class="mb-3"
            :disabled="loading"
            prepend-inner-icon="mdi-key-outline"
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
            class="mb-3"
            :disabled="loading"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
        />
        
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
        <div class="text-caption text-medium-emphasis">
          ¿Recordaste tu contraseña? 
          <router-link to="/login" class="text-primary">Iniciar sesión</router-link>
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resetPassword } from '@/services/auth.service'

const route = useRoute()
const router = useRouter()

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

// Validaciones
const rules = {
  required: v => (!!v || v === 0) || 'Campo requerido',
  password: v => {
    if (!v) return 'Campo requerido'
    if (v.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
    return true
  },
  passwordMatch: v => {
    if (!v) return 'Campo requerido'
    return v === password.value || 'Las contraseñas no coinciden'
  }
}

// Obtener código de la URL si está presente
onMounted(() => {
  if (route.query.code) {
    code.value = route.query.code
  }
})

// Función principal de reset
async function onSubmit() {
  errorMsg.value = ''
  successMsg.value = ''
  
  const validation = await form.value?.validate()
  if (!validation?.valid) return
  
  try {
    loading.value = true
    await resetPassword({
      code: code.value.trim(),
      password: password.value
    })
    
    successMsg.value = '¡Contraseña restablecida exitosamente! Redirigiendo al login...'
    
    // Redirigir al login después de un breve delay
    setTimeout(() => {
      router.push('/login')
    }, 2000)
    
  } catch (error) {
    console.error('Password reset error:', error)
    
    // Manejo detallado de errores según el swagger
    let message = 'Error al restablecer la contraseña'
    
    if (error?.response?.status === 400) {
      message = 'Código inválido o expirado'
    } else if (error?.response?.status === 401) {
      message = 'Código de verificación inválido'
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