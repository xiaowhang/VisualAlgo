import { createTimelineStep } from '@/algorithms/shared/greedy/createTimelineStep';
import { getActivityInput } from '@/algorithms/shared/inputs';
import type {
  AlgorithmDefinition,
  AlgorithmStep,
  TimelineInterval,
  TimelineIntervalState,
} from '@/types/algorithm';

function buildActivitySelectionSteps(
  rawIntervals: { start: number; end: number; label: string }[]
): AlgorithmStep[] {
  // Sort by end time
  const sorted = [...rawIntervals]
    .map((interval, index) => ({ ...interval, id: `a${index}` }))
    .sort((a, b) => a.end - b.end || a.start - b.start);

  const intervals: TimelineInterval[] = sorted.map(({ id, start, end, label }) => ({
    id,
    start,
    end,
    label,
  }));

  const steps: AlgorithmStep[] = [];
  const selected: string[] = [];
  const rejected: string[] = [];

  function buildHighlights(): Partial<Record<string, TimelineIntervalState>> {
    const h: Partial<Record<string, TimelineIntervalState>> = {};
    for (const id of selected) h[id] = 'selected';
    for (const id of rejected) h[id] = 'rejected';
    return h;
  }

  // Init step
  steps.push(
    createTimelineStep({
      intervals,
      highlights: {},
      description: `共 ${intervals.length} 个活动，按结束时间排序。开始贪心选择。`,
    })
  );

  let lastEnd = -1;

  for (const interval of intervals) {
    // Show considering
    const consideringHighlights: Partial<Record<string, TimelineIntervalState>> = {
      ...buildHighlights(),
      [interval.id]: 'considering',
    };

    steps.push(
      createTimelineStep({
        intervals,
        highlights: consideringHighlights,
        currentInterval: interval.id,
        lastSelected: selected.length > 0 ? selected[selected.length - 1] : null,
        description: `考虑活动 ${interval.label}（${interval.start}-${interval.end}）`,
      })
    );

    if (interval.start >= lastEnd) {
      // Select
      selected.push(interval.id);
      lastEnd = interval.end;

      steps.push(
        createTimelineStep({
          intervals,
          highlights: buildHighlights(),
          currentInterval: interval.id,
          lastSelected: interval.id,
          description: `选择活动 ${interval.label}（${interval.start}-${interval.end}），与已选活动不冲突。`,
        })
      );
    } else {
      // Reject
      rejected.push(interval.id);

      steps.push(
        createTimelineStep({
          intervals,
          highlights: buildHighlights(),
          currentInterval: interval.id,
          lastSelected: selected.length > 0 ? selected[selected.length - 1] : null,
          description: `拒绝活动 ${interval.label}（${interval.start}-${interval.end}），与已选活动冲突。`,
        })
      );
    }
  }

  // Final step
  const selectedLabels = selected
    .map(id => intervals.find(i => i.id === id)?.label ?? id)
    .join('、');

  steps.push(
    createTimelineStep({
      intervals,
      highlights: buildHighlights(),
      description: `完成！共选择 ${selected.length} 个活动：${selectedLabels}`,
    })
  );

  return steps;
}

export const activitySelectionRegistry: AlgorithmDefinition = {
  id: 'activity-selection',
  slug: 'activity-selection',
  title: '活动选择问题',
  description: '贪心选择结束最早的兼容活动，求最大兼容子集。',
  categories: ['greedy'],
  visualization: 'timeline',
  createSteps: () => buildActivitySelectionSteps(getActivityInput().intervals),
};
