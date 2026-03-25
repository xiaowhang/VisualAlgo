import * as d3 from 'd3';
import type { SortingStep } from '@/types/algorithm';
import { resolveSortingBarColor, VISUALIZATION_COLOR_TOKENS } from './colorSemantics';

interface RenderSortingBarsContext {
  svgElement: SVGSVGElement;
  step: SortingStep;
  transform?: string;
}

interface SortingBarDatum {
  index: number;
  value: number;
  fill: string;
}

function resolveCssColorToken(svgElement: SVGSVGElement, colorToken: string) {
  const token = colorToken.trim();

  if (!token.startsWith('var(')) {
    return token;
  }

  const variableName = token.slice(4, -1).trim();
  if (!variableName) {
    return token;
  }

  const computedColor = getComputedStyle(svgElement).getPropertyValue(variableName).trim();
  if (computedColor) {
    return computedColor;
  }

  const rootColor = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
  return rootColor || token;
}

export function renderSortingBars(context: RenderSortingBarsContext) {
  const { svgElement, step, transform } = context;

  const width = 760;
  const height = 300;
  const margin = { top: 16, right: 80, bottom: 16, left: 80 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const svg = d3.select(svgElement);
  svg.attr('viewBox', `0 0 ${width} ${height}`).attr('class', 'h-full w-full');

  const group = svg
    .selectAll<SVGGElement, null>('g.sorting-root')
    .data([null])
    .join('g')
    .attr('class', 'sorting-root')
    .attr('transform', `translate(${margin.left},${margin.top}) ${transform ?? ''}`.trim());

  const xScale = d3
    .scaleBand<number>()
    .domain(d3.range(step.values.length))
    .range([0, chartWidth])
    .padding(0.16);

  const barBandwidth = xScale.bandwidth();
  const labelFontSize = Math.max(8, Math.min(12, Math.round(barBandwidth * 0.6)));

  const maxValue = d3.max(step.values) ?? 1;
  const yScale = d3.scaleLinear().domain([0, maxValue]).range([chartHeight, 0]).nice();

  const transition = d3.transition().duration(260).ease(d3.easeCubicOut);

  const barsData: SortingBarDatum[] = step.values.map((value, index) => ({
    index,
    value,
    fill: resolveCssColorToken(svgElement, resolveSortingBarColor(step, index)),
  }));

  const bars = group
    .selectAll<SVGRectElement, SortingBarDatum>('rect')
    .data(barsData, item => item.index)
    .join(
      enter =>
        enter
          .append('rect')
          .attr('x', item => xScale(item.index) ?? 0)
          .attr('y', chartHeight)
          .attr('width', xScale.bandwidth())
          .attr('height', 0)
          .attr('rx', 4)
          .attr('fill', item => item.fill),
      update => update,
      exit =>
        exit.interrupt().transition(transition).attr('y', chartHeight).attr('height', 0).remove()
    )
    .attr('x', item => xScale(item.index) ?? 0)
    .attr('width', xScale.bandwidth())
    .attr('rx', 4);

  bars
    .interrupt()
    .transition(transition)
    .attr('y', item => yScale(item.value))
    .attr('width', xScale.bandwidth())
    .attr('height', item => chartHeight - yScale(item.value))
    .attr('fill', item => item.fill);

  const labels = group
    .selectAll<SVGTextElement, SortingBarDatum>('text.value')
    .data(barsData, item => item.index)
    .join(
      enter =>
        enter
          .append('text')
          .attr('class', 'value')
          .attr('x', item => (xScale(item.index) ?? 0) + xScale.bandwidth() / 2)
          .attr('y', chartHeight - 4)
          .attr('text-anchor', 'middle')
          .attr('fill', VISUALIZATION_COLOR_TOKENS.text)
          .attr('font-size', labelFontSize)
          .attr('pointer-events', 'none')
          .style('user-select', 'none')
          .style('-webkit-user-select', 'none')
          .text(item => item.value),
      update => update,
      exit =>
        exit
          .interrupt()
          .transition(transition)
          .attr('y', chartHeight - 4)
          .remove()
    )
    .attr('class', 'value')
    .attr('x', item => (xScale(item.index) ?? 0) + xScale.bandwidth() / 2)
    .attr('text-anchor', 'middle')
    .attr('fill', VISUALIZATION_COLOR_TOKENS.text)
    .attr('font-size', labelFontSize)
    .attr('pointer-events', 'none')
    .style('user-select', 'none')
    .style('-webkit-user-select', 'none')
    .text(item => item.value);

  labels
    .interrupt()
    .transition(transition)
    .attr('y', item => yScale(item.value) - Math.max(6, labelFontSize * 0.7));
}
