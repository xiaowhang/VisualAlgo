<script setup lang="ts">
import { COMPARE_DEFAULT_CATEGORY } from '@/algorithms/registry';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SettingsOverviewTab from '@/components/settings-panel/SettingsOverviewTab.vue';
import SettingsPanelCompareTab from '@/components/settings-panel/SettingsPanelCompareTab.vue';
import SettingsPanelDataTab from '@/components/settings-panel/SettingsPanelDataTab.vue';
import SettingsPanelFileTab from '@/components/settings-panel/SettingsPanelFileTab.vue';
import SettingsPanelHeaderBar from '@/components/settings-panel/SettingsPanelHeaderBar.vue';
import { useSettingsPanelViewModel } from '@/features/settings/composables/useSettingsPanelViewModel';
import {
  GRAPH_MAX_NODES,
  GRAPH_MIN_NODES,
  SORTING_MAX_SIZE,
  SORTING_MIN_SIZE,
} from '@/stores/algorithmInputs';

const {
  compareLeftSlug,
  compareRightSlug,
  handleCompareCategorySwitch,
  handleCompareLeftChange,
  handleCompareRightChange,
  handleCompareSwap,
  playback,
  isCompareView,
  visibleCompareCategory,
  compareOptions,
  compareLeftCurrentStep,
  compareRightCurrentStep,
  compareLeftStepsCount,
  compareRightStepsCount,
  compareLeftStatusText,
  compareRightStatusText,
  isSortingAlgorithm,
  isGraphAlgorithm,
  panelTitle,
  panelDescription,
  stepDescription,
  activeTab,
  panelScrollRef,
  modeLabel,
  sizeInput,
  sizeMessage,
  sizeError,
  graphNodeCountInput,
  graphSizeMessage,
  graphSizeError,
  graphStartNodeInput,
  graphMessage,
  graphMessageError,
  graphNodeOptions,
  customData,
  customDataMessage,
  customDataError,
  applySizeFromInput,
  applyGraphNodeCountFromInput,
  applyGraphStartNode,
  applyCustomData,
  randomizeData,
  exportJsonFile,
  handleImportFile,
} = useSettingsPanelViewModel();

void panelScrollRef;
</script>

<template>
  <div
    ref="panelScrollRef"
    class="hidden h-full w-72 flex-col gap-4 overflow-y-auto border-l border-sidebar-border/80 bg-sidebar px-4 py-6 lg:flex xl:w-80 xl:px-5"
  >
    <SettingsPanelHeaderBar :title="panelTitle" :mode-label="modeLabel" />

    <Tabs v-model="activeTab" class="gap-3">
      <TabsList class="grid h-9 w-full grid-cols-3">
        <TabsTrigger v-if="!isCompareView" value="overview">概览</TabsTrigger>
        <TabsTrigger v-if="isCompareView" value="compare">对比配置</TabsTrigger>
        <TabsTrigger value="data">数据设置</TabsTrigger>
        <TabsTrigger value="files">文件操作</TabsTrigger>
      </TabsList>

      <TabsContent v-if="!isCompareView" value="overview" class="pt-1">
        <SettingsOverviewTab
          :panel-description="panelDescription"
          :step-description="stepDescription"
          :is-compare-view="isCompareView"
        />
      </TabsContent>

      <TabsContent v-if="isCompareView" value="compare" class="pt-1">
        <SettingsPanelCompareTab
          :compare-category="visibleCompareCategory"
          :compare-default-category="COMPARE_DEFAULT_CATEGORY"
          :compare-options="compareOptions"
          :compare-left-slug="compareLeftSlug"
          :compare-right-slug="compareRightSlug"
          :compare-continue-longer="playback.compareContinueLonger.value"
          :total-steps="playback.totalSteps.value"
          :compare-left-current-step="compareLeftCurrentStep"
          :compare-right-current-step="compareRightCurrentStep"
          :compare-left-steps-count="compareLeftStepsCount"
          :compare-right-steps-count="compareRightStepsCount"
          :compare-left-status-text="compareLeftStatusText"
          :compare-right-status-text="compareRightStatusText"
          @update-category="handleCompareCategorySwitch"
          @update-left="handleCompareLeftChange"
          @update-right="handleCompareRightChange"
          @swap="handleCompareSwap"
          @update-continue-longer="playback.setCompareContinueLonger"
        />
      </TabsContent>

      <TabsContent value="data" class="pt-1">
        <SettingsPanelDataTab
          v-model:size-input="sizeInput"
          v-model:graph-node-count-input="graphNodeCountInput"
          v-model:graph-start-node-input="graphStartNodeInput"
          v-model:custom-data="customData"
          :is-sorting-algorithm="isSortingAlgorithm"
          :is-graph-algorithm="isGraphAlgorithm"
          :sorting-min-size="SORTING_MIN_SIZE"
          :sorting-max-size="SORTING_MAX_SIZE"
          :size-message="sizeMessage"
          :size-error="sizeError"
          :graph-min-nodes="GRAPH_MIN_NODES"
          :graph-max-nodes="GRAPH_MAX_NODES"
          :graph-size-message="graphSizeMessage"
          :graph-size-error="graphSizeError"
          :graph-node-options="graphNodeOptions"
          :graph-message="graphMessage"
          :graph-message-error="graphMessageError"
          :custom-data-message="customDataMessage"
          :custom-data-error="customDataError"
          @randomize-data="randomizeData"
          @apply-size="applySizeFromInput"
          @apply-graph-node-count="applyGraphNodeCountFromInput"
          @apply-graph-start-node="applyGraphStartNode"
          @apply-custom-data="applyCustomData"
        />
      </TabsContent>

      <TabsContent value="files" class="pt-1">
        <SettingsPanelFileTab
          :is-sorting-algorithm="isSortingAlgorithm"
          :custom-data-message="customDataMessage"
          :custom-data-error="customDataError"
          @export-json="exportJsonFile"
          @import-file="handleImportFile"
        />
      </TabsContent>
    </Tabs>
  </div>
</template>
