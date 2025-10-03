<template>
  <div class="pa-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h5 font-weight-bold">Todas las listas</h2>
    </div>
    
    <div class="d-flex align-center ga-3">
      <!-- Buscador personalizado -->
      <div class="search-field custom-search">
        <div class="search-input-wrapper">
          <v-icon class="search-icon">mdi-magnify</v-icon>
          <input
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            type="text"
            placeholder="Buscar listas..."
            class="search-input"
          />
          <v-icon 
            v-if="modelValue" 
            class="clear-icon" 
            @click="$emit('update:modelValue', '')"
          >
            mdi-close
          </v-icon>
        </div>
      </div>
      
      <!-- Botón nueva lista -->
      <v-btn
        color="success"
        variant="elevated"
        prepend-icon="mdi-plus"
        class="btn-rounded new-list-btn"
        @click="$emit('new-list')"
      >
        Nueva lista
      </v-btn>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue', 'new-list'])
</script>

<style scoped>
.search-field {
  flex: 1;
  max-width: 500px;
}

.custom-search {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 50px;
  padding: 0 16px;
  height: 48px;
  transition: all 0.2s ease;
}

.search-input-wrapper:focus-within {
  border-color: var(--brand);
  box-shadow: 0 0 0 2px rgba(77, 168, 81, 0.1);
}

.search-icon {
  color: #9CA3AF;
  margin-right: 8px;
  font-size: 20px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #374151;
  padding: 0;
}

.search-input::placeholder {
  color: #9CA3AF;
}

.clear-icon {
  color: #9CA3AF;
  margin-left: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.clear-icon:hover {
  color: #6B7280;
}

.new-list-btn {
  flex-shrink: 0;
  min-width: 140px;
}

/* Botón verde con hover más oscuro */
.new-list-btn.v-btn--has-bg {
  background-color: var(--brand) !important;
  color: #fff !important;
}

.new-list-btn:hover,
.new-list-btn:focus-visible {
  background-color: var(--brand-700) !important;
}

@media (max-width: 600px) {
  .d-flex {
    flex-direction: column;
    align-items: stretch !important;
  }
  
  .search-field {
    max-width: none;
  }
  
  .new-list-btn {
    min-width: auto;
  }
}
</style>
