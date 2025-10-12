<template>
  <v-container class="login-wrapper py-0" fluid>
    <v-row class="login-row" no-gutters>
      <v-col cols="12" lg="6" class="login-hero d-none d-lg-flex">
        <div class="hero-content">
          <img
            src="@/assets/Logo_Comprartir_Title.png"
            alt="Comprartir"
            class="hero-logo"
          />
          <div class="hero-text">
            <h1 class="hero-title">Organizá tus compras sin estrés</h1>
            <p class="hero-subtitle">
              Coordiná listas compartidas, mantené todo sincronizado y ahorrá tiempo en cada visita al súper.
            </p>
          </div>
        </div>
      </v-col>

      <v-col cols="12" lg="6" class="login-card-col d-flex align-center justify-center">
        <v-card class="pa-6 pa-sm-8 card" max-width="440">
          <div class="text-center mb-6">
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
              <router-link :to="{ name: 'forgot-password' }" class="text-primary">Recuperarla</router-link>
            </div>
            
            <v-divider class="my-4"></v-divider>
            
            <div class="text-caption text-medium-emphasis">
              ¿No tenés cuenta? 
              <router-link to="/register" class="text-primary">Registrate</router-link>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login, isLoggedIn } from '@/services/auth.service'

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

  // Mostrar mensaje de éxito si viene de una verificación exitosa
  if (route.query.verified === 'true') {
    successMsg.value = '¡Cuenta verificada! Ahora puedes iniciar sesión.'
  }
})

// Función principal de login
async function onSubmit() {
  errorMsg.value = ''
  successMsg.value = ''
  
  const validation = await form.value?.validate()
  if (!validation?.valid) return
  
  const userEmail = email.value.trim().toLowerCase()

  try {
    loading.value = true
    await login({ 
      email: userEmail,
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
    
    // Manejo detallado de errores
    let message = 'Error al iniciar sesión'
    
    // Verificar error de "Cuenta no verificada"
    if (error?.response?.status === 401 &&
        error?.response?.data?.message === 'Account not verified') {
      // Redirigir a la página de verificación con email y parámetro from
      router.push({
        path: '/verify',
        query: {
          email: userEmail,
          from: 'login'
        }
      })
      return
    }

    if (error?.status === 400 || error?.response?.status === 400) {
      message = 'Email o contraseña incorrectos'
    } else if (error?.status === 401 || error?.response?.status === 401) {
      message = 'Credenciales inválidas'
    } else if (error?.status === 404 || error?.response?.status === 404) {
      message = 'Usuario no encontrado'
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
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: stretch;
  padding: 0 !important;
  background: var(--surface, #f4f7f5);
}

.login-row {
  flex: 1;
}


.login-hero {
  background: #ffffff;
  color: var(--on-surface, #1f2933);
  padding: clamp(2.5rem, 4vw, 4rem) clamp(2.5rem, 5vw, 4.5rem);
  box-shadow: 24px 0 60px -35px rgba(31, 41, 51, 0.35);
  position: relative;
  z-index: 2;
}

.hero-content {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: clamp(2.75rem, 4vw, 3.5rem);
  justify-content: center;
  align-items: center;
}

.hero-logo {
  height: clamp(320px, 32vw, 420px);
  width: auto;
}

.hero-text {
  width: 100%;
  text-align: center;
}

.login-card-col {
  background: #4DA851;
  padding: clamp(2rem, 5vw, 4rem);
  display: flex;
  position: relative;
  z-index: 1;
}

.card {
  border-radius: 24px;
  border: 1px solid rgba(77, 168, 81, 0.1);
  background: var(--surface-strong, #ffffff);
  box-shadow: 0 36px 90px -28px rgba(10, 42, 16, 0.7);
}

.logo {
  height: 64px;
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

.v-text-field :deep(.v-field) {
  border-radius: 16px;
}

.v-text-field :deep(.v-field--variant-outlined) {
  background: rgba(255, 255, 255, 0.92);
}

@media (max-width: 959px) {
  .login-wrapper {
    background: linear-gradient(180deg, rgba(77, 168, 81, 0.08), rgba(255, 255, 255, 1));
    padding: clamp(2.5rem, 6vw, 4rem) 1rem !important;
  }

  .hero-logo {
    height: 220px;
  }

  .hero-text {
    text-align: left;
  }

  .card {
    box-shadow: 0 22px 48px -22px rgba(16, 45, 20, 0.45);
  }
}

@media (prefers-color-scheme: dark) {
  .login-wrapper {
    background: linear-gradient(180deg, rgba(229, 247, 235, 0.96), rgba(12, 16, 13, 1));
  }

  .login-hero {
    background: rgba(255, 255, 255, 0.95);
    color: rgba(0, 0, 0, 0.94);
    box-shadow: 24px 0 70px -40px rgba(0, 0, 0, 0.6);
  }

  .hero-subtitle {
    color: rgba(0, 0, 0, 0.88);
  }

  .login-card-col {
    background: rgba(56, 156, 73, 0.96);
  }

  .card {
    background: rgba(32, 42, 36, 0.92);
    border-color: rgba(77, 168, 81, 0.18);
    box-shadow: 0 42px 110px -40px rgba(0, 0, 0, 0.78);
  }

  .v-text-field :deep(.v-field--variant-outlined) {
    background: rgba(22, 27, 24, 0.6);
  }
}
</style>
