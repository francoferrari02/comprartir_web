<template>
  <div class="pa-4">
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="flex-grow-1 mr-4">
        <h2 class="text-h5 font-weight-bold mb-1">Mis Despensas</h2>
        <p class="text-body-2 text-medium-emphasis">
          Gestiona tus despensas y sus productos
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        class="btn-pill"
        @click="$emit('new-pantry')"
      >
        Nueva Despensa
      </v-btn>
    </div>

    <v-text-field
      :model-value="modelValue"
      prepend-inner-icon="mdi-magnify"
      placeholder="Buscar despensas..."
      variant="outlined"
      density="comfortable"
      clearable
      hide-details
      class="search-field"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue', 'new-pantry'])
</script>

<style scoped>
.btn-pill {
  border-radius: 24px !important;
}

.search-field {
  max-width: 100%;
}
</style>

