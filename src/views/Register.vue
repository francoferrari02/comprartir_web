<template>
  <v-container class="py-12 d-flex justify-center">
    <v-card class="pa-6 card" max-width="420">
      <div class="text-center mb-6">
        <img 
          src="@/assets/Logo_Comprartir-removebg.png" 
          alt="Comprartir Logo" 
          class="logo mb-3"
        />
        <div class="text-h5 font-weight-bold mb-1">Crear cuenta</div>
        <div class="text-body-2 text-medium-emphasis">
          Registrate para comenzar a usar Comprartir
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
          <label class="app-input-label" for="register-first-name">Nombre</label>
          <v-text-field
              id="register-first-name"
              v-model="firstName"
              density="comfortable"
              :rules="[rules.required, rules.maxLength(50)]"
              hide-details="auto"
              class="app-input"
              :disabled="loading"
              prepend-inner-icon="mdi-account-outline"
          />
        </div>

        <div class="mb-3">
          <label class="app-input-label" for="register-last-name">Apellido</label>
          <v-text-field
              id="register-last-name"
              v-model="lastName"
              density="comfortable"
              :rules="[rules.required, rules.maxLength(50)]"
              hide-details="auto"
              class="app-input"
              :disabled="loading"
              prepend-inner-icon="mdi-account-outline"
          />
        </div>

        <div class="mb-3">
          <label class="app-input-label" for="register-email">Email</label>
          <v-text-field
              id="register-email"
              v-model="email"
              type="email"
              density="comfortable"
              :rules="[rules.required, rules.email]"
              autocomplete="email"
              hide-details="auto"
              class="app-input"
              :disabled="loading"
              prepend-inner-icon="mdi-email-outline"
          />
        </div>

        <div class="mb-3">
          <label class="app-input-label" for="register-password">Contraseña</label>
          <v-text-field
              id="register-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              density="comfortable"
              :rules="[rules.required, rules.password]"
              autocomplete="new-password"
              hide-details="auto"
              class="app-input"
              :disabled="loading"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
          />
        </div>

        <div class="mb-5">
          <label class="app-input-label" for="register-confirm-password">Confirmar contraseña</label>
          <v-text-field
              id="register-confirm-password"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              density="comfortable"
              :rules="[rules.required, rules.passwordMatch]"
              autocomplete="new-password"
              hide-details="auto"
              class="app-input"
              :disabled="loading"
              prepend-inner-icon="mdi-lock-outline"
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
          Crear cuenta
        </v-btn>
      </v-form>

      <div class="text-center">
        <div class="text-caption text-medium-emphasis">
          ¿Ya tenés cuenta? 
          <router-link to="/login" class="text-primary">Iniciar sesión</router-link>
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register, sendVerification } from '@/services/auth.service'

const router = useRouter()

// Estado del formulario
const firstName = ref('')
const lastName = ref('')
const email = ref('')
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
    return v === password.value || 'Las contraseñas no coinciden'
  },
  maxLength: (max) => v => {
    if (!v) return true
    return v.length <= max || `Máximo ${max} caracteres`
  }
}

// Función principal de registro
async function onSubmit() {
  errorMsg.value = ''
  successMsg.value = ''
  
  const validation = await form.value?.validate()
  if (!validation?.valid) return
  
  const userEmail = email.value.trim().toLowerCase()

  try {
    loading.value = true

    // Step 1: Register user
    const registerPayload = {
      name: firstName.value.trim(),
      surname: lastName.value.trim(),
      email: userEmail,
      password: password.value
    }
    
    console.log('📤 Sending registration request:', { ...registerPayload, password: '***' })
    
    await register(registerPayload)
    
    // Step 2: Send verification code
    await sendVerification(userEmail)

    successMsg.value = '¡Cuenta creada! Te enviamos un código de verificación a tu correo.'

    // Step 3: Redirect to verify page with email
    setTimeout(() => {
      router.push({
        path: '/verify',
        query: { email: userEmail }
      })
    }, 1500)

  } catch (error) {
    console.error('Registration error:', error)
    
    // Manejo detallado de errores según el swagger
    let message = 'Error al crear la cuenta'
    
    if (error?.response?.status === 400) {
      const errorData = error.response.data
      if (errorData?.message) {
        message = errorData.message
      } else if (errorData?.errors) {
        // Si hay errores de validación específicos
        message = 'Datos inválidos: ' + Object.values(errorData.errors).join(', ')
      } else {
        message = 'Los datos proporcionados no son válidos'
      }
    } else if (error?.response?.status === 409) {
      message = 'Ya existe una cuenta con ese email'
    } else if (error?.response?.status === 500) {
      message = 'Error interno del servidor. Por favor verifica: \n' +
                '1. Que el servidor esté corriendo en http://localhost:8080\n' +
                '2. Que la base de datos esté conectada\n' +
                '3. Los logs del servidor para más detalles'
      console.error('💡 Tip: Revisa la consola del servidor (Spring Boot) para ver el error completo')
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