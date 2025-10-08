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
            class="mb-5"
            :disabled="loading || emailSent"
            prepend-inner-icon="mdi-email-outline"
            autofocus
        />

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

        <v-btn
            v-else
            color="primary"
            variant="elevated"
            class="btn-rounded btn-solid-primary mb-3"
            @click="goToReset"
            block
        >
          Ir a restablecer contraseña
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
import { forgotPassword } from '@/services/auth.service'

const route = useRoute()
const router = useRouter()

// Estado del formulario
const email = ref('')
const loading = ref(false)
const valid = ref(false)
const emailSent = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const form = ref(null)

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
    successMsg.value = 'Te enviamos un código a tu email. Revisá tu bandeja de entrada.'

  } catch (error) {
    console.error('Forgot password error:', error)

    let message = 'Error al enviar el código de recuperación'

    if (error?.response?.status === 404) {
      message = 'No existe una cuenta con ese email'
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

// Redirigir a la página de reset
function goToReset() {
  router.push('/reset-password')
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
