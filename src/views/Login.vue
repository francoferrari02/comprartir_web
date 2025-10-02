<template>
  <v-container class="py-12 d-flex justify-center">
    <v-card class="pa-6 card" max-width="420">
      <div class="text-h5 font-weight-bold mb-1">Iniciar sesión</div>
      <div class="text-body-2 text-medium-emphasis mb-4">
        Accedé con tu email y contraseña.
      </div>

      <v-alert
          v-if="errorMsg"
          type="error"
          variant="tonal"
          border="start"
          class="mb-4"
      >{{ errorMsg }}</v-alert>

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
        />
        <v-text-field
            v-model="password"
            label="Contraseña"
            type="password"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            autocomplete="current-password"
            hide-details="auto"
            class="mb-5"
        />

        <v-btn
            type="submit"
            color="primary"
            variant="elevated"
            class="btn-rounded btn-solid-primary"
            :loading="loading"
            block
        >
          Entrar
        </v-btn>
      </v-form>

      <div class="text-caption text-medium-emphasis mt-4">
        ¿Olvidaste tu contraseña? <router-link to="/help">Obtener ayuda</router-link>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '@/services/auth' // <-- usa el servicio que armamos

const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const valid = ref(false)
const errorMsg = ref('')
const form = ref(null)

const rules = {
  required: v => (!!v || v === 0) || 'Campo requerido',
  email: v => /.+@.+\..+/.test(v) || 'Email inválido',
}

async function onSubmit () {
  errorMsg.value = ''
  const ok = await form.value?.validate()
  if (!ok?.valid) return
  try {
    loading.value = true
    await login({ email: email.value.trim(), password: password.value })
    // redirige a donde venía o al home
    const redirectTo = route.query.r || '/'
    router.replace(redirectTo)
  } catch (e) {
    // intenta leer mensaje del backend
    const msg = e?.response?.data?.message || e?.message || 'No se pudo iniciar sesión'
    errorMsg.value = msg
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
</style>
