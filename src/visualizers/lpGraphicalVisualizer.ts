import * as d3 from 'd3';
import type { LpGraphicalStep } from '@/types/algorithm';
import { resolveCssColorToken } from './resolveCssColorToken';
import { VISUALIZATION_COLOR_TOKENS } from './colorSemantics';

interface LpGraphicalRenderContext {
  svgElement: SVGSVGElement;
  step: LpGraphicalStep;
  transform: string;
}

const MARGIN = { top: 40, right: 40, bottom: 50, left: 60 };
const VIEWBOX_WIDTH = 760;
const VIEWBOX_HEIGHT = 500;

export function getLpGraphicalBounds(_step: LpGraphicalStep) {
  return {
    minX: 0,
    maxX: VIEWBOX_WIDTH,
    minY: 0,
    maxY: VIEWBOX_HEIGHT,
  };
}

export function renderLpGraphical(context: LpGraphicalRenderContext): void {
  const { svgElement, step, transform } = context;
  const svg = d3.select(svgElement);

  svg.selectAll('g.lpg-root').remove();
  const root = svg.append('g').attr('class', 'lpg-root');
  root.attr('transform', transform);

  const plotWidth = VIEWBOX_WIDTH - MARGIN.left - MARGIN.right;
  const plotHeight = VIEWBOX_HEIGHT - MARGIN.top - MARGIN.bottom;

  const xMin = step.xRange[0];
  const xMax = step.xRange[1];
  const yMin = step.yRange[0];
  const yMax = step.yRange[1];

  const xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([MARGIN.left, MARGIN.left + plotWidth]);
  const yScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    .range([MARGIN.top + plotHeight, MARGIN.top]);

  const textColor = resolveCssColorToken(svgElement, VISUALIZATION_COLOR_TOKENS.text);
  const borderColor = resolveCssColorToken(svgElement, VISUALIZATION_COLOR_TOKENS.border);

  // Grid
  const xTicks = xScale.ticks(10);
  const yTicks = yScale.ticks(10);

  root
    .selectAll('line.grid-x')
    .data(xTicks)
    .join('line')
    .attr('class', 'grid-x')
    .attr('x1', d => xScale(d))
    .attr('x2', d => xScale(d))
    .attr('y1', MARGIN.top)
    .attr('y2', MARGIN.top + plotHeight)
    .attr('stroke', borderColor)
    .attr('stroke-width', 0.3)
    .attr('stroke-dasharray', '3,3');

  root
    .selectAll('line.grid-y')
    .data(yTicks)
    .join('line')
    .attr('class', 'grid-y')
    .attr('x1', MARGIN.left)
    .attr('x2', MARGIN.left + plotWidth)
    .attr('y1', d => yScale(d))
    .attr('y2', d => yScale(d))
    .attr('stroke', borderColor)
    .attr('stroke-width', 0.3)
    .attr('stroke-dasharray', '3,3');

  // Axes
  root
    .append('line')
    .attr('x1', MARGIN.left)
    .attr('y1', MARGIN.top + plotHeight)
    .attr('x2', MARGIN.left + plotWidth)
    .attr('y2', MARGIN.top + plotHeight)
    .attr('stroke', textColor)
    .attr('stroke-width', 1.5);

  root
    .append('line')
    .attr('x1', MARGIN.left)
    .attr('y1', MARGIN.top)
    .attr('x2', MARGIN.left)
    .attr('y2', MARGIN.top + plotHeight)
    .attr('stroke', textColor)
    .attr('stroke-width', 1.5);

  // Axis labels
  root
    .append('text')
    .attr('x', MARGIN.left + plotWidth / 2)
    .attr('y', MARGIN.top + plotHeight + 36)
    .attr('text-anchor', 'middle')
    .attr('font-size', 13)
    .attr('font-weight', 600)
    .attr('fill', textColor)
    .text('x₁');

  root
    .append('text')
    .attr('x', MARGIN.left - 36)
    .attr('y', MARGIN.top + plotHeight / 2)
    .attr('text-anchor', 'middle')
    .attr('transform', `rotate(-90, ${MARGIN.left - 36}, ${MARGIN.top + plotHeight / 2})`)
    .attr('font-size', 13)
    .attr('font-weight', 600)
    .attr('fill', textColor)
    .text('x₂');

  // Tick labels
  root
    .selectAll('text.tick-x')
    .data(xTicks.filter(t => t > 0))
    .join('text')
    .attr('class', 'tick-x')
    .attr('x', d => xScale(d))
    .attr('y', MARGIN.top + plotHeight + 16)
    .attr('text-anchor', 'middle')
    .attr('font-size', 10)
    .attr('fill', textColor)
    .text(d => d);

  root
    .selectAll('text.tick-y')
    .data(yTicks.filter(t => t > 0))
    .join('text')
    .attr('class', 'tick-y')
    .attr('x', MARGIN.left - 10)
    .attr('y', d => yScale(d))
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'central')
    .attr('font-size', 10)
    .attr('fill', textColor)
    .text(d => d);

  // Feasible region
  if (step.feasibleRegion.length >= 3) {
    const polygonPoints = step.feasibleRegion.map(v => `${xScale(v[0])},${yScale(v[1])}`).join(' ');

    root
      .append('polygon')
      .attr('points', polygonPoints)
      .attr('fill', resolveCssColorToken(svgElement, 'var(--chart-1)'))
      .attr('fill-opacity', 0.15)
      .attr('stroke', resolveCssColorToken(svgElement, 'var(--chart-1)'))
      .attr('stroke-width', 1.5);
  }

  // Constraint lines
  const constraintColors = ['var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

  for (let i = 0; i < step.constraints.length; i++) {
    const con = step.constraints[i]!;
    const color = resolveCssColorToken(svgElement, constraintColors[i % constraintColors.length]!);

    // ax + by = c → y = (c - ax) / b or x = (c - by) / a
    const points: [number, number][] = [];
    if (con.b !== 0) {
      // y = (c - a*x) / b
      const y1 = (con.c - con.a * xMin) / con.b;
      const y2 = (con.c - con.a * xMax) / con.b;
      points.push([xMin, y1], [xMax, y2]);
    } else if (con.a !== 0) {
      // x = c / a
      const xVal = con.c / con.a;
      points.push([xVal, yMin], [xVal, yMax]);
    }

    if (points.length === 2) {
      root
        .append('line')
        .attr('x1', xScale(points[0]![0]))
        .attr('y1', yScale(points[0]![1]))
        .attr('x2', xScale(points[1]![0]))
        .attr('y2', yScale(points[1]![1]))
        .attr('stroke', color)
        .attr('stroke-width', 1.5);

      // Label
      const labelX = xScale(Math.min(xMax, con.b !== 0 ? con.c / con.a || xMax * 0.8 : xMax * 0.8));
      const labelY =
        con.b !== 0 ? yScale((con.c - con.a * (xMax * 0.8)) / con.b) : yScale(yMax * 0.5);
      root
        .append('text')
        .attr('x', labelX)
        .attr('y', Math.max(MARGIN.top, Math.min(MARGIN.top + plotHeight, labelY)) - 6)
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('font-weight', 600)
        .attr('fill', color)
        .text(con.label);
    }
  }

  // Objective function contour line
  if (step.objectiveA !== 0 || step.objectiveB !== 0) {
    const c1 = step.objectiveA;
    const c2 = step.objectiveB;
    const val = step.objectiveValue;

    const contourPoints: [number, number][] = [];
    if (c2 !== 0) {
      contourPoints.push([xMin, (val - c1 * xMin) / c2], [xMax, (val - c1 * xMax) / c2]);
    } else if (c1 !== 0) {
      const xVal = val / c1;
      contourPoints.push([xVal, yMin], [xVal, yMax]);
    }

    if (contourPoints.length === 2) {
      root
        .append('line')
        .attr('x1', xScale(contourPoints[0]![0]))
        .attr('y1', yScale(contourPoints[0]![1]))
        .attr('x2', xScale(contourPoints[1]![0]))
        .attr('y2', yScale(contourPoints[1]![1]))
        .attr('stroke', resolveCssColorToken(svgElement, 'var(--chart-5)'))
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '8,4');

      // Z label
      root
        .append('text')
        .attr('x', xScale(xMax) - 4)
        .attr('y', yScale((val - c1 * xMax) / c2) - 8)
        .attr('text-anchor', 'end')
        .attr('font-size', 11)
        .attr('font-weight', 700)
        .attr('fill', resolveCssColorToken(svgElement, 'var(--chart-5)'))
        .text(`Z=${val.toFixed(1)}`);
    }
  }

  // Current vertex
  if (step.currentVertex) {
    const cx = xScale(step.currentVertex[0]);
    const cy = yScale(step.currentVertex[1]);

    root
      .append('circle')
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', 7)
      .attr('fill', resolveCssColorToken(svgElement, 'var(--chart-4)'))
      .attr('stroke', textColor)
      .attr('stroke-width', 1.5);
  }

  // Optimal point
  if (step.optimalPoint) {
    const ox = xScale(step.optimalPoint[0]);
    const oy = yScale(step.optimalPoint[1]);

    root
      .append('circle')
      .attr('cx', ox)
      .attr('cy', oy)
      .attr('r', 9)
      .attr('fill', resolveCssColorToken(svgElement, 'var(--chart-5)'))
      .attr('stroke', textColor)
      .attr('stroke-width', 2);

    root
      .append('text')
      .attr('x', ox + 14)
      .attr('y', oy - 10)
      .attr('font-size', 12)
      .attr('font-weight', 700)
      .attr('fill', resolveCssColorToken(svgElement, 'var(--chart-5)'))
      .text(`最优 (${step.optimalPoint[0].toFixed(1)}, ${step.optimalPoint[1].toFixed(1)})`);
  }
}
