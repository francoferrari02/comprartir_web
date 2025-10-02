<template>
  <section class="pa-4">
    <div class="text-subtitle-1 font-weight-medium mb-2">Compartidos conmigo</div>

    <v-list density="comfortable">
      <v-list-item v-for="it in items" :key="it.id">
        <template #prepend>
          <v-avatar size="28"><v-img :src="it.ownerAvatar" :alt="it.owner"/></v-avatar>
        </template>
        <v-list-item-title class="font-weight-medium">{{ it.name }}</v-list-item-title>
        <v-list-item-subtitle>Propietario: {{ it.owner }}</v-list-item-subtitle>
        <template #append>
          <v-chip size="small" variant="tonal">{{ it.role }}</v-chip>
        </template>
      </v-list-item>
    </v-list>
  </section>
</template>

<script setup>
const items = [
  { id:'a1', name:'Cumple Emma', owner:'Sofía', ownerAvatar:'https://i.pravatar.cc/64?img=5', role:'Editor' },
  { id:'a2', name:'Turnos pediatra', owner:'Juan', ownerAvatar:'https://i.pravatar.cc/64?img=2', role:'Lector' },
]
</script>
