<script setup lang="ts">
import {
  BarChart3,
  BarChart4,
  ChevronRight,
  Network,
  Route,
  Search,
  Shuffle,
} from 'lucide-vue-next';

const sections = [
  {
    label: 'Sorting',
    defaultOpen: true,
    items: [
      { title: 'Quick Sort', url: '#', icon: BarChart3, active: true },
      { title: 'Merge Sort', url: '#', icon: BarChart4 },
      { title: 'Bubble Sort', url: '#', icon: Shuffle },
      { title: 'Insertion Sort', url: '#', icon: BarChart3 },
    ],
  },
  {
    label: 'Pathfinding',
    defaultOpen: false,
    items: [
      { title: 'A* Search', url: '#', icon: Route },
      { title: 'Dijkstra', url: '#', icon: Route },
    ],
  },
  {
    label: 'Graphs',
    defaultOpen: false,
    items: [
      { title: 'BFS', url: '#', icon: Network },
      { title: 'DFS', url: '#', icon: Network },
    ],
  },
];
</script>

<template>
  <Sidebar>
    <SidebarHeader class="px-4 pt-4">
      <div class="relative">
        <Search
          class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input placeholder="Search algo..." class="pl-9" />
      </div>
    </SidebarHeader>
    <SidebarContent class="gap-0 px-2 pt-2 pb-6">
      <SidebarGroup v-for="section in sections" :key="section.label" as-child>
        <Collapsible :default-open="section.defaultOpen" class="group/collapsible">
          <SidebarGroupLabel as-child>
            <CollapsibleTrigger
              class="flex h-12 w-full items-center gap-2 rounded-md px-3 py-2 text-2xl font-semibold tracking-wide text-muted-foreground uppercase hover:bg-[#f1f5f9]"
            >
              <span>{{ section.label }}</span>
              <ChevronRight
                class="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90"
              />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem v-for="item in section.items" :key="item.title">
                  <SidebarMenuButton
                    as-child
                    :isActive="item.active"
                    class="h-10 gap-3 rounded-[6px] px-3.25 py-2.25 text-sm hover:bg-[#f1f5f9]"
                    :class="
                      item.active
                        ? 'border border-[#f1f5f9] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'
                        : 'border border-transparent'
                    "
                  >
                    <a :href="item.url">
                      <component
                        :is="item.icon"
                        :class="['h-4 w-4', item.active ? 'text-[#0066cc]' : 'text-inherit']"
                      />
                      <span :class="item.active ? 'text-[#0066cc]' : 'text-inherit'">
                        {{ item.title }}
                      </span>
                    </a>
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
