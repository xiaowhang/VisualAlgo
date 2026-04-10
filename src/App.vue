<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const showGlobalPlaybackController = computed(() => route.name !== 'CompareView');
</script>

<template>
  <SidebarProvider>
    <AlgorithmSidebar />
    <main class="flex flex-1 flex-col">
      <div class="flex-1">
        <RouterView />
      </div>
      <PlaybackController v-if="showGlobalPlaybackController" />
    </main>
    <SettingsPanel />
  </SidebarProvider>
</template>
