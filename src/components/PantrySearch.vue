<template>
  <div class="pa-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h5 font-weight-bold">Despensas</h2>
    </div>

    <div class="d-flex align-center ga-3 flex-nowrap">
      <!-- Buscador personalizado -->
      <div class="search-field custom-search">
        <div class="search-input-wrapper">
          <v-icon class="search-icon">mdi-magnify</v-icon>
          <input
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            type="text"
            placeholder="Buscar despensas..."
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

      <!-- Botón nueva despensa -->
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        class="btn-rounded new-pantry-btn text-body-2 font-weight-medium"
        @click="$emit('new-pantry')"
      >
        Nueva despensa
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

defineEmits(['update:modelValue', 'new-pantry'])
</script>

<style scoped>
.search-field {
  flex: 1;
  min-width: 0;
}

.custom-search {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--input-radius);
  padding: 0 var(--input-padding-x);
  height: var(--input-height);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.search-input-wrapper:focus-within {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px var(--input-shadow-focus);
}

.search-icon {
  color: var(--input-placeholder);
  margin-right: 8px;
  font-size: 20px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  color: var(--text);
  padding: 0;
}

.search-input::placeholder {
  color: var(--input-placeholder);
}

.clear-icon {
  color: var(--input-placeholder);
  margin-left: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.clear-icon:hover {
  color: var(--muted);
}

.new-pantry-btn {
  flex-shrink: 0;
  height: 44px;
  padding: 0 24px !important;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .d-flex.align-center.ga-3 {
    flex-wrap: wrap;
  }

  .search-field {
    flex: 1 1 100%;
    margin-bottom: 8px;
  }

  .new-pantry-btn {
    flex: 1 1 100%;
  }
}
</style>

