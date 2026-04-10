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
    <SidebarHeader class="px-4 pt-4">
      <Input v-model="keyword" placeholder="Search algo..." />
    </SidebarHeader>
    <SidebarContent class="gap-0 px-2 pt-2 pb-6">
      <div class="mb-3 px-2">
        <RouterLink
          :to="{ name: 'CompareView' }"
          class="flex h-10 items-center rounded-md border px-3 text-sm transition-colors"
          :class="
            isCompareActive
              ? 'border-border bg-background text-primary'
              : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
          "
        >
          对比模式
        </RouterLink>
      </div>

      <SidebarGroup v-for="section in filteredSections" :key="section.label" as-child>
        <Collapsible :default-open="section.defaultOpen" class="group/collapsible">
          <SidebarGroupLabel as-child>
            <CollapsibleTrigger
              class="flex h-12 w-full items-center rounded-md px-3 py-2 text-2xl font-semibold tracking-wide text-muted-foreground uppercase hover:bg-muted"
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
                    class="h-10 gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted"
                    :class="
                      isActive(item.category, item.slug)
                        ? 'border border-border bg-background'
                        : 'border border-transparent'
                    "
                  >
                    <RouterLink
                      :to="{
                        name: 'AlgorithmView',
                        params: { category: item.category, slug: item.slug },
                      }"
                    >
                      <span
                        :class="
                          isActive(item.category, item.slug) ? 'text-primary' : 'text-inherit'
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
