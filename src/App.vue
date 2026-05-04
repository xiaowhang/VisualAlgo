<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const showGlobalPlaybackController = computed(() => route.meta.hideGlobalPlayback !== true);
</script>

<template>
  <SidebarProvider class="h-svh">
    <AlgorithmSidebar />
    <main class="flex min-w-0 flex-1 flex-col bg-background">
      <div class="flex-1 overflow-hidden">
        <RouterView class="h-full" />
      </div>
      <PlaybackController v-if="showGlobalPlaybackController" class="border-t border-border/70" />
    </main>
    <SettingsPanel v-if="showGlobalPlaybackController" />
  </SidebarProvider>
</template>
