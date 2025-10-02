<template>
  <v-app>
    <Header @new-list="onNewList" />

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import Header from './components/Header.vue'

function onNewList(){ /* abrir modal o route */ }
</script>

<style scoped>
/* App no contiene estilos de la home; esas van en src/views/Home.vue */
</style>
