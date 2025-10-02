<template>
  <section class="pa-4">
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="text-subtitle-1 font-weight-medium">Crear desde plantilla</div>
      <v-btn variant="text" size="small" @click="$emit('view-all')">Ver todas</v-btn>
    </div>

    <v-row dense>
      <v-col cols="12" sm="6" v-for="tpl in templates" :key="tpl.id" class="pb-2">
        <v-card class="pa-4 card--hover" @click="$emit('use-template', tpl)">
          <div class="d-flex align-center ga-3">
            <v-avatar size="36" variant="tonal">
              <v-icon>{{ tpl.icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ tpl.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ tpl.desc }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>

<script setup>
const templates = [
  { id: 'super', name: 'Supermercado semanal', desc: 'Básicos de la semana', icon: 'mdi-cart-outline' },
  { id: 'verduleria', name: 'Verdulería', desc: 'Frutas y verduras', icon: 'mdi-food-apple-outline' },
  { id: 'farmacia', name: 'Farmacia', desc: 'Higiene y botiquín', icon: 'mdi-pharmacy' },
  { id: 'evento', name: 'Asado / Evento', desc: 'Checklist para compartir', icon: 'mdi-party-popper' },
]
</script>
