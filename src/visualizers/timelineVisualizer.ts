import * as d3 from 'd3';
import type { TimelineInterval, TimelineStep } from '@/types/algorithm';
import { resolveCssColorToken } from '@/visualizers/resolveCssColorToken';
import {
  resolveTimelineIntervalColor,
  VISUALIZATION_COLOR_TOKENS,
} from '@/visualizers/colorSemantics';

const MARGIN = { top: 30, right: 40, bottom: 40, left: 60 };
const ROW_HEIGHT = 36;
const ROW_GAP = 6;
const TICK_COUNT = 10;

export function getTimelineBounds(step: TimelineStep): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  const maxEnd = Math.max(...step.intervals.map(i => i.end), 10);
  const totalHeight = step.intervals.length * (ROW_HEIGHT + ROW_GAP) + MARGIN.top + MARGIN.bottom;

  return {
    minX: 0,
    maxX: MARGIN.left + maxEnd * 40 + MARGIN.right,
    minY: 0,
    maxY: totalHeight,
  };
}

export function renderTimeline(context: {
  svgElement: SVGSVGElement;
  step: TimelineStep;
  transform: string;
}): void {
  const { svgElement, step, transform } = context;
  const svg = d3.select(svgElement);

  svg.selectAll('g.timeline-root').remove();

  const maxEnd = Math.max(...step.intervals.map(i => i.end), 10);
  const chartWidth = maxEnd * 40;
  const chartHeight = step.intervals.length * (ROW_HEIGHT + ROW_GAP);

  const rootGroup = svg.append('g').attr('class', 'timeline-root');
  rootGroup.attr('transform', transform);

  const borderColor = resolveCssColorToken(svgElement, 'var(--border)');
  const textColor = resolveCssColorToken(svgElement, 'var(--foreground)');
  const mutedColor = resolveCssColorToken(svgElement, 'var(--muted-foreground)');

  // X scale
  const xScale = d3.scaleLinear().domain([0, maxEnd]).range([0, chartWidth]);

  // Draw time axis
  const axisGroup = rootGroup
    .append('g')
    .attr('class', 'timeline-axis')
    .attr('transform', `translate(${MARGIN.left},${MARGIN.top + chartHeight + 10})`);

  const ticks = xScale.ticks(TICK_COUNT);
  axisGroup
    .selectAll('line.tick')
    .data(ticks)
    .join('line')
    .attr('class', 'tick')
    .attr('x1', d => xScale(d))
    .attr('x2', d => xScale(d))
    .attr('y1', 0)
    .attr('y2', 8)
    .attr('stroke', borderColor)
    .attr('stroke-width', 1);

  axisGroup
    .selectAll('text.tick-label')
    .data(ticks)
    .join('text')
    .attr('class', 'tick-label')
    .attr('x', d => xScale(d))
    .attr('y', 22)
    .attr('text-anchor', 'middle')
    .attr('fill', mutedColor)
    .attr('font-size', 11)
    .text(d => d);

  // Axis line
  axisGroup
    .append('line')
    .attr('x1', 0)
    .attr('x2', chartWidth)
    .attr('y1', 0)
    .attr('y2', 0)
    .attr('stroke', borderColor)
    .attr('stroke-width', 1);

  // Draw intervals
  const intervalGroup = rootGroup.append('g').attr('class', 'timeline-intervals');

  const intervalSelection = intervalGroup
    .selectAll('g.timeline-row')
    .data(step.intervals, (d: unknown) => (d as TimelineInterval).id)
    .join('g')
    .attr('class', 'timeline-row')
    .attr(
      'transform',
      (_, i) => `translate(${MARGIN.left},${MARGIN.top + i * (ROW_HEIGHT + ROW_GAP)})`
    );

  // Row labels
  intervalSelection
    .append('text')
    .attr('x', -8)
    .attr('y', ROW_HEIGHT / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .attr('fill', textColor)
    .attr('font-size', 12)
    .attr('font-weight', 600)
    .text(d => d.label);

  // Interval bars
  intervalSelection
    .append('rect')
    .attr('x', d => xScale(d.start))
    .attr('y', 2)
    .attr('width', d => Math.max(xScale(d.end) - xScale(d.start), 4))
    .attr('height', ROW_HEIGHT - 4)
    .attr('rx', 4)
    .attr('fill', d => resolveCssColorToken(svgElement, resolveTimelineIntervalColor(step, d.id)))
    .attr('stroke', d => {
      if (d.id === step.currentInterval) {
        return resolveCssColorToken(svgElement, VISUALIZATION_COLOR_TOKENS.text);
      }
      return resolveCssColorToken(svgElement, 'var(--border)');
    })
    .attr('stroke-width', d => (d.id === step.currentInterval ? 2 : 1));

  // Interval time labels inside bars
  intervalSelection
    .append('text')
    .attr('x', d => (xScale(d.start) + xScale(d.end)) / 2)
    .attr('y', ROW_HEIGHT / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .attr('fill', resolveCssColorToken(svgElement, 'var(--foreground)'))
    .attr('font-size', 10)
    .attr('font-weight', 500)
    .text(d => `${d.start}-${d.end}`);

  // Draw selection indicator line for lastSelected
  if (step.lastSelected) {
    const selectedInterval = step.intervals.find(i => i.id === step.lastSelected);
    if (selectedInterval) {
      const endX = xScale(selectedInterval.end);

      rootGroup
        .append('line')
        .attr('x1', MARGIN.left + endX)
        .attr('x2', MARGIN.left + endX)
        .attr('y1', MARGIN.top)
        .attr('y2', MARGIN.top + chartHeight)
        .attr('stroke', resolveCssColorToken(svgElement, VISUALIZATION_COLOR_TOKENS.done))
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,3')
        .attr('opacity', 0.6);
    }
  }
}
