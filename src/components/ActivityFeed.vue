<template>
  <section class="pa-4">
    <div class="text-subtitle-1 font-weight-medium mb-2">Actividad reciente</div>

    <v-timeline density="comfortable" side="end">
      <v-timeline-item v-for="ev in events" :key="ev.id" dot-color="primary" size="small">
        <div class="d-flex ga-2 align-start">
          <v-avatar size="24"><v-img :src="ev.userAvatar" :alt="ev.user"/></v-avatar>
          <div>
            <div class="text-body-2">
              <strong>{{ ev.user }}</strong> {{ ev.action }}
              <strong>{{ ev.target }}</strong>
            </div>
            <div class="text-caption text-medium-emphasis">{{ ev.when }}</div>
          </div>
        </div>
      </v-timeline-item>
    </v-timeline>
  </section>
</template>

<script setup>
const events = [
  { id:'e1', user:'Sofía', userAvatar:'https://i.pravatar.cc/64?img=5', action:'marcó como comprado', target:'“Tomates” en Verdulería', when:'hace 5 min' },
  { id:'e2', user:'Juan',  userAvatar:'https://i.pravatar.cc/64?img=2', action:'agregó', target:'“Ibuprofeno” a Farmacia', when:'hace 23 min' },
  { id:'e3', user:'Vos',   userAvatar:'https://i.pravatar.cc/64?img=3', action:'creaste la lista', target:'“Asado sábado”', when:'ayer' },
]
</script>
