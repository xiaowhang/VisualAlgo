import { defineStore } from 'pinia';
import { ref } from 'vue';

const graphNodeIds = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
const SORTING_MIN_SIZE = 3;
const SORTING_MAX_SIZE = 50;

function createRandomSortingData(size: number) {
  return Array.from({ length: Math.max(3, size) }, () => Math.floor(Math.random() * 90) + 10);
}

export const useAlgorithmInputsStore = defineStore('algorithm-inputs', () => {
  const sortingInput = ref<number[]>([38, 12, 54, 29, 7, 61, 43, 18]);
  const graphStartNode = ref<(typeof graphNodeIds)[number]>('A');
  const dataVersion = ref(0);

  function randomizeAlgorithmInput() {
    sortingInput.value = createRandomSortingData(sortingInput.value.length || 8);
    graphStartNode.value = graphNodeIds[Math.floor(Math.random() * graphNodeIds.length)];
    dataVersion.value += 1;
  }

  function applyCustomSortingInput(rawText: string) {
    const parts = rawText
      .split(',')
      .map(part => part.trim())
      .filter(Boolean);

    if (parts.length < SORTING_MIN_SIZE || parts.length > SORTING_MAX_SIZE) {
      return {
        ok: false,
        message: `请输入 ${SORTING_MIN_SIZE}-${SORTING_MAX_SIZE} 个整数。`,
      } as const;
    }

    const numbers = parts.map(value => Number(value));

    if (numbers.some(value => !Number.isInteger(value) || Number.isNaN(value))) {
      return {
        ok: false,
        message: '仅支持逗号分隔的整数。',
      } as const;
    }

    sortingInput.value = numbers;
    dataVersion.value += 1;

    return {
      ok: true,
      message: `已应用 ${numbers.length} 个元素。`,
    } as const;
  }

  return {
    sortingInput,
    graphStartNode,
    dataVersion,
    randomizeAlgorithmInput,
    applyCustomSortingInput,
  };
});
