import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  SORTING_DEFAULT_SIZE,
  SORTING_MAX_SIZE,
  SORTING_MIN_SIZE,
  SORTING_SNAPSHOT_FORMAT_VERSION,
  parseCustomSortingInputText,
  parseSortingImportJson,
  validateSortingNumbers,
  type SortingInputResult,
} from '@/lib/validation/sortingInput';

const graphNodeIds = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
export { SORTING_MIN_SIZE, SORTING_MAX_SIZE };

function clampSortingSize(size: number) {
  return Math.min(SORTING_MAX_SIZE, Math.max(SORTING_MIN_SIZE, size));
}

function createRandomSortingData(size: number) {
  return Array.from({ length: clampSortingSize(size) }, () => Math.floor(Math.random() * 90) + 10);
}

export const useAlgorithmInputsStore = defineStore('algorithm-inputs', () => {
  const sortingInput = ref<number[]>(createRandomSortingData(SORTING_DEFAULT_SIZE));
  const graphStartNode = ref<(typeof graphNodeIds)[number]>('A');
  const dataVersion = ref(0);

  function applySortingInput(numbers: number[], successMessage: string): SortingInputResult {
    const validationResult = validateSortingNumbers(numbers);

    if (!validationResult.ok) {
      return validationResult;
    }

    sortingInput.value = numbers;
    dataVersion.value += 1;

    return {
      ok: true,
      message: successMessage,
    };
  }

  function randomizeAlgorithmInput(size?: number) {
    const baseSize = size ?? sortingInput.value.length;
    const targetSize = clampSortingSize(Math.trunc(baseSize > 0 ? baseSize : SORTING_DEFAULT_SIZE));
    sortingInput.value = createRandomSortingData(targetSize);
    graphStartNode.value = graphNodeIds[Math.floor(Math.random() * graphNodeIds.length)];
    dataVersion.value += 1;
  }

  function applyCustomSortingInput(rawText: string) {
    const parseResult = parseCustomSortingInputText(rawText);

    if (!parseResult.ok) {
      return {
        ok: false,
        message: parseResult.message,
      };
    }

    const numbers = parseResult.numbers;
    return applySortingInput(numbers, `已应用 ${numbers.length} 个元素。`);
  }

  function exportSortingAsJsonText() {
    return JSON.stringify(
      {
        formatVersion: SORTING_SNAPSHOT_FORMAT_VERSION,
        sortingInput: sortingInput.value,
      },
      null,
      2
    );
  }

  function importSortingFromJsonText(rawText: string) {
    const importResult = parseSortingImportJson(rawText);

    if (!importResult.ok) {
      return {
        ok: false,
        message: importResult.message,
      } as const;
    }

    const numbers = importResult.numbers;

    return applySortingInput(numbers, `已导入 ${numbers.length} 个元素。`);
  }

  return {
    sortingInput,
    graphStartNode,
    dataVersion,
    randomizeAlgorithmInput,
    applyCustomSortingInput,
    exportSortingAsJsonText,
    importSortingFromJsonText,
  };
});
