<template>
  <nav v-if="items.length" class="app-breadcrumbs" aria-label="Breadcrumb">
    <v-breadcrumbs
      :items="items"
      density="compact"
      class="app-breadcrumbs__list"
    >
      <template #divider>
        <v-icon size="18" class="app-breadcrumbs__divider">mdi-chevron-right</v-icon>
      </template>
      <template #title="{ item, index }">
        <RouterLink
          v-if="item.to && index !== items.length - 1"
          :to="item.to"
          class="app-breadcrumbs__link app-breadcrumbs__text"
        >
          {{ item.title }}
        </RouterLink>
        <span v-else class="app-breadcrumbs__current app-breadcrumbs__text">{{ item.title }}</span>
      </template>
    </v-breadcrumbs>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  items: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>

.app-breadcrumbs {
  margin-bottom: 16px;
}

.app-breadcrumbs__list {
  padding: 0;
  align-items: center;
}

.app-breadcrumbs__text {
  font-size: 1rem;
  line-height: 1.5;
}

.app-breadcrumbs__link {
  color: #2a2a44;
  text-decoration: none;
  font-weight: 600;
}

.app-breadcrumbs__link:hover {
  text-decoration: underline;
}

.app-breadcrumbs__current {
  color: #b0b6c9;
  font-weight: 600;
}

.app-breadcrumbs__divider {
  color: #d0d3df;
}
</style>
