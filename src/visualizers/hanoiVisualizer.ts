import * as d3 from 'd3';
import type { HanoiStep } from '@/types/algorithm';
import { VISUALIZATION_COLOR_TOKENS } from './colorSemantics';
import { resolveCssColorToken } from './resolveCssColorToken';

interface RenderHanoiContext {
  svgElement: SVGSVGElement;
  step: HanoiStep;
  transform?: string;
}

const WIDTH = 760;
const HEIGHT = 400;
const BASE_Y = 340;
const PEG_TOP_Y = 80;
const PEG_POSITIONS = [190, 380, 570];
const DISK_HEIGHT = 22;
const DISK_MIN_WIDTH = 32;
const DISK_MAX_WIDTH = 140;
const DISK_RADIUS = 5;

export function renderHanoi(context: RenderHanoiContext) {
  const { svgElement, step, transform } = context;

  const svg = d3.select(svgElement);
  svg.attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`).attr('class', 'h-full w-full');

  svg.selectAll('g.hanoi-root').remove();
  const root = svg.append('g').attr('class', 'hanoi-root');

  if (transform) {
    root.attr('transform', transform);
  }

  const maxDisk = Math.max(1, ...step.pegs.flatMap(p => p.disks));
  const colors = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'];
  const idleColor = resolveCssColorToken(svgElement, VISUALIZATION_COLOR_TOKENS.idle);
  const compareColor = resolveCssColorToken(svgElement, VISUALIZATION_COLOR_TOKENS.compare);

  function diskColor(diskSize: number): string {
    const token = colors[(diskSize - 1) % colors.length]!;
    return resolveCssColorToken(svgElement, `var(${token})`);
  }

  const diskWidth = d3
    .scaleLinear<number>()
    .domain([1, maxDisk])
    .range([DISK_MIN_WIDTH, DISK_MAX_WIDTH]);

  // Base platform
  root
    .append('rect')
    .attr('x', 40)
    .attr('y', BASE_Y)
    .attr('width', WIDTH - 80)
    .attr('height', 8)
    .attr('rx', 4)
    .attr('fill', idleColor);

  // Pegs and labels
  for (const peg of step.pegs) {
    const cx = PEG_POSITIONS[step.pegs.indexOf(peg)]!;

    root
      .append('line')
      .attr('x1', cx)
      .attr('y1', PEG_TOP_Y)
      .attr('x2', cx)
      .attr('y2', BASE_Y)
      .attr('stroke', idleColor)
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round');

    root.append('circle').attr('cx', cx).attr('cy', PEG_TOP_Y).attr('r', 6).attr('fill', idleColor);

    root
      .append('text')
      .attr('x', cx)
      .attr('y', BASE_Y + 28)
      .attr('text-anchor', 'middle')
      .attr('fill', VISUALIZATION_COLOR_TOKENS.text)
      .attr('font-size', 14)
      .attr('font-weight', '600')
      .text(peg.id);
  }

  // Disks
  for (const peg of step.pegs) {
    const pegX = PEG_POSITIONS[step.pegs.indexOf(peg)]!;

    for (let i = 0; i < peg.disks.length; i++) {
      const diskSize = peg.disks[i]!;
      const w = diskWidth(diskSize);
      const x = pegX - w / 2;
      const y = BASE_Y - (i + 1) * DISK_HEIGHT;

      const isMoved =
        step.move !== null &&
        step.move.disk === diskSize &&
        (step.move.to === peg.id || step.move.from === peg.id);

      root
        .append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', w)
        .attr('height', DISK_HEIGHT - 2)
        .attr('rx', DISK_RADIUS)
        .attr('ry', DISK_RADIUS)
        .attr('fill', isMoved ? compareColor : diskColor(diskSize))
        .attr('stroke', isMoved ? compareColor : 'none')
        .attr('stroke-width', isMoved ? 2 : 0);

      if (w > 36) {
        root
          .append('text')
          .attr('x', pegX)
          .attr('y', y + DISK_HEIGHT / 2 + 1)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('fill', VISUALIZATION_COLOR_TOKENS.text)
          .attr('font-size', 10)
          .attr('font-weight', '500')
          .attr('pointer-events', 'none')
          .style('user-select', 'none')
          .text(diskSize);
      }
    }
  }
}
