export { algorithmRegistry } from '@/algorithms/registry/algorithmRegistry';
export { algorithmMenuByCategory } from '@/algorithms/registry/algorithmMenu';
export { findAlgorithm } from '@/algorithms/registry/findAlgorithm';
export {
  COMPARE_DEFAULT_GROUP,
  getCompareOptionsByGroup,
  isComparisonGroup,
  normalizeComparePair,
  resolveAlgorithmBySlug,
  // 向后兼容
  getCompareOptionsByCategory,
  isAlgorithmCategory,
} from '@/algorithms/registry/compare';
