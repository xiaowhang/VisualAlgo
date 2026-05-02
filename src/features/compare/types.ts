import type { ComparisonGroup } from '@/types/algorithm';
import type { LocationQueryValue } from 'vue-router';

export type CompareRouteQueryValue = LocationQueryValue | LocationQueryValue[] | undefined;

export interface CompareRouteQuery {
  left: string;
  right: string;
}

export interface CompareSelectionChangeInput {
  nextLeft: string;
  nextRight: string;
  prevLeft: string;
  prevRight: string;
  queryLeft: CompareRouteQueryValue;
  queryRight: CompareRouteQueryValue;
}

export interface CompareSyncResult extends CompareRouteQuery {
  category: ComparisonGroup;
  needsRouteFix: boolean;
}

export function resolveCompareQuerySlug(queryValue: CompareRouteQueryValue): string {
  if (typeof queryValue === 'string') {
    return queryValue;
  }

  if (Array.isArray(queryValue)) {
    const firstString = queryValue.find(value => typeof value === 'string');
    return firstString ?? '';
  }

  return '';
}
