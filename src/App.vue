<script setup lang="ts">
import SettingsPanel from '@/components/SettingsPanel.vue';
import AlgorithmSidebar from '@/components/AlgorithmSidebar.vue';
import PlaybackController from '@/components/PlaybackController.vue';
</script>

<template>
  <SidebarProvider>
    <AlgorithmSidebar />
    <main class="flex-1 flex flex-col">
      <div class="flex-1"></div>
      <PlaybackController />
    </main>
    <SettingsPanel />
  </SidebarProvider>
</template>
