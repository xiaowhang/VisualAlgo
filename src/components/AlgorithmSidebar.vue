<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { algorithmMenuByCategory } from '@/algorithms/registry';

const route = useRoute();
const keyword = ref('');

const sections = computed(() => [
  {
    label: 'Sorting',
    category: 'sorting' as const,
    defaultOpen: true,
    items: algorithmMenuByCategory.sorting,
  },
  {
    label: 'Graphs',
    category: 'graphs' as const,
    defaultOpen: false,
    items: algorithmMenuByCategory.graphs,
  },
]);

const filteredSections = computed(() => {
  const query = keyword.value.trim().toLowerCase();
  if (!query) {
    return sections.value;
  }

  return sections.value
    .map(section => ({
      ...section,
      items: section.items.filter(item => item.title.toLowerCase().includes(query)),
    }))
    .filter(section => section.items.length > 0);
});

function isActive(category: string, slug: string) {
  return route.params.category === category && route.params.slug === slug;
}

const isCompareActive = computed(() => route.name === 'CompareView');
</script>

<template>
  <Sidebar>
    <SidebarHeader class="px-4 pt-5">
      <div class="mb-3 px-1">
        <p class="font-display text-xs tracking-[0.18em] text-muted-foreground uppercase">Algo</p>
        <h2 class="mt-1 text-2xl leading-[1.1] text-charcoal">Algorithm Navigator</h2>
      </div>
      <Input v-model="keyword" placeholder="Search algorithm..." class="h-10 rounded-lg" />
    </SidebarHeader>
    <SidebarContent class="gap-0 px-2 pt-3 pb-6">
      <div class="mb-4 px-2">
        <RouterLink
          :to="{ name: 'CompareView' }"
          class="flex h-10 items-center rounded-lg px-3 text-sm font-medium transition-colors"
          :class="
            isCompareActive
              ? 'bg-background text-charcoal shadow-sm ring-1 ring-border/70'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          "
        >
          对比模式
        </RouterLink>
      </div>

      <SidebarGroup v-for="section in filteredSections" :key="section.label" as-child>
        <Collapsible :default-open="section.defaultOpen" class="group/collapsible">
          <SidebarGroupLabel as-child>
            <CollapsibleTrigger
              class="flex h-9 w-full items-center rounded-lg px-3 py-2 text-[11px] font-semibold tracking-[0.16em] text-zinc-500 uppercase hover:bg-muted hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              <span>{{ section.label }}</span>
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem v-for="item in section.items" :key="item.title">
                  <SidebarMenuButton
                    as-child
                    :isActive="isActive(item.category, item.slug)"
                    class="h-10 gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                    :class="
                      isActive(item.category, item.slug)
                        ? 'bg-background shadow-sm ring-1 ring-border/70'
                        : 'border border-transparent'
                    "
                  >
                    <RouterLink
                      :to="{
                        name: 'AlgorithmView',
                        params: { category: item.category, slug: item.slug },
                      }"
                      class="w-full text-inherit no-underline"
                    >
                      <span
                        :class="
                          isActive(item.category, item.slug)
                            ? 'font-semibold text-charcoal'
                            : 'text-inherit'
                        "
                      >
                        {{ item.title }}
                      </span>
                    </RouterLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>
