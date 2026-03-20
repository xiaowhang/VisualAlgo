<template>
  <SidebarProvider>
    <AlgorithmSidebar />
    <main class="flex flex-1 flex-col">
      <div class="flex-1">
        <RouterView />
      </div>
      <PlaybackController />
    </main>
    <SettingsPanel />
  </SidebarProvider>
</template>
