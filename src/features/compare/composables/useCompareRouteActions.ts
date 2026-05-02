import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { isComparisonGroup } from '@/algorithms/registry';
import type { CompareRouteQueryValue } from '@/features/compare/types';
import { useAlgorithmComparisonStore } from '@/stores/algorithmComparison';
import type { ComparisonGroup } from '@/types/algorithm';

export function useCompareRouteActions() {
  const route = useRoute();
  const router = useRouter();
  const comparisonStore = useAlgorithmComparisonStore();
  const comparisonRefs = storeToRefs(comparisonStore);

  const comparison = {
    ...comparisonRefs,
    applyRouteQuery: comparisonStore.applyRouteQuery,
    applySelectionChange: comparisonStore.applySelectionChange,
    setPreferredGroup: comparisonStore.setPreferredGroup,
  };

  function replaceCompareQuery(left: string, right: string) {
    void router.replace({
      name: 'CompareView',
      query: {
        left,
        right,
      },
    });
  }

  function syncRouteQuery(queryLeft: CompareRouteQueryValue, queryRight: CompareRouteQueryValue) {
    const result = comparison.applyRouteQuery(queryLeft, queryRight);

    if (!result.needsRouteFix) {
      return;
    }

    replaceCompareQuery(result.left, result.right);
  }

  function handleCompareGroupSwitch(nextGroup: ComparisonGroup) {
    if (!isComparisonGroup(nextGroup) || nextGroup === comparison.compareGroup.value) {
      return;
    }

    comparison.setPreferredGroup(nextGroup);
    replaceCompareQuery('', '');
  }

  function syncCompareSelection(nextLeft: string, nextRight: string) {
    const result = comparison.applySelectionChange({
      nextLeft,
      nextRight,
      prevLeft: comparison.leftSlug.value,
      prevRight: comparison.rightSlug.value,
      queryLeft: route.query.left,
      queryRight: route.query.right,
    });

    if (!result.needsRouteFix) {
      return;
    }

    replaceCompareQuery(result.left, result.right);
  }

  function handleCompareLeftChange(nextSlug: string) {
    if (!nextSlug) {
      return;
    }

    syncCompareSelection(nextSlug, comparison.rightSlug.value);
  }

  function handleCompareRightChange(nextSlug: string) {
    if (!nextSlug) {
      return;
    }

    syncCompareSelection(comparison.leftSlug.value, nextSlug);
  }

  function handleCompareSwap() {
    syncCompareSelection(comparison.rightSlug.value, comparison.leftSlug.value);
  }

  return {
    compareGroup: comparison.compareGroup,
    compareLeftSlug: comparison.leftSlug,
    compareRightSlug: comparison.rightSlug,
    syncRouteQuery,
    handleCompareGroupSwitch,
    handleCompareLeftChange,
    handleCompareRightChange,
    handleCompareSwap,
  };
}
